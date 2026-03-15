---
phase: 4
slug: meal-planning-and-shopping
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | MEAL-01 | unit | `npx vitest run src/features/meals/ui/MealPlanForm.test.tsx -t "submits"` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | MEAL-02 | unit | `npx vitest run src/features/meals/ui/WeeklyCalendar.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | MEAL-03 | unit | `npx vitest run src/features/meals/ui/RecipePickerModal.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | MEAL-04 | unit | `npx vitest run src/features/meals/ui/CalendarCell.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 1 | MEAL-05 | unit | `npx vitest run src/features/meals/ui/AutoFillModal.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-06 | 01 | 1 | MEAL-06 | unit | `npx vitest run src/features/meals/ui/MealPlanForm.test.tsx -t "edit"` | ❌ W0 | ⬜ pending |
| 04-01-07 | 01 | 1 | MEAL-07 | unit | `npx vitest run src/features/meals/ui/MealPlanForm.test.tsx -t "delete"` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | SHOP-01 | unit | `npx vitest run src/features/meals/ui/ShoppingListPage.test.tsx` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | SHOP-02 | unit | `npx vitest run src/features/meals/ui/ShoppingCategory.test.tsx` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | SHOP-03 | unit | `npx vitest run src/features/meals/ui/ShoppingItem.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/features/meals/ui/MealPlanForm.test.tsx` — stubs for MEAL-01, MEAL-06, MEAL-07
- [ ] `src/features/meals/ui/WeeklyCalendar.test.tsx` — stubs for MEAL-02
- [ ] `src/features/meals/ui/CalendarCell.test.tsx` — stubs for MEAL-03, MEAL-04
- [ ] `src/features/meals/ui/RecipePickerModal.test.tsx` — stubs for MEAL-03
- [ ] `src/features/meals/ui/AutoFillModal.test.tsx` — stubs for MEAL-05
- [ ] `src/features/meals/ui/ShoppingListPage.test.tsx` — stubs for SHOP-01
- [ ] `src/features/meals/ui/ShoppingCategory.test.tsx` — stubs for SHOP-02
- [ ] `src/features/meals/ui/ShoppingItem.test.tsx` — stubs for SHOP-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag recipe from panel to calendar cell | MEAL-03 | Requires pointer events + visual drop zone feedback | Drag recipe card onto empty slot, verify recipe appears |
| Mobile vertical scroll through 7 days | MEAL-02 | Requires viewport resize + touch scroll | Resize to mobile, verify all 7 days stack vertically and scroll |
| Auto-generate skeleton shimmer in cells | MEAL-05 | Visual animation timing | Click Auto-fill, verify shimmer appears in target slots |
| Shopping list check-off persistence | SHOP-03 | Requires page reload verification | Check item, reload page, verify item still checked |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
