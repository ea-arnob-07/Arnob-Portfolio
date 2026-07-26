export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  features: string[];
  github_url: string | null;
  live_url: string | null;
  display_order: number;
  published: boolean;
};

export type PortfolioCertificate = {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  badge: string;
  icon: string;
  issued_on: string | null;
  credential_url: string | null;
  display_order: number;
  published: boolean;
};

export type PortfolioContent = {
  site: PortfolioSiteContent;
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
};

export const fallbackProjects: PortfolioProject[] = [
  {
    id: "fallback-atm-machine-system",
    slug: "atm-machine-system",
    title: "ATM Machine System",
    category: "Java + MySQL",
    description:
      "A fully functional ATM simulation featuring core banking operations, secure PIN authentication, and a polished Java Swing interface backed by a live MySQL database.",
    tags: ["Java", "MySQL", "Java Swing", "JDBC", "OOP"],
    features: [
      "Account creation, deposit, withdrawal & fund transfer",
      "PIN-secured multi-user authentication",
      "Transaction history with receipt generation",
      "Improved NetBeans UI with custom components",
    ],
    github_url: "https://github.com/ea-arnob-07?tab=repositories",
    live_url: null,
    display_order: 1,
    published: true,
  },
  {
    id: "fallback-shell-system-administration-toolkit",
    slug: "shell-system-administration-toolkit",
    title: "Shell-Based System Administration Toolkit",
    category: "Bash CLI",
    description:
      "A comprehensive Bash CLI project automating critical sysadmin tasks through modular, reusable shell scripts with a structured menu-driven interface.",
    tags: ["Bash", "Shell Script", "Linux", "CSV Export"],
    features: [
      "User monitoring & automated disk cleanup",
      "Backup management & system health analysis",
      "Student management & attendance tracking module",
      "CSV data export pipeline for reporting",
    ],
    github_url: "https://github.com/ea-arnob-07?tab=repositories",
    live_url: null,
    display_order: 2,
    published: true,
  },
  {
    id: "fallback-logicscript-compiler",
    slug: "logicscript-compiler",
    title: "LogicScript Compiler",
    category: "Compiler Design",
    description:
      "A lightweight interpreter-based compiler for a custom logic scripting language built using Lex and Yacc — demonstrating the full compiler pipeline.",
    tags: ["Lex / Flex", "Yacc / Bison", "C", "Compiler Theory"],
    features: [
      "Custom grammar for a logic-based scripting language",
      "Lexical analysis — tokenizer built with Flex",
      "Syntax parsing & semantic analysis via Bison",
      "Interpreter execution engine for parsed AST",
    ],
    github_url: "https://github.com/ea-arnob-07?tab=repositories",
    live_url: null,
    display_order: 3,
    published: true,
  },
];

export const fallbackCertificates: PortfolioCertificate[] = [
  {
    id: "fallback-cpc-programming-certificate",
    slug: "cpc-programming-certificate",
    name: "CPC Programming Certificate",
    issuer: "Competitive Programming Contest",
    badge: "Verified",
    icon: "🏆",
    issued_on: null,
    credential_url: null,
    display_order: 1,
    published: true,
  },
  {
    id: "fallback-ai-agents-for-beginners",
    slug: "ai-agents-for-beginners",
    name: "AI Agents for Beginners",
    issuer: "Simplilearn SkillUp - Online Certificate",
    badge: "Verified",
    icon: "🤖",
    issued_on: null,
    credential_url: null,
    display_order: 2,
    published: true,
  },
  {
    id: "fallback-embedded-system-iot-workshop",
    slug: "embedded-system-iot-workshop",
    name: "Embedded System & IoT Workshop",
    issuer: "Workshop Certificate",
    badge: "Champion Award",
    icon: "🏆",
    issued_on: null,
    credential_url: null,
    display_order: 3,
    published: true,
  },
  {
    id: "fallback-academic-excellence-award",
    slug: "academic-excellence-award",
    name: "Academic Excellence Award",
    issuer: "CGPA 4.00/4.00",
    badge: "Verified",
    icon: "📊",
    issued_on: null,
    credential_url: null,
    display_order: 4,
    published: true,
  },
  {
    id: "fallback-district-mathematics-olympiad",
    slug: "district-mathematics-olympiad",
    name: "District Mathematics Olympiad",
    issuer: "All of the Secondary Schools of Pabna District",
    badge: "Champion Award",
    icon: "🏆",
    issued_on: null,
    credential_url: null,
    display_order: 5,
    published: true,
  },
  {
    id: "fallback-skillup-certification",
    slug: "skillup-certification",
    name: "SkillUp Certification",
    issuer: "Machine Learning Algorithms",
    badge: "Verified",
    icon: "🎯",
    issued_on: null,
    credential_url: null,
    display_order: 6,
    published: true,
  },
  {
    id: "fallback-goedu-certification",
    slug: "goedu-certification",
    name: "GOEDU Certification",
    issuer: "Multiple Online Certifications",
    badge: "Verified",
    icon: "🎯",
    issued_on: null,
    credential_url: null,
    display_order: 7,
    published: true,
  },
  {
    id: "fallback-aws-academy-certification",
    slug: "aws-academy-certification",
    name: "AWS Academy Certification",
    issuer: "Cloud Security Foundations",
    badge: "Verified",
    icon: "🎯",
    issued_on: null,
    credential_url: null,
    display_order: 8,
    published: true,
  },
];

export const fallbackPortfolioContent: PortfolioContent = {
  site: fallbackSiteContent,
  projects: fallbackProjects,
  certificates: fallbackCertificates,
};

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
import {
  fallbackSiteContent,
  type PortfolioSiteContent,
} from "./site-content";
