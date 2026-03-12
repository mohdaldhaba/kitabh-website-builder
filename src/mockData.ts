// ═══════════════════════════════════════════════════════
//  Mock Data — matches Kitaba API MongoDB schemas exactly
//  Field names mirror: user.model.js, article.model.js,
//  articleComment.js, newsletter.model.js, category.model.js,
//  tipInteraction.model.js, website.model.js
//  Swap to real API calls with zero field-name changes.
// ═══════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────

export interface MockUser {
  _id: string;
  name: string;
  username: string;
  profileImage: string;
  email: string;
  bio: string;
  goals: string[];
  socials: {
    twitter: string;
    instagram: string;
    facebook: string;
    youtube: string;
    linkedin: string;
    website: string;
  };
  socialLinksSettings: {
    platform: "twitter" | "instagram" | "facebook" | "youtube" | "linkedin" | "website";
    enabled: boolean;
    order: number;
  }[];
  interests: string[];
  categories: string[]; // ObjectId refs
  followers: string[];
  following: string[];
  bookmarks: string[];
  isVerified: boolean;
  isPremium: boolean;
  isBusinessPlan: boolean;
  organizationRole: "owner" | "member" | null;
  organizationProfile: {
    tagline: string;
    coverImage: string;
    location: string;
    website: string;
    contactEmail: string;
    mainSection: {
      title: string;
      isVisible: boolean;
      newsletters: { title: string; isVisible: boolean };
      podcasts: { title: string; isVisible: boolean; items: { title: string; description: string; image: string; url: string }[] };
      products: { title: string; isVisible: boolean; items: { title: string; description: string; image: string; url: string }[] };
    };
  };
  // Tip feature (from tipInteraction model context)
  tipEnabled: boolean;
  tipDrinkPreference: "coffee" | "tea";
  newsletters: string[];
  subscription: {
    planCode: string;
    status: "active" | "cancelled" | "paused" | "pending";
    startDate: string;
    endDate: string;
    planDetails: {
      name: string;
      productName: string;
      price: number;
      billingCycle: { duration: number; unit: string };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface MockArticle {
  _id: string;
  title: string;
  subTitle: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  metaImage: string;
  content: any[];
  tiptapContent: boolean;
  articleText: string;
  articleHtml: string;
  wordCount: number;
  articleCreatedAt: string;
  author: string; // ObjectId ref → User
  categories: string[];
  tags: string[];
  coverImage: string;
  audioUrl: string;
  description: string;
  publishToSite: boolean;
  publishToKitabh: boolean;
  likeCount: number;
  commentCount: number;
  views: number;
  impressions: number;
  status: "draft" | "published" | "archived" | "scheduled";
  newsletter: string;
  publishedAt: string;
  emailStats: {
    sent: number;
    delivered: number;
    opens: number;
    uniqueOpens: number;
    clicks: number;
    uniqueClicks: number;
    bounces: number;
    unsubscribes: number;
    openRate: number;
    clickRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MockArticleComment {
  _id: string;
  article: string; // ObjectId ref → Article
  user: string; // ObjectId ref → User
  content: string;
  parentComment: string | null;
  images: string[];
  replies: string[];
  likes: string[];
  impressions: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockNewsletter {
  _id: string;
  displayName: string;
  userName: string;
  slug: string;
  description: string;
  logo: string;
  author: string;
  frequency: "daily" | "weekly" | "monthly";
  loggedInsubscribers: { user: string; subscribedAt: string }[];
  nonSignedsubscribers: string[];
  articles: string[];
  is_live: boolean;
  banner: string;
  showNumberOfSubscribers: boolean;
  hideBranding: boolean;
  bgColor: string;
  textColor: string;
  emailStats: {
    totalSent: number;
    totalDelivered: number;
    totalOpens: number;
    uniqueOpens: number;
    totalClicks: number;
    uniqueClicks: number;
    totalBounces: number;
    totalUnsubscribes: number;
    avgOpenRate: number;
    avgClickRate: number;
    totalSubscribers: number;
  };
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockCategory {
  _id: string;
  name: string;
  description: string;
  slug: string;
  articles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockTipInteraction {
  _id: string;
  author: string;
  visitor: string | null;
  visitorFingerprint: string | null;
  action: "popup_opened" | "amount_selected" | "custom_amount_entered" | "interest_submitted" | "popup_closed_without_submit";
  selectedAmount: number | null;
  isCustomAmount: boolean;
  drinkType: "coffee" | "tea";
  createdAt: string;
  updatedAt: string;
}

// ─── Mock IDs ───────────────────────────────────────────

const USER_ID = "6754d563414566468e88a42f";
const AUTHOR_RAWIYA = "6754d563414566468e88a430";
const AUTHOR_ABDULRAHMAN = "6754d563414566468e88a431";
const AUTHOR_FAISAL = "6754d563414566468e88a432";
const AUTHOR_BUSHRA = "6754d563414566468e88a433";
const NEWSLETTER_ID = "nl_001";
const CAT_TECH = "cat_tech";
const CAT_WRITING = "cat_writing";
const CAT_BIZ = "cat_biz";
const CAT_CULTURE = "cat_culture";
const CAT_SELF = "cat_self";

export const MOCK_AUTHORS_MAP: Record<string, string> = {
  [USER_ID]: "محمد الضبع",
  [AUTHOR_RAWIYA]: "راوية إبراهيم",
  [AUTHOR_ABDULRAHMAN]: "عبدالرحمن علي",
  [AUTHOR_FAISAL]: "فيصل العنزي",
  [AUTHOR_BUSHRA]: "بشرى عبدالله",
};

// ─── Author Profile ────────────────────────────────────

export const MOCK_AUTHOR: MockUser = {
  _id: USER_ID,
  name: "محمد الضبع",
  username: "mohdaldhabaa",
  profileImage: "/mock/author.jpg",
  email: "mohammed@kitabh.com",
  bio: "مؤسس منصة كتابة — أكتب عن ريادة الأعمال وصناعة المحتوى والتقنية. أؤمن أن كل عربي يستحق منصة تليق بكلماته.",
  goals: ["بناء أكبر منصة نشر عربية", "مليون مشترك بحلول 2027"],
  socials: {
    twitter: "https://twitter.com/mohdaldhabaa",
    instagram: "https://instagram.com/mohdaldhabaa",
    facebook: "",
    youtube: "https://youtube.com/@kitabh",
    linkedin: "https://linkedin.com/in/mohdaldhabaa",
    website: "https://kitabh.com",
  },
  socialLinksSettings: [
    { platform: "twitter", enabled: true, order: 0 },
    { platform: "instagram", enabled: true, order: 1 },
    { platform: "youtube", enabled: true, order: 2 },
    { platform: "linkedin", enabled: true, order: 3 },
    { platform: "website", enabled: true, order: 4 },
    { platform: "facebook", enabled: false, order: 5 },
  ],
  interests: ["كتّاب تتابعهم", "اخترنا لك", "ريادة أعمال", "تقنية"],
  categories: [CAT_TECH, CAT_WRITING, CAT_BIZ],
  followers: ["u_002", "u_003", "u_004", "u_005", "u_006"],
  following: ["u_007", "u_008"],
  bookmarks: [],
  isVerified: true,
  isPremium: true,
  isBusinessPlan: true,
  organizationRole: "owner",
  organizationProfile: {
    tagline: "منصة النشر العربية الأولى لصنّاع المحتوى",
    coverImage: "/mock/cover.jpg",
    location: "الرياض، السعودية",
    website: "https://kitabh.com",
    contactEmail: "hello@kitabh.com",
    mainSection: {
      title: "المحتوى",
      isVisible: true,
      newsletters: { title: "النشرات البريدية", isVisible: true },
      podcasts: {
        title: "البودكاست",
        isVisible: true,
        items: [
          { title: "بودكاست رسالة السبت", description: "حوارات أسبوعية مع صنّاع المحتوى العرب", image: "/mock/podcast1.jpg", url: "https://kitabh.com/podcast" },
        ],
      },
      products: {
        title: "المنتجات",
        isVisible: true,
        items: [
          { title: "دورة صناعة النشرة البريدية", description: "من الصفر إلى أول ألف مشترك في 90 يوما", image: "/mock/product1.jpg", url: "https://kitabh.com/course" },
        ],
      },
    },
  },
  tipEnabled: true,
  tipDrinkPreference: "coffee",
  newsletters: [NEWSLETTER_ID],
  subscription: {
    planCode: "business_annual",
    status: "active",
    startDate: "2025-01-15T00:00:00.000Z",
    endDate: "2026-01-15T00:00:00.000Z",
    planDetails: {
      name: "خطة الأعمال السنوية",
      productName: "Kitabh Business",
      price: 499,
      billingCycle: { duration: 12, unit: "month" },
    },
  },
  createdAt: "2024-06-01T10:00:00.000Z",
  updatedAt: "2026-03-10T14:30:00.000Z",
};

// ─── Categories ─────────────────────────────────────────

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    _id: CAT_TECH,
    name: "تقنية",
    description: "مقالات عن التقنية والذكاء الاصطناعي والبرمجة",
    slug: "tech",
    articles: ["art_001", "art_004", "art_006"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    _id: CAT_WRITING,
    name: "كتابة",
    description: "فن الكتابة وصناعة المحتوى والنشرات البريدية",
    slug: "writing",
    articles: ["art_002", "art_003", "art_005"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    _id: CAT_BIZ,
    name: "ريادة أعمال",
    description: "قصص نجاح ودروس في بناء المشاريع",
    slug: "business",
    articles: ["art_001", "art_003"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    _id: CAT_CULTURE,
    name: "ثقافة",
    description: "مقالات عن الثقافة والأدب والفكر العربي",
    slug: "culture",
    articles: ["art_014"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    _id: CAT_SELF,
    name: "تطوير ذات",
    description: "مقالات عن الإنتاجية والعادات والنمو الشخصي",
    slug: "self-development",
    articles: ["art_005", "art_010", "art_020"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
];

// ─── Articles ───────────────────────────────────────────

const mkArticle = (id: string, title: string, subTitle: string, slug: string, author: string, cats: string[], tags: string[], text: string, wc: number, date: string, likes: number, comments: number, views: number, img: string = ""): MockArticle => ({
  _id: id, title, subTitle, slug,
  metaTitle: title.slice(0, 60), metaDescription: subTitle, metaKeywords: tags, metaImage: img || `/mock/${id}.jpg`,
  content: [{ type: "paragraph", content: [{ type: "text", text: text.slice(0, 80) + "..." }] }],
  tiptapContent: true, articleText: text, articleHtml: `<p>${text.slice(0, 150)}</p>`,
  wordCount: wc, articleCreatedAt: date, author, categories: cats, tags,
  coverImage: img || `/mock/${id}.jpg`, audioUrl: "", description: subTitle,
  publishToSite: true, publishToKitabh: true, likeCount: likes, commentCount: comments,
  views, impressions: views * 2.5, status: "published", newsletter: NEWSLETTER_ID, publishedAt: date,
  emailStats: { sent: 1800, delivered: 1770, opens: 1050, uniqueOpens: 820, clicks: 350, uniqueClicks: 260, bounces: 25, unsubscribes: 2, openRate: 46.3, clickRate: 14.7 },
  createdAt: date, updatedAt: date,
});

export const MOCK_ARTICLES: MockArticle[] = [
  mkArticle("art_001",
    "كيف بنينا منصة كتابة من رسمة على ورقة إلى 115 ألف دولار في 150 يوما",
    "القصة الكاملة وراء بناء منصة عربية للنشر من الصفر",
    "how-we-built-kitabh", USER_ID, [CAT_BIZ, CAT_TECH],
    ["ريادة أعمال", "SaaS", "قصة نجاح"],
    "بدأت القصة في صيف 2024 عندما قررت أن المحتوى العربي يستحق منصة نشر تليق به. كنت أبحث عن أداة مثل Substack أو Beehiiv لكن بالعربية، ولم أجد شيئا يرضيني.",
    2450, "2026-02-20T10:00:00.000Z", 87, 14, 3420,
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop"),
  mkArticle("art_002",
    "لماذا يفشل معظم الكتّاب العرب في تحقيق دخل من الكتابة؟",
    "ثلاثة أخطاء قاتلة تمنع الكاتب من تحويل شغفه إلى مصدر رزق حقيقي",
    "why-arab-writers-fail", AUTHOR_RAWIYA, [CAT_WRITING, CAT_BIZ],
    ["كتابة", "دخل", "اقتصاد المحتوى"],
    "المشكلة ليست في غياب الموهبة. المشكلة أن معظم الكتّاب العرب يكتبون للجميع ولا يكتبون لأحد. التخصص والتركيز على شريحة محددة هو أول خطوة نحو الدخل.",
    1800, "2026-02-15T10:00:00.000Z", 52, 8, 2100,
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop"),
  mkArticle("art_003",
    "الاقتصاد الإبداعي العربي: أرقام لا يعرفها أحد",
    "تحليل معمّق لحجم سوق صناعة المحتوى في العالم العربي وأين تكمن الفرص",
    "arab-creator-economy", AUTHOR_FAISAL, [CAT_BIZ],
    ["اقتصاد إبداعي", "بيانات", "فرص"],
    "حجم الاقتصاد الإبداعي في العالم العربي يتجاوز المليار دولار سنويا، لكن 90% من هذا المبلغ يذهب لأقل من 2% من صنّاع المحتوى. كيف نغيّر هذه المعادلة؟",
    3200, "2026-01-28T09:00:00.000Z", 134, 22, 5800,
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop"),
  mkArticle("art_004",
    "الذكاء الاصطناعي لن يحلّ محل الكاتب — لكنه سيغيّر طريقة عمله",
    "كيف يمكن لصنّاع المحتوى العرب الاستفادة من أدوات الذكاء الاصطناعي دون فقدان أصالتهم",
    "ai-wont-replace-writers", AUTHOR_ABDULRAHMAN, [CAT_TECH],
    ["ذكاء اصطناعي", "كتابة", "أدوات"],
    "منذ ظهور ChatGPT والجميع يتحدث عن نهاية مهنة الكتابة. لكن الواقع يقول العكس تماما — الطلب على المحتوى الأصيل والعميق يزداد.",
    2100, "2026-01-15T08:00:00.000Z", 73, 19, 4100,
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop"),
  mkArticle("art_005",
    "كيف تبني عادة الكتابة اليومية في 30 يوما فقط",
    "نظام عملي مجرّب لتحويل الكتابة من عبء إلى طقس يومي ممتع",
    "daily-writing-habit", AUTHOR_BUSHRA, [CAT_WRITING, CAT_SELF],
    ["كتابة", "عادات", "إنتاجية"],
    "المشكلة ليست أنك لا تملك الوقت. المشكلة أنك تنتظر اللحظة المثالية للكتابة، وهذه اللحظة لن تأتي أبدا. إليك نظام عملي جرّبته شخصيا.",
    1500, "2025-12-10T10:00:00.000Z", 210, 45, 8200,
    "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=500&fit=crop"),
  mkArticle("art_006",
    "ملف كامل: مستقبل النشرات البريدية العربية في 2026",
    "هل النشرة البريدية موضة ستنتهي أم أنها مستقبل الإعلام المستقل؟",
    "future-arabic-newsletters", USER_ID, [CAT_TECH, CAT_WRITING],
    ["نشرات بريدية", "إعلام", "مستقبل"],
    "في 2025 تضاعف عدد النشرات البريدية العربية ثلاث مرات. لكن هل هذا نمو حقيقي أم فقاعة؟ نحلل الأرقام ونقرأ المشهد بعمق.",
    4100, "2026-03-01T09:00:00.000Z", 45, 7, 1900,
    "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&h=500&fit=crop"),
  mkArticle("art_007",
    "دروس من سقوط BuzzFeed: لماذا فشل نموذج المحتوى المجاني",
    "ما الذي يمكن أن يتعلمه صنّاع المحتوى العرب من انهيار أكبر منصة محتوى أمريكية",
    "buzzfeed-lessons", AUTHOR_FAISAL, [CAT_BIZ],
    ["إعلام", "نماذج أعمال", "دروس"],
    "عندما أعلنت BuzzFeed إفلاسها، لم يكن ذلك مفاجأة لمن يراقب. المحتوى المجاني المعتمد على الإعلانات نموذج هش، والبديل هو الاشتراكات المدفوعة.",
    2800, "2026-03-05T08:00:00.000Z", 96, 31, 6200,
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=500&fit=crop"),
  mkArticle("art_008",
    "فن العنوان: كيف تكتب عنوانا يجعل القارئ يفتح مقالك فورا",
    "تقنيات عملية في صياغة العناوين مستوحاة من أنجح النشرات البريدية عالميا",
    "art-of-headlines", AUTHOR_RAWIYA, [CAT_WRITING],
    ["عناوين", "كتابة", "نصائح"],
    "80% من الناس يقرأون العنوان فقط. هذا يعني أن العنوان ليس مجرد بداية المقال — إنه نصف العمل. إليك الأساليب التي تصنع الفرق.",
    1600, "2026-02-25T07:00:00.000Z", 118, 27, 7300,
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=500&fit=crop"),
  mkArticle("art_009",
    "كيف أطلقت بودكاست وصل إلى 50 ألف استماع في 6 أشهر",
    "خطوات عملية ودروس مستفادة من رحلة بناء بودكاست عربي ناجح من الصفر",
    "podcast-50k-listens", AUTHOR_ABDULRAHMAN, [CAT_BIZ, CAT_TECH],
    ["بودكاست", "صوتيات", "نمو"],
    "لم أكن أعرف شيئا عن البودكاست قبل سنة. اليوم عندي بودكاست يحقق 50 ألف استماع شهريا. إليك كل ما تعلمته في هذه الرحلة.",
    2900, "2026-02-10T09:00:00.000Z", 89, 16, 4500,
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=500&fit=crop"),
  mkArticle("art_010",
    "لماذا يجب أن تكتب حتى لو لم يقرأك أحد",
    "عن الكتابة كأداة تفكير وليست مجرد وسيلة نشر",
    "write-even-if-nobody-reads", AUTHOR_BUSHRA, [CAT_WRITING, CAT_SELF],
    ["كتابة", "تأمل", "تطوير ذات"],
    "الكتابة ليست فقط لمن يريد أن يُقرأ. الكتابة هي الطريقة الأعمق للتفكير. حين تكتب أفكارك، تكتشف أنك لم تكن تفهمها حقا إلا بعد أن صغتها بكلمات.",
    1200, "2026-01-20T08:00:00.000Z", 176, 38, 9100,
    "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=500&fit=crop"),
  mkArticle("art_011",
    "خريطة المنافسة: مقارنة بين منصات النشر العربية",
    "تحليل مفصّل لنقاط القوة والضعف في كل منصة نشر متاحة للكاتب العربي",
    "arabic-publishing-platforms", AUTHOR_FAISAL, [CAT_TECH, CAT_BIZ],
    ["منصات", "مقارنة", "أدوات"],
    "لأول مرة نضع كل منصات النشر العربية جنبا إلى جنب: كتابة، هاشتاقات، سكريبد عربي، وغيرها. من الأنسب لك؟ يعتمد على إجابتك عن سؤال واحد.",
    3500, "2026-03-08T07:00:00.000Z", 67, 24, 3800,
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop"),
  mkArticle("art_012",
    "كيف تحوّل قراءك إلى مجتمع حقيقي يدفع لك",
    "استراتيجيات بناء مجتمع مدفوع حول نشرتك البريدية أو مدونتك",
    "readers-to-community", AUTHOR_RAWIYA, [CAT_BIZ, CAT_WRITING],
    ["مجتمع", "اشتراكات", "دخل"],
    "الفرق بين كاتب يكسب والكاتب الذي لا يكسب ليس جودة المحتوى. الفرق هو أن الأول بنى مجتمعا والثاني بنى جمهورا. المجتمع يدفع، الجمهور يتابع.",
    2200, "2026-02-05T10:00:00.000Z", 143, 35, 6800,
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop"),
  mkArticle("art_013",
    "ماذا تعلمت من قراءة 100 نشرة بريدية في شهر واحد",
    "تجربة مكثّفة للغوص في عالم النشرات البريدية واستخلاص أنماط النجاح المشتركة",
    "100-newsletters-in-30-days", AUTHOR_ABDULRAHMAN, [CAT_WRITING],
    ["نشرات بريدية", "قراءة", "تحليل"],
    "اشتركت في 100 نشرة بريدية — عربية وإنجليزية — وقرأتها كلها خلال 30 يوما. إليك الأنماط المشتركة بين أنجحها، والأخطاء التي تتكرر في أسوأها.",
    2600, "2026-01-12T09:00:00.000Z", 91, 18, 5200,
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=500&fit=crop"),
  mkArticle("art_014",
    "أزمة المحتوى العربي: كثير من الكلام وقليل من العمق",
    "لماذا يعاني المحتوى العربي من السطحية وكيف نصنع محتوى يستحق وقت القارئ",
    "arabic-content-crisis", AUTHOR_BUSHRA, [CAT_WRITING, CAT_CULTURE],
    ["محتوى عربي", "جودة", "نقد"],
    "افتح أي منصة عربية وستجد آلاف المقالات التي تقول نفس الكلام بطرق مختلفة. المشكلة ليست في عدد الكتّاب بل في غياب الصوت الأصيل والبحث العميق.",
    1900, "2026-03-02T08:00:00.000Z", 203, 52, 11400,
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=500&fit=crop"),
  mkArticle("art_015",
    "دليلك الكامل لتسعير نشرتك البريدية المدفوعة",
    "كم تطلب من المشترك؟ وكيف تحدد السعر المناسب دون أن تخسر جمهورك",
    "newsletter-pricing-guide", USER_ID, [CAT_BIZ],
    ["تسعير", "نشرة بريدية", "دخل"],
    "أكثر سؤال يصلني: كم أسعّر نشرتي البريدية؟ الجواب ليس رقما واحدا. التسعير يعتمد على شريحتك، قيمة المحتوى، وحجم جمهورك. إليك إطار عمل عملي.",
    2400, "2026-02-18T07:00:00.000Z", 78, 21, 4600,
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop"),
  mkArticle("art_016",
    "السرد القصصي في الكتابة التقنية: كيف تشرح المعقّد ببساطة",
    "تقنيات عملية لتحويل المواضيع الجافة إلى قصص يقرأها الناس حتى النهاية",
    "storytelling-in-tech-writing", AUTHOR_RAWIYA, [CAT_WRITING, CAT_TECH],
    ["سرد قصصي", "كتابة تقنية", "تبسيط"],
    "أصعب تحدٍ يواجه الكاتب التقني هو أن يجعل القارئ العادي يفهم ويهتم. السر ليس في تبسيط المعلومة فقط، بل في تحويلها إلى قصة إنسانية.",
    2000, "2026-01-25T10:00:00.000Z", 64, 11, 3200,
    "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=500&fit=crop"),
  mkArticle("art_017",
    "ريادة الأعمال في السعودية: لماذا 2026 هو العام الذهبي",
    "قراءة في المشهد الريادي السعودي والفرص التي يفتحها التحول الرقمي ورؤية 2030",
    "saudi-entrepreneurship-2026", AUTHOR_FAISAL, [CAT_BIZ],
    ["ريادة أعمال", "السعودية", "رؤية 2030"],
    "حجم الاستثمار الجريء في السعودية تضاعف أربع مرات منذ 2020. البنية التحتية الرقمية أصبحت جاهزة. والشباب السعودي أكثر طموحا من أي وقت مضى.",
    3100, "2026-02-28T08:00:00.000Z", 112, 29, 7600,
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop"),
  mkArticle("art_018",
    "كيف تصمّم نشرة بريدية يحب الناس فتحها كل أسبوع",
    "من اختيار القالب إلى نبرة الصوت — كل ما تحتاجه لتصميم نشرة بريدية مميزة",
    "design-lovable-newsletter", AUTHOR_BUSHRA, [CAT_WRITING],
    ["تصميم", "نشرة بريدية", "تجربة قارئ"],
    "النشرة البريدية الناجحة ليست فقط محتوى جيد. هي تجربة متكاملة: تصميم مريح، نبرة صوت واضحة، وتوقيت ثابت يجعل القارئ ينتظرها.",
    1700, "2026-01-05T09:00:00.000Z", 88, 15, 3900,
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop"),
  mkArticle("art_019",
    "ثمانية دروس تعلمتها من بناء منتج رقمي عربي",
    "تجربة شخصية في تحديات بناء منتج تقني للسوق العربي وكيف تجاوزتها",
    "8-lessons-arabic-product", AUTHOR_ABDULRAHMAN, [CAT_BIZ, CAT_TECH],
    ["منتجات رقمية", "تجربة", "دروس"],
    "بناء منتج للسوق العربي يختلف تماما عن السوق الغربي. من طريقة الدفع إلى توقعات المستخدم إلى التسعير. إليك ثمانية دروس تعلمتها بالطريقة الصعبة.",
    2700, "2026-03-06T07:00:00.000Z", 95, 20, 5100,
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop"),
  mkArticle("art_020",
    "من القراءة إلى الكتابة: رحلة التحول من مستهلك إلى صانع محتوى",
    "قصص حقيقية لكتّاب عرب بدأوا كقرّاء وأصبحوا أصواتا مؤثرة في مجالاتهم",
    "reader-to-writer-journey", AUTHOR_RAWIYA, [CAT_WRITING, CAT_SELF],
    ["كتابة", "قصص نجاح", "إلهام"],
    "كل كاتب بدأ كقارئ. لكن اللحظة التي يقرر فيها أن يكتب هي لحظة فارقة. قابلت عشرة كتّاب عرب وسألتهم: ما الذي دفعك لكتابة أول مقال؟ إليك قصصهم.",
    3400, "2026-02-12T10:00:00.000Z", 156, 42, 8900,
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&h=500&fit=crop"),
];

// ─── Comments ───────────────────────────────────────────

export const MOCK_COMMENTS: MockArticleComment[] = [
  {
    _id: "cmt_001",
    article: "art_001",
    user: "u_002",
    content: "مقال ملهم جدا! قصتكم تثبت أن السوق العربي مليء بالفرص لمن يجرؤ على البناء. أتمنى لكم المزيد من النجاح.",
    parentComment: null,
    images: [],
    replies: ["cmt_002"],
    likes: [USER_ID, "u_003", "u_004"],
    impressions: 340,
    createdAt: "2026-02-20T14:30:00.000Z",
    updatedAt: "2026-02-20T14:30:00.000Z",
  },
  {
    _id: "cmt_002",
    article: "art_001",
    user: USER_ID,
    content: "شكرا لك! الحقيقة أن الطريق لم يكن سهلا لكن الشغف بالمحتوى العربي هو ما يدفعنا كل يوم.",
    parentComment: "cmt_001",
    images: [],
    replies: [],
    likes: ["u_002", "u_005"],
    impressions: 210,
    createdAt: "2026-02-20T16:00:00.000Z",
    updatedAt: "2026-02-20T16:00:00.000Z",
  },
  {
    _id: "cmt_003",
    article: "art_003",
    user: "u_003",
    content: "طبّقت النصائح الموجودة في هذا المقال وفعلا وصلت لـ 500 مشترك في شهرين. الخطوة الثالثة بالذات كانت نقطة التحول!",
    parentComment: null,
    images: [],
    replies: [],
    likes: [USER_ID, "u_002", "u_004", "u_006"],
    impressions: 580,
    createdAt: "2026-02-05T11:00:00.000Z",
    updatedAt: "2026-02-05T11:00:00.000Z",
  },
  {
    _id: "cmt_004",
    article: "art_004",
    user: "u_004",
    content: "أتفق تماما — الذكاء الاصطناعي ساعدني في تسريع عملية البحث لكن الكتابة النهائية لا بد أن تكون بصوتي الشخصي. الأصالة لا يمكن لأي أداة أن تقلّدها.",
    parentComment: null,
    images: [],
    replies: [],
    likes: [USER_ID, "u_002"],
    impressions: 290,
    createdAt: "2026-01-16T09:30:00.000Z",
    updatedAt: "2026-01-16T09:30:00.000Z",
  },
];

// ─── Newsletter ─────────────────────────────────────────

export const MOCK_NEWSLETTER: MockNewsletter = {
  _id: NEWSLETTER_ID,
  displayName: "رسالة السبت",
  userName: "mohdaldhabaa",
  slug: "saturday-letter",
  description: "نشرة أسبوعية عن صناعة المحتوى وريادة الأعمال والتقنية — تصلك كل سبت صباحا مع فنجان قهوتك.",
  logo: "/mock/newsletter-logo.jpg",
  author: USER_ID,
  frequency: "weekly",
  loggedInsubscribers: [
    { user: "u_002", subscribedAt: "2025-08-10T10:00:00.000Z" },
    { user: "u_003", subscribedAt: "2025-09-01T14:00:00.000Z" },
    { user: "u_004", subscribedAt: "2025-10-15T08:00:00.000Z" },
    { user: "u_005", subscribedAt: "2026-01-05T11:00:00.000Z" },
    { user: "u_006", subscribedAt: "2026-02-20T09:00:00.000Z" },
  ],
  nonSignedsubscribers: [
    "reader1@gmail.com",
    "reader2@outlook.com",
    "reader3@yahoo.com",
  ],
  articles: ["art_001", "art_002", "art_003", "art_004", "art_005", "art_006"],
  is_live: true,
  banner: "/mock/newsletter-banner.jpg",
  showNumberOfSubscribers: true,
  hideBranding: false,
  bgColor: "#ffffff",
  textColor: "#371D12",
  emailStats: {
    totalSent: 10050,
    totalDelivered: 9895,
    totalOpens: 6760,
    uniqueOpens: 5470,
    totalClicks: 2240,
    uniqueClicks: 1690,
    totalBounces: 136,
    totalUnsubscribes: 12,
    avgOpenRate: 55.3,
    avgClickRate: 17.1,
    totalSubscribers: 1920,
  },
  categories: [CAT_TECH, CAT_WRITING, CAT_BIZ],
  createdAt: "2025-06-01T10:00:00.000Z",
  updatedAt: "2026-03-10T14:00:00.000Z",
};

// ─── Tip Interactions ───────────────────────────────────

export const MOCK_TIP_INTERACTIONS: MockTipInteraction[] = [
  {
    _id: "tip_001",
    author: USER_ID,
    visitor: "u_003",
    visitorFingerprint: null,
    action: "interest_submitted",
    selectedAmount: 10,
    isCustomAmount: false,
    drinkType: "coffee",
    createdAt: "2026-03-08T15:00:00.000Z",
    updatedAt: "2026-03-08T15:00:00.000Z",
  },
  {
    _id: "tip_002",
    author: USER_ID,
    visitor: null,
    visitorFingerprint: "fp_abc123",
    action: "amount_selected",
    selectedAmount: 25,
    isCustomAmount: false,
    drinkType: "tea",
    createdAt: "2026-03-07T10:30:00.000Z",
    updatedAt: "2026-03-07T10:30:00.000Z",
  },
  {
    _id: "tip_003",
    author: USER_ID,
    visitor: "u_005",
    visitorFingerprint: null,
    action: "custom_amount_entered",
    selectedAmount: 50,
    isCustomAmount: true,
    drinkType: "coffee",
    createdAt: "2026-03-05T18:00:00.000Z",
    updatedAt: "2026-03-05T18:00:00.000Z",
  },
];

// ─── Aggregate Stats (derived, for quick access) ────────

export const MOCK_STATS = {
  totalSubscribers: MOCK_NEWSLETTER.emailStats.totalSubscribers,
  totalArticles: MOCK_ARTICLES.length,
  totalViews: MOCK_ARTICLES.reduce((sum, a) => sum + a.views, 0),
  totalLikes: MOCK_ARTICLES.reduce((sum, a) => sum + a.likeCount, 0),
  totalComments: MOCK_ARTICLES.reduce((sum, a) => sum + a.commentCount, 0),
  avgOpenRate: MOCK_NEWSLETTER.emailStats.avgOpenRate,
  avgClickRate: MOCK_NEWSLETTER.emailStats.avgClickRate,
  totalTipInteractions: MOCK_TIP_INTERACTIONS.length,
};

// ─── Helper: find article by ID ─────────────────────────

export const findArticleById = (id: string) => MOCK_ARTICLES.find(a => a._id === id);
export const findCategoryById = (id: string) => MOCK_CATEGORIES.find(c => c._id === id);
export const getArticlesByCategory = (catId: string) => MOCK_ARTICLES.filter(a => a.categories.includes(catId));
export const getCommentsByArticle = (articleId: string) => MOCK_COMMENTS.filter(c => c.article === articleId);
