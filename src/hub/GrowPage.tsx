import React, { useState } from 'react';
import { MOCK_AUTHOR, MOCK_NEWSLETTER } from '../mockData';
import { colors, icons } from './HubLayout';

interface GrowPageProps {
  subPage?: string;
}

// ─── Magic Link Section ──────────────────────────────────
const MagicLinkSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const magicLink = `https://kitabh.com/${MOCK_AUTHOR.username}?subscribe=true`;

  const handleCopy = () => {
    navigator.clipboard.writeText(magicLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
        رابط الاشتراك السريع
      </h2>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 20px' }}>
        شارك هذا الرابط في أي مكان — كل من يفتحه يُشترك تلقائيا في نشرتك البريدية
      </p>

      {/* Link box */}
      <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#F9FAFB',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.5)',
              fontSize: 14,
              fontFamily: 'monospace',
              color: colors.text,
              direction: 'ltr',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {magicLink}
          </div>
          <button
            onClick={handleCopy}
            style={{
              padding: '12px 20px',
              background: copied ? '#059669' : colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
            }}
          >
            {copied ? 'تم النسخ!' : 'انسخ الرابط'}
          </button>
        </div>

        <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
          <strong style={{ color: colors.text }}>١٢٣</strong> مشترك جاء عبر هذا الرابط هذا الشهر
        </div>
      </div>

      {/* Share buttons */}
      <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 16px' }}>
          شارك عبر
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'تويتر / X', bg: '#000', color: '#fff' },
            { label: 'واتساب', bg: '#25D366', color: '#fff' },
            { label: 'تلغرام', bg: '#0088cc', color: '#fff' },
            { label: 'البريد الإلكتروني', bg: '#6B7280', color: '#fff' },
          ].map((platform) => (
            <button
              key={platform.label}
              style={{
                padding: '10px 18px',
                background: platform.bg,
                color: platform.color,
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer',
              }}
            >
              {platform.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Referral Section ────────────────────────────────────
const ReferralSection: React.FC = () => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      برنامج الإحالة
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 20px' }}>
      كافئ مشتركيك عندما يحيلون أصدقائهم للاشتراك في نشرتك
    </p>

    <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
      {/* Reward tiers */}
      <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 16px' }}>
        مكافآت الإحالة
      </h3>
      {[
        { referrals: 3, reward: 'شارة مؤيد مميز', active: true },
        { referrals: 10, reward: 'محتوى حصري (مقال خاص)', active: true },
        { referrals: 25, reward: 'ذكر في النشرة البريدية', active: false },
      ].map((tier, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: tier.active ? '#F0FDF4' : '#F9FAFB',
            borderRadius: 8,
            marginBottom: 8,
            border: `1px solid ${tier.active ? '#BBF7D0' : '#E5E7EB'}`,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {tier.referrals} إحالات → {tier.reward}
            </div>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              background: tier.active ? '#DCFCE7' : '#F3F4F6',
              color: tier.active ? '#059669' : '#9CA3AF',
            }}
          >
            {tier.active ? 'مفعّل' : 'معطّل'}
          </span>
        </div>
      ))}

      <div style={{ marginTop: 16, padding: 16, background: '#EEF2FF', borderRadius: 8, border: '1px solid #C7D2FE' }}>
        <div style={{ fontSize: 13, color: '#4338CA', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
          <strong>٤٧</strong> مشترك استخدم برنامج الإحالة — <strong>١٢٣</strong> مشترك جديد عبر الإحالات
        </div>
      </div>
    </div>
  </div>
);

// ─── Embed Section ───────────────────────────────────────
const EmbedSection: React.FC = () => {
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const embedCode = `<iframe src="https://kitabh.com/embed/${MOCK_AUTHOR.username}/subscribe" width="100%" height="200" frameborder="0"></iframe>`;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
        نماذج مدمجة
      </h2>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 20px' }}>
        أضف نموذج اشتراك في أي موقع خارجي عبر كود HTML
      </p>

      <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
        {/* Preview */}
        <div
          style={{
            background: '#F9FAFB',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
            اشترك في {MOCK_NEWSLETTER.displayName}
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 16 }}>
            {MOCK_NEWSLETTER.description.slice(0, 60)}...
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 400, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              disabled
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                direction: 'rtl',
                background: '#fff',
              }}
            />
            <button
              disabled
              style={{
                padding: '10px 18px',
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              }}
            >
              اشترك
            </button>
          </div>
        </div>

        {/* Code */}
        <div
          style={{
            background: '#1F2937',
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <code style={{ fontSize: 12, color: '#A5F3FC', fontFamily: 'monospace', direction: 'ltr', display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {embedCode}
          </code>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(embedCode).catch(() => {});
            setCopiedEmbed(true);
            setTimeout(() => setCopiedEmbed(false), 2000);
          }}
          style={{
            padding: '10px 18px',
            background: copiedEmbed ? '#059669' : colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {copiedEmbed ? 'تم النسخ!' : 'انسخ الكود'}
        </button>
      </div>
    </div>
  );
};

// ─── Grow Page ───────────────────────────────────────────
const GrowPage: React.FC<GrowPageProps> = ({ subPage = 'magic-link' }) => (
  <div style={{ maxWidth: 900, margin: '0 auto' }}>
    {subPage === 'magic-link' && <MagicLinkSection />}
    {subPage === 'referral' && <ReferralSection />}
    {subPage === 'embed' && <EmbedSection />}
  </div>
);

export default GrowPage;
