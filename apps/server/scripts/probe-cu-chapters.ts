import * as cheerio from "cheerio";

const AJAX_URL = "https://studyclubd.com/qb-archive/includes/ajax.php";
const UNIV_CODE = "UNI_5WRL0D";
const UNIT_CODE = "UNI_6321c505";

const CORE_SUBJECTS = [
  { code: "SUB_599bd423", name: "পদার্থবিজ্ঞান প্রথম পত্র", slug: "পদার্থবিজ্ঞান-প্রথম-পত্র-sub_599bd423" },
  { code: "SUB_2a8512fd", name: "পদার্থবিজ্ঞান দ্বিতীয় পত্র", slug: "পদার্থবিজ্ঞান-দ্বিতীয়-পত্র-sub_2a8512fd" },
  { code: "SUB_2a4adee4", name: "রসায়ন প্রথম পত্র", slug: "রসায়ন-প্রথম-পত্র-sub_2a4adee4" },
  { code: "SUB_57c463da", name: "রসায়ন দ্বিতীয় পত্র", slug: "রসায়ন-দ্বিতীয়-পত্র-sub_57c463da" },
  { code: "SUB_7f8e22c1", name: "উচ্চতর গণিত প্রথম পত্র", slug: "উচ্চতর-গণিত-প্রথম-পত্র-sub_7f8e22c1" },
  { code: "SUB_13b6cb76", name: "উচ্চতর গণিত দ্বিতীয় পত্র", slug: "উচ্চতর-গণিত-দ্বিতীয়-পত্র-sub_13b6cb76" },
  { code: "SUB_3d982a22", name: "জীববিজ্ঞান প্রথম পত্র", slug: "জীববিজ্ঞান-প্রথম-পত্র-sub_3d982a22" },
  { code: "SUB_b7d3a5b7", name: "জীববিজ্ঞান দ্বিতীয় পত্র", slug: "জীববিজ্ঞান-দ্বিতীয়-পত্র-sub_b7d3a5b7" },
  { code: "SUB_22eb0d02", name: "ইংরেজি - গ্রামার ও ভোকাবুলারি", slug: "ইংরেজি-গ্রামার-ও-ভোকাবুলারি-sub_22eb0d02" },
  { code: "SUB_8a1edb7b", name: "বাংলা ব্যাকরন", slug: "বাংলা-ব্যাকরন-sub_8a1edb7b" },
  { code: "SUB_af941852", name: "বাংলা সাহিত্য", slug: "বাংলা-সাহিত্য-sub_af941852" },
  { code: "SUB_395b46c5", name: "তথ্য ও যোগাযোগ প্রযুক্তি", slug: "তথ্য-ও-যোগাযোগ-প্রযুক্তি-sub_395b46c5" }
];

async function probeChapters() {
  console.log("=== CU A UNIT CHAPTER & TOPIC DISCOVERY ===");
  let totalTopics = 0;
  for (const s of CORE_SUBJECTS) {
    const chapUrl = `${AJAX_URL}?ajax=1&step=chapters&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${s.code}`;
    const res = await fetch(chapUrl);
    const data = (await res.json()) as { html?: string };
    const $ = cheerio.load(data.html || "");

    const chapters: Array<{ code: string; name: string }> = [];
    $("a, div[onclick], button").each((_, el) => {
      const onclick = $(el).attr("onclick") || $(el).attr("href") || "";
      const m = onclick.match(/chapter=([^&'"\)]+)/);
      if (m && !chapters.some(c => c.code === m[1])) {
        const name = $(el).text().replace(/\s+/g, " ").trim();
        chapters.push({ code: m[1], name });
      }
    });

    console.log(`- ${s.name} (${s.code}): ${chapters.length} chapters`);
    for (const c of chapters) {
      const topUrl = `${AJAX_URL}?ajax=1&step=topics&university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${s.code}&chapter=${c.code}`;
      const topRes = await fetch(topUrl);
      const topData = (await topRes.json()) as { html?: string };
      const $top = cheerio.load(topData.html || "");
      let topicCount = 0;
      $top("a, div[onclick], button").each((_, el) => {
        const onclick = $top(el).attr("onclick") || $top(el).attr("href") || "";
        if (onclick.includes("topic=")) topicCount++;
      });
      totalTopics += topicCount;
    }
  }
  console.log(`\nTotal topic queues discovered across CU A Unit: ${totalTopics}`);
}

probeChapters();
