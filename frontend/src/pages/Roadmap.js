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
const ROADMAP_TRACKS = [
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
    const hasChildren = node.levels || node.modules;
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
              className="w-6 h-6 flex items-center justify-center rounded-md border border-zinc-700 hover:border-blue-500/50 bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 flex-shrink-0 mt-0.5"
            >
              {isExpanded ? (
                <Minus className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-blue-400" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
          )}

          {/* Node Icon */}
          {node.icon && (
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 group-hover:border-blue-500/50 transition-colors flex-shrink-0">
              {node.icon}
            </div>
          )}

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
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
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {node.duration}
                  </span>
                )}
                {node.courseCount && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-blue-400" />
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
                      modules: levelItem.modules,
                    }}
                    level={level + 1}
                    path={nodeId}
                  />
                </div>
              ))}
              {node.modules?.map((module, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-2 px-3 rounded hover:bg-zinc-900/30 transition-colors group"
                  style={{ marginLeft: `${(level + 1) * 28}px` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-300 transition-colors" />
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
                <BookOpen className="w-4 h-4 text-blue-400" />
                {totalCourses}+ courses in this roadmap
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4 text-purple-400" />
                {totalLevels} levels (Beginner → Advanced)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ROADMAP_TRACKS.map((track) => {
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
                      ? "border-blue-500 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-zinc-900 shadow-sm shadow-blue-500/10 hover:shadow-md hover:shadow-blue-500/15 scale-105"
                      : "border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 hover:border-blue-500/50 hover:bg-zinc-900/80 hover:shadow-sm hover:shadow-blue-500/5"
                  }`}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-xl border transition-all duration-300 ${
                            isActive
                              ? "bg-gradient-to-br from-blue-500/30 to-purple-500/20 border-blue-500/50 shadow-sm shadow-blue-500/10"
                              : "bg-zinc-900 border-zinc-700 group-hover:border-blue-500/50"
                          }`}
                        >
                          {track.icon}
                        </div>
                        <div className="text-sm md:text-base font-bold">
                          {track.name}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full border font-medium ${
                          isActive
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
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
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-zinc-300">
                            {trackCourses}+ courses
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-zinc-300">
                            {track.estimatedMonths}
                          </span>
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
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 hover:scale-105"
                            : "bg-gradient-to-r from-zinc-800 to-zinc-700 text-zinc-100 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-700 hover:border-blue-500/50"
                        }`}
                      >
                        <Rocket className="w-3.5 h-3.5 mr-1.5" />
                        View Roadmap
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Level cards: Beginner / Intermediate / Advanced */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">
                Roadmap: {selectedTrack.name}
              </h2>
              <p className="text-xs md:text-sm text-zinc-500">
                Start from Beginner → Intermediate → Advanced. This path
                includes {totalCourses}+ courses across {totalLevels} levels,
                with each card showing the key modules and outcomes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {selectedTrack.levels.map((level, index) => (
              <Card
                key={level.id}
                className={`bg-zinc-950 border hover:border-blue-500/60 transition-all duration-200 ${
                  index === 0
                    ? "border-zinc-800"
                    : index === 1
                    ? "border-zinc-800"
                    : "border-zinc-800"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <BookOpen className="w-5 h-5 text-blue-300" />
                      )}
                      {index === 1 && (
                        <Brain className="w-5 h-5 text-purple-300" />
                      )}
                      {index === 2 && (
                        <Rocket className="w-5 h-5 text-emerald-300" />
                      )}
                      <CardTitle className="text-base md:text-lg">
                        {level.label}
                      </CardTitle>
                    </div>
                    <span className="text-[10px] md:text-xs px-2 py-1 rounded-full border border-zinc-700 text-zinc-400">
                      {level.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{level.focus}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Star className="w-3 h-3 text-yellow-400" />
                      {level.courseCount}+ courses
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      {level.duration}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">
                      Key modules
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {level.modules.map((module) => (
                        <li
                          key={module}
                          className="flex items-start gap-2 leading-snug"
                        >
                          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-blue-400" />
                          <span>{module}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">
                      Outcomes
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {level.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex items-start gap-2 leading-snug"
                        >
                          <CheckCircle2 className="w-3 h-3 mt-[1px] text-emerald-400" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Diagrammatic Roadmap Modal - Tree View */}
      <Dialog open={isRoadmapOpen} onOpenChange={setIsRoadmapOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-zinc-800 text-white shadow-sm">
          <DialogHeader className="border-b border-zinc-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-sm">
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
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-5 h-5 text-blue-400 mr-2" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {viewingTrack.totalCourses}
                  </div>
                  <div className="text-xs text-zinc-400 font-medium">
                    Total Courses
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Layers className="w-5 h-5 text-purple-400 mr-2" />
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {viewingTrack.levelCount}
                  </div>
                  <div className="text-xs text-zinc-400 font-medium">
                    Levels
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-emerald-400 mr-2" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
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
                <Target className="w-5 h-5 text-blue-400" />
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
