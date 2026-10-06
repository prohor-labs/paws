import { db } from "../src/db";
import {
  qbContainers,
  qbContainerItems,
  qbExamSheets,
  qbExamSheetQuestions,
  qbQuestions,
  qbQuestionOptions,
  qbQuestionParts,
  qbQuestionChapters,
  qbSources,
  qbQuestionSources,
  qbChapterSources,
  qbTopics,
  qbChapters,
} from "../src/db/schema";
import { v7 as uuidv7 } from "uuid";
import { eq, inArray } from "drizzle-orm";
import { recalculateAllCounts } from "../src/services/qb-count.service";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const CHORCHA_TOKEN = process.env.CHORCHA_TOKEN;
const S3_ENDPOINT = process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT || "https://s3.prohor.dev";
const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || "study";
const S3_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "garage";
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || "";
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY || "";
const S3_PUBLIC_URL = (process.env.AWS_PUBLIC_URL || process.env.S3_BUCKET_URL || "https://study.storage.prohor.dev").replace(/\/+$/, "");

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

function decodeChorcha(text: string | null | undefined, key: string | null): string {
  if (!text || !key) return text || "";
  const chars: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const diff = (text.charCodeAt(i) - key.charCodeAt(i % 16)) & 0xffff;
    chars.push(String.fromCharCode(diff));
  }
  return chars.join("").replace(/\0/g, "");
}

function isDummyOption(text: string | null | undefined): boolean {
  if (!text) return true;
  const clean = text.replace(/<[^>]+>/g, "").trim().toLowerCase();
  return clean === "done" || clean === "skip" || clean === "পেরেছি" || clean === "পারিনি" || clean === "";
}

function cleanSolutionText(text: string | null | undefined): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD\uFFF0-\uFFFF]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const imageCache = new Map<string, string>();

async function migrateImagesInText(html: string | null | undefined): Promise<string> {
  if (!html) return html || "";

  const chorchaUrlRegex = /https?:\/\/assets\.chorcha\.net\/([^\s"'<>()\\]+)/gi;
  const matches = Array.from(html.matchAll(chorchaUrlRegex));
  if (matches.length === 0) return html;

  let result = html;
  for (const match of matches) {
    const fullUrl = match[0];
    const pathPart = match[1];

    if (imageCache.has(fullUrl)) {
      result = result.replace(fullUrl, imageCache.get(fullUrl)!);
      continue;
    }

    try {
      const cleanPath = pathPart.replace(/[^\w./-]/g, "");
      const ext = cleanPath.split(".").pop() || "png";
      const filename = `${uuidv7()}.${ext}`;
      const s3Key = `qb/images/${filename}`;
      const s3Url = `${S3_PUBLIC_URL}/${s3Key}`;

      const res = await fetch(fullUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const contentType = res.headers.get("content-type") || `image/${ext}`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          })
        );

        imageCache.set(fullUrl, s3Url);
        result = result.replace(fullUrl, s3Url);
      }
    } catch (err) {
      console.error(`Failed to migrate image ${fullUrl}:`, err);
    }
  }

  return result;
}

interface UnitConfig {
  seriesId: string;
  name: string;
  slug: string;
  unitCode: string;
  orderIndex: number;
}

interface BankConfig {
  name: string;
  slug: string;
  description: string;
  institution: string;
  orderIndex: number;
  units: UnitConfig[];
}

