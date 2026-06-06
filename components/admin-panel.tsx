"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Settings,
  FolderPlus,
  FileText,
  Users,
  LogOut,
  Save,
  Trash2,
  Edit3,
  X,
  Star,
  MessageCircle,
  Heart,
  Eye,
  Plus,
  ArrowRight,
  ImagePlus
} from "lucide-react"
import { 
  getBlogData, 
  updateBlogInfo, 
  addSection, 
  deleteSection, 
  addPost, 
  deletePost, 
  updatePost,
  deleteComment,
  deleteSubscriber,
  type BlogData, 
  type BlogInfo,
  type Post,
  formatRelativeDate
} from "@/lib/blog-store"

interface AdminPanelProps {
  onLogout: () => void
  onDataChange: () => void
}

export function AdminPanel({ onLogout, onDataChange }: AdminPanelProps) {
  const [blogData, setBlogData] = useState<BlogData | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "sections" | "posts" | "subscribers">("info")
  
  // Blog info form
  const [blogName, setBlogName] = useState("")
  const [blogDescription, setBlogDescription] = useState("")
  const [blogAbout, setBlogAbout] = useState("")
  const [blogCover, setBlogCover] = useState("")
  const [coverPreview, setCoverPreview] = useState("")
  
  // Section form
  const [newSectionName, setNewSectionName] = useState("")
  
  // Post form
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [postSection, setPostSection] = useState("")
  const [postFeatured, setPostFeatured] = useState(false)
  const [postImage, setPostImage] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    getBlogData().then((data) => {
      setBlogData(data)
      setBlogName(data.info.name)
      setBlogDescription(data.info.description)
      setBlogAbout(data.info.about)
      setBlogCover(data.info.coverImage)
      setCoverPreview(data.info.coverImage)
    })
  }, [])

  const showMessage = (msg: string) => {
    setSaveMessage(msg)
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleSaveBlogInfo = async () => {
    const info: BlogInfo = {
      name: blogName,
      description: blogDescription,
      about: blogAbout,
      coverImage: blogCover
    }
    const newData = await updateBlogInfo(info)
    setBlogData(newData)
    onDataChange()
    showMessage("تم حفظ معلومات المدونة بنجاح!")
  }

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return
    const newData = await addSection(newSectionName)
    setBlogData(newData)
    setNewSectionName("")
    onDataChange()
    showMessage("تم إضافة القسم بنجاح!")
  }

  const handleDeleteSection = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع المقالات المرتبطة به.")) {
      const newData = await deleteSection(id)
      setBlogData(newData)
      onDataChange()
      showMessage("تم حذف القسم بنجاح!")
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setBlogCover(result)
        setCoverPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPostImage(result)
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddPost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !postSection) return
    
    if (editingPost) {
      const newData = await updatePost(editingPost.id, postTitle, postContent, postSection, postFeatured, postImage)
      setBlogData(newData)
      setEditingPost(null)
      showMessage("تم تحديث المقال بنجاح!")
    } else {
      const newData = await addPost(postTitle, postContent, postSection, postFeatured, postImage)
      setBlogData(newData)
      showMessage("تم إضافة المقال بنجاح!")
    }
    
    setPostTitle("")
    setPostContent("")
    setPostSection("")
    setPostFeatured(false)
    setPostImage("")
    setImagePreview("")
    onDataChange()
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setPostTitle(post.title)
    setPostContent(post.content)
    setPostSection(post.sectionId)
    setPostFeatured(post.featured || false)
    setPostImage(post.image || "")
    setImagePreview(post.image || "")
    setActiveTab("posts")
  }

  const handleDeletePost = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المقال؟")) {
      const newData = await deletePost(id)
      setBlogData(newData)
      onDataChange()
      showMessage("تم حذف المقال بنجاح!")
    }
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا التعليق؟")) {
      const newData = await deleteComment(postId, commentId)
      setBlogData(newData)
      onDataChange()
      showMessage("تم حذف التعليق بنجاح!")
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المشترك؟")) {
      const newData = await deleteSubscriber(id)
      setBlogData(newData)
      showMessage("تم حذف المشترك بنجاح!")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin")
    onLogout()
  }

  if (!blogData) return null

  const tabs = [
    { id: "info", label: "معلومات المدونة", icon: Settings },
    { id: "sections", label: "الأقسام", icon: FolderPlus },
    { id: "posts", label: "المقالات", icon: FileText },
    { id: "subscribers", label: "المشتركين", icon: Users },
  ] as const

  const stats = {
    posts: blogData.posts.length,
    sections: blogData.sections.length,
    comments: blogData.posts.reduce((acc, p) => acc + p.comments.length, 0),
    likes: blogData.posts.reduce((acc, p) => acc + p.likes, 0),
    views: blogData.posts.reduce((acc, p) => acc + (p.views || 0), 0),
    subscribers: blogData.subscribers?.length || 0
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Save Message */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          {saveMessage}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.posts}</p>
                <p className="text-xs text-muted-foreground">مقال</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.sections}</p>
                <p className="text-xs text-muted-foreground">قسم</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.comments}</p>
                <p className="text-xs text-muted-foreground">تعليق</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.likes}</p>
                <p className="text-xs text-muted-foreground">إعجاب</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.views}</p>
                <p className="text-xs text-muted-foreground">مشاهدة</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.subscribers}</p>
                <p className="text-xs text-muted-foreground">مشترك</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-card p-2 rounded-xl border border-border/50 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Blog Info Tab */}
        {activeTab === "info" && (
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              معلومات المدونة
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">اسم المدونة</label>
                <Input
                  value={blogName}
                  onChange={(e) => setBlogName(e.target.value)}
                  placeholder="أدخل اسم المدونة"
                  className="bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">وصف المدونة</label>
                <Input
                  value={blogDescription}
                  onChange={(e) => setBlogDescription(e.target.value)}
                  placeholder="وصف قصير للمدونة"
                  className="bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">نبذة تعريفية</label>
                <Textarea
                  value={blogAbout}
                  onChange={(e) => setBlogAbout(e.target.value)}
                  rows={4}
                  placeholder="نبذة تعريفية عن المدونة ومحتواها"
                  className="bg-background resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">صورة الغلاف</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                        <ImagePlus className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">اختر صورة للغلاف</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                    {coverPreview && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setBlogCover("")
                          setCoverPreview("")
                        }}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {coverPreview && (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img
                        src={coverPreview}
                        alt="معاينة صورة الغلاف"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleSaveBlogInfo} className="gap-2">
                <Save className="w-4 h-4" />
                حفظ المعلومات
              </Button>
            </div>
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === "sections" && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                إضافة قسم جديد
              </h2>
              <div className="flex gap-3">
                <Input
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="اسم القسم"
                  className="bg-background"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                />
                <Button onClick={handleAddSection} className="gap-2 shrink-0">
                  <Plus className="w-4 h-4" />
                  إضافة
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-accent" />
                الأقسام الحالية ({blogData.sections.length})
              </h2>
              {blogData.sections.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد أقسام بعد</p>
              ) : (
                <div className="space-y-3">
                  {blogData.sections.map((section) => {
                    const postCount = blogData.posts.filter(p => p.sectionId === section.id).length
                    return (
                      <div 
                        key={section.id} 
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl group hover:bg-muted transition-colors"
                      >
                        <div>
                          <span className="font-medium text-foreground">{section.name}</span>
                          <span className="text-sm text-muted-foreground mr-2">({postCount} مقال)</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm max-w-3xl">
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                {editingPost ? <Edit3 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                {editingPost ? "تعديل المقال" : "إضافة مقال جديد"}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">عنوان المقال</label>
                  <Input
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="أدخل عنوان المقال"
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">القسم</label>
                  <select
                    value={postSection}
                    onChange={(e) => setPostSection(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">اختر القسم</option>
                    {blogData.sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">محتوى المقال</label>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={10}
                    placeholder="اكتب محتوى المقال هنا..."
                    className="bg-background resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">صورة المقال (اختياري)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">اختر صورة أو اسحبها هنا</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {imagePreview && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setPostImage("")
                            setImagePreview("")
                          }}
                          className="shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        <img
                          src={imagePreview}
                          alt="معاينة الصورة"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={postFeatured}
                    onChange={(e) => setPostFeatured(e.target.checked)}
                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="featured" className="flex items-center gap-2 text-foreground cursor-pointer">
                    <Star className="w-4 h-4 text-yellow-500" />
                    مقال مميز
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddPost} className="gap-2">
                    <Save className="w-4 h-4" />
                    {editingPost ? "تحديث المقال" : "نشر المقال"}
                  </Button>
                  {editingPost && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingPost(null)
                        setPostTitle("")
                        setPostContent("")
                        setPostSection("")
                        setPostFeatured(false)
                        setPostImage("")
                        setImagePreview("")
                      }}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      إلغاء
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                المقالات الحالية ({blogData.posts.length})
              </h2>
              {blogData.posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد مقالات بعد</p>
              ) : (
                <div className="space-y-4">
                  {blogData.posts.map((post) => {
                    const section = blogData.sections.find(s => s.id === post.sectionId)
                    return (
                      <div 
                        key={post.id} 
                        className="p-5 bg-muted/50 rounded-xl space-y-3 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {post.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                              <h3 className="font-bold text-lg text-foreground truncate">{post.title}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                                {section?.name || "غير محدد"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {post.comments.length}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.views || 0}
                              </span>
                              <span>{formatRelativeDate(post.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditPost(post)}
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-foreground/70 line-clamp-2 text-sm">{post.content}</p>
                        
                        {/* Comments Section */}
                        {post.comments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-primary" />
                              التعليقات ({post.comments.length})
                            </p>
                            <div className="space-y-2">
                              {post.comments.map((comment) => (
                                <div 
                                  key={comment.id} 
                                  className="flex items-start justify-between gap-3 p-3 bg-background rounded-lg group"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                        {comment.author.charAt(0)}
                                      </span>
                                      <span className="text-sm font-medium text-foreground">{comment.author}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatRelativeDate(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mr-8">{comment.content}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscribers Tab */}
        {activeTab === "subscribers" && (
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              المشتركين في النشرة البريدية ({blogData.subscribers?.length || 0})
            </h2>
            {!blogData.subscribers || blogData.subscribers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">لا يوجد مشتركين بعد</p>
            ) : (
              <div className="space-y-3">
                {blogData.subscribers.map((subscriber) => (
                  <div 
                    key={subscriber.id} 
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl group hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{subscriber.email}</p>
                      <p className="text-xs text-muted-foreground">
                        اشترك {formatRelativeDate(subscriber.createdAt)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteSubscriber(subscriber.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Back to Blog Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للمدونة
          </Button>
        </div>
      </div>
    </div>
  )
}
