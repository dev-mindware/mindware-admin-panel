import Image from "next/image";
import heroImage from "@/assets/hero.jpg";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src={heroImage} alt="Administração da plataforma MindSchool" fill className="object-cover" priority sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute bottom-10 left-10 right-10 space-y-3 text-white">
          <h2 className="text-3xl font-semibold leading-tight">Todas as escolas, subscrições e acessos num só painel.</h2>
          <p className="text-sm text-white/80">Aprove comprovativos, gira planos e cupões, acompanhe o arranque de cada escola e dê suporte com segurança.</p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            {["Subscrições", "Escolas", "Planos e cupões", "Segurança"].map((p) => (
              <span key={p} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 backdrop-blur">
                {p}
              </span>
            ))}
          </div>
          <p className="pt-4 text-[11px] uppercase tracking-widest text-white/50">Mindware · MindSchool</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
