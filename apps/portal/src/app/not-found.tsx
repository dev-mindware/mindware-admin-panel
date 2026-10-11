export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-6 text-white">
      <div className="animate-rise max-w-md space-y-6 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-white/40">404</p>
        <h1 className="text-2xl font-medium tracking-tight">Página não encontrada</h1>
        <p className="text-sm leading-relaxed text-white/50">Esta rota não existe no portal Mindware. Volte ao ecrã principal para escolher uma aplicação.</p>
        <a
          href="/"
          className="inline-flex items-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
        >
          Voltar ao portal
        </a>
      </div>
    </div>
  );
}
