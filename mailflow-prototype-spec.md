# MailFlow Prototype Spec

**Product:** MailFlow — a B2B email marketing SaaS
**Deliverable:** A lightweight, frontend-only UX prototype with dummy data
**Audience for this spec:** Designers, prototypers, and the engineer scaffolding the Vite app
**Companion docs:** [orbital-prototype-spec.md](orbital-prototype-spec.md), [orbital.ai/mail-flow-orbital-user-journey.md](orbital.ai/mail-flow-orbital-user-journey.md)

---

## 1. Product Overview

MailFlow is a B2B SaaS product that helps small and mid-sized marketing teams create, send, and measure email campaigns. It positions itself between simple newsletter tools (too shallow) and enterprise marketing clouds (too heavy), giving growth teams a fast path from "I have a contact list" to "I have a measurable campaign."

### Primary personas

| Persona | Role | Goals | Typical plan |
|---|---|---|---|
| **Maya** | Marketing Manager at an SMB | Launch her first newsletter, look professional, not break anything | Free / Trial |
| **Devon** | Growth Lead at a mid-market startup | A/B test subject lines, automate follow-ups, prove ROI | Pro |
| **Priya** | Marketing Ops at a larger team | Manage teammates, integrations, and deliverability | Enterprise |

### Prototype goals

1. Demonstrate the full product surface area with realistic dummy data so stakeholders can click through every major flow.
2. Be **embeddable as the host app** for the Orbital AI overlay described in [orbital-prototype-spec.md](orbital-prototype-spec.md) — every key interactive element is addressable by a stable id, and the product state is introspectable.
3. Ship as a **frontend-only** app (no backend, no auth, no real email sending).

### Non-goals

See Section 8.

---

## 2. Recommended Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Build tool | **Vite** | Fastest dev server for a frontend-only SPA |
| Framework | **React 18** + **TypeScript** | Matches the stack assumed in [orbital-prototype-spec.md](orbital-prototype-spec.md) |
| Styling | **Tailwind CSS** | Matches Orbital spec; fast iteration on design tokens |
| Routing | **React Router v6** | Client-side routing for ~10 screens |
| State | **Zustand** | Tiny, ergonomic, easy to snapshot for Orbital |
| Charts | **Recharts** | Minimal API, composes with Tailwind |
| Icons | **lucide-react** | Clean, consistent SaaS iconography |
| Fake data | Hand-authored JSON in `src/mock/` | Deterministic, reviewable in PRs |
| Persistence | `localStorage` mirror of the Zustand store (optional) | Lets a demo survive a refresh; can be toggled off |
| Linting | ESLint + Prettier + `typescript-eslint` | Standard baseline |

**No backend, no API calls, no auth screens.** A fake `currentUser` is always "logged in" from `src/mock/user.ts`.

### Suggested folder layout

```
mailflow/
  src/
    app/                  # AppRoot, router, providers
    components/           # Button, Input, Modal, Table, Card, Sidebar, TopBar, EmptyState, Toast
    features/
      dashboard/
      campaigns/
      templates/
      audiences/
      automations/
      analytics/
      settings/
    mock/                 # campaigns.ts, templates.ts, contacts.ts, segments.ts, automations.ts, user.ts
    store/                # zustand slices
    orbital/              # OrbitalSlot, window bridge, data-orbital-id registry
    lib/                  # formatters, date helpers
    styles/               # tailwind.css, tokens
  index.html
  tailwind.config.ts
  vite.config.ts
```

---

## 3. Information Architecture

### Global chrome

- **Left sidebar (persistent):**
  - Logo (MailFlow wordmark)
  - Workspace switcher (dropdown, 1 workspace by default)
  - Nav: Dashboard, Campaigns, Templates, Audiences, Automations, Analytics, Settings
  - Footer: "Upgrade to Pro" card (Free plan only), help/keyboard-shortcut button
- **Top bar (persistent):**
  - Breadcrumb / page title
  - Global search (mock — opens a command palette that filters campaigns/templates/contacts by name)
  - Notifications bell (bade count, opens popover with 3–5 mock notifications)
  - User avatar menu (Profile, Settings, Sign out — all inert)

### Route map

