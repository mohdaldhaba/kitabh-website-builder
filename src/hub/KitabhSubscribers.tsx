// ═══════════════════════════════════════════════════════
//  Kitabh Subscribers Management
//  Full CRUD: list, add (single + CSV), edit, delete, search,
//  filter by status, tags, bulk actions, export
//  All Arabic UI, Kitabh branding
// ═══════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────
type SubStatus = "active" | "unsubscribed" | "unconfirmed" | "bounced";

interface Subscriber {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: SubStatus;
  tags: string[];
  notes: string;
  source: string; // "manual" | "csv" | "landing_page" | "api"
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ────────────────────────────────────────────
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_MAP: Record<SubStatus, { label: string; color: string; bg: string }> = {
  active: { label: "نشط", color: "#12B76A", bg: "#E6F9EE" },
  unsubscribed: { label: "ملغي", color: "#E82222", bg: "#FEF2F2" },
  unconfirmed: { label: "غير مؤكد", color: "#DFB300", bg: "#FFF8E0" },
  bounced: { label: "مرتد", color: "#E82222", bg: "#FEF2F2" },
};

// ─── SVG Icons ──────────────────────────────────────────
const Icons = {
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chevDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  chevUp: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  tag: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  code: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  fields: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
};

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function KitabhSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SubStatus | "all">("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<"add" | "edit" | "csv" | null>(null);
  const [editingSub, setEditingSub] = useState<Subscriber | null>(null);
  const [bulkBarVisible, setBulkBarVisible] = useState(false);
  const [segmentsOpen, setSegmentsOpen] = useState(false);
  const [tagsFilterOpen, setTagsFilterOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(["email", "name", "status", "tags", "date"]));

  // ─── Load/Save localStorage (replace with API) ────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kb_subscribers");
      if (saved) setSubscribers(JSON.parse(saved));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kb_subscribers", JSON.stringify(subscribers));
    } catch (_) {}
  }, [subscribers]);

  // ─── Show/hide bulk bar ───────────────────────────────
  useEffect(() => {
    setBulkBarVisible(selectedIds.size > 0);
  }, [selectedIds]);

  // ─── Filtered list ────────────────────────────────────
  const filtered = useMemo(() => {
    let list = subscribers;
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (tagFilter) {
      list = list.filter((s) => s.tags.includes(tagFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [subscribers, statusFilter, tagFilter, searchQuery]);

  // ─── All unique tags ──────────────────────────────────
  const allTags = useMemo(() => {
    const set = new Set<string>();
    subscribers.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [subscribers]);

  // ─── CRUD ─────────────────────────────────────────────
  const addSubscriber = useCallback((data: Omit<Subscriber, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setSubscribers((prev) => [{ ...data, id: genId(), createdAt: now, updatedAt: now }, ...prev]);
  }, []);

  const updateSubscriber = useCallback((id: string, updates: Partial<Subscriber>) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
  }, []);

  const deleteSubscriber = useCallback((id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const bulkDelete = useCallback(() => {
    if (!confirm(`هل تريد حذف ${selectedIds.size} مشترك؟`)) return;
    setSubscribers((prev) => prev.filter((s) => !selectedIds.has(s.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const bulkTag = useCallback((tag: string) => {
    setSubscribers((prev) =>
      prev.map((s) =>
        selectedIds.has(s.id) && !s.tags.includes(tag)
          ? { ...s, tags: [...s.tags, tag], updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, [selectedIds]);

  // ─── Select all / none ────────────────────────────────
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  }, [filtered, selectedIds]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ─── CSV Import ───────────────────────────────────────
  const importCSV = useCallback((text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return 0;
    const header = lines[0].toLowerCase();
    const emailIdx = header.split(",").findIndex((h) => h.trim().includes("email"));
    if (emailIdx === -1) return 0;
    const nameIdx = header.split(",").findIndex((h) => h.trim().includes("name") || h.trim().includes("اسم"));

    let count = 0;
    const now = new Date().toISOString();
    const newSubs: Subscriber[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const email = cols[emailIdx]?.toLowerCase();
      if (!email || !isValidEmail(email)) continue;
      if (subscribers.some((s) => s.email === email)) continue;

      newSubs.push({
        id: genId(),
        email,
        firstName: nameIdx >= 0 ? cols[nameIdx] || "" : "",
        lastName: "",
        status: "active",
        tags: [],
        notes: "",
        source: "csv",
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }

    if (newSubs.length > 0) {
      setSubscribers((prev) => [...newSubs, ...prev]);
    }
    return count;
  }, [subscribers]);

  // ─── CSV Export ───────────────────────────────────────
  const exportCSV = useCallback(() => {
    const rows = [["Email", "First Name", "Last Name", "Status", "Tags", "Created At"]];
    const list = selectedIds.size > 0 ? filtered.filter((s) => selectedIds.has(s.id)) : filtered;
    list.forEach((s) => {
      rows.push([s.email, s.firstName, s.lastName, s.status, s.tags.join(";"), s.createdAt]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kitabh-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered, selectedIds]);

  return (
    <>
      <style>{CSS_STYLES}</style>
      <div className="ksm">
        {/* Header */}
        <div className="ksm-header">
          <div className="ksm-header-right">
            <h1 className="ksm-title">إدارة مشتركي النشرة</h1>
            <span className="ksm-count">{subscribers.length}</span>
          </div>
          <div className="ksm-header-left">
            {/* Status Filter */}
            <div className="ksm-dropdown-wrap">
              <button
                className="ksm-btn-outline"
                onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setAddDropdownOpen(false); }}
              >
                <span>الحالة</span>
                {statusDropdownOpen ? Icons.chevUp : Icons.chevDown}
              </button>
              {statusDropdownOpen && (
                <div className="ksm-dropdown">
                  {([["all", "الكل"], ["active", "نشط"], ["unsubscribed", "ملغي"], ["bounced", "العناوين المرتدة"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      className={`ksm-dropdown-item ${statusFilter === val ? "active" : ""}`}
                      onClick={() => { setStatusFilter(val); setStatusDropdownOpen(false); }}
                    >
                      <span>{label}</span>
                      {statusFilter === val && Icons.check}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Subscriber */}
            <div className="ksm-dropdown-wrap">
              <button
                className="ksm-btn-primary"
                onClick={() => { setAddDropdownOpen(!addDropdownOpen); setStatusDropdownOpen(false); }}
              >
                {Icons.plus}
                <span>مشترك جديد</span>
                {addDropdownOpen ? Icons.chevUp : Icons.chevDown}
              </button>
              {addDropdownOpen && (
                <div className="ksm-dropdown">
                  <button className="ksm-dropdown-item" onClick={() => { setModal("add"); setAddDropdownOpen(false); }}>
                    {Icons.user}
                    <span>إضافة مشترك</span>
                  </button>
                  <button className="ksm-dropdown-item" onClick={() => { setModal("csv"); setAddDropdownOpen(false); }}>
                    {Icons.upload}
                    <span>استيراد من CSV</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ksm-toolbar">
          <div className="ksm-toolbar-right">
            {/* Segments: filter by status group */}
            <div className="ksm-dropdown-wrap">
              <button
                className={`ksm-btn-outline ksm-btn-sm ${segmentsOpen ? "active" : ""}`}
                onClick={() => { setSegmentsOpen(!segmentsOpen); setTagsFilterOpen(false); setFieldsOpen(false); }}
              >
                {Icons.users}
                <span>تصفية بالحالة</span>
              </button>
              {segmentsOpen && (
                <div className="ksm-dropdown">
                  <div className="ksm-dropdown-title">تصفية حسب حالة المشترك</div>
                  {([["all", "جميع المشتركين"], ["active", "نشط — مشتركين فعّالين"], ["unsubscribed", "ملغي — ألغوا اشتراكهم"], ["bounced", "العناوين المرتدة — عناوين بريد غير صالحة"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      className={`ksm-dropdown-item ${statusFilter === val ? "active" : ""}`}
                      onClick={() => { setStatusFilter(val); setSegmentsOpen(false); }}
                    >
                      <span>{label}</span>
                      {statusFilter === val && Icons.check}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags: filter by tag */}
            <div className="ksm-dropdown-wrap">
              <button
                className={`ksm-btn-outline ksm-btn-sm ${tagsFilterOpen ? "active" : ""} ${tagFilter ? "ksm-btn-filtered" : ""}`}
                onClick={() => { setTagsFilterOpen(!tagsFilterOpen); setSegmentsOpen(false); setFieldsOpen(false); }}
              >
                {Icons.tag}
                <span>{tagFilter ? `وسم: ${tagFilter}` : "تصفية بالوسم"}</span>
              </button>
              {tagsFilterOpen && (
                <div className="ksm-dropdown">
                  <div className="ksm-dropdown-title">عرض المشتركين حسب الوسم</div>
                  <button
                    className={`ksm-dropdown-item ${!tagFilter ? "active" : ""}`}
                    onClick={() => { setTagFilter(null); setTagsFilterOpen(false); }}
                  >
                    <span>الكل — بدون تصفية</span>
                    {!tagFilter && Icons.check}
                  </button>
                  {allTags.length > 0 ? (
                    allTags.map((t) => (
                      <button
                        key={t}
                        className={`ksm-dropdown-item ${tagFilter === t ? "active" : ""}`}
                        onClick={() => { setTagFilter(t); setTagsFilterOpen(false); }}
                      >
                        <span>{t}</span>
                        {tagFilter === t && Icons.check}
                      </button>
                    ))
                  ) : (
                    <div className="ksm-dropdown-empty">لا توجد وسوم بعد</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="ksm-toolbar-left">
            <button className="ksm-btn-icon" onClick={exportCSV} title="تصدير CSV">
              {Icons.download}
            </button>

            {/* Fields: toggle visible columns */}
            <div className="ksm-dropdown-wrap">
              <button
                className={`ksm-btn-outline ksm-btn-sm ${fieldsOpen ? "active" : ""}`}
                onClick={() => { setFieldsOpen(!fieldsOpen); setSegmentsOpen(false); setTagsFilterOpen(false); }}
              >
                {Icons.fields}
                <span>الأعمدة</span>
              </button>
              {fieldsOpen && (
                <div className="ksm-dropdown">
                  <div className="ksm-dropdown-title">إظهار أو إخفاء أعمدة الجدول</div>
                  {([["email", "البريد الالكتروني"], ["name", "الاسم"], ["status", "الحالة"], ["tags", "الوسوم"], ["date", "تاريخ الإضافة"]] as const).map(([col, label]) => (
                    <button
                      key={col}
                      className={`ksm-dropdown-item ${visibleColumns.has(col) ? "active" : ""}`}
                      onClick={() => {
                        setVisibleColumns((prev) => {
                          const next = new Set(prev);
                          if (col === "email") return next; // email always visible
                          if (next.has(col)) next.delete(col);
                          else next.add(col);
                          return next;
                        });
                      }}
                    >
                      <span>{label}</span>
                      {visibleColumns.has(col) && Icons.check}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {searchOpen ? (
              <div className="ksm-search-bar">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث بالبريد أو الاسم..."
                  className="ksm-search-input"
                  autoFocus
                />
                <button className="ksm-search-close" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                  {Icons.x}
                </button>
              </div>
            ) : (
              <button className="ksm-btn-outline ksm-btn-sm" onClick={() => setSearchOpen(true)}>
                {Icons.search}
                <span>بحث</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="ksm-table-wrap">
          <table className="ksm-table">
            <thead>
              <tr>
                <th className="ksm-th-check">
                  <button
                    className={`ksm-checkbox ${selectedIds.size === filtered.length && filtered.length > 0 ? "checked" : ""}`}
                    onClick={toggleSelectAll}
                  >
                    {selectedIds.size === filtered.length && filtered.length > 0 && Icons.check}
                  </button>
                </th>
                {visibleColumns.has("email") && <th>البريد الالكتروني</th>}
                {visibleColumns.has("name") && <th>الاسم</th>}
                {visibleColumns.has("status") && <th>الحالة</th>}
                {visibleColumns.has("tags") && <th>الوسوم</th>}
                {visibleColumns.has("date") && <th>تاريخ الإضافة</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={1 + visibleColumns.size} className="ksm-empty-row">
                    {searchQuery || statusFilter !== "all" || tagFilter
                      ? "لا توجد نتائج مطابقة للتصفية"
                      : "لا يوجد مشتركين بعد — أضف أول مشترك من الزر أعلاه"}
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    className={`ksm-row ${selectedIds.has(sub.id) ? "selected" : ""}`}
                    onClick={() => { setEditingSub(sub); setModal("edit"); }}
                  >
                    <td className="ksm-td-check" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`ksm-checkbox ${selectedIds.has(sub.id) ? "checked" : ""}`}
                        onClick={() => toggleSelect(sub.id)}
                      >
                        {selectedIds.has(sub.id) && Icons.check}
                      </button>
                    </td>
                    {visibleColumns.has("email") && <td className="ksm-td-email">{sub.email}</td>}
                    {visibleColumns.has("name") && (
                      <td className="ksm-td-name">
                        {sub.firstName || sub.lastName
                          ? `${sub.firstName} ${sub.lastName}`.trim()
                          : <span className="ksm-muted">-</span>}
                      </td>
                    )}
                    {visibleColumns.has("status") && (
                      <td>
                        <span
                          className="ksm-status-badge"
                          style={{ color: STATUS_MAP[sub.status].color, background: STATUS_MAP[sub.status].bg }}
                        >
                          {STATUS_MAP[sub.status].label}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has("tags") && (
                      <td className="ksm-td-tags">
                        {sub.tags.length > 0
                          ? sub.tags.map((t) => <span key={t} className="ksm-tag">{t}</span>)
                          : <span className="ksm-muted">-</span>}
                      </td>
                    )}
                    {visibleColumns.has("date") && <td className="ksm-td-date">{formatDate(sub.createdAt)}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bulk Action Bar */}
        {bulkBarVisible && (
          <div className="ksm-bulk-bar">
            <span className="ksm-bulk-count">
              {selectedIds.size} من {filtered.length} محدد
            </span>
            <BulkTagButton allTags={allTags} onTag={bulkTag} />
            <button className="ksm-bulk-btn ksm-bulk-delete" onClick={bulkDelete}>
              {Icons.trash}
              <span>حذف</span>
            </button>
          </div>
        )}

        {/* Modals */}
        {modal === "add" && (
          <AddSubscriberModal
            onAdd={(data) => { addSubscriber(data); setModal(null); }}
            onClose={() => setModal(null)}
            existingEmails={subscribers.map((s) => s.email)}
            allTags={allTags}
          />
        )}

        {modal === "csv" && (
          <CSVImportModal
            onImport={(text) => { const n = importCSV(text); setModal(null); return n; }}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "edit" && editingSub && (
          <SubscriberDetailModal
            subscriber={editingSub}
            onUpdate={(updates) => { updateSubscriber(editingSub.id, updates); setEditingSub({ ...editingSub, ...updates }); }}
            onDelete={() => { deleteSubscriber(editingSub.id); setModal(null); setEditingSub(null); }}
            onClose={() => { setModal(null); setEditingSub(null); }}
            allTags={allTags}
          />
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
//  BULK TAG BUTTON
// ═══════════════════════════════════════════════════════
function BulkTagButton({ allTags, onTag }: { allTags: string[]; onTag: (tag: string) => void }) {
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  return (
    <div className="ksm-dropdown-wrap" style={{ position: "relative" }}>
      <button className="ksm-bulk-btn" onClick={() => setOpen(!open)}>
        {Icons.tag}
        <span>وسم</span>
      </button>
      {open && (
        <div className="ksm-dropdown" style={{ bottom: "100%", top: "auto", marginBottom: 8 }}>
          {allTags.map((t) => (
            <button key={t} className="ksm-dropdown-item" onClick={() => { onTag(t); setOpen(false); }}>
              {t}
            </button>
          ))}
          <div className="ksm-dropdown-divider" />
          <div className="ksm-dropdown-input-row">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="وسم جديد..."
              className="ksm-dropdown-input"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTag.trim()) {
                  onTag(newTag.trim());
                  setNewTag("");
                  setOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ADD SUBSCRIBER MODAL
// ═══════════════════════════════════════════════════════
interface AddModalProps {
  onAdd: (data: Omit<Subscriber, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
  existingEmails: string[];
  allTags: string[];
}

function AddSubscriberModal({ onAdd, onClose, existingEmails, allTags }: AddModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagDropdown, setTagDropdown] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) { setError("البريد الالكتروني مطلوب"); return; }
    if (!isValidEmail(email)) { setError("البريد الالكتروني غير صحيح"); return; }
    if (existingEmails.includes(email.toLowerCase())) { setError("هذا البريد مسجل مسبقا"); return; }
    onAdd({
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      status: "active",
      tags,
      notes: notes.trim(),
      source: "manual",
    });
  };

  const addTag = (t: string) => {
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
    setTagDropdown(false);
  };

  return (
    <div className="ksm-overlay" onClick={onClose}>
      <div className="ksm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ksm-modal-header">
          <h2>إضافة مشترك</h2>
          <button className="ksm-modal-close" onClick={onClose}>{Icons.x}</button>
        </div>
        <div className="ksm-modal-body">
          {/* Name Row */}
          <div className="ksm-form-row">
            <div className="ksm-field">
              <label className="ksm-label">الاسم الأول</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="الاسم الأول" className="ksm-input" />
            </div>
            <div className="ksm-field">
              <label className="ksm-label">الاسم الثاني</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="الاسم الثاني" className="ksm-input" />
            </div>
          </div>

          {/* Email */}
          <div className="ksm-field">
            <label className="ksm-label">البريد الالكتروني <span className="ksm-required">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="email@example.com"
              className={`ksm-input ${error ? "ksm-input-error" : ""}`}
              dir="ltr"
            />
            {error && <span className="ksm-error">{error}</span>}
          </div>

          {/* Tags */}
          <div className="ksm-field">
            <label className="ksm-label">الوسوم</label>
            <div className="ksm-tags-input-wrap">
              {tags.map((t) => (
                <span key={t} className="ksm-tag-chip">
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))}>{Icons.x}</button>
                </span>
              ))}
              <div className="ksm-dropdown-wrap" style={{ flex: 1 }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => { setTagInput(e.target.value); setTagDropdown(true); }}
                  onFocus={() => setTagDropdown(true)}
                  placeholder="أضف وسم..."
                  className="ksm-tag-input"
                  onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) { addTag(tagInput.trim()); } }}
                />
                {tagDropdown && allTags.filter((t) => !tags.includes(t) && t.includes(tagInput)).length > 0 && (
                  <div className="ksm-dropdown" style={{ left: 0, right: "auto", minWidth: 160 }}>
                    {allTags.filter((t) => !tags.includes(t) && t.includes(tagInput)).map((t) => (
                      <button key={t} className="ksm-dropdown-item" onClick={() => addTag(t)}>{t}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="ksm-field">
            <label className="ksm-label">ملاحظات</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات إضافية..." className="ksm-textarea" rows={3} />
          </div>
        </div>
        <div className="ksm-modal-footer">
          <button className="ksm-btn-outline" onClick={onClose}>إلغاء</button>
          <button className="ksm-btn-primary" onClick={handleSubmit}>إضافة مشترك</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  CSV IMPORT MODAL
// ═══════════════════════════════════════════════════════
function CSVImportModal({ onImport, onClose }: { onImport: (text: string) => number; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<number | null>(null);
  const [fileName, setFileName] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const count = onImport(reader.result);
        setResult(count);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="ksm-overlay" onClick={onClose}>
      <div className="ksm-modal ksm-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="ksm-modal-header">
          <h2>استيراد من CSV</h2>
          <button className="ksm-modal-close" onClick={onClose}>{Icons.x}</button>
        </div>
        <div className="ksm-modal-body">
          {result === null ? (
            <>
              <p className="ksm-modal-desc">ارفع ملف CSV يحتوي على عمود "email" على الأقل.</p>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />
              <button className="ksm-upload-area" onClick={() => fileRef.current?.click()}>
                {Icons.upload}
                <span>{fileName || "اختر ملف CSV"}</span>
              </button>
            </>
          ) : (
            <div className="ksm-import-result">
              <div className="ksm-import-icon">{Icons.check}</div>
              <p>تم استيراد <strong>{result}</strong> مشترك جديد</p>
              <button className="ksm-btn-primary" onClick={onClose}>تم</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SUBSCRIBER DETAIL MODAL
// ═══════════════════════════════════════════════════════
interface DetailModalProps {
  subscriber: Subscriber;
  onUpdate: (updates: Partial<Subscriber>) => void;
  onDelete: () => void;
  onClose: () => void;
  allTags: string[];
}

function SubscriberDetailModal({ subscriber, onUpdate, onDelete, onClose, allTags }: DetailModalProps) {
  const [tab, setTab] = useState<"details" | "engagement" | "segments">("details");
  const [email, setEmail] = useState(subscriber.email);
  const [firstName, setFirstName] = useState(subscriber.firstName);
  const [lastName, setLastName] = useState(subscriber.lastName);
  const [notes, setNotes] = useState(subscriber.notes);
  const [tags, setTags] = useState(subscriber.tags);
  const [tagInput, setTagInput] = useState("");
  const [tagDropdown, setTagDropdown] = useState(false);

  const addTag = (t: string) => {
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
    setTagDropdown(false);
  };

  const handleSave = () => {
    onUpdate({
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      notes: notes.trim(),
      tags,
    });
    onClose();
  };

  // Avatar color from email
  const avatarColor = `hsl(${subscriber.email.charCodeAt(0) * 7 % 360}, 70%, 85%)`;
  const avatarTextColor = `hsl(${subscriber.email.charCodeAt(0) * 7 % 360}, 70%, 35%)`;

  return (
    <div className="ksm-overlay" onClick={onClose}>
      <div className="ksm-modal ksm-modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="ksm-modal-header">
          <h2>تفاصيل المشترك</h2>
          <button className="ksm-modal-close-text" onClick={onClose}>إلغاء</button>
        </div>

        {/* Subscriber Identity */}
        <div className="ksm-detail-identity">
          <div className="ksm-detail-avatar" style={{ background: avatarColor, color: avatarTextColor }}>
            {subscriber.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="ksm-detail-email">{subscriber.email}</div>
            <div className="ksm-detail-date">أضيف في {formatDateTime(subscriber.createdAt)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ksm-detail-tabs">
          {(["details", "engagement", "segments"] as const).map((t) => (
            <button
              key={t}
              className={`ksm-detail-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "details" ? "التفاصيل" : t === "engagement" ? "التفاعل" : "الشرائح"}
            </button>
          ))}
        </div>

        <div className="ksm-modal-body">
          {tab === "details" && (
            <>
              {/* Email */}
              <div className="ksm-field">
                <label className="ksm-label">البريد الالكتروني <span className="ksm-required">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="ksm-input" dir="ltr" />
              </div>

              {/* Tags */}
              <div className="ksm-field">
                <label className="ksm-label">الوسوم</label>
                <div className="ksm-tags-input-wrap">
                  {tags.map((t) => (
                    <span key={t} className="ksm-tag-chip">
                      {t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))}>{Icons.x}</button>
                    </span>
                  ))}
                  <div className="ksm-dropdown-wrap" style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => { setTagInput(e.target.value); setTagDropdown(true); }}
                      onFocus={() => setTagDropdown(true)}
                      placeholder="أضف وسم..."
                      className="ksm-tag-input"
                      onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) addTag(tagInput.trim()); }}
                    />
                    {tagDropdown && allTags.filter((t) => !tags.includes(t) && t.includes(tagInput)).length > 0 && (
                      <div className="ksm-dropdown" style={{ left: 0, right: "auto", minWidth: 160 }}>
                        {allTags.filter((t) => !tags.includes(t) && t.includes(tagInput)).map((t) => (
                          <button key={t} className="ksm-dropdown-item" onClick={() => addTag(t)}>{t}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Row */}
              <div className="ksm-form-row">
                <div className="ksm-field">
                  <label className="ksm-label">الاسم الأول</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="الاسم الأول" className="ksm-input" />
                </div>
                <div className="ksm-field">
                  <label className="ksm-label">الاسم الثاني</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="الاسم الثاني" className="ksm-input" />
                </div>
              </div>

              {/* Notes */}
              <div className="ksm-field">
                <label className="ksm-label">ملاحظات</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ابدأ بالكتابة أو اتركه فارغا..." className="ksm-textarea" rows={4} />
              </div>
            </>
          )}

          {tab === "engagement" && (
            <div className="ksm-empty-tab">
              <p className="ksm-muted">بيانات التفاعل ستظهر هنا بعد ربط نظام الإرسال.</p>
            </div>
          )}

          {tab === "segments" && (
            <div className="ksm-empty-tab">
              <p className="ksm-muted">هذا المشترك ليس ضمن أي شريحة.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ksm-modal-footer ksm-modal-footer-between">
          <button
            className="ksm-btn-icon ksm-btn-icon-danger"
            onClick={() => { if (confirm("هل تريد حذف هذا المشترك؟")) onDelete(); }}
            title="حذف"
          >
            {Icons.trash}
          </button>
          <button className="ksm-btn-primary" onClick={handleSave}>حفظ التغييرات</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const CSS_STYLES = `
/* Base */
.ksm{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;direction:rtl;text-align:right;color:#111;line-height:1.6;width:100%;background:transparent;max-width:900px;margin:0 auto;}

/* Header */
.ksm-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
.ksm-header-right{display:flex;align-items:center;gap:10px;}
.ksm-header-left{display:flex;align-items:center;gap:8px;}
.ksm-title{font-size:24px;font-weight:700;margin:0;color:#111;}
.ksm-count{font-size:14px;font-weight:600;color:#999;background:#F0F0F0;padding:2px 10px;border-radius:9999px;}

/* Toolbar */
.ksm-toolbar{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;border-bottom:1px solid #F0F0F0;}
.ksm-toolbar-right,.ksm-toolbar-left{display:flex;align-items:center;gap:8px;}

/* Buttons */
.ksm-btn-primary{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 20px;border:none;border-radius:10px;background:#111;color:#fff;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;white-space:nowrap;}
.ksm-btn-primary:hover{background:#333;}
.ksm-btn-outline{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border:1px solid rgba(0,0,0,0.06);border-radius:9px;background:#fff;color:#111;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;}
.ksm-btn-outline:hover{border-color:#BBB;background:#F8F8F8;}
.ksm-btn-outline.active{border-color:#111;background:#F5F0EB;color:#111;}
.ksm-btn-filtered{border-color:#111;background:#EDEDFF;color:#111;}
.ksm-btn-sm{height:34px;font-size:12px;padding:0 12px;}
.ksm-btn-icon{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid rgba(0,0,0,0.06);border-radius:8px;background:#fff;color:#888;cursor:pointer;transition:all .15s;}
.ksm-btn-icon:hover{border-color:#BBB;color:#111;background:#F5F5F5;}
.ksm-btn-icon-danger{border-color:#E0E0E0;}
.ksm-btn-icon-danger:hover{border-color:#E82222;color:#E82222;background:#FEF2F2;}

/* Dropdown */
.ksm-dropdown-wrap{position:relative;}
.ksm-dropdown{position:absolute;top:100%;left:0;margin-top:4px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);min-width:180px;z-index:100;padding:4px;overflow:hidden;}
.ksm-dropdown-item{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:500;color:#111;cursor:pointer;border-radius:7px;text-align:right;white-space:nowrap;}
.ksm-dropdown-item:hover{background:#F5F5F5;}
.ksm-dropdown-item.active{font-weight:700;}
.ksm-dropdown-title{padding:8px 12px 4px;font-size:11px;font-weight:600;color:#999;white-space:nowrap;}
.ksm-dropdown-empty{padding:12px;font-size:12px;color:#BBB;text-align:center;}
.ksm-dropdown-divider{height:1px;background:#F0F0F0;margin:4px 0;}
.ksm-dropdown-input-row{padding:4px 8px;}
.ksm-dropdown-input{width:100%;height:32px;padding:0 8px;border:1px solid rgba(0,0,0,0.06);border-radius:7px;font-family:inherit;font-size:12px;color:#111;outline:none;box-sizing:border-box;}
.ksm-dropdown-input:focus{border-color:#111;}

/* Search */
.ksm-search-bar{display:flex;align-items:center;gap:4px;border:1px solid rgba(0,0,0,0.06);border-radius:9px;padding:0 8px;height:34px;min-width:220px;}
.ksm-search-bar:focus-within{border-color:#111;}
.ksm-search-input{flex:1;border:none;outline:none;font-family:inherit;font-size:13px;color:#111;background:none;direction:rtl;height:100%;}
.ksm-search-input::placeholder{color:#BBB;}
.ksm-search-close{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:none;background:none;color:#999;cursor:pointer;padding:0;}
.ksm-search-close:hover{color:#111;}

/* Table */
.ksm-table-wrap{overflow-x:auto;}
.ksm-table{width:100%;border-collapse:collapse;}
.ksm-table thead{border-bottom:1px solid rgba(0,0,0,0.06);}
.ksm-table th{padding:10px 16px;font-size:12px;font-weight:600;color:#999;text-align:right;white-space:nowrap;}
.ksm-table td{padding:12px 16px;font-size:14px;border-bottom:1px solid #F5F5F5;}
.ksm-th-check,.ksm-td-check{width:40px;text-align:center;padding-right:12px;padding-left:4px;}
.ksm-row{cursor:pointer;transition:background .1s;}
.ksm-row:hover{background:#FAFAFA;}
.ksm-row.selected{background:#F0F4FF;}
.ksm-td-email{font-weight:500;direction:ltr;text-align:left;}
.ksm-td-name{color:#555;}
.ksm-td-date{font-size:13px;color:#999;white-space:nowrap;}
.ksm-td-tags{display:flex;gap:4px;flex-wrap:wrap;}
.ksm-empty-row{text-align:center;color:#BBB;padding:60px 20px !important;font-size:14px;}
.ksm-muted{color:#CCC;}

/* Checkbox */
.ksm-checkbox{width:20px;height:20px;border:1px solid rgba(0,0,0,0.08);border-radius:5px;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;padding:0;color:#fff;}
.ksm-checkbox:hover{border-color:#999;}
.ksm-checkbox.checked{background:#111;border-color:#111;}

/* Status Badge */
.ksm-status-badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:9999px;white-space:nowrap;}

/* Tags */
.ksm-tag{font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;background:#F0F0F0;color:#555;white-space:nowrap;}
.ksm-tag-chip{display:inline-flex;align-items:center;gap:2px;font-size:12px;font-weight:600;padding:3px 8px 3px 4px;border-radius:7px;background:#F0F0F0;color:#555;}
.ksm-tag-chip button{display:flex;align-items:center;justify-content:center;width:16px;height:16px;border:none;background:none;color:#999;cursor:pointer;padding:0;}
.ksm-tag-chip button:hover{color:#E82222;}
.ksm-tags-input-wrap{display:flex;flex-wrap:wrap;align-items:center;gap:6px;border:1px solid rgba(0,0,0,0.06);border-radius:9px;padding:6px 10px;min-height:40px;cursor:text;}
.ksm-tags-input-wrap:focus-within{border-color:#111;}
.ksm-tag-input{flex:1;min-width:80px;border:none;outline:none;font-family:inherit;font-size:13px;color:#111;background:none;height:24px;}
.ksm-tag-input::placeholder{color:#BBB;}

/* Bulk Action Bar */
.ksm-bulk-bar{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;padding:10px 20px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);z-index:50;}
.ksm-bulk-count{font-size:13px;font-weight:600;color:#555;white-space:nowrap;}
.ksm-bulk-btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border:1px solid rgba(0,0,0,0.06);border-radius:8px;background:#fff;font-family:inherit;font-size:12px;font-weight:600;color:#555;cursor:pointer;}
.ksm-bulk-btn:hover{background:#F5F5F5;border-color:#BBB;}
.ksm-bulk-delete{color:#E82222;border-color:#FECACA;}
.ksm-bulk-delete:hover{background:#FEF2F2;border-color:#E82222;}

/* Modal Overlay */
.ksm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;}

/* Modal */
.ksm-modal{background:#fff;border-radius:14px;width:100%;max-width:520px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.15);}
.ksm-modal-sm{max-width:400px;}
.ksm-modal-detail{max-width:560px;}
.ksm-modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 0;}
.ksm-modal-header h2{font-size:18px;font-weight:700;margin:0;color:#111;}
.ksm-modal-close{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;background:none;color:#999;cursor:pointer;border-radius:8px;}
.ksm-modal-close:hover{background:#F0F0F0;color:#111;}
.ksm-modal-close-text{border:none;background:none;font-family:inherit;font-size:14px;font-weight:600;color:#888;cursor:pointer;}
.ksm-modal-close-text:hover{color:#111;}
.ksm-modal-body{padding:20px 24px;overflow-y:auto;flex:1;}
.ksm-modal-desc{font-size:14px;color:#888;margin:0 0 16px;}
.ksm-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:16px 24px;border-top:1px solid #F0F0F0;}
.ksm-modal-footer-between{justify-content:space-between;}

/* Detail Modal Extras */
.ksm-detail-identity{display:flex;align-items:center;gap:12px;padding:16px 24px;}
.ksm-detail-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;}
.ksm-detail-email{font-size:15px;font-weight:700;color:#111;}
.ksm-detail-date{font-size:12px;color:#999;}
.ksm-detail-tabs{display:flex;margin:0 24px;border:1px solid rgba(0,0,0,0.06);border-radius:10px;overflow:hidden;}
.ksm-detail-tab{flex:1;padding:8px 0;border:none;background:#fff;font-family:inherit;font-size:13px;font-weight:600;color:#888;cursor:pointer;transition:all .15s;}
.ksm-detail-tab:hover{background:#F8F8F8;}
.ksm-detail-tab.active{background:#F0F0F0;color:#111;}
.ksm-empty-tab{padding:40px 0;text-align:center;}

/* Form Fields */
.ksm-field{margin-bottom:16px;}
.ksm-form-row{display:flex;gap:12px;}
.ksm-form-row .ksm-field{flex:1;}
.ksm-label{display:block;font-size:13px;font-weight:700;color:#111;margin-bottom:6px;}
.ksm-required{color:#E82222;}
.ksm-input{display:block;width:100%;height:40px;padding:0 12px;border:1px solid rgba(0,0,0,0.06);border-radius:9px;font-family:inherit;font-size:14px;color:#111;background:#fff;outline:none;box-sizing:border-box;}
.ksm-input:focus{border-color:#111;}
.ksm-input-error{border-color:#E82222;}
.ksm-error{font-size:12px;color:#E82222;margin-top:4px;display:block;}
.ksm-textarea{display:block;width:100%;padding:10px 12px;border:1px solid rgba(0,0,0,0.06);border-radius:9px;font-family:inherit;font-size:14px;color:#111;background:#fff;outline:none;resize:vertical;line-height:1.6;box-sizing:border-box;}
.ksm-textarea:focus{border-color:#111;}

/* Upload Area */
.ksm-upload-area{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;width:100%;height:100px;border:2px dashed #D9D9D9;border-radius:12px;background:#FAFAFA;color:#999;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.ksm-upload-area:hover{border-color:#111;color:#111;background:#F5F5F5;}

/* Import Result */
.ksm-import-result{display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px 0;text-align:center;}
.ksm-import-icon{width:48px;height:48px;border-radius:50%;background:#E6F9EE;color:#12B76A;display:flex;align-items:center;justify-content:center;}
.ksm-import-result p{font-size:15px;color:#111;margin:0;}
.ksm-import-result strong{font-weight:700;}

/* Responsive */
@media(max-width:700px){
  .ksm-header{flex-direction:column;gap:12px;align-items:flex-start;}
  .ksm-header-left{width:100%;justify-content:flex-end;}
  .ksm-toolbar{flex-direction:column;gap:10px;align-items:flex-start;}
  .ksm-toolbar-left{width:100%;justify-content:flex-end;}
  .ksm-form-row{flex-direction:column;gap:0;}
  .ksm-modal{margin:10px;max-height:95vh;}
  .ksm-bulk-bar{left:10px;right:10px;transform:none;}
}
`;
