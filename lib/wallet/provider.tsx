"use client";

/**
 * One context for every wallet page. Two sources feed it:
 *
 *  - PlatformSource (signed in): platform credentials via the SDK's
 *    `useProfileCredentials`, skills via `useProfileSkills`, education /
 *    experience / résumé via the career hooks, and everything the user added
 *    in the wallet via `useUserSettings` (per-user platform metadata).
 *  - DemoSource (NEXT_PUBLIC_WALLET_DEMO): the bundled sample wallet, with
 *    edits kept in localStorage so the demo survives a reload. Demo only —
 *    the signed-in app never touches localStorage for wallet data.
 *
 * Both hand `deriveState` the same inputs, so pages never know which one
 * they are on.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import config from "@/lib/iblai/config";
import { useUserSettings } from "@/lib/iblai/metadata";
import { resolveAppTenant } from "@/lib/iblai/tenant";
import { deriveState, fromAssertion } from "./derive";

export { deriveState, fromAssertion };
import {
  DEMO_COLLECTIONS,
  DEMO_CREDENTIALS,
  DEMO_DESIRED_SKILLS,
  DEMO_EDUCATION,
  DEMO_EXPERIENCE,
  DEMO_PROFILE,
  DEMO_SELF_SKILLS,
  DEMO_SKILL_POINTS,
} from "./demo-data";
import {
  WALLET_SETTINGS_DEFAULTS,
  newId,
  type ResumePreferences,
  type WalletCollection,
  type WalletCredential,
  type WalletEducation,
  type WalletExperience,
  type WalletProfile,
  type WalletSettings,
  type WalletState,
} from "./types";

// ---------- actions ----------

export interface WalletActions {
  addCredential: (c: WalletCredential) => Promise<void>;
  updateCredential: (id: string, patch: Partial<WalletCredential>) => Promise<void>;
  removeCredential: (id: string) => Promise<void>;
  addCollection: (name: string, description?: string) => Promise<WalletCollection>;
  updateCollection: (id: string, patch: Partial<WalletCollection>) => Promise<void>;
  removeCollection: (id: string) => Promise<void>;
  setTargetRole: (roleId: string) => Promise<void>;
  addSelfSkill: (name: string, level?: number) => Promise<void>;
  removeSelfSkill: (name: string) => Promise<void>;
  addDesiredSkill: (name: string) => Promise<void>;
  removeDesiredSkill: (name: string) => Promise<void>;
  setResumePrefs: (patch: Partial<ResumePreferences>) => Promise<void>;
  setPublicPage: (v: { handle?: string; enabled?: boolean }) => Promise<void>;
  updateProfile: (patch: Partial<WalletProfile>) => Promise<void>;
  saveEducation: (e: WalletEducation) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;
  saveExperience: (e: WalletExperience) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;
  setOnboardingDone: (done: boolean) => Promise<void>;
  resetDemo: () => void;
  isSaving: boolean;
}

interface WalletContextValue {
  state: WalletState;
  actions: WalletActions;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
  const v = useContext(WalletContext);
  if (!v) throw new Error("useWallet must be used inside <WalletProvider>");
  return v;
}

// ---------- actions over a settings store ----------

type Store = {
  settings: WalletSettings;
  update: (patch: Partial<WalletSettings>) => Promise<void>;
  isSaving: boolean;
};

function useActions(store: Store, platformIds: Set<string>, reset: () => void): WalletActions {
  const { settings, update } = store;
  const creds = useCallback(() => settings.credentials ?? [], [settings.credentials]);

  const updateCredential = useCallback(
    async (id: string, patch: Partial<WalletCredential>) => {
      if (platformIds.has(id) && !creds().some((c) => c.id === id)) {
        // Live platform credential: only the wallet-side fields are ours to change.
        const { acceptance, visibility, collections } = patch;
        const prev = settings.overrides?.[id] ?? {};
        await update({ overrides: { ...settings.overrides, [id]: { ...prev, ...(acceptance && { acceptance }), ...(visibility && { visibility }), ...(collections && { collections }) } } });
        return;
      }
      await update({ credentials: creds().map((c) => (c.id === id ? { ...c, ...patch } : c)) });
    },
    [creds, platformIds, settings.overrides, update],
  );

  return {
    isSaving: store.isSaving,
    addCredential: async (c) => update({ credentials: [...creds().filter((x) => x.id !== c.id), c] }),
    updateCredential,
    removeCredential: async (id) => update({ credentials: creds().filter((c) => c.id !== id) }),
    addCollection: async (name, description) => {
      const col: WalletCollection = { id: newId("col"), name, description, shared: false };
      await update({ collections: [...(settings.collections ?? []), col] });
      return col;
    },
    updateCollection: async (id, patch) => update({ collections: (settings.collections ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
    removeCollection: async (id) =>
      update({
        collections: (settings.collections ?? []).filter((c) => c.id !== id),
        credentials: creds().map((c) => ({ ...c, collections: c.collections.filter((x) => x !== id) })),
      }),
    setTargetRole: async (roleId) => update({ targetRoleId: roleId }),
    addSelfSkill: async (name, level = 3) =>
      update({ selfSkills: [...(settings.selfSkills ?? []).filter((s) => s.name.toLowerCase() !== name.toLowerCase()), { name, level }] }),
    removeSelfSkill: async (name) => update({ selfSkills: (settings.selfSkills ?? []).filter((s) => s.name.toLowerCase() !== name.toLowerCase()) }),
    addDesiredSkill: async (name) => update({ desiredSkills: [...new Set([...(settings.desiredSkills ?? []), name])] }),
    removeDesiredSkill: async (name) => update({ desiredSkills: (settings.desiredSkills ?? []).filter((s) => s.toLowerCase() !== name.toLowerCase()) }),
    setResumePrefs: async (patch) => update({ resume: { ...settings.resume, ...patch } }),
    setPublicPage: async ({ handle, enabled }) => update({ ...(handle !== undefined && { handle }), ...(enabled !== undefined && { publicPageEnabled: enabled }) }),
    updateProfile: async (patch) => update({ profile: { ...settings.profile, ...patch } }),
    saveEducation: async (e) => update({ education: [...(settings.education ?? []).filter((x) => x.id !== e.id), e].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? "")) }),
    removeEducation: async (id) => update({ education: (settings.education ?? []).filter((x) => x.id !== id) }),
    saveExperience: async (e) => update({ experience: [...(settings.experience ?? []).filter((x) => x.id !== e.id), e].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? "")) }),
    removeExperience: async (id) => update({ experience: (settings.experience ?? []).filter((x) => x.id !== id) }),
    setOnboardingDone: async (done) => update({ onboardingDone: done }),
    resetDemo: reset,
  };
}

// ---------- demo source ----------

const DEMO_KEY = "credential-wallet-demo-v1";

function demoSeed(): WalletSettings {
  return {
    ...WALLET_SETTINGS_DEFAULTS,
    handle: "jordan-rivera",
    publicPageEnabled: true,
    targetRoleId: "ai-engineer",
    credentials: DEMO_CREDENTIALS,
    collections: DEMO_COLLECTIONS,
    selfSkills: DEMO_SELF_SKILLS,
    desiredSkills: DEMO_DESIRED_SKILLS,
    education: DEMO_EDUCATION,
    experience: DEMO_EXPERIENCE,
    profile: DEMO_PROFILE,
    onboardingDone: true,
  };
}

function readDemo(): WalletSettings {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) return { ...demoSeed(), ...(JSON.parse(raw) as WalletSettings) };
  } catch {}
  return demoSeed();
}

function DemoSource({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WalletSettings>(demoSeed);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setSettings(readDemo());
    setHydrated(true);
  }, []);

  const update = useCallback(async (patch: Partial<WalletSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(DEMO_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(DEMO_KEY);
    } catch {}
    setSettings(demoSeed());
  }, []);

  const actions = useActions({ settings, update, isSaving: false }, useMemo(() => new Set<string>(), []), reset);
  const state = useMemo(
    () =>
      deriveState({
        profile: DEMO_PROFILE,
        settings,
        platformCredentials: [],
        platformEducation: [],
        platformExperience: [],
        platformEarnedSkills: [{ name: "SQL", points: 620 }, { name: "Data Analysis", points: 540 }, { name: "Python", points: 410 }, { name: "Machine Learning", points: 270 }],
        skillPoints: DEMO_SKILL_POINTS,
        isLoading: !hydrated,
        isDemo: true,
      }),
    [settings, hydrated],
  );

  return <WalletContext.Provider value={{ state, actions }}>{children}</WalletContext.Provider>;
}

// ---------- platform source ----------

function PlatformSource({ children }: { children: ReactNode }) {
  // Loaded lazily so the demo build never evaluates the SDK data hooks.
  const Impl = useMemo(() => platformImpl(), []);
  return <Impl>{children}</Impl>;
}

// The SDK hooks are imported statically (tree-shaken into the client bundle
// either way); the indirection keeps PlatformSource and DemoSource symmetric.
import { useProfileSkills, useUserMetadata } from "@iblai/iblai-js/web-containers";
import { useGetUserCredentialsQuery, useGetUserEducationQuery, useGetUserExperienceQuery, useGetUserResumeQuery } from "@iblai/iblai-js/data-layer";

function platformImpl() {
  return function PlatformImpl({ children }: { children: ReactNode }) {
    const org = resolveAppTenant();
    const username = useMemo(() => {
      try {
        const raw = localStorage.getItem("userData");
        return raw ? ((JSON.parse(raw).user_nicename as string) ?? "") : "";
      } catch {
        return "";
      }
    }, []);

    const store = useUserSettings<WalletSettings>(WALLET_SETTINGS_DEFAULTS);
    // The platform's assertions for this user. The generated client names the
    // path segment `userId`, and the endpoint accepts a username there (see
    // /iblai-api-credential); the SDK's `useProfileCredentials` forgets to
    // pass it, hence the direct query.
    const creds = useGetUserCredentialsQuery(
      { platformKey: org, userId: username, includeExpired: true, includeRevoked: true, pageSize: 100 } as unknown as { platformKey: string },
      { skip: !org || !username },
    );
    const fetchedCredentials = useMemo(() => {
      const r = creds.data as { result?: { results?: unknown[]; data?: unknown[] }; results?: unknown[]; data?: unknown[] } | undefined;
      return (r?.result?.results ?? r?.result?.data ?? r?.results ?? r?.data ?? []) as Parameters<typeof fromAssertion>[0][];
    }, [creds.data]);
    const credsLoading = creds.isLoading;
    const { earnedSkills } = useProfileSkills(false);
    const { userMetaData } = useUserMetadata();
    const edu = useGetUserEducationQuery({ org, username }, { skip: !org || !username });
    const exp = useGetUserExperienceQuery({ org, username }, { skip: !org || !username });
    const resume = useGetUserResumeQuery({ org, username }, { skip: !org || !username });
    // Skill points percentile: the endpoint answers 5xx for users with no
    // points and the data layer retries five times — read it from earned
    // skills instead (sum of resource points) until the platform settles.
    const pts = { data: undefined as { total_points: number; percentile?: number } | undefined };

    const platformCredentials = useMemo(() => (fetchedCredentials ?? []).map(fromAssertion), [fetchedCredentials]);
    const platformIds = useMemo(() => new Set(platformCredentials.map((c) => c.id)), [platformCredentials]);
    const baseActions = useActions(
      { settings: store.settings, update: (p) => store.update(p), isSaving: store.isSaving },
      platformIds,
      () => {},
    );

    const meta = userMetaData as Record<string, unknown> | undefined;
    const profile: WalletProfile = {
      username,
      name: (meta?.name as string) || username,
      email: meta?.email as string | undefined,
      headline: (meta?.title as string) || undefined,
      about: (meta?.bio as string) || undefined,
      image: (meta?.profile_image as { image_url_full?: string } | undefined)?.image_url_full,
    };

    // The public page is served by the server with the org's key, which can
    // read the user's metadata but not their LMS profile — so publishing the
    // page also snapshots the public-safe profile fields into the wallet's
    // namespace (name, headline, about, picture; never the email).
    const actions: WalletActions = {
      ...baseActions,
      setPublicPage: async ({ handle, enabled }) =>
        store.update({
          ...(handle !== undefined && { handle }),
          ...(enabled !== undefined && { publicPageEnabled: enabled }),
          profile: { ...store.settings.profile, name: profile.name, headline: profile.headline, about: profile.about, image: profile.image },
        }),
    };

    const resumeFiles = (resume.data as { files?: { type?: string; file?: string; url?: string }[] } | undefined)?.files ?? [];
    const resumeFileUrl = resumeFiles.find((f) => f.type === "resume")?.file ?? resumeFiles.find((f) => f.type === "resume")?.url;

    const state = useMemo(
      () =>
        deriveState({
          profile,
          settings: store.settings,
          platformCredentials,
          platformEducation: (edu.data ?? []).map((e) => ({
            id: String(e.id),
            institution: e.institution?.name ?? "",
            degree: e.degree ?? undefined,
            fieldOfStudy: e.field_of_study ?? undefined,
            startDate: e.start_date,
            endDate: e.end_date ?? undefined,
            current: !!e.is_current,
            description: e.description ?? undefined,
          })),
          platformExperience: (exp.data ?? []).map((e) => ({
            id: String(e.id),
            company: e.company?.name ?? "",
            title: e.title,
            employmentType: e.employment_type ?? undefined,
            location: e.location ?? undefined,
            startDate: e.start_date,
            endDate: e.end_date ?? undefined,
            current: !!e.is_current,
            description: e.description ?? undefined,
          })),
          platformEarnedSkills: (earnedSkills?.resources ?? []).map((r) => ({ name: (r as { name?: string }).name ?? "", points: (r as { points?: number }).points })).filter((s) => s.name),
          skillPoints: pts.data ? { total: pts.data.total_points, percentile: pts.data.percentile } : undefined,
          resumeFileUrl,
          isLoading: store.isLoading || credsLoading,
          isDemo: false,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [store.settings, store.isLoading, platformCredentials, edu.data, exp.data, earnedSkills, pts.data, resumeFileUrl, credsLoading, username, userMetaData],
    );

    return <WalletContext.Provider value={{ state, actions }}>{children}</WalletContext.Provider>;
  };
}

// ---------- entry ----------

export function WalletProvider({ children }: { children: ReactNode }) {
  return config.demoMode() ? <DemoSource>{children}</DemoSource> : <PlatformSource>{children}</PlatformSource>;
}
