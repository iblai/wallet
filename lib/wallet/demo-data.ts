/**
 * The sample wallet shown in demo mode (NEXT_PUBLIC_WALLET_DEMO=true).
 * One learner, "Jordan Rivera", with the mix a real wallet accumulates: a
 * degree, platform-issued micro-credentials, a Credly badge, a vendor
 * certification that is about to expire, a pending badge, a self-reported
 * license, and the education / experience that goes with them.
 */
import type { WalletCredential, WalletEducation, WalletExperience, WalletProfile } from "./types";

const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

export const DEMO_PROFILE: WalletProfile = {
  username: "jordan.rivera",
  name: "Jordan Rivera",
  email: "jordan.rivera@example.com",
  headline: "Data analyst moving toward data science",
  location: "Austin, TX",
  about: "Analyst with four years in ed-tech reporting. Building toward applied machine learning.",
  links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/jordan-rivera-demo" }],
};

export const DEMO_CREDENTIALS: WalletCredential[] = [
  {
    id: "plat-7d3c1a2e-bsds",
    source: "platform",
    kind: "degree",
    name: "Bachelor of Science, Data Analytics",
    description: "Competency-based bachelor's degree covering statistics, data management, visualization, and predictive modeling.",
    issuer: { name: "Western Governors University", url: "https://www.wgu.edu", image: "https://placehold.co/96x96/0058cc/ffffff.png?text=WGU" },
    issuedOn: "2024-06-15T00:00:00.000Z",
    image: "https://placehold.co/240x240/eef6fc/0058cc.png?text=B.S.+Data+Analytics",
    criteria: "Completion of 120 competency units including the capstone project.",
    skills: ["SQL", "Data Analysis", "Statistics", "Data Visualization", "Python", "Data Cleaning"],
    acceptance: "accepted",
    visibility: "public",
    verification: { level: "platform", url: "https://api.iblai.app/dm/api/credentials/public/assertions/7d3c1a2e-bsds/", format: "platform" },
    collections: ["col-analytics"],
    context: { program: "B.S. Data Analytics" },
    addedAt: "2024-06-15T00:00:00.000Z",
  },
  {
    id: "plat-91ab-ml-foundations",
    source: "platform",
    kind: "micro-credential",
    name: "Machine Learning Foundations",
    description: "Supervised and unsupervised learning, model evaluation, and feature engineering, assessed through three graded projects.",
    issuer: { name: "ibl.ai Academy", url: "https://ibl.ai", image: "https://placehold.co/96x96/00b0ef/ffffff.png?text=ibl" },
    issuedOn: "2025-09-02T00:00:00.000Z",
    image: "https://placehold.co/240x240/0058cc/ffffff.png?text=ML+Foundations",
    criteria: "Pass all three projects with a score of 80% or higher.",
    skills: ["Machine Learning", "Python", "Statistics", "Experiment Design"],
    acceptance: "accepted",
    visibility: "public",
    verification: { level: "platform", url: "https://api.iblai.app/dm/api/credentials/public/assertions/91ab-ml-foundations/", format: "platform" },
    collections: ["col-analytics"],
    context: { course: "course-v1:ibl+ML101+2025" },
    addedAt: "2025-09-02T00:00:00.000Z",
  },
  {
    id: "https://www.credly.com/badges/3f2a9c1e-demo-google-data-analytics",
    source: "imported",
    kind: "certificate",
    name: "Google Data Analytics Professional Certificate",
    description: "Eight-course program on data cleaning, analysis, and visualization with spreadsheets, SQL, R and Tableau.",
    issuer: { name: "Google", url: "https://grow.google/certificates", image: "https://placehold.co/96x96/f3f4f6/1f2937.png?text=G" },
    issuedOn: "2023-11-20T00:00:00.000Z",
    image: "https://placehold.co/240x240/fef3c7/92400e.png?text=Google+Data+Analytics",
    criteria: "Complete all eight courses and the capstone case study.",
    skills: ["Data Analysis", "SQL", "Tableau", "Spreadsheets", "Data Cleaning", "Data Visualization"],
    acceptance: "accepted",
    visibility: "public",
    verification: { level: "hosted", url: "https://www.credly.com/badges/3f2a9c1e-demo-google-data-analytics", checkedAt: "2026-10-01T00:00:00.000Z", format: "credly" },
    collections: ["col-analytics"],
    addedAt: "2023-11-21T00:00:00.000Z",
  },
  {
    id: "https://badges.example-cloud.com/assertions/aws-ccp-2024",
    source: "imported",
    kind: "certificate",
    name: "AWS Certified Cloud Practitioner",
    description: "Foundational understanding of AWS Cloud concepts, services, security, architecture, pricing, and support.",
    issuer: { name: "Amazon Web Services Training and Certification", url: "https://aws.amazon.com/certification/", image: "https://placehold.co/96x96/232f3e/ff9900.png?text=AWS" },
    issuedOn: "2024-01-10T00:00:00.000Z",
    expires: daysFromNow(45),
    image: "https://placehold.co/240x240/232f3e/ff9900.png?text=AWS+CCP",
    criteria: "Pass the CLF-C02 exam.",
    skills: ["Cloud Computing", "AWS", "Security"],
    acceptance: "accepted",
    visibility: "private",
    verification: { level: "hosted", url: "https://badges.example-cloud.com/assertions/aws-ccp-2024", format: "ob2" },
    collections: [],
    addedAt: "2024-01-12T00:00:00.000Z",
  },
  {
    id: "plat-c0ffee-genai-educators",
    source: "platform",
    kind: "badge",
    name: "Generative AI for Educators",
    description: "Designing learning activities with LLMs responsibly: prompting, evaluation, and academic integrity.",
    issuer: { name: "ibl.ai Academy", url: "https://ibl.ai", image: "https://placehold.co/96x96/00b0ef/ffffff.png?text=ibl" },
    issuedOn: daysFromNow(-3),
    image: "https://placehold.co/240x240/00b0ef/ffffff.png?text=GenAI",
    criteria: "Submit a lesson plan using at least two AI-assisted activities and pass peer review.",
    skills: ["Generative AI", "Prompt Engineering", "Instructional Design"],
    acceptance: "pending",
    visibility: "private",
    verification: { level: "platform", url: "https://api.iblai.app/dm/api/credentials/public/assertions/c0ffee-genai-educators/", format: "platform" },
    collections: [],
    context: { course: "course-v1:ibl+GENAI200+2026" },
    addedAt: daysFromNow(-3),
  },
  {
    id: "wal_self_texas_notary",
    source: "self",
    kind: "license",
    name: "Texas Notary Public Commission",
    issuer: { name: "Texas Secretary of State", url: "https://www.sos.state.tx.us" },
    issuedOn: "2022-08-01T00:00:00.000Z",
    expires: "2026-07-31T00:00:00.000Z",
    skills: [],
    acceptance: "accepted",
    visibility: "private",
    verification: { level: "self", format: "manual" },
    evidence: [{ name: "Commission certificate (PDF)", description: "Scanned copy kept locally." }],
    collections: [],
    addedAt: "2022-08-05T00:00:00.000Z",
  },
  {
    id: "https://badges.example-university.edu/ob3/scrum-fundamentals-2025",
    source: "imported",
    kind: "badge",
    name: "Scrum Fundamentals",
    description: "Scrum roles, events, and artifacts applied in a simulated two-sprint project.",
    issuer: { name: "Austin Community College", url: "https://www.austincc.edu", image: "https://placehold.co/96x96/0f766e/ffffff.png?text=ACC" },
    issuedOn: "2025-03-14T00:00:00.000Z",
    image: "https://placehold.co/240x240/ccfbf1/0f766e.png?text=Scrum",
    criteria: "Complete the two-sprint simulation and the retrospective write-up.",
    skills: ["Scrum", "Agile", "Communication"],
    acceptance: "accepted",
    visibility: "public",
    verification: { level: "signed", url: "https://badges.example-university.edu/ob3/scrum-fundamentals-2025", format: "ob3" },
    collections: [],
    addedAt: "2025-03-15T00:00:00.000Z",
  },
];

