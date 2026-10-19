# LyzaXen portfolio — Formspree setup

The prepared source now enables the frontend and supplies server-side destination defaults for `https://formspree.io/f/xkjoegyv` and `https://lyzaxen-portfolio.netlify.app`. See `../DEPLOYMENT-SETUP.md` for repository layout and deployment instructions. The older setup notes below are retained for reference; runtime environment variables are optional overrides in this version.

Local verification: 14 tests pass and the production build succeeds. GitHub source publication and the Netlify connection are separate steps; real email delivery must be verified on the deployed site. Publish the full source through Git so the Netlify function is included; dropping only `dist/` cannot activate this server-backed form.

---

# LyzaXen portfolio - v4 rebuild

A colourful rebuild of Sky’s portfolio: websites, web apps and short-form video editing. Plain HTML, CSS and JavaScript with a zero-dependency Node build. No npm install, no framework, no paid services.

The previous source is saved next to this folder as `lyzaxen-portfolio-source-before-rebuild.zip`.

## Run it

Requires Node 22 or newer.

| Command | What it does |
| --- | --- |
| `npm run dev` | Builds, serves http://127.0.0.1:4174 and rebuilds when you save. Refresh to see changes. |
| `npm run build` | Writes the production site to `dist/` and fails if any local link or image is missing. |
| `npm start` | Serves the built `dist/` at http://127.0.0.1:4173. |
| `npm test` | Contact-function security tests and paper-fold geometry tests. |

## What’s where

- `index.html` — the homepage (hero peel, work, video, services, process, about, FAQ, contact).
- `src/case-studies.mjs` — content for `/work/afterhours/`, `/work/signaldesk/` and `/work/zoi/`. The build turns it into pages using the homepage header and footer.
- `css/site.css` — the whole design system and layouts.
- `js/peel.js`, `js/peel-geometry.js` — the paper peel. `js/main.js` — menu, reveals, video slots, screenshot viewer and contact form.
- `config.js` — public settings: form switch, email, Fiverr link and video clips. Never put secrets here.
- `demos/` — working copies of Afterhours and SignalDesk, served at `/demos/afterhours/` and `/demos/signaldesk/`.
- `assets/work/` — screenshots cropped from the supplied captures (browser bar, side panel and taskbar removed; interfaces untouched), in 800 px and 1600 px JPEG.
- `netlify/functions/contact.mjs` — the enquiry relay to Formspree. `tests/` — its tests and the fold tests.
- `_headers` — security headers. Strict policy on portfolio pages, a separate policy for `/demos/*` (Google Fonts and SignalDesk’s inline tag colours).
- `docs/COPY-AND-GIG.md` — your earlier Fiverr gig copy, kept for reference.

## Remaining setup before launch

1. **Contact form (required for enquiries).** The form is switched off and says so. To enable it:
   1. Create a free Formspree form with your own email and verify it.
   2. In Netlify → Site configuration → Environment variables, add `FORMSPREE_FORM_ID` (the ID from `https://formspree.io/f/<ID>`) and `SITE_ORIGIN` (`https://lyzaxen-portfolio.netlify.app`, no trailing slash).
   3. Deploy from Git, so the function in `netlify/functions` is deployed. A drag-and-drop deploy of `dist/` does not include functions.
   4. Set `contactEnabled: true` in `config.js`, redeploy, and send yourself a real test enquiry. Only treat the form as live once it arrives.
2. **Direct email (optional).** `config.js → email` is empty because no confirmed address was supplied. Fill it in to show an “Email” button beside the form.
3. **Fiverr (optional).** Add your profile URL to `config.js → fiverrUrl` to show a “Hire me on Fiverr” button.
4. **Editing samples.** Put compressed MP4 files (H.264, ideally under 8 MB each) in `assets/video/`. Set `clips.<name>.src` to e.g. `assets/video/gaming.mp4`, and add a `.vtt` captions file where there is speech (`assets/captions-example.vtt` shows the format). Each card switches from “Sample in preparation” to a Play button automatically. No placeholder ever shows a Play button.
5. **Zoi and StrideCircle screenshots.** None were supplied, so Zoi uses a labelled title card and StrideCircle has no image. To add Zoi screenshots, crop them like the others into `assets/work/zoi-*-800.jpg` and `-1600.jpg`, then add them to `gallery` in `src/case-studies.mjs`.
6. **GitHub project files.** The case studies link to `SkyIsBlue070/lyzaXen-Portfolio_Projects`. Push the latest Afterhours and SignalDesk source there, so it matches the demos hosted here.
7. **Indexing.** `robots.txt` and the robots meta tag still block search engines (draft safety). When you approve the launch, change `robots.txt` to `Allow: /` and the meta tag in `index.html` to `index, follow`.
8. **Screen recordings.** `AfterHours_SS/DemoVideo` and `SignalDesk_SS/DemoVideo` are 30–37 MB each, too heavy to embed as they are. If you trim and compress them (for example in DaVinci Resolve, 1080p H.264, under 10 MB), they can be added to the case studies.

## Verification status

**Checked locally in Chromium at 390, 768 and 1440 px:**
- Paper peel: a real mouse drag (short drag springs back, long drag opens), tap on phone, the text button, Enter, Escape and focus return.
- Mobile menu, current-section highlighting, case-study pages, the screenshot viewer (arrows, Escape, focus return), and service preselection.
- Contact form: disabled state; plus validation, loading, failure and success, tested with the form temporarily enabled and the server response simulated.
- Both hosted demos under their security policy, with no console errors.
- No horizontal scrolling at any of the three widths.
- No text below 12 px on the homepage at phone width.

**Automated:**
- 12 Node tests (contact-function security and fold geometry).
- JavaScript syntax checks.
- The build’s check that every local link, image and anchor exists.

**Not verified:**
- Real iOS Safari and Android devices, and Firefox and Safari on desktop.
- Screen readers.
- A real Netlify deploy, including the function and headers in production.
- Actual Formspree delivery.
- Lighthouse scores.
