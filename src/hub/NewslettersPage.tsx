import React, { useState } from 'react';
import { MOCK_NEWSLETTER } from '../mockData';
import type { MockNewsletter } from '../mockData';
import { colors, icons } from './HubLayout';

// ─── Mock multiple newsletters ──────────────────────────
const mockNewsletters: (MockNewsletter & { welcomeEmail?: { subject: string; body: string; enabled: boolean } })[] = [
  {
    ...MOCK_NEWSLETTER,
    welcomeEmail: {
      subject: 'أهلا بك في رسالة السبت!',
      body: 'مرحبا بك في نشرتنا الأسبوعية. ستصلك كل سبت صباحا مقالات عن صناعة المحتوى وريادة الأعمال والتقنية.',
      enabled: true,
    },
  },
  {
    ...MOCK_NEWSLETTER,
    _id: 'nl_002',
    displayName: 'نشرة التقنية',
    slug: 'tech-weekly',
    description: 'آخر أخبار التقنية والذكاء الاصطناعي — كل أربعاء.',
    frequency: 'weekly' as const,
    is_live: true,
    emailStats: {
      ...MOCK_NEWSLETTER.emailStats,
      totalSubscribers: 480,
      avgOpenRate: 62.1,
      avgClickRate: 22.4,
    },
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-03-10T14:00:00.000Z',
    welcomeEmail: {
      subject: 'مرحبا في نشرة التقنية',
      body: 'أهلا بك! ستتلقى أحدث المقالات التقنية كل أسبوع.',
      enabled: false,
    },
  },
];

const frequencyLabels: Record<string, string> = {
  daily: 'يومية',
  weekly: 'أسبوعية',
  monthly: 'شهرية',
};

// ─── Newsletter Settings Modal ──────────────────────────
interface SettingsModalProps {
  newsletter: typeof mockNewsletters[0];
  onClose: () => void;
  activeTab: 'settings' | 'welcome-email';
}

