# arushhh.com design map

What was studied, what each site does best, and which patterns this site adopts.
Sources were read from their shipped HTML/CSS/JS and rendered in a browser; verdicts
are from four independent reviews, merged here.

## Sites studied

| Site | What it is | Best at | Avoid |
|---|---|---|---|
| anupamrawat.com | Vite static, 5 KB JS | surface-aware pill nav; row hover system (tile, accent rail, sibling dim); number-first cards; fail-open engineering | metaphor-free pixel field; hover-only stat reveal; name decode on every hover |
| linear.app | product landing | two-tone headlines; hairline cards with cursor glow | blurred gradient glow; CTA per section |
| stripe.com | product landing | eyebrow + headline + one paragraph + visual; large-numeral stats; real code panels | gradient mesh; soft-shadow cards |
| vercel.com | product landing | hairline grid as structure; one easing curve `cubic-bezier(.23,1,.32,1)`; mono for all metadata | pure black/white; logo walls |
| gwern.net | essay site | link-type glyphs; hover previews; sidenotes | density; no hero |
| karpathy.ai | hand-written | logo-on-spine timeline; 1/1/10 grid; tagline + icon row | papers with no figures/tags |
| huyenchip.com | Jekyll | photo floated into first paragraph; proof stated as a number in a sentence | unstructured prose; 7-item nav |
| colah.github.io | Bootstrap | figure-first cover cards with venue line | photo background; floated fixed-height cards |
| sebastianraschka.com | Jekyll | design tokens + dark theme with swappable logos; "label then hairline" headers; three CTA pills | 9-item nav; bracket-link publications |
| tridao.me | al-folio | award tag as outlined chip in the link row; pale right-aligned year dividers; own name underlined | empty thumbnail column |

| brittanychiang.com | Next.js | sticky left rail + scroll-spy line nav; dim-siblings row hover with inset highlight; tag-pill stacks | full-page spotlight on every mousemove; easter-egg cursors |
| rauno.me | Next.js | clip-reveal line-by-line headline; hairline name/year project list; "Copied" email button with aria-live | wheel-hijacked horizontal canvas; custom typeface |
| paco.me | Next.js | staggered fade-up entrance (0.12s step); top/bottom blur-mask edges; three-column name + one-line index | no dates/venues/numbers; no display type |
| joshwcomeau.com | Next.js | @property colour tokens that crossfade on theme toggle; sticky translucent header blocker; clip-path reveal for one hero graphic | illustration hero and sounds; blog-style home |

| jonbarron.info | hand-written table | row anatomy: thumb left; title, authors, venue, links, one sentence right; 200ms still-to-animated crossfade; pale highlight for selected work | 50 autoplaying videos; table layout; hover-only |
| samwho.dev | custom elements | one hiddenState from IntersectionObserver + visibilitychange; tinted widget panel with hairline; motion tokens | 265 KB bundle per post; colour-bar chrome |
| ciechanow.ski | plain JS | aspect-ratio box for every canvas; render-on-demand with one pending rAF; only the most-visible figure animates | div-built sliders with no keyboard semantics |
| leerob.com | Tailwind v4 | 600px/17px/1.6 serif column with UI sans for meta; hairline title…date rows with sibling dimming; clip-path details triangle; warm dark palette | decorative sticky panel that vanishes on mobile |

## Patterns adopted

- Surfaces: dark hero and footer, light body; nav re-themes by the surface under it (anupam).
- One easing everywhere: `cubic-bezier(.23,1,.32,1)` (vercel).
- Mono for every date, label and readout; one sans for everything else (vercel, anupam).
- Hero: number-first copy; the decoration is a data display, a live draft-and-verify strip of his own algorithm (study C, concept A).
- Highlights: photo + three stat cards whose numbers are visible at rest, expanding on hover/focus (anupam, improved per critique).
- Papers: figure-first rows, award chip first in the tag row, own name underlined, link chips, expand-in-place details (colah, tridao, jonbarron).
- Work: logo-on-spine timeline with row hover system (karpathy, anupam).
- Logos: real marks only (Conscious Engines, IBM Research, IIT (ISM) Dhanbad); greyscale at rest, colour on hover; dark/light variants (raschka, study B).
- Motion budget: one staggered entrance on first paint, a clip-reveal on the headline, nothing else moving at rest (paco, rauno).
- Rows: whole-row hit area, dim siblings on hover, inset highlight, arrow micro-motion on links (brittany, anupam).
- Contact: copy-email button that swaps to "Copied" with an aria-live announcement (rauno).
- Theme: light/dark tokens that crossfade via registered @property (josh), dark hero and footer in both.
- Papers expand in place with a button + aria-expanded and a grid-rows height animation; arrow keys move between rows; hash deep-links open a row (study D).
- Live canvases: aspect-ratio box, DPR capped at 2, 24 fps, one rAF, paused off-screen and when the tab is hidden, static first frame, native range inputs (ciechanowski, samwho).
- Type: Geist for display and UI, Source Serif 4 for prose, Geist Mono for meta; 66–70 character measure for prose (leerob, ciechanowski, study D).
- Fail-open: complete static HTML, `.js` gate, `hover:hover` gate, reduced-motion kill, JS under 15 KB (anupam).
