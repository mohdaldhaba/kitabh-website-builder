// ═══════════════════════════════════════════════════════
//  Article View Wrapper — themed header for article pages
//  In production, the article body comes from Kitabh's
//  existing reader. This component only adds a themed
//  navigation header that matches the business website.
// ═══════════════════════════════════════════════════════
import React from "react";
import { MOCK_AUTHOR, MOCK_ARTICLES, MOCK_NEWSLETTER, findArticleById } from "../mockData";

const CSS = `
.kav{direction:rtl;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;min-height:100vh;background:#fff;}
.kav *{box-sizing:border-box;margin:0;padding:0;}

/* Themed header */
.kav-header{padding:0 24px;border-bottom:1px solid rgba(0,0,0,0.08);}
.kav-header-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;height:56px;gap:24px;}
.kav-logo{font-size:18px;font-weight:800;text-decoration:none;color:inherit;}
.kav-nav{display:flex;gap:16px;flex:1;}
.kav-nav a{font-size:13px;font-weight:600;color:inherit;text-decoration:none;opacity:0.6;transition:opacity .15s;cursor:pointer;}
.kav-nav a:hover,.kav-nav a.active{opacity:1;}
.kav-subscribe-btn{height:32px;padding:0 16px;border:none;border-radius:8px;color:#fff;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:opacity .15s;}
.kav-subscribe-btn:hover{opacity:0.9;}

/* Article body */
.kav-body{max-width:720px;margin:0 auto;padding:40px 20px 80px;}
.kav-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#999;text-decoration:none;margin-bottom:24px;cursor:pointer;}
.kav-back:hover{color:#371D12;}
.kav-category{font-size:12px;font-weight:700;text-transform:uppercase;margin-bottom:8px;display:inline-block;padding:3px 10px;border-radius:4px;}
.kav-title{font-size:32px;font-weight:800;line-height:1.4;margin-bottom:12px;}
.kav-subtitle{font-size:16px;color:#888;line-height:1.6;margin-bottom:20px;}
.kav-meta{display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #F0F0F0;}
.kav-avatar{width:40px;height:40px;border-radius:50%;background:#E5E5E5;overflow:hidden;flex-shrink:0;}
.kav-avatar img{width:100%;height:100%;object-fit:cover;}
.kav-author-name{font-size:14px;font-weight:700;}
.kav-date{font-size:12px;color:#999;}
.kav-stats{display:flex;gap:16px;margin-right:auto;font-size:13px;color:#999;}
.kav-stats span{display:flex;align-items:center;gap:4px;}
.kav-cover{width:100%;border-radius:12px;background:#E5E5E5;height:400px;margin-bottom:32px;overflow:hidden;}
.kav-cover img{width:100%;height:100%;object-fit:cover;}
.kav-content{font-size:18px;line-height:2;color:#333;}
.kav-content p{margin-bottom:20px;}
.kav-content h3{font-size:22px;font-weight:700;margin:32px 0 12px;color:#1a1a1a;}
.kav-content blockquote{border-right:4px solid;padding:12px 20px;margin:24px 0;background:#FAFAFA;border-radius:0 8px 8px 0;font-style:italic;color:#555;}

/* Newsletter CTA */
.kav-cta{background:#F8F8F8;border-radius:12px;padding:32px;text-align:center;margin-top:40px;}
.kav-cta h3{font-size:18px;font-weight:700;margin-bottom:8px;}
.kav-cta p{font-size:14px;color:#888;margin-bottom:16px;}
.kav-cta-form{display:flex;gap:8px;max-width:400px;margin:0 auto;}
.kav-cta-input{flex:1;height:42px;padding:0 14px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:14px;outline:none;}
.kav-cta-input:focus{border-color:#0000FF;}
.kav-cta-btn{height:42px;padding:0 20px;border:none;border-radius:8px;color:#fff;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;}

@media(max-width:600px){
  .kav-title{font-size:24px;}
  .kav-body{padding:20px 14px 40px;}
  .kav-cover{height:220px;}
  .kav-cta-form{flex-direction:column;}
  .kav-meta{flex-wrap:wrap;}
  .kav-stats{margin-right:0;width:100%;margin-top:8px;}
}
`;

