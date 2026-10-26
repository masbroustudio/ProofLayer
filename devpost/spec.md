---
doc: spec
status: approved
---

# ProofLayer — Technical Spec

## How This Works, In Plain Language
ProofLayer puts a deterministic, sub-millisecond security checkpoint between autonomous AI agents and the sensitive tools they can execute (such as financial transactions, cloud deployments, or database mutations).

Instead of relying on prompt instructions or slow, expensive "LLM-as-a-judge" guardrails, ProofLayer works in three clear stages:
1. **At Design Time**: The developer defines high-level rules (e.g. *"Payments > $500 require human review; untrusted scraper subagents cannot trigger financial tools"*). ProofLayer compiles these once into typed Abstract Syntax Tree (AST) invariants.
2. **At Runtime (in <2ms)**: When an agent attempts a tool call, ProofLayer's Model Context Protocol (MCP) proxy catches it. It hashes the tool payload into a canonical `SHA-256` digest, checks the subagent delegation lineage to prevent Confused Deputy privilege escalation, and evaluates the AST invariants locally with zero token cost.
3. **At the Human Gate (Anti-TOCTOU)**: If an invariant is violated or an approval threshold is exceeded, execution is halted. When a human reviewer approves the action in ProofLayer Studio, their approval signature is cryptographically bound (`HMAC-SHA256`) to the exact payload hash. If the agent modifies a single parameter after review, ProofLayer immediately aborts execution.
4. **Verifiable Audit**: Dispatched tools generate an immutable Merkle Evidence DAG and an exportable compliance Trust Receipt satisfying **EU AI Act Article 14**.

## The Core Journey Through the System
Implements `prd.md > The Core Journey`.

1. **Agent Proposes Tool Call**:
   `Agent Swarm` $\rightarrow$ `HTTP/MCP POST /api/interceptor/propose` $\rightarrow$ Payload received by `ProofLayerInterceptor`.
2. **Canonical Hashing & Provenance Verification**:
   `canonicalizeJson(payload)` $\rightarrow$ `SHA-256` hash computed $\rightarrow$ `verifyAgentProvenance(chain)` checks caller tiers.
3. **Deterministic AST Evaluation**:
   `evaluateInvariants(policy, payload)` evaluates rules in `<0.05ms`.
   - If `$1,200 > $500`: Evaluator outputs `decision: 'require_approval'`.
   - Event written to `@libsql/client` database (`execution_requests` & `policy_evaluations`).
   - Real-time event emitted via SSE stream (`GET /api/events`).
4. **UI Updates & Evidence DAG Rendering**:
   ProofLayer Studio receives SSE event $\rightarrow$ Updates `LiveConsole` with amber alert $\rightarrow$ Renders new nodes on the React Flow `EvidenceGraph`.
5. **Node Inspection via Dual-Pane Drawer**:
   Engineer clicks the intercepted node $\rightarrow$ Studio opens `DualPaneDrawer`:
   - Left Pane: Displays raw canonical JSON with highlighted `amount: 1200` parameter and SHA-256 digest.
   - Right Pane: Displays Merkle proof trail, parent link hashes, and AST rule evaluation breakdown.
6. **Cryptographic Approval Submission**:
   Reviewer clicks "Review Action" in Studio $\rightarrow$ Adjusts scope or confirms $\rightarrow$ Browser signs `HMAC-SHA256(payloadHash + nonce + reviewer)` $\rightarrow$ `POST /api/approvals/submit`.
7. **Anti-TOCTOU Verification & Tool Dispatch**:
   Backend verifies `submittedPayloadHash === requestPayloadHash`.
   - Upon match: Dispatches protected mock tool (`payment.execute`).
   - Appends `TOOL_EXECUTION` node to `@libsql/client` store and computes Merkle root.
   - Generates and exports `TrustReceipt` JSON.

