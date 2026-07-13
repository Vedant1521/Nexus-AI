import { useEffect, useMemo, useState } from "react";
import { Plus, MessageSquare, Settings, LogOut, User, PenSquare, Menu, X, Coins, ConeIcon, CoinsIcon, MoreVertical, Pin, PinOff, Trash2, Edit2, Crown, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { createConversation, getConversations, updateConversations, deleteConversationApi } from "../features/conversation.api";
import { addConversation, setConversations, setSelectedConversation, removeConversation, updateConversationState } from "../redux/conversation.slice";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import BillingDrawer from "./BillingDrawer";

export default function Sidebar() {
  const [hovered, setHovered]     = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError,setImageError]=useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { userData } = useSelector(state => state.user);
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const dispatch = useDispatch();

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(c => c.title?.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(() => {
    const pinned = [];
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    for (const chat of filteredConversations) {
      if (chat.isPinned && !searchQuery.trim()) {
        pinned.push(chat);
        continue;
      }
      const updated = new Date(chat.updatedAt);
      if (updated >= startOfToday) {
        today.push(chat);
      } else if (updated >= startOfYesterday) {
        yesterday.push(chat);
      } else {
        older.push(chat);
      }
    }

    return { pinned, today, yesterday, older };
  }, [filteredConversations, searchQuery]);

  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        dispatch(setConversations(data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchConversations();
  }, [userData?._id]);

  const handleCreateConversation = () => {
    dispatch(setSelectedConversation(null));
    dispatch(setMessages([]));
    dispatch(setArtifacts([]));
    setMobileOpen(false);
  };

  const handleSelectConversation = async (conversation) => {
    setMobileOpen(false);
    setSearchQuery("");
    dispatch(setSelectedConversation(conversation));
    const messages = await getMessages(conversation._id);
    dispatch(setMessages(messages));
     dispatch(setArtifacts(messages.artifacts));
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenu(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleRenameSubmit = async (chatId) => {
    if (!editingTitle.trim()) return;
    try {
      await updateConversations(chatId, editingTitle.trim());
      dispatch(updateConversationState({ conversationId: chatId, title: editingTitle.trim() }));
    } catch (err) {
      console.error(err);
    }
    setEditingChatId(null);
  };

  const handleTogglePin = async (chat) => {
    try {
      const newPinState = !chat.isPinned;
      await updateConversations(chat._id, undefined, newPinState);
      dispatch(updateConversationState({ conversationId: chat._id, isPinned: newPinState }));
    } catch (err) {
      console.error(err);
    }
    setActiveMenu(null);
  };

  const handleDeleteConversation = async (chatId) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await deleteConversationApi(chatId);
        dispatch(removeConversation(chatId));
        if (selectedConversation?._id === chatId) {
          dispatch(setSelectedConversation(null));
          dispatch(setMessages([]));
          dispatch(setArtifacts([]));
        }
      } catch (err) {
        console.error(err);
      }
    }
    setActiveMenu(null);
  };

  const renderChatItem = (chat) => {
    const isActive = selectedConversation?._id === chat._id;
    const isHov    = hovered === chat._id;
    return (
      <div
        key={chat._id}
        onClick={() => handleSelectConversation(chat)}
        onMouseEnter={() => setHovered(chat._id)}
        onMouseLeave={() => setHovered(null)}
        className={`group relative flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150
          ${isActive ? "bg-[rgba(20,180,220,0.08)] border-[rgba(20,180,220,0.15)]"
          : isHov   ? "bg-[#132335] border-transparent"
          :            "bg-transparent border-transparent"}`}
      >
        <div className={`flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg transition-colors duration-150
          ${isActive ? "bg-[rgba(20,180,220,0.15)] text-[#14b4dc]" : "bg-white/[0.05] text-slate-500"}`}>
          <MessageSquare size={13} />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          {editingChatId === chat._id ? (
            <input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleRenameSubmit(chat._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(chat._id);
                if (e.key === "Escape") setEditingChatId(null);
              }}
              className="bg-white/[0.06] border-none text-[13px] font-medium text-slate-100 px-2 py-1 rounded-lg outline-none w-full ring-1 ring-white/10 focus:ring-[#14b4dc]/40 transition-all"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <p className={`text-[13px] font-medium truncate ${isActive ? "text-slate-100" : "text-slate-300"}`}>
                {chat.title}
              </p>
              {chat.isPinned && (
                <Pin size={10} className="text-[#14b4dc] shrink-0 rotate-45" />
              )}
            </div>
          )}
        </div>

        {!editingChatId && (isHov || isActive || activeMenu === chat._id) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === chat._id ? null : chat._id);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-md border-none bg-transparent hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <MoreVertical size={13} />
          </button>
        )}

        {activeMenu === chat._id && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2 top-9 z-50 w-36 bg-[#0f1e2e] border border-[rgba(20,180,220,0.12)] rounded-xl py-1.5 shadow-xl"
          >
            <button
              onClick={() => handleTogglePin(chat)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white border-none bg-transparent cursor-pointer"
            >
              {chat.isPinned ? (
                <>
                  <PinOff size={12} className="text-slate-500" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin size={12} className="text-slate-500" />
                  Pin
                </>
              )}
            </button>

            <button
              onClick={() => {
                setEditingChatId(chat._id);
                setEditingTitle(chat.title);
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white border-none bg-transparent cursor-pointer"
            >
              <Edit2 size={12} className="text-slate-500" />
              Rename
            </button>

            <div className="my-1 border-t border-white/[0.06]" />

            <button
              onClick={() => handleDeleteConversation(chat._id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border-none bg-transparent cursor-pointer"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const PanelIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  );

  /* ── Collapsed rail — desktop only ── */
  const CollapsedRail = () => (
    <div className="hidden lg:flex flex-col items-center w-[56px] h-screen bg-[#0b1621] border-r border-[rgba(20,180,220,0.08)] py-4 gap-1 shrink-0">
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer mb-1"
      >
        <PanelIcon />
      </button>

      <button
        onClick={handleCreateConversation}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
      >
        <Plus size={17} />
      </button>

      <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto w-full px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-1">
        {filteredConversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          return (
            <button
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              title={chat.title}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-150 border-none cursor-pointer
                ${isActive ? "bg-[rgba(20,180,220,0.12)] text-[#14b4dc]" : "bg-transparent text-slate-500 hover:bg-[#132335] hover:text-slate-300"}`}
            >
              <MessageSquare size={15} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        {userData && (
          <div className="relative">
            {userData.avatar
              ? <img src={userData.avatar} alt={userData.name} className="w-8 h-8 rounded-[8px] object-cover border-2 border-[#14b4dc]/25" />
              : <div className="w-8 h-8 rounded-[8px] bg-white/[0.06] flex items-center justify-center"><User size={14} className="text-slate-400" /></div>
            }
            <span className="absolute -bottom-px -right-px w-2 h-2 bg-green-500 rounded-full border-[1.5px] border-[#0d0f14] block" />
          </div>
        )}
      </div>
    </div>
  );

  /* ── Full sidebar content ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(true)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <PanelIcon />
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <X size={15} />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <img src="/logo.jpg" alt="NexusAI Logo" className="w-5 h-5 rounded-md object-cover" />
          <span className="text-[16px] font-semibold text-slate-100 tracking-tight">NexusAI</span>
        </div>

        {((userData?.plan ?? "pro").toLowerCase() === "pro") ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-amber-500/20 to-yellow-600/20 text-amber-300 border border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
            <Crown size={11} className="text-amber-400 fill-amber-400/25 shrink-0" />
            Pro
          </span>
        ) : (
          <span className="text-[11px] font-bold text-slate-400 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full tracking-wider uppercase shrink-0">
            {userData?.plan}
          </span>
        )}

      </div>

      {/* New Chat */}
      <div className="px-4 pt-4 pb-1">
        <button
          onClick={handleCreateConversation}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-br from-[#14b4dc] to-[#0d9488] rounded-xl py-[10px] border-none cursor-pointer hover:opacity-90 transition-opacity duration-150"
        >
          <Plus size={15} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white/[0.04] border border-white/[0.06] text-[13px] text-slate-200 placeholder:text-slate-600 rounded-xl pl-9 pr-8 py-2.5 outline-none focus:border-[#14b4dc]/30 focus:bg-white/[0.06] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filteredConversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-[12px] text-slate-600">
              {searchQuery ? `No conversations match "${searchQuery}"` : "No conversations yet"}
            </p>
          </div>
        ) : searchQuery ? (
          filteredConversations.map(chat => renderChatItem(chat))
        ) : (
          <>
            {groupedConversations.pinned.length > 0 && (
              <>
                <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">Pinned</p>
                {groupedConversations.pinned.map(chat => renderChatItem(chat))}
              </>
            )}
            {groupedConversations.today.length > 0 && (
              <>
                <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">Today</p>
                {groupedConversations.today.map(chat => renderChatItem(chat))}
              </>
            )}
            {groupedConversations.yesterday.length > 0 && (
              <>
                <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">Yesterday</p>
                {groupedConversations.yesterday.map(chat => renderChatItem(chat))}
              </>
            )}
            {groupedConversations.older.length > 0 && (
              <>
                <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">Older</p>
                {groupedConversations.older.map(chat => renderChatItem(chat))}
              </>
            )}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="mx-2.5 h-px bg-white/[0.06]" />

      {/* Footer */}
      <div className="px-3.5 py-3.5">
        {userData ? (
          <div className="flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/[0.05] transition-colors duration-150">
            <div className="relative shrink-0">
              {
  !userData?.avatar || imageError ? (
    <div className="w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center">
      <User size={15} className="text-slate-400" />
    </div>
  ) : (
    <img
      src={userData.avatar}
      alt={userData.name}
      className="w-9 h-9 rounded-[10px] object-cover border-2 border-[#14b4dc]/25"
      onError={() => setImageError(true)}
    />
  )
}
              <span className="absolute -bottom-px -right-px w-[9px] h-[9px] bg-green-500 rounded-full border-2 border-[#0d0f14] block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-slate-100 truncate">{userData.name}</p>
              <p className="text-[11px] text-slate-600 mt-px">{userData.plan || "Free Plan"}</p>
            </div>
            <div className="flex gap-1">
              <button
    onClick={() => setShowBilling(true)}
    className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all duration-150"
>
    <CoinsIcon size={16}/>
</button>
              <button onClick={logout} className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all duration-150">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-1">
            <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-200 bg-white/[0.05] border border-white/[0.08] rounded-xl py-[11px] cursor-pointer hover:bg-white/[0.08] transition-colors duration-150">
              Login
            </button>
          </div>
        )}
      </div>

    </div>
  );

  if (collapsed) return <CollapsedRail />;

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0b1621] border border-[rgba(20,180,220,0.1)] text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer"
      >
        <Menu size={16} />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* ── Sidebar panel ── */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[270px] h-screen shrink-0
        bg-[#0b1621] border-r border-[rgba(20,180,220,0.08)]
        transition-transform duration-250
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <SidebarContent />
      </div>

<BillingDrawer

    open={showBilling}

    onClose={()=>
        setShowBilling(false)
    }

/>
    </>
  );
}