const ALL_TARGET_BANKS: BankConfig[] = [
  {
    name: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয় (JU)",
    slug: "varsity-ju",
    description: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয় (JU) এর সকল অনুষদের (A, B, C, D, E, F, IBA) বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Jahangirnagar University (JU)",
    orderIndex: 3,
    units: [
      { seriesId: "0Cun2dhg4L", name: "জাবি এ ইউনিট (গাণিতিক ও পদার্থবিজ্ঞান অনুষদ)", slug: "ju-a-unit", unitCode: "JU A", orderIndex: 1 },
      { seriesId: "adEIhShUSK", name: "জাবি বি ইউনিট (সমাজবিজ্ঞান অনুষদ)", slug: "ju-b-unit", unitCode: "JU B", orderIndex: 2 },
      { seriesId: "XiU7q3ZZGJ", name: "জাবি সি ইউনিট (কলা ও মানবিক অনুষদ)", slug: "ju-c-unit", unitCode: "JU C", orderIndex: 3 },
      { seriesId: "v-SHyfR4fp", name: "জাবি ডি ইউনিট (জীববিজ্ঞান অনুষদ)", slug: "ju-d-unit", unitCode: "JU D", orderIndex: 4 },
      { seriesId: "dMyyDFP3NP", name: "জাবি ই ইউনিট (বিজনেস স্টাডিজ অনুষদ)", slug: "ju-e-unit", unitCode: "JU E", orderIndex: 5 },
      { seriesId: "dtTgliEZZb", name: "জাবি এফ ইউনিট (আইন অনুষদ)", slug: "ju-f-unit", unitCode: "JU F", orderIndex: 6 },
      { seriesId: "-vcsHqEdZq", name: "জাবি আইবিএ ও ইনস্টিটিউট ইউনিট", slug: "ju-iba-unit", unitCode: "JU IBA", orderIndex: 7 },
    ],
  },
  {
    name: "রাজশাহী বিশ্ববিদ্যালয় (RU)",
    slug: "varsity-ru",
    description: "রাজশাহী বিশ্ববিদ্যালয় (RU) এর সকল অনুষদের (A, B, C) বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Rajshahi University (RU)",
    orderIndex: 4,
    units: [
      { seriesId: "tHhu2jAwTC", name: "রাবি এ ইউনিট (মানবিক ও কলা অনুষদ)", slug: "ru-a-unit", unitCode: "RU A", orderIndex: 1 },
      { seriesId: "GftLOAvwdA", name: "রাবি বি ইউনিট (বাণিজ্য শাখা)", slug: "ru-b-unit-commerce", unitCode: "RU B", orderIndex: 2 },
      { seriesId: "y-OjX1", name: "রাবি বি ইউনিট (অ-বাণিজ্য শাখা)", slug: "ru-b-unit-non-commerce", unitCode: "RU B Non-Commerce", orderIndex: 3 },
      { seriesId: "Wk1OkSzZqh", name: "রাবি সি ইউনিট (বিজ্ঞান শাখা)", slug: "ru-c-unit-science", unitCode: "RU C", orderIndex: 4 },
      { seriesId: "FhSiU-", name: "রাবি সি ইউনিট (অ-বিজ্ঞান শাখা)", slug: "ru-c-unit-non-science", unitCode: "RU C Non-Science", orderIndex: 5 },
    ],
  },
  {
    name: "চট্টগ্রাম বিশ্ববিদ্যালয় (CU)",
    slug: "varsity-cu",
    description: "চট্টগ্রাম বিশ্ববিদ্যালয় (CU) এর সকল অনুষদের (A, B, C, D) বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Chittagong University (CU)",
    orderIndex: 5,
    units: [
      { seriesId: "1XCyGjxO65", name: "চবি এ ইউনিট (বিজ্ঞান অনুষদ)", slug: "cu-a-unit", unitCode: "CU A", orderIndex: 1 },
      { seriesId: "ae6fipYDgp", name: "চবি বি ইউনিট (কলা ও মানবিক অনুষদ)", slug: "cu-b-unit", unitCode: "CU B", orderIndex: 2 },
      { seriesId: "f2IQJoglWq", name: "চবি সি ইউনিট (ব্যবসায় প্রশাসন অনুষদ)", slug: "cu-c-unit", unitCode: "CU C", orderIndex: 3 },
      { seriesId: "CKgbQFKV9Y", name: "চবি ডি ইউনিট (সমাজবিজ্ঞান ও সম্মিলিত অনুষদ)", slug: "cu-d-unit", unitCode: "CU D", orderIndex: 4 },
    ],
  },
  {
    name: "জিএসটি গুচ্ছ বিশ্ববিদ্যালয় (GST)",
    slug: "varsity-gst",
    description: "জিএসটি সমন্বিত সাধারণ ও বিজ্ঞান প্রযুক্তি বিশ্ববিদ্যালয় গুচ্ছ ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "GST General Cluster",
    orderIndex: 6,
    units: [
      { seriesId: "AkjNop3Lnm", name: "জিএসটি এ ইউনিট (বিজ্ঞান)", slug: "gst-a-unit", unitCode: "GST A", orderIndex: 1 },
      { seriesId: "uaVfdiV3Gn", name: "জিএসটি বি ইউনিট (মানবিক)", slug: "gst-b-unit", unitCode: "GST B", orderIndex: 2 },
      { seriesId: "yuFsa-KeHr", name: "জিএসটি সি ইউনিট (বাণিজ্য)", slug: "gst-c-unit", unitCode: "GST C", orderIndex: 3 },
      { seriesId: "_PDUn5ts7_", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ১", slug: "gst-combined-set-1", unitCode: "GST Set-1", orderIndex: 4 },
      { seriesId: "hfDxiFbvG6", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ২", slug: "gst-combined-set-2", unitCode: "GST Set-2", orderIndex: 5 },
      { seriesId: "hYb4_SwQNL", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ৩", slug: "gst-combined-set-3", unitCode: "GST Set-3", orderIndex: 6 },
      { seriesId: "KIenkYrdPd", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ৪", slug: "gst-combined-set-4", unitCode: "GST Set-4", orderIndex: 7 },
      { seriesId: "o1S97tPOxA", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ৫", slug: "gst-combined-set-5", unitCode: "GST Set-5", orderIndex: 8 },
      { seriesId: "pIWcG9-YmF", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ৬", slug: "gst-combined-set-6", unitCode: "GST Set-6", orderIndex: 9 },
      { seriesId: "RPzj1u_2QS", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ৭", slug: "gst-combined-set-7", unitCode: "GST Set-7", orderIndex: 10 },
      { seriesId: "V4BBtOLVnF", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ৮", slug: "gst-combined-set-8", unitCode: "GST Set-8", orderIndex: 11 },
      { seriesId: "wJrsEmsPNd", name: "জিএসটি পূর্ববর্তী সমন্বিত প্রশ্ন সেট ৯", slug: "gst-combined-set-9", unitCode: "GST Set-9", orderIndex: 12 },
    ],
  },
  {
    name: "কৃষি গুচ্ছ বিশ্ববিদ্যালয় (Agriculture Cluster)",
    slug: "varsity-agri",
    description: "কৃষি গুচ্ছ ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ব্যাংক (BAU, BSMRAU, SAU, CVASU, SAU Sylhet, KAU)",
    institution: "Agriculture University Cluster",
    orderIndex: 7,
    units: [
      { seriesId: "S-9K9a", name: "কৃষি গুচ্ছ সমন্বিত প্রশ্ন সেট ১", slug: "agri-set-1", unitCode: "AGRI Set-1", orderIndex: 1 },
      { seriesId: "KwhAs3", name: "কৃষি গুচ্ছ সমন্বিত প্রশ্ন সেট ২", slug: "agri-set-2", unitCode: "AGRI Set-2", orderIndex: 2 },
      { seriesId: "a6uBJi", name: "কৃষি গুচ্ছ সমন্বিত প্রশ্ন সেট ৩", slug: "agri-set-3", unitCode: "AGRI Set-3", orderIndex: 3 },
      { seriesId: "guNnRd", name: "কৃষি গুচ্ছ সমন্বিত প্রশ্ন সেট ৪", slug: "agri-set-4", unitCode: "AGRI Set-4", orderIndex: 4 },
      { seriesId: "S-vsOH", name: "কৃষি গুচ্ছ সমন্বিত প্রশ্ন সেট ৫", slug: "agri-set-5", unitCode: "AGRI Set-5", orderIndex: 5 },
      { seriesId: "sQLfGL", name: "কৃষি গুচ্ছ সমন্বিত প্রশ্ন সেট ৬", slug: "agri-set-6", unitCode: "AGRI Set-6", orderIndex: 6 },
    ],
  },
  {
    name: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (SUST)",
    slug: "varsity-sust",
    description: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (SUST) বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Shahjalal University of Science & Technology (SUST)",
    orderIndex: 8,
    units: [
      { seriesId: "Hfepd1GPb4", name: "শাবিপ্রবি এ ইউনিট", slug: "sust-a-unit", unitCode: "SUST A", orderIndex: 1 },
      { seriesId: "zvt0pu", name: "শাবিপ্রবি বি ইউনিট", slug: "sust-b-unit", unitCode: "SUST B", orderIndex: 2 },
    ],
  },
  {
    name: "খুলনা বিশ্ববিদ্যালয় (KU)",
    slug: "varsity-ku",
    description: "খুলনা বিশ্ববিদ্যালয় (KU) এর সকল স্কুলের বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Khulna University (KU)",
    orderIndex: 9,
    units: [
      { seriesId: "derI2T", name: "খুবি এ ইউনিট (বিজ্ঞান, প্রকৌশল ও প্রযুক্তি)", slug: "ku-a-unit", unitCode: "KU A", orderIndex: 1 },
      { seriesId: "eyQExv", name: "খুবি বি ইউনিট (কলা ও মানবিক)", slug: "ku-b-unit", unitCode: "KU B", orderIndex: 2 },
      { seriesId: "F0K8OL", name: "খুবি সি ইউনিট (ব্যবস্থাপনা ও ব্যবসায় প্রশাসন)", slug: "ku-c-unit", unitCode: "KU C", orderIndex: 3 },
      { seriesId: "ZI1YUR", name: "খুবি ডি ইউনিট (জীববিজ্ঞান ও অন্যান্য)", slug: "ku-d-unit", unitCode: "KU D", orderIndex: 4 },
    ],
  },
  {
    name: "জগন্নাথ বিশ্ববিদ্যালয় (JnU)",
    slug: "varsity-jnu",
    description: "জগন্নাথ বিশ্ববিদ্যালয় (JnU) এর সকল ইউনিটের বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Jagannath University (JnU)",
    orderIndex: 10,
    units: [
      { seriesId: "Lm8NfA", name: "জবি এ ইউনিট (বিজ্ঞান অনুষদ)", slug: "jnu-a-unit", unitCode: "JnU A", orderIndex: 1 },
      { seriesId: "IigAnt", name: "জবি বি ইউনিট (কলা ও মানবিক অনুষদ)", slug: "jnu-b-unit", unitCode: "JnU B", orderIndex: 2 },
      { seriesId: "Z_gF1L", name: "জবি সি ইউনিট (ব্যবসায় শিক্ষা অনুষদ)", slug: "jnu-c-unit", unitCode: "JnU C", orderIndex: 3 },
      { seriesId: "eHC8EQ", name: "জবি ডি ইউনিট (সামাজিক বিজ্ঞান অনুষদ)", slug: "jnu-d-unit", unitCode: "JnU D", orderIndex: 4 },
    ],
  },
  {
    name: "হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (HSTU)",
    slug: "varsity-hstu",
    description: "হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (HSTU) বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Hajee Mohammad Danesh Science & Technology University (HSTU)",
    orderIndex: 11,
    units: [
      { seriesId: "hfDxiFbvG6", name: "হাবিপ্রবি এ ইউনিট", slug: "hstu-a-unit", unitCode: "HSTU A", orderIndex: 1 },
      { seriesId: "diSQAR", name: "হাবিপ্রবি বি ইউনিট", slug: "hstu-b-unit", unitCode: "HSTU B", orderIndex: 2 },
      { seriesId: "w9_rKr", name: "হাবিপ্রবি সি ইউনিট", slug: "hstu-c-unit", unitCode: "HSTU C", orderIndex: 3 },
      { seriesId: "oGUk39", name: "হাবিপ্রবি ডি ইউনিট", slug: "hstu-d-unit", unitCode: "HSTU D", orderIndex: 4 },
    ],
  },
  {
    name: "কুমিল্লা বিশ্ববিদ্যালয় (CoU)",
    slug: "varsity-cou",
    description: "কুমিল্লা বিশ্ববিদ্যালয় (CoU) বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Comilla University (CoU)",
    orderIndex: 12,
    units: [
      { seriesId: "6jEZlWKizO", name: "কুবি এ ইউনিট (বিজ্ঞান অনুষদ)", slug: "cou-a-unit", unitCode: "CoU A", orderIndex: 1 },
      { seriesId: "br0bt_", name: "কুবি বি ইউনিট (কলা ও সমাজবিজ্ঞান)", slug: "cou-b-unit", unitCode: "CoU B", orderIndex: 2 },
      { seriesId: "dOlkkt", name: "কুবি সি ইউনিট (ব্যবসায় শিক্ষা)", slug: "cou-c-unit", unitCode: "CoU C", orderIndex: 3 },
    ],
  },
  {
    name: "আইবিএ ভর্তি পরীক্ষা (IBA Admission)",
    slug: "varsity-iba",
    description: "আইবিএ ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ব্যাংক (DU IBA, JU IBA, RU IBA)",
    institution: "Institute of Business Administration (IBA)",
    orderIndex: 13,
    units: [
      { seriesId: "el-jTj", name: "ঢাবি আইবিএ (DU IBA BBA)", slug: "du-iba", unitCode: "DU IBA", orderIndex: 1 },
      { seriesId: "h6uHqz", name: "জাবি আইবিএ (JU IBA BBA)", slug: "ju-iba", unitCode: "JU IBA", orderIndex: 2 },
      { seriesId: "qZ32co", name: "রাবি আইবিএ (RU IBA BBA)", slug: "ru-iba", unitCode: "RU IBA", orderIndex: 3 },
    ],
  },
  {
    name: "বঙ্গবন্ধু শেখ মুজিবুর রহমান মেরিটাইম ইউনিভার্সিটি (BSMRMU)",
    slug: "varsity-maritime",
    description: "মেরিটাইম বিশ্ববিদ্যালয় (BSMRMU) এর সকল অনুষদের বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Bangabandhu Sheikh Mujibur Rahman Maritime University (BSMRMU)",
    orderIndex: 14,
    units: [
      { seriesId: "wGlTcw", name: "মেরিটাইম ফ্যাকাল্টি অব আর্থ অ্যান্ড ওশান সায়েন্স (FEOS)", slug: "maritime-feos", unitCode: "BSMRMU FEOS", orderIndex: 1 },
      { seriesId: "1gM0fr", name: "মেরিটাইম ফ্যাকাল্টি অব ইঞ্জিনিয়ারিং অ্যান্ড টেকনোলজি (FET)", slug: "maritime-fet", unitCode: "BSMRMU FET", orderIndex: 2 },
      { seriesId: "Nd9R6A", name: "মেরিটাইম ফ্যাকাল্টি অব মেরিটাইম গভর্ন্যান্স অ্যান্ড পলিসি (FMGP)", slug: "maritime-fmgp", unitCode: "BSMRMU FMGP", orderIndex: 3 },
      { seriesId: "CikuSV", name: "মেরিটাইম ফ্যাকাল্টি অব শিপিং অ্যাডমিনিস্ট্রেশন (FSA)", slug: "maritime-fsa", unitCode: "BSMRMU FSA", orderIndex: 4 },
    ],
  },
  {
    name: "ঢাকা বিশ্ববিদ্যালয় অধিভুক্ত ৭ কলেজ (বিজ্ঞান)",
    slug: "varsity-du-7-college",
    description: "ঢাকা বিশ্ববিদ্যালয় অধিভুক্ত সরকারি ৭ কলেজ বিজ্ঞান ইউনিট বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ব্যাংক",
    institution: "DU Affiliated 7 Colleges",
    orderIndex: 15,
    units: [
      { seriesId: "6UYZkI", name: "ঢাবি ৭ কলেজ বিজ্ঞান ইউনিট", slug: "du-7-college-science", unitCode: "7 College Science", orderIndex: 1 },
    ],
  },
  {
    name: "বুটেক্স অধিভুক্ত টেক্সটাইল ইঞ্জিনিয়ারিং কলেজ",
    slug: "varsity-butex-affiliated",
    description: "বুটেক্স অধিভুক্ত সরকারি টেক্সটাইল ইঞ্জিনিয়ারিং কলেজসমূহ বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ব্যাংক",
    institution: "BUTEX Affiliated Textile Engineering Colleges",
    orderIndex: 16,
    units: [
      { seriesId: "RLQ4MK", name: "টেক্সটাইল ইঞ্জিনিয়ারিং কলেজ সমন্বিত ভর্তি পরীক্ষা", slug: "butex-affiliated-colleges", unitCode: "TET College", orderIndex: 1 },
    ],
  },
  {
    name: "নার্সিং ভর্তি পরীক্ষা (Nursing Admission)",
    slug: "varsity-nursing",
    description: "বিএসসি নার্সিং ও ডিপ্লোমা নার্সিং ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ব্যাংক",
    institution: "Bangladesh Nursing & Midwifery Council",
    orderIndex: 17,
    units: [
      { seriesId: "ev7pRg", name: "বিএসসি ইন নার্সিং (BSc in Nursing)", slug: "bsc-nursing", unitCode: "BSc Nursing", orderIndex: 1 },
      { seriesId: "p2iwSk", name: "ডিপ্লোমা ইন নার্সিং ও মিডওয়াইফারি", slug: "diploma-nursing", unitCode: "Diploma Nursing", orderIndex: 2 },
    ],
  },
];

function getNormalizedTag(rawTagStr: string, unitCode: string): string {
  const tagsList = rawTagStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let primary = tagsList.find((t) => {
    const u = t.toUpperCase();
    return u.includes(unitCode.toUpperCase());
  });

  if (!primary && tagsList.length > 0) {
    primary = tagsList[0];
  }

  if (!primary) {
    return `${unitCode} Practice Set`;
  }

  let tag = primary;
  const yearMatch = tag.match(/\d{2}-\d{2}|\d{4}/);
  if (yearMatch) {
    return `${unitCode} ${yearMatch[0]}`;
  }

  return `${unitCode} ${tag}`;
}

async function ensureContainerAndItem(bank: BankConfig, unit: UnitConfig, targetId: string) {
  let [container] = await db
    .select()
    .from(qbContainers)
    .where(eq(qbContainers.slug, bank.slug));

  if (!container) {
    const newId = uuidv7();
    [container] = await db
      .insert(qbContainers)
      .values({
        id: newId,
        targetId: targetId,
        name: bank.name,
        slug: bank.slug,
        description: bank.description,
        orderIndex: bank.orderIndex,
        itemCount: bank.units.length,
        questionCount: 0,
      })
      .returning();
    console.log(`Created Container: "${container.name}" (${container.slug})`);
  }

  let [item] = await db
    .select()
    .from(qbContainerItems)
    .where(eq(qbContainerItems.slug, unit.slug));

  if (!item) {
    const newItemId = uuidv7();
    [item] = await db
      .insert(qbContainerItems)
      .values({
        id: newItemId,
        containerId: container.id,
        name: unit.name,
        slug: unit.slug,
        description: `${unit.name} বিগত বছরের প্রশ্ন ব্যাংক`,
        orderIndex: unit.orderIndex,
        examSheetCount: 0,
        questionCount: 0,
      })
      .returning();
    console.log(`  Created Container Item: "${item.name}" (${item.slug})`);
  } else {
    if (item.containerId !== container.id) {
      await db
        .update(qbContainerItems)
        .set({ containerId: container.id })
        .where(eq(qbContainerItems.id, item.id));
    }
  }

  return { container, item };
}

async function scrapeUnit(bank: BankConfig, unit: UnitConfig, targetId: string) {
  const { item } = await ensureContainerAndItem(bank, unit, targetId);

  console.log(`\n======================================================`);
  console.log(`>>> Ingesting: ${bank.name} -> ${unit.name} (Series: ${unit.seriesId})`);
  console.log(`======================================================`);

  const allTopics = await db.select().from(qbTopics);
  const allChapters = await db.select().from(qbChapters);
  const allSources = await db.select().from(qbSources);

  const topicSlugMap = new Map(allTopics.map((t) => [t.slug, t]));
  const topicIdMap = new Map(allTopics.map((t) => [t.id, t]));
  const chapterIdMap = new Map(allChapters.map((c) => [c.id, c]));
  const chapterSlugMap = new Map(allChapters.map((c) => [c.slug, c]));
  const sourceSlugMap = new Map(allSources.map((s) => [s.slug, s]));

  let nodesMap: Record<string, string> = {};
  let parentMap: Record<string, string> = {};
  try {
    const topicRes = await fetch(`https://api.chorcha.net/topics/series/${unit.seriesId}`, {
      headers: { Authorization: `Bearer ${CHORCHA_TOKEN}` },
    });
    const topicJson = await topicRes.json();
    nodesMap = topicJson.data?.data?.nodes || {};
    parentMap = topicJson.data?.data?.parent || {};
  } catch (err) {
    // topic fallback
  }

  function resolveChapterAndTopic(chorchaTopicSlug: string | null | undefined): { topicId: string | null; chapterId: string | null } {
    if (!chorchaTopicSlug) return { topicId: null, chapterId: null };

    const dbTopic = topicSlugMap.get(chorchaTopicSlug);
    if (dbTopic) {
      if (dbTopic.chapterId) return { topicId: dbTopic.id, chapterId: dbTopic.chapterId };
      let curr = dbTopic;
      while (curr && curr.parentId) {
        if (chapterIdMap.has(curr.parentId)) return { topicId: dbTopic.id, chapterId: curr.parentId };
        curr = topicIdMap.get(curr.parentId)!;
      }
      return { topicId: dbTopic.id, chapterId: null };
    }

    const dbChapter = chapterSlugMap.get(chorchaTopicSlug);
    if (dbChapter) return { topicId: null, chapterId: dbChapter.id };

    let currentChorchaId = chorchaTopicSlug;
    while (currentChorchaId && parentMap[currentChorchaId]) {
      const parentId = parentMap[currentChorchaId];
      if (topicSlugMap.has(parentId)) {
        const pTopic = topicSlugMap.get(parentId)!;
        return { topicId: pTopic.id, chapterId: pTopic.chapterId ?? null };
      }
      if (chapterSlugMap.has(parentId)) {
        const pChap = chapterSlugMap.get(parentId)!;
        return { topicId: null, chapterId: pChap.id };
      }
      currentChorchaId = parentId;
    }

    return { topicId: null, chapterId: null };
  }

  let page = 1;
  const allQuestions: any[] = [];

  while (true) {
    const url = `https://api.chorcha.net/read/series/${unit.seriesId}?topic=root&page=${page}&filters=&label_filter=`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${CHORCHA_TOKEN}` },
      });

      if (!res.ok) break;

      const key = res.headers.get("x-chorcha-id");
      const json = await res.json();
      const questions = json.data?.questions || [];

      if (!questions || questions.length === 0) break;

      for (const q of questions) {
        q._decryptedQuestion = decodeChorcha(q.question, key);
        q._decryptedA = decodeChorcha(q.A, key);
        q._decryptedB = decodeChorcha(q.B, key);
        q._decryptedC = decodeChorcha(q.C, key);
        q._decryptedD = decodeChorcha(q.D, key);
        q._decryptedSolution = cleanSolutionText(decodeChorcha(q.solution, key));
        allQuestions.push(q);
      }

      console.log(`  Fetched page ${page}: ${questions.length} items (Total: ${allQuestions.length})`);
      page++;
      await new Promise((r) => setTimeout(r, 60));
    } catch (err) {
      console.error(`Error on page ${page}:`, err);
      break;
    }
  }

  console.log(`\nDownloaded ${allQuestions.length} total questions for ${unit.name}.`);

  if (allQuestions.length === 0) return;

  const examGroups = new Map<string, any[]>();
  for (const q of allQuestions) {
    const rawTagStr = String(q.tags || q.tag || "").trim();
    const primaryTag = getNormalizedTag(rawTagStr, unit.unitCode);

    if (!examGroups.has(primaryTag)) {
      examGroups.set(primaryTag, []);
    }
    examGroups.get(primaryTag)!.push(q);
  }

  console.log(`Identified ${examGroups.size} distinct Exam Sets for ${unit.name}:`);
  for (const [tag, list] of examGroups.entries()) {
    console.log(`  • ${tag} -> ${list.length} questions`);
  }

  let sheetOrder = 1;
  let totalSaved = 0;

  for (const [groupTag, qList] of examGroups.entries()) {
    const sheetTitle = groupTag;
    const sheetSlug = slugify(`${unit.slug}-${groupTag}`);

    let hasMCQInSheet = false;
    let hasWrittenInSheet = false;
    for (const q of qList) {
      const decA = (q._decryptedA || "").trim();
      const decB = (q._decryptedB || "").trim();
      const isMCQ = decA.length > 0 && decB.length > 0 && !isDummyOption(decA) && !isDummyOption(decB);
      if (isMCQ) hasMCQInSheet = true;
      else hasWrittenInSheet = true;
    }

    const sheetExamType = (hasMCQInSheet && !hasWrittenInSheet) ? "mcq" : (hasWrittenInSheet && !hasMCQInSheet ? "written" : "mcq");

    let [examSheet] = await db
      .select()
      .from(qbExamSheets)
      .where(eq(qbExamSheets.slug, sheetSlug));

    if (!examSheet) {
      const newEsId = uuidv7();
      [examSheet] = await db
        .insert(qbExamSheets)
        .values({
          id: newEsId,
          containerItemId: item.id,
          title: sheetTitle,
          slug: sheetSlug,
          examType: sheetExamType,
          durationMinutes: 60,
          totalMarks: String(qList.length),
          negativeMarks: "0.25",
          orderIndex: sheetOrder++,
          questionCount: qList.length,
        })
        .returning();
      console.log(`\nCreated Exam Sheet: "${sheetTitle}" [${sheetExamType.toUpperCase()}] (${qList.length} questions)`);
    } else {
      console.log(`\nExam Sheet "${sheetTitle}" exists (${examSheet.id}). Checking questions...`);
    }

    const existingSheetQuestions = await db
      .select({ questionId: qbExamSheetQuestions.questionId })
      .from(qbExamSheetQuestions)
      .where(eq(qbExamSheetQuestions.examSheetId, examSheet.id));

    if (existingSheetQuestions.length > 0) {
      if (existingSheetQuestions.length >= qList.length) {
        console.log(`  Exam Sheet already has ${existingSheetQuestions.length} questions. Skipping.`);
        continue;
      }
      const qIdsToDelete = existingSheetQuestions.map((esq) => esq.questionId);
      if (qIdsToDelete.length > 0) {
        await db.delete(qbExamSheetQuestions).where(eq(qbExamSheetQuestions.examSheetId, examSheet.id));
        await db.delete(qbQuestionOptions).where(inArray(qbQuestionOptions.questionId, qIdsToDelete));
        await db.delete(qbQuestionParts).where(inArray(qbQuestionParts.questionId, qIdsToDelete));
        await db.delete(qbQuestionChapters).where(inArray(qbQuestionChapters.questionId, qIdsToDelete));
        await db.delete(qbQuestionSources).where(inArray(qbQuestionSources.questionId, qIdsToDelete));
        await db.delete(qbQuestions).where(inArray(qbQuestions.id, qIdsToDelete));
      }
    }

    for (let qIdx = 0; qIdx < qList.length; qIdx++) {
      const q = qList[qIdx];
      const qId = uuidv7();

      const { topicId, chapterId } = resolveChapterAndTopic(q.topic);
      const cleanQuestion = await migrateImagesInText(q._decryptedQuestion);
      const cleanSolution = q._decryptedSolution ? await migrateImagesInText(q._decryptedSolution) : null;

      const decA = (q._decryptedA || "").trim();
      const decB = (q._decryptedB || "").trim();
      const decC = (q._decryptedC || "").trim();
      const decD = (q._decryptedD || "").trim();

      const isMCQ = decA.length > 0 && decB.length > 0 && !isDummyOption(decA) && !isDummyOption(decB);
      const qType = isMCQ ? "mcq" : "written";

      await db.insert(qbQuestions).values({
        id: qId,
        topicId: topicId,
        qType: qType,
        questionText: cleanQuestion,
        explanation: cleanSolution,
        orderIndex: qIdx + 1,
        status: "published",
      });

      if (isMCQ) {
        const optTexts = [
          { key: "A", text: await migrateImagesInText(decA), orderIndex: 1 },
          { key: "B", text: await migrateImagesInText(decB), orderIndex: 2 },
          { key: "C", text: await migrateImagesInText(decC), orderIndex: 3 },
          { key: "D", text: await migrateImagesInText(decD), orderIndex: 4 },
        ].filter((o) => o.text && o.text.trim().length > 0);

        for (const opt of optTexts) {
          await db.insert(qbQuestionOptions).values({
            id: uuidv7(),
            questionId: qId,
            optionText: opt.text,
            isCorrect: opt.key === (q.answer || "").trim(),
            orderIndex: opt.orderIndex,
          });
        }
      } else {
        const parts = [
          { text: await migrateImagesInText(decA), marks: "1", orderIndex: 1 },
          { text: await migrateImagesInText(decB), marks: "2", orderIndex: 2 },
          { text: await migrateImagesInText(decC), marks: "3", orderIndex: 3 },
          { text: await migrateImagesInText(decD), marks: "4", orderIndex: 4 },
        ].filter((p) => p.text && p.text.trim().length > 0);

        for (const p of parts) {
          await db.insert(qbQuestionParts).values({
            id: uuidv7(),
            questionId: qId,
            partText: p.text,
            marks: p.marks,
            orderIndex: p.orderIndex,
          });
        }
      }

      if (chapterId) {
        await db
          .insert(qbQuestionChapters)
          .values({
            questionId: qId,
            chapterId: chapterId,
          })
          .onConflictDoNothing();
      }

      await db.insert(qbExamSheetQuestions).values({
        examSheetId: examSheet.id,
        questionId: qId,
        questionNumber: qIdx + 1,
      });

      const rawTags: string[] = [];
      if (q.tags) {
        if (typeof q.tags === "string") rawTags.push(...q.tags.split(",").map((s: string) => s.trim()));
        else if (Array.isArray(q.tags)) rawTags.push(...q.tags.map((s: unknown) => String(s).trim()));
      }
      if (q.tag) rawTags.push(String(q.tag).trim());

      const cleanTags = Array.from(new Set(rawTags.filter((t) => t && t.length > 0)));
      for (const tagStr of cleanTags) {
        const tagSlug = slugify(tagStr);
        let source = sourceSlugMap.get(tagSlug);
        if (!source) {
          const yearMatch = tagStr.match(/\d{2,4}/)?.[0] || "2024";
          const parsedYear = yearMatch.length === 2 ? 2000 + parseInt(yearMatch, 10) : parseInt(yearMatch, 10);

          [source] = await db
            .insert(qbSources)
            .values({
              id: uuidv7(),
              sourceGroup: "admission",
              type: "university",
              name: tagStr,
              slug: tagSlug,
              institution: bank.institution,
              unit: unit.name,
              year: parsedYear,
              questionCount: 0,
            })
            .returning();
          sourceSlugMap.set(tagSlug, source);
        }

        await db
          .insert(qbQuestionSources)
          .values({
            questionId: qId,
            sourceId: source.id,
          })
          .onConflictDoNothing();

        if (chapterId) {
          await db
            .insert(qbChapterSources)
            .values({
              chapterId: chapterId,
              sourceId: source.id,
            })
            .onConflictDoNothing();
        }
      }

      totalSaved++;
      if (totalSaved % 50 === 0) {
        process.stdout.write(`    Saved ${totalSaved} questions so far...\r`);
      }
    }
  }

  console.log(`\nCompleted ingestion for ${unit.name}! Total questions saved: ${totalSaved}`);
}

async function main() {
  console.log("=== PAWS ACADEMY ADMISSION QB FULL INGESTION & S3 SYNC ===");

  const [varsityTarget] = await db
    .select()
    .from(qbContainers)
    .where(eq(qbContainers.slug, "varsity-du"));

  if (!varsityTarget) {
    throw new Error("Could not locate varsity target reference!");
  }
  const targetId = varsityTarget.targetId;

  for (const bank of ALL_TARGET_BANKS) {
    console.log(`\n######################################################`);
    console.log(`### STARTING QUESTION BANK: ${bank.name}`);
    console.log(`######################################################`);

    for (const unit of bank.units) {
      await scrapeUnit(bank, unit, targetId);
    }
  }

  console.log("\n======================================================");
  console.log("All Remaining Admission Question Banks scraped & synced successfully!");
  console.log("Recalculating all question & exam counts in database...");
  await recalculateAllCounts();
  console.log("All counts recalculated! All Admission QBs are live and ready.");
  console.log("======================================================");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL SCRAPER ERROR:", err);
    process.exit(1);
  });
