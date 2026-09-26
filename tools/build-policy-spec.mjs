#!/usr/bin/env node
// Builds oxagen-agent-policy-spec.html: example agent policies in Cedar, each with tests whose
// decisions are computed by Cedar's own evaluator against the schema below. The build fails when a
// policy does not validate, when an evaluation reports an error, or when a decision differs from
// the one the example expects, so the page never shows a decision Cedar did not make.
//
//   node tools/build-policy-spec.mjs                    # write oxagen-agent-policy-spec.html
//   node tools/build-policy-spec.mjs --check            # fail if the file is not what this script writes
//   node tools/build-policy-spec.mjs --artifact <path>  # also write the page body alone, for the Artifact tool
//
// Cedar comes from @cedar-policy/cedar-wasm, which is not a dependency of this repo. Install it
// without saving (npm install --no-save @cedar-policy/cedar-wasm@4.13.0), or point CEDAR_WASM at
// its nodejs directory.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "oxagen-agent-policy-spec.html");
const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const ARTIFACT = args.includes("--artifact") ? args[args.indexOf("--artifact") + 1] : null;
// The day the examples were last reviewed. Change it when an example changes.
const AS_OF = "2026-09-25";

function loadCedar() {
  const require = createRequire(import.meta.url);
  for (const id of [process.env.CEDAR_WASM, "@cedar-policy/cedar-wasm/nodejs"].filter(Boolean)) {
    try { return require(id); } catch { /* try the next one */ }
  }
  console.error("Cedar is not installed. Run: npm install --no-save @cedar-policy/cedar-wasm@4.13.0");
  process.exit(1);
}
const cedar = loadCedar();

/* ---------------------------------------------------------------- the request */

// Every tool the examples name, with the classification the tool registry gives its version.
const TOOLS = {
  github__get_file_contents: { version: "2", risk: "low", side_effect: "read", egress: "third_party", financial_class: "none" },
  github__create_issue_comment: { version: "2", risk: "low", side_effect: "write", egress: "third_party", financial_class: "none" },
  github__create_pull_request: { version: "3", risk: "high", side_effect: "write", egress: "third_party", financial_class: "none" },
  github__create_release: { version: "2", risk: "high", side_effect: "irreversible", egress: "third_party", financial_class: "none" },
  github__delete_branch: { version: "1", risk: "high", side_effect: "irreversible", egress: "third_party", financial_class: "none" },
  github__delete_repository: { version: "1", risk: "critical", side_effect: "irreversible", egress: "third_party", financial_class: "none" },
  stripe__list_prices: { version: "2", risk: "low", side_effect: "read", egress: "third_party", financial_class: "none" },
  stripe__create_payment: { version: "5", risk: "critical", side_effect: "irreversible", egress: "third_party", financial_class: "moves_funds" },
  stripe__create_refund: { version: "3", risk: "critical", side_effect: "irreversible", egress: "third_party", financial_class: "moves_funds" },
  aws_billing__purchase_savings_plan: { version: "2", risk: "critical", side_effect: "irreversible", egress: "third_party", financial_class: "commits_spend" },
  slack__post_message: { version: "2", risk: "medium", side_effect: "write", egress: "third_party", financial_class: "none" },
  slack__upload_file: { version: "1", risk: "medium", side_effect: "write", egress: "third_party", financial_class: "none" },
  snowflake__run_query: { version: "2", risk: "high", side_effect: "read", egress: "internal", financial_class: "none" },
  claude_code__Bash: { version: "2.1", risk: "high", side_effect: "write", egress: "none", financial_class: "none" },
  claude_code__Edit: { version: "2.1", risk: "medium", side_effect: "write", egress: "none", financial_class: "none" },
  claude_code__WebFetch: { version: "2.1", risk: "high", side_effect: "read", egress: "third_party", financial_class: "none" },
  linear__update_issue: { version: "3", risk: "medium", side_effect: "write", egress: "third_party", financial_class: "none" },
  zendesk__update_ticket: { version: "3", risk: "medium", side_effect: "write", egress: "third_party", financial_class: "none" },
  kubernetes__get_logs: { version: "2", risk: "low", side_effect: "read", egress: "internal", financial_class: "none" },
  kubernetes__delete_pod: { version: "2", risk: "critical", side_effect: "irreversible", egress: "internal", financial_class: "none" },
};

// The demo workforce: each agent, its workspace, and the tools its toolbelt grants.
const AGENTS = {
  "a-intel.core.release-manager": { ws: "core-platform", belt: ["github__get_file_contents", "github__create_issue_comment", "github__create_pull_request", "github__create_release", "github__delete_branch", "github__delete_repository", "slack__post_message", "slack__upload_file", "claude_code__Edit", "claude_code__Bash", "kubernetes__get_logs", "kubernetes__delete_pod", "linear__update_issue"] },
  "a-intel.core.stella-ci": { ws: "core-platform", belt: ["github__get_file_contents", "github__create_pull_request", "github__delete_branch", "claude_code__Bash", "claude_code__Edit", "claude_code__WebFetch", "snowflake__run_query"] },
  "a-intel.core.triage": { ws: "core-platform", belt: ["github__get_file_contents", "github__create_issue_comment", "linear__update_issue", "zendesk__update_ticket", "slack__post_message", "slack__upload_file"] },
  "a-intel.core.docs-writer": { ws: "core-platform", belt: ["github__get_file_contents", "github__create_pull_request", "claude_code__Edit", "claude_code__WebFetch"] },
  "a-intel.core.cost-analyst": { ws: "core-platform", belt: ["aws_billing__purchase_savings_plan", "stripe__list_prices"] },
  "a-intel.finops.invoice-bot": { ws: "finops", belt: ["stripe__list_prices", "stripe__create_payment", "stripe__create_refund", "aws_billing__purchase_savings_plan"] },
};

const SCHEMA = `// The request Oxagen's gateway builds for one tool call.
entity Workspace;

// An agent belongs to one workspace. Its toolbelt lists the tools it is granted.
entity Agent in [Workspace] {
  toolbelt: Set<String>
};

// What a call acts on: a repository, a connection, a cluster.
entity Target;

// The tool version, as the registry classifies it.
type Tool = {
  name: String,
  version: String,
  risk: String,
  side_effect: String,
  egress: String,
  financial_class: String
};

// The call's own arguments. Each is optional, so a rule tests it with has first.
type Args = {
  amount_cents?: Long,
  counterparty?: String,
  repository?: String,
  branch?: String,
  path?: String,
  channel?: String,
  recipient_domain?: String,
  cluster?: String,
  schema?: String,
  fields?: Set<String>
};

type Call = {
  tool: Tool,
  args: Args,
  taint: { tainted: Bool, sources: Set<String> },
  time: { hour_utc: Long, weekday: Bool },
  rate: { calls_last_hour: Long, calls_last_minute: Long },
  run: { prior_calls: Set<String>, prior_reads: Set<String> },
  operator: { role: String },
  tier: String,
  budget: { remaining_cents: Long },
  mandate?: { remaining_cents: Long },
  approval: { granted: Bool, approvers: Long }
};

// One action per tool name.
action ${Object.keys(TOOLS).map((n) => `"${n}"`).join(",\n       ")}
  appliesTo {
    principal: Agent,
    resource: Target,
    context: Call
  };
`;

