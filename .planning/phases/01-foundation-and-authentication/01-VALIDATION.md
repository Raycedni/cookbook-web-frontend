---
phase: 1
slug: foundation-and-authentication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | vitest.config.ts (Wave 0) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUND-01 | integration | `npx vitest run src/routes/ -x` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUND-02 | unit | `npx vitest run src/shared/ui/GlassPanel.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FOUND-03 | unit | `npx vitest run src/shared/ui/tokens.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | FOUND-04 | unit | `npx vitest run src/shared/ui/useDelayedLoading.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | FOUND-05 | manual-only | Visual inspection at 375/768/1024px | N/A | ⬜ pending |
| 01-01-06 | 01 | 1 | FOUND-07 | unit | `npx vitest run src/shared/ui/RouteTransition.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | AUTH-01 | unit | `npx vitest run src/shared/auth/AuthGuard.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | AUTH-02 | unit | `npx vitest run src/shared/auth/oidc-config.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | AUTH-03 | unit | `npx vitest run src/shared/ui/NavBar.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 1 | AUTH-04 | unit | `npx vitest run src/routes/_authenticated.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-02-05 | 02 | 1 | AUTH-05 | unit | `npx vitest run src/shared/auth/useAuthRoles.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | FOUND-06 | integration | `docker compose up -d && curl -s http://localhost:3000` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration with jsdom environment
- [ ] `src/test/setup.ts` — Testing Library setup (jest-dom matchers)
- [ ] `src/test/mocks/auth.ts` — Mock react-oidc-context AuthProvider
- [ ] All test files listed above — none exist yet (greenfield project)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive layout adapts at breakpoints | FOUND-05 | Visual layout adaptation cannot be reliably tested with jsdom | Inspect at 375px (mobile), 768px (tablet), 1024px (desktop) widths |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
