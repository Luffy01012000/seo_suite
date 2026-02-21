/**
 * Seed script — creates admin user + dummy blog posts.
 * Run from the frontend directory:  bun scripts/seed.ts
 *
 * Reads from .env automatically via Bun's built-in dotenv support.
 */

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Config — loaded from environment
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌  Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)."
  );
  process.exit(1);
}

const ADMIN_EMAIL = "admin@seo-suite.local";
const ADMIN_PASSWORD = "Admin@123456";

// ---------------------------------------------------------------------------
// Supabase admin client (service role — bypasses RLS)
// ---------------------------------------------------------------------------
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function log(icon: string, msg: string) {
  console.log(`${icon}  ${msg}`);
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const TAGS = [
  "SEO",
  "AI",
  "Content Strategy",
  "Keywords",
  "Technical SEO",
  "Link Building",
  "Analytics",
];

interface SeedPost {
  title: string;
  slug?: string;
  excerpt: string;
  content_md: string;
  cover_image: string | null;
  status: "published" | "draft";
  tags: string[];
  published_at: string | null;
}

const POSTS: SeedPost[] = [
  {
    title: "How AI Is Transforming Modern SEO Strategies",
    excerpt:
      "Discover how artificial intelligence is reshaping the way businesses approach search engine optimisation — from keyword research to content generation.",
    cover_image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    tags: ["AI", "SEO", "Content Strategy"],
    content_md: `# How AI Is Transforming Modern SEO Strategies

Artificial intelligence is no longer a buzzword — it's the backbone of modern SEO.

## What Changed?

Traditional SEO relied heavily on keyword density and backlink counts. AI flips this on its head:

- **Intent understanding** — search engines now grasp *why* a user is searching, not just *what*
- **Content quality signals** — thin, keyword-stuffed pages are penalised; depth wins
- **Automated insights** — AI tools surface opportunities that would take analysts weeks to find

## How to Adapt

1. **Focus on topical authority** — own a subject area, not just individual keywords
2. **Use AI for research, not replacement** — let AI surface ideas, but write with your own voice
3. **Optimise for entities** — Google's Knowledge Graph cares about people, places, and things

## Conclusion

Teams that embrace AI as a co-pilot — not a replacement — will consistently outrank those who don't.
`,
  },
  {
    title: "The Ultimate Guide to Long-Tail Keyword Research in 2025",
    excerpt:
      "Long-tail keywords drive 70 % of all search traffic. Here is how to find and use them effectively to outrank larger competitors.",
    cover_image:
      "https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=800&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    tags: ["Keywords", "SEO"],
    content_md: `# The Ultimate Guide to Long-Tail Keyword Research in 2025

Long-tail keywords are the unsung heroes of SEO. While they have lower individual search volumes, their **conversion rates are typically 3–5× higher** than head terms.

## Why Long-Tail Works

| Metric | Head Term | Long-Tail |
|---|---|---|
| Monthly Searches | 50k+ | 50–500 |
| Competition | Very High | Low–Medium |
| Conversion Rate | ~1% | ~3–5% |

## Step-by-Step Research Process

### 1. Start With a Seed Keyword
Begin with a broad topic, e.g. *"content marketing"*.

### 2. Use AI-Powered Suggestion Tools
Paste the seed into our **Keyword Suggestion** module. Filter for:
- Search volume: 50–2000/month
- Keyword difficulty: under 40

### 3. Cluster Related Terms
Group related long-tails into topic clusters. One pillar page + several supporting pages beats ten isolated articles.

### 4. Validate Search Intent
Check the top 10 results. If they're all product pages but you plan to write a blog post, reconsider targeting that keyword.

## Pro Tips

- Questions (who, what, how, why) make great long-tails — they match featured snippet formats
- Seasonal long-tails spike predictably — plan content 6–8 weeks in advance
- Location-modified terms ("best SEO tool for startups in India") convert extremely well
`,
  },
  {
    title: "Core Web Vitals: A Technical SEO Checklist for 2025",
    excerpt:
      "Google's Core Web Vitals remain a confirmed ranking factor. This checklist covers LCP, INP, and CLS — and exactly how to fix each one.",
    cover_image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    tags: ["Technical SEO", "Analytics"],
    content_md: `# Core Web Vitals: A Technical SEO Checklist for 2025

Google's Page Experience signals — anchored by Core Web Vitals — directly influence your rankings. Here's the definitive checklist.

## The Three Metrics

| Metric | What It Measures | Good Threshold |
|---|---|---|
| **LCP** — Largest Contentful Paint | Load speed of main content | ≤ 2.5 s |
| **INP** — Interaction to Next Paint | Responsiveness to user input | ≤ 200 ms |
| **CLS** — Cumulative Layout Shift | Visual stability | ≤ 0.1 |

## LCP Checklist

- [ ] Serve images in WebP/AVIF format
- [ ] Add \`fetchpriority="high"\` to the hero image
- [ ] Use a CDN with edge caching
- [ ] Preload critical fonts with \`<link rel="preload">\`

## INP Checklist

- [ ] Break up long JavaScript tasks (> 50 ms) with \`scheduler.yield()\`
- [ ] Defer non-critical third-party scripts
- [ ] Use React \`startTransition\` for non-urgent state updates

## CLS Checklist

- [ ] Always specify \`width\` and \`height\` on images
- [ ] Avoid inserting content above existing content (e.g. banners, cookie notices)
- [ ] Pre-reserve space for ads and embeds

## Tools to Audit

1. **PageSpeed Insights** — real-world field data (CrUX)
2. **Chrome DevTools → Performance** — lab data with flame charts
3. **Lighthouse CI** — automated checks in your CI pipeline
`,
  },
  {
    title: "Writing SEO Content That Ranks AND Converts",
    excerpt:
      "Ranking on page one is only half the battle. Learn the content frameworks that turn organic visitors into paying customers.",
    cover_image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    tags: ["Content Strategy", "SEO"],
    content_md: `# Writing SEO Content That Ranks AND Converts

Most "SEO content" focuses entirely on ranking. But traffic that doesn't convert is just a vanity metric.

## The AIDA Framework for SEO

**Attention → Interest → Desire → Action**

Every piece of content should move the reader through this funnel.

### Attention (Title + Introduction)
- Include the primary keyword naturally in the H1
- Open with a bold stat, question, or contrarian claim
- Promise a specific outcome: *"By the end of this guide, you'll know exactly how to..."*

### Interest (Problem Agitation)
- Describe the problem in detail — better than the reader could themselves
- Use real numbers and scenarios

### Desire (The Solution)
- Present your solution as the logical answer to the problem
- Use case studies, screenshots, and data

### Action (CTA)
- One primary CTA per article — don't confuse the reader
- Make it frictionless: *"Start your free analysis →"*

## E-E-A-T Signals

Google's quality guidelines emphasise **Experience, Expertise, Authority, Trust**:

- Add author bylines with credentials
- Link to authoritative external sources
- Include date of last update
- Cite original research or data

## Conversion Optimisation Tips

1. **In-line CTAs** outperform sidebar CTAs by ~3×
2. **Content upgrades** (downloadable PDF of the article) capture emails effectively
3. **FAQ sections** target featured snippets AND address purchase objections simultaneously
`,
  },
  {
    title: "Link Building in 2025: What Still Works and What Doesn't",
    excerpt:
      "Backlinks remain the #1 off-page ranking factor. But tactics from 2015 will get you penalised today. Here is what actually works now.",
    cover_image:
      "https://images.unsplash.com/photo-1562577309-2592ab84b1bc?w=800&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    tags: ["Link Building", "SEO"],
    content_md: `# Link Building in 2025: What Still Works and What Doesn't

Google's Spam Updates have killed many old-school link building tactics. Here is the honest picture.

## ❌ What No Longer Works

- **PBNs (Private Blog Networks)** — detectable at scale, heavy penalty risk
- **Guest post farms** — links from sites that publish anything for anyone
- **Comment spam** — nofollow + manual action risk
- **Directory submissions** (low-quality) — zero value

## ✅ What Works in 2025

### Digital PR
Create genuinely newsworthy content — original research, surveys, data studies. Pitch to journalists. Earn editorial links from high-DA publications.

### Link Reclamation
Find unlinked brand mentions using Google Alerts or Ahrefs. Email the author asking to add a link — ~35% conversion rate with no extra content required.

### Broken Link Building
Find broken external links on authoritative pages. Create the replacement content. Suggest your URL.

### HARO / Connectively
Answer journalist queries. Get cited as an expert source with a link back.

### Competitor Backlink Analysis
Export your competitors' backlink profiles. Identify referring domains that link to multiple competitors — these are "link building hubs" that are receptive to your outreach.

## Key Takeaway

Quality > quantity. Ten links from DR 70+ relevant sites outperform 1,000 links from irrelevant DA 20 sites.
`,
  },
  {
    title: "How to Set Up SEO Analytics the Right Way",
    excerpt:
      "Most teams track vanity metrics. Learn how to set up Google Analytics 4 and Search Console to measure what actually matters for SEO growth.",
    cover_image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    tags: ["Analytics", "SEO", "Technical SEO"],
    content_md: `# How to Set Up SEO Analytics the Right Way

If you can't measure it, you can't improve it. Most teams are flying blind — here's how to fix that.

## The Essential Stack

1. **Google Search Console (GSC)** — clicks, impressions, CTR, average position per query
2. **Google Analytics 4 (GA4)** — sessions, engagement, conversions from organic
3. **Your rank tracker** — daily position tracking for target keywords

## Search Console Setup Checklist

- [ ] Verify your domain (DNS or HTML tag)
- [ ] Submit your XML sitemap
- [ ] Link GSC to GA4 (Property Settings → Linked Products)
- [ ] Set up email alerts for manual actions

## GA4 Key Events to Track

| Event | Why It Matters |
|---|---|
| \`page_view\` | Traffic trends by landing page |
| \`session_start\` | Organic session volume |
| \`generate_lead\` | Form submissions from organic |
| \`purchase\` | Revenue attributed to organic |

## The Metrics That Actually Matter

**Avoid**: Raw traffic, number of indexed pages, DA/PA scores
**Track**: Organic traffic to money pages, organic conversion rate, keyword visibility trend, page-level organic revenue

## Monthly SEO Review Template

1. Keyword position changes (up/down >5 positions)
2. Pages losing organic traffic (investigate and fix)
3. Pages gaining traffic (double down with internal links)
4. New ranking opportunities (queries with impressions but 0 clicks)
`,
  },
  {
    title: "AI-Generated Content and SEO: The Definitive Guide (Draft)",
    excerpt:
      "Can AI-written content rank? What does Google really think? This draft explores the nuanced reality and how to use AI responsibly.",
    cover_image: null,
    status: "draft",
    published_at: null,
    tags: ["AI", "Content Strategy"],
    content_md: `# AI-Generated Content and SEO: The Definitive Guide

_This post is still a draft — more sections coming soon._

## Google's Official Position

Google does not penalise AI-generated content per se. Their spam policies target content created **primarily to manipulate rankings**, regardless of how it was produced.

Key quote from Google's guidance:
> "Generating content primarily for search engines rather than humans is against our spam policy."

## What This Means in Practice

- AI content that is **accurate, helpful, and well-edited** can rank
- AI content that is **thin, hallucinated, or keyword-stuffed** will not rank and may be penalised
- The bar is quality, not origin

## How to Use AI Responsibly for SEO Content

1. Use AI to **research and outline** — not to publish first drafts verbatim
2. **Fact-check everything** — LLMs hallucinate statistics and citations
3. Add **personal experience and original insight** that AI cannot replicate
4. Run through an editor pass for tone and brand voice

_[More sections: Case studies, tool comparisons, workflow guide — coming soon]_
`,
  },
  {
    title: "Topical Authority: The Future of SEO Content Strategy",
    excerpt:
      "Individual blog posts no longer win rankings alone. Building topical authority through content clusters is how the best SEO teams dominate their niches.",
    cover_image: null,
    status: "draft",
    published_at: null,
    tags: ["Content Strategy", "Keywords", "SEO"],
    content_md: `# Topical Authority: The Future of SEO Content Strategy

_Draft — outlining phase_

## What Is Topical Authority?

Topical authority is Google's way of measuring how comprehensively a site covers a subject area. A site that has 50 deeply interconnected articles on "email marketing" will outrank a site with one article — even if that one article has more backlinks.

## The Pillar-Cluster Model

\`\`\`
Pillar Page: "Complete Guide to Email Marketing"
    ├── Cluster: "Email subject line best practices"
    ├── Cluster: "How to segment your email list"
    ├── Cluster: "Email deliverability guide"
    ├── Cluster: "Welcome email sequence templates"
    └── Cluster: "Email A/B testing"
\`\`\`

Every cluster page links back to the pillar. The pillar links out to all clusters. This creates a dense internal linking structure that signals topical depth.

## How to Build a Topical Map

1. Choose your core topic (e.g. "SEO for SaaS")
2. Use keyword research to find all sub-topics
3. Group sub-topics into clusters of 4–8 articles
4. Identify the pillar page for each cluster
5. Build out content in priority order (highest traffic potential first)

_[Sections to add: Case study, tools for topical mapping, how to audit existing content for gaps]_
`,
  },
];

// ---------------------------------------------------------------------------
// Main seeder
// ---------------------------------------------------------------------------
async function main() {
  console.log("\n🌱  Starting seed...\n");

  // ------------------------------------------------------------------
  // 1. Create admin user (idempotent — checks if already exists)
  // ------------------------------------------------------------------
  log("👤", `Creating admin user: ${ADMIN_EMAIL}`);

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  let adminId: string;

  const existing = existingUsers?.users.find((u) => u.email === ADMIN_EMAIL);

  if (existing) {
    log("  ↩", "Admin user already exists — skipping creation");
    adminId = existing.id;
  } else {
    const { data: newUser, error: userError } =
      await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Admin" },
      });

    if (userError || !newUser.user) {
      console.error("❌  Failed to create admin user:", userError?.message);
      process.exit(1);
    }

    adminId = newUser.user.id;
    log("  ✓", `Created user with id: ${adminId}`);
  }

  // ------------------------------------------------------------------
  // 2. Upsert profile with role: admin
  // ------------------------------------------------------------------
  log("🔑", "Setting admin role in profiles table");

  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: adminId, email: ADMIN_EMAIL, role: "admin" },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("❌  Failed to upsert profile:", profileError.message);
    process.exit(1);
  }
  log("  ✓", "Profile role set to admin");

  // ------------------------------------------------------------------
  // 3. Upsert tags
  // ------------------------------------------------------------------
  log("🏷️ ", "Upserting tags");

  const tagRows = TAGS.map((name) => ({ name, slug: slugify(name) }));

  const { data: insertedTags, error: tagError } = await supabase
    .from("blog_tags")
    .upsert(tagRows, { onConflict: "slug" })
    .select("id, name, slug");

  if (tagError || !insertedTags) {
    console.error("❌  Failed to upsert tags:", tagError?.message);
    process.exit(1);
  }

  const tagMap = new Map(insertedTags.map((t) => [t.name, t.id as string]));
  log("  ✓", `${insertedTags.length} tags ready`);

  // ------------------------------------------------------------------
  // 4. Seed blog posts
  // ------------------------------------------------------------------
  log("📝", `Seeding ${POSTS.length} blog posts`);

  for (const post of POSTS) {
    const slug = post.slug ?? slugify(post.title);

    // Check if post with this slug already exists
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    let postId: string;

    if (existing) {
      log("  ↩", `Post already exists: "${post.title}" — skipping`);
      postId = existing.id as string;
    } else {
      const { data: newPost, error: postError } = await supabase
        .from("blog_posts")
        .insert({
          slug,
          title: post.title,
          excerpt: post.excerpt,
          content_md: post.content_md,
          cover_image: post.cover_image,
          status: post.status,
          author_id: adminId,
          published_at: post.published_at,
        })
        .select("id")
        .single();

      if (postError || !newPost) {
        console.error(`❌  Failed to insert "${post.title}":`, postError?.message);
        continue;
      }

      postId = newPost.id as string;
      log("  ✓", `"${post.title}" [${post.status}]`);
    }

    // Link tags
    if (post.tags.length > 0) {
      const links = post.tags
        .map((tagName) => tagMap.get(tagName))
        .filter(Boolean)
        .map((tagId) => ({ post_id: postId, tag_id: tagId as string }));

      if (links.length > 0) {
        // Remove existing links first to avoid duplicates
        await supabase.from("blog_post_tags").delete().eq("post_id", postId);

        const { error: linkError } = await supabase
          .from("blog_post_tags")
          .insert(links);

        if (linkError) {
          console.error(`    ⚠  Tag linking failed for "${post.title}":`, linkError.message);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Done
  // ------------------------------------------------------------------
  console.log("\n✅  Seed complete!\n");
  console.log("   🌐  Blog:   http://localhost:3000/blog");
  console.log("   🔐  Login:  http://localhost:3000/login");
  console.log(`   📧  Email:  ${ADMIN_EMAIL}`);
  console.log(`   🔑  Pass:   ${ADMIN_PASSWORD}`);
  console.log("   🛠️   Admin:  http://localhost:3000/admin\n");
}

main().catch((err) => {
  console.error("❌  Unexpected error:", err);
  process.exit(1);
});
