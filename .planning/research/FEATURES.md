# Feature Landscape

**Domain:** Recipe/Cookbook Web Application (SPA Frontend)
**Researched:** 2026-03-14
**Confidence:** HIGH -- cross-referenced against Tandoor, Mealie, KitchenOwl, Paprika, SideChef platform research, and multiple UX case studies.

## Table Stakes

Features users expect from any modern recipe/cookbook web application. Missing any of these makes the product feel incomplete or broken.

### Recipe Browsing & Discovery

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Recipe card grid with hero images | Visual food content is the #1 draw; users scan by image first | Medium | Cards need: image, title, cook time, rating, difficulty. Avoid overloading -- prioritize 4-5 metadata fields max |
| Full-text search with filters | Users arrive with intent ("chicken dinner", "30 min meals"); broken search = immediate bounce | Medium | Must support: keyword, tag, ingredient, cook time range. Predictive/autocomplete adds polish |
| Tag/category navigation | Hierarchical browsing is how non-search users discover content | Low | Backend already supports hierarchical tags -- expose as sidebar tree or breadcrumb navigation |
| Recipe detail page | The core content page; must be scannable and actionable | Medium | Hero image, ingredients list, step-by-step instructions, metadata bar (time, servings, difficulty), ratings |
| Ingredient scaling (serving adjuster) | 86% of recipe apps include this; users expect +/- buttons that recalculate amounts in real-time | Low | Simple multiplication on frontend; backend provides base amounts. Use +/- stepper, not a text input |
| Responsive design (mobile-first) | 80-90% of food content is consumed on mobile devices | Medium | Thumb-friendly tap targets, collapsible sections, fixed bottom nav on mobile. Not optional |
| Skeleton loading states | Users expect instant visual feedback; blank screens feel broken | Low | Already a project requirement. Apply to all API-fetched content: cards, detail pages, lists |
| Favorites/bookmarks | Personal recipe collections are baseline expectation in every recipe manager | Low | Heart icon on cards + detail page, personal favorites list view |

### Recipe Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Recipe create/edit form | Core CRUD; users who contribute content expect a structured editor | High | Ingredient list builder (add/remove/reorder), step editor, image upload, tag selector, metadata fields |
| Image upload for recipes | Food is visual; recipes without images feel incomplete | Low | Backend supports media uploads; frontend needs drag-and-drop zone + preview |
| Recipe sharing via link | Sharing recipes is a primary social behavior around food | Low | Backend provides token-based sharing; frontend needs copy-link button + shared recipe view for unauthenticated users |

### Meal Planning

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Calendar/weekly view for meal plans | Calendar view is the standard mental model for meal planning (Paprika, Mealie, KitchenOwl all use it) | High | Drag-and-drop onto day slots. Show breakfast/lunch/dinner slots. Week view is primary, month view is optional |
| Auto-generate meal plans | Key backend feature; frontend needs simple trigger UI with preference inputs | Medium | Parameters: date range, dietary preferences, number of meals. Display generated plan for review before saving |
| Shopping list from meal plan | 86% of recipe/meal apps include auto-generated shopping lists; this is the payoff of meal planning | Medium | Aggregate ingredients across recipes, group by category, checkbox for purchased items |

### User Account

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Login/logout via Keycloak | Authentication is foundational; must be seamless redirect flow | Medium | OAuth2 PKCE flow. Handle token refresh silently. Show user state in header |
| User profile and preferences | Users expect to set dietary restrictions, allergies, display preferences | Low | Form-based; backend already supports preferences endpoint |
| Ratings display and submission | Multi-criteria ratings are a backend differentiator; frontend must surface them clearly | Medium | Star/numeric display on cards, detailed criteria breakdown on detail page, submission form |

### Admin

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Admin dashboard | Required for any multi-user app with moderation needs | High | User management, system config, IP blocking, rating criteria management. Role-gated routes |

## Differentiators

Features that set this product apart. Not expected by default, but create competitive advantage and user delight.

### Cooking Experience

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Cook mode (step-by-step) | Guided cooking with large text, dimmed non-active steps, screen-wake. Pestle, Mela, and SideChef all offer this -- it is becoming expected but most web apps still lack it | Medium | Use Wake Lock API to prevent screen sleep. Large font, swipe/button navigation between steps. Integrated per-step timers. This is the single highest-impact differentiator for a cooking app |
| Integrated cooking timers | Set timers from within recipe steps; multiple concurrent timers for complex recipes | Medium | Browser Notification API for alerts. Show active timers in a floating widget. Parse time durations from step text |
| Ingredient checkboxes | Tap to mark ingredients as prepped/gathered while cooking | Low | Simple local state toggle on each ingredient row. High utility, minimal effort |
| "Jump to Recipe" button | Skips preamble and scrolls directly to ingredients/instructions. Users explicitly value this | Low | Anchor link or scroll-to behavior. Trivial to implement, universally appreciated |

