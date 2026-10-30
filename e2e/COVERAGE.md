# Credential Wallet E2E Coverage — User Journey Checklist

> Last updated: 2026-10-30 | 84 checkpoints (82 covered, 2 pending/fixme) | 14 journeys | 98% covered | Auth: admin + member storageState, plus the demo project

## How This Works

Each **checkpoint** is one user action or verification in a spec under `e2e/journeys/`, tagged in the spec
with a `// <id>` comment above its test. Coverage = `covered / total * 100`. `coverage.json` is the
machine-readable twin; `__tests__/e2e-coverage.test.ts` (part of `pnpm test`, so of CI) fails when a
journey's spec is missing, a route under `app/` belongs to no journey, a checkpoint id is absent from this
file or from its spec, or the summary line no longer matches the entries.

Who runs what: the journeys sign in through the real Auth SPA as the two accounts `pnpm e2e:accounts`
creates in a **throwaway organization** (never `main`) — "— Admin" describes as the organization admin,
"— Non-Admin" as the member (`memberPage`), "Public" in a fresh context — and the "— Demo" describes run the
sample wallet (`@demo`, the `demo` project) with no account and no platform call; CI runs those.

When adding a page or changing a user flow:

1. Add checkpoints to the relevant journey below (or create a new journey)
2. Write the Playwright test for each, with its `// <id>` comment
3. Mark the checkpoint `[x]` once the test is in the suite and passing, and update the summary line
4. List the page under the journey's `sourceFiles` in `coverage.json`

Run: `pnpm test:e2e` (chromium + mobile + demo against `pnpm dev`), `pnpm test:e2e:demo` (no account), `pnpm test:e2e:all` (every browser).

Not covered yet: a platform-issued credential ("Verified on ibl.ai") end to end — needs an issuing pipeline on the throwaway organization; the invite email round trip; the tenant switcher (one organization per test account).

---

## Journey 1: Authentication (6 checkpoints) — `journeys/01-authentication.spec.ts`

**Source files:** `providers/iblai-providers.tsx`, `lib/iblai/auth-utils.ts`, `lib/iblai/tenant.ts`, `components/navbar/user-profile-button.tsx`

- [x] Signed-out visitor on / is sent to the Auth SPA login (app=mentor, redirect-to) _(auth-01)_
- [x] Signed-out visitor on /credentials is redirected; /p/… and /verify/… stay public _(auth-02)_
- [x] Signed-in admin: tenant is the key, current_tenant its record and an entry of tenants, no app_tenant pin _(auth-03)_
- [x] ?tenant=<own organization> pins app_tenant and the page renders _(auth-04)_
- [x] Log Out from More options clears the session and goes to the Auth SPA logout _(auth-05)_
- [x] Back from the $0 checkout on main's session, holding [main, own]: the SDK's switch goes to /login/complete for the own organization _(auth-06)_

---

## Journey 2: Shell & Navigation (8 checkpoints) — `journeys/02-shell-and-navigation.spec.ts`

**Source files:** `app/(app)/layout.tsx`, `components/shell/wallet-sidebar.tsx`, `components/shell/top-bar.tsx`, `components/navbar/admin-mode-switch.tsx`

- [x] Every sidebar row (Credentials, Skills, Résumé, Share, Coach, Wallet) lands on its page with the top-bar title and aria-current _(nav-01)_
- [x] Add credential (sidebar) opens the import page _(nav-02)_
- [x] Collapse sidebar / Expand sidebar and Ctrl+B toggle the rail _(nav-03)_
- [x] The bell opens the notifications dropdown; View all goes to /notifications _(nav-04)_
- [x] More options offers Profile and Log Out _(nav-05)_
- [x] Footer: Invites opens Invite Users; Management, Integrations, Advanced open their dialogs; Notifications navigates _(nav-06)_
- [x] Support opens ibl.ai/docs in a new tab _(nav-07)_
- [x] User mode hides Analytics and the admin footer rows; Admin mode brings them back _(nav-08)_

