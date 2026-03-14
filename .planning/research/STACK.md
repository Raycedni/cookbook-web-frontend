# Technology Stack

**Project:** Cookbook Web Frontend
**Researched:** 2026-03-14

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | 19.2.x | UI framework | Industry standard, massive ecosystem, TanStack/auth libraries all target React first. v19 brings improved Suspense boundaries (critical for skeleton loading states) and better performance. | HIGH |
| TypeScript | ~5.7 | Type safety | Non-negotiable for any project of this scope. Catches API contract drift, enables type-safe routing with TanStack Router, integrates with Zod for runtime + compile-time validation. | HIGH |

### Build Tool

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vite | 8.x | Dev server + bundler | The undisputed standard as of 2026. CRA is officially dead. Vite 8 ships with Rolldown (Rust-based bundler) and Oxc compiler -- sub-second HMR, 5x faster production builds than webpack. React plugin v6 drops Babel entirely. | HIGH |

### Routing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| TanStack Router | 1.x | Client-side routing | Superior to React Router for SPA use cases. Full type-safe route params and search params out of the box. React Router v7's best features only work in "framework mode" (Remix-like SSR) which this project explicitly excludes. TanStack Router was built SPA-first with Vite integration via @tanstack/router-plugin. File-based route generation, type-safe loaders, built-in search param validation with Zod. | HIGH |

### Data Fetching / Server State

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| TanStack Query | 5.x | API data fetching, caching, sync | The standard for REST API consumption in React. Provides: automatic caching, background refetching, pagination support (critical for Spring Data paginated responses), optimistic updates, retry logic, and devtools. Eliminates manual loading/error state management. Pairs naturally with TanStack Router for route-level data loading. | HIGH |

### HTTP Client

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ky | 1.14.x | HTTP requests | Modern, tiny (~3KB) Fetch-based client. Advantages over raw fetch: automatic JSON parsing, retry logic, cleaner error handling for 4xx/5xx responses, hooks (beforeRequest/afterResponse for Bearer token injection). Advantages over Axios: smaller bundle, built on native Fetch (streaming support), no XMLHttpRequest legacy. Perfect for wrapping with TanStack Query. | MEDIUM |

### Client State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zustand | 5.x | Global client state | Minimal boilerplate (~3KB), module-based stores. Ideal for: auth state (current user, tokens), UI state (sidebar open, theme), shopping list selections. Most server state lives in TanStack Query cache, so Zustand only handles truly client-side concerns. Simpler than Redux, more structured than Jotai for app-wide state. | HIGH |

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.x | Utility-first CSS | CSS-first configuration in v4 (no tailwind.config.js). Built-in `backdrop-blur-*`, `backdrop-brightness-*`, `bg-black/50` opacity utilities map directly to glassmorphism patterns. Lightning CSS engine for 5x faster builds. Design token system via CSS custom properties fits the black + royal purple theming perfectly. | HIGH |

### Forms + Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React Hook Form | 7.x | Form state management | Uncontrolled component approach = fewer re-renders (critical for recipe editing forms with many fields). 12KB gzipped vs Formik's 44KB. Zero dependencies. Excellent integration with Zod via @hookform/resolvers. | HIGH |
| Zod | 4.x | Schema validation | Runtime validation with TypeScript type inference. v4 is 14x faster string parsing, ~2KB with @zod/mini. Use for: form validation schemas, API response validation, route search param validation (TanStack Router integration). Single validation library across the entire app. | HIGH |

### Authentication

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| react-oidc-context | 3.x | React auth provider | Lightweight wrapper around oidc-client-ts. Provides AuthProvider context, useAuth() hook, automatic token refresh, redirect handling. Built specifically for SPA + Keycloak PKCE flow. Active maintenance, sample Keycloak projects available from the authts org. | HIGH |
| oidc-client-ts | 3.x | OIDC protocol handling | Underlying library for PKCE flow, token management, silent renew. Handles the Authorization Code + PKCE exchange with Keycloak. react-oidc-context depends on this. | HIGH |

### UI Components (supplementary)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Lucide React | latest | Icons | Tree-shakable icon set, consistent style, MIT licensed. Better than react-icons (which bundles entire icon sets). | MEDIUM |
| clsx | latest | Conditional classnames | Tiny utility for composing Tailwind classes conditionally. Standard companion to Tailwind. | HIGH |
| tailwind-merge | latest | Class conflict resolution | Intelligently merges Tailwind classes without conflicts. Essential when building reusable components that accept className props. | HIGH |

### Testing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vitest | 3.x | Unit + integration tests | Native Vite integration, same config, same transforms. Jest-compatible API so no learning curve. Built-in coverage via v8. | HIGH |
| Testing Library | latest | Component testing | @testing-library/react for DOM testing. The standard for testing React components by user behavior, not implementation. | HIGH |
| Playwright | latest | E2E testing | Cross-browser E2E testing. Better than Cypress for modern SPAs -- true multi-tab support, faster execution, better async handling. | MEDIUM |

