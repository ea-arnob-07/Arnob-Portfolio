import { ARNOB_EMAIL, ARNOB_LINKEDIN_URL } from "./contact-links";

export type SectionHeading = {
  tag: string;
  title: string;
  accent: string;
  subtitle: string;
};

export type HeroStat = {
  value: string;
  label: string;
};

export type OrbitLabel = {
  value: string;
  label: string;
};

export type AboutInfo = {
  label: string;
  value: string;
  kind?: "text" | "email" | "status";
};

export type SkillItem = {
  name: string;
  level: number;
};

export type SkillCategory = {
  icon: string;
  title: string;
  skills: SkillItem[];
  chips: string[];
};

export type SkillGroup = {
  id: string;
  label: string;
  categories: SkillCategory[];
  chipsLabel: string;
  chips: string[];
};

export type ResearchItem = {
  status: string;
  title: string;
  description: string;
  tags: string[];
};

export type ExperienceItem = {
  icon: string;
  period: string;
  role: string;
  organization: string;
  description: string;
};

export type WorkshopPoint = {
  icon: string;
  text: string;
};

export type ActivityItem = {
  icon: string;
  title: string;
  description: string;
};

export type SocialPlatform = {
  kind: "github" | "linkedin" | "facebook";
  badge: string;
  name: string;
  handle: string;
  description: string;
  url: string;
  firstStatValue: string;
  firstStatLabel: string;
  secondStatValue: string;
  secondStatLabel: string;
};

export type RecruiterContent = {
  heading: SectionHeading;
  coreTitle: string;
  coreDescription: string;
  proofPoints: string[];
  cgpaValue: string;
  cgpaLabel: string;
  cgpaDescription: string;
  researchValue: string;
  researchLabel: string;
  researchDescription: string;
  growthTitle: string;
  growthDescription: string;
  recognitionValue: string;
  recognitionLabel: string;
  ctaKicker: string;
  ctaTitle: string;
};

export type PortfolioSiteContent = {
  hero: {
    name: string;
    badge: string;
    roles: string[];
    tagline: string;
    location: string;
    focusLine: string;
    profileImageUrl: string;
    stats: HeroStat[];
    orbitLabels: OrbitLabel[];
  };
  about: {
    heading: SectionHeading;
    paragraphs: string[];
    highlights: string[];
    info: AboutInfo[];
  };
  skills: {
    heading: SectionHeading;
    groups: SkillGroup[];
  };
  recruiter: RecruiterContent;
  projectsHeading: SectionHeading;
  research: {
    heading: SectionHeading;
    items: ResearchItem[];
  };
  experience: {
    heading: SectionHeading;
    items: ExperienceItem[];
  };
  certificatesHeading: SectionHeading;
  workshop: {
    heading: SectionHeading;
    icon: string;
    title: string;
    subtitle: string;
    points: WorkshopPoint[];
  };
  activities: {
    heading: SectionHeading;
    items: ActivityItem[];
  };
  social: {
    heading: SectionHeading;
    platforms: SocialPlatform[];
  };
  contact: {
    heading: SectionHeading;
    title: string;
    description: string;
    email: string;
    phone: string;
    university: string;
    locationCity: string;
    locationCountry: string;
    coordinates: string;
    formNamePlaceholder: string;
    formEmailPlaceholder: string;
    formSubjectPlaceholder: string;
    formMessagePlaceholder: string;
  };
  footer: {
    name: string;
    tagline: string;
    copyright: string;
  };
};

