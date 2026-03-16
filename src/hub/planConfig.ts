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
  | 'newsletters' | 'subscribers' | 'linktree' | 'landing-pages'
  | 'email-journeys' | 'magic-link'
  | 'website' | 'domain-settings' | 'email-template' | 'branding'
  | 'analyze' | 'notifications' | 'writers' | 'dashboard' | 'settings';

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
  freeTrial?: number;
}

export const FEATURES: Record<FeatureKey, FeatureDef> = {
  // ── FREE: available to all plans ──────────────────────
  posts:         { plan: 'free',     upgradeTitle: '' },
  outline:       { plan: 'free',     upgradeTitle: '', freeTrial: 5 },
  checker:       { plan: 'free',     upgradeTitle: '', freeTrial: 5 },
  carousel:      { plan: 'free',     upgradeTitle: '', freeTrial: 5 },
  social:        { plan: 'free',     upgradeTitle: '', freeTrial: 5 },
  notifications: { plan: 'free',     upgradeTitle: '' },
  settings:      { plan: 'free',     upgradeTitle: '' },

  // ── WRITERS: requires باقة الكاتب ─────────────────────
  dashboard:      { plan: 'writers',  upgradeTitle: 'لوحة التحكم متاحة مع النشرات البريدية' },
  newsletters:    { plan: 'writers',  upgradeTitle: 'النشرات البريدية' },
  subscribers:    { plan: 'writers',  upgradeTitle: 'إدارة المشتركين' },
  linktree:       { plan: 'writers',  upgradeTitle: 'صفحة الروابط' },
  'landing-pages':{ plan: 'writers',  upgradeTitle: 'صفحات الاشتراك' },
  'magic-link':   { plan: 'writers',  upgradeTitle: 'الرابط السحري' },
  website:        { plan: 'writers',  upgradeTitle: 'الموقع الإلكتروني' },
  analyze:        { plan: 'writers',  upgradeTitle: 'الإحصائيات المتقدمة' },

  // ── BUSINESS: requires باقة الأعمال ───────────────────
  'domain-settings': { plan: 'business', upgradeTitle: 'النطاق المخصص' },
  'email-template':  { plan: 'business', upgradeTitle: 'مصمم قوالب البريد' },
  'email-journeys':  { plan: 'business', upgradeTitle: 'رحلات البريد والأتمتة' },
  branding:          { plan: 'business', upgradeTitle: 'الهوية والعلامة التجارية' },
  writers:           { plan: 'business', upgradeTitle: 'فريق الكتّاب' },
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
  free:     { label: 'Free',     labelAr: 'الخطة المجانية', color: '#6B7280',  subscriberLimit: '0',       showSubscribers: false, canCreateNewsletter: false },
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
