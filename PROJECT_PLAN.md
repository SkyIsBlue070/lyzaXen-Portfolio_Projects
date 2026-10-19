# LyzaXen portfolio: project plan and first builds

The portfolio will feature Zoi plus the two independent concept projects below. Zoi should describe the version Sky independently rebuilt and improved, with concrete contributions and no invented claims. Video editing has its own showcase, which Sky is creating separately.

## 1. Afterhours — café and private-event website

**Client brief:** A fictional Kolkata café needs a distinctive website that makes its menu easy to explore and helps small groups prepare an event inquiry.

**Audience:** Independent cafés, restaurants, studios and local hospitality businesses.

**Visual direction:** Warm paper, vermilion, oversized editorial typography, custom café illustrations and simple tactile interactions. This project should feel different from both Zoi and SignalDesk.

**Implemented first version:**

- Responsive landing page with menu, space, gathering and contact-intent sections.
- Menu category filters with accessible pressed states.
- A preference-based drink matcher with its rule-based behavior disclosed. When no drink fits both answers it says so instead of returning a contradictory match.
- Event inquiry form with name, contact, date, time and guest validation, an on-screen summary and a downloadable brief that always reflects the current form.
- Fictional-business disclosure, keyboard-accessible dialogs, focus indicators and reduced-motion support.
- Original SVG café, coffee and menu artwork; no stock photography required.

**Stack:** Semantic HTML, CSS, vanilla JavaScript, original SVG assets. No installation, paid dependency or API key required. Google Fonts is optional; system font fallbacks work offline.

**Useful AI extension:** A server-side menu assistant that answers only from an approved menu, asks relevant clarifying questions and produces a structured event inquiry. It must avoid inventing availability, ingredients or allergy safety. Keep final reservation confirmation deterministic and separate from model text.

**Production work remaining:** Real business content, a real inquiry destination, server-side validation and spam protection, a booking integration if required, deployed browser QA, and an optional model-backed assistant. There are no live reservations, payments or messages in this version.

**What makes it portfolio-worthy:** It combines an identifiable visual brand with a complete customer journey from discovery to a useful inquiry brief.

**Case-study evidence to collect:** Mobile screenshots, a 20-second menu-to-inquiry walkthrough, keyboard review, a real Lighthouse report after hosting, and observations from two or three people trying the flow. Do not claim increased sales or conversions without real data.

## 2. SignalDesk — customer-feedback workspace

**Client brief:** A fictional small product team has customer notes scattered across support messages and interviews. It needs to see repeated themes, inspect evidence and decide what to investigate next.

**Audience:** Early-stage founders, SaaS teams and agencies building internal tools.

**Visual direction:** Dark workspace navigation, light editorial dashboard, restrained violet and muted category colours. The product should feel practical, calm and ready to explore.

**Implemented first version:**

- Overview with metrics calculated from the current dataset.
- Transparent keyword-based theme grouping and a theme-mention chart.
- Source-linked theme detail dialogs.
- Feedback inbox with live search (text, source or ID), theme filters, an unmatched category, result counts and a clear-filters action.
- Custom multiline feedback entry with line-count and length limits.
- Three-column action board with editable statuses.
- Persistence in the current browser, downloadable JSON export and validated JSON import.
- Explicit fictional sample data and no-model-connected disclosures.
- Escaped user-entered content, empty states, reset confirmation, in-dialog validation errors and a persistent warning when browser storage is unavailable.

**Stack:** Semantic HTML, CSS, JavaScript, localStorage and Blob downloads. IBM Plex Sans and Plex Mono keep it visually separate from Afterhours. No backend or API key in this first version.

**Useful AI extension:** A server endpoint calls a text model to propose themes and actions using structured output. Every proposed theme must cite existing feedback IDs. Reject unknown IDs, retain unmatched notes and require human review. The browser should never receive the model provider API key.

**Production work remaining:** Real model integration and evaluation, secure server storage, sign-in and tenant isolation if using real customer records, rate limits, schema validation, clear retention rules and deployed browser QA. The local demo is not an authenticated SaaS application.

**What makes it portfolio-worthy:** Visitors can change the input and inspect the resulting state. It demonstrates product workflows, evidence provenance, state management and a clear path to an evaluated AI feature.

**Case-study evidence to collect:** A sample-to-custom-data walkthrough, successful persistence/export demonstration, cases where matching fails, and later an evaluated comparison of local rules versus model output. Do not describe keyword matching as AI.

## Build order and timebox

The initial source for both projects is included. These estimates are planning limits for refinement, not measured completion times or guarantees.

| Work | Budget |
| --- | --- |
| Refine Afterhours and test its inquiry journey | 6 hours |
| Refine SignalDesk and its evidence workflow | 8 hours |
| Add one evaluated server-side AI integration to SignalDesk | 5 hours |
| Assemble the portfolio and three concise case studies | 7 hours |
| Cross-device checks, accessibility, speed and deployment | 4 hours |
| Total | 30 hours |

Reserve the separately agreed 10 hours for outreach. Video editing time is additional; if it must fit inside these 30 hours, reduce visual refinements or defer the real AI integration. A functioning, honest demo is a better launch milestone than an untested AI claim.

## Verification status

Checked locally in a Chromium-based browser at 390, 768 and 1440 px widths: menu filters, every drink-matcher combination, dialog keyboard behavior, event-form validation and downloaded brief content (Afterhours); adding feedback, theme matching, unmatched notes, search/filter combinations, keyboard status changes, reload persistence, reset, export/import round trip and simulated storage failure (SignalDesk). An automated scan at 390 px found no text below 12 px in SignalDesk, one 11 px meta label in Afterhours, and no WCAG AA contrast failures in either (text laid over the hero illustration was not measured).

Not yet verified: real iOS Safari and Android devices, Firefox and Safari, screen readers, opening the preview files directly from disk, and hosted deployment. No deployed URL should be advertised until deployment succeeds.

Registered Site draft identities are retained in each project's hosting manifest so publishing can resume without creating duplicates.
