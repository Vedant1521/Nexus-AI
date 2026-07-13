import { useDispatch, useSelector } from "react-redux";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";

function Home() {
  return (
    <div className="h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden relative">
      <div className="absolute inset-0 bg-noise z-0 pointer-events-none mix-blend-overlay"></div>
      <Sidebar />
      <ChatArea />
      <ArtifactPanel />
    </div>
  );
}

export default Home;