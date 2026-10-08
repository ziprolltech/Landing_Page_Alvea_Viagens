'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  /* Once the entrance has played, the wrapper drops its `filter` and
     `transform`. Left in place (even as blur(0px) / translateY(0)), they keep
     the whole page inside one filtered layer; when a phone zooms in, that layer
     can no longer be painted reliably and elements that repaint all the time —
     the pulsing gold buttons — may vanish. */
  function settle() {
    const el = ref.current
    if (!el) return
    el.style.filter = 'none'
    el.style.transform = 'none'
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={settle}
    >
      {children}
    </motion.div>
  )
}
