// ═══════════════════════════════════════════════════════════
// SINGLE SOURCE OF TRUTH — Kitabh Plan & Feature Configuration
// ═══════════════════════════════════════════════════════════
//
// Every feature, which plan it belongs to, its Arabic label for
// the upgrade modal, and its sidebar tag — all in ONE place.
//
// To change anything about plans/features, edit ONLY this file.
// ═══════════════════════════════════════════════════════════

export type Plan = 'free' | 'writers' | 'business';

export type FeatureKey =
  | 'posts' | 'outline' | 'checker' | 'carousel' | 'social'
  | 'arabic-editor' | 'grammar-checker'
  | 'newsletters' | 'subscribers' | 'linktree' | 'landing-pages'
  | 'email-journeys' | 'magic-link' | 'newsletter-scheduling'
  | 'subscriber-limit'
  | 'website' | 'domain-settings' | 'email-template' | 'branding'
  | 'ai-seo' | 'audio-publish' | 'verified-account'
  | 'subscriber-segments' | 'custom-fonts' | 'support'
  | 'analyze' | 'notifications' | 'writers' | 'dashboard' | 'settings'
  | 'subdomain';

// ─── Feature definitions ─────────────────────────────────
// plan: which plan first unlocks this feature
//   'free'     → available to everyone
//   'writers'  → requires باقة الكاتب or above
//   'business' → requires باقة الأعمال only
//
// upgradeTitle: Arabic title shown in the upgrade modal (empty = never locked)
// freeTrial: number of free uses before lock (only for free plan AI tools)

interface FeatureDef {
  plan: Plan;
  upgradeTitle: string;
  displayLabel: string;
  freeTrial?: number;
}

export const FEATURES: Record<FeatureKey, FeatureDef> = {
  // ── FREE: available to all plans ──────────────────────
  posts:         { plan: 'free',     upgradeTitle: '',  displayLabel: 'كتابة المنشورات' },
  outline:       { plan: 'free',     upgradeTitle: '',  displayLabel: 'مساعد كتابة', freeTrial: 5 },
  checker:       { plan: 'free',     upgradeTitle: '',  displayLabel: 'محرر كتابة', freeTrial: 5 },
  carousel:      { plan: 'free',     upgradeTitle: '',  displayLabel: 'ستوديو كتابة', freeTrial: 5 },
  social:        { plan: 'free',     upgradeTitle: '',  displayLabel: 'محتوى كتابة', freeTrial: 5 },
  'arabic-editor':  { plan: 'writers',  upgradeTitle: 'محرر نصوص عربي متطوّر',  displayLabel: 'محرر نصوص عربي متطوّر' },
  'grammar-checker':{ plan: 'writers',  upgradeTitle: 'مدقق لغوي وسياقي',     displayLabel: 'مدقق لغوي وسياقي' },
  notifications: { plan: 'free',     upgradeTitle: '',  displayLabel: 'الإشعارات' },
  settings:      { plan: 'free',     upgradeTitle: '',  displayLabel: 'الإعدادات' },

  // ── WRITERS: requires باقة الكاتب ─────────────────────
  dashboard:      { plan: 'writers',  upgradeTitle: 'لوحة التحكم متاحة مع النشرات البريدية', displayLabel: 'لوحة التحكم' },
  newsletters:    { plan: 'writers',  upgradeTitle: 'النشرات البريدية',  displayLabel: 'النشرات البريدية' },
  subscribers:    { plan: 'writers',  upgradeTitle: 'إدارة المشتركين',   displayLabel: 'إدارة المشتركين' },
  linktree:       { plan: 'writers',  upgradeTitle: 'صفحة الروابط',      displayLabel: 'صفحة الروابط' },
  'landing-pages':{ plan: 'writers',  upgradeTitle: 'صفحات الاشتراك',    displayLabel: 'صفحات الاشتراك' },
  'magic-link':   { plan: 'writers',  upgradeTitle: 'الرابط السحري',     displayLabel: 'الرابط السحري' },
  website:        { plan: 'writers',  upgradeTitle: 'الموقع الإلكتروني', displayLabel: 'الموقع الإلكتروني' },
  analyze:                { plan: 'writers',  upgradeTitle: 'الإحصائيات المتقدمة', displayLabel: 'الإحصائيات' },
  'ai-seo':               { plan: 'writers',  upgradeTitle: 'الظهور في نتائج البحث', displayLabel: 'الظهور في نتائج الذكاء الاصطناعي ومحركات البحث' },
  'audio-publish':        { plan: 'writers',  upgradeTitle: 'النشر الصوتي',         displayLabel: 'النشر الصوتي' },
  'newsletter-scheduling':{ plan: 'writers',  upgradeTitle: 'جدولة النشرة',         displayLabel: 'جدولة النشرة' },
  'subscriber-limit':     { plan: 'writers',  upgradeTitle: 'عدد المشتركين',        displayLabel: 'عدد المشتركين' },

  // ── BUSINESS: requires باقة الأعمال ───────────────────
  subdomain:         { plan: 'writers',  upgradeTitle: 'النطاق الفرعي',              displayLabel: 'النطاق الفرعي' },
  'domain-settings': { plan: 'business', upgradeTitle: 'النطاق المخصص',              displayLabel: 'النطاق المخصص' },
  'email-template':  { plan: 'business', upgradeTitle: 'قوالب البريد',          displayLabel: 'قوالب البريد ورحلات الرسائل' },
  'email-journeys':  { plan: 'business', upgradeTitle: 'رحلات البريد والأتمتة',      displayLabel: 'رحلات البريد والأتمتة' },
  'subscriber-segments':{ plan: 'business', upgradeTitle: 'أقسام المشتركين',           displayLabel: 'أقسام المشتركين' },
  'custom-fonts':      { plan: 'business', upgradeTitle: 'الخطوط الخاصة',               displayLabel: 'الخطوط الخاصة' },
  branding:            { plan: 'business', upgradeTitle: 'الهوية والعلامة التجارية',   displayLabel: 'الهوية والخطوط' },
  'verified-account':  { plan: 'writers',  upgradeTitle: 'حساب موثّق',               displayLabel: 'حساب موثّق' },
  support:             { plan: 'writers',  upgradeTitle: 'الدعم الفني',               displayLabel: 'الدعم الفني' },
  writers:             { plan: 'business', upgradeTitle: 'إدارة الفريق',               displayLabel: 'إدارة الفريق' },
};