const SettingsModal: React.FC<SettingsModalProps> = ({ newsletter, onClose, activeTab: initialTab }) => {
  const [tab, setTab] = useState<'settings' | 'welcome-email'>(initialTab);
  const [name, setName] = useState(newsletter.displayName);
  const [desc, setDesc] = useState(newsletter.description);
  const [freq, setFreq] = useState(newsletter.frequency);
  const [showSubs, setShowSubs] = useState(newsletter.showNumberOfSubscribers);
  const [hideBrand, setHideBrand] = useState(newsletter.hideBranding);
  const [welcSubject, setWelcSubject] = useState(newsletter.welcomeEmail?.subject || '');
  const [welcBody, setWelcBody] = useState(newsletter.welcomeEmail?.body || '');
  const [welcEnabled, setWelcEnabled] = useState(newsletter.welcomeEmail?.enabled || false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'IBM Plex Sans Arabic, sans-serif',
    color: colors.text,
    background: '#FAFAFA',
    direction: 'rtl',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    fontFamily: 'IBM Plex Sans Arabic, sans-serif',
    marginBottom: 8,
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        direction: 'rtl',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          width: 'calc(100% - 32px)',
          maxWidth: 640,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          margin: 16,
          boxSizing: 'border-box' as const,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
            {newsletter.displayName}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 20, color: colors.textMuted, lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 3, margin: '16px', width: 'fit-content' }}>
          {([
            { id: 'settings' as const, label: 'الإعدادات' },
            { id: 'welcome-email' as const, label: 'رسالة الترحيب' },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 18px',
                background: tab === t.id ? '#fff' : 'transparent',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: tab === t.id ? 600 : 400,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                color: tab === t.id ? colors.text : colors.textMuted,
                cursor: 'pointer',
                boxShadow: tab === t.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '8px 16px 16px' }}>
          {tab === 'settings' && (
            <>
              {/* Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>اسم النشرة</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>الوصف</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Frequency */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>تكرار الإرسال</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFreq(f)}
                      style={{
                        padding: '8px 16px',
                        background: freq === f ? '#111' : '#F3F4F6',
                        color: freq === f ? '#fff' : colors.text,
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                        cursor: 'pointer',
                      }}
                    >
                      {frequencyLabels[f]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 14, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إظهار عدد المشتركين</span>
                <button
                  onClick={() => setShowSubs(!showSubs)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: 'none',
                    background: showSubs ? '#111' : '#D1D5DB',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    right: showSubs ? 3 : 'auto',
                    left: showSubs ? 'auto' : 3,
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 14, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إخفاء شعار كتابة</span>
                <button
                  onClick={() => setHideBrand(!hideBrand)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: 'none',
                    background: hideBrand ? '#111' : '#D1D5DB',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    right: hideBrand ? 3 : 'auto',
                    left: hideBrand ? 'auto' : 3,
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>

              {/* Save */}
              <button
                style={{
                  marginTop: 20,
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
                حفظ التغييرات
              </button>
            </>
          )}

          {tab === 'welcome-email' && (
            <>
              {/* Toggle enabled */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', marginBottom: 20, borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 2 }}>
                    تفعيل رسالة الترحيب
                  </div>
                  <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                    تُرسل تلقائيا لكل مشترك جديد
                  </div>
                </div>
                <button
                  onClick={() => setWelcEnabled(!welcEnabled)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: 'none',
                    background: welcEnabled ? '#059669' : '#D1D5DB',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    right: welcEnabled ? 3 : 'auto',
                    left: welcEnabled ? 'auto' : 3,
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: 20, opacity: welcEnabled ? 1 : 0.5, pointerEvents: welcEnabled ? 'auto' : 'none' }}>
                <label style={labelStyle}>عنوان الرسالة</label>
                <input type="text" value={welcSubject} onChange={(e) => setWelcSubject(e.target.value)} style={inputStyle} />
              </div>

              {/* Body */}
              <div style={{ marginBottom: 20, opacity: welcEnabled ? 1 : 0.5, pointerEvents: welcEnabled ? 'auto' : 'none' }}>
                <label style={labelStyle}>نص الرسالة</label>
                <textarea
                  value={welcBody}
                  onChange={(e) => setWelcBody(e.target.value)}
                  rows={6}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }}
                />
              </div>

              {/* Preview hint */}
              <div style={{
                padding: '14px 16px',
                background: '#F9FAFB',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
                marginBottom: 20,
                opacity: welcEnabled ? 1 : 0.5,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 6 }}>
                  معاينة
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 4 }}>
                  {welcSubject || 'عنوان الرسالة'}
                </div>
                <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', lineHeight: 1.7 }}>
                  {welcBody || 'نص الرسالة سيظهر هنا...'}
                </div>
              </div>

              {/* Save */}
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
                حفظ رسالة الترحيب
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Newsletter Card ────────────────────────────────────
interface CardProps {
  newsletter: typeof mockNewsletters[0];
  onEdit: (tab: 'settings' | 'welcome-email') => void;
}

const NewsletterCard: React.FC<CardProps> = ({ newsletter, onEdit }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const siteUrl = `kitabh.com/${newsletter.userName}/${newsletter.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${siteUrl}`).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Top bar with status */}
      <div style={{ padding: '16px 16px 16px 16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #333 0%, #111 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}>
              {newsletter.displayName.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 2px' }}>
                {newsletter.displayName}
              </h3>
              <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                {frequencyLabels[newsletter.frequency]} &middot; {newsletter.emailStats.totalSubscribers.toLocaleString('en')} مشترك
              </span>
            </div>
          </div>
          <span style={{
            padding: '4px 12px',
            borderRadius: 8,
            background: newsletter.is_live ? '#ECFDF5' : '#F3F4F6',
            color: newsletter.is_live ? '#059669' : '#6B7280',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          }}>
            {newsletter.is_live ? 'نشطة' : 'متوقفة'}
          </span>
        </div>
        <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0, lineHeight: 1.6 }}>
          {newsletter.description}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', padding: '16px', gap: '12px 24px', borderBottom: '1px solid #F3F4F6' }}>
        {[
          { label: 'المشتركون', value: newsletter.emailStats.totalSubscribers.toLocaleString('en') },
          { label: 'معدل الفتح', value: `${newsletter.emailStats.avgOpenRate}%` },
          { label: 'معدل النقر', value: `${newsletter.emailStats.avgClickRate}%` },
          { label: 'إجمالي المُرسل', value: newsletter.emailStats.totalSent.toLocaleString('en') },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Link + Actions */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {/* Copy link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 auto' }}>
          <div style={{
            padding: '8px 14px',
            background: '#F9FAFB',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            fontSize: 13,
            fontFamily: 'monospace',
            color: colors.textMuted,
            direction: 'ltr',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            {siteUrl}
          </div>
          <button
            onClick={copyLink}
            style={{
              padding: '8px 16px',
              background: linkCopied ? '#059669' : '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {linkCopied ? 'تم النسخ' : 'نسخ الرابط'}
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() => onEdit('welcome-email')}
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
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {icons.emailJourney}
            رسالة الترحيب
          </button>
          <button
            onClick={() => onEdit('settings')}
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
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {icons.settings}
            الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Newsletters Page ───────────────────────────────────
interface NewslettersPageProps {
  activePublicationIndex?: number;
  plan?: 'free' | 'writers' | 'business';
}

const NewslettersPage: React.FC<NewslettersPageProps> = ({ activePublicationIndex, plan = 'business' }) => {
  const hasExistingNewsletter = mockNewsletters.length >= 1;
  const createLocked = plan === 'free' || (plan === 'writers' && hasExistingNewsletter);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [editingNl, setEditingNl] = useState<typeof mockNewsletters[0] | null>(null);
  const [editTab, setEditTab] = useState<'settings' | 'welcome-email'>('settings');

  const openEditor = (nl: typeof mockNewsletters[0], tab: 'settings' | 'welcome-email') => {
    setEditingNl(nl);
    setEditTab(tab);
  };

  const isSingleMode = activePublicationIndex !== undefined;
  const visibleNewsletters = isSingleMode
    ? [mockNewsletters[activePublicationIndex] || mockNewsletters[0]]
    : mockNewsletters;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 6px' }}>النشرات البريدية</h1>
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
            {isSingleMode
              ? 'عدّل إعدادات نشرتك وفعّل رسالة الترحيب'
              : 'أدر نشراتك البريدية، عدّل إعداداتها، وفعّل رسائل الترحيب'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={createLocked ? () => setShowLockedModal(true) : () => {}}
            style={{
              padding: '10px 20px',
              background: createLocked ? '#E5E7EB' : '#111',
              color: createLocked ? '#9CA3AF' : '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              opacity: createLocked ? 0.8 : 1,
            }}
          >
            {createLocked ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            إنشاء نشرة جديدة
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {visibleNewsletters.map((nl) => (
          <NewsletterCard
            key={nl._id}
            newsletter={nl}
            onEdit={(tab) => openEditor(nl, tab)}
          />
        ))}
      </div>

      {editingNl && (
        <SettingsModal
          newsletter={editingNl}
          onClose={() => setEditingNl(null)}
          activeTab={editTab}
        />
      )}

      {showLockedModal && (
        <>
          <div onClick={() => setShowLockedModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%',
            textAlign: 'center', zIndex: 9999, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif', direction: 'rtl',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#6B7280' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>
              {plan === 'free' ? 'إنشاء نشرة بريدية' : 'إنشاء نشرة جديدة'}
            </h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6 }}>
              {plan === 'free'
                ? <>هذه ميزة متاحة على <strong style={{ color: '#111827' }}>باقة الكاتب</strong> و<strong style={{ color: '#111827' }}>باقة الأعمال</strong></>
                : <>إنشاء أكثر من نشرة بريدية ميزة متاحة على <strong style={{ color: '#111827' }}>باقة الأعمال</strong></>
              }
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setShowLockedModal(false)} style={{ padding: '10px 20px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                إغلاق
              </button>
              <button onClick={() => { window.location.href = '/pricing'; }} style={{ padding: '10px 20px', background: '#111827', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                باقات كتابة
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewslettersPage;
