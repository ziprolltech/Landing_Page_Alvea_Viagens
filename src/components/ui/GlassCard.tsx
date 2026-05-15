'use client'
import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function GlassCard({ children, className = '', hover = true, onClick }: Props) {
  if (!hover) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm cursor-default ${className}`}
      whileHover={{ scale: 1.025, y: -5, borderColor: 'rgba(212,168,83,0.3)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