### Personalization & Discovery

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Allergen warnings on recipes | Surface allergen info from ingredients prominently on recipe cards/detail. Critical for safety, rare in implementations | Low | Backend provides allergen data per ingredient; frontend aggregates and displays warning badges |
| Nutritional summary per recipe | Aggregate nutrition facts from ingredients. Health-conscious users expect this from meal planners | Medium | Backend provides per-ingredient nutrition; frontend sums and displays macro breakdown |
| "What can I cook?" filter | Filter recipes by ingredients the user already has. KitchenOwl and Mealie both offer ingredient-availability indicators | High | Requires user to maintain a pantry/inventory (or simplified ingredient checklist). High value but high complexity -- consider deferring to v2 |
| Related recipe suggestions | "If you liked this, try..." at bottom of recipe detail page | Medium | Can use shared tags or ingredients for similarity. Increases engagement and content discovery |

### Visual & Polish

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Glassmorphism design system | The project's defining visual identity. Dark base + frosted glass + purple accents creates a premium, modern feel that no major recipe app uses | High | backdrop-filter: blur(), semi-transparent backgrounds, subtle luminous borders. Must ensure text readability over glass panels -- this is the #1 glassmorphism pitfall |
| Smooth page transitions | SPA route transitions with subtle animations (fade, slide) reinforce the premium feel | Low | CSS transitions or framework transition components. Avoid heavy JS animation libraries |
| Dark mode as default | Black background is already the design direction; food photography pops against dark backgrounds | Low | Already decided. Ensure all text meets WCAG AA contrast ratios against dark + translucent surfaces |
| Print-friendly recipe view | Clean print stylesheet that strips navigation, ads, glass effects and outputs a clean recipe card | Low | CSS @media print. Often overlooked but highly valued by users who print recipes for the kitchen |

### Collaboration

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multi-user household support | Share meal plans and shopping lists within a family. KitchenOwl focuses heavily on this | Medium | Backend must support shared access (check API capabilities). Frontend needs shared list state |

## Anti-Features

Features to explicitly NOT build. They add complexity without proportional value, or actively harm the user experience.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Social feed / activity stream | This is a cooking tool, not a social network. Activity feeds add noise and distract from the core task of finding and cooking recipes | Focus on recipe sharing via direct links. Let the content speak for itself |
| Recipe web scraping / URL import | Complex to build and maintain (HTML parsers break constantly). The backend is the source of truth -- recipes should be authored here, not scraped | Provide a good recipe creation form instead. If import is needed later, make it a backend feature |
| AI-generated recipes | Trendy but unreliable. AI recipes can suggest dangerous combinations (allergens) or nonsensical quantities. Liability risk | Let humans create recipes. Use AI only for low-risk assistance like suggesting tags |
| Gamification (badges, streaks, points) | Cooking is not a game. Gamification creates guilt loops ("you broke your streak!") and feels patronizing for the target audience | Let the cooking experience itself be the reward. Favorites and ratings provide sufficient engagement signals |
| Video hosting for recipe steps | Massive storage/bandwidth cost, complex player implementation, and most users prefer scannable text+images to video while cooking | Support image-per-step in cook mode. Link to external video (YouTube) if needed |
| Offline / PWA mode | Explicitly out of scope for v1. Adds service worker complexity, cache invalidation headaches, and sync conflict resolution | Online-only is fine for v1. Revisit only if user feedback demands it |
| Internationalization (i18n) | Out of scope for v1. Adding i18n early creates ongoing translation maintenance burden | English only. Structure code to be i18n-friendly (no hardcoded strings) but do not implement the framework |
| Real-time collaborative editing | WebSocket complexity for marginal benefit. Recipe editing is not Google Docs | Standard optimistic locking (last-write-wins or conflict detection) is sufficient |
| Infinite scroll for recipe lists | Harder to implement accessibly, breaks browser back-button behavior, makes it impossible to reach footer content | Use paginated results with "Load more" or traditional pagination. Backend already returns paginated responses |
| Complex unit conversion system | Converting between metric/imperial at the frontend level introduces rounding errors and edge cases (e.g., "a pinch") | Let the backend handle unit data as-is. If conversion is needed, it belongs in the API layer |

