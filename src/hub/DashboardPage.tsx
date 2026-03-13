import React, { useState } from 'react';
import { MOCK_ARTICLES, MOCK_NEWSLETTER, MOCK_STATS, MOCK_AUTHOR } from '../mockData';
import { colors } from './HubLayout';

const F = 'IBM Plex Sans Arabic, sans-serif';
const card = { background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)' } as const;

// ─── Mock subscriber growth data by timeframe ───────────
const growthData: Record<string, { date: string; subs: number; unsubs: number }[]> = {
  '4w': [
    { date: '17 فبراير', subs: 1740, unsubs: 2 },
    { date: '24 فبراير', subs: 1785, unsubs: 5 },
    { date: '3 مارس', subs: 1830, unsubs: 3 },
    { date: '10 مارس', subs: 1880, unsubs: 4 },
    { date: '13 مارس', subs: 1920, unsubs: 1 },
  ],
  '3m': [
    { date: 'ديسمبر', subs: 1520, unsubs: 8 },
    { date: 'يناير', subs: 1650, unsubs: 12 },
    { date: 'فبراير', subs: 1810, unsubs: 9 },
    { date: 'مارس', subs: 1920, unsubs: 5 },
  ],
  '12m': [
    { date: 'أبريل', subs: 420, unsubs: 5 },
    { date: 'يونيو', subs: 680, unsubs: 8 },
    { date: 'أغسطس', subs: 950, unsubs: 12 },
    { date: 'أكتوبر', subs: 1280, unsubs: 10 },
    { date: 'ديسمبر', subs: 1520, unsubs: 8 },
    { date: 'فبراير', subs: 1810, unsubs: 9 },
    { date: 'مارس', subs: 1920, unsubs: 5 },
  ],
  'all': [
    { date: 'يناير ٢٥', subs: 120, unsubs: 0 },
    { date: 'مارس', subs: 320, unsubs: 3 },
    { date: 'مايو', subs: 580, unsubs: 6 },
    { date: 'يوليو', subs: 780, unsubs: 8 },
    { date: 'سبتمبر', subs: 1050, unsubs: 10 },
    { date: 'نوفمبر', subs: 1380, unsubs: 11 },
    { date: 'يناير ٢٦', subs: 1650, unsubs: 12 },
    { date: 'مارس', subs: 1920, unsubs: 5 },
  ],
};

const timeframes = [
  { id: '4w', label: 'آخر 4 أسابيع' },
  { id: '3m', label: 'آخر 3 أشهر' },
  { id: '12m', label: 'آخر 12 شهر' },
  { id: 'all', label: 'الكل' },
];

