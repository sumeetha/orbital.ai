# Orbital AI Admin — Changelog

## 2026-04-20 (cont. 5)

### Move Integrations Outside Copilot Menu

Promoted Integrations from a Copilot sub-item to a top-level sidebar link, positioned between Copilot and Engagements.

**File:** `src/components/Sidebar.tsx`
- Removed `{ to: '/integrations', ... }` from `argusItems` array
- Added top-level `NavLink` for `/integrations` with `Plug` icon between Copilot section and Engagements section

**Spec:** Updated §3 sidebar nav to show Integrations as top-level; updated route map sidebar location from "Argus Copilot → Integrations" to "Integrations"

---

## 2026-04-20 (cont. 4)

### MailFlow Orbital: Dynamic Question-Led Scenario + Tour Stability Fixes

Implemented a third MailFlow demo scenario and dynamic tour generation from chat questions, then hardened multiple edge cases discovered during live walkthrough testing.

#### New: Scenario 3 — Riley (Question-Led Guidance)

**File:** `mailflow/src/demo/scenarios.ts`
- Added `ScenarioId: 'riley'`
- Added seeded `riley` snapshot:
  - Pro user (`Riley Morgan`)
  - Existing contacts + campaigns
  - Start route: `/audiences?tab=segments`

**File:** `mailflow/src/demo/ScenarioSwitcher.tsx`
- Added Scenario 3 pill to switcher strip

**File:** `mailflow/src/orbital/OrbitalPanel.tsx`
- Scenario mode subtitle now handles all 3 scenarios:
  - Maya → New User Mode
  - Devon → Trial Conversion Mode
  - Riley → Question-Led Tour Mode

#### New: Dynamic Tour From Chat Question

**File:** `mailflow/src/orbital/dynamicTour.ts` — new file
- Added `buildTourFromQuestion(input)` mapper
- Supports re-engagement intent:
  - e.g. “How do I clean inactive contacts and send a re-engagement campaign?”
- Generates runtime `TourStep[]` based on existing `data-orbital-id` anchors and bridge events
- Includes fallback (`null`) when question is unsupported

**File:** `mailflow/src/orbital/TourEngine.tsx`
- Added runtime generated-tour support:
  - internal active mode `'generated'`
  - `startGeneratedTour(steps)` API on `useTour()`
- Existing static tours (`workflow1`, `workflow2`) preserved

**File:** `mailflow/src/orbital/OrbitalPanel.tsx`
- Chat submission path now:
  - tries dynamic mapper
  - starts generated tour when matched
  - otherwise returns canned response + optional recommended static tour CTA

#### Fallback + Event Wiring

**File:** `mailflow/src/orbital/bridge.ts`
- Expanded typed event union with:
  - `plan:upgraded`
  - `segment:modal-open`
  - `segment:created`
  - `automation:step-added`
  - `automation:send-email-added`

#### Devon Flow Hardening

**File:** `mailflow/src/orbital/tours/workflow2.ts`
- Removed repetitive intro step from Devon flow
- Added strict wait events + short advance delays for action-gated progression
- Upgrade step waits for real completion event (`plan:upgraded`)

**File:** `mailflow/src/features/automations/AutomationBuilderPage.tsx`
- Emitted:
  - `automation:step-added` for any added step
  - `automation:send-email-added` only when “Send Email” is added
- Wrapped add-step button + picker in a single annotated area target for stable guidance

#### Maya Flow Fixes

**File:** `mailflow/src/orbital/tours/workflow1.ts`
- Reworked step 1 to wait for route transition to `/campaigns/new` when user clicks “Create a campaign”
- Removed redundant campaigns-list step that could cause target loss / navigating stalls

**File:** `mailflow/src/orbital/Launchpad.tsx`
- Updated displayed step counts to match revised flows

#### Modal + Spotlight Stability Fixes

