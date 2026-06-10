# partai.alternatif.space — Product Requirements Document
**Version:** 0.3 | **Date:** March 2026 | **Status:** Draft
 
---
 
## Changelog
 
### v0.3 — March 2026
**Reason for update:** Screen design exercise exposed a contradiction — archetype labels were shown on party cards and used as browse filters, but the design decision is that archetype labels are never shown publicly. Separately, the create party flow was extended with a Custom archetype option.
 
**Changes:**
- **P0-03 updated** — Archetype label removed from party card display. Archetype filter removed from browse page. Filters are now membership model (open / application / invite-only) and activity status (active / dormant). Cards now show: logo, name, tagline, membership model, activity status, member count.
- **P0-04 updated** — Archetype label removed from party public profile hero pills. Governance config section (raw parameter values) remains fully visible — this is the intended public-facing representation.
- **P0-05 updated** — Custom added as a 4th option in Step 1 alongside Vanguard, Republic, Commune. Step 2 behaviour now documented for both paths: preset paths arrive with parameters pre-filled (adjustable); Custom path arrives with all parameters blank (all fields must be completed before proceeding).
 
### v0.2 — March 2026
- Phase 0 launch dependency added — mufakat must launch alongside partai.
- P0-12 added — Post-join nudge screen.
- P0-13 added — Post-approval share flow.
- Success criteria updated.
 
### v0.1 — March 2026
Initial draft.
 
---
 
## Overview
 
partai.alternatif.space is the entry point to alternatif.space. Every user must join or create a party before participating anywhere else on the platform. Party membership acts as a persistent ideological flag across all four subdomains — shifting discourse from personality to position.
 
This PRD covers the full feature set across three build phases. Phase 0 is the MVP. Phases 1 and 2 follow once the previous phase is validated.
 
---
 
## Phase 0 — Discovery & Formation
 
**Goal:** Users can create parties, browse them, join one, and immediately use their party flag in mufakat.
 
**Launch dependency:** partai.alternatif.space and mufakat.alternatif.space launch together. Party membership without a space to use the flag produces churn before Phase 1 can be validated. The two subdomains are a single launch unit.
 
**Success criteria:** 100 users across both subdomains, 5 active parties with quality manifestos, evidence of genuine membership (not just account creation), evidence of party flags appearing in mufakat discussions.
 
---
 
### 1. Authentication & Onboarding
 
**P0-01 — Sign up / Log in**
- Email + password via Clerk
- No social login for MVP (keeps identity intentional)
- On first login, user is shown a brief onboarding screen explaining what the platform is and that they must join or create a party to participate
 
**P0-02 — User profile**
- Display name (required)
- Short bio (optional, max 160 chars)
- Party membership badge (visible once joined)
- Party history log (list of past parties with dates — visible to all)
- No profile photo for MVP (reduces friction, avoids moderation complexity)
 
---
 
### 2. Party Discovery
 
**P0-03 — Browse parties page** *(updated v0.3)*
- Grid of party cards (mobile: single column, desktop: 2–3 columns)
- Each card shows: party logo, party name, short tagline, membership model, activity status, member count
- Archetype label (Vanguard / Republic / Commune / Custom) is **not shown** on cards or anywhere publicly — only raw governance config values are visible on the party profile page
- Default sort: most recently active
- Filter by: membership model (open / application / invite-only), activity status (active / dormant)
- Search by party name
- Dormant parties (30+ days inactive leader) shown with a visual badge
- Dissolved parties visible but clearly marked, not shown by default (toggle to show)
 
**P0-04 — Party public profile page** *(updated v0.3)*
- Party logo and name
- Tagline / short description
- Status pills: activity status, membership model — archetype label is **not shown**
- Full manifesto (rendered rich text, read-only)
- Current stance (short live status set by leader)
- Governance configuration details: all raw parameter values visible (recall petition threshold, recall vote threshold, manifesto approval method, membership model, member removal authority, mufakat voice) — no archetype label
- Member count and leader display name
- Leader last active indicator
- Join / Apply / Request invite CTA (depending on membership model)
- List of current members (display names only)
 
---
 
### 3. Party Creation
 
**P0-05 — Create party flow** *(updated v0.3)*
 
**Step 1: Select starting point**
 
