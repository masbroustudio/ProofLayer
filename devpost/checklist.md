---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Fastify backend with `@libsql/client` SQLite persistence and SSE streaming**
  Becomes usable: A running server on port 3001 that boots with zero native C++ compilation dependencies, initializes SQLite tables (`policies`, `execution_requests`, `policy_evaluations`, `approvals`, `evidence_nodes`, `tool_executions`), pre-loads policies, and serves REST + SSE endpoints.
  Why now: The core engine `@prooflayer/core` is already verified (20/20 TDD tests passing); this layer connects it to durable persistence and real-time frontend streaming.
  PRD ref: `prd.md > Features and Behavior > 1. Real-Time Tool Interceptor Feed`
  Spec ref: `spec.md > Components > 2 & 3`, `spec.md > Data Model & @libsql/client Schema`
  Build: Scaffold `packages/server`, implement `@libsql/client` database initialization, integrate `ProofLayerInterceptor`, add `/api/events` (SSE), `/api/interceptor/propose`, `/api/approvals/submit`, and automated integration tests.
  Verify (mechanical): Run server tests verifying table creation, tool call interception, SQLite record insertion, and SSE event broadcast.
  Learner check: Start the server and confirm `http://localhost:3001/api/policies` returns the active high-value payment and swarm guard policies.
  Commit: `feat(server): initialize Fastify backend with libsql SQLite persistence and SSE stream`

- [x] **2. ProofLayer Studio frontend scaffold with Live Interceptor Console**
  Becomes usable: A running dark-mode developer console at `http://localhost:3000` connected to the backend via SSE, displaying system telemetry, latency counter, active policies, and live intercepted tool calls.
  Why now: Proves the end-to-end frontend-to-backend telemetry pipeline early, so all subsequent security features have an immediate visual surface.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Components > 4. ProofLayer Studio Console`
  Build: Scaffold `packages/studio` with Vite 6, React 19, and Tailwind CSS 4; implement `TopBar`, `LiveConsole` with status badge indicators (`EXECUTED`, `HELD_FOR_REVIEW`, `BLOCKED`), and SSE connection hook.
  Verify (mechanical): Build frontend with `npm run build` in `packages/studio` confirming zero TypeScript or bundle errors; confirm incoming SSE events render in the list.
  Learner check: Open `http://localhost:3000` and confirm the dark telemetry dashboard renders with active connection status.
  Commit: `feat(studio): add dark telemetry dashboard with live interceptor console`

- [x] **3. Interactive React Flow Evidence DAG & Dual-Pane Inspector Drawer**
  Becomes usable: The center/right panel renders a live directed acyclic graph (DAG) of execution lineage (`AGENT_INTENT` -> `POLICY_CHECK` -> `APPROVAL` -> `TOOL_EXECUTION`). Clicking any node slides open the Dual-Pane Drawer displaying raw canonical JSON and the Merkle proof tree.
  Why now: This is the core visual differentiator that fulfills the Devpost "Design" and "Innovation" criteria (25% each).
  PRD ref: `prd.md > Features and Behavior > 2. Interactive React Flow Evidence DAG & Dual-Pane Drawer`
  Spec ref: `spec.md > Components > 4`, `spec.md > Look and Feel`
  Build: Integrate `@xyflow/react` with custom styled nodes (emerald for verified, amber for held, crimson for tainted/blocked); build `DualPaneDrawer` showing formatted JSON with highlighted parameters on the left and Merkle lineage on the right.
  Verify (mechanical): Verify graph renders nodes with correct edges and clicking a node populates the Dual-Pane Drawer with exact SHA-256 hashes.
  Learner check: Click an intercepted node in the graph and verify that the drawer slides open showing the raw JSON and Merkle proof side by side.
  Commit: `feat(studio): add interactive React Flow evidence DAG and dual-pane inspector drawer`

- [x] **4. Cryptographic Anti-TOCTOU Human Gate & Trust Receipt Exporter**
  Becomes usable: A human reviewer can open the approval modal for held actions, inspect the exact SHA-256 payload digest, modify scope or confirm, sign with HMAC-SHA256, execute the protected tool safely, and download the signed EU AI Act Article 14 Trust Receipt.
  Why now: Completes the closed-loop trust architecture, guaranteeing that parameter tampering after review is caught and rejected.
  PRD ref: `prd.md > Features and Behavior > 3 & 5`
  Spec ref: `spec.md > The Core Journey Through the System > Steps 6 & 7`
  Build: Implement `ApprovalModal` with client-side SHA-256 hashing and HMAC signing; implement `TrustReceiptModal` with formatted JSON compliance viewer and one-click export.
  Verify (mechanical): Test that approving an action triggers tool execution, and that altering a payload parameter causes the backend to reject dispatch with `PAYLOAD_HASH_MISMATCH`.
  Learner check: Approve a held transaction in the modal, verify the DAG turns green with the execution result, and download the Trust Receipt.
  Commit: `feat(studio): add anti-TOCTOU cryptographic approval modal and trust receipt exporter`

- [ ] **5. Red-Team Adversarial Sandbox for Live Video Demo**
  Becomes usable: Top bar buttons (`Simulate Swarm Attack`, `Simulate TOCTOU Attack`, `Routine $50 Pass-Through`) execute pre-configured attack payloads directly into the live interceptor pipeline for an effortless 3-minute video pitch.
  Why now: Directly prepares the project for the Devpost "Presentation" criterion (25%) and video recording.
  PRD ref: `prd.md > Features and Behavior > 4. Red-Team Adversarial Sandbox Runner`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`
  Build: Add `RedTeamBar` with one-click handlers; connect to `/api/sandbox/simulate` on the backend.
  Verify (mechanical): Trigger each simulation and verify expected outcomes: Swarm Attack blocks in <2ms, TOCTOU Attack rejects tampered payload, Routine Payment executes instantly.
  Learner check: Click "Simulate Swarm Attack" and watch ProofLayer intercept the hijacked subagent and update the Evidence DAG live on screen.
  Commit: `feat(sandbox): integrate one-click red-team simulation suite for video demo`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 2 (Live console receiving real-time SSE tool calls)
- [ ] Final kick-the-tires exploration and feedback completed — Slice 5 (Complete Red-Team attack demo working end-to-end)

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [to be recorded on completion]
Route and stops: [to be recorded on completion]
Edit outcome: [to be recorded on completion]
Reflection: [to be recorded on completion]
Activity mode: [to be recorded on completion]

## Revisions
