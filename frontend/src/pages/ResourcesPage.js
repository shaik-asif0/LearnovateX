import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  Search,
  Download,
  Star,
  Clock,
  Users,
  Filter,
  Grid3X3,
  List,
  Bookmark,
  BookmarkCheck,
  Play,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Code,
  Code2,
  Database,
  Globe,
  Briefcase,
  GraduationCap,
  Youtube,
  FileCode,
  Sparkles,
  Heart,
  Share2,
  ChevronRight,
  Bot,
  Target,
  Layers,
  X,
  Loader2,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import { getUser } from "../lib/utils";
import { useI18n } from "../i18n/I18nProvider";

const ResourcesPage = () => {
  const user = getUser();
  const { t } = useI18n();
  const resourceBookmarksKey =
    user?.id || user?._id || user?.email
      ? `resourceBookmarks:${user.id || user._id || user.email}`
      : "resourceBookmarks:anonymous";
  const completedResourcesKey =
    user?.id || user?._id || user?.email
      ? `completedResources:${user.id || user._id || user.email}`
      : "completedResources:anonymous";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [bookmarks, setBookmarks] = useState([]);
  const [completedResources, setCompletedResources] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [videoModal, setVideoModal] = useState({
    open: false,
    url: "",
    title: "",
  });
  const [downloading, setDownloading] = useState(null);

  const resources = [
    // Python Resources (25)
    {
      id: 1,
      title: "Python Official Documentation",
      category: "python",
      type: "docs",
      url: "https://docs.python.org/3/",
      desc: "Comprehensive Python documentation with tutorials, library reference, and language reference.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.9,
      reviews: 15420,
      featured: true,
      tags: ["Python", "Documentation", "Reference"],
      difficulty: "Beginner",
      estimatedTime: "Ongoing",
    },
    {
      id: 2,
      title: "Python for Beginners - Full Course",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/rfscVS0vtbw",
      videoId: "rfscVS0vtbw",
      desc: "Learn Python from scratch with this comprehensive beginner-friendly video course.",
      duration: "4h 30m",
      level: "Beginner",
      rating: 4.8,
      reviews: 89320,
      tags: ["Python", "Beginner", "Video Course"],
      difficulty: "Beginner",
      estimatedTime: "4.5 hours",
    },
    {
      id: 3,
      title: "Python Cheat Sheet",
      category: "python",
      type: "pdf",
      url: "https://perso.limsi.fr/pointal/_media/python:cours:mementopython3-english.pdf",
      desc: "Quick reference guide covering Python syntax, data types, functions, and common operations.",
      duration: "Quick Reference",
      level: "All Levels",
      rating: 4.7,
      reviews: 5230,
      tags: ["Python", "Cheat Sheet", "Reference"],
      difficulty: "Beginner",
      estimatedTime: "30 minutes",
    },
    {
      id: 4,
      title: "Python OOP Masterclass",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/Ej_02ICOIgs",
      videoId: "Ej_02ICOIgs",
      desc: "Deep dive into Object-Oriented Programming with Python. Classes, inheritance, polymorphism.",
      duration: "6h 15m",
      level: "Intermediate",
      rating: 4.8,
      reviews: 12450,
      tags: ["Python", "OOP", "Advanced"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 5,
      title: "Python Data Science Handbook",
      category: "python",
      type: "docs",
      url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
      desc: "Essential tools for working with data in Python - NumPy, Pandas, Matplotlib, Scikit-Learn.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.9,
      reviews: 8760,
      featured: true,
      tags: ["Python", "Data Science", "NumPy", "Pandas"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 6,
      title: "Automate the Boring Stuff with Python",
      category: "python",
      type: "book",
      url: "https://automatetheboringstuff.com/",
      desc: "Learn Python programming through practical projects that automate everyday tasks.",
      duration: "Self-paced",
      level: "Beginner",
      rating: 4.8,
      reviews: 45230,
      featured: true,
      tags: ["Python", "Automation", "Practical"],
      difficulty: "Beginner",
      estimatedTime: "12 hours",
    },
    {
      id: 7,
      title: "Python Flask Web Development",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/Z1RJmh_OqeA",
      videoId: "Z1RJmh_OqeA",
      desc: "Build web applications with Flask. From basics to advanced features and deployment.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 15670,
      tags: ["Python", "Flask", "Web Development"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 8,
      title: "Django for Beginners",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/rHux0gMZ3Eg",
      videoId: "rHux0gMZ3Eg",
      desc: "Learn Django web framework from scratch. Build real-world applications.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 23450,
      tags: ["Python", "Django", "Web Framework"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 9,
      title: "Python Testing with pytest",
      category: "python",
      type: "docs",
      url: "https://docs.pytest.org/en/stable/",
      desc: "Comprehensive testing framework for Python. Write better, more maintainable code.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.6,
      reviews: 8920,
      tags: ["Python", "Testing", "pytest"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 10,
      title: "Python Async Programming",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/iG6fr81xHKA",
      videoId: "iG6fr81xHKA",
      desc: "Master asynchronous programming with asyncio. Build concurrent applications.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.7,
      reviews: 6780,
      tags: ["Python", "Async", "Concurrency"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 11,
      title: "Python Design Patterns",
      category: "python",
      type: "docs",
      url: "https://refactoring.guru/design-patterns/python",
      desc: "Learn essential design patterns implemented in Python with real examples.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.8,
      reviews: 5430,
      tags: ["Python", "Design Patterns", "Architecture"],
      difficulty: "Advanced",
      estimatedTime: "6 hours",
    },
    {
      id: 12,
      title: "FastAPI Complete Course",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/7t2alSnE2-I",
      videoId: "7t2alSnE2-I",
      desc: "Build modern APIs with FastAPI. Fast, easy, and automatic API documentation.",
      duration: "7h Course",
      level: "Intermediate",
      rating: 4.9,
      reviews: 18760,
      tags: ["Python", "FastAPI", "APIs"],
      difficulty: "Intermediate",
      estimatedTime: "7 hours",
    },
    {
      id: 13,
      title: "Python Machine Learning",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/7eh4d6sabA0",
      videoId: "7eh4d6sabA0",
      desc: "Practical machine learning with Python. Scikit-learn, TensorFlow, and more.",
      duration: "12h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 34560,
      tags: ["Python", "ML", "Scikit-learn"],
      difficulty: "Intermediate",
      estimatedTime: "12 hours",
    },
    {
      id: 14,
      title: "Python Web Scraping",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/XVv6mJpFOb0",
      videoId: "XVv6mJpFOb0",
      desc: "Learn web scraping with BeautifulSoup and Scrapy. Extract data from websites.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 12340,
      tags: ["Python", "Web Scraping", "BeautifulSoup"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 15,
      title: "Python GUI with Tkinter",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/YXPyB4XeYLA",
      videoId: "YXPyB4XeYLA",
      desc: "Build desktop applications with Python's built-in GUI library.",
      duration: "4h Course",
      level: "Beginner",
      rating: 4.5,
      reviews: 8760,
      tags: ["Python", "GUI", "Tkinter"],
      difficulty: "Beginner",
      estimatedTime: "4 hours",
    },
    {
      id: 16,
      title: "Python Game Development with Pygame",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/FfWpgLFMI7w",
      videoId: "FfWpgLFMI7w",
      desc: "Create games with Pygame. Learn game development fundamentals.",
      duration: "8h Course",
      level: "Beginner",
      rating: 4.7,
      reviews: 15670,
      tags: ["Python", "Games", "Pygame"],
      difficulty: "Beginner",
      estimatedTime: "8 hours",
    },
    {
      id: 17,
      title: "Python Networking",
      category: "python",
      type: "docs",
      url: "https://docs.python.org/3/library/socket.html",
      desc: "Network programming with Python sockets. TCP/UDP client-server applications.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.4,
      reviews: 4320,
      tags: ["Python", "Networking", "Sockets"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 18,
      title: "Python Security Best Practices",
      category: "python",
      type: "docs",
      url: "https://owasp.org/www-pdf-archive/OWASP_Cheatsheets_Book.pdf",
      desc: "Secure coding practices for Python applications. Avoid common vulnerabilities.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.6,
      reviews: 6780,
      tags: ["Python", "Security", "Best Practices"],
      difficulty: "Advanced",
      estimatedTime: "3 hours",
    },
    {
      id: 19,
      title: "Python Microservices with Nameko",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/8F3J-MZGFwY",
      videoId: "8F3J-MZGFwY",
      desc: "Build microservices architecture with Python and Nameko framework.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.5,
      reviews: 3450,
      tags: ["Python", "Microservices", "Nameko"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 20,
      title: "Python Performance Optimization",
      category: "python",
      type: "docs",
      url: "https://wiki.python.org/moin/PythonSpeed/PerformanceTips",
      desc: "Optimize Python code performance. Profiling, caching, and optimization techniques.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.7,
      reviews: 5670,
      tags: ["Python", "Performance", "Optimization"],
      difficulty: "Advanced",
      estimatedTime: "4 hours",
    },
    {
      id: 21,
      title: "Python Package Development",
      category: "python",
      type: "docs",
      url: "https://packaging.python.org/tutorials/packaging-projects/",
      desc: "Create and distribute Python packages. Setup.py, PyPI, and best practices.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.5,
      reviews: 4320,
      tags: ["Python", "Packaging", "PyPI"],
      difficulty: "Intermediate",
      estimatedTime: "2 hours",
    },
    {
      id: 22,
      title: "Python Concurrency with Threads",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/IEEhzQoKtQU",
      videoId: "IEEhzQoKtQU",
      desc: "Multithreading and multiprocessing in Python. Build concurrent applications.",
      duration: "4h Course",
      level: "Advanced",
      rating: 4.6,
      reviews: 6780,
      tags: ["Python", "Threads", "Concurrency"],
      difficulty: "Advanced",
      estimatedTime: "4 hours",
    },
    {
      id: 23,
      title: "Python Data Visualization",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/a9UrKTVEeZA",
      videoId: "a9UrKTVEeZA",
      desc: "Create stunning visualizations with Matplotlib, Seaborn, and Plotly.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 12340,
      tags: ["Python", "Visualization", "Matplotlib"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 24,
      title: "Python API Integration",
      category: "python",
      type: "video",
      url: "https://www.youtube.com/embed/2mMzg8L2Zv0",
      videoId: "2mMzg8L2Zv0",
      desc: "Integrate with REST APIs using requests library. Authentication and error handling.",
      duration: "3h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 8760,
      tags: ["Python", "APIs", "Requests"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 25,
      title: "Python Best Practices & PEP 8",
      category: "python",
      type: "docs",
      url: "https://pep8.org/",
      desc: "Write clean, readable Python code following PEP 8 style guidelines.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.6,
      reviews: 9870,
      tags: ["Python", "Best Practices", "PEP 8"],
      difficulty: "Beginner",
      estimatedTime: "2 hours",
    },

    // JavaScript Resources (22)
    {
      id: 26,
      title: "JavaScript MDN Documentation",
      category: "javascript",
      type: "docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      desc: "Comprehensive JavaScript reference and guides from Mozilla Developer Network.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.9,
      reviews: 45670,
      featured: true,
      tags: ["JavaScript", "Documentation", "MDN"],
      difficulty: "Beginner",
      estimatedTime: "Ongoing",
    },
    {
      id: 27,
      title: "JavaScript Fundamentals - FreeCodeCamp",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/PkZNo7MFNFg",
      videoId: "PkZNo7MFNFg",
      desc: "Complete JavaScript fundamentals course. Variables, functions, objects, and more.",
      duration: "3h Course",
      level: "Beginner",
      rating: 4.8,
      reviews: 123450,
      featured: true,
      tags: ["JavaScript", "Fundamentals", "FreeCodeCamp"],
      difficulty: "Beginner",
      estimatedTime: "3 hours",
    },
    {
      id: 28,
      title: "ES6+ Modern JavaScript",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/hdI2bqOjy3c",
      videoId: "hdI2bqOjy3c",
      desc: "Master modern JavaScript features - arrow functions, destructuring, promises, async/await.",
      duration: "5h 30m",
      level: "Intermediate",
      rating: 4.8,
      reviews: 67890,
      tags: ["JavaScript", "ES6", "Modern JS"],
      difficulty: "Intermediate",
      estimatedTime: "5.5 hours",
    },
    {
      id: 29,
      title: "JavaScript Algorithms and Data Structures",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/8aGhZQkoFbQ",
      videoId: "8aGhZQkoFbQ",
      desc: "Learn algorithms and data structures implementation in JavaScript.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["JavaScript", "Algorithms", "DSA"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 30,
      title: "Node.js Complete Course",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/Oe421EPjeBE",
      videoId: "Oe421EPjeBE",
      desc: "Build backend applications with Node.js. Express, MongoDB, and REST APIs.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 89230,
      tags: ["JavaScript", "Node.js", "Backend"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 31,
      title: "React.js Complete Guide",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/DLX62G4lc44",
      videoId: "DLX62G4lc44",
      desc: "Master React from basics to advanced concepts. Hooks, Context, Redux.",
      duration: "12h Course",
      level: "Intermediate",
      rating: 4.9,
      reviews: 156780,
      featured: true,
      tags: ["JavaScript", "React", "Frontend"],
      difficulty: "Intermediate",
      estimatedTime: "12 hours",
    },
    {
      id: 32,
      title: "JavaScript Design Patterns",
      category: "javascript",
      type: "docs",
      url: "https://addyosmani.com/resources/essentialjsdesignpatterns/book/",
      desc: "Essential design patterns in JavaScript. Module, Observer, Singleton patterns.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.7,
      reviews: 12340,
      tags: ["JavaScript", "Design Patterns", "Architecture"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 33,
      title: "TypeScript Fundamentals",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/BwuLxPH8IDs",
      videoId: "BwuLxPH8IDs",
      desc: "Learn TypeScript from scratch. Types, interfaces, generics, and advanced features.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 45670,
      tags: ["JavaScript", "TypeScript", "Types"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 34,
      title: "JavaScript Testing with Jest",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/7r4xVDI2vho",
      videoId: "7r4xVDI2vho",
      desc: "Unit testing, integration testing, and TDD with Jest framework.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 23450,
      tags: ["JavaScript", "Testing", "Jest"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 35,
      title: "JavaScript Performance Optimization",
      category: "javascript",
      type: "docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/Performance",
      desc: "Optimize JavaScript applications for better performance and user experience.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.5,
      reviews: 8760,
      tags: ["JavaScript", "Performance", "Optimization"],
      difficulty: "Advanced",
      estimatedTime: "4 hours",
    },
    {
      id: 36,
      title: "JavaScript Security Best Practices",
      category: "javascript",
      type: "docs",
      url: "https://owasp.org/www-project-cheat-sheets/cheatsheets/Client_Side_JavaScript_Security_Cheat_Sheet.html",
      desc: "Secure coding practices for JavaScript applications. XSS, CSRF prevention.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.6,
      reviews: 5430,
      tags: ["JavaScript", "Security", "Best Practices"],
      difficulty: "Advanced",
      estimatedTime: "3 hours",
    },
    {
      id: 37,
      title: "Vue.js 3 Complete Course",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/FXpIoQ_rT_c",
      videoId: "FXpIoQ_rT_c",
      desc: "Learn Vue.js 3 with Composition API. Build modern reactive web applications.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["JavaScript", "Vue.js", "Frontend"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 38,
      title: "Angular Complete Guide",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/0LhBvpXKnDA",
      videoId: "0LhBvpXKnDA",
      desc: "Master Angular framework. Components, services, routing, and state management.",
      duration: "15h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 56780,
      tags: ["JavaScript", "Angular", "Framework"],
      difficulty: "Intermediate",
      estimatedTime: "15 hours",
    },
    {
      id: 39,
      title: "JavaScript Web APIs",
      category: "javascript",
      type: "docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/API",
      desc: "Master browser APIs. LocalStorage, Fetch, WebSockets, Service Workers.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.7,
      reviews: 12340,
      tags: ["JavaScript", "Web APIs", "Browser"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 40,
      title: "JavaScript Functional Programming",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/e-5obm1G_FY",
      videoId: "e-5obm1G_FY",
      desc: "Functional programming concepts in JavaScript. Pure functions, immutability, currying.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.6,
      reviews: 8760,
      tags: ["JavaScript", "Functional Programming", "FP"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 41,
      title: "JavaScript Interview Questions",
      category: "javascript",
      type: "docs",
      url: "https://github.com/sudheerj/javascript-interview-questions",
      desc: "500+ JavaScript interview questions with detailed answers and explanations.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.8,
      reviews: 67890,
      tags: ["JavaScript", "Interview", "Questions"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 42,
      title: "JavaScript Game Development",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/7BHs2m0jCzE",
      videoId: "7BHs2m0jCzE",
      desc: "Build games with JavaScript and HTML5 Canvas. Physics, collision detection.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.5,
      reviews: 15670,
      tags: ["JavaScript", "Games", "Canvas"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 43,
      title: "JavaScript Data Structures",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/svxHgbcwmR8",
      videoId: "svxHgbcwmR8",
      desc: "Implement data structures in JavaScript. Arrays, linked lists, trees, graphs.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 23450,
      tags: ["JavaScript", "Data Structures", "Algorithms"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 44,
      title: "Next.js Full Course",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/mTz0GXj8NN0",
      videoId: "mTz0GXj8NN0",
      desc: "Build full-stack React applications with Next.js. SSR, SSG, API routes.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.9,
      reviews: 45670,
      tags: ["JavaScript", "Next.js", "Full Stack"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 45,
      title: "JavaScript Debugging Masterclass",
      category: "javascript",
      type: "video",
      url: "https://www.youtube.com/embed/AX7zm_T3Hss",
      videoId: "AX7zm_T3Hss",
      desc: "Master debugging techniques. Chrome DevTools, breakpoints, performance profiling.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 12340,
      tags: ["JavaScript", "Debugging", "DevTools"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 46,
      title: "JavaScript Web Components",
      category: "javascript",
      type: "docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/Web_Components",
      desc: "Build reusable web components with vanilla JavaScript. Custom elements, shadow DOM.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.4,
      reviews: 5670,
      tags: ["JavaScript", "Web Components", "Custom Elements"],
      difficulty: "Advanced",
      estimatedTime: "3 hours",
    },
    {
      id: 47,
      title: "JavaScript Memory Management",
      category: "javascript",
      type: "docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management",
      desc: "Understand memory management in JavaScript. Garbage collection, memory leaks.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.5,
      reviews: 4320,
      tags: ["JavaScript", "Memory", "Performance"],
      difficulty: "Advanced",
      estimatedTime: "2 hours",
    },

    // DSA Resources (28)
    {
      id: 48,
      title: "VisuAlgo - DSA Visualizer",
      category: "dsa",
      type: "tool",
      url: "https://visualgo.net/",
      desc: "Interactive visualization tool for data structures and algorithms. See how algorithms work step by step.",
      duration: "Interactive",
      level: "All Levels",
      rating: 4.9,
      reviews: 25680,
      featured: true,
      tags: ["DSA", "Visualization", "Interactive"],
      difficulty: "Beginner",
      estimatedTime: "Ongoing",
    },
    {
      id: 49,
      title: "Algorithm Design Manual",
      category: "dsa",
      type: "pdf",
      url: "https://mimoza.marmara.edu.tr/~msakalli/cse706_12/SksssAlgorithmDesignManual.pdf",
      desc: "Comprehensive guide to algorithmic problem solving with practical implementation strategies.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.8,
      reviews: 6540,
      tags: ["Algorithms", "Problem Solving", "Book"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 50,
      title: "Big O Notation Complete Guide",
      category: "dsa",
      type: "docs",
      url: "https://www.bigocheatsheet.com/",
      desc: "Master time and space complexity analysis. Understand how to evaluate algorithm efficiency.",
      duration: "2h Read",
      level: "Beginner",
      rating: 4.7,
      reviews: 9870,
      tags: ["Big O", "Complexity", "Analysis"],
      difficulty: "Beginner",
      estimatedTime: "2 hours",
    },
    {
      id: 51,
      title: "LeetCode Patterns",
      category: "dsa",
      type: "pdf",
      url: "https://seanprashad.com/leetcode-patterns/",
      desc: "14 essential patterns to master for coding interviews. Includes 150+ practice problems.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.9,
      reviews: 34560,
      featured: true,
      tags: ["LeetCode", "Patterns", "Interview"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 52,
      title: "Dynamic Programming Mastery",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/oBt53YbR9Kk",
      videoId: "oBt53YbR9Kk",
      desc: "Complete guide to DP problems. Memoization, tabulation, and state optimization techniques.",
      duration: "5h 00m",
      level: "Advanced",
      rating: 4.8,
      reviews: 7890,
      tags: ["DP", "Advanced", "Video Course"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 53,
      title: "Graph Algorithms Complete Guide",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/09_LlHjoEiY",
      videoId: "09_LlHjoEiY",
      desc: "Master graph algorithms. DFS, BFS, Dijkstra, Kruskal, topological sort.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 15670,
      tags: ["Graphs", "Algorithms", "Traversal"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 54,
      title: "Tree Data Structures Deep Dive",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/H5JubkIy_p8",
      videoId: "H5JubkIy_p8",
      desc: "Complete guide to tree data structures. Binary trees, BST, AVL, B-trees.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 12340,
      tags: ["Trees", "Data Structures", "BST"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 55,
      title: "Sorting Algorithms Comparison",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/kPRA0W1kECg",
      videoId: "kPRA0W1kECg",
      desc: "Compare and implement all major sorting algorithms. Bubble, Quick, Merge, Heap sort.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 9870,
      tags: ["Sorting", "Algorithms", "Comparison"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 56,
      title: "Hash Tables Implementation",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/2E54GqF0H4s",
      videoId: "2E54GqF0H4s",
      desc: "Build hash tables from scratch. Collision resolution, load factors, rehashing.",
      duration: "3h Course",
      level: "Intermediate",
      rating: 4.5,
      reviews: 6780,
      tags: ["Hash Tables", "Data Structures", "Hashing"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 57,
      title: "Greedy Algorithms Masterclass",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/ARvQcqJ_-NY",
      videoId: "ARvQcqJ_-NY",
      desc: "Learn greedy algorithm design. Activity selection, Huffman coding, knapsack.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 8760,
      tags: ["Greedy", "Algorithms", "Optimization"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 58,
      title: "Backtracking Algorithms",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/Zq4upTEaQyM",
      videoId: "Zq4upTEaQyM",
      desc: "Solve complex problems with backtracking. N-Queens, Sudoku, permutations.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.8,
      reviews: 12340,
      tags: ["Backtracking", "Recursion", "Problem Solving"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 59,
      title: "String Algorithms",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/B-1ZgwPBL9Y",
      videoId: "B-1ZgwPBL9Y",
      desc: "Advanced string algorithms. KMP, Rabin-Karp, Z-algorithm, suffix arrays.",
      duration: "6h Course",
      level: "Advanced",
      rating: 4.6,
      reviews: 5670,
      tags: ["Strings", "Algorithms", "Pattern Matching"],
      difficulty: "Advanced",
      estimatedTime: "6 hours",
    },
    {
      id: 60,
      title: "Bit Manipulation Techniques",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/7jkIUgLC29I",
      videoId: "7jkIUgLC29I",
      desc: "Master bit manipulation for competitive programming. Bit tricks and optimizations.",
      duration: "3h Course",
      level: "Advanced",
      rating: 4.5,
      reviews: 8760,
      tags: ["Bit Manipulation", "Competitive Programming", "Optimization"],
      difficulty: "Advanced",
      estimatedTime: "3 hours",
    },
    {
      id: 61,
      title: "Segment Trees and Fenwick Trees",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/2bSS8BZq4Gg",
      videoId: "2bSS8BZq4Gg",
      desc: "Advanced data structures for range queries. Build and query segment trees.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.7,
      reviews: 4320,
      tags: ["Segment Trees", "Fenwick Trees", "Range Queries"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 62,
      title: "Trie Data Structure",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/AXjmTQ8LEoI",
      videoId: "AXjmTQ8LEoI",
      desc: "Implement and use Trie data structure. Auto-complete, spell checking, IP routing.",
      duration: "3h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 6780,
      tags: ["Trie", "Data Structures", "Auto-complete"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 63,
      title: "Union-Find Data Structure",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/0jNmHPfA_yE",
      videoId: "0jNmHPfA_yE",
      desc: "Disjoint set union with path compression and union by rank optimization.",
      duration: "2h Course",
      level: "Intermediate",
      rating: 4.5,
      reviews: 5430,
      tags: ["Union-Find", "Disjoint Sets", "Graph Algorithms"],
      difficulty: "Intermediate",
      estimatedTime: "2 hours",
    },
    {
      id: 64,
      title: "Heap Data Structure",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/HqPJF2L5h9U",
      videoId: "HqPJF2L5h9U",
      desc: "Priority queues and heap implementations. Min-heap, max-heap, heap sort.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 8760,
      tags: ["Heap", "Priority Queue", "Data Structures"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 65,
      title: "Sliding Window Technique",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/MK-NZ4hN7rs",
      videoId: "MK-NZ4hN7rs",
      desc: "Master sliding window problems. Fixed and variable size window techniques.",
      duration: "3h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 12340,
      tags: ["Sliding Window", "Two Pointers", "Array Problems"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 66,
      title: "Two Pointer Technique",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/4i6-9IzQHwo",
      videoId: "4i6-9IzQHwo",
      desc: "Solve array problems efficiently with two pointer approach. Fast and slow pointers.",
      duration: "2h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 9870,
      tags: ["Two Pointers", "Arrays", "Efficiency"],
      difficulty: "Intermediate",
      estimatedTime: "2 hours",
    },
    {
      id: 67,
      title: "Binary Search Problems",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/W9QJ8HaRvJQ",
      videoId: "W9QJ8HaRvJQ",
      desc: "Advanced binary search applications. Search in rotated arrays, peak finding.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 15670,
      tags: ["Binary Search", "Search Algorithms", "Problem Solving"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 68,
      title: "Recursion and Memoization",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/oQt2O6vHWLo",
      videoId: "oQt2O6vHWLo",
      desc: "Master recursive problem solving. Memoization, tabulation, recursive trees.",
      duration: "5h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 18760,
      tags: ["Recursion", "Memoization", "Dynamic Programming"],
      difficulty: "Intermediate",
      estimatedTime: "5 hours",
    },
    {
      id: 69,
      title: "Matrix Algorithms",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/0NiJ-hwwfIE",
      videoId: "0NiJ-hwwfIE",
      desc: "2D array problems and matrix algorithms. Rotation, spiral traversal, search.",
      duration: "3h Course",
      level: "Intermediate",
      rating: 4.5,
      reviews: 6780,
      tags: ["Matrix", "2D Arrays", "Algorithms"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 70,
      title: "Number Theory Algorithms",
      category: "dsa",
      type: "video",
      url: "https://www.youtube.com/embed/NTKwJIJ8-Fo",
      videoId: "NTKwJIJ8-Fo",
      desc: "Prime numbers, GCD, modular arithmetic, and number theory problems.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 5430,
      tags: ["Number Theory", "Mathematics", "Primes"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 71,
      title: "Competitive Programming Tips",
      category: "dsa",
      type: "docs",
      url: "https://cp-algorithms.com/",
      desc: "Essential algorithms and techniques for competitive programming contests.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.9,
      reviews: 23450,
      tags: ["Competitive Programming", "Contests", "Advanced"],
      difficulty: "Advanced",
      estimatedTime: "Ongoing",
    },
    {
      id: 72,
      title: "Time Complexity Analysis",
      category: "dsa",
      type: "docs",
      url: "https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/",
      desc: "Master asymptotic analysis. Big O, Omega, Theta notations and their applications.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.7,
      reviews: 15670,
      tags: ["Time Complexity", "Analysis", "Asymptotic"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 73,
      title: "Space Complexity Optimization",
      category: "dsa",
      type: "docs",
      url: "https://www.geeksforgeeks.org/space-complexity/",
      desc: "Optimize memory usage in algorithms. In-place algorithms and space-efficient solutions.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.5,
      reviews: 8760,
      tags: ["Space Complexity", "Memory", "Optimization"],
      difficulty: "Advanced",
      estimatedTime: "2 hours",
    },
    {
      id: 74,
      title: "Algorithm Paradigms",
      category: "dsa",
      type: "docs",
      url: "https://en.wikipedia.org/wiki/Algorithmic_paradigm",
      desc: "Different algorithmic approaches. Divide and conquer, greedy, dynamic programming.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.6,
      reviews: 4320,
      tags: ["Algorithm Paradigms", "Problem Solving", "Approaches"],
      difficulty: "Advanced",
      estimatedTime: "4 hours",
    },
    {
      id: 75,
      title: "NP-Complete Problems",
      category: "dsa",
      type: "docs",
      url: "https://en.wikipedia.org/wiki/NP-completeness",
      desc: "Understanding NP-complete problems and approximation algorithms.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.4,
      reviews: 3450,
      tags: ["NP-Complete", "Complexity Theory", "Advanced"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },

    // Web Development Resources (20)
    {
      id: 76,
      title: "React Official Documentation",
      category: "web",
      type: "docs",
      url: "https://react.dev/",
      desc: "Learn React from the official docs. Interactive tutorials, API reference, and best practices.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.9,
      reviews: 45680,
      featured: true,
      tags: ["React", "Frontend", "Documentation"],
      difficulty: "Beginner",
      estimatedTime: "Ongoing",
    },
    {
      id: 77,
      title: "JavaScript ES6+ Modern JavaScript",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/hdI2bqOjy3c",
      videoId: "hdI2bqOjy3c",
      desc: "Master modern JavaScript features - arrow functions, destructuring, promises, async/await.",
      duration: "5h 30m",
      level: "Intermediate",
      rating: 4.8,
      reviews: 23450,
      tags: ["JavaScript", "ES6", "Modern JS"],
      difficulty: "Intermediate",
      estimatedTime: "5.5 hours",
    },
    {
      id: 78,
      title: "CSS Flexbox & Grid Mastery",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/JJSoEo8JSnc",
      videoId: "JJSoEo8JSnc",
      desc: "Complete guide to modern CSS layouts. Build responsive websites with flexbox and grid.",
      duration: "3h 45m",
      level: "Beginner",
      rating: 4.7,
      reviews: 18760,
      tags: ["CSS", "Flexbox", "Grid", "Responsive"],
      difficulty: "Beginner",
      estimatedTime: "4 hours",
    },
    {
      id: 79,
      title: "Node.js Backend Development",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/Oe421EPjeBE",
      videoId: "Oe421EPjeBE",
      desc: "Build scalable backend APIs with Node.js, Express, and MongoDB. REST API design patterns.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 15670,
      tags: ["Node.js", "Backend", "API", "MongoDB"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 80,
      title: "Full Stack Project Tutorial",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/mrHNSanmqQ4",
      videoId: "mrHNSanmqQ4",
      desc: "Build a complete full-stack application from scratch. React frontend + Node.js backend.",
      duration: "12h Course",
      level: "Intermediate",
      rating: 4.9,
      reviews: 28940,
      featured: true,
      tags: ["Full Stack", "Project", "React", "Node.js"],
      difficulty: "Intermediate",
      estimatedTime: "12 hours",
    },
    {
      id: 81,
      title: "HTML5 & CSS3 Complete Guide",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/mU6anWqZJcc",
      videoId: "mU6anWqZJcc",
      desc: "Master HTML5 semantic elements and CSS3 animations, transitions, and transforms.",
      duration: "6h Course",
      level: "Beginner",
      rating: 4.6,
      reviews: 34560,
      tags: ["HTML5", "CSS3", "Frontend", "Web Standards"],
      difficulty: "Beginner",
      estimatedTime: "6 hours",
    },
    {
      id: 82,
      title: "Vue.js 3 Complete Course",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/FXpIoQ_rT_c",
      videoId: "FXpIoQ_rT_c",
      desc: "Learn Vue.js 3 with Composition API. Build modern reactive web applications.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["Vue.js", "JavaScript", "Frontend", "Reactive"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 83,
      title: "Angular Complete Guide",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/0LhBvpXKnDA",
      videoId: "0LhBvpXKnDA",
      desc: "Master Angular framework. Components, services, routing, and state management.",
      duration: "15h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 56780,
      tags: ["Angular", "TypeScript", "Framework", "Enterprise"],
      difficulty: "Intermediate",
      estimatedTime: "15 hours",
    },
    {
      id: 84,
      title: "Next.js Full Course",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/mTz0GXj8NN0",
      videoId: "mTz0GXj8NN0",
      desc: "Build full-stack React applications with Next.js. SSR, SSG, API routes.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.9,
      reviews: 45670,
      tags: ["Next.js", "React", "Full Stack", "SSR"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 85,
      title: "Tailwind CSS Complete Guide",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/UBOj6rqRUME",
      videoId: "UBOj6rqRUME",
      desc: "Master utility-first CSS with Tailwind. Build beautiful responsive designs quickly.",
      duration: "4h Course",
      level: "Beginner",
      rating: 4.8,
      reviews: 23450,
      tags: ["Tailwind CSS", "Utility CSS", "Responsive Design"],
      difficulty: "Beginner",
      estimatedTime: "4 hours",
    },
    {
      id: 86,
      title: "Web Performance Optimization",
      category: "web",
      type: "docs",
      url: "https://web.dev/learn/performance/",
      desc: "Optimize web applications for speed. Core Web Vitals, lazy loading, caching strategies.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.7,
      reviews: 15670,
      tags: ["Performance", "Optimization", "Web Vitals"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 87,
      title: "Progressive Web Apps (PWA)",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/5fURH3Y2k5g",
      videoId: "5fURH3Y2k5g",
      desc: "Build installable web apps with offline capabilities. Service workers, manifest files.",
      duration: "5h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 12340,
      tags: ["PWA", "Web Apps", "Offline", "Installable"],
      difficulty: "Intermediate",
      estimatedTime: "5 hours",
    },
    {
      id: 88,
      title: "Web Accessibility (a11y)",
      category: "web",
      type: "docs",
      url: "https://web.dev/learn/accessibility/",
      desc: "Make web applications accessible to everyone. WCAG guidelines, screen readers, keyboard navigation.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.5,
      reviews: 8760,
      tags: ["Accessibility", "a11y", "Inclusive Design", "WCAG"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 89,
      title: "GraphQL Complete Guide",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/ed8SzALpx1Q",
      videoId: "ed8SzALpx1Q",
      desc: "Master GraphQL API development. Schema design, resolvers, Apollo Client.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 18760,
      tags: ["GraphQL", "API", "Schema", "Apollo"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 90,
      title: "Web Security Fundamentals",
      category: "web",
      type: "docs",
      url: "https://owasp.org/www-project-top-ten/",
      desc: "Essential web security practices. XSS, CSRF, SQL injection prevention, HTTPS.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.8,
      reviews: 23450,
      tags: ["Security", "OWASP", "XSS", "CSRF"],
      difficulty: "Intermediate",
      estimatedTime: "5 hours",
    },
    {
      id: 91,
      title: "Docker for Web Developers",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/fqMOX6JJhGo",
      videoId: "fqMOX6JJhGo",
      desc: "Containerize web applications with Docker. Multi-stage builds, docker-compose.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 15670,
      tags: ["Docker", "Containers", "DevOps", "Deployment"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 92,
      title: "WebSockets and Real-time Apps",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/8ARodQ4WlfQ",
      videoId: "8ARodQ4WlfQ",
      desc: "Build real-time applications with WebSockets. Socket.io, chat apps, live updates.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 12340,
      tags: ["WebSockets", "Real-time", "Socket.io", "Live Updates"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 93,
      title: "REST API Design Best Practices",
      category: "web",
      type: "docs",
      url: "https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design",
      desc: "Design scalable REST APIs. HTTP methods, status codes, versioning, documentation.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.6,
      reviews: 18760,
      tags: ["REST API", "Design", "HTTP", "Best Practices"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 94,
      title: "CSS-in-JS Libraries",
      category: "web",
      type: "video",
      url: "https://www.youtube.com/embed/0XTX8xG2gLk",
      videoId: "0XTX8xG2gLk",
      desc: "Styled-components, Emotion, and CSS-in-JS solutions for React applications.",
      duration: "3h Course",
      level: "Intermediate",
      rating: 4.5,
      reviews: 8760,
      tags: ["CSS-in-JS", "Styled Components", "React", "Styling"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 95,
      title: "Web Components with JavaScript",
      category: "web",
      type: "docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/Web_Components",
      desc: "Build reusable web components with vanilla JavaScript. Custom elements, shadow DOM.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.4,
      reviews: 5430,
      tags: ["Web Components", "Custom Elements", "Shadow DOM"],
      difficulty: "Advanced",
      estimatedTime: "4 hours",
    },

    // Backend Development Resources (18)
    {
      id: 96,
      title: "Node.js Complete Course",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/Oe421EPjeBE",
      videoId: "Oe421EPjeBE",
      desc: "Build backend applications with Node.js. Express, MongoDB, authentication, deployment.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 89230,
      featured: true,
      tags: ["Node.js", "Express", "MongoDB", "Backend"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 97,
      title: "Python Django Complete Guide",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/rHux0gMZ3Eg",
      videoId: "rHux0gMZ3Eg",
      desc: "Master Django web framework. Models, views, templates, admin, authentication.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 45670,
      tags: ["Django", "Python", "Web Framework", "ORM"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 98,
      title: "FastAPI with Python",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/7t2alSnE2-I",
      videoId: "7t2alSnE2-I",
      desc: "Build modern APIs with FastAPI. Automatic documentation, async support, validation.",
      duration: "7h Course",
      level: "Intermediate",
      rating: 4.9,
      reviews: 23450,
      tags: ["FastAPI", "Python", "APIs", "Async"],
      difficulty: "Intermediate",
      estimatedTime: "7 hours",
    },
    {
      id: 99,
      title: "Spring Boot Java Backend",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/9SGDpanrc8U",
      videoId: "9SGDpanrc8U",
      desc: "Build enterprise applications with Spring Boot. JPA, security, microservices.",
      duration: "12h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["Spring Boot", "Java", "Microservices", "Enterprise"],
      difficulty: "Intermediate",
      estimatedTime: "12 hours",
    },
    {
      id: 100,
      title: "Go Backend Development",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/SqrbIlUwR0U",
      videoId: "SqrbIlUwR0U",
      desc: "Build scalable backends with Go. Gin framework, concurrency, database integration.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 18760,
      tags: ["Go", "Backend", "Concurrency", "Scalable"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 101,
      title: "Ruby on Rails Complete Guide",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/fmyvWz5gXiY",
      videoId: "fmyvWz5gXiY",
      desc: "Rapid web development with Rails. MVC, ActiveRecord, REST APIs, testing.",
      duration: "15h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 23450,
      tags: ["Ruby on Rails", "MVC", "Rapid Development"],
      difficulty: "Intermediate",
      estimatedTime: "15 hours",
    },
    {
      id: 102,
      title: "PHP Laravel Framework",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/ImtZ5yENzgE",
      videoId: "ImtZ5yENzgE",
      desc: "Build modern PHP applications with Laravel. Eloquent ORM, Blade templates, APIs.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["PHP", "Laravel", "ORM", "MVC"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 103,
      title: "Database Design & SQL",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/HXV3zeQKqGY",
      videoId: "HXV3zeQKqGY",
      desc: "Master database design principles. Normalization, indexing, query optimization.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 45670,
      tags: ["Database Design", "SQL", "Normalization", "Indexing"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 104,
      title: "MongoDB Complete Course",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/ofme2o29ngU",
      videoId: "ofme2o29ngU",
      desc: "Master MongoDB NoSQL database. CRUD operations, aggregation, indexing, replication.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 23450,
      tags: ["MongoDB", "NoSQL", "Database", "Aggregation"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 105,
      title: "PostgreSQL Advanced Features",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/n2SnHqBhJpo",
      videoId: "n2SnHqBhJpo",
      desc: "Advanced PostgreSQL features. JSONB, full-text search, window functions, partitioning.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.6,
      reviews: 12340,
      tags: ["PostgreSQL", "Advanced", "JSONB", "Full-text Search"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 106,
      title: "Redis Caching & Data Structures",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/Hbt56gFj998",
      videoId: "Hbt56gFj998",
      desc: "Master Redis for caching and data structures. Pub/sub, persistence, clustering.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 18760,
      tags: ["Redis", "Caching", "Data Structures", "Pub/Sub"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 107,
      title: "GraphQL API Development",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/ed8SzALpx1Q",
      videoId: "ed8SzALpx1Q",
      desc: "Build GraphQL APIs with Apollo Server. Schema design, resolvers, subscriptions.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 23450,
      tags: ["GraphQL", "API", "Apollo", "Schema"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 108,
      title: "Microservices Architecture",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/j6ow-UeF8tE",
      videoId: "j6ow-UeF8tE",
      desc: "Design and implement microservices. Service discovery, API gateway, distributed tracing.",
      duration: "10h Course",
      level: "Advanced",
      rating: 4.8,
      reviews: 15670,
      tags: ["Microservices", "Architecture", "Distributed Systems"],
      difficulty: "Advanced",
      estimatedTime: "10 hours",
    },
    {
      id: 109,
      title: "Authentication & Authorization",
      category: "backend",
      type: "docs",
      url: "https://tools.ietf.org/html/rfc6749",
      desc: "OAuth 2.0, JWT, session management, role-based access control, security best practices.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.6,
      reviews: 18760,
      tags: ["Authentication", "OAuth", "JWT", "Security"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 110,
      title: "API Rate Limiting & Caching",
      category: "backend",
      type: "docs",
      url: "https://redis.io/topics/lru-cache",
      desc: "Implement rate limiting and caching strategies. Redis, in-memory cache, CDN.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.5,
      reviews: 12340,
      tags: ["Rate Limiting", "Caching", "Performance", "Redis"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 111,
      title: "Backend Testing Strategies",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/1G5VqjKtNvM",
      videoId: "1G5VqjKtNvM",
      desc: "Unit testing, integration testing, TDD. Jest, Mocha, Supertest, test coverage.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 15670,
      tags: ["Testing", "TDD", "Jest", "Integration Testing"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 112,
      title: "Container Orchestration with Kubernetes",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/X48VuDVv0do",
      videoId: "X48VuDVv0do",
      desc: "Deploy and manage containerized applications with Kubernetes. Pods, services, deployments.",
      duration: "12h Course",
      level: "Advanced",
      rating: 4.7,
      reviews: 23450,
      tags: ["Kubernetes", "Containers", "Orchestration", "DevOps"],
      difficulty: "Advanced",
      estimatedTime: "12 hours",
    },
    {
      id: 113,
      title: "Serverless Architecture",
      category: "backend",
      type: "video",
      url: "https://www.youtube.com/embed/M8gTZ6EU3R8",
      videoId: "M8gTZ6EU3R8",
      desc: "Build serverless applications with AWS Lambda, API Gateway, DynamoDB, Cloud Functions.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 18760,
      tags: ["Serverless", "AWS Lambda", "Cloud Functions", "NoOps"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },

    // Interview Preparation Resources (15)
    {
      id: 114,
      title: "Top 100 Interview Questions",
      category: "interview",
      type: "docs",
      url: "https://www.geeksforgeeks.org/top-100-data-structure-and-algorithms-dsa-interview-questions-topic-wise/",
      desc: "Most frequently asked coding interview questions with detailed solutions and explanations.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.8,
      reviews: 67890,
      featured: true,
      tags: ["Interview", "Coding", "Questions"],
      difficulty: "Intermediate",
      estimatedTime: "Ongoing",
    },
    {
      id: 115,
      title: "Behavioral Interview Guide",
      category: "interview",
      type: "docs",
      url: "https://www.themuse.com/advice/star-interview-method",
      desc: "Master the STAR method. 50+ example answers for common behavioral questions.",
      duration: "3h Read",
      level: "All Levels",
      rating: 4.7,
      reviews: 12340,
      tags: ["Behavioral", "STAR Method", "Soft Skills"],
      difficulty: "Beginner",
      estimatedTime: "3 hours",
    },
    {
      id: 116,
      title: "Mock Interview Practice",
      category: "interview",
      type: "tool",
      url: "/interview",
      desc: "Practice with our AI-powered mock interview system. Get instant feedback on your responses.",
      duration: "Interactive",
      level: "All Levels",
      rating: 4.9,
      reviews: 8970,
      internal: true,
      tags: ["Mock Interview", "AI", "Practice"],
      difficulty: "Beginner",
      estimatedTime: "Ongoing",
    },
    {
      id: 117,
      title: "System Design Interview Prep",
      category: "interview",
      type: "video",
      url: "https://www.youtube.com/embed/xpDnVSmNFX0",
      videoId: "xpDnVSmNFX0",
      desc: "System design interview preparation. Databases, messaging, consistency, scalability.",
      duration: "2h Course",
      level: "Advanced",
      rating: 4.9,
      reviews: 23450,
      tags: ["System Design", "Interview", "Scalability"],
      difficulty: "Advanced",
      estimatedTime: "2 hours",
    },
    {
      id: 118,
      title: "JavaScript Interview Questions",
      category: "interview",
      type: "docs",
      url: "https://github.com/sudheerj/javascript-interview-questions",
      desc: "500+ JavaScript interview questions with detailed answers and explanations.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.8,
      reviews: 45670,
      tags: ["JavaScript", "Interview", "Questions"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 119,
      title: "Python Interview Questions",
      category: "interview",
      type: "docs",
      url: "https://github.com/viraptor/python-interview-questions",
      desc: "Comprehensive Python interview questions covering basics to advanced topics.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.7,
      reviews: 34560,
      tags: ["Python", "Interview", "Questions"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 120,
      title: "Salary Negotiation Techniques",
      category: "interview",
      type: "video",
      url: "https://www.youtube.com/embed/u9BoG1n1948",
      videoId: "u9BoG1n1948",
      desc: "Master salary negotiation. Research, timing, communication strategies for better offers.",
      duration: "25m",
      level: "All Levels",
      rating: 4.7,
      reviews: 8760,
      tags: ["Salary", "Negotiation", "Career"],
      difficulty: "Beginner",
      estimatedTime: "30 minutes",
    },
    {
      id: 121,
      title: "Technical Interview Strategies",
      category: "interview",
      type: "video",
      url: "https://www.youtube.com/embed/YJjSfIg3Zz4",
      videoId: "YJjSfIg3Zz4",
      desc: "Master technical interviews. Problem-solving frameworks, communication tips.",
      duration: "3h Course",
      level: "All Levels",
      rating: 4.8,
      reviews: 23450,
      tags: ["Technical Interview", "Problem Solving", "Communication"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 122,
      title: "FAANG Interview Experience",
      category: "interview",
      type: "docs",
      url: "https://leetcode.com/discuss/interview-question",
      desc: "Real interview experiences from FAANG companies. Questions, tips, and insights.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.9,
      reviews: 56780,
      tags: ["FAANG", "Interview Experience", "Real Stories"],
      difficulty: "Advanced",
      estimatedTime: "Ongoing",
    },
    {
      id: 123,
      title: "Resume Review for Tech Jobs",
      category: "interview",
      type: "docs",
      url: "https://www.overleaf.com/latex/templates/tagged/cv",
      desc: "Optimize your resume for tech positions. ATS-friendly templates and examples.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.6,
      reviews: 34560,
      tags: ["Resume", "ATS", "Tech Jobs"],
      difficulty: "Beginner",
      estimatedTime: "2 hours",
    },
    {
      id: 124,
      title: "LinkedIn Profile Optimization",
      category: "interview",
      type: "docs",
      url: "https://www.linkedin.com/business/talent/blog/talent-acquisition/linkedin-profile-optimization",
      desc: "Optimize LinkedIn profile for job search. Keywords, summary, recommendations.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.5,
      reviews: 23450,
      tags: ["LinkedIn", "Profile", "Job Search"],
      difficulty: "Beginner",
      estimatedTime: "1 hour",
    },
    {
      id: 125,
      title: "GitHub Portfolio Building",
      category: "interview",
      type: "docs",
      url: "https://github.com/sindresorhus/awesome",
      desc: "Build an impressive GitHub portfolio. Project ideas, README templates, contribution guides.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.7,
      reviews: 45670,
      tags: ["GitHub", "Portfolio", "Projects"],
      difficulty: "Beginner",
      estimatedTime: "4 hours",
    },
    {
      id: 126,
      title: "Networking for Developers",
      category: "interview",
      type: "video",
      url: "https://www.youtube.com/embed/1h7kyN5wt9M",
      videoId: "1h7kyN5wt9M",
      desc: "Build professional networks. Attend meetups, conferences, online communities.",
      duration: "2h Course",
      level: "All Levels",
      rating: 4.6,
      reviews: 18760,
      tags: ["Networking", "Career", "Community"],
      difficulty: "Beginner",
      estimatedTime: "2 hours",
    },
    {
      id: 127,
      title: "Job Search Strategies",
      category: "interview",
      type: "docs",
      url: "https://www.levels.fyi/blog/job-search-strategies.html",
      desc: "Effective job search strategies. Application tracking, follow-ups, multiple offers.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.8,
      reviews: 34560,
      tags: ["Job Search", "Strategies", "Applications"],
      difficulty: "Beginner",
      estimatedTime: "3 hours",
    },
    {
      id: 128,
      title: "Offer Evaluation & Negotiation",
      category: "interview",
      type: "docs",
      url: "https://www.levels.fyi/blog/offer-evaluation.html",
      desc: "Evaluate job offers comprehensively. Salary, equity, benefits, growth opportunities.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.7,
      reviews: 23450,
      tags: ["Job Offers", "Evaluation", "Negotiation"],
      difficulty: "Intermediate",
      estimatedTime: "2 hours",
    },

    // Career Development Resources (12)
    {
      id: 129,
      title: "Tech Resume Writing Guide",
      category: "career",
      type: "docs",
      url: "https://www.overleaf.com/latex/templates/tagged/cv",
      desc: "Create a standout tech resume. ATS-friendly templates and real examples from FAANG engineers.",
      duration: "Quick Read",
      level: "All Levels",
      rating: 4.8,
      reviews: 34560,
      tags: ["Resume", "Career", "Job Search"],
      difficulty: "Beginner",
      estimatedTime: "2 hours",
    },
    {
      id: 130,
      title: "LinkedIn Optimization for Developers",
      category: "career",
      type: "docs",
      url: "https://www.linkedin.com/business/talent/blog/talent-acquisition/linkedin-profile-optimization",
      desc: "Optimize LinkedIn profile for tech careers. Keywords, projects, networking strategies.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.6,
      reviews: 23450,
      tags: ["LinkedIn", "Career", "Networking"],
      difficulty: "Beginner",
      estimatedTime: "3 hours",
    },
    {
      id: 131,
      title: "GitHub Portfolio Guide",
      category: "career",
      type: "docs",
      url: "https://github.com/sindresorhus/awesome",
      desc: "Build impressive GitHub portfolio. Project ideas, contribution strategies, README templates.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.7,
      reviews: 45670,
      tags: ["GitHub", "Portfolio", "Projects"],
      difficulty: "Beginner",
      estimatedTime: "4 hours",
    },
    {
      id: 132,
      title: "Salary Negotiation Techniques",
      category: "career",
      type: "video",
      url: "https://www.youtube.com/embed/u9BoG1n1948",
      videoId: "u9BoG1n1948",
      desc: "Master salary negotiation. Research, timing, communication strategies for better offers.",
      duration: "25m",
      level: "All Levels",
      rating: 4.7,
      reviews: 8760,
      tags: ["Salary", "Negotiation", "Career"],
      difficulty: "Beginner",
      estimatedTime: "30 minutes",
    },
    {
      id: 133,
      title: "Career Planning for Developers",
      category: "career",
      type: "docs",
      url: "https://www.levels.fyi/blog/career-planning.html",
      desc: "Long-term career planning. Skill development, role progression, work-life balance.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.8,
      reviews: 34560,
      tags: ["Career Planning", "Development", "Growth"],
      difficulty: "Beginner",
      estimatedTime: "3 hours",
    },
    {
      id: 134,
      title: "Tech Career Paths",
      category: "career",
      type: "docs",
      url: "https://www.levels.fyi/stacks",
      desc: "Explore different tech career paths. Frontend, backend, full-stack, DevOps, data science.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.9,
      reviews: 56780,
      tags: ["Career Paths", "Tech Roles", "Specializations"],
      difficulty: "Beginner",
      estimatedTime: "2 hours",
    },
    {
      id: 135,
      title: "Remote Work Guide",
      category: "career",
      type: "docs",
      url: "https://github.com/lukasz-madon/awesome-remote-job",
      desc: "Master remote work. Productivity, communication, work-life balance, company culture.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.6,
      reviews: 23450,
      tags: ["Remote Work", "Productivity", "Work-Life Balance"],
      difficulty: "Beginner",
      estimatedTime: "2 hours",
    },
    {
      id: 136,
      title: "Freelancing for Developers",
      category: "career",
      type: "video",
      url: "https://www.youtube.com/embed/7KLX9rN7Z8E",
      videoId: "7KLX9rN7Z8E",
      desc: "Start freelancing career. Client acquisition, project management, pricing strategies.",
      duration: "4h Course",
      level: "All Levels",
      rating: 4.5,
      reviews: 18760,
      tags: ["Freelancing", "Client Work", "Business"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 137,
      title: "Building Personal Brand",
      category: "career",
      type: "docs",
      url: "https://www.indiehackers.com/post/how-to-build-a-personal-brand-as-a-developer-8e7e4f6b4a9f",
      desc: "Build personal brand as developer. Blogging, speaking, open source contributions.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.7,
      reviews: 34560,
      tags: ["Personal Brand", "Blogging", "Speaking"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 138,
      title: "Tech Conference Speaking",
      category: "career",
      type: "docs",
      url: "https://www.youtube.com/results?search_query=how+to+speak+at+tech+conferences",
      desc: "Speak at tech conferences. CFP writing, presentation skills, networking opportunities.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.6,
      reviews: 12340,
      tags: ["Speaking", "Conferences", "Presentation"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 139,
      title: "Mentorship and Leadership",
      category: "career",
      type: "video",
      url: "https://www.youtube.com/embed/8GjkmTQ8LEoI",
      videoId: "8GjkmTQ8LEoI",
      desc: "Develop leadership skills. Mentoring juniors, team management, technical leadership.",
      duration: "3h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 23450,
      tags: ["Leadership", "Mentorship", "Management"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 140,
      title: "Work-Life Balance in Tech",
      category: "career",
      type: "docs",
      url: "https://www.gitlab.com/company/culture/all-remote/guide/",
      desc: "Maintain work-life balance in tech. Burnout prevention, boundaries, self-care.",
      duration: "Self-paced",
      level: "All Levels",
      rating: 4.7,
      reviews: 34560,
      tags: ["Work-Life Balance", "Burnout", "Wellness"],
      difficulty: "Beginner",
      estimatedTime: "2 hours",
    },

    // System Design Resources (14)
    {
      id: 141,
      title: "System Design Primer",
      category: "system-design",
      type: "docs",
      url: "https://github.com/donnemartin/system-design-primer",
      desc: "Learn how to design large-scale systems. Comprehensive guide with real-world examples.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.9,
      reviews: 156780,
      featured: true,
      tags: ["System Design", "Architecture", "Scalability"],
      difficulty: "Advanced",
      estimatedTime: "10 hours",
    },
    {
      id: 142,
      title: "Designing Data-Intensive Applications",
      category: "system-design",
      type: "book",
      url: "https://dataintensive.net/",
      desc: "Essential concepts for designing data-intensive applications. Storage, retrieval, processing.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.9,
      reviews: 45670,
      tags: ["Data-Intensive", "Distributed Systems", "Architecture"],
      difficulty: "Advanced",
      estimatedTime: "15 hours",
    },
    {
      id: 143,
      title: "System Design Interview",
      category: "system-design",
      type: "video",
      url: "https://www.youtube.com/embed/xpDnVSmNFX0",
      videoId: "xpDnVSmNFX0",
      desc: "System design interview preparation. Databases, messaging, consistency, scalability.",
      duration: "2h Course",
      level: "Advanced",
      rating: 4.9,
      reviews: 23450,
      tags: ["System Design", "Interview", "Scalability"],
      difficulty: "Advanced",
      estimatedTime: "2 hours",
    },
    {
      id: 144,
      title: "Microservices Architecture",
      category: "system-design",
      type: "video",
      url: "https://www.youtube.com/embed/j6ow-UeF8tE",
      videoId: "j6ow-UeF8tE",
      desc: "Design and implement microservices. Service discovery, API gateway, distributed tracing.",
      duration: "10h Course",
      level: "Advanced",
      rating: 4.8,
      reviews: 15670,
      tags: ["Microservices", "Architecture", "Distributed"],
      difficulty: "Advanced",
      estimatedTime: "10 hours",
    },
    {
      id: 145,
      title: "Database Sharding & Partitioning",
      category: "system-design",
      type: "docs",
      url: "https://www.citusdata.com/blog/2018/01/10/sharding-postgres/",
      desc: "Master database sharding strategies. Horizontal partitioning, replication, consistency.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.7,
      reviews: 12340,
      tags: ["Database", "Sharding", "Partitioning"],
      difficulty: "Advanced",
      estimatedTime: "4 hours",
    },
    {
      id: 146,
      title: "Load Balancing Techniques",
      category: "system-design",
      type: "video",
      url: "https://www.youtube.com/embed/2vr6xMzlWcI",
      videoId: "2vr6xMzlWcI",
      desc: "Implement load balancing. Round-robin, least connections, IP hashing, consistent hashing.",
      duration: "3h Course",
      level: "Advanced",
      rating: 4.6,
      reviews: 8760,
      tags: ["Load Balancing", "Scalability", "Distribution"],
      difficulty: "Advanced",
      estimatedTime: "3 hours",
    },
    {
      id: 147,
      title: "Caching Strategies",
      category: "system-design",
      type: "docs",
      url: "https://redis.io/topics/lru-cache",
      desc: "Implement effective caching. Cache-aside, write-through, write-behind patterns.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.8,
      reviews: 18760,
      tags: ["Caching", "Performance", "Redis"],
      difficulty: "Advanced",
      estimatedTime: "3 hours",
    },
    {
      id: 148,
      title: "Message Queues & Event Streaming",
      category: "system-design",
      type: "video",
      url: "https://www.youtube.com/embed/0Z5MZ0YxK9I",
      videoId: "0Z5MZ0YxK9I",
      desc: "Design event-driven systems. Kafka, RabbitMQ, event sourcing, CQRS patterns.",
      duration: "6h Course",
      level: "Advanced",
      rating: 4.7,
      reviews: 12340,
      tags: ["Message Queues", "Kafka", "Event Streaming"],
      difficulty: "Advanced",
      estimatedTime: "6 hours",
    },
    {
      id: 149,
      title: "API Gateway Patterns",
      category: "system-design",
      type: "docs",
      url: "https://microservices.io/patterns/apigateway.html",
      desc: "Implement API gateways. Routing, authentication, rate limiting, request transformation.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.6,
      reviews: 9870,
      tags: ["API Gateway", "Microservices", "Routing"],
      difficulty: "Advanced",
      estimatedTime: "4 hours",
    },
    {
      id: 150,
      title: "Distributed Systems Fundamentals",
      category: "system-design",
      type: "video",
      url: "https://www.youtube.com/embed/cQP8WApzIQQ",
      videoId: "cQP8WApzIQQ",
      desc: "Core concepts of distributed systems. CAP theorem, consensus, fault tolerance.",
      duration: "8h Course",
      level: "Advanced",
      rating: 4.8,
      reviews: 15670,
      tags: ["Distributed Systems", "CAP Theorem", "Consensus"],
      difficulty: "Advanced",
      estimatedTime: "8 hours",
    },
    {
      id: 151,
      title: "Database Replication & Consistency",
      category: "system-design",
      type: "docs",
      url: "https://www.cockroachlabs.com/blog/consistency-model/",
      desc: "Database replication strategies. Master-slave, multi-master, eventual consistency.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.7,
      reviews: 8760,
      tags: ["Database", "Replication", "Consistency"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 152,
      title: "Circuit Breaker Pattern",
      category: "system-design",
      type: "video",
      url: "https://www.youtube.com/embed/3CbWl2e4gJI",
      videoId: "3CbWl2e4gJI",
      desc: "Implement fault tolerance with circuit breakers. Resilience patterns for distributed systems.",
      duration: "2h Course",
      level: "Advanced",
      rating: 4.5,
      reviews: 5430,
      tags: ["Circuit Breaker", "Fault Tolerance", "Resilience"],
      difficulty: "Advanced",
      estimatedTime: "2 hours",
    },
    {
      id: 153,
      title: "Service Mesh with Istio",
      category: "system-design",
      type: "video",
      url: "https://www.youtube.com/embed/16fgzklcF7Y",
      videoId: "16fgzklcF7Y",
      desc: "Implement service mesh architecture. Traffic management, security, observability.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.6,
      reviews: 6780,
      tags: ["Service Mesh", "Istio", "Microservices"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 154,
      title: "Monitoring & Observability",
      category: "system-design",
      type: "docs",
      url: "https://opentelemetry.io/docs/",
      desc: "Implement comprehensive monitoring. Metrics, logging, tracing, alerting strategies.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.7,
      reviews: 12340,
      tags: ["Monitoring", "Observability", "Metrics"],
      difficulty: "Advanced",
      estimatedTime: "6 hours",
    },

    // AI & ML Resources (16)
    {
      id: 155,
      title: "Machine Learning Course",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/jGwO_UgTS7I",
      videoId: "jGwO_UgTS7I",
      desc: "Stanford's famous ML course. Learn supervised and unsupervised learning algorithms.",
      duration: "2h Course",
      level: "Intermediate",
      rating: 4.9,
      reviews: 234560,
      featured: true,
      tags: ["ML", "Stanford", "AI", "Course"],
      difficulty: "Intermediate",
      estimatedTime: "2 hours",
    },
    {
      id: 156,
      title: "Deep Learning Specialization",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/CS4cs9xVecg",
      videoId: "CS4cs9xVecg",
      desc: "Master deep learning from Andrew Ng. Neural networks, CNNs, RNNs, transformers.",
      duration: "6h Course",
      level: "Advanced",
      rating: 4.9,
      reviews: 178900,
      tags: ["Deep Learning", "Neural Networks", "AI"],
      difficulty: "Advanced",
      estimatedTime: "6 hours",
    },
    {
      id: 157,
      title: "Natural Language Processing",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/8S2xG6r0qOg",
      videoId: "8S2xG6r0qOg",
      desc: "NLP fundamentals and applications. Tokenization, embeddings, transformers, BERT.",
      duration: "8h Course",
      level: "Advanced",
      rating: 4.8,
      reviews: 45670,
      tags: ["NLP", "Transformers", "BERT", "AI"],
      difficulty: "Advanced",
      estimatedTime: "8 hours",
    },
    {
      id: 158,
      title: "Computer Vision with OpenCV",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/oXlwWbU8l2o",
      videoId: "oXlwWbU8l2o",
      desc: "Computer vision applications. Image processing, object detection, facial recognition.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["Computer Vision", "OpenCV", "Image Processing"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 159,
      title: "TensorFlow Complete Guide",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/tPYj3fFJGjk",
      videoId: "tPYj3fFJGjk",
      desc: "Master TensorFlow 2.0. Keras API, custom models, deployment, TensorFlow Serving.",
      duration: "12h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 56780,
      tags: ["TensorFlow", "Keras", "Deep Learning"],
      difficulty: "Intermediate",
      estimatedTime: "12 hours",
    },
    {
      id: 160,
      title: "PyTorch Deep Learning",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/GIsg-ZUy0MY",
      videoId: "GIsg-ZUy0MY",
      desc: "PyTorch for deep learning. Dynamic computation graphs, neural networks, research workflows.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 45670,
      tags: ["PyTorch", "Deep Learning", "Neural Networks"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 161,
      title: "Scikit-Learn Machine Learning",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/0Lt9w-BxKFQ",
      videoId: "0Lt9w-BxKFQ",
      desc: "Practical machine learning with scikit-learn. Classification, regression, clustering.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["Scikit-learn", "ML", "Python"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 162,
      title: "Reinforcement Learning",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/cO5g5qLrLSo",
      videoId: "cO5g5qLrLSo",
      desc: "Reinforcement learning fundamentals. Q-learning, policy gradients, deep RL.",
      duration: "8h Course",
      level: "Advanced",
      rating: 4.6,
      reviews: 23450,
      tags: ["Reinforcement Learning", "Q-Learning", "Deep RL"],
      difficulty: "Advanced",
      estimatedTime: "8 hours",
    },
    {
      id: 163,
      title: "MLOps and Model Deployment",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/atj9lJ5cJ1A",
      videoId: "atj9lJ5cJ1A",
      desc: "Deploy ML models to production. Model serving, monitoring, A/B testing, CI/CD for ML.",
      duration: "6h Course",
      level: "Advanced",
      rating: 4.7,
      reviews: 18760,
      tags: ["MLOps", "Model Deployment", "Production"],
      difficulty: "Advanced",
      estimatedTime: "6 hours",
    },
    {
      id: 164,
      title: "AI Ethics and Responsible ML",
      category: "ai-ml",
      type: "docs",
      url: "https://ai.google/responsibilities/responsible-ai-practices/",
      desc: "Ethical considerations in AI/ML. Bias detection, fairness, transparency, accountability.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.5,
      reviews: 12340,
      tags: ["AI Ethics", "Responsible ML", "Bias"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 165,
      title: "AutoML and Automated Machine Learning",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/1R_xbUOIWaE",
      videoId: "1R_xbUOIWaE",
      desc: "Automated machine learning tools. Auto-sklearn, TPOT, Google Cloud AutoML.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.4,
      reviews: 8760,
      tags: ["AutoML", "Automated ML", "Tools"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 166,
      title: "Time Series Analysis",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/Prpu_U5tKkE",
      videoId: "Prpu_U5tKkE",
      desc: "Time series forecasting and analysis. ARIMA, Prophet, LSTM for time series.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 15670,
      tags: ["Time Series", "Forecasting", "ARIMA"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 167,
      title: "Generative AI with GANs",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/8L11aMN5KY8",
      videoId: "8L11aMN5KY8",
      desc: "Generative Adversarial Networks. Image generation, style transfer, DCGANs.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.7,
      reviews: 12340,
      tags: ["GANs", "Generative AI", "Image Generation"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 168,
      title: "Explainable AI (XAI)",
      category: "ai-ml",
      type: "docs",
      url: "https://christophm.github.io/interpretable-ml-book/",
      desc: "Make AI models interpretable. Feature importance, SHAP, LIME, model explanations.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.6,
      reviews: 9870,
      tags: ["XAI", "Explainable AI", "Interpretability"],
      difficulty: "Advanced",
      estimatedTime: "6 hours",
    },
    {
      id: 169,
      title: "AI Model Optimization",
      category: "ai-ml",
      type: "video",
      url: "https://www.youtube.com/embed/VJQ7K8zYc8E",
      videoId: "VJQ7K8zYc8E",
      desc: "Optimize ML models for production. Model compression, quantization, pruning.",
      duration: "4h Course",
      level: "Advanced",
      rating: 4.5,
      reviews: 6780,
      tags: ["Model Optimization", "Quantization", "Compression"],
      difficulty: "Advanced",
      estimatedTime: "4 hours",
    },
    {
      id: 170,
      title: "AI in Production",
      category: "ai-ml",
      type: "docs",
      url: "https://developers.google.com/machine-learning/guides/rules-of-ml",
      desc: "Best practices for ML in production. Monitoring, maintenance, continuous learning.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.7,
      reviews: 15670,
      tags: ["Production ML", "Monitoring", "Maintenance"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },

    // DevOps Resources (12)
    {
      id: 171,
      title: "Docker Complete Course",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/fqMOX6JJhGo",
      videoId: "fqMOX6JJhGo",
      desc: "Master Docker containerization. Images, containers, docker-compose, multi-stage builds.",
      duration: "4h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 45670,
      featured: true,
      tags: ["Docker", "Containers", "DevOps"],
      difficulty: "Intermediate",
      estimatedTime: "4 hours",
    },
    {
      id: 172,
      title: "Kubernetes Fundamentals",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/X48VuDVv0do",
      videoId: "X48VuDVv0do",
      desc: "Learn Kubernetes orchestration. Pods, services, deployments, configmaps, secrets.",
      duration: "12h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["Kubernetes", "Orchestration", "Containers"],
      difficulty: "Intermediate",
      estimatedTime: "12 hours",
    },
    {
      id: 173,
      title: "AWS DevOps Certification Prep",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/8Xm7mw8Kv4I",
      videoId: "8Xm7mw8Kv4I",
      desc: "Prepare for AWS DevOps certification. CI/CD, monitoring, infrastructure as code.",
      duration: "15h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 23450,
      tags: ["AWS", "DevOps", "Certification"],
      difficulty: "Intermediate",
      estimatedTime: "15 hours",
    },
    {
      id: 174,
      title: "Jenkins CI/CD Pipeline",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/7KCS70sCoK0",
      videoId: "7KCS70sCoK0",
      desc: "Build CI/CD pipelines with Jenkins. Declarative pipelines, shared libraries, plugins.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.5,
      reviews: 18760,
      tags: ["Jenkins", "CI/CD", "Pipelines"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 175,
      title: "Terraform Infrastructure as Code",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/SLB_c_ayRMo",
      videoId: "SLB_c_ayRMo",
      desc: "Infrastructure as code with Terraform. AWS, Azure, GCP provisioning and management.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 23450,
      tags: ["Terraform", "IaC", "Infrastructure"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 176,
      title: "Monitoring with Prometheus & Grafana",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/h4Sl21AKiDg",
      videoId: "h4Sl21AKiDg",
      desc: "Implement monitoring stack. Metrics collection, visualization, alerting, dashboards.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 15670,
      tags: ["Prometheus", "Grafana", "Monitoring"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },
    {
      id: 177,
      title: "GitOps with ArgoCD",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/MesU2_gGzts",
      videoId: "MesU2_gGzts",
      desc: "Implement GitOps workflows. ArgoCD, Helm, Kustomize, continuous deployment.",
      duration: "5h Course",
      level: "Advanced",
      rating: 4.5,
      reviews: 9870,
      tags: ["GitOps", "ArgoCD", "Continuous Deployment"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 178,
      title: "Ansible Automation",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/1id6ERvfozo",
      videoId: "1id6ERvfozo",
      desc: "Configuration management with Ansible. Playbooks, roles, inventory, vault.",
      duration: "7h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 18760,
      tags: ["Ansible", "Automation", "Configuration Management"],
      difficulty: "Intermediate",
      estimatedTime: "7 hours",
    },
    {
      id: 179,
      title: "ELK Stack for Logging",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/7Z8ZL0oYxOw",
      videoId: "7Z8ZL0oYxOw",
      desc: "Centralized logging with ELK stack. Elasticsearch, Logstash, Kibana, Filebeat.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.5,
      reviews: 12340,
      tags: ["ELK Stack", "Logging", "Elasticsearch"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 180,
      title: "Security in DevOps (DevSecOps)",
      category: "devops",
      type: "docs",
      url: "https://owasp.org/www-project-devsecops-guideline/",
      desc: "Integrate security into DevOps. SAST, DAST, container security, secrets management.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.7,
      reviews: 15670,
      tags: ["DevSecOps", "Security", "DevOps"],
      difficulty: "Advanced",
      estimatedTime: "6 hours",
    },
    {
      id: 181,
      title: "Cloud Architecture Patterns",
      category: "devops",
      type: "docs",
      url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/welcome.html",
      desc: "Cloud-native architecture patterns. Serverless, microservices, event-driven design.",
      duration: "Self-paced",
      level: "Advanced",
      rating: 4.6,
      reviews: 12340,
      tags: ["Cloud Architecture", "Patterns", "Serverless"],
      difficulty: "Advanced",
      estimatedTime: "5 hours",
    },
    {
      id: 182,
      title: "Performance Testing with JMeter",
      category: "devops",
      type: "video",
      url: "https://www.youtube.com/embed/kwTk0Z7I4P0",
      videoId: "kwTk0Z7I4P0",
      desc: "Load testing and performance analysis. JMeter scripts, distributed testing, reporting.",
      duration: "6h Course",
      level: "Intermediate",
      rating: 4.4,
      reviews: 8760,
      tags: ["JMeter", "Performance Testing", "Load Testing"],
      difficulty: "Intermediate",
      estimatedTime: "6 hours",
    },

    // Mobile Development Resources (10)
    {
      id: 183,
      title: "React Native Complete Course",
      category: "mobile",
      type: "video",
      url: "https://www.youtube.com/embed/0-S5a0eXPoc",
      videoId: "0-S5a0eXPoc",
      desc: "Build cross-platform mobile apps with React Native. Navigation, state management, deployment.",
      duration: "12h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 34560,
      featured: true,
      tags: ["React Native", "Mobile", "Cross-platform"],
      difficulty: "Intermediate",
      estimatedTime: "12 hours",
    },
    {
      id: 184,
      title: "Flutter Complete Development",
      category: "mobile",
      type: "video",
      url: "https://www.youtube.com/embed/VPvVD8t02U8",
      videoId: "VPvVD8t02U8",
      desc: "Master Flutter framework. Dart language, widgets, state management, Firebase integration.",
      duration: "15h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 45670,
      tags: ["Flutter", "Dart", "Mobile Development"],
      difficulty: "Intermediate",
      estimatedTime: "15 hours",
    },
    {
      id: 185,
      title: "iOS Development with Swift",
      category: "mobile",
      type: "video",
      url: "https://www.youtube.com/embed/comQ1-x2a1Q",
      videoId: "comQ1-x2a1Q",
      desc: "Build iOS apps with Swift. UIKit, SwiftUI, Core Data, App Store deployment.",
      duration: "20h Course",
      level: "Intermediate",
      rating: 4.8,
      reviews: 56780,
      tags: ["iOS", "Swift", "SwiftUI"],
      difficulty: "Intermediate",
      estimatedTime: "20 hours",
    },
    {
      id: 186,
      title: "Android Development with Kotlin",
      category: "mobile",
      type: "video",
      url: "https://www.youtube.com/embed/FjrKMcnKah8",
      videoId: "FjrKMcnKah8",
      desc: "Modern Android development with Kotlin. Jetpack, MVVM, Room, Retrofit, Compose.",
      duration: "18h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 45670,
      tags: ["Android", "Kotlin", "Jetpack"],
      difficulty: "Intermediate",
      estimatedTime: "18 hours",
    },
    {
      id: 187,
      title: "Ionic Framework for Hybrid Apps",
      category: "mobile",
      type: "video",
      url: "https://www.youtube.com/embed/appcS93vaRg",
      videoId: "appcS93vaRg",
      desc: "Build hybrid mobile apps with Ionic. Angular, Capacitor, Cordova, app stores.",
      duration: "10h Course",
      level: "Intermediate",
      rating: 4.5,
      reviews: 23450,
      tags: ["Ionic", "Hybrid", "Angular"],
      difficulty: "Intermediate",
      estimatedTime: "10 hours",
    },
    {
      id: 188,
      title: "Mobile UI/UX Design Principles",
      category: "mobile",
      type: "video",
      url: "https://www.youtube.com/embed/_LuOqfBqpjU",
      videoId: "_LuOqfBqpjU",
      desc: "Mobile-first design principles. Touch interactions, gestures, responsive layouts.",
      duration: "4h Course",
      level: "Beginner",
      rating: 4.6,
      reviews: 18760,
      tags: ["Mobile UI/UX", "Design", "Touch Interactions"],
      difficulty: "Beginner",
      estimatedTime: "4 hours",
    },
    {
      id: 189,
      title: "Firebase for Mobile Apps",
      category: "mobile",
      type: "video",
      url: "https://www.youtube.com/embed/9kRgVxULbag",
      videoId: "9kRgVxULbag",
      desc: "Backend as a service with Firebase. Authentication, Firestore, Cloud Functions, hosting.",
      duration: "8h Course",
      level: "Intermediate",
      rating: 4.7,
      reviews: 34560,
      tags: ["Firebase", "Mobile", "Backend"],
      difficulty: "Intermediate",
      estimatedTime: "8 hours",
    },
    {
      id: 190,
      title: "Mobile App Testing & QA",
      category: "mobile",
      type: "docs",
      url: "https://developer.android.com/training/testing",
      desc: "Mobile app testing strategies. Unit testing, UI testing, device testing, CI/CD.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.4,
      reviews: 12340,
      tags: ["Mobile Testing", "QA", "CI/CD"],
      difficulty: "Intermediate",
      estimatedTime: "5 hours",
    },
    {
      id: 191,
      title: "App Store Optimization (ASO)",
      category: "mobile",
      type: "docs",
      url: "https://developer.apple.com/app-store/app-store-optimization/",
      desc: "Optimize mobile apps for app stores. Keywords, ratings, reviews, user acquisition.",
      duration: "Self-paced",
      level: "Intermediate",
      rating: 4.5,
      reviews: 15670,
      tags: ["ASO", "App Store", "Marketing"],
      difficulty: "Intermediate",
      estimatedTime: "3 hours",
    },
    {
      id: 192,
      title: "Progressive Web Apps (PWAs)",
      category: "mobile",
      type: "video",
      url: "https://www.youtube.com/embed/5fURH3Y2k5g",
      videoId: "5fURH3Y2k5g",
      desc: "Build installable web apps. Service workers, offline capabilities, push notifications.",
      duration: "5h Course",
      level: "Intermediate",
      rating: 4.6,
      reviews: 23450,
      tags: ["PWA", "Web Apps", "Service Workers"],
      difficulty: "Intermediate",
      estimatedTime: "5 hours",
    },
  ];

  // Helper function to calculate filtered count for a category
  const getFilteredCount = (categoryId) => {
    return resources.filter((r) => {
      const matchesCategory = categoryId === "all" || r.category === categoryId;
      const matchesType = filterType === "all" || r.type === filterType;
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesBookmark = !showBookmarkedOnly || bookmarks.includes(r.id);
      const matchesCompletion =
        !showCompletedOnly || completedResources.includes(r.id);
      return (
        matchesCategory &&
        matchesType &&
        matchesSearch &&
        matchesBookmark &&
        matchesCompletion
      );
    }).length;
  };

  const getCategories = () => [
    {
      id: "all",
      name: "All Resources",
      icon: <Grid3X3 className="w-4 h-4" />,
      count: getFilteredCount("all"),
      color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    },
    {
      id: "python",
      name: "Python",
      icon: <Code2 className="w-4 h-4" />,
      count: getFilteredCount("python"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "javascript",
      name: "JavaScript",
      icon: <Code className="w-4 h-4" />,
      count: getFilteredCount("javascript"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "dsa",
      name: "DSA",
      icon: <Database className="w-4 h-4" />,
      count: getFilteredCount("dsa"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "web",
      name: "Web Dev",
      icon: <Globe className="w-4 h-4" />,
      count: getFilteredCount("web"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "backend",
      name: "Backend",
      icon: <Database className="w-4 h-4" />,
      count: getFilteredCount("backend"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "interview",
      name: "Interview",
      icon: <Briefcase className="w-4 h-4" />,
      count: getFilteredCount("interview"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "career",
      name: "Career",
      icon: <TrendingUp className="w-4 h-4" />,
      count: getFilteredCount("career"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "system-design",
      name: "System Design",
      icon: <Layers className="w-4 h-4" />,
      count: getFilteredCount("system-design"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "ai-ml",
      name: "AI & ML",
      icon: <Brain className="w-4 h-4" />,
      count: getFilteredCount("ai-ml"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "devops",
      name: "DevOps",
      icon: <Zap className="w-4 h-4" />,
      count: getFilteredCount("devops"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "mobile",
      name: "Mobile Dev",
      icon: <Bot className="w-4 h-4" />,
      count: getFilteredCount("mobile"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
  ];

  const categories = getCategories();

  useEffect(() => {
    // Load bookmarks and completed from localStorage
    try {
      const savedBookmarks = localStorage.getItem(resourceBookmarksKey);
      const savedCompleted = localStorage.getItem(completedResourcesKey);

      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      } else {
        const legacyBookmarks = localStorage.getItem("resourceBookmarks");
        if (legacyBookmarks) {
          localStorage.setItem(resourceBookmarksKey, legacyBookmarks);
          localStorage.removeItem("resourceBookmarks");
          setBookmarks(JSON.parse(legacyBookmarks));
        }
      }

      if (savedCompleted) {
        setCompletedResources(JSON.parse(savedCompleted));
      } else {
        const legacyCompleted = localStorage.getItem("completedResources");
        if (legacyCompleted) {
          localStorage.setItem(completedResourcesKey, legacyCompleted);
          localStorage.removeItem("completedResources");
          setCompletedResources(JSON.parse(legacyCompleted));
        }
      }
    } catch (e) {
      // ignore malformed storage
    }
  }, []);

  const toggleBookmark = (id) => {
    const newBookmarks = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    localStorage.setItem(resourceBookmarksKey, JSON.stringify(newBookmarks));
    toast.success(
      bookmarks.includes(id)
        ? t("resources.toasts.removedFromBookmarks", "Removed from bookmarks")
        : t("resources.toasts.addedToBookmarks", "Added to bookmarks")
    );
  };

  const toggleCompleted = (id) => {
    const newCompleted = completedResources.includes(id)
      ? completedResources.filter((c) => c !== id)
      : [...completedResources, id];
    setCompletedResources(newCompleted);
    localStorage.setItem(completedResourcesKey, JSON.stringify(newCompleted));
    toast.success(
      completedResources.includes(id)
        ? t("resources.toasts.markedIncomplete", "Marked as incomplete")
        : t("resources.toasts.markedCompleted", "Marked as completed! 🎉")
    );
  };

  // Handle opening resources based on type
  const handleOpenResource = (resource) => {
    if (resource.internal) {
      window.location.href = resource.url;
      return;
    }

    if (resource.type === "video" && resource.videoId) {
      // Open video in modal
      setVideoModal({
        open: true,
        url: resource.url,
        title: resource.title,
      });
      toast.success(
        `${t("resources.toasts.playing", "Playing")}: ${resource.title}`
      );
    } else if (resource.type === "pdf") {
      // Handle PDF download
      handleDownload(resource);
    } else {
      // Open external link in new tab
      window.open(resource.url, "_blank", "noopener,noreferrer");
      toast.success(
        `${t("resources.toasts.opening", "Opening")}: ${resource.title}`
      );
    }
  };

  // Handle PDF/file downloads
  const handleDownload = async (resource) => {
    setDownloading(resource.id);
    toast.info(
      `${t("resources.toasts.preparingDownload", "Preparing download")}: ${
        resource.title
      }...`
    );

    try {
      // For external PDFs, open in new tab (browsers handle PDF viewing/download)
      window.open(resource.url, "_blank", "noopener,noreferrer");

      // Mark as completed after download
      setTimeout(() => {
        if (!completedResources.includes(resource.id)) {
          toggleCompleted(resource.id);
        }
        toast.success(
          `${t("resources.toasts.downloaded", "Downloaded")}: ${resource.title}`
        );
        setDownloading(null);
      }, 1000);
    } catch (error) {
      toast.error(
        t(
          "resources.toasts.downloadFailedTryAgain",
          "Download failed. Please try again."
        )
      );
      setDownloading(null);
    }
  };

  // Handle watching video
  const handleWatchVideo = (resource) => {
    if (resource.videoId) {
      setVideoModal({
        open: true,
        url: resource.url,
        title: resource.title,
      });
      toast.success(
        `${t("resources.toasts.playing", "Playing")}: ${resource.title}`
      );
    } else if (resource.url && resource.url !== "#") {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      toast.success(
        `${t("resources.toasts.openingVideo", "Opening video")}: ${
          resource.title
        }`
      );
    } else {
      toast.error(
        t("resources.toasts.videoNotAvailable", "Video not available")
      );
    }
  };

  // Share resource
  const handleShare = async (resource) => {
    const shareUrl = resource.internal
      ? `${window.location.origin}${resource.url}`
      : resource.url;

    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.desc,
          url: shareUrl,
        });
        toast.success(
          t("resources.toasts.sharedSuccessfully", "Shared successfully!")
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(
      t("resources.toasts.linkCopied", "Link copied to clipboard!")
    );
  };

  const buildVideoEmbedSrc = (rawUrl) => {
    if (!rawUrl) return "";

    // Convert common YouTube URL formats to an embed URL.
    try {
      const parsed = new URL(rawUrl);

      const buildYoutubeEmbed = (youtubeId) => {
        const base = `https://www.youtube.com/embed/${youtubeId}`;
        const params = new URLSearchParams({
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
          autoplay: "0",
          enablejsapi: "1",
        });
        return `${base}?${params.toString()}`;
      };

      // https://youtu.be/<id>
      if (parsed.hostname === "youtu.be") {
        const youtubeId = parsed.pathname.replace(/^\//, "");
        return buildYoutubeEmbed(youtubeId);
      }

      // https://www.youtube.com/watch?v=<id>
      if (
        parsed.hostname.includes("youtube.com") &&
        parsed.pathname === "/watch"
      ) {
        const youtubeId = parsed.searchParams.get("v");
        if (youtubeId) {
          return buildYoutubeEmbed(youtubeId);
        }
      }

      // Already embed (youtube or nocookie)
      if (parsed.pathname.startsWith("/embed/")) {
        // Keep host as-is and avoid passing `origin` which can trigger
        // YouTube "Video player configuration error" on some deployments.
        const url = new URL(parsed.href);
        url.searchParams.set("rel", "0");
        url.searchParams.set("modestbranding", "1");
        url.searchParams.set("playsinline", "1");
        url.searchParams.delete("origin");
        return url.toString();
      }

      // Non-YouTube video URLs: preserve and append params safely.
      const url = new URL(rawUrl);
      url.searchParams.set("rel", "0");
      url.searchParams.set("modestbranding", "1");
      return url.toString();
    } catch (e) {
      // If it's not a valid URL, fall back.
      return rawUrl;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "docs":
        return <FileText className="w-5 h-5" />;
      case "video":
        return <Youtube className="w-5 h-5" />;
      case "pdf":
        return <FileCode className="w-5 h-5" />;
      case "tool":
        return <Zap className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "docs":
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      case "video":
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      case "pdf":
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      case "tool":
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      default:
        return "bg-zinc-800/50 text-zinc-300 border border-zinc-700/50";
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner":
        return "text-orange-400 font-medium";
      case "Intermediate":
        return "text-orange-400 font-medium";
      case "Advanced":
        return "text-orange-400 font-medium";
      default:
        return "text-slate-400";
    }
  };

  const getCategoryColor = (categoryId, isActive) => {
    if (isActive) return "bg-white text-black font-medium";

    const colors = {
      python:
        "hover:bg-orange-500/10 hover:text-orange-400 border-orange-500/20",
      dsa: "hover:bg-orange-500/10 hover:text-orange-400 border-orange-500/20",
      web: "hover:bg-orange-500/10 hover:text-orange-400 border-orange-500/20",
      interview:
        "hover:bg-orange-500/10 hover:text-orange-400 border-orange-500/20",
      career:
        "hover:bg-orange-500/10 hover:text-orange-400 border-orange-500/20",
      "system-design":
        "hover:bg-orange-500/10 hover:text-orange-400 border-orange-500/20",
      "ai-ml":
        "hover:bg-orange-500/10 hover:text-orange-400 border-orange-500/20",
      all: "hover:bg-zinc-500/10 hover:text-zinc-400 border-zinc-500/20",
    };

    return `text-zinc-400 ${colors[categoryId] || colors.all}`;
  };

  const getFilterColor = (filterId, isActive) => {
    if (isActive) return "bg-zinc-800 text-white";

    const colors = {
      all: "text-zinc-400 hover:bg-zinc-500/10 hover:text-zinc-300",
      video: "text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400",
      docs: "text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400",
      pdf: "text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400",
      tool: "text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400",
      bookmarked: "text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400",
      completed: "text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400",
      featured: "text-zinc-400 hover:bg-orange-500/10 hover:text-orange-400",
    };

    return colors[filterId] || colors.all;
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      activeCategory === "all" || resource.category === activeCategory;
    const matchesType = filterType === "all" || resource.type === filterType;
    const matchesBookmark =
      filterType !== "bookmarked" || bookmarks.includes(resource.id);
    const matchesCompleted =
      filterType !== "completed" || completedResources.includes(resource.id);

    if (filterType === "bookmarked")
      return matchesSearch && matchesCategory && matchesBookmark;
    if (filterType === "completed")
      return matchesSearch && matchesCategory && matchesCompleted;
    return matchesSearch && matchesCategory && matchesType;
  });
  const completionProgress = Math.round(
    (completedResources.length / resources.length) * 100
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl">
              <BookOpen className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {t("resources.title", "Learning Resources")}
                <Sparkles className="w-5 h-5 text-white" />
              </h1>
              <p className="text-zinc-400 text-sm">
                {resources.length}+{" "}
                {t(
                  "resources.subtitleTail",
                  "curated resources to accelerate your learning"
                )}
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="hidden md:block bg-zinc-900 border-zinc-800 w-64">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">
                  {t("resources.progress", "Your Progress")}
                </span>
                <span className="text-sm font-bold text-white">
                  {completedResources.length}/{resources.length}
                </span>
              </div>
              <Progress value={completionProgress} className="h-2" />
              <p className="text-xs text-zinc-500 mt-2">
                {completionProgress}% {t("resources.completed", "completed")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Progress */}
        <Card className="md:hidden bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">
                {t("resources.progress", "Your Progress")}
              </span>
              <span className="text-sm font-bold text-white">
                {completedResources.length}/{resources.length}
              </span>
            </div>
            <Progress value={completionProgress} className="h-2" />
            <p className="text-xs text-zinc-500 mt-2">
              {completionProgress}% {t("resources.completed", "completed")}
            </p>
          </CardContent>
        </Card>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">
                  {t("resources.stats.totalResources", "Total Resources")}
                </p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  {resources.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">
                  {t("resources.stats.completed", "Completed")}
                </p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  {completedResources.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">
                  {t("resources.stats.bookmarked", "Bookmarked")}
                </p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  {bookmarks.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <Card className="bg-zinc-900 border-zinc-800 sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400">
                  {t("resources.categories", "Categories")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setFilterType("all");
                      setShowBookmarkedOnly(false);
                      setShowCompletedOnly(false);
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border ${
                      activeCategory === cat.id
                        ? "bg-white text-black font-medium"
                        : getCategoryColor(cat.id, false)
                    }`}
                  >
                    {cat.icon}
                    <span className="flex-1 text-left">{cat.name}</span>
                    {cat.id !== "all" && (
                      <span
                        className={`text-xs ${
                          activeCategory === cat.id
                            ? "text-zinc-600"
                            : "text-zinc-600"
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mobile Categories */}
            <div className="lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setFilterType("all");
                      setShowBookmarkedOnly(false);
                      setShowCompletedOnly(false);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border whitespace-nowrap flex-shrink-0 ${
                      activeCategory === cat.id
                        ? "bg-white text-black font-medium"
                        : getCategoryColor(cat.id, false)
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  placeholder={t(
                    "resources.searchPlaceholder",
                    "Search resources, topics, tags..."
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg self-start sm:self-auto flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className={
                    viewMode === "grid"
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "text-zinc-400 hover:bg-zinc-800/50"
                  }
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={
                    viewMode === "list"
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "text-zinc-400 hover:bg-zinc-800/50"
                  }
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterType("all");
                  setShowBookmarkedOnly(false);
                  setShowCompletedOnly(false);
                  setActiveCategory("all");
                }}
                className={`${
                  filterType === "all" &&
                  !showBookmarkedOnly &&
                  !showCompletedOnly
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-zinc-400 hover:bg-zinc-800/50"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t("resources.filters.allTypes", "All Types")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterType("video");
                  setShowBookmarkedOnly(false);
                  setShowCompletedOnly(false);
                  setActiveCategory("all");
                }}
                className={`${
                  filterType === "video" &&
                  !showBookmarkedOnly &&
                  !showCompletedOnly
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-zinc-400 hover:bg-zinc-800/50"
                }`}
              >
                <Video className="w-4 h-4 mr-2" />
                {t("resources.filters.videos", "Videos")} (
                {resources.filter((r) => r.type === "video").length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterType("docs");
                  setShowBookmarkedOnly(false);
                  setShowCompletedOnly(false);
                  setActiveCategory("all");
                }}
                className={`${
                  filterType === "docs" &&
                  !showBookmarkedOnly &&
                  !showCompletedOnly
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-zinc-400 hover:bg-zinc-800/50"
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("resources.filters.docs", "Docs")} (
                {resources.filter((r) => r.type === "docs").length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterType("all");
                  setShowBookmarkedOnly(true);
                  setShowCompletedOnly(false);
                  setActiveCategory("all");
                }}
                className={`${
                  showBookmarkedOnly
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-zinc-400 hover:bg-zinc-800/50"
                }`}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {t("resources.filters.bookmarked", "Bookmarked")} (
                {bookmarks.length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterType("all");
                  setShowBookmarkedOnly(false);
                  setShowCompletedOnly(true);
                  setActiveCategory("all");
                }}
                className={`${
                  showCompletedOnly
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-zinc-400 hover:bg-zinc-800/50"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t("resources.filters.completed", "Completed")} (
                {completedResources.length})
              </Button>
            </div>

            {/* Results Count */}
            <p className="text-sm text-zinc-400">
              {t("resources.results.showing", "Showing")}{" "}
              {filteredResources.length}{" "}
              {t("resources.results.resources", "resources")}
              {activeCategory !== "all" && (
                <>
                  {" "}
                  {t("resources.results.in", "in")}{" "}
                  {categories.find((c) => c.id === activeCategory)?.name}
                </>
              )}
            </p>

            {/* Resource Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "space-y-3"
              }
            >
              {filteredResources.map((resource) => (
                <Card
                  key={resource.id}
                  className={`${
                    resource.type === "docs"
                      ? "bg-orange-950/50 border-orange-500/30"
                      : resource.type === "video"
                      ? "bg-orange-950/50 border-orange-500/30"
                      : resource.type === "pdf"
                      ? "bg-orange-950/50 border-orange-500/30"
                      : "bg-orange-950/50 border-orange-500/30"
                  } hover:border-zinc-700 transition-all overflow-hidden ${
                    completedResources.includes(resource.id)
                      ? "border-orange-500/50"
                      : ""
                  }`}
                >
                  <CardContent
                    className={
                      viewMode === "grid"
                        ? "p-4"
                        : "p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                    }
                  >
                    <div
                      className={
                        viewMode === "grid" ? "" : "flex-1 w-full min-w-0"
                      }
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`p-2 rounded-lg ${getTypeColor(
                            resource.type
                          )}`}
                        >
                          {getIcon(resource.type)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-8 w-8 ${
                              bookmarks.includes(resource.id)
                                ? "text-orange-400 hover:text-orange-300 bg-orange-500/10"
                                : "text-zinc-400 hover:text-white"
                            }`}
                            onClick={() => toggleBookmark(resource.id)}
                          >
                            {bookmarks.includes(resource.id) ? (
                              <BookmarkCheck className="w-4 h-4 text-orange-400" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-8 w-8 ${
                              completedResources.includes(resource.id)
                                ? "text-orange-400 hover:text-orange-300 bg-orange-500/10"
                                : "text-zinc-400 hover:text-white"
                            }`}
                            onClick={() => toggleCompleted(resource.id)}
                          >
                            {completedResources.includes(resource.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-orange-400" />
                            ) : (
                              <Target className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-semibold text-white mb-1 line-clamp-1">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                        {resource.desc}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {resource.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              idx % 4 === 0
                                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                : idx % 4 === 1
                                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                : idx % 4 === 2
                                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-zinc-500 mb-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {resource.duration}
                          </span>
                          <span className={getLevelColor(resource.level)}>
                            {resource.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                          <span className="text-orange-300 font-medium">
                            {resource.rating}
                          </span>
                          <span className="hidden sm:inline text-zinc-500">
                            ({resource.reviews.toLocaleString()})
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full gap-2 bg-zinc-800 text-white hover:bg-zinc-700"
                        disabled={downloading === resource.id}
                        onClick={() => {
                          if (resource.type === "pdf") {
                            handleDownload(resource);
                          } else if (resource.type === "video") {
                            handleWatchVideo(resource);
                          } else {
                            handleOpenResource(resource);
                          }
                        }}
                      >
                        {downloading === resource.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Downloading...
                          </>
                        ) : resource.type === "pdf" ? (
                          <>
                            <Download className="w-4 h-4" /> Download
                          </>
                        ) : resource.type === "video" ? (
                          <>
                            <Play className="w-4 h-4" /> Watch Now
                          </>
                        ) : resource.type === "tool" ? (
                          <>
                            <Zap className="w-4 h-4" /> Open Tool
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" /> Open Resource
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400">
                  No resources found matching your criteria
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-zinc-700 text-white hover:bg-zinc-800"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                    setFilterType("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Video Modal */}
      <Dialog
        open={videoModal.open}
        onOpenChange={(open) => setVideoModal({ ...videoModal, open })}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-orange-500" />
                {videoModal.title}
              </DialogTitle>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() =>
                  setVideoModal({ open: false, url: "", title: "" })
                }
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            {videoModal.open && videoModal.url && (
              <iframe
                src={buildVideoEmbedSrc(videoModal.url)}
                title={videoModal.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="origin"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                loading="lazy"
                allowFullScreen
              />
            )}
          </div>
          <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => {
                  const resource = resources.find(
                    (r) => r.title === videoModal.title
                  );
                  if (resource) handleShare(resource);
                }}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => {
                  const resource = resources.find(
                    (r) => r.title === videoModal.title
                  );
                  if (resource) toggleBookmark(resource.id);
                }}
              >
                <Bookmark className="w-4 h-4 mr-1" />
                Bookmark
              </Button>
            </div>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
              onClick={() => {
                const resource = resources.find(
                  (r) => r.title === videoModal.title
                );
                if (resource && !completedResources.includes(resource.id)) {
                  toggleCompleted(resource.id);
                }
                setVideoModal({ open: false, url: "", title: "" });
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourcesPage;
