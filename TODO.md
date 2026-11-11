# Release checklist — XML Validator Online

## Dark developer cockpit (approved mockup implementation)

- [x] Save visual tokens/layout/behavior in `docs/DESIGN_QAPRO_DEVELOPER_DARK.md`.
- [x] Implement dark violet hero, QAPRO promo, tool tabs and real status cards.
- [x] Preserve existing functional validators; add local file drag-and-drop with limits.
- [x] Clearly mark missing future tools as planned; no fake metrics or non-working premium controls.
- [ ] Confirm `pnpm lint`, `pnpm build` and Cloudflare Worker build on current design commit.
- [ ] Run unit tests and browser E2E including drag/drop, keyboard, XML and sitemap downloads.
- [ ] Screenshot review at 390 and 1440 pixels; verify contrast and no overflow.
- [ ] Verify QAPRO.cz destination and opt-in funnel before merging/deploying CTAs.
- [ ] Verify Cloudflare runtime, release SHA and post-deploy E2E before calling it live.


## Developer → QAPRO funnel (2026-11-11)

- [x] Developer-focused UX, SEO copy and QAPRO call-to-action placements.
- [x] Fixed UTM attribution only; never put editor state or user-entered XML in the destination link.
- [x] Replace generic QA destination with the requested QAPRO.cz URL in the code.
- [ ] **P0:** verify QAPRO.cz resolves publicly and serves HTTPS with the expected developer-facing page.
- [ ] **P0:** verify QAPRO's relevant CTA / next step receives an opt-in human click and works end-to-end.
- [ ] **P0:** inspect the release on 390 px / 1440 px and check external-tab security and link attribution.
- [ ] **P0:** no live link deployment until QAPRO destination is working; status must remain unverified without live evidence.
- [ ] Count real referrals and customer requests separately from paid orders; do not infer revenue from clicks.


## Sitemap tools / premium interface (branch: feat/sitemap-tools-premium-20261111)

- [x] Add client-side sitemap generation from entered URLs, optional accurate lastmod, XML/TXT downloads.
- [x] Add sitemap.xml and sitemapindex structural checks with explicit limitations.
- [x] Preserve XML syntax, formatting and Heureka feed tooling.
- [x] Replace former retro interface with responsive, form-first design.
- [x] Remove third-party runtime script from private XML editor, add Worker CSP.
- [x] Fix malformed literal escapes in global CSS.
- [x] Add Node 22+ unit tests for generator.
- [ ] **VERIFY:** Run `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm cf:build` in a real repository runtime.
- [ ] **VERIFY:** Browser tests on 390 px and 1440 px, keyboard navigation, tabs, file import/export and examples.
- [ ] **VERIFY:** sitemap edge cases with real browser DOMParser: malformed XML, valid urlset and sitemapindex, duplicate loc, invalid namespace, missing loc, wrong lastmod.
- [ ] **VERIFY:** XML pretty-print mixed content and entity round trips; Heureka sample and invalid feed.
- [ ] **VERIFY:** Cloudflare preview health/assets/CSP and live domain DNS before deployment.
- [ ] Manual security review for prospective server-side crawler (rate limit, robots.txt, SSRF and resource caps).
- [ ] Obtain release approval, merge, deploy to Cloudflare and prove live status with URL, commit SHA and browser E2E.
- [ ] Keep paid features/lead acquisition separate from private XML contents and avoid misleading certification claims.

## Public repository safety

- [x] Read public no-trust guidance.
- [x] No connected-account personal records or private infrastructure published.
- [ ] Review dependency/secret scanning before release.
- [ ] No public release claims until direct production verification.
