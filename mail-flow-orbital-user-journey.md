# Orbital AI – End-to-End UX Workflows (Updated)  
**Context:** B2B SaaS product for running email campaigns  
**Goal:** Show how a SaaS company uses Orbital AI to drive activation, conversion, and retention through intelligent, adaptive in-product guidance (NOT automation)

---

## Workflow 1: New User Activation → First Campaign Sent (Aha Moment)

### Persona  
**User:** Marketing Manager at an SMB  
**State:** Signed up for a free trial, low familiarity with product  

---

### Step 1: First Login – Passive Observation + Context Building  
- User lands on dashboard (empty state: “No campaigns yet”)  
- Orbital AI **does NOT immediately interrupt**  
- Instead, it:
  - Observes navigation patterns (hovering, idle time, clicks)
  - Pulls context from signup data (company size, use case: “newsletter campaigns”)

---

### Step 2: Intent Detection → Soft Entry Point  
- User clicks “Create Campaign” but pauses on template selection  
- Orbital triggers a **non-intrusive assistant prompt** (bottom-right, chat-style):

> “Looks like you're setting up your first campaign. Want a quick guided walkthrough?”

- User clicks **“Yes”**

---

### Step 3: Adaptive Product Tour Begins (Context-Aware)  
Instead of a static walkthrough, Orbital launches a **dynamic, step-by-step guided tour**:

- The tour adapts to:
  - The user’s current screen (template selection)
  - What they’ve already completed

**Example flow:**
1. Highlight: Template gallery  
   > “Start by choosing a template. For newsletters, these tend to perform best.”

2. Once user selects a template → tour progresses automatically  

3. Highlight: Subject line field  
   > “Your subject line drives opens. Try something clear and benefit-driven.”

- If user edits quickly → steps are skipped  
- If user hesitates → additional hints appear  

---

### Step 4: Real-Time Friction Detection → Micro-Guidance  
- User hesitates at “Audience Selection”  
- Orbital adapts the tour in real time:

> “Not sure who to send this to? Most first campaigns go to your full contact list.”

- UI highlights:
  - Audience dropdown  
  - “All Contacts” option  

- User must **manually select** → Orbital does not act on their behalf  

---

### Step 5: Progress-Aware Guidance (Non-Linear Tour)  
- User skips ahead to “Email Content”  
- Orbital dynamically **re-orders remaining tour steps**:
  - Avoids repeating completed steps  
  - Focuses only on missing ones  

---

### Step 6: Completion Nudge via Tour Endpoint  
- User reaches final step but hasn’t clicked “Send”  
- Final guided step appears:

> “You’re ready to send your first campaign 🚀  
> Review everything here, then click ‘Send Campaign’ when you’re ready.”

- Button is visually highlighted, but user must click manually  

---

### Step 7: Aha Moment + Reinforcement  
- User sends campaign  
- Orbital responds:

> “Nice work — your first campaign is live 🎉  
> Want tips on how to track performance next?”

- Optional next tour offered (analytics walkthrough)

---

### Step 8: Post-Action Feedback (Contextual, Lightweight)  
Instead of NPS:
- Orbital asks:

> “What part of this setup felt unclear?”  
- Options:
  - Templates  
  - Audience selection  
  - Content editing  
  - Nothing — it was smooth  

---

### Outcome  
- User reaches **Aha Moment (first campaign sent)**  
- Orbital acts as a **real-time guide**, not an executor  
- Tour adapts dynamically to:
  - Behavior  
  - Progress  
  - Friction points  

---

## Workflow 2: Trial User → Paid Conversion (Prevent Drop-off)

### Persona  
**User:** Growth Lead at a mid-sized startup  
**State:** 10 days into 14-day trial, moderate usage but no upgrade  

---

### Step 1: Continuous Monitoring + Risk Detection  
Orbital tracks:
- Campaigns created: 3  
- Engagement: moderate  
- Key gap: **User has not explored automation features (high-value)**  

→ Orbital flags user as **“High Intent, At Risk of Not Converting”**

---

### Step 2: Contextual Re-Engagement Trigger  
- User logs in  
- Orbital surfaces:

> “You’re getting good engagement on campaigns 👀  
> Want a quick walkthrough of how to automate follow-ups?”

- CTA: **“Show Me”**

---

### Step 3: Adaptive Feature Discovery Tour  
- Orbital launches a **guided tour starting from the user’s current location**

If user is on dashboard:
- Step 1: Highlight “Automation” tab  
  > “This is where you can create automated workflows.”

