import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface PortalCardProps {
  id: "mindgest" | "affiliate" | "docgen";
  href: string;
  label: string;
  title: string;
  logoSrc: string;
  logoAlt: string;
  hoveredCard: "mindgest" | "affiliate" | "docgen" | null;
  onHover: (id: "mindgest" | "affiliate" | "docgen" | null) => void;
}

export function PortalCard({ id, href, label, title, logoSrc, logoAlt, hoveredCard, onHover }: PortalCardProps) {
  const isHovered = hoveredCard === id;
  const isOtherHovered = hoveredCard !== null && hoveredCard !== id;

  return (
    <div className="relative group w-full sm:w-[360px]">
      {/* Background Glow Aura */}
      <div 
        className={`absolute -inset-8 bg-purple-500/25 blur-[60px] rounded-[3rem] pointer-events-none transition-all duration-[1500ms] ease-out ${isHovered ? "opacity-100 scale-110" : "opacity-0 scale-90"}`} 
      />

      <a
        href={href}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        className={`
          block relative w-full h-[380px] rounded-[2rem] overflow-hidden 
          bg-[#0A0512] flex flex-col justify-between p-8 
          transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isHovered 
            ? "scale-[1.04] -translate-y-6 z-20 shadow-[0_-15px_60px_-15px_rgba(168,85,247,0.4)] border-purple-400/30 border-t-white/60 border-l-purple-400/20 border-r-purple-400/20 border-b-transparent" 
            : isOtherHovered 
              ? "opacity-30 blur-[2px] grayscale-[60%] scale-[0.98] border-transparent z-0 translate-y-2" 
              : "opacity-60 border-white/[0.03] z-10 shadow-none"}
          border
        `}
      >
        {/* Internal Light Surface Hit */}
        <div className={`absolute inset-0 transition-opacity duration-[1200ms] pointer-events-none ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-purple-300/15 via-purple-500/5 to-transparent" />
          
          <div 
            className="absolute inset-0 opacity-70 mix-blend-color-dodge"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Card Header Content */}
        <div className="flex justify-between items-start relative z-10">
          <span className={`text-xs tracking-widest font-medium transition-colors duration-1000 ${isHovered ? "text-purple-200/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "text-white/30"}`}>
            {label}
          </span>
          <ArrowUpRight 
            className={`w-7 h-7 font-light transition-all duration-1000 ${isHovered ? "text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "text-white/20"}`} 
            strokeWidth={1.5} 
          />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={140}
            height={140}
            className={`h-28 w-28 sm:h-32 sm:w-32 object-contain transition-all duration-1000 ${isHovered ? "opacity-95 scale-110 drop-shadow-[0_0_35px_rgba(255,255,255,0.22)]" : "opacity-35 scale-100"}`}
          />
        </div>

        {/* Card Footer Content */}
        <div className="relative z-10 mt-auto">
          <h2 className={`text-4xl sm:text-5xl font-light tracking-tight transition-all duration-1000 ${isHovered ? "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-white/40"}`}>
            {title}
          </h2>
        </div>
      </a>
    </div>
  );
}