// ─── Plan metadata ──────────────────────────────────────
export const PLAN_META: Record<Plan, {
  label: string;
  labelAr: string;
  color: string;
  subscriberLimit: string;
  showSubscribers: boolean;
  canCreateNewsletter: boolean;
}> = {
  free:     { label: 'Free',     labelAr: 'الباقة المجانية', color: '#6B7280',  subscriberLimit: '0',       showSubscribers: false, canCreateNewsletter: false },
  writers:  { label: 'Writers',  labelAr: 'باقة الكاتب',    color: '#2563EB',  subscriberLimit: '10,000',  showSubscribers: true,  canCreateNewsletter: false },
  business: { label: 'Business', labelAr: 'باقة الأعمال',   color: '#111827',  subscriberLimit: '100,000', showSubscribers: true,  canCreateNewsletter: true },
};

// ─── Section-level locks (entire sidebar section collapsed) ─
export const SECTION_LOCKS: Record<Plan, Set<string>> = {
  free:     new Set(['publish', 'design']),
  writers:  new Set([]),
  business: new Set([]),
};

// ─── Derived helpers (auto-generated from FEATURES) ─────

const PLAN_RANK: Record<Plan, number> = { free: 0, writers: 1, business: 2 };

/** Is this feature locked for the given plan? */
export function isLocked(feature: FeatureKey, plan: Plan): boolean {
  return PLAN_RANK[plan] < PLAN_RANK[FEATURES[feature].plan];
}

/** Build the lock set for a given plan (for passing to components) */
export function getLockSet(plan: Plan): Set<FeatureKey> {
  const set = new Set<FeatureKey>();
  for (const [key, def] of Object.entries(FEATURES)) {
    if (PLAN_RANK[plan] < PLAN_RANK[def.plan]) {
      set.add(key as FeatureKey);
    }
  }
  return set;
}