// ─── SVG Line Chart ─────────────────────────────────────
const SubscriberChart: React.FC<{ data: { date: string; subs: number; unsubs: number }[] }> = ({ data }) => {
  const W = 520, H = 200, PX = 10, PY = 20;
  const maxVal = Math.max(...data.map(d => d.subs)) * 1.1;
  const minVal = Math.min(...data.map(d => d.subs)) * 0.9;
  const range = maxVal - minVal || 1;

  // RTL: oldest on the RIGHT, newest on the LEFT
  const points = data.map((d, i) => ({
    x: (W - PX) - (i / (data.length - 1)) * (W - PX * 2),
    y: PY + (1 - (d.subs - minVal) / range) * (H - PY * 2),
  }));

  // Sort points left-to-right for valid SVG path
  const sorted = [...points].sort((a, b) => a.x - b.x);

  const linePath = sorted.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = sorted[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }).join(' ');

  const areaPath = `${linePath} L${sorted[sorted.length - 1].x},${H} L${sorted[0].x},${H} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#111" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(frac => {
        const y = PY + frac * (H - PY * 2);
        return <line key={frac} x1={PX} y1={y} x2={W - PX} y2={y} stroke="#F3F4F6" strokeWidth="1" />;
      })}
      <path d={areaPath} fill="url(#subGrad)" />
      <path d={linePath} fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#111" strokeWidth="2" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={points[i].x} y={H + 22} textAnchor="middle" fontSize="11" fontFamily={F} fill="#9CA3AF">
          {d.date}
        </text>
      ))}
    </svg>
  );
};

// ─── Dashboard Page ─────────────────────────────────────
const DashboardPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState('4w');
  const [tfOpen, setTfOpen] = useState(false);
  const data = growthData[timeframe] || growthData['4w'];
  const currentSubs = data[data.length - 1].subs;
  const prevSubs = data[0].subs;
  const netGrowth = currentSubs - prevSubs;

  // Last published article
  const lastPost = [...MOCK_ARTICLES]
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0];

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'اليوم';
    if (days < 7) return `${days} أيام`;
    if (days < 30) return `${Math.floor(days / 7)} أسابيع`;
    if (days < 365) return `${Math.floor(days / 30)} أشهر`;
    return `${Math.floor(days / 365)} سنة`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Welcome Card */}
      <div style={{ ...card, padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: F, margin: 0 }}>
              أهلا، {MOCK_AUTHOR.name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: F, marginTop: 4 }}>
              إليك ملخص أداء نشرتك
            </p>
          </div>
          {/* Timeframe selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setTfOpen(!tfOpen)}
              style={{
                padding: '8px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
                fontSize: 13, fontWeight: 600, fontFamily: F, cursor: 'pointer', color: colors.text,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {timeframes.find(t => t.id === timeframe)?.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {tfOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff',
                border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                zIndex: 50, overflow: 'hidden', minWidth: 160,
              }}>
                {timeframes.map(tf => (
                  <button
                    key={tf.id}
                    onClick={() => { setTimeframe(tf.id); setTfOpen(false); }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 16px', border: 'none',
                      background: timeframe === tf.id ? '#F3F4F6' : '#fff', fontSize: 13, fontWeight: 500,
                      fontFamily: F, cursor: 'pointer', textAlign: 'right', color: colors.text,
                    }}
                    onMouseEnter={e => { if (timeframe !== tf.id) e.currentTarget.style.background = '#FAFAFA'; }}
                    onMouseLeave={e => { if (timeframe !== tf.id) e.currentTarget.style.background = '#fff'; }}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'المشتركون الفعّالون', value: MOCK_STATS.totalSubscribers.toLocaleString('en') },
            { label: 'معدل القراءة', value: `${MOCK_STATS.avgOpenRate}%` },
            { label: 'معدل النقر', value: `${MOCK_STATS.avgClickRate}%` },
            { label: 'الإيرادات', value: '$0.00' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: F, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontFamily: F }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Subscriber Growth + Last Post Performance */}
      <div className="hub-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Subscriber Growth Chart */}
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: colors.text, fontFamily: F, margin: 0 }}>نمو المشتركين</h2>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: colors.text, fontFamily: F, marginBottom: 4 }}>
            {netGrowth >= 0 ? '+' : ''}{netGrowth.toLocaleString('en')}
          </div>
          <div style={{ fontSize: 12, color: netGrowth >= 0 ? '#059669' : '#DC2626', fontFamily: F, marginBottom: 16 }}>
            {netGrowth >= 0 ? '↑' : '↓'} من {prevSubs.toLocaleString('en')} إلى {currentSubs.toLocaleString('en')}
          </div>

          <SubscriberChart data={data} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 12, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textMuted, fontFamily: F }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#111' }} />
              مشترك
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textMuted, fontFamily: F }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D1D5DB' }} />
              إلغاء اشتراك
            </span>
          </div>
        </div>

        {/* Last Post Performance */}
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: colors.text, fontFamily: F, margin: 0 }}>أداء آخر منشور</h2>
              {lastPost && (
                <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: F, marginTop: 4, fontStyle: 'italic' }}>
                  {lastPost.title.length > 40 ? lastPost.title.slice(0, 40) + '...' : lastPost.title}
                </div>
              )}
            </div>
            <button style={{
              padding: '6px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
              fontSize: 12, fontWeight: 600, fontFamily: F, cursor: 'pointer', color: colors.text,
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              عرض المنشور
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {lastPost ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                {
                  label: 'مدة منذ النشر',
                  value: timeSince(lastPost.publishedAt),
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                },
                {
                  label: 'المستلمون',
                  value: lastPost.emailStats.sent.toLocaleString('en'),
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
                },
                {
                  label: 'معدل القراءة',
                  value: `${lastPost.emailStats.openRate}%`,
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                  highlight: lastPost.emailStats.openRate > 40,
                },
                {
                  label: 'معدل النقر',
                  value: `${lastPost.emailStats.clickRate}%`,
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M9 9l5 12 1.8-5.2L21 14z"/><path d="M7.2 2.2L8 5.1M1 7.2l2.9.8M2.2 12.8l2.2-2M12.8 2.2l-2 2.2"/></svg>,
                  highlight: lastPost.emailStats.clickRate > 10,
                },
                {
                  label: 'إلغاء اشتراك',
                  value: '0.0%',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>,
                },
                {
                  label: 'المشاهدات',
                  value: lastPost.views.toLocaleString('en'),
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
                },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: i < 5 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'flex', flexShrink: 0 }}>{row.icon}</span>
                    <span style={{ fontSize: 13, color: colors.text, fontFamily: F }}>{row.label}</span>
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 600, fontFamily: F,
                    color: row.highlight ? '#059669' : colors.text,
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textMuted, fontSize: 14, fontFamily: F }}>
              لم تنشر أي منشور بعد
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hub-dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
