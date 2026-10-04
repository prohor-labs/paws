import { cn } from "@/lib/utils";

export interface GridCoverProps {
  title?: string;
  subtitle?: string;
  category?: string;
  variant?: string;
  className?: string;
}

type VariantStyle = "corner" | "wave" | "triple";

interface PaletteTheme {
  title: string;
  subtitle: string;
  bgColor: string;
  shapeColor: string;
  accentColor?: string;
  style: VariantStyle;
}

function resolveCoverContent(
  rawTitle: string,
  rawSubtitle: string | undefined,
  defaultTitle: string,
  defaultSubtitle: string,
): { title: string; subtitle: string } {
  if (!rawTitle && !rawSubtitle) {
    return { title: defaultTitle, subtitle: defaultSubtitle };
  }

  const normRaw = rawTitle.trim();
  const normSub = (rawSubtitle || "").trim();

  if (!normSub) {
    return {
      title: normRaw || defaultTitle,
      subtitle: defaultSubtitle,
    };
  }

  if (
    /ইউনিট|বিভাগ\s*পরিবর্তন/i.test(normSub) ||
    /ক\s*ইউনিট|খ\s*ইউনিট|গ\s*ইউনিট|ঘ\s*ইউনিট|প্রযুক্তি/i.test(normSub)
  ) {
    return {
      title: normSub,
      subtitle: normRaw && normRaw !== normSub ? normRaw : defaultTitle,
    };
  }

  return {
    title: normRaw || defaultTitle,
    subtitle: normSub,
  };
}

function resolveStyle(category = "", title = ""): VariantStyle {
  const t = `${category} ${title}`.toLowerCase();
  if (
    category === "model_test" ||
    t.includes("model") ||
    t.includes("মডেল") ||
    t.includes("মক") ||
    t.includes("test")
  ) {
    return "triple";
  }

  if (
    category === "institution" ||
    t.includes("buet") ||
    t.includes("বুয়েট") ||
    t.includes("ঢাবি") ||
    t.includes("du") ||
    t.includes("জাবি") ||
    t.includes("ju") ||
    t.includes("রাবি") ||
    t.includes("ru") ||
    t.includes("চবি") ||
    t.includes("cu") ||
    t.includes("sust") ||
    t.includes("শাবিপ্রবি") ||
    t.includes("জবি") ||
    t.includes("jnu") ||
    t.includes("খুবি") ||
    t.includes("ku") ||
    t.includes("bup") ||
    t.includes("বিইউপি") ||
    t.includes("mist") ||
    t.includes("এমআইএসটি") ||
    t.includes("butex") ||
    t.includes("বুটেক্স") ||
    t.includes("ruet") ||
    t.includes("kuet") ||
    t.includes("cuet") ||
    t.includes("ckruet") ||
    t.includes("প্রকৌশল গুচ্ছ") ||
    t.includes("iut") ||
    t.includes("আইইউটি") ||
    t.includes("মেডিকেল") ||
    t.includes("medical") ||
    t.includes("ডেন্টাল") ||
    t.includes("dental") ||
    t.includes("bds") ||
    t.includes("afmc") ||
    t.includes("এএফএমসি") ||
    t.includes("নার্সিং") ||
    t.includes("nursing") ||
    t.includes("বিসিএস") ||
    t.includes("bcs") ||
    t.includes("আইবিএ") ||
    t.includes("iba") ||
    t.includes("কৃষি") ||
    t.includes("কৃবি") ||
    t.includes("bau") ||
    t.includes("hstu") ||
    t.includes("হাবিপ্রবি") ||
    t.includes("মেরিটাইম") ||
    t.includes("maritime") ||
    t.includes("টেক্সটাইল") ||
    t.includes("চারুকলা") ||
    t.includes("fine-arts") ||
    t.includes("শিক্ষক নিবন্ধন") ||
    t.includes("ntrca") ||
    t.includes("গুচ্ছ") ||
    t.includes("জাতীয় বিশ্ববিদ্যালয়") ||
    t.includes("জাতীয় বিশ্ববিদ্যালয়") ||
    t.includes("university") ||
    t.includes("বিশ্ববিদ্যালয়")
  ) {
    return "wave";
  }

  return "corner";
}

