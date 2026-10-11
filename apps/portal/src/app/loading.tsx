import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-white/60" />
        <Image src="/brand/mindware.png" alt="Mindware" width={40} height={40} className="h-10 w-10 object-contain" />
      </div>
    </div>
  );
}
