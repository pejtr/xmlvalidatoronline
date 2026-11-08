# AGENTS.md — XML Validator Online Rules

## Core Directives for Autonomous Agents

1. **Design System & Visual Language:**
   - Adhere strictly to the **Emerald SaaS** light visual theme (`#059669`, `#ecfdf5`, `#ffffff`, `#f8fafc`).
   - Do NOT revert to retro dark terminals or sci-fi themes.
   - Maintain the desktop side-by-side split (Editor on left, Live Diagnostics on right).
   - Ensure WCAG 2.1 AA/AAA compliance on all typography and contrast ratios.

2. **Functional Integrity:**
   - Always preserve core utilities: DOMParser XML validation, Format (pretty print), Minify, and Heureka feed linting.
   - All processing MUST remain 100% browser-native (zero data transmission of user XML to any backend).
   - Never inject synthetic or mock AI scores.

3. **Infrastructure & Deployment:**
   - Hosting is exclusively **Cloudflare Pages / Workers**.
   - No automatic merges or unverified production deployments.
   - Always run `tsc -b && vite build` before submitting changes.

## Global OMNIverse hosting policy (2026-10-29)
**BEZ RAILWAY — ONLY CLOUDFLARE.** All new app hosting, preview, prod, APIs, storage, queues and schedulers use Cloudflare Workers/Pages/R2/D1/etc.; never deploy to Railway or use it as fallback. For GPU rendering use owned local compute via authenticated Cloudflare Tunnel/Access or explicitly approved external model APIs. Historic Railway services are migration debt: do not shut down before tested Cloudflare replacement, backup, DNS and rollback. GitHub Actions are optional, local build/E2E/production SHA verification is required. Canonical cross-project policy: https://github.com/pejtr/OPTIMATEO/blob/main/docs/INFRASTRUCTURE_CLOUDFLARE_ONLY.md . Apply to all agents and future changes; do not claim migration without proof.