**File:** `mailflow/src/components/Modal.tsx`
- Added optional `data-orbital-id` passthrough to modal dialog container

**File:** `mailflow/src/features/audiences/AudiencesPage.tsx`
- Added URL-query tab sync (`?tab=contacts|segments`) to prevent route/tab mismatches
- Segment flow now emits:
  - `segment:modal-open` when New Segment opens
  - `segment:created` when segment is saved
- Added IDs for segment modal and create button targets

**File:** `mailflow/src/orbital/TourOverlay.tsx`
- Loader fallback (`Navigating…`) is now non-click-dismissable to avoid accidental tour termination during transient target loss
- Added additional scroll target handling for tour anchors used in automation/settings flows

#### Billing/Checkout Completion UX

**File:** `mailflow/src/features/settings/SettingsPage.tsx`
- On checkout complete:
  - upgrades plan
  - ends active tour
  - opens explicit success modal
  - preserves success toast
- Added billing success state (`?tab=billing&upgraded=1`) + banner messaging

**File:** `mailflow/src/store/index.ts`
- `upgradePlan()` now clears `trialDaysLeft` so the left sidebar Pro Trial card disappears immediately after upgrade

#### Visual/UI Polish

**File:** `mailflow/src/orbital/TourOverlay.tsx`
- Removed visual emphasis from “Not so easy” button in survey modal
- Highlighted post-step sub-message callout (`Upgrading preserves...`) with improved contrast/spacing

**File:** `mailflow/src/features/settings/SettingsPage.tsx`
- Added `Organization` field in Profile section

#### Docs Updated

**Files:**
- `orbital-demo-plan.md`
- `mail-flow-orbital-user-journey.md`

Added Scenario 3 and dynamic question-led flow details, plus known edge cases and mitigations for QA/handoff.

---

## 2026-04-20 (cont. 3)

### Rename: Copilot → Argus Copilot

Renamed the "Copilot" sidebar section to **"Argus Copilot"** across the entire codebase and spec, establishing "Argus" as the branded name for the AI assistant.

**File:** `src/components/Sidebar.tsx`
- Collapsible section label changed from "Copilot" to "Argus Copilot"
- Internal variable names updated: `copilotItems` → `argusItems`, `copilotPaths` → `argusPaths`, `isCopilotActive` → `isArgusActive`
- Comment updated from `{/* Copilot */}` to `{/* Argus Copilot */}`

**File:** `src/features/insights/InsightsPage.tsx`
- Subtitle changed from "your copilot configuration" to "your Argus copilot configuration"

**File:** `src/features/integrations/IntegrationsPage.tsx`
- Subtitle changed from "so the copilot can use real context" to "so Argus can use real context"
- Connected panel text changed from "the copilot will use" to "Argus will use"

---

### New: Ask Argus — Floating Conversational AI Chat Bubble

Added a floating "Ask Argus" chat bubble — a conversational AI assistant accessible from every page in the admin.

**File:** `src/components/AskArgus.tsx` — new file

- **Floating trigger button:** Purple pill with Bot icon + "Ask Argus" label, fixed to bottom-right corner. Animates in/out with framer-motion scale transitions; hover and tap feedback.
- **Chat panel** (400×540px): Opens with spring animation, replaces the trigger button while open.
  - **Header:** Purple background with Bot icon, "Ask Argus" title, "AI Assistant" subtitle, close button (X)
  - **Welcome state:** Bot icon, "Hi! I'm Argus." greeting, description text, 3 clickable suggestion buttons:
    - "How do I set up a product tour?"
    - "What annotations are most effective?"
    - "Show me engagement best practices"
  - **Messages:** User messages in purple bubbles (right-aligned, rounded with squared bottom-right). Assistant messages in grey bubbles (left-aligned, squared bottom-left).
  - **Typing indicator:** 3 bouncing dots with staggered animation delays (0ms, 150ms, 300ms)
  - **Mock response engine:** Keyword-matched responses — "tour" returns tour setup guidance, "annotation"/"tooltip" returns annotation tips, "engagement"/"best practice" returns best practices list, default returns general help message
  - **Response delay:** 800–1400ms simulated typing time
  - **Auto-scroll:** Messages area scrolls to bottom on new messages
  - **Auto-focus:** Input field focuses when panel opens
  - **Input area:** Text input + submit button (Send icon), disabled while typing or empty

