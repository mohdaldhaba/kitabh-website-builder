import React, { useState, useEffect, lazy, Suspense } from 'react';
import HubLayout from './HubLayout';
import DashboardPage from './DashboardPage';
import PostsPage from './PostsPage';
import NotificationsPage from './NotificationsPage';
import GrowPage from './GrowPage';
import WebsitePage from './WebsitePage';
import MembersPage from './MembersPage';
import SettingsPage from './SettingsPage';
import AudiencePage from './AudiencePage';
import NewslettersPage from './NewslettersPage';
import AnalyzePage from './AnalyzePage';
import { icons, utilityItems as defaultUtility } from './HubLayout';
import type { Page, Publication, SidebarSection } from './HubLayout';

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

// Coming soon placeholder
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

// ─── Base path ─────────────────────────────────────────
const BASE = '/hub_v1';

// ─── V1 sidebar sections ──────────────────────────────
const v1SidebarSections: SidebarSection[] = [
  {
    id: 'create',
    label: 'اكتب',
    icon: icons.write,
    items: [
      { page: 'posts', subPage: 'all-posts', label: 'المنشورات', icon: icons.posts },
      { page: 'posts', subPage: 'outline', label: 'مساعد كتابة', icon: icons.outline },
      { page: 'posts', subPage: 'checker', label: 'محرر كتابة', icon: icons.checker },
    ],
  },
  {
    id: 'publish',
    label: 'انشر',
    icon: icons.emailJourney,
    items: [
      { page: 'newsletters', label: 'النشرة', icon: icons.emailJourney },
      { page: 'subscribers', label: 'المشتركون', icon: icons.audience },
      { page: 'grow', subPage: 'carousel', label: 'ستوديو كتابة', icon: icons.grow },
      { page: 'grow', subPage: 'social', label: 'محتوى كتابة', icon: icons.grow },
      { page: 'grow', subPage: 'linktree', label: 'صفحة الروابط', icon: icons.magicLink },
      { page: 'email-template', label: 'قالب البريد', icon: icons.posts, comingSoon: true },
      { page: 'email-journeys', label: 'رحلات البريد', icon: icons.emailJourney, comingSoon: true },
      { page: 'grow', subPage: 'magic-link', label: 'رابط سحري', icon: icons.grow, comingSoon: true },
    ],
  },
  {
    id: 'design',
    label: 'صمّم',
    icon: icons.website,
    items: [
      { page: 'website', label: 'الموقع', icon: icons.website },
      { page: 'writers', label: 'الكتّاب', icon: icons.members },
    ],
  },
];

// ─── URL → page/subPage mapping ──────────────────────
function parseUrl(): { page: Page; subPage?: string } {
  const path = window.location.pathname;
  const rel = path.startsWith(BASE) ? path.slice(BASE.length) : '';
  const segments = rel.split('/').filter(Boolean);

  if (segments.length === 0) return { page: 'dashboard' };

  const first = segments[0];
  const second = segments[1];

  switch (first) {
    case 'dashboard': return { page: 'dashboard' };
    case 'posts':
      if (second === 'outline') return { page: 'posts', subPage: 'outline' };
      if (second === 'checker') return { page: 'posts', subPage: 'checker' };
      return { page: 'posts', subPage: 'all-posts' };
    case 'newsletters': return { page: 'newsletters' };
    case 'subscribers': return { page: 'subscribers' };
    case 'grow':
      if (second === 'carousel') return { page: 'grow', subPage: 'carousel' };
      if (second === 'social') return { page: 'grow', subPage: 'social' };
      if (second === 'linktree') return { page: 'grow', subPage: 'linktree' };
      if (second === 'magic-link') return { page: 'grow', subPage: 'magic-link' };
      return { page: 'grow', subPage: 'carousel' };
    case 'website': return { page: 'website' };
    case 'members': return { page: 'writers' };
    case 'analyze': return { page: 'analyze', subPage: second };
    case 'notifications': return { page: 'notifications' };
    case 'settings':
      return { page: 'settings', subPage: second || 'account' };
    default: return { page: 'dashboard' };
  }
}

