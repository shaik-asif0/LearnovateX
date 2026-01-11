import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  CheckCircle2,
  Lock,
  Play,
  Clock,
  BookOpen,
  Star,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  List,
  FileText,
  Bookmark,
  BookmarkCheck,
  Download,
  Code,
  Brain,
  Lightbulb,
  GraduationCap,
  ArrowRight,
  Youtube,
  PlayCircle,
  Users,
  ExternalLink,
  ThumbsUp,
  Share2,
  Eye,
  Flame,
  SkipForward,
  SkipBack,
  Search,
  Filter,
  Award,
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  Trophy,
  Gift,
  Settings,
  User,
  Bell,
  MessageSquare,
  Heart,
  Check,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";
const LearningPathPage = () => {
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState({});
  const [bookmarkedLessons, setBookmarkedLessons] = useState([]);
  const [expandedPath, setExpandedPath] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [likedLessons, setLikedLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCourse, setPreviewCourse] = useState(null);
  const playerRef = useRef(null);

  const defaultPaths = [
    {
      id: 1,
      title: "Full Stack Web Development",
      description:
        "Master frontend and backend technologies with hands-on projects",
      category: "Web Development",
      difficulty: "Intermediate",
      duration: "12 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/nu_pCVPKzTk/maxresdefault.jpg",
      instructor: "freeCodeCamp",
      rating: 4.8,
      students: 2500000,
      modules: [
        {
          id: 1,
          name: "HTML5 & Modern CSS",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Semantic HTML", "Flexbox", "CSS Grid", "Animations"],
          lessons: [
            {
              id: 1,
              title: "HTML Full Course - Build a Website",
              duration: "2:02:31",
              youtubeId: "pQN-pnXPaVg",
              completed: false,
              views: "15M",
              likes: "450K",
            },
            {
              id: 2,
              title: "CSS Tutorial - Full Course for Beginners",
              duration: "11:08:00",
              youtubeId: "OXGznpKZ_sA",
              completed: false,
              views: "8.5M",
              likes: "280K",
            },
            {
              id: 3,
              title: "Flexbox CSS In 20 Minutes",
              duration: "20:00",
              youtubeId: "JJSoEo8JSnc",
              completed: false,
              views: "2.1M",
              likes: "65K",
            },
          ],
        },
        {
          id: 2,
          name: "JavaScript ES6+",
          duration: "8 hours",
          completed: false,
          locked: false,
          topics: ["Arrow Functions", "Promises", "Async/Await", "DOM"],
          lessons: [
            {
              id: 1,
              title: "JavaScript Programming Full Course",
              duration: "8:01:24",
              youtubeId: "PkZNo7MFNFg",
              completed: false,
              views: "12M",
              likes: "380K",
            },
            {
              id: 2,
              title: "Async JavaScript Crash Course",
              duration: "25:36",
              youtubeId: "PoRJizFvM7s",
              completed: false,
              views: "1.2M",
              likes: "35K",
            },
          ],
        },
        {
          id: 3,
          name: "React.js Fundamentals",
          duration: "12 hours",
          completed: false,
          locked: false,
          topics: ["Components", "Hooks", "State", "Props"],
          lessons: [
            {
              id: 1,
              title: "React Course - Beginner's Tutorial",
              duration: "11:55:27",
              youtubeId: "bMknfKXIFA8",
              completed: false,
              views: "7.2M",
              likes: "210K",
            },
            {
              id: 2,
              title: "React Hooks Tutorial",
              duration: "1:49:00",
              youtubeId: "TNhaISOUy6Q",
              completed: false,
              views: "1.5M",
              likes: "45K",
            },
          ],
        },
        {
          id: 4,
          name: "Node.js & Express",
          duration: "6 hours",
          completed: false,
          locked: true,
          topics: ["REST APIs", "Middleware", "Authentication"],
          lessons: [
            {
              id: 1,
              title: "Node.js and Express.js Full Course",
              duration: "8:16:48",
              youtubeId: "Oe421EPjeBE",
              completed: false,
              views: "4.8M",
              likes: "145K",
            },
            {
              id: 2,
              title: "Express JS Crash Course",
              duration: "1:15:00",
              youtubeId: "L72fhGm1tfE",
              completed: false,
              views: "1.9M",
              likes: "58K",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      description: "Master DSA for coding interviews at top tech companies",
      category: "Computer Science",
      difficulty: "Advanced",
      duration: "16 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/8hly31xKli0/maxresdefault.jpg",
      instructor: "freeCodeCamp",
      rating: 4.9,
      students: 1800000,
      modules: [
        {
          id: 1,
          name: "Arrays & Hashing",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Two Pointers", "Sliding Window", "Hash Maps"],
          lessons: [
            {
              id: 1,
              title: "Data Structures Easy to Advanced",
              duration: "8:06:00",
              youtubeId: "RBSGKlAvoiM",
              completed: false,
              views: "8.2M",
              likes: "245K",
            },
            {
              id: 2,
              title: "Two Sum - LeetCode Solution",
              duration: "6:17",
              youtubeId: "KLlXCFG5TnA",
              completed: false,
              views: "1.8M",
              likes: "52K",
            },
          ],
        },
        {
          id: 2,
          name: "Trees & Graphs",
          duration: "6 hours",
          completed: false,
          locked: false,
          topics: ["Binary Trees", "BST", "BFS/DFS"],
          lessons: [
            {
              id: 1,
              title: "Binary Tree Algorithms",
              duration: "2:03:00",
              youtubeId: "fAAZixBzIAI",
              completed: false,
              views: "2.1M",
              likes: "65K",
            },
            {
              id: 2,
              title: "Graph Algorithms for Beginners",
              duration: "2:15:00",
              youtubeId: "tWVWeAqZ0WU",
              completed: false,
              views: "1.8M",
              likes: "55K",
            },
          ],
        },
        {
          id: 3,
          name: "Dynamic Programming",
          duration: "8 hours",
          completed: false,
          locked: true,
          topics: ["Memoization", "Tabulation", "Patterns"],
          lessons: [
            {
              id: 1,
              title: "Dynamic Programming Full Course",
              duration: "5:02:00",
              youtubeId: "oBt53YbR9Kk",
              completed: false,
              views: "3.5M",
              likes: "98K",
            },
          ],
        },
      ],
    },
    {
      id: 3,
      title: "Python for Data Science",
      description: "Learn Python, NumPy, Pandas, and Machine Learning",
      category: "Data Science",
      difficulty: "Intermediate",
      duration: "14 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg",
      instructor: "freeCodeCamp",
      rating: 4.7,
      students: 3200000,
      modules: [
        {
          id: 1,
          name: "Python Fundamentals",
          duration: "6 hours",
          completed: false,
          current: true,
          topics: ["Syntax", "Data Types", "Functions", "OOP"],
          lessons: [
            {
              id: 1,
              title: "Python Tutorial - Full Course",
              duration: "4:26:52",
              youtubeId: "rfscVS0vtbw",
              completed: false,
              views: "42M",
              likes: "1.2M",
            },
            {
              id: 2,
              title: "Python OOP Tutorial",
              duration: "1:52:00",
              youtubeId: "JeznW_7DlB0",
              completed: false,
              views: "2.8M",
              likes: "85K",
            },
          ],
        },
        {
          id: 2,
          name: "NumPy & Pandas",
          duration: "4 hours",
          completed: false,
          locked: false,
          topics: ["Arrays", "DataFrames", "Data Analysis"],
          lessons: [
            {
              id: 1,
              title: "NumPy Tutorial for Beginners",
              duration: "1:00:00",
              youtubeId: "QUT1VHiLmmI",
              completed: false,
              views: "1.5M",
              likes: "42K",
            },
            {
              id: 2,
              title: "Data Analysis with Python Pandas",
              duration: "1:00:00",
              youtubeId: "vmEHCJofslg",
              completed: false,
              views: "2.2M",
              likes: "58K",
            },
          ],
        },
        {
          id: 3,
          name: "Machine Learning",
          duration: "10 hours",
          completed: false,
          locked: true,
          topics: ["Supervised", "Unsupervised", "Deep Learning"],
          lessons: [
            {
              id: 1,
              title: "Machine Learning Course for Beginners",
              duration: "9:52:00",
              youtubeId: "NWONeJKn6kc",
              completed: false,
              views: "3.8M",
              likes: "112K",
            },
          ],
        },
      ],
    },
    {
      id: 4,
      title: "Mobile App Development with React Native",
      description: "Build cross-platform mobile apps with React Native",
      category: "Mobile Development",
      difficulty: "Intermediate",
      duration: "10 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/0-S5a0eXPoc/maxresdefault.jpg",
      instructor: "Academind",
      rating: 4.6,
      students: 950000,
      modules: [
        {
          id: 1,
          name: "React Native Basics",
          duration: "3 hours",
          completed: false,
          current: true,
          topics: ["Expo", "Components", "Navigation"],
          lessons: [
            {
              id: 1,
              title: "React Native Tutorial for Beginners",
              duration: "2:30:00",
              youtubeId: "0-S5a0eXPoc",
              completed: false,
              views: "1.8M",
              likes: "52K",
            },
            {
              id: 2,
              title: "React Native Navigation",
              duration: "45:00",
              youtubeId: "HlnxVKh1tOY",
              completed: false,
              views: "850K",
              likes: "28K",
            },
          ],
        },
        {
          id: 2,
          name: "State Management",
          duration: "4 hours",
          completed: false,
          locked: false,
          topics: ["Redux", "Context API", "AsyncStorage"],
          lessons: [
            {
              id: 1,
              title: "Redux in React Native",
              duration: "1:20:00",
              youtubeId: "9HGS3q_X5KM",
              completed: false,
              views: "650K",
              likes: "22K",
            },
          ],
        },
        {
          id: 3,
          name: "Native Features",
          duration: "5 hours",
          completed: false,
          locked: true,
          topics: ["Camera", "Location", "Push Notifications"],
          lessons: [
            {
              id: 1,
              title: "React Native Camera",
              duration: "35:00",
              youtubeId: "u2Il-VlKv1Y",
              completed: false,
              views: "420K",
              likes: "15K",
            },
          ],
        },
      ],
    },
    {
      id: 5,
      title: "DevOps & Cloud Computing",
      description: "Master Docker, Kubernetes, AWS, and CI/CD pipelines",
      category: "DevOps",
      difficulty: "Advanced",
      duration: "18 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/3c-iBn73dDE/maxresdefault.jpg",
      instructor: "TechWorld with Nana",
      rating: 4.8,
      students: 1200000,
      modules: [
        {
          id: 1,
          name: "Docker Fundamentals",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Containers", "Images", "Docker Compose"],
          lessons: [
            {
              id: 1,
              title: "Docker Tutorial for Beginners",
              duration: "2:15:00",
              youtubeId: "3c-iBn73dDE",
              completed: false,
              views: "3.2M",
              likes: "95K",
            },
            {
              id: 2,
              title: "Docker Compose Tutorial",
              duration: "25:00",
              youtubeId: "Q5ySGJlXY4c",
              completed: false,
              views: "1.1M",
              likes: "38K",
            },
          ],
        },
        {
          id: 2,
          name: "Kubernetes",
          duration: "8 hours",
          completed: false,
          locked: false,
          topics: ["Pods", "Services", "Deployments"],
          lessons: [
            {
              id: 1,
              title: "Kubernetes Tutorial for Beginners",
              duration: "3:45:00",
              youtubeId: "pPQKAR1pA9U",
              completed: false,
              views: "2.8M",
              likes: "82K",
            },
          ],
        },
        {
          id: 3,
          name: "AWS Cloud",
          duration: "10 hours",
          completed: false,
          locked: true,
          topics: ["EC2", "S3", "Lambda"],
          lessons: [
            {
              id: 1,
              title: "AWS Tutorial for Beginners",
              duration: "4:20:00",
              youtubeId: "ulprqHHWlng",
              completed: false,
              views: "1.9M",
              likes: "58K",
            },
          ],
        },
      ],
    },
    {
      id: 6,
      title: "Cybersecurity Fundamentals",
      description: "Learn ethical hacking, network security, and cryptography",
      category: "Cybersecurity",
      difficulty: "Intermediate",
      duration: "15 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/U_P23SqJaDc/maxresdefault.jpg",
      instructor: "NetworkChuck",
      rating: 4.7,
      students: 850000,
      modules: [
        {
          id: 1,
          name: "Network Security",
          duration: "5 hours",
          completed: false,
          current: true,
          topics: ["TCP/IP", "Firewalls", "VPN"],
          lessons: [
            {
              id: 1,
              title: "Network Fundamentals",
              duration: "2:10:00",
              youtubeId: "U_P23SqJaDc",
              completed: false,
              views: "1.5M",
              likes: "45K",
            },
            {
              id: 2,
              title: "Firewall Tutorial",
              duration: "30:00",
              youtubeId: "qX6ZvLxZ7T8",
              completed: false,
              views: "720K",
              likes: "25K",
            },
          ],
        },
        {
          id: 2,
          name: "Ethical Hacking",
          duration: "6 hours",
          completed: false,
          locked: false,
          topics: ["Penetration Testing", "Tools", "Vulnerabilities"],
          lessons: [
            {
              id: 1,
              title: "Ethical Hacking Tutorial",
              duration: "3:15:00",
              youtubeId: "3FNYvj2U0HM",
              completed: false,
              views: "2.1M",
              likes: "68K",
            },
          ],
        },
        {
          id: 3,
          name: "Cryptography",
          duration: "4 hours",
          completed: false,
          locked: true,
          topics: ["Encryption", "Hashing", "Digital Signatures"],
          lessons: [
            {
              id: 1,
              title: "Cryptography Explained",
              duration: "1:45:00",
              youtubeId: "YocavoQ9ayA",
              completed: false,
              views: "950K",
              likes: "32K",
            },
          ],
        },
      ],
    },
    {
      id: 7,
      title: "UI/UX Design with Figma",
      description: "Master user interface and experience design principles",
      category: "Design",
      difficulty: "Beginner",
      duration: "8 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/FTFaQWZBqQ8/maxresdefault.jpg",
      instructor: "The Futur",
      rating: 4.5,
      students: 650000,
      modules: [
        {
          id: 1,
          name: "Design Fundamentals",
          duration: "3 hours",
          completed: false,
          current: true,
          topics: ["Color Theory", "Typography", "Layout"],
          lessons: [
            {
              id: 1,
              title: "UI/UX Design Tutorial",
              duration: "2:05:00",
              youtubeId: "FTFaQWZBqQ8",
              completed: false,
              views: "1.2M",
              likes: "38K",
            },
            {
              id: 2,
              title: "Color Theory for Designers",
              duration: "25:00",
              youtubeId: "dQWnGtDLdig",
              completed: false,
              views: "580K",
              likes: "18K",
            },
          ],
        },
        {
          id: 2,
          name: "Figma Tools",
          duration: "4 hours",
          completed: false,
          locked: false,
          topics: ["Components", "Prototyping", "Auto Layout"],
          lessons: [
            {
              id: 1,
              title: "Figma Tutorial for Beginners",
              duration: "1:50:00",
              youtubeId: "FTFaQWZBqQ8",
              completed: false,
              views: "2.5M",
              likes: "75K",
            },
          ],
        },
        {
          id: 3,
          name: "Design Systems",
          duration: "3 hours",
          completed: false,
          locked: true,
          topics: ["Component Libraries", "Style Guides"],
          lessons: [
            {
              id: 1,
              title: "Creating Design Systems",
              duration: "45:00",
              youtubeId: "hcNkAmOcltE",
              completed: false,
              views: "320K",
              likes: "12K",
            },
          ],
        },
      ],
    },
    {
      id: 8,
      title: "Blockchain Development",
      description:
        "Build decentralized applications with Ethereum and Solidity",
      category: "Blockchain",
      difficulty: "Advanced",
      duration: "12 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/M576WGiDBdQ/maxresdefault.jpg",
      instructor: "Dapp University",
      rating: 4.4,
      students: 420000,
      modules: [
        {
          id: 1,
          name: "Blockchain Basics",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Cryptography", "Consensus", "Smart Contracts"],
          lessons: [
            {
              id: 1,
              title: "Blockchain Tutorial",
              duration: "2:30:00",
              youtubeId: "M576WGiDBdQ",
              completed: false,
              views: "1.8M",
              likes: "55K",
            },
            {
              id: 2,
              title: "Cryptocurrency Explained",
              duration: "20:00",
              youtubeId: "1YyAzVmP9xQ",
              completed: false,
              views: "3.2M",
              likes: "95K",
            },
          ],
        },
        {
          id: 2,
          name: "Solidity Programming",
          duration: "6 hours",
          completed: false,
          locked: false,
          topics: ["Smart Contracts", "Web3.js", "Truffle"],
          lessons: [
            {
              id: 1,
              title: "Solidity Tutorial",
              duration: "3:10:00",
              youtubeId: "ipwxYa-F3uI",
              completed: false,
              views: "950K",
              likes: "28K",
            },
          ],
        },
        {
          id: 3,
          name: "DApp Development",
          duration: "5 hours",
          completed: false,
          locked: true,
          topics: ["Frontend Integration", "Testing", "Deployment"],
          lessons: [
            {
              id: 1,
              title: "Build a DApp",
              duration: "2:45:00",
              youtubeId: "coQ5dg8wM2o",
              completed: false,
              views: "680K",
              likes: "22K",
            },
          ],
        },
      ],
    },
    {
      id: 9,
      title: "Game Development with Unity",
      description: "Create 2D and 3D games using Unity and C#",
      category: "Game Development",
      difficulty: "Intermediate",
      duration: "16 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/gB1F9G0JXOo/maxresdefault.jpg",
      instructor: "Brackeys",
      rating: 4.6,
      students: 780000,
      modules: [
        {
          id: 1,
          name: "Unity Basics",
          duration: "5 hours",
          completed: false,
          current: true,
          topics: ["Scenes", "GameObjects", "Components"],
          lessons: [
            {
              id: 1,
              title: "Unity Tutorial for Beginners",
              duration: "2:50:00",
              youtubeId: "gB1F9G0JXOo",
              completed: false,
              views: "2.1M",
              likes: "65K",
            },
            {
              id: 2,
              title: "Unity C# Scripting",
              duration: "1:15:00",
              youtubeId: "4Z2kZw8V8zM",
              completed: false,
              views: "1.4M",
              likes: "42K",
            },
          ],
        },
        {
          id: 2,
          name: "2D Game Development",
          duration: "6 hours",
          completed: false,
          locked: false,
          topics: ["Sprites", "Physics", "Animation"],
          lessons: [
            {
              id: 1,
              title: "2D Platformer Tutorial",
              duration: "3:20:00",
              youtubeId: "qqOAzn05fvk",
              completed: false,
              views: "1.8M",
              likes: "55K",
            },
          ],
        },
        {
          id: 3,
          name: "3D Game Development",
          duration: "8 hours",
          completed: false,
          locked: true,
          topics: ["3D Models", "Lighting", "Shaders"],
          lessons: [
            {
              id: 1,
              title: "3D Game Development",
              duration: "4:10:00",
              youtubeId: "6eV6WnX1Rrg",
              completed: false,
              views: "950K",
              likes: "32K",
            },
          ],
        },
      ],
    },
    {
      id: 10,
      title: "Machine Learning with Python",
      description:
        "Comprehensive ML course covering algorithms, deep learning, and practical applications",
      category: "AI/ML",
      difficulty: "Advanced",
      duration: "20 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/N9fDIAflCMY/maxresdefault.jpg",
      instructor: "Andrew Ng & Stanford",
      rating: 4.9,
      students: 3200000,
      modules: [
        {
          id: 1,
          name: "Supervised Learning",
          duration: "6 hours",
          completed: false,
          current: true,
          topics: [
            "Linear Regression",
            "Logistic Regression",
            "Neural Networks",
          ],
          lessons: [
            {
              id: 1,
              title: "Machine Learning Course",
              duration: "11:00:00",
              youtubeId: "N9fDIAflCMY",
              completed: false,
              views: "8.5M",
              likes: "245K",
            },
            {
              id: 2,
              title: "Neural Networks Explained",
              duration: "1:30:00",
              youtubeId: "bfmFfD2RIcg",
              completed: false,
              views: "2.1M",
              likes: "68K",
            },
          ],
        },
        {
          id: 2,
          name: "Deep Learning",
          duration: "8 hours",
          completed: false,
          locked: false,
          topics: ["CNN", "RNN", "Transformers"],
          lessons: [
            {
              id: 1,
              title: "Deep Learning Specialization",
              duration: "15:00:00",
              youtubeId: "0bMe_vCZo30",
              completed: false,
              views: "3.8M",
              likes: "112K",
            },
          ],
        },
        {
          id: 3,
          name: "Computer Vision",
          duration: "6 hours",
          completed: false,
          locked: true,
          topics: ["Image Processing", "Object Detection", "GANs"],
          lessons: [
            {
              id: 1,
              title: "Computer Vision Course",
              duration: "8:00:00",
              youtubeId: "ia70tWFZhTk",
              completed: false,
              views: "1.9M",
              likes: "58K",
            },
          ],
        },
      ],
    },
    {
      id: 11,
      title: "iOS Development with Swift",
      description:
        "Build native iOS apps using Swift and Apple's latest frameworks",
      category: "Mobile Development",
      difficulty: "Intermediate",
      duration: "14 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/comQ1-x2a1Q/maxresdefault.jpg",
      instructor: "CodeWithChris",
      rating: 4.7,
      students: 650000,
      modules: [
        {
          id: 1,
          name: "Swift Fundamentals",
          duration: "5 hours",
          completed: false,
          current: true,
          topics: ["Swift Syntax", "Optionals", "Classes & Structs"],
          lessons: [
            {
              id: 1,
              title: "Swift Tutorial for Beginners",
              duration: "3:20:00",
              youtubeId: "comQ1-x2a1Q",
              completed: false,
              views: "1.8M",
              likes: "52K",
            },
            {
              id: 2,
              title: "SwiftUI Tutorial",
              duration: "2:15:00",
              youtubeId: "n5X_V81OYnQ",
              completed: false,
              views: "950K",
              likes: "32K",
            },
          ],
        },
        {
          id: 2,
          name: "UI/UX Design",
          duration: "4 hours",
          completed: false,
          locked: false,
          topics: ["Storyboards", "Auto Layout", "Custom UI"],
          lessons: [
            {
              id: 1,
              title: "iOS UI Design",
              duration: "1:45:00",
              youtubeId: "F2ojC6TNwws",
              completed: false,
              views: "720K",
              likes: "25K",
            },
          ],
        },
        {
          id: 3,
          name: "Advanced iOS",
          duration: "7 hours",
          completed: false,
          locked: true,
          topics: ["Core Data", "Networking", "Push Notifications"],
          lessons: [
            {
              id: 1,
              title: "Advanced iOS Development",
              duration: "4:10:00",
              youtubeId: "8XbgIYVH6Ns",
              completed: false,
              views: "580K",
              likes: "22K",
            },
          ],
        },
      ],
    },
    {
      id: 12,
      title: "Cloud Architecture & AWS",
      description:
        "Design scalable cloud solutions using AWS services and best practices",
      category: "Cloud Computing",
      difficulty: "Advanced",
      duration: "18 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/Ia-UEYYR44s/maxresdefault.jpg",
      instructor: "AWS & A Cloud Guru",
      rating: 4.8,
      students: 950000,
      modules: [
        {
          id: 1,
          name: "AWS Fundamentals",
          duration: "6 hours",
          completed: false,
          current: true,
          topics: ["EC2", "S3", "IAM", "VPC"],
          lessons: [
            {
              id: 1,
              title: "AWS Certified Solutions Architect",
              duration: "8:00:00",
              youtubeId: "Ia-UEYYR44s",
              completed: false,
              views: "2.5M",
              likes: "78K",
            },
            {
              id: 2,
              title: "AWS EC2 Tutorial",
              duration: "1:20:00",
              youtubeId: "6E5s8H7ZGJg",
              completed: false,
              views: "1.2M",
              likes: "38K",
            },
          ],
        },
        {
          id: 2,
          name: "Serverless Computing",
          duration: "5 hours",
          completed: false,
          locked: false,
          topics: ["Lambda", "API Gateway", "DynamoDB"],
          lessons: [
            {
              id: 1,
              title: "AWS Lambda Tutorial",
              duration: "2:30:00",
              youtubeId: "eobbpPVYz_Q",
              completed: false,
              views: "850K",
              likes: "28K",
            },
          ],
        },
        {
          id: 3,
          name: "DevOps on AWS",
          duration: "9 hours",
          completed: false,
          locked: true,
          topics: ["CloudFormation", "CodePipeline", "Elastic Beanstalk"],
          lessons: [
            {
              id: 1,
              title: "AWS DevOps Tutorial",
              duration: "5:15:00",
              youtubeId: "d_jFdCgI9dg",
              completed: false,
              views: "680K",
              likes: "24K",
            },
          ],
        },
      ],
    },
    {
      id: 13,
      title: "Data Science with R",
      description:
        "Master data analysis, visualization, and statistical modeling with R",
      category: "Data Science",
      difficulty: "Intermediate",
      duration: "16 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/_V8eKsto3Ug/maxresdefault.jpg",
      instructor: "DataCamp",
      rating: 4.6,
      students: 580000,
      modules: [
        {
          id: 1,
          name: "R Programming Basics",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["R Syntax", "Data Types", "Functions"],
          lessons: [
            {
              id: 1,
              title: "R Programming Tutorial",
              duration: "2:45:00",
              youtubeId: "_V8eKsto3Ug",
              completed: false,
              views: "1.5M",
              likes: "45K",
            },
            {
              id: 2,
              title: "R for Data Science",
              duration: "1:30:00",
              youtubeId: "8JJ101D3knE",
              completed: false,
              views: "920K",
              likes: "32K",
            },
          ],
        },
        {
          id: 2,
          name: "Data Visualization",
          duration: "5 hours",
          completed: false,
          locked: false,
          topics: ["ggplot2", "Plotly", "Shiny"],
          lessons: [
            {
              id: 1,
              title: "ggplot2 Tutorial",
              duration: "2:10:00",
              youtubeId: "0m4yyhgZwEI",
              completed: false,
              views: "780K",
              likes: "26K",
            },
          ],
        },
        {
          id: 3,
          name: "Statistical Analysis",
          duration: "7 hours",
          completed: false,
          locked: true,
          topics: ["Hypothesis Testing", "Regression", "Time Series"],
          lessons: [
            {
              id: 1,
              title: "Statistics with R",
              duration: "3:45:00",
              youtubeId: "ANMuuq502rE",
              completed: false,
              views: "650K",
              likes: "22K",
            },
          ],
        },
      ],
    },
    {
      id: 14,
      title: "Cybersecurity for Beginners",
      description:
        "Learn fundamental cybersecurity concepts and practical defense techniques",
      category: "Cybersecurity",
      difficulty: "Beginner",
      duration: "10 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/inWWhr5tnEA/maxresdefault.jpg",
      instructor: "Cybrary",
      rating: 4.5,
      students: 420000,
      modules: [
        {
          id: 1,
          name: "Security Fundamentals",
          duration: "3 hours",
          completed: false,
          current: true,
          topics: ["CIA Triad", "Risk Management", "Compliance"],
          lessons: [
            {
              id: 1,
              title: "Cybersecurity Fundamentals",
              duration: "2:00:00",
              youtubeId: "inWWhr5tnEA",
              completed: false,
              views: "1.2M",
              likes: "38K",
            },
            {
              id: 2,
              title: "Network Security Basics",
              duration: "1:15:00",
              youtubeId: "3V8fYYP8F2k",
              completed: false,
              views: "680K",
              likes: "24K",
            },
          ],
        },
        {
          id: 2,
          name: "Ethical Hacking",
          duration: "4 hours",
          completed: false,
          locked: false,
          topics: ["Footprinting", "Scanning", "Enumeration"],
          lessons: [
            {
              id: 1,
              title: "Ethical Hacking Tutorial",
              duration: "2:30:00",
              youtubeId: "3FNYvj2U0HM",
              completed: false,
              views: "950K",
              likes: "32K",
            },
          ],
        },
        {
          id: 3,
          name: "Defense Strategies",
          duration: "3 hours",
          completed: false,
          locked: true,
          topics: ["Firewalls", "Encryption", "Incident Response"],
          lessons: [
            {
              id: 1,
              title: "Cyber Defense Techniques",
              duration: "1:45:00",
              youtubeId: "qgzsn6m6zxI",
              completed: false,
              views: "520K",
              likes: "18K",
            },
          ],
        },
      ],
    },
    {
      id: 15,
      title: "Flutter Mobile Development",
      description: "Build beautiful cross-platform apps with Flutter and Dart",
      category: "Mobile Development",
      difficulty: "Intermediate",
      duration: "12 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/VPvVD8t02U8/maxresdefault.jpg",
      instructor: "The Net Ninja",
      rating: 4.7,
      students: 720000,
      modules: [
        {
          id: 1,
          name: "Dart Programming",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Dart Syntax", "OOP", "Async Programming"],
          lessons: [
            {
              id: 1,
              title: "Flutter Tutorial for Beginners",
              duration: "3:15:00",
              youtubeId: "VPvVD8t02U8",
              completed: false,
              views: "2.1M",
              likes: "68K",
            },
            {
              id: 2,
              title: "Dart Programming Tutorial",
              duration: "1:30:00",
              youtubeId: "5rtujDjt50I",
              completed: false,
              views: "850K",
              likes: "28K",
            },
          ],
        },
        {
          id: 2,
          name: "Flutter Widgets",
          duration: "5 hours",
          completed: false,
          locked: false,
          topics: ["Material Design", "Cupertino", "Custom Widgets"],
          lessons: [
            {
              id: 1,
              title: "Flutter Widgets Tutorial",
              duration: "2:45:00",
              youtubeId: "lpd5dt6XzxE",
              completed: false,
              views: "1.2M",
              likes: "42K",
            },
          ],
        },
        {
          id: 3,
          name: "App Deployment",
          duration: "5 hours",
          completed: false,
          locked: true,
          topics: ["Firebase", "App Store", "Play Store"],
          lessons: [
            {
              id: 1,
              title: "Flutter App Deployment",
              duration: "2:20:00",
              youtubeId: "7dAt-JMSCVQ",
              completed: false,
              views: "680K",
              likes: "24K",
            },
          ],
        },
      ],
    },
    {
      id: 16,
      title: "GraphQL API Development",
      description: "Master GraphQL for building efficient and flexible APIs",
      category: "Web Development",
      difficulty: "Intermediate",
      duration: "8 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/ed8SzALpx1Q/maxresdefault.jpg",
      instructor: "Academind",
      rating: 4.6,
      students: 380000,
      modules: [
        {
          id: 1,
          name: "GraphQL Basics",
          duration: "3 hours",
          completed: false,
          current: true,
          topics: ["Queries", "Mutations", "Subscriptions"],
          lessons: [
            {
              id: 1,
              title: "GraphQL Tutorial",
              duration: "2:10:00",
              youtubeId: "ed8SzALpx1Q",
              completed: false,
              views: "1.1M",
              likes: "35K",
            },
            {
              id: 2,
              title: "GraphQL vs REST",
              duration: "25:00",
              youtubeId: "RBxyszTlBSY",
              completed: false,
              views: "580K",
              likes: "22K",
            },
          ],
        },
        {
          id: 2,
          name: "Apollo Server",
          duration: "3 hours",
          completed: false,
          locked: false,
          topics: ["Schema", "Resolvers", "Data Sources"],
          lessons: [
            {
              id: 1,
              title: "Apollo Server Tutorial",
              duration: "1:45:00",
              youtubeId: "PHabPhgRUuU",
              completed: false,
              views: "420K",
              likes: "16K",
            },
          ],
        },
        {
          id: 3,
          name: "Client Integration",
          duration: "4 hours",
          completed: false,
          locked: true,
          topics: ["Apollo Client", "React Integration", "Caching"],
          lessons: [
            {
              id: 1,
              title: "Apollo Client Tutorial",
              duration: "2:30:00",
              youtubeId: "59HBoEC8ozQ",
              completed: false,
              views: "380K",
              likes: "14K",
            },
          ],
        },
      ],
    },
    {
      id: 17,
      title: "TypeScript Mastery",
      description:
        "Advanced TypeScript concepts for enterprise-level development",
      category: "Web Development",
      difficulty: "Advanced",
      duration: "10 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/BwuLxPH8IDs/maxresdefault.jpg",
      instructor: "Academind",
      rating: 4.8,
      students: 520000,
      modules: [
        {
          id: 1,
          name: "TypeScript Fundamentals",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Types", "Interfaces", "Generics"],
          lessons: [
            {
              id: 1,
              title: "TypeScript Tutorial",
              duration: "2:45:00",
              youtubeId: "BwuLxPH8IDs",
              completed: false,
              views: "1.8M",
              likes: "58K",
            },
            {
              id: 2,
              title: "Advanced TypeScript",
              duration: "1:50:00",
              youtubeId: "30LWjhZzgIQ",
              completed: false,
              views: "720K",
              likes: "26K",
            },
          ],
        },
        {
          id: 2,
          name: "TypeScript with React",
          duration: "3 hours",
          completed: false,
          locked: false,
          topics: ["React Types", "Hooks", "Component Props"],
          lessons: [
            {
              id: 1,
              title: "React TypeScript Tutorial",
              duration: "2:15:00",
              youtubeId: "TPACABQTHvM",
              completed: false,
              views: "950K",
              likes: "32K",
            },
          ],
        },
        {
          id: 3,
          name: "Enterprise Patterns",
          duration: "5 hours",
          completed: false,
          locked: true,
          topics: ["Design Patterns", "Testing", "Build Tools"],
          lessons: [
            {
              id: 1,
              title: "TypeScript Best Practices",
              duration: "3:00:00",
              youtubeId: "0THcUEBiVCQ",
              completed: false,
              views: "580K",
              likes: "20K",
            },
          ],
        },
      ],
    },
    {
      id: 18,
      title: "Docker & Containerization",
      description:
        "Master containerization with Docker and orchestration tools",
      category: "DevOps",
      difficulty: "Intermediate",
      duration: "9 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/3c-iBn73dDE/maxresdefault.jpg",
      instructor: "TechWorld with Nana",
      rating: 4.7,
      students: 680000,
      modules: [
        {
          id: 1,
          name: "Docker Basics",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Images", "Containers", "Dockerfile"],
          lessons: [
            {
              id: 1,
              title: "Docker Tutorial",
              duration: "2:30:00",
              youtubeId: "3c-iBn73dDE",
              completed: false,
              views: "3.2M",
              likes: "95K",
            },
            {
              id: 2,
              title: "Docker Compose",
              duration: "1:15:00",
              youtubeId: "Q5ySGJlXY4c",
              completed: false,
              views: "1.1M",
              likes: "38K",
            },
          ],
        },
        {
          id: 2,
          name: "Multi-Container Apps",
          duration: "3 hours",
          completed: false,
          locked: false,
          topics: ["Docker Networks", "Volumes", "Swarm"],
          lessons: [
            {
              id: 1,
              title: "Docker Swarm Tutorial",
              duration: "1:45:00",
              youtubeId: "pLKxwNfI9OA",
              completed: false,
              views: "420K",
              likes: "16K",
            },
          ],
        },
        {
          id: 3,
          name: "CI/CD with Docker",
          duration: "4 hours",
          completed: false,
          locked: true,
          topics: ["GitHub Actions", "Jenkins", "Kubernetes"],
          lessons: [
            {
              id: 1,
              title: "Docker CI/CD",
              duration: "2:20:00",
              youtubeId: "1XaLZHl4Vcg",
              completed: false,
              views: "380K",
              likes: "14K",
            },
          ],
        },
      ],
    },
    {
      id: 19,
      title: "Natural Language Processing",
      description: "Build intelligent applications with NLP and text analysis",
      category: "AI/ML",
      difficulty: "Advanced",
      duration: "14 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/8S3qHHZQZHQ/maxresdefault.jpg",
      instructor: "DeepLearning.AI",
      rating: 4.6,
      students: 290000,
      modules: [
        {
          id: 1,
          name: "Text Processing",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Tokenization", "Stemming", "TF-IDF"],
          lessons: [
            {
              id: 1,
              title: "NLP with Python",
              duration: "2:50:00",
              youtubeId: "8S3qHHZQZHQ",
              completed: false,
              views: "1.5M",
              likes: "48K",
            },
            {
              id: 2,
              title: "Text Preprocessing",
              duration: "1:20:00",
              youtubeId: "6C0sLtw5ctc",
              completed: false,
              views: "680K",
              likes: "24K",
            },
          ],
        },
        {
          id: 2,
          name: "Sentiment Analysis",
          duration: "5 hours",
          completed: false,
          locked: false,
          topics: ["Classification", "BERT", "Transformers"],
          lessons: [
            {
              id: 1,
              title: "Sentiment Analysis Tutorial",
              duration: "3:10:00",
              youtubeId: "dzqEn98XCOI",
              completed: false,
              views: "920K",
              likes: "32K",
            },
          ],
        },
        {
          id: 3,
          name: "Chatbots & Dialogue",
          duration: "6 hours",
          completed: false,
          locked: true,
          topics: ["Rasa", "Dialogflow", "Sequence Models"],
          lessons: [
            {
              id: 1,
              title: "Build a Chatbot",
              duration: "3:45:00",
              youtubeId: "nla0Q0aUy8w",
              completed: false,
              views: "580K",
              likes: "22K",
            },
          ],
        },
      ],
    },
    {
      id: 20,
      title: "Quantum Computing Fundamentals",
      description:
        "Explore the future of computing with quantum algorithms and Qiskit",
      category: "Emerging Tech",
      difficulty: "Advanced",
      duration: "12 weeks",
      progress: 0,
      thumbnail: "https://img.youtube.com/vi/JhHMJCUmq28/maxresdefault.jpg",
      instructor: "IBM Quantum",
      rating: 4.4,
      students: 180000,
      modules: [
        {
          id: 1,
          name: "Quantum Basics",
          duration: "4 hours",
          completed: false,
          current: true,
          topics: ["Qubits", "Superposition", "Entanglement"],
          lessons: [
            {
              id: 1,
              title: "Quantum Computing for Everyone",
              duration: "2:30:00",
              youtubeId: "JhHMJCUmq28",
              completed: false,
              views: "850K",
              likes: "28K",
            },
            {
              id: 2,
              title: "Quantum Gates",
              duration: "1:45:00",
              youtubeId: "4JA9m2kDsR0",
              completed: false,
              views: "420K",
              likes: "16K",
            },
          ],
        },
        {
          id: 2,
          name: "Qiskit Programming",
          duration: "5 hours",
          completed: false,
          locked: false,
          topics: ["Quantum Circuits", "Algorithms", "Simulation"],
          lessons: [
            {
              id: 1,
              title: "Qiskit Tutorial",
              duration: "3:15:00",
              youtubeId: "V2sWu2KT7wM",
              completed: false,
              views: "380K",
              likes: "14K",
            },
          ],
        },
        {
          id: 3,
          name: "Quantum Algorithms",
          duration: "6 hours",
          completed: false,
          locked: true,
          topics: ["Shor's Algorithm", "Grover's Algorithm", "Applications"],
          lessons: [
            {
              id: 1,
              title: "Quantum Algorithms Explained",
              duration: "3:30:00",
              youtubeId: "9z6iO4oL7x8",
              completed: false,
              views: "320K",
              likes: "12K",
            },
          ],
        },
      ],
    },
  ];
  useEffect(() => {
    loadProgress();
    const savedNotesData = localStorage.getItem("lessonNotes");
    const savedBookmarks = localStorage.getItem("bookmarkedLessons");
    const savedHistory = localStorage.getItem("watchHistory");
    const savedLikes = localStorage.getItem("likedLessons");
    if (savedNotesData) setSavedNotes(JSON.parse(savedNotesData));
    if (savedBookmarks) setBookmarkedLessons(JSON.parse(savedBookmarks));
    if (savedHistory) setWatchHistory(JSON.parse(savedHistory));
    if (savedLikes) setLikedLessons(JSON.parse(savedLikes));
  }, []);
  const loadProgress = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/learning/progress");
      if (response.data && response.data.paths) {
        setLearningPaths(response.data.paths);
      } else {
        setLearningPaths(defaultPaths);
      }
    } catch (error) {
      setLearningPaths(defaultPaths);
    } finally {
      setLoading(false);
    }
  };
  const openLessonPlayer = (path, module, lesson) => {
    if (module.locked) {
      toast.error("Complete previous modules to unlock this content");
      return;
    }
    setCurrentPath(path);
    setCurrentLesson({
      ...lesson,
      moduleId: module.id,
      moduleName: module.name,
    });
    setIsPlayerOpen(true);
    setNotes(savedNotes[`${path.id}-${module.id}-${lesson.id}`] || "");
    setExpandedPath(module.id);
    const historyItem = {
      pathId: path.id,
      pathTitle: path.title,
      moduleId: module.id,
      moduleName: module.name,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      youtubeId: lesson.youtubeId,
      timestamp: new Date().toISOString(),
    };
    const newHistory = [
      historyItem,
      ...watchHistory.filter(
        (h) =>
          !(
            h.pathId === path.id &&
            h.moduleId === module.id &&
            h.lessonId === lesson.id
          )
      ),
    ].slice(0, 20);
    setWatchHistory(newHistory);
    localStorage.setItem("watchHistory", JSON.stringify(newHistory));
  };
  const closePlayer = () => {
    setIsPlayerOpen(false);
    setCurrentLesson(null);
    setCurrentPath(null);
  };
  const markLessonComplete = (pathId, moduleId, lessonId) => {
    const updatedPaths = learningPaths.map((p) => {
      if (p.id !== pathId) return p;
      const updatedModules = p.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const updatedLessons = m.lessons.map((l) =>
          l.id === lessonId ? { ...l, completed: true } : l
        );
        return {
          ...m,
          lessons: updatedLessons,
          completed: updatedLessons.every((l) => l.completed),
        };
      });
      const totalLessons = updatedModules.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );
      const completedCount = updatedModules.reduce(
        (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
        0
      );
      return {
        ...p,
        modules: updatedModules,
        progress: Math.round((completedCount / totalLessons) * 100),
      };
    });
    setLearningPaths(updatedPaths);
    toast.success("Lesson completed! 🎉");
  };
  const toggleBookmark = (pathId, moduleId, lessonId) => {
    const key = `${pathId}-${moduleId}-${lessonId}`;
    const newBookmarks = bookmarkedLessons.includes(key)
      ? bookmarkedLessons.filter((b) => b !== key)
      : [...bookmarkedLessons, key];
    setBookmarkedLessons(newBookmarks);
    localStorage.setItem("bookmarkedLessons", JSON.stringify(newBookmarks));
    toast.success(
      bookmarkedLessons.includes(key)
        ? "Removed from bookmarks"
        : "Added to bookmarks"
    );
  };
  const toggleLike = (pathId, moduleId, lessonId) => {
    const key = `${pathId}-${moduleId}-${lessonId}`;
    const newLikes = likedLessons.includes(key)
      ? likedLessons.filter((l) => l !== key)
      : [...likedLessons, key];
    setLikedLessons(newLikes);
    localStorage.setItem("likedLessons", JSON.stringify(newLikes));
  };
  const saveNotes = () => {
    if (!currentLesson || !currentPath) return;
    const key = `${currentPath.id}-${currentLesson.moduleId}-${currentLesson.id}`;
    const newNotes = { ...savedNotes, [key]: notes };
    setSavedNotes(newNotes);
    localStorage.setItem("lessonNotes", JSON.stringify(newNotes));
    toast.success("Notes saved!");
  };
  const playNextLesson = () => {
    if (!currentPath || !currentLesson) return;
    const module = currentPath.modules.find(
      (m) => m.id === currentLesson.moduleId
    );
    if (!module) return;
    const idx = module.lessons.findIndex((l) => l.id === currentLesson.id);
    if (idx < module.lessons.length - 1) {
      const next = module.lessons[idx + 1];
      setCurrentLesson({
        ...next,
        moduleId: module.id,
        moduleName: module.name,
      });
    }
  };
  const playPreviousLesson = () => {
    if (!currentPath || !currentLesson) return;
    const module = currentPath.modules.find(
      (m) => m.id === currentLesson.moduleId
    );
    if (!module) return;
    const idx = module.lessons.findIndex((l) => l.id === currentLesson.id);
    if (idx > 0) {
      const prev = module.lessons[idx - 1];
      setCurrentLesson({
        ...prev,
        moduleId: module.id,
        moduleName: module.name,
      });
    }
  };
  const getDifficultyColor = (d) => {
    if (d === "Beginner") return "text-green-400 bg-green-500/20";
    if (d === "Intermediate") return "text-yellow-400 bg-yellow-500/20";
    if (d === "Advanced") return "text-red-400 bg-red-500/20";
    return "text-zinc-400 bg-zinc-500/20";
  };
  const getFilteredPaths = () => {
    let filtered = learningPaths.filter((path) => {
      const matchesSearch =
        path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || path.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === "All" || path.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort paths
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.students - a.students;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return b.id - a.id;
        case "progress":
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    return filtered;
  };
  const categories = ["All", ...new Set(learningPaths.map((p) => p.category))];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
  const generateCertificate = (path) => {
    if (path.progress < 100) {
      toast.error("Complete the course to get a certificate!");
      return;
    }
    const certificate = {
      id: Date.now(),
      pathId: path.id,
      title: path.title,
      instructor: path.instructor,
      completionDate: new Date().toLocaleDateString(),
      certificateId: `CERT-${path.id}-${Date.now()}`,
    };
    setCertificates([...certificates, certificate]);
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
    toast.success("Certificate generated! 🎉");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      {isPlayerOpen && currentLesson && currentPath && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="h-full flex flex-col lg:flex-row">
            <div
              className={`flex-1 flex flex-col ${
                showSidebar ? "lg:mr-96" : ""
              }`}
            >
              <div className="flex items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closePlayer}
                    className="text-white hover:bg-zinc-800"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div>
                    <p className="text-xs text-zinc-400">{currentPath.title}</p>
                    <h2 className="font-semibold text-white text-sm md:text-base line-clamp-1">
                      {currentLesson.title}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      toggleBookmark(
                        currentPath.id,
                        currentLesson.moduleId,
                        currentLesson.id
                      )
                    }
                    className="text-white hover:bg-zinc-800"
                  >
                    {bookmarkedLessons.includes(
                      `${currentPath.id}-${currentLesson.moduleId}-${currentLesson.id}`
                    ) ? (
                      <BookmarkCheck className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="text-white hover:bg-zinc-800 hidden lg:flex"
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div
                className="flex-1 bg-black flex items-center justify-center p-2 md:p-4"
                ref={playerRef}
              >
                <div className="w-full max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${currentLesson.youtubeId}?autoplay=1&rel=0`}
                    title={currentLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {currentLesson.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {currentLesson.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {currentLesson.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {currentPath.instructor}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={
                          likedLessons.includes(
                            `${currentPath.id}-${currentLesson.moduleId}-${currentLesson.id}`
                          )
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          toggleLike(
                            currentPath.id,
                            currentLesson.moduleId,
                            currentLesson.id
                          )
                        }
                        className={`gap-2 ${
                          likedLessons.includes(
                            `${currentPath.id}-${currentLesson.moduleId}-${currentLesson.id}`
                          )
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-zinc-700 text-white hover:bg-zinc-800"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {currentLesson.likes}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://www.youtube.com/watch?v=${currentLesson.youtubeId}`
                          );
                          toast.success("Link copied!");
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          markLessonComplete(
                            currentPath.id,
                            currentLesson.moduleId,
                            currentLesson.id
                          )
                        }
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={playPreviousLesson}
                      className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      <SkipBack className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={playNextLesson}
                      className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      Next
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border-t border-zinc-800 bg-zinc-950">
                <div className="flex gap-1 p-2 border-b border-zinc-800">
                  {[
                    {
                      id: "overview",
                      label: "Overview",
                      icon: <FileText className="w-4 h-4" />,
                    },
                    {
                      id: "notes",
                      label: "Notes",
                      icon: <BookOpen className="w-4 h-4" />,
                    },
                    {
                      id: "resources",
                      label: "Resources",
                      icon: <Download className="w-4 h-4" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                        activeTab === tab.id
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="p-4 max-h-48 overflow-y-auto">
                  {activeTab === "overview" && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">
                        About this lesson
                      </h4>
                      <p className="text-sm text-zinc-400">
                        Learn {currentLesson.title.toLowerCase()} from{" "}
                        {currentPath.instructor}. Part of the{" "}
                        {currentLesson.moduleName} module.
                      </p>
                    </div>
                  )}
                  {activeTab === "notes" && (
                    <div className="space-y-3">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Take notes..."
                        className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white resize-none focus:outline-none"
                      />
                      <Button
                        size="sm"
                        onClick={saveNotes}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Save Notes
                      </Button>
                    </div>
                  )}
                  {activeTab === "resources" && (
                    <div className="space-y-2">
                      <a
                        href={`https://www.youtube.com/watch?v=${currentLesson.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700"
                      >
                        <Youtube className="w-5 h-5 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm text-white">Watch on YouTube</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-400" />
                      </a>
                      <div
                        className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer"
                        onClick={() => navigate("/coding")}
                      >
                        <Code className="w-5 h-5 text-green-400" />
                        <div className="flex-1">
                          <p className="text-sm text-white">Practice Coding</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {showSidebar && (
              <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-96 bg-zinc-900 border-l border-zinc-800 overflow-y-auto">
                <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
                  <h3 className="font-bold text-white">{currentPath.title}</h3>
                  <p className="text-sm text-zinc-400">
                    {currentPath.instructor}
                  </p>
                  <Progress value={currentPath.progress} className="h-1 mt-2" />
                </div>
                <div className="divide-y divide-zinc-800">
                  {currentPath.modules.map((module) => (
                    <div key={module.id}>
                      <button
                        onClick={() =>
                          setExpandedPath(
                            expandedPath === module.id ? null : module.id
                          )
                        }
                        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50"
                      >
                        <div className="flex items-center gap-3">
                          {module.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : module.locked ? (
                            <Lock className="w-5 h-5 text-zinc-600" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-zinc-400" />
                          )}
                          <div className="text-left">
                            <p
                              className={`text-sm font-medium ${
                                module.locked ? "text-zinc-600" : "text-white"
                              }`}
                            >
                              {module.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {module.lessons.filter((l) => l.completed).length}
                              /{module.lessons.length} lessons
                            </p>
                          </div>
                        </div>
                        {expandedPath === module.id ? (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>
                      {expandedPath === module.id && (
                        <div className="bg-zinc-950/50">
                          {module.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() =>
                                !module.locked &&
                                openLessonPlayer(currentPath, module, lesson)
                              }
                              disabled={module.locked}
                              className={`w-full p-3 pl-6 flex items-center gap-3 text-left hover:bg-zinc-800/50 ${
                                currentLesson.id === lesson.id &&
                                currentLesson.moduleId === module.id
                                  ? "bg-zinc-800 border-l-2 border-red-500"
                                  : ""
                              } ${
                                module.locked
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <div className="relative w-28 h-16 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
                                <img
                                  src={`https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`}
                                  alt={lesson.title}
                                  className="w-full h-full object-cover"
                                />
                                {lesson.completed && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                  </div>
                                )}
                                {currentLesson.id === lesson.id &&
                                  currentLesson.moduleId === module.id && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                        <Play className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                  )}
                                <div className="absolute bottom-1 right-1 px-1 bg-black/80 rounded text-xs text-white">
                                  {lesson.duration}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm line-clamp-2 ${
                                    currentLesson.id === lesson.id &&
                                    currentLesson.moduleId === module.id
                                      ? "text-white font-medium"
                                      : "text-zinc-300"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  {lesson.views} views
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/20">
                <Youtube className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  Learning Paths
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded animate-pulse">
                    LIVE
                  </span>
                </h1>
                <p className="text-zinc-400 text-sm">
                  Learn from the best YouTube tutorials curated for you
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button
                onClick={loadProgress}
                variant="outline"
                className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden md:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-red-400 transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 hover:border-zinc-600 hover:shadow-lg hover:shadow-red-500/10 text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className={`gap-2 transition-all duration-200 ${
                    showFilters
                      ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                      : "border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {(selectedCategory !== "All" ||
                  selectedDifficulty !== "All" ||
                  sortBy !== "popular") && (
                  <Button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedDifficulty("All");
                      setSortBy("popular");
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-white gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear filters
                  </Button>
                )}
              </div>
              <div className="text-sm text-zinc-400">
                Showing {getFilteredPaths().length} of {learningPaths.length}{" "}
                courses
              </div>
            </div>

            {showFilters && (
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 hover:border-zinc-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 hover:border-zinc-500"
                    >
                      {difficulties.map((diff) => (
                        <option key={diff} value={diff}>
                          {diff}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 hover:border-zinc-500"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest</option>
                      <option value="progress">My Progress</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Courses</p>
                  <p className="text-xl font-bold text-white">
                    {learningPaths.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Completed</p>
                  <p className="text-xl font-bold text-white">
                    {learningPaths.filter((p) => p.progress === 100).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-yellow-500/20 rounded-xl">
                  <Bookmark className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Bookmarks</p>
                  <p className="text-xl font-bold text-white">
                    {bookmarkedLessons.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 rounded-xl">
                  <Flame className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Watched</p>
                  <p className="text-xl font-bold text-white">
                    {watchHistory.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/20 rounded-xl">
                  <Award className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Certificates</p>
                  <p className="text-xl font-bold text-white">
                    {certificates.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {watchHistory.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500" />
              Continue Watching
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {watchHistory.slice(0, 4).map((item, idx) => {
                const path = learningPaths.find((p) => p.id === item.pathId);
                const module = path?.modules.find(
                  (m) => m.id === item.moduleId
                );
                const lesson = module?.lessons.find(
                  (l) => l.id === item.lessonId
                );
                if (!path || !module || !lesson) return null;
                return (
                  <Card
                    key={idx}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all overflow-hidden group"
                    onClick={() => openLessonPlayer(path, module, lesson)}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={`https://img.youtube.com/vi/${lesson.youtubeId}/maxresdefault.jpg`}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white">
                        {lesson.duration}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-zinc-500">{path.title}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        {loading && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-zinc-800 rounded-lg w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded w-64 animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="h-8 bg-zinc-800 rounded w-16 mb-1 animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 overflow-hidden"
                >
                  <div className="aspect-video bg-zinc-800 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-6 bg-zinc-800 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-6 bg-zinc-800 rounded-full w-24 animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-zinc-800 rounded w-full mb-1 animate-pulse"></div>
                      <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-zinc-800 rounded-lg animate-pulse"></div>
                          <div>
                            <div className="h-3 bg-zinc-800 rounded w-16 mb-1 animate-pulse"></div>
                            <div className="h-4 bg-zinc-800 rounded w-12 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-zinc-800 rounded w-24 animate-pulse"></div>
                        <div className="h-4 bg-zinc-800 rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="h-3 bg-zinc-800 rounded animate-pulse"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-3 bg-zinc-800 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-zinc-800 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 bg-zinc-800 rounded flex-1 animate-pulse"></div>
                      <div className="h-10 bg-zinc-800 rounded flex-1 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {!loading &&
          getFilteredPaths().some(
            (p) => p.progress > 0 && p.progress < 100
          ) && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Play className="w-6 h-6 text-red-500" />
                Continue Learning
                <span className="text-sm font-normal text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
                  {
                    getFilteredPaths().filter(
                      (p) => p.progress > 0 && p.progress < 100
                    ).length
                  }{" "}
                  courses
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredPaths()
                  .filter((p) => p.progress > 0 && p.progress < 100)
                  .slice(0, 3)
                  .map((path) => (
                    <Card
                      key={`continue-${path.id}`}
                      className="bg-gradient-to-br from-red-950/20 to-zinc-900 border-red-500/30 overflow-hidden hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
                      onClick={() => {
                        const m =
                          path.modules.find((m) => m.current) ||
                          path.modules.find((m) => !m.locked);
                        if (m?.lessons) openLessonPlayer(path, m, m.lessons[0]);
                      }}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={path.thumbnail}
                          alt={path.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-red-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                            In Progress
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-zinc-700">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                          {path.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
                          <span>{path.progress}% complete</span>
                          <span>
                            {path.modules.filter((m) => m.completed).length}/
                            {path.modules.length} modules
                          </span>
                        </div>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                          <Play className="w-4 h-4 mr-2" />
                          Continue Course
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                All Courses
              </h2>
              <p className="text-zinc-400">
                Discover your next learning adventure
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {getFilteredPaths().length}
              </p>
              <p className="text-sm text-zinc-400">courses found</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {getFilteredPaths().length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="p-6 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 mb-6">
                  <Search className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No courses found
                </h3>
                <p className="text-zinc-400 text-center mb-6 max-w-md">
                  We couldn't find any courses matching your search criteria.
                  Try adjusting your filters or search terms.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedDifficulty("All");
                      setSortBy("popular");
                    }}
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  >
                    Clear all filters
                  </Button>
                  <Button
                    onClick={() => navigate("/tutor")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Ask AI Tutor for help
                  </Button>
                </div>
              </div>
            ) : (
              getFilteredPaths().map((path) => (
                <Card
                  key={path.id}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 overflow-hidden hover:border-red-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1"
                >
                  <div
                    className="relative aspect-video cursor-pointer group overflow-hidden"
                    onClick={() => {
                      const m =
                        path.modules.find((m) => m.current) ||
                        path.modules.find((m) => !m.locked);
                      if (m?.lessons) openLessonPlayer(path, m, m.lessons[0]);
                    }}
                  >
                    <img
                      src={path.thumbnail}
                      alt={path.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform border-4 border-white/20">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                          path.difficulty === "Beginner"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : path.difficulty === "Intermediate"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : path.difficulty === "Advanced"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        }`}
                      >
                        {path.difficulty}
                      </span>
                      {path.progress > 0 && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full backdrop-blur-sm border border-blue-500/30">
                          {path.progress}% done
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-white font-semibold">
                          {path.rating}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add bookmark functionality
                          toast.success("Course bookmarked!");
                        }}
                        className="w-8 h-8 p-0 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(
                              window.location.href + `?course=${path.id}`
                            );
                            toast.success("Course link copied!");
                          }}
                          className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewCourse(path);
                            setShowPreviewModal(true);
                          }}
                          className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-white/80 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                        {path.modules.reduce(
                          (acc, m) => acc + m.lessons.length,
                          0
                        )}{" "}
                        lessons
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-white text-xl mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                          {path.title}
                        </h3>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                            path.category === "Web Development"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : path.category === "Data Science"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : path.category === "Computer Science"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : path.category === "Mobile Development"
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                              : path.category === "DevOps"
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                              : path.category === "Cybersecurity"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : path.category === "Design"
                              ? "bg-pink-500/20 text-pink-400 border-pink-500/30"
                              : path.category === "Blockchain"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {path.category}
                        </span>
                      </div>
                      <p className="text-zinc-300 line-clamp-2 text-sm leading-relaxed">
                        {path.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-zinc-800 rounded-lg">
                          <GraduationCap className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Instructor</p>
                          <p className="font-medium text-zinc-300">
                            {path.instructor}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-zinc-800 rounded-lg">
                          <Users className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Students</p>
                          <p className="font-medium text-zinc-300">
                            {(path.students / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-zinc-800 rounded-lg">
                          <BookOpen className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Lessons</p>
                          <p className="font-medium text-zinc-300">
                            {path.modules.reduce(
                              (acc, m) => acc + m.lessons.length,
                              0
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-zinc-800 rounded-lg">
                          <Clock className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Duration</p>
                          <p className="font-medium text-zinc-300">
                            {path.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Course Progress</span>
                        <span className="font-semibold text-white">
                          {path.progress}%
                        </span>
                      </div>
                      <Progress
                        value={path.progress}
                        className="h-3 bg-zinc-800"
                      />
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>
                          {path.modules.filter((m) => m.completed).length} of{" "}
                          {path.modules.length} modules completed
                        </span>
                        <span>
                          {path.modules.reduce(
                            (acc, m) =>
                              acc + m.lessons.filter((l) => l.completed).length,
                            0
                          )}{" "}
                          lessons done
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {path.progress === 100 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateCertificate(path)}
                          className="flex-1 gap-2 border-orange-500/50 text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200"
                        >
                          <Award className="w-4 h-4" />
                          Certificate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          const m =
                            path.modules.find((m) => m.current) ||
                            path.modules.find((m) => !m.locked);
                          if (m?.lessons)
                            openLessonPlayer(path, m, m.lessons[0]);
                        }}
                        className="flex-1 gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-200"
                      >
                        <Play className="w-4 h-4" />
                        {path.progress > 0 ? "Continue" : "Start Course"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        <Card className="mt-12 bg-gradient-to-br from-zinc-900 via-red-950/30 to-purple-950/20 border-zinc-700/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-2xl border border-red-500/20">
                <Lightbulb className="w-10 h-10 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 text-white flex items-center gap-3">
                  Smart Recommendations
                  <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                </h3>
                <p className="text-zinc-300 mb-6 text-lg leading-relaxed">
                  Based on your learning history, we recommend exploring{" "}
                  <strong className="text-white bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
                    {learningPaths.find((p) => p.progress < 100)?.title ||
                      "a new course"}
                  </strong>
                  . Consistent learning leads to better retention and career
                  growth!
                </p>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    onClick={() => {
                      const path =
                        learningPaths.find((p) => p.progress < 100) ||
                        learningPaths[0];
                      if (path) {
                        const m = path.modules.find((m) => !m.locked);
                        if (m?.lessons) openLessonPlayer(path, m, m.lessons[0]);
                      }
                    }}
                    className="gap-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-3 text-lg shadow-lg hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    Start Learning Now
                  </Button>
                  <Button
                    onClick={() => navigate("/tutor")}
                    variant="outline"
                    className="gap-3 border-zinc-600/50 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-500 px-6 py-3 text-lg backdrop-blur-sm transition-all duration-200"
                  >
                    <Brain className="w-5 h-5" />
                    Ask AI Tutor
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Course Preview Modal */}
      {showPreviewModal && previewCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-400" />
                  Course Preview
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                    <img
                      src={previewCourse.thumbnail}
                      alt={previewCourse.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {previewCourse.title}
                      </h3>
                      <p className="text-zinc-300 text-sm">
                        {previewCourse.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                      <GraduationCap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500">Instructor</p>
                      <p className="font-semibold text-white">
                        {previewCourse.instructor}
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                      <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500">Students</p>
                      <p className="font-semibold text-white">
                        {(previewCourse.students / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                      <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500">Lessons</p>
                      <p className="font-semibold text-white">
                        {previewCourse.modules.reduce(
                          (acc, m) => acc + m.lessons.length,
                          0
                        )}
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                      <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500">Duration</p>
                      <p className="font-semibold text-white">
                        {previewCourse.duration}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Course Curriculum
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {previewCourse.modules.slice(0, 5).map((module, index) => (
                      <div
                        key={module.id}
                        className="bg-zinc-800/30 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-300">
                            {index + 1}
                          </span>
                          <h5 className="font-medium text-white">
                            {module.name}
                          </h5>
                          <span className="text-xs text-zinc-500 ml-auto">
                            {module.lessons.length} lessons
                          </span>
                        </div>
                        <div className="ml-9 space-y-1">
                          {module.lessons.slice(0, 3).map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 text-sm text-zinc-400"
                            >
                              <Play className="w-3 h-3" />
                              <span>{lesson.title}</span>
                              <span className="text-xs text-zinc-500 ml-auto">
                                {lesson.duration}
                              </span>
                            </div>
                          ))}
                          {module.lessons.length > 3 && (
                            <p className="text-xs text-zinc-500 ml-5">
                              +{module.lessons.length - 3} more lessons
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {previewCourse.modules.length > 5 && (
                      <p className="text-sm text-zinc-500 text-center py-2">
                        +{previewCourse.modules.length - 5} more modules
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={() => {
                        setShowPreviewModal(false);
                        const m = previewCourse.modules.find((m) => !m.locked);
                        if (m?.lessons)
                          openLessonPlayer(previewCourse, m, m.lessons[0]);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Course
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPreviewModal(false)}
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                    >
                      Close Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-orange-400" />
                  Certificate of Completion
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCertificateModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-8 text-center">
                <div className="mb-6">
                  <Award className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Certificate Awarded
                  </h3>
                  <p className="text-zinc-400">
                    This certifies that you have successfully completed
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {selectedCertificate.title}
                  </h4>
                  <p className="text-zinc-400">
                    by {selectedCertificate.instructor}
                  </p>
                </div>

                <div className="flex justify-center gap-8 text-sm text-zinc-400 mb-6">
                  <div className="text-center">
                    <p className="font-medium text-white">Certificate ID</p>
                    <p>{selectedCertificate.certificateId}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white">Completion Date</p>
                    <p>{selectedCertificate.completionDate}</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Certificate ID: ${selectedCertificate.certificateId}\nCourse: ${selectedCertificate.title}\nCompleted: ${selectedCertificate.completionDate}`
                      );
                      toast.success("Certificate details copied!");
                    }}
                    className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCertificateModal(false)}
                    className="border-zinc-600 text-white hover:bg-zinc-800"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LearningPathPage;
