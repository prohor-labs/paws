import * as cheerio from 'cheerio';

async function checkOverlap() {
  const units = [
    { code: 'UNI_6321c505', name: 'Unit-A' },
    { code: 'UNI_f20da169', name: 'Unit-B' },
    { code: 'UNI_d8e1d188', name: 'Unit-C' },
    { code: 'UNI_79515993', name: 'Unit-D' },
    { code: 'UNI_7a52cb22', name: 'Unit-E' },
    { code: 'UNI_e1b8018b', name: 'Unit-F' },
    { code: 'UNI_89ea3a4d', name: 'Unit-G' },
    { code: 'UNI_23147d4a', name: 'Unit-H' },
    { code: 'UNI_d7add5b5', name: 'Unit-I' },
    { code: 'UNI_262659e7', name: 'Unit-K' },
  ];

  for (const u of units) {
    const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=${u.code}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');
    const years: string[] = [];
    $('[onclick*="openQbModal"]').each((_, el) => {
      const onclick = $(el).attr('onclick') || '';
      const match = onclick.match(/openQbModal\('([^']+)',\s*'([^']+)'\)/);
      if (match && match[1].includes('year=')) {
        years.push(match[2]);
      }
    });
    console.log(`${u.name} (${u.code}): Years -> ${[...new Set(years)].join(', ')}`);
  }
}

checkOverlap();
