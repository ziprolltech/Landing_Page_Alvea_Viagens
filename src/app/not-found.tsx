import Link from 'next/link'

/* 404 page. Next.js answers with status 404 and adds `noindex` by itself. */
export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-6 px-6 pt-28 pb-24 text-center">
      <span className="text-gold text-[11px] font-semibold tracking-[0.12em] uppercase">Erro 404</span>
      <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.06] tracking-[-0.025em]">
        Página não encontrada
      </h1>
      <p className="max-w-md text-white/55 text-[16px] leading-relaxed">
        O endereço que você abriu não existe ou foi alterado.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-gold/50 bg-gold/15 px-8 text-[14px] font-semibold text-gold-light transition-colors duration-200 hover:bg-gold/25"
        >
          Voltar ao início
        </Link>
        <Link
          href="/destinos"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 text-[14px] font-semibold text-white/80 transition-colors duration-200 hover:text-white"
        >
          Ver destinos
        </Link>
      </div>
    </main>
  )
}
