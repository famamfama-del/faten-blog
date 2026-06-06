"use client"

import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface Post {
  id: string
  title: string
  content: string
  sectionId: string
  likes: number
  likedBy: string[]
  comments: Comment[]
  createdAt: string
  featured: boolean
  views: number
  image: string
}

export interface Section {
  id: string
  name: string
  icon: string
  createdAt: string
}

export interface BlogInfo {
  name: string
  description: string
  about: string
  coverImage: string
}

export interface Subscriber {
  id: string
  email: string
  createdAt: string
}

export interface BlogData {
  info: BlogInfo
  sections: Section[]
  posts: Post[]
  subscribers: Subscriber[]
}

const defaultBlogData: BlogData = {
  info: {
    name: "",
    description: "",
    about: "",
    coverImage: "",
  },
  sections: [],
  posts: [],
  subscribers: [],
}

// Fetches the entire blog dataset from Supabase and reshapes it to BlogData
export async function getBlogData(): Promise<BlogData> {
  const [infoRes, sectionsRes, postsRes, commentsRes, likesRes, subsRes] = await Promise.all([
    supabase.from("blog_info").select("*").eq("id", 1).maybeSingle(),
    supabase.from("sections").select("*").order("created_at", { ascending: true }),
    supabase.from("posts").select("*").order("created_at", { ascending: true }),
    supabase.from("comments").select("*").order("created_at", { ascending: true }),
    supabase.from("post_likes").select("*"),
    supabase.from("subscribers").select("*").order("created_at", { ascending: true }),
  ])

  const info: BlogInfo = infoRes.data
    ? {
        name: infoRes.data.name ?? "",
        description: infoRes.data.description ?? "",
        about: infoRes.data.about ?? "",
        coverImage: infoRes.data.cover_image ?? "",
      }
    : { ...defaultBlogData.info }

  const sections: Section[] = (sectionsRes.data ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    icon: s.icon ?? "folder",
    createdAt: s.created_at,
  }))

  const commentsByPost = new Map<string, Comment[]>()
  for (const c of commentsRes.data ?? []) {
    const list = commentsByPost.get(c.post_id) ?? []
    list.push({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.created_at,
    })
    commentsByPost.set(c.post_id, list)
  }

  const likesByPost = new Map<string, string[]>()
  for (const l of likesRes.data ?? []) {
    const list = likesByPost.get(l.post_id) ?? []
    list.push(l.visitor_id)
    likesByPost.set(l.post_id, list)
  }

  const posts: Post[] = (postsRes.data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    sectionId: p.section_id ?? "",
    likes: p.likes ?? 0,
    likedBy: likesByPost.get(p.id) ?? [],
    comments: commentsByPost.get(p.id) ?? [],
    createdAt: p.created_at,
    featured: p.featured ?? false,
    views: p.views ?? 0,
    image: p.image ?? "",
  }))

  const subscribers: Subscriber[] = (subsRes.data ?? []).map((s: any) => ({
    id: s.id,
    email: s.email,
    createdAt: s.created_at,
  }))

  return { info, sections, posts, subscribers }
}

export async function updateBlogInfo(info: BlogInfo): Promise<BlogData> {
  await supabase.from("blog_info").upsert({
    id: 1,
    name: info.name,
    description: info.description,
    about: info.about,
    cover_image: info.coverImage,
  })
  return getBlogData()
}

export async function addSection(name: string, icon = "folder"): Promise<BlogData> {
  await supabase.from("sections").insert({
    id: Date.now().toString(),
    name,
    icon,
  })
  return getBlogData()
}

export async function deleteSection(id: string): Promise<BlogData> {
  // Posts (and their comments/likes) cascade via the foreign key on delete
  await supabase.from("sections").delete().eq("id", id)
  return getBlogData()
}

export async function addPost(
  title: string,
  content: string,
  sectionId: string,
  featured = false,
  image = "",
): Promise<BlogData> {
  await supabase.from("posts").insert({
    id: Date.now().toString(),
    title,
    content,
    section_id: sectionId,
    likes: 0,
    featured,
    views: 0,
    image,
  })
  return getBlogData()
}

export async function deletePost(id: string): Promise<BlogData> {
  await supabase.from("posts").delete().eq("id", id)
  return getBlogData()
}

export async function updatePost(
  id: string,
  title: string,
  content: string,
  sectionId: string,
  featured = false,
  image = "",
): Promise<BlogData> {
  await supabase
    .from("posts")
    .update({
      title,
      content,
      section_id: sectionId,
      featured,
      image,
    })
    .eq("id", id)
  return getBlogData()
}

export async function toggleLike(postId: string, visitorId: string): Promise<BlogData> {
  const { data: existing } = await supabase
    .from("post_likes")
    .select("visitor_id")
    .eq("post_id", postId)
    .eq("visitor_id", visitorId)
    .maybeSingle()

  const { data: postRow } = await supabase.from("posts").select("likes").eq("id", postId).maybeSingle()
  const currentLikes = postRow?.likes ?? 0

  if (existing) {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("visitor_id", visitorId)
    await supabase
      .from("posts")
      .update({ likes: Math.max(0, currentLikes - 1) })
      .eq("id", postId)
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, visitor_id: visitorId })
    await supabase
      .from("posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", postId)
  }
  return getBlogData()
}

export async function incrementViews(postId: string): Promise<BlogData> {
  const { data: postRow } = await supabase.from("posts").select("views").eq("id", postId).maybeSingle()
  const currentViews = postRow?.views ?? 0
  await supabase
    .from("posts")
    .update({ views: currentViews + 1 })
    .eq("id", postId)
  return getBlogData()
}

export async function addComment(postId: string, author: string, content: string): Promise<BlogData> {
  await supabase.from("comments").insert({
    id: Date.now().toString(),
    post_id: postId,
    author,
    content,
  })
  return getBlogData()
}

export async function deleteComment(postId: string, commentId: string): Promise<BlogData> {
  await supabase.from("comments").delete().eq("id", commentId)
  return getBlogData()
}

export async function addSubscriber(email: string): Promise<BlogData> {
  // Ignore duplicates (email is unique)
  await supabase.from("subscribers").upsert(
    {
      id: Date.now().toString(),
      email,
    },
    { onConflict: "email", ignoreDuplicates: true },
  )
  return getBlogData()
}

export async function deleteSubscriber(id: string): Promise<BlogData> {
  await supabase.from("subscribers").delete().eq("id", id)
  return getBlogData()
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return ""

  let visitorId = localStorage.getItem("visitorId")
  if (!visitorId) {
    visitorId = "visitor_" + Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9)
    localStorage.setItem("visitorId", visitorId)
  }
  return visitorId
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "الآن"
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`
  if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`

  return formatDate(dateString)
}
