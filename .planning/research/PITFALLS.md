# Domain Pitfalls

**Domain:** SPA frontend consuming REST API with Keycloak auth, glassmorphism design, Docker/nginx deployment
**Researched:** 2026-03-14

## Critical Pitfalls

Mistakes that cause rewrites, security vulnerabilities, or major user-facing failures.

### Pitfall 1: Nginx Returns 404 on Page Refresh / Direct URL Access

**What goes wrong:** Users navigate to `/recipes/42`, hit refresh, and get a 404 error. Every deep link and bookmark breaks. The SPA only works when navigating from the root `/`.

**Why it happens:** Nginx tries to find a physical file at `/recipes/42` on disk. Client-side routing only works when JavaScript is loaded and the router intercepts navigation. On a full page load, nginx serves first, and it has no idea about your SPA routes.

**Consequences:** Broken bookmarks, broken shared links, broken browser back/forward after refresh. Users think the app is broken. Keycloak redirect URIs after login also fail if they land on a sub-route.

**Prevention:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
This tells nginx: if the file does not exist, serve `index.html` and let the SPA router handle it. But you MUST also implement a catch-all 404 route in your SPA router, because nginx will never return 404 with this config -- every invalid URL will silently serve the app.

**Detection:** Test by navigating to a sub-route and hitting F5 in the browser. If you only test by clicking through the app, you will never catch this.

**Phase:** Must be configured in the very first phase when Docker/nginx is set up. Non-negotiable.

**Confidence:** HIGH -- universally documented, every SPA deployment guide covers this.

---

### Pitfall 2: Keycloak CORS Misconfiguration Blocks Token Operations

**What goes wrong:** Login appears to work, but token refresh silently fails. After the access token expires (typically 5 minutes), all API calls start returning 401. Users get logged out unexpectedly. In dev, you see `CORS preflight request failed` in the console.

**Why it happens:** Three separate CORS configurations must align:
1. **Keycloak client Web Origins** -- must include the frontend origin (e.g., `http://localhost:3000`)
2. **Backend API CORS** -- must allow the frontend origin and `Authorization` header
3. **Nginx proxy** -- must not add duplicate CORS headers (double `Access-Control-Allow-Origin` is treated as an error by browsers)

The most insidious failure mode: the initial login redirect works (it is a full page redirect, not an XHR), so developers think CORS is fine. Then token refresh fails silently because it is a background XHR to Keycloak's token endpoint.

**Consequences:** Users get randomly logged out. Token refresh race conditions cause sporadic 401 errors across the app.

**Prevention:**
- Set Keycloak client Web Origins to `+` (which uses configured redirect URIs as allowed origins) or explicitly list the frontend URL. Never use `*` in production.
- Use nginx as a reverse proxy so frontend, API, and Keycloak appear on the same origin. This eliminates CORS entirely for the API calls.
- Test token refresh explicitly: log in, wait for access token expiry, and verify the app continues working.

**Detection:** Open browser DevTools Network tab, filter by the Keycloak domain, and watch for failed OPTIONS requests. Set access token lifespan to 1 minute in Keycloak during development to trigger refresh quickly.

**Phase:** Auth integration phase. Must be verified end-to-end, not just "login works."

**Confidence:** HIGH -- extensively documented in Keycloak forums and GitHub issues.

