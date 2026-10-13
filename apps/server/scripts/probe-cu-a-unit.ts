import * as cheerio from "cheerio";

const AJAX_URL = "https://studyclubd.com/qb-archive/includes/ajax.php";
const UNIV_CODE = "UNI_5WRL0D";
const UNIT_CODE = "UNI_6321c505";

async function probe() {
  const url = `${AJAX_URL}?ajax=1&step=year&family=University&university=${UNIV_CODE}&unit=${UNIT_CODE}`;
  const res = await fetch(url);
  const data = (await res.json()) as { html: string };
  const $ = cheerio.load(data.html || "");
  
  $("#tab-content-subject").find("*[onclick]").each((_, el) => {
    console.log($(el).attr("onclick"));
  });
}

probe();
