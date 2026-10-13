import * as cheerio from 'cheerio';

async function checkMeta() {
  const subjects = [
    { code: 'SUB_7b7e4ccc', name: 'সাধারণ বিজ্ঞান' },
    { code: 'SUB_234bb4f7', name: 'অর্থনীতি দ্বিতীয় পত্র' },
    { code: 'SUB_560e5122', name: 'মানসিক দক্ষতা(IQ)' },
    { code: 'SUB_16342659', name: 'সাধারণ গণিত' },
  ];

  for (const s of subjects) {
    const url = `https://studyclubd.com/view-question1/?university=UNI_HSQQTE&unit=UNI_d8e1d188&subject=${s.code}&spa_ajax=1&page=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');
    console.log(`=== ${s.name} (${s.code}) ===`);
    $('.mcq-item').each((_, el) => {
      const qText = $(el).find('.mcq-question-text').text().trim().replace(/\s+/g, ' ');
      const meta = $(el).find('.mcq-meta').text().trim().replace(/\s+/g, ' ');
      console.log(`Q: ${qText.substring(0, 60)} | Meta: ${meta}`);
    });
  }
}

checkMeta();
