export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0A0512] text-white p-6 overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative text-center space-y-8 max-w-2xl w-full z-10">
        {/* 404 Number */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full scale-150 pointer-events-none" />
          <h1
            className="text-[10rem] sm:text-[14rem] font-black tracking-tighter select-none"
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6d28d9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.5))",
            }}
          >
            404
          </h1>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8 space-y-4 border border-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white/90">
            Página não encontrada
          </h2>
          <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
            Esta rota não existe no portal Mindware. Por favor, aceda a partir
            do ecrã principal.
          </p>

          <div className="pt-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
              }}
            >
              ← Voltar ao Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