// ─── page/subPage → URL mapping ──────────────────────
function buildUrl(page: Page, subPage?: string): string {
  switch (page) {
    case 'dashboard': return `${BASE}/dashboard`;
    case 'posts':
      if (subPage === 'outline') return `${BASE}/posts/outline`;
      if (subPage === 'checker') return `${BASE}/posts/checker`;
      return `${BASE}/posts`;
    case 'newsletters': return `${BASE}/newsletters`;
    case 'email-template': return `${BASE}/newsletters/template`;
    case 'email-journeys': return `${BASE}/newsletters/journeys`;
    case 'subscribers': return `${BASE}/subscribers`;
    case 'grow':
      if (subPage === 'social') return `${BASE}/grow/social`;
      if (subPage === 'linktree') return `${BASE}/grow/linktree`;
      if (subPage === 'magic-link') return `${BASE}/grow/magic-link`;
      return `${BASE}/grow/carousel`;
    case 'website': return `${BASE}/website`;
    case 'writers': return `${BASE}/members`;
    case 'analyze':
      if (subPage) return `${BASE}/analyze/${subPage}`;
      return `${BASE}/analyze`;
    case 'notifications': return `${BASE}/notifications`;
    case 'settings':
      if (subPage && subPage !== 'account') return `${BASE}/settings/${subPage}`;
      return `${BASE}/settings`;
    default: return `${BASE}/dashboard`;
  }
}

// ─── Mock publications ──────────────────────────────────
const mockPublications: Publication[] = [
  { id: 'pub_1', name: 'رسالة السبت', slug: 'saturday-letter', subscriberCount: 1920 },
  { id: 'pub_2', name: 'نشرة التقنية', slug: 'tech-weekly', subscriberCount: 480 },
];

const BusinessHubV1: React.FC = () => {
  const initial = parseUrl();
  const [activePage, setActivePage] = useState<Page>(initial.page);
  const [activeSubPage, setActiveSubPage] = useState<string | undefined>(initial.subPage);
  const [activePublicationId, setActivePublicationId] = useState(mockPublications[0].id);

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrl();
      setActivePage(parsed.page);
      setActiveSubPage(parsed.subPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect /hub_V1 → /hub_V1/dashboard
  useEffect(() => {
    const path = window.location.pathname;
    if (path === BASE || path === `${BASE}/`) {
      window.history.replaceState(null, '', `${BASE}/dashboard`);
    }
  }, []);

  const handleNavigate = (page: Page, subPage?: string) => {
    setActivePage(page);
    setActiveSubPage(subPage);
    const url = buildUrl(page, subPage);
    window.history.pushState(null, '', url);
  };

  const handleWriteClick = () => {
    window.open('https://kitabh.com/editor/create', '_blank');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'posts':
        if (activeSubPage === 'outline') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhOutline embedded premium /></Suspense></HubToolWrapper>;
        }
        if (activeSubPage === 'checker') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhChecker /></Suspense></HubToolWrapper>;
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
            description="محرر قوالب البريد الإلكتروني سيكون متاحًا قريبًا. حاليًا يتم استخدام القالب الافتراضي من كتابة."
          />
        );
      case 'notifications':
        return <NotificationsPage />;
      case 'grow':
        if (activeSubPage === 'carousel') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhCarousel premium /></Suspense></HubToolWrapper>;
        }
        if (activeSubPage === 'social') {
          return <HubToolWrapper><Suspense fallback={<ToolLoader />}><KitabhSocial premium /></Suspense></HubToolWrapper>;
        }
        if (activeSubPage === 'linktree') {
          return <Suspense fallback={<ToolLoader />}><LinktreePage /></Suspense>;
        }
        if (activeSubPage === 'magic-link') {
          return (
            <ComingSoonPage
              title="رابط سحري"
              description="أنشئ روابط اشتراك سريعة لمشاركتها في أي مكان — قريبًا"
            />
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
        return <AudiencePage />;
      case 'analyze':
        return <AnalyzePage subPage={activeSubPage} />;
      case 'email-journeys':
        return (
          <ComingSoonPage
            title="رحلات البريد الإلكتروني"
            description="قريبًا ستتمكن من إنشاء تسلسلات بريدية تلقائية لاستقبال المشتركين الجدد وتنمية جمهورك"
          />
        );
      case 'settings':
        return <SettingsPage subPage={activeSubPage} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <HubLayout
      activePage={activePage}
      activeSubPage={activeSubPage}
      onNavigate={handleNavigate}
      publications={mockPublications}
      activePublicationId={activePublicationId}
      onSwitchPublication={setActivePublicationId}
      customSidebarSections={v1SidebarSections}
      customUtilityItems={defaultUtility}
      onWriteClick={handleWriteClick}
    >
      {renderPage()}
    </HubLayout>
  );
};

export default BusinessHubV1;
