import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Play,
  Pause,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  FileVideo,
  FileQuestion,
  FileCode,
  Download,
  MessageCircle,
  CheckCircle,
  Lock,
  Loader2,
  Sparkles,
  BookOpen,
  Bookmark,
} from "lucide-react";

// Dummy Data
const getCourseData = (courseId) => {
  if (courseId === 2) {
    return {
      title: "Full Stack Web Development",
      progress: 0,
      modules: [
        {
          name: "HTML Basics",
          lessons: [
            {
              id: 1,
              title: "Welcome to the Course & Curriculum",
              type: "video",
              duration: "5:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%201%20WELCOME%20%2B%20HTML/Day%20-%2001%20WELCOME%20%2B%20HTML/04.%20Introduction/01.%20Welcome%20to%20Delta!.mp4",
              description: "Introduction to HTML and course curriculum.",
              locked: false,
            },
            {
              id: 2,
              title: "HTML Elements & Tags",
              type: "video",
              duration: "10:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%201%20WELCOME%20%2B%20HTML/Day%20-%2001%20WELCOME%20%2B%20HTML/06.%20HTML%20%28Level%201%29%20-%20Part%20A/02.%20HTML%20Elements%20%26%20Tags.mp4",
              description: "Learn about HTML elements and tags.",
              locked: false,
            },
            {
              id: 3,
              title: "Hello World in HTML",
              type: "video",
              duration: "8:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%201%20WELCOME%20%2B%20HTML/Day%20-%2001%20WELCOME%20%2B%20HTML/06.%20HTML%20%28Level%201%29%20-%20Part%20A/03.%20Hello%20World.mp4",
              description: "Create your first HTML page.",
              locked: false,
            },
            {
              id: 4,
              title: "Paragraph and Heading Elements",
              type: "video",
              duration: "12:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%201%20WELCOME%20%2B%20HTML/Day%20-%2001%20WELCOME%20%2B%20HTML/06.%20HTML%20%28Level%201%29%20-%20Part%20A/04.%20Paragraph%20Element.mp4",
              description: "Using paragraph and heading tags.",
              locked: false,
            },
            {
              id: 5,
              title: "Heading Elements",
              type: "video",
              duration: "10:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%201%20WELCOME%20%2B%20HTML/Day%20-%2001%20WELCOME%20%2B%20HTML/06.%20HTML%20%28Level%201%29%20-%20Part%20A/05.%20Heading%20Elements.mp4",
              description: "Using heading tags in HTML.",
              locked: false,
            },
            {
              id: 6,
              title: "Practice Questions",
              type: "video",
              duration: "8:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%201%20WELCOME%20%2B%20HTML/Day%20-%2001%20WELCOME%20%2B%20HTML/06.%20HTML%20%28Level%201%29%20-%20Part%20A/06.%20Practice%20Qs.mp4",
              description: "Practice questions on HTML basics.",
              locked: false,
            },
            {
              id: 7,
              title: "Boilerplate Code",
              type: "video",
              duration: "12:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%201%20WELCOME%20%2B%20HTML/Day%20-%2001%20WELCOME%20%2B%20HTML/06.%20HTML%20%28Level%201%29%20-%20Part%20A/07.%20Boilerplate%20Code.mp4",
              description: "HTML boilerplate code.",
              locked: false,
            },
            {
              id: 8,
              title: "Lists in HTML",
              type: "video",
              duration: "10:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/01.%20Lists%20in%20HTML.mp4",
              description: "Creating lists in HTML.",
              locked: false,
            },
            {
              id: 9,
              title: "Attributes in HTML",
              type: "video",
              duration: "12:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/02.%20Attributes%20in%20HTML.mp4",
              description: "Using attributes in HTML elements.",
              locked: false,
            },
            {
              id: 10,
              title: "Anchor Element",
              type: "video",
              duration: "15:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/03.%20Anchor%20Element.mp4",
              description: "Creating links with anchor tags.",
              locked: false,
            },
            {
              id: 11,
              title: "Image Element",
              type: "video",
              duration: "10:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/04.%20Image%20Element.mp4",
              description: "Adding images to HTML pages.",
              locked: false,
            },
            {
              id: 12,
              title: "More HTML Tags",
              type: "video",
              duration: "15:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/06.%20More%20HTML%20Tags.mp4",
              description: "Additional HTML tags.",
              locked: false,
            },
            {
              id: 13,
              title: "Comments in HTML",
              type: "video",
              duration: "8:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/07.%20Comments%20in%20HTML.mp4",
              description: "Adding comments in HTML.",
              locked: false,
            },
            {
              id: 14,
              title: "HTML Case Sensitivity",
              type: "video",
              duration: "5:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/08.%20Is%20HTML%20Case%20Sensitive.mp4",
              description: "Is HTML case sensitive?",
              locked: false,
            },
            {
              id: 15,
              title: "Assignment Questions",
              type: "pdf",
              pdfUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/10.Assignment%20Questions.pdf",
              description: "HTML assignment questions.",
              locked: false,
            },
            {
              id: 16,
              title: "Assignment Solutions",
              type: "pdf",
              pdfUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%202%20HTML/Day%202%20HTML/11.Assignment%20Solutions.pdf",
              description: "Solutions to HTML assignments.",
              locked: false,
            },
          ],
        },
        {
          name: "CSS Fundamentals",
          lessons: [
            {
              id: 17,
              title: "Introduction to CSS",
              type: "video",
              duration: "10:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%205%20CSS%20%281%29/Day%205%20CSS/01.%20What%20is%20CSS.mp4",
              description: "What is CSS and how to include it.",
              locked: false,
            },
            {
              id: 18,
              title: "CSS Properties",
              type: "video",
              duration: "15:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%205%20CSS%20%281%29/Day%205%20CSS/04.%20Color%20Property.mp4",
              description: "Color and background properties in CSS.",
              locked: false,
            },
            {
              id: 19,
              title: "Background Color Property",
              type: "video",
              duration: "10:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%205%20CSS%20%281%29/Day%205%20CSS/05.%20Background%20Color%20Property.mp4",
              description: "Setting background colors in CSS.",
              locked: false,
            },
            {
              id: 20,
              title: "Practice Questions",
              type: "video",
              duration: "8:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%205%20CSS%20%281%29/Day%205%20CSS/06.%20Practice%20Qs.mp4",
              description: "Practice questions on CSS basics.",
              locked: false,
            },
          ],
        },
        {
          name: "JavaScript Basics",
          lessons: [
            {
              id: 21,
              title: "Introduction to JavaScript",
              type: "video",
              duration: "10:00",
              videoUrl:
                "/Courses/Full%20Stack%20Web%20learn/Day%2014%20Javascript%20%281%29/19.%20JavaScript%20%28Part%201%29/01.%20Introduction%20to%20JS.mp4",
              description: "Getting started with JavaScript.",
              locked: false,
            },
            // Add more JS lessons
          ],
        },
        // Add more modules as needed
      ],
    };
  }
  // Default or other courses
  return {
    title: "AI & Machine Learning Mastery",
    progress: 42,
    modules: [
      {
        name: "Introduction",
        lessons: [
          {
            id: 1,
            title: "Welcome to the Course",
            type: "video",
            duration: "5:12",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            description: "Get an overview of what you'll learn.",
            locked: false,
          },
          {
            id: 2,
            title: "Course Syllabus",
            type: "pdf",
            locked: false,
          },
        ],
      },
      {
        name: "Neural Networks",
        lessons: [
          {
            id: 3,
            title: "Neural Network Basics",
            type: "video",
            duration: "12:34",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
            description: "Understand the fundamentals of neural networks.",
            locked: false,
          },
          {
            id: 4,
            title: "Quiz: Neural Networks",
            type: "quiz",
            locked: false,
          },
          {
            id: 5,
            title: "Assignment: Build a Perceptron",
            type: "assignment",
            locked: true,
          },
        ],
      },
      {
        name: "Deep Learning",
        lessons: [
          {
            id: 6,
            title: "CNNs Explained",
            type: "video",
            duration: "18:20",
            videoUrl: "",
            description: "",
            locked: true,
          },
        ],
      },
    ],
  };
};

