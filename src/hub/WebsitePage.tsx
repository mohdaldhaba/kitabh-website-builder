import React, { lazy, Suspense } from 'react';
import { MOCK_AUTHOR, MOCK_NEWSLETTER } from '../mockData';
import { useTheme } from './HubLayout';

const F = 'IBM Plex Sans Arabic, sans-serif';

const KitabhWebsiteBuilder = lazy(() => import('../KitabhWebsiteBuilder'));

interface WebsitePageProps {
  publicationName?: string;
  publicationSlug?: string;
}

const WebsitePage: React.FC<WebsitePageProps> = ({
  publicationName = MOCK_NEWSLETTER.name,
  publicationSlug = MOCK_AUTHOR.username,
}) => {
  const { colors: c } = useTheme();

  return (
    <div style={{ margin: '-32px -40px', height: 'calc(100vh - 56px)' }}>
      <Suspense
        fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ fontSize: 14, color: c.textMuted, fontFamily: F }}>جارٍ تحميل منشئ المواقع...</span>
          </div>
        }
      >
        <KitabhWebsiteBuilder
          style={{ width: '100%', height: '100%' }}
          embedded
          publicationSlug={publicationSlug}
          publicationName={publicationName}
        />
      </Suspense>
    </div>
  );
};

export default WebsitePage;
