// ═══════════════════════════════════════════════════════
//  Kitabh Landing Pages — Newsletter Signup Page Builder
//  Allows creators to build multiple landing pages with custom slugs
//  Each page: headline + subtext + image + email field + CTA button
//  URL: newsletter.kitabh.com/{slug}
// ═══════════════════════════════════════════════════════

import React, { useState, useCallback, useRef, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────
interface LandingPage {
  id: string;
  slug: string;
  headline: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  creatorName: string;
  creatorAvatar: string;
  subscriberCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // Customization
  theme: "light" | "dark";
  accentColor: string;
  showSubscriberCount: boolean;
  showKitabhBranding: boolean; // free plan = true, business = false
  fields: "email" | "email_name"; // email only or email + name
  // Image controls
  imageZoom: number; // 1 = 100%, 0.5 = 50%, 2 = 200%
  imagePositionY: number; // 0-100, vertical position percentage
}

const DEFAULT_PAGE: Omit<LandingPage, "id" | "createdAt" | "updatedAt"> = {
  slug: "",
  headline: "",
  description: "",
  imageUrl: "",
  buttonText: "اشترك الان",
  creatorName: "",
  creatorAvatar: "",
  subscriberCount: 0,
  isPublished: false,
  theme: "light",
  accentColor: "#0000FF",
  showSubscriberCount: true,
  showKitabhBranding: true,
  fields: "email",
  imageZoom: 1,
  imagePositionY: 50,
};

// ─── Generate ID ────────────────────────────────────────
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Slugify (Arabic-safe) ──────────────────────────────
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── SVG Icons ──────────────────────────────────────────
const Icons = {
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  eye: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  back: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  link: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  image: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  moon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  sun: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  users: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ─── Kitabh Logo SVG (inline) ───────────────────────────
const KitabhLogo = () => (
  <svg width="20" height="14" viewBox="40 10 60 80" fill="#0000FF">
    <path d="m63.34,29.83c0-6.33-3.69-12.15-9.5-14.63-2.41-1.03-5.07-1.6-7.86-1.6h-.74v21.9h18.11v-5.67Z" />
    <path d="m76.44,67.08c0,6.52,3.93,12.45,10,14.85,2.28.9,4.76,1.39,7.36,1.39h.75v-21.9h-18.1v5.66Z" />
    <path d="m88.69,13.59c-11.69,0-21.16,9.47-21.16,21.16v21.56c0,2.82-2.29,5.11-5.11,5.11h-17.2v21.9h5.86c11.68,0,21.15-9.47,21.16-21.15v-21.57c0-2.82,2.29-5.11,5.11-5.11h17.19V13.59h-5.85Z" />
  </svg>
);

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function KitabhLandingPages() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // ─── Load/Save from localStorage (replace with API in production) ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kb_landing_pages");
      if (saved) setPages(JSON.parse(saved));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kb_landing_pages", JSON.stringify(pages));
    } catch (_) {}
  }, [pages]);

  // ─── CRUD Operations ─────────────────────────────────
  const createPage = useCallback(() => {
    const now = new Date().toISOString();
    const newPage: LandingPage = {
      ...DEFAULT_PAGE,
      id: genId(),
      createdAt: now,
      updatedAt: now,
    };
    setPages((prev) => [newPage, ...prev]);
    setEditingId(newPage.id);
  }, []);

  const updatePage = useCallback((id: string, updates: Partial<LandingPage>) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const duplicatePage = useCallback((page: LandingPage) => {
    const now = new Date().toISOString();
    const newPage: LandingPage = {
      ...page,
      id: genId(),
      slug: page.slug + "-copy",
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    };
    setPages((prev) => [newPage, ...prev]);
  }, []);

  const copyLink = useCallback((slug: string) => {
    const url = `newsletter.kitabh.com/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  }, []);

  const editingPage = pages.find((p) => p.id === editingId);

  return (
    <>
      <style>{CSS_STYLES}</style>
      <div className="klp">
        {!editingId ? (
          <PagesList
            pages={pages}
            onEdit={setEditingId}
            onCreate={createPage}
            onDelete={deletePage}
            onDuplicate={duplicatePage}
            onCopyLink={copyLink}
            copiedSlug={copiedSlug}
            onTogglePublish={(id, published) => updatePage(id, { isPublished: published })}
          />
        ) : editingPage ? (
          <PageEditor
            page={editingPage}
            onChange={(updates) => updatePage(editingPage.id, updates)}
            onBack={() => {
              setEditingId(null);
              setPreviewMode(false);
            }}
            previewMode={previewMode}
            onTogglePreview={() => setPreviewMode(!previewMode)}
            onCopyLink={copyLink}
            copiedSlug={copiedSlug}
          />
        ) : null}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
//  PAGES LIST VIEW
// ═══════════════════════════════════════════════════════
interface PagesListProps {
  pages: LandingPage[];
  onEdit: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (page: LandingPage) => void;
  onCopyLink: (slug: string) => void;
  copiedSlug: string | null;
  onTogglePublish: (id: string, published: boolean) => void;
}

function PagesList({ pages, onEdit, onCreate, onDelete, onDuplicate, onCopyLink, copiedSlug, onTogglePublish }: PagesListProps) {
  return (
    <div className="klp-list">
      <div className="klp-header">
        <h1 className="klp-title">صفحات الاشتراك</h1>
        <button className="klp-btn-primary" onClick={onCreate}>
          {Icons.plus}
          <span>صفحة جديدة</span>
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="klp-empty">
          <div className="klp-empty-icon">{Icons.image}</div>
          <h3>لا توجد صفحات بعد</h3>
          <p>أنشئ أول صفحة اشتراك لنشرتك البريدية</p>
          <button className="klp-btn-primary" onClick={onCreate}>
            {Icons.plus}
            <span>إنشاء صفحة</span>
          </button>
        </div>
      ) : (
        <div className="klp-grid">
          {pages.map((page) => (
            <div key={page.id} className="klp-page-card">
              <div className="klp-page-card-top">
                <div className="klp-page-card-info">
                  <h3 className="klp-page-card-name">
                    {page.headline || "بدون عنوان"}
                  </h3>
                  <div className="klp-page-card-slug">
                    {Icons.link}
                    <span>newsletter.kitabh.com/{page.slug || "..."}</span>
                  </div>
                </div>
                <div className={`klp-status ${page.isPublished ? "klp-status-live" : ""}`}>
                  {page.isPublished ? "منشورة" : "مسودة"}
                </div>
              </div>

              {/* Mini Preview */}
              <div className={`klp-mini-preview ${page.theme === "dark" ? "klp-mini-dark" : ""}`}>
                {page.imageUrl ? (
                  <img src={page.imageUrl} alt="" className="klp-mini-img" />
                ) : (
                  <div className="klp-mini-img-placeholder">{Icons.image}</div>
                )}
                <div className="klp-mini-headline">{page.headline || "العنوان الرئيسي"}</div>
              </div>

              <div className="klp-page-card-meta">
                <span className="klp-page-card-date">
                  {new Date(page.updatedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                </span>
                <div className="klp-page-card-subs">
                  {Icons.users}
                  <span>{page.subscriberCount}</span>
                </div>
              </div>

              <div className="klp-page-card-actions">
                <button className="klp-btn-icon" onClick={() => onEdit(page.id)} title="تعديل">
                  {Icons.edit}
                </button>
                <button
                  className="klp-btn-icon"
                  onClick={() => page.slug && onCopyLink(page.slug)}
                  title="نسخ الرابط"
                  disabled={!page.slug}
                >
                  {copiedSlug === page.slug ? Icons.check : Icons.copy}
                </button>
                <button
                  className="klp-btn-icon"
                  onClick={() => onDuplicate(page)}
                  title="نسخ الصفحة"
                >
                  {Icons.copy}
                </button>
                <button
                  className={`klp-btn-icon klp-btn-publish ${page.isPublished ? "active" : ""}`}
                  onClick={() => onTogglePublish(page.id, !page.isPublished)}
                  title={page.isPublished ? "إلغاء النشر" : "نشر"}
                >
                  {Icons.eye}
                </button>
                <button
                  className="klp-btn-icon klp-btn-danger"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من حذف هذه الصفحة؟")) onDelete(page.id);
                  }}
                  title="حذف"
                >
                  {Icons.trash}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  PAGE EDITOR
// ═══════════════════════════════════════════════════════
interface PageEditorProps {
  page: LandingPage;
  onChange: (updates: Partial<LandingPage>) => void;
  onBack: () => void;
  previewMode: boolean;
  onTogglePreview: () => void;
  onCopyLink: (slug: string) => void;
  copiedSlug: string | null;
}

function PageEditor({ page, onChange, onBack, previewMode, onTogglePreview, onCopyLink, copiedSlug }: PageEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-generate slug from headline if not manually edited
  const handleHeadlineChange = (headline: string) => {
    onChange({ headline });
    if (!slugEdited) {
      onChange({ headline, slug: slugify(headline) || "" });
    }
  };

  const handleSlugChange = (raw: string) => {
    setSlugEdited(true);
    onChange({ slug: slugify(raw) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange({ imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="klp-editor">
      {/* Top Bar */}
      <div className="klp-editor-topbar">
        <button className="klp-btn-ghost" onClick={onBack}>
          {Icons.back}
          <span>رجوع</span>
        </button>
        <div className="klp-editor-topbar-actions">
          <button
            className={`klp-btn-ghost ${previewMode ? "active" : ""}`}
            onClick={onTogglePreview}
          >
            {Icons.eye}
            <span>{previewMode ? "تعديل" : "معاينة"}</span>
          </button>
          {page.slug && (
            <button className="klp-btn-ghost" onClick={() => onCopyLink(page.slug)}>
              {copiedSlug === page.slug ? Icons.check : Icons.link}
              <span>{copiedSlug === page.slug ? "تم النسخ" : "نسخ الرابط"}</span>
            </button>
          )}
          <button
            className={`klp-btn-primary ${page.isPublished ? "klp-btn-unpublish" : ""}`}
            onClick={() => onChange({ isPublished: !page.isPublished })}
          >
            {page.isPublished ? "إلغاء النشر" : "نشر الصفحة"}
          </button>
        </div>
      </div>

      <div className="klp-editor-body">
        {/* Left: Form */}
        {!previewMode && (
          <div className="klp-editor-form">
            {/* Slug */}
            <div className="klp-field">
              <label className="klp-label">رابط الصفحة</label>
              <div className="klp-slug-input">
                <span className="klp-slug-prefix">newsletter.kitabh.com/</span>
                <input
                  type="text"
                  value={page.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="رابط-الصفحة"
                  className="klp-input klp-slug-field"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Image */}
            <div className="klp-field">
              <label className="klp-label">الصورة</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              {page.imageUrl ? (
                <div className="klp-image-preview">
                  <div className="klp-image-preview-frame">
                    <img
                      src={page.imageUrl}
                      alt=""
                      style={{
                        transform: `scale(${page.imageZoom || 1})`,
                        objectPosition: `center ${page.imagePositionY ?? 50}%`,
                      }}
                    />
                  </div>
                  {/* Zoom Controls */}
                  <div className="klp-image-controls">
                    <div className="klp-image-zoom-row">
                      <button
                        className="klp-zoom-btn"
                        onClick={() => onChange({ imageZoom: Math.max(0.3, (page.imageZoom || 1) - 0.1) })}
                        title="تصغير"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                      <span className="klp-zoom-label">{Math.round((page.imageZoom || 1) * 100)}%</span>
                      <button
                        className="klp-zoom-btn"
                        onClick={() => onChange({ imageZoom: Math.min(3, (page.imageZoom || 1) + 0.1) })}
                        title="تكبير"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                    </div>
                    <div className="klp-image-position-row">
                      <label className="klp-position-label">موضع الصورة</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={page.imagePositionY}
                        onChange={(e) => onChange({ imagePositionY: Number(e.target.value) })}
                        className="klp-position-slider"
                      />
                    </div>
                  </div>
                  <div className="klp-image-actions">
                    <button className="klp-btn-sm" onClick={() => fileInputRef.current?.click()}>
                      تغيير الصورة
                    </button>
                    <button className="klp-btn-sm klp-btn-sm-danger" onClick={() => onChange({ imageUrl: "", imageZoom: 1, imagePositionY: 50 })}>
                      حذف
                    </button>
                  </div>
                </div>
              ) : (
                <button className="klp-upload-area" onClick={() => fileInputRef.current?.click()}>
                  {Icons.image}
                  <span>اختر صورة أو شعار النشرة</span>
                </button>
              )}
            </div>

            {/* Headline */}
            <div className="klp-field">
              <label className="klp-label">
                العنوان الرئيسي <span className="klp-required">*</span>
              </label>
              <input
                type="text"
                value={page.headline}
                onChange={(e) => handleHeadlineChange(e.target.value)}
                placeholder="مثال: نشرة التقنية الأسبوعية"
                className="klp-input"
              />
            </div>

            {/* Description */}
            <div className="klp-field">
              <label className="klp-label">الوصف</label>
              <textarea
                value={page.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="وصف مختصر عن نشرتك البريدية..."
                className="klp-textarea"
                rows={3}
              />
            </div>

            {/* Creator Name */}
            <div className="klp-field">
              <label className="klp-label">اسم الكاتب</label>
              <input
                type="text"
                value={page.creatorName}
                onChange={(e) => onChange({ creatorName: e.target.value })}
                placeholder="اسمك أو اسم النشرة"
                className="klp-input"
              />
            </div>

            {/* Button Text */}
            <div className="klp-field">
              <label className="klp-label">
                نص زر الاشتراك <span className="klp-required">*</span>
              </label>
              <input
                type="text"
                value={page.buttonText}
                onChange={(e) => onChange({ buttonText: e.target.value })}
                placeholder="اشترك الان"
                className="klp-input"
              />
            </div>

            {/* Fields type */}
            <div className="klp-field">
              <label className="klp-label">حقول النموذج</label>
              <div className="klp-radio-group">
                <button
                  className={`klp-radio-btn ${page.fields === "email" ? "active" : ""}`}
                  onClick={() => onChange({ fields: "email" })}
                >
                  البريد فقط
                </button>
                <button
                  className={`klp-radio-btn ${page.fields === "email_name" ? "active" : ""}`}
                  onClick={() => onChange({ fields: "email_name" })}
                >
                  البريد + الاسم
                </button>
              </div>
            </div>

            <div className="klp-divider" />

            {/* Theme & Customization */}
            <h3 className="klp-section-title">التخصيص</h3>

            {/* Theme Toggle */}
            <div className="klp-field">
              <label className="klp-label">المظهر</label>
              <div className="klp-radio-group">
                <button
                  className={`klp-radio-btn ${page.theme === "light" ? "active" : ""}`}
                  onClick={() => onChange({ theme: "light" })}
                >
                  {Icons.sun} فاتح
                </button>
                <button
                  className={`klp-radio-btn ${page.theme === "dark" ? "active" : ""}`}
                  onClick={() => onChange({ theme: "dark" })}
                >
                  {Icons.moon} داكن
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="klp-field">
              <label className="klp-label">لون الزر</label>
              <div className="klp-color-picker">
                {["#0000FF", "#111", "#E82222", "#12B76A", "#000000", "#4361EE", "#FF6B6B"].map((c) => (
                  <button
                    key={c}
                    className={`klp-color-swatch ${page.accentColor === c ? "active" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => onChange({ accentColor: c })}
                  />
                ))}
                <input
                  type="color"
                  value={page.accentColor}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  className="klp-color-custom"
                  title="لون مخصص"
                />
              </div>
            </div>

            {/* Show subscriber count */}
            <div className="klp-field klp-field-row">
              <label className="klp-label">عرض عدد المشتركين</label>
              <button
                className={`klp-toggle ${page.showSubscriberCount ? "active" : ""}`}
                onClick={() => onChange({ showSubscriberCount: !page.showSubscriberCount })}
              >
                <span className="klp-toggle-dot" />
              </button>
            </div>
          </div>
        )}

        {/* Right: Live Preview */}
        <div className={`klp-preview-container ${previewMode ? "klp-preview-full" : ""}`}>
          <div className="klp-preview-label">معاينة الصفحة</div>
          <LandingPagePreview page={page} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  LANDING PAGE PREVIEW (also the actual rendered page)
