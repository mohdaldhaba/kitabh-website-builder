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
import {
  FEATURES, PLAN_META, SECTION_LOCKS, COMPARISON_SECTIONS,
  getLockSet, getPlanTier, getUpgradeInfo, getTrialUsage, isLocked,
  type Plan, type FeatureKey,
} from './planConfig';

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

// All plan/feature config lives in planConfig.ts — single source of truth

// ─── Base path ──────────────────────────────────────────
const BASE = '/hub_v2';

// ─── URL helpers ────────────────────────────────────────
function parseUrl(): { page: Page; subPage?: string; plan?: Plan } {
  const path = window.location.pathname;
  const rel = path.startsWith(BASE) ? path.slice(BASE.length) : '';
  const segments = rel.split('/').filter(Boolean);
  const params = new URLSearchParams(window.location.search);
  const plan = (params.get('plan') as Plan) || undefined;

  if (segments.length === 0) return { page: 'posts', subPage: 'all-posts', plan };

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
    case 'branding': return { page: 'branding', plan };
    case 'members': return { page: 'writers', plan };
    case 'analyze': return { page: 'analyze', subPage: second, plan };
    case 'notifications': return { page: 'notifications', plan };
    case 'settings':
      return { page: 'settings', subPage: second || 'account', plan };
    default: return { page: 'posts', subPage: 'all-posts', plan };
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
    case 'branding': path = `${BASE}/branding`; break;
    case 'writers': path = `${BASE}/members`; break;
    case 'analyze':
      path = subPage ? `${BASE}/analyze/${subPage}` : `${BASE}/analyze`;
      break;
    case 'notifications': path = `${BASE}/notifications`; break;
    case 'settings':
      path = subPage && subPage !== 'account' ? `${BASE}/settings/${subPage}` : `${BASE}/settings`;
      break;
    default: path = `${BASE}/posts`;
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
  const locks = getLockSet(plan);
  const sectionLocks = SECTION_LOCKS[plan];

  const applyMeta = (items: SidebarItem[]): SidebarItem[] =>
    items.map((item) => {
      const key = getFeatureKey(item);
      return {
        ...item,
        locked: locks.has(key),
        planTier: getPlanTier(key),
        trialUsage: getTrialUsage(key, plan),
      };
    });

  return [
    {
      id: 'create',
      label: 'اكتب',
      icon: icons.write,
      items: applyMeta([
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
      locked: sectionLocks.has('publish'),
      planTier: 'writers',
      items: applyMeta([
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
      locked: sectionLocks.has('design'),
      planTier: 'writers',
      items: applyMeta([
        { page: 'website', label: 'الموقع', icon: icons.website },
        { page: 'branding' as Page, label: 'الهوية والعلامة', icon: icons.branding },
        { page: 'domain-settings' as Page, label: 'إعدادات النطاق', icon: icons.domainSettings },
        { page: 'email-template', label: 'قالب البريد', icon: icons.emailTemplate },
      ]),
    },
  ];
}

function buildUtilityItems(plan: Plan): SidebarItem[] {
  const locks = getLockSet(plan);
  return [
    { page: 'analyze', label: 'الإحصائيات', icon: icons.analyze, locked: locks.has('analyze'), planTier: getPlanTier('analyze') },
    { page: 'writers' as Page, label: 'فريق الكتّاب', icon: icons.members, locked: locks.has('writers'), planTier: getPlanTier('writers') },
    { page: 'notifications', label: 'الإشعارات', icon: icons.notification },
  ];
}

// ─── Upgrade Modal (simplified) ─────────────────────────
const UpgradeModal: React.FC<{
  featureKey: FeatureKey;
  currentPlan: Plan;
  onClose: () => void;
}> = ({ featureKey, currentPlan, onClose }) => {
  const reason = getUpgradeInfo(featureKey);
  if (!reason || !reason.title) return null;

  const planColor = '#111827';
  const planColorHover = '#000';

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
            maxWidth: 360, width: '90%', direction: 'rtl',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
            textAlign: 'center',
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
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#6B7280',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h3 style={{
            fontSize: 17, fontWeight: 700,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            margin: '0 0 8px', color: '#111827',
          }}>
            {reason.title}
          </h3>

          <p style={{
            fontSize: 14, color: '#6B7280',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            margin: '0 0 24px', lineHeight: 1.6,
          }}>
            هذه الميزة متاحة في <strong style={{ color: '#111827' }}>{reason.targetPlan}</strong>
          </p>

          {/* CTA */}
          <button
            onClick={() => {
              window.location.href = '/pricing';
            }}
            style={{
              width: '100%', padding: '12px 20px',
              background: planColor, color: '#fff',
              border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = planColorHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = planColor)}
          >
            باقات كتابة
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Plan Comparison Overlay ─────────────────────────────
const PlanComparisonOverlay: React.FC<{ currentPlan: Plan; onClose: () => void }> = ({ currentPlan, onClose }) => {
  const plans: Plan[] = ['free', 'writers', 'business'];
  const font = 'IBM Plex Sans Arabic, sans-serif';

  const VerifiedBadge = ({ color }: { color: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill={color} />
      <path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const freeCheck = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
  const dash = <span style={{ color: '#D1D5DB', fontSize: 16, fontWeight: 500 }}>—</span>;

  const renderCell = (feat: { key: FeatureKey; freeNote?: string; writersNote?: string; businessNote?: string }, p: Plan) => {
    const available = !isLocked(feat.key, p);

    if (!available) return dash;

    // Available — each column uses its own badge color
    if (p === 'free') {
      if (feat.freeNote) return <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: font }}>{feat.freeNote}</span>;
      return freeCheck;
    }
    if (p === 'writers') {
      if (feat.writersNote) return <span style={{ fontSize: 10, color: '#0000FF', fontFamily: font, fontWeight: 600 }}>{feat.writersNote}</span>;
      return <VerifiedBadge color="#0000FF" />;
    }
    // business
    if (feat.businessNote) return <span style={{ fontSize: 10, color: '#F59E0B', fontFamily: font, fontWeight: 600 }}>{feat.businessNote}</span>;
    return <VerifiedBadge color="#F59E0B" />;
  };

  const planHeaderColors: Record<Plan, { bg: string; border: string; text: string }> = {
    free: { bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280' },
    writers: { bg: '#EFF6FF', border: '#BFDBFE', text: '#0000FF' },
    business: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20, padding: 0,
          maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto',
          direction: 'rtl', boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.6)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, fontFamily: font, margin: '0 0 2px', color: '#111827' }}>
                ما الذي تتضمنه باقتك
              </h2>
              <p style={{ fontSize: 12, color: '#9CA3AF', fontFamily: font, margin: 0 }}>
                مقارنة بين الباقات الثلاث
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
                borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#9CA3AF', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plan column headers — sticky */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)',
          padding: '10px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 1,
        }}>
          <div />
          {plans.map((p) => {
            const hc = planHeaderColors[p];
            return (
              <div key={p} style={{
                textAlign: 'center', fontFamily: font, padding: '6px 4px',
                background: currentPlan === p ? hc.bg : 'transparent',
                borderRadius: 8,
                border: currentPlan === p ? `1px solid ${hc.border}` : '1px solid transparent',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: hc.text }}>
                  {PLAN_META[p].labelAr}
                </div>
                {currentPlan === p && (
                  <div style={{ fontSize: 9, color: hc.text, opacity: 0.7, marginTop: 1 }}>باقتك الحالية</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature sections */}
        <div style={{ padding: '4px 0 8px' }}>
          {COMPARISON_SECTIONS.map((section) => (
            <div key={section.title}>
              <div style={{
                padding: '14px 20px 6px', fontSize: 11, fontWeight: 700,
                color: '#9CA3AF', fontFamily: font, letterSpacing: 0.3,
              }}>
                {section.title}
              </div>

              {section.features.map((feat, i) => (
                <div
                  key={feat.key}
                  style={{
                    display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)',
                    padding: '9px 20px', alignItems: 'center',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                    borderRadius: 6, margin: '0 8px',
                  }}
                >
                  <div style={{ fontSize: 13, fontFamily: font, color: '#374151', fontWeight: 500 }}>
                    {feat.label}
                  </div>
                  {plans.map((p) => (
                    <div key={p} style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 24 }}>
                      {renderCell(feat, p)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* Limits section */}
          <div>
            <div style={{
              padding: '14px 20px 6px', fontSize: 11, fontWeight: 700,
              color: '#9CA3AF', fontFamily: font, letterSpacing: 0.3,
            }}>
              الحدود
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)',
              padding: '9px 20px', alignItems: 'center', margin: '0 8px',
            }}>
              <div style={{ fontSize: 13, fontFamily: font, color: '#374151', fontWeight: 500 }}>
                عدد المشتركين
              </div>
              {plans.map((p) => (
                <div key={p} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: font }}>
                  {p === 'free' ? dash : PLAN_META[p].subscriberLimit}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <button
            onClick={() => { window.location.href = '/pricing'; }}
            style={{
              padding: '10px 28px', background: '#111827', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              fontFamily: font, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            عرض الباقات والأسعار
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Tier Switcher Bar ──────────────────────────────────
const TierSwitcher: React.FC<{ plan: Plan; onChange: (plan: Plan) => void }> = ({ plan, onChange }) => {
  const plans: { key: Plan; label: string; labelEn: string; color: string }[] = [
    { key: 'free', label: 'مجانية', labelEn: 'Free', color: '#6B7280' },
    { key: 'writers', label: 'الكاتب', labelEn: 'Writers', color: '#2563EB' },
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
        عرض الباقة:
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

// ─── Mock publications per plan ─────────────────────────
const freePublication: Publication[] = [
  { id: 'blog_1', name: 'مدونتي', slug: 'my-blog', subscriberCount: 0 },
];

const paidPublications: Publication[] = [
  { id: 'pub_1', name: 'رسالة السبت', slug: 'saturday-letter', subscriberCount: 1920 },
  { id: 'pub_2', name: 'نشرة التقنية', slug: 'tech-weekly', subscriberCount: 480 },
];

// ─── Main Component ─────────────────────────────────────
const BusinessHubV2: React.FC = () => {
  const initial = parseUrl();
  // Free plan defaults to posts, not dashboard
  const defaultPage = (initial.plan || 'free') === 'free' ? 'posts' : initial.page;
  const defaultSubPage = (initial.plan || 'free') === 'free' && initial.page === 'dashboard' ? 'all-posts' : initial.subPage;

  const [activePage, setActivePage] = useState<Page>(defaultPage);
  const [activeSubPage, setActiveSubPage] = useState<string | undefined>(defaultSubPage || (defaultPage === 'posts' ? 'all-posts' : undefined));
  const [activePublicationId, setActivePublicationId] = useState('pub_1');
  const [plan, setPlan] = useState<Plan>(initial.plan || 'free');
  const [upgradeModal, setUpgradeModal] = useState<FeatureKey | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const publications = plan === 'free' ? freePublication : paidPublications;

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
      const defaultPath = plan === 'free' ? 'posts' : 'dashboard';
      window.history.replaceState(null, '', `${BASE}/${defaultPath}?${params.toString()}`);
    }
  }, []);

  const handlePlanChange = (newPlan: Plan) => {
    setPlan(newPlan);
    const params = new URLSearchParams(window.location.search);
    params.set('plan', newPlan);

    // Free plan goes to posts, paid plans go to dashboard
    const currentKey = getFeatureKey({ page: activePage, subPage: activeSubPage });
    if (isLocked(currentKey, newPlan)) {
      const fallback = newPlan === 'free' ? 'posts' : 'dashboard';
      setActivePage(fallback as Page);
      setActiveSubPage(fallback === 'posts' ? 'all-posts' : undefined);
      window.history.pushState(null, '', `${BASE}/${fallback}?${params.toString()}`);
    } else {
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  const handleNavigate = (page: Page, subPage?: string) => {
    // Check if locked
    const key = getFeatureKey({ page, subPage });
    if (isLocked(key, plan)) {
      setUpgradeModal(key);
      return;
    }
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
  const meta = PLAN_META[plan];

  const renderPage = () => {
    // Check if current page is locked
    const currentKey = getFeatureKey({ page: activePage, subPage: activeSubPage });
    if (isLocked(currentKey, plan)) {
      return <PostsPage subPage="all-posts" />;
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'posts':
        if (activeSubPage === 'outline') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhOutline embedded premium={plan !== 'free'} /></Suspense></HubToolWrapper>;
        }
        if (activeSubPage === 'checker') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhChecker embedded premium={plan !== 'free'} /></Suspense></HubToolWrapper>;
        }
        return <PostsPage subPage={activeSubPage} />;
      case 'newsletters': {
        const pubIndex = paidPublications.findIndex(p => p.id === activePublicationId);
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
        const activePub = paidPublications.find(p => p.id === activePublicationId) || paidPublications[0];
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
      case 'branding':
        return (
          <ComingSoonPage
            title="الهوية والعلامة التجارية"
            description="تحكم في هوية علامتك التجارية — الشعار، الألوان، الخطوط، وأسلوب موقعك ونشراتك البريدية."
          />
        );
      case 'settings':
        return <SettingsPage subPage={activeSubPage} subdomainLocked={plan === 'free'} onSubdomainLockedClick={() => { window.location.href = '/pricing'; }} customDomainLocked={plan !== 'business'} onCustomDomainLockedClick={() => setUpgradeModal('domain-settings')} />;
      default:
        return <PostsPage subPage="all-posts" />;
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
          publications={publications}
          activePublicationId={plan === 'free' ? 'blog_1' : activePublicationId}
          onSwitchPublication={setActivePublicationId}
          customSidebarSections={sidebarSections}
          customUtilityItems={utilityItems}
          onWriteClick={handleWriteClick}
          planName={meta.labelAr}
          onLockedClick={handleLockedClick}
          subscriberLimit={meta.subscriberLimit}
          showSubscribers={meta.showSubscribers}
          dashboardLocked={isLocked('dashboard', plan)}
          dashboardPlanTier="writers"
          createNewsletterLocked={!PLAN_META[plan].canCreateNewsletter}
          onCreateNewsletterLockedClick={() => setUpgradeModal('newsletters')}
          onCompareClick={() => setShowComparison(true)}
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
      {showComparison && (
        <PlanComparisonOverlay
          currentPlan={plan}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
};

export default BusinessHubV2;
