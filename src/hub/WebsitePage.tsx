import React from 'react';
import { MOCK_AUTHOR } from '../mockData';
import { colors, icons } from './HubLayout';

const WebsitePage: React.FC = () => {
  const websiteUrl = `https://${MOCK_AUTHOR.username}.kitabh.com`;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
        موقعك الإلكتروني
      </h2>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
        عدّل موقعك، أضف صفحات، وخصص التصميم ليعكس هويتك
      </p>

      {/* Website preview card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 20 }}>
        {/* Browser mockup */}
        <div style={{ background: '#F3F4F6', padding: '10px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FCA5A5' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FDE68A' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#86EFAC' }} />
          </div>
          <div
            style={{
              flex: 1,
              padding: '6px 12px',
              background: '#fff',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
              color: colors.textMuted,
              textAlign: 'center',
              direction: 'ltr',
            }}
          >
            {websiteUrl}
          </div>
        </div>
        {/* Preview area */}
        <div
          style={{
            height: 280,
            background: `linear-gradient(135deg, ${colors.primary}10 0%, #fff 50%, ${colors.primary}05 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ width: 60, height: 60, borderRadius: 12, background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 700, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>ك</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            {MOCK_AUTHOR.name}
          </div>
          <div style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            {MOCK_AUTHOR.bio.slice(0, 50)}...
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => window.open('/', '_blank')}
          style={{
            padding: '16px 20px',
            background: colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
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
            padding: '16px 20px',
            background: '#fff',
            color: colors.text,
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
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

      {/* Website settings summary */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 16px' }}>
          إعدادات الموقع
        </h3>

        {[
          { label: 'عنوان الموقع', value: websiteUrl, editable: true },
          { label: 'النطاق المخصص', value: 'لم يتم الربط بعد', editable: true, action: 'ربط نطاق' },
          { label: 'القالب', value: 'الحداثة — أزرق', editable: true },
          { label: 'عدد الصفحات', value: '٤ صفحات', editable: false },
          { label: 'آخر تحديث', value: 'اليوم، ٢:٣٠ م', editable: false },
        ].map((setting, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 2 }}>
                {setting.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', direction: setting.label.includes('عنوان') ? 'ltr' : 'rtl', textAlign: 'right' }}>
                {setting.value}
              </div>
            </div>
            {setting.action && (
              <button
                style={{
                  padding: '6px 14px',
                  background: `${colors.primary}10`,
                  color: colors.primary,
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
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