| Path | Screen |
|---|---|
| `/` | Dashboard |
| `/campaigns` | Campaigns — List |
| `/campaigns/new` | Campaigns — Create Wizard (4 steps via query param `?step=`) |
| `/campaigns/:id` | Campaigns — Detail / Report |
| `/templates` | Templates — Gallery |
| `/audiences` | Audiences (tabs: Contacts, Segments) |
| `/automations` | Automations — List |
| `/automations/:id` | Automations — Builder |
| `/analytics` | Analytics |
| `/settings` | Settings (tabs: Profile, Workspace, Billing, Team, Integrations) |

---

## 4. Screen Inventory

Each screen below lists: **purpose**, **key UI**, **dummy data shown**, **primary CTAs**, and **`data-orbital-id` anchors** (see Section 7 for the registry).

### 4.1 Dashboard — `/`

- **Purpose:** Snapshot of account health + quick access to common actions.
- **Key UI:**
  - 4 KPI cards: `Emails sent (30d)`, `Avg open rate`, `Avg click rate`, `Total subscribers`
  - "Recent campaigns" table (last 5), with status chips
  - "Quick start" card row: `Create a campaign`, `Import contacts`, `Browse templates`
  - Activity feed (right rail): "Newsletter #14 sent", "42 new subscribers", etc.
- **Empty state:** If no campaigns exist, replace the table with a full-bleed onboarding card: *"No campaigns yet. Send your first one in under 5 minutes."* with a **Create campaign** CTA.
- **Orbital anchors:** `dashboard-kpi-sent`, `dashboard-quickstart-create`, `dashboard-quickstart-import`, `dashboard-recent-campaigns-table`.

### 4.2 Campaigns — List — `/campaigns`

- **Purpose:** Manage all campaigns.
- **Key UI:** Toolbar (search, status filter chips: All/Draft/Scheduled/Sent, date range), primary **+ Create campaign** button, table (Name, Status, Audience, Sent/Scheduled date, Open rate, Click rate, row menu).
- **Empty state:** Illustration + "You haven't created a campaign yet" + Create CTA.
- **Orbital anchors:** `campaigns-list-create-btn`, `campaigns-list-filter-status`, `campaigns-list-row-<id>`.

### 4.3 Campaigns — Create Wizard — `/campaigns/new`

Four steps, each a separate screen section controlled by `?step=1..4`. A persistent stepper sits above the content; Back/Next at the bottom; "Save as draft" top-right.

1. **Template** — gallery grid (thumbnail, name, category). Clicking a card selects it.
2. **Audience** — choose an existing segment or "All contacts". Shows the resulting recipient count live.
3. **Content** — fields: From name, From email (locked to workspace domain), Subject, Preheader. Below: a simple WYSIWYG placeholder (textarea + preview pane). Optional "+ Add A/B variant" (adds a second subject line — counts toward `active_tests`).
4. **Review & Schedule** — summary of the above + radio: "Send now" / "Schedule for later" (datetime picker). Primary CTA **Send campaign** or **Schedule campaign**.

- **On send:** push a toast "Campaign sent to N recipients", transition the campaign to `sent`, animate the dashboard KPIs on next visit, route to the Detail screen.
- **Orbital anchors:** `wizard-step-template`, `wizard-step-audience`, `wizard-step-content`, `wizard-step-review`, `wizard-next-btn`, `wizard-send-btn`, `wizard-add-variant-btn`.

### 4.4 Campaigns — Detail / Report — `/campaigns/:id`

- **Purpose:** See how a sent campaign performed.
- **Key UI:**
  - Header: campaign name, status chip, sent timestamp, "Duplicate" / "Archive" menu
  - KPI row: Recipients, Delivered, Open rate, Click rate, Bounce rate, Unsubscribes
  - Tabs: **Overview** (line chart of opens/clicks over 24h), **Links** (table of clicked URLs + click counts), **Recipients** (paginated mock list, 20 rows), **A/B Results** (only if the campaign has variants — bar chart comparing variants)
- **Draft / Scheduled variant:** If the campaign isn't `sent`, this screen shows a summary + **Edit** / **Send now** buttons instead of analytics.
- **Orbital anchors:** `campaign-detail-send-now`, `campaign-detail-tab-ab`.