**File:** `src/App.tsx`
- Added `AskArgus` import and `<AskArgus />` component inside the main layout (renders on every page)

**Spec updates (`orbital-admin-prototype-spec.md`):**

| Section | What changed |
|---------|-------------|
| §3 Global chrome — sidebar | "Copilot" → "Argus Copilot"; added Ask Argus chat bubble description |
| §3 Route map | All "Copilot → ..." sidebar locations → "Argus Copilot → ..." |
| §4.3 Integrations | "the copilot" → "Argus" in purpose and UI copy |
| §4.5 Instructions | "instructions for the copilot" → "instructions for Argus" |
| §4.6 Drafts | "The copilot synthesizes" → "Argus synthesizes"; "copilot drafted" → "Argus drafted"; updated header text |
| §4.10 Insights | "Copilot Instructions step" → "Argus Copilot Instructions step" |
| §7 Zustand Store — uiSlice | `copilotExpanded` → `argusExpanded`; added `askArgusOpen`; `toggleCopilotSection()` → `toggleArgusSection()`; added `toggleAskArgus()` |
| §8 Components to build | Added `AskArgus` component |
| §9 Interactivity | Added "Ask Argus" section with full interactivity requirements |
| §12 Build Order | Step 3 updated: "Copilot" → "Argus Copilot"; added Ask Argus chat bubble |

---

## 2026-04-20 (cont. 2)

### Engagement Taxonomy: Three Types with Subtypes

Restructured the engagement model from three flat types (tour, nudge, survey) into a richer taxonomy with subtypes.

**Three engagement types:**
- **Tours** — guided walkthroughs (no subtypes)
- **Nudges** — contextual prompts. Subtypes: Spotlight, Checklist, Banner, Popup, Modal
- **Feedback** — user input collection (renamed from "Surveys"). Subtypes: Micro Survey, NPS, Like/Dislike, Star Rating, Large Survey

#### Rename: Surveys → Feedback

All references to "Surveys" renamed to "Feedback" across the entire codebase:

**File:** `src/components/Sidebar.tsx`
- Nav item label changed from "Surveys" to "Feedback"
- Route changed from `/engagements/surveys` to `/engagements/feedback`

**File:** `src/App.tsx`
- Import changed from `SurveysPage` to `FeedbackPage`
- Route changed from `/engagements/surveys` to `/engagements/feedback`

**File:** `src/features/engagements/SurveysPage.tsx` — deleted, replaced by `FeedbackPage.tsx`

**File:** `src/features/engagements/FeedbackPage.tsx` — new file (thin wrapper, `filterType="feedback"`)

**File:** `src/features/engagements/EngagementsPage.tsx`
- `EngagementType` references updated from `'survey'` to `'feedback'`
- `typeConfig` updated: `survey` → `feedback` with `pluralLabel: 'Feedback'`
- Filter tabs updated from `['tour', 'nudge', 'survey']` to `['tour', 'nudge', 'feedback']`
- Summary card label changed from "Surveys" to "Feedback"
- Subtitle changed from "tours, nudges, and feedback surveys" to "tours, nudges, and feedback"

**File:** `src/mock/engagements.ts`
- `EngagementType` union changed from `'tour' | 'nudge' | 'survey'` to `'tour' | 'nudge' | 'feedback'`
- All `type: 'survey'` entries changed to `type: 'feedback'`

**File:** `src/mock/insights.ts`
- `EngagementPerformance.type` updated from `'survey'` to `'feedback'`
- Mock data entries updated accordingly

