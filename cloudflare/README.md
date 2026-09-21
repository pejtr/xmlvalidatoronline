# Cloudflare production origin

The production origin is a self-contained Cloudflare Worker generated from the Vite `dist/` output.

## Build

```bash
pnpm cf:build
```

This runs the normal application build and then packages every file in `dist/` into
`cloudflare/worker.generated.js`. The generated Worker is intentionally ignored by Git.

## Verify

```bash
node --check cloudflare/worker.generated.js
```

The Worker exposes `/health` and serves immutable hashed assets with a one-year cache policy.
SPA routes fall back to `/index.html`.

## Deploy

```bash
pnpm cf:deploy
```

The first production deployment is live at the account's `workers.dev` hostname.

Custom domains should only be attached after the Cloudflare zone is **active**. As of the
2026-09-21 migration, the zone is pending until the registrar delegates
`xmlvalidatoronline.com` to:

- `jaime.ns.cloudflare.com`
- `peaches.ns.cloudflare.com`

Do not attach the apex while the zone is pending; the previous delegation points at an
old Cloudflare nameserver pair and currently produces DNS/TLS failures.
