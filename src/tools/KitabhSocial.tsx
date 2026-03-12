// ═══════════════════════════════════════════════════════
//  Kitabh Social v15 - Framer Code Component
//  v14 + tabbed results, branded publish buttons, embedded studio
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react"

// ─── Config ───────────────────────────────────────────
const HUBSPOT_PORTAL = "47847903"
const HUBSPOT_FORM = "6e4cab97-974f-42f5-bbe2-4af59b0e50ac"

// ─── Auth helper ─────────────────────────────────────
function getUser():{authenticated:boolean;premium:boolean;email:string}{
  try{const u=(window as any).__KITABH_USER;if(u)return{authenticated:!!u.authenticated,premium:!!u.premium,email:u.email||""}}catch(_){}
  return{authenticated:false,premium:false,email:""}
}

// ─── Shared trial system (5 lifetime uses) ───────────
const USAGE_KEY = "kb_tools_usage"
const TOOL_ID = "social"
const MAX_FREE = 5

function getUsage():number{
  try{const d=JSON.parse(localStorage.getItem(USAGE_KEY)||"{}");return d[TOOL_ID]||0}catch(_){return 0}
}
function recordUsage(){
  try{const d=JSON.parse(localStorage.getItem(USAGE_KEY)||"{}");d[TOOL_ID]=(d[TOOL_ID]||0)+1;localStorage.setItem(USAGE_KEY,JSON.stringify(d))}catch(_){}
}
function canUse(premium:boolean):boolean{return premium||getUsage()<MAX_FREE}
function usesLeft(premium:boolean):number{return premium?Infinity:Math.max(0,MAX_FREE-getUsage())}

// ─── Platform definitions ─────────────────────────────
type PlatformId = "x"|"linkedin_ar"|"linkedin_en"|"instagram"|"tiktok"|"youtube"|"facebook"

const PLATFORMS: {id:PlatformId;label:string;short:string}[] = [
  {id:"x",label:"إكس",short:"إكس"},
  {id:"linkedin_ar",label:"لينكدإن (عربي)",short:"لينكدإن ع"},
  {id:"linkedin_en",label:"لينكدإن (إنجليزي)",short:"لينكدإن إن"},
  {id:"instagram",label:"إنستغرام",short:"إنستغرام"},
  {id:"tiktok",label:"تيك توك",short:"تيك توك"},
  {id:"youtube",label:"يوتيوب",short:"يوتيوب"},
  {id:"facebook",label:"فيسبوك",short:"فيسبوك"},
]
const PS: Record<PlatformId,{c:string;b:string}> = {
  x:{c:"#000",b:"#F5F5F5"},linkedin_ar:{c:"#0A66C2",b:"#EBF4FF"},linkedin_en:{c:"#0A66C2",b:"#EBF4FF"},
  instagram:{c:"#E4405F",b:"#FDF0F3"},tiktok:{c:"#000",b:"#F0FFFE"},youtube:{c:"#FF0000",b:"#FEF2F2"},facebook:{c:"#1877F2",b:"#EBF4FF"},
}
const PI: Record<PlatformId,JSX.Element> = {
  x:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  linkedin_ar:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  linkedin_en:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  instagram:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  tiktok:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  youtube:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  facebook:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
}

// ─── Settings option definitions ──────────────────────
const TONES = ["فصيح","عامي","رسمي","ودّي","تحفيزي","ساخر","تعليمي","احترافي","نبرة مخصصة"]
const OBJECTIVES = ["تعبير ومشاركة","بيع وتسويق","بناء علامة شخصية","جذب عملاء","زيادة التفاعل","نشر معرفة","إطلاق منتج","إعلان"]
const STYLES = ["مختصر (سريع)","متوسط","طويل","سلسلة","نقاط","قصة","خطاف + دعوة"]
const INTENSITIES = ["هادئ","متوازن","جريء","هجومي"]
const CTA_PRESETS = ["اشترك الآن","تواصل معنا","جرّب مجانًا","احجز موعد","تواصل بالخاص","دعوة مخصصة"]
const EMOJI_LEVELS = ["بدون","خفيف","متوسط","كثير"]
const LANGUAGES = ["عربي","إنجليزي","ثنائي اللغة","ترجمة إلى…"]
const TRANSFORMS = ["إعادة صياغة فقط","تحويل لأسلوب مختلف","تلخيص","تبسيط","توسيع","تحويل إلى سيناريو فيديو"]

// ─── Loading steps ────────────────────────────────────
const LOADING_STEPS = [
  {icon:"book",text:"نقرأ مقالتك بعناية..."},
  {icon:"paper",text:"نستخرج الأفكار الرئيسية..."},
  {icon:"star",text:"نحلّل أسلوبك وصوتك..."},
  {icon:"quotes",text:"نكتب المحتوى لكل منصة..."},
  {icon:"message",text:"نراجع الصياغة والهاشتاقات..."},
  {icon:"check",text:"نجهّز محتواك الجاهز..."},
]

// ─── Settings State Type ──────────────────────────────
interface Cfg {
  tone:string; customTone:string; objective:string; contentStyle:string; intensity:string
  enableCTA:boolean; ctaValue:string; customCTA:string
  enableHashtags:boolean; hashtagMode:"auto"|"custom"; hashtagCount:number; customHashtags:string
  emojiLevel:string; languageMode:string; targetLanguage:string; transformType:string
  links:string[]; linksPlacement:"inline"|"end"
}
const DEFAULT_CFG: Cfg = {
  tone:"ودّي", customTone:"", objective:"تعبير ومشاركة", contentStyle:"متوسط", intensity:"متوازن",
  enableCTA:false, ctaValue:"اشترك الآن", customCTA:"",
  enableHashtags:true, hashtagMode:"auto", hashtagCount:3, customHashtags:"",
  emojiLevel:"خفيف", languageMode:"عربي", targetLanguage:"", transformType:"إعادة صياغة فقط",
  links:[], linksPlacement:"end",
}

// ─── Studio data (from KitabhCarousel v14) ──────────
const ST_TEMPLATES = [
  {id:"kitabh",label:"أزرق كتابة",bg:"#0000FF",text:"#FFFFFF",accent:"#FFD700",sc:"#FFD700"},
  {id:"classic",label:"كلاسيكي",bg:"#F5F0EB",text:"#1A1A1A",accent:"#0000FF",sc:"#0000FF"},
  {id:"electric",label:"كهربائي",bg:"#4361EE",text:"#FFFFFF",accent:"#C8FF00",sc:"#C8FF00"},
  {id:"sunshine",label:"مشمس",bg:"#FFE135",text:"#1A1A1A",accent:"#FF6B35",sc:"#FF6B35"},
  {id:"coral",label:"مرجاني",bg:"#FF6B6B",text:"#FFFFFF",accent:"#FFE66D",sc:"#FFE66D"},
  {id:"neon",label:"نيون",bg:"#39FF14",text:"#0A0A0A",accent:"#1A1A2E",sc:"#0A0A0A"},
  {id:"sunset",label:"غروب",bg:"#FF6700",text:"#FFFFFF",accent:"#4A0E4E",sc:"#FFFFFF"},
  {id:"lavender",label:"بنفسجي",bg:"#7B2D8E",text:"#F4A261",accent:"#FFFFFF",sc:"#F4A261"},
  {id:"rose",label:"وردي",bg:"#FF1493",text:"#FFFFFF",accent:"#FFE0E0",sc:"#FFD700"},
  {id:"mint",label:"نعناعي",bg:"#B8E0D2",text:"#1B4332",accent:"#2D6A4F",sc:"#1B4332"},
  {id:"forest",label:"غابة",bg:"#2D6A4F",text:"#F0E6D3",accent:"#A7F3D0",sc:"#A7F3D0"},
  {id:"midnight",label:"داكن",bg:"#1A1A2E",text:"#EAEAEA",accent:"#4CC9F0",sc:"#4CC9F0"},
  {id:"darkcard",label:"بطاقة داكنة",bg:"#1A1A1A",text:"#FFFFFF",accent:"#E63946",sc:"#E63946"},
  {id:"boldyellow",label:"أصفر جريء",bg:"#FFD600",text:"#1A1A1A",accent:"#1A1A1A",sc:"#1A1A1A"},
  {id:"calmgray",label:"رمادي هادئ",bg:"#B8C4C8",text:"#2C2C2C",accent:"#D4A574",sc:"#2C2C2C"},
  {id:"notebook",label:"دفتر",bg:"#FFFDF7",text:"#2C2C2C",accent:"#F5C518",sc:"#F5C518"},
  {id:"nature",label:"أخضر طبيعي",bg:"#2D8B5E",text:"#FFFFFF",accent:"#C8E6C9",sc:"#C8E6C9"},
  {id:"beige",label:"بيج أنيق",bg:"#E8DDD3",text:"#3D2B1F",accent:"#8B6914",sc:"#8B6914"},
]
const ST_SHAPES: string[] = [
  `<circle cx="50" cy="52" r="30"/>`,
  `<polygon points="50,16 82,52 50,88 18,52"/>`,
  `<path d="M15,62 A35,35 0 0,1 85,62 Z"/>`,
  `<polygon points="50,15 59,40 85,40 65,56 73,82 50,66 27,82 35,56 15,40 41,40"/>`,
  `<polygon points="50,18 84,80 16,80"/>`,
  `<path d="M24,84 L24,48 Q24,18 50,18 Q76,18 76,48 L76,84 Z"/>`,
  `<circle cx="50" cy="32" r="15"/><circle cx="50" cy="68" r="15"/><circle cx="32" cy="50" r="15"/><circle cx="68" cy="50" r="15"/>`,
  `<polygon points="50,14 82,32 82,68 50,86 18,68 18,32"/>`,
  `<rect x="36" y="14" width="28" height="72" rx="12"/><rect x="14" y="36" width="72" height="28" rx="12"/>`,
  `<path d="M50,16 Q80,16 80,56 A30,30 0 0,1 20,56 Q20,16 50,16 Z"/>`,
  `<path d="M14,68 A36,36 0 0,1 86,68 Z"/>`,
  `<path d="M58,14 A36,36 0 1,0 58,86 A26,26 0 1,1 58,14 Z"/>`,
  `<rect x="20" y="25" width="60" height="50" rx="12"/>`,
  `<path d="M50,15 C75,15 90,35 85,55 C80,75 60,90 40,80 C20,70 10,50 20,30 C30,15 40,15 50,15 Z"/>`,
  `<path d="M10,60 Q30,20 50,50 Q70,80 90,40 L90,90 L10,90 Z"/>`,
  `<path d="M50,15 A35,35 0 1,0 50,85 A35,35 0 1,0 50,15 Z M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30 Z" fill-rule="evenodd"/>`,
  `<path d="M50,12 Q88,28 82,68 Q76,88 50,92 Q24,88 18,68 Q12,28 50,12 Z"/>`,
  `<path d="M50,8 L62,24 L50,40 L38,24 Z M24,32 L36,48 L24,64 L12,48 Z M76,32 L88,48 L76,64 L64,48 Z M50,56 L62,72 L50,88 L38,72 Z"/>`,
]
const ST_SHAPE_LEVELS = [
  {id:0,label:"بدون",size:0,opacity:0},
  {id:1,label:"خفيف",size:0.45,opacity:0.06},
  {id:2,label:"متوسط",size:0.65,opacity:0.2},
  {id:3,label:"كثيف",size:0.9,opacity:0.55},
]
const ST_FONTS = [
  {id:"alyamama",label:"Alyamama",family:"'Alyamama'"},
  {id:"readex",label:"Readex Pro",family:"'Readex Pro'"},
  {id:"rubik",label:"Rubik",family:"'Rubik'"},
  {id:"ibm",label:"IBM Plex Sans Arabic",family:"'IBM Plex Sans Arabic'"},
  {id:"amiri",label:"Amiri",family:"'Amiri'"},
  {id:"playpen",label:"Playpen Sans Arabic",family:"'Playpen Sans Arabic'"},
]
const ST_SIZES: {id:string;label:string;w:number;h:number}[] = [
  {id:"post",label:"بوست ٣:٤",w:1080,h:1440},
  {id:"story",label:"ستوري ٩:١٦",w:1080,h:1920},
  {id:"youtube",label:"يوتيوب ١٦:٩",w:1920,h:1080},
]
const ST_LOGO_SVG = `<g><path d="m63.34,29.83c0-6.33-3.69-12.15-9.5-14.63-2.41-1.03-5.07-1.6-7.86-1.6h-.74v21.9h18.11v-5.67Z"/><path d="m76.44,67.08c0,6.52,3.93,12.45,10,14.85,2.28.9,4.76,1.39,7.36,1.39h.75v-21.9h-18.1v5.66Z"/><path d="m88.69,13.59c-11.69,0-21.16,9.47-21.16,21.16v21.56c0,2.82-2.29,5.11-5.11,5.11h-17.2v21.9h5.86c11.68,0,21.15-9.47,21.16-21.15v-21.57c0-2.82,2.29-5.11,5.11-5.11h17.19V13.59h-5.85Z"/></g><g><path d="m160.32,76.39c11.17,0,15.38-8.76,18.89-22.21,1.35-5.17,6.44-24.69,6.44-24.69l-10.39,2.53s-3.91,14.97-4.6,17.57c-1.33,5.03-1.6,6.19-5.05,6.19h-4.16c-4.72,0-4.44-1.94-2.73-8.49.49-1.88,5.81-22.29,5.81-22.29l-10.4,2.29-7.64,29.15s-.33,1.39-.5,2.08c-2.52,10.04.66,17.86,11.96,17.86h2.37Zm-6.2-45.9s-22.98,7.08-25.98,8.65c-5.95,3.13-7.5,9.11-8.14,14.39-.17,1.45-.75,5.94-.94,7.52-1.08,8.99,3.39,12.64,9.87,12.64h.34c7.91,0,10.79-5.78,12.32-12.46.49-2.16,1.12-4.94,1.12-4.94l5.88.15,1.3-6.71h-19.27c0-3.42.94-6.76,7.93-8.73,3.61-1.01,14-3.66,14-3.66l1.55-6.86Z"/><path d="m204.33,53.62c-4.95,0-5.85-1.45-4.73-5.61.49-1.82,9.14-35.05,9.14-35.05l-10.64,3.42-5.57,21.39s-2.77,10.59-3.22,12.25c-3.56,12.92-5.42,25.56,9.15,25.56h3.57l5.92-21.96h-3.62Z"/><path d="m236.27,53.62c-8.1,0-10.21-1.49-8.1-9.53l3.24-12.43-10.39,2.53-3,11.51c-1.7,6.6-2.22,7.92-7.94,7.92h-3.85l-4.19,21.96h3.85c9.6,0,15.62-7.11,17.71-14.91.18-.68.44-1.61.44-1.61h2.96s-.12,2.06-.19,3.89c-.28,7.38,5.87,12.62,14.11,12.62h4.57l-1.85-21.96h-7.37Z"/><path d="m268.4,25c-7.21,0-13.27,1.15-15.92,3.54-2.47,2.22-1.74,4.25,2.25,4.25h88.43c14.96,0,18.92,7.19,16.22,16.61l-.3,1.03c-4.59,15.99-10.35,25.16-32.38,25.16h-81.83l-1.37-21.96h107.22c1.98,0,3.64-1.69,3.39-3.66-.29-2.25-2.3-4.7-9.63-4.7h-84.96c-14.15,0-15.72-5.67-13.73-12.61l.13-.45c2.39-8.34,16.24-21.87,40.98-21.87h5.21l-5.92,14.66h-17.81Z"/><polygon points="169.11 80.26 159.83 87.63 166.51 95 175.8 87.63 169.11 80.26"/><polygon points="151.22 8.38 141.94 15.75 148.62 23.12 157.91 15.75 151.22 8.38"/><polygon points="137.02 8.38 127.74 15.75 134.42 23.12 143.71 15.75 137.02 8.38"/><polygon points="223.74 8.99 214.45 16.36 221.14 23.73 230.42 16.36 223.74 8.99"/><polygon points="238.9 8.99 229.61 16.36 236.3 23.73 245.58 16.36 238.9 8.99"/></g>`

type StLayout = "title"|"title-body"|"body"
const ST_LAYOUTS:{id:StLayout;label:string}[] = [
  {id:"title",label:"عنوان"},
  {id:"title-body",label:"عنوان وفقرة"},
  {id:"body",label:"فقرة فقط"},
]
type StCoverLayout = "img-top"|"img-bottom"|"img-full"|"title-top"|"minimal"
const ST_COVER_LAYOUTS:{id:StCoverLayout;label:string}[] = [
  {id:"img-full",label:"غلاف كامل"},{id:"img-top",label:"صورة بالأعلى"},{id:"img-bottom",label:"صورة بالأسفل"},{id:"title-top",label:"عنوان فوق"},{id:"minimal",label:"بسيط"},
]
interface StSlide { layout:StLayout; headline:string; body:string; fontScale?:number; imageUrl?:string; imagePos?:number; coverLayout?:StCoverLayout }

function stLoadImage(src:string):Promise<HTMLImageElement|ImageBitmap>{
  if(src.startsWith("data:")) return fetch(src).then(r=>r.blob()).then(b=>createImageBitmap(b))
  return new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Image load failed"));img.src=src})
}
function stDrawImageCover(ctx:CanvasRenderingContext2D,img:HTMLImageElement|ImageBitmap,x:number,y:number,w:number,h:number,posY:number=50){
  const iAr=img.width/img.height,tAr=w/h;let sx=0,sy=0,sw=img.width,sh=img.height
  if(iAr>tAr){sw=img.height*tAr;sx=(img.width-sw)/2}else{sh=img.width/tAr;sy=(img.height-sh)*(posY/100)}
  ctx.drawImage(img as any,sx,sy,sw,sh,x,y,w,h)
}
function stDrawRoundedImage(ctx:CanvasRenderingContext2D,img:HTMLImageElement|ImageBitmap,x:number,y:number,w:number,h:number,r:number,posY:number=50){
  ctx.save();ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.clip()
  stDrawImageCover(ctx,img,x,y,w,h,posY);ctx.restore()
}

function stWrapText(ctx:CanvasRenderingContext2D, text:string, maxW:number):string[] {
  if (!text) return []
  const words = text.split(/\s+/); const lines:string[] = []; let cur = ""
  for (const w of words) { const t = cur ? cur+" "+w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t }
  if (cur) lines.push(cur); return lines
}
function stLoadSvgImage(svgContent:string):Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgContent], {type:'image/svg+xml'}); const url = URL.createObjectURL(blob); const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }; img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("SVG load failed")) }; img.src = url
  })
}
function stLoadLogoImage(fillColor:string):Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" fill="${fillColor}">${ST_LOGO_SVG}</svg>`
    const blob = new Blob([svg], {type:'image/svg+xml'}); const url = URL.createObjectURL(blob); const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }; img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Logo load failed")) }; img.src = url
  })
}

// ─── Auto-detect settings from pasted text ───────────
function detectSettings(text: string): Partial<Cfg> & { detectedLinks: string[] } {
  const out: Partial<Cfg> = {}
  const detectedLinks: string[] = []

  // Detect links in text
  const urlRegex = /https?:\/\/[^\s,،)>"']+/gi
  const urls = text.match(urlRegex)
  if (urls) {
    urls.forEach(u => { const clean = u.replace(/[.,،;:!?]+$/, ""); if (!detectedLinks.includes(clean)) detectedLinks.push(clean) })
    out.linksPlacement = "end"
  }

  // Detect language
  const enChars = (text.match(/[a-zA-Z]/g) || []).length
  const arChars = (text.match(/[\u0600-\u06FF]/g) || []).length
  const total = enChars + arChars
  if (total > 0) {
    const enRatio = enChars / total
    if (enRatio > 0.7) out.languageMode = "إنجليزي"
    else if (enRatio > 0.3) out.languageMode = "ثنائي اللغة"
    else out.languageMode = "عربي"
  }

  // Detect tone from keywords
  const lower = text.toLowerCase()
  const hasAcademic = /دراسة|بحث|تحليل|نتائج|إحصائ|أكاديم|علمي/.test(text)
  const hasInformal = /يا جماعة|بصراحة|والله|يعني|خلّ|ترا|ياخي|ياحبيبي/.test(text)
  const hasSales = /عرض|خصم|اشتر|سعر|ريال|\$|USD|احجز|كوبون|تخفيض|مجان/.test(text)
  const hasMotivation = /حلم|نجاح|طموح|إنجاز|تحدّ|غيّر حيات|لا تستسلم|حقّق/.test(text)
  const hasTeaching = /خطوات|طريقة|كيف|دليل|شرح|تعلّم|نصائح|أخطاء/.test(text)
  const hasSarcasm = /للأسف|المفارقة|عجيب|غريب|ساخر|مضحك/.test(text)

  if (hasInformal) out.tone = "عامي"
  else if (hasAcademic) out.tone = "رسمي"
  else if (hasSarcasm) out.tone = "ساخر"
  else if (hasMotivation) out.tone = "تحفيزي"
  else if (hasTeaching) out.tone = "تعليمي"
  else if (hasSales) out.tone = "احترافي"

  // Detect objective
  if (hasSales) out.objective = "بيع وتسويق"
  else if (hasTeaching) out.objective = "نشر معرفة"
  else if (hasMotivation) out.objective = "بناء علامة شخصية"
  else if (/منتج|إطلاق|جديد|حصري|أعلن/.test(text)) out.objective = "إطلاق منتج"

  // Detect content style from length
  const wc = text.trim().split(/\s+/).length
  if (wc < 150) out.contentStyle = "مختصر (سريع)"
  else if (wc < 400) out.contentStyle = "متوسط"
  else if (wc < 800) out.contentStyle = "طويل"
  else out.contentStyle = "تلخيص"

  // If text has story markers
  if (/حكاية|قصة|بدأت|كنت أعمل|في يوم|حصل معي/.test(text)) out.contentStyle = "قصة"

  // If text has bullet points / numbered lists
  if (/^\s*[\d١٢٣٤٥٦٧٨٩٠]+[.)]\s/m.test(text) || /^\s*[-•]\s/m.test(text)) out.contentStyle = "نقاط"

  // Detect intensity
  if (/صادم|خطير|عاجل|تحذير|كارثة|فضيحة/.test(text)) out.intensity = "هجومي"
  else if (hasSales || hasMotivation) out.intensity = "جريء"

  // Detect CTA
  if (/اشترك|سجّل|حمّل|تابع|انضم|شارك/.test(text)) { out.enableCTA = true; out.ctaValue = "اشترك الآن" }
  if (/تواصل|راسل|اتصل|خاص/.test(text)) { out.enableCTA = true; out.ctaValue = "تواصل معنا" }
  if (/مجان|free|trial/.test(lower)) { out.enableCTA = true; out.ctaValue = "جرّب مجانًا" }

  // Detect emoji presence
  const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length
  if (emojiCount === 0) out.emojiLevel = "بدون"
  else if (emojiCount <= 3) out.emojiLevel = "خفيف"
  else if (emojiCount <= 8) out.emojiLevel = "متوسط"
  else out.emojiLevel = "كثير"

  // Detect hashtags
  const hashtags = text.match(/#[\u0600-\u06FFa-zA-Z_]\S*/g)
  if (hashtags && hashtags.length > 0) {
    out.enableHashtags = true
    out.hashtagMode = "custom"
    out.customHashtags = hashtags.slice(0, 10).join(" ")
    out.hashtagCount = Math.min(10, hashtags.length)
  }

  return { ...out, detectedLinks }
}

