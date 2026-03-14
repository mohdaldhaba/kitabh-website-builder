import React, { useState } from 'react';
import { useTheme } from './HubLayout';

const F = 'IBM Plex Sans Arabic, sans-serif';

// ─── Types ──────────────────────────────────────────────
interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  enabled: boolean;
}

interface LinktreeConfig {
  title: string;
  bio: string;
  avatarUrl: string;
  bgColor: string;
  cardColor: string;
  textColor: string;
  buttonRadius: number;
  buttonStyle: 'filled' | 'outline' | 'shadow';
  socialLinks: { platform: string; url: string }[];
}

// ─── Icon Map (simple SVG icons for link types) ────────
const linkIcons: Record<string, React.ReactNode> = {
  link: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  drag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="6" r="1.5" fill="currentColor" /><circle cx="15" cy="6" r="1.5" fill="currentColor" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" /><circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9" cy="18" r="1.5" fill="currentColor" /><circle cx="15" cy="18" r="1.5" fill="currentColor" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ─── Social platform icons ──────────────────────────────
const socialPlatforms = [
  { id: 'twitter', label: 'X / تويتر', icon: '𝕏' },
  { id: 'instagram', label: 'انستغرام', icon: '📷' },
  { id: 'linkedin', label: 'لينكد إن', icon: '🔗' },
  { id: 'youtube', label: 'يوتيوب', icon: '▶' },
  { id: 'tiktok', label: 'تيك توك', icon: '♪' },
  { id: 'whatsapp', label: 'واتساب', icon: '💬' },
];

// ─── Default data ───────────────────────────────────────
const defaultLinks: LinkItem[] = [
  { id: '1', title: 'اشترك في نشرتي البريدية', url: 'https://kitabh.com/n/saturdayletter', icon: 'link', enabled: true },
  { id: '2', title: 'آخر مقالاتي', url: 'https://kitabh.com/@mohammed/articles', icon: 'link', enabled: true },
  { id: '3', title: 'دورة الكتابة الاحترافية', url: 'https://kitabh.com/courses/pro-writing', icon: 'link', enabled: true },
];

const defaultConfig: LinktreeConfig = {
  title: 'محمد الضبع',
  bio: 'مؤسس منصة كتابة — أكتب عن ريادة الأعمال والكتابة',
  avatarUrl: '',
  bgColor: '#F8F9FA',
  cardColor: '#FFFFFF',
  textColor: '#111111',
  buttonRadius: 12,
  buttonStyle: 'filled',
  socialLinks: [
    { platform: 'twitter', url: 'https://x.com/mohdaldhaba' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/mohdaldhaba' },
  ],
};

// ─── Link Editor Row ────────────────────────────────────
const LinkRow: React.FC<{
  link: LinkItem;
  onUpdate: (id: string, updates: Partial<LinkItem>) => void;
  onDelete: (id: string) => void;
  colors: any;
}> = ({ link, onUpdate, onDelete, colors }) => {
  const [editing, setEditing] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        marginBottom: 8,
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* Drag handle */}
      <span style={{ cursor: 'grab', color: colors.textMuted, display: 'flex', flexShrink: 0 }}>
        {linkIcons.drag}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              value={link.title}
              onChange={(e) => onUpdate(link.id, { title: e.target.value })}
              placeholder="عنوان الرابط"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                fontSize: 14,
                fontFamily: F,
                color: colors.text,
                background: 'transparent',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => onUpdate(link.id, { url: e.target.value })}
              placeholder="https://..."
              dir="ltr"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'monospace',
                color: colors.textMuted,
                background: 'transparent',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ) : (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: F, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {link.title}
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace', direction: 'ltr', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {link.url}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Toggle */}
        <button
          onClick={() => onUpdate(link.id, { enabled: !link.enabled })}
          style={{
            width: 38,
            height: 22,
            borderRadius: 11,
            border: 'none',
            background: link.enabled ? '#059669' : (colors.border),
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              transition: 'left 0.2s, right 0.2s',
              ...(link.enabled ? { left: 2 } : { left: 18 }),
            }}
          />
        </button>

        {/* Edit */}
        <button
          onClick={() => setEditing(!editing)}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: editing ? '#0000FF' : colors.textMuted,
            borderRadius: 6,
          }}
        >
          {linkIcons.edit}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(link.id)}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textMuted,
            borderRadius: 6,
          }}
        >
          {linkIcons.trash}
        </button>
      </div>
    </div>
  );
};

