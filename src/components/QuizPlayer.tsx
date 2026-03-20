"use client";

import { useEffect, useState } from "react";
import { useQuizStore } from "../store/useQuizStore";
import { ArrowLeft, ArrowRight, Clock, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "./MagneticButton";
import confetti from "canvas-confetti";
import AIChatHelper from "./AIChatHelper";

export default function QuizPlayer() {
  const { 
    questions, 
    currentQuestionIndex, 
    userAnswers, 
    answerQuestion, 
    nextQuestion, 
    prevQuestion,
    submitQuiz,
    timeRemaining,
    decrementTimer,
    useHint,
    hintsUsed
  } = useQuizStore();

  const [hintRevealed, setHintRevealed] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => {
      if (timeRemaining > 0) decrementTimer();
      else submitQuiz(); 
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeRemaining, decrementTimer, submitQuiz]);

  useEffect(() => {
    setHintRevealed(false);
    setAiHint(null);
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex];

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ":" + s.toString().padStart(2, "0");
  };

  const handleHintRequest = async () => {
    if (hintRevealed || hintLoading || !currentQuestion) return;
    useHint();
    setHintRevealed(true);
    setHintLoading(true);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
          topic: useQuizStore.getState().topic,
        }),
      });
      const data = await res.json();
      setAiHint(data.hint || "Consider the key concepts in the question.");
    } catch {
      setAiHint("Analyze the key terms in the question.");
    } finally {
      setHintLoading(false);
    }
  };

  const qType = (currentQuestion as { type?: string }).type ?? "multiple_choice";
  const isFillBlank = qType === "fill_blank";
  const options = currentQuestion.options?.length
    ? currentQuestion.options
    : qType === "true_false"
    ? ["True", "False"]
    : [];

  const handleAnswer = (option: string) => {
    answerQuestion(currentQuestionIndex, option);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#8b5cf6", "#ffffff"],
      shapes: ["circle"],
      gravity: 0.8,
      scalar: 0.7,
      disableForReducedMotion: true
    });
  };

  if (!currentQuestion) return null;

  return (
    <div className="mx-auto w-full max-w-4xl mt-10 mb-20 px-4">
      {/* Header Info */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-end gap-6 sm:gap-0">
        <div>
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Quiz in Progress</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Question <span className="text-blue-500 not-italic">{(currentQuestionIndex + 1).toString().padStart(2, '0')}</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            {questions.length} questions in total
          </p>
        </div>
        
        <div className={"flex items-center gap-3 px-6 py-3 rounded-2xl text-lg font-black border backdrop-blur-xl shadow-2xl " + (timeRemaining < 30 ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse" : "bg-white/5 text-blue-400 border-white/10")}>
          <Clock className="w-5 h-5" />
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Spatial Progress Bar */}
      <div className="w-full bg-white/5 rounded-full h-1.5 mb-12 overflow-hidden border border-white/5">
        <motion.div 
          className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 h-1.5 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]"
          initial={{ width: 0 }}
          animate={{ width: String(progressPercentage) + "%" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <motion.div 
        className="glass-effect rounded-[3rem] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="px-8 py-16 sm:px-16 min-h-[450px] relative">
          <div className="absolute top-0 right-0 p-8">
             <button 
                onClick={() => void handleHintRequest()}
                disabled={hintRevealed || selectedAnswer !== "" || hintLoading} 
                className="group relative flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30 transition-all disabled:opacity-20"
                title="Get AI Hint (-0.5 pts)"
              >
                {hintLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <HelpCircle className="w-6 h-6" />}
                <span className="absolute -top-10 scale-0 transition-all rounded bg-slate-900 border border-white/10 p-2 text-[10px] font-black uppercase text-white group-hover:scale-100 z-50 w-24 left-1/2 -translate-x-1/2">
                   AI Hint (-0.5)
                </span>
              </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-12 max-w-[90%] tracking-tight">
                {currentQuestion.question}
              </h3>

              {hintRevealed && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-10 p-6 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-slate-300 text-sm font-medium flex gap-4 items-start shadow-inner"
                >
                  <Sparkles className="w-5 h-5 shrink-0 mt-1 text-orange-400" />
                  <div>
                    <strong className="block text-orange-400 mb-1 uppercase text-[10px] tracking-widest">AI Hint (-0.5 pts):</strong>
                    {aiHint ?? "Consider the key concepts in the question."}
                  </div>
                </motion.div>
              )}

              <div className="grid gap-4 sm:grid-cols-1">
                {isFillBlank ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Your answer
                    </label>
                    <input
                      type="text"
                      value={selectedAnswer}
                      onChange={(e) => answerQuestion(currentQuestionIndex, e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-5 px-8 text-lg font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                    />
                  </div>
                ) : (
                  options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(option)}
                        className={"group w-full text-left px-8 py-5 flex items-center justify-between rounded-2xl border-2 transition-all duration-300 " + (isSelected ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(37,99,235,0.2)]" : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.08]")}
                      >
                        <div className="flex items-center gap-6">
                          <div className={"flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all " + (isSelected ? "border-blue-400 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" : "border-slate-700 group-hover:border-slate-500")}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full shadow-white shadow-xl" />}
                          </div>
                          <span className={"text-lg font-bold tracking-tight transition-colors " + (isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>{option}</span>
                        </div>
                        {isSelected && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full blur-[2px]" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white/[0.03] px-8 sm:px-16 py-8 flex items-center justify-between border-t border-white/5">
          <button
            onClick={() => { prevQuestion(); setHintRevealed(false); }}
            disabled={isFirstQuestion}
            className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white disabled:opacity-10 transition-all font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <MagneticButton
            onClick={() => { isLastQuestion ? submitQuiz() : nextQuestion(); setHintRevealed(false); }}
            disabled={!selectedAnswer}
            className={"glass-button-pro px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] " + (!selectedAnswer ? "opacity-20 cursor-not-allowed" : "")}
          >
            <span className="flex items-center gap-2">
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
              <ArrowRight className="w-5 h-5 " />
            </span>
          </MagneticButton>
        </div>
      </motion.div>

      <AIChatHelper />
    </div>
  );
}
