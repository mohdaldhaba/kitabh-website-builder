import React, { useState } from 'react';
import { MOCK_ARTICLES, MOCK_NEWSLETTER } from '../mockData';
import { colors } from './HubLayout';

interface AnalyzePageProps {
  subPage?: string;
}

const F = 'IBM Plex Sans Arabic, sans-serif';
const card = { background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)' } as const;

// ─── Progress Ring ──────────────────────────────────────
const ProgressRing: React.FC<{ percentage: number; size?: number; strokeWidth?: number; color?: string }> = ({
  percentage, size = 56, strokeWidth = 6, color = '#111',
}) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(percentage, 100) / 100) * c;
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.7s ease-out' }} />
      </svg>
      <div style={{ position: 'absolute', fontSize: 11, fontWeight: 700, color: colors.text, fontFamily: F }}>
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
};

// ─── Stat Icon SVGs ─────────────────────────────────────
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconEye = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconClick = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 9l5 12 1.8-5.2L21 14z"/><path d="M7.2 2.2L8 5.1M1 7.2l2.9.8M2.2 12.8l2.2-2M12.8 2.2l-2 2.2"/></svg>;
const IconAlert = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconExternal = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

// ─── Helpers ────────────────────────────────────────────
const fmt = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('en');
};
const pct = (n: number) => (n ? `${n.toFixed(1)}%` : '0%');

const getEngagement = (openRate: number) => {
  if (openRate >= 25) return { level: 'ممتاز', color: '#059669', bg: '#ECFDF5' };
  if (openRate >= 20) return { level: 'جيد', color: '#111', bg: '#F3F4F6' };
  if (openRate >= 15) return { level: 'متوسط', color: '#D97706', bg: '#FFFBEB' };
  if (openRate >= 10) return { level: 'ضعيف', color: '#EA580C', bg: '#FFF7ED' };
  return { level: 'ضعيف جداً', color: '#DC2626', bg: '#FEF2F2' };
};

const getBenchmark = (rate: number, type: 'open' | 'click') => {
  const b = type === 'open' ? { e: 25, g: 20, a: 15 } : { e: 5, g: 3, a: 2 };
  if (rate >= b.e) return { label: 'ممتاز', color: '#059669', bg: '#ECFDF5' };
  if (rate >= b.g) return { label: 'جيد', color: '#111', bg: '#F3F4F6' };
  if (rate >= b.a) return { label: 'متوسط', color: '#D97706', bg: '#FFFBEB' };
  return { label: 'ضعيف', color: '#DC2626', bg: '#FEF2F2' };
};

