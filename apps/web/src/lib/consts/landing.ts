export interface NavItem {
  label: string;
  href: string;
}

export interface StatCardItem {
  tag: string;
  count: string;
  description: string;
  highlight: string;
  bgImage: string;
}

export interface RoadmapItem {
  step: string;
  title: string;
  status: "completed" | "current" | "upcoming";
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PartnerItem {
  name: string;
  logo: string;
}

export const LANDING_NAV_LINKS: NavItem[] = [
  { label: "হোম", href: "#home" },
  { label: "অ্যাকাডেমি", href: "#about" },
  { label: "লার্নিং ট্র্যাক", href: "#story" },
  { label: "কারিকুলাম", href: "#roadmap" },
  { label: "FAQ", href: "#faq" },
];

export const LANDING_STATS: StatCardItem[] = [
  {
    tag: "সক্রিয় শিক্ষার্থী",
    count: "75K+",
    description: "শিক্ষার্থী নিয়মিত প্র্যাকটিস ও মক টেস্টে অংশ নিচ্ছে।",
    highlight: "সারা দেশে",
    bgImage: "/images/paws/stat-card-3.png",
  },
  {
    tag: "প্রশ্নব্যাংক ও মক টেস্ট",
    count: "50K+",
    description: "বিশেষজ্ঞদের তৈরি নির্ভুল প্রশ্ন ও বিস্তারিত ব্যাখ্যা।",
    highlight: "মানসম্মত",
    bgImage: "/images/paws/stat-card-2.png",
  },
  {
    tag: "সাফল্যের হার",
    count: "95%",
    description: "শিক্ষার্থী তাদের লক্ষ্য অর্জনে আত্মবিশ্বাসী হয়ে উঠেছে।",
    highlight: "ধারাবাহিক",
    bgImage: "/images/paws/stat-card-1.png",
  },
];

export const LANDING_ROADMAP: RoadmapItem[] = [
  {
    step: "ধাপ ১",
    title: "বেসিক কনসেপ্ট ও ইন্টারঅ্যাক্টিভ লেসন",
    status: "completed",
  },
  {
    step: "ধাপ ২",
    title: "টপিক-ভিত্তিক কুইজ ও সেলফ অ্যাসেসমেন্ট",
    status: "completed",
  },
  {
    step: "ধাপ ৩",
    title: "লাইভ মক টেস্ট ও লিডারবোর্ড ট্র্যাকিং",
    status: "current",
  },
  {
    step: "ধাপ ৪",
    title: "AI পার্সোনালাইজড পারফরম্যান্স অ্যানালিটিক্স",
    status: "upcoming",
  },
  {
    step: "ধাপ ৫",
    title: "এডভান্সড স্কলারশিপ ও সার্টিফিকেট প্রোগ্রাম",
    status: "upcoming",
  },
];

export const LANDING_FAQS: FaqItem[] = [
  {
    id: "item-1",
    question: "Paws Academy-তে কীভাবে পড়াশোনা শুরু করব?",
    answer:
      "বিনামূল্যে একাউন্ট তৈরি করে আপনার পছন্দের কোর্স ও প্রশ্নব্যাংক নির্বাচন করে তাৎক্ষণিক প্র্যাকটিস শুরু করতে পারবেন।",
  },
  {
    id: "item-2",
    question: "মক টেস্ট এবং প্রশ্নব্যাংক কীভাবে কাজ করে?",
    answer:
      "প্রতিটি বিষয়ের অধ্যায়ভিত্তিক প্র্যাকটিস প্রশ্ন, টাইমারযুক্ত পূর্ণাঙ্গ মক টেস্ট এবং প্রতিটি উত্তরের সাথে গভীর বিশ্লেষণ রয়েছে।",
  },
  {
    id: "item-3",
    question: "মোবাইল ডিভাইসে কি নির্বিঘ্নে অনুশীলন করা যায়?",
    answer: "হ্যাঁ, Paws Academy সম্পূর্ণ মোবাইল ফ্রেন্ডলি এবং যে কোনো ডিভাইস থেকে স্মুথলি পরীক্ষা দেওয়া সম্ভব।",
  },
];

export const LANDING_PARTNERS: PartnerItem[] = [];

