import React, { useState, useEffect, createContext, useContext } from 'react';

// ─── Icons (inline SVG paths) ────────────────────────────
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  posts: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  audience: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  grow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  website: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  analyze: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  write: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  chevron: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  magicLink: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  notification: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  members: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  help: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  emailJourney: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  subdomain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  outline: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  checker: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  carousel: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  social: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  landingPage: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  domainSettings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  emailTemplate: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" /><polyline points="21,6 12,13 3,6" /><path d="M18.5 15.5l2 2" /><circle cx="17" cy="17" r="3" />
    </svg>
  ),
  branding: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
    </svg>
  ),
  support: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  segments: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2v10l7 4" />
    </svg>
  ),
  customFonts: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
};

// ─── Types ───────────────────────────────────────────────
type Page = 'dashboard' | 'posts' | 'newsletters' | 'email-template' | 'notifications' | 'grow' | 'website' | 'writers' | 'subscribers' | 'email-journeys' | 'analyze' | 'settings' | 'landing-pages' | 'domain-settings' | 'branding' | 'subscriber-segments' | 'custom-fonts' | 'support';

interface Publication {
  id: string;
  name: string;
  slug: string;
  subscriberCount: number;
}

interface HubLayoutProps {
  children: React.ReactNode;
  activePage: Page;
  activeSubPage?: string;
  onNavigate: (page: Page, subPage?: string) => void;
  displayName?: string;
  publications?: Publication[];
  activePublicationId?: string;
  onSwitchPublication?: (id: string) => void;
  customSidebarSections?: SidebarSection[];
  customUtilityItems?: SidebarItem[];
  onWriteClick?: () => void;
  planName?: string;
  onLockedClick?: (item: SidebarItem) => void;
  subscriberLimit?: string;
  showSubscribers?: boolean;
  dashboardLocked?: boolean;
  dashboardPlanTier?: 'writers' | 'business';
  createNewsletterLocked?: boolean;
  onCreateNewsletterLockedClick?: () => void;
  onCompareClick?: () => void;
}

// ─── Section-based sidebar structure ─────────────────────
type SidebarItem = {
  page: Page;
  subPage?: string;
  label: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  locked?: boolean;
  planTier?: 'writers' | 'business';
  trialUsage?: { used: number; total: number };
};

type SidebarSection = {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: SidebarItem[];
  locked?: boolean;
  planTier?: 'writers' | 'business';
};

const sidebarSections: SidebarSection[] = [
  {
    id: 'create',
    label: 'اكتب',
    icon: icons.write,
    items: [
      { page: 'posts', subPage: 'all-posts', label: 'المنشورات', icon: icons.posts },
      { page: 'posts', subPage: 'outline', label: 'مخطط المقال', icon: icons.outline },
      { page: 'posts', subPage: 'checker', label: 'فحص المقال', icon: icons.checker },
    ],
  },
  {
    id: 'publish',
    label: 'انشر',
    icon: icons.emailJourney,
    items: [
      { page: 'newsletters', label: 'النشرات', icon: icons.emailJourney },
      { page: 'email-template', label: 'قالب البريد', icon: icons.posts },
      { page: 'email-journeys', label: 'رحلات البريد', icon: icons.emailJourney, comingSoon: true },
    ],
  },
  {
    id: 'grow',
    label: 'انمو',
    icon: icons.grow,
    items: [
      { page: 'subscribers', label: 'المشتركين', icon: icons.audience },
      { page: 'grow', subPage: 'carousel', label: 'مولّد الكاروسيل', icon: icons.grow },
      { page: 'grow', subPage: 'social', label: 'محوّل اجتماعي', icon: icons.grow },
      { page: 'grow', subPage: 'linktree', label: 'صفحة الروابط', icon: icons.magicLink },
      { page: 'grow', subPage: 'magic-link', label: 'رابط سحري', icon: icons.grow },
    ],
  },
  {
    id: 'build',
    label: 'ابنِ',
    icon: icons.website,
    items: [
      { page: 'website', label: 'المواقع', icon: icons.website },
      { page: 'writers', label: 'كتّابك', icon: icons.members },
    ],
  },
];

const utilityItems: SidebarItem[] = [
  { page: 'analyze', label: 'الإحصائيات', icon: icons.analyze },
  { page: 'notifications', label: 'الإشعارات', icon: icons.notification },
];

