import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Code,
  Database,
  Cloud,
  Brain,
  Layers,
  Rocket,
  Star,
  Calendar,
  BookOpen,
  FileText,
  CheckCircle2,
  ArrowRight,
  X,
  Play,
  Clock,
  Award,
  Target,
  Zap,
  Shield,
  Globe,
  Search,
  GitBranch,
  Server,
  Cpu,
  Network,
  FileCode,
  Palette,
  Smartphone,
  Monitor,
  Terminal,
  Database as DbIcon,
  Lock,
  BarChart3,
  Settings,
  TrendingUp,
  Wrench,
  LineChart,
  Brush,
  Bell,
  Users,
  MessageSquare,
  Heart,
  Activity,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  TestTube,
  Briefcase,
  Key,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";

// Expanded course data with individual courses
// NOTE: We keep a set of detailed, handcrafted tracks for the core domains
// already in the app. Everything else is generated from a compact catalog
// below so we can support MANY domains without huge repetitive code.
const DETAILED_ROADMAP_TRACKS = [
  {
    id: "frontend",
    name: "Frontend Developer",
    icon: <Code className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 24,
    estimatedMonths: "6–8 months",
    summary:
      "Master modern frontend development from core web fundamentals to advanced React-based applications.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Foundations",
        courseCount: 8,
        duration: "6–8 weeks",
        focus: "Core web fundamentals and basic JavaScript.",
        courses: [
          {
            id: 1,
            name: "HTML5 & Semantic Markup",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "CSS3 Fundamentals & Layouts",
            duration: "1 week",
            icon: <Palette className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Flexbox & CSS Grid",
            duration: "1 week",
            icon: <Monitor className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Responsive Design Principles",
            duration: "1 week",
            icon: <Smartphone className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "JavaScript Basics (ES6+)",
            duration: "2 weeks",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 6,
            name: "DOM Manipulation & Events",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 7,
            name: "Git & GitHub Workflow",
            duration: "1 week",
            icon: <GitBranch className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Accessibility & Web Standards",
            duration: "1 week",
            icon: <Globe className="w-4 h-4" />,
          },
        ],
        modules: [
          "HTML & Semantic Markup",
          "Modern CSS, Flexbox & Grid",
          "Responsive Design & Layouts",
          "JavaScript Fundamentals (ES6+)",
          "Basic Git & GitHub Workflow",
          "Accessibility & Web Standards",
        ],
        outcomes: [
          "Build static responsive landing pages",
          "Understand DOM, events, and basic JS logic",
        ],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Frameworks",
        courseCount: 8,
        duration: "8–10 weeks",
        focus: "React ecosystem and state management.",
        courses: [
          {
            id: 9,
            name: "React Fundamentals",
            duration: "2 weeks",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Components, Props & Hooks",
            duration: "2 weeks",
            icon: <Layers className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "React Router & Navigation",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "State Management (Context API)",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "API Integration with Axios",
            duration: "1 week",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Form Handling & Validation",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "UI Libraries (shadcn/Tailwind)",
            duration: "1 week",
            icon: <Palette className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Building SaaS Dashboards",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ],
        modules: [
          "React Core (components, props, hooks)",
          "Routing & Navigation",
          "API Integration & Axios",
          "State Management Patterns",
          "Form Handling & Validation",
          "Working with UI Libraries (shadcn/Tailwind)",
        ],
        outcomes: [
          "Build SPA dashboards with routing",
          "Integrate REST APIs and handle async flows",
        ],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Production",
        courseCount: 8,
        duration: "8–10 weeks",
        focus: "Production-grade apps and performance.",
        courses: [
          {
            id: 17,
            name: "Performance Optimization",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 18,
            name: "Code Splitting & Lazy Loading",
            duration: "1 week",
            icon: <Cpu className="w-4 h-4" />,
          },
          {
            id: 19,
            name: "Advanced UI Systems",
            duration: "2 weeks",
            icon: <Palette className="w-4 h-4" />,
          },
          {
            id: 20,
            name: "Testing (Jest & RTL)",
            duration: "2 weeks",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 21,
            name: "Deployment & CI/CD",
            duration: "1 week",
            icon: <Rocket className="w-4 h-4" />,
          },
          {
            id: 22,
            name: "Security & Auth on Frontend",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 23,
            name: "Monitoring & Analytics",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 24,
            name: "Advanced SaaS Patterns",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ],
        modules: [
          "Performance Optimization & Code Splitting",
          "Advanced UI Systems & Design Systems",
          "Testing (Jest, React Testing Library)",
          "Deployment & Monitoring",
          "Security & Auth on Frontend",
          "Designing SaaS Dashboards & Analytics UIs",
        ],
        outcomes: [
          "Ship production-ready SaaS-style frontends",
          "Implement testing and deployment workflows",
        ],
      },
    ],
  },
  {
    id: "fullstack",
    name: "Full‑Stack JavaScript Developer",
    icon: <Layers className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 20,
    estimatedMonths: "7–9 months",
    summary:
      "End‑to‑end product development with React on the frontend and Node.js on the backend.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Web Basics",
        courseCount: 6,
        duration: "5–7 weeks",
        focus: "Web foundations and basic JS.",
        courses: [
          {
            id: 1,
            name: "HTML, CSS & Responsive Design",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "JavaScript Essentials",
            duration: "2 weeks",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Git & GitHub Basics",
            duration: "1 week",
            icon: <GitBranch className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Command Line & Terminal",
            duration: "1 week",
            icon: <Terminal className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Node.js Fundamentals",
            duration: "1 week",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 6,
            name: "NPM & Package Management",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
        ],
        modules: [
          "HTML, CSS & Responsive Design",
          "JavaScript Essentials",
          "Git & GitHub Basics",
          "Command Line & Tooling Basics",
        ],
        outcomes: ["Comfortable with web basics", "Version control workflow"],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Frontend + Backend",
        courseCount: 7,
        duration: "8–10 weeks",
        focus: "React frontend + Node backend.",
        courses: [
          {
            id: 7,
            name: "React Fundamentals",
            duration: "2 weeks",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Express.js & REST APIs",
            duration: "2 weeks",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Authentication & JWT",
            duration: "1 week",
            icon: <Lock className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "SQL Databases (PostgreSQL)",
            duration: "1 week",
            icon: <DbIcon className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "NoSQL Databases (MongoDB)",
            duration: "1 week",
            icon: <Database className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Environment & Config Management",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "Full-Stack Project",
            duration: "1 week",
            icon: <Rocket className="w-4 h-4" />,
          },
        ],
        modules: [
          "React Fundamentals",
          "Express & REST APIs",
          "Authentication & Authorization",
          "Working with Databases (SQL/NoSQL)",
          "Environment Management & Config",
        ],
        outcomes: [
          "Build full‑stack CRUD applications",
          "Secure endpoints and handle auth flows",
        ],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Scalable Systems",
        courseCount: 7,
        duration: "8–10 weeks",
        focus: "Scaling, cloud and best practices.",
        courses: [
          {
            id: 14,
            name: "Microservices Architecture",
            duration: "2 weeks",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Cloud Deployment (Azure)",
            duration: "1 week",
            icon: <Cloud className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Docker & Containerization",
            duration: "1 week",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "CI/CD Pipelines",
            duration: "1 week",
            icon: <GitBranch className="w-4 h-4" />,
          },
          {
            id: 18,
            name: "Testing & Quality Assurance",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 19,
            name: "Performance & Security",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 20,
            name: "Monitoring & Logging",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
        ],
        modules: [
          "Microservices & API Gateways (intro)",
          "Cloud Deployment (Azure / Vercel)",
          "Testing & CI/CD Pipelines",
          "Performance & Security Hardening",
          "Monitoring & Logging",
          "Designing Production‑grade APIs",
        ],
        outcomes: [
          "Deploy and operate full‑stack apps in cloud",
          "Design scalable and secure architectures",
        ],
      },
    ],
  },
  {
    id: "backend",
    name: "Backend Developer",
    icon: <Database className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 18,
    estimatedMonths: "6–8 months",
    summary:
      "Focus on APIs, databases, and scalable backend services with modern tooling.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Programming",
        courseCount: 6,
        duration: "5–7 weeks",
        focus: "Programming and fundamentals.",
        courses: [
          {
            id: 1,
            name: "JavaScript/TypeScript Fundamentals",
            duration: "2 weeks",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Python Basics",
            duration: "1 week",
            icon: <Terminal className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Data Structures & Algorithms",
            duration: "2 weeks",
            icon: <Cpu className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "HTTP & REST Concepts",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Working with Files & CLI",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
          {
            id: 6,
            name: "API Testing (Postman)",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
        ],
        modules: [
          "Language Fundamentals (JS / TS / Python)",
          "Data Structures & Algorithms Basics",
          "HTTP & REST Concepts",
          "Working with Files & CLI Tools",
        ],
        outcomes: [
          "Write clean, basic backend code",
          "Understand how APIs communicate",
        ],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – APIs & Data",
        courseCount: 6,
        duration: "8–10 weeks",
        focus: "Building real APIs and data layers.",
        courses: [
          {
            id: 7,
            name: "REST API Design Principles",
            duration: "1 week",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Relational Databases (SQL)",
            duration: "2 weeks",
            icon: <DbIcon className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "NoSQL Databases",
            duration: "1 week",
            icon: <Database className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "ORM & Query Builders",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Caching Strategies",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Message Queues & Background Jobs",
            duration: "2 weeks",
            icon: <Network className="w-4 h-4" />,
          },
        ],
        modules: [
          "REST API Design",
          "Relational & NoSQL Databases",
          "ORM / Query Builders",
          "Caching & Message Queues (intro)",
          "Background Jobs & Scheduling",
        ],
        outcomes: [
          "Design and implement robust APIs",
          "Model and query data efficiently",
        ],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Systems",
        courseCount: 6,
        duration: "7–9 weeks",
        focus: "System design and scalability.",
        courses: [
          {
            id: 13,
            name: "System Design Fundamentals",
            duration: "2 weeks",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Scalability Patterns",
            duration: "2 weeks",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Observability & Monitoring",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Security & Compliance",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "Disaster Recovery",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 18,
            name: "Advanced Architecture Patterns",
            duration: "2 weeks",
            icon: <Layers className="w-4 h-4" />,
          },
        ],
        modules: [
          "System Design Essentials",
          "Scalability & Observability",
          "Security & Compliance Basics",
          "Disaster Recovery & Resilience Patterns",
        ],
        outcomes: [
          "Reason about high‑level architectures",
          "Design secure, scalable services",
        ],
      },
    ],
  },
  {
    id: "mobile",
    name: "Mobile Developer",
    icon: <Smartphone className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 20,
    estimatedMonths: "7–9 months",
    summary:
      "Build native and cross-platform mobile applications for iOS and Android.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Mobile Basics",
        courseCount: 6,
        duration: "6–8 weeks",
        focus: "Mobile development fundamentals.",
        courses: [
          {
            id: 1,
            name: "Mobile App Concepts",
            duration: "1 week",
            icon: <Smartphone className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "React Native Fundamentals",
            duration: "2 weeks",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Mobile UI Components",
            duration: "1 week",
            icon: <Palette className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Navigation & Routing",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "State Management",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 6,
            name: "API Integration",
            duration: "1 week",
            icon: <Server className="w-4 h-4" />,
          },
        ],
        modules: [
          "Mobile App Concepts",
          "React Native Fundamentals",
          "Mobile UI Components",
          "Navigation & Routing",
        ],
        outcomes: [
          "Build basic mobile apps",
          "Understand mobile development patterns",
        ],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Advanced Mobile",
        courseCount: 7,
        duration: "8–10 weeks",
        focus: "Advanced mobile features and native modules.",
        courses: [
          {
            id: 7,
            name: "Native Modules & APIs",
            duration: "2 weeks",
            icon: <Cpu className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Push Notifications",
            duration: "1 week",
            icon: <Bell className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Offline Storage",
            duration: "1 week",
            icon: <Database className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Authentication & Security",
            duration: "1 week",
            icon: <Lock className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Performance Optimization",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Testing Mobile Apps",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "App Store Deployment",
            duration: "1 week",
            icon: <Rocket className="w-4 h-4" />,
          },
        ],
        modules: [
          "Native Modules & APIs",
          "Push Notifications",
          "Offline Storage",
          "Authentication & Security",
        ],
        outcomes: [
          "Build production-ready mobile apps",
          "Deploy apps to app stores",
        ],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Production Mobile",
        courseCount: 7,
        duration: "8–10 weeks",
        focus: "Advanced mobile architecture and optimization.",
        courses: [
          {
            id: 14,
            name: "Advanced Architecture Patterns",
            duration: "2 weeks",
            icon: <Layers className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Cross-platform Optimization",
            duration: "1 week",
            icon: <Monitor className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Analytics & Monitoring",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "CI/CD for Mobile",
            duration: "1 week",
            icon: <GitBranch className="w-4 h-4" />,
          },
          {
            id: 18,
            name: "Advanced Animations",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 19,
            name: "Monetization Strategies",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 20,
            name: "Enterprise Mobile Apps",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
        ],
        modules: [
          "Advanced Architecture Patterns",
          "Cross-platform Optimization",
          "Analytics & Monitoring",
          "CI/CD for Mobile",
        ],
        outcomes: [
          "Build enterprise-grade mobile apps",
          "Optimize and scale mobile applications",
        ],
      },
    ],
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    icon: <Wrench className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 18,
    estimatedMonths: "6–8 months",
    summary:
      "Master infrastructure, automation, and deployment pipelines for modern applications.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – DevOps Basics",
        courseCount: 6,
        duration: "5–7 weeks",
        focus: "DevOps fundamentals and tools.",
        courses: [
          {
            id: 1,
            name: "Linux & Command Line",
            duration: "1 week",
            icon: <Terminal className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Git & Version Control",
            duration: "1 week",
            icon: <GitBranch className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Docker Fundamentals",
            duration: "1 week",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "CI/CD Basics",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Cloud Basics (AWS/Azure)",
            duration: "1 week",
            icon: <Cloud className="w-4 h-4" />,
          },
          {
            id: 6,
            name: "Infrastructure as Code",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
        ],
        modules: [
          "Linux & Command Line",
          "Git & Version Control",
          "Docker Fundamentals",
          "CI/CD Basics",
        ],
        outcomes: [
          "Understand DevOps principles",
          "Work with containers and CI/CD",
        ],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Automation",
        courseCount: 6,
        duration: "8–10 weeks",
        focus: "Automation and orchestration.",
        courses: [
          {
            id: 7,
            name: "Kubernetes Fundamentals",
            duration: "2 weeks",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Terraform & Infrastructure",
            duration: "2 weeks",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Monitoring & Logging",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Security & Compliance",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Scripting & Automation",
            duration: "1 week",
            icon: <Terminal className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Cloud Services Deep Dive",
            duration: "1 week",
            icon: <Cloud className="w-4 h-4" />,
          },
        ],
        modules: [
          "Kubernetes Fundamentals",
          "Terraform & Infrastructure",
          "Monitoring & Logging",
          "Security & Compliance",
        ],
        outcomes: [
          "Automate infrastructure deployment",
          "Manage containerized applications",
        ],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Production DevOps",
        courseCount: 6,
        duration: "8–10 weeks",
        focus: "Advanced DevOps practices and scaling.",
        courses: [
          {
            id: 13,
            name: "Advanced Kubernetes",
            duration: "2 weeks",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Multi-cloud Strategies",
            duration: "1 week",
            icon: <Cloud className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Disaster Recovery",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Performance Optimization",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "DevOps Best Practices",
            duration: "1 week",
            icon: <Award className="w-4 h-4" />,
          },
          {
            id: 18,
            name: "Site Reliability Engineering",
            duration: "2 weeks",
            icon: <TrendingUp className="w-4 h-4" />,
          },
        ],
        modules: [
          "Advanced Kubernetes",
          "Multi-cloud Strategies",
          "Disaster Recovery",
          "Site Reliability Engineering",
        ],
        outcomes: [
          "Design scalable DevOps pipelines",
          "Ensure high availability and reliability",
        ],
      },
    ],
  },
  {
    id: "data-science",
    name: "Data Scientist",
    icon: <LineChart className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 19,
    estimatedMonths: "8–10 months",
    summary:
      "Master data analysis, machine learning, and data visualization for business insights.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Data Basics",
        courseCount: 6,
        duration: "6–8 weeks",
        focus: "Data fundamentals and Python.",
        courses: [
          {
            id: 1,
            name: "Python for Data Science",
            duration: "2 weeks",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Data Analysis with Pandas",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Data Visualization",
            duration: "1 week",
            icon: <LineChart className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "SQL for Data Analysis",
            duration: "1 week",
            icon: <Database className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Statistics Fundamentals",
            duration: "1 week",
            icon: <Cpu className="w-4 h-4" />,
          },
          {
            id: 6,
            name: "Data Cleaning & Preprocessing",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
        ],
        modules: [
          "Python for Data Science",
          "Data Analysis with Pandas",
          "Data Visualization",
          "SQL for Data Analysis",
        ],
        outcomes: [
          "Analyze and visualize data",
          "Clean and preprocess datasets",
        ],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Machine Learning",
        courseCount: 7,
        duration: "8–10 weeks",
        focus: "Machine learning and predictive modeling.",
        courses: [
          {
            id: 7,
            name: "Machine Learning Basics",
            duration: "2 weeks",
            icon: <Brain className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Scikit-learn",
            duration: "1 week",
            icon: <Cpu className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Feature Engineering",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Model Evaluation",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Deep Learning Basics",
            duration: "2 weeks",
            icon: <Brain className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Neural Networks",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "Natural Language Processing",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
        ],
        modules: [
          "Machine Learning Basics",
          "Scikit-learn",
          "Feature Engineering",
          "Deep Learning Basics",
        ],
        outcomes: [
          "Build predictive models",
          "Apply machine learning algorithms",
        ],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Production ML",
        courseCount: 6,
        duration: "8–10 weeks",
        focus: "Production ML and advanced techniques.",
        courses: [
          {
            id: 14,
            name: "MLOps & Deployment",
            duration: "2 weeks",
            icon: <Rocket className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Big Data Technologies",
            duration: "1 week",
            icon: <Database className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Advanced Deep Learning",
            duration: "2 weeks",
            icon: <Brain className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "Model Interpretability",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 18,
            name: "Time Series Analysis",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 19,
            name: "Capstone Project",
            duration: "1 week",
            icon: <Award className="w-4 h-4" />,
          },
        ],
        modules: [
          "MLOps & Deployment",
          "Big Data Technologies",
          "Advanced Deep Learning",
          "Model Interpretability",
        ],
        outcomes: [
          "Deploy ML models to production",
          "Work with big data and advanced ML",
        ],
      },
    ],
  },
  {
    id: "ui-ux",
    name: "UI/UX Designer",
    icon: <Brush className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 17,
    estimatedMonths: "6–8 months",
    summary:
      "Design beautiful, user-friendly interfaces and create exceptional user experiences.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Design Basics",
        courseCount: 5,
        duration: "5–7 weeks",
        focus: "Design fundamentals and tools.",
        courses: [
          {
            id: 1,
            name: "Design Principles",
            duration: "1 week",
            icon: <Palette className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Figma Fundamentals",
            duration: "1 week",
            icon: <Monitor className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Color Theory & Typography",
            duration: "1 week",
            icon: <Brush className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Wireframing & Prototyping",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "User Research Basics",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
        ],
        modules: [
          "Design Principles",
          "Figma Fundamentals",
          "Color Theory & Typography",
          "Wireframing & Prototyping",
        ],
        outcomes: [
          "Create basic designs and prototypes",
          "Understand user research fundamentals",
        ],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Advanced Design",
        courseCount: 6,
        duration: "7–9 weeks",
        focus: "Advanced design and UX patterns.",
        courses: [
          {
            id: 6,
            name: "Advanced Figma",
            duration: "1 week",
            icon: <Monitor className="w-4 h-4" />,
          },
          {
            id: 7,
            name: "Design Systems",
            duration: "2 weeks",
            icon: <Layers className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Interaction Design",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Usability Testing",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Responsive Design",
            duration: "1 week",
            icon: <Smartphone className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Accessibility Design",
            duration: "1 week",
            icon: <Globe className="w-4 h-4" />,
          },
        ],
        modules: [
          "Advanced Figma",
          "Design Systems",
          "Interaction Design",
          "Usability Testing",
        ],
        outcomes: [
          "Design complex interfaces",
          "Create design systems and test usability",
        ],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Production Design",
        courseCount: 6,
        duration: "7–9 weeks",
        focus: "Production design and collaboration.",
        courses: [
          {
            id: 12,
            name: "Design Leadership",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "Design Handoff",
            duration: "1 week",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Advanced Prototyping",
            duration: "1 week",
            icon: <Rocket className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Design Analytics",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Portfolio Development",
            duration: "1 week",
            icon: <Award className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "Client Communication",
            duration: "1 week",
            icon: <MessageSquare className="w-4 h-4" />,
          },
        ],
        modules: [
          "Design Leadership",
          "Design Handoff",
          "Advanced Prototyping",
          "Design Analytics",
        ],
        outcomes: [
          "Lead design projects",
          "Collaborate effectively with developers",
        ],
      },
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity Engineer",
    icon: <Shield className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 18,
    estimatedMonths: "7–9 months",
    summary:
      "Protect systems and networks from cyber threats and vulnerabilities.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Security Basics",
        courseCount: 6,
        duration: "6–8 weeks",
        focus: "Cybersecurity fundamentals and basics.",
        courses: [
          {
            id: 1,
            name: "Security Fundamentals",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Network Security Basics",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Cryptography Basics",
            duration: "1 week",
            icon: <Lock className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Linux Security",
            duration: "1 week",
            icon: <Terminal className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Threat Modeling",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 6,
            name: "Security Tools",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
        ],
        modules: [
          "Security Fundamentals",
          "Network Security",
          "Cryptography",
          "Linux Security",
        ],
        outcomes: ["Understand security basics", "Identify common threats"],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Advanced Security",
        courseCount: 6,
        duration: "8–10 weeks",
        focus: "Advanced security practices and penetration testing.",
        courses: [
          {
            id: 7,
            name: "Penetration Testing",
            duration: "2 weeks",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Ethical Hacking",
            duration: "2 weeks",
            icon: <Key className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Web Application Security",
            duration: "1 week",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Incident Response",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Security Auditing",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Compliance & Regulations",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
        ],
        modules: [
          "Penetration Testing",
          "Ethical Hacking",
          "Web Security",
          "Incident Response",
        ],
        outcomes: ["Perform security assessments", "Handle security incidents"],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Security Architecture",
        courseCount: 6,
        duration: "8–10 weeks",
        focus: "Security architecture and advanced defense.",
        courses: [
          {
            id: 13,
            name: "Security Architecture",
            duration: "2 weeks",
            icon: <Layers className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Advanced Threat Detection",
            duration: "1 week",
            icon: <Brain className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Cloud Security",
            duration: "1 week",
            icon: <Cloud className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Security Operations",
            duration: "1 week",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "Forensics & Investigation",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 18,
            name: "Security Leadership",
            duration: "2 weeks",
            icon: <Users className="w-4 h-4" />,
          },
        ],
        modules: [
          "Security Architecture",
          "Threat Detection",
          "Cloud Security",
          "Forensics",
        ],
        outcomes: ["Design secure systems", "Lead security teams"],
      },
    ],
  },
  {
    id: "qa",
    name: "QA Engineer",
    icon: <TestTube className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 16,
    estimatedMonths: "5–7 months",
    summary:
      "Ensure software quality through comprehensive testing and automation.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Testing Basics",
        courseCount: 5,
        duration: "5–7 weeks",
        focus: "Testing fundamentals and manual testing.",
        courses: [
          {
            id: 1,
            name: "Testing Fundamentals",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Manual Testing",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Test Case Design",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Bug Tracking",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Test Documentation",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
        ],
        modules: [
          "Testing Fundamentals",
          "Manual Testing",
          "Test Cases",
          "Bug Tracking",
        ],
        outcomes: ["Perform manual testing", "Write test cases"],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Automation",
        courseCount: 6,
        duration: "7–9 weeks",
        focus: "Test automation and scripting.",
        courses: [
          {
            id: 6,
            name: "Selenium WebDriver",
            duration: "2 weeks",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 7,
            name: "API Testing",
            duration: "1 week",
            icon: <Server className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Test Automation Frameworks",
            duration: "1 week",
            icon: <Layers className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Performance Testing",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "CI/CD Integration",
            duration: "1 week",
            icon: <GitBranch className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Mobile Testing",
            duration: "1 week",
            icon: <Smartphone className="w-4 h-4" />,
          },
        ],
        modules: [
          "Selenium",
          "API Testing",
          "Automation Frameworks",
          "Performance Testing",
        ],
        outcomes: ["Automate test cases", "Integrate with CI/CD"],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Advanced QA",
        courseCount: 5,
        duration: "6–8 weeks",
        focus: "Advanced testing strategies and leadership.",
        courses: [
          {
            id: 12,
            name: "Test Strategy & Planning",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "Advanced Automation",
            duration: "2 weeks",
            icon: <Cpu className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Security Testing",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Test Metrics & Reporting",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "QA Leadership",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
        ],
        modules: [
          "Test Strategy",
          "Advanced Automation",
          "Security Testing",
          "Metrics",
        ],
        outcomes: ["Lead QA teams", "Design test strategies"],
      },
    ],
  },
  {
    id: "product-manager",
    name: "Product Manager",
    icon: <Briefcase className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 17,
    estimatedMonths: "6–8 months",
    summary:
      "Lead product development from concept to launch with strategic vision.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – PM Basics",
        courseCount: 5,
        duration: "5–7 weeks",
        focus: "Product management fundamentals.",
        courses: [
          {
            id: 1,
            name: "Product Management Basics",
            duration: "1 week",
            icon: <Briefcase className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "User Research",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Product Roadmaps",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Requirements Gathering",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Stakeholder Management",
            duration: "1 week",
            icon: <MessageSquare className="w-4 h-4" />,
          },
        ],
        modules: ["PM Basics", "User Research", "Roadmaps", "Requirements"],
        outcomes: ["Understand PM role", "Create product roadmaps"],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Advanced PM",
        courseCount: 6,
        duration: "7–9 weeks",
        focus: "Advanced PM skills and analytics.",
        courses: [
          {
            id: 6,
            name: "Product Analytics",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 7,
            name: "A/B Testing",
            duration: "1 week",
            icon: <TestTube className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Agile & Scrum",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Go-to-Market Strategy",
            duration: "1 week",
            icon: <Rocket className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Product Metrics",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Competitive Analysis",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
        ],
        modules: ["Product Analytics", "A/B Testing", "Agile", "Go-to-Market"],
        outcomes: ["Analyze product data", "Launch products"],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Product Leadership",
        courseCount: 6,
        duration: "7–9 weeks",
        focus: "Product strategy and leadership.",
        courses: [
          {
            id: 12,
            name: "Product Strategy",
            duration: "2 weeks",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "Product Vision",
            duration: "1 week",
            icon: <Brain className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Team Leadership",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Product Portfolio Management",
            duration: "1 week",
            icon: <Layers className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Innovation Management",
            duration: "1 week",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "Executive Communication",
            duration: "1 week",
            icon: <MessageSquare className="w-4 h-4" />,
          },
        ],
        modules: ["Product Strategy", "Vision", "Leadership", "Portfolio"],
        outcomes: ["Lead product teams", "Define product vision"],
      },
    ],
  },

  // -----------------------------
  // Non-technical / Business roles
  // -----------------------------
  {
    id: "business-analyst",
    name: "Business Analyst",
    icon: <BarChart3 className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 16,
    estimatedMonths: "4–6 months",
    summary:
      "Turn business needs into clear requirements, dashboards, and impact-focused decisions.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Fundamentals",
        courseCount: 5,
        duration: "4–6 weeks",
        focus: "Core BA skills, documentation, and communication.",
        courses: [
          {
            id: 1,
            name: "Business Analysis Foundations",
            duration: "1 week",
            icon: <Briefcase className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Stakeholder Communication",
            duration: "1 week",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Requirements (BRD/PRD/User Stories)",
            duration: "1 week",
            icon: <FileCode className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Process Mapping (BPMN basics)",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Excel for Analysts",
            duration: "2 weeks",
            icon: <LineChart className="w-4 h-4" />,
          },
        ],
        modules: [
          "BA Fundamentals",
          "Stakeholder Management",
          "Requirements Documentation",
          "Process Mapping",
        ],
        outcomes: ["Write clear requirements", "Map simple business processes"],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Analytics",
        courseCount: 6,
        duration: "6–8 weeks",
        focus: "Data-backed decisions with SQL + dashboards.",
        courses: [
          {
            id: 6,
            name: "SQL Basics for Business",
            duration: "2 weeks",
            icon: <Database className="w-4 h-4" />,
          },
          {
            id: 7,
            name: "KPI Design & Metrics",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Dashboarding (Power BI / Tableau concepts)",
            duration: "2 weeks",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "User Acceptance Testing (UAT)",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Agile Delivery (Scrum basics)",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Business Case & ROI",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
        ],
        modules: ["SQL", "KPIs", "Dashboards", "UAT", "Agile"],
        outcomes: ["Build KPI dashboards", "Run UAT effectively"],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Strategy",
        courseCount: 5,
        duration: "6–8 weeks",
        focus: "Advanced problem-solving, prioritization, and leadership.",
        courses: [
          {
            id: 12,
            name: "Prioritization Frameworks (RICE/MoSCoW)",
            duration: "1 week",
            icon: <Star className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "Risk Management",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Data Storytelling",
            duration: "1 week",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Change Management",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "BA Capstone: End-to-End Case Study",
            duration: "2 weeks",
            icon: <Award className="w-4 h-4" />,
          },
        ],
        modules: ["Prioritization", "Risk", "Storytelling", "Delivery"],
        outcomes: [
          "Lead analysis for projects",
          "Present executive-ready insights",
        ],
      },
    ],
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    icon: <Globe className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 18,
    estimatedMonths: "4–6 months",
    summary:
      "Learn performance marketing, content strategy, and analytics to grow products and brands.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Foundations",
        courseCount: 6,
        duration: "5–7 weeks",
        focus: "Core channels, content basics, and marketing fundamentals.",
        courses: [
          {
            id: 1,
            name: "Marketing Fundamentals",
            duration: "1 week",
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Branding & Positioning",
            duration: "1 week",
            icon: <Star className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Content Strategy Basics",
            duration: "1 week",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Social Media Fundamentals",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Email Marketing Basics",
            duration: "1 week",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            id: 6,
            name: "Marketing Analytics Intro",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ],
        modules: ["Fundamentals", "Content", "Social", "Email", "Analytics"],
        outcomes: ["Create simple marketing plans", "Build content calendars"],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Performance",
        courseCount: 6,
        duration: "6–8 weeks",
        focus: "SEO, ads, landing pages, and conversion.",
        courses: [
          {
            id: 7,
            name: "SEO Fundamentals",
            duration: "2 weeks",
            icon: <Search className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Google Ads / Paid Search Basics",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Meta Ads / Paid Social Basics",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Landing Pages & Copywriting",
            duration: "1 week",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: 11,
            name: "Conversion Rate Optimization (CRO)",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Analytics & Attribution",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ],
        modules: ["SEO", "Paid Ads", "Landing Pages", "CRO", "Attribution"],
        outcomes: ["Run basic campaigns", "Track conversions and KPIs"],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Growth",
        courseCount: 6,
        duration: "6–8 weeks",
        focus: "Growth loops, experiments, and scaling.",
        courses: [
          {
            id: 13,
            name: "Growth Experiments & A/B Testing",
            duration: "1 week",
            icon: <TestTube className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Marketing Automation",
            duration: "1 week",
            icon: <Settings className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Funnel & Cohort Analysis",
            duration: "1 week",
            icon: <LineChart className="w-4 h-4" />,
          },
          {
            id: 16,
            name: "Community & Partnerships",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 17,
            name: "Budgeting & CAC/LTV",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 18,
            name: "Capstone: Launch a Campaign",
            duration: "2 weeks",
            icon: <Rocket className="w-4 h-4" />,
          },
        ],
        modules: ["Experimentation", "Automation", "Analytics", "Scaling"],
        outcomes: ["Design growth strategies", "Scale marketing with data"],
      },
    ],
  },
  {
    id: "hr-recruiter",
    name: "HR & Talent Acquisition",
    icon: <Users className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 15,
    estimatedMonths: "3–5 months",
    summary:
      "Build hiring and people-ops skills: sourcing, interviewing, onboarding, and HR operations.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – HR Basics",
        courseCount: 5,
        duration: "4–6 weeks",
        focus: "Core HR and recruitment fundamentals.",
        courses: [
          {
            id: 1,
            name: "HR Foundations",
            duration: "1 week",
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "Job Descriptions & Role Design",
            duration: "1 week",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Candidate Sourcing Basics",
            duration: "1 week",
            icon: <Search className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Screening & Shortlisting",
            duration: "1 week",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Interview Scheduling & Candidate Experience",
            duration: "1 week",
            icon: <Calendar className="w-4 h-4" />,
          },
        ],
        modules: ["HR Basics", "Sourcing", "Screening", "Candidate Experience"],
        outcomes: ["Create job descriptions", "Run basic recruitment pipeline"],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Hiring",
        courseCount: 5,
        duration: "5–7 weeks",
        focus: "Interviewing, assessment, and offer management.",
        courses: [
          {
            id: 6,
            name: "Behavioral Interviewing",
            duration: "1 week",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            id: 7,
            name: "Technical Hiring Basics (non-coding)",
            duration: "1 week",
            icon: <Code className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Offer & Negotiation",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "Onboarding Programs",
            duration: "1 week",
            icon: <Rocket className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Recruiting Metrics (Time-to-hire, Quality)",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ],
        modules: [
          "Interviewing",
          "Assessments",
          "Offers",
          "Onboarding",
          "Metrics",
        ],
        outcomes: ["Run structured interviews", "Track recruiting KPIs"],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – People Ops",
        courseCount: 5,
        duration: "5–7 weeks",
        focus: "Policies, performance systems, and culture.",
        courses: [
          {
            id: 11,
            name: "HR Policies & Compliance Basics",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Performance Management",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "Employee Engagement",
            duration: "1 week",
            icon: <Heart className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Workforce Planning",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Capstone: Hiring + People Ops Playbook",
            duration: "2 weeks",
            icon: <Award className="w-4 h-4" />,
          },
        ],
        modules: ["Compliance", "Performance", "Engagement", "Planning"],
        outcomes: ["Design HR processes", "Build scalable hiring operations"],
      },
    ],
  },
  {
    id: "customer-success",
    name: "Customer Success",
    icon: <MessageSquare className="w-6 h-6" />,
    levelCount: 3,
    totalCourses: 15,
    estimatedMonths: "3–5 months",
    summary:
      "Learn SaaS customer onboarding, retention, and support workflows to drive growth.",
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – CS Basics",
        courseCount: 5,
        duration: "4–6 weeks",
        focus: "Customer success fundamentals and communication.",
        courses: [
          {
            id: 1,
            name: "Customer Success Fundamentals",
            duration: "1 week",
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            id: 2,
            name: "SaaS Product Understanding",
            duration: "1 week",
            icon: <Layers className="w-4 h-4" />,
          },
          {
            id: 3,
            name: "Professional Communication",
            duration: "1 week",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            id: 4,
            name: "Ticketing & Support Basics",
            duration: "1 week",
            icon: <Bell className="w-4 h-4" />,
          },
          {
            id: 5,
            name: "Customer Onboarding Essentials",
            duration: "1 week",
            icon: <Rocket className="w-4 h-4" />,
          },
        ],
        modules: ["CS Basics", "Support", "Onboarding", "Communication"],
        outcomes: ["Handle customer queries", "Run onboarding calls"],
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Retention",
        courseCount: 5,
        duration: "5–7 weeks",
        focus: "Retention workflows and customer health.",
        courses: [
          {
            id: 6,
            name: "Customer Health Scores",
            duration: "1 week",
            icon: <Activity className="w-4 h-4" />,
          },
          {
            id: 7,
            name: "Renewals & Retention",
            duration: "1 week",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: 8,
            name: "Handling Escalations",
            duration: "1 week",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 9,
            name: "CS Playbooks & SOPs",
            duration: "1 week",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: 10,
            name: "Customer Success Metrics",
            duration: "1 week",
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ],
        modules: ["Health", "Retention", "Escalations", "Playbooks", "Metrics"],
        outcomes: ["Reduce churn", "Run CS processes"],
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Expansion",
        courseCount: 5,
        duration: "5–7 weeks",
        focus: "Account growth and strategic customer management.",
        courses: [
          {
            id: 11,
            name: "Upsell/Cross-sell Basics",
            duration: "1 week",
            icon: <Target className="w-4 h-4" />,
          },
          {
            id: 12,
            name: "Customer QBRs",
            duration: "1 week",
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            id: 13,
            name: "Stakeholder Management (Enterprise)",
            duration: "1 week",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 14,
            name: "Customer Advocacy & Community",
            duration: "1 week",
            icon: <Network className="w-4 h-4" />,
          },
          {
            id: 15,
            name: "Capstone: CS Portfolio",
            duration: "2 weeks",
            icon: <Award className="w-4 h-4" />,
          },
        ],
        modules: ["Expansion", "QBRs", "Enterprise", "Advocacy"],
        outcomes: ["Drive expansion", "Manage strategic accounts"],
      },
    ],
  },
];