// What fills each part of the context. The proposed parts are marked on the page.
const CONTEXT_ROWS = [
  ["tool", "Tool", "The tool version and the registry's classification of it: risk, side effect, egress and financial class."],
  ["args", "Args", "The call's arguments by name. Only the ones the call carries are present."],
  ["taint", "record", "Whether any input to the call came from an untrusted source, and which sources."],
  ["time", "record", "The gateway's clock, in UTC, when the call arrives."],
  ["rate", "record", "How many calls of this tool the agent made in the last hour and the last minute."],
  ["run", "record", "The tools already called in this run, and the objects already read in it."],
  ["operator", "record", "The role of the operator the run works for."],
  ["tier", "String", "The enforcement tier computed for the run: observe, harness, gateway or contained."],
  ["budget", "record", "What the run's budget has left, in cents."],
  ["mandate", "record, optional", "What the mandate the call draws on has left, when the call draws on one."],
  ["approval", "record", "Whether a person approved this call, and how many people did. The gateway sets it when it asks again after an approval."],
];

/* ---------------------------------------------------------------- the examples */

const BASELINE = `// Compiled from each agent's toolbelt. Nobody writes this rule by hand.
@id("grant.toolbelt")
permit (principal, action, resource)
when { principal.toolbelt.contains(context.tool.name) };`;

