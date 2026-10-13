export interface StepItem {
  id: string;
  value: number;
  label: string;
  title: string;
  description: string;
  optional?: boolean;
}

export type EducationalStandard = "ssc" | "hsc" | "admission" | "job";

export interface StandardOption {
  id: EducationalStandard;
  label: string;
  subtitle: string;
  description: string;
  iconName: "DocumentText" | "GraduationCap" | "Award" | "BookOpen";
}

export interface StreamOption {
  id: string;
  label: string;
  subtitle: string;
  subjectsSummary: string;
  targetSlug?: string;
  defaultSubjects: readonly string[];
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
    id: "standard",
    value: 2,
    label: "শিক্ষাগত স্তর",
    title: "আপনার শ্রেণি বা প্রস্তুতি স্তর বেছে নিন",
    description: "আপনার বর্তমান অধ্যয়নের স্তর অনুযায়ী কন্টেন্ট ও প্রশ্নব্যাংক ফিল্টার করা হবে।",
  },
  {
    id: "stream",
    value: 3,
    label: "বিভাগ / ট্র্যাক",
    title: "আপনার স্টাডি গ্রুপ বা টার্গেট নির্বাচন করুন",
    description: "আপনার নির্বাচিত স্তরের আওতাভুক্ত বিভাগ বা পরীক্ষার ট্র্যাক বেছে নিন।",
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

export const STANDARD_OPTIONS: readonly StandardOption[] = [
  {
    id: "hsc",
    label: "এইচএসসি (HSC Academic)",
    subtitle: "একাদশ-দ্বাদশ শ্রেণি ও আলিম",
    description: "বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক বিভাগের বোর্ড প্রশ্নব্যাংক",
    iconName: "GraduationCap",
  },
  {
    id: "ssc",
    label: "এসএসসি (SSC Academic)",
    subtitle: "নবম-দশম শ্রেণি ও দাখিল",
    description: "সকল বিভাগ ও বোর্ড পরীক্ষার প্রশ্ন সমাধান ও অনুশীলন",
    iconName: "DocumentText",
  },
  {
    id: "admission",
    label: "বিশ্ববিদ্যালয় ভর্তি (Admission)",
    subtitle: "ইঞ্জিনিয়ারিং, মেডিকেল ও ভার্সিটি",
    description: "বুয়েট, মেডিকেল, ঢাবি ও গুচ্ছ ভর্তি প্রশ্নব্যাংক",
    iconName: "Award",
  },
  {
    id: "job",
    label: "চাকরি ও ক্যারিয়ার (Job Recruitment)",
    subtitle: "বিসিএস, ব্যাংক, শিক্ষক নিবন্ধন ও মন্ত্রণালয়",
    description: "সরকারি ও বেসরকারি চাকরি নিয়োগ পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি",
    iconName: "BookOpen",
  },
] as const;

export const STREAM_OPTIONS_BY_STANDARD: Record<EducationalStandard, readonly StreamOption[]> = {
  ssc: [
    {
      id: "science",
      label: "বিজ্ঞান বিভাগ (Science)",
      subtitle: "এসএসসি বিজ্ঞান শাখা",
      subjectsSummary: "পদার্থবিজ্ঞান • রসায়ন • উচ্চতর গণিত • জীববিজ্ঞান • আইসিটি",
      defaultSubjects: ["physics", "chemistry", "higher-math", "biology", "ict"],
    },
    {
      id: "commerce",
      label: "ব্যবসায় শিক্ষা (Commerce)",
      subtitle: "এসএসসি ব্যবসায় শিক্ষা শাখা",
      subjectsSummary: "হিসাববিজ্ঞান • ব্যবসায় উদ্যোগ • ফিন্যান্স ও ব্যাংকিং • সাধারণ বিজ্ঞান",
      defaultSubjects: ["accounting", "business-ent", "finance", "general-science"],
    },
    {
      id: "humanities",
      label: "মানবিক বিভাগ (Humanities)",
      subtitle: "এসএসসি মানবিক শাখা",
      subjectsSummary: "পৌরনীতি ও নাগরিকতা • ভূগোল • ইতিহাস • অর্থনীতি • সাধারণ বিজ্ঞান",
      defaultSubjects: ["civics", "geography", "history", "economics"],
    },
  ],
  hsc: [
    {
      id: "science",
      label: "বিজ্ঞান বিভাগ (Science)",
      subtitle: "এইচএসসি বিজ্ঞান শাখা ও বোর্ড সমাধান",
      subjectsSummary: "পদার্থবিজ্ঞান • রসায়ন • উচ্চতর গণিত • জীববিজ্ঞান • আইসিটি",
      defaultSubjects: ["physics", "chemistry", "higher-math", "biology", "ict"],
    },
    {
      id: "commerce",
      label: "ব্যবসায় শিক্ষা (Commerce)",
      subtitle: "এইচএসসি ব্যবসায় শিক্ষা শাখা ও বোর্ড সমাধান",
      subjectsSummary: "হিসাববিজ্ঞান • ব্যবসায় সংগঠন • ফিন্যান্স • উৎপাদন ব্যবস্থাপনা",
      defaultSubjects: ["accounting", "management", "finance", "production-management"],
    },
    {
      id: "humanities",
      label: "মানবিক বিভাগ (Humanities)",
      subtitle: "এইচএসসি মানবিক শাখা ও বোর্ড সমাধান",
      subjectsSummary: "পৌরনীতি • অর্থনীতি • যুক্তিবিদ্যা • ইতিহাস • সমাজবিজ্ঞান",
      defaultSubjects: ["civics", "economics", "logic", "history", "sociology"],
    },
  ],
  admission: [
    {
      id: "engineering",
      label: "ইঞ্জিনিয়ারিং ভর্তি (Engineering)",
      subtitle: "বুয়েট, চুয়েট, কুয়েট, রুয়েট, বুটেক্স ও প্রযুক্তি",
      subjectsSummary: "উচ্চতর গণিত • পদার্থবিজ্ঞান • রসায়ন • আইসিটি",
      targetSlug: "engineering-admission",
      defaultSubjects: ["higher-math", "physics", "chemistry", "ict"],
    },
    {
      id: "medical",
      label: "মেডিকেল ও ডেন্টাল (Medical & Dental)",
      subtitle: "সরকারি মেডিকেল, ডেন্টাল, এএফএমসি ও নার্সিং",
      subjectsSummary: "জীববিজ্ঞান • রসায়ন • পদার্থবিজ্ঞান • সাধারণ জ্ঞান • ইংরেজি",
      targetSlug: "medical-admission",
      defaultSubjects: ["biology", "chemistry", "physics", "gk", "english"],
    },
    {
      id: "varsity",
      label: "বিশ্ববিদ্যালয় ভর্তি (Varsity Admission)",
      subtitle: "ঢাকা বিশ্ববিদ্যালয় (ঢাবি), রাবি, চবি, জাবি ও গুচ্ছ (GST)",
      subjectsSummary: "পদার্থ • রসায়ন • গণিত • জীববিজ্ঞান • বাংলা • ইংরেজি",
      targetSlug: "varsity-admission",
      defaultSubjects: ["physics", "chemistry", "higher-math", "biology", "bangla", "english"],
    },
  ],
  job: [
    {
      id: "bcs",
      label: "বিসিএস ও নন-ক্যাডার (BCS & Ministry)",
      subtitle: "বিসিএস প্রিলিমিনারি ও মন্ত্রণালয় নিয়োগ পরীক্ষা",
      subjectsSummary: "বাংলা • ইংরেজি • গণিত • সাধারণ জ্ঞান • বিজ্ঞান • কম্পিউটার",
      targetSlug: "job",
      defaultSubjects: ["bangla", "english", "math", "general-knowledge", "general-science", "ict"],
    },
    {
      id: "bank",
      label: "ব্যাংক নিয়োগ পরীক্ষা (Bank Jobs)",
      subtitle: "বাংলাদেশ ব্যাংক, সরকারি ও বেসরকারি ব্যাংক জবস",
      subjectsSummary: "English • Math & Analytical • General Knowledge • ICT",
      targetSlug: "job",
      defaultSubjects: ["english", "math", "general-knowledge", "ict"],
    },
    {
      id: "teacher",
      label: "শিক্ষক নিয়োগ ও নিবন্ধন (Primary & NTRCA)",
      subtitle: "সরকারি প্রাথমিক শিক্ষক নিয়োগ ও শিক্ষক নিবন্ধন (এনটিআরসিএ)",
      subjectsSummary: "বাংলা • ইংরেজি • গণিত • সাধারণ জ্ঞান",
      targetSlug: "job",
      defaultSubjects: ["bangla", "english", "math", "general-knowledge"],
    },
    {
      id: "all-job",
      label: "পূর্ণাঙ্গ জব ব্যাংক (All Job Recruitment)",
      subtitle: "সকল সরকারি, স্বায়ত্তশাসিত ও ব্যাংক চাকরির প্রশ্নব্যাংক",
      subjectsSummary: "বাংলা • ইংরেজি • গণিত • সাধারণ জ্ঞান • বিজ্ঞান • আইসিটি",
      targetSlug: "job",
      defaultSubjects: ["bangla", "english", "math", "general-knowledge", "general-science", "ict"],
    },
  ],
} as const;

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
