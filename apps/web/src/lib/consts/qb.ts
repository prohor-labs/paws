import type { QBTargetGroup } from "@/types";

export function subjectLevelLabel(group?: QBTargetGroup | null): string {
  if (group === "academic") return "বিষয়";
  if (group === "job") return "বিভাগ/পরীক্ষা";
  return "বিশ্ববিদ্যালয়";
}

export function chapterLevelLabel(group?: QBTargetGroup | null): string {
  if (group === "academic") return "অধ্যায়";
  if (group === "job") return "পদ/শাখা";
  return "ইউনিট";
}
