# GitHub and Netlify setup

Prepared for the existing repository `SkyIsBlue070/lyzaXen-Portfolio_Projects` and the existing Netlify site `lyzaxen-portfolio`.

## Repository layout

Add the `portfolio/` directory and root `netlify.toml` from this package to the existing repository. Keep the five existing Afterhours/SignalDesk preview and supporting files. Do not replace the repository with a ZIP blob or upload only the static `dist` output.

The root configuration builds from `portfolio`, runs `npm run build`, publishes `dist`, and deploys `netlify/functions`. The nested configuration also supports using `portfolio` as the base directory in the Netlify UI.

## Connect the existing Netlify site

In the existing site's build configuration, link the existing GitHub repository and select its `main` branch. Do not create a second Netlify site. Use the repository's root configuration, or set base directory to `portfolio`, build command to `npm run build`, publish directory to `dist`, and functions directory to `netlify/functions` relative to that base.

## Formspree configuration

The backend entry point uses `netlify/contact-settings.mjs` for these public destination defaults:

- Site origin: `https://lyzaxen-portfolio.netlify.app`
- Form ID: `xkjoegyv`
- Provider endpoint: `https://formspree.io/f/xkjoegyv`

`SITE_ORIGIN` and `FORMSPREE_FORM_ID` may override those defaults through Netlify runtime environment variables with Functions scope. Empty overrides intentionally disable delivery. These are destination settings, not API credentials; no API key is included.

The browser sends to `/api/contact`. The Netlify function validates the request, rejects cross-origin submissions, and forwards only the expected plain-text fields to the fixed provider URL. The existing security policy can remain same-origin. The frontend is enabled in this prepared source; it becomes usable only after the function is deployed successfully through Git.

## Verification

14 local tests pass, including a mocked end-to-end relay request using the supplied form ID. The production build passes with three case studies and all local references resolved. These tests did not send a real email.

After deployment, submit a clearly labelled test enquiry from the actual portfolio page. Check for a successful provider response and receipt in the Formspree dashboard and the configured inbox. Real provider acceptance and email delivery are not yet verified.

## Publication status

The source is prepared for GitHub. The existing Netlify site must still be linked to this repository to deploy the function. Browser access was unavailable during preparation; real Formspree delivery is not yet verified.
