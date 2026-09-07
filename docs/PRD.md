# Joseph Mews Investor Platform — Product Requirements Document (PRD)

| Field | Value |
|-------|-------|
| **Product** | Joseph Mews Investor Platform |
| **Document type** | Product Requirements Document |
| **Status** | Draft for V1 (aligned to current prototype) |
| **Audience** | Product, design, engineering, client stakeholders |
| **Related docs** | Metrics & Formulas; Payment Plans product plan |
| **Last updated** | July 2026 |

---

## Contents

1. Introduction and Purpose  
 1.1 How to read this document  
2. Product Overview  
 2.1 Primary user groups  
 2.2 Objectives  
3. Platform Architecture and Foundations  
 3.1 Surfaces  
 3.2 Configuration home  
 3.3 Roles and permissions  
 3.4 Responsive and on-site use  
 3.5 Reusability approach  
4. Cross-Cutting Requirements  
 4.1 CRM integration (two-way)  
 4.2 Notifications  
5. Feature Requirements  
 5.1 Authentication and session  
 5.2 Overview (dashboard)  
 5.3 Portfolio  
 5.4 Property detail  
 5.5 Documents  
 5.6 Explore marketplace  
 5.7 Opportunity detail  
 5.8 Affordability calculator  
 5.9 Contact advisor  
 5.10 Mortgage plans  
 5.11 Projections and metrics  
 5.12 Empty and partial states  
7. Not in V1 Scope  
8. Open Items and Client Confirmations  
9. External Dependencies  

---

## 1. Introduction and Purpose

This document defines the product requirements for the **Joseph Mews Investor Platform**: a mobile-first private investor portal for reviewing owned UK property holdings, accessing documents, browsing curated off-plan opportunities, modelling affordability, and contacting an advisor.

It is the source of truth for **what** V1 must deliver. Implementation detail (APIs, schemas, UI components) belongs in technical design; metric formulas and CRM field lists belong in **Metrics & Formulas**.

**Purpose of this PRD**

- Align client and delivery team on users, surfaces, and scope  
- Specify feature behaviour for each primary flow  
- Separate V1 must-haves from later work  
- Capture open decisions and external dependencies that block or shape delivery  

### 1.1 How to read this document

| Section | Use it for |
|---------|------------|
| **2. Product Overview** | Who the product is for and what success looks like |
| **3. Platform Architecture** | Screens, roles, responsiveness, shared patterns |
| **4. Cross-Cutting Requirements** | CRM sync and notifications that apply across features |
| **5. Feature Requirements** | Per-feature behaviour, entry points, and acceptance intent |
| **7. Not in V1 Scope** | Explicit exclusions — do not build these in V1 |
| **8. Open Items** | Decisions still needed from the client |
| **9. External Dependencies** | Systems and data the product relies on |

**Priority language**

- **Must** — required for V1 acceptance  
- **Should** — expected in V1 unless blocked by an open item  
- **May** — optional enhancement; not required to close V1  

**Prototype note:** A clickable prototype already implements most flows with fixture data. This PRD describes the intended **product** behaviour for V1, including production integrations that the prototype only simulates.

---

## 2. Product Overview

Joseph Mews Investor Platform is positioned as **Private Banking Modernism**: quiet confidence, editorial hierarchy, warm charcoal surfaces, and champagne gold used sparingly. Information over persuasion.

Investors use the app to understand portfolio value, income, leverage, and mortgage commitments. Prospects (guests) use Explore and the Calculator to assess opportunities before speaking with an advisor. Both personas can request advisor contact.

### 2.1 Primary user groups

| User group | Description | Primary jobs |
|------------|-------------|--------------|
| **Investor** | Existing Joseph Mews client with one or more holdings | Review portfolio health; inspect a property (valuation, income, mortgage, projection); access documents; explore new opportunities; model affordability; contact advisor |
| **Prospect (Guest)** | Pre-client or discovery user without holdings access | Browse curated opportunities; run affordability calculator; contact sales / advisor |
| **Advisor (indirect)** | Relationship manager represented in-app | Receives contact intents (call, callback, email); profile shows advisor name/title. Advisor-facing admin UI is out of V1 app scope |
| **Admin / ops (indirect)** | Internal operators of rates, opportunities, documents | Configure assumptions and content via CRM / back office — not via the investor app in V1 |

