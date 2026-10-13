import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail } from 'lucide-react'
import CookiePreferencesLink from '@/components/analytics/CookiePreferencesLink'

const NAV_LINKS = [
  { label: 'Início',      href: '/'           },
  { label: 'Destinos',    href: '/destinos'    },
  { label: 'Milhas',      href: '/milhas'      },
  { label: 'Grupo de Ofertas', href: '/grupo-de-ofertas' },
  { label: 'Experiências', href: '/experiencias' },
  { label: 'Atendimento', href: '/atendimento' },
]

export default function Footer() {
  return (
    <footer
      style={{
        background: 'rgba(3,8,16,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(212,168,83,0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* ── Left column: Logo + tagline ── */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-footer.png"
                alt="Alvea Viagens"
                width={192}
                height={96}
                className="object-contain h-[96px] w-auto"
              />
            </Link>
            <p className="text-white/40 text-[14px] leading-relaxed max-w-[220px]">
              Transformamos milhas em experiências inesquecíveis.
            </p>
            <p className="text-white/25 text-[11px] mt-auto">
              © {new Date().getFullYear()} Alvea Viagens. Todos os direitos reservados.
            </p>
          </div>

          {/* ── Center column: Quick links ── */}
          <div className="flex flex-col gap-5">
            <h3 className="text-white/70 text-[13px] font-semibold tracking-[0.10em] uppercase">
              Links Rápidos
            </h3>
            <nav className="flex flex-col items-start gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/40 hover:text-gold text-[14px] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Right column: Contact ── */}
          <div className="flex flex-col gap-5">
            <h3 className="text-white/70 text-[13px] font-semibold tracking-[0.10em] uppercase">
              Contato
            </h3>
            <div className="flex flex-col items-start gap-3">
              <a
                href="mailto:alveaviagens@gmail.com"
                className="text-white/40 hover:text-gold text-[14px] transition-colors duration-200"
              >
                alveaviagens@gmail.com
              </a>
              <a
                href="https://wa.me/5516997315748"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold text-[14px] transition-colors duration-200"
              >
                +55 (16) 99731-5748
              </a>
            </div>

            {/* Social icon buttons */}
            <div className="flex items-center gap-3 mt-1">
              {/* Instagram */}
              <div className="relative group">
                <a
                  href="https://www.instagram.com/alveaviagens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-white/12 bg-white/[0.04] text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/[0.08] hover:scale-110 transition-all duration-200"
                >
                  <Instagram size={16} strokeWidth={1.8} />
                </a>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-white/70 text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Instagram
                </span>
              </div>

              {/* WhatsApp */}
              <div className="relative group">
                <a
                  href="https://wa.me/5516997315748"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-white/12 bg-white/[0.04] text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/[0.08] hover:scale-110 transition-all duration-200"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-white/70 text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  WhatsApp
                </span>
              </div>

              {/* Email */}
              <div className="relative group">
                <a
                  href="mailto:alveaviagens@gmail.com"
                  aria-label="E-mail"
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-white/12 bg-white/[0.04] text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/[0.08] hover:scale-110 transition-all duration-200"
                >
                  <Mail size={16} strokeWidth={1.8} />
                </a>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-white/70 text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  E-mail
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-6" style={{ borderTop: '1px solid rgba(212,168,83,0.08)' }}>
          <p className="text-center text-white/22 text-[12px]">
            Alvea Viagens — Especialistas em milhas e passagens aéreas premium
          </p>
          <p className="mt-2 text-center text-white/40 text-[12px]">CNPJ: 59.070.673/0001-60</p>
          <CookiePreferencesLink />
        </div>
      </div>
    </footer>
  )
}
