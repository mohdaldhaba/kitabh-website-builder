// ═══════════════════════════════════════════════════════
//  Kitabh Email Automations
//  Visual workflow builder: triggers, actions, conditions
//  List view + Builder view with sidebar panels
//  Arabic UI, Kitabh branding, RTL
// ═══════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────
type TriggerType = "person_subscribes" | "tag_added" | "tag_removed";
type SubscriptionSource = "any" | "website" | "action_form" | "magic_link" | "import" | "api";
type ActionType = "send_email" | "wait" | "condition" | "add_tag" | "remove_tag" | "update_field";
type WaitUnit = "hours" | "days" | "weeks";
type AutomationStatus = "active" | "paused" | "draft";
type ViewMode = "list" | "builder";
type SidebarTab = "add" | "analyze" | "config";

interface TriggerConfig {
  type: TriggerType;
  source?: SubscriptionSource; // for person_subscribes
  tagName?: string; // for tag_added / tag_removed
}

interface ActionStep {
  id: string;
  type: ActionType;
  // send_email
  emailSubject?: string;
  emailPreheader?: string;
  emailContentId?: string; // reference to a draft
  // wait
  waitDuration?: number;
  waitUnit?: WaitUnit;
  // condition
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  yesBranch?: ActionStep[];
  noBranch?: ActionStep[];
  // add_tag / remove_tag
  tagName?: string;
  // update_field
  fieldName?: string;
  fieldValue?: string;
}

interface AutomationStats {
  completed: number;
  inProgress: number;
  totalSent: number;
  avgOpens: number;
  avgClicks: number;
  lastRun: string | null;
}

