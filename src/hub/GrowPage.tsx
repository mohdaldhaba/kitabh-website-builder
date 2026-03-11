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

    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 20 }}>
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
            border: '1px solid #E5E7EB',
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
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
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

// ─── Magic Link Section (Coming Soon) ───────────────────
const MagicLinkComingSoon: React.FC = () => (
  <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
    <div style={{
      width: 64, height: 64, borderRadius: 16, background: '#F3F4F6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px',
    }}>
      {icons.magicLink}
    </div>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      نماذج الاشتراك
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px', lineHeight: 1.7 }}>
      قريبا ستتمكن من إنشاء نماذج اشتراك مخصصة وروابط سريعة لمشاركتها في أي مكان
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

// ─── Grow Page ───────────────────────────────────────────
const GrowPage: React.FC<GrowPageProps> = ({ subPage = 'carousel' }) => (
  <div style={{ maxWidth: 900, margin: '0 auto' }}>
    {subPage === 'carousel' && <CarouselSection />}
    {subPage === 'magic-link' && <MagicLinkComingSoon />}
  </div>
);

export default GrowPage;
