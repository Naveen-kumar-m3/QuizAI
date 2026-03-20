"use client";

import { useState } from "react";
import { useQuizStore } from "../store/useQuizStore";
import { supabase } from "../lib/supabase";
import { CheckCircle2, XCircle, RotateCcw, DownloadCloud, Activity, Zap, BarChart3, Clock, Share2, FileText } from "lucide-react";
import Toast from "./Toast";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useEffect } from "react";

import confetti from "canvas-confetti";

export default function QuizResults() {
  const { questions, userAnswers, resetQuiz, history, hintsUsed, topic, difficulty, questionTypes } = useQuizStore();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const syncedAttemptId = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  useEffect(() => {
    const attempt = history[0];
    if (!attempt || syncedAttemptId.current === attempt.id) return;
    const sync = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock")) return;
        const res = await fetch("/api/sync-attempt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic: attempt.topic,
            difficulty: attempt.difficulty,
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            timeTakenSeconds: attempt.timeTakenSeconds,
            questions: attempt.questions,
            userAnswers: attempt.userAnswers,
          }),
        });
        if (res.ok) syncedAttemptId.current = attempt.id;
      } catch {
        /* ignore */
      }
    };
    void sync();
  }, [history]);

  const correctCount = questions.reduce((acc, q, index) => {
    const u = (userAnswers[index] ?? "").trim();
    const c = (q.answer ?? "").trim();
    const match = (q as { type?: string }).type === "fill_blank"
      ? u.toLowerCase() === c.toLowerCase()
      : u === c;
    return acc + (match ? 1 : 0);
  }, 0);
  
  const percentage = Math.round((correctCount / questions.length) * 100);

  useEffect(() => {
    if (percentage >= 70) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [percentage]);

  if (questions.length === 0) return null;
  
  const latestAttempt = history[0]; 


  const pieData = [
    { name: "Correct", value: correctCount, color: "#3b82f6" }, 
    { name: "Incorrect", value: questions.length - correctCount, color: "#f43f5e" } 
  ];

  const trendData = history.slice(0, 10).reverse().map((h, i) => ({
    name: "CYC-" + (i + 1),
    score: Math.round((h.score / h.totalQuestions) * 100)
  }));

  const shareQuiz = async () => {
    const payload = btoa(JSON.stringify({
      topic,
      difficulty,
      count: questions.length,
      questionTypes: questionTypes ?? ["multiple_choice"],
    }));
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/?share=${payload}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied! Share it so others can take the same quiz.");
    } catch {
      navigator.clipboard.writeText(url).then(() => showToast("Link copied!"));
    }
  };

  const exportQuizPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFillColor(2, 6, 23);
    pdf.rect(0, 0, 210, 297, "F");
    pdf.setTextColor(248, 250, 252);
    pdf.setFontSize(22);
    pdf.text(`Quiz: ${topic}`, 20, 25);
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`${difficulty} • ${questions.length} questions`, 20, 32);
    let y = 45;
    questions.forEach((q, i) => {
      if (y > 270) { pdf.addPage(); y = 20; pdf.setFillColor(2, 6, 23); pdf.rect(0, 0, 210, 297, "F"); }
      pdf.setFontSize(11);
      pdf.setTextColor(248, 250, 252);
      pdf.text(`${i + 1}. ${q.question}`, 20, y);
      y += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      (q.options?.length ? q.options : []).forEach((opt: string) => {
        pdf.text(`   • ${opt}`, 22, y); y += 6;
      });
      pdf.setTextColor(59, 130, 246);
      pdf.text(`   ✓ Answer: ${q.answer}`, 22, y); y += 8;
      if (q.explanation) {
        pdf.setTextColor(100, 116, 139);
        pdf.text(`   ${q.explanation}`, 22, y); y += 10;
      }
      y += 4;
    });
    pdf.save(`quiz-${topic.replace(/\s+/g, "-")}.pdf`);
    showToast("Quiz downloaded as study guide!");
  };

  const exportPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { backgroundColor: "#020617", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("quiz-results.pdf");
    showToast("Results PDF downloaded!");
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 mt-10 pb-20 px-4">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Quiz Finished</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
            Your <span className="text-blue-500 not-italic">Results</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">See how well you did on this quiz.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={shareQuiz} 
            className="glass-button-pro py-3 px-6 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all border-emerald-500/20 hover:border-emerald-500/40"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            Share Quiz
          </button>
          <button 
            onClick={exportQuizPDF} 
            className="glass-button-pro py-3 px-6 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all border-amber-500/20 hover:border-amber-500/40"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            Download Quiz
          </button>
          <button 
            onClick={exportPDF} 
            className="glass-button-pro py-3 px-6 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <DownloadCloud className="w-4 h-4" />
            Download Results
          </button>
        </div>
      </div>

      <div ref={pdfRef} className="space-y-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Accuracy Dial */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 glass-effect p-10 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[50px] -z-10 rounded-full"></div>
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-10">Your Accuracy</h2>
            
            <div className="relative w-52 h-52 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={"cell-" + index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "16px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-5xl font-black text-white tracking-tighter">{percentage}%</span>
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">Final Score</span>
              </div>
            </div>

            <button
              onClick={resetQuiz}
              className="w-full glass-button-pro py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl"
            >
              <RotateCcw className="w-5 h-5 mr-3 inline" />
              Take Quiz Again
            </button>
          </motion.div>

          {/* History Trend Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass-effect p-10 rounded-[3.5rem] flex flex-col relative"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-sm font-black text-slate-300 flex items-center gap-3 uppercase tracking-[0.2em]">
                <Activity className="w-5 h-5 text-blue-500" /> Your Progress History
              </h3>
            </div>
            
            <div className="h-56 w-full flex-1 min-h-0">
              {trendData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 'black' }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} tick={{ fontWeight: 'black' }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "16px", color: "#fff", padding: '15px' }}
                      itemStyle={{ color: "#3b82f6", fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={5} 
                      dot={{ r: 6, fill: "#020617", stroke: "#3b82f6", strokeWidth: 3 }} 
                      activeDot={{ r: 8, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} 
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-white/[0.02] rounded-[2rem] border border-white/5 border-dashed">
                  <Zap className="w-10 h-10 mb-3 opacity-20 text-blue-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest px-10 text-center">Take more quizzes to see your progress trend over time.</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Correct Answers</p>
                <p className="text-3xl font-black text-white italic">{correctCount} <span className="text-sm text-slate-600">/ {questions.length}</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Total Score</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-3xl font-black text-blue-500 italic">{latestAttempt?.score ?? correctCount}</p>
                  {(hintsUsed || 0) > 0 && (
                    <span className="text-[8px] text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full border border-orange-400/20 font-black uppercase">-{(hintsUsed || 0) * 0.5} hint</span>
                  )}
                </div>
              </div>
              {latestAttempt?.timeTakenSeconds != null && (
                <>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-1"><Clock className="w-3 h-3" /> Time Taken</p>
                    <p className="text-2xl font-black text-slate-300 italic">
                      {Math.floor(latestAttempt.timeTakenSeconds / 60)}m {latestAttempt.timeTakenSeconds % 60}s
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter ml-2 mb-8">Review <span className="text-blue-500">Your Answers</span></h3>
          
          {questions.map((q, index) => {
            const userAnswer = (userAnswers[index] ?? "").trim();
            const correctAnswer = (q.answer ?? "").trim();
            const qType = (q as { type?: string }).type;
            const isCorrect =
              qType === "fill_blank"
                ? userAnswer.toLowerCase() === correctAnswer.toLowerCase()
                : userAnswer === correctAnswer;

            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className={"glass-effect rounded-[2.5rem] overflow-hidden border-l-8 " + (isCorrect ? 'border-l-blue-600' : 'border-l-rose-600')}
              >
                <div className="p-8 sm:p-12 flex flex-col md:flex-row items-start gap-8 relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -z-10 rounded-full"></div>
                  
                  <div className="flex-shrink-0">
                    <div className={"w-16 h-16 rounded-2xl flex items-center justify-center border " + (isCorrect ? 'bg-blue-600/10 border-blue-600/30' : 'bg-rose-500/10 border-rose-500/30')}>
                      {isCorrect ? (
                        <CheckCircle2 className="h-8 w-8 text-blue-400" />
                      ) : (
                        <XCircle className="h-8 w-8 text-rose-400" />
                      )}
                    </div>
                    <div className="text-[10px] font-black text-slate-600 text-center mt-3 tracking-widest">#{ (index+1).toString().padStart(2, '0') }</div>
                  </div>
                  
                  <div className="space-y-8 w-full">
                    <h4 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                      {q.question}
                    </h4>

                    {qType === "fill_blank" ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="px-6 py-4 rounded-2xl border bg-white/5 border-white/5 text-slate-400">
                          <span className="text-[10px] font-black uppercase text-slate-500">Your answer: </span>
                          {userAnswer || "(blank)"}
                        </div>
                        <div className="px-6 py-4 rounded-2xl border bg-blue-600/20 border-blue-600/40 text-blue-200 font-bold ring-1 ring-blue-600/30">
                          <span className="text-[10px] font-black uppercase text-blue-400">Correct: </span>
                          {correctAnswer}
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(q.options?.length ? q.options : []).map((opt, optIdx) => {
                          let styling = "bg-white/5 border-white/5 text-slate-500";
                          if (opt === q.answer) {
                            styling = "bg-blue-600/20 border-blue-600/40 text-blue-200 shadow-[0_0_20px_rgba(37,99,235,0.2)] font-bold ring-1 ring-blue-600/30";
                          } else if (opt === userAnswer && !isCorrect) {
                            styling = "bg-rose-500/20 border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)] font-bold ring-1 ring-rose-600/30";
                          }
                          return (
                            <div key={optIdx} className={"px-6 py-4 rounded-2xl border text-sm transition-all " + styling}>
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="mt-6 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 italic">Neural Explanation</p>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Toast message={toastMsg} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
