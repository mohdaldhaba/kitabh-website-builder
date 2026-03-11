import React from 'react';
import { MOCK_ARTICLES, MOCK_NEWSLETTER, MOCK_STATS, MOCK_AUTHOR } from '../mockData';
import { colors, icons } from './HubLayout';

// ─── Stat Card ───────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
}> = ({ label, value, change, positive, icon }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 14,
      padding: '20px 24px',
      border: '1px solid #E5E7EB',
      flex: 1,
      minWidth: 180,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
        {label}
      </span>
      <span style={{ opacity: 0.4 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 4 }}>
      {typeof value === 'number' ? value.toLocaleString('en') : value}
    </div>
    {change && (
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: positive ? '#059669' : '#DC2626',
          fontFamily: 'IBM Plex Sans Arabic, sans-serif',
        }}
      >
        {positive ? '↑' : '↓'} {change}
      </span>
    )}
  </div>
);

// ─── Recent Article Row ──────────────────────────────────
const ArticleRow: React.FC<{ article: typeof MOCK_ARTICLES[0] }> = ({ article }) => {
  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
    published: { label: 'منشور', bg: '#ECFDF5', color: '#059669' },
    draft: { label: 'مسودة', bg: '#FEF3C7', color: '#D97706' },
    scheduled: { label: 'مجدول', bg: '#EEF2FF', color: '#4F46E5' },
    archived: { label: 'مؤرشف', bg: '#F3F4F6', color: '#6B7280' },
  };

  const status = statusMap[article.status] || statusMap.draft;
  const date = new Date(article.publishedAt || article.createdAt);
  const dateStr = date.toLocaleDateString('ar-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid #F3F4F6',
        gap: 12,
      }}
    >
      {/* Cover thumbnail */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: article.coverImage ? `url(${article.coverImage}) center/cover` : '#E5E7EB',
          flexShrink: 0,
        }}
      />

      {/* Title + date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {article.title}
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginTop: 2 }}>
          {dateStr}
        </div>
      </div>

      {/* Status badge */}
      <span
        style={{
          padding: '3px 10px',
          borderRadius: 12,
          background: status.bg,
          color: status.color,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          flexShrink: 0,
        }}
      >
        {status.label}
      </span>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
          {article.views.toLocaleString('en')} مشاهدة
        </span>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
          {article.emailStats.openRate}% فتح
        </span>
      </div>
    </div>
  );
};

// ─── Email Stats Chart (simple bar visualization) ────────
const MiniChart: React.FC = () => {
  const last7 = [42, 56, 48, 61, 53, 58, 55]; // Mock open rates for last 7 emails
  const max = Math.max(...last7);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {last7.map((val, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(val / max) * 100}%`,
            background: i === last7.length - 1 ? '#111' : 'rgba(0,0,0,0.08)',
            borderRadius: '4px 4px 0 0',
            minHeight: 8,
            transition: 'height 0.3s',
          }}
        />
      ))}
    </div>
  );
};

// ─── Dashboard Page ──────────────────────────────────────
const DashboardPage: React.FC = () => {
  const recentArticles = [...MOCK_ARTICLES]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
          أهلا، {MOCK_AUTHOR.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginTop: 4 }}>
          إليك ملخص أداء نشرتك البريدية وموقعك
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="المشتركون" value={MOCK_STATS.totalSubscribers} change="12% هذا الشهر" positive icon={icons.audience} />
        <StatCard label="إجمالي المشاهدات" value={MOCK_STATS.totalViews} change="8% هذا الأسبوع" positive icon={icons.analyze} />
        <StatCard label="معدل الفتح" value={`${MOCK_STATS.avgOpenRate}%`} change="3% عن الشهر السابق" positive icon={icons.posts} />
        <StatCard label="معدل النقر" value={`${MOCK_STATS.avgClickRate}%`} change="1% انخفاض" positive={false} icon={icons.magicLink} />
      </div>

      {/* Two columns: Recent articles + Email performance */}
      <div className="hub-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Recent Articles */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
              آخر المنشورات
            </h2>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#111',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                cursor: 'pointer',
              }}
            >
              عرض الكل
            </button>
          </div>
          {recentArticles.map((article) => (
            <ArticleRow key={article._id} article={article} />
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Email Performance */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 16px' }}>
              أداء النشرة البريدية
            </h2>
            <MiniChart />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>آخر 7 أعداد</span>
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>معدل الفتح %</span>
            </div>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>أُرسل</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                  {MOCK_NEWSLETTER.emailStats.totalSent.toLocaleString('en')}
                </div>
              </div>
              <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>تم التسليم</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                  {MOCK_NEWSLETTER.emailStats.totalDelivered.toLocaleString('en')}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 12px' }}>
              إجراءات سريعة
            </h2>
            {[
              { label: 'اكتب منشورًا جديدًا', icon: icons.write, primary: true },
              { label: 'عدّل موقعك', icon: icons.website, primary: false },
              { label: 'أنشئ كاروسيل', icon: icons.grow, primary: false },
            ].map((action, i) => (
              <button
                key={i}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: action.primary ? 'rgba(17,17,17,0.08)' : 'transparent',
                  border: `1px solid ${action.primary ? 'rgba(17,17,17,0.3)' : '#E5E7EB'}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  color: action.primary ? colors.primary : colors.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'right',
                  marginBottom: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = action.primary ? 'rgba(17,17,17,0.15)' : '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = action.primary ? 'rgba(17,17,17,0.08)' : 'transparent')}
              >
                <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 900px) {
          .hub-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
