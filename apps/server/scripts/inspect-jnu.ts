const AJAX_URL = "https://studyclubd.com/qb-archive/includes/ajax.php";
const UNIV_CODE = "UNI_9OJVFD";

async function inspectRaw() {
  const res = await fetch(`${AJAX_URL}?ajax=1&step=unit&family=University&university=${UNIV_CODE}`);
  const data = (await res.json()) as { html?: string };
  console.log("HTML length:", (data.html || "").length);
  console.log("HTML snippet:", (data.html || "").slice(0, 2000));
}

inspectRaw();
