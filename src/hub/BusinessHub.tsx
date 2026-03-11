import React, { useState } from 'react';
import HubLayout from './HubLayout';
import DashboardPage from './DashboardPage';
import PostsPage from './PostsPage';
import AudiencePage from './AudiencePage';
import GrowPage from './GrowPage';
import WebsitePage from './WebsitePage';
import AnalyzePage from './AnalyzePage';
import type { Page } from './HubLayout';

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
        return <PostsPage />;
      case 'audience':
        return <AudiencePage />;
      case 'grow':
        return <GrowPage subPage={activeSubPage} />;
      case 'website':
        return <WebsitePage />;
      case 'analyze':
        return <AnalyzePage subPage={activeSubPage} />;
      case 'settings':
        return (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#371D12', fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
              الإعدادات
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
              إعدادات الحساب والنشرة البريدية والموقع
            </p>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 15, color: '#6B7280', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                صفحة الإعدادات — قريبا
              </div>
            </div>
          </div>
        );
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
