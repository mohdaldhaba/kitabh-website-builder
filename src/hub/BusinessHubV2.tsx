import React, { useState, useEffect, lazy, Suspense } from 'react';
import HubLayout from './HubLayout';
import DashboardPage from './DashboardPage';
import PostsPage from './PostsPage';
import NotificationsPage from './NotificationsPage';
import GrowPage from './GrowPage';
import WebsitePage from './WebsitePage';
import MembersPage from './MembersPage';
import SettingsPage from './SettingsPage';
import KitabhSubscribers from './KitabhSubscribers';
import KitabhAutomations from './KitabhAutomations';
import KitabhLandingPages from './KitabhLandingPages';
import KitabhDomainSettings from './KitabhDomainSettings';
import NewslettersPage from './NewslettersPage';
import AnalyzePage from './AnalyzePage';
import { icons, utilityItems as defaultUtility } from './HubLayout';
import type { Page, Publication, SidebarSection, SidebarItem } from './HubLayout';

import HubToolWrapper from './components/HubToolWrapper';

// Lazy-load tool components
const KitabhOutline = lazy(() => import('../tools/KitabhOutline'));
const KitabhChecker = lazy(() => import('../tools/KitabhChecker'));
const KitabhSocial = lazy(() => import('../tools/KitabhSocial'));
const KitabhCarousel = lazy(() => import('../tools/KitabhCarousel'));
const LinktreePage = lazy(() => import('./LinktreePage'));