// ─── Newsletter Stats (production-like) ─────────────────
const NewsletterStats: React.FC = () => {
  const newsletters = [MOCK_NEWSLETTER]; // In production, fetch from API
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ─── List View ────────────────────────────────────────
  if (!selectedId) {
    // Global aggregates
    const totalSubs = newsletters.reduce((s, n) => s + (n.emailStats?.totalSubscribers || 0), 0);
    const totalSent = newsletters.reduce((s, n) => s + (n.emailStats?.totalSent || 0), 0);
    const avgOpen = newsletters.reduce((s, n) => s + (n.emailStats?.avgOpenRate || 0), 0) / (newsletters.length || 1);
    const avgClick = newsletters.reduce((s, n) => s + (n.emailStats?.avgClickRate || 0), 0) / (newsletters.length || 1);

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: F, margin: '0 0 4px' }}>
              إحصائيات النشرات البريدية
            </h2>
            <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: F, margin: 0 }}>
              تتبع أداء نشراتك البريدية
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#ECFDF5', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#059669', fontFamily: F }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
            مباشر
          </div>
        </div>

        {/* Global Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'إجمالي المشتركين', value: fmt(totalSubs), icon: <IconUsers />, iconBg: '#F3F4F6', iconColor: '#111' },
            { label: 'إجمالي المرسل', value: fmt(totalSent), icon: <IconSend />, iconBg: '#ECFDF5', iconColor: '#059669' },
            { label: 'معدل القراءة', value: pct(avgOpen), icon: <IconEye />, iconBg: '#F3F4F6', iconColor: '#374151', progress: avgOpen },
            { label: 'معدل النقر', value: pct(avgClick), icon: <IconClick />, iconBg: '#FFF7ED', iconColor: '#EA580C', progress: avgClick },
          ].map((s, i) => (
            <div key={i} style={{ ...card, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: F, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, fontFamily: F }}>{s.value}</div>
              {s.progress !== undefined && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(s.progress, 100)}%`, background: '#111', borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: F, marginTop: 4 }}>{s.progress.toFixed(1)}% معدل</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: '#E5E7EB', marginBottom: 24 }} />

        {/* Newsletter Cards */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: F, margin: 0 }}>نشراتك البريدية</h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', background: '#F3F4F6', padding: '4px 12px', borderRadius: 8, fontFamily: F }}>
            {newsletters.length} نشرة
          </span>
        </div>

        <div className="hub-newsletter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 16 }}>
          {newsletters.map((nl) => {
            const stats = nl.emailStats || {} as any;
            const deliveryRate = stats.totalSent > 0 ? (stats.totalDelivered / stats.totalSent) * 100 : 0;
            const engagementRate = stats.totalDelivered > 0 ? Math.min(100, ((stats.totalOpens || 0) / stats.totalDelivered) * 100) : 0;
            const clickThrough = stats.totalOpens > 0 ? Math.min(100, ((stats.uniqueClicks || 0) / stats.totalOpens) * 100) : 0;
            const bounceRate = stats.totalSent > 0 ? (stats.totalBounces / stats.totalSent) * 100 : 0;
            const eng = getEngagement(stats.avgOpenRate || 0);

            return (
              <div key={nl._id || nl.displayName} style={{ ...card, padding: 0, cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setSelectedId(nl._id || 'default')}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = card.boxShadow; }}
              >
                <div style={{ padding: '20px 24px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: colors.text, fontFamily: F }}>{nl.displayName}</div>
                      <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: F }}>@{nl.userName || 'username'}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: eng.color, background: eng.bg, padding: '4px 12px', borderRadius: 20, fontFamily: F }}>
                      {eng.level}
                    </span>
                  </div>

                  {/* Quick stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: 'مشترك', value: fmt(nl.emailStats?.totalSubscribers || 0), bg: '#F3F4F6', color: '#111' },
                      { label: 'مرسل', value: fmt(stats.totalSent || 0), bg: '#ECFDF5', color: '#059669' },
                      { label: 'فتح', value: fmt(stats.totalOpens || 0), bg: '#F3F4F6', color: '#374151' },
                      { label: 'نقرة', value: fmt(stats.uniqueClicks || 0), bg: '#FFF7ED', color: '#EA580C' },
                    ].map((q, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '10px 6px', background: q.bg, borderRadius: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: q.color, fontFamily: F }}>{q.value}</div>
                        <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: F }}>{q.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Performance rings */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, fontFamily: F, marginBottom: 10 }}>الأداء الأساسي</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <ProgressRing percentage={deliveryRate} size={44} color="#059669" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, fontFamily: F }}>معدل التسليم</div>
                          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: F }}>{fmt(stats.totalDelivered || 0)} من {fmt(stats.totalSent || 0)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ProgressRing percentage={engagementRate} size={44} color="#111" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, fontFamily: F }}>معدل القراءة</div>
                          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: F }}>{fmt(stats.totalOpens || 0)} فتح</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, fontFamily: F, marginBottom: 10 }}>التحليل المتقدم</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <ProgressRing percentage={clickThrough} size={44} color="#EA580C" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, fontFamily: F }}>معدل النقر</div>
                          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: F }}>{fmt(stats.uniqueClicks || 0)} نقرة فريدة</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ProgressRing percentage={bounceRate} size={44} color="#DC2626" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, fontFamily: F }}>معدل الارتداد</div>
                          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: F }}>{fmt(stats.totalBounces || 0)} مرتدة</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues alert */}
                {((stats.totalBounces || 0) > 0 || (stats.totalUnsubscribes || 0) > 0) && (
                  <div style={{ margin: '0 24px 16px', padding: '10px 14px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#D97706' }}><IconAlert /></span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E', fontFamily: F }}>مسائل تحتاج انتباه</div>
                      <div style={{ fontSize: 11, color: '#A16207', fontFamily: F }}>
                        {stats.totalBounces > 0 && `${stats.totalBounces} مرتدة`}
                        {stats.totalBounces > 0 && stats.totalUnsubscribes > 0 && ' • '}
                        {stats.totalUnsubscribes > 0 && `${stats.totalUnsubscribes} إلغاء`}
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div style={{ padding: '12px 24px 20px' }}>
                  <button style={{ width: '100%', padding: '10px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: F, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(nl._id || 'default'); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    عرض التحليل المفصّل
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @media (max-width: 500px) {
            .hub-newsletter-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    );
  }

  // ─── Detail View ──────────────────────────────────────
  const nl = newsletters.find(n => (n._id || 'default') === selectedId) || newsletters[0];
  const stats = nl.emailStats || {} as any;
  const articles = [...MOCK_ARTICLES].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const deliveryRate = stats.totalSent > 0 ? (stats.totalDelivered / stats.totalSent) * 100 : 0;
  const engagementRate = stats.totalDelivered > 0 ? Math.min(100, (stats.totalOpens / stats.totalDelivered) * 100) : 0;
  const clickThrough = stats.totalOpens > 0 ? Math.min(100, (stats.uniqueClicks / stats.totalOpens) * 100) : 0;
  const bounceRate = stats.totalSent > 0 ? (stats.totalBounces / stats.totalSent) * 100 : 0;

  return (
    <div>
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setSelectedId(null)} style={{ padding: '8px 14px', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: F, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: colors.text }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          العودة
        </button>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: F, margin: 0 }}>{nl.displayName}</h2>
          <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: F, margin: 0 }}>تحليل مفصّل لأداء النشرة البريدية</p>
        </div>
      </div>

      {/* Overview bar */}
      <div style={{ ...card, padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[
            { label: 'المشتركون', value: fmt(nl.emailStats?.totalSubscribers || 0), icon: <IconUsers />, bg: '#F3F4F6', color: '#111' },
            { label: 'إجمالي المرسل', value: fmt(stats.totalSent || 0), icon: <IconSend />, bg: '#ECFDF5', color: '#059669' },
            { label: 'معدل القراءة', value: pct(stats.avgOpenRate || 0), icon: <IconEye />, bg: '#F3F4F6', color: '#374151' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: F }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: F }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', background: '#F3F4F6', padding: '4px 12px', borderRadius: 8, fontFamily: F }}>
          {articles.length} مقال
        </span>
      </div>

      {/* Article Stats Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: colors.text, fontFamily: F, margin: '0 0 4px' }}>إحصائيات المقالات الفردية</h3>
        <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: F, margin: 0 }}>تفاصيل شاملة لأداء كل مقال في النشرة البريدية</p>
      </div>

      {/* Article Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {articles.map((article) => {
          const as_ = article.emailStats;
          const aDeliveryRate = as_.sent > 0 ? ((as_.sent - (as_ as any).bounces || 0) / as_.sent) * 100 : 0;
          const aOpenRate = as_.sent > 0 ? (as_.openRate || 0) : 0;
          const aClickRate = as_.openRate > 0 ? (as_.clickRate || 0) : 0;
          const openBench = getBenchmark(aOpenRate, 'open');
          const clickBench = getBenchmark(aClickRate, 'click');
          const delivBench = aDeliveryRate >= 95 ? { label: 'ممتاز', color: '#059669', bg: '#ECFDF5' } : aDeliveryRate >= 90 ? { label: 'جيد', color: '#D97706', bg: '#FFFBEB' } : { label: 'يحتاج تحسين', color: '#DC2626', bg: '#FEF2F2' };

          return (
            <div key={article._id} style={{ ...card, padding: 0, transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = card.boxShadow)}>
              {/* Article header */}
              <div style={{ padding: '18px 24px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: F, marginBottom: 4 }}>{article.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: colors.textMuted, fontFamily: F }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCalendar />{new Date(article.publishedAt).toLocaleDateString('ar-SA')}</span>
                    {as_.sent > 0 && <span style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{fmt(as_.sent)} مرسل</span>}
                  </div>
                </div>
                <button style={{ padding: '6px 12px', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: F, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: colors.text }}>
                  <IconExternal /> عرض النص
                </button>
              </div>

              {/* Stats grid */}
              <div style={{ padding: '0 24px 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {/* Delivery */}
                <div style={{ border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, fontFamily: F, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#059669' }}><IconSend /></span> إحصائيات التسليم
                  </div>
                  {[
                    { l: 'المرسل', v: fmt(as_.sent || 0), c: colors.text },
                    { l: 'تم التسليم', v: fmt(as_.sent - ((as_ as any).bounces || 0)), c: '#059669' },
                    { l: 'معدل التسليم', v: pct(aDeliveryRate), c: '#059669' },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, fontFamily: F }}>
                      <span style={{ color: colors.textMuted }}>{r.l}</span>
                      <span style={{ fontWeight: 700, color: r.c }}>{r.v}</span>
                    </div>
                  ))}
                </div>
                {/* Opens */}
                <div style={{ border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, fontFamily: F, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#374151' }}><IconEye /></span> إحصائيات القراءة
                  </div>
                  {[
                    { l: 'معدل القراءة', v: pct(aOpenRate), c: '#374151' },
                    { l: 'مشاهدات', v: fmt(article.views || 0), c: colors.text },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, fontFamily: F }}>
                      <span style={{ color: colors.textMuted }}>{r.l}</span>
                      <span style={{ fontWeight: 700, color: r.c }}>{r.v}</span>
                    </div>
                  ))}
                </div>
                {/* Clicks */}
                <div style={{ border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, fontFamily: F, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#EA580C' }}><IconClick /></span> إحصائيات النقر
                  </div>
                  {[
                    { l: 'معدل النقر', v: pct(aClickRate), c: '#EA580C' },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, fontFamily: F }}>
                      <span style={{ color: colors.textMuted }}>{r.l}</span>
                      <span style={{ fontWeight: 700, color: r.c }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance indicators */}
              <div className="hub-perf-indicators" style={{ padding: '0 24px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {[
                  { label: 'معدل القراءة', value: pct(aOpenRate), bench: openBench, desc: 'نسبة من قرأ النشرة' },
                  { label: 'معدل النقر', value: pct(aClickRate), bench: clickBench, desc: 'نسبة من نقر على الروابط' },
                  { label: 'جودة التسليم', value: pct(aDeliveryRate), bench: delivBench, desc: 'نسبة الوصول للبريد' },
                ].map((p, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: colors.text, fontFamily: F }}>{p.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: p.bench.color, background: p.bench.bg, padding: '2px 8px', borderRadius: 6, fontFamily: F }}>{p.bench.label}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: F }}>{p.value}</div>
                    <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: F, marginTop: 2 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Bar chart helper ────────────────────────────────────
const HorizontalBar: React.FC<{ label: string; value: number; max: number; suffix?: string; color?: string }> = ({
  label, value, max, suffix = '', color = '#111',
}) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 13, color: colors.text, fontFamily: F }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: F }}>
        {typeof value === 'number' ? value.toLocaleString('en') : value}{suffix}
      </span>
    </div>
    <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
    </div>
  </div>
);