Four options:
- **Vanguard** — "Ketua memutuskan. Anggota menjalankan." Pre-fills all parameters with Vanguard defaults.
- **Republic** — "Ketua mengusulkan. Anggota meratifikasi." Pre-fills all parameters with Republic defaults.
- **Commune** — "Semua keputusan lewat suara." Pre-fills all parameters with Commune defaults.
- **Custom** — "Atur sendiri semua parameternya." Proceeds to Step 2 with all parameter fields blank.
 
Selecting Vanguard, Republic, or Commune → proceeds to Step 2 with parameters pre-filled from that preset (all adjustable).
Selecting Custom → proceeds to Step 2 with all parameter fields blank (no defaults applied).
 
The archetype selection is an internal founding tool only. No archetype label is stored or displayed publicly after party creation — only the resulting raw config values are visible.
 
**Step 2: Set governance parameters**
 
Applies to all four paths. Parameters and valid ranges:
- Recall petition threshold: 10%–50%
- Recall vote threshold: 50%+1 to 75%
- Manifesto change approval: leader only → ratification → full member vote
- Membership model: open / application / invite-only
- Member removal authority: leader only → leader with contest window → member vote
- Official mufakat voice: leader only → ratified internally first
 
For preset paths (Vanguard / Republic / Commune): all fields arrive pre-filled. CTA is active immediately — founder can proceed without adjusting anything.
 
For Custom path: all fields arrive blank. CTA is disabled until every parameter has been explicitly set. A completion counter ("X dari Y parameter belum diatur") gives progress feedback.
 
**Step 3: Party identity**
- Party name
- Logo upload (see P0-07)
- Tagline
- Full manifesto (TipTap rich text editor, see P0-06)
 
**Step 4: Enable council**
- Optional toggle
- If enabled, council role creation is available post-publish (Phase 2)
 
**Step 5: Review & publish**
- All settings displayed for final review
- On publish: configuration permanently locked. User becomes party leader. 3-month honeymoon period begins.
 
**P0-06 — Manifesto editor**
- TipTap rich text editor
- Supports: headings (H2, H3), bold, italic, bullet lists, numbered lists, block quotes
- No image embeds in manifesto for MVP
- Character minimum: 200 chars (forces substance)
- Auto-save draft
 
**P0-07 — Party logo upload**
- Image upload to Supabase Storage
- Accepted formats: JPG, PNG, WebP
- Max size: 2MB
- Cropped to square on upload
 
---
 
### 4. Joining a Party
 
**P0-08 — Open join**
- Single CTA button on party profile
- User joins instantly
- Confirmation screen: "Kamu sekarang anggota [nama partai]. Bendera partaimu sekarang terlihat di seluruh platform."
- If user is already in a party: prompt to leave current party first, with warning that this is logged on their profile
 
**P0-09 — Application join**
- User submits short application (free text, max 500 chars)
- Leader (or delegated role) reviews in party management panel
- Approve / Reject actions
- Applicant notified on decision
- No application queue limit for MVP
 
**P0-10 — Invite-only join**
- Existing members can generate an invite link
- Link is single-use, expires in 7 days
- Recipient lands on party profile with join CTA pre-activated
- No invite link generation for non-members
 
**P0-11 — Leave party**
- Available from user profile or party page
- Confirmation dialog: "Leaving is permanent until you request to rejoin. This will be logged on your profile history."
- After leaving, user's party flag is removed from all future posts. Past posts retain the flag at time of posting.
 
---
 
### 5. Post-Join & Post-Approval Flows *(added v0.2)*
 
**P0-12 — Post-join nudge screen**
- Shown immediately after join confirmation (all three join types: open, application approval, invite acceptance)
- Acknowledges the membership moment, then directs to mufakat
- Copy: "Bendera kamu sudah terpasang. Sekarang bawa posisimu ke diskusi."
- Single CTA: "Pergi ke Mufakat" linking to mufakat.alternatif.space
- Not a modal — a full screen. The moment should feel like something.
 
**P0-13 — Post-approval share flow**
- Shown immediately after party moderation approval is notified to the creator
- Pre-composed visual share card: party logo, party name, tagline, alternatif.space branding
- Single share button triggers Web Share API (`navigator.share()`) — surfaces OS native share sheet
- Share sheet covers: Instagram Story, X, Facebook, WhatsApp, Telegram, and all other OS-installed apps without platform-specific integration
- Fallback for browsers that don't support Web Share API: copy link button only
- OG meta tags configured per party page (`og:title`, `og:description`, `og:image`) so link previews render correctly on all platforms
- OG image is the same pre-composed share card, generated at party creation and stored in Supabase Storage
 