const ToolLoader: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
    <div style={{ fontSize: 14, color: '#6B7280', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
      جارٍ التحميل...
    </div>
  </div>
);

const ComingSoonPage: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
    <div style={{
      width: 64, height: 64, borderRadius: 16, background: '#F3F4F6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px', fontSize: 28,
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    </div>
    <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      {title}
    </h2>
    <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px', lineHeight: 1.7 }}>
      {description}
    </p>
    <span style={{
      display: 'inline-block', padding: '6px 16px', background: '#F3F4F6',
      borderRadius: 8, fontSize: 13, fontWeight: 600,
      fontFamily: 'IBM Plex Sans Arabic, sans-serif', color: '#9CA3AF',
    }}>
      قريبًا
    </span>
  </div>
);

// ─── Types ──────────────────────────────────────────────
type Plan = 'free' | 'writers' | 'business';

type FeatureKey =
  | 'posts' | 'outline' | 'checker' | 'carousel' | 'social'
  | 'newsletters' | 'subscribers' | 'linktree' | 'landing-pages'
  | 'email-journeys' | 'magic-link'
  | 'website' | 'domain-settings' | 'email-template'
  | 'analyze' | 'notifications' | 'writers' | 'dashboard' | 'settings';

// ─── Feature lock map ───────────────────────────────────
// true = locked for that plan
const lockMap: Record<Plan, Set<FeatureKey>> = {
  free: new Set([
    'newsletters',
    'subscribers',
    'linktree',
    'landing-pages',
    'email-journeys',
    'magic-link',
    'website',
    'domain-settings',
    'email-template',
    'writers',
  ]),
  writers: new Set([
    'domain-settings',
    'email-template',
    'email-journeys',
    'writers',
  ]),
  business: new Set([]),
};

// ─── Plan metadata ──────────────────────────────────────
const planMeta: Record<Plan, { label: string; labelAr: string; color: string; subscriberLimit: string }> = {
  free: { label: 'Free', labelAr: 'الخطة المجانية', color: '#6B7280', subscriberLimit: '100' },
  writers: { label: 'Writers', labelAr: 'خطة الكتّاب', color: '#2563EB', subscriberLimit: '2,500' },
  business: { label: 'Business', labelAr: 'خطة الأعمال', color: '#111827', subscriberLimit: '25,000' },
};

// ─── Upgrade reasons per feature ────────────────────────
const upgradeReasons: Record<FeatureKey, { title: string; features: string[]; targetPlan: string }> = {
  newsletters: {
    title: 'النشرات البريدية',
    features: ['إرسال نشرات بريدية', 'جدولة الإرسال', 'إحصائيات البريد'],
    targetPlan: 'خطة الكتّاب',
  },
  subscribers: {
    title: 'إدارة المشتركين',
    features: ['استيراد المشتركين', 'قوائم المشتركين', 'تصدير البيانات'],
    targetPlan: 'خطة الكتّاب',
  },
  linktree: {
    title: 'صفحة الروابط',
    features: ['صفحة روابط مخصصة', 'ربط وسائل التواصل', 'تتبع النقرات'],
    targetPlan: 'خطة الكتّاب',
  },
  'landing-pages': {
    title: 'صفحات الاشتراك',
    features: ['صفحات هبوط مخصصة', 'نماذج اشتراك', 'تصاميم متعددة'],
    targetPlan: 'خطة الكتّاب',
  },
  'email-journeys': {
    title: 'رحلات البريد',
    features: ['أتمتة البريد', 'تسلسلات ترحيبية', 'شرائح مخصصة'],
    targetPlan: 'خطة الأعمال',
  },
  'magic-link': {
    title: 'الرابط السحري',
    features: ['روابط اشتراك سريعة', 'مشاركة فورية', 'تتبع التحويلات'],
    targetPlan: 'خطة الكتّاب',
  },
  website: {
    title: 'الموقع',
    features: ['قوالب مواقع', 'نطاق فرعي', 'صفحات مخصصة'],
    targetPlan: 'خطة الكتّاب',
  },
  'domain-settings': {
    title: 'النطاق المخصص',
    features: ['نطاق مخصص', 'إزالة علامة كتابة', 'شهادة SSL'],
    targetPlan: 'خطة الأعمال',
  },
  'email-template': {
    title: 'قالب البريد',
    features: ['تصميم قوالب مخصصة', 'خطوط مخصصة', 'ألوان العلامة التجارية'],
    targetPlan: 'خطة الأعمال',
  },
  writers: {
    title: 'فريق الكتّاب',
    features: ['إضافة كتّاب', 'أدوار وصلاحيات', 'مراجعة المحتوى'],
    targetPlan: 'خطة الأعمال',
  },
  // These are never locked but included for type completeness
  posts: { title: '', features: [], targetPlan: '' },
  outline: { title: '', features: [], targetPlan: '' },
  checker: { title: '', features: [], targetPlan: '' },
  carousel: { title: '', features: [], targetPlan: '' },
  social: { title: '', features: [], targetPlan: '' },
  analyze: { title: '', features: [], targetPlan: '' },
  notifications: { title: '', features: [], targetPlan: '' },
  dashboard: { title: '', features: [], targetPlan: '' },
  settings: { title: '', features: [], targetPlan: '' },
};

// ─── Base path ──────────────────────────────────────────
const BASE = '/hub_v2';

// ─── URL helpers ────────────────────────────────────────
function parseUrl(): { page: Page; subPage?: string; plan?: Plan } {
  const path = window.location.pathname;
  const rel = path.startsWith(BASE) ? path.slice(BASE.length) : '';
  const segments = rel.split('/').filter(Boolean);
  const params = new URLSearchParams(window.location.search);
  const plan = (params.get('plan') as Plan) || undefined;

  if (segments.length === 0) return { page: 'dashboard', plan };

  const first = segments[0];
  const second = segments[1];

  switch (first) {
    case 'dashboard': return { page: 'dashboard', plan };
    case 'posts':
      if (second === 'outline') return { page: 'posts', subPage: 'outline', plan };
      if (second === 'checker') return { page: 'posts', subPage: 'checker', plan };
      return { page: 'posts', subPage: 'all-posts', plan };
    case 'newsletters':
      if (second === 'journeys') return { page: 'email-journeys', plan };
      return { page: 'newsletters', plan };
    case 'subscribers': return { page: 'subscribers', plan };
    case 'grow':
      if (second === 'carousel') return { page: 'grow', subPage: 'carousel', plan };
      if (second === 'social') return { page: 'grow', subPage: 'social', plan };
      if (second === 'linktree') return { page: 'grow', subPage: 'linktree', plan };
      if (second === 'magic-link') return { page: 'grow', subPage: 'magic-link', plan };
      return { page: 'grow', subPage: 'carousel', plan };
    case 'website': return { page: 'website', plan };
    case 'landing-pages': return { page: 'landing-pages', plan };
    case 'domain-settings': return { page: 'domain-settings', plan };
    case 'members': return { page: 'writers', plan };
    case 'analyze': return { page: 'analyze', subPage: second, plan };
    case 'notifications': return { page: 'notifications', plan };
    case 'settings':
      return { page: 'settings', subPage: second || 'account', plan };
    default: return { page: 'dashboard', plan };
  }
}

function buildUrl(page: Page, subPage?: string): string {
  const params = new URLSearchParams(window.location.search);
  const qs = params.toString() ? `?${params.toString()}` : '';
  let path: string;

  switch (page) {
    case 'dashboard': path = `${BASE}/dashboard`; break;
    case 'posts':
      if (subPage === 'outline') path = `${BASE}/posts/outline`;
      else if (subPage === 'checker') path = `${BASE}/posts/checker`;
      else path = `${BASE}/posts`;
      break;
    case 'newsletters': path = `${BASE}/newsletters`; break;
    case 'email-template': path = `${BASE}/newsletters/template`; break;
    case 'email-journeys': path = `${BASE}/newsletters/journeys`; break;
    case 'subscribers': path = `${BASE}/subscribers`; break;
    case 'grow':
      if (subPage === 'social') path = `${BASE}/grow/social`;
      else if (subPage === 'linktree') path = `${BASE}/grow/linktree`;
      else if (subPage === 'magic-link') path = `${BASE}/grow/magic-link`;
      else path = `${BASE}/grow/carousel`;
      break;
    case 'website': path = `${BASE}/website`; break;
    case 'landing-pages': path = `${BASE}/landing-pages`; break;
    case 'domain-settings': path = `${BASE}/domain-settings`; break;
    case 'writers': path = `${BASE}/members`; break;
    case 'analyze':
      path = subPage ? `${BASE}/analyze/${subPage}` : `${BASE}/analyze`;
      break;
    case 'notifications': path = `${BASE}/notifications`; break;
    case 'settings':
      path = subPage && subPage !== 'account' ? `${BASE}/settings/${subPage}` : `${BASE}/settings`;
      break;
    default: path = `${BASE}/dashboard`;
  }

  return `${path}${qs}`;
}

// ─── Get feature key from sidebar item ──────────────────
function getFeatureKey(item: { page: Page; subPage?: string }): FeatureKey {
  if (item.page === 'posts' && item.subPage === 'outline') return 'outline';
  if (item.page === 'posts' && item.subPage === 'checker') return 'checker';
  if (item.page === 'grow' && item.subPage === 'carousel') return 'carousel';
  if (item.page === 'grow' && item.subPage === 'social') return 'social';
  if (item.page === 'grow' && item.subPage === 'linktree') return 'linktree';
  if (item.page === 'grow' && item.subPage === 'magic-link') return 'magic-link';
  return item.page as FeatureKey;
}

// ─── Build sidebar sections with lock state ─────────────
function buildSidebarSections(plan: Plan): SidebarSection[] {
  const locks = lockMap[plan];

  const applyLock = (items: SidebarItem[]): SidebarItem[] =>
    items.map((item) => ({
      ...item,
      locked: locks.has(getFeatureKey(item)),
    }));

  return [
    {
      id: 'create',
      label: 'اكتب',
      icon: icons.write,
      items: applyLock([
        { page: 'posts', subPage: 'all-posts', label: 'المنشورات', icon: icons.posts },
        { page: 'posts', subPage: 'outline', label: 'مساعد كتابة', icon: icons.outline },
        { page: 'posts', subPage: 'checker', label: 'محرر كتابة', icon: icons.checker },
        { page: 'grow', subPage: 'carousel', label: 'ستوديو كتابة', icon: icons.carousel },
        { page: 'grow', subPage: 'social', label: 'محتوى كتابة', icon: icons.social },
      ]),
    },
    {
      id: 'publish',
      label: 'انشر',
      icon: icons.emailJourney,
      items: applyLock([
        { page: 'newsletters', label: 'النشرة', icon: icons.emailJourney },
        { page: 'subscribers', label: 'المشتركون', icon: icons.audience },
        { page: 'grow', subPage: 'linktree', label: 'صفحة الروابط', icon: icons.magicLink },
        { page: 'landing-pages' as Page, label: 'صفحات الاشتراك', icon: icons.landingPage },
        { page: 'email-journeys', label: 'رحلات البريد', icon: icons.emailJourney },
        { page: 'grow', subPage: 'magic-link', label: 'رابط سحري', icon: icons.magicLink, comingSoon: true },
      ]),
    },
    {
      id: 'design',
      label: 'صمّم',
      icon: icons.website,
      items: applyLock([
        { page: 'website', label: 'الموقع', icon: icons.website },
        { page: 'domain-settings' as Page, label: 'إعدادات النطاق', icon: icons.domainSettings },
        { page: 'email-template', label: 'قالب البريد', icon: icons.emailTemplate },
      ]),
    },
  ];
}

function buildUtilityItems(plan: Plan): SidebarItem[] {
  const locks = lockMap[plan];
  return [
    { page: 'analyze', label: 'الإحصائيات', icon: icons.analyze },
    { page: 'notifications', label: 'الإشعارات', icon: icons.notification },
    { page: 'writers' as Page, label: 'الكتّاب', icon: icons.members, locked: locks.has('writers') },
  ];
}

// ─── Upgrade Modal ──────────────────────────────────────
const UpgradeModal: React.FC<{
  featureKey: FeatureKey;
  currentPlan: Plan;
  onClose: () => void;
}> = ({ featureKey, currentPlan, onClose }) => {
  const reason = upgradeReasons[featureKey];
  if (!reason || !reason.title) return null;

  const nextPlan = currentPlan === 'free' ? 'writers' : 'business';
  const nextPlanLabel = currentPlan === 'free' ? 'خطة الكتّاب' : 'خطة الأعمال';
  const nextPlanPrice = currentPlan === 'free' ? '$9' : '$29';

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: '#fff', borderRadius: 16, padding: '32px 28px',
            maxWidth: 400, width: '90%', direction: 'rtl',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, left: 12, background: 'none',
              border: 'none', cursor: 'pointer', padding: 4, color: '#9CA3AF',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Lock icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(225,29,72,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: '#E11D48',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h3 style={{
            fontSize: 18, fontWeight: 700,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            textAlign: 'center', margin: '0 0 8px', color: '#111827',
          }}>
            {reason.title}
          </h3>

          <p style={{
            fontSize: 14, color: '#6B7280',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            textAlign: 'center', margin: '0 0 20px', lineHeight: 1.6,
          }}>
            هذه الميزة متاحة في {reason.targetPlan}.
          </p>

          {/* Feature list */}
          <div style={{
            background: '#F9FAFB', borderRadius: 10, padding: '14px 16px',
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#9CA3AF',
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              marginBottom: 10,
            }}>
              قم بالترقية لفتح:
            </div>
            {reason.features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: i < reason.features.length - 1 ? 8 : 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{
                  fontSize: 13, color: '#374151',
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                }}>
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              window.location.href = '/pricing';
            }}
            style={{
              width: '100%', padding: '12px 20px',
              background: '#111827', color: '#fff',
              border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#000')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#111827')}
          >
            ترقية الآن — {nextPlanPrice}/شهريًا
          </button>

          <p style={{
            fontSize: 11, color: '#9CA3AF', textAlign: 'center',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            margin: '10px 0 0',
          }}>
            يمكنك الإلغاء في أي وقت
          </p>
        </div>
      </div>
    </>
  );
};

// ─── Tier Switcher Bar ──────────────────────────────────
const TierSwitcher: React.FC<{ plan: Plan; onChange: (plan: Plan) => void }> = ({ plan, onChange }) => {
  const plans: { key: Plan; label: string; labelEn: string; color: string }[] = [
    { key: 'free', label: 'مجانية', labelEn: 'Free', color: '#6B7280' },
    { key: 'writers', label: 'الكتّاب', labelEn: 'Writers', color: '#2563EB' },
    { key: 'business', label: 'الأعمال', labelEn: 'Business', color: '#111827' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
      height: 44, background: '#111827',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      direction: 'rtl',
      fontFamily: 'IBM Plex Sans Arabic, sans-serif',
    }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 12 }}>
        عرض الخطة:
      </span>
      {plans.map((p) => {
        const isActive = plan === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            style={{
              padding: '5px 14px',
              background: isActive ? '#fff' : 'rgba(255,255,255,0.1)',
              color: isActive ? p.color : 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {p.label}
            <span style={{
              fontSize: 10, opacity: 0.6,
              fontFamily: 'monospace',
            }}>
              {p.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── AI Usage Banner (for free plan) ────────────────────
const AIUsageBanner: React.FC = () => (
  <div style={{
    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    border: '1px solid #F59E0B',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    direction: 'rtl',
    fontFamily: 'IBM Plex Sans Arabic, sans-serif',
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
        الخطة المجانية — 5 استخدامات يوميًا لأدوات الذكاء الاصطناعي
      </div>
      <div style={{ fontSize: 12, color: '#92400E', opacity: 0.8 }}>
        مساعد كتابة، محرر كتابة، ستوديو كتابة، محتوى كتابة
      </div>
    </div>
  </div>
);

// ─── Mock publications ──────────────────────────────────
const mockPublications: Publication[] = [
  { id: 'pub_1', name: 'رسالة السبت', slug: 'saturday-letter', subscriberCount: 1920 },
  { id: 'pub_2', name: 'نشرة التقنية', slug: 'tech-weekly', subscriberCount: 480 },
];

// ─── Main Component ─────────────────────────────────────
const BusinessHubV2: React.FC = () => {
  const initial = parseUrl();
  const [activePage, setActivePage] = useState<Page>(initial.page);
  const [activeSubPage, setActiveSubPage] = useState<string | undefined>(initial.subPage);
  const [activePublicationId, setActivePublicationId] = useState(mockPublications[0].id);
  const [plan, setPlan] = useState<Plan>(initial.plan || 'free');
  const [upgradeModal, setUpgradeModal] = useState<FeatureKey | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrl();
      setActivePage(parsed.page);
      setActiveSubPage(parsed.subPage);
      if (parsed.plan) setPlan(parsed.plan);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === BASE || path === `${BASE}/`) {
      const params = new URLSearchParams(window.location.search);
      if (!params.has('plan')) params.set('plan', plan);
      window.history.replaceState(null, '', `${BASE}/dashboard?${params.toString()}`);
    }
  }, []);

  const handlePlanChange = (newPlan: Plan) => {
    setPlan(newPlan);
    const params = new URLSearchParams(window.location.search);
    params.set('plan', newPlan);
    const path = window.location.pathname;
    window.history.replaceState(null, '', `${path}?${params.toString()}`);

    // If current page is locked in the new plan, redirect to dashboard
    const currentKey = getFeatureKey({ page: activePage, subPage: activeSubPage });
    if (lockMap[newPlan].has(currentKey)) {
      setActivePage('dashboard');
      setActiveSubPage(undefined);
      window.history.pushState(null, '', `${BASE}/dashboard?${params.toString()}`);
    }
  };

  const handleNavigate = (page: Page, subPage?: string) => {
    setActivePage(page);
    setActiveSubPage(subPage);
    const url = buildUrl(page, subPage);
    window.history.pushState(null, '', url);
  };

  const handleLockedClick = (item: SidebarItem) => {
    const key = getFeatureKey(item);
    setUpgradeModal(key);
  };

  const handleWriteClick = () => {
    window.open('https://kitabh.com/editor/create', '_blank');
  };

  const sidebarSections = buildSidebarSections(plan);
  const utilityItems = buildUtilityItems(plan);
  const meta = planMeta[plan];

  const renderPage = () => {
    // Check if current page is locked
    const currentKey = getFeatureKey({ page: activePage, subPage: activeSubPage });
    if (lockMap[plan].has(currentKey)) {
      return <DashboardPage />;
    }

    switch (activePage) {
      case 'dashboard':
        return (
          <>
            {plan === 'free' && <AIUsageBanner />}
            <DashboardPage />
          </>
        );
      case 'posts':
        if (activeSubPage === 'outline') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhOutline embedded premium={plan !== 'free'} /></Suspense></HubToolWrapper>;
        }
        if (activeSubPage === 'checker') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhChecker embedded premium={plan !== 'free'} /></Suspense></HubToolWrapper>;
        }
        return <PostsPage subPage={activeSubPage} />;
      case 'newsletters': {
        const pubIndex = mockPublications.findIndex(p => p.id === activePublicationId);
        return <NewslettersPage activePublicationIndex={pubIndex >= 0 ? pubIndex : 0} />;
      }
      case 'email-template':
        return (
          <ComingSoonPage
            title="قالب البريد الإلكتروني"
            description="محرر قوالب البريد الإلكتروني سيكون متاحًا قريبًا."
          />
        );
      case 'notifications':
        return <NotificationsPage />;
      case 'grow':
        if (activeSubPage === 'carousel') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhCarousel premium={plan !== 'free'} embedded /></Suspense></HubToolWrapper>;
        }
        if (activeSubPage === 'social') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhSocial premium={plan !== 'free'} embedded /></Suspense></HubToolWrapper>;
        }
        if (activeSubPage === 'linktree') {
          return <Suspense fallback={<ToolLoader />}><LinktreePage /></Suspense>;
        }
        if (activeSubPage === 'magic-link') {
          return (
            <ComingSoonPage title="رابط سحري" description="أنشئ روابط اشتراك سريعة لمشاركتها في أي مكان — قريبًا" />
          );
        }
        return <GrowPage subPage={activeSubPage} />;
      case 'website': {
        const activePub = mockPublications.find(p => p.id === activePublicationId) || mockPublications[0];
        return <WebsitePage publicationName={activePub.name} publicationSlug={activePub.slug} />;
      }
      case 'writers':
        return <MembersPage />;
      case 'subscribers':
        return <KitabhSubscribers />;
      case 'analyze':
        return <AnalyzePage subPage={activeSubPage} />;
      case 'email-journeys':
        return <KitabhAutomations />;
      case 'landing-pages':
        return <KitabhLandingPages />;
      case 'domain-settings':
        return <KitabhDomainSettings />;
      case 'settings':
        return <SettingsPage subPage={activeSubPage} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <TierSwitcher plan={plan} onChange={handlePlanChange} />
      <div style={{ paddingTop: 44 }}>
        <HubLayout
          activePage={activePage}
          activeSubPage={activeSubPage}
          onNavigate={handleNavigate}
          publications={mockPublications}
          activePublicationId={activePublicationId}
          onSwitchPublication={setActivePublicationId}
          customSidebarSections={sidebarSections}
          customUtilityItems={utilityItems}
          onWriteClick={handleWriteClick}
          planName={meta.labelAr}
          onLockedClick={handleLockedClick}
        >
          {renderPage()}
        </HubLayout>
      </div>
      {upgradeModal && (
        <UpgradeModal
          featureKey={upgradeModal}
          currentPlan={plan}
          onClose={() => setUpgradeModal(null)}
        />
      )}
    </>
  );
};

export default BusinessHubV2;