**Demo identities (prototype):** Investor — `alexander.whitfield@example.com` (Alexander Whitfield, Gold). Prospect — any other email (e.g. Oliver Hartley, Guest).

### 2.2 Objectives

| # | Objective | Success signal |
|---|-----------|----------------|
| O1 | Portfolio clarity | Investor can see total value, capital growth, equity/loans, gross yield, and net cash flow on Overview without hunting |
| O2 | Mortgage clarity | On leveraged holdings, next payment, monthly due, and outstanding balance are obvious on Portfolio and Property Detail |
| O3 | Opportunity assessment | Explore + illustrative mortgage + projections are readable in one opportunity journey |
| O4 | Self-serve affordability | Calculator produces buying power, matched opportunities, and returns from a deposit before advisor contact |
| O5 | Advisor routing | Contact advisor is available from Overview, Portfolio, Opportunity detail, Calculator, and Profile |
| O6 | Access control | Prospects cannot access investor-only portfolio/document surfaces |

---

## 3. Platform Architecture and Foundations

### 3.1 Surfaces

| Surface | Route(s) | Access | Purpose |
|---------|----------|--------|---------|
| Login | `/` | Public | Email + OTP sign-in; persona routing |
| Overview | `/dashboard` | Investor | Portfolio headline metrics, insights, advisor |
| Portfolio | `/portfolio` | Investor | Holdings list with mortgage teasers |
| Property detail | `/property/:id` | Investor | Deep-dive: overview, mortgage, income, performance, projection, tenancy |
| Documents | `/documents` | Investor | Document library search, filter, upload, download |
| Explore | `/explore` | Investor + Prospect | Curated opportunity marketplace + filters |
| Opportunity detail | `/explore/:id` | Investor + Prospect | Opportunity narrative, projection, illustrative mortgage, Contact Sales |
| Calculator | `/calculator` | Investor + Prospect | Five-step affordability wizard |
| Run Numbers | `/calculator/:source/:id` | Both (stub) | Seeded calculator from property/opportunity — **open item** (unlinked in prototype) |
| Profile sheet | Header avatar | Both | Identity, tier, advisor, contact CTA |
| Contact advisor sheet | Multiple CTAs | Both | Schedule call / callback / email |
| Preview hub | `/preview/*` | Demo / QA | Empty and partial UI states |

**Primary navigation**

| Persona | Bottom nav |
|---------|------------|
| Investor | Overview · Portfolio · Explore · Calc · Docs |
| Prospect | Explore · Calc |

Header: brand → persona home. Detail screens use Back; opportunity detail hides bottom nav and shows sticky Contact Sales.

### 3.2 Configuration home

V1 does **not** include an in-app admin console. Configuration lives outside the investor app:

| Config domain | Intended home (production) | Used by |
|---------------|----------------------------|---------|
| Investor–property links, valuations, rents, loans | CRM | Overview, Portfolio, Property |
| Mortgage schedules | CRM / lender feed (or admin upload) | Mortgage Plan |
| Opportunities, unit types, status | CRM / content admin | Explore, Calculator match |
| Projection assumptions (growth, rental, costs) | Admin rates table | Projection, Calculator |
| Mortgage rates (UK / Non-UK), fee defaults | Admin rates table | Calculator |
| Documents metadata + files | Document vault + CRM | Documents |
| Advisor assignment | CRM | Profile, Contact advisor |

The investor app **must** treat these as read sources (and write-back where §4.1 requires). Prototype uses static fixtures only.

### 3.3 Roles and permissions

| Capability | Investor | Prospect | Notes |
|------------|----------|----------|-------|
| Sign in | Must | Must | OTP / verified email in production |
| Overview, Portfolio, Property, Documents | Must | Denied (redirect to Explore) | Investor-gated |
| Explore + Opportunity detail | Must | Must | |
| Calculator | Must | Must | |
| Contact advisor / Contact Sales | Must | Must | Context may include opportunity |
| Upload documents | Must | Denied | Investor only |
| View mortgage schedule on owned holding | Must | N/A | |
| Edit valuations / rates / schedules | Denied | Denied | Back office only |
| Advisor admin tools | Denied | Denied | Out of app scope |

