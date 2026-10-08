'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Início',      href: '/'           },
  { label: 'Destinos',    href: '/destinos'    },
  { label: 'Milhas',      href: '/milhas'      },
  { label: 'Grupo de Ofertas', href: '/grupo-de-ofertas' },
  { label: 'Experiências', href: '/experiencias' },
  { label: 'Atendimento', href: '/atendimento' },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass py-3 shadow-glass' : 'bg-transparent py-5'
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center shrink-0 group">
            <Image
              src="/logo-navbar.png"
              alt="Alvea Viagens"
              width={152}
              height={68}
              priority
              className="object-contain w-auto h-[54px] transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative nav-link-underline whitespace-nowrap text-[13.5px] font-medium tracking-[0.04em] transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-px rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #D4A853, #E8824A)',
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden lg:flex">
            <Link href="/atendimento">
              <motion.span
                className="btn-shimmer cta-glow flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold tracking-wide text-sky-deep cursor-pointer select-none"
                style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)' }}
                whileHover={{ scale: 1.045, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Phone size={13} strokeWidth={2.5} />
                Falar com Especialista
              </motion.span>
            </Link>
          </div>

          {/* ── Mobile toggle ── */}
          <button
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors z-50"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.header>

      {/* ── Mobile side drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide panel */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] flex flex-col"
              style={{
                background: 'rgba(5,13,26,0.96)',
                borderLeft: '1px solid rgba(212,168,83,0.12)',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
              {/* Close button */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/6">
                <Image
                  src="/logo-navbar.png"
                  alt="Alvea Viagens"
                  width={116}
                  height={52}
                  className="object-contain h-[44px] w-auto"
                />
                <button
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col flex-1 px-6 pt-6 gap-1">
                {NAV_LINKS.map((link, i) => {
                  const isActive = pathname === link.href
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center py-3.5 text-[15px] font-medium border-b border-white/5 transition-colors duration-200 ${
                          isActive ? 'text-gold' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {link.label}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* CTA at bottom */}
              <div className="px-6 pb-8 pt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36, duration: 0.3 }}
                >
                  <Link href="/atendimento" onClick={() => setMobileOpen(false)}>
                    <span
                      className="btn-shimmer flex items-center justify-center gap-2 py-3.5 rounded-full text-[14px] font-semibold text-sky-deep w-full"
                      style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)' }}
                    >
                      <Phone size={15} strokeWidth={2.5} />
                      Falar com Especialista
                    </span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
