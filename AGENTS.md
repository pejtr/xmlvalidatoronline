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
