import React, { useState } from 'react';
import { MOCK_ARTICLES } from '../mockData';
import { colors, icons } from './HubLayout';

type FilterStatus = 'all' | 'published' | 'draft' | 'scheduled' | 'archived';
type SortBy = 'newest' | 'oldest' | 'most-viewed';

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  published: { label: 'منشور', bg: '#ECFDF5', color: '#059669' },
  draft: { label: 'مسودة', bg: '#FEF3C7', color: '#D97706' },
  scheduled: { label: 'مجدول', bg: '#EEF2FF', color: '#4F46E5' },
  archived: { label: 'مؤرشف', bg: '#F3F4F6', color: '#6B7280' },
};

const PostsPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Add some mock drafts
  const allArticles = [
    ...MOCK_ARTICLES,
    {
      ...MOCK_ARTICLES[0],
      _id: 'art_draft_1',
      title: 'مسودة جديدة',
      status: 'draft' as const,
      publishedAt: '',
      createdAt: '2026-03-10T10:00:00.000Z',
      updatedAt: '2026-03-10T10:00:00.000Z',
      views: 0,
      likeCount: 0,
      commentCount: 0,
    },
    {
      ...MOCK_ARTICLES[1],
      _id: 'art_draft_2',
      title: 'منشور قيد الكتابة — أفكار أولية',
      status: 'draft' as const,
      publishedAt: '',
      createdAt: '2026-03-09T14:00:00.000Z',
      updatedAt: '2026-03-09T14:00:00.000Z',
      views: 0,
      likeCount: 0,
      commentCount: 0,
    },
  ];

  const filtered = allArticles
    .filter((a) => filter === 'all' || a.status === filter)
    .filter((a) => !searchQuery || a.title.includes(searchQuery))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return b.views - a.views;
    });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
            عرض وتعديل المنشورات الحالية وإنشاء منشورات جديدة
          </p>
        </div>
        <button
          style={{
            padding: '10px 20px',
            background: colors.primary,
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
          {icons.write}
          ابدأ بالكتابة
        </button>
      </div>

      {/* Filters bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#F9FAFB',
            borderRadius: 8,
            padding: '8px 12px',
            flex: 1,
            minWidth: 200,
            border: '1px solid #E5E7EB',
          }}
        >
          <span style={{ opacity: 0.4 }}>{icons.search}</span>
          <input
            type="text"
            placeholder="ابحث في المنشورات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 14,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              color: colors.text,
              width: '100%',
              direction: 'rtl',
            }}
          />
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
          {([
            { value: 'all', label: 'الكل' },
            { value: 'published', label: 'منشور' },
            { value: 'draft', label: 'مسودة' },
            { value: 'scheduled', label: 'مجدول' },
          ] as { value: FilterStatus; label: string }[]).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                padding: '6px 14px',
                background: filter === tab.value ? '#fff' : 'transparent',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: filter === tab.value ? 600 : 400,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                color: filter === tab.value ? colors.text : colors.textMuted,
                cursor: 'pointer',
                boxShadow: filter === tab.value ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortBy)}
          style={{
            padding: '8px 12px',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            color: colors.text,
            background: '#fff',
            cursor: 'pointer',
            direction: 'rtl',
          }}
        >
          <option value="newest">الأحدث أولا</option>
          <option value="oldest">الأقدم أولا</option>
          <option value="most-viewed">الأكثر مشاهدة</option>
        </select>
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 12, paddingRight: 4 }}>
        عرض {filtered.length} من {allArticles.length} منشور
      </div>

      {/* Posts list */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {filtered.map((article, index) => {
          const status = statusConfig[article.status] || statusConfig.draft;
          return (
            <div
              key={article._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: index < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                gap: 16,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                style={{ width: 16, height: 16, accentColor: colors.primary, cursor: 'pointer', flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: colors.text,
                    fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                    marginBottom: 4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {article.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: status.bg,
                      color: status.color,
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                    }}
                  >
                    {status.label}
                  </span>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                    آخر تعديل: {formatDate(article.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Stats (only for published) */}
              {article.status === 'published' && (
                <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                      {article.views.toLocaleString('ar-SA')}
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>مشاهدة</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                      {article.emailStats.openRate}%
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>فتح</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                      {article.commentCount}
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>تعليق</div>
                  </div>
                </div>
              )}

              {/* Three-dot menu */}
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
                onClick={(e) => e.stopPropagation()}
              >
                ⋮
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
              لا توجد منشورات
            </div>
            <div style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
              ابدأ بكتابة أول منشور لك
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
