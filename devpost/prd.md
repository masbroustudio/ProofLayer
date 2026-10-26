---
doc: prd
status: approved
---

# ProofLayer — Product Requirements

Developer security console and visual verification studio for AI Engineers operating autonomous multi-agent swarms.  
Source: `scope.md > The Core Loop`, `scope.md > Who It's For`, `scope.md > What "Working" Looks Like`.

## The Core Journey
1. **Studio Entry**: The AI engineer opens ProofLayer Studio in their browser. They see the active security policies, live latency counter (`<2ms`), and the real-time Interceptor stream in a high-density dark-mode interface.
2. **Launch Red-Team Simulation**: The engineer clicks "Simulate Swarm Attack" in the Red-Team bar. A low-privilege `Analyst` subagent ingests an invoice containing an indirect prompt injection and attempts to trick the `Executor` subagent into running an unauthorized `$1,200` wire transfer.
3. **Instant Interception**: Within milliseconds, the Interceptor stream triggers an alert badge: `BLOCKED: CONFUSED DEPUTY ESCALATION ($1,200 > $500 LIMIT)`. The protected tool execution is completely halted.
4. **Inspect Evidence Graph & Dual-Pane Drawer**: The engineer clicks the intercepted event. An interactive React Flow DAG displays the complete lineage: the untrusted `Analyst` node highlighted in red, the `Coordinator` delegation node, the failed invariant check, and the halted execution boundary. Clicking any node slides open the **Dual-Pane Inspector Drawer** showing the raw canonical JSON alongside the cryptographic Merkle proof and AST rule breakdown.
5. **Cryptographic Human Sign-off**: The engineer opens the "Review Action" modal. The UI displays the exact tool payload alongside its computed SHA-256 fingerprint (`a3f89c...`). The engineer adjusts the amount to `$500` or signs the transaction under authorized scope. The system computes an `HMAC-SHA256` approval token bound to the exact payload digest.
6. **Verified Dispatch & Trust Receipt**: The protected tool executes safely. The DAG updates in real-time, flashing green. The engineer clicks "Export Trust Receipt" and downloads the cryptographically signed compliance bundle satisfying **EU AI Act Article 14**.

## Screens and Layout
ProofLayer Studio is delivered as an integrated, single-surface developer control plane:
- **Top Bar**: System operational status, active policy badges, sub-millisecond latency benchmark badge, and the **Red-Team Simulation Suite** (`Swarm Injection`, `TOCTOU Drift Attempt`, `Routine $50 Pass-Through`).
- **Left Panel (35% width)**:
  - *Tab 1: Live Interceptor Stream*: Real-time feed of incoming agent tool requests, color-coded status badges (`EXECUTED`, `HELD_FOR_REVIEW`, `BLOCKED`), and execution latency metrics.
  - *Tab 2: Policy Registry*: View and inspect active compiled AST invariant rules.
- **Center/Right Panel (65% width)**:
  - *Evidence Graph Canvas*: Full-height interactive React Flow visual DAG showing active nodes (`AGENT_INTENT`, `POLICY_CHECK`, `HUMAN_APPROVAL`, `TOOL_EXECUTION`). Nodes can be panned, zoomed, and clicked.
  - *Dual-Pane Inspector Drawer (Flyout / Bottom Sheet)*:
    - **Left Sub-Pane (Canonical JSON & Parameter Inspector)**: Displays the raw canonical JSON of the clicked node with syntax highlighting, amber/red visual callouts for violated invariant fields (e.g. `amount: 1200`), and the computed SHA-256 content digest.
    - **Right Sub-Pane (Merkle Lineage & Invariant Proof Engine)**: Displays the step-by-step Merkle path from the current leaf node up to the root hash, parent link hashes (`hash(parentHashes + nodeContent)`), the evaluated AST rule logic (`field <= 500 => FAILED`), and the cryptographic verification badge (`MERKLE_LEAF_VALIDATED`).
- **Modals**:
  - *Cryptographic Approval Modal*: Side-by-side payload viewer, risk reason, SHA-256 digest, and single-click signature action.
  - *Trust Receipt Viewer*: Formatted JSON preview and one-click JSON download.

## Look and Feel
- **Theme**: High-density cyber telemetry dark mode inspired by Linear and Datadog (`#0B0F17` canvas background, `#161F30` card surfaces, `#1E293B` borders).
- **Color Semantics**:
  - Emerald (`#10B981`): Verified, cryptographically authorized tool executions.
  - Amber (`#F59E0B`): Intercepted actions held for human review / invariant threshold exceedances.
  - Crimson (`#EF4444`): Hard-blocked actions, Confused Deputy privilege escalations, or signature mismatches.
  - Cyan (`#06B6D4`): Multi-agent swarm provenance linkages and Merkle root nodes.
