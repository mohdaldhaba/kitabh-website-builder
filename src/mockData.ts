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
const CAT_ART = "cat_art";
const CAT_MUSIC = "cat_music";
const CAT_CULTURE = "cat_culture";
const CAT_NATURE = "cat_nature";
const CAT_THOUGHT = "cat_thought";

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
  interests: ["فنون", "موسيقى", "ثقافة", "طبيعة"],
  categories: [CAT_ART, CAT_MUSIC, CAT_CULTURE],
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
    _id: CAT_ART,
    name: "فنون",
    description: "مقالات عن الفن التشكيلي والتصوير والعمارة والتصميم",
    slug: "art",
    articles: ["art_001", "art_004", "art_007", "art_011", "art_016"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    _id: CAT_MUSIC,
    name: "موسيقى",
    description: "مقالات عن الموسيقى والإيقاع والصوت والأداء",
    slug: "music",
    articles: ["art_002", "art_005", "art_009", "art_013", "art_018"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    _id: CAT_CULTURE,
    name: "ثقافة",
    description: "مقالات عن الثقافة والأدب والفكر والهوية",
    slug: "culture",
    articles: ["art_003", "art_006", "art_010", "art_014", "art_020"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    _id: CAT_NATURE,
    name: "طبيعة",
    description: "مقالات عن الطبيعة والبيئة والاستكشاف",
    slug: "nature",
    articles: ["art_008", "art_012", "art_015", "art_017"],
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    _id: CAT_THOUGHT,
    name: "تأملات",
    description: "مقالات عن التأمل والفلسفة والوعي",
    slug: "thought",
    articles: ["art_006", "art_010", "art_019", "art_020"],
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
    "الزخرفة الإسلامية: لغة بصرية تتحدث بلا كلمات",
    "كيف حوّل الفنان المسلم القيود إلى إبداع لا نهائي في الهندسة والنمط",
    "islamic-ornament-language", USER_ID, [CAT_ART, CAT_CULTURE],
    ["زخرفة", "فن إسلامي", "هندسة"],
    "حين مُنع الفنان المسلم من تصوير الكائنات الحية، لم يتوقف عن الإبداع بل اخترع لغة بصرية كاملة من الأشكال الهندسية والنباتية لا مثيل لها في تاريخ الفن.",
    2450, "2026-02-20T10:00:00.000Z", 87, 14, 3420,
    "/images/articles/blue-tiles.jpg"),
  mkArticle("art_002",
    "صوت العود في المدينة الحديثة: لماذا يعود الشباب العرب إلى الموسيقى التراثية",
    "موجة جديدة من الموسيقيين تمزج بين المقامات الشرقية والإنتاج الإلكتروني",
    "oud-modern-city", AUTHOR_RAWIYA, [CAT_MUSIC, CAT_CULTURE],
    ["عود", "موسيقى عربية", "تراث"],
    "في استوديوهات بيروت والرياض والقاهرة، جيل جديد من الموسيقيين يعيد اكتشاف العود والقانون والناي، لكن بأسلوب مختلف تماما عما عرفه آباؤهم.",
    1800, "2026-02-15T10:00:00.000Z", 52, 8, 2100,
    "/images/articles/red-light.jpg"),
  mkArticle("art_003",
    "عن الترجمة والخيانة: هل يمكن نقل الشعر العربي إلى لغة أخرى؟",
    "حوار مع مترجمين يحاولون المستحيل في نقل إيقاع القصيدة العربية",
    "translating-arabic-poetry", AUTHOR_FAISAL, [CAT_CULTURE],
    ["ترجمة", "شعر", "لغة عربية"],
    "حين تترجم بيتا لأبي تمام أو درويش، تخسر الوزن والقافية والإيقاع الداخلي. فهل الترجمة خيانة فعلا؟ أم أنها إعادة خلق في ثوب جديد؟",
    3200, "2026-01-28T09:00:00.000Z", 134, 22, 5800,
    "/images/articles/colorful-windows.jpg"),
  mkArticle("art_004",
    "الضوء كمادة خام: فنانون عرب يرسمون بالفراغ والظل",
    "جولة في أعمال فنية معاصرة تستخدم الضوء الطبيعي والاصطناعي كوسيط فني",
    "light-as-art-material", AUTHOR_ABDULRAHMAN, [CAT_ART],
    ["فن معاصر", "ضوء", "تركيبات فنية"],
    "الضوء ليس مجرد أداة إنارة. في أيدي هؤلاء الفنانين العرب تحوّل إلى مادة خام تُشكّل وتُلوّن وتُعيد تعريف المكان والزمان.",
    2100, "2026-01-15T08:00:00.000Z", 73, 19, 4100,
    "/images/articles/abstract-warm.jpg"),
  mkArticle("art_005",
    "المقام العربي: نظام موسيقي أقدم من السلم الغربي وأكثر تعقيدا",
    "رحلة في تاريخ المقامات الموسيقية العربية وتأثيرها على موسيقى العالم",
    "arabic-maqam-system", AUTHOR_BUSHRA, [CAT_MUSIC],
    ["مقامات", "نظرية موسيقية", "تراث"],
    "قبل أن يعرف العالم السلم الموسيقي الغربي بقرون، كان الموسيقيون العرب يعزفون على مقامات تحوي أرباع النغمات وتنقل مشاعر لا يستطيع السلم الغربي التعبير عنها.",
    1500, "2025-12-10T10:00:00.000Z", 210, 45, 8200,
    "/images/articles/yellow-blur.jpg"),
  mkArticle("art_006",
    "وحدة الفنان: لماذا يحتاج المبدع إلى العزلة ليخلق",
    "تأمل في العلاقة بين الوحدة والإبداع من تجارب كتّاب وفنانين عرب",
    "artist-solitude", USER_ID, [CAT_THOUGHT, CAT_CULTURE],
    ["إبداع", "عزلة", "تأمل"],
    "كل عمل فني عظيم وُلد في لحظة صمت. الوحدة ليست عقوبة للفنان بل هي الفضاء الذي تتنفس فيه الأفكار وتأخذ شكلها الحقيقي.",
    4100, "2026-03-01T09:00:00.000Z", 45, 7, 1900,
    "/images/articles/underwater.jpg"),
  mkArticle("art_007",
    "فن الخط العربي في عصر الشاشات: بين الحفاظ والتجديد",
    "كيف يتعامل خطّاطون معاصرون مع التحول الرقمي دون فقدان روح الحرف",
    "arabic-calligraphy-digital", AUTHOR_FAISAL, [CAT_ART, CAT_CULTURE],
    ["خط عربي", "تصميم", "رقمنة"],
    "الخط العربي عاش ألف سنة على الورق والحجر. اليوم يواجه تحديا جديدا: كيف ينتقل إلى الشاشة دون أن يفقد الروح التي في رعشة يد الخطّاط؟",
    2800, "2026-03-05T08:00:00.000Z", 96, 31, 6200,
    "/images/articles/stained-glass.jpg"),
  mkArticle("art_008",
    "البحر الأحمر: عالم تحت الماء لا يعرفه معظم العرب",
    "رحلة مصوّرة في الشعاب المرجانية والحياة البحرية لأحد أغنى بحار العالم",
    "red-sea-underwater", AUTHOR_RAWIYA, [CAT_NATURE],
    ["بحر أحمر", "غوص", "تصوير"],
    "تحت سطح البحر الأحمر يختبئ عالم من الألوان والأشكال لا يصدقه العقل. شعاب مرجانية بعمر مئات السنين وأسماك لا توجد في أي مكان آخر على وجه الأرض.",
    1600, "2026-02-25T07:00:00.000Z", 118, 27, 7300,
    "/images/articles/fish.jpg"),
  mkArticle("art_009",
    "الطرب: حين تصبح الموسيقى حالة روحية لا مجرد أصوات",
    "ما الذي يحدث في الدماغ والجسد حين يصل المستمع العربي إلى حالة الطرب",
    "tarab-spiritual-state", AUTHOR_ABDULRAHMAN, [CAT_MUSIC, CAT_CULTURE],
    ["طرب", "موسيقى", "روحانية"],
    "الطرب ليس مجرد إعجاب بأغنية. إنه حالة فسيولوجية ونفسية فريدة يختبرها المستمع العربي حين تتوافق النغمة مع الكلمة مع لحظة الصمت بينهما.",
    2900, "2026-02-10T09:00:00.000Z", 89, 16, 4500,
    "/images/articles/red-corridor.jpg"),
  mkArticle("art_010",
    "في مديح البطء: لماذا نحتاج أن نتوقف عن الركض",
    "تأملات في ثقافة السرعة وكيف يعيد الفن والطبيعة تعليمنا الصبر",
    "in-praise-of-slowness", AUTHOR_BUSHRA, [CAT_THOUGHT, CAT_CULTURE],
    ["بطء", "تأمل", "حياة"],
    "نعيش في عصر يمجّد السرعة والإنتاجية. لكن أجمل الأشياء في الحياة تحتاج وقتا: نضج الثمرة، تشكّل اللوحة، ولادة القصيدة. هل نسينا كيف ننتظر؟",
    1200, "2026-01-20T08:00:00.000Z", 176, 38, 9100,
    "/images/articles/valley.jpg"),
  mkArticle("art_011",
    "الفسيفساء العربية: حين تصبح القطعة المكسورة جزءا من تحفة",
    "تاريخ فن الفسيفساء في العالم العربي ومعناه الفلسفي العميق",
    "arab-mosaic-art", AUTHOR_FAISAL, [CAT_ART, CAT_CULTURE],
    ["فسيفساء", "فن", "تاريخ"],
    "في الفسيفساء لا توجد قطعة كاملة بذاتها. كل قطعة مكسورة وناقصة، لكنها حين توضع بجانب أخرى تصنع جمالا لا تستطيع أي قطعة وحدها أن تحققه.",
    3500, "2026-03-08T07:00:00.000Z", 67, 24, 3800,
    "/images/articles/red-glass.jpg"),
  mkArticle("art_012",
    "أودية الجزيرة العربية: جنّات مخفية في قلب الصحراء",
    "رحلة استكشافية في أودية لم تطأها قدم سائح من قبل",
    "arabian-hidden-valleys", AUTHOR_RAWIYA, [CAT_NATURE],
    ["طبيعة", "استكشاف", "جزيرة عربية"],
    "على بعد ساعات قليلة من أي مدينة سعودية تختبئ أودية خضراء وشلالات موسمية ونقوش صخرية عمرها آلاف السنين. عالم كامل ينتظر من يكتشفه.",
    2200, "2026-02-05T10:00:00.000Z", 143, 35, 6800,
    "/images/articles/valley.jpg"),
  mkArticle("art_013",
    "من فيروز إلى ترشيش: كيف تتطور الأغنية العربية دون أن تفقد هويتها",
    "قراءة في تحولات الأغنية العربية عبر ثلاثة أجيال من الفنانين",
    "arabic-song-evolution", AUTHOR_ABDULRAHMAN, [CAT_MUSIC],
    ["أغنية عربية", "تطور", "هوية"],
    "بين فيروز وأم كلثوم وعبد الحليم من جهة، وترشيش وتامر أبو غزالة وياسمين حمدان من جهة أخرى، خيط رفيع يربط الأجيال. ما الذي بقي وما الذي تغيّر؟",
    2600, "2026-01-12T09:00:00.000Z", 91, 18, 5200,
    "/images/articles/rainbow.jpg"),
  mkArticle("art_014",
    "الرواية العربية الجديدة: أصوات شابة تعيد تشكيل السرد",
    "جيل جديد من الروائيين العرب يكسر القوالب التقليدية ويكتب بلغة مختلفة",
    "new-arabic-novel", AUTHOR_BUSHRA, [CAT_CULTURE],
    ["رواية", "أدب", "جيل جديد"],
    "بعيدا عن نجيب محفوظ والطيب صالح، ثمة جيل جديد من الروائيين العرب يكتب عن المدينة والهجرة والهوية بأسلوب لا يشبه ما سبقه ولا يعتذر عن اختلافه.",
    1900, "2026-03-02T08:00:00.000Z", 203, 52, 11400,
    "/images/articles/pink-fabric.jpg"),
  mkArticle("art_015",
    "تصوير الصحراء: كيف تلتقط جمال الفراغ واللامتناهي",
    "دروس في التصوير الفوتوغرافي من مصورين متخصصين في المناظر الطبيعية الصحراوية",
    "desert-photography", USER_ID, [CAT_ART, CAT_NATURE],
    ["تصوير", "صحراء", "طبيعة"],
    "الصحراء ليست فراغا. إنها ملايين الدرجات اللونية بين الذهبي والبرتقالي والأحمر. المصور الجيد يرى في الرمل ما لا يراه العابر.",
    2400, "2026-02-18T07:00:00.000Z", 78, 21, 4600,
    "/images/articles/underwater.jpg"),
  mkArticle("art_016",
    "العمارة العربية المعاصرة: بين الموروث والحداثة",
    "كيف يوفّق المعماريون العرب بين الهوية المحلية والتصميم العالمي",
    "modern-arab-architecture", AUTHOR_RAWIYA, [CAT_ART],
    ["عمارة", "تصميم", "هوية"],
    "من مسجد الملك فيصل إلى مكتبة الإسكندرية إلى متحف اللوفر أبوظبي، المعماري العربي يبحث عن توازن دقيق بين الجذور والمستقبل.",
    2000, "2026-01-25T10:00:00.000Z", 64, 11, 3200,
    "/images/articles/blue-glass.jpg"),
  mkArticle("art_017",
    "ألوان الأرض: الصبغات الطبيعية في الفن والنسيج العربي التقليدي",
    "رحلة في عالم الألوان المستخرجة من النباتات والمعادن والحشرات",
    "natural-dyes-arab-art", AUTHOR_FAISAL, [CAT_ART, CAT_NATURE],
    ["ألوان", "نسيج", "حرف تقليدية"],
    "قبل الأصباغ الكيميائية، كان الفنان العربي يستخرج ألوانه من الزعفران والنيلة وقشر الرمان. ألوان حيّة تتنفس وتتغير مع الزمن بدل أن تبهت.",
    3100, "2026-02-28T08:00:00.000Z", 112, 29, 7600,
    "/images/articles/prism.jpg"),
  mkArticle("art_018",
    "إيقاعات الخليج: الطبول التي تروي تاريخ البحّارة والغوّاصين",
    "كيف حفظت الموسيقى الشعبية الخليجية قصص البحر والسفر والعودة",
    "gulf-rhythms-history", AUTHOR_BUSHRA, [CAT_MUSIC, CAT_CULTURE],
    ["موسيقى خليجية", "فنون شعبية", "تراث بحري"],
    "في كل إيقاع خليجي قصة. النهمة كانت أغنية البحّار في عرض البحر، والفجري رقصة الغوّاصين بعد العودة. موسيقى نشأت من الماء والملح والحنين.",
    1700, "2026-01-05T09:00:00.000Z", 88, 15, 3900,
    "/images/articles/basketball.jpg"),
  mkArticle("art_019",
    "الصمت في الشعر العربي: ما لم يقله الشاعر أبلغ مما قاله",
    "قراءة في فراغات القصيدة العربية وما تخبّئه بين السطور",
    "silence-in-arabic-poetry", AUTHOR_ABDULRAHMAN, [CAT_THOUGHT, CAT_CULTURE],
    ["شعر", "صمت", "بلاغة"],
    "أعظم أبيات الشعر العربي ليست تلك التي قالت كل شيء، بل تلك التي تركت فراغا يملؤه القارئ بخياله. الصمت في القصيدة ليس غيابا بل حضور من نوع آخر.",
    2700, "2026-03-06T07:00:00.000Z", 95, 20, 5100,
    "/images/articles/abstract-warm.jpg"),
  mkArticle("art_020",
    "الحنين إلى مكان لم تزره: عن الجمال الذي يؤلم",
    "تأمل في ظاهرة الحنين إلى أماكن لم نعشها وأزمنة لم نعرفها",
    "nostalgia-for-unvisited", AUTHOR_RAWIYA, [CAT_THOUGHT],
    ["حنين", "جمال", "فلسفة"],
    "هل شعرت يوما بالحنين إلى مكان لم تزره؟ إلى مدينة في صورة قديمة أو زمن في رواية؟ هذا الشعور الغريب له اسم في كل لغة، وكل ثقافة تفسّره بطريقتها.",
    3400, "2026-02-12T10:00:00.000Z", 156, 42, 8900,
    "/images/articles/colorful-windows.jpg"),
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
  categories: [CAT_ART, CAT_MUSIC, CAT_CULTURE],
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