**File:** `src/features/insights/InsightsPage.tsx`
- Badge label logic updated for `'feedback'` type

**File:** `src/features/dashboard/DashboardPage.tsx`
- Activity log text changed from "tour/nudge drafts" to "engagement drafts"

#### New: Engagement Subtypes

**File:** `src/mock/engagements.ts`
- Added `FeedbackSubType = 'micro-survey' | 'nps' | 'like-dislike' | 'star-rating' | 'large-survey'`
- Added `NudgeSubType = 'spotlight' | 'checklist' | 'banner' | 'popup' | 'modal'`
- Added `EngagementSubType = FeedbackSubType | NudgeSubType`
- Added optional `subType` field to `Engagement` type
- Expanded from 8 to 13 mock engagements — at least one example per subtype

**File:** `src/features/engagements/EngagementsPage.tsx`
- Added `subTypeConfig` map with icon, label, and color for each of the 10 subtypes
- Added `SubTypeBadge` component rendering a color-coded pill with icon
- Added "Kind" column to the engagements table showing the subtype badge
- New icon imports: `Crosshair`, `ListChecks`, `Flag`, `MessageCircle`, `SquareStack`, `Megaphone`, `ThumbsUp`, `Star`, `FileText`, `BarChart3`

**Mock engagement examples per subtype:**

| Type | SubType | Example |
|------|---------|---------|
| Tour | — | First Campaign Activation Tour, Automation Discovery Tour |
| Nudge | Spotlight | Import Contacts Reminder, Audience Selection Rescue |
| Nudge | Checklist | New User Onboarding Checklist |
| Nudge | Banner | Trial Expiry Conversion Banner |
| Nudge | Popup | Template Gallery Highlight |
| Nudge | Modal | Upgrade Plan Prompt |
| Feedback | Micro Survey | Onboarding Satisfaction Check |
| Feedback | NPS | Monthly NPS Score |
| Feedback | Like/Dislike | Template Usefulness Rating |
| Feedback | Star Rating | Campaign Editor Experience |
| Feedback | Large Survey | Feature Request Feedback |

---

### Drafts: Updated Engagement Types + Subtypes

**File:** `src/mock/suggestions.ts`
- `Suggestion.actionType` changed from `'tour' | 'nudge' | 'tooltip'` to `'tour' | 'nudge' | 'feedback'`
- Added optional `actionSubType?: EngagementSubType` field
- Former `tooltip` action types remapped to `nudge` with appropriate subtypes
- Added 3 new feedback-type drafts (sug-10, sug-11, sug-12): micro-survey, NPS, like/dislike
- Total drafts increased from 9 to 12

**File:** `src/features/suggestions/SuggestionsPage.tsx`
- `actionColors` map updated: `{ tour: 'blue', nudge: 'amber', feedback: 'violet' }`
- Removed status badge ("suggested"/"accepted"/"dismissed") from draft cards
- Added `subTypeConfig` map and `SubTypeBadge` component
- Each draft card now shows the subtype pill next to the action type badge

**File:** `src/features/suggestions/SuggestionDetailPage.tsx`
- Removed Status field from the sidebar Details card
- Updated action type badge colors to match (tour=blue, nudge=amber, feedback=violet)
- Added "Kind" row to Details card showing `SubTypeBadge` when `actionSubType` is set
- Added `subTypeConfig` map and `SubTypeBadge` component

**File:** `src/features/dashboard/DashboardPage.tsx`
- Active Drafts section now shows engagement type badge (tour/nudge/feedback) instead of trigger type + status badges

**Draft subtype assignments:**