export const DEMO_EDUCATION: WalletEducation[] = [
  { id: "edu-1", institution: "Western Governors University", degree: "B.S.", fieldOfStudy: "Data Analytics", startDate: "2022-01-01", endDate: "2024-06-15", description: "Capstone: churn prediction for a community college enrollment office." },
  { id: "edu-2", institution: "Austin Community College", degree: "A.A.S.", fieldOfStudy: "Computer Programming", startDate: "2019-08-01", endDate: "2021-05-15" },
];

export const DEMO_EXPERIENCE: WalletExperience[] = [
  { id: "exp-1", company: "Bright Path Learning", title: "Data Analyst", employmentType: "Full-time", location: "Austin, TX", startDate: "2022-07-01", current: true, description: "Own the weekly enrollment and engagement reporting for 40 partner schools.\nBuilt the Tableau dashboard that replaced a 12-tab spreadsheet; cut report prep from 6 hours to 20 minutes.\nWrote the SQL models behind the retention alerts program." },
  { id: "exp-2", company: "Bright Path Learning", title: "Reporting Specialist", employmentType: "Full-time", location: "Austin, TX", startDate: "2021-06-01", endDate: "2022-06-30", description: "Produced district reports and cleaned student-information-system exports." },
];

export const DEMO_SELF_SKILLS = [
  { name: "Communication", level: 4 },
  { name: "Excel", level: 5 },
];

