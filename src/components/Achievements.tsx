"use client";

import { useQuizStore } from "../store/useQuizStore";
import { Flame, Target, Zap, Award } from "lucide-react";

const ACHIEVEMENTS = [
  { id: "first_quiz", label: "First Quiz", icon: Zap, check: (h: { totalQuestions: number }[]) => h.length >= 1 },
  { id: "five_quizzes", label: "5 Quizzes", icon: Target, check: (h: { totalQuestions: number }[]) => h.length >= 5 },
  { id: "perfect_score", label: "Perfect Score", icon: Award, check: (h: { score: number; totalQuestions: number }[]) =>
    h.some((a) => a.score >= a.totalQuestions) },
  { id: "ten_quizzes", label: "10 Quizzes", icon: Flame, check: (h: { totalQuestions: number }[]) => h.length >= 10 },
];

export default function Achievements() {
  const { history, username } = useQuizStore();
  const userHistory = history.filter((h) => !username || h.username === username);

  return (
    <div className="glass-effect p-6 rounded-[2rem] border border-white/5">
      <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-amber-500" />
        Achievements
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.check(userHistory);
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              className={`flex items-center gap-2 py-2 px-3 rounded-xl border transition-all ${
                unlocked ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/5 border-white/5 text-slate-600"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold truncate">{a.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
