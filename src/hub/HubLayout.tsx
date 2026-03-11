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
};

// ─── Types ───────────────────────────────────────────────
type Page = 'dashboard' | 'posts' | 'audience' | 'grow' | 'website' | 'analyze' | 'settings';

interface SubItem {
  id: string;
  label: string;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
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
    label: 'المنشورات',
    icon: icons.posts,
    subItems: [
      { id: 'all-posts', label: 'كل المنشورات' },
      { id: 'draft', label: 'مسودة كتابة' },
      { id: 'editor', label: 'محرر كتابة' },
    ],
  },
  { id: 'audience', label: 'الجمهور', icon: icons.audience },
  {
    id: 'grow',
    label: 'النمو',
    icon: icons.grow,
    subItems: [
      { id: 'magic-link', label: 'رابط الاشتراك السريع' },
      { id: 'referral', label: 'برنامج الإحالة' },
      { id: 'embed', label: 'نماذج مدمجة' },
    ],
  },
  { id: 'website', label: 'الموقع', icon: icons.website },
  {
    id: 'analyze',
    label: 'التحليلات',
    icon: icons.analyze,
    subItems: [
      { id: 'newsletter-stats', label: 'إحصائيات النشرة' },
      { id: 'website-stats', label: 'إحصائيات الموقع' },
    ],
  },
];

// ─── Styles ──────────────────────────────────────────────
const colors = {
  sidebarBg: 'rgba(255,255,255,0.6)',
  sidebarBorder: 'rgba(0,0,0,0.06)',
  activeItem: 'rgba(0,0,0,0.06)',
  activeText: '#000000',
  text: '#111111',
  textMuted: '#888888',
  white: '#FFFFFF',
  primary: '#000000',
  primaryHover: '#222222',
  topBarBg: 'rgba(255,255,255,0.7)',
  topBarBorder: 'rgba(0,0,0,0.05)',
  contentBg: '#F5F5F7',
  hoverBg: 'rgba(0,0,0,0.03)',
  glass: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.3)',
  glassCard: 'rgba(255,255,255,0.7)',
};

const HubLayout: React.FC<HubLayoutProps> = ({ children, activePage, activeSubPage, onNavigate }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['grow', 'analyze']));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sidebarContent = (
    <>
      {/* Logo / Newsletter Name */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${colors.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            }}
          >
            ك
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              رسالة السبت
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              kitabh.com/mohdaldhabaa
            </div>
          </div>
        </div>
      </div>

      {/* Start Writing Button */}
      <div style={{ padding: '16px 16px 8px' }}>
        <button
          style={{
            width: '100%',
            padding: '11px 16px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = colors.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = colors.primary)}
          onClick={() => console.log('Navigate to Kitabh editor')}
        >
          {icons.write}
          ابدأ بالكتابة
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const isExpanded = expandedItems.has(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.id} style={{ marginBottom: 2 }}>
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleExpand(item.id);
                    onNavigate(item.id, item.subItems![0].id);
                  } else {
                    onNavigate(item.id);
                  }
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: isActive ? colors.activeItem : 'transparent',
                  color: isActive ? colors.activeText : colors.text,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.15s',
                  textAlign: 'right',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = colors.hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.7 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1, textAlign: 'right' }}>{item.label}</span>
                {hasSubItems && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                      opacity: 0.5,
                    }}
                  >
                    {icons.chevron}
                  </span>
                )}
              </button>

              {/* Sub-items */}
              {hasSubItems && isExpanded && (
                <div style={{ paddingRight: 42, paddingTop: 2 }}>
                  {item.subItems!.map((sub) => {
                    const isSubActive = activePage === item.id && activeSubPage === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          onNavigate(item.id, sub.id);
                          setMobileMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: isSubActive ? colors.activeItem : 'transparent',
                          color: isSubActive ? colors.activeText : colors.textMuted,
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: isSubActive ? 600 : 400,
                          fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                          cursor: 'pointer',
                          textAlign: 'right',
                          transition: 'all 0.15s',
                          display: 'block',
                          marginBottom: 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubActive) e.currentTarget.style.background = colors.hoverBg;
                        }}
                        onMouseLeave={(e) => {
                          if (!isSubActive) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: Plan & Settings */}
      <div style={{ borderTop: `1px solid ${colors.sidebarBorder}`, padding: '12px 16px' }}>
        {/* Plan info */}
        <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: 10, border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              خطة الأعمال
            </span>
            <button
              style={{
                padding: '3px 10px',
                background: 'rgba(0,0,0,0.06)',
                color: '#111',
                border: 'none',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer',
              }}
            >
              ترقية
            </button>
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 6 }}>
            المشتركون
          </div>
          <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '38%', background: '#111', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginTop: 4 }}>
            1,920 / 5,000 مشترك
          </div>
        </div>

        {/* Settings */}
        <button
          onClick={() => {
            onNavigate('settings');
            setMobileMenuOpen(false);
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: activePage === 'settings' ? colors.activeItem : 'transparent',
            color: activePage === 'settings' ? colors.activeText : colors.text,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textAlign: 'right',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>{icons.settings}</span>
          الإعدادات
        </button>
      </div>
    </>
  );

  const glassStyle = {
    background: colors.glass,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: `1px solid ${colors.glassBorder}`,
  };

  return (
    <div style={{ direction: 'rtl', display: 'flex', minHeight: '100vh', fontFamily: 'IBM Plex Sans Arabic, sans-serif', background: `linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 50%, #f0f0f5 100%)` }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: 260,
          ...glassStyle,
          borderLeft: `1px solid ${colors.sidebarBorder}`,
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: 'none',
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 49 }}
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
          ...glassStyle,
          zIndex: 50,
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: mobileMenuOpen ? '-8px 0 30px rgba(0,0,0,0.08)' : 'none',
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
            ...glassStyle,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
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

          {/* Page title */}
          <div style={{ fontWeight: 600, fontSize: 16, color: colors.text, letterSpacing: '-0.01em' }}>
            {activePage === 'dashboard' && 'لوحة التحكم'}
            {activePage === 'posts' && 'المنشورات'}
            {activePage === 'audience' && 'الجمهور'}
            {activePage === 'grow' && 'النمو'}
            {activePage === 'website' && 'الموقع'}
            {activePage === 'analyze' && 'التحليلات'}
            {activePage === 'settings' && 'الإعدادات'}
          </div>

          {/* Right side actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 10,
                color: colors.textMuted,
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {icons.notification}
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 10,
                color: colors.textMuted,
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {icons.search}
            </button>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #333 0%, #111 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              م
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: 28 }}>{children}</main>
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
