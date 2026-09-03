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

// ---------------------------------------------------------------------------
// Tag hubs
//
// 107 tags, 91 of which carry one or two posts. Those thin pages were 68% of
// the sitemap and near-duplicates of each other — index bloat that competes
// with the posts it links to. A tag has to carry HUB_TAG_MIN_POSTS before it
// is indexed and listed in the sitemap; below that it stays browsable and
// still passes link equity (noindex, follow).
// ---------------------------------------------------------------------------

export const HUB_TAG_MIN_POSTS = 3;

// `devsecops` carries exactly the same six posts as `lazy-sre`. Two indexable
// pages listing an identical set is a duplicate, so the generic term defers to
// the series hub. Drop from here if a post ever tags one without the other.
const DUPLICATE_TAGS = new Set(['devsecops']);

export interface TagHub {
  // `<title>` lead. `{n}` is replaced with the live post count at render time.
  // Kept short so the rendered title lands inside Google's ~60-char window
  // once ` · Infra Magician` is appended.
  seoTitle: string;
  metaDescription: string;
  // 60–120 words, written from the posts the tag actually carries. Deliberately
  // not templated — a one-sentence stencil with the tag name swapped in is
  // doorway content, and Google treats it that way.
  intro: string;
}

export const TAG_HUBS: Record<string, TagHub> = {
  devops: {
    seoTitle: 'DevOps: {n} notes on CI/CD, Docker and git',
    metaDescription:
      'DevOps write-ups from production: GitHub Actions vs GitLab CI, Docker hardening, Terraform mistakes, kubectl tricks, and the git commands worth memorising.',
    intro:
      "Posts and notes that sit where development stops and operations starts. The CI/CD comparison came from running GitHub Actions and GitLab CI side by side across fifty microservices; the Terraform post is a list of mistakes paid for in pages. There's Docker hardening, a Prometheus and Grafana stack that isn't a hello-world dashboard, a fifteen-minute migration off Netlify, and the short kubectl and git notes that turned into muscle memory. The security-flavoured half of the same job lives under lazy-sre.",
  },
  security: {
    seoTitle: 'Security: {n} posts on defaults that hold',
    metaDescription:
      'Security posts: the Lazy Security series on supply chain, GitHub Actions, DNS and dev laptops, plus WAF false positives and GPU multi-tenancy incidents.',
    intro:
      "Posts about threat models, default-deny, and the configuration that makes the wrong thing impossible. Six of them are the Lazy Security series: the dependencies you didn't read, the actions you didn't pin, the unsexy list, four DNS records, the dev laptop as perimeter, and the network in front of everything. The rest are incidents — a WAF that decided browser extensions looked like attack vectors, two tenants sharing a GPU with no wall between them — plus the Docker baseline and a self-hosted alias server. Practical controls and dated incidents, no vendor slides.",
  },
  kubernetes: {
    seoTitle: 'Kubernetes: {n} posts on debugging at 3am',
    metaDescription:
      'Kubernetes posts from production: crash loops and exit codes, probe configs, GPU scheduling, scale-to-zero, kubectl JSONPath, and a log-store benchmark.',
    intro:
      'Posts on Kubernetes as it actually behaves at 3am. Six come from the GPUs in production series: the dozen layers under a GPU pod, scaling past one box, scale-to-zero, inference routing, the probe that kills a healthy model server, and multi-tenancy on a shared card. The rest are the debugging tricks that saved a production cluster, a benchmarked VictoriaLogs against Loki comparison, and two short kubectl notes — JSONPath queries and kubectl neat. Exit codes, probe configs, scheduler behaviour, and the YAML that explains why.',
  },
  gpu: {
    seoTitle: 'GPU infrastructure: {n} Kubernetes posts',
    metaDescription:
      'The GPUs in production series: driver and device-plugin layers, NVLink and NCCL, InfiniBand fabrics, scale-to-zero, routing, probes, and multi-tenancy.',
    intro:
      'The GPUs in production series, eight parts, written while running LLM inference on Kubernetes. It starts at the dozen layers under a single GPU pod — driver, container toolkit, device plugin, scheduler — then works outward: NVLink and NCCL inside one box, InfiniBand and gang scheduling across many, what a green GPU dashboard hides, scaling to zero without a five-minute cold start, routing that beats a bigger card, the probe that crash-loops a healthy model server, and two tenants sharing one GPU with no wall between them.',
  },
  'lazy-sre': {
    seoTitle: 'Lazy SRE: {n} parts on security that ships',
    metaDescription:
      'The Lazy Security series in six parts: dependency cooldowns, SHA-pinned Actions, identity and audit logs, four DNS records, the dev laptop, and the network plane.',
    intro:
      "The Lazy Security series: six parts on the security work a small team will actually execute. The premise is that the configuration which makes the wrong thing impossible beats the runbook that only discourages it. Part 1 is npm and the dependencies you didn't read. Part 2 is SHA pinning, dependency cooldowns, and pull_request_target. Part 3 is the unsexy list — identity, audit logs, the PAT you forgot. Part 4 is SPF, DKIM, DMARC and CAA. Part 5 treats the dev laptop as the perimeter, and part 6 is the network in front of everything.",
  },
  infrastructure: {
    seoTitle: 'Infrastructure: {n} posts on the deep stack',
    metaDescription:
      'Five infrastructure posts: cutting an AWS bill by 60%, Terraform mistakes paid for in pages, and the first three parts of the GPUs in production series.',
    intro:
      'Five posts about the layer you only think about when it breaks. The AWS cost post walks a fifty-thousand-dollar monthly bill down, CloudWatch ingestion levers included. The Terraform post is a list of infrastructure-as-code mistakes paid for in pages and money. The other three are the opening chapters of the GPUs in production series — the dozen layers under a GPU pod, eight GPUs and the wires between them, and what changes the moment a model no longer fits inside one box.',
  },
  productivity: {
    seoTitle: 'Productivity: {n} notes on shell and git',
    metaDescription:
      'Five notes on doing the same job with fewer keystrokes: daily git commands, interactive rebase, jq, kubectl neat, and a zsh function that pre-types the command.',
    intro:
      "Five notes about doing the same job with fewer keystrokes. The git post is the set of commands that survived years of daily use, not the full manual; interactive rebase gets a note of its own. jq earns its keep the day you stop piping JSON through grep. kubectl neat strips the forty lines of managed-fields clutter Kubernetes staples onto every object. And there's a single zsh function that answers a question inline and knows when to pre-type the command instead of explaining it.",
  },
  docker: {
    seoTitle: 'Docker: {n} posts on images and hardening',
    metaDescription:
      'Docker posts: rootless container hardening, the build cache, a full Compose deployment with a TLS trap, the .dockerignore cache gotcha, and finding where volume data lives.',
    intro:
      "Posts on the gap between a Dockerfile and a running process. The hardening post is the baseline: stop running as root, drop capabilities, and set the rest of the defaults once. SimpleLogin is a full Compose deployment with Postfix and a TLS trust trap that eats an afternoon. The two short notes cover the .dockerignore gotcha that silently busts your build cache, and how to find where a volume's data actually lives on disk when the container insists the directory is empty.",
  },
  vllm: {
    seoTitle: 'vLLM: {n} posts on serving LLMs in prod',
    metaDescription:
      'vLLM posts from a production GPU fleet: tensor parallelism and the interconnect, queue-time metrics, KV-cache-aware routing, and probes that stop crash loops.',
    intro:
      'Four posts on running vLLM in production, all from the GPUs in production series. Inside one box, tensor parallelism only goes as fast as the interconnect underneath it. On the dashboard, the metrics that matter are queue time and KV-cache utilisation, not GPU utilisation. In front of the fleet, a router that reads the KV cache beats a round-robin load balancer. And at the pod level, a liveness probe that fires while weights are still loading will crash-loop a server that was never broken.',
  },
  observability: {
    seoTitle: 'Observability: {n} posts on metrics and logs',
    metaDescription:
      'Observability posts: a production Prometheus and Grafana stack, a benchmarked VictoriaLogs vs Loki comparison, GPU queue metrics, and a cardinality save.',
    intro:
      'Posts about asking a system a question and getting a true answer. The Prometheus and Grafana guide builds a stack that survives contact with production. The VictoriaLogs versus Loki comparison is benchmarked — ingest, query latency, storage and CPU, with the methodology written down. The GPU observability part explains why a green dashboard hides a queue. And the JA4 note is a cardinality story: a fingerprint format that splits cleanly is the difference between a usable label and a metrics bill.',
  },
  debugging: {
    seoTitle: 'Debugging: {n} posts on the real root cause',
    metaDescription:
      'Debugging write-ups from production: Kubernetes crash loops and stuck pods, a WAF false positive triggered by browser extensions, and Docker volume archaeology.',
    intro:
      'Posts about the gap between the symptom and the cause. The Kubernetes set covers stuck pods, crash loops, and the networking failures that present as application bugs. The Akamai post is a WAF false positive: a browser extension rewriting request headers into something the edge scored as an attack, and the hour it took to prove that. The Docker volume note is the shortest of the group and the one most often needed — finding where the data physically lives when the container insists the directory is empty.',
  },
  shell: {
    seoTitle: 'Shell: {n} posts on zsh, bash and the CLI',
    metaDescription:
      'Command-line notes: the git commands worth memorising, bash parameter expansion instead of sed and awk, and a zsh function that answers questions inline.',
    intro:
      'Notes on the command line as a working surface. The git post is the daily set — the ten or so commands that survived, plus the aliases worth having. Bash parameter expansion does most of what people reach for sed and awk to do, in-process and without spawning a subshell. And there is a single zsh function that turns a question into an answer inline, with the useful twist that it pre-types a command into the prompt rather than explaining it, so you never leave the terminal.',
  },
  inference: {
    seoTitle: 'LLM inference: {n} posts on serving at scale',
    metaDescription:
      'Three posts on serving LLM inference on Kubernetes: the metrics that actually signal health, scale-to-zero cold starts, and KV-cache-aware request routing.',
    intro:
      'Three posts on serving LLM inference rather than training it. The observability part explains why GPU utilisation is a bad health metric and what to watch instead — time to first token, queue depth, KV-cache pressure. Scale-to-zero covers the money argument for idling a GPU fleet and the cold-start work that makes it survivable in front of real users. And the routing part makes the case that the cheapest speedup available is usually the load balancer, not a bigger card.',
  },
  monitoring: {
    seoTitle: 'Monitoring: {n} posts on Prometheus alerts',
    metaDescription:
      'Monitoring from production: a Prometheus and Grafana stack worth keeping, a TLS fingerprinting rule that took down 30% of traffic, and metrics cardinality.',
    intro:
      'Posts about what to watch and what it costs to watch it. The Prometheus and Grafana guide is the stack end to end, with the dashboards and alerts that earn their place and the ones that do not. The JA4 incident runs the other direction: a TLS fingerprinting rule that took down thirty percent of production, reconstructed from the timeline. The short JA4 note is the follow-up on metrics cardinality, and why a fingerprint that splits into parts is far cheaper to label than one that does not.',
  },
  'supply-chain': {
    seoTitle: 'Supply chain: {n} posts on dependency risk',
    metaDescription:
      'Supply-chain security in practice: npm postinstall and cooldowns, the trivy-action tag rewrite and SHA pinning, plus provenance and audit logs that survive both.',
    intro:
      'Three posts on the code you shipped but did not write. Part 1 of the Lazy Security series is npm: postinstall scripts, dependency cooldowns, and the install-time defences that refuse malware before bytes hit disk. Part 2 is the same problem one level up — the trivy-action tag rewrite, org-level SHA pinning enforcement, and why a version tag is a name lookup rather than a pin. Part 3 names what partially mitigates the class that survives both: provenance, attestation, and audit logs you can actually read.',
  },
  containers: {
    seoTitle: 'Containers: {n} posts on images and runtime',
    metaDescription:
      'Container posts from production: rootless hardening, BuildKit cache mounts and CI cache export, volume archaeology, and reading a crash loop by its exit code.',
    intro:
      'Posts about what happens between a Dockerfile and a running process, and then between that process and the scheduler. Hardening is the baseline: not root, dropped capabilities, defaults set once. The build cache post is the other end of the same file, where instruction order and an exported cache decide whether CI rebuilds everything on every commit. Then there is the crash-loop triage, which is mostly about reading an exit code correctly, and a short note on finding where a volume\'s data physically lives when the container says the directory is empty.',
  },
  sre: {
    seoTitle: 'SRE: {n} posts on budgets, probes and pages',
    metaDescription:
      'Site reliability work in practice: error-budget burn-rate alerts, a TLS fingerprinting rule that took down 30% of traffic, and crash-loop triage by exit code.',
    intro:
      'Posts about the part of the job that is measured in pages rather than features. The burn-rate alerting post is the argument for paging on the error budget instead of the CPU graph, with the two-window rule that stops an alert firing for an hour after the incident ended. The JA4 post is the incident that argument exists for: one fingerprinting rule, thirty percent of production, reconstructed from the timeline. The crash-loop triage is the 3am version, five causes separated by an exit code and a reason field.',
  },
  prometheus: {
    seoTitle: 'Prometheus: {n} posts on metrics and alerts',
    metaDescription:
      'Prometheus in production: a Grafana stack worth keeping, multi-window burn-rate alerts on the error budget, and the queue metrics that predict a bad experience.',
    intro:
      'Posts on Prometheus as the thing that decides whether anyone gets woken up. The Grafana guide is the stack end to end, dashboards and alerts included. The burn-rate post replaces threshold alerts with recording rules over the error budget, plus the absent_over_time alert that covers the case where the exporter itself disappears and every other alert goes quiet. The GPU observability part is the same reasoning applied to model serving, where utilisation is the misleading metric and queue time is the honest one.',
  },
  'ci-cd': {
    seoTitle: 'CI/CD: {n} posts on pipelines that hold up',
    metaDescription:
      'CI/CD from production: GitHub Actions vs GitLab CI across 50 services, SHA-pinned workflows and dependency cooldowns, and Docker build caching that survives the runner.',
    intro:
      'Posts about the pipeline as a thing that is both a bottleneck and an attack surface. The comparison post came from running GitHub Actions and GitLab CI side by side across fifty microservices, with the decision matrix that came out of it. Part 2 of the Lazy Security series is the security half: SHA pinning against tag rewrites, dependency cooldowns, and the trigger never to touch. The build cache post is the speed half, and the reason a build that caches on your laptop rebuilds everything on a fresh runner.',
  },
  devsecops: {
    seoTitle: 'DevSecOps: {n} posts on shifting left',
    metaDescription:
      'DevSecOps in practice: the six-part Lazy Security series on dependency cooldowns, pinned Actions, identity hygiene, DNS records, laptops, and the network plane.',
    intro:
      'The six parts of the Lazy Security series, filed under the name the job usually gets. Each one picks a single class of failure and names the configuration that closes it: dependency cooldowns and install-time scanning, SHA-pinned workflows and OIDC instead of long-lived cloud keys, identity and audit logs, four DNS records that end the impersonation class, a dev laptop treated as the perimeter, and a network plane where the default is deny. The order is deliberate — earlier parts gate the later ones.',
  },
};

export function getTagHub(tag: string): TagHub | null {
  return TAG_HUBS[tag.toLowerCase()] ?? null;
}

// A tag page earns indexing once it carries enough posts to be a topic hub and
// isn't a duplicate listing of another tag. Everything else is noindex, follow.
export function isIndexableTag(tag: string, postCount: number): boolean {
  return postCount >= HUB_TAG_MIN_POSTS && !DUPLICATE_TAGS.has(tag.toLowerCase());
}
