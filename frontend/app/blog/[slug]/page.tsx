import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, content_md, cover_image, published_at, blog_post_tags(blog_tags(name, slug))")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    notFound();
  }

  const tags = (post.blog_post_tags ?? [])
    .map((row) => {
      const tagData = row.blog_tags as { name?: string; slug?: string } | null;
      return tagData;
    })
    .filter(Boolean) as { name: string; slug: string }[];

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <article className="prose prose-invert mx-auto max-w-3xl prose-headings:text-white prose-p:text-slate-200">
        <h1>{post.title}</h1>
        {post.excerpt ? <p className="lead">{post.excerpt}</p> : null}
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.slug} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_image} alt={post.title} className="h-auto w-full rounded-lg" />
        ) : null}
        <ReactMarkdown>{post.content_md}</ReactMarkdown>
      </article>
    </main>
  );
}
