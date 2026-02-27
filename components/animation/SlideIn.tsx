'use client';

import { ReactNode } from 'react';
import { Easing, motion } from 'framer-motion';

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
  delay?: number;
  distance?: number;
  className?: string;
  ease?: Easing | Easing[];
  onComplete?: () => void;
}

export const SlideIn = ({
  children,
  direction = 'left',
  duration = 0.8,
  delay = 0,
  distance = 100,
  className = '',
  ease = 'easeOut',
  onComplete,
}: SlideInProps) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { opacity: 0, x: -distance };
      case 'right':
        return { opacity: 0, x: distance };
      case 'top':
        return { opacity: 0, y: -distance };
      case 'bottom':
        return { opacity: 0, y: distance };
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialPosition()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease }}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
};
