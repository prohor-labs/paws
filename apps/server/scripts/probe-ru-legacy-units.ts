import * as cheerio from 'cheerio';

const OTHER_UNITS = [
  { name: 'Unit-D', code: 'UNI_79515993', count: 294 },
  { name: 'Unit-E', code: 'UNI_7a52cb22', count: 1579 },
  { name: 'Unit-F', code: 'UNI_e1b8018b', count: 1213 },
];

async function inspectLegacyUnits() {
  for (const u of OTHER_UNITS) {
    console.log(`\n================== ${u.name} (${u.code}) - ${u.count} Qs ==================`);
    const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=${u.code}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');

    console.log('--- SUBJECTS ---');
    $('[onclick*="toggleSubject"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      console.log(`  Subj: ${text}`);
    });

    console.log('--- YEARS ---');
    $('[onclick*="openQbModal"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const onclick = $(el).attr('onclick') || '';
      if (onclick.includes('year=')) {
        console.log(`  Year: ${text} | onclick: ${onclick}`);
      }
    });
  }
}

inspectLegacyUnits();
