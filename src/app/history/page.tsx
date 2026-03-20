import HistoryList from '@/components/HistoryList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Your History | QuizAI",
  description: "View your past AI-generated quizzes.",
};

export default function HistoryPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center pt-8 pb-24">
      <HistoryList />
    </div>
  );
}
