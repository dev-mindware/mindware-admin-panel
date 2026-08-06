import Image, { type StaticImageData } from "next/image";
import { Badge } from "@workspace/ui";

type BrandProps = {
  logoSrc: StaticImageData | string;
  title: string;
  subtitle: string;
  pills?: string[];
  footer?: string;
};

type HeroImageSideProps = {
  source: StaticImageData | string;
  alt?: string;
  fit?: "cover" | "contain";
  brand?: BrandProps;
};

export function HeroImageSide({
  source,
  alt = "Login Visual",
  fit = "cover",
  brand,
}: HeroImageSideProps) {
  return (
    <div className="relative hidden h-screen w-full flex-col overflow-hidden lg:flex">
      <Image
        fill
        src={source}
        alt={alt}
        className={fit === "cover" ? "object-cover object-center" : "object-contain p-16"}
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
      />

      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-primary/40 dark:from-black/90 dark:via-black/70 dark:to-primary/30" />
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.45)]" />

      {brand && (
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <div className="relative size-11 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Image
                src={brand.logoSrc}
                alt={brand.title}
                fill
                className="object-contain p-1.5"
                sizes="44px"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-white drop-shadow-md">
                Mindware
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
                Affiliate Admin
              </span>
            </div>
          </div>

          <div className="flex max-w-md flex-col gap-5">
            <h2 className="text-4xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
              {brand.title}
            </h2>
            <p className="text-base leading-relaxed text-white/80 drop-shadow-md">
              {brand.subtitle}
            </p>

            {brand.pills && brand.pills.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {brand.pills.map((label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="border-white/25 bg-white/10 text-white backdrop-blur-sm"
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <div className="h-px w-8 bg-white/40" />
            <span>{brand.footer || "Mindware · Gestão de Afiliados"}</span>
            <div className="h-px w-8 bg-white/40" />
          </div>
        </div>
      )}
    </div>
  );
}
