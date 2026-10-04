export interface StepItem {
  id: string;
  value: number;
  label: string;
  title: string;
  description: string;
  optional?: boolean;
}

export interface LevelOption {
  id: string;
  label: string;
  description: string;
  iconName: "GraduationCap" | "BookOpen" | "DocumentText" | "Award";
}

export interface TrackPreset {
  id: string;
  label: string;
  subtitle: string;
  subjectsSummary: string;
  subjects: readonly string[];
}

export interface ScheduleOption {
  id: string;
  label: string;
  description: string;
}

export const ONBOARDING_STEPS: readonly StepItem[] = [
  {
    id: "profile",
    value: 1,
    label: "প্রোফাইল",
    title: "আপনার প্রোফাইল প্রস্তুত করুন",
    description: "আপনার নাম এবং প্রোফাইল তথ্য প্রদান করুন যা অ্যাকাউন্টে ব্যবহৃত হবে।",
  },
  {
    id: "level",
    value: 2,
    label: "শিক্ষাগত স্তর",
    title: "আপনার শ্রেণি বা লক্ষ্য নির্বাচন করুন",
    description: "আপনার পড়ালেখার স্তর অনুযায়ী কন্টেন্ট ও পরীক্ষা সাজানো হবে।",
  },
  {
    id: "subjects",
    value: 3,
    label: "স্টাডি ট্র্যাক",
    title: "আপনার প্রস্তুতি ট্র্যাক বেছে নিন",
    description: "যে বিভাগে আপনি অনুশীলন ও মডেল টেস্ট দিতে চান তা নির্বাচন করুন।",
  },
  {
    id: "schedule",
    value: 4,
    label: "দৈনিক লক্ষ্য",
    title: "দৈনিক পড়াশোনার লক্ষ্য নির্ধারণ করুন",
    description: "প্রতিদিন কতটা সময় প্রশ্নব্যাংক ও পড়াশোনায় দিতে চান তা ঠিক করুন।",
    optional: true,
  },
  {
    id: "ready",
    value: 5,
    label: "সম্পন্ন",
    title: "সবকিছু প্রস্তুত!",
    description: "আপনার স্টাডি স্পেস সম্পূর্ণ কনফিগার করা হয়েছে।",
  },
] as const;

export const LEVEL_OPTIONS: readonly LevelOption[] = [
  {
    id: "hsc-26",
    label: "এইচএসসি ২০২৬",
    description: "একাদশ ও দ্বাদশ শ্রেণির শিক্ষাক্রম ও বোর্ড প্রশ্নব্যাংক",
    iconName: "GraduationCap",
  },
  {
    id: "hsc-25",
    label: "এইচএসসি ২০২৫",
    description: "এইচএসসি পরীক্ষার্থীদের চূড়ান্ত প্রস্তুতি ও মডেল টেস্ট",
    iconName: "BookOpen",
  },
  {
    id: "ssc",
    label: "এসএসসি ও দাখিল",
    description: "নবম ও দশম শ্রেণির পূর্ণাঙ্গ সিলেবাস অনুশীলন",
    iconName: "DocumentText",
  },
  {
    id: "admission",
    label: "বিশ্ববিদ্যালয় ভর্তি",
    description: "মেডিকেল, ইঞ্জিনিয়ারিং ও ভার্সিটি ক ইউনিট প্রশ্নব্যাংক",
    iconName: "Award",
  },
] as const;

export const TRACK_PRESETS: readonly TrackPreset[] = [
  {
    id: "engineering",
    label: "ইঞ্জিনিয়ারিং ফোকাস",
    subtitle: "বুয়েট, চুয়েট, কুয়েট, রুয়েট ও বিজ্ঞান প্রযুক্তি বিশ্ববিদ্যালয়",
    subjectsSummary: "উচ্চতর গণিত • পদার্থবিজ্ঞান • রসায়ন • আইসিটি",
    subjects: ["higher-math", "physics", "chemistry", "ict"],
  },
  {
    id: "medical",
    label: "মেডিকেল ও বায়োলজি ফোকাস",
    subtitle: "সরকারি মেডিকেল, ডেন্টাল ও বায়ো-সায়েন্স অনুষদ",
    subjectsSummary: "জীববিজ্ঞান • রসায়ন • পদার্থবিজ্ঞান • ইংরেজি",
    subjects: ["biology", "chemistry", "physics", "english"],
  },
  {
    id: "full-science",
    label: "পূর্ণাঙ্গ বিজ্ঞান ও বোর্ড প্রস্তুতি",
    subtitle: "বোর্ড পরীক্ষায় জিপিএ-৫ ও পূর্ণাঙ্গ সিলেবাস দক্ষতা",
    subjectsSummary: "গণিত • পদার্থ • রসায়ন • জীববিজ্ঞান • বাংলা • ইংরেজি • আইসিটি",
    subjects: ["higher-math", "physics", "chemistry", "biology", "ict", "bangla", "english"],
  },
] as const;

export const SCHEDULE_OPTIONS: readonly ScheduleOption[] = [
  {
    id: "30m",
    label: "৩০ মিনিট / দিন",
    description: "দ্রুত কুইজ ও দৈনিক রিভিশন",
  },
  {
    id: "1h",
    label: "১ ঘণ্টা / দিন",
    description: "ধারাবাহিক অনুশীলন ও প্রশ্ন সমাধান",
  },
  {
    id: "2h",
    label: "২ ঘণ্টা / দিন",
    description: "গভীর প্রস্তুতি ও পূর্ণাঙ্গ মডেল টেস্ট",
  },
  {
    id: "3h",
    label: "৩+ ঘণ্টা / দিন",
    description: "সর্বোচ্চ প্রস্তুতি ও বোর্ড পরীক্ষায় সেরা ফলাফল",
  },
] as const;