---
 
## Phase 1 — Internal Party Life
 
**Goal:** Members have a reason to stay. Parties can communicate internally, deliberate, and run basic governance votes.
 
**Success criteria:** At least 3 parties completing a full internal vote (manifesto amendment or pulse check). Average session length increases.
 
**Dependency:** Phase 0 validated — at least 5 active parties with 10+ members each, and evidence of party flags active in mufakat, before Phase 1 build begins.
 
---
 
### 6. Internal Communications (Layer 1)
 
**P1-01 — Announcement feed**
- One-way broadcast from leader (or delegated role) to all members
- Always triggers push/in-app notification to all members
- Cannot be replied to — read-only
- Pinned at top of internal feed until manually unpinned
 
**P1-02 — Discussion threads**
- Members can read all threads
- In Vanguard and Republic configs: only leader can open new threads (members reply)
- In Commune config: any member can open new threads
- Leader can pin (max 3 at a time), close, and mark threads as "leading to a vote"
- Closed threads are read-only, not deleted
- Notifications: only active participants in a thread are notified of new replies
 
**P1-03 — Direct message to all**
- Personal-register broadcast from leader to all members
- Distinct from Announcement in tone — displayed differently in feed
- Always triggers notification
- Not replyable
 
**P1-04 — Position brief**
- Structured internal document: stance, key arguments, what to avoid saying publicly
- Posted by leader or delegated role
- Always triggers notification (lower urgency than Announcement)
- Visible to members only
 
**P1-05 — Notification centre**
- In-app notification list
- Notification weight: Announcement (high), Pulse Check (high, deadline shown), Direct Message (high), Position Brief (medium), Discussion reply (low — only if participant)
- Leader dashboard shows "notifications sent this week" count as soft nudge against over-notification
 
---
 
### 7. Governance Mechanics (Layer 2)
 
