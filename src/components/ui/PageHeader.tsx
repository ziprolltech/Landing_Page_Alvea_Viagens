import { Star } from 'lucide-react'

interface Props {
  tag: string
  title: React.ReactNode
  subtitle: string
}

export default function PageHeader({ tag, title, subtitle }: Props) {
  return (
    <div className="text-center flex flex-col items-center gap-5 max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/22 bg-gold/8 backdrop-blur-sm">
        <Star size={11} className="text-gold fill-gold" />
        <span className="text-gold text-[11px] font-semibold tracking-[0.12em] uppercase">{tag}</span>
        <Star size={11} className="text-gold fill-gold" />
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-[58px] font-black text-white leading-[1.06] tracking-[-0.025em]">
        {title}
      </h1>
      <p className="text-white/52 text-[17px] leading-relaxed font-light">{subtitle}</p>
    </div>
  )
}
