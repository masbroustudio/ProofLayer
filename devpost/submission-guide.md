# ProofLayer — Devpost Submission Guide & Video Pitch Script

Use this comprehensive guide to rehearse and record your **3-minute video pitch** and complete your **Build With AI: Basics** Devpost submission.

---

## 1. Project Overview

- **Project Name**: ProofLayer
- **Subtitle**: The Trust Compiler & Zero-Trust Policy Guard for Multi-Agent Systems
- **Tagline**: *Don't trust what AI claims. Cryptographically verify what AI does.*
- **Devpost Track**: Developer Infrastructure & Agentic AI Safety (2026 Track)
- **Primary Design Aesthetic**: Stripe / Apple Developer High-Precision Light Theme (`#F8FAFC` foundation, pure white cards, crisp `#E2E8F0` borders, and vibrant `#4F46E5` sapphire/indigo branding)
- **Verification Guarantee**: 82/82 automated Vitest tests passing with 100% success across all packages (including 51-test adversarial stress & burst suite).

---

## 2. Video Pitch Recording Setup (Voiceover-After Approach)

### Quickstart Dev Stack
```bash
# Launch both backend (3001) and frontend (3000) with a single command
npm run dev
```

The recommended strategy is **Voiceover-After**:
1. **Step 1 (Silent Video Capture)**: Follow the **Second-by-Second Click Path** below while recording your screen silently (using Windows Snipping Tool, OBS, or Clipchamp at 1080p full screen). Make your mouse movements deliberate and steady.
2. **Step 2 (Voiceover Narration)**: Open your recorded video in Clipchamp or any video editor, and read the matching **Voiceover Script** at a calm, authoritative pace (~140 words per minute).
3. **Step 3 (Export)**: Export at 1080p (MP4), upload to YouTube (Unlisted or Public) or Loom, and paste the URL into your Devpost entry.

---

## 3. Second-by-Second Click Path & Narration Script (Total: 2:55)

### Scene 1 [0:00 – 0:25] The High-Stakes Visual Hook: Live Attack Intercepted in <0.05ms
* **Screen**: ProofLayer Studio (`http://localhost:3000`), starting on the **Threat Console** tab in Stripe Light Theme.
* **Mouse Actions**: 
  - (0:00 - 0:05) Cursor starts at the top bar. Instantly click **`[🔥 Swarm Attack ($1,200)]`**!
  - (0:05 - 0:15) Point cursor to the live console where the red **BLOCKED** status chip appears instantly, and hover over the `<0.05ms ($0 token cost)` benchmark pill.
  - (0:15 - 0:25) Click the blocked event to show the animated **React Flow Evidence DAG** on the right, highlighting the failed policy check node.
* **Voiceover Script**:
  > *"Watch this autonomous AI agent attempt an unauthorized $1,200 wire transfer. In under 0.05 milliseconds—with zero runtime LLM token cost—ProofLayer intercepts and hard-blocks the attack at the tool proxy boundary. In 2026, autonomous agent swarms have direct access to financial rails, databases, and cloud infrastructure. But relying on system prompts or slow, jailbreakable LLM guardrails is a disaster waiting to happen. ProofLayer replaces probabilistic hope with cryptographic certainty."*

---

### Scene 2 [0:25 – 1:05] Interactive Swarm Attack & Custom Proposal Dispatcher
* **Screen**: Threat Console & Custom Proposal Modal.
* **Mouse Actions**:
  - (0:25 - 0:35) Click **`[🛡️ SQL Drop Guard]`** to show destructive `DROP TABLE` blocking. Watch the red alert appear in real time.
  - (0:35 - 0:45) Click **`[✨ + Custom Proposal]`** to open the interactive Swarm Workbench modal.
  - (0:45 - 0:55) Click **`[Confused Deputy Attack Chain (3 Hops)]`** preset. Point cursor to the red **Tainted Chain Detected** banner (`agent-web-scraper` with tier `untrusted_reader`).
  - (0:55 - 1:05) Click **`[Dispatch Proposal to Gateway]`**. The modal closes, and the attack is caught live in the Evidence DAG.
* **Voiceover Script**:
  > *"ProofLayer isn't just a static filter—it's an interactive security control plane. Here, a compromised agent attempts a destructive SQL DROP TABLE, and ProofLayer rejects it instantly. Next, our Custom Proposal Dispatcher allows engineers to simulate complex multi-agent delegation trees. When an untrusted web scraper subagent tries to delegate a privileged action through an executive agent, ProofLayer's Zero-Trust provenance engine traces the entire delegation lineage and shuts down the Confused Deputy attack before any damage occurs."*