If user is already inside campaign view:
- Step 1 adjusts:
  > “You can create automations directly from your campaign here.”

---

### Step 4: Value Framing Within the Tour  
- As the tour progresses:

> “Many users set up a follow-up for people who didn’t open the first email.”

- UI highlights:
  - “Create Automation” button  
  - Workflow builder entry point  

---

### Step 5: Guided Setup (User-Driven Actions Only)  
- Orbital guides step-by-step:

1. Highlight trigger selection  
   > “Choose what starts the automation — for example, ‘Email not opened’”

2. After user selects → next step activates  

3. Highlight email creation step  
   > “Now create your follow-up email here”

4. Highlight scheduling/timing controls  

- If user deviates:
  - Tour adapts and repositions guidance  

---

### Step 6: Mid-Tour Adaptation Based on Behavior  
- If user completes steps quickly:
  - Orbital **shortens remaining guidance**

- If user struggles:
  - Adds extra clarifications or examples  

---

### Step 7: Completion + Value Reinforcement  
- User finishes setting up automation  

> “Nice — this automation will help you recover missed engagement.”

- Suggests:
  - “Want to see how to track its performance?” (optional follow-up tour)

---

### Step 8: Conversion Moment Optimization  
- 2 days before trial ends  
- Orbital detects:
  - User has actively used automation  

- Shows personalized message:

> “You’ve started using automations — upgrading ensures they keep running without interruption.”

- Includes:
  - Clear benefit framing (no generic upsell)  

---

### Step 9: Objection Handling via Guided Exploration  
If user hesitates:

> “Want a quick walkthrough of what happens when your trial ends?”

- Launches short **informational tour**:
  - Shows feature limitations post-trial  
  - Highlights value of upgrade  

---

### Step 10: Post-Conversion Insight Capture  
- After upgrade:

> “What helped you decide to upgrade?”  
- Options:
  - Automation capabilities  
  - Ease of use  
  - Campaign performance  
  - Other  

---

### Outcome  
- Conversion driven by:
  - **Guided feature discovery (not passive exposure)**  
  - **Hands-on learning via adaptive tours**  
  - **Contextual timing**  

---

## Workflow 3: Question-Led Dynamic Tour (Riley)

### Persona  
**User:** Ops Manager at a growing SaaS company  
**State:** Already active in product; needs help with a specific task flow  

---

### Step 1: User Asks a Concrete Workflow Question  
In Orbital chat, user asks:

> “How do I clean inactive contacts and send a re-engagement campaign?”

Orbital interprets intent and generates a contextual tour at runtime.

---

### Step 2: Dynamic Plan Generation (Annotation-Driven)  
Orbital maps question intent to deterministic UI anchors (`data-orbital-id`) and bridge events.

Generated guide focuses on:
1. Segments in Audiences  
2. Segment creation  
3. Campaign creation + audience selection  
4. Send action

---

### Step 3: Context-Aware Start (No Redundant Steps)  
If user is already on `Audiences → Segments`, Orbital **skips** the “Go to Audiences” step.

This avoids flash-through cards and preserves continuity.

---

### Step 4: Modal-Safe Guided Form Completion  
Orbital asks user to click **New segment** and waits for modal open event.  
Then guidance anchors to the segment modal container and waits for **Create segment** completion event.

Key behavior:
- User can type freely in form fields (tour does not close)
- Tour advances only after segment is actually created

---

### Step 5: Continue to Campaign + Send  
After segment creation, Orbital guides:
- Go to Campaigns  
- Create campaign  
- Select audience  
- Send campaign

Progression remains event-gated for critical actions.

---

### Step 6: Fallback for Unsupported Questions  
If confidence is low or no safe mapping is available:
- Orbital returns a helpful response
- Recommends nearest static tour (activation or automation path)

---

### Outcome  
- User gets guidance tailored to their question, not a fixed script  
- Tour remains stable through modal interactions and form entry  
- Assistance is adaptive, deterministic, and user-driven end-to-end

---

## Key UX Principles Demonstrated

- **Guide, don’t act** → User retains full control  
- **Adaptive tours > static walkthroughs**  
- **Context-aware entry points** → Start where the user is  
- **Non-linear progression** → Skip irrelevant steps  
- **Question-to-tour synthesis** → Generate workflow guidance from user intent  
- **Friction-triggered assistance** → Help appears when needed  
- **Learning by doing** → Users complete actions themselves  
- **Feedback in context** → Captured at meaningful moments  

---

These updated workflows position Orbital AI as an **intelligent guidance layer** that dynamically teaches users how to succeed within the product—without ever taking control away from them.