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

const WebsitePage: React.FC<WebsitePageProps> = ({
  publicationName = MOCK_NEWSLETTER.name,
  publicationSlug = MOCK_AUTHOR.username,
}) => {
  const { colors: c } = useTheme();
  const [mode, setMode] = useState<'overview' | 'builder'>('overview');
  const websiteUrl = `https://${publicationSlug}.kitabh.com`;
  const [copied, setCopied] = useState(false);

  const card = {
    background: c.cardBg,
    borderRadius: 14,
    border: `1px solid ${c.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
            موقع {publicationName}
          </h1>
          <p style={{ fontSize: 14, color: c.textMuted, fontFamily: F, margin: 0 }}>
            موقعك مرتبط بنشرتك البريدية — عدّله وخصصه ليعكس هويتك
          </p>
        </div>
      </div>

      {/* Subdomain / URL bar */}
      <div style={{ ...card, padding: '14px 12px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#0000FF', direction: 'ltr', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {websiteUrl}
        </span>
        <button
          onClick={handleCopy}
          style={{
            padding: '6px 12px',
            background: copied ? '#059669' : 'transparent',
            color: copied ? '#fff' : c.textMuted,
            border: `1px solid ${copied ? '#059669' : c.border}`,
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? 'تم النسخ' : 'نسخ'}
        </button>
      </div>

      {/* Website preview card */}
      <div style={{ ...card, overflow: 'hidden', marginBottom: 20 }}>
        {/* Browser chrome */}
        <div style={{ background: c.border, padding: '10px 16px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FCA5A5' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FDE68A' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#86EFAC' }} />
          </div>
          <div style={{ flex: 1, padding: '6px 12px', background: c.cardBg, borderRadius: 6, fontSize: 12, fontFamily: 'monospace', color: c.textMuted, textAlign: 'center', direction: 'ltr', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            {websiteUrl}
          </div>
        </div>
        {/* Preview area */}
        <div style={{ height: 260, background: c.contentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 24, fontWeight: 700, fontFamily: F }}>{publicationName.charAt(0)}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: c.text, fontFamily: F }}>{publicationName}</div>
          <div style={{ fontSize: 13, color: c.textMuted, fontFamily: F }}>{MOCK_AUTHOR.bio.slice(0, 60)}...</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => setMode('builder')}
          style={{
            padding: '10px 20px',
            background: c.text,
            color: c.cardBg,
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: F,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {icons.write}
          تعديل الموقع
        </button>
        <button
          onClick={() => window.open(websiteUrl, '_blank')}
          style={{
            padding: '10px 20px',
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
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {icons.website}
          معاينة الموقع
        </button>
      </div>

      {/* Website settings */}
      <div style={{ ...card, padding: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: c.text, fontFamily: F, margin: '0 0 16px' }}>
          إعدادات الموقع
        </h3>

        {[
          { label: 'النشرة المرتبطة', value: publicationName },
          { label: 'النطاق الفرعي', value: `${publicationSlug}.kitabh.com`, dir: 'ltr' as const },
          { label: 'النطاق المخصص', value: 'لم يتم الربط بعد', action: 'ربط نطاق' },
          { label: 'القالب', value: 'الحداثة — أزرق' },
          { label: 'عدد الصفحات', value: '4 صفحات' },
          { label: 'آخر تحديث', value: 'اليوم، 2:30 م' },
        ].map((setting, i, arr) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: c.textMuted, fontFamily: F, marginBottom: 2 }}>
                {setting.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: c.text, fontFamily: F, direction: setting.dir || 'rtl', textAlign: 'right' }}>
                {setting.value}
              </div>
            </div>
            {setting.action && (
              <button
                style={{
                  padding: '6px 14px',
                  background: `rgba(0,0,0,0.05)`,
                  color: c.text,
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: F,
                  cursor: 'pointer',
                }}
              >
                {setting.action}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebsitePage;
