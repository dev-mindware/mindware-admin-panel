import { HeroImageSide, LoginForm } from "@/components";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      <div className="hidden lg:block">
        <HeroImageSide
          source="/admin-login-hero.jpg"
          fit="cover"
          alt="Gestão e análise de negócios no Mindgest"
          brand={{
            logoSrc: "/mindgest.png",
            title: "Mindgest Admin",
            subtitle:
              "Gerencie empresas, planos e subscrições da plataforma num único lugar.",
          }}
        />
      </div>

      <div className="relative flex items-center justify-center bg-background p-6 md:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_55%)]"
          aria-hidden
        />
        <div className="relative w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
