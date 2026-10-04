"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "@/components/icons";

export function LandingStory() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section id="story" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h2 className="mb-8 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
          Paws Academy কীভাবে কাজ করে?
        </h2>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl md:aspect-[21/9]">
          {isVideoPlaying ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/T3_fYxl14Ow?autoplay=1&rel=0"
              title="PAWS Academy Overview"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="size-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsVideoPlaying(true)}
              className="group relative flex size-full items-center justify-center cursor-pointer outline-none"
              aria-label="ভিডিও চালান"
            >
              <Image
                src="/images/paws/sddefault.jpg"
                alt="Video Thumbnail"
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
              <div className="relative flex size-16 items-center justify-center rounded-full border border-border/80 bg-background/80 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 sm:size-20">
                <Play className="ml-1 size-7 text-primary sm:size-8" />
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