// A test is one call and the decision it must get. `with` names other examples its tests run beside.
const GROUPS = [
  { id: "access", title: "Access", examples: [
    { id: "reads.open", title: "Open reads", say: "Every agent may call a read-only tool of low or medium risk, whether or not its toolbelt lists the tool.",
      src: `// Every agent may call a read-only tool of low or medium risk.
@id("reads.open")
permit (principal, action, resource)
when {
  context.tool.side_effect == "read" &&
  context.tool.risk != "high"
};`,
      tests: [
        { agent: "a-intel.core.triage", tool: "kubernetes__get_logs", facts: "not on the toolbelt", expect: "allow" },
        { agent: "a-intel.core.triage", tool: "snowflake__run_query", facts: "a high-risk read, not on the toolbelt", expect: "deny" },
      ] },
    { id: "reads.high-risk-routed", title: "High-risk reads", say: "A high-risk read runs only when the call is routed through the gateway.",
      src: `// A high-risk read runs only when the call is routed through the gateway.
@id("reads.high-risk-routed")
forbid (principal, action, resource)
when {
  context.tool.side_effect == "read" &&
  context.tool.risk == "high"
}
unless { ["gateway", "contained"].contains(context.tier) };`,
      tests: [
        { agent: "a-intel.core.stella-ci", tool: "snowflake__run_query", facts: "tier harness", ctx: { tier: "harness" }, expect: "deny" },
        { agent: "a-intel.core.stella-ci", tool: "snowflake__run_query", facts: "tier gateway", expect: "allow" },
      ] },
  ] },
  { id: "approval", title: "Approval", examples: [
    { id: "irreversible.approval", title: "Irreversible calls", say: "Every irreversible call parks for a person's approval.",
      src: `// Every irreversible call parks for a person's approval.
@id("irreversible.approval")
@decision("require_approval")
forbid (principal, action, resource)
when { context.tool.side_effect == "irreversible" }
unless { context.approval.granted };`,
      tests: [
        { agent: "a-intel.core.release-manager", tool: "github__create_release", facts: "not approved", expect: "approval" },
        { agent: "a-intel.core.release-manager", tool: "github__create_release", facts: "approved", ctx: { approval: { granted: true, approvers: 1 } }, expect: "allow" },
        { agent: "a-intel.core.triage", tool: "github__create_release", facts: "approved, not on the toolbelt", ctx: { approval: { granted: true, approvers: 1 } }, expect: "deny" },
      ] },
    { id: "slack.external-approval", title: "Shared external channels", say: "A Slack post or upload to a channel shared with another company parks for approval.",
      src: `// A post or upload to a shared external Slack channel parks for approval.
@id("slack.external-approval")
@decision("require_approval")
forbid (
  principal,
  action in [Action::"slack__post_message", Action::"slack__upload_file"],
  resource
)
when { context.args has channel && context.args.channel like "ext-*" }
unless { context.approval.granted };`,
      tests: [
        { agent: "a-intel.core.release-manager", tool: "slack__post_message", facts: "channel #releases", ctx: { args: { channel: "releases" } }, expect: "allow" },
        { agent: "a-intel.core.release-manager", tool: "slack__post_message", facts: "channel ext-acme", ctx: { args: { channel: "ext-acme" } }, expect: "approval" },
      ] },
    { id: "payments.two-approvers", title: "Two approvers above $1,000", say: "A call that moves more than $1,000 needs two people to approve it.",
      src: `// A call that moves more than $1,000 needs two approvers.
@id("payments.two-approvers")
@decision("require_approval")
forbid (principal, action, resource)
when {
  context.tool.financial_class == "moves_funds" &&
  context.args has amount_cents &&
  context.args.amount_cents > 100000
}
unless { context.approval.granted && context.approval.approvers >= 2 };`,
      tests: [
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "$2,450.00, one approver", ctx: { args: { amount_cents: 245000 }, approval: { granted: true, approvers: 1 } }, expect: "approval" },
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "$2,450.00, two approvers", ctx: { args: { amount_cents: 245000 }, approval: { granted: true, approvers: 2 } }, expect: "allow" },
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "$640.00", ctx: { args: { amount_cents: 64000 } }, expect: "allow" },
      ] },
  ] },
  { id: "limits", title: "Hard limits", examples: [
    { id: "repo.delete-never", title: "Repository deletes", say: "No agent deletes a repository, with or without approval.", with: ["irreversible.approval"],
      src: `// No agent deletes a repository. A person does it.
@id("repo.delete-never")
forbid (principal, action == Action::"github__delete_repository", resource);`,
      tests: [
        { agent: "a-intel.core.release-manager", tool: "github__delete_repository", facts: "not approved", expect: "deny" },
        { agent: "a-intel.core.release-manager", tool: "github__delete_repository", facts: "approved", ctx: { approval: { granted: true, approvers: 1 } }, expect: "deny" },
      ] },
  ] },
  { id: "money", title: "Money", examples: [
    { id: "refund.over-500", title: "Refunds above $500", say: "A refund above $500 parks for approval.",
      src: `// A refund above $500 parks for approval.
@id("refund.over-500")
@decision("require_approval")
forbid (principal, action == Action::"stripe__create_refund", resource)
when { context.args has amount_cents && context.args.amount_cents > 50000 }
unless { context.approval.granted };`,
      tests: [
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_refund", facts: "$120.00", ctx: { args: { amount_cents: 12000 } }, expect: "allow" },
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_refund", facts: "$720.00", ctx: { args: { amount_cents: 72000 } }, expect: "approval" },
      ] },
    { id: "payment.vendor-list", title: "Known counterparties", say: "A payment goes only to a counterparty on the vendor list.",
      src: `// A payment goes only to a counterparty on the vendor list.
@id("payment.vendor-list")
forbid (principal, action == Action::"stripe__create_payment", resource)
unless { context.args has counterparty && context.args.counterparty like "vendor:*" };`,
      tests: [
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "counterparty vendor:aws", ctx: { args: { counterparty: "vendor:aws" } }, expect: "allow" },
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "counterparty acct:unknown", ctx: { args: { counterparty: "acct:unknown" } }, expect: "deny" },
      ] },
    { id: "payment.quote-first", title: "Quote before payment", say: "A payment is denied unless the same run already priced it.",
      src: `// A payment is denied unless the same run already priced it.
@id("payment.quote-first")
forbid (principal, action == Action::"stripe__create_payment", resource)
unless { context.run.prior_calls.contains("stripe__list_prices") };`,
      tests: [
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "stripe__list_prices called earlier in the run", ctx: { run: { prior_calls: ["stripe__list_prices"] } }, expect: "allow" },
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "no price lookup in the run", expect: "deny" },
      ] },
    { id: "money.business-hours", title: "Business hours for money", say: "Money moves only on a weekday between 09:00 and 17:00 UTC.",
      src: `// Money moves only on a weekday between 09:00 and 17:00 UTC.
@id("money.business-hours")
forbid (principal, action, resource)
when { context.tool.financial_class == "moves_funds" }
unless {
  context.time.weekday &&
  context.time.hour_utc >= 9 &&
  context.time.hour_utc < 17
};`,
      tests: [
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_refund", facts: "Tuesday 11:00 UTC", expect: "allow" },
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_refund", facts: "Saturday 11:00 UTC", ctx: { time: { weekday: false } }, expect: "deny" },
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_refund", facts: "Tuesday 18:00 UTC", ctx: { time: { hour_utc: 18 } }, expect: "deny" },
      ] },
    { id: "mandate.remaining", title: "Mandate balance", say: "A payment larger than what is left on its mandate is denied.",
      src: `// A payment larger than what is left on its mandate is denied.
@id("mandate.remaining")
forbid (principal, action, resource)
when {
  context.tool.financial_class == "moves_funds" &&
  context has mandate &&
  context.args has amount_cents &&
  context.args.amount_cents > context.mandate.remaining_cents
};`,
      tests: [
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "$200.00, $250.00 left on the mandate", ctx: { args: { amount_cents: 20000 }, mandate: { remaining_cents: 25000 } }, expect: "allow" },
        { agent: "a-intel.finops.invoice-bot", tool: "stripe__create_payment", facts: "$900.00, $250.00 left on the mandate", ctx: { args: { amount_cents: 90000 }, mandate: { remaining_cents: 25000 } }, expect: "deny" },
      ] },
    { id: "spend.finops-only", title: "Committed spend", say: "Only an agent in the finops workspace may call a tool that commits spend.",
      src: `// Only an agent in finops may call a tool that commits spend.
@id("spend.finops-only")
forbid (principal, action, resource)
when { context.tool.financial_class == "commits_spend" }
unless { principal in Workspace::"finops" };`,
      tests: [
        { agent: "a-intel.finops.invoice-bot", tool: "aws_billing__purchase_savings_plan", facts: "workspace finops", expect: "allow" },
        { agent: "a-intel.core.cost-analyst", tool: "aws_billing__purchase_savings_plan", facts: "workspace core-platform", expect: "deny" },
      ] },
  ] },
  { id: "data", title: "Data", examples: [
    { id: "taint.shell", title: "Web content and the shell", say: "Content fetched from the web may not reach a shell command.",
      src: `// Content fetched from the web may not reach a shell command.
@id("taint.shell")
forbid (principal, action == Action::"claude_code__Bash", resource)
when { context.taint.sources.contains("web") };`,
      tests: [
        { agent: "a-intel.core.stella-ci", tool: "claude_code__Bash", facts: "no tainted input", expect: "allow" },
        { agent: "a-intel.core.stella-ci", tool: "claude_code__Bash", facts: "input from a web page", ctx: { taint: { tainted: true, sources: ["web"] } }, expect: "deny" },
      ] },
    { id: "taint.write-approval", title: "Tainted writes", say: "Any write made with tainted input parks for approval.",
      src: `// Any write made with tainted input parks for approval.
@id("taint.write-approval")
@decision("require_approval")
forbid (principal, action, resource)
when { context.taint.tainted && context.tool.side_effect != "read" }
unless { context.approval.granted };`,
      tests: [
        { agent: "a-intel.core.triage", tool: "linear__update_issue", facts: "no tainted input", expect: "allow" },
        { agent: "a-intel.core.triage", tool: "linear__update_issue", facts: "input from a tool result", ctx: { taint: { tainted: true, sources: ["tool_result"] } }, expect: "approval" },
      ] },
    { id: "taint.recipients", title: "Tainted recipients", say: "A call with tainted input may not send anything to a domain outside a-intel.",
      src: `// A call with tainted input may not send anything outside a-intel.
@id("taint.recipients")
forbid (principal, action, resource)
when {
  context.taint.tainted &&
  context.args has recipient_domain &&
  !["a-intel.com", "a-intel.example"].contains(context.args.recipient_domain)
};`,
      tests: [
        { agent: "a-intel.core.triage", tool: "slack__upload_file", facts: "tainted, recipient a-intel.com", ctx: { taint: { tainted: true, sources: ["email"] }, args: { recipient_domain: "a-intel.com" } }, expect: "allow" },
        { agent: "a-intel.core.triage", tool: "slack__upload_file", facts: "tainted, recipient partner.io", ctx: { taint: { tainted: true, sources: ["email"] }, args: { recipient_domain: "partner.io" } }, expect: "deny" },
      ] },
    { id: "pii.no-write", title: "Customer PII fields", say: "A support tool may read a customer's contact fields and may not write them.",
      src: `// A support tool may not write a customer's contact fields.
@id("pii.no-write")
forbid (principal, action == Action::"zendesk__update_ticket", resource)
when {
  context.args has fields &&
  context.args.fields.containsAny(["email", "phone", "address"])
};`,
      tests: [
        { agent: "a-intel.core.triage", tool: "zendesk__update_ticket", facts: "fields status and priority", ctx: { args: { fields: ["status", "priority"] } }, expect: "allow" },
        { agent: "a-intel.core.triage", tool: "zendesk__update_ticket", facts: "fields status and email", ctx: { args: { fields: ["status", "email"] } }, expect: "deny" },
      ] },
    { id: "warehouse.raw-pii", title: "Raw PII schema", say: "A warehouse query may not read the raw_pii schema.",
      src: `// A warehouse query may not read the raw_pii schema.
@id("warehouse.raw-pii")
forbid (principal, action == Action::"snowflake__run_query", resource)
when { context.args has schema && context.args.schema == "raw_pii" };`,
      tests: [
        { agent: "a-intel.core.stella-ci", tool: "snowflake__run_query", facts: "schema analytics", ctx: { args: { schema: "analytics" } }, expect: "allow" },
        { agent: "a-intel.core.stella-ci", tool: "snowflake__run_query", facts: "schema raw_pii", ctx: { args: { schema: "raw_pii" } }, expect: "deny" },
      ] },
  ] },
  { id: "code", title: "Code", examples: [
    { id: "pr.own-org", title: "Pull requests in a-intel", say: "A pull request may target only a repository that belongs to a-intel.",
      src: `// A pull request may target only a repository in a-intel.
@id("pr.own-org")
forbid (principal, action == Action::"github__create_pull_request", resource)
unless { context.args has repository && context.args.repository like "a-intel/*" };`,
      tests: [
        { agent: "a-intel.core.stella-ci", tool: "github__create_pull_request", facts: "repository a-intel/platform", ctx: { args: { repository: "a-intel/platform" } }, expect: "allow" },
        { agent: "a-intel.core.stella-ci", tool: "github__create_pull_request", facts: "repository octo/fork", ctx: { args: { repository: "octo/fork" } }, expect: "deny" },
      ] },
    { id: "workflows.approval", title: "Workflow files", say: "A change to a CI workflow file parks for approval.",
      src: `// A change to a CI workflow file parks for approval.
@id("workflows.approval")
@decision("require_approval")
forbid (
  principal,
  action in [Action::"claude_code__Edit", Action::"github__create_pull_request"],
  resource
)
when { context.args has path && context.args.path like ".github/workflows/*" }
unless { context.approval.granted };`,
      tests: [
        { agent: "a-intel.core.stella-ci", tool: "claude_code__Edit", facts: "path src/index.ts", ctx: { args: { path: "src/index.ts" } }, expect: "allow" },
        { agent: "a-intel.core.stella-ci", tool: "claude_code__Edit", facts: "path .github/workflows/ci.yml", ctx: { args: { path: ".github/workflows/ci.yml" } }, expect: "approval" },
      ] },
    { id: "docs-writer.docs-only", title: "The docs writer's paths", say: "The docs writer edits files under docs/ and nowhere else.",
      src: `// The docs writer edits files under docs/ and nowhere else.
@id("docs-writer.docs-only")
forbid (
  principal == Agent::"a-intel.core.docs-writer",
  action == Action::"claude_code__Edit",
  resource
)
unless { context.args has path && context.args.path like "docs/*" };`,
      tests: [
        { agent: "a-intel.core.docs-writer", tool: "claude_code__Edit", facts: "path docs/policy.md", ctx: { args: { path: "docs/policy.md" } }, expect: "allow" },
        { agent: "a-intel.core.docs-writer", tool: "claude_code__Edit", facts: "path src/index.ts", ctx: { args: { path: "src/index.ts" } }, expect: "deny" },
      ] },
    { id: "branch.read-before-delete", title: "Read before delete", say: "A branch delete needs a read of the same branch earlier in the run.",
      src: `// A branch delete needs a read of the same branch earlier in the run.
@id("branch.read-before-delete")
forbid (principal, action == Action::"github__delete_branch", resource)
unless {
  context.args has branch &&
  context.run.prior_reads.contains(context.args.branch)
};`,
      tests: [
        { agent: "a-intel.core.stella-ci", tool: "github__delete_branch", facts: "branch agent/fix-482, read earlier in the run", ctx: { args: { branch: "agent/fix-482" }, run: { prior_reads: ["agent/fix-482"] } }, expect: "allow" },
        { agent: "a-intel.core.stella-ci", tool: "github__delete_branch", facts: "branch agent/fix-482, never read", ctx: { args: { branch: "agent/fix-482" } }, expect: "deny" },
      ] },
    { id: "mobile.release-branch", title: "Mobile releases", say: "A release of a-intel/mobile is cut only from the release branch.",
      src: `// A release of a-intel/mobile is cut only from the release branch.
@id("mobile.release-branch")
forbid (principal, action == Action::"github__create_release", resource)
when { context.args has repository && context.args.repository == "a-intel/mobile" }
unless { context.args has branch && context.args.branch == "release" };`,
      tests: [
        { agent: "a-intel.core.release-manager", tool: "github__create_release", facts: "a-intel/mobile, branch release", ctx: { args: { repository: "a-intel/mobile", branch: "release" } }, expect: "allow" },
        { agent: "a-intel.core.release-manager", tool: "github__create_release", facts: "a-intel/mobile, branch main", ctx: { args: { repository: "a-intel/mobile", branch: "main" } }, expect: "deny" },
      ] },
  ] },
  { id: "production", title: "Production", examples: [
    { id: "prod.sre", title: "Production cluster", say: "A call against prod-east needs an operator with the sre role.", with: ["irreversible.approval"],
      src: `// A call against prod-east needs an operator with the sre role.
@id("prod.sre")
forbid (principal, action, resource)
when { context.args has cluster && context.args.cluster == "prod-east" }
unless { context.operator.role == "sre" };`,
      tests: [
        { agent: "a-intel.core.release-manager", tool: "kubernetes__delete_pod", facts: "prod-east, operator a developer", ctx: { args: { cluster: "prod-east" } }, expect: "deny" },
        { agent: "a-intel.core.release-manager", tool: "kubernetes__delete_pod", facts: "prod-east, operator an sre", ctx: { args: { cluster: "prod-east" }, operator: { role: "sre" } }, expect: "approval" },
        { agent: "a-intel.core.release-manager", tool: "kubernetes__delete_pod", facts: "prod-east, operator an sre, approved", ctx: { args: { cluster: "prod-east" }, operator: { role: "sre" }, approval: { granted: true, approvers: 1 } }, expect: "allow" },
      ] },
  ] },
  { id: "budget", title: "Budget and rate", examples: [
    { id: "budget.low-read-only", title: "Low budget", say: "A run with less than $1 of budget left may only read.",
      src: `// A run with less than $1 of budget left may only read.
@id("budget.low-read-only")
forbid (principal, action, resource)
when {
  context.budget.remaining_cents < 100 &&
  context.tool.side_effect != "read"
};`,
      tests: [
        { agent: "a-intel.core.triage", tool: "linear__update_issue", facts: "$12.00 left", ctx: { budget: { remaining_cents: 1200 } }, expect: "allow" },
        { agent: "a-intel.core.triage", tool: "linear__update_issue", facts: "$0.40 left", ctx: { budget: { remaining_cents: 40 } }, expect: "deny" },
        { agent: "a-intel.core.triage", tool: "github__get_file_contents", facts: "$0.40 left, a read", ctx: { budget: { remaining_cents: 40 } }, expect: "allow" },
      ] },
    { id: "slack.rate", title: "Slack post rate", say: "No agent posts to Slack more than 20 times in an hour.",
      src: `// No agent posts to Slack more than 20 times in an hour.
@id("slack.rate")
forbid (principal, action == Action::"slack__post_message", resource)
when { context.rate.calls_last_hour >= 20 };`,
      tests: [
        { agent: "a-intel.core.triage", tool: "slack__post_message", facts: "19 posts in the last hour", ctx: { rate: { calls_last_hour: 19 } }, expect: "allow" },
        { agent: "a-intel.core.triage", tool: "slack__post_message", facts: "20 posts in the last hour", ctx: { rate: { calls_last_hour: 20 } }, expect: "deny" },
      ] },
  ] },
  { id: "versions", title: "Tool versions", examples: [
    { id: "tool.version-hold", title: "A held tool version", say: "One version of a tool is held until its schema change is reviewed. Other versions run.",
      src: `// Hold github__create_pull_request@3 until its schema change is reviewed.
@id("tool.version-hold")
forbid (principal, action == Action::"github__create_pull_request", resource)
when { context.tool.version == "3" };`,
      tests: [
        { agent: "a-intel.core.stella-ci", tool: "github__create_pull_request", facts: "version 3", expect: "deny" },
        { agent: "a-intel.core.stella-ci", tool: "github__create_pull_request", version: "4", facts: "version 4", ctx: { tool: { version: "4" } }, expect: "allow" },
      ] },
  ] },
];

