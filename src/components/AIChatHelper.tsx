"use client";

import { useState, useRef, useEffect } from "react";
import { useQuizStore } from "../store/useQuizStore";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function AIChatHelper() {
  const { topic } = useQuizStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: `Hello! I'm TEACH EDISON's AI Assistant. How can I help you master the topic of "${topic || 'Unknown'}"?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          topic
        })
      });

      if (!res.ok) throw new Error("Chat initialization failed");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "model", content: "My neural link is currently unstable. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={"fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 " + (isOpen ? "opacity-0 pointer-events-none scale-0" : "opacity-100 bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/50")}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col glass-effect rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl bg-slate-950/80"
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[40px] -z-10 rounded-full"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Edison AI</h3>
                  <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Learning Assistant
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((m, idx) => (
                <div key={idx} className={"flex gap-3 " + (m.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={"w-7 h-7 shrink-0 rounded-full flex items-center justify-center border " + (m.role === 'user' ? "bg-amber-500/20 border-amber-500/30" : "bg-blue-600/20 border-blue-500/30")}>
                    {m.role === 'user' ? <User className="w-3.5 h-3.5 text-amber-500" /> : <Bot className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <div className={"px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[75%] shadow-md " + (m.role === 'user' ? "bg-amber-500/10 text-amber-50 border border-amber-500/20 rounded-tr-sm" : "bg-blue-600/10 text-slate-200 border border-blue-500/20 rounded-tl-sm")}>
                    {m.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center border bg-blue-600/20 border-blue-500/30">
                    <Bot className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-blue-600/5 border border-blue-500/10 rounded-tl-sm shadow-md">
                    <div className="flex gap-1.5 items-center justify-center h-2">
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-slate-950">
              <form onSubmit={sendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors group"
                >
                  <Send className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
