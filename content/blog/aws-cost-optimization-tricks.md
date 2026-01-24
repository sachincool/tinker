---
title: "AWS Cost Optimization: How We Cut Our Bill by 60%"
date: "2024-12-05"
tags: ["aws", "cloud", "cost-optimization", "finops", "infrastructure"]
excerpt: "Our AWS bill hit $50k/month. Here's exactly how we reduced it to $20k without sacrificing performance or reliability."
featured: false
---

# AWS Cost Optimization: How We Cut Our Bill by 60%

When our CFO saw the AWS bill hit $50,000/month, I got a meeting invitation titled "We need to talk about AWS." Not fun.

Three months later, we're at $20,000/month with better performance. Here's how.

## The Starting Point

Our monthly AWS bill:

- **EC2**: $28,000
- **RDS**: $12,000
- **Data Transfer**: $6,000
- **CloudWatch**: $2,000
- **Other**: $2,000

**Total**: $50,000/month

Most of it was waste.

## Quick Win #1: Rightsize EC2 Instances

### The Problem

We were running everything on `m5.2xlarge` instances because... that's what the previous engineer used.

### The Analysis

```bash
# Check actual CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-31T23:59:59Z \
  --period 3600 \
  --statistics Average
```

Average CPU usage: **12%**. Memory: **30%**.

### The Fix

Downsized to `m5.large` (1/4 the cost):

```hcl
# Before
resource "aws_instance" "app" {
  instance_type = "m5.2xlarge"  # $0.384/hour
  # ...
}

# After
resource "aws_instance" "app" {
  instance_type = "m5.large"     # $0.096/hour
  # ...
}
```

**Savings**: $18,000/month

## Quick Win #2: Reserved Instances

### The Problem

We were paying On-Demand rates for instances that run 24/7.

### The Fix

Bought 1-year Reserved Instances for predictable workloads:

```bash
# Analyze usage patterns
aws ce get-reservation-purchase-recommendation \
  --service "Amazon Elastic Compute Cloud - Compute" \
  --lookback-period-in-days SIXTY_DAYS \
  --term-in-years ONE \
  --payment-option ALL_UPFRONT
```

Bought RIs for:

- 10 x `m5.large` (app servers)
- 5 x `c5.xlarge` (API servers)

**Discount**: 40% compared to On-Demand

**Savings**: $4,000/month

## Quick Win #3: Spot Instances for Non-Critical

### The Problem

Our CI/CD runners were On-Demand.

### The Fix

Switched to Spot Instances with fallback:

```hcl
resource "aws_launch_template" "ci_runner" {
  name_prefix   = "ci-runner-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "c5.xlarge"
  
  # Request Spot
  instance_market_options {
    market_type = "spot"
    spot_options {
      max_price                      = "0.10"  # ~70% discount
      spot_instance_type             = "one-time"
      instance_interruption_behavior = "terminate"
    }
  }
}

resource "aws_autoscaling_group" "ci_runners" {
  name = "ci-runners"
  
  mixed_instances_policy {
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.ci_runner.id
      }
    }
    
    instances_distribution {
      on_demand_base_capacity                  = 1  # Always have 1 on-demand
      on_demand_percentage_above_base_capacity = 0  # Rest are Spot
      spot_allocation_strategy                 = "capacity-optimized"
    }
  }
  
  min_size = 2
  max_size = 10
}
```

**Savings**: $2,500/month

## Quick Win #4: S3 Lifecycle Policies

### The Problem

We had 50TB of S3 data. All in Standard storage.

### The Analysis

```bash
# Check access patterns
aws s3api list-objects-v2 \
  --bucket my-bucket \
  --query "Contents[?LastModified<'2023-01-01'].[Key,Size]" \
  --output table
```

Most files hadn't been accessed in months.

### The Fix

Implemented lifecycle policies:

