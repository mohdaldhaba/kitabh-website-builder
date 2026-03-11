import React from 'react';
import { MOCK_ARTICLES, MOCK_NEWSLETTER } from '../mockData';
import { colors } from './HubLayout';

interface AnalyzePageProps {
  subPage?: string;
}

// ─── Bar chart helper ────────────────────────────────────
const HorizontalBar: React.FC<{ label: string; value: number; max: number; suffix?: string; color?: string }> = ({
  label, value, max, suffix = '', color = colors.primary,
}) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 13, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
        {typeof value === 'number' ? value.toLocaleString('en') : value}{suffix}
      </span>
    </div>
    <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
    </div>
  </div>
);

// ─── Newsletter Stats ────────────────────────────────────
const NewsletterStats: React.FC = () => {
  const stats = MOCK_NEWSLETTER.emailStats;
  const articles = [...MOCK_ARTICLES].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
        إحصائيات النشرة البريدية
      </h2>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
        أداء {MOCK_NEWSLETTER.displayName} — آخر تحديث: اليوم
      </p>

      {/* Overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'إجمالي الإرسال', value: stats.totalSent },
          { label: 'تم التوصيل', value: stats.totalDelivered },
          { label: 'إجمالي الفتح', value: stats.totalOpens },
          { label: 'نقرات فريدة', value: stats.uniqueClicks },
          { label: 'ارتدادات', value: stats.totalBounces },
          { label: 'إلغاء اشتراك', value: stats.totalUnsubscribes },
        ].map((item, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.5)', padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {item.value.toLocaleString('en')}
            </div>
          </div>
        ))}
      </div>

      {/* Per-article breakdown */}
      <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 20px' }}>
          أداء كل منشور
        </h3>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 80px 80px 80px 80px',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.5)',
            minWidth: 520,
          }}
        >
          {['المنشور', 'أُرسل', 'فتح %', 'نقر %', 'مشاهدات'].map((h) => (
            <div key={h} style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{h}</div>
          ))}
        </div>

        {articles.map((article) => (
          <div
            key={article._id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 80px 80px 80px 80px',
              padding: '14px 0',
              borderBottom: '1px solid #F3F4F6',
              alignItems: 'center',
              minWidth: 520,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', paddingRight: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {article.title}
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {article.emailStats.sent.toLocaleString('en')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: article.emailStats.openRate > 50 ? '#059669' : colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {article.emailStats.openRate}%
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: article.emailStats.clickRate > 15 ? '#059669' : colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {article.emailStats.clickRate}%
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {article.views.toLocaleString('en')}
            </div>
          </div>
        ))}
        </div>{/* end scroll wrapper */}
      </div>
    </div>
  );
};

// ─── Website Stats ───────────────────────────────────────
const WebsiteStats: React.FC = () => {
  // Mock website analytics
  const pageViews = [
    { page: 'الصفحة الرئيسية', views: 4200 },
    { page: 'صفحة المقالات', views: 2800 },
    { page: 'من نحن', views: 1100 },
    { page: 'تواصل معنا', views: 650 },
  ];

  const sources = [
    { source: 'بحث Google', visits: 3200, color: '#4285F4' },
    { source: 'تويتر / X', visits: 1800, color: '#000' },
    { source: 'مباشر', visits: 1500, color: '#059669' },
    { source: 'إنستغرام', visits: 900, color: '#E4405F' },
    { source: 'أخرى', visits: 400, color: '#6B7280' },
  ];

  const maxViews = Math.max(...pageViews.map((p) => p.views));
  const maxVisits = Math.max(...sources.map((s) => s.visits));

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
        إحصائيات الموقع
      </h2>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
        أداء موقعك — آخر 30 يوما
      </p>

      {/* Overview */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'زيارات الموقع', value: '7,800' },
          { label: 'زوار فريدون', value: '4,200' },
          { label: 'متوسط مدة الزيارة', value: '2:35 د' },
          { label: 'معدل الارتداد', value: '32%' },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, minWidth: 160, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.5)', padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="hub-analyze-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Page views */}
        <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 20px' }}>
            أكثر الصفحات زيارة
          </h3>
          {pageViews.map((p) => (
            <HorizontalBar key={p.page} label={p.page} value={p.views} max={maxViews} />
          ))}
        </div>

        {/* Traffic sources */}
        <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 20px' }}>
            مصادر الزيارات
          </h3>
          {sources.map((s) => (
            <HorizontalBar key={s.source} label={s.source} value={s.visits} max={maxVisits} color={s.color} />
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 700px) {
          .hub-analyze-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

// ─── Analyze Page ────────────────────────────────────────
const AnalyzePage: React.FC<AnalyzePageProps> = ({ subPage = 'newsletter-stats' }) => (
  <div style={{ maxWidth: 1100, margin: '0 auto' }}>
    {subPage === 'newsletter-stats' && <NewsletterStats />}
    {subPage === 'website-stats' && <WebsiteStats />}
  </div>
);

export default AnalyzePage;