---

### Scene 3 [1:05 – 1:45] Anti-TOCTOU Dual-Signature 4-Eyes Gate
* **Screen**: Threat Console & Approval Modal.
* **Mouse Actions**:
  - (1:05 - 1:15) Click **`[⚡ 5-Step Pipeline]`** on the top bar. Select Step 4 (Held $8,500 wire transfer).
  - (1:15 - 1:25) Click the center node to slide open the **Dual-Pane Drawer**, showing raw canonical JSON on the left and the Merkle lineage tree on the right. Close the drawer.
  - (1:25 - 1:35) Click the pulsing amber **`[Review & Authorize (Dual-Signature)]`** button.
  - (1:35 - 1:45) Click **"Sign as Finance"**, then click **"Sign as SecOps"**. Both badges turn green. Click **`[Dispatch Protected Tool]`**. The transaction clears.
* **Voiceover Script**:
  > *"Here in the Evidence DAG, we inspect the full execution lineage. When a high-value action requires authorization, ProofLayer enforces a Dual-Signature 4-Eyes Gate satisfying EU AI Act Article 14. Both Finance and SecOps must independently sign off. Critically, their authorizations are cryptographically bound via HMAC-SHA256 directly to the canonical SHA-256 payload digest. If an agent tampers with parameters between check and dispatch, the Anti-TOCTOU verification fails and execution is halted."*

---

### Scene 4 [1:45 – 2:25] Policy Playground & Live Invariant Compilation
* **Screen**: Switch to **Policy Playground** tab.
* **Mouse Actions**:
  - (1:45 - 1:55) Click the **"Policy Playground"** tab in the top navigation.
  - (1:55 - 2:05) Select **"Production Database Mutation Guard"** (`policy-sql-001`). Point cursor to the Visual Builder's `not_regex` invariant blocking `DROP|TRUNCATE`.
  - (2:05 - 2:15) In the Dry-Run Payload Tester, click sample **"Destructive DROP TABLE"** (`DROP TABLE customers_prod CASCADE;`). Click **`[⚡ Evaluate Invariants Deterministically]`**.
  - (2:15 - 2:25) Show the instant `VERDICT: DENY` result with the microsecond latency gauge (`0.02ms`). Click **`[Deploy to Live Gateway]`** to show the green "Deployed!" confirmation.
* **Voiceover Script**:
  > *"Next, let's explore the Policy Playground. ProofLayer replaces probabilistic LLM judges with formal, compiled Abstract Syntax Trees. In our Visual Builder, engineers can modify rules inline, add custom invariant checks, test payloads in microseconds, and deploy updates directly to the live SQLite gateway with zero server restarts. Whether guarding against destructive SQL drops or outbound PII exfiltration, evaluation is 100% deterministic and runs in memory."*

---

### Scene 5 [2:25 – 2:55] Audit Ledger, Merkle Proofs & Conclusion
* **Screen**: Switch to **Audit Ledger** tab.
* **Mouse Actions**:
  - (2:25 - 2:35) Click the **"Audit Ledger"** tab.
  - (2:35 - 2:45) Scroll slowly past the **Merkle Tree Cryptographic Lineage** diagram and the **Regulatory Compliance Crosswalk** table (EU AI Act, SOC2 Type II, ISO 42001).
  - (2:45 - 2:55) Click **`[Export Compliance Bundle (.json)]`**. Return to the Threat Console and let the camera hold on the clean dashboard.
* **Voiceover Script**:
  > *"Finally, in the Audit Ledger, every tool call rolls up into an immutable Merkle tree. ProofLayer provides a formal regulatory crosswalk for EU AI Act Article 14, SOC2 Type II, and ISO 42001, and exports machine-readable compliance bundles. ProofLayer transforms autonomous agents from an existential liability into mathematically verifiable enterprise assets. Don't trust what AI claims. Cryptographically verify what AI does."*

---

## 4. Rehearsal Checklist Before You Hit Record

- [ ] **Both Servers Running**:
  - Fastify Backend: `npm run server` (Listening on port 3001)
  - Studio Frontend: `npm run studio` (Listening on port 3000)
- [ ] **Browser Window**: Full screen at 1920x1080 (100% zoom).
- [ ] **Audio Setup**: Clear microphone in a quiet room, speaking at ~140 WPM.
- [ ] **Test Clicks**: Click `Swarm Attack`, `Custom Proposal`, `Review & Authorize`, and `Policy Playground` once before recording to verify smooth local state.
