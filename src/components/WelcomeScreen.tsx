"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function WelcomeScreen() {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // We can use this to trigger additional internal animations if needed
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2500); // Start exit animation slightly before the 3s mark
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-transparent">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          filter: "blur(0px)",
          transition: { 
            duration: 1.2, 
            ease: [0.23, 1, 0.32, 1] 
          } 
        }}
        exit={{ 
          opacity: 0, 
          scale: 1.1, 
          filter: "blur(20px)",
          transition: { duration: 0.8, ease: "easeInOut" } 
        }}
        className="relative text-center"
      >
        {/* Decorative background glow */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[100px]" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-6"
        >
          <motion.h1 
            animate={{ 
              textShadow: [
                "0 0 0px rgba(251,191,36,0)",
                "0 0 20px rgba(251,191,36,0.5)",
                "0 0 10px rgba(251,191,36,0.2)",
                "0 0 40px rgba(251,191,36,0.8)",
                "0 0 20px rgba(251,191,36,0.4)"
              ],
              opacity: [0.5, 1, 0.8, 1, 0.9, 1]
            }}
            transition={{ 
              duration: 2,
              times: [0, 0.1, 0.2, 0.8, 0.9, 1],
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="bg-gradient-to-b from-white via-white to-amber-200 bg-clip-text text-7xl font-black tracking-[0.15em] text-transparent sm:text-9xl uppercase italic"
          >
            TEACH EDISON
          </motion.h1>
          <div className="flex items-center justify-center gap-6">
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            <span className="text-xs font-black uppercase tracking-[0.5em] text-amber-500/80">
              Inspiration • Innovation • Learning
            </span>
            <div className="h-[1px] w-20 bg-gradient-to-l from-transparent via-amber-500 to-transparent" />
          </div>
        </motion.div>

        {/* Dynamic decorative elements */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-16 -z-20 border border-white/5 rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-24 -z-20 border border-white/5 rounded-full"
        />
      </motion.div>
    </div>
  );
}
