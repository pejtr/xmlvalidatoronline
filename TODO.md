# TODO

## Public repository safety
- [x] NO-TRUST documentation policy added
- [x] Agent handoff rules added
- [ ] Keep README/TODO/docs synchronized with public contract changes
- [ ] Run secret scanning before releases where CI supports it
- [ ] Audit full git history before any major visibility/security milestone
- [ ] Never claim deployment without direct runtime verification

## Heureka XML feed lint — experimental branch
- [x] Add client-only deterministic basic XML feed lint implementation.
- [x] Add opt-in UI and example product XML (no external data).
- [ ] VERIFY: CI lint/build and generated Cloudflare worker checks pass for the PR.
- [ ] VERIFY: browser manual cases — valid demo, malformed XML, missing required field, invalid/negative price, duplicate ITEM_ID/URL, very large input, mobile layout.
- [ ] Security review: no upload/network fetch, misleading certification claims, HTML/XML edge cases.
- [ ] Visual review and explicit approval before merging or deploying.
- [ ] After QA, consider explicit opt-in lead contact on a separate approved business page, never implicitly transmit XML contents.
