---
phase: 2
slug: recipe-browsing-ratings-and-profiles
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | BROWSE-01 | unit | `npx vitest run src/features/recipes/ui/RecipeGrid.test.tsx` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | BROWSE-02 | unit | `npx vitest run src/features/recipes/ui/SearchBar.test.tsx` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | BROWSE-03 | unit | `npx vitest run src/features/recipes/ui/TagTree.test.tsx` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | BROWSE-04 | unit | `npx vitest run src/features/recipes/ui/RecipeGrid.test.tsx` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | BROWSE-06 | unit | `npx vitest run src/features/recipes/ui/ServingScaler.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | BROWSE-05 | unit | `npx vitest run src/routes/_authenticated/recipes.$recipeId.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | BROWSE-07 | unit | `npx vitest run src/features/favorites/ui/FavoriteButton.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | BROWSE-08 | unit | `npx vitest run src/routes/_authenticated/favorites.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | RATE-01 | unit | `npx vitest run src/features/ratings/ui/RatingStars.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-05 | 02 | 1 | RATE-02 | unit | `npx vitest run src/features/ratings/ui/RatingBreakdown.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-06 | 02 | 1 | RATE-03 | unit | `npx vitest run src/features/ratings/ui/RatingForm.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-07 | 02 | 1 | RATE-04 | unit | `npx vitest run src/features/ratings/ui/RatingForm.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | USER-01 | unit | `npx vitest run src/features/profile/ui/ProfileForm.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | USER-02 | unit | `npx vitest run src/features/profile/ui/AllergenPreferences.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 2 | USER-03 | unit | `npx vitest run src/features/profile/ui/FavoriteIngredients.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-04 | 03 | 2 | USER-04 | unit | `npx vitest run src/features/profile/ui/TagVisibility.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-05 | 03 | 2 | INGR-01 | unit | `npx vitest run src/features/ingredients/ui/IngredientSearch.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03-06 | 03 | 2 | INGR-02 | unit | `npx vitest run src/features/ingredients/ui/IngredientCard.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/features/recipes/ui/RecipeGrid.test.tsx` — stubs for BROWSE-01, BROWSE-04
- [ ] `src/features/recipes/ui/SearchBar.test.tsx` — stubs for BROWSE-02
- [ ] `src/features/recipes/ui/TagTree.test.tsx` — stubs for BROWSE-03
- [ ] `src/features/recipes/ui/ServingScaler.test.tsx` — stubs for BROWSE-06
- [ ] `src/features/favorites/ui/FavoriteButton.test.tsx` — stubs for BROWSE-07
- [ ] `src/features/ratings/ui/RatingStars.test.tsx` — stubs for RATE-01
- [ ] `src/features/ratings/ui/RatingBreakdown.test.tsx` — stubs for RATE-02
- [ ] `src/features/ratings/ui/RatingForm.test.tsx` — stubs for RATE-03, RATE-04
- [ ] `src/features/profile/ui/ProfileForm.test.tsx` — stubs for USER-01
- [ ] `src/features/profile/ui/AllergenPreferences.test.tsx` — stubs for USER-02
- [ ] `src/features/profile/ui/FavoriteIngredients.test.tsx` — stubs for USER-03
- [ ] `src/features/profile/ui/TagVisibility.test.tsx` — stubs for USER-04
- [ ] `src/features/ingredients/ui/IngredientSearch.test.tsx` — stubs for INGR-01
- [ ] `src/features/ingredients/ui/IngredientCard.test.tsx` — stubs for INGR-02
- [ ] `src/shared/hooks/useDebounce.test.ts` — debounce utility
- [ ] Test mocks: TanStack Query (QueryClientProvider wrapper) and TanStack Router (RouterProvider mock)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Glassmorphism card rendering | BROWSE-01 | Visual appearance | Verify glass blur, hover effect on recipe cards |
| Sidebar tag tree expand/collapse animation | BROWSE-03 | CSS animation | Expand parent tags, verify smooth transition |
| Image lazy loading | BROWSE-05 | Network/visual | Scroll recipe grid, verify images load on viewport entry |
| Serving scaler real-time update | BROWSE-06 | Visual feedback | Adjust serving slider, verify amounts update smoothly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