// ─── Theme ──────────────────────────────────────────────
const lightColors = {
  sidebarBg: 'rgba(255,255,255,0.82)',
  sidebarBorder: 'rgba(0,0,0,0.06)',
  activeItem: 'rgba(0,0,0,0.04)',
  activeText: '#111827',
  text: '#111827',
  textMuted: '#6B7280',
  white: '#FFFFFF',
  primary: '#1A1A1A',
  primaryHover: '#111111',
  topBarBg: 'rgba(255,255,255,0.72)',
  topBarBorder: 'rgba(0,0,0,0.06)',
  contentBg: '#F6F6F7',
  hoverBg: 'rgba(0,0,0,0.03)',
  border: 'rgba(0,0,0,0.08)',
  cardBg: '#FFFFFF',
  accent: '#E11D48',
};

// ─── Theme Context ──────────────────────────────────────
type ThemeColors = typeof lightColors;
const ThemeContext = createContext<{ colors: ThemeColors }>({ colors: lightColors });
const useTheme = () => useContext(ThemeContext);

const pageTitles: Record<Page, string> = {
  dashboard: 'لوحة التحكم',
  posts: 'المحتوى',
  newsletters: 'النشرات',
  'email-template': 'قالب البريد',
  notifications: 'الإشعارات',
  grow: 'النمو',
  website: 'المواقع',
  writers: 'كتّابك',
  subscribers: 'المشتركين',
  'email-journeys': 'رحلات البريد',
  analyze: 'الإحصائيات',
  settings: 'الإعدادات',
};

