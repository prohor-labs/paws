import * as cheerio from 'cheerio';

async function probeRuUnits() {
  const resUnits = await fetch('https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=unit&family=University&university=UNI_HSQQTE', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const jsonUnits = await resUnits.json();
  const $u = cheerio.load(jsonUnits.html || '');
  console.log('--- ALL UNITS UNDER UNI_HSQQTE ---');
  $u('[onclick]').each((_, el) => {
    const text = $u(el).text().trim().replace(/\s+/g, ' ');
    const onclick = $u(el).attr('onclick') || '';
    console.log(`Unit: "${text}" | onclick: "${onclick}"`);
  });
}

probeRuUnits();
