# Adding a Prototype to the Portal

This is for designers who want to add their work to the Regent prototype portal. Three steps, no command line required beyond the basics.

---

## Before you start

You need:
- Git and a code editor (VS Code is fine)
- The repo cloned to your machine: `git clone [repo URL]`
- A prototype built as a self-contained `.html` file

---

## Step 1 — Drop your file in the right folder

Put your `.html` prototype file in `_prototype/<project-folder>/`, namespaced by the project it belongs to (e.g. `01_regent-brand-com`). This is what lets the portal reference prototypes across multiple projects, not just one brand.

```
00_portal/
└── _prototype/
    └── 01_regent-brand-com/
        └── your-prototype-name.html   ← goes here
```

Name it clearly and with hyphens, no spaces. Example: `homepage-mobile-v2.html`

---

## Step 2 — Register it in protos.js

Open `app/protos.js`. Add an entry to the `PROTOS` array. Copy an existing entry and update the fields:

```js
{
  id:         'x-your-id',           // unique, no spaces, prefix x- for explorations / r- for review
  section:    'explorations',        // 'explorations' (WIP), 'review' (ready for stakeholders), or 'wds-library' (finished, named component)
  subsection: 'Homepage',            // group label within Explorations — or null for Review/WDS Library items
  label:      'Homepage Mobile v2',  // display name in the sidebar
  tags:       ['Mobile'],            // ['Desktop'], ['Mobile'], or ['Desktop', 'Mobile']
  status:     'draft',               // 'draft' | 'review' | 'approved'
  figma:      'https://figma.com/design/...', // Figma share URL, or null
  notes: [
    { date: 'May 12', text: 'Initial exploration — two layout directions.' },
  ],
  urls: {
    ios:     '../_prototype/01_regent-brand-com/your-prototype-name.html',
    android: '../_prototype/01_regent-brand-com/your-prototype-name.html',
    // desktop: '../_prototype/01_regent-brand-com/your-prototype-name.html',
  },
  default: 'ios', // which device tab opens by default: 'ios' | 'android' | 'desktop'
},
```

Only include the device keys that apply. A mobile-only prototype only needs `ios` and `android`.

---

## Adding a WDS Component Library entry

If your prototype is a finished, named component (not a page-level prototype), use `section: 'wds-library'` instead of `'review'`/`'explorations'`. Its name will render in monospace throughout the portal (toolbar + Info panel) since it's a code identifier, not an editorial title.

Three extra optional fields become relevant:

```js
{
  // ...same fields as above, plus:
  section: 'wds-library',
  motionSpec: 'teaser-reveal',  // pattern id from motion-library.html's spec sections — powers the Interaction Spec tab
  about: 'One or two sentences describing what this component is and does.',
  docs: [
    { label: 'Accessibility Report', url: '../_prototype/01_regent-brand-com/your-a11y-report.html' },
  ],
},
```

`motionSpec` must match an existing pattern id in `app/motion-library.html` (currently: `teaser-reveal`, `hover-expand`, `scroll-reveal`). If your component's interaction pattern isn't in there yet, add it to Motion Library first.

---

## Step 3 — Commit and open a PR

```bash
git checkout -b proto/your-prototype-name
git add _prototype/01_regent-brand-com/your-prototype-name.html app/protos.js
git commit -m "Add [Your Prototype Name] to portal"
git push origin proto/your-prototype-name
```

Open a PR into `main`. Once merged, it's live in the portal.

---

## Status values

| Value | Meaning | Where it appears |
|---|---|---|
| `draft` | Work in progress — internal only | Explorations section |
| `review` | Ready for stakeholder review | Ready for Review section |
| `approved` | Signed off by design lead | Ready for Review section |

Move a prototype from `explorations` → `review` by changing both `section: 'review'` and `subsection: null`, and bumping `status` to `'review'`. The sidebar re-sorts automatically.

---

## Adding a Figma link

If your prototype has a corresponding Figma frame, paste the share URL into the `figma` field:

```js
figma: 'https://www.figma.com/design/FILEID/FileName?node-id=123-456',
```

A Figma icon button will appear in the portal toolbar whenever that prototype is selected, letting reviewers jump directly to the source file.

---

## Questions?

Slack **Francisco Vivar** or check the portal walkthrough Loom linked in the project Slack channel.
