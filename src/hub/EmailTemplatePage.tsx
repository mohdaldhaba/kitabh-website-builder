import React, { useState } from 'react';
import { MOCK_NEWSLETTER, MOCK_AUTHOR } from '../mockData';
import { useTheme } from './HubLayout';

const F = 'IBM Plex Sans Arabic, sans-serif';

// ─── Types ──────────────────────────────────────────────
type TemplateTheme = 'kitabh' | 'custom';

interface HeaderConfig {
  logoUrl: string;
  showLogo: boolean;
  title: string;
  showTitle: boolean;
  bgColor: string;
  textColor: string;
  alignment: 'center' | 'right' | 'left';
  padding: number;
}

interface FooterConfig {
  text: string;
  showUnsubscribe: boolean;
  unsubscribeText: string;
  showSocial: boolean;
  socialLinks: { platform: string; url: string }[];
  showAddress: boolean;
  address: string;
  bgColor: string;
  textColor: string;
  dividerColor: string;
}

interface BodyConfig {
  bgColor: string;
  textColor: string;
  linkColor: string;
  fontFamily: string;
  maxWidth: number;
}

// ─── Defaults ───────────────────────────────────────────
const defaultHeader: HeaderConfig = {
  logoUrl: '',
  showLogo: true,
  title: MOCK_NEWSLETTER.displayName,
  showTitle: true,
  bgColor: '#ffffff',
  textColor: '#111827',
  alignment: 'center',
  padding: 32,
};

const defaultFooter: FooterConfig = {
  text: `${MOCK_NEWSLETTER.displayName} — ${MOCK_NEWSLETTER.description.slice(0, 60)}`,
  showUnsubscribe: true,
  unsubscribeText: 'إلغاء الاشتراك',
  showSocial: true,
  socialLinks: [
    { platform: 'X', url: 'https://x.com/kitabhcom' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/kitabh' },
    { platform: 'Instagram', url: 'https://instagram.com/kitabhcom' },
  ],
  showAddress: true,
  address: 'كتابة — الرياض، المملكة العربية السعودية',
  bgColor: '#F9FAFB',
  textColor: '#6B7280',
  dividerColor: '#E5E7EB',
};

const defaultBody: BodyConfig = {
  bgColor: '#ffffff',
  textColor: '#371D12',
  linkColor: '#0000FF',
  fontFamily: 'IBM Plex Sans Arabic',
  maxWidth: 600,
};

// ─── Toggle Component ───────────────────────────────────
const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 40,
      height: 22,
      borderRadius: 11,
      border: 'none',
      background: value ? '#111' : '#D1D5DB',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.2s',
      flexShrink: 0,
    }}
  >
    <div style={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 3,
      right: value ? 3 : 'auto',
      left: value ? 'auto' : 3,
      transition: 'all 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    }} />
  </button>
);

