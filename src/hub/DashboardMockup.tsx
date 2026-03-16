import React from 'react';

const font = 'IBM Plex Sans Arabic, sans-serif';
const colors = { text: '#111827', muted: '#6B7280', border: 'rgba(0,0,0,0.06)', card: '#fff' };

// ─── Mock data ───────────────────────────────────────────
const posts = [
  { title: 'كيف وصل تطبيق "كتابة" إلى قائمة أكثر', date: '٧ مارس ٢٠٢٦', views: 573, reads: 149, img: '📱' },
  { title: 'الكتابة هي بداية كل ما نصنعه في العالم', date: '٢١ فبراير ٢٠٢٦', views: 1776, reads: 158, img: '🖼' },
  { title: 'اكتب قصتك بشجاعة .. اكتب عن لحظ', date: '١٤ فبراير ٢٠٢٦', views: 5028, reads: 127, img: '🐱' },
  { title: 'كيف تصل إلى موضوعك المميّز في الكتاب', date: '٧ فبراير ٢٠٢٦', views: 4361, reads: 143, img: '⛵' },
  { title: 'هل كتاباتك جاهزة لاختبار النظرة الخاطف', date: '٣١ يناير ٢٠٢٦', views: 5209, reads: 118, img: '👁' },
  { title: 'ملاحظات حول عام كامل من الكتابة', date: '٢٠ ديسمبر ٢٠٢٥', views: 6787, reads: 216, img: '📅' },
];

const stats = [
  { label: 'عدد المشتركين', value: '3.9K' },
  { label: 'عدد مَن ألغوا اشتراكهم', value: '159.00' },
  { label: 'معدل القراءة', value: '52.25%' },
  { label: 'نسبة النقر إلى الظهور', value: '100.00%' },
];

// ─── Card wrapper ────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: colors.card,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
    padding: 20,
    ...style,
  }}>
    {children}
  </div>
);

// ─── Dashboard icon SVG ──────────────────────────────────
const DashboardIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

// ─── Main Component ──────────────────────────────────────
const DashboardMockup: React.FC = () => {
  return (
    <div style={{ direction: 'rtl', fontFamily: font, background: '#F9FAFB', minHeight: '100vh' }}>
      {/* ─── Top Nav ─── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', background: '#fff',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: font }}>كتابة :</div>
          <div style={{ position: 'relative' }}>
            <input
              placeholder="البحث"
              style={{
                padding: '8px 36px 8px 16px', borderRadius: 8,
                border: `1px solid ${colors.border}`, fontSize: 14,
                fontFamily: font, width: 200, background: '#F9FAFB',
                outline: 'none',
              }}
            />
            <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: colors.muted }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            ع
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', background: '#2563EB', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
            fontFamily: font, cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            الباقات
          </button>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: colors.muted, cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#EF4444', color: '#fff', fontSize: 10,
              fontWeight: 700, borderRadius: '50%', width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>46</span>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #F87171, #FB923C)',
            cursor: 'pointer',
          }} />
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 20 }}>

        {/* ─── Column 1: Latest Posts ─── */}
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: font, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            آخر المنشورات
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {posts.map((post, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 8, background: '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>
                  {post.img}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: font, lineHeight: 1.5, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: colors.muted, fontFamily: font }}>
                    <span>{post.date}</span>
                    <span>{post.views.toLocaleString()} مرات الظهور</span>
                    <span>{post.reads} القراءات</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Column 2: Newsletter Stats + Links ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Newsletter stats */}
          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: font, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              أرقام النشرة
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: colors.muted, fontFamily: font }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB' }} />
                    {s.label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, fontFamily: font }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Newsletter link */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: font, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              رابط نشرتك البريدية
            </div>
            <div style={{
              background: '#F9FAFB', borderRadius: 10, padding: '12px 16px',
              border: `1px solid ${colors.border}`, marginBottom: 12, textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: font }}>نشرة رسالة السبت</div>
              <div style={{ fontSize: 12, color: colors.muted, fontFamily: font }}>مصطفى فتحي بنو العالم</div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#F9FAFB', borderRadius: 8, padding: '8px 12px',
              border: `1px solid ${colors.border}`, marginBottom: 16,
            }}>
              <button style={{ padding: '4px 10px', background: '#F3F4F6', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 12, fontFamily: font, cursor: 'pointer', color: colors.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                نسخ
              </button>
              <span style={{ fontSize: 12, color: colors.muted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                https://kitabh.com/n/saturdaynew...
              </span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: font, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              رابط حسابك على كتابة
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#F9FAFB', borderRadius: 8, padding: '8px 12px',
              border: `1px solid ${colors.border}`,
            }}>
              <button style={{ padding: '4px 10px', background: '#F3F4F6', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 12, fontFamily: font, cursor: 'pointer', color: colors.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                نسخ
              </button>
              <span style={{ fontSize: 12, color: colors.muted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                https://kitabh.com/@mohammed
              </span>
            </div>
          </Card>
        </div>

        {/* ─── Column 3: Welcome + Metrics + Performance ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Welcome */}
          <Card style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: font, margin: '0 0 16px' }}>
              أهلًا، محمد ✍️
            </h2>

            {/* Metric grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {[
                { label: 'مرات الظهور', value: '155959', icon: '👁', bg: '#F3F4F6' },
                { label: 'أيام الكتابة', value: '0', icon: '🔥', note: 'دون انقطاع', bg: '#FEF2F2' },
                { label: 'النصوص', value: '38', icon: '📝', bg: '#F3F4F6' },
                { label: 'الكلمات', value: '29599', icon: '✍️', bg: '#FFFBEB' },
              ].map((m, i) => (
                <div key={i} style={{
                  background: m.bg, borderRadius: 10, padding: '12px 8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: colors.muted, fontFamily: font, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    {m.icon} {m.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, fontFamily: font }}>{m.value}</div>
                  {m.note && <div style={{ fontSize: 10, color: colors.muted, fontFamily: font }}>{m.note}</div>}
                </div>
              ))}
            </div>
          </Card>

          {/* Performance */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.text, fontFamily: font, margin: '0 0 12px', textAlign: 'right' }}>
              الأداء
            </h3>
            <div style={{
              background: '#EEF2FF', borderRadius: 10, padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: font }}>
                  أسابيع من الالتزام بالكتابة! 🔥
                </div>
                <div style={{ fontSize: 12, color: colors.muted, fontFamily: font }}>ابدأ بالكتابة</div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid #4F46E5', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, color: '#4F46E5', fontFamily: font,
              }}>
                0
              </div>
            </div>

            {/* Share button */}
            <button style={{
              width: '100%', padding: '14px 20px',
              background: '#4F46E5', color: '#fff',
              border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              fontFamily: font, cursor: 'pointer',
              marginBottom: 10,
            }}>
              شارك صفحة أعمالك
            </button>

            {/* مقر كتابة button — replaces حصاد العام */}
            <button
              onClick={() => { window.location.href = '/hub_v2'; }}
              style={{
                width: '100%', padding: '14px 20px',
                background: '#111827', color: '#fff',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 600,
                fontFamily: font, cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1F2937')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#111827')}
            >
              <DashboardIcon size={18} color="#fff" />
              مقر كتابة
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;