// ─── Publication Switcher ───────────────────────────────
const PublicationSwitcher: React.FC<{
  publications: Publication[];
  activeId: string;
  onSwitch: (id: string) => void;
  colors: ThemeColors;
  createLocked?: boolean;
  onCreateLockedClick?: () => void;
}> = ({ publications, activeId, onSwitch, colors, createLocked, onCreateLockedClick }) => {
  const [open, setOpen] = useState(false);
  const active = publications.find((p) => p.id === activeId) || publications[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 8,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = colors.hoverBg)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #333 0%, #111 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {active?.name.charAt(0) || 'ك'}
        </div>
        <div style={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {active?.name || 'نشرتي'}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            {active ? `${active.subscriberCount.toLocaleString('en')} مشترك` : ''}
          </div>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', color: colors.textMuted, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          {icons.chevron}
        </span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              left: 0,
              marginTop: 4,
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            {publications.map((pub) => (
              <button
                key={pub.id}
                onClick={() => { onSwitch(pub.id); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: pub.id === activeId ? colors.activeItem : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (pub.id !== activeId) e.currentTarget.style.background = colors.hoverBg; }}
                onMouseLeave={(e) => { if (pub.id !== activeId) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'linear-gradient(135deg, #333 0%, #111 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {pub.name.charAt(0)}
                </div>
                <div style={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pub.name}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                    {pub.subscriberCount.toLocaleString('en')} مشترك
                  </div>
                </div>
                {pub.id === activeId && (
                  <span style={{ color: colors.accent, display: 'flex', alignItems: 'center' }}>{icons.check}</span>
                )}
              </button>
            ))}

            {/* Divider + Create new */}
            <div style={{ borderTop: `1px solid ${colors.border}` }}>
              <button
                onClick={() => {
                  setOpen(false);
                  if (createLocked && onCreateLockedClick) {
                    onCreateLockedClick();
                  } else {
                    console.log('Create new publication');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: colors.textMuted, display: 'flex', alignItems: 'center' }}>{icons.plus}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', flex: 1, textAlign: 'right' }}>
                  إنشاء نشرة بريدية
                </span>
                {createLocked && (
                  <span style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Layout ────────────────────────────────────────
const HubLayout: React.FC<HubLayoutProps> = ({
  children,
  activePage,
  activeSubPage,
  onNavigate,
  displayName,
  publications,
  activePublicationId,
  onSwitchPublication,
  customSidebarSections,
  customUtilityItems,
  onWriteClick,
  planName,
  onLockedClick,
  subscriberLimit,
  showSubscribers,
  dashboardLocked,
  dashboardPlanTier,
  createNewsletterLocked,
  onCreateNewsletterLockedClick,
  onCompareClick,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['create']));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const c = lightColors;

  const activeSidebarSections = customSidebarSections || sidebarSections;
  const activeUtilityItems = customUtilityItems || utilityItems;

  const comingSoonBadge = (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
        color: '#9CA3AF',
        background: '#F3F4F6',
        padding: '2px 6px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
      }}
    >
      قريبا
    </span>
  );

  const lockedBadge = (
    <span
      style={{
        color: '#9CA3AF',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </span>
  );

  // Fallback publications if none provided
  const pubs = publications && publications.length > 0 ? publications : [
    { id: 'default', name: displayName || 'نشرتي', slug: 'default', subscriberCount: 0 },
  ];
  const activePubId = activePublicationId || pubs[0].id;

  const sidebarContent = (
    <>
      {/* Publication Switcher */}
      <div style={{ padding: '10px 10px 0' }}>
        <PublicationSwitcher
          publications={pubs}
          activeId={activePubId}
          onSwitch={onSwitchPublication || (() => {})}
          colors={c}
          createLocked={createNewsletterLocked}
          onCreateLockedClick={onCreateNewsletterLockedClick}
        />
      </div>

      {/* Start Writing Button */}
      <div style={{ padding: '8px 12px 4px' }}>
        <button
          style={{
            width: '100%',
            padding: '9px 14px',
            background: c.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = c.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = c.primary)}
          onClick={() => onWriteClick ? onWriteClick() : console.log('Navigate to Kitabh editor')}
        >
          {icons.write}
          ابدأ بالكتابة
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 8px', flex: 1, overflowY: 'auto' }}>
        {/* Dashboard - standalone at top */}
        {(() => {
          const isDashActive = activePage === 'dashboard' && !dashboardLocked;
          const isDashLocked = !!dashboardLocked;
          return (
            <button
              onClick={() => {
                if (isDashLocked && onLockedClick) {
                  onLockedClick({ page: 'dashboard', label: 'لوحة التحكم', icon: icons.dashboard });
                } else {
                  onNavigate('dashboard'); setMobileMenuOpen(false);
                }
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: isDashActive ? c.activeItem : 'transparent',
                color: isDashLocked ? c.textMuted : (isDashActive ? c.activeText : c.text),
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: isDashActive ? 600 : 400,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.1s',
                textAlign: 'right',
                marginBottom: 2,
              }}
              onMouseEnter={(e) => { if (!isDashActive) e.currentTarget.style.background = c.hoverBg; }}
              onMouseLeave={(e) => { if (!isDashActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', color: isDashLocked ? c.textMuted : (isDashActive ? c.activeText : c.textMuted) }}>
                {icons.dashboard}
              </span>
              <span style={{ flex: 1, textAlign: 'right' }}>لوحة التحكم</span>
              {isDashLocked && (
                <span style={{
                  color: '#9CA3AF',
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
              )}
            </button>
          );
        })()}

        {/* Collapsible Sections */}
        {activeSidebarSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const isSectionLocked = section.locked;
          const hasSectionActive = !isSectionLocked && section.items.some(
            (item) => activePage === item.page && (!item.subPage || activeSubPage === item.subPage)
          );

          return (
            <div key={section.id} style={{
              marginBottom: 2,
              borderRight: section.planTier ? `3px solid ${section.planTier === 'business' ? '#111827' : '#D1D5DB'}` : 'none',
              borderRadius: '0 4px 4px 0',
            }}>
              {/* Section header — clickable to expand/collapse */}
              <button
                onClick={() => {
                  setExpandedSections((prev) => {
                    const next = new Set(prev);
                    if (next.has(section.id)) next.delete(section.id);
                    else next.add(section.id);
                    return next;
                  });
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  color: isSectionLocked ? '#C0C0C0' : hasSectionActive ? c.activeText : c.text,
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: hasSectionActive ? 600 : 500,
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.1s',
                  textAlign: 'right',
                  opacity: isSectionLocked ? 0.6 : 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = c.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: isSectionLocked ? '#C0C0C0' : hasSectionActive ? c.activeText : c.textMuted }}>
                  {section.icon}
                </span>
                <span style={{ flex: 1, textAlign: 'right', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {section.label}
                  {isSectionLocked && (
                    <span style={{ display: 'flex', alignItems: 'center', color: '#9CA3AF' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                  )}
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: c.textMuted,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}
                >
                  {icons.chevron}
                </span>
              </button>

              {/* Expanded child items */}
              {isExpanded && (
                <div style={{ paddingRight: 20, paddingTop: 2 }}>
                  {section.items.map((item) => {
                    const isActive = activePage === item.page && (item.subPage ? activeSubPage === item.subPage : !activeSubPage || (activePage !== 'posts' && activePage !== 'grow'));
                    const isComingSoon = item.comingSoon;
                    const isLocked = item.locked;
                    const isDisabled = isComingSoon || isLocked;
                    return (
                      <button
                        key={`${item.page}-${item.subPage || ''}`}
                        onClick={() => {
                          if (isComingSoon) return;
                          if (isLocked && onLockedClick) { onLockedClick(item); return; }
                          onNavigate(item.page, item.subPage);
                          setMobileMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 12px',
                          background: isActive && !isDisabled ? c.activeItem : 'transparent',
                          color: isDisabled ? '#C0C0C0' : isActive ? c.activeText : c.text,
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: isActive && !isDisabled ? 600 : 400,
                          fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                          cursor: isComingSoon ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'background 0.1s',
                          textAlign: 'right',
                          opacity: isComingSoon ? 0.5 : isLocked ? 0.7 : 1,
                          marginBottom: 1,
                        }}
                        onMouseEnter={(e) => { if (!isActive && !isComingSoon) e.currentTarget.style.background = c.hoverBg; }}
                        onMouseLeave={(e) => { if (!isActive && !isComingSoon) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {item.icon && (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLocked ? '#C0C0C0' : isActive ? c.activeText : c.textMuted, opacity: 0.6, width: 18, height: 18, flexShrink: 0 }}>
                            <span style={{ display: 'flex', transform: 'scale(0.8)', transformOrigin: 'center' }}>{item.icon}</span>
                          </span>
                        )}
                        <span style={{ flex: 1, textAlign: 'right' }}>{item.label}</span>
                        {item.trialUsage && (() => {
                          const { used, total } = item.trialUsage;
                          const pct = Math.min(used / total, 1);
                          const r = 6; const stroke = 2;
                          const circ = 2 * Math.PI * r;
                          const filled = circ * pct;
                          const color = '#D1D5DB';
                          return (
                            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} title={`${used}/${total}`}>
                              <svg width="16" height="16" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
                                <circle cx="8" cy="8" r={r} fill="none" stroke={color} strokeWidth={stroke}
                                  strokeDasharray={`${filled} ${circ - filled}`}
                                  strokeDashoffset={circ * 0.25}
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke-dasharray 0.3s' }}
                                />
                              </svg>
                            </span>
                          );
                        })()}
                        {isComingSoon && comingSoonBadge}
                        {isLocked && (
                          <span style={{
                            color: '#9CA3AF',
                            display: 'flex', alignItems: 'center', flexShrink: 0,
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Utility items — flat, below sections */}
        {activeUtilityItems.map((item) => {
          const isActive = activePage === item.page && !item.locked;
          const isItemLocked = item.locked;
          return (
            <button
              key={`${item.page}-${item.label}`}
              onClick={() => {
                if (isItemLocked && onLockedClick) { onLockedClick(item); return; }
                onNavigate(item.page);
                setMobileMenuOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: isActive ? c.activeItem : 'transparent',
                color: isItemLocked ? '#C0C0C0' : isActive ? c.activeText : c.text,
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.1s',
                textAlign: 'right',
                marginBottom: 2,
                opacity: isItemLocked ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = c.hoverBg; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', color: isItemLocked ? '#C0C0C0' : isActive ? c.activeText : c.textMuted }}>
                {item.icon}
              </span>
              <span style={{ flex: 1, textAlign: 'right' }}>{item.label}</span>
              {isItemLocked && (
                <span style={{
                  color: '#9CA3AF',
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Plan + Settings */}
      <div style={{ padding: '12px 12px' }}>
        {/* Plan info */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: c.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {planName || 'خطة الأعمال'}
            </span>
            <button
              onClick={() => { window.location.href = '/pricing'; }}
              style={{
                padding: '2px 8px',
                background: c.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              الباقات
            </button>
          </div>
          {onCompareClick && (
            <button
              onClick={onCompareClick}
              style={{
                background: '#F3F4F6',
                border: 'none',
                padding: '6px 0', marginBottom: 8, width: '100%',
                fontSize: 11, fontWeight: 600, color: '#6B7280', fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer', borderRadius: 6,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
            >
              مزايا باقتك
            </button>
          )}
          {(showSubscribers !== false) && (
            <>
              <div style={{ fontSize: 12, color: c.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 6 }}>
                المشتركون
              </div>
              <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '38%', background: c.primary, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 11, color: c.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginTop: 4 }}>
                0 of {subscriberLimit || '2,500'} مشترك
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => {
            onNavigate('settings', 'account');
            setMobileMenuOpen(false);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: activePage === 'settings' ? c.activeItem : 'transparent',
            color: activePage === 'settings' ? c.activeText : c.text,
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 400,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textAlign: 'right',
          }}
          onMouseEnter={(e) => { if (activePage !== 'settings') e.currentTarget.style.background = c.hoverBg; }}
          onMouseLeave={(e) => { if (activePage !== 'settings') e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', color: c.textMuted }}>{icons.settings}</span>
          الإعدادات
        </button>
      </div>
    </>
  );

  return (
    <ThemeContext.Provider value={{ colors: c }}>
      <div style={{ direction: 'rtl', display: 'flex', minHeight: '100vh', fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: c.contentBg, color: c.text }}>
        {/* Desktop Sidebar */}
        <aside
          style={{
            width: sidebarCollapsed ? 0 : 260,
            background: c.sidebarBg,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderLeft: sidebarCollapsed ? 'none' : `1px solid ${c.sidebarBorder}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, border-color 0.3s',
            overflow: 'hidden',
          }}
          className="hub-sidebar-desktop"
        >
          <div style={{ width: 260, minWidth: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {sidebarContent}
          </div>
        </aside>
        {/* Sidebar toggle button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hub-sidebar-toggle"
          style={{
            position: 'fixed',
            top: 12,
            right: sidebarCollapsed ? 12 : 268,
            zIndex: 41,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: c.cardBg,
            border: `1px solid ${c.sidebarBorder}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'right 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            color: c.textMuted,
            padding: 0,
          }}
          title={sidebarCollapsed ? 'إظهار القائمة' : 'إخفاء القائمة'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Bottom Sheet Sidebar */}
        <aside
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: mobileMenuOpen ? '80vh' : 0,
            width: '100%',
            background: c.cardBg,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            zIndex: 1000,
            transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: mobileMenuOpen ? '0 -4px 30px rgba(0,0,0,0.15)' : 'none',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          }}
          className="hub-sidebar-mobile"
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }} onClick={() => setMobileMenuOpen(false)}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.15)' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
            {sidebarContent}
          </div>
        </aside>

        {/* Main content area */}
        <div className="hub-main-content" style={{ flex: 1, marginRight: sidebarCollapsed ? 0 : 260, minHeight: '100vh', overflowX: 'hidden', transition: 'margin-right 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* Top bar */}
          <header
            style={{
              height: 56,
              background: c.topBarBg,
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              borderBottom: `1px solid ${c.topBarBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              position: 'sticky',
              top: 0,
              zIndex: 30,
              transition: 'background 0.3s, border-color 0.3s',
            }}
          >
            {/* Left side: mobile menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'none',
                  color: c.text,
                }}
                className="hub-mobile-menu-btn"
              >
                {icons.menu}
              </button>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Right side: text links + icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button
                onClick={() => window.open('/', '_blank')}
                title="عرض الموقع"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: c.textMuted, display: 'flex', alignItems: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </button>
              <button
                onClick={() => window.open('https://help.kitabh.com', '_blank')}
                title="المساعدة"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: c.textMuted, display: 'flex', alignItems: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </button>

              <div style={{ width: 1, height: 20, background: c.border }} />

              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: '#E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: c.text,
                  cursor: 'pointer',
                }}
              >
                م
              </div>
            </div>
          </header>

          {/* Content */}
          <main style={{ padding: '32px 40px', boxSizing: 'border-box', overflowX: 'hidden' }}>{children}</main>
        </div>

        {/* Responsive + Premium CSS */}
        <style>{`
          .hub-sidebar-desktop button,
          .hub-sidebar-mobile button { outline: none; }
          @media (max-width: 768px) {
            .hub-sidebar-desktop { display: none !important; }
            .hub-sidebar-toggle { display: none !important; }
            .hub-sidebar-mobile { display: flex !important; }
            .hub-mobile-menu-btn { display: flex !important; }
            .hub-main-content { margin-right: 0 !important; }
            .hub-main-content main { padding: 16px 14px !important; }
            .hub-main-content h1 { font-size: 18px !important; }
            .hub-main-content h2 { font-size: 15px !important; }
          }
          @media (min-width: 769px) {
            .hub-sidebar-mobile { display: none !important; max-height: 0 !important; }
            .hub-mobile-menu-btn { display: none !important; }
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
};

export default HubLayout;
export { icons, lightColors as colors, useTheme, sidebarSections, utilityItems };
export type { Page, Publication, SidebarSection, SidebarItem };