function getBasePalette(rawTitle = "", category = ""): PaletteTheme {
  const text = `${rawTitle} ${category}`.toLowerCase();
  const targetStyle = resolveStyle(category, rawTitle);

  if (text.includes("buet") || text.includes("বুয়েট") || text.includes("বাংলাদেশ প্রকৌশল")) {
    return {
      title: "বুয়েট",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#fecdd3",
      shapeColor: "#fb7185",
      accentColor: "#f43f5e",
      style: targetStyle,
    };
  }

  if (
    text.includes("ckruet") ||
    text.includes("প্রকৌশল গুচ্ছ") ||
    text.includes("চুয়েট") ||
    text.includes("কুয়েট") ||
    text.includes("রুয়েট") ||
    text.includes("cuet") ||
    text.includes("kuet") ||
    text.includes("ruet") ||
    text.includes("engineering-cluster")
  ) {
    return {
      title: "প্রকৌশল গুচ্ছ",
      subtitle: "চুয়েট • কুয়েট • রুয়েট",
      bgColor: "#99f6e4",
      shapeColor: "#2dd4bf",
      accentColor: "#0d9488",
      style: targetStyle,
    };
  }

  if (text.includes("butex") || text.includes("বুটেক্স") || text.includes("টেক্সটাইল")) {
    return {
      title: "বুটেক্স",
      subtitle: "টেক্সটাইল ভর্তি প্রশ্নব্যাংক",
      bgColor: "#fbcfe8",
      shapeColor: "#f472b6",
      accentColor: "#db2777",
      style: targetStyle,
    };
  }

  if (text.includes("mist") || text.includes("এমআইএসটি")) {
    return {
      title: "এমআইএসটি",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#cbd5e1",
      shapeColor: "#94a3b8",
      accentColor: "#64748b",
      style: targetStyle,
    };
  }

  if (text.includes("iut") || text.includes("আইইউটি")) {
    return {
      title: "আইইউটি",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#a7f3d0",
      shapeColor: "#34d399",
      accentColor: "#059669",
      style: targetStyle,
    };
  }

  if (text.includes("ডেন্টাল") || text.includes("dental") || text.includes("bds")) {
    return {
      title: "ডেন্টাল",
      subtitle: "বিডিএস ভর্তি প্রশ্নব্যাংক",
      bgColor: "#bae6fd",
      shapeColor: "#38bdf8",
      accentColor: "#0284c7",
      style: targetStyle,
    };
  }

  if (
    text.includes("মেডিকেল") ||
    text.includes("medical") ||
    text.includes("ম্যাটস") ||
    text.includes("mbbs") ||
    text.includes("afmc") ||
    text.includes("এএফএমসি")
  ) {
    return {
      title: "মেডিকেল",
      subtitle: "এমবিবিএস ভর্তি প্রশ্নব্যাংক",
      bgColor: "#99f6e4",
      shapeColor: "#2dd4bf",
      accentColor: "#14b8a6",
      style: targetStyle,
    };
  }

  if (text.includes("নার্সিং") || text.includes("nursing") || text.includes("মিডওয়াইফারি")) {
    return {
      title: "নার্সিং",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#fecdd3",
      shapeColor: "#fb7185",
      accentColor: "#e11d48",
      style: targetStyle,
    };
  }

  if (text.includes("আইবিএ") || text.includes("iba")) {
    return {
      title: "আইবিএ",
      subtitle: "বিবিএ ভর্তি প্রশ্নব্যাংক",
      bgColor: "#e2e8f0",
      shapeColor: "#cbd5e1",
      accentColor: "#94a3b8",
      style: targetStyle,
    };
  }

  if (text.includes("বিসিএস") || text.includes("bcs")) {
    return {
      title: "বিসিএস প্রিলিমিনারি",
      subtitle: "১০ম - ৪৬তম প্রশ্ন সমাধান",
      bgColor: "#a7f3d0",
      shapeColor: "#34d399",
      accentColor: "#16a34a",
      style: targetStyle,
    };
  }

  if (text.includes("বিইউপি") || text.includes("bup")) {
    return {
      title: "বিইউপি",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#d9f99d",
      shapeColor: "#a3e635",
      accentColor: "#65a30d",
      style: targetStyle,
    };
  }

  if (text.includes("মেরিটাইম") || text.includes("maritime")) {
    return {
      title: "মেরিটাইম",
      subtitle: "বিশ্ববিদ্যালয় প্রশ্নব্যাংক",
      bgColor: "#bae6fd",
      shapeColor: "#38bdf8",
      accentColor: "#0284c7",
      style: targetStyle,
    };
  }

  if (
    text.includes("কৃষি") ||
    text.includes("agriculture") ||
    text.includes("agri") ||
    text.includes("কৃবি") ||
    text.includes("bau")
  ) {
    return {
      title: "কৃষি গুচ্ছ",
      subtitle: "কৃষি বিশ্ববিদ্যালয় প্রশ্নব্যাংক",
      bgColor: "#bbf7d0",
      shapeColor: "#4ade80",
      accentColor: "#15803d",
      style: targetStyle,
    };
  }

  if (text.includes("হাবিপ্রবি") || text.includes("hstu")) {
    return {
      title: "হাবিপ্রবি",
      subtitle: "বিজ্ঞান ও প্রযুক্তি প্রশ্নব্যাংক",
      bgColor: "#fed7aa",
      shapeColor: "#fb923c",
      accentColor: "#ea580c",
      style: targetStyle,
    };
  }

  if (text.includes("টেক্সটাইল ইঞ্জিনিয়ারিং") || text.includes("tec")) {
    return {
      title: "টেক্সটাইল ইঞ্জিনিয়ারিং",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#fbcfe8",
      shapeColor: "#f472b6",
      accentColor: "#db2777",
      style: targetStyle,
    };
  }

  if (text.includes("অধিভুক্ত") || text.includes("du-affiliated")) {
    return {
      title: "৭ কলেজ অধিভুক্ত",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#8db1f3",
      shapeColor: "#739cf1",
      accentColor: "#3b82f6",
      style: targetStyle,
    };
  }

  if (
    text.includes("ঢাবি") ||
    text.includes("ঢাকা বিশ্ববিদ্যালয়") ||
    text.includes("du") ||
    text.includes("7 college") ||
    text.includes("৭ কলেজ")
  ) {
    return {
      title: "ঢাকা বিশ্ববিদ্যালয়",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#8db1f3",
      shapeColor: "#739cf1",
      accentColor: "#3b82f6",
      style: targetStyle,
    };
  }

  if (text.includes("জাবি") || text.includes("জাহাঙ্গীরনগর") || text.includes("ju")) {
    return {
      title: "জাহাঙ্গীরনগর",
      subtitle: "বিশ্ববিদ্যালয় ভর্তি প্রশ্নব্যাংক",
      bgColor: "#fed7aa",
      shapeColor: "#fb923c",
      accentColor: "#ea580c",
      style: targetStyle,
    };
  }

  if (text.includes("রাবি") || text.includes("রাজশাহী বিশ্ববিদ্যালয়") || text.includes("ru")) {
    return {
      title: "রাজশাহী বিশ্ববিদ্যালয়",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#fecdd3",
      shapeColor: "#f43f5e",
      accentColor: "#e11d48",
      style: targetStyle,
    };
  }

  if (text.includes("চবি") || text.includes("চট্টগ্রাম বিশ্ববিদ্যালয়") || text.includes("cu")) {
    return {
      title: "চট্টগ্রাম বিশ্ববিদ্যালয়",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#bae6fd",
      shapeColor: "#0ea5e9",
      accentColor: "#0284c7",
      style: targetStyle,
    };
  }

  if (text.includes("শাবিপ্রবি") || text.includes("sust") || text.includes("শাহজালাল")) {
    return {
      title: "শাবিপ্রবি",
      subtitle: "বিজ্ঞান ও প্রযুক্তি প্রশ্নব্যাংক",
      bgColor: "#ddd6fe",
      shapeColor: "#c084fc",
      accentColor: "#a855f7",
      style: targetStyle,
    };
  }

  if (text.includes("জবি") || text.includes("জগন্নাথ") || text.includes("jnu")) {
    return {
      title: "জগন্নাথ বিশ্ববিদ্যালয়",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#fed7aa",
      shapeColor: "#fb923c",
      accentColor: "#c2410c",
      style: targetStyle,
    };
  }

  if (text.includes("খুবি") || text.includes("খুলনা বিশ্ববিদ্যালয়") || text.includes("ku")) {
    return {
      title: "খুলনা বিশ্ববিদ্যালয়",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#bbf7d0",
      shapeColor: "#4ade80",
      accentColor: "#15803d",
      style: targetStyle,
    };
  }

  if (text.includes("চারুকলা") || text.includes("fine art") || text.includes("fine-arts")) {
    return {
      title: "চারুকলা অনুষদ",
      subtitle: "ভর্তি প্রশ্নব্যাংক",
      bgColor: "#fbcfe8",
      shapeColor: "#ec4899",
      accentColor: "#be185d",
      style: targetStyle,
    };
  }

  if (text.includes("শিক্ষক নিবন্ধন") || text.includes("ntrca")) {
    return {
      title: "শিক্ষক নিবন্ধন",
      subtitle: "প্রিলিমিনারি প্রশ্নব্যাংক",
      bgColor: "#99f6e4",
      shapeColor: "#2dd4bf",
      accentColor: "#0f766e",
      style: targetStyle,
    };
  }

  if (
    text.includes("সাধারণ গুচ্ছ") ||
    text.includes("gst") ||
    text.includes("general-cluster") ||
    text.includes("জাতীয় বিশ্ববিদ্যালয়") ||
    text.includes("জাতীয় বিশ্ববিদ্যালয়") ||
    text.includes("national university")
  ) {
    return {
      title: "জিএসটি গুচ্ছ",
      subtitle: "সাধারণ ও প্রযুক্তি বিশ্ববিদ্যালয়",
      bgColor: "#ddd6fe",
      shapeColor: "#c084fc",
      accentColor: "#9333ea",
      style: targetStyle,
    };
  }

  if (text.includes("পদার্থবিজ্ঞান ১ম") || (text.includes("physics") && text.includes("1"))) {
    return {
      title: "পদার্থবিজ্ঞান ১ম পত্র",
      subtitle: "এইচএসসি অধ্যায়ভিত্তিক প্রশ্নব্যাংক",
      bgColor: "#8db1f3",
      shapeColor: "#739cf1",
      accentColor: "#3b82f6",
      style: targetStyle,
    };
  }

  if (text.includes("পদার্থবিজ্ঞান ২য়") || (text.includes("physics") && text.includes("2"))) {
    return {
      title: "পদার্থবিজ্ঞান ২য় পত্র",
      subtitle: "এইচএসসি অধ্যায়ভিত্তিক প্রশ্নব্যাংক",
      bgColor: "#7dd3fc",
      shapeColor: "#38bdf8",
      accentColor: "#0284c7",
      style: targetStyle,
    };
  }

  if (
    text.includes("রসায়ন ১ম") ||
    text.includes("রসায়ন ১ম") ||
    (text.includes("chem") && text.includes("1"))
  ) {
    return {
      title: "রসায়ন ১ম পত্র",
      subtitle: "এইচএসসি অধ্যায়ভিত্তিক প্রশ্নব্যাংক",
      bgColor: "#fde68a",
      shapeColor: "#f59e0b",
      accentColor: "#d97706",
      style: targetStyle,
    };
  }

  if (
    text.includes("রসায়ন ২য়") ||
    text.includes("রসায়ন ২য়") ||
    (text.includes("chem") && text.includes("2"))
  ) {
    return {
      title: "রসায়ন ২য় পত্র",
      subtitle: "এইচএসসি অধ্যায়ভিত্তিক প্রশ্নব্যাংক",
      bgColor: "#fed7aa",
      shapeColor: "#fb923c",
      accentColor: "#ea580c",
      style: targetStyle,
    };
  }

  if (text.includes("জীববিজ্ঞান ১ম") || (text.includes("bio") && text.includes("1"))) {
    return {
      title: "জীববিজ্ঞান ১ম পত্র",
      subtitle: "উদ্ভিদবিজ্ঞান প্রশ্নব্যাংক",
      bgColor: "#a7f3d0",
      shapeColor: "#34d399",
      accentColor: "#059669",
      style: targetStyle,
    };
  }

  if (text.includes("জীববিজ্ঞান ২য়") || (text.includes("bio") && text.includes("2"))) {
    return {
      title: "জীববিজ্ঞান ২য় পত্র",
      subtitle: "প্রাণিবিজ্ঞান প্রশ্নব্যাংক",
      bgColor: "#99f6e4",
      shapeColor: "#2dd4bf",
      accentColor: "#0d9488",
      style: targetStyle,
    };
  }

  if (text.includes("গণিত ১ম") || (text.includes("math") && text.includes("1"))) {
    return {
      title: "উচ্চতর গণিত ১ম পত্র",
      subtitle: "এইচএসসি অধ্যায়ভিত্তিক প্রশ্নব্যাংক",
      bgColor: "#ddd6fe",
      shapeColor: "#a855f7",
      accentColor: "#7c3aed",
      style: targetStyle,
    };
  }

  if (text.includes("গণিত ২য়") || (text.includes("math") && text.includes("2"))) {
    return {
      title: "উচ্চতর গণিত ২য় পত্র",
      subtitle: "এইচএসসি অধ্যায়ভিত্তিক প্রশ্নব্যাংক",
      bgColor: "#e9d5ff",
      shapeColor: "#c084fc",
      accentColor: "#9333ea",
      style: targetStyle,
    };
  }

  if (text.includes("আইসিটি") || text.includes("ict") || text.includes("তথ্য ও যোগাযোগ")) {
    return {
      title: "তথ্য ও যোগাযোগ প্রযুক্তি",
      subtitle: "এইচএসসি আইসিটি প্রশ্নব্যাংক",
      bgColor: "#7dd3fc",
      shapeColor: "#0284c7",
      accentColor: "#0369a1",
      style: targetStyle,
    };
  }

  if (text.includes("বাংলা ১ম") || (text.includes("bangla") && text.includes("1"))) {
    return {
      title: "বাংলা ১ম পত্র",
      subtitle: "এইচএসসি প্রশ্নব্যাংক",
      bgColor: "#a7f3d0",
      shapeColor: "#4ade80",
      accentColor: "#16a34a",
      style: targetStyle,
    };
  }

  if (text.includes("বাংলা ২য়") || (text.includes("bangla") && text.includes("2"))) {
    return {
      title: "বাংলা ২য় পত্র",
      subtitle: "এইচএসসি প্রশ্নব্যাংক",
      bgColor: "#bbf7d0",
      shapeColor: "#22c55e",
      accentColor: "#15803d",
      style: targetStyle,
    };
  }

  if (text.includes("বাংলা") || text.includes("bangla")) {
    return {
      title: rawTitle || "বাংলা",
      subtitle: "এইচএসসি প্রশ্নব্যাংক",
      bgColor: "#a7f3d0",
      shapeColor: "#4ade80",
      accentColor: "#16a34a",
      style: targetStyle,
    };
  }

  if (text.includes("ইংরেজি ১ম") || (text.includes("english") && text.includes("1"))) {
    return {
      title: "ইংরেজি ১ম পত্র",
      subtitle: "HSC English 1st Paper",
      bgColor: "#8db1f3",
      shapeColor: "#739cf1",
      accentColor: "#3b82f6",
      style: targetStyle,
    };
  }

  if (text.includes("ইংরেজি ২য়") || (text.includes("english") && text.includes("2"))) {
    return {
      title: "ইংরেজি ২য় পত্র",
      subtitle: "HSC English 2nd Paper",
      bgColor: "#7dd3fc",
      shapeColor: "#38bdf8",
      accentColor: "#0284c7",
      style: targetStyle,
    };
  }

  if (text.includes("ইংরেজি") || text.includes("english")) {
    return {
      title: rawTitle || "English",
      subtitle: "HSC Question Bank",
      bgColor: "#8db1f3",
      shapeColor: "#739cf1",
      accentColor: "#3b82f6",
      style: targetStyle,
    };
  }

  if (text.includes("পরিসংখ্যান") || text.includes("stat")) {
    return {
      title: rawTitle || "পরিসংখ্যান",
      subtitle: "এইচএসসি প্রশ্নব্যাংক",
      bgColor: "#ddd6fe",
      shapeColor: "#a855f7",
      accentColor: "#7c3aed",
      style: targetStyle,
    };
  }

  if (text.includes("কৃষিশিক্ষা") || text.includes("কৃষি")) {
    return {
      title: rawTitle || "কৃষিশিক্ষা",
      subtitle: "এইচএসসি প্রশ্নব্যাংক",
      bgColor: "#bbf7d0",
      shapeColor: "#4ade80",
      accentColor: "#15803d",
      style: targetStyle,
    };
  }

  if (
    text.includes("মডেল") ||
    text.includes("model") ||
    text.includes("test") ||
    text.includes("মক")
  ) {
    return {
      title: rawTitle || "মডেল টেস্ট",
      subtitle: "বিশেষ প্রস্তুতি ও মূল্যায়ন",
      bgColor: "#fde68a",
      shapeColor: "#fbbf24",
      accentColor: "#d97706",
      style: targetStyle,
    };
  }

  return {
    title: rawTitle || "প্রশ্নব্যাংক",
    subtitle: "অনুশীলন ও প্রস্তুতি",
    bgColor: "#8db1f3",
    shapeColor: "#739cf1",
    style: targetStyle,
  };
}

