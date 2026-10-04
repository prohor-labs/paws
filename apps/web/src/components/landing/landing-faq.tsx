import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LANDING_FAQS } from "@/lib/consts/landing";

export function LandingFaq() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <h2 className="mb-10 text-center font-bold text-3xl tracking-tight sm:text-4xl">
          সচরাচর জিজ্ঞাসা
        </h2>

        <Accordion className="w-full">
          {LANDING_FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-base font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
