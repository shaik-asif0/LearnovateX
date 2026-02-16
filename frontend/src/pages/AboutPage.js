import React from "react";
import { Users, Target, Shield, Award, Briefcase, Globe } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { useI18n } from "../i18n/I18nProvider";
import LandingNavbar from "../components/LandingNavbar";

const AboutPage = () => {
  const { t } = useI18n();

  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      image:
        "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80",
      bio: "Visionary leader with 15+ years in EdTech. Alex has led multiple startups to success, is a frequent keynote speaker at global education summits, and is passionate about democratizing access to technology. Connect on LinkedIn.",
      linkedin: "https://linkedin.com/in/alex-johnson-edtech",
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      image:
        "https://images.unsplash.com/photo-1519340333755-c8924e1b6e6b?auto=format&fit=crop&w=200&q=80",
      bio: "AI expert and former Google engineer. Sarah specializes in scalable AI architectures and has published research in top ML conferences. She mentors women in tech and leads our innovation sprints. Connect on LinkedIn.",
      linkedin: "https://linkedin.com/in/sarah-chen-ai",
    },
    {
      name: "Marcus Williams",
      role: "Head of Product",
      image:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
      bio: "Passionate about user-centric design. Marcus has 10+ years in UX, previously at Coursera, and is dedicated to building products that delight and empower learners. Connect on LinkedIn.",
      linkedin: "https://linkedin.com/in/marcus-williams-ux",
    },
    {
      name: "Jennifer Wu",
      role: "Head of Partnerships",
      image:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80",
      bio: "Jennifer brings a decade of experience forging alliances in EdTech and higher education. She is passionate about building bridges between academia and industry. Connect on LinkedIn.",
      linkedin: "https://linkedin.com/in/jennifer-wu-partnerships",
    },
    {
      name: "David Kim",
      role: "Lead AI Engineer",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      bio: "David is a machine learning specialist with a focus on adaptive learning systems. He has contributed to open-source AI projects and loves hackathons. Connect on LinkedIn.",
      linkedin: "https://linkedin.com/in/david-kim-ml",
    },
    {
      name: "Priya Singh",
      role: "Community Manager",
      image:
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=200&q=80",
      bio: "Priya leads our global student community, organizing events and support programs. She is an advocate for diversity in tech. Connect on LinkedIn.",
      linkedin: "https://linkedin.com/in/priya-singh-community",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <LandingNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            {t("about.title", "About LearnovateX")}
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            {t(
              "about.subtitle",
              "Empowering the next generation of tech leaders through AI-driven learning and career development."
            )}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Target className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold">
                {t("about.mission", "Our Mission")}
              </h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              To democratize access to high-quality tech education and career
              opportunities. We believe that everyone, regardless of their
              background, deserves a chance to succeed in the digital economy.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">
                {t("about.vision", "Our Vision")}
              </h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              To be the global standard for AI-powered learning, bridging the
              gap between education and industry requirements through innovation
              and personalized mentorship.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.values", "Core Values")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Integrity",
                desc: "We build trust through transparency and ethical AI.",
              },
              {
                icon: Users,
                title: "Inclusivity",
                desc: "Education for everyone, everywhere.",
              },
              {
                icon: Award,
                title: "Excellence",
                desc: "Setting the bar high in everything we do.",
              },
            ].map((value, index) => (
              <Card
                key={index}
                className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-colors"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {value.title}
                  </h3>
                  <p className="text-zinc-400">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.team", "Meet Our Team")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-zinc-400 text-sm mb-2">{member.bio}</p>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-400 hover:underline text-sm"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-8">Our Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
            <CardContent>
              <div className="text-4xl font-extrabold text-[var(--accent-color)] mb-3">
                2019
              </div>
              <h3 className="text-lg font-semibold mb-2">Founded</h3>
              <p className="text-zinc-400">
                Started with a mission to make tech education accessible.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
            <CardContent>
              <div className="text-4xl font-extrabold text-[var(--accent-color)] mb-3">
                2022
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Tutor Launch</h3>
              <p className="text-zinc-400">
                Released our first AI-driven personalized tutor and assessments.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
            <CardContent>
              <div className="text-4xl font-extrabold text-[var(--accent-color)] mb-3">
                2025
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Enterprise Adoption
              </h3>
              <p className="text-zinc-400">
                Scaled to support colleges and companies worldwide.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Partners */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-8">Trusted By</h2>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
            className="h-12 opacity-80 bg-white rounded p-2"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg"
            alt="IBM"
            className="h-12 opacity-80 bg-white rounded p-2"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
            alt="Google"
            className="h-12 opacity-80 bg-white rounded p-2"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
