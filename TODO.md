# Release checklist — XML Validator Online

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
