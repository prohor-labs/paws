import Image from "next/image";

export function LandingStory() {
  return (
    <section id="story" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h2 className="mb-8 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
          Paws Academy কীভাবে কাজ করে?
        </h2>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl md:aspect-[21/9]">
          <Image
            src="/images/paws/academy-overview.jpg"
            alt="Paws Academy Overview"
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
