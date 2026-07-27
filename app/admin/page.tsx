"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  PortfolioCertificate,
  PortfolioProject,
} from "../lib/portfolio-content";
import {
  fallbackCertificates,
  fallbackProjects,
  slugify,
} from "../lib/portfolio-content";
import {
  cloneSiteContent,
  fallbackSiteContent,
  normalizeSiteContent,
  type PortfolioSiteContent,
} from "../lib/site-content";
import {
  PORTFOLIO_ADMIN_EMAIL,
  SUPABASE_URL,
  supabase,
} from "../lib/supabase";
import {
  FullContentEditor,
  type SiteEditorSection,
} from "./full-content-editor";

type AdminTab = SiteEditorSection | "projects" | "certificates";

const adminTabs: Array<{ id: AdminTab; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "recruiter", label: "Recruiter" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "experience", label: "Experience" },
  { id: "certificates", label: "Certificates" },
  { id: "more", label: "More Sections" },
  { id: "contact", label: "Contact" },
];

const siteEditorSections = new Set<AdminTab>([
  "profile",
  "about",
  "skills",
  "recruiter",
  "research",
  "experience",
  "more",
  "contact",
]);

type ProjectDraft = {
  id: string | null;
  title: string;
  category: string;
  description: string;
  tags: string;
  features: string;
  github_url: string;
  live_url: string;
  display_order: number;
  published: boolean;
};

type CertificateDraft = {
  id: string | null;
  name: string;
  issuer: string;
  badge: string;
  icon: string;
  issued_on: string;
  credential_url: string;
  display_order: number;
  published: boolean;
};

const emptyProject = (): ProjectDraft => ({
  id: null,
  title: "",
  category: "",
  description: "",
  tags: "",
  features: "",
  github_url: "",
  live_url: "",
  display_order: 1,
  published: true,
});

const emptyCertificate = (): CertificateDraft => ({
  id: null,
  name: "",
  issuer: "",
  badge: "Verified",
  icon: "🎯",
  issued_on: "",
  credential_url: "",
  display_order: 1,
  published: true,
});

function splitCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function friendlyError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Something went wrong. Please try again.";
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState(PORTFOLIO_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("profile");
  const [siteContent, setSiteContent] = useState<PortfolioSiteContent>(() =>
    cloneSiteContent(fallbackSiteContent),
  );
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [certificates, setCertificates] = useState<PortfolioCertificate[]>([]);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProject);
  const [certificateDraft, setCertificateDraft] =
    useState<CertificateDraft>(emptyCertificate);
  const [recordsBusy, setRecordsBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [siteUndoStack, setSiteUndoStack] = useState<
    PortfolioSiteContent[]
  >([]);
  const lastSiteChangeAt = useRef(0);

  const adminName = useMemo(
    () => session?.user.email?.split("@")[0] ?? "Arnob",
    [session],
  );
  const activeProjects = useMemo(
    () => projects.filter((item) => !item.deleted_at),
    [projects],
  );
  const deletedProjects = useMemo(
    () => projects.filter((item) => Boolean(item.deleted_at)),
    [projects],
  );
  const activeCertificates = useMemo(
    () => certificates.filter((item) => !item.deleted_at),
    [certificates],
  );
  const deletedCertificates = useMemo(
    () => certificates.filter((item) => Boolean(item.deleted_at)),
    [certificates],
  );

  const announceContentUpdate = useCallback(() => {
    const version = String(Date.now());
    window.localStorage.setItem("arnob-portfolio-content-version", version);
    window.dispatchEvent(new Event("arnob-portfolio-content-updated"));
  }, []);

  const updateSiteDraft = useCallback(
    (nextContent: PortfolioSiteContent) => {
      const now = Date.now();
      if (now - lastSiteChangeAt.current > 700) {
        setSiteUndoStack((history) => [
          ...history.slice(-39),
          cloneSiteContent(siteContent),
        ]);
      }
      lastSiteChangeAt.current = now;
      setSiteContent(nextContent);
    },
    [siteContent],
  );

  const undoSiteDraft = useCallback(() => {
    setSiteUndoStack((history) => {
      const previous = history.at(-1);
      if (!previous) return history;
      setSiteContent(cloneSiteContent(previous));
      lastSiteChangeAt.current = 0;
      setNotice(
        "Last content change restored. Save this section to publish the undo.",
      );
      return history.slice(0, -1);
    });
  }, []);

  const acceptSession = useCallback(async (nextSession: Session | null) => {
    const sessionEmail = nextSession?.user.email?.toLowerCase();
    if (nextSession && sessionEmail !== PORTFOLIO_ADMIN_EMAIL.toLowerCase()) {
      await supabase.auth.signOut();
      setSession(null);
      setAuthMessage("This account is not allowed to manage the portfolio.");
      return;
    }
    setSession(nextSession);
  }, []);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      void acceptSession(data.session).finally(() => {
        if (active) setAuthReady(true);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      void acceptSession(nextSession);
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [acceptSession]);

  const loadRecords = useCallback(async () => {
    setRecordsBusy(true);
    setSetupNeeded(false);
    setNotice("");

    const [siteResult, projectResult, certificateResult] = await Promise.all([
      supabase
        .from("portfolio_site_content")
        .select("content")
        .eq("id", "main")
        .maybeSingle(),
      supabase
        .from("portfolio_projects")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("portfolio_certificates")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    const issues: string[] = [];

    if (siteResult.error) {
      issues.push(`Full text editor: ${friendlyError(siteResult.error)}`);
    } else {
      if (!siteResult.data) {
        const seedResult = await supabase
          .from("portfolio_site_content")
          .upsert(
            { id: "main", content: fallbackSiteContent },
            { onConflict: "id" },
          )
          .select("content")
          .single();
        if (seedResult.error) {
          issues.push(
            `Full text editor setup: ${friendlyError(seedResult.error)}`,
          );
        } else {
          setSiteContent(normalizeSiteContent(seedResult.data.content));
        }
      } else {
        setSiteContent(normalizeSiteContent(siteResult.data.content));
      }
    }

    if (projectResult.error) {
      issues.push(`Projects: ${friendlyError(projectResult.error)}`);
    } else {
      let projectRows = (projectResult.data ?? []) as PortfolioProject[];
      if (!projectRows.length) {
        const starterProjects = fallbackProjects.map((project) => ({
          slug: project.slug,
          title: project.title,
          category: project.category,
          description: project.description,
          tags: project.tags,
          features: project.features,
          github_url: project.github_url,
          live_url: project.live_url,
          display_order: project.display_order,
          published: project.published,
        }));
        const seedResult = await supabase
          .from("portfolio_projects")
          .upsert(starterProjects, { onConflict: "slug" });
        if (seedResult.error) {
          issues.push(`Project import: ${friendlyError(seedResult.error)}`);
        } else {
          const refreshed = await supabase
            .from("portfolio_projects")
            .select("*")
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: true });
          if (refreshed.error) {
            issues.push(`Projects: ${friendlyError(refreshed.error)}`);
          } else {
            projectRows = (refreshed.data ?? []) as PortfolioProject[];
          }
        }
      }
      setProjects(projectRows);
    }

    if (certificateResult.error) {
      issues.push(`Certificates: ${friendlyError(certificateResult.error)}`);
    } else {
      let certificateRows = (certificateResult.data ??
        []) as PortfolioCertificate[];
      if (!certificateRows.length) {
        const starterCertificates = fallbackCertificates.map(
          (certificate) => ({
            slug: certificate.slug,
            name: certificate.name,
            issuer: certificate.issuer,
            badge: certificate.badge,
            icon: certificate.icon,
            issued_on: certificate.issued_on,
            credential_url: certificate.credential_url,
            display_order: certificate.display_order,
            published: certificate.published,
          }),
        );
        const seedResult = await supabase
          .from("portfolio_certificates")
          .upsert(starterCertificates, { onConflict: "slug" });
        if (seedResult.error) {
          issues.push(
            `Certificate import: ${friendlyError(seedResult.error)}`,
          );
        } else {
          const refreshed = await supabase
            .from("portfolio_certificates")
            .select("*")
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: true });
          if (refreshed.error) {
            issues.push(`Certificates: ${friendlyError(refreshed.error)}`);
          } else {
            certificateRows = (refreshed.data ??
              []) as PortfolioCertificate[];
          }
        }
      }
      setCertificates(certificateRows);
    }

    if (issues.length) {
      setSetupNeeded(
        issues.some(
          (issue) =>
            issue.includes("portfolio_site_content") ||
            issue.includes("deleted_at") ||
            issue.includes("schema cache"),
        ),
      );
      setNotice(
        `${issues.join(" · ")}. Run the latest supabase/schema.sql once; available project and certificate records are still shown below.`,
      );
    }
    setRecordsBusy(false);
  }, []);

  useEffect(() => {
    if (!session) return;
    const refreshTimer = window.setTimeout(() => {
      void loadRecords();
    }, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [loadRecords, session]);

  const authenticate = async (mode: "signin" | "signup") => {
    setAuthMessage("");
    if (email.trim().toLowerCase() !== PORTFOLIO_ADMIN_EMAIL.toLowerCase()) {
      setAuthMessage(`Use the approved admin email: ${PORTFOLIO_ADMIN_EMAIL}`);
      return;
    }
    if (password.length < 8) {
      setAuthMessage("Use a password with at least 8 characters.");
      return;
    }

    setAuthBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setAuthMessage(
        error ? friendlyError(error) : "Signed in successfully.",
      );
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: new URL(
            window.location.pathname,
            window.location.origin,
          ).toString(),
        },
      });
      if (error) {
        setAuthMessage(friendlyError(error));
      } else if (data.session) {
        setAuthMessage("Admin account created and signed in.");
      } else {
        setAuthMessage(
          "Account created. Check your email and confirm it, then sign in.",
        );
      }
    }
    setAuthBusy(false);
  };

  const saveSiteContent = async () => {
    setRecordsBusy(true);
    setSetupNeeded(false);
    setNotice("");
    const { data, error } = await supabase
      .from("portfolio_site_content")
      .upsert(
        {
          id: "main",
          content: siteContent,
        },
        { onConflict: "id" },
      )
      .select("content")
      .single();

    if (error) {
      setSetupNeeded(error.message.includes("portfolio_site_content"));
      setNotice(
        `${friendlyError(error)}${
          error.message.includes("portfolio_site_content")
            ? " Run the updated supabase/schema.sql in the SQL Editor."
            : ""
        }`,
      );
      setRecordsBusy(false);
      return;
    }

    setSiteContent(normalizeSiteContent(data.content));
    announceContentUpdate();
    setNotice(
      "Portfolio content saved and published. Open portfolio tabs refresh automatically.",
    );
    setRecordsBusy(false);
  };

  const uploadProfilePicture = async (file: File) => {
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ]);
    if (!allowedTypes.has(file.type)) {
      setNotice("Choose a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice("The profile picture must be 5 MB or smaller.");
      return;
    }

    setUploadBusy(true);
    setNotice("");
    const path = "profile/avatar";
    const { error: uploadError } = await supabase.storage
      .from("portfolio-media")
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      setSetupNeeded(
        uploadError.message.toLowerCase().includes("bucket") ||
          uploadError.message.toLowerCase().includes("policy"),
      );
      setNotice(
        `${friendlyError(uploadError)} Run the updated supabase/schema.sql if the portfolio-media bucket is not ready.`,
      );
      setUploadBusy(false);
      return;
    }

    const { data } = supabase.storage
      .from("portfolio-media")
      .getPublicUrl(path);
    const updatedContent = cloneSiteContent(siteContent);
    updatedContent.hero.profileImageUrl = `${data.publicUrl}?v=${Date.now()}`;
    const { error: saveError } = await supabase
      .from("portfolio_site_content")
      .upsert(
        { id: "main", content: updatedContent },
        { onConflict: "id" },
      );

    if (saveError) {
      setNotice(friendlyError(saveError));
      setUploadBusy(false);
      return;
    }

    setSiteContent(updatedContent);
    announceContentUpdate();
    setNotice("Profile picture uploaded and published.");
    setUploadBusy(false);
  };

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecordsBusy(true);
    setNotice("");
    const editingExisting = Boolean(projectDraft.id);

    const payload = {
      slug: slugify(projectDraft.title),
      title: projectDraft.title.trim(),
      category: projectDraft.category.trim(),
      description: projectDraft.description.trim(),
      tags: splitCommaList(projectDraft.tags),
      features: splitLineList(projectDraft.features),
      github_url: projectDraft.github_url.trim() || null,
      live_url: projectDraft.live_url.trim() || null,
      display_order: Number(projectDraft.display_order) || 0,
      published: projectDraft.published,
    };

    const result = projectDraft.id
      ? await supabase
          .from("portfolio_projects")
          .update(payload)
          .eq("id", projectDraft.id)
      : await supabase.from("portfolio_projects").insert(payload);

    if (result.error) {
      setNotice(friendlyError(result.error));
      setRecordsBusy(false);
      return;
    }

    setProjectDraft(emptyProject());
    await loadRecords();
    announceContentUpdate();
    setNotice(
      editingExisting
        ? "Project updated and published."
        : "Project added and published.",
    );
  };

  const saveCertificate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecordsBusy(true);
    setNotice("");
    const editingExisting = Boolean(certificateDraft.id);

    const payload = {
      slug: slugify(certificateDraft.name),
      name: certificateDraft.name.trim(),
      issuer: certificateDraft.issuer.trim(),
      badge: certificateDraft.badge.trim(),
      icon: certificateDraft.icon.trim() || "🎯",
      issued_on: certificateDraft.issued_on || null,
      credential_url: certificateDraft.credential_url.trim() || null,
      display_order: Number(certificateDraft.display_order) || 0,
      published: certificateDraft.published,
    };

    const result = certificateDraft.id
      ? await supabase
          .from("portfolio_certificates")
          .update(payload)
          .eq("id", certificateDraft.id)
      : await supabase.from("portfolio_certificates").insert(payload);

    if (result.error) {
      setNotice(friendlyError(result.error));
      setRecordsBusy(false);
      return;
    }

    setCertificateDraft(emptyCertificate());
    await loadRecords();
    announceContentUpdate();
    setNotice(
      editingExisting
        ? "Certificate updated and published."
        : "Certificate added and published.",
    );
  };

  const deleteRecord = async (
    table: "portfolio_projects" | "portfolio_certificates",
    id: string,
    label: string,
  ) => {
    if (
      !window.confirm(
        `Move “${label}” to Recently Deleted? You can restore it anytime.`,
      )
    ) {
      return;
    }
    setRecordsBusy(true);
    const { error } = await supabase
      .from(table)
      .update({
        deleted_at: new Date().toISOString(),
        published: false,
      })
      .eq("id", id);
    if (error) {
      setSetupNeeded(error.message.includes("deleted_at"));
      setNotice(
        `${friendlyError(error)}${
          error.message.includes("deleted_at")
            ? " Run the latest supabase/schema.sql once to enable recoverable deletion."
            : ""
        }`,
      );
      setRecordsBusy(false);
      return;
    }
    await loadRecords();
    announceContentUpdate();
    setNotice(`${label} moved to Recently Deleted. You can restore it below.`);
  };

  const restoreRecord = async (
    table: "portfolio_projects" | "portfolio_certificates",
    id: string,
    label: string,
  ) => {
    setRecordsBusy(true);
    setNotice("");
    const { error } = await supabase
      .from(table)
      .update({
        deleted_at: null,
        published: true,
      })
      .eq("id", id);
    if (error) {
      setNotice(friendlyError(error));
      setRecordsBusy(false);
      return;
    }
    await loadRecords();
    announceContentUpdate();
    setNotice(`${label} restored and published.`);
  };

  const moveRecord = async (
    table: "portfolio_projects" | "portfolio_certificates",
    records: Array<PortfolioProject | PortfolioCertificate>,
    id: string,
    direction: -1 | 1,
  ) => {
    const currentIndex = records.findIndex((record) => record.id === id);
    const nextIndex = currentIndex + direction;
    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= records.length
    ) {
      return;
    }

    const reordered = [...records];
    [reordered[currentIndex], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[currentIndex],
    ];

    setRecordsBusy(true);
    setNotice("");
    const updates = await Promise.all(
      reordered.map((record, index) =>
        supabase
          .from(table)
          .update({ display_order: index + 1 })
          .eq("id", record.id),
      ),
    );
    const failedUpdate = updates.find((result) => result.error);
    if (failedUpdate?.error) {
      setNotice(friendlyError(failedUpdate.error));
      setRecordsBusy(false);
      return;
    }
    await loadRecords();
    announceContentUpdate();
    setNotice("Display order updated and published.");
  };

  const editProject = (project: PortfolioProject) => {
    setProjectDraft({
      id: project.id,
      title: project.title,
      category: project.category,
      description: project.description,
      tags: project.tags.join(", "),
      features: project.features.join("\n"),
      github_url: project.github_url ?? "",
      live_url: project.live_url ?? "",
      display_order: project.display_order,
      published: project.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editCertificate = (certificate: PortfolioCertificate) => {
    setCertificateDraft({
      id: certificate.id,
      name: certificate.name,
      issuer: certificate.issuer,
      badge: certificate.badge,
      icon: certificate.icon,
      issued_on: certificate.issued_on ?? "",
      credential_url: certificate.credential_url ?? "",
      display_order: certificate.display_order,
      published: certificate.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!authReady) {
    return (
      <main className="admin-shell admin-centered">
        <div className="admin-loader" aria-label="Loading admin panel" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin-shell admin-centered">
        <section className="admin-auth-card" aria-labelledby="admin-login-title">
          <Link className="admin-back-link" href="/">
            ← Portfolio
          </Link>
          <div className="admin-brand-mark">EA</div>
          <p className="admin-eyebrow">PRIVATE CONTENT STUDIO</p>
          <h1 id="admin-login-title">Portfolio Admin</h1>
          <p className="admin-auth-copy">
            Sign in to update every portfolio section without editing code.
          </p>

          <label>
            Admin email
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void authenticate("signin");
              }}
              placeholder="Minimum 8 characters"
              type="password"
              value={password}
            />
          </label>

          {authMessage ? (
            <p className="admin-message" role="status">
              {authMessage}
            </p>
          ) : null}

          <button
            className="admin-primary-button"
            disabled={authBusy}
            onClick={() => void authenticate("signin")}
            type="button"
          >
            {authBusy ? "Please wait…" : "Sign In"}
          </button>
          <button
            className="admin-secondary-button"
            disabled={authBusy}
            onClick={() => void authenticate("signup")}
            type="button"
          >
            First time? Create Admin Account
          </button>

          <div className="admin-secure-note">
            <span>●</span>
            Protected by Supabase Auth and Row Level Security
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <Link className="admin-logo" href="/">
            EA
          </Link>
          <div>
            <span>Portfolio Control Room</span>
            <strong>Welcome, {adminName}</strong>
          </div>
        </div>
        <nav>
          <Link href="/" target="_blank" rel="noreferrer">
            View Portfolio ↗
          </Link>
          <button
            onClick={() => {
              void supabase.auth.signOut();
            }}
            type="button"
          >
            Sign Out
          </button>
        </nav>
      </header>

      <section className="admin-dashboard">
        <div className="admin-heading">
          <div>
            <p className="admin-eyebrow">LIVE CONTENT MANAGEMENT</p>
            <h1>Keep your portfolio current.</h1>
            <p>
              Edit your full profile, upload a picture, and manage every
              portfolio section without redeploying.
            </p>
          </div>
          <div className="admin-connection">
            <i />
            <span>
              Connected
              <small>{new URL(SUPABASE_URL).hostname}</small>
            </span>
          </div>
        </div>

        <div className="admin-stats">
          <article>
            <span>Total projects</span>
            <strong>{activeProjects.length}</strong>
          </article>
          <article>
            <span>Published projects</span>
            <strong>
              {activeProjects.filter((item) => item.published).length}
            </strong>
          </article>
          <article>
            <span>Certificates</span>
            <strong>{activeCertificates.length}</strong>
          </article>
          <article>
            <span>Editable sections</span>
            <strong>10</strong>
          </article>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Content type">
          {adminTabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? "active" : ""}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {notice ? (
          <div
            className={`admin-notice${setupNeeded ? " setup-needed" : ""}`}
            role="status"
          >
            <strong>{setupNeeded ? "One-time setup needed" : "Saved"}</strong>
            <span>{notice}</span>
          </div>
        ) : null}

        {siteEditorSections.has(activeTab) ? (
          <div className="admin-site-workspace">
            <div className="admin-history-bar">
              <span>
                Every repeatable card has position controls. Removed content
                can be restored with Undo before saving.
              </span>
              <button
                disabled={!siteUndoStack.length || recordsBusy}
                onClick={undoSiteDraft}
                type="button"
              >
                ↶ Undo last change
              </button>
            </div>
            <FullContentEditor
              busy={recordsBusy}
              content={siteContent}
              onChange={updateSiteDraft}
              onSave={() => void saveSiteContent()}
              onUploadProfile={(file) => void uploadProfilePicture(file)}
              section={activeTab as SiteEditorSection}
              uploadBusy={uploadBusy}
            />
          </div>
        ) : activeTab === "projects" ? (
          <div className="admin-workspace">
            <form className="admin-editor" onSubmit={saveProject}>
              <div className="admin-editor-title">
                <div>
                  <span>{projectDraft.id ? "EDIT PROJECT" : "NEW PROJECT"}</span>
                  <h2>
                    {projectDraft.id ? "Update project" : "Add a project"}
                  </h2>
                </div>
                {projectDraft.id ? (
                  <button
                    onClick={() => setProjectDraft(emptyProject())}
                    type="button"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <label>
                Project title
                <input
                  onChange={(event) =>
                    setProjectDraft((draft) => ({
                      ...draft,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. Explainable AI Dashboard"
                  required
                  value={projectDraft.title}
                />
              </label>
              <label>
                Category
                <input
                  onChange={(event) =>
                    setProjectDraft((draft) => ({
                      ...draft,
                      category: event.target.value,
                    }))
                  }
                  placeholder="e.g. Machine Learning"
                  required
                  value={projectDraft.category}
                />
              </label>
              <label>
                Description
                <textarea
                  onChange={(event) =>
                    setProjectDraft((draft) => ({
                      ...draft,
                      description: event.target.value,
                    }))
                  }
                  placeholder="What the project does and why it matters"
                  required
                  rows={4}
                  value={projectDraft.description}
                />
              </label>
              <label>
                Technologies
                <input
                  onChange={(event) =>
                    setProjectDraft((draft) => ({
                      ...draft,
                      tags: event.target.value,
                    }))
                  }
                  placeholder="Python, SHAP, Streamlit"
                  value={projectDraft.tags}
                />
                <small>Separate technologies with commas.</small>
              </label>
              <label>
                Key features
                <textarea
                  onChange={(event) =>
                    setProjectDraft((draft) => ({
                      ...draft,
                      features: event.target.value,
                    }))
                  }
                  placeholder={"Model comparison\nSHAP explanations\nLive dashboard"}
                  rows={5}
                  value={projectDraft.features}
                />
                <small>Write one feature per line.</small>
              </label>
              <div className="admin-form-grid">
                <label>
                  GitHub URL
                  <input
                    onChange={(event) =>
                      setProjectDraft((draft) => ({
                        ...draft,
                        github_url: event.target.value,
                      }))
                    }
                    placeholder="https://github.com/..."
                    type="url"
                    value={projectDraft.github_url}
                  />
                </label>
                <label>
                  Live URL
                  <input
                    onChange={(event) =>
                      setProjectDraft((draft) => ({
                        ...draft,
                        live_url: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    type="url"
                    value={projectDraft.live_url}
                  />
                </label>
              </div>
              <div className="admin-form-footer">
                <label>
                  Display order
                  <input
                    min={0}
                    onChange={(event) =>
                      setProjectDraft((draft) => ({
                        ...draft,
                        display_order: Number(event.target.value),
                      }))
                    }
                    type="number"
                    value={projectDraft.display_order}
                  />
                </label>
                <label className="admin-toggle">
                  <input
                    checked={projectDraft.published}
                    onChange={(event) =>
                      setProjectDraft((draft) => ({
                        ...draft,
                        published: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span />
                  Published
                </label>
              </div>
              <button
                className="admin-primary-button"
                disabled={recordsBusy}
                type="submit"
              >
                {projectDraft.id ? "Save Changes" : "Publish Project"}
              </button>
            </form>

            <section className="admin-records" aria-label="Existing projects">
              <div className="admin-records-title">
                <div>
                  <span>CONTENT LIBRARY</span>
                  <h2>Existing projects</h2>
                </div>
                <button
                  disabled={recordsBusy}
                  onClick={() => void loadRecords()}
                  type="button"
                >
                  Refresh
                </button>
              </div>
              {recordsBusy && !activeProjects.length ? (
                <div className="admin-list-empty">Loading projects…</div>
              ) : activeProjects.length ? (
                <div className="admin-record-list">
                  {activeProjects.map((project, index) => (
                    <article key={project.id}>
                      <div className="admin-record-position">
                        <div className="admin-record-order">
                          {String(project.display_order).padStart(2, "0")}
                        </div>
                        <div className="admin-order-controls">
                          <button
                            aria-label={`Move ${project.title} up`}
                            disabled={recordsBusy || index === 0}
                            onClick={() =>
                              void moveRecord(
                                "portfolio_projects",
                                activeProjects,
                                project.id,
                                -1,
                              )
                            }
                            title="Move up"
                            type="button"
                          >
                            ↑
                          </button>
                          <button
                            aria-label={`Move ${project.title} down`}
                            disabled={
                              recordsBusy ||
                              index === activeProjects.length - 1
                            }
                            onClick={() =>
                              void moveRecord(
                                "portfolio_projects",
                                activeProjects,
                                project.id,
                                1,
                              )
                            }
                            title="Move down"
                            type="button"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <div className="admin-record-content">
                        <div>
                          <span>{project.category}</span>
                          <i className={project.published ? "live" : "draft"}>
                            {project.published ? "Published" : "Draft"}
                          </i>
                        </div>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="admin-record-tags">
                          {project.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="admin-record-actions">
                        <button onClick={() => editProject(project)} type="button">
                          Edit
                        </button>
                        <button
                          className="danger"
                          onClick={() =>
                            void deleteRecord(
                              "portfolio_projects",
                              project.id,
                              project.title,
                            )
                          }
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="admin-list-empty">
                  No projects yet. Add the first one from the form.
                </div>
              )}
              {deletedProjects.length ? (
                <div className="admin-trash">
                  <div className="admin-trash-title">
                    <span>RECENTLY DELETED</span>
                    <strong>{deletedProjects.length} recoverable</strong>
                  </div>
                  {deletedProjects.map((project) => (
                    <div className="admin-trash-row" key={project.id}>
                      <span>{project.title}</span>
                      <button
                        disabled={recordsBusy}
                        onClick={() =>
                          void restoreRecord(
                            "portfolio_projects",
                            project.id,
                            project.title,
                          )
                        }
                        type="button"
                      >
                        ↶ Restore
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        ) : (
          <div className="admin-workspace">
            <form className="admin-editor" onSubmit={saveCertificate}>
              <div className="admin-editor-title">
                <div>
                  <span>
                    {certificateDraft.id ? "EDIT CERTIFICATE" : "NEW CERTIFICATE"}
                  </span>
                  <h2>
                    {certificateDraft.id
                      ? "Update certificate"
                      : "Add a certificate"}
                  </h2>
                </div>
                {certificateDraft.id ? (
                  <button
                    onClick={() => setCertificateDraft(emptyCertificate())}
                    type="button"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <label>
                Certificate name
                <input
                  onChange={(event) =>
                    setCertificateDraft((draft) => ({
                      ...draft,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Machine Learning Specialization"
                  required
                  value={certificateDraft.name}
                />
              </label>
              <label>
                Issuer
                <input
                  onChange={(event) =>
                    setCertificateDraft((draft) => ({
                      ...draft,
                      issuer: event.target.value,
                    }))
                  }
                  placeholder="e.g. Coursera · Stanford Online"
                  required
                  value={certificateDraft.issuer}
                />
              </label>
              <div className="admin-form-grid">
                <label>
                  Badge text
                  <input
                    onChange={(event) =>
                      setCertificateDraft((draft) => ({
                        ...draft,
                        badge: event.target.value,
                      }))
                    }
                    placeholder="Verified"
                    required
                    value={certificateDraft.badge}
                  />
                </label>
                <label>
                  Icon
                  <input
                    onChange={(event) =>
                      setCertificateDraft((draft) => ({
                        ...draft,
                        icon: event.target.value,
                      }))
                    }
                    placeholder="🎯"
                    value={certificateDraft.icon}
                  />
                </label>
              </div>
              <div className="admin-form-grid">
                <label>
                  Issue date
                  <input
                    onChange={(event) =>
                      setCertificateDraft((draft) => ({
                        ...draft,
                        issued_on: event.target.value,
                      }))
                    }
                    type="date"
                    value={certificateDraft.issued_on}
                  />
                </label>
                <label>
                  Credential URL
                  <input
                    onChange={(event) =>
                      setCertificateDraft((draft) => ({
                        ...draft,
                        credential_url: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    type="url"
                    value={certificateDraft.credential_url}
                  />
                </label>
              </div>
              <div className="admin-form-footer">
                <label>
                  Display order
                  <input
                    min={0}
                    onChange={(event) =>
                      setCertificateDraft((draft) => ({
                        ...draft,
                        display_order: Number(event.target.value),
                      }))
                    }
                    type="number"
                    value={certificateDraft.display_order}
                  />
                </label>
                <label className="admin-toggle">
                  <input
                    checked={certificateDraft.published}
                    onChange={(event) =>
                      setCertificateDraft((draft) => ({
                        ...draft,
                        published: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span />
                  Published
                </label>
              </div>
              <button
                className="admin-primary-button"
                disabled={recordsBusy}
                type="submit"
              >
                {certificateDraft.id ? "Save Changes" : "Publish Certificate"}
              </button>
            </form>

            <section
              className="admin-records"
              aria-label="Existing certificates"
            >
              <div className="admin-records-title">
                <div>
                  <span>CONTENT LIBRARY</span>
                  <h2>Existing certificates</h2>
                </div>
                <button
                  disabled={recordsBusy}
                  onClick={() => void loadRecords()}
                  type="button"
                >
                  Refresh
                </button>
              </div>
              {recordsBusy && !activeCertificates.length ? (
                <div className="admin-list-empty">Loading certificates…</div>
              ) : activeCertificates.length ? (
                <div className="admin-record-list">
                  {activeCertificates.map((certificate, index) => (
                    <article key={certificate.id}>
                      <div className="admin-record-position">
                        <div className="admin-record-order admin-record-icon">
                          {certificate.icon}
                        </div>
                        <div className="admin-order-controls">
                          <button
                            aria-label={`Move ${certificate.name} up`}
                            disabled={recordsBusy || index === 0}
                            onClick={() =>
                              void moveRecord(
                                "portfolio_certificates",
                                activeCertificates,
                                certificate.id,
                                -1,
                              )
                            }
                            title="Move up"
                            type="button"
                          >
                            ↑
                          </button>
                          <button
                            aria-label={`Move ${certificate.name} down`}
                            disabled={
                              recordsBusy ||
                              index === activeCertificates.length - 1
                            }
                            onClick={() =>
                              void moveRecord(
                                "portfolio_certificates",
                                activeCertificates,
                                certificate.id,
                                1,
                              )
                            }
                            title="Move down"
                            type="button"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <div className="admin-record-content">
                        <div>
                          <span>{certificate.issuer}</span>
                          <i
                            className={
                              certificate.published ? "live" : "draft"
                            }
                          >
                            {certificate.published ? "Published" : "Draft"}
                          </i>
                        </div>
                        <h3>{certificate.name}</h3>
                        <p>
                          {certificate.badge}
                          {certificate.issued_on
                            ? ` · ${certificate.issued_on}`
                            : ""}
                        </p>
                      </div>
                      <div className="admin-record-actions">
                        <button
                          onClick={() => editCertificate(certificate)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="danger"
                          onClick={() =>
                            void deleteRecord(
                              "portfolio_certificates",
                              certificate.id,
                              certificate.name,
                            )
                          }
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="admin-list-empty">
                  No certificates yet. Add the first one from the form.
                </div>
              )}
              {deletedCertificates.length ? (
                <div className="admin-trash">
                  <div className="admin-trash-title">
                    <span>RECENTLY DELETED</span>
                    <strong>{deletedCertificates.length} recoverable</strong>
                  </div>
                  {deletedCertificates.map((certificate) => (
                    <div className="admin-trash-row" key={certificate.id}>
                      <span>{certificate.name}</span>
                      <button
                        disabled={recordsBusy}
                        onClick={() =>
                          void restoreRecord(
                            "portfolio_certificates",
                            certificate.id,
                            certificate.name,
                          )
                        }
                        type="button"
                      >
                        ↶ Restore
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
