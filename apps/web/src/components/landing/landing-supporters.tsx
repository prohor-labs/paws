import Image from "next/image";
import { LANDING_PARTNERS } from "@/lib/consts/landing";

export function LandingSupporters() {
  return (
    <section id="supporters" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h3 className="mb-10 font-bold text-xl text-muted-foreground tracking-tight sm:text-2xl">
          আমাদের পার্টনার ও শুভানুধ্যায়ী
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {LANDING_PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="relative h-12 w-36 grayscale opacity-60 transition-[filter,opacity,transform] duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                sizes="144px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
