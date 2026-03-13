import React, { useState } from 'react';
import { MOCK_NEWSLETTER, MOCK_AUTHOR } from '../mockData';
import { colors } from './HubLayout';

// ─── Types ──────────────────────────────────────────────
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

// ─── Shared Styles ──────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: colors.text,
  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
  color: colors.text,
  background: '#FAFAFA',
  direction: 'rtl',
  outline: 'none',
  boxSizing: 'border-box',
};

const colorInputStyle: React.CSSProperties = {
  width: 40,
  height: 34,
  border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
  borderRadius: 6,
  cursor: 'pointer',
  padding: 2,
  background: '#fff',
};

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
  padding: 20,
  marginBottom: 16,
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

// ─── Email Preview ──────────────────────────────────────
const EmailPreview: React.FC<{ header: HeaderConfig; footer: FooterConfig; body: BodyConfig }> = ({ header, footer, body }) => (
  <div style={{
    background: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
    display: 'flex',
    justifyContent: 'center',
  }}>
    <div style={{
      width: '100%',
      maxWidth: body.maxWidth,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      fontFamily: `'${body.fontFamily}', sans-serif`,
    }}>
      {/* ── Header ── */}
      <div style={{
        background: header.bgColor,
        padding: `${header.padding}px 32px`,
        textAlign: header.alignment,
        borderBottom: `1px solid ${footer.dividerColor}`,
      }}>
        {header.showLogo && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #333 0%, #111 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            marginBottom: header.showTitle ? 12 : 0,
          }}>
            {header.title.charAt(0)}
          </div>
        )}
        {header.showTitle && (
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: header.textColor,
            fontFamily: `'${body.fontFamily}', sans-serif`,
          }}>
            {header.title}
          </div>
        )}
      </div>

      {/* ── Body (sample content) ── */}
      <div style={{
        background: body.bgColor,
        padding: '32px 32px',
        color: body.textColor,
        lineHeight: 1.8,
        fontSize: 15,
      }}>
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
          margin: '24px 0',
          padding: '20px 24px',
          background: '#F9FAFB',
          borderRadius: 8,
          borderRight: `4px solid ${body.linkColor}`,
        }}>
          <p style={{ margin: 0, fontSize: 14, color: body.textColor, opacity: 0.75, fontStyle: 'italic' }}>
            &ldquo;اقتباس مميز من المقال يمكن أن يظهر بهذا الشكل داخل رسالتك البريدية.&rdquo;
          </p>
        </div>
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <span style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: body.linkColor,
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            اقرأ المقال كاملا
          </span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: footer.bgColor,
        padding: '24px 32px',
        borderTop: `1px solid ${footer.dividerColor}`,
        textAlign: 'center',
      }}>
        {footer.showSocial && footer.socialLinks.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            {footer.socialLinks.map((link, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#E5E7EB',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                {link.platform.charAt(0)}
              </span>
            ))}
          </div>
        )}
        <div style={{
          fontSize: 13,
          color: footer.textColor,
          fontFamily: `'${body.fontFamily}', sans-serif`,
          lineHeight: 1.7,
          marginBottom: footer.showUnsubscribe || footer.showAddress ? 12 : 0,
        }}>
          {footer.text}
        </div>
        {footer.showAddress && (
          <div style={{
            fontSize: 12,
            color: footer.textColor,
            fontFamily: `'${body.fontFamily}', sans-serif`,
            opacity: 0.7,
            marginBottom: footer.showUnsubscribe ? 12 : 0,
          }}>
            {footer.address}
          </div>
        )}
        {footer.showUnsubscribe && (
          <div style={{ fontSize: 12, marginTop: 4 }}>
            <span style={{
              color: footer.textColor,
              textDecoration: 'underline',
              cursor: 'pointer',
              opacity: 0.6,
            }}>
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

  const addSocialLink = () => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const sectionTabs = [
    { id: 'header' as const, label: 'الهيدر' },
    { id: 'body' as const, label: 'المحتوى' },
    { id: 'footer' as const, label: 'الفوتر' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
          خصّص شكل رسائلك البريدية — الهيدر والفوتر والألوان
        </p>
        <button
          style={{
            padding: '10px 24px',
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
          حفظ القالب
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        {/* ── Editor Panel ── */}
        <div>
          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 3, marginBottom: 16 }}>
            {sectionTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveSection(t.id)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: activeSection === t.id ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: activeSection === t.id ? 600 : 400,
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  color: activeSection === t.id ? colors.text : colors.textMuted,
                  cursor: 'pointer',
                  boxShadow: activeSection === t.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Header Settings ── */}
          {activeSection === 'header' && (
            <div style={sectionStyle}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>عنوان الهيدر</label>
                <input type="text" value={header.title} onChange={(e) => updateHeader({ title: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إظهار الشعار</span>
                <Toggle value={header.showLogo} onChange={(v) => updateHeader({ showLogo: v })} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إظهار العنوان</span>
                <Toggle value={header.showTitle} onChange={(v) => updateHeader({ showTitle: v })} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>محاذاة</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['right', 'center', 'left'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => updateHeader({ alignment: a })}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: header.alignment === a ? '#111' : '#F3F4F6',
                        color: header.alignment === a ? '#fff' : colors.text,
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                        cursor: 'pointer',
                      }}
                    >
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
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={header.padding}
                  onChange={(e) => updateHeader({ padding: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace', textAlign: 'center' }}>{header.padding}px</div>
              </div>
            </div>
          )}

          {/* ── Body Settings ── */}
          {activeSection === 'body' && (
            <div style={sectionStyle}>
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
                <label style={labelStyle}>لون الروابط</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={body.linkColor} onChange={(e) => updateBody({ linkColor: e.target.value })} style={colorInputStyle} />
                  <input type="text" value={body.linkColor} onChange={(e) => updateBody({ linkColor: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', direction: 'ltr', fontSize: 12 }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>الخط</label>
                <select
                  value={body.fontFamily}
                  onChange={(e) => updateBody({ fontFamily: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {['IBM Plex Sans Arabic', 'Cairo', 'Tajawal', 'Almarai', 'Amiri', 'Changa', 'El Messiri', 'Readex Pro'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>عرض الرسالة الأقصى</label>
                <input
                  type="range"
                  min={480}
                  max={720}
                  step={20}
                  value={body.maxWidth}
                  onChange={(e) => updateBody({ maxWidth: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace', textAlign: 'center' }}>{body.maxWidth}px</div>
              </div>
            </div>
          )}

          {/* ── Footer Settings ── */}
          {activeSection === 'footer' && (
            <div style={sectionStyle}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>نص الفوتر</label>
                <textarea
                  value={footer.text}
                  onChange={(e) => updateFooter({ text: e.target.value })}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>رابط إلغاء الاشتراك</span>
                <Toggle value={footer.showUnsubscribe} onChange={(v) => updateFooter({ showUnsubscribe: v })} />
              </div>

              {footer.showUnsubscribe && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>نص إلغاء الاشتراك</label>
                  <input type="text" value={footer.unsubscribeText} onChange={(e) => updateFooter({ unsubscribeText: e.target.value })} style={inputStyle} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>إظهار العنوان البريدي</span>
                <Toggle value={footer.showAddress} onChange={(v) => updateFooter({ showAddress: v })} />
              </div>

              {footer.showAddress && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>العنوان</label>
                  <input type="text" value={footer.address} onChange={(e) => updateFooter({ address: e.target.value })} style={inputStyle} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>روابط التواصل الاجتماعي</span>
                <Toggle value={footer.showSocial} onChange={(v) => updateFooter({ showSocial: v })} />
              </div>

              {footer.showSocial && (
                <div style={{ marginBottom: 16 }}>
                  {footer.socialLinks.map((link, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="المنصة"
                        value={link.platform}
                        onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}
                        style={{ ...inputStyle, flex: '0 0 80px' }}
                      />
                      <input
                        type="text"
                        placeholder="الرابط"
                        value={link.url}
                        onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                        style={{ ...inputStyle, flex: 1, direction: 'ltr', fontSize: 12, fontFamily: 'monospace' }}
                      />
                      <button
                        onClick={() => removeSocialLink(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 18,
                          color: '#DC2626',
                          padding: '0 4px',
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addSocialLink}
                    style={{
                      padding: '6px 14px',
                      background: '#F3F4F6',
                      color: colors.text,
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
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

        {/* ── Live Preview ── */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 10 }}>
            معاينة مباشرة
          </div>
          <EmailPreview header={header} footer={footer} body={body} />
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .email-tpl-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default EmailTemplatePage;
