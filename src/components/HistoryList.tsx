"use client";

import { useState, useMemo } from "react";
import { useQuizStore } from "../store/useQuizStore";
import { CopySlash, ArrowLeft, Search, RotateCcw, Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

function HistoryCard({ item, index, onRetake }: { item: any, index: number, onRetake: (item: any) => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const percentage = Math.round((item.score / item.totalQuestions) * 100);
  const date = new Date(item.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left / rect.width - 0.5);
        y.set(e.clientY - rect.top / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="group"
    >
      <div className="glass-effect px-8 py-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden transition-all hover:border-blue-500/40 hover:bg-white/[0.08]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] -z-10 rounded-full group-hover:bg-blue-500/10 transition-all"></div>
        
        <div className={"flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-[2rem] border-2 shadow-2xl transition-all " + (percentage >= 70 ? "bg-blue-600/20 border-blue-500/50 text-blue-400" : percentage < 50 ? "bg-rose-500/20 border-rose-500/50 text-rose-400" : "bg-white/5 border-white/10 text-slate-400")}>
          <span className="text-3xl font-black italic">{percentage}%</span>
          <span className="text-[7px] font-black uppercase tracking-widest">Accuracy</span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <h3 className="text-2xl font-black text-white tracking-tight uppercase italic truncate max-w-[300px]">{item.topic}</h3>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
             <div className="px-3 py-1 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
               {item.difficulty}
             </div>
             <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
               {item.score} / {item.totalQuestions} POINTS
             </div>
          </div>
        </div>

        <div className="h-10 w-[1px] bg-white/5 hidden sm:block"></div>

        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">
           STAMP_{date.replace(/\s/g, '_').toUpperCase()}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onRetake(item); }}
          className="glass-button-pro p-4 rounded-2xl flex items-center justify-center text-blue-400 border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all active:scale-90"
          title="Retake Quiz"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

type SortBy = "date" | "score" | "topic";

export default function HistoryList() {
  const { history, retakeQuiz, username } = useQuizStore();
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  const userHistory = useMemo(() => {
    let list = history.filter(h => !username || h.username === username);
    if (filterDifficulty !== "all") {
      list = list.filter(h => h.difficulty === filterDifficulty);
    }
    return [...list].sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "score") return (b.score / b.totalQuestions) - (a.score / a.totalQuestions);
      return (a.topic ?? "").localeCompare(b.topic ?? "");
    });
  }, [history, username, sortBy, filterDifficulty]);

  if (userHistory.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center px-4 glass-effect max-w-2xl mx-auto mt-20 rounded-[4rem]"
      >
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white/5 border border-white/10 text-slate-700 shadow-inner">
          <CopySlash className="h-10 w-10 animate-pulse" />
        </div>
        <h2 className="text-4xl font-black text-white mb-3 uppercase italic tracking-tighter">History <span className="text-blue-500 not-italic">Empty</span></h2>
        <p className="text-slate-500 max-w-xs font-medium leading-relaxed">You haven't taken any quizzes yet. Start a new quiz to see your results here.</p>
        <Link href="/" className="glass-button-pro px-10 py-5 rounded-[2rem] mt-10 font-black text-xs uppercase tracking-widest">
          Start Your First Quiz
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-12 mt-12 mb-32 px-4">
      <div className="flex flex-col gap-6 pb-10 border-b border-white/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Search className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Your Quiz Records</span>
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
              Quiz <span className="text-blue-500 not-italic">History</span>
            </h1>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-2 ml-1">Review your past performance and improvements.</p>
          </div>
          <Link href="/" className="glass-button-pro py-3 px-8 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="all">All difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="topic">Sort by Topic</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {userHistory.map((item, i) => (
          <Link key={item.id} href="/">
            <HistoryCard item={item} index={i} onRetake={retakeQuiz} />
          </Link>
        ))}
      </div>
    </div>
  );
}
