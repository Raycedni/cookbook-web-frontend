---
phase: 5
slug: administration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ADMIN-01 thru ADMIN-08 | unit | `npx vitest run src/features/admin` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | ADMIN-01 | unit | `npx vitest run src/features/admin/ui/AdminDashboard.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | ADMIN-02 | unit | `npx vitest run src/features/admin/ui/UserManagement.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 1 | ADMIN-03 | unit | `npx vitest run src/features/admin/ui/BlockedIpSection.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-04 | 02 | 1 | ADMIN-04 | unit | `npx vitest run src/features/admin/ui/ConfigSection.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-05 | 02 | 1 | ADMIN-05 | unit | `npx vitest run src/features/admin/ui/CriteriaSection.test.tsx` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | ADMIN-06 | unit | `npx vitest run src/features/admin/ui/IngredientSection.test.tsx` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | ADMIN-07 | unit | `npx vitest run src/features/admin/ui/AdminTagTree.test.tsx` | ❌ W0 | ⬜ pending |
| 05-03-03 | 03 | 2 | ADMIN-08 | unit | `npx vitest run src/features/admin/ui/UnitSection.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/features/admin/ui/AdminDashboard.test.tsx` — stubs for ADMIN-01
- [ ] `src/features/admin/ui/AdminTable.test.tsx` — reusable table component tests
- [ ] `src/features/admin/ui/UserManagement.test.tsx` — stubs for ADMIN-02
- [ ] `src/features/admin/ui/BlockedIpSection.test.tsx` — stubs for ADMIN-03
- [ ] `src/features/admin/ui/ConfigSection.test.tsx` — stubs for ADMIN-04
- [ ] `src/features/admin/ui/CriteriaSection.test.tsx` — stubs for ADMIN-05
- [ ] `src/features/admin/ui/IngredientSection.test.tsx` — stubs for ADMIN-06
- [ ] `src/features/admin/ui/AdminTagTree.test.tsx` — stubs for ADMIN-07
- [ ] `src/features/admin/ui/UnitSection.test.tsx` — stubs for ADMIN-08

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin sidebar navigation works on mobile | ADMIN-01 | CSS responsive behavior | Open on mobile viewport, verify hamburger menu opens/closes |
| Tag drag-and-drop visual feedback | ADMIN-07 | Visual dnd behavior | Drag a tag node, verify it shows overlay and drops into new parent |
| Role gating redirect for non-admins | AUTH-05 | Route guard behavior | Log in as non-admin, navigate to /admin, verify redirect to home |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
