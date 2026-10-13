import * as cheerio from 'cheerio';

async function listAllSubjectsForUnit(code: string, unitName: string) {
  const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=${code}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const json = await res.json();
  const $ = cheerio.load(json.html || '');

  console.log(`\n================== ALL SUBJECTS IN ${unitName} (${code}) ==================`);
  const subjects: Array<{ name: string; code: string; qCount: number }> = [];
  $('[onclick*="toggleSubject"]').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const onclick = $(el).attr('onclick') || '';
    const match = onclick.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
    const countMatch = text.match(/(\d+)\s*Q/);
    if (match) {
      subjects.push({
        name: text.replace(/\s*\d+\s*Q.*$/, '').trim(),
        code: match[2],
        qCount: countMatch ? parseInt(countMatch[1]) : 0,
      });
    }
  });
  console.log(JSON.stringify(subjects, null, 2));
}

async function run() {
  await listAllSubjectsForUnit('UNI_6321c505', 'RU A Unit');
  await listAllSubjectsForUnit('UNI_f20da169', 'RU B Unit');
  await listAllSubjectsForUnit('UNI_d8e1d188', 'RU C Unit');
}

run();
