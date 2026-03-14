// ═══════════════════════════════════════════════════════
//  Kitabh Carousel v15 - Framer Code Component
//  Based on v14: +download PDF (all slides merged into one PDF)
// ═══════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from "react"

const GOOGLE_API_KEY = "AIzaSyA26Goc-rSZToGZRbn357jdG0ibcj3P9ZA"
const MODEL = "gemini-2.0-flash"

// ═══════════════════════════════════════════════════════
//  KITABH TOOLS — Shared trial system (LIFETIME uses)
//  Copy this block IDENTICALLY into every tool component.
//  Only change CURRENT_TOOL_ID below.
// ═══════════════════════════════════════════════════════
const CURRENT_TOOL_ID = "carousel"   // ← change per tool: "outline" | "checker" | "carousel"
const KTK_STORAGE = "kb_tools_usage"
const KTK_FREE_USES = 5              // lifetime uses per tool
const KTK_PRICING = "https://kitabh.com/pricing"
const KTK_APP = "https://apps.apple.com/app/kitabh/id6738030498"
const KTK_TOOLS = [
  { id:"outline",  name:"مخطط المقالة",   desc:"خطط وهيكل مقالتك بذكاء",  url:"/tools/outline",  step:"١" },
  { id:"checker",  name:"فاحص المقالة",   desc:"راجع جودة كتابتك",        url:"/tools/checker",  step:"٢" },
  { id:"carousel", name:"مولّد الكاروسيل", desc:"حوّل مقالتك لشرائح جاهزة", url:"/tools/carousel", step:"٣" },
]
const KTK_TOTAL = KTK_TOOLS.length * KTK_FREE_USES

function ktkGetData():Record<string,any>{
  try{const r=localStorage.getItem(KTK_STORAGE);if(r)return JSON.parse(r)}catch(_){}return{}
}
function ktkSave(d:Record<string,any>){
  try{localStorage.setItem(KTK_STORAGE,JSON.stringify(d))}catch(_){}
}
function canCheck():boolean{
  const d=ktkGetData();return(d[CURRENT_TOOL_ID]||0)<KTK_FREE_USES
}
function recordCheck(){
  const d=ktkGetData()
  d[CURRENT_TOOL_ID]=(d[CURRENT_TOOL_ID]||0)+1
  if(!d[CURRENT_TOOL_ID+"_first"])d[CURRENT_TOOL_ID+"_first"]=Date.now()
  d[CURRENT_TOOL_ID+"_last"]=Date.now()
  ktkSave(d)
}
function checksRemaining():number{
  return Math.max(0,KTK_FREE_USES-(ktkGetData()[CURRENT_TOOL_ID]||0))
}
function ktkToolRemaining(id:string):number{
  return Math.max(0,KTK_FREE_USES-(ktkGetData()[id]||0))
}
function ktkTotalUsed():number{
  const d=ktkGetData();return KTK_TOOLS.reduce((s,t)=>s+(d[t.id]||0),0)
}
function ktkTrialMessage():{h:string;sub:string}{
  const d=ktkGetData()
  const first=d[CURRENT_TOOL_ID+"_first"]||Date.now()
  const elapsed=Date.now()-first
  const hour=3600000, day=86400000, week=604800000
  if(elapsed<hour) return {
    h:"يبدو أنك أحببت استخدام ستوديو كتابة",
    sub:"انتهت محاولاتك في أقل من ساعة!\nربما حان وقت الترقية إلى باقة الكاتب لتأخذ الكتابة والنشر بجديّة"
  }
  if(elapsed<day) return {
    h:"يبدو أنك قضيت يومًا جميلًا في ستوديو كتابة",
    sub:"لقد انتهت محاولاتك اليوم.\nإن كنت ترغب في المزيد، جرّب باقة الكاتب."
  }
  return {
    h:"يبدو أنك أصبحت ضيفًا دائمًا في ستوديو كتابة هذا الأسبوع",
    sub:"انتهت محاولاتك المجانية.\nربما حان الوقت للترقية إلى باقة الكاتب."
  }
}
// ═══ End shared trial system ═══

type SlideLayout = "title"|"title-body"|"body"
type SlideSize = "post"|"story"|"youtube"

type CoverLayout = "img-top"|"img-bottom"|"img-full"|"title-top"|"minimal"

interface Slide {
  type: "cover"|"content"|"cta"
  layout: SlideLayout
  headline: string
  body: string
  category?: string
  author?: string
  showAuthor?: boolean
  fontScale?: number
  imageUrl?: string
  imagePos?: number
  coverLayout?: CoverLayout
}

const COVER_LAYOUTS:{id:CoverLayout;label:string}[] = [
  { id:"img-full",  label:"غلاف كامل" },
  { id:"img-top",   label:"صورة بالأعلى" },
  { id:"img-bottom",label:"صورة بالأسفل" },
  { id:"title-top", label:"عنوان فوق" },
  { id:"minimal",   label:"بسيط" },
]

const TEMPLATES = [
  { id:"kitabh",    label:"أزرق كتابة",  bg:"#0000FF", text:"#FFFFFF", accent:"#FFD700", sc:"#FFD700" },
  { id:"classic",   label:"كلاسيكي",    bg:"#F5F0EB", text:"#1A1A1A", accent:"#0000FF", sc:"#0000FF" },
  { id:"electric",  label:"كهربائي",     bg:"#4361EE", text:"#FFFFFF", accent:"#C8FF00", sc:"#C8FF00" },
  { id:"sunshine",  label:"مشمس",       bg:"#FFE135", text:"#1A1A1A", accent:"#FF6B35", sc:"#FF6B35" },
  { id:"coral",     label:"مرجاني",      bg:"#FF6B6B", text:"#FFFFFF", accent:"#FFE66D", sc:"#FFE66D" },
  { id:"neon",      label:"نيون",        bg:"#39FF14", text:"#0A0A0A", accent:"#1A1A2E", sc:"#0A0A0A" },
  { id:"sunset",    label:"غروب",       bg:"#FF6700", text:"#FFFFFF", accent:"#4A0E4E", sc:"#FFFFFF" },
  { id:"lavender",  label:"بنفسجي",      bg:"#7B2D8E", text:"#F4A261", accent:"#FFFFFF", sc:"#F4A261" },
  { id:"rose",      label:"وردي",       bg:"#FF1493", text:"#FFFFFF", accent:"#FFE0E0", sc:"#FFD700" },
  { id:"mint",      label:"نعناعي",      bg:"#B8E0D2", text:"#1B4332", accent:"#2D6A4F", sc:"#1B4332" },
  { id:"forest",    label:"غابة",       bg:"#2D6A4F", text:"#F0E6D3", accent:"#A7F3D0", sc:"#A7F3D0" },
  { id:"midnight",  label:"داكن",       bg:"#1A1A2E", text:"#EAEAEA", accent:"#4CC9F0", sc:"#4CC9F0" },
  { id:"darkcard", label:"بطاقة داكنة", bg:"#1A1A1A", text:"#FFFFFF", accent:"#E63946", sc:"#E63946" },
  { id:"boldyellow",label:"أصفر جريء", bg:"#FFD600", text:"#1A1A1A", accent:"#1A1A1A", sc:"#1A1A1A" },
  { id:"calmgray", label:"رمادي هادئ", bg:"#B8C4C8", text:"#2C2C2C", accent:"#D4A574", sc:"#2C2C2C" },
  { id:"notebook", label:"دفتر",      bg:"#FFFDF7", text:"#2C2C2C", accent:"#F5C518", sc:"#F5C518" },
  { id:"nature",   label:"أخضر طبيعي", bg:"#2D8B5E", text:"#FFFFFF", accent:"#C8E6C9", sc:"#C8E6C9" },
  { id:"beige",    label:"بيج أنيق",   bg:"#E8DDD3", text:"#3D2B1F", accent:"#8B6914", sc:"#8B6914" },
]

const TMPL_SHAPES: string[] = [
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

const FONTS = [
  { id:"alyamama",label:"Alyamama",             family:"'Alyamama'" },
  { id:"readex",  label:"Readex Pro",           family:"'Readex Pro'" },
  { id:"rubik",   label:"Rubik",                family:"'Rubik'" },
  { id:"ibm",     label:"IBM Plex Sans Arabic", family:"'IBM Plex Sans Arabic'" },
  { id:"amiri",   label:"Amiri",                family:"'Amiri'" },
  { id:"playpen", label:"Playpen Sans Arabic",  family:"'Playpen Sans Arabic'" },
]

const LAYOUTS:{id:SlideLayout;label:string}[] = [
  {id:"title",label:"عنوان"},
  {id:"title-body",label:"عنوان وفقرة"},
  {id:"body",label:"فقرة فقط"},
]

const SIZES:{id:SlideSize;label:string;w:number;h:number}[] = [
  {id:"post",label:"بوست ٣:٤",w:1080,h:1440},
  {id:"story",label:"ستوري ٩:١٦",w:1080,h:1920},
  {id:"youtube",label:"يوتيوب ١٦:٩",w:1920,h:1080},
]

const LOGO_SVG_INNER = `<g><path d="m63.34,29.83c0-6.33-3.69-12.15-9.5-14.63-2.41-1.03-5.07-1.6-7.86-1.6h-.74v21.9h18.11v-5.67Z"/><path d="m76.44,67.08c0,6.52,3.93,12.45,10,14.85,2.28.9,4.76,1.39,7.36,1.39h.75v-21.9h-18.1v5.66Z"/><path d="m88.69,13.59c-11.69,0-21.16,9.47-21.16,21.16v21.56c0,2.82-2.29,5.11-5.11,5.11h-17.2v21.9h5.86c11.68,0,21.15-9.47,21.16-21.15v-21.57c0-2.82,2.29-5.11,5.11-5.11h17.19V13.59h-5.85Z"/></g><g><path d="m160.32,76.39c11.17,0,15.38-8.76,18.89-22.21,1.35-5.17,6.44-24.69,6.44-24.69l-10.39,2.53s-3.91,14.97-4.6,17.57c-1.33,5.03-1.6,6.19-5.05,6.19h-4.16c-4.72,0-4.44-1.94-2.73-8.49.49-1.88,5.81-22.29,5.81-22.29l-10.4,2.29-7.64,29.15s-.33,1.39-.5,2.08c-2.52,10.04.66,17.86,11.96,17.86h2.37Zm-6.2-45.9s-22.98,7.08-25.98,8.65c-5.95,3.13-7.5,9.11-8.14,14.39-.17,1.45-.75,5.94-.94,7.52-1.08,8.99,3.39,12.64,9.87,12.64h.34c7.91,0,10.79-5.78,12.32-12.46.49-2.16,1.12-4.94,1.12-4.94l5.88.15,1.3-6.71h-19.27c0-3.42.94-6.76,7.93-8.73,3.61-1.01,14-3.66,14-3.66l1.55-6.86Z"/><path d="m204.33,53.62c-4.95,0-5.85-1.45-4.73-5.61.49-1.82,9.14-35.05,9.14-35.05l-10.64,3.42-5.57,21.39s-2.77,10.59-3.22,12.25c-3.56,12.92-5.42,25.56,9.15,25.56h3.57l5.92-21.96h-3.62Z"/><path d="m236.27,53.62c-8.1,0-10.21-1.49-8.1-9.53l3.24-12.43-10.39,2.53-3,11.51c-1.7,6.6-2.22,7.92-7.94,7.92h-3.85l-4.19,21.96h3.85c9.6,0,15.62-7.11,17.71-14.91.18-.68.44-1.61.44-1.61h2.96s-.12,2.06-.19,3.89c-.28,7.38,5.87,12.62,14.11,12.62h4.57l-1.85-21.96h-7.37Z"/><path d="m268.4,25c-7.21,0-13.27,1.15-15.92,3.54-2.47,2.22-1.74,4.25,2.25,4.25h88.43c14.96,0,18.92,7.19,16.22,16.61l-.3,1.03c-4.59,15.99-10.35,25.16-32.38,25.16h-81.83l-1.37-21.96h107.22c1.98,0,3.64-1.69,3.39-3.66-.29-2.25-2.3-4.7-9.63-4.7h-84.96c-14.15,0-15.72-5.67-13.73-12.61l.13-.45c2.39-8.34,16.24-21.87,40.98-21.87h5.21l-5.92,14.66h-17.81Z"/><polygon points="169.11 80.26 159.83 87.63 166.51 95 175.8 87.63 169.11 80.26"/><polygon points="151.22 8.38 141.94 15.75 148.62 23.12 157.91 15.75 151.22 8.38"/><polygon points="137.02 8.38 127.74 15.75 134.42 23.12 143.71 15.75 137.02 8.38"/><polygon points="223.74 8.99 214.45 16.36 221.14 23.73 230.42 16.36 223.74 8.99"/><polygon points="238.9 8.99 229.61 16.36 236.3 23.73 245.58 16.36 238.9 8.99"/></g>`

const SHAPE_LEVELS = [
  { id:0, label:"بدون",  size:0,    opacity:0 },
  { id:1, label:"خفيف",  size:0.45, opacity:0.06 },
  { id:2, label:"متوسط", size:0.65, opacity:0.2 },
  { id:3, label:"كثيف",  size:0.9,  opacity:0.55 },
]

const LOAD_STEPS:{icon:string;text:string}[] = [
  {icon:"book",   text:"نقرأ كل كلمة بعناية..."},
  {icon:"paper",  text:"نكتشف الفكرة والرسالة..."},
  {icon:"star",   text:"نبدأ ببناء التصميم..."},
  {icon:"message",text:"نوزّع المحتوى بالترتيب على الشرائح..."},
  {icon:"trophy", text:"نراجع كل شريحة بعناية..."},
  {icon:"check",  text:"نعدّ التصميم النهائي لك..."},
]
const STEP_ICO:Record<string,JSX.Element> = {
  book:(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#12B76A" strokeWidth="2" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill="#12B76A" fillOpacity=".18" stroke="#12B76A" strokeWidth="2"/><line x1="9" y1="8" x2="15" y2="8" stroke="#12B76A" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="12" x2="15" y2="12" stroke="#12B76A" strokeWidth="1.5" strokeLinecap="round"/></svg>),
  paper:(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#F2F2F2" stroke="#D9D9D9" strokeWidth="2"/><line x1="8" y1="8" x2="16" y2="8" stroke="#D9D9D9" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="#D9D9D9" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="16" x2="12" y2="16" stroke="#D9D9D9" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  star:(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="12,2 14.9,8.6 22,9.3 17,14.1 18.6,21 12,17.5 5.4,21 7,14.1 2,9.3 9.1,8.6" fill="#EC4899" stroke="#DB2777" strokeWidth="0.8"/></svg>),
  trophy:(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 3h8v8a4 4 0 01-8 0V3z" fill="#DFB300" stroke="#B8960A" strokeWidth="1.5"/><path d="M5 4H3v3a4 4 0 004 4M19 4h2v3a4 4 0 01-4 4" stroke="#B8960A" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="15" x2="12" y2="18" stroke="#B8960A" strokeWidth="1.5" strokeLinecap="round"/><rect x="8" y="18" width="8" height="2.5" rx="1" fill="#DFB300" stroke="#B8960A" strokeWidth="1"/></svg>),
  check:(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#12B76A" stroke="#0A9957" strokeWidth="1"/><polyline points="7,12 10,15 17,8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  message:(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h16a1 1 0 011 1v10a1 1 0 01-1 1H7l-4 3.5V5a1 1 0 011-1z" fill="#FBD84B" stroke="#DFB300" strokeWidth="1.5"/><line x1="8" y1="9.5" x2="16" y2="9.5" stroke="#B8960A" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="13" x2="13" y2="13" stroke="#B8960A" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  time:(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="2.5" rx="1" fill="#DFB300"/><rect x="7" y="19.5" width="10" height="2.5" rx="1" fill="#DFB300"/><path d="M8 4.5c0 3.5 4 5.5 4 7.5s-4 4-4 7.5M16 4.5c0 3.5-4 5.5-4 7.5s4 4 4 7.5" fill="#FDE68A" stroke="#DFB300" strokeWidth="1.2" strokeLinejoin="round"/></svg>),
}

function wrapText(ctx:CanvasRenderingContext2D, text:string, maxW:number):string[] {
  if (!text) return []
  const words = text.split(/\s+/)
  const lines:string[] = []
  let cur = ""
  for (const w of words) {
    const t = cur ? cur+" "+w : w
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w }
    else cur = t
  }
  if (cur) lines.push(cur)
  return lines
}

function loadSvgImage(svgContent:string):Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgContent], {type:'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("SVG load failed")) }
    img.src = url
  })
}

function loadLogoImage(fillColor:string):Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" fill="${fillColor}">${LOGO_SVG_INNER}</svg>`
    const blob = new Blob([svg], {type:'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Logo load failed")) }
    img.src = url
  })
}

