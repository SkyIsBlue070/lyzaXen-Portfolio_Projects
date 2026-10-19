/* Public configuration only. Never put credentials, API keys or form IDs in this file. */
window.PORTFOLIO = {
  // Uses the same-origin Netlify function. Deploy the complete source through Git.
  // Provider acceptance and actual inbox delivery must be verified after deployment.
  contactEnabled: true,

  // Shown as a direct contact option only when filled in. Leave empty until you have confirmed the address.
  email: "",

  // Full https://www.fiverr.com/... profile URL. Leave empty to hide the button.
  fiverrUrl: "",

  // Editing samples. Put compressed MP4/WebM files in assets/video/, then set src (and captions for speech).
  // Until src is set, each card shows "Sample in preparation" and no play button.
  clips: {
    gaming: { src: "", captions: "", transcript: "", title: "Gaming highlights" },
    shorts: { src: "", captions: "", transcript: "", title: "Reels & Shorts" },
    motion: { src: "", captions: "", transcript: "", title: "Captions & motion" }
  }
};
