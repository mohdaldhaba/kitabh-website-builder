import React from 'react';
import { colors, icons } from './HubLayout';

const mockMembers = [
  { _id: 'm1', name: 'محمد الضبع', email: 'mohd@kitabh.com', role: 'مالك' as const, avatar: 'م', joinedAt: '2025-01-01', status: 'active' as const },
  { _id: 'm2', name: 'زيد المطيري', email: 'zaid@kitabh.com', role: 'محرر' as const, avatar: 'ز', joinedAt: '2025-06-15', status: 'active' as const },
  { _id: 'm3', name: 'سارة القحطاني', email: 'sara@kitabh.com', role: 'كاتب' as const, avatar: 'س', joinedAt: '2026-01-10', status: 'active' as const },
];

const roleColors: Record<string, { bg: string; color: string }> = {
  'مالك': { bg: '#111', color: '#fff' },
  'محرر': { bg: '#EEF2FF', color: '#4F46E5' },
  'كاتب': { bg: '#ECFDF5', color: '#059669' },
};

const MembersPage: React.FC = () => (
  <div style={{ maxWidth: 800, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
        أدر فريقك والمساهمين في نشرتك وموقعك
      </p>
      <button
        style={{
          padding: '10px 20px',
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {icons.members}
        دعوة عضو
      </button>
    </div>

    <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', overflow: 'hidden' }}>
      {mockMembers.map((member, index) => {
        const roleStyle = roleColors[member.role] || roleColors['كاتب'];
        return (
          <div
            key={member._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '18px 20px',
              borderBottom: index < mockMembers.length - 1 ? '1px solid #F3F4F6' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Avatar */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #333 0%, #111 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {member.avatar}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 2 }}>
                {member.name}
              </div>
              <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', direction: 'ltr', textAlign: 'right' }}>
                {member.email}
              </div>
            </div>

            {/* Role badge */}
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                background: roleStyle.bg,
                color: roleStyle.color,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                flexShrink: 0,
              }}
            >
              {member.role}
            </span>

            {/* Actions */}
            {member.role !== 'مالك' && (
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  fontSize: 18,
                  color: colors.textMuted,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                &#x22EE;
              </button>
            )}
          </div>
        );
      })}
    </div>

    {/* Roles explanation */}
    <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)', padding: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 16px' }}>
        الأدوار والصلاحيات
      </h3>
      {[
        { role: 'مالك', desc: 'تحكم كامل — إعدادات، فوترة، أعضاء، محتوى' },
        { role: 'محرر', desc: 'إدارة المحتوى — تعديل ونشر وحذف المنشورات' },
        { role: 'كاتب', desc: 'كتابة فقط — إنشاء مسودات وإرسالها للمراجعة' },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 0',
            borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none',
          }}
        >
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              background: roleColors[item.role]?.bg || '#F3F4F6',
              color: roleColors[item.role]?.color || '#6B7280',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              minWidth: 50,
              textAlign: 'center',
            }}
          >
            {item.role}
          </span>
          <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            {item.desc}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default MembersPage;
