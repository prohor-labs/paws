import * as cheerio from 'cheerio';

const subjects = [
  { code: 'SUB_7f8e22c1', name: 'উচ্চতর গণিত প্রথম পত্র', expected: 731 },
  { code: 'SUB_57c463da', name: 'রসায়ন দ্বিতীয় পত্র', expected: 526 },
  { code: 'SUB_13b6cb76', name: 'উচ্চতর গণিত দ্বিতীয় পত্র', expected: 506 },
  { code: 'SUB_3d982a22', name: 'জীববিজ্ঞান প্রথম পত্র', expected: 495 },
  { code: 'SUB_b7d3a5b7', name: 'জীববিজ্ঞান দ্বিতীয় পত্র', expected: 465 },
  { code: 'SUB_2a8512fd', name: 'পদার্থবিজ্ঞান দ্বিতীয় পত্র', expected: 417 },
  { code: 'SUB_599bd423', name: 'পদার্থবিজ্ঞান প্রথম পত্র', expected: 409 },
  { code: 'SUB_2a4adee4', name: 'রসায়ন প্রথম পত্র', expected: 334 },
  { code: 'SUB_395b46c5', name: 'তথ্য ও যোগাযোগ প্রযুক্তি', expected: 86 },
  { code: 'SUB_22eb0d02', name: 'ইংরেজি - গ্রামার ও ভোকাবুলারি', expected: 37 },
  { code: 'SUB_7a31a559', name: 'সাধারন জ্ঞান - বাংলাদেশ', expected: 31 },
  { code: 'SUB_7b7e4ccc', name: 'সাধারণ বিজ্ঞান', expected: 20 },
  { code: 'SUB_af941852', name: 'বাংলা সাহিত্য', expected: 18 },
  { code: 'SUB_19679478', name: 'সাধারন জ্ঞান - আন্তর্জাতিক', expected: 17 },
  { code: 'SUB_8a1edb7b', name: 'বাংলা ব্যাকরন', expected: 7 },
  { code: 'SUB_234bb4f7', name: 'অর্থনীতি দ্বিতীয় পত্র', expected: 4 },
  { code: 'SUB_560e5122', name: 'মানসিক দক্ষতা(IQ)', expected: 4 },
  { code: 'SUB_16342659', name: 'সাধারণ গণিত', expected: 2 },
];

async function checkChapters() {
  for (const s of subjects) {
    const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=chapters&university=UNI_HSQQTE&unit=UNI_d8e1d188&subject=${s.code}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');
    const chapCount = $('[onclick*="toggleChapter"]').length;
    console.log(`${s.name} (${s.code}): ${chapCount} chapters, expected ~ ${s.expected} Qs`);
  }
}

checkChapters();
