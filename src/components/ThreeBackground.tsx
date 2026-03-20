"use client";

import ShaderDemo_ATC from "./ui/atc-shader";

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      <ShaderDemo_ATC />
      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.4)_100%)]" />
      
      {/* Noise Grain for Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );
}
