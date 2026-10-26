# Devpost Submission — ProofLayer

Use this document to copy and paste directly into your Devpost hackathon project submission form for **Build With AI: Basics**.

---

### Project Title
**ProofLayer**

### Subtitle / Tagline (100 characters max)
**Don't trust what AI claims. Cryptographically verify what AI does.**

### Category / Track
**Developer Infrastructure & Agentic AI Safety (2026 Track)**

---

## 1. Inspiration

By 2026, autonomous multi-agent swarms have transitioned from conversational toys to mission-critical operational systems. AI agents now have direct access to financial rails (Stripe, wire transfers), cloud infrastructure (AWS, Kubernetes, Terraform), and production relational databases.

However, enterprise engineering teams face a catastrophic vulnerability: **agents produce fluent, persuasive justifications for their actions while simultaneously violating core safety, financial, or operational constraints.**

The industry's current defensive paradigms are fundamentally flawed:
1. **System Prompts ("Please do not drop tables")**: Trivially bypassed via indirect prompt injection hidden inside external RAG embeddings, user emails, or parsed PDFs.
2. **"LLM-as-a-Judge" Guardrails**: Evaluating one LLM's tool call with another LLM introduces 800ms–2,500ms of latency, incurs compounding API token bills ($0.02+ per tool call), and remains vulnerable to adversarial jailbreaking.
3. **Time-of-Check to Time-of-Use (TOCTOU) Drift**: An agent proposes a routine $50 refund to Customer A, but after human sign-off, executes a $5,000 transfer to Customer B due to memory drift or rogue instructions.
4. **Cross-Agent Privilege Escalation ("Confused Deputy")**: Low-privilege worker subagents pass unsanitized requests to high-privilege executive subagents without cross-agent boundary checks.

We built **ProofLayer** as senior systems engineers who believe enterprise AI safety cannot rely on probabilistic models policing other probabilistic models. AI safety requires **deterministic, sub-millisecond software invariants, cryptographic provenance tracking, and tamper-proof human oversight.**

---

## 2. What It Does

**ProofLayer** is developer infrastructure that acts as a non-bypassable **Trust Compiler and Zero-Trust Tool Proxy** between autonomous agents and side-effecting APIs.

### Core Capabilities:
* **The Trust Compiler (<0.05ms, $0 Cost)**: Compiles high-level policy rules into deterministic Abstract Syntax Trees (ASTs) evaluated locally in memory. It enforces invariants on numerical thresholds, regex/not_regex patterns, and allowed parameters in under 0.05ms with zero LLM runtime dependencies.
* **Anti-TOCTOU Cryptographic Payload Binding**: Calculates the canonical `SHA-256` digest of the exact tool payload. Human approval tokens are signed with `HMAC-SHA256` and single-use replay-proof nonces, mathematically preventing parameter mutation between review and execution.
* **Zero-Trust Multi-Agent Provenance Traversal**: Inspects the entire subagent delegation tree (`[Scraper] -> [Coordinator] -> [Executor]`). If an untrusted worker agent is detected in the provenance chain of a high-privilege tool call, execution is immediately halted.
* **Dual-Signature 4-Eyes Gate**: Requires dual independent authorization from both Finance (`sarah.finance@internal`) and SecOps (`marcus.secops@internal`) before critical financial or database actions can proceed.
* **ProofLayer Studio Telemetry Console**: A high-precision Stripe/Apple developer console featuring 3-Tab Mission Control navigation (`Threat Console`, `Policy Playground & AST Compiler`, `Audit & Compliance Ledger`), real-time Server-Sent Events (SSE) tool feeds, interactive React Flow Evidence DAG, sliding Dual-Pane raw JSON / Merkle inspector, and printable compliance views.
* **Dual-Mode Interactive Policy Studio**: Full manual policy customization via Visual Builder and Raw JSON AST Editor, allowing engineers to modify invariants inline, test payloads in microseconds, and deploy updates directly to the live SQLite gateway with zero server restarts.
* **Custom Tool Proposal Workbench**: An interactive simulation modal where engineers can customize every subagent in the delegation tree (Agent ID, Privilege Tier, DelegatedBy), test arbitrary Confused Deputy attack vectors, and view real-time provenance taint diagnostics before dispatch.
* **Verifiable Trust Receipts**: Exports tamper-proof audit bundles with Merkle tree proofs, directly satisfying regulatory compliance under **EU AI Act Article 14 (Human Oversight)** and **SOC2 Type II**.
* **One-Click Red-Team Sandbox**: Includes 6 pre-configured adversarial simulation scenarios in the UI (`5-Step Pipeline`, `Swarm Attack`, `SQL Drop Guard`, `Exfiltration Blocker`, `TOCTOU Tamper`, and `Routine Pay`) to demonstrate live attack interception.

---

## 3. How We Built It

We engineered ProofLayer as a clean monorepo adhering strictly to the **Well-Architected Framework** and **Test-Driven Development (TDD)**:

