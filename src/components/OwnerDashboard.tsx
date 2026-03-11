// ═══════════════════════════════════════════════════════
//  Owner Dashboard — site stats, quick actions, recent articles
// ═══════════════════════════════════════════════════════
import React, { useState } from "react";
import { MOCK_AUTHOR, MOCK_ARTICLES, MOCK_NEWSLETTER, MOCK_STATS, MOCK_CATEGORIES } from "../mockData";

const CSS = `
.kd{direction:rtl;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;background:#F4F4F5;min-height:100vh;color:#1a1a1a;}
.kd *{box-sizing:border-box;margin:0;padding:0;}

/* Top bar */
.kd-topbar{background:#fff;border-bottom:1px solid #E8E8E8;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10;}
.kd-topbar-logo{font-size:20px;font-weight:800;color:#371D12;}
.kd-topbar-sep{width:1px;height:24px;background:#E0E0E0;}
.kd-topbar-title{font-size:14px;color:#888;font-weight:600;}
.kd-topbar-spacer{flex:1;}
.kd-topbar-btn{height:36px;padding:0 16px;border:1.5px solid #E0E0E0;border-radius:8px;background:#fff;color:#371D12;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .15s;}
.kd-topbar-btn:hover{border-color:#371D12;background:#FAFAFA;}
.kd-topbar-btn-primary{background:#371D12;color:#fff;border-color:#371D12;}
.kd-topbar-btn-primary:hover{background:#4a2a1c;}

/* Layout */
.kd-body{max-width:1100px;margin:0 auto;padding:24px 20px 60px;}

/* Welcome */
.kd-welcome{margin-bottom:28px;}
.kd-welcome h1{font-size:24px;font-weight:800;color:#1a1a1a;margin-bottom:4px;}
.kd-welcome p{font-size:14px;color:#888;}

/* Stats grid */
.kd-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
.kd-stat-card{background:#fff;border:1px solid #E8E8E8;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:4px;}
.kd-stat-label{font-size:12px;font-weight:600;color:#999;}
.kd-stat-value{font-size:28px;font-weight:800;color:#1a1a1a;}
.kd-stat-change{font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;}
.kd-stat-up{color:#10B981;}
.kd-stat-down{color:#EF4444;}

/* Quick actions */
.kd-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px;}
.kd-action-card{background:#fff;border:1px solid #E8E8E8;border-radius:12px;padding:20px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:14px;}
.kd-action-card:hover{border-color:#371D12;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.kd-action-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.kd-action-text h3{font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:2px;}
.kd-action-text p{font-size:12px;color:#999;}

/* Two-column */
.kd-two-col{display:grid;grid-template-columns:2fr 1fr;gap:16px;}

/* Articles table */
.kd-panel{background:#fff;border:1px solid #E8E8E8;border-radius:12px;overflow:hidden;}
.kd-panel-header{padding:16px 20px;border-bottom:1px solid #F0F0F0;display:flex;align-items:center;justify-content:space-between;}
.kd-panel-header h2{font-size:15px;font-weight:700;color:#1a1a1a;}
.kd-panel-link{font-size:12px;color:#0000FF;font-weight:600;cursor:pointer;text-decoration:none;}
.kd-article-row{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid #F5F5F5;transition:background .1s;}
.kd-article-row:last-child{border-bottom:none;}
.kd-article-row:hover{background:#FAFAFA;}
.kd-article-thumb{width:48px;height:48px;border-radius:8px;background:#E5E5E5;flex-shrink:0;overflow:hidden;}
.kd-article-thumb img{width:100%;height:100%;object-fit:cover;}
.kd-article-info{flex:1;min-width:0;}
.kd-article-info h4{font-size:13px;font-weight:700;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.kd-article-info p{font-size:11px;color:#999;margin-top:2px;}
.kd-article-stats{display:flex;gap:12px;font-size:11px;color:#BBB;flex-shrink:0;}
.kd-article-stats span{display:flex;align-items:center;gap:3px;}

/* Newsletter panel */
.kd-nl-stat{padding:16px 20px;border-bottom:1px solid #F5F5F5;display:flex;justify-content:space-between;align-items:center;}
.kd-nl-stat:last-child{border-bottom:none;}
.kd-nl-stat-label{font-size:13px;color:#666;}
.kd-nl-stat-value{font-size:15px;font-weight:700;color:#1a1a1a;}
.kd-nl-stat-bar{width:80px;height:6px;background:#F0F0F0;border-radius:3px;overflow:hidden;}
.kd-nl-stat-fill{height:100%;border-radius:3px;background:#0000FF;}

/* Status badge */
.kd-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;}
.kd-badge-published{background:#ECFDF5;color:#059669;}
.kd-badge-draft{background:#FFF7ED;color:#EA580C;}

/* Responsive */
@media(max-width:900px){
  .kd-stats{grid-template-columns:repeat(2,1fr);}
  .kd-actions{grid-template-columns:1fr;}
  .kd-two-col{grid-template-columns:1fr;}
}
@media(max-width:600px){
  .kd-stats{grid-template-columns:1fr 1fr;}
  .kd-topbar{padding:10px 14px;}
  .kd-body{padding:16px 12px 40px;}
}
`;

