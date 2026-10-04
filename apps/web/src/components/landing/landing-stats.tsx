import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LANDING_STATS } from "@/lib/consts/landing";

export function LandingStats() {
  return (
    <section id="about" className="relative z-10 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="mb-14 flex flex-col items-center gap-3">
          <h2 className="max-w-2xl font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
            স্মার্ট লার্নিং ও পরীক্ষার প্রস্তুতি
          </h2>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {LANDING_STATS.map((stat) => (
            <Card
              key={stat.tag}
              className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden border-border/60 bg-card/80 backdrop-blur-xs p-0 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={stat.bgImage}
                  alt={stat.tag}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-35 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 to-card/20" />
              </div>

              <CardHeader className="relative z-10 pb-1">
                <Badge
                  variant="secondary"
                  className="w-fit text-[11px] font-bold uppercase tracking-wider"
                >
                  {stat.tag}
                </Badge>
              </CardHeader>

              <CardContent className="relative z-10 flex flex-col items-start gap-2 pt-0 pb-6 text-left">
                <CardTitle className="font-bold text-5xl tracking-tighter text-foreground">
                  {stat.count}
                </CardTitle>
                <p className="text-muted-foreground text-sm leading-snug">
                  <span className="font-semibold text-foreground">{stat.highlight}</span>{" "}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
