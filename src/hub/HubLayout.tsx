import React, { useState } from 'react';

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
};

// ─── Types ───────────────────────────────────────────────
type Page = 'dashboard' | 'posts' | 'notifications' | 'grow' | 'website' | 'members' | 'subscribers' | 'email-journeys' | 'settings';

interface SubItem {
  id: string;
  label: string;
  comingSoon?: boolean;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
  comingSoon?: boolean;
}

interface HubLayoutProps {
  children: React.ReactNode;
  activePage: Page;
  activeSubPage?: string;
  onNavigate: (page: Page, subPage?: string) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: icons.dashboard },
  {
    id: 'posts',
    label: 'المحتوى',
    icon: icons.posts,
    subItems: [
      { id: 'all-posts', label: 'كل المنشورات' },
      { id: 'drafts', label: 'المسودات' },
      { id: 'outline', label: 'إنشاء مخطط' },
      { id: 'newsletter-stats', label: 'إحصائيات النشرة' },
    ],
  },
  { id: 'notifications', label: 'الإشعارات', icon: icons.notification },
  {
    id: 'grow',
    label: 'النمو',
    icon: icons.grow,
    subItems: [
      { id: 'carousel', label: 'مولّد الكاروسيل' },
      { id: 'magic-link', label: 'نماذج الاشتراك', comingSoon: true },
    ],
  },
  { id: 'website', label: 'الموقع', icon: icons.website },
  { id: 'members', label: 'الأعضاء', icon: icons.members },
  { id: 'subscribers', label: 'المشتركون', icon: icons.audience, comingSoon: true },
  { id: 'email-journeys', label: 'رحلات البريد', icon: icons.emailJourney, comingSoon: true },
];

// ─── Styles — matched to Beehiiv exactly ─────────────────
const colors = {
  sidebarBg: '#FFFFFF',
  sidebarBorder: '#E5E7EB',
  activeItem: '#F3F4F6',
  activeText: '#111827',
  text: '#111827',
  textMuted: '#6B7280',
  white: '#FFFFFF',
  primary: '#1A1A1A',
  primaryHover: '#111111',
  topBarBg: '#FFFFFF',
  topBarBorder: '#E5E7EB',
  contentBg: '#FFFFFF',
  hoverBg: '#F9FAFB',
  border: '#E5E7EB',
  cardBg: '#FFFFFF',
  accent: '#E11D48',
};

const pageTitles: Record<Page, string> = {
  dashboard: 'لوحة التحكم',
  posts: 'المحتوى',
  notifications: 'الإشعارات',
  grow: 'النمو',
  website: 'الموقع',
  members: 'الأعضاء',
  subscribers: 'المشتركون',
  'email-journeys': 'رحلات البريد',
  settings: 'الإعدادات',
};

