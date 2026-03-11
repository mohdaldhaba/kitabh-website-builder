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
const NEWSLETTER_ID = "nl_001";
const CAT_TECH = "cat_tech";
const CAT_WRITING = "cat_writing";
const CAT_BIZ = "cat_biz";

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
];

// ─── Articles ───────────────────────────────────────────

export const MOCK_ARTICLES: MockArticle[] = [
  {
    _id: "art_001",
    title: "كيف بنينا منصة كتابة من رسمة على ورقة إلى 115 ألف دولار في 150 يوما",
    subTitle: "القصة الكاملة وراء بناء منصة عربية للنشر من الصفر",
    slug: "how-we-built-kitabh",
    metaTitle: "قصة بناء منصة كتابة — من الفكرة إلى الإيراد",
    metaDescription: "كيف بدأت فكرة منصة كتابة وتحولت إلى منتج حقيقي يحقق إيرادات شهرية متكررة",
    metaKeywords: ["منصة كتابة", "ريادة أعمال", "SaaS عربي"],
    metaImage: "/mock/article1.jpg",
    content: [{ type: "paragraph", content: [{ type: "text", text: "بدأت القصة في صيف 2024..." }] }],
    tiptapContent: true,
    articleText: "بدأت القصة في صيف 2024 عندما قررت أن المحتوى العربي يستحق منصة نشر تليق به. كنت أبحث عن أداة مثل Substack أو Beehiiv لكن بالعربية، ولم أجد شيئا يرضيني.",
    articleHtml: "<p>بدأت القصة في صيف 2024 عندما قررت أن المحتوى العربي يستحق منصة نشر تليق به.</p>",
    wordCount: 2450,
    articleCreatedAt: "2026-02-20T08:00:00.000Z",
    author: USER_ID,
    categories: [CAT_BIZ, CAT_TECH],
    tags: ["ريادة أعمال", "SaaS", "قصة نجاح", "منصة كتابة"],
    coverImage: "/mock/article1.jpg",
    audioUrl: "",
    description: "القصة الكاملة لبناء منصة كتابة من فكرة على ورقة إلى منتج يحقق إيرادات حقيقية",
    publishToSite: true,
    publishToKitabh: true,
    likeCount: 87,
    commentCount: 14,
    views: 3420,
    impressions: 8900,
    status: "published",
    newsletter: NEWSLETTER_ID,
    publishedAt: "2026-02-20T10:00:00.000Z",
    emailStats: {
      sent: 1850, delivered: 1820, opens: 1240, uniqueOpens: 980,
      clicks: 420, uniqueClicks: 310, bounces: 30, unsubscribes: 3,
      openRate: 53.8, clickRate: 17.0,
    },
    createdAt: "2026-02-20T08:00:00.000Z",
    updatedAt: "2026-03-05T12:00:00.000Z",
  },
  {
    _id: "art_002",
    title: "5 أسباب تدفع كل صانع محتوى لتأسيس نشرة بريدية في 2026",
    subTitle: "لماذا لا يزال البريد الإلكتروني أقوى قناة للتواصل مع جمهورك",
    slug: "why-start-newsletter-2026",
    metaTitle: "لماذا تحتاج نشرة بريدية في 2026",
    metaDescription: "البريد الإلكتروني يتفوق على كل منصة تواصل — إليك الأسباب والأرقام",
    metaKeywords: ["نشرة بريدية", "تسويق بالبريد", "صناعة محتوى"],
    metaImage: "/mock/article2.jpg",
    content: [{ type: "paragraph", content: [{ type: "text", text: "في عالم تتغير فيه خوارزميات المنصات كل يوم..." }] }],
    tiptapContent: true,
    articleText: "في عالم تتغير فيه خوارزميات المنصات كل يوم، البريد الإلكتروني يبقى القناة الوحيدة التي تملكها بالكامل. لا خوارزمية تحجب محتواك، ولا منصة تقرر من يرى كلماتك.",
    articleHtml: "<p>في عالم تتغير فيه خوارزميات المنصات كل يوم، البريد الإلكتروني يبقى القناة الوحيدة التي تملكها بالكامل.</p>",
    wordCount: 1800,
    articleCreatedAt: "2026-02-15T09:00:00.000Z",
    author: USER_ID,
    categories: [CAT_WRITING],
    tags: ["نشرة بريدية", "تسويق", "صناعة محتوى"],
    coverImage: "/mock/article2.jpg",
    audioUrl: "/mock/article2-audio.mp3",
    description: "البريد الإلكتروني يتفوق على كل منصة — إليك 5 أسباب تجعل النشرة البريدية ضرورة لكل صانع محتوى",
    publishToSite: true,
    publishToKitabh: true,
    likeCount: 52,
    commentCount: 8,
    views: 2100,
    impressions: 5600,
    status: "published",
    newsletter: NEWSLETTER_ID,
    publishedAt: "2026-02-15T10:00:00.000Z",
    emailStats: {
      sent: 1800, delivered: 1770, opens: 1050, uniqueOpens: 820,
      clicks: 350, uniqueClicks: 260, bounces: 25, unsubscribes: 2,
      openRate: 46.3, clickRate: 14.7,
    },
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-02-28T16:00:00.000Z",
  },
  {
    _id: "art_003",
    title: "من صفر مشترك إلى ألف مشترك: خارطة طريق عملية للنشرة البريدية",
    subTitle: "خطوات مجرّبة لبناء قاعدة مشتركين حقيقية خلال 90 يوما",
    slug: "zero-to-1000-subscribers",
    metaTitle: "كيف تصل لأول ألف مشترك في نشرتك البريدية",
    metaDescription: "خارطة طريق عملية من التجربة لبناء قاعدة مشتركين نشطين",
    metaKeywords: ["مشتركين", "نشرة بريدية", "نمو"],
    metaImage: "/mock/article3.jpg",
    content: [{ type: "paragraph", content: [{ type: "text", text: "الخطوة الأولى هي الأصعب دائما..." }] }],
    tiptapContent: true,
    articleText: "الخطوة الأولى هي الأصعب دائما. عندما أطلقت نشرتي البريدية الأولى، كان عدد المشتركين صفرا بالضبط. لكن خلال 90 يوما، وصلت لأول ألف مشترك باستخدام استراتيجية بسيطة.",
    articleHtml: "<p>الخطوة الأولى هي الأصعب دائما. عندما أطلقت نشرتي البريدية الأولى، كان عدد المشتركين صفرا بالضبط.</p>",
    wordCount: 3200,
    articleCreatedAt: "2026-01-28T07:30:00.000Z",
    author: USER_ID,
    categories: [CAT_WRITING, CAT_BIZ],
    tags: ["نمو", "مشتركين", "استراتيجية", "نشرة بريدية"],
    coverImage: "/mock/article3.jpg",
    audioUrl: "",
    description: "خطة عملية مجرّبة للوصول لأول ألف مشترك في نشرتك البريدية خلال 90 يوما",
    publishToSite: true,
    publishToKitabh: true,
    likeCount: 134,
    commentCount: 22,
    views: 5800,
    impressions: 14200,
    status: "published",
    newsletter: NEWSLETTER_ID,
    publishedAt: "2026-01-28T09:00:00.000Z",
    emailStats: {
      sent: 1600, delivered: 1575, opens: 1100, uniqueOpens: 890,
      clicks: 480, uniqueClicks: 370, bounces: 20, unsubscribes: 1,
      openRate: 56.5, clickRate: 23.5,
    },
    createdAt: "2026-01-28T07:30:00.000Z",
    updatedAt: "2026-02-10T11:00:00.000Z",
  },
  {
    _id: "art_004",
    title: "الذكاء الاصطناعي لن يحلّ محل الكاتب — لكنه سيغيّر طريقة عمله",
    subTitle: "كيف يمكن لصنّاع المحتوى العرب الاستفادة من أدوات الذكاء الاصطناعي",
    slug: "ai-wont-replace-writers",
    metaTitle: "الذكاء الاصطناعي وصناعة المحتوى العربي",
    metaDescription: "لماذا لن يحل الذكاء الاصطناعي محل الكاتب وكيف تستفيد منه كصانع محتوى",
    metaKeywords: ["ذكاء اصطناعي", "كتابة", "أدوات"],
    metaImage: "/mock/article4.jpg",
    content: [{ type: "paragraph", content: [{ type: "text", text: "منذ ظهور ChatGPT..." }] }],
    tiptapContent: true,
    articleText: "منذ ظهور ChatGPT والجميع يتحدث عن نهاية مهنة الكتابة. لكن الواقع يقول العكس تماما — الطلب على المحتوى الأصيل والعميق يزداد، والذكاء الاصطناعي أصبح أداة تمكين لا أداة استبدال.",
    articleHtml: "<p>منذ ظهور ChatGPT والجميع يتحدث عن نهاية مهنة الكتابة. لكن الواقع يقول العكس تماما.</p>",
    wordCount: 2100,
    articleCreatedAt: "2026-01-15T06:00:00.000Z",
    author: USER_ID,
    categories: [CAT_TECH],
    tags: ["ذكاء اصطناعي", "كتابة", "مستقبل العمل", "أدوات"],
    coverImage: "/mock/article4.jpg",
    audioUrl: "/mock/article4-audio.mp3",
    description: "الذكاء الاصطناعي أداة تمكين لا استبدال — كيف يستفيد منه صنّاع المحتوى العرب",
    publishToSite: true,
    publishToKitabh: true,
    likeCount: 73,
    commentCount: 19,
    views: 4100,
    impressions: 10300,
    status: "published",
    newsletter: NEWSLETTER_ID,
    publishedAt: "2026-01-15T08:00:00.000Z",
    emailStats: {
      sent: 1500, delivered: 1480, opens: 920, uniqueOpens: 750,
      clicks: 290, uniqueClicks: 210, bounces: 18, unsubscribes: 4,
      openRate: 50.7, clickRate: 14.2,
    },
    createdAt: "2026-01-15T06:00:00.000Z",
    updatedAt: "2026-02-01T09:00:00.000Z",
  },
  {
    _id: "art_005",
    title: "لماذا توقفت نشرة رسالة السبت؟ وماذا حدث في الشهرين الماضيين",
    subTitle: "شفافية كاملة عن فترة التوقف والدروس المستفادة",
    slug: "why-saturday-letter-stopped",
    metaTitle: "لماذا توقفت نشرة رسالة السبت",
    metaDescription: "شفافية كاملة عن توقف النشرة البريدية وما تعلمته من هذه التجربة",
    metaKeywords: ["نشرة بريدية", "شفافية", "دروس"],
    metaImage: "/mock/article5.jpg",
    content: [{ type: "paragraph", content: [{ type: "text", text: "أعرف أن كثيرا منكم لاحظ غيابي..." }] }],
    tiptapContent: true,
    articleText: "أعرف أن كثيرا منكم لاحظ غيابي عن النشرة في الشهرين الماضيين. اليوم أريد أن أكون صريحا معكم عن السبب، وعن الدروس التي تعلمتها من هذه التجربة.",
    articleHtml: "<p>أعرف أن كثيرا منكم لاحظ غيابي عن النشرة في الشهرين الماضيين.</p>",
    wordCount: 1500,
    articleCreatedAt: "2025-11-10T10:00:00.000Z",
    author: USER_ID,
    categories: [CAT_WRITING],
    tags: ["شفافية", "نشرة بريدية", "إرهاق", "دروس مستفادة"],
    coverImage: "/mock/article5.jpg",
    audioUrl: "",
    description: "شفافية كاملة عن فترة التوقف وما تعلمته — رسالة شخصية لكل قارئ",
    publishToSite: true,
    publishToKitabh: false,
    likeCount: 210,
    commentCount: 45,
    views: 8200,
    impressions: 18500,
    status: "published",
    newsletter: NEWSLETTER_ID,
    publishedAt: "2025-11-10T10:00:00.000Z",
    emailStats: {
      sent: 1400, delivered: 1380, opens: 1150, uniqueOpens: 980,
      clicks: 180, uniqueClicks: 150, bounces: 15, unsubscribes: 0,
      openRate: 71.0, clickRate: 10.9,
    },
    createdAt: "2025-11-10T10:00:00.000Z",
    updatedAt: "2025-11-15T08:00:00.000Z",
  },
  {
    _id: "art_006",
    title: "ملف كامل عن جيل الألفية العرب في 2026: الأرقام والفرص والتحديات",
    subTitle: "تحليل معمّق لسلوك الجيل الذي يشكّل مستقبل المحتوى الرقمي العربي",
    slug: "arab-millennials-2026",
    metaTitle: "جيل الألفية العرب في 2026 — أرقام وفرص",
    metaDescription: "تحليل شامل لجيل الألفية العرب وتأثيرهم على المحتوى الرقمي والاقتصاد الإبداعي",
    metaKeywords: ["جيل الألفية", "محتوى رقمي", "اقتصاد إبداعي"],
    metaImage: "/mock/article6.jpg",
    content: [{ type: "paragraph", content: [{ type: "text", text: "جيل الألفية العرب ليسوا كما تظن..." }] }],
    tiptapContent: true,
    articleText: "جيل الألفية العرب ليسوا كما تظن. هم الجيل الأكثر تعليما والأكثر اتصالا بالإنترنت في تاريخ المنطقة. وهم الذين سيحددون شكل المحتوى الرقمي العربي في العقد القادم.",
    articleHtml: "<p>جيل الألفية العرب ليسوا كما تظن. هم الجيل الأكثر تعليما والأكثر اتصالا بالإنترنت في تاريخ المنطقة.</p>",
    wordCount: 4100,
    articleCreatedAt: "2026-03-01T07:00:00.000Z",
    author: USER_ID,
    categories: [CAT_TECH],
    tags: ["جيل الألفية", "محتوى رقمي", "بيانات", "تحليل"],
    coverImage: "/mock/article6.jpg",
    audioUrl: "/mock/article6-audio.mp3",
    description: "ملف شامل بالأرقام عن سلوك جيل الألفية العرب وتأثيرهم على مستقبل المحتوى الرقمي",
    publishToSite: true,
    publishToKitabh: true,
    likeCount: 45,
    commentCount: 7,
    views: 1900,
    impressions: 4800,
    status: "published",
    newsletter: NEWSLETTER_ID,
    publishedAt: "2026-03-01T09:00:00.000Z",
    emailStats: {
      sent: 1900, delivered: 1870, opens: 1300, uniqueOpens: 1050,
      clicks: 520, uniqueClicks: 390, bounces: 28, unsubscribes: 2,
      openRate: 56.1, clickRate: 20.9,
    },
    createdAt: "2026-03-01T07:00:00.000Z",
    updatedAt: "2026-03-10T14:00:00.000Z",
  },
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
