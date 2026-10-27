# CLAUDE.md

This project is built on the ibl.ai platform using the `@iblai/iblai-js` SDK.
It was scaffolded from **vibe-starter** and already has: SSO sign-in, a home
page that chats with the app's agent, an agents browser, profile with app
preferences, an admin area (users, analytics, billing, memory, organization)
that only org admins see, typed per-user and per-org settings on the
platform, and a first-run `/setup`.

## Decisions (from /iblai-vibe-start)

Read `iblai.env` for `PROJECT`, `ARCHITECTURE`, `ACCESS`, `DOMAIN_FOCUS`;
if they are missing, run `/iblai-vibe-start` before substantial work and
record the answers here:

- Project: new — **Credential Wallet** (see README.md): a learner-owned wallet for credentials, skills and résumés
- Architecture: **multi-org** (the os.ibl.ai model, docs/auth-model.md §3): anyone with an ibl.ai account signs in (`app=mentor`, no pinned tenant) and lands in their default org; the profile dropdown switches orgs through the SDK's `handleTenantSwitch`; `?tenant=<org>` pins one. `NEXT_PUBLIC_MAIN_TENANT_KEY=main` is only the community fallback. `resolveAppTenant()` = `app_tenant` (dropped when the session's `tenants` disown it) → `tenant` (the SDK's key; `current_tenant` is the platform's record, an entry of `tenants`) → `main` (the default in code). **No server side, no secrets** (the user's rule, 2026-10-20): every call goes from the browser to ibl.ai with the signed-in user's session (SDK hooks, or `lib/iblai/session-fetch.ts`); the project stores no API token and has no `app/api` routes. Public pages are self-contained links (`lib/wallet/share.ts` fragments) verified by the viewer's browser against ibl.ai's public assertion endpoint.
- Access: members of any org, plus two public routes (`/p/<org>/<username>` public wallet, `/verify/<id>?org=&u=`) in `PUBLIC_ROUTES`
- Focus: users (profile, career records, per-user metadata as the wallet store), agents (the Coach)
- Demo mode: `NEXT_PUBLIC_WALLET_DEMO=true` runs the sample wallet with no platform calls (`config.demoMode()`, `lib/wallet/demo-data.ts`); the signed-in app never uses localStorage for wallet data

## Start here — what the user says → what to do

| The user says…                                                                     | Do this                                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "who signs in", "one org or many", "make it multi-organization", "public agent"    | `/iblai-vibe-start` (re-run to change the decisions above); mechanics in the vibe repo's `docs/auth-model.md`                                               |
| "chat", "the agent", "assistant"                                                   | Already on `/`. No agent yet? An admin runs `/setup` (pick or create). Customize with `/iblai-vibe-agent-chat`.                                             |
| "create an agent", "another agent"                                                 | `/iblai-vibe-agent-create` → then `/iblai-vibe-agent-setting` and the tabs in `/iblai-vibe-agent`                                                           |
| "users", "admins", "roles", "invite", "who can"                                    | `/iblai-vibe-admin` (User/Admin mode, `/admin/users`), `/iblai-vibe-invite`, `/iblai-vibe-rbac`                                                             |
| "remember the user's…", "preferences", "onboarding progress", "custom user fields" | `/iblai-vibe-user-metadata` (`useUserSettings` in `lib/iblai/metadata.ts`) — never localStorage, never your own DB                                          |
| "organization setting", "white-label", "app-wide config"                           | `/iblai-vibe-org-metadata` (`useOrgSettings`, GET-merge-PUT) + `/iblai-vibe-account`                                                                        |
| "profile", "avatar", "résumé"                                                      | `/iblai-vibe-profile` (already on `/profile`)                                                                                                               |
| "remember", "memory", "personalize"                                                | `/iblai-vibe-memory-guide` → `/iblai-vibe-memory`, `/iblai-vibe-agent-memory`                                                                               |
| "analytics", "usage", "costs", "transcripts", "audit"                              | `/iblai-vibe-analytics` (already on `/admin/analytics`), `/iblai-vibe-agent-audit`                                                                          |
| "charge", "pricing", "paywall", "credits", "spend limit"                           | `/iblai-vibe-pricing` → the rail it picks                                                                                                                   |
| "notifications"                                                                    | `/iblai-vibe-notification` (already on `/notifications`)                                                                                                    |
| "deploy", "URL", "share it"                                                        | `/iblai-vibe-ops-deploy`                                                                                                                                    |
| "iOS", "Android", "Mac", "Windows", "App Store"                                    | `/iblai-vibe-ops-build`, `/iblai-vibe-ops-release`                                                                                                          |
| anything with no component                                                         | `lib/iblai/session-fetch.ts` as the signed-in user (never a server route, never an `Api-Token`), and the matching `iblai-api-*` skill for the endpoint      |
| "tests", "before you show me", "is it done?"                                       | `/iblai-vibe-ops-test` — `pnpm build`, `pnpm test`, then its touch test: the route in a real browser, every control you added, the console, the phone width |

**Freshness rule:** the installed skills are a copy of
[iblai/vibe](https://github.com/iblai/vibe), which changes often. If
`.claude/skills/iblai-vibe/SKILL.md` is older than 14 days or older than the
latest release, suggest `/iblai-vibe-ops-upgrade` before substantial work.

Two skill families are installed: `iblai-vibe-*` (mount visual components,
build, ship — this app) and `iblai-api-*` (headless REST, no screen — for
scripts, CI, server routes, and operating the org). See `docs/skill-kinds.md`
in the vibe repo.

Rules that never change: SDK components → shadcn/ui → custom, in that order;
`pnpm install --ignore-scripts`; lowercase project names; ask for a real
agent UUID, never invent one; never print a token; never ask for a password;
before saying "done", run `/iblai-vibe-ops-test` — build, tests, and its touch
test in a real browser (Claude in Chrome, or the `chrome-devtools` server in
`.mcp.json`); no browser tool → say so, never call it tested.

## Component Priority

1. **ibl.ai components** (`@iblai/iblai-js`) — always first
2. **shadcn/ui** (`pnpm dlx shadcn@latest add <name>`) — everything else
3. **Custom/third-party** — only when neither exists

Do NOT build custom components when an SDK component exists. Do NOT restyle
SDK components — wrap the _container_, never the internals. ibl.ai and
shadcn share one Tailwind theme and render in brand colors automatically.

Before diverging from the ibl.ai design language — another font or weight
scale, a size outside the scale, a new accent colour, restyling SDK
internals, a hand-rolled shell or spinner, a card around an SDK panel, dark
mode — stop and ask with AskUserQuestion: what the language says, what would
change, what it costs. Reuse `components/page-header.tsx`,
`components/empty-state.tsx` and `components/loading-screen.tsx` before
writing new ones; the examples are in `/iblai-vibe-component` (House
components), the wiring in BRAND.md.

## Map of this app

| Where                                                      | What                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(app)/layout.tsx`                                     | The OS shell from the SDK: `SidebarProvider` → `PlatformSidebar` (`components/shell/wallet-sidebar.tsx`) + `SidebarInset` with `PlatformNavbar` (`components/shell/top-bar.tsx`); footer actions open `PlatformAccountSheet` / `InviteUserDialog`; Admin mode adds the Admin menu |
| `app/(app)/page.tsx`                                       | Home: the wallet dashboard (health score, pending, expiring, role fit)                                                                                                                                                                                                            |
| `app/(app)/credentials/**`, `skills/`, `resume/`, `share/` | The wallet pages; all read `useWallet()` from `lib/wallet/provider.tsx`                                                                                                                                                                                                           |
| `app/(app)/coach/page.tsx`                                 | SDK `<Chat>` (`components/wallet/agent-chat.tsx`) with `?agent=`, `NEXT_PUBLIC_DEFAULT_AGENT_ID`, the agent chosen on `/setup`, else the platform's default agent (`overall_default_mentor`); demo mode says it needs a platform                                                  |
| `app/(app)/agents/page.tsx`                                | SDK `AgentSearch`; clicking a card opens it on `/coach`                                                                                                                                                                                                                           |
| `app/(app)/profile/page.tsx`                               | SDK `Profile` (Education → Credentials/Skills, Experience → Résumé) + `AppPreferences`; demo mode edits the sample records                                                                                                                                                        |
| `app/(public)/**`                                          | `/p/[username]`, `/verify/[id]` — no navbar, no session                                                                                                                                                                                                                           |
| `lib/wallet/public-platform.ts`                            | ibl.ai's public assertion endpoint, read from the browser (public page + verify)                                                                                                                                                                                                  |
| `lib/wallet/**`                                            | Model, Open Badges import/export, market taxonomy + gap analysis, health, résumé (+ the Draft for me prompt), derive, provider (credentials from every platform the user belongs to)                                                                                              |
| `app/(app)/account/page.tsx`, `notifications/`             | SDK `Account`, `NotificationDisplay`                                                                                                                                                                                                                                              |
| `app/(app)/admin/**`                                       | Admin mode only: users (+ invites), analytics tabs, billing, memory, organization (+ `OrgSettingsForm`)                                                                                                                                                                           |
| `app/setup/`                                               | Admins choose the Coach's agent (SDK `MentorSelectionGrid` / `CreateAgentModal`) → `apps.credential-wallet.defaultAgentId` in the platform's metadata. No navbar.                                                                                                                 |
| `lib/iblai/config.ts`                                      | Env accessors (no secrets)                                                                                                                                                                                                                                                        |
| `lib/iblai/tenant.ts`                                      | `resolveAppTenant()`, `readTenants()`, `isTenantAdmin()` (not the SDK's `useIsAdmin`)                                                                                                                                                                                             |
| `lib/iblai/admin-mode.tsx`                                 | `AdminModeProvider` / `useAdminMode` — the User/Admin view                                                                                                                                                                                                                        |
| `lib/iblai/metadata.ts` (+ `metadata-core.ts`)             | `useUserSettings`, `useOrgSettings` — namespaced under `apps.credential-wallet` (fixed); org writes GET-merge-PUT; `platformDefaultAgentId`                                                                                                                                       |
| `lib/iblai/session-fetch.ts`                               | browser `sessionFetch()`: `Authorization: Token <dm_token>` to `config.dmUrl()`                                                                                                                                                                                                   |
| `lib/iblai/completions.ts`                                 | `complete()`: one chat completion on the platform's OpenAI-compatible endpoint (`/api/ai-mentor/orgs/<org>/v1/`) as the user — Draft for me. Models from the DM host, the completion on the streaming host (`config.asgiUrl()`, as the OS does)                                   |
| `lib/iblai/sso-redirect.ts`                                | `resolveSsoRedirectPath()`: the post-SSO landing path, plain same-origin or `/`                                                                                                                                                                                                   |
| `proxy.ts`                                                 | The nonce-based CSP (`applyCsp`, `frame-ancestors 'none'`) and the `x-pathname` header                                                                                                                                                                                            |
| `app/manifest.ts`                                          | PWA manifest; icons in `public/icon-{256,1024}.png`                                                                                                                                                                                                                               |
| `providers/iblai-providers.tsx`, `store/iblai-store.ts`    | SDK providers (+ service worker, toaster, Radix guard); the store's slice keys are fixed by the SDK — keep them                                                                                                                                                                   |
| `e2e/`                                                     | Playwright in the OS's shape: `fixtures/wallet-test.ts` (page objects, `memberPage`, `publicPage`, `@demo`), `page-objects/`, `utils/app.ts`, journeys 01–13, `COVERAGE.md` + `coverage.json` (checked by `__tests__/e2e-coverage.test.ts`)                                       |

## Invariants (and why)

- The org comes from the session (`resolveAppTenant()`: explicit switch →
  SSO's `current_tenant` → `main`); never pinned from env. Every server call
  names its org (`platformFetch(..., org)`).
- No secrets, no server routes: the browser talks to ibl.ai as the signed-in user; admin gating happens on the platform.
- `<Chat>` never remounts except through its `key`; `reactStrictMode` stays
  `false` (SDK voice bug). Keep `public/sw.js` — `ServiceWorkerProvider` registers it.
- Org metadata is a public read and PUT replaces it: write only through
  `useOrgSettings` / `mergeAppNamespace`; never a secret.
- Admin UI gates on `useAdminMode().adminMode`; admin _writes_ gate on the platform.
- The CSP proxy (`proxy.ts`, `frame-ancestors 'none'`) is the only server piece left; the other security headers live in `next.config.ts`.

## SDK Imports

```typescript
import { initializeDataLayer, mentorReducer } from "@iblai/iblai-js/data-layer";
import { AuthProvider, TenantProvider, useChatV2 } from "@iblai/iblai-js/web-utils";
import { Profile, AnalyticsLayout, NotificationDropdown } from "@iblai/iblai-js/web-containers";
import {
  SsoLogin,
  UserProfileDropdown,
  Account,
  Chat,
  AgentSearch,
} from "@iblai/iblai-js/web-containers/next";
```

## Environment

`iblai.env` (gitignored) holds the platform shorthand: `DOMAIN`, `PLATFORM`,
`TOKEN`, optional `IBLAI_USERNAME`. `.env.local` (gitignored) is what Next.js
reads: optional `NEXT_PUBLIC_MAIN_TENANT_KEY` (= `PLATFORM`; `main` by default),
optional `NEXT_PUBLIC_DEFAULT_AGENT_ID`,
`NEXT_PUBLIC_SUPPORT_EMAIL`. The API/auth/websocket URLs default to hosted
iblai.app in `lib/iblai/config.ts`; override only when self-hosting
(`NEXT_PUBLIC_PLATFORM_BASE_DOMAIN`, `NEXT_PUBLIC_API_BASE_URL`, the sign-in
URL). When the host exports `IBLAI_API_KEY` / `IBLAI_PLATFORM_KEY` /
`IBLAI_USERNAME` (the ibl.ai desktop app does), use those and never ask.

Every origin the app runs on (localhost, the deployed URL, a Tauri scheme)
must be in the org's allowed redirect origins or sign-in never returns.

## Brand

- **Primary** `#0058cc`, **Gradient** `linear-gradient(135deg, #00b0ef, #0058cc)`, button `bg-gradient-to-r from-[#2563EB] to-[#93C5FD] text-white`
- shadcn/ui base-nova (Base UI: `render` prop, not `asChild`), Lucide icons; SDK components ship their own styles — do NOT override them
- **Typography is the house style** (the CRM/SIS pass, applied 2026-10-23, replacing the 2026-10-20 system-stack call): Open Sans via `next/font` on `<html>`, `--font-sans` plus the one-step-lighter remap (`font-semibold` → 500, `font-bold` → 600) in `@theme inline`, no `body { font-family … !important }` anywhere, Lucide at 1.75 through one CSS rule, and `ibl-dialog-title` / `text-gray-700` / the uppercase table head in the primitives, never at call sites. Top bar keeps the system font (`font-[ui-sans-serif,system-ui,sans-serif]`), `h-16 border-b border-[#D0E0FF]`, title `text-sm font-medium text-[#646464]`, User/Admin labels `text-sm` (active `font-semibold`).

## Layout Patterns

- Shell: the SDK `PlatformSidebar` + `PlatformNavbar` (never a local sidebar/navbar); pages are `PageHeader` + `Page` (`components/wallet/section.tsx`, `max-w-6xl` inside the inset). Page background `var(--sidebar-bg, #fafbfc)`; SDK panels host the OS way on every page: full width, `flex-1 min-h-0`, the component's own background — never a card.
- Mobile safe area: `globals.css` `env(safe-area-inset-*)` on body; `viewport-fit=cover` in `app/layout.tsx`.

## Commands

```bash
pnpm dev             # Dev server (localhost:3000)
pnpm build           # Production build
pnpm typecheck       # Type-check
pnpm lint            # oxlint, zero warnings
pnpm format          # oxfmt (format:check is the CI gate)
pnpm test            # Vitest
pnpm test:coverage   # Vitest with the coverage thresholds (CI)
pnpm e2e:accounts    # once: the two Playwright accounts in the throwaway organization iblai.env names
pnpm test:e2e        # Playwright: chromium + mobile + demo against pnpm dev (test:e2e:demo needs no account; CI runs it)
pnpm release         # release-it (CI runs it on every push to main)
```
