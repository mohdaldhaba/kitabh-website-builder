// ═══════════════════════════════════════════════════════
//  Kitabh Website Builder
//  Newsletter website builder: sites list, template picker,
//  visual builder with live preview, component editor
//  Arabic UI, RTL, Kitabh branding, mobile optimized
// ═══════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef } from "react";
import { MOCK_ARTICLES as RAW_MOCK_ARTICLES, MOCK_AUTHOR, MOCK_AUTHORS_MAP, MOCK_CATEGORIES } from "./mockData";

// ─── Types ──────────────────────────────────────────────
type ViewMode = "sites" | "templates" | "builder";
type SidebarTab = "branding" | "components" | "pages";
type PreviewDevice = "desktop" | "mobile";
type SiteStatus = "published" | "draft";

interface SiteComponent {
  id: string;
  type: ComponentType;
  enabled: boolean;
  settings: Record<string, any>;
}

type ComponentType =
  | "header"
  | "hero_news"
  | "hero_slider"
  | "banner"
  | "subscribe"
  | "article_collection"
  | "footer"
  | "testimonials"
  | "products"
  | "podcast"
  | "courses"
  | "topics"
  | "brands_ticker"
  | "article_view"
  | "text_block"
  | "image_block"
  | "contact_form"
  | "divider"
  | "rich_text"
  | "bento_grid"
  | "social_links"
  | "movies";

interface SitePage {
  id: string;
  name: string;
  slug: string;
  hidden?: boolean;
  components: SiteComponent[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

interface NavLink {
  id: string;
  label: string;
  linkType: "page" | "anchor" | "external";
  target: string; // page slug, anchor component ID, or URL
  visible: boolean;
}

type LogoLayout = "text_only" | "logo_only" | "logo_and_text";

interface SiteBranding {
  logoUrl: string;
  logoLayout: LogoLayout;
  siteName: string;
  accentColor: string;
  buttonColor: string;
  headlineColor: string;
  textColor: string;
  linkColor: string;
  bgColor: string;
  cardBg: string;
  fontFamily: string;
  layoutWidth: "compact" | "full";
  darkMode: boolean;
  borderRadius: number; // 0-100 scale
  popupTitle?: string;
  popupDesc?: string;
  popupButtonText?: string;
  showKitabhBadge?: boolean;
  badgeStyle?: "black" | "blue" | "white";
  badgeScale?: number; // 0-100, default 100
  favicon?: string; // data URL for favicon
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
  categories: string[];
  selected?: boolean;
}

interface Site {
  id: string;
  name: string;
  description: string;
  customDomain: string;
  status: SiteStatus;
  templateId: string;
  branding: SiteBranding;
  pages: SitePage[];
  hasNewsletter: boolean;
  visits: number;
  subscribers: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  defaultBranding?: Partial<SiteBranding>;
  componentOverrides?: Partial<Record<ComponentType, Record<string, any>>>;
}

// ─── Helpers ────────────────────────────────────────────
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0600-\u06FF\-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || "page";
}

// ─── Skeleton Template (single source of truth for structure) ─────
// All design variations inherit pages & components from the skeleton.
// To add a new component or page, add it here — every template gets it automatically.
const SKELETON = {
  pages: ["الرئيسية", "مقالات", "عرض المقال", "عن المدونة", "المتجر", "اشتراك"] as string[],
  defaultComponents: ["header", "hero_news", "brands_ticker", "article_collection", "banner", "subscribe", "article_collection", "banner", "footer"] as ComponentType[],
  defaultBranding: {
    logoUrl: "", logoLayout: "text_only" as LogoLayout, siteName: "شعار المؤسسة",
    accentColor: "#E82222", buttonColor: "#E82222", headlineColor: "#1a1a1a",
    textColor: "#666666", linkColor: "#E82222", bgColor: "#ffffff", cardBg: "#ffffff",
    fontFamily: "Alyamama", layoutWidth: "compact" as "compact" | "full", darkMode: false, borderRadius: 0,
    showKitabhBadge: true, badgeStyle: "black" as "black" | "blue" | "white",
  } as SiteBranding,
};

// ─── Design Variations (visual overrides only) ──────────
// Each template inherits skeleton structure and overrides branding/settings.
const TEMPLATES: Template[] = [
  {
    id: "media",
    name: "مؤسسة إعلامية",
    description: "مثالي للناشرين وصنّاع المحتوى",
  },
];

// ─── Kitabh icons — one per badge style ──────
const KITABH_ICON_BLACK = "/images/kitabh-icon-black.png";
const KITABH_ICON_BLUE = "/images/kitabh-icon-blue.png";
const KITABH_ICON_WHITE = "/images/kitabh-icon-white.png";
// Map badge style → correct icon (white icon on dark bg, black icon on light bg)
const KITABH_ICONS: Record<string, string> = { black: KITABH_ICON_WHITE, blue: KITABH_ICON_WHITE, white: KITABH_ICON_BLACK };

// ─── Image pool (shuffled on each page load) ──────
const IMAGE_POOL = [
  "/images/articles/thumbs/blue-tiles.jpg", "/images/articles/thumbs/red-light.jpg", "/images/articles/thumbs/colorful-windows.jpg",
  "/images/articles/thumbs/abstract-warm.jpg", "/images/articles/thumbs/yellow-blur.jpg", "/images/articles/thumbs/underwater.jpg",
  "/images/articles/thumbs/stained-glass.jpg", "/images/articles/thumbs/fish.jpg", "/images/articles/thumbs/red-corridor.jpg",
  "/images/articles/thumbs/valley.jpg", "/images/articles/thumbs/red-glass.jpg", "/images/articles/thumbs/rainbow.jpg",
  "/images/articles/thumbs/pink-fabric.jpg", "/images/articles/thumbs/blue-glass.jpg", "/images/articles/thumbs/prism.jpg",
  "/images/articles/thumbs/basketball.jpg", "/images/articles/thumbs/coral.jpg", "/images/articles/thumbs/bird.jpg",
  "/images/articles/thumbs/ocean-wave.jpg", "/images/articles/thumbs/sunset.jpg", "/images/articles/thumbs/forest.jpg",
  "/images/articles/thumbs/mountain.jpg", "/images/articles/thumbs/hourglass.jpg", "/images/articles/thumbs/calligraphy.jpg",
  "/images/articles/thumbs/desert-dunes.jpg", "/images/articles/thumbs/vinyl.jpg", "/images/articles/thumbs/gradient.jpg",
  "/images/articles/thumbs/headphones.jpg", "/images/articles/thumbs/bokeh.jpg", "/images/articles/thumbs/paper-art.jpg",
  "/images/articles/thumbs/textile.jpg", "/images/articles/thumbs/pattern.jpg",
];
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const shuffledImages = shuffleArray(IMAGE_POOL);

// ─── Mock articles (derived from mockData.ts — matches MongoDB schema) ──────
const MOCK_ARTICLES: Article[] = RAW_MOCK_ARTICLES.map((a, i) => ({
  id: a._id,
  slug: a.slug,
  title: a.title,
  excerpt: a.description || a.articleText.slice(0, 120),
  imageUrl: shuffledImages[i % shuffledImages.length],
  author: MOCK_AUTHORS_MAP[a.author] || MOCK_AUTHOR.name,
  date: new Date(a.publishedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }),
  likes: a.likeCount,
  comments: a.commentCount,
  shares: a.views,
  categories: a.categories,
}));

const COMPONENT_META: Record<ComponentType, { label: string; hasSettings: boolean }> = {
  header: { label: "رأس الصفحة", hasSettings: true },
  hero_news: { label: "البطل: أخبار", hasSettings: true },

  hero_slider: { label: "البطل: عرض شرائح", hasSettings: true },
  banner: { label: "لافتة", hasSettings: true },
  subscribe: { label: "اشتراك", hasSettings: true },
  article_collection: { label: "مقالات", hasSettings: true },
  footer: { label: "التذييل", hasSettings: true },
  testimonials: { label: "آراء العملاء", hasSettings: true },
  products: { label: "المنتجات", hasSettings: true },
  podcast: { label: "البودكاست", hasSettings: true },
  courses: { label: "الدورات", hasSettings: true },
  topics: { label: "المواضيع", hasSettings: true },
  brands_ticker: { label: "شريط العلامات", hasSettings: true },
  article_view: { label: "عرض المقال", hasSettings: false },
  text_block: { label: "نص", hasSettings: true },
  image_block: { label: "صورة", hasSettings: true },

  contact_form: { label: "نموذج تواصل", hasSettings: true },
  divider: { label: "فاصل", hasSettings: false },
  rich_text: { label: "محتوى منسق", hasSettings: true },
  bento_grid: { label: "بطاقات", hasSettings: true },
  social_links: { label: "روابط التواصل", hasSettings: true },
  movies: { label: "أفلام / مسلسلات", hasSettings: true },

};


const COMPONENT_ICONS: Record<ComponentType, string> = {
  header: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><rect x="2" y="3" width="20" height="4" rx="1"/><line x1="6" y1="11" x2="18" y2="11"/></svg>',
  hero_news: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
  hero_slider: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="15 12 19 12"/><polyline points="5 12 9 12"/></svg>',
  banner: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="18" y2="10"/></svg>',
  subscribe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
  article_collection: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  footer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><rect x="2" y="17" width="20" height="4" rx="1"/><line x1="6" y1="13" x2="18" y2="13"/></svg>',
  testimonials: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  products: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>',
  podcast: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>',
  courses: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0891B2" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
  topics: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
  brands_ticker: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  article_view: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  text_block: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>',
  image_block: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  contact_form: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
  divider: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/></svg>',
  rich_text: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  bento_grid: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D946EF" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  social_links: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  movies: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 7h5"/><path d="M2 12h20"/><path d="M2 17h5"/><path d="M17 7h5"/><path d="M17 17h5"/></svg>',
};

const PRESET_COLORS = ["#E82222", "#0000FF", "#2563EB", "#0891B2", "#10B981", "#F59E0B"];

interface ColorTheme {
  id: string;
  name: string;
  buttonColor: string;
  headlineColor: string;
  textColor: string;
  linkColor: string;
  bgColor: string;
  cardBg: string;
}

const COLOR_THEMES: ColorTheme[] = [
  // ── 1. Standard (white bg, first position) ──
  { id: "clean_light", name: "فاتح بسيط", buttonColor: "#E82222", headlineColor: "#1a1a1a", textColor: "#555555", linkColor: "#E82222", bgColor: "#ffffff", cardBg: "#ffffff" },
  // ── 2. Dark (second position) ──
  { id: "dark_card", name: "داكن كلاسيكي", buttonColor: "#E82222", headlineColor: "#f5f5f5", textColor: "#9e9e9e", linkColor: "#ef5350", bgColor: "#121212", cardBg: "#1e1e1e" },
  // ── Designer themes ──
  { id: "midnight_neon", name: "نيون ليلي", buttonColor: "#EC4899", headlineColor: "#F9FAFB", textColor: "#9CA3AF", linkColor: "#6366F1", bgColor: "#0B0F19", cardBg: "#111827" },
  { id: "arctic_glass", name: "زجاج جليدي", buttonColor: "#2563EB", headlineColor: "#0F172A", textColor: "#64748B", linkColor: "#8B5CF6", bgColor: "#F8FAFC", cardBg: "#FFFFFF" },
  { id: "sunset_editorial", name: "غروب دافئ", buttonColor: "#F97316", headlineColor: "#1F2937", textColor: "#6B7280", linkColor: "#EF4444", bgColor: "#FFF7ED", cardBg: "#FFFFFF" },
  { id: "forest_journal", name: "أخضر الغابة", buttonColor: "#166534", headlineColor: "#052E16", textColor: "#6B7280", linkColor: "#10B981", bgColor: "#F0FDF4", cardBg: "#FFFFFF" },
  { id: "royal_editorial", name: "بنفسجي ملكي", buttonColor: "#7C3AED", headlineColor: "#F8FAFC", textColor: "#94A3B8", linkColor: "#FBBF24", bgColor: "#0F172A", cardBg: "#1E293B" },
  { id: "retro_wave", name: "ريترو", buttonColor: "#D946EF", headlineColor: "#FAFAFA", textColor: "#A1A1AA", linkColor: "#22D3EE", bgColor: "#0A0A0A", cardBg: "#18181B" },
  { id: "minimal_editorial", name: "بسيط", buttonColor: "#3B82F6", headlineColor: "#0F172A", textColor: "#94A3B8", linkColor: "#3B82F6", bgColor: "#FFFFFF", cardBg: "#F8FAFC" },
  { id: "cyber_teal", name: "فيروزي", buttonColor: "#14B8A6", headlineColor: "#E2E8F0", textColor: "#64748B", linkColor: "#22D3EE", bgColor: "#020617", cardBg: "#0F172A" },
  { id: "coffee_magazine", name: "قهوة دافئة", buttonColor: "#7C2D12", headlineColor: "#292524", textColor: "#78716C", linkColor: "#B45309", bgColor: "#FAF7F2", cardBg: "#FFFFFF" },
  { id: "electric_pop", name: "ألوان كهربائية", buttonColor: "#C026D3", headlineColor: "#1E1B4B", textColor: "#6B7280", linkColor: "#F43F5E", bgColor: "#FDF4FF", cardBg: "#FFFFFF" },
  // ── 3. Soft tinted light themes ──
  { id: "soft_blue", name: "أزرق فاتح", buttonColor: "#1565C0", headlineColor: "#0d47a1", textColor: "#546e7a", linkColor: "#1565C0", bgColor: "#e3f2fd", cardBg: "#bbdefb" },
  { id: "soft_orange", name: "برتقالي فاتح", buttonColor: "#e65100", headlineColor: "#bf360c", textColor: "#8d6e63", linkColor: "#e65100", bgColor: "#fff3e0", cardBg: "#ffe0b2" },
  { id: "soft_red", name: "أحمر فاتح", buttonColor: "#c62828", headlineColor: "#b71c1c", textColor: "#8e6565", linkColor: "#c62828", bgColor: "#ffebee", cardBg: "#ffcdd2" },
  { id: "soft_coffee", name: "بني قهوة", buttonColor: "#4e342e", headlineColor: "#3e2723", textColor: "#6d4c41", linkColor: "#5d4037", bgColor: "#efebe9", cardBg: "#d7ccc8" },
  { id: "mint", name: "أخضر نعناعي", buttonColor: "#2e7d32", headlineColor: "#1b5e20", textColor: "#4e6e50", linkColor: "#2e7d32", bgColor: "#e8f5e9", cardBg: "#c8e6c9" },
  { id: "soft_purple", name: "بنفسجي فاتح", buttonColor: "#6a1b9a", headlineColor: "#4a148c", textColor: "#7b6b8a", linkColor: "#7b1fa2", bgColor: "#f3e5f5", cardBg: "#e1bee7" },
  { id: "soft_teal", name: "فيروزي فاتح", buttonColor: "#00695c", headlineColor: "#004d40", textColor: "#4e7a72", linkColor: "#00796b", bgColor: "#e0f2f1", cardBg: "#b2dfdb" },
  { id: "soft_gold", name: "ذهبي فاتح", buttonColor: "#f57f17", headlineColor: "#e65100", textColor: "#8d6e63", linkColor: "#ff8f00", bgColor: "#fffde7", cardBg: "#fff9c4" },
  // ── 4. Deep dark themes ──
  { id: "dark_navy", name: "أزرق بحري داكن", buttonColor: "#00BCD4", headlineColor: "#eceff1", textColor: "#90a4ae", linkColor: "#4dd0e1", bgColor: "#0d1b2a", cardBg: "#1b2838" },
  { id: "dark_coffee", name: "بني داكن", buttonColor: "#ffab40", headlineColor: "#efebe9", textColor: "#bcaaa4", linkColor: "#ffcc80", bgColor: "#1a120e", cardBg: "#2c1e16" },
  { id: "dark_red", name: "أحمر عميق", buttonColor: "#ff5252", headlineColor: "#ffebee", textColor: "#ef9a9a", linkColor: "#ff8a80", bgColor: "#1a0a0a", cardBg: "#2d1414" },
  { id: "dark_blue", name: "أزرق عميق", buttonColor: "#448aff", headlineColor: "#e3f2fd", textColor: "#90caf9", linkColor: "#82b1ff", bgColor: "#0a1628", cardBg: "#142240" },
  { id: "dark_orange", name: "برتقالي عميق", buttonColor: "#ff9100", headlineColor: "#fff3e0", textColor: "#ffcc80", linkColor: "#ffab40", bgColor: "#1a110a", cardBg: "#2d1e10" },
  { id: "wine_dark", name: "أحمر خمري", buttonColor: "#f59e0b", headlineColor: "#fef3c7", textColor: "#d4d4d8", linkColor: "#fbbf24", bgColor: "#1c1917", cardBg: "#292524" },
  { id: "forest", name: "أخضر غابة", buttonColor: "#facc15", headlineColor: "#f0fdf4", textColor: "#86efac", linkColor: "#fde047", bgColor: "#14532d", cardBg: "#166534" },
  { id: "dark_emerald", name: "أخضر زمردي", buttonColor: "#10b981", headlineColor: "#d1fae5", textColor: "#6ee7b7", linkColor: "#34d399", bgColor: "#022c22", cardBg: "#064e3b" },
  { id: "space_gray", name: "أزرق فضائي", buttonColor: "#8b5cf6", headlineColor: "#e2e8f0", textColor: "#94a3b8", linkColor: "#a78bfa", bgColor: "#1e293b", cardBg: "#334155" },
  { id: "royal_purple", name: "بنفسجي داكن", buttonColor: "#a78bfa", headlineColor: "#f5f3ff", textColor: "#c4b5fd", linkColor: "#c084fc", bgColor: "#1e1b4b", cardBg: "#312e81" },
  { id: "sunset_glow", name: "برتقالي الغروب", buttonColor: "#f43f5e", headlineColor: "#fef2f2", textColor: "#fda4af", linkColor: "#fb7185", bgColor: "#1a0a10", cardBg: "#2d1520" },
  // ── 5. Earthy & warm ──
  { id: "elegant_beige", name: "عاجي دافئ", buttonColor: "#6d6132", headlineColor: "#3e2723", textColor: "#795548", linkColor: "#6d6132", bgColor: "#D7CCC8", cardBg: "#efebe9" },
  { id: "natural_green", name: "أخضر طبيعي", buttonColor: "#6d7c3a", headlineColor: "#ffffff", textColor: "#c8e6c9", linkColor: "#aed581", bgColor: "#33691e", cardBg: "#3e7c23" },
  { id: "notebook", name: "ورق دفتر", buttonColor: "#F9A825", headlineColor: "#3e2723", textColor: "#6d4c41", linkColor: "#f57f17", bgColor: "#FFF8E1", cardBg: "#ffffff" },
  { id: "calm_gray", name: "رمادي ناعم", buttonColor: "#1565C0", headlineColor: "#212121", textColor: "#616161", linkColor: "#1976D2", bgColor: "#ECEFF1", cardBg: "#ffffff" },
  // ── 6. Signature & accent ──
  { id: "kitabh_blue", name: "أزرق الحبر", buttonColor: "#1a1aaa", headlineColor: "#ffffff", textColor: "#b0c4ff", linkColor: "#90b0ff", bgColor: "#0000FF", cardBg: "#1a1aff" },
  { id: "neon", name: "نيون ساطع", buttonColor: "#1a1a1a", headlineColor: "#1a1a1a", textColor: "#1b5e20", linkColor: "#1a1a1a", bgColor: "#00FF41", cardBg: "#69f0ae" },
  { id: "bold_yellow", name: "أصفر قوي", buttonColor: "#E82222", headlineColor: "#212121", textColor: "#5d4037", linkColor: "#c62828", bgColor: "#FFC107", cardBg: "#ffd54f" },
  { id: "hot_pink", name: "وردي ناعم", buttonColor: "#FFD600", headlineColor: "#ffffff", textColor: "#fce4ec", linkColor: "#FFD600", bgColor: "#E91E63", cardBg: "#f06292" },
  { id: "ocean_deep", name: "أزرق بحري", buttonColor: "#06b6d4", headlineColor: "#f0f9ff", textColor: "#7dd3fc", linkColor: "#22d3ee", bgColor: "#0c4a6e", cardBg: "#164e63" },
];

// ─── SVG Icons ──────────────────────────────────────────
const Icons = {
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  dots: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>,
  monitor: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  image: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  drag: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  paint: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  gripVertical: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="9" cy="4" r="1.5"/><circle cx="15" cy="4" r="1.5"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><circle cx="9" cy="16" r="1.5"/><circle cx="15" cy="16" r="1.5"/><circle cx="9" cy="22" r="1.5"/><circle cx="15" cy="22" r="1.5"/></svg>,
  chevronLeft: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  heart: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  comment: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  share: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  bookmark: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
};

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function KitabhWebsiteBuilder(props: any) {
  const [sites, setSites] = useState<Site[]>([]);
  const [view, setView] = useState<ViewMode>("sites");
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("components");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const [hoveredCompId, setHoveredCompId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [draggedCompId, setDraggedCompId] = useState<string | null>(null);
  const [dragOverCompId, setDragOverCompId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<"above" | "below" | null>(null);

  // Undo/Redo history
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUndoRedo = useRef(false);
  const prevSitesJson = useRef<string>("");

  // Modals
  const [configModal, setConfigModal] = useState(false);
  const [addPageModal, setAddPageModal] = useState(false);
  const [articlePickerModal, setArticlePickerModal] = useState(false);
  const [articlePickerTarget, setArticlePickerTarget] = useState<string | null>(null);
  const [siteMenuOpen, setSiteMenuOpen] = useState<string | null>(null);

  // Modal drafts
  const [draftPageName, setDraftPageName] = useState("");
  const [draftPageSlug, setDraftPageSlug] = useState("");
  const [draftConfig, setDraftConfig] = useState({ name: "", description: "", customDomain: "" });
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [articleSearch, setArticleSearch] = useState("");
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [articleFilterSearch, setArticleFilterSearch] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState<"signin" | "signup">("signin");
  const [showSeoModal, setShowSeoModal] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [articleFilterCategory, setArticleFilterCategory] = useState<string | null>(null);

  // ─── Undo/Redo tracking ────────
  useEffect(() => {
    if (isUndoRedo.current) { isUndoRedo.current = false; return; }
    const json = JSON.stringify(sites);
    if (json !== prevSitesJson.current && prevSitesJson.current) {
      undoStack.current.push(prevSitesJson.current);
      if (undoStack.current.length > 50) undoStack.current.shift();
      redoStack.current = [];
    }
    prevSitesJson.current = json;
  }, [sites]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(JSON.stringify(sites));
    const prev = undoStack.current.pop()!;
    isUndoRedo.current = true;
    prevSitesJson.current = prev;
    setSites(JSON.parse(prev));
  }, [sites]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(JSON.stringify(sites));
    const next = redoStack.current.pop()!;
    isUndoRedo.current = true;
    prevSitesJson.current = next;
    setSites(JSON.parse(next));
  }, [sites]);

  // Keyboard shortcuts: Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z for redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // ─── Load/Save ────────
  const hasLoaded = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem("kb_websites");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Migrate old component types to consolidated ones
          for (const site of parsed) {
            for (const page of site.pages || []) {
              for (const comp of page.components || []) {
                if (comp.type === "hero_subscribe") { comp.type = "subscribe"; comp.settings = { ...comp.settings, layout: "hero" }; }
                else if (comp.type === "cta_newsletter") { comp.type = "subscribe"; comp.settings = { ...comp.settings, layout: "cta" }; }
                else if (comp.type === "subscribe_form") { comp.type = "subscribe"; comp.settings = { ...comp.settings, layout: "form" }; }
                else if (comp.type === "gallery") { comp.type = "article_collection"; comp.settings = { ...comp.settings, layout: "gallery" }; }
                else if (comp.type === "category_feed") { comp.type = "article_collection"; comp.settings = { ...comp.settings, layout: "category_feed", categoryLayout: comp.settings.layout || "featured_right" }; }
                // Migrate old banner format to cards
                if (comp.type === "banner" && !comp.settings.cards) {
                  comp.settings.cards = [
                    { title: comp.settings.title || "تصفح أرشيف نشرتنا", linkText: "جميع المقالات", linkUrl: comp.settings.linkUrl || "", color: "#E82222", imageUrl: comp.settings.imageUrl || "" },
                    { title: "قصتنا", linkText: "اقرأ المزيد", linkUrl: "", color: "#371D12", imageUrl: "" },
                  ];
                }
                // Migrate hero_centered from header to subscribe
                if (comp.type === "header" && comp.settings.layout === "hero_centered") {
                  comp.settings.layout = "navbar";
                  // Create a new subscribe component with hero_centered layout after this header
                  const newSub = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type: "subscribe", enabled: true, settings: { layout: "hero_centered", title: comp.settings.heroTitle || "", subtitle: comp.settings.subtitle || "", heroImageUrl: comp.settings.heroImageUrl || "", buttonText: comp.settings.buttonText || "اشتراك" } };
                  const idx = page.components.indexOf(comp);
                  page.components.splice(idx + 1, 0, newSub);
                  delete comp.settings.heroImageUrl; delete comp.settings.heroTitle;
                }
              }
            }
          }
          setSites(parsed);
          prevSitesJson.current = JSON.stringify(parsed);
        }
      }
    } catch (_) {}
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("kb_websites", JSON.stringify(sites));
      }
    } catch (_) {}
  }, [sites]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => { setSiteMenuOpen(null); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const activeSite = sites.find(s => s.id === activeSiteId) || null;
  const activePage = activeSite?.pages.find(p => p.id === activePageId) || activeSite?.pages[0] || null;

  const updateSite = useCallback((id: string, updates: Partial<Site>) => {
    setSites(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
  }, []);

  // ─── Sites list actions ────────
  const deleteSite = (id: string) => {
    setSites(prev => prev.filter(s => s.id !== id));
    setSiteMenuOpen(null);
  };

  const duplicateSite = (id: string) => {
    const src = sites.find(s => s.id === id);
    if (!src) return;
    const dup: Site = { ...JSON.parse(JSON.stringify(src)), id: genId(), name: src.name + " (نسخة)", status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setSites(prev => [dup, ...prev]);
    setSiteMenuOpen(null);
  };

  const openConfig = (id: string) => {
    const s = sites.find(x => x.id === id);
    if (!s) return;
    setDraftConfig({ name: s.name, description: s.description, customDomain: s.customDomain });
    setActiveSiteId(id);
    setConfigModal(true);
    setSiteMenuOpen(null);
  };

  const saveConfig = () => {
    if (!activeSiteId) return;
    updateSite(activeSiteId, { name: draftConfig.name, description: draftConfig.description, customDomain: draftConfig.customDomain });
    setConfigModal(false);
  };

  // ─── Default components per page type ────────
  function getPageDefaultComponents(pageName: string): SiteComponent[] {
    const header: SiteComponent = { id: genId(), type: "header", enabled: true, settings: getDefaultSettings("header") };
    const footer: SiteComponent = { id: genId(), type: "footer", enabled: true, settings: getDefaultSettings("footer") };
    switch (pageName) {
      case "مقالات":
        return [header, { id: genId(), type: "article_collection", enabled: true, settings: { articles: MOCK_ARTICLES.map(a => a.id), title: "جميع المقالات" } }, { id: genId(), type: "subscribe", enabled: true, settings: { ...getDefaultSettings("subscribe"), layout: "cta" } }, footer];
      case "عن المدونة":
        return [header, { id: genId(), type: "subscribe", enabled: true, settings: { layout: "hero", title: "من نحن", subtitle: "تعرّف على قصتنا ورؤيتنا", buttonText: "اشتراك" } }, { id: genId(), type: "banner", enabled: true, settings: getDefaultSettings("banner") }, footer];
      case "اشتراك":
        return [header, { id: genId(), type: "subscribe", enabled: true, settings: getDefaultSettings("subscribe") }, { id: genId(), type: "subscribe", enabled: true, settings: { ...getDefaultSettings("subscribe"), layout: "cta" } }, footer];
      case "تواصل":
        return [header, { id: genId(), type: "subscribe", enabled: true, settings: { layout: "hero", title: "تواصل معنا", subtitle: "نسعد بتواصلك معنا عبر البريد الإلكتروني", buttonText: "أرسل" } }, footer];
      case "المتجر":
        return [header, { id: genId(), type: "subscribe", enabled: true, settings: { layout: "hero", title: "المتجر", subtitle: "تصفح منتجاتنا الحصرية", buttonText: "تسوّق" } }, { id: genId(), type: "banner", enabled: true, settings: getDefaultSettings("banner") }, footer];
      case "عرض المقال":
        return [header, { id: genId(), type: "article_view", enabled: true, settings: {} }, { id: genId(), type: "subscribe", enabled: true, settings: { ...getDefaultSettings("subscribe"), layout: "cta" } }, footer];
      default:
        return [header, { id: genId(), type: "subscribe", enabled: true, settings: { layout: "hero", title: pageName, subtitle: `جميع المقالات عن ${pageName}`, buttonText: "اشتراك" } }, { id: genId(), type: "article_collection", enabled: true, settings: { ...getDefaultSettings("article_collection"), articles: MOCK_ARTICLES.map(a => a.id), title: `مقالات ${pageName}` } }, { id: genId(), type: "subscribe", enabled: true, settings: { ...getDefaultSettings("subscribe"), layout: "cta" } }, footer];
    }
  }

  // ─── Create from template ────────
  const createFromTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    // Merge skeleton branding with template's visual overrides
    const branding: SiteBranding = { ...SKELETON.defaultBranding, ...(tpl.defaultBranding || {}) };

    // Build pages from skeleton structure
    const pages: SitePage[] = SKELETON.pages.map(name => ({
      id: genId(),
      name,
      slug: slugify(name),
      components: name === "الرئيسية" || name === SKELETON.pages[0]
        ? SKELETON.defaultComponents.map(type => {
            const baseSettings = getDefaultSettings(type);
            const overrides = tpl.componentOverrides?.[type] || {};
            return { id: genId(), type, enabled: true, settings: { ...baseSettings, ...overrides } };
          })
        : getPageDefaultComponents(name),
    }));

    const site: Site = {
      id: genId(),
      name: "موقع جديد",
      description: "",
      customDomain: "",
      status: "draft",
      templateId,
      branding,
      pages,
      hasNewsletter: true,
      visits: 0,
      subscribers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSites(prev => [site, ...prev]);
    setActiveSiteId(site.id);
    setActivePageId(site.pages[0].id);
    setView("builder");
    setSidebarTab("components");
  };

  function getDefaultSettings(type: ComponentType): Record<string, any> {
    switch (type) {
      case "header": return { layout: "navbar", subtitle: "", logoUrl: "", buttonText: "اشتراك", navLinks: [
        { id: genId(), label: "الرئيسية", linkType: "page", target: "", visible: true },
        { id: genId(), label: "مقالات", linkType: "page", target: "", visible: true },
        { id: genId(), label: "عن المدونة", linkType: "page", target: "", visible: true },
        { id: genId(), label: "اشتراك", linkType: "anchor", target: "", visible: true },
      ] as NavLink[] };
      case "hero_news": return { articles: MOCK_ARTICLES.slice(0, 5).map(a => a.id) };
      case "subscribe": return { layout: "hero", title: "انضم لنشرتنا البريدية", subtitle: "محتوى حصري يصلك كل أسبوع", description: "محتوى حصري يصلك مباشرة إلى بريدك", buttonText: "اشتراك", showNameField: false, heroImageUrl: "" };
      case "hero_slider": return { articles: MOCK_ARTICLES.slice(0, 3).map(a => a.id) };
      case "banner": return { cards: [
        { title: "تصفح أرشيف نشرتنا", linkText: "جميع المقالات", linkUrl: "", color: "", imageUrl: "" },
        { title: "قصتنا", linkText: "اقرأ المزيد", linkUrl: "", color: "", imageUrl: "" },
      ] };

      case "article_collection": return { layout: "grid", articles: MOCK_ARTICLES.slice(0, 4).map(a => a.id), title: "", showSearch: false, showCategories: false };
      case "footer": return { logoUrl: "", title: "", buttonText: "اشتراك", links: [], customText: "", customLinks: [] as { label: string; url: string }[] };
      case "article_view": return {};
      case "text_block": return { content: "أضف نصك هنا..." };
      case "image_block": return { imageUrl: "", caption: "" };

      case "contact_form": return { title: "تواصل معنا", buttonText: "إرسال" };
      case "brands_ticker": return { speed: 30, items: [] };
      case "divider": return {};
      case "rich_text": return { html: "<h2>عنوان القسم</h2><p>هذا نص تجريبي يمكنك تعديله. يدعم النص العريض والمائل والعناوين والقوائم.</p>" };
      case "movies": return { sectionTitle: "أفلام ومسلسلات", items: [
        { title: "اسم الفيلم", subtitle: "وصف قصير عن الفيلم", imageUrl: "", url: "", buttonText: "شاهد الآن" },
        { title: "اسم المسلسل", subtitle: "وصف قصير عن المسلسل", imageUrl: "", url: "", buttonText: "شاهد الآن" },
      ] };
      case "social_links": return { platforms: [
        { platform: "twitter", url: MOCK_AUTHOR.socials.twitter, enabled: true },
        { platform: "instagram", url: MOCK_AUTHOR.socials.instagram, enabled: true },
        { platform: "youtube", url: MOCK_AUTHOR.socials.youtube, enabled: true },
        { platform: "linkedin", url: MOCK_AUTHOR.socials.linkedin, enabled: true },
        { platform: "website", url: MOCK_AUTHOR.socials.website, enabled: true },
        { platform: "tiktok", url: "", enabled: false },
        { platform: "snapchat", url: "", enabled: false },
        { platform: "facebook", url: "", enabled: false },
        { platform: "threads", url: "", enabled: false },
        { platform: "telegram", url: "", enabled: false },
        { platform: "whatsapp", url: "", enabled: false },
        { platform: "pinterest", url: "", enabled: false },
        { platform: "spotify", url: "", enabled: false },
      ] };
      case "bento_grid": return { layout: "2-1" as string, items: [
        { title: "عنوان البطاقة الأولى", text: "نص وصفي قصير للبطاقة", imageUrl: "", linkUrl: "" },
        { title: "عنوان البطاقة الثانية", text: "نص وصفي قصير للبطاقة", imageUrl: "", linkUrl: "" },
        { title: "عنوان البطاقة الثالثة", text: "نص وصفي قصير للبطاقة", imageUrl: "", linkUrl: "" },
      ] };
      case "testimonials": return { sectionTitle: "آراء العملاء", layout: "grid", items: [
        { name: "أحمد محمد", role: "كاتب محتوى", text: "منصة رائعة ساعدتني في بناء جمهوري", imageUrl: "" },
        { name: "سارة العلي", role: "صحفية", text: "أفضل أداة لإدارة النشرات البريدية", imageUrl: "" },
        { name: "خالد الراشد", role: "مدوّن", text: "تجربة مستخدم ممتازة وسهلة الاستخدام", imageUrl: "" },
      ] };
      case "products": return { sectionTitle: "المنتجات", layout: "grid", items: [
        { title: "كتاب إلكتروني", subtitle: "دليلك الشامل للكتابة", price: "٤٩ ر.س", imageUrl: "", url: "", buttonText: "اشتري الآن" },
        { title: "دورة الكتابة", subtitle: "تعلم أساسيات الكتابة الإبداعية", price: "١٩٩ ر.س", imageUrl: "", url: "", buttonText: "سجّل الآن" },
      ] };
      case "podcast": return { sectionTitle: "البودكاست", layout: "list", programs: [
        { name: "بودكاست الكتابة", description: "نصائح عملية للكتّاب", imageUrl: "", url: "", episodes: [
          { title: "كيف تبدأ نشرتك البريدية", subtitle: "نصائح عملية للمبتدئين", duration: "٤٥ دقيقة", url: "" },
          { title: "أسرار كتابة عنوان جذاب", subtitle: "تقنيات مجرّبة لزيادة معدل الفتح", duration: "٣٠ دقيقة", url: "" },
        ]},
      ] };
      case "courses": return { sectionTitle: "الدورات", layout: "grid", items: [
        { title: "أساسيات الكتابة الإبداعية", subtitle: "١٢ درس | ٦ ساعات", price: "٢٩٩ ر.س", imageUrl: "", url: "", buttonText: "سجّل الآن" },
        { title: "التسويق بالمحتوى", subtitle: "٨ دروس | ٤ ساعات", price: "١٩٩ ر.س", imageUrl: "", url: "", buttonText: "سجّل الآن" },
      ] };
      case "topics": return { sectionTitle: "المواضيع", layout: "grid", items: [
        { title: "الكتابة", icon: "", url: "" },
        { title: "التسويق", icon: "", url: "" },
        { title: "التقنية", icon: "", url: "" },
        { title: "ريادة الأعمال", icon: "", url: "" },
        { title: "الإنتاجية", icon: "", url: "" },
        { title: "التصميم", icon: "", url: "" },
      ] };
      default: return {};
    }
  }

  // ─── Builder actions ────────
  const openBuilder = (id: string) => {
    setActiveSiteId(id);
    const s = sites.find(x => x.id === id);
    if (s?.pages[0]) setActivePageId(s.pages[0].id);
    setView("builder");
    setSidebarTab("components");
  };

  const toggleComponent = (compId: string) => {
    if (!activeSiteId || !activePageId) return;
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        pages: s.pages.map(p => {
          if (p.id !== activePageId) return p;
          return { ...p, components: p.components.map(c => c.id === compId ? { ...c, enabled: !c.enabled } : c) };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const updateComponentSettings = (compId: string, settings: Record<string, any>) => {
    if (!activeSiteId || !activePageId) return;
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        pages: s.pages.map(p => {
          if (p.id !== activePageId) return p;
          return { ...p, components: p.components.map(c => c.id === compId ? { ...c, settings: { ...c.settings, ...settings } } : c) };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const addPage = (presetName?: string) => {
    if (!activeSiteId) return;
    const pageName = (presetName || draftPageName).trim();
    if (!pageName) return;
    const slug = !presetName && draftPageSlug.trim() ? draftPageSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") : slugify(pageName);
    const newPage: SitePage = {
      id: genId(), name: pageName, slug,
      components: getPageDefaultComponents(pageName),
    };
    const updatedPages = [...(activeSite?.pages || []), newPage];
    // Auto-add nav link to all header components
    const pagesWithNav = updatedPages.map(p => ({
      ...p,
      components: p.components.map(c => {
        if (c.type !== "header") return c;
        const navLinks = (c.settings.navLinks || []).map((l: any) =>
          typeof l === "string" ? { id: genId(), label: l, linkType: "page", target: "", visible: true } : l
        );
        const alreadyLinked = navLinks.some((l: any) => l.target === slug);
        if (alreadyLinked) return c;
        return { ...c, settings: { ...c.settings, navLinks: [...navLinks, { id: genId(), label: pageName, linkType: "page", target: slug, visible: true }] } };
      }),
    }));
    updateSite(activeSiteId, { pages: pagesWithNav });
    setActivePageId(newPage.id);
    setSidebarTab("components");
    setDraftPageName("");
    setDraftPageSlug("");
    setAddPageModal(false);
  };

  const updatePageField = (pageId: string, field: "name" | "slug" | "hidden", value: any) => {
    if (!activeSiteId || !activeSite) return;
    const pages = activeSite.pages.map(p => {
      if (p.id !== pageId) return p;
      if (field === "slug") return { ...p, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") };
      return { ...p, [field]: value };
    });
    updateSite(activeSiteId, { pages });
  };

  const addComponentToPage = (type: ComponentType) => {
    if (!activeSiteId || !activePageId) return;
    const comp: SiteComponent = { id: genId(), type, enabled: true, settings: getDefaultSettings(type) };
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        pages: s.pages.map(p => {
          if (p.id !== activePageId) return p;
          const footerIdx = p.components.findIndex(c => c.type === "footer");
          const comps = [...p.components];
          if (footerIdx >= 0) comps.splice(footerIdx, 0, comp);
          else comps.push(comp);
          return { ...p, components: comps };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
    setExpandedComponent(comp.id);
    setTimeout(() => {
      const el = document.querySelector(`[data-comp-id="${comp.id}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const insertComponentAt = (type: ComponentType, index: number) => {
    if (!activeSiteId || !activePageId) return;
    const comp: SiteComponent = { id: genId(), type, enabled: true, settings: getDefaultSettings(type) };
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        pages: s.pages.map(p => {
          if (p.id !== activePageId) return p;
          const comps = [...p.components];
          comps.splice(index, 0, comp);
          return { ...p, components: comps };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
    setInsertAtIndex(null);
    setExpandedComponent(comp.id);
    setSidebarTab("components");
    setTimeout(() => {
      const el = document.querySelector(`[data-comp-id="${comp.id}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const INSERT_TYPES: ComponentType[] = ["header", "hero_news", "subscribe", "article_collection", "bento_grid", "banner", "brands_ticker", "testimonials", "products", "movies", "podcast", "courses", "topics", "text_block", "rich_text", "image_block", "contact_form", "social_links", "divider", "footer"];

  // ─── Move component up/down ────────
  const moveComponent = (compId: string, direction: "up" | "down") => {
    if (!activeSiteId || !activePageId) return;
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        pages: s.pages.map(p => {
          if (p.id !== activePageId) return p;
          const comps = [...p.components];
          const idx = comps.findIndex(c => c.id === compId);
          if (idx < 0) return p;
          const targetIdx = direction === "up" ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= comps.length) return p;
          [comps[idx], comps[targetIdx]] = [comps[targetIdx], comps[idx]];
          return { ...p, components: comps };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  // ─── Remove component ────────
  const removeComponent = (compId: string) => {
    if (!activeSiteId || !activePageId) return;
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        pages: s.pages.map(p => {
          if (p.id !== activePageId) return p;
          return { ...p, components: p.components.filter(c => c.id !== compId) };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
    if (expandedComponent === compId) setExpandedComponent(null);
  };

  // ─── Duplicate component ────────
  const duplicateComponent = (compId: string) => {
    if (!activeSiteId || !activePageId) return;
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        pages: s.pages.map(p => {
          if (p.id !== activePageId) return p;
          const idx = p.components.findIndex(c => c.id === compId);
          if (idx < 0) return p;
          const original = p.components[idx];
          const clone = { ...original, id: genId(), settings: JSON.parse(JSON.stringify(original.settings)) };
          const newComps = [...p.components];
          newComps.splice(idx + 1, 0, clone);
          return { ...p, components: newComps };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  // ─── Drag-and-drop reorder ────────
  const reorderComponent = (fromId: string, toId: string, position: "above" | "below") => {
    if (!activeSiteId || !activePageId || fromId === toId) return;
    setSites(prev => prev.map(s => {
      if (s.id !== activeSiteId) return s;
      return {
        ...s,
        pages: s.pages.map(p => {
          if (p.id !== activePageId) return p;
          const comps = p.components.filter(c => c.id !== fromId);
          const movedComp = p.components.find(c => c.id === fromId);
          if (!movedComp) return p;
          const targetIdx = comps.findIndex(c => c.id === toId);
          if (targetIdx < 0) return p;
          const insertIdx = position === "below" ? targetIdx + 1 : targetIdx;
          comps.splice(insertIdx, 0, movedComp);
          return { ...p, components: comps };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const handleDragOver = (e: React.DragEvent, compId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (compId === draggedCompId) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverCompId(compId);
    setDragOverPosition(e.clientY < midY ? "above" : "below");
  };

  const handleDrop = (e: React.DragEvent, compId: string) => {
    e.preventDefault();
    if (draggedCompId && dragOverPosition && draggedCompId !== compId) {
      reorderComponent(draggedCompId, compId, dragOverPosition);
    }
    setDraggedCompId(null);
    setDragOverCompId(null);
    setDragOverPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedCompId(null);
    setDragOverCompId(null);
    setDragOverPosition(null);
  };

  // ─── File upload (local preview via FileReader) ────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ type: "branding_logo" | "branding_favicon" | "comp_logo" | "comp_banner" | "testi_img" | "ticker_img" | "gallery_sidebar" | "podcast_cover" | "header_hero_img" | "movie_poster" | "banner_card_img"; compId?: string; itemIndex?: number } | null>(null);

  const triggerUpload = (target: typeof uploadTarget) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget || !activeSiteId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (uploadTarget.type === "branding_logo") {
        const newLayout = activeSite!.branding.logoLayout === "text_only" ? "logo_and_text" : activeSite!.branding.logoLayout;
        updateSite(activeSiteId, { branding: { ...activeSite!.branding, logoUrl: dataUrl, logoLayout: newLayout } });
      } else if (uploadTarget.type === "branding_favicon") {
        updateSite(activeSiteId, { branding: { ...activeSite!.branding, favicon: dataUrl } });
      } else if (uploadTarget.type === "comp_logo" && uploadTarget.compId) {
        updateComponentSettings(uploadTarget.compId, { logoUrl: dataUrl });
      } else if (uploadTarget.type === "comp_banner" && uploadTarget.compId) {
        updateComponentSettings(uploadTarget.compId, { imageUrl: dataUrl });
      } else if (uploadTarget.type === "gallery_sidebar" && uploadTarget.compId) {
        updateComponentSettings(uploadTarget.compId, { sidebarImageUrl: dataUrl });
      } else if ((uploadTarget.type === "testi_img" || uploadTarget.type === "ticker_img") && uploadTarget.compId && uploadTarget.itemIndex !== undefined) {
        const comp = activeSite!.pages.flatMap(p => p.components).find(c => c.id === uploadTarget.compId);
        if (comp) {
          const items = [...(comp.settings.items || [])];
          items[uploadTarget.itemIndex] = { ...items[uploadTarget.itemIndex], imageUrl: dataUrl };
          updateComponentSettings(uploadTarget.compId, { items });
        }
      } else if (uploadTarget.type === "podcast_cover" && uploadTarget.compId && uploadTarget.itemIndex !== undefined) {
        const comp = activeSite!.pages.flatMap(p => p.components).find(c => c.id === uploadTarget.compId);
        if (comp) {
          const programs = [...(comp.settings.programs || [])];
          programs[uploadTarget.itemIndex] = { ...programs[uploadTarget.itemIndex], imageUrl: dataUrl };
          updateComponentSettings(uploadTarget.compId, { programs });
        }
      } else if (uploadTarget.type === "header_hero_img" && uploadTarget.compId) {
        updateComponentSettings(uploadTarget.compId, { heroImageUrl: dataUrl });
      } else if (uploadTarget.type === "movie_poster" && uploadTarget.compId && uploadTarget.itemIndex !== undefined) {
        const comp = activeSite!.pages.flatMap(p => p.components).find(c => c.id === uploadTarget.compId);
        if (comp) {
          const items = [...(comp.settings.items || [])];
          items[uploadTarget.itemIndex] = { ...items[uploadTarget.itemIndex], imageUrl: dataUrl };
          updateComponentSettings(uploadTarget.compId, { items });
        }
      } else if (uploadTarget.type === "banner_card_img" && uploadTarget.compId && uploadTarget.itemIndex !== undefined) {
        const comp = activeSite!.pages.flatMap(p => p.components).find(c => c.id === uploadTarget.compId);
        if (comp) {
          const cards = [...(comp.settings.cards || [])];
          cards[uploadTarget.itemIndex] = { ...cards[uploadTarget.itemIndex], imageUrl: dataUrl };
          updateComponentSettings(uploadTarget.compId, { cards });
        }
      }
      setUploadTarget(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ─── Custom color picker ────────
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [colorTarget, setColorTarget] = useState<{ type: "branding" | "comp"; compId?: string; field?: string } | null>(null);

  const triggerColorPicker = (target: typeof colorTarget) => {
    setColorTarget(target);
    setTimeout(() => {
      if (colorInputRef.current) {
        // Set initial value based on target
        let initial = "#E82222";
        if (target?.type === "branding") {
          const f = target.field || "buttonColor";
          initial = (activeSite?.branding as any)?.[f] || "#E82222";
        } else if (target?.type === "comp" && target.compId) {
          const comp = activeSite?.pages.flatMap(p => p.components).find(c => c.id === target.compId);
          const f = target.field || "buttonColor";
          initial = comp?.settings?.[f] || activeSite?.branding.buttonColor || "#E82222";
        }
        colorInputRef.current.value = initial;
        colorInputRef.current.click();
      }
    }, 100);
  };

  const handleColorChange = (e: any) => {
    const color = e.target.value;
    if (!colorTarget || !activeSiteId) return;
    const field = colorTarget.field || "buttonColor";
    if (colorTarget.type === "branding") {
      if (field === "buttonColor") {
        updateSite(activeSiteId, { branding: { ...activeSite!.branding, buttonColor: color, accentColor: color } });
      } else {
        updateSite(activeSiteId, { branding: { ...activeSite!.branding, [field]: color } });
      }
    } else if (colorTarget.type === "comp" && colorTarget.compId) {
      updateComponentSettings(colorTarget.compId, { [field]: color });
    }
  };

  // ─── Move page up/down ────────
  const movePage = (pageId: string, direction: "up" | "down") => {
    if (!activeSiteId || !activeSite) return;
    const pages = [...activeSite.pages];
    const idx = pages.findIndex(p => p.id === pageId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    [pages[idx], pages[targetIdx]] = [pages[targetIdx], pages[idx]];
    updateSite(activeSiteId, { pages });
  };

  // ─── Delete page ────────
  const deletePage = (pageId: string) => {
    if (!activeSiteId || !activeSite || activeSite.pages.length <= 1) return;
    const pages = activeSite.pages.filter(p => p.id !== pageId);
    updateSite(activeSiteId, { pages });
    if (activePageId === pageId) setActivePageId(pages[0]?.id || null);
  };

  // ─── Open full preview in new tab ────────
  const openPreviewTab = () => {
    if (!activeSite || typeof window === "undefined") return;
    const previewWindow = window.open("", "_blank");
    if (!previewWindow) return;
    const ff = activeSite.branding.fontFamily || "Alyamama";
    const ll = activeSite.branding.logoLayout || "text_only";
    const bc = activeSite.branding.buttonColor || "#E82222";
    const sn = activeSite.branding.siteName || "";
    const lu = activeSite.branding.logoUrl || "";
    const lw = activeSite.branding.layoutWidth || "compact";
    const dm = activeSite.branding.darkMode || false;
    const bgc = activeSite.branding.bgColor || "#ffffff";
    const cbg = activeSite.branding.cardBg || "#ffffff";
    const hlc = activeSite.branding.headlineColor || "#1a1a1a";
    const txc = activeSite.branding.textColor || "#666666";
    const lkc = activeSite.branding.linkColor || bc;
    const br = Math.round((activeSite.branding.borderRadius || 0) * 0.24);

    const allPages = activeSite.pages;
    // Get nav links from header component settings
    const headerComp = allPages.flatMap(p => p.components).find(c => c.type === "header");
    const rawNavLinks = headerComp?.settings?.navLinks || [];
    const navHtml = rawNavLinks
      .filter((link: any) => typeof link === "string" ? true : link.visible)
      .map((link: any) => {
        if (typeof link === "string") return `<a href="#" class="pv-nav-link">${link}</a>`;
        const href = link.linkType === "external" ? link.target : link.linkType === "page" ? `#page-${link.target}` : `#${link.target}`;
        const ext = link.linkType === "external" ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${href}" class="pv-nav-link"${ext}>${link.label}</a>`;
      }).join("");

    let logoHtml = "";
    if ((ll === "logo_only" || ll === "logo_and_text") && lu) logoHtml += `<img src="${lu}" alt="" class="pv-logo-img" />`;
    if (ll === "text_only" || ll === "logo_and_text") logoHtml += `<span class="pv-logo-text">${sn}</span>`;

    // Get subscribe component subtitle for article CTA
    const subComp = allPages.flatMap(p => p.components).find(c => c.type === "subscribe");
    const subTitle = subComp?.settings?.subtitle || subComp?.settings?.description || "محتوى حصري يصلك كل أسبوع";
    const subBtnText = subComp?.settings?.buttonText || "اشتراك";
    const subBtnColor = subComp?.settings?.buttonColor || bc;

    let pagesHtml = "";
    allPages.forEach((page, pi) => {
      let pc = "";
      page.components.filter(c => c.enabled).forEach(comp => {
        const s = comp.settings;
        switch (comp.type) {
          case "header":
            if (pi === 0) {
              const mobileNavHtml = rawNavLinks.filter((link: any) => typeof link === "string" ? true : link.visible).map((link: any) => {
                const label = typeof link === "string" ? link : link.label;
                const href = typeof link === "string" ? "#" : link.linkType === "external" ? link.target : link.linkType === "page" ? `#page-${link.target}` : `#${link.target}`;
                const ext = typeof link !== "string" && link.linkType === "external" ? ' target="_blank" rel="noopener"' : '';
                return `<a href="${href}" class="pv-mobile-nav-link"${ext}>${label}</a>`;
              }).join("");
              pc += `<header class="pv-header"><div class="pv-header-inner"><div class="pv-logo-wrap">${logoHtml}</div><nav class="pv-nav">${navHtml}</nav><div class="pv-header-actions"><button class="pv-login-btn" onclick="document.getElementById('pv-login-modal')?.showModal()">الدخول</button><button class="pv-btn" style="background:${bc}">${s.buttonText || "اشتراك"}</button><button class="pv-darkmode-btn" onclick="document.documentElement.classList.toggle('dark');this.textContent=document.documentElement.classList.contains('dark')?'☀':'☾'" title="الوضع الداكن">${dm ? '☀' : '☾'}</button></div><button class="pv-hamburger" onclick="document.getElementById('pv-mobile-menu').classList.toggle('pv-mobile-menu-open')" aria-label="القائمة"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button></div><div id="pv-mobile-menu" class="pv-mobile-menu"><nav class="pv-mobile-nav">${mobileNavHtml}</nav><div class="pv-mobile-menu-actions"><button class="pv-login-btn" style="width:100%">الدخول</button><button class="pv-btn" style="background:${bc};width:100%">${s.buttonText || "اشتراك"}</button><button class="pv-darkmode-btn" onclick="document.documentElement.classList.toggle('dark');this.textContent=document.documentElement.classList.contains('dark')?'☀':'☾'">${dm ? '☀' : '☾'}</button></div></div></header>`;
            }
            break;
          case "hero_news":
            const ha = (s.articles || []).map((id: string) => MOCK_ARTICLES.find(a => a.id === id)).filter(Boolean);
            const ma = ha[0]; const sa = ha.slice(1, 5);
            const heroImg = (a: any) => a.imageUrl ? `<img src="${a.imageUrl}" alt="${a.title}" style="width:100%;height:200px;object-fit:cover;display:block;border-radius:var(--pv-radius)"/>` : `<div class="pv-img" style="height:200px"></div>`;
            const sideR = sa.slice(0, 2).map((a: any) => `<div class="pv-hero-side-card" data-article-id="${a.id}" style="cursor:pointer">${heroImg(a)}<h4>${a.title.slice(0, 60)}...</h4><div class="pv-author-row"><div class="pv-avatar">${a.author.charAt(0)}</div><span class="pv-author-name">${a.author}</span></div><div class="pv-meta-row"><span class="pv-date">${a.date}</span><span class="pv-eng"><span style="color:var(--pv-btn)">❤ ${a.likes}</span><span>💬 ${a.comments}</span></span></div></div>`).join("");
            const sideL = sa.slice(2, 4).map((a: any) => `<div class="pv-hero-side-card" data-article-id="${a.id}" style="cursor:pointer">${heroImg(a)}<h4>${a.title.slice(0, 60)}...</h4><div class="pv-author-row"><div class="pv-avatar">${a.author.charAt(0)}</div><span class="pv-author-name">${a.author}</span></div><div class="pv-meta-row"><span class="pv-date">${a.date}</span><span class="pv-eng"><span style="color:var(--pv-btn)">❤ ${a.likes}</span><span>💬 ${a.comments}</span></span></div></div>`).join("");
            const mainImg = ma?.imageUrl ? `<img src="${ma.imageUrl}" alt="${ma.title}" style="width:100%;height:260px;min-height:260px;object-fit:cover;display:block;border-radius:var(--pv-radius)"/>` : `<div class="pv-img" style="height:260px;min-height:260px"></div>`;
            const mainH = ma ? `<div class="pv-hero-main" data-article-id="${ma.id}" style="cursor:pointer">${mainImg}<h2>${ma.title}</h2><p class="pv-excerpt">${ma.excerpt}</p><div class="pv-meta-row"><div class="pv-author-row"><div class="pv-avatar">${ma.author.charAt(0)}</div><span class="pv-author-name">${ma.author}</span><span class="pv-date" style="margin-inline-start:8px">${ma.date}</span></div><span class="pv-eng">💬 ${ma.comments} <span style="color:var(--pv-btn)">❤ ${ma.likes}</span></span></div></div>` : "";
            pc += `<div class="pv-hero-grid"><div class="pv-hero-side pv-hero-side-r">${sideR}</div>${mainH}<div class="pv-hero-side pv-hero-side-l">${sideL}</div></div>`;
            break;
          case "subscribe":
            if (s.layout === "hero_centered") {
              const heroImg = s.heroImageUrl ? `<div class="pv-header-hero-img-wrap"><img src="${s.heroImageUrl}" alt="" class="pv-header-hero-img"/></div>` : "";
              pc += `<div class="pv-hero-sub">${heroImg}<h2>${s.title || sn}</h2><p>${s.subtitle || "محتوى حصري يصلك كل أسبوع"}</p><div class="pv-form-row pv-form-center"><input type="email" name="email" autocomplete="email" placeholder="أدخل بريدك الإلكتروني" class="pv-email"/><button class="pv-btn" style="background:${s.buttonColor || bc}">${s.buttonText || "اشتراك"}</button></div></div>`;
            } else if (s.layout === "cta") {
              pc += `<div class="pv-cta"><div class="pv-cta-inner"><div class="pv-cta-text"><div class="pv-cta-icon">${sn.charAt(0)}</div><div><h3>${s.title || "اشترك في نشرتنا"}</h3><p>${s.description || "محتوى حصري يصلك مباشرة إلى بريدك"}</p></div></div><div class="pv-form-row"><input type="email" name="email" autocomplete="email" placeholder="أدخل بريدك الإلكتروني" class="pv-email" /><button class="pv-btn" style="background:${s.buttonColor || bc}">${s.buttonText || "اشتراك"}</button></div></div></div>`;
            } else if (s.layout === "form") {
              pc += `<div class="pv-subscribe-form"><h3>${s.title || "اشترك في النشرة"}</h3><p>${s.description || ""}</p><div class="pv-form-row pv-form-center"><input type="email" placeholder="بريدك الإلكتروني" class="pv-email" /><button class="pv-btn" style="background:${s.buttonColor || bc}">${s.buttonText || "اشتراك"}</button></div></div>`;
            } else {
              pc += `<div class="pv-hero-sub"><h2>${s.title || "انضم لنشرتنا البريدية"}</h2><p>${s.subtitle || "محتوى حصري يصلك كل أسبوع"}</p><div class="pv-form-row pv-form-center"><input type="email" name="email" autocomplete="email" placeholder="أدخل بريدك الإلكتروني" class="pv-email" /><button class="pv-btn" style="background:${s.buttonColor || bc}">${s.buttonText || "اشتراك"}</button></div></div>`;
            }
            break;
          case "brands_ticker":
            pc += `<div class="pv-ticker"><div class="pv-ticker-inner">${sn} &#x2022; مدونة ${sn} &#x2022; ${sn} &#x2022; مدونة ${sn}</div></div>`;
            break;
          case "article_collection":
            if (s.layout === "gallery") {
              const gArts = (s.articles || []).map((id: string) => MOCK_ARTICLES.find(a => a.id === id)).filter(Boolean);
              const gCards = gArts.map((a: any) => `<div class="pv-gallery-card" data-article-id="${a.id}" style="cursor:pointer"><div class="pv-gallery-card-img">${a.imageUrl ? `<img src="${a.imageUrl}" alt="${a.title}"/>` : `<div class="pv-img" style="height:160px"></div>`}</div><h3>${a.title}</h3><p>${a.excerpt.slice(0, 120)}...</p><div class="pv-gallery-card-footer"><span>${a.author}</span></div></div>`).join("");
              const gSidebar = s.showSidebar ? `<div class="pv-gallery-sidebar">${s.sidebarTitle ? `<h3>${s.sidebarTitle}</h3>` : ""}${s.sidebarImageUrl ? `<img src="${s.sidebarImageUrl}" class="pv-gallery-sidebar-img"/>` : `<div class="pv-img" style="height:300px"></div>`}${s.sidebarButtonText ? `<button class="pv-gallery-sidebar-btn">${s.sidebarButtonText}</button>` : ""}</div>` : "";
              pc += `<div class="pv-gallery">${s.sectionTitle ? `<div class="pv-gallery-header"><h2>${s.sectionTitle}</h2></div>` : ""}<div class="pv-gallery-body ${s.showSidebar ? "pv-gallery-with-sidebar" : ""}">${gCards.length ? `<div class="pv-gallery-cards">${gCards}</div>` : ""}${gSidebar}</div></div>`;
            } else if (s.layout === "category_feed") {
              const cfCat = MOCK_CATEGORIES.find(c => c._id === s.categoryId);
              const cfArts = MOCK_ARTICLES.filter(a => a.categories.includes(s.categoryId || "")).slice(0, s.maxArticles || 5);
              const cfFeat = cfArts[0]; const cfRest = cfArts.slice(1);
              const cfCards = cfRest.map((a: any) => `<div class="pv-catfeed-card" data-article-id="${a.id}" style="cursor:pointer">${a.imageUrl ? `<img src="${a.imageUrl}" class="pv-catfeed-card-img"/>` : `<div class="pv-img" style="width:120px;height:90px"></div>`}<div class="pv-catfeed-card-content"><h3>${a.title}</h3><p>${a.excerpt.slice(0, 80)}...</p><span class="pv-catfeed-author">${a.author}</span></div></div>`).join("");
              const cfFeatH = cfFeat ? `<div class="pv-catfeed-featured" data-article-id="${cfFeat.id}" style="cursor:pointer">${cfFeat.imageUrl ? `<img src="${cfFeat.imageUrl}" class="pv-catfeed-featured-img"/>` : `<div class="pv-img" style="height:280px"></div>`}<h3>${cfFeat.title}</h3><p>${cfFeat.excerpt.slice(0, 140)}...</p><span class="pv-catfeed-author">${cfFeat.author}</span></div>` : "";
              pc += `<div class="pv-catfeed"><div class="pv-catfeed-header"><h2>${cfCat?.name || ""}</h2>${s.showMoreLink ? `<span class="pv-catfeed-more">${s.moreText || `المزيد من ${cfCat?.name || ""}`} &#x25C0;</span>` : ""}</div><div class="pv-catfeed-body pv-catfeed-${s.categoryLayout || "featured_right"}">${cfCards ? `<div class="pv-catfeed-main">${cfCards}</div>` : ""}${cfFeatH}</div></div>`;
            } else {
              const ac = (s.articles || []).map((id: string) => MOCK_ARTICLES.find(a => a.id === id)).filter(Boolean);
              const acH = ac.map((a: any) => `<div class="pv-art-card" data-article-id="${a.id}" style="cursor:pointer">${a.imageUrl ? `<img src="${a.imageUrl}" alt="${a.title}" style="aspect-ratio:16/9;width:100%;object-fit:cover;display:block;border-radius:var(--pv-radius)"/>` : `<div class="pv-img" style="aspect-ratio:16/9;width:100%"></div>`}<h4>${a.title}</h4><p class="pv-excerpt-sm">${a.excerpt.slice(0, 80)}...</p><div class="pv-author-row"><div class="pv-avatar">${a.author.charAt(0)}</div><span class="pv-author-name">${a.author}</span></div><div class="pv-meta-row"><span>${a.date}</span><span class="pv-eng"><span style="color:var(--pv-btn)">❤ ${a.likes}</span><span>💬 ${a.comments}</span></span></div></div>`).join("");
              pc += `<div class="pv-articles"><div class="pv-articles-grid">${acH}</div><a class="pv-all-link">جميع المقالات &#x2197;</a></div>`;
            }
            break;
          case "banner": {
            const bCards = (s.cards || []).map((card: any) => {
              const bg = card.imageUrl ? `background:url(${card.imageUrl}) center/cover` : `background:${card.color || "var(--pv-btn)"}`;
              const overlay = card.imageUrl ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);pointer-events:none"></div>` : "";
              return `<div class="pv-banner-card" style="${bg};position:relative">${overlay}<span style="position:relative;z-index:1">${card.title || ""}</span><a href="${card.linkUrl || "#"}" style="position:relative;z-index:1"${card.linkUrl ? ' target="_blank"' : ""}>${card.linkText || "اقرأ المزيد"} &#x2197;</a></div>`;
            }).join("");
            pc += `<div class="pv-banners"><div class="pv-banner-grid">${bCards}</div></div>`;
            break;
          }
          case "footer":
            let fl = "";
            if ((ll === "logo_only" || ll === "logo_and_text") && lu) fl += `<img src="${lu}" alt="" class="pv-footer-logo-img" />`;
            if (ll === "text_only" || ll === "logo_and_text") fl += `<span class="pv-footer-logo">${s.title || sn}</span>`;
            // Use header nav links for footer consistency
            const fLinks = rawNavLinks
              .filter((link: any) => typeof link === "string" ? true : link.visible)
              .map((link: any) => {
                const label = typeof link === "string" ? link : link.label;
                return `<a class="pv-footer-link">${label}</a>`;
              }).join("");
            pc += `<footer class="pv-footer"><div class="pv-footer-inner"><div class="pv-footer-logo-col">${fl}</div><div class="pv-footer-right"><p class="pv-footer-tagline">${s.tagline || "محتوى حصري يصلك مباشرة إلى بريدك"}</p><div class="pv-form-row"><input type="email" name="email" autocomplete="email" placeholder="أدخل بريدك الإلكتروني" class="pv-footer-email" /><button class="pv-btn" style="background:${s.buttonColor || bc}">${s.buttonText || "اشتراك"}</button></div><nav class="pv-footer-nav">${fLinks}</nav></div></div><div class="pv-footer-bottom"><span>جميع الحقوق محفوظة ${new Date().getFullYear()} ${sn}</span></div></footer>`;
            break;
          case "article_view":
            const sampleA = MOCK_ARTICLES[0];
            const avCover = sampleA.imageUrl ? `<img src="${sampleA.imageUrl}" alt="${sampleA.title}" class="pv-av-cover"/>` : `<div class="pv-av-cover" style="background:rgba(128,128,128,0.15)"></div>`;
            pc += `<nav class="pv-breadcrumb"><a href="#">الرئيسية</a><span class="pv-bc-sep">&#x276E;</span><a href="#">المقالات</a><span class="pv-bc-sep">&#x276E;</span><span class="pv-bc-current">${sampleA.title.slice(0, 50)}${sampleA.title.length > 50 ? '...' : ''}</span></nav><div class="pv-av"><div class="pv-av-head"><h1>${sampleA.title}</h1><div class="pv-av-meta"><div class="pv-av-author"><div class="pv-av-avatar">${sampleA.author.charAt(0)}</div><div><strong>${sampleA.author}</strong><span class="pv-date">${sampleA.date}</span></div></div><div class="pv-av-actions"><span style="color:var(--pv-btn)">❤ ${sampleA.likes}</span><span>💬 ${sampleA.comments}</span><span>↗ مشاركة</span><span>🔖</span></div></div></div>${avCover}<div class="pv-av-body"><p>هذا نص تجريبي يمثل محتوى المقال كما سيظهر للقارئ. يمكن للكاتب إضافة فقرات متعددة وتنسيقات مختلفة لإثراء المحتوى وجعله أكثر جاذبية للقراء.</p><p>يدعم المقال إضافة صور وعناوين فرعية واقتباسات وقوائم نقطية ومرقمة. كل هذه العناصر تساعد في تنظيم المحتوى وتسهيل قراءته.</p><h3>عنوان فرعي للمقال</h3><p>هنا يستمر المقال بتفاصيل إضافية حول الموضوع المطروح.</p><blockquote>الكتابة الجيدة هي إعادة الكتابة. لا تخف من تعديل نصك حتى يصل إلى أفضل صورة ممكنة.</blockquote><p>في النهاية، يُختتم المقال بملخص أو دعوة للتفاعل مع المحتوى.</p></div><div class="pv-av-tags"><span>كتابة</span><span>محتوى</span><span>نشرات بريدية</span></div><div class="pv-av-engagement"><span style="color:var(--pv-btn)">❤ ${sampleA.likes}</span><span>💬 ${sampleA.comments}</span><span>↗ مشاركة</span></div></div>`;
            break;
          case "section_title":
            pc += `<div class="pv-section-title"><h2>${s.title || "عنوان القسم"}</h2></div>`;
            break;
          case "text_block":
            pc += `<div class="pv-text-block"><p>${s.content || "نص تجريبي"}</p></div>`;
            break;
          case "rich_text":
            pc += `<div class="pv-rich-text">${s.html || "<p>محتوى نصي</p>"}</div>`;
            break;
          case "contact_form":
            pc += `<div class="pv-contact-form"><h3>${s.title || "تواصل معنا"}</h3><form class="pv-contact-fields"><input type="text" placeholder="الاسم" class="pv-input" /><input type="email" placeholder="البريد الإلكتروني" class="pv-input" /><textarea placeholder="رسالتك" class="pv-textarea"></textarea><button class="pv-btn" style="background:${bc}">إرسال</button></form></div>`;
            break;
          case "testimonials":
            const tItems = s.items || [];
            const tHtml = tItems.map((t: any) => `<div class="pv-testi-card"><p class="pv-testi-text">"${t.text || ""}"</p><div class="pv-testi-author"><strong>${t.name || ""}</strong><span>${t.role || ""}</span></div></div>`).join("");
            pc += `<div class="pv-testimonials"><div class="pv-testi-grid">${tHtml}</div></div>`;
            break;
          case "bento_grid":
            const bItems = s.items || [];
            const bHtml = bItems.map((item: any) => {
              const sz = item.cardSize || "square";
              return `<div class="pv-bento-card pv-bento-${sz}">${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title || ""}" class="pv-bento-img" />` : `<div class="pv-bento-img-ph"></div>`}<div class="pv-bento-body"><h4>${item.title || ""}</h4>${item.text ? `<p>${item.text}</p>` : ""}</div></div>`;
            }).join("");
            pc += `<div class="pv-bento"><div class="pv-bento-grid">${bHtml}</div></div>`;
            break;
          case "social_links": {
            const platforms = s.platforms || [];
            const pvSocialSvgs: Record<string, string> = {
              twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
              instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>',
              youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z"/></svg>',
              linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>',
              tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.26 8.26 0 005.58 2.17V11.7a4.83 4.83 0 01-3.77-1.24V6.69z"/></svg>',
              snapchat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.949-.25.147-.066.346-.097.5-.097.206 0 .395.054.5.162a.5.5 0 01.075.558c-.09.19-.222.33-.345.437-.39.321-.906.486-1.34.577a.8.8 0 00-.18.045c-.12.06-.18.18-.15.3.18.75.42 1.44.75 2.04.54.99 1.32 1.71 2.28 2.13.12.06.24.12.3.21a.44.44 0 01-.12.45c-.15.15-.39.27-.72.36-.45.12-.99.18-1.56.21-.15.015-.21.09-.24.15-.06.105-.09.21-.12.33l-.015.06c-.06.195-.135.42-.33.585-.225.195-.54.24-.78.24-.18 0-.36-.03-.51-.06a3.5 3.5 0 00-.75-.09c-.27 0-.54.03-.81.09-.75.18-1.38.51-2.07.9-.9.51-1.83 1.05-3.18 1.11h-.15c-1.35-.06-2.28-.6-3.18-1.11-.69-.39-1.32-.72-2.07-.9a4.3 4.3 0 00-.81-.09c-.24 0-.48.03-.75.09-.15.03-.33.06-.51.06-.24 0-.555-.045-.78-.24-.195-.165-.27-.39-.33-.585L3.1 18.6c-.03-.12-.06-.225-.12-.33-.03-.06-.09-.135-.24-.15-.57-.03-1.11-.09-1.56-.21-.33-.09-.57-.21-.72-.36a.44.44 0 01-.12-.45c.06-.09.18-.15.3-.21.96-.42 1.74-1.14 2.28-2.13.33-.6.57-1.29.75-2.04.03-.12-.03-.24-.15-.3a.8.8 0 00-.18-.045c-.435-.09-.95-.256-1.34-.577a1.16 1.16 0 01-.345-.437.5.5 0 01.075-.558c.105-.108.294-.162.5-.162.154 0 .353.031.5.097.29.13.649.234.949.25.198 0 .326-.045.401-.09a4.22 4.22 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C6.453 1.069 9.81.793 10.8.793h1.406z"/></svg>',
              facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
              website: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
              threads: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.228 1.33-2.93.824-.627 1.952-.998 3.267-1.073 1.107-.064 2.134.05 3.057.337.011-.583-.004-1.128-.068-1.627-.207-1.636-.869-2.39-2.396-2.463h-.086c-1.093 0-2.032.393-2.637 1.107l-1.455-1.323c.908-.998 2.253-1.57 3.694-1.57h.131c1.254.051 2.27.49 3.016 1.302.673.732 1.09 1.727 1.24 2.96.068.562.092 1.17.072 1.812.539.253 1.022.56 1.443.924 1.2 1.037 1.86 2.474 1.96 4.275.064 1.16-.197 2.478-.85 3.61-.765 1.326-1.94 2.378-3.495 3.13C17.534 23.46 15.07 24 12.186 24zm-1.118-8.086c-.988.057-1.757.282-2.293.672-.422.306-.633.696-.61 1.13.023.412.233.78.61 1.065.471.356 1.14.539 1.886.507 1.09-.052 1.94-.46 2.528-1.213.464-.594.77-1.405.907-2.406-.876-.235-1.88-.356-2.942-.355h-.086z"/></svg>',
              telegram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.486-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
              whatsapp: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
              pinterest: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>',
              spotify: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
            };
            const slHtml = platforms.filter((p: any) => p.enabled && p.url).map((p: any) => `<a href="${p.url}" target="_blank" rel="noopener" class="pv-social-link">${pvSocialSvgs[p.platform] || p.platform}</a>`).join("");
            pc += `<div class="pv-social-links">${slHtml}</div>`;
            break;
          }
          case "movies": {
            const mItems = s.items || [];
            const mHtml = mItems.map((item: any) => `<a class="pv-movie-card" href="${item.url || "#"}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="pv-movie-poster">${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title || ""}"/>` : `<div class="pv-movie-poster-ph"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16"/></svg></div>`}</div><div class="pv-movie-info"><h4>${item.title || ""}</h4><p>${item.subtitle || ""}</p>${item.buttonText ? `<span class="pv-movie-btn" style="background:${bc}">${item.buttonText}</span>` : ""}</div></a>`).join("");
            pc += `<div class="pv-section"><h2 class="pv-section-title">${s.sectionTitle || "أفلام ومسلسلات"}</h2><div class="pv-movies-grid">${mHtml}</div></div>`;
            break;
          }
          default:
            pc += `<div class="pv-placeholder">${COMPONENT_META[comp.type]?.label || comp.type}</div>`;
        }
      });
      if (pi > 0) pagesHtml += `<div id="page-${page.slug}" class="pv-page-sep"></div>`;
      pagesHtml += pc;
    });

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl"${dm ? ' class="dark"' : ''}>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${sn}</title>
${activeSite.branding.favicon ? `<link rel="icon" href="${activeSite.branding.favicon}" type="image/png">` : ''}
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(ff)}:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
:root{--pv-btn:${bc};--pv-headline:${hlc};--pv-text:${txc};--pv-link:${lkc};--pv-bg:${bgc};--pv-card-bg:${cbg};--pv-radius:${br}px;}
body{font-family:'${ff}',system-ui,sans-serif;direction:rtl;text-align:right;color:var(--pv-text);line-height:1.6;background:var(--pv-bg);transition:background .3s,color .3s;}
a{text-decoration:none;color:inherit;}
input::placeholder{color:#bbb;}
.pv-site-wrapper{${lw === "compact" ? "max-width:1160px;margin:0 auto;" : ""}background:var(--pv-bg);transition:background .3s;}
/* Dark mode — override CSS variables */
html.dark{--pv-bg:#121212;--pv-card-bg:#1e1e1e;--pv-headline:#e0e0e0;--pv-text:#aaa;--pv-link:#e0e0e0;}
/* Dark mode toggle button */
.pv-darkmode-btn{width:36px;height:36px;border:1px solid rgba(128,128,128,0.2);background:transparent;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--pv-text);transition:all .2s;}
.pv-darkmode-btn:hover{background:rgba(128,128,128,0.1);}
/* Header */
.pv-header{border-bottom:1px solid rgba(128,128,128,0.2);padding:0;position:sticky;top:0;background:var(--pv-card-bg);z-index:10;}
.pv-header-inner{display:flex;align-items:center;gap:24px;padding:14px 24px;}
.pv-logo-wrap{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.pv-logo-img{height:32px;width:auto;object-fit:contain;}
.pv-logo-text{font-size:17px;font-weight:800;color:var(--pv-headline);white-space:nowrap;letter-spacing:-0.3px;}
.pv-nav{display:flex;gap:24px;flex:1;}
.pv-nav-link{font-size:14px;color:var(--pv-text);padding:4px 0;font-weight:500;}
.pv-nav-link:hover{color:var(--pv-headline);}
.pv-header-actions{display:flex;align-items:center;gap:10px;}
.pv-login-btn{padding:0 16px;height:44px;border:1.5px solid var(--pv-btn);background:transparent;color:var(--pv-btn);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;border-radius:var(--pv-radius);}
.pv-hamburger{display:none;width:36px;height:36px;border:none;background:transparent;cursor:pointer;align-items:center;justify-content:center;color:var(--pv-headline);flex-shrink:0;padding:0;}
.pv-mobile-menu{display:none;border-top:1px solid rgba(128,128,128,0.15);padding:16px 24px;flex-direction:column;gap:12px;background:var(--pv-card-bg);}
.pv-mobile-menu-open{display:flex;}
.pv-mobile-nav{display:flex;flex-direction:column;gap:0;}
.pv-mobile-nav-link{font-size:16px;font-weight:500;color:var(--pv-text);padding:12px 0;border-bottom:1px solid rgba(128,128,128,0.1);text-decoration:none;}
.pv-mobile-nav-link:last-child{border-bottom:none;}
.pv-mobile-menu-actions{display:flex;flex-direction:column;gap:8px;padding-top:8px;align-items:center;}
.pv-mobile-menu-actions .pv-darkmode-btn{width:36px;height:36px;}
.pv-btn{padding:0 28px;height:48px;border:none;color:#fff;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;border-radius:var(--pv-radius);}
/* Hero Centered Header */
/* Hero Centered Header — reuses .pv-hero-sub */
.pv-header-hero-img-wrap{width:100px;height:100px;margin:0 auto 20px;border-radius:var(--pv-radius,12px);overflow:hidden;background:var(--pv-card-bg,#f0f0f0);display:flex;align-items:center;justify-content:center;}
.pv-header-hero-img{width:100%;height:100%;object-fit:cover;}
/* Hero News */
.pv-hero-grid{display:grid;grid-template-columns:3fr 5fr 3fr;gap:1px;background:rgba(128,128,128,0.2);}
.pv-hero-side{display:flex;flex-direction:column;gap:1px;background:rgba(128,128,128,0.2);}
.pv-hero-side-card{background:var(--pv-card-bg);padding:16px;display:flex;flex-direction:column;gap:8px;flex:1;border-radius:var(--pv-radius);overflow:hidden;}
.pv-hero-side-card h4{font-size:14px;font-weight:700;margin:0;line-height:1.5;color:var(--pv-headline);}
.pv-hero-main{background:var(--pv-card-bg);padding:20px;display:flex;flex-direction:column;gap:10px;}
.pv-hero-main h2{font-size:22px;font-weight:800;margin:0;line-height:1.5;color:var(--pv-headline);}
.pv-img{width:100%;background:rgba(128,128,128,0.15);border-radius:var(--pv-radius);overflow:hidden;}
.pv-date{font-size:11px;color:var(--pv-text);opacity:0.7;}
.pv-excerpt{font-size:13px;color:var(--pv-text);margin:0;line-height:1.7;}
.pv-excerpt-sm{font-size:12px;color:var(--pv-text);opacity:0.8;margin:0;}
.pv-meta-row{display:flex;justify-content:space-between;font-size:11px;color:var(--pv-text);opacity:0.7;align-items:center;margin-top:auto;}
.pv-eng{display:flex;gap:8px;align-items:center;}
/* Hero Subscribe */
.pv-hero-sub{padding:72px 24px;text-align:center;background:var(--pv-card-bg);}
.pv-hero-sub h2{font-size:32px;font-weight:800;margin:0 0 12px;color:var(--pv-headline);}
.pv-hero-sub p{font-size:16px;color:var(--pv-text);margin:0 0 28px;}
/* Forms */
.pv-form-row{display:flex;gap:0;}
.pv-form-center{max-width:440px;margin:0 auto;}
.pv-email{flex:1;height:48px;padding:0 16px;border:1px solid rgba(128,128,128,0.3);border-right:none;font-family:inherit;font-size:15px;outline:none;background:var(--pv-card-bg);color:var(--pv-text);direction:rtl;min-width:0;border-radius:var(--pv-radius) 0 0 var(--pv-radius);}
/* Ticker */
.pv-ticker{overflow:hidden;border-top:2px solid var(--pv-headline);border-bottom:2px solid var(--pv-headline);padding:24px 0;}
.pv-ticker-inner{display:flex;gap:24px;white-space:nowrap;font-size:56px;font-weight:900;color:var(--pv-headline);animation:tickerScroll 15s linear infinite;}
@keyframes tickerScroll{from{transform:translateX(100%)}to{transform:translateX(-100%)}}
/* CTA */
.pv-cta{padding:28px 24px;background:var(--pv-card-bg);border-top:1px solid rgba(128,128,128,0.2);border-bottom:1px solid rgba(128,128,128,0.2);}
.pv-cta-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;}
.pv-cta-text{display:flex;align-items:center;gap:14px;}
.pv-cta-icon{width:44px;height:44px;border-radius:50%;background:var(--pv-headline);color:var(--pv-bg);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;flex-shrink:0;}
.pv-cta h3{font-size:16px;font-weight:700;margin:0;color:var(--pv-headline);}
.pv-cta p{font-size:13px;color:var(--pv-text);margin:2px 0 0;}
.pv-cta .pv-form-row{flex:1;min-width:280px;}
/* Articles */
.pv-articles{padding:32px 24px;}
.pv-articles-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;}
.pv-art-card{display:flex;flex-direction:column;gap:8px;border-radius:var(--pv-radius);overflow:hidden;}
.pv-art-card h4{font-size:14px;font-weight:700;margin:0;line-height:1.5;color:var(--pv-headline);}
.pv-author-row{display:flex;align-items:center;gap:6px;margin-top:4px;}
.pv-avatar{width:22px;height:22px;border-radius:50%;background:rgba(128,128,128,0.15);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:9px;color:var(--pv-text);flex-shrink:0;}
.pv-author-name{font-size:11px;font-weight:600;color:var(--pv-text);}
.pv-all-link{display:block;margin-top:20px;font-size:14px;font-weight:600;color:var(--pv-link);}
/* Banners */
.pv-banners{padding:0;}
.pv-banner-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(128,128,128,0.2);}
.pv-banner-card{padding:32px 24px;color:#fff;display:flex;flex-direction:column;gap:10px;min-height:160px;justify-content:flex-end;border-radius:0;overflow:hidden;}
.pv-banner-card span{font-size:18px;font-weight:700;}
.pv-banner-card a{font-size:13px;color:rgba(255,255,255,0.8);text-decoration:underline;cursor:pointer;}
/* Footer */
.pv-footer{background:var(--pv-headline);color:var(--pv-bg);padding:48px 24px 0;}
.pv-footer-inner{display:flex;gap:48px;flex-wrap:wrap;}
.pv-footer-logo-col{flex:1;min-width:180px;}
.pv-footer-logo{font-size:56px;font-weight:900;line-height:1.1;display:block;}
.pv-footer-logo-img{height:64px;width:auto;object-fit:contain;display:block;margin-bottom:8px;}
.pv-footer-right{flex:1;min-width:280px;}
.pv-footer-tagline{font-size:14px;color:var(--pv-bg);opacity:0.6;margin:0 0 16px;}
.pv-footer-email{flex:1;height:48px;padding:0 16px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:var(--pv-bg);font-family:inherit;font-size:15px;outline:none;direction:rtl;min-width:0;border-radius:var(--pv-radius) 0 0 var(--pv-radius);}
.pv-footer-nav{display:flex;gap:20px;flex-wrap:wrap;margin-top:20px;}
.pv-footer-link{font-size:13px;color:var(--pv-bg);opacity:0.6;}
.pv-footer-link:hover{opacity:1;}
.pv-footer-bottom{border-top:1px solid rgba(255,255,255,0.15);padding:20px 0;text-align:center;font-size:12px;color:var(--pv-bg);margin-top:28px;display:flex;flex-direction:column;align-items:center;gap:12px;}
.pv-footer-bottom > span{opacity:0.4;}
.pv-kitabh-badge-wrap{text-align:center;padding:24px 0;background:var(--pv-bg);}
.pv-kitabh-badge{display:inline-flex;align-items:center;gap:10px;font-size:15px;font-weight:700;direction:rtl;padding:12px 24px;border-radius:var(--pv-radius);text-decoration:none;transition:all .2s ease;position:relative;z-index:10;isolation:isolate;}
.pv-kitabh-badge:hover{transform:translateY(-1px);}
.pv-kitabh-badge img{flex-shrink:0;width:24px;height:auto;display:block;}
.pv-badge-black{background:#000;color:#fff;border:1px solid #000;}
.pv-badge-black:hover{background:#222;}
.pv-badge-black img{}
.pv-badge-blue{background:#0000FF;color:#fff;border:1px solid #0000FF;}
.pv-badge-blue:hover{background:#0000dd;}
.pv-badge-blue img{}
.pv-badge-white{background:#fff;color:#000;border:1px solid #e0e0e0;}
.pv-badge-white:hover{background:#f5f5f5;}
.pv-badge-white img{}
/* Breadcrumb */
.pv-breadcrumb{display:flex;align-items:center;gap:8px;padding:16px 24px 0;max-width:800px;margin:0 auto;font-size:13px;direction:rtl;}
.pv-breadcrumb a{color:var(--pv-text);opacity:0.7;cursor:pointer;text-decoration:none;font-weight:500;}
.pv-breadcrumb a:hover{opacity:1;color:var(--pv-headline);}
.pv-breadcrumb .pv-bc-sep{color:var(--pv-text);opacity:0.35;font-size:11px;}
.pv-breadcrumb .pv-bc-current{color:var(--pv-headline);font-weight:600;opacity:1;}
/* Article View */
.pv-av{max-width:800px;margin:0 auto;}
.pv-av-head{padding:20px 24px 24px;}
.pv-av-cat{font-size:12px;font-weight:700;color:var(--pv-btn);}
.pv-av h1{font-size:28px;font-weight:900;line-height:1.4;margin:10px 0 20px;color:var(--pv-headline);}
.pv-av-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.pv-av-author{display:flex;align-items:center;gap:10px;}
.pv-av-avatar{width:40px;height:40px;border-radius:50%;background:rgba(128,128,128,0.15);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:var(--pv-text);}
.pv-av-author strong{font-size:14px;display:block;color:var(--pv-headline);}
.pv-av-actions{display:flex;gap:16px;font-size:13px;color:var(--pv-text);opacity:0.7;}
.pv-av-cover{width:100%;height:300px;object-fit:cover;display:block;border-radius:var(--pv-radius);}
.pv-av-body{padding:28px 24px;max-width:640px;margin:0 auto;}
.pv-av-body p{font-size:16px;line-height:2;color:var(--pv-text);margin:0 0 18px;}
.pv-av-body h3{font-size:20px;font-weight:800;margin:28px 0 14px;color:var(--pv-headline);}
.pv-av-body blockquote{border-right:3px solid var(--pv-btn);padding:14px 20px;margin:24px 0;background:var(--pv-card-bg);font-size:16px;font-style:italic;color:var(--pv-text);line-height:1.8;}
.pv-av-tags{padding:20px 24px 0;display:flex;gap:8px;flex-wrap:wrap;}
.pv-av-tags span{font-size:12px;padding:6px 14px;border:1px solid rgba(128,128,128,0.2);color:var(--pv-text);background:var(--pv-card-bg);border-radius:var(--pv-radius);}
.pv-av-engagement{padding:12px 24px 36px;display:flex;gap:16px;font-size:13px;color:var(--pv-text);opacity:0.8;}
/* Keep Reading */
.pv-keep-reading{max-width:800px;margin:0 auto;padding:0 24px 48px;}
.pv-keep-reading h2{font-size:20px;font-weight:800;color:var(--pv-headline);margin:0 0 20px;padding-bottom:12px;border-bottom:1px solid rgba(128,128,128,0.15);}
.pv-kr-list{display:flex;flex-direction:column;gap:0;}
.pv-kr-card{display:flex;gap:16px;padding:20px 0;border-bottom:1px solid rgba(128,128,128,0.1);cursor:pointer;text-decoration:none;color:inherit;align-items:flex-start;}
.pv-kr-card:hover{opacity:0.85;}
.pv-kr-img{width:200px;height:130px;object-fit:cover;flex-shrink:0;border-radius:var(--pv-radius);}
.pv-kr-img-ph{width:200px;height:130px;background:rgba(128,128,128,0.1);flex-shrink:0;border-radius:var(--pv-radius);}
.pv-kr-content{flex:1;display:flex;flex-direction:column;gap:6px;padding-top:4px;}
.pv-kr-date{font-size:12px;color:var(--pv-text);opacity:0.6;}
.pv-kr-content h3{font-size:16px;font-weight:700;line-height:1.5;color:var(--pv-headline);margin:0;}
.pv-kr-content p{font-size:13px;color:var(--pv-text);margin:0;line-height:1.6;opacity:0.8;}
.pv-kr-author{display:flex;align-items:center;gap:6px;margin-top:auto;}
.pv-kr-author .pv-avatar{width:24px;height:24px;}
.pv-kr-author span{font-size:12px;font-weight:600;color:var(--pv-text);}
/* Article Subscribe CTA */
.pv-av-subscribe{max-width:800px;margin:0 auto;padding:0 24px 40px;}
.pv-av-subscribe-inner{background:rgba(128,128,128,0.06);border-radius:var(--pv-radius);padding:40px 32px;text-align:center;}
.pv-av-subscribe-inner h3{font-size:20px;font-weight:800;color:var(--pv-headline);margin:0 0 8px;}
.pv-av-subscribe-inner p{font-size:14px;color:var(--pv-text);margin:0 0 20px;line-height:1.7;}
.pv-av-sub-form{display:flex;gap:0;max-width:420px;margin:0 auto;}
.pv-av-sub-form input{flex:1;height:48px;padding:0 16px;border:1px solid rgba(128,128,128,0.2);border-right:none;font-family:inherit;font-size:15px;outline:none;background:#fff;color:var(--pv-text);direction:rtl;min-width:0;border-radius:var(--pv-radius) 0 0 var(--pv-radius);}
.pv-av-sub-form button{padding:0 28px;height:48px;border:none;color:#fff;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;border-radius:0 var(--pv-radius) var(--pv-radius) 0;}
/* Article view overlay */
.pv-article-overlay{position:fixed;inset:0;background:var(--pv-bg);z-index:100;overflow-y:auto;}
/* Page separator */
.pv-page-sep{border-top:3px solid rgba(128,128,128,0.15);}
/* Section Title */
.pv-section-title{padding:24px 24px 8px;}.pv-section-title h2{font-size:22px;font-weight:800;color:var(--pv-headline);margin:0;}
/* Text Block */
.pv-text-block{padding:16px 24px;}.pv-text-block p{font-size:16px;line-height:1.8;color:var(--pv-text);}
/* Rich Text */
.pv-rich-text{padding:16px 24px;font-size:16px;line-height:1.8;color:var(--pv-text);}
/* Subscribe Form */
.pv-subscribe-form{padding:48px 24px;text-align:center;background:var(--pv-card-bg);}.pv-subscribe-form h3{font-size:22px;font-weight:700;margin:0 0 8px;color:var(--pv-headline);}.pv-subscribe-form p{font-size:14px;color:var(--pv-text);margin:0 0 20px;}
/* Contact Form */
.pv-contact-form{padding:48px 24px;text-align:center;background:var(--pv-card-bg);}.pv-contact-form h3{font-size:22px;font-weight:700;margin:0 0 20px;color:var(--pv-headline);}.pv-contact-fields{max-width:480px;margin:0 auto;display:flex;flex-direction:column;gap:12px;text-align:right;}.pv-input{height:44px;padding:0 14px;border:1px solid rgba(128,128,128,0.3);font-family:inherit;font-size:14px;background:var(--pv-card-bg);color:var(--pv-text);outline:none;direction:rtl;border-radius:var(--pv-radius);}.pv-textarea{min-height:100px;padding:12px 14px;border:1px solid rgba(128,128,128,0.3);font-family:inherit;font-size:14px;background:var(--pv-card-bg);color:var(--pv-text);outline:none;direction:rtl;resize:vertical;border-radius:var(--pv-radius);}
/* Testimonials */
.pv-testimonials{padding:32px 24px;}.pv-testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;}.pv-testi-card{padding:20px;background:var(--pv-card-bg);border:1px solid rgba(128,128,128,0.15);border-radius:var(--pv-radius);}.pv-testi-text{font-size:15px;line-height:1.7;color:var(--pv-text);margin:0 0 12px;font-style:italic;}.pv-testi-author strong{display:block;font-size:14px;color:var(--pv-headline);}.pv-testi-author span{font-size:12px;color:var(--pv-text);opacity:0.7;}
/* Bento Grid */
.pv-bento{padding:24px;}.pv-bento-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}.pv-bento-card{background:var(--pv-card-bg);border:1px solid rgba(128,128,128,0.15);overflow:hidden;display:flex;flex-direction:column;border-radius:var(--pv-radius);}.pv-bento-square{}.pv-bento-wide{grid-column:span 2;}.pv-bento-tall{grid-row:span 2;}.pv-bento-img{width:100%;height:200px;object-fit:cover;}.pv-bento-img-ph{width:100%;height:200px;background:rgba(128,128,128,0.1);}.pv-bento-body{padding:12px 16px;}.pv-bento-body h4{font-size:15px;font-weight:700;color:var(--pv-headline);margin:0 0 4px;}.pv-bento-body p{font-size:13px;color:var(--pv-text);margin:0;}
/* Movies */
.pv-movies-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:20px;padding:0 24px 24px;}
.pv-movie-card{display:flex;flex-direction:column;overflow:hidden;transition:transform .15s;}
.pv-movie-card:hover{transform:translateY(-2px);}
.pv-movie-poster{width:100%;aspect-ratio:2/3;background:rgba(128,128,128,0.12);overflow:hidden;border-radius:var(--pv-radius);}
.pv-movie-poster img{width:100%;height:100%;object-fit:cover;display:block;}
.pv-movie-poster-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;}
.pv-movie-info{padding:8px 0;}
.pv-movie-info h4{font-size:14px;font-weight:700;margin:0;color:var(--pv-headline);line-height:1.4;}
.pv-movie-info p{font-size:12px;color:var(--pv-text);margin:4px 0 0;line-height:1.5;}
.pv-movie-btn{display:inline-block;padding:6px 16px;color:#fff;font-size:12px;font-weight:600;border-radius:var(--pv-radius);margin-top:8px;text-align:center;}
/* Social Links */
.pv-social-links{display:flex;justify-content:center;gap:12px;padding:24px;flex-wrap:wrap;}.pv-social-link{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;color:var(--pv-text);border:1px solid rgba(128,128,128,0.2);transition:all .15s;border-radius:50%;}.pv-social-link:hover{background:var(--pv-btn);color:#fff;border-color:var(--pv-btn);}.pv-social-link svg{display:block;}
/* Gallery */
.pv-gallery{padding:24px;border-top:2px solid var(--pv-headline);}
.pv-gallery-header{padding-bottom:14px;border-bottom:1px solid rgba(128,128,128,0.15);text-align:right;}
.pv-gallery-header h2{font-size:20px;font-weight:800;color:var(--pv-btn);margin:0;}
.pv-gallery-body{display:flex;gap:0;margin-top:16px;}
.pv-gallery-with-sidebar .pv-gallery-cards{flex:1;}
.pv-gallery-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.pv-gallery-card{display:flex;flex-direction:column;gap:8px;}.pv-gallery-card h3{font-size:15px;font-weight:700;line-height:1.5;color:var(--pv-headline);margin:0;}.pv-gallery-card p{font-size:13px;color:var(--pv-text);margin:0;line-height:1.6;}
.pv-gallery-card-img{width:100%;aspect-ratio:4/3;overflow:hidden;background:rgba(128,128,128,0.08);border-radius:var(--pv-radius);}.pv-gallery-card-img img{width:100%;height:100%;object-fit:cover;}
.pv-gallery-card-footer{font-size:12px;color:var(--pv-text);opacity:0.7;margin-top:auto;}
.pv-gallery-sidebar{width:280px;flex-shrink:0;border-right:1px solid rgba(128,128,128,0.15);padding-right:20px;margin-right:20px;display:flex;flex-direction:column;gap:10px;}.pv-gallery-sidebar h3{font-size:17px;font-weight:800;line-height:1.5;color:var(--pv-headline);margin:0;}
.pv-gallery-sidebar-img{width:100%;object-fit:cover;flex:1;}
.pv-gallery-sidebar-btn{display:flex;align-items:center;gap:6px;justify-content:center;padding:8px 14px;border:1.5px solid rgba(128,128,128,0.3);background:transparent;color:var(--pv-headline);font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;border-radius:var(--pv-radius);}
/* Category Feed */
.pv-catfeed{padding:24px;border-top:2px solid var(--pv-headline);}
.pv-catfeed-header{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:14px;border-bottom:1px solid rgba(128,128,128,0.15);}
.pv-catfeed-header h2{font-size:20px;font-weight:800;color:var(--pv-btn);margin:0;}
.pv-catfeed-more{font-size:13px;font-weight:600;color:var(--pv-text);opacity:0.7;cursor:pointer;}
.pv-catfeed-body{display:grid;gap:0;margin-top:16px;}
.pv-catfeed-featured_right{grid-template-columns:1fr 1fr 1.3fr;}
.pv-catfeed-featured_left{grid-template-columns:1.3fr 1fr 1fr;}
.pv-catfeed-grid{grid-template-columns:repeat(3,1fr);gap:20px;}
.pv-catfeed-main{display:flex;flex-direction:column;}
.pv-catfeed-card{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(128,128,128,0.1);}
.pv-catfeed-card-img{width:120px;height:90px;object-fit:cover;flex-shrink:0;border-radius:var(--pv-radius);}
.pv-catfeed-card-content{flex:1;display:flex;flex-direction:column;gap:4px;}.pv-catfeed-card-content h3{font-size:14px;font-weight:700;line-height:1.5;color:var(--pv-headline);margin:0;}.pv-catfeed-card-content p{font-size:12px;color:var(--pv-text);margin:0;line-height:1.5;}
.pv-catfeed-author{font-size:11px;font-weight:600;color:var(--pv-text);opacity:0.7;margin-top:auto;}
.pv-catfeed-featured{padding:16px;border-right:1px solid rgba(128,128,128,0.15);display:flex;flex-direction:column;gap:10px;}
.pv-catfeed-featured-img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--pv-radius);}
.pv-catfeed-featured h3{font-size:17px;font-weight:800;line-height:1.5;color:var(--pv-headline);margin:0;}
.pv-catfeed-featured p{font-size:13px;color:var(--pv-text);margin:0;line-height:1.6;}
.pv-placeholder{padding:40px 24px;background:var(--pv-card-bg);border:2px dashed rgba(128,128,128,0.2);text-align:center;color:var(--pv-text);opacity:0.5;font-size:15px;font-weight:600;}
/* Mobile */
@media(max-width:768px){
  .pv-hero-grid{grid-template-columns:1fr;}
  .pv-hero-main{order:-1;}
  .pv-hero-side-r{flex-direction:row;order:1;}
  .pv-hero-side-r .pv-hero-side-card{min-width:0;flex:1;}
  .pv-hero-side-l{display:none;}
  .pv-nav{display:none;}
  .pv-header-actions{display:none;}
  .pv-header-inner{position:relative;}
  .pv-hamburger{display:flex;position:absolute;left:16px;top:50%;transform:translateY(-50%);}
  .pv-articles-grid{grid-template-columns:1fr;}
  .pv-art-card .pv-img{aspect-ratio:16/9;height:auto!important;border-radius:8px;}
  .pv-excerpt-sm{display:none;}
  .pv-art-card h4{font-size:18px;}
  .pv-author-name{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;}
  .pv-banner-grid{grid-template-columns:1fr;}
  .pv-cta-inner{flex-direction:column;}
  .pv-cta .pv-form-row{min-width:unset;flex-direction:column;}
  .pv-footer-inner{flex-direction:column;gap:20px;}
  .pv-footer-logo{font-size:36px;}
  .pv-form-row{flex-direction:column;}
  .pv-form-row .pv-email{border-right:1px solid rgba(128,128,128,0.3);border-left:1px solid rgba(128,128,128,0.3);width:100%;}
  .pv-form-row .pv-btn{width:100%;}
  .pv-form-row .pv-footer-email{width:100%;}
  .pv-hero-sub h2{font-size:22px;}
  .pv-av h1{font-size:20px;}
  .pv-gallery{display:none;}
  .pv-catfeed{display:none;}
  .pv-kr-img,.pv-kr-img-ph{width:140px;height:95px;}
  .pv-breadcrumb{font-size:12px;flex-wrap:wrap;}
}
</style>
</head>
<body><div class="pv-site-wrapper" id="pv-main">${pagesHtml}</div>${activeSite.branding.showKitabhBadge !== false ? `<div class="pv-kitabh-badge-wrap"><a href="https://kitabh.com" target="_blank" rel="noopener noreferrer" class="pv-kitabh-badge pv-badge-${activeSite.branding.badgeStyle || "black"}" style="transform:scale(${(activeSite.branding.badgeScale ?? 85) / 100})"><img src="${KITABH_ICONS[activeSite.branding.badgeStyle || "black"]}" alt="كتابة" />صُمّم على منصة كتابة</a></div>` : ''}
<div id="pv-article-overlay" class="pv-article-overlay" style="display:none"></div>
<script>
(function(){
  var html=document.documentElement;
  if(!html.classList.contains('dark')&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches){
    html.classList.add('dark');
    var btn=document.querySelector('.pv-darkmode-btn');if(btn)btn.textContent='☀';
  }
  window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(e){
    if(e.matches){html.classList.add('dark')}else{html.classList.remove('dark')}
    var btn=document.querySelector('.pv-darkmode-btn');if(btn)btn.textContent=html.classList.contains('dark')?'☀':'☾';
  });
  // Site data for article CTA
  var siteName=${JSON.stringify(sn)};
  var subText=${JSON.stringify(subTitle)};
  var subBtnTxt=${JSON.stringify(subBtnText)};
  var subBtnClr=${JSON.stringify(subBtnColor)};
  // Article data for navigation
  var articles=${JSON.stringify(MOCK_ARTICLES.map(a => ({ id: a.id, title: a.title, excerpt: a.excerpt, imageUrl: a.imageUrl, author: a.author, date: a.date, likes: a.likes, comments: a.comments, categories: a.categories })))};
  var articleMap={};articles.forEach(function(a){articleMap[a.id]=a;});
  var overlay=document.getElementById('pv-article-overlay');
  var main=document.getElementById('pv-main');
  // Capture header and footer HTML from main page
  var headerEl=main.querySelector('.pv-header');
  var footerEl=main.querySelector('.pv-footer');
  var headerHtml=headerEl?headerEl.outerHTML:'';
  var footerHtml=footerEl?footerEl.outerHTML:'';
  function openArticle(id){
    var a=articleMap[id];if(!a)return;
    var cover=a.imageUrl?'<img src="'+a.imageUrl+'" alt="" class="pv-av-cover"/>':'<div class="pv-av-cover" style="background:rgba(128,128,128,0.15)"></div>';
    var breadcrumb='<nav class="pv-breadcrumb"><a onclick="closeArticle()">الرئيسية</a><span class="pv-bc-sep">&#x276E;</span><a onclick="closeArticle()">المقالات</a><span class="pv-bc-sep">&#x276E;</span><span class="pv-bc-current">'+a.title.slice(0,50)+(a.title.length>50?'...':'')+'</span></nav>';
    // Build "Keep Reading" section with 3 other articles
    var others=articles.filter(function(x){return x.id!==id;});
    var krCards='';for(var ki=0;ki<3&&ki<others.length;ki++){var o=others[ki];krCards+='<div class="pv-kr-card" data-article-id="'+o.id+'">'+(o.imageUrl?'<img src="'+o.imageUrl+'" alt="" class="pv-kr-img"/>':'<div class="pv-kr-img-ph"></div>')+'<div class="pv-kr-content"><span class="pv-kr-date">'+o.date+'</span><h3>'+o.title+'</h3><p>'+o.excerpt.slice(0,100)+'...</p><div class="pv-kr-author"><div class="pv-avatar">'+o.author.charAt(0)+'</div><span>'+o.author+'</span></div></div></div>';}
    var keepReading='<div class="pv-keep-reading"><h2>تابع القراءة</h2><div class="pv-kr-list">'+krCards+'</div></div>';
    var subscribeCta='<div class="pv-av-subscribe"><div class="pv-av-subscribe-inner"><h3>اشترك في '+siteName+'</h3><p>'+subText+'</p><div class="pv-av-sub-form"><input type="email" placeholder="أدخل بريدك الإلكتروني"/><button style="background:'+subBtnClr+'">'+subBtnTxt+'</button></div></div></div>';
    overlay.innerHTML='<div class="pv-site-wrapper">'+headerHtml+breadcrumb+'<div class="pv-av"><div class="pv-av-head"><h1>'+a.title+'</h1><div class="pv-av-meta"><div class="pv-av-author"><div class="pv-av-avatar">'+a.author.charAt(0)+'</div><div><strong>'+a.author+'</strong><span class="pv-date">'+a.date+'</span></div></div><div class="pv-av-actions"><span style="color:var(--pv-btn)">❤ '+a.likes+'</span><span>💬 '+a.comments+'</span><span>↗ مشاركة</span><span>🔖</span></div></div></div>'+cover+'<div class="pv-av-body"><p>'+a.excerpt+'</p><p>هذا نص تجريبي يمثل محتوى المقال كما سيظهر للقارئ. يمكن للكاتب إضافة فقرات متعددة وتنسيقات مختلفة لإثراء المحتوى وجعله أكثر جاذبية للقراء.</p><h3>عنوان فرعي للمقال</h3><p>هنا يستمر المقال بتفاصيل إضافية حول الموضوع المطروح. يمكن للكاتب التوسع في الشرح وإضافة أمثلة عملية تساعد القارئ على فهم الموضوع بشكل أفضل.</p><blockquote>الكتابة الجيدة هي إعادة الكتابة. لا تخف من تعديل نصك حتى يصل إلى أفضل صورة ممكنة.</blockquote><p>في النهاية، يُختتم المقال بملخص أو دعوة للتفاعل مع المحتوى من خلال التعليقات أو مشاركة المقال مع الآخرين.</p></div><div class="pv-av-tags"><span>كتابة</span><span>محتوى</span><span>نشرات بريدية</span></div><div class="pv-av-engagement"><span style="color:var(--pv-btn)">❤ '+a.likes+'</span><span>💬 '+a.comments+'</span><span>↗ مشاركة</span></div></div>'+subscribeCta+keepReading+footerHtml+'</div>';
    overlay.style.display='block';main.style.display='none';overlay.scrollTop=0;
    // Re-attach hamburger handler in overlay header
    var hb=overlay.querySelector('.pv-hamburger');
    var mm=overlay.querySelector('.pv-mobile-menu');
    if(hb&&mm){hb.onclick=function(){mm.classList.toggle('pv-mobile-menu-open');};}
    // Re-attach darkmode button in overlay
    var dmBtn=overlay.querySelector('.pv-darkmode-btn');
    if(dmBtn){dmBtn.onclick=function(){document.documentElement.classList.toggle('dark');this.textContent=document.documentElement.classList.contains('dark')?'☀':'☾';};}
    // Make logo clickable to go back
    var logoWrap=overlay.querySelector('.pv-logo-wrap');
    if(logoWrap){logoWrap.style.cursor='pointer';logoWrap.onclick=function(){closeArticle();};}
  }
  window.closeArticle=function(){overlay.style.display='none';main.style.display='block';};
  window.openArticle=openArticle;
  // Attach click handlers to all article cards and hero items
  document.addEventListener('click',function(e){
    var el=e.target.closest('[data-article-id]');
    if(el){e.preventDefault();openArticle(el.getAttribute('data-article-id'));}
  });
  // Handle page navigation from nav links (delegated to handle overlay nav too)
  document.addEventListener('click',function(e2){
    var link=e2.target.closest('.pv-nav-link, .pv-mobile-nav-link');
    if(!link)return;
    var href=link.getAttribute('href');
    if(href&&href.startsWith('#page-')){
      e2.preventDefault();
      if(overlay.style.display==='block')closeArticle();
      setTimeout(function(){var target=document.getElementById(href.slice(1));if(target)target.scrollIntoView({behavior:'smooth'});},50);
      document.querySelectorAll('.pv-mobile-menu').forEach(function(mm){mm.classList.remove('pv-mobile-menu-open');});
    } else if(href==='#'){
      e2.preventDefault();
      if(overlay.style.display==='block')closeArticle();
    }
  });
})();
</script>
</body>
</html>`;
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  const handleSave = () => {
    setSaveStatus("saving");
    try {
      if (typeof window !== "undefined" && window.localStorage) localStorage.setItem("kb_websites", JSON.stringify(sites));
    } catch (_) {}
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 600);
  };

  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "done">("idle");

  const handlePublish = () => {
    if (!activeSiteId || publishStatus === "publishing") return;
    setPublishStatus("publishing");
    updateSite(activeSiteId, { status: "published", publishedAt: new Date().toISOString() });
    handleSave();
    setTimeout(() => {
      setPublishStatus("done");
      setTimeout(() => setPublishStatus("idle"), 3000);
    }, 800);
  };

  const openArticlePicker = (compId: string) => {
    setArticlePickerTarget(compId);
    const comp = activePage?.components.find(c => c.id === compId);
    setSelectedArticles(comp?.settings.articles || []);
    setArticleSearch("");
    setArticlePickerModal(true);
  };

  const saveArticlePicker = () => {
    if (articlePickerTarget) {
      updateComponentSettings(articlePickerTarget, { articles: selectedArticles });
    }
    setArticlePickerModal(false);
  };

  const filteredArticles = MOCK_ARTICLES.filter(a =>
    !articleSearch || a.title.includes(articleSearch) || a.author.includes(articleSearch)
  );

  // ═══════════════════════════════════════════════════════
  //  RENDER: SITES LIST
  // ═══════════════════════════════════════════════════════
  if (view === "sites") {
    return (
      <div style={{ ...props.style, width: "100%", height: "100%", overflow: "auto" }}>
        <style>{CSS_STYLES}</style>
        <div className="kwb">
          <h1 className="kwb-title">مواقعك</h1>
          <div className="kwb-sites-grid">
            {/* Add New */}
            <div className="kwb-site-add" onClick={() => setView("templates")}>
              <div className="kwb-site-add-inner">
                {Icons.plus}
                <span>موقع جديد</span>
              </div>
            </div>

            {sites.map(s => (
              <div key={s.id} className="kwb-site-card">
                <div className="kwb-site-thumb" onClick={() => openBuilder(s.id)}>
                  <div className="kwb-site-thumb-placeholder">
                    <span className="kwb-site-thumb-text">{s.branding.siteName || s.name}</span>
                  </div>
                </div>
                <div className="kwb-site-info">
                  <div className="kwb-site-info-top">
                    <div className="kwb-site-menu-wrap" onClick={e => { e.stopPropagation(); setSiteMenuOpen(siteMenuOpen === s.id ? null : s.id); }}>
                      {Icons.dots}
                      {siteMenuOpen === s.id && (
                        <div className="kwb-dropdown" onClick={e => e.stopPropagation()}>
                          <button className="kwb-dropdown-item" onClick={() => openBuilder(s.id)}>عرض</button>
                          <button className="kwb-dropdown-item" onClick={() => duplicateSite(s.id)}>نسخ</button>
                          <button className="kwb-dropdown-item" onClick={() => openConfig(s.id)}>إعدادات</button>
                          <button className="kwb-dropdown-item kwb-dropdown-danger" onClick={() => deleteSite(s.id)}>حذف</button>
                        </div>
                      )}
                    </div>
                    <div className="kwb-site-name-col">
                      <span className="kwb-site-name">{s.name}</span>
                      <span className="kwb-site-date">آخر تحديث منذ ساعتين</span>
                    </div>
                  </div>
                  <div className="kwb-site-stats">
                    الزيارات: <strong>{s.visits.toLocaleString()}</strong>
                    &nbsp;&nbsp;المشتركون: <strong>{s.subscribers.toLocaleString()}</strong>
                  </div>
                  <button className="kwb-btn-edit" onClick={() => openBuilder(s.id)}>تحرير</button>
                </div>
              </div>
            ))}
          </div>

          {/* Configure Modal */}
          {configModal && (
            <div className="kwb-overlay" onClick={() => setConfigModal(false)}>
              <div className="kwb-modal" onClick={e => e.stopPropagation()}>
                <div className="kwb-modal-header">
                  <h2>إعدادات الموقع</h2>
                  <button className="kwb-btn-icon" onClick={() => setConfigModal(false)}>{Icons.x}</button>
                </div>
                <div className="kwb-modal-body">
                  <label className="kwb-label">اسم الموقع</label>
                  <input className="kwb-input" placeholder="أدخل اسم الموقع" value={draftConfig.name} onChange={e => setDraftConfig({ ...draftConfig, name: e.target.value })} />
                  <label className="kwb-label">الوصف</label>
                  <input className="kwb-input" placeholder="وصف مختصر لموقعك" value={draftConfig.description} onChange={e => setDraftConfig({ ...draftConfig, description: e.target.value })} />
                  <label className="kwb-label">النطاق المخصص</label>
                  <input className="kwb-input" placeholder="www.yourdomain.com" dir="ltr" value={draftConfig.customDomain} onChange={e => setDraftConfig({ ...draftConfig, customDomain: e.target.value })} />
                </div>
                <div className="kwb-modal-footer">
                  <button className="kwb-btn-primary kwb-btn-full" onClick={saveConfig}>حفظ الإعدادات</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER: TEMPLATE PICKER
  // ═══════════════════════════════════════════════════════
  if (view === "templates") {
    return (
      <div style={{ ...props.style, width: "100%", height: "100%", overflow: "auto" }}>
        <style>{CSS_STYLES}</style>
        <div className="kwb">
          <button className="kwb-back-link" onClick={() => setView("sites")}>رجوع</button>
          <h1 className="kwb-title">اختر قالبا</h1>
          <div className="kwb-templates-grid">
            {TEMPLATES.map(t => (
              <div key={t.id} className="kwb-template-card">
                <div className="kwb-template-thumb">
                  <div className="kwb-template-thumb-inner kwb-skeleton-preview">
                    {/* Skeleton header */}
                    <div className="kwb-skel-header">
                      <div className="kwb-skel-bar" style={{width:50,height:8,borderRadius:4}} />
                      <div style={{display:"flex",gap:6,flex:1,justifyContent:"flex-start"}}>
                        <div className="kwb-skel-bar" style={{width:24,height:6,borderRadius:3}} />
                        <div className="kwb-skel-bar" style={{width:24,height:6,borderRadius:3}} />
                        <div className="kwb-skel-bar" style={{width:24,height:6,borderRadius:3}} />
                      </div>
                      <div className="kwb-skel-btn" style={{width:36,height:10,borderRadius:2}} />
                    </div>
                    {/* Skeleton hero grid */}
                    <div className="kwb-skel-hero">
                      <div className="kwb-skel-hero-side">
                        <div className="kwb-skel-img" style={{flex:1}} />
                        <div className="kwb-skel-img" style={{flex:1}} />
                      </div>
                      <div className="kwb-skel-img kwb-skel-hero-main" />
                      <div className="kwb-skel-hero-side">
                        <div className="kwb-skel-img" style={{flex:1}} />
                        <div className="kwb-skel-img" style={{flex:1}} />
                      </div>
                    </div>
                    {/* Skeleton article cards */}
                    <div className="kwb-skel-articles">
                      <div className="kwb-skel-article"><div className="kwb-skel-img" style={{height:24}} /><div className="kwb-skel-bar" style={{width:"70%",height:5,borderRadius:3}} /><div className="kwb-skel-bar" style={{width:"50%",height:4,borderRadius:2}} /></div>
                      <div className="kwb-skel-article"><div className="kwb-skel-img" style={{height:24}} /><div className="kwb-skel-bar" style={{width:"60%",height:5,borderRadius:3}} /><div className="kwb-skel-bar" style={{width:"40%",height:4,borderRadius:2}} /></div>
                      <div className="kwb-skel-article"><div className="kwb-skel-img" style={{height:24}} /><div className="kwb-skel-bar" style={{width:"80%",height:5,borderRadius:3}} /><div className="kwb-skel-bar" style={{width:"55%",height:4,borderRadius:2}} /></div>
                      <div className="kwb-skel-article"><div className="kwb-skel-img" style={{height:24}} /><div className="kwb-skel-bar" style={{width:"65%",height:5,borderRadius:3}} /><div className="kwb-skel-bar" style={{width:"45%",height:4,borderRadius:2}} /></div>
                    </div>
                    {/* Skeleton footer */}
                    <div className="kwb-skel-footer">
                      <div className="kwb-skel-bar" style={{width:40,height:7,borderRadius:3,background:"#666"}} />
                      <div className="kwb-skel-bar" style={{width:60,height:4,borderRadius:2,background:"#555"}} />
                    </div>
                  </div>
                </div>
                <div className="kwb-template-info">
                  <h3 className="kwb-template-name">{t.name}</h3>
                  <p className="kwb-template-desc">{t.description}</p>
                  <div className="kwb-template-pages">
                    {SKELETON.pages.map(p => <span key={p} className="kwb-template-page-badge">{p}</span>)}
                  </div>
                  <button className="kwb-btn-primary kwb-btn-full" onClick={() => createFromTemplate(t.id)}>ابدأ بهذا القالب</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER: BUILDER
  // ═══════════════════════════════════════════════════════
  if (!activeSite || !activePage) return <div style={props.style} />;

  return (
    <div style={{ ...props.style, position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <style>{CSS_STYLES}</style>
      {/* Hidden inputs for file upload and color picker */}
      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
      <input type="color" ref={colorInputRef} style={{ display: "none" }} onInput={handleColorChange} onChange={handleColorChange} />
      <div className="kwb-builder">
        {/* Top controls */}
        <div className="kwb-builder-top">
          <div className="kwb-undo-redo">
            <button className="kwb-undo-btn" onClick={undo} disabled={undoStack.current.length === 0} title="تراجع (Ctrl+Z)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
            <button className="kwb-undo-btn" onClick={redo} disabled={redoStack.current.length === 0} title="إعادة (Ctrl+Shift+Z)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
            </button>
          </div>
          <div className="kwb-device-toggle">
            <button className={`kwb-device-btn ${previewDevice === "desktop" ? "kwb-device-active" : ""}`} onClick={() => setPreviewDevice("desktop")}>{Icons.monitor}</button>
            <button className={`kwb-device-btn ${previewDevice === "mobile" ? "kwb-device-active" : ""}`} onClick={() => setPreviewDevice("mobile")}>{Icons.phone}</button>
          </div>
        </div>

        <div className="kwb-builder-body">
          {/* ─── PREVIEW ─── */}
          <div className="kwb-preview-area" onClick={(e) => { if (!(e.target as HTMLElement).closest('.kwb-p-comp-wrap') && !(e.target as HTMLElement).closest('.kwb-p-insert-line')) { setExpandedComponent(null); setInsertAtIndex(null); } }}>
            <div className={`kwb-preview-frame ${previewDevice === "mobile" ? "kwb-preview-mobile" : ""}`}>
              <div className="kwb-preview-content" style={{ fontFamily: `'${activeSite.branding.fontFamily}', system-ui, sans-serif`, '--kwb-btn-color': activeSite.branding.buttonColor || '#E82222', '--kwb-headline-color': activeSite.branding.headlineColor || '#1a1a1a', '--kwb-text-color': activeSite.branding.textColor || '#666666', '--kwb-link-color': activeSite.branding.linkColor || '#E82222', '--kwb-bg': activeSite.branding.bgColor || '#ffffff', '--kwb-card-bg': activeSite.branding.cardBg || '#ffffff', '--kwb-radius': `${Math.round((activeSite.branding.borderRadius || 0) * 0.24)}px` } as any}>
                {/* Render each enabled component */}
                {activePage.components.filter(c => c.enabled).map((comp, _idx, _enabledComps) => {
                  const _isSelected = expandedComponent === comp.id;
                  const _isHovered = hoveredCompId === comp.id;
                  const _meta = COMPONENT_META[comp.type];
                  const _realIdx = activePage.components.findIndex(c => c.id === comp.id);
                  let _inner: any = null;
                  switch (comp.type) {
                    case "header": {
                      const logoLayout = activeSite.branding.logoLayout || "text_only";
                      const navLinksData = (comp.settings.navLinks || []).filter((link: any) => typeof link === "string" ? true : link.visible);
                      _inner = (
                          <div className="kwb-p-header">
                            <div className="kwb-p-header-inner">
                              <div className="kwb-p-logo-wrap">
                                {(logoLayout === "logo_only" || logoLayout === "logo_and_text") && activeSite.branding.logoUrl && (
                                  <img src={activeSite.branding.logoUrl} alt="" className="kwb-p-logo-img" />
                                )}
                                {(logoLayout === "text_only" || logoLayout === "logo_and_text") && (
                                  <span className="kwb-p-logo">{activeSite.branding.siteName}</span>
                                )}
                              </div>
                              <nav className="kwb-p-nav">
                                {navLinksData.map((link: any, i: number) => {
                                  const isNavLink = typeof link !== "string" && link.linkType === "page" && link.target;
                                  const targetPage = isNavLink ? activeSite.pages.find(p => p.slug === link.target) : null;
                                  return (
                                    <a key={typeof link === "string" ? i : link.id} className={`kwb-p-nav-link ${targetPage && activePageId === targetPage.id ? "kwb-p-nav-link-active" : ""}`} onClick={targetPage ? () => { setActivePageId(targetPage.id); setExpandedComponent(null); } : undefined} style={targetPage ? { cursor: "pointer" } : {}}>{typeof link === "string" ? link : link.label}</a>
                                  );
                                })}
                              </nav>
                              <div className="kwb-p-header-actions">
                                <button className="kwb-p-login-btn" onClick={() => setShowLoginModal(true)}>الدخول</button>
                                <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor }} onClick={() => setShowSubscribePopup(true)}>
                                  {comp.settings.buttonText || "اشتراك"}
                                </button>
                                <button className="kwb-p-darkmode-btn" title="الوضع الداكن">
                                  {activeSite.branding.darkMode ? "☀" : "☾"}
                                </button>
                              </div>
                              <button className="kwb-p-hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="القائمة">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                              </button>
                            </div>
                            {showMobileMenu && (
                              <div className="kwb-p-mobile-menu">
                                <nav className="kwb-p-mobile-nav">
                                  {navLinksData.map((link: any, i: number) => {
                                    const isNavLink = typeof link !== "string" && link.linkType === "page" && link.target;
                                    const targetPage = isNavLink ? activeSite.pages.find(p => p.slug === link.target) : null;
                                    return (
                                      <a key={typeof link === "string" ? i : link.id} className="kwb-p-mobile-nav-link" onClick={() => { if (targetPage) { setActivePageId(targetPage.id); setExpandedComponent(null); } setShowMobileMenu(false); }} style={targetPage ? { cursor: "pointer" } : {}}>{typeof link === "string" ? link : link.label}</a>
                                    );
                                  })}
                                </nav>
                                <div className="kwb-p-mobile-menu-actions">
                                  <button className="kwb-p-login-btn" onClick={() => { setShowLoginModal(true); setShowMobileMenu(false); }}>الدخول</button>
                                  <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor }} onClick={() => { setShowSubscribePopup(true); setShowMobileMenu(false); }}>
                                    {comp.settings.buttonText || "اشتراك"}
                                  </button>
                                  <button className="kwb-p-darkmode-btn" title="الوضع الداكن">
                                    {activeSite.branding.darkMode ? "☀" : "☾"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      break;
                    }

                    case "hero_news":
                      const heroArticles = (comp.settings.articles || []).map((id: string) => MOCK_ARTICLES.find(a => a.id === id)).filter(Boolean) as Article[];
                      const mainArticle = heroArticles[0];
                      const sideArticles = heroArticles.slice(1, 5);
                      _inner = (
                        <div className="kwb-p-hero-news">
                          {/* Right side articles */}
                          <div className="kwb-p-hero-side kwb-p-hero-side-r">
                            {sideArticles.slice(0, 2).map(a => (
                              <div key={a.id} className="kwb-p-hero-side-card">
                                {a.imageUrl ? <img src={a.imageUrl} alt={a.title} className="kwb-p-hero-side-img" /> : <div className="kwb-p-hero-side-img" />}
                                <h4>{a.title.slice(0, 60)}...</h4>
                                <div className="kwb-p-hero-card-footer">
                                  <div className="kwb-p-article-author-row"><div className="kwb-p-article-avatar">{a.author.charAt(0)}</div><span className="kwb-p-article-author-name">{a.author}</span></div>
                                  <span className="kwb-p-hero-date">{a.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Center main */}
                          <div className="kwb-p-hero-main">
                            {mainArticle?.imageUrl ? <img src={mainArticle.imageUrl} alt={mainArticle.title} className="kwb-p-hero-main-img" /> : <div className="kwb-p-hero-main-img" />}
                            {mainArticle && (
                              <>
                                <h2 className="kwb-p-hero-main-title">{mainArticle.title}</h2>
                                <p className="kwb-p-hero-main-excerpt">{mainArticle.excerpt}</p>
                                <div className="kwb-p-hero-meta">
                                  <div className="kwb-p-article-author-row"><div className="kwb-p-article-avatar">{mainArticle.author.charAt(0)}</div><span className="kwb-p-article-author-name">{mainArticle.author}</span><span className="kwb-p-hero-date" style={{ marginRight: 8 }}>{mainArticle.date}</span></div>
                                  <span className="kwb-p-hero-engagement">
                                    <span>{Icons.comment} {mainArticle.comments}</span>
                                    <span style={{ color: activeSite.branding.buttonColor || "#E82222" }}>{Icons.heart} {mainArticle.likes}</span>
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {/* Left side articles */}
                          <div className="kwb-p-hero-side kwb-p-hero-side-l">
                            {sideArticles.slice(2, 4).map(a => (
                              <div key={a.id} className="kwb-p-hero-side-card">
                                {a.imageUrl ? <img src={a.imageUrl} alt={a.title} className="kwb-p-hero-side-img" /> : <div className="kwb-p-hero-side-img" />}
                                <h4>{a.title.slice(0, 60)}...</h4>
                                <div className="kwb-p-hero-card-footer">
                                  <div className="kwb-p-article-author-row"><div className="kwb-p-article-avatar">{a.author.charAt(0)}</div><span className="kwb-p-article-author-name">{a.author}</span></div>
                                  <span className="kwb-p-hero-date">{a.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ); break;

                    case "subscribe":
                      if (comp.settings.layout === "hero_centered") {
                        _inner = (
                          <div className="kwb-p-hero-sub">
                            <div className="kwb-p-header-hero-img-wrap">
                              {comp.settings.heroImageUrl ? (
                                <img src={comp.settings.heroImageUrl} alt="" className="kwb-p-header-hero-img" />
                              ) : (
                                <div className="kwb-p-header-hero-img-ph">{Icons.image}</div>
                              )}
                            </div>
                            <h2 contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { title: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.title || activeSite.branding.siteName}</h2>
                            <p contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { subtitle: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.subtitle || "محتوى حصري يصلك كل أسبوع"}</p>
                            <div className="kwb-p-hero-sub-form">
                              <input type="email" name="email" autoComplete="email" placeholder="أدخل بريدك الإلكتروني" className="kwb-p-email-input" />
                              <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor }} onClick={() => setShowSubscribePopup(true)}>
                                {comp.settings.buttonText || "اشتراك"}
                              </button>
                            </div>
                          </div>
                        );
                      } else if (comp.settings.layout === "cta") {
                        _inner = (
                          <div className="kwb-p-cta">
                            <div className="kwb-p-cta-inner">
                              <div className="kwb-p-cta-text">
                                <div className="kwb-p-cta-logo">{activeSite.branding.siteName.charAt(0)}</div>
                                <div>
                                  <h3 contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { title: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.title || "اشترك في نشرتنا"}</h3>
                                  <p contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { description: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.description || "محتوى حصري يصلك مباشرة إلى بريدك"}</p>
                                </div>
                              </div>
                              <div className="kwb-p-cta-form">
                                <input type="email" name="email" autoComplete="email" placeholder="أدخل بريدك الإلكتروني" className="kwb-p-email-input" />
                                <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor }} onClick={() => setShowSubscribePopup(true)}>
                                  {comp.settings.buttonText || "اشتراك"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (comp.settings.layout === "form") {
                        _inner = (
                          <div className="kwb-p-subscribe-form">
                            <h3 contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { title: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.title || "اشترك في نشرتنا"}</h3>
                            <p contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { description: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.description || "محتوى حصري يصلك مباشرة إلى بريدك"}</p>
                            {comp.settings.showNameField && <input type="text" placeholder="الاسم" className="kwb-p-email-input" style={{ maxWidth: 440, margin: "0 auto 8px", display: "block" }} />}
                            <div className="kwb-p-hero-sub-form">
                              <input type="email" name="email" autoComplete="email" placeholder="أدخل بريدك الإلكتروني" className="kwb-p-email-input" />
                              <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor }} onClick={() => setShowSubscribePopup(true)}>
                                {comp.settings.buttonText || "اشتراك"}
                              </button>
                            </div>
                          </div>
                        );
                      } else {
                        _inner = (
                          <div className="kwb-p-hero-sub">
                            <h2 contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { title: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.title || "انضم لنشرتنا البريدية"}</h2>
                            <p contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { subtitle: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.subtitle || "محتوى حصري يصلك كل أسبوع"}</p>
                            <div className="kwb-p-hero-sub-form">
                              <input type="email" name="email" autoComplete="email" placeholder="أدخل بريدك الإلكتروني" className="kwb-p-email-input" />
                              <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor }} onClick={() => setShowSubscribePopup(true)}>
                                {comp.settings.buttonText || "اشتراك"}
                              </button>
                            </div>
                          </div>
                        );
                      }
                      break;

                    case "brands_ticker": {
                      const tickerSpeed = comp.settings.speed || 30;
                      const brandItems = comp.settings.items || [];
                      const repeatCount = comp.settings.repeat ?? (brandItems.length <= 1 ? 2 : 1);
                      const renderBrands = (keyPrefix: string) => brandItems.map((b: any, i: number) => (
                        <span key={`${keyPrefix}-${i}`} className="kwb-p-ticker-brand">
                          {b.imageUrl && <img src={b.imageUrl} alt={b.name || ""} className="kwb-p-ticker-logo" />}
                          {b.name && <span>{b.name}</span>}
                        </span>
                      ));
                      const renderText = () => (
                        <>
                          <span>{activeSite.branding.siteName}</span>
                          <span className="kwb-p-ticker-dot">&#x2022;</span>
                          <span>مدونة {activeSite.branding.siteName}</span>
                          <span className="kwb-p-ticker-dot">&#x2022;</span>
                          <span>{activeSite.branding.siteName}</span>
                          <span className="kwb-p-ticker-dot">&#x2022;</span>
                          <span>مدونة {activeSite.branding.siteName}</span>
                        </>
                      );
                      _inner = (
                        <div className="kwb-p-ticker">
                          {comp.settings.headline && <h3 className="kwb-p-ticker-headline kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { headline: e.currentTarget.textContent || "" })}>{comp.settings.headline}</h3>}
                          <div className="kwb-p-ticker-inner" style={{ animationDuration: `${tickerSpeed}s` }}>
                            {brandItems.length > 0 ? (
                              <>
                                {Array.from({ length: repeatCount }, (_, r) => renderBrands(`r${r}`))}
                              </>
                            ) : renderText()}
                          </div>
                        </div>
                      ); break;
                    }


                    case "article_collection": {
                      const acLayout = comp.settings.layout || "grid";
                      if (acLayout === "gallery") {
                        const galleryArticleIds = comp.settings.articles || [];
                        const galleryArticles = galleryArticleIds.map((id: string) => MOCK_ARTICLES.find(a => a.id === id)).filter(Boolean);
                        const sidebarArt = MOCK_ARTICLES.find(a => a.id === comp.settings.sidebarArticle);
                        _inner = (
                          <div className="kwb-p-gallery">
                            {comp.settings.sectionTitle && (
                              <div className="kwb-p-gallery-header">
                                <h2 className="kwb-p-gallery-title">{comp.settings.sectionTitle}</h2>
                              </div>
                            )}
                            <div className={`kwb-p-gallery-body ${comp.settings.showSidebar ? "kwb-p-gallery-with-sidebar" : ""}`}>
                              <div className="kwb-p-gallery-cards">
                                {galleryArticles.map((a: any, i: number) => (
                                  <div key={i} className="kwb-p-gallery-card">
                                    <div className="kwb-p-gallery-card-img">
                                      {a.imageUrl ? <img src={a.imageUrl} alt={a.title} /> : <div className="kwb-p-gallery-card-img-ph" />}
                                    </div>
                                    <h3 className="kwb-p-gallery-card-title">{a.title}</h3>
                                    <p className="kwb-p-gallery-card-excerpt">{a.excerpt.slice(0, 120)}...</p>
                                    <div className="kwb-p-gallery-card-footer">
                                      <span className="kwb-p-gallery-card-author">{a.author}</span>
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {comp.settings.showSidebar && (
                                <div className="kwb-p-gallery-sidebar">
                                  <h3 className="kwb-p-gallery-sidebar-title">{sidebarArt?.title || comp.settings.sidebarTitle || ""}</h3>
                                  <div className="kwb-p-gallery-sidebar-img">
                                    {(comp.settings.sidebarImageUrl || sidebarArt?.imageUrl) ? <img src={comp.settings.sidebarImageUrl || sidebarArt?.imageUrl} alt="" /> : <div className="kwb-p-gallery-card-img-ph" style={{ height: 320 }} />}
                                  </div>
                                  {comp.settings.sidebarButtonText && (
                                    <button className="kwb-p-gallery-sidebar-btn">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
                                      {comp.settings.sidebarButtonText}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } else if (acLayout === "category_feed") {
                        const catId = comp.settings.categoryId || "";
                        const cat = MOCK_CATEGORIES.find(c => c._id === catId);
                        const catName = cat?.name || "التصنيف";
                        const catArticles = MOCK_ARTICLES.filter(a => a.categories.includes(catId)).slice(0, comp.settings.maxArticles || 5);
                        const featured = catArticles[0];
                        const rest = catArticles.slice(1);
                        const cfLayout = comp.settings.categoryLayout || "featured_right";
                        const sidebarCatId = comp.settings.sidebarCategoryId || "";
                        const sidebarCat = MOCK_CATEGORIES.find(c => c._id === sidebarCatId);
                        const sidebarArticles = sidebarCat ? MOCK_ARTICLES.filter(a => a.categories.includes(sidebarCatId)).slice(0, 2) : [];
                        _inner = (
                          <div className="kwb-p-catfeed">
                            <div className="kwb-p-catfeed-header">
                              <h2 className="kwb-p-catfeed-title">{catName}</h2>
                              {comp.settings.showMoreLink && (
                                <span className="kwb-p-catfeed-more">{comp.settings.moreText || `المزيد من ${catName}`} &#x25C0;</span>
                              )}
                            </div>
                            <div className={`kwb-p-catfeed-body kwb-p-catfeed-${cfLayout}`}>
                              <div className="kwb-p-catfeed-main">
                                {rest.map((a: any, i: number) => (
                                  <div key={i} className="kwb-p-catfeed-card">
                                    <div className="kwb-p-catfeed-card-img">
                                      {a.imageUrl ? <img src={a.imageUrl} alt={a.title} /> : <div className="kwb-p-gallery-card-img-ph" />}
                                    </div>
                                    <div className="kwb-p-catfeed-card-content">
                                      <h3 className="kwb-p-catfeed-card-title">{a.title}</h3>
                                      <p className="kwb-p-catfeed-card-excerpt">{a.excerpt.slice(0, 100)}...</p>
                                      <span className="kwb-p-catfeed-card-author">{a.author}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {featured && (
                                <div className="kwb-p-catfeed-featured">
                                  <div className="kwb-p-catfeed-featured-img">
                                    {featured.imageUrl ? <img src={featured.imageUrl} alt={featured.title} /> : <div className="kwb-p-gallery-card-img-ph" style={{ height: "100%", minHeight: 280 }} />}
                                  </div>
                                  <h3 className="kwb-p-catfeed-featured-title">{featured.title}</h3>
                                  <p className="kwb-p-catfeed-featured-excerpt">{featured.excerpt.slice(0, 140)}...</p>
                                  <span className="kwb-p-catfeed-card-author">{featured.author}</span>
                                </div>
                              )}
                              {comp.settings.showSidebar && sidebarCat && (
                                <div className="kwb-p-catfeed-sidebar">
                                  <h3 className="kwb-p-catfeed-sidebar-title">{comp.settings.sidebarTitle || sidebarCat.name}</h3>
                                  {sidebarArticles.map((a: any, i: number) => (
                                    <div key={i} className="kwb-p-catfeed-sidebar-card">
                                      {a.imageUrl ? <img src={a.imageUrl} alt={a.title} className="kwb-p-catfeed-sidebar-img" /> : <div className="kwb-p-gallery-card-img-ph" style={{ height: 120 }} />}
                                      <span className="kwb-p-catfeed-sidebar-label">{a.title.slice(0, 50)}</span>
                                    </div>
                                  ))}
                                  <span className="kwb-p-catfeed-more" style={{ marginTop: 8 }}>المزيد من {sidebarCat.name} &#x25C0;</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        const collArticlesRaw = (comp.settings.articles || []).map((id: string) => MOCK_ARTICLES.find(a => a.id === id)).filter(Boolean) as Article[];
                        const collArticles = collArticlesRaw.filter(a => {
                          if (comp.settings.showSearch && articleFilterSearch && !a.title.includes(articleFilterSearch) && !a.excerpt.includes(articleFilterSearch)) return false;
                          if (comp.settings.showCategories && articleFilterCategory && !a.categories.includes(articleFilterCategory)) return false;
                          return true;
                        });
                        _inner = (
                          <div className="kwb-p-articles">
                            {(comp.settings.showSearch || comp.settings.showCategories) && (
                              <div className="kwb-p-articles-filters">
                                {comp.settings.showSearch && (
                                  <div className="kwb-p-articles-search-wrap">
                                    <input className="kwb-p-articles-search" placeholder="ابحث في المقالات..." value={articleFilterSearch} onChange={e => setArticleFilterSearch(e.target.value)} />
                                    <span className="kwb-p-articles-search-icon">{Icons.search}</span>
                                  </div>
                                )}
                                {comp.settings.showCategories && (
                                  <div className="kwb-p-articles-cats">
                                    <button className={`kwb-p-cat-btn ${!articleFilterCategory ? "kwb-p-cat-active" : ""}`} onClick={() => setArticleFilterCategory(null)}>الكل</button>
                                    {MOCK_CATEGORIES.map(cat => (
                                      <button key={cat._id} className={`kwb-p-cat-btn ${articleFilterCategory === cat._id ? "kwb-p-cat-active" : ""}`} onClick={() => setArticleFilterCategory(articleFilterCategory === cat._id ? null : cat._id)}>{cat.name}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className={`kwb-p-articles-grid ${comp.settings.mobileLayout === "list" ? "kwb-p-articles-mobile-list" : ""}`}>
                              {collArticles.map(a => (
                                <a key={a.id} className="kwb-p-article-card" href={`/article/${a.slug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                                  <div className="kwb-p-article-img" style={a.imageUrl ? { backgroundImage: `url(${a.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
                                  <div className="kwb-p-article-card-text">
                                    <h4 className="kwb-p-article-title">{a.title}</h4>
                                    <p className="kwb-p-article-excerpt">{a.excerpt.slice(0, 80)}...</p>
                                    <div className="kwb-p-article-author-row">
                                      <span className="kwb-p-article-author-name">{a.author}</span>
                                    </div>
                                    <div className="kwb-p-article-meta">
                                      <span>{a.date}</span>
                                      <span className="kwb-p-article-engagement">
                                        <span style={{ color: activeSite.branding.buttonColor || "#E82222" }}>{Icons.heart} {a.likes}</span>
                                        <span>{Icons.comment} {a.comments}</span>
                                      </span>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                            {collArticles.length === 0 && (comp.settings.showSearch || comp.settings.showCategories) && (
                              <p style={{ textAlign: "center", color: "var(--kwb-text-color,#999)", fontSize: 13, padding: 20 }}>لا توجد مقالات تطابق البحث</p>
                            )}
                            <a className="kwb-p-all-articles">جميع المقالات &#x2197;</a>
                          </div>
                        );
                      }
                      break;
                    }

                    case "banner": {
                      const bannerCards = comp.settings.cards || [];
                      _inner = (
                        <div className="kwb-p-banners">
                          <div className="kwb-p-banner-grid">
                            {bannerCards.map((card: any, ci: number) => (
                              <div key={ci} className="kwb-p-banner-card" style={{ background: card.imageUrl ? `url(${card.imageUrl}) center/cover` : (card.color || activeSite.branding.buttonColor || "#E82222") }}>
                                {card.imageUrl && <div className="kwb-p-banner-card-overlay" />}
                                <span contentEditable suppressContentEditableWarning onBlur={(e) => { const cards = [...(comp.settings.cards || [])]; cards[ci] = { ...cards[ci], title: e.currentTarget.textContent || "" }; updateComponentSettings(comp.id, { cards }); }} className="kwb-p-editable">{card.title || "عنوان اللافتة"}</span>
                                <a href={card.linkUrl || "#"} target={card.linkUrl ? "_blank" : undefined} rel="noopener">{card.linkText || "اقرأ المزيد"} &#x2197;</a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ); break;
                    }

                    case "footer":
                      const footerLogoLayout = activeSite.branding.logoLayout || "text_only";
                      const headerCompForFooter = activePage.components.find(c => c.type === "header");
                      const footerNavLinks: NavLink[] = (headerCompForFooter?.settings?.navLinks || comp.settings.links || []).map((link: any) =>
                        typeof link === "string" ? { id: String(Math.random()), label: link, linkType: "page" as const, target: "", visible: true } : link
                      );
                      const footerCustomLinks = comp.settings.customLinks || [];
                      _inner = (
                        <div className="kwb-p-footer">
                          <div className="kwb-p-footer-inner">
                            <div className="kwb-p-footer-logo-col">
                              {(footerLogoLayout === "logo_only" || footerLogoLayout === "logo_and_text") && activeSite.branding.logoUrl && (
                                <img src={activeSite.branding.logoUrl} alt="" className="kwb-p-footer-logo-img" />
                              )}
                              {(footerLogoLayout === "text_only" || footerLogoLayout === "logo_and_text") && (
                                <span className="kwb-p-footer-logo">{comp.settings.title || activeSite.branding.siteName}</span>
                              )}
                              {comp.settings.customText && (
                                <p className="kwb-p-footer-custom-text">{comp.settings.customText}</p>
                              )}
                            </div>
                            <div className="kwb-p-footer-right">
                              <p className="kwb-p-footer-tagline kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { tagline: e.currentTarget.textContent || "" })}>{comp.settings.tagline || "محتوى حصري يصلك مباشرة إلى بريدك"}</p>
                              <div className="kwb-p-footer-form">
                                <input type="email" name="email" autoComplete="email" placeholder="أدخل بريدك الإلكتروني" className="kwb-p-footer-email" />
                                <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor }} onClick={() => setShowSubscribePopup(true)}>
                                  {comp.settings.buttonText || "اشتراك"}
                                </button>
                              </div>
                              <nav className="kwb-p-footer-nav">
                                {footerNavLinks.filter(l => l.visible).map((l, i) => <a key={l.id || i}>{l.label}</a>)}
                                {footerCustomLinks.map((cl: any, i: number) => (
                                  <a key={`cl-${i}`} href={cl.url || "#"} target={cl.url ? "_blank" : undefined} rel="noopener noreferrer">{cl.label}</a>
                                ))}
                              </nav>
                            </div>
                          </div>
                          <div className="kwb-p-footer-bottom">
                            <span>جميع الحقوق محفوظة {new Date().getFullYear()} {activeSite.branding.siteName}</span>
                          </div>
                        </div>
                      ); break;

                    case "article_view":
                      const sampleArticle = MOCK_ARTICLES[0];
                      _inner = (
                        <div className="kwb-p-article-view">
                          <div className="kwb-p-av-header">
                            <span className="kwb-p-av-category">مقالات</span>
                            <h1 className="kwb-p-av-title">{sampleArticle.title}</h1>
                            <div className="kwb-p-av-meta">
                              <div className="kwb-p-av-author">
                                <div className="kwb-p-av-avatar">{sampleArticle.author.charAt(0)}</div>
                                <div>
                                  <span className="kwb-p-av-author-name">{sampleArticle.author}</span>
                                  <span className="kwb-p-av-date">{sampleArticle.date}</span>
                                </div>
                              </div>
                              <div className="kwb-p-av-actions">
                                <span>{Icons.heart} {sampleArticle.likes}</span>
                                <span>{Icons.comment} {sampleArticle.comments}</span>
                                <span>{Icons.share}</span>
                                <span>{Icons.bookmark}</span>
                              </div>
                            </div>
                          </div>
                          <div className="kwb-p-av-cover" />
                          <div className="kwb-p-av-body">
                            <p>هذا نص تجريبي يمثل محتوى المقال كما سيظهر للقارئ. يمكن للكاتب إضافة فقرات متعددة وتنسيقات مختلفة لإثراء المحتوى وجعله أكثر جاذبية للقراء.</p>
                            <p>يدعم المقال إضافة صور وعناوين فرعية واقتباسات وقوائم نقطية ومرقمة. كل هذه العناصر تساعد في تنظيم المحتوى وتسهيل قراءته.</p>
                            <h3>عنوان فرعي للمقال</h3>
                            <p>هنا يستمر المقال بتفاصيل إضافية حول الموضوع المطروح. يمكن للكاتب التوسع في الشرح وإضافة أمثلة عملية تساعد القارئ على فهم الموضوع بشكل أفضل.</p>
                            <blockquote className="kwb-p-av-quote">الكتابة الجيدة هي إعادة الكتابة. لا تخف من تعديل نصك حتى يصل إلى أفضل صورة ممكنة.</blockquote>
                            <p>في النهاية، يُختتم المقال بملخص أو دعوة للتفاعل مع المحتوى من خلال التعليقات أو مشاركة المقال مع الآخرين.</p>
                          </div>
                          <div className="kwb-p-av-footer-actions">
                            <div className="kwb-p-av-tags">
                              <span className="kwb-p-av-tag">كتابة</span>
                              <span className="kwb-p-av-tag">محتوى</span>
                              <span className="kwb-p-av-tag">نشرات بريدية</span>
                            </div>
                            <div className="kwb-p-av-engagement">
                              <span style={{ color: activeSite.branding.buttonColor || "#E82222" }}>{Icons.heart} {sampleArticle.likes}</span>
                              <span>{Icons.comment} {sampleArticle.comments}</span>
                              <span>{Icons.share} مشاركة</span>
                            </div>
                          </div>
                        </div>
                      ); break;

                    case "text_block":
                      _inner = (
                        <div className="kwb-p-text-block">
                          <p contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { content: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.content || "أضف نصك هنا..."}</p>
                        </div>
                      ); break;

                    case "rich_text": {
                      const rteRef = `rte-${comp.id}`;
                      const execRte = (cmd: string, val?: string) => {
                        const el = document.getElementById(rteRef);
                        if (el) { el.focus(); document.execCommand(cmd, false, val); }
                      };
                      _inner = (
                        <div className="kwb-p-rich-text">
                          <div className="kwb-p-rte-toolbar">
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("formatBlock", "h2"); }} title="عنوان">H</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("formatBlock", "h3"); }} title="عنوان فرعي">H3</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("formatBlock", "p"); }} title="فقرة">P</button>
                            <span className="kwb-p-rte-sep" />
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("bold"); }} title="عريض"><strong>B</strong></button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("italic"); }} title="مائل"><em>I</em></button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("underline"); }} title="تحته خط"><u>U</u></button>
                            <span className="kwb-p-rte-sep" />
                            <button type="button" onMouseDown={e => { e.preventDefault(); const url = prompt("أدخل الرابط:", "https://"); if (url) execRte("createLink", url); }} title="رابط">🔗</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("insertUnorderedList"); }} title="قائمة نقطية">•</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("insertOrderedList"); }} title="قائمة رقمية">1.</button>
                            <span className="kwb-p-rte-sep" />
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("justifyRight"); }} title="محاذاة يمين">⫡</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("justifyCenter"); }} title="محاذاة وسط">⫠</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("justifyLeft"); }} title="محاذاة يسار">⫢</button>
                            <span className="kwb-p-rte-sep" />
                            <button type="button" onMouseDown={e => { e.preventDefault(); execRte("insertHorizontalRule"); }} title="فاصل">—</button>
                            <button type="button" onMouseDown={e => { e.preventDefault(); const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = () => { const f = inp.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = (ev) => { const dataUrl = ev.target?.result as string; if (dataUrl) execRte("insertImage", dataUrl); }; reader.readAsDataURL(f); }; inp.click(); }} title="صورة">{Icons.image}</button>
                          </div>
                          <div
                            id={rteRef}
                            className="kwb-p-rich-text-content kwb-p-rte-editable"
                            contentEditable
                            suppressContentEditableWarning
                            dir="rtl"
                            dangerouslySetInnerHTML={{ __html: comp.settings.html || "<h2>عنوان القسم</h2><p>أضف محتواك المنسق هنا...</p>" }}
                            onBlur={(e) => updateComponentSettings(comp.id, { html: e.currentTarget.innerHTML })}
                          />
                        </div>
                      ); break;
                    }

                    case "image_block":
                      _inner = (
                        <div className="kwb-p-image-block">
                          {comp.settings.imageUrl ? (
                            <img src={comp.settings.imageUrl} alt="" className="kwb-p-image-full" />
                          ) : (
                            <div className="kwb-p-image-placeholder">{Icons.image}</div>
                          )}
                          {comp.settings.caption && <p className="kwb-p-image-caption">{comp.settings.caption}</p>}
                        </div>
                      ); break;


                    case "contact_form":
                      _inner = (
                        <div className="kwb-p-contact-form">
                          <h3 contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { title: e.currentTarget.textContent || "" })} className="kwb-p-editable">{comp.settings.title || "تواصل معنا"}</h3>
                          <form className="kwb-p-cf-fields" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); console.log("Contact form:", { name: fd.get("name"), email: fd.get("email"), message: fd.get("message"), to: activeSite.name }); alert("أُرسلت رسالتك بنجاح!"); e.currentTarget.reset(); }}>
                            <input name="name" placeholder="الاسم" className="kwb-p-cf-input" required autoComplete="name" />
                            <input name="email" type="email" placeholder="البريد الإلكتروني" className="kwb-p-cf-input" required autoComplete="email" />
                            <textarea name="message" placeholder="الرسالة" className="kwb-p-cf-textarea" rows={4} required />
                            <button type="submit" className="kwb-p-subscribe-btn kwb-p-cf-btn" style={{ background: activeSite.branding.buttonColor }}>
                              {comp.settings.buttonText || "إرسال"}
                            </button>
                          </form>
                        </div>
                      ); break;

                    case "divider":
                      _inner = <hr className="kwb-p-divider" />; break;

                    case "testimonials": {
                      const items = comp.settings.items || [];
                      const isGrid = (comp.settings.layout || "grid") === "grid";
                      _inner = (
                        <div className="kwb-p-section">
                          <h3 className="kwb-p-section-title kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { sectionTitle: e.currentTarget.textContent || "" })}>{comp.settings.sectionTitle || "آراء العملاء"}</h3>
                          <div className={isGrid ? "kwb-p-testi-grid" : "kwb-p-testi-list"}>
                            {items.map((item: any, i: number) => (
                              <div key={i} className="kwb-p-testi-card">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt="" className="kwb-p-testi-img" />
                                ) : (
                                  <div className="kwb-p-testi-avatar">{item.name?.charAt(0) || "؟"}</div>
                                )}
                                <p className="kwb-p-testi-text">"{item.text}"</p>
                                <span className="kwb-p-testi-name">{item.name}</span>
                                <span className="kwb-p-testi-role">{item.role}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ); break;
                    }

                    case "products": {
                      const items = comp.settings.items || [];
                      const isGrid = (comp.settings.layout || "grid") === "grid";
                      _inner = (
                        <div className="kwb-p-section">
                          <h3 className="kwb-p-section-title kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { sectionTitle: e.currentTarget.textContent || "" })}>{comp.settings.sectionTitle || "المنتجات"}</h3>
                          <div className={isGrid ? "kwb-p-products-grid" : "kwb-p-products-list"}>
                            {items.map((item: any, i: number) => (
                              <div key={i} className="kwb-p-product-card">
                                <div className="kwb-p-product-img">{Icons.image}</div>
                                <h4 className="kwb-p-product-title">{item.title}</h4>
                                <p className="kwb-p-product-subtitle">{item.subtitle}</p>
                                <span className="kwb-p-product-price">{item.price}</span>
                                <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor, width: "100%", marginTop: 8 }}>{item.buttonText || "اشتري"}</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ); break;
                    }

                    case "movies": {
                      const movieItems = comp.settings.items || [];
                      _inner = (
                        <div className="kwb-p-section">
                          <h3 className="kwb-p-section-title kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { sectionTitle: e.currentTarget.textContent || "" })}>{comp.settings.sectionTitle || "أفلام ومسلسلات"}</h3>
                          <div className="kwb-p-movies-grid">
                            {movieItems.map((item: any, i: number) => (
                              <a key={i} className="kwb-p-movie-card" href={item.url || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                                <div className="kwb-p-movie-poster">
                                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div className="kwb-p-movie-poster-ph"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16"/></svg></div>}
                                </div>
                                <div className="kwb-p-movie-info">
                                  <h4 className="kwb-p-movie-title">{item.title}</h4>
                                  <p className="kwb-p-movie-subtitle">{item.subtitle}</p>
                                  {item.buttonText && <span className="kwb-p-movie-btn" style={{ background: activeSite.branding.buttonColor }}>{item.buttonText}</span>}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      ); break;
                    }

                    case "podcast": {
                      const programs = comp.settings.programs || [];
                      const podLayout = comp.settings.layout || "list";
                      if (podLayout === "featured") {
                        _inner = (
                          <div className="kwb-p-section">
                            <h3 className="kwb-p-section-title kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { sectionTitle: e.currentTarget.textContent || "" })}>{comp.settings.sectionTitle || "البودكاست"}</h3>
                            <div className="kwb-p-podcast-featured-grid">
                              {programs.map((prog: any, pi: number) => (
                                <a key={pi} className="kwb-p-podcast-featured-card" href={prog.url || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                                  <div className="kwb-p-podcast-featured-cover">
                                    {prog.imageUrl ? <img src={prog.imageUrl} alt={prog.name} /> : <div className="kwb-p-podcast-featured-cover-ph"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg></div>}
                                  </div>
                                  <div className="kwb-p-podcast-featured-info">
                                    <h4 className="kwb-p-podcast-featured-name">{prog.name}</h4>
                                    <p className="kwb-p-podcast-featured-desc">{prog.description}</p>
                                    <span className="kwb-p-podcast-featured-eps">{(prog.episodes || []).length} حلقة</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      } else {
                        const podIsGrid = podLayout === "grid";
                        _inner = (
                          <div className="kwb-p-section">
                            <h3 className="kwb-p-section-title kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { sectionTitle: e.currentTarget.textContent || "" })}>{comp.settings.sectionTitle || "البودكاست"}</h3>
                            {programs.map((prog: any, pi: number) => (
                              <div key={pi} style={{ marginBottom: pi < programs.length - 1 ? 20 : 0 }}>
                                <div className="kwb-p-podcast-program">
                                  {prog.imageUrl ? <img src={prog.imageUrl} alt="" className="kwb-p-podcast-prog-img" style={{ objectFit: "cover" }} /> : <div className="kwb-p-podcast-prog-img">{Icons.image}</div>}
                                  <div>
                                    <h4 className="kwb-p-podcast-prog-name">{prog.name}</h4>
                                    <p className="kwb-p-podcast-prog-desc">{prog.description}</p>
                                  </div>
                                </div>
                                <div className={podIsGrid ? "kwb-p-podcast-grid" : "kwb-p-podcast-list"}>
                                  {(prog.episodes || []).map((ep: any, ei: number) => (
                                    <div key={ei} className="kwb-p-podcast-card">
                                      <div className="kwb-p-podcast-ep-num">{ei + 1}</div>
                                      <div className="kwb-p-podcast-info">
                                        <h4 className="kwb-p-podcast-title">{ep.title}</h4>
                                        <p className="kwb-p-podcast-subtitle">{ep.subtitle}</p>
                                        <span className="kwb-p-podcast-duration">{ep.duration}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      break;
                    }

                    case "courses": {
                      const items = comp.settings.items || [];
                      const isGrid = (comp.settings.layout || "grid") === "grid";
                      _inner = (
                        <div className="kwb-p-section">
                          <h3 className="kwb-p-section-title kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { sectionTitle: e.currentTarget.textContent || "" })}>{comp.settings.sectionTitle || "الدورات"}</h3>
                          <div className={isGrid ? "kwb-p-courses-grid" : "kwb-p-courses-list"}>
                            {items.map((item: any, i: number) => (
                              <div key={i} className="kwb-p-course-card">
                                <div className="kwb-p-course-img">{Icons.image}</div>
                                <h4 className="kwb-p-product-title">{item.title}</h4>
                                <p className="kwb-p-product-subtitle">{item.subtitle}</p>
                                <span className="kwb-p-product-price">{item.price}</span>
                                <button className="kwb-p-subscribe-btn" style={{ background: activeSite.branding.buttonColor, width: "100%", marginTop: 8 }}>{item.buttonText || "سجّل"}</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ); break;
                    }

                    case "topics": {
                      const items = comp.settings.items || [];
                      const isGrid = (comp.settings.layout || "grid") === "grid";
                      _inner = (
                        <div className="kwb-p-section">
                          <h3 className="kwb-p-section-title kwb-p-editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateComponentSettings(comp.id, { sectionTitle: e.currentTarget.textContent || "" })}>{comp.settings.sectionTitle || "المواضيع"}</h3>
                          <div className={isGrid ? "kwb-p-topics-grid" : "kwb-p-topics-list"}>
                            {items.map((item: any, i: number) => (
                              <div key={i} className="kwb-p-topic-card">
                                <span className="kwb-p-topic-name">{item.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ); break;
                    }

                    case "bento_grid": {
                      const bentoLayout = comp.settings.layout || "2-1";
                      const bentoItems = comp.settings.items || [];
                      _inner = (
                        <div className={`kwb-p-bento kwb-p-bento-${bentoLayout}`}>
                          {bentoItems.map((item: any, i: number) => (
                            <div key={i} className={`kwb-p-bento-card kwb-p-bento-card-${item.cardSize || "square"}`}>
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title || ""} className="kwb-p-bento-card-img" />
                              ) : (
                                <div className="kwb-p-bento-card-img-placeholder" />
                              )}
                              <div className="kwb-p-bento-card-body">
                                <h4 className="kwb-p-bento-title">{item.title}</h4>
                                {item.text && <p className="kwb-p-bento-text">{item.text}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ); break;
                    }

                    case "social_links": {
                      const platforms = comp.settings.platforms || [];
                      const socialSvgs: Record<string, string> = {
                        twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
                        instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>',
                        youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z"/></svg>',
                        linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>',
                        tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.26 8.26 0 005.58 2.17V11.7a4.83 4.83 0 01-3.77-1.24V6.69z"/></svg>',
                        snapchat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.949-.25.147-.066.346-.097.5-.097.206 0 .395.054.5.162a.5.5 0 01.075.558c-.09.19-.222.33-.345.437-.39.321-.906.486-1.34.577a.8.8 0 00-.18.045c-.12.06-.18.18-.15.3.18.75.42 1.44.75 2.04.54.99 1.32 1.71 2.28 2.13.12.06.24.12.3.21a.44.44 0 01-.12.45c-.15.15-.39.27-.72.36-.45.12-.99.18-1.56.21-.15.015-.21.09-.24.15-.06.105-.09.21-.12.33l-.015.06c-.06.195-.135.42-.33.585-.225.195-.54.24-.78.24-.18 0-.36-.03-.51-.06a3.5 3.5 0 00-.75-.09c-.27 0-.54.03-.81.09-.75.18-1.38.51-2.07.9-.9.51-1.83 1.05-3.18 1.11h-.15c-1.35-.06-2.28-.6-3.18-1.11-.69-.39-1.32-.72-2.07-.9a4.3 4.3 0 00-.81-.09c-.24 0-.48.03-.75.09-.15.03-.33.06-.51.06-.24 0-.555-.045-.78-.24-.195-.165-.27-.39-.33-.585L3.1 18.6c-.03-.12-.06-.225-.12-.33-.03-.06-.09-.135-.24-.15-.57-.03-1.11-.09-1.56-.21-.33-.09-.57-.21-.72-.36a.44.44 0 01-.12-.45c.06-.09.18-.15.3-.21.96-.42 1.74-1.14 2.28-2.13.33-.6.57-1.29.75-2.04.03-.12-.03-.24-.15-.3a.8.8 0 00-.18-.045c-.435-.09-.95-.256-1.34-.577a1.16 1.16 0 01-.345-.437.5.5 0 01.075-.558c.105-.108.294-.162.5-.162.154 0 .353.031.5.097.29.13.649.234.949.25.198 0 .326-.045.401-.09a4.22 4.22 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C6.453 1.069 9.81.793 10.8.793h1.406z"/></svg>',
                        facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
                        website: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
                        threads: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.228 1.33-2.93.824-.627 1.952-.998 3.267-1.073 1.107-.064 2.134.05 3.057.337.011-.583-.004-1.128-.068-1.627-.207-1.636-.869-2.39-2.396-2.463h-.086c-1.093 0-2.032.393-2.637 1.107l-1.455-1.323c.908-.998 2.253-1.57 3.694-1.57h.131c1.254.051 2.27.49 3.016 1.302.673.732 1.09 1.727 1.24 2.96.068.562.092 1.17.072 1.812.539.253 1.022.56 1.443.924 1.2 1.037 1.86 2.474 1.96 4.275.064 1.16-.197 2.478-.85 3.61-.765 1.326-1.94 2.378-3.495 3.13C17.534 23.46 15.07 24 12.186 24zm-1.118-8.086c-.988.057-1.757.282-2.293.672-.422.306-.633.696-.61 1.13.023.412.233.78.61 1.065.471.356 1.14.539 1.886.507 1.09-.052 1.94-.46 2.528-1.213.464-.594.77-1.405.907-2.406-.876-.235-1.88-.356-2.942-.355h-.086z"/></svg>',
                        telegram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.486-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
                        whatsapp: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
                        pinterest: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>',
                        spotify: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
                      };
                      const platformLabels: Record<string, string> = { twitter: "X / تويتر", instagram: "إنستغرام", youtube: "يوتيوب", linkedin: "لينكدإن", tiktok: "تيك توك", snapchat: "سناب شات", facebook: "فيسبوك", website: "الموقع", threads: "ثريدز", telegram: "تيليغرام", whatsapp: "واتساب", pinterest: "بنترست", spotify: "سبوتيفاي" };
                      _inner = (
                        <div className="kwb-p-social-links">
                          {platforms.filter((p: any) => p.enabled && p.url).map((p: any, i: number) => (
                            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="kwb-p-social-icon" title={platformLabels[p.platform] || p.platform} dangerouslySetInnerHTML={{ __html: socialSvgs[p.platform] || '' }} />
                          ))}
                        </div>
                      ); break;
                    }

                    default:
                      _inner = (
                        <div className="kwb-p-placeholder">
                          <span>{COMPONENT_META[comp.type]?.label || comp.type}</span>
                        </div>
                      ); break;
                  }

                  // ─── Wrapper with toolbar, selection, insert buttons ────────
                  return (
                    <React.Fragment key={comp.id}>
                      {/* Insert line before first component */}
                      {_idx === 0 && (
                        <div className={`kwb-p-insert-line ${insertAtIndex === _realIdx ? "kwb-p-insert-open" : ""}`}>
                          <button className="kwb-p-insert-btn" onClick={(e) => { e.stopPropagation(); setInsertAtIndex(insertAtIndex === _realIdx ? null : _realIdx); }} title="إضافة قسم">+</button>
                          {insertAtIndex === _realIdx && (
                            <div className="kwb-p-insert-dropdown">
                              {INSERT_TYPES.map(t => (
                                <button key={t} className="kwb-p-insert-item" onClick={() => insertComponentAt(t, _realIdx)}>
                                  <span className="kwb-p-insert-icon" dangerouslySetInnerHTML={{ __html: COMPONENT_ICONS[t] || '' }} />
                                  <span className="kwb-p-insert-label">{COMPONENT_META[t].label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Component wrapper */}
                      <div
                        className={`kwb-p-comp-wrap ${_isSelected ? "kwb-p-comp-selected" : ""}${draggedCompId === comp.id ? " kwb-p-comp-dragging" : ""}${dragOverCompId === comp.id && dragOverPosition === "above" ? " kwb-p-drop-above" : ""}${dragOverCompId === comp.id && dragOverPosition === "below" ? " kwb-p-drop-below" : ""}`}
                        data-comp-id={comp.id}
                        draggable={false}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest(".kwb-p-comp-toolbar") || (e.target as HTMLElement).closest(".kwb-p-insert-btn")) return;
                          if ((e.target as HTMLElement).closest("[contenteditable]")) return;
                          setExpandedComponent(_isSelected ? null : comp.id);
                          if (!_isSelected) setSidebarTab("components");
                          setInsertAtIndex(null);
                        }}
                        onMouseEnter={() => setHoveredCompId(comp.id)}
                        onMouseLeave={() => setHoveredCompId(null)}
                        onDragOver={(e) => handleDragOver(e, comp.id)}
                        onDrop={(e) => handleDrop(e, comp.id)}
                      >
                        {/* Hover/selection toolbar */}
                        {(_isSelected || _isHovered) && (
                          <div className="kwb-p-comp-toolbar">
                            {/* Drag handle */}
                            <button
                              className="kwb-p-toolbar-drag"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.setData("text/plain", comp.id);
                                setDraggedCompId(comp.id);
                              }}
                              onDragEnd={handleDragEnd}
                              title="اسحب لتغيير الترتيب"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                            </button>
                            {/* Move up/down */}
                            <button className="kwb-p-toolbar-btn" onClick={(e) => { e.stopPropagation(); moveComponent(comp.id, "up"); }} title="نقل لأعلى" disabled={_idx === 0}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                            </button>
                            <button className="kwb-p-toolbar-btn" onClick={(e) => { e.stopPropagation(); moveComponent(comp.id, "down"); }} title="نقل لأسفل" disabled={_idx === _enabledComps.length - 1}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                            </button>
                            <div className="kwb-p-toolbar-sep" />
                            {/* Settings / manage data */}
                            <button className="kwb-p-toolbar-btn" onClick={(e) => { e.stopPropagation(); setExpandedComponent(comp.id); setSidebarTab("components"); }} title="إدارة البيانات">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                            </button>
                            {/* Duplicate */}
                            <button className="kwb-p-toolbar-btn" onClick={(e) => { e.stopPropagation(); duplicateComponent(comp.id); }} title="تكرار">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                            {/* Delete */}
                            <button className="kwb-p-toolbar-btn kwb-p-toolbar-delete" onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }} title="حذف">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                            {/* Component label */}
                            <span className="kwb-p-toolbar-label">{_meta?.label}</span>
                          </div>
                        )}
                        {_inner}
                      </div>

                      {/* Insert line after component */}
                      <div className={`kwb-p-insert-line ${insertAtIndex === _realIdx + 1 ? "kwb-p-insert-open" : ""}`}>
                        <button className="kwb-p-insert-btn" onClick={(e) => { e.stopPropagation(); setInsertAtIndex(insertAtIndex === _realIdx + 1 ? null : _realIdx + 1); }} title="إضافة قسم">+</button>
                        {insertAtIndex === _realIdx + 1 && (
                          <div className="kwb-p-insert-dropdown">
                            {INSERT_TYPES.map(t => (
                              <button key={t} className="kwb-p-insert-item" onClick={() => insertComponentAt(t, _realIdx + 1)}>
                                <span className="kwb-p-insert-icon" dangerouslySetInnerHTML={{ __html: COMPONENT_ICONS[t] || '' }} />
                                <span className="kwb-p-insert-label">{COMPONENT_META[t].label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                {/* Kitabh Badge — standalone element below all components */}
                {activeSite.branding.showKitabhBadge !== false && (
                  <div className="kwb-p-kitabh-badge-wrap">
                    <a href="https://kitabh.com" target="_blank" rel="noopener noreferrer" className={`kwb-p-footer-kitabh-badge kwb-badge-${activeSite.branding.badgeStyle || "black"}`} style={{ transform: `scale(${(activeSite.branding.badgeScale ?? 85) / 100})`, borderRadius: `${Math.round((activeSite.branding.borderRadius || 0) * 0.24)}px` }}>
                      <img src={KITABH_ICONS[activeSite.branding.badgeStyle || "black"]} alt="كتابة" />
                      صُمّم على منصة كتابة
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── SIDEBAR ─── */}
          <div className="kwb-sidebar">
            {/* Back / Preview / Publish buttons */}
            <div className="kwb-sidebar-top-btns-col">
              <button className="kwb-back-builder-btn" onClick={() => setView("sites")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                رجوع للمواقع
              </button>
              <div className="kwb-sidebar-top-btns">
                <button className="kwb-btn-outline kwb-btn-half" onClick={openPreviewTab}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  معاينة
                </button>
                <button
                  className={`kwb-btn-primary kwb-btn-half ${publishStatus === "publishing" ? "kwb-btn-loading" : ""} ${publishStatus === "done" ? "kwb-btn-success" : ""}`}
                  onClick={handlePublish}
                  disabled={publishStatus === "publishing"}
                >
                  {publishStatus === "publishing" ? (
                    <><svg className="kwb-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> جاري النشر</>
                  ) : publishStatus === "done" ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> نُشر</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> نشر</>
                  )}
                </button>
              </div>
              {activeSite?.publishedAt && publishStatus === "idle" && (
                <div className="kwb-last-published">آخر نشر: {new Date(activeSite.publishedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              )}
            </div>

            {/* Tabs */}
            <div className="kwb-sidebar-tabs">
              <button className={`kwb-stab ${sidebarTab === "pages" ? "kwb-stab-active" : ""}`} onClick={() => setSidebarTab("pages")}>الصفحات</button>
              <button className={`kwb-stab ${sidebarTab === "components" ? "kwb-stab-active" : ""}`} onClick={() => setSidebarTab("components")}>الأقسام</button>
              <button className={`kwb-stab ${sidebarTab === "branding" ? "kwb-stab-active" : ""}`} onClick={() => setSidebarTab("branding")}>التصميم</button>
            </div>

            <div className="kwb-sidebar-body">
              {/* ─── BRANDING TAB ─── */}
              {sidebarTab === "branding" && (
                <div className="kwb-sb-branding">
                  <label className="kwb-label">الشعار</label>
                  {activeSite.branding.logoUrl ? (
                    <div className="kwb-upload-preview"><img src={activeSite.branding.logoUrl} alt="" /><button className="kwb-upload-remove" onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, logoUrl: "" } })}>{Icons.x}</button></div>
                  ) : (
                    <div className="kwb-upload-area">{Icons.image}<span>لا توجد صورة</span></div>
                  )}
                  <button className="kwb-btn-outline kwb-btn-full" onClick={() => triggerUpload({ type: "branding_logo" })}>رفع صورة</button>

                  <label className="kwb-label" style={{ marginTop: 16 }}>أيقونة الموقع (Favicon)</label>
                  {activeSite.branding.favicon ? (
                    <div className="kwb-upload-preview" style={{ maxWidth: 48 }}>
                      <img src={activeSite.branding.favicon} alt="favicon" style={{ width: 32, height: 32, objectFit: "contain" }} />
                      <button className="kwb-upload-remove" onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, favicon: "" } })}>{Icons.x}</button>
                    </div>
                  ) : (
                    <div className="kwb-upload-area" style={{ padding: "8px 12px", minHeight: "auto" }}>{Icons.image}<span style={{ fontSize: 12 }}>لا توجد أيقونة</span></div>
                  )}
                  <button className="kwb-btn-outline kwb-btn-full" onClick={() => triggerUpload({ type: "branding_favicon" })}>رفع أيقونة</button>

                  <label className="kwb-label" style={{ marginTop: 16 }}>تخطيط الشعار</label>
                  <div className="kwb-logo-layout-options">
                    <button className={`kwb-logo-layout-btn ${(activeSite.branding.logoLayout || "text_only") === "text_only" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, logoLayout: "text_only" } })}>
                      <span className="kwb-logo-layout-icon">أ</span>
                      <span>نص فقط</span>
                    </button>
                    <button className={`kwb-logo-layout-btn ${activeSite.branding.logoLayout === "logo_only" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, logoLayout: "logo_only" } })}>
                      <span className="kwb-logo-layout-icon">{Icons.image}</span>
                      <span>شعار فقط</span>
                    </button>
                    <button className={`kwb-logo-layout-btn ${activeSite.branding.logoLayout === "logo_and_text" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, logoLayout: "logo_and_text" } })}>
                      <span className="kwb-logo-layout-icon">{Icons.image} أ</span>
                      <span>شعار ونص</span>
                    </button>
                  </div>

                  <label className="kwb-label" style={{ marginTop: 16 }}>اسم الموقع</label>
                  <input className="kwb-input" value={activeSite.branding.siteName} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, siteName: e.target.value } })} />

                  <label className="kwb-label" style={{ marginTop: 16 }}>الخط</label>
                  <div className="kwb-font-picker">
                    {[
                      "Alyamama", "IBM Plex Sans Arabic", "Noto Sans Arabic", "Cairo", "Tajawal",
                      "Almarai", "Changa", "El Messiri", "Readex Pro", "Rubik",
                      "Amiri", "Playpen Sans Arabic",
                    ].map(font => (
                      <button
                        key={font}
                        className={`kwb-font-option ${activeSite.branding.fontFamily === font ? "kwb-font-option-active" : ""}`}
                        onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, fontFamily: font } })}
                      >
                        <span className="kwb-font-preview" style={{ fontFamily: `'${font}', sans-serif` }}>موقع منصة كتابة</span>
                        <span className="kwb-font-name">{font}</span>
                      </button>
                    ))}
                  </div>

                  <label className="kwb-label" style={{ marginTop: 16 }}>سمة الألوان</label>
                  <div className="kwb-theme-grid">
                    {COLOR_THEMES.map(theme => {
                      const isActive = activeSite.branding.buttonColor === theme.buttonColor && activeSite.branding.bgColor === theme.bgColor && activeSite.branding.headlineColor === theme.headlineColor;
                      return (
                        <button key={theme.id} className={`kwb-theme-card ${isActive ? "kwb-theme-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, buttonColor: theme.buttonColor, accentColor: theme.buttonColor, headlineColor: theme.headlineColor, textColor: theme.textColor, linkColor: theme.linkColor, bgColor: theme.bgColor, cardBg: theme.cardBg } })}>
                          <div className="kwb-theme-preview" style={{ background: theme.bgColor }}>
                            <div className="kwb-theme-p-header" style={{ borderColor: theme.cardBg !== theme.bgColor ? theme.cardBg : "rgba(128,128,128,0.15)" }}>
                              <div className="kwb-theme-p-bar" style={{ background: theme.headlineColor, width: 18, height: 4 }} />
                              <div className="kwb-theme-p-btn" style={{ background: theme.buttonColor, width: 14, height: 5 }} />
                            </div>
                            <div className="kwb-theme-p-body">
                              <div className="kwb-theme-p-bar" style={{ background: theme.headlineColor, width: 28, height: 4, opacity: 0.8 }} />
                              <div className="kwb-theme-p-bar" style={{ background: theme.textColor, width: 36, height: 3 }} />
                              <div className="kwb-theme-p-btn" style={{ background: theme.buttonColor, width: 22, height: 5 }} />
                            </div>
                            <div className="kwb-theme-p-cards">
                              <div className="kwb-theme-p-card" style={{ background: theme.cardBg, borderColor: "rgba(128,128,128,0.15)" }}>
                                <div style={{ width: "100%", height: 8, background: "rgba(128,128,128,0.12)", borderRadius: 1 }} />
                                <div className="kwb-theme-p-bar" style={{ background: theme.headlineColor, width: "60%", height: 2.5, opacity: 0.7 }} />
                              </div>
                              <div className="kwb-theme-p-card" style={{ background: theme.cardBg, borderColor: "rgba(128,128,128,0.15)" }}>
                                <div style={{ width: "100%", height: 8, background: "rgba(128,128,128,0.12)", borderRadius: 1 }} />
                                <div className="kwb-theme-p-bar" style={{ background: theme.headlineColor, width: "50%", height: 2.5, opacity: 0.7 }} />
                              </div>
                            </div>
                          </div>
                          <span className="kwb-theme-name">{theme.name}</span>
                          <div className="kwb-theme-dots">
                            <span className="kwb-theme-dot-sm" style={{ background: theme.buttonColor }} />
                            <span className="kwb-theme-dot-sm" style={{ background: theme.headlineColor }} />
                            <span className="kwb-theme-dot-sm" style={{ background: theme.textColor }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <details className="kwb-color-details">
                    <summary className="kwb-color-summary">تخصيص الألوان يدويا</summary>
                    <div className="kwb-color-manual">
                      <div className="kwb-color-row">
                        <span className="kwb-color-row-label">الأزرار</span>
                        <div className="kwb-color-row-controls">
                          <input type="color" className="kwb-color-input" value={activeSite.branding.buttonColor || "#E82222"} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, buttonColor: e.target.value, accentColor: e.target.value } })} />
                          <span className="kwb-color-hex">{activeSite.branding.buttonColor || "#E82222"}</span>
                        </div>
                      </div>
                      <div className="kwb-color-row">
                        <span className="kwb-color-row-label">العناوين</span>
                        <div className="kwb-color-row-controls">
                          <input type="color" className="kwb-color-input" value={activeSite.branding.headlineColor || "#1a1a1a"} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, headlineColor: e.target.value } })} />
                          <span className="kwb-color-hex">{activeSite.branding.headlineColor || "#1a1a1a"}</span>
                        </div>
                      </div>
                      <div className="kwb-color-row">
                        <span className="kwb-color-row-label">النصوص</span>
                        <div className="kwb-color-row-controls">
                          <input type="color" className="kwb-color-input" value={activeSite.branding.textColor || "#666666"} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, textColor: e.target.value } })} />
                          <span className="kwb-color-hex">{activeSite.branding.textColor || "#666666"}</span>
                        </div>
                      </div>
                      <div className="kwb-color-row">
                        <span className="kwb-color-row-label">الروابط</span>
                        <div className="kwb-color-row-controls">
                          <input type="color" className="kwb-color-input" value={activeSite.branding.linkColor || "#E82222"} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, linkColor: e.target.value } })} />
                          <span className="kwb-color-hex">{activeSite.branding.linkColor || "#E82222"}</span>
                        </div>
                      </div>
                      <div className="kwb-color-row">
                        <span className="kwb-color-row-label">الخلفية</span>
                        <div className="kwb-color-row-controls">
                          <input type="color" className="kwb-color-input" value={activeSite.branding.bgColor || "#ffffff"} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, bgColor: e.target.value } })} />
                          <span className="kwb-color-hex">{activeSite.branding.bgColor || "#ffffff"}</span>
                        </div>
                      </div>
                      <div className="kwb-color-row">
                        <span className="kwb-color-row-label">البطاقات</span>
                        <div className="kwb-color-row-controls">
                          <input type="color" className="kwb-color-input" value={activeSite.branding.cardBg || "#ffffff"} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, cardBg: e.target.value } })} />
                          <span className="kwb-color-hex">{activeSite.branding.cardBg || "#ffffff"}</span>
                        </div>
                      </div>
                    </div>
                  </details>

                  <label className="kwb-label" style={{ marginTop: 16 }}>عرض الموقع</label>
                  <div className="kwb-logo-layout-options">
                    <button className={`kwb-logo-layout-btn ${(activeSite.branding.layoutWidth || "compact") === "compact" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, layoutWidth: "compact" } })}>
                      <span className="kwb-logo-layout-icon" style={{ fontSize: 14 }}>▭</span>
                      <span>مضغوط</span>
                    </button>
                    <button className={`kwb-logo-layout-btn ${activeSite.branding.layoutWidth === "full" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, layoutWidth: "full" } })}>
                      <span className="kwb-logo-layout-icon" style={{ fontSize: 14 }}>▬</span>
                      <span>عرض كامل</span>
                    </button>
                  </div>

                  <label className="kwb-label" style={{ marginTop: 16 }}>الوضع الداكن</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label className="kwb-toggle">
                      <input type="checkbox" checked={activeSite.branding.darkMode || false} onChange={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, darkMode: !activeSite.branding.darkMode } })} />
                      <span className="kwb-toggle-slider" />
                    </label>
                    <span style={{ fontSize: 13, color: "#888" }}>{activeSite.branding.darkMode ? "مفعّل" : "تلقائي حسب الجهاز"}</span>
                  </div>

                  <label className="kwb-label" style={{ marginTop: 16 }}>استدارة الزوايا</label>
                  <div className="kwb-radius-control">
                    <div className="kwb-radius-preview-row">
                      <div className="kwb-radius-preview-box" style={{ borderRadius: `${Math.round((activeSite.branding.borderRadius || 0) * 0.24)}px`, background: activeSite.branding.buttonColor || "#E82222" }} />
                      <span className="kwb-radius-value">{activeSite.branding.borderRadius || 0}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#999" }}>حاد</span>
                      <input type="range" min="0" max="100" value={activeSite.branding.borderRadius || 0} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, borderRadius: parseInt(e.target.value) } })} style={{ flex: 1, accentColor: activeSite.branding.buttonColor || "#E82222" }} />
                      <span style={{ fontSize: 11, color: "#999" }}>مستدير</span>
                    </div>
                  </div>

                  {/* ─── Kitabh Badge ─── */}
                  <label className="kwb-label" style={{ marginTop: 20 }}>شارة كتابة</label>
                  <div className="kwb-newsletter-toggle" style={{ marginTop: 4 }}>
                    <label className="kwb-toggle">
                      <input type="checkbox" checked={activeSite.branding.showKitabhBadge !== false} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, showKitabhBadge: e.target.checked } })} />
                      <span className="kwb-toggle-track"><span className="kwb-toggle-thumb" /></span>
                    </label>
                    <span>إظهار شارة "صُمّم على منصة كتابة"</span>
                  </div>
                  {activeSite.branding.showKitabhBadge !== false && (
                    <>
                      <label className="kwb-label" style={{ marginTop: 10 }}>نمط الشارة</label>
                      <div className="kwb-badge-style-picker">
                        <button className={`kwb-badge-style-opt ${(activeSite.branding.badgeStyle || "black") === "black" ? "kwb-badge-style-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, badgeStyle: "black" } })} title="أسود">
                          <span className="kwb-badge-preview kwb-badge-preview-black">
                            <img src={KITABH_ICON_WHITE} alt="" style={{ width: 12, height: "auto" }} />
                            <span>صُمّم على منصة كتابة</span>
                          </span>
                        </button>
                        <button className={`kwb-badge-style-opt ${activeSite.branding.badgeStyle === "blue" ? "kwb-badge-style-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, badgeStyle: "blue" } })} title="أزرق">
                          <span className="kwb-badge-preview kwb-badge-preview-blue">
                            <img src={KITABH_ICON_WHITE} alt="" style={{ width: 12, height: "auto" }} />
                            <span>صُمّم على منصة كتابة</span>
                          </span>
                        </button>
                        <button className={`kwb-badge-style-opt ${activeSite.branding.badgeStyle === "white" ? "kwb-badge-style-active" : ""}`} onClick={() => updateSite(activeSite.id, { branding: { ...activeSite.branding, badgeStyle: "white" } })} title="أبيض">
                          <span className="kwb-badge-preview kwb-badge-preview-white">
                            <img src={KITABH_ICON_BLACK} alt="" style={{ width: 12, height: "auto" }} />
                            <span>صُمّم على منصة كتابة</span>
                          </span>
                        </button>
                      </div>
                      <label className="kwb-label" style={{ marginTop: 10 }}>حجم الشارة</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#999" }}>صغير</span>
                        <input type="range" min="70" max="100" value={activeSite.branding.badgeScale ?? 85} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, badgeScale: parseInt(e.target.value) } })} style={{ flex: 1, accentColor: activeSite.branding.buttonColor || "#E82222" }} />
                        <span style={{ fontSize: 11, color: "#999" }}>كبير</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ─── COMPONENTS TAB ─── */}
              {sidebarTab === "components" && (
                <div className="kwb-sb-components">
                  {/* Breadcrumb: show which page we're editing */}
                  <div className="kwb-breadcrumb">
                    <button className="kwb-breadcrumb-link" onClick={() => setSidebarTab("pages")}>الصفحات</button>
                    <span className="kwb-breadcrumb-sep">/</span>
                    <span className="kwb-breadcrumb-current">{activePage.name}</span>
                  </div>

                  {activePage.components.map(comp => {
                    const meta = COMPONENT_META[comp.type];
                    if (!meta) return null;
                    const isExpanded = expandedComponent === comp.id;

                    return (
                      <div key={comp.id} className={`kwb-comp-row ${!comp.enabled ? "kwb-comp-row-disabled" : ""} ${isExpanded ? "kwb-comp-row-active" : ""}`}>
                        <div className="kwb-comp-header">
                          <span className="kwb-grip">
                            <button className="kwb-grip-btn" onClick={() => moveComponent(comp.id, "up")} title="تحريك لأعلى">{Icons.gripVertical}</button>
                          </span>
                          <button className="kwb-vis-btn" onClick={() => toggleComponent(comp.id)} title={comp.enabled ? "إخفاء" : "إظهار"}>
                            {comp.enabled ? Icons.eye : Icons.eyeOff}
                          </button>
                          <span className="kwb-comp-icon" dangerouslySetInnerHTML={{ __html: COMPONENT_ICONS[comp.type] || '' }} />
                          <span className="kwb-comp-name" onClick={() => { if (!meta.hasSettings) return; const next = isExpanded ? null : comp.id; setExpandedComponent(next); if (next) setTimeout(() => { const el = document.querySelector(`[data-comp-id="${comp.id}"]`); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100); }} style={meta.hasSettings ? { cursor: "pointer" } : {}}>{meta.label}</span>
                          <div className="kwb-comp-actions">
                            {meta.hasSettings && (
                              <button className="kwb-icon-btn-sm" onClick={() => { const next = isExpanded ? null : comp.id; setExpandedComponent(next); if (next) setTimeout(() => { const el = document.querySelector(`[data-comp-id="${comp.id}"]`); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100); }} title="إعدادات">
                                {Icons.edit}
                              </button>
                            )}
                            <button className="kwb-icon-btn-sm kwb-icon-btn-danger" onClick={() => removeComponent(comp.id)} title="حذف">
                              {Icons.x}
                            </button>
                          </div>
                        </div>

                        {/* Expanded settings */}
                        {isExpanded && meta.hasSettings && (
                          <div className="kwb-comp-settings">
                            {comp.type === "header" && (() => {
                              const navLinks: NavLink[] = (comp.settings.navLinks || []).map((link: any) =>
                                typeof link === "string" ? { id: genId(), label: link, linkType: "page" as const, target: "", visible: true } : link
                              );
                              const updateNavLinks = (updated: NavLink[]) => updateComponentSettings(comp.id, { navLinks: updated });
                              const updateNavLink = (linkId: string, patch: Partial<NavLink>) => {
                                updateNavLinks(navLinks.map(l => l.id === linkId ? { ...l, ...patch } : l));
                              };
                              return (
                              <>
                                <label className="kwb-label">الشعار</label>
                                {comp.settings.logoUrl ? (
                                  <div className="kwb-upload-preview"><img src={comp.settings.logoUrl} alt="" /><button className="kwb-upload-remove" onClick={() => updateComponentSettings(comp.id, { logoUrl: "" })}>{Icons.x}</button></div>
                                ) : (
                                  <div className="kwb-upload-area-sm">{Icons.image}<span>لا توجد صورة</span></div>
                                )}
                                <button className="kwb-btn-outline kwb-btn-full" onClick={() => triggerUpload({ type: "comp_logo", compId: comp.id })}>رفع صورة</button>
                                <label className="kwb-label" style={{ marginTop: 12 }}>نص الزر</label>
                                <input className="kwb-input" value={comp.settings.buttonText || ""} onChange={e => updateComponentSettings(comp.id, { buttonText: e.target.value })} />
                                <label className="kwb-label" style={{ marginTop: 12 }}>لون الزر</label>
                                <div className="kwb-color-row-controls">
                                  {PRESET_COLORS.map(c => (
                                    <button key={c} className={`kwb-color-dot ${comp.settings.buttonColor === c ? "kwb-color-dot-active" : ""}`} style={{ background: c }} onClick={() => updateComponentSettings(comp.id, { buttonColor: c })} />
                                  ))}
                                  <input type="color" className="kwb-color-input" value={comp.settings.buttonColor || activeSite.branding.buttonColor || "#E82222"} onChange={e => updateComponentSettings(comp.id, { buttonColor: e.target.value })} />
                                </div>

                                <label className="kwb-label" style={{ marginTop: 16 }}>روابط القائمة</label>
                                <div className="kwb-nav-links-list">
                                  {navLinks.map((link, li) => (
                                    <div key={link.id} className="kwb-nav-link-item">
                                      <div className="kwb-nav-link-top">
                                        <label className="kwb-toggle" style={{ flexShrink: 0 }}>
                                          <input type="checkbox" checked={link.visible} onChange={() => updateNavLink(link.id, { visible: !link.visible })} />
                                          <span className="kwb-toggle-slider" />
                                        </label>
                                        <input className="kwb-input kwb-input-sm" value={link.label} placeholder="اسم الرابط" onChange={e => updateNavLink(link.id, { label: e.target.value })} style={{ flex: 1 }} />
                                        <button className="kwb-icon-btn-sm" title="حذف" onClick={() => updateNavLinks(navLinks.filter(l => l.id !== link.id))}>{Icons.x}</button>
                                        {li > 0 && <button className="kwb-icon-btn-sm" title="تحريك لأعلى" onClick={() => { const arr = [...navLinks]; [arr[li - 1], arr[li]] = [arr[li], arr[li - 1]]; updateNavLinks(arr); }}>↑</button>}
                                        {li < navLinks.length - 1 && <button className="kwb-icon-btn-sm" title="تحريك لأسفل" onClick={() => { const arr = [...navLinks]; [arr[li], arr[li + 1]] = [arr[li + 1], arr[li]]; updateNavLinks(arr); }}>↓</button>}
                                      </div>
                                      <div className="kwb-nav-link-config">
                                        <select className="kwb-input kwb-input-sm" value={link.linkType} onChange={e => updateNavLink(link.id, { linkType: e.target.value as NavLink["linkType"], target: "" })}>
                                          <option value="page">صفحة</option>
                                          <option value="anchor">قسم في الصفحة</option>
                                          <option value="external">رابط خارجي</option>
                                        </select>
                                        {link.linkType === "page" && (
                                          <select className="kwb-input kwb-input-sm" value={link.target} onChange={e => updateNavLink(link.id, { target: e.target.value })}>
                                            <option value="">— اختر صفحة —</option>
                                            {activeSite.pages.filter(p => p.name !== "عرض المقال").map(p => (
                                              <option key={p.id} value={p.slug}>{p.name}</option>
                                            ))}
                                          </select>
                                        )}
                                        {link.linkType === "anchor" && (
                                          <select className="kwb-input kwb-input-sm" value={link.target} onChange={e => updateNavLink(link.id, { target: e.target.value })}>
                                            <option value="">— اختر قسم —</option>
                                            {activePage.components.filter(c => c.type !== "header").map(c => (
                                              <option key={c.id} value={c.id}>{COMPONENT_META[c.type]?.label || c.type}</option>
                                            ))}
                                          </select>
                                        )}
                                        {link.linkType === "external" && (
                                          <input className="kwb-input kwb-input-sm" value={link.target} placeholder="https://example.com" dir="ltr" onChange={e => updateNavLink(link.id, { target: e.target.value })} />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 8 }} onClick={() => updateNavLinks([...navLinks, { id: genId(), label: "رابط جديد", linkType: "page", target: "", visible: true }])}>
                                  + إضافة رابط
                                </button>

                                <label className="kwb-label" style={{ marginTop: 16 }}>نافذة الاشتراك</label>
                                <input className="kwb-input" placeholder="عنوان النافذة" value={activeSite.branding.popupTitle || ""} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, popupTitle: e.target.value } })} style={{ marginBottom: 6 }} />
                                <input className="kwb-input" placeholder="وصف النافذة" value={activeSite.branding.popupDesc || ""} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, popupDesc: e.target.value } })} style={{ marginBottom: 6 }} />
                                <input className="kwb-input" placeholder="نص الزر (مثال: اشتراك)" value={activeSite.branding.popupButtonText || ""} onChange={e => updateSite(activeSite.id, { branding: { ...activeSite.branding, popupButtonText: e.target.value } })} />
                              </>
                              );
                            })()}

                            {(comp.type === "hero_news" || comp.type === "hero_slider") && (
                              <>
                                <button className="kwb-btn-outline kwb-btn-full" onClick={() => openArticlePicker(comp.id)}>
                                  اختيار المقالات
                                </button>
                                <p className="kwb-hint">{(comp.settings.articles || []).length} مقالات مختارة</p>
                              </>
                            )}
                            {comp.type === "article_collection" && (
                              <>
                                <label className="kwb-label">التخطيط</label>
                                <div style={{ display: "flex", gap: 4 }}>
                                  {[
                                    { id: "grid", label: "شبكة" },
                                    { id: "gallery", label: "معرض" },
                                    { id: "category_feed", label: "تصنيف" },
                                  ].map(l => (
                                    <button key={l.id} className={`kwb-logo-layout-btn ${(comp.settings.layout || "grid") === l.id ? "kwb-logo-layout-active" : ""}`} style={{ flex: 1, padding: "6px 4px", fontSize: 11 }} onClick={() => updateComponentSettings(comp.id, { layout: l.id })}>{l.label}</button>
                                  ))}
                                </div>

                                {/* Grid layout settings */}
                                {(!comp.settings.layout || comp.settings.layout === "grid") && (
                                  <>
                                    <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 10 }} onClick={() => openArticlePicker(comp.id)}>
                                      اختيار المقالات
                                    </button>
                                    <p className="kwb-hint">{(comp.settings.articles || []).length} مقالات مختارة</p>
                                    <div className="kwb-newsletter-toggle" style={{ marginTop: 12 }}>
                                      <label className="kwb-toggle">
                                        <input type="checkbox" checked={comp.settings.showSearch || false} onChange={e => updateComponentSettings(comp.id, { showSearch: e.target.checked })} />
                                        <span className="kwb-toggle-track"><span className="kwb-toggle-thumb" /></span>
                                      </label>
                                      <span>حقل البحث</span>
                                    </div>
                                    <div className="kwb-newsletter-toggle" style={{ marginTop: 8 }}>
                                      <label className="kwb-toggle">
                                        <input type="checkbox" checked={comp.settings.showCategories || false} onChange={e => updateComponentSettings(comp.id, { showCategories: e.target.checked })} />
                                        <span className="kwb-toggle-track"><span className="kwb-toggle-thumb" /></span>
                                      </label>
                                      <span>فلاتر التصنيفات</span>
                                    </div>
                                    <p className="kwb-hint">التصنيفات متصلة بقاعدة بيانات كتابة (categories)</p>
                                    <label className="kwb-label" style={{ marginTop: 12 }}>تخطيط الجوال</label>
                                    <div style={{ display: "flex", gap: 4 }}>
                                      {[
                                        { id: "grid", label: "شبكة" },
                                        { id: "list", label: "قائمة" },
                                      ].map(l => (
                                        <button key={l.id} className={`kwb-logo-layout-btn ${(comp.settings.mobileLayout || "grid") === l.id ? "kwb-logo-layout-active" : ""}`} style={{ flex: 1, padding: "6px 4px", fontSize: 11 }} onClick={() => updateComponentSettings(comp.id, { mobileLayout: l.id })}>{l.label}</button>
                                      ))}
                                    </div>
                                    <p className="kwb-hint">القائمة: عنوان + صورة مصغّرة بجانب بعض (مثل NYT)</p>
                                  </>
                                )}

                                {/* Gallery layout settings */}
                                {comp.settings.layout === "gallery" && (
                                  <>
                                    <label className="kwb-label" style={{ marginTop: 10 }}>عنوان القسم</label>
                                    <input className="kwb-input" value={comp.settings.sectionTitle || ""} onChange={e => updateComponentSettings(comp.id, { sectionTitle: e.target.value })} />
                                    <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 10 }} onClick={() => openArticlePicker(comp.id)}>
                                      اختيار المقالات
                                    </button>
                                    <p className="kwb-hint">{(comp.settings.articles || []).length} مقالات مختارة</p>
                                    <div className="kwb-newsletter-toggle" style={{ marginTop: 12 }}>
                                      <label className="kwb-toggle">
                                        <input type="checkbox" checked={comp.settings.showSidebar !== false} onChange={e => updateComponentSettings(comp.id, { showSidebar: e.target.checked })} />
                                        <span className="kwb-toggle-track"><span className="kwb-toggle-thumb" /></span>
                                      </label>
                                      <span>شريط جانبي</span>
                                    </div>
                                    {comp.settings.showSidebar !== false && (
                                      <>
                                        <label className="kwb-label" style={{ marginTop: 8 }}>عنوان الشريط الجانبي</label>
                                        <input className="kwb-input" value={comp.settings.sidebarTitle || ""} onChange={e => updateComponentSettings(comp.id, { sidebarTitle: e.target.value })} />
                                        <label className="kwb-label" style={{ marginTop: 6 }}>نص الزر</label>
                                        <input className="kwb-input" value={comp.settings.sidebarButtonText || ""} onChange={e => updateComponentSettings(comp.id, { sidebarButtonText: e.target.value })} />
                                        {comp.settings.sidebarImageUrl ? (
                                          <div className="kwb-upload-preview" style={{ marginTop: 6 }}><img src={comp.settings.sidebarImageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => updateComponentSettings(comp.id, { sidebarImageUrl: "" })}>{Icons.x}</button></div>
                                        ) : (
                                          <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 6, fontSize: 11 }} onClick={() => triggerUpload({ type: "gallery_sidebar", compId: comp.id })}>{Icons.image} صورة الشريط الجانبي</button>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}

                                {/* Category feed layout settings */}
                                {comp.settings.layout === "category_feed" && (
                                  <>
                                    <label className="kwb-label" style={{ marginTop: 10 }}>التصنيف</label>
                                    <select className="kwb-select" value={comp.settings.categoryId || ""} onChange={e => updateComponentSettings(comp.id, { categoryId: e.target.value })}>
                                      <option value="">اختر تصنيف</option>
                                      {MOCK_CATEGORIES.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                    <label className="kwb-label" style={{ marginTop: 10 }}>تخطيط التصنيف</label>
                                    <div style={{ display: "flex", gap: 4 }}>
                                      {[
                                        { id: "featured_right", label: "بارز يمين" },
                                        { id: "featured_left", label: "بارز يسار" },
                                      ].map(l => (
                                        <button key={l.id} className={`kwb-logo-layout-btn ${(comp.settings.categoryLayout || "featured_right") === l.id ? "kwb-logo-layout-active" : ""}`} style={{ flex: 1, padding: "6px 4px", fontSize: 11 }} onClick={() => updateComponentSettings(comp.id, { categoryLayout: l.id })}>{l.label}</button>
                                      ))}
                                    </div>
                                    <label className="kwb-label" style={{ marginTop: 10 }}>عدد المقالات</label>
                                    <input className="kwb-input" type="number" min={2} max={10} value={comp.settings.maxArticles || 5} onChange={e => updateComponentSettings(comp.id, { maxArticles: parseInt(e.target.value) || 5 })} />
                                    <div className="kwb-newsletter-toggle" style={{ marginTop: 10 }}>
                                      <label className="kwb-toggle">
                                        <input type="checkbox" checked={comp.settings.showMoreLink !== false} onChange={e => updateComponentSettings(comp.id, { showMoreLink: e.target.checked })} />
                                        <span className="kwb-toggle-track"><span className="kwb-toggle-thumb" /></span>
                                      </label>
                                      <span>رابط "المزيد"</span>
                                    </div>
                                    <div className="kwb-newsletter-toggle" style={{ marginTop: 8 }}>
                                      <label className="kwb-toggle">
                                        <input type="checkbox" checked={!!comp.settings.showSidebar} onChange={e => updateComponentSettings(comp.id, { showSidebar: e.target.checked })} />
                                        <span className="kwb-toggle-track"><span className="kwb-toggle-thumb" /></span>
                                      </label>
                                      <span>تصنيف جانبي</span>
                                    </div>
                                    {comp.settings.showSidebar && (
                                      <>
                                        <select className="kwb-select" style={{ marginTop: 6 }} value={comp.settings.sidebarCategoryId || ""} onChange={e => updateComponentSettings(comp.id, { sidebarCategoryId: e.target.value })}>
                                          <option value="">اختر تصنيف جانبي</option>
                                          {MOCK_CATEGORIES.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                        <input className="kwb-input" style={{ marginTop: 6 }} placeholder="عنوان مخصص (اختياري)" value={comp.settings.sidebarTitle || ""} onChange={e => updateComponentSettings(comp.id, { sidebarTitle: e.target.value })} />
                                      </>
                                    )}
                                  </>
                                )}
                              </>
                            )}

                            {comp.type === "banner" && (
                              <>
                                {(comp.settings.cards || []).map((card: any, ci: number) => (
                                  <div key={ci} style={{ borderTop: ci > 0 ? "1px solid #f0f0f0" : "none", paddingTop: ci > 0 ? 10 : 0, marginTop: ci > 0 ? 10 : 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>بطاقة {ci + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const cards = [...(comp.settings.cards || [])]; cards.splice(ci, 1); updateComponentSettings(comp.id, { cards }); }}>{Icons.x}</button>
                                    </div>
                                    <input className="kwb-input" placeholder="العنوان" value={card.title || ""} onChange={e => { const cards = [...(comp.settings.cards || [])]; cards[ci] = { ...cards[ci], title: e.target.value }; updateComponentSettings(comp.id, { cards }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="نص الرابط" value={card.linkText || ""} onChange={e => { const cards = [...(comp.settings.cards || [])]; cards[ci] = { ...cards[ci], linkText: e.target.value }; updateComponentSettings(comp.id, { cards }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="الرابط (URL)" value={card.linkUrl || ""} dir="ltr" onChange={e => { const cards = [...(comp.settings.cards || [])]; cards[ci] = { ...cards[ci], linkUrl: e.target.value }; updateComponentSettings(comp.id, { cards }); }} style={{ marginTop: 6 }} />
                                    <label className="kwb-label" style={{ marginTop: 8 }}>لون الخلفية</label>
                                    <div className="kwb-color-row-controls">
                                      {PRESET_COLORS.map(c => (
                                        <button key={c} className={`kwb-color-dot ${card.color === c ? "kwb-color-dot-active" : ""}`} style={{ background: c }} onClick={() => { const cards = [...(comp.settings.cards || [])]; cards[ci] = { ...cards[ci], color: c }; updateComponentSettings(comp.id, { cards }); }} />
                                      ))}
                                      <input type="color" className="kwb-color-input" value={card.color || "#E82222"} onChange={e => { const cards = [...(comp.settings.cards || [])]; cards[ci] = { ...cards[ci], color: e.target.value }; updateComponentSettings(comp.id, { cards }); }} />
                                    </div>
                                    <label className="kwb-label" style={{ marginTop: 8 }}>صورة خلفية (اختياري)</label>
                                    {card.imageUrl ? (
                                      <div className="kwb-upload-preview" style={{ marginTop: 4 }}><img src={card.imageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => { const cards = [...(comp.settings.cards || [])]; cards[ci] = { ...cards[ci], imageUrl: "" }; updateComponentSettings(comp.id, { cards }); }}>{Icons.x}</button></div>
                                    ) : (
                                      <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 4, fontSize: 11 }} onClick={() => triggerUpload({ type: "banner_card_img", compId: comp.id, itemIndex: ci })}>{Icons.image} رفع صورة</button>
                                    )}
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 10 }} onClick={() => { const cards = [...(comp.settings.cards || []), { title: "", linkText: "اقرأ المزيد", linkUrl: "", color: "#E82222", imageUrl: "" }]; updateComponentSettings(comp.id, { cards }); }}>{Icons.plus} إضافة بطاقة</button>
                              </>
                            )}

                            {comp.type === "brands_ticker" && (
                              <>
                                <label className="kwb-label">العنوان</label>
                                <input className="kwb-input" value={comp.settings.headline || ""} onChange={e => updateComponentSettings(comp.id, { headline: e.target.value })} placeholder="مثال: عملاؤنا" />
                                <label className="kwb-label" style={{ marginTop: 12 }}>سرعة الشريط</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 11, color: "#999" }}>سريع</span>
                                  <input type="range" min="10" max="60" value={comp.settings.speed || 30} onChange={e => updateComponentSettings(comp.id, { speed: parseInt(e.target.value) })} style={{ flex: 1, accentColor: activeSite.branding.buttonColor || "#E82222" }} />
                                  <span style={{ fontSize: 11, color: "#999" }}>بطيء</span>
                                </div>
                                <label className="kwb-label" style={{ marginTop: 12 }}>تكرار العناصر</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <button className="kwb-icon-btn-sm" onClick={() => { const cur = comp.settings.repeat ?? ((comp.settings.items || []).length <= 1 ? 2 : 1); if (cur > 1) updateComponentSettings(comp.id, { repeat: cur - 1 }); }}>−</button>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: "#371D12", minWidth: 24, textAlign: "center" }}>{comp.settings.repeat ?? ((comp.settings.items || []).length <= 1 ? 2 : 1)}×</span>
                                  <button className="kwb-icon-btn-sm" onClick={() => { const cur = comp.settings.repeat ?? ((comp.settings.items || []).length <= 1 ? 2 : 1); if (cur < 10) updateComponentSettings(comp.id, { repeat: cur + 1 }); }}>+</button>
                                  <span style={{ fontSize: 11, color: "#999", marginRight: 4 }}>مرّة</span>
                                </div>
                                <label className="kwb-label" style={{ marginTop: 12 }}>العلامات التجارية</label>
                                {(comp.settings.items || []).map((item: any, i: number) => (
                                  <div key={i} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8, marginTop: 8 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>علامة {i + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const items = [...(comp.settings.items || [])]; items.splice(i, 1); updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button>
                                    </div>
                                    <input className="kwb-input" placeholder="اسم العلامة" value={item.name || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], name: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 4 }} />
                                    {item.imageUrl ? (
                                      <div className="kwb-upload-preview" style={{ marginTop: 4 }}><img src={item.imageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], imageUrl: "" }; updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button></div>
                                    ) : (
                                      <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 4, fontSize: 11 }} onClick={() => triggerUpload({ type: "ticker_img", compId: comp.id, itemIndex: i })}>{Icons.image} رفع شعار</button>
                                    )}
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 8 }} onClick={() => { const items = [...(comp.settings.items || []), { name: "", imageUrl: "" }]; updateComponentSettings(comp.id, { items }); }}>{Icons.plus} إضافة علامة</button>
                              </>
                            )}

                            {comp.type === "subscribe" && (
                              <>
                                <label className="kwb-label">التخطيط</label>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {[
                                    { id: "hero", label: "بطل" },
                                    { id: "hero_centered", label: "بطل مركزي" },
                                    { id: "cta", label: "شريط CTA" },
                                    { id: "form", label: "نموذج" },
                                  ].map(l => (
                                    <button key={l.id} className={`kwb-logo-layout-btn ${(comp.settings.layout || "hero") === l.id ? "kwb-logo-layout-active" : ""}`} style={{ flex: 1, padding: "6px 4px", fontSize: 11 }} onClick={() => updateComponentSettings(comp.id, { layout: l.id })}>{l.label}</button>
                                  ))}
                                </div>
                                {comp.settings.layout === "hero_centered" && (
                                  <>
                                    <label className="kwb-label" style={{ marginTop: 12 }}>صورة البطل</label>
                                    {comp.settings.heroImageUrl ? (
                                      <div className="kwb-upload-preview"><img src={comp.settings.heroImageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => updateComponentSettings(comp.id, { heroImageUrl: "" })}>{Icons.x}</button></div>
                                    ) : (
                                      <div className="kwb-upload-area-sm">{Icons.image}<span>لا توجد صورة</span></div>
                                    )}
                                    <button className="kwb-btn-outline kwb-btn-full" onClick={() => triggerUpload({ type: "header_hero_img", compId: comp.id })}>رفع صورة</button>
                                  </>
                                )}
                                <label className="kwb-label" style={{ marginTop: 12 }}>العنوان</label>
                                <input className="kwb-input" value={comp.settings.title || ""} onChange={e => updateComponentSettings(comp.id, { title: e.target.value })} />
                                {(comp.settings.layout === "hero" || comp.settings.layout === "hero_centered" || !comp.settings.layout) && (
                                  <>
                                    <label className="kwb-label" style={{ marginTop: 12 }}>العنوان الفرعي</label>
                                    <input className="kwb-input" value={comp.settings.subtitle || ""} onChange={e => updateComponentSettings(comp.id, { subtitle: e.target.value })} />
                                  </>
                                )}
                                {comp.settings.layout === "form" && (
                                  <>
                                    <label className="kwb-label" style={{ marginTop: 12 }}>الوصف</label>
                                    <input className="kwb-input" value={comp.settings.description || ""} placeholder="محتوى حصري يصلك مباشرة إلى بريدك" onChange={e => updateComponentSettings(comp.id, { description: e.target.value })} />
                                    <div className="kwb-newsletter-toggle" style={{ marginTop: 12 }}>
                                      <label className="kwb-toggle">
                                        <input type="checkbox" checked={comp.settings.showNameField || false} onChange={e => updateComponentSettings(comp.id, { showNameField: e.target.checked })} />
                                        <span className="kwb-toggle-track"><span className="kwb-toggle-thumb" /></span>
                                      </label>
                                      <span>إظهار حقل الاسم</span>
                                    </div>
                                  </>
                                )}
                                <label className="kwb-label" style={{ marginTop: 12 }}>نص الزر</label>
                                <input className="kwb-input" value={comp.settings.buttonText || ""} onChange={e => updateComponentSettings(comp.id, { buttonText: e.target.value })} />
                                <label className="kwb-label" style={{ marginTop: 12 }}>لون الزر</label>
                                <div className="kwb-color-row-controls">
                                  {PRESET_COLORS.map(c => (
                                    <button key={c} className={`kwb-color-dot ${comp.settings.buttonColor === c ? "kwb-color-dot-active" : ""}`} style={{ background: c }} onClick={() => updateComponentSettings(comp.id, { buttonColor: c })} />
                                  ))}
                                  <input type="color" className="kwb-color-input" value={comp.settings.buttonColor || activeSite.branding.buttonColor || "#E82222"} onChange={e => updateComponentSettings(comp.id, { buttonColor: e.target.value })} />
                                </div>
                              </>
                            )}

                            {comp.type === "footer" && (
                              <>
                                <label className="kwb-label">الشعار</label>
                                {comp.settings.logoUrl ? (
                                  <div className="kwb-upload-preview"><img src={comp.settings.logoUrl} alt="" /><button className="kwb-upload-remove" onClick={() => updateComponentSettings(comp.id, { logoUrl: "" })}>{Icons.x}</button></div>
                                ) : (
                                  <div className="kwb-upload-area-sm">{Icons.image}<span>لا توجد صورة</span></div>
                                )}
                                <button className="kwb-btn-outline kwb-btn-full" onClick={() => triggerUpload({ type: "comp_logo", compId: comp.id })}>رفع صورة</button>
                                <label className="kwb-label" style={{ marginTop: 12 }}>العنوان</label>
                                <input className="kwb-input" value={comp.settings.title || ""} onChange={e => updateComponentSettings(comp.id, { title: e.target.value })} placeholder="أدخل النص" />
                                <label className="kwb-label" style={{ marginTop: 12 }}>نص الوصف</label>
                                <input className="kwb-input" value={comp.settings.tagline || ""} onChange={e => updateComponentSettings(comp.id, { tagline: e.target.value })} placeholder="محتوى حصري يصلك مباشرة إلى بريدك" />
                                <label className="kwb-label" style={{ marginTop: 12 }}>نص الزر</label>
                                <input className="kwb-input" value={comp.settings.buttonText || ""} onChange={e => updateComponentSettings(comp.id, { buttonText: e.target.value })} placeholder="أضف نصا" />
                                <label className="kwb-label" style={{ marginTop: 12 }}>لون الزر</label>
                                <div className="kwb-color-row-controls">
                                  {PRESET_COLORS.map(c => (
                                    <button key={c} className={`kwb-color-dot ${comp.settings.buttonColor === c ? "kwb-color-dot-active" : ""}`} style={{ background: c }} onClick={() => updateComponentSettings(comp.id, { buttonColor: c })} />
                                  ))}
                                  <input type="color" className="kwb-color-input" value={comp.settings.buttonColor || activeSite.branding.buttonColor || "#E82222"} onChange={e => updateComponentSettings(comp.id, { buttonColor: e.target.value })} />
                                </div>
                                <label className="kwb-label" style={{ marginTop: 12 }}>نص مخصص</label>
                                <textarea className="kwb-input" style={{ height: 60, paddingTop: 8, resize: "vertical" }} value={comp.settings.customText || ""} placeholder="أضف نصا يظهر أسفل الشعار..." onChange={e => updateComponentSettings(comp.id, { customText: e.target.value })} />

                                <label className="kwb-label" style={{ marginTop: 12 }}>روابط إضافية</label>
                                {(comp.settings.customLinks || []).map((cl: any, i: number) => (
                                  <div key={i} style={{ display: "flex", gap: 4, marginTop: 4, alignItems: "center" }}>
                                    <input className="kwb-input kwb-input-sm" placeholder="الاسم" value={cl.label || ""} onChange={e => { const links = [...(comp.settings.customLinks || [])]; links[i] = { ...links[i], label: e.target.value }; updateComponentSettings(comp.id, { customLinks: links }); }} style={{ flex: 1 }} />
                                    <input className="kwb-input kwb-input-sm" placeholder="الرابط" value={cl.url || ""} dir="ltr" onChange={e => { const links = [...(comp.settings.customLinks || [])]; links[i] = { ...links[i], url: e.target.value }; updateComponentSettings(comp.id, { customLinks: links }); }} style={{ flex: 1 }} />
                                    <button className="kwb-icon-btn-sm kwb-icon-btn-danger" onClick={() => { const links = [...(comp.settings.customLinks || [])]; links.splice(i, 1); updateComponentSettings(comp.id, { customLinks: links }); }}>{Icons.x}</button>
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 6 }} onClick={() => updateComponentSettings(comp.id, { customLinks: [...(comp.settings.customLinks || []), { label: "", url: "" }] })}>+ إضافة رابط</button>

                                <p className="kwb-hint" style={{ marginTop: 12 }}>الروابط الأساسية متصلة بروابط رأس الصفحة تلقائيًا. عدّل الروابط من إعدادات رأس الصفحة.</p>
                              </>
                            )}


                            {comp.type === "text_block" && (
                              <>
                                <label className="kwb-label">النص</label>
                                <textarea className="kwb-input" style={{ height: 100, paddingTop: 10, resize: "vertical" }} value={comp.settings.content || ""} onChange={e => updateComponentSettings(comp.id, { content: e.target.value })} placeholder="أضف نصك هنا..." />
                              </>
                            )}

                            {comp.type === "rich_text" && (
                              <>
                                <p className="kwb-hint" style={{ marginTop: 0 }}>انقر على المحتوى في المعاينة للتعديل مباشرة. استخدم شريط الأدوات أعلى المحتوى للتنسيق.</p>
                              </>
                            )}

                            {comp.type === "image_block" && (
                              <>
                                <label className="kwb-label">الصورة</label>
                                {comp.settings.imageUrl ? (
                                  <div className="kwb-upload-preview"><img src={comp.settings.imageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => updateComponentSettings(comp.id, { imageUrl: "" })}>{Icons.x}</button></div>
                                ) : (
                                  <div className="kwb-upload-area-sm">{Icons.image}<span>لا توجد صورة</span></div>
                                )}
                                <button className="kwb-btn-outline kwb-btn-full" onClick={() => triggerUpload({ type: "comp_banner", compId: comp.id })}>رفع صورة</button>
                                <label className="kwb-label" style={{ marginTop: 12 }}>وصف الصورة</label>
                                <input className="kwb-input" value={comp.settings.caption || ""} onChange={e => updateComponentSettings(comp.id, { caption: e.target.value })} placeholder="وصف اختياري" />
                              </>
                            )}


                            {comp.type === "contact_form" && (
                              <>
                                <label className="kwb-label">العنوان</label>
                                <input className="kwb-input" value={comp.settings.title || ""} onChange={e => updateComponentSettings(comp.id, { title: e.target.value })} />
                                <label className="kwb-label" style={{ marginTop: 12 }}>نص الزر</label>
                                <input className="kwb-input" value={comp.settings.buttonText || ""} onChange={e => updateComponentSettings(comp.id, { buttonText: e.target.value })} />
                                <label className="kwb-label" style={{ marginTop: 12 }}>لون الزر</label>
                                <div className="kwb-color-row-controls">
                                  {PRESET_COLORS.map(c => (
                                    <button key={c} className={`kwb-color-dot ${comp.settings.buttonColor === c ? "kwb-color-dot-active" : ""}`} style={{ background: c }} onClick={() => updateComponentSettings(comp.id, { buttonColor: c })} />
                                  ))}
                                  <input type="color" className="kwb-color-input" value={comp.settings.buttonColor || activeSite.branding.buttonColor || "#E82222"} onChange={e => updateComponentSettings(comp.id, { buttonColor: e.target.value })} />
                                </div>
                              </>
                            )}

                            {comp.type === "testimonials" && (
                              <>
                                <label className="kwb-label">عنوان القسم</label>
                                <input className="kwb-input" value={comp.settings.sectionTitle || ""} onChange={e => updateComponentSettings(comp.id, { sectionTitle: e.target.value })} placeholder="عنوان القسم" />
                                <label className="kwb-label">التخطيط</label>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button className={`kwb-logo-layout-btn ${(comp.settings.layout || "grid") === "grid" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "grid" })} style={{ flex: 1 }}>شبكة</button>
                                  <button className={`kwb-logo-layout-btn ${comp.settings.layout === "list" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "list" })} style={{ flex: 1 }}>قائمة</button>
                                </div>
                                {(comp.settings.items || []).map((item: any, i: number) => (
                                  <div key={i} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>رأي {i + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const items = [...(comp.settings.items || [])]; items.splice(i, 1); updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button>
                                    </div>
                                    <input className="kwb-input" placeholder="الاسم" value={item.name || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], name: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="المسمى الوظيفي" value={item.role || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], role: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <textarea className="kwb-input" placeholder="نص الرأي" value={item.text || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], text: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6, height: 60, paddingTop: 8, resize: "vertical" }} />
                                    {item.imageUrl ? (
                                      <div className="kwb-upload-preview" style={{ marginTop: 6 }}><img src={item.imageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], imageUrl: "" }; updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button></div>
                                    ) : (
                                      <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 6, fontSize: 11 }} onClick={() => triggerUpload({ type: "testi_img", compId: comp.id, itemIndex: i })}>{Icons.image} رفع صورة</button>
                                    )}
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 10 }} onClick={() => { const items = [...(comp.settings.items || []), { name: "", role: "", text: "", imageUrl: "" }]; updateComponentSettings(comp.id, { items }); }}>{Icons.plus} إضافة رأي</button>
                              </>
                            )}

                            {comp.type === "products" && (
                              <>
                                <label className="kwb-label">عنوان القسم</label>
                                <input className="kwb-input" value={comp.settings.sectionTitle || ""} onChange={e => updateComponentSettings(comp.id, { sectionTitle: e.target.value })} placeholder="عنوان القسم" />
                                <label className="kwb-label">التخطيط</label>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button className={`kwb-logo-layout-btn ${(comp.settings.layout || "grid") === "grid" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "grid" })} style={{ flex: 1 }}>شبكة</button>
                                  <button className={`kwb-logo-layout-btn ${comp.settings.layout === "list" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "list" })} style={{ flex: 1 }}>قائمة</button>
                                </div>
                                {(comp.settings.items || []).map((item: any, i: number) => (
                                  <div key={i} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>منتج {i + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const items = [...(comp.settings.items || [])]; items.splice(i, 1); updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button>
                                    </div>
                                    <input className="kwb-input" placeholder="اسم المنتج" value={item.title || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], title: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="وصف مختصر" value={item.subtitle || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], subtitle: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="السعر" value={item.price || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], price: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="رابط المنتج" value={item.url || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], url: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} dir="ltr" />
                                    <input className="kwb-input" placeholder="نص الزر" value={item.buttonText || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], buttonText: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 10 }} onClick={() => { const items = [...(comp.settings.items || []), { title: "", subtitle: "", price: "", imageUrl: "", url: "", buttonText: "اشتري الآن" }]; updateComponentSettings(comp.id, { items }); }}>{Icons.plus} إضافة منتج</button>
                              </>
                            )}

                            {comp.type === "movies" && (
                              <>
                                <label className="kwb-label">عنوان القسم</label>
                                <input className="kwb-input" value={comp.settings.sectionTitle || ""} onChange={e => updateComponentSettings(comp.id, { sectionTitle: e.target.value })} placeholder="عنوان القسم" />
                                {(comp.settings.items || []).map((item: any, i: number) => (
                                  <div key={i} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>عنصر {i + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const items = [...(comp.settings.items || [])]; items.splice(i, 1); updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button>
                                    </div>
                                    <label className="kwb-label" style={{ marginTop: 6 }}>البوستر</label>
                                    {item.imageUrl ? (
                                      <div className="kwb-upload-preview" style={{ marginTop: 4 }}><img src={item.imageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], imageUrl: "" }; updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button></div>
                                    ) : (
                                      <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 4, fontSize: 11 }} onClick={() => triggerUpload({ type: "movie_poster", compId: comp.id, itemIndex: i })}>{Icons.image} رفع بوستر</button>
                                    )}
                                    <input className="kwb-input" placeholder="اسم الفيلم / المسلسل" value={item.title || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], title: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="وصف مختصر" value={item.subtitle || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], subtitle: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="رابط المشاهدة" value={item.url || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], url: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} dir="ltr" />
                                    <input className="kwb-input" placeholder="نص الزر" value={item.buttonText || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], buttonText: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 10 }} onClick={() => { const items = [...(comp.settings.items || []), { title: "", subtitle: "", imageUrl: "", url: "", buttonText: "شاهد الآن" }]; updateComponentSettings(comp.id, { items }); }}>{Icons.plus} إضافة عنصر</button>
                              </>
                            )}

                            {comp.type === "podcast" && (
                              <>
                                <label className="kwb-label">عنوان القسم</label>
                                <input className="kwb-input" value={comp.settings.sectionTitle || ""} onChange={e => updateComponentSettings(comp.id, { sectionTitle: e.target.value })} placeholder="عنوان القسم" />
                                <label className="kwb-label">التخطيط</label>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button className={`kwb-logo-layout-btn ${(comp.settings.layout || "list") === "list" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "list" })} style={{ flex: 1, padding: "6px 4px", fontSize: 11 }}>قائمة</button>
                                  <button className={`kwb-logo-layout-btn ${comp.settings.layout === "grid" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "grid" })} style={{ flex: 1, padding: "6px 4px", fontSize: 11 }}>شبكة</button>
                                  <button className={`kwb-logo-layout-btn ${comp.settings.layout === "featured" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "featured" })} style={{ flex: 1, padding: "6px 4px", fontSize: 11 }}>بطاقات</button>
                                </div>
                                {(comp.settings.programs || []).map((prog: any, pi: number) => (
                                  <div key={pi} style={{ borderTop: "2px solid #e0e0e0", paddingTop: 12, marginTop: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: "#371D12" }}>برنامج {pi + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const programs = [...(comp.settings.programs || [])]; programs.splice(pi, 1); updateComponentSettings(comp.id, { programs }); }}>{Icons.x}</button>
                                    </div>
                                    <input className="kwb-input" placeholder="اسم البرنامج" value={prog.name || ""} onChange={e => { const programs = [...(comp.settings.programs || [])]; programs[pi] = { ...programs[pi], name: e.target.value }; updateComponentSettings(comp.id, { programs }); }} />
                                    <input className="kwb-input" placeholder="وصف البرنامج" value={prog.description || ""} onChange={e => { const programs = [...(comp.settings.programs || [])]; programs[pi] = { ...programs[pi], description: e.target.value }; updateComponentSettings(comp.id, { programs }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="رابط البودكاست (Apple/Spotify...)" value={prog.url || ""} dir="ltr" onChange={e => { const programs = [...(comp.settings.programs || [])]; programs[pi] = { ...programs[pi], url: e.target.value }; updateComponentSettings(comp.id, { programs }); }} style={{ marginTop: 6 }} />
                                    <label className="kwb-label" style={{ marginTop: 8 }}>غلاف البرنامج</label>
                                    {prog.imageUrl ? (
                                      <div className="kwb-upload-preview" style={{ marginTop: 4 }}><img src={prog.imageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => { const programs = [...(comp.settings.programs || [])]; programs[pi] = { ...programs[pi], imageUrl: "" }; updateComponentSettings(comp.id, { programs }); }}>{Icons.x}</button></div>
                                    ) : (
                                      <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 4, fontSize: 11 }} onClick={() => triggerUpload({ type: "podcast_cover", compId: comp.id, itemIndex: pi })}>{Icons.image} رفع غلاف</button>
                                    )}
                                    <label className="kwb-label" style={{ marginTop: 10 }}>الحلقات</label>
                                    {(prog.episodes || []).map((ep: any, ei: number) => (
                                      <div key={ei} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8, marginTop: 8 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <span style={{ fontSize: 11, fontWeight: 600, color: "#999" }}>حلقة {ei + 1}</span>
                                          <button className="kwb-comp-delete-btn" onClick={() => { const programs = [...(comp.settings.programs || [])]; const eps = [...(programs[pi].episodes || [])]; eps.splice(ei, 1); programs[pi] = { ...programs[pi], episodes: eps }; updateComponentSettings(comp.id, { programs }); }}>{Icons.x}</button>
                                        </div>
                                        <input className="kwb-input" placeholder="عنوان الحلقة" value={ep.title || ""} onChange={e => { const programs = [...(comp.settings.programs || [])]; const eps = [...(programs[pi].episodes || [])]; eps[ei] = { ...eps[ei], title: e.target.value }; programs[pi] = { ...programs[pi], episodes: eps }; updateComponentSettings(comp.id, { programs }); }} style={{ marginTop: 4 }} />
                                        <input className="kwb-input" placeholder="وصف مختصر" value={ep.subtitle || ""} onChange={e => { const programs = [...(comp.settings.programs || [])]; const eps = [...(programs[pi].episodes || [])]; eps[ei] = { ...eps[ei], subtitle: e.target.value }; programs[pi] = { ...programs[pi], episodes: eps }; updateComponentSettings(comp.id, { programs }); }} style={{ marginTop: 4 }} />
                                        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                                          <input className="kwb-input" placeholder="المدة" value={ep.duration || ""} onChange={e => { const programs = [...(comp.settings.programs || [])]; const eps = [...(programs[pi].episodes || [])]; eps[ei] = { ...eps[ei], duration: e.target.value }; programs[pi] = { ...programs[pi], episodes: eps }; updateComponentSettings(comp.id, { programs }); }} style={{ flex: 1 }} />
                                          <input className="kwb-input" placeholder="الرابط" value={ep.url || ""} onChange={e => { const programs = [...(comp.settings.programs || [])]; const eps = [...(programs[pi].episodes || [])]; eps[ei] = { ...eps[ei], url: e.target.value }; programs[pi] = { ...programs[pi], episodes: eps }; updateComponentSettings(comp.id, { programs }); }} style={{ flex: 1 }} dir="ltr" />
                                        </div>
                                      </div>
                                    ))}
                                    <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 8 }} onClick={() => { const programs = [...(comp.settings.programs || [])]; const eps = [...(programs[pi].episodes || []), { title: "", subtitle: "", duration: "", url: "" }]; programs[pi] = { ...programs[pi], episodes: eps }; updateComponentSettings(comp.id, { programs }); }}>{Icons.plus} إضافة حلقة</button>
                                  </div>
                                ))}
                                <button className="kwb-btn-primary kwb-btn-full" style={{ marginTop: 12 }} onClick={() => { const programs = [...(comp.settings.programs || []), { name: "", description: "", imageUrl: "", episodes: [] }]; updateComponentSettings(comp.id, { programs }); }}>{Icons.plus} إضافة برنامج</button>
                              </>
                            )}

                            {comp.type === "courses" && (
                              <>
                                <label className="kwb-label">عنوان القسم</label>
                                <input className="kwb-input" value={comp.settings.sectionTitle || ""} onChange={e => updateComponentSettings(comp.id, { sectionTitle: e.target.value })} placeholder="عنوان القسم" />
                                <label className="kwb-label">التخطيط</label>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button className={`kwb-logo-layout-btn ${(comp.settings.layout || "grid") === "grid" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "grid" })} style={{ flex: 1 }}>شبكة</button>
                                  <button className={`kwb-logo-layout-btn ${comp.settings.layout === "list" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "list" })} style={{ flex: 1 }}>قائمة</button>
                                </div>
                                {(comp.settings.items || []).map((item: any, i: number) => (
                                  <div key={i} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>دورة {i + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const items = [...(comp.settings.items || [])]; items.splice(i, 1); updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button>
                                    </div>
                                    <input className="kwb-input" placeholder="اسم الدورة" value={item.title || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], title: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="تفاصيل (عدد الدروس / المدة)" value={item.subtitle || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], subtitle: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="السعر" value={item.price || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], price: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="رابط التسجيل" value={item.url || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], url: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} dir="ltr" />
                                    <input className="kwb-input" placeholder="نص الزر" value={item.buttonText || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], buttonText: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 10 }} onClick={() => { const items = [...(comp.settings.items || []), { title: "", subtitle: "", price: "", imageUrl: "", url: "", buttonText: "سجّل الآن" }]; updateComponentSettings(comp.id, { items }); }}>{Icons.plus} إضافة دورة</button>
                              </>
                            )}

                            {comp.type === "topics" && (
                              <>
                                <label className="kwb-label">عنوان القسم</label>
                                <input className="kwb-input" value={comp.settings.sectionTitle || ""} onChange={e => updateComponentSettings(comp.id, { sectionTitle: e.target.value })} placeholder="عنوان القسم" />
                                <label className="kwb-label">التخطيط</label>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button className={`kwb-logo-layout-btn ${(comp.settings.layout || "grid") === "grid" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "grid" })} style={{ flex: 1 }}>شبكة</button>
                                  <button className={`kwb-logo-layout-btn ${comp.settings.layout === "list" ? "kwb-logo-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: "list" })} style={{ flex: 1 }}>قائمة</button>
                                </div>
                                {(comp.settings.items || []).map((item: any, i: number) => (
                                  <div key={i} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>موضوع {i + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const items = [...(comp.settings.items || [])]; items.splice(i, 1); updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button>
                                    </div>
                                    <input className="kwb-input" placeholder="اسم الموضوع" value={item.title || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], title: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} />
                                    <input className="kwb-input" placeholder="رابط (اختياري)" value={item.url || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], url: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 6 }} dir="ltr" />
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 10 }} onClick={() => { const items = [...(comp.settings.items || []), { title: "", icon: "", url: "" }]; updateComponentSettings(comp.id, { items }); }}>{Icons.plus} إضافة موضوع</button>
                              </>
                            )}


                            {comp.type === "social_links" && (
                              <>
                                <label className="kwb-label">منصات التواصل</label>
                                {(comp.settings.platforms || []).map((p: any, i: number) => (
                                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                                    <label className="kwb-toggle" style={{ flexShrink: 0 }}>
                                      <input type="checkbox" checked={p.enabled} onChange={() => { const platforms = [...(comp.settings.platforms || [])]; platforms[i] = { ...platforms[i], enabled: !platforms[i].enabled }; updateComponentSettings(comp.id, { platforms }); }} />
                                      <span className="kwb-toggle-slider" />
                                    </label>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#555", minWidth: 60 }}>{{ twitter: "X", instagram: "إنستغرام", youtube: "يوتيوب", linkedin: "لينكدإن", tiktok: "تيك توك", snapchat: "سناب شات", facebook: "فيسبوك", website: "الموقع", threads: "ثريدز", telegram: "تيليغرام", whatsapp: "واتساب", pinterest: "بنترست", spotify: "سبوتيفاي" }[p.platform] || p.platform}</span>
                                    <input className="kwb-input kwb-input-sm" placeholder="الرابط" value={p.url || ""} dir="ltr" onChange={e => { const platforms = [...(comp.settings.platforms || [])]; platforms[i] = { ...platforms[i], url: e.target.value }; updateComponentSettings(comp.id, { platforms }); }} style={{ flex: 1 }} />
                                  </div>
                                ))}
                              </>
                            )}
                            {comp.type === "bento_grid" && (
                              <>
                                <label className="kwb-label">تخطيط الشبكة</label>
                                <div className="kwb-bento-layouts">
                                  {[
                                    { id: "2-1", label: "٢ + ١", desc: "بطاقتان صغيرتان + واحدة كبيرة" },
                                    { id: "1-2", label: "١ + ٢", desc: "واحدة كبيرة + بطاقتان صغيرتان" },
                                    { id: "3-col", label: "٣ أعمدة", desc: "ثلاث بطاقات متساوية" },
                                    { id: "2-col", label: "٢ أعمدة", desc: "بطاقتان متساويتان" },
                                    { id: "1-3", label: "١ + ٣", desc: "واحدة كبيرة + ثلاث صغيرة" },
                                    { id: "4-grid", label: "شبكة ٤", desc: "٢×٢ بطاقات متساوية" },
                                  ].map(l => (
                                    <button key={l.id} className={`kwb-bento-layout-btn ${(comp.settings.layout || "2-1") === l.id ? "kwb-bento-layout-active" : ""}`} onClick={() => updateComponentSettings(comp.id, { layout: l.id })}>
                                      <strong>{l.label}</strong>
                                      <span>{l.desc}</span>
                                    </button>
                                  ))}
                                </div>
                                <label className="kwb-label" style={{ marginTop: 12 }}>البطاقات</label>
                                {(comp.settings.items || []).map((item: any, i: number) => (
                                  <div key={i} style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8, marginTop: 8 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>بطاقة {i + 1}</span>
                                      <button className="kwb-comp-delete-btn" onClick={() => { const items = [...(comp.settings.items || [])]; items.splice(i, 1); updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button>
                                    </div>
                                    <input className="kwb-input" placeholder="العنوان" value={item.title || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], title: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 4 }} />
                                    <input className="kwb-input" placeholder="النص الوصفي" value={item.text || ""} onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], text: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 4 }} />
                                    <input className="kwb-input" placeholder="رابط (اختياري)" value={item.linkUrl || ""} dir="ltr" onChange={e => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], linkUrl: e.target.value }; updateComponentSettings(comp.id, { items }); }} style={{ marginTop: 4 }} />
                                    <label className="kwb-label" style={{ marginTop: 6, marginBottom: 2 }}>حجم البطاقة</label>
                                    <div style={{ display: "flex", gap: 4 }}>
                                      {[{ id: "square", label: "مربّع" }, { id: "wide", label: "عريض" }, { id: "tall", label: "طويل" }].map(sz => (
                                        <button key={sz.id} className={`kwb-logo-layout-btn ${(item.cardSize || "square") === sz.id ? "kwb-logo-layout-active" : ""}`} style={{ flex: 1, padding: "6px 4px" }} onClick={() => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], cardSize: sz.id }; updateComponentSettings(comp.id, { items }); }}>{sz.label}</button>
                                      ))}
                                    </div>
                                    {item.imageUrl ? (
                                      <div className="kwb-upload-preview" style={{ marginTop: 4 }}><img src={item.imageUrl} alt="" /><button className="kwb-upload-remove" onClick={() => { const items = [...(comp.settings.items || [])]; items[i] = { ...items[i], imageUrl: "" }; updateComponentSettings(comp.id, { items }); }}>{Icons.x}</button></div>
                                    ) : (
                                      <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 4, fontSize: 11 }} onClick={() => triggerUpload({ type: "testi_img", compId: comp.id, itemIndex: i })}>{Icons.image} رفع صورة</button>
                                    )}
                                  </div>
                                ))}
                                <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 8 }} onClick={() => { const items = [...(comp.settings.items || []), { title: "", text: "", imageUrl: "", linkUrl: "" }]; updateComponentSettings(comp.id, { items }); }}>{Icons.plus} إضافة بطاقة</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              )}

              {/* ─── PAGES TAB ─── */}
              {sidebarTab === "pages" && (
                <div className="kwb-sb-pages">
                  <div className="kwb-pages-list">
                    {activeSite.pages.map((p, idx) => (
                      <div key={p.id} className={`kwb-page-row ${activePageId === p.id ? "kwb-page-row-active" : ""} ${p.hidden ? "kwb-page-row-hidden" : ""}`}>
                        <div className="kwb-page-row-main">
                          <span className="kwb-grip" onMouseDown={e => e.preventDefault()}>
                            <button className="kwb-grip-btn" onClick={() => movePage(p.id, "up")} title="تحريك لأعلى">{Icons.gripVertical}</button>
                          </span>
                          <button className="kwb-vis-btn" onClick={e => { e.stopPropagation(); updatePageField(p.id, "hidden", !p.hidden); }} title={p.hidden ? "إظهار" : "إخفاء"}>
                            {p.hidden ? Icons.eyeOff : Icons.eye}
                          </button>
                          <div className="kwb-page-row-info" onClick={() => { setActivePageId(p.id); setExpandedComponent(null); setSidebarTab("components"); }}>
                            <span className="kwb-page-row-name">{p.name}</span>
                            <span className="kwb-page-row-slug" dir="ltr">/{p.slug}</span>
                          </div>
                          <div className="kwb-page-row-actions">
                            <button className="kwb-icon-btn-sm" onClick={e => { e.stopPropagation(); setActivePageId(activePageId === p.id ? null : p.id); }} title="إعدادات">{Icons.edit}</button>
                            {activeSite.pages.length > 1 && (
                              <button className="kwb-icon-btn-sm kwb-icon-btn-danger" onClick={e => { e.stopPropagation(); deletePage(p.id); }} title="حذف">{Icons.x}</button>
                            )}
                          </div>
                        </div>
                        {activePageId === p.id && (
                          <div className="kwb-page-edit-fields" onClick={e => e.stopPropagation()}>
                            <div className="kwb-field-row">
                              <label className="kwb-label-inline">الاسم</label>
                              <input className="kwb-input kwb-input-sm" value={p.name} onChange={e => updatePageField(p.id, "name", e.target.value)} />
                            </div>
                            <div className="kwb-field-row">
                              <label className="kwb-label-inline">الرابط</label>
                              <input className="kwb-input kwb-input-sm" value={p.slug} dir="ltr" onChange={e => updatePageField(p.id, "slug", e.target.value)} />
                            </div>
                            <button className="kwb-btn-primary kwb-btn-full" style={{ fontSize: 12, padding: "8px 0", marginTop: 4 }} onClick={() => { setActivePageId(p.id); setExpandedComponent(null); setSidebarTab("components"); }}>
                              تعديل المكونات
                            </button>

                            <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 8, fontSize: 12 }} onClick={() => setShowSeoModal(p.id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                              إعدادات SEO
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="kwb-btn-outline kwb-btn-full" style={{ marginTop: 8 }} onClick={() => { setDraftPageName(""); setDraftPageSlug(""); setAddPageModal(true); }}>
                    {Icons.plus} إضافة صفحة
                  </button>

                  <div className="kwb-sb-bottom">
                    <div className="kwb-newsletter-toggle">
                      <label className="kwb-toggle">
                        <input type="checkbox" checked={activeSite.hasNewsletter} onChange={e => updateSite(activeSite.id, { hasNewsletter: e.target.checked })} />
                        <span className="kwb-toggle-track"><span className="kwb-toggle-thumb" /></span>
                      </label>
                      <span>نشرة بريدية لهذا الموقع؟</span>
                    </div>
                    <button className="kwb-btn-primary kwb-btn-full" onClick={handleSave} style={saveStatus === "saved" ? { background: "#10B981" } : saveStatus === "saving" ? { opacity: 0.7 } : {}}>
                      {saveStatus === "saving" ? "جاري الحفظ..." : saveStatus === "saved" ? "حُفظ" : "حفظ الموقع"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer: Add component (components tab only) */}
            {sidebarTab === "components" && (
              <div className="kwb-comp-sticky-footer">
                <button className="kwb-btn-primary kwb-btn-full" onClick={() => setShowAddComponent(!showAddComponent)}>
                  {showAddComponent ? "إغلاق" : "+ إضافة مكون"}
                </button>
                {showAddComponent && (
                  <div className="kwb-add-comp-dropdown">
                    <div className="kwb-add-comp-cards">
                      {(["header","hero_news","subscribe","article_collection","bento_grid","banner","brands_ticker","testimonials","products","movies","podcast","courses","topics","text_block","rich_text","image_block","contact_form","social_links","divider","footer"] as ComponentType[]).map(type => (
                        <button key={type} className="kwb-add-comp-card" onClick={() => { addComponentToPage(type); setShowAddComponent(false); }}>
                          <span className="kwb-add-comp-icon" dangerouslySetInnerHTML={{ __html: COMPONENT_ICONS[type] || '' }} />
                          <span className="kwb-add-comp-name">{COMPONENT_META[type].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Add Page Modal ─── */}
        {addPageModal && (
          <div className="kwb-overlay" onClick={() => setAddPageModal(false)}>
            <div className="kwb-modal" onClick={e => e.stopPropagation()}>
              <div className="kwb-modal-header">
                <h2>إضافة صفحة جديدة</h2>
                <button className="kwb-btn-icon" onClick={() => setAddPageModal(false)}>{Icons.x}</button>
              </div>
              <div className="kwb-modal-body">
                <p style={{ fontSize: 13, color: "#888", margin: "0 0 12px" }}>اختر تصنيفاً جاهزاً أو أنشئ صفحة مخصصة</p>
                <div className="kwb-page-presets">
                  {["فن", "تقنية", "أعمال", "رياضة", "صحة", "سفر", "تعليم", "ثقافة", "مجتمع", "ترفيه", "طبخ", "أدب"].map(cat => {
                    const exists = activeSite.pages.some(p => p.name === cat);
                    return (
                      <button key={cat} className={`kwb-page-preset-btn ${exists ? "kwb-page-preset-disabled" : ""}`} disabled={exists} onClick={() => addPage(cat)}>
                        {cat}
                        {exists && <span className="kwb-page-preset-check">{Icons.check}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="kwb-page-divider"><span>أو أنشئ صفحة مخصصة</span></div>
                <label className="kwb-label">اسم الصفحة</label>
                <input className="kwb-input" placeholder="مثال: تصميم، تسويق، بودكاست..." value={draftPageName} onChange={e => setDraftPageName(e.target.value)} />
                <label className="kwb-label" style={{ marginTop: 12 }}>الرابط (Slug)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6, direction: "ltr" }}>
                  <span style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>yoursite.kitabh.com/</span>
                  <input className="kwb-input" placeholder={draftPageName ? slugify(draftPageName) : "page-slug"} value={draftPageSlug} onChange={e => setDraftPageSlug(e.target.value)} dir="ltr" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="kwb-modal-footer">
                <button className="kwb-btn-primary kwb-btn-full" onClick={() => addPage()} disabled={!draftPageName.trim()}>إضافة صفحة</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Article Picker Modal ─── */}
        {articlePickerModal && (
          <div className="kwb-overlay" onClick={() => setArticlePickerModal(false)}>
            <div className="kwb-modal kwb-modal-lg" onClick={e => e.stopPropagation()}>
              <div className="kwb-modal-header">
                <h2>اختر المقالات</h2>
                <span className="kwb-modal-subtitle">{selectedArticles.length}/{MOCK_ARTICLES.length} مقالات مختارة</span>
                <button className="kwb-btn-icon" onClick={() => setArticlePickerModal(false)}>{Icons.x}</button>
              </div>
              <div className="kwb-modal-body">
                <div className="kwb-article-search">
                  <input className="kwb-input" placeholder="بحث في المقالات" value={articleSearch} onChange={e => setArticleSearch(e.target.value)} />
                  <span className="kwb-search-icon">{Icons.search}</span>
                </div>
                <div className="kwb-article-list">
                  {filteredArticles.map(a => {
                    const isSelected = selectedArticles.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        className={`kwb-article-row ${isSelected ? "kwb-article-selected" : ""}`}
                        onClick={() => {
                          setSelectedArticles(prev =>
                            isSelected ? prev.filter(id => id !== a.id) : [...prev, a.id]
                          );
                        }}
                      >
                        <div className="kwb-article-row-content">
                          <div className="kwb-article-row-meta">
                            <span className="kwb-article-author">{a.author}</span>
                            <span className="kwb-article-date">{a.date}</span>
                          </div>
                          <h4 className="kwb-article-row-title">{a.title}</h4>
                          <div className="kwb-article-row-stats">
                            <span>{Icons.bookmark}</span>
                            <span>{Icons.share}</span>
                            <span>{Icons.comment} {a.comments}</span>
                            <span style={{ color: activeSite.branding.buttonColor || "#E82222" }}>{Icons.heart} {a.likes}</span>
                          </div>
                        </div>
                        <div className="kwb-article-row-thumb">
                          <div className="kwb-article-row-img" />
                          {isSelected && <span className="kwb-article-check">{Icons.check}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="kwb-modal-footer">
                <button className="kwb-btn-primary kwb-btn-full" onClick={saveArticlePicker}>إضافة</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── Login Modal ─── */}
      {showLoginModal && activeSite && (
        <div className="kwb-subscribe-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="kwb-login-popup" onClick={e => e.stopPropagation()} style={{ fontFamily: `'${activeSite.branding.fontFamily}', system-ui, sans-serif` }}>
            <button className="kwb-subscribe-popup-close" onClick={() => setShowLoginModal(false)}>{Icons.x}</button>
            <div className="kwb-subscribe-popup-icon" style={{ background: activeSite.branding.buttonColor || "#E82222" }}>
              {activeSite.branding.logoUrl ? <img src={activeSite.branding.logoUrl} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} /> : (activeSite.branding.siteName?.charAt(0) || "ك")}
            </div>
            <div className="kwb-login-tabs">
              <button className={`kwb-login-tab ${loginTab === "signin" ? "kwb-login-tab-active" : ""}`} style={loginTab === "signin" ? { borderColor: activeSite.branding.buttonColor || "#E82222", color: activeSite.branding.buttonColor || "#E82222" } : {}} onClick={() => setLoginTab("signin")}>تسجيل الدخول</button>
              <button className={`kwb-login-tab ${loginTab === "signup" ? "kwb-login-tab-active" : ""}`} style={loginTab === "signup" ? { borderColor: activeSite.branding.buttonColor || "#E82222", color: activeSite.branding.buttonColor || "#E82222" } : {}} onClick={() => setLoginTab("signup")}>إنشاء حساب</button>
            </div>
            <form className="kwb-login-form" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); console.log(loginTab === "signin" ? "Sign in:" : "Sign up:", Object.fromEntries(fd)); alert(loginTab === "signin" ? "تسجيل الدخول — سيُربط مع kitabh.com" : "أُنشئ الحساب — سيُربط مع kitabh.com"); e.currentTarget.reset(); setShowLoginModal(false); }}>
              {loginTab === "signup" && <input name="name" placeholder="الاسم الكامل" className="kwb-login-input" required autoComplete="name" style={{ borderRadius: `var(--kwb-radius, 8px)` }} />}
              <input name="email" type="email" placeholder="البريد الإلكتروني" className="kwb-login-input" required autoComplete="email" style={{ borderRadius: `var(--kwb-radius, 8px)` }} />
              <input name="password" type="password" placeholder="كلمة المرور" className="kwb-login-input" required autoComplete={loginTab === "signin" ? "current-password" : "new-password"} style={{ borderRadius: `var(--kwb-radius, 8px)` }} />
              <button type="submit" className="kwb-login-submit" style={{ background: activeSite.branding.buttonColor || "#E82222", borderRadius: `var(--kwb-radius, 8px)` }}>
                {loginTab === "signin" ? "دخول" : "إنشاء حساب"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── SEO Modal ─── */}
      {showSeoModal && activeSite && (() => {
        const p = activeSite.pages.find(pg => pg.id === showSeoModal);
        if (!p) return null;
        return (
          <div className="kwb-overlay" onClick={() => setShowSeoModal(null)}>
            <div className="kwb-modal" onClick={e => e.stopPropagation()}>
              <div className="kwb-modal-header">
                <h2>إعدادات SEO — {p.name}</h2>
                <button className="kwb-btn-icon" onClick={() => setShowSeoModal(null)}>{Icons.x}</button>
              </div>
              <div className="kwb-modal-body">
                <label className="kwb-label">عنوان الصفحة (Meta Title)</label>
                <input className="kwb-input" value={p.seo?.metaTitle || ""} placeholder={p.name + " — " + activeSite.name} onChange={e => { const pages = activeSite.pages.map(pg => pg.id === p.id ? { ...pg, seo: { ...pg.seo, metaTitle: e.target.value } } : pg); updateSite(activeSite.id, { pages }); }} />
                <span className="kwb-char-count">{(p.seo?.metaTitle || "").length}/60</span>
                <label className="kwb-label">الوصف (Meta Description)</label>
                <textarea className="kwb-input" style={{ height: 80, paddingTop: 10, resize: "vertical" }} value={p.seo?.metaDescription || ""} placeholder="وصف موجز للصفحة يظهر في نتائج البحث" onChange={e => { const pages = activeSite.pages.map(pg => pg.id === p.id ? { ...pg, seo: { ...pg.seo, metaDescription: e.target.value } } : pg); updateSite(activeSite.id, { pages }); }} />
                <span className="kwb-char-count">{(p.seo?.metaDescription || "").length}/160</span>
                <label className="kwb-label">صورة المشاركة (OG Image)</label>
                <input className="kwb-input" value={p.seo?.ogImage || ""} dir="ltr" placeholder="https://example.com/image.jpg" onChange={e => { const pages = activeSite.pages.map(pg => pg.id === p.id ? { ...pg, seo: { ...pg.seo, ogImage: e.target.value } } : pg); updateSite(activeSite.id, { pages }); }} />
                <div className="kwb-seo-preview" style={{ marginTop: 16 }}>
                  <div className="kwb-seo-preview-label">معاينة نتيجة البحث</div>
                  <div className="kwb-seo-google-preview" dir="ltr">
                    <div className="kwb-seo-gp-url"><span className="kwb-seo-gp-favicon">K</span>{activeSite.customDomain || "example.com"} &rsaquo; {p.slug}</div>
                    <div className="kwb-seo-gp-title">{p.seo?.metaTitle || p.name + " — " + activeSite.name}</div>
                    <div className="kwb-seo-gp-desc">{p.seo?.metaDescription || "وصف الصفحة يظهر هنا."}</div>
                  </div>
                </div>
              </div>
              <div className="kwb-modal-footer">
                <button className="kwb-btn-primary kwb-btn-full" onClick={() => setShowSeoModal(null)}>حسنًا</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Subscribe Popup (portal-style, fixed overlay) ─── */}
      {showSubscribePopup && activeSite && (
        <div className="kwb-subscribe-overlay" onClick={() => setShowSubscribePopup(false)}>
          <div className="kwb-subscribe-popup" onClick={e => e.stopPropagation()}>
            <button className="kwb-subscribe-popup-close" onClick={() => setShowSubscribePopup(false)}>{Icons.x}</button>
            <div className="kwb-subscribe-popup-icon" style={{ background: activeSite.branding.buttonColor || "#E82222" }}>
              {activeSite.branding.siteName?.charAt(0) || "ك"}
            </div>
            <h3 className="kwb-subscribe-popup-title">{activeSite.branding.popupTitle || `اشترك في ${activeSite.branding.siteName || "نشرتنا"}`}</h3>
            <p className="kwb-subscribe-popup-desc">{activeSite.branding.popupDesc || "احصل على أحدث المقالات والمحتوى الحصري مباشرة إلى بريدك الإلكتروني"}</p>
            <div className="kwb-subscribe-popup-form">
              <input type="email" className="kwb-subscribe-popup-email" placeholder="أدخل بريدك الإلكتروني" dir="rtl" />
              <button className="kwb-subscribe-popup-btn" style={{ background: activeSite.branding.buttonColor || "#E82222" }}>{activeSite.branding.popupButtonText || "اشتراك"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const CSS_STYLES = `
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&family=Tajawal:wght@400;500;700&family=Almarai:wght@400;700;800&family=Changa:wght@400;500;600;700&family=El+Messiri:wght@400;500;600;700&family=Readex+Pro:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&family=Amiri:wght@400;700&family=Alyamama:wght@400;500;600;700&family=Playpen+Sans+Arabic:wght@400;500;600;700&display=swap');

/* Base */
.kwb,.kwb-builder{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;direction:rtl;text-align:right;color:#371D12;line-height:1.6;box-sizing:border-box;}
.kwb{width:100%;max-width:1100px;margin:0 auto;padding:24px 24px 60px;}
*,.kwb *,.kwb-builder *{box-sizing:border-box;}

/* Title */
.kwb-title{font-size:24px;font-weight:700;margin:0 0 24px;color:#371D12;}
.kwb-back-link{display:inline-flex;align-items:center;gap:4px;border:none;background:none;font-family:inherit;font-size:14px;color:#888;cursor:pointer;padding:0;margin-bottom:12px;}
.kwb-back-link:hover{color:#371D12;}

/* ─── SITES GRID ─── */
.kwb-sites-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}
.kwb-site-add{border:2px dashed #C8C8FF;border-radius:14px;background:#F0F0FF;display:flex;align-items:center;justify-content:center;min-height:320px;cursor:pointer;transition:all .2s;}
.kwb-site-add:hover{border-color:#0000FF;background:#E8E8FF;}
.kwb-site-add-inner{display:flex;flex-direction:column;align-items:center;gap:8px;color:#0000FF;font-weight:600;font-size:15px;}

.kwb-site-card{border:1.5px solid #E8E8E8;border-radius:14px;overflow:hidden;background:#fff;transition:box-shadow .2s;}
.kwb-site-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.06);}
.kwb-site-thumb{height:180px;cursor:pointer;overflow:hidden;}
.kwb-site-thumb-placeholder{height:100%;background:linear-gradient(135deg,#F5F5F5,#E8E8E8);display:flex;align-items:center;justify-content:center;}
.kwb-site-thumb-text{font-size:20px;font-weight:700;color:#BBB;}
.kwb-site-info{padding:16px;}
.kwb-site-info-top{display:flex;align-items:flex-start;gap:8px;}
.kwb-site-menu-wrap{position:relative;color:#BBB;cursor:pointer;flex-shrink:0;padding:2px;}
.kwb-site-menu-wrap:hover{color:#371D12;}
.kwb-site-name-col{flex:1;text-align:right;}
.kwb-site-name{font-size:16px;font-weight:700;color:#371D12;display:block;}
.kwb-site-date{font-size:12px;color:#999;display:block;margin-top:2px;}
.kwb-site-stats{font-size:12px;color:#999;margin:10px 0;text-align:right;}
.kwb-site-stats strong{color:#371D12;}
.kwb-btn-edit{width:100%;height:40px;border:none;border-radius:10px;background:#0000FF;color:#fff;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;}
.kwb-btn-edit:hover{background:#0000CC;}

/* Dropdown */
.kwb-dropdown{position:absolute;top:calc(100% + 4px);right:0;min-width:140px;background:#fff;border:1.5px solid #E0E0E0;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,0.08);z-index:100;padding:6px;}
.kwb-dropdown-item{display:block;width:100%;padding:8px 12px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:500;color:#371D12;text-align:right;cursor:pointer;border-radius:7px;}
.kwb-dropdown-item:hover{background:#F5F5F5;}
.kwb-dropdown-danger{color:#E82222;}

/* ─── TEMPLATES ─── */
.kwb-templates-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;}
.kwb-template-card{border:1.5px solid #E8E8E8;border-radius:14px;overflow:hidden;background:#fff;}
.kwb-template-thumb{height:180px;overflow:hidden;}
.kwb-template-thumb-inner{height:100%;background:#f8f8f8;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#BBB;}
.kwb-skeleton-preview{flex-direction:column;align-items:stretch;padding:8px;gap:6px;direction:rtl;}
.kwb-skel-header{display:flex;align-items:center;gap:6px;direction:rtl;padding:4px 6px;background:#fff;border-bottom:1px solid #eee;}
.kwb-skel-bar{background:#e0e0e0;}
.kwb-skel-btn{background:#E82222;}
.kwb-skel-img{background:#e5e5e5;border-radius:2px;min-height:10px;}
.kwb-skel-hero{display:grid;grid-template-columns:2fr 3fr 2fr;gap:3px;}
.kwb-skel-hero-side{display:flex;flex-direction:column;gap:3px;}
.kwb-skel-hero-main{min-height:60px;}
.kwb-skel-articles{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:2px 0;}
.kwb-skel-article{display:flex;flex-direction:column;gap:3px;background:#fff;padding:3px;border-radius:2px;}
.kwb-skel-footer{background:#1a1a1a;padding:8px 10px;display:flex;flex-direction:column;align-items:center;gap:4px;border-radius:0 0 2px 2px;}
.kwb-template-info{padding:16px;text-align:right;}
.kwb-template-name{font-size:18px;font-weight:700;margin:0 0 4px;color:#371D12;}
.kwb-template-desc{font-size:13px;color:#888;margin:0 0 12px;}
.kwb-template-pages{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;justify-content:flex-end;}
.kwb-template-page-badge{font-size:12px;padding:4px 12px;border:1px solid #E0E0E0;border-radius:9999px;color:#555;}

/* ─── BUILDER ─── */
.kwb-builder{position:absolute;top:0;left:0;right:0;bottom:0;background:#F2F2F2;display:flex;flex-direction:column;z-index:50;}
.kwb-builder-top{display:flex;align-items:center;justify-content:center;padding:12px 16px;flex-shrink:0;position:relative;}
.kwb-undo-redo{position:absolute;left:16px;display:flex;gap:4px;}
.kwb-undo-btn{width:32px;height:32px;border:1.5px solid #E0E0E0;background:#fff;border-radius:8px;color:#666;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:all .15s;}
.kwb-undo-btn:hover:not(:disabled){border-color:#371D12;color:#371D12;background:#F8F8F8;}
.kwb-undo-btn:disabled{opacity:0.3;cursor:default;}
.kwb-device-toggle{display:flex;gap:4px;background:#fff;border:1.5px solid #E0E0E0;border-radius:10px;padding:3px;}
.kwb-device-btn{width:36px;height:32px;border:none;background:none;border-radius:7px;color:#BBB;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}
.kwb-device-btn:hover{color:#371D12;}
.kwb-device-active{background:#F0F0F0;color:#371D12;}

.kwb-builder-body{display:flex;flex-direction:row-reverse;flex:1;overflow:hidden;}

/* Preview */
.kwb-preview-area{flex:1;overflow-y:auto;display:flex;justify-content:center;padding:50px 20px 40px;}
.kwb-preview-frame{width:100%;max-width:1200px;background:var(--kwb-bg,#fff);border:1px solid #E0E0E0;overflow:visible;transition:max-width .3s;}
.kwb-preview-mobile{max-width:375px;}
.kwb-preview-mobile .kwb-p-hero-news{grid-template-columns:1fr;}
.kwb-preview-mobile .kwb-p-hero-main{order:-1;}
.kwb-preview-mobile .kwb-p-hero-side-r{flex-direction:row;order:1;}
.kwb-preview-mobile .kwb-p-hero-side-r .kwb-p-hero-side-card{min-width:0;flex:1;}
.kwb-preview-mobile .kwb-p-hero-side-l{display:none;}
.kwb-preview-mobile .kwb-p-hero-main-img{height:300px;}
.kwb-preview-mobile .kwb-p-nav{display:none;}
.kwb-preview-mobile .kwb-p-header-inner{justify-content:space-between;position:relative;}
.kwb-preview-mobile .kwb-p-header-actions{display:none;}
.kwb-preview-mobile .kwb-p-hamburger{display:flex;margin-inline-end:auto;position:absolute;left:16px;top:50%;transform:translateY(-50%);}
.kwb-preview-mobile .kwb-p-articles-grid{grid-template-columns:1fr;}
.kwb-preview-mobile .kwb-p-article-card{border-bottom:1px solid rgba(128,128,128,0.12);padding-bottom:16px;margin-bottom:8px;border-radius:0;}
.kwb-preview-mobile .kwb-p-article-img{aspect-ratio:16/9;border-radius:8px;}
.kwb-preview-mobile .kwb-p-article-title{font-size:18px;-webkit-line-clamp:3;}
.kwb-preview-mobile .kwb-p-article-excerpt{display:none;}
.kwb-preview-mobile .kwb-p-article-author-name{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;}
.kwb-preview-mobile .kwb-p-banner-grid{grid-template-columns:1fr;}
.kwb-preview-mobile .kwb-p-cta-inner{flex-direction:column;}
.kwb-preview-mobile .kwb-p-cta-form{min-width:unset;flex-direction:column;}
.kwb-preview-mobile .kwb-p-cta-form .kwb-p-email-input{border-right:1px solid #ddd;width:100%;height:52px;font-size:16px;}
.kwb-preview-mobile .kwb-p-cta-form .kwb-p-subscribe-btn{width:100%;}
.kwb-preview-mobile .kwb-p-footer-inner{flex-direction:column;gap:20px;}
.kwb-preview-mobile .kwb-p-footer-logo{font-size:36px;}
.kwb-preview-mobile .kwb-p-footer-form{flex-direction:column;}
.kwb-preview-mobile .kwb-p-footer-form .kwb-p-footer-email{border-right:1px solid #444;width:100%;height:52px;font-size:16px;}
.kwb-preview-mobile .kwb-p-footer-form .kwb-p-subscribe-btn{width:100%;}
.kwb-preview-mobile .kwb-p-ticker-inner{font-size:32px;}
.kwb-preview-mobile .kwb-p-gallery{display:none;}
.kwb-preview-mobile .kwb-p-catfeed{display:none;}
.kwb-preview-mobile .kwb-p-hero-sub-form{flex-direction:column;}
.kwb-preview-mobile .kwb-p-hero-sub-form .kwb-p-email-input{border-right:1px solid rgba(128,128,128,0.3);width:100%;height:52px;font-size:16px;}
.kwb-preview-mobile .kwb-p-hero-sub-form .kwb-p-subscribe-btn{width:100%;}
.kwb-preview-content{direction:rtl;text-align:right;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;color:var(--kwb-text-color,#1a1a1a);line-height:1.6;background:var(--kwb-bg,#fff);}

/* ─── PREVIEW COMPONENTS ─── */
/* Header */
.kwb-p-header{border-bottom:1px solid rgba(128,128,128,0.2);padding:0;background:var(--kwb-card-bg,#fff);}
.kwb-p-header-inner{display:flex;flex-direction:row;align-items:center;gap:20px;direction:rtl;justify-content:space-between;padding:12px 16px;max-width:100%;}
.kwb-p-logo-wrap{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.kwb-p-logo-img{height:28px;width:auto;object-fit:contain;display:block;}
.kwb-p-logo{font-size:18px;font-weight:800;color:var(--kwb-headline-color,#1a1a1a);white-space:nowrap;letter-spacing:-0.3px;}
.kwb-p-nav{display:flex;gap:20px;flex:1;justify-content:flex-start;}
.kwb-p-nav-link{font-size:16px;color:var(--kwb-text-color,#666);cursor:pointer;white-space:nowrap;font-weight:500;}
.kwb-p-nav-link:hover{color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-nav-link-active{color:var(--kwb-headline-color,#1a1a1a)!important;font-weight:700;}
.kwb-p-subscribe-btn{padding:0 24px;height:46px;border:none;border-radius:0;color:#fff;font-family:inherit;font-size:16px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;}
.kwb-p-darkmode-btn{width:28px;height:28px;border:1px solid rgba(128,128,128,0.2);background:transparent;font-size:14px;cursor:default;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--kwb-text-color,#666);}

/* Hamburger & Mobile Menu */
.kwb-p-hamburger{display:none;width:36px;height:36px;border:none;background:transparent;cursor:pointer;align-items:center;justify-content:center;color:var(--kwb-headline-color,#1a1a1a);flex-shrink:0;padding:0;}
.kwb-p-mobile-menu{border-top:1px solid rgba(128,128,128,0.15);padding:16px;display:flex;flex-direction:column;gap:12px;background:var(--kwb-card-bg,#fff);}
.kwb-p-mobile-nav{display:flex;flex-direction:column;gap:0;}
.kwb-p-mobile-nav-link{font-size:16px;font-weight:500;color:var(--kwb-text-color,#666);padding:12px 0;border-bottom:1px solid rgba(128,128,128,0.1);cursor:pointer;}
.kwb-p-mobile-nav-link:last-child{border-bottom:none;}
.kwb-p-mobile-menu-actions{display:flex;flex-direction:column;gap:8px;padding-top:8px;}
.kwb-p-mobile-menu-actions .kwb-p-login-btn{width:100%;height:44px;text-align:center;}
.kwb-p-mobile-menu-actions .kwb-p-subscribe-btn{width:100%;height:44px;text-align:center;}
.kwb-p-mobile-menu-actions .kwb-p-darkmode-btn{width:36px;height:36px;align-self:center;}

/* Hero Centered Header — now reuses .kwb-p-hero-sub */

/* Hero News Grid */
.kwb-p-hero-news{display:grid;grid-template-columns:3fr 5fr 3fr;gap:1px;background:rgba(128,128,128,0.2);}
.kwb-p-hero-side{display:flex;flex-direction:column;gap:1px;background:rgba(128,128,128,0.2);}
.kwb-p-hero-side-card{background:var(--kwb-card-bg,#fff);padding:14px;display:flex;flex-direction:column;gap:6px;flex:1;}
.kwb-p-hero-side-img{width:100%;height:220px;background:rgba(128,128,128,0.15);object-fit:cover;display:block;}
.kwb-p-hero-side-card h4{font-size:14px;font-weight:700;margin:0;line-height:1.5;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-hero-date{font-size:10px;color:var(--kwb-text-color,#999);opacity:0.7;}
.kwb-p-hero-main{background:var(--kwb-card-bg,#fff);padding:16px;display:flex;flex-direction:column;gap:8px;}
.kwb-p-hero-main-img{width:100%;height:100%;min-height:200px;background:rgba(128,128,128,0.15);object-fit:cover;display:block;}
.kwb-p-hero-main-title{font-size:24px;font-weight:800;margin:0;line-height:1.5;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-hero-main-excerpt{font-size:15px;color:var(--kwb-text-color,#666);margin:0;line-height:1.7;}
.kwb-p-hero-meta{display:flex;justify-content:space-between;font-size:10px;color:var(--kwb-text-color,#999);opacity:0.7;}
.kwb-p-hero-engagement{display:flex;gap:10px;align-items:center;}
.kwb-p-hero-engagement span{display:flex;align-items:center;gap:3px;}

/* Brands Ticker */
.kwb-p-ticker{overflow:hidden;border-top:2px solid var(--kwb-headline-color,#1a1a1a);border-bottom:2px solid var(--kwb-headline-color,#1a1a1a);padding:20px 0;}
.kwb-p-ticker-inner{display:flex;gap:24px;white-space:nowrap;font-size:52px;font-weight:900;color:var(--kwb-headline-color,#1a1a1a);animation:kwbTickerScroll 30s linear infinite;align-items:center;}
.kwb-p-ticker-headline{text-align:center;font-size:16px;font-weight:700;color:var(--kwb-headline-color,#1a1a1a);margin:0 0 12px;padding:0 16px;}
.kwb-p-ticker-brand{display:flex;align-items:center;gap:12px;flex-shrink:0;}
.kwb-p-ticker-logo{height:40px;width:auto;max-width:120px;object-fit:contain;}
@keyframes kwbTickerScroll{from{transform:translateX(100%)}to{transform:translateX(-100%)}}
.kwb-p-ticker-dot{color:var(--kwb-text-color,#ccc);opacity:0.5;}

/* CTA Newsletter */
.kwb-p-cta{padding:20px 16px;background:var(--kwb-card-bg,#f8f8f8);border-top:1px solid rgba(128,128,128,0.2);border-bottom:1px solid rgba(128,128,128,0.2);}
.kwb-p-cta-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;}
.kwb-p-cta-text{display:flex;align-items:center;gap:12px;}
.kwb-p-cta-logo{width:40px;height:40px;border-radius:50%;background:var(--kwb-headline-color,#1a1a1a);color:var(--kwb-bg,#fff);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0;}
.kwb-p-cta h3{font-size:18px;font-weight:700;margin:0;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-cta p{font-size:15px;color:var(--kwb-text-color,#888);margin:2px 0 0;}
.kwb-p-cta-form{display:flex;gap:0;flex:1;min-width:0;width:100%;}
.kwb-p-email-input{flex:1;height:48px;padding:0 18px;border:1px solid rgba(128,128,128,0.3);font-family:inherit;font-size:15px;outline:none;background:var(--kwb-card-bg,#fff);color:var(--kwb-text-color,#333);min-width:0;width:100%;direction:rtl;box-sizing:border-box;}
.kwb-p-email-input::placeholder{color:var(--kwb-text-color,#bbb);opacity:0.5;}

/* Hero Subscribe */
.kwb-p-hero-sub{padding:56px 16px;text-align:center;background:var(--kwb-card-bg,#f5f5f5);}
.kwb-p-hero-sub h2{font-size:36px;font-weight:800;margin:0 0 8px;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-hero-sub p{font-size:18px;color:var(--kwb-text-color,#666);margin:0 0 24px;}
.kwb-p-hero-sub-form{display:flex;gap:0;max-width:480px;width:100%;margin:0 auto;}
.kwb-p-header-hero-img-wrap{width:100px;height:100px;margin:0 auto 20px;border-radius:var(--kwb-radius,12px);overflow:hidden;background:var(--kwb-card-bg,#f0f0f0);display:flex;align-items:center;justify-content:center;}
.kwb-p-header-hero-img{width:100%;height:100%;object-fit:cover;}
.kwb-p-header-hero-img-ph{color:#bbb;display:flex;align-items:center;justify-content:center;width:100%;height:100%;}

/* Article Collection */
.kwb-p-articles{padding:24px 16px;background:var(--kwb-bg,#fff);}
.kwb-p-articles-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
.kwb-p-article-card{display:flex;flex-direction:column;gap:6px;cursor:pointer;transition:transform .15s,box-shadow .15s;border-radius:0;padding:8px;margin:-8px;}
.kwb-p-article-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08);}
.kwb-p-article-card-text{display:contents;}
.kwb-p-article-img{width:100%;aspect-ratio:16/9;background:rgba(128,128,128,0.15);}
/* NYT-style list layout (works at any viewport) */
.kwb-p-articles-mobile-list{grid-template-columns:1fr !important;}
.kwb-p-articles-mobile-list .kwb-p-article-card{flex-direction:row-reverse;gap:14px;border-bottom:1px solid rgba(128,128,128,0.12);padding:12px 0;margin:0;border-radius:0;}
.kwb-p-articles-mobile-list .kwb-p-article-card:hover{transform:none;box-shadow:none;}
.kwb-p-articles-mobile-list .kwb-p-article-img{width:110px;height:110px;min-height:unset;flex-shrink:0;aspect-ratio:1;}
.kwb-p-articles-mobile-list .kwb-p-article-card-text{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;}
.kwb-p-articles-mobile-list .kwb-p-article-title{font-size:16px;font-weight:700;-webkit-line-clamp:3;}
.kwb-p-articles-mobile-list .kwb-p-article-excerpt{font-size:13px;color:var(--kwb-text-color,#666);line-height:1.5;-webkit-line-clamp:2;}
.kwb-p-articles-mobile-list .kwb-p-article-author-name{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;color:var(--kwb-text-color,#888);}
.kwb-p-articles-mobile-list .kwb-p-article-meta{font-size:10px;}
.kwb-p-article-title{font-size:15px;font-weight:700;margin:0;line-height:1.5;color:var(--kwb-headline-color,#1a1a1a);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.kwb-p-article-excerpt{font-size:13px;color:var(--kwb-text-color,#888);opacity:0.8;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.kwb-p-article-author-row{display:flex;align-items:center;gap:6px;margin-top:2px;}
.kwb-p-article-avatar{width:24px;height:24px;border-radius:50%;background:rgba(128,128,128,0.15);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10px;color:var(--kwb-text-color,#888);flex-shrink:0;}
.kwb-p-article-author-name{font-size:13px;font-weight:600;color:var(--kwb-text-color,#555);}
.kwb-p-article-engagement{display:flex;gap:8px;align-items:center;}
.kwb-p-article-engagement span{display:flex;align-items:center;gap:2px;}
.kwb-p-hero-card-footer{display:flex;flex-direction:column;gap:4px;margin-top:auto;}
.kwb-p-article-meta{display:flex;justify-content:space-between;font-size:12px;color:var(--kwb-text-color,#999);opacity:0.7;align-items:center;}
.kwb-p-article-meta span{display:flex;align-items:center;gap:3px;}
.kwb-p-all-articles{display:block;margin-top:16px;font-size:13px;color:var(--kwb-headline-color,#1a1a1a);font-weight:600;text-decoration:none;}

/* Banners */
.kwb-p-banners{padding:0;}
.kwb-p-banner-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(128,128,128,0.2);}
.kwb-p-banner-card{padding:28px 20px;color:#fff;display:flex;flex-direction:column;gap:8px;min-height:140px;justify-content:flex-end;position:relative;}
.kwb-p-banner-card-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.4);pointer-events:none;}
.kwb-p-banner-card span{font-size:15px;font-weight:700;position:relative;z-index:1;}
.kwb-p-banner-card a{font-size:12px;color:rgba(255,255,255,0.8);text-decoration:underline;cursor:pointer;position:relative;z-index:1;}

/* Footer */
.kwb-p-footer{background:var(--kwb-headline-color,#1a1a1a);color:var(--kwb-bg,#fff);padding:40px 16px 0;}
.kwb-p-footer-inner{display:flex;gap:40px;flex-wrap:wrap;}
.kwb-p-footer-logo-col{flex:1;min-width:150px;}
.kwb-p-footer-logo{font-size:42px;font-weight:900;line-height:1.1;display:block;}
.kwb-p-footer-logo-img{height:60px;width:auto;object-fit:contain;display:block;margin-bottom:8px;}
.kwb-p-footer-right{flex:1;min-width:250px;}
.kwb-p-footer-tagline{font-size:12px;color:var(--kwb-bg,#fff);opacity:0.6;margin:0 0 14px;}
.kwb-p-footer-form{display:flex;gap:0;margin-bottom:16px;}
.kwb-p-footer-email{flex:1;height:46px;padding:0 16px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:var(--kwb-bg,#fff);font-family:inherit;font-size:14px;outline:none;min-width:0;direction:rtl;}
.kwb-p-footer-email::placeholder{color:var(--kwb-bg,#fff);opacity:0.4;}
.kwb-p-footer-nav{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;}
.kwb-p-footer-nav a{font-size:12px;color:var(--kwb-bg,#fff);opacity:0.6;cursor:pointer;text-decoration:none;}
.kwb-p-footer-nav a:hover{opacity:1;}
.kwb-p-footer-bottom{border-top:1px solid rgba(255,255,255,0.15);padding:16px 0;text-align:center;font-size:11px;color:var(--kwb-bg,#fff);opacity:0.4;}

/* Article View */
.kwb-p-article-view{padding:0;}
.kwb-p-av-header{padding:28px 16px 16px;}
.kwb-p-av-category{font-size:12px;font-weight:700;color:var(--kwb-btn-color,#E82222);text-transform:uppercase;letter-spacing:0.5px;}
.kwb-p-av-title{font-size:32px;font-weight:900;line-height:1.4;margin:8px 0 16px;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-av-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.kwb-p-av-author{display:flex;align-items:center;gap:10px;}
.kwb-p-av-avatar{width:36px;height:36px;border-radius:50%;background:rgba(128,128,128,0.15);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:var(--kwb-text-color,#888);flex-shrink:0;}
.kwb-p-av-author-name{font-size:16px;font-weight:700;color:var(--kwb-headline-color,#1a1a1a);display:block;}
.kwb-p-av-date{font-size:11px;color:var(--kwb-text-color,#999);opacity:0.7;display:block;margin-top:1px;}
.kwb-p-av-actions{display:flex;gap:12px;align-items:center;font-size:12px;color:var(--kwb-text-color,#999);opacity:0.7;}
.kwb-p-av-actions span{display:flex;align-items:center;gap:3px;cursor:pointer;}
.kwb-p-av-actions span:hover{color:var(--kwb-headline-color,#1a1a1a);opacity:1;}
.kwb-p-av-cover{width:100%;height:240px;background:rgba(128,128,128,0.15);}
.kwb-p-av-body{padding:24px 16px;max-width:600px;margin:0 auto;}
.kwb-p-av-body p{font-size:17px;line-height:1.9;color:var(--kwb-text-color,#333);margin:0 0 16px;}
.kwb-p-av-body h3{font-size:22px;font-weight:800;color:var(--kwb-headline-color,#1a1a1a);margin:24px 0 12px;}
.kwb-p-av-quote{border-right:3px solid var(--kwb-btn-color,#E82222);padding:12px 16px;margin:20px 0;background:var(--kwb-card-bg,#fafafa);font-size:14px;font-style:italic;color:var(--kwb-text-color,#555);line-height:1.8;}
.kwb-p-av-footer-actions{padding:16px 16px 24px;border-top:1px solid rgba(128,128,128,0.15);}
.kwb-p-av-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;}
.kwb-p-av-tag{font-size:11px;padding:4px 12px;border:1px solid rgba(128,128,128,0.2);color:var(--kwb-text-color,#555);background:var(--kwb-card-bg,#f8f8f8);}
.kwb-p-av-engagement{display:flex;gap:16px;font-size:12px;color:var(--kwb-text-color,#999);opacity:0.7;align-items:center;}
.kwb-p-av-engagement span{display:flex;align-items:center;gap:3px;}

/* Text Block */
.kwb-p-text-block{padding:20px 16px;max-width:700px;margin:0 auto;}
.kwb-p-text-block p{font-size:17px;line-height:1.9;color:var(--kwb-text-color,#333);margin:0;white-space:pre-wrap;}
/* Image Block */
.kwb-p-image-block{padding:20px 16px;}
.kwb-p-image-full{width:100%;display:block;}
.kwb-p-image-placeholder{width:100%;height:200px;background:rgba(128,128,128,0.15);display:flex;align-items:center;justify-content:center;color:var(--kwb-text-color,#ccc);opacity:0.4;}
.kwb-p-image-caption{font-size:12px;color:var(--kwb-text-color,#999);opacity:0.7;text-align:center;margin:8px 0 0;}
/* Subscribe Form */
.kwb-p-subscribe-form{padding:40px 16px;text-align:center;background:var(--kwb-card-bg,#f5f5f5);}
.kwb-p-subscribe-form h3{font-size:22px;font-weight:700;margin:0 0 16px;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-sf-row{display:flex;gap:0;max-width:480px;width:100%;margin:0 auto;}
/* Contact Form */
.kwb-p-contact-form{padding:40px 16px;max-width:500px;margin:0 auto;}
.kwb-p-contact-form h3{font-size:22px;font-weight:700;margin:0 0 16px;color:var(--kwb-headline-color,#1a1a1a);text-align:center;}
.kwb-p-cf-fields{display:flex;flex-direction:column;gap:10px;}
.kwb-p-cf-input{width:100%;height:42px;padding:0 14px;border:1px solid rgba(128,128,128,0.3);font-family:inherit;font-size:13px;outline:none;background:var(--kwb-card-bg,#fff);color:var(--kwb-text-color,#333);direction:rtl;}
.kwb-p-cf-textarea{width:100%;padding:10px 14px;border:1px solid rgba(128,128,128,0.3);font-family:inherit;font-size:13px;outline:none;background:var(--kwb-card-bg,#fff);color:var(--kwb-text-color,#333);direction:rtl;resize:vertical;}
.kwb-p-cf-btn{width:100%;height:42px;}
/* Divider */
.kwb-p-divider{border:none;border-top:1px solid rgba(128,128,128,0.2);margin:20px 16px;}

/* Rich Text */
.kwb-p-rich-text{padding:20px 16px;max-width:700px;margin:0 auto;}
.kwb-p-rich-text-content{color:var(--kwb-text-color,#333);line-height:1.9;font-size:17px;}
.kwb-p-rich-text-content h1,.kwb-p-rich-text-content h2,.kwb-p-rich-text-content h3{color:var(--kwb-headline-color,#1a1a1a);margin:20px 0 10px;font-weight:800;}
.kwb-p-rich-text-content h1{font-size:24px;}.kwb-p-rich-text-content h2{font-size:20px;}.kwb-p-rich-text-content h3{font-size:17px;}
.kwb-p-rich-text-content p{margin:0 0 12px;}
.kwb-p-rich-text-content ul,.kwb-p-rich-text-content ol{margin:0 0 12px;padding-right:20px;}
.kwb-p-rich-text-content li{margin:4px 0;}
.kwb-p-rich-text-content a{color:var(--kwb-link-color,#E82222);text-decoration:underline;}
.kwb-p-rich-text-content img{max-width:100%;height:auto;margin:12px 0;border-radius:4px;}
.kwb-p-rich-text-content blockquote{border-right:3px solid var(--kwb-btn-color,#E82222);padding:12px 16px;margin:16px 0;background:var(--kwb-card-bg,#f8f8f8);font-style:italic;}
.kwb-p-rich-text-content hr{border:none;border-top:1px solid rgba(128,128,128,0.2);margin:20px 0;}
.kwb-p-rich-text-content button{font-family:inherit;border-radius:4px;}

/* Rich text editor toolbar */
.kwb-rich-toolbar{display:flex;gap:2px;flex-wrap:wrap;margin-bottom:6px;padding:4px;background:#f5f5f5;border-radius:8px;}
.kwb-rich-toolbar button{width:28px;height:28px;border:none;background:transparent;cursor:pointer;border-radius:4px;font-size:13px;display:flex;align-items:center;justify-content:center;color:#555;}
.kwb-rich-toolbar button:hover{background:#e0e0e0;}
.kwb-rte-textarea{height:180px!important;padding-top:10px!important;resize:vertical;font-family:monospace!important;font-size:12px!important;line-height:1.5!important;white-space:pre-wrap;}

/* Testimonial image */
.kwb-p-testi-img{width:48px;height:48px;border-radius:50%;object-fit:cover;}

/* Subscribe Popup */
.kwb-subscribe-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;}
.kwb-subscribe-popup{position:relative;background:#fff;border-radius:16px;padding:40px 32px;max-width:400px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:kwbPopupIn .2s ease-out;}
@keyframes kwbPopupIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
.kwb-subscribe-popup-close{position:absolute;top:12px;left:12px;width:32px;height:32px;border:none;background:#f0f0f0;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#888;}
.kwb-subscribe-popup-close:hover{background:#e0e0e0;color:#333;}
.kwb-subscribe-popup-icon{width:56px;height:56px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px;margin:0 auto 16px;}
.kwb-subscribe-popup-title{font-size:20px;font-weight:800;margin:0 0 8px;color:#1a1a1a;}
.kwb-subscribe-popup-desc{font-size:14px;color:#666;margin:0 0 24px;line-height:1.6;}
.kwb-subscribe-popup-form{display:flex;flex-direction:column;gap:10px;}
.kwb-subscribe-popup-email{width:100%;height:48px;padding:0 16px;border:1.5px solid #E0E0E0;border-radius:10px;font-family:inherit;font-size:15px;outline:none;direction:rtl;text-align:right;}
.kwb-subscribe-popup-email:focus{border-color:#999;}
.kwb-subscribe-popup-btn{width:100%;height:48px;border:none;border-radius:10px;color:#fff;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;}

/* Header actions group (subscribe + dark mode) */
.kwb-p-header-actions{display:flex;align-items:center;gap:8px;margin-inline-start:auto;}

/* Mini preview for rich_text */
.kwb-mc-rich-text{background:#fafafa;border-radius:2px;}
.kwb-mc-rich-text::before{content:'';position:absolute;top:15%;left:15%;width:70%;height:3px;background:#ddd;border-radius:2px;}
.kwb-mc-rich-text::after{content:'';position:absolute;bottom:25%;left:20%;width:50%;height:3px;background:#ccc;border-radius:2px;}

/* Section shared */
.kwb-p-section{padding:24px 16px;}
.kwb-p-section-title{font-size:22px;font-weight:800;margin:0 0 16px;color:var(--kwb-headline-color,#1a1a1a);}

/* Testimonials */
.kwb-p-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.kwb-p-testi-list{display:flex;flex-direction:column;gap:12px;}
.kwb-p-testi-card{background:var(--kwb-card-bg,#f8f8f8);padding:16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;border:1px solid rgba(128,128,128,0.1);}
.kwb-p-testi-avatar{width:36px;height:36px;border-radius:50%;background:rgba(128,128,128,0.15);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:var(--kwb-text-color,#888);}
.kwb-p-testi-text{font-size:15px;color:var(--kwb-text-color,#555);line-height:1.7;margin:0;font-style:italic;}
.kwb-p-testi-name{font-size:12px;font-weight:700;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-testi-role{font-size:10px;color:var(--kwb-text-color,#999);opacity:0.7;}

/* Products */
.kwb-p-products-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.kwb-p-products-list{display:flex;flex-direction:column;gap:12px;}
.kwb-p-product-card{display:flex;flex-direction:column;gap:6px;}
.kwb-p-product-img{width:100%;height:120px;background:rgba(128,128,128,0.15);display:flex;align-items:center;justify-content:center;color:var(--kwb-text-color,#ccc);opacity:0.4;}
.kwb-p-product-title{font-size:13px;font-weight:700;margin:0;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-product-subtitle{font-size:11px;color:var(--kwb-text-color,#888);margin:0;}
.kwb-p-product-price{font-size:14px;font-weight:800;color:var(--kwb-headline-color,#1a1a1a);}

/* Movies */
.kwb-p-movies-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:20px;}
.kwb-p-movie-card{display:flex;flex-direction:column;gap:0;overflow:hidden;transition:transform .15s;cursor:pointer;}
.kwb-p-movie-card:hover{transform:translateY(-2px);}
.kwb-p-movie-poster{width:100%;aspect-ratio:2/3;background:rgba(128,128,128,0.12);overflow:hidden;border-radius:var(--kwb-radius,0);}
.kwb-p-movie-poster img{width:100%;height:100%;object-fit:cover;display:block;}
.kwb-p-movie-poster-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;}
.kwb-p-movie-info{padding:8px 0;}
.kwb-p-movie-title{font-size:13px;font-weight:700;margin:0;color:var(--kwb-headline-color,#1a1a1a);line-height:1.4;}
.kwb-p-movie-subtitle{font-size:11px;color:var(--kwb-text-color,#888);margin:4px 0 0;line-height:1.5;}
.kwb-p-movie-btn{display:inline-block;padding:6px 16px;color:#fff;font-size:11px;font-weight:600;border-radius:var(--kwb-radius,4px);margin-top:6px;text-align:center;}

/* Rich Text WYSIWYG Toolbar */
.kwb-p-rte-toolbar{display:flex;gap:2px;flex-wrap:wrap;padding:6px 8px;background:var(--kwb-card-bg,#f5f5f5);border:1px solid rgba(128,128,128,0.2);border-bottom:none;}
.kwb-p-rte-toolbar button{width:30px;height:30px;border:none;background:transparent;cursor:pointer;border-radius:4px;font-size:13px;display:flex;align-items:center;justify-content:center;color:var(--kwb-text-color,#555);font-family:inherit;}
.kwb-p-rte-toolbar button:hover{background:rgba(128,128,128,0.15);}
.kwb-p-rte-sep{width:1px;height:24px;background:rgba(128,128,128,0.2);margin:3px 4px;align-self:center;}
.kwb-p-rte-editable{min-height:120px;padding:16px;border:1px solid rgba(128,128,128,0.2);outline:none;cursor:text;}
.kwb-p-rte-editable:focus{border-color:var(--kwb-btn-color,#E82222);box-shadow:0 0 0 2px rgba(232,34,34,0.1);}

/* Podcast */
.kwb-p-podcast-list{display:flex;flex-direction:column;gap:1px;background:rgba(128,128,128,0.2);}
.kwb-p-podcast-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.kwb-p-podcast-grid .kwb-p-podcast-card{border:1px solid rgba(128,128,128,0.2);border-radius:8px;flex-direction:column;}
.kwb-p-podcast-card{display:flex;gap:12px;padding:12px;background:var(--kwb-card-bg,#fff);}
.kwb-p-podcast-img{width:60px;height:60px;background:rgba(128,128,128,0.15);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--kwb-text-color,#ccc);opacity:0.4;}
.kwb-p-podcast-info{flex:1;display:flex;flex-direction:column;gap:2px;}
.kwb-p-podcast-title{font-size:13px;font-weight:700;margin:0;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-podcast-subtitle{font-size:11px;color:var(--kwb-text-color,#888);margin:0;}
.kwb-p-podcast-duration{font-size:10px;color:var(--kwb-text-color,#999);opacity:0.7;}
.kwb-p-podcast-program{display:flex;gap:12px;align-items:center;margin-bottom:8px;}
.kwb-p-podcast-prog-img{width:48px;height:48px;background:rgba(128,128,128,0.15);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--kwb-text-color,#ccc);border-radius:50%;}
.kwb-p-podcast-prog-name{font-size:14px;font-weight:700;margin:0;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-podcast-prog-desc{font-size:11px;color:var(--kwb-text-color,#888);margin:2px 0 0;}
/* Podcast Featured Layout */
.kwb-p-podcast-featured-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;}
.kwb-p-podcast-featured-card{display:flex;flex-direction:column;border:1px solid rgba(128,128,128,0.15);background:var(--kwb-card-bg,#fff);overflow:hidden;transition:all .15s;}
.kwb-p-podcast-featured-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);transform:translateY(-2px);}
.kwb-p-podcast-featured-cover{width:100%;aspect-ratio:1;overflow:hidden;background:rgba(128,128,128,0.08);}
.kwb-p-podcast-featured-cover img{width:100%;height:100%;object-fit:cover;}
.kwb-p-podcast-featured-cover-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--kwb-text-color,#ccc);opacity:0.4;background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(139,92,246,0.02));}
.kwb-p-podcast-featured-info{padding:14px;display:flex;flex-direction:column;gap:4px;}
.kwb-p-podcast-featured-name{font-size:15px;font-weight:700;margin:0;color:var(--kwb-headline-color,#1a1a1a);line-height:1.4;}
.kwb-p-podcast-featured-desc{font-size:12px;color:var(--kwb-text-color,#888);margin:0;line-height:1.5;}
.kwb-p-podcast-featured-eps{font-size:11px;color:var(--kwb-text-color,#999);font-weight:600;margin-top:4px;opacity:0.7;}
.kwb-p-podcast-ep-num{width:28px;height:28px;background:rgba(128,128,128,0.1);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:var(--kwb-text-color,#888);flex-shrink:0;}

/* Courses */
.kwb-p-courses-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.kwb-p-courses-list{display:flex;flex-direction:column;gap:12px;}
.kwb-p-course-card{display:flex;flex-direction:column;gap:6px;}
.kwb-p-course-img{width:100%;height:100px;background:rgba(128,128,128,0.15);display:flex;align-items:center;justify-content:center;color:var(--kwb-text-color,#ccc);opacity:0.4;}

/* Topics */
.kwb-p-topics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.kwb-p-topics-list{display:flex;flex-direction:column;gap:8px;}
.kwb-p-topic-card{padding:16px;background:var(--kwb-card-bg,#f5f5f5);text-align:center;border:1px solid rgba(128,128,128,0.2);}
.kwb-p-topic-name{font-size:13px;font-weight:700;color:var(--kwb-headline-color,#1a1a1a);}

/* Placeholder component */
.kwb-p-placeholder{padding:32px;background:var(--kwb-card-bg,#f8f8f8);border:2px dashed rgba(128,128,128,0.2);text-align:center;color:var(--kwb-text-color,#bbb);opacity:0.5;font-size:14px;font-weight:600;}

/* ─── SIDEBAR ─── */
.kwb-sidebar{width:380px;background:#fff;border-left:1px solid #E8E8E8;display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;}
.kwb-sidebar-top-btns-col{display:flex;flex-direction:column;gap:8px;padding:12px 16px 0;}
.kwb-back-builder-btn{display:flex;align-items:center;gap:4px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:500;color:#999;cursor:pointer;padding:0;transition:color .15s;}
.kwb-back-builder-btn:hover{color:#371D12;}
.kwb-sidebar-top-btns{display:flex;gap:8px;}
.kwb-sidebar-tabs{display:flex;border-bottom:1px solid #E8E8E8;margin-top:12px;}
.kwb-stab{flex:1;padding:10px 0;border:none;background:none;font-family:inherit;font-size:13px;font-weight:600;color:#999;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;}
.kwb-stab:hover{color:#371D12;}
.kwb-stab-active{color:#371D12;border-bottom-color:#371D12;}
.kwb-sidebar-body{flex:1;overflow-y:auto;padding:20px;}

/* Sidebar sections */
.kwb-sb-branding,.kwb-sb-components,.kwb-sb-pages{display:flex;flex-direction:column;gap:12px;}
.kwb-upload-area,.kwb-upload-area-sm{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:2px dashed #E0E0E0;border-radius:10px;color:#CCC;font-size:13px;cursor:pointer;}
.kwb-upload-area{padding:24px;}
.kwb-upload-area-sm{padding:16px;}
.kwb-logo-layout-options{display:flex;gap:6px;}
.kwb-logo-layout-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border:1.5px solid #E8E8E8;border-radius:10px;background:#fff;font-family:inherit;font-size:11px;font-weight:600;color:#888;cursor:pointer;transition:all .15s;}
.kwb-logo-layout-btn:hover{border-color:#BBB;color:#371D12;}
.kwb-logo-layout-active{border-color:#0000FF;color:#371D12;background:#F0F0FF;}
.kwb-logo-layout-icon{display:flex;align-items:center;gap:4px;font-size:14px;font-weight:800;color:inherit;}
.kwb-color-presets{display:flex;gap:8px;margin-top:4px;}
.kwb-color-swatch{width:36px;height:36px;border-radius:10px;border:3px solid transparent;cursor:pointer;transition:border .15s;padding:0;}
.kwb-color-swatch:hover{opacity:0.8;}
.kwb-color-active{border-color:#371D12;}
/* Color row controls */
/* Color theme grid */
.kwb-theme-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:8px;max-height:320px;overflow-y:auto;padding-bottom:4px;}
.kwb-theme-card{display:flex;flex-direction:column;align-items:center;gap:4px;border:1.5px solid #E8E8E8;border-radius:10px;padding:6px 4px;background:#fff;cursor:pointer;transition:all .15s;position:relative;}
.kwb-theme-card:hover{border-color:#bbb;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.kwb-theme-active{border-color:#371D12;box-shadow:0 0 0 2px rgba(55,29,18,0.12);}
.kwb-theme-preview{width:100%;height:52px;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;border:1px solid #f0f0f0;}
.kwb-theme-p-header{display:flex;align-items:center;justify-content:space-between;padding:3px 4px;border-bottom:1px solid rgba(0,0,0,0.06);}
.kwb-theme-p-bar{border-radius:1px;}
.kwb-theme-p-btn{border-radius:1.5px;}
.kwb-theme-p-body{display:flex;flex-direction:column;align-items:center;gap:2px;padding:3px 4px;flex:1;}
.kwb-theme-p-cards{display:flex;gap:2px;padding:0 3px 3px;width:100%;}
.kwb-theme-p-card{flex:1;border:1px solid #e8e8e8;border-radius:2px;padding:2px;display:flex;flex-direction:column;gap:2px;}
.kwb-theme-name{font-size:10px;font-weight:600;color:#555;text-align:center;line-height:1;}
.kwb-theme-dots{display:flex;gap:2px;justify-content:center;}
.kwb-theme-dot-sm{width:6px;height:6px;border-radius:50%;}

/* Manual color details */
.kwb-color-details{margin-top:12px;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;}
.kwb-color-summary{font-size:12px;font-weight:600;color:#888;cursor:pointer;padding:10px 12px;background:#fafafa;list-style:none;display:flex;align-items:center;gap:6px;direction:rtl;}
.kwb-color-summary::-webkit-details-marker{display:none;}
.kwb-color-summary::before{content:"◂";font-size:10px;transition:transform .15s;}
[open]>.kwb-color-summary::before{transform:rotate(-90deg);}
.kwb-color-manual{padding:8px 12px;}
.kwb-color-hex{font-size:11px;color:#999;font-family:monospace;direction:ltr;}

.kwb-color-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #F0F0F0;}
.kwb-color-row:last-of-type{border-bottom:none;}
.kwb-color-row-label{font-size:12px;color:#666;white-space:nowrap;min-width:70px;}
.kwb-color-row-controls{display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
.kwb-color-dot{width:24px;height:24px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:all .15s;padding:0;flex-shrink:0;outline:none;-webkit-appearance:none;appearance:none;}
.kwb-color-dot:hover{transform:scale(1.15);}
.kwb-color-dot-active{border-color:#371D12;box-shadow:0 0 0 2px rgba(55,29,18,0.15);}
.kwb-color-input{width:28px;height:28px;border:1px solid #E0E0E0;border-radius:50%;cursor:pointer;padding:0;background:none;flex-shrink:0;-webkit-appearance:none;appearance:none;}
.kwb-color-input::-webkit-color-swatch-wrapper{padding:2px;}
.kwb-color-input::-webkit-color-swatch{border:none;border-radius:50%;}
.kwb-color-input::-moz-color-swatch{border:none;border-radius:50%;}
.kwb-hint{font-size:12px;color:#999;margin:4px 0 0;}

/* Nav links editor */
.kwb-nav-links-list{display:flex;flex-direction:column;gap:6px;}
.kwb-nav-link-item{border:1px solid #E8E8E8;border-radius:8px;padding:8px 10px;background:#FAFAFA;}
.kwb-nav-link-top{display:flex;align-items:center;gap:6px;}
.kwb-nav-link-config{display:flex;gap:6px;margin-top:6px;}
.kwb-nav-link-config select,.kwb-nav-link-config input{flex:1;}
.kwb-input-sm{height:32px!important;font-size:12px!important;padding:0 8px!important;}
.kwb-icon-btn-sm{width:32px;height:32px;border:1px solid #E0E0E0;border-radius:6px;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;color:#888;flex-shrink:0;padding:0;}
.kwb-icon-btn-sm:hover{background:#f0f0f0;color:#333;}

/* Component row */
.kwb-comp-row{border:1.5px solid #F0F0F0;border-radius:10px;overflow:hidden;margin-bottom:6px;transition:all .15s;}
.kwb-comp-row:hover{border-color:#E0E0E0;}
.kwb-comp-row-disabled{opacity:0.45;}
.kwb-comp-row-active{border-color:#0000FF;background:#F5F5FF;box-shadow:0 0 0 1px rgba(0,0,255,0.1);}
.kwb-comp-header{display:flex;align-items:center;gap:6px;padding:8px 10px;}
.kwb-comp-name{flex:1;font-size:13px;font-weight:600;color:#371D12;text-align:right;}
.kwb-comp-edit-btn{width:28px;height:28px;border:none;background:none;color:#BBB;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center;padding:0;}
.kwb-comp-edit-btn:hover{background:#F0F0F0;color:#371D12;}
.kwb-comp-actions{display:flex;gap:2px;align-items:center;flex-shrink:0;}
.kwb-comp-move-btn{width:32px;height:32px;border:none;background:none;color:#CCC;cursor:pointer;border-radius:5px;display:flex;align-items:center;justify-content:center;padding:0;transition:all .15s;}
.kwb-comp-move-btn:hover{background:#F0F0F0;color:#371D12;}
.kwb-comp-delete-btn{width:32px;height:32px;border:none;background:none;color:#DDD;cursor:pointer;border-radius:5px;display:flex;align-items:center;justify-content:center;padding:0;transition:all .15s;}
.kwb-comp-delete-btn:hover{background:#FEF2F2;color:#E82222;}
.kwb-comp-delete-btn svg{width:12px;height:12px;}
.kwb-upload-preview{position:relative;border-radius:10px;overflow:hidden;border:1.5px solid #E0E0E0;}
.kwb-upload-preview img{width:100%;height:80px;object-fit:contain;background:#FAFAFA;display:block;}
.kwb-upload-remove{position:absolute;top:4px;left:4px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(0,0,0,0.5);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}
.kwb-upload-remove svg{width:10px;height:10px;}
.kwb-page-actions{display:flex;gap:2px;align-items:center;}
.kwb-comp-settings{padding:0 16px 16px;border-top:1px solid #F0F0F0;margin-top:4px;padding-top:12px;animation:kwbSlideIn .15s ease-out;}
@keyframes kwbSlideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

/* Add component */
.kwb-add-comp-section{margin-top:16px;padding-top:16px;border-top:1px solid #F0F0F0;}
.kwb-comp-sticky-footer{position:relative;background:#fff;padding:10px 16px;border-top:1px solid #E8E8E8;flex-shrink:0;}
.kwb-add-comp-dropdown{position:absolute;bottom:100%;left:0;right:0;background:#fff;border:1px solid #E8E8E8;border-bottom:none;border-radius:12px 12px 0 0;box-shadow:0 -4px 20px rgba(0,0,0,0.1);padding:8px;max-height:40vh;overflow-y:auto;z-index:10;}
.kwb-add-comp-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.kwb-add-comp-card{display:flex;flex-direction:column;align-items:center;gap:8px;border:1.5px solid rgba(0,0,0,0.06);border-radius:14px;background:rgba(255,255,255,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;transition:all .2s ease;overflow:hidden;text-align:center;padding:16px 8px 14px;font-family:"IBM Plex Sans Arabic",system-ui,sans-serif;}
.kwb-add-comp-card:hover{border-color:rgba(99,102,241,0.4);background:rgba(255,255,255,0.9);box-shadow:0 4px 16px rgba(99,102,241,0.1);transform:translateY(-1px);}
.kwb-add-comp-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.8);border-radius:10px;border:1px solid rgba(0,0,0,0.06);flex-shrink:0;}
.kwb-add-comp-icon svg{width:20px;height:20px;}
.kwb-add-comp-card:hover .kwb-add-comp-icon{border-color:rgba(99,102,241,0.3);background:#fff;box-shadow:0 2px 8px rgba(99,102,241,0.08);}
.kwb-add-comp-name{font-family:inherit;font-size:11.5px;font-weight:600;color:#444;line-height:1.3;}
.kwb-add-comp-card:hover .kwb-add-comp-name{color:#1a1a1a;}

/* CSS-only mini layout previews */
.kwb-mc-auto{width:100%;height:100%;position:relative;}
.kwb-mc-hero-news{background:linear-gradient(to left,#e0e0e0 60%,transparent 60%);border-radius:2px;}
.kwb-mc-hero-news::before,.kwb-mc-hero-news::after{content:'';position:absolute;right:0;width:35%;background:#e8e8e8;border-radius:2px;}
.kwb-mc-hero-news::before{top:0;height:45%;}
.kwb-mc-hero-news::after{bottom:0;height:45%;}
.kwb-mc-hero-subscribe{background:#fafafa;border-radius:2px;}
.kwb-mc-hero-subscribe::before{content:'';position:absolute;top:25%;left:25%;width:50%;height:3px;background:#ddd;border-radius:2px;}
.kwb-mc-hero-subscribe::after{content:'';position:absolute;bottom:20%;left:20%;width:60%;height:8px;background:#E82222;border-radius:2px;opacity:.5;}
.kwb-mc-banner{background:linear-gradient(135deg,#e8e8e8,#f0f0f0);border-radius:2px;}
.kwb-mc-cta-newsletter{background:#fafafa;border-radius:2px;}
.kwb-mc-cta-newsletter::before{content:'';position:absolute;top:20%;left:20%;width:60%;height:3px;background:#ddd;border-radius:2px;}
.kwb-mc-cta-newsletter::after{content:'';position:absolute;bottom:20%;left:15%;width:70%;height:8px;background:#E82222;border-radius:2px;opacity:.4;}
.kwb-mc-article-collection{display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:2px;}
.kwb-mc-article-collection::before,.kwb-mc-article-collection::after{content:'';background:#e8e8e8;border-radius:2px;height:16px;}
.kwb-mc-brands-ticker{background:#f0f0f0;border-radius:2px;}
.kwb-mc-brands-ticker::after{content:'';position:absolute;top:40%;left:10%;width:80%;height:4px;background:#ccc;border-radius:2px;}
.kwb-mc-testimonials{display:flex;gap:4px;padding:2px;}
.kwb-mc-testimonials::before,.kwb-mc-testimonials::after{content:'';flex:1;height:28px;background:#f0f0f0;border-radius:3px;border-right:2px solid #ddd;}
.kwb-mc-products{display:flex;gap:3px;padding:2px;}
.kwb-mc-products::before,.kwb-mc-products::after{content:'';flex:1;height:28px;background:#e8e8e8;border-radius:3px;}
.kwb-mc-podcast{display:flex;gap:5px;direction:rtl;align-items:center;padding:4px;}
.kwb-mc-podcast::before{content:'';width:24px;height:24px;background:#e0e0e0;border-radius:4px;flex-shrink:0;}
.kwb-mc-podcast::after{content:'';flex:1;height:3px;background:#ddd;border-radius:2px;}
.kwb-mc-courses{display:flex;gap:3px;padding:2px;}
.kwb-mc-courses::before,.kwb-mc-courses::after{content:'';flex:1;height:28px;background:#e8e8e8;border-radius:3px;}
.kwb-mc-topics{display:flex;flex-wrap:wrap;gap:2px;justify-content:center;padding:4px;}
.kwb-mc-topics::before{content:'';width:20px;height:10px;background:#e8e8e8;border-radius:8px;}
.kwb-mc-topics::after{content:'';width:20px;height:10px;background:#e8e8e8;border-radius:8px;}
.kwb-mc-text-block{display:flex;flex-direction:column;gap:3px;direction:rtl;padding:4px;}
.kwb-mc-text-block::before{content:'';width:100%;height:3px;background:#ddd;border-radius:2px;}
.kwb-mc-text-block::after{content:'';width:70%;height:3px;background:#ddd;border-radius:2px;}
.kwb-mc-image-block{background:#e8e8e8;border-radius:2px;}
.kwb-mc-subscribe-form{background:#fafafa;border-radius:2px;}
.kwb-mc-subscribe-form::before{content:'';position:absolute;top:30%;left:15%;width:70%;height:6px;background:#eee;border:1px solid #ddd;border-radius:2px;}
.kwb-mc-subscribe-form::after{content:'';position:absolute;bottom:20%;left:25%;width:50%;height:8px;background:#E82222;border-radius:2px;opacity:.5;}
.kwb-mc-contact-form{background:#fafafa;border-radius:2px;}
.kwb-mc-contact-form::before{content:'';position:absolute;top:20%;left:15%;width:70%;height:6px;background:#eee;border:1px solid #ddd;border-radius:2px;}
.kwb-mc-contact-form::after{content:'';position:absolute;bottom:25%;left:25%;width:50%;height:8px;background:#E82222;border-radius:2px;opacity:.5;}
.kwb-mc-divider{display:flex;align-items:center;}
.kwb-mc-divider::after{content:'';width:100%;height:1px;background:#ccc;}

/* Toggle */
.kwb-toggle{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;}
.kwb-toggle input{opacity:0;width:0;height:0;position:absolute;}
.kwb-toggle-track{position:absolute;inset:0;background:#E0E0E0;border-radius:12px;transition:background .2s;cursor:pointer;}
.kwb-toggle input:checked+.kwb-toggle-track{background:#0000FF;}
.kwb-toggle-thumb{position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:2px;right:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,0.15);}
.kwb-toggle input:checked+.kwb-toggle-track .kwb-toggle-thumb{transform:translateX(-20px);}

/* Newsletter toggle + Save bottom */
.kwb-sb-bottom{margin-top:20px;padding-top:16px;border-top:1px solid #F0F0F0;display:flex;flex-direction:column;gap:12px;}
.kwb-newsletter-toggle{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:500;color:#555;}

/* Breadcrumb */
.kwb-breadcrumb{display:flex;align-items:center;gap:6px;padding:8px 12px;background:#F8F8F8;border-radius:8px;margin-bottom:10px;font-size:12px;}
.kwb-breadcrumb-link{border:none;background:none;color:#0000FF;cursor:pointer;font-size:12px;font-weight:600;padding:0;font-family:inherit;}
.kwb-breadcrumb-link:hover{text-decoration:underline;}
.kwb-breadcrumb-sep{color:#CCC;}
.kwb-breadcrumb-current{color:#371D12;font-weight:600;}

/* Shared row elements */
.kwb-grip{display:flex;align-items:center;flex-shrink:0;}
.kwb-grip-btn{border:none;background:none;color:#CCC;cursor:grab;padding:2px;display:flex;align-items:center;justify-content:center;}
.kwb-grip-btn:hover{color:#999;}
.kwb-vis-btn{width:26px;height:26px;border:none;background:none;color:#BBB;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;transition:all .15s;}
.kwb-vis-btn:hover{background:#F0F0F0;color:#371D12;}
.kwb-icon-btn-danger:hover{background:#FEF2F2!important;color:#E82222!important;}
.kwb-field-row{display:flex;align-items:center;gap:8px;}
.kwb-label-inline{font-size:11px;font-weight:600;color:#999;min-width:36px;flex-shrink:0;}

/* Pages list */
.kwb-pages-list{display:flex;flex-direction:column;gap:4px;}
.kwb-page-row{border:1.5px solid #F0F0F0;border-radius:10px;overflow:hidden;transition:all .15s;background:#fff;}
.kwb-page-row:hover{border-color:#E0E0E0;}
.kwb-page-row-active{border-color:#0000FF;background:#FAFAFF;}
.kwb-page-row-hidden{opacity:0.5;}
.kwb-page-row-main{display:flex;align-items:center;gap:6px;padding:8px 10px;}
.kwb-page-row-info{flex:1;min-width:0;cursor:pointer;display:flex;align-items:center;gap:6px;}
.kwb-page-row-name{font-size:13px;font-weight:600;color:#371D12;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.kwb-page-row-slug{font-size:10px;font-weight:400;color:#BBB;flex-shrink:0;}
.kwb-page-row-actions{display:flex;gap:2px;align-items:center;flex-shrink:0;}
.kwb-page-edit-fields{padding:8px 12px 10px;display:flex;flex-direction:column;gap:6px;border-top:1px solid #F0F0F0;background:#FAFAFF;}

/* SEO section */
.kwb-seo-section{margin-top:12px;padding-top:12px;border-top:1px dashed #E0E0E0;}
.kwb-seo-header{font-size:12px;font-weight:700;color:#0000FF;margin-bottom:8px;display:flex;align-items:center;gap:4px;}
.kwb-seo-header::before{content:'';display:inline-block;width:3px;height:12px;background:#0000FF;border-radius:2px;}
.kwb-char-count{font-size:10px;color:#BBB;text-align:left;direction:ltr;}
.kwb-seo-preview{margin-top:4px;}
.kwb-seo-preview-label{font-size:10px;font-weight:600;color:#999;margin-bottom:4px;}
.kwb-seo-google-preview{background:#fff;border:1px solid #E8E8E8;border-radius:8px;padding:12px;font-family:Arial,sans-serif;}
.kwb-seo-gp-url{font-size:12px;color:#202124;margin-bottom:4px;display:flex;align-items:center;gap:6px;}
.kwb-seo-gp-favicon{width:18px;height:18px;border-radius:50%;background:#E82222;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;}
.kwb-seo-gp-title{font-size:16px;color:#1a0dab;font-weight:400;line-height:1.3;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.kwb-seo-gp-desc{font-size:13px;color:#4d5156;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.kwb-seo-social-preview{background:#fff;border:1px solid #E8E8E8;border-radius:8px;overflow:hidden;}
.kwb-seo-sp-image{height:80px;background:#F0F0F0;display:flex;align-items:center;justify-content:center;}
.kwb-seo-sp-text{padding:8px 10px;}
.kwb-seo-sp-domain{font-size:10px;color:#999;text-transform:uppercase;margin-bottom:2px;}
.kwb-seo-sp-title{font-size:13px;font-weight:700;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.kwb-seo-sp-desc{font-size:11px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* Page presets */
.kwb-page-presets{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
.kwb-page-preset-btn{position:relative;padding:8px 18px;border:1.5px solid #E8E8E8;border-radius:20px;background:#fff;font-family:inherit;font-size:13px;font-weight:600;color:#371D12;cursor:pointer;transition:all .15s;}
.kwb-page-preset-btn:hover:not(:disabled){border-color:#0000FF;background:#F0F0FF;color:#0000FF;}
.kwb-page-preset-disabled{opacity:0.45;cursor:not-allowed!important;background:#f8f8f8;}
.kwb-page-preset-check{margin-right:4px;color:#10b981;}
.kwb-page-divider{display:flex;align-items:center;gap:12px;margin:8px 0 16px;font-size:12px;color:#BBB;}
.kwb-page-divider::before,.kwb-page-divider::after{content:'';flex:1;height:1px;background:#E8E8E8;}
.kwb-page-divider span{white-space:nowrap;}

/* ─── MODALS ─── */
.kwb-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.kwb-modal{background:#fff;border-radius:16px;width:100%;max-width:480px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;direction:rtl;}
.kwb-modal-sm{max-width:400px;}
.kwb-modal-lg{max-width:560px;}
.kwb-modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 0;gap:12px;}
.kwb-modal-header h2{font-size:18px;font-weight:700;margin:0;color:#371D12;flex:1;text-align:right;}
.kwb-modal-subtitle{font-size:12px;color:#999;}
.kwb-modal-body{padding:16px 20px;overflow-y:auto;flex:1;}
.kwb-modal-footer{padding:0 20px 20px;}

/* Article Picker */
.kwb-article-search{position:relative;margin-bottom:12px;}
.kwb-article-search .kwb-input{padding-left:36px;}
.kwb-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#CCC;}
.kwb-article-list{display:flex;flex-direction:column;gap:0;}
.kwb-article-row{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid #F0F0F0;cursor:pointer;transition:background .1s;}
.kwb-article-row:hover{background:#FAFAFA;}
.kwb-article-selected{background:#F0F0FF !important;}
.kwb-article-row-content{flex:1;min-width:0;}
.kwb-article-row-meta{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.kwb-article-author{font-size:13px;font-weight:600;color:#371D12;}
.kwb-article-date{font-size:11px;color:#999;}
.kwb-article-row-title{font-size:14px;font-weight:700;margin:0 0 6px;color:#1a1a1a;line-height:1.5;}
.kwb-article-row-stats{display:flex;gap:12px;font-size:11px;color:#BBB;align-items:center;}
.kwb-article-row-stats span{display:flex;align-items:center;gap:3px;}
.kwb-article-row-thumb{width:80px;height:80px;flex-shrink:0;position:relative;}
.kwb-article-row-img{width:100%;height:100%;background:#e5e5e5;border-radius:8px;}
.kwb-article-check{position:absolute;bottom:4px;left:4px;width:20px;height:20px;background:#0000FF;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;}

/* ─── BUTTONS ─── */
.kwb-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:42px;padding:0 24px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;white-space:nowrap;}
.kwb-btn-primary:hover{background:#333;}
.kwb-btn-primary:disabled{opacity:0.7;cursor:not-allowed;}
.kwb-btn-loading{background:#555 !important;}
.kwb-btn-success{background:#16a34a !important;}
.kwb-btn-success:hover{background:#16a34a !important;}
@keyframes kwb-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.kwb-spin{animation:kwb-spin 1s linear infinite;}
.kwb-last-published{font-size:11px;color:#999;text-align:center;padding:4px 0 0;font-family:'IBM Plex Sans Arabic',sans-serif;}
.kwb-btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:40px;padding:0 20px;border:1.5px solid #E0E0E0;border-radius:10px;background:#fff;color:#371D12;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;}
.kwb-btn-outline:hover{border-color:#BBB;background:#F8F8F8;}
.kwb-btn-full{width:100%;}
.kwb-btn-half{flex:1;}
.kwb-btn-icon{width:32px;height:32px;border:none;background:none;color:#999;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:8px;padding:0;}
.kwb-btn-icon:hover{background:#F0F0F0;color:#371D12;}

/* Labels & Inputs */
.kwb-label{display:block;font-size:13px;font-weight:700;color:#888;margin-top:12px;margin-bottom:6px;}
.kwb-input{width:100%;height:42px;padding:0 14px;border:1.5px solid #E8E8E8;border-radius:10px;font-family:inherit;font-size:14px;color:#371D12;outline:none;background:#F8F8F8;transition:border .15s;}
.kwb-input:focus{border-color:#0000FF;background:#fff;}
.kwb-input::placeholder{color:#CCC;}
.kwb-select{width:100%;height:42px;padding:0 14px;border:1.5px solid #E8E8E8;border-radius:10px;font-family:inherit;font-size:14px;color:#371D12;outline:none;background:#F8F8F8;transition:border .15s;cursor:pointer;appearance:auto;}
.kwb-select:focus{border-color:#0000FF;background:#fff;}

/* Font picker */
.kwb-font-picker{display:flex;flex-direction:column;gap:4px;max-height:280px;overflow-y:auto;border:1.5px solid #E8E8E8;border-radius:10px;padding:4px;background:#F8F8F8;}
.kwb-font-option{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:none;border-radius:8px;background:transparent;cursor:pointer;text-align:right;transition:all .15s;font-family:inherit;}
.kwb-font-option:hover{background:#fff;}
.kwb-font-option-active{background:#fff;box-shadow:0 0 0 2px #0000FF;position:relative;}
.kwb-font-option-active::after{content:'\u2713';position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#0000FF;font-weight:700;font-size:14px;}
.kwb-font-preview{font-size:18px;font-weight:600;color:#371D12;line-height:1.4;}
.kwb-font-name{font-size:11px;color:#999;font-weight:500;font-family:'IBM Plex Sans Arabic',sans-serif;}

/* ─── PREVIEW INLINE EDITING ─── */
/* Component wrapper */
.kwb-p-comp-wrap{position:relative;transition:outline .15s, box-shadow .15s;outline:2px solid transparent;outline-offset:-2px;margin-top:0;}
.kwb-p-comp-wrap:hover{outline-color:rgba(0,0,255,0.15);}
.kwb-p-comp-selected{outline-color:#0000FF !important;outline-offset:-2px;z-index:2;}
.kwb-p-comp-selected:hover{outline-color:#0000FF !important;}

/* Toolbar on hover/select */
.kwb-p-comp-toolbar{position:absolute;top:-44px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:2px;padding:6px 8px;background:#fff;color:#444;border-radius:10px;font-size:12px;z-index:20;pointer-events:auto;direction:ltr;opacity:0;transition:opacity .15s;box-shadow:0 2px 12px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.06);white-space:nowrap;}
.kwb-p-comp-wrap:hover .kwb-p-comp-toolbar,.kwb-p-comp-selected .kwb-p-comp-toolbar{opacity:1;}
.kwb-p-toolbar-label{font-weight:600;font-size:11px;color:#888;margin-left:6px;white-space:nowrap;font-family:'IBM Plex Sans Arabic',sans-serif;padding:0 4px;}
.kwb-p-toolbar-sep{width:1px;height:20px;background:#e0e0e0;margin:0 2px;}
.kwb-p-toolbar-btn{width:30px;height:30px;border:none;background:transparent;color:#555;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;padding:0;transition:all .12s;}
.kwb-p-toolbar-btn:hover{background:#f0f0f0;color:#111;}
.kwb-p-toolbar-btn:disabled{opacity:0.3;cursor:default;pointer-events:none;}
.kwb-p-toolbar-delete:hover{background:#FEE2E2 !important;color:#DC2626 !important;}
.kwb-p-toolbar-drag{width:30px;height:30px;border:none;background:transparent;color:#999;border-radius:6px;cursor:grab;display:flex;align-items:center;justify-content:center;padding:0;transition:all .12s;}
.kwb-p-toolbar-drag:hover{background:#f0f0f0;color:#555;}
.kwb-p-toolbar-drag:active{cursor:grabbing;}
/* Drag states */
.kwb-p-comp-dragging{opacity:0.4;outline-color:#0000FF !important;}
.kwb-p-drop-above{box-shadow:0 -3px 0 0 #0000FF inset;}
.kwb-p-drop-below{box-shadow:0 3px 0 0 #0000FF inset;}

/* Insert line between components */
.kwb-p-insert-line{position:relative;height:20px;display:flex;align-items:center;justify-content:center;z-index:5;transition:height .2s;}
.kwb-p-insert-line::before{content:'';position:absolute;top:50%;left:10%;right:10%;height:1px;background:transparent;transition:background .15s;}
.kwb-p-insert-line:hover::before{background:rgba(0,0,255,0.2);}
.kwb-p-insert-open{height:28px;}
.kwb-p-insert-btn{width:28px;height:28px;border:2px dashed #ddd;border-radius:50%;background:#fff;color:#bbb;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);padding:0;line-height:1;opacity:0.5;}
.kwb-p-insert-line:hover .kwb-p-insert-btn,.kwb-p-insert-open .kwb-p-insert-btn{opacity:1;border-color:#aaa;color:#888;}
.kwb-p-insert-btn:hover{border-color:#0000FF;color:#0000FF;background:#F0F0FF;border-style:solid;}

/* Insert dropdown */
.kwb-p-insert-dropdown{position:absolute;top:32px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.72);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:1px solid rgba(255,255,255,0.5);border-radius:20px;box-shadow:0 16px 64px rgba(0,0,0,0.12),0 2px 12px rgba(0,0,0,0.06);padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;z-index:9999;min-width:420px;max-width:90vw;direction:rtl;}
@media(max-width:480px){.kwb-p-insert-dropdown{grid-template-columns:repeat(2,1fr);min-width:280px;padding:12px;gap:8px;}}
.kwb-p-insert-item{padding:16px 10px 14px;border:1.5px solid rgba(0,0,0,0.06);border-radius:14px;background:rgba(255,255,255,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:"IBM Plex Sans Arabic",system-ui,sans-serif;font-size:12px;font-weight:600;color:#444;cursor:pointer;text-align:center;transition:all .2s ease;white-space:nowrap;display:flex;flex-direction:column;align-items:center;gap:8px;}
.kwb-p-insert-item:hover{background:rgba(255,255,255,0.9);border-color:rgba(99,102,241,0.4);color:#1a1a1a;box-shadow:0 4px 16px rgba(99,102,241,0.12);transform:translateY(-1px);}
.kwb-p-insert-icon svg{width:22px;height:22px;}
.kwb-p-insert-icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:7px;border:1px solid #e8e8e8;}
.kwb-p-insert-icon svg{width:16px;height:16px;}
.kwb-p-insert-label{font-size:11px;line-height:1.2;}

/* Inline editable text */
.kwb-p-editable{cursor:text;border-radius:4px;transition:outline .15s, background .15s;outline:2px solid transparent;}
.kwb-p-editable:hover{outline-color:rgba(0,0,255,0.15);background:rgba(0,0,255,0.02);}
.kwb-p-editable:focus{outline-color:#0000FF;background:rgba(0,0,255,0.03);outline-offset:2px;}

/* ─── Border Radius (global) ─── */
.kwb-preview-content .kwb-p-subscribe-btn{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-article-img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-hero-side-img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-hero-main-img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-email-input{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-footer-email{border-radius:0 var(--kwb-radius,0) var(--kwb-radius,0) 0;}
.kwb-preview-content .kwb-p-cf-input{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-cf-textarea{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-cf-btn{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-article-card{border-radius:0;overflow:hidden;}
.kwb-preview-content .kwb-p-bento-card{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-bento-card-img{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-bento-card-img img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-testi-card{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-testi-img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-product-card{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-course-card{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-topic-card{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-av-cover{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-product-img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-course-img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-image-full{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-av-tag{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-cat-btn{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-articles-search{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-gallery-card{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-gallery-card-img{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-gallery-card-img img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-gallery-sidebar{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-gallery-sidebar-img img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-gallery-sidebar-btn{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-catfeed-card{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-catfeed-card-img{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-catfeed-card-img img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-catfeed-featured{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-catfeed-featured-img{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-catfeed-featured-img img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-catfeed-sidebar{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-catfeed-sidebar-img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-banner-card{border-radius:0;overflow:hidden;}
.kwb-preview-content .kwb-p-slider-img{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-slider-img img{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-podcast-card{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-podcast-featured-card{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-podcast-featured-cover{border-radius:var(--kwb-radius,0) var(--kwb-radius,0) 0 0;overflow:hidden;}
.kwb-preview-content .kwb-p-podcast-prog-img{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-podcast-img{border-radius:var(--kwb-radius,0);overflow:hidden;}
.kwb-preview-content .kwb-p-cta-form{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-sub-form{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-sub-form input{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-login-btn{border-radius:var(--kwb-radius,0);}
.kwb-preview-content .kwb-p-social-icon{border-radius:var(--kwb-radius,0);}
.kwb-radius-control{display:flex;flex-direction:column;gap:8px;}
.kwb-radius-preview-row{display:flex;align-items:center;gap:10px;}
.kwb-radius-preview-box{width:48px;height:32px;transition:border-radius .2s;}
.kwb-radius-value{font-size:18px;font-weight:700;color:#371D12;}

/* ─── Bento Grid ─── */
.kwb-p-bento{display:grid;gap:8px;padding:16px;min-height:120px;}
.kwb-p-bento-2-1{grid-template-columns:1fr 1fr;grid-template-rows:auto auto;}
.kwb-p-bento-2-1 .kwb-p-bento-card:nth-child(3){grid-column:1/-1;}
.kwb-p-bento-1-2{grid-template-columns:1fr 1fr;grid-template-rows:auto auto;}
.kwb-p-bento-1-2 .kwb-p-bento-card:first-child{grid-column:1/-1;}
.kwb-p-bento-3-col{grid-template-columns:repeat(3,1fr);}
.kwb-p-bento-2-col{grid-template-columns:repeat(2,1fr);}
.kwb-p-bento-1-3{grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;}
.kwb-p-bento-1-3 .kwb-p-bento-card:first-child{grid-column:1/-1;}
.kwb-p-bento-4-grid{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;}
.kwb-p-bento-card{min-height:120px;background:var(--kwb-card-bg,#f5f5f5);border:1px solid rgba(128,128,128,0.15);display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;position:relative;transition:transform .15s,box-shadow .15s;}
.kwb-p-bento-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08);}

.kwb-p-bento-title{font-size:16px;font-weight:700;margin:0;line-height:1.4;color:var(--kwb-headline-color,#1a1a1a);}
.kwb-p-bento-text{font-size:11px;margin:4px 0 0;opacity:0.8;color:var(--kwb-text-color,#666);}
.kwb-bento-layouts{display:flex;flex-direction:column;gap:4px;}
.kwb-bento-layout-btn{display:flex;flex-direction:column;padding:8px 12px;border:1.5px solid #E8E8E8;border-radius:8px;background:#fff;cursor:pointer;transition:all .15s;text-align:right;font-family:inherit;}
.kwb-bento-layout-btn:hover{border-color:#BBB;}
.kwb-bento-layout-btn strong{font-size:13px;color:#371D12;}
.kwb-bento-layout-btn span{font-size:11px;color:#999;}
.kwb-bento-layout-active{border-color:#0000FF;background:#F5F5FF;}
.kwb-preview-mobile .kwb-p-bento{grid-template-columns:1fr!important;}
.kwb-preview-mobile .kwb-p-bento .kwb-p-bento-card{grid-column:auto!important;}

/* ─── Article Search & Categories ─── */
.kwb-p-articles-filters{margin-bottom:16px;display:flex;flex-direction:column;gap:10px;}
.kwb-p-articles-search-wrap{position:relative;}
.kwb-p-articles-search{width:100%;height:40px;padding:0 14px 0 36px;border:1px solid rgba(128,128,128,0.2);font-family:inherit;font-size:13px;outline:none;background:var(--kwb-card-bg,#fff);color:var(--kwb-text-color,#333);direction:rtl;}
.kwb-p-articles-search::placeholder{color:var(--kwb-text-color,#bbb);opacity:0.5;}
.kwb-p-articles-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--kwb-text-color,#ccc);opacity:0.5;pointer-events:none;}
.kwb-p-articles-cats{display:flex;gap:6px;flex-wrap:wrap;}
.kwb-p-cat-btn{padding:6px 14px;border:1px solid rgba(128,128,128,0.2);background:var(--kwb-card-bg,#fff);color:var(--kwb-text-color,#666);font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;}
.kwb-p-cat-btn:hover{border-color:var(--kwb-btn-color,#E82222);color:var(--kwb-btn-color,#E82222);}
.kwb-p-cat-active{background:var(--kwb-btn-color,#E82222)!important;color:#fff!important;border-color:var(--kwb-btn-color,#E82222)!important;}

/* ─── Footer enhancements ─── */
.kwb-p-footer-custom-text{font-size:12px;color:var(--kwb-bg,#fff);opacity:0.5;margin:8px 0 0;line-height:1.6;}
.kwb-p-footer-bottom{border-top:1px solid rgba(255,255,255,0.15);padding:20px 0;text-align:center;font-size:11px;color:var(--kwb-bg,#fff);display:flex;flex-direction:column;align-items:center;gap:12px;}
.kwb-p-footer-bottom > span{opacity:0.4;}
.kwb-p-kitabh-badge-wrap{text-align:center;padding:24px 0;background:var(--kwb-bg,#fff);}
.kwb-p-footer-kitabh-badge{display:inline-flex;align-items:center;gap:10px;font-size:15px;font-weight:700;direction:rtl;padding:12px 24px;text-decoration:none;transition:all .2s ease;cursor:pointer;letter-spacing:0.3px;opacity:1 !important;position:relative;z-index:10;isolation:isolate;}
.kwb-p-footer-kitabh-badge:hover{transform:translateY(-1px);}
.kwb-p-footer-kitabh-badge img{flex-shrink:0;width:24px;height:auto;display:block;}
.kwb-badge-black{background:#000;color:#fff;border:1px solid #000;}
.kwb-badge-black:hover{background:#1a1a1a;}
.kwb-badge-black img{}
.kwb-badge-blue{background:#0000FF;color:#fff;border:1px solid #0000FF;}
.kwb-badge-blue:hover{background:#0000dd;}
.kwb-badge-blue img{}
.kwb-badge-white{background:#fff;color:#000;border:1px solid #e0e0e0;}
.kwb-badge-white:hover{background:#f5f5f5;}
.kwb-badge-white img{}
.kwb-badge-style-picker{display:flex;gap:8px;flex-wrap:wrap;}
.kwb-badge-style-opt{border:2px solid transparent;border-radius:8px;padding:4px;cursor:pointer;background:none;transition:border-color .2s;}
.kwb-badge-style-active{border-color:#0000FF;}
.kwb-badge-preview{display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:600;direction:rtl;padding:5px 10px;border-radius:50px;white-space:nowrap;}
.kwb-badge-preview-black{background:#000;color:#fff;}
.kwb-badge-preview-blue{background:#0000FF;color:#fff;}
.kwb-badge-preview-white{background:#fff;color:#000;border:1px solid #ddd;}

/* Bento mini preview */
.kwb-mc-bento-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;padding:2px;}
.kwb-mc-bento-grid::before{content:'';background:#e0e0e0;border-radius:2px;height:16px;}
.kwb-mc-bento-grid::after{content:'';background:#e8e8e8;border-radius:2px;height:16px;grid-column:1/-1;}
.kwb-mc-rich-text{display:flex;flex-direction:column;gap:3px;direction:rtl;padding:4px;}
.kwb-mc-rich-text::before{content:'';width:100%;height:3px;background:#ddd;border-radius:2px;}
.kwb-mc-rich-text::after{content:'';width:60%;height:3px;background:#ddd;border-radius:2px;}

/* ─── Editable field ─── */
.kwb-p-editable{cursor:text;outline:none;}
.kwb-p-editable:focus{outline:2px dashed var(--kwb-btn-color,#E82222);outline-offset:2px;}


/* ─── Login Button ─── */
.kwb-p-login-btn{padding:0 16px;height:46px;border:1.5px solid var(--kwb-btn-color,#E82222);background:transparent;color:var(--kwb-btn-color,#E82222);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .15s;border-radius:var(--kwb-radius,0);}
.kwb-p-login-btn:hover{background:var(--kwb-btn-color,#E82222);color:#fff;}

/* ─── Login Modal ─── */
.kwb-login-popup{position:relative;background:#fff;border-radius:16px;padding:36px 32px;max-width:400px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:kwbPopupIn .2s ease-out;direction:rtl;}
.kwb-login-tabs{display:flex;gap:0;margin:20px 0 16px;border-bottom:1.5px solid #E8E8E8;}
.kwb-login-tab{flex:1;padding:10px 0;border:none;background:none;font-family:inherit;font-size:15px;font-weight:600;color:#999;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;}
.kwb-login-tab-active{color:#E82222;border-bottom-color:#E82222;}
.kwb-login-form{display:flex;flex-direction:column;gap:12px;}
.kwb-login-input{width:100%;height:48px;padding:0 16px;border:1.5px solid #E0E0E0;border-radius:10px;font-family:inherit;font-size:15px;outline:none;direction:rtl;text-align:right;background:#F8F8F8;}
.kwb-login-input:focus{border-color:#999;background:#fff;}
.kwb-login-submit{width:100%;height:48px;border:none;border-radius:10px;color:#fff;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;transition:opacity .15s;}
.kwb-login-submit:hover{opacity:0.9;}

/* ─── Component Icons ─── */
.kwb-comp-icon{width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0.85;}
.kwb-comp-row-active .kwb-comp-icon{opacity:1;}

/* ─── Social Links ─── */
.kwb-p-social-links{display:flex;gap:12px;justify-content:center;padding:20px 16px;flex-wrap:wrap;}
.kwb-p-social-icon{width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:var(--kwb-text-color,#666);border:1.5px solid rgba(128,128,128,0.2);transition:all .15s;text-decoration:none;border-radius:var(--kwb-radius,0);}
.kwb-p-social-icon:hover{color:var(--kwb-btn-color,#E82222);border-color:var(--kwb-btn-color,#E82222);transform:translateY(-2px);}

/* ─── Gallery (magazine-style) ─── */
.kwb-p-gallery{padding:24px 20px;border-top:2px solid var(--kwb-headline-color,#1a1a1a);}
.kwb-p-gallery-header{display:flex;justify-content:flex-end;padding-bottom:16px;border-bottom:1px solid rgba(128,128,128,0.15);}
.kwb-p-gallery-title{font-size:20px;font-weight:800;color:var(--kwb-btn-color,#E82222);margin:0;}
.kwb-p-gallery-body{display:flex;gap:0;margin-top:16px;}
.kwb-p-gallery-with-sidebar .kwb-p-gallery-cards{flex:1;min-width:0;}
.kwb-p-gallery-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.kwb-p-gallery-card{display:flex;flex-direction:column;gap:8px;border-bottom:1px solid rgba(128,128,128,0.1);padding-bottom:12px;}
.kwb-p-gallery-card-img{width:100%;aspect-ratio:4/3;overflow:hidden;background:rgba(128,128,128,0.08);}
.kwb-p-gallery-card-img img{width:100%;height:100%;object-fit:cover;display:block;}
.kwb-p-gallery-card-img-ph{width:100%;height:100%;min-height:160px;background:rgba(128,128,128,0.1);}
.kwb-p-gallery-card-title{font-size:15px;font-weight:700;line-height:1.5;color:var(--kwb-headline-color,#1a1a1a);margin:0;}
.kwb-p-gallery-card-excerpt{font-size:13px;line-height:1.6;color:var(--kwb-text-color,#666);margin:0;}
.kwb-p-gallery-card-footer{display:flex;justify-content:space-between;align-items:center;margin-top:auto;}
.kwb-p-gallery-card-author{font-size:12px;font-weight:600;color:var(--kwb-text-color,#888);}
.kwb-p-gallery-sidebar{width:280px;flex-shrink:0;border-right:1px solid rgba(128,128,128,0.15);padding-right:20px;margin-right:20px;display:flex;flex-direction:column;gap:10px;}
.kwb-p-gallery-sidebar-title{font-size:17px;font-weight:800;line-height:1.5;color:var(--kwb-headline-color,#1a1a1a);margin:0;}
.kwb-p-gallery-sidebar-img{width:100%;overflow:hidden;background:rgba(128,128,128,0.08);flex:1;}
.kwb-p-gallery-sidebar-img img{width:100%;height:100%;object-fit:cover;display:block;}
.kwb-p-gallery-sidebar-btn{display:flex;align-items:center;gap:6px;justify-content:center;padding:8px 14px;border:1.5px solid rgba(128,128,128,0.3);background:#fff;color:var(--kwb-headline-color,#1a1a1a);font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;}
.kwb-p-gallery-sidebar-btn:hover{border-color:var(--kwb-btn-color,#E82222);color:var(--kwb-btn-color,#E82222);}

/* ─── Category Feed ─── */
.kwb-p-catfeed{padding:24px 20px;border-top:2px solid var(--kwb-headline-color,#1a1a1a);}
.kwb-p-catfeed-header{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:14px;border-bottom:1px solid rgba(128,128,128,0.15);}
.kwb-p-catfeed-title{font-size:20px;font-weight:800;color:var(--kwb-btn-color,#E82222);margin:0;}
.kwb-p-catfeed-more{font-size:13px;font-weight:600;color:var(--kwb-text-color,#888);cursor:pointer;white-space:nowrap;}
.kwb-p-catfeed-more:hover{color:var(--kwb-btn-color,#E82222);}
.kwb-p-catfeed-body{display:grid;gap:0;margin-top:16px;}
.kwb-p-catfeed-featured_right{grid-template-columns:1fr 1fr 1.3fr;}
.kwb-p-catfeed-featured_left{grid-template-columns:1.3fr 1fr 1fr;}
.kwb-p-catfeed-grid{grid-template-columns:repeat(3,1fr);gap:20px;}
.kwb-p-catfeed-main{display:flex;flex-direction:column;gap:0;}
.kwb-p-catfeed-card{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(128,128,128,0.1);}
.kwb-p-catfeed-card-img{width:120px;height:90px;flex-shrink:0;overflow:hidden;background:rgba(128,128,128,0.08);}
.kwb-p-catfeed-card-img img{width:100%;height:100%;object-fit:cover;display:block;}
.kwb-p-catfeed-card-content{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0;}
.kwb-p-catfeed-card-title{font-size:14px;font-weight:700;line-height:1.5;color:var(--kwb-headline-color,#1a1a1a);margin:0;}
.kwb-p-catfeed-card-excerpt{font-size:12px;line-height:1.5;color:var(--kwb-text-color,#666);margin:0;}
.kwb-p-catfeed-card-author{font-size:11px;font-weight:600;color:var(--kwb-text-color,#888);margin-top:auto;}
.kwb-p-catfeed-featured{padding:16px;border-right:1px solid rgba(128,128,128,0.15);display:flex;flex-direction:column;gap:10px;}
.kwb-p-catfeed-featured_left .kwb-p-catfeed-featured{border-right:none;border-left:1px solid rgba(128,128,128,0.15);order:-1;}
.kwb-p-catfeed-featured-img{width:100%;aspect-ratio:4/3;overflow:hidden;background:rgba(128,128,128,0.08);}
.kwb-p-catfeed-featured-img img{width:100%;height:100%;object-fit:cover;display:block;}
.kwb-p-catfeed-featured-title{font-size:17px;font-weight:800;line-height:1.5;color:var(--kwb-headline-color,#1a1a1a);margin:0;}
.kwb-p-catfeed-featured-excerpt{font-size:13px;line-height:1.6;color:var(--kwb-text-color,#666);margin:0;}
.kwb-p-catfeed-sidebar{width:auto;padding:0 16px;border-right:1px solid rgba(128,128,128,0.15);display:flex;flex-direction:column;gap:8px;}
.kwb-p-catfeed-sidebar-title{font-size:15px;font-weight:800;color:var(--kwb-headline-color,#1a1a1a);margin:0;padding-bottom:8px;border-bottom:2px solid var(--kwb-headline-color,#1a1a1a);}
.kwb-p-catfeed-sidebar-card{display:flex;flex-direction:column;gap:6px;}
.kwb-p-catfeed-sidebar-img{width:100%;height:120px;object-fit:cover;display:block;}
.kwb-p-catfeed-sidebar-label{font-size:12px;font-weight:600;color:var(--kwb-headline-color,#1a1a1a);line-height:1.4;}

/* ─── Article Mobile List Layout ─── */
@media(max-width:768px){
  .kwb-p-gallery{display:none;}
  .kwb-p-catfeed{display:none;}
}

/* ─── Bento Card Fix (image on top) ─── */
.kwb-p-bento-card{display:flex;flex-direction:column;justify-content:flex-start;overflow:hidden;}
.kwb-p-bento-card-img{width:100%;height:140px;object-fit:cover;display:block;}
.kwb-p-bento-card-img-placeholder{width:100%;height:140px;background:rgba(128,128,128,0.12);}
.kwb-p-bento-card-body{padding:14px 16px;display:flex;flex-direction:column;gap:4px;}
.kwb-p-bento-card-wide{grid-column:span 2;}
.kwb-p-bento-card-tall{grid-row:span 2;}
.kwb-p-bento-card-tall .kwb-p-bento-card-img,.kwb-p-bento-card-tall .kwb-p-bento-card-img-placeholder{height:200px;}
.kwb-p-bento-card-wide .kwb-p-bento-card-img,.kwb-p-bento-card-wide .kwb-p-bento-card-img-placeholder{height:120px;}
.kwb-preview-mobile .kwb-p-bento-card-wide,.kwb-preview-mobile .kwb-p-bento-card-tall{grid-column:auto;grid-row:auto;}

/* Social mini preview */
.kwb-mc-social-links{display:flex;gap:3px;justify-content:center;align-items:center;padding:4px;}
.kwb-mc-social-links::before,.kwb-mc-social-links::after{content:'';width:10px;height:10px;border-radius:50%;border:1.5px solid #ccc;}

/* ─── RESPONSIVE ─── */
@media(max-width:900px){
  .kwb-builder-body{flex-direction:column-reverse;}
  .kwb-sidebar{width:100%;max-height:50vh;border-left:none;border-top:1px solid #E8E8E8;}
  .kwb-preview-area{padding:0 8px 20px;}
  .kwb-preview-frame{max-width:100%;}
  .kwb-p-hero-news{grid-template-columns:1fr;}
  .kwb-p-hero-side{display:none;}
  .kwb-p-banner-grid{grid-template-columns:1fr;}
  .kwb-p-footer-inner{flex-direction:column;gap:20px;}
  .kwb-p-footer-logo{font-size:32px;}
  .kwb-p-cta-inner{flex-direction:column;}
  .kwb-p-articles-grid{grid-template-columns:repeat(2,1fr);}
  .kwb-p-bento{grid-template-columns:1fr!important;}
  .kwb-p-bento .kwb-p-bento-card{grid-column:auto!important;}
}
@media(max-width:600px){
  .kwb{padding:16px 12px 40px;}
  .kwb-sites-grid{grid-template-columns:1fr;}
  .kwb-templates-grid{grid-template-columns:1fr;}
  .kwb-p-hero-sub-form{flex-direction:column;}
  .kwb-p-cta-form{flex-direction:column;}
  .kwb-p-footer-form{flex-direction:column;}
  .kwb-modal{margin:10px;}
}
`;
