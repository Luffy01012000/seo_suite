## Frontend Setup (Next.js + Supabase)

### 1. Install dependencies

Use your package manager (`npm`, `pnpm`, `yarn`, or `bun`) in `frontend/`.

### 2. Configure environment variables

Create `.env` from `.env.example` and fill:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

`SUPABASE_SECRET_KEY` is server-only and used by admin server actions.

### 3. Initialize Supabase schema

Run SQL in `db/supabase_blog_schema.sql` in Supabase SQL Editor.

Then seed your first admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### 4. Run development server

```bash
npm run dev
```

### Routes

- Public blog: `/blog`, `/blog/[slug]`
- Login: `/login`
- Admin dashboard: `/admin`
- Edit post: `/admin/posts/[id]`

### Notes

- `/admin` is middleware-protected and role-checked (`admin` / `editor`) on server routes/actions.
- Existing FastAPI endpoints are unchanged.