```json
{
  "Rules": [
    {
      "Id": "Archive old logs",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "logs/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER_IR"
        },
        {
          "Days": 180,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    },
    {
      "Id": "Delete old temp files",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "temp/"
      },
      "Expiration": {
        "Days": 7
      }
    },
    {
      "Id": "Intelligent tiering for backups",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "backups/"
      },
      "Transitions": [
        {
          "Days": 0,
          "StorageClass": "INTELLIGENT_TIERING"
        }
      ]
    }
  ]
}
```

Apply it:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket my-bucket \
  --lifecycle-configuration file://lifecycle.json
```

**Savings**: $3,000/month

## Quick Win #5: RDS Optimization

### The Problem

We had a `db.r5.4xlarge` RDS instance running 24/7 for development.

### The Fix

1. **Downsize dev database**: `db.r5.4xlarge` → `db.t3.large`
2. **Enable auto-stop for dev**: Stops at night, weekends
3. **Use Aurora Serverless v2 for staging**

```hcl
resource "aws_db_instance" "dev" {
  identifier     = "dev-database"
  instance_class = "db.t3.large"  # Was db.r5.4xlarge
  
  # Enable IAM authentication (no need for password rotation)
  iam_database_authentication_enabled = true
  
  # Enable auto minor version upgrades
  auto_minor_version_upgrade = true
  
  # Backup settings
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
}

resource "aws_rds_cluster" "staging" {
  cluster_identifier = "staging-aurora"
  engine            = "aurora-postgresql"
  engine_mode       = "provisioned"
  
  serverlessv2_scaling_configuration {
    max_capacity = 2.0   # Scale up when needed
    min_capacity = 0.5   # Scale down when idle
  }
}
```

**Savings**: $5,000/month

## Quick Win #6: CloudWatch Logs Retention

### The Problem

We were keeping all logs forever.

### The Fix

Set retention policies:

```python
import boto3

client = boto3.client('logs')

# Set retention for all log groups
log_groups = client.describe_log_groups()

for log_group in log_groups['logGroups']:
    group_name = log_group['logGroupName']
    
    # Dev/staging: 7 days
    # Production: 30 days
    retention_days = 30 if 'prod' in group_name else 7
    
    client.put_retention_policy(
        logGroupName=group_name,
        retentionInDays=retention_days
    )
    
    print(f"Set {group_name} to {retention_days} days")
```

**Savings**: $1,500/month

## Quick Win #7: NAT Gateway Consolidation

### The Problem

We had NAT Gateways in every AZ. $0.045/hour each = $100/month per gateway.

### The Fix

Consolidated to 1 NAT Gateway (acceptable for non-critical):

```hcl
# Before: 3 NAT Gateways
resource "aws_nat_gateway" "az1" { /* ... */ }
resource "aws_nat_gateway" "az2" { /* ... */ }
resource "aws_nat_gateway" "az3" { /* ... */ }

# After: 1 NAT Gateway
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  
  tags = {
    Name = "main-nat-gateway"
  }
}

# Update route tables
resource "aws_route" "private_nat" {
  for_each = aws_route_table.private
  
  route_table_id         = each.value.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main.id
}
```

**Savings**: $200/month

For critical prod, we kept HA setup.

## Quick Win #8: Data Transfer Optimization

### The Problem

$6,000/month in data transfer fees.

### The Analysis

Used VPC Flow Logs to identify traffic:

```bash
# Enable VPC Flow Logs
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-xxxxx \
  --traffic-type ALL \
  --log-destination-type s3 \
  --log-destination arn:aws:s3:::my-flow-logs
