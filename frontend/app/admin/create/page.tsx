import Link from "next/link";
import { requireEditorUser } from "@/lib/auth";
import { createPostAction } from "@/app/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ArrowLeft } from "lucide-react";

export default async function CreatePostPage() {
  const { role } = await requireEditorUser();

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Link href="/admin" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold">Create New Post</h1>
            <p className="text-sm text-slate-400 mt-1">Add a new article to your blog.</p>
          </div>
        </div>

        <Card className="bg-slate-950 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Draft details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createPostAction} className="grid gap-6">
              <div className="grid gap-2 text-white">
                <Label htmlFor="title" className="text-slate-300">Title</Label>
                <Input id="title" name="title" required className="bg-slate-900 border-slate-700 focus-visible:ring-blue-500" />
              </div>
              <div className="grid gap-2 text-white">
                <Label htmlFor="slug" className="text-slate-300">Slug (optional)</Label>
                <Input id="slug" name="slug" placeholder="auto-generated-from-title" className="bg-slate-900 border-slate-700 focus-visible:ring-blue-500" />
              </div>
              <div className="grid gap-2 text-white">
                <Label htmlFor="excerpt" className="text-slate-300">Excerpt</Label>
                <Textarea id="excerpt" name="excerpt" className="min-h-20 bg-slate-900 border-slate-700 focus-visible:ring-blue-500" />
              </div>
              <div className="grid gap-2 text-white">
                <Label htmlFor="content_md" className="text-slate-300">Markdown Content</Label>
                <Textarea id="content_md" name="content_md" className="min-h-72 bg-slate-900 border-slate-700 focus-visible:ring-blue-500 font-mono" required />
              </div>
              <div className="grid gap-2 text-white">
                <Label htmlFor="cover_image" className="text-slate-300">Cover Image URL</Label>
                <Input id="cover_image" name="cover_image" type="url" placeholder="https://..." className="bg-slate-900 border-slate-700 focus-visible:ring-blue-500" />
              </div>
              <div className="grid gap-2 text-white">
                <Label htmlFor="tags" className="text-slate-300">Tags (comma separated)</Label>
                <Input id="tags" name="tags" placeholder="seo, ai, content" className="bg-slate-900 border-slate-700 focus-visible:ring-blue-500" />
              </div>
              <div className="grid gap-2 text-white">
                <Label htmlFor="status" className="text-slate-300">Status</Label>
                <Select id="status" name="status" defaultValue="draft" className="bg-slate-900 border-slate-700 text-white">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </div>
              <div className="pt-4">
                <SubmitButton className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" loadingText="Creating...">
                  Publish Post
                </SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