**Sources:**
- [Configuring CORS with Keycloak OIDC](https://skycloak.io/blog/configuring-cors-with-your-keycloak-oidc-client/)
- [Keycloak CORS discussion](https://github.com/keycloak/keycloak/discussions/15962)

---

### Pitfall 3: Storing Tokens in localStorage Exposes to XSS

**What goes wrong:** Access tokens and refresh tokens stored in `localStorage` can be read by any JavaScript running on the page. A single XSS vulnerability (including from a compromised third-party library) gives attackers full account takeover.

**Why it happens:** `localStorage` is the easy, obvious place to store tokens. Many tutorials show this pattern. Keycloak-js itself stores tokens in memory by default, but developers often persist them to survive page reloads and introduce the vulnerability.

**Consequences:** Full account takeover via token theft. Unlike session cookies (which can be HttpOnly), localStorage is always readable by JavaScript.

**Prevention:**
- Use an OIDC library that keeps tokens in memory only (oidc-spa, keycloak-js default behavior).
- Accept that page refresh requires re-authentication or a silent token check via iframe/redirect.
- If you must persist tokens, use `sessionStorage` (cleared on tab close) as a slight improvement, but it is still XSS-vulnerable.
- Never store refresh tokens client-side in localStorage. The refresh token is the real prize for attackers.

**Detection:** Search the codebase for `localStorage.setItem` with token-related keys. Review the OIDC library's storage configuration.

**Phase:** Auth integration phase. Must be a design decision made upfront.

**Confidence:** HIGH -- OWASP and OAuth 2.0 security best practices.

---

### Pitfall 4: Build-Time Environment Variables Cannot Change at Runtime in Docker

**What goes wrong:** The API URL, Keycloak URL, and realm are baked into the JavaScript bundle at build time (e.g., via `VITE_API_URL`). The same Docker image cannot be used across environments (dev, staging, production) without rebuilding.

**Why it happens:** SPAs are static files. There is no server-side runtime to read environment variables. `import.meta.env.VITE_*` values are replaced by Vite at build time -- they become string literals in the output JavaScript.

**Consequences:** You build a separate Docker image per environment (dev, staging, prod), which defeats the purpose of containerization ("build once, run anywhere"). Or worse, you hardcode `localhost:8080` and it breaks in production.

**Prevention:**
- Inject configuration at container startup via an entrypoint script that writes a `config.json` or `window.__CONFIG__` script tag before nginx starts serving.
- Example: `envsubst` in the Docker entrypoint replaces placeholders in a template config file.
- The app reads config from `window.__CONFIG__` or fetches `/config.json` at startup, not from build-time env vars.

**Detection:** Check if `docker run -e API_URL=https://prod.example.com` actually changes the app behavior. If it does not, you have this problem.

**Phase:** Docker/deployment phase. Must be designed before the first Docker image is built.

**Confidence:** HIGH -- fundamental limitation of all SPA-in-Docker setups.

**Sources:**
- [Deploying configurable frontend web application containers](https://blog.container-solutions.com/deploying-configurable-frontend-web-application-containers)

---

### Pitfall 5: Backdrop-Filter Performance Destroys Mobile Experience

**What goes wrong:** The glassmorphism design looks stunning on a developer's MacBook but stutters, lags, and drains battery on mid-range Android phones. Scrolling through a recipe list with 10+ frosted glass cards becomes a slideshow.

**Why it happens:** `backdrop-filter: blur()` triggers GPU compositing for each element. Each glass element requires the browser to:
1. Render everything behind the element
2. Apply a Gaussian blur to that region
3. Composite the blurred result with the semi-transparent foreground

This is O(n) per glass element per frame. With 10+ glass elements visible and scrolling, it saturates the GPU on lower-end devices.

**Consequences:** Janky scrolling, dropped frames, high battery drain, potential browser crashes on low-end devices. Users on the most common devices (mid-range Android) have the worst experience.

**Prevention:**
- Limit glass elements to 3-5 per viewport maximum.
- Keep blur values between 8-12px (higher values are exponentially more expensive).
- Never animate `backdrop-filter` properties -- animate `opacity` or `transform` instead.
- Use `will-change: backdrop-filter` sparingly (it forces permanent GPU compositing).
- For recipe list views with many cards, use a solid semi-transparent background instead of blur. Reserve true glassmorphism for modals, headers, and detail views.
- Test on a mid-range Android phone (e.g., Samsung A-series), not just flagship devices.
- Consider `@media (prefers-reduced-motion)` and a reduced-effects fallback.

**Detection:** Use Chrome DevTools Performance panel. Look for long "Paint" and "Composite Layers" times during scrolling. Rendering tab > "Show paint rectangles" to see what repaints on scroll.

**Phase:** Design system / UI foundation phase. Must establish the "where glass, where solid" rules early.

**Confidence:** HIGH -- well-documented GPU compositing behavior.

**Sources:**
- [Glassmorphism Implementation Guide](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)
- [Glassmorphism UI Best Practices](https://uxpilot.ai/blogs/glassmorphism-ui)

---

## Moderate Pitfalls

### Pitfall 6: Skeleton Loaders That Do Not Match Final Layout (Layout Shift)

**What goes wrong:** Skeleton placeholders have different dimensions than the actual content. When data loads, the page jumps and shifts. Users lose their scroll position or misclick because a button moved.

**Why it happens:** Skeletons are built as a separate component disconnected from the real component. When the real component changes (new field added, layout tweaked), the skeleton is not updated.

**Prevention:**
- Build skeletons as a variant of the actual component, not a separate component. Use the same container dimensions.
- Use CSS `min-height` on containers so they do not collapse to zero while loading.
- For recipe cards: the skeleton card must be the exact same height as the loaded card.
- Test by throttling the network in DevTools and watching the transition from skeleton to content.

**Phase:** UI component phase. Establish the skeleton pattern with the first component, not retrofitted later.

**Confidence:** HIGH -- CLS (Cumulative Layout Shift) is a Core Web Vital.

---

### Pitfall 7: Skeleton Loaders on Fast Loads Create Flicker

**What goes wrong:** Content loads in 50ms but the skeleton flashes on screen for one frame, creating a jarring "flicker" effect. The skeleton makes the app feel slower than showing nothing.

**Why it happens:** Every API call shows a skeleton immediately. For cached or fast responses, the skeleton appears and disappears within a single frame or two.

**Prevention:**
- Delay skeleton display by 200-300ms. If data arrives before the delay, skip the skeleton entirely.
- Use a minimum display time of 500ms once a skeleton is shown (avoid sub-second flash).
- Pattern: `showSkeleton = isLoading && loadingDurationMs > 200`

**Phase:** UI component phase. Build this into the skeleton utility/hook from the start.

**Confidence:** HIGH -- standard UX practice documented by Luke Wroblewski's original skeleton screen research.

**Sources:**
- [Skeleton loading screen design](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/)

---

### Pitfall 8: Token Refresh Race Conditions on Concurrent API Calls

**What goes wrong:** Multiple API calls fire simultaneously. The access token expires. Each call independently tries to refresh the token. Multiple refresh token exchanges happen in parallel, but a refresh token is typically single-use -- the second refresh attempt invalidates the first new token.

**Why it happens:** No request queuing or token refresh mutex. Each API interceptor independently detects 401 and triggers refresh.

**Prevention:**
- Implement a token refresh lock: the first 401 triggers a refresh, all subsequent requests queue and wait for the refresh to complete, then retry with the new token.
- Use an OIDC library that handles this internally (oidc-spa, keycloak-js both handle this).
- Do not roll your own token refresh logic in an axios interceptor without a mutex/queue.

**Detection:** Open the app after leaving it idle for longer than the access token lifetime. If multiple API calls fire on the page load, check the Network tab for multiple calls to the token endpoint.

**Phase:** Auth integration phase.

**Confidence:** HIGH -- well-known OAuth2 SPA issue.

---

### Pitfall 9: Nginx Reverse Proxy Duplicates CORS Headers

**What goes wrong:** API responses contain doubled `Access-Control-Allow-Origin` headers (e.g., the backend sets it AND nginx adds it). Browsers treat doubled CORS headers as invalid and block the request. Everything works without the proxy, breaks with it.

**Why it happens:** Developers add CORS headers in nginx config AND the backend (Spring Boot) has its own CORS configuration. Both add the same header. The HTTP spec says multiple `Access-Control-Allow-Origin` values are invalid.

**Prevention:**
- Choose ONE place to handle CORS: either nginx or the backend, not both.
- Best approach for this project: use nginx as a reverse proxy so frontend and API share the same origin. Then CORS is not needed at all for API calls.
- If you must have separate origins, strip CORS headers in nginx before adding your own: `proxy_hide_header Access-Control-Allow-Origin;`

**Detection:** Check response headers in DevTools for any API call. If you see `Access-Control-Allow-Origin` listed twice, you have this problem.

**Phase:** Docker/nginx configuration phase.

**Confidence:** HIGH -- one of the most common nginx CORS issues.

---

### Pitfall 10: Keycloak-js Library Size and Maintenance Concerns

**What goes wrong:** keycloak-js bundles add significant weight to the frontend. The library is tightly coupled to Keycloak -- if you ever change IdP or need to support multiple providers, you are locked in.

**Why it happens:** keycloak-js is the "official" library so it is the default choice. Developers do not evaluate alternatives.

**Prevention:**
- Consider `oidc-spa` as a drop-in replacement. It is provider-agnostic (works with any OIDC provider), lighter weight, and ships a keycloak-js compatibility polyfill for easy migration.
- If using keycloak-js, at least wrap it behind your own auth service interface so the OIDC library can be swapped later.
- Whichever library you choose, ensure it handles silent token refresh and token refresh race conditions internally.

**Phase:** Auth integration phase -- library selection decision.

**Confidence:** MEDIUM -- oidc-spa is newer, keycloak-js remains functional and maintained.

**Sources:**
- [oidc-spa](https://www.oidc-spa.dev/)
- [Migrating from keycloak-js](https://docs.oidc-spa.dev/resources/migrating-from-keycloak-js)

---

### Pitfall 11: Spring Data Paginated Response Format Mismatch

**What goes wrong:** The frontend expects a simple array from the API but receives Spring Data's paginated response format (`{ content: [...], pageable: {...}, totalPages: N, ... }`). Or the frontend ignores pagination entirely, loads only page 0, and users never see more than 20 recipes.

**Why it happens:** Developers build list views with a simple `fetch('/api/v1/recipes')` and map the response as an array. Spring Data wraps everything in a paginated envelope by default.

**Prevention:**
- Build a generic API client layer that understands Spring Data pagination format from day one.
- Implement infinite scroll or pagination controls as part of the first list view, not as a later enhancement.
- Map the paginated response to a typed interface: `{ items: T[], totalPages: number, currentPage: number, totalItems: number }`.

**Detection:** Check if the recipe list shows exactly `defaultPageSize` items and never shows more.

**Phase:** API integration phase. The API client must handle pagination before any list view is built.

**Confidence:** HIGH -- Spring Data pagination format is well-documented and predictable.

---

### Pitfall 12: Stale Data After Mutations (Create/Edit/Delete)

**What goes wrong:** User creates a new recipe, navigates back to the recipe list, and the new recipe is not there. Or user edits a recipe, goes back, and sees the old data. They refresh and it appears.

**Why it happens:** The recipe list was fetched earlier and is cached in memory or by a data-fetching library. The mutation (POST/PUT/DELETE) succeeded on the server but the frontend cache was not invalidated.

**Consequences:** Users think their changes were lost. They create duplicates. Trust in the application erodes.

**Prevention:**
- After any mutation, invalidate the relevant query cache (e.g., TanStack Query's `queryClient.invalidateQueries(['recipes'])`).
- For optimistic UIs: update the cache optimistically and roll back on error.
- Never rely on "the user will refresh" -- the SPA model means users expect instant consistency.

**Phase:** API integration / state management phase.

**Confidence:** HIGH -- fundamental SPA data management concern.

---

## Minor Pitfalls

### Pitfall 13: Docker Network Name Mismatch

**What goes wrong:** The frontend container cannot reach `keycloak:8180` or `app:8080` by hostname. Connection refused or DNS resolution failure inside Docker.

**Why it happens:** The frontend container is not on the same Docker network as the backend services, or the network name in docker-compose does not match the existing `cookbook-network`.

**Prevention:**
- Explicitly join the existing `cookbook-network` as an external network in the frontend's docker-compose.
- Test container-to-container connectivity with `docker exec frontend curl http://app:8080/actuator/health`.
- Remember: `localhost` inside a container refers to the container itself, not the host machine.

**Phase:** Docker setup phase.

**Confidence:** HIGH.

---

### Pitfall 14: Keycloak URL Differs Between Browser and Container

**What goes wrong:** The frontend is configured with `KEYCLOAK_URL=http://keycloak:8180` (the Docker internal hostname). The browser cannot resolve `keycloak` as a hostname. Login redirects fail with DNS errors.

**Why it happens:** Keycloak URLs are used in two contexts:
1. **Browser redirects** -- the user's browser must reach Keycloak (needs `localhost:8180` or a real domain)
2. **Backend-to-Keycloak** -- container-to-container (uses Docker hostname `keycloak:8180`)

The frontend serves JavaScript to the browser, so the Keycloak URL must be browser-accessible, not the Docker-internal hostname.

**Prevention:**
- Frontend Keycloak URL must always be the browser-accessible URL (`http://localhost:8180` in dev, `https://auth.example.com` in prod).
- Backend Keycloak URL can be the Docker-internal hostname.
- This is a runtime configuration concern -- see Pitfall 4 about environment variables.

**Detection:** If login redirect goes to `http://keycloak:8180/realms/...` and the browser shows ERR_NAME_NOT_RESOLVED, you have this problem.

**Phase:** Auth + Docker integration phase.

**Confidence:** HIGH -- extremely common Docker + Keycloak mistake.

---

### Pitfall 15: Missing Error Boundaries Crash the Entire SPA

**What goes wrong:** A JavaScript error in one component (e.g., the recipe rating widget) crashes the entire application. The user sees a blank white screen instead of just a broken widget.

**Why it happens:** SPAs are a single JavaScript application. An unhandled error in any component propagates up and kills the root render. Without error boundaries, there is no isolation.

**Prevention:**
- Wrap major page sections in error boundaries.
- Show a "something went wrong" fallback per section, not per app.
- Log errors to a service for visibility.
- Common trigger: API returns unexpected shape (null where object expected), causing `.property` access to throw.

**Phase:** UI foundation phase.

**Confidence:** HIGH.

---

### Pitfall 16: Image Upload Without Validation or Preview

**What goes wrong:** Users upload 10MB raw photos from their phone camera. The upload takes forever, the server may reject it, and displaying unoptimized images kills page load times.

**Why it happens:** File upload forms accept any file by default. Developers focus on getting the upload working and skip client-side validation.

**Prevention:**
- Client-side: validate file type (accept only jpeg/png/webp), enforce max size (e.g., 2MB), show preview before upload.
- Client-side: resize/compress images before upload using canvas or a library like browser-image-compression.
- Show upload progress indicator for large files.
- Display uploaded images via responsive `<img>` with `loading="lazy"` and appropriate `srcset` if the backend provides thumbnails.

**Phase:** Recipe creation/editing phase.

**Confidence:** HIGH.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Docker/nginx setup | 404 on refresh (Pitfall 1), network mismatch (Pitfall 13) | Configure `try_files` and Docker network in the very first phase |
| Auth integration | CORS triple-misconfiguration (Pitfall 2), token storage (Pitfall 3), token refresh races (Pitfall 8), Keycloak URL confusion (Pitfall 14) | Use nginx reverse proxy to eliminate CORS; test token refresh explicitly |
| Design system / UI | Glassmorphism performance (Pitfall 5), skeleton layout shift (Pitfall 6), skeleton flicker (Pitfall 7) | Establish "glass vs. solid" rules early; build skeleton delay pattern into first component |
| API integration | Pagination format (Pitfall 11), stale data after mutations (Pitfall 12) | Build pagination-aware API client first; use query invalidation from day one |
| Runtime config | Build-time env vars (Pitfall 4) | Implement runtime config injection before building any feature that needs a URL |
| Recipe features | Image upload (Pitfall 16) | Validate and compress client-side before upload |
| App shell | Error boundaries (Pitfall 15) | Add error boundaries to the app shell before building page content |

## Sources

- [Configuring CORS with Keycloak OIDC](https://skycloak.io/blog/configuring-cors-with-your-keycloak-oidc-client/)
- [Authentication in a SPA with Keycloak](https://iamworkz.com/en/2025/03/25/authentication-in-a-spa-with-keycloak/)
- [Keycloak CORS Issue Discussion](https://github.com/keycloak/keycloak/discussions/15962)
- [oidc-spa - OIDC library for SPAs](https://www.oidc-spa.dev/)
- [Migrating from keycloak-js to oidc-spa](https://docs.oidc-spa.dev/resources/migrating-from-keycloak-js)
- [Glassmorphism Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)
- [Glassmorphism UI Best Practices](https://uxpilot.ai/blogs/glassmorphism-ui)
- [Skeleton Loading Screen Design - LogRocket](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/)
- [Deploying Configurable Frontend Containers](https://blog.container-solutions.com/deploying-configurable-frontend-web-application-containers)
- [Nginx SPA Routing Fix](https://www.frontendundefined.com/posts/tutorials/nginx-react-router-404/)
- [SPA Stale Data Debugging in React](https://www.freecodecamp.org/news/why-your-ui-wont-update-debugging-stale-data-and-caching-in-react-apps/)