// Patterns to avoid. Each one's problem is shown by Cedar itself: a parse error, a validation
// error, or a decision that is not the one the author meant.
const AVOID = [
  { id: "avoid.no-has", title: "An optional argument read without has", say: "An argument a call may not carry has to be tested with has before it is read. The validator refuses the rule otherwise.",
    kind: "validate",
    src: `@id("avoid.no-has")
@decision("require_approval")
forbid (principal, action == Action::"stripe__create_refund", resource)
when { context.args.amount_cents > 50000 }
unless { context.approval.granted };`,
    fix: "refund.over-500" },
  { id: "avoid.unknown-path", title: "A context path the schema does not hold", say: "A misspelled path is a validation error, so the rule never reaches a version.",
    kind: "validate",
    src: `@id("avoid.unknown-path")
@decision("require_approval")
forbid (principal, action, resource)
when { context.tool.side_efect == "irreversible" }
unless { context.approval.granted };`,
    fix: "irreversible.approval" },
  { id: "avoid.third-effect", title: "An effect Cedar does not have", say: "Cedar has two effects, permit and forbid. A rule that needs a person is a forbid with @decision(\"require_approval\").",
    kind: "parse",
    src: `@id("avoid.third-effect")
permit (principal, action, resource)
when { context.tool.side_effect == "irreversible" }
advice "require_approval";`,
    fix: "irreversible.approval" },
  { id: "avoid.no-unless", title: "An approval rule with no unless", say: "Without unless { context.approval.granted }, the rule still applies after a person approves, so the call never runs.",
    kind: "authorize",
    src: `@id("avoid.no-unless")
@decision("require_approval")
forbid (principal, action, resource)
when { context.tool.side_effect == "irreversible" };`,
    tests: [
      { agent: "a-intel.core.release-manager", tool: "github__create_release", facts: "approved", ctx: { approval: { granted: true, approvers: 1 } }, expect: "approval" },
    ],
    fix: "irreversible.approval" },
  { id: "avoid.restated-grant", title: "A grant restated as a rule", say: "A permit that repeats a toolbelt grant outlives the grant. The toolbelt below no longer lists the tool, and the rule still allows the call.",
    kind: "authorize",
    src: `@id("avoid.restated-grant")
permit (
  principal == Agent::"a-intel.core.triage",
  action == Action::"github__create_release",
  resource
);`,
    tests: [
      { agent: "a-intel.core.triage", tool: "github__create_release", facts: "not on the toolbelt", expect: "allow" },
    ],
    fix: null },
];