const HubLayout: React.FC<HubLayoutProps> = ({ children, activePage, activeSubPage, onNavigate }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['posts']));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const sidebarContent = (
    <>
      {/* Logo / Newsletter Name */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: colors.text,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            }}
          >
            ك
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            نشرة رسالة السبت
          </span>
        </div>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: colors.textMuted, display: 'flex', alignItems: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      </div>

      {/* Start Writing Button */}
      <div style={{ padding: '8px 12px 4px' }}>
        <button
          style={{
            width: '100%',
            padding: '9px 14px',
            background: colors.primary,
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
          onMouseEnter={(e) => (e.currentTarget.style.background = colors.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = colors.primary)}
          onClick={() => console.log('Navigate to Kitabh editor')}
        >
          {icons.write}
          ابدأ بالكتابة
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 8px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const isExpanded = expandedItems.has(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isComingSoon = item.comingSoon;

          return (
            <div key={item.id} style={{ marginBottom: 1 }}>
              <button
                onClick={() => {
                  if (isComingSoon) return;
                  if (hasSubItems) {
                    toggleExpand(item.id);
                    if (!isActive) {
                      const firstActive = item.subItems!.find((s) => !s.comingSoon);
                      onNavigate(item.id, firstActive?.id || item.subItems![0].id);
                    }
                  } else {
                    onNavigate(item.id);
                  }
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: isActive && !isComingSoon ? colors.activeItem : 'transparent',
                  color: isComingSoon ? '#C0C0C0' : isActive ? colors.activeText : colors.text,
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: isActive && !isComingSoon ? 600 : 400,
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  cursor: isComingSoon ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.1s',
                  textAlign: 'right',
                  opacity: isComingSoon ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isComingSoon) e.currentTarget.style.background = colors.hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isComingSoon) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: isActive ? colors.activeText : colors.textMuted }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1, textAlign: 'right' }}>{item.label}</span>
                {isComingSoon && comingSoonBadge}
                {hasSubItems && !isComingSoon && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                      color: colors.textMuted,
                    }}
                  >
                    {icons.chevron}
                  </span>
                )}
              </button>

              {/* Sub-items */}
              {hasSubItems && isExpanded && !isComingSoon && (
                <div style={{ paddingRight: 40, paddingTop: 2 }}>
                  {item.subItems!.map((sub) => {
                    const isSubActive = activePage === item.id && activeSubPage === sub.id;
                    const isSubComingSoon = sub.comingSoon;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          if (isSubComingSoon) return;
                          onNavigate(item.id, sub.id);
                          setMobileMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          background: isSubActive && !isSubComingSoon ? colors.activeItem : 'transparent',
                          color: isSubComingSoon ? '#C0C0C0' : isSubActive ? colors.activeText : colors.textMuted,
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: isSubActive && !isSubComingSoon ? 600 : 400,
                          fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                          cursor: isSubComingSoon ? 'default' : 'pointer',
                          textAlign: 'right',
                          transition: 'background 0.1s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 1,
                          opacity: isSubComingSoon ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubActive && !isSubComingSoon) e.currentTarget.style.background = colors.hoverBg;
                        }}
                        onMouseLeave={(e) => {
                          if (!isSubActive && !isSubComingSoon) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span>{sub.label}</span>
                        {isSubComingSoon && comingSoonBadge}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: Plan + Settings */}
      <div style={{ padding: '12px 12px' }}>
        {/* Plan info — Beehiiv style */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              خطة الأعمال
            </span>
            <button
              style={{
                padding: '2px 8px',
                background: colors.accent,
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
              ترقية
            </button>
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 6 }}>
            المشتركون
          </div>
          <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '38%', background: colors.primary, borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginTop: 4 }}>
            0 of 2,500 مشترك
          </div>
        </div>

        {/* Settings — bottom nav item */}
        <button
          onClick={() => {
            onNavigate('settings', 'account');
            setMobileMenuOpen(false);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: activePage === 'settings' ? colors.activeItem : 'transparent',
            color: activePage === 'settings' ? colors.activeText : colors.text,
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 400,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textAlign: 'right',
          }}
          onMouseEnter={(e) => { if (activePage !== 'settings') e.currentTarget.style.background = colors.hoverBg; }}
          onMouseLeave={(e) => { if (activePage !== 'settings') e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', color: colors.textMuted }}>{icons.settings}</span>
          الإعدادات
        </button>
      </div>
    </>
  );

  return (
    <div style={{ direction: 'rtl', display: 'flex', minHeight: '100vh', fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: colors.contentBg }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: 260,
          background: colors.sidebarBg,
          borderLeft: `1px solid ${colors.sidebarBorder}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
        }}
        className="hub-sidebar-desktop"
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 49 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: mobileMenuOpen ? 0 : -280,
          bottom: 0,
          width: 270,
          background: colors.sidebarBg,
          zIndex: 50,
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: mobileMenuOpen ? '-4px 0 20px rgba(0,0,0,0.1)' : 'none',
        }}
        className="hub-sidebar-mobile"
      >
        {sidebarContent}
      </aside>

      {/* Main content area */}
      <div className="hub-main-content" style={{ flex: 1, marginRight: 260, minHeight: '100vh' }}>
        {/* Top bar */}
        <header
          style={{
            height: 56,
            background: colors.topBarBg,
            borderBottom: `1px solid ${colors.topBarBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'none',
              color: colors.text,
            }}
            className="hub-mobile-menu-btn"
          >
            {icons.menu}
          </button>

          {/* Spacer for mobile */}
          <div style={{ flex: 1 }} />

          {/* Right side: text links + icons (matches Beehiiv topbar) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Text links */}
            <button
              onClick={() => window.open('/', '_blank')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 400, fontFamily: 'IBM Plex Sans Arabic, sans-serif', color: colors.text, padding: 0 }}
            >
              عرض الموقع
            </button>
            <button
              onClick={() => window.open('https://help.kitabh.com', '_blank')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 400, fontFamily: 'IBM Plex Sans Arabic, sans-serif', color: colors.text, padding: 0 }}
            >
              المساعدة
            </button>

            {/* Separator */}
            <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />

            {/* Icons */}
            <button
              onClick={() => onNavigate('notifications')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: colors.textMuted, display: 'flex', alignItems: 'center' }}
            >
              {icons.notification}
            </button>
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
                color: colors.text,
                cursor: 'pointer',
              }}
            >
              م
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '32px 40px' }}>{children}</main>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .hub-sidebar-desktop { display: none !important; }
          .hub-sidebar-mobile { display: flex !important; }
          .hub-mobile-menu-btn { display: flex !important; }
          .hub-main-content { margin-right: 0 !important; }
        }
        @media (min-width: 769px) {
          .hub-sidebar-mobile { display: none !important; }
          .hub-mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default HubLayout;
export { icons, colors };
export type { Page };
