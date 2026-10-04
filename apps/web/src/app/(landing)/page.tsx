import {
  LandingFaq,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingJoin,
  LandingRoadmap,
  LandingStats,
  LandingStory,
  LandingSupporters,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingStory />
        <LandingRoadmap />
        <LandingFaq />
        <LandingSupporters />
        <LandingJoin />
      </main>
      <LandingFooter />
    </div>
  );
}
