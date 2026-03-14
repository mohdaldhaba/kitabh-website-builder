import React, { useState } from 'react';
import { MOCK_NEWSLETTER } from '../mockData';
import { colors, icons } from './HubLayout';

// Mock subscriber data for the list
const mockSubscribers = [
  { _id: 'sub_1', name: 'أحمد الشمري', email: 'ahmed@gmail.com', subscribedAt: '2026-03-08T10:00:00Z', source: 'موقع', status: 'active' as const },
  { _id: 'sub_2', name: 'سارة القحطاني', email: 'sara@outlook.com', subscribedAt: '2026-03-05T14:00:00Z', source: 'رابط مباشر', status: 'active' as const },
  { _id: 'sub_3', name: 'خالد العتيبي', email: 'khalid@yahoo.com', subscribedAt: '2026-03-01T08:00:00Z', source: 'إحالة', status: 'active' as const },
  { _id: 'sub_4', name: 'نورة الدوسري', email: 'noura@gmail.com', subscribedAt: '2026-02-28T12:00:00Z', source: 'موقع', status: 'active' as const },
  { _id: 'sub_5', name: 'عبدالله الحربي', email: 'abdullah@icloud.com', subscribedAt: '2026-02-25T09:00:00Z', source: 'تويتر', status: 'active' as const },
  { _id: 'sub_6', name: 'ريم السبيعي', email: 'reem@gmail.com', subscribedAt: '2026-02-20T16:00:00Z', source: 'رابط مباشر', status: 'inactive' as const },
  { _id: 'sub_7', name: 'فهد المالكي', email: 'fahad@hotmail.com', subscribedAt: '2026-02-15T11:00:00Z', source: 'موقع', status: 'active' as const },
  { _id: 'sub_8', name: 'لمى العنزي', email: 'lama@gmail.com', subscribedAt: '2026-02-10T07:00:00Z', source: 'إحالة', status: 'unsubscribed' as const },
];

const AudiencePage: React.FC = () => {
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');

  const stats = MOCK_NEWSLETTER.emailStats;
  const filtered = mockSubscribers.filter((s) => {
    if (tab === 'active') return s.status === 'active';
    if (tab === 'inactive') return s.status !== 'active';
    return true;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', overflow: 'hidden' }}>
      {/* Stats cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'إجمالي المشتركين', value: stats.totalSubscribers.toLocaleString('en'), icon: icons.audience },
          { label: 'مشتركون جدد (هذا الشهر)', value: '143', icon: icons.grow },
          { label: 'معدل إلغاء الاشتراك', value: `${((stats.totalUnsubscribes / stats.totalSubscribers) * 100).toFixed(1)}%`, icon: icons.analyze },
          { label: 'معدل الفتح', value: `${stats.avgOpenRate}%`, icon: icons.posts },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 140,
              background: '#fff',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.5)',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ opacity: 0.4 }}>{stat.icon}</span>
              <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Subscriber list */}
      <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', overflow: 'hidden' }}>
        {/* Tabs + actions */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
            {([
              { value: 'all', label: 'الكل' },
              { value: 'active', label: 'نشط' },
              { value: 'inactive', label: 'غير نشط' },
            ] as { value: typeof tab; label: string }[]).map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                style={{
                  padding: '6px 14px',
                  background: tab === t.value ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: tab === t.value ? 600 : 400,
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  color: tab === t.value ? colors.text : colors.textMuted,
                  cursor: 'pointer',
                  boxShadow: tab === t.value ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
            }}
          >
            تصدير CSV
          </button>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 140px 120px 100px',
            padding: '12px 16px',
            borderBottom: '1px solid #F3F4F6',
            background: '#FAFAFA',
            minWidth: 600,
          }}
        >
          {['الاسم', 'البريد الإلكتروني', 'تاريخ الاشتراك', 'المصدر', 'الحالة'].map((header) => (
            <div key={header} style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {header}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((sub, index) => (
          <div
            key={sub._id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 140px 120px 100px',
              padding: '14px 16px',
              borderBottom: index < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s',
              minWidth: 600,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#E0E7FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#111',
                  flexShrink: 0,
                }}
              >
                {sub.name.charAt(0)}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                {sub.name}
              </span>
            </div>
            <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', direction: 'ltr', textAlign: 'right' }}>
              {sub.email}
            </span>
            <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {formatDate(sub.subscribedAt)}
            </span>
            <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              {sub.source}
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                background: sub.status === 'active' ? '#ECFDF5' : sub.status === 'unsubscribed' ? '#FEF2F2' : '#FEF3C7',
                color: sub.status === 'active' ? '#059669' : sub.status === 'unsubscribed' ? '#DC2626' : '#D97706',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              {sub.status === 'active' ? 'نشط' : sub.status === 'unsubscribed' ? 'ألغى الاشتراك' : 'غير نشط'}
            </span>
          </div>
        ))}
        </div>{/* end scroll wrapper */}
      </div>
    </div>
  );
};

export default AudiencePage;
