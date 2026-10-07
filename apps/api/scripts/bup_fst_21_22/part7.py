# -*- coding: utf-8 -*-
part7 = [
    {
        "index": 61,
        "questionText": "$\\lim_{x \\to 0} \\frac{xe^{-x}}{x} = ?$",
        "options": [
            {"key": "A", "text": "0"},
            {"key": "B", "text": "1"},
            {"key": "C", "text": "-1"},
            {"key": "D", "text": "2"}
        ],
        "answer": "B",
        "explanation": r"""প্রদত্ত লিমিট রাশিটি হলো:

$$\lim_{x \to 0} \frac{xe^{-x}}{x}$$

যেহেতু $x \to 0$ কিন্তু $x \ne 0$, তাই লব ও হরের সাধারণ উৎপাদক $x$ কেটে সরলীকরণ করা যায়:

$$\lim_{x \to 0} \frac{xe^{-x}}{x} = \lim_{x \to 0} e^{-x}$$

এখন সরাসরি সীমা $x = 0$ বসিয়ে পাই:

$$e^{-0} = e^0 = 1$$

- (A) 0: $x = 0$ সরাসরি লবে ভুলভাবে বসালে শূন্য মনে হতে পারে, যা ভুল।
- (C) -1: সূচকের ঋণাত্মক চিহ্নের কারণে সহগে $-1$ ভেবে নেওয়া ভুল।
- (D) 2: ভিত্তিহীন মান।""",
        "chapter": "অন্তরীকরণ",
        "topic": "লিমিট"
    },
    {
        "index": 62,
        "questionText": "$\\frac{d}{dx} \\left( \\frac{1}{x} \\ln x \\right)$ এর মান কত?",
        "options": [
            {"key": "A", "text": "$\\frac{1 - \\ln x}{x^2}$"},
            {"key": "B", "text": "$\\frac{1 + \\ln x}{x^2}$"},
            {"key": "C", "text": "$\\frac{1 - \\ln x}{x}$"},
            {"key": "D", "text": "$\\frac{1 + \\ln x}{x}$"}
        ],
        "answer": "A",
        "explanation": r"""প্রদত্ত ফাংশনটিকে ভাগফল আকারে লেখা যায়:

$$y = \frac{\ln x}{x}$$

ভাগফলের অন্তরীকরণ সূত্রানুযায়ী ($\frac{d}{dx}\left(\frac{u}{v}\right) = \frac{v \frac{du}{dx} - u \frac{dv}{dx}}{v^2}$):

$$\frac{d}{dx}\left(\frac{\ln x}{x}\right) = \frac{x \cdot \frac{d}{dx}(\ln x) - \ln x \cdot \frac{d}{dx}(x)}{x^2}$$

আমরা জানি, $\frac{d}{dx}(\ln x) = \frac{1}{x}$ এবং $\frac{d}{dx}(x) = 1$।

$$\frac{d}{dx}\left(\frac{\ln x}{x}\right) = \frac{x \cdot \left(\frac{1}{x}\right) - \ln x \cdot (1)}{x^2} = \frac{1 - \ln x}{x^2}$$

- (B) $\frac{1 + \ln x}{x^2}$: ভাগফলের সূত্রে বিয়োগ চিহ্নের স্থানে যোগ চিহ্নের ভুল ব্যবহার।
- (C) $\frac{1 - \ln x}{x}$: হরে $v^2 = x^2$ এর পরিবর্তে শুধু $x$ লেখা হয়েছে।
- (D) $\frac{1 + \ln x}{x}$: উভয় ধরনের সূত্রের চিহ্নের ভুল প্রয়োগ।""",
        "chapter": "অন্তরীকরণ",
        "topic": "গুণফল ,ভাগফল ও সংযোজিত ফাংশনের অন্তরজ/Chain Rule"
    },
    {
        "index": 63,
        "questionText": "Genuine : Authentic :: Mirage : ?",
        "options": [
            {"key": "A", "text": "Image"},
            {"key": "B", "text": "Mirror"},
            {"key": "C", "text": "Illusion"},
            {"key": "D", "text": "Reflection"}
        ],
        "answer": "C",
        "explanation": r"""This is a vocabulary analogy question based on synonymy relationships:
"Genuine" and "Authentic" are exact synonyms representing something real, true, and original.

Following the exact same semantic relationship, a "Mirage" (মরীচিকা - an optical deception caused by atmospheric refraction) is synonymous with an "Illusion" (মায়া বা বিভ্রম - a deceptive appearance or impression of reality).

- (A) Image: Refers to a visual representation or picture, not specifically a deceptive apparition.
- (B) Mirror: A physical reflective glass object, not an optical deception.
- (D) Reflection: A physical optical process of light bouncing off surfaces, not a synonym for mirage.""",
        "chapter": "Analogy",
        "topic": "Synonym Analogy"
    },
    {
        "index": 64,
        "questionText": "মাসকুলার ডিসট্রফি রোগটি কাদের বেশি হয়?",
        "options": [
            {"key": "A", "text": "পুরুষের"},
            {"key": "B", "text": "ছেলে  শিশুদের"},
            {"key": "C", "text": "নারীদের"},
            {"key": "D", "text": "সবার"}
        ],
        "answer": "B",
        "explanation": r"""ডুশেন মাসকুলার ডিসট্রফি (Duchenne Muscular Dystrophy - DMD) হলো একটি এক্স-লিঙ্কড প্রচ্ছন্ন (X-linked recessive) বংশগত রোগ যা পেশির প্রোটিন 'ডিস্ট্রোফিন' তৈরিতে বাধার সৃষ্টি করে।

যেহেতু ছেলেরা হেমিজাইগাস ($XY$) এবং তাদের একটিমাত্র এক্স ক্রোমোজোম থাকে, তাই একটি প্রচ্ছন্ন মিউট্যান্ট জিন থাকলেই রোগটি লক্ষণ প্রকাশ করে। এটি প্রধানত শৈশবে (সাধারণত ২ থেকে ৫ বছর বয়সে) ছেলে শিশুদের ক্ষেত্রে বেশি এবং সুস্পষ্টভাবে প্রকাশ পায়।

- (A) পুরুষের: বয়স্ক পুরুষের তুলনায় শৈশবেই এটি প্রকাশ পায় এবং আক্রান্তরা কৈশোরে চলনশক্তি হারিয়ে দ্রুত মারা যায়।
- (C) নারীদের: নারীদের দুটি এক্স ক্রোমোজোম থাকায় তারা প্রধানত সুস্থ বাহক হয়, সচরাচর আক্রান্ত হয় না।
- (D) সবার: এটি কোনো সর্বজনীন রোগ নয়, সুনির্দিষ্টভাবে সেক্স-লিঙ্কড প্রচ্ছন্ন জেনেটিক ব্যাধি।""",
        "chapter": "জিনতত্ত্ব ও বিবর্তন",
        "topic": "লিঙ্গ নির্ধারণ নীতি, সেক্সলিঙ্কড ডিসঅর্ডার ও রক্তের বংশগতি জনিত সমস্যা"
    },
    {
        "index": 65,
        "questionText": "There are _______ views on the issue of giving bonus to the employees.",
        "options": [
            {"key": "A", "text": "independent"},
            {"key": "B", "text": "divergent"},
            {"key": "C", "text": "modest"},
            {"key": "D", "text": "adverse"}
        ],
        "answer": "B",
        "explanation": r"""When referring to viewpoints, opinions, or perspectives that vary widely, disagree, or branch off into differing directions among different people on a contentious topic, the standard adjective used is "divergent" (divergent views / differing opinions).

Therefore, "There are divergent views on the issue..." logically and idiomatically completes the sentence.

- (A) independent: Means not influenced or controlled by others; does not convey mutual variety of disagreement among views.
- (C) modest: Means moderate or humble, unsuited to describe conflicting opinions on employee bonuses.
- (D) adverse: Means hostile, unfavorable, or detrimental (e.g., adverse effects), not variety of opinions.""",
        "chapter": "Spelling & Vocabulary Usage",
        "topic": "Contextual Vocabulary & Collocations"
    },
    {
        "index": 66,
        "questionText": "একটি মহাকাশ যানের ভর $2 \\times 10^3$ kg। জ্বালানির ভর 50 kg এবং ভর হ্রাসের হার 300 kg/min. মহাকাশযানটি 200 m/s দ্রুতিতে যাত্রা শুরু করলে রকেটের উদ্ধমুখী ধাক্কা কত?",
        "options": [
            {"key": "A", "text": "1000 N"},
            {"key": "B", "text": "100 N"},
            {"key": "C", "text": "800 N"},
            {"key": "D", "text": "200 N"}
        ],
        "answer": "A",
        "explanation": r"""রকেটের ঊর্ধ্বমুখী ধাক্কা বল ($F$) নির্গত গ্যাসের ভর হ্রাসের হার এবং গ্যাস নির্গমনের আপেক্ষিক বেগের গুণফলের সমান:

$$F = \left(\frac{\Delta m}{\Delta t}\right) v$$

এখানে দেওয়া আছে:
গ্যাসের আপেক্ষিক বেগ, $v = 200\text{ m/s}$
ভর হ্রাসের হার প্রতি মিনিটে: $\frac{\Delta m}{\Delta t} = 300\text{ kg/min}$

প্রতি সেকেন্ডে ভর হ্রাসের হার:

$$\frac{\Delta m}{\Delta t} = \frac{300\text{ kg}}{60\text{ s}} = 5\text{ kg/s}$$

মান বসিয়ে ঊর্ধ্বমুখী ধাক্কা পাই:

$$F = 5\text{ kg/s} \times 200\text{ m/s} = 1000\text{ N}$$

- (B) 100 N: সময়কে মিনিটে রেখে হিসাব করার ভুল অথবা ভাগ করার ত্রুটি।
- (C) 800 N: মহাকাশযানের ভরজনিত অপ্রয়োজনীয় বিয়োগের ভুল।
- (D) 200 N: শুধুমাত্র বেগের মানকে বল বিবেচনা করার ভুল।""",
        "chapter": "নিউটনিয়ান বলবিদ্যা",
        "topic": "বলের ঘাত ও ঘাত বল এবং ভরবেগ"
    },
    {
        "index": 67,
        "questionText": "3x-24=0 এর চরমমান কত?",
        "options": [
            {"key": "A", "text": "2"},
            {"key": "B", "text": "3"},
            {"key": "C", "text": "0"},
            {"key": "D", "text": "মান নেই"}
        ],
        "answer": "D",
        "explanation": r"""কোনো ফাংশন $f(x)$ এর চরম মান (গুরুমান বা লঘুমান) থাকার প্রয়োজনীয় শর্ত হলো প্রথম অন্তরজের মান শূন্য হতে হবে:

$$f'(x) = 0$$

এখানে প্রদত্ত একঘাত রৈখিক ফাংশনটি হলো $f(x) = 3x - 24$।
এর প্রথম অন্তরজ:

$$f'(x) = \frac{d}{dx}(3x - 24) = 3$$

যেহেতু $f'(x) = 3 \ne 0$ (ধ্রুবক), তাই চলক $x$ এর কোনো বাস্তব মানের জন্যই প্রথম অন্তরজ শূন্য হওয়া সম্ভব নয়।
একটি সরলরেখার ঢাল সর্বদা নির্দিষ্ট এবং এর কোনো সর্বোচ্চ বা সর্বনিম্ন বাঁক নেই। অতএব প্রদত্ত ফাংশনটির কোনো চরম মান নেই।

- (A) 2: ভিত্তিহীন মান।
- (B) 3: এটি প্রথম অন্তরজ $f'(x)$ এর মান, চরমমান নয়।
- (C) 0: সমীকরণের ধ্রুবক সমাধানের সাথে চরমমানের বিভ্রান্তি।""",
        "chapter": "অন্তরীকরণ",
        "topic": "লঘুমান গুরুমান বিষয়ক"
    },
    {
        "index": 68,
        "questionText": "নিষেকের পরে কোন রূপান্তরটি সঠিক?",
        "options": [
            {"key": "A", "text": "ডিম্বক - ভ্রুন"},
            {"key": "B", "text": "প্লাসেন্টা থেকে বীজ"},
            {"key": "C", "text": "সেকেন্ডারী নিউক্লিয়াস-এন্ডোাস্পর্ম /শস্য"},
            {"key": "D", "text": "ডিম্বানু - বীজ"}
        ],
        "answer": "C",
        "explanation": r"""আবৃতবীজী উদ্ভিদের দ্বিনিষেকের পর ভ্রূণথলির উপাদানগুলোর নির্দিষ্ট রূপান্তর ঘটে:
- ডিপ্লয়েড সেকেন্ডারি নিউক্লিয়াস ($2n$) একটি পুংগ্যামেটের ($n$) সাথে মিলিত হয়ে ট্রিপ্লয়েড ($3n$) এন্ডোস্পার্ম বা শস্য নিউক্লিয়াস গঠন করে, যা পরবর্তীকালে পুষ্টিকর এন্ডোস্পার্ম বা শস্যে পরিণত হয়।
- ডিম্বাণু পুংগ্যামেটের সাথে মিলিত হয়ে ভ্রূণ গঠন করে (বীজ নয়)।
- সমগ্র ডিম্বকটি বীজে পরিণত হয় (ভ্রূণে নয়)।

অতএব "সেকেন্ডারি নিউক্লিয়াস - এন্ডোস্পার্ম / শস্য" জোড়াটি সম্পূর্ণ সঠিক।

- (A) ডিম্বক - ভ্রুন: ডিম্বক পরিণত হয় বীজে, ভ্রূণে নয়।
- (B) প্লাসেন্টা থেকে বীজ: প্লাসেন্টা ফলের সাথে সম্পর্কিত থাকে, বীজ ডিম্বক হতে উৎপন্ন হয়।
- (D) ডিম্বানু - বীজ: ডিম্বাণু পরিণত হয় ভ্রূণে, বীজে নয়।""",
        "chapter": "উদ্ভিদ প্রজনন",
        "topic": "নিষেক ও নিষেকের পরিণতি"
    },
    {
        "index": 69,
        "questionText": "আধুনিক জেট বিমান কোন সূত্র ব্যবহার করে চালানো হয়?",
        "options": [
            {"key": "A", "text": "নিউটনের গতির প্রথম সূত্র"},
            {"key": "B", "text": "মহাকর্ষ সূত্র"},
            {"key": "C", "text": "ভরবেগের নিত্যতা সূত্র"},
            {"key": "D", "text": "সবগুলো"}
        ],
        "answer": "C",
        "explanation": r"""জেট বিমান ও রকেটের গতি প্রধানত নিউটনের গতির তৃতীয় সূত্র এবং রৈখিক ভরবেগের নিত্যতা সূত্রের (Law of Conservation of Linear Momentum) ওপর প্রতিষ্ঠিত।

জেট বিমানের ইঞ্জিন থেকে তীব্র বেগে পেছনের দিকে গ্যাস নির্গত হয়। বাইরে থেকে কোনো নিট বল প্রযুক্ত না হওয়ায় আদি ও শেষ ভরবেগ সমান থাকে; ফলে গ্যাসীয় ভরবেগের সমান ও বিপরীত ভরবেগ নিয়ে জেট বিমানটি সামনের দিকে দ্রুত গতিশীল হয়।

- (A) নিউটনের গতির প্রথম সূত্র: এটি জড়তার ধারণা দেয়, কিন্তু প্রপেলশন বা ধাক্কা বলের মূল ব্যাখ্যা দেয় না।
- (B) মহাকর্ষ সূত্র: মহাকর্ষ বল বায়ুমণ্ডলে আকর্ষণের কাজ করে, বিমান চালনার চালিকাশক্তি নয়।
- (D) সবগুলো: যেহেতু ভরবেগের নিত্যতা সূত্রই সরাসরি কার্যকরী নীতি, তাই সবগুলো প্রযোজ্য নয়।""",
        "chapter": "নিউটনিয়ান বলবিদ্যা",
        "topic": "বলের ঘাত ও ঘাত বল এবং ভরবেগ"
    },
    {
        "index": 70,
        "questionText": "নিচের কোনটি সরল ফল ?",
        "options": [
            {"key": "A", "text": "আম"},
            {"key": "B", "text": "শিম"},
            {"key": "C", "text": "আনারস"},
            {"key": "D", "text": "কাঁঠাল"}
        ],
        "answer": "A",
        "explanation": r"""ফুলের গর্ভাশয় ও প্রকৃতির ওপর ভিত্তি করে ফলের শ্রেণিবিভাগ:
১) সরল ফল (Simple Fruit): একটিমাত্র ফুলের একটিমাত্র গর্ভাশয় থেকে যে একক ফল উৎপন্ন হয়, তাকে সরল ফল বলে। যেমন: আম, জাম, লিচু, লেবু।
২) গুচ্ছ ফল (Aggregate Fruit): একটি ফুলের একাধিক মুক্ত গর্ভাশয় থেকে একগুচ্ছ ফল গঠিত হয় (যেমন: আতা, শরিফা)।
৩) যৌগিক ফল (Multiple Fruit): একটি সম্পূর্ণ পুষ্পমঞ্জরি একটিমাত্র ফলে রূপান্তরিত হয়। যেমন: কাঁঠাল, আনারস।

অতএব আম একটি আদর্শ রসালো সরল ফল (ড্রুপ জাতীয় ফল)।

- (B) শিম: এটি লেগিউম বা শুঁটি জাতীয় ফল, তবে বিশ্ববিদ্যালয় পরীক্ষায় সরস ড্রুপ হিসেবে আমকে আদর্শ সরল ফল হিসেবে গণ্য করা হয়।
- (C) আনারস: একটি যৌগিক ফল (Multiple fruit)।
- (D) কাঁঠাল: সমগ্র পুষ্পমঞ্জরি হতে উৎপন্ন যৌগিক ফল (Multiple fruit)।""",
        "chapter": "নগ্নবীজী ও আবৃতবীজী উদ্ভিদ",
        "topic": "পুষ্পপত্রবিন্যাস,পুষ্পপুট,অমরাবিন্যাস ও ফল"
    }
]