| Draft | Action Type | Kind |
|-------|------------|------|
| First Campaign Activation Tour | tour | — |
| Import Contacts Reminder | nudge | Spotlight |
| Audience Selection Rescue | nudge | Spotlight |
| Template Decision Paralysis Help | nudge | Popup |
| Wizard Abandonment Recovery | nudge | Banner |
| Settings Page Confusion Rescue | nudge | Spotlight |
| Automation Discovery Tour | tour | — |
| Trial Expiry Conversion Banner | nudge | Banner |
| Engagement Drop-off Alert | nudge | Modal |
| Post-Onboarding Satisfaction Check | feedback | Micro Survey |
| Monthly NPS Collection | feedback | NPS |
| Template Usefulness Rating | feedback | Like/Dislike |

---

## 2026-04-20 (cont.)

### Unified Orbital Logo (Favicon + Sidebar)

Replaced the mismatched favicon (lightning bolt) and sidebar icon (`Sparkles` from lucide-react) with a single custom orbital SVG — two crossed elliptical rings around a center dot with a satellite accent.

**File:** `public/favicon.svg` — replaced lightning bolt with orbital rings SVG in `#7c5cfc`

**File:** `src/components/Sidebar.tsx`
- Removed `Sparkles` import from lucide-react
- Added `OrbitalLogo` inline SVG component (white version of the favicon)
- Sidebar header now renders `<OrbitalLogo>` inside the brand square

**File:** `src/features/branding/BrandingPage.tsx`
- Preview card fallback logo updated from `Sparkles` to inline orbital SVG

---

### Enhancement: Logo Upload with Real Preview (Branding Page)

**File:** `src/features/branding/BrandingPage.tsx`
- Added `LogoUpload` component with a hidden `<input type="file" accept="image/*">`
- File is read via `FileReader.readAsDataURL()` and stored as a data URL in brand settings
- After upload: shows actual image thumbnail, Replace button, and Remove button
- Live preview panel renders the uploaded logo in the simulated tooltip card
- Fixed `PreviewCard` prop type (was using `ReturnType<typeof useStore>`, now uses `BrandSettings`)

---

### New Sidebar Sections: Engagements, Insights, Branding, Settings

Expanded the sidebar from 2 sections (Dashboard + Copilot) to 6 sections.

**Before:**
- Dashboard
- **Copilot** (collapsible)

**After:**
- Dashboard
- **Copilot** (collapsible)
- **Engagements** (collapsible) *(new)*
  - All Engagements
  - Tours
  - Nudges
  - Surveys
- **Insights** *(new, top-level)*
- **Branding** *(new, top-level)*
- **Settings** (collapsible) *(new)*
  - Team
  - Billing

#### Spec changes (`orbital-admin-prototype-spec.md`)

| Section | What changed |
|---------|-------------|
| §2 Tech Stack | Route count updated from ~9 to ~17 screens |
| §2 Folder layout | Added `engagements/`, `insights/`, `branding/`, `settings/` feature folders |
| §3 Global chrome — sidebar | Added Engagements (collapsible), Insights, Branding, and Settings (collapsible) sections; documented unified orbital logo |
| §3 Route map | Added 9 new routes: `/engagements`, `/engagements/tours`, `/engagements/nudges`, `/engagements/surveys`, `/insights`, `/branding`, `/settings` (redirect), `/settings/team`, `/settings/billing` |
| §4.9 *(new)* Engagements | Full screen spec — summary cards, filter tabs, engagement table with pause/resume/archive, sub-pages for Tours/Nudges/Surveys |
| §4.10 *(new)* Insights | Full screen spec — KPI cards with sparklines, risk signals panel, engagement performance table |
| §4.11 *(new)* Branding | Full screen spec — style guide import (upload + URL), brand settings form (colors, font, radius, button style, logo), live preview panel |
| §4.12 *(new)* Settings — Team | Full screen spec — team member table, invite modal, role management |
| §4.13 *(new)* Settings — Billing | Full screen spec — current plan card, plan comparison grid, billing history table |
| §6 Mock Data | Added type definitions for `engagements.ts`, `insights.ts`, `branding.ts`, `settings.ts` |
| §7 Zustand Store | Added `engagementsSlice`, `brandingSlice`, `settingsSlice`; updated cross-slice data flow diagram |
| §9 Interactivity | Added interactivity requirements for Engagements, Insights, Branding, and Settings sections |
| §12 Build Order | Added steps 13–17 for Engagements, Insights, Branding, Team, Billing; renumbered to 20 steps |

