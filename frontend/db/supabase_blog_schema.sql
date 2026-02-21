-- Run this in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_md text not null,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid not null references public.profiles(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;

-- Public can read published posts and tags
drop policy if exists "public_read_published_posts" on public.blog_posts;
create policy "public_read_published_posts"
on public.blog_posts
for select
using (status = 'published');

drop policy if exists "public_read_tags" on public.blog_tags;
create policy "public_read_tags"
on public.blog_tags
for select
using (true);

drop policy if exists "public_read_post_tags" on public.blog_post_tags;
create policy "public_read_post_tags"
on public.blog_post_tags
for select
using (
  exists (
    select 1
    from public.blog_posts bp
    where bp.id = blog_post_tags.post_id
      and bp.status = 'published'
  )
);

-- Owners can read own profile
drop policy if exists "user_read_own_profile" on public.profiles;
create policy "user_read_own_profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Admin/editor full access for content management
drop policy if exists "admin_editor_manage_posts" on public.blog_posts;
create policy "admin_editor_manage_posts"
on public.blog_posts
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  )
);

drop policy if exists "admin_editor_manage_tags" on public.blog_tags;
create policy "admin_editor_manage_tags"
on public.blog_tags
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  )
);

drop policy if exists "admin_editor_manage_post_tags" on public.blog_post_tags;
create policy "admin_editor_manage_post_tags"
on public.blog_post_tags
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  )
);

-- Seed initial admin role manually (replace email):
-- update public.profiles set role = 'admin' where email = 'you@example.com';