// ─── Website Stats ───────────────────────────────────────
const WebsiteStats: React.FC = () => {
  const pageViews = [
    { page: 'الصفحة الرئيسية', views: 4200 },
    { page: 'صفحة المقالات', views: 2800 },
    { page: 'من نحن', views: 1100 },
    { page: 'تواصل معنا', views: 650 },
  ];
  const sources = [
    { source: 'بحث Google', visits: 3200, color: '#374151' },
    { source: 'تويتر / X', visits: 1800, color: '#111' },
    { source: 'مباشر', visits: 1500, color: '#059669' },
    { source: 'إنستغرام', visits: 900, color: '#6B7280' },
    { source: 'أخرى', visits: 400, color: '#9CA3AF' },
  ];
  const maxViews = Math.max(...pageViews.map((p) => p.views));
  const maxVisits = Math.max(...sources.map((s) => s.visits));

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: F, margin: '0 0 8px' }}>إحصائيات الموقع</h2>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: F, margin: '0 0 24px' }}>أداء موقعك — آخر 30 يوما</p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'زيارات الموقع', value: '7,800' },
          { label: 'زوار فريدون', value: '4,200' },
          { label: 'متوسط مدة الزيارة', value: '2:35 د' },
          { label: 'معدل الارتداد', value: '32%' },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, minWidth: 160, ...card, padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: F, marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, fontFamily: F }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div className="hub-analyze-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: F, margin: '0 0 20px' }}>أكثر الصفحات زيارة</h3>
          {pageViews.map((p) => <HorizontalBar key={p.page} label={p.page} value={p.views} max={maxViews} />)}
        </div>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: F, margin: '0 0 20px' }}>مصادر الزيارات</h3>
          {sources.map((s) => <HorizontalBar key={s.source} label={s.source} value={s.visits} max={maxVisits} color={s.color} />)}
        </div>
      </div>
      <style>{`@media (max-width: 700px) { .hub-analyze-charts { grid-template-columns: 1fr !important; } }`}</style>
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
