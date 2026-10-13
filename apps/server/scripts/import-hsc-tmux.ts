import * as cheerio from 'cheerio';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import {
  qbTargets,
  qbContainers,
  qbContainerItems,
  qbSubjects,
  qbChapters,
  qbTopics,
  qbQuestions,
  qbQuestionOptions,
  qbSources,
  qbQuestionSources,
} from '../src/common/database/schema/qb.js';
import { recalculateAllCounts } from '../src/modules/qb/qb-count.js';

const client = postgres('postgresql://paws:df8f13a4@127.0.0.1:5432/paws', { max: 20 });
const db = drizzle(client);

const AJAX_URL = 'https://studyclubd.com/qb-archive/includes/ajax.php';
const VIEW_URL = 'https://studyclubd.com/view-question1/';
const HSC_UNIV_CODE = 'UNI_0bda0cb2';

interface ChapterRule {
  keywords: string[];
  paper: '1st' | '2nd';
}

const CHAPTER_RULES: Record<string, ChapterRule[]> = {
  physics: [
    { paper: '1st', keywords: ['ভৌতজগত', 'ভেক্টর', 'গতিবিদ্যা', 'বলবিদ্যা', 'কাজ, শক্তি', 'মহাকর্ষ', 'গাঠনিক ধর্ম', 'পর্যায়বৃত্তিক', 'তরঙ্গ', 'আদর্শ গ্যাস', 'p-1.'] },
    { paper: '2nd', keywords: ['তাপগতিবিদ্যা', 'স্থির তড়িৎ', 'চল তড়িৎ', 'চৌম্বক', 'তাড়িতচৌম্বকীয়', 'জ্যামিতিক আলোকবিজ্ঞান', 'ভৌত আলোকবিজ্ঞান', 'আধুনিক পদার্থবিজ্ঞান', 'পরমাণুর মডেল', 'সেমিকন্ডাক্টর', 'জ্যোতির্বিজ্ঞান', 'p-2.'] }
  ],
  chemistry: [
    { paper: '1st', keywords: ['ল্যাবরেটরি', 'গুণগত', 'পর্যায়বৃত্ত', 'রাসায়নিক পরিবর্তন', 'কর্মমুখী', 'c-1.', 'প্রথম পত্র'] },
    { paper: '2nd', keywords: ['পরিবেশ', 'জৈব', 'পরিমাণগত', 'তড়িৎ রসায়ন', 'অর্থনৈতিক', 'c-2.', 'দ্বিতীয় পত্র'] }
  ],
  higherMath: [
    { paper: '1st', keywords: ['ম্যাট্রিক্স', 'নির্ণায়ক', 'সরলরেখা', 'বৃত্ত', 'বিন্যাস', 'সমাবেশ', 'ত্রিকোণমিতিক অনুপাত', 'সংযুক্ত কোণ', 'ফাংশন', 'অন্তরীকরণ', 'যৌগজীকরণ', 'm-1.'] },
    { paper: '2nd', keywords: ['বাস্তব সংখ্যা', 'দ্বিপদী', 'জটিল সংখ্যা', 'বহুপদী', 'কনিক', 'বিপরীত ত্রিকোণমিতিক', 'স্থিতিবিদ্যা', 'সমতলে বস্তুকণার গতি', 'সম্ভাবনা', 'm-2.'] }
  ],
  biology: [
    { paper: '1st', keywords: ['কোষ ও এর গঠন', 'কোষ বিভাজন', 'কোষ রসায়ন', 'অণুজীব', 'শৈবাল', 'ছত্রাক', 'ব্রায়োফাইটা', 'টেরিডোফাইটা', 'নগ্নবীজী', 'আবৃতবীজী', 'টিস্যু', 'উদ্ভিদ শারীরতত্ত্ব', 'উদ্ভিদ প্রজনন', 'জীবপ্রযুক্তি', 'জীবের পরিবেশ', 'b-1.', 'প্রথম পত্র'] },
    { paper: '2nd', keywords: ['প্রাণীর বিভিন্নতা', 'শ্রেণিবিন্যাস', 'প্রাণীর পরিচিতি', 'পরিপাক', 'শোষণ', 'রক্ত', 'সঞ্চালন', 'শ্বাসক্রিয়া', 'শ্বসন', 'বর্জ্য', 'চলন', 'অঙ্গচালনা', 'সমন্বয়', 'ধারাবাহিকতা', 'প্রতিরক্ষা', 'জীনতত্ত্ব', 'বিবর্তন', 'আচরণ', 'b-2.', 'দ্বিতীয় পত্র'] }
  ],
  accounting: [
    { paper: '1st', keywords: ['হিসাববিজ্ঞান পরিচিতি', 'হিসাবের বই', 'ব্যাংক সমন্বয়', 'রেওয়ামিল', 'কার্যপত্র', 'দৃশ্যমান', 'অদৃশ্যমান', 'প্রাপ্য হিসাব', 'আর্থিক বিবরণী', 'একতরফা', 'acc-1.'] },
    { paper: '2nd', keywords: ['অব্যবসায়ী', 'অংশীদারি', 'যৌথমূলধনী', 'কোম্পানির মূলধন', 'কোম্পানির আর্থিক বিবরণী', 'আর্থিক বিবরণী বিশ্লেষণ', 'উৎপাদন ব্যয়', 'মজুদপণ্য', 'acc-2.'] }
  ],
  businessOrg: [
    { paper: '1st', keywords: ['ব্যবসায়ের মৌলিক ধারণা', 'ব্যবসায় পরিবেশ', 'একমালিকানা', 'অংশীদারি', 'যৌথ মূলধনী', 'সমবায়', 'রাষ্ট্রীয়', 'আইনগত দিক', 'উদ্যোগ', 'সহায়ক সেবা', 'নৈতিকতা', 'দায়বদ্ধতা', 'তথ্য ও যোগাযোগ প্রযুক্তির ব্যবহার', 'bus-1.', 'প্রথম পত্র'] },
    { paper: '2nd', keywords: ['ব্যবস্থাপনার ধারণা', 'ব্যবস্থাপনা নীতি', 'পরিকল্পনা', 'সিদ্ধান্ত গ্রহণ', 'সংগঠিতকরণ', 'কর্মীসংস্থান', 'নেতৃত্ব', 'যোগাযোগ', 'সমন্বয়সাধন', 'নিয়ন্ত্রণ', 'man-2.', 'দ্বিতীয় পত্র'] }
  ],
  finance: [
    { paper: '1st', keywords: ['অর্থায়নের সূচনা', 'আইনগত দিকসমূহ', 'সময়ের মূল্য', 'আর্থিক বিশ্লেষণ', 'স্বল্প ও মধ্যমেয়াদি', 'দীর্ঘমেয়াদি', 'মূলধন ব্যয়', 'মূলধন বাজেটিং', 'বিনিয়োগ সিদ্ধান্ত', 'ঝুঁকি ও মুনাফার হার', 'fin-1.'] },
    { paper: '2nd', keywords: ['ব্যাংক ব্যবস্থার প্রাথমিক ধারণা', 'কেন্দ্রীয় ব্যাংক', 'বাণিজ্যিক ব্যাংক', 'ব্যাংক হিসাব', 'হস্তান্তরযোগ্য', 'চেক, বিনিময় বিল', 'বৈদেশিক বিনিময়', 'ব্যাংক তহবিলের উৎস', 'ইলেকট্রনিক', 'আধুনিক ব্যাংকিং', 'বিমা সম্পর্কে মৌলিক ধারণা', 'জীবন বিমা', 'নৌ-বিমা', 'অগ্নি বিমা', 'বিবিধ বিমা', 'fin-2.', 'bank-2.', 'ins-2.'] }
  ],
  marketing: [
    { paper: '1st', keywords: ['উৎপাদন', 'উপকরণ', 'মাত্রা', 'সামষ্টিক পর্যায়', 'উৎপাদন ব্যবস্থাপনা', 'পণ্য ডিজাইন', 'অবস্থান', 'লে আউট', 'বিন্যাস', 'পরিবেশ ব্যবস্থাপনা', 'মান ব্যবস্থাপনা', 'prod-1.', 'প্রথম পত্র'] },
    { paper: '2nd', keywords: ['বিপণন পরিচিতি', 'বিপণন পরিবেশ', 'বিপণন কার্যাবলি', 'বাজার বিভক্তিকরণ', 'বিপণন মিশ্রণ', 'পণ্য ও পণ্যের মূল্য নির্ধারণ', 'বণ্টন প্রণালি', 'পাইকারি ও খুচরা', 'বিক্রয় প্রসার', 'বিজ্ঞাপন', 'ব্যক্তিক বিক্রয়', 'বিক্রয়িকতা', 'সমসাময়িক বিষয়াবলি', 'mark-2.', 'দ্বিতীয় পত্র'] }
  ],
  economics: [
    { paper: '1st', keywords: ['মৌলিক অর্থনৈতিক সমস্যা', 'ভোক্তা ও উৎপাদকের আচরণ', 'উৎপাদন, উৎপাদন ব্যয়', 'বাজার', 'শ্রমবাজার', 'মূলধন', 'সংগঠন', 'খাজনা', 'মুদ্রাস্ফীতি', 'সামগ্রিক আয় ও ব্যয়', 'অর্থ ও ব্যাংক', 'eco-1.', 'প্রথম পত্র'] },
    { paper: '2nd', keywords: ['বাংলাদেশের অর্থনীতির পরিচয়', 'বাংলাদেশের কৃষি', 'বাংলাদেশের শিল্প', 'জনসংখ্যা', 'মানব সম্পদ', 'আত্মকর্মসংস্থান', 'খাদ্য নিরাপত্তা', 'সরকারি অর্থব্যবস্থা', 'আন্তর্জাতিক বাণিজ্য', 'উন্নয়ন পরিকল্পনা', 'eco-2.', 'দ্বিতীয় পত্র'] }
  ],
  civics: [
    { paper: '1st', keywords: ['পৌরনীতি ও সুশাসন পরিচিতি', 'সুশাসন', 'মূল্যবোধ', 'আইন, স্বাধীনতা', 'ই-গভর্নেন্স', 'নাগরিক অধিকার', 'মানবাধিকার', 'রাজনৈতিক দল', 'নেতৃত্ব', 'সরকার কাঠামো', 'জনমত', 'রাজনৈতিক সংস্কৃতি', 'জনসেবা', 'আমলাতন্ত্র', 'civ-1.', 'প্রথম পত্র'] },
    { paper: '2nd', keywords: ['ব্রিটিশ ভারতে', 'ভারত বিভাগ', 'পাকিস্তান থেকে বাংলাদেশ', 'রাজনৈতিক ব্যক্তিত্ব', 'বাংলাদেশের সংবিধান', 'সরকার ও প্রশাসনিক কাঠামো', 'স্থানীয় শাসন', 'সাংবিধানিক প্রতিষ্ঠান', 'নির্বাচন ব্যবস্থা', 'বৈদেশিক নীতি', 'নাগরিক সমস্যা', 'civ-2.', 'দ্বিতীয় পত্র'] }
  ]
};