// ------------------------------------------------------------
// Mega catalog: generates many domains (technical + non-technical)
// ------------------------------------------------------------
// Each generated track uses the SAME UI + same “View Roadmap” modal.
// This keeps the Roadmap page maintainable even with 80+ domains.
const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const makeCourse = (id, name, duration, icon) => ({
  id,
  name,
  duration,
  icon,
});

const pickTemplateKey = (name, category) => {
  const key = slugify(name);

  // Exact matches first (prevents keyword collisions)
  const exact = {
    aws: "aws",
    "microsoft-azure": "azure",
    "google-cloud-platform-gcp": "gcp",
    devops: "devops",
    mlops: "mlops",
    "site-reliability-engineering-sre": "sre",
    "data-science": "data-science",
    "data-analytics": "data-analytics",
    "big-data-engineering": "big-data",
    "machine-learning-ml": "machine-learning",
    "deep-learning": "deep-learning",
    "natural-language-processing-nlp": "nlp",
    "computer-vision": "computer-vision",
    "cyber-security": "cyber-security",
    "ethical-hacking": "ethical-hacking",
    "network-security": "network-security",
    "blockchain-technology": "blockchain",
    cryptography: "cryptography",
    "web-development": "web-dev",
    "frontend-development": "frontend-dev",
    "backend-development": "backend-dev",
    "full-stack-development": "fullstack-dev",
    "mobile-app-development": "mobile-dev",
    "android-development": "android",
    "ios-development": "ios",
    "desktop-application-development": "desktop",
    "digital-marketing": "digital-marketing",
    "seo-sem": "seo",
    "content-marketing": "content-marketing",
    "social-media-marketing": "social-media",
    "sales-crm": "sales-crm",
    "business-analysis": "business-analysis",
    "project-management": "project-management",
    "product-management": "product-management",
    "human-resources-hr": "hr",
    "talent-acquisition": "talent-acquisition",
    "technical-writing": "technical-writing",
    copywriting: "copywriting",
    blogging: "blogging",
    journalism: "journalism",
    banking: "banking",
    "financial-analysis": "financial-analysis",
    fintech: "fintech",
    "investment-banking": "investment-banking",
    "accounting-auditing": "accounting",
    "corporate-law": "corporate-law",
    "cyber-law": "cyber-law",
    "public-administration": "public-administration",
    "mechanical-engineering": "mechanical-engineering",
    "civil-engineering": "civil-engineering",
    "electrical-engineering": "electrical-engineering",
    "electronics-communication": "electronics-communication",
    "aerospace-engineering": "aerospace-engineering",
    "graphic-designing": "graphic-design",
    "ui-ux-designing": "ui-ux",
    animation: "animation",
    "video-editing": "video-editing",
    teaching: "teaching",
    edtech: "edtech",
    "startup-entrepreneurship": "startup",
    consulting: "consulting",
    "freelance-development": "freelance-dev",
    "freelance-designing": "freelance-design",
    "freelance-writing": "freelance-writing",
    "online-tutoring": "online-tutoring",
    "influencer-marketing": "influencer-marketing",
  };
  if (exact[key]) return exact[key];

  // Keyword-based selection
  if (key.includes("cloud-computing")) return "cloud-computing";
  if (key.includes("aws")) return "aws";
  if (key.includes("azure")) return "azure";
  if (key.includes("gcp") || key.includes("google-cloud")) return "gcp";
  if (key.includes("devops")) return "devops";
  if (key.includes("mlops")) return "mlops";
  if (key.includes("sre") || key.includes("reliability")) return "sre";

  if (key.includes("data-science")) return "data-science";
  if (key.includes("analytics")) return "data-analytics";
  if (key.includes("big-data")) return "big-data";
  if (key.includes("machine-learning") || key === "ml")
    return "machine-learning";
  if (key.includes("deep-learning")) return "deep-learning";
  if (key.includes("nlp") || key.includes("language-processing")) return "nlp";
  if (key.includes("computer-vision") || key.includes("vision"))
    return "computer-vision";
  if (key.includes("artificial-intelligence") || key === "ai") return "ai";

  if (key.includes("cyber") || key.includes("security"))
    return "cyber-security";
  if (key.includes("hacking")) return "ethical-hacking";
  if (key.includes("blockchain")) return "blockchain";
  if (key.includes("cryptography") || key.includes("crypto"))
    return "cryptography";

  if (key.includes("operating-systems") || key === "os")
    return "operating-systems";
  if (key.includes("computer-networks")) return "computer-networks";
  if (key.includes("database-management-systems") || key.includes("dbms"))
    return "dbms";
  if (key.includes("distributed-systems")) return "distributed-systems";
  if (key.includes("software-engineering")) return "software-engineering";
  if (key.includes("compiler-design")) return "compiler-design";
  if (key.includes("internet-of-things") || key === "iot") return "iot";
  if (key.includes("embedded-systems")) return "embedded-systems";
  if (key.includes("robotics")) return "robotics";
  if (key.includes("quantum-computing")) return "quantum-computing";
  if (key.includes("edge-computing")) return "edge-computing";

  if (key.includes("frontend")) return "frontend-dev";
  if (key.includes("backend")) return "backend-dev";
  if (key.includes("full-stack") || key.includes("fullstack"))
    return "fullstack-dev";
  if (key.includes("mobile") || key.includes("app-development"))
    return "mobile-dev";
  if (key.includes("android")) return "android";
  if (key.includes("ios")) return "ios";
  if (key.includes("web")) return "web-dev";

  if (key.includes("marketing")) return "digital-marketing";
  if (key.includes("seo") || key.includes("sem")) return "seo";
  if (key.includes("content")) return "content-marketing";
  if (key.includes("social-media")) return "social-media";
  if (key.includes("sales") || key.includes("crm")) return "sales-crm";

  if (key.includes("business-analysis") || key.includes("business-analyst"))
    return "business-analysis";
  if (key.includes("project-management")) return "project-management";
  if (key.includes("product-management") || key.includes("product"))
    return "product-management";
  if (key.includes("human-resources") || key === "hr") return "hr";
  if (key.includes("talent")) return "talent-acquisition";
  if (key.includes("writing")) return "technical-writing";

  if (key.includes("bank")) return "banking";
  if (key.includes("finance") || key.includes("financial"))
    return "financial-analysis";
  if (key.includes("fintech")) return "fintech";
  if (key.includes("investment")) return "investment-banking";
  if (key.includes("account")) return "accounting";
  if (key.includes("law")) return "corporate-law";

  if (key.includes("engineering")) return "engineering";
  if (key.includes("graphic")) return "graphic-design";
  if (key.includes("ui") || key.includes("ux")) return "ui-ux";
  if (key.includes("video")) return "video-editing";
  if (key.includes("teach") || key.includes("training")) return "teaching";
  if (key.includes("startup") || key.includes("entrepreneur")) return "startup";

  if (category === "Freelancing") return "freelancing";

  // Default: category-level template
  if (category === "Non-Technical") return "non-technical";
  if (category === "Professional / Career Domains") return "professional";
  return "technical";
};

