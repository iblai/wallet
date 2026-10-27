#!/usr/bin/env node
// pnpm e2e:accounts — creates the two Playwright test accounts, an organization
// admin and a member, in the organization iblai.env names (PLATFORM) with its
// Platform API Token (TOKEN), after the platform confirms the token belongs to
// that organization. Saves them in the gitignored e2e/.env.development; a pair
// already saved there is kept (delete it to get a new account). Prints
// usernames only: never a password, never the token.
//
// The host's IBLAI_PLATFORM_KEY / IBLAI_API_KEY (the ibl.ai desktop app exports
// them) win over iblai.env. .env.local is read for the API base only: the
// wallet keeps no secret there, and its NEXT_PUBLIC_MAIN_TENANT_KEY is the
// community organization, never a test target.
import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const CONNECT =
  "run /iblai-vibe-connect from an empty directory, pick a throwaway organization on the connect page (never main) and move its iblai.env here — from this root it would rewrite NEXT_PUBLIC_MAIN_TENANT_KEY.";

const ROLES = [
  {
    role: "admin",
    prefix: "e2e-adm",
    name: "E2E Admin",
    isAdmin: true,
    keys: ["PLAYWRIGHT_USERNAME", "PLAYWRIGHT_PASSWORD"],
  },
  {
    role: "member",
    prefix: "e2e-mem",
    name: "E2E Member",
    isAdmin: false,
    keys: ["PLAYWRIGHT_MEMBER_USERNAME", "PLAYWRIGHT_MEMBER_PASSWORD"],
  },
];

/** A fresh account. Platform usernames are [\w.@+-], at most 30 characters. */
export function newAccount(prefix) {
  const username = `${prefix}-${randomBytes(4).toString("hex")}`;
  // base64url holds nothing dotenv reads specially; the suffix satisfies rules that want a digit, a capital and a symbol.
  return {
    username,
    email: `${username}@example.com`,
    password: `${randomBytes(18).toString("base64url")}-Aa1`,
  };
}

/** The organization to create the accounts in: the connected one, never the community one. */
export function resolveOrg({ iblai = {}, env = {} }) {
  const org = env.IBLAI_PLATFORM_KEY || iblai.PLATFORM || "";
  if (!org) throw new Error(`No PLATFORM in iblai.env: ${CONNECT}`);
  if (org === "main" || org.startsWith("your-"))
    throw new Error(`PLATFORM is "${org}", a placeholder: ${CONNECT}`);
  return org;
}

/** Set KEY=value lines: replaced in place when present, appended otherwise. */
export function mergeEnv(text, values) {
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    text = re.test(text)
      ? text.replace(re, () => line)
      : `${text}${text && !text.endsWith("\n") ? "\n" : ""}${line}\n`;
  }
  return text;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function main() {
  const at = (name) => fileURLToPath(new URL(name, import.meta.url));
  const read = (file) => (existsSync(file) ? readFileSync(file, "utf8") : "");
  const iblai = dotenv.parse(read(at("../iblai.env")));
  const local = dotenv.parse(read(at("../.env.local")));
  let org;
  try {
    org = resolveOrg({ iblai, env: process.env });
  } catch (err) {
    fail(err.message);
  }
  const token = process.env.IBLAI_API_KEY || iblai.TOKEN;
  if (!token) fail(`No TOKEN in iblai.env: ${CONNECT}`);
  const api = `${(local.NEXT_PUBLIC_API_BASE_URL || "https://api.iblai.app").replace(/\/$/, "")}/dm/api`;
  const headers = { Authorization: `Api-Token ${token}` };

  // A Platform API Token acts in one organization; the platform answers 200 only for that one.
  const probe = await fetch(`${api}/core/platform/users/?platform_key=${org}&page_size=1`, {
    headers,
  });
  if (probe.status !== 200)
    fail(
      `The token in iblai.env is not a Platform API Token for "${org}" (HTTP ${probe.status}): run /iblai-vibe-connect --org ${org} from an empty directory to mint one there.`,
    );

  const post = async (path, body, type = "application/json") => {
    const res = await fetch(api + path, {
      method: "POST",
      headers: { ...headers, "Content-Type": type },
      body: JSON.stringify(body),
    });
    return { status: res.status, text: await res.text() };
  };

  const createUser = async (account, name, role) => {
    const body = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      userName: account.username,
      name: { formatted: name },
      emails: [{ value: account.email, primary: true }],
      password: account.password,
      active: true,
    };
    for (let attempt = 1; ; attempt++) {
      const res = await post(`/orgs/${org}/scim/v2/Users`, body, "application/scim+json");
      // 201: created. 200: the name already exists — ours only when it answers a retry.
      if (res.status === 201 || (res.status === 200 && attempt > 1)) return JSON.parse(res.text).id;
      if (res.status === 200)
        fail(`${role}: ${account.username} is taken; run again for a new name.`);
      // 500 right after a create: the account is still propagating; the retry finds it.
      if (res.status !== 500 || attempt === 4)
        fail(
          `${role}: creating ${account.username} failed: HTTP ${res.status} ${res.text.slice(0, 300)}`,
        );
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
  };

  const envFile = at(".env.development");
  let text = read(envFile) || read(at(".env.development.example"));
  for (const {
    role,
    prefix,
    name,
    isAdmin,
    keys: [userKey, passKey],
  } of ROLES) {
    const saved = dotenv.parse(text);
    if (saved[userKey] && saved[passKey]) {
      console.log(`${role}: ${saved[userKey].split("@")[0]} (already set)`);
      continue;
    }
    const account = newAccount(prefix);
    const id = await createUser(account, name, role);
    const link = await post("/core/users/platforms/", {
      user_id: id,
      platform_key: org,
      active: true,
      is_admin: isAdmin,
    });
    if (link.status >= 300)
      fail(
        `${role}: adding ${account.username} to the organization failed: HTTP ${link.status} ${link.text.slice(0, 300)}`,
      );
    text = mergeEnv(text, { [userKey]: account.email, [passKey]: account.password });
    writeFileSync(envFile, text);
    chmodSync(envFile, 0o600);
    console.log(`${role}: ${account.username} (created)`);
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url))
  await main();