function determinePaper(chapName: string, ruleKey?: string): '1st' | '2nd' {
  const lower = chapName.toLowerCase();
  if (lower.includes('১ম পত্র') || lower.includes('1st paper') || lower.includes('-1.') || lower.includes('1.1') || lower.includes('1.2') || lower.includes('1.3') || lower.includes('1.4') || lower.includes('1.5') || lower.includes('1.6') || lower.includes('1.7') || lower.includes('1.8') || lower.includes('1.9') || lower.includes('1.10')) {
    return '1st';
  }
  if (lower.includes('২য় পত্র') || lower.includes('২য় পত্র') || lower.includes('2nd paper') || lower.includes('-2.') || lower.includes('2.1') || lower.includes('2.2') || lower.includes('2.3') || lower.includes('2.4') || lower.includes('2.5') || lower.includes('2.6') || lower.includes('2.7') || lower.includes('2.8') || lower.includes('2.9') || lower.includes('2.10')) {
    return '2nd';
  }
  if (ruleKey && CHAPTER_RULES[ruleKey]) {
    for (const r of CHAPTER_RULES[ruleKey]) {
      for (const kw of r.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return r.paper;
        }
      }
    }
  }
  return '1st';
}

interface ItemPaperDef {
  itemSlug: string;
  itemName: string;
  itemDesc: string;
  orderIndex: number;
  subjectCodes: string[];
  ruleKey?: string;
  forcedPaper?: '1st' | '2nd' | 'single';
}

