import {
  LandingFaq,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingRoadmap,
  LandingStats,
  LandingStory,
  LandingSupporters,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Background theme ambient glows and grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:opacity-20" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl dark:from-primary/25 dark:via-primary/10" />
        <div className="absolute top-[45%] -left-48 -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
        <div className="absolute top-[75%] -right-48 -z-10 h-[450px] w-[450px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />
      </div>

      <LandingHeader />
      <main className="relative z-10">
        <LandingHero />
        <LandingStats />
        <LandingStory />
        <LandingRoadmap />
        <LandingFaq />
        <LandingSupporters />
      </main>
      <LandingFooter />
    </div>
  );
}
