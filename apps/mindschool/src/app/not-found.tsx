import { UnauthorizedLink } from "@workspace/ui";

export default function NotFoundPage() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background text-foreground">
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-primary opacity-60" />
      <div className="relative z-10 flex max-w-xl flex-col items-center gap-8 px-6 text-center">
        <h1 className="text-[9rem] font-black leading-none tracking-tighter text-primary sm:text-[12rem]">404</h1>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Página não encontrada</h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            O conteúdo que procura não existe ou foi movido. Verifique o link ou regresse ao dashboard.
          </p>
        </div>
        <UnauthorizedLink />
      </div>
    </div>
  );
}
