import { Share2, MoreHorizontal, Zap, ChartBar, MessageCircle, MessageSquare, Sun, Moon } from "lucide-react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const {messages} = useSelector(state => state.message);
  const [theme, setTheme] = useState(() => localStorage.getItem("nexus-app-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nexus-app-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <div className="h-14 flex items-center justify-between px-5 border-b border-[rgba(20,180,220,0.08)] bg-[#0b1621]">

      {/* Left — chat title */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#14b4dc]/10 border border-[#14b4dc]/20">
          <MessageSquare size={13} className="text-[#14b4dc]" />
        </div>
        <h2 className="text-[14px] font-semibold text-slate-100 tracking-tight">
          {selectedConversation?.title}
        </h2>
        <span className="text-[10px] font-medium text-slate-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
          {messages.length} Messages
        </span>
      </div>

      {/* Right — actions */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>

    </div>
  );
}