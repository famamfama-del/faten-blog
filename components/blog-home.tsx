"use client"

import { useState, useEffect } from "react"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Clock, 
  Search, 
  X, 
  Send,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  Mail,
  Bookmark,
  Copy,
  Check,
  Star,
  TrendingUp,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  BlogData,
  Post,
  getBlogData,
  toggleLike,
  addComment,
  getVisitorId,
  addSubscriber,
  incrementViews,
  calculateReadingTime,
  formatRelativeDate
} from "@/lib/blog-store"

interface BlogHomeProps {
  onAdminClick: () => void
  refreshTrigger: number
}

export function BlogHome({ onAdminClick, refreshTrigger }: BlogHomeProps) {
  const [blogData, setBlogData] = useState<BlogData | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [visitorId, setVisitorId] = useState<string>("")
  const [commentAuthor, setCommentAuthor] = useState("")
  const [commentContent, setCommentContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getBlogData().then(setBlogData)
    setVisitorId(getVisitorId())
  }, [refreshTrigger])

  const handleLike = async (postId: string) => {
    const updatedData = await toggleLike(postId, visitorId)
    setBlogData(updatedData)
    if (selectedPost && selectedPost.id === postId) {
      const updatedPost = updatedData.posts.find(p => p.id === postId)
      if (updatedPost) setSelectedPost(updatedPost)
    }
  }

  const handleComment = async (postId: string) => {
    if (!commentAuthor.trim() || !commentContent.trim()) return
    const updatedData = await addComment(postId, commentAuthor.trim(), commentContent.trim())
    setBlogData(updatedData)
    const updatedPost = updatedData.posts.find(p => p.id === postId)
    if (updatedPost) setSelectedPost(updatedPost)
    setCommentAuthor("")
    setCommentContent("")
  }

  const handleSubscribe = async () => {
    if (!email.trim() || !email.includes('@')) return
    await addSubscriber(email.trim())
    setSubscribed(true)
    setEmail("")
    setTimeout(() => setSubscribed(false), 3000)
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
    }
  }

  const openPost = async (post: Post) => {
    setSelectedPost(post)
    const updatedData = await incrementViews(post.id)
    setBlogData(updatedData)
  }

  if (!blogData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const filteredPosts = blogData.posts.filter(post => {
    const matchesSection = !selectedSection || post.sectionId === selectedSection
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSection && matchesSearch
  })

  const featuredPosts = blogData.posts.filter(p => p.featured)
  const popularPosts = [...blogData.posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3)

  const getSectionName = (sectionId: string) => {
    const section = blogData.sections.find(s => s.id === sectionId)
    return section?.name || "غير مصنف"
  }

  // Post Detail View
  if (selectedPost) {
    const isLiked = selectedPost.likedBy.includes(visitorId)
    const readingTime = calculateReadingTime(selectedPost.content)
    
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedPost(null)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="w-10 h-10 rounded-full"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Post Image */}
          {selectedPost.image && (
            <div className="relative -mx-4 md:mx-0 mb-8 rounded-none md:rounded-2xl overflow-hidden shadow-xl">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {getSectionName(selectedPost.sectionId)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readingTime} دقيقة للقراءة
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {selectedPost.views || 0} مشاهدة
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-relaxed mb-4 font-serif text-balance">
            {selectedPost.title}
          </h1>

          <p className="text-muted-foreground mb-8">
            {formatRelativeDate(selectedPost.createdAt)}
          </p>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-foreground leading-loose mb-12 whitespace-pre-wrap text-lg">
            {selectedPost.content}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 py-6 border-t border-b border-border/50">
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={() => handleLike(selectedPost.id)}
              className={`gap-2 transition-all duration-300 ${isLiked ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              {selectedPost.likes}
            </Button>
            <Button variant="outline" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              {selectedPost.comments.length}
            </Button>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              {copied ? 'تم النسخ' : 'نسخ الرابط'}
            </Button>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              التعليقات ({selectedPost.comments.length})
            </h3>

            {/* Comment Form */}
            <div className="bg-card rounded-2xl p-6 border border-border/50 mb-8 shadow-sm">
              <Input
                placeholder="اسمك"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="mb-4 bg-background border-border/50"
              />
              <Textarea
                placeholder="اكتب تعليقك هنا..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="mb-4 min-h-[100px] bg-background border-border/50 resize-none"
              />
              <Button
                onClick={() => handleComment(selectedPost.id)}
                disabled={!commentAuthor.trim() || !commentContent.trim()}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                إرسال التعليق
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {selectedPost.comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  كن أول من يعلق على هذا المقال
                </p>
              ) : (
                selectedPost.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-card rounded-xl p-5 border border-border/50 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{comment.author}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground/80 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </div>
    )
  }

  // Main Blog View
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">
              {blogData.info.name || "مدونتي"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-full"
            >
              {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={onAdminClick}
              className="w-10 h-10 rounded-full text-muted-foreground hover:text-foreground"
              title="لوحة التحكم"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="container mx-auto px-4 pb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث في المقالات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-card border-border/50"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      {blogData.info.name && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 backdrop-blur-sm border border-primary/20">
                <Sparkles className="w-4 h-4" />
                مرحباً بك في مدونتي
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight font-serif">
                {blogData.info.name}
              </h1>
              {blogData.info.description && (
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {blogData.info.description}
                </p>
              )}
              {blogData.info.about && (
                <p className="text-foreground/70 leading-loose max-w-2xl">
                  {blogData.info.about}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Sections */}
            {blogData.sections.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary" />
                  الأقسام
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedSection(null)}
                    className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-300 ${
                      !selectedSection
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    جميع المقالات
                  </button>
                  {blogData.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-300 ${
                        selectedSection === section.id
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {section.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Posts */}
            {popularPosts.length > 0 && popularPosts.some(p => (p.views || 0) > 0) && (
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  الأكثر قراءة
                </h3>
                <div className="space-y-3">
                  {popularPosts.filter(p => (p.views || 0) > 0).map((post, index) => (
                    <button
                      key={post.id}
                      onClick={() => openPost(post)}
                      className="w-full text-right p-3 rounded-xl hover:bg-muted transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                            {post.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {post.views || 0} مشاهدة
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                النشرة البريدية
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                اشترك لتصلك آخر المقالات
              </p>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border/50"
                />
                <Button
                  onClick={handleSubscribe}
                  className="w-full gap-2"
                  disabled={subscribed}
                >
                  {subscribed ? (
                    <>
                      <Check className="w-4 h-4" />
                      تم الاشتراك
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      اشترك الآن
                    </>
                  )}
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && !selectedSection && !searchQuery && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  مقالات مميزة
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <article
                      key={post.id}
                      onClick={() => openPost(post)}
                      className="group bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl overflow-hidden border border-primary/20 cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                    >
                      {post.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/90 text-white text-xs font-medium backdrop-blur-sm">
                            <Star className="w-3 h-3 fill-current" />
                            مقال مميز
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        {!post.image && (
                          <div className="flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-primary font-medium">مقال مميز</span>
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {post.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{formatRelativeDate(post.createdAt)}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {selectedSection
                  ? getSectionName(selectedSection)
                  : searchQuery
                  ? `نتائج البحث: "${searchQuery}"`
                  : "جميع المقالات"}
              </h2>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد مقالات</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "جرب البحث بكلمات مختلفة"
                      : "لم تتم إضافة أي مقالات بعد"}
                  </p>
                  {!blogData.info.name && (
                    <Button onClick={onAdminClick} className="mt-6">
                      إعداد المدونة
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => {
                    const isLiked = post.likedBy.includes(visitorId)
                    const readingTime = calculateReadingTime(post.content)
                    
                    return (
                      <article
                        key={post.id}
                        className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                      >
                        {post.image && (
                          <div 
                            onClick={() => openPost(post)}
                            className="relative h-52 overflow-hidden cursor-pointer"
                          >
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute bottom-4 right-4 left-4">
                              <div className="flex flex-wrap items-center gap-2 text-white/90 text-xs">
                                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm font-medium">
                                  {getSectionName(post.sectionId)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {readingTime} دقيقة
                                </span>
                                {post.featured && (
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-6">
                          {!post.image && (
                            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                {getSectionName(post.sectionId)}
                              </span>
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {readingTime} دقيقة
                              </span>
                              {post.featured && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                          )}

                          <div
                            onClick={() => openPost(post)}
                            className="cursor-pointer"
                          >
                            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                              {post.content}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border/50 gap-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                                  isLiked
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'hover:bg-muted text-muted-foreground'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-sm">{post.likes}</span>
                              </button>
                              <button
                                onClick={() => openPost(post)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all duration-300"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">{post.comments.length}</span>
                              </button>
                              <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                <Eye className="w-4 h-4" />
                                {post.views || 0}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => openPost(post)}
                              className="flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all duration-300"
                            >
                              اقرأ المزيد
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            {blogData.info.name || "مدونتي"} &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