// ─── Build prompt (v7 — rewritten for coherence) ─────
function buildPrompt(platformIds: PlatformId[], cfg: Cfg, superHook = false): string {
  const isThread = cfg.contentStyle === "سلسلة"

  const platInstructions = platformIds.map(id => {
    switch(id) {
      case "x": return isThread
        ? `"x": ثريد 5-7 تغريدات متسلسلة. كل تغريدة ≤270 حرف. افصل بين التغريدات بعلامة --- على سطر منفصل. التغريدة الأولى = خطاف قوي. الأخيرة = CTA. كل تغريدة تكمل سابقتها في سياق واحد متماسك.`
        : `"x": منشور واحد متماسك ≤280 حرف. ابدأ بخطاف قوي (جملة واحدة مثيرة) ← فكرة رئيسية واحدة واضحة ← CTA مختصر أو خاتمة. ممنوع نهائياً: جمل منفصلة بدون رابط بينها. ممنوع: سرد أفكار متعددة. النتيجة يجب أن تكون فقرة واحدة متدفقة.`
      case "linkedin_ar": return `"linkedin_ar": منشور لينكدإن بالعربية 800-1500 حرف. السطر الأول = خطاف (إحصائية صادمة / تجربة / سؤال مثير / نتيجة غير متوقعة). ثم 3-5 فقرات قصيرة (2-3 أسطر لكل فقرة)، كل فقرة تكمل الفكرة السابقة وتبني عليها. اختم بـ CTA أو سؤال. 3-5 هاشتاقات في النهاية.`
      case "linkedin_en": return `"linkedin_en": LinkedIn post in English, 800-1500 chars. First line = hook (shocking stat / personal story / counterintuitive claim). Then 3-5 short paragraphs, each building on the previous. End with CTA or question. 3-5 hashtags at end.`
      case "instagram": return `"instagram": كابشن إنستغرام بالعربية. السطر الأول = خطاف يوقف السكرول (جملة جريئة / رقم / تحدٍّ). ثم 3-5 فقرات قصيرة مترابطة تبني على الخطاف. CTA واضح. 15-20 هاشتاق في أسطر منفصلة بالنهاية.`
      case "tiktok": return `"tiktok": حقل "text" = وصف تيك توك بالعربية (2-3 أسطر مباشرة وجذابة + 5-8 هاشتاقات). حقل "script" = سكريبت فيديو 30-60 ثانية بالبنية: [ثانية 1-3: خطاف بصري/كلامي يمسك المشاهد] → [محتوى رئيسي] → [CTA أو خاتمة مؤثرة].`
      case "youtube": return `"youtube": حقل "title" = عنوان جذاب <60 حرف (يثير الفضول). حقل "text" = وصف الفيديو مع timestamps + 5-10 هاشتاقات. حقل "alt_titles" = 3 عناوين بديلة.`
      case "facebook": return `"facebook": منشور فيسبوك بالعربية 300-800 حرف. ابدأ بسؤال مثير أو جملة صادمة. أسلوب محادثة طبيعي كأنك تتكلم مع صديق. كل جملة تكمل سابقتها. اختم بـ CTA أو سؤال يحفز التعليقات.`
      default: return ""
    }
  }).join("\n")

  const jsonShape = platformIds.map(id => {
    if (id === "x" && isThread) return `  "${id}": { "text": "تغريدة 1\\n---\\nتغريدة 2\\n---\\n...", "warnings": [], "hooks": ["الزاوية 1: ملخص قصير", "الزاوية 2: ملخص قصير", "الزاوية 3: ملخص قصير"] }`
    if (id === "tiktok") return `  "${id}": { "text": "الوصف", "script": "السكريبت", "warnings": [], "hooks": ["الزاوية 1: ملخص قصير", "الزاوية 2: ملخص قصير", "الزاوية 3: ملخص قصير"] }`
    if (id === "youtube") return `  "${id}": { "title": "العنوان", "text": "الوصف", "alt_titles": ["1","2","3"], "warnings": [], "hooks": ["الزاوية 1: ملخص قصير", "الزاوية 2: ملخص قصير", "الزاوية 3: ملخص قصير"] }`
    return `  "${id}": { "text": "النص الكامل", "warnings": [], "hooks": ["الزاوية 1: ملخص قصير", "الزاوية 2: ملخص قصير", "الزاوية 3: ملخص قصير"] }`
  }).join(",\n")

  const tone = cfg.tone === "نبرة مخصصة" ? (cfg.customTone || "ودّي") : cfg.tone
  const cta = cfg.enableCTA ? (cfg.ctaValue === "دعوة مخصصة" ? (cfg.customCTA || "") : cfg.ctaValue) : ""
  const hashInfo = cfg.enableHashtags
    ? (cfg.hashtagMode === "custom" && cfg.customHashtags
      ? `استخدم هذه الهاشتاقات: ${cfg.customHashtags}`
      : `أضف ${cfg.hashtagCount} هاشتاقات مناسبة تلقائياً`)
    : "لا تضف هاشتاقات"
  const linkInfo = cfg.links.length > 0
    ? `ادمج هذه الروابط ${cfg.linksPlacement === "inline" ? "داخل النص بشكل طبيعي" : "في نهاية كل منشور"}: ${cfg.links.join(" , ")}`
    : ""

  return `أنت خبير تسويق رقمي ومحتوى عربي محترف. حوّل المقال التالي إلى محتوى جاهز للنشر.

═══ قواعد عامة إلزامية ═══

① البنية: كل منشور يجب أن يتبع هذا الترتيب بدقة:
   خطاف (Hook) → جسم المنشور (Body) → دعوة للتفاعل أو خاتمة (CTA)

② الخطاف (السطر الأول هو الأهم):
   - جملة واحدة قوية مكتملة المعنى تثير الفضول أو تفاجئ القارئ
   - ممنوع: "هل تعلم" / "هل سبق" / "في عالم..." / "في عصرنا" (عبارات مستهلكة)
   - أنماط خطاف ممتازة: رقم صادم / تجربة شخصية / نتيجة غير متوقعة / تحدٍّ مباشر
   - أمثلة: "خسرت 50 ألف لأنني تجاهلت هذا" — "٩ من ١٠ كتّاب يقعون في نفس الخطأ"

③ التماسك (أهم قاعدة):
   - كل جملة يجب أن تكون مرتبطة منطقياً ومعنوياً بما قبلها وبعدها
   - ممنوع نهائياً: جمل عشوائية / أفكار منفصلة بدون رابط / قفزات في المعنى
   - المنشور يجب أن يُقرأ كفقرة واحدة متدفقة وليس كقائمة جمل

④ النبرة: حافظ على نبرة "${tone}" ثابتة ومتسقة من أول كلمة لآخر كلمة.

⑤ مراجعة ذاتية قبل الإرسال — اسأل نفسك عن كل منشور:
   ✓ هل الخطاف قوي ومثير فعلاً؟
   ✓ هل كل جملة مترابطة مع ما قبلها؟
   ✓ هل يتبع بنية Hook → Body → CTA؟
   ✓ هل خالٍ من الجمل المنفصلة أو العشوائية؟
   → إذا فشل أي شرط: أعد الكتابة فوراً قبل الإرسال.
   → أضف تحذيرات في warnings إذا: طول غير مناسب / خطاف ضعيف / مقال لا يناسب المنصة.

${superHook ? `═══ وضع SUPER HOOK — صيغ فيروسية مثبتة ═══

استخدم إحدى صيغ الخطاف الفيروسية التالية (مستخرجة من 101 منشور حقق ملايين المشاهدات):

صيغة 1 — الخبرة + الرقم:
"فعلت/درست/حللت [رقم كبير] [شيء] خلال [فترة]. إليك [رقم] درس تعلمته:"
مثال: "راجعت أكثر من 500 موقع في 6 سنوات. إليك 17 درسًا لتحسين صفحة الهبوط"

صيغة 2 — التحوّل المذهل (قبل/بعد):
"[شخص] في [سنة]: [وضع سيء]. الآن: [نتيجة مذهلة]. إليك قصته:"
مثال: "قبل سنة كنت أبيع صفحات هبوط بـ 500 دولار. الأسبوع الماضي بنيت واحدة حققت 79,000 دولار"

صيغة 3 — الإحصائية الصادمة:
"[نسبة]% من [الجمهور] لا يعرفون [شيء]. لذلك [فعلت شيء] لمساعدتك:"
مثال: "98% من صنّاع المحتوى لا يعرفون كيف يجدون أفكارًا. راجعت 150+ قناة يوتيوب"

صيغة 4 — الألم + الحل:
"[مشكلة مؤلمة يعرفها الجمهور]. تمنيت لو كان عندي [حل]. لذلك صنعته. إليك [رقم] [شيء]:"
مثال: "بداية المسيرة المهنية مؤلمة. تشعر بالضياع 98% من الوقت. تمنيت لو كان عندي دليل. إليك 20 مبدأ"

صيغة 5 — الاختصار/الهاك:
"إليك طريقتي لـ [نتيجة مرغوبة] في [وقت قصير فقط]:"
مثال: "إليك طريقتي لبناء علامة شخصية بساعة واحدة أسبوعيًا فقط"

صيغة 6 — السؤال المستفز + الوعد:
"[سؤال يخاطب ألم الجمهور]? إليك [رقم] [شيء] ستغير [نتيجة]:"
مثال: "مشروعك يحقق أقل من 100 ألف سنويًا؟ إليك 8 رسائل بريدية ستضاعف أرباحك"

صيغة 7 — الأكاذيب/المفاجآت:
"[رقم] أكاذيب/مفاجآت/مفارقات عن [موضوع يهم الجمهور]:"
مثال: "10 أكاذيب كبيرة أخبروك بها عن الشركات الناشئة والكتابة"

صيغة 8 — القصة الشخصية:
"قصة حقيقية... هذا أغرب شيء حصل معي في [سياق]. خيط:"

صيغة 9 — المقابلة/السلطة:
"قابلت/تحدثت مع [رقم] [شخصيات مؤثرة]. سألتهم عن [موضوع]. إليك ما قالوه:"

صيغة 10 — التحدي المباشر:
"توقف عن [عادة سيئة]. ابدأ بـ [عادة جيدة]. إليك السبب:"

قواعد Super Hook:
- اختر الصيغة الأنسب لموضوع المقال (لا تستخدم صيغة عشوائية)
- ابدأ مباشرة بالخطاف — ممنوع أي مقدمة قبله
- استخدم أرقامًا محددة (ليس "كثير" بل "500+")
- الخطاف يجب أن يثير فضولًا حقيقيًا — القارئ يجب أن يشعر أنه سيخسر شيئًا إذا لم يكمل
- كيّف الصيغة لتناسب محتوى المقال الفعلي — لا تختلق أرقامًا أو ادعاءات
` : ""}═══ إعدادات التحويل ═══
- النبرة: ${tone}
- الهدف: ${cfg.objective}
- أسلوب المحتوى: ${cfg.contentStyle}
- مستوى الجرأة: ${cfg.intensity}
- نوع التحويل: ${cfg.transformType}
- الإيموجي: ${cfg.emojiLevel === "بدون" ? "بدون إيموجي نهائياً" : cfg.emojiLevel === "خفيف" ? "1-2 إيموجي كحد أقصى" : cfg.emojiLevel === "متوسط" ? "3-5 إيموجي" : "إيموجي كثير في كل فقرة"}
- اللغة: ${cfg.languageMode}${cfg.languageMode === "ترجمة إلى…" && cfg.targetLanguage ? ` (${cfg.targetLanguage})` : ""}
${cta ? `- CTA: "${cta}"` : "- بدون CTA محدد"}
- ${hashInfo}
${linkInfo ? `- ${linkInfo}` : ""}

═══ الزوايا (Hooks) ═══
لكل منصة، أنشئ 3 زوايا مختلفة (hooks) للمنشور. كل زاوية هي ملخص قصير (15-25 كلمة) يصف منظور/زاوية مختلفة لكتابة المنشور.
- الزاوية الأولى: الزاوية الأفضل والأقوى (هذه التي ستكتب المنشور الكامل لها)
- الزاوية الثانية: زاوية بديلة مختلفة (مثلاً: قصة شخصية، إحصائية، سؤال مستفز، تحدٍّ...)
- الزاوية الثالثة: زاوية ثالثة مختلفة تماماً عن الأولى والثانية
اكتب المنشور الكامل بناءً على الزاوية الأولى فقط. الزوايا الأخرى ستُستخدم لاحقاً عند الطلب.

═══ تحليل جودة المحتوى ═══
قيّم المقال الأصلي على 5 معايير خاصة بصلاحيته للمحتوى الاجتماعي:

1. الخطاف (hook): هل يحتوي على عناصر تصلح لافتتاحيات قوية؟ أرقام صادمة، تجارب شخصية، مفارقات، أسئلة مستفزة؟
2. الوضوح (clarity): هل الفكرة واضحة ومركّزة بما يكفي لتكثيفها في منشور قصير؟
3. الأسلوب (style): هل للكاتب صوت مميز وشخصية واضحة؟ هل النبرة متسقة؟
4. البنية (structure): هل المقال منظّم بشكل يسهّل تحويله لمنشورات متماسكة؟
5. الأثر (impact): هل المحتوى يحرّك مشاعر أو يدفع لفعل؟

كن صارماً. معظم المقالات تحصل 5-7. لا تعطِ 8+ إلا للمميز فعلاً.
لكل معيار: score (0.0-10.0) + note (جملة واحدة).
الإجمالي = متوسط الخمس. التصنيف: 8.5+="ممتاز" | 7+="جيد جداً" | 5.5+="جيد" | أقل="يحتاج تطوير"

═══ تعليمات كل منصة ═══
${platInstructions}

أعد JSON فقط بهذا الشكل (بدون مفتاح platforms — مباشرة):
{
  "quality": { "score": 7.2, "label": "جيد جداً", "summary": "جملتان تلخّصان جودة المقال", "pillars": [{"id":"hook","name":"الخطاف","score":6.8,"note":"..."},{"id":"clarity","name":"الوضوح","score":8.1,"note":"..."},{"id":"style","name":"الأسلوب","score":7.5,"note":"..."},{"id":"structure","name":"البنية","score":7.0,"note":"..."},{"id":"impact","name":"الأثر","score":6.5,"note":"..."}] },
${jsonShape}
}`
}

// ─── API call ─────────────────────────────────────────
async function callAPI(text: string, prompt: string) {
  const res = await fetch(
    `/api/gemini`,
    { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        contents:[{role:"user",parts:[{text:`${prompt}\n\n---\n\nالمقال:\n\n${text}\n\n---\n\nتعليمات الإخراج:\n1. ابدأ ردّك مباشرةً بعلامة { ولا تضف أي كلام قبل أو بعد الـ JSON.\n2. لا تكتب \`\`\`json.\n3. أعد JSON صالح فقط.\n4. لا تستخدم مفتاح "platforms" — ضع المنصات مباشرة في الجذر.`}]}],
        generationConfig:{maxOutputTokens:16384,temperature:0.4},
      }),
    }
  )
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error("API: "+(e?.error?.message||res.status)) }
  const data = await res.json()
  let raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
  if (!raw) { throw new Error("استجابة فارغة - السبب: " + (data.candidates?.[0]?.finishReason||"unknown")) }
  try { return JSON.parse(raw) } catch(_){}
  raw = raw.replace(/```json\s*/gi,"").replace(/```\s*/g,"")
  const s = raw.indexOf("{"); if (s===-1) throw new Error("لم يُعثر على JSON")
  let d=0,inS=false,esc=false,end=-1
  for(let i=s;i<raw.length;i++){const c=raw[i];if(esc){esc=false;continue}if(c==="\\"&&inS){esc=true;continue}if(c==='"'){inS=!inS;continue}if(!inS){if(c==="{")d++;else if(c==="}"){d--;if(d===0){end=i;break}}}}
  if(end===-1) throw new Error("JSON غير مكتمل")
  return JSON.parse(raw.slice(s,end+1))
}

