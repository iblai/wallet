/**
 * Market knowledge the wallet reasons with.
 *
 * What Credly and the WGU Achievement Wallet add on top of "a folder of
 * PDFs" is context: every credential maps to skills, every skill maps to
 * roles, and the learner can see the distance between what they hold and
 * what a target job asks for. This module is that layer, as data:
 *
 *  - `ROLES`     — target roles with the skills employers ask for, weighted
 *                  (core vs. supporting), and illustrative labor-market
 *                  figures (US, rounded; sourced from public BLS / typical
 *                  job-posting ranges — treat as guidance, not an offer).
 *  - `SKILL_ALIASES` — spelling variants so "JS" and "JavaScript" match.
 *  - `gapAnalysis()` — coverage of a role by the wallet's skills, the gaps,
 *                  and what to earn next.
 *
 * Swap this file for a live taxonomy (Lightcast, O*NET, WGU Skills Library,
 * your org's own) without touching the pages.
 */
import type { WalletCredential, WalletSkill } from "./types";

export interface RoleSkill {
  name: string;
  /** 3 = core, 2 = expected, 1 = nice to have. */
  weight: 1 | 2 | 3;
}

export interface Role {
  id: string;
  title: string;
  family: string;
  summary: string;
  skills: RoleSkill[];
  /** Illustrative US figures, rounded. */
  market: {
    medianSalaryUsd: number;
    salaryRangeUsd: [number, number];
    /** Projected 10-year growth, percent. */
    growthPct: number;
    demand: "very high" | "high" | "steady" | "cooling";
    typicalCredentials: string[];
  };
}