// Utility
const typeIcon = (type) => {
  switch (type) {
    case "video":
      return <FileVideo className="w-5 h-5 mr-2 text-orange-400" />;
    case "quiz":
      return <FileQuestion className="w-5 h-5 mr-2 text-orange-400" />;
    case "assignment":
      return <FileCode className="w-5 h-5 mr-2 text-orange-400" />;
    case "pdf":
      return <FileText className="w-5 h-5 mr-2 text-orange-400" />;
    default:
      return <BookOpen className="w-5 h-5 mr-2" />;
  }
};

export default function CourseLearnPage() {
  const location = useLocation();
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState(0);
  const [expandedModules, setExpandedModules] = useState([0]);
  const [activeLesson, setActiveLesson] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef();

  // Set course data based on courseId
  useEffect(() => {
    if (location.state && location.state.courseId) {
      const data = getCourseData(location.state.courseId);
      setCourseData(data);
    }
  }, [location.state]);

  // Effects
  useEffect(() => {
    if (completed) {
      setShowBadge(true);
      setTimeout(() => setShowBadge(false), 2500);
    }
  }, [completed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // If not navigated from courses page, show a message
  if (!location.state || !location.state.courseId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Course Selected</h2>
          <p className="text-zinc-400">
            Please open a course from the Premium Courses page.
          </p>
        </div>
      </div>
    );
  }

  // If courseData not loaded yet
  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Course...</h2>
        </div>
      </div>
    );
  }

  // Handlers
  const handleModuleToggle = (idx) => {
    setExpandedModules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleLessonClick = (mIdx, lIdx) => {
    setActiveModule(mIdx);
    setActiveLesson(lIdx);
    setCompleted(false);
  };

  const handlePrev = () => {
    if (activeLesson > 0) setActiveLesson((l) => l - 1);
    else if (activeModule > 0) {
      setActiveModule((m) => m - 1);
      setActiveLesson(courseData.modules[activeModule - 1].lessons.length - 1);
    }
    setCompleted(false);
  };

  const handleNext = () => {
    const lessons = courseData.modules[activeModule].lessons;
    if (activeLesson < lessons.length - 1) setActiveLesson((l) => l + 1);
    else if (activeModule < courseData.modules.length - 1) {
      setActiveModule((m) => m + 1);
      setActiveLesson(0);
    }
    setCompleted(false);
  };

  const handleMarkCompleted = () => {
    setCompleted(true);
    // TODO: API call to save progress
  };

  // Data
  const module = courseData.modules[activeModule];
  const lesson = module.lessons[activeLesson];

  // Layout
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0B0B0B]/90 backdrop-blur border-b border-zinc-800 flex items-center px-4 md:px-8 h-16 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Sparkles className="w-7 h-7 text-transparent bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text" />
          <span className="font-bold text-lg tracking-tight">AI LearnX</span>
        </div>
        <div className="flex-1 flex justify-center items-center min-w-0 px-2">
          <span className="font-semibold text-base sm:text-xl truncate max-w-[60vw]">
            {courseData.title}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-end gap-4">
          <button
            className="p-2 rounded hover:bg-zinc-800 transition"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <ChevronsRight className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="w-48 hidden md:block">
            <div className="flex items-center gap-2">
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-orange-500 to-orange-500 rounded-full transition-all"
                  style={{ width: `${courseData.progress}%` }}
                />
              </div>
              <span className="text-xs text-zinc-400">
                {courseData.progress}%
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`transition-all duration-300 bg-[#111] border-r border-zinc-800 flex flex-col min-h-0 ${
            sidebarOpen ? "w-full md:w-72" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span
              className={`font-semibold text-zinc-300 text-sm transition-all ${
                sidebarOpen ? "" : "opacity-0 w-0"
              }`}
            >
              Modules
            </span>
            <button
              className="p-1 rounded hover:bg-zinc-800 transition"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <ChevronsLeft className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronsRight className="w-5 h-5 text-zinc-400" />
              )}
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800">
            {courseData.modules.map((mod, mIdx) => (
              <div key={mod.name} className="mb-2">
                <button
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition group ${
                    mIdx === activeModule
                      ? "bg-gradient-to-r from-orange-900/60 to-orange-900/60"
                      : "hover:bg-zinc-900/80"
                  }`}
                  onClick={() => handleModuleToggle(mIdx)}
                  aria-expanded={expandedModules.includes(mIdx)}
                >
                  <span className="flex-1 text-left font-medium text-zinc-100">
                    {mod.name}
                  </span>
                  {expandedModules.includes(mIdx) ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
                {expandedModules.includes(mIdx) && (
                  <ul className="pl-4 mt-1 space-y-1">
                    {mod.lessons.map((les, lIdx) => (
                      <li key={les.id}>
                        <button
                          className={`flex items-center w-full px-2 py-2 rounded-lg transition group ${
                            mIdx === activeModule && lIdx === activeLesson
                              ? "bg-gradient-to-r from-orange-600/30 to-orange-600/30 shadow-lg"
                              : "hover:bg-zinc-800/80"
                          } ${
                            les.locked
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          onClick={() =>
                            !les.locked && handleLessonClick(mIdx, lIdx)
                          }
                          aria-current={
                            mIdx === activeModule && lIdx === activeLesson
                              ? "page"
                              : undefined
                          }
                        >
                          {typeIcon(les.type)}
                          <span className="flex-1 text-sm text-zinc-100 truncate">
                            {les.title}
                          </span>
                          {les.locked && (
                            <Lock className="w-4 h-4 text-zinc-500 ml-2" />
                          )}
                          {les.duration && (
                            <span className="ml-2 text-xs text-zinc-400">
                              {les.duration}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Skeleton Loader */}
          {videoLoading && (
            <div className="flex flex-col items-center justify-center h-96 bg-zinc-900/80 animate-pulse rounded-xl m-6">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
              <span className="text-zinc-400">Loading lesson...</span>
            </div>
          )}

          {/* Lesson Content */}
          {!videoLoading && (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 p-4 lg:p-10">
              <div className="flex-1 min-w-0">
                <div className="mb-4 flex items-center gap-3">
                  {typeIcon(lesson.type)}
                  <h2 className="text-2xl font-bold text-white">
                    {lesson.title}
                  </h2>
                  <button
                    className={`p-2 rounded-full transition ${
                      bookmarked
                        ? "bg-orange-500 text-black"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                    onClick={() => setBookmarked(!bookmarked)}
                    title={
                      bookmarked ? "Remove bookmark" : "Bookmark this lesson"
                    }
                  >
                    <Bookmark
                      className="w-5 h-5"
                      fill={bookmarked ? "currentColor" : "none"}
                    />
                  </button>
                  {lesson.locked && (
                    <span className="ml-2 px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
                {/* Video Player */}
                {lesson.type === "video" && (
                  <div className="rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-lg mb-4 relative">
                    <video
                      ref={videoRef}
                      src={lesson.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full h-[70vh] object-contain bg-black"
                      poster="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      onWaiting={() => setVideoLoading(true)}
                      onCanPlay={() => setVideoLoading(false)}
                      onTimeUpdate={() => {
                        if (videoRef.current) {
                          const progress =
                            (videoRef.current.currentTime /
                              videoRef.current.duration) *
                            100;
                          setVideoProgress(progress);
                        }
                      }}
                      onError={(e) => console.error("Video load error:", e)}
                      style={{ transition: "box-shadow 0.3s" }}
                    />
                    {/* Play/Pause Overlay */}
                    {!videoPlaying && (
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition"
                        onClick={() =>
                          videoRef.current && videoRef.current.play()
                        }
                        aria-label="Play video"
                      >
                        <Play className="w-16 h-16 text-orange-500 drop-shadow-lg" />
                      </button>
                    )}
                  </div>
                )}
                {/* Video Progress */}
                {lesson.type === "video" && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                      <span>Progress</span>
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-orange-500 to-orange-500 rounded-full transition-all"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                      <span>{Math.round(videoProgress)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">Speed:</span>
                      <select
                        value={playbackSpeed}
                        onChange={(e) =>
                          setPlaybackSpeed(parseFloat(e.target.value))
                        }
                        className="bg-zinc-800 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>
                  </div>
                )}
                {/* PDF Viewer */}
                {lesson.type === "pdf" && (
                  <div className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-lg mb-4 relative">
                    <iframe
                      src={lesson.pdfUrl}
                      className="w-full h-96 bg-white"
                      title={lesson.title}
                    />
                    <div className="p-4 bg-zinc-800">
                      <a
                        href={lesson.pdfUrl}
                        download
                        className="flex items-center gap-2 text-orange-400 hover:text-orange-200 transition"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                )}
                {/* Lesson Description */}
                {lesson.description && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1 text-zinc-200">
                      Description
                    </h3>
                    <p className="text-zinc-400">{lesson.description}</p>
                  </div>
                )}
                {/* Key Points */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1 text-zinc-200">
                    Key Points
                  </h3>
                  <ul className="list-disc list-inside text-zinc-400 space-y-1">
                    <li>Auto-save progress</li>
                    <li>Resume from last watched timestamp</li>
                    <li>Completion badge on finish</li>
                  </ul>
                </div>
                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:scale-105 transition text-zinc-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handlePrev}
                    disabled={activeModule === 0 && activeLesson === 0}
                  >
                    <ChevronsLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <button
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 hover:scale-105 transition text-white shadow focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={handleMarkCompleted}
                    aria-label="Mark as completed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Completed
                  </button>
                  <button
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:scale-105 transition text-zinc-200 shadow focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={handleNext}
                    disabled={
                      activeModule === courseData.modules.length - 1 &&
                      activeLesson ===
                        courseData.modules[activeModule].lessons.length - 1
                    }
                  >
                    Next
                    <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>
                {/* Completion Badge Animation */}
                {showBadge && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-500 p-8 rounded-3xl shadow-2xl animate-bounce-in">
                      <CheckCircle className="w-16 h-16 text-white mb-2 animate-pulse" />
                      <div className="text-2xl font-bold text-white">
                        Lesson Completed!
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Animations */}
      <style>{`
        .animate-bounce-in {
          animation: bounce-in 1s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes bounce-in {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
