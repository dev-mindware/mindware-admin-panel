import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030108]">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-purple-300/10" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-300/70 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <Image
          src="/brand/mindware.png"
          alt="Mindware"
          width={64}
          height={64}
          className="h-16 w-16 object-contain drop-shadow-[0_0_24px_rgba(168,85,247,0.35)]"
        />
      </div>
    </div>
  );
}
