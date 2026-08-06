import Image, { type StaticImageData } from "next/image";

type HeroImageSideProps = {
  source: string | StaticImageData;
  /** cover fills the panel (photos); contain keeps illustration letterboxed */
  fit?: "cover" | "contain";
  alt?: string;
  /** Brand mark and titles overlaid on photo heroes */
  brand?: {
    logoSrc: string | StaticImageData;
    title: string;
    subtitle?: string;
  };
};

export function HeroImageSide({
  source,
  fit = "contain",
  alt = "Visual de apoio ao login",
  brand,
}: HeroImageSideProps) {
  return (
    <div className="relative hidden h-screen w-full overflow-hidden lg:flex">
      <Image
        fill
        src={source}
        alt={alt}
        className={fit === "cover" ? "object-cover" : "object-contain p-8"}
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
      />

      {fit === "cover" && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"
          aria-hidden
        />
      )}

      {brand && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Image
                src={brand.logoSrc}
                alt={brand.title}
                fill
                className="object-contain p-1.5"
                sizes="48px"
                priority
              />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              {brand.title}
            </span>
          </div>
          {brand.subtitle && (
            <p className="max-w-md text-sm leading-relaxed text-white/80">
              {brand.subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
