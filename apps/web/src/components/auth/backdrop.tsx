export function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 dark:opacity-40" />
      <div className="absolute -top-32 left-1/2 -z-10 h-[480px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand/20 via-primary/10 to-transparent blur-3xl dark:from-brand/25 dark:via-primary/15" />
    </div>
  );
}
