'use client';

import { ReactNode } from 'react';
import { Easing, motion } from 'framer-motion';

interface RotateInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  rotation?: number;
  className?: string;
  ease?: Easing | Easing[];
  onComplete?: () => void;
}

export const RotateIn = ({
  children,
  duration = 0.8,
  delay = 0,
  rotation = 360,
  className = '',
  ease = 'easeOut',
  onComplete,
}: RotateInProps) => {
  return (
    <motion.div
      className={className}
      initial={{ rotate: rotation, opacity: 0, scale: 0.5 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease }}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
};