// ═══════════════════════════════════════════════════════
interface LandingPagePreviewProps {
  page: LandingPage;
}

function LandingPagePreview({ page }: LandingPagePreviewProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isDark = page.theme === "dark";
  const bg = isDark ? "#1A1A1A" : "#F2F2F2";
  const cardBg = isDark ? "#2A2A2A" : "#FFFFFF";
  const textColor = isDark ? "#EAEAEA" : "#111";
  const subtextColor = isDark ? "#999" : "#6B6B6B";
  const inputBg = isDark ? "#333" : "#F8F8F8";
  const inputBorder = isDark ? "#444" : "#D9D9D9";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: POST to /api/subscribers { email, name, pageId: page.id, slug: page.slug }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="klp-page" style={{ background: bg }}>
      <div className="klp-page-card" style={{ background: cardBg }}>
        {/* Header: creator info (right) + theme toggle (left) */}
        <div className="klp-page-header">
          <div className="klp-page-creator">
            {page.creatorAvatar ? (
              <img src={page.creatorAvatar} alt="" className="klp-page-avatar" />
            ) : (
              <div className="klp-page-avatar-placeholder" style={{ background: page.accentColor, color: "#fff" }}>
                {(page.creatorName || "ك").charAt(0)}
              </div>
            )}
            <span style={{ color: textColor, fontWeight: 700, fontSize: 14 }}>
              {page.creatorName || "اسم الكاتب"}
            </span>
          </div>
          <span style={{ color: subtextColor }}>{isDark ? Icons.moon : Icons.sun}</span>
        </div>

        {/* Image */}
        {page.imageUrl ? (
          <div className="klp-page-image">
            <img
              src={page.imageUrl}
              alt=""
              style={{
                transform: `scale(${page.imageZoom || 1})`,
                objectPosition: `center ${page.imagePositionY ?? 50}%`,
              }}
            />
          </div>
        ) : (
          <div className="klp-page-image-empty" style={{ background: isDark ? "#333" : "#E8E8E8" }}>
            {Icons.image}
          </div>
        )}

        {/* Content */}
        <div className="klp-page-content">
          <h1 className="klp-page-headline" style={{ color: textColor }}>
            {page.headline || "العنوان الرئيسي"}
          </h1>
          {page.description && (
            <p className="klp-page-desc" style={{ color: subtextColor }}>
              {page.description}
            </p>
          )}

          {page.showSubscriberCount && page.subscriberCount > 0 && (
            <div className="klp-page-social-proof" style={{ color: subtextColor }}>
              {Icons.users}
              <span>انضم إلى {page.subscriberCount.toLocaleString("ar-SA")}+ قارئ</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form className="klp-page-form" onSubmit={handleSubmit}>
          {page.fields === "email_name" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم"
              className="klp-page-input"
              style={{ background: inputBg, borderColor: inputBorder, color: textColor }}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="بريدك الالكتروني"
            required
            className="klp-page-input"
            style={{ background: inputBg, borderColor: inputBorder, color: textColor }}
            dir="rtl"
          />
          <button
            type="submit"
            className="klp-page-submit"
            style={{ background: page.accentColor }}
            disabled={submitted}
          >
            {submitted ? (
              <span className="klp-page-success">تم الاشتراك بنجاح</span>
            ) : (
              <span>{page.buttonText || "اشترك الان"}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const CSS_STYLES = `
/* Base */
.klp{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;direction:rtl;text-align:right;color:#111;line-height:1.6;width:100%;min-height:100vh;background:transparent;}

/* ─── List View ─── */
.klp-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
.klp-title{font-size:24px;font-weight:700;margin:0;color:#111;}
.klp-list{max-width:900px;margin:0 auto;}
.klp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:12px;color:#888;}
.klp-empty h3{font-size:18px;color:#111;margin:8px 0 0;}
.klp-empty p{font-size:14px;color:#888;margin:0 0 16px;}
.klp-empty-icon{color:#C0C0C0;}
.klp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;padding:24px 32px;}

/* ─── Page Card ─── */
.klp-page-card{background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;overflow:hidden;transition:border-color .2s;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);}
.klp-page-card:hover{border-color:rgba(0,0,0,0.12);}
.klp-page-card-top{display:flex;align-items:flex-start;justify-content:space-between;padding:16px 16px 0;}
.klp-page-card-info{flex:1;min-width:0;}
.klp-page-card-name{font-size:15px;font-weight:700;margin:0 0 4px;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.klp-page-card-slug{display:flex;align-items:center;gap:4px;font-size:12px;color:#888;direction:ltr;text-align:left;}
.klp-page-card-meta{display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:12px;color:#999;}
.klp-page-card-date{font-size:12px;}
.klp-page-card-subs{display:flex;align-items:center;gap:4px;}
.klp-page-card-actions{display:flex;align-items:center;gap:4px;padding:12px 16px;border-top:1px solid #F0F0F0;}

/* Status Badge */
.klp-status{font-size:11px;font-weight:600;padding:3px 10px;border-radius:9999px;background:#F0F0F0;color:#888;}
.klp-status-live{background:#E6F9EE;color:#12B76A;}

/* Mini Preview */
.klp-mini-preview{padding:12px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;background:#F8F8F8;margin:12px 16px;border-radius:10px;min-height:100px;}
.klp-mini-dark{background:#1A1A1A;}
.klp-mini-img{width:60px;height:60px;object-fit:cover;border-radius:8px;}
.klp-mini-img-placeholder{width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:#E0E0E0;border-radius:8px;color:#BBB;}
.klp-mini-headline{font-size:13px;font-weight:700;color:#111;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
.klp-mini-dark .klp-mini-headline{color:#EAEAEA;}
.klp-mini-dark .klp-mini-img-placeholder{background:#333;}

/* ─── Buttons ─── */
.klp-btn-primary{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 20px;border:none;border-radius:10px;background:#111;color:#fff;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;}
.klp-btn-primary:hover{background:#333;}
.klp-btn-unpublish{background:#E82222;}
.klp-btn-unpublish:hover{background:#C41E1E;}
.klp-btn-ghost{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border:1px solid rgba(0,0,0,0.06);border-radius:10px;background:#fff;color:#111;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.klp-btn-ghost:hover{border-color:#BBB;background:#F8F8F8;}
.klp-btn-ghost.active{border-color:#111;background:#F3F4F6;color:#111;}
.klp-btn-icon{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid rgba(0,0,0,0.06);border-radius:8px;background:#fff;color:#888;cursor:pointer;transition:all .15s;}
.klp-btn-icon:hover{border-color:#BBB;color:#111;background:#F5F5F5;}
.klp-btn-danger:hover{border-color:#E82222;color:#E82222;background:#FEF2F2;}
.klp-btn-publish.active{border-color:#12B76A;color:#12B76A;background:#E6F9EE;}
.klp-btn-sm{font-family:inherit;font-size:12px;font-weight:600;padding:6px 14px;border:1px solid rgba(0,0,0,0.06);border-radius:8px;background:#fff;color:#555;cursor:pointer;}
.klp-btn-sm:hover{border-color:#BBB;}
.klp-btn-sm-danger{color:#E82222;border-color:#FECACA;}
.klp-btn-sm-danger:hover{background:#FEF2F2;border-color:#E82222;}

/* ─── Editor Layout ─── */
.klp-editor{display:flex;flex-direction:column;}
.klp-editor-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:#fff;border-bottom:1px solid rgba(0,0,0,0.06);gap:12px;flex-wrap:wrap;}
.klp-editor-topbar-actions{display:flex;align-items:center;gap:8px;}
.klp-editor-body{display:flex;flex:1;overflow:hidden;}
.klp-editor-form{width:420px;min-width:420px;padding:24px;overflow-y:auto;background:#fff;border-left:1px solid rgba(0,0,0,0.06);max-height:calc(100vh - 65px);}
.klp-preview-container{flex:1;padding:24px;overflow-y:auto;display:flex;flex-direction:column;align-items:center;gap:12px;max-height:calc(100vh - 65px);}
.klp-preview-full{width:100%;}
.klp-preview-label{font-size:12px;font-weight:600;color:#999;}

/* ─── Form Fields ─── */
.klp-field{margin-bottom:20px;}
.klp-field-row{display:flex;align-items:center;justify-content:space-between;}
.klp-label{display:block;font-size:13px;font-weight:700;color:#555;margin-bottom:6px;}
.klp-required{color:#E82222;}
.klp-input{display:block;width:100%;height:42px;padding:0 14px;border:1px solid rgba(0,0,0,0.06);border-radius:10px;font-family:inherit;font-size:14px;color:#111;background:#fff;outline:none;direction:rtl;box-sizing:border-box;}
.klp-input:focus{border-color:#111;}
.klp-textarea{display:block;width:100%;padding:12px 14px;border:1px solid rgba(0,0,0,0.06);border-radius:10px;font-family:inherit;font-size:14px;color:#111;background:#fff;outline:none;resize:vertical;direction:rtl;line-height:1.6;box-sizing:border-box;}
.klp-textarea:focus{border-color:#111;}
.klp-slug-input{display:flex;align-items:center;border:1px solid rgba(0,0,0,0.06);border-radius:10px;overflow:hidden;direction:ltr;}
.klp-slug-input:focus-within{border-color:#111;}
.klp-slug-prefix{padding:0 12px;font-size:13px;color:#999;background:#F8F8F8;height:42px;display:flex;align-items:center;white-space:nowrap;border-left:1px solid rgba(0,0,0,0.06);}
.klp-slug-field{border:none !important;border-radius:0 !important;height:42px;flex:1;direction:ltr;text-align:left;}
.klp-slug-field:focus{border:none !important;}
.klp-divider{height:1px;background:#E8E8E8;margin:24px 0;}
.klp-section-title{font-size:15px;font-weight:700;color:#111;margin:0 0 16px;}

/* Image Upload */
.klp-upload-area{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;width:100%;height:120px;border:2px dashed #D9D9D9;border-radius:12px;background:#FAFAFA;color:#999;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.klp-upload-area:hover{border-color:#111;color:#111;background:#F3F4F6;}
.klp-image-preview{position:relative;border-radius:12px;overflow:hidden;border:1px solid rgba(0,0,0,0.06);}
.klp-image-preview-frame{overflow:hidden;height:160px;}
.klp-image-preview-frame img{width:100%;height:100%;object-fit:cover;display:block;}
.klp-image-controls{padding:10px 12px;background:#FAFAFA;border-top:1px solid #F0F0F0;display:flex;flex-direction:column;gap:8px;}
.klp-image-zoom-row{display:flex;align-items:center;justify-content:center;gap:12px;}
.klp-zoom-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid rgba(0,0,0,0.08);border-radius:8px;background:#fff;color:#555;cursor:pointer;transition:all .15s;}
.klp-zoom-btn:hover{border-color:#999;color:#111;background:#F0F0F0;}
.klp-zoom-label{font-size:12px;font-weight:700;color:#555;min-width:40px;text-align:center;}
.klp-image-position-row{display:flex;align-items:center;gap:10px;}
.klp-position-label{font-size:11px;font-weight:600;color:#888;white-space:nowrap;}
.klp-position-slider{flex:1;height:4px;-webkit-appearance:none;appearance:none;background:#E0E0E0;border-radius:2px;outline:none;cursor:pointer;}
.klp-position-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#111;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.klp-position-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#111;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.klp-image-actions{display:flex;gap:8px;padding:10px;background:#F8F8F8;}

/* Radio / Toggle */
.klp-radio-group{display:flex;gap:8px;}
.klp-radio-btn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border:1px solid rgba(0,0,0,0.06);border-radius:9999px;background:#fff;font-family:inherit;font-size:13px;font-weight:600;color:#666;cursor:pointer;transition:all .15s;}
.klp-radio-btn:hover{border-color:#BBB;}
.klp-radio-btn.active{border-color:#111;background:#F3F4F6;color:#111;}
.klp-color-picker{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.klp-color-swatch{width:30px;height:30px;border-radius:50%;border:2.5px solid transparent;cursor:pointer;transition:transform .15s;}
.klp-color-swatch:hover{transform:scale(1.15);}
.klp-color-swatch.active{border-color:#111;box-shadow:0 0 0 2px #fff inset;}
.klp-color-custom{width:30px;height:30px;border-radius:50%;border:2px dashed #D9D9D9;cursor:pointer;padding:0;background:none;}
.klp-toggle{position:relative;width:44px;height:24px;border-radius:12px;border:none;background:#D9D9D9;cursor:pointer;transition:background .2s;flex-shrink:0;}
.klp-toggle.active{background:#111;}
.klp-toggle-dot{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15);}
.klp-toggle.active .klp-toggle-dot{transform:translateX(-20px);}

/* ─── Landing Page Preview ─── */
.klp-page{display:flex;align-items:center;justify-content:center;min-height:500px;padding:40px 20px;border-radius:14px;width:100%;max-width:600px;}
.klp-page-card{width:100%;max-width:440px;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);padding:24px;}
.klp-page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.klp-page-creator{display:flex;align-items:center;gap:8px;}
.klp-page-avatar{width:32px;height:32px;border-radius:50%;object-fit:cover;}
.klp-page-avatar-placeholder{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;}
.klp-page-image{margin-bottom:20px;border-radius:10px;overflow:hidden;height:200px;}
.klp-page-image img{width:100%;height:100%;object-fit:cover;display:block;}
.klp-page-image-empty{height:160px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#BBB;margin-bottom:20px;}
.klp-page-content{margin-bottom:20px;text-align:right;}
.klp-page-headline{font-size:22px;font-weight:700;margin:0 0 8px;line-height:1.4;}
.klp-page-desc{font-size:14px;margin:0;line-height:1.7;}
.klp-page-social-proof{display:flex;align-items:center;gap:6px;font-size:13px;margin-top:12px;}
.klp-page-form{display:flex;flex-direction:column;gap:10px;}
.klp-page-input{height:46px;padding:0 14px;border:1.5px solid;border-radius:10px;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;font-size:14px;outline:none;direction:rtl;width:100%;box-sizing:border-box;}
.klp-page-input:focus{border-color:#0000FF !important;}
.klp-page-input::placeholder{color:#AAA;}
.klp-page-submit{height:48px;border:none;border-radius:10px;color:#fff;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s;width:100%;}
.klp-page-submit:hover{opacity:.9;}
.klp-page-submit:disabled{opacity:.7;cursor:default;}
.klp-page-success{color:#fff;}

/* ─── Responsive ─── */
@media(max-width:900px){
  .klp-editor-body{flex-direction:column;}
  .klp-editor-form{width:100%;min-width:unset;max-height:unset;border-left:none;border-bottom:1px solid rgba(0,0,0,0.06);}
  .klp-preview-container{max-height:unset;}
  .klp-grid{grid-template-columns:1fr;padding:16px;}
  .klp-header{margin-bottom:16px;}
}
`;
