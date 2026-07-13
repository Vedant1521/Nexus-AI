import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { FiCode } from "react-icons/fi";
import { detectLanguage } from "../utils/detectLanguage";
import { Code2, Eye, PanelRightClose, PanelRightOpen, X, Copy, Check, GitCompare, RotateCcw, History, ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addMessage, setArtifacts } from "../redux/message.slice";
import { saveMessageApi } from "../features/message.api";
import api from "../utils/axios";

export default function ArtifactPanel() {
  const dispatch = useDispatch();
  const [tab, setTab]               = useState("code");
  const [activeFile, setActiveFile] = useState(0);
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied]         = useState(false);

  const { messages } = useSelector(state => state.message);
  const { selectedConversation } = useSelector(state => state.conversation);

  const allArtifactVersions = useMemo(
    () => messages
      .filter(msg => msg.role === "assistant" && msg.artifacts && msg.artifacts.length > 0)
      .flatMap(msg => msg.artifacts),
    [messages]
  );

  const [selectedVersionIndex, setSelectedVersionIndex] = useState(-1);
  const [showDiff, setShowDiff] = useState(false);
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState("");

  useEffect(() => {
    setDeployedUrl("");
    if (allArtifactVersions.length > 0) {
      setSelectedVersionIndex(allArtifactVersions.length - 1);
    } else {
      setSelectedVersionIndex(-1);
    }
  }, [allArtifactVersions.length, selectedConversation?._id]);

  useEffect(() => {
    setDeployedUrl("");
  }, [selectedVersionIndex, activeFile]);

  // Close version dropdown menu when clicking anywhere else
  useEffect(() => {
    const handleOutsideClick = () => setVersionMenuOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const artifact = allArtifactVersions[selectedVersionIndex] || allArtifactVersions[allArtifactVersions.length - 1];
  const previousArtifact = selectedVersionIndex > 0 ? allArtifactVersions[selectedVersionIndex - 1] : null;

  if (!artifact) return null;

  const file = artifact?.files?.[activeFile];
  const previousFile = previousArtifact?.files?.find(f => f.name === file?.name);

  const htmlFile   = artifact?.files?.find(f => f.name === "index.html");
  const cssFile    = artifact?.files?.find(f => f.name === "style.css");
  const jsFile     = artifact?.files?.find(f => f.name === "script.js");
  const canPreview = Boolean(htmlFile);

  const previewDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>${cssFile?.content || ""}</style>
</head>
<body>
${htmlFile?.content || ""}
<script>${jsFile?.content || ""}<\/script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(file?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreVersion = async () => {
    if (selectedVersionIndex === -1 || !selectedConversation) return;
    try {
      const targetVersion = allArtifactVersions[selectedVersionIndex];
      const restoredArtifact = {
        ...targetVersion,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

      const messageData = {
        conversationId: selectedConversation._id,
        role: "assistant",
        content: `Restored project to Version ${selectedVersionIndex + 1}: "${targetVersion.title}"`,
        artifacts: [restoredArtifact]
      };

      const savedMessage = await saveMessageApi(messageData);
      dispatch(addMessage(savedMessage));
      dispatch(setArtifacts([restoredArtifact]));
    } catch (err) {
      console.error("Failed to restore version:", err);
    }
  };



  const handleDeploy = async () => {
    if (!artifact) return;
    setDeploying(true);
    setDeployedUrl("");
    try {
      const res = await api.post("/api/agent/deploy", {
        title: artifact.title,
        files: artifact.files.map(f => ({ name: f.name, content: f.content }))
      });
      if (res.data && res.data.success) {
        setDeployedUrl(res.data.url);
      }
    } catch (err) {
      console.error("Failed to deploy project:", err);
      alert(err.response?.data?.message || "Deployment failed. Please try again.");
    } finally {
      setDeploying(false);
    }
  };

  const onDeployClick = () => {
    if (deployedUrl) {
      window.open(deployedUrl, "_blank", "noopener,noreferrer");
    } else {
      handleDeploy();
    }
  };

  /* ── Shared code panel content ── */
  const PanelContent = ({ onClose }) => (
    <div className="flex flex-col h-full bg-[#0b1621]">

      {/* Header */}
      <div className="h-14 px-4 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
        <button
          onClick={onClose ?? (() => setCollapsed(true))}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
        >
          {onClose ? <X size={15} /> : <PanelRightClose size={15} />}
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#14b4dc]/10 border border-[#14b4dc]/20 shrink-0">
            <FiCode className="text-[#14b4dc]" size={12} />
          </div>
          <h2 className="text-[13px] font-medium text-slate-200 truncate flex-1">{artifact.title}</h2>

          {/* Version history dropdown (only if multiple versions exist) */}
          {allArtifactVersions.length > 1 && (
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVersionMenuOpen(!versionMenuOpen);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <History size={13} className="text-slate-400" />
                <span>v{selectedVersionIndex + 1}</span>
                <ChevronDown size={12} className={`text-slate-500 transition-transform ${versionMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {versionMenuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-9 z-50 w-56 bg-[#0f1e2e] border border-[rgba(20,180,220,0.12)] rounded-xl py-1.5 shadow-xl max-h-60 overflow-y-auto"
                >
                  {allArtifactVersions.map((ver, idx) => (
                    <button
                      key={ver.id || idx}
                      onClick={() => {
                        setSelectedVersionIndex(idx);
                        setVersionMenuOpen(false);
                      }}
                      className={`w-full flex flex-col px-3.5 py-2 text-left text-xs font-medium border-none bg-transparent cursor-pointer transition-all hover:bg-white/[0.04]
                        ${idx === selectedVersionIndex ? "text-[#14b4dc] bg-[#14b4dc]/5" : "text-slate-300 hover:text-white"}`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        Version {idx + 1}
                        {idx === allArtifactVersions.length - 1 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded font-semibold">Latest</span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate mt-0.5">{ver.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Restore Button (only if viewing an older version) */}
          {selectedVersionIndex < allArtifactVersions.length - 1 && (
            <button
              onClick={handleRestoreVersion}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#14b4dc] hover:text-[#22c0e8] bg-[#14b4dc]/10 border border-[#14b4dc]/20 hover:bg-[#14b4dc]/15 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Restore this version as latest"
            >
              <RotateCcw size={12} />
              <span>Restore</span>
            </button>
          )}

          {/* Diff Button (only in code tab & if we have a previous version) */}
          {tab === "code" && allArtifactVersions.length > 1 && (
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all border shrink-0 cursor-pointer
                ${showDiff 
                  ? "bg-gradient-to-br from-[#14b4dc] to-[#0d9488] text-white border-transparent shadow-[0_1px_8px_rgba(20,180,220,0.25)]" 
                  : "bg-transparent text-slate-400 border-white/[0.06] hover:bg-white/[0.05] hover:text-slate-200"
                }`}
              title="Toggle side-by-side diff view"
            >
              <GitCompare size={12} />
              <span>Diff</span>
            </button>
          )}

          {/* Copy button — only in code tab & not showing diff */}
          {tab === "code" && !showDiff && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors duration-150 bg-transparent border-none cursor-pointer"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}

          {/* Deploy Button */}
          {canPreview && (
            <button
              onClick={onDeployClick}
              disabled={deploying}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all border shrink-0 cursor-pointer disabled:opacity-50
                ${deployedUrl 
                  ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/15" 
                  : "bg-[#14b4dc]/10 border border-[#14b4dc]/20 text-[#14b4dc] hover:bg-[#14b4dc]/15"
                }`}
              title={deployedUrl ? "Click to open deployed site" : "Deploy static site to live hosting"}
            >
              {deploying ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Deploying...</span>
                </>
              ) : deployedUrl ? (
                <>
                  <Globe size={12} />
                  <span>Live URL</span>
                </>
              ) : (
                <>
                  <Globe size={12} />
                  <span>Deploy</span>
                </>
              )}
            </button>
          )}

          {canPreview && (
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-lg">
              <button
                onClick={() => {
                  setTab("code");
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150
                  ${tab === "code" ? "bg-gradient-to-br from-[#14b4dc] to-[#0d9488] text-white" : "text-slate-500 hover:text-slate-200"}`}
              >
                <Code2 size={11} /> Code
              </button>
              <button
                onClick={() => {
                  setTab("preview");
                  setShowDiff(false); // Disable diff on preview
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150
                  ${tab === "preview" ? "bg-gradient-to-br from-[#14b4dc] to-[#0d9488] text-white" : "text-slate-500 hover:text-slate-200"}`}
              >
                <Eye size={11} /> Preview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File tabs */}
      <AnimatePresence>
        {tab === "code" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex border-b border-white/[0.06] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0"
          >
            {artifact.files?.map((f, index) => (
              <button
                key={f.name}
                onClick={() => setActiveFile(index)}
                className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/[0.05] relative cursor-pointer bg-transparent
                  ${activeFile === index ? "text-[#14b4dc]" : "text-slate-500 hover:text-slate-300"}`}
              >
                {f.name}
                {activeFile === index && (
                  <motion.div layoutId="filetab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#14b4dc] to-[#0d9488] rounded-t-full" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "preview" && canPreview ? (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full h-full">
              <iframe title="preview" sandbox="allow-scripts" srcDoc={previewDoc} className="w-full h-full bg-white" />
            </motion.div>
          ) : showDiff ? (
            <motion.div key={`diff-${selectedVersionIndex}-${activeFile}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full h-full">
              <DiffEditor
                theme="vs-dark"
                language={detectLanguage(file?.name || "")}
                original={previousFile?.content || ""}
                modified={file?.content || ""}
                options={{ 
                  readOnly: true, 
                  originalEditable: false,
                  minimap: { enabled: false }, 
                  fontSize: 13, 
                  wordWrap: "on", 
                  automaticLayout: true, 
                  scrollBeyondLastLine: false, 
                  lineNumbers: "on", 
                  renderLineHighlight: "none" 
                }}
              />
            </motion.div>
          ) : (
            <motion.div key={`code-${selectedVersionIndex}-${activeFile}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full h-full">
              <Editor
                theme="vs-dark"
                language={detectLanguage(file?.name || "")}
                value={file?.content || ""}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, wordWrap: "on", automaticLayout: true, scrollBeyondLastLine: false, padding: { top: 16 }, lineNumbers: "on", renderLineHighlight: "none" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-br from-[#14b4dc] to-[#0d9488] text-white text-[12px] font-medium shadow-lg shadow-[rgba(20,180,220,0.2)] border-none cursor-pointer transition-colors duration-150"
      >
        <FiCode size={13} />
        View Code
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="mob-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <motion.div key="mob-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: "easeInOut" }} className="lg:hidden fixed inset-y-0 right-0 z-50 w-[88vw] max-w-[420px] border-l border-white/[0.06] overflow-hidden">
              <PanelContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.div key="open" initial={{ width: 0, opacity: 0 }} animate={{ width: "clamp(340px, 38%, 680px)", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} className="hidden lg:flex h-full border-l border-white/[0.06] flex-col overflow-hidden shrink-0">
            <PanelContent />
          </motion.div>
        ) : (
          <motion.div key="collapsed" initial={{ width: 0, opacity: 0 }} animate={{ width: 48, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} className="hidden lg:flex h-full border-l border-[rgba(20,180,220,0.08)] bg-[#0b1621] flex-col items-center py-4 gap-3 shrink-0">
            <button onClick={() => setCollapsed(false)} className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer">
              <PanelRightOpen size={15} />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                {artifact.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}