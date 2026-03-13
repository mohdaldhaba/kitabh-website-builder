import React, { useState } from 'react';
import { MOCK_ARTICLES } from '../mockData';
import { colors, icons } from './HubLayout';

type FilterStatus = 'all' | 'published' | 'draft' | 'scheduled' | 'archived';
type SortBy = 'newest' | 'oldest' | 'most-viewed';

interface PostsPageProps {
  subPage?: string;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  published: { label: 'منشور', bg: '#ECFDF5', color: '#059669' },
  draft: { label: 'مسودة', bg: '#374151', color: '#FFFFFF' },
  scheduled: { label: 'مجدول', bg: '#F3F4F6', color: '#374151' },
  archived: { label: 'مؤرشف', bg: '#F3F4F6', color: '#6B7280' },
};

// ─── Outline Creator ─────────────────────────────────────
const OutlineCreator: React.FC = () => (
  <div style={{ maxWidth: 800, margin: '0 auto' }}>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 8px' }}>
      إنشاء مخطط
    </h2>
    <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 24px' }}>
      أنشئ مخططا لمنشورك قبل البدء بالكتابة
    </p>

    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', padding: 24 }}>
      {/* Topic */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
          موضوع المنشور
        </label>
        <input
          type="text"
          placeholder="مثال: كيف تبني نشرة بريدية ناجحة..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            color: colors.text,
            background: '#FAFAFA',
            direction: 'rtl',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Key points */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
          النقاط الرئيسية (اختياري)
        </label>
        <textarea
          placeholder="أضف النقاط التي تريد تغطيتها، كل نقطة في سطر..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            color: colors.text,
            background: '#FAFAFA',
            direction: 'rtl',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Tone */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', marginBottom: 8 }}>
          نبرة الكتابة
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['تعليمي', 'شخصي', 'تحليلي', 'قصصي', 'ملهم'].map((tone) => (
            <button
              key={tone}
              style={{
                padding: '8px 16px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                color: colors.text,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <button
        style={{
          padding: '12px 24px',
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
        {icons.write}
        إنشاء المخطط
      </button>
    </div>
  </div>
);

// ─── Articles List ───────────────────────────────────────
const ArticlesList: React.FC<{ defaultFilter?: FilterStatus }> = ({ defaultFilter = 'all' }) => {
  const [filter, setFilter] = useState<FilterStatus>(defaultFilter);
  const [sort, setSort] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');

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
    return date.toLocaleDateString('ar-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Page header — Beehiiv style: title + subtitle + buttons */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 6px' }}>
            المنشورات
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>
            عرض وتعديل المنشورات الحالية وإنشاء منشورات جديدة
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              padding: '9px 16px',
              background: '#fff',
              color: colors.text,
              border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              cursor: 'pointer',
            }}
          >
            إدارة التصنيفات
          </button>
          <button
            style={{
              padding: '9px 16px',
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
              gap: 6,
            }}
          >
            {icons.write}
            ابدأ بالكتابة
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>
      </div>

      {/* Search bar row — Beehiiv style */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        {/* Search input */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 14px',
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            borderRadius: 8,
            background: '#fff',
          }}
        >
          <span style={{ color: '#9CA3AF', display: 'flex' }}>{icons.search}</span>
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

        {/* Filters button */}
        <button
          style={{
            padding: '9px 16px',
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            color: colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
          فلاتر
        </button>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortBy)}
          style={{
            padding: '9px 14px',
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            borderRadius: 8,
            fontSize: 14,
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

      {/* Count row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0, padding: '10px 0', borderBottom: '1px solid #E5E7EB' }}>
        <input type="checkbox" style={{ width: 16, height: 16, cursor: 'pointer' }} />
        <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
          عرض {filtered.length} من {allArticles.length} منشور
        </span>
      </div>

      {/* Post rows — flat list, no card wrapper, just borders */}
      {filtered.map((article, index) => {
        const status = statusConfig[article.status] || statusConfig.draft;
        return (
          <div
            key={article._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '18px 0',
              borderBottom: '1px solid #E5E7EB',
              gap: 14,
              cursor: 'pointer',
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Title + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: colors.text,
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  marginBottom: 6,
                }}
              >
                {article.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: status.bg,
                    color: status.color,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                  }}
                >
                  {status.label}
                </span>
                <span style={{ color: '#D1D5DB', fontSize: 12 }}>&#x2022;</span>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  ك
                </div>
                <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                  آخر تعديل {formatDate(article.updatedAt)}
                </span>
              </div>
            </div>

            {/* Three-dot menu */}
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                fontSize: 18,
                color: '#9CA3AF',
                lineHeight: 1,
                flexShrink: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              &#x22EE;
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
  );
};

// ─── Posts Page Router ───────────────────────────────────
const PostsPage: React.FC<PostsPageProps> = ({ subPage = 'all-posts' }) => {
  return <ArticlesList />;
};

export default PostsPage;
