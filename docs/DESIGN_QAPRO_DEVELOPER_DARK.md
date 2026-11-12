# XML Validator Online × QAPRO — Dark Developer UI

**Version:** 1.0 (2026-11-11)  
**Status:** Approved visual direction → implementation on a feature branch; production status requires independent verification.  
**Design language:** Midnight developer cockpit with violet/cyan light, dark glass panels, professional monospaced editor and clear, green validation evidence.

## 1. Product intent

XML Validator Online is a free utility for software developers, QA engineers and technical SEOs. It leads **voluntarily** to QAPRO for broader quality-assurance workflows. The free tool must work independently of QAPRO and must never gate XML validation behind registration or a paywall.

**Journey:** discover from search → paste/import XML → see real validation result → optionally explore QAPRO via a clearly labeled external link with fixed UTM attribution.

Do not invent usage counts, customer logos, certifications, "100% GDPR" guarantees, functional integrations or premium features that have not been implemented and verified.

## 2. Visual system

| Token | Hex | Purpose |
|---|---|---|
| `--bg` | `#080b1c` | Body/night sky |
| `--surface` | `#10162e` | Tool cards |
| `--surface-raised` | `#161d3c` | Elevated panels |
| `--line` | `#323b67` | Borders |
| `--text` | `#eff1ff` | Primary text |
| `--muted` | `#afb9d9` | Supporting text |
| `--violet` | `#ac6cff` | Primary CTA / active tabs |
| `--purple` | `#6739ef` | Gradient endpoint |
| `--cyan` | `#66d8ff` | Info and highlights |
| `--success` | `#39d6a0` | Actual success |
| `--danger` | `#ff879e` | Actual errors |

- Typography: UI sans-serif system stack; XML editing in monospace.
- Rounded corners: 14–22 px panels, 10–12 px buttons.
- Shadows: restrained violet halo, no distracting motion during typing.
- CSS-only stars/orbs/code visualization; avoid network-dependant background images and opaque third-party scripts.
- Primary button: violet gradient with a clear focus ring and hover state.
- Avoid red/green-only meaning: pair status color with icon and textual result.

## 3. Layout (desktop reference ~1536×1024)

1. **Top bar** — code-mark logo, "XML Validator Online", subtle "by QAPRO.cz"; links to tools, how-to and QAPRO.
2. **Hero left** — compact FREE DEV TOOL badge; headline "XML Validator & Sitemap Generator"; accurate value proposition; three true benefits; "Open free tools" CTA.
3. **Hero middle** — floating code/evidence CSS artwork; purely decorative, aria-hidden.
4. **Hero right** — dark violet QAPRO panel with general QA direction, external CTA and technology badges, no fabricated proof or live-feature claims.
5. **Tool workbench** — violet-outlined full-width panel: horizontally scrollable tabs; working tools are XML Validator, Sitemap Generator, Sitemap Validator, Heureka Feed. A separate "More tools" link points to the roadmap, not nonworking tabs.
6. **Editor** — local file picker / drag-and-drop zone on the left and a code textarea on the right; keyboard accessible; functional file import capped by current local limits.
7. **Actions** — actual XML format/minify/copy/example/clear, sitemap export XML/TXT and validation feedback; never show XSD validation controls until implemented.
8. **Status strip** — computed results (errors, warnings, counts) from the current document, never hardcoded success or customer metrics.
9. **Why QAPRO** — four informational cards (test workflows, repeatable checks, evidence, team processes) worded as use cases rather than unverified shipped features.
10. **Bottom conversion panel** — prominent QAPRO CTA with fixed source-only UTM. No XML content, URL lists, validation output or personal data in the destination.
11. **Future tools** — clearly labeled *Planned*, e.g. XML→JSON, JSON Validator, RSS Validator, URL Encoder; not clickable as if already available.

## 4. Behavior and privacy

- Existing parsing/formatting/sitemap/Heureka code remains authoritative; redesign must not fabricate results.
- All user-entered text stays in the browser. External links contain only constant campaign attribution.
- File input and drag-and-drop use local File API, no upload.
- Invalid XML never displays a success state.
- Side-effect links are regular opt-in `target="_blank" rel="noopener noreferrer"`.
- System `prefers-reduced-motion` disables decorative animation.
- Preserve `<label>`, accessible tab roles, keyboard focus and descriptive live result regions.

## 5. Responsive implementation

- ≥1200 px: hero illustration and QAPRO feature panel visible; editor in two columns.
- 768–1199 px: hero artwork compresses/hides; conversion card remains readable.
- ≤767 px: hero and panel stack; tool tabs scroll horizontally; editor/drop area stacks vertically; actions wrap to full-size tappable buttons.
- QA viewports: 390 px and 1440 px; horizontal page overflow forbidden.

## 6. Definition of done and release gates

- [ ] Document saved in repository and linked from README.
- [ ] Dark interface is implemented in React/CSS without replacing working parser logic.
- [ ] Real local file selection and drop work; invalid input and oversize error states handled.
- [ ] Every visible tab/action either works or is clearly marked planned.
- [ ] `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm cf:build` pass.
- [ ] Browser inspection at 390 px and 1440 px including keyboard focus, XML parse, sitemap export, Heureka sample and tabs.
- [ ] QAPRO destination checked for DNS, HTTPS and a meaningful conversion path before live external CTAs.
- [ ] Cloudflare deploy + production E2E including correct commit SHA. A GitHub merge is not a deploy.

## 7. Commercial measurement (future)

Measure privacy-conscious aggregate events only after review: page views, which free tool was opened, opt-in QAPRO CTA clicks by static placement, confirmed qualified QAPRO leads, and **paid invoices** as a separate metric. A CTA click is not revenue.
