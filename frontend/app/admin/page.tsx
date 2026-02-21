import Link from "next/link";
import { requireEditorUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPostAction, deletePostAction, setPostStatusAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { NavigateButton } from "@/components/ui/navigate-button";

export default async function AdminPage() {
  const { role } = await requireEditorUser();
  const supabase = createAdminClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Blog Admin</h1>
            <p className="text-sm text-slate-300">Role: {role}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/blog" className="text-sm text-blue-400 hover:text-blue-300">
              View Blog
            </Link>
            <Link href="/logout" className="text-sm text-slate-300 hover:text-white">
              Logout
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createPostAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input id="slug" name="slug" placeholder="auto-generated-from-title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" name="excerpt" className="min-h-20" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content_md">Markdown Content</Label>
                <Textarea id="content_md" name="content_md" className="min-h-56" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input id="cover_image" name="cover_image" type="url" placeholder="https://..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" placeholder="seo, ai, content" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue="draft">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </div>
              <SubmitButton className="w-fit" loadingText="Creating...">
                Create Post
              </SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts?.length ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-950 p-3"
                  >
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-slate-400">/{post.slug}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={post.status === "published" ? "default" : "outline"}>{post.status}</Badge>

                      <form action={setPostStatusAction}>
                        <input type="hidden" name="post_id" value={post.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={post.status === "published" ? "draft" : "published"}
                        />
                        <SubmitButton variant="secondary" loadingText={post.status === "published" ? "Unpublishing..." : "Publishing..."}>
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </SubmitButton>
                      </form>

                      <NavigateButton 
                        href={`/admin/posts/${post.id}`}
                        variant="ghost"
                      >
                        Edit
                      </NavigateButton>

                      <form action={deletePostAction}>
                        <input type="hidden" name="post_id" value={post.id} />
                        <SubmitButton variant="destructive" loadingText="Deleting...">
                          Delete
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No posts yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