interface Automation {
  id: string;
  name: string;
  status: AutomationStatus;
  trigger: TriggerConfig | null;
  steps: ActionStep[];
  // config
  authorName: string;
  sendDays: boolean[]; // [Su, Mo, Tu, We, Th, Fr, Sa]
  sendTimeWindow: string; // "any" | "morning" | "afternoon" | "evening"
  allowReentry: boolean;
  // stats
  stats: AutomationStats;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ────────────────────────────────────────────
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

const TRIGGER_LABELS: Record<TriggerType, { label: string; icon: string }> = {
  person_subscribes: { label: "مشترك جديد", icon: "subscribe" },
  tag_added: { label: "تمت إضافة وسم", icon: "tagPlus" },
  tag_removed: { label: "تمت إزالة وسم", icon: "tagMinus" },
};

const SOURCE_LABELS: Record<SubscriptionSource, string> = {
  any: "أي مصدر",
  website: "الموقع",
  action_form: "نموذج",
  magic_link: "رابط سحري",
  import: "استيراد",
  api: "API",
};

const ACTION_LABELS: Record<ActionType, { label: string; desc: string; color: string }> = {
  send_email: { label: "إرسال بريد", desc: "إرسال بريد إلكتروني للمشترك", color: "#3B82F6" },
  wait: { label: "انتظار", desc: "إيقاف مؤقت لمدة محددة", color: "#F59E0B" },
  condition: { label: "شرط", desc: "تقسيم المشتركين بناء على قاعدة", color: "#8B5CF6" },
  add_tag: { label: "إضافة وسم", desc: "إضافة وسم للتصنيف", color: "#10B981" },
  remove_tag: { label: "إزالة وسم", desc: "إزالة وسم من المشتركين", color: "#EF4444" },
  update_field: { label: "تحديث حقل", desc: "تحديث بيانات المشترك", color: "#06B6D4" },
};

const WAIT_UNIT_LABELS: Record<WaitUnit, string> = {
  hours: "ساعات",
  days: "أيام",
  weeks: "أسابيع",
};

const STATUS_LABELS: Record<AutomationStatus, { label: string; color: string; bg: string }> = {
  active: { label: "نشط", color: "#12B76A", bg: "#E6F9EE" },
  paused: { label: "متوقف", color: "#F59E0B", bg: "#FFF8E0" },
  draft: { label: "مسودة", color: "#888", bg: "#F0F0F0" },
};

const DAY_LABELS = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

const TIME_WINDOW_LABELS: Record<string, string> = {
  any: "أي وقت",
  morning: "صباحا (٦ص - ١٢م)",
  afternoon: "ظهرا (١٢م - ٦م)",
  evening: "مساء (٦م - ١٢ص)",
};

function createEmptyAutomation(): Automation {
  return {
    id: genId(),
    name: "سلسلة رسائل جديدة",
    status: "draft",
    trigger: null,
    steps: [],
    authorName: "",
    sendDays: [true, true, true, true, true, true, true],
    sendTimeWindow: "any",
    allowReentry: false,
    stats: { completed: 0, inProgress: 0, totalSent: 0, avgOpens: 0, avgClicks: 0, lastRun: null },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── SVG Icons ──────────────────────────────────────────
const Icons = {
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  play: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  dots: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  split: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="8"/><path d="M5 22l7-8 7 8"/></svg>,
  tag: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  tagMinus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="5" y1="7" x2="9" y2="7"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  subscribe: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  back: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  automation: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  pencil: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
};

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function KitabhAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("add");

  // Builder state
  const [triggerMenuOpen, setTriggerMenuOpen] = useState(false);
  const [triggerSourceMenu, setTriggerSourceMenu] = useState(false);
  const [addActionMenuOpen, setAddActionMenuOpen] = useState<string | null>(null); // step id or "end"
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [listMenuOpen, setListMenuOpen] = useState<string | null>(null);

  // ─── Load/Save localStorage ────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kb_automations");
      if (saved) setAutomations(JSON.parse(saved));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kb_automations", JSON.stringify(automations));
    } catch (_) {}
  }, [automations]);

  // Close menus on click outside
  useEffect(() => {
    const handler = () => {
      setTriggerMenuOpen(false);
      setTriggerSourceMenu(false);
      setAddActionMenuOpen(null);
      setListMenuOpen(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const activeAutomation = automations.find(a => a.id === activeId) || null;

  const updateAutomation = useCallback((id: string, updates: Partial<Automation>) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
  }, []);

  // ─── List actions ────────
  const createAutomation = () => {
    const newAuto = createEmptyAutomation();
    setAutomations(prev => [newAuto, ...prev]);
    setActiveId(newAuto.id);
    setView("builder");
    setSidebarTab("add");
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
    if (activeId === id) { setActiveId(null); setView("list"); }
    setListMenuOpen(null);
  };

  const duplicateAutomation = (id: string) => {
    const src = automations.find(a => a.id === id);
    if (!src) return;
    const dup: Automation = {
      ...JSON.parse(JSON.stringify(src)),
      id: genId(),
      name: src.name + " (نسخة)",
      status: "draft" as AutomationStatus,
      stats: { completed: 0, inProgress: 0, totalSent: 0, avgOpens: 0, avgClicks: 0, lastRun: null },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAutomations(prev => [dup, ...prev]);
    setListMenuOpen(null);
  };

  const toggleStatus = (id: string) => {
    const a = automations.find(x => x.id === id);
    if (!a) return;
    const next = a.status === "active" ? "paused" : "active";
    updateAutomation(id, { status: next });
  };

  const openBuilder = (id: string) => {
    setActiveId(id);
    setView("builder");
    setSidebarTab("add");
    setEditingStepId(null);
  };

  // ─── Builder: Trigger ────────
  const setTrigger = (type: TriggerType) => {
    if (!activeId) return;
    const config: TriggerConfig = { type };
    if (type === "person_subscribes") config.source = "any";
    updateAutomation(activeId, { trigger: config });
    setTriggerMenuOpen(false);
    setTriggerSourceMenu(false);
  };

  const setTriggerSource = (source: SubscriptionSource) => {
    if (!activeId || !activeAutomation?.trigger) return;
    updateAutomation(activeId, { trigger: { ...activeAutomation.trigger, source } });
    setTriggerSourceMenu(false);
    setTriggerMenuOpen(false);
  };

  // ─── Builder: Steps ────────
  const addStep = (type: ActionType, afterId: string) => {
    if (!activeId) return;
    const step: ActionStep = { id: genId(), type };
    if (type === "wait") { step.waitDuration = 1; step.waitUnit = "days"; }
    if (type === "condition") { step.conditionField = ""; step.conditionOperator = "equals"; step.conditionValue = ""; step.yesBranch = []; step.noBranch = []; }
    if (type === "add_tag" || type === "remove_tag") step.tagName = "";
    if (type === "update_field") { step.fieldName = ""; step.fieldValue = ""; }
    if (type === "send_email") { step.emailSubject = ""; step.emailPreheader = ""; step.emailContentId = ""; }

    const a = automations.find(x => x.id === activeId);
    if (!a) return;
    const steps = [...a.steps];
    if (afterId === "trigger") {
      steps.unshift(step);
    } else {
      const idx = steps.findIndex(s => s.id === afterId);
      if (idx >= 0) steps.splice(idx + 1, 0, step);
      else steps.push(step);
    }
    updateAutomation(activeId, { steps });
    setAddActionMenuOpen(null);
    setEditingStepId(step.id);
  };

  const updateStep = (stepId: string, updates: Partial<ActionStep>) => {
    if (!activeId) return;
    const a = automations.find(x => x.id === activeId);
    if (!a) return;
    const steps = a.steps.map(s => s.id === stepId ? { ...s, ...updates } : s);
    updateAutomation(activeId, { steps });
  };

  const removeStep = (stepId: string) => {
    if (!activeId) return;
    const a = automations.find(x => x.id === activeId);
    if (!a) return;
    updateAutomation(activeId, { steps: a.steps.filter(s => s.id !== stepId) });
    if (editingStepId === stepId) setEditingStepId(null);
  };

  // ─── Builder: Name editing ────────
  const startEditName = () => {
    if (!activeAutomation) return;
    setDraftName(activeAutomation.name);
    setEditingName(true);
  };

  const saveName = () => {
    if (!activeId || !draftName.trim()) return;
    updateAutomation(activeId, { name: draftName.trim() });
    setEditingName(false);
  };

  // ═══════════════════════════════════════════════════════
  //  RENDER: LIST VIEW
  // ═══════════════════════════════════════════════════════
  if (view === "list") {
    return (
      <>
        <style>{CSS_STYLES}</style>
        <div className="ka">
          <div className="ka-list-header">
            <h1 className="ka-page-title">سلسلة الرسائل</h1>
            <button className="ka-btn-primary" onClick={createAutomation}>
              {Icons.plus}
              <span>سلسلة رسائل جديدة</span>
            </button>
          </div>

          {automations.length === 0 ? (
            <div className="ka-empty">
              <div className="ka-empty-icon">{Icons.automation}</div>
              <h3>لا توجد سلسلة رسائل بعد</h3>
              <p>أنشئ أول سلسلة رسائل لإرسال رسائل تلقائية للمشتركين</p>
              <button className="ka-btn-primary" onClick={createAutomation}>
                {Icons.plus}
                <span>سلسلة رسائل جديدة</span>
              </button>
            </div>
          ) : (
            <div className="ka-list">
              {automations.map(a => {
                const st = STATUS_LABELS[a.status];
                return (
                  <div key={a.id} className="ka-list-item" onClick={() => openBuilder(a.id)}>
                    <div className="ka-list-item-icon">{Icons.automation}</div>
                    <div className="ka-list-item-info">
                      <div className="ka-list-item-top">
                        <span className="ka-list-item-name">{a.name}</span>
                        <span className="ka-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                      </div>
                      <span className="ka-list-item-trigger">
                        {a.trigger ? TRIGGER_LABELS[a.trigger.type].label : "بدون مشغّل"}
                      </span>
                    </div>
                    <div className="ka-list-item-stats">
                      <span className="ka-stat-mini" title="رسائل مرسلة">{Icons.mail} {a.stats.totalSent}</span>
                      <span className="ka-stat-mini" title="مكتملة">{Icons.users} {a.stats.completed}</span>
                      <span className="ka-stat-mini" title="جاري التنفيذ">{Icons.check} {a.stats.inProgress}</span>
                    </div>
                    <div className="ka-list-item-menu" onClick={e => { e.stopPropagation(); setListMenuOpen(listMenuOpen === a.id ? null : a.id); }}>
                      {Icons.dots}
                      {listMenuOpen === a.id && (
                        <div className="ka-dropdown" onClick={e => e.stopPropagation()}>
                          <button className="ka-dropdown-item" onClick={() => { toggleStatus(a.id); setListMenuOpen(null); }}>
                            {a.status === "active" ? Icons.pause : Icons.play}
                            <span>{a.status === "active" ? "إيقاف" : "تشغيل"}</span>
                          </button>
                          <button className="ka-dropdown-item" onClick={() => duplicateAutomation(a.id)}>
                            {Icons.copy}
                            <span>نسخ</span>
                          </button>
                          <button className="ka-dropdown-item ka-dropdown-danger" onClick={() => deleteAutomation(a.id)}>
                            {Icons.trash}
                            <span>حذف</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER: BUILDER VIEW
  // ═══════════════════════════════════════════════════════
  if (!activeAutomation) return null;

  const editingStep = activeAutomation.steps.find(s => s.id === editingStepId) || null;

  return (
    <>
      <style>{CSS_STYLES}</style>
      <div className="ka-builder">
        {/* Top Bar */}
        <div className="ka-builder-topbar">
          <div className="ka-builder-topbar-right">
            <button className="ka-btn-ghost" onClick={() => { setView("list"); setActiveId(null); setEditingStepId(null); }}>
              {Icons.chevRight}
              <span>رجوع</span>
            </button>
            <span className={`ka-status-dot ${activeAutomation.status === "active" ? "ka-dot-active" : "ka-dot-paused"}`} />
            <span className="ka-topbar-status">{STATUS_LABELS[activeAutomation.status].label}</span>
          </div>
          <div className="ka-builder-topbar-center">
            {editingName ? (
              <div className="ka-name-edit">
                <input
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => e.key === "Enter" && saveName()}
                  className="ka-name-input"
                  autoFocus
                />
              </div>
            ) : (
              <button className="ka-name-btn" onClick={startEditName}>
                {activeAutomation.name}
                {Icons.pencil}
              </button>
            )}
          </div>
          <div className="ka-builder-topbar-left">
            <button
              className={`ka-btn-run ${activeAutomation.status === "active" ? "ka-btn-run-active" : ""}`}
              onClick={() => toggleStatus(activeAutomation.id)}
            >
              {activeAutomation.status === "active" ? Icons.pause : Icons.play}
              <span>{activeAutomation.status === "active" ? "إيقاف" : "تشغيل"}</span>
            </button>
          </div>
        </div>

        <div className="ka-builder-body">
          {/* Canvas */}
          <div className="ka-canvas">
            <div className="ka-canvas-inner">
              {/* Trigger Node */}
              <div
                className="ka-node ka-node-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setTriggerMenuOpen(!triggerMenuOpen);
                  setAddActionMenuOpen(null);
                  setEditingStepId(null);
                }}
              >
                <div className="ka-node-icon" style={{ background: "#EEF2FF", color: "#6366F1" }}>{Icons.automation}</div>
                <div className="ka-node-content">
                  <span className="ka-node-type">المشغّل</span>
                  <span className="ka-node-label">
                    {activeAutomation.trigger
                      ? TRIGGER_LABELS[activeAutomation.trigger.type].label +
                        (activeAutomation.trigger.source && activeAutomation.trigger.source !== "any"
                          ? ` (${SOURCE_LABELS[activeAutomation.trigger.source]})`
                          : "")
                      : "بدون مشغّل"}
                  </span>
                </div>
                <span className="ka-node-arrow">{Icons.chevLeft}</span>

                {/* Trigger menu */}
                {triggerMenuOpen && !triggerSourceMenu && (
                  <div className="ka-trigger-menu" onClick={e => e.stopPropagation()}>
                    <div className="ka-trigger-menu-title">اختر المشغّل</div>
                    <button className="ka-trigger-option" onClick={(e) => { e.stopPropagation(); setTriggerSourceMenu(true); }}>
                      <span className="ka-trigger-option-icon" style={{ background: "#E6F9EE", color: "#12B76A" }}>{Icons.subscribe}</span>
                      <span>مشترك جديد</span>
                    </button>
                    <button className="ka-trigger-option" onClick={() => setTrigger("tag_added")}>
                      <span className="ka-trigger-option-icon" style={{ background: "#EEF2FF", color: "#6366F1" }}>{Icons.tag}</span>
                      <span>تمت إضافة وسم</span>
                    </button>
                    <button className="ka-trigger-option" onClick={() => setTrigger("tag_removed")}>
                      <span className="ka-trigger-option-icon" style={{ background: "#FEF2F2", color: "#EF4444" }}>{Icons.tagMinus}</span>
                      <span>تمت إزالة وسم</span>
                    </button>
                  </div>
                )}

                {/* Subscription source sub-menu */}
                {triggerMenuOpen && triggerSourceMenu && (
                  <div className="ka-trigger-menu" onClick={e => e.stopPropagation()}>
                    <button className="ka-trigger-back" onClick={(e) => { e.stopPropagation(); setTriggerSourceMenu(false); }}>
                      {Icons.back}
                      <span>رجوع</span>
                    </button>
                    <div className="ka-trigger-menu-title">مصدر الاشتراك</div>
                    {(Object.keys(SOURCE_LABELS) as SubscriptionSource[]).map(src => (
                      <button key={src} className="ka-trigger-option" onClick={() => { setTrigger("person_subscribes"); setTriggerSource(src); }}>
                        <span>{SOURCE_LABELS[src]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Connector line from trigger */}
              <div className="ka-connector">
                <div className="ka-connector-line" />
                <button
                  className="ka-connector-add"
                  onClick={(e) => { e.stopPropagation(); setAddActionMenuOpen(addActionMenuOpen === "trigger" ? null : "trigger"); setEditingStepId(null); }}
                >
                  {Icons.plus}
                </button>
                {addActionMenuOpen === "trigger" && (
                  <div className="ka-action-menu" onClick={e => e.stopPropagation()}>
                    <div className="ka-action-menu-title">إضافة إجراء</div>
                    {(Object.keys(ACTION_LABELS) as ActionType[]).map(type => (
                      <button key={type} className="ka-action-option" onClick={() => addStep(type, "trigger")}>
                        <span className="ka-action-option-dot" style={{ background: ACTION_LABELS[type].color }} />
                        <div className="ka-action-option-text">
                          <span className="ka-action-option-label">{ACTION_LABELS[type].label}</span>
                          <span className="ka-action-option-desc">{ACTION_LABELS[type].desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step Nodes */}
              {activeAutomation.steps.map((step, idx) => {
                const meta = ACTION_LABELS[step.type];
                let stepSummary = "";
                if (step.type === "send_email") stepSummary = step.emailSubject || "اختر بريدا";
                else if (step.type === "wait") stepSummary = `${step.waitDuration || 1} ${WAIT_UNIT_LABELS[step.waitUnit || "days"]}`;
                else if (step.type === "condition") stepSummary = step.conditionField || "اختر الشرط";
                else if (step.type === "add_tag" || step.type === "remove_tag") stepSummary = step.tagName || "اختر الوسم";
                else if (step.type === "update_field") stepSummary = step.fieldName || "اختر الحقل";

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`ka-node ka-node-step ${editingStepId === step.id ? "ka-node-selected" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setEditingStepId(step.id); setAddActionMenuOpen(null); }}
                    >
                      <div className="ka-node-icon" style={{ background: meta.color + "18", color: meta.color }}>{
                        step.type === "send_email" ? Icons.mail :
                        step.type === "wait" ? Icons.clock :
                        step.type === "condition" ? Icons.split :
                        step.type === "add_tag" ? Icons.tag :
                        step.type === "remove_tag" ? Icons.tagMinus :
                        Icons.edit
                      }</div>
                      <div className="ka-node-content">
                        <span className="ka-node-type">{meta.label}</span>
                        <span className="ka-node-label">{stepSummary}</span>
                      </div>
                      {step.type === "send_email" && (
                        <div className="ka-node-mini-stats">
                          <span>0 مرسل</span>
                          <span>0% فتح</span>
                          <span>0% نقر</span>
                        </div>
                      )}
                      <button className="ka-node-delete" onClick={(e) => { e.stopPropagation(); removeStep(step.id); }} title="حذف">
                        {Icons.dots}
                      </button>
                    </div>

                    {/* Connector after each step */}
                    <div className="ka-connector">
                      <div className="ka-connector-line" />
                      <button
                        className="ka-connector-add"
                        onClick={(e) => { e.stopPropagation(); setAddActionMenuOpen(addActionMenuOpen === step.id ? null : step.id); setEditingStepId(null); }}
                      >
                        {Icons.plus}
                      </button>
                      {addActionMenuOpen === step.id && (
                        <div className="ka-action-menu" onClick={e => e.stopPropagation()}>
                          <div className="ka-action-menu-title">إضافة إجراء</div>
                          {(Object.keys(ACTION_LABELS) as ActionType[]).map(type => (
                            <button key={type} className="ka-action-option" onClick={() => addStep(type, step.id)}>
                              <span className="ka-action-option-dot" style={{ background: ACTION_LABELS[type].color }} />
                              <div className="ka-action-option-text">
                                <span className="ka-action-option-label">{ACTION_LABELS[type].label}</span>
                                <span className="ka-action-option-desc">{ACTION_LABELS[type].desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}

              {/* End indicator */}
              <div className="ka-end-dot" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="ka-sidebar">
            <div className="ka-sidebar-tabs">
              <button className={`ka-sidebar-tab ${sidebarTab === "add" ? "ka-sidebar-tab-active" : ""}`} onClick={() => { setSidebarTab("add"); setEditingStepId(null); }}>
                <span className="ka-tab-dot" style={{ background: sidebarTab === "add" ? "#12B76A" : "transparent" }} />
                إضافة
              </button>
              <button className={`ka-sidebar-tab ${sidebarTab === "analyze" ? "ka-sidebar-tab-active" : ""}`} onClick={() => setSidebarTab("analyze")}>
                تحليل
              </button>
              <button className={`ka-sidebar-tab ${sidebarTab === "config" ? "ka-sidebar-tab-active" : ""}`} onClick={() => setSidebarTab("config")}>
                إعدادات
              </button>
            </div>

            <div className="ka-sidebar-content">
              {/* ─── ADD TAB ────── */}
              {sidebarTab === "add" && !editingStepId && (
                <div className="ka-sidebar-add">
                  {(Object.keys(ACTION_LABELS) as ActionType[]).map(type => {
                    const meta = ACTION_LABELS[type];
                    return (
                      <button
                        key={type}
                        className="ka-sidebar-action-btn"
                        onClick={() => {
                          const lastStepId = activeAutomation.steps.length > 0
                            ? activeAutomation.steps[activeAutomation.steps.length - 1].id
                            : "trigger";
                          addStep(type, lastStepId);
                        }}
                      >
                        <span className="ka-sidebar-action-dot" style={{ background: meta.color }}>{
                          type === "send_email" ? Icons.mail :
                          type === "wait" ? Icons.clock :
                          type === "condition" ? Icons.split :
                          type === "add_tag" ? Icons.tag :
                          type === "remove_tag" ? Icons.tagMinus :
                          Icons.edit
                        }</span>
                        <div className="ka-sidebar-action-text">
                          <span className="ka-sidebar-action-label">{meta.label}</span>
                          <span className="ka-sidebar-action-desc">{meta.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ─── STEP EDITOR ────── */}
              {sidebarTab === "add" && editingStep && (
                <div className="ka-step-editor">
                  <div className="ka-step-editor-header">
                    <h3>{ACTION_LABELS[editingStep.type].label}</h3>
                    <button className="ka-btn-icon-sm" onClick={() => removeStep(editingStep.id)} title="حذف الإجراء">
                      {Icons.trash}
                    </button>
                  </div>

                  {editingStep.type === "send_email" && (
                    <div className="ka-step-fields">
                      <label className="ka-field-label">العنوان</label>
                      <input
                        className="ka-field-input"
                        placeholder="عنوان الرسالة..."
                        value={editingStep.emailSubject || ""}
                        onChange={e => updateStep(editingStep.id, { emailSubject: e.target.value })}
                      />
                      <label className="ka-field-label">النص التمهيدي</label>
                      <textarea
                        className="ka-field-textarea"
                        placeholder="نص يظهر قبل فتح الرسالة..."
                        value={editingStep.emailPreheader || ""}
                        onChange={e => updateStep(editingStep.id, { emailPreheader: e.target.value })}
                        rows={3}
                      />
                      <label className="ka-field-label">المحتوى</label>
                      <input
                        className="ka-field-input"
                        placeholder="ابحث في المسودات أو أنشئ جديدا..."
                        value={editingStep.emailContentId || ""}
                        onChange={e => updateStep(editingStep.id, { emailContentId: e.target.value })}
                      />
                      <button className="ka-btn-save" onClick={() => setEditingStepId(null)}>حفظ الإجراء</button>
                    </div>
                  )}

                  {editingStep.type === "wait" && (
                    <div className="ka-step-fields">
                      <label className="ka-field-label">المدة</label>
                      <p className="ka-field-hint">إيقاف مؤقت قبل تنفيذ الإجراء التالي</p>
                      <div className="ka-wait-row">
                        <input
                          type="number"
                          className="ka-field-input ka-field-sm"
                          min={1}
                          value={editingStep.waitDuration || 1}
                          onChange={e => updateStep(editingStep.id, { waitDuration: parseInt(e.target.value) || 1 })}
                        />
                        <select
                          className="ka-field-select"
                          value={editingStep.waitUnit || "days"}
                          onChange={e => updateStep(editingStep.id, { waitUnit: e.target.value as WaitUnit })}
                        >
                          {(Object.keys(WAIT_UNIT_LABELS) as WaitUnit[]).map(u => (
                            <option key={u} value={u}>{WAIT_UNIT_LABELS[u]}</option>
                          ))}
                        </select>
                      </div>
                      <button className="ka-btn-save" onClick={() => setEditingStepId(null)}>حفظ الإجراء</button>
                    </div>
                  )}

                  {editingStep.type === "condition" && (
                    <div className="ka-step-fields">
                      <label className="ka-field-label">الشرط</label>
                      <p className="ka-field-hint">تقسيم المشتركين إلى مسارين بناء على قاعدة</p>
                      <label className="ka-field-label">الحقل</label>
                      <select
                        className="ka-field-select"
                        value={editingStep.conditionField || ""}
                        onChange={e => updateStep(editingStep.id, { conditionField: e.target.value })}
                      >
                        <option value="">اختر حقلا</option>
                        <option value="opened_last_email">فتح آخر رسالة</option>
                        <option value="clicked_last_email">نقر في آخر رسالة</option>
                        <option value="has_tag">يملك وسما</option>
                        <option value="status">الحالة</option>
                      </select>
                      <label className="ka-field-label">القيمة</label>
                      <input
                        className="ka-field-input"
                        placeholder="القيمة..."
                        value={editingStep.conditionValue || ""}
                        onChange={e => updateStep(editingStep.id, { conditionValue: e.target.value })}
                      />
                      <button className="ka-btn-save" onClick={() => setEditingStepId(null)}>حفظ الإجراء</button>
                    </div>
                  )}

                  {(editingStep.type === "add_tag" || editingStep.type === "remove_tag") && (
                    <div className="ka-step-fields">
                      <label className="ka-field-label">الوسم</label>
                      <input
                        className="ka-field-input"
                        placeholder="اسم الوسم..."
                        value={editingStep.tagName || ""}
                        onChange={e => updateStep(editingStep.id, { tagName: e.target.value })}
                      />
                      <button className="ka-btn-save" onClick={() => setEditingStepId(null)}>حفظ الإجراء</button>
                    </div>
                  )}

                  {editingStep.type === "update_field" && (
                    <div className="ka-step-fields">
                      <label className="ka-field-label">الحقل</label>
                      <select
                        className="ka-field-select"
                        value={editingStep.fieldName || ""}
                        onChange={e => updateStep(editingStep.id, { fieldName: e.target.value })}
                      >
                        <option value="">اختر حقلا</option>
                        <option value="firstName">الاسم الأول</option>
                        <option value="lastName">الاسم الثاني</option>
                        <option value="status">الحالة</option>
                        <option value="notes">ملاحظات</option>
                      </select>
                      <label className="ka-field-label">القيمة الجديدة</label>
                      <input
                        className="ka-field-input"
                        placeholder="القيمة..."
                        value={editingStep.fieldValue || ""}
                        onChange={e => updateStep(editingStep.id, { fieldValue: e.target.value })}
                      />
                      <button className="ka-btn-save" onClick={() => setEditingStepId(null)}>حفظ الإجراء</button>
                    </div>
                  )}
                </div>
              )}

              {/* ─── ANALYZE TAB ────── */}
              {sidebarTab === "analyze" && (
                <div className="ka-sidebar-analyze">
                  <div className="ka-analyze-grid">
                    <div className="ka-analyze-card">
                      <span className="ka-analyze-label">مكتملة</span>
                      <span className="ka-analyze-value">{activeAutomation.stats.completed}</span>
                    </div>
                    <div className="ka-analyze-card">
                      <span className="ka-analyze-label">جاري التنفيذ</span>
                      <span className="ka-analyze-value">{activeAutomation.stats.inProgress}</span>
                    </div>
                  </div>
                  <div className="ka-analyze-grid">
                    <div className="ka-analyze-card">
                      <span className="ka-analyze-label">متوسط الفتح</span>
                      <span className="ka-analyze-value">{activeAutomation.stats.avgOpens}%</span>
                    </div>
                    <div className="ka-analyze-card">
                      <span className="ka-analyze-label">متوسط النقر</span>
                      <span className="ka-analyze-value">{activeAutomation.stats.avgClicks}%</span>
                    </div>
                  </div>
                  <div className="ka-analyze-section">
                    <h4>إجمالي</h4>
                    <div className="ka-analyze-row">
                      <span>رسائل في السلسلة</span>
                      <span>{activeAutomation.steps.filter(s => s.type === "send_email").length}</span>
                    </div>
                    <div className="ka-analyze-row">
                      <span>إجمالي الرسائل المرسلة</span>
                      <span>{activeAutomation.stats.totalSent}</span>
                    </div>
                    <div className="ka-analyze-row">
                      <span>آخر تشغيل</span>
                      <span>{activeAutomation.stats.lastRun ? formatDate(activeAutomation.stats.lastRun) : "—"}</span>
                    </div>
                    <div className="ka-analyze-row">
                      <span>تاريخ الإنشاء</span>
                      <span>{formatDate(activeAutomation.createdAt)}</span>
                    </div>
                  </div>
                  <div className="ka-analyze-section">
                    <h4>النشاط الأخير</h4>
                    <div className="ka-analyze-empty">
                      {Icons.clock}
                      <p>لا يوجد نشاط حتى الآن</p>
                      <p className="ka-analyze-empty-hint">سيظهر النشاط عند دخول مشتركين في السلسلة</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── CONFIG TAB ────── */}
              {sidebarTab === "config" && (
                <div className="ka-sidebar-config">
                  <label className="ka-field-label">الكاتب</label>
                  <input
                    className="ka-field-input"
                    placeholder="اسم الكاتب"
                    value={activeAutomation.authorName}
                    onChange={e => updateAutomation(activeAutomation.id, { authorName: e.target.value })}
                  />

                  <label className="ka-field-label" style={{ marginTop: 20 }}>جدول الإرسال</label>
                  <div className="ka-days-row">
                    {DAY_LABELS.map((d, i) => (
                      <button
                        key={i}
                        className={`ka-day-btn ${activeAutomation.sendDays[i] ? "ka-day-active" : ""}`}
                        onClick={() => {
                          const days = [...activeAutomation.sendDays];
                          days[i] = !days[i];
                          updateAutomation(activeAutomation.id, { sendDays: days });
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <select
                    className="ka-field-select"
                    style={{ marginTop: 12 }}
                    value={activeAutomation.sendTimeWindow}
                    onChange={e => updateAutomation(activeAutomation.id, { sendTimeWindow: e.target.value })}
                  >
                    {Object.entries(TIME_WINDOW_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <p className="ka-field-hint">سيتم إرسال الرسائل في الأوقات والأيام المحددة فقط</p>

                  <label className="ka-field-label" style={{ marginTop: 20 }}>إعادة الدخول</label>
                  <label className="ka-checkbox-label">
                    <input
                      type="checkbox"
                      checked={activeAutomation.allowReentry}
                      onChange={e => updateAutomation(activeAutomation.id, { allowReentry: e.target.checked })}
                    />
                    <span>السماح للمشترك بدخول السلسلة أكثر من مرة</span>
                  </label>
                  <p className="ka-field-hint">غير مستحسن لمعظم سلاسل الرسائل</p>
                </div>
              )}
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
.ka,.ka-builder{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;direction:rtl;text-align:right;color:#111;line-height:1.6;}
.ka{width:100%;max-width:900px;margin:0 auto;padding:0 24px 60px;}

/* ─── LIST VIEW ─── */
.ka-list-header{display:flex;align-items:center;justify-content:space-between;padding:28px 0 20px;}
.ka-page-title{font-size:22px;font-weight:700;margin:0;color:#111;}

.ka-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center;}
.ka-empty-icon{color:#CCC;margin-bottom:16px;}
.ka-empty h3{font-size:17px;font-weight:700;margin:0 0 6px;color:#111;}
.ka-empty p{font-size:14px;color:#999;margin:0 0 20px;}

.ka-list{display:flex;flex-direction:column;gap:1px;background:#E8E8E8;border:1.5px solid #E8E8E8;border-radius:12px;overflow:hidden;}
.ka-list-item{display:flex;align-items:center;gap:14px;padding:16px 20px;background:#fff;cursor:pointer;transition:background .15s;}
.ka-list-item:hover{background:#FAFAFA;}
.ka-list-item-icon{color:#BBB;flex-shrink:0;}
.ka-list-item-info{flex:1;min-width:0;}
.ka-list-item-top{display:flex;align-items:center;gap:8px;}
.ka-list-item-name{font-size:15px;font-weight:600;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ka-badge{font-size:11px;font-weight:600;padding:2px 10px;border-radius:9999px;white-space:nowrap;}
.ka-list-item-trigger{font-size:13px;color:#999;display:block;margin-top:2px;}
.ka-list-item-stats{display:flex;align-items:center;gap:16px;flex-shrink:0;}
.ka-stat-mini{display:flex;align-items:center;gap:4px;font-size:12px;color:#999;}
.ka-stat-mini svg{width:14px;height:14px;}
.ka-list-item-menu{position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#999;cursor:pointer;flex-shrink:0;}
.ka-list-item-menu:hover{background:#F0F0F0;color:#111;}

/* Dropdown */
.ka-dropdown{position:absolute;top:calc(100% + 4px);left:0;min-width:160px;background:#fff;border:1.5px solid #E0E0E0;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,0.08);z-index:100;padding:6px;}
.ka-dropdown-item{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:500;color:#111;text-align:right;cursor:pointer;border-radius:7px;transition:background .15s;}
.ka-dropdown-item:hover{background:#F5F5F5;}
.ka-dropdown-danger{color:#E82222;}
.ka-dropdown-danger:hover{background:#FEF2F2;}

/* ─── BUILDER VIEW ─── */
.ka-builder{position:fixed;top:72px;left:0;right:0;bottom:0;background:#F3F4F6;display:flex;flex-direction:column;z-index:50;}

/* Topbar */
.ka-builder-topbar{display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 20px;background:#fff;border-bottom:1px solid #E8E8E8;flex-shrink:0;}
.ka-builder-topbar-right{display:flex;align-items:center;gap:12px;}
.ka-builder-topbar-center{flex:1;display:flex;justify-content:center;}
.ka-builder-topbar-left{display:flex;align-items:center;gap:8px;}
.ka-status-dot{width:8px;height:8px;border-radius:50%;}
.ka-dot-active{background:#12B76A;}
.ka-dot-paused{background:#F59E0B;}
.ka-topbar-status{font-size:13px;color:#888;font-weight:500;}
.ka-name-btn{display:flex;align-items:center;gap:6px;border:none;background:none;font-family:inherit;font-size:15px;font-weight:600;color:#111;cursor:pointer;padding:6px 10px;border-radius:8px;}
.ka-name-btn:hover{background:#F5F5F5;}
.ka-name-btn svg{color:#BBB;}
.ka-name-edit{display:flex;align-items:center;}
.ka-name-input{height:36px;padding:0 12px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:15px;font-weight:600;color:#111;outline:none;text-align:center;min-width:200px;}
.ka-name-input:focus{border-color:#111;}

/* Run button */
.ka-btn-run{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 18px;border:none;border-radius:9px;background:#111;color:#fff;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s;}
.ka-btn-run:hover{background:#333;}
.ka-btn-run-active{background:#F59E0B;color:#fff;}
.ka-btn-run-active:hover{background:#D97706;}

/* Builder body */
.ka-builder-body{display:flex;flex:1;overflow:hidden;}

/* Canvas */
.ka-canvas{flex:1;overflow:auto;display:flex;justify-content:center;padding:40px 20px 80px;
  background-image:radial-gradient(circle,#D9D9D9 1px,transparent 1px);background-size:24px 24px;}
.ka-canvas-inner{display:flex;flex-direction:column;align-items:center;min-width:400px;max-width:500px;width:100%;}

/* Nodes */
.ka-node{display:flex;align-items:center;gap:12px;width:100%;padding:16px 20px;background:#fff;border:1.5px solid #E0E0E0;border-radius:14px;cursor:pointer;transition:all .15s;position:relative;}
.ka-node:hover{border-color:#BBB;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
.ka-node-selected{border-color:#111;box-shadow:0 0 0 3px rgba(0,0,255,0.08);}
.ka-node-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ka-node-content{flex:1;min-width:0;}
.ka-node-type{font-size:12px;font-weight:600;color:#999;display:block;}
.ka-node-label{font-size:14px;font-weight:600;color:#111;display:block;margin-top:1px;}
.ka-node-arrow{color:#CCC;flex-shrink:0;}
.ka-node-delete{position:absolute;left:12px;top:12px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:none;background:none;color:#CCC;cursor:pointer;border-radius:6px;padding:0;}
.ka-node-delete:hover{background:#F0F0F0;color:#999;}
.ka-node-mini-stats{display:flex;gap:10px;font-size:11px;color:#BBB;position:absolute;bottom:8px;right:68px;}

/* Connector */
.ka-connector{display:flex;flex-direction:column;align-items:center;height:48px;position:relative;}
.ka-connector-line{width:2px;flex:1;background:#E0E0E0;}
.ka-connector-add{width:24px;height:24px;border-radius:50%;border:2px solid #E0E0E0;background:#fff;color:#BBB;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:all .15s;position:relative;}
.ka-connector-add:hover{border-color:#111;color:#111;background:#F5F5F5;}
.ka-connector-add svg{width:12px;height:12px;}

/* End dot */
.ka-end-dot{width:10px;height:10px;border-radius:50%;background:#D9D9D9;}

/* Trigger menu */
.ka-trigger-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:240px;background:#fff;border:1.5px solid #E0E0E0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.1);z-index:200;padding:8px;}
.ka-trigger-menu-title{font-size:12px;font-weight:700;color:#999;padding:8px 12px 4px;text-transform:uppercase;letter-spacing:0.5px;}
.ka-trigger-option{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:none;background:none;font-family:inherit;font-size:14px;font-weight:500;color:#111;text-align:right;cursor:pointer;border-radius:8px;transition:background .15s;}
.ka-trigger-option:hover{background:#F5F5F5;}
.ka-trigger-option-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ka-trigger-back{display:flex;align-items:center;gap:6px;width:100%;padding:8px 12px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:500;color:#888;text-align:right;cursor:pointer;border-radius:8px;}
.ka-trigger-back:hover{background:#F5F5F5;color:#111;}

/* Action menu (on connector) */
.ka-action-menu{position:absolute;top:calc(100% + 4px);left:50%;transform:translateX(-50%);min-width:260px;background:#fff;border:1.5px solid #E0E0E0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.1);z-index:200;padding:8px;}
.ka-action-menu-title{font-size:12px;font-weight:700;color:#999;padding:6px 12px 4px;}
.ka-action-option{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:none;background:none;font-family:inherit;font-size:14px;font-weight:500;color:#111;text-align:right;cursor:pointer;border-radius:8px;transition:background .15s;}
.ka-action-option:hover{background:#F5F5F5;}
.ka-action-option-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.ka-action-option-text{flex:1;min-width:0;}
.ka-action-option-label{font-size:14px;font-weight:600;display:block;}
.ka-action-option-desc{font-size:12px;color:#999;display:block;}

/* ─── SIDEBAR ─── */
.ka-sidebar{width:320px;background:#fff;border-right:1px solid #E8E8E8;display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;}
.ka-sidebar-tabs{display:flex;border-bottom:1px solid #E8E8E8;height:48px;flex-shrink:0;}
.ka-sidebar-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:600;color:#999;cursor:pointer;transition:all .15s;border-bottom:2px solid transparent;}
.ka-sidebar-tab:hover{color:#111;}
.ka-sidebar-tab-active{color:#111;border-bottom-color:#111;}
.ka-tab-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.ka-sidebar-content{flex:1;overflow-y:auto;padding:20px;}

/* Sidebar: Add tab */
.ka-sidebar-add{display:flex;flex-direction:column;gap:4px;}
.ka-sidebar-action-btn{display:flex;align-items:center;gap:12px;width:100%;padding:12px;border:none;background:none;font-family:inherit;text-align:right;cursor:pointer;border-radius:10px;transition:background .15s;}
.ka-sidebar-action-btn:hover{background:#F5F5F5;}
.ka-sidebar-action-dot{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;}
.ka-sidebar-action-text{flex:1;min-width:0;}
.ka-sidebar-action-label{font-size:14px;font-weight:600;color:#111;display:block;}
.ka-sidebar-action-desc{font-size:12px;color:#999;display:block;}

/* Sidebar: Step editor */
.ka-step-editor{animation:kaSlideIn .15s ease-out;}
@keyframes kaSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ka-step-editor-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #F0F0F0;}
.ka-step-editor-header h3{font-size:16px;font-weight:700;margin:0;color:#111;}
.ka-step-fields{display:flex;flex-direction:column;gap:8px;}

/* Fields */
.ka-field-label{font-size:12px;font-weight:700;color:#888;margin-top:8px;}
.ka-field-hint{font-size:12px;color:#BBB;margin:0;}
.ka-field-input{height:40px;padding:0 12px;border:1.5px solid #E0E0E0;border-radius:9px;font-family:inherit;font-size:14px;color:#111;outline:none;background:#fff;transition:border .15s;}
.ka-field-input:focus{border-color:#111;}
.ka-field-input::placeholder{color:#CCC;}
.ka-field-sm{width:80px;flex-shrink:0;}
.ka-field-textarea{padding:10px 12px;border:1.5px solid #E0E0E0;border-radius:9px;font-family:inherit;font-size:14px;color:#111;outline:none;resize:vertical;background:#fff;transition:border .15s;}
.ka-field-textarea:focus{border-color:#111;}
.ka-field-textarea::placeholder{color:#CCC;}
.ka-field-select{height:40px;padding:0 12px;border:1.5px solid #E0E0E0;border-radius:9px;font-family:inherit;font-size:14px;color:#111;outline:none;background:#fff;appearance:auto;cursor:pointer;}
.ka-field-select:focus{border-color:#111;}
.ka-wait-row{display:flex;gap:8px;}
.ka-btn-save{height:40px;border:none;border-radius:9px;background:#111;color:#fff;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;margin-top:12px;transition:background .15s;}
.ka-btn-save:hover{background:#333;}

/* Sidebar: Analyze tab */
.ka-sidebar-analyze{}
.ka-analyze-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;}
.ka-analyze-card{background:#FAFAFA;border:1px solid #F0F0F0;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:4px;}
.ka-analyze-label{font-size:12px;color:#999;font-weight:500;}
.ka-analyze-value{font-size:22px;font-weight:700;color:#111;}
.ka-analyze-section{margin-top:20px;}
.ka-analyze-section h4{font-size:13px;font-weight:700;color:#999;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.5px;}
.ka-analyze-row{display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#555;border-bottom:1px solid #F5F5F5;}
.ka-analyze-row span:last-child{font-weight:600;color:#111;}
.ka-analyze-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px 0;color:#CCC;}
.ka-analyze-empty p{font-size:13px;margin:8px 0 0;}
.ka-analyze-empty-hint{font-size:12px;color:#DDD;margin-top:4px;}

/* Sidebar: Config tab */
.ka-sidebar-config{}
.ka-days-row{display:flex;gap:4px;}
.ka-day-btn{width:38px;height:34px;border:1.5px solid #E0E0E0;border-radius:8px;background:#fff;font-family:inherit;font-size:12px;font-weight:600;color:#999;cursor:pointer;transition:all .15s;padding:0;}
.ka-day-btn:hover{border-color:#BBB;}
.ka-day-active{background:#111;color:#fff;border-color:#111;}
.ka-checkbox-label{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:#555;cursor:pointer;line-height:1.5;}
.ka-checkbox-label input{margin-top:4px;accent-color:#111;}

/* Buttons */
.ka-btn-primary{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 20px;border:none;border-radius:10px;background:#111;color:#fff;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;white-space:nowrap;}
.ka-btn-primary:hover{background:#333;}
.ka-btn-ghost{display:inline-flex;align-items:center;gap:4px;height:34px;padding:0 10px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:600;color:#888;cursor:pointer;border-radius:8px;transition:all .15s;}
.ka-btn-ghost:hover{background:#F0F0F0;color:#111;}
.ka-btn-icon-sm{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:1.5px solid #E0E0E0;border-radius:8px;background:#fff;color:#999;cursor:pointer;padding:0;}
.ka-btn-icon-sm:hover{border-color:#E82222;color:#E82222;background:#FEF2F2;}

/* Responsive */
@media(max-width:768px){
  .ka-sidebar{width:100%;position:fixed;bottom:0;left:0;right:0;height:50vh;border-right:none;border-top:1px solid #E8E8E8;z-index:60;}
  .ka-canvas{padding:20px 12px 60px;}
  .ka-builder-topbar{padding:0 12px;}
  .ka-list-item-stats{display:none;}
}
`;
