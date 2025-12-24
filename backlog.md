# backlog.md — Frontend Backlog (Derived from frontend-prd.md)
*Scope: Frontend only. Based strictly on `frontend-prd.md`.*

---

## 0. Backlog Principles

- This backlog translates **screens and actions** from the Frontend PRD into **frontend user stories**.
- No backend invention.
- No UI styling assumptions.
- No technical implementation tasks (hooks, components, state, etc.).
- Each story answers: *what the user can do and see*.

---

## Epic 1: Hackathon Discovery & Creation

### FE-1.1 View Hackathon List
**As an** Organizer  
**I want** to see a list of all hackathons  
**So that** I can access or manage existing hackathons

**Acceptance Criteria**
- Displays hackathon name, status, start date, end date
- Supports empty state when no hackathons exist

---

### FE-1.2 Create Hackathon
**As an** Organizer  
**I want** to create a new hackathon  
**So that** I can start organizing an event

**Acceptance Criteria**
- Form captures name, description, start date, end date
- Hackathon is created in `DRAFT` status
- User is redirected to the hackathon overview after creation

---

### FE-1.3 Open Hackathon
**As an** Organizer  
**I want** to open an existing hackathon  
**So that** I can manage it

**Acceptance Criteria**
- Clicking a hackathon navigates to its overview screen
- Hackathon context (hackathon_id) is preserved across screens

---

## Epic 2: Hackathon Overview & Navigation

### FE-2.1 View Hackathon Overview
**As an** Organizer  
**I want** a central overview of the hackathon  
**So that** I can quickly assess progress

**Acceptance Criteria**
- Displays hackathon metadata
- Displays counts: participants, teams, projects, submissions
- Shows navigation links to all hackathon sections

---

### FE-2.2 Navigate Between Hackathon Sections
**As an** Organizer  
**I want** consistent navigation within a hackathon  
**So that** I can move between setup, participants, teams, and results

**Acceptance Criteria**
- Navigation always reflects the current hackathon
- No navigation leads outside the hackathon context

---

## Epic 3: Hackathon Setup

### FE-3.1 Create and View Tracks
**As an** Organizer  
**I want** to define tracks for the hackathon  
**So that** teams can align their projects

**Acceptance Criteria**
- Track list is visible
- New tracks can be added with name and description
- Tracks are associated with the current hackathon

---

### FE-3.2 Define Judging Rubric
**As an** Organizer  
**I want** to define a judging rubric  
**So that** judges score consistently

**Acceptance Criteria**
- Rubric title and criteria can be entered
- Criteria stored as structured text (JSON)
- Existing rubric is viewable after creation

---

### FE-3.3 Manage Hackathon Status
**As an** Organizer  
**I want** to move the hackathon between lifecycle states  
**So that** participation and submissions are controlled

**Acceptance Criteria**
- Status options: DRAFT, LIVE, CLOSED
- UI prevents invalid actions when status is CLOSED
- Status is visibly reflected across all hackathon screens

---

## Epic 4: Participant Management

### FE-4.1 Register Participant
**As an** Organizer  
**I want** to add participants  
**So that** they can take part in the hackathon

**Acceptance Criteria**
- Form captures name and email
- Participant appears in participant list after creation

---

### FE-4.2 Assign Participant Role
**As an** Organizer  
**I want** to assign a role to a participant  
**So that** they can act as a builder, judge, or mentor

**Acceptance Criteria**
- Roles available: Builder, Judge, Mentor, Organizer
- Role assignment is visible in participant list

---

## Epic 5: Team Formation

### FE-5.1 Create Team
**As a** Builder  
**I want** to create a team  
**So that** I can collaborate with others

**Acceptance Criteria**
- Team name is required
- Team is associated with a hackathon and optional track

---

### FE-5.2 Add Team Members
**As a** Builder  
**I want** to add members to my team  
**So that** we can work together

**Acceptance Criteria**
- Team members are selected from existing participants
- Member roles (Lead/Member) are captured

---

## Epic 6: Project Definition

### FE-6.1 Create Project
**As a** Builder  
**I want** to define my project  
**So that** judges understand what we built

**Acceptance Criteria**
- Project title is required
- One-liner, repo URL, and demo URL are optional
- Project is associated with a team and hackathon

---

### FE-6.2 View Project List
**As a** Builder or Organizer  
**I want** to view all projects  
**So that** I can track what teams are building

**Acceptance Criteria**
- Projects are listed by team and track
- Project status is visible

---

## Epic 7: Submissions

### FE-7.1 Submit Project
**As a** Builder  
**I want** to submit my project  
**So that** it can be judged

**Acceptance Criteria**
- Submission requires a narrative text
- Artifact links can be added
- Submission is blocked if hackathon is CLOSED

---

### FE-7.2 View Submissions
**As an** Organizer or Judge  
**I want** to view all submissions  
**So that** I can review them

**Acceptance Criteria**
- Submissions are listed with project, team, and track
- Submission details are viewable

---

### FE-7.3 Search Submissions
**As an** Organizer or Judge  
**I want** to search submissions by text  
**So that** I can find relevant projects quickly

**Acceptance Criteria**
- Search input accepts natural language
- Results are limited to the current hackathon
- Results show a relevance score and snippet

---

## Epic 8: Judging

### FE-8.1 View Submission for Judging
**As a** Judge  
**I want** to open a submission  
**So that** I can evaluate it

**Acceptance Criteria**
- Submission narrative and artifacts are visible
- Rubric is displayed alongside submission

---

### FE-8.2 Score Submission
**As a** Judge  
**I want** to score a submission  
**So that** my evaluation is recorded

**Acceptance Criteria**
- All rubric criteria must be scored
- Feedback text can be added
- Score submission is persisted successfully

---

## Epic 9: Leaderboard

### FE-9.1 View Leaderboard
**As an** Organizer  
**I want** to see ranked submissions  
**So that** winners are clear

**Acceptance Criteria**
- Submissions are ranked by average score
- Team and project names are visible
- Track filter is available

---

### FE-9.2 Export Leaderboard
**As an** Organizer  
**I want** to export leaderboard results  
**So that** I can share outcomes

**Acceptance Criteria**
- Export includes rank, project, team, and score
- Export format is CSV

---

## Epic 10: Guardrails & UX Constraints

### FE-10.1 Enforce Hackathon State Rules
**As the** System  
**I want** to prevent invalid actions  
**So that** the hackathon lifecycle is respected

**Acceptance Criteria**
- Submission disabled when hackathon is CLOSED
- Judging disabled when hackathon is not LIVE or CLOSED (configurable)

---

### FE-10.2 Display Data Integrity Warnings
**As a** User  
**I want** to see clear warnings when actions are unavailable  
**So that** I understand why

**Acceptance Criteria**
- Warnings are shown instead of silent failures
- Messages explain the restriction in simple language

---

## 11. Definition of Done (Frontend)

A story is complete when:
- User intent is fully supported
- Screen behavior matches frontend-prd.md
- No backend assumptions are introduced
- Acceptance criteria are satisfied

---
