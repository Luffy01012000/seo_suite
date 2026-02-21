"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEditorUser } from "@/lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function upsertTags(postId: string, tagNamesCsv: string, admin = createAdminClient()) {
  const tagNames = Array.from(
    new Set(
      tagNamesCsv
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

  await admin.from("blog_post_tags").delete().eq("post_id", postId);

  if (tagNames.length === 0) {
    return;
  }

  const tagRows = tagNames.map((name) => ({
    name,
    slug: slugify(name),
  }));

  const { data: insertedTags, error: tagError } = await admin
    .from("blog_tags")
    .upsert(tagRows, { onConflict: "slug" })
    .select("id");

  if (tagError) {
    throw new Error(tagError.message);
  }

  const links = (insertedTags ?? []).map((tag) => ({
    post_id: postId,
    tag_id: tag.id as string,
  }));

  if (links.length > 0) {
    const { error: linkError } = await admin.from("blog_post_tags").insert(links);
    if (linkError) {
      throw new Error(linkError.message);
    }
  }
}

export async function createPostAction(formData: FormData) {
  const { user } = await requireEditorUser();
  const admin = createAdminClient();

  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim() || null;
  const contentMd = String(formData.get("content_md") || "").trim();
  const coverImage = String(formData.get("cover_image") || "").trim() || null;
  const status = String(formData.get("status") || "draft");
  const tagNames = String(formData.get("tags") || "");

  if (!title || !contentMd) {
    throw new Error("Title and markdown content are required.");
  }

  const slug = slugify(slugInput || title);

  const { data: post, error } = await admin
    .from("blog_posts")
    .insert({
      slug,
      title,
      excerpt,
      content_md: contentMd,
      cover_image: coverImage,
      status,
      author_id: user.id,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await upsertTags(post.id as string, tagNames, admin);

  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin");
}

export async function updatePostAction(formData: FormData) {
  await requireEditorUser();
  const admin = createAdminClient();

  const postId = String(formData.get("post_id") || "");
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim() || null;
  const contentMd = String(formData.get("content_md") || "").trim();
  const coverImage = String(formData.get("cover_image") || "").trim() || null;
  const status = String(formData.get("status") || "draft");
  const tagNames = String(formData.get("tags") || "");

  if (!postId || !title || !contentMd) {
    throw new Error("Post id, title and content are required.");
  }

  const slug = slugify(slugInput || title);

  const { error } = await admin
    .from("blog_posts")
    .update({
      slug,
      title,
      excerpt,
      content_md: contentMd,
      cover_image: coverImage,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  await upsertTags(postId, tagNames, admin);

  revalidatePath("/admin");
  revalidatePath(`/admin/posts/${postId}`);
  revalidatePath("/blog");
  redirect("/admin");
}

export async function setPostStatusAction(formData: FormData) {
  await requireEditorUser();
  const admin = createAdminClient();

  const postId = String(formData.get("post_id") || "");
  const status = String(formData.get("status") || "draft");

  if (!postId) {
    throw new Error("Post id is required.");
  }

  const { error } = await admin
    .from("blog_posts")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/blog");
}

export async function deletePostAction(formData: FormData) {
  await requireEditorUser();
  const admin = createAdminClient();

  const postId = String(formData.get("post_id") || "");

  if (!postId) {
    throw new Error("Post id is required.");
  }

  const { error } = await admin.from("blog_posts").delete().eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/blog");
}