// ─── HubSpot push ─────────────────────────────────────
async function pushToHubSpot(name:string,email:string,phone:string) {
  try { await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL}/${HUBSPOT_FORM}`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({fields:[{name:"email",value:email},{name:"firstname",value:name.split(/\s+/)[0]||""},{name:"lastname",value:name.split(/\s+/).slice(1).join(" ")||""},...(phone?[{name:"phone",value:phone}]:[])],context:{pageUri:window.location.href,pageName:"كتابة - محوّل المحتوى الاجتماعي"}}),
  })} catch(e){console.error("HS:",e)}
}

// ─── CSS ──────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&display=swap');
.ks *{margin:0;padding:0;box-sizing:border-box;min-width:0;}
.ks{width:100%;max-width:100%;min-width:320px;overflow-x:hidden;align-self:stretch;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;font-size:17px;line-height:1.65;direction:rtl;text-align:right;background:#F2F2F2;color:#371D12;}
.ks-in{width:100%;margin:12px auto 0;padding:0 16px 24px;box-sizing:border-box;}
.ks-card{background:#fff;border:1.5px solid #D9D9D9;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10);display:flex;flex-direction:column;}
.ks-card:focus-within{border-color:#0000FF;}
.ks-card-top{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;border-bottom:1px solid #D9D9D9;gap:8px;}
.ks-card-title{font-size:17px;font-weight:700;color:#371D12;flex:1;}
.ks-ta{display:block;width:100%;min-height:160px;max-height:300px;padding:16px;border:none;outline:none;resize:none;overflow-y:auto;font-family:inherit;font-size:16px;line-height:1.85;color:#371D12;background:#fff;direction:rtl;flex:1;}
.ks-ta::placeholder{color:#C0B8B0;}

/* ── Platform selector ── */
.ks-sec{border-top:1px solid #E8E8E8;background:#FAFAFA;}
.ks-sec-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px 0;gap:8px;}
.ks-sec-title{font-size:13px;font-weight:700;color:#555;}
.ks-sec-acts{display:flex;align-items:center;gap:2px;}
.ks-sec-act{font-size:11px;font-weight:600;color:#888;background:none;border:none;cursor:pointer;font-family:inherit;padding:4px 8px;border-radius:6px;-webkit-tap-highlight-color:transparent;}
.ks-sec-act:hover{color:#371D12;background:#F0F0F0;}
.ks-sec-act:focus-visible{outline:2px solid #0000FF;outline-offset:1px;}
.ks-sec-sep{width:1px;height:12px;background:#D9D9D9;flex-shrink:0;}
.ks-chips{display:flex;flex-wrap:wrap;gap:8px;padding:10px 16px 12px;min-height:92px;align-content:flex-start;}
.ks-sec-info{padding:0 16px 10px;font-size:11px;color:#999;font-weight:500;}
.ks-sec-info b{color:#371D12;font-weight:700;}

/* platform chip (dark selected) */
.ks-pc{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:9999px;border:1.5px solid #D9D9D9;background:#fff;font-family:inherit;font-size:13px;font-weight:600;color:#555;cursor:pointer;user-select:none;white-space:nowrap;outline:none;-webkit-tap-highlight-color:transparent;}
.ks-pc:hover{border-color:#AAA;background:#F5F5F5;}
.ks-pc:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,255,.22);}
.ks-pc[aria-pressed="true"]{border-color:#371D12;background:#371D12;color:#fff;}
.ks-pc[aria-pressed="true"]:hover{background:#4a2a1c;border-color:#4a2a1c;}
.ks-pc-ico{display:inline-flex;flex-shrink:0;}
.ks-pc-chk{display:inline-flex;flex-shrink:0;margin-inline-start:-2px;width:0;overflow:hidden;opacity:0;transition:width .15s,opacity .15s;}
.ks-pc[aria-pressed="true"] .ks-pc-chk{width:12px;opacity:1;}

/* settings chip (blue selected) */
.ks-sc{display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 12px;border-radius:9999px;border:1.5px solid #E0E0E0;background:#fff;font-family:inherit;font-size:12px;font-weight:600;color:#666;cursor:pointer;user-select:none;white-space:nowrap;outline:none;-webkit-tap-highlight-color:transparent;}
.ks-sc:hover{border-color:#BBB;background:#F8F8F8;}
.ks-sc:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,255,.22);}
.ks-sc[aria-pressed="true"]{border-color:#0000FF;background:#EDEDFF;color:#0000FF;}

/* ── Advanced settings collapsible ── */
.ks-adv{border-top:1px solid #E8E8E8;background:#FAFAFA;}
.ks-adv-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 16px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;color:#555;-webkit-tap-highlight-color:transparent;outline:none;}
.ks-adv-toggle:hover{background:#F5F5F5;}
.ks-adv-toggle:focus-visible{outline:2px solid #0000FF;outline-offset:-2px;}
.ks-adv-toggle-r{display:flex;align-items:center;gap:6px;}
.ks-adv-arrow{transition:transform .2s;display:inline-flex;}
.ks-adv-toggle[aria-expanded="true"] .ks-adv-arrow{transform:rotate(180deg);}
.ks-adv-body{overflow:hidden;transition:max-height .3s ease,opacity .2s;max-height:0;opacity:0;padding:0 16px;}
.ks-adv-body.open{max-height:2000px;opacity:1;padding:0 16px 14px;}

/* settings group */
.ks-sg{margin-bottom:12px;}
.ks-sg-lbl{font-size:12px;font-weight:700;color:#777;margin-bottom:6px;display:flex;align-items:center;gap:4px;}
.ks-sg-chips{display:flex;flex-wrap:wrap;gap:6px;}
.ks-sg-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.ks-sg-inp{height:30px;padding:0 10px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:12px;color:#371D12;background:#fff;direction:rtl;outline:none;flex:1;min-width:120px;}
.ks-sg-inp:focus{border-color:#0000FF;}
.ks-sg-inp-wide{width:100%;margin-top:6px;}
.ks-sg-sel{height:30px;padding:0 8px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:12px;color:#371D12;background:#fff;direction:rtl;outline:none;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:left 8px center;padding-left:24px;}
.ks-sg-sel:focus{border-color:#0000FF;}

/* toggle */
.ks-tog{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;font-weight:600;color:#555;user-select:none;}
.ks-tog-track{width:36px;height:20px;border-radius:10px;background:#D9D9D9;position:relative;flex-shrink:0;transition:background .15s;}
.ks-tog-track.on{background:#0000FF;}
.ks-tog-knob{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;right:2px;transition:right .15s;box-shadow:0 1px 3px rgba(0,0,0,.15);}
.ks-tog-track.on .ks-tog-knob{right:18px;}
.ks-tog input{position:absolute;opacity:0;width:0;height:0;}

/* count stepper */
.ks-stepper{display:inline-flex;align-items:center;gap:0;border:1.5px solid #E0E0E0;border-radius:8px;overflow:hidden;height:30px;}
.ks-stepper-btn{width:28px;height:100%;background:#FAFAFA;border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;color:#555;display:flex;align-items:center;justify-content:center;}
.ks-stepper-btn:hover{background:#F0F0F0;}
.ks-stepper-val{width:28px;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#371D12;border-right:1px solid #E0E0E0;border-left:1px solid #E0E0E0;}

/* ── Links section ── */
.ks-links{border-top:1px solid #E8E8E8;background:#FAFAFA;padding:12px 16px;}
.ks-links-head{font-size:13px;font-weight:700;color:#555;margin-bottom:8px;}
.ks-links-input{display:flex;gap:6px;margin-bottom:8px;}
.ks-links-inp{flex:1;height:34px;padding:0 12px;border:1.5px solid #E0E0E0;border-radius:9px;font-family:inherit;font-size:12px;color:#371D12;background:#fff;direction:ltr;text-align:left;outline:none;}
.ks-links-inp:focus{border-color:#0000FF;}
.ks-links-add{height:34px;padding:0 14px;border-radius:9px;border:1.5px solid #0000FF;background:#EDEDFF;color:#0000FF;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;}
.ks-links-add:hover{background:#D8D8FF;}
.ks-links-add:disabled{opacity:.4;cursor:default;}
.ks-links-list{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}
.ks-link-chip{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 6px 0 10px;border-radius:9999px;background:#F0F0F0;border:1px solid #E0E0E0;font-size:11px;color:#555;direction:ltr;max-width:200px;}
.ks-link-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
.ks-link-x{width:18px;height:18px;border-radius:50%;background:#D9D9D9;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;color:#666;font-weight:700;line-height:1;}
.ks-link-x:hover{background:#C0C0C0;}
.ks-link-err{font-size:11px;color:#DC2626;margin-top:4px;}
.ks-links-place{display:flex;gap:6px;margin-top:6px;}


/* ── Footer ── */
.ks-card-foot{display:flex;align-items:center;flex-direction:row-reverse;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #D9D9D9;position:sticky;bottom:0;background:#fff;z-index:10;}
.ks-wc{font-size:14px;color:#818181;flex-shrink:0;margin-right:auto;}
.ks-btn-go{font-size:15px;font-weight:700;color:#fff;border:none;padding:11px 22px;border-radius:10px;cursor:pointer;opacity:.4;pointer-events:none;background:#0000FF;font-family:inherit;flex-shrink:0;white-space:nowrap;outline:none;}
.ks-btn-go.on{opacity:1;pointer-events:all;}
.ks-btn-go.on:hover{filter:brightness(1.08);}

/* ── Loading ── */
.ks-load{padding:28px 16px 36px;display:flex;flex-direction:column;align-items:center;}
.ks-load-card{width:100%;max-width:440px;background:#fff;border:1px solid #D9D9D9;border-radius:20px;padding:28px 24px 24px;box-shadow:0 4px 24px rgba(0,0,0,.10);}
.ks-load-header{display:flex;align-items:center;gap:14px;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid #F2F2F2;}
.ks-load-hicon{width:44px;height:44px;background:#EBEBFF;border:1.5px solid #C7C7FF;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ks-load-title{font-size:17px;font-weight:700;color:#371D12;margin-bottom:2px;}
.ks-load-sub{font-size:13px;color:#818181;}
.ks-load-steps{display:flex;flex-direction:column;gap:6px;margin-bottom:20px;}
.ks-load-step{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;background:transparent;border:1.5px solid transparent;}
.ks-load-step.active{background:#F0F0FF;border-color:#0000FF;}
.ks-load-step.done{opacity:.55;}
.ks-load-step.pending{opacity:.32;}
.ks-load-step-ico{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:7px;flex-shrink:0;background:#F2F2F2;}
.ks-load-step.active .ks-load-step-ico{background:#E8E8FF;animation:ks-pulse 1.6s ease-in-out infinite;}
.ks-load-step.done .ks-load-step-ico{background:#F0FDF7;}
.ks-load-step-txt{font-size:14px;font-weight:500;color:#371D12;flex:1;}
.ks-load-step.active .ks-load-step-txt{font-weight:600;color:#0000FF;}
.ks-load-prog{background:#F2F2F2;border-radius:4px;height:5px;overflow:hidden;}
.ks-load-prog-fill{height:100%;background:#0000FF;border-radius:4px;transition:width .6s ease;}
.ks-load-pct{font-size:12px;color:#818181;text-align:center;margin-top:6px;}
@keyframes ks-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes ks-pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes ks-fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ── Lead capture ── */
.ks-cap{padding:28px 16px 36px;display:flex;flex-direction:column;align-items:center;}
.ks-cap-card{width:100%;max-width:440px;background:#fff;border:1px solid #D9D9D9;border-radius:20px;padding:28px 24px 24px;box-shadow:0 4px 24px rgba(0,0,0,.10);}
.ks-cap-icon{width:56px;height:56px;background:#EBEBFF;border:2px solid #C7C7FF;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}
.ks-cap-title{font-size:20px;font-weight:800;color:#371D12;text-align:center;margin-bottom:6px;}
.ks-cap-sub{font-size:14px;color:#818181;text-align:center;line-height:1.7;margin-bottom:24px;}
.ks-cap-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
.ks-cap-lbl{font-size:13px;font-weight:600;color:#371D12;}
.ks-cap-lbl span{color:#818181;font-weight:400;}
.ks-cap-inp{width:100%;padding:11px 14px;border:1.5px solid #D9D9D9;border-radius:10px;font-family:inherit;font-size:15px;color:#371D12;background:#fff;direction:rtl;outline:none;}
.ks-cap-inp:focus{border-color:#0000FF;}
.ks-cap-btn{width:100%;padding:14px;background:#0000FF;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;font-family:inherit;margin-top:6px;}
.ks-cap-btn:hover:not(:disabled){filter:brightness(1.1);}
.ks-cap-btn:disabled{opacity:.5;cursor:wait;}
.ks-cap-skip{display:block;text-align:center;font-size:13px;color:#818181;margin-top:14px;cursor:pointer;background:none;border:none;font-family:inherit;width:100%;padding:4px;}
.ks-cap-skip:hover{color:#371D12;text-decoration:underline;}
.ks-cap-done{display:flex;flex-direction:column;align-items:center;padding:28px 0 16px;text-align:center;}
.ks-cap-done-ico{width:60px;height:60px;background:#F0FDF7;border:2px solid #A7F3D0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.ks-cap-done-title{font-size:18px;font-weight:800;color:#12B76A;margin-bottom:4px;}
.ks-cap-done-sub{font-size:14px;color:#818181;line-height:1.7;}

/* ── Results ── */
.ks-res{width:100%;padding:16px 16px 8px;box-sizing:border-box;max-width:100%;overflow-x:hidden;}
.ks-top-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px;}
.ks-btn-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#818181;background:#fff;border:1.5px solid #D9D9D9;padding:8px 14px;border-radius:9px;cursor:pointer;font-family:inherit;}
.ks-btn-back:hover{border-color:#371D12;color:#371D12;}
.ks-res-header{text-align:center;margin-bottom:24px;}
.ks-res-title{font-size:22px;font-weight:800;color:#371D12;margin-bottom:4px;}
.ks-res-sub{font-size:14px;color:#818181;}
.ks-pcard{background:#fff;border:1.5px solid #D9D9D9;border-radius:16px;margin-bottom:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.06);animation:ks-fu .35s ease both;position:relative;}
.ks-pcard-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid #F0F0F0;}
.ks-pcard-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ks-pcard-name{font-size:16px;font-weight:700;color:#371D12;flex:1;}
.ks-pcard-body{padding:18px;direction:rtl;}
.ks-pcard-content{font-size:15px;color:#371D12;line-height:1.9;white-space:pre-wrap;word-wrap:break-word;}
.ks-pcard-thread{display:flex;flex-direction:column;gap:12px;}
.ks-pcard-tweet{background:#F8F8F8;border:1px solid #EBEBEB;border-radius:12px;padding:14px 16px;font-size:15px;color:#371D12;line-height:1.8;position:relative;}
.ks-pcard-tweet-num{position:absolute;top:8px;left:12px;font-size:11px;font-weight:700;color:#818181;background:#F0F0F0;padding:2px 8px;border-radius:6px;}
.ks-pcard-section{margin-top:16px;padding-top:14px;border-top:1px solid #F0F0F0;}
.ks-pcard-section-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#818181;margin-bottom:8px;}

/* ── Edit/Regen action buttons (v6) ── */
.ks-pcard-actions{display:flex;gap:8px;padding:8px 18px 4px;border-top:1px solid #F0F0F0;}
.ks-act-btn{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px;border:1.5px solid #E0E0E0;background:#fff;color:#555;cursor:pointer;font-family:inherit;white-space:nowrap;outline:none;-webkit-tap-highlight-color:transparent;}
.ks-act-btn:hover{border-color:#AAA;background:#F8F8F8;}
.ks-act-btn:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,255,.22);}
.ks-act-btn.regen{color:#0000FF;border-color:#C7C7FF;background:#F0F0FF;}
.ks-act-btn.regen:hover{background:#E0E0FF;border-color:#0000FF;}
.ks-act-btn.save{color:#12B76A;border-color:#A7F3D0;background:#F0FDF7;}
.ks-act-btn.save:hover{background:#DCFCE7;}
.ks-act-btn.cancel{color:#818181;}
.ks-act-btn.cancel:hover{color:#371D12;}
.ks-act-btn:disabled{opacity:.4;cursor:wait;}
.ks-edit-ta{display:block;width:100%;min-height:120px;padding:14px;border:none;outline:none;resize:vertical;font-family:inherit;font-size:15px;line-height:1.85;color:#371D12;background:#FAFAFA;direction:rtl;}
.ks-pcard-warn{margin-top:12px;padding:10px 12px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;}
.ks-pcard-warn-item{font-size:12px;color:#92400E;line-height:1.6;}
.ks-pcard-regen-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,.6);z-index:2;display:flex;align-items:center;justify-content:center;border-radius:16px;}

.ks-copy-wrap{padding:8px 18px 12px;display:flex;justify-content:flex-end;}
.ks-copy-btn{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#0000FF;background:#E8E8FF;border:1.5px solid #C7C7FF;padding:8px 16px;border-radius:9px;cursor:pointer;font-family:inherit;}
.ks-copy-btn:hover{background:#D0D0FF;border-color:#0000FF;}
.ks-copy-btn.copied{color:#12B76A;background:#F0FDF7;border-color:#A7F3D0;}

/* ── Publish bar (v12) ── */
.ks-pub{display:flex;align-items:center;gap:8px;padding:10px 18px 14px;border-top:1px solid #F0F0F0;}
.ks-pub-copy{display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 14px;border-radius:9px;border:1.5px solid #D9D9D9;background:#fff;color:#555;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;transition:border-color .15s,background .15s;}
.ks-pub-copy:hover{border-color:#AAA;background:#F8F8F8;}
.ks-pub-copy:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,255,.22);}
.ks-pub-copy.copied{color:#12B76A;border-color:#A7F3D0;background:#F0FDF7;}
.ks-pub-spacer{flex:1;}
.ks-pub-post{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 16px;border-radius:9px;border:none;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;white-space:nowrap;transition:filter .15s,box-shadow .15s;}
.ks-pub-post:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,0,.15);}
.ks-pub-post:hover{filter:brightness(1.06);}
.ks-pub-lock{width:12px;height:12px;opacity:.45;flex-shrink:0;}
.ks-pub-tooltip{position:relative;}
.ks-pub-tooltip:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);padding:5px 10px;border-radius:7px;background:#371D12;color:#fff;font-size:11px;font-weight:600;white-space:nowrap;pointer-events:none;z-index:5;animation:ks-fu .15s ease both;}
.ks-pub-tooltip:hover::before{content:"";position:absolute;bottom:calc(100% + 2px);left:50%;transform:translateX(-50%);border:4px solid transparent;border-top-color:#371D12;z-index:5;}
.ks-cta{width:100%;padding:16px 16px 48px;box-sizing:border-box;}
.ks-cta-card{background:#fff;border:1.5px solid #D9D9D9;border-radius:16px;padding:28px 24px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.06);}
.ks-cta-title{font-size:20px;font-weight:800;margin-bottom:6px;color:#371D12;}
.ks-cta-accent{color:#0000FF;}
.ks-cta-sub{font-size:14px;color:#818181;margin-bottom:20px;line-height:1.8;}
.ks-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;align-items:center;}
.ks-cta-btn-app{display:inline-flex;align-items:center;gap:10px;background:#371D12;color:#fff;padding:10px 20px 10px 14px;border-radius:11px;text-decoration:none;direction:ltr;border:none;cursor:pointer;}
.ks-cta-btn-app:hover{background:#1a0d06;}
.ks-retry{width:100%;padding:24px 16px 0;box-sizing:border-box;}
.ks-btn-retry{font-size:15px;font-weight:600;color:#818181;background:#fff;border:1.5px solid #D9D9D9;padding:14px;border-radius:12px;cursor:pointer;width:100%;text-align:center;font-family:inherit;}
.ks-btn-retry:hover{border-color:#0000FF;color:#0000FF;}
.ks-error{width:100%;margin:0 0 12px;padding:14px 18px;background:#FEF2F2;border:1.5px solid #FECACA;border-radius:12px;color:#DC2626;font-size:14px;font-weight:600;text-align:center;line-height:1.7;animation:ks-fu .25s ease both;}
.ks-error-dismiss{display:inline;background:none;border:none;color:#DC2626;font-weight:700;cursor:pointer;text-decoration:underline;font-family:inherit;font-size:13px;margin-right:8px;}

/* ── Super Hook (v6) ── */
.ks-superhook{display:flex;align-items:center;gap:10px;padding:4px 16px 12px;background:transparent;}
.ks-superhook-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;border:2px solid #E0E0E0;background:#fff;font-family:inherit;font-size:13px;font-weight:700;color:#555;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;transition:border-color .2s,background .2s,box-shadow .2s;}
.ks-superhook-btn:hover{border-color:#F59E0B;background:#FFFBEB;}
.ks-superhook-btn:focus-visible{box-shadow:0 0 0 2.5px rgba(245,158,11,.3);}
.ks-superhook-btn.on{border-color:#F59E0B;background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#92400E;box-shadow:0 0 12px rgba(245,158,11,.4),0 0 28px rgba(245,158,11,.15);animation:ks-glow 2s ease-in-out infinite;}
@keyframes ks-glow{0%,100%{box-shadow:0 0 12px rgba(245,158,11,.4),0 0 28px rgba(245,158,11,.15);}50%{box-shadow:0 0 20px rgba(245,158,11,.6),0 0 40px rgba(245,158,11,.25);}}

/* ── Auto-detect notification ── */
.ks-detect-note{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#EBF0FF;border-top:1px solid #D0DAFF;font-size:13px;font-weight:600;color:#0000FF;direction:rtl;animation:ks-detect-fade .3s ease both;}
.ks-detect-note-x{background:none;border:none;color:#0000FF;font-size:16px;font-weight:700;cursor:pointer;margin-right:auto;padding:2px 6px;border-radius:4px;font-family:inherit;line-height:1;}
.ks-detect-note-x:hover{background:rgba(0,0,255,.1);}
@keyframes ks-detect-fade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

/* ── Hook/Angle selector ── */
.ks-hooks{display:flex;gap:8px;padding:10px 18px;border-bottom:1px solid #F0F0F0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.ks-hooks::-webkit-scrollbar{display:none;}
.ks-hook-btn{display:inline-flex;align-items:center;padding:8px 14px;border-radius:10px;border:1.5px solid #E0E0E0;background:#fff;font-family:inherit;font-size:12px;font-weight:600;color:#555;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;white-space:normal;text-align:right;direction:rtl;max-width:220px;line-height:1.5;flex-shrink:0;}
.ks-hook-btn:hover{border-color:#AAA;background:#F8F8F8;}
.ks-hook-btn:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,255,.22);}
.ks-hook-btn.active{border-color:#0000FF;background:#EBF0FF;color:#0000FF;}
.ks-hook-btn.loading{opacity:.6;cursor:wait;}

/* ── Slider (v11 — compact) ── */
.ks-slider-wrap{display:flex;flex-direction:column;gap:3px;padding:2px 0;max-width:200px;}
.ks-slider{-webkit-appearance:none;appearance:none;width:100%;height:5px;background:#E8E8E8;border-radius:3px;outline:none;cursor:pointer;direction:rtl;}
.ks-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:#0000FF;cursor:pointer;border:2.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:box-shadow .15s;}
.ks-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#0000FF;cursor:pointer;border:2.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.ks-slider::-webkit-slider-thumb:hover{box-shadow:0 0 0 4px rgba(0,0,255,.12);}
.ks-slider:focus-visible{outline:none;}
.ks-slider:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 4px rgba(0,0,255,.22);}
.ks-slider-labels{display:flex;justify-content:space-between;padding:0 1px;}
.ks-slider-label{font-size:10px;font-weight:600;color:#AAA;cursor:pointer;padding:1px 2px;border-radius:4px;user-select:none;-webkit-tap-highlight-color:transparent;transition:color .15s;}
.ks-slider-label:hover{color:#555;}
.ks-slider-label.active{color:#0000FF;font-weight:700;}

/* ── Results mini settings bar (v12) ── */
.ks-mini-cfg{background:#fff;border:1.5px solid #D9D9D9;border-radius:14px;margin-bottom:16px;padding:14px 16px;box-shadow:0 2px 10px rgba(0,0,0,.06);animation:ks-fu .25s ease both;}
.ks-mini-cfg-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ks-mini-cfg-lbl{font-size:12px;font-weight:700;color:#555;white-space:nowrap;flex-shrink:0;}
.ks-mini-cfg-chips{display:flex;flex-wrap:wrap;gap:5px;flex:1;min-width:0;}
.ks-mini-chip{display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:9999px;border:1.5px solid #E0E0E0;background:#fff;font-family:inherit;font-size:11px;font-weight:600;color:#666;cursor:pointer;user-select:none;white-space:nowrap;outline:none;-webkit-tap-highlight-color:transparent;transition:border-color .15s,background .15s,color .15s;}
.ks-mini-chip:hover{border-color:#BBB;background:#F8F8F8;}
.ks-mini-chip:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,255,.22);}
.ks-mini-chip[aria-pressed="true"]{border-color:#0000FF;background:#EDEDFF;color:#0000FF;}
.ks-mini-refresh{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 14px;border-radius:9px;border:1.5px solid #C7C7FF;background:#F0F0FF;color:#0000FF;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;outline:none;flex-shrink:0;-webkit-tap-highlight-color:transparent;transition:background .15s,border-color .15s;}
.ks-mini-refresh:hover{background:#E0E0FF;border-color:#0000FF;}
.ks-mini-refresh:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,255,.22);}
.ks-mini-refresh:disabled{opacity:.5;cursor:wait;}
.ks-mini-refresh .ks-spin{animation:ks-spin .8s linear infinite;}

/* ── Quality Analysis (v11) ── */
.ks-qa{background:#fff;border:1.5px solid #D9D9D9;border-radius:16px;margin-bottom:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.06);animation:ks-fu .35s ease both;}
.ks-qa-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:16px 18px;background:none;border:none;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;outline:none;gap:10px;}
.ks-qa-toggle:hover{background:#FAFAFA;}
.ks-qa-toggle:focus-visible{outline:2px solid #0000FF;outline-offset:-2px;}
.ks-qa-toggle-r{display:flex;align-items:center;gap:10px;flex:1;}
.ks-qa-toggle-title{font-size:16px;font-weight:700;color:#371D12;}
.ks-qa-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:700;white-space:nowrap;}
.ks-qa-badge.excellent{background:#F0FDF7;color:#12B76A;border:1px solid #A7F3D0;}
.ks-qa-badge.great{background:#EBF0FF;color:#0000FF;border:1px solid #C7C7FF;}
.ks-qa-badge.good{background:#FFFBEB;color:#DFB300;border:1px solid #FDE68A;}
.ks-qa-badge.weak{background:#FEF2F2;color:#E82222;border:1px solid #FECACA;}
.ks-qa-arrow{transition:transform .2s;display:inline-flex;color:#818181;}
.ks-qa-toggle[aria-expanded="true"] .ks-qa-arrow{transform:rotate(180deg);}
.ks-qa-body{overflow:hidden;transition:max-height .3s ease,opacity .2s;max-height:0;opacity:0;}
.ks-qa-body.open{max-height:800px;opacity:1;}
.ks-qa-top{display:flex;align-items:center;gap:18px;padding:0 18px 18px;border-bottom:1px solid #F0F0F0;}
.ks-qa-ring-wrap{flex-shrink:0;position:relative;width:72px;height:72px;}
.ks-qa-ring-label{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:18px;font-weight:800;color:#371D12;}
.ks-qa-info{flex:1;min-width:0;}
.ks-qa-info-label{font-size:14px;font-weight:700;margin-bottom:2px;}
.ks-qa-info-summary{font-size:13px;color:#818181;line-height:1.7;}
.ks-qa-pillars{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:18px;}
.ks-qa-pill{display:flex;flex-direction:column;gap:6px;padding:12px;background:#FAFAFA;border-radius:12px;border:1px solid #F0F0F0;}
.ks-qa-pill-score{font-size:20px;font-weight:800;line-height:1;}
.ks-qa-pill-name{font-size:12px;font-weight:700;color:#555;}
.ks-qa-pill-bar{height:4px;border-radius:2px;background:#F0F0F0;overflow:hidden;}
.ks-qa-pill-bar-fill{height:100%;border-radius:2px;transition:width .4s ease;}
.ks-qa-pill-note{font-size:11px;color:#818181;line-height:1.5;}

@media(max-width:480px){
  .ks{font-size:15px;}
  .ks-in{padding:8px 12px 16px;}
  .ks-chips{gap:6px;padding:8px 12px 10px;}
  .ks-pc{height:32px;padding:0 10px;font-size:12px;gap:5px;}
  .ks-sc{height:26px;padding:0 9px;font-size:11px;}
  .ks-res{padding:12px 12px 6px;}
  .ks-retry{padding:20px 12px 0;}
  .ks-cta{padding:12px 12px 32px;}
  .ks-res-title{font-size:19px;}
  .ks-pcard-actions{padding:8px 12px 4px;gap:6px;}
  .ks-act-btn{font-size:11px;padding:6px 10px;}
  .ks-detect-note{font-size:12px;padding:8px 12px;}
  .ks-hooks{padding:8px 12px;gap:6px;}
  .ks-hook-btn{font-size:11px;padding:6px 10px;max-width:180px;}
  .ks-qa-pillars{grid-template-columns:repeat(3,1fr);gap:8px;padding:12px;}
  .ks-qa-pill-note{display:none;}
  .ks-qa-top{flex-direction:column;align-items:flex-start;gap:12px;padding:0 12px 14px;}
  .ks-mini-cfg{padding:10px 12px;}
  .ks-mini-cfg-row{gap:8px;}
  .ks-mini-cfg-chips{gap:4px;}
  .ks-mini-chip{height:26px;padding:0 8px;font-size:10px;}
  .ks-mini-refresh{height:28px;padding:0 10px;font-size:11px;margin-right:0;}
  .ks-settings-bar{gap:8px;flex-wrap:wrap;}
  .ks-settings-tog{padding:7px 12px;font-size:11px;gap:5px;}
  .ks-slider-wrap{max-width:160px;}
  .ks-pub{padding:8px 12px 10px;gap:6px;}
  .ks-pub-copy{height:30px;padding:0 10px;font-size:11px;}
  .ks-pub-post{height:30px;padding:0 12px;font-size:11px;}
}

/* ── Settings toggle button — animated glow (v15, from Carousel) ── */
.ks-settings-tog{display:flex;align-items:center;gap:7px;padding:9px 18px;border:none;border-radius:999px;background:linear-gradient(135deg,#0000FF 0%,#4361EE 40%,#0000FF 100%);background-size:200% 200%;animation:ks-btn-shimmer 3s ease infinite;font-family:inherit;font-size:13px;font-weight:700;color:#FFF;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,255,.3);outline:none;-webkit-tap-highlight-color:transparent;}
.ks-settings-tog:hover{box-shadow:0 4px 16px rgba(0,0,255,.45);transform:translateY(-1px);}
.ks-settings-tog.on{box-shadow:0 4px 16px rgba(0,0,255,.45);}
.ks-settings-tog svg{stroke:#FFF;}
@keyframes ks-btn-shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.ks-settings-arrow{transition:transform .25s ease;display:inline-flex;}
.ks-settings-arrow.open{transform:rotate(180deg);}
.ks-settings-bar{display:flex;align-items:center;gap:10px;margin-bottom:16px;animation:ks-fu .25s ease both;flex-wrap:wrap;}
.ks-settings-panel{display:flex;flex-direction:column;gap:14px;margin-bottom:16px;padding:18px;background:#FFF;border:2px solid #E8E8E8;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,.06);animation:ks-fu .25s ease both;overflow:hidden;transition:max-height .3s ease,opacity .2s;}
.ks-settings-panel .ks-sg{margin-bottom:0;}

/* ── Tabbed Results (v15) ── */
.ks-tabs-wrap{background:#fff;border:1.5px solid #D9D9D9;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.06);animation:ks-fu .3s ease both;margin-bottom:16px;max-width:100%;box-sizing:border-box;}
.ks-tabs-bar{display:flex;align-items:center;gap:6px;padding:14px 16px;border-bottom:1px solid #F0F0F0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.ks-tabs-bar::-webkit-scrollbar{display:none;}
.ks-tab{width:42px;height:42px;border-radius:50%;border:2.5px solid #E0E0E0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:border-color .2s,box-shadow .2s,transform .15s;position:relative;outline:none;-webkit-tap-highlight-color:transparent;}
.ks-tab:hover{border-color:#AAA;transform:scale(1.06);}
.ks-tab:focus-visible{box-shadow:0 0 0 3px rgba(0,0,255,.2);}
.ks-tab.active{border-color:#0000FF;box-shadow:0 0 0 3px rgba(0,0,255,.15);transform:scale(1.08);}
.ks-tab-badge{position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;}
.ks-tab-add{width:42px;height:42px;border-radius:50%;border:2px dashed #D9D9D9;background:#FAFAFA;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:border-color .2s,background .2s;color:#AAA;font-size:20px;font-weight:300;outline:none;-webkit-tap-highlight-color:transparent;}
.ks-tab-add:hover{border-color:#0000FF;background:#F0F0FF;color:#0000FF;}
.ks-tab-content{padding:0;}
.ks-tab-header{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #F0F0F0;}
.ks-tab-header-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ks-tab-header-name{font-size:15px;font-weight:700;color:#371D12;flex:1;}
.ks-tab-header-type{font-size:12px;font-weight:600;color:#818181;background:#F2F2F2;padding:3px 10px;border-radius:6px;}
.ks-tab-body{padding:18px;direction:rtl;min-height:120px;position:relative;}
.ks-tab-footer{display:flex;align-items:center;gap:8px;padding:10px 18px 14px;border-top:1px solid #F0F0F0;}
.ks-tab-toolbar{display:flex;align-items:center;gap:6px;padding:0 18px 6px;border-bottom:1px solid #F5F5F5;}
.ks-tab-tool{width:32px;height:32px;border-radius:8px;border:none;background:transparent;color:#818181;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s,color .15s;}
.ks-tab-tool:hover{background:#F2F2F2;color:#371D12;}
.ks-tab-charcount{font-size:12px;color:#AAA;font-weight:600;margin-right:auto;padding:4px 8px;background:#F8F8F8;border-radius:6px;}

/* ── Create Post Modal (v15) ── */
.ks-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.4);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:ks-fu .15s ease both;}
.ks-modal{width:100%;max-width:480px;max-height:90vh;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;animation:ks-fu .2s ease both;}
.ks-modal-head{display:flex;align-items:center;gap:8px;padding:16px 18px;border-bottom:1px solid #F0F0F0;}
.ks-modal-head-tabs{display:flex;gap:6px;flex:1;overflow-x:auto;scrollbar-width:none;}
.ks-modal-head-tabs::-webkit-scrollbar{display:none;}
.ks-modal-body{flex:1;overflow-y:auto;padding:16px 18px;}
.ks-modal-ta{display:block;width:100%;min-height:160px;padding:14px;border:1.5px solid #E0E0E0;border-radius:12px;font-family:inherit;font-size:15px;line-height:1.85;color:#371D12;background:#fff;direction:rtl;outline:none;resize:vertical;}
.ks-modal-ta:focus{border-color:#0000FF;}
.ks-modal-ta::placeholder{color:#C0B8B0;}
.ks-modal-foot{display:flex;align-items:center;gap:10px;padding:14px 18px;border-top:1px solid #F0F0F0;}
.ks-modal-cancel{height:36px;padding:0 16px;border-radius:9px;border:1.5px solid #D9D9D9;background:#fff;color:#555;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;}
.ks-modal-cancel:hover{border-color:#371D12;color:#371D12;}
.ks-modal-datetime{display:flex;align-items:center;gap:6px;font-size:12px;color:#818181;font-weight:500;}
.ks-modal-datetime input{height:30px;padding:0 8px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:12px;color:#371D12;background:#fff;outline:none;}
.ks-modal-datetime input:focus{border-color:#0000FF;}

@media(max-width:480px){
  .ks-tab{width:36px;height:36px;}
  .ks-tab-add{width:36px;height:36px;}
  .ks-tabs-bar{padding:10px 12px;gap:5px;}
  .ks-tab-header{padding:10px 12px;}
  .ks-tab-body{padding:12px;}
  .ks-tab-footer{padding:8px 12px 10px;}
  .ks-modal{max-width:100%;border-radius:16px;}
}

/* ── Studio (v15 — carousel card grid) ── */
.ks-studio-tog{display:flex;align-items:center;gap:7px;padding:9px 18px;border:none;border-radius:999px;background:linear-gradient(135deg,#0000FF 0%,#4361EE 40%,#0000FF 100%);background-size:200% 200%;animation:ks-btn-shimmer 3s ease infinite;font-family:inherit;font-size:13px;font-weight:700;color:#FFF;cursor:pointer;flex-shrink:0;white-space:nowrap;outline:none;-webkit-tap-highlight-color:transparent;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,255,.3);}
.ks-studio-tog:hover{box-shadow:0 4px 16px rgba(0,0,255,.45);transform:translateY(-1px);}
.ks-studio-tog.on{box-shadow:0 4px 16px rgba(0,0,255,.45);}
.ks-studio-tog svg{stroke:#FFF;}
.ks-studio-wrap{animation:ks-fu .3s ease both;margin-bottom:16px;max-width:100%;box-sizing:border-box;overflow:hidden;}
/* Tools panel (collapsible) */
.ks-studio-tools{display:flex;flex-direction:column;gap:12px;margin-bottom:12px;padding:14px;background:#FFF;border:2px solid #E8E8E8;border-radius:14px;animation:ks-fu .25s ease both;box-sizing:border-box;max-width:100%;overflow:hidden;}
.ks-studio-row{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;max-width:100%;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.ks-studio-row::-webkit-scrollbar{display:none;}
.ks-studio-tmpls{display:flex;gap:6px;overflow-x:auto;direction:rtl;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:4px;scrollbar-width:none;}
.ks-studio-tmpls::-webkit-scrollbar{display:none;}
.ks-studio-tmpl{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0;border:2px solid transparent;border-radius:8px;background:transparent;cursor:pointer;transition:all .2s;font-family:inherit;outline:none;-webkit-tap-highlight-color:transparent;flex-shrink:0;scroll-snap-align:start;}
.ks-studio-tmpl:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.1);}
.ks-studio-tmpl.on{border-color:#0000FF;box-shadow:0 0 0 2px rgba(0,0,255,.15);transform:translateY(-1px);}
.ks-studio-tmpl-pv{width:48px;height:48px;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.ks-studio-tmpl-pv svg{width:50%;height:50%;opacity:.9;}
.ks-studio-tmpl-n{font-size:8px;font-weight:600;color:#555;white-space:nowrap;padding-bottom:3px;}
.ks-studio-shapes{display:flex;gap:5px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.ks-studio-shapes::-webkit-scrollbar{display:none;}
.ks-studio-shp{width:28px;height:28px;border:2px solid #E5E5E5;border-radius:6px;background:#FFF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:#999;padding:4px;flex-shrink:0;}
.ks-studio-shp:hover{border-color:#BBB;color:#666;}
.ks-studio-shp.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.ks-studio-shp svg{width:100%;height:100%;}
.ks-studio-int{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.ks-studio-int::-webkit-scrollbar{display:none;}
.ks-studio-int-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 8px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;cursor:pointer;transition:all .2s;font-family:inherit;font-size:10px;font-weight:600;color:#888;flex:1;min-width:0;flex-shrink:0;}
.ks-studio-int-btn:hover{border-color:#BBB;color:#555;}
.ks-studio-int-btn.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.ks-studio-int-ico{width:16px;height:16px;}
.ks-studio-cp{display:flex;align-items:center;gap:5px;padding:3px 8px 3px 3px;border:2px solid #E5E5E5;border-radius:999px;background:#FFF;cursor:pointer;position:relative;transition:border-color .2s;flex-shrink:0;}
.ks-studio-cp:hover{border-color:#BBB;}
.ks-studio-cp-sw{width:20px;height:20px;border-radius:5px;border:1.5px solid rgba(0,0,0,.12);flex-shrink:0;pointer-events:none;}
.ks-studio-cp-l{font-size:10px;font-weight:600;color:#777;pointer-events:none;}
.ks-studio-font{padding:5px 8px;border:2px solid #E5E5E5;border-radius:999px;background:#FFF;font-family:inherit;font-size:11px;font-weight:600;color:#555;outline:none;cursor:pointer;direction:rtl;transition:border-color .2s;flex-shrink:0;white-space:nowrap;}
.ks-studio-font:hover{border-color:#BBB;}
.ks-studio-font:focus{border-color:#0000FF;color:#0000FF;}
.ks-clr-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}
.ks-studio-size{display:flex;gap:3px;flex-shrink:0;}
.ks-studio-size-btn{width:32px;height:28px;border:2px solid #E5E5E5;border-radius:6px;background:#FFF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:#999;}
.ks-studio-size-btn:hover{border-color:#BBB;}
.ks-studio-size-btn.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.ks-studio-size-ico{border:2px solid currentColor;border-radius:2px;}
.ks-studio-size-ico.post{width:12px;height:12px;}
.ks-studio-size-ico.story{width:8px;height:14px;}
.ks-studio-size-ico.youtube{width:16px;height:9px;}
.ks-studio-logo-tog{position:relative;width:36px;height:32px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:#999;}
.ks-studio-logo-tog:hover{border-color:#BBB;}
.ks-studio-logo-tog.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.ks-studio-logo-slash{position:absolute;top:50%;left:50%;width:28px;height:2px;background:#DC2626;border-radius:1px;transform:translate(-50%,-50%) rotate(-45deg);}
/* Card grid (horizontal scroll on mobile) */
.ks-studio-grid{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:8px;scrollbar-width:none;max-width:100%;}
.ks-studio-grid::-webkit-scrollbar{display:none;}
.ks-studio-grid>.ks-studio-card{min-width:72%;max-width:72%;scroll-snap-align:start;flex-shrink:0;}
.ks-studio-card{border:2px solid #E8E8E8;border-radius:16px;overflow:hidden;background:#FFF;transition:border-color .2s;}
.ks-studio-card:hover{border-color:#CCC;}
/* Card preview */
.ks-studio-card-pv{position:relative;display:flex;flex-direction:column;align-items:stretch;justify-content:center;padding:24px;overflow:hidden;}
.ks-studio-card-shape{position:absolute;bottom:-4%;left:-4%;pointer-events:none;z-index:0;}
.ks-studio-card-shape.int-1{width:45%;height:45%;opacity:.06;}
.ks-studio-card-shape.int-2{width:65%;height:65%;opacity:.2;}
.ks-studio-card-shape.int-3{width:90%;height:90%;opacity:.55;}
.ks-studio-card-c{display:flex;flex-direction:column;gap:10px;width:100%;position:relative;z-index:1;}
.ks-studio-card-c.layout-title{align-items:center;justify-content:center;text-align:center;}
.ks-studio-card-c.layout-title .ks-studio-card-h{font-size:calc(20px * var(--fs,1));font-weight:700;line-height:1.5;}
.ks-studio-card-c.layout-title-body{text-align:right;}
.ks-studio-card-c.layout-title-body .ks-studio-card-h{font-size:calc(17px * var(--fs,1));font-weight:700;line-height:1.5;}
.ks-studio-card-c.layout-title-body .ks-studio-card-b{font-size:calc(13px * var(--fs,1));line-height:1.7;}
.ks-studio-card-c.layout-body{align-items:stretch;justify-content:center;text-align:right;}
.ks-studio-card-c.layout-body .ks-studio-card-b.body-only{font-size:calc(15px * var(--fs,1));line-height:1.7;}
.ks-studio-card-div{border-top:1px solid;margin:4px 0;width:100%;}
.ks-studio-card-logo{position:absolute;bottom:14px;right:14px;width:60px;height:auto;opacity:.5;z-index:1;}
/* Cover image layouts */
.ks-studio-card-pv.has-cover-img{padding:0;gap:0;overflow:hidden;position:relative;}
.ks-studio-card-pv.has-cover-img .ks-studio-card-logo{bottom:10px;right:14px;width:44px;z-index:3;}
.ks-studio-cv-img{width:100%;flex-shrink:0;z-index:1;overflow:hidden;}
.ks-studio-cv-img img{width:100%;object-fit:cover;display:block;}
.ks-studio-cv-text{width:100%;text-align:right;padding:8px 10px;z-index:2;display:flex;flex-direction:column;align-items:flex-end;gap:2px;box-sizing:border-box;}
.ks-studio-cv-title{font-weight:700;line-height:1.35;text-align:right;width:100%;word-wrap:break-word;overflow-wrap:break-word;}
.cl-img-top .ks-studio-cv-img{flex:0 0 50%;}
.cl-img-top .ks-studio-cv-img img{width:100%;height:100%;aspect-ratio:auto;object-fit:cover;}
.cl-img-top .ks-studio-cv-text{flex:1;justify-content:center;padding:10px 16px;}
.cl-img-bottom .ks-studio-cv-text{flex:1;justify-content:center;padding:12px 16px;}
.cl-img-bottom .ks-studio-cv-img{flex:0 0 50%;}
.cl-img-bottom .ks-studio-cv-img img{width:100%;height:100%;aspect-ratio:auto;object-fit:cover;}
.cl-img-full .ks-studio-cv-img{position:absolute;inset:0;width:100%;height:100%;}
.cl-img-full .ks-studio-cv-img img{width:100%;height:100%;aspect-ratio:auto;}
.cl-img-full .ks-studio-cv-overlay{position:absolute;bottom:0;left:0;right:0;z-index:2;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.4) 50%,transparent 100%);padding:12px 16px 36px;}
.cl-img-full .ks-studio-cv-overlay .ks-studio-cv-title{color:#FFF !important;}
.cl-title-top .ks-studio-cv-text{padding:14px 12px 8px;flex:0;}
.cl-title-top .ks-studio-cv-img{flex:1;}
.cl-title-top .ks-studio-cv-img img{width:100%;height:100%;aspect-ratio:auto;object-fit:cover;}
.cl-minimal{padding:10px !important;flex-direction:column;justify-content:center;align-items:center;}
.cl-minimal .ks-studio-cv-img{width:50%;border-radius:10px;overflow:hidden;flex-shrink:0;margin:0 auto;}
.cl-minimal .ks-studio-cv-img img{aspect-ratio:1;border-radius:10px;object-fit:cover;}
.cl-minimal .ks-studio-cv-text{align-items:center;text-align:center;}
.cl-minimal .ks-studio-cv-title{text-align:center;}
/* Card actions bar */
.ks-studio-acts{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-top:1px solid #F0F0F0;}
.ks-studio-acts-l{display:flex;gap:4px;}
.ks-studio-acts-r{display:flex;gap:6px;}
.ks-studio-lay-sel{padding:6px 10px;border:1.5px solid #E5E5E5;border-radius:999px;background:#FAFAFA;font-family:inherit;font-size:12px;font-weight:600;color:#666;outline:none;cursor:pointer;direction:rtl;}
.ks-studio-lay-sel:hover{border-color:#BBB;}
.ks-studio-lay-sel:focus{border-color:#0000FF;color:#0000FF;}
.ks-studio-abtn{width:32px;height:28px;border:1.5px solid #E5E5E5;border-radius:6px;background:#FAFAFA;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;color:#888;padding:0;}
.ks-studio-abtn:hover{border-color:#0000FF;color:#0000FF;}
.ks-studio-font-scale{display:flex;align-items:center;gap:2px;border:1.5px solid #E5E5E5;border-radius:6px;overflow:hidden;background:#FAFAFA;}
.ks-studio-fs-btn{width:24px;height:26px;border:none;background:transparent;cursor:pointer;font-size:14px;font-weight:700;color:#888;display:flex;align-items:center;justify-content:center;transition:all .15s;font-family:inherit;padding:0;}
.ks-studio-fs-btn:hover{color:#0000FF;background:#F0F0FF;}
.ks-studio-fs-val{font-size:10px;font-weight:600;color:#666;min-width:28px;text-align:center;font-family:'IBM Plex Sans Arabic',monospace;}
/* Cover image controls */
.ks-studio-cover-img{padding:8px 14px;border-top:1px solid #F0F0F0;display:flex;align-items:center;}
.ks-studio-cover-add{display:flex;align-items:center;gap:6px;padding:6px 12px;border:1.5px dashed #D0D0D0;border-radius:999px;background:#FAFAFA;font-family:inherit;font-size:11px;font-weight:600;color:#888;cursor:pointer;transition:all .15s;width:100%;justify-content:center;}
.ks-studio-cover-add:hover{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.ks-studio-cover-ctrl{display:flex;flex-direction:column;gap:6px;width:100%;}
.ks-studio-cover-info{display:flex;align-items:center;gap:6px;padding:4px 8px;background:#F0F0FF;border-radius:999px;border:1.5px solid #D0D0FF;width:100%;font-size:11px;font-weight:600;color:#333;box-sizing:border-box;}
.ks-studio-cover-rm{width:22px;height:22px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#999;border-radius:4px;transition:all .15s;margin-right:auto;margin-left:0;padding:0;}
.ks-studio-cover-rm:hover{color:#DC2626;background:#FEF2F2;}
.ks-studio-img-pos{display:flex;align-items:center;gap:8px;width:100%;}
.ks-studio-img-pos-l{font-size:10px;font-weight:600;color:#888;white-space:nowrap;}
.ks-studio-img-pos-r{flex:1;height:4px;-webkit-appearance:none;appearance:none;background:#E5E5E5;border-radius:2px;outline:none;cursor:pointer;}
.ks-studio-img-pos-r::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#0000FF;cursor:pointer;border:2px solid #FFF;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.ks-studio-img-lay-row{display:flex;gap:3px;}
.ks-studio-img-lay{display:flex;align-items:center;justify-content:center;padding:4px;border:1.5px solid #E5E5E5;border-radius:5px;background:#FFF;cursor:pointer;transition:all .15s;}
.ks-studio-img-lay:hover{border-color:#BBB;}
.ks-studio-img-lay.on{border-color:#0000FF;background:#F0F0FF;}
.ks-studio-cl-ico{width:24px;height:16px;border-radius:3px;border:1px solid currentColor;position:relative;overflow:hidden;color:#888;}
.ks-studio-img-lay.on .ks-studio-cl-ico{color:#0000FF;}
.ks-studio-cl-ico::before,.ks-studio-cl-ico::after{content:"";position:absolute;display:block;}
.ks-studio-cl-ico.img-top::before{top:0;left:0;right:0;height:55%;background:currentColor;opacity:.3;}
.ks-studio-cl-ico.img-top::after{bottom:2px;right:2px;width:60%;height:3px;background:currentColor;opacity:.5;border-radius:1px;}
.ks-studio-cl-ico.img-bottom::before{bottom:0;left:0;right:0;height:45%;background:currentColor;opacity:.3;}
.ks-studio-cl-ico.img-bottom::after{top:3px;right:2px;width:60%;height:3px;background:currentColor;opacity:.5;border-radius:1px;}
.ks-studio-cl-ico.img-full::before{inset:0;background:currentColor;opacity:.2;}
.ks-studio-cl-ico.img-full::after{bottom:2px;right:2px;width:60%;height:3px;background:currentColor;opacity:.7;border-radius:1px;}
.ks-studio-cl-ico.title-top::before{top:2px;left:50%;transform:translateX(-50%);width:60%;height:3px;background:currentColor;opacity:.5;border-radius:1px;}
.ks-studio-cl-ico.title-top::after{bottom:0;left:0;right:0;height:55%;background:currentColor;opacity:.3;}
.ks-studio-cl-ico.minimal::before{top:50%;left:50%;transform:translate(-50%,-60%);width:40%;height:40%;border-radius:3px;background:currentColor;opacity:.3;}
.ks-studio-cl-ico.minimal::after{bottom:3px;left:50%;transform:translateX(-50%);width:50%;height:2px;background:currentColor;opacity:.5;border-radius:1px;}
/* Edit panel (per card) */
.ks-studio-edit{padding:14px;border-top:1px solid #F0F0F0;display:flex;flex-direction:column;gap:8px;background:#FAFAFA;box-sizing:border-box;}
.ks-studio-edit-l{font-size:12px;font-weight:600;color:#666;}
.ks-studio-edit-i{padding:8px 12px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:13px;outline:none;background:#FFF;direction:rtl;box-sizing:border-box;width:100%;}
.ks-studio-edit-i:focus{border-color:#0000FF;}
.ks-studio-edit-ta{padding:8px 12px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:13px;outline:none;resize:vertical;background:#FFF;line-height:1.6;direction:rtl;box-sizing:border-box;width:100%;}
.ks-studio-edit-ta:focus{border-color:#0000FF;}
/* Add card */
.ks-studio-add-card{min-width:72%;max-width:72%;scroll-snap-align:start;flex-shrink:0;border:2px dashed #D0D0D0;border-radius:16px;background:#FAFAFA;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:#999;transition:all .2s;padding:0;}
.ks-studio-add-card:hover{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
/* Download all */
.ks-studio-dl-all{display:flex;align-items:center;justify-content:center;gap:5px;padding:8px 16px;border:none;border-radius:999px;background:#0000FF;color:#FFF;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;}
.ks-studio-dl-all:hover{opacity:.9;box-shadow:0 4px 16px rgba(0,0,255,.25);}
/* ── Branded publish button (v15) ── */
.ks-pub-brand{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 16px;border-radius:9px;border:none;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;white-space:nowrap;transition:filter .15s,box-shadow .15s,opacity .15s;opacity:.85;}
.ks-pub-brand:hover{filter:brightness(1.08);opacity:1;}
.ks-pub-brand:focus-visible{box-shadow:0 0 0 2.5px rgba(0,0,0,.15);}
.ks-pub-brand svg{flex-shrink:0;}
.ks-pub-lock-ico{width:11px;height:11px;opacity:.65;flex-shrink:0;}
.ks-coming-soon{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:200;background:#371D12;color:#FFF;font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;font-size:14px;font-weight:700;padding:12px 24px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:ks-fu .2s ease both;direction:rtl;}
.ks-studio-label{font-size:11px;font-weight:600;color:#777;}
@media(max-width:480px){
  .ks-studio-tog{padding:7px 12px;font-size:11px;gap:5px;}
  .ks-studio-wrap{margin-bottom:10px;}
  .ks-studio-tools{padding:8px;gap:6px;margin-bottom:8px;border-width:1.5px;border-radius:10px;}
  .ks-studio-tmpl-pv{width:32px;height:32px;}
  .ks-studio-tmpl-n{font-size:7px;}
  .ks-studio-tmpls{gap:4px;}
  .ks-studio-row{gap:5px;}
  .ks-studio-cp{padding:2px 6px 2px 2px;}
  .ks-studio-cp-sw{width:16px;height:16px;}
  .ks-studio-cp-l{font-size:9px;}
  .ks-studio-font{font-size:10px;padding:3px 6px;}
  .ks-studio-size-btn{width:26px;height:22px;}
  .ks-studio-size-ico.post{width:10px;height:10px;}
  .ks-studio-size-ico.story{width:7px;height:12px;}
  .ks-studio-size-ico.youtube{width:14px;height:8px;}
  .ks-studio-logo-tog{width:30px;height:26px;}
  .ks-studio-logo-tog svg{width:14px;height:14px;}
  .ks-studio-int-btn{padding:3px 5px;font-size:8px;}
  .ks-studio-int-ico{width:14px;height:14px;}
  .ks-studio-shp{width:22px;height:22px;padding:3px;}
  .ks-studio-label{font-size:10px;margin-bottom:2px !important;}
  .ks-studio-shapes{gap:3px;}
  .ks-studio-grid{gap:8px;padding-bottom:4px;}
  .ks-studio-grid>.ks-studio-card{min-width:92%;max-width:92%;}
  .ks-studio-add-card{min-width:92%;max-width:92%;aspect-ratio:auto !important;min-height:120px;max-height:200px;}
  .ks-studio-card{border-radius:12px;border-width:1.5px;}
  .ks-studio-card-pv{padding:12px;max-height:280px;aspect-ratio:auto !important;overflow:hidden;}
  .ks-studio-card-pv.has-cover-img{max-height:300px;}
  .ks-studio-card-logo{width:36px;bottom:8px;right:8px;}
  .ks-studio-card-c.layout-title .ks-studio-card-h{font-size:calc(16px * var(--fs,1)) !important;}
  .ks-studio-card-c.layout-title-body .ks-studio-card-h{font-size:calc(14px * var(--fs,1)) !important;}
  .ks-studio-card-c.layout-title-body .ks-studio-card-b{font-size:calc(11px * var(--fs,1)) !important;}
  .ks-studio-card-c.layout-body .ks-studio-card-b.body-only{font-size:calc(13px * var(--fs,1)) !important;}
  .ks-studio-acts{padding:6px 8px;}
  .ks-studio-lay-sel{font-size:10px;padding:4px 7px;}
  .ks-studio-abtn{width:28px;height:24px;}
  .ks-studio-fs-btn{width:22px;height:22px;font-size:12px;}
  .ks-studio-fs-val{font-size:9px;min-width:24px;}
  .ks-studio-cover-img{padding:6px 8px;}
  .ks-studio-cover-add{font-size:10px;padding:5px 10px;}
  .ks-studio-cover-info{font-size:10px;padding:3px 6px;}
  .ks-studio-cover-rm{width:20px;height:20px;}
  .ks-studio-img-pos-l{font-size:9px;}
  .ks-studio-img-lay{padding:3px;}
  .ks-studio-cl-ico{width:20px;height:14px;}
  .ks-studio-edit{padding:8px;}
  .ks-studio-edit-l{font-size:11px;}
  .ks-studio-edit-i{font-size:12px;padding:6px 8px;}
  .ks-studio-edit-ta{font-size:11px;padding:6px 8px;min-height:45px;}
  .ks-studio-dl-all{font-size:11px;padding:6px 12px;}
}
`

// ─── Icons ───────────────────────────────────────────
const STEP_ICO:Record<string,JSX.Element> = {
  book:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#12B76A" strokeWidth="2" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill="#12B76A" fillOpacity=".18" stroke="#12B76A" strokeWidth="2"/></svg>,
  paper:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#F2F2F2" stroke="#D9D9D9" strokeWidth="2"/><line x1="8" y1="8" x2="16" y2="8" stroke="#D9D9D9" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="#D9D9D9" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  star:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="12,2 14.9,8.6 22,9.3 17,14.1 18.6,21 12,17.5 5.4,21 7,14.1 2,9.3 9.1,8.6" fill="#EC4899" stroke="#DB2777" strokeWidth="0.8"/></svg>,
  quotes:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="10" r="3.2" fill="#0000FF"/><path d="M4.2 13 Q3 17 7 16.2 Q9.5 17 10.5 13Z" fill="#0000FF"/><circle cx="16" cy="10" r="3.2" fill="#0000FF"/><path d="M13.2 13 Q12 17 16 16.2 Q18.5 17 19.5 13Z" fill="#0000FF"/></svg>,
  message:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h16a1 1 0 011 1v10a1 1 0 01-1 1H7l-4 3.5V5a1 1 0 011-1z" fill="#FBD84B" stroke="#DFB300" strokeWidth="1.5"/></svg>,
  check:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#12B76A" stroke="#0A9957" strokeWidth="1"/><polyline points="7,12 10,15 17,8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}
const Chk = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const Arrow = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
const EditIco = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const RegenIco = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
const SaveIco = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>

// ─── Helper: single-select chip group ─────────────────
function ChipGroup({options,value,onChange,label}:{options:string[];value:string;onChange:(v:string)=>void;label:string}) {
  return (
    <div className="ks-sg">
      <div className="ks-sg-lbl">{label}</div>
      <div className="ks-sg-chips" role="group" aria-label={label}>
        {options.map(o => (
          <button key={o} className="ks-sc" type="button" aria-pressed={value===o} tabIndex={0}
            onClick={() => onChange(o)} onKeyDown={e => {if(e.key==="Enter"||e.key===" "){e.preventDefault();onChange(o)}}}
          >{o}</button>
        ))}
      </div>
    </div>
  )
}

// ─── Helper: toggle ───────────────────────────────────
function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}) {
  return (
    <label className="ks-tog">
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} aria-label={label} />
      <div className={`ks-tog-track${checked?" on":""}`}><div className="ks-tog-knob"/></div>
      {label}
    </label>
  )
}

