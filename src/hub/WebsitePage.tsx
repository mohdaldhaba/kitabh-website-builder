import React, { useState, lazy, Suspense } from 'react';
import { MOCK_AUTHOR, MOCK_NEWSLETTER } from '../mockData';
import { useTheme, icons } from './HubLayout';

const F = 'IBM Plex Sans Arabic, sans-serif';

// Lazy-load the actual website builder
const KitabhWebsiteBuilder = lazy(() => import('../KitabhWebsiteBuilder'));

interface WebsitePageProps {
  publicationName?: string;
  publicationSlug?: string;
}

const TEMPLATES = [
  { id: 'media', name: 'مؤسسة إعلامية', description: 'مثالي للناشرين وصنّاع المحتوى' },
  { id: 'newsletter', name: 'نشرة بريدية', description: 'صفحة هبوط أنيقة لنشرتك' },
  { id: 'blog', name: 'مدونة شخصية', description: 'بسيط ونظيف — المحتوى هو البطل' },
  { id: 'podcast', name: 'بودكاست', description: 'لصنّاع المحتوى الصوتي' },
  { id: 'cinema', name: 'سينما ومراجعات', description: 'لعشّاق الأفلام والمراجعات' },
  { id: 'education', name: 'تعليم ودورات', description: 'للمحتوى التعليمي والدورات' },
  { id: 'store', name: 'متجر إلكتروني', description: 'لبيع الكتب والمنتجات الرقمية' },
];

const WebsitePage: React.FC<WebsitePageProps> = ({
  publicationName = MOCK_NEWSLETTER.name,
  publicationSlug = MOCK_AUTHOR.username,
}) => {
  const { colors: c } = useTheme();
  const [mode, setMode] = useState<'overview' | 'builder'>('overview');
  const [selectedTemplate, setSelectedTemplate] = useState('newsletter');
  const websiteUrl = `https://${publicationSlug}.kitabh.com`;

  const card = {
    background: c.cardBg,
    borderRadius: 14,
    border: `1px solid ${c.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
  };

  // ── Builder mode: embed the full website builder ──────
  if (mode === 'builder') {
    return (
      <div style={{ margin: '-16px -16px', height: 'calc(100vh - 56px)', position: 'relative' }}>
        {/* Top bar with back button */}
        <div
          style={{
            height: 48,
            background: c.cardBg,
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 10,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setMode('overview')}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: F,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              رجوع
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, fontFamily: F, color: c.text }}>
              تعديل موقع: {publicationName}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', minWidth: 0 }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: c.textMuted, direction: 'ltr', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {websiteUrl}
            </span>
          </div>
        </div>

        {/* Embedded builder */}
        <div style={{ height: 'calc(100% - 48px)' }}>
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
      </div>
    );
  }

  // ── Overview mode ─────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: c.text, fontFamily: F, margin: '0 0 6px' }}>
            الموقع
          </h1>
          <p style={{ fontSize: 14, color: c.textMuted, fontFamily: F, margin: 0 }}>
            عدّل موقعك وخصصه ليعكس هويتك
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => window.open(websiteUrl, '_blank')}
            style={{
              height: 38,
              padding: '0 16px',
              background: c.cardBg,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {icons.website}
            معاينة
          </button>
          <button
            onClick={() => setMode('builder')}
            style={{
              height: 38,
              padding: '0 20px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {icons.write}
            تعديل الموقع
          </button>
        </div>
      </div>

      {/* Website preview — click to edit */}
      <div
        onClick={() => setMode('builder')}
        style={{ ...card, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)'; }}
      >
        <div style={{ padding: '48px 24px', background: c.contentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 24, fontWeight: 700, fontFamily: F }}>{publicationName.charAt(0)}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: c.text, fontFamily: F }}>{publicationName}</div>
          <div style={{ fontSize: 13, color: c.textMuted, fontFamily: F }}>{MOCK_AUTHOR.bio.slice(0, 60)}...</div>
        </div>
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', color: c.textMuted }}>{icons.write}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted, fontFamily: F }}>اضغط لتعديل الموقع</span>
        </div>
      </div>

      {/* Template selection */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: c.text, fontFamily: F, margin: '0 0 12px' }}>
          القالب
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {TEMPLATES.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                style={{
                  ...card,
                  padding: '14px 12px',
                  cursor: 'pointer',
                  textAlign: 'right',
                  border: isSelected ? '2px solid #111' : `1px solid ${c.border}`,
                  background: isSelected ? '#FAFAFA' : c.cardBg,
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text, fontFamily: F, marginBottom: 2 }}>
                  {tpl.name}
                </div>
                <div style={{ fontSize: 12, color: c.textMuted, fontFamily: F, lineHeight: 1.4 }}>
                  {tpl.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WebsitePage;
