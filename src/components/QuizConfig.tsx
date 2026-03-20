"use client";

import { useState, useEffect } from "react";
import { useQuizStore } from "../store/useQuizStore";
import { Sparkles, Cpu, Loader2, Gauge, Layers, AlertCircle, X, Clock, CheckSquare, Zap } from "lucide-react";
import Leaderboard from "./Leaderboard";
import Achievements from "./Achievements";
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";

interface QuizConfigProps {
  initialConfig?: { topic: string; difficulty: string; count: number } | null;
  onConsumeShare?: () => void;
}

export default function QuizConfig({ initialConfig, onConsumeShare }: QuizConfigProps) {
  const { setQuizConfig, setQuestions, setGenerating, setError, error, isGenerating } = useQuizStore();

  const [localTopic, setLocalTopic] = useState(initialConfig?.topic ?? "");
  const [localDifficulty, setLocalDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    (initialConfig?.difficulty as "Easy" | "Medium" | "Hard") ?? "Medium"
  );
  const [localCount, setLocalCount] = useState(initialConfig?.count ?? 5);
  const [localTimePerQuestion, setLocalTimePerQuestion] = useState(60);
  const [localQuestionTypes, setLocalQuestionTypes] = useState<("multiple_choice" | "true_false" | "fill_blank")[]>(["multiple_choice"]);
  const [showTopicAlert, setShowTopicAlert] = useState(false);

  const toggleQuestionType = (t: "multiple_choice" | "true_false" | "fill_blank") => {
    setLocalQuestionTypes((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      return next.length === 0 ? ["multiple_choice"] : next;
    });
  };

  useEffect(() => {
    if (initialConfig) {
      setLocalTopic(initialConfig.topic);
      setLocalDifficulty((initialConfig.difficulty as "Easy" | "Medium" | "Hard") || "Medium");
      setLocalCount(Math.min(20, Math.max(5, initialConfig.count)));
      onConsumeShare?.();
    }
  }, [initialConfig, onConsumeShare]);

  const triggerDigitalPulse = () => {
    const defaults = {
      spread: 70,
      ticks: 60,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#ffffff'] // Neural Blue/Cyan
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 30,
        scalar: 0.8,
        shapes: ['square']
      });

      confetti({
        ...defaults,
        particleCount: 15,
        scalar: 1.2,
        shapes: ['square']
      });
    };

    // Burst from two sides of the button
    shoot();
  };

  const handleQuickQuiz = () => {
    setLocalTopic("General Knowledge");
    setLocalCount(5);
    void handleGenerateWithTopic("General Knowledge", "Medium", 5);
  };

  const handleGenerateWithTopic = async (topic: string, difficulty: "Easy" | "Medium" | "Hard", count: number, timePerQuestion = 60, types = ["multiple_choice"] as ("multiple_choice" | "true_false" | "fill_blank")[]) => {
    setQuizConfig(topic, difficulty, count, timePerQuestion, types);
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count, questionTypes: types }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setQuestions(data.questions, timePerQuestion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!localTopic.trim()) {
      triggerDigitalPulse();
      setShowTopicAlert(true);
      // Auto-hide alert after 5 seconds
      setTimeout(() => setShowTopicAlert(false), 5000);
      return;
    }

    await handleGenerateWithTopic(localTopic, localDifficulty, localCount, localTimePerQuestion, localQuestionTypes);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect p-12 flex flex-col items-center text-center max-w-md w-full rounded-[3rem] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-ping"></div>
            <div className="relative bg-white/5 border border-white/10 p-6 rounded-full shadow-2xl">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase italic">
            Preparing Your <span className="text-blue-500 not-italic">Quiz</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Creating {localCount} questions about <span className="text-blue-300">"{localTopic}"</span>. Just a moment...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-12 mt-10 mb-20 px-4">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Cpu className="w-3.5 h-3.5" /> Quiz Engine V5.0
        </motion.div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
          Setup Your<span className="text-amber-500 not-italic">Quiz</span>
        </h1>
        <p className="text-slate-400 text-lg font-medium max-w-lg mx-auto">Enter the details below to generate your custom questions.</p>
        <button
          onClick={handleQuickQuiz}
          disabled={isGenerating}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm hover:bg-amber-500/20 transition-all disabled:opacity-50"
        >
          <Zap className="w-4 h-4" /> Quick Quiz — 5 questions, General Knowledge
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="glass-effect p-8 sm:p-12 rounded-[3.5rem] space-y-10 relative"
      >
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Quiz Topic
          </label>
          <div className="relative">
            <input
              type="text"
              value={localTopic}
              onChange={(e) => setLocalTopic(e.target.value)}
              placeholder="e.g. Advanced Thermodynamics, Deep Learning, Renaissance Art"
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 text-xl font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
              <Layers className="w-3 h-3" /> Questions ({localCount})
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={localCount}
              onChange={(e) => setLocalCount(parseInt(e.target.value))}
              className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-600 border border-white/5"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-black uppercase tracking-widest px-1">
              <span>Min</span>
              <span>Max</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Timer (sec/question)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="120"
                step="15"
                value={localTimePerQuestion}
                onChange={(e) => setLocalTimePerQuestion(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-bold text-slate-400 w-12">
                {localTimePerQuestion === 0 ? "Off" : `${localTimePerQuestion}s`}
              </span>
            </div>
          </div>

          <div className="space-y-4 sm:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
              <CheckSquare className="w-3 h-3" /> Question Types
            </label>
            <div className="flex flex-wrap gap-2">
              {(["multiple_choice", "true_false", "fill_blank"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleQuestionType(t)}
                  className={"py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all " +
                    (localQuestionTypes.includes(t)
                      ? "bg-blue-600 border-blue-400 text-white"
                      : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10")}
                >
                  {t === "multiple_choice" ? "Multiple Choice" : t === "true_false" ? "True/False" : "Fill in Blank"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
              <Gauge className="w-3 h-3" /> Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  onClick={() => setLocalDifficulty(level as any)}
                  className={"py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all " + (localDifficulty === level ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10")}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[1.5rem] bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-bold uppercase tracking-wider text-center flex flex-col gap-4"
          >
            <span>System Failure: {error}</span>
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => { setError(null); handleGenerate(); }}
                className="text-white bg-blue-500/30 py-2 px-4 rounded-xl border border-blue-500/50 hover:bg-blue-500/40 transition-all"
              >
                Retry
              </button>
              <button 
                onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}
                className="text-white bg-rose-500/20 py-2 px-4 rounded-xl border border-rose-500/30 hover:bg-rose-500/30 transition-all"
              >
                Get API Key
              </button>
            </div>
          </motion.div>
        )}

        <MagneticButton
          onClick={handleGenerate}
          className="w-full glass-button-pro py-6 rounded-[2rem] text-lg font-black uppercase tracking-[0.2em] group shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)]"
        >
          <span className="flex items-center justify-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-400 group-hover:rotate-12 transition-transform" />
            Generate Quiz
          </span>
        </MagneticButton>

      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <Achievements />
        <Leaderboard />
      </div>

      {/* Bottom Alert Popup */}
      <AnimatePresence>
        {showTopicAlert && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#020617]/80 p-5 backdrop-blur-2xl shadow-2xl">
              {/* Decorative gradient background */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/10 via-transparent to-rose-500/10" />
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-black uppercase tracking-tighter text-white italic">
                    Topic <span className="text-rose-500 not-italic">Missing</span>
                  </h3>
                  <p className="text-xs font-medium text-slate-400">
                    Please enter a quiz topic to continue.
                  </p>
                </div>

                <button 
                  onClick={() => setShowTopicAlert(false)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress bar for auto-hide */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-blue-500/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
