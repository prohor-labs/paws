import * as cheerio from "cheerio";

async function probe() {
  const url = "https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_J32I8G&unit=UNI_d8e1d188";
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

  console.log(`Found ${subjects.length} subjects in DU C Unit:\n`);

  for (const s of subjects) {
    try {
      const qUrl = `https://studyclubd.com/view-question1/?university=UNI_J32I8G&subject=${s.code}&unit=UNI_d8e1d188&spa_ajax=1&page=1`;
      const qRes = await fetch(qUrl);
      const qData = await qRes.json();
      const q$ = cheerio.load(qData.html || "");
      const count = q$(".mcq-item").length;
      console.log(`- ${s.name} (${s.code}): total_pages=${qData.total_pages}, sample_p1_count=${count}`);
    } catch (e: any) {
      console.log(`- ${s.name} (${s.code}): Error -> ${e.message}`);
    }
  }
}

probe();
