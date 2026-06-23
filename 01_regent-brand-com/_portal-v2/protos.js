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
 *   section     'review' | 'explorations'
 *   subsection  Group label within Explorations (null for Review items)
 *   label       Display name shown in the sidebar
 *   tags        Array of strings shown as small tags: 'Desktop', 'Mobile'
 *   status      'approved' | 'review' | 'draft'
 *   figma       Figma share URL string, or null
 *   notes       Changelog entries: [{ date: 'May 11', text: '...' }, ...]
 *   urls        Object with any of: desktop, ios, android — pointing to .html files
 *   default     Which device to open by default: 'desktop' | 'ios' | 'android'
 *
 * SECTIONS
 *   'review'       → shows under "Ready for Review" — stakeholder-facing
 *   'explorations' → shows under "Explorations" — work in progress / sandbox
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PROTOS = [

  // ── Ready for Review ────────────────────────────────────────────────────────

  {
    id: 'r-destinations', section: 'review', subsection: null,
    label: 'Destinations Cards', tags: ['Mobile'],
    status: 'review',
    figma: null,
    notes: [
      { date: 'May 11', text: 'Mobile snap-scroll variant added alongside desktop horizontal accordion. Both directions presented.' },
      { date: 'Apr 28', text: 'Horizontal accordion direction selected from A/B/C exploration. Refined expand animation timing to 380ms.' },
      { date: 'Apr 15', text: 'Initial exploration — 3 directions (overlay, carousel, accordion) presented to Mariam and Julia.' },
    ],
    urls: {
      desktop: '../_prototype/destinations-cards.html',
      ios:     '../_prototype/destinations-cards-mobile.html',
      android: '../_prototype/destinations-cards-mobile.html',
    },
    default: 'desktop',
  },

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
      desktop: '../_prototype/events-accordion.html',
      ios:     '../_prototype/events-accordion-mobile.html',
      android: '../_prototype/events-accordion-mobile.html',
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
      ios:     '../_prototype/mobile-header.html',
      android: '../_prototype/mobile-header.html',
    },
    default: 'ios',
  },

  {
    id: 'r-wedding-amenities', section: 'review', subsection: null,
    label: 'Wedding Amenities Teaser', tags: ['Desktop', 'Mobile'],
    status: 'review',
    figma: null,
    notes: [
      { date: 'Jun 23', text: 'Added mobile swipe carousel variant with matching frost-reveal interaction and the updated gradient overlay spec.' },
      { date: 'Jun 22', text: 'Teaser carousel with frost-reveal expand interaction ported from the mobile snap-scroll panel — title lifts via flow to make room for subcopy and CTA on open, fixed 16px gaps throughout.' },
    ],
    urls: {
      desktop: '../_prototype/wedding-amenities-teaser.html',
      ios:     '../_prototype/wedding-amenities-teaser-mobile.html',
      android: '../_prototype/wedding-amenities-teaser-mobile.html',
    },
    default: 'desktop',
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
    urls: { desktop: '../_prototype/homepage-desktop.html' },
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
    urls: { desktop: '../_prototype/destinations-cards.html' },
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
    urls: { desktop: '../_prototype/destinations-cards-teaser.html' },
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
    urls: { desktop: '../_prototype/destinations-cards-overlap.html' },
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
      ios:     '../_prototype/destinations-cards-mobile.html',
      android: '../_prototype/destinations-cards-mobile.html',
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
      ios:     '../_prototype/destinations-cards-mobile-pushpull.html',
      android: '../_prototype/destinations-cards-mobile-pushpull.html',
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
    urls: { desktop: '../_prototype/events-accordion.html' },
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
      ios:     '../_prototype/events-accordion-mobile.html',
      android: '../_prototype/events-accordion-mobile.html',
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
    urls: { desktop: '../_prototype/content-block-carousel.html' },
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
    desktop: '../_prototype/footer.html',
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
    ios: '../_prototype/demo-destinations-mobile.html',
    android: '../_prototype/demo-destinations-mobile.html',
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
    urls: { desktop: 'motion-library-light.html' },
    default: 'desktop',
  },

];