function loadImage(src:string):Promise<HTMLImageElement|ImageBitmap>{
  if(src.startsWith("data:")){
    return fetch(src).then(r=>r.blob()).then(b=>createImageBitmap(b))
  }
  return new Promise((resolve,reject)=>{
    const img=new Image()
    img.crossOrigin="anonymous"
    img.onload=()=>resolve(img)
    img.onerror=()=>reject(new Error("Image load failed"))
    img.src=src
  })
}

function drawImageCover(ctx:CanvasRenderingContext2D,img:HTMLImageElement|ImageBitmap,x:number,y:number,w:number,h:number,posY:number=50){
  const iAr=img.width/img.height,tAr=w/h
  let sx=0,sy=0,sw=img.width,sh=img.height
  if(iAr>tAr){sw=img.height*tAr;sx=(img.width-sw)/2}
  else{sh=img.width/tAr;sy=(img.height-sh)*(posY/100)}
  ctx.drawImage(img as any,sx,sy,sw,sh,x,y,w,h)
}

function drawRoundedImage(ctx:CanvasRenderingContext2D,img:HTMLImageElement|ImageBitmap,x:number,y:number,w:number,h:number,r:number,posY:number=50){
  ctx.save(); ctx.beginPath()
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r)
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r)
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r)
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.clip()
  drawImageCover(ctx,img,x,y,w,h,posY)
  ctx.restore()
}

function buildPrompt(text:string, author:string):string {
  return `أنت مصمم محتوى متخصص في تحويل المقالات العربية إلى شرائح كاروسيل.

مهمتك: حوّل المقالة التالية إلى شرائح كاروسيل. حدد العدد المناسب من شرائح المحتوى بناءً على طول المقالة وعدد الأفكار الرئيسية (بين 3 و 8 شرائح محتوى).

البنية:
- الشريحة الأولى (cover): غلاف — استخدم عنوان المقالة الأصلي كما هو بدون تغيير
- شرائح المحتوى (content): كل شريحة تتناول فكرة رئيسية واحدة
- الشريحة الأخيرة (cta): دعوة لاتخاذ إجراء

قواعد حاسمة:
1. انسخ النص الأصلي كما هو قدر الإمكان — لا تُعد صياغة الجمل، فقط نظّمها وقسّمها على الشرائح
2. عنوان الغلاف = عنوان المقالة الأصلي بالضبط (لا تختصره ولا تغيّره)
3. عناوين شرائح المحتوى: اقتبسها مباشرة من النص (عبارة قوية أو جملة مفتاحية من الفقرة)
4. فقرات شرائح المحتوى: انسخ الجمل الأصلية كما هي — فقط احذف الحشو والتكرار
5. لا تُعد كتابة أو تلخيص — المطلوب تنظيم وتقسيم فقط
6. شريحة الدعوة: عنوان تحفيزي قصير، body = "${author||"كتابة"}"
7. لا تستخدم إيموجي أبدًا
8. استخرج اسم الكاتب/المدوّن من المقالة (ابحث عن: كتبه، بقلم، الكاتب، المؤلف، التوقيع، أو أي اسم شخص مذكور كمؤلف). إذا لم تجد اسمًا، استخدم "${author||""}"
9. ضع اسم الكاتب المُستخرج في حقل "detectedAuthor" في الإجابة

أجب بصيغة JSON فقط بدون أي نص قبله أو بعده:
{
  "detectedAuthor": "اسم الكاتب المستخرج أو فارغ",
  "slides": [
    {"type":"cover","layout":"title","headline":"عنوان المقالة الأصلي","body":"","category":"التصنيف"},
    {"type":"content","layout":"title-body","headline":"جملة مفتاحية من النص","body":"فقرة منسوخة من المقالة..."},
    {"type":"cta","layout":"title","headline":"تابعني للمزيد","body":"${author||"كتابة"}"}
  ]
}

المقالة:
${text}`
}

