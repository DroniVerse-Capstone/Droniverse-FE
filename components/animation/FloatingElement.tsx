'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
  children: ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
}

export const FloatingElement = ({
  children,
  duration = 2,
  distance = 20,
  className = '',
}: FloatingElementProps) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};
