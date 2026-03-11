import React, { useState } from 'react';
import { MOCK_AUTHOR } from '../mockData';
import { colors, icons } from './HubLayout';

interface SettingsPageProps {
  subPage?: string;
}

// ─── Account Settings ────────────────────────────────────
const AccountSection: React.FC = () => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      إعدادات الحساب
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
      أدر معلوماتك الشخصية وإعدادات حسابك
    </p>

    <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
      {/* Profile section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #F3F4F6' }}>
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
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
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
              border: '1px solid rgba(0,0,0,0.08)',
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
    <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      الفوترة والاشتراك
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
      أدر اشتراكك ومعلومات الدفع
    </p>

    {/* Current plan */}
    <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24, marginBottom: 20 }}>
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

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          style={{
            padding: '10px 20px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
          }}
        >
          ترقية الخطة
        </button>
        <button
          style={{
            padding: '10px 20px',
            background: 'transparent',
            color: colors.text,
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
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
    <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
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

// ─── Subdomain Settings ──────────────────────────────────
const SubdomainSection: React.FC = () => {
  const currentSubdomain = MOCK_AUTHOR.username;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
        النطاق الفرعي
      </h2>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
        أدر رابط موقعك ونطاقك الفرعي على كتابة
      </p>

      {/* Current subdomain */}
      <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 16px' }}>
          النطاق الفرعي الحالي
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            background: '#F9FAFB',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.06)',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 14, fontFamily: 'monospace', color: colors.text, direction: 'ltr', flex: 1 }}>
            {currentSubdomain}.kitabh.com
          </span>
          <button
            style={{
              padding: '6px 14px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
            }}
          >
            تعديل
          </button>
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
          هذا هو الرابط الذي يستخدمه زوارك ومشتركوك للوصول إلى موقعك
        </div>
      </div>

      {/* Custom domain — coming soon */}
      <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24, opacity: 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
            نطاق مخصص
          </h3>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              color: '#9CA3AF',
              background: '#F3F4F6',
              padding: '3px 8px',
              borderRadius: 4,
            }}
          >
            قريبا
          </span>
        </div>
        <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
          اربط نطاقك الخاص (مثل newsletter.yourdomain.com) بموقعك على كتابة
        </p>
      </div>
    </div>
  );
};

// ─── Settings Page ───────────────────────────────────────
const SettingsPage: React.FC<SettingsPageProps> = ({ subPage = 'account' }) => {
  const [activeTab, setActiveTab] = useState(subPage);

  const tabs = [
    { id: 'account', label: 'الحساب' },
    { id: 'billing', label: 'الفوترة' },
    { id: 'subdomain', label: 'النطاق' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 3, marginBottom: 24, width: 'fit-content' }}>
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
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'account' && <AccountSection />}
      {activeTab === 'billing' && <BillingSection />}
      {activeTab === 'subdomain' && <SubdomainSection />}
    </div>
  );
};

export default SettingsPage;