- **Typography**: Clean geometric sans-serif for UI labels, coupled with high-contrast monospace font (`Fira Code` / `JetBrains Mono`) for transaction amounts, hashes, nonces, and signatures.

## Features and Behavior

### 1. Real-Time Tool Interceptor Feed
- Displays every tool call intercepted at the MCP boundary via Server-Sent Events (SSE).
- Shows agent ID, target tool (`payment.execute`), timestamp, latency (`<2ms`), and disposition status.
- Clicking an event immediately updates the Evidence Graph canvas.

### 2. Interactive React Flow Evidence DAG & Dual-Pane Drawer
- Renders execution lineage as a directed acyclic graph:
  - Node 1: `AGENT_INTENT` (displays calling agent and incoming payload hash).
  - Node 2: `POLICY_CHECK` (displays deterministic AST invariant evaluation).
  - Node 3: `HUMAN_APPROVAL` (displays reviewer ID, nonce, and HMAC signature).
  - Node 4: `TOOL_EXECUTION` (displays protected tool execution output).
- Clicking any node opens the **Dual-Pane Inspector Drawer**:
  - Allows side-by-side audit of the canonical serialized JSON payload alongside its Merkle proof path and parent link signatures.
  - For `POLICY_CHECK` nodes, displays the exact evaluated condition (e.g. `amount <= 500 => FAILED ($1,200 > $500)`).
  - For `APPROVAL` nodes, displays the HMAC-SHA256 signature and reviewer identity.

### 3. Cryptographic Anti-TOCTOU Human Gate
- Review modal locks the payload against modification.
- Computes canonical `SHA-256(canonicalJson(payload))` in the browser.
- Generates single-use nonce and HMAC-SHA256 signature upon reviewer authorization.
- If payload parameters drift or are mutated by an agent, the UI displays `ERROR: PAYLOAD_HASH_MISMATCH` and refuses to dispatch the tool.

### 4. Red-Team Adversarial Sandbox Runner
- Dedicated simulation bar with 3 pre-built scenarios:
  1. *Scenario A (Swarm Attack)*: Hijacked Scraper subagent attempts Confused Deputy privilege escalation to spend $1,200.
  2. *Scenario B (TOCTOU Attack)*: Agent attempts to mutate payload from approved $500 to $5,000 after reviewer sign-off.
  3. *Scenario C (Clean Operation)*: Routine $50 payment by authorized executor passing with zero friction.

### 5. EU AI Act Article 14 Trust Receipt Exporter
- Computes deterministic Merkle root across all DAG nodes.
- Formats structured compliance JSON containing human oversight proof, deterministic gate status, and execution timestamp.
- One-click copy and download functionality.

## States and Boundaries
- **Idle State**: Studio is active, SQLite WAL is ready, policies loaded, waiting for agent events.
- **Pending Approval State**: Intercepted call held at proxy, amber pulsating badge, execution paused without timeout.
- **Blocked State**: Invariant violated or unprivileged agent detected, execution rejected with zero tool side-effects.
- **Executed State**: Tool dispatched, execution output captured, green success state, receipt ready for export.
- **Tampered State**: Post-approval hash mismatch detected, immediate abort, security incident logged.

## Product Decisions
- **Dual-Pane Node Inspector**: Empowers security engineers to inspect the exact canonical JSON and Merkle cryptographic tree side-by-side without leaving the graph canvas.
- **Single-Screen Control Plane**: Kept as an integrated single dashboard rather than multiple disjointed routes, ensuring a seamless 3-minute hackathon video recording.
- **Local SQLite WAL Persistence**: Everything persists locally across browser refreshes with zero cloud infrastructure overhead.
- **Zero Runtime LLM Latency**: Enforces deterministic evaluation in `<2ms`, guaranteeing responsive UI updates with zero token costs.

## What We're Building (POC Scope)
- Complete ProofLayer Studio UI (Vite + React 19 + Tailwind CSS + React Flow).
- Real-time SSE / REST backend service (Fastify / Node.js) connected to `@prooflayer/core`.
- SQLite database persistence with WAL mode.
- Dual-Pane Evidence Node Inspector Drawer.
- Red-Team simulation triggers for the 3 core demo scenarios.
- One-click Trust Receipt export modal.

## Deferred From the POC
- Multi-tenant enterprise SSO (Okta/SAML).
- Hardware Security Module (HSM) private key management.
- Live Stripe webhook payment production processing.

## Non-Goals
- Not building an agent chat framework (ProofLayer guards existing agent tools).
- Not building an LLM prompt evaluation service.