### Docker / Deployment

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Node 22 Alpine | 22-alpine | Build stage | Multi-stage Docker build. Node 22 is the current LTS, required by Vite 8. Alpine for minimal image size. | HIGH |
| nginx:alpine | latest stable | Serve stage | Serves static assets from Vite's `dist/` output. Custom nginx.conf with `try_files $uri /index.html` for SPA client-side routing. Final image is ~30MB vs ~1GB with Node. | HIGH |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | React | Vue 3, Svelte 5, Angular | React has the largest ecosystem for the specific libraries needed (TanStack, oidc-client-ts, etc.). Vue/Svelte would require finding alternative auth and data-fetching solutions with less community support. |
| Build tool | Vite 8 | webpack, Turbopack | Webpack is legacy. Turbopack is Next.js-only. Vite is the React community standard. |
| Routing | TanStack Router | React Router v7 | React Router v7's type safety and data loading only work in framework mode (SSR). For SPA-only, TanStack Router is strictly superior with full type-safe params, search params, and loaders. |
| HTTP client | ky | Axios, native fetch | Axios carries XMLHttpRequest legacy and larger bundle. Native fetch lacks retry, interceptors, and auto JSON error handling. ky sits in the sweet spot. |
| State | Zustand | Redux Toolkit, Jotai | Redux is overkill -- most state is server state in TanStack Query. Jotai's atomic model is better for fine-grained reactivity scenarios this app doesn't have. Zustand's simple store model fits the auth/UI state needs perfectly. |
| Styling | Tailwind CSS | CSS Modules, styled-components, Emotion | CSS-in-JS (styled-components, Emotion) has performance overhead and is falling out of favor in 2025-2026. CSS Modules lack the rapid prototyping speed of utilities. Tailwind's backdrop-filter utilities are a direct match for glassmorphism. |
| Forms | React Hook Form | Formik | Formik: 4x larger bundle, more re-renders, less active development. React Hook Form is the community standard for new projects. |
| Validation | Zod | Yup, Valibot | Yup is older, less TypeScript-native. Valibot is promising but smaller ecosystem. Zod v4 closed the performance gap and has the best TanStack integration. |
| Auth | react-oidc-context | keycloak-js, @react-keycloak/web | keycloak-js is a generic JS adapter -- no React hooks, manual lifecycle management. @react-keycloak/web wraps keycloak-js but is less maintained than react-oidc-context. The oidc-client-ts ecosystem (react-oidc-context) follows OIDC standards, not Keycloak-specific APIs, making it more portable and better maintained. |
| E2E testing | Playwright | Cypress | Cypress has slower execution, no native multi-tab support, and a less permissive license model. Playwright is the modern standard. |

## Installation

```bash
# Initialize project
npm create vite@latest cookbook-web-frontend -- --template react-ts

# Core dependencies
npm install react react-dom
npm install @tanstack/react-router @tanstack/react-query
npm install ky zustand
npm install react-hook-form @hookform/resolvers zod
npm install react-oidc-context oidc-client-ts
npm install lucide-react clsx tailwind-merge

# Styling
npm install tailwindcss @tailwindcss/vite

# Dev dependencies
npm install -D typescript @types/react @types/react-dom
npm install -D @tanstack/router-plugin @tanstack/react-query-devtools
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D playwright @playwright/test
npm install -D @vitejs/plugin-react
```

## Version Summary

| Package | Verified Version | Source |
|---------|-----------------|--------|
| React | 19.2.x (19.2.4 latest) | [react.dev](https://react.dev/versions) |
| Vite | 8.x | [vite.dev](https://vite.dev/blog/announcing-vite8) |
| TanStack Router | 1.167.x | [npm](https://www.npmjs.com/package/@tanstack/react-router) |
| TanStack Query | 5.90.x | [npm](https://www.npmjs.com/package/@tanstack/react-query) |
| Tailwind CSS | 4.x | [tailwindcss.com](https://tailwindcss.com/blog/tailwindcss-v4) |
| Zustand | 5.0.x | [npm](https://www.npmjs.com/package/zustand) |
| ky | 1.14.x | [npm](https://www.npmjs.com/package/ky) |
| React Hook Form | 7.71.x | [npm](https://www.npmjs.com/package/react-hook-form) |
| Zod | 4.3.x | [npm](https://www.npmjs.com/package/zod) |
| react-oidc-context | 3.3.x | [npm](https://www.npmjs.com/package/react-oidc-context) |
| oidc-client-ts | 3.4.x | [npm](https://www.npmjs.com/package/oidc-client-ts) |
| React Router v7 | 7.13.x (NOT recommended) | [npm](https://www.npmjs.com/package/react-router) |

## Sources

- [React Versions](https://react.dev/versions) - React 19.2.4 confirmed
- [Vite 8 Announcement](https://vite.dev/blog/announcing-vite8) - Rolldown integration, Oxc compiler
- [TanStack Router vs React Router](https://medium.com/ekino-france/tanstack-router-vs-react-router-v7-32dddc4fcd58) - SPA comparison 2026
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) - CSS-first config, backdrop-filter support
- [Glassmorphism with Tailwind](https://www.epicweb.dev/tips/creating-glassmorphism-effects-with-tailwind-css) - backdrop-blur utilities
- [State Management 2026](https://www.syncfusion.com/blogs/post/react-state-management-libraries) - Zustand as modern standard
- [react-oidc-context + Keycloak sample](https://github.com/authts/sample-keycloak-react-oidc-context) - Official PKCE example
- [Keycloak OIDC + PKCE for React](https://skycloak.io/blog/secure-react-api-access-using-keycloak-oidc-pkce/) - Auth flow guidance
- [Zod v4](https://zod.dev/v4) - Performance improvements, @zod/mini
- [Multi-stage Docker for Vite SPAs](https://dev.to/it-wibrc/guide-to-containerizing-a-modern-javascript-spa-vuevitereact-with-a-multi-stage-nginx-build-1lma) - nginx deployment pattern
- [ky HTTP client](https://github.com/sindresorhus/ky) - Fetch-based, modern alternative to Axios