**Must:** Unauthenticated users cannot access app surfaces beyond Login.  
**Must:** Persona is resolved from authenticated identity (CRM), not client-only email matching (prototype shortcut).

### 3.4 Responsive and on-site use

| Requirement | Detail |
|-------------|--------|
| Primary form factor | Mobile phone (design target ≤430px width) |
| Desktop | Phone-width framed shell is acceptable for V1 web; true edge-to-edge on small viewports |
| Touch | Tap targets ≥44px; no hover-only critical actions |
| Safe areas | Top notch / status bar and bottom home-indicator padding |
| On-site / advisor-assisted use | Same responsive web app; no separate kiosk mode in V1 |
| Offline | Not required in V1 |

### 3.5 Reusability approach

Shared building blocks **must** stay consistent across surfaces:

| Shared capability | Reused on |
|-------------------|-----------|
| App shell (header, nav, profile) | All authenticated surfaces |
| Contact advisor sheet | Overview, Portfolio, Opportunity, Calculator, Profile |
| Projection engine + Projection section | Property detail, Opportunity detail, Calculator outlook |
| Time-range control (1M / 3M / 1Y / All) | Overview chart, Property value chart |
| Metric formatting and formulas | All headline numbers — see Metrics & Formulas |
| Mortgage plan presentation patterns | Portfolio strip + Property Mortgage tab; Explore illustrative variant |
| Empty / partial state patterns | Preview hub → production zero-data accounts |

**Must not** invent a second definition of capital growth vs total return. Dashboard capital growth = value change only; projection total return = capital + income.

---

## 4. Cross-Cutting Requirements

### 4.1 CRM integration (two-way)

V1 production **must** integrate with the client CRM (or agreed system of record) as follows.

**CRM → App (read)**

| Domain | Direction | Examples |
|--------|-----------|----------|
| Identity & persona | In | Investor vs prospect, name, email, tier, member since, advisor |
| Holdings | In | Properties, valuations, purchase data, status, occupancy, tenancy |
| Financials | In | Rent, costs, loan balance, equity, histories for charts |
| Mortgage plans | In | Lender, type, rate, term, schedule, next due |
| Opportunities | In | Marketplace inventory, prices, yields, forecasts, status |
| Documents metadata | In | Title, category, dates, “new” flags, secure file URLs |
| Assumptions | In | Growth/rental/cost rates, mortgage rate tables |

**App → CRM (write)**

| Event | Direction | Examples |
|-------|-----------|----------|
| Contact intents | Out | Schedule call, callback request, Contact Sales with opportunity context |
| Calculator / interest signals | Out (Should) | Deposit, matched opportunity, nationality — for advisor follow-up |
| Document upload | Out | New files + metadata into vault / CRM |
| Session / last active | Out (May) | Engagement telemetry |

**Must:** Write-backs are acknowledged in UI only after successful API acceptance (or queued with clear failure state).  
**Prototype today:** No live CRM; fixtures + local session only.

Minimum field checklist: **Metrics & Formulas §7**.

### 4.2 Notifications

| Channel | V1 requirement |
|---------|----------------|
| In-app toasts | Must for transient feedback (e.g. coming-soon, upload success/failure) |
| Email (advisor mailto) | Must for “Email advisor” path; production Should also send structured CRM email/ticket |
| Push notifications | Not in V1 |
| SMS | Not in V1 |
| In-app notification centre / bell | Not in V1 |
| Mortgage due reminders | Not in V1 (data visible in-app only) |

**Should:** Contact request success states clearly confirm what happens next (e.g. advisor will respond within business hours).

---

## 5. Feature Requirements

### 5.1 Authentication and session

**Entry:** `/`  
**Flow:** Email → Continue → OTP → Verify & Sign In → persona home (Investor → Overview; Prospect → Explore).

| ID | Requirement | Priority |
|----|-------------|----------|
| F-AUTH-1 | Support email + one-time verification code sign-in | Must |
| F-AUTH-2 | Route investor identity to Overview; prospect to Explore | Must |
| F-AUTH-3 | Block prospects from investor-only routes (redirect to Explore) | Must |
| F-AUTH-4 | Persist authenticated session for the browser session (or agreed token TTL) | Must |
| F-AUTH-5 | Provide logout from Profile | Should |
| F-AUTH-6 | Invalid / expired OTP shows recoverable error | Must (production) |

