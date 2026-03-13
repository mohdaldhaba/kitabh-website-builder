import React, { useState } from 'react';
import { MOCK_AUTHOR } from '../mockData';
import { colors, icons } from './HubLayout';

interface GrowPageProps {
  subPage?: string;
}

// ─── Carousel Generator Section ─────────────────────────
const CarouselSection: React.FC = () => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      مولّد الكاروسيل
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
      أنشئ كاروسيلات جذابة لمشاركتها على وسائل التواصل الاجتماعي لجذب مشتركين جدد
    </p>

    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', padding: 24, marginBottom: 20 }}>
      {/* Topic input */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
          موضوع الكاروسيل
        </label>
        <input
          type="text"
          placeholder="مثال: 5 نصائح لكتابة نشرة بريدية ناجحة"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            color: colors.text,
            background: '#FAFAFA',
            direction: 'rtl',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Number of slides */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
          عدد الشرائح
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[5, 7, 10].map((n) => (
            <button
              key={n}
              style={{
                padding: '8px 20px',
                background: n === 7 ? '#111' : '#F3F4F6',
                color: n === 7 ? '#fff' : colors.text,
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
          المنصة
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['انستغرام', 'لينكد إن', 'تويتر / X'].map((platform) => (
            <button
              key={platform}
              style={{
                padding: '8px 16px',
                background: platform === 'انستغرام' ? '#111' : '#F3F4F6',
                color: platform === 'انستغرام' ? '#fff' : colors.text,
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer',
              }}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <button
        style={{
          padding: '12px 24px',
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {icons.grow}
        إنشاء الكاروسيل
      </button>
    </div>

    {/* Previous carousels */}
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', padding: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 16px' }}>
        الكاروسيلات السابقة
      </h3>
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
          لم تنشئ أي كاروسيل بعد — ابدأ بإنشاء أول كاروسيل لك
        </div>
      </div>
    </div>
  </div>
);

// ─── Magic Link Section ─────────────────────────────────
const MagicLinkSection: React.FC = () => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      رابط سحري
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
      أنشئ روابط اشتراك سريعة لمشاركتها في أي مكان — بايو إنستغرام، تويتر، يوتيوب، أو أي منصة أخرى
    </p>

    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', padding: 24, marginBottom: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
          رابط الاشتراك الخاص بك
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            readOnly
            value="kitabh.com/subscribe/mohdaldhabaa"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'monospace',
              color: colors.text,
              background: '#FAFAFA',
              direction: 'ltr',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            style={{
              padding: '12px 20px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            نسخ الرابط
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
          نموذج اشتراك مضمّن
        </label>
        <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)' }}>
          <code style={{ fontSize: 12, fontFamily: 'monospace', color: colors.textMuted, direction: 'ltr', display: 'block', textAlign: 'left' }}>
            {'<iframe src="kitabh.com/embed/subscribe/mohdaldhabaa" />'}
          </code>
        </div>
      </div>

      <button
        style={{
          padding: '12px 24px',
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {icons.magicLink}
        إنشاء رابط جديد
      </button>
    </div>
  </div>
);

// ─── Grow Page ───────────────────────────────────────────
const GrowPage: React.FC<GrowPageProps> = ({ subPage = 'carousel' }) => (
  <div style={{ maxWidth: 900, margin: '0 auto' }}>
    {subPage === 'carousel' && <CarouselSection />}
    {subPage === 'magic-link' && <MagicLinkSection />}
  </div>
);

export default GrowPage;
