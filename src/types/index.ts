export type QuestionType = "multiple_choice" | "true_false" | "fill_blank";

export interface Question {
  id?: string;
  type?: QuestionType; // defaults to multiple_choice
  question: string;
  options: string[]; // for fill_blank: empty; for true_false: ["True","False"]
  answer: string; // The correct answer
  correctAnswer?: string;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  date: string;
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: string[]; // parallel array to questions
  username?: string;
  timeTakenSeconds?: number; // Time taken to complete quiz
}

export interface QuizState {
  // User / Auth
  isLoggedIn: boolean;
  username: string;
  login: (username: string) => void;
  logout: () => void;

  // Config
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionCount: number;
  timePerQuestion?: number;
  questionTypes?: ("multiple_choice" | "true_false" | "fill_blank")[];

  // Active Quiz State
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: string[]; // parallel to questions array
  isGenerating: boolean;
  error: string | null;

  // History
  history: QuizAttempt[];

  // Actions
  setQuizConfig: (topic: string, difficulty: "Easy" | "Medium" | "Hard", count: number, timePerQuestion?: number, questionTypes?: ("multiple_choice" | "true_false" | "fill_blank")[]) => void;
  setQuestions: (questions: Question[], timePerQuestion?: number) => void;
  answerQuestion: (index: number, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitQuiz: () => void;
  retakeQuiz: (attempt: QuizAttempt, timePerQuestion?: number) => void;
  resetQuiz: () => void;
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
}
