# CLAUDE.md

This project (credentialsAI) is built on the ibl.ai platform using the
`@iblai/iblai-js` SDK.

## Locally Styled SDK Components — IMPORTANT

`/account` and `/developers` render the SDK `<Account>` component scoped
to a single tab (`management` and `integrations` respectively) by hiding
the SDK's left rail, per-tab title bar, and outer card chrome via the
`.account-management-only` wrapper class. The selectors live in
`app/iblai-styles.css` and rely on the SDK's internal DOM:

- the left rail's inline `style="width: 320px"`
- `nav[aria-label="Profile tabs"]` / `nav[aria-label="Profile tabs mobile"]`
- the per-tab title block `.hidden.lg\:block.flex-shrink-0.border-b`
- the mobile title block `[role="tabpanel"] > .lg\:hidden.mb-6`
- the inner content's `border + rounded-lg` / `border-gray-200` card wrappers

**Whenever the SDK is upgraded (`@iblai/iblai-js` bumped), re-check the
Account/Developers pages.** If the SDK's classes, inline styles, or DOM
structure changed, the overrides in `app/iblai-styles.css` may stop
matching and the rail / title / card chrome will reappear. Compare:

- `lib/iblai/sdk/web-containers/source/next/index.esm.js` — search for
  the rail wrapper (`width: '320px'`), the per-tab title (`hidden lg:block`
  + `mb-2 capitalize`), and the management content wrapper (`border
  border-gray-200 rounded-lg`).
- Update the selectors in `app/iblai-styles.css` to match the new class
  names / structure if they shifted.

The sidebar logo (`components/layout/sidebar.tsx`) similarly depends on
the DM logo endpoint shape — `${dmUrl}/api/core/orgs/{platformKey}/logo`.
If the SDK changes the endpoint path or auth requirements, the logo
fetch (and its onError → ibl.ai-logo fallback) needs to be re-wired.

## Component Priority

When adding UI features, follow this priority order:

1. **ibl.ai components** (`@iblai/iblai-js`) — always use these first
2. **shadcn/ui** (`npx shadcn@latest add`) — for everything else
3. **Custom/third-party** — only when no ibl.ai or shadcn component exists

### When the user asks to add...

| Feature | Use this | NOT this |
|---------|----------|----------|
| Profile page / dropdown | `/iblai-profile` skill + `Profile`, `UserProfileDropdown` from SDK | Custom profile form |
| Account / org settings | `/iblai-account` skill + `Account` from SDK | Custom settings page |
| Analytics dashboard | `/iblai-analytics` skill + `AnalyticsOverview`, `AnalyticsLayout` from SDK | Chart library from scratch |
| Notifications | `/iblai-notification` skill + `NotificationDropdown` from SDK | Custom notification system |
| Auth / login | `/iblai-auth` skill + `AuthProvider`, `SsoLogin` from SDK | Custom auth flow |
| Course catalog / academy | `useDiscover` + `FacetFilterContext` + `DiscoverFilterDrawer` from SDK | Custom catalog grid |
| API / agent settings | `AgentApiTab` + `AgentSettingsProvider` (next bundle), OR `<Account targetTab="integrations">` | Custom API key UI |
| Credit balance | `<CreditBalance>` from `@iblai/iblai-js/web-containers` | Custom credit widget |
| Buttons, forms, modals, tables | shadcn/ui (`npx shadcn@latest add button dialog table`) | Raw HTML or other UI libraries |

### Key rule

Do NOT build custom components when an ibl.ai SDK component exists.
Do NOT use raw HTML or third-party UI libraries when shadcn/ui has an equivalent.
ibl.ai and shadcn share the same Tailwind theme — they render in brand colors automatically.

## SDK Imports

```typescript
// Data layer
import { initializeDataLayer, mentorReducer } from "@iblai/iblai-js/data-layer";
import { useGetTenantMetadataQuery } from "@iblai/iblai-js/data-layer";

// Auth & utilities
import { AuthProvider, TenantProvider } from "@iblai/iblai-js/web-utils";

// Framework-agnostic components
import {
  Profile, Account, AnalyticsLayout, AnalyticsOverview,
  NotificationDropdown, NotificationDisplay,
  CreditBalance,
  useDiscover, FacetFilterContext, DiscoverFilterDrawer,
} from "@iblai/iblai-js/web-containers";

// Next.js-specific components (uses next/image, next/link)
import {
  SsoLogin, UserProfileDropdown, Account, AgentApiTab,
  AgentSettingsProvider,
} from "@iblai/iblai-js/web-containers/next";
```

## Routes

| Route | What it renders |
|-------|-----------------|
| `/` | Credentials home (templates, earners, pathways, collections, recommendations, issue) |
| `/credentials/[id]` | Credential detail |
| `/credentials/[id]/issue` | Issue a credential |
| `/academy` | Course catalog (SDK `useDiscover`, cross-tenant `main` scope) |
| `/analytics` | SDK `AnalyticsOverview` |
| `/analytics/{users,courses,programs,topics,transcripts,financial,audit,reports}` | Per-tab SDK analytics components |
| `/account` | SDK `<Account targetTab="management">` — left rail + title hidden via `.account-management-only` |
| `/developers` | SDK `<Account targetTab="integrations">` — same `.account-management-only` overrides |
| `/profile` | SDK `<Profile>` |
| `/notifications` | SDK `<NotificationDisplay>` |

## Environment

Platform configuration lives in `iblai.env` (`DOMAIN`, `PLATFORM`, `TOKEN`).
Next.js reads `NEXT_PUBLIC_*` env vars from `.env.local`. The two are
linked but distinct — update `iblai.env` and re-run `iblai add auth` only
if the platform key changes.

## Brand

- **Primary**: `#0058cc`, **Gradient**: `linear-gradient(135deg, #00b0ef, #0058cc)`
- **Style**: shadcn/ui new-york variant, system sans-serif, Lucide icons
- SDK components ship with their own styles — do NOT override them, except
  for the scoped overrides documented in "Locally Styled SDK Components" above

## Commands

```bash
pnpm dev             # Dev server (uses Turbopack via next 16)
pnpm build           # Production build
iblai config show    # View configuration
iblai add <feature>  # Add a feature
```

## Stack

- Next.js 16 (Turbopack default, with `--webpack` fallback configured for
  the `@reduxjs/toolkit` dedup aliases in `next.config.mjs`)
- React 19
- TypeScript 6
- Tailwind v4 (`@tailwindcss/postcss`)
- shadcn/ui (new-york variant)
- pnpm 11
