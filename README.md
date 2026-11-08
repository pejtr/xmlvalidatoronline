# XML Validator Online

A privacy-first browser utility for validating, formatting and minifying XML.

## Current capabilities

- live XML well-formedness validation using the browser `DOMParser`
- XML formatter
- XML minifier
- copy / clear / sample actions
- no XML upload in the baseline version — input is processed locally in the browser
- responsive React + TypeScript UI

## Privacy boundary

The current baseline performs XML parsing and transformations in the browser. The XML entered into the editor is not required to be sent to a backend for validation.

## Roadmap

Planned candidates visible in the application roadmap include:

- XSD validation
- file upload
- API access
- optional AI-assisted error explanations
- later QA PRO integration when that product is release-ready

Roadmap items are not claims of current functionality.

## Stack

- React 19
- TypeScript
- Vite 8
- Cloudflare deployment tooling

## Development

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

Cloudflare build:

```bash
pnpm cf:build
```

## Public project rationale

This repository is intentionally public as a developer utility and collaboration surface. Production credentials and private ONYX / QA PRO internals do not belong here.

For broader partner integrations, see:
https://github.com/pejtr/onyx-partner-network


## Agent handoff

This repository is public. Read `AGENTS.md` and `docs/PUBLIC_REPO_NO_TRUST.md` before non-trivial changes. Public documentation must contain only public-safe information and must not imply production state without verification.

## Heureka CZ feed lint (live; unofficial and not certified)

An opt-in browser-only panel checks a subset of the published [Heureka XML feed specification](https://sluzby.heureka.cz/napoveda/xml-feed/): XML syntax, root/shop items, required item fields, positive numeric price, HTTP(S) product URLs, duplicate IDs and URLs, and warnings for common recommended fields.

- No API key, login, provider API, network fetching or customer feed upload is used.
- This is not an official Heureka validator, certification or compatibility guarantee.
- Availability, destination product pages, category matching, Heureka CPC/Marketplace and shop terms are **not** verified.
- Client-side size limit: two million characters; first 100 findings shown with full issue counts.
- Public Cloudflare Worker deployment was smoke-tested on 2026-10-16: https://xmlvalidatoronline.lmd-cf-bridge.workers.dev/ (HTTP 200, `/health`, browser scenarios).

## C64 Ambient Premium interface

The frontend uses a Commodore 64-inspired, pixel-style ONYX OS visual shell. Its ambient starfield, planet and landscape are CSS-only and respect `prefers-reduced-motion`; XML editing and the existing Heureka feed lint remain client-side.

The QA PRO / OMNICORE call-to-action is an **external hyperlink** to `https://omnicore.cz/`, not an API connection, authentication handoff, or data sharing. The XML stays in the current page. The external site's availability and TLS certificate must be verified separately before the hyperlink is promoted as a functioning end-to-end user journey.
