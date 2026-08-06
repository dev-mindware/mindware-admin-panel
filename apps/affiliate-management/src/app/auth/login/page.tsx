import { HeroImageSide, LoginForm } from "@/components/auth";
import heroImage from "@/assets/partnership.jpg";
import logo from "@/assets/brand.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block">
        <HeroImageSide
          source={heroImage}
          fit="cover"
          alt="Parceria e gestão de afiliados Mindware"
          brand={{
            logoSrc: logo,
            title: "Controle total do programa de afiliados.",
            subtitle:
              "Aprove cadastros, atribua subscrições Mindgest, acompanhe comissões e libere pagamentos num único painel.",
            pills: ["Afiliados", "Subscrições", "Comissões", "Levantamentos"],
            footer: "Mindware · Programa de Afiliados",
          }}
        />
      </div>

      <div className="relative flex items-center justify-center p-6 md:p-10 shadow-[-8px_0_32px_rgba(0,0,0,0.06)] dark:shadow-[-8px_0_40px_rgba(0,0,0,0.35)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.07),transparent_55%)]"
          aria-hidden
        />
        <div className="relative w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
