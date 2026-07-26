-- Arnob Portfolio CMS
-- Run this file in Supabase Dashboard -> SQL Editor -> New query.
-- It is safe to run again whenever this schema file is updated.
-- It creates the content tables, imports the current portfolio content,
-- and allows writes only from the approved admin email.

create extension if not exists pgcrypto;

create table if not exists public.portfolio_admins (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint portfolio_admins_email_lowercase check (email = lower(email))
);

insert into public.portfolio_admins (email)
values ('eaarnob178@gmail.com')
on conflict (email) do nothing;

alter table public.portfolio_admins enable row level security;
revoke all on table public.portfolio_admins from anon, authenticated;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolio_admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text not null,
  tags text[] not null default array[]::text[],
  features text[] not null default array[]::text[],
  github_url text,
  live_url text,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_projects_slug_present check (char_length(trim(slug)) > 0),
  constraint portfolio_projects_title_present check (char_length(trim(title)) > 0),
  constraint portfolio_projects_order_nonnegative check (display_order >= 0)
);

create table if not exists public.portfolio_certificates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  issuer text not null,
  badge text not null default 'Verified',
  icon text not null default '🎯',
  issued_on date,
  credential_url text,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_certificates_slug_present check (char_length(trim(slug)) > 0),
  constraint portfolio_certificates_name_present check (char_length(trim(name)) > 0),
  constraint portfolio_certificates_order_nonnegative check (display_order >= 0)
);

create table if not exists public.portfolio_site_content (
  id text primary key default 'main',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_site_content_single_row check (id = 'main'),
  constraint portfolio_site_content_is_object
    check (jsonb_typeof(content) = 'object')
);

create or replace function public.set_portfolio_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_projects_set_updated_at
on public.portfolio_projects;
create trigger portfolio_projects_set_updated_at
before update on public.portfolio_projects
for each row execute function public.set_portfolio_updated_at();

drop trigger if exists portfolio_certificates_set_updated_at
on public.portfolio_certificates;
create trigger portfolio_certificates_set_updated_at
before update on public.portfolio_certificates
for each row execute function public.set_portfolio_updated_at();

drop trigger if exists portfolio_site_content_set_updated_at
on public.portfolio_site_content;
create trigger portfolio_site_content_set_updated_at
before update on public.portfolio_site_content
for each row execute function public.set_portfolio_updated_at();

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_certificates enable row level security;
alter table public.portfolio_site_content enable row level security;

drop policy if exists portfolio_projects_public_read
on public.portfolio_projects;
create policy portfolio_projects_public_read
on public.portfolio_projects
for select
to anon, authenticated
using (published = true);

drop policy if exists portfolio_projects_admin_all
on public.portfolio_projects;
create policy portfolio_projects_admin_all
on public.portfolio_projects
for all
to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

drop policy if exists portfolio_certificates_public_read
on public.portfolio_certificates;
create policy portfolio_certificates_public_read
on public.portfolio_certificates
for select
to anon, authenticated
using (published = true);

drop policy if exists portfolio_certificates_admin_all
on public.portfolio_certificates;
create policy portfolio_certificates_admin_all
on public.portfolio_certificates
for all
to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

drop policy if exists portfolio_site_content_public_read
on public.portfolio_site_content;
create policy portfolio_site_content_public_read
on public.portfolio_site_content
for select
to anon, authenticated
using (true);

drop policy if exists portfolio_site_content_admin_all
on public.portfolio_site_content;
create policy portfolio_site_content_admin_all
on public.portfolio_site_content
for all
to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

grant select on table public.portfolio_projects to anon, authenticated;
grant insert, update, delete on table public.portfolio_projects to authenticated;
grant select on table public.portfolio_certificates to anon, authenticated;
grant insert, update, delete on table public.portfolio_certificates to authenticated;
grant select on table public.portfolio_site_content to anon, authenticated;
grant insert, update, delete on table public.portfolio_site_content
to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists portfolio_media_public_read
on storage.objects;
create policy portfolio_media_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

drop policy if exists portfolio_media_admin_insert
on storage.objects;
create policy portfolio_media_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);