/** Get the plan tier tag for a feature ('writers' | 'business' | undefined for free) */
export function getPlanTier(feature: FeatureKey): 'writers' | 'business' | undefined {
  const p = FEATURES[feature].plan;
  return p === 'free' ? undefined : p;
}

/** Get upgrade modal info for a locked feature */
export function getUpgradeInfo(feature: FeatureKey): { title: string; targetPlan: string } {
  const def = FEATURES[feature];
  const targetPlan = def.plan === 'business' ? 'باقة الأعمال' : 'باقة الكاتب';
  return { title: def.upgradeTitle, targetPlan };
}

/** Get trial usage for free plan, or undefined */
export function getTrialUsage(feature: FeatureKey, plan: Plan): { used: number; total: number } | undefined {
  if (plan !== 'free') return undefined;
  const t = FEATURES[feature].freeTrial;
  return t ? { used: t, total: t } : undefined;
}

/** Comparison rows for the plan overlay — ordered by section */
export const COMPARISON_SECTIONS: { title: string; features: { key: FeatureKey; label: string; freeNote?: string; writersNote?: string; businessNote?: string }[] }[] = [
  {
    title: 'الكتابة والمحتوى',
    features: [
      { key: 'posts', label: 'كتابة المنشورات' },
      { key: 'outline', label: 'مساعد كتابة', freeNote: '5 مرات', writersNote: 'دون حد', businessNote: 'دون حد' },
      { key: 'checker', label: 'محرر كتابة', freeNote: '5 مرات', writersNote: 'دون حد', businessNote: 'دون حد' },
      { key: 'carousel', label: 'ستوديو كتابة', freeNote: '5 مرات', writersNote: 'دون حد', businessNote: 'دون حد' },
      { key: 'social', label: 'محتوى كتابة', freeNote: '5 مرات', writersNote: 'دون حد', businessNote: 'دون حد' },
      { key: 'arabic-editor', label: 'محرر نصوص عربي متطوّر' },
      { key: 'grammar-checker', label: 'مدقق لغوي وسياقي' },
    ],
  },
  {
    title: 'النشر وبناء الجمهور',
    features: [
      { key: 'subscriber-limit', label: 'عدد المشتركين', writersNote: '10,000', businessNote: '100,000' },
      { key: 'newsletters', label: 'النشرات البريدية', writersNote: '1', businessNote: 'دون حد' },
      { key: 'verified-account', label: 'حساب موثّق' },
      { key: 'dashboard', label: 'لوحة التحكم' },
      { key: 'newsletter-scheduling', label: 'جدولة النشرة' },
      { key: 'subscribers', label: 'إدارة المشتركين' },
      { key: 'linktree', label: 'صفحة الروابط' },
      { key: 'audio-publish', label: 'النشر الصوتي' },
      { key: 'ai-seo', label: 'الظهور في نتائج الذكاء الاصطناعي ومحركات البحث' },
      { key: 'analyze', label: 'الإحصائيات' },
      { key: 'subdomain', label: 'النطاق الفرعي' },
    ],
  },
  {
    title: 'النمو والتوسّع',
    features: [
      { key: 'landing-pages', label: 'صفحات الاشتراك', writersNote: '1', businessNote: 'دون حد' },
      { key: 'subscriber-segments', label: 'أقسام المشتركين' },
      { key: 'website', label: 'الموقع الإلكتروني', writersNote: 'محدود', businessNote: 'وصول كامل' },
      { key: 'custom-fonts', label: 'الخطوط الخاصة' },
      { key: 'branding', label: 'الهوية والعلامة' },
      { key: 'domain-settings', label: 'النطاق المخصص', writersNote: '—' },
      { key: 'email-template', label: 'قوالب البريد' },
      { key: 'email-journeys', label: 'رحلات البريد والأتمتة' },
      { key: 'writers', label: 'إدارة الفريق' },
      { key: 'support', label: 'الدعم الفني', freeNote: '—', writersNote: 'محدود', businessNote: 'متقدم' },
    ],
  },
];
