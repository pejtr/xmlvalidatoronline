# XML Validator Online

Free browser-side XML and sitemap tools, built with React, TypeScript and Vite for Cloudflare Workers.

## Implemented in this branch

- **Sitemap Generator (manual URL list):** paste up to 1,000 absolute HTTP(S) URLs or relative paths with a base URL; skip invalid/cross-origin links and duplicates; export `sitemap.xml` or `sitemap.txt`; optionally add an accurate `lastmod` date.
- **Sitemap Validator:** inspect pasted/imported XML `urlset` and `sitemapindex` structure; check the official sitemap namespace, required `loc`, HTTP(S) URLs, duplicates, optional `lastmod` and entry counts. This is a selective linter, not XSD validation.
- **XML Validator:** local browser `DOMParser` syntax validation, formatting and minification; XML must be well-formed. Format/minify preserve mixed textual content when possible, but the transformations are not canonical XML.
- **Heureka CZ feed lint:** opt-in, unofficial checks of selected published Heureka XML feed rules. This is not official certification.
- **Responsive interface:** four tool tabs, status reports, sample data, file import, local downloads and clear limitations.

The generator **does not crawl a website**. A single URL yields a sitemap containing that URL, not a discovered site map. It does not check HTTP status, robots.txt, canonical URLs, indexing or Search Console. Import and processing use browser APIs only.

## Privacy boundary

No pasted XML, imported file or URL list is uploaded to our backend. The frontend contains no third-party runtime script. The generated Cloudflare Worker restricts scripts and connections through a Content Security Policy. The separate QA ecosystem link is an external destination, with no automatic data handoff.

Do not deploy third-party marketing scripts into this editor without an explicit privacy/security review. This repository is public; do not commit credentials, user data or private service identifiers.

## Limits

- Up to **1,000 unique URLs** per generated sitemap; single-origin URLs only.
- Input limited to **2,000,000 characters** for local processing.
- XML sitemap protocol allows up to **50,000 entries / 50 MB** per file; these browser tools use deliberately smaller limits.
- No XSD schema validation, URL fetching, background crawling, sitemap upload or provider certification.
- Empty/malformed input and DOCTYPE/DTD are rejected by the local validators.

## Development

Requires a current Node 22+ environment and pnpm.

```bash
pnpm install
pnpm test
pnpm lint
pnpm build
pnpm cf:build
```

Cloudflare deployment is available through `pnpm cf:deploy` only after QA, explicit approval and verified Cloudflare account access. **Repository commits and PRs do not prove any production deployment.**

## Release checklist

1. `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm cf:build` pass.
2. Browser manual checks: valid/invalid sitemap, duplicates, malformed XML, Heureka sample, local import/export, mobile width 390 px and desktop width 1440 px.
3. Cloudflare preview `/health`, HTML and static assets check; verify privacy headers.
4. Review changes, merge, deploy to Cloudflare, verify the actual live hostname and DNS. Keep a rollback SHA.

## References

- [Google Search Central: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Sitemaps XML protocol](https://www.sitemaps.org/protocol.html)
- [Heureka XML feed specification](https://sluzby.heureka.cz/napoveda/xml-feed/)

Read `AGENTS.md` and `docs/PUBLIC_REPO_NO_TRUST.md` before non-trivial work.
