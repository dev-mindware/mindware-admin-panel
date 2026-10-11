import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface PortalCardProps {
  href: string;
  label: string;
  title: string;
  description: string;
  logoSrc: string;
  logoAlt: string;
  delay?: number;
}

export function PortalCard({ href, label, title, description, logoSrc, logoAlt, delay = 0 }: PortalCardProps) {
  return (
    <a
      href={href}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
      className="animate-rise group relative flex flex-col gap-10 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
          <Image src={logoSrc} alt={logoAlt} width={28} height={28} className="h-7 w-7 object-contain" />
        </div>
        <ArrowUpRight
          className="h-5 w-5 text-white/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
          strokeWidth={1.5}
        />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">{label}</span>
        <h2 className="text-xl font-medium tracking-tight text-white">{title}</h2>
        <p className="text-sm leading-relaxed text-white/50">{description}</p>
      </div>

      <span className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-purple-400/80 to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100" />
    </a>
  );
}
