# PRD.md — AI-Native Hackathon Ops Platform (Internal-First)
*Hackathon operations + builder workflow, implemented strictly using existing ZeroDB (AI-Native) endpoints.*

---

## 0. Non-Negotiables (Read First)

This PRD is **API-constrained** by the provided **ZeroDB Platform Developer Guide (Last Updated: Dec 13, 2025)**.

### Hard Rules (must be enforced in code + validations)
- **Embeddings model**: MUST be `BAAI/bge-small-en-v1.5`
- **Embedding/vector dimensions**: MUST be **384**
- **Vector endpoints**: MUST include `/database/` prefix
- **Table row insert body**: MUST use `row_data`
- **Auth**: MUST send `X-API-Key` (or Bearer token, but MVP uses API key)
- **Project ID**: MUST be a valid UUID in path
- **SQL queries**: Require PostgreSQL provisioning first (only if we use SQL features)

Failure to comply causes 401/404/422/500 class errors.

---

## 1. Problem Statement

AI-Native runs hackathons to ship prototypes, train builders, and create reusable internal assets. Today, hackathon operations (teams, timelines, submissions, judging, artifacts) are fragmented across spreadsheets + chats.

We need an **internal system** that:
- Creates repeatable hackathon runs
- Standardizes submissions and artifacts
- Supports lightweight judging and reporting
- Stores everything in a searchable knowledge base (semantic retrieval)

---

## 2. Goals and Non-Goals

### Goals (MVP)
1. Run hackathons end-to-end: **setup → teams → submissions → judging → wrap-up**
2. Track participation and progress with **structured tables**
3. Store submissions and key artifacts in a **semantic knowledge base**
4. Provide fast internal visibility: status, submissions, winners, learnings

### Non-Goals (MVP)
- Public-facing registration / marketing site
- Real-time collaboration editor
- Complex RBAC/permissions, SSO
- Automated LLM judging (not supported directly by provided endpoints)
- Payments, sponsorships, external community onboarding
- Multi-tenant productization (internal-first only)

---

## 3. Personas and JTBD

### Persona A — Organizer (Ops Lead)
JTBD:
- Create a hackathon and publish rules, tracks, deadlines
- Manage participants, teams, mentor assignments
- Monitor submissions and announce winners fast

### Persona B — Builder (Participant)
JTBD:
- Join a hackathon, form/enter a team
- Submit a project with links, notes, and final artifacts
- Get clarity on requirements + deadlines in one place

### Persona C — Judge / Reviewer
JTBD:
- See submissions per track
- Score consistently using a rubric
- Leave structured feedback

---

## 4. MVP Scope (Must-Have)

### 4.1 Core Modules
1. **Hackathon Setup**
   - Create hackathon record (name, dates, tracks, rubric)
2. **Participants & Teams**
   - Participant registry, team creation, team membership
3. **Project Workspace (minimal)**
   - Project metadata, track mapping, milestone status
4. **Submissions**
   - Final submission form (links + text)
   - Store as both structured row + semantic document
5. **Judging**
   - Rubric-based scoring (manual input)
   - Feedback captured
6. **Ops Dashboard (internal)**
   - Overview counts, status, leaderboard, export

### 4.2 MVP UI Surfaces (implementation-agnostic)
- Organizer Console (internal web)
- Builder Portal (internal web)
- Judge View (internal web)

---

## 5. Data Model (Tables)

All structured data stored using ZeroDB Tables API.

### 5.1 Tables (MVP)

#### `hackathons`
- `hackathon_id` (UUID primary key)
- `name` (TEXT)
- `description` (TEXT)
- `status` (TEXT) — `DRAFT | LIVE | CLOSED`
- `start_at` (TIMESTAMP)
- `end_at` (TIMESTAMP)
- `created_at` (TIMESTAMP DEFAULT NOW())

#### `tracks`
- `track_id` (UUID primary key)
- `hackathon_id` (UUID)
- `name` (TEXT)
- `description` (TEXT)

#### `participants`
- `participant_id` (UUID primary key)
- `name` (TEXT)
- `email` (TEXT UNIQUE)
- `org` (TEXT nullable)
- `created_at` (TIMESTAMP DEFAULT NOW())

#### `hackathon_participants`
- `hackathon_id` (UUID)
- `participant_id` (UUID)
- `role` (TEXT) — `BUILDER | ORGANIZER | JUDGE | MENTOR`

#### `teams`
- `team_id` (UUID primary key)
- `hackathon_id` (UUID)
- `name` (TEXT)
- `track_id` (UUID nullable)
- `created_at` (TIMESTAMP DEFAULT NOW())

#### `team_members`
- `team_id` (UUID)
- `participant_id` (UUID)
- `role` (TEXT) — `LEAD | MEMBER`

