import { create } from "zustand";
import { persist } from "zustand/middleware";
import { QuizState, Question, QuizAttempt } from "../types";

export interface ExtendedQuizState extends QuizState {
  timeRemaining: number;
  hintsUsed: number;
  quizStartTime: number;
  setTimer: (time: number) => void;
  decrementTimer: () => void;
  useHint: () => void;
}

export const useQuizStore = create<ExtendedQuizState>()(
  persist(
    (set, get) => ({
      // User / Auth
      isLoggedIn: false,
      username: "",

      // Config
      topic: "",
      difficulty: "Medium",
      questionCount: 5,
      timePerQuestion: 60,
      questionTypes: ["multiple_choice"] as ("multiple_choice" | "true_false" | "fill_blank")[],

      // Active Quiz State
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: [],
      isGenerating: false,
      error: null,
      
      // Advanced Metrics
      timeRemaining: 0,
      hintsUsed: 0,
      quizStartTime: 0, // epoch ms when quiz started

      // History
      history: [],

      // Auth Actions
      login: (username) => set({ isLoggedIn: true, username }),
      logout: () => set({ isLoggedIn: false, username: "", questions: [] }),

      // Config Actions
      setQuizConfig: (topic, difficulty, count, timePerQuestion = 60, questionTypes) => set({
        topic,
        difficulty,
        questionCount: count,
        timePerQuestion,
        questionTypes: questionTypes ?? ["multiple_choice"],
      }),

      // Game Actions
      setQuestions: (questions, timePerQuestion?: number) => set((s) => {
        const tpq = timePerQuestion ?? s.timePerQuestion ?? 60;
        return {
          questions,
          currentQuestionIndex: 0,
          userAnswers: new Array(questions.length).fill(""),
          error: null,
          hintsUsed: 0,
          quizStartTime: Date.now(),
          timeRemaining: tpq > 0 ? questions.length * tpq : 999999,
        };
      }),

      answerQuestion: (index, answer) => set((state) => {
        const newAnswers = [...state.userAnswers];
        newAnswers[index] = answer;
        return { userAnswers: newAnswers };
      }),

      nextQuestion: () => set((state) => ({
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1)
      })),

      prevQuestion: () => set((state) => ({
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
      })),

      submitQuiz: () => {
        const state = get();
        if (state.questions.length === 0) return;

        let score = 0;
        state.questions.forEach((q, index) => {
          const userAns = (state.userAnswers[index] ?? "").trim();
          const correct = (q.answer ?? "").trim();
          const isCorrect =
            (q as { type?: string }).type === "fill_blank"
              ? userAns.toLowerCase() === correct.toLowerCase()
              : userAns === correct;
          if (isCorrect) score++;
        });

        // Penalize score for hints if needed, but for now just record them
        const finalScore = Math.max(0, score - (state.hintsUsed * 0.5)); // 0.5 deduction per hint
        
        const timeTakenSeconds = state.quizStartTime
          ? Math.round((Date.now() - state.quizStartTime) / 1000)
          : undefined;
        const newAttempt: QuizAttempt = {
          id: crypto.randomUUID(),
          topic: state.topic,
          difficulty: state.difficulty,
          date: new Date().toISOString(),
          score: finalScore,
          totalQuestions: state.questions.length,
          questions: state.questions,
          userAnswers: state.userAnswers,
          username: state.username,
          timeTakenSeconds
        };

        set((s) => ({
          history: [newAttempt, ...s.history]
        }));
      },

      retakeQuiz: (attempt: QuizAttempt, timePerQuestion?: number) => set((s) => {
        const tpq = timePerQuestion ?? s.timePerQuestion ?? 60;
        return {
          questions: attempt.questions,
          topic: attempt.topic,
          difficulty: attempt.difficulty,
          currentQuestionIndex: 0,
          userAnswers: new Array(attempt.questions.length).fill(""),
          error: null,
          hintsUsed: 0,
          quizStartTime: Date.now(),
          timeRemaining: tpq > 0 ? attempt.questions.length * tpq : 999999,
        };
      }),

      resetQuiz: () => set({
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        error: null,
        timeRemaining: 0,
        hintsUsed: 0
      }),

      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),

      // Advanced Modifiers
      setTimer: (t) => set({ timeRemaining: t }),
      decrementTimer: () => set((state) => ({ timeRemaining: Math.max(state.timeRemaining - 1, 0) })),
      useHint: () => set((state) => ({ hintsUsed: state.hintsUsed + 1 })),
    }),
    {
      name: "pro-quiz-storage",
      partialize: (state) => ({ 
        history: state.history,
        isLoggedIn: state.isLoggedIn,
        username: state.username
      }),
    }
  )
);