/* ---------------------------------------------------------------- evaluation */

const ALL_EXAMPLES = GROUPS.flatMap((g) => g.examples);
const byId = Object.fromEntries(ALL_EXAMPLES.map((e) => [e.id, e]));
const idOf = (src) => /@id\("([^"]+)"\)/.exec(src)[1];
const approvalIds = new Set();
for (const src of [BASELINE, ...ALL_EXAMPLES.map((e) => e.src), ...AVOID.map((a) => a.src)])
  if (/@decision\("require_approval"\)/.test(src)) approvalIds.add(idOf(src));

const fail = (m) => { console.error("FAIL " + m); process.exitCode = 1; };
const errText = (errs) => errs.map((e) => e.error ? e.error.message : e.message).join("; ");

// The schema parses, and every example validates with the baseline in strict mode.
{
  const s = cedar.checkParseSchema(SCHEMA);
  if (s.type !== "success") { fail("schema: " + errText(s.errors)); process.exit(1); }
  const policies = Object.fromEntries([[idOf(BASELINE), BASELINE], ...ALL_EXAMPLES.map((e) => [e.id, e.src])]);
  const v = cedar.validate({ schema: SCHEMA, policies: { staticPolicies: policies }, validationSettings: { mode: "strict" } });
  if (v.type !== "success") fail("validate: " + errText(v.errors));
  else if (v.validationErrors.length) fail("validate: " + v.validationErrors.map((e) => e.policyId + ": " + e.error.message).join(" | "));
  for (const e of ALL_EXAMPLES) if (idOf(e.src) !== e.id) fail(e.id + ": its @id reads " + idOf(e.src));
}

const ENTITIES = [
  ...[...new Set(Object.values(AGENTS).map((a) => a.ws))].map((ws) => ({ uid: { type: "Workspace", id: ws }, attrs: {}, parents: [] })),
  ...Object.entries(AGENTS).map(([id, a]) => ({ uid: { type: "Agent", id }, attrs: { toolbelt: a.belt }, parents: [{ type: "Workspace", id: a.ws }] })),
];

