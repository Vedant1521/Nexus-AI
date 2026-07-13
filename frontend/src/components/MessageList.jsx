import MessageBubble from "./MessageBubble";

import { useDispatch, useSelector } from "react-redux";
import { getMessages, deleteMessageApi } from "../features/message.api";
import { sendPrompt } from "../features/agent.api";
import { setArtifacts, setMessages, setIsLoading, removeMessage, updateMessage } from "../redux/message.slice";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
function NeuralPulse() {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      {[0, 0.45, 0.9].map((delay, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-cyan-400/30"
          initial={{ scale: 0.3, opacity: 0.55 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.span
        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#14b4dc] to-[#0d9488]"
        style={{ boxShadow: "0 0 14px rgba(125,211,252,0.55)" }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const THINKING_LABELS = ["Thinking", "Analyzing", "Reasoning", "Generating"];

function GeneratingIndicator() {
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % THINKING_LABELS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const label = THINKING_LABELS[labelIndex];

  return (
    <div className="flex items-center gap-3 max-w-[72%] py-1">
      <NeuralPulse />
      <div className="flex overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            className="flex"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {label.split("").map((ch, i) => (
              <motion.span
                key={i}
                className="text-[13px] font-medium tracking-wide text-slate-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.07,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function MessageList({ onSelectSuggestion }) {

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const { messages, isLoading } = useSelector(state => state.message);
  const { selectedConversation } = useSelector(state => state.conversation);
  const dispatch = useDispatch();
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isAutoScrollRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    isAutoScrollRef.current = true;
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceFromBottom < 120;
    isAutoScrollRef.current = isNearBottom;
    setShowScrollBtn(!isNearBottom);
  }, []);

  useEffect(() => {
    if (isAutoScrollRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      });
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (selectedConversation?.title === "New Chat") return;
    const get = async () => {
      const data = await getMessages(selectedConversation?._id);
      dispatch(setMessages(data));
      const latestArtifactMessage =
  [...data]
    .reverse()
    .find(
      msg =>
        msg.artifacts &&
        msg.artifacts.length > 0
    );

if (latestArtifactMessage) {

  dispatch(
    setArtifacts(
      latestArtifactMessage.artifacts
    )
  );

}
    };
    get();
  }, [selectedConversation?._id]);

  const handleDelete = async (messageId) => {
    dispatch(removeMessage(messageId));
    try {
      await deleteMessageApi(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleRegenerate = async (assistantIndex) => {
    const userMessage = [...messages].slice(0, assistantIndex).reverse().find(m => m.role === "user");
    if (!userMessage || !selectedConversation) return;

    dispatch(setIsLoading(true));

    try {
      const formData = new FormData();
      formData.append("conversationId", selectedConversation._id);
      formData.append("prompt", userMessage.content);
      formData.append("agent", "auto");

      const data = await sendPrompt(formData);

      dispatch(updateMessage({
        index: assistantIndex,
        content: data.answer,
        images: data.images,
        artifacts: data.artifacts || []
      }));

      if (data.artifacts) {
        dispatch(setArtifacts(data.artifacts));
      }
    } catch (error) {
      console.error("Regenerate failed:", error);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="nexus-scrollbar h-full overflow-y-auto px-6 py-6 space-y-5"
      >
      {messages.length === 0 && !isLoading ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[20px] font-semibold text-slate-200 tracking-tight">NexusAI</h1>
            <h3 className="text-[15px] font-semibold text-slate-400 tracking-tight">How can I help you?</h3>
            <p className="text-[13px] text-slate-600 max-w-[260px] leading-relaxed">Ask me anything — code, ideas, explanations, or just a quick question.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {["Write a Netflix clone", "Explain Redis", "Build a dashboard"].map((s) => (
              <button
                key={s}
                onClick={() => onSelectSuggestion && onSelectSuggestion(s)}
                className="text-[12px] text-slate-400 bg-white/[0.04] border border-white/[0.07] px-3.5 py-1.5 rounded-lg hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-150 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <motion.div
              key={msg._id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <MessageBubble
                role={msg.role}
                content={msg.content}
                images={msg?.images || []}
                messageId={msg._id}
                isLast={i === messages.length - 1}
                onRegenerate={() => handleRegenerate(i)}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <GeneratingIndicator />
            </motion.div>
          )}
        
        </>
      )}
        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={scrollToBottom}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-[#0f1e2e] border border-[rgba(20,180,220,0.2)] text-slate-300 hover:text-[#14b4dc] hover:border-[#14b4dc]/40 hover:bg-[#14b4dc]/5 shadow-lg shadow-black/30 cursor-pointer transition-colors duration-150"
            title="Scroll to bottom"
          >
            <ArrowDown size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}