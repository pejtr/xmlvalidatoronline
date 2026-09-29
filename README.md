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