interface ArticleViewWrapperProps {
  articleSlug?: string;
  // Theme overrides from the business website
  headerBg?: string;
  headerText?: string;
  buttonColor?: string;
  fontFamily?: string;
  siteName?: string;
  navLinks?: { label: string; href: string }[];
}

export default function ArticleViewWrapper({
  articleSlug,
  headerBg = "#ffffff",
  headerText = "#1a1a1a",
  buttonColor = "#E82222",
  fontFamily = "IBM Plex Sans Arabic",
  siteName = MOCK_AUTHOR.name,
  navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "مقالات", href: "/articles" },
    { label: "عن المدونة", href: "/about" },
  ],
}: ArticleViewWrapperProps) {
  // Find article by slug or default to first
  const article = articleSlug
    ? MOCK_ARTICLES.find(a => a.slug === articleSlug) || MOCK_ARTICLES[0]
    : MOCK_ARTICLES[0];
  const author = MOCK_AUTHOR;
  const newsletter = MOCK_NEWSLETTER;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    console.log("Newsletter subscribe:", { email, subscribedTo: author._id, source: "article_cta" });
    alert("شكرا لاشتراكك!");
  };

  return (
    <div className="kav" style={{ fontFamily: `'${fontFamily}', system-ui, sans-serif` }}>
      <style>{CSS}</style>

      {/* Themed header — matches the business website */}
      <div className="kav-header" style={{ background: headerBg, color: headerText }}>
        <div className="kav-header-inner">
          <a className="kav-logo" href="/">{siteName}</a>
          <nav className="kav-nav">
            {navLinks.map((link, i) => (
              <a key={i} href={link.href}>{link.label}</a>
            ))}
          </nav>
          <button className="kav-subscribe-btn" style={{ background: buttonColor }}>اشتراك</button>
        </div>
      </div>

      {/* Article */}
      <div className="kav-body">
        <a className="kav-back" onClick={() => window.history.back()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          العودة للمقالات
        </a>

        {article.categories.length > 0 && (
          <span className="kav-category" style={{ background: buttonColor + "15", color: buttonColor }}>
            {article.tags[0] || "مقالات"}
          </span>
        )}

        <h1 className="kav-title">{article.title}</h1>
        {article.subTitle && <p className="kav-subtitle">{article.subTitle}</p>}

        <div className="kav-meta">
          <div className="kav-avatar">
            <img src={author.profileImage} alt="" />
          </div>
          <div>
            <div className="kav-author-name">{author.name}</div>
            <div className="kav-date">{formatDate(article.publishedAt)} &middot; {Math.ceil(article.wordCount / 250)} دقائق قراءة</div>
          </div>
          <div className="kav-stats">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {article.likeCount}
            </span>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {article.commentCount}
            </span>
          </div>
        </div>

        <div className="kav-cover">
          {article.coverImage && <img src={article.coverImage} alt="" />}
        </div>

        {/* Article content — in production this is Kitabh's existing reader */}
        <div className="kav-content">
          <p>{article.articleText}</p>
          <h3>عنوان فرعي للمقال</h3>
          <p>يدعم المقال إضافة صور وعناوين فرعية واقتباسات وقوائم نقطية ومرقمة. كل هذه العناصر تساعد في تنظيم المحتوى وتسهيل قراءته.</p>
          <blockquote style={{ borderColor: buttonColor }}>الكتابة الجيدة هي إعادة الكتابة. لا تخف من تعديل نصك حتى يصل إلى أفضل صورة ممكنة.</blockquote>
          <p>في النهاية، يُختتم المقال بملخص أو دعوة للتفاعل مع المحتوى من خلال التعليقات أو مشاركة المقال مع الآخرين.</p>
        </div>

        {/* Newsletter CTA at bottom */}
        <div className="kav-cta">
          <h3>اشترك في {newsletter.displayName}</h3>
          <p>{newsletter.description.slice(0, 80)}</p>
          <form className="kav-cta-form" onSubmit={handleSubscribe}>
            <input name="email" type="email" className="kav-cta-input" placeholder="أدخل بريدك الإلكتروني" required />
            <button type="submit" className="kav-cta-btn" style={{ background: buttonColor }}>اشتراك</button>
          </form>
        </div>
      </div>
    </div>
  );
}