function getCoverTheme(rawTitle = "", category = "", rawSubtitle?: string): PaletteTheme {
  const base = getBasePalette(rawTitle, category);
  const content = resolveCoverContent(rawTitle, rawSubtitle, base.title, base.subtitle);

  return {
    ...base,
    title: content.title,
    subtitle: content.subtitle,
  };
}

export function GridCover({ title, subtitle, category, className }: GridCoverProps) {
  const theme = getCoverTheme(title, category, subtitle);

  return (
    <div
      className={cn(
        "relative size-full overflow-hidden flex items-center justify-center p-4 sm:p-5 font-sans select-none",
        className,
      )}
      style={{ backgroundColor: theme.bgColor }}
    >
      <svg
        className="absolute inset-0 size-full pointer-events-none"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {theme.style === "triple" && (
          <>
            <circle cx="400" cy="0" r="120" fill={theme.shapeColor} />
            <circle cx="0" cy="320" r="160" fill={theme.shapeColor} />
            <circle cx="440" cy="240" r="100" fill={theme.shapeColor} fillOpacity="0.5" />
          </>
        )}

        {theme.style === "wave" && (
          <>
            <path d="M 0 0 L 400 0 L 400 120 C 200 160 120 40 0 80 Z" fill={theme.shapeColor} />
            <path
              d="M 0 400 L 400 400 L 400 320 C 280 240 160 360 0 280 Z"
              fill={theme.shapeColor}
            />
          </>
        )}

        {theme.style === "corner" && (
          <>
            <circle cx="380" cy="0" r="180" fill={theme.shapeColor} />
            <circle cx="20" cy="400" r="140" fill={theme.shapeColor} />
          </>
        )}
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-3 max-w-full">
        <h2 className="font-sans text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">
          {theme.title}
        </h2>
        <p className="font-sans text-[11px] sm:text-xs font-semibold text-slate-800/80 mt-1 leading-normal line-clamp-1">
          {theme.subtitle}
        </p>
      </div>
    </div>
  );
}