### 4.5 Templates — `/templates`

- **Purpose:** Browse and preview templates.
- **Key UI:** Category sidebar (Newsletter, Announcement, Promo, Transactional, Blank), gallery grid of thumbnails, hover reveals **Preview** and **Use template** buttons. Clicking Preview opens a modal with a larger render; **Use template** routes to `/campaigns/new?step=2&templateId=...`.
- **Orbital anchors:** `templates-category-newsletter`, `templates-card-<id>`, `templates-use-btn-<id>`.

### 4.6 Audiences — `/audiences`

Two tabs:

- **Contacts**
  - Toolbar: search by email, filter by tag, **Import CSV** (mock — opens a modal with a drag-drop zone; clicking "Upload sample" instantly adds 50 contacts and sets `CONTACTS_UPLOADED = true`), **+ Add contact**
  - Table: Email, Name, Tags, Subscribed, Added on, row menu
- **Segments**
  - List of segments with contact counts; **+ New segment** opens a modal with rule chips: `Tag is X`, `Signed up after Y`, `Opened last campaign`. Preview count updates live.
- **Orbital anchors:** `audiences-tab-contacts`, `audiences-tab-segments`, `audiences-import-btn`, `audiences-new-segment-btn`.

### 4.7 Automations — `/automations` and `/automations/:id`

- **List screen:** cards for each automation (name, trigger summary, status toggle, last run, contacts in workflow). **+ Create automation** CTA.
- **Builder screen:** **Linear stepper** (not a free-form canvas — see Section 9): vertical column of nodes — Trigger → Delay → Send email → (optional) Branch on "opened?" → Send email. Each node is a click-to-edit card. A right rail shows node details.
- **Orbital anchors:** `automations-create-btn`, `automations-trigger-node`, `automations-add-step-btn`.

### 4.8 Analytics — `/analytics`

- **Purpose:** Cross-campaign performance.
- **Key UI:**
  - Date range selector (Last 7 / 30 / 90 days, Custom)
  - KPI row: Sent, Delivered, Open rate, Click rate, Unsubscribe rate
  - Line chart: Opens & clicks over time
  - Bar chart: Top 5 campaigns by open rate
  - Funnel viz: Sent → Delivered → Opened → Clicked
- **Orbital anchors:** `analytics-date-range`, `analytics-funnel`.

### 4.9 Settings — `/settings`

Five tabs (horizontal):

1. **Profile** — name, email, avatar (inert upload)
2. **Workspace** — workspace name, sending domain (`hello@mailflow.demo`, locked), timezone
3. **Billing** — current plan card (Free/Pro/Enterprise with feature list), **Upgrade** button, mock invoice list (3 rows), payment method card (Visa •••• 4242). Clicking **Upgrade** sets `checkout_initiated = true` and routes to a mock `/settings?tab=billing&checkout=1` state that renders a checkout summary.
4. **Team** — list of teammates with roles; **+ Invite teammate** opens a modal (email + role). Each successful invite increments `teammate_count_delta`.
5. **Integrations** — grid of logos (Slack, HubSpot, Salesforce, Zapier, Shopify) — all "Connect" buttons are inert.
- **Orbital anchors:** `settings-tab-billing`, `settings-upgrade-btn`, `settings-invite-teammate-btn`.

### 4.10 Empty states (global)

Every list/table has a deliberate empty state (illustration + headline + subtext + CTA). This is essential for the Orbital AI "first campaign" journey described in [orbital.ai/mail-flow-orbital-user-journey.md](orbital.ai/mail-flow-orbital-user-journey.md).

---

## 5. Dummy Data Model

TypeScript-style shapes. Actual files live under `src/mock/` and export typed arrays.

