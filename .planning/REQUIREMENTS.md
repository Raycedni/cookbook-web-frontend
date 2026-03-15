# Requirements: Cookbook Web Frontend

**Defined:** 2026-03-14
**Core Value:** Users can browse, create, and manage recipes with a fluid, visually striking experience — no page reloads, instant feedback, and a premium glass-based aesthetic.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: App runs as SPA with client-side routing — no full page reloads
- [x] **FOUND-02**: Glassmorphism design system with frosted glass panels, backdrop blur, semi-transparent backgrounds
- [x] **FOUND-03**: Black (#000000) background with royal purple (#7851A9) accent color scheme throughout
- [x] **FOUND-04**: Skeleton loading states displayed on all API-fetched content before data arrives
- [x] **FOUND-05**: Responsive design — mobile-first layout with desktop adaptation
- [x] **FOUND-06**: Docker container serving static assets via nginx, integrated with backend docker-compose
- [x] **FOUND-07**: Smooth page transitions between routes (fade/slide animations)

### Authentication

- [x] **AUTH-01**: User can log in via Keycloak OAuth2 PKCE redirect flow
- [x] **AUTH-02**: User session persists across page refresh via silent token renewal
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: Protected routes redirect unauthenticated users to login
- [x] **AUTH-05**: User role (USER/ADMIN) is reflected in UI (admin nav items visible only to admins)

### Recipe Browsing

- [x] **BROWSE-01**: User can view recipes in a card grid with hero images, title, cook time, and rating
- [x] **BROWSE-02**: User can search recipes by keyword with results updating dynamically
- [x] **BROWSE-03**: User can filter recipes by tags via hierarchical tag navigation
- [x] **BROWSE-04**: User can view paginated recipe lists with load-more or pagination controls
- [x] **BROWSE-05**: User can view a recipe detail page with hero image, ingredients, steps, metadata, and ratings
- [x] **BROWSE-06**: User can adjust serving count and see ingredient amounts recalculated in real-time
- [x] **BROWSE-07**: User can add/remove recipes from favorites via heart icon on cards and detail page
- [x] **BROWSE-08**: User can view their favorites list

### Recipe Management

- [x] **RECIPE-01**: User can create a new recipe with title, description, servings, prep/cook times, ingredients, and steps
- [x] **RECIPE-02**: User can add/remove/reorder ingredients in recipe form with amount, unit, and ingredient selection
- [x] **RECIPE-03**: User can add/remove/reorder cooking steps in recipe form
- [x] **RECIPE-04**: User can upload images for a recipe with drag-and-drop and preview
- [x] **RECIPE-05**: User can edit their own recipes
- [x] **RECIPE-06**: User can delete their own recipes with confirmation
- [x] **RECIPE-07**: User can assign tags to recipes from available tag list
- [x] **RECIPE-08**: User can share a recipe via generated link (share token)
- [x] **RECIPE-09**: Unauthenticated user can view a shared recipe via share link

### Meal Planning

- [ ] **MEAL-01**: User can create a meal plan with name, date range, and participants count
- [ ] **MEAL-02**: User can view meal plans in a calendar/weekly layout with day and meal slots
- [ ] **MEAL-03**: User can add recipes to meal plan slots
- [ ] **MEAL-04**: User can remove meals from a plan
- [ ] **MEAL-05**: User can auto-generate a meal plan with preference parameters
- [ ] **MEAL-06**: User can edit an existing meal plan
- [ ] **MEAL-07**: User can delete a meal plan with confirmation

### Shopping

- [ ] **SHOP-01**: User can generate a shopping list from a meal plan
- [ ] **SHOP-02**: Shopping list aggregates ingredients across recipes and groups by category
- [ ] **SHOP-03**: User can check off items on the shopping list

### Ratings

- [x] **RATE-01**: User can view rating summary (average scores) on recipe cards and detail page
- [x] **RATE-02**: User can view detailed multi-criteria rating breakdown on recipe detail page
- [x] **RATE-03**: User can submit a rating with scores for each active criterion
- [x] **RATE-04**: User can edit or delete their own rating

### User Profile

- [x] **USER-01**: User can view and edit their profile (display name)
- [x] **USER-02**: User can set dietary/allergen preferences
- [x] **USER-03**: User can manage favorite ingredients
- [x] **USER-04**: User can hide/unhide tags from their browsing experience

### Ingredients

- [x] **INGR-01**: User can browse ingredients with search
- [x] **INGR-02**: User can view ingredient details including nutritional info and allergens

### Admin

- [ ] **ADMIN-01**: Admin can view system statistics dashboard
- [ ] **ADMIN-02**: Admin can manage users (list, search, update roles, delete)
- [ ] **ADMIN-03**: Admin can manage blocked IPs (list, add, remove)
- [ ] **ADMIN-04**: Admin can manage system configuration key-value pairs
- [ ] **ADMIN-05**: Admin can manage rating criteria (create, update, delete, activate/deactivate)
- [ ] **ADMIN-06**: Admin can manage ingredients (create, update, delete)
- [ ] **ADMIN-07**: Admin can manage tags (create, update, delete, move, merge)
- [ ] **ADMIN-08**: Admin can manage measurement units and conversions

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Cooking Experience

- **COOK-01**: Cook mode with step-by-step guided view, large text, screen-wake
- **COOK-02**: Integrated cooking timers per step with browser notifications
- **COOK-03**: Ingredient checkboxes for prep tracking during cooking

### Personalization

- **PERS-01**: Allergen warning badges displayed on recipe cards and detail pages
- **PERS-02**: Nutritional summary (calories, macros) per recipe aggregated from ingredients
- **PERS-03**: Related recipe suggestions on detail page based on shared tags/ingredients

### Polish

- **POLISH-01**: Print-friendly recipe view with clean layout (no glass effects)
- **POLISH-02**: "What can I cook?" filter based on available ingredients

## Out of Scope

| Feature | Reason |
|---------|--------|
| Server-side rendering | SPA only — backend handles API, frontend is static |
| Native mobile app | Responsive web covers mobile use cases for v1 |
| Real-time websockets | Standard REST polling sufficient for recipe app |
| Offline / PWA mode | Online-only for v1; adds significant complexity |
| Internationalization (i18n) | English only for v1; code structured to be i18n-friendly |
| Social feed / activity stream | Cooking tool, not social network |
| Recipe web scraping / URL import | Backend is source of truth; good creation form instead |
| AI-generated recipes | Unreliable, potential allergen safety risk |
| Gamification (badges, streaks) | Cooking is not a game; patronizing for target audience |
| Video hosting for recipe steps | Storage/bandwidth cost; support images per step instead |
| Infinite scroll | Breaks back-button, accessibility issues; use pagination |
| Real-time collaborative editing | WebSocket complexity for marginal benefit |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| FOUND-07 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| BROWSE-01 | Phase 2 | Complete |
| BROWSE-02 | Phase 2 | Complete |
| BROWSE-03 | Phase 2 | Complete |
| BROWSE-04 | Phase 2 | Complete |
| BROWSE-05 | Phase 2 | Complete |
| BROWSE-06 | Phase 2 | Complete |
| BROWSE-07 | Phase 2 | Complete |
| BROWSE-08 | Phase 2 | Complete |
| RATE-01 | Phase 2 | Complete |
| RATE-02 | Phase 2 | Complete |
| RATE-03 | Phase 2 | Complete |
| RATE-04 | Phase 2 | Complete |
| USER-01 | Phase 2 | Complete |
| USER-02 | Phase 2 | Complete |
| USER-03 | Phase 2 | Complete |
| USER-04 | Phase 2 | Complete |
| INGR-01 | Phase 2 | Complete |
| INGR-02 | Phase 2 | Complete |
| RECIPE-01 | Phase 3 | Complete |
| RECIPE-02 | Phase 3 | Complete |
| RECIPE-03 | Phase 3 | Complete |
| RECIPE-04 | Phase 3 | Complete |
| RECIPE-05 | Phase 3 | Complete |
| RECIPE-06 | Phase 3 | Complete |
| RECIPE-07 | Phase 3 | Complete |
| RECIPE-08 | Phase 3 | Complete |
| RECIPE-09 | Phase 3 | Complete |
| MEAL-01 | Phase 4 | Pending |
| MEAL-02 | Phase 4 | Pending |
| MEAL-03 | Phase 4 | Pending |
| MEAL-04 | Phase 4 | Pending |
| MEAL-05 | Phase 4 | Pending |
| MEAL-06 | Phase 4 | Pending |
| MEAL-07 | Phase 4 | Pending |
| SHOP-01 | Phase 4 | Pending |
| SHOP-02 | Phase 4 | Pending |
| SHOP-03 | Phase 4 | Pending |
| ADMIN-01 | Phase 5 | Pending |
| ADMIN-02 | Phase 5 | Pending |
| ADMIN-03 | Phase 5 | Pending |
| ADMIN-04 | Phase 5 | Pending |
| ADMIN-05 | Phase 5 | Pending |
| ADMIN-06 | Phase 5 | Pending |
| ADMIN-07 | Phase 5 | Pending |
| ADMIN-08 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation*
