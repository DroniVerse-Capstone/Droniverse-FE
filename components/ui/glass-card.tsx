import React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
  variant?: 'horizontal' | 'vertical'
  title?: string
}

export function GlassCard({ children, icon, className, variant = 'horizontal', title }: GlassCardProps) {
  return (
    <div
      className={cn(
        "w-full px-6 py-4 rounded text-greyscale-25 text-sm bg-white/12 backdrop-blur-2xl border border-white/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_0_25px_rgba(255,255,255,0.10)] transition-all hover:bg-white/15 hover:border-white/20",
        variant === 'vertical' && "text-center rounded-[20px]",
        className
      )}
    >
      {variant === 'horizontal' ? (
        <div className="flex items-center gap-3">
          {icon && <span className="inline-flex text-greyscale-0 [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0">{icon}</span>}
          <span>{children}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {icon && (
            <span className="inline-flex text-greyscale-0 [&_svg]:w-12 [&_svg]:h-12 [&_svg]:shrink-0">
              {icon}
            </span>
          )}
          {title && (
            <h3 className="text-xl md:text-2xl font-semibold text-greyscale-0">
              {title}
            </h3>
          )}
          <p className="text-sm md:text-sm text-greyscale-50 leading-relaxed">
            {children}
          </p>
        </div>
      )}
    </div>
  )
}