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

export type CustomExamSubjectGroup = QBTargetGroupKey;

export interface CustomExamSubject {
  readonly id: string;
  readonly name: string;
  readonly iconKey?: string;
  readonly questionCount?: number;
  readonly group?: CustomExamSubjectGroup;
  readonly targetName?: string;
}

export const CUSTOM_EXAM_SUBJECT_TABS: readonly {
  readonly id: CustomExamSubjectGroup;
  readonly label: string;
}[] = Object.freeze(
  QB_TARGET_GROUPS.map((group) => ({ id: group, label: QB_TARGET_GROUP_LABELS[group] })),
);

export interface CustomExamSourceOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly group?: string;
}

export const SOURCE_TYPE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  board: "বোর্ড",
  university: "বিশ্ববিদ্যালয়",
  medical: "মেডিকেল",
  engineering: "ইঞ্জিনিয়ারিং",
  bcs: "বিসিএস",
  bank_job: "ব্যাংক জব",
  model_test: "মডেল টেস্ট",
  other: "অন্যান্য",
});

const ICON_KEYWORDS: readonly { readonly match: RegExp; readonly icon: string }[] = Object.freeze([
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
