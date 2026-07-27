import { createClient } from "@supabase/supabase-js";
import type {
  PortfolioCertificate,
  PortfolioContent,
  PortfolioProject,
} from "./portfolio-content";
import { normalizeSiteContent } from "./site-content";

/*
 * Supabase publishable keys are intentionally safe for browser applications.
 * Every write is still protected by the Row Level Security policies in
 * supabase/schema.sql.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://cbculwufcvmnhgubnkkt.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_fpBJeqgY8GEPcCsqv-OO0Q_JNS7o4uM";

export const PORTFOLIO_ADMIN_EMAIL = "eaarnob178@gmail.com";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("cache-control", "no-cache");
        return fetch(input, {
          ...init,
          cache: "no-store",
          headers,
        });
      },
    },
  },
);

export async function fetchPublishedPortfolioContent(): Promise<PortfolioContent> {
  const [siteResult, projectsResult, certificatesResult] = await Promise.all([
    supabase
      .from("portfolio_site_content")
      .select("content, updated_at")
      .eq("id", "main")
      .maybeSingle(),
    supabase
      .from("portfolio_projects")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("portfolio_certificates")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (projectsResult.error) throw projectsResult.error;
  if (certificatesResult.error) throw certificatesResult.error;

  return {
    site: normalizeSiteContent(
      siteResult.error ? undefined : siteResult.data?.content,
    ),
    projects: (projectsResult.data ?? []) as PortfolioProject[],
    certificates: (certificatesResult.data ?? []) as PortfolioCertificate[],
  };
}
