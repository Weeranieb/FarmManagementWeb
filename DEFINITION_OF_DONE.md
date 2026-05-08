# Definition of Done — Farm OS Web

Before marking any Linear issue as **Done**, all applicable items must be checked.

This is the discipline a BA / SA / QA would normally enforce. As a solo dev, this is your guardrail against shipping half-done work.

---

## Code

- [ ] Branch follows naming: `niebfeelgood/far-<n>-<slug>` (Linear auto-generates this)
- [ ] PR title contains `FAR-<n>` (so Linear auto-links and updates status)
- [ ] PR description has 2-line summary + link to Linear issue
- [ ] No `console.log` / commented-out debug code
- [ ] No new ESLint warnings introduced
- [ ] TypeScript types are correct (no `any` unless justified in comment)

## Functional testing

- [ ] Tested in real browser (Chrome at minimum; ideally Safari + mobile Chrome too)
- [ ] All acceptance criteria from the Linear issue are verified
- [ ] Empty state, error state, loading state — all handled and tested
- [ ] Form validation: invalid input shows clear error message
- [ ] Tested with both owner role and staff role (if applicable)

## Cross-platform compatibility

- [ ] If API contract changed → backend updated and deployed to dev
- [ ] If UX/data model changed → mobile aware and on track to match (link Linear issue or add comment)
- [ ] Responsive: layout reasonable on 1280px desktop and 375px mobile width

## Data & state

- [ ] No hardcoded URLs (use env config)
- [ ] No PII or secrets in client bundle
- [ ] Token handling: stored, refreshed, cleared on logout

## Docs

- [ ] `CHANGELOG.md` updated under `[Unreleased]` with `(FAR-<n>)` tag
- [ ] README updated if env var / setup / new dependency added
- [ ] All acceptance criteria checkboxes ticked in the Linear issue description

---

## Definition of Released

Once a release ships:

- [ ] Issue moved to milestone "6. Released"
- [ ] Version bump committed
- [ ] CHANGELOG `[Unreleased]` rolled into a new version section with date
- [ ] Linear issue status set to **Done**

---

## Skipping items

If a check doesn't apply, write `N/A` next to it in the PR description with a one-line reason. Don't silently skip.
