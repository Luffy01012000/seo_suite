import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePostAction } from "@/app/admin/actions";
import { requireEditorUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ArrowLeft, ExternalLink } from "lucide-react";

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
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans pb-24">
      {/* Top Navbar for Editor */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Edit Post</h1>
            <p className="text-xs text-gray-500 font-medium">Updating existing content</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all">
            <ExternalLink className="w-4 h-4" /> View Live
          </Link>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-6 py-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />
        
        <form action={updatePostAction} className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 w-full" id="edit-post-form">
          <input type="hidden" name="post_id" value={post.id} />
          
          {/* Main Content Column (Left) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#0f0f11] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group focus-within:border-blue-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="space-y-8 relative z-10">
                {/* Title Input */}
                <div className="space-y-3">
                  <Input 
                    id="title" 
                    name="title" 
                    required 
                    defaultValue={post.title}
                    placeholder="Enter an engaging title..." 
                    className="bg-transparent border-none text-4xl lg:text-5xl font-extrabold text-white placeholder:text-gray-700 px-0 h-auto focus-visible:ring-0 shadow-none leading-tight" 
                  />
                </div>

                {/* Excerpt Input */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <Label htmlFor="excerpt" className="text-xs font-bold uppercase tracking-wider text-gray-400 flex justify-between">
                    Excerpt <span className="normal-case font-normal text-gray-600">Short summary for SEO</span>
                  </Label>
                  <Textarea 
                    id="excerpt" 
                    name="excerpt" 
                    defaultValue={post.excerpt ?? ""}
                    placeholder="Write a compelling summary..." 
                    className="min-h-24 bg-black/50 border border-white/10 text-gray-300 placeholder:text-gray-600 focus-visible:ring-blue-500/50 rounded-xl resize-y text-sm lg:text-base leading-relaxed p-4" 
                  />
                </div>

                {/* Markdown Editor */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <Label htmlFor="content_md" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Content (Markdown)
                  </Label>
                  <div className="relative group/editor">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-focus-within/editor:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                    <Textarea 
                      id="content_md" 
                      name="content_md" 
                      defaultValue={post.content_md}
                      placeholder="# Start writing your masterpiece...\n\nUse markdown for formatting." 
                      className="min-h-[500px] bg-black/50 border border-white/10 text-gray-200 placeholder:text-gray-700 focus-visible:ring-blue-500/50 rounded-xl font-mono text-sm leading-relaxed p-6 resize-y relative z-10 custom-scrollbar shadow-inner" 
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column (Right) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Action Card */}
            <div className="bg-[#0f0f11] border border-white/5 rounded-2xl p-6 shadow-xl sticky top-24">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Update
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</Label>
                  <Select id="status" name="status" defaultValue={post.status} className="bg-black/50 border-white/10 text-white focus-visible:ring-blue-500/50 rounded-xl h-12 font-medium">
                    <option value="draft" className="text-black">Draft (Hidden)</option>
                    <option value="published" className="text-black">Published (Live)</option>
                  </Select>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <SubmitButton className="w-full h-12 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all" loadingText="Saving Changes...">
                    Save Changes
                  </SubmitButton>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-[#0f0f11] border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" /> Post Metadata
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs font-bold text-gray-400 uppercase tracking-wider">URL Slug</Label>
                  <Input id="slug" name="slug" defaultValue={post.slug} required placeholder="auto-generated-from-title" className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50 rounded-xl h-11 font-mono text-xs" />
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <Label htmlFor="cover_image" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cover Image URL</Label>
                  <Input id="cover_image" name="cover_image" type="url" defaultValue={post.cover_image ?? ""} placeholder="https://example.com/image.jpg" className="bg-black/50 border-white/10 text-blue-400 placeholder:text-gray-600 focus-visible:ring-blue-500/50 rounded-xl h-11 text-sm" />
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <Label htmlFor="tags" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags</Label>
                  <Input id="tags" name="tags" defaultValue={tags} placeholder="seo, branding, web (comma separated)" className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50 rounded-xl h-11 text-sm" />
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </main>
  );
}
