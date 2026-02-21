import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePostAction } from "@/app/admin/actions";
import { requireEditorUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { NavigateButton } from "@/components/ui/navigate-button";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditorUser();
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content_md, cover_image, status")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  const { data: postTags } = await supabase
    .from("blog_post_tags")
    .select("blog_tags(name)")
    .eq("post_id", id);

  const tags = (postTags ?? [])
    .map((row) => {
      const tag = row.blog_tags as { name?: string } | null;
      return tag?.name ?? "";
    })
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold">Edit Post</h1>
        <Card>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updatePostAction} className="grid gap-4">
              <input type="hidden" name="post_id" value={post.id} />
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={post.title} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={post.slug} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" name="excerpt" defaultValue={post.excerpt ?? ""} className="min-h-20" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content_md">Markdown Content</Label>
                <Textarea id="content_md" name="content_md" defaultValue={post.content_md} className="min-h-56" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input id="cover_image" name="cover_image" type="url" defaultValue={post.cover_image ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" defaultValue={tags} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={post.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </div>
              <div className="flex gap-2">
                <SubmitButton loadingText="Saving...">Save Changes</SubmitButton>
                <NavigateButton 
                    href="/admin"
                    variant="ghost"
                  >
                    Back
                </NavigateButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