// ─── Phone Preview ──────────────────────────────────────
const PhonePreview: React.FC<{
  links: LinkItem[];
  config: LinktreeConfig;
}> = ({ links, config }) => {
  const activeLinks = links.filter((l) => l.enabled);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          maxWidth: 320,
          width: '100%',
          height: 580,
          borderRadius: 36,
          border: '8px solid #1a1a1a',
          overflow: 'hidden',
          background: config.bgColor,
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 28,
            background: '#1a1a1a',
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
            zIndex: 2,
          }}
        />

        {/* Content */}
        <div style={{ padding: '48px 20px 20px', overflowY: 'auto', height: '100%' }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: config.avatarUrl ? `url(${config.avatarUrl}) center/cover` : 'linear-gradient(135deg, #333 0%, #111 100%)',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {!config.avatarUrl && config.title.charAt(0)}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: config.textColor, fontFamily: F }}>
              {config.title}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', fontFamily: F, marginTop: 4, lineHeight: 1.5 }}>
              {config.bio}
            </div>
          </div>

          {/* Social icons */}
          {config.socialLinks.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {config.socialLinks.map((s, i) => {
                const platform = socialPlatforms.find((p) => p.id === s.platform);
                return (
                  <div
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: config.cardColor,
                      border: `1px solid rgba(0,0,0,0.08)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {platform?.icon || '🔗'}
                  </div>
                );
              })}
            </div>
          )}

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeLinks.map((link) => (
              <div
                key={link.id}
                style={{
                  padding: '14px 16px',
                  background: config.buttonStyle === 'filled' ? config.cardColor : 'transparent',
                  border: config.buttonStyle === 'outline' ? `2px solid ${config.textColor}` : `1px solid rgba(0,0,0,0.06)`,
                  borderRadius: config.buttonRadius,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                  boxShadow: config.buttonStyle === 'shadow' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: config.textColor, fontFamily: F }}>
                  {link.title}
                </div>
              </div>
            ))}
          </div>

          {/* Kitabh branding */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: F }}>
              صُمّم على منصة كتابة
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Linktree Page ─────────────────────────────────
const LinktreePage: React.FC = () => {
  const { colors: c } = useTheme();
  const [links, setLinks] = useState<LinkItem[]>(defaultLinks);
  const [config, setConfig] = useState<LinktreeConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'appearance'>('links');

  const linktreeUrl = 'https://kitabh.com/@mohammed';

  const handleUpdateLink = (id: string, updates: Partial<LinkItem>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAddLink = () => {
    const newLink: LinkItem = {
      id: `link_${Date.now()}`,
      title: '',
      url: '',
      icon: 'link',
      enabled: true,
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(linktreeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const card = {
    background: c.cardBg,
    borderRadius: 14,
    border: `1px solid ${c.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
  };

  const themes = [
    { id: 'light', label: 'فاتح', bg: '#F8F9FA', card: '#FFFFFF', text: '#111111' },
    { id: 'dark', label: 'داكن', bg: '#111111', card: '#1A1A1A', text: '#F9FAFB' },
    { id: 'blue', label: 'أزرق', bg: '#EFF6FF', card: '#FFFFFF', text: '#1E3A8A' },
    { id: 'green', label: 'أخضر', bg: '#ECFDF5', card: '#FFFFFF', text: '#064E3B' },
    { id: 'warm', label: 'دافئ', bg: '#FEF3C7', card: '#FFFFFF', text: '#78350F' },
    { id: 'rose', label: 'وردي', bg: '#FFF1F2', card: '#FFFFFF', text: '#881337' },
  ];

  const buttonStyles: { id: LinktreeConfig['buttonStyle']; label: string }[] = [
    { id: 'filled', label: 'ممتلئ' },
    { id: 'outline', label: 'محدد' },
    { id: 'shadow', label: 'ظل' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: c.text, fontFamily: F, margin: '0 0 4px' }}>
            صفحة الروابط
          </h2>
          <p style={{ fontSize: 14, color: c.textMuted, fontFamily: F, margin: 0 }}>
            أنشئ صفحة روابط احترافية لمشاركتها في البايو وفي كل مكان
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {linkIcons.copy}
            {copied ? 'تم النسخ' : 'نسخ الرابط'}
          </button>
          <button
            onClick={() => window.open(linktreeUrl, '_blank')}
            style={{
              padding: '10px 20px',
              background: c.text,
              color: c.cardBg,
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {linkIcons.eye}
            معاينة
          </button>
        </div>
      </div>

      {/* URL bar */}
      <div style={{ ...card, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: c.textMuted, fontFamily: F, flexShrink: 0 }}>رابط صفحتك:</span>
        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: '#0000FF', direction: 'ltr', flex: 1 }}>
          {linktreeUrl}
        </span>
        <button
          onClick={handleCopy}
          style={{
            padding: '6px 12px',
            background: copied ? '#059669' : 'transparent',
            color: copied ? '#fff' : c.textMuted,
            border: `1px solid ${copied ? '#059669' : c.border}`,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? 'تم' : 'نسخ'}
        </button>
      </div>

      {/* Two columns: Editor + Preview */}
      <div className="linktree-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Left: Editor */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: c.cardBg, borderRadius: 10, padding: 4, border: `1px solid ${c.border}` }}>
            {([
              { id: 'links' as const, label: 'الروابط' },
              { id: 'appearance' as const, label: 'المظهر' },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: activeTab === tab.id ? (c.text) : 'transparent',
                  color: activeTab === tab.id ? c.cardBg : c.text,
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: F,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'links' && (
            <>
              {/* Links list */}
              {links.map((link) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  onUpdate={handleUpdateLink}
                  onDelete={handleDeleteLink}
                  colors={c}
                />
              ))}

              {/* Add link button */}
              <button
                onClick={handleAddLink}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  border: `2px dashed ${c.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: F,
                  cursor: 'pointer',
                  color: c.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 4,
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = c.text;
                  e.currentTarget.style.color = c.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.color = c.textMuted;
                }}
              >
                {linkIcons.plus}
                إضافة رابط جديد
              </button>

              {/* Social Links */}
              <div style={{ ...card, padding: 20, marginTop: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, fontFamily: F, margin: '0 0 12px' }}>
                  روابط التواصل الاجتماعي
                </h3>
                <p style={{ fontSize: 13, color: c.textMuted, fontFamily: F, margin: '0 0 16px' }}>
                  تظهر كأيقونات في أعلى صفحتك
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {socialPlatforms.map((platform) => {
                    const isAdded = config.socialLinks.some((s) => s.platform === platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => {
                          if (isAdded) {
                            setConfig((prev) => ({
                              ...prev,
                              socialLinks: prev.socialLinks.filter((s) => s.platform !== platform.id),
                            }));
                          } else {
                            setConfig((prev) => ({
                              ...prev,
                              socialLinks: [...prev.socialLinks, { platform: platform.id, url: '' }],
                            }));
                          }
                        }}
                        style={{
                          padding: '8px 14px',
                          background: isAdded ? c.text : 'transparent',
                          color: isAdded ? c.cardBg : c.text,
                          border: `1px solid ${isAdded ? c.text : c.border}`,
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 500,
                          fontFamily: F,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s',
                        }}
                      >
                        <span>{platform.icon}</span>
                        {platform.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              {/* Theme presets */}
              <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, fontFamily: F, margin: '0 0 12px' }}>
                  القالب
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          bgColor: theme.bg,
                          cardColor: theme.card,
                          textColor: theme.text,
                        }))
                      }
                      style={{
                        padding: '12px 10px',
                        background: theme.bg,
                        border: config.bgColor === theme.bg ? '2px solid #0000FF' : `2px solid transparent`,
                        borderRadius: 10,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: 28,
                          background: theme.card,
                          borderRadius: 6,
                          marginBottom: 6,
                          border: '1px solid rgba(0,0,0,0.06)',
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: theme.text, fontFamily: F }}>
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button style */}
              <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, fontFamily: F, margin: '0 0 12px' }}>
                  شكل الأزرار
                </h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  {buttonStyles.map((bs) => (
                    <button
                      key={bs.id}
                      onClick={() => setConfig((prev) => ({ ...prev, buttonStyle: bs.id }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: config.buttonStyle === bs.id ? c.text : 'transparent',
                        color: config.buttonStyle === bs.id ? c.cardBg : c.text,
                        border: `1px solid ${config.buttonStyle === bs.id ? c.text : c.border}`,
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: F,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {bs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button radius */}
              <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, fontFamily: F, margin: '0 0 12px' }}>
                  استدارة الأزرار
                </h3>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={config.buttonRadius}
                  onChange={(e) => setConfig((prev) => ({ ...prev, buttonRadius: Number(e.target.value) }))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: c.textMuted, fontFamily: F, marginTop: 4 }}>
                  <span>مربع</span>
                  <span>دائري</span>
                </div>
              </div>

              {/* Profile info */}
              <div style={{ ...card, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, fontFamily: F, margin: '0 0 12px' }}>
                  معلومات الصفحة
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c.text, fontFamily: F, marginBottom: 6 }}>
                      الاسم
                    </label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: `1px solid ${c.border}`,
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: F,
                        color: c.text,
                        background: 'transparent',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c.text, fontFamily: F, marginBottom: 6 }}>
                      النبذة
                    </label>
                    <textarea
                      value={config.bio}
                      onChange={(e) => setConfig((prev) => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: `1px solid ${c.border}`,
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: F,
                        color: c.text,
                        background: 'transparent',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Phone Preview */}
        <div className="linktree-preview-sidebar" style={{ position: 'sticky', top: 80 }}>
          <PhonePreview links={links} config={config} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .linktree-layout { grid-template-columns: 1fr !important; }
          .linktree-preview-sidebar { position: static !important; }
        }
      `}</style>
    </div>
  );
};

export default LinktreePage;