* **Engine Core (`@prooflayer/core`)**: Pure TypeScript formal verification runtime. Implements the AST invariant evaluator, deterministic JSON canonicalization, SHA-256 payload hashing, HMAC-SHA256 signature verification, multi-agent provenance tree validation, and Merkle-linked audit nodes.
* **Backend API & Gateway (`@prooflayer/server`)**: High-throughput Fastify server running on Node.js 22. Uses `@libsql/client` (Turso open source SQLite with Write-Ahead Logging) for lightweight, cross-platform persistence with zero native C++ build dependencies. Exposes REST endpoints for policy management, human approvals, and real-time SSE event streaming (`/api/events`).
* **Frontend Operations Studio (`@prooflayer/studio`)**: Modern dark console built with Vite 6, React 19, and Tailwind CSS 4. Features `@xyflow/react` for interactive DAG visualization with custom styled nodes, dynamic SSE hooks, and multi-signature authorization modals.
* **Testing & Quality Assurance**: 31 automated Vitest unit and integration tests verifying all 6 simulation scenarios, dynamic policy hot-reloading, crypto signatures, AST edge cases, and SQLite persistence in 3.4 seconds.

---

## 4. Challenges We Ran Into

1. **Sub-0.05ms AST Compilation vs. LLM Latency**: Replacing slow, non-deterministic 800ms+ LLM guardrails required designing a formal AST invariant engine that evaluates nested payload attributes, numerical bounds, and negative regular expressions (`not_regex`) deterministically with zero runtime token cost.
2. **Eliminating the TOCTOU Parameter Drift Race Condition**: In multi-agent systems, agents frequently modify prompt context or payload values between the moment a human reviews an action and the moment the tool executes. We solved this by generating a canonical sorted JSON digest (`SHA-256`) and cryptographically binding the human HMAC signature to that exact hash. If a single byte drifts, execution halts.
3. **Cross-Platform SQLite Portability Without C++ Toolchains**: Native C++ SQLite modules (like `better-sqlite3`) frequently fail to compile on target systems without Visual C++ or Python build tools. We migrated the persistence layer to `@libsql/client` (pure TypeScript/Wasm), guaranteeing instantaneous, zero-config startup across Windows, macOS, and Linux.
4. **Browser-Gateway Cryptographic Boundary Separation**: Bundling Node built-in `node:crypto` into client-side Vite bundles creates compatibility and security issues. We designed a clean boundary where the frontend requests approvals and displays canonical hashes, while HMAC tokens and cryptographic secrets remain strictly inside the authenticated Fastify gateway.

---

## 5. Accomplishments That We're Proud Of

* **100% Automated Test Pass Rate**: 31/31 Vitest tests executing across 6 test suites in ~3.4 seconds.
* **50,000× Latency Improvement**: Reduced tool safety evaluation latency from ~2,500ms (LLM-as-a-judge) to **<0.05ms**, with a **100% reduction in marginal evaluation costs ($0.00 token cost)**.
* **Dual-Signature 4-Eyes Gate**: Implemented a realistic corporate governance gate requiring independent Finance and SecOps signatures before high-risk execution.
* **Zero AI Slop / Zero Hallucination**: Every safety decision is mathematically and cryptographically provable.
* **Full Devpost Learn Skill Pack Adherence**: Generated comprehensive, verified planning and architecture artifacts (`scope.md`, `prd.md`, `spec.md`, `checklist.md`, `app-map.html`).

---

## 6. What We Learned

1. **AI Safety Cannot Rely on Probabilistic Models**: Prompt engineering and LLM guardrails are defense-in-depth at best; only formal invariants and cryptographic bindings at the tool proxy boundary provide deterministic safety.
2. **Least Privilege Is Essential in Multi-Agent Swarms**: Autonomous subagents must not inherit ambient authority. Every delegation must carry a verifiable provenance chain to prevent Confused Deputy privilege escalation.
3. **TDD-First Prevents Security Regressions**: Writing unit tests for negative regexes, payload tampering, and provenance traversal before implementing the server logic ensured our proxy fail-closed invariants worked on the very first integration run.

---

## 7. What's Next for ProofLayer

* **Model Context Protocol (MCP) Server & Proxy Sidecar**: Package ProofLayer as a drop-in MCP proxy container that intercepts tool calls across Anthropic Claude Desktop, OpenAI Swarm, LangGraph, and AutoGen.
* **Hardware Security Module (HSM) & Cloud KMS**: Support enterprise signing keys backed by AWS KMS, HashiCorp Vault, and WebAuthn/FIDO2 hardware security keys.
* **eBPF-Level Network & Socket Interception**: Extend the tool proxy to kernel-level socket filters, blocking rogue autonomous agents from bypassing application middleware.
* **Enterprise OIDC & Slack/Teams Approval Bots**: Native integration with enterprise identity providers (Okta, Azure AD) and chat-ops notification channels.

---

## 8. Built With Tags

`typescript` · `react` · `react-19` · `tailwind` · `fastify` · `sqlite` · `libsql` · `vitest` · `react-flow` · `cryptography` · `hmac-sha256` · `ai-agents` · `mcp` · `zero-trust` · `ai-safety`

---

## 9. Links & Repositories

* **Public GitHub Repository**: [github.com/your-username/ProofLayer](https://github.com/your-username/ProofLayer)
* **Interactive Architecture & App Map**: [devpost/app-map.html](devpost/app-map.html)
* **3-Minute Video Pitch**: [YouTube / Loom Link]
