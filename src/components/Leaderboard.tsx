"use client";

import { useEffect, useState } from "react";
import { Trophy, Loader2, Star } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  username: string;
  score_percent: number;
  time_taken_seconds: number | null;
  topic: string;
  difficulty: string;
  created_at: string;
}

export default function Leaderboard({ topic, difficulty }: { topic?: string; difficulty?: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (topic) params.set("topic", topic);
    if (difficulty) params.set("difficulty", difficulty);
    params.set("limit", "15");
    fetch(`/api/leaderboard?${params}`)
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [topic, difficulty]);

  if (loading) {
    return (
      <div className="glass-effect p-8 rounded-[2rem] flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="glass-effect p-8 rounded-[2rem] border border-white/5">
      <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-amber-500" />
        Leaderboard
      </h3>
      {entries.length === 0 ? (
        <p className="text-slate-500 text-sm">No scores yet. Complete a quiz to appear here!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e, i) => (
            <motion.div
              key={`${e.username}-${e.created_at}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-white">{e.username}</p>
                  {(e.topic || e.difficulty) && (
                    <p className="text-[10px] text-slate-500 uppercase">
                      {e.topic} • {e.difficulty}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {e.time_taken_seconds != null && (
                  <span className="text-xs text-slate-500">
                    {Math.floor(e.time_taken_seconds / 60)}m {e.time_taken_seconds % 60}s
                  </span>
                )}
                <span className="flex items-center gap-1 font-black text-blue-400">
                  <Star className="w-4 h-4" />
                  {e.score_percent}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
