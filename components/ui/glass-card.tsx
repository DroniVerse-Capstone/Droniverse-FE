import React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function GlassCard({ children, icon, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "w-full px-6 py-4 rounded text-greyscale-25 text-sm bg-white/12 backdrop-blur-2xl border border-white/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_0_25px_rgba(255,255,255,0.10)] transition-all hover:bg-white/15 hover:border-white/20",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="inline-flex text-primary-300 [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
    </div>
  )
}