import * as cheerio from "cheerio";

async function probeRUB() {
  const url = "https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=UNI_f20da169";
  const res = await fetch(url);
  const data = await res.json();
  const $ = cheerio.load(data.html || "");

  const subjects: { code: string; name: string }[] = [];

  $("button, a, div").each((_, el) => {
    const onclick = $(el).attr("onclick") || "";
    const match = onclick.match(/subject=([A-Za-z0-9_]+)/);
    if (match) {
      const code = match[1];
      const nameMatch = onclick.match(/openQbModal\([^,]+,\s*['"]([^'"]+)['"]\)/);
      const name = nameMatch ? nameMatch[1] : "";
      if (code && !subjects.some((s) => s.code === code)) {
        subjects.push({ code, name });
      }
    }
  });

  console.log(`=== Rajshahi University (RU) B Unit (UNI_f20da169) Probe ===\nFound ${subjects.length} subjects:\n`);

  let grandTotal = 0;
  for (const s of subjects) {
    try {
      let page = 1;
      let hasMore = true;
      let count = 0;
      let sampleMeta = "";
      while (hasMore) {
        const qUrl = `https://studyclubd.com/view-question1/?university=UNI_HSQQTE&subject=${s.code}&unit=UNI_f20da169&spa_ajax=1&page=${page}`;
        const qRes = await fetch(qUrl);
        const qData = await qRes.json();
        const q$ = cheerio.load(qData.html || "");
        const items = q$(".mcq-item").length;
        count += items;
        if (page === 1) {
          sampleMeta = q$(".mcq-item").first().find(".mcq-meta").text().trim();
        }
        hasMore = qData.has_more === true;
        page++;
      }
      console.log(`- ${s.name} (${s.code}): ${count} questions (pages: ${page - 1}) | Sample Meta: ${sampleMeta}`);
      grandTotal += count;
    } catch (e: any) {
      console.log(`- ${s.name} (${s.code}): Error -> ${e.message}`);
    }
  }

  console.log(`\nGrand Total RU B Unit Questions: ${grandTotal}`);
}

probeRUB();
