---
doc: scope
status: approved
---

# ProofLayer

The Trust Compiler & Zero-Trust Policy Guard for Multi-Agent Systems.

## The Unique Kernel
ProofLayer replaces slow, non-deterministic LLM-as-a-judge guardrails (800ms+ latency, recurring token costs, jailbreakable) with a **sub-millisecond deterministic Trust Compiler**, **Anti-TOCTOU cryptographic payload hash binding**, and **Multi-Agent Provenance Tracking** that halts Confused Deputy privilege escalation at the tool boundary.

## Who It's For
AI Engineers and Platform Architects in 2026 deploying autonomous, tool-using multi-agent swarms (MCP, LangGraph, AutoGen) who need non-bypassable software safety boundaries and verifiable compliance (EU AI Act Article 14, ISO 42001) before putting agents in front of real tools, money, or infrastructure.

## The Multi-Agent Swarm Hierarchy & Permission Boundaries
ProofLayer enforces Zero-Trust across a formal Tri-Agent Swarm hierarchy:
1. **Analyst Subagent (`agent-analyst`)**:
   - **Tier**: `untrusted_reader` (Tier 1).
   - **Allowed Actions**: `doc.read`, `web.scrape`, `data.extract`.
   - **Boundary**: Completely barred from side-effecting financial (`payment.*`) or infrastructure (`cloud.*`, `database.*`) tools.
2. **Coordinator Subagent (`agent-coordinator`)**:
   - **Tier**: `worker` (Tier 2).
   - **Allowed Actions**: `workflow.plan`, `task.delegate`, `status.query`.
   - **Boundary**: Orchestrates tasks between subagents but cannot directly invoke high-privilege execution endpoints.
3. **Financial Executor Subagent (`agent-fin-exec`)**:
   - **Tier**: `executor` (Tier 3).
   - **Allowed Actions**: `payment.execute`, `invoice.verify`.
   - **Boundary**: Can execute autonomous payments $\le \$500$ ONLY IF the delegation chain is completely untainted by lower-tier agents. If any untrusted agent is present in the delegation chain, or if the amount exceeds $\$500$, execution is immediately halted.

## Confused Deputy & Invariant Enforcement Policy
When an indirect prompt injection in an external document tricks the `Analyst` into instructing the `Coordinator` to request a high-value payment (`payment.execute($1,200)`) via the `Executor`:
1. ProofLayer's MCP Proxy catches the call in `<2ms`.
2. Evaluates the provenance chain: `[Analyst: untrusted_reader] -> [Coordinator: worker] -> [Executor: executor]`.
3. Detects privilege escalation: `Analyst` does not hold the required `executor` tier.
4. **Hard-blocks autonomous execution** and renders the tainted chain in red/amber on the Evidence DAG.
5. Escalates to human administrator in ProofLayer Studio, allowing explicit review, modification, or rejection.
6. If the admin approves with a modified scope, the human signature is cryptographically bound (`HMAC-SHA256`) to the canonical `SHA-256` payload hash, preventing post-review parameter drift (Anti-TOCTOU).

## The Core Loop
1. **Define Intent**: Developer defines safety requirements in plain English (e.g. *"Payments > $500 require human review; scraper subagents cannot execute financial tools"*).
2. **Compile to Invariant AST**: Compiled once into strongly typed Zod/AST invariants evaluated locally in `<2ms` at `$0` runtime token cost.
3. **Intercept Tool Call**: An agent proposes a tool call; ProofLayer's MCP proxy intercepts the call, computes the canonical SHA-256 payload digest, and validates the subagent delegation chain.
4. **Enforce Boundary**:
   - If clean and below threshold: Tool executes instantly (`<2ms`).
   - If privilege escalation detected or threshold exceeded: Execution is immediately halted and held in the Studio Console.
5. **Cryptographic Human Sign-off**: Human reviewer signs an approval token cryptographically bound to the exact payload hash (preventing post-review parameter drift / TOCTOU).
6. **Immutable Evidence DAG**: Dispatches the tool and generates a Merkle-linked Evidence Graph with an exportable EU AI Act compliant Trust Receipt.

## Inspiration & Identity
- **Visual Aesthetic**: Modern high-density dark-mode telemetry control plane (Linear / Datadog cyber aesthetic).
- **Interactive Feel**: Real-time SSE live console with interactive React Flow DAG visualizing agent nodes, invariant evaluations, cryptographic signatures, and execution events.
- **References**: Model Context Protocol (MCP) by Anthropic, Open Policy Agent (OPA) architecture, and EU AI Act Article 14 standards.

## Why This Matters to the Learner
Engineered under the **Well-Architected Framework** (clean code, maintainability, orchestration, cost optimization, security, and sustainability) with zero AI slop, verified by **Test-Driven Development (TDD)** with 20/20 automated tests passing.

## What "Working" Looks Like
A live, reproducible demonstration where a low-privilege Scraper Subagent is tricked by an indirect prompt injection in an invoice and attempts cross-agent privilege escalation to an Executor Subagent calling `payment.execute($1,200)`. ProofLayer intercepts the call in `<2ms`, highlights the untrusted scraper in the React Flow DAG, holds for human review, cryptographically validates the approved hash, and produces an exportable Trust Receipt.

## The POC Boundary
- **In-Scope**:
  - `@prooflayer/core` engine (100% verified via TDD unit & adversarial test suites).
  - MCP tool proxy and TypeScript SDK decorator (`withProofLayer`).
  - SQLite database in WAL mode storing policies, requests, evaluations, approvals, and evidence nodes.
  - ProofLayer Studio (React 19 + Vite + Tailwind CSS + React Flow DAG).
  - Red-Team Sandbox with one-click swarm attack, TOCTOU parameter tampering, and routine pass-through simulations.
- **Later**:
  - Distributed multi-region consensus for policy deployment.
  - Hardware Security Module (HSM) signing.
  - Production banking webhooks (Stripe Live).
- **Explicitly Cut**:
  - Full enterprise SSO/SAML (unnecessary for hackathon PoC).
  - LLM runtime evaluation in the critical path (violates `<2ms` and `$0` token cost requirements).
  - Support for every legacy agent framework (standardized on MCP and TypeScript).
