import { useState } from "react";
import { useDispatch } from "react-redux";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const login = async (token) => {
    const { data } = await api.post("/api/auth/login", { token });
    dispatch(setUserData(data.user));
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await login(token);
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormLogin = (e) => {
    e.preventDefault();
    handleGoogleLogin();
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row overflow-y-auto bg-[#060d14] font-outfit text-white">
      
      {/* ── LEFT COLUMN: Illustration & Intro ── */}
      <div className="w-full lg:w-[56%] bg-[#060d14] flex flex-col items-center justify-start pt-14 lg:pt-24 p-8 lg:p-16 min-h-[50vh] lg:min-h-screen select-none border-b lg:border-b-0 lg:border-r border-[rgba(20,180,220,0.08)] relative">
        {/* Subtle grid pattern for left panel */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(20,180,220,0.3) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        
        <div className="max-w-xl w-full flex flex-col items-center text-center gap-8 relative z-10">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center gap-2 mb-2 -mt-5">
            <span className="text-3xl lg:text-4xl font-extrabold tracking-[0.26em] font-syncopate text-white pl-[0.26em] relative">
              NEXUS <span className="text-[#14b4dc]" style={{ filter: "drop-shadow(0 0 10px rgba(20,180,220,0.55))" }}>AI</span>
            </span>
            <div className="w-14 h-[2px] bg-gradient-to-r from-transparent via-[#14b4dc]/50 to-transparent mt-0.5" />
          </div>

          {/* Illustration Container */}
          <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center">
            <img 
              src="/skeleton_refined.jpg" 
              alt="Workspace Illustration" 
              className="w-full h-full object-contain rounded-2xl border border-[rgba(20,180,220,0.15)] shadow-[0_0_40px_rgba(20,180,220,0.15)]"
            />
          </div>

          {/* Heading Text */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Turn your <span className="text-[#14b4dc] font-black italic">prompts</span> into <span className="bg-gradient-to-r from-[#14b4dc] to-[#0d9488] bg-clip-text text-transparent font-black italic">reality</span>.
            </h1>
            <p className="text-sm lg:text-base text-[#8faec4] font-semibold max-w-md mx-auto leading-relaxed">
              Start for free and build projects with a collaborative suite of specialized AI agents working in harmony.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Sign In Form ── */}
      <div className="w-full lg:w-[44%] bg-[#0b1621] flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 lg:min-h-screen relative">
        {/* Ambient Top Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 pointer-events-none opacity-40 blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(20,180,220,0.12) 0%, transparent 70%)"
          }}
        />

        <div className="max-w-md w-full mx-auto flex flex-col gap-5 lg:gap-6 relative z-10">
          
          {/* Custom Geometric Logo Icon (matching screenshot, colored cyan) */}
          <div className="flex items-center text-[#14b4dc] w-fit">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-current">
              <rect x="22" y="8" width="4" height="32" rx="2" fill="currentColor" />
              <rect x="8" y="22" width="32" height="4" rx="2" fill="currentColor" />
              <circle cx="15" cy="15" r="2.5" fill="currentColor" />
              <circle cx="33" cy="15" r="2.5" fill="currentColor" />
              <circle cx="15" cy="33" r="2.5" fill="currentColor" />
              <circle cx="33" cy="33" r="2.5" fill="currentColor" />
            </svg>
          </div>

          {/* Form Header */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Login to your Account
            </h2>
            <p className="text-sm text-[#7a9ab0] font-medium">
              Access your multi-agent AI workspace
            </p>
          </div>

          {/* Social Sign-in (Google) */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-[rgba(20,180,220,0.15)] hover:border-[rgba(20,180,220,0.25)] rounded-xl bg-[#060d14] hover:bg-[#0c1622] transition duration-150 cursor-pointer disabled:opacity-50 text-white"
          >
            <FaGoogle className="text-[#14b4dc]" size={16} />
            <span className="text-sm font-semibold text-slate-200">
              Continue with Google
            </span>
          </button>

          {/* Or Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[rgba(20,180,220,0.08)]" />
            <span className="text-xs font-semibold text-[#4a6b82] tracking-wider uppercase">
              or Sign in with Email
            </span>
            <div className="flex-1 h-px bg-[rgba(20,180,220,0.08)]" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleFormLogin} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#7a9ab0] uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@abc.com"
                className="w-full px-4 py-2.5 bg-[#060d14] border border-[rgba(20,180,220,0.12)] focus:border-[#14b4dc] rounded-xl outline-none text-white text-sm transition placeholder:text-slate-700 font-medium focus:ring-1 focus:ring-[#14b4dc]"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#7a9ab0] uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="***************"
                className="w-full px-4 py-2.5 bg-[#060d14] border border-[rgba(20,180,220,0.12)] focus:border-[#14b4dc] rounded-xl outline-none text-white text-sm transition placeholder:text-slate-700 font-medium focus:ring-1 focus:ring-[#14b4dc]"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 text-[#7a9ab0] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#060d14] border-[rgba(20,180,220,0.2)] text-[#14b4dc] focus:ring-[#14b4dc]/40"
                />
                Remember Me
              </label>
              <button
                type="button"
                className="text-[#14b4dc] hover:text-[#22c0e8] hover:underline bg-transparent border-none cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-br from-[#14b4dc] to-[#0d9488] hover:opacity-90 active:scale-[0.985] text-white font-semibold rounded-xl tracking-wide shadow-lg shadow-[rgba(20,180,220,0.15)] transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          {/* Stretchy Error Notification */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-xs text-center py-2.5 px-4 rounded-xl text-red-400 border border-red-950/20 bg-red-950/10 font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create Account Link */}
          <div className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-[#060d14]/60 border border-[rgba(20,180,220,0.08)] w-fit mx-auto text-xs shadow-sm">
            <span className="text-[#7a9ab0] font-medium">Not Registered Yet?</span>
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              className="text-[#14b4dc] hover:text-[#22c0e8] hover:underline font-bold bg-transparent border-none cursor-pointer transition-colors duration-150"
            >
              Create an account
            </button>
          </div>

          {/* Developer Github Credit */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-2 select-none">
            <span>Developed by</span>
            <a 
              href="https://github.com/Vedant1521" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 text-[#14b4dc] hover:text-[#22c0e8] hover:underline font-semibold transition-colors duration-150"
            >
              <FaGithub size={13} />
              <span>Vedant1521</span>
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
