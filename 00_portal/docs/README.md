# 00_portal

Standalone home for the Regent prototype portal — pulled out of `01_regent-brand-com/_portal-v2/` so it can eventually reference prototypes across `01_`, `02_`, `03_`, `04_` project folders instead of being scoped to one brand. Long-term direction: this becomes the public face of the Wilson design system (a "WDS Component Library"), not just a Regent review tool.

## Status

Local only — nothing in this folder is pushed to GitHub yet. The live site's Vercel root is `regent-brand-com` (renamed on disk to `01_regent-brand-com`, hence the earlier commit confusion). Once this folder is pushed, Mike needs to repoint Vercel's Root Directory to `00_portal`.

## Structure

```
00_portal/
├── index.html            landing page
├── login.html            password gate
├── middleware.js          auth check (gates /_prototype/* and /index.html and /)
├── server.js              local dev server (node server.js)
├── vercel.json, api/      Vercel deploy + write endpoints
├── app/                   the portal application
│   ├── portal.html     the live portal — device chrome + iframe are rendered inline, no dependency on _shells/
│   ├── protos.js          prototype registry
│   ├── motion-library.html, visual-foundations.html, add.html, guide.html, story.html, deck.html
├── _prototype/
│   └── 01_regent-brand-com/   prototype HTML files, namespaced by source project — includes teaserCard-a11y-report.html, teaserCard-a11y-deck.html (recovered from _archive)
│   └── _assets/               only the fonts/images actually referenced by prototypes (copied in, not the full 951MB _assets library)
├── docs/                  CONTRIBUTING.md, README.md
└── _archive/              retired portal versions kept for reference
```

## WDS Component Library

A third sidebar section, separate from "Ready for Review" (page prototypes awaiting sign-off) and "Explorations" (the sandbox). This is where finished, named components live — `teaserCard` is the first entry.

- **Sidebar** — gold-accented section label, sits above the other two. A "Library only" toggle below the search bar filters the sidebar down to just this section, hiding Review/Explorations.
- **`protos.js` schema additions** — `section: 'wds-library'`, plus optional `motionSpec` (pattern id from `motion-library.html`'s spec sections, e.g. `'teaser-reveal'`), `about` (short description), and `docs` (array of `{ label, url }` doc links — currently just the Accessibility Report; Motion Library isn't a `docs` entry, it lives as its own banner inside the Interaction Spec tab instead).
- **Component identity styling** — WDS Library item names (like `teaserCard`) render in monospace, both in the toolbar's proto-name and the Info panel's proto-name, since they're code identifiers, not editorial page titles. Controlled via `.tb-proto-name--code` / `.drawer__proto-name--code`, toggled based on `proto.section === 'wds-library'`.

### The Info panel ("Details")
Click "Details" (the primary/white FAB, bottom-right, next to Share/Open/Figma) to open a floating, draggable, resizable panel — `position: fixed`, so it always escapes the canvas's clipping, with smart initial placement that flips to the phone's left side if there's no room on the right. Three tabs:
- **About** — description + doc-pill links (styled like Motion Library's own file-pill reference style)
- **Interaction Spec** — embeds `motion-library.html?spec=<pattern>` live via iframe (genuinely dynamic, not a copy — edits to Motion Library show up here automatically). Includes a "View full Motion Library page" banner linking out to the real anchor (`#teaser-reveal`) for the full page + live demo, since the embedded panel intentionally hides the interactive stage (too wide for the panel).
- **Changelog** — same as other prototypes' changelog, just living as a tab here instead of its own drawer

One trigger (the Details FAB), one panel, one close mechanism (X, click-outside, or the FAB again) — this went through several more complicated iterations (a second drawer, a FAB that got physically covered by its own panel, a panel anchored to the phone frame that got clipped) before landing here. See git history / conversation log if resurrecting any of those patterns is ever tempting — they were each tried and reverted for concrete reasons.

### Color system rule
Gold/amber (`rgba(212,175,110,...)`) means **one thing only: "this is WDS Component Library."** It's used on the sidebar section label, the "Library only" toggle, and the Motion Library banner — nothing else. "Primary action" emphasis (the Details FAB) uses a bright white fill instead, specifically so it doesn't compete with the identity color. The "IN REVIEW" status badge uses blue, not gold, since prototype review-status is unrelated to WDS Library membership (this used to collide before a deliberate fix).

## Known issues / open questions

- **Deep links** (`?proto=...&device=...&model=...`) need to be figured out before relying on them for sharing. `app/portal.html` isn't behind the auth middleware, but the `_prototype/*` files it loads in an iframe are — so a shared link can land on the right device/proto in the toolbar while the iframe itself prompts for the access code instead of showing the prototype. Not confirmed as an actual problem since the people we currently share with already have access, but worth resolving before using deep links externally.
- `_shells/` (`ios-safari.html`, `android-chrome.html`) was not carried over from `01_regent-brand-com` — intentionally, since `portal.html` doesn't use it. Only `index.html`'s landing page still links to it, and those links are currently dead.
- The live Vercel root is `regent-brand-com` (renamed on disk to `01_regent-brand-com`). Mike still needs to repoint the Root Directory setting to `00_portal` once this folder is pushed.