// ─── Main Component ───────────────────────────────────
export default function KitabhSocial({premium:premiumProp=false}:{premium?:boolean}) {
  type Phase = "input"|"loading"|"results"
  const [phase,setPhase] = useState<Phase>("input")
  const [text,setText] = useState("")
  const [selected,setSelected] = useState<Set<PlatformId>>(new Set(["x","linkedin_ar"]))
  const [cfg,setCfg] = useState<Cfg>({...DEFAULT_CFG})
  const [advOpen,setAdvOpen] = useState(false)
  const [linkInput,setLinkInput] = useState("")
  const [linkErr,setLinkErr] = useState("")
  const [result,setResult] = useState<any>(null)
  const [stepIdx,setStepIdx] = useState(0)
  const [copied,setCopied] = useState<Record<string,boolean>>({})
  const [error,setError] = useState<string|null>(null)
  const [capName,setCapName] = useState("")
  const [capEmail,setCapEmail] = useState("")
  const [capPhone,setCapPhone] = useState("")
  const [capLoading,setCapLoading] = useState(false)
  const [capDone,setCapDone] = useState(false)

  // ─── Auth / Trial / Popups ───
  const user = getUser()
  const isPremium = premiumProp || user.premium
  const [showSignup,setShowSignup] = useState(false)
  const [showUpgrade,setShowUpgrade] = useState(false)
  const [showPaywall,setShowPaywall] = useState(false)
  const [signupEmail,setSignupEmail] = useState("")
  const [signupLoading,setSignupLoading] = useState(false)
  const [used,setUsed] = useState(()=>getUsage())

  const timerRef = useRef<any>(null)

  // Show signup (visitor) or upgrade (free user) popup after 3s on loading
  useEffect(()=>{
    if(phase!=="loading"||isPremium)return
    const t=setTimeout(()=>{
      if(!user.authenticated){setShowSignup(true)}
      else{setShowUpgrade(true)}
    },3000)
    return()=>clearTimeout(t)
  },[phase,isPremium,user.authenticated])

  // v6: per-card edit & regenerate state
  const [editMode,setEditMode] = useState<Record<string,boolean>>({})
  const [editText,setEditText] = useState<Record<string,string>>({})
  const [regenLoading,setRegenLoading] = useState<Record<string,boolean>>({})
  const [superHook,setSuperHook] = useState(false)
  const [autoDetected,setAutoDetected] = useState(false)
  const [detectNote,setDetectNote] = useState(false)
  const [selectedHook,setSelectedHook] = useState<Record<string,number>>({})
  const [qualityOpen,setQualityOpen] = useState(true)

  // v15: tabbed results view
  const [activeTab,setActiveTab] = useState<PlatformId|null>(null)
  const [createModalOpen,setCreateModalOpen] = useState(false)
  const [showSettings,setShowSettings] = useState(false)

  // v15: studio state
  const [showStudio,setShowStudio] = useState(false)
  const [stTmplIdx,setStTmplIdx] = useState(0)
  const [stBg,setStBg] = useState(ST_TEMPLATES[0].bg)
  const [stText,setStText] = useState(ST_TEMPLATES[0].text)
  const [stSc,setStSc] = useState(ST_TEMPLATES[0].sc)
  const [stFontIdx,setStFontIdx] = useState(3) // IBM Plex Sans Arabic default
  const [stShapeInt,setStShapeInt] = useState(2)
  const [stSlideSize,setStSlideSize] = useState<string>("post")
  const [stShowLogo,setStShowLogo] = useState(true)
  const [comingSoon,setComingSoon] = useState(false)
  const [stSlides,setStSlides] = useState<StSlide[]>([])
  const [stActiveIdx,setStActiveIdx] = useState(0)
  const [stEditingSlide,setStEditingSlide] = useState<number|null>(null)
  const stInited = useRef(false)

  const set = useCallback(<K extends keyof Cfg>(k:K,v:Cfg[K]) => setCfg(p=>({...p,[k]:v})),[])

  useEffect(()=>{const s=sessionStorage.getItem("ks_draft");if(s&&!text)setText(s)},[])
  useEffect(()=>{if(text)sessionStorage.setItem("ks_draft",text)},[text])

  // Auto-detect settings when enough text is pasted
  // Resets when text is cleared so re-paste triggers detection again
  const prevWcRef = useRef(0)
  useEffect(()=>{
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0
    // Reset detection when text is cleared or nearly empty
    if (wc < 20 && autoDetected) {
      setAutoDetected(false)
      prevWcRef.current = wc
      return
    }
    // Trigger auto-detect when text jumps by 30+ words (paste) and hasn't been detected yet
    if (wc >= 50 && wc - prevWcRef.current >= 30 && !autoDetected) {
      const detected = detectSettings(text)
      setCfg(prev => {
        const next = { ...prev }
        if (detected.tone) next.tone = detected.tone
        if (detected.objective) next.objective = detected.objective
        if (detected.contentStyle) next.contentStyle = detected.contentStyle
        if (detected.intensity) next.intensity = detected.intensity
        if (detected.languageMode) next.languageMode = detected.languageMode
        if (detected.emojiLevel) next.emojiLevel = detected.emojiLevel
        if (detected.enableCTA !== undefined) { next.enableCTA = detected.enableCTA; if (detected.ctaValue) next.ctaValue = detected.ctaValue }
        if (detected.enableHashtags !== undefined) { next.enableHashtags = detected.enableHashtags; if (detected.hashtagMode) next.hashtagMode = detected.hashtagMode as any; if (detected.customHashtags) next.customHashtags = detected.customHashtags; if (detected.hashtagCount) next.hashtagCount = detected.hashtagCount }
        if (detected.detectedLinks.length > 0) { next.links = detected.detectedLinks; if (detected.linksPlacement) next.linksPlacement = detected.linksPlacement as any }
        return next
      })
      setAutoDetected(true)
      setDetectNote(true)
      setTimeout(() => setDetectNote(false), 4000)
    }
    prevWcRef.current = wc
  },[text,autoDetected])

  const wc = text.trim()?text.trim().split(/\s+/).length:0
  const canGo = wc>=50&&selected.size>0

  useEffect(()=>{if(phase==="loading"){setStepIdx(0);timerRef.current=setInterval(()=>setStepIdx(i=>i<LOADING_STEPS.length-1?i+1:i),2500)}else clearInterval(timerRef.current);return()=>clearInterval(timerRef.current)},[phase])

  const togglePlat = useCallback((id:PlatformId)=>{setSelected(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n})},[])
  const selAll = useCallback(()=>setSelected(new Set(PLATFORMS.map(p=>p.id))),[])
  const clrAll = useCallback(()=>setSelected(new Set()),[])

  const addLink = useCallback(()=>{
    const v=linkInput.trim(); setLinkErr("")
    if(!v){return}
    if(!/^https?:\/\/.+\..+/.test(v)){setLinkErr("أدخل رابطًا صالحًا يبدأ بـ http:// أو https://");return}
    set("links",[...cfg.links,v]); setLinkInput("")
  },[linkInput,cfg.links,set])
  const removeLink = useCallback((i:number)=>{set("links",cfg.links.filter((_,idx)=>idx!==i))},[cfg.links,set])

  // v6: updated to flat JSON format (no "platforms" wrapper)
  const startGen = useCallback(async()=>{
    if(!canGo)return
    if(!isPremium&&!canUse(isPremium)){setShowPaywall(true);try{(window as any).fbq?.('track','HitPaywall')}catch(_){};return}
    setPhase("loading");setError(null)
    try{
      const ids=Array.from(selected) as PlatformId[]
      const data=await callAPI(text,buildPrompt(ids,cfg,superHook))
      // v6: handle both flat and legacy nested format
      const flat = data?.platforms ? data.platforms : data
      // v11: validate quality data
      if (flat?.quality) {
        const q = flat.quality
        if (typeof q.score === 'string') q.score = parseFloat(q.score)
        if (isNaN(q.score)) q.score = 0
        if (!Array.isArray(q.pillars)) q.pillars = []
        q.pillars = q.pillars.map((p: any) => ({ ...p, score: typeof p.score === 'string' ? parseFloat(p.score) : (p.score || 0) }))
        if (!q.label) { const s = q.score; q.label = s >= 8.5 ? "ممتاز" : s >= 7 ? "جيد جداً" : s >= 5.5 ? "جيد" : "يحتاج تطوير" }
      }
      const hasContent=ids.some(id=>flat?.[id]?.text)
      if(!hasContent) throw new Error("لم نحصل على محتوى. حاول مرة أخرى.")
      recordUsage();setUsed(getUsage())
      try{(window as any).fbq?.('track','GenerateSocial')}catch(_){}
      setResult(flat);setActiveTab(ids[0]);setPhase("results")
    }catch(e:any){console.error("KS:",e);setPhase("input");setError(e.message||"خطأ غير متوقع")}
  },[text,selected,canGo,cfg,superHook])

  // v6: regenerate a single platform (v9: optional hookAngle)
  const regenPlatform = useCallback(async(pid:PlatformId, hookAngle?:string)=>{
    setRegenLoading(p=>({...p,[pid]:true}));setError(null)
    try{
      const basePrompt = buildPrompt([pid],cfg,superHook)
      const prompt = hookAngle ? `${basePrompt}\n\n═══ تعليمات إضافية ═══\nاكتب المنشور باستخدام هذه الزاوية بالتحديد: "${hookAngle}"\nاستخدم هذه الزاوية كأساس للخطاف والمحتوى. أعد نفس حقل hooks كما هو.` : basePrompt
      const data=await callAPI(text,prompt)
      const flat = data?.platforms ? data.platforms : data
      const pd=flat?.[pid]
      if(!pd||!pd.text) throw new Error("لم نحصل على محتوى. حاول مرة أخرى.")
      // Preserve hooks from previous result if new result doesn't have them
      if(!pd.hooks && result?.[pid]?.hooks) pd.hooks = result[pid].hooks
      setResult((prev:any)=>({...prev,[pid]:pd}))
    }catch(e:any){console.error("KS regen:",e);setError(e.message||"خطأ في إعادة التوليد")}
    setRegenLoading(p=>({...p,[pid]:false}))
  },[text,cfg,superHook,result])

  // v9: regen with a specific hook angle
  const regenWithHook = useCallback((pid:PlatformId, hookLabel:string, hookIdx:number)=>{
    setSelectedHook(p=>({...p,[pid]:hookIdx}))
    regenPlatform(pid, hookLabel)
  },[regenPlatform])

  // v12: regenerate all platforms at once (for mini settings bar)
  const [regenAllLoading,setRegenAllLoading] = useState(false)
  const regenAll = useCallback(async()=>{
    if(regenAllLoading)return;if(!isPremium&&!canUse(isPremium)){setShowPaywall(true);return}
    setRegenAllLoading(true);setError(null)
    try{
      const ids=Array.from(selected) as PlatformId[]
      const data=await callAPI(text,buildPrompt(ids,cfg,superHook))
      const flat = data?.platforms ? data.platforms : data
      if (flat?.quality) {
        const q = flat.quality
        if (typeof q.score === 'string') q.score = parseFloat(q.score)
        if (isNaN(q.score)) q.score = 0
        if (!Array.isArray(q.pillars)) q.pillars = []
        q.pillars = q.pillars.map((p: any) => ({ ...p, score: typeof p.score === 'string' ? parseFloat(p.score) : (p.score || 0) }))
        if (!q.label) { const s = q.score; q.label = s >= 8.5 ? "ممتاز" : s >= 7 ? "جيد جداً" : s >= 5.5 ? "جيد" : "يحتاج تطوير" }
      }
      const hasContent=ids.some(id=>flat?.[id]?.text)
      if(!hasContent) throw new Error("لم نحصل على محتوى. حاول مرة أخرى.")
      recordUsage();setUsed(getUsage())
      setResult(flat);setSelectedHook({})
    }catch(e:any){console.error("KS regenAll:",e);setError(e.message||"خطأ في إعادة التوليد")}
    setRegenAllLoading(false)
  },[text,selected,cfg,superHook,regenAllLoading])

  // v15: studio functions — initialize slides when studio opens
  useEffect(()=>{
    if(showStudio && stSlides.length===0 && !stInited.current){
      const initText = activeTab && result?.[activeTab]?.text ? result[activeTab].text.slice(0,300) : ""
      setStSlides([{layout:"title",headline:initText||"اكتب النص هنا",body:""}])
      setStActiveIdx(0); stInited.current=true
    }
  },[showStudio,stSlides.length,activeTab,result])

  const selectStTemplate = useCallback((idx:number)=>{
    setStTmplIdx(idx); setStBg(ST_TEMPLATES[idx].bg); setStText(ST_TEMPLATES[idx].text); setStSc(ST_TEMPLATES[idx].sc)
  },[])

  const stUpdateSlide = useCallback((i:number,u:Partial<StSlide>)=>{
    setStSlides(p=>p.map((s,idx)=>idx===i?{...s,...u}:s))
  },[])

  const stAddSlide = useCallback(()=>{
    setStSlides(p=>[...p,{layout:"title-body",headline:"عنوان جديد",body:""}])
    setStActiveIdx(stSlides.length)
  },[stSlides.length])

  const stRemoveSlide = useCallback((i:number)=>{
    if(stSlides.length<=1) return
    setStSlides(p=>p.filter((_,idx)=>idx!==i))
    setStActiveIdx(prev=>prev>=stSlides.length-1?Math.max(0,stSlides.length-2):prev)
  },[stSlides.length])

  const downloadQuoteCard = useCallback(async(slideIdx?:number)=>{
    const si = slideIdx ?? stActiveIdx
    const slide = stSlides[si]
    if(!slide) return
    await document.fonts.ready
    const c = document.createElement("canvas"), ctx = c.getContext("2d")
    if (!ctx) return
    const sizeInfo = ST_SIZES.find(s=>s.id===stSlideSize) || ST_SIZES[0]
    const W = sizeInfo.w, H = sizeInfo.h, DPR = 2
    c.width = W*DPR; c.height = H*DPR; ctx.scale(DPR,DPR)
    const ff = `${ST_FONTS[stFontIdx].family}, 'IBM Plex Sans Arabic', sans-serif`
    const S = W / 270, PAD = Math.round(24*S), textW = W - PAD*2
    ctx.fillStyle = stBg; ctx.fillRect(0,0,W,H)
    // Shape
    if (stShapeInt > 0) {
      try {
        const lvl = ST_SHAPE_LEVELS[stShapeInt]
        const shapeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${stSc}" opacity="${lvl.opacity}">${ST_SHAPES[stTmplIdx]}</svg>`
        const shapeImg = await stLoadSvgImage(shapeSvg)
        const shapeW = W*lvl.size, shapeH = shapeW
        ctx.drawImage(shapeImg, W*0.5-shapeW*0.15, H-shapeH*0.85, shapeW, shapeH)
      } catch(_){}
    }
    // Logo
    if (stShowLogo) {
      try {
        const logoImg = await stLoadLogoImage(stText)
        const logoW = Math.round(70*S), logoH = Math.round(logoW*0.25)
        ctx.drawImage(logoImg, W-logoW-Math.round(14*S), H-logoH-Math.round(14*S), logoW, logoH)
      } catch(_){}
    }
    // Text rendering based on layout (with image support)
    const fs = slide.fontScale ?? 1
    ctx.fillStyle = stText; ctx.textBaseline = "top"; ctx.direction = "rtl"
    const vCenter = H/2
    if(slide.imageUrl){
      try {
        const cimg = await stLoadImage(slide.imageUrl)
        const cl = slide.coverLayout || "img-top"
        const pos = slide.imagePos ?? 50
        const sz=Math.round(16*S*fs), lh=Math.round(16*S*fs*1.35)
        const drawTitle=(x:number,y:number,maxW:number,align:"right"|"center")=>{
          ctx.fillStyle=stText;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign=align
          const lines=stWrapText(ctx,slide.headline,maxW)
          lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lh))
          let endY=y+lines.length*lh
          if(slide.body){
            const bSz=Math.round(12*S*fs),bLh=Math.round(12*S*fs*1.5)
            ctx.font=`400 ${bSz}px ${ff}`;ctx.fillStyle=stText+"CC"
            const bLines=stWrapText(ctx,slide.body,maxW)
            endY+=Math.round(2*S);bLines.forEach((l,i)=>ctx.fillText(l,x,endY+i*bLh));endY+=bLines.length*bLh
          }
          return endY
        }
        const textPad=Math.round(16*S)
        if(cl==="img-top"){
          const ih=H*0.5;stDrawRoundedImage(ctx,cimg,0,0,W,ih,0,pos)
          ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="right"
          const lines=stWrapText(ctx,slide.headline,W-textPad*2)
          const blockH=lines.length*lh
          const tY=ih+Math.max(textPad,(H-ih-blockH)/2)
          drawTitle(W-textPad,tY,W-textPad*2,"right")
        } else if(cl==="img-bottom"){
          ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="right"
          const lines=stWrapText(ctx,slide.headline,W-textPad*2)
          const blockH=lines.length*lh
          const tY=Math.max(textPad,(H*0.5-blockH)/2)
          drawTitle(W-textPad,tY,W-textPad*2,"right")
          stDrawRoundedImage(ctx,cimg,0,H*0.5,W,H*0.5,0,pos)
        } else if(cl==="img-full"){
          stDrawRoundedImage(ctx,cimg,0,0,W,H,0,pos)
          const grd=ctx.createLinearGradient(0,H*0.35,0,H)
          grd.addColorStop(0,"rgba(0,0,0,0)");grd.addColorStop(0.5,"rgba(0,0,0,.4)");grd.addColorStop(1,"rgba(0,0,0,.8)")
          ctx.fillStyle=grd;ctx.fillRect(0,0,W,H)
          ctx.fillStyle="#FFFFFF";ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="right"
          const lines=stWrapText(ctx,slide.headline,W-textPad*2)
          const tY=H-lines.length*lh-Math.round(36*S)
          lines.forEach((l,i)=>ctx.fillText(l,W-textPad,tY+i*lh))
          if(slide.body){const bSz=Math.round(12*S*fs);ctx.font=`400 ${bSz}px ${ff}`;ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillText(slide.body.slice(0,80),W-textPad,tY+lines.length*lh+Math.round(4*S))}
        } else if(cl==="title-top"){
          ctx.fillStyle=stText;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="center"
          const lines=stWrapText(ctx,slide.headline,W-textPad*2)
          const tY=textPad
          lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*lh))
          const imgTop=tY+lines.length*lh+Math.round(8*S)
          stDrawRoundedImage(ctx,cimg,0,imgTop,W,H-imgTop,0,pos)
        } else if(cl==="minimal"){
          const imgS=W*0.5,imgX=(W-imgS)/2,imgY=Math.round(10*S),imgR=Math.round(10*S)
          stDrawRoundedImage(ctx,cimg,imgX,imgY,imgS,imgS,imgR,pos)
          ctx.fillStyle=stText;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="center"
          const lines=stWrapText(ctx,slide.headline,W-Math.round(20*S))
          const tY=imgY+imgS+Math.round(8*S)
          lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*lh))
        }
      } catch(_){
        // Fallback: centered title
        const sz=Math.round(20*S*fs),lh2=Math.round(20*S*fs*1.5)
        ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="center"
        const lines=stWrapText(ctx,slide.headline,textW)
        const sy=vCenter-(lines.length*lh2)/2
        lines.forEach((l,i)=>ctx.fillText(l,W/2,sy+i*lh2))
      }
    } else if(slide.layout==="title"){
      const sz=Math.round(20*S*fs), lh=Math.round(20*S*fs*1.5)
      ctx.font=`700 ${sz}px ${ff}`; ctx.textAlign="center"
      const lines=stWrapText(ctx,slide.headline,textW)
      const maxL=Math.floor((H-PAD*2)/lh)
      const dl=lines.slice(0,maxL)
      const sy=vCenter-(dl.length*lh)/2
      dl.forEach((l,i)=>ctx.fillText(l,W/2,sy+i*lh))
    } else if(slide.layout==="title-body"){
      const hSz=Math.round(17*S*fs), hLh=Math.round(17*S*fs*1.5)
      const bSz=Math.round(13*S*fs), bLh=Math.round(13*S*fs*1.7)
      const gap=Math.round(10*S)
      ctx.font=`700 ${hSz}px ${ff}`
      const hl=stWrapText(ctx,slide.headline,textW)
      ctx.font=`400 ${bSz}px ${ff}`
      const bl=stWrapText(ctx,slide.body||"",textW)
      const divH=Math.round(1*S)+gap*2
      const totalH=hl.length*hLh+divH+bl.length*bLh
      let y=Math.max(PAD,vCenter-totalH/2)
      ctx.fillStyle=stText;ctx.font=`700 ${hSz}px ${ff}`;ctx.textAlign="right"
      hl.forEach((l,i)=>ctx.fillText(l,W-PAD,y+i*hLh))
      y+=hl.length*hLh+gap
      const accentColor = stSc+"44"
      ctx.strokeStyle=accentColor;ctx.lineWidth=Math.max(1,Math.round(1*S))
      ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(W-PAD,y);ctx.stroke()
      y+=gap;ctx.font=`400 ${bSz}px ${ff}`;ctx.fillStyle=stText+"CC"
      bl.forEach((l,i)=>ctx.fillText(l,W-PAD,y+i*bLh))
    } else {
      const sz=Math.round(15*S*fs), lh=Math.round(15*S*fs*1.7)
      ctx.font=`400 ${sz}px ${ff}`; ctx.textAlign="right"; ctx.fillStyle=stText+"DD"
      const lines=stWrapText(ctx,slide.body||slide.headline,textW)
      const maxL=Math.floor((H-PAD*2)/lh)
      const dl=lines.slice(0,maxL)
      const sy=vCenter-(dl.length*lh)/2
      dl.forEach((l,i)=>ctx.fillText(l,W-PAD,sy+i*lh))
    }
    // Download
    c.toBlob((blob)=>{
      if(!blob)return; const url=URL.createObjectURL(blob)
      const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)
      if(isIOS){window.open(url,"_blank")} else {
        const a=document.createElement("a"); a.download=`kitabh-slide-${si+1}.png`; a.href=url; a.click()
        setTimeout(()=>URL.revokeObjectURL(url),5000)
      }
    },"image/png")
  },[stBg,stText,stSc,stFontIdx,stShapeInt,stTmplIdx,stSlideSize,stShowLogo,stSlides,stActiveIdx])

  const downloadAllSlides = useCallback(()=>{
    stSlides.forEach((_,i)=>setTimeout(()=>downloadQuoteCard(i),i*400))
  },[stSlides,downloadQuoteCard])

  // v6: edit handlers
  const startEdit = useCallback((pid:string)=>{
    setEditText(p=>({...p,[pid]:result?.[pid]?.text||""}))
    setEditMode(p=>({...p,[pid]:true}))
  },[result])
  const saveEdit = useCallback((pid:string)=>{
    setResult((prev:any)=>{
      if(!prev?.[pid])return prev
      return{...prev,[pid]:{...prev[pid],text:editText[pid]||""}}
    })
    setEditMode(p=>({...p,[pid]:false}))
  },[editText])
  const cancelEdit = useCallback((pid:string)=>{setEditMode(p=>({...p,[pid]:false}))},[])

  const reset = useCallback(()=>{setPhase("input");setResult(null);setText("");setCopied({});setCapName("");setCapEmail("");setCapPhone("");setCapDone(false);setError(null);setEditMode({});setEditText({});setRegenLoading({});setAutoDetected(false);setDetectNote(false);setSelectedHook({});setQualityOpen(true);setCfg({...DEFAULT_CFG});setActiveTab(null);setCreateModalOpen(false);setShowSettings(false);setShowStudio(false);setStTmplIdx(0);setStBg(ST_TEMPLATES[0].bg);setStText(ST_TEMPLATES[0].text);setStSc(ST_TEMPLATES[0].sc);setStFontIdx(3);setStShapeInt(2);setStSlideSize("post");setStShowLogo(true);setComingSoon(false);setStSlides([]);setStActiveIdx(0);stInited.current=false;try{sessionStorage.removeItem("ks_draft")}catch(_){}},[])
  const submitCap = useCallback(async(skip=false)=>{if(skip){setPhase("results");return}if(!capEmail||!capName)return;setCapLoading(true);await pushToHubSpot(capName,capEmail,capPhone);setCapLoading(false);setCapDone(true);setTimeout(()=>setPhase("results"),900)},[capName,capEmail,capPhone])
  const copyT = useCallback((pid:string,c:string)=>{navigator.clipboard.writeText(c).then(()=>{setCopied(p=>({...p,[pid]:true}));setTimeout(()=>setCopied(p=>({...p,[pid]:false})),2000)})},[])

  // v6: updated getContent for flat format
  const getContent=(pid:string,d:any):string=>{
    const p=d?.[pid];if(!p)return""
    if(pid==="tiktok")return`${p.text||""}\n\n---\nسكريبت:\n${p.script||""}`
    if(pid==="youtube")return`العنوان: ${p.title||""}\n\n${p.text||""}\n\nبديلة:\n${(p.alt_titles||[]).join("\n")}`
    return p.text||""
  }

  return (
    <div className="ks" style={{width:"100%",alignSelf:"stretch",display:"block"}}>
      <style>{CSS}</style>
      {comingSoon && <div className="ks-coming-soon">قريبًا</div>}

      {/* ═══ INPUT PHASE ═══ */}
      {phase==="input"&&(
        <div className="ks-in">
          {error&&<div className="ks-error">{error}<button className="ks-error-dismiss" onClick={()=>setError(null)}>إغلاق</button></div>}
          <div className="ks-card">
            <div className="ks-card-top">
              <div className="ks-card-title">حوّل مقالك لمحتوى اجتماعي</div>
              {/* counter hidden in v15 */}
            </div>
            <textarea className="ks-ta" value={text} onChange={e=>setText(e.target.value)} onPaste={e=>e.stopPropagation()} placeholder={"ضع المقال هنا...\n\nالحد الأدنى 50 كلمة."}/>

            {detectNote && (
              <div className="ks-detect-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                تم تحديث الإعدادات لتتناسب مع نصك
                <button className="ks-detect-note-x" onClick={() => setDetectNote(false)} type="button" aria-label="إغلاق">×</button>
              </div>
            )}

            {/* ── Platforms ── */}
            <div className="ks-sec">
              <div className="ks-sec-head">
                <div className="ks-sec-title">المنصات</div>
                <div className="ks-sec-acts">
                  <button className="ks-sec-act" type="button" onClick={selAll} aria-label="تحديد الكل">تحديد الكل</button>
                  <div className="ks-sec-sep"/>
                  <button className="ks-sec-act" type="button" onClick={clrAll} aria-label="مسح الكل">مسح</button>
                </div>
              </div>
              <div className="ks-chips" role="group" aria-label="اختر المنصات">
                {PLATFORMS.map(p=>{const s=selected.has(p.id);return(
                  <button key={p.id} className="ks-pc" type="button" aria-pressed={s} aria-label={p.label} tabIndex={0} onClick={()=>togglePlat(p.id)}>
                    <span className="ks-pc-ico">{PI[p.id]}</span>{p.short}<span className="ks-pc-chk"><Chk/></span>
                  </button>
                )})}
              </div>
              <div className="ks-sec-info">تم اختيار <b>{selected.size}</b> من {PLATFORMS.length}</div>
              {/* ── Super Hook toggle (moved here in v13) ── */}
              <div className="ks-superhook">
                <button className={`ks-superhook-btn${superHook?" on":""}`} type="button" onClick={()=>setSuperHook(!superHook)} aria-pressed={superHook}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={superHook?"#F59E0B":"none"} stroke={superHook?"#92400E":"currentColor"} strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  شد انتباه القارئ
                </button>
              </div>
            </div>

            {/* ── Advanced Settings (collapsible) ── */}
            <div className="ks-adv">
              <button className="ks-adv-toggle" type="button" aria-expanded={advOpen} onClick={()=>setAdvOpen(!advOpen)}>
                <div className="ks-adv-toggle-r">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  إعدادات التحويل
                </div>
                <span className="ks-adv-arrow"><Arrow/></span>
              </button>

              <div className={`ks-adv-body${advOpen?" open":""}`} id="ks-adv-panel">
                <ChipGroup label="النبرة" options={TONES} value={cfg.tone} onChange={v=>set("tone",v)} />
                {cfg.tone==="نبرة مخصصة"&&(
                  <input className="ks-sg-inp ks-sg-inp-wide" value={cfg.customTone} onChange={e=>set("customTone",e.target.value)} placeholder="مثال: عامية سعودية / مصرية / شامية..." aria-label="نبرة مخصصة"/>
                )}
                <ChipGroup label="الهدف" options={OBJECTIVES} value={cfg.objective} onChange={v=>set("objective",v)} />
                <ChipGroup label="طبيعة المحتوى" options={STYLES} value={cfg.contentStyle} onChange={v=>set("contentStyle",v)} />
                <div className="ks-sg">
                  <div className="ks-sg-lbl">مستوى الجرأة</div>
                  <div className="ks-slider-wrap">
                    <input type="range" className="ks-slider" min={0} max={INTENSITIES.length-1} step={1}
                      value={INTENSITIES.indexOf(cfg.intensity)} onChange={e=>set("intensity",INTENSITIES[parseInt(e.target.value)])}
                      aria-label="مستوى الجرأة" />
                    <div className="ks-slider-labels">
                      {INTENSITIES.map((o,i)=>(<span key={o} className={`ks-slider-label${cfg.intensity===o?" active":""}`} onClick={()=>set("intensity",o)}>{o}</span>))}
                    </div>
                  </div>
                </div>

                <div className="ks-sg">
                  <div className="ks-sg-lbl">الدعوة لاتخاذ إجراء</div>
                  <Toggle label="أضف دعوة" checked={cfg.enableCTA} onChange={v=>set("enableCTA",v)} />
                  {cfg.enableCTA&&(
                    <div className="ks-sg-chips" style={{marginTop:8}}>
                      {CTA_PRESETS.map(o=>(
                        <button key={o} className="ks-sc" type="button" aria-pressed={cfg.ctaValue===o} onClick={()=>set("ctaValue",o)}>{o}</button>
                      ))}
                    </div>
                  )}
                  {cfg.enableCTA&&cfg.ctaValue==="دعوة مخصصة"&&(
                    <input className="ks-sg-inp ks-sg-inp-wide" value={cfg.customCTA} onChange={e=>set("customCTA",e.target.value)} placeholder="اكتب الدعوة المطلوبة..." aria-label="دعوة مخصصة"/>
                  )}
                </div>

                <div className="ks-sg">
                  <div className="ks-sg-lbl">الهاشتاقات</div>
                  <div className="ks-sg-row">
                    <Toggle label="أضف هاشتاقات" checked={cfg.enableHashtags} onChange={v=>set("enableHashtags",v)} />
                  </div>
                  {cfg.enableHashtags&&(
                    <div className="ks-sg-row" style={{marginTop:8}}>
                      <button className="ks-sc" type="button" aria-pressed={cfg.hashtagMode==="auto"} onClick={()=>set("hashtagMode","auto")}>تلقائي</button>
                      <button className="ks-sc" type="button" aria-pressed={cfg.hashtagMode==="custom"} onClick={()=>set("hashtagMode","custom")}>مخصص</button>
                      <div className="ks-stepper">
                        <button className="ks-stepper-btn" type="button" onClick={()=>set("hashtagCount",Math.max(1,cfg.hashtagCount-1))} aria-label="أقل">−</button>
                        <div className="ks-stepper-val">{cfg.hashtagCount}</div>
                        <button className="ks-stepper-btn" type="button" onClick={()=>set("hashtagCount",Math.min(10,cfg.hashtagCount+1))} aria-label="أكثر">+</button>
                      </div>
                    </div>
                  )}
                  {cfg.enableHashtags&&cfg.hashtagMode==="custom"&&(
                    <input className="ks-sg-inp ks-sg-inp-wide" value={cfg.customHashtags} onChange={e=>set("customHashtags",e.target.value)} placeholder="#كتابة #محتوى #تسويق" aria-label="هاشتاقات مخصصة"/>
                  )}
                </div>

                <div className="ks-sg">
                  <div className="ks-sg-lbl">الإيموجي</div>
                  <div className="ks-slider-wrap">
                    <input type="range" className="ks-slider" min={0} max={EMOJI_LEVELS.length-1} step={1}
                      value={EMOJI_LEVELS.indexOf(cfg.emojiLevel)} onChange={e=>set("emojiLevel",EMOJI_LEVELS[parseInt(e.target.value)])}
                      aria-label="مستوى الإيموجي" />
                    <div className="ks-slider-labels">
                      {EMOJI_LEVELS.map((o,i)=>(<span key={o} className={`ks-slider-label${cfg.emojiLevel===o?" active":""}`} onClick={()=>set("emojiLevel",o)}>{o}</span>))}
                    </div>
                  </div>
                </div>

                <div className="ks-sg">
                  <div className="ks-sg-lbl">اللغة</div>
                  <div className="ks-sg-row">
                    {LANGUAGES.map(o=>(
                      <button key={o} className="ks-sc" type="button" aria-pressed={cfg.languageMode===o} onClick={()=>set("languageMode",o)}>{o}</button>
                    ))}
                  </div>
                  {cfg.languageMode==="ترجمة إلى…"&&(
                    <input className="ks-sg-inp ks-sg-inp-wide" value={cfg.targetLanguage} onChange={e=>set("targetLanguage",e.target.value)} placeholder="مثال: فرنسي، تركي، أردو..." aria-label="لغة الترجمة"/>
                  )}
                </div>

                <ChipGroup label="نوع التحويل" options={TRANSFORMS} value={cfg.transformType} onChange={v=>set("transformType",v)} />
              </div>
            </div>

            {/* ── Links ── */}
            <div className="ks-links">
              <div className="ks-links-head">الروابط</div>
              <div className="ks-links-input">
                <input className="ks-links-inp" value={linkInput} onChange={e=>{setLinkInput(e.target.value);setLinkErr("")}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addLink()}}} placeholder="https://رابط-الموقع.com" aria-label="أدخل رابطًا"/>
                <button className="ks-links-add" type="button" onClick={addLink} disabled={!linkInput.trim()}>+ إضافة</button>
              </div>
              {linkErr&&<div className="ks-link-err">{linkErr}</div>}
              {cfg.links.length>0&&(
                <>
                  <div className="ks-links-list">
                    {cfg.links.map((l,i)=>(
                      <div key={i} className="ks-link-chip">
                        <span>{l.replace(/^https?:\/\//,"").slice(0,30)}</span>
                        <button className="ks-link-x" type="button" onClick={()=>removeLink(i)} aria-label="حذف الرابط">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="ks-links-place">
                    <button className="ks-sc" type="button" aria-pressed={cfg.linksPlacement==="inline"} onClick={()=>set("linksPlacement","inline")}>داخل النص</button>
                    <button className="ks-sc" type="button" aria-pressed={cfg.linksPlacement==="end"} onClick={()=>set("linksPlacement","end")}>في نهاية المنشور</button>
                  </div>
                </>
              )}
            </div>

            <div className="ks-card-foot">
              <button className={`ks-btn-go${canGo?" on":""}`} onClick={startGen} type="button">حوّل الآن</button>
              <div className="ks-wc"><b>{wc}</b> كلمة</div>
            </div>

          {/* Trial bar */}
          {!isPremium && (
            <div style={{width:"100%",maxWidth:580,margin:"12px auto 0",background:"#FFF",border:"1.5px solid #D9D9D9",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxSizing:"border-box" as const}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:"#818181",marginBottom:6}}>الاستخدام التجريبي</div>
                <div style={{height:6,background:"#F2F2F2",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:used>=MAX_FREE?"#E82222":"#0000FF",borderRadius:3,width:`${Math.min(100,(used/MAX_FREE)*100)}%`,transition:"width .3s"}}/></div>
                <div style={{fontSize:11,color:"#818181",marginTop:4}}>{used} من {MAX_FREE} استخدامات</div>
              </div>
              <a href="https://kitabh.com/pricing" target="_blank" rel="noopener" style={{fontSize:13,fontWeight:700,color:"#FFF",background:"#0000FF",padding:"8px 16px",borderRadius:8,textDecoration:"none",whiteSpace:"nowrap" as const}}>اكتب دون حد</a>
            </div>
          )}

          </div>
        </div>
      )}

      {/* ═══ LOADING ═══ */}
      {phase==="loading"&&(()=>{const p=Math.round(((stepIdx+1)/LOADING_STEPS.length)*100);return(
        <div className="ks-load"><div className="ks-load-card">
          <div className="ks-load-header"><div className="ks-load-hicon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div><div><div className="ks-load-title">نحوّل مقالك...</div><div className="ks-load-sub">نكتب محتوى مخصص لـ {selected.size} منصات</div></div></div>
          <div className="ks-load-steps">{LOADING_STEPS.map((s,i)=>{const st=i<stepIdx?"done":i===stepIdx?"active":"pending";return(<div key={i} className={`ks-load-step ${st}`}><div className="ks-load-step-ico">{st==="done"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#12B76A"/><polyline points="7,12 10,15 17,8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>:STEP_ICO[s.icon]}</div><div className="ks-load-step-txt">{s.text}</div>{st==="active"&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2.5" style={{animation:"ks-spin 1s linear infinite",flexShrink:0}}><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>}</div>)})}</div>
          <div className="ks-load-prog"><div className="ks-load-prog-fill" style={{width:`${p}%`}}/></div>
          <div className="ks-load-pct">{p}% مكتمل</div>
        </div></div>
      )})()}


      {/* ═══ RESULTS ═══ */}
      {phase==="results"&&result&&(
        <>
          <div className="ks-res">
            <div className="ks-top-bar"><button className="ks-btn-back" onClick={reset} type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>عودة</button></div>
            {error&&<div className="ks-error">{error}<button className="ks-error-dismiss" onClick={()=>setError(null)}>إغلاق</button></div>}
            <div className="ks-res-header"><div className="ks-res-title">محتواك جاهز للنشر</div><div className="ks-res-sub">انسخ المحتوى وانشره مباشرة على كل منصة</div></div>
            {/* v15: Animated settings toggle + collapsible panel */}
            <div className="ks-settings-bar">
              <button className={`ks-settings-tog${showSettings?" on":""}`} type="button" onClick={()=>setShowSettings(v=>!v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                نبرة المحتوى
                <svg className={`ks-settings-arrow${showSettings?" open":""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <button className={`ks-studio-tog${showStudio?" on":""}`} type="button" onClick={()=>setShowStudio(v=>!v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                ستوديو كتابة
                <svg className={`ks-settings-arrow${showStudio?" open":""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <button className="ks-mini-refresh" type="button" onClick={regenAll} disabled={regenAllLoading} style={{marginRight:"auto"}}>
                {regenAllLoading ? (
                  <svg className="ks-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                )}
                {regenAllLoading ? "جاري التوليد..." : "أعد التوليد"}
              </button>
            </div>
            {showSettings && (
              <div className="ks-settings-panel">
                <ChipGroup label="النبرة" options={TONES} value={cfg.tone} onChange={v=>set("tone",v)} />
                {cfg.tone==="نبرة مخصصة"&&(
                  <input className="ks-sg-inp ks-sg-inp-wide" value={cfg.customTone} onChange={e=>set("customTone",e.target.value)} placeholder="مثال: عامية سعودية / مصرية / شامية..." aria-label="نبرة مخصصة"/>
                )}
                <ChipGroup label="الهدف" options={OBJECTIVES} value={cfg.objective} onChange={v=>set("objective",v)} />
                <ChipGroup label="طبيعة المحتوى" options={STYLES} value={cfg.contentStyle} onChange={v=>set("contentStyle",v)} />
                <div className="ks-sg">
                  <div className="ks-sg-lbl">مستوى الجرأة</div>
                  <div className="ks-slider-wrap">
                    <input type="range" className="ks-slider" min={0} max={INTENSITIES.length-1} step={1}
                      value={INTENSITIES.indexOf(cfg.intensity)} onChange={e=>set("intensity",INTENSITIES[parseInt(e.target.value)])}
                      aria-label="مستوى الجرأة" />
                    <div className="ks-slider-labels">
                      {INTENSITIES.map((o,i)=>(<span key={o} className={`ks-slider-label${cfg.intensity===o?" active":""}`} onClick={()=>set("intensity",o)}>{o}</span>))}
                    </div>
                  </div>
                </div>
                <div className="ks-sg">
                  <div className="ks-sg-lbl">الإيموجي</div>
                  <div className="ks-slider-wrap">
                    <input type="range" className="ks-slider" min={0} max={EMOJI_LEVELS.length-1} step={1}
                      value={EMOJI_LEVELS.indexOf(cfg.emojiLevel)} onChange={e=>set("emojiLevel",EMOJI_LEVELS[parseInt(e.target.value)])}
                      aria-label="مستوى الإيموجي" />
                    <div className="ks-slider-labels">
                      {EMOJI_LEVELS.map((o,i)=>(<span key={o} className={`ks-slider-label${cfg.emojiLevel===o?" active":""}`} onClick={()=>set("emojiLevel",o)}>{o}</span>))}
                    </div>
                  </div>
                </div>
                <ChipGroup label="نوع التحويل" options={TRANSFORMS} value={cfg.transformType} onChange={v=>set("transformType",v)} />
                <div className="ks-sg">
                  <div className="ks-sg-lbl">الدعوة لاتخاذ إجراء</div>
                  <Toggle label="أضف دعوة" checked={cfg.enableCTA} onChange={v=>set("enableCTA",v)} />
                  {cfg.enableCTA&&(
                    <div className="ks-sg-chips" style={{marginTop:8}}>
                      {CTA_PRESETS.map(o=>(
                        <button key={o} className="ks-sc" type="button" aria-pressed={cfg.ctaValue===o} onClick={()=>set("ctaValue",o)}>{o}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ks-sg">
                  <div className="ks-sg-lbl">الهاشتاقات</div>
                  <div className="ks-sg-row">
                    <Toggle label="أضف هاشتاقات" checked={cfg.enableHashtags} onChange={v=>set("enableHashtags",v)} />
                  </div>
                  {cfg.enableHashtags&&(
                    <div className="ks-sg-row" style={{marginTop:8}}>
                      <button className="ks-sc" type="button" aria-pressed={cfg.hashtagMode==="auto"} onClick={()=>set("hashtagMode","auto")}>تلقائي</button>
                      <button className="ks-sc" type="button" aria-pressed={cfg.hashtagMode==="custom"} onClick={()=>set("hashtagMode","custom")}>مخصص</button>
                      <div className="ks-stepper">
                        <button className="ks-stepper-btn" type="button" onClick={()=>set("hashtagCount",Math.max(1,cfg.hashtagCount-1))} aria-label="أقل">−</button>
                        <div className="ks-stepper-val">{cfg.hashtagCount}</div>
                        <button className="ks-stepper-btn" type="button" onClick={()=>set("hashtagCount",Math.min(10,cfg.hashtagCount+1))} aria-label="أكثر">+</button>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:4}}>
                  <div className={`ks-superhook-btn${superHook?" on":""}`} style={{cursor:"pointer"}} onClick={()=>setSuperHook(!superHook)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={superHook?"#F59E0B":"none"} stroke={superHook?"#92400E":"currentColor"} strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    شد انتباه القارئ
                  </div>
                </div>
              </div>
            )}
            {/* ═══ v15: STUDIO (carousel card grid) ═══ */}
            {showStudio && (()=>{
              const ar = stSlideSize==="post"?"3/4":stSlideSize==="story"?"9/16":"16/9"
              const fontFamily = `${ST_FONTS[stFontIdx].family}, 'IBM Plex Sans Arabic', sans-serif`
              return (
              <div className="ks-studio-wrap">
                {/* Tools panel */}
                <div className="ks-studio-tools">
                  <div className="ks-studio-row">
                    <div className="ks-studio-size">
                      {ST_SIZES.map(s => (
                        <button key={s.id} className={`ks-studio-size-btn${stSlideSize===s.id?" on":""}`} onClick={()=>setStSlideSize(s.id)} type="button" title={s.label}>
                          <div className={`ks-studio-size-ico ${s.id}`}/>
                        </button>
                      ))}
                    </div>
                    <button className={`ks-studio-logo-tog${stShowLogo?" on":""}`} onClick={()=>setStShowLogo(v=>!v)} type="button" title={stShowLogo?"إخفاء الشعار":"إظهار الشعار"}>
                      <svg width="16" height="16" viewBox="0 0 400 100" fill="currentColor" dangerouslySetInnerHTML={{__html:ST_LOGO_SVG}}/>
                      {!stShowLogo && <div className="ks-studio-logo-slash"/>}
                    </button>
                  </div>
                  <div>
                    <div className="ks-studio-label" style={{marginBottom:4}}>الشكل الهندسي</div>
                    <div className="ks-studio-int">
                      {ST_SHAPE_LEVELS.map(lvl => (
                        <button key={lvl.id} className={`ks-studio-int-btn${stShapeInt===lvl.id?" on":""}`} onClick={()=>setStShapeInt(lvl.id)} type="button">
                          {lvl.id > 0 && <svg className="ks-studio-int-ico" viewBox="0 0 100 100" fill="currentColor" style={{opacity:lvl.opacity*1.5+0.3}} dangerouslySetInnerHTML={{__html:ST_SHAPES[stTmplIdx]}}/>}
                          <span>{lvl.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="ks-studio-tmpls">
                    {ST_TEMPLATES.map((t,i) => (
                      <button key={t.id} className={`ks-studio-tmpl${stTmplIdx===i&&stBg.toLowerCase()===t.bg.toLowerCase()?" on":""}`} onClick={()=>selectStTemplate(i)} type="button">
                        <div className="ks-studio-tmpl-pv" style={{background:t.bg}}>
                          <svg viewBox="0 0 100 100" fill={t.sc} dangerouslySetInnerHTML={{__html:ST_SHAPES[i]}}/>
                        </div>
                        <span className="ks-studio-tmpl-n">{t.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="ks-studio-row">
                    <label className="ks-studio-cp">
                      <input type="color" value={stBg} onChange={e=>setStBg(e.target.value)} className="ks-clr-native"/>
                      <span className="ks-studio-cp-sw" style={{background:stBg}}/>
                      <span className="ks-studio-cp-l">الخلفية</span>
                    </label>
                    <label className="ks-studio-cp">
                      <input type="color" value={stText} onChange={e=>setStText(e.target.value)} className="ks-clr-native"/>
                      <span className="ks-studio-cp-sw" style={{background:stText}}/>
                      <span className="ks-studio-cp-l">الخط</span>
                    </label>
                    <select className="ks-studio-font" value={stFontIdx} onChange={e=>setStFontIdx(Number(e.target.value))}>
                      {ST_FONTS.map((f,i) => <option key={f.id} value={i}>{f.label}</option>)}
                    </select>
                  </div>
                  {stShapeInt > 0 && (
                    <div className="ks-studio-shapes">
                      {ST_SHAPES.map((s,i) => (
                        <button key={i} className={`ks-studio-shp${stTmplIdx===i?" on":""}`} onClick={()=>setStTmplIdx(i)} type="button">
                          <svg viewBox="0 0 100 100" fill="currentColor" dangerouslySetInnerHTML={{__html:s}}/>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card grid (horizontal scroll) */}
                <div className="ks-studio-grid">
                  {stSlides.map((slide,idx) => {
                    const fs = slide.fontScale??1
                    const pos = slide.imagePos??50
                    const cl = slide.coverLayout||"img-top"
                    return (
                    <div key={idx} className="ks-studio-card">
                      {/* Card preview */}
                      <div className={`ks-studio-card-pv${slide.imageUrl?` has-cover-img cl-${cl}`:""}`} style={{background:stBg,color:stText,fontFamily,aspectRatio:ar} as React.CSSProperties}>
                        {stShapeInt>0&&!(slide.imageUrl&&cl==="img-full")&&(
                          <svg className={`ks-studio-card-shape int-${stShapeInt}`} viewBox="0 0 100 100" fill={stSc} dangerouslySetInnerHTML={{__html:ST_SHAPES[stTmplIdx]}}/>
                        )}
                        {slide.imageUrl?(()=>{
                          const imgEl=<div className="ks-studio-cv-img"><img src={slide.imageUrl} alt="" style={{objectPosition:`center ${pos}%`}}/></div>
                          const titleEl=<div className="ks-studio-cv-title" style={{fontSize:`${16*fs}px`}}>{slide.headline||"العنوان"}</div>
                          const bodyEl=slide.body?<div style={{color:stText+"CC",fontSize:`${11*fs}px`,lineHeight:1.7}}>{slide.body}</div>:null
                          if(cl==="img-top") return <>{imgEl}<div className="ks-studio-cv-text">{titleEl}{bodyEl}</div></>
                          if(cl==="img-bottom") return <><div className="ks-studio-cv-text">{titleEl}{bodyEl}</div>{imgEl}</>
                          if(cl==="img-full") return <>{imgEl}<div className="ks-studio-cv-overlay"><div className="ks-studio-cv-text">{titleEl}{bodyEl}</div></div></>
                          if(cl==="title-top") return <><div className="ks-studio-cv-text" style={{alignItems:"center",textAlign:"center"}}>{titleEl}</div>{imgEl}</>
                          if(cl==="minimal") return <>{imgEl}<div className="ks-studio-cv-text" style={{alignItems:"center",textAlign:"center"}}>{titleEl}</div></>
                          return <>{imgEl}<div className="ks-studio-cv-text">{titleEl}{bodyEl}</div></>
                        })():(
                          <div className={`ks-studio-card-c layout-${slide.layout}`} style={{"--fs":fs} as React.CSSProperties}>
                            {slide.layout!=="body"&&(
                              <div className="ks-studio-card-h">{slide.headline||"العنوان"}</div>
                            )}
                            {slide.layout==="title-body"&&slide.body&&(
                              <>
                                <div className="ks-studio-card-div" style={{borderColor:stSc+"44"}}/>
                                <div className="ks-studio-card-b" style={{color:stText+"CC"}}>{slide.body}</div>
                              </>
                            )}
                            {slide.layout==="body"&&(
                              <div className="ks-studio-card-b body-only" style={{color:stText+"DD"}}>{slide.body||slide.headline||"النص"}</div>
                            )}
                          </div>
                        )}
                        {stShowLogo&&(
                          <svg className="ks-studio-card-logo" viewBox="0 0 400 100" fill={slide.imageUrl&&cl==="img-full"?"#FFF":stText} dangerouslySetInnerHTML={{__html:ST_LOGO_SVG}}/>
                        )}
                      </div>
                      {/* Actions bar */}
                      <div className="ks-studio-acts">
                        <div className="ks-studio-acts-l">
                          <select className="ks-studio-lay-sel" value={slide.layout} onChange={e=>stUpdateSlide(idx,{layout:e.target.value as StLayout})}>
                            {ST_LAYOUTS.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
                          </select>
                        </div>
                        <div className="ks-studio-acts-r">
                          <div className="ks-studio-font-scale">
                            <button className="ks-studio-fs-btn" type="button" onClick={()=>{const nv=Math.max(0.5,Math.round(((fs)-0.1)*10)/10);stUpdateSlide(idx,{fontScale:nv})}} title="تصغير الخط">−</button>
                            <span className="ks-studio-fs-val">{Math.round(fs*100)}%</span>
                            <button className="ks-studio-fs-btn" type="button" onClick={()=>{const nv=Math.min(2,Math.round(((fs)+0.1)*10)/10);stUpdateSlide(idx,{fontScale:nv})}} title="تكبير الخط">+</button>
                          </div>
                          <button className="ks-studio-abtn" type="button" onClick={()=>setStEditingSlide(stEditingSlide===idx?null:idx)} title="تعديل">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="ks-studio-abtn" type="button" onClick={()=>downloadQuoteCard(idx)} title="تحميل">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                          </button>
                        </div>
                      </div>
                      {/* Cover image controls */}
                      <div className="ks-studio-cover-img">
                        {slide.imageUrl ? (
                          <div className="ks-studio-cover-ctrl">
                            <div className="ks-studio-cover-info">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              <span>صورة الشريحة</span>
                              <button className="ks-studio-cover-rm" type="button" onClick={()=>stUpdateSlide(idx,{imageUrl:undefined,imagePos:undefined,coverLayout:undefined})}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                              </button>
                            </div>
                            <div className="ks-studio-img-pos">
                              <span className="ks-studio-img-pos-l">موضع</span>
                              <input type="range" min="0" max="100" value={pos} onChange={e=>stUpdateSlide(idx,{imagePos:Number(e.target.value)})} className="ks-studio-img-pos-r"/>
                            </div>
                            <div className="ks-studio-img-lay-row">
                              {ST_COVER_LAYOUTS.map(clx=>(
                                <button key={clx.id} className={`ks-studio-img-lay${cl===clx.id?" on":""}`} onClick={()=>stUpdateSlide(idx,{coverLayout:clx.id})} type="button" title={clx.label}>
                                  <div className={`ks-studio-cl-ico ${clx.id}`}/>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <label className="ks-studio-cover-add">
                            <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>stUpdateSlide(idx,{imageUrl:r.result as string,coverLayout:"img-full"});r.readAsDataURL(f);e.target.value=""}} style={{display:"none"}}/>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            أضف صورة
                          </label>
                        )}
                      </div>
                      {/* Edit panel (toggle) */}
                      {stEditingSlide===idx&&(
                        <div className="ks-studio-edit">
                          <label className="ks-studio-edit-l">العنوان</label>
                          <input className="ks-studio-edit-i" value={slide.headline} onChange={e=>stUpdateSlide(idx,{headline:e.target.value})} dir="rtl"/>
                          <label className="ks-studio-edit-l">الفقرة</label>
                          <textarea className="ks-studio-edit-ta" value={slide.body} onChange={e=>stUpdateSlide(idx,{body:e.target.value})} dir="rtl" rows={3}/>
                        </div>
                      )}
                    </div>
                  )})}
                  {/* Add card */}
                  <button className="ks-studio-add-card" type="button" onClick={stAddSlide} style={{aspectRatio:ar}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    <span>أضف شريحة</span>
                  </button>
                </div>

                {/* Download all */}
                {stSlides.length>1&&(
                  <div style={{padding:"8px 0",display:"flex",justifyContent:"center"}}>
                    <button className="ks-studio-dl-all" type="button" onClick={downloadAllSlides}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                      تحميل الكل ({stSlides.length})
                    </button>
                  </div>
                )}
              </div>
            )})()}
            {/* ═══ v15: TABBED PLATFORM VIEW ═══ */}
            <div className="ks-tabs-wrap">
              {/* Platform icon tabs */}
              <div className="ks-tabs-bar">
                {Array.from(selected).map(pid=>{
                  const ps2=PS[pid]
                  const isActive=activeTab===pid
                  return(
                    <button key={pid} className={`ks-tab${isActive?" active":""}`} type="button"
                      style={{borderColor:isActive?ps2.c:"#E0E0E0",color:ps2.c}}
                      onClick={()=>setActiveTab(pid)} aria-label={PLATFORMS.find(p=>p.id===pid)?.label}>
                      {PI[pid]}
                    </button>
                  )
                })}
                <button className="ks-tab-add" type="button" onClick={()=>setCreateModalOpen(true)} aria-label="إنشاء منشور جديد">+</button>
              </div>

              {/* Active tab content */}
              {activeTab&&result?.[activeTab]&&(()=>{
                const pid=activeTab
                const pl=PLATFORMS.find(p=>p.id===pid)
                const pd=result[pid]
                const isEditing=editMode[pid]||false
                const isRegen=regenLoading[pid]||false
                const fc=getContent(pid,result),ic=copied[pid]||false,ps2=PS[pid]
                const isXThread=pid==="x"&&pd.text&&pd.text.includes("\n---\n")
                const postType = pid==="x"?(isXThread?"ثريد":"تغريدة"):pid==="youtube"?"فيديو":pid==="tiktok"?"فيديو":pid==="instagram"?"كابشن":"منشور"
                const charLimit = pid==="x"?280:pid.startsWith("linkedin")?3000:pid==="instagram"?2200:pid==="facebook"?63206:0
                const currentLen = (pd.text||"").length
                return(
                  <div className="ks-tab-content" key={pid}>
                    {/* Regen overlay */}
                    {isRegen&&(
                      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(255,255,255,.6)",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:16}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2.5" style={{animation:"ks-spin 1s linear infinite"}}><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>
                      </div>
                    )}
                    {/* Tab header */}
                    <div className="ks-tab-header">
                      <div className="ks-tab-header-ico" style={{background:ps2.b,color:ps2.c}}>{PI[pid]}</div>
                      <div className="ks-tab-header-name">{pl?.label}</div>
                      <span className="ks-tab-header-type">{postType}</span>
                      {pd.warnings&&pd.warnings.length>0&&<span style={{fontSize:11,color:"#F59E0B",fontWeight:600}}>⚠ {pd.warnings.length}</span>}
                    </div>
                    {/* Hook/Angle selector */}
                    {pd.hooks && pd.hooks.length > 1 && (
                      <div className="ks-hooks">
                        {pd.hooks.map((h:string, i:number) => (
                          <button key={i} className={`ks-hook-btn${(selectedHook[pid]||0)===i?" active":""}${isRegen?" loading":""}`}
                            type="button" disabled={isRegen}
                            onClick={() => { if(i===(selectedHook[pid]||0)) return; regenWithHook(pid as PlatformId, h, i) }}>
                            {h}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Content body */}
                    <div className="ks-tab-body">
                      {isEditing?(
                        <textarea className="ks-edit-ta" style={{minHeight:160}} value={editText[pid]||""} onChange={e=>setEditText(p=>({...p,[pid]:e.target.value}))} autoFocus/>
                      ):isXThread?(
                        <div className="ks-pcard-thread">{pd.text.split(/\n---\n/).filter(Boolean).map((t:string,ti:number,arr:string[])=>(<div key={ti} className="ks-pcard-tweet"><span className="ks-pcard-tweet-num">{ti+1}/{arr.length}</span>{t.trim()}</div>))}</div>
                      ):pid==="tiktok"?(
                        <><div className="ks-pcard-content">{pd.text}</div>{pd.script&&<div className="ks-pcard-section"><div className="ks-pcard-section-lbl">سكريبت الفيديو</div><div className="ks-pcard-content">{pd.script}</div></div>}</>
                      ):pid==="youtube"?(
                        <><div style={{fontSize:18,fontWeight:800,color:"#371D12",marginBottom:12}}>{pd.title}</div><div className="ks-pcard-content">{pd.text}</div>{pd.alt_titles?.length>0&&<div className="ks-pcard-section"><div className="ks-pcard-section-lbl">عناوين بديلة</div>{pd.alt_titles.map((t:string,i:number)=>(<div key={i} style={{fontSize:14,color:"#4E4E4E",padding:"6px 0",borderBottom:i<pd.alt_titles.length-1?"1px solid #F0F0F0":"none"}}>{i+1}. {t}</div>))}</div>}</>
                      ):(
                        <div className="ks-pcard-content">{pd.text}</div>
                      )}
                      {!isEditing&&pd.warnings&&pd.warnings.length>0&&(
                        <div className="ks-pcard-warn">{pd.warnings.map((w:string,i:number)=>(<div key={i} className="ks-pcard-warn-item">⚠ {w}</div>))}</div>
                      )}
                    </div>
                    {/* Toolbar */}
                    <div className="ks-tab-toolbar">
                      {charLimit>0&&<span className="ks-tab-charcount">{currentLen}{charLimit>0&&` / ${charLimit}`}</span>}
                    </div>
                    {/* Action + Publish footer */}
                    <div className="ks-tab-footer">
                      {isEditing?(
                        <>
                          <button className="ks-act-btn save" onClick={()=>saveEdit(pid)} type="button"><SaveIco/> حفظ</button>
                          <button className="ks-act-btn cancel" onClick={()=>cancelEdit(pid)} type="button">إلغاء</button>
                        </>
                      ):(
                        <>
                          <button className="ks-act-btn" onClick={()=>startEdit(pid)} type="button" disabled={isRegen}><EditIco/> تعديل</button>
                          <button className="ks-act-btn regen" onClick={()=>regenPlatform(pid as PlatformId)} type="button" disabled={isRegen}><RegenIco/> إعادة توليد</button>
                        </>
                      )}
                      <div style={{flex:1}}/>
                      <button className={`ks-pub-copy${ic?" copied":""}`} onClick={()=>copyT(pid,fc)} type="button">
                        {ic?<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>تم</>:<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>نسخ</>}
                      </button>
                      <button className="ks-pub-brand" type="button"
                        style={{background:ps2.c,color:ps2.c==="#000"||ps2.c==="#1A1A1A"?"#FFF":"#FFF"}}
                        onClick={()=>{setComingSoon(true);setTimeout(()=>setComingSoon(false),2000)}}>
                        {PI[pid]}
                        نشر/جدولة
                        <svg className="ks-pub-lock-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* ═══ v15: CREATE POST MODAL ═══ */}
          {createModalOpen&&(
            <div className="ks-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setCreateModalOpen(false)}}>
              <div className="ks-modal">
                <div className="ks-modal-head">
                  <div className="ks-modal-head-tabs">
                    {PLATFORMS.map(p=>{
                      const isOn=selected.has(p.id)
                      return(
                        <button key={p.id} className={`ks-tab${isOn?" active":""}`} type="button"
                          style={{borderColor:isOn?PS[p.id].c:"#E0E0E0",color:PS[p.id].c,width:36,height:36}}
                          onClick={()=>{setSelected(prev=>{const n=new Set(prev);if(n.has(p.id))n.delete(p.id);else n.add(p.id);return n})}}
                          aria-label={p.label} aria-pressed={isOn}>
                          {PI[p.id]}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="ks-modal-body">
                  <div style={{fontSize:13,color:"#818181",marginBottom:12,fontWeight:600}}>
                    اختر المنصات ثم ارجع واضغط «حوّل الآن» لتوليد المحتوى
                  </div>
                  <div style={{fontSize:12,color:"#AAA",lineHeight:1.7}}>
                    المنصات المختارة: {Array.from(selected).map(pid=>PLATFORMS.find(p=>p.id===pid)?.short).filter(Boolean).join("، ") || "لا شيء"}
                  </div>
                </div>
                <div className="ks-modal-foot">
                  <button className="ks-modal-cancel" type="button" onClick={()=>setCreateModalOpen(false)}>إغلاق</button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ v15: Quality Analysis Card (moved to bottom) ═══ */}
          {result?.quality && (()=>{
            const q = result.quality
            const sc = q.score || 0
            const qColor = sc >= 8.5 ? "#12B76A" : sc >= 7 ? "#0000FF" : sc >= 5.5 ? "#DFB300" : "#E82222"
            const qClass = sc >= 8.5 ? "excellent" : sc >= 7 ? "great" : sc >= 5.5 ? "good" : "weak"
            const circ = 2 * Math.PI * 34
            const offset = circ - (sc / 10) * circ
            const pillarColor = (s: number) => s >= 8.5 ? "#12B76A" : s >= 7 ? "#0000FF" : s >= 5.5 ? "#DFB300" : "#E82222"
            return (
              <div className="ks-res" style={{paddingTop:0}}>
                <div className="ks-qa">
                  <button className="ks-qa-toggle" type="button" aria-expanded={qualityOpen} onClick={()=>setQualityOpen(!qualityOpen)}>
                    <div className="ks-qa-toggle-r">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={qColor} strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      <span className="ks-qa-toggle-title">تحليل جودة المحتوى</span>
                      <span className={`ks-qa-badge ${qClass}`}>{q.label || "—"}</span>
                    </div>
                    <span className="ks-qa-arrow"><Arrow/></span>
                  </button>
                  <div className={`ks-qa-body${qualityOpen?" open":""}`}>
                    <div className="ks-qa-top">
                      <div className="ks-qa-ring-wrap">
                        <svg width="72" height="72" viewBox="0 0 72 72">
                          <circle cx="36" cy="36" r="34" fill="none" stroke="#F0F0F0" strokeWidth="4"/>
                          <circle cx="36" cy="36" r="34" fill="none" stroke={qColor} strokeWidth="4"
                            strokeDasharray={circ} strokeDashoffset={offset}
                            strokeLinecap="round" transform="rotate(-90 36 36)"
                            style={{transition:"stroke-dashoffset .6s ease"}}/>
                        </svg>
                        <div className="ks-qa-ring-label" style={{color:qColor}}>{sc.toFixed(1)}</div>
                      </div>
                      <div className="ks-qa-info">
                        <div className="ks-qa-info-label" style={{color:qColor}}>{q.label}</div>
                        {q.summary && <div className="ks-qa-info-summary">{q.summary}</div>}
                      </div>
                    </div>
                    {q.pillars && q.pillars.length > 0 && (
                      <div className="ks-qa-pillars">
                        {q.pillars.map((p: any) => (
                          <div key={p.id} className="ks-qa-pill">
                            <div className="ks-qa-pill-score" style={{color:pillarColor(p.score)}}>{(p.score||0).toFixed(1)}</div>
                            <div className="ks-qa-pill-name">{p.name}</div>
                            <div className="ks-qa-pill-bar"><div className="ks-qa-pill-bar-fill" style={{width:`${(p.score||0)*10}%`,background:pillarColor(p.score)}}/></div>
                            {p.note && <div className="ks-qa-pill-note">{p.note}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          <div className="ks-retry"><button className="ks-btn-retry" onClick={reset} type="button">← تحويل مقال آخر</button></div>
          <div className="ks-cta"><div className="ks-cta-card">
            <h2 className="ks-cta-title">انشر كتابتك على <span className="ks-cta-accent">كتابة</span></h2>
            <p className="ks-cta-sub">المنصة الاجتماعية للكتابة العربيّة</p>
            <div className="ks-cta-btns"><a href="https://apple.co/4rrYmr2" target="_blank" rel="noopener noreferrer" className="ks-cta-btn-app"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg><div style={{textAlign:"left"}}><div style={{fontSize:9,lineHeight:"1.3",fontFamily:"system-ui,sans-serif",opacity:.7}}>حمّل التطبيق</div><div style={{fontSize:17,fontWeight:700,lineHeight:"1.2",fontFamily:"system-ui,sans-serif"}}>آب ستور</div></div></a></div>
          </div></div>
        </>
      )}

      {/* ═══ SIGNUP POPUP (visitor) ═══ */}
      {showSignup && !user.authenticated && !isPremium && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
          <div style={{background:"#FFF",borderRadius:16,padding:"32px 24px",maxWidth:380,width:"100%",textAlign:"center" as const}}>
            <div style={{fontSize:20,fontWeight:800,color:"#371D12",marginBottom:8}}>سجّل حساب مجاني في منصة كتابة</div>
            <div style={{fontSize:14,color:"#818181",marginBottom:20,lineHeight:1.7}}>أدخل بريدك الإلكتروني للمتابعة</div>
            <input type="email" placeholder="بريدك@مثال.com" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)} style={{width:"100%",padding:"12px 14px",border:"1.5px solid #D9D9D9",borderRadius:10,fontSize:15,fontFamily:"inherit",direction:"ltr" as const,textAlign:"right" as const,marginBottom:12,boxSizing:"border-box" as const,outline:"none"}}/>
            <button disabled={signupLoading||!signupEmail.includes("@")} onClick={async()=>{setSignupLoading(true);try{localStorage.setItem("kb_user_email",signupEmail);await pushToHubSpot("",signupEmail,"")}catch(_){};setSignupLoading(false);setShowSignup(false)}} style={{width:"100%",padding:"12px",background:signupEmail.includes("@")?"#0000FF":"#D9D9D9",color:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:signupEmail.includes("@")?"pointer":"default",fontFamily:"inherit"}}>{signupLoading?"جاري التسجيل...":"متابعة"}</button>
          </div>
        </div>
      )}

      {/* ═══ UPGRADE POPUP (free signed-in user) ═══ */}
      {showUpgrade && user.authenticated && !isPremium && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
          <div style={{background:"#FFF",borderRadius:16,padding:"32px 24px",maxWidth:380,width:"100%",textAlign:"center" as const}}>
            <div style={{fontSize:20,fontWeight:800,color:"#371D12",marginBottom:8}}>اكتب بلا حدود</div>
            <div style={{fontSize:14,color:"#818181",marginBottom:20,lineHeight:1.7}}>اشترك في باقة الكاتب واستخدم جميع الأدوات بلا قيود</div>
            <a href="https://kitabh.com/pricing" style={{display:"block",padding:"12px",background:"#0000FF",color:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,textDecoration:"none",marginBottom:10}}>تعرّف على باقة الكاتب</a>
            <button onClick={()=>setShowUpgrade(false)} style={{background:"none",border:"none",fontSize:13,color:"#818181",cursor:"pointer",fontFamily:"inherit"}}>ليس الآن</button>
          </div>
        </div>
      )}

      {/* ═══ PAYWALL POPUP (5 uses exhausted) ═══ */}
      {showPaywall && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
          <div style={{background:"#FFF",borderRadius:16,padding:"32px 24px",maxWidth:400,width:"100%",textAlign:"center" as const}}>
            <div style={{fontSize:40,marginBottom:12}}>🔒</div>
            <div style={{fontSize:20,fontWeight:800,color:"#371D12",marginBottom:8}}>انتهت التجربة المجانية</div>
            <div style={{fontSize:14,color:"#818181",marginBottom:20,lineHeight:1.7}}>استخدمت {MAX_FREE} تحويلات مجانية. اشترك في باقة الكاتب للاستخدام بلا حدود.</div>
            <a href="https://kitabh.com/pricing" style={{display:"block",padding:"14px",background:"#0000FF",color:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,textDecoration:"none",marginBottom:10}}>تعرّف على باقة الكاتب</a>
            <a href="https://apps.apple.com/app/kitabh/id6478126579" target="_blank" rel="noopener" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px",background:"#000",color:"#FFF",borderRadius:10,fontSize:14,fontWeight:600,textDecoration:"none",marginBottom:10}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              حمّل تطبيق منصة كتابة
            </a>
            <button onClick={()=>setShowPaywall(false)} style={{background:"none",border:"none",fontSize:13,color:"#818181",cursor:"pointer",fontFamily:"inherit",marginTop:4}}>إغلاق</button>
          </div>
        </div>
      )}

    </div>
  )
}