```ts
type ID = string;

type User = {
  id: ID;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  plan: 'free' | 'pro' | 'enterprise';
  avatarUrl?: string;
};

type Contact = {
  id: ID;
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  subscribed: boolean;
  createdAt: string;   // ISO
};

type SegmentRule =
  | { type: 'tag'; op: 'is' | 'isNot'; value: string }
  | { type: 'signupDate'; op: 'after' | 'before'; value: string }
  | { type: 'engagement'; op: 'opened' | 'clicked' | 'notOpened'; campaignId?: ID };

type Segment = {
  id: ID;
  name: string;
  rules: SegmentRule[];
  contactCount: number;  // precomputed
};

type Template = {
  id: ID;
  name: string;
  category: 'newsletter' | 'announcement' | 'promo' | 'transactional' | 'blank';
  thumbnailUrl: string;
  previewHtml?: string;
};

type CampaignVariant = {
  id: ID;
  subject: string;
  stats?: CampaignStats;
};

type CampaignStats = {
  recipients: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
};

type Campaign = {
  id: ID;
  name: string;
  status: 'draft' | 'scheduled' | 'sent';
  audienceId: ID;          // segmentId or special 'all'
  templateId: ID;
  fromName: string;
  fromEmail: string;
  subject: string;
  preheader?: string;
  scheduledFor?: string;   // ISO
  sentAt?: string;         // ISO
  variants?: CampaignVariant[];  // presence implies A/B test
  stats?: CampaignStats;          // only when sent
};

type AutomationTrigger =
  | { type: 'contactAdded' }
  | { type: 'tagApplied'; tag: string }
  | { type: 'campaignNotOpened'; campaignId: ID };

type AutomationStep =
  | { type: 'delay'; hours: number }
  | { type: 'sendEmail'; templateId: ID; subject: string }
  | { type: 'branch'; on: 'opened' | 'clicked'; yes: AutomationStep[]; no: AutomationStep[] };

type Automation = {
  id: ID;
  name: string;
  status: 'active' | 'paused' | 'draft';
  trigger: AutomationTrigger;
  steps: AutomationStep[];
  contactsInWorkflow: number;
  lastRunAt?: string;
};
```

### Seed volumes

| Entity | Count |
|---|---|
| Users | 1 (current) + 4 teammates |
| Contacts | ~50 |
| Segments | 4 (`All contacts`, `Engaged last 30d`, `New signups`, `VIPs`) |
| Templates | 8 (2 per category except blank) |
| Campaigns | 12 (2 draft, 2 scheduled, 8 sent; 2 of the sent have A/B variants) |
| Automations | 3 (1 active, 1 paused, 1 draft) |
| Notifications | 5 |
| Invoices | 3 |

Stats should look realistic (open rates 20–45%, click rates 2–8%, bounces <2%).

---

## 6. Design System

### Tokens

| Token | Value |
|---|---|
| `--color-primary` | `#0984e3` |
| `--color-primary-hover` | `#0873c4` |
| `--color-bg` | `#f8fafc` (slate-50) |
| `--color-surface` | `#ffffff` |
| `--color-border` | `#e2e8f0` (slate-200) |
| `--color-text` | `#0f172a` (slate-900) |
| `--color-text-muted` | `#64748b` (slate-500) |
| `--color-success` | `#10b981` |
| `--color-warning` | `#f59e0b` |
| `--color-danger` | `#ef4444` |
| `--radius` | `8px` |
| `--radius-lg` | `12px` |
| `--shadow-card` | `0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(79,70,229,.06)` |
| `--font` | `"Inter", system-ui, sans-serif` |

Tailwind `theme.extend` should mirror the tokens so utility classes like `bg-primary`, `rounded-md`, `shadow-card` work.

### Components to build

`Button` (variants: primary, secondary, ghost, danger; sizes: sm, md, lg), `IconButton`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Tabs`, `Modal`, `Popover`, `Dropdown`, `Tooltip`, `Badge`/`StatusChip`, `Table`, `Card`, `Sidebar`, `TopBar`, `Stepper`, `EmptyState`, `Toast` (+ `useToast` hook), `KPIStat`, `ChartCard`.

### Status chip colors

| Status | Color |
|---|---|
| Draft | slate |
| Scheduled | amber |
| Sent | emerald |
| Paused | slate |
| Active | emerald |

### Charts

Recharts with brand palette: primary `#0984e3`, secondary `#6366f1` (indigo-500), tertiary `#10b981`. Gridlines `slate-100`, axis labels `slate-500`, tooltip surface `white` with `shadow-card`.

---

## 7. Mock State & Interactivity Rules

### State organization (Zustand slices)

