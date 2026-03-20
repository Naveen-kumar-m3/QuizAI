import type { Metadata } from "next";
import AboutContent from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "About | TEACH EDISON Quiz",
  description: "Learn about TEACH EDISON - AI-powered quiz platform for dynamic learning.",
};

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col items-center pt-8 pb-24">
      <AboutContent />
    </div>
  );
}
