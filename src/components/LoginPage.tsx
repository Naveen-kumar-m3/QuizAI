"use client";

import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useQuizStore } from "../store/useQuizStore";
import { ArrowRight, Shield, Mail, UserCircle } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { supabase } from "../lib/supabase";

function GlassCard({ children, isSignUp }: { children: React.ReactNode, isSignUp: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-md"
    >
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="glass-effect p-8 sm:p-12 rounded-[2.5rem] relative"
      >
        {/* Interior Accent Light */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
        
        {children}
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [alias, setAlias] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useQuizStore((state) => state.login);

  const isEmailConfigured = typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim()) return;
    const email = alias.trim();
    
    setError("");
    setLoading(true);
    
    try {
      if (isEmailConfigured && email.includes("@")) {
        if (isSignUp) {
          const { error: supeError } = await supabase.auth.signUp({
            email,
            password: secret || "QuizApp2025!",
            options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
          });
          if (supeError) throw supeError;
          login(email.split("@")[0]);
        } else {
          const { error: supeError } = await supabase.auth.signInWithPassword({
            email,
            password: secret || "QuizApp2025!",
          });
          if (supeError) throw supeError;
          login(email.split("@")[0]);
        }
      } else {
        login(alias.trim());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (isEmailConfigured) setError(msg.includes("Invalid") ? "Invalid email or password." : msg.slice(0, 60));
      else login(alias.trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => login("Guest");

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center p-4 perspective-[1500px]">
      <AnimatePresence mode="wait">
        <GlassCard key={isSignUp ? "register" : "login"} isSignUp={isSignUp}>
          <motion.div
            initial={{ opacity: 0, z: -20 }}
            animate={{ opacity: 1, z: 0 }}
            exit={{ opacity: 0, z: 20 }}
            className="relative z-10"
          >
            <div className="text-center mb-10">
              <div className="text-center mb-10 pt-8">
                {/* Logo removed as requested */}
              </div>
              
              <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase italic">
                Welcome <span className="text-blue-500 not-italic">Back</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium tracking-wide">
                {isSignUp ? "Create a new account" : "Sign in to your account"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-500" /> {isEmailConfigured ? "Email" : "Email or Username"}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
                  <input
                    type={isEmailConfigured ? "email" : "text"}
                    required
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-500" /> Password
                </label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
                  <input
                    type="password"
                    required
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">{error}</div>
              )}

              <MagneticButton disabled={loading} type="submit" className={"w-full glass-button-pro py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.1em] group border-amber-500/30 " + (loading ? "opacity-50" : "")}>
                <span className="flex items-center justify-center gap-2">
                  {loading ? "Authenticating..." : (isSignUp ? "Create Account" : "Continue with Email")}
                  {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-amber-500" />}
                </span>
              </MagneticButton>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0f172a] px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all font-bold text-sm"
              >
                <UserCircle className="w-5 h-5" />
                Continue as Guest
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-[0.1em]"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </motion.div>
        </GlassCard>
      </AnimatePresence>
    </div>
  );
}
