import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * lib/iblai/tenant.ts — org resolution prefers the session's own org over a
 * stale pin, and admin detection reads the `tenants` list the sign-in
 * persisted, never the SDK's notion of "current tenant".
 */

const load = async () => await import("../lib/iblai/tenant");

function stubWindow(store: Record<string, string>) {
  const ls = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };
  vi.stubGlobal("window", { localStorage: ls });
  vi.stubGlobal("localStorage", ls);
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  process.env.NEXT_PUBLIC_MAIN_TENANT_KEY = "acme";
});

describe("resolveAppTenant", () => {
  it("keeps a pin the session's tenants confirm", async () => {
    stubWindow({
      app_tenant: "other",
      tenant: "acme",
      tenants: JSON.stringify([{ key: "acme" }, { key: "other" }]),
    });
    expect((await load()).resolveAppTenant()).toBe("other");
  });

  it("drops a pin the session disowns and uses the sign-in's org", async () => {
    const store: Record<string, string> = {
      app_tenant: "main",
      tenant: "acme",
      tenants: JSON.stringify([{ key: "acme" }]),
    };
    stubWindow(store);
    expect((await load()).resolveAppTenant()).toBe("acme");
    // The stale pin is removed, so it cannot outrank the session again.
    expect(store.app_tenant).toBeUndefined();
  });

  it("reads the key from `tenant`, never from a (possibly stale) `current_tenant` record", async () => {
    stubWindow({
      tenant: "acme",
      current_tenant: JSON.stringify({ key: "stale", org: "stale", platform_name: "Old" }),
      tenants: JSON.stringify([{ key: "acme" }]),
    });
    expect((await load()).resolveAppTenant()).toBe("acme");
  });

  it("keeps a pin while no tenants list has been stored yet", async () => {
    stubWindow({ app_tenant: "other" });
    expect((await load()).resolveAppTenant()).toBe("other");
  });

  it("falls back to the community org when signed out", async () => {
    stubWindow({});
    expect((await load()).resolveAppTenant()).toBe("acme");
  });
});

describe("isTenantAdmin", () => {
  it("is true only when the pinned org's entry says is_admin", async () => {
    stubWindow({
      app_tenant: "acme",
      tenants: JSON.stringify([{ key: "main" }, { key: "acme", is_admin: true }]),
    });
    const { isTenantAdmin } = await load();
    expect(isTenantAdmin()).toBe(true);
  });

  it("is false for a member, for another org's admin, and when signed out", async () => {
    stubWindow({
      tenants: JSON.stringify([
        { key: "acme", is_admin: false },
        { key: "other", is_admin: true },
      ]),
    });
    let mod = await load();
    expect(mod.isTenantAdmin()).toBe(false);

    vi.resetModules();
    stubWindow({});
    mod = await load();
    expect(mod.isTenantAdmin()).toBe(false);
  });

  it("survives a corrupt tenants entry", async () => {
    stubWindow({ tenants: "{not json" });
    const { isTenantAdmin, readTenants } = await load();
    expect(readTenants()).toEqual([]);
    expect(isTenantAdmin()).toBe(false);
  });
});

describe("tenantKeyOf", () => {
  it("passes a bare key through and drops the empty and stringified-null cases", async () => {
    const { tenantKeyOf } = await import("../lib/iblai/tenant");
    expect(tenantKeyOf("acme")).toBe("acme");
    expect(tenantKeyOf("null")).toBe("");
    expect(tenantKeyOf("undefined")).toBe("");
    expect(tenantKeyOf("")).toBe("");
    expect(tenantKeyOf(null)).toBe("");
  });
});
