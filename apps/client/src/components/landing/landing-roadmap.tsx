import { LANDING_ROADMAP } from "@/lib/consts/landing";

export function LandingRoadmap() {
  return (
    <section id="roadmap" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="mb-12 font-bold text-3xl tracking-tight sm:text-4xl">
          লার্নিং কারিকুলাম ও রোডম্যাপ
        </h2>

        <ol className="flex w-full flex-col gap-6 border-border/60 border-l pl-6 text-left sm:pl-8">
          {LANDING_ROADMAP.map((item) => (
            <li key={item.step} className="relative flex flex-col gap-1">
              <div
                className={`absolute -left-[31px] top-1.5 size-3.5 rounded-full sm:-left-[39px] ${
                  item.status === "completed"
                    ? "bg-primary shadow-[0_0_10px_var(--primary)]"
                    : item.status === "current"
                      ? "animate-pulse bg-primary"
                      : "border-2 border-border bg-background"
                }`}
              />
              <span className="text-muted-foreground text-xs font-bold">{item.step}</span>
              <span className="font-semibold text-lg text-foreground">{item.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
