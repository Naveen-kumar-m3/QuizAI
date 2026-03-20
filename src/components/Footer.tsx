"use client";

import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/5 py-8 px-4">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold">TEACH EDISON</span>
        </Link>
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-blue-400 transition-colors">About</Link>
          <Link href="/history" className="hover:text-blue-400 transition-colors">History</Link>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for learners
          </span>
        </div>
      </div>
    </footer>
  );
}
