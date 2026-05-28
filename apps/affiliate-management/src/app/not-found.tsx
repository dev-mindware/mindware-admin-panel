import { UnauthorizedLink } from "@workspace/ui";

export default function NotFoundPage() {
  return (
    <>
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background text-foreground">

        {/* ── dot grid background ── */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* ── vignette ── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, hsl(var(--background)) 100%)",
          }}
        />

        {/* ── thin top accent bar ── */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary opacity-60" />

        {/* ── corner labels ── */}
        <span className="absolute top-5 left-6 font-mono text-[11px] text-muted-foreground/50 tracking-widest uppercase select-none">
          Error
        </span>
        <span className="absolute top-5 right-6 font-mono text-[11px] text-muted-foreground/50 tracking-widest select-none">
          404
        </span>

        {/* ── main content ── */}
        <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center max-w-xl w-full">

          {/* 404 hero block */}
          <div className="anim-0 relative select-none">

            {/* pulse rings behind the number */}
            <div className="pulse-ring absolute inset-0 rounded-full bg-primary/10 scale-125" />
            <div
              className="pulse-ring absolute inset-0 rounded-full bg-primary/5 scale-150"
              style={{ animationDelay: "1s" }}
            />

            {/* outlined ghost text (decorative layer) */}
            <span
              className="glitch-layer pointer-events-none absolute inset-0 flex items-center justify-center
                         text-[10rem] sm:text-[14rem] font-black tracking-tighter leading-none"
              style={{
                WebkitTextStroke: "1px hsl(var(--primary) / 0.15)",
                color: "transparent",
                transform: "translate(6px, 6px)",
              }}
              aria-hidden="true"
            >
              404
            </span>

            {/* main number */}
            <h1
              className="relative text-[10rem] sm:text-[14rem] font-black tracking-tighter leading-none text-primary"
              style={{ textShadow: "0 0 80px hsl(var(--primary) / 0.25)" }}
            >
              404
            </h1>

            {/* floating icon */}
            <div className="float-icon absolute -top-3 -right-3 sm:-top-5 sm:-right-5">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.621a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* divider */}
          <div className="anim-1 flex items-center gap-4 w-full max-w-xs">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-xs text-muted-foreground/60 tracking-widest uppercase whitespace-nowrap">
              page not found
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* copy */}
          <div className="anim-2 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Página não encontrada
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
              O conteúdo que está à procura não existe ou foi movido. Verifique
              o link ou regresse ao dashboard.
            </p>
          </div>

          {/* CTA */}
          <div className="anim-3">
            <UnauthorizedLink />
          </div>
        </div>

        {/* ── bottom label ── */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center">
          <span className="font-mono text-[10px] text-muted-foreground/30 tracking-widest uppercase select-none">
            ── retorne para o início ──
          </span>
        </div>
      </div>
    </>
  );
}