## Stack
- **Language**: TypeScript 5.7+ (Strict Mode, ES2022).
- **Core Verification Engine**: `@prooflayer/core` (Zod 3.24+, zero external runtime dependencies, Node `node:crypto`). Verified with 20/20 TDD tests passing.
- **Backend Service**: Node.js v22+ with Fastify 5.x (chosen for high-throughput JSON processing and native SSE support).
- **Persistence & Portability**: `@libsql/client` (Turso open-source client) configured with local SQLite file (`file:prooflayer.sqlite`) and in-memory test isolation (`file::memory:`). Zero native C++ build dependencies, zero compilation errors across Windows/macOS/Linux.
- **Frontend Studio**: React 19 + Vite 6 + Tailwind CSS 4.
- **Evidence Graph Visualization**: `@xyflow/react` (React Flow 12.x) for high-performance interactive node graphs.
- **Icons & Typography**: `lucide-react`, `Fira Code` for monospace cryptographic hashes.
- **Testing**: Vitest 3.x (unit, invariant benchmarks, anti-TOCTOU, and red-team swarm attack tests).

## Where It Runs and How Someone Tries It
- **Runtime**: Local development environment (Node.js v22+, Windows/macOS/Linux).
- **Start Command**:
  ```bash
  npm run dev
  ```
- **What to Open**: Browser at `http://localhost:3000` (ProofLayer Studio).
- **Demo Recording Flow**:
  1. Open Studio at `http://localhost:3000`.
  2. Click "Simulate Swarm Attack" in the top Red-Team bar.
  3. Observe `<2ms` interception and amber alert badge.
  4. Click the blocked node to demonstrate the Dual-Pane Inspector Drawer.
  5. Click "Review Action", sign the payload hash, and observe green tool dispatch.
  6. Click "Export Trust Receipt" and inspect the EU AI Act compliance bundle.

## Look and Feel
Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`:
- **Palette**: Dark telemetry theme (`#0B0F17` background, `#161F30` card surfaces, `#1E293B` borders).
- **Accent Signals**: `#10B981` (Emerald - Verified), `#F59E0B` (Amber - Review Required), `#EF4444` (Crimson - Blocked/Tainted), `#06B6D4` (Cyan - Provenance/Merkle Root).
- **Density**: High-density developer dashboard layout with collapsible sidebars and fluid React Flow canvas.

## Components

### 1. Core Interceptor & Evaluator (`@prooflayer/core`)
- Implements `prd.md > Features and Behavior > 1. Real-Time Tool Interceptor Feed`.
- Evaluates AST invariants in `<2ms`, computes canonical SHA-256 payload digests, verifies multi-agent delegation chains, and validates HMAC-SHA256 human approval signatures.

### 2. `@libsql/client` Persistence Layer (`packages/server/src/db`)
- Implements `prd.md > States and Boundaries`.
- Uses `@libsql/client` for secure, parameterized SQLite operations. Supports connection reuse, synchronous WAL performance, explicit foreign key checks, and in-memory test databases (`file::memory:`).

### 3. Fastify REST & SSE Server (`packages/server/src/index.ts`)
- Implements `prd.md > Features and Behavior > 1 & 4`.
- Exposes tool proxy endpoints (`/api/interceptor/propose`), approval submissions (`/api/approvals/submit`), SSE event streams (`/api/events`), and the Red-Team simulation runner (`/api/sandbox/simulate`).

### 4. ProofLayer Studio Console (`packages/studio`)
- Implements `prd.md > Screens and Layout`.
- Houses the `TopBar`, `RedTeamBar`, `LiveConsole`, `EvidenceGraph` (React Flow), `DualPaneDrawer`, `ApprovalModal`, and `TrustReceiptModal`.

