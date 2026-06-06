import { motion } from "framer-motion";

function AnimatedBackground() {
  return (
    <div className="animated-bg">
      <motion.div
        className="blob blob1"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="blob blob2"
        animate={{
          x: [0, -120, 50, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.8, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="blob blob3"
        animate={{
          x: [0, 60, -100, 0],
          y: [0, -80, 40, 0],
          scale: [1, 1.4, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default AnimatedBackground;