export default function OwnerDashboard() {
  const author = MOCK_AUTHOR;
  const articles = MOCK_ARTICLES;
  const newsletter = MOCK_NEWSLETTER;
  const stats = MOCK_STATS;

  const formatNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="kd">
      <style>{CSS}</style>

      {/* Top bar */}
      <div className="kd-topbar">
        <span className="kd-topbar-logo">كتابة</span>
        <span className="kd-topbar-sep" />
        <span className="kd-topbar-title">لوحة التحكم</span>
        <span className="kd-topbar-spacer" />
        <button className="kd-topbar-btn" onClick={() => window.location.href = "/"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          تعديل الموقع
        </button>
        <a className="kd-topbar-btn" href="https://kitabh.com/write" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          مقال جديد
        </a>
        <button className="kd-topbar-btn kd-topbar-btn-primary" onClick={() => window.open("https://kitabh.com/@" + author.username, "_blank")}>
          عرض الموقع
        </button>
      </div>

      <div className="kd-body">
        {/* Welcome */}
        <div className="kd-welcome">
          <h1>مرحبا، {author.name.split(" ")[0]}</h1>
          <p>إليك نظرة سريعة على أداء موقعك ونشرتك البريدية</p>
        </div>

        {/* Stats */}
        <div className="kd-stats">
          <div className="kd-stat-card">
            <span className="kd-stat-label">المشتركون</span>
            <span className="kd-stat-value">{formatNum(stats.totalSubscribers)}</span>
            <span className="kd-stat-change kd-stat-up">+12% هذا الشهر</span>
          </div>
          <div className="kd-stat-card">
            <span className="kd-stat-label">الزيارات</span>
            <span className="kd-stat-value">{formatNum(stats.totalViews)}</span>
            <span className="kd-stat-change kd-stat-up">+8% هذا الشهر</span>
          </div>
          <div className="kd-stat-card">
            <span className="kd-stat-label">المقالات</span>
            <span className="kd-stat-value">{stats.totalArticles}</span>
            <span className="kd-stat-change kd-stat-up">+2 هذا الشهر</span>
          </div>
          <div className="kd-stat-card">
            <span className="kd-stat-label">معدل الفتح</span>
            <span className="kd-stat-value">{stats.avgOpenRate}%</span>
            <span className="kd-stat-change kd-stat-up">+3.2% عن الشهر السابق</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="kd-actions">
          <div className="kd-action-card" onClick={() => window.open("https://kitabh.com/write", "_blank")}>
            <div className="kd-action-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <div className="kd-action-text">
              <h3>إنشاء مقال جديد</h3>
              <p>اكتب ونشر مقال جديد في نشرتك</p>
            </div>
          </div>
          <div className="kd-action-card" onClick={() => window.location.href = "/"}>
            <div className="kd-action-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </div>
            <div className="kd-action-text">
              <h3>تعديل الموقع</h3>
              <p>غيّر التصميم وأضف صفحات ومكونات</p>
            </div>
          </div>
          <div className="kd-action-card" onClick={() => window.open("https://kitabh.com/settings/newsletter", "_blank")}>
            <div className="kd-action-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div className="kd-action-text">
              <h3>إعدادات النشرة</h3>
              <p>إدارة المشتركين وقوالب الإيميل</p>
            </div>
          </div>
        </div>

        {/* Two column: Articles + Newsletter stats */}
        <div className="kd-two-col">
          {/* Recent Articles */}
          <div className="kd-panel">
            <div className="kd-panel-header">
              <h2>آخر المقالات</h2>
              <a className="kd-panel-link" href="https://kitabh.com/articles" target="_blank" rel="noopener noreferrer">عرض الكل</a>
            </div>
            {articles.slice(0, 5).map(article => (
              <div key={article._id} className="kd-article-row">
                <div className="kd-article-thumb">
                  {article.coverImage && <img src={article.coverImage} alt="" />}
                </div>
                <div className="kd-article-info">
                  <h4>{article.title}</h4>
                  <p>
                    {formatDate(article.publishedAt)} &middot;{" "}
                    <span className={`kd-badge ${article.status === "published" ? "kd-badge-published" : "kd-badge-draft"}`}>
                      {article.status === "published" ? "منشور" : "مسودة"}
                    </span>
                  </p>
                </div>
                <div className="kd-article-stats">
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {formatNum(article.views)}
                  </span>
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {article.likeCount}
                  </span>
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {article.commentCount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter Stats */}
          <div className="kd-panel">
            <div className="kd-panel-header">
              <h2>النشرة البريدية</h2>
              <span style={{ fontSize: 12, color: "#999" }}>{newsletter.displayName}</span>
            </div>
            <div className="kd-nl-stat">
              <span className="kd-nl-stat-label">إجمالي المشتركين</span>
              <span className="kd-nl-stat-value">{formatNum(newsletter.emailStats.totalSubscribers)}</span>
            </div>
            <div className="kd-nl-stat">
              <span className="kd-nl-stat-label">معدل الفتح</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="kd-nl-stat-value">{newsletter.emailStats.avgOpenRate}%</span>
                <div className="kd-nl-stat-bar"><div className="kd-nl-stat-fill" style={{ width: `${newsletter.emailStats.avgOpenRate}%` }} /></div>
              </div>
            </div>
            <div className="kd-nl-stat">
              <span className="kd-nl-stat-label">معدل النقر</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="kd-nl-stat-value">{newsletter.emailStats.avgClickRate}%</span>
                <div className="kd-nl-stat-bar"><div className="kd-nl-stat-fill" style={{ width: `${newsletter.emailStats.avgClickRate * 3}%` }} /></div>
              </div>
            </div>
            <div className="kd-nl-stat">
              <span className="kd-nl-stat-label">إجمالي الرسائل المرسلة</span>
              <span className="kd-nl-stat-value">{formatNum(newsletter.emailStats.totalSent)}</span>
            </div>
            <div className="kd-nl-stat">
              <span className="kd-nl-stat-label">إلغاءات الاشتراك</span>
              <span className="kd-nl-stat-value">{newsletter.emailStats.totalUnsubscribes}</span>
            </div>
            <div className="kd-nl-stat">
              <span className="kd-nl-stat-label">التكرار</span>
              <span className="kd-nl-stat-value">{newsletter.frequency === "weekly" ? "أسبوعي" : newsletter.frequency === "daily" ? "يومي" : "شهري"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