function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over || {})) out[k] = v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" ? merge(base[k], v) : v;
  return out;
}
function context(t) {
  const tool = TOOLS[t.tool];
  if (!tool) throw new Error("unknown tool " + t.tool);
  return merge({
    tool: { name: t.tool, ...tool },
    args: {},
    taint: { tainted: false, sources: [] },
    time: { hour_utc: 11, weekday: true },
    rate: { calls_last_hour: 0, calls_last_minute: 0 },
    run: { prior_calls: [], prior_reads: [] },
    operator: { role: "developer" },
    tier: "gateway",
    budget: { remaining_cents: 5000 },
    approval: { granted: false, approvers: 0 },
  }, t.ctx);
}
// Cedar says allow or deny, and names the rules that decided. Oxagen parks the call for a person
// when every rule that denied it carries @decision("require_approval"), and denies it otherwise.
function decide(t, policies, label) {
  const a = cedar.isAuthorized({
    principal: { type: "Agent", id: t.agent }, action: { type: "Action", id: t.tool }, resource: { type: "Target", id: "call" },
    context: context(t), schema: SCHEMA, validateRequest: true, policies: { staticPolicies: policies }, entities: ENTITIES,
  });
  if (a.type !== "success") { fail(label + ": " + errText(a.errors)); return null; }
  const { decision, diagnostics } = a.response;
  if (diagnostics.errors.length) fail(label + ": evaluation error " + diagnostics.errors.map((e) => e.policyId + " " + e.error.message).join(" | "));
  const by = [...diagnostics.reason].sort();
  const oxagen = decision === "allow" ? "allow" : by.length && by.every((id) => approvalIds.has(id)) ? "approval" : "deny";
  if (oxagen !== t.expect) fail(`${label}: expected ${t.expect}, Cedar says ${decision} by [${by.join(", ")}], which reads ${oxagen}`);
  return { cedar: decision, by, oxagen };
}
const policySet = (ids, extra) => Object.fromEntries([[idOf(BASELINE), BASELINE], ...ids.map((id) => [id, byId[id].src]), ...(extra ? [[idOf(extra), extra]] : [])]);

let nTests = 0;
for (const e of ALL_EXAMPLES) {
  const set = policySet([e.id, ...(e.with || [])]);
  e.results = e.tests.map((t, i) => { nTests++; return decide(t, set, `${e.id} test ${i + 1}`); });
}
for (const a of AVOID) {
  if (a.kind === "parse") {
    const r = cedar.checkParsePolicySet({ staticPolicies: { [a.id]: a.src } });
    if (r.type === "success") fail(a.id + ": expected a parse error");
    else a.error = r.errors[0].message;
  } else if (a.kind === "validate") {
    const v = cedar.validate({ schema: SCHEMA, policies: { staticPolicies: { [a.id]: a.src } }, validationSettings: { mode: "strict" } });
    const errs = v.type === "success" ? v.validationErrors.map((x) => x.error.message) : v.errors.map((x) => x.message);
    if (!errs.length) fail(a.id + ": expected a validation error");
    else a.error = errs[0];
  } else {
    a.results = a.tests.map((t, i) => { nTests++; return decide(t, policySet([], a.src), `${a.id} test ${i + 1}`); });
  }
  if (a.fix && !byId[a.fix]) fail(a.id + ": fix names " + a.fix);
}
if (process.exitCode) process.exit(1);

/* ---------------------------------------------------------------- the page */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const KW = new Set(["permit", "forbid", "when", "unless", "principal", "action", "resource", "context", "in", "has", "like", "is", "if", "then", "else", "entity", "type", "appliesTo"]);
// A highlighter for the Cedar on this page: comments, annotations, strings, entity types, keywords and numbers.
function hl(src) {
  const re = /(\/\/[^\n]*)|(@\w+)|("(?:[^"\\\n]|\\.)*")|\b([A-Z]\w*)(?=::|\b)|\b([a-z_]\w*)\b|(\b\d+\b)/g;
  let out = "", last = 0, m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index));
    const t = esc(m[0]);
    if (m[1]) out += `<span class="c">${t}</span>`;
    else if (m[2]) out += `<span class="a">${t}</span>`;
    else if (m[3]) out += `<span class="s">${t}</span>`;
    else if (m[4]) out += `<span class="t">${t}</span>`;
    else if (m[5]) out += KW.has(m[5]) ? `<span class="k">${t}</span>` : t;
    else out += `<span class="n">${t}</span>`;
    last = re.lastIndex;
  }
  return out + esc(src.slice(last));
}
const WORD = { allow: "allow", approval: "require approval", deny: "deny" };
const dec = (d) => `<span class="dec dec-${d}">${WORD[d]}</span>`;
const code = (src) => `<div class="code"><pre><code>${hl(src)}</code></pre></div>`;
const ids = (by) => by.length ? by.map((x) => `<code>${esc(x)}</code>`).join(" ") : `<span class="quiet">no rule permits it</span>`;

function testTable(tests, results) {
  return `<div class="tbl"><table>
<thead><tr><th>Call</th><th>Facts</th><th>Cedar</th><th>Decided by</th><th>Oxagen</th></tr></thead>
<tbody>${tests.map((t, i) => {
    const r = results[i];
    return `<tr><td><code>${esc(t.tool)}@${esc(t.version || TOOLS[t.tool].version)}</code><span class="agent">${esc(t.agent)}</span></td><td>${esc(t.facts || "none")}</td><td><code>${r.cedar}</code></td><td>${ids(r.by)}</td><td>${dec(r.oxagen)}</td></tr>`;
  }).join("\n")}</tbody></table></div>`;
}

function exampleCard(e) {
  return `<article class="ex" id="${e.id}">
<h3>${esc(e.title)}</h3>
<p>${esc(e.say)}</p>
${code(e.src)}
${e.with ? `<p class="with">Tested beside ${e.with.map((w) => `<a href="#${w}"><code>${w}</code></a>`).join(" and ")} and the toolbelt grant.</p>` : ""}
${testTable(e.tests, e.results)}
</article>`;
}

function avoidCard(a) {
  const shown = a.kind === "authorize" ? testTable(a.tests, a.results)
    : `<div class="err"><span class="err-k">${a.kind === "parse" ? "Parse error" : "Validation error"}</span><code>${esc(a.error)}</code></div>`;
  return `<article class="ex" id="${a.id}">
<h3>${esc(a.title)}</h3>
<p>${esc(a.say)}</p>
${code(a.src)}
${shown}
${a.fix ? `<p class="with">Written correctly in <a href="#${a.fix}">${esc(byId[a.fix].title)}</a>.</p>` : ""}
</article>`;
}

const NAV = [["decision", "How a call is decided"], ["schema", "Schema"], ...GROUPS.map((g) => [g.id, g.title]), ["avoid", "Patterns to avoid"]];
const cedarVersion = cedar.getCedarVersion(), langVersion = cedar.getCedarLangVersion();

