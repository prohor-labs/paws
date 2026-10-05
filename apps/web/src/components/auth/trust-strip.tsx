import Image from "next/image";
import { CUSTOMER_LOGOS } from "@/lib/consts/auth";

export function TrustStrip() {
  return (
    <div className="flex flex-col items-center gap-5 px-5 pt-6 pb-8 sm:gap-7 sm:px-10 sm:pt-9 sm:pb-11">
      <p className="text-xs tracking-wide text-muted-foreground">
        শীর্ষস্থানীয় শিক্ষার্থীদের পছন্দের প্ল্যাটফর্ম
      </p>
      <ul className="flex items-center justify-center gap-4 opacity-80" aria-label="Customer logos">
        {CUSTOMER_LOGOS.map((item) => (
          <li key={item.id} aria-label={item.name} className="flex h-6 items-center justify-center">
            <Image
              src={item.iconSrc}
              alt={item.name}
              width={24}
              height={24}
              className="h-4 w-auto max-h-5 object-contain opacity-80"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
