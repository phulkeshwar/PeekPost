import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

const pageTransition = {
  ease: [0.25, 1, 0.5, 1], // Smooth custom ease curve
  duration: 0.35
};

export const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
