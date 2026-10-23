import { describe, expect, it } from "vitest";

import { resolveSsoRedirectPath } from "../lib/iblai/sso-redirect";

describe("resolveSsoRedirectPath", () => {
  it("uses the path SsoLogin resolved", () => {
    expect(resolveSsoRedirectPath("/credentials/abc", "")).toBe("/credentials/abc");
  });

  it("falls back to the root when nothing was resolved", () => {
    expect(resolveSsoRedirectPath("", "")).toBe("/");
  });

  it("refuses a resolved path that is not a plain same-origin path", () => {
    expect(resolveSsoRedirectPath(".evil.example/x", "")).toBe("/");
    expect(resolveSsoRedirectPath("@evil.example", "")).toBe("/");
    expect(resolveSsoRedirectPath("//evil.example", "")).toBe("/");
    expect(resolveSsoRedirectPath("https://evil.example/", "")).toBe("/");
    expect(resolveSsoRedirectPath("/\t/evil.example", "")).toBe("/");
  });

  it("refuses the same when it arrives as the explicit path too", () => {
    expect(resolveSsoRedirectPath(".evil.example/x", "?redirect-path=.evil.example%2Fx")).toBe("/");
  });

  describe("an explicit ?redirect-path", () => {
    it("wins when it is a plain same-origin path", () => {
      expect(resolveSsoRedirectPath("/", "?redirect-path=/skills")).toBe("/skills");
    });

    it("keeps the query string it carries", () => {
      expect(resolveSsoRedirectPath("/", "?redirect-path=%2Fcoach%3Fnew%3D1")).toBe("/coach?new=1");
    });

    it("rejects a protocol-relative URL", () => {
      expect(resolveSsoRedirectPath("/home", "?redirect-path=//evil.example.com")).toBe("/home");
    });

    it("rejects a backslash authority", () => {
      expect(resolveSsoRedirectPath("/home", "?redirect-path=/\\evil.example.com")).toBe("/home");
      expect(resolveSsoRedirectPath("/home", "?redirect-path=%2F%5Cevil.example.com")).toBe(
        "/home",
      );
    });

    it("rejects an absolute URL", () => {
      expect(resolveSsoRedirectPath("/home", "?redirect-path=https://evil.example.com")).toBe(
        "/home",
      );
      expect(resolveSsoRedirectPath("/home", "?redirect-path=https%3A%2F%2Fevil.example.com")).toBe(
        "/home",
      );
    });

    it("rejects a relative path with no leading slash", () => {
      expect(resolveSsoRedirectPath("/home", "?redirect-path=evil.example.com")).toBe("/home");
    });

    it("is ignored when empty or absent", () => {
      expect(resolveSsoRedirectPath("/home", "?redirect-path=")).toBe("/home");
      expect(resolveSsoRedirectPath("/home", "?other=1")).toBe("/home");
    });
  });
});