**Prototype gap:** OTP not validated; no logout UI.

---

### 5.2 Overview (dashboard)

**Entry:** Overview tab / post-login (investor).

| ID | Requirement | Priority |
|----|-------------|----------|
| F-OV-1 | Greeting with time-of-day + first name | Must |
| F-OV-2 | Hero: Total Portfolio Value | Must |
| F-OV-3 | Capital growth £/% for selected time range; label that growth is value change only | Must |
| F-OV-4 | Show Invested, Equity, Loans outstanding | Must |
| F-OV-5 | Show Gross Yield (annualised, before costs) and Net Cash Flow (monthly, after costs) with deltas where available | Must |
| F-OV-6 | Highlights: Best Performer, Highest Gross Yield, Avg Gross Yield (+ region insight); deep-link to property | Must |
| F-OV-7 | Portfolio Insights cards (concentration, regional, income vs target, capital vs cash flow, pipeline) | Should |
| F-OV-8 | Preview holdings with “View all” → Portfolio | Must |
| F-OV-9 | Advisor block with Schedule a call | Must |
| F-OV-10 | Time range control: 1M · 3M · 1Y · All | Must |

---

### 5.3 Portfolio

**Entry:** Portfolio tab / Overview “View all”.

| ID | Requirement | Priority |
|----|-------------|----------|
| F-PF-1 | Header: holdings count + total portfolio value | Must |
| F-PF-2 | Card: image, reference · status, name, location, yield signal vs portfolio average | Must |
| F-PF-3 | Show Value, Rent, Gross Yield; In Build shows Rent/Yield as em dash | Must |
| F-PF-4 | Mortgaged cards: Monthly, Outstanding, progress, Next due | Must |
| F-PF-5 | Tap card → Property detail | Must |
| F-PF-6 | Footer advisor CTA | Must |

---

### 5.4 Property detail

**Entry:** Portfolio card → `/property/:id`.  
**Tabs (scroll-spy):** Overview · Mortgage* · Performance · Income · Projection · Tenancy*  
\* Mortgage only if plan exists; Tenancy only if tenant present.

| ID | Requirement | Priority |
|----|-------------|----------|
| F-PD-1 | Hero: image, reference, status, name, location, beds/baths/sq ft | Must |
| F-PD-2 | Sticky section tabs for available sections | Must |
| F-PD-3 | Overview: valuation, growth since purchase, purchase price, current value, equity, loan + LTV | Must |
| F-PD-4 | Mortgage Plan: lender · type · rate; monthly, outstanding, term, original loan; progress; next payment; schedule with All/Paid/Due/Upcoming | Must |
| F-PD-5 | Empty schedule filter copy when no rows match | Must |
| F-PD-6 | Value Over Time chart with time ranges | Must |
| F-PD-7 | Income & Costs for Tenanted (rent vs expected, costs, net) | Must |
| F-PD-8 | Income empty state for In Build (post-completion; expected rent) | Must |
| F-PD-9 | Performance: capital growth, gross yield, occupancy | Must |
| F-PD-10 | Projection section using shared engine | Must |
| F-PD-11 | Tenancy: tenant, end date, occupancy when applicable | Must |

**Must not:** In-app “pay mortgage” action in V1.

---

### 5.5 Documents

**Entry:** Docs tab.

| ID | Requirement | Priority |
|----|-------------|----------|
| F-DOC-1 | Library header with file count and new count | Must |
| F-DOC-2 | Categories: All + Contracts, Rental, Tax, Mortgage, Legal, Others | Must |
| F-DOC-3 | Search by document name | Must |
| F-DOC-4 | Open document and download authentic file | Must (production) |
| F-DOC-5 | Upload to library with CRM/vault persistence | Must (production) |
| F-DOC-6 | Filtered empty state with upload CTA | Must |

**Prototype gap:** Sample `.txt` download; upload is session-local only.

---

### 5.6 Explore marketplace

**Entry:** Explore tab (prospect home).

