---
title: "GitHub Actions vs GitLab CI: a practical comparison"
date: "2024-12-20"
tags: ["ci-cd", "github", "gitlab", "devops", "automation"]
excerpt: "After two years of running both GitHub Actions and GitLab CI across 50 microservices, here is which one I'd reach for and when."
featured: true
---

# GitHub Actions vs GitLab CI: a practical comparison

Two years, 50 microservices, two CI platforms running side by side. Some repos on GitHub, some on GitLab, same team writing the YAML for both. Here is what stuck after the marketing slides wore off.

![A six-row comparison of GitHub Actions and GitLab CI across syntax, runners, caching, secrets, ecosystem, and pricing at fifty microservices, with the pricing row marked focal.](/images/github-actions-gitlab-ci-comparison/hero.png)

*Fig. 1 — six rows, two YAMLs, one billing model that ended the debate.*

## syntax and configuration

### GitHub Actions

```yaml
name: CI Pipeline
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

The YAML is readable, the marketplace has an action for almost everything, and matrix builds are a single block. The nesting gets verbose once you have reusable workflows, and environment variable precedence is its own small religion.

### GitLab CI

```yaml
stages:
  - test
  - build

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test
  only:
    - main
    - merge_requests
```

Flatter than GitHub's nesting, Docker is a first-class citizen, and the stages concept maps cleanly to how you think about a pipeline. There is no marketplace, so reusable components come from `include:` files and Docker images you assemble yourself.

## performance and speed

### build times

A typical Node.js app on our setup builds in 3 to 5 minutes on GitHub Actions and 4 to 6 minutes on GitLab CI. Close enough that I never picked a platform on speed alone.

### parallelization

Both handle parallel jobs well. GitHub Actions has cleaner syntax for matrix builds:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest]
```

GitLab requires more manual setup for the same result.

## ecosystem and marketplace

### GitHub Actions marketplace

Over 20,000 actions, and the caching one is the example I keep coming back to:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

One block, content-addressed cache keyed off the lockfile. The first time you delete the manual cache logic you wrote for GitLab and replace it with this, you feel it.

### GitLab's approach

GitLab does not have a marketplace. You write scripts or use Docker images:

```yaml
test:
  image: node:20
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - npm ci
    - npm test
```

More control, but more work.

## docker integration

### GitLab CI wins here

GitLab CI was built with Docker in mind:

```yaml
build:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t myapp .
    - docker push myapp
```

It just works. No weird permissions issues.

### GitHub Actions

Needs more setup for Docker.

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myapp:latest
```

Works fine, but requires more marketplace actions.

## secrets management

### GitHub

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

Simple. Secrets are org/repo scoped. Works well.

### GitLab

```yaml
variables:
  API_KEY: $CI_DEPLOY_TOKEN
```

More flexible with group-level variables and environments. Better for complex setups.

## cost

GitHub Actions gives private repos 2,000 minutes/month on the free tier, public repos are unlimited, and overage is $0.008/minute. GitLab SaaS gives 400 minutes/month free and charges $10 per 1,000 additional minutes, but self-hosted runners are unlimited. If you can run your own runners, GitLab gets cheaper fast at scale. If you can't, GitHub's free tier outlasts it.

## self-hosted runners

### GitHub

```bash
./config.sh --url https://github.com/org/repo --token TOKEN
./run.sh
```

Setup is straightforward. Runners are repo or org-scoped.

### GitLab

```bash
gitlab-runner register
gitlab-runner run
```

More flexible. Can be project, group, or instance-wide. Better for large organizations.

## debugging experience

GitHub Actions has clear, searchable logs, lets you re-run individual jobs, and exposes a debug mode behind two secrets. You can SSH into a runner via a third-party action, but it is not a native feature.

GitLab is the one I reach for when a pipeline is genuinely stuck. The log viewer is good, individual job retries are good, but the real difference is interactive debugging. SSH into the runner mid-job, or open a web terminal from the failed job in your browser, and poke at the filesystem while the build is still alive. The first time you do this on a Docker-in-Docker failure that only repros on CI, you stop missing it everywhere else.

## when to pick which

GitHub Actions wins when you are already on GitHub, want the marketplace, and your pipelines are small to medium. GitLab CI wins when your Docker workflows are non-trivial, your runner fleet is large, your deployment strategies are gnarly, or you need to debug pipelines without a redeploy loop.

## my setup

I use both. GitHub Actions for open-source and frontend, GitLab CI for infrastructure code and the deployments that involve five stages and a manual approval.

## common pitfalls

GitHub Actions has a 6-hour hosted-runner job timeout, a 90-day artifact retention default (configurable up to 400 days for public repos, 90 for private), and tight concurrent-job limits on the free tier. Plan around them or pay.

GitLab's shared runners get sluggish at peak, Docker builds need `docker:dind` as a service container, and CI/CD variable precedence has at least six rules you will need to read twice. The one that bites me most: project-level variables silently override group-level ones with the same name.

## migration tips

### GitHub to GitLab

```yaml
# GitHub
- uses: actions/checkout@v4

# GitLab equivalent
git clone $CI_REPOSITORY_URL
cd $CI_PROJECT_NAME
```

### GitLab to GitHub

Most scripts translate directly. The win is collapsing a few of them into marketplace actions you no longer have to maintain.

Starting fresh, pick whichever platform already hosts your code. The integration tax of running CI on the other vendor outweighs every syntax preference in this post. Whichever one you pick, the only investment that pays back is making the pipeline fast. A slow CI is worse than no CI; it just costs more to ignore.
