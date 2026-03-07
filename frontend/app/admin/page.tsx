import Link from "next/link";
import { requireEditorUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { deletePostAction, setPostStatusAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent,  CardFooter,  CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { NavigateButton } from "@/components/ui/navigate-button";
import { PlusCircle, FileEdit, Trash2, Globe, EyeOff, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const { role } = await requireEditorUser();
  const supabase = createAdminClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, updated_at, excerpt")
    .order("updated_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white selection:bg-blue-500/30 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl space-y-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
               <LayoutDashboard className="w-8 h-8 text-blue-400" />
             </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Blog Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1 font-medium">Manage your content • Role: <span className="text-blue-400 font-bold tracking-wide">{role}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link 
               href="/blog" 
               className="flex-1 sm:flex-none text-center px-5 py-2.5 text-sm font-bold text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
            >
              View Live Blog
            </Link>
            <Link 
               href="/admin/create" 
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              New Post
            </Link>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-white flex items-center gap-3">
                 Published & Drafts
                 <span className="px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full font-mono border border-white/5">{posts?.length || 0}</span>
               </h2>
            </div>

            {posts?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-white/5 border-white/10 flex flex-col hover:border-blue-500/30 transition-all duration-300 group backdrop-blur-sm shadow-xl hover:shadow-blue-500/10 relative overflow-hidden rounded-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                    
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <Badge 
                           variant={post.status === "published" ? "default" : "outline"}
                           className={post.status === "published" 
                             ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 border font-bold px-3 py-1 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                             : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/30 border font-bold px-3 py-1 shadow-[0_0_15px_rgba(245,158,11,0.1)]"}
                        >
                          {post.status === "published" ? <Globe className="w-3.5 h-3.5 mr-1.5" /> : <EyeOff className="w-3.5 h-3.5 mr-1.5" />}
                          {post.status}
                        </Badge>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap bg-black/40 px-2 py-1 rounded-md border border-white/5">
                          {new Date(post.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <CardTitle className="text-white text-xl font-bold leading-snug line-clamp-2 mt-2 title-tooltip" title={post.title}>
                        {post.title}
                      </CardTitle>
                      <p className="text-xs font-mono text-gray-500 truncate mt-2 bg-black/20 p-1.5 rounded border border-white/5 title-tooltip" title={`/${post.slug}`}>
                        /{post.slug}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-between relative z-10">
                       <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                         {post.excerpt || "No excerpt provided. Add an excerpt to improve SEO and give readers a preview."}
                       </p>
                    </CardContent>

                    <CardFooter className="pt-5 pb-5 border-t border-white/5 flex items-center justify-between gap-3 flex-wrap bg-gradient-to-b from-transparent to-black/40 relative z-10">
                      <div className="flex items-center gap-2 flex-1 relative">
                        <NavigateButton 
                          href={`/admin/posts/${post.id}`}
                          variant="ghost"
                          className="flex-1 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 h-10 rounded-xl font-bold transition-all hover:border-blue-500/30"
                        >
                          <FileEdit className="w-4 h-4 mr-2 text-blue-400" />
                          Edit
                        </NavigateButton>

                        <form action={setPostStatusAction} className="flex-1">
                          <input type="hidden" name="post_id" value={post.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={post.status === "published" ? "draft" : "published"}
                          />
                          <SubmitButton 
                            variant="secondary" 
                            className="w-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 h-10 rounded-xl font-bold transition-all"
                            loadingText="..."
                          >
                            {post.status === "published" ? "Set Draft" : "Publish"}
                          </SubmitButton>
                        </form>
                      </div>

                      <form action={deletePostAction}>
                        <input type="hidden" name="post_id" value={post.id} />
                        <SubmitButton variant="destructive" className="w-10 h-10 px-0 opacity-100 md:opacity-20 md:group-hover:opacity-100 transition-all bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl" loadingText="...">
                           <Trash2 className="w-4 h-4" />
                        </SubmitButton>
                      </form>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-24 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm shadow-2xl">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <LayoutDashboard className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No posts found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg">Looks like you haven&apos;t published anything yet. Create your first post to start ranking.</p>
                <Link 
                  href="/admin/create" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create First Post
                </Link>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
