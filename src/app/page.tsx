import CloudBackground  from '@/components/CloudBackground'
import AviationTrail    from '@/components/AviationTrail'
import Hero             from '@/components/Hero'
import LogoHeroBanner   from '@/components/LogoHeroBanner'
import Benefits         from '@/components/home/Benefits'
import HomeCTA          from '@/components/home/HomeCTA'
import ScrollPlane      from '@/components/home/ScrollPlane'

export default function Home() {
  return (
    <main className="relative overflow-hidden">

      {/* ── Hero ── */}
      <div className="relative min-h-screen overflow-hidden">
        <CloudBackground />
        <AviationTrail />
        <Hero />
      </div>

      {/* ── Benefits — the scroll-driven airplane flies over this section ── */}
      <ScrollPlane>
        <Benefits />
      </ScrollPlane>

      {/* ── Quem Somos / Brand showcase ── */}
      <section className="relative py-24 lg:py-32 px-6 overflow-hidden bg-sky-abyss">

        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #030A14 0%, #0A1628 40%, #0D2447 80%, #0A1628 100%)',
          }}
        />

        {/* Ambient orbs */}
        <div
          className="absolute top-0 right-0 w-[580px] h-[580px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(26,95,160,0.10) 0%, transparent 70%)',
            filter: 'blur(65px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(212,168,83,0.06) 0%, transparent 70%)',
            filter: 'blur(55px)',
          }}
        />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Brand text ── */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full border border-gold/22 bg-gold/8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-soft" />
              <span className="text-gold text-[11px] font-semibold tracking-[0.12em] uppercase">
                Quem Somos
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-[-0.02em]">
              Onde cada jornada{' '}
              <span className="text-gold-gradient">começa com um sonho.</span>
            </h2>

            {/* Body */}
            <p className="text-white/52 text-[16px] leading-[1.78]">
              A Alvea Viagens transforma a forma como as pessoas vivenciam o mundo.
              Com gestão exclusiva de milhas e emissão premium de passagens internacionais,
              criamos caminhos claros para destinos que antes pareciam distantes.
            </p>
            <p className="text-white/52 text-[16px] leading-[1.78]">
              Nossa equipe de especialistas em viagens cria experiências personalizadas —
              para você gastar menos, voar mais longe e viver momentos verdadeiramente inesquecíveis.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { value: '1k+',  label: 'Passagens emitidas'      },
                { value: '98%',  label: 'Satisfação dos clientes'  },
                { value: '120+', label: 'Destinos disponíveis'     },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 p-4 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm"
                >
                  <span className="text-gold text-xl font-black tracking-tight">{value}</span>
                  <span className="text-white/42 text-[11px] leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Logo banner ── */}
          <div className="order-1 lg:order-2">
            <LogoHeroBanner />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <HomeCTA />
    </main>
  )
}