**P1-06 — Pulse check**
- Lightweight informal poll, not a binding governance vote
- Leader creates: question + 2–5 options + optional deadline
- Result visibility follows governance config: high-recall-threshold configs (internal only), mid configs (leader's choice per check), low-recall-threshold configs (always public)
- Minimum 3 members required to run
- Always triggers notification with deadline visible
 
**P1-07 — Manifesto amendment vote**
- Leader proposes edit (shows diff of current vs proposed manifesto)
- Members notified of open vote with deadline
- Voting widget: For / Against
- Passes at 50%+1 (or configured threshold)
- Minimum 3 members required
- On pass: manifesto updates, change logged with timestamp
- On fail: proposal archived, current manifesto unchanged
 
**P1-08 — Recall petition**
- Any member can initiate
- Petition requires configured % of members to sign (min 10%, max 50%)
- Blocked during 3-month honeymoon period — blocked state shown clearly if attempted
- Live signature counter visible to all members
- On threshold reached: recall vote automatically triggered
 
**P1-09 — Recall vote**
- Time-bound (72 hours default)
- Members vote: Remove / Keep
- Passes at configured threshold (min 50%+1, max 75%)
- Minimum 10 members required for petition and vote to be valid
- On pass: leader is removed, deputy (if exists) becomes caretaker leader for 7 days, then new election or dissolution
- On fail: petition archived, current leader remains, new petition cannot be started for 30 days
- Outcome published publicly on party profile
 
**P1-10 — Name & logo ratification (post-honeymoon)**
- During honeymoon: leader edits freely
- Post-honeymoon: leader proposes change → member vote (50%+1) required
- Exception: parties with leader-only manifesto config (equivalent to Vanguard preset) — leader can always edit freely
 
---
 
## Phase 2 — Governance Depth & Cross-Platform Powers
 
**Goal:** Mature parties can run sophisticated internal governance. Party identity carries weight across mufakat and simposium.
 
**Success criteria:** At least 2 parties using council roles. At least 1 official position stamp used on mufakat. Platform governance rules being discussed by community.
 
**Dependency:** Phase 1 validated — evidence of genuine internal deliberation before Phase 2 build begins.
 
---
 
### 8. Council Roles
 
**P2-01 — Council enable/configure**
- Optional toggle during party creation (can also be enabled post-creation by leader)
- Leader creates custom roles with: name, permission set selection, stackability flag
- Roles can be created, modified, or deleted anytime by leader
- Modifying an active role updates permissions of current holder immediately
 
**P2-02 — Role appointments**
- Leader-only removal config: leader assigns freely
- Leader-proposes config: leader assigns, members can contest within 24 hours
- Member-vote config: member vote required (50%+1)
- A role with no one appointed sits empty — permissions inactive
 
**P2-03 — Permission set**
 
Internal permissions (delegable via council roles):
- Post announcements
- Post position briefs
- Start proposal threads
- Close / archive discussion threads
- Pin posts
- Warn members
- Mute members
- Suspend members
- Approve membership applications
- Remove members
 
Cross-platform permissions (delegable):
- Post official position stamp on mufakat
- Issue party distancing
- Issue party response
- Nominate threads for simposium
- Designate simposium speaker
- Designate simposium observers
 
Governance permissions (delegable):
- Propose manifesto amendments
- Initiate dissolution
 
Non-delegable — leader only:
- Initiate voluntary dissolution
- Transfer leadership voluntarily
- Revoke all council roles
- Create / delete role definitions
 
---
 
### 9. Member Conduct System
 
**P2-04 — Graduated conduct actions**
 
| Action | Leader-only config | Mixed config | Member-vote config |
|---|---|---|---|
| Warning | Leader only | Leader only | Any member flags; leader issues |
| Mute | Leader only | Leader only | Member vote |
| Suspension | Leader only | Leader decides | Member vote |
| Removal | Leader only | Leader decides | Member vote |
 
- Mute: member remains in party but mufakat posts no longer carry the party flag
- Suspended: read-only access to internal discussions
- All actions except warnings are appealable
- Appeals are logged and visible to all members
- Leader or council can affirm or reverse
 
**P2-05 — Minimum member thresholds**
 
| Mechanic | Minimum Members |
|---|---|
| Pulse check / internal votes | 3 |
| Manifesto amendment | 3 |
| Member removal vote | 5 |
| Voluntary dissolution ratification | 5 |
| Recall petition | 10 |
| Recall vote | 10 |
 
---
 
### 10. Cross-Platform Powers
 
**P2-06 — Official position stamp (mufakat)**
- Leader marks one post per thread as the party's formal position
- Visually distinct from regular posts
- Can be applied to leader's own post or a member's post
- In member-vote manifesto config: stamp auto-issues once internal ratification vote passes
- Stamp is a separate object — edits to the original post don't affect it
- Leader can revoke anytime
- If stamped member leaves party: stamp shows "Official position of [Party] at time of posting"
 
**P2-07 — Party distancing (mufakat)**
- Leader publicly dissociates the party from a member's post
- Post is flagged as member's personal view, not the party's
- Member remains in the party — this is not a conduct action
- Logged publicly
 
**P2-08 — Party response (mufakat)**
- Formal reply to another party's official stamped position
- One official response per thread per party
- Visually distinct from regular replies
 
**P2-09 — Thread nomination (mufakat)**
- Leader officially backs a thread for advancement to simposium
- Carries more weight than a standard upvote in the ranking algorithm
 
**P2-10 — Simposium powers**
- Speaker designation: leader nominates who represents party in a live session
- Observer designation: marks members as official party presence without speaking rights
- Post-session ratification: leader endorses or rejects positions speaker took — logged publicly on party's session record
 
---
 
### 11. Dissolution & Succession
 
**P2-11 — Voluntary dissolution**
- Leader initiates
- Members ratify (50%+1, minimum 5 members)
- On dissolution: party archived, marked as dissolved, history preserved publicly
 
**P2-12 — Deputy leader**
- Single designated second-in-command
- Assumes leader capabilities after 7 days of leader inactivity
- Caretaker role, not permanent replacement
 
**P2-13 — Inactive leader handling**
- Activity indicator on public party page: "Last active: X days ago"
- Caretaker mode: deputy assumes leader capabilities after 7 days inactivity
- Dormant badge on browse page after 30 days inactivity
- Dissolution trigger: 60 days inactivity with no deputy → member vote to appoint new leader or dissolve
 
---
 
## Deferred (Not in Any Phase)
 
The following are out of scope until explicitly reopened:
 
- Notifications via email or SMS (in-app only for MVP)
- Social login (Google, Twitter, etc.)
- Profile photos
- Direct messaging between users
- Party analytics dashboard
- Paid/premium features
- API access
- Mobile native app (PWA only)
 
---
 
*This document reflects the current state of design decisions. All Phase 0 decisions are locked. Phase 1 and 2 decisions are subject to revision based on Phase 0 learnings.*