---

## Journey 3: Home (4 checkpoints) — `journeys/03-home.spec.ts`

**Source files:** `app/(app)/page.tsx`

- [x] Empty wallet: Welcome, {first}. Your wallet is empty. and Add your first credential → import _(home-01)_
- [x] Demo: greeting, summary line and the four tiles with their numbers; the pending tile filters the list _(home-02)_
- [x] Demo: Needs your decision → Review opens the pending credential; All credentials; the checklist links _(home-03)_
- [x] Demo: Toward {role} → Full gap analysis opens Skills _(home-04)_

---

## Journey 4: Credentials lifecycle (11 checkpoints) — `journeys/04-credentials-lifecycle.spec.ts`

**Source files:** `app/(app)/credentials/page.tsx`, `app/(app)/credentials/[id]/page.tsx`, `app/(app)/credentials/import/page.tsx`, `components/wallet/credential-card.tsx`

- [x] Empty list: No credentials yet; Add credential → import _(cred-01)_
- [x] Paste JSON: bad JSON is named; Sample 2.0 is recognized; Add to wallet toasts and opens the credential _(cred-02)_
- [x] The pending badge's banner; Accept → Accepted and made public, Active, Public _(cred-03)_
- [x] The list counts it (All 1); search finds it; a miss shows Nothing matches _(cred-04)_
- [x] Share… dialog: the verify link carries the holder's copy (#c=); Copy link toasts _(cred-05)_
- [x] Open Badges 3.0 JSON downloads <slug>.ob3.json, an OpenBadgeCredential _(cred-06)_
- [x] Make private / Make public toast and change Visibility _(cred-07)_
- [x] Badge link: an http link is refused; an https badge is fetched and recognized _(cred-08)_
- [x] Add manually: Name and Issuer gate the submit; the record is Self-reported; Remove from wallet _(cred-09)_
- [x] Remove from wallet (confirm) → Removed; the list is empty again _(cred-10)_
- [x] Member: import the 3.0 sample, accept it, remove it _(cred-11)_

---

## Journey 5: Credential states (demo) (8 checkpoints) — `journeys/05-credential-states.spec.ts`

**Source files:** `app/(app)/credentials/page.tsx`, `app/(app)/credentials/[id]/page.tsx`, `components/wallet/badges.tsx`, `components/wallet/demo-banner.tsx`

- [x] Filter counts All 7 / Verified 5 / Awaiting acceptance 1 / Expiring 1 / Expired / revoked 1 / Public 4 / Self-reported 1; ?filter=pending preselects _(cst-01)_
- [x] Sort By name, search, and the Collection select narrow the list _(cst-02)_
- [x] Decline on the pending credential → Declined _(cst-03)_
- [x] The expired self-reported record: Expired, Self-reported, cannot be shared _(cst-04)_
- [x] The expiring certification shows Expires in N days. _(cst-05)_
- [x] Collections dialog lists the existing collection and creates a new one _(cst-06)_
- [x] Reset sample data restores the declined credential _(cst-07)_
- [x] An unknown id shows Credential not found and Back to credentials _(cst-08)_

---

## Journey 6: Skills (6 checkpoints) — `journeys/06-skills.spec.ts`

**Source files:** `app/(app)/skills/page.tsx`, `lib/wallet/derive.ts`, `lib/wallet/market.ts`

- [x] Demo: the three tiles, the target role, You have / Gaps and the pay tiles _(skl-01)_
- [x] Demo: ?role= previews a role; Make it my target saves it _(skl-02)_
- [x] Demo: Add a goal lists it under Goals; Remove drops it _(skl-03)_
- [x] Demo: Self-report a skill with a level lists it under Self-reported _(skl-04)_
- [x] Demo: every sample skill is in one list — a rated skill with evidence stays evidenced (the derive origin fix) _(skl-05)_
- [x] Admin: a target role set survives a reload and can be changed _(skl-06)_

