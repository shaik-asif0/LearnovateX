import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Bot,
  Code,
  FileText,
  MessageSquare,
  TrendingUp,
  Building2,
  GraduationCap,
  Users,
  Sparkles,
  Target,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Bot className="w-12 h-12 text-white" />,
      title: "AI Personal Tutor",
      description:
        "Get personalized explanations for Python, Java, DSA, SQL, and more with adaptive learning.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: <Code className="w-12 h-12 text-white" />,
      title: "Code Evaluation",
      description:
        "Real-time code analysis with complexity checks, optimization suggestions, and plagiarism detection.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <FileText className="w-12 h-12 text-white" />,
      title: "Resume Intelligence",
      description:
        "AI-powered resume analysis with credibility scoring and skill verification.",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-white" />,
      title: "Mock Interviews",
      description:
        "Practice with AI-powered interview simulations and get detailed feedback.",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-white" />,
      title: "Career Dashboard",
      description:
        "Track your progress, skill mastery, and interview readiness in one place.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Building2 className="w-12 h-12 text-white" />,
      title: "Company Portal",
      description:
        "Create assessments, evaluate candidates, and streamline hiring with AI.",
      gradient: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="col-span-full md:col-span-7 space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                Master Skills.
                <br />
                <span className="text-zinc-400">Ace Interviews.</span>
                <br />
                Build Your Career.
              </h1>
              <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
                The only AI-powered platform you need to learn, practice, and
                land your dream job. Replace coaching institutes with
                intelligent tutoring, automated assessments, and career
                readiness tracking.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="get-started-btn"
                  size="lg"
                  className="rounded-full font-semibold bg-white text-black hover:bg-zinc-200"
                  onClick={() => navigate("/auth")}
                >
                  Get Started Free
                </Button>
                <Button
                  data-testid="learn-more-btn"
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold border-zinc-700 text-white hover:bg-zinc-800"
                  onClick={() => navigate("/auth")}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="col-span-full md:col-span-5">
              <img
                src="https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg"
                alt="Student learning"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Everything You Need to Succeed
            </h2>
            <p className="text-zinc-400 text-lg">
              One platform, unlimited possibilities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                data-testid={`feature-card-${index}`}
                className="bg-zinc-800 border-zinc-700 hover:border-zinc-500 transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-8 space-y-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For All Users Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Built for Everyone
            </h2>
            <p className="text-zinc-400 text-lg">
              From students to enterprises
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                label: "Students",
                desc: "Learn & Practice",
              },
              {
                icon: <Target className="w-6 h-6" />,
                label: "Job Seekers",
                desc: "Interview Prep",
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                label: "Companies",
                desc: "Hire Faster",
              },
              {
                icon: <GraduationCap className="w-6 h-6" />,
                label: "Colleges",
                desc: "Track Progress",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="text-center p-8 bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white flex items-center justify-center text-black">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">
                  {item.label}
                </h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg mb-8 text-zinc-600">
            Join thousands of learners and professionals using AI to accelerate
            their growth.
          </p>
          <Button
            data-testid="cta-start-btn"
            size="lg"
            className="rounded-full font-semibold bg-black text-white hover:bg-zinc-800"
            onClick={() => navigate("/auth")}
          >
            Start Learning Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-400">
          <p>&copy; 2025 AI Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