drop policy if exists portfolio_media_admin_update
on storage.objects;
create policy portfolio_media_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
)
with check (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);

drop policy if exists portfolio_media_admin_delete
on storage.objects;
create policy portfolio_media_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);

insert into public.portfolio_projects (
  slug,
  title,
  category,
  description,
  tags,
  features,
  github_url,
  live_url,
  display_order,
  published
)
values
  (
    'atm-machine-system',
    'ATM Machine System',
    'Java + MySQL',
    'A fully functional ATM simulation featuring core banking operations, secure PIN authentication, and a polished Java Swing interface backed by a live MySQL database.',
    array['Java', 'MySQL', 'Java Swing', 'JDBC', 'OOP'],
    array[
      'Account creation, deposit, withdrawal & fund transfer',
      'PIN-secured multi-user authentication',
      'Transaction history with receipt generation',
      'Improved NetBeans UI with custom components'
    ],
    'https://github.com/ea-arnob-07?tab=repositories',
    null,
    1,
    true
  ),
  (
    'shell-system-administration-toolkit',
    'Shell-Based System Administration Toolkit',
    'Bash CLI',
    'A comprehensive Bash CLI project automating critical sysadmin tasks through modular, reusable shell scripts with a structured menu-driven interface.',
    array['Bash', 'Shell Script', 'Linux', 'CSV Export'],
    array[
      'User monitoring & automated disk cleanup',
      'Backup management & system health analysis',
      'Student management & attendance tracking module',
      'CSV data export pipeline for reporting'
    ],
    'https://github.com/ea-arnob-07?tab=repositories',
    null,
    2,
    true
  ),
  (
    'logicscript-compiler',
    'LogicScript Compiler',
    'Compiler Design',
    'A lightweight interpreter-based compiler for a custom logic scripting language built using Lex and Yacc — demonstrating the full compiler pipeline.',
    array['Lex / Flex', 'Yacc / Bison', 'C', 'Compiler Theory'],
    array[
      'Custom grammar for a logic-based scripting language',
      'Lexical analysis — tokenizer built with Flex',
      'Syntax parsing & semantic analysis via Bison',
      'Interpreter execution engine for parsed AST'
    ],
    'https://github.com/ea-arnob-07?tab=repositories',
    null,
    3,
    true
  )
on conflict (slug) do nothing;

insert into public.portfolio_certificates (
  slug,
  name,
  issuer,
  badge,
  icon,
  issued_on,
  credential_url,
  display_order,
  published
)
values
  (
    'cpc-programming-certificate',
    'CPC Programming Certificate',
    'Competitive Programming Contest',
    'Verified',
    '🏆',
    null,
    null,
    1,
    true
  ),
  (
    'ai-agents-for-beginners',
    'AI Agents for Beginners',
    'Simplilearn SkillUp - Online Certificate',
    'Verified',
    '🤖',
    null,
    null,
    2,
    true
  ),
  (
    'embedded-system-iot-workshop',
    'Embedded System & IoT Workshop',
    'Workshop Certificate',
    'Champion Award',
    '🏆',
    null,
    null,
    3,
    true
  ),
  (
    'academic-excellence-award',
    'Academic Excellence Award',
    'CGPA 4.00/4.00',
    'Verified',
    '📊',
    null,
    null,
    4,
    true
  ),
  (
    'district-mathematics-olympiad',
    'District Mathematics Olympiad',
    'All of the Secondary Schools of Pabna District',
    'Champion Award',
    '🏆',
    null,
    null,
    5,
    true
  ),
  (
    'skillup-certification',
    'SkillUp Certification',
    'Machine Learning Algorithms',
    'Verified',
    '🎯',
    null,
    null,
    6,
    true
  ),
  (
    'goedu-certification',
    'GOEDU Certification',
    'Multiple Online Certifications',
    'Verified',
    '🎯',
    null,
    null,
    7,
    true
  ),
  (
    'aws-academy-certification',
    'AWS Academy Certification',
    'Cloud Security Foundations',
    'Verified',
    '🎯',
    null,
    null,
    8,
    true
  )
on conflict (slug) do nothing;