- `authSlice` — currentUser, plan
- `campaignsSlice` — campaigns, CRUD actions
- `contactsSlice` — contacts, segments, import action
- `templatesSlice` — read-only list
- `automationsSlice` — automations, CRUD
- `billingSlice` — checkoutInitiated, plan
- `teamSlice` — teammates, inviteTeammate (bumps `teammate_count_delta`)
- `uiSlice` — toasts, modals, sidebar collapsed

### Interactivity requirements

- All list filters, search boxes, and tabs **must work** (not be visual-only).
- The Create Campaign wizard must actually add a new campaign to the store on send.
- "Send now" on a scheduled/draft campaign transitions `status` to `sent`, assigns a realistic `stats` object, and fires a toast.
- Importing the sample CSV adds 50 contacts at once and sets the derived flag `CONTACTS_UPLOADED = true`.
- Inviting a teammate increments `teammate_count_delta` (rolling 24h counter — for the prototype, persist since last page load).
- Upgrading from the Billing tab sets `checkout_initiated = true`. Navigating away from `/settings?checkout=1` without completing sets a `checkoutAbandoned` flag (Orbital Journey C).
- Optional `localStorage` mirror of the store, gated by a dev switch in the footer so demos can be reset cleanly.

### No-real-data rules

- Dates in the seed are computed at load time as offsets from `now` so the prototype always looks fresh.
- Email addresses use `@example.com` or `@mailflow.demo`.
- Names from a small curated pool; no PII.

---

## 8. Orbital Integration Hooks

This section is the contract between MailFlow and the Orbital overlay defined in [orbital-prototype-spec.md](orbital-prototype-spec.md).

### 8.1 The `<OrbitalSlot />` mount point

The root layout renders:

```tsx
<AppShell>
  <Sidebar />
  <TopBar />
  <main>{children}</main>
  <OrbitalSlot />  {/* no-op if the overlay isn't installed */}
</AppShell>
```

`OrbitalSlot` is a thin component in `src/orbital/OrbitalSlot.tsx` that renders `null` by default. When the Orbital overlay is installed, it replaces the export with its real implementation (or the overlay finds the slot by id `#orbital-root`).

### 8.2 The `window.__mailflow` bridge

On every relevant state change, MailFlow writes a **read-only snapshot** to `window.__mailflow` so Orbital can observe without coupling:

```ts
window.__mailflow = {
  user: { id, plan, role },
  flags: {
    CONTACTS_UPLOADED: boolean,
    CAMPAIGN_CREATED: boolean,
    active_tests: number,          // count of campaigns with variants, not yet completed
    checkout_initiated: boolean,
    teammate_count_delta: number,  // teammates added in the last 24h
  },
  route: string,                   // current pathname
  lastEvent?: { type: string; at: number; payload?: unknown },
};
```

An event bus (`window.__mailflow.on(event, cb)`) emits: `campaign:created`, `campaign:sent`, `contacts:imported`, `teammate:invited`, `checkout:started`, `checkout:abandoned`, `ab:started`, `route:changed`.

### 8.3 `data-orbital-id` registry

Every element Orbital needs to highlight gets a stable, kebab-case id. The prototype ships a single source of truth at `src/orbital/ids.ts` so typos are caught at compile time.