// ═══════════════════════════════════════════════════════
export default function KitabhCarousel(props: { premium?: boolean }) {
  const isPremium = !!props.premium
  const [fontsReady, setFontsReady] = useState(false)
  useEffect(()=>{document.fonts.ready.then(()=>setFontsReady(true))},[])
  const [page, setPage] = useState<"input"|"loading"|"results">("input")
  const [showPaywall, setShowPaywall] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [signInEmail, setSignInEmail] = useState("")
  const [userEmail, setUserEmail] = useState<string|null>(()=>{try{return localStorage.getItem("kb_user_email")}catch(_){return null}})
  const [text, setText] = useState("")
  const [initIdx] = useState(()=>Math.floor(Math.random()*TEMPLATES.length))
  const [templateIdx, setTemplateIdx] = useState(initIdx)
  const [bgColor, setBgColor] = useState(TEMPLATES[initIdx].bg)
  const [textColor, setTextColor] = useState(TEMPLATES[initIdx].text)
  const [accentColor, setAccentColor] = useState(TEMPLATES[initIdx].accent)
  const [fontIdx, setFontIdx] = useState(0)
  const [slideSize, setSlideSize] = useState<SlideSize>("post")
  const [authorName, setAuthorName] = useState("")
  const [slides, setSlides] = useState<Slide[]>([])
  const [editingSlide, setEditingSlide] = useState<number|null>(null)
  const [showLogo, setShowLogo] = useState(true)
  const [shapeIntensity, setShapeIntensity] = useState(2)
  const [showTools, setShowTools] = useState(false)
  const [loadStep, setLoadStep] = useState(0)
  const [error, setError] = useState("")
  const [audioFile, setAudioFile] = useState<File|null>(null)
  const [audioUrl, setAudioUrl] = useState("")
  const [slideDuration, setSlideDuration] = useState(4)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState("")
  const audioInputRef = useRef<HTMLInputElement>(null)
  const loadTimerRef = useRef<any>(null)
  const tmplScrollRef = useRef<HTMLDivElement>(null)
  const [shapeColor, setShapeColor] = useState(TEMPLATES[initIdx].sc)
  const scrollTmpls = (dir:number) => { tmplScrollRef.current?.scrollBy({left:dir*120,behavior:"smooth"}) }

  const selectedFont = FONTS[fontIdx]
  const fontFamily = `${selectedFont.family}, 'Noto Sans Arabic', sans-serif`
  const activeTemplate = TEMPLATES.findIndex(
    t => t.bg.toLowerCase() === bgColor.toLowerCase() && t.text.toLowerCase() === textColor.toLowerCase()
  )
  const sizeInfo = SIZES.find(s => s.id === slideSize)!
  const ar = slideSize === "post" ? "3/4" : slideSize === "story" ? "9/16" : "16/9"

  const selectTemplate = useCallback((idx: number) => {
    setTemplateIdx(idx)
    setBgColor(TEMPLATES[idx].bg)
    setTextColor(TEMPLATES[idx].text)
    setAccentColor(TEMPLATES[idx].accent)
    setShapeColor(TEMPLATES[idx].sc)
  }, [])

  const generate = useCallback(async () => {
    const wc = text.trim().split(/\s+/).length
    if (wc < 3) { setError("اكتب نصًا أطول قليلًا"); return }
    if (!isPremium && !canCheck()) { setShowPaywall(true); return }
    setError(""); setPage("loading"); setLoadStep(0)
    if (!userEmail) setShowSignIn(true)
    requestAnimationFrame(() => document.querySelector(".kc")?.scrollIntoView({behavior:"smooth",block:"start"}))
    const stepMs = 1500
    loadTimerRef.current = setInterval(() => setLoadStep(s => Math.min(s+1, LOAD_STEPS.length-1)), stepMs)
    const loadStart = Date.now()
    const minLoadTime = LOAD_STEPS.length * stepMs + 500
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
        { method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            contents:[{parts:[{text:buildPrompt(text,authorName)}]}],
            generationConfig:{temperature:0.7,maxOutputTokens:4096},
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message||"خطأ في الاتصال")
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text||""
      const json = raw.replace(/```json\s*/g,"").replace(/```/g,"").trim()
      const parsed = JSON.parse(json)
      if (!parsed.slides||!Array.isArray(parsed.slides)) throw new Error("تنسيق غير صحيح")
      const detected = parsed.detectedAuthor || ""
      const finalAuthor = authorName || detected
      if (!authorName && detected) setAuthorName(detected)
      const wait = minLoadTime - (Date.now() - loadStart)
      if (wait > 0) await new Promise(r=>setTimeout(r,wait))
      if(loadTimerRef.current) clearInterval(loadTimerRef.current)
      setSlides(parsed.slides.map((s:any)=>({...s, author:finalAuthor, showAuthor:!!finalAuthor, fontScale:1}))); if(!isPremium)recordCheck(); setPage("results")
    } catch(e:any) { if(loadTimerRef.current) clearInterval(loadTimerRef.current); setError(e.message||"حدث خطأ غير متوقع"); setPage("input") }
  }, [text, authorName])

  const updateSlide = (i:number, u:Partial<Slide>) => setSlides(p => p.map((s,idx) => idx===i ? {...s,...u} : s))

  const downloadSlide = useCallback(async (slide:Slide, idx:number) => {
    await document.fonts.ready
    const c = document.createElement("canvas"), ctx = c.getContext("2d")
    if (!ctx) return
    const W = sizeInfo.w, H = sizeInfo.h
    const DPR = 2
    c.width = W * DPR; c.height = H * DPR
    ctx.scale(DPR, DPR)
    const ff = fontFamily

    // ── Scale factor: canvas px / preview card reference width ──
    // The HTML preview card is ~270px wide with 24px padding.
    // All font sizes and spacing are multiplied by S to match exactly.
    const S = W / 270
    const PAD = Math.round(24 * S)      // matches CSS .kc-card-pv padding:24px
    const textW = W - PAD * 2           // available text width
    const fs = slide.fontScale ?? 1

    ctx.fillStyle = bgColor; ctx.fillRect(0,0,W,H)

    // Background geometric shape
    if (shapeIntensity > 0) {
      try {
        const lvl = SHAPE_LEVELS[shapeIntensity]
        const shapeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${shapeColor}" opacity="${lvl.opacity}">${TMPL_SHAPES[templateIdx]}</svg>`
        const shapeImg = await loadSvgImage(shapeSvg)
        const shapeW = W * lvl.size, shapeH = shapeW
        ctx.drawImage(shapeImg, W * 0.5 - shapeW * 0.15, H - shapeH * 0.85, shapeW, shapeH)
      } catch(_){}
    }

    // Logo bottom-right — proportional to preview (.kc-card-logo width:70px, bottom:14px, right:14px)
    if (showLogo) {
      try {
        const logoImg = await loadLogoImage(textColor)
        const logoW = Math.round(70 * S), logoH = Math.round(logoW * 0.25)
        ctx.drawImage(logoImg, W - logoW - Math.round(14*S), H - logoH - Math.round(14*S), logoW, logoH)
      } catch(_){}
    }

    ctx.fillStyle=textColor; ctx.textBaseline="top"; ctx.direction="rtl"

    // Author name — top center (matches CSS: .kc-card-author top:12px, font-size:10px*fs)
    if (slide.showAuthor && slide.author && !slide.imageUrl) {
      const aSz=Math.round(10*S*fs)
      ctx.font=`500 ${aSz}px ${ff}`; ctx.textAlign="center"
      ctx.fillStyle=textColor+"99"
      ctx.fillText(slide.author, W/2, Math.round(12*S))
      ctx.fillStyle=textColor; ctx.textBaseline="top"; ctx.direction="rtl"
    }

    const vCenter = H / 2

    if (slide.imageUrl) {
      try {
        const cimg=await loadImage(slide.imageUrl)
        const cl=slide.coverLayout||"img-top"
        const pos=slide.imagePos??50
        // Cover title: CSS uses 16*fs px, author: 10*fs px
        const sz=Math.round(16*S*fs),lh=Math.round(16*S*fs*1.35)
        const aSz=Math.round(10*S*fs)
        const drawTitle=(x:number,y:number,maxW:number,align:"right"|"center")=>{
          ctx.fillStyle=textColor;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign=align
          const lines=wrapText(ctx,slide.headline,maxW)
          lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lh))
          let endY=y+lines.length*lh
          if(slide.body){
            const bSz=Math.round(12*S*fs),bLh=Math.round(12*S*fs*1.5)
            ctx.font=`400 ${bSz}px ${ff}`;ctx.fillStyle=textColor+"CC"
            const bLines=wrapText(ctx,slide.body,maxW)
            endY+=Math.round(2*S);bLines.forEach((l,i)=>ctx.fillText(l,x,endY+i*bLh))
            endY+=bLines.length*bLh
          }
          return endY
        }
        const drawAuthor=(x:number,y:number,align:"right"|"center")=>{
          if(!slide.showAuthor||!slide.author)return
          ctx.font=`500 ${aSz}px ${ff}`;ctx.fillStyle=textColor+"88";ctx.textAlign=align
          ctx.fillText(slide.author,x,y)
        }
        // CSS: .cl-img-top .kc-cv-img flex:0 0 50%, .kc-cv-text padding:10px 16px centered
        if(cl==="img-top"){
          const ih=H*0.5;drawRoundedImage(ctx,cimg,0,0,W,ih,0,pos)
          const textPad=Math.round(16*S)
          // Center title block vertically in remaining half
          ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="right"
          const lines=wrapText(ctx,slide.headline,W-textPad*2)
          const blockH=lines.length*lh+(slide.showAuthor&&slide.author?aSz+Math.round(4*S):0)
          const tY=ih+Math.max(textPad,(H-ih-blockH)/2)
          const endY=drawTitle(W-textPad,tY,W-textPad*2,"right")
          drawAuthor(W-textPad,endY+Math.round(4*S),"right")
        } else if(cl==="img-bottom"){
          // CSS: text top half centered, image bottom 50%
          const textPad=Math.round(16*S)
          ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="right"
          const lines=wrapText(ctx,slide.headline,W-textPad*2)
          const blockH=lines.length*lh+(slide.showAuthor&&slide.author?aSz+Math.round(4*S):0)
          const tY=Math.max(textPad,(H*0.5-blockH)/2)
          const endY=drawTitle(W-textPad,tY,W-textPad*2,"right")
          drawAuthor(W-textPad,endY+Math.round(4*S),"right")
          drawRoundedImage(ctx,cimg,0,H*0.5,W,H*0.5,0,pos)
        } else if(cl==="img-full"){
          drawRoundedImage(ctx,cimg,0,0,W,H,0,pos)
          const grd=ctx.createLinearGradient(0,H*0.35,0,H)
          grd.addColorStop(0,"rgba(0,0,0,0)");grd.addColorStop(0.5,"rgba(0,0,0,.4)");grd.addColorStop(1,"rgba(0,0,0,.8)")
          ctx.fillStyle=grd;ctx.fillRect(0,0,W,H)
          const textPad=Math.round(16*S)
          ctx.fillStyle="#FFFFFF";ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="right"
          const lines=wrapText(ctx,slide.headline,W-textPad*2)
          const tY=H-lines.length*lh-Math.round(36*S)
          lines.forEach((l,i)=>ctx.fillText(l,W-textPad,tY+i*lh))
          if(slide.showAuthor&&slide.author){ctx.font=`500 ${aSz}px ${ff}`;ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillText(slide.author,W-textPad,tY+lines.length*lh+Math.round(4*S))}
        } else if(cl==="title-top"){
          // CSS: text top centered, image fills rest
          const textPad=Math.round(14*S)
          ctx.fillStyle=textColor;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="center"
          const lines=wrapText(ctx,slide.headline,W-textPad*2)
          const tY=textPad
          lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*lh))
          let endY=tY+lines.length*lh
          if(slide.showAuthor&&slide.author){ctx.font=`500 ${aSz}px ${ff}`;ctx.fillStyle=textColor+"88";ctx.textAlign="center";ctx.fillText(slide.author,W/2,endY+Math.round(2*S));endY+=aSz+Math.round(4*S)}
          const imgTop=endY+Math.round(8*S);drawRoundedImage(ctx,cimg,0,imgTop,W,H-imgTop,0,pos)
        } else if(cl==="minimal"){
          // CSS: centered image 50% width (square), title below
          const imgS=W*0.5,imgX=(W-imgS)/2,imgY=Math.round(10*S)
          const imgR=Math.round(10*S)
          drawRoundedImage(ctx,cimg,imgX,imgY,imgS,imgS,imgR,pos)
          ctx.fillStyle=textColor;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="center"
          const lines=wrapText(ctx,slide.headline,W-Math.round(20*S))
          const tY=imgY+imgS+Math.round(8*S)
          lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*lh))
          if(slide.showAuthor&&slide.author){ctx.font=`500 ${aSz}px ${ff}`;ctx.fillStyle=textColor+"88";ctx.textAlign="center";ctx.fillText(slide.author,W/2,tY+lines.length*lh+Math.round(4*S))}
        }
      } catch(_) {
        // Fallback: centered title (matches layout-title)
        const sz=Math.round(20*S*fs),lh=Math.round(20*S*fs*1.5)
        ctx.font=`700 ${sz}px ${ff}`; ctx.textAlign="center"
        const lines=wrapText(ctx,slide.headline,textW)
        const sy=vCenter-(lines.length*lh)/2
        lines.forEach((l,i)=>ctx.fillText(l,W/2,sy+i*lh))
      }
    } else if (slide.layout==="title") {
      // CSS: .layout-title .kc-card-h font-size:20px*fs, line-height:1.5, centered
      const sz=Math.round(20*S*fs), lh=Math.round(20*S*fs*1.5)
      ctx.font=`700 ${sz}px ${ff}`; ctx.textAlign="center"
      const lines=wrapText(ctx,slide.headline,textW)
      const sy=vCenter - (lines.length*lh)/2
      lines.forEach((l,i)=>ctx.fillText(l,W/2,sy+i*lh))
    } else if (slide.layout==="title-body") {
      // CSS: .layout-title-body .kc-card-h 17px*fs lh1.5, .kc-card-b 13px*fs lh1.7, centered via flexbox
      const hSz=Math.round(17*S*fs), hLh=Math.round(17*S*fs*1.5)
      const bSz=Math.round(13*S*fs), bLh=Math.round(13*S*fs*1.7)
      const gap=Math.round(10*S) // CSS gap:10px
      // Pre-compute total block height to center vertically
      ctx.font=`700 ${hSz}px ${ff}`
      const hl=wrapText(ctx,slide.headline,textW)
      ctx.font=`400 ${bSz}px ${ff}`
      const bl=wrapText(ctx,slide.body||"",textW)
      const divH=Math.round(1*S)+gap*2 // divider line + gaps
      const totalH=hl.length*hLh+divH+bl.length*bLh
      let y=Math.max(PAD, vCenter-totalH/2)
      ctx.fillStyle=textColor;ctx.font=`700 ${hSz}px ${ff}`; ctx.textAlign="right"
      hl.forEach((l,i)=>ctx.fillText(l,W-PAD,y+i*hLh))
      y+=hl.length*hLh+gap
      ctx.strokeStyle=accentColor+"44"; ctx.lineWidth=Math.max(1,Math.round(1*S))
      ctx.beginPath(); ctx.moveTo(PAD,y); ctx.lineTo(W-PAD,y); ctx.stroke()
      y+=gap; ctx.font=`400 ${bSz}px ${ff}`; ctx.fillStyle=textColor+"CC"
      bl.forEach((l,i)=>ctx.fillText(l,W-PAD,y+i*bLh))
    } else {
      // body only: CSS .layout-body .body-only 15px*fs lh1.7, centered
      const sz=Math.round(15*S*fs), lh=Math.round(15*S*fs*1.7)
      ctx.font=`400 ${sz}px ${ff}`; ctx.textAlign="right"
      ctx.fillStyle=textColor+"DD"
      const lines=wrapText(ctx,slide.body||slide.headline,textW)
      const sy=vCenter - (lines.length*lh)/2
      lines.forEach((l,i)=>ctx.fillText(l,W-PAD,sy+i*lh))
    }

    // iOS Safari doesn't support <a download>.click(), so use blob + open in new tab
    c.toBlob((blob)=>{
      if(!blob)return
      const url=URL.createObjectURL(blob)
      const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)
      if(isIOS){
        window.open(url,"_blank")
      } else {
        const a=document.createElement("a")
        a.download=`kitabh-slide-${idx+1}.png`; a.href=url; a.click()
        setTimeout(()=>URL.revokeObjectURL(url),5000)
      }
    },"image/png")
  }, [bgColor, textColor, accentColor, shapeColor, fontFamily, sizeInfo, slideSize, showLogo, shapeIntensity, templateIdx])

  const downloadAll = useCallback(() => {
    slides.forEach((s,i) => setTimeout(()=>downloadSlide(s,i), i*400))
  }, [slides, downloadSlide])

  const reset = () => { setPage("input"); setSlides([]); setEditingSlide(null); setError("") }

  const addSlide = () => {
    const lastIdx = slides.length - 1
    const newSlide:Slide = {type:"content",layout:"title-body",headline:"عنوان جديد",body:"",author:slides[0]?.author||"",showAuthor:slides[0]?.showAuthor||false,fontScale:1}
    setSlides(p => lastIdx > 0 ? [...p.slice(0,lastIdx), newSlide, p[lastIdx]] : [...p, newSlide])
    setTimeout(()=>setEditingSlide(lastIdx), 100)
  }

  // Audio file handling
  const handleAudioUpload = (e:React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioFile(f)
    setAudioUrl(URL.createObjectURL(f))
  }
  const removeAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioFile(null); setAudioUrl("")
    if (audioInputRef.current) audioInputRef.current.value=""
  }

  // Draw a single slide onto a canvas context (shared between PNG download and video export)
  const drawSlideOnCtx = async (ctx:CanvasRenderingContext2D, slide:Slide, W:number, H:number, ff:string) => {
    const S=W/270, PAD=Math.round(24*S), textW=W-PAD*2
    const fs=slide.fontScale??1
    ctx.fillStyle=bgColor; ctx.fillRect(0,0,W,H)
    if (shapeIntensity>0) {
      try {
        const lvl=SHAPE_LEVELS[shapeIntensity]
        const shapeSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${shapeColor}" opacity="${lvl.opacity}">${TMPL_SHAPES[templateIdx]}</svg>`
        const shapeImg=await loadSvgImage(shapeSvg)
        const shapeW=W*lvl.size, shapeH=shapeW
        ctx.drawImage(shapeImg,W*0.5-shapeW*0.15,H-shapeH*0.85,shapeW,shapeH)
      } catch(_){}
    }
    if (showLogo) {
      try {
        const logoImg=await loadLogoImage(textColor)
        const logoW=Math.round(70*S),logoH=Math.round(logoW*0.25)
        ctx.drawImage(logoImg,W-logoW-Math.round(14*S),H-logoH-Math.round(14*S),logoW,logoH)
      } catch(_){}
    }
    ctx.fillStyle=textColor; ctx.textBaseline="top"; ctx.direction="rtl"
    if (slide.showAuthor&&slide.author&&!slide.imageUrl) {
      const aSz=Math.round(10*S*fs)
      ctx.font=`500 ${aSz}px ${ff}`; ctx.textAlign="center"
      ctx.fillStyle=textColor+"99"; ctx.fillText(slide.author,W/2,Math.round(12*S))
      ctx.fillStyle=textColor; ctx.textBaseline="top"; ctx.direction="rtl"
    }
    const vCenter=H/2
    if (slide.imageUrl) {
      try {
        const cimg=await loadImage(slide.imageUrl)
        const cl=slide.coverLayout||"img-top"
        const pos=slide.imagePos??50
        const sz=Math.round(16*S*fs),lh=Math.round(16*S*fs*1.35)
        const aSz=Math.round(10*S*fs)
        const textPad=Math.round(16*S)
        const drawT=(x:number,y:number,maxW:number,align:"right"|"center")=>{
          ctx.fillStyle=textColor;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign=align
          const lines=wrapText(ctx,slide.headline,maxW)
          lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lh))
          let endY=y+lines.length*lh
          if(slide.body){const bSz=Math.round(12*S*fs),bLh=Math.round(12*S*fs*1.5);ctx.font=`400 ${bSz}px ${ff}`;ctx.fillStyle=textColor+"CC";const bLines=wrapText(ctx,slide.body,maxW);endY+=Math.round(2*S);bLines.forEach((l,i)=>ctx.fillText(l,x,endY+i*bLh));endY+=bLines.length*bLh}
          return endY
        }
        const drawA=(x:number,y:number,align:"right"|"center")=>{
          if(!slide.showAuthor||!slide.author)return
          ctx.font=`500 ${aSz}px ${ff}`;ctx.fillStyle=textColor+"88";ctx.textAlign=align
          ctx.fillText(slide.author,x,y)
        }
        if(cl==="img-top"){
          const ih=H*0.5;drawRoundedImage(ctx,cimg,0,0,W,ih,0,pos)
          ctx.font=`700 ${sz}px ${ff}`;const lines=wrapText(ctx,slide.headline,W-textPad*2)
          const blockH=lines.length*lh+(slide.showAuthor&&slide.author?aSz+Math.round(4*S):0)
          const tY=ih+Math.max(textPad,(H-ih-blockH)/2)
          const endY=drawT(W-textPad,tY,W-textPad*2,"right");drawA(W-textPad,endY+Math.round(4*S),"right")
        } else if(cl==="img-bottom"){
          ctx.font=`700 ${sz}px ${ff}`;const lines=wrapText(ctx,slide.headline,W-textPad*2)
          const blockH=lines.length*lh+(slide.showAuthor&&slide.author?aSz+Math.round(4*S):0)
          const tY=Math.max(textPad,(H*0.5-blockH)/2)
          const endY=drawT(W-textPad,tY,W-textPad*2,"right");drawA(W-textPad,endY+Math.round(4*S),"right")
          drawRoundedImage(ctx,cimg,0,H*0.5,W,H*0.5,0,pos)
        } else if(cl==="img-full"){
          drawRoundedImage(ctx,cimg,0,0,W,H,0,pos)
          const grd=ctx.createLinearGradient(0,H*0.35,0,H)
          grd.addColorStop(0,"rgba(0,0,0,0)");grd.addColorStop(0.5,"rgba(0,0,0,.4)");grd.addColorStop(1,"rgba(0,0,0,.8)")
          ctx.fillStyle=grd;ctx.fillRect(0,0,W,H)
          ctx.fillStyle="#FFFFFF";ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="right"
          const lines=wrapText(ctx,slide.headline,W-textPad*2)
          const tY=H-lines.length*lh-Math.round(36*S)
          lines.forEach((l,i)=>ctx.fillText(l,W-textPad,tY+i*lh))
          if(slide.showAuthor&&slide.author){ctx.font=`500 ${aSz}px ${ff}`;ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillText(slide.author,W-textPad,tY+lines.length*lh+Math.round(4*S))}
        } else if(cl==="title-top"){
          const tPad=Math.round(14*S)
          ctx.fillStyle=textColor;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="center"
          const lines=wrapText(ctx,slide.headline,W-tPad*2)
          let tY=tPad;lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*lh))
          let endY=tY+lines.length*lh
          if(slide.showAuthor&&slide.author){ctx.font=`500 ${aSz}px ${ff}`;ctx.fillStyle=textColor+"88";ctx.textAlign="center";ctx.fillText(slide.author,W/2,endY+Math.round(2*S));endY+=aSz+Math.round(4*S)}
          const imgTop=endY+Math.round(8*S);drawRoundedImage(ctx,cimg,0,imgTop,W,H-imgTop,0,pos)
        } else if(cl==="minimal"){
          const imgS=W*0.5,imgX=(W-imgS)/2,imgY=Math.round(10*S),imgR=Math.round(10*S)
          drawRoundedImage(ctx,cimg,imgX,imgY,imgS,imgS,imgR,pos)
          ctx.fillStyle=textColor;ctx.font=`700 ${sz}px ${ff}`;ctx.textAlign="center"
          const lines=wrapText(ctx,slide.headline,W-Math.round(20*S))
          const tY=imgY+imgS+Math.round(8*S)
          lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*lh))
          if(slide.showAuthor&&slide.author){ctx.font=`500 ${aSz}px ${ff}`;ctx.fillStyle=textColor+"88";ctx.textAlign="center";ctx.fillText(slide.author,W/2,tY+lines.length*lh+Math.round(4*S))}
        }
      } catch(_) {
        const sz=Math.round(20*S*fs),lh=Math.round(20*S*fs*1.5)
        ctx.font=`700 ${sz}px ${ff}`; ctx.textAlign="center"
        const lines=wrapText(ctx,slide.headline,textW)
        const sy=vCenter-(lines.length*lh)/2
        lines.forEach((l,i)=>ctx.fillText(l,W/2,sy+i*lh))
      }
    } else if (slide.layout==="title") {
      const sz=Math.round(20*S*fs),lh=Math.round(20*S*fs*1.5)
      ctx.font=`700 ${sz}px ${ff}`; ctx.textAlign="center"
      const lines=wrapText(ctx,slide.headline,textW)
      const sy=vCenter-(lines.length*lh)/2
      lines.forEach((l,i)=>ctx.fillText(l,W/2,sy+i*lh))
    } else if (slide.layout==="title-body") {
      const hSz=Math.round(17*S*fs),hLh=Math.round(17*S*fs*1.5)
      const bSz=Math.round(13*S*fs),bLh=Math.round(13*S*fs*1.7)
      const gap=Math.round(10*S)
      ctx.font=`700 ${hSz}px ${ff}`;const hl=wrapText(ctx,slide.headline,textW)
      ctx.font=`400 ${bSz}px ${ff}`;const bl=wrapText(ctx,slide.body||"",textW)
      const divH=Math.round(1*S)+gap*2;const totalH=hl.length*hLh+divH+bl.length*bLh
      let y=Math.max(PAD,vCenter-totalH/2)
      ctx.fillStyle=textColor;ctx.font=`700 ${hSz}px ${ff}`;ctx.textAlign="right"
      hl.forEach((l,i)=>ctx.fillText(l,W-PAD,y+i*hLh));y+=hl.length*hLh+gap
      ctx.strokeStyle=accentColor+"44";ctx.lineWidth=Math.max(1,Math.round(1*S))
      ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(W-PAD,y);ctx.stroke()
      y+=gap;ctx.font=`400 ${bSz}px ${ff}`;ctx.fillStyle=textColor+"CC"
      bl.forEach((l,i)=>ctx.fillText(l,W-PAD,y+i*bLh))
    } else {
      const sz=Math.round(15*S*fs),lh=Math.round(15*S*fs*1.7)
      ctx.font=`400 ${sz}px ${ff}`; ctx.textAlign="right"
      ctx.fillStyle=textColor+"DD"
      const lines=wrapText(ctx,slide.body||slide.headline,textW)
      const sy=vCenter-(lines.length*lh)/2
      lines.forEach((l,i)=>ctx.fillText(l,W-PAD,sy+i*lh))
    }
  }

  const downloadPDF = useCallback(async () => {
    if (!slides.length) return
    await document.fonts.ready
    const W = sizeInfo.w, H = sizeInfo.h, DPR = 2
    const ff = fontFamily

    // Render all slides to JPEG blobs
    const jpegImages: {data: Uint8Array; w: number; h: number}[] = []
    for (const slide of slides) {
      const c = document.createElement("canvas"), ctx = c.getContext("2d")
      if (!ctx) continue
      c.width = W * DPR; c.height = H * DPR
      ctx.scale(DPR, DPR)
      await drawSlideOnCtx(ctx, slide, W, H, ff)
      const blob = await new Promise<Blob|null>(r => c.toBlob(r, "image/jpeg", 0.92))
      if (!blob) continue
      const buf = await blob.arrayBuffer()
      jpegImages.push({ data: new Uint8Array(buf), w: W * DPR, h: H * DPR })
    }
    if (!jpegImages.length) return

    // ── Build PDF from scratch (no external deps) ──
    const te = new TextEncoder()
    const chunks: Uint8Array[] = []
    let pos = 0
    const objOffsets: number[] = []
    const writeStr = (s: string) => { const b = te.encode(s); chunks.push(b); pos += b.length }
    const writeRaw = (b: Uint8Array) => { chunks.push(b); pos += b.length }
    const markObj = () => { objOffsets.push(pos) }

    // Header
    writeStr("%PDF-1.4\n")
    writeRaw(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]))

    const n = jpegImages.length

    // Obj 1: Catalog
    markObj()
    writeStr("1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n")

    // Obj 2: Pages
    markObj()
    const kids = jpegImages.map((_, i) => `${3 + i * 3} 0 R`).join(" ")
    writeStr(`2 0 obj\n<</Type/Pages/Kids[${kids}]/Count ${n}>>\nendobj\n`)

    // For each page: Page obj, Image XObject, Content stream
    for (let i = 0; i < n; i++) {
      const img = jpegImages[i]
      const po = 3 + i * 3, io = 4 + i * 3, co = 5 + i * 3
      const content = `q ${W} 0 0 ${H} 0 0 cm /I Do Q`
      const cb = te.encode(content)

      // Page object
      markObj()
      writeStr(`${po} 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${W} ${H}]/Contents ${co} 0 R/Resources<</XObject<</I ${io} 0 R>>>>>>\nendobj\n`)

      // Image XObject (JPEG stream)
      markObj()
      writeStr(`${io} 0 obj\n<</Type/XObject/Subtype/Image/Width ${img.w}/Height ${img.h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${img.data.length}>>\nstream\n`)
      writeRaw(img.data)
      writeStr("\nendstream\nendobj\n")

      // Content stream
      markObj()
      writeStr(`${co} 0 obj\n<</Length ${cb.length}>>\nstream\n${content}\nendstream\nendobj\n`)
    }

    // Cross-reference table
    const xrefPos = pos
    const totalObjs = 1 + objOffsets.length
    writeStr("xref\n")
    writeStr(`0 ${totalObjs}\n`)
    writeStr("0000000000 65535 f \r\n")
    for (const o of objOffsets) {
      writeStr(o.toString().padStart(10, "0") + " 00000 n \r\n")
    }
    writeStr(`trailer\n<</Size ${totalObjs}/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF`)

    // Download
    const pdfBlob = new Blob(chunks, { type: "application/pdf" })
    const url = URL.createObjectURL(pdfBlob)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      window.open(url, "_blank")
    } else {
      const a = document.createElement("a")
      a.href = url; a.download = "kitabh-carousel.pdf"; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }
  }, [slides, sizeInfo, fontFamily, bgColor, textColor, accentColor, shapeColor, showLogo, shapeIntensity, templateIdx])

  // Draw waveform bars from analyser frequency data
  const drawWaveform = (ctx:CanvasRenderingContext2D, W:number, H:number, freqData:Uint8Array) => {
    const barCount=32, barW=W*0.5/barCount, gap=barW*0.4
    const totalW=barCount*(barW+gap)-gap, startX=(W-totalW)/2
    const maxH=H*0.05, baseY=H-75
    ctx.fillStyle=textColor+"44"
    for(let i=0;i<barCount;i++){
      const fi=Math.floor(i*freqData.length/barCount)
      const v=freqData[fi]/255
      const bh=Math.max(3,v*maxH), x=startX+i*(barW+gap), y0=baseY-bh/2, r=2
      ctx.beginPath()
      ctx.moveTo(x+r,y0); ctx.lineTo(x+barW-r,y0)
      ctx.arcTo(x+barW,y0,x+barW,y0+r,r); ctx.lineTo(x+barW,y0+bh-r)
      ctx.arcTo(x+barW,y0+bh,x+barW-r,y0+bh,r); ctx.lineTo(x+r,y0+bh)
      ctx.arcTo(x,y0+bh,x,y0+bh-r,r); ctx.lineTo(x,y0+r)
      ctx.arcTo(x,y0,x+r,y0,r); ctx.fill()
    }
  }

  // Export video — uses native MediaRecorder (MP4 if supported, else WebM)
  const exportVideo = useCallback(async () => {
    if(exporting||slides.length===0) return
    setExporting(true); setExportProgress("تحضير الشرائح...")
    let audioCtx:AudioContext|null=null, audioSrc:AudioBufferSourceNode|null=null
    try{
      await document.fonts.ready
      const W=sizeInfo.w, H=sizeInfo.h, ff=fontFamily
      const fps=30, dur=slideDuration, fadeDur=0.5
      const totalDur=Math.min(slides.length*dur, 180) // max 3 min

      // Pre-render slides to offscreen canvases
      const slideCanvases:HTMLCanvasElement[]=[]
      for(let i=0;i<slides.length;i++){
        const sc=document.createElement("canvas"); sc.width=W; sc.height=H
        await drawSlideOnCtx(sc.getContext("2d")!,slides[i],W,H,ff)
        slideCanvases.push(sc)
      }

      // Video canvas
      const c=document.createElement("canvas"); c.width=W; c.height=H
      const ctx=c.getContext("2d")!
      ctx.drawImage(slideCanvases[0],0,0)

      // Audio setup
      const videoStream=c.captureStream(fps)
      let finalStream:MediaStream=videoStream
      let analyser:AnalyserNode|null=null
      let freqData:Uint8Array|null=null

      if(audioFile){
        try{
          audioCtx=new AudioContext()
          const buf=await audioCtx.decodeAudioData(await audioFile.arrayBuffer())
          audioSrc=audioCtx.createBufferSource()
          audioSrc.buffer=buf
          analyser=audioCtx.createAnalyser()
          analyser.fftSize=128
          freqData=new Uint8Array(analyser.frequencyBinCount)
          const dest=audioCtx.createMediaStreamDestination()
          audioSrc.connect(analyser)
          analyser.connect(dest)
          audioSrc.connect(audioCtx.destination) // so analyser gets data even if not audible
          audioSrc.start(0)
          finalStream=new MediaStream([...videoStream.getVideoTracks(),...dest.stream.getAudioTracks()])
        }catch(e){console.warn("Audio setup failed:",e);analyser=null;freqData=null}
      }

      // Pick best format: MP4 (Chrome 120+) or WebM
      const mp4ok=typeof MediaRecorder!=="undefined"&&MediaRecorder.isTypeSupported("video/mp4")
      const mime=mp4ok?"video/mp4":"video/webm;codecs=vp9"
      const ext=mp4ok?"mp4":"webm"

      const recorder=new MediaRecorder(finalStream,{mimeType:mime,videoBitsPerSecond:5_000_000})
      const chunks:Blob[]=[]
      recorder.ondataavailable=e=>{if(e.data.size>0)chunks.push(e.data)}

      setExportProgress("تصدير الفيديو...")
      recorder.start(100)

      // Real-time frame rendering
      await new Promise<void>((resolve,reject)=>{
        recorder.onstop=()=>resolve()
        recorder.onerror=(e:any)=>reject(e?.error||new Error("recorder error"))
        const t0=performance.now()

        const render=()=>{
          const elapsed=(performance.now()-t0)/1000
          if(elapsed>=totalDur){
            try{recorder.stop()}catch(_){}
            try{audioSrc?.stop()}catch(_){}
            return
          }
          const si=Math.min(Math.floor(elapsed/dur),slides.length-1)
          const st=elapsed-si*dur
          ctx.globalAlpha=1
          ctx.drawImage(slideCanvases[si],0,0)
          if(st>dur-fadeDur&&si<slides.length-1){
            ctx.globalAlpha=(st-(dur-fadeDur))/fadeDur
            ctx.drawImage(slideCanvases[si+1],0,0)
            ctx.globalAlpha=1
          }
          // Waveform
          if(analyser&&freqData){
            analyser.getByteFrequencyData(freqData)
            drawWaveform(ctx,W,H,freqData)
          }
          setExportProgress(`تصدير ${Math.round(elapsed/totalDur*100)}%`)
          requestAnimationFrame(render)
        }
        requestAnimationFrame(render)
      })

      // Download
      const blob=new Blob(chunks,{type:mime})
      const a=document.createElement("a"); a.download=`kitabh-carousel.${ext}`
      a.href=URL.createObjectURL(blob); a.click()
      setTimeout(()=>URL.revokeObjectURL(a.href),5000)

    }catch(e:any){
      console.error("Export error:",e)
      setExportProgress("خطأ في التصدير")
      await new Promise(r=>setTimeout(r,2000))
    }finally{
      try{audioSrc?.stop()}catch(_){}
      try{audioCtx?.close()}catch(_){}
      setExporting(false); setExportProgress("")
    }
  }, [exporting, slides, sizeInfo, fontFamily, bgColor, textColor, accentColor, shapeColor, slideSize, showLogo, shapeIntensity, templateIdx, audioFile, slideDuration])

  return (
    <div className="kc" style={{opacity:fontsReady?1:0,transition:"opacity .2s ease"}}>
      <style>{CSS}</style>

      {page === "input" && (
        <div className="kc-in">
          <div className="kc-head">
            <div className="kc-logo">
              <span className="kc-geo kc-geo-1"/>
              <span className="kc-geo kc-geo-2"/>
              <span className="kc-geo kc-geo-3"/>
              <span className="kc-geo kc-geo-4"/>
            </div>
            <div className="kc-head-t">ستوديو كتابة</div>
            <div className="kc-head-s">حوّل نصوصك إلى منشورات عربيّة جميلة في لحظات</div>
          </div>

          <div className="kc-ta-wrap">
            <textarea className="kc-ta" value={text} onChange={e=>setText(e.target.value)} placeholder="ضع النص هنا..." dir="rtl"/>
            <div className="kc-ta-foot">
              <span className="kc-wc">{text.trim()?text.trim().split(/\s+/).length:0} كلمة</span>
            </div>
          </div>

          {error && <div className="kc-err">{error}</div>}

          <button className="kc-go" onClick={generate} disabled={!text.trim()}>
            <span className="kc-go-shapes">
              <span className="kc-gs kc-gs-1"/>
              <span className="kc-gs kc-gs-2"/>
              <span className="kc-gs kc-gs-3"/>
            </span>
            ابتكر تصميمك
          </button>

          {/* ── Trial usage bar ── */}
          {!isPremium&&(
            <div className="kc-trial">
              <div className="kc-trial-info">
                <div className="kc-trial-bar"><div className="kc-trial-fill" style={{width:`${Math.min(100,((KTK_FREE_USES-checksRemaining())/KTK_FREE_USES)*100)}%`}}/></div>
                <span className="kc-trial-t">{checksRemaining()>0?`${checksRemaining()} من ${KTK_FREE_USES} متبقي`:"انتهت استخداماتك المجانية"}</span>
              </div>
              <a className="kc-trial-btn" href="https://kitabh.com/pricing">صمّم دون حد</a>
            </div>
          )}

          <div className="kc-cfg">
            <div className="kc-row">
              <label className="kc-lbl">القالب</label>
              <div className="kc-tmpls-row">
                <button className="kc-tmpls-arr" onClick={()=>scrollTmpls(1)} type="button"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg></button>
                <div className="kc-tmpls-scroll" ref={tmplScrollRef}>
                  {TEMPLATES.map((t,i) => (
                    <button key={t.id} className={`kc-tmpl${templateIdx===i?" on":""}`} onClick={()=>selectTemplate(i)} type="button">
                      <div className="kc-tmpl-pv" style={{background:t.bg}}>
                        <svg className="kc-tmpl-shape" viewBox="0 0 100 100" fill={t.sc} dangerouslySetInnerHTML={{__html:TMPL_SHAPES[i]}}/>
                      </div>
                      <span className="kc-tmpl-n">{t.label}</span>
                    </button>
                  ))}
                </div>
                <button className="kc-tmpls-arr" onClick={()=>scrollTmpls(-1)} type="button"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg></button>
              </div>
            </div>

            <div className="kc-row">
              <div className="kc-customize-row">
                <label className="kc-clr-w">
                  <input type="color" className="kc-clr-native" value={bgColor} onChange={e=>setBgColor(e.target.value)}/>
                  <span className="kc-clr-sw" style={{background:bgColor}}/>
                  <span className="kc-clr-l2">الخلفية</span>
                </label>
                <label className="kc-clr-w">
                  <input type="color" className="kc-clr-native" value={textColor} onChange={e=>setTextColor(e.target.value)}/>
                  <span className="kc-clr-sw" style={{background:textColor}}/>
                  <span className="kc-clr-l2">الخط</span>
                </label>
                <select className="kc-font-dd" value={fontIdx} onChange={e=>setFontIdx(Number(e.target.value))}>
                  {FONTS.map((f,i) => <option key={f.id} value={i}>{f.label}</option>)}
                </select>
              </div>
            </div>

            <div className="kc-row">
              <label className="kc-lbl">معاينة</label>
              <div className="kc-pv" style={{background:bgColor,color:textColor,borderColor:textColor+"22",fontFamily,maxWidth:280}}>
                <svg className="kc-pv-shape" viewBox="0 0 100 100" fill={shapeColor} style={{opacity:SHAPE_LEVELS[shapeIntensity]?.opacity||0}} dangerouslySetInnerHTML={{__html:TMPL_SHAPES[templateIdx]}}/>
                <div className="kc-pv-h">ستوديو كتابة</div>
                <svg className="kc-pv-logo" viewBox="0 0 400 100" fill={textColor} dangerouslySetInnerHTML={{__html:LOGO_SVG_INNER}}/>
              </div>
            </div>
          </div>

        </div>
      )}

      {page === "loading" && (()=>{
        const prog = Math.round(((loadStep+1)/LOAD_STEPS.length)*100)
        return (
          <div className="kc-loading">
            <div className="kc-load-card">
              <div className="kc-load-header">
                <div className="kc-load-hicon">
                  <span className="kc-geo kc-geo-1"/>
                  <span className="kc-geo kc-geo-2"/>
                  <span className="kc-geo kc-geo-3"/>
                  <span className="kc-geo kc-geo-4"/>
                </div>
                <div>
                  <div className="kc-load-title">جاري الابتكار...</div>
                  <div className="kc-load-sub">نحوّل نصّك إلى شرائح كاروسيل جاهزة</div>
                </div>
              </div>
              <div className="kc-load-steps">
                {LOAD_STEPS.map((step,i)=>{
                  const status = i<loadStep?"done":i===loadStep?"active":"pending"
                  return (
                    <div key={i} className={`kc-load-step ${status}`}>
                      <div className="kc-load-step-ico">
                        {status==="done"
                          ?<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#12B76A"/><polyline points="7,12 10,15 17,8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          :STEP_ICO[step.icon]
                        }
                      </div>
                      <div className="kc-load-step-txt">{step.text}</div>
                      {status==="active"&&(
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2.5" style={{animation:"kc-spin 1s linear infinite",flexShrink:0}}>
                          <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
                          <path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="kc-load-prog"><div className="kc-load-prog-fill" style={{width:`${prog}%`}}/></div>
              <div className="kc-load-pct">{prog}% مكتمل</div>
            </div>
          </div>
        )
      })()}

      {/* ── Paywall popup ── */}
      {showPaywall && (()=>{
        const msg = ktkTrialMessage()
        return (
          <div className="ktk-paywall" onClick={()=>setShowPaywall(false)}>
            <div className="ktk-pw-card" onClick={e=>e.stopPropagation()}>
              <button className="ktk-pw-close" onClick={()=>setShowPaywall(false)} type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
              <div className="ktk-pw-icon">
                <span className="kc-geo kc-geo-1"/>
                <span className="kc-geo kc-geo-2"/>
                <span className="kc-geo kc-geo-3"/>
                <span className="kc-geo kc-geo-4"/>
              </div>
              <div className="ktk-pw-h">{msg.h}</div>
              <div className="ktk-pw-sub">{msg.sub.split("\n").map((l,i)=><span key={i}>{l}<br/></span>)}</div>
              <div className="ktk-pw-meter">
                <div className="ktk-pw-meter-bar"><div className="ktk-pw-meter-fill" style={{width:"100%"}}/></div>
                <span className="ktk-pw-meter-text">استخدمت {KTK_FREE_USES} من {KTK_FREE_USES} استخدامات مجانية</span>
              </div>
              <div className="ktk-pw-features">
                <div className="ktk-pw-f"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>استخدام غير محدود لكل الأدوات</span></div>
                <div className="ktk-pw-f"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>ربط مباشر مع حسابك في منصة كتابة</span></div>
                <div className="ktk-pw-f"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>اختر مقالتك وولّد مباشرة بدون نسخ ولصق</span></div>
                <div className="ktk-pw-f"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>جميع ميزات باقة الكاتب على منصة كتابة</span></div>
              </div>
              <a className="ktk-pw-btn" href={KTK_PRICING}>تعرّف على باقة الكاتب</a>
              <a className="ktk-pw-app" href="https://kitabh.com">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                العودة إلى منصة كتابة
              </a>
              <div className="ktk-pw-proof">+10 آلاف كاتب وكاتبة في العربيّة يستخدمون منصة كتابة</div>
            </div>
          </div>
        )
      })()}

      {/* ── Sign-in popup (shown during loading if not signed in) ── */}
      {showSignIn && (
        <div className="kc-signin-overlay">
          <div className="kc-signin-card" onClick={e=>e.stopPropagation()}>
            <div className="kc-signin-shapes">
              <span className="kc-geo kc-geo-1"/>
              <span className="kc-geo kc-geo-2"/>
              <span className="kc-geo kc-geo-3"/>
              <span className="kc-geo kc-geo-4"/>
            </div>
            <div className="kc-signin-h">سجّل حساب مجاني في منصة كتابة</div>
            <form className="kc-signin-form" onSubmit={e=>{
              e.preventDefault()
              const email = signInEmail.trim()
              if (!email || !email.includes("@")) return
              try { localStorage.setItem("kb_user_email", email) } catch(_){}
              setUserEmail(email)
              setShowSignIn(false)
            }}>
              <input
                className="kc-signin-input"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={signInEmail}
                onChange={e=>setSignInEmail(e.target.value)}
                dir="rtl"
                autoFocus
              />
              <button className="kc-signin-btn" type="submit">حفظ</button>
            </form>
            <div className="kc-signin-proof">+١٠ آلاف كاتب وكاتبة يستخدمون كتابة</div>
          </div>
        </div>
      )}

      {page === "results" && (
        <div className="kc-res">
          <div className="kc-res-top">
            <button className="kc-back" onClick={reset}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              رجوع
            </button>
            <div className="kc-res-title">{slides.length} شرائح جاهزة</div>
            <div className="kc-res-acts">
              <button className={`kc-tools-tog${showTools?" on":""}`} onClick={()=>setShowTools(v=>!v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                ستوديو كتابة
                <svg className={`kc-tools-arrow${showTools?" open":""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <button className="kc-dl-all" onClick={downloadAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                تحميل الكل
              </button>
              <button className="kc-dl-pdf" onClick={downloadPDF}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 11h6"/></svg>
                تحميل PDF
              </button>
            </div>
          </div>

          {showTools && (
            <div className="kc-tools-panel">
              <div className="kc-tools-row">
                <div className="kc-sizes-sm">
                  {SIZES.map(s => (
                    <button key={s.id} className={`kc-size-sm${slideSize===s.id?" on":""}`} onClick={()=>setSlideSize(s.id)} type="button">
                      <div className={`kc-size-ico ${s.id}`}/>
                    </button>
                  ))}
                </div>
                <button className={`kc-logo-tog${showLogo?" on":""}`} onClick={()=>setShowLogo(v=>!v)} title={showLogo?"إخفاء الشعار":"إظهار الشعار"}>
                  <svg width="16" height="16" viewBox="0 0 400 100" fill="currentColor" dangerouslySetInnerHTML={{__html:LOGO_SVG_INNER}}/>
                  {!showLogo && <div className="kc-logo-slash"/>}
                </button>
              </div>
              <div className="kc-intensity">
                <span className="kc-intensity-l">الشكل الهندسي</span>
                <div className="kc-intensity-btns">
                  {SHAPE_LEVELS.map(lvl => (
                    <button key={lvl.id} className={`kc-int-btn${shapeIntensity===lvl.id?" on":""}`} onClick={()=>setShapeIntensity(lvl.id)} type="button">
                      {lvl.id > 0 && <svg className="kc-int-ico" viewBox="0 0 100 100" fill="currentColor" style={{opacity:lvl.opacity*1.5+0.3}} dangerouslySetInnerHTML={{__html:TMPL_SHAPES[templateIdx]}}/>}
                      <span>{lvl.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="kc-res-tmpls">
                {TEMPLATES.map((t,i) => (
                  <button key={t.id} className={`kc-res-tmpl${activeTemplate===i?" on":""}`} onClick={()=>{setBgColor(t.bg);setTextColor(t.text);setAccentColor(t.accent)}} type="button">
                    <div className="kc-res-tmpl-pv" style={{background:t.bg}}>
                      <svg viewBox="0 0 100 100" fill={t.sc} dangerouslySetInnerHTML={{__html:TMPL_SHAPES[i]}}/>
                    </div>
                    <span className="kc-res-tmpl-n">{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="kc-res-cpick">
                <label className="kc-res-cp">
                  <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="kc-clr-native"/>
                  <span className="kc-res-cp-sw" style={{background:bgColor}}/>
                  <span className="kc-res-cp-l">الخلفية</span>
                </label>
                <label className="kc-res-cp">
                  <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="kc-clr-native"/>
                  <span className="kc-res-cp-sw" style={{background:textColor}}/>
                  <span className="kc-res-cp-l">الخط</span>
                </label>
                <select className="kc-res-font" value={fontIdx} onChange={e=>setFontIdx(Number(e.target.value))}>
                  {FONTS.map((f,i) => <option key={f.id} value={i}>{f.label}</option>)}
                </select>
              </div>
              {shapeIntensity > 0 && (
                <div className="kc-res-shapes">
                  {TMPL_SHAPES.map((s,i) => (
                    <button key={i} className={`kc-res-shp${templateIdx===i?" on":""}`} onClick={()=>setTemplateIdx(i)} type="button">
                      <svg viewBox="0 0 100 100" fill="currentColor" dangerouslySetInnerHTML={{__html:s}}/>
                    </button>
                  ))}
                </div>
              )}

              {slides[0]?.imageUrl && (
                <div className="kc-cover-layouts">
                  <span className="kc-cl-label">تخطيط الغلاف</span>
                  <div className="kc-cl-btns">
                    {COVER_LAYOUTS.map(cl => (
                      <button key={cl.id} className={`kc-cl-btn${(slides[0]?.coverLayout||"img-top")===cl.id?" on":""}`} onClick={()=>updateSlide(0,{coverLayout:cl.id})} type="button">
                        <div className={`kc-cl-ico ${cl.id}`}/>
                        <span>{cl.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="kc-video-sec" style={{display:"none"}}>
                <div className="kc-video-head">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  <span>تصدير فيديو</span>
                </div>
                <div className="kc-video-body">
                  <div className="kc-video-row">
                    <span className="kc-video-l">مدة الشريحة</span>
                    <div className="kc-video-dur">
                      <button className="kc-ta-step" onClick={()=>setSlideDuration(d=>Math.max(2,d-1))} disabled={slideDuration<=2}>−</button>
                      <span className="kc-video-dur-v">{slideDuration} ث</span>
                      <button className="kc-ta-step" onClick={()=>setSlideDuration(d=>Math.min(10,d+1))} disabled={slideDuration>=10}>+</button>
                    </div>
                  </div>
                  <div className="kc-video-row">
                    <span className="kc-video-l">موسيقى / صوت</span>
                    {audioFile ? (
                      <div className="kc-audio-info">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        <span className="kc-audio-name">{audioFile.name.length > 18 ? audioFile.name.slice(0,15)+"..." : audioFile.name}</span>
                        <button className="kc-audio-rm" onClick={removeAudio} title="إزالة">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ) : (
                      <button className="kc-audio-btn" onClick={()=>audioInputRef.current?.click()}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
                        رفع ملف صوتي
                      </button>
                    )}
                    <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} style={{display:"none"}}/>
                  </div>
                  <button className="kc-export-btn" onClick={exportVideo} disabled={exporting}>
                    {exporting ? (
                      <>{exportProgress}</>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        {audioFile ? "تصدير فيديو مع صوت" : "تصدير فيديو"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="kc-grid">
            {slides.map((slide,idx) => (
              <div key={idx} className="kc-card">
                <div className={`kc-card-pv${slide.imageUrl?` has-cover-img cl-${slide.coverLayout||"img-top"}`:""}`} style={{background:bgColor,color:textColor,fontFamily,aspectRatio:ar} as React.CSSProperties}>
                  {shapeIntensity>0&&!(slide.imageUrl&&(slide.coverLayout||"img-top")==="img-full")&&(
                    <svg className={`kc-card-shape int-${shapeIntensity}`} viewBox="0 0 100 100" fill={shapeColor} dangerouslySetInnerHTML={{__html:TMPL_SHAPES[templateIdx]}}/>
                  )}
                  {slide.imageUrl?(()=>{
                    const cl=slide.coverLayout||"img-top"
                    const fs=slide.fontScale??1
                    const pos=slide.imagePos??50
                    const imgEl=<div className="kc-cv-img"><img src={slide.imageUrl} alt="" style={{objectPosition:`center ${pos}%`}}/></div>
                    const titleEl=<div className="kc-cv-title" style={{fontSize:`${16*fs}px`}}>{slide.headline}</div>
                    const authorEl=slide.showAuthor&&slide.author?<div className="kc-cv-author" style={{color:textColor+"88",fontSize:`${10*fs}px`}}>{slide.author}</div>:null
                    if(cl==="img-top") return <>{imgEl}<div className="kc-cv-text">{titleEl}{authorEl}</div></>
                    if(cl==="img-bottom") return <><div className="kc-cv-text">{titleEl}{authorEl}</div>{imgEl}</>
                    if(cl==="img-full") return <>{imgEl}<div className="kc-cv-overlay"><div className="kc-cv-text">{titleEl}{authorEl}</div></div></>
                    if(cl==="title-top") return <><div className="kc-cv-text kc-cv-text-center">{titleEl}{authorEl}</div>{imgEl}</>
                    if(cl==="minimal") return <><div className="kc-cv-text kc-cv-text-center">{titleEl}</div>{imgEl}{authorEl?<div className="kc-cv-text">{authorEl}</div>:null}</>
                    return <>{imgEl}<div className="kc-cv-text">{titleEl}{authorEl}</div></>
                  })():(
                    <>
                      {slide.showAuthor&&slide.author&&(
                        <div className="kc-card-author" style={{color:textColor+"99",fontSize:`${10*(slide.fontScale??1)}px`}}>{slide.author}</div>
                      )}
                      <div className={`kc-card-c layout-${slide.layout}`}>
                        {slide.layout!=="body"&&(
                          <div className="kc-card-h" style={{fontSize:`${(slide.layout==="title"?20:17)*(slide.fontScale??1)}px`}}>{slide.headline}</div>
                        )}
                        {slide.layout==="title-body"&&slide.body&&(
                          <>
                            <div className="kc-card-div" style={{borderColor:accentColor+"44"}}/>
                            <div className="kc-card-b" style={{color:textColor+"CC",fontSize:`${13*(slide.fontScale??1)}px`}}>{slide.body}</div>
                          </>
                        )}
                        {slide.layout==="body"&&(
                          <div className="kc-card-b body-only" style={{color:textColor+"DD",fontSize:`${15*(slide.fontScale??1)}px`}}>{slide.body||slide.headline}</div>
                        )}
                      </div>
                    </>
                  )}
                  {showLogo&&(
                    <svg className="kc-card-logo" viewBox="0 0 400 100" fill={textColor} dangerouslySetInnerHTML={{__html:LOGO_SVG_INNER}}/>
                  )}
                </div>

                <div className="kc-acts">
                  <div className="kc-acts-l">
                    <select className="kc-lay-sel" value={slide.layout} onChange={e=>updateSlide(idx,{layout:e.target.value as SlideLayout})}>
                      {LAYOUTS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="kc-acts-r">
                    <div className="kc-font-scale">
                      <button className="kc-fs-btn" onClick={(e)=>{e.stopPropagation();const nv=Math.max(0.5,Math.round(((slide.fontScale??1)-0.1)*10)/10);updateSlide(idx,{fontScale:nv})}} title="تصغير الخط">−</button>
                      <span className="kc-fs-val">{Math.round((slide.fontScale??1)*100)}%</span>
                      <button className="kc-fs-btn" onClick={(e)=>{e.stopPropagation();const nv=Math.min(2,Math.round(((slide.fontScale??1)+0.1)*10)/10);updateSlide(idx,{fontScale:nv})}} title="تكبير الخط">+</button>
                    </div>
                    <button className="kc-abtn" onClick={()=>setEditingSlide(editingSlide===idx?null:idx)} title="تعديل">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="kc-abtn" onClick={()=>downloadSlide(slide,idx)} title="تحميل">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                    </button>
                  </div>
                </div>

                <div className="kc-cover-img">
                  {slide.imageUrl ? (
                    <div className="kc-cover-img-ctrl">
                      <div className="kc-cover-img-info">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        <span>{slide.type==="cover"?"صورة الغلاف":"صورة الشريحة"}</span>
                        <button className="kc-cover-img-rm" onClick={()=>updateSlide(idx,{imageUrl:undefined,imagePos:undefined,coverLayout:undefined})}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div className="kc-img-pos">
                        <span className="kc-img-pos-l">موضع</span>
                        <input type="range" min="0" max="100" value={slide.imagePos??50} onChange={e=>updateSlide(idx,{imagePos:Number(e.target.value)})} className="kc-img-pos-r"/>
                      </div>
                      <div className="kc-img-layout-row">
                        {COVER_LAYOUTS.map(cl=>(
                          <button key={cl.id} className={`kc-img-lay-btn${(slide.coverLayout||"img-top")===cl.id?" on":""}`} onClick={()=>updateSlide(idx,{coverLayout:cl.id})} type="button" title={cl.label}>
                            <div className={`kc-cl-ico ${cl.id}`}/>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <label className="kc-cover-img-add">
                      <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>updateSlide(idx,{imageUrl:r.result as string,coverLayout:slide.type==="cover"?"img-full":"minimal"});r.readAsDataURL(f);e.target.value=""}} style={{display:"none"}}/>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      أضف صورة
                    </label>
                  )}
                </div>

                {editingSlide===idx&&(
                  <div className="kc-edit">
                    <label className="kc-edit-l">العنوان</label>
                    <input className="kc-edit-i" value={slide.headline} onChange={e=>updateSlide(idx,{headline:e.target.value})} dir="rtl"/>
                    <label className="kc-edit-l">الفقرة</label>
                    <textarea className="kc-edit-ta" value={slide.body} onChange={e=>updateSlide(idx,{body:e.target.value})} dir="rtl" rows={3}/>
                    <div className="kc-edit-author-row">
                      <label className="kc-edit-l">الكاتب / المدونة</label>
                      <button className={`kc-edit-tog${slide.showAuthor?" on":""}`} onClick={()=>updateSlide(idx,{showAuthor:!slide.showAuthor})} type="button">
                        {slide.showAuthor?"إخفاء":"إظهار"}
                      </button>
                    </div>
                    {slide.showAuthor!==false&&(
                      <input className="kc-edit-i" value={slide.author||""} onChange={e=>updateSlide(idx,{author:e.target.value})} dir="rtl" placeholder="اسم الكاتب أو المدونة"/>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button className="kc-add-card" onClick={addSlide} type="button" style={{aspectRatio:ar}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              <span>أضف شريحة</span>
            </button>
          </div>

          {/* ── Trial usage bar (results page) ── */}
          {!isPremium&&(
            <div className="kc-trial kc-trial-res">
              <div className="kc-trial-info">
                <div className="kc-trial-bar"><div className="kc-trial-fill" style={{width:`${Math.min(100,((KTK_FREE_USES-checksRemaining())/KTK_FREE_USES)*100)}%`}}/></div>
                <span className="kc-trial-t">{checksRemaining()>0?`${checksRemaining()} من ${KTK_FREE_USES} متبقي`:"انتهت استخداماتك المجانية"}</span>
              </div>
              <a className="kc-trial-btn" href="https://kitabh.com/pricing">صمّم دون حد</a>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

// ═══════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Alyamama:wght@400;700;800&family=Rubik:wght@400;500;600;700;800&family=Playpen+Sans+Arabic:wght@400;500;600;700&family=Amiri:wght@400;700&family=Readex+Pro:wght@400;500;600;700&display=swap');

.kc{font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl;background:#F8F8F8;min-height:100vh;padding:14px 10px;color:#1A1A1A;box-sizing:border-box;overflow:hidden;width:100%;container-type:inline-size;}
.kc *{box-sizing:border-box;margin:0;padding:0;}
.kc-in,.kc-res,.kc-loading{overflow:hidden;width:100%;}

.kc-head{text-align:center;padding:28px 0 32px;}
.kc-logo{margin:0 auto 18px;display:flex;align-items:center;justify-content:center;gap:6px;}
.kc-head-t{font-size:28px;font-weight:700;margin-bottom:6px;letter-spacing:-.3px;font-family:'Rubik',sans-serif;color:#371D12;}
.kc-head-s{font-size:15px;color:#888;line-height:1.6;max-width:300px;margin:0 auto;font-family:'Rubik',sans-serif;}

/* Geometric logo shapes */
.kc-geo{display:block;flex-shrink:0;will-change:transform,clip-path;}
.kc-geo-1{width:38px;height:38px;background:#0000FF;animation:kc-g1 4.5s ease-in-out infinite;}
.kc-geo-2{width:32px;height:32px;background:#E82222;animation:kc-g2 5s ease-in-out infinite;}
.kc-geo-3{width:35px;height:35px;background:#10B981;animation:kc-g3 4.8s ease-in-out infinite;}
.kc-geo-4{width:30px;height:30px;background:#F59E0B;animation:kc-g4 5.2s ease-in-out infinite;}
@keyframes kc-g1{
  0%,100%{clip-path:polygon(50% 0%,85% 15%,100% 50%,85% 85%,50% 100%,15% 85%,0% 50%,15% 15%);transform:translateY(0) rotate(0deg)}
  25%{clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%);transform:translateY(-6px) rotate(15deg)}
  50%{clip-path:polygon(50% 5%,68% 28%,95% 85%,82% 95%,50% 95%,18% 95%,5% 85%,32% 28%);transform:translateY(0) rotate(-5deg)}
  75%{clip-path:polygon(50% 0%,65% 35%,100% 50%,65% 65%,50% 100%,35% 65%,0% 50%,35% 35%);transform:translateY(4px) rotate(10deg)}
}
@keyframes kc-g2{
  0%,100%{clip-path:polygon(0% 0%,50% 0%,100% 0%,100% 50%,100% 100%,50% 100%,0% 100%,0% 50%);transform:translateY(0) rotate(0deg)}
  25%{clip-path:polygon(0% 100%,0% 50%,15% 15%,50% 0%,85% 15%,100% 50%,100% 100%,50% 100%);transform:translateY(5px) rotate(-10deg)}
  50%{clip-path:polygon(50% 0%,65% 35%,100% 50%,65% 65%,50% 100%,35% 65%,0% 50%,35% 35%);transform:translateY(0) rotate(20deg)}
  75%{clip-path:polygon(50% 0%,85% 15%,100% 50%,85% 85%,50% 100%,15% 85%,0% 50%,15% 15%);transform:translateY(-4px) rotate(5deg)}
}
@keyframes kc-g3{
  0%,100%{clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%);transform:translateY(0) rotate(0deg)}
  25%{clip-path:polygon(50% 0%,85% 15%,100% 50%,85% 85%,50% 100%,15% 85%,0% 50%,15% 15%);transform:translateY(-5px) rotate(-15deg)}
  50%{clip-path:polygon(0% 100%,0% 50%,15% 15%,50% 0%,85% 15%,100% 50%,100% 100%,50% 100%);transform:translateY(3px) rotate(8deg)}
  75%{clip-path:polygon(0% 0%,50% 0%,100% 0%,100% 50%,100% 100%,50% 100%,0% 100%,0% 50%);transform:translateY(-2px) rotate(-5deg)}
}
@keyframes kc-g4{
  0%,100%{clip-path:polygon(50% 5%,68% 28%,95% 85%,82% 95%,50% 95%,18% 95%,5% 85%,32% 28%);transform:translateY(0) rotate(0deg)}
  25%{clip-path:polygon(50% 0%,65% 35%,100% 50%,65% 65%,50% 100%,35% 65%,0% 50%,35% 35%);transform:translateY(5px) rotate(12deg)}
  50%{clip-path:polygon(50% 0%,85% 15%,100% 50%,85% 85%,50% 100%,15% 85%,0% 50%,15% 15%);transform:translateY(-4px) rotate(-8deg)}
  75%{clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%);transform:translateY(2px) rotate(5deg)}
}

.kc-ta-wrap{border:2px solid #E5E5E5;border-radius:12px;overflow:hidden;background:#FFF;transition:border-color .2s;}
.kc-ta-wrap:focus-within{border-color:#0000FF;}
.kc-ta{width:100%;min-height:110px;border:none;padding:12px;font-family:inherit;font-size:14px;line-height:1.6;resize:vertical;outline:none;background:transparent;}
.kc-ta-foot{display:flex;align-items:center;justify-content:space-between;padding:6px 12px;border-top:1px solid #F0F0F0;background:#FAFAFA;}
.kc-ta-slides{display:flex;align-items:center;gap:6px;}
.kc-ta-step{width:22px;height:22px;border:1.5px solid #E0E0E0;border-radius:6px;background:#FFF;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#888;transition:all .15s;font-family:inherit;}
.kc-ta-step:hover:not(:disabled){border-color:#0000FF;color:#0000FF;}
.kc-ta-step:disabled{opacity:.3;cursor:not-allowed;}
.kc-ta-count{font-size:12px;font-weight:600;color:#666;min-width:44px;text-align:center;}
.kc-wc{font-size:11px;color:#AAA;}

.kc-cfg{margin-top:10px;display:flex;flex-direction:column;gap:10px;}
.kc-row{display:flex;flex-direction:column;gap:5px;}
.kc-lbl{font-size:13px;font-weight:600;color:#333;}
.kc-hint{font-size:11px;color:#999;}

.kc-stepper{display:flex;align-items:center;gap:10px;}
.kc-step-btn{width:32px;height:32px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-family:inherit;}
.kc-step-btn:hover:not(:disabled){border-color:#0000FF;color:#0000FF;}
.kc-step-btn:disabled{opacity:.3;cursor:not-allowed;}
.kc-step-val{font-size:18px;font-weight:700;min-width:20px;text-align:center;}

/* Template Gallery — bold geometric shapes */
.kc-tmpls{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.kc-tmpls-row{display:flex;align-items:center;gap:4px;margin:0 -10px;padding:0 4px;}
.kc-tmpls-arr{width:24px;height:24px;border:1.5px solid #E0E0E0;border-radius:6px;background:#FFF;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#999;transition:all .15s;flex-shrink:0;padding:0;}
.kc-tmpls-arr:hover{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-tmpls-scroll{display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;flex:1;min-width:0;}
.kc-tmpls-scroll::-webkit-scrollbar{display:none;}
.kc-tmpls-scroll .kc-tmpl{width:28%;min-width:70px;max-width:90px;flex-shrink:0;scroll-snap-align:start;}
.kc-tmpl{display:flex;flex-direction:column;align-items:center;gap:1px;padding:0;border:2px solid transparent;border-radius:8px;background:transparent;cursor:pointer;transition:all .25s ease;font-family:inherit;outline:none;-webkit-tap-highlight-color:transparent;}
.kc-tmpl:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.1);}
.kc-tmpl.on{border-color:#0000FF;box-shadow:0 0 0 2px rgba(0,0,255,.15),0 4px 16px rgba(0,0,0,.08);transform:translateY(-1px);}
.kc-tmpl-pv{width:100%;aspect-ratio:1;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;}
.kc-tmpl-shape{width:50%;height:50%;opacity:.9;transition:transform .3s ease;}
.kc-tmpl:hover .kc-tmpl-shape{transform:scale(1.1);}
.kc-tmpl.on .kc-tmpl-shape{transform:scale(1.08);}
.kc-tmpl-n{font-size:9px;font-weight:600;color:#555;white-space:nowrap;padding-bottom:2px;}

/* Color Pickers */
.kc-clrs{display:flex;gap:10px;flex-wrap:wrap;}
.kc-clr{display:flex;flex-direction:column;gap:3px;}
.kc-clr-l{font-size:11px;font-weight:600;color:#777;}
.kc-clr-w{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 4px;border:2px solid #E5E5E5;border-radius:999px;background:#FFF;cursor:pointer;transition:border-color .2s;position:relative;}
.kc-clr-w:hover{border-color:#BBB;}
.kc-clr-native{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;cursor:pointer;}
.kc-clr-sw{width:24px;height:24px;border-radius:6px;border:1.5px solid rgba(0,0,0,.12);flex-shrink:0;transition:background .15s;pointer-events:none;}
.kc-clr-hex{font-size:11px;font-weight:600;color:#555;font-family:'IBM Plex Sans Arabic',monospace;direction:ltr;letter-spacing:.3px;pointer-events:none;}
.kc-customize-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.kc-clr-l2{font-size:10px;font-weight:600;color:#777;pointer-events:none;}
.kc-font-dd{padding:6px 10px;border:2px solid #E5E5E5;border-radius:999px;background:#FFF;font-family:inherit;font-size:12px;font-weight:600;color:#555;outline:none;cursor:pointer;direction:rtl;transition:border-color .2s;flex:1;min-width:0;}
.kc-font-dd:hover{border-color:#BBB;}
.kc-font-dd:focus{border-color:#0000FF;color:#0000FF;}

/* Font Selector */
.kc-fonts{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;}
.kc-ft{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px 6px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;cursor:pointer;transition:all .2s;font-family:inherit;outline:none;-webkit-tap-highlight-color:transparent;}
.kc-ft:hover{border-color:#D0D0D0;background:#FAFAFA;}
.kc-ft.on{border-color:#0000FF;background:#F0F0FF;box-shadow:0 0 0 2px rgba(0,0,255,.12);}
.kc-ft-pv{font-size:13px;font-weight:700;line-height:1.4;color:#1A1A1A;direction:rtl;text-align:center;min-height:32px;display:flex;align-items:center;justify-content:center;}
.kc-ft-n{font-size:8px;font-weight:600;color:#999;font-family:'IBM Plex Sans Arabic',sans-serif;letter-spacing:.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;text-align:center;}

/* Live Preview */
.kc-pv{width:100%;max-width:160px;aspect-ratio:1;border-radius:10px;border:2px solid;padding:12px;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.kc-pv-shape{position:absolute;width:90%;height:90%;bottom:-10%;left:-10%;pointer-events:none;z-index:0;}
.kc-pv-logo{position:absolute;bottom:8px;right:8px;width:40px;height:auto;opacity:.7;}
.kc-pv-h{font-size:18px;font-weight:700;line-height:1.4;text-align:center;margin:auto 0;direction:rtl;position:relative;z-index:1;}
.kc-pv-divider{border-top:1.5px solid;margin:8px 0;width:100%;}
.kc-pv-b{font-size:11px;line-height:1.6;text-align:right;direction:rtl;margin-top:8px;}

/* Author */
.kc-author{padding:8px 12px;border:2px solid #E5E5E5;border-radius:999px;font-family:inherit;font-size:13px;outline:none;transition:border-color .2s;background:#FFF;}
.kc-author:focus{border-color:#0000FF;}

.kc-err{margin-top:8px;padding:8px 12px;background:#FEF2F2;border:1px solid #FCA5A5;border-radius:999px;color:#DC2626;font-size:12px;text-align:center;}

.kc-go{margin-top:12px;width:100%;padding:12px;border:none;border-radius:999px;background:#0000FF;color:#FFF;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s;}
.kc-go-shapes{display:flex;align-items:center;gap:3px;}
.kc-gs{display:block;will-change:transform,clip-path;}
.kc-gs-1{width:10px;height:10px;background:#F59E0B;animation:kc-g1 4.5s ease-in-out infinite;}
.kc-gs-2{width:8px;height:8px;background:#10B981;animation:kc-g2 5s ease-in-out infinite;}
.kc-gs-3{width:9px;height:9px;background:#E82222;animation:kc-g3 4.8s ease-in-out infinite;}
.kc-go:hover{opacity:.9;}
.kc-go:disabled{opacity:.4;cursor:not-allowed;}
.kc-remain{text-align:center;font-size:11px;color:#AAA;margin-top:5px;}

/* Loading */
.kc-loading{padding:28px 16px 36px;display:flex;flex-direction:column;align-items:center;}
.kc-load-card{width:100%;max-width:440px;background:#fff;border:1px solid #D9D9D9;border-radius:20px;padding:28px 24px 24px;box-shadow:0 4px 24px rgba(0,0,0,.10);}
.kc-load-header{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid #F2F2F2;text-align:center;direction:rtl;}
.kc-load-hicon{display:flex;align-items:center;justify-content:center;gap:4px;flex-shrink:0;}
.kc-load-title{font-size:17px;font-weight:700;color:#371D12;margin-bottom:2px;}
.kc-load-sub{font-size:13px;color:#818181;}
.kc-load-steps{display:flex;flex-direction:column;gap:6px;margin-bottom:20px;}
.kc-load-step{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;transition:all .25s;background:transparent;border:1.5px solid transparent;direction:rtl;}
.kc-load-step.active{background:#F0F0FF;border-color:#0000FF;}
.kc-load-step.done{opacity:.55;}
.kc-load-step.pending{opacity:.32;}
.kc-load-step-ico{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:7px;flex-shrink:0;background:#F2F2F2;}
.kc-load-step.active .kc-load-step-ico{background:#E8E8FF;animation:kc-pulse 1.6s ease-in-out infinite;}
.kc-load-step.done .kc-load-step-ico{background:#F0FDF7;}
.kc-load-step-txt{font-size:14px;font-weight:500;color:#371D12;flex:1;}
.kc-load-step.active .kc-load-step-txt{font-weight:600;color:#0000FF;}
.kc-load-prog{background:#F2F2F2;border-radius:4px;height:5px;overflow:hidden;}
.kc-load-prog-fill{height:100%;background:#0000FF;border-radius:4px;transition:width .6s ease;}
.kc-load-pct{font-size:12px;color:#818181;text-align:center;margin-top:6px;}
@keyframes kc-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes kc-pulse{0%,100%{opacity:1}50%{opacity:.6}}

/* Results */
.kc-res{width:100%;padding:0;}
.kc-res-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px;flex-wrap:wrap;}
.kc-back{display:flex;align-items:center;gap:6px;padding:8px 14px;border:2px solid #E5E5E5;border-radius:999px;background:#FFF;font-family:inherit;font-size:13px;cursor:pointer;transition:all .15s;}
.kc-back:hover{border-color:#0000FF;color:#0000FF;}
.kc-res-title{font-size:16px;font-weight:600;}
.kc-res-acts{display:flex;align-items:center;gap:8px;}
.kc-dl-all{display:flex;align-items:center;gap:6px;padding:8px 14px;border:none;border-radius:999px;background:#0000FF;color:#FFF;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s;}
.kc-dl-all:hover{opacity:.85;}
.kc-dl-pdf{display:flex;align-items:center;gap:6px;padding:8px 14px;border:2px solid #0000FF;border-radius:999px;background:#FFF;color:#0000FF;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
.kc-dl-pdf:hover{background:#0000FF;color:#FFF;}

/* Tools toggle button — animated glow */
.kc-tools-tog{display:flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:999px;background:linear-gradient(135deg,#0000FF 0%,#4361EE 40%,#0000FF 100%);background-size:200% 200%;animation:kc-btn-shimmer 3s ease infinite;font-family:inherit;font-size:13px;font-weight:700;color:#FFF;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,255,.3);}
.kc-tools-tog:hover{box-shadow:0 4px 16px rgba(0,0,255,.45);transform:translateY(-1px);}
.kc-tools-tog.on{background:linear-gradient(135deg,#0000FF 0%,#4361EE 50%,#0000FF 100%);background-size:200% 200%;box-shadow:0 4px 16px rgba(0,0,255,.45);}
.kc-tools-tog svg{stroke:#FFF;}
@keyframes kc-btn-shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.kc-tools-arrow{transition:transform .25s ease;}
.kc-tools-arrow.open{transform:rotate(180deg);}

/* Tools panel */
.kc-tools-panel{display:flex;flex-direction:column;gap:12px;margin-bottom:16px;padding:14px;background:#FFF;border:2px solid #E8E8E8;border-radius:14px;}
.kc-tools-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}

/* Results templates & pickers */
.kc-res-tmpls{display:flex;gap:6px;overflow-x:auto;direction:rtl;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:4px;scrollbar-width:none;}
.kc-res-tmpls::-webkit-scrollbar{display:none;}
.kc-res-tmpl{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0;border:2px solid transparent;border-radius:8px;background:transparent;cursor:pointer;transition:all .2s;font-family:inherit;outline:none;-webkit-tap-highlight-color:transparent;flex-shrink:0;scroll-snap-align:start;}
.kc-res-tmpl:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.1);}
.kc-res-tmpl.on{border-color:#0000FF;box-shadow:0 0 0 2px rgba(0,0,255,.15);transform:translateY(-1px);}
.kc-res-tmpl-pv{width:56px;height:56px;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.kc-res-tmpl-pv svg{width:50%;height:50%;opacity:.9;}
.kc-res-tmpl-n{font-size:8px;font-weight:600;color:#555;white-space:nowrap;padding-bottom:3px;}
.kc-res-shapes{display:flex;gap:6px;flex-wrap:wrap;}
.kc-res-shp{width:32px;height:32px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:#999;padding:5px;}
.kc-res-shp:hover{border-color:#BBB;color:#666;}
.kc-res-shp.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-res-shp svg{width:100%;height:100%;}

/* Size selector (results toolbar) */
.kc-sizes-sm{display:flex;gap:4px;}
.kc-size-sm{width:36px;height:32px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:#999;}
.kc-size-sm:hover{border-color:#BBB;}
.kc-size-sm.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-size-ico{border:2px solid currentColor;border-radius:2px;}
.kc-size-ico.post{width:14px;height:14px;}
.kc-size-ico.story{width:10px;height:16px;}
.kc-size-ico.youtube{width:18px;height:11px;}

/* Shape intensity scale */
.kc-intensity{display:flex;flex-direction:column;gap:6px;}
.kc-intensity-l{font-size:11px;font-weight:600;color:#777;}
.kc-intensity-btns{display:flex;gap:4px;}
.kc-int-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 8px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;cursor:pointer;transition:all .2s;font-family:inherit;font-size:10px;font-weight:600;color:#888;flex:1;min-width:0;}
.kc-int-btn:hover{border-color:#BBB;color:#555;}
.kc-int-btn.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-int-ico{width:20px;height:20px;}

/* Author name on card */
.kc-card-author{position:absolute;top:12px;left:0;right:0;text-align:center;font-size:calc(10px * var(--fs,1));font-weight:500;z-index:1;}

/* Results color pickers */
.kc-res-cpick{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
.kc-res-cp{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 4px;border:2px solid #E5E5E5;border-radius:999px;background:#FFF;cursor:pointer;position:relative;transition:border-color .2s;}
.kc-res-cp:hover{border-color:#BBB;}
.kc-res-cp-sw{width:22px;height:22px;border-radius:6px;border:1.5px solid rgba(0,0,0,.12);flex-shrink:0;pointer-events:none;}
.kc-res-cp-l{font-size:11px;font-weight:600;color:#777;pointer-events:none;}
.kc-res-font{padding:6px 10px;border:2px solid #E5E5E5;border-radius:999px;background:#FFF;font-family:inherit;font-size:12px;font-weight:600;color:#555;outline:none;cursor:pointer;direction:rtl;transition:border-color .2s;}
.kc-res-font:hover{border-color:#BBB;}
.kc-res-font:focus{border-color:#0000FF;color:#0000FF;}

/* Card background shape */
.kc-card-shape{position:absolute;bottom:-4%;left:-4%;pointer-events:none;z-index:0;}
.kc-card-shape.int-1{width:45%;height:45%;opacity:.06;}
.kc-card-shape.int-2{width:65%;height:65%;opacity:.2;}
.kc-card-shape.int-3{width:90%;height:90%;opacity:.55;}

/* Cover layouts — shared */
.kc-card-pv.has-cover-img{padding:0;gap:0;overflow:hidden;position:relative;}
.kc-card-pv.has-cover-img .kc-card-logo{bottom:10px;right:14px;width:44px;z-index:3;}
.kc-cv-img{width:100%;flex-shrink:0;z-index:1;overflow:hidden;}
.kc-cv-img img{width:100%;object-fit:cover;display:block;}
.kc-cv-text{width:100%;text-align:right;padding:8px 10px;z-index:2;display:flex;flex-direction:column;align-items:flex-end;gap:2px;box-sizing:border-box;}
.kc-cv-title{font-weight:700;line-height:1.35;text-align:right;width:100%;word-wrap:break-word;overflow-wrap:break-word;}
.kc-cv-author{text-align:right;font-weight:500;}
.kc-cv-text-center{align-items:center;text-align:center;}
.kc-cv-text-center .kc-cv-title{text-align:center;}
.kc-cv-text-center .kc-cv-author{text-align:center;}
/* img-top: image top, title below */
.cl-img-top{flex-direction:column;justify-content:flex-start;}
.cl-img-top .kc-cv-img{flex:0 0 50%;border-radius:0;}
.cl-img-top .kc-cv-img img{width:100%;height:100%;aspect-ratio:auto;object-fit:cover;}
.cl-img-top .kc-cv-text{flex:1;justify-content:center;padding:10px 16px;}
/* img-bottom: title top, image bottom */
.cl-img-bottom{flex-direction:column;justify-content:flex-start;}
.cl-img-bottom .kc-cv-text{flex:1;justify-content:center;padding:12px 16px;}
.cl-img-bottom .kc-cv-img{flex:0 0 50%;border-radius:0;}
.cl-img-bottom .kc-cv-img img{width:100%;height:100%;aspect-ratio:auto;object-fit:cover;}
/* img-full: full bleed image with gradient overlay */
.cl-img-full{flex-direction:column;justify-content:flex-end;}
.cl-img-full .kc-cv-img{position:absolute;inset:0;width:100%;height:100%;}
.cl-img-full .kc-cv-img img{width:100%;height:100%;aspect-ratio:auto;}
.cl-img-full .kc-cv-overlay{position:absolute;bottom:0;left:0;right:0;z-index:2;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.4) 50%,transparent 100%);padding:0;}
.cl-img-full .kc-cv-overlay .kc-cv-text{padding:12px 16px 36px;}
.cl-img-full .kc-cv-overlay .kc-cv-title{color:#FFF !important;}
.cl-img-full .kc-cv-overlay .kc-cv-author{color:rgba(255,255,255,.7) !important;}
/* title-top: centered title on top, full-bleed image bottom */
.cl-title-top{flex-direction:column;justify-content:flex-start;}
.cl-title-top .kc-cv-text{padding:14px 12px 8px;flex:0;}
.cl-title-top .kc-cv-img{flex:1;border-radius:0;}
.cl-title-top .kc-cv-img img{width:100%;height:100%;aspect-ratio:auto;object-fit:cover;}
/* minimal: centered small image, title, author */
.cl-minimal{flex-direction:column;justify-content:center;align-items:center;padding:10px !important;}
.cl-minimal .kc-cv-img{width:50%;border-radius:10px;overflow:hidden;flex-shrink:0;margin:0 auto;}
.cl-minimal .kc-cv-img img{aspect-ratio:1;border-radius:10px;object-fit:cover;}
.cl-minimal .kc-cv-text{align-items:center;text-align:center;}
.cl-minimal .kc-cv-title{text-align:center;}
/* Cover layout selector UI */
.kc-cover-layouts{border-top:1px solid #F0F0F0;padding-top:10px;}
.kc-cl-label{font-size:11px;font-weight:700;color:#555;display:block;margin-bottom:6px;text-align:right;}
.kc-cl-btns{display:flex;gap:4px;overflow-x:auto;direction:rtl;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.kc-cl-btns::-webkit-scrollbar{display:none;}
.kc-cl-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 8px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;cursor:pointer;transition:all .2s;font-family:inherit;font-size:9px;font-weight:600;color:#888;flex-shrink:0;min-width:52px;}
.kc-cl-btn:hover{border-color:#BBB;color:#555;}
.kc-cl-btn.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-cl-ico{width:32px;height:24px;border-radius:4px;border:1.5px solid currentColor;position:relative;overflow:hidden;}
.kc-cl-ico::before,.kc-cl-ico::after{content:"";position:absolute;display:block;}
.kc-cl-ico.img-top::before{top:0;left:0;right:0;height:55%;background:currentColor;opacity:.3;}
.kc-cl-ico.img-top::after{bottom:2px;right:2px;width:60%;height:3px;background:currentColor;opacity:.5;border-radius:1px;}
.kc-cl-ico.img-bottom::before{bottom:0;left:0;right:0;height:45%;background:currentColor;opacity:.3;}
.kc-cl-ico.img-bottom::after{top:3px;right:2px;width:60%;height:3px;background:currentColor;opacity:.5;border-radius:1px;}
.kc-cl-ico.img-full::before{inset:0;background:currentColor;opacity:.2;}
.kc-cl-ico.img-full::after{bottom:2px;right:2px;width:60%;height:3px;background:currentColor;opacity:.7;border-radius:1px;}
.kc-cl-ico.title-top::before{top:2px;left:50%;transform:translateX(-50%);width:60%;height:3px;background:currentColor;opacity:.5;border-radius:1px;}
.kc-cl-ico.title-top::after{bottom:0;left:0;right:0;height:55%;background:currentColor;opacity:.3;}
.kc-cl-ico.minimal::before{top:50%;left:50%;transform:translate(-50%,-60%);width:40%;height:40%;border-radius:3px;background:currentColor;opacity:.3;}
.kc-cl-ico.minimal::after{bottom:3px;left:50%;transform:translateX(-50%);width:50%;height:2px;background:currentColor;opacity:.5;border-radius:1px;}
.kc-cover-img{padding:8px 14px;border-top:1px solid #F0F0F0;display:flex;align-items:center;}
.kc-cover-img-add{display:flex;align-items:center;gap:6px;padding:6px 12px;border:1.5px dashed #D0D0D0;border-radius:999px;background:#FAFAFA;font-family:inherit;font-size:11px;font-weight:600;color:#888;cursor:pointer;transition:all .15s;width:100%;justify-content:center;}
.kc-cover-img-add:hover{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-cover-img-info{display:flex;align-items:center;gap:6px;padding:4px 8px;background:#F0F0FF;border-radius:999px;border:1.5px solid #D0D0FF;width:100%;font-size:11px;font-weight:600;color:#333;}
.kc-cover-img-rm{width:22px;height:22px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#999;border-radius:4px;transition:all .15s;margin-right:auto;margin-left:0;}
.kc-cover-img-rm:hover{color:#DC2626;background:#FEF2F2;}
.kc-cover-img-ctrl{display:flex;flex-direction:column;gap:6px;width:100%;}
.kc-img-pos{display:flex;align-items:center;gap:8px;width:100%;}
.kc-img-pos-l{font-size:10px;font-weight:600;color:#888;white-space:nowrap;}
.kc-img-pos-r{flex:1;height:4px;-webkit-appearance:none;appearance:none;background:#E5E5E5;border-radius:2px;outline:none;cursor:pointer;}
.kc-img-pos-r::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#0000FF;cursor:pointer;border:2px solid #FFF;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.kc-img-layout-row{display:flex;gap:3px;}
.kc-img-lay-btn{display:flex;align-items:center;justify-content:center;padding:4px;border:1.5px solid #E5E5E5;border-radius:5px;background:#FFF;cursor:pointer;transition:all .15s;}
.kc-img-lay-btn:hover{border-color:#BBB;}
.kc-img-lay-btn.on{border-color:#0000FF;background:#F0F0FF;}
.kc-img-lay-btn .kc-cl-ico{width:24px;height:16px;border-width:1px;}

/* Video export */
.kc-video-sec{border-top:1px solid #F0F0F0;padding-top:12px;}
.kc-video-head{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#555;margin-bottom:8px;}
.kc-video-body{display:flex;flex-direction:column;gap:8px;}
.kc-video-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.kc-video-l{font-size:11px;font-weight:600;color:#777;}
.kc-video-dur{display:flex;align-items:center;gap:4px;}
.kc-video-dur-v{font-size:12px;font-weight:600;color:#555;min-width:28px;text-align:center;}
.kc-audio-btn{display:flex;align-items:center;gap:4px;padding:5px 10px;border:1.5px dashed #D0D0D0;border-radius:999px;background:#FAFAFA;font-family:inherit;font-size:11px;font-weight:600;color:#888;cursor:pointer;transition:all .15s;}
.kc-audio-btn:hover{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-audio-info{display:flex;align-items:center;gap:5px;padding:4px 8px;background:#F0F0FF;border-radius:999px;border:1.5px solid #D0D0FF;}
.kc-audio-name{font-size:10px;font-weight:600;color:#333;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.kc-audio-rm{width:20px;height:20px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#999;border-radius:4px;transition:all .15s;}
.kc-audio-rm:hover{color:#DC2626;background:#FEF2F2;}
.kc-export-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;border:none;border-radius:999px;background:linear-gradient(135deg,#4361EE,#0000FF);color:#FFF;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.kc-export-btn:hover:not(:disabled){opacity:.9;box-shadow:0 4px 16px rgba(0,0,255,.25);}
.kc-export-btn:disabled{opacity:.6;cursor:not-allowed;}

/* Logo toggle */
.kc-logo-tog{position:relative;width:36px;height:32px;border:2px solid #E5E5E5;border-radius:8px;background:#FFF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:#999;}
.kc-logo-tog:hover{border-color:#BBB;}
.kc-logo-tog.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-logo-slash{position:absolute;top:50%;left:50%;width:28px;height:2px;background:#DC2626;border-radius:1px;transform:translate(-50%,-50%) rotate(-45deg);}

/* Grid */
.kc-grid{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:8px;}
.kc-grid::-webkit-scrollbar{display:none;}
.kc-grid>.kc-card{min-width:72%;max-width:72%;scroll-snap-align:start;flex-shrink:0;}
.kc-add-card{min-width:72%;max-width:72%;scroll-snap-align:start;flex-shrink:0;border:2px dashed #D0D0D0;border-radius:16px;background:#FAFAFA;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:#999;transition:all .2s;}
.kc-add-card:hover{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}

/* Card */
.kc-card{border:2px solid #E8E8E8;border-radius:16px;overflow:hidden;background:#FFF;transition:border-color .2s;}
.kc-card:hover{border-color:#CCC;}
.kc-card-pv{position:relative;display:flex;flex-direction:column;align-items:stretch;justify-content:center;padding:24px;overflow:hidden;}
.kc-card-logo{position:absolute;bottom:14px;right:14px;width:70px;height:auto;opacity:.7;}
.kc-card-cat{position:absolute;top:14px;right:50%;transform:translateX(50%);font-size:11px;font-weight:600;}

.kc-card-c{display:flex;flex-direction:column;gap:10px;width:100%;position:relative;z-index:1;}
.kc-card-c.layout-title{align-items:center;justify-content:center;text-align:center;}
.kc-card-c.layout-title .kc-card-h{font-size:calc(20px * var(--fs,1));font-weight:700;line-height:1.5;}
.kc-card-c.layout-title-body{text-align:right;}
.kc-card-c.layout-title-body .kc-card-h{font-size:calc(17px * var(--fs,1));font-weight:700;line-height:1.5;}
.kc-card-c.layout-title-body .kc-card-b{font-size:calc(13px * var(--fs,1));line-height:1.7;}
.kc-card-c.layout-body{align-items:stretch;justify-content:center;text-align:right;}
.kc-card-c.layout-body .kc-card-b.body-only{font-size:calc(15px * var(--fs,1));line-height:1.7;}
.kc-card-div{border-top:1px solid;margin:4px 0;width:100%;}

/* Actions */
.kc-acts{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-top:1px solid #F0F0F0;}
.kc-acts-l{display:flex;gap:4px;}
.kc-acts-r{display:flex;gap:6px;}
.kc-lay-sel{padding:6px 10px;border:1.5px solid #E5E5E5;border-radius:999px;background:#FAFAFA;font-family:inherit;font-size:12px;font-weight:600;color:#666;outline:none;cursor:pointer;direction:rtl;}
.kc-lay-sel:hover{border-color:#BBB;}
.kc-lay-sel:focus{border-color:#0000FF;color:#0000FF;}
.kc-abtn{width:32px;height:28px;border:1.5px solid #E5E5E5;border-radius:6px;background:#FAFAFA;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;color:#888;}
.kc-abtn:hover{border-color:#0000FF;color:#0000FF;}
.kc-font-scale{display:flex;align-items:center;gap:2px;border:1.5px solid #E5E5E5;border-radius:6px;overflow:hidden;background:#FAFAFA;}
.kc-fs-btn{width:24px;height:26px;border:none;background:transparent;cursor:pointer;font-size:14px;font-weight:700;color:#888;display:flex;align-items:center;justify-content:center;transition:all .15s;font-family:inherit;}
.kc-fs-btn:hover{color:#0000FF;background:#F0F0FF;}
.kc-fs-val{font-size:10px;font-weight:600;color:#666;min-width:28px;text-align:center;font-family:'IBM Plex Sans Arabic',monospace;}

/* Edit Panel */
.kc-edit{padding:14px;border-top:1px solid #F0F0F0;display:flex;flex-direction:column;gap:8px;background:#FAFAFA;}
.kc-edit-author-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px;}
.kc-edit-tog{padding:4px 10px;border:1.5px solid #E0E0E0;border-radius:6px;background:#FFF;font-family:inherit;font-size:11px;font-weight:600;color:#999;cursor:pointer;transition:all .15s;}
.kc-edit-tog:hover{border-color:#BBB;}
.kc-edit-tog.on{border-color:#0000FF;color:#0000FF;background:#F0F0FF;}
.kc-edit-l{font-size:12px;font-weight:600;color:#666;}
.kc-edit-i{padding:8px 12px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:13px;outline:none;background:#FFF;}
.kc-edit-i:focus{border-color:#0000FF;}
.kc-edit-ta{padding:8px 12px;border:1.5px solid #E0E0E0;border-radius:8px;font-family:inherit;font-size:13px;outline:none;resize:vertical;background:#FFF;line-height:1.6;}
.kc-edit-ta:focus{border-color:#0000FF;}

@container (min-width:500px){
  .kc{padding:24px 20px;}
  .kc-head{padding:40px 0 44px;}
  .kc-head-t{font-size:36px;margin-bottom:8px;}
  .kc-head-s{font-size:17px;max-width:400px;}
  .kc-logo{gap:10px;}
  .kc-geo-1{width:48px;height:48px;}
  .kc-geo-2{width:40px;height:40px;}
  .kc-geo-3{width:44px;height:44px;}
  .kc-geo-4{width:36px;height:36px;}
  .kc-ta-wrap{border-radius:14px;}
  .kc-ta{min-height:180px;padding:18px;font-size:16px;}
  .kc-ta-foot{padding:8px 18px;}
  .kc-ta-step{width:26px;height:26px;font-size:16px;border-radius:6px;}
  .kc-ta-count{font-size:13px;}
  .kc-cfg{margin-top:24px;gap:22px;}
  .kc-lbl{font-size:15px;}
  .kc-hint{font-size:13px;}
  .kc-tmpls{grid-template-columns:repeat(6,1fr);gap:12px;}
  .kc-tmpls-row{gap:6px;}
  .kc-tmpls-arr{width:28px;height:28px;border-radius:6px;}
  .kc-tmpls-arr svg{width:14px;height:14px;}
  .kc-tmpls-scroll{gap:8px;}
  .kc-tmpls-scroll .kc-tmpl{width:auto;min-width:60px;max-width:72px;}
  .kc-tmpl{border-width:2.5px;border-radius:10px;gap:2px;}
  .kc-tmpl-pv{border-radius:8px;}
  .kc-tmpl-shape{width:55%;height:55%;}
  .kc-tmpl-n{font-size:11px;padding-bottom:3px;}
  .kc-stepper{gap:14px;}
  .kc-step-btn{width:40px;height:40px;font-size:20px;border-radius:8px;}
  .kc-step-val{font-size:22px;}
  .kc-customize-row{gap:10px;}
  .kc-clr-w{padding:6px 12px 6px 6px;border-radius:999px;}
  .kc-clr-sw{width:30px;height:30px;border-radius:8px;}
  .kc-clr-l2{font-size:12px;}
  .kc-font-dd{padding:8px 12px;font-size:13px;border-radius:999px;}
  .kc-fonts{grid-template-columns:repeat(4,1fr);gap:10px;}
  .kc-ft{padding:16px 10px 12px;border-radius:14px;gap:8px;}
  .kc-ft-pv{font-size:17px;min-height:48px;}
  .kc-ft-n{font-size:11px;}
  .kc-pv{max-width:300px;padding:24px;border-radius:16px;}
  .kc-pv-h{font-size:20px;}
  .kc-pv-logo{width:64px;bottom:14px;right:14px;}
  .kc-author{padding:12px 16px;font-size:15px;border-radius:999px;}
  .kc-go{padding:16px;font-size:17px;border-radius:999px;margin-top:24px;}
  .kc-gs-1{width:12px;height:12px;}
  .kc-gs-2{width:10px;height:10px;}
  .kc-gs-3{width:11px;height:11px;}
  .kc-remain{font-size:13px;margin-top:10px;}
  .kc-err{font-size:14px;padding:12px 16px;}
  .kc-res-top{margin-bottom:20px;gap:14px;}
  .kc-res-title{font-size:18px;}
  .kc-res-tmpls{gap:8px;}
  .kc-res-tmpl{border-radius:10px;border-width:2.5px;gap:4px;}
  .kc-res-tmpl-pv{width:68px;height:68px;border-radius:9px;}
  .kc-res-tmpl-pv svg{width:55%;height:55%;}
  .kc-res-tmpl-n{font-size:10px;padding-bottom:5px;}
  .kc-tools-tog{padding:10px 18px;font-size:14px;border-radius:999px;}
  .kc-tools-panel{padding:18px;gap:14px;border-radius:16px;}
  .kc-res-cpick{gap:14px;}
  .kc-res-cp{padding:5px 12px 5px 5px;border-radius:999px;}
  .kc-res-cp-sw{width:26px;height:26px;border-radius:7px;}
  .kc-res-cp-l{font-size:12px;}
  .kc-res-font{padding:8px 12px;font-size:13px;border-radius:999px;}
  .kc-dl-all{padding:10px 18px;font-size:14px;border-radius:999px;}
  .kc-dl-pdf{padding:10px 18px;font-size:14px;border-radius:999px;}
  .kc-back{padding:10px 18px;font-size:14px;border-radius:999px;}
  .kc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;overflow-x:visible;scroll-snap-type:none;padding-bottom:0;}
  .kc-grid>.kc-card{min-width:0;max-width:none;}
  .kc-add-card{min-width:0;max-width:none;border-radius:18px;font-size:14px;}
  .kc-card{border-radius:18px;}
  .kc-card-pv{padding:28px;}
  .kc-card-pv.has-cover-img .kc-card-logo{bottom:12px;right:12px;width:60px;}
  .kc-cv-text{padding:10px 14px;}
  .cl-minimal .kc-cv-img{width:55%;border-radius:14px;}
  .cl-minimal .kc-cv-img img{border-radius:14px;}
  .kc-card-c.layout-title .kc-card-h{font-size:22px;}
  .kc-card-c.layout-title-body .kc-card-h{font-size:18px;}
  .kc-card-c.layout-title-body .kc-card-b{font-size:14px;}
  .kc-card-c.layout-body .kc-card-b.body-only{font-size:16px;}
  .kc-card-logo{width:80px;bottom:16px;right:16px;}
  .kc-card-author{font-size:11px;top:14px;}
  .kc-acts{padding:12px 16px;}
  .kc-lay-sel{padding:8px 12px;font-size:13px;border-radius:999px;}
  .kc-abtn{width:36px;height:32px;border-radius:6px;}
  .kc-edit{padding:16px;}
  .kc-edit-l{font-size:13px;}
  .kc-edit-i{padding:10px 14px;font-size:14px;border-radius:10px;}
  .kc-edit-ta{padding:10px 14px;font-size:14px;border-radius:10px;}
  .ktk-pw-card{padding:40px 32px;border-radius:24px;max-width:420px;}
  .ktk-pw-h{font-size:22px;}
  .ktk-pw-sub{font-size:14px;}
  .ktk-pw-features{padding:20px;}
  .ktk-pw-f{font-size:14px;}
  .ktk-pw-btn{padding:16px;font-size:16px;border-radius:16px;}
  .ktk-pw-app{padding:14px;font-size:14px;border-radius:14px;}
  .kc-trial{margin-top:14px;gap:16px;}
  .kc-trial-bar{height:5px;}
  .kc-trial-t{font-size:12px;}
  .kc-trial-btn{padding:7px 20px;font-size:12px;border-radius:999px;}
  .kc-load-card{padding:28px 28px 24px;}
}

/* ═══ KITABH TOOLS KIT — Paywall + Journey ═══ */

/* Paywall overlay */
.ktk-paywall{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.4);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:ktk-fadein .25s ease;}
@keyframes ktk-fadein{from{opacity:0}to{opacity:1}}
@keyframes ktk-slideup{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.ktk-pw-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border:none;background:#F2F2F2;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#666;transition:all .2s;}
.ktk-pw-close:hover{background:#E5E5E5;color:#333;}
.ktk-pw-icon{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:12px;}
.ktk-pw-card{position:relative;background:#FFF;border-radius:20px;padding:32px 20px 24px;box-shadow:0 8px 40px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.05);max-width:380px;width:100%;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl;animation:ktk-slideup .3s ease;}
.ktk-pw-h{font-size:19px;font-weight:700;color:#111;}
.ktk-pw-sub{font-size:12px;color:#64748B;line-height:1.6;margin-bottom:4px;}
.ktk-pw-meter{width:100%;margin:8px 0;}
.ktk-pw-meter-bar{height:6px;background:#E2E8F0;border-radius:3px;overflow:hidden;margin-bottom:6px;}
.ktk-pw-meter-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#F59E0B,#EF4444);transition:width .4s;}
.ktk-pw-meter-text{font-size:11px;font-weight:600;color:#94A3B8;}
.ktk-pw-features{display:flex;flex-direction:column;gap:8px;width:100%;text-align:right;margin:12px 0 16px;padding:14px;background:#F8FAFC;border-radius:12px;}
.ktk-pw-f{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;color:#334155;}
.ktk-pw-btn{display:block;width:100%;padding:13px;background:linear-gradient(135deg,#0000FF,#2222FF);color:#FFF;font-family:inherit;font-size:15px;font-weight:700;text-decoration:none;border-radius:14px;text-align:center;transition:all .25s;box-shadow:0 4px 14px rgba(0,0,255,.25);}
.ktk-pw-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,255,.35);}
.ktk-pw-app{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:11px;background:#FFF;color:#334155;font-family:inherit;font-size:12px;font-weight:600;text-decoration:none;border-radius:12px;border:1.5px solid #E2E8F0;margin-top:8px;transition:all .2s;text-align:center;}
.ktk-pw-app:hover{border-color:#0000FF;color:#0000FF;}
.ktk-pw-proof{font-size:10px;color:#94A3B8;margin-top:10px;}

/* Sign-in popup */
.kc-signin-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.4);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:ktk-fadein .25s ease;}
.kc-signin-card{position:relative;background:#FFF;border-radius:20px;padding:32px 24px 24px;box-shadow:0 8px 40px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.05);max-width:360px;width:100%;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl;animation:ktk-slideup .3s ease;}
.kc-signin-shapes{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:4px;}
.kc-signin-h{font-size:18px;font-weight:700;color:#111;line-height:1.5;}
.kc-signin-form{display:flex;flex-direction:column;gap:12px;width:100%;}
.kc-signin-input{width:100%;padding:14px 16px;border:2px solid #E5E5E5;border-radius:12px;font-family:inherit;font-size:15px;text-align:center;outline:none;transition:border-color .2s;direction:rtl;color:#333;}
.kc-signin-input:focus{border-color:#0000FF;}
.kc-signin-input::placeholder{color:#BABABA;}
.kc-signin-btn{width:100%;padding:14px;background:#0000FF;color:#FFF;font-family:inherit;font-size:16px;font-weight:700;border:none;border-radius:12px;cursor:pointer;transition:opacity .15s;}
.kc-signin-btn:hover{opacity:.9;}
.kc-signin-proof{font-size:11px;color:#94A3B8;margin-top:4px;}

/* Trial usage bar */
.kc-trial{display:flex;align-items:center;gap:12px;margin-top:18px;direction:rtl;}
.kc-trial-info{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0;}
.kc-trial-bar{height:4px;background:#E5E5E5;border-radius:2px;overflow:hidden;width:100%;}
.kc-trial-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#0000FF,#4361EE);transition:width .4s ease;}
.kc-trial-t{font-size:10px;font-weight:600;color:#999;}
.kc-trial-btn{display:inline-flex;align-items:center;justify-content:center;padding:6px 16px;border:none;border-radius:999px;background:#E82222;color:#FFF;font-family:'IBM Plex Sans Arabic',sans-serif;font-size:11px;font-weight:600;text-decoration:none;white-space:nowrap;transition:transform .2s,box-shadow .2s,background .2s;box-shadow:none;flex-shrink:0;opacity:.85;}
.kc-trial-btn:hover{transform:translateY(-1px);box-shadow:0 2px 10px rgba(232,34,34,.25);background:#D41E1E;opacity:1;}
.kc-trial-btn:focus-visible{outline:2px solid #E82222;outline-offset:2px;}
.kc-trial-res{margin-top:20px;}
`