## Data Model & `@libsql/client` Schema
Implements `prd.md > States and Boundaries`.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS policies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    action_pattern TEXT NOT NULL,
    required_privilege_tier TEXT,
    compiled_ast TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS execution_requests (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    action TEXT NOT NULL,
    payload TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    provenance_chain TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_requests_hash ON execution_requests(payload_hash);
CREATE INDEX IF NOT EXISTS idx_requests_status ON execution_requests(status);

CREATE TABLE IF NOT EXISTS policy_evaluations (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    policy_id TEXT NOT NULL,
    decision TEXT NOT NULL,
    reason TEXT NOT NULL,
    failed_invariants TEXT,
    evaluation_latency_ms REAL NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(request_id) REFERENCES execution_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    decision TEXT NOT NULL,
    nonce TEXT NOT NULL UNIQUE,
    signature TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(request_id) REFERENCES execution_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evidence_nodes (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    data TEXT NOT NULL,
    parent_ids TEXT NOT NULL,
    node_hash TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(request_id) REFERENCES execution_requests(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidence_request ON evidence_nodes(request_id);

CREATE TABLE IF NOT EXISTS tool_executions (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    output_result TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(request_id) REFERENCES execution_requests(id) ON DELETE CASCADE
);
```

## File Structure
```
ProofLayer/
├── package.json                        # Root monorepo workspace definition
├── tsconfig.json                       # Base TypeScript configuration
├── Draft Project Brief ProofLayer.md   # Master 2026 Project Brief
├── devpost/                            # Devpost Learn Skill Pack artifacts
│   ├── learner-profile.md
│   ├── scope.md                        # status: approved
│   ├── prd.md                          # status: approved
│   └── spec.md                         # status: approved
├── packages/
│   ├── core/                           # Tested Core Invariant & Crypto Engine
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── crypto.ts
│   │   │   ├── evaluator.ts
│   │   │   ├── provenance.ts
│   │   │   ├── evidence.ts
│   │   │   ├── interceptor.ts
│   │   │   └── index.ts
│   │   └── tests/
│   │       ├── crypto.test.ts
│   │       ├── evaluator.test.ts
│   │       ├── provenance.test.ts
│   │       ├── evidence.test.ts
│   │       └── interceptor.test.ts
│   ├── server/                         # Fastify SSE & @libsql/client Backend
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── client.ts           # @libsql/client connection & migrations
│   │   │   │   └── repository.ts       # Parameterized SQL data accessors
│   │   │   ├── routes/
│   │   │   │   ├── interceptor.ts      # Tool proxy & approval routes
│   │   │   │   ├── events.ts           # Server-Sent Events stream
│   │   │   │   └── sandbox.ts          # Red-Team attack simulator
│   │   │   └── server.ts
│   │   └── tests/
│   │       └── server.test.ts
│   ├── studio/                         # React 19 + Tailwind + React Flow Frontend
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── RedTeamBar.tsx
│   │   │   │   ├── LiveConsole.tsx
│   │   │   │   ├── EvidenceGraph.tsx   # React Flow DAG
│   │   │   │   ├── DualPaneDrawer.tsx  # JSON & Merkle proof inspector
│   │   │   │   ├── ApprovalModal.tsx
│   │   │   │   └── TrustReceiptModal.tsx
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   └── index.html
```

## Important Failure Modes
1. **Time-of-Check to Time-of-Use (TOCTOU) Attack**:
   - *Failure*: An agent attempts to execute a `$5,000` payment after a human approved `$500`.
   - *ProofLayer Defense*: `verifyApproval` detects `PAYLOAD_HASH_MISMATCH`. The backend immediately aborts execution, flags the incident in `@libsql/client`, and alerts the UI with a crimson warning badge.
2. **Confused Deputy Multi-Agent Hijacking**:
   - *Failure*: An untrusted `Analyst` subagent poisoned by an indirect prompt injection tricks the `Executor` into calling a financial tool.
   - *ProofLayer Defense*: `verifyAgentProvenance` traverses the delegation chain, detects the unprivileged `untrusted_reader` origin, and hard-blocks the tool before invocation.
3. **Missing or Corrupted Invariant Fields**:
   - *Failure*: An agent submits an empty or malformed payload omitting the `amount` field.
   - *ProofLayer Defense*: The Invariant Evaluator fails closed to `DENY`, preventing silent execution.

## What Was Simplified and Why
- **`@libsql/client` instead of Native `better-sqlite3`**: Completely eliminates native C++ compilation dependencies and `node-gyp` errors across diverse OS environments, while preserving sub-millisecond local SQLite performance.
- **Zero-Token Local AST Evaluation instead of LLM-as-a-judge**: Evaluates rules in `<2ms` at `$0` recurring API cost, eliminating the 800ms latency and prompt jailbreak vulnerabilities of LLM judges.
- **Simulated Payment Tool instead of Live Stripe Production Account**: Eliminates the need for judges to configure external API keys or spend real money while faithfully exercising real-world payloads (`amount`, `currency`, `recipient`, `txId`).