interface DivisionDef {
  name: string;
  slug: string;
  desc: string;
  orderIndex: number;
  items: ItemPaperDef[];
}

const HSC_DIVISIONS: DivisionDef[] = [
  {
    name: 'এইচএসসি বিজ্ঞান বিভাগ (Science)',
    slug: 'hsc-science',
    desc: 'HSC Science Division Academic Question Bank Archive',
    orderIndex: 1,
    items: [
      { itemSlug: 'physics-1st', itemName: 'পদার্থবিজ্ঞান ১ম পত্র (Physics 1st Paper)', itemDesc: 'HSC Physics 1st Paper', orderIndex: 1, subjectCodes: ['SUB_7e246a89', 'SUB_599bd423'], ruleKey: 'physics', forcedPaper: '1st' },
      { itemSlug: 'physics-2nd', itemName: 'পদার্থবিজ্ঞান ২য় পত্র (Physics 2nd Paper)', itemDesc: 'HSC Physics 2nd Paper', orderIndex: 2, subjectCodes: ['SUB_7e246a89', 'SUB_2a8512fd'], ruleKey: 'physics', forcedPaper: '2nd' },
      { itemSlug: 'chemistry-1st', itemName: 'রসায়ন ১ম পত্র (Chemistry 1st Paper)', itemDesc: 'HSC Chemistry 1st Paper', orderIndex: 3, subjectCodes: ['SUB_455643fa', 'SUB_9e96b95f', 'SUB_4abd849f', 'SUB_44b571fc'], ruleKey: 'chemistry', forcedPaper: '1st' },
      { itemSlug: 'chemistry-2nd', itemName: 'রসায়ন ২য় পত্র (Chemistry 2nd Paper)', itemDesc: 'HSC Chemistry 2nd Paper', orderIndex: 4, subjectCodes: ['SUB_455643fa', 'SUB_4d509433', 'SUB_65bf41af'], ruleKey: 'chemistry', forcedPaper: '2nd' },
      { itemSlug: 'higher-math-1st', itemName: 'উচ্চতর গণিত ১ম পত্র (Higher Math 1st Paper)', itemDesc: 'HSC Higher Math 1st Paper', orderIndex: 5, subjectCodes: ['SUB_084ea3ab', 'SUB_ceec274d'], ruleKey: 'higherMath', forcedPaper: '1st' },
      { itemSlug: 'higher-math-2nd', itemName: 'উচ্চতর গণিত ২য় পত্র (Higher Math 2nd Paper)', itemDesc: 'HSC Higher Math 2nd Paper', orderIndex: 6, subjectCodes: ['SUB_084ea3ab'], ruleKey: 'higherMath', forcedPaper: '2nd' },
      { itemSlug: 'biology-1st', itemName: 'জীববিজ্ঞান ১ম পত্র (Botany - উদ্ভিদবিজ্ঞান)', itemDesc: 'HSC Biology 1st Paper', orderIndex: 7, subjectCodes: ['SUB_a2ff7d9b'], ruleKey: 'biology', forcedPaper: '1st' },
      { itemSlug: 'biology-2nd', itemName: 'জীববিজ্ঞান ২য় পত্র (Zoology - প্রাণিবিজ্ঞান)', itemDesc: 'HSC Biology 2nd Paper', orderIndex: 8, subjectCodes: ['SUB_a2ff7d9b'], ruleKey: 'biology', forcedPaper: '2nd' },
      { itemSlug: 'ict', itemName: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', itemDesc: 'HSC Information & Communication Technology', orderIndex: 9, subjectCodes: ['SUB_c0401a91', 'SUB_33beeb61'], forcedPaper: 'single' },
      { itemSlug: 'bangla-1st', itemName: 'বাংলা ১ম পত্র (সাহিত্যপাঠ)', itemDesc: 'HSC Bangla 1st Paper', orderIndex: 10, subjectCodes: ['SUB_d3a16301', 'SUB_7f7304eb'], forcedPaper: '1st' },
      { itemSlug: 'bangla-2nd', itemName: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', itemDesc: 'HSC Bangla 2nd Paper', orderIndex: 11, subjectCodes: ['SUB_d3a16301'], forcedPaper: '2nd' },
      { itemSlug: 'english-1st', itemName: 'English 1st Paper (English for Today)', itemDesc: 'HSC English 1st Paper', orderIndex: 12, subjectCodes: ['SUB_3acf701a'], forcedPaper: '1st' },
      { itemSlug: 'english-2nd', itemName: 'English 2nd Paper (Grammar & Composition)', itemDesc: 'HSC English 2nd Paper', orderIndex: 13, subjectCodes: ['SUB_3acf701a'], forcedPaper: '2nd' },
      { itemSlug: 'statistics-1st', itemName: 'পরিসংখ্যান ১ম পত্র (Statistics 1st)', itemDesc: 'HSC Statistics 1st Paper', orderIndex: 14, subjectCodes: ['SUB_5fc9de7c'], forcedPaper: '1st' },
      { itemSlug: 'statistics-2nd', itemName: 'পরিসংখ্যান ২য় পত্র (Statistics 2nd)', itemDesc: 'HSC Statistics 2nd Paper', orderIndex: 15, subjectCodes: ['SUB_5fc9de7c'], forcedPaper: '2nd' },
      { itemSlug: 'agriculture-1st', itemName: 'কৃষিশিক্ষা ১ম পত্র (Agriculture 1st)', itemDesc: 'HSC Agriculture 1st Paper', orderIndex: 16, subjectCodes: ['SUB_1fd2d6f3', 'SUB_ceadfc85'], forcedPaper: '1st' },
      { itemSlug: 'agriculture-2nd', itemName: 'কৃষিশিক্ষা ২য় পত্র (Agriculture 2nd)', itemDesc: 'HSC Agriculture 2nd Paper', orderIndex: 17, subjectCodes: ['SUB_1fd2d6f3', 'SUB_407d1f8a'], forcedPaper: '2nd' },
      { itemSlug: 'psychology-1st', itemName: 'মনোবিজ্ঞান ১ম পত্র (Psychology 1st)', itemDesc: 'HSC Psychology 1st Paper', orderIndex: 18, subjectCodes: ['SUB_253bd6ce'], forcedPaper: '1st' },
      { itemSlug: 'psychology-2nd', itemName: 'মনোবিজ্ঞান ২য় পত্র (Psychology 2nd)', itemDesc: 'HSC Psychology 2nd Paper', orderIndex: 19, subjectCodes: ['SUB_253bd6ce'], forcedPaper: '2nd' },
    ]
  },
  {
    name: 'এইচএসসি ব্যবসায় শিক্ষা বিভাগ (Commerce)',
    slug: 'hsc-commerce',
    desc: 'HSC Business Studies Division Academic Question Bank Archive',
    orderIndex: 2,
    items: [
      { itemSlug: 'accounting-1st', itemName: 'হিসাববিজ্ঞান ১ম পত্র (Accounting 1st Paper)', itemDesc: 'HSC Accounting 1st Paper', orderIndex: 1, subjectCodes: ['SUB_3f627e22'], ruleKey: 'accounting', forcedPaper: '1st' },
      { itemSlug: 'accounting-2nd', itemName: 'হিসাববিজ্ঞান ২য় পত্র (Accounting 2nd Paper)', itemDesc: 'HSC Accounting 2nd Paper', orderIndex: 2, subjectCodes: ['SUB_3f627e22'], ruleKey: 'accounting', forcedPaper: '2nd' },
      { itemSlug: 'business-organization-1st', itemName: 'ব্যবসায় সংগঠন ১ম পত্র (Business Org 1st)', itemDesc: 'HSC Business Organization 1st Paper', orderIndex: 3, subjectCodes: ['SUB_395a86d5'], ruleKey: 'businessOrg', forcedPaper: '1st' },
      { itemSlug: 'business-organization-2nd', itemName: 'ব্যবসায় ব্যবস্থাপনা ২য় পত্র (Business Management 2nd)', itemDesc: 'HSC Business Management 2nd Paper', orderIndex: 4, subjectCodes: ['SUB_395a86d5'], ruleKey: 'businessOrg', forcedPaper: '2nd' },
      { itemSlug: 'finance-banking-1st', itemName: 'ফিন্যান্স ও ব্যাংকিং ১ম পত্র (Finance 1st)', itemDesc: 'HSC Finance 1st Paper', orderIndex: 5, subjectCodes: ['SUB_acc1f045'], ruleKey: 'finance', forcedPaper: '1st' },
      { itemSlug: 'finance-banking-2nd', itemName: 'ব্যাংকিং ও বিমা ২য় পত্র (Banking & Insurance 2nd)', itemDesc: 'HSC Banking & Insurance 2nd Paper', orderIndex: 6, subjectCodes: ['SUB_acc1f045'], ruleKey: 'finance', forcedPaper: '2nd' },
      { itemSlug: 'marketing-1st', itemName: 'উৎপাদন ব্যবস্থাপনা ১ম পত্র (Production Management 1st)', itemDesc: 'HSC Production Management 1st Paper', orderIndex: 7, subjectCodes: ['SUB_77c21b7c'], ruleKey: 'marketing', forcedPaper: '1st' },
      { itemSlug: 'marketing-2nd', itemName: 'বিপণন ২য় পত্র (Marketing 2nd)', itemDesc: 'HSC Marketing 2nd Paper', orderIndex: 8, subjectCodes: ['SUB_77c21b7c'], ruleKey: 'marketing', forcedPaper: '2nd' },
      { itemSlug: 'economics-1st', itemName: 'অর্থনীতি ১ম পত্র (Economics 1st Paper)', itemDesc: 'HSC Economics 1st Paper', orderIndex: 9, subjectCodes: ['SUB_c1b3c31c'], ruleKey: 'economics', forcedPaper: '1st' },
      { itemSlug: 'economics-2nd', itemName: 'অর্থনীতি ২য় পত্র (Economics 2nd Paper)', itemDesc: 'HSC Economics 2nd Paper', orderIndex: 10, subjectCodes: ['SUB_c1b3c31c'], ruleKey: 'economics', forcedPaper: '2nd' },
      { itemSlug: 'ict', itemName: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', itemDesc: 'HSC Information & Communication Technology', orderIndex: 11, subjectCodes: ['SUB_c0401a91', 'SUB_33beeb61'], forcedPaper: 'single' },
      { itemSlug: 'bangla-1st', itemName: 'বাংলা ১ম পত্র (সাহিত্যপাঠ)', itemDesc: 'HSC Bangla 1st Paper', orderIndex: 12, subjectCodes: ['SUB_d3a16301', 'SUB_7f7304eb'], forcedPaper: '1st' },
      { itemSlug: 'bangla-2nd', itemName: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', itemDesc: 'HSC Bangla 2nd Paper', orderIndex: 13, subjectCodes: ['SUB_d3a16301'], forcedPaper: '2nd' },
      { itemSlug: 'english-1st', itemName: 'English 1st Paper', itemDesc: 'HSC English 1st Paper', orderIndex: 14, subjectCodes: ['SUB_3acf701a'], forcedPaper: '1st' },
      { itemSlug: 'english-2nd', itemName: 'English 2nd Paper', itemDesc: 'HSC English 2nd Paper', orderIndex: 15, subjectCodes: ['SUB_3acf701a'], forcedPaper: '2nd' },
    ]
  },
  {
    name: 'এইচএসসি মানবিক বিভাগ (Humanities)',
    slug: 'hsc-humanities',
    desc: 'HSC Humanities Division Academic Question Bank Archive',
    orderIndex: 3,
    items: [
      { itemSlug: 'economics-1st', itemName: 'অর্থনীতি ১ম পত্র (Economics 1st Paper)', itemDesc: 'HSC Economics 1st Paper', orderIndex: 1, subjectCodes: ['SUB_c1b3c31c'], ruleKey: 'economics', forcedPaper: '1st' },
      { itemSlug: 'economics-2nd', itemName: 'অর্থনীতি ২য় পত্র (Economics 2nd Paper)', itemDesc: 'HSC Economics 2nd Paper', orderIndex: 2, subjectCodes: ['SUB_c1b3c31c'], ruleKey: 'economics', forcedPaper: '2nd' },
      { itemSlug: 'civics-1st', itemName: 'পৌরনীতি ও সুশাসন ১ম পত্র (Civics 1st Paper)', itemDesc: 'HSC Civics 1st Paper', orderIndex: 3, subjectCodes: ['SUB_c7f4b6b3', 'SUB_f04dbb3f', 'SUB_de1d95ed', 'SUB_6932d4e1', 'SUB_e40351eb', 'SUB_96550efe', 'SUB_f89a72e1', 'SUB_70df21ba', 'SUB_9f5d0a26', 'SUB_a0b9592c'], ruleKey: 'civics', forcedPaper: '1st' },
      { itemSlug: 'civics-2nd', itemName: 'পৌরনীতি ও সুশাসন ২য় পত্র (Civics 2nd Paper)', itemDesc: 'HSC Civics 2nd Paper', orderIndex: 4, subjectCodes: ['SUB_c7f4b6b3', 'SUB_e8458ce0'], ruleKey: 'civics', forcedPaper: '2nd' },
      { itemSlug: 'logic-1st', itemName: 'যুক্তিবিদ্যা ১ম পত্র (Logic 1st Paper)', itemDesc: 'HSC Logic 1st Paper', orderIndex: 5, subjectCodes: ['SUB_268cd757', 'SUB_edfd6c91', 'SUB_c295bd20'], forcedPaper: '1st' },
      { itemSlug: 'logic-2nd', itemName: 'যুক্তিবিদ্যা ২য় পত্র (Logic 2nd Paper)', itemDesc: 'HSC Logic 2nd Paper', orderIndex: 6, subjectCodes: ['SUB_268cd757', 'SUB_9423cedc', 'SUB_46fab288'], forcedPaper: '2nd' },
      { itemSlug: 'history-1st', itemName: 'ইতিহাস ১ম পত্র (History 1st Paper)', itemDesc: 'HSC History 1st Paper', orderIndex: 7, subjectCodes: ['SUB_350e5023', 'SUB_543fe856'], forcedPaper: '1st' },
      { itemSlug: 'history-2nd', itemName: 'ইতিহাস ২য় পত্র (History 2nd Paper)', itemDesc: 'HSC History 2nd Paper', orderIndex: 8, subjectCodes: ['SUB_350e5023'], forcedPaper: '2nd' },
      { itemSlug: 'islamic-history-1st', itemName: 'ইসলামের ইতিহাস ১ম পত্র (Islamic History 1st)', itemDesc: 'HSC Islamic History 1st Paper', orderIndex: 9, subjectCodes: ['SUB_e0620697', 'SUB_78c19eab'], forcedPaper: '1st' },
      { itemSlug: 'islamic-history-2nd', itemName: 'ইসলামের ইতিহাস ২য় পত্র (Islamic History 2nd)', itemDesc: 'HSC Islamic History 2nd Paper', orderIndex: 10, subjectCodes: ['SUB_e0620697'], forcedPaper: '2nd' },
      { itemSlug: 'sociology-1st', itemName: 'সমাজবিজ্ঞান ১ম পত্র (Sociology 1st)', itemDesc: 'HSC Sociology 1st Paper', orderIndex: 11, subjectCodes: ['SUB_f89a7d6e'], forcedPaper: '1st' },
      { itemSlug: 'sociology-2nd', itemName: 'সমাজবিজ্ঞান ২য় পত্র (Sociology 2nd)', itemDesc: 'HSC Sociology 2nd Paper', orderIndex: 12, subjectCodes: ['SUB_f89a7d6e'], forcedPaper: '2nd' },
      { itemSlug: 'social-work-1st', itemName: 'সমাজকর্ম ১ম পত্র (Social Work 1st)', itemDesc: 'HSC Social Work 1st Paper', orderIndex: 13, subjectCodes: ['SUB_3fcb315d'], forcedPaper: '1st' },
      { itemSlug: 'social-work-2nd', itemName: 'সমাজকর্ম ২য় পত্র (Social Work 2nd)', itemDesc: 'HSC Social Work 2nd Paper', orderIndex: 14, subjectCodes: ['SUB_3fcb315d'], forcedPaper: '2nd' },
      { itemSlug: 'geography-1st', itemName: 'ভূগোল ১ম পত্র (Geography 1st Paper)', itemDesc: 'HSC Geography 1st Paper', orderIndex: 15, subjectCodes: ['SUB_ccfccef3', 'SUB_afebee1a'], forcedPaper: '1st' },
      { itemSlug: 'geography-2nd', itemName: 'ভূগোল ২য় পত্র (Geography 2nd Paper)', itemDesc: 'HSC Geography 2nd Paper', orderIndex: 16, subjectCodes: ['SUB_ccfccef3'], forcedPaper: '2nd' },
      { itemSlug: 'islamic-studies-1st', itemName: 'ইসলাম শিক্ষা ১ম পত্র (Islamic Studies 1st)', itemDesc: 'HSC Islamic Studies 1st Paper', orderIndex: 17, subjectCodes: ['SUB_5779ea56'], forcedPaper: '1st' },
      { itemSlug: 'islamic-studies-2nd', itemName: 'ইসলাম শিক্ষা ২য় পত্র (Islamic Studies 2nd)', itemDesc: 'HSC Islamic Studies 2nd Paper', orderIndex: 18, subjectCodes: ['SUB_5779ea56'], forcedPaper: '2nd' },
      { itemSlug: 'home-science-1st', itemName: 'গার্হস্থ্যবিজ্ঞান ১ম পত্র (Home Science 1st)', itemDesc: 'HSC Home Science 1st Paper', orderIndex: 19, subjectCodes: ['SUB_e66e16b7'], forcedPaper: '1st' },
      { itemSlug: 'home-science-2nd', itemName: 'গার্হস্থ্যবিজ্ঞান ২য় পত্র (Home Science 2nd)', itemDesc: 'HSC Home Science 2nd Paper', orderIndex: 20, subjectCodes: ['SUB_e66e16b7'], forcedPaper: '2nd' },
      { itemSlug: 'ict', itemName: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', itemDesc: 'HSC Information & Communication Technology', orderIndex: 21, subjectCodes: ['SUB_c0401a91', 'SUB_33beeb61'], forcedPaper: 'single' },
      { itemSlug: 'bangla-1st', itemName: 'বাংলা ১ম পত্র', itemDesc: 'HSC Bangla 1st Paper', orderIndex: 22, subjectCodes: ['SUB_d3a16301', 'SUB_7f7304eb'], forcedPaper: '1st' },
      { itemSlug: 'bangla-2nd', itemName: 'বাংলা ২য় পত্র', itemDesc: 'HSC Bangla 2nd Paper', orderIndex: 23, subjectCodes: ['SUB_d3a16301'], forcedPaper: '2nd' },
      { itemSlug: 'english-1st', itemName: 'English 1st Paper', itemDesc: 'HSC English 1st Paper', orderIndex: 24, subjectCodes: ['SUB_3acf701a'], forcedPaper: '1st' },
      { itemSlug: 'english-2nd', itemName: 'English 2nd Paper', itemDesc: 'HSC English 2nd Paper', orderIndex: 25, subjectCodes: ['SUB_3acf701a'], forcedPaper: '2nd' },
    ]
  }
];

interface ParsedOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface ParsedQuestion {
  dbId: string | null;
  text: string;
  meta: string;
  options: ParsedOption[];
}

function normalizeKey(str: string): string {
  return str.replace(/\s+/g, '').toLowerCase().trim();
}

function parseMetaTags(metaStr: string) {
  const rawMatches = metaStr.match(/\[(.*?)\]/g) || [];
  const parsedSources: { institution: string; unit?: string; year?: number }[] = [];

  for (const raw of rawMatches) {
    const clean = raw.replace(/[\[\]]/g, '').trim();
    const parts = clean.split(':').map((p) => p.trim());
    const institution = parts[0] || 'HSC Board';
    let unit: string | undefined = 'HSC';
    let year: number | undefined;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const yNum = parseInt(part.replace(/\D/g, ''));
      if (!isNaN(yNum) && yNum > 1900 && yNum < 2100) {
        year = yNum;
      } else if (part.toLowerCase().includes('board') || part.toLowerCase().includes('set')) {
        unit = part;
      }
    }

    parsedSources.push({
      institution,
      unit: unit || 'HSC',
      year,
    });
  }

  if (parsedSources.length === 0) {
    parsedSources.push({
      institution: 'HSC Academic',
      unit: 'HSC',
      year: undefined,
    });
  }

  return parsedSources;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
}

async function scrapeQuestionsForChapter(
  subjectCode: string,
  chapterCode: string
): Promise<ParsedQuestion[]> {
  const questions: ParsedQuestion[] = [];
  let page = 1;

  while (true) {
    const url = `${VIEW_URL}?university=${HSC_UNIV_CODE}&subject=${subjectCode}&chapter=${chapterCode}&spa_ajax=1&page=${page}`;
    const data = await fetchWithRetry(url);
    if (!data || !data.html) break;

    const $ = cheerio.load(data.html);
    const items = $('.mcq-item');
    if (items.length === 0) break;

    items.each((_, el) => {
      const item = $(el);
      const dbId = item.attr('data-db-id') || null;
      const qTextEl = item.find('.mcq-question-text');
      const number = qTextEl.find('.question-number').text().trim();
      const qLink = qTextEl.find('a.spa-link');
      let text = qLink.text().trim() || qTextEl.text().replace(number, '').trim();
      text = text.replace(/\s+/g, ' ');
      const meta = item.find('.mcq-meta').text().trim();

      const options: ParsedOption[] = [];
      item.find('.mcq-option-btn').each((_, optEl) => {
        const opt = $(optEl);
        options.push({
          label: opt.find('.opt-circle').text().trim() || 'A',
          text: opt.find('.opt-text').text().trim(),
          isCorrect: opt.attr('data-is-correct') === 'true',
        });
      });

      if (text) {
        questions.push({ dbId, text, meta, options });
      }
    });

    if (data.has_more === false || items.length < 50) break;
    page++;
  }

  return questions;
}

async function main() {
  console.log('🚀 Starting Robust HSC Ingestion Pipeline...');

  let [target] = await db.select().from(qbTargets).where(eq(qbTargets.slug, 'hsc'));
  if (!target) {
    [target] = await db
      .insert(qbTargets)
      .values({
        group: 'academic',
        name: 'HSC / Alim Academic',
        slug: 'hsc',
        orderIndex: 2,
      })
      .returning();
  }

  for (const div of HSC_DIVISIONS) {
    console.log(`\n======================================================`);
    console.log(`📦 Division: ${div.name} (${div.slug})`);
    console.log(`======================================================`);

    let [container] = await db
      .select()
      .from(qbContainers)
      .where(eq(qbContainers.slug, div.slug));

    if (!container) {
      [container] = await db
        .insert(qbContainers)
        .values({
          targetId: target.id,
          name: div.name,
          slug: div.slug,
          description: div.desc,
          orderIndex: div.orderIndex,
        })
        .returning();
    }

    for (const itemDef of div.items) {
      console.log(`\n--- Item: ${itemDef.itemName} (${itemDef.itemSlug}) ---`);

      const canonicalSubjectSlug = `hsc-${div.slug}-${itemDef.itemSlug}`;
      let [subject] = await db
        .select()
        .from(qbSubjects)
        .where(eq(qbSubjects.slug, canonicalSubjectSlug));

      if (!subject) {
        [subject] = await db
          .insert(qbSubjects)
          .values({
            targetId: target.id,
            level: 'hsc',
            name: itemDef.itemName,
            slug: canonicalSubjectSlug,
            code: itemDef.subjectCodes[0],
            orderIndex: itemDef.orderIndex,
          })
          .returning();
      }

      let [containerItem] = await db
        .select()
        .from(qbContainerItems)
        .where(and(eq(qbContainerItems.containerId, container.id), eq(qbContainerItems.slug, itemDef.itemSlug)));

      if (!containerItem) {
        [containerItem] = await db
          .insert(qbContainerItems)
          .values({
            containerId: container.id,
            subjectId: subject.id,
            name: itemDef.itemName,
            slug: itemDef.itemSlug,
            description: itemDef.itemDesc,
            orderIndex: itemDef.orderIndex,
          })
          .returning();
      } else {
        await db
          .update(qbContainerItems)
          .set({ subjectId: subject.id, name: itemDef.itemName })
          .where(eq(qbContainerItems.id, containerItem.id));
      }

      for (const subjCode of itemDef.subjectCodes) {
        const chapUrl = `${AJAX_URL}?ajax=1&step=chapters&university=${HSC_UNIV_CODE}&subject=${subjCode}`;
        const chapData = await fetchWithRetry(chapUrl);
        if (!chapData || !chapData.html) continue;

        const $c = cheerio.load(chapData.html);
        const chapterList: { code: string; name: string }[] = [];

        $c('[onclick*="toggleChapter"]').each((_, el) => {
          const text = $c(el).text().trim().replace(/\s+/g, ' ');
          const name = text.replace(/\d+\s*Q.*$/, '').trim() || text;
          const onclick = $c(el).attr('onclick') || '';
          const match = onclick.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
          if (match) {
            chapterList.push({ code: match[3], name });
          }
        });

        for (let cIdx = 0; cIdx < chapterList.length; cIdx++) {
          const chap = chapterList[cIdx];
          
          if (itemDef.forcedPaper && itemDef.forcedPaper !== 'single') {
            const detectedPaper = determinePaper(chap.name, itemDef.ruleKey);
            if (detectedPaper !== itemDef.forcedPaper) {
              continue;
            }
          }

          const chapSlug = `${canonicalSubjectSlug}-chap-${chap.code.toLowerCase()}`;
          let [chapter] = await db
            .select()
            .from(qbChapters)
            .where(eq(qbChapters.slug, chapSlug));

          if (!chapter) {
            [chapter] = await db
              .insert(qbChapters)
              .values({
                subjectId: subject.id,
                name: chap.name,
                slug: chapSlug,
                code: chap.code,
                orderIndex: cIdx + 1,
              })
              .returning();
          }

          const topSlug = `${chapSlug}-top`;
          let [topic] = await db
            .select()
            .from(qbTopics)
            .where(and(eq(qbTopics.chapterId, chapter.id), eq(qbTopics.slug, topSlug)));

          if (!topic) {
            [topic] = await db
              .insert(qbTopics)
              .values({
                chapterId: chapter.id,
                name: chap.name,
                slug: topSlug,
                code: `TOP_${chap.code}`,
                orderIndex: 1,
              })
              .returning();
          } else if (topic.name !== chap.name) {
            await db
              .update(qbTopics)
              .set({ name: chap.name })
              .where(eq(qbTopics.id, topic.id));
          }

          const questions = await scrapeQuestionsForChapter(subjCode, chap.code);
          if (questions.length === 0) continue;

          console.log(`  * Chapter: ${chap.name} -> Scraped ${questions.length} questions`);

          for (const q of questions) {
            const [newQ] = await db
              .insert(qbQuestions)
              .values({
                topicId: topic.id,
                qType: 'mcq',
                questionText: q.text,
                status: 'published',
              })
              .returning();

            if (q.options.length > 0) {
              await db.insert(qbQuestionOptions).values(
                q.options.map((opt, oIdx) => ({
                  questionId: newQ.id,
                  optionText: opt.text || opt.label,
                  isCorrect: opt.isCorrect,
                  orderIndex: oIdx + 1,
                }))
              );
            }

            const sources = parseMetaTags(q.meta);
            for (const s of sources) {
              const sSlug = `hsc-${normalizeKey(s.institution)}-${s.year || 'general'}`;
              const [newS] = await db
                .insert(qbSources)
                .values({
                  containerItemId: containerItem.id,
                  sourceGroup: 'academic',
                  sourceType: 'board',
                  institution: s.institution,
                  unit: s.unit,
                  year: s.year,
                  slug: sSlug,
                  name: `${s.institution} ${s.unit || ''} ${s.year || ''}`.trim(),
                })
                .onConflictDoNothing()
                .returning();

              let sId = newS?.id;
              if (!sId) {
                const [existingSource] = await db.select().from(qbSources).where(eq(qbSources.slug, sSlug));
                sId = existingSource?.id;
              }
              if (sId) {
                await db
                  .insert(qbQuestionSources)
                  .values({
                    questionId: newQ.id,
                    sourceId: sId,
                  })
                  .onConflictDoNothing();
              }
            }
          }
        }
      }
    }
  }

  console.log('\nRecalculating all statistics...');
  await recalculateAllCounts(db);

  console.log('\n🎉 Complete HSC Paper Ingestion Finished Successfully!');
  await client.end();
}

main().catch((err) => {
  console.error('Fatal Error during HSC Paper Ingestion:', err);
  process.exit(1);
});
