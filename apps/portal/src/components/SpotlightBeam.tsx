interface SpotlightBeamProps {
  hoveredCard: "mindgest" | "affiliate" | "docgen" | null;
}

export function SpotlightBeam({ hoveredCard }: SpotlightBeamProps) {
  const beamAngle = hoveredCard === "mindgest" ? "25deg" : hoveredCard === "docgen" ? "-25deg" : hoveredCard === "affiliate" ? "0deg" : "0deg";

  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
      {/* Faint invisible grid */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: `4rem 4rem`,
          maskImage: `radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 110%)`
        }}
      />
      
      {/* Distant ceiling ambient light */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 0%, rgba(126, 34, 206, 0.5) 0%, transparent 70%)`
        }}
      />

      {/* The Volumetric Spotlight Beam */}
      <div 
        className="absolute top-[-50px] left-1/2 w-[1000px] h-[150vh] pointer-events-none transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden z-20"
        style={{
          transformOrigin: "top center",
          transform: `translateX(-50%) rotate(${beamAngle}) ${hoveredCard ? 'scaleY(1)' : 'scaleY(0.7)'}`,
          opacity: hoveredCard ? 1 : 0
        }}
      >
        <div 
          className="w-full h-full mix-blend-screen"
          style={{
            clipPath: `polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)`,
            background: `linear-gradient(to bottom, rgba(233, 213, 255, 0.25) 0%, rgba(147, 51, 234, 0.15) 30%, transparent 80%)`,
            filter: 'blur(50px)'
          }}
        />
      </div>
    </div>
  );
}
