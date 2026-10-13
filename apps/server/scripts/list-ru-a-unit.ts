import * as cheerio from 'cheerio';

async function listOnlyAUnit() {
  const url = 'https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=UNI_6321c505';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const json = await res.json();
  const $ = cheerio.load(json.html || '');

  console.log('--- ALL SUBJECTS IN RU A UNIT (UNI_6321c505) ---');
  $('[onclick*="toggleSubject"]').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const onclick = $(el).attr('onclick') || '';
    console.log(`  Subj: "${text}" | onclick: "${onclick}"`);
  });
}

listOnlyAUnit();
