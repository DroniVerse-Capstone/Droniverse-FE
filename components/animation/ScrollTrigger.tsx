'use client';

import { ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface ScrollTriggerProps {
  children: ReactNode;
  animation?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale';
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export const ScrollTrigger = ({
  children,
  animation = 'fade',
  duration = 1,
  className = '',
  once = true,
  amount = 0.3,
}: ScrollTriggerProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const getInitialPosition = () => {
    switch (animation) {
      case 'fade':
        return { opacity: 0 };
      case 'slideUp':
        return { opacity: 0, y: 100 };
      case 'slideDown':
        return { opacity: 0, y: -100 };
      case 'slideLeft':
        return { opacity: 0, x: 100 };
      case 'slideRight':
        return { opacity: 0, x: -100 };
      case 'scale':
        return { opacity: 0, scale: 0.5 };
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialPosition()}
      animate={isInView ? { opacity: 1, x: 0, y: 0, scale: 1 } : getInitialPosition()}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  );
};
