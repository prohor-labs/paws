import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-6xl font-black tracking-tight text-primary/20">৪০৪</span>
      <h2 className="text-xl font-bold tracking-tight text-foreground">পেজটি খুঁজে পাওয়া যায়নি</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে বা কখনোই ছিল না।
      </p>
      <Link
        href="/"
        className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
      >
        হোমে ফিরে যান
      </Link>
    </div>
  );
}
