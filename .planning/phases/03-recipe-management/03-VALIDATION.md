---
phase: 3
slug: recipe-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 with jsdom |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | RECIPE-01 | unit | `npx vitest run src/features/recipes/ui/RecipeWizard.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | RECIPE-02 | unit | `npx vitest run src/features/recipes/ui/IngredientRowList.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | RECIPE-03 | unit | `npx vitest run src/features/recipes/ui/CookingStepList.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | RECIPE-04 | unit | `npx vitest run src/features/recipes/ui/ImageDropZone.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | RECIPE-05 | unit | `npx vitest run src/features/recipes/ui/RecipeWizard.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-06 | 01 | 1 | RECIPE-06 | unit | `npx vitest run src/routes/_authenticated/recipes/RecipeDetail.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-07 | 01 | 1 | RECIPE-07 | unit | Covered by existing TagTree.test.tsx + wizard test | ✅ Partial | ⬜ pending |
| 03-01-08 | 01 | 1 | RECIPE-08 | unit | `npx vitest run src/features/recipes/ui/ShareModal.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-09 | 01 | 1 | RECIPE-09 | unit | `npx vitest run src/routes/recipes/share/SharedRecipe.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/features/recipes/ui/RecipeWizard.test.tsx` — stubs for RECIPE-01, RECIPE-05
- [ ] `src/features/recipes/ui/IngredientRowList.test.tsx` — stubs for RECIPE-02
- [ ] `src/features/recipes/ui/CookingStepList.test.tsx` — stubs for RECIPE-03
- [ ] `src/features/recipes/ui/ImageDropZone.test.tsx` — stubs for RECIPE-04
- [ ] `src/features/recipes/ui/ShareModal.test.tsx` — stubs for RECIPE-08
- [ ] `src/routes/recipes/share/SharedRecipe.test.tsx` — stubs for RECIPE-09

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop reorder visual feedback | RECIPE-02, RECIPE-03 | Requires pointer events + visual inspection | Drag ingredient/step, verify visual indicator appears and list reorders |
| Image file dialog and preview rendering | RECIPE-04 | File input + canvas/img rendering | Drop image on zone, verify preview appears |
| Share link copy to clipboard | RECIPE-08 | Clipboard API requires user gesture | Click copy button, paste to verify URL |
| Shared recipe page for unauthenticated visitor | RECIPE-09 | Requires logout + navigation | Open share link in incognito, verify recipe renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