| ID | Requirement | Priority |
|----|-------------|----------|
| F-EX-1 | Header: curated count · available count | Must |
| F-EX-2 | Filters: City, Budget, Gross Yield; chips + Reset; result count | Must |
| F-EX-3 | Card: status, reference, city, name, unit types · completion, From price, Gross Yield Est., 5-Yr Forecast | Must |
| F-EX-4 | Support statuses: Available, Coming Soon, Sold Out (and agreed equivalents) | Must |
| F-EX-5 | Empty filter state | Must |
| F-EX-6 | Tap card → Opportunity detail | Must |

---

### 5.7 Opportunity detail

**Entry:** Explore card → `/explore/:id`.

| ID | Requirement | Priority |
|----|-------------|----------|
| F-OPP-1 | Hide bottom nav; Back + sticky Contact Sales | Must |
| F-OPP-2 | Hero, starting price, 5-year forecast, yield, completion, availability | Must |
| F-OPP-3 | Projection section | Must |
| F-OPP-4 | Why This Opportunity + Key Facts | Must |
| F-OPP-5 | Illustrative Mortgage Plan (deposit / loan / monthly / rate) + personalisation note — or closed/reservation summary | Must |
| F-OPP-6 | Contact Sales opens advisor sheet with opportunity context | Must |
| F-OPP-7 | Optional deep link to open contact sheet on load | Should |

---

### 5.8 Affordability calculator

**Entry:** Calc tab → five-step wizard: Deposit · Affordability · Options · Returns · Projection.

| ID | Requirement | Priority |
|----|-------------|----------|
| F-CALC-1 | Step progress across five steps | Must |
| F-CALC-2 | Deposit, risk appetite → default LTV (55/65/75), horizon 5/10/15 | Must |
| F-CALC-3 | Disable continue below minimum deposit (£1,000 or agreed floor) | Must |
| F-CALC-4 | Buying power with Mortgage vs Cash, LTV override, mortgage type, monthly estimate | Must |
| F-CALC-5 | Match opportunities with Match/Stretch badges and refine controls | Must |
| F-CALC-6 | Empty match state with guidance to adjust deposit/LTV | Must |
| F-CALC-7 | Returns: total return, rents, yields, initial cash required, future value | Must |
| F-CALC-8 | Full projection outlook + assumptions accordion | Must |
| F-CALC-9 | Speak to Advisor CTA | Must |
| F-CALC-10 | Nationality-aware illustrative rates and SDLT treatment | Must |
| F-CALC-11 | Run Numbers deep-link from property/opportunity (`/calculator/:source/:id`) | Open — see §8 |

Illustrative defaults must be configurable via admin assumptions in production (see Metrics & Formulas).

---

### 5.9 Contact advisor

**Entry points:** Overview, Portfolio, Opportunity (Contact Sales), Calculator, Profile.

| ID | Requirement | Priority |
|----|-------------|----------|
| F-ADV-1 | Channels: Schedule a call (20-min), Request callback (business hours), Email | Must |
| F-ADV-2 | Success confirmation per channel | Must |
| F-ADV-3 | Persist contact intent to CRM (§4.1) | Must (production) |
| F-ADV-4 | Include opportunity context when opened from Explore detail | Must |

---

### 5.10 Mortgage plans

Aligned with the Payment Plans product decision: **mortgage** schedules for owned holdings; **illustrative** structure on Explore.

| ID | Requirement | Priority |
|----|-------------|----------|
| F-MTG-1 | Owned mortgaged holding: next due, monthly, outstanding, term progress on Portfolio + Property | Must |
| F-MTG-2 | Schedule list with status filters on Property Mortgage tab | Must |
| F-MTG-3 | Holdings without a plan (e.g. In Build) omit Mortgage tab/strip | Must |
| F-MTG-4 | Explore shows illustrative deposit / LTV / rate / monthly (not a live lender schedule) | Must |
| F-MTG-5 | Sold out / closed opportunities show summary state, not a fake live schedule | Must |

**Must not:** Developer staged purchase payment plans; in-app payment capture.

---

### 5.11 Projections and metrics

