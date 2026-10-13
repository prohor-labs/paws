import * as cheerio from "cheerio";

const AJAX_URL = "https://studyclubd.com/qb-archive/includes/ajax.php";
const BASE_URL = "https://studyclubd.com/view-question1/";
const UNIV_CODE = "UNI_9OJVFD";
const UNIT_CODE = "UNI_6321c505";

async function probe() {
  const url = `${AJAX_URL}?ajax=1&step=year&family=University&university=${UNIV_CODE}&unit=${UNIT_CODE}`;
  const res = await fetch(url);
  const data = (await res.json()) as { html: string };
  const $ = cheerio.load(data.html || "");

  console.log("=== JNU A UNIT SUBJECT ACCORDIONS ===");

  const subjects: Array<{ code: string; name: string }> = [];

  $("#tab-content-subject > div").each((_, card) => {
    const header = $(card).find(".flex.justify-between.items-center").first();
    const title = header.find("span.font-bold, span.font-semibold").first().text().trim() || header.text().trim();
    
    const viewAllBtn = $(card).find("button[onclick*='subject='], a[onclick*='subject=']");
    const onclick = viewAllBtn.attr("onclick") || "";
    const m = onclick.match(/subject=([^&'"\)]+)/);
    const code = m ? m[1] : "";

    if (code) {
      subjects.push({ code, name: title });
    }
  });

  console.log(`Discovered ${subjects.length} subjects in JnU A Unit:`);
  for (const s of subjects) {
    const qUrl = `${BASE_URL}?university=${UNIV_CODE}&unit=${UNIT_CODE}&subject=${s.code}&spa_ajax=1&page=1`;
    try {
      const qRes = await fetch(qUrl);
      const qData = (await qRes.json()) as { total?: number };
      console.log(`- ${s.name} (${s.code}): ${qData.total ?? 0} Qs`);
    } catch (e) {
      console.error(`Error fetching ${s.name}:`, e);
    }
  }

  console.log("\n=== YEAR / BATCH TABS ===");
  const years: string[] = [];
  $("#tab-content-year button, #tab-content-year a, #tab-content-year div[onclick]").each((_, el) => {
    const oc = $(el).attr("onclick") || "";
    const m = oc.match(/year=(YEA_[a-zA-Z0-9]+)/);
    if (m && !years.includes(m[1])) {
      years.push(m[1]);
      const text = $(el).text().replace(/\s+/g, " ").trim();
      console.log(` - ${text} -> ${m[1]}`);
    }
  });
}

probe();
