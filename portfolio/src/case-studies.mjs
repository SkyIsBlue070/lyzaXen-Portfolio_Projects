/* Case-study content. build.mjs turns each entry into /work/<slug>/index.html.
 * Keep claims to what the project actually does. Every link label must say what it opens.
 */

const PROJECT_FILES = 'https://github.com/SkyIsBlue070/lyzaXen-Portfolio_Projects';

export const caseStudies = [
  {
    slug: 'afterhours',
    name: 'Afterhours',
    type: 'Business website · Concept',
    summary: 'A café and event-space website for a fictional Kolkata café — built to feel like a place, and to help visitors decide what to order and how to host a small gathering.',
    facts: [
      ['Project', 'Independent concept'],
      ['My role', 'Design, illustration, copy and development'],
      ['Built with', 'HTML, CSS, JavaScript, SVG'],
      ['Inspect', 'Live demo and project files']
    ],
    links: [
      { kind: 'Live demo', label: 'Open the Afterhours demo', href: '/demos/afterhours/', note: 'The full site, running in your browser.' },
      { kind: 'Source', label: 'Project files on GitHub', href: PROJECT_FILES, note: 'HTML, CSS, JavaScript and SVG source.' }
    ],
    problem: [
      'Small hospitality businesses often end up with websites that look like everyone else’s, or that bury the practical information under stock photos.',
      'The brief for this fictional café: make it distinctive, make the menu easy to explore, and help small groups put together an event inquiry the café could actually act on.'
    ],
    contribution: [
      'A solo project: concept, visual identity, the illustrations, the copy, the front-end build and browser testing.'
    ],
    approach: [
      'Warm paper, vermilion and large editorial type give the café a voice of its own. Instead of stock photography, the café interior, the drinks and the food are original SVG illustrations — light to load and consistent in style.',
      'The interactions stay practical. Menu filters answer “what do you have?”, a small drink matcher answers “what should I try?”, and the gathering form ends with a brief a café could reply to, rather than a dead-end confirmation.',
      'The site is open about being fictional: a banner says so, the matcher explains its rules, and the inquiry form makes clear that nothing is sent or booked.'
    ],
    features: [
      ['Menu filters', 'Category tabs with pressed states, and a screen-reader announcement of how many items are showing.'],
      ['Rule-based drink matcher', 'Picks a drink from two answers, explains why, and says plainly when nothing on the menu fits both.'],
      ['Event inquiry brief', 'Validated name, contact, date, time and guest count; an on-screen summary; and a downloaded brief that always matches the form.'],
      ['Floating navigation', 'A rounded navigation bar that tracks the section you’re reading, with a dropdown menu on phones.'],
      ['Accessible by default', 'Keyboard-friendly dialogs, visible focus, contrast-checked text and reduced-motion support.'],
      ['Responsive layout', 'Designed and checked at phone, tablet and desktop widths.']
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'SVG illustration'],
    limits: 'Fictional business: the menu, prices and opening hours are illustrative. The drink matcher uses explicit rules, not AI, and the inquiry form only downloads a text brief — nothing is sent and nothing is booked.',
    gallery: [
      { file: 'afterhours-hero', alt: 'Afterhours homepage with the headline “A little longer. A little slower.” and an illustrated café interior', caption: 'The homepage: floating navigation, editorial headline and original café illustration.' },
      { file: 'afterhours-menu', alt: 'Afterhours menu section with category filters and illustrated menu cards', caption: 'The menu: category filters, illustrated dishes and listed ingredients.' },
      { file: 'afterhours-space', alt: 'Afterhours “Bring a book” section with an illustrated flat white', caption: 'The space section, with an original overhead illustration.' },
      { file: 'afterhours-gathering', alt: 'Afterhours gathering section and vermilion closing band', caption: 'The gathering prompt that opens the event inquiry brief.' }
    ],
    next: 'signaldesk'
  },
  {
    slug: 'signaldesk',
    name: 'SignalDesk',
    type: 'Web app · Concept',
    summary: 'A customer-feedback workspace that groups notes into themes, keeps the original words one click away, and turns what keeps coming up into a small action board.',
    facts: [
      ['Project', 'Independent concept'],
      ['My role', 'Product design and development'],
      ['Built with', 'HTML, CSS, JavaScript, browser storage'],
      ['Inspect', 'Live demo and project files']
    ],
    links: [
      { kind: 'Live demo', label: 'Open the SignalDesk demo', href: '/demos/signaldesk/', note: 'Add your own notes; everything stays in your browser.' },
      { kind: 'Source', label: 'Project files on GitHub', href: PROJECT_FILES, note: 'HTML, CSS and JavaScript source.' }
    ],
    problem: [
      'Small product teams collect feedback everywhere — support emails, interviews, in-app notes — and then lose the thread.',
      'Storing notes isn’t the hard part. Seeing what keeps coming up, without losing the customer’s actual words behind each conclusion, is.'
    ],
    contribution: [
      'A solo project: product concept, workflow design, interface design, the front-end build and browser testing.'
    ],
    approach: [
      'Evidence first. Every theme links to the notes that triggered it, and notes that match nothing stay visible as “needs manual review” instead of quietly disappearing.',
      'Honest analysis. Themes come from four visible keyword rules. The interface says so wherever a suggestion appears, and each theme shows the exact rule that matched — rather than presenting simple matching as AI.',
      'Local-first. There’s no account: the workspace saves in the browser, can be exported and re-imported as validated JSON, and warns you clearly if the browser won’t let it save.'
    ],
    features: [
      ['Source-linked themes', 'Each theme opens its evidence: the original notes, their source and their ID.'],
      ['Searchable inbox', 'Search by text, source or ID, filter by theme, or show only unmatched notes.'],
      ['Action board', 'Move suggested actions from review to done; keyboard focus stays with the card as it moves.'],
      ['Add feedback', 'Paste several notes at once, with clear validation inside the dialog.'],
      ['Import and export', 'Download the workspace as JSON and restore it later; invalid files are rejected without changing anything.'],
      ['Storage awareness', 'If the browser blocks saving, a persistent warning explains that changes last only for the session.']
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'localStorage', 'File & Blob APIs'],
    limits: 'Fictional sample data. Themes use keyword rules — no AI model is connected. Data lives only in your browser; this is not a secure multi-user system. A model-assisted version that cites feedback IDs is a planned extension, not something this demo does.',
    gallery: [
      { file: 'signaldesk-overview', alt: 'SignalDesk overview with metrics, quote-led themes and a theme-mention chart', caption: 'Overview: metrics, themes led by customer quotes, and the mention chart.' },
      { file: 'signaldesk-voices', alt: 'SignalDesk recent feedback list with theme tags and IDs', caption: '“In their own words”: recent notes with tags and IDs.' },
      { file: 'signaldesk-inbox', alt: 'SignalDesk feedback inbox with search field and theme filter', caption: 'The inbox: search by text, source or ID, filter by theme.' },
      { file: 'signaldesk-board', alt: 'SignalDesk action board with To review, In progress and Done columns', caption: 'The action board, with evidence links on every card.' }
    ],
    next: 'zoi'
  },
  {
    slug: 'zoi',
    name: 'Zoi',
    type: 'Full-stack health app · Rebuild',
    summary: 'A MERN healthcare app with patient and doctor accounts, appointment management, a Gemini-powered assistant in English, Hindi and Bengali, and extraction from clear printed medical documents.',
    facts: [
      ['Project', 'Independent rebuild of a team project'],
      ['My role', 'Rebuild, new features and integration'],
      ['Built with', 'React, Express, MongoDB, Gemini'],
      ['Inspect', 'Source code (no hosted demo)']
    ],
    links: [
      { kind: 'Source', label: 'Zoi source code on GitHub', href: 'https://github.com/SkAman-Official/zoi-health-assistant', note: 'Frontend, backend and setup instructions. There is no public hosted demo.' }
    ],
    problem: [
      'Healthcare apps often assume one language and a lot of form-filling. For many patients in India, both are barriers.',
      'Zoi explores a patient–doctor app where people can ask questions in English, Hindi or Bengali, request appointments through conversation, and turn printed paperwork into text they can review.'
    ],
    contribution: [
      'Zoi began as a team project. I independently rebuilt and improved it; the original project and team attribution are kept in the source.',
      'The rebuild covers patient and doctor accounts, appointment management, the Gemini-powered assistant, conversational booking with confirmation, and printed-document extraction.'
    ],
    approach: [
      'AI stays on the server. Gemini is called from the Express backend, so no API key reaches the browser, and private patient records are kept out of the assistant’s context.',
      'Nothing is booked by the model. The assistant helps collect a department, doctor, date and slot, but an appointment is only created after the patient explicitly confirms a summary the server has checked.',
      'Extraction is reviewed, not trusted blindly. The patient consents before a printed JPG or PNG is sent for extraction, reviews and edits the text, and then chooses to save it. Zoi stores the reviewed text, not the image.'
    ],
    features: [
      ['Patient and doctor accounts', 'Separate portals, with doctor access scoped to their own appointments through authenticated APIs.'],
      ['Appointment management', 'Request, view and manage appointments with registered doctors.'],
      ['Multilingual assistant', 'Gemini-powered conversations in English, Hindi and Bengali.'],
      ['Booking with confirmation', 'Natural-language booking that requires an explicit, server-checked confirmation.'],
      ['Printed document extraction', 'Clear printed JPG/PNG documents become editable text, saved only after review.']
    ],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'Gemini API', 'JWT auth'],
    limits: 'Zoi is not a diagnostic tool and has no live hospital integration; published hospital schedules are shown for information only. Handwriting and PDFs are not supported. Automated tests use mocked services, so it is not presented as production-ready.',
    gallery: [],
    galleryNote: 'App screenshots haven’t been added yet. Rather than show mock-ups, this page links to the source code.',
    next: 'afterhours'
  }
];