#### New anchor IDs in spec

| Section | Anchors |
|---------|---------|
| Engagements | `engagements-summary`, `engagements-filter-tabs`, `engagements-table` |
| Insights | `insights-kpi-cards`, `insights-risk-signals`, `insights-performance-table` |
| Branding | `branding-import-panel`, `branding-settings-form`, `branding-preview` |
| Settings — Team | `settings-team-table`, `settings-invite-modal` |
| Settings — Billing | `settings-billing-plan`, `settings-billing-comparison`, `settings-billing-history` |

---

### Code: Sidebar Expansion

**File:** `src/components/Sidebar.tsx` — major rewrite

- Extracted reusable `CollapsibleSection` component (used by Copilot, Engagements, Settings)
- Added `OrbitalLogo` inline SVG component for the brand mark
- Added `engagementItems` array: All Engagements, Tours, Nudges, Surveys
- Added `settingsItems` array: Team, Billing
- Added top-level NavLinks for Insights (`BarChart3` icon) and Branding (`Palette` icon)
- Active-state detection for Engagements uses `pathname.startsWith('/engagements')`
- Active-state detection for Settings checks all `/settings/*` paths

---

### Code: New Engagements Section

**File:** `src/features/engagements/EngagementsPage.tsx` — new file
- Summary cards row (total, active, type breakdown)
- Filter tabs: All / Tours / Nudges / Surveys (using `useSearchParams`)
- Sortable table with type/status badges, conversion rate, last triggered
- Pause/Resume/Archive action buttons per row
- Empty state with CTA to Drafts
- Accepts optional `filterType` prop for sub-page usage

**File:** `src/features/engagements/ToursPage.tsx` — new file (thin wrapper, `filterType="tour"`)

**File:** `src/features/engagements/NudgesPage.tsx` — new file (thin wrapper, `filterType="nudge"`)

**File:** `src/features/engagements/SurveysPage.tsx` — new file (thin wrapper, `filterType="survey"`)

**File:** `src/mock/engagements.ts` — new file
- 8 mock engagements: 2 tours, 3 nudges, 3 surveys
- Each with impressions, completions, dismissals, conversion rate, linked draft ID

---

### Code: New Insights Section

**File:** `src/features/insights/InsightsPage.tsx` — new file
- 4 KPI metric cards with SVG sparkline component and trend indicators
- Risk signals panel: 6 cards with severity badges and affected user counts
- Engagement performance table with conversion lift column

**File:** `src/mock/insights.ts` — new file
- `mockKpis`: 4 metrics with 7-day trend data
- `mockRiskSignals`: 6 risk signals with severity and user counts
- `mockEngagementPerformance`: 6 engagement performance rows

---

### Code: New Branding Section

**File:** `src/features/branding/BrandingPage.tsx` — new file
- Brand import card: style guide upload zone + reference URL fetch
- Brand settings form: primary/secondary color pickers, font dropdown, border radius slider, button style selector, logo upload with real file preview
- `LogoUpload` component: uses `FileReader.readAsDataURL()` for actual image preview
- `PreviewCard` component: simulated tooltip + nudge styled with live brand settings
- 60/40 layout with sticky preview panel

**File:** `src/mock/branding.ts` — new file
- `BrandSettings` type, `defaultBrandSettings`, `fontOptions`, `autoDetectedBrand` tokens

---

### Code: New Settings Section