export const DEMO_DESIRED_SKILLS = ["Deep Learning", "Cloud Computing"];

export const DEMO_COLLECTIONS = [
  { id: "col-analytics", name: "Analytics applications", description: "What I send with data roles.", shared: true },
];

export const DEMO_SKILL_POINTS = { total: 1840, percentile: 72 };

/** A real-looking Open Badges 2.0 assertion for the import page's "try a sample" button. */
export const SAMPLE_OB2_ASSERTION = {
  "@context": "https://w3id.org/openbadges/v2",
  type: "Assertion",
  id: "https://badges.example.org/assertions/5a1f-sql-for-analysts",
  recipient: { type: "email", hashed: false, identity: "jordan.rivera@example.com" },
  issuedOn: "2026-02-11T00:00:00Z",
  verification: { type: "hosted" },
  badge: {
    type: "BadgeClass",
    id: "https://badges.example.org/badges/sql-for-analysts",
    name: "SQL for Analysts",
    description: "Window functions, CTEs, and query tuning on a 50-million-row warehouse.",
    image: "https://placehold.co/240x240/eef6fc/0058cc.png?text=SQL",
    criteria: { narrative: "Pass the timed practical with 85% or better." },
    issuer: { type: "Profile", id: "https://badges.example.org/issuer", name: "Example Data School", url: "https://badges.example.org", email: "badges@example.org" },
    tags: ["SQL", "Data Analysis"],
    alignment: [{ targetName: "Business Intelligence", targetUrl: "https://example.org/skills/bi" }],
  },
};

/** The same achievement as an Open Badges 3.0 credential. */
export const SAMPLE_OB3_CREDENTIAL = {
  "@context": ["https://www.w3.org/ns/credentials/v2", "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"],
  id: "https://badges.example.org/ob3/credentials/9c2e-python-for-data",
  type: ["VerifiableCredential", "OpenBadgeCredential"],
  name: "Python for Data Work",
  issuer: { id: "https://badges.example.org/issuer", type: ["Profile"], name: "Example Data School", url: "https://badges.example.org" },
  validFrom: "2026-05-04T00:00:00Z",
  credentialSubject: {
    type: ["AchievementSubject"],
    achievement: {
      id: "https://badges.example.org/ob3/achievements/python-for-data",
      type: ["Achievement"],
      achievementType: "MicroCredential",
      name: "Python for Data Work",
      description: "pandas, plotting, and reproducible notebooks for analysts.",
      criteria: { narrative: "Three graded notebooks and a peer-reviewed analysis." },
      image: { id: "https://placehold.co/240x240/0058cc/ffffff.png?text=Python", type: "Image" },
      alignment: [{ type: ["Alignment"], targetName: "Python" }, { type: ["Alignment"], targetName: "Data Visualization" }],
    },
  },
  proof: [{ type: "DataIntegrityProof", cryptosuite: "eddsa-rdfc-2022", created: "2026-05-04T00:00:00Z", proofPurpose: "assertionMethod", verificationMethod: "https://badges.example.org/issuer#key-1", proofValue: "z3FXQjecWufY…" }],
};
