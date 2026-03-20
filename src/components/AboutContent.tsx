"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Cpu,
  MessageSquare,
  Trophy,
  BarChart3,
  Download,
  Share2,
  Zap,
  Shield,
  ArrowRight,
  BookOpen,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI-Powered Generation",
    desc: "Uses Google Gemini to generate customized quizzes from any topic. Supports multiple choice, true/false, and fill-in-the-blank questions.",
  },
  {
    icon: MessageSquare,
    title: "AI Learning Assistant",
    desc: "Chat with an AI tutor during quizzes for hints and explanations without giving away answers. Hints apply a small score penalty to encourage learning.",
  },
  {
    icon: BarChart3,
    title: "Results & Analytics",
    desc: "View comprehensive results with score, time taken, question-by-question breakdown, correct answers, and performance trends over time.",
  },
  {
    icon: Trophy,
    title: "Leaderboard & Achievements",
    desc: "Compete on the leaderboard, unlock achievements (First Quiz, Perfect Score, 10 Quizzes), and track your learning streak.",
  },
  {
    icon: Download,
    title: "Download & Share",
    desc: "Export quiz results as PDF. Download quizzes as study guides. Share quiz links so others can take the same quiz.",
  },
  {
    icon: Shield,
    title: "Email Login & History",
    desc: "Sign in with email (Supabase) or continue as Guest. Quiz history persists with filtering, sorting, and retake support.",
  },
];

const tech = [
  "Next.js 16 (App Router)",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Zustand (State)",
  "Google Gemini AI",
  "Supabase (Auth & DB)",
  "Framer Motion",
  "Recharts",
];

export default function AboutContent() {
  return (
    <div className="w-full max-w-4xl space-y-16 px-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
          <Sparkles className="w-4 h-4" /> About the Project
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white uppercase italic">
          TEACH <span className="text-amber-500 not-italic">EDISON</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          An AI-powered quiz platform that generates dynamic, customized quizzes on any topic. 
          Built for learners who want to test knowledge, track progress, and improve through 
          intelligent feedback.
        </p>
      </motion.div>

      {/* Vision */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect p-8 sm:p-12 rounded-[2.5rem]"
      >
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-amber-500" /> Our Vision
        </h2>
        <p className="text-slate-300 leading-relaxed">
          TEACH EDISON aims to make learning interactive and adaptive. Instead of static question banks, 
          our AI generates fresh, topic-relevant quizzes tailored to your chosen difficulty and question count. 
          Whether you&apos;re studying for exams, exploring a new subject, or testing your knowledge, 
          TEACH EDISON adapts to your needs with detailed explanations and an AI assistant ready to help.
        </p>
      </motion.section>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Zap className="w-6 h-6 text-blue-500" /> Key Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-effect p-6 sm:p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect p-8 sm:p-12 rounded-[2.5rem]"
      >
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-purple-500" /> Technology Stack
        </h2>
        <div className="flex flex-wrap gap-3">
          {tech.map((t) => (
            <span
              key={t}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 glass-button-pro py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-widest group"
        >
          Start a Quiz
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}