const TITLE = "Agent policy spec";
const HEAD = `<title>${TITLE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap">
<style>
/* Tokens: the oxagen house palette, dark first, with the white theme intact. */
:root{
  color-scheme:dark;
  --ink:#09090B; --panel:#18181B; --hl:#27272A; --border:#27272A; --rule:#3F3F46; --code:#0E0E11;
  --fg:#FFFFFF; --body:#E4E4E7; --muted:#A1A1AA; --dim:#71717A;
  --gold:#D4AF37; --accent-text:#D4AF37;
  --allowed:#57A97C; --approval:#5B93D6; --denied:#C66A4A;
  --tk-c:#8B8B94; --tk-a:#C4A6F2; --tk-s:#7CC4A0; --tk-t:#6FB3E8; --tk-k:#E8A96F; --tk-n:#E8D06F;
}
@media (prefers-color-scheme: light){
  :root:not([data-theme="dark"]){
    color-scheme:light;
    --ink:#FFFFFF; --panel:#FFFFFF; --hl:#F4F4F5; --border:#E4E4E7; --rule:#D4D4D8; --code:#FAFAFA;
    --fg:#09090B; --body:#27272A; --muted:#71717A; --dim:#A1A1AA;
    --accent-text:#8A7223;
    --allowed:#2F7D52; --approval:#2E6BA8; --denied:#9B4526;
    --tk-c:#6B6B73; --tk-a:#6E4BB0; --tk-s:#2F7D52; --tk-t:#2E6BA8; --tk-k:#A5531A; --tk-n:#8A6A00;
  }
}
:root[data-theme="light"]{
  color-scheme:light;
  --ink:#FFFFFF; --panel:#FFFFFF; --hl:#F4F4F5; --border:#E4E4E7; --rule:#D4D4D8; --code:#FAFAFA;
  --fg:#09090B; --body:#27272A; --muted:#71717A; --dim:#A1A1AA;
  --accent-text:#8A7223;
  --allowed:#2F7D52; --approval:#2E6BA8; --denied:#9B4526;
  --tk-c:#6B6B73; --tk-a:#6E4BB0; --tk-s:#2F7D52; --tk-t:#2E6BA8; --tk-k:#A5531A; --tk-n:#8A6A00;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:64px}
body{margin:0;background:var(--ink);color:var(--body);font:15px/1.6 "Geist",system-ui,-apple-system,"Segoe UI",sans-serif;padding-inline:16px;padding-block:0 96px}
.wrap{max-width:1120px;margin-inline:auto}
h1,h2,h3{font-family:"Space Grotesk","Geist",system-ui,sans-serif;color:var(--fg);text-wrap:balance;line-height:1.2;font-weight:600;margin:0}
h1{font-size:clamp(32px,5vw,46px);letter-spacing:-.02em;font-weight:700}
h2{font-size:clamp(24px,3.2vw,28px);letter-spacing:-.01em}
h3{font-size:20px}
p{margin:0;max-width:72ch}
a{color:inherit;text-decoration-color:var(--rule);text-underline-offset:3px}
a:hover{text-decoration-color:currentColor}
a:focus-visible{outline:2px solid var(--gold);outline-offset:2px;border-radius:3px}
code,pre{font-family:"Monaspace Neon","Geist Mono",ui-monospace,"SF Mono",Menlo,monospace;font-feature-settings:"calt","liga"}
code{font-size:.88em}
.quiet{color:var(--muted)}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500}
.eyebrow.first{color:var(--accent-text)}
header.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-block:20px;border-bottom:1px solid var(--border)}
.wm{font-family:"Space Grotesk","Geist",sans-serif;font-weight:700;font-size:22px;color:var(--fg);letter-spacing:-.02em}
.wm b{color:var(--gold);font-weight:700}
.tag{font-family:"Geist Mono",ui-monospace,monospace;font-size:12px;color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:2px 8px}
.hero{display:grid;gap:14px;padding-block:44px 28px}
.lead{font-size:17px;color:var(--body)}
.note{border-left:2px solid var(--rule);padding:4px 0 4px 14px;color:var(--muted);font-size:14px;max-width:80ch}
.note b{color:var(--body);font-weight:600}
.meta{font-size:13px;color:var(--muted)}
nav.sub{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--ink);border-bottom:1px solid var(--border);margin-inline:-16px;padding:10px 16px;overflow-x:auto;scrollbar-width:thin}
nav.sub ol{display:flex;gap:6px;list-style:none;margin:0 auto;padding:0;max-width:1120px;white-space:nowrap}
nav.sub a{display:inline-block;font-size:13px;color:var(--muted);text-decoration:none;padding:5px 10px;border-radius:999px;border:1px solid transparent}
nav.sub a:hover{color:var(--fg);border-color:var(--border)}
section{display:grid;gap:16px;padding-block:44px;border-top:1px solid var(--border)}
section:first-of-type{border-top:0}
.sec-h{display:grid;gap:6px}
ol.steps{margin:0;padding:0;list-style:none;display:grid;gap:10px;counter-reset:s;max-width:80ch}
ol.steps li{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start}
ol.steps li::before{counter-increment:s;content:counter(s);font-family:"Geist Mono",monospace;font-size:12px;width:24px;height:24px;display:grid;place-items:center;border:1px solid var(--rule);border-radius:4px;color:var(--fg);margin-top:1px}
.shapes{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:14px}
.code{background:var(--code);border:1px solid var(--border);border-radius:10px;overflow-x:auto}
.code pre{margin:0;padding:14px 16px;font-size:13px;line-height:1.6;color:var(--body);tab-size:2}
.code .c{color:var(--tk-c);font-style:italic}.code .a{color:var(--tk-a)}.code .s{color:var(--tk-s)}.code .t{color:var(--tk-t)}.code .k{color:var(--tk-k)}.code .n{color:var(--tk-n)}
.tbl{border:1px solid var(--border);border-radius:10px;overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
th{background:var(--hl);color:var(--muted);font-weight:500;font-size:12px;text-align:left;padding:8px 12px;white-space:nowrap}
td{padding:9px 12px;border-top:1px solid var(--border);vertical-align:top}
td code{color:var(--fg)}
td .agent{display:block;font-family:"Geist Mono",ui-monospace,monospace;font-size:11.5px;color:var(--muted);margin-top:2px}
.fields td:first-child{white-space:nowrap}
/* A decision reads as a word and a border shape: allowed double, approval dashed, denied single. */
.dec{display:inline-block;white-space:nowrap;font-size:12.5px;font-weight:500;line-height:1;padding:5px 9px;border-radius:6px}
.dec-allow{border:3px double var(--allowed);color:var(--allowed);padding:3px 7px}
.dec-approval{border:1px dashed var(--approval);color:var(--approval)}
.dec-deny{border:1px solid var(--denied);color:var(--denied)}
.grid{display:grid;gap:16px}
.ex{display:grid;gap:12px;padding:20px;border:1px solid var(--border);border-radius:12px;background:var(--panel);min-width:0}
.ex p{color:var(--body)}
.ex .with{font-size:13.5px;color:var(--muted)}
.err{display:grid;gap:6px;border:1px solid var(--denied);border-radius:10px;padding:12px 14px}
.err-k{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--denied);font-weight:500}
.err code{color:var(--body);white-space:pre-wrap;word-break:break-word}
footer{border-top:1px solid var(--border);padding-block:28px;color:var(--muted);font-size:13.5px;display:grid;gap:8px}
@media (min-width:980px){.grid.two{grid-template-columns:1fr 1fr}}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
</style>`;

