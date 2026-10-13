import * as cheerio from 'cheerio';

async function printTables() {
  const units = [
    { code: 'UNI_6321c505', name: 'RU A Unit' },
    { code: 'UNI_f20da169', name: 'RU B Unit' },
    { code: 'UNI_d8e1d188', name: 'RU C Unit' },
  ];

  for (const u of units) {
    const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=${u.code}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');
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
    console.log(`\n=== ${u.name} (${subjects.length} subjects, total listed: ${subjects.reduce((a, b) => a + b.qCount, 0)} Qs) ===`);
    console.table(subjects);
  }
}

printTables();
