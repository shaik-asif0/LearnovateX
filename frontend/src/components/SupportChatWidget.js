import React, { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { useLocation } from "react-router-dom";
import { Bot, Send, X } from "lucide-react";
import axiosInstance from "../lib/axios";

const DEFAULT_GREETING = { role: "assistant" };

const QUICK_QUESTION_KEYS = [
  "support.q1",
  "support.q2",
  "support.q3",
  "support.q4",
];

const toApiHistory = (messages) =>
  (messages || [])
    .filter((m) => m?.role === "user" || m?.role === "assistant")
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: String(m.content || "").slice(0, 1000),
    }));

const SupportChatWidget = () => {
  const location = useLocation();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([DEFAULT_GREETING]);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const isHiddenRoute = useMemo(() => {
    const p = location?.pathname || "/";
    return p === "/" || p === "/auth";
  }, [location?.pathname]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // allow other parts of the app to open the assistant by dispatching a global event
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-assistant", openHandler);
    return () => window.removeEventListener("open-assistant", openHandler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  // initialize translated greeting and quick questions
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: t(
          "support.greeting",
          "Hi! I’m LearnovateX Assistant. How can I help you with the app?"
        ),
      },
    ]);
  }, [t]);

  const sendMessage = async (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;

    setText("");
    setSending(true);

    const pendingId = `pending_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: "Typing…", _pending: pendingId },
    ]);

    try {
      const history = toApiHistory(messages);
      const res = await axiosInstance.post("/assistant/chat", {
        message: trimmed,
        context_path: location?.pathname || "",
        history,
      });
      const answer =
        res?.data?.response || "Sorry, I couldn’t generate a response.";

      setMessages((prev) =>
        prev.map((m) =>
          m?._pending === pendingId
            ? { role: "assistant", content: String(answer) }
            : m
        )
      );
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m?._pending === pendingId
            ? {
                role: "assistant",
                content:
                  "I couldn’t reach the assistant service. Please try again.",
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  if (isHiddenRoute) return null;

  return (
    <div className="fixed right-4 md:right-6 bottom-24 md:bottom-6 z-50">
      {/* Panel */}
      <div
        className={`w-[320px] max-w-[calc(100vw-2rem)] h-[420px] max-h-[calc(100vh-7rem)] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 ease-out origin-bottom-right ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <Bot className="w-4 h-4 text-black" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">
                LearnovateX Assistant
              </div>
              <div className="text-[11px] text-zinc-400">
                About the app • Help
              </div>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={listRef} className="h-[calc(100%-104px)] overflow-auto p-3">
          <div className="flex flex-col gap-2">
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={idx}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    isUser
                      ? "self-end text-black"
                      : "self-start bg-zinc-900 text-white border border-zinc-800"
                  }`}
                  style={
                    isUser ? { backgroundColor: "var(--accent-color)" } : {}
                  }
                >
                  {m.content}
                </div>
              );
            })}

            {messages.length <= 1 && (
              <div className="mt-2">
                <div className="text-xs text-zinc-400 mb-2">
                  {t("support.quickTitle", "Quick questions")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTION_KEYS.map((k) => {
                    const label = t(k, k);
                    return (
                      <button
                        key={k}
                        onClick={() => sendMessage(label)}
                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(text);
          }}
          className="px-3 py-2 bg-zinc-950 border-t border-zinc-800"
        >
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("support.placeholder", "Ask about the app…")}
              disabled={sending}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:ring-2"
              style={{
                boxShadow: "none",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={sending}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
        </form>
      </div>

      {/* Floating Button (hidden when open to prevent overlap) */}
      {!open && (
        <button
          aria-label="Open assistant"
          onClick={() => setOpen(true)}
          className="absolute bottom-0 right-0 w-12 h-12 rounded-full flex items-center justify-center border border-zinc-800 transition-transform duration-300 ease-out hover:scale-110 active:scale-95 support-jelly"
          style={{ backgroundColor: "var(--accent-color)" }}
        >
          <Bot className="w-6 h-6 text-black" />
        </button>
      )}
    </div>
  );
};

export default SupportChatWidget;
