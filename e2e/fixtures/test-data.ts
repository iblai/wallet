import { SAMPLE_OB2_ASSERTION, SAMPLE_OB3_CREDENTIAL } from "../../lib/wallet/demo-data";

export const APP_HOST = process.env.APP_HOST || "http://localhost:3000";
export const AUTH_HOST = process.env.AUTH_HOST || "https://login.iblai.app";
export const hasMember = !!(
  process.env.PLAYWRIGHT_MEMBER_USERNAME && process.env.PLAYWRIGHT_MEMBER_PASSWORD
);
export const MEMBER_SKIP =
  "no member account in e2e/.env.development (PLAYWRIGHT_MEMBER_*): pnpm e2e:accounts creates one";

/** The badges the journeys import (the import page's own samples) and the names the cleanup looks for. */
export const SAMPLE_OB2 = SAMPLE_OB2_ASSERTION;
export const SAMPLE_OB3 = SAMPLE_OB3_CREDENTIAL;
export const SAMPLE_OB2_NAME = "SQL for Analysts";
export const SAMPLE_OB3_NAME = "Python for Data Work";
export const SAMPLE_ISSUER_HOST = "https://badges.example.org";
export const E2E_RECORD = "E2E record";
export const E2E_CREDENTIAL = new RegExp(`^(${SAMPLE_OB2_NAME}|${SAMPLE_OB3_NAME}|${E2E_RECORD})`);
export const stamp = () => Date.now().toString(36);

/** The sample wallet's fixed facts (lib/wallet/demo-data.ts). */
export const DEMO = {
  name: "Jordan Rivera",
  username: "jordan.rivera",
  org: "demo-wallet",
  verifiedId: "plat-91ab-ml-foundations",
  publicName: "Machine Learning Foundations",
  pendingName: "Generative AI for Educators",
  expiredName: "Texas Notary Public Commission",
  expiringName: "AWS Certified Cloud Practitioner",
  collection: "Analytics applications",
  role: "AI Engineer",
};
