"use client";

import Image from "next/image";
import { useState } from "react";
import { PortalCard } from "@/components/PortalCard";
import { SpotlightBeam } from "@/components/SpotlightBeam";

export type CardType = "mindgest" | "affiliate" | null;

export default function PortalPage() {
  const [hoveredCard, setHoveredCard] = useState<CardType>(null);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 selection:bg-purple-500/30 overflow-hidden bg-[#030108]">
      <SpotlightBeam hoveredCard={hoveredCard} />

      <div className="relative z-10 w-full max-w-5xl mx-auto space-y-24">
        {/* Header Section */}
        <div className={`flex flex-col items-center text-center space-y-6 transition-all duration-[1200ms] ${hoveredCard ? "opacity-20 blur-[2px] -translate-y-2" : "opacity-100"}`}>
          <Image
            src="/brand/mindware.png"
            alt="Mindware"
            width={96}
            height={96}
            priority
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.25)]"
          />
          <div className="rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-xs text-white/50 backdrop-blur-md">
            Portal Mindware
          </div>
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Bem-vindo ao
              <br />
              Ecossistema Mindware
            </h1>
            <p className="text-sm sm:text-base text-white/30 max-w-2xl mx-auto font-light leading-relaxed">
              Aplicações distintas, com regras próprias, conectadas sob uma plataforma unificada.
            </p>
          </div>
        </div>

        {/* Cards Section */}
        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-8 w-full max-w-4xl mx-auto mt-16 px-4 relative z-30">
          <PortalCard 
            id="mindgest"
            href="/mindgest/auth/login"
            label="GESTÃO CORPORATIVA"
            title="Mindgest"
            logoSrc="/brand/mindgest.png"
            logoAlt="Mindgest"
            hoveredCard={hoveredCard}
            onHover={setHoveredCard}
          />

          <PortalCard 
            id="affiliate"
            href="/affiliate/auth/login"
            label="PARCERIAS E NEGÓCIOS"
            title="Afiliados"
            logoSrc="/brand/mindware.png"
            logoAlt="Mindware"
            hoveredCard={hoveredCard}
            onHover={setHoveredCard}
          />
        </div>
      </div>
    </main>
  );
}
