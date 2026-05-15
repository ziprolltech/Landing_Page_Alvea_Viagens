import Link from 'next/link'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Início',      href: '/'           },
  { label: 'Destinos',    href: '/destinos'    },
  { label: 'Milhas',      href: '/milhas'      },
  { label: 'Passagens',   href: '/passagens'   },
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
                src="/logo.png"
                alt="Alvea Viagens"
                width={160}
                height={80}
                className="object-contain h-[80px] w-auto"
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
            <nav className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-3">
              <a
                href="mailto:contato@alveaviagens.com.br"
                className="text-white/40 hover:text-gold text-[14px] transition-colors duration-200"
              >
                contato@alveaviagens.com.br
              </a>
              <a
                href="tel:+5511999999999"
                className="text-white/40 hover:text-gold text-[14px] transition-colors duration-200"
              >
                (11) 99999-9999
              </a>
              <p className="text-white/30 text-[13px]">Seg–Sex, 9h às 18h</p>
            </div>

            {/* Social icon buttons */}
            <div className="flex items-center gap-3 mt-1">
              {[
                { abbr: 'IG', label: 'Instagram', href: '#' },
                { abbr: 'LI', label: 'LinkedIn',  href: '#' },
                { abbr: 'WA', label: 'WhatsApp',  href: '#' },
              ].map((social) => (
                <a
                  key={social.abbr}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-white/12 bg-white/[0.04] text-white/40 hover:text-gold hover:border-gold/30 transition-all duration-200 text-[11px] font-semibold tracking-wide"
                >
                  {social.abbr}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-6" style={{ borderTop: '1px solid rgba(212,168,83,0.08)' }}>
          <p className="text-center text-white/22 text-[12px]">
            Alvea Viagens — Especialistas em milhas e passagens aéreas premium
          </p>
        </div>
      </div>
    </footer>
  )
}