// ─── Kitabh Production Template Preview ─────────────────
// Mirrors the live template from kitaba-api/utils/templates/newslwtterTemplate2.js
const KitabhTemplatePreview: React.FC = () => {
  const BRAND = '#0052D2';
  const TEXT_MUTED = '#6B7280';

  return (
    <div style={{ background: '#E5E7EB', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 620, borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '2px solid #f5f5f5', background: '#fff' }}>

        {/* ── Top nav bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #ccc', direction: 'rtl' }}>
          <span style={{ fontSize: 14, color: '#292D32', fontFamily: 'Arial, sans-serif' }}>اشترك في النشرة</span>
          <span style={{ fontSize: 14, color: '#292D32', fontFamily: 'Arial, sans-serif' }}>القراءة على الموقع</span>
        </div>

        {/* ── Newsletter banner ── */}
        <div style={{ background: BRAND, padding: '28px 20px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10,
          }}>
            <span style={{ color: '#fff', fontSize: 24, fontWeight: 700, fontFamily: F }}>
              {MOCK_NEWSLETTER.displayName.charAt(0)}
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: F, marginBottom: 4 }}>
            {MOCK_NEWSLETTER.displayName}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: F }}>
            {MOCK_NEWSLETTER.description.slice(0, 60)}
          </div>
        </div>

        {/* ── Article title ── */}
        <div style={{ padding: '20px 20px 0', direction: 'rtl' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#371D12', fontFamily: 'Roboto, Arial, sans-serif', margin: '0 0 8px', lineHeight: 1.5, textAlign: 'right' }}>
            عنوان المقال يظهر هنا
          </h1>
          <p style={{ fontSize: 14, color: '#333', fontFamily: 'Arial, sans-serif', margin: '0 0 12px', lineHeight: 2, textAlign: 'right' }}>
            وقت القراءة: 5 دقيقة
          </p>
        </div>

        {/* ── Author row ── */}
        <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 10, direction: 'rtl' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #333 0%, #111 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>
            {MOCK_AUTHOR.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#371D12', fontFamily: 'Arial, sans-serif' }}>
              {MOCK_AUTHOR.name}
            </div>
            <div style={{ fontSize: 14, color: '#333', fontFamily: 'Arial, sans-serif' }}>
              في {MOCK_NEWSLETTER.displayName} &nbsp; ١٤ مارس ٢٠٢٦
            </div>
          </div>
        </div>

        {/* ── Cover image placeholder ── */}
        <div style={{ padding: '0 20px' }}>
          <div style={{
            width: '100%', height: 180, borderRadius: 10, background: '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 13, color: TEXT_MUTED }}>صورة الغلاف</span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ borderBottom: '1px solid #ccc' }} />
        </div>

        {/* ── Action icons row ── */}
        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8, direction: 'rtl' }}>
          {['heart', 'comment', 'eye', 'share'].map((icon) => (
            <div key={icon} style={{
              width: 32, height: 32, borderRadius: '50%', border: '2px solid #eee',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {icon === 'heart' && <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />}
                {icon === 'comment' && <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>}
                {icon === 'eye' && <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                {icon === 'share' && <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>}
              </svg>
            </div>
          ))}
          {/* Subscribe button */}
          <div style={{
            padding: '6px 16px', borderRadius: 20, border: '1px solid #e0e0e0',
            background: '#f9f9f9', fontSize: 13, fontWeight: 600, color: '#333',
            fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center',
          }}>
            اشترك الآن
          </div>
        </div>

        {/* ── Article body ── */}
        <div style={{ padding: '0 20px 24px', direction: 'rtl', fontFamily: "'Roboto', Arial, sans-serif", fontSize: 17, lineHeight: 2, color: '#000' }}>
          <p style={{ margin: '0 0 16px' }}>
            هذا نص تجريبي يوضح كيف سيظهر محتوى مقالك للمشتركين في بريدهم الإلكتروني. التصميم مبني على قالب كتابة الرسمي.
          </p>
          <p style={{ margin: '0 0 16px' }}>
            يمكنك كتابة فقرات متعددة وإضافة عناصر مختلفة مثل الاقتباسات والروابط والصور.
          </p>
          {/* Blockquote */}
          <div style={{
            margin: '20px 0', padding: 20, background: '#F7F9FC',
            borderRight: `4px solid ${BRAND}`, borderRadius: 10,
            color: TEXT_MUTED, fontStyle: 'italic', fontSize: 16,
          }}>
            &ldquo;اقتباس مميز من المقال يظهر بهذا الشكل داخل الرسالة البريدية.&rdquo;
          </div>
          <p style={{ margin: '0 0 16px' }}>
            يدعم القالب العناوين والقوائم والأكواد البرمجية وكل تنسيقات المحرر.
          </p>
        </div>

        {/* ── CTA button ── */}
        <div style={{ padding: '0 20px 24px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', padding: '14px 36px',
            background: BRAND, color: '#fff', borderRadius: 8,
            fontSize: 16, fontWeight: 600, fontFamily: F,
          }}>
            اقرأ المقال كاملا
          </div>
        </div>

        {/* ── Author bio footer ── */}
        <div style={{ padding: '20px', borderTop: '1px solid #E0E6EF', direction: 'rtl' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #333 0%, #111 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: '#fff',
            }}>
              {MOCK_AUTHOR.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', fontFamily: 'Arial, sans-serif' }}>
                {MOCK_AUTHOR.name}
              </div>
              <div style={{ fontSize: 13, color: TEXT_MUTED, fontFamily: 'Arial, sans-serif', lineHeight: 1.5, marginTop: 2 }}>
                {MOCK_AUTHOR.bio.slice(0, 80)}
              </div>
            </div>
          </div>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-start' }}>
            {['𝕏', '📷', '💼'].map((icon, i) => (
              <span key={i} style={{ fontSize: 16, cursor: 'pointer' }}>{icon}</span>
            ))}
          </div>
        </div>

        {/* ── Unsubscribe footer ── */}
        <div style={{ padding: '16px 20px', background: '#F7F9FC', borderTop: '1px solid #E0E6EF', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: TEXT_MUTED, fontFamily: 'Arial, sans-serif', lineHeight: 1.7 }}>
            وصلتك هذه الرسالة لأنك مشترك في {MOCK_NEWSLETTER.displayName}
          </div>
          <div style={{ fontSize: 12, color: TEXT_MUTED, fontFamily: 'Arial, sans-serif', marginTop: 4 }}>
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>إلغاء الاشتراك</span>
            {' · '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>إدارة التفضيلات</span>
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Arial, sans-serif', marginTop: 8 }}>
            مدعوم من منصة كتابة
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Custom Template Preview ────────────────────────────
const CustomPreview: React.FC<{ header: HeaderConfig; footer: FooterConfig; body: BodyConfig }> = ({ header, footer, body }) => (
  <div style={{ background: '#E5E7EB', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'center' }}>
    <div style={{
      width: '100%', maxWidth: body.maxWidth, borderRadius: 8, overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontFamily: `'${body.fontFamily}', sans-serif`,
    }}>
      {/* Header */}
      <div style={{
        background: header.bgColor, padding: `${header.padding}px 32px`,
        textAlign: header.alignment, borderBottom: `1px solid ${footer.dividerColor}`,
      }}>
        {header.showLogo && (
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #333 0%, #111 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff',
            marginBottom: header.showTitle ? 12 : 0,
          }}>
            {header.title.charAt(0)}
          </div>
        )}
        {header.showTitle && (
          <div style={{ fontSize: 20, fontWeight: 700, color: header.textColor, fontFamily: `'${body.fontFamily}', sans-serif` }}>
            {header.title}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ background: body.bgColor, padding: '32px', color: body.textColor, lineHeight: 1.8, fontSize: 15 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px', color: body.textColor }}>
          عنوان المقال يظهر هنا
        </h2>
        <p style={{ margin: '0 0 16px', color: body.textColor, opacity: 0.85 }}>
          هذا نص تجريبي يوضح كيف سيظهر محتوى رسالتك البريدية للمشتركين. يمكنك تخصيص الألوان والخطوط والتنسيق حسب هوية نشرتك.
        </p>
        <p style={{ margin: '0 0 16px', color: body.textColor, opacity: 0.85 }}>
          النص الثاني يظهر هنا لتوضيح تباعد الفقرات وأسلوب العرض. يمكنك إضافة{' '}
          <span style={{ color: body.linkColor, textDecoration: 'underline', cursor: 'pointer' }}>روابط بهذا الشكل</span>{' '}
          داخل رسائلك.
        </p>
        <div style={{
          margin: '24px 0', padding: '20px 24px', background: '#F9FAFB',
          borderRadius: 8, borderRight: `4px solid ${body.linkColor}`,
        }}>
          <p style={{ margin: 0, fontSize: 14, color: body.textColor, opacity: 0.75, fontStyle: 'italic' }}>
            &ldquo;اقتباس مميز من المقال يمكن أن يظهر بهذا الشكل داخل رسالتك البريدية.&rdquo;
          </p>
        </div>
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <span style={{
            display: 'inline-block', padding: '12px 32px', background: body.linkColor,
            color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            اقرأ المقال كاملا
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: footer.bgColor, padding: '24px 32px',
        borderTop: `1px solid ${footer.dividerColor}`, textAlign: 'center',
      }}>
        {footer.showSocial && footer.socialLinks.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            {footer.socialLinks.map((link, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%', background: '#E5E7EB',
                fontSize: 11, fontWeight: 700, color: '#374151', cursor: 'pointer',
              }}>
                {link.platform.charAt(0)}
              </span>
            ))}
          </div>
        )}
        <div style={{
          fontSize: 13, color: footer.textColor, fontFamily: `'${body.fontFamily}', sans-serif`,
          lineHeight: 1.7, marginBottom: footer.showUnsubscribe || footer.showAddress ? 12 : 0,
        }}>
          {footer.text}
        </div>
        {footer.showAddress && (
          <div style={{
            fontSize: 12, color: footer.textColor, fontFamily: `'${body.fontFamily}', sans-serif`,
            opacity: 0.7, marginBottom: footer.showUnsubscribe ? 12 : 0,
          }}>
            {footer.address}
          </div>
        )}
        {footer.showUnsubscribe && (
          <div style={{ fontSize: 12, marginTop: 4 }}>
            <span style={{ color: footer.textColor, textDecoration: 'underline', cursor: 'pointer', opacity: 0.6 }}>
              {footer.unsubscribeText}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── Main Page ──────────────────────────────────────────
const EmailTemplatePage: React.FC = () => {
  const { colors: c } = useTheme();
  const [theme, setTheme] = useState<TemplateTheme>('kitabh');
  const [header, setHeader] = useState<HeaderConfig>(defaultHeader);
  const [footer, setFooter] = useState<FooterConfig>(defaultFooter);
  const [body, setBody] = useState<BodyConfig>(defaultBody);
  const [activeSection, setActiveSection] = useState<'header' | 'body' | 'footer'>('header');

  const updateHeader = (patch: Partial<HeaderConfig>) => setHeader((prev) => ({ ...prev, ...patch }));
  const updateFooter = (patch: Partial<FooterConfig>) => setFooter((prev) => ({ ...prev, ...patch }));
  const updateBody = (patch: Partial<BodyConfig>) => setBody((prev) => ({ ...prev, ...patch }));

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setFooter((prev) => {
      const links = [...prev.socialLinks];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, socialLinks: links };
    });
  };
  const addSocialLink = () => setFooter((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: '', url: '' }] }));
  const removeSocialLink = (index: number) => setFooter((prev) => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }));

  const card = {
    background: c.cardBg,
    borderRadius: 12,
    border: `1px solid ${c.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
    padding: 20,
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: c.text, fontFamily: F, marginBottom: 6,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: `1px solid ${c.border}`,
    borderRadius: 8, fontSize: 14, fontFamily: F, color: c.text,
    background: 'transparent', direction: 'rtl', outline: 'none', boxSizing: 'border-box',
  };
  const colorInputStyle: React.CSSProperties = {
    width: 40, height: 34, border: `1px solid ${c.border}`, borderRadius: 6, cursor: 'pointer', padding: 2, background: c.cardBg,
  };

  const sectionTabs = [
    { id: 'header' as const, label: 'الهيدر' },
    { id: 'body' as const, label: 'المحتوى' },
    { id: 'footer' as const, label: 'الفوتر' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: c.text, fontFamily: F, margin: '0 0 4px' }}>
            قالب البريد الإلكتروني
          </h2>
          <p style={{ fontSize: 14, color: c.textMuted, fontFamily: F, margin: 0 }}>
            اختر شكل رسائلك البريدية — استخدم قالب كتابة الجاهز أو أنشئ قالبك الخاص
          </p>
        </div>
        <button style={{
          padding: '10px 24px', background: c.text, color: c.cardBg,
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: F, cursor: 'pointer',
        }}>
          حفظ القالب
        </button>
      </div>

      {/* ── Theme Selector ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Kitabh Template Card */}
        <button
          onClick={() => setTheme('kitabh')}
          style={{
            ...card,
            marginBottom: 0,
            cursor: 'pointer',
            border: theme === 'kitabh' ? '2px solid #0052D2' : `1px solid ${c.border}`,
            position: 'relative',
            textAlign: 'right',
            transition: 'border-color 0.2s',
          }}
        >
          {theme === 'kitabh' && (
            <div style={{
              position: 'absolute', top: 12, left: 12, width: 24, height: 24,
              borderRadius: '50%', background: '#0052D2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          {/* Mini preview */}
          <div style={{
            height: 120, borderRadius: 8, overflow: 'hidden', marginBottom: 12,
            border: `1px solid ${c.border}`, background: '#fff',
          }}>
            <div style={{ background: '#0052D2', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: F }}>
                {MOCK_NEWSLETTER.displayName}
              </span>
            </div>
            <div style={{ padding: '8px 12px' }}>
              <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, marginBottom: 4, width: '80%' }} />
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, marginBottom: 4, width: '60%' }} />
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, width: '70%' }} />
            </div>
            <div style={{ padding: '4px 12px', borderTop: '1px solid #F3F4F6' }}>
              <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, width: '50%', margin: '0 auto' }} />
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: c.text, fontFamily: F, marginBottom: 2 }}>
            قالب كتابة
          </div>
          <div style={{ fontSize: 13, color: c.textMuted, fontFamily: F }}>
            التصميم الرسمي لمنصة كتابة — جاهز للاستخدام
          </div>
        </button>

        {/* Custom Template Card */}
        <button
          onClick={() => setTheme('custom')}
          style={{
            ...card,
            marginBottom: 0,
            cursor: 'pointer',
            border: theme === 'custom' ? '2px solid #0000FF' : `1px solid ${c.border}`,
            position: 'relative',
            textAlign: 'right',
            transition: 'border-color 0.2s',
          }}
        >
          {theme === 'custom' && (
            <div style={{
              position: 'absolute', top: 12, left: 12, width: 24, height: 24,
              borderRadius: '50%', background: '#0000FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          {/* Mini preview */}
          <div style={{
            height: 120, borderRadius: 8, overflow: 'hidden', marginBottom: 12,
            border: `1px solid ${c.border}`, background: '#fff',
          }}>
            <div style={{ background: header.bgColor, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${c.border}` }}>
              <span style={{ color: header.textColor, fontSize: 10, fontWeight: 700, fontFamily: F }}>
                {header.title}
              </span>
            </div>
            <div style={{ padding: '8px 12px' }}>
              <div style={{ height: 6, background: body.linkColor, borderRadius: 3, marginBottom: 4, width: '40%', opacity: 0.3 }} />
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, marginBottom: 4, width: '70%' }} />
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, width: '55%' }} />
            </div>
            <div style={{ padding: '4px 12px', borderTop: '1px solid #F3F4F6', background: footer.bgColor }}>
              <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, width: '50%', margin: '0 auto' }} />
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: c.text, fontFamily: F, marginBottom: 2 }}>
            قالب مخصص
          </div>
          <div style={{ fontSize: 13, color: c.textMuted, fontFamily: F }}>
            تحكم كامل بالألوان والهيدر والفوتر والخط
          </div>
        </button>
      </div>

      {/* ── Kitabh Theme: Preview only ── */}
      {theme === 'kitabh' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.textMuted, fontFamily: F, marginBottom: 10 }}>
            معاينة قالب كتابة
          </div>
          <KitabhTemplatePreview />
          <div style={{ ...card, marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052D2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text, fontFamily: F }}>
                قالب كتابة الرسمي
              </div>
              <div style={{ fontSize: 13, color: c.textMuted, fontFamily: F, marginTop: 2 }}>
                هذا القالب مستخدم حاليا في إرسال جميع النشرات البريدية. يتضمن بانر النشرة، معلومات الكاتب، أزرار التفاعل (إعجاب، تعليق، مشاركة)، وتذييل إلغاء الاشتراك تلقائيا.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Theme: Editor + Preview ── */}
      {theme === 'custom' && (
        <div className="email-tpl-grid" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Editor Panel */}
          <div>
            {/* Section tabs */}
            <div style={{ display: 'flex', gap: 4, background: c.cardBg, borderRadius: 8, padding: 3, marginBottom: 16, border: `1px solid ${c.border}` }}>
              {sectionTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveSection(t.id)}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: activeSection === t.id ? c.text : 'transparent',
                    color: activeSection === t.id ? c.cardBg : c.textMuted,
                    border: 'none', borderRadius: 6, fontSize: 14,
                    fontWeight: activeSection === t.id ? 600 : 400,
                    fontFamily: F, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Header Settings */}
            {activeSection === 'header' && (
              <div style={card}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>عنوان الهيدر</label>
                  <input type="text" value={header.title} onChange={(e) => updateHeader({ title: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: c.text, fontFamily: F }}>إظهار الشعار</span>
                  <Toggle value={header.showLogo} onChange={(v) => updateHeader({ showLogo: v })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: c.text, fontFamily: F }}>إظهار العنوان</span>
                  <Toggle value={header.showTitle} onChange={(v) => updateHeader({ showTitle: v })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>محاذاة</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['right', 'center', 'left'] as const).map((a) => (
                      <button key={a} onClick={() => updateHeader({ alignment: a })} style={{
                        flex: 1, padding: '8px 0',
                        background: header.alignment === a ? c.text : 'transparent',
                        color: header.alignment === a ? c.cardBg : c.text,
                        border: `1px solid ${header.alignment === a ? c.text : c.border}`,
                        borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F, cursor: 'pointer',
                      }}>
                        {a === 'right' ? 'يمين' : a === 'center' ? 'وسط' : 'يسار'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>لون الخلفية</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={header.bgColor} onChange={(e) => updateHeader({ bgColor: e.target.value })} style={colorInputStyle} />
                      <input type="text" value={header.bgColor} onChange={(e) => updateHeader({ bgColor: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', direction: 'ltr', fontSize: 12 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>لون النص</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={header.textColor} onChange={(e) => updateHeader({ textColor: e.target.value })} style={colorInputStyle} />
                      <input type="text" value={header.textColor} onChange={(e) => updateHeader({ textColor: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', direction: 'ltr', fontSize: 12 }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>الحشوة (padding)</label>
                  <input type="range" min={8} max={64} value={header.padding} onChange={(e) => updateHeader({ padding: Number(e.target.value) })} style={{ width: '100%' }} />
                  <div style={{ fontSize: 12, color: c.textMuted, fontFamily: 'monospace', textAlign: 'center' }}>{header.padding}px</div>
                </div>
              </div>
            )}

            {/* Body Settings */}
            {activeSection === 'body' && (
              <div style={card}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>لون الخلفية</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={body.bgColor} onChange={(e) => updateBody({ bgColor: e.target.value })} style={colorInputStyle} />
                      <input type="text" value={body.bgColor} onChange={(e) => updateBody({ bgColor: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', direction: 'ltr', fontSize: 12 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>لون النص</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={body.textColor} onChange={(e) => updateBody({ textColor: e.target.value })} style={colorInputStyle} />
                      <input type="text" value={body.textColor} onChange={(e) => updateBody({ textColor: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', direction: 'ltr', fontSize: 12 }} />
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>لون الروابط / الأزرار</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={body.linkColor} onChange={(e) => updateBody({ linkColor: e.target.value })} style={colorInputStyle} />
                    <input type="text" value={body.linkColor} onChange={(e) => updateBody({ linkColor: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', direction: 'ltr', fontSize: 12 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>الخط</label>
                  <select value={body.fontFamily} onChange={(e) => updateBody({ fontFamily: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['IBM Plex Sans Arabic', 'Cairo', 'Tajawal', 'Almarai', 'Amiri', 'Changa', 'El Messiri', 'Readex Pro'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>عرض الرسالة الأقصى</label>
                  <input type="range" min={480} max={720} step={20} value={body.maxWidth} onChange={(e) => updateBody({ maxWidth: Number(e.target.value) })} style={{ width: '100%' }} />
                  <div style={{ fontSize: 12, color: c.textMuted, fontFamily: 'monospace', textAlign: 'center' }}>{body.maxWidth}px</div>
                </div>
              </div>
            )}

            {/* Footer Settings */}
            {activeSection === 'footer' && (
              <div style={card}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>نص الفوتر</label>
                  <textarea value={footer.text} onChange={(e) => updateFooter({ text: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 13, color: c.text, fontFamily: F }}>رابط إلغاء الاشتراك</span>
                  <Toggle value={footer.showUnsubscribe} onChange={(v) => updateFooter({ showUnsubscribe: v })} />
                </div>
                {footer.showUnsubscribe && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>نص إلغاء الاشتراك</label>
                    <input type="text" value={footer.unsubscribeText} onChange={(e) => updateFooter({ unsubscribeText: e.target.value })} style={inputStyle} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 13, color: c.text, fontFamily: F }}>إظهار العنوان البريدي</span>
                  <Toggle value={footer.showAddress} onChange={(v) => updateFooter({ showAddress: v })} />
                </div>
                {footer.showAddress && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>العنوان</label>
                    <input type="text" value={footer.address} onChange={(e) => updateFooter({ address: e.target.value })} style={inputStyle} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 13, color: c.text, fontFamily: F }}>روابط التواصل الاجتماعي</span>
                  <Toggle value={footer.showSocial} onChange={(v) => updateFooter({ showSocial: v })} />
                </div>
                {footer.showSocial && (
                  <div style={{ marginBottom: 16 }}>
                    {footer.socialLinks.map((link, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                        <input type="text" placeholder="المنصة" value={link.platform} onChange={(e) => updateSocialLink(i, 'platform', e.target.value)} style={{ ...inputStyle, flex: '0 0 80px' }} />
                        <input type="text" placeholder="الرابط" value={link.url} onChange={(e) => updateSocialLink(i, 'url', e.target.value)} style={{ ...inputStyle, flex: 1, direction: 'ltr', fontSize: 12, fontFamily: 'monospace' }} />
                        <button onClick={() => removeSocialLink(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#DC2626', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>
                          &times;
                        </button>
                      </div>
                    ))}
                    <button onClick={addSocialLink} style={{
                      padding: '6px 14px', background: 'transparent', color: c.text,
                      border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F, cursor: 'pointer',
                    }}>
                      + إضافة رابط
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>لون الخلفية</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={footer.bgColor} onChange={(e) => updateFooter({ bgColor: e.target.value })} style={colorInputStyle} />
                      <input type="text" value={footer.bgColor} onChange={(e) => updateFooter({ bgColor: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', direction: 'ltr', fontSize: 12 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>لون النص</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={footer.textColor} onChange={(e) => updateFooter({ textColor: e.target.value })} style={colorInputStyle} />
                      <input type="text" value={footer.textColor} onChange={(e) => updateFooter({ textColor: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', direction: 'ltr', fontSize: 12 }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.textMuted, fontFamily: F, marginBottom: 10 }}>
              معاينة مباشرة
            </div>
            <CustomPreview header={header} footer={footer} body={body} />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .email-tpl-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default EmailTemplatePage;
