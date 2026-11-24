import { motion } from "motion/react";

export function Confetti({ active }: { active: boolean }) {
  const colors = ["#e61a1a", "#ffe600", "#1a56db", "#1DB954", "#FFB703", "#fff"];
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
      {Array.from({ length: 44 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            background: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: "-20px",
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 60,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
            x: Math.random() * 260 - 130,
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            delay: Math.random() * 0.9,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
