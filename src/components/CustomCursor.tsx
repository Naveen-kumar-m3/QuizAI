"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion, useSpring, useMotionValue } from "framer-motion";

/**
 * Celestial "Sharp Star" Cursor Component
 * 
 * Features:
 * 1. Geometric Sharp Star Lead (SVG based)
 * 2. Multiparticle Staggered Flash Tail (Comet effect)
 * 3. High-Quality Spring Physics (Damping-tuned for premium feel)
 */

function SharpStar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" fill="white" />
    </svg>
  );
}

/**
 * FlashParticle logic
 * Staggers color/opacity/scale to create a dissipating "flash" trail.
 */
function FlashParticle({ x, y, delay, scale }: { x: any, y: any, delay: number, scale: number }) {
  // Each particle has a unique spring profile for organic lagging
  const springConfig = useMemo(() => ({ 
    damping: 15 + delay * 5, 
    stiffness: 200 - delay * 20, 
    mass: 0.5 + delay * 0.2 
  }), [delay]);
  
  const px = useSpring(x, springConfig);
  const py = useSpring(y, springConfig);

  return (
    <motion.div
      className="fixed top-0 left-0 w-2 h-2 bg-blue-400 rounded-full pointer-events-none z-[9999] blur-[2px]"
      style={{
        x: px,
        y: py,
        scale,
        opacity: 1 - delay * 0.2, // Fade out the further back it is
        translateX: "-50%",
        translateY: "-50%",
      }}
    />
  );
}

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // 1. High-speed spring for the main star (Peak responsiveness)
  const mainX = useSpring(cursorX, { damping: 25, stiffness: 450, mass: 0.5 });
  const mainY = useSpring(cursorY, { damping: 25, stiffness: 450, mass: 0.5 });

  // 2. Large trailing aura (Atmospheric atmospheric glow)
  const auraX = useSpring(cursorX, { damping: 20, stiffness: 80 });
  const auraY = useSpring(cursorY, { damping: 20, stiffness: 80 });

  useEffect(() => {
    setMounted(true);
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  // Calibration for the 4 tail particles
  const particles = useMemo(() => [
    { delay: 1, scale: 0.8 },
    { delay: 2, scale: 0.6 },
    { delay: 3, scale: 0.4 },
    { delay: 4, scale: 0.2 },
  ], []);

  return (
    <>
      <AnimatePresence>
        {mounted && (
          <div className="fixed inset-0 pointer-events-none z-[10000]">
            {/* ☄️ The Comet Lead */}
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[10001]"
              style={{
                x: mainX,
                y: mainY,
                translateX: "-50%",
                translateY: "-50%",
              }}
            >
              <SharpStar />
            </motion.div>

            {/* ✨ The Neural Tail Particles */}
            {particles.map((p, i) => (
              <FlashParticle key={i} x={cursorX} y={cursorY} delay={p.delay} scale={p.scale} />
            ))}

            {/* 🌫️ Atmospheric Trailing Aura */}
            <motion.div
              className="fixed top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full pointer-events-none z-[9998] blur-[50px]"
              style={{
                x: auraX,
                y: auraY,
                translateX: "-50%",
                translateY: "-50%",
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
