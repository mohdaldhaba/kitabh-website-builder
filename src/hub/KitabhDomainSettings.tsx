// ═══════════════════════════════════════════════════════
//  Kitabh Domain Settings
//  Manage subdomain (newsletter.kitabh.com)
//  Custom domain: greyed out "قريبا" (coming soon)
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────
interface Newsletter {
  id: string;
  name: string;
}

interface NewsletterSubdomain {
  newsletterId: string;
  subdomain: string;
  isPublished: boolean;
}

interface DomainState {
  assignments: NewsletterSubdomain[];
  customDomain: string; // stored but not active yet
}

// ─── Mock newsletters (replace with API data from user's MongoDB) ────
const MOCK_NEWSLETTERS: Newsletter[] = [
  { id: "nl_1", name: "نشرة التقنية" },
  { id: "nl_2", name: "نشرة الكتب" },
  { id: "nl_3", name: "نشرة الأعمال" },
];

// ─── Helpers ────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── SVG Icons ──────────────────────────────────────────
const Icons = {
  chevron: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  globe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
};

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function KitabhDomainSettings() {
  // TODO: Replace MOCK_NEWSLETTERS with real data from GET /api/user/newsletters
  const [newsletters] = useState<Newsletter[]>(MOCK_NEWSLETTERS);
  const [domain, setDomain] = useState<DomainState>({
    assignments: [],
    customDomain: "",
  });
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<string>("");
  const [editingNewsletterId, setEditingNewsletterId] = useState<string | null>(null);
  const [draftSubdomain, setDraftSubdomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ─── Load/Save localStorage (replace with API) ────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kb_domain_settings_v2");
      if (saved) setDomain(JSON.parse(saved));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kb_domain_settings_v2", JSON.stringify(domain));
    } catch (_) {}
  }, [domain]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = () => setDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

  // ─── Helpers ────────
  const getAssignment = (nlId: string) => domain.assignments.find(a => a.newsletterId === nlId);
  const getNewsletter = (nlId: string) => newsletters.find(n => n.id === nlId);

  // Newsletters that don't have a subdomain yet
  const unassignedNewsletters = newsletters.filter(nl => !getAssignment(nl.id));

  const handleSave = useCallback(() => {
    if (!selectedNewsletterId && !editingNewsletterId) return;
    const targetId = editingNewsletterId || selectedNewsletterId;
    const clean = slugify(draftSubdomain);
    if (!clean) { setError("أدخل اسم صالح للنطاق الفرعي"); return; }
    if (clean.length < 3) { setError("يجب أن يكون ٣ أحرف على الأقل"); return; }
    // Check if subdomain is already used by another newsletter
    const existing = domain.assignments.find(a => a.subdomain === clean && a.newsletterId !== targetId);
    if (existing) { setError("هذا النطاق الفرعي مستخدم بالفعل لنشرة أخرى"); return; }
    // TODO: API call to check availability + save
    setSaving(true);
    setTimeout(() => {
      const updated = domain.assignments.filter(a => a.newsletterId !== targetId);
      updated.push({ newsletterId: targetId, subdomain: clean, isPublished: true });
      setDomain({ ...domain, assignments: updated });
      setEditingNewsletterId(null);
      setSelectedNewsletterId("");
      setDraftSubdomain("");
      setSaving(false);
      setError("");
    }, 600);
  }, [draftSubdomain, domain, selectedNewsletterId, editingNewsletterId]);

  const handleCopy = useCallback((nlId: string, subdomain: string) => {
    const url = `https://${subdomain}.kitabh.com`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(nlId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const startEditing = (nlId: string) => {
    const assignment = getAssignment(nlId);
    setEditingNewsletterId(nlId);
    setDraftSubdomain(assignment?.subdomain || "");
    setError("");
  };

  const cancelEditing = () => {
    setEditingNewsletterId(null);
    setSelectedNewsletterId("");
    setDraftSubdomain("");
    setError("");
  };

  const startNewAssignment = (nlId: string) => {
    setSelectedNewsletterId(nlId);
    setEditingNewsletterId(null);
    setDraftSubdomain("");
    setError("");
    setDropdownOpen(false);
  };

  return (
    <>
      <style>{CSS_STYLES}</style>
      <div className="kds">
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: '0 0 6px' }}>إعدادات النطاق</h1>
            <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'IBM Plex Sans Arabic, sans-serif', margin: 0 }}>أدر النطاقات الفرعية والنطاقات الخاصة لنشراتك</p>
          </div>
        </div>

        {/* Section 1: Subdomain per Newsletter */}
        <div className="kds-section">
          <div className="kds-section-header">
            <h2 className="kds-section-title">النطاقات الفرعية</h2>
          </div>
          <p className="kds-section-desc">حدد نطاقا فرعيا لكل نشرة من نشراتك، وسيكون هو الرابط الذي يصل منه المشتركون إلى نشرتك</p>

          {/* Assigned newsletters */}
          {domain.assignments.map((assignment) => {
            const nl = getNewsletter(assignment.newsletterId);
            if (!nl) return null;
            const isEditing = editingNewsletterId === assignment.newsletterId;
            const fullUrl = `https://${assignment.subdomain}.kitabh.com`;

            if (isEditing) {
              return (
                <div key={assignment.newsletterId} className="kds-edit-card" style={{ marginBottom: 12 }}>
                  <div className="kds-edit-nl-name">{nl.name}</div>
                  <label className="kds-label">تعديل النطاق الفرعي</label>
                  <div className="kds-subdomain-input">
                    <input
                      type="text"
                      value={draftSubdomain}
                      onChange={(e) => { setDraftSubdomain(slugify(e.target.value)); setError(""); }}
                      placeholder="اسمك"
                      className="kds-input"
                      dir="ltr"
                      autoFocus
                    />
                    <span className="kds-subdomain-suffix">.kitabh.com</span>
                  </div>
                  {draftSubdomain && (
                    <div className="kds-preview-url" dir="ltr">
                      https://{draftSubdomain}.kitabh.com
                    </div>
                  )}
                  {error && <div className="kds-error">{error}</div>}
                  <div className="kds-edit-actions">
                    <button className="kds-btn-outline" onClick={cancelEditing}>إلغاء</button>
                    <button className="kds-btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? "جاري الحفظ..." : "حفظ"}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={assignment.newsletterId} className="kds-info-card" style={{ marginBottom: 12 }}>
                <div className="kds-info-row">
                  <span className="kds-info-label">النشرة</span>
                  <span className="kds-info-nl-name">{nl.name}</span>
                </div>
                <div className="kds-info-row">
                  <span className="kds-info-label">الرابط</span>
                  <div className="kds-info-value-row">
                    <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="kds-url" dir="ltr">
                      {fullUrl}
                    </a>
                    <button className="kds-btn-icon-sm" onClick={() => handleCopy(assignment.newsletterId, assignment.subdomain)} title="نسخ الرابط">
                      {copiedId === assignment.newsletterId ? Icons.check : Icons.copy}
                    </button>
                  </div>
                </div>
                <div className="kds-info-row">
                  <span className="kds-info-label">الحالة</span>
                  <div className="kds-info-value-row">
                    <span className={`kds-status ${assignment.isPublished ? "kds-status-live" : ""}`}>
                      {assignment.isPublished ? "منشور" : "غير منشور"}
                    </span>
                    <button className="kds-btn-ghost-sm" onClick={() => startEditing(assignment.newsletterId)} style={{ marginRight: "auto" }}>
                      {Icons.edit}
                      <span>تعديل</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* New assignment form (when a newsletter is selected) */}
          {selectedNewsletterId && !editingNewsletterId && (
            <div className="kds-edit-card" style={{ marginBottom: 12 }}>
              <div className="kds-edit-nl-name">{getNewsletter(selectedNewsletterId)?.name}</div>
              <label className="kds-label">اختر اسم النطاق الفرعي</label>
              <div className="kds-subdomain-input">
                <input
                  type="text"
                  value={draftSubdomain}
                  onChange={(e) => { setDraftSubdomain(slugify(e.target.value)); setError(""); }}
                  placeholder="اسمك"
                  className="kds-input"
                  dir="ltr"
                  autoFocus
                />
                <span className="kds-subdomain-suffix">.kitabh.com</span>
              </div>
              {draftSubdomain && (
                <div className="kds-preview-url" dir="ltr">
                  https://{draftSubdomain}.kitabh.com
                </div>
              )}
              {error && <div className="kds-error">{error}</div>}
              <div className="kds-edit-actions">
                <button className="kds-btn-outline" onClick={cancelEditing}>إلغاء</button>
                <button className="kds-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </div>
          )}

          {/* Add subdomain button — dropdown of unassigned newsletters */}
          {unassignedNewsletters.length > 0 && !selectedNewsletterId && !editingNewsletterId && (
            <div className="kds-add-wrapper">
              <div className="kds-dropdown-container" onClick={(e) => e.stopPropagation()}>
                <button className="kds-btn-primary" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {Icons.globe}
                  <span>إضافة نطاق فرعي</span>
                  {Icons.chevron}
                </button>
                {dropdownOpen && (
                  <div className="kds-dropdown">
                    {unassignedNewsletters.map(nl => (
                      <button key={nl.id} className="kds-dropdown-item" onClick={() => startNewAssignment(nl.id)}>
                        {nl.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {domain.assignments.length === 0 && (
                <p className="kds-hint-text">اختر نشرة لتعيين نطاق فرعي لها — مثال: <strong dir="ltr">newsletter.kitabh.com</strong></p>
              )}
            </div>
          )}

          {/* All newsletters assigned */}
          {unassignedNewsletters.length === 0 && !selectedNewsletterId && !editingNewsletterId && domain.assignments.length > 0 && (
            <p className="kds-hint-text" style={{ marginTop: 8 }}>تم تعيين نطاق فرعي لجميع النشرات</p>
          )}
        </div>

        <div className="kds-divider" />

        {/* Section 2: Custom Domain — LOCKED / Coming Soon */}
        <div className="kds-section kds-section-locked">
          <div className="kds-section-header">
            <h2 className="kds-section-title kds-locked-title">نطاق خاص بك</h2>
            <span className="kds-soon-badge">قريبا</span>
          </div>
          <p className="kds-section-desc kds-locked-text">اربط نطاقك الخاص بنشرتك — مثال: yourcompany.com</p>

          <div className="kds-locked-card">
            <div className="kds-locked-field">
              <label className="kds-label kds-locked-text">النطاق</label>
              <div className="kds-locked-input-row">
                <input
                  type="text"
                  placeholder="yourdomain.com"
                  className="kds-input kds-input-locked"
                  disabled
                  dir="ltr"
                />
                <button className="kds-btn-locked" disabled>
                  {Icons.lock}
                  <span>ربط</span>
                </button>
              </div>
              <p className="kds-locked-hint">يتطلب إعداد DNS — متاح في الباقة المدفوعة</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const CSS_STYLES = `
/* Base */
.kds{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;direction:rtl;text-align:right;color:#111;line-height:1.6;width:100%;max-width:900px;margin:0 auto;padding:0 24px 60px;}

/* Page Header */
.kds-page-header{padding:28px 0 8px;}
.kds-page-title{font-size:24px;font-weight:700;margin:0;color:#111;}

/* Section */
.kds-section{padding:24px 0;}
.kds-section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
.kds-section-title{font-size:17px;font-weight:700;margin:0;color:#111;}
.kds-section-desc{font-size:14px;color:#888;margin:0 0 16px;line-height:1.6;}
.kds-divider{height:1px;background:#E8E8E8;}

/* Locked Section */
.kds-section-locked{opacity:1;}
.kds-locked-title{color:#BBB;}
.kds-locked-text{color:#CCC !important;}
.kds-soon-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:9999px;background:#F0F0F0;color:#999;}

/* Setup Card (no subdomain yet) */
.kds-setup-card{display:flex;align-items:center;gap:16px;padding:20px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);}
.kds-setup-icon{color:#999;}
.kds-setup-text{flex:1;}
.kds-setup-text h3{font-size:15px;font-weight:700;margin:0 0 2px;color:#111;}
.kds-setup-text p{font-size:13px;color:#888;margin:0;}
.kds-setup-text strong{color:#111;}

/* Info Card (subdomain is set) */
.kds-info-card{background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:4px 0;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);}
.kds-info-row{display:flex;align-items:center;padding:12px 20px;gap:16px;}
.kds-info-row+.kds-info-row{border-top:1px solid #F0F0F0;}
.kds-info-label{font-size:13px;font-weight:600;color:#999;min-width:60px;}
.kds-info-value-row{display:flex;align-items:center;gap:8px;flex:1;}
.kds-url{font-size:14px;font-weight:500;color:#111;text-decoration:none;direction:ltr;}
.kds-url:hover{text-decoration:underline;}

/* Status */
.kds-status{font-size:12px;font-weight:600;padding:3px 12px;border-radius:9999px;background:#F0F0F0;color:#888;}
.kds-status-live{background:#E6F9EE;color:#12B76A;}

/* Edit Card */
.kds-edit-card{background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);}
.kds-label{display:block;font-size:13px;font-weight:700;color:#555;margin-bottom:8px;}
.kds-subdomain-input{display:flex;align-items:center;border:1px solid rgba(0,0,0,0.06);border-radius:10px;overflow:hidden;background:#fff;direction:ltr;}
.kds-subdomain-input:focus-within{border-color:#111;}
.kds-subdomain-suffix{padding:0 14px;font-size:14px;font-weight:500;color:#999;background:#F8F8F8;height:44px;display:flex;align-items:center;white-space:nowrap;border-left:1px solid rgba(0,0,0,0.06);user-select:none;}
.kds-input{flex:1;height:44px;padding:0 14px;border:none;outline:none;font-family:inherit;font-size:15px;color:#111;background:transparent;direction:ltr;text-align:left;}
.kds-input::placeholder{color:#CCC;}
.kds-preview-url{margin-top:8px;font-size:13px;color:#111;font-weight:500;}
.kds-error{margin-top:6px;font-size:12px;color:#E82222;font-weight:500;}
.kds-edit-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:16px;}

/* Locked Card */
.kds-locked-card{background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);}
.kds-locked-field{}
.kds-locked-input-row{display:flex;align-items:center;gap:8px;}
.kds-input-locked{flex:1;height:42px;padding:0 14px;border:1px solid rgba(0,0,0,0.06);border-radius:10px;font-family:inherit;font-size:14px;color:#CCC;background:#F8F8F8;direction:ltr;text-align:left;cursor:not-allowed;}
.kds-input-locked::placeholder{color:#D9D9D9;}
.kds-btn-locked{display:inline-flex;align-items:center;gap:6px;height:42px;padding:0 18px;border:none;border-radius:10px;background:#E0E0E0;color:#AAA;font-family:inherit;font-size:13px;font-weight:600;cursor:not-allowed;white-space:nowrap;}
.kds-locked-hint{font-size:12px;color:#CCC;margin:8px 0 0;}

/* Newsletter name in edit card */
.kds-edit-nl-name{font-size:15px;font-weight:700;color:#111;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #F0F0F0;}
.kds-info-nl-name{font-size:14px;font-weight:600;color:#111;}

/* Add wrapper */
.kds-add-wrapper{margin-top:4px;}
.kds-hint-text{font-size:13px;color:#999;margin:10px 0 0;}
.kds-hint-text strong{color:#111;}

/* Dropdown */
.kds-dropdown-container{position:relative;display:inline-block;}
.kds-dropdown{position:absolute;top:calc(100% + 6px);right:0;min-width:220px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);z-index:100;padding:6px;}
.kds-dropdown-item{display:block;width:100%;padding:10px 14px;border:none;background:none;font-family:inherit;font-size:14px;font-weight:500;color:#111;text-align:right;cursor:pointer;border-radius:7px;transition:background .15s;}
.kds-dropdown-item:hover{background:#F5F5F5;}

/* Buttons */
.kds-btn-primary{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 20px;border:none;border-radius:10px;background:#111;color:#fff;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;white-space:nowrap;}
.kds-btn-primary:hover{background:#333;}
.kds-btn-primary:disabled{background:#999;cursor:default;}
.kds-btn-outline{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 16px;border:1px solid rgba(0,0,0,0.06);border-radius:10px;background:#fff;color:#111;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
.kds-btn-outline:hover{border-color:#BBB;background:#F8F8F8;}
.kds-btn-ghost-sm{display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 10px;border:none;background:none;font-family:inherit;font-size:12px;font-weight:600;color:#888;cursor:pointer;border-radius:7px;}
.kds-btn-ghost-sm:hover{background:#F0F0F0;color:#111;}
.kds-btn-icon-sm{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid rgba(0,0,0,0.06);border-radius:8px;background:#fff;color:#888;cursor:pointer;transition:all .15s;padding:0;}
.kds-btn-icon-sm:hover{border-color:#BBB;color:#111;background:#F5F5F5;}

/* Responsive */
@media(max-width:600px){
  .kds{padding:0 16px 40px;}
  .kds-setup-card{flex-direction:column;text-align:center;}
  .kds-locked-input-row{flex-direction:column;}
  .kds-input-locked{width:100%;}
}
`;