## Feature Dependencies

```
Authentication (Keycloak) --> Everything (all features require auth context)
  |
  +--> User Profile/Preferences
  |     |
  |     +--> Favorites
  |     +--> Allergen Preferences --> Allergen Warnings on Recipes
  |
  +--> Recipe Browsing (cards, search, filters)
  |     |
  |     +--> Recipe Detail View
  |     |     |
  |     |     +--> Ingredient Scaling
  |     |     +--> Cook Mode (step-by-step)
  |     |     |     |
  |     |     |     +--> Cooking Timers
  |     |     |     +--> Ingredient Checkboxes
  |     |     |
  |     |     +--> Rating Submission
  |     |     +--> Recipe Sharing
  |     |     +--> Nutritional Summary
  |     |     +--> Print View
  |     |
  |     +--> Recipe Create/Edit
  |           |
  |           +--> Image Upload
  |           +--> Tag Selection
  |
  +--> Meal Planning
  |     |
  |     +--> Calendar View (requires recipe browsing to select recipes)
  |     +--> Auto-Generate (requires preferences)
  |     +--> Shopping List (requires meal plan with recipes)
  |
  +--> Admin Dashboard (role-gated, independent track)
```

## MVP Recommendation

**Prioritize (Phase 1 -- Core Loop):**
1. Authentication + user profile (foundation for everything)
2. Recipe browsing: card grid, search, tag navigation (the primary user journey)
3. Recipe detail view with ingredient scaling and ratings display (the destination)
4. Favorites (retention hook, trivial to implement)
5. Skeleton loading + glassmorphism design system (the visual identity, established early)

**Prioritize (Phase 2 -- Content Creation + Planning):**
1. Recipe create/edit with image upload (enables user-generated content)
2. Meal plan calendar view + auto-generation (the planning workflow)
3. Shopping list generation (the payoff of meal planning)
4. Rating submission (completes the feedback loop)

**Prioritize (Phase 3 -- Polish + Differentiation):**
1. Cook mode with timers (single biggest differentiator)
2. Allergen warnings + nutritional summary (safety + health features)
3. Print view (low effort, high user value)
4. Admin dashboard (needed for operations but not user-facing value)

**Defer to v2:**
- "What can I cook?" ingredient filter (requires pantry feature)
- Multi-user household sharing (requires backend scope verification)
- Related recipe suggestions (nice-to-have, not essential)

## Sources

- [SideChef: UX Best Practices for Recipe Sites](https://www.sidechef.com/business/recipe-platform/ux-best-practices-for-recipe-sites) -- comprehensive UX guidelines for recipe platforms
- [Cooklang: Recipe Manager Comparison 2026](https://cooklang.org/blog/09-cooklang-vs-paprika-vs-mealie/) -- feature comparison across Mealie, Paprika, KitchenOwl, Cooklang
- [Cooklang: Best Open Source Recipe Managers 2026](https://cooklang.org/blog/18-open-source-recipe-managers-2026/) -- ecosystem overview
- [Tubik Studio: Recipe App UX Design Case Study](https://blog.tubikstudio.com/case-study-recipes-app-ux-design/) -- recipe card design patterns
- [EatHealthy365: Smart Recipe Cook Mode Guide](https://eathealthy365.com/the-ultimate-guide-to-smart-recipe-cook-mode/) -- cook mode feature analysis
- [WPTasty: Hands-Free Cooking Features](https://www.wptasty.com/hands-free-cooking) -- cook mode and screen-wake patterns
- [Bootstrapped Ventures: Cook Mode Implementation](https://bootstrapped.ventures/cook-mode/) -- Wake Lock API for recipe apps
- [XDA: Tandoor vs Mealie Comparison](https://www.xda-developers.com/reasons-tandoor-replaced-mealie-for-managing-my-recipes/) -- real-world self-hosted recipe manager comparison
- [UXPilot: Glassmorphism UI Features and Best Practices](https://uxpilot.ai/blogs/glassmorphism-ui) -- glassmorphism design guidelines
- [Medium: Glassmorphism Trap in Modern UI Design](https://medium.com/design-bootcamp/glassmorphism-the-most-beautiful-trap-in-modern-ui-design-a472818a7c0a) -- glassmorphism pitfalls and readability concerns
