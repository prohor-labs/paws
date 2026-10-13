import * as cheerio from "cheerio";

async function probeTotalQuestions() {
  const subjects = [
    { code: "SUB_22eb0d02", name: "ইংরেজি গ্রামার ও ভোকাবুলারি" },
    { code: "SUB_8d4e39dd", name: "হিসাববিজ্ঞান প্রথম পত্র" },
    { code: "SUB_c8f404fb", name: "হিসাববিজ্ঞান দ্বিতীয় পত্র" },
    { code: "SUB_7d326978", name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা প্রথম পত্র" },
    { code: "SUB_b7bc3b04", name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা দ্বিতীয় পত্র" },
    { code: "SUB_3071aaff", name: "ফিন্যান্স, ব্যাংকিং ও বীমা প্রথম পত্র" },
    { code: "SUB_4b4fab51", name: "ফিন্যান্স, ব্যাংকিং ও বীমা দ্বিতীয় পত্র" },
    { code: "SUB_0dddb111", name: "উৎপাদন ব্যবস্থাপনা ও বিপণন প্রথম পত্র" },
    { code: "SUB_7ad38d05", name: "উৎপাদন ব্যবস্থাপনা ও বিপণন দ্বিতীয় পত্র" },
    { code: "SUB_8a1edb7b", name: "বাংলা ব্যাকরন" },
    { code: "SUB_af941852", name: "বাংলা সাহিত্য" },
    { code: "SUB_7a31a559", name: "সাধারন জ্ঞান - বাংলাদেশ" },
    { code: "SUB_19679478", name: "সাধারন জ্ঞান - আন্তর্জাতিক" },
    { code: "SUB_234bb4f7", name: "অর্থনীতি দ্বিতীয় পত্র" },
    { code: "SUB_bee93768", name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা" },
    { code: "SUB_3e705c07", name: "অর্থনীতি প্রথম পত্র" },
    { code: "SUB_3d982a22", name: "জীববিজ্ঞান প্রথম পত্র" },
    { code: "SUB_599bd423", name: "পদার্থবিজ্ঞান প্রথম পত্র" },
    { code: "SUB_13b6cb76", name: "উচ্চতর গণিত দ্বিতীয় পত্র" },
    { code: "SUB_78c19eab", name: "ইসলামের ইতিহাস ও সংস্কৃতি প্রথম পত্র" },
    { code: "SUB_57c463da", name: "রসায়ন দ্বিতীয় পত্র" },
    { code: "SUB_16342659", name: "সাধারণ গণিত" }
  ];

  console.log("=== DU C Unit Exact Question Totals ===\n");
  let grandTotal = 0;

  for (const s of subjects) {
    let page = 1;
    let hasMore = true;
    let count = 0;
    while (hasMore) {
      const qUrl = `https://studyclubd.com/view-question1/?university=UNI_J32I8G&subject=${s.code}&unit=UNI_d8e1d188&spa_ajax=1&page=${page}`;
      const res = await fetch(qUrl);
      const data = await res.json();
      const $ = cheerio.load(data.html || "");
      const items = $(".mcq-item").length;
      count += items;
      hasMore = data.has_more === true;
      page++;
    }
    console.log(`- ${s.name} (${s.code}): ${count} questions (pages: ${page - 1})`);
    grandTotal += count;
  }

  console.log(`\nGrand Total DU C Unit Questions: ${grandTotal}`);
}

probeTotalQuestions();
