import Image from "next/image";

export function HeroImageSide({ source }: { source: string }) {
  return (
    <div className="relative hidden w-full h-screen lg:flex items-center justify-center p-12 bg-muted/30">
      <Image
        fill
        src={source}
        alt="Login Visual"
        className="object-contain p-20"
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
      />
    </div>
  );
}