**File:** `src/features/settings/TeamPage.tsx` — new file
- Team members table with avatar initials, role badges, status badges
- Three-dot action menu: role switcher + remove
- Invite Teammate modal: email input + role selector (Admin/Editor/Viewer)

**File:** `src/features/settings/BillingPage.tsx` — new file
- Current plan card with usage stats and payment method
- Plan comparison grid: Free / Pro (current, highlighted) / Enterprise
- Billing history table with status badges

**File:** `src/mock/settings.ts` — new file
- 4 mock team members, billing info with `$99/mo` Pro plan, 5 billing history entries, plan feature comparison data

---

### Code: Store + Routes

**File:** `src/store/index.ts`
- Added imports for new mock data modules
- Added `engagements` state with `pauseEngagement()`, `resumeEngagement()`, `archiveEngagement()` actions
- Added `brandSettings` state with `updateBrandSetting()`, `fetchBrandFromUrl()` (1.5s simulated extraction)
- Added `teamMembers` state with `inviteMember()`, `updateMemberRole()`, `removeMember()` actions
- Added `billingInfo` state (read-only mock data)

**File:** `src/App.tsx`
- Added imports for all new page components
- Added 9 new routes: `/engagements`, `/engagements/tours`, `/engagements/nudges`, `/engagements/surveys`, `/insights`, `/branding`, `/settings` (redirects to `/settings/team`), `/settings/team`, `/settings/billing`

---

## 2026-04-20

### Spec Restructure: Sidebar Navigation

Reorganized the left sidebar from a flat nav list into a grouped hierarchy with a collapsible **Copilot** section.

**Before:**
- Dashboard
- Knowledge Base
- Annotate Product
- Agent Setup
- Suggestions

**After:**
- Dashboard
- **Copilot** (collapsible)
  - Knowledge Base
  - Integrations *(new)*
  - Annotations *(renamed from "Annotate Product")*
  - Instructions *(renamed from "Agent Setup")*
  - Drafts *(renamed from "Suggestions")*

#### Spec changes (`orbital-admin-prototype-spec.md`)

| Section | What changed |
|---------|-------------|
| §1 Product Overview | "example suggestions" → "example drafts"; "reviewing AI-generated suggestions" → "reviewing AI-generated drafts" |
| §2 Tech Stack | Route count updated from ~8 to ~9 screens |
| §2 Folder layout | Renamed `agent-setup/` → `instructions/`, `suggestions/` → `drafts/`; added `integrations/` |
| §3 Global chrome — sidebar | Replaced flat nav list with Dashboard + collapsible Copilot section containing 5 sub-items |
| §3 Route map | Added `Sidebar Location` column; added `/integrations` route; renamed screen labels |
| §4.1 Dashboard | Checklist labels updated ("Define goals and instructions", "Review AI drafts"); "Active Suggestions" → "Active Drafts"; activity log uses "drafts" |
| §4.3 *(new)* Integrations | Full screen spec for `/integrations` — MCP servers, CRMs, product analytics; mock integration grid; connect/disconnect flow |
| §4.4 Annotations | Renamed from "Annotation Session"; section renumbered from 4.3 → 4.4 |
| §4.5 Instructions | Renamed from "Agent Setup Chat"; section renumbered from 4.4 → 4.5; purpose updated; completion CTA → "View Drafts" |
| §4.6 Drafts | Renamed from "AI Suggestions"; section renumbered from 4.5 → 4.6; status badge "Suggested" → "Draft"; rationale attribution wording updated |
| §4.7 Draft Detail | Renamed from "Suggestion Detail / Edit"; section renumbered from 4.6 → 4.7; breadcrumb → "Back to Drafts"; rate limit override label updated |
| §4.8 Tour Preview Modal | Renumbered from 4.7 → 4.8; wording updated |
| §6 Mock Data | Added `src/mock/integrations.ts` type definition; renamed `src/mock/suggestions.ts` → `src/mock/drafts.ts` with `Draft`/`DraftStep` types |
| §7 Zustand Store | Added `integrationsSlice`; renamed `setupSlice` → `instructionsSlice`, `suggestionsSlice` → `draftsSlice`; added `copilotExpanded` to `uiSlice`; updated cross-slice data flow diagram |
| §9 Interactivity | Section headers renamed (Journey 2 → Instructions, Journey 3 → Drafts); "Suggestion cards" → "Draft cards"; "View AI Suggestions" → "View Drafts" |
| §12 Build Order | Renumbered to 15 steps; added step 6 for Integrations screen; updated terminology throughout |