---

## Journey 7: Résumé (6 checkpoints) — `journeys/07-resume.spec.ts`

**Source files:** `app/(app)/resume/page.tsx`, `lib/wallet/resume.ts`, `lib/iblai/completions.ts`

- [x] Demo: the document shows the name and the five sections _(res-01)_
- [x] Demo: the template switches; the education toggle hides and shows its section _(res-02)_
- [x] Demo: unticking a featured credential removes it from the document _(res-03)_
- [x] Demo: Markdown downloads <name>-resume.md; Copy text toasts; Print / PDF calls window.print _(res-04)_
- [x] Admin: a summary saved survives a reload; Clear + Save empties it _(res-05)_
- [x] Admin: Draft for me ends in text or a named error toast, never silence _(res-06)_

---

## Journey 8: Share & public page (8 checkpoints) — `journeys/08-share-and-public.spec.ts`

**Source files:** `app/(app)/share/page.tsx`, `app/(public)/p/[org]/[username]/page.tsx`, `app/(public)/verify/[id]/page.tsx`, `app/(public)/layout.tsx`, `components/wallet/public-wallet.tsx`, `lib/wallet/share.ts`, `lib/wallet/public-platform.ts`

- [x] Public page On → Public page is live; the link is /p/<org>/<username>#d=… _(shr-01)_
- [x] Display handle saved; an invalid handle is refused; the previous one restored _(shr-02)_
- [x] Copy public link toasts; Post on LinkedIn points at the link _(shr-03)_
- [x] Employer opens the link cold: the name, 1 of 1 verifiable, Credentials (1), the verify link _(shr-04)_
- [x] Verify: Verified against the issuer (stubbed), Could not reach the issuer without it, Nothing to verify for an unknown id _(shr-05)_
- [x] Make private / Make public move the credential between the Public and Private lists _(shr-06)_
- [x] Export record (OB3 bundle) downloads <username>-wallet.json with one credential _(shr-07)_
- [x] Public page Off → Public page is off; the wallet is emptied again _(shr-08)_

---

## Journey 9: Coach & Agents (4 checkpoints) — `journeys/09-coach-and-agents.spec.ts`

**Source files:** `app/(app)/coach/page.tsx`, `app/(app)/agents/page.tsx`, `components/wallet/agent-chat.tsx`

- [x] Admin: the chat, or No agent for the Coach yet with Choose an agent → /setup _(coach-01)_
- [x] Member: the chat, or Ask an admin of this platform to choose one., never a Choose button _(coach-02)_
- [x] Admin: the agents browser (heading, search, Create Custom Agent); a card opens the Coach with ?agent= _(coach-03)_
- [x] Demo: The Coach needs a platform _(coach-04)_

---

## Journey 10: Profile, Account & Notifications (4 checkpoints) — `journeys/10-profile-account-notifications.spec.ts`

**Source files:** `app/(app)/profile/page.tsx`, `app/(app)/account/page.tsx`, `app/(app)/notifications/[[...id]]/page.tsx`, `components/settings/app-preferences.tsx`

- [x] Admin: the SDK profile tabs and App preferences; Onboarding done flipped survives a reload _(prof-01)_
- [x] Admin: /account loads the SDK Account panel _(prof-02)_
- [x] Admin: /notifications shows the inbox or No notifications found _(prof-03)_
- [x] Demo: Basic → Save toasts Profile saved; Education → Add a school, then Remove it _(prof-04)_

---

## Journey 11: Admin (8 checkpoints) — `journeys/11-admin.spec.ts`

