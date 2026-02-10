import React from "react";
import {
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  MapPin,
  Phone,
  Mail as MailIcon,
} from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

const Footer = () => {
  const { t, setLanguage, language } = useI18n();

  const socials = [
    {
      icon: <Github className="w-5 h-5" />,
      label: t("footer.social.github", "GitHub"),
      href: "https://github.com/shaik-asif0",
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      label: t("footer.social.twitter", "Twitter"),
      href: "https://twitter.com/",
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      label: t("footer.social.linkedin", "LinkedIn"),
      href: "https://www.linkedin.com/in/shaik-md-asif/",
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      label: t("footer.social.youtube", "YouTube"),
      href: "https://www.youtube.com/",
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      label: t("footer.social.instagram", "Instagram"),
      href: "https://www.instagram.com/_shaik.asif__/",
    },
  ];

  // Updated footer layout: brand + socials, quick links, location/contact + support

  return (
    <footer className="w-full bg-zinc-900 border-t border-zinc-800 text-zinc-300 py-8 sm:py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Column 1: Brand + description + socials */}
        <div className="md:col-span-2 pr-6 md:pr-8 lg:pr-10">
          <div className="flex items-center gap-4">
            <h3 className="relative text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
              {t("footer.brand_prefix", "Learnovate")}
              <span className="text-orange-500">
                {t("footer.brand_accent", "X")}
              </span>
              {/* accent dot removed per design */}
            </h3>
          </div>
          <p className="mt-3 text-sm text-zinc-400 max-w-md">
            {t(
              "footer.description",
              "Built for learners — tools, roadmaps and AI to help you grow. Join our community and stay updated."
            )}
          </p>
          <div className="flex items-center mt-4 gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="md:col-span-1">
          <h5 className="text-white font-semibold mb-4">
            {t("footer.quickLinks.title", "Quick Links")}
          </h5>
          <ul className="text-zinc-400 space-y-3">
            <li>
              <a href="/ai-tutor" className="hover:text-white">
                {t("footer.links.aiTutor", "AI Tutor")}
              </a>
            </li>
            <li>
              <a href="/coding-arena" className="hover:text-white">
                {t("footer.links.codingArena", "Coding Arena")}
              </a>
            </li>
            {/* <li>
              <a href="/location" className="hover:text-white">
                {t("footer.links.location", "Location")}
              </a>
            </li> */}
            <li>
              <a href="/roadmap" className="hover:text-white">
                {t("footer.links.roadmap", "Roadmap")}
              </a>
            </li>
            <li>
              <a href="/learning-path" className="hover:text-white">
                {t("footer.links.learningPath", "Learning Path")}
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3 removed per design: About/Terms/Privacy moved or removed. */}

        {/* Column 4: Contact & Location */}
        <div className="md:col-span-1">
          <h5 className="text-white font-semibold mb-4">
            {t("footer.contact.title", "Contact & Location")}
          </h5>
          <div className="text-zinc-400 text-sm space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1 text-zinc-300" />
              <div>
                <div className="font-medium text-zinc-200">
                  {t(
                    "footer.location.addressLine1",
                    "LearnovateX Connect, NRIIT Campus"
                  )}
                </div>
                <div>
                  {t(
                    "footer.location.addressLine2",
                    "Visadala Rd, Guntur, Andhra Pradesh 522007"
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MailIcon className="w-5 h-5 text-zinc-300" />
              <a
                href="mailto:shaikasif.nriit@gmail.com"
                className="hover:text-white"
              >
                shaikasif.nriit@gmail.com
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-zinc-300" />
              <div>
                <div className="font-medium text-zinc-200">+91 95814 25100</div>
              </div>
            </div>

            {/* Support button moved to Contact column */}
          </div>
          {/* <div className="mt-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-assistant"))}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md hover:opacity-95"
            >
              <MailIcon className="w-4 h-4" />{" "}
              {t("footer.supportButton", "SUPPORT")}
            </button>
          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 text-xs text-zinc-600">
        <div className="border-t border-zinc-800 pt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div className="text-zinc-400">
            <span className="block">
              {t(
                "footer.legal.registered",
                "Registered office: NRIIT Campus, Visadala Rd, Guntur, Andhra Pradesh 522007"
              )}
            </span>
            <span className="block mt-1">
              {t("footer.legal.gstin", "GSTIN: 123456789")}
            </span>
          </div>
          <div className="text-zinc-400 mt-3 md:mt-0">
            © {new Date().getFullYear()} {t("footer.brand", "LearnovateX")}.{" "}
            {t("footer.copyright", "All rights reserved.")}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