export const fallbackSiteContent: PortfolioSiteContent = {
  hero: {
    name: "Estiuk Arafat Arnob",
    badge: "Open to Opportunities",
    roles: [
      "ML Engineer",
      "Data Scientist",
      "XAI Researcher",
      "AI Enthusiast",
    ],
    tagline:
      "Building intelligent solutions through machine learning, data science, and explainable AI. Transforming raw data into meaningful, interpretable insight.",
    location: "Dhaka, Bangladesh",
    focusLine: "AI · ML · DS · XAI",
    profileImageUrl: "/img/profile.jpg",
    stats: [
      { value: "10+", label: "ML Models" },
      { value: "2", label: "Research" },
      { value: "10+", label: "Certifications" },
    ],
    orbitLabels: [
      { value: "4.00", label: "CGPA" },
      { value: "XAI", label: "Researcher" },
      { value: "ML", label: "Engineer" },
      { value: "Data", label: "Scientist" },
      { value: "Software", label: "Developer" },
      { value: "AI", label: "Enthusiast" },
    ],
  },
  about: {
    heading: {
      tag: "01 — About Me",
      title: "Driven by",
      accent: "Data & Intelligence",
      subtitle:
        "A passionate CSE student with a CGPA of 4.00/4.00, on a mission to master AI and Data Science.",
    },
    paragraphs: [
      "I'm a Computer Science & Engineering student with high Academic excellence and a deep passion for Machine Learning, Data Science, and Artificial Intelligence.",
      "From building mini software projects to exploring AI, machine learning, video editing, photography and gaming, I'm constantly expanding my skills in computer science and technology.",
      "Beyond coursework, I participate in IEEE workshops and competitions, pursue certifications, and conduct research to stay at the cutting edge of the field.",
    ],
    highlights: [
      "Machine Learning",
      "Data Science",
      "Data Analysis",
      "AI Research",
      "Explainable AI (XAI)",
      "Videography",
      "Photography",
    ],
    info: [
      { label: "Full Name", value: "Estiuk Arafat Arnob", kind: "text" },
      {
        label: "Degree",
        value: "B.Sc. in Computer Science & Engineering",
        kind: "text",
      },
      {
        label: "University",
        value: "Daffodil International University",
        kind: "text",
      },
      {
        label: "Focus Area",
        value: "Machine Learning · Data Science · XAI",
        kind: "text",
      },
      { label: "Location", value: "Dhaka, Bangladesh", kind: "text" },
      { label: "Email", value: "eaarnob178@gmail.com", kind: "email" },
      {
        label: "Status",
        value: "Open to Opportunities",
        kind: "status",
      },
    ],
  },
  skills: {
    heading: {
      tag: "02 — Skills",
      title: "Technical",
      accent: "Toolkit",
      subtitle:
        "A comprehensive skill set built around ML research, data pipelines, and software engineering.",
    },
    groups: [
      {
        id: "ml",
        label: "ML & AI",
        categories: [
          {
            icon: "🤖",
            title: "ML Algorithms",
            skills: [
              { name: "Random Forest", level: 82 },
              { name: "Decision Tree", level: 84 },
              { name: "KNN", level: 80 },
              { name: "SVM", level: 78 },
              { name: "Regression Models", level: 80 },
            ],
            chips: [],
          },
          {
            icon: "🔍",
            title: "Explainability (XAI)",
            skills: [
              { name: "SHAP", level: 77 },
              { name: "LIME", level: 73 },
              { name: "Feature Importance", level: 80 },
            ],
            chips: ["SHAP Values", "LIME Surrogate", "Partial Plots"],
          },
          {
            icon: "📊",
            title: "Data Science",
            skills: [
              { name: "Data Preprocessing", level: 83 },
              { name: "Data Mining", level: 76 },
              { name: "EDA & Visualization", level: 78 },
            ],
            chips: [],
          },
        ],
        chipsLabel: "All Models I Work With",
        chips: [
          "Random Forest",
          "Decision Tree",
          "KNN",
          "SVM",
          "Linear Regression",
          "Logistic Regression",
          "SHAP",
          "LIME",
          "XGBoost",
          "Naive Bayes",
          "K-Means Clustering",
          "Feature Engineering",
        ],
      },
      {
        id: "prog",
        label: "Programming",
        categories: [
          {
            icon: "☕",
            title: "Java",
            skills: [
              { name: "Core Java / OOP", level: 85 },
              { name: "Java Swing UI", level: 78 },
              { name: "JDBC / DB Integration", level: 76 },
            ],
            chips: [],
          },
          {
            icon: "🐍",
            title: "Python",
            skills: [
              { name: "Python (Core)", level: 82 },
              { name: "Pandas / NumPy", level: 79 },
              { name: "Scikit-learn", level: 78 },
              { name: "Matplotlib / Seaborn", level: 76 },
            ],
            chips: [],
          },
          {
            icon: "⚙",
            title: "Systems & Compilers",
            skills: [
              { name: "Bash / Shell Scripting", level: 72 },
              { name: "Lex / Yacc", level: 68 },
            ],
            chips: [],
          },
        ],
        chipsLabel: "",
        chips: [],
      },
      {
        id: "tools",
        label: "Tools & DB",
        categories: [
          {
            icon: "🗄",
            title: "Database",
            skills: [{ name: "MySQL", level: 80 }],
            chips: [],
          },
          {
            icon: "🛠",
            title: "Tools & IDEs",
            skills: [
              { name: "NetBeans", level: 84 },
              { name: "Power BI", level: 72 },
              { name: "Canva", level: 82 },
            ],
            chips: [],
          },
        ],
        chipsLabel: "",
        chips: [],
      },
      {
        id: "other",
        label: "IoT & Media",
        categories: [
          {
            icon: "📶",
            title: "IoT & Hardware",
            skills: [
              { name: "IoT Fundamentals", level: 66 },
              { name: "Embedded Systems", level: 60 },
            ],
            chips: [],
          },
          {
            icon: "🎨",
            title: "Creative & Media",
            skills: [
              { name: "Video Editing", level: 95 },
              { name: "Photo Editing", level: 92 },
              { name: "Videography", level: 90 },
              { name: "Photography", level: 95 },
            ],
            chips: [],
          },
        ],
        chipsLabel: "",
        chips: [],
      },
    ],
  },
  recruiter: {
    heading: {
      tag: "Why Arnob — Recruiter Snapshot",
      title: "Research mindset.",
      accent: "Builder energy.",
      subtitle:
        "A focused mix of academic consistency, practical engineering, and explainable AI research.",
    },
    coreTitle:
      "I turn complex technical problems into clear, working systems.",
    coreDescription:
      "From machine-learning experiments to database-backed software and compiler tooling, I care about both how a system performs and how clearly its decisions can be understood.",
    proofPoints: [
      "Explainable AI",
      "Applied ML",
      "Software Engineering",
      "Technical Communication",
    ],
    cgpaValue: "4.00",
    cgpaLabel: "/ 4.00 CGPA",
    cgpaDescription:
      "Strong academic performance backed by continuous hands-on learning.",
    researchValue: "02",
    researchLabel: "active research works",
    researchDescription:
      "Working on transparent AI for healthcare and multi-modal evaluation.",
    growthTitle: "Curious across disciplines.",
    growthDescription:
      "Research, systems programming, IoT, media, and competitive problem-solving shape a broader product perspective.",
    recognitionValue: "10+",
    recognitionLabel: "certifications and recognitions",
    ctaKicker: "Open to internships, research and AI projects",
    ctaTitle:
      "Looking for someone who learns fast and builds thoughtfully?",
  },
  projectsHeading: {
    tag: "03 — Projects",
    title: "Things I've",
    accent: "Built",
    subtitle:
      "Projects spanning systems programming, compiler design, and applied software engineering.",
  },
  research: {
    heading: {
      tag: "04 — Research",
      title: "Research",
      accent: "& Innovation",
      subtitle: "Pushing the boundaries of Explainable AI.",
    },
    items: [
      {
        status: "Active Research",
        title:
          "Explainable AI for Drug Addiction Prediction & Prevention",
        description:
          "Developing transparent ML models to predict drug addiction risk factors. Applies SHAP and LIME to make black-box classifiers understandable for healthcare professionals.",
        tags: [
          "XAI",
          "SHAP",
          "LIME",
          "Random Forest",
          "Healthcare AI",
          "Python",
        ],
      },
      {
        status: "Active Research",
        title: "AI-Based Automated Presentation Evaluation System",
        description:
          "Building an intelligent multi-modal system that evaluates presentations using NLP and computer vision — assessing content quality and delivery metrics.",
        tags: [
          "NLP",
          "Computer Vision",
          "Multi-Modal AI",
          "Deep Learning",
          "Python",
        ],
      },
    ],
  },
  experience: {
    heading: {
      tag: "05 — Experience",
      title: "My",
      accent: "Experience",
      subtitle:
        "Early career experience that shaped my professional skills and perspective.",
    },
    items: [
      {
        icon: "💼",
        period: "2025 - Present",
        role: "Machine Learning Researcher",
        organization: "Daffodil International University",
        description:
          "Working on Explainable AI (XAI) models for Vehicle Health Classification, focusing on making black-box models transparent and interpretable.",
      },
      {
        icon: "💻",
        period: "2023 - 2024",
        role: "Project Lead (Academic)",
        organization: "DIU CSE Department",
        description:
          "Led a team to develop an “ATM Simulation System” using Java Swing and Object-Oriented Programming (OOP) principles.",
      },
      {
        icon: "💻",
        period: "2024 - 2025",
        role: "Project Lead (Academic)",
        organization: "DIU CSE Department",
        description:
          "Led a team to develop a “University Management System (UMS)” using Shell Scripting, Linux system administration, and file handling techniques.",
      },
    ],
  },
  certificatesHeading: {
    tag: "06 — Certifications",
    title: "Credentials",
    accent: "& Achievements",
    subtitle:
      "Verified expertise from recognized institutions, competitions, and online platforms.",
  },
  workshop: {
    heading: {
      tag: "07 — Workshops & Training",
      title: "Hands-On",
      accent: "Learning",
      subtitle:
        "Practical training that extended my capabilities into embedded systems and hardware.",
    },
    icon: "📶",
    title: "IoT-Based Technology Workshop",
    subtitle:
      "Embedded Systems & Internet of Things — Fundamentals to Application",
    points: [
      {
        icon: "📐",
        text: "Learned IoT architecture, communication protocols, and device connectivity paradigms for building smart systems.",
      },
      {
        icon: "⚙",
        text: "Worked hands-on with sensors and microcontrollers for real-time data acquisition and processing.",
      },
      {
        icon: "☁️",
        text: "Explored real-world IoT applications in smart home automation and industrial monitoring.",
      },
      {
        icon: "🔗",
        text: "Studied integration of IoT hardware with software data pipelines and monitoring dashboards.",
      },
    ],
  },
  activities: {
    heading: {
      tag: "08 — Activities",
      title: "Beyond the",
      accent: "Classroom",
      subtitle:
        "Community involvement and extracurricular pursuits that round out my profile.",
    },
    items: [
      {
        icon: "🤝",
        title: "Event Volunteer",
        description:
          "Active volunteer at Daffodil International University events — supporting event logistics, fostering community, and contributing to a collaborative academic environment.",
      },
      {
        icon: "💻",
        title: "AI Club Participant",
        description:
          "Participated in Daffodil AI Club activities including the ModelX AI Challenge — competing in an AI-powered multi-model presentation assessment project.",
      },
      {
        icon: "📚",
        title: "Continuous Learning",
        description:
          "Committed to self-driven growth through online courses, research papers, and open-source exploration in machine learning, data science, and AI.",
      },
      {
        icon: "🎮",
        title: "Esports Player",
        description:
          "Competitive esports player specializing in mobile gaming titles including PUBG Mobile and Mobile Legends: Bang Bang (MLBB).",
      },
    ],
  },
  social: {
    heading: {
      tag: "09 — Find Me Online",
      title: "Connect Across",
      accent: "Platforms",
      subtitle:
        "Follow my work, research, and journey across GitHub, LinkedIn, and Facebook.",
    },
    platforms: [
      {
        kind: "github",
        badge: "Code",
        name: "GitHub",
        handle: "@ea-arnob-07",
        description:
          "Explore my projects, compiler work, shell scripts, and ML experiments.",
        url: "https://github.com/ea-arnob-07",
        firstStatValue: "10+",
        firstStatLabel: "REPOS",
        secondStatValue: "ML",
        secondStatLabel: "FOCUS",
      },
      {
        kind: "linkedin",
        badge: "Professional",
        name: "LinkedIn",
        handle: "Estiuk Arafat Arnob",
        description:
          "Connect professionally. See my education, certifications, research, and career updates.",
        url: ARNOB_LINKEDIN_URL,
        firstStatValue: "CSE",
        firstStatLabel: "STUDENT",
        secondStatValue: "AI",
        secondStatLabel: "FOCUS",
      },
      {
        kind: "facebook",
        badge: "Social",
        name: "Facebook",
        handle: "Estiuk Arnob",
        description:
          "Follow my personal updates, event activities, and community engagement at DIU.",
        url: "https://www.facebook.com/share/1JD8Gt7NK7/?mibextid=wwXIfr",
        firstStatValue: "DIU",
        firstStatLabel: "EVENTS",
        secondStatValue: "BD",
        secondStatLabel: "BASED",
      },
    ],
  },
  contact: {
    heading: {
      tag: "10 — Contact",
      title: "Let's",
      accent: "Connect",
      subtitle:
        "Open to data science roles, AI research collaborations, and internship opportunities.",
    },
    title: "Get In Touch",
    description:
      "I'm actively looking for data science internships, research collaborations, and AI project opportunities. If you're working on something exciting — reach out.",
    email: ARNOB_EMAIL,
    phone: "+8801313602221",
    university: "Daffodil International University",
    locationCity: "Dhaka",
    locationCountry: "Bangladesh",
    coordinates: "23.8103 N  90.4125 E",
    formNamePlaceholder: "Enter Your Full Name",
    formEmailPlaceholder: "Enter Your Email Address",
    formSubjectPlaceholder: "Collaboration, internship...",
    formMessagePlaceholder: "Tell me about your opportunity or project...",
  },
  footer: {
    name: "Estiuk Arafat Arnob",
    tagline:
      "Built by ARNOB · AI Enthusiast · Data Scientist · ML Researcher",
    copyright: "2025 Estiuk Arafat Arnob — All rights reserved",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeWithFallback<T>(fallback: T, value: unknown): T {
  if (Array.isArray(fallback)) {
    return (Array.isArray(value) ? value : fallback) as T;
  }

  if (isRecord(fallback)) {
    const source = isRecord(value) ? value : {};
    const output: Record<string, unknown> = { ...fallback, ...source };
    Object.keys(fallback).forEach((key) => {
      output[key] = mergeWithFallback(
        (fallback as Record<string, unknown>)[key],
        source[key],
      );
    });
    return output as T;
  }

  return (value === undefined || value === null ? fallback : value) as T;
}

export function normalizeSiteContent(value: unknown): PortfolioSiteContent {
  const content = mergeWithFallback(fallbackSiteContent, value);
  const legacyLinkedInUrls = new Set([
    "https://bd.linkedin.com/in/estiuk-arnob-0350ba34a",
    "https://www.linkedin.com/in/estiuk-arnob-0350ba34a",
    "www.linkedin.com/in/estiuk-arnob-0350ba34a",
  ]);

  return {
    ...content,
    social: {
      ...content.social,
      platforms: content.social.platforms.map((platform) =>
        platform.kind === "linkedin" &&
        legacyLinkedInUrls.has(platform.url.trim().replace(/\/$/, ""))
          ? { ...platform, url: ARNOB_LINKEDIN_URL }
          : platform,
      ),
    },
    contact: {
      ...content.contact,
      formNamePlaceholder:
        content.contact.formNamePlaceholder === "John Doe"
          ? fallbackSiteContent.contact.formNamePlaceholder
          : content.contact.formNamePlaceholder,
      formEmailPlaceholder:
        content.contact.formEmailPlaceholder === "john@example.com"
          ? fallbackSiteContent.contact.formEmailPlaceholder
          : content.contact.formEmailPlaceholder,
    },
  };
}

export function cloneSiteContent(
  value: PortfolioSiteContent,
): PortfolioSiteContent {
  return JSON.parse(JSON.stringify(value)) as PortfolioSiteContent;
}