const buildDomainCoursePlan = (name, category) => {
  const templateKey = pickTemplateKey(name, category);
  const displayName = name;

  const templates = {
    ai: {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "AI basics, problem framing, and responsible AI foundations.",
        intermediate:
          "Core ML concepts, evaluation, and practical AI workflows.",
        advanced: "Applied AI systems, safety, and an end-to-end AI capstone.",
      },
      modules: {
        beginner: ["AI Basics", "Problem Framing", "Ethics", "Mini Project"],
        intermediate: ["ML Basics", "Data", "Evaluation", "Project"],
        advanced: ["AI Systems", "Safety", "Deployment", "Capstone"],
      },
      outcomes: {
        beginner: ["Explain AI vs ML", "Frame problems correctly"],
        intermediate: ["Train and evaluate models", "Avoid common pitfalls"],
        advanced: ["Build an AI feature end-to-end", "Present a capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "AI Fundamentals (What/Why/How)",
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Problem Framing + Metrics",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Responsible AI + Bias Basics",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: AI Use-Case Pitch",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "ML Foundations",
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Data Preparation + Feature Basics",
            "1 week",
            <Database className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Evaluation + Error Analysis",
            "1 week",
            <CheckCircle2 className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: AI Workflow",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "AI System Design Basics",
            "1 week",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Safety + Guardrails",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Deployment Basics",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: AI Feature",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "deep-learning": {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "Neural network fundamentals and training basics.",
        intermediate:
          "CNNs/RNNs, optimization tricks, and modern architectures.",
        advanced:
          "Transformers, experimentation, and a deep learning capstone.",
      },
      modules: {
        beginner: ["NN Basics", "Backprop", "Training", "Mini Model"],
        intermediate: ["CNN", "Sequence Models", "Optimization", "Project"],
        advanced: ["Transformers", "Scaling", "Deployment", "Capstone"],
      },
      outcomes: {
        beginner: ["Train a small neural network", "Understand backprop"],
        intermediate: ["Build CNN models", "Apply regularization + tuning"],
        advanced: ["Use transformer models", "Deliver a DL capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Neural Networks Fundamentals",
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Backpropagation + Gradients",
            "1 week",
            <Cpu className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Training Loops (PyTorch/TensorFlow)",
            "1 week",
            <FileCode className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Dense Network",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "CNNs + Image Features",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Sequence Models (RNN/LSTM)",
            "1 week",
            <MessageSquare className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Regularization + Augmentation",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: CNN Classifier",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Transformers Basics",
            "1 week",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Experiment Tracking + Reproducibility",
            "1 week",
            <GitBranch className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Deployment + Inference Optimization",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Deep Learning System",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    nlp: {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "Text preprocessing and classic NLP basics.",
        intermediate: "Embeddings and transformer-based NLP.",
        advanced: "Fine-tuning, evaluation, and an NLP capstone project.",
      },
      modules: {
        beginner: [
          "Text Basics",
          "Preprocessing",
          "Classic NLP",
          "Mini Project",
        ],
        intermediate: ["Embeddings", "Transformers", "Pipelines", "Project"],
        advanced: ["Fine-tuning", "Evaluation", "Deployment", "Capstone"],
      },
      outcomes: {
        beginner: ["Clean and tokenize text", "Build baseline NLP features"],
        intermediate: ["Use embeddings/transformers", "Build NLP pipeline"],
        advanced: ["Fine-tune models", "Deliver NLP capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Text Preprocessing + Tokenization",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Classic NLP (TF-IDF, Naive Bayes)",
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Evaluation for NLP",
            "1 week",
            <CheckCircle2 className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Sentiment Classifier",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Word Embeddings",
            "1 week",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Transformers for NLP",
            "1 week",
            <Cpu className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "NER + Text Classification",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: NLP Pipeline",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Fine-tuning + Prompting Basics",
            "1 week",
            <MessageSquare className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Dataset Quality + Bias",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Deployment + Monitoring",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: NLP Application",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "computer-vision": {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "Image fundamentals, OpenCV basics, and datasets.",
        intermediate: "CNNs for vision, detection/segmentation basics.",
        advanced: "Production vision pipelines and a CV capstone.",
      },
      modules: {
        beginner: ["Images", "OpenCV", "Datasets", "Mini Project"],
        intermediate: ["CNN", "Detection", "Segmentation", "Project"],
        advanced: ["Pipelines", "Optimization", "Deployment", "Capstone"],
      },
      outcomes: {
        beginner: ["Manipulate images", "Build a simple CV tool"],
        intermediate: [
          "Train CNN vision models",
          "Understand detection basics",
        ],
        advanced: ["Ship a CV pipeline", "Deliver CV capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Image Fundamentals + Formats",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "OpenCV Basics",
            "1 week",
            <Monitor className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Datasets + Labeling Basics",
            "1 week",
            <Database className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Image Tool",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "CNNs for Vision",
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Object Detection Basics",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Segmentation Basics",
            "1 week",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Detector/Classifier",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Augmentation + Robustness",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Inference Optimization",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Deployment (API + GPU Basics)",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Vision App",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "cloud-computing": {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Cloud fundamentals, IAM, and core services.",
        intermediate: "Networking, deployments, and managed services.",
        advanced: "Architecture, security, and cost optimization.",
      },
      modules: {
        beginner: ["Cloud Basics", "IAM", "Compute/Storage", "Mini Deploy"],
        intermediate: ["Networking", "Databases", "Deployments", "Project"],
        advanced: ["Architecture", "Security", "Cost", "Capstone"],
      },
      outcomes: {
        beginner: ["Explain cloud models", "Deploy a basic service"],
        intermediate: ["Design a simple cloud app", "Use managed services"],
        advanced: ["Create architectures", "Operate securely and cheaply"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Cloud Fundamentals",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Identity + Access (IAM)",
            "1 week",
            <Lock className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Compute + Storage Basics",
            "1 week",
            <Server className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Deploy Static Site",
            "1 week",
            <Globe className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Networking (VPC/VNET)",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Managed Databases",
            "1 week",
            <Database className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Deployments + CI/CD Basics",
            "1 week",
            <Settings className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Cloud Web App",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Security Best Practices",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Monitoring + Alerts",
            "1 week",
            <Bell className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Cost Optimization",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Cloud Architecture",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "cyber-security": {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Security fundamentals, threats, and basic defenses.",
        intermediate: "Web security, monitoring, and hands-on tooling.",
        advanced: "Incident response, hardening, and a security capstone.",
      },
      modules: {
        beginner: ["Threats", "Basics", "Hygiene", "Mini Lab"],
        intermediate: ["Web Security", "Network", "Monitoring", "Project"],
        advanced: ["IR", "Hardening", "Policy", "Capstone"],
      },
      outcomes: {
        beginner: ["Understand common threats", "Apply basic security hygiene"],
        intermediate: ["Test web apps", "Use monitoring tools"],
        advanced: ["Respond to incidents", "Deliver a security capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Security Fundamentals",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Threat Modeling Basics",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Authentication + Password Hygiene",
            "1 week",
            <Lock className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Lab: Secure Configuration",
            "1 week",
            <Wrench className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Web Security (OWASP)",
            "1 week",
            <FileCode className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Network Security Basics",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Logging + Monitoring",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Security Review",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Incident Response Basics",
            "1 week",
            <Bell className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Hardening + Patch Mgmt",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Security Policies + Risk",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Secure System",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    dbms: {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Relational fundamentals, SQL, and modeling.",
        intermediate: "Indexing, transactions, and query optimization.",
        advanced: "Scaling, replication, and a database capstone.",
      },
      modules: {
        beginner: ["Relational Basics", "SQL", "Modeling", "Mini DB"],
        intermediate: ["Indexes", "Transactions", "Optimization", "Project"],
        advanced: ["Scaling", "Replication", "Reliability", "Capstone"],
      },
      outcomes: {
        beginner: ["Write SQL queries", "Design schemas"],
        intermediate: ["Understand transactions", "Optimize queries"],
        advanced: ["Design scalable DBs", "Deliver DB capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Relational Model + ER Diagrams",
            "1 week",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "SQL (SELECT/JOIN/GROUP BY)",
            "1 week",
            <Database className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Normalization",
            "1 week",
            <CheckCircle2 className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Schema Design",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Indexing + Query Plans",
            "1 week",
            <Search className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Transactions + ACID",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Stored Procedures + Constraints",
            "1 week",
            <FileCode className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Optimized Queries",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Replication + Backup",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Sharding Basics",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Performance Tuning",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Data System",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "operating-systems": {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Processes, threads, and basic OS concepts.",
        intermediate: "Memory management, scheduling, and file systems.",
        advanced: "Concurrency, performance, and systems capstone.",
      },
      modules: {
        beginner: ["Processes", "Threads", "Syscalls", "Mini Lab"],
        intermediate: ["Memory", "Scheduling", "File Systems", "Project"],
        advanced: ["Concurrency", "Performance", "Debugging", "Capstone"],
      },
      outcomes: {
        beginner: ["Explain process lifecycle", "Use basic system tools"],
        intermediate: ["Understand memory", "Explain scheduling"],
        advanced: ["Debug concurrency", "Deliver OS capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Processes + Threads",
            "1 week",
            <Cpu className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "System Calls + Shell",
            "1 week",
            <Terminal className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Synchronization Basics",
            "1 week",
            <Lock className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Lab: Process Monitor",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "CPU Scheduling",
            "1 week",
            <Calendar className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Memory Management",
            "1 week",
            <Database as DbIcon className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "File Systems",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Threaded Program",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Concurrency Debugging",
            "1 week",
            <Search className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Performance Tools",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "OS Security Basics",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Systems Project",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "computer-networks": {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Networking basics: TCP/IP, DNS, HTTP.",
        intermediate: "Routing, switching, and troubleshooting.",
        advanced: "Network security and performance projects.",
      },
      modules: {
        beginner: ["TCP/IP", "DNS", "HTTP", "Mini Lab"],
        intermediate: ["Routing", "Switching", "WiFi", "Project"],
        advanced: ["Security", "Performance", "Monitoring", "Capstone"],
      },
      outcomes: {
        beginner: ["Explain TCP/IP", "Understand HTTP"],
        intermediate: ["Troubleshoot networks", "Use tooling"],
        advanced: ["Secure networks", "Deliver networking capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "TCP/IP Fundamentals",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "DNS + HTTP Basics",
            "1 week",
            <Globe className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Network Tools (ping/traceroute)",
            "1 week",
            <Terminal className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Lab: Local Network",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Routing + Subnetting",
            "1 week",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Switching + VLANs",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Troubleshooting Workflow",
            "1 week",
            <Search className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Network Diagram",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Network Security Basics",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Monitoring + Logs",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Performance + Latency",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Secure Network",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "web-dev": {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "HTML, CSS, JavaScript and basic web fundamentals.",
        intermediate: "Frontend + backend basics and working with APIs.",
        advanced:
          "Deployment, performance, security basics, and a full project.",
      },
      modules: {
        beginner: ["HTML", "CSS", "JavaScript", "Mini Website"],
        intermediate: ["APIs", "Auth Basics", "Database Basics", "Project"],
        advanced: ["Performance", "Security", "Deployment", "Capstone"],
      },
      outcomes: {
        beginner: ["Build responsive pages", "Understand JS DOM basics"],
        intermediate: ["Build a basic full app", "Consume REST APIs"],
        advanced: ["Ship a portfolio web app", "Deploy and monitor"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "HTML5 + Semantic Web",
            "1 week",
            <FileCode className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "CSS Layouts (Flexbox/Grid)",
            "1 week",
            <Palette className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "JavaScript Core (ES6+)",
            "2 weeks",
            <Code className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Responsive Website",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "HTTP + REST APIs",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Backend Basics + CRUD",
            "2 weeks",
            <Server className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Database Basics (SQL)",
            "1 week",
            <Database className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Web App with Auth",
            "2 weeks",
            <Shield className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Performance + Caching",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Security Essentials (OWASP)",
            "1 week",
            <Lock className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Deployment + CI/CD Basics",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Production Web App",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "frontend-dev": {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "HTML/CSS/JS for UI building.",
        intermediate: "React + routing + state management.",
        advanced: "Performance, testing, and production UI systems.",
      },
      modules: {
        beginner: ["HTML", "CSS", "JS", "Mini UI"],
        intermediate: ["React", "Routing", "State", "APIs"],
        advanced: ["Performance", "Testing", "CI/CD", "Capstone"],
      },
      outcomes: {
        beginner: ["Build responsive UI", "Write clean JS"],
        intermediate: ["Build React SPA", "Integrate APIs"],
        advanced: ["Ship production UI", "Write tests"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "HTML + Accessibility Basics",
            "1 week",
            <Globe className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "CSS + Responsive UI",
            "1 week",
            <Smartphone className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "JavaScript for UI (DOM)",
            "2 weeks",
            <Code className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Landing Page",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "React Fundamentals",
            "2 weeks",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "State + Hooks Patterns",
            "1 week",
            <Settings className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Routing + Navigation",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "API Integration + Error Handling",
            "1 week",
            <Server className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Performance + Bundle Optimization",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Testing (Jest/RTL)",
            "2 weeks",
            <CheckCircle2 className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "UI Design Systems + Reuse",
            "1 week",
            <Palette className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: SaaS Dashboard",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "backend-dev": {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "APIs, HTTP, and database basics.",
        intermediate: "Authentication, authorization, and services.",
        advanced: "Scaling, observability, and production deployment.",
      },
      modules: {
        beginner: ["HTTP", "REST", "DB", "CRUD"],
        intermediate: ["Auth", "Caching", "Queues", "Services"],
        advanced: ["Scaling", "Observability", "Security", "Capstone"],
      },
      outcomes: {
        beginner: ["Build CRUD APIs", "Use SQL databases"],
        intermediate: ["Implement auth", "Design service boundaries"],
        advanced: ["Deploy backend", "Monitor and scale"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "HTTP + REST API Design",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Database Basics (SQL)",
            "1 week",
            <Database className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "CRUD + Validation",
            "1 week",
            <FileCode className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: API + DB",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Authentication (JWT/Sessions)",
            "1 week",
            <Lock className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Authorization + RBAC",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Caching + Rate Limiting",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Service + Auth",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Observability (Logs/Metrics)",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Scaling Patterns",
            "1 week",
            <TrendingUp className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Secure APIs (OWASP)",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Production Backend",
            "2 weeks",
            <Rocket className="w-4 h-4" />
          ),
        ],
      },
    },
    "data-science": {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "Python, data cleaning, and basic statistics.",
        intermediate: "EDA, modeling, and storytelling.",
        advanced: "Model evaluation, deployment basics, and a DS capstone.",
      },
      modules: {
        beginner: ["Python", "Pandas", "Stats", "Mini Analysis"],
        intermediate: ["EDA", "Models", "Visualization", "Dashboard"],
        advanced: ["Evaluation", "Experimentation", "Deployment", "Capstone"],
      },
      outcomes: {
        beginner: ["Clean and analyze datasets", "Compute basic stats"],
        intermediate: ["Build predictive models", "Present insights"],
        advanced: ["Evaluate models", "Deliver DS capstone"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Python for Data",
            "1 week",
            <Code className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Data Cleaning (Pandas)",
            "1 week",
            <Database className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Statistics Fundamentals",
            "1 week",
            <LineChart className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Data Report",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Exploratory Data Analysis",
            "1 week",
            <Search className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Supervised Learning Basics",
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Visualization + Storytelling",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: DS Dashboard",
            "2 weeks",
            <Monitor className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Model Evaluation + Metrics",
            "1 week",
            <CheckCircle2 className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Experiment Tracking Basics",
            "1 week",
            <GitBranch className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Intro to Deployment",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: End-to-End DS",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "machine-learning": {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: "ML foundations, datasets, and baselines.",
        intermediate: "Feature engineering and model training.",
        advanced: "Tuning, evaluation, and a production-style project.",
      },
      modules: {
        beginner: ["ML Basics", "Data", "Baselines", "Mini Model"],
        intermediate: ["Features", "Training", "Validation", "Project"],
        advanced: ["Tuning", "Pipelines", "Monitoring", "Capstone"],
      },
      outcomes: {
        beginner: ["Explain ML workflow", "Train a baseline model"],
        intermediate: ["Improve features", "Avoid leakage"],
        advanced: ["Tune models", "Deliver ML project"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "ML Workflow + Problem Framing",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Data Splits + Leakage",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Regression + Classification",
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Baseline Model",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Feature Engineering",
            "1 week",
            <Wrench className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Model Training + CV",
            "1 week",
            <CheckCircle2 className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Imbalanced Data + Metrics",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: ML Pipeline",
            "2 weeks",
            <GitBranch className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Hyperparameter Tuning",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Model Explainability",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Monitoring + Drift Basics",
            "1 week",
            <Bell className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: ML in Production",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    devops: {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Linux, Git, and automation basics.",
        intermediate: "CI/CD pipelines and containers.",
        advanced: "IaC, monitoring, and reliability practices.",
      },
      modules: {
        beginner: ["Linux", "Git", "Scripting", "Mini Automation"],
        intermediate: ["CI/CD", "Containers", "Deployments", "Project"],
        advanced: ["IaC", "Monitoring", "Incident", "Capstone"],
      },
      outcomes: {
        beginner: ["Use Linux effectively", "Automate simple tasks"],
        intermediate: ["Build CI/CD", "Deploy containers"],
        advanced: ["Operate reliably", "Implement IaC"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Linux + Shell Basics",
            "1 week",
            <Terminal className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Git Workflow",
            "1 week",
            <GitBranch className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Automation with Scripts",
            "1 week",
            <Wrench className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Automation",
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "CI/CD Pipelines",
            "1 week",
            <Settings className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Docker Fundamentals",
            "1 week",
            <Server className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Deployment Strategies",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Deploy an App",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Infrastructure as Code",
            "1 week",
            <FileCode className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Observability Basics",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Reliability Practices",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: DevOps System",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    aws: {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Core AWS services and IAM basics.",
        intermediate: "Deploying apps on AWS with networking.",
        advanced: "Security, monitoring, and architecture patterns.",
      },
      modules: {
        beginner: ["IAM", "Compute", "Storage", "Mini Deploy"],
        intermediate: ["VPC", "Databases", "Scaling", "Project"],
        advanced: ["Security", "Monitoring", "Cost", "Capstone"],
      },
      outcomes: {
        beginner: ["Understand AWS basics", "Deploy a simple service"],
        intermediate: ["Build VPC app", "Use managed databases"],
        advanced: ["Design architectures", "Operate securely"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "AWS Fundamentals + Console",
            "1 week",
            <Cloud className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "IAM Essentials",
            "1 week",
            <Lock className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Compute + Storage (EC2/S3)",
            "1 week",
            <Server className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Static Site on S3",
            "1 week",
            <Globe className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "VPC + Networking",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Managed Databases (RDS)",
            "1 week",
            <Database className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Scaling + Load Balancing",
            "1 week",
            <TrendingUp className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Web App on AWS",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Security Best Practices",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Monitoring (CloudWatch)",
            "1 week",
            <Bell className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Cost Optimization Basics",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Cloud Architecture",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "digital-marketing": {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Marketing fundamentals and channels.",
        intermediate: "Campaign planning and analytics.",
        advanced: "Optimization, funnels, and a full campaign case.",
      },
      modules: {
        beginner: ["Basics", "Channels", "Content", "Mini Campaign"],
        intermediate: ["Ads", "Analytics", "SEO", "Project"],
        advanced: ["Funnels", "CRO", "Retention", "Capstone"],
      },
      outcomes: {
        beginner: ["Explain key channels", "Create basic content plan"],
        intermediate: ["Run campaigns", "Track KPIs"],
        advanced: ["Optimize funnels", "Build marketing portfolio"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Marketing Fundamentals",
            "1 week",
            <BookOpen className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Audience + Positioning",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Content Strategy Basics",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Content Calendar",
            "1 week",
            <Calendar className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Paid Ads Basics",
            "1 week",
            <TrendingUp className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Google Analytics Basics",
            "1 week",
            <LineChart className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "SEO Fundamentals",
            "1 week",
            <Search className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Campaign Report",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Funnel Design + CRO",
            "1 week",
            <Zap className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Email + Lifecycle Marketing",
            "1 week",
            <MessageSquare className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "A/B Testing Basics",
            "1 week",
            <TestTube className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Full Go-to-Market",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "financial-analysis": {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: "Financial statements and fundamentals.",
        intermediate: "Modeling and analysis.",
        advanced: "Valuation and case-style projects.",
      },
      modules: {
        beginner: ["Statements", "Basics", "Ratios", "Mini Case"],
        intermediate: ["Modeling", "Forecasting", "KPIs", "Project"],
        advanced: ["Valuation", "Sensitivity", "Pitch", "Capstone"],
      },
      outcomes: {
        beginner: ["Read statements", "Compute ratios"],
        intermediate: ["Build financial models", "Forecast basics"],
        advanced: ["Perform valuation", "Present investment case"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Accounting Basics",
            "1 week",
            <BookOpen className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Financial Statements",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Ratio Analysis",
            "1 week",
            <LineChart className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Company Snapshot",
            "1 week",
            <Briefcase className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Excel/Sheets Modeling",
            "1 week",
            <Settings className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Forecasting Basics",
            "1 week",
            <TrendingUp className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "KPI Dashboards",
            "1 week",
            <BarChart3 className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Financial Model",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Valuation (DCF Basics)",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Sensitivity Analysis",
            "1 week",
            <TestTube className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Investment Memo Writing",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Full Case Study",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    "technical-writing": {
      estimatedMonths: "2–3 months",
      focus: {
        beginner: "Clear writing principles and structure.",
        intermediate: "Docs, guides, and information architecture.",
        advanced: "API docs and a portfolio documentation set.",
      },
      modules: {
        beginner: ["Basics", "Clarity", "Examples", "Mini Doc"],
        intermediate: ["Structure", "Docs", "Screenshots", "Project"],
        advanced: ["API Docs", "Style Guides", "Review", "Capstone"],
      },
      outcomes: {
        beginner: ["Write clearly", "Create a simple guide"],
        intermediate: ["Write product docs", "Create structured tutorials"],
        advanced: ["Write API docs", "Build a writing portfolio"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Writing for Clarity",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Docs Structure + Templates",
            "1 week",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Examples + Diagrams",
            "1 week",
            <FileCode className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: How-to Guide",
            "1 week",
            <Award className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Information Architecture",
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Tutorial Writing",
            "1 week",
            <BookOpen className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "Editing + Review Workflow",
            "1 week",
            <CheckCircle2 className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Product Documentation",
            "2 weeks",
            <Briefcase className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "API Documentation",
            "1 week",
            <Server className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Style Guides + Consistency",
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Docs UX + Search",
            "1 week",
            <Search className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Writing Portfolio",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    freelancing: {
      estimatedMonths: "2–3 months",
      focus: {
        beginner: "Profiles, proposals, and client communication basics.",
        intermediate: "Delivery systems and project execution.",
        advanced: "Scaling freelancing with pricing and retainers.",
      },
      modules: {
        beginner: ["Profile", "Proposals", "Communication", "Mini Pitch"],
        intermediate: ["Delivery", "Process", "Quality", "Project"],
        advanced: ["Pricing", "Retainers", "Growth", "Capstone"],
      },
      outcomes: {
        beginner: ["Create a profile", "Write proposals"],
        intermediate: ["Deliver projects", "Manage scope"],
        advanced: ["Price confidently", "Build repeatable system"],
      },
      courses: {
        base: [
          makeCourse(
            1,
            "Profile + Portfolio Setup",
            "1 week",
            <Users className="w-4 h-4" />
          ),
          makeCourse(
            2,
            "Proposal Writing",
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            3,
            "Client Communication",
            "1 week",
            <MessageSquare className="w-4 h-4" />
          ),
          makeCourse(
            4,
            "Mini Project: Pitch Pack",
            "1 week",
            <Award className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            "Project Scoping",
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            6,
            "Delivery Workflow",
            "1 week",
            <Settings className="w-4 h-4" />
          ),
          makeCourse(
            7,
            "QA + Handover",
            "1 week",
            <CheckCircle2 className="w-4 h-4" />
          ),
          makeCourse(
            8,
            "Project: Client-style Delivery",
            "2 weeks",
            <Briefcase className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            "Pricing + Negotiation",
            "1 week",
            <TrendingUp className="w-4 h-4" />
          ),
          makeCourse(
            10,
            "Retainers + Upsells",
            "1 week",
            <Star className="w-4 h-4" />
          ),
          makeCourse(
            11,
            "Personal Brand Basics",
            "1 week",
            <Globe className="w-4 h-4" />
          ),
          makeCourse(
            12,
            "Capstone: Freelance System",
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    // Category-level fallbacks
    "non-technical": {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: `Learn the foundations of ${displayName}.`,
        intermediate: `Practice real workflows in ${displayName}.`,
        advanced: `Build a portfolio-ready capstone in ${displayName}.`,
      },
      modules: {
        beginner: ["Fundamentals", "Tools", "Communication", "Mini Project"],
        intermediate: [
          "Workflows",
          "Best Practices",
          "Case Studies",
          "Portfolio",
        ],
        advanced: ["Advanced Topics", "Optimization", "Delivery", "Capstone"],
      },
      outcomes: {
        beginner: [
          `Understand ${displayName} basics`,
          `Complete a starter task`,
        ],
        intermediate: [
          `Apply ${displayName} in scenarios`,
          `Build a small portfolio piece`,
        ],
        advanced: [
          `Deliver a full capstone`,
          `Be job-ready for ${displayName}`,
        ],
      },
      courses: {
        base: [
          makeCourse(
            1,
            `${displayName} Fundamentals`,
            "1 week",
            <BookOpen className="w-4 h-4" />
          ),
          makeCourse(
            2,
            `Tools & Workflow`,
            "1 week",
            <Settings className="w-4 h-4" />
          ),
          makeCourse(
            3,
            `Communication + Stakeholders`,
            "1 week",
            <Users className="w-4 h-4" />
          ),
          makeCourse(
            4,
            `Mini Project`,
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            `Real-World Workflows`,
            "1 week",
            <Briefcase className="w-4 h-4" />
          ),
          makeCourse(
            6,
            `KPIs + Measurement`,
            "1 week",
            <LineChart className="w-4 h-4" />
          ),
          makeCourse(
            7,
            `Best Practices`,
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            8,
            `Portfolio Project`,
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            `Advanced Topics`,
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(10, `Optimization`, "1 week", <Zap className="w-4 h-4" />),
          makeCourse(
            11,
            `Strategy + Planning`,
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            12,
            `Capstone: End-to-End`,
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    professional: {
      estimatedMonths: "4–6 months",
      focus: {
        beginner: `Learn core fundamentals of ${displayName}.`,
        intermediate: `Apply ${displayName} through practice and cases.`,
        advanced: `Deliver a capstone aligned to ${displayName} roles.`,
      },
      modules: {
        beginner: ["Foundations", "Terminology", "Tools", "Mini Case"],
        intermediate: ["Processes", "Standards", "Case Work", "Project"],
        advanced: [
          "Advanced Concepts",
          "Compliance/Quality",
          "Delivery",
          "Capstone",
        ],
      },
      outcomes: {
        beginner: [`Understand ${displayName} basics`, `Complete a mini case`],
        intermediate: [`Apply workflows`, `Document outcomes`],
        advanced: [`Deliver capstone`, `Be career-ready`],
      },
      courses: {
        base: [
          makeCourse(
            1,
            `${displayName} Fundamentals`,
            "1 week",
            <BookOpen className="w-4 h-4" />
          ),
          makeCourse(
            2,
            `Core Processes`,
            "1 week",
            <Layers className="w-4 h-4" />
          ),
          makeCourse(
            3,
            `Standards + Ethics`,
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            4,
            `Mini Project: Case Note`,
            "1 week",
            <FileText className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            `Tools + Workflows`,
            "1 week",
            <Settings className="w-4 h-4" />
          ),
          makeCourse(
            6,
            `Applied Case Studies`,
            "1 week",
            <Briefcase className="w-4 h-4" />
          ),
          makeCourse(
            7,
            `Reporting + Documentation`,
            "1 week",
            <FileText className="w-4 h-4" />
          ),
          makeCourse(
            8,
            `Project: Practice Portfolio`,
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            `Advanced Topics`,
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            10,
            `Quality + Compliance Basics`,
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            11,
            `Career Readiness`,
            "1 week",
            <Briefcase className="w-4 h-4" />
          ),
          makeCourse(
            12,
            `Capstone: End-to-End`,
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
    technical: {
      estimatedMonths: "3–5 months",
      focus: {
        beginner: `Learn the foundations of ${displayName}.`,
        intermediate: `Build practical skill in ${displayName}.`,
        advanced: `Go deep and deliver a capstone in ${displayName}.`,
      },
      modules: {
        beginner: ["Fundamentals", "Tools", "Core Concepts", "Mini Project"],
        intermediate: [
          "Intermediate Skills",
          "Best Practices",
          "Case Studies",
          "Portfolio",
        ],
        advanced: ["Advanced Topics", "Scaling", "Optimization", "Capstone"],
      },
      outcomes: {
        beginner: [
          `Understand ${displayName} basics`,
          `Complete a starter project`,
        ],
        intermediate: [`Apply ${displayName}`, `Build a portfolio project`],
        advanced: [`Deliver capstone`, `Be job-ready`],
      },
      courses: {
        base: [
          makeCourse(
            1,
            `${displayName} Fundamentals`,
            "1 week",
            <BookOpen className="w-4 h-4" />
          ),
          makeCourse(
            2,
            `Tools & Workflow`,
            "1 week",
            <Settings className="w-4 h-4" />
          ),
          makeCourse(
            3,
            `Core Concepts`,
            "1 week",
            <Target className="w-4 h-4" />
          ),
          makeCourse(
            4,
            `Mini Project`,
            "1 week",
            <Rocket className="w-4 h-4" />
          ),
        ],
        intermediate: [
          makeCourse(
            5,
            `Intermediate Skills`,
            "1 week",
            <TrendingUp className="w-4 h-4" />
          ),
          makeCourse(
            6,
            `Best Practices`,
            "1 week",
            <Shield className="w-4 h-4" />
          ),
          makeCourse(
            7,
            `Case Studies`,
            "1 week",
            <Briefcase className="w-4 h-4" />
          ),
          makeCourse(
            8,
            `Portfolio Project`,
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
        advanced: [
          makeCourse(
            9,
            `Advanced Topics`,
            "1 week",
            <Brain className="w-4 h-4" />
          ),
          makeCourse(
            10,
            `Systems & Scaling`,
            "1 week",
            <Network className="w-4 h-4" />
          ),
          makeCourse(11, `Optimization`, "1 week", <Zap className="w-4 h-4" />),
          makeCourse(
            12,
            `Capstone: End-to-End`,
            "2 weeks",
            <Award className="w-4 h-4" />
          ),
        ],
      },
    },
  };

  return (
    templates[templateKey] ||
    templates[
      category === "Non-Technical"
        ? "non-technical"
        : category === "Professional / Career Domains"
        ? "professional"
        : category === "Freelancing"
        ? "freelancing"
        : "technical"
    ]
  );
};

const parseWeeks = (durationText) => {
  if (!durationText) return 0;
  const match = String(durationText).match(/(\d+)\s*week/i);
  return match ? Number(match[1]) : 0;
};

const sumCourseWeeks = (courses = []) =>
  courses.reduce((sum, c) => sum + parseWeeks(c?.duration), 0);

const makeSimpleTrack = ({ id, name, icon, summary, category }) => {
  const resolvedCategory = category || "Technical";
  const plan = buildDomainCoursePlan(name, resolvedCategory);

  const baseCourses = plan?.courses?.base || [];
  const intermediateCourses = plan?.courses?.intermediate || [];
  const advancedCourses = plan?.courses?.advanced || [];

  const beginnerWeeks = sumCourseWeeks(baseCourses);
  const intermediateWeeks = sumCourseWeeks(intermediateCourses);
  const advancedWeeks = sumCourseWeeks(advancedCourses);

  const totalCourses =
    baseCourses.length + intermediateCourses.length + advancedCourses.length;

  // IMPORTANT:
  // The roadmap tree UI renders `modules` as the expandable leaf items.
  // If we reuse the same generic module labels (Fundamentals/Tools/etc.),
  // every roadmap looks identical. To keep each roadmap unique and useful,
  // we render the actual course titles as the module items.
  const beginnerModuleItems = baseCourses.map((c) => c?.name).filter(Boolean);
  const intermediateModuleItems = intermediateCourses
    .map((c) => c?.name)
    .filter(Boolean);
  const advancedModuleItems = advancedCourses
    .map((c) => c?.name)
    .filter(Boolean);

  return {
    id,
    name,
    icon,
    category: resolvedCategory,
    levelCount: 3,
    totalCourses: totalCourses || 12,
    estimatedMonths: plan.estimatedMonths || "3–5 months",
    summary,
    levels: [
      {
        id: "beginner",
        label: "Beginner",
        badge: "Level 1 – Foundations",
        courseCount: baseCourses.length || 4,
        duration: beginnerWeeks ? `${beginnerWeeks} weeks` : "4 weeks",
        focus: plan.focus.beginner,
        courses: baseCourses,
        modules: beginnerModuleItems,
        outcomes: plan.outcomes.beginner,
      },
      {
        id: "intermediate",
        label: "Intermediate",
        badge: "Level 2 – Practice",
        courseCount: intermediateCourses.length || 4,
        duration: intermediateWeeks ? `${intermediateWeeks} weeks` : "4 weeks",
        focus: plan.focus.intermediate,
        courses: intermediateCourses,
        modules: intermediateModuleItems,
        outcomes: plan.outcomes.intermediate,
      },
      {
        id: "advanced",
        label: "Advanced",
        badge: "Level 3 – Mastery",
        courseCount: advancedCourses.length || 4,
        duration: advancedWeeks ? `${advancedWeeks} weeks` : "6 weeks",
        focus: plan.focus.advanced,
        courses: advancedCourses,
        modules: advancedModuleItems,
        outcomes: plan.outcomes.advanced,
      },
    ],
  };
};

const inferDomainCategory = (name) => {
  const key = slugify(name);

  const overrides = {
    "software-engineering": "Technical",
    "graphic-designing": "Professional / Career Domains",
    "ui-ux-designing": "Professional / Career Domains",
    "e-learning-development": "Professional / Career Domains",
    "instructional-design": "Professional / Career Domains",
    "academic-research": "Professional / Career Domains",
  };
  if (overrides[key]) return overrides[key];

  if (
    key.includes("freelance") ||
    key === "consulting" ||
    key === "online-tutoring" ||
    key.includes("influencer")
  ) {
    return "Freelancing";
  }

  const nonTechnicalKeywords = [
    "business",
    "marketing",
    "seo",
    "sem",
    "sales",
    "crm",
    "human-resources",
    "talent-acquisition",
    "payroll",
    "corporate-training",
    "organizational-development",
    "writing",
    "copywriting",
    "blogging",
    "journalism",
    "script-writing",
    "project-management",
    "product-management",
    "operations-management",
    "supply-chain-management",
    "content-marketing",
    "social-media-marketing",
    "affiliate-marketing",
  ];
  if (nonTechnicalKeywords.some((k) => key.includes(k))) {
    return "Non-Technical";
  }

  const professionalKeywords = [
    "healthcare",
    "medical",
    "biotech",
    "bioinformatics",
    "pharmaceutical",
    "clinical",
    "banking",
    "financial",
    "fintech",
    "investment-banking",
    "stock-market",
    "accounting",
    "auditing",
    "law",
    "public-administration",
    "mechanical-engineering",
    "civil-engineering",
    "electrical-engineering",
    "electronics-communication",
    "automobile-engineering",
    "aerospace-engineering",
    "animation",
    "game-design",
    "video-editing",
    "film-media-production",
    "teaching",
    "edtech",
    "government",
    "defense",
    "space-technology",
    "environmental",
    "climate",
    "smart-cities",
    "gis",
    "remote-sensing",
    "startup",
    "entrepreneurship",
    "research-and-development",
  ];
  if (professionalKeywords.some((k) => key.includes(k))) {
    return "Professional / Career Domains";
  }

  return "Technical";
};

// Map many domains into simple, clickable tracks.
// NOTE: We will NOT duplicate tracks that already exist as detailed ones.
const ROADMAP_DOMAIN_CATALOG = [
  // TECHNICAL: Software & Development
  {
    name: "Web Development",
    icon: <Code className="w-6 h-6" />,
    summary: "Build modern websites and web apps end-to-end.",
  },
  {
    name: "Frontend Development",
    icon: <Palette className="w-6 h-6" />,
    summary: "UI engineering: HTML/CSS/JS, React, performance, and UX.",
  },
  {
    name: "Backend Development",
    icon: <Server className="w-6 h-6" />,
    summary: "APIs, databases, auth, scaling, and backend architecture.",
  },
  {
    name: "Full Stack Development",
    icon: <Layers className="w-6 h-6" />,
    summary: "Build full products: frontend + backend + deployment.",
  },
  {
    name: "Mobile App Development",
    icon: <Smartphone className="w-6 h-6" />,
    summary: "Ship mobile apps with great UX and reliable performance.",
  },
  {
    name: "Android Development",
    icon: <Smartphone className="w-6 h-6" />,
    summary: "Android apps: components, architecture, and release pipeline.",
  },
  {
    name: "iOS Development",
    icon: <Smartphone className="w-6 h-6" />,
    summary: "iOS apps: UI patterns, networking, and App Store release.",
  },
  {
    name: "Desktop Application Development",
    icon: <Monitor className="w-6 h-6" />,
    summary: "Build desktop apps with modern frameworks and UX.",
  },

  // TECHNICAL: AI & Data
  {
    name: "Artificial Intelligence (AI)",
    icon: <Brain className="w-6 h-6" />,
    summary: "Core AI concepts, applications, and responsible AI.",
  },
  {
    name: "Machine Learning (ML)",
    icon: <Brain className="w-6 h-6" />,
    summary: "Train and evaluate ML models for real problems.",
  },
  {
    name: "Deep Learning",
    icon: <Cpu className="w-6 h-6" />,
    summary: "Neural networks, training, and deep learning workflows.",
  },
  {
    name: "Natural Language Processing (NLP)",
    icon: <MessageSquare className="w-6 h-6" />,
    summary: "Text understanding, LLM basics, and NLP pipelines.",
  },
  {
    name: "Computer Vision",
    icon: <Target className="w-6 h-6" />,
    summary: "Image/video understanding and vision applications.",
  },
  {
    name: "Data Science",
    icon: <BarChart3 className="w-6 h-6" />,
    summary: "Data analysis, modeling, and insight storytelling.",
  },
  {
    name: "Data Analytics",
    icon: <LineChart className="w-6 h-6" />,
    summary: "KPIs, dashboards, and decision-making with data.",
  },
  {
    name: "Big Data Engineering",
    icon: <Database className="w-6 h-6" />,
    summary: "Pipelines, distributed data systems, and scale.",
  },

  // TECHNICAL: Cloud & Infrastructure
  {
    name: "Cloud Computing",
    icon: <Cloud className="w-6 h-6" />,
    summary: "Cloud fundamentals, architectures, and operations.",
  },
  {
    name: "AWS",
    icon: <Cloud className="w-6 h-6" />,
    summary: "AWS services, deployment patterns, and cost basics.",
  },
  {
    name: "Microsoft Azure",
    icon: <Cloud className="w-6 h-6" />,
    summary: "Azure services, deployments, and monitoring.",
  },
  {
    name: "Google Cloud Platform (GCP)",
    icon: <Cloud className="w-6 h-6" />,
    summary: "GCP services, projects, and cloud-native workflows.",
  },
  {
    name: "DevOps",
    icon: <Wrench className="w-6 h-6" />,
    summary: "CI/CD, automation, infrastructure, and reliability.",
  },
  {
    name: "MLOps",
    icon: <Cpu className="w-6 h-6" />,
    summary: "Deploy, monitor, and iterate ML systems in production.",
  },
  {
    name: "Site Reliability Engineering (SRE)",
    icon: <Shield className="w-6 h-6" />,
    summary: "Reliability, SLOs, incident response, and scaling.",
  },
  {
    name: "Virtualization",
    icon: <Server className="w-6 h-6" />,
    summary: "VMs, containers concepts, and compute isolation.",
  },

  // TECHNICAL: Security & Networking
  {
    name: "Cyber Security",
    icon: <Shield className="w-6 h-6" />,
    summary: "Threats, defense, tools, and security fundamentals.",
  },
  {
    name: "Ethical Hacking",
    icon: <Key className="w-6 h-6" />,
    summary: "Offensive security techniques and safe testing.",
  },
  {
    name: "Network Security",
    icon: <Network className="w-6 h-6" />,
    summary: "Secure networks, protocols, and monitoring.",
  },
  {
    name: "Information Security",
    icon: <Lock className="w-6 h-6" />,
    summary: "Risk management, policies, and security operations.",
  },
  {
    name: "Blockchain Technology",
    icon: <GitBranch className="w-6 h-6" />,
    summary: "Distributed ledgers, smart contracts, and use cases.",
  },
  {
    name: "Cryptography",
    icon: <Lock className="w-6 h-6" />,
    summary: "Encryption, hashing, signatures, and applied crypto.",
  },

  // TECHNICAL: Core CS Domains
  {
    name: "Operating Systems",
    icon: <Cpu className="w-6 h-6" />,
    summary: "Processes, memory, scheduling, and OS fundamentals.",
  },
  {
    name: "Computer Networks",
    icon: <Network className="w-6 h-6" />,
    summary: "TCP/IP, HTTP, DNS, and networking essentials.",
  },
  {
    name: "Database Management Systems (DBMS)",
    icon: <Database className="w-6 h-6" />,
    summary: "Relational theory, indexing, queries, and transactions.",
  },
  {
    name: "Software Engineering",
    icon: <Layers className="w-6 h-6" />,
    summary: "Design, testing, process, and building maintainable systems.",
  },
  {
    name: "Compiler Design",
    icon: <FileCode className="w-6 h-6" />,
    summary: "Parsing, IR, optimization, and compiler basics.",
  },
  {
    name: "Distributed Systems",
    icon: <Network className="w-6 h-6" />,
    summary: "Consistency, consensus, and distributed architectures.",
  },

  // TECHNICAL: Emerging & Advanced Tech
  {
    name: "Internet of Things (IoT)",
    icon: <Globe className="w-6 h-6" />,
    summary: "Sensors, connectivity, and IoT applications.",
  },
  {
    name: "Robotics",
    icon: <Gamepad2 className="w-6 h-6" />,
    summary: "Control, perception, and robot software basics.",
  },
  {
    name: "Embedded Systems",
    icon: <Cpu className="w-6 h-6" />,
    summary: "Microcontrollers, real-time constraints, and firmware.",
  },
  {
    name: "Augmented Reality (AR)",
    icon: <Globe className="w-6 h-6" />,
    summary: "AR concepts, interaction, and app workflows.",
  },
  {
    name: "Virtual Reality (VR)",
    icon: <Globe className="w-6 h-6" />,
    summary: "VR experiences, performance, and design principles.",
  },
  {
    name: "Mixed Reality (MR)",
    icon: <Globe className="w-6 h-6" />,
    summary: "MR foundations and building immersive applications.",
  },
  {
    name: "Quantum Computing",
    icon: <Cpu className="w-6 h-6" />,
    summary: "Qubits, circuits, and quantum algorithms basics.",
  },
  {
    name: "Edge Computing",
    icon: <Server className="w-6 h-6" />,
    summary: "Low-latency compute near devices and IoT.",
  },

  // NON-TECHNICAL: Business & Management
  {
    name: "Business Analysis",
    icon: <BarChart3 className="w-6 h-6" />,
    summary: "Requirements, process analysis, and KPI thinking.",
  },
  {
    name: "Business Development",
    icon: <TrendingUp className="w-6 h-6" />,
    summary: "Partnerships, pipeline building, and growth strategy.",
  },
  {
    name: "Project Management",
    icon: <Calendar className="w-6 h-6" />,
    summary: "Plan, execute, and deliver projects reliably.",
  },
  {
    name: "Product Management",
    icon: <Briefcase className="w-6 h-6" />,
    summary: "Build product vision, roadmaps, and execution.",
  },
  {
    name: "Operations Management",
    icon: <Settings className="w-6 h-6" />,
    summary: "Improve processes and run operations efficiently.",
  },
  {
    name: "Supply Chain Management",
    icon: <Network className="w-6 h-6" />,
    summary: "Planning, logistics, and supply chain optimization.",
  },

  // NON-TECHNICAL: Marketing & Sales
  {
    name: "Digital Marketing",
    icon: <Globe className="w-6 h-6" />,
    summary: "Campaigns, analytics, and channel strategy.",
  },
  {
    name: "Content Marketing",
    icon: <FileText className="w-6 h-6" />,
    summary: "Content strategy, SEO-friendly writing, and distribution.",
  },
  {
    name: "Social Media Marketing",
    icon: <Users className="w-6 h-6" />,
    summary: "Platform strategy, content, and community growth.",
  },
  {
    name: "SEO / SEM",
    icon: <Target className="w-6 h-6" />,
    summary: "Search optimization and paid search fundamentals.",
  },
  {
    name: "Affiliate Marketing",
    icon: <TrendingUp className="w-6 h-6" />,
    summary: "Partner programs and performance marketing basics.",
  },
  {
    name: "Sales & CRM",
    icon: <Users className="w-6 h-6" />,
    summary: "Sales pipeline, CRM workflows, and closing basics.",
  },

  // NON-TECHNICAL: HR & Corporate
  {
    name: "Human Resources (HR)",
    icon: <Users className="w-6 h-6" />,
    summary: "People ops, compliance basics, and HR workflows.",
  },
  {
    name: "Talent Acquisition",
    icon: <Users className="w-6 h-6" />,
    summary: "Sourcing, screening, and interviewing candidates.",
  },
  {
    name: "Payroll Management",
    icon: <BarChart3 className="w-6 h-6" />,
    summary: "Payroll systems, processes, and compliance basics.",
  },
  {
    name: "Corporate Training",
    icon: <BookOpen className="w-6 h-6" />,
    summary: "Learning programs, training delivery, and evaluation.",
  },
  {
    name: "Organizational Development",
    icon: <Users className="w-6 h-6" />,
    summary: "Culture, performance, and org effectiveness.",
  },

  // NON-TECHNICAL: Writing & Communication
  {
    name: "Technical Writing",
    icon: <FileText className="w-6 h-6" />,
    summary: "Write clear docs, guides, and product documentation.",
  },
  {
    name: "Content Writing",
    icon: <FileText className="w-6 h-6" />,
    summary: "Write engaging content for brands and products.",
  },
  {
    name: "Copywriting",
    icon: <FileText className="w-6 h-6" />,
    summary: "Write persuasive copy for ads, landing pages, and email.",
  },
  {
    name: "Blogging",
    icon: <FileText className="w-6 h-6" />,
    summary: "Build blog strategy, consistency, and audience growth.",
  },
  {
    name: "Script Writing",
    icon: <FileText className="w-6 h-6" />,
    summary: "Write scripts for video, reels, and storytelling.",
  },
  {
    name: "Journalism",
    icon: <FileText className="w-6 h-6" />,
    summary: "Research, reporting, interviewing, and publishing.",
  },

  // PROFESSIONAL DOMAINS: Healthcare & Life Sciences
  {
    name: "Healthcare Technology",
    icon: <Globe className="w-6 h-6" />,
    summary: "Tech in healthcare: systems, data, and compliance awareness.",
  },
  {
    name: "Medical Research",
    icon: <TestTube className="w-6 h-6" />,
    summary: "Research methods, study design, and analysis basics.",
  },
  {
    name: "Biotechnology",
    icon: <TestTube className="w-6 h-6" />,
    summary: "Biotech fundamentals and applied lab-to-product flow.",
  },
  {
    name: "Bioinformatics",
    icon: <Database className="w-6 h-6" />,
    summary: "Computational biology and data analysis approaches.",
  },
  {
    name: "Pharmaceutical Research",
    icon: <TestTube className="w-6 h-6" />,
    summary: "Drug discovery pipeline and research basics.",
  },
  {
    name: "Clinical Data Management",
    icon: <Database className="w-6 h-6" />,
    summary: "Clinical data workflows, quality, and reporting.",
  },

  // PROFESSIONAL DOMAINS: Finance & Economics
  {
    name: "Banking",
    icon: <Briefcase className="w-6 h-6" />,
    summary: "Banking products, operations, and compliance basics.",
  },
  {
    name: "Financial Analysis",
    icon: <LineChart className="w-6 h-6" />,
    summary: "Financial statements, modeling, and business insights.",
  },
  {
    name: "FinTech",
    icon: <Globe className="w-6 h-6" />,
    summary: "Payments, lending, risk, and fintech product basics.",
  },
  {
    name: "Investment Banking",
    icon: <TrendingUp className="w-6 h-6" />,
    summary: "Deals, valuation, and corporate finance fundamentals.",
  },
  {
    name: "Stock Market Analysis",
    icon: <LineChart className="w-6 h-6" />,
    summary: "Markets, strategies, and risk basics.",
  },
  {
    name: "Accounting & Auditing",
    icon: <BarChart3 className="w-6 h-6" />,
    summary: "Accounting cycles, compliance, and audit fundamentals.",
  },

  // PROFESSIONAL DOMAINS: Law & Governance
  {
    name: "Corporate Law",
    icon: <Briefcase className="w-6 h-6" />,
    summary: "Contracts, corporate structures, and legal basics.",
  },
  {
    name: "Cyber Law",
    icon: <Shield className="w-6 h-6" />,
    summary: "Digital laws, compliance, and cyber legal basics.",
  },
  {
    name: "Intellectual Property Rights",
    icon: <Lock className="w-6 h-6" />,
    summary: "Patents, trademarks, copyright, and IPR basics.",
  },
  {
    name: "Legal Consultancy",
    icon: <MessageSquare className="w-6 h-6" />,
    summary: "Client advisory, research, and legal workflows.",
  },
  {
    name: "Public Administration",
    icon: <Users className="w-6 h-6" />,
    summary: "Governance, policy, and administration basics.",
  },

  // PROFESSIONAL DOMAINS: Engineering (Core)
  {
    name: "Mechanical Engineering",
    icon: <Wrench className="w-6 h-6" />,
    summary: "Mechanics, design fundamentals, and core engineering workflows.",
  },
  {
    name: "Civil Engineering",
    icon: <Wrench className="w-6 h-6" />,
    summary: "Structures, materials, and project delivery basics.",
  },
  {
    name: "Electrical Engineering",
    icon: <Cpu className="w-6 h-6" />,
    summary: "Circuits, signals, and electrical systems basics.",
  },
  {
    name: "Electronics & Communication",
    icon: <Cpu className="w-6 h-6" />,
    summary: "Electronics, communication systems, and fundamentals.",
  },
  {
    name: "Automobile Engineering",
    icon: <Wrench className="w-6 h-6" />,
    summary: "Vehicle systems, design, and testing basics.",
  },
  {
    name: "Aerospace Engineering",
    icon: <Rocket className="w-6 h-6" />,
    summary: "Flight systems, materials, and aerospace fundamentals.",
  },

  // PROFESSIONAL DOMAINS: Creative & Media
  {
    name: "Graphic Designing",
    icon: <Brush className="w-6 h-6" />,
    summary: "Design fundamentals, tools, and portfolio building.",
  },
  {
    name: "UI/UX Designing",
    icon: <Palette className="w-6 h-6" />,
    summary: "Design thinking, UI systems, UX research, and prototyping.",
  },
  {
    name: "Animation",
    icon: <Play className="w-6 h-6" />,
    summary: "Motion basics, storytelling, and animation workflows.",
  },
  {
    name: "Game Design",
    icon: <Gamepad2 className="w-6 h-6" />,
    summary: "Game mechanics, systems, levels, and iteration.",
  },
  {
    name: "Video Editing",
    icon: <Play className="w-6 h-6" />,
    summary: "Editing workflow, color, audio, and storytelling.",
  },
  {
    name: "Film & Media Production",
    icon: <Play className="w-6 h-6" />,
    summary: "Production pipeline from script to post-production.",
  },

  // PROFESSIONAL DOMAINS: Education & Training
  {
    name: "Teaching",
    icon: <BookOpen className="w-6 h-6" />,
    summary: "Teaching fundamentals, lesson planning, and assessment.",
  },
  {
    name: "E‑Learning Development",
    icon: <BookOpen className="w-6 h-6" />,
    summary: "Create online courses and learning experiences.",
  },
  {
    name: "Instructional Design",
    icon: <BookOpen className="w-6 h-6" />,
    summary: "Design learning systems and instructional materials.",
  },
  {
    name: "EdTech",
    icon: <Globe className="w-6 h-6" />,
    summary: "Education technology products and learning workflows.",
  },
  {
    name: "Academic Research",
    icon: <TestTube className="w-6 h-6" />,
    summary: "Research methods, writing, and publication basics.",
  },

  // Specialized & Modern Domains
  {
    name: "Startup & Entrepreneurship",
    icon: <Rocket className="w-6 h-6" />,
    summary: "Build, validate, launch, and scale a startup.",
  },
  {
    name: "Research & Development (R&D)",
    icon: <TestTube className="w-6 h-6" />,
    summary: "Explore innovation workflows and R&D execution.",
  },
  {
    name: "Government & PSU Sector",
    icon: <Users className="w-6 h-6" />,
    summary: "Career readiness for government/PSU exams and roles.",
  },
  {
    name: "Defense & Space Technology",
    icon: <Rocket className="w-6 h-6" />,
    summary: "Core concepts and pathways into defense/space tech.",
  },
  {
    name: "Environmental Science",
    icon: <Globe className="w-6 h-6" />,
    summary: "Environment fundamentals and applied analysis basics.",
  },
  {
    name: "Climate Change Analytics",
    icon: <LineChart className="w-6 h-6" />,
    summary: "Data-driven climate analysis and reporting.",
  },
  {
    name: "Smart Cities",
    icon: <Globe className="w-6 h-6" />,
    summary: "Urban tech systems and smart city initiatives.",
  },
  {
    name: "GIS & Remote Sensing",
    icon: <Globe className="w-6 h-6" />,
    summary: "Geospatial tools, mapping, and remote sensing basics.",
  },

  // Freelancing & Digital Career Domains
  {
    name: "Freelance Development",
    icon: <Code className="w-6 h-6" />,
    summary: "Deliver client projects, proposals, and freelancing systems.",
  },
  {
    name: "Freelance Designing",
    icon: <Palette className="w-6 h-6" />,
    summary: "Client-ready design workflow and portfolio building.",
  },
  {
    name: "Freelance Writing",
    icon: <FileText className="w-6 h-6" />,
    summary: "Writing services, client communication, and publishing.",
  },
  {
    name: "Online Tutoring",
    icon: <BookOpen className="w-6 h-6" />,
    summary: "Teach online with curriculum design and delivery.",
  },
  {
    name: "Consulting",
    icon: <Briefcase className="w-6 h-6" />,
    summary: "Problem-solving, delivery, and client management.",
  },
  {
    name: "Influencer Marketing",
    icon: <Users className="w-6 h-6" />,
    summary: "Audience building, content strategy, and brand deals.",
  },
];

// If a domain already exists as a detailed track, map it to that track id.
// This prevents duplicate cards like Frontend/Backend/etc.
const DOMAIN_ALIASES = {
  "frontend development": "frontend",
  "backend development": "backend",
  "full stack development": "full-stack",
  "mobile app development": "mobile",
  "cyber security": "cybersecurity",
  "ui/ux designing": "uiux",
  "product management": "product-manager",
  "digital marketing": "digital-marketing",
  "business analysis": "business-analyst",
};

const DETAILED_ROADMAP_TRACKS_WITH_CATEGORY = DETAILED_ROADMAP_TRACKS.map(
  (t) => ({
    ...t,
    category: t.category || "Technical",
  })
);

const usedIds = new Set(DETAILED_ROADMAP_TRACKS_WITH_CATEGORY.map((t) => t.id));
const GENERATED_ROADMAP_TRACKS = ROADMAP_DOMAIN_CATALOG.map((domain) => {
  const aliasKey = slugify(domain.name);
  const existingId = DOMAIN_ALIASES[aliasKey];
  if (existingId && usedIds.has(existingId)) return null;

  let id = existingId || slugify(domain.name);
  if (!id) id = `track-${Math.random().toString(16).slice(2)}`;

  // Ensure unique id
  if (usedIds.has(id)) {
    let i = 2;
    while (usedIds.has(`${id}-${i}`)) i += 1;
    id = `${id}-${i}`;
  }
  usedIds.add(id);

  return makeSimpleTrack({
    id,
    name: domain.name,
    icon: domain.icon,
    summary: domain.summary,
    category: inferDomainCategory(domain.name),
  });
}).filter(Boolean);

const ROADMAP_TRACKS = [
  ...DETAILED_ROADMAP_TRACKS_WITH_CATEGORY,
  ...GENERATED_ROADMAP_TRACKS,
];

const Roadmap = () => {
  const navigate = useNavigate();
  const [selectedTrackId, setSelectedTrackId] = useState("frontend");
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [viewingTrackId, setViewingTrackId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const selectedTrack =
    ROADMAP_TRACKS.find((track) => track.id === selectedTrackId) ||
    ROADMAP_TRACKS[0];

  const viewingTrack = viewingTrackId
    ? ROADMAP_TRACKS.find((track) => track.id === viewingTrackId) ||
      selectedTrack
    : selectedTrack;

  const totalLevels = selectedTrack.levels.length;
  const totalCourses = selectedTrack.levels.reduce(
    (sum, level) => sum + level.courseCount,
    0
  );

  const categoryOrder = [
    "Technical",
    "Non-Technical",
    "Professional / Career Domains",
    "Freelancing",
  ];

  const categorizedSections = categoryOrder
    .map((category) => ({
      category,
      tracks: ROADMAP_TRACKS.filter(
        (t) => (t.category || "Other") === category
      ),
    }))
    .filter((section) => section.tracks.length > 0);

  const otherTracks = ROADMAP_TRACKS.filter(
    (t) => !categoryOrder.includes(t.category || "Other")
  );

  const renderTrackCard = (track) => {
    const trackLevels = track.levels.length;
    const trackCourses = track.levels.reduce(
      (sum, level) => sum + level.courseCount,
      0
    );

    const isActive = selectedTrackId === track.id;

    return (
      <Card
        key={track.id}
        onClick={() => setSelectedTrackId(track.id)}
        className={`cursor-pointer transition-all duration-300 border ${
          isActive
            ? "border-[var(--accent-color)] bg-gradient-to-br from-[rgba(var(--accent-rgb),0.25)] via-[rgba(var(--accent-rgb),0.12)] to-zinc-900 shadow-sm hover:shadow-md scale-105"
            : "border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 hover:border-[rgba(var(--accent-rgb),0.5)] hover:bg-zinc-900/80 hover:shadow-sm"
        }`}
      >
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-[rgba(var(--accent-rgb),0.3)] to-[rgba(var(--accent-rgb),0.2)] border-[rgba(var(--accent-rgb),0.5)] shadow-sm"
                    : "bg-zinc-900 border-zinc-700 group-hover:border-[rgba(var(--accent-rgb),0.5)]"
                }`}
              >
                {track.icon}
              </div>
              <div className="text-sm md:text-base font-bold">{track.name}</div>
            </div>
            <span
              className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full border font-medium ${
                isActive
                  ? "bg-[rgba(var(--accent-rgb),0.2)] text-[rgba(var(--accent-rgb),0.9)] border-[rgba(var(--accent-rgb),0.4)]"
                  : "bg-zinc-900 text-zinc-400 border-zinc-700"
              }`}
            >
              {trackLevels} levels
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-4 line-clamp-3 leading-relaxed">
            {track.summary}
          </p>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                <span className="text-zinc-300">{trackCourses}+ courses</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                <span className="text-zinc-300">{track.estimatedMonths}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewRoadmap(track.id);
              }}
              className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-bold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] text-white hover:opacity-90 shadow-sm hover:shadow-md hover:scale-105"
                  : "bg-gradient-to-r from-zinc-800 to-zinc-700 text-zinc-100 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-700 hover:border-[rgba(var(--accent-rgb),0.5)]"
              }`}
            >
              <Rocket className="w-3.5 h-3.5 mr-1.5" />
              View Roadmap
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleViewRoadmap = (trackId) => {
    setViewingTrackId(trackId);
    setIsRoadmapOpen(true);
    // Reset expanded nodes when opening new roadmap
    setExpandedNodes(new Set());
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Tree Node Component
  const TreeNode = ({ node, level = 0, path = "" }) => {
    const nodeId = `${path}-${node.id || node.label || node.name}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.levels || node.modules || node.courses;
    const indent = level * 28;

    return (
      <div className="relative">
        {/* Connection Line */}
        {level > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-zinc-800"
            style={{ marginLeft: `${indent - 14}px` }}
          />
        )}

        {/* Node */}
        <div
          className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-zinc-900/50 transition-all duration-200 group"
          style={{ marginLeft: `${indent}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(nodeId);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-zinc-700 hover:border-[rgba(var(--accent-rgb),0.5)] bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 flex-shrink-0 mt-0.5"
            >
              {isExpanded ? (
                <Minus className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
            </div>
          )}

          {/* Node Icon */}
          {node.icon && (
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 group-hover:border-[rgba(var(--accent-rgb),0.5)] transition-colors flex-shrink-0">
              {node.icon}
            </div>
          )}

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white group-hover:text-[var(--accent-color)] transition-colors">
                {node.label || node.name}
              </span>
              {node.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                  {node.badge}
                </span>
              )}
            </div>
            {node.focus && (
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {node.focus}
              </p>
            )}
            {(node.duration || node.courseCount) && (
              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                {node.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--accent-color)]" />
                    {node.duration}
                  </span>
                )}
                {node.courseCount && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[var(--accent-color)]" />
                    {node.courseCount} courses
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Vertical line for children */}
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-zinc-800"
              style={{ marginLeft: `${indent + 12}px` }}
            />
            <div className="ml-8" style={{ marginLeft: `${indent + 32}px` }}>
              {node.levels?.map((levelItem, idx) => (
                <div key={levelItem.id} className="relative">
                  <TreeNode
                    node={{
                      ...levelItem,
                      courses: levelItem.courses,
                    }}
                    level={level + 1}
                    path={nodeId}
                  />
                </div>
              ))}

              {node.courses?.map((courseItem) => (
                <div
                  key={courseItem.id}
                  className="flex items-center gap-2 py-2 px-3 rounded hover:bg-zinc-900/30 transition-colors group"
                  style={{ marginLeft: `${(level + 1) * 28}px` }}
                >
                  {courseItem.icon ? (
                    <div className="text-[var(--accent-color)]">
                      {courseItem.icon}
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] group-hover:bg-[rgba(var(--accent-rgb),0.85)] transition-colors" />
                  )}
                  <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
                    {courseItem.name}
                  </span>
                  {courseItem.duration && (
                    <span className="text-[10px] text-zinc-500 ml-auto">
                      {courseItem.duration}
                    </span>
                  )}
                </div>
              ))}

              {!node.courses?.length &&
                node.modules?.map((module, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 py-2 px-3 rounded hover:bg-zinc-900/30 transition-colors group"
                    style={{ marginLeft: `${(level + 1) * 28}px` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] group-hover:bg-[rgba(var(--accent-rgb),0.85)] transition-colors" />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      {module}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Track selector: big interactive cards */}
      <section className="border-b border-gray-900 bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Choose your course roadmap
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold mt-1">
                Select a path to see its roadmap
              </h1>
              <p className="mt-2 max-w-xl text-xs md:text-sm text-zinc-400">
                Click a card below (for example{" "}
                <span className="font-semibold">Frontend Developer</span>) to
                open the full roadmap with beginner, intermediate and advanced
                levels.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-[var(--accent-color)]" />
                {totalCourses}+ courses in this roadmap
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4 text-[var(--accent-color)]" />
                {totalLevels} levels (Beginner → Advanced)
              </span>
            </div>
          </div>

          <div className="space-y-10">
            {categorizedSections.map((section) => (
              <div key={section.category}>
                <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {section.category}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {section.tracks.length} roadmaps
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {section.tracks.map((track) => renderTrackCard(track))}
                </div>
              </div>
            ))}

            {otherTracks.length > 0 && (
              <div>
                <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Other
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {otherTracks.length} roadmaps
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {otherTracks.map((track) => renderTrackCard(track))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Diagrammatic Roadmap Modal - Tree View */}
      <Dialog open={isRoadmapOpen} onOpenChange={setIsRoadmapOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-zinc-800 text-white shadow-sm">
          <DialogHeader className="border-b border-zinc-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[rgba(var(--accent-rgb),0.2)] to-[rgba(var(--accent-rgb),0.2)] border border-[rgba(var(--accent-rgb),0.3)] shadow-sm">
                  {viewingTrack.icon}
                </div>
                <div>
                  <DialogTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                    {viewingTrack.name} Roadmap
                  </DialogTitle>
                  <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
                    {viewingTrack.summary}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.3)] hover:border-[rgba(var(--accent-rgb),0.5)] transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-5 h-5 text-[var(--accent-color)] mr-2" />
                  </div>
                  <div className="text-3xl font-bold text-[var(--accent-color)] mb-1">
                    {viewingTrack.totalCourses}
                  </div>
                  <div className="text-xs text-zinc-400 font-medium">
                    Total Courses
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.3)] hover:border-[rgba(var(--accent-rgb),0.5)] transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Layers className="w-5 h-5 text-[var(--accent-color)] mr-2" />
                  </div>
                  <div className="text-3xl font-bold text-[var(--accent-color)] mb-1">
                    {viewingTrack.levelCount}
                  </div>
                  <div className="text-xs text-zinc-400 font-medium">
                    Levels
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.3)] hover:border-[rgba(var(--accent-rgb),0.5)] transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-[var(--accent-color)] mr-2" />
                  </div>
                  <div className="text-3xl font-bold text-[var(--accent-color)] mb-1">
                    {viewingTrack.estimatedMonths}
                  </div>
                  <div className="text-xs text-zinc-400 font-medium">
                    Duration
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tree Structure Roadmap */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--accent-color)]" />
                Learning Path Structure
              </h3>
              <div className="space-y-1">
                {/* Root Node - Track */}
                <TreeNode
                  node={{
                    label: viewingTrack.name,
                    icon: viewingTrack.icon,
                    badge: `${viewingTrack.totalCourses} courses • ${viewingTrack.estimatedMonths}`,
                    levels: viewingTrack.levels,
                  }}
                  level={0}
                  path="root"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roadmap;
