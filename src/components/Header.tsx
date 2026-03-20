"use client";

import { useQuizStore } from "../store/useQuizStore";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";

export default function Header() {
  const { isLoggedIn, username, logout } = useQuizStore();

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-midnight/40 backdrop-blur-2xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="flex h-20 items-center justify-between">
          <MagneticButton className="hover:scale-105 transition-transform">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                TEACH<span className="text-amber-500 not-italic">EDISON</span>
              </span>
            </Link>
          </MagneticButton>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/about" className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
              About
            </Link>
          {isLoggedIn ? (
            <>
              <Link href="/history" className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                History
              </Link>
              
              <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 group cursor-default">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all">
                    {username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-200 hidden md:block">{username}</span>
                </div>
                
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
             <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Interactive Learning</span>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
