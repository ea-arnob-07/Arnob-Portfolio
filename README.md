# Arnob Portfolio

The public portfolio keeps its existing Next.js, Framer Motion, Three.js, and
Tailwind-powered experience. Every portfolio section can now be managed from a
private `/admin` page without changing code or redeploying.

## GitHub Pages deployment

This project is configured for the repository
`https://github.com/ea-arnob-07/Arnob-Portfolio` and the production URL
`https://ea-arnob-07.github.io/Arnob-Portfolio/`.

The included `.github/workflows/deploy.yml` automatically creates a static
Next.js export with the `/Arnob-Portfolio` base path and publishes it whenever
the `main` branch changes. In GitHub, open **Settings → Pages** and set
**Source** to **GitHub Actions**.

The production admin page is:

`https://ea-arnob-07.github.io/Arnob-Portfolio/admin/`

## One-time Supabase setup

The site already contains the supplied Supabase Project URL and browser-safe
publishable key. The database still needs its tables, image bucket, and
security policies. The schema is idempotent, so run it again after receiving an
updated project ZIP:

1. Open the Supabase project.
2. Open **SQL Editor** and choose **New query**.
3. Copy all of `supabase/schema.sql`, paste it into the query, and press
   **Run**.
4. Open **Authentication → URL Configuration**.
5. Set **Site URL** to
   `https://ea-arnob-07.github.io/Arnob-Portfolio/`.
6. Add both production admin forms as allowed redirect URLs:
   `https://ea-arnob-07.github.io/Arnob-Portfolio/admin` and
   `https://ea-arnob-07.github.io/Arnob-Portfolio/admin/`.
7. Open `/admin`, enter `eaarnob178@gmail.com`, choose a password with at
   least eight characters, and press **First time? Create Admin Account**.
8. Confirm the email if Supabase asks, then sign in.

The SQL imports every existing project and certificate, creates the full-site
content record and public profile-picture bucket, enables public read-only
access, and restricts every create, update, upload, and delete operation to
`eaarnob178@gmail.com`.

Never place a Supabase secret key or legacy `service_role` key in this project.
The publishable key is protected by the Row Level Security policies installed
by `supabase/schema.sql`.

### What can be managed

- Edit the name, availability badge, animated roles, hero description,
  statistics, picture, and labels around the profile picture.
- Edit every About paragraph, highlight, and personal-information row.
- Create and remove Skills tabs, categories, proficiency bars, and technology
  chips.
- Edit the recruiter snapshot and hiring call-to-action.
- Add, edit, reorder, publish, draft, move projects to Recently Deleted, and
  restore them later.
- Store title, category, description, technologies, features, GitHub URL, and
  live URL.
- Add, edit, reorder, publish, draft, move certificates to Recently Deleted,
  and restore them later.
- Store certificate name, issuer, badge, emoji icon, issue date, and
  credential URL.
- Add, edit, reorder, and remove Research and Experience entries.
- Reorder all repeatable hero, About, Skills, Research, Experience, Workshop,
  Activity, and Social items even after they have been created.
- Edit Workshops, Activities, all section headings, and footer text.
- Edit email, phone, university, map label, GitHub, LinkedIn, Facebook, social
  cards, the floating CONNECT dock, and contact-form text.
- Upload a profile picture directly to Supabase Storage, or paste an external
  image URL.
- Keep an open public portfolio tab synchronized through realtime updates,
  same-browser admin notifications, focus refreshes, and a quiet fallback
  refresh; no rebuild or deployment is required.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the portfolio and
`http://localhost:3000/admin` for content management.

---

## Vinext runtime notes

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Linux with `flock`, `curl`, and GNU `timeout`

## Sites Lifecycle

The Sites lifecycle CLI runs the locked dependency install before returning this checkout. Edit the source under `app/`, then checkpoint when a coherent milestone is ready to inspect or share. The remote Sites builder runs `npm run build` against the pushed commit. Do not repeat install or build as a normal pre-checkpoint step.

This starter does not use `wrangler.jsonc`.

`install:ci` is intentionally a single, non-retrying `npm ci`. It refuses a concurrent install for the same project, consumes a matching image-seeded npm cache with `--prefer-offline` while retaining registry fallback for a missing cache object, otherwise downloads and verifies the complete vinext tarball recorded in `package-lock.json`, limits npm to one socket, and terminates a stalled install. `build` applies a short timeout and then validates the Sites artifact. These helpers target Linux and use GNU `timeout`; they are not native macOS scripts.

Scripts that need writable project-scoped home, npm, XDG, and temporary paths use `scripts/sites-env.sh`. The `dev` and `start` scripts honor the caller's runtime environment and keep Wrangler logs inside the checkout. The generated `.sites-runtime/` directory is disposable and ignored by Git.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Diagnostic Commands

- `npm run install:ci`: perform the one bounded lockfile install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build and validate the deployable Sites artifact
- `npm run start`: start the built Vinext application
- `npm test`: build, validate, and verify the rendered development-preview metadata
- `npm run validate:artifact`: recheck an existing artifact's manifest and ESM `default.fetch` export
- `npm run db:generate`: generate Drizzle migrations after schema changes

Use build and validation commands for targeted diagnosis after a remote failure, not as part of the normal checkpoint path.

The timeout defaults can be overridden for a controlled canary with `SITES_INSTALL_TIMEOUT`, `SITES_INSTALL_KILL_AFTER`, `SITES_BUILD_TIMEOUT`, and `SITES_BUILD_KILL_AFTER`. A timeout fails the command; the helpers never retry an unchanged install or build.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
