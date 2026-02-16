import React, { useState } from "react";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useI18n } from "../i18n/I18nProvider";
import LandingNavbar from "../components/LandingNavbar";

const BlogPage = () => {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "AI & Tech",
    "Career Growth",
    "Industry Trends",
    "Student Success",
  ];

  const posts = [
    {
      id: 1,
      title: "The Future of AI in Education",
      excerpt:
        "How Artificial Intelligence is reshaping the way we learn and teach in the 21st century.",
      image:
        "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80",
      date: "Oct 15, 2025",
      readTime: "5 min read",
      category: "AI & Tech",
      author: "Sarah Chen",
    },
    {
      id: 2,
      title: "Mastering the Technical Interview",
      excerpt:
        "Top tips and strategies to crack coding interviews at FAANG companies.",
      image:
        "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80",
      date: "Oct 12, 2025",
      readTime: "8 min read",
      category: "Career Growth",
      author: "Marcus Williams",
    },
    {
      id: 3,
      title: "From Student to Full Stack Developer",
      excerpt:
        "A comprehensive roadmap for aspiring developers starting their journey.",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
      date: "Oct 10, 2025",
      readTime: "6 min read",
      category: "Student Success",
      author: "Alex Johnson",
    },
    {
      id: 4,
      title: "2026 Tech Hiring Trends",
      excerpt: "What companies are looking for in the next wave of hiring.",
      image:
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      date: "Oct 05, 2025",
      readTime: "4 min read",
      category: "Industry Trends",
      author: "Jennifer Wu",
    },
    {
      id: 5,
      title: "The Rise of Low-Code Platforms",
      excerpt:
        "Understanding the impact of low-code/no-code tools on professional development.",
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
      date: "Oct 01, 2025",
      readTime: "7 min read",
      category: "AI & Tech",
      author: "David Kim",
    },
    {
      id: 6,
      title: "How to Build a Personal Brand as a Developer",
      excerpt:
        "Strategies for standing out in a crowded tech job market and building your online presence.",
      image:
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      date: "Sep 28, 2025",
      readTime: "6 min read",
      category: "Career Growth",
      author: "Priya Singh",
    },
    {
      id: 7,
      title: "AI Ethics: What Every Student Should Know",
      excerpt:
        "A primer on responsible AI, bias, and the importance of ethical frameworks in technology.",
      image:
        "https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=800&q=80",
      date: "Sep 20, 2025",
      readTime: "5 min read",
      category: "AI & Tech",
      author: "Sarah Chen",
    },
    {
      id: 8,
      title: "From Bootcamp to Boardroom: Success Stories",
      excerpt:
        "Real journeys of students who transitioned from coding bootcamps to top tech roles.",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      date: "Sep 10, 2025",
      readTime: "7 min read",
      category: "Student Success",
      author: "Alex Johnson",
    },
    {
      id: 9,
      title: "The Power of Mentorship in Tech Careers",
      excerpt:
        "How mentorship accelerates learning and opens doors for aspiring professionals.",
      image:
        "https://images.unsplash.com/photo-1519340333755-c8924e1b6e6b?auto=format&fit=crop&w=800&q=80",
      date: "Sep 01, 2025",
      readTime: "6 min read",
      category: "Career Growth",
      author: "Jennifer Wu",
    },
  ];

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <LandingNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            {t("blog.title", "LearnovateX Blog")}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            {t(
              "blog.subtitle",
              "Insights, tutorials, and success stories to fuel your learning journey."
            )}
          </p>
        </div>

        {/* Featured Post */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 h-56 md:h-auto overflow-hidden">
                <img
                  src={posts[0].image}
                  alt={posts[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="md:w-1/2 p-6">
                <div className="text-sm text-zinc-400 mb-2">
                  Featured • {posts[0].category}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {posts[0].title}
                </h3>
                <p className="text-zinc-300 mb-4">{posts[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    By {posts[0].author} • {posts[0].date}
                  </span>
                  <Button variant="ghost" className="text-white">
                    Read Featured
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-white text-black shadow-lg scale-105"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-zinc-600 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/10">
                    {post.category}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-zinc-400 text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-medium text-zinc-300">
                    By {post.author}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  variant="ghost"
                  className="w-full text-zinc-400 group-hover:text-white justify-between pl-0 hover:bg-transparent"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