**Source files:** `app/(app)/admin/users/page.tsx`, `app/(app)/admin/organization/page.tsx`, `app/(app)/admin/credentials/page.tsx`, `app/(app)/admin/billing/page.tsx`, `app/(app)/admin/memory/page.tsx`, `app/(app)/admin/analytics/layout.tsx`, `app/(app)/admin/analytics/page.tsx`, `app/(app)/admin/analytics/users/page.tsx`, `app/(app)/admin/analytics/topics/page.tsx`, `app/(app)/admin/analytics/transcripts/page.tsx`, `app/(app)/admin/analytics/financial/page.tsx`, `app/(app)/admin/analytics/reports/page.tsx`, `app/setup/page.tsx`, `components/setup/setup-screen.tsx`, `components/settings/org-settings.tsx`, `components/admin/account-panel.tsx`, `components/admin/analytics-page.tsx`

- [x] The six analytics rows each land on a page; the SDK strip offers no Courses, Programs, Memory or Audit tab _(adm-01)_
- [x] /admin/users: Pending invites, Invite user → Invite Users dialog, the SDK Management tabs and table _(adm-02)_
- [x] /admin/organization: the Welcome message saved survives a reload and is restored _(adm-03)_
- [x] /admin/credentials: the issued and issuable lists, or their empty states _(adm-04)_
- [x] /admin/billing and /admin/memory render the SDK panel _(adm-05)_
- [x] /setup: Which agent is the Coach?, Search Agents, Create a new agent opens a modal, Cancel → /coach _(adm-06)_
- [x] /setup: an agent picked and saved sends the Coach to it; Use the platform's default agent restores the organization _(adm-07)_
- [x] Member: /setup says only admins choose; /admin/users and /admin/organization send them home _(adm-08)_

---

## Journey 12: Mobile (4 checkpoints; 1 pending) — `journeys/12-mobile.spec.ts`

**Source files:** `app/(app)/layout.tsx`, `components/shell/wallet-sidebar.tsx`, `app/(public)/p/[org]/[username]/page.tsx`, `app/(public)/verify/[id]/page.tsx`

- [x] Admin on a Pixel 7: fourteen pages show their title with no sideways overflow _(mob-01)_
- [x] Admin on a Pixel 7: Toggle Sidebar opens the sheet; its rows reach Credentials and Skills and close it _(mob-02)_
- [x] Demo on a Pixel 7: the public wallet and a verify page without sideways overflow _(mob-03)_
- [ ] Admin on a Pixel 7 can leave Admin mode _(mob-04, fixme — the SDK navbar hides the switch below xl (hidden xl:flex))_

---

## Journey 13: Console hygiene (2 checkpoints; 1 pending) — `journeys/13-console-hygiene.spec.ts`

**Source files:** `app/(app)/layout.tsx`, `lib/iblai/session-fetch.ts`

- [x] Every page loads without a console error or an uncaught exception (two SDK 4xx reads allowed) _(con-01)_
- [ ] No session token appears in the console (compared inside the browser) _(con-02, fixme on next dev — the SDK's development logging prints the session tokens; holds against pnpm start)_

---

## Journey 14: Sample wallet (5 checkpoints) — `journeys/14-sample-wallet.spec.ts`

**Source files:** `app/(app)/layout.tsx`, `app/(app)/page.tsx`, `app/(app)/credentials/page.tsx`, `app/(app)/credentials/[id]/page.tsx`, `app/(app)/resume/page.tsx`, `components/wallet/sample-notice.tsx`, `components/wallet/upgrade-modal.tsx`, `lib/wallet/provider.tsx`, `lib/wallet/sample.ts`

- [x] A member whose only organization is main sees Jordan Rivera's sample wallet under the amber notice _(smp-01)_
- [x] The sample's credentials are listed and one opens _(smp-02)_
- [x] Declining a pending sample credential opens the upgrade dialog and saves nothing _(smp-03)_
- [x] The sample résumé offers no AI draft _(smp-04)_
- [x] The upgrade dialog's Upgrade for free opens the wallet's $0 checkout _(smp-05; skips until web-containers carries `checkoutUrl`, iblai-web-frontend#2195)_
