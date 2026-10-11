/* eslint-disable @next/next/no-img-element */
import { BASE_PATH } from "@/constants/routes";

export function Loader() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <img src={`${BASE_PATH}/mindware.png`} alt="Mindware" className="mb-4 size-16 animate-pulse opacity-80" />
      <div className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">MindSchool · Administração</div>
    </div>
  );
}
