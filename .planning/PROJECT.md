# Cookbook Web Frontend

## What This Is

A modern single-page application frontend for the Cookbook recipe and meal planning platform. It connects to an existing Spring Boot/Kotlin backend API providing recipe management, meal planning, ingredient tracking, ratings, and user profiles. The frontend features a glassmorphism design language with black and royal purple accents, skeleton loading states for seamless navigation, and runs in Docker alongside the backend services.

## Core Value

Users can browse, create, and manage recipes with a fluid, visually striking experience — no page reloads, instant feedback, and a premium glass-based aesthetic that makes cooking feel modern.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Full SPA with client-side routing (no page reloads)
- [ ] Glassmorphism UI with frosted glass panels, transparency effects
- [ ] Black background with royal purple (#7851A9) accent color scheme
- [ ] Skeleton loading states on all dynamic content
- [ ] Keycloak OAuth2/OIDC authentication integration
- [ ] Recipe browsing — list, search, filter by tags
- [ ] Recipe detail view with ingredient scaling
- [ ] Recipe creation and editing forms
- [ ] Meal plan management — create, view, edit plans
- [ ] Meal plan auto-generation
- [ ] Shopping list generation from meal plans
- [ ] Ingredient browsing with allergen info
- [ ] User profile and preferences management
- [ ] Favorite recipes and ingredients
- [ ] Recipe rating system with multi-criteria scores
- [ ] Recipe sharing via token links
- [ ] Image upload for recipes
- [ ] Tag-based navigation with hierarchical tree
- [ ] Admin panel — user management, system config, IP blocking, rating criteria
- [ ] Responsive design (desktop + mobile)
- [ ] Docker containerization (nginx serving static assets, integrated with backend docker-compose)

### Out of Scope

- Server-side rendering — SPA only, backend handles API
- Native mobile app — responsive web only
- Real-time websockets — standard REST polling sufficient
- Offline mode / PWA — online-only for v1
- Internationalization (i18n) — English only for v1

## Context

**Backend API:** Spring Boot 4 + Kotlin at `http://localhost:8080/api/v1/`. 10 API modules: recipes, ingredients, meal plans, allergens, ratings, tags, units, media, users, admin. Swagger docs at `/swagger-ui.html`.

**Authentication:** Keycloak 26.0 OAuth2/OIDC. Frontend must redirect to Keycloak for login, handle JWT tokens, and pass Bearer tokens to API. Keycloak runs at port 8180.

**Existing Docker setup:** Backend has docker-compose with `app` (8080), `mariadb` (3306), and `keycloak` (8180) services on `cookbook-network`. Frontend container needs to join this network.

**API patterns:** Paginated responses (Spring Data format: page, size, sort params), JSON request/response, multipart for file uploads, standard HTTP status codes.

**Design direction:** Glassmorphism — frosted glass panels with backdrop-filter blur, semi-transparent backgrounds, subtle borders. Black (#000000) base with royal purple (#7851A9) accents. Modern, premium feel.

## Constraints

- **Tech stack**: Must use a modern JS framework with built-in routing and state management — no jQuery or vanilla JS
- **API compatibility**: Must consume existing backend REST API as-is (no backend changes)
- **Auth**: Must integrate with existing Keycloak instance (OAuth2 PKCE flow)
- **Docker**: Must be containerizable and work with existing docker-compose setup
- **Performance**: Skeleton loaders on all API-fetched content, lazy loading for images and routes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SPA architecture | User requested no page reloads, dynamic JS calls | — Pending |
| Glassmorphism design | User specified glass-based frontend with transparencies | — Pending |
| Docker deployment | User requires Docker-runnable setup | — Pending |
| Keycloak PKCE auth flow | Backend uses Keycloak OAuth2 resource server | — Pending |

---
*Last updated: 2026-03-14 after initialization*
