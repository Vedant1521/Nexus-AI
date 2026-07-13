import { Share2, MoreHorizontal, Zap, ChartBar, MessageCircle, MessageSquare, Sun, Moon } from "lucide-react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const {messages} = useSelector(state => state.message);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("nexus-app-theme", "dark");
  }, []);

  return (
    <div className="absolute top-0 inset-x-0 h-14 flex items-center justify-between px-5 bg-[var(--navbar-bg)] backdrop-blur-xl z-50 shrink-0" style={{ background: "color-mix(in srgb, var(--navbar-bg) 60%, transparent)" }}>
      {/* Left — empty */}
      <div className="flex items-center gap-2.5">
      </div>

      {/* Right — actions */}
      <div></div>

    </div>
  );
}