export const ROLES: Role[] = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    family: "Data & Analytics",
    summary: "Turns raw data into decisions: queries, dashboards, and clear explanations of what changed and why.",
    skills: [
      { name: "SQL", weight: 3 },
      { name: "Data Analysis", weight: 3 },
      { name: "Data Visualization", weight: 3 },
      { name: "Excel", weight: 2 },
      { name: "Python", weight: 2 },
      { name: "Statistics", weight: 2 },
      { name: "Tableau", weight: 2 },
      { name: "Communication", weight: 2 },
      { name: "Business Intelligence", weight: 1 },
      { name: "Data Cleaning", weight: 1 },
    ],
    market: { medianSalaryUsd: 84000, salaryRangeUsd: [58000, 125000], growthPct: 23, demand: "very high", typicalCredentials: ["Google Data Analytics Professional Certificate", "Microsoft Power BI Data Analyst", "Tableau Desktop Specialist"] },
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    family: "Data & Analytics",
    summary: "Builds and evaluates models, designs experiments, and ships insight into products.",
    skills: [
      { name: "Python", weight: 3 },
      { name: "Machine Learning", weight: 3 },
      { name: "Statistics", weight: 3 },
      { name: "SQL", weight: 2 },
      { name: "Data Visualization", weight: 2 },
      { name: "Experiment Design", weight: 2 },
      { name: "Deep Learning", weight: 1 },
      { name: "Cloud Computing", weight: 1 },
      { name: "Communication", weight: 2 },
    ],
    market: { medianSalaryUsd: 112000, salaryRangeUsd: [78000, 170000], growthPct: 36, demand: "very high", typicalCredentials: ["IBM Data Science Professional Certificate", "AWS Certified Machine Learning", "M.S. Data Science"] },
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    family: "Software",
    summary: "Designs, writes, tests and operates software that other people depend on.",
    skills: [
      { name: "JavaScript", weight: 3 },
      { name: "Software Engineering", weight: 3 },
      { name: "Git", weight: 3 },
      { name: "Testing", weight: 2 },
      { name: "React", weight: 2 },
      { name: "TypeScript", weight: 2 },
      { name: "Python", weight: 2 },
      { name: "Cloud Computing", weight: 2 },
      { name: "SQL", weight: 1 },
      { name: "Agile", weight: 1 },
      { name: "Communication", weight: 2 },
    ],
    market: { medianSalaryUsd: 130000, salaryRangeUsd: [80000, 190000], growthPct: 17, demand: "high", typicalCredentials: ["B.S. Computer Science / Software Engineering", "AWS Certified Developer", "Meta Front-End Developer Certificate"] },
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    family: "Infrastructure",
    summary: "Builds and runs reliable, secure, cost-aware infrastructure on public clouds.",
    skills: [
      { name: "Cloud Computing", weight: 3 },
      { name: "AWS", weight: 3 },
      { name: "Linux", weight: 3 },
      { name: "Networking", weight: 2 },
      { name: "Infrastructure as Code", weight: 2 },
      { name: "Python", weight: 2 },
      { name: "Kubernetes", weight: 2 },
      { name: "Security", weight: 2 },
      { name: "CI/CD", weight: 1 },
    ],
    market: { medianSalaryUsd: 125000, salaryRangeUsd: [85000, 175000], growthPct: 21, demand: "very high", typicalCredentials: ["AWS Certified Solutions Architect", "Google Cloud Associate Engineer", "CompTIA Cloud+"] },
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    family: "Security",
    summary: "Monitors, detects and responds to threats; hardens systems and people.",
    skills: [
      { name: "Security", weight: 3 },
      { name: "Networking", weight: 3 },
      { name: "Incident Response", weight: 3 },
      { name: "Linux", weight: 2 },
      { name: "Risk Management", weight: 2 },
      { name: "SIEM", weight: 2 },
      { name: "Python", weight: 1 },
      { name: "Cloud Computing", weight: 1 },
      { name: "Communication", weight: 1 },
    ],
    market: { medianSalaryUsd: 120000, salaryRangeUsd: [75000, 165000], growthPct: 33, demand: "very high", typicalCredentials: ["CompTIA Security+", "CISSP", "Google Cybersecurity Professional Certificate", "B.S. Cybersecurity and Information Assurance"] },
  },
  {
    id: "project-manager",
    title: "Project Manager",
    family: "Business",
    summary: "Gets cross-functional work delivered on scope, time and budget.",
    skills: [
      { name: "Project Management", weight: 3 },
      { name: "Communication", weight: 3 },
      { name: "Agile", weight: 2 },
      { name: "Risk Management", weight: 2 },
      { name: "Leadership", weight: 2 },
      { name: "Budgeting", weight: 2 },
      { name: "Stakeholder Management", weight: 2 },
      { name: "Scrum", weight: 1 },
      { name: "Excel", weight: 1 },
    ],
    market: { medianSalaryUsd: 98000, salaryRangeUsd: [65000, 145000], growthPct: 6, demand: "steady", typicalCredentials: ["PMP", "CAPM", "Google Project Management Certificate", "Certified ScrumMaster"] },
  },
  {
    id: "product-manager",
    title: "Product Manager",
    family: "Business",
    summary: "Decides what gets built and why, and proves it with outcomes.",
    skills: [
      { name: "Product Management", weight: 3 },
      { name: "Communication", weight: 3 },
      { name: "User Research", weight: 2 },
      { name: "Data Analysis", weight: 2 },
      { name: "Agile", weight: 2 },
      { name: "Roadmapping", weight: 2 },
      { name: "SQL", weight: 1 },
      { name: "Leadership", weight: 2 },
      { name: "UX Design", weight: 1 },
    ],
    market: { medianSalaryUsd: 135000, salaryRangeUsd: [90000, 195000], growthPct: 10, demand: "high", typicalCredentials: ["Pragmatic Institute PMC", "Product School PMC", "MBA"] },
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    family: "Design",
    summary: "Researches, prototypes and tests the experience people actually have.",
    skills: [
      { name: "UX Design", weight: 3 },
      { name: "User Research", weight: 3 },
      { name: "Prototyping", weight: 3 },
      { name: "Figma", weight: 2 },
      { name: "Accessibility", weight: 2 },
      { name: "Information Architecture", weight: 2 },
      { name: "Communication", weight: 2 },
      { name: "HTML/CSS", weight: 1 },
    ],
    market: { medianSalaryUsd: 100000, salaryRangeUsd: [65000, 145000], growthPct: 16, demand: "high", typicalCredentials: ["Google UX Design Professional Certificate", "Nielsen Norman Group UX Certification"] },
  },
  {
    id: "registered-nurse",
    title: "Registered Nurse",
    family: "Healthcare",
    summary: "Delivers and coordinates patient care across settings.",
    skills: [
      { name: "Patient Care", weight: 3 },
      { name: "Clinical Assessment", weight: 3 },
      { name: "Nursing", weight: 3 },
      { name: "Pharmacology", weight: 2 },
      { name: "Electronic Health Records", weight: 2 },
      { name: "Communication", weight: 2 },
      { name: "Critical Thinking", weight: 2 },
      { name: "Leadership", weight: 1 },
    ],
    market: { medianSalaryUsd: 86000, salaryRangeUsd: [62000, 130000], growthPct: 6, demand: "high", typicalCredentials: ["RN License (NCLEX-RN)", "BSN", "BLS/ACLS"] },
  },
  {
    id: "k12-teacher",
    title: "K-12 Teacher",
    family: "Education",
    summary: "Plans, teaches and assesses learning for a classroom of students.",
    skills: [
      { name: "Instructional Design", weight: 3 },
      { name: "Classroom Management", weight: 3 },
      { name: "Assessment", weight: 2 },
      { name: "Communication", weight: 3 },
      { name: "Educational Technology", weight: 2 },
      { name: "Differentiated Instruction", weight: 2 },
      { name: "Special Education", weight: 1 },
    ],
    market: { medianSalaryUsd: 63000, salaryRangeUsd: [45000, 95000], growthPct: 1, demand: "steady", typicalCredentials: ["State Teaching License", "B.A. Elementary / Secondary Education", "M.Ed."] },
  },
  {
    id: "instructional-designer",
    title: "Instructional Designer",
    family: "Education",
    summary: "Designs courses and learning experiences that measurably change what people can do.",
    skills: [
      { name: "Instructional Design", weight: 3 },
      { name: "Learning Science", weight: 2 },
      { name: "Educational Technology", weight: 3 },
      { name: "Assessment", weight: 2 },
      { name: "Project Management", weight: 2 },
      { name: "Communication", weight: 2 },
      { name: "Accessibility", weight: 2 },
      { name: "Video Production", weight: 1 },
      { name: "Generative AI", weight: 1 },
    ],
    market: { medianSalaryUsd: 78000, salaryRangeUsd: [55000, 115000], growthPct: 7, demand: "steady", typicalCredentials: ["M.S. Learning Experience Design", "ATD Instructional Design Certificate", "Articulate Storyline"] },
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    family: "Software",
    summary: "Ships LLM- and ML-powered features: retrieval, evaluation, agents, and the plumbing around them.",
    skills: [
      { name: "Python", weight: 3 },
      { name: "Generative AI", weight: 3 },
      { name: "Machine Learning", weight: 3 },
      { name: "Prompt Engineering", weight: 2 },
      { name: "Software Engineering", weight: 2 },
      { name: "Cloud Computing", weight: 2 },
      { name: "Data Engineering", weight: 2 },
      { name: "Evaluation", weight: 2 },
      { name: "TypeScript", weight: 1 },
    ],
    market: { medianSalaryUsd: 150000, salaryRangeUsd: [100000, 220000], growthPct: 40, demand: "very high", typicalCredentials: ["AWS Certified AI Practitioner", "Google Professional ML Engineer", "DeepLearning.AI specializations"] },
  },
];