| Area | ID |
|---|---|
| Sidebar | `sidebar-dashboard`, `sidebar-campaigns`, `sidebar-templates`, `sidebar-audiences`, `sidebar-automations`, `sidebar-analytics`, `sidebar-settings`, `sidebar-upgrade-card` |
| Top bar | `topbar-search`, `topbar-notifications`, `topbar-user-menu` |
| Dashboard | `dashboard-kpi-sent`, `dashboard-kpi-open-rate`, `dashboard-kpi-click-rate`, `dashboard-kpi-subscribers`, `dashboard-quickstart-create`, `dashboard-quickstart-import`, `dashboard-quickstart-templates`, `dashboard-recent-campaigns-table` |
| Campaigns list | `campaigns-list-create-btn`, `campaigns-list-filter-status`, `campaigns-list-search` |
| Create wizard | `wizard-step-template`, `wizard-step-audience`, `wizard-step-content`, `wizard-step-review`, `wizard-subject-input`, `wizard-audience-select`, `wizard-add-variant-btn`, `wizard-next-btn`, `wizard-back-btn`, `wizard-send-btn` |
| Campaign detail | `campaign-detail-send-now`, `campaign-detail-tab-overview`, `campaign-detail-tab-links`, `campaign-detail-tab-recipients`, `campaign-detail-tab-ab` |
| Templates | `templates-category-newsletter`, `templates-category-announcement`, `templates-category-promo`, `templates-category-transactional`, `templates-use-btn` |
| Audiences | `audiences-tab-contacts`, `audiences-tab-segments`, `audiences-import-btn`, `audiences-import-upload-sample`, `audiences-new-segment-btn` |
| Automations | `automations-create-btn`, `automations-trigger-node`, `automations-add-step-btn`, `automations-status-toggle` |
| Analytics | `analytics-date-range`, `analytics-funnel`, `analytics-top-campaigns` |
| Settings | `settings-tab-profile`, `settings-tab-workspace`, `settings-tab-billing`, `settings-tab-team`, `settings-tab-integrations`, `settings-upgrade-btn`, `settings-invite-teammate-btn` |

### 8.4 Mapping to Orbital journeys

The prototype must at minimum support the four journeys from [orbital-prototype-spec.md](orbital-prototype-spec.md):

| Journey | Flag(s) needed | Anchor(s) needed |
|---|---|---|
| A — Free Activation Rescue | `CONTACTS_UPLOADED && !CAMPAIGN_CREATED` | `sidebar-templates`, `dashboard-quickstart-create` |
| B — Contextual Paywall | `active_tests == 2`, click on `wizard-add-variant-btn` | `wizard-add-variant-btn` |
| C — Revenue Recovery | `checkout_initiated && route !== '/settings?checkout=1'` | `settings-tab-billing`, `settings-upgrade-btn` |
| D — Expansion Signal | `teammate_count_delta >= 3` | `settings-invite-teammate-btn` |

---

## 9. Non-Goals

Explicitly out of scope for this prototype:

- Any real backend, API, or database
- Authentication, sign-up, password reset, SSO
- Real email sending or SMTP integration
- Real payment processing (Stripe/etc.) — billing is a mock UI only
- Mobile-native apps
- Internationalization / RTL
- Full WCAG audit (we target reasonable defaults: focus rings, labels, color contrast)
- A free-form drag-and-drop automation canvas (the prototype uses a linear stepper — see Open Questions)
- A real WYSIWYG email editor (a textarea + preview pane is sufficient)
- Deliverability engines, bounce handling, suppression lists beyond a `subscribed` flag

---

## 10. Open Questions

Please confirm or overrule before build begins:

1. **Billing UI depth** — is a plan-card + mock invoice list + inert "Upgrade" button enough, or do we need a fake Stripe-style checkout overlay (for Journey C's "Revenue Recovery" to feel real)?
2. **Automations builder** — linear vertical stepper (proposed) or a free-form node canvas with drag-and-drop? The stepper is ~5x less effort and covers the Orbital journeys; the canvas is more impressive in demos.
3. **Email editor** — textarea + live preview (proposed) or a block-based editor (headline / text / image / button blocks)?
4. **Persistence** — should demo state survive a hard refresh via `localStorage` (default on), or always reset to the seed for clean demo runs?
5. **Branding** — the working name is **MailFlow** with primary `#0984e3`. Any logo or alternate palette to use, or is the generated wordmark fine for the prototype?
6. **Dark mode** — in or out? (Out by default.)

---

## 11. After Approval — Build Plan (Preview)

Once this spec is signed off, the build task will:

1. Scaffold Vite + React + TS + Tailwind and install deps.
2. Lay down the design system (tokens, base components).
3. Implement the Zustand store with seed data.
4. Build the shell (Sidebar + TopBar + routing + `<OrbitalSlot />`).
5. Build screens in this order: Dashboard → Campaigns (list + wizard + detail) → Templates → Audiences → Analytics → Automations → Settings.
6. Wire up the `window.__mailflow` bridge and the `data-orbital-id` registry.
7. Polish: empty states, toasts, loading shimmer where appropriate.
8. Smoke-test each of the four Orbital journeys end-to-end manually.
