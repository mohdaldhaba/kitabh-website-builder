import React from 'react';
import { colors, icons } from './HubLayout';

const mockNotifications = [
  { _id: 'n1', type: 'subscriber' as const, title: 'مشترك جديد', message: 'أحمد الشمري اشترك في نشرتك البريدية', time: 'منذ 5 دقائق', read: false },
  { _id: 'n2', type: 'comment' as const, title: 'تعليق جديد', message: 'سارة القحطاني علقت على "كيف تبدأ نشرتك البريدية"', time: 'منذ ساعة', read: false },
  { _id: 'n3', type: 'milestone' as const, title: 'إنجاز جديد!', message: 'وصلت إلى 1,900 مشترك — أحسنت!', time: 'منذ 3 ساعات', read: false },
  { _id: 'n4', type: 'publish' as const, title: 'تم النشر', message: 'منشورك "أدوات الكاتب العربي" نُشر بنجاح', time: 'أمس', read: true },
  { _id: 'n5', type: 'subscriber' as const, title: 'مشتركون جدد', message: '12 مشتركا جديدا هذا الأسبوع', time: 'منذ يومين', read: true },
  { _id: 'n6', type: 'comment' as const, title: 'تعليق جديد', message: 'خالد العتيبي علق على "مستقبل النشرات البريدية"', time: 'منذ 3 أيام', read: true },
];

const typeIcons: Record<string, React.ReactNode> = {
  subscriber: icons.audience,
  comment: icons.posts,
  milestone: icons.grow,
  publish: icons.write,
};

const typeColors: Record<string, string> = {
  subscriber: '#059669',
  comment: '#374151',
  milestone: '#D97706',
  publish: '#111',
};

const NotificationsPage: React.FC = () => {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
            {unreadCount > 0 ? `لديك ${unreadCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة'}
          </p>
        </div>
        <button
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: colors.text,
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            cursor: 'pointer',
          }}
        >
          تعليم الكل كمقروء
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {mockNotifications.map((notif, index) => (
          <div
            key={notif._id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '16px 20px',
              borderBottom: index < mockNotifications.length - 1 ? '1px solid #F3F4F6' : 'none',
              background: notif.read ? 'transparent' : 'rgba(0,0,0,0.015)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
            onMouseLeave={(e) => (e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(0,0,0,0.015)')}
          >
            {/* Icon */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${typeColors[notif.type]}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: typeColors[notif.type],
                flexShrink: 0,
              }}
            >
              {typeIcons[notif.type]}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: notif.read ? 500 : 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                  {notif.title}
                </span>
                {!notif.read && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#111', flexShrink: 0 }} />
                )}
              </div>
              <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 4 }}>
                {notif.message}
              </div>
              <div style={{ fontSize: 12, color: '#B0B0B0', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                {notif.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