/** Spelling variants → canonical skill name used in ROLES. */
export const SKILL_ALIASES: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ecmascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  "react.js": "React",
  reactjs: "React",
  py: "Python",
  "python 3": "Python",
  "python programming": "Python",
  "structured query language": "SQL",
  postgres: "SQL",
  postgresql: "SQL",
  mysql: "SQL",
  "data analytics": "Data Analysis",
  analytics: "Data Analysis",
  "data viz": "Data Visualization",
  dashboards: "Data Visualization",
  "power bi": "Business Intelligence",
  "microsoft excel": "Excel",
  spreadsheets: "Excel",
  "amazon web services": "AWS",
  "aws cloud": "AWS",
  cloud: "Cloud Computing",
  "google cloud": "Cloud Computing",
  gcp: "Cloud Computing",
  azure: "Cloud Computing",
  k8s: "Kubernetes",
  docker: "Kubernetes",
  terraform: "Infrastructure as Code",
  iac: "Infrastructure as Code",
  "continuous integration": "CI/CD",
  devops: "CI/CD",
  cybersecurity: "Security",
  "information security": "Security",
  infosec: "Security",
  "network security": "Security",
  "threat detection": "Incident Response",
  splunk: "SIEM",
  ml: "Machine Learning",
  "statistical analysis": "Statistics",
  "a/b testing": "Experiment Design",
  llm: "Generative AI",
  llms: "Generative AI",
  "large language models": "Generative AI",
  "generative ai": "Generative AI",
  "ai": "Generative AI",
  "artificial intelligence": "Machine Learning",
  "prompt design": "Prompt Engineering",
  scrum: "Scrum",
  "agile methodologies": "Agile",
  "agile project management": "Agile",
  "project planning": "Project Management",
  "stakeholder engagement": "Stakeholder Management",
  "public speaking": "Communication",
  "written communication": "Communication",
  presentation: "Communication",
  "team leadership": "Leadership",
  management: "Leadership",
  "ux": "UX Design",
  "user experience": "UX Design",
  "user experience design": "UX Design",
  "ui design": "UX Design",
  wireframing: "Prototyping",
  "usability testing": "User Research",
  "learning design": "Instructional Design",
  "curriculum design": "Instructional Design",
  "curriculum development": "Instructional Design",
  "course design": "Instructional Design",
  edtech: "Educational Technology",
  "lms": "Educational Technology",
  "learning management systems": "Educational Technology",
  "wcag": "Accessibility",
  "a11y": "Accessibility",
  "html": "HTML/CSS",
  "css": "HTML/CSS",
  "unit testing": "Testing",
  "test automation": "Testing",
  qa: "Testing",
  "version control": "Git",
  github: "Git",
  "software development": "Software Engineering",
  programming: "Software Engineering",
  "nursing care": "Patient Care",
  ehr: "Electronic Health Records",
  epic: "Electronic Health Records",
  "data pipelines": "Data Engineering",
  etl: "Data Engineering",
  "product strategy": "Product Management",
  "product roadmap": "Roadmapping",
};