```

Found:

- App servers pulling Docker images from external registries
- Databases syncing across regions unnecessarily

### The Fix

1. **Use ECR VPC Endpoints** (no data charges):

```hcl
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.ecr.api"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  
  subnet_ids = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoints.id]
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  
  subnet_ids = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoints.id]
}
```

2. **Use S3 Gateway Endpoint** (free):

```hcl
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.us-east-1.s3"
  
  route_table_ids = aws_route_table.private[*].id
}
```

3. **Enabled CloudFront for static assets**

**Savings**: $3,500/month

## Ongoing: AWS Cost Explorer & Budgets

Set up alerts to prevent surprises:

```hcl
resource "aws_budgets_budget" "monthly" {
  name         = "monthly-budget"
  budget_type  = "COST"
  limit_amount = "25000"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["alerts@company.com"]
  }
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_email_addresses = ["cfo@company.com"]
  }
}
```

## The Complete Checklist

**Compute**

- Rightsize EC2 instances based on actual usage
- Use Reserved Instances for steady-state workloads
- Use Spot Instances for fault-tolerant workloads
- Stop/start non-production resources
- Use Auto Scaling (scale down when idle)
- Consider Graviton instances (20-40% cheaper)

**Storage**

- Implement S3 lifecycle policies
- Delete unused EBS volumes
- Use appropriate storage classes (IA, Glacier)
- Enable S3 Intelligent-Tiering
- Compress data before storing
- Delete old snapshots

**Database**

- Rightsize RDS instances
- Use Aurora Serverless for variable workloads
- Enable automated backups cleanup
- Consider RDS Reserved Instances
- Use read replicas efficiently
- Enable Performance Insights (it's cheap)

**Network**

- Consolidate NAT Gateways (if acceptable)
- Use VPC Endpoints for AWS services
- Enable CloudFront for static content
- Review data transfer patterns
- Use AWS Direct Connect for large transfers
- Avoid cross-region data transfer

**Monitoring**

- Set CloudWatch Logs retention
- Delete unused custom metrics
- Use metric filters sparingly
- Consider alternative logging (CloudWatch is expensive)
- Enable AWS Cost Anomaly Detection

**General**

- Tag everything for cost allocation
- Set up AWS Budgets and alerts
- Review AWS Trusted Advisor weekly
- Use AWS Cost Explorer regularly
- Delete unused resources
- Enable AWS Cost Optimization Hub

## Tools That Help

### Cost Analysis
- **AWS Cost Explorer**: Built-in, free
- **CloudHealth**: Multi-cloud visibility
- **CloudCheckr**: Deep analysis
- **Komiser**: Open-source alternative

### Automation
- **AWS Instance Scheduler**: Stop/start EC2 on schedule
- **Cloud Custodian**: Policy-as-code for cleanup
- **Terraform**: Infrastructure as code

### Monitoring
- **AWS Cost Anomaly Detection**: Free, catches spikes
- **CloudWatch**: Set up billing alarms
- **Datadog**: Unified monitoring + costs

## The Results

| Category | Before | After | Savings |
|----------|--------|-------|---------|
| EC2 | $28,000 | $12,000 | 57% |
| RDS | $12,000 | $7,000 | 42% |
| Data Transfer | $6,000 | $2,500 | 58% |
| CloudWatch | $2,000 | $500 | 75% |
| Other | $2,000 | $1,000 | 50% |
| **Total** | **$50,000** | **$20,000** | **60%** |

## Lessons Learned

1. **Tag everything**: Can't optimize what you can't measure
2. **Review monthly**: Costs creep up slowly
3. **Automate cleanup**: Manual cleanup doesn't scale
4. **Challenge defaults**: "We've always done it this way" is expensive
5. **Monitor continuously**: Set up alerts BEFORE you get surprised

## Common Mistakes to Avoid

1. **Over-optimizing**: Don't sacrifice reliability for $10/month
2. **Ignoring reserved instances**: 40% discount is huge
3. **Keeping zombie resources**: Unused resources cost money
4. **Not setting budgets**: Prevention is cheaper than cure
5. **Optimizing once**: This is an ongoing process

## Final Thoughts

AWS cost optimization isn't a one-time thing. It's a continuous process.

Our routine now:

- Weekly review of new resources
- Monthly cost analysis meeting
- Quarterly deep-dive optimization

The CFO is happy. Our budget is predictable. And we can actually scale without fear.

**Remember**: Every dollar saved is a dollar earned. And it compounds.

What's your AWS horror story? Share your cost-saving wins below!

