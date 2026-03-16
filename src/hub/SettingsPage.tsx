import React, { useState } from 'react';
import { MOCK_AUTHOR } from '../mockData';
import { colors, icons } from './HubLayout';

interface SettingsPageProps {
  subPage?: string;
  subdomainLocked?: boolean;
  onSubdomainLockedClick?: () => void;
  customDomainLocked?: boolean;
  onCustomDomainLockedClick?: () => void;
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
          ترقية الخطة
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

// ─── Subdomain Settings ──────────────────────────────────
const SubdomainSection: React.FC<{ customDomainLocked?: boolean; onCustomDomainLockedClick?: () => void }> = ({ customDomainLocked, onCustomDomainLockedClick }) => {
  const currentSubdomain = MOCK_AUTHOR.username;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
        النطاق الفرعي
      </h2>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
        أدر رابط موقعك ونطاقك الفرعي على كتابة
      </p>

      {/* Current subdomain */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', padding: 24, marginBottom: 20 }}>
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
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
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

      {/* Custom domain */}
      <div
        style={{
          background: '#fff', borderRadius: 12,
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
          padding: 24,
          opacity: customDomainLocked ? 0.7 : 0.6,
          cursor: customDomainLocked ? 'pointer' : 'default',
        }}
        onClick={customDomainLocked && onCustomDomainLockedClick ? onCustomDomainLockedClick : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
            نطاق مخصص
          </h3>
          {customDomainLocked ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                color: '#9CA3AF',
                background: '#F3F4F6',
                padding: '3px 8px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              أعمال
            </span>
          ) : (
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
          )}
        </div>
        <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
          اربط نطاقك الخاص (مثل newsletter.yourdomain.com) بموقعك على كتابة
        </p>
      </div>
    </div>
  );
};

// ─── Settings Page ───────────────────────────────────────
const SubdomainLockedOverlay: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: 'rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px', color: '#6B7280',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
    <h3 style={{
      fontSize: 17, fontWeight: 700,
      fontFamily: 'IBM Plex Sans Arabic, sans-serif',
      margin: '0 0 8px', color: '#111827',
    }}>
      إعدادات النطاق الفرعي
    </h3>
    <p style={{
      fontSize: 14, color: '#6B7280',
      fontFamily: 'IBM Plex Sans Arabic, sans-serif',
      margin: '0 0 24px', lineHeight: 1.6,
    }}>
      هذه الميزة متاحة في <strong style={{ color: '#111827' }}>باقة الكاتب</strong>
    </p>
    <button
      onClick={onClick}
      style={{
        padding: '12px 28px',
        background: '#111827', color: '#fff',
        border: 'none', borderRadius: 10,
        fontSize: 15, fontWeight: 600,
        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
        cursor: 'pointer',
      }}
    >
      باقات كتابة
    </button>
  </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ subPage = 'account', subdomainLocked, onSubdomainLockedClick, customDomainLocked, onCustomDomainLockedClick }) => {
  const [activeTab, setActiveTab] = useState(subPage);

  const tabs = [
    { id: 'account', label: 'الحساب' },
    { id: 'billing', label: 'الفوترة' },
    { id: 'subdomain', label: 'النطاق' },
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
            {tab.id === 'subdomain' && subdomainLocked && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'account' && <AccountSection />}
      {activeTab === 'billing' && <BillingSection />}
      {activeTab === 'subdomain' && (
        subdomainLocked
          ? <SubdomainLockedOverlay onClick={onSubdomainLockedClick || (() => { window.location.href = '/pricing'; })} />
          : <SubdomainSection customDomainLocked={customDomainLocked} onCustomDomainLockedClick={onCustomDomainLockedClick} />
      )}
    </div>
  );
};

export default SettingsPage;
