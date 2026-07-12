import { useDispatch, useSelector } from "react-redux";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";

function Home() {
  return (
    <div className="h-screen flex bg-[#060d14] text-white overflow-hidden">
      <Sidebar />
      <ChatArea />
      <ArtifactPanel />
    </div>
  );
}

export default Home;