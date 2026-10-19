# LyzaXen portfolio and project collection

The complete portfolio source is in [portfolio/](portfolio/), including case studies, demos and the Formspree enquiry relay. See [DEPLOYMENT-SETUP.md](DEPLOYMENT-SETUP.md) to connect the existing Netlify site.

---

# LyzaXen — web portfolio starter projects

Two independent concept builds: Afterhours and SignalDesk. These are interactive first versions, not completed production services. Read PROJECT_PLAN.md for scope, AI plans and remaining checks.

## Open the previews

After extracting the ZIP, double-click `Afterhours-preview.html` or `SignalDesk-preview.html`. Each preview includes its own styles, scripts and artwork. No install is required. Google Fonts is the only optional external request; fallback fonts work without it.

SignalDesk uses browser-local storage. Persistence for files opened directly can differ by browser; use a local HTTP server for reliable development behavior. If storage is unavailable, the interface reports it and continues for the session.

## Source layout

- `afterhours/dist/`: café website source, CSS, JavaScript and original SVG artwork.
- `signaldesk/dist/`: feedback workspace source, CSS and JavaScript.
- `PROJECT_PLAN.md`: briefs, features, stack, AI extension plan, timebox and verification status.
- `Afterhours-preview.html` and `SignalDesk-preview.html`: self-contained review copies generated from the source.
- `build-previews.mjs`: regenerates both review copies. Run `node build-previews.mjs` after editing the source.

## Local development

With Python installed, open a terminal in this extracted folder and run:

```text
python -m http.server 8060 --bind 127.0.0.1
```

Then visit:

```text
http://127.0.0.1:8060/afterhours/dist/
http://127.0.0.1:8060/signaldesk/dist/
```

Stop the server with Ctrl+C. Edit the source files, not the generated standalone review copies, then run `node build-previews.mjs` (Node 18+) to refresh them.

## Demo boundaries

Afterhours is fictional. Its inquiry builder downloads a brief; it does not submit a booking or send anything. Its menu matcher uses explicit local rules and says so when no drink fits both answers.

SignalDesk starts with fictional feedback. It groups notes with keyword rules, allows evidence review and status changes, and exports and re-imports JSON (imports are validated before they replace anything). No AI model, authentication, real customer database or external integration is connected. Avoid entering sensitive information in the demo.

## Publishing

Serve either `dist` folder with static hosting after real-browser checks. The provided source is dependency-free. Server-backed AI, real inquiries and shared storage need additional work. Registered Site draft configuration is retained separately in the working project; this ZIP deliberately omits Git internals and credentials.
