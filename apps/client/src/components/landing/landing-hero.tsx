"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown } from "@/components/icons";

export function LandingHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-4 py-12 sm:py-16"
    >
      <div className="relative my-auto flex w-full max-w-4xl flex-1 items-center justify-center">
        <div
          className="relative aspect-square w-full max-w-[620px] transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        >
          <Image
            src="/images/paws/hero-planet.png"
            alt="PAWS Planet"
            fill
            sizes="(max-width: 768px) 100vw, 620px"
            className="object-contain drop-shadow-[0_0_80px_rgba(71,133,255,0.15)]"
            priority
          />

          <div className="pointer-events-none absolute -top-[5%] left-[6%] size-16 sm:size-24 md:size-36 animate-float opacity-90">
            <Image
              src="/images/paws/shape1.webp"
              alt="PAWS Floating Shape 1"
              fill
              sizes="(max-width: 768px) 96px, 144px"
              className="object-contain"
            />
          </div>

          <div className="pointer-events-none absolute top-[8%] right-[6%] size-16 sm:size-24 md:size-36 animate-float-delayed opacity-90">
            <Image
              src="/images/paws/shape2.webp"
              alt="PAWS Floating Shape 2"
              fill
              sizes="(max-width: 768px) 96px, 144px"
              className="object-contain"
            />
          </div>

          <div className="pointer-events-none absolute top-[48%] -left-[2%] size-20 sm:size-28 md:size-44 animate-float-slow opacity-90">
            <Image
              src="/images/paws/shape3.webp"
              alt="PAWS Floating Shape 3"
              fill
              sizes="(max-width: 768px) 112px, 176px"
              className="object-contain"
            />
          </div>

          <div className="pointer-events-none absolute right-[6%] bottom-[12%] size-16 sm:size-20 md:size-28 animate-float opacity-90">
            <Image
              src="/images/paws/shape4.webp"
              alt="PAWS Floating Shape 4"
              fill
              sizes="(max-width: 768px) 80px, 112px"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="z-20 mb-8 flex flex-col items-center sm:mb-12">
        <Link
          href="#about"
          className="group flex flex-col items-center gap-2 pt-2 text-sm font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <ArrowDown className="size-5 animate-bounce text-primary" />
          <span>নিচে স্ক্রোল করুন</span>
        </Link>
      </div>
    </section>
  );
}
