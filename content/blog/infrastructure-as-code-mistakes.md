---
title: "Infrastructure as code: mistakes I made so you don't have to"
date: "2024-11-28"
tags: ["terraform", "iac", "devops", "infrastructure"]
excerpt: "Terraform mistakes I made so you don't have to: hardcoded AMIs, lost local state, a 2000-line main.tf, an unpinned provider, and a stray terraform destroy."
featured: true
---

The first time I ran `terraform destroy` against the wrong workspace, I had two terminals open, one coffee in, and roughly four seconds between hitting `yes` and realising what was on the other end of that plan. The instance count was 17. By the time I cancelled, it was 6. Every one of those came back, eventually. The pages did not.

![Five hand-drawn tombstones lined up in a small graveyard, each one marking a different terraform mistake: hardcoded amis, lost local state, a 2000-line main.tf, an unpinned provider, and a stray terraform destroy in red.](/images/infrastructure-as-code-mistakes/hero.png)

*Fig. 1 · every headstone here was paid for in pages.*

What follows is the short list of Terraform mistakes I've made enough times to recognise on sight. None of them are clever. All of them are the sort of thing you nod at in a blog post and then commit anyway because it's Friday.

## hardcoding everything

**The mistake.** My first Terraform config looked like this:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
}
```

Looks fine until the day someone asks for the same stack in `eu-west-1` and you discover that AMI ID isn't a real thing outside `us-east-1`. Or until the AMI is six months old and Canonical has retired it. Or until you have eleven of these scattered across modules and you can't grep your way out.

**The fix.** Variables for the knobs, data sources for the things AWS is willing to look up for you:

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

The data source costs you one API call per plan. It saves you the next four migrations.

## not using remote state

**The mistake.** Keeping `terraform.tfstate` on my laptop. I lost it once. Clean reinstall, didn't think to copy the working directory across. The infrastructure was still up, happily running. Terraform had no idea any of it existed. I rebuilt the state by hand with `terraform import`, one resource at a time, and learned more about resource addresses than I wanted to.

**The fix.** S3 backend, versioning on, lock table next to it:

```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}
```

Versioning on the bucket is the part most people skip. Turn it on. The day you fat-finger a `terraform state rm`, you will want yesterday's state file back, and S3 will hand it over without comment.

## one giant main.tf

**The mistake.** A single `main.tf` that crossed 2,000 lines somewhere around the third VPC peering. Every change touched the same file, every PR diff looked like a refactor, and finding the security group for the bastion meant `Cmd+F "bastion"` and praying I'd named it consistently.

**The fix.** Split by concern, then by reusable unit. The convention I've landed on, per module:

- `main.tf` for the resources that define the module
- `variables.tf` for inputs
- `outputs.tf` for outputs
- `versions.tf` for provider and Terraform version constraints
- separate child modules under `modules/` for anything used twice

The names don't matter to Terraform. It concatenates every `.tf` in the directory regardless. They matter to the next person who opens the repo, which on a long enough timeline is also you.

## not locking provider versions

**The mistake.** A bare provider block:

```hcl
provider "aws" {
  region = "us-east-1"
}
```

The AWS provider shipped a major version with breaking changes to `aws_s3_bucket` resource layout. The next CI run picked it up, the plan tried to recreate every bucket in the account, and I learned what a deeply unhappy Slack channel looks like before lunch.

**The fix.** Pin the provider, pin Terraform itself, commit the lockfile:

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

`~> 4.0` lets in patch and minor bumps, blocks the major. The `.terraform.lock.hcl` file Terraform writes next to your config locks the exact resolved version, including provider hashes. Commit it. Treat a lockfile change in a PR like a dependency upgrade, because that's what it is.

## destroying production by accident

**The mistake.** Two terminal tabs, identical prompts, opposite environments. The plan I meant to run was in the other window. We've all been there. If you haven't, you will be.

**The fix.** A few cheap defenses, layered:

```hcl
resource "aws_instance" "critical" {
  # ...
  lifecycle {
    prevent_destroy = true
  }
}
```

`prevent_destroy` makes Terraform refuse to destroy the resource at all. The plan errors out before anything moves. It's annoying when you genuinely want to destroy the thing, because you have to remove the block first, and that annoyance is the entire point.

Beyond that: a shell prompt that screams the workspace and account in red when you're in prod. A wrapper around `terraform` that grep's the planned destroys and demands you type the resource address back. Terraform Cloud or Atlantis if you have the budget, so the apply runs from a server with proper RBAC and not from whichever terminal you happened to alt-tab into.

The four-second window between `yes` and panic does not get longer with experience. It gets shorter, because you stop reading the prompt.

