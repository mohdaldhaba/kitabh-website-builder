import React, { useState } from 'react';
import HubLayout from './HubLayout';
import DashboardPage from './DashboardPage';
import PostsPage from './PostsPage';
import NotificationsPage from './NotificationsPage';
import GrowPage from './GrowPage';
import WebsitePage from './WebsitePage';
import MembersPage from './MembersPage';
import SettingsPage from './SettingsPage';
import AnalyzePage from './AnalyzePage';
import { colors } from './HubLayout';
import type { Page } from './HubLayout';

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
    <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      {title}
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px', lineHeight: 1.7 }}>
      {description}
    </p>
    <span
      style={{
        display: 'inline-block',
        padding: '6px 16px',
        background: '#F3F4F6',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
        color: '#9CA3AF',
      }}
    >
      قريبا
    </span>
  </div>
);

const BusinessHub: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [activeSubPage, setActiveSubPage] = useState<string | undefined>();

  const handleNavigate = (page: Page, subPage?: string) => {
    setActivePage(page);
    setActiveSubPage(subPage);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'posts':
        if (activeSubPage === 'newsletter-stats') {
          return <AnalyzePage subPage="newsletter-stats" />;
        }
        return <PostsPage subPage={activeSubPage} />;
      case 'notifications':
        return <NotificationsPage />;
      case 'grow':
        return <GrowPage subPage={activeSubPage} />;
      case 'website':
        return <WebsitePage />;
      case 'members':
        return <MembersPage />;
      case 'subscribers':
        return (
          <ComingSoonPage
            title="المشتركون"
            description="قريبا ستتمكن من إدارة مشتركيك، عرض تفاصيلهم، تصديرهم، وتصنيفهم حسب مستوى التفاعل"
          />
        );
      case 'email-journeys':
        return (
          <ComingSoonPage
            title="رحلات البريد الإلكتروني"
            description="قريبا ستتمكن من إنشاء تسلسلات بريدية تلقائية لاستقبال المشتركين الجدد وتنمية جمهورك"
          />
        );
      case 'settings':
        return <SettingsPage subPage={activeSubPage} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <HubLayout activePage={activePage} activeSubPage={activeSubPage} onNavigate={handleNavigate}>
      {renderPage()}
    </HubLayout>
  );
};

export default BusinessHub;
