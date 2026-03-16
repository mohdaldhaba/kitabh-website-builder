import React, { useState } from 'react';
import { MOCK_AUTHOR } from '../mockData';
import { colors, icons } from './HubLayout';

interface SettingsPageProps {
  subPage?: string;
}

// ─── Account Settings ────────────────────────────────────
const AccountSection: React.FC = () => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 6px' }}>
          إعدادات الحساب
        </h1>
        <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
          أدر معلوماتك الشخصية وإعدادات حسابك
        </p>
      </div>
    </div>

    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', padding: 16 }}>
      {/* Profile section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #F3F4F6', flexWrap: 'wrap' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #333 0%, #111 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {MOCK_AUTHOR.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            {MOCK_AUTHOR.name}
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', direction: 'ltr', textAlign: 'right' }}>
            {MOCK_AUTHOR.email}
          </div>
        </div>
        <button
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: colors.text,
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
          }}
        >
          تعديل
        </button>
      </div>

      {/* Settings fields */}
      {[
        { label: 'الاسم الكامل', value: MOCK_AUTHOR.name },
        { label: 'البريد الإلكتروني', value: MOCK_AUTHOR.email, dir: 'ltr' as const },
        { label: 'اسم المستخدم', value: MOCK_AUTHOR.username, dir: 'ltr' as const },
        { label: 'النبذة التعريفية', value: MOCK_AUTHOR.bio.slice(0, 80) + '...' },
        { label: 'كلمة المرور', value: '••••••••••••' },
      ].map((field, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 0',
            borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none',
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 2 }}>
              {field.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', direction: field.dir || 'rtl', textAlign: 'right' }}>
              {field.value}
            </div>
          </div>
          <button
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: colors.textMuted,
              border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
            }}
          >
            تعديل
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ─── Billing Settings ────────────────────────────────────
const BillingSection: React.FC = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      الفوترة والاشتراك
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
      أدر اشتراكك ومعلومات الدفع
    </p>

    {/* Current plan */}
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 4px' }}>
            خطة الأعمال
          </h3>
          <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            تُجدد في 1 أبريل 2026
          </div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            $29<span style={{ fontSize: 14, fontWeight: 400, color: colors.textMuted }}>/شهر</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          style={{
            padding: '10px 20px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
          }}
        >
          عرض الباقات
        </button>
        <button
          style={{
            padding: '10px 20px',
            background: 'transparent',
            color: colors.text,
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
          }}
        >
          إدارة الاشتراك
        </button>
      </div>
    </div>

    {/* Usage */}
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', padding: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 16px' }}>
        الاستهلاك
      </h3>
      {[
        { label: 'المشتركون', used: 1920, limit: 5000 },
        { label: 'رسائل البريد الشهرية', used: 3200, limit: 10000 },
        { label: 'مساحة التخزين', used: 1.2, limit: 5, suffix: ' GB' },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{item.label}</span>
            <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {item.used.toLocaleString('en')}{item.suffix || ''} / {item.limit.toLocaleString('en')}{item.suffix || ''}
            </span>
          </div>
          <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min((item.used / item.limit) * 100, 100)}%`,
                background: (item.used / item.limit) > 0.8 ? '#DC2626' : '#111',
                borderRadius: 3,
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Settings Page ───────────────────────────────────────
const SettingsPage: React.FC<SettingsPageProps> = ({ subPage = 'account' }) => {
  const [activeTab, setActiveTab] = useState(subPage);

  const tabs = [
    { id: 'account', label: 'الحساب' },
    { id: 'billing', label: 'الفوترة' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 3, marginBottom: 24, width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              color: activeTab === tab.id ? colors.text : colors.textMuted,
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'account' && <AccountSection />}
      {activeTab === 'billing' && <BillingSection />}
    </div>
  );
};

export default SettingsPage;
