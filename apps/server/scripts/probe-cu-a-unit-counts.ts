const BASE_URL = "https://studyclubd.com/view-question1/";
const UNIV_CODE = "UNI_5WRL0D";
const UNIT_CODE = "UNI_6321c505";

const SUBJECTS = [
  { code: "SUB_57c463da", name: "রসায়ন দ্বিতীয় পত্র" },
  { code: "SUB_22eb0d02", name: "ইংরেজি - গ্রামার ও ভোকাবুলারি" },
  { code: "SUB_7f8e22c1", name: "উচ্চতর গণিত প্রথম পত্র" },
  { code: "SUB_599bd423", name: "পদার্থবিজ্ঞান প্রথম পত্র" },
  { code: "SUB_2a8512fd", name: "পদার্থবিজ্ঞান দ্বিতীয় পত্র" },
  { code: "SUB_13b6cb76", name: "উচ্চতর গণিত দ্বিতীয় পত্র" },
  { code: "SUB_2a4adee4", name: "রসায়ন প্রথম পত্র" },
  { code: "SUB_3d982a22", name: "জীববিজ্ঞান প্রথম পত্র" },
  { code: "SUB_b7d3a5b7", name: "জীববিজ্ঞান দ্বিতীয় পত্র" },
  { code: "SUB_af941852", name: "বাংলা সাহিত্য" },
  { code: "SUB_8a1edb7b", name: "বাংলা ব্যাকরন" },
  { code: "SUB_395b46c5", name: "তথ্য ও যোগাযোগ প্রযুক্তি" },
  { code: "SUB_3e705c07", name: "অর্থনীতি প্রথম পত্র" },
  { code: "SUB_16342659", name: "সাধারণ গণিত" },
  { code: "SUB_7b7e4ccc", name: "সাধারণ বিজ্ঞান" },
  { code: "SUB_7a31a559", name: "সাধারন জ্ঞান - বাংলাদেশ" }
];

async function countQuestions() {
  console.log("=== CU A UNIT SUBJECT QUESTION TOTALS ===");
  let grandTotal = 0;
  for (const s of SUBJECTS) {
    const url = `${BASE_URL}?university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${s.code}&spa_ajax=1&page=1`;
    try {
      const res = await fetch(url);
      const data = (await res.json()) as { total?: number };
      const count = data.total ?? 0;
      grandTotal += count;
      console.log(`- ${s.name} (${s.code}): ${count} Qs`);
    } catch (e) {
      console.error(`Error fetching ${s.name}:`, e);
    }
  }
  console.log(`\nGrand Total across all subjects: ${grandTotal} Qs`);
}

countQuestions();