#### `projects`
- `project_id` (UUID primary key)
- `hackathon_id` (UUID)
- `team_id` (UUID)
- `title` (TEXT)
- `one_liner` (TEXT)
- `status` (TEXT) — `IDEA | BUILDING | SUBMITTED`
- `repo_url` (TEXT nullable)
- `demo_url` (TEXT nullable)
- `created_at` (TIMESTAMP DEFAULT NOW())

#### `submissions`
- `submission_id` (UUID primary key)
- `project_id` (UUID)
- `submitted_at` (TIMESTAMP)
- `submission_text` (TEXT) — the canonical narrative
- `artifact_links_json` (TEXT) — store JSON string if needed
- `namespace` (TEXT) — used for embeddings storage namespace

#### `rubrics`
- `rubric_id` (UUID primary key)
- `hackathon_id` (UUID)
- `title` (TEXT)
- `criteria_json` (TEXT) — criteria weights stored as JSON string

#### `scores`
- `score_id` (UUID primary key)
- `submission_id` (UUID)
- `judge_participant_id` (UUID)
- `score_json` (TEXT) — JSON string: criteria → numeric
- `total_score` (REAL)
- `feedback` (TEXT)

> Note: Using JSON-as-TEXT is intentional to stay within the table schema examples provided.

---

## 6. Semantic Layer (Embeddings Strategy)

### 6.1 What gets embedded (MVP)
Embed-and-store these documents:
- Submission narrative (primary)
- Optional: milestone updates, post-mortems, judge feedback summaries (later)

### 6.2 Namespaces
Use strict namespaces so retrieval is clean:

- `hackathons/{hackathon_id}/submissions`
- `hackathons/{hackathon_id}/projects`
- `hackathons/{hackathon_id}/judging` (Phase 2 only if needed)

### 6.3 Document Format (for embed-and-store)
Each embedded doc must include:
- `id`: stable ID (e.g., `submission:{submission_id}`)
- `text`: normalized submission narrative
- `metadata`: hackathon_id, track_id, team_id, project_id, tags

---

## 7. Core User Flows (MVP)

### Flow A — Organizer: Create Hackathon
1. Create (or choose) a ZeroDB project (internal environment)
2. Create required tables (`hackathons`, `tracks`, …)
3. Insert a hackathon row + track rows
4. Set hackathon status to `LIVE`

### Flow B — Builder: Join + Form Team
1. Builder is added to `participants`
2. Builder is mapped to hackathon via `hackathon_participants`
3. Builder creates a team row and adds team members
4. Builder creates a project row

### Flow C — Builder: Submit Project
1. Builder completes submission narrative + artifact links
2. Insert `submissions` row
3. Embed-and-store the submission doc into the correct namespace
4. Mark project `status = SUBMITTED`

### Flow D — Judge: Score Submission
1. Judge views list of submissions filtered by track
2. Judge enters rubric scores + feedback
3. Store in `scores`
4. Organizer dashboard aggregates totals and ranks

### Flow E — Organizer: Wrap-up
1. Close hackathon status
2. Export leaderboard
3. Run semantic search across submissions for internal learnings

---

## 8. API Mapping (Feature → Endpoint → Payload)

**Base URL**: `https://api.ainative.studio/v1/public`

### 8.1 Project Setup

| Feature | Endpoint | Purpose | Notes |
|---|---|---|---|
| Create internal project | `POST /projects` | Create ZeroDB project | Use `database_enabled: true` |
| List projects | `GET /projects` | Choose existing project | Use for environments |

**Example:** `POST /v1/public/projects`

---

### 8.2 Tables (Structured Data)

| Feature | Endpoint | Purpose | Strict Requirements |
|---|---|---|---|
| Create all tables | `POST /{project_id}/database/tables` | Define schemas | Must be done once per project |
| Insert rows | `POST /{project_id}/database/tables/{table_name}/rows` | Create hackathons, teams, submissions, scores | Body must use `row_data` |
| List rows | `GET /{project_id}/database/tables/{table_name}/rows?limit=100` | Fetch records for UI | Shown in guide examples |

> Note: Update/Delete endpoints are not provided in the pasted guide. MVP assumes “append + status change via insert-or-design workaround” unless guide later confirms update endpoints.  
**API GAP RISK**: If no update exists, status changes may require either (a) new row versioning, or (b) SQL path (Phase 2).

---

### 8.3 Embeddings (Semantic Storage + Retrieval)

| Feature | Endpoint | Purpose | Strict Requirements |
|---|---|---|---|
| Embed & store submission | `POST /{project_id}/embeddings/embed-and-store` | Store semantic submission docs | Must use model `BAAI/bge-small-en-v1.5` implicitly; dimensions 384 |
| Search submissions | `POST /{project_id}/embeddings/search` | Judges/organizers search by query | Use `namespace`, `filter`, `similarity_threshold` |
| Generate embeddings (rare) | `POST /{project_id}/embeddings/generate` | Only if manual vector ops needed | Ensure model is correct |