#### Anchor ID changes in spec

| Old | New |
|-----|-----|
| `suggestion-edit-title` | `draft-edit-title` |
| `suggestion-edit-triggers` | `draft-edit-triggers` |
| `suggestion-edit-steps` | `draft-edit-steps` |
| `suggestion-edit-timing` | `draft-edit-timing` |
| `suggestion-edit-preview-btn` | `draft-edit-preview-btn` |
| *(new)* | `integrations-category-tabs`, `integrations-grid`, `integrations-connect-modal`, `integrations-connected-panel` |

---

### Code: Sidebar Restructure

**File:** `src/components/Sidebar.tsx` — full rewrite

- Dashboard is now a standalone top-level `NavLink`
- Added collapsible **Copilot** parent section with `Bot` icon and chevron toggle
- Sub-items (Knowledge Base, Integrations, Annotations, Instructions, Drafts) nest underneath with a left border
- Section auto-expands when any child route is active
- Uses `useLocation` to detect active copilot routes

---

### Code: New Integrations Page

**File:** `src/features/integrations/IntegrationsPage.tsx` — new file

- Grid of 7 mock integrations: HubSpot, Salesforce, Amplitude, Mixpanel, PostHog, Segment, Custom MCP Server
- Category filter tabs: All / MCP Servers / CRM / Product Analytics
- Connect modal with API key input (Server URL + Auth Token for MCP type)
- Simulated "Test Connection" flow (1.5s spinner → success message)
- Connected integrations summary card with disconnect option
- Cards animate in with stagger via framer-motion

**File:** `src/App.tsx` — added `/integrations` route and `IntegrationsPage` import

---

### Code: Terminology Rename (Suggestions → Drafts, Agent Setup → Instructions)

**File:** `src/features/dashboard/DashboardPage.tsx`
- Checklist step labels: "Define goals and instructions", "Review AI drafts"
- Card header: "Active Suggestions" → "Active Drafts"
- Activity log: "tour/nudge suggestions generated" → "tour/nudge drafts generated"

**File:** `src/features/suggestions/SuggestionsPage.tsx`
- Page title: "AI Suggestions" → "Drafts"

**File:** `src/features/suggestions/SuggestionDetailPage.tsx`
- Not-found message: "Suggestion not found" → "Draft not found"
- Breadcrumb: "Back to Suggestions" → "Back to Drafts"
- Rate limit override option: "Custom for this suggestion" → "Custom for this draft"

**File:** `src/features/agent-setup/SetupPage.tsx`
- Page header: "Agent Setup" → "Instructions"

**File:** `src/features/annotation/AnnotationPage.tsx`
- Completion modal CTA: "Continue to Agent Setup" → "Continue to Instructions"

---

### Enhancement: Delete Individual Annotations

**File:** `src/store/index.ts`
- Added `removeElement(hotspotId)` action to the annotation slice
- Filters the element out of `capturedElements` array

**File:** `src/features/annotation/AnnotationPage.tsx`
- Added `Trash2` icon import
- Each annotation node in the semantic map tree displays a delete icon (top-right of the card header row)
- Icon is hidden by default, appears on hover (`group-hover` pattern)
- Hover state: icon turns red with subtle red background
- Clicking removes the annotation from the store and clears selection
- Removed element reverts to un-captured styling in the browser frame, allowing re-capture
