// Public destination settings, kept server-side with the enquiry relay.
// These are not API keys. Netlify runtime environment variables may override them.
export function deploymentEnvironment(env = process.env) {
  return {
    ...env,
    SITE_ORIGIN: env.SITE_ORIGIN ?? 'https://lyzaxen-portfolio.netlify.app',
    FORMSPREE_FORM_ID: env.FORMSPREE_FORM_ID ?? 'xkjoegyv'
  };
}