---

### 8.4 Vector Ops (Only if needed)
**MVP prefers embed-and-store.** Use vectors only for advanced ingestion.

| Feature | Endpoint | Purpose | Strict Requirements |
|---|---|---|---|
| Upsert vector | `POST /{project_id}/database/vectors/upsert` | Direct vector writes | Must have 384 dims, must include `/database/` |

---

### 8.5 Event Tracking (Optional MVP)
The guide includes an example posting to `/database/events` (use case 3). If we use it:

| Feature | Endpoint | Purpose | Notes |
|---|---|---|---|
| Track events | `POST /{project_id}/database/events` | Audit trail / analytics | Endpoint is shown in guide examples |

---

### 8.6 PostgreSQL (Phase 2 only)
The guide shows:
- `POST /{project_id}/postgres/provision`
- `POST /{project_id}/database/query`

Use only if we need SQL updates/aggregation beyond table listing.

---

## 9. MVP Requirements Detail (Functional)

### 9.1 Hackathon Setup
- Organizer can create hackathon
- Organizer can define tracks
- Organizer can define rubric (JSON string)

**Stored in:** `hackathons`, `tracks`, `rubrics`

### 9.2 Participant Ops
- Add participant
- Assign role to hackathon

**Stored in:** `participants`, `hackathon_participants`

### 9.3 Teams + Projects
- Create team
- Add members
- Create project

**Stored in:** `teams`, `team_members`, `projects`

### 9.4 Submission
- Create submission row
- Embed-and-store submission narrative for semantic access

**Stored in:** `submissions` + embeddings namespace

### 9.5 Judging
- Judge can list submissions by track/project
- Judge can submit rubric scores + feedback
- Organizer can view leaderboard (aggregation may be computed client-side if no SQL)

**Stored in:** `scores`

---

## 10. MVP Requirements (Non-Functional)

### Reliability & Safety
- Enforce request validation for:
  - project UUID presence
  - `row_data` usage
  - embedding model consistency (when calling generate)
  - namespace consistency
- Handle 401/403/404/422/500 gracefully with actionable messages

### Performance
- Use pagination (`limit`)
- Cache frequently-read lists in the UI layer if needed
- Avoid per-item embedding loops; batch documents where possible

---

## 11. Success Metrics (Internal)

### Ops Metrics
- # hackathons run via platform
- % submissions captured successfully
- Time-to-close leaderboard after deadline

### Builder Metrics
- % teams formed without manual intervention
- Time from hackathon live → first submission

### Knowledge Metrics
- # semantic searches executed
- Search satisfaction proxy (repeat queries, click-through on results)

---

## 12. Risks and API Gaps (Explicit)

### Risk: Updates to rows
The guide shows table create/insert/list patterns, but does **not** explicitly document:
- Update row endpoint
- Delete row endpoint

**Mitigation (MVP):**
- Prefer append-only modeling where possible:
  - statuses may be inferred from latest event row or latest “status change row”
- If later confirmed, adopt update endpoint.
- If not, Phase 2 can use SQL (requires postgres provisioning).

### Risk: Authentication model for multiple internal users
MVP uses API key server-side. If we need user-level sessions, guide shows `/auth/login` returning bearer token, but full user auth flows are not detailed here.

---

## 13. Out of Scope (Because API Not Confirmed)
Flagged as out of scope unless the guide later confirms endpoints:

- Real-time collaboration
- Notifications
- File storage (binary uploads)
- Full-text indexing beyond embeddings
- Fine-grained permissions and audit logs (beyond events)
- Automatic judging via LLM calls (not provided in this API excerpt)

---

## 14. MVP Delivery Plan (Small Team)

### Sprint 1 — Foundation
- Create tables
- Organizer create hackathon + tracks + rubric
- Participant + team creation
- Project creation

### Sprint 2 — Submissions + Semantic KB
- Submission form
- Store submissions row
- Embed-and-store submission docs
- Search UI for organizers/judges

### Sprint 3 — Judging + Reporting
- Score capture
- Aggregation + leaderboard
- Hackathon close + export (client-side export)

---

## 15. Appendix A — Endpoint Checklist (Implementation Guardrails)

### Every request must include:
- `X-API-Key`
- `Content-Type: application/json` (except auth/login form)

### Embeddings must:
- Use model `BAAI/bge-small-en-v1.5` (generate)
- Produce 384-dimension vectors

### Vectors must:
- Hit `/database/vectors/*` endpoints
- Be 384 dims

### Tables must:
- Use `row_data` for inserts

---

## 16. Appendix B — Minimal API Call Examples (Canonical)

### Create table
`POST /v1/public/{project_id}/database/tables`

### Insert row
`POST /v1/public/{project_id}/database/tables/{table}/rows`
```json
{
  "row_data": { "key": "value" }
}
