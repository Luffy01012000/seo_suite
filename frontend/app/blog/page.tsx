import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { page = "1", tag } = await searchParams;
  const pageNum = Number.parseInt(page, 10);
  const currentPage = Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

  const supabase = await createClient();

  const relationSelect = tag
    ? "id, slug, title, excerpt, cover_image, published_at, blog_post_tags!inner(blog_tags!inner(name, slug))"
    : "id, slug, title, excerpt, cover_image, published_at, blog_post_tags(blog_tags(name, slug))";

  let query = supabase
    .from("blog_posts")
    .select(relationSelect, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

  if (tag) query = query.eq("blog_post_tags.blog_tags.slug", tag);

  const { data: posts, count } = await query;

  const { data: allTags } = await supabase.from("blog_tags").select("name, slug").order("name");

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">Blogs</h1>
          <p className="text-slate-300">Published SEO and AI strategy insights.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/blog" className={`rounded-full border px-3 py-1 text-xs ${!tag ? "border-blue-500 text-blue-400" : "border-slate-700 text-slate-300"}`}>
            All
          </Link>
          {allTags?.map((tagItem) => (
            <Link
              key={tagItem.slug}
              href={`/blog?tag=${tagItem.slug}`}
              className={`rounded-full border px-3 py-1 text-xs ${tag === tagItem.slug ? "border-blue-500 text-blue-400" : "border-slate-700 text-slate-300"}`}
            >
              {tagItem.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {posts?.length ? (
            posts.map((post) => {
              const tags = (post.blog_post_tags ?? [])
                .map((row) => {
                  const tagData = row.blog_tags as { name?: string; slug?: string } | null;
                  return tagData;
                })
                .filter(Boolean) as { name: string; slug: string }[];

              return (
                <Card key={post.id} className="overflow-hidden">
                  {post.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_image} alt={post.title} className="h-44 w-full object-cover" />
                  ) : null}
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-300">{post.excerpt ?? "No excerpt provided."}</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((item) => (
                        <Badge key={item.slug} variant="outline">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-sm text-blue-400 hover:text-blue-300">
                      Read article
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-slate-400">No published posts found.</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link
            href={`/blog?page=${Math.max(1, currentPage - 1)}${tag ? `&tag=${tag}` : ""}`}
            className={`text-slate-300 ${currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:text-white"}`}
          >
            Previous
          </Link>
          <span className="text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={`/blog?page=${Math.min(totalPages, currentPage + 1)}${tag ? `&tag=${tag}` : ""}`}
            className={`text-slate-300 ${currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:text-white"}`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}
