# -*- coding: utf-8 -*-
part3 = [
    {
        "index": 21,
        "questionText": "1 HP ক্ষমতা বিশিষ্ট একটি ইঞ্জিন দিয়ে 20 মিটার গভীরতার কুয়া খালি করতে প্রতি মিনিটে কত কেজি পানি উঠানো যাবে?",
        "options": [
            {"key": "A", "text": "456.73 Kg"},
            {"key": "B", "text": "452.11 Kg"},
            {"key": "C", "text": "450.81 Kg"},
            {"key": "D", "text": "356.73 Kg"}
        ],
        "answer": "A",
        "explanation": r"""সম্পূর্ণ পানিপূর্ণ কুয়া খালি করার ক্ষেত্রে পানির ভরকেন্দ্রের সরণ কুয়ার গভীরতার অর্ধেক হয়:

$$h = \frac{H}{2} = \frac{20}{2} = 10\text{ m}$$

ইঞ্জিনের প্রদত্ত ক্ষমতা $P = 1\text{ HP} = 746\text{ W}$ এবং সময় $t = 1\text{ min} = 60\text{ s}$।

আমরা জানি, ক্ষমতা $P = \frac{W}{t} = \frac{mgh}{t}$

অতএব প্রতি মিনিটে উত্তোলিত পানির ভর:

$$m = \frac{P \times t}{g \times h} = \frac{746 \times 60}{9.8 \times 10} = \frac{44760}{98} \approx 456.73\text{ kg}$$

- (B) 452.11 Kg: ভুল অভিকর্ষজ ত্বরণ বা হিসাবগত পার্থক্যের কারণে প্রাপ্ত মান।
- (C) 450.81 Kg: ভরকেন্দ্রের সরণ $10\text{ m}$ না ধরে ভিন্ন উচ্চতা ধরলে এটি আসে।
- (D) 356.73 Kg: এটি সঠিক মানের থেকে ১০০ কেজি কম, ভুল রূপান্তরের ফল।""",
        "chapter": "কাজ, ক্ষমতা, ও শক্তি",
        "topic": "কুয়া সংক্রান্ত"
    },
    {
        "index": 22,
        "questionText": "25 অ্যাম্পিয়ার তড়িৎ প্রবাহ কোন বর্তনীতে 1 মিনিট ধরে চললে 3000J তাপ উৎপন্ন হয়।উক্ত বর্তনীর রোধ কত?",
        "options": [
            {"key": "A", "text": "0.02Ω"},
            {"key": "B", "text": "0.04Ω"},
            {"key": "C", "text": "0.08Ω"},
            {"key": "D", "text": "1Ω"}
        ],
        "answer": "C",
        "explanation": r"""জুলের তাপীয় ক্রিয়া সংক্রান্ত সূত্রানুযায়ী উৎপন্ন তাপ $H$ এর সমীকরণ:

$$H = I^2 R t$$

এখানে দেওয়া আছে:
তড়িৎ প্রবাহ, $I = 25\text{ A}$
সময়, $t = 1\text{ min} = 60\text{ s}$
উৎপন্ন তাপ, $H = 3000\text{ J}$

সুতরাং বর্তনীর রোধ:

$$R = \frac{H}{I^2 t} = \frac{3000}{(25)^2 \times 60} = \frac{3000}{625 \times 60} = \frac{50}{625} = 0.08\ \Omega$$

- (A) 0.02Ω: সময়কে মিনিটে না রেখে সেকেন্ডে রূপান্তর করার ভুল করলে এই মান আসে না।
- (B) 0.04Ω: হিসাবের সময় $I^2$ এর মান অর্ধেক ধরলে এই ভুল মান আসে।
- (D) 1Ω: এটি হিসাববিহীন একটি রাউন্ড মান যা প্রদত্ত ডেটার সাথে মেলে না।""",
        "chapter": "চল তড়িৎ",
        "topic": "তড়িতশক্তি থেকে তাপ"
    },
    {
        "index": 23,
        "questionText": "250 mL 0.1 M দ্রবণে কত গ্রাম $\\text{Na}_2\\text{CO}_3$আছে?",
        "options": [
            {"key": "A", "text": "2.10 g"},
            {"key": "B", "text": "1.65 g"},
            {"key": "C", "text": "2.65 g."},
            {"key": "D", "text": "10 g"}
        ],
        "answer": "C",
        "explanation": r"""মোলার দ্রবণ সংক্রান্ত সূত্রানুযায়ী দ্রবীভূত দ্রব্যের ভর $W$ এর সমীকরণ:

$$W = \frac{S \times M \times V}{1000}$$

এখানে:
মোলারিটি, $S = 0.1\text{ M}$
আয়তন, $V = 250\text{ mL}$
সোডিয়াম কার্বনেট ($\text{Na}_2\text{CO}_3$) এর মোলার ভর:

$$M = (23 \times 2) + 12 + (16 \times 3) = 46 + 12 + 48 = 106\text{ g/mol}$$

মান বসিয়ে পাই:

$$W = \frac{0.1 \times 106 \times 250}{1000} = \frac{2650}{1000} = 2.65\text{ g}$$

- (A) 2.10 g: মোলার ভর ভুলভাবে গণনা করলে বা রাউন্ড অফ করলে এই মান আসতে পারে।
- (B) 1.65 g: সোডিয়াম বাইকার্বনেটের মোলার ভর ব্যবহার করলে এই ধরনের মান আসে।
- (D) 10 g: এটি মাত্রাতিরিক্ত পরিমাণ যা মাত্র $0.1\text{ M}$ দ্রবণে থাকা সম্ভব নয়।""",
        "chapter": "পরিমাণগত রসায়ন",
        "topic": "৩.১ রাসায়নিক গণনা ও গ্যাসের মোলার আয়তন"
    },
    {
        "index": 24,
        "questionText": "4x + 3y -2 =0 রেখে থেকে ঐ রেখাটির সমান্তরাল 8x + 6y + 9 = 0 রেখাটির লম্ব দূরত্ব কত?",
        "options": [
            {"key": "A", "text": "$\\frac{10}{13}$"},
            {"key": "B", "text": "$\\frac{13}{10}$"},
            {"key": "C", "text": "$\\frac{9}{11}$"},
            {"key": "D", "text": "0"}
        ],
        "answer": "B",
        "explanation": r"""প্রথম রেখার সমীকরণ: $4x + 3y - 2 = 0$।
উভয় পক্ষকে $2$ দ্বারা গুণ করে রেখাটিকে দ্বিতীয় রেখার সহগের সমতুল্য রূপ দেওয়া যায়:

$$8x + 6y - 4 = 0$$

দ্বিতীয় রেখার সমীকরণ:

$$8x + 6y + 9 = 0$$

দুটি সমান্তরাল সরলরেখা $ax + by + c_1 = 0$ এবং $ax + by + c_2 = 0$ এর মধ্যবর্তী লম্ব দূরত্ব $d$ এর সূত্র:

$$d = \frac{|c_1 - c_2|}{\sqrt{a^2 + b^2}}$$

এখানে $a = 8$, $b = 6$, $c_1 = -4$, $c_2 = 9$।

$$d = \frac{|-4 - 9|}{\sqrt{8^2 + 6^2}} = \frac{|-13|}{\sqrt{64 + 36}} = \frac{13}{\sqrt{100}} = \frac{13}{10}$$

- (A) $\frac{10}{13}$: লব ও হরের পারস্পরিক উল্টোপাল্টা অনুপাত (ব্যস্তানুপাতিক রূপ)।
- (C) $\frac{9}{11}$: ভুল ধ্রুবক বিয়োগের ফল।
- (D) 0: রেখাদুটি একই নয় বরং সমান্তরাল হওয়ায় এদের দূরত্ব শূন্য হতে পারে না।""",
        "chapter": "সরলরেখা",
        "topic": "সমান্তরাল ও লম্ব রেখা সংক্রান্ত"
    },
    {
        "index": 25,
        "questionText": "They approved the design that he submitted and _________.",
        "options": [
            {"key": "A", "text": "so did I"},
            {"key": "B", "text": "so I do"},
            {"key": "C", "text": "we also do"},
            {"key": "D", "text": "me too"}
        ],
        "answer": "A",
        "explanation": r"""In English grammar, to express affirmative agreement with an action previously stated in the past tense ("approved"), the structure with inverted auxiliary verb is: "so + auxiliary verb + subject".

Since the main clause verb "approved" is in simple past tense, the corresponding auxiliary is "did". Hence, "so did I" correctly agrees with the past action.

- (B) so I do: Lacks subject-verb inversion and incorrectly uses present tense "do" for a past tense event.
- (C) we also do: Uses present tense "do", which clashes with the past tense predicate "approved".
- (D) me too: Informal colloquialism unsuitable for formal parallel coordinate clause structure.""",
        "chapter": "Sentence Correction & Transformation",
        "topic": "Elliptical Clauses & Affirmative Agreement"
    },
    {
        "index": 26,
        "questionText": "শিল্প কারখানার কোন বর্জ্য কিডনীর ক্ষতি করে?",
        "options": [
            {"key": "A", "text": "As"},
            {"key": "B", "text": "Fe"},
            {"key": "C", "text": "Cd"},
            {"key": "D", "text": "Pd"}
        ],
        "answer": "C",
        "explanation": r"""ভারী ধাতু ক্যাডমিয়াম ($\text{Cd}$) বিভিন্ন ব্যাটারি, ইলেকট্রোপ্লেটিং ও প্লাস্টিক শিল্প বর্জ্যের মাধ্যমে পরিবেশে নির্গত হয়।

ক্যাডমিয়াম মানবদেহে প্রবেশ করলে তা প্রধানত কিডনির রেনাল টিউবিউল ও গ্লোমেরুলাসে জমা হয়ে কিডনির মারাত্মক ক্ষতি ও দীর্ঘস্থায়ী বৈকল্য (যেমন ইতাই-ইতাই রোগ) ঘটায়।

- (A) As: আর্সেনিক প্রধানত চর্মরোগ, ব্ল্যাকফুট ডিজিজ ও ফুসফুসের ক্যান্সারের জন্য দায়ী।
- (B) Fe: আয়রন মানবদেহের জন্য অপরিহার্য পুষ্টি উপাদান এবং এটি স্বাভাবিক মাত্রায় কিডনির ক্ষতিকারক বর্জ্য নয়।
- (D) Pd: প্যালাডিয়াম অনুঘটক হিসেবে ব্যবহৃত হয় এবং এটি সচরাচর কিডনি বিনষ্টকারী প্রধান শিল্প বর্জ্য হিসেবে বিবেচিত নয়।""",
        "chapter": "পরিবেশ রসায়ন",
        "topic": "ভারী ধাতুর বিষাক্ততা"
    },
    {
        "index": 27,
        "questionText": "নিচের কোনটি ব্যতিক্রমী ম্যাট্রিক্স?",
        "options": [
            {"key": "A", "text": "$\\begin{vmatrix} 2 & 3 \\\\ 12 & 8 \\end{vmatrix}$"},
            {"key": "B", "text": "$\\begin{vmatrix} 3 & 2 \\\\ 12 & 8 \\end{vmatrix}$"},
            {"key": "C", "text": "$\\begin{vmatrix} 3 & 5 \\\\ 6 & 8 \\end{vmatrix}$"},
            {"key": "D", "text": "$\\begin{vmatrix} 3 & 2 \\\\ 6 & 8 \\end{vmatrix}$"}
        ],
        "answer": "B",
        "explanation": r"""যে বর্গ ম্যাট্রিক্সের নির্ণায়কের মান শূন্য ($|A| = 0$) হয়, তাকে ব্যতিক্রমী ম্যাট্রিক্স (Singular Matrix) বলা হয়।

অপশন (B) এর নির্ণায়ক মান হিসাব করে পাই:

$$\begin{vmatrix} 3 & 2 \\ 12 & 8 \end{vmatrix} = (3 \times 8) - (2 \times 12) = 24 - 24 = 0$$

যেহেতু এর নির্ণায়ক শূন্য, তাই এটি একটি ব্যতিক্রমী ম্যাট্রিক্স।

- (A) $\begin{vmatrix} 2 & 3 \\ 12 & 8 \end{vmatrix} = 16 - 36 = -20 \ne 0$: অবিকতিক্রমী ম্যাট্রিক্স।
- (C) $\begin{vmatrix} 3 & 5 \\ 6 & 8 \end{vmatrix} = 24 - 30 = -6 \ne 0$: অবিকতিক্রমী ম্যাট্রিক্স।
- (D) $\begin{vmatrix} 3 & 2 \\ 6 & 8 \end{vmatrix} = 24 - 12 = 12 \ne 0$: অবিকতিক্রমী ম্যাট্রিক্স।""",
        "chapter": "ম্যাট্রিক্স ও নির্ণায়ক",
        "topic": "ব্যতিক্রমী ও অব্যতিক্রমী ম্যাট্রিক্স"
    },
    {
        "index": 28,
        "questionText": "40 kg-m কে Joule এ প্রকাশ কর।",
        "options": [
            {"key": "A", "text": "290"},
            {"key": "B", "text": "190"},
            {"key": "C", "text": "392"},
            {"key": "D", "text": "390"}
        ],
        "answer": "C",
        "explanation": r"""কাজের অভিকর্ষীয় একক হলো কিলোগ্রাম-মিটার ($\text{kg-m}$)। 

১ কিলোগ্রাম-মিটার কাজ বলতে ১ কিলোগ্রাম ভরের বস্তুকে অভিকর্ষ বলের বিরুদ্ধে ১ মিটার উচ্চতায় তুলতে কৃত কাজকে বোঝায়:

$$W = mgh = 1\text{ kg} \times 9.8\text{ m/s}^2 \times 1\text{ m} = 9.8\text{ J}$$

অতএব $40\text{ kg-m}$ কাজের পরিমাণ জুলে হবে:

$$W = 40 \times 9.8\text{ J} = 392\text{ J}$$

- (A) 290: ভুল গুণফলের হিসাব।
- (B) 190: ভিত্তিহীন ভুল মান।
- (D) 390: অভিকর্ষজ ত্বরণ $g$ এর মান $9.75$ ধরলে এমন মান আসতে পারে, যা প্রমিত $9.8$ নয়।""",
        "chapter": "কাজ, ক্ষমতা, ও শক্তি",
        "topic": "কাজের একক ও মাত্রা"
    },
    {
        "index": 29,
        "questionText": "কোনটি চর্মরোগের ওষুধ হিসেবে ব্যবহৃত হয়?",
        "options": [
            {"key": "A", "text": "Cycas circinalis"},
            {"key": "B", "text": "Cycas pectinata"},
            {"key": "C", "text": "Cycas revoluta"},
            {"key": "D", "text": "None"}
        ],
        "answer": "A",
        "explanation": r"""সাইকাসের বিভিন্ন প্রজাতির মধ্যে ঔষধি ও অর্থনৈতিক বৈশিষ্ট্যে ভিন্নতা রয়েছে:
- *Cycas circinalis* এর কচিপাতা পাকস্থলীর রোগ এবং চর্মরোগের উপশমে ওষুধ হিসেবে ব্যাপকভাবে ব্যবহৃত হয়। এর বীজ ও স্ফীতকন্দ থেকে এরারুট বা বার্লি প্রস্তুত করা হয়।
- *Cycas pectinata* এর কচি পাতা সবজি হিসেবে রান্না করে খাওয়া হয়।
- *Cycas revoluta* এর কান্ড ও বীজ হতে খাদ্যোপযোগী সাগু তৈরি করা হয়।

- (B) Cycas pectinata: এর কচিপাতা খাবার ও সবজি হিসেবে ব্যবহৃত হয়, চর্মরোগের ওষুধ নয়।
- (C) Cycas revoluta: এটি মূলত শোভাবর্ধনকারী উদ্ভিদ এবং এর বীজ সাগু বা খাদ্য হিসেবে ব্যবহৃত হয়।
- (D) None: যেহেতু *Cycas circinalis* সুনির্দিষ্টভাবে চিকিৎসায় ব্যবহৃত হয়, তাই এটি বাতিল।""",
        "chapter": "নগ্নবীজী ও আবৃতবীজী উদ্ভিদ",
        "topic": "নগ্নবীজি উদ্ভিদ এবং Cycas গঠন ও শনাক্তকারী বৈশিষ্ট্য"
    },
    {
        "index": 30,
        "questionText": "The president had a ______ of ______ around him when he makes public appearances.",
        "options": [
            {"key": "A", "text": "Catalyst, Individuals"},
            {"key": "B", "text": "barrier, contrast"},
            {"key": "C", "text": "hedge, protection"},
            {"key": "D", "text": "derrick, protection"}
        ],
        "answer": "C",
        "explanation": r"""In English vocabulary and metaphorical expression, a "hedge of protection" is an established idiom describing an encompassing protective ring, defensive barrier, or security detail encircling a high-profile dignitary.

Thus, "The president had a hedge of protection around him when he makes public appearances" creates a coherent and idiomatic sentence.

- (A) Catalyst, Individuals: A "catalyst of individuals" makes no logical sense in context of personal security.
- (B) barrier, contrast: "A barrier of contrast" does not describe physical or security arrangements.
- (D) derrick, protection: A "derrick" refers to a framework crane or oil-drilling tower, which is completely irrelevant.""",
        "chapter": "Spelling & Vocabulary Usage",
        "topic": "Contextual Vocabulary & Idiomatic Collocations"
    }
]
