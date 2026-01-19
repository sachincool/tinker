---
title: "Infrastructure as Code: Mistakes I Made So You Don't Have To"
date: "2024-11-28"
tags: ["terraform", "iac", "devops", "infrastructure"]
excerpt: "Learning Terraform the hard way. Here are the mistakes that cost me sleep, money, and a bit of my sanity."
featured: true
---

# Infrastructure as Code: Mistakes I Made So You Don't Have To

After managing infrastructure with Terraform for years, I've made every mistake in the book. Here are the ones that hurt the most.

## 1. Hardcoding Everything

**The Mistake:** My first Terraform config looked like this:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
}
```

Seems fine until you need to deploy to another region or environment.

**The Fix:** Use variables and data sources:

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
}
```

## 2. Not Using Remote State

**The Mistake:** Keeping `terraform.tfstate` locally. Lost my state file once. Never again.

**The Fix:** Always use remote state:

```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}
```

Enable versioning on that S3 bucket. Trust me.

## 3. Massive Monolithic Configs

**The Mistake:** One giant `main.tf` with 2000 lines. Good luck finding anything.

**The Fix:** Break it up:

- `main.tf` - Main resources
- `variables.tf` - Input variables
- `outputs.tf` - Output values
- `versions.tf` - Provider versions
- Separate modules for reusable components

## 4. Not Locking Provider Versions

**The Mistake:**

```hcl
provider "aws" {
  region = "us-east-1"
}
```

Provider updates, breaks everything. Classic.

**The Fix:**

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}
```

## 5. Destroying Production by Accident

**The Mistake:** Running `terraform destroy` in the wrong terminal window. We've all been there.

**The Fix:** 

- Use workspace prefixes in your terminal
- Add lifecycle prevent_destroy blocks:

```hcl
resource "aws_instance" "critical" {
  # ...
  lifecycle {
    prevent_destroy = true
  }
}
```

- Use Terraform Cloud with proper RBAC

## Lessons Learned

Infrastructure as Code is powerful, but it's also dangerous. Treat your Terraform code like production code because it literally creates your production.

My golden rules:

1. Always use remote state
2. Lock your provider versions
3. Use modules for reusability
4. Test in dev first (obvious but ignored)
5. Plan before apply, always

Made any catastrophic Terraform mistakes? You're not alone. Share yours!

