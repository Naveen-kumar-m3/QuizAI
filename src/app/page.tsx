"use client";

import { useQuizStore } from '@/store/useQuizStore';
import LoginPage from '@/components/LoginPage';
import QuizConfig from '@/components/QuizConfig';
import QuizPlayer from '@/components/QuizPlayer';
import QuizResults from '@/components/QuizResults';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const searchParams = useSearchParams();
  const { isLoggedIn, questions, userAnswers } = useQuizStore();
  const [shareConfig, setShareConfig] = useState<{ topic: string; difficulty: string; count: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const share = searchParams.get("share");
    if (share) {
      try {
        const parsed = JSON.parse(atob(share));
        if (parsed.topic && parsed.difficulty != null && parsed.count) {
          setShareConfig({
            topic: String(parsed.topic),
            difficulty: ["Easy", "Medium", "Hard"].includes(parsed.difficulty) ? parsed.difficulty : "Medium",
            count: Math.min(20, Math.max(5, parseInt(String(parsed.count), 10) || 5))
          });
        }
      } catch {
        /* ignore invalid share */
      }
    }
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500"></div>
      </div>
    );
  }

  const isQuizActive = questions.length > 0;
  const isFinished = questions.length > 0 && userAnswers.length === questions.length && userAnswers.every(ans => ans !== "");

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl relative">

      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
          >
            <WelcomeScreen />
          </motion.div>
        ) : !isLoggedIn ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
          >
            <LoginPage />
          </motion.div>
        ) : !isQuizActive ? (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <QuizConfig initialConfig={shareConfig} onConsumeShare={() => setShareConfig(null)} />
          </motion.div>
        ) : !isFinished ? (
          <motion.div
            key="player"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <QuizPlayer />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <QuizResults />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
