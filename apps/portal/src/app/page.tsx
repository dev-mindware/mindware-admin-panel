import Image from "next/image";
import { PortalCard } from "@/components/PortalCard";

const APPS = [
  {
    href: "/mindgest/auth/login",
    label: "Gestão corporativa",
    title: "Mindgest",
    description: "Empresas, subscrições e configurações globais da plataforma.",
    logoSrc: "/brand/mindgest.png",
    logoAlt: "Mindgest",
  },
  {
    href: "/mindschool/auth/login",
    label: "Gestão escolar",
    title: "MindSchool",
    description: "Escolas, planos, cupões, segurança e operações da plataforma escolar.",
    logoSrc: "/brand/mindschool.png",
    logoAlt: "MindSchool",
  },
  {
    href: "/affiliate/auth/login",
    label: "Parcerias e negócios",
    title: "Afiliados",
    description: "Gestão de afiliados, comissões e acompanhamento de parcerias.",
    logoSrc: "/brand/mindware.png",
    logoAlt: "Afiliados",
  },
  {
    href: "/doc-generator/auth/login",
    label: "Documentos e relatórios",
    title: "DocGen",
    description: "Geração e gestão de documentos e relatórios.",
    logoSrc: "/brand/mindware.png",
    logoAlt: "DocGen",
  },
];

export default function PortalPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#09090b] px-6 py-10 selection:bg-purple-500/30">
      {/* fundo discreto: grelha ténue e um halo que respira lentamente */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute left-1/2 top-[-240px] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-purple-600/15 blur-[120px]"
      />

      <header className="animate-rise relative z-10 mx-auto flex w-full max-w-5xl items-center gap-3">
        <Image src="/brand/mindware.png" alt="Mindware" width={32} height={32} priority className="h-8 w-8 object-contain" />
        <span className="text-sm font-medium tracking-tight text-white/80">Mindware</span>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-12 py-16">
        <div className="max-w-xl space-y-4">
          <h1 style={{ "--delay": "80ms" } as React.CSSProperties} className="animate-rise text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Portal de administração
          </h1>
          <p style={{ "--delay": "160ms" } as React.CSSProperties} className="animate-rise text-sm leading-relaxed text-white/50 sm:text-base">
            Escolha a aplicação a que pretende aceder. Cada uma tem a sua própria autenticação e permissões.
          </p>
        </div>

        <nav aria-label="Aplicações" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {APPS.map((app, i) => (
            <PortalCard key={app.title} {...app} delay={240 + i * 80} />
          ))}
        </nav>
      </div>

      <footer className="relative z-10 mx-auto w-full max-w-5xl text-xs text-white/30">
        © {new Date().getFullYear()} Mindware. Acesso restrito a utilizadores autorizados.
      </footer>
    </main>
  );
}
