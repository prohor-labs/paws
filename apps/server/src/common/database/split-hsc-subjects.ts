import postgres from 'postgres';
import { v7 as uuidv7 } from 'uuid';

const sql = postgres('postgres://paws:df8f13a4@127.0.0.1:5432/paws');

async function main() {
  console.log('--- Starting HSC 1st & 2nd Paper Refactoring ---');

  const [hscTarget] = await sql`SELECT * FROM qb_targets WHERE slug = 'hsc-academic'`;
  if (!hscTarget) {
    console.error('HSC target not found');
    process.exit(1);
  }

  // Define the subjects mapping
  const subjectConfigs = [
    {
      baseSlug: 'physics',
      p1: { name: 'পদার্থবিজ্ঞান ১ম পত্র', slug: 'hsc-physics-1st-paper', code: 'HSC-PHY-1' },
      p2: { name: 'পদার্থবিজ্ঞান ২য় পত্র', slug: 'hsc-physics-2nd-paper', code: 'HSC-PHY-2' },
      p1Keywords: ['ভৌত', 'ভেক্টর', 'গতিবিদ্যা', 'বলবিদ্যা', 'কাজ, শক্তি', 'মহাকর্ষ', 'গাঠনিক', 'পর্যাবৃত্ত', 'পর্যায়বৃত্তিক', 'তরঙ্গ', 'আদর্শ গ্যাস'],
      p2Keywords: ['তাপগতিবিদ্যা', 'স্থির তড়িৎ', 'স্থির তড়িৎ', 'চল তড়িৎ', 'চল তড়িৎ', 'চৌম্বক', 'তাড়িৎচৌম্বক', 'জ্যামিতিক আলোকবিজ্ঞান', 'ভৌত আলোকবিজ্ঞান', 'আধুনিক পদার্থবিজ্ঞান', 'পরমাণুর মডেল', 'সেমিকন্ডাক্টর'],
    },
    {
      baseSlug: 'chemistry',
      p1: { name: 'রসায়ন ১ম পত্র', slug: 'hsc-chemistry-1st-paper', code: 'HSC-CHEM-1' },
      p2: { name: 'রসায়ন ২য় পত্র', slug: 'hsc-chemistry-2nd-paper', code: 'HSC-CHEM-2' },
      p1Keywords: ['ল্যাবরেটরি', 'গুণগত', 'মৌলের পর্যায়বৃত্ত', 'পর্যায়বৃত্ত', 'রাসায়নিক পরিবর্তন', 'রাসায়নিক পরিবর্তন', 'কর্মমুখী', 'কর্মমূখী'],
      p2Keywords: ['পরিবেশ', 'জৈব', 'পরিমাণগত', 'তড়িৎ', 'তড়িৎ', 'অর্থনৈতিক'],
    },
    {
      baseSlug: 'higher-math',
      p1: { name: 'উচ্চতর গণিত ১ম পত্র', slug: 'hsc-higher-math-1st-paper', code: 'HSC-HMATH-1' },
      p2: { name: 'উচ্চতর গণিত ২য় পত্র', slug: 'hsc-higher-math-2nd-paper', code: 'HSC-HMATH-2' },
      p1Keywords: ['ম্যাট্রিক্স', 'ভেক্টর', 'সরলরেখা', 'বৃত্ত', 'ত্রিকোণমিতিক অনুপাত', 'ক্রিকোণমিতিক', 'বিন্যাস', 'ফাংশন', 'অন্তরীকরণ', 'যোগজীকরণ'],
      p2Keywords: ['বাস্তব', 'দ্বিপদী', 'জটিল', 'বহুপদী', 'কণিক', 'কনিক', 'বিপরীত ত্রিকোণমিতিক', 'স্থিতিবিদ্যা', 'সমতলে বস্তুকণার গতি', 'বিস্তার পরিমাপ', 'সম্ভাবনা'],
    },
    {
      baseSlug: 'biology',
      p1: { name: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)', slug: 'hsc-biology-1st-paper', code: 'HSC-BIO-1' },
      p2: { name: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)', slug: 'hsc-biology-2nd-paper', code: 'HSC-BIO-2' },
      p1Keywords: ['কোষ ও এর গঠন', 'কোষ বিভাজন', 'কোষ রসায়ন', 'অণুজীব', 'শৈবাল ও ছত্রাক', 'ব্রায়োফাইটা', 'নগ্নবীজী', 'টিস্যু', 'উদ্ভিদ শারীরতত্ত্ব', 'উদ্ভিদ প্রজনন', 'জীবপ্রযুক্তি', 'জীববিজ্ঞান প্রথম পত্র'],
      p2Keywords: ['প্রাণীর বিভিন্নতা', 'প্রাণীর পরিচিতি', 'পরিপাক', 'রক্ত', 'শ্বাসক্রিয়া', 'বর্জ্য', 'চলন', 'সমন্বয়', 'মানবদেহের প্রতিরক্ষা', 'জিনতত্ত্ব', 'জীনতত্ত্ব'],
    },
    {
      baseSlug: 'bangla',
      p1: { name: 'বাংলা ১ম পত্র (সাহিত্যপাঠ ও সহপাঠ)', slug: 'hsc-bangla-1st-paper', code: 'HSC-BAN-1' },
      p2: { name: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', slug: 'hsc-bangla-2nd-paper', code: 'HSC-BAN-2' },
      p1Keywords: ['অপরিচিতা', 'বিলাসী', 'আমার পথ', 'বায়ান্নর দিনগুলো', 'রেইনকোট', 'সোনার তরী', 'বিদ্রোহী', 'প্রতিদান', 'প্ৰতিদান', 'সুচেতনা', 'তাহারেই পড়ে মনে', 'পদ্মা', 'ফেব্রুয়ারি ১৯৬৯', 'আঠারো বছর বয়স', 'নূরলদীনের', 'সিরাজউদ্দৌলা', 'লালসালু', 'সাহিত্যপাঠ', 'গদ্য', 'পদ্য', 'সহপাঠ', 'আমি কিংবদন্তির'],
      p2Keywords: ['ব্যাকরণ', 'নির্মিতি', 'সমাস', 'উচ্চারণ', 'বানান', 'শব্দ', 'বাক্য'],
    },
    {
      baseSlug: 'accounting-hsc',
      p1: { name: 'হিসাববিজ্ঞান ১ম পত্র', slug: 'hsc-accounting-1st-paper', code: 'HSC-ACC-1' },
      p2: { name: 'হিসাববিজ্ঞান ২য় পত্র', slug: 'hsc-accounting-2nd-paper', code: 'HSC-ACC-2' },
      p1Keywords: ['হিসাববিজ্ঞান পরিচিতি', 'হিসাবের বই', 'ব্যাংক সমন্বয়', 'রেওয়ামিল', 'দৃশ্যমান ও অদৃশ্যমান', 'কার্যপত্র', 'আর্থিক বিবরণী', 'হিসাবের ভুল'],
      p2Keywords: ['অব্যবসায়ী', 'অংশীদারি', 'যৌথমূলধনী', 'কোম্পানির আর্থিক বিবরণী', 'আর্থিক বিবরণী বিশ্লেষণ', 'মজুদপণ্যের', 'উৎপাদন ব্যয়', 'ব্যয় ও ব্যয়ের শ্রেণিবিভাগ'],
    },
    {
      baseSlug: 'hsc-academic-business-management',
      p1: { name: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র', slug: 'hsc-business-management-1st-paper', code: 'HSC-BOM-1' },
      p2: { name: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র', slug: 'hsc-business-management-2nd-paper', code: 'HSC-BOM-2' },
      p1Keywords: ['ব্যবসায়ের মৌলিক ধারণা', 'একমালিকানা', 'অংশীদারি', 'যৌথমূলধনী', 'সমবায়', 'রাষ্ট্রীয়', 'ব্যবসায়ের আইনগত দিক', 'ব্যবসায়িক নৈতিকতা', 'তথ্য ও যোগাযোগ প্রযুক্তির ব্যবহার'],
      p2Keywords: ['ব্যবস্থাপনার ধারণা', 'ব্যবস্থাপনার নীতি', 'পরিকল্পনা', 'সংগঠিতকরণ', 'কর্মীসংস্থান', 'নেতৃত্ব', 'প্রেষণা', 'যোগাযোগ', 'সমন্বয়সাধন', 'নিয়ন্ত্রণ'],
    },
    {
      baseSlug: 'hsc-academic-finance-banking-insurance',
      p1: { name: 'ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র', slug: 'hsc-finance-banking-1st-paper', code: 'HSC-FBI-1' },
      p2: { name: 'ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র', slug: 'hsc-finance-banking-2nd-paper', code: 'HSC-FBI-2' },
      p1Keywords: ['অর্থায়নের সূচনা', 'আর্থিক বাজারের আইনগত দিক', 'অর্থের সময়মূল্য', 'আর্থিক বিশ্লেষণ', 'স্বল্প ও মধ্যমেয়াদি অর্থায়ন', 'দীর্ঘমেয়াদি অর্থায়ন', 'মূলধন ব্যয়', 'মূলধন বাজেটিং', 'ঝুঁকি ও মুনাফার হার'],
      p2Keywords: ['ব্যাংক ব্যবস্থার প্রাথমিক ধারণা', 'কেন্দ্রীয় ব্যাংক', 'বাণিজ্যিক ব্যাংক', 'বিশেষায়িত ব্যাংক', 'হিসাব', 'চেক', 'বিল ও পে-অর্ডার', 'বৈদেশিক বিনিময়', 'বিমা', 'জীবন বিমা', 'নৌ বিমা', 'অগ্নি বিমা'],
    },
    {
      baseSlug: 'production-management-marketing-hsc',
      p1: { name: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র', slug: 'hsc-production-management-1st-paper', code: 'HSC-PMM-1' },
      p2: { name: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র', slug: 'hsc-production-management-2nd-paper', code: 'HSC-PMM-2' },
      p1Keywords: ['উৎপাদন', 'উৎপাদনের উপকরণ', 'উৎপাদন মাত্রা', 'উৎপাদন পরিকল্পনা', 'উৎপাদনশীলতা', 'পণ্য ডিজাইন', 'মান ব্যবস্থাপনা', 'কারখানা অবস্থান'],
      p2Keywords: ['বিপণন পরিচিতি', 'বিপণন পরিবেশ', 'বিপণন কার্যাবলি', 'বাজার বিভক্তিকরণ', 'পণ্য ও সেবা', 'মূল্য নির্ধারণ', 'বণ্টন প্রণালি', 'প্রচার ও প্রসার'],
    },
    {
      baseSlug: 'economics',
      p1: { name: 'অর্থনীতি ১ম পত্র', slug: 'hsc-economics-1st-paper', code: 'HSC-ECO-1' },
      p2: { name: 'অর্থনীতি ২য় পত্র', slug: 'hsc-economics-2nd-paper', code: 'HSC-ECO-2' },
      p1Keywords: ['মৌলিক অর্থনৈতিক সমস্যা', 'ভোক্তা ও উৎপাদকের আচরণ', 'উৎপাদন, উৎপাদন ব্যয় ও আয়', 'বাজার', 'জাতীয় আয়', 'অর্থ ও ব্যাংক', 'মুদ্রাস্ফীতি', 'সামগ্রিক আয় ও ব্যয়', 'সরকারি অর্থব্যবস্থা'],
      p2Keywords: ['বাংলাদেশের অর্থনীতি', 'বাংলাদেশের কৃষি', 'বাংলাদেশের শিল্প', 'জনসংখ্যা, মানব সম্পদ', 'খাদ্য নিরাপত্তা', 'আন্তর্জাতিক বাণিজ্য', 'দারিদ্র্য ও অসমতা', 'উন্নয়ন পরিকল্পনা'],
    },
    {
      baseSlug: 'civics-governance',
      p1: { name: 'পৌরনীতি ও সুশাসন ১ম পত্র', slug: 'hsc-civics-governance-1st-paper', code: 'HSC-CGG-1' },
      p2: { name: 'পৌরনীতি ও সুশাসন ২য় পত্র', slug: 'hsc-civics-governance-2nd-paper', code: 'HSC-CGG-2' },
      p1Keywords: ['পৌরনীতি ও সুশাসন পরিচিতি', 'সুশাসন', 'মূল্যবোধ, আইন, স্বাধীনতা ও সাম্য', 'ই-গভর্নেন্স', 'নাগরিক অধিকার', 'রাজনৈতিক দল', 'সরকার কাঠামো', 'জনমত'],
      p2Keywords: ['ব্রিটিশ ভারতে প্রতিনিধিত্বশীল', 'পাকিস্তান থেকে বাংলাদেশ', 'বাংলাদেশের স্বাধীনতা', 'বাংলাদেশের সংবিধান', 'বাংলাদেশের সরকার', 'সাংবিধানিক প্রতিষ্ঠান', 'নাগরিক সমস্যা'],
    },
    {
      baseSlug: 'logic',
      p1: { name: 'যুক্তিবিদ্যা ১ম পত্র', slug: 'hsc-logic-1st-paper', code: 'HSC-LOG-1' },
      p2: { name: 'যুক্তিবিদ্যা ২য় পত্র', slug: 'hsc-logic-2nd-paper', code: 'HSC-LOG-2' },
      p1Keywords: ['যুক্তিবিদ্যা পরিচিতি', 'যুক্তির উপাদান', 'পদের ব্যাপ্তি', 'যুক্তিবাক্য', 'অনুমান', 'সহানুমান'],
      p2Keywords: ['যৌক্তিক সংজ্ঞা', 'যৌক্তিক বিভাগ', 'আরোহের প্রকৃতি', 'আরোহের ভিত্তি', 'কার্যকারণ সম্পর্ক', 'প্রকল্প'],
    },
    {
      baseSlug: 'sociology',
      p1: { name: 'সমাজবিজ্ঞান ১ম পত্র', slug: 'hsc-sociology-1st-paper', code: 'HSC-SOC-1' },
      p2: { name: 'সমাজবিজ্ঞান ২য় পত্র', slug: 'hsc-sociology-2nd-paper', code: 'HSC-SOC-2' },
      p1Keywords: ['সমাজবিজ্ঞানের উৎপত্তি', 'সমাজবিজ্ঞানের বৈজ্ঞানিক মর্যাদা', 'সমাজবিজ্ঞানের মৌল প্রত্যয়', 'সমাজবিজ্ঞানীদের অবদান', 'সামাজিক প্রতিষ্ঠান', 'সামাজিকীকরণ', 'সামাজিক স্তরবিন্যাস'],
      p2Keywords: ['বাংলাদেশের সমাজবিজ্ঞান চর্চার বিকাশ', 'বাংলাদেশের সমাজের ঐতিহাসিক প্রেক্ষাপট', 'বাংলাদেশের প্রত্নতাত্ত্বিক নিদর্শন', 'বাংলাদেশের নৃগোষ্ঠী', 'বাংলাদেশের গ্রামীণ ও নগর সমাজ', 'বাংলাদেশের সামাজিক সমস্যা'],
    },
    {
      baseSlug: 'social-work',
      p1: { name: 'সমাজকর্ম ১ম পত্র', slug: 'hsc-social-work-1st-paper', code: 'HSC-SW-1' },
      p2: { name: 'সমাজকর্ম ২য় পত্র', slug: 'hsc-social-work-2nd-paper', code: 'HSC-SW-2' },
      p1Keywords: ['সমাজকর্ম: প্রকৃতি ও পরিধি', 'সমাজকর্ম পেশার ঐতিহাসিক প্রেক্ষাপট', 'সমাজকর্মের মূল্যবোধ ও নীতিমালা', 'সমাজকর্ম সম্পর্কিত প্রত্যয়', 'সমাজকর্মের পদ্ধতি'],
      p2Keywords: ['বাংলাদেশে মৌলিক মানবিক চাহিদা', 'সমাজকর্মের বিভিন্ন শাখা', 'সামাজিক সমস্যা সমাধানে সমাজকর্ম', 'সামাজিক প্রতিষ্ঠান ও সেবা', 'বাংলাদেশের সামাজিক নীতি'],
    },
    {
      baseSlug: 'geography',
      p1: { name: 'ভূগোল ১ম পত্র', slug: 'hsc-geography-1st-paper', code: 'HSC-GEO-1' },
      p2: { name: 'ভূগোল ২য় পত্র', slug: 'hsc-geography-2nd-paper', code: 'HSC-GEO-2' },
      p1Keywords: ['ভূগোল ও পরিবেশ', 'পৃথিবীর গঠন', 'ভূমিরূপ পরিবর্তন', 'বায়ুমণ্ডল', 'জলবায়ুর উপাদান', 'বারিমণ্ডল', 'জীবমণ্ডল'],
      p2Keywords: ['মানব ভূগোল', 'জনসংখ্যা', 'বসতি', 'কৃষি', 'খনিজ ও শক্তি সম্পদ', 'শিল্প', 'পরিবহন ও যোগাযোগ', 'আন্তর্জাতিক বাণিজ্য'],
    },
    {
      baseSlug: 'itihas',
      p1: { name: 'ইতিহাস ১ম পত্র', slug: 'hsc-history-1st-paper', code: 'HSC-HIST-1' },
      p2: { name: 'ইতিহাস ২য় পত্র', slug: 'hsc-history-2nd-paper', code: 'HSC-HIST-2' },
      p1Keywords: ['ভারতে ইউরোপীয়দের আগমন', 'ইংরেজ ঔপনিবেশিক শাসন', 'জাতীয়তাবাদী আন্দোলন', 'পাকিস্তান আন্দোলন'],
      p2Keywords: ['শিল্প বিপ্লব', 'ফরাসি বিপ্লব', 'প্রথম বিশ্বযুদ্ধ', 'রুশ বিপ্লব', 'দ্বিতীয় বিশ্বযুদ্ধ', 'জাতিসংঘ', 'স্নায়ুযুদ্ধ'],
    },
    {
      baseSlug: 'islamer-itihas-o-sngskriti',
      p1: { name: 'ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র', slug: 'hsc-islamic-history-1st-paper', code: 'HSC-IHC-1' },
      p2: { name: 'ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র', slug: 'hsc-islamic-history-2nd-paper', code: 'HSC-IHC-2' },
      p1Keywords: ['প্রাক-ইসলামি আরব', 'হযরত মুহাম্মদ (সা.)', 'খোলাফায়ে রাশেদিন', 'উমাইয়া খিলাফত', 'আব্বাসীয় খিলাফত', 'স্পেনে ইসলাম'],
      p2Keywords: ['ভারতে মুসলিম শাসন', 'দিল্লি সালতানাত', 'মুঘল শাসন', 'বাংলায় মুসলিম শাসন', 'স্বাধীন সুলতানি আমল', 'নবাবী আমল'],
    },
    {
      baseSlug: 'islamic-studies-hsc',
      p1: { name: 'ইসলাম শিক্ষা ১ম পত্র', slug: 'hsc-islamic-studies-1st-paper', code: 'HSC-ISL-1' },
      p2: { name: 'ইসলাম শিক্ষা ২য় পত্র', slug: 'hsc-islamic-studies-2nd-paper', code: 'HSC-ISL-2' },
      p1Keywords: ['ইসলাম শিক্ষা ও সংস্কৃতি', 'ইসলামি জীবনব্যবস্থা', 'ইসলামি অর্থনীতি', 'ইসলামি সমাজব্যবস্থা'],
      p2Keywords: ['আল কুরআন', 'আল হাদিস', 'ইসলামি আইন ও ফিকহ', 'মুসলিম মনিষীদের অবদান'],
    },
    {
      baseSlug: 'statistics',
      p1: { name: 'পরিসংখ্যান ১ম পত্র', slug: 'hsc-statistics-1st-paper', code: 'HSC-STAT-1' },
      p2: { name: 'পরিসংখ্যান ২য় পত্র', slug: 'hsc-statistics-2nd-paper', code: 'HSC-STAT-2' },
      p1Keywords: ['পরিসংখ্যান পরিচিতি', 'তথ্য সংগ্রহ ও উপস্থাপন', 'কেন্দ্রীয় প্রবণতার পরিমাপ', 'বিস্তার পরিমাপ', 'পরিঘাত, বঙ্কিমতা ও সূঁচালতা', 'সহসংশ্লেষ ও নির্ভরণ'],
      p2Keywords: ['সম্ভাবনা', 'দৈব চলক ও সম্ভাবনা বিন্যাস', 'দ্বিপদী বিন্যাস', 'পয়সন বিন্যাস', 'পরিমিত বিন্যাস', 'নমুনায়ন', 'অনুকল্প যাচাই'],
    },
    {
      baseSlug: 'hsc-academic-agriculture',
      p1: { name: 'কৃষিশিক্ষা ১ম পত্র', slug: 'hsc-agriculture-1st-paper', code: 'HSC-AGR-1' },
      p2: { name: 'কৃষিশিক্ষা ২য় পত্র', slug: 'hsc-agriculture-2nd-paper', code: 'HSC-AGR-2' },
      p1Keywords: ['বাংলাদেশের কৃষি', 'ভূমি প্রস্তুতি ও ফসল উৎপাদন', 'বিশেষায়িত কৃষি', 'কৃষি অর্থনীতি'],
      p2Keywords: ['মৎস্য চাষ', 'পোল্ট্রি পালন', 'গবাদিপশু পালন', 'রেশম, মৌমাছি ও মাশরুম চাষ', 'কৃষি বনায়ন'],
    },
    {
      baseSlug: 'home-science-hsc',
      p1: { name: 'গার্হস্থ্য বিজ্ঞান ১ম পত্র', slug: 'hsc-home-science-1st-paper', code: 'HSC-HSC-1' },
      p2: { name: 'গার্হস্থ্য বিজ্ঞান ২য় পত্র', slug: 'hsc-home-science-2nd-paper', code: 'HSC-HSC-2' },
      p1Keywords: ['গৃহ ব্যবস্থাপনা', 'পারিবারিক সম্পদ', 'আবাসন ও গৃহায়ন', 'শিশু বিকাশ', 'পারিবারিক সম্পর্ক'],
      p2Keywords: ['খাদ্য ও পুষ্টি', 'খাদ্য উপাদান', 'খাদ্য প্রস্তুতকরণ ও সংরক্ষণ', 'বস্ত্র ও পোশাক', 'পোশাকের যত্ন'],
    },
    {
      baseSlug: 'psychology',
      p1: { name: 'মনোবিজ্ঞান ১ম পত্র', slug: 'hsc-psychology-1st-paper', code: 'HSC-PSY-1' },
      p2: { name: 'মনোবিজ্ঞান ২য় পত্র', slug: 'hsc-psychology-2nd-paper', code: 'HSC-PSY-2' },
      p1Keywords: ['মনোবিজ্ঞান পরিচিতি', 'আচরণের জৈবিক ভিত্তি', 'সংবেদন ও প্রত্যক্ষণ', 'শিক্ষণ ও স্মৃতি', 'প্রেষণা ও আবেগ'],
      p2Keywords: ['বুদ্ধি', 'ব্যক্তিত্ব', 'মনোসামাজিক সমস্যা', 'মানসিক স্বাস্থ্য ও সমন্বয়', 'পরিসংখ্যান ও গবেষণা পদ্ধতি'],
    },
  ];

  let currentOrder = 1;

  for (const cfg of subjectConfigs) {
    const [baseSub] = await sql`SELECT * FROM qb_subjects WHERE target_id = ${hscTarget.id} AND slug = ${cfg.baseSlug}`;
    if (!baseSub) continue;

    console.log(`Processing ${baseSub.name} (${baseSub.slug})...`);

    // Ensure Paper 1 Subject exists
    let [sub1] = await sql`SELECT * FROM qb_subjects WHERE slug = ${cfg.p1.slug}`;
    if (!sub1) {
      const newId = uuidv7();
      await sql`
        INSERT INTO qb_subjects (id, target_id, name, slug, code, order_index, chapter_count, question_count)
        VALUES (${newId}, ${hscTarget.id}, ${cfg.p1.name}, ${cfg.p1.slug}, ${cfg.p1.code}, ${currentOrder++}, 0, 0);
      `;
      [sub1] = await sql`SELECT * FROM qb_subjects WHERE id = ${newId}`;
    } else {
      await sql`UPDATE qb_subjects SET target_id = ${hscTarget.id}, name = ${cfg.p1.name}, code = ${cfg.p1.code}, order_index = ${currentOrder++} WHERE id = ${sub1.id}`;
    }

    // Ensure Paper 2 Subject exists
    let [sub2] = await sql`SELECT * FROM qb_subjects WHERE slug = ${cfg.p2.slug}`;
    if (!sub2) {
      const newId = uuidv7();
      await sql`
        INSERT INTO qb_subjects (id, target_id, name, slug, code, order_index, chapter_count, question_count)
        VALUES (${newId}, ${hscTarget.id}, ${cfg.p2.name}, ${cfg.p2.slug}, ${cfg.p2.code}, ${currentOrder++}, 0, 0);
      `;
      [sub2] = await sql`SELECT * FROM qb_subjects WHERE id = ${newId}`;
    } else {
      await sql`UPDATE qb_subjects SET target_id = ${hscTarget.id}, name = ${cfg.p2.name}, code = ${cfg.p2.code}, order_index = ${currentOrder++} WHERE id = ${sub2.id}`;
    }

    // Get all chapters from the base subject and reassign them
    const chapters = await sql`SELECT * FROM qb_chapters WHERE subject_id = ${baseSub.id}`;

    for (const ch of chapters) {
      let isP2 = cfg.p2Keywords.some((kw) => ch.name.includes(kw));
      let isP1 = cfg.p1Keywords.some((kw) => ch.name.includes(kw));

      const targetSubjectId = isP2 && !isP1 ? sub2.id : sub1.id;

      await sql`UPDATE qb_chapters SET subject_id = ${targetSubjectId} WHERE id = ${ch.id}`;
    }

    // If the base subject is different from sub1 and sub2, remove the empty base subject
    if (baseSub.id !== sub1.id && baseSub.id !== sub2.id) {
      const remainingChs = await sql`SELECT count(*) FROM qb_chapters WHERE subject_id = ${baseSub.id}`;
      if (Number(remainingChs[0].count) === 0) {
        await sql`DELETE FROM qb_subjects WHERE id = ${baseSub.id}`;
      }
    }
  }

  // Also handle single-paper subjects like ICT, English, etc.
  const ict = (await sql`SELECT * FROM qb_subjects WHERE target_id = ${hscTarget.id} AND slug = 'ict'`)[0];
  if (ict) {
    await sql`UPDATE qb_subjects SET name = 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', slug = 'hsc-ict', code = 'HSC-ICT', order_index = ${currentOrder++} WHERE id = ${ict.id}`;
  }

  const english = (await sql`SELECT * FROM qb_subjects WHERE target_id = ${hscTarget.id} AND slug = 'english-hsc'`)[0];
  if (english) {
    await sql`UPDATE qb_subjects SET name = 'English 1st Paper', slug = 'hsc-english-1st-paper', code = 'HSC-ENG-1', order_index = ${currentOrder++} WHERE id = ${english.id}`;
  }

  const englishEft = (await sql`SELECT * FROM qb_subjects WHERE target_id = ${hscTarget.id} AND slug = 'english-for-today-hsc'`)[0];
  if (englishEft) {
    await sql`UPDATE qb_subjects SET name = 'English 2nd Paper', slug = 'hsc-english-2nd-paper', code = 'HSC-ENG-2', order_index = ${currentOrder++} WHERE id = ${englishEft.id}`;
  }

  // Recalculate all counts
  console.log('Recalculating all question counts...');
  await sql`
    UPDATE public.qb_subjects s
    SET
      question_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_questions q
        INNER JOIN public.qb_topics t ON t.id = q.topic_id
        INNER JOIN public.qb_chapters c ON c.id = t.chapter_id
        WHERE c.subject_id = s.id AND q.status = 'published'
      ), 0),
      chapter_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_chapters c
        WHERE c.subject_id = s.id
      ), 0);
  `;

  await sql`
    UPDATE public.qb_targets t
    SET
      question_count = COALESCE((
        SELECT COUNT(DISTINCT q.id)
        FROM public.qb_questions q
        JOIN public.qb_topics top ON top.id = q.topic_id
        JOIN public.qb_chapters ch ON ch.id = top.chapter_id
        JOIN public.qb_subjects s ON s.id = ch.subject_id
        WHERE s.target_id = t.id AND q.status = 'published'
      ), 0),
      subject_count = COALESCE((
        SELECT COUNT(*)
        FROM public.qb_subjects s
        WHERE s.target_id = t.id
      ), 0);
  `;

  console.log('--- Successfully split HSC subjects into 1st & 2nd Papers ---');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