const BODY = `<div class="wrap">
<header class="top"><span class="wm">o<b>x</b>agen</span><span class="tag">policy spec</span></header>
<div class="hero">
  <p class="eyebrow first">Tool policy</p>
  <h1>Agent policy spec</h1>
  <p class="lead">A policy decides each tool call an agent asks for: allowed, denied, or parked until a person approves it. The rules are written in Cedar, and the gateway evaluates the active version for every call routed through Oxagen, with no model in the decision. On the harness tier the hook refuses a call and fails open. On the observe tier nothing is refused, and the call is recorded.</p>
  <p class="note"><b>Status: proposed.</b> §6.12 of the mission control spec decides that tool policy is Cedar, deterministic, versioned, and tested, and ADR 0004 says why Cedar. The schema, the <code>@decision</code> annotation, the way Oxagen reads a denial, and the toolbelt grant below are proposed in <a href="https://github.com/macanderson/oxagen-roadmap/pull/127">PR 127</a> and on this page. None of them is decided.</p>
  <p class="meta">${ALL_EXAMPLES.length} examples and ${nTests} tests. Every decision on this page was computed by Cedar ${esc(cedarVersion)} (language ${esc(langVersion)}) through <code>@cedar-policy/cedar-wasm</code>, with every rule validated against the schema in strict mode. Reviewed ${AS_OF}. Built by <code>tools/build-policy-spec.mjs</code>.</p>
</div>
<nav class="sub" aria-label="Sections"><ol>${NAV.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join("")}</ol></nav>

<section id="decision">
  <div class="sec-h"><p class="eyebrow">Evaluation</p><h2>How a call is decided</h2></div>
  <ol class="steps">
    <li><p>The gateway builds a request for the call. The principal is the agent, the action is the tool, the resource is what the call acts on, and the context holds the call's facts.</p></li>
    <li><p>Cedar evaluates every rule in the active version. A <code>forbid</code> that applies wins over every <code>permit</code>. When no rule permits the call, Cedar denies it.</p></li>
    <li><p>When Cedar denies a call, it names the rules that decided. If every one of them carries <code>@decision("require_approval")</code>, the gateway parks the call for a person. Otherwise the call is denied.</p></li>
    <li><p>When a person approves, the gateway asks again with <code>context.approval.granted</code> set to true. The approval rules stop applying, and the call runs only if a rule permits it. An approval never grants what no rule permits, and it never lifts a <code>forbid</code> that has no <code>unless</code> for it.</p></li>
  </ol>
  <div class="shapes"><span>Each decision reads as a word and a shape:</span>${dec("allow")}${dec("approval")}${dec("deny")}</div>
  <p>Every test on this page runs against the rule it illustrates plus the toolbelt grant, a permit Oxagen compiles from each agent's toolbelt. §6.12 says a version compiles from the rules written for it, the enforcement grants on each agent, and the role grants on each operator, so a grant is never written again as a rule.</p>
  ${code(BASELINE)}
  <div class="tbl"><table><thead><tr><th>Agent</th><th>Workspace</th><th>Toolbelt</th></tr></thead><tbody>
  ${Object.entries(AGENTS).map(([id, a]) => `<tr><td><code>${esc(id)}</code></td><td><code>${esc(a.ws)}</code></td><td>${a.belt.map((b) => `<code>${esc(b)}</code>`).join(", ")}</td></tr>`).join("\n")}
  </tbody></table></div>
</section>

<section id="schema">
  <div class="sec-h"><p class="eyebrow">Proposed</p><h2>Schema</h2><p>The shape of the request for one tool call. Validation against it catches a misspelled path, a missing <code>has</code>, or an undeclared tool before a version is saved.</p></div>
  <div class="tbl fields"><table><thead><tr><th>Context</th><th>Type</th><th>What fills it</th></tr></thead><tbody>
  ${CONTEXT_ROWS.map(([k, t, w]) => `<tr><td><code>context.${k}</code></td><td>${esc(t)}</td><td>${esc(w)}</td></tr>`).join("\n")}
  </tbody></table></div>
  ${code(SCHEMA.trim())}
</section>

${GROUPS.map((g) => `<section id="${g.id}">
  <div class="sec-h"><p class="eyebrow">Examples</p><h2>${esc(g.title)}</h2></div>
  <div class="grid">${g.examples.map(exampleCard).join("\n")}</div>
</section>`).join("\n\n")}

<section id="avoid">
  <div class="sec-h"><p class="eyebrow">Mistakes</p><h2>Patterns to avoid</h2><p>Each problem below is shown by Cedar itself: the parser, the validator, or a decision the author did not mean.</p></div>
  <div class="grid">${AVOID.map(avoidCard).join("\n")}</div>
</section>

<footer>
  <p>Sources: <code>docs/mission-control-spec.md</code> §6.12, <code>docs/oxagen/specs/tacho/design/adr-0004-tacho-policy-engine-cedar.md</code>, <code>docs/oxagen/specs/tacho/design/approval-tokens.md</code>, and PR 127 in this repository.</p>
  <p>To change an example, edit <code>tools/build-policy-spec.mjs</code> and run it. The build refuses a rule that does not validate and a test whose decision differs from the one it expects.</p>
</footer>
</div>`;

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Example agent policies in Cedar, with every decision computed by Cedar's evaluator against the proposed schema.">
${HEAD}
</head>
<body>
${BODY}
</body>
</html>
`;

if (CHECK) {
  let cur = "";
  try { cur = readFileSync(OUT, "utf8"); } catch { /* missing */ }
  if (cur !== PAGE) { console.error("DIFF oxagen-agent-policy-spec.html is not what tools/build-policy-spec.mjs writes. Run: node tools/build-policy-spec.mjs"); process.exit(1); }
  console.log(`ok   oxagen-agent-policy-spec.html (${ALL_EXAMPLES.length} examples, ${nTests} tests)`);
} else {
  writeFileSync(OUT, PAGE);
  console.log(`wrote oxagen-agent-policy-spec.html (${ALL_EXAMPLES.length} examples, ${nTests} tests, Cedar ${cedarVersion})`);
}
if (ARTIFACT) { writeFileSync(ARTIFACT, HEAD + "\n" + BODY + "\n"); console.log("wrote " + ARTIFACT); }
