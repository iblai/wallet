import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { proxy } from "../proxy";

// The SDK builds the header from these options (extras are appended to their directive).
vi.mock("@iblai/iblai-js/security/next", () => ({
  applyCsp: (_request: unknown, options: unknown) => options,
}));

describe("the CSP proxy", () => {
  it("lets the browser reach any https host: issuers host their badges, and chat uploads go to S3", () => {
    const request = {
      headers: new Headers(),
      nextUrl: { pathname: "/verify/x" },
    } as unknown as NextRequest;
    const options = proxy(request) as unknown as { connectSrc: string[]; frameAncestors: string };
    expect(options.connectSrc).toContain("https:");
    expect(options.frameAncestors).toBe("none");
  });
});
