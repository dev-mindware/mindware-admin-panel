export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <img
        src="/mindware.png"
        alt="Logo"
        className="w-16 h-16 mb-4 animate-pulse opacity-80"
      />
      <div className="text-muted-foreground font-medium tracking-[0.2em] text-sm uppercase">Mindware Affiliate</div>
    </div>
  );
}
