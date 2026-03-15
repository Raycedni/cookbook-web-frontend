# Roadmap: Cookbook Web Frontend

## Overview

Deliver a glassmorphism-styled SPA that connects to an existing Spring Boot recipe API. The build order follows a strict read-before-write, foundation-before-features progression: infrastructure and auth first (the riskiest plumbing), then the primary read-only browsing loop, then recipe mutations, then meal planning workflows, and finally the admin panel (smallest audience, same CRUD patterns already established).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Authentication** - SPA shell, glassmorphism design system, Keycloak auth, Docker, responsive layout
- [ ] **Phase 2: Recipe Browsing, Ratings, and Profiles** - Recipe card grid, search, filters, detail view with scaling, ratings, favorites, user profile, ingredient browsing
- [ ] **Phase 3: Recipe Management** - Recipe create/edit/delete forms, image upload, tagging, sharing via token links
- [ ] **Phase 4: Meal Planning and Shopping** - Meal plan calendar, auto-generation, shopping list with aggregation and checkboxes
- [ ] **Phase 5: Administration** - Admin dashboard, user/IP/config/rating-criteria/ingredient/tag/unit management

## Phase Details

### Phase 1: Foundation and Authentication
**Goal**: Users can access a working SPA with Keycloak login, glassmorphism styling, and skeleton loading -- served from Docker alongside the backend
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can navigate between routes without full page reloads, seeing smooth transition animations
  2. All pages render with glassmorphism panels on a black background with royal purple accents, and layout adapts from mobile to desktop
  3. User can log in via Keycloak redirect, remain logged in after page refresh, and log out from any page
  4. Unauthenticated users are redirected to login when accessing protected routes; admin nav items appear only for admin-role users
  5. Skeleton placeholders appear while API data loads; the app runs in Docker via docker-compose alongside the backend
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Project scaffold, design system, glass UI components, skeleton loading, test infrastructure
- [ ] 01-02-PLAN.md -- Keycloak PKCE auth, responsive app shell layout, routes, API client
- [ ] 01-03-PLAN.md -- Docker deployment (Dockerfile, nginx, entrypoint, docker-compose) and visual verification

### Phase 2: Recipe Browsing, Ratings, and Profiles
**Goal**: Users can discover, browse, search, and read recipes with full detail views, rate recipes, manage favorites, set preferences, and browse ingredients
**Depends on**: Phase 1
**Requirements**: BROWSE-01, BROWSE-02, BROWSE-03, BROWSE-04, BROWSE-05, BROWSE-06, BROWSE-07, BROWSE-08, RATE-01, RATE-02, RATE-03, RATE-04, USER-01, USER-02, USER-03, USER-04, INGR-01, INGR-02
**Success Criteria** (what must be TRUE):
  1. User can view a paginated grid of recipe cards (with images, title, cook time, rating) and load more results
  2. User can search by keyword with dynamic results and filter by hierarchical tags
  3. User can open a recipe detail page showing hero image, ingredients (with serving-count scaling), steps, metadata, and multi-criteria rating breakdown
  4. User can submit/edit/delete their own rating, toggle favorites on cards and detail page, and view their favorites list
  5. User can view/edit their profile, set allergen preferences, manage favorite ingredients, hide/unhide tags, and browse ingredients with allergen info
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md -- Types, API layer, query factories, shared UI utilities (useDebounce, StarRating, EmptyState)
- [ ] 02-02-PLAN.md -- Recipe browse page with card grid, search, tag tree sidebar, pagination, nav updates
- [ ] 02-03-PLAN.md -- Recipe detail page with serving scaling, rating system, favorites list
- [ ] 02-04-PLAN.md -- User profile with preferences, ingredient browsing page

### Phase 3: Recipe Management
**Goal**: Users can create, edit, and delete their own recipes with images, tags, and shareable links
**Depends on**: Phase 2
**Requirements**: RECIPE-01, RECIPE-02, RECIPE-03, RECIPE-04, RECIPE-05, RECIPE-06, RECIPE-07, RECIPE-08, RECIPE-09
**Success Criteria** (what must be TRUE):
  1. User can create a recipe with title, description, servings, times, ordered ingredients (with amount/unit/ingredient selection), and ordered steps
  2. User can upload images via drag-and-drop with preview, assign tags, and edit or delete their own recipes (with delete confirmation)
  3. User can generate a share link for a recipe; an unauthenticated visitor can view the recipe via that link
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md -- Types, API functions, query factories, dnd-kit install, ImageDropZone component
- [ ] 03-02-PLAN.md -- Recipe creation wizard (2-step form with drag-and-drop ingredients/steps, image upload, tags)
- [ ] 03-03-PLAN.md -- Edit/delete on detail page, share modal, public shared recipe route

### Phase 4: Meal Planning and Shopping
**Goal**: Users can plan meals across a week using a CSS grid calendar, auto-generate plans with preferences, and produce aggregated shopping lists with cost estimation
**Depends on**: Phase 3
**Requirements**: MEAL-01, MEAL-02, MEAL-03, MEAL-04, MEAL-05, MEAL-06, MEAL-07, SHOP-01, SHOP-02, SHOP-03
**Success Criteria** (what must be TRUE):
  1. User can create, edit, and delete meal plans with name, date range, and participant count
  2. User can view plans in a weekly/calendar layout, add recipes to meal slots, and remove meals from a plan
  3. User can auto-generate a meal plan with preference parameters and review the result
  4. User can generate a shopping list from a meal plan that aggregates ingredients by category, and check off items
**Plans**: 5 plans

Plans:
- [ ] 04-01-PLAN.md -- Types, API functions, query factory, route scaffolds, nav updates
- [ ] 04-02-PLAN.md -- Meal plan list page, create/edit form, delete functionality
- [ ] 04-03-PLAN.md -- Weekly calendar grid, recipe picker modal, meal slot management
- [ ] 04-04-PLAN.md -- Drag-and-drop recipe assignment, auto-generate with preferences
- [ ] 04-05-PLAN.md -- Shopping list page with category grouping, cost estimation, check-off

### Phase 5: Administration
**Goal**: Admin users can manage all system-level configuration and content through a dedicated panel
**Depends on**: Phase 1 (auth/role gating), Phase 3 (CRUD patterns)
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07, ADMIN-08
**Success Criteria** (what must be TRUE):
  1. Admin can view a system statistics dashboard
  2. Admin can manage users (list, search, update roles, delete) and manage blocked IPs (list, add, remove)
  3. Admin can manage system config key-value pairs, rating criteria (CRUD + activate/deactivate), ingredients, tags (with move/merge), and measurement units
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Authentication | 3/3 | Complete |  |
| 2. Recipe Browsing, Ratings, and Profiles | 4/4 | Complete |  |
| 3. Recipe Management | 3/3 | Complete | 2026-03-15 |
| 4. Meal Planning and Shopping | 1/5 | In Progress|  |
| 5. Administration | 0/2 | Not started | - |
