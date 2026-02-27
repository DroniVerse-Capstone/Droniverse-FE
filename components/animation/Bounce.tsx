'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BounceProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  repeat?: number;
  className?: string;
  scale?: number;
}

export const Bounce = ({
  children,
  duration = 0.5,
  delay = 0,
  repeat = Infinity,
  className = '',
  scale = 1.1,
}: BounceProps) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        delay,
        repeat,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};