export function canonicalSkill(name: string): string {
  const key = name.trim().toLowerCase();
  if (SKILL_ALIASES[key]) return SKILL_ALIASES[key];
  // Match role skill names case-insensitively.
  for (const r of ROLES) for (const s of r.skills) if (s.name.toLowerCase() === key) return s.name;
  // Title-case whatever is left so "data cleaning" and "Data Cleaning" merge.
  return name
    .trim()
    .split(/\s+/)
    .map((w) => (w.length > 3 || w === w.toUpperCase() ? w : w)) // keep acronyms
    .map((w) => (w === w.toUpperCase() && w.length <= 5 ? w : w[0]?.toUpperCase() + w.slice(1)))
    .join(" ");
}

export function roleById(id?: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}

export interface GapItem {
  skill: string;
  weight: 1 | 2 | 3;
  have: boolean;
  /** Credential ids in the wallet attesting it. */
  evidence: string[];
  /** Credentials (from the market data) that typically teach it. */
  suggestions: string[];
}

export interface GapAnalysis {
  role: Role;
  /** 0–100, weighted by skill importance. */
  coverage: number;
  matched: GapItem[];
  gaps: GapItem[];
  /** Wallet skills the role doesn't list — still worth showing employers. */
  extras: string[];
  /** Next best credentials to earn, de-duplicated and ordered by gap weight. */
  nextCredentials: string[];
}

export function gapAnalysis(role: Role, skills: WalletSkill[]): GapAnalysis {
  const have = new Map<string, WalletSkill>();
  for (const s of skills) if (s.origin !== "desired") have.set(canonicalSkill(s.name).toLowerCase(), s);

  const items: GapItem[] = role.skills.map((rs) => {
    const w = have.get(rs.name.toLowerCase());
    return {
      skill: rs.name,
      weight: rs.weight,
      have: !!w,
      evidence: w?.evidence ?? [],
      suggestions: w ? [] : suggestCredentials(rs.name, role),
    };
  });
  const total = items.reduce((n, i) => n + i.weight, 0);
  const got = items.filter((i) => i.have).reduce((n, i) => n + i.weight, 0);
  const matched = items.filter((i) => i.have);
  const gaps = items.filter((i) => !i.have).sort((a, b) => b.weight - a.weight);
  const roleSet = new Set(role.skills.map((s) => s.name.toLowerCase()));
  const extras = [...have.keys()].filter((k) => !roleSet.has(k)).map((k) => have.get(k)!.name);
  const nextCredentials = [...new Set(gaps.flatMap((g) => g.suggestions))].slice(0, 5);
  return { role, coverage: total ? Math.round((got / total) * 100) : 0, matched, gaps, extras, nextCredentials };
}

/** Which of the role's typical credentials cover a skill — a light heuristic keyed on skill words. */
function suggestCredentials(skill: string, role: Role): string[] {
  const s = skill.toLowerCase();
  const picks = role.market.typicalCredentials.filter((c) => {
    const cl = c.toLowerCase();
    return cl.includes(s) || s.split(/[\s/]+/).some((w) => w.length > 3 && cl.includes(w));
  });
  return picks.length ? picks : role.market.typicalCredentials.slice(0, 1);
}

/** Roles ranked by how well the wallet already covers them. */
export function rankRoles(skills: WalletSkill[]): GapAnalysis[] {
  return ROLES.map((r) => gapAnalysis(r, skills)).sort((a, b) => b.coverage - a.coverage);
}

/** Skills implied by a credential (its own tags, canonicalized). */
export function skillsFromCredential(c: WalletCredential): string[] {
  return [...new Set(c.skills.map(canonicalSkill))];
}

/** Everything the taxonomy knows, for the "add skill" search. */
export function allKnownSkills(): string[] {
  const set = new Set<string>();
  for (const r of ROLES) for (const s of r.skills) set.add(s.name);
  for (const v of Object.values(SKILL_ALIASES)) set.add(v);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function searchSkills(query: string, limit = 12): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return allKnownSkills().slice(0, limit);
  const all = allKnownSkills();
  const starts = all.filter((s) => s.toLowerCase().startsWith(q));
  const contains = all.filter((s) => !starts.includes(s) && s.toLowerCase().includes(q));
  const alias = Object.entries(SKILL_ALIASES)
    .filter(([k]) => k.includes(q))
    .map(([, v]) => v)
    .filter((v) => !starts.includes(v) && !contains.includes(v));
  return [...new Set([...starts, ...contains, ...alias])].slice(0, limit);
}

export const fmtUsd = (n: number) => `$${Math.round(n / 1000)}k`;
