export type ProfileRole = "admin" | "editor";

export type BlogStatus = "draft" | "published";

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  status: BlogStatus;
  published_at: string | null;
  updated_at: string;
};

export type PostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string;
  cover_image: string | null;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
};