| ID | Requirement | Priority |
|----|-------------|----------|
| F-PRJ-1 | Horizons 5Y / 10Y / 15Y on Property, Opportunity, Calculator | Must |
| F-PRJ-2 | Summary: capital growth, cumulative income, total return (capital + income) | Must |
| F-PRJ-3 | Chart + year-by-year + assumptions + “not financial advice” disclaimer | Must |
| F-PRJ-4 | All headline metrics match Metrics & Formulas definitions | Must |
| F-PRJ-5 | UI copy must not conflate dashboard capital growth with projection total return | Must |

---

### 5.12 Empty and partial states

| ID | Requirement | Priority |
|----|-------------|----------|
| F-EMP-1 | Empty Overview, Portfolio, Documents, Explore, Calculator states defined | Must |
| F-EMP-2 | Partial Overview when CRM data incomplete (missing metrics as em dash) | Should |
| F-EMP-3 | Preview hub retained for design QA until live empty accounts exist | Should |
| F-EMP-4 | Production empty states bind to real CRM completeness, not fixtures | Must (production) |

---

## 7. Not in V1 Scope

The following are **explicitly out of V1**. Do not implement unless re-scoped.

| Area | Exclusion |
|------|-----------|
| Payments | Mortgage pay-now, card capture, standing-order setup |
| Lender sync | Live Open Banking / lender API (unless CRM already provides schedule) |
| Admin UI | In-app configuration of rates, opportunities, or schedules |
| Tax engine | Full SDLT band engine; binding tax or mortgage offers |
| Activity feed | Timeline / notifications centre (fixture exists in prototype only) |
| Push / SMS | Mobile push and SMS alerts |
| Offline mode | Full offline portfolio access |
| Desktop-first IA | Multi-column dashboard redesign |
| Advisor workspace | Separate advisor CRM UI inside this app |
| Off-plan developer staged purchase plans | Replaced by mortgage plan model |
| Native apps | iOS/Android stores — V1 is responsive web |

---

## 8. Open Items and Client Confirmations

| # | Topic | Question for client | Impact if unresolved |
|---|-------|---------------------|----------------------|
| C1 | CRM system of record | Which CRM (and document vault) is authoritative for V1 read/write? | Blocks §4.1 |
| C2 | Auth provider | OTP via which vendor? Session length? MFA requirements? | Blocks §5.1 production |
| C3 | Run Numbers | Wire `/calculator/:source/:id` from Property/Opportunity, or drop from V1 IA? | Scope of §5.8 |
| C4 | Opportunity unit picker | Must Contact Sales require unit-type selection on opportunity detail? | UX of §5.7 |
| C5 | Calculator compliance | Are illustrative SDLT / legal / rate assumptions approved for client-facing copy? | Legal review |
| C6 | Contact SLAs | Expected response time copy for call/callback success states? | §5.9 copy |
| C7 | Empty account journey | When do live empty/partial states replace preview-only routes? | §5.12 |
| C8 | Logout / session | Required for V1 or deferred? | §5.1 F-AUTH-5 |
| C9 | Activity feed | Confirm permanently out of V1 (§7) | Avoids scope creep |
| C10 | Prospect definition | Is “any non-investor email” correct, or must prospects be CRM-invited only? | Access model |

---

## 9. External Dependencies

| Dependency | Needed for | Notes |
|------------|------------|-------|
| **CRM** (identity, holdings, opportunities, advisor) | All investor surfaces + Explore content | Two-way per §4.1 |
| **Document vault / DMS** | Secure download and upload | AuthZ with investor identity |
| **Auth / OTP provider** | Login | Email delivery + verification |
| **Advisor calendar / ticketing** | Schedule call & callback fulfilment | Downstream of contact intents |
| **Admin assumptions store** | Projections + Calculator rates/fees | City/property growth, UK/Non-UK rates |
| **Mortgage schedule source** | Owned Mortgage Plan | Via CRM or lender file — not in-app entry |
| **Hosting / CDN** | Web delivery | Responsive web app |
| **Analytics (optional)** | Funnel and engagement | May; not required to launch core flows |
| **Email gateway** | Transactional mail beyond mailto | Should for production contact + OTP |

**Related internal docs**

- Metrics & Formulas — formulas and CRM field checklist  
- Payment Plans product plan — mortgage vs illustrative Explore behaviour  

---

*End of PRD*
