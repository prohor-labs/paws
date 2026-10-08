export type QBTargetGroupKey = "academic" | "admission" | "job";

export const QB_TARGET_GROUPS: readonly QBTargetGroupKey[] = Object.freeze([
  "academic",
  "admission",
  "job",
]);

export const QB_TARGET_GROUP_LABELS: Readonly<Record<QBTargetGroupKey, string>> = Object.freeze({
  academic: "একাডেমিক",
  admission: "ভর্তি প্রস্তুতি",
  job: "চাকরি",
});

export interface CustomExamSubject {
  readonly id: string;
  readonly name: string;
  readonly iconKey?: string;
  readonly questionCount?: number;
  readonly group?: QBTargetGroupKey;
  readonly targetName?: string;
}

const ICON_KEYWORDS: readonly {
  readonly match: RegExp;
  readonly icon: string;
}[] = Object.freeze([
  { match: /পদার্থ|physics/i, icon: "Atom" },
  { match: /রসায়ন|chemistry|chem/i, icon: "Flask" },
  { match: /জীব|biology|bio/i, icon: "Dna" },
  { match: /গণিত|math/i, icon: "Calculator" },
  { match: /পরিসংখ্যান|statistic|stat/i, icon: "Chart" },
  { match: /বাংলা|bangla/i, icon: "BookOpen" },
  { match: /ইংরেজি|english/i, icon: "Language" },
  { match: /আইসিটি|তথ্য|যোগাযোগ|ict/i, icon: "Cpu" },
  { match: /কৃষি|agri/i, icon: "Leaf" },
  { match: /সাধারণ জ্ঞান|general|gk/i, icon: "Global" },
  { match: /ভর্তি|admission|মডেল|model/i, icon: "Briefcase" },
]);

export function deriveSubjectIconKey(name: string): string {
  const matched = ICON_KEYWORDS.find((entry) => entry.match.test(name));
  return matched?.icon ?? "Activity";
}
