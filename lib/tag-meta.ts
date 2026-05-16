// Hand-written descriptions for tags. Voice: dry, specific, lowercase, one sentence.
// Tags absent from this map render without a description — by design.

export interface TagMeta {
  description: string;
  emoji?: string;
}

export const TAG_META: Record<string, TagMeta> = {
  "ai-tooling": {
    description: "agents, copilots, and the moment they confidently delete the wrong file.",
  },
  akamai: {
    description: "edge networks, cache invalidations, and config that ships in fifteen minutes if you're lucky.",
  },
  anime: {
    description: "shows watched between incidents, mostly for the soundtracks.",
  },
  automation: {
    description: "the script you wrote once so you'd never have to do the thing again, and now maintain forever.",
  },
  aws: {
    description: "bills, IAM, and the slow realization that the cheapest service is the one you turned off.",
  },
  benchmarking: {
    description: "numbers that mean something only if you read the methodology twice.",
  },
  "best-practices": {
    description: "what everyone agrees on until production disagrees.",
  },
  blogging: {
    description: "writing about the stack, in public, on the stack.",
  },
  "browser-extensions": {
    description: "small tools that live in the toolbar and quietly outlast every SaaS subscription.",
  },
  cdn: {
    description: "caches, edges, and figuring out which pop served the stale response.",
  },
  "ci-cd": {
    description: "yaml, runners, and the green checkmark that took six hours to earn.",
  },
  "claude-code": {
    description: "agentic coding with claude — workflows, hooks, and the prompts that actually stick.",
  },
  cloud: {
    description: "someone else's computer, billed per second, configured per hour.",
  },
  containers: {
    description: "everything that goes wrong between the dockerfile and the running process.",
  },
  "cost-optimization": {
    description: "the meeting that happens after the bill, and the dashboard built so it doesn't happen again.",
  },
  debugging: {
    description: "logs, traces, and the dawning suspicion that it's dns.",
  },
  design: {
    description: "type, spacing, and the difference between a draft and something you'd ship.",
  },
  detective: {
    description: "incidents reconstructed from timestamps, dashboards, and one suspicious commit.",
  },
  devops: {
    description: "where the dev ends, the ops begins, and the on-call rotation never sleeps.",
  },
  devsecops: {
    description: "shifting security left until it lands on the developer who already had a sprint.",
  },
  docker: {
    description: "images, layers, and the cache miss that just cost you twelve minutes.",
  },
  dokploy: {
    description: "self-hosted paas notes — what it does well and what it leaves to you.",
  },
  email: {
    description: "spf, dkim, dmarc, and the sinking feeling when the test mail lands in spam.",
  },
  entertainment: {
    description: "what's on in the background while the build runs.",
  },
  finops: {
    description: "the discipline of caring about the cloud bill before someone else has to.",
  },
  github: {
    description: "actions, issues, and the pull request that's been open longer than the feature itself.",
  },
  gitlab: {
    description: "pipelines, runners, and the ci config nobody wants to refactor.",
  },
  grafana: {
    description: "dashboards that make the right thing obvious, eventually.",
  },
  hosting: {
    description: "where the bytes live and what it costs to keep them there.",
  },
  iac: {
    description: "infra as code — diffs you can review, drift you can't.",
  },
  infrastructure: {
    description: "the parts of the stack you only think about when they break.",
  },
  kubernetes: {
    description: "pods that won't stay up, configs that won't render, and the kubectl command you'll wish you'd typed sooner.",
  },
  "lazy-sre": {
    description: "the sre playbook for people who'd rather automate it than carry the pager.",
  },
  logging: {
    description: "writing things down so future-you can find out what past-you was doing.",
  },
  loki: {
    description: "grafana's log store, its labels, and the queries you only learn by writing them wrong first.",
  },
  monitoring: {
    description: "the dashboards you check before you check anything else.",
  },
  networking: {
    description: "packets, routes, mtus, and the tcpdump that finally tells the truth.",
  },
  npm: {
    description: "packages, lockfiles, and the transitive dependency that brought the supply chain with it.",
  },
  observability: {
    description: "metrics, logs, traces, and the slow art of asking your system a question.",
  },
  performance: {
    description: "the difference between p50 and p99, and why the user only remembers the second one.",
  },
  personal: {
    description: "notes from the desk — habits, tools, and the occasional opinion.",
  },
  production: {
    description: "the environment where assumptions go to be tested by strangers.",
  },
  "production-incidents": {
    description: "postmortems, root causes, and the timeline reconstructed from slack scrollback.",
  },
  prometheus: {
    description: "metrics, scrape configs, and the alert that fired at 3am for the right reason.",
  },
  security: {
    description: "threat models, default-deny, and the cve that landed on a friday.",
  },
  "self-hosting": {
    description: "running it yourself because the saas pricing page made you angry.",
  },
  sitcoms: {
    description: "comfort tv — the kind that loops on the second monitor.",
  },
  sre: {
    description: "slos, error budgets, and the pager rotation that makes them real.",
  },
  "supply-chain": {
    description: "every dependency you didn't write, audit, or notice — until one of them notices you.",
  },
  terraform: {
    description: "state files, plans, and the apply you do twice because the first one half-worked.",
  },
  tls: {
    description: "certs, chains, and the renewal that lapsed at the worst possible moment.",
  },
  "tv-shows": {
    description: "what's queued up for the next deploy window.",
  },
  victorialogs: {
    description: "a lighter logs backend — what it gets right, what it gives up, and where it fits.",
  },
  waf: {
    description: "rules, false positives, and the legitimate request you spent an hour unblocking.",
  },
};

export function getTagMeta(tag: string): TagMeta | null {
  return TAG_META[tag.toLowerCase()] ?? null;
}
