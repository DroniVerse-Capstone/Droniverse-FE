'use client';

import { ReactNode } from 'react';
import { Easing, motion } from 'framer-motion';

interface ScaleInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  from?: number;
  className?: string;
  ease?: Easing | Easing[];
  onComplete?: () => void;
}

export const ScaleIn = ({
  children,
  duration = 0.6,
  delay = 0,
  from = 0,
  className = '',
  ease = 'backOut',
  onComplete,
}: ScaleInProps) => {
  return (
    <motion.div
      className={className}
      initial={{ scale: from, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration, delay, ease: ease === 'backOut' ? [0.175, 0.885, 0.32, 1.275] : ease }}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
};
