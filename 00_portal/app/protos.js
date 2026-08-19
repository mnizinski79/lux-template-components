/**
 * protos.js — Regent Brand.com Prototype Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Each designer owns this file. To add a prototype:
 *
 *   1. Drop your .html file in ../_prototype/
 *   2. Add an entry to the PROTOS array below following the shape shown
 *   3. Commit — the portal picks it up automatically
 *
 * FIELDS
 *   id          Unique string, no spaces (e.g. 'x-homepage-v2')
 *   section     'wds-library' | 'review' | 'explorations'
 *   subsection  Group label within Explorations (null for Review / WDS Library items)
 *   label       Display name shown in the sidebar
 *   tags        Array of strings shown as small tags: 'Desktop', 'Mobile'
 *   status      'approved' | 'review' | 'draft'
 *   figma       Figma share URL string, or null
 *   motionSpec  pattern id from motion-library.html's spec sections (e.g. 'teaser-reveal'), or null.
 *               Can also be an object keyed by device ({ desktop, ios, android }) when a
 *               component's desktop/mobile interactions are genuinely different patterns
 *               (e.g. editorialGallery: hover-expand on desktop, scroll-reveal on mobile).
 *   about       Short description of the component itself, or null (populates the About tab)
 *   docs        Array of attached documentation: [{ label: 'A11y Report', url: '...', hint: '...' }, ...] — hint is optional, or null
 *   notes       Changelog entries: [{ date: 'May 11', text: '...' }, ...]
 *   urls        Object with any of: desktop, ios, android — pointing to .html files
 *   default     Which device to open by default: 'desktop' | 'ios' | 'android'
 *
 * SECTIONS
 *   'wds-library'  → shows under "WDS Component Library" — finished, named components (not page-level prototypes)
 *   'review'       → shows under "Ready for Review" — stakeholder-facing
 *   'explorations' → shows under "Explorations" — sandbox for testing / work in progress
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PROTOS = [

  // ── WDS Component Library ────────────────────────────────────────────────────

  {
    id: 'r-teaser-card', section: 'wds-library', subsection: null,
    label: 'teaserCard', tags: ['Desktop', 'Mobile'],
    status: 'review',
    figma: null,
    motionSpec: 'teaser-reveal',
    about: 'A tap-to-reveal teaser card for surfacing a set of related offerings (event services, vendors, wellness) under a single themed section. Frost-reveal overlay expands on tap/click to show description and CTA without navigating away.',
    docs: [
      { label: 'Accessibility Report', url: '../_prototype/wds/teaserCard/documentation/teaserCard-a11y-report.html' },
    ],
    notes: [
      { date: 'Jun 23', text: 'Added mobile swipe carousel variant with matching frost-reveal interaction and the updated gradient overlay spec.' },
      { date: 'Jun 22', text: 'Teaser carousel with frost-reveal expand interaction ported from the mobile snap-scroll panel — title lifts via flow to make room for subcopy and CTA on open, fixed 16px gaps throughout.' },
    ],
    urls: {
      desktop: '../_prototype/wds/teaserCard/final/wds-teaser-card-desktop.html',
      ios:     '../_prototype/wds/teaserCard/final/wds-teaser-card-mobile.html',
      android: '../_prototype/wds/teaserCard/final/wds-teaser-card-mobile.html',
    },
    default: 'desktop',
  },

  {
    id: 'r-teaser-card-states', section: 'wds-library', subsection: null,
    label: 'teaserCard — Animated States', tags: ['Desktop', 'Mobile'],
    status: 'review',
    figma: null,
    motionSpec: null,
    about: 'Live default/hover/focus/active states for the base teaserCard (Sprint 3.1 scope) — hover image scale (1.06x) and momentary active overlay are the two animated behaviors under review for v1. A parallel static version (no motion, cursor-only feedback) exists in the Figma spec for comparison.',
    docs: null,
    notes: [
      { date: 'Jul 9', text: 'Built to give stakeholders a live, interactive comparison ahead of the animation-for-v1 decision — hover/focus/active can be triggered directly instead of judging from static frames.' },
    ],
    urls: {
      desktop: '../_prototype/wds/teaserCardStates/final/wds-teaser-card-states-desktop.html',
      ios:     '../_prototype/wds/teaserCardStates/final/wds-teaser-card-states-mobile.html',
      android: '../_prototype/wds/teaserCardStates/final/wds-teaser-card-states-mobile.html',
    },
    default: 'desktop',
  },

  {
    id: 'r-editorial-gallery', section: 'wds-library', subsection: null,
    label: 'editorialGallery', tags: ['Desktop', 'Mobile'],
    status: 'review',
    figma: null,
    motionSpec: { desktop: 'hover-expand', ios: 'scroll-reveal', android: 'scroll-reveal' },
    about: 'A horizontal gallery of destination cards — hover-to-expand on desktop, snap-scroll on mobile. Overlay gradient and frost values aligned to match teaserCard’s recipe for a consistent WDS Component Library look.',
    docs: [
      { label: 'Accessibility Report', url: '../_prototype/wds/editorialGallery/documentation/editorialGallery-a11y-report.html' },
    ],
    notes: [
      { date: 'Jul 7', text: 'Desktop accessibility audit — all 4 supplied photos pass AA contrast in both default and hover states (worst case 6.17:1). Purple brand-wash tint checked against the greenest photo (Bali Coastline): measured shift is subtle, not a visible clash. Keyboard/screen-reader gap found and documented as a dev handoff requirement (hover-only reveal, no keyboard path) — not fixed in this prototype since it\'s a demo file, not shippable code.' },
      { date: 'Jul 6', text: 'Moved into WDS Component Library as editorialGallery. Overlay gradient normalized to teaserCard’s brand-wash + black-gradient recipe (was a one-off dark-tint gradient); mobile frost blur bumped from 0.45 to 0.68 to match the teaserCard a11y fix. Original destinations-cards.html / -mobile.html left untouched — this is a new, separate final.' },
      { date: 'May 11', text: 'Mobile snap-scroll variant added alongside desktop horizontal accordion. Both directions presented.' },
      { date: 'Apr 28', text: 'Horizontal accordion direction selected from A/B/C exploration. Refined expand animation timing to 380ms.' },
      { date: 'Apr 15', text: 'Initial exploration — 3 directions (overlay, carousel, accordion) presented to Mariam and Julia.' },
    ],
    urls: {
      desktop: '../_prototype/wds/editorialGallery/final/wds-editorial-gallery-desktop.html',
      ios:     '../_prototype/wds/editorialGallery/final/wds-editorial-gallery-mobile.html',
      android: '../_prototype/wds/editorialGallery/final/wds-editorial-gallery-mobile.html',
    },
    default: 'desktop',
  },

  {
    id: 'r-accordion-block', section: 'wds-library', subsection: null,
    label: 'AccordionBlock', tags: ['Desktop'],
    status: 'review',
    figma: 'https://www.figma.com/design/ldhUkCq0tXwPCzYJDPZflL/WDS-10-%F0%9F%A7%AA-EXP-Components?node-id=6084-39312',
    motionSpec: null,
    about: 'Header (text-only, no icon/meta list) + a WDS Accordion instance, real 1440px block width and token-accurate padding/gutter. Toggle switches between the two live headingPosition layouts — above (stacked) and start (header pinned to a 373px column, accordion filling the rest). Body content demonstrates all three real content sub-components: textBlock (paragraph + optional link), unorderedList (diamond bullets), and contactStack (icon + phone/email).',
    docs: null,
    notes: [
      { date: 'Aug 19', text: 'FAQ-page context built with 8 real guest-services items. Rebuilt against the actual Figma specs after review: bodyPanel padding corrected from an invented left-indent to the real uniform 12px, contact icons resized to their real inset dimensions (were stretched to fill the 24px box), list/contact copy weight matched to the textBlock paragraph weight. Wrapped in the real 1440px AccordionBlock container with a live above/start headingPosition toggle. Plus/minus icon rebuilt as two independently-rotating bars (matches the real Phosphor Plus-Light geometry) with an ease-out-expo reveal — row opens first, then content fades and rises in on a slight delay; close has no delay so nothing lingers.' },
      { date: 'Aug 18', text: 'Ryan\'s two Aug 18 feedback threads on the built component resolved: tab open/close is multi-mode only (no single-mode toggle), spacing tokens moved to the semantic ui/space/static family where a match exists, headingPosition prop rename verified, legacy appearance mode removed, layer fills cleared (transparent by default), top/bottom spacing added and left/right moved to a responsive gutter token with maxWidth relocated onto the content frame.' },
    ],
    urls: {
      desktop: '../_prototype/wds/accordion/final/wds-accordion-faq-desktop.html',
    },
    default: 'desktop',
  },


  // ── Ready for Review ────────────────────────────────────────────────────────

  {
    id: 'r-events', section: 'review', subsection: null,
    label: 'Events Accordion', tags: ['Desktop', 'Mobile'],
    status: 'review',
    figma: null,
    notes: [
      { date: 'May 8', text: 'Mobile stacked variant added. Image collapses to fixed height on mobile, accordion below.' },
      { date: 'Apr 22', text: 'Two-column crossfading image panel locked in. Crossfade duration set to 500ms with ease-in-out.' },
    ],
    urls: {
      desktop: '../_prototype/01_regent-brand-com/events-accordion.html',
      ios:     '../_prototype/01_regent-brand-com/events-accordion-mobile.html',
      android: '../_prototype/01_regent-brand-com/events-accordion-mobile.html',
    },
    default: 'desktop',
  },

  {
    id: 'r-mobile-header', section: 'review', subsection: null,
    label: 'Mobile Header + CTA Bar', tags: ['Mobile'],
    status: 'approved',
    figma: null,
    notes: [
      { date: 'May 5',  text: 'Approved by Mariam. Sticky CTA bar behaviour locked. Ready for handoff.' },
      { date: 'Apr 30', text: 'Scroll threshold adjusted to 60px. CTA bar fades in over 200ms.' },
      { date: 'Apr 18', text: 'Initial mobile header exploration — transparent over hero, solid on scroll.' },
    ],
    urls: {
      ios:     '../_prototype/01_regent-brand-com/mobile-header.html',
      android: '../_prototype/01_regent-brand-com/mobile-header.html',
    },
    default: 'ios',
  },

  // ── Explorations: Homepage ───────────────────────────────────────────────────

  {
    id: 'x-homepage', section: 'explorations', subsection: 'Homepage',
    label: 'Homepage — Desktop', tags: ['Desktop'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'May 11', text: 'Full homepage WIP — hero video, booking bar, destinations, events, footer. Booking bar sticky behaviour in progress.' },
    ],
    urls: { desktop: '../_prototype/01_regent-brand-com/homepage-desktop.html' },
    default: 'desktop',
  },


  // ── Explorations: Destinations Cards ────────────────────────────────────────

  {
    id: 'x-dest-carousel', section: 'explorations', subsection: 'Destinations Cards',
    label: 'Destinations Carousel', tags: ['Desktop'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'Apr 15', text: '3-up card carousel with expandable teaser cards and progress bar. Variant A.' },
    ],
    urls: { desktop: '../_prototype/01_regent-brand-com/destinations-cards.html' },
    default: 'desktop',
  },

  {
    id: 'x-dest-teaser', section: 'explorations', subsection: 'Destinations Cards',
    label: 'Destinations Teaser', tags: ['Desktop'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'Apr 18', text: 'Refined teaser variant with updated Figma expand values and tighter card spacing.' },
    ],
    urls: { desktop: '../_prototype/01_regent-brand-com/destinations-cards-teaser.html' },
    default: 'desktop',
  },

  {
    id: 'x-dest-overlap', section: 'explorations', subsection: 'Destinations Cards',
    label: 'Overlap Layout', tags: ['Desktop'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'Apr 20', text: 'Alternative card layout with overlapping layered depth effect. Deprioritised in favour of accordion.' },
    ],
    urls: { desktop: '../_prototype/01_regent-brand-com/destinations-cards-overlap.html' },
    default: 'desktop',
  },

  {
    id: 'x-dest-mobile', section: 'explorations', subsection: 'Destinations Cards',
    label: 'Mobile Snap Scroll', tags: ['Mobile'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'Apr 25', text: 'Full-screen snap-scroll, one destination per screen. CSS scroll-snap with momentum.' },
    ],
    urls: {
      ios:     '../_prototype/01_regent-brand-com/destinations-cards-mobile.html',
      android: '../_prototype/01_regent-brand-com/destinations-cards-mobile.html',
    },
    default: 'ios',
  },

  {
    id: 'x-dest-pushpull', section: 'explorations', subsection: 'Destinations Cards',
    label: 'Push / Pull', tags: ['Mobile'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'Apr 27', text: 'Push/pull gesture metaphor — cards slide in from opposite directions. Experimental.' },
    ],
    urls: {
      ios:     '../_prototype/01_regent-brand-com/destinations-cards-mobile-pushpull.html',
      android: '../_prototype/01_regent-brand-com/destinations-cards-mobile-pushpull.html',
    },
    default: 'ios',
  },


  // ── Explorations: Events Accordion ──────────────────────────────────────────

  {
    id: 'x-events-desktop', section: 'explorations', subsection: 'Events Accordion',
    label: 'Events Accordion', tags: ['Desktop'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'Apr 22', text: 'Two-column layout with crossfading image and accordion. Source for review build.' },
    ],
    urls: { desktop: '../_prototype/01_regent-brand-com/events-accordion.html' },
    default: 'desktop',
  },

  {
    id: 'x-events-mobile', section: 'explorations', subsection: 'Events Accordion',
    label: 'Events Mobile', tags: ['Mobile'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'May 8', text: 'Stacked mobile layout — image fixed height on top, accordion below.' },
    ],
    urls: {
      ios:     '../_prototype/01_regent-brand-com/events-accordion-mobile.html',
      android: '../_prototype/01_regent-brand-com/events-accordion-mobile.html',
    },
    default: 'ios',
  },


  // ── Explorations: Content Block Carousel ────────────────────────────────────

  {
    id: 'x-content-carousel', section: 'explorations', subsection: 'Content Block Carousel',
    label: 'Image Strip Carousel', tags: ['Desktop'],
    status: 'draft',
    figma: null,
    notes: [
      { date: 'May 2', text: 'Four-image editorial strip, alternating tall/short, infinite loop. CSS-only animation.' },
    ],
    urls: { desktop: '../_prototype/01_regent-brand-com/content-block-carousel.html' },
    default: 'desktop',
  },


  // Added via portal form
  {
    id: 'x-footer', section: 'review', subsection: null,
    label: 'Footer', tags: ['Desktop'],
    status: 'draft',
    figma: 'https://www.figma.com/design/HNdMXGotuMbSrkKJ7dc8Zo/Marketing-Components?node-id=13426-30940&t=v4dV961VTXpEuvtT-1',
    notes: [
    { date: '', text: 'Updated footer' },
    { date: '', text: 'test' },
    ],
    urls: {
    desktop: '../_prototype/01_regent-brand-com/footer.html',
    },
    default: 'desktop',
  },

  // Added via portal form
  {
    id: 'x-demo-destinations-mobile', section: 'explorations', subsection: null,
    label: 'Demo Destinations Mobile', tags: ['Mobile'],
    status: 'draft',
    figma: null,
    notes: [
    { date: 'May 14', text: 'Added to portal.' },
    ],
    urls: {
    ios: '../_prototype/01_regent-brand-com/demo-destinations-mobile.html',
    android: '../_prototype/01_regent-brand-com/demo-destinations-mobile.html',
    },
    default: 'ios',
  },


  // ── Explorations: Tools ──────────────────────────────────────────────────────

  {
    id: 'tool-motion-library', section: 'explorations', subsection: 'Tools',
    label: 'Motion Library', tags: ['Reference'],
    status: 'approved',
    figma: null,
    notes: [
      { date: 'Jun 23', text: 'Tokenized reference for shared interaction patterns (teaser tap-reveal, click expand, scroll reveal) — copy values into a new prototype instead of re-deriving timing. Not wired into any production file.' },
    ],
    urls: { desktop: 'motion-library.html' },
    default: 'desktop',
  },

];