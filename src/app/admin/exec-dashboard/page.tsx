'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler)

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface Data {
  overview: {
    totalPosts: number; allTimeViews: number; periodPosts: number; prevPeriodPosts: number
    periodViews: number; prevPeriodViews: number; totalAuthors: number; totalCategories: number
    avgViews: number; velocity: string
  }
  writers: Array<{ id: number; name: string; avatar: string | null; role: string; posts: number; views: number; avgViews: number; topCategories: string[] }>
  writerTrends: Array<{ id: number; name: string; data: Array<{ month: string; count: number }> }>
  writerMonths: string[]
  categories: Array<{ name: string; count: number; views: number; avgViews: number }>
  viewsDistribution: Array<{ range: string; count: number }>
  recentPosts: any[]; topContent: any[]
  publishingTrend: Array<{ date: string; count: number; views: number }>
  monthlyTrend: Array<{ month: string; count: number; views: number }>
  dayOfWeek: Array<{ name: string; count: number }>
  hourDistribution: Array<{ hour: number; count: number }>
  social: { youtube: any[]; x: any[]; facebook: any[] }
  seo: {
    overview: { rank: number; organicKeywords: number; organicTraffic: number; organicCost: number; adwordsKeywords: number; adwordsTraffic: number } | null
    keywords: Array<{ keyword: string; position: number; previousPosition: number; searchVolume: number; cpc: number; url: string; trafficPct: number; competition: number }>
    competitors: Array<{ domain: string; relevance: number; commonKeywords: number; organicKeywords: number; organicTraffic: number }>
  } | null
  range: string; days: number; timestamp: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const RANGES = [{ k: '7d', l: '7D' }, { k: '28d', l: '28D' }, { k: '90d', l: '90D' }, { k: '1y', l: '1Y' }]
const P = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#db2777','#4f46e5','#0d9488','#ea580c','#6366f1','#84cc16']
const TABS = ['Overview','Writers','Social Media','Content Analytics','SEO']

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
const fN = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1).replace(/\.0$/,'')+'M' : n >= 1e3 ? (n/1e3).toFixed(1).replace(/\.0$/,'')+'K' : n.toLocaleString()
const pct = (c: number, p: number) => { if (p === 0) return { v: c > 0 ? '+100%' : '0%', up: c > 0 }; const x = ((c-p)/p)*100; return { v: (x>=0?'+':'')+x.toFixed(1)+'%', up: x >= 0 } }
const fD = (d: string) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})
const fDF = (d: string) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
const fM = (m: string) => { const [y,mo] = m.split('-'); return new Date(+y, +mo-1).toLocaleDateString('en-US',{month:'short',year:'2-digit'}) }
const tAgo = (t: number) => { const s = Math.floor((Date.now()-t)/1000); return s<60?'just now':s<3600?Math.floor(s/60)+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago' }

// ═══════════════════════════════════════════════════════════════════════════════
// CHART OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const cf = { family: "'Inter',-apple-system,sans-serif" }
const tt: any = { backgroundColor:'#fff',titleColor:'#1e293b',bodyColor:'#475569',borderColor:'#e2e8f0',borderWidth:1,cornerRadius:8,padding:10,bodyFont:cf,titleFont:{...cf,weight:'bold' as const},boxPadding:4 }
const grd = { color:'#f1f5f9' }
const tk: any = { color:'#94a3b8',font:{size:10,...cf} }
const lOpts = (noLegend = false): any => ({
  responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
  plugins:{legend:{display:!noLegend,labels:{color:'#64748b',font:{size:10,...cf},boxWidth:10,padding:12}},tooltip:tt},
  scales:{x:{ticks:{...tk,maxRotation:0,maxTicksLimit:12},grid:grd,border:{display:false}},y:{ticks:tk,grid:grd,border:{display:false},beginAtZero:true}}
})
const bOpts = (h=false,noLeg=false): any => {const o=lOpts(noLeg);if(h)o.indexAxis='y';return o}
const dOpts = (pos='right'): any => ({responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{position:pos,labels:{color:'#64748b',font:{size:10,...cf},boxWidth:10,padding:6}},tooltip:tt}})

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const Card = ({children,className='',title=''}:{children:React.ReactNode;className?:string;title?:string}) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${className}`} style={{padding:title?0:16}}>
    {title && <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h3></div>}
    {title ? <div className="p-4">{children}</div> : children}
  </div>
)

function MiniKPI({label,value,sub,change,color,icon}:{label:string;value:string;sub?:string;change?:{v:string;up:boolean};color:string;icon:React.ReactNode}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(90deg,${color},${color}40)`}} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{label}</p>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5 tabular-nums leading-tight">{value}</p>
          {sub && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{sub}</p>}
          {change && <span className={`text-[10px] font-bold ${change.up?'text-emerald-600':'text-red-500'}`}>{change.up?'▲':'▼'} {change.v}</span>}
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor:color+'10',color}}>{icon}</div>
      </div>
    </div>
  )
}

function ProgressBar({label,value,max,color}:{label:string;value:number;max:number;color:string}) {
  const pct = max > 0 ? Math.min(100, (value/max)*100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-24 truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${pct}%`,backgroundColor:color}} /></div>
      <span className="text-xs font-bold text-slate-600 tabular-nums w-12 text-right">{fN(value)}</span>
    </div>
  )
}

function StatRow({label,value,color}:{label:string;value:string;color?:string}) {
  return <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0"><span className="text-xs text-slate-500">{label}</span><span className="text-xs font-bold tabular-nums" style={{color:color||'#1e293b'}}>{value}</span></div>
}

function Badge({text,color='#2563eb'}:{text:string;color?:string}) {
  return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{backgroundColor:color+'15',color}}>{text}</span>
}

const Skeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">{[...Array(8)].map((_,i)=><div key={i} className="h-24 bg-slate-100 rounded-xl"/>)}</div>
    <div className="grid lg:grid-cols-3 gap-3">{[...Array(3)].map((_,i)=><div key={i} className="h-64 bg-slate-100 rounded-xl"/>)}</div>
  </div>
)

// ── Icons ─────────────────────────────────────────────────────────────────────
const I = {
  doc:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
  eye:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  ppl:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  tag:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/></svg>,
  clk:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  zap:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>,
  bar:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
  star:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  ref:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>,
  yt:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  x:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  fb:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  globe:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function ExecDashboard() {
  const [data, setData] = useState<Data|null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('28d')
  const [tab, setTab] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent=false) => {
    if(!silent) setLoading(true); else setRefreshing(true)
    try { const r = await fetch(`/api/exec-dashboard?range=${range}`); setData(await r.json()) }
    catch(e){ console.error(e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [range])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Exec Dashboard</h1>
          <p className="text-xs text-slate-400">SportsMockery Editorial & Social Performance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white overflow-hidden">
            {RANGES.map(r=><button key={r.k} onClick={()=>setRange(r.k)} className="px-3 py-1.5 text-[11px] font-bold transition-colors" style={{backgroundColor:range===r.k?'#2563eb':'transparent',color:range===r.k?'#fff':'#94a3b8'}}>{r.l}</button>)}
          </div>
          <button onClick={()=>load(true)} disabled={refreshing} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white text-slate-400 hover:bg-slate-50">
            <span className={refreshing?'animate-spin inline-flex':'inline-flex'}>{I.ref}</span>
          </button>
          {data?.timestamp && <span className="text-[10px] text-slate-300 tabular-nums">{tAgo(data.timestamp)}</span>}
        </div>
      </div>

      {loading ? <Skeleton/> : data ? <>
        {/* ═══ KPI STRIP ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <MiniKPI label="Total Posts" value={fN(data.overview.totalPosts)} sub="all time" color="#2563eb" icon={I.doc} />
          <MiniKPI label="Period Posts" value={String(data.overview.periodPosts)} change={pct(data.overview.periodPosts,data.overview.prevPeriodPosts)} color="#4f46e5" icon={I.doc} />
          <MiniKPI label="All-Time Views" value={fN(data.overview.allTimeViews)} color="#7c3aed" icon={I.eye} />
          <MiniKPI label="Period Views" value={fN(data.overview.periodViews)} change={pct(data.overview.periodViews,data.overview.prevPeriodViews)} color="#8b5cf6" icon={I.eye} />
          <MiniKPI label="Writers" value={String(data.overview.totalAuthors)} sub={`${data.writers.length} active`} color="#059669" icon={I.ppl} />
          <MiniKPI label="Velocity" value={`${data.overview.velocity}/wk`} sub="posts per week" color="#d97706" icon={I.zap} />
          <MiniKPI label="Avg Views" value={fN(data.overview.avgViews)} sub="per article" color="#0891b2" icon={I.bar} />
          <MiniKPI label="Categories" value={String(data.overview.totalCategories)} sub="active" color="#dc2626" icon={I.tag} />
        </div>

        {/* ═══ TABS ═══ */}
        <div className="flex border-b border-slate-200 gap-0 overflow-x-auto">
          {TABS.map((t,i)=><button key={t} onClick={()=>setTab(i)} className="px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors" style={{color:tab===i?'#2563eb':'#94a3b8',borderBottom:tab===i?'2px solid #2563eb':'2px solid transparent',marginBottom:'-1px'}}>{t}</button>)}
        </div>

        {/* ═══ TAB PANELS ═══ */}
        {tab === 0 && <OverviewPanel d={data} />}
        {tab === 1 && <WritersPanel d={data} />}
        {tab === 2 && <SocialPanel d={data} />}
        {tab === 3 && <ContentPanel d={data} />}
        {tab === 4 && <SEOPanel d={data} />}
      </> : <Card><p className="text-center py-12 text-slate-400">Failed to load.</p></Card>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewPanel({d}:{d:Data}) {
  const t = d.publishingTrend
  return <div className="space-y-4">
    {/* Row 1: Traffic + Monthly + Category donut */}
    <div className="grid lg:grid-cols-12 gap-4">
      <Card title="Traffic Trends" className="lg:col-span-5"><div style={{height:240}}>
        <Line data={{labels:t.map(x=>fD(x.date)),datasets:[
          {label:'Views',data:t.map(x=>x.views),borderColor:'#2563eb',backgroundColor:'rgba(37,99,235,0.06)',fill:true,tension:.35,pointRadius:t.length>30?0:2,borderWidth:2},
          {label:'Posts',data:t.map(x=>x.count),borderColor:'#d97706',backgroundColor:'transparent',tension:.35,pointRadius:0,borderWidth:1.5,borderDash:[4,3]},
        ]}} options={lOpts()} />
      </div></Card>
      <Card title="Monthly Publishing" className="lg:col-span-4"><div style={{height:240}}>
        <Bar data={{labels:d.monthlyTrend.map(x=>fM(x.month)),datasets:[
          {label:'Posts',data:d.monthlyTrend.map(x=>x.count),backgroundColor:'rgba(37,99,235,0.7)',borderRadius:3},
          {label:'Views',data:d.monthlyTrend.map(x=>x.views),backgroundColor:'rgba(124,58,237,0.5)',borderRadius:3},
        ]}} options={bOpts()} />
      </div></Card>
      <Card title="Categories" className="lg:col-span-3"><div style={{height:240}}>
        <Doughnut data={{labels:d.categories.slice(0,8).map(c=>c.name),datasets:[{data:d.categories.slice(0,8).map(c=>c.count),backgroundColor:P.slice(0,8),borderColor:'#fff',borderWidth:2}]}} options={dOpts('bottom')} />
      </div></Card>
    </div>

    {/* Row 2: Day of week + Hour heatmap + Category bars */}
    <div className="grid lg:grid-cols-12 gap-4">
      <Card title="Day of Week" className="lg:col-span-3"><div style={{height:200}}>
        <Bar data={{labels:d.dayOfWeek.map(x=>x.name),datasets:[{data:d.dayOfWeek.map(x=>x.count),backgroundColor:d.dayOfWeek.map((_,i)=>P[i%P.length]+'99'),borderRadius:4}]}} options={bOpts(false,true)} />
      </div></Card>
      <Card title="Publishing Hours (UTC)" className="lg:col-span-5">
        <div className="grid grid-cols-12 gap-1" style={{height:200}}>
          {d.hourDistribution.map((h,i)=>{
            const max = Math.max(...d.hourDistribution.map(x=>x.count),1)
            const intensity = h.count/max
            return <div key={i} className="flex flex-col items-center justify-end gap-1">
              <div className="w-full rounded-sm transition-all" style={{height:`${Math.max(4,intensity*160)}px`,backgroundColor:`rgba(37,99,235,${0.15+intensity*0.7})`}} title={`${h.hour}:00 — ${h.count} posts`}/>
              <span className="text-[8px] text-slate-400 tabular-nums">{h.hour}</span>
            </div>
          })}
        </div>
      </Card>
      <Card title="Category Performance" className="lg:col-span-4">
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
          {d.categories.slice(0,10).map((c,i)=><ProgressBar key={c.name} label={c.name} value={c.count} max={d.categories[0]?.count||1} color={P[i%P.length]} />)}
        </div>
      </Card>
    </div>

    {/* Row 3: Top writers bar + Views distribution */}
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Top Writers (by Views)"><div style={{height:220}}>
        <Bar data={{labels:d.writers.slice(0,8).map(w=>w.name.split(' ')[0]),datasets:[{data:d.writers.slice(0,8).map(w=>w.views),backgroundColor:P.slice(0,8).map(c=>c+'cc'),borderColor:P.slice(0,8),borderWidth:1,borderRadius:4}]}} options={{...bOpts(true,true)}} />
      </div></Card>
      {d.viewsDistribution?.length > 0 && <Card title="Views Distribution"><div style={{height:220}}>
        <Bar data={{labels:d.viewsDistribution.map(x=>x.range),datasets:[{data:d.viewsDistribution.map(x=>x.count),backgroundColor:['#94a3b8cc','#06b6d4cc','#2563ebcc','#7c3aedcc','#059669cc','#d97706cc'],borderRadius:4}]}} options={bOpts(false,true)} />
      </div></Card>}
    </div>

    {/* Row 4: Recent articles + Quick stats sidebar */}
    <div className="grid lg:grid-cols-12 gap-4">
      <Card title="Recent Articles" className="lg:col-span-8">
        <div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-slate-100">{['Title','Author','Category','Views','Date'].map(h=><th key={h} className="text-left px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
          <tbody>{d.recentPosts.slice(0,8).map(p=><tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="px-2 py-2"><span className="text-xs font-medium text-slate-700 truncate block max-w-[280px]">{p.title}</span></td>
            <td className="px-2 py-2 text-[11px] text-slate-500">{p.author_name}</td>
            <td className="px-2 py-2"><Badge text={p.category_name} /></td>
            <td className="px-2 py-2 text-[11px] font-bold text-slate-700 tabular-nums">{fN(p.views||0)}</td>
            <td className="px-2 py-2 text-[10px] text-slate-400 tabular-nums">{fD(p.published_at)}</td>
          </tr>)}</tbody>
        </table></div>
      </Card>
      <div className="lg:col-span-4 space-y-4">
        <Card title="Top Writers (Posts)"><div style={{height:160}}>
          <Bar data={{labels:d.writers.slice(0,6).map(w=>w.name.split(' ')[0]),datasets:[{data:d.writers.slice(0,6).map(w=>w.posts),backgroundColor:P.slice(0,6).map(c=>c+'cc'),borderRadius:3}]}} options={bOpts(true,true)} />
        </div></Card>
        <Card title="Writer Count by Posts">
          <div className="space-y-2">
            {d.writers.slice(0,6).map((w,i)=><ProgressBar key={w.id} label={w.name.split(' ')[0]} value={w.views} max={d.writers[0]?.views||1} color={P[i%P.length]} />)}
          </div>
        </Card>
      </div>
    </div>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITERS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function WritersPanel({d}:{d:Data}) {
  const [sort, setSort] = useState<'views'|'posts'|'avgViews'>('views')
  const sorted = [...d.writers].sort((a,b)=>b[sort]-a[sort])
  const maxVal = Math.max(...d.writers.map(w=>sort==='views'?w.views:sort==='avgViews'?w.avgViews:w.posts),1)

  return <div className="space-y-4">
    {/* Writer scorecards */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {sorted.slice(0,8).map((w,i)=>(
        <div key={w.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:P[i%P.length]}} />
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              {w.avatar ? <img src={w.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100"/> : <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{backgroundColor:P[i%P.length]}}>{w.name.charAt(0)}</div>}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{backgroundColor:i<3?'#d97706':'#94a3b8'}}>
                {i+1}
              </div>
            </div>
            <div className="min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{w.name}</p><p className="text-[10px] text-slate-400 capitalize">{w.role||'author'}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div><p className="text-[10px] text-slate-400">Posts</p><p className="text-sm font-extrabold text-slate-800">{w.posts}</p></div>
            <div><p className="text-[10px] text-slate-400">Views</p><p className="text-sm font-extrabold" style={{color:P[0]}}>{fN(w.views)}</p></div>
            <div><p className="text-[10px] text-slate-400">Avg</p><p className="text-sm font-extrabold" style={{color:P[1]}}>{fN(w.avgViews)}</p></div>
          </div>
          {/* Views bar */}
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${((sort==='views'?w.views:sort==='avgViews'?w.avgViews:w.posts)/maxVal)*100}%`,backgroundColor:P[i%P.length]}}/></div>
          {w.topCategories.length > 0 && <div className="flex gap-1 mt-2 flex-wrap">{w.topCategories.map(c=><Badge key={c} text={c} color={P[(i+1)%P.length]}/>)}</div>}
        </div>
      ))}
    </div>

    {/* Writer trends chart */}
    {d.writerTrends.length > 0 && <Card title="Top 5 Writer Publishing Trends (12 months)"><div style={{height:280}}>
      <Line data={{labels:d.writerMonths.map(fM),datasets:d.writerTrends.map((w,i)=>({
        label:w.name,data:w.data.map(x=>x.count),borderColor:P[i],backgroundColor:'transparent',tension:.35,borderWidth:2,pointRadius:0,
      }))}} options={lOpts()} />
    </div></Card>}

    {/* Full leaderboard */}
    <Card title="Full Leaderboard">
      <div className="flex gap-1 mb-3">
        {(['views','posts','avgViews'] as const).map(s=><button key={s} onClick={()=>setSort(s)} className="px-2 py-1 rounded text-[10px] font-bold transition-colors" style={{backgroundColor:sort===s?'#2563eb':'transparent',color:sort===s?'#fff':'#94a3b8'}}>{s==='avgViews'?'Avg Views':s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
      </div>
      <div className="overflow-x-auto"><table className="w-full">
        <thead><tr className="border-b border-slate-100">{['#','Writer','Posts','Views','Avg Views/Post','Categories'].map(h=><th key={h} className="text-left px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
        <tbody>{sorted.map((w,i)=><tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50/50">
          <td className="px-2 py-2"><span className="text-xs font-bold tabular-nums" style={{color:i===0?'#d97706':i===1?'#94a3b8':i===2?'#b45309':'#cbd5e1'}}>{i+1}</span></td>
          <td className="px-2 py-2"><div className="flex items-center gap-2">{w.avatar?<img src={w.avatar} alt="" className="w-6 h-6 rounded-full"/>:<div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{backgroundColor:P[i%P.length]}}>{w.name.charAt(0)}</div>}<span className="text-xs font-semibold text-slate-700">{w.name}</span></div></td>
          <td className="px-2 py-2 text-xs font-semibold text-slate-700 tabular-nums">{w.posts}</td>
          <td className="px-2 py-2 text-xs font-bold tabular-nums" style={{color:'#2563eb'}}>{fN(w.views)}</td>
          <td className="px-2 py-2 text-xs font-bold tabular-nums" style={{color:'#7c3aed'}}>{fN(w.avgViews)}</td>
          <td className="px-2 py-2"><div className="flex gap-1 flex-wrap">{w.topCategories.map(c=><Badge key={c} text={c} color={P[(i+2)%P.length]}/>)}</div></td>
        </tr>)}</tbody>
      </table></div>
    </Card>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function SocialPanel({d}:{d:Data}) {
  const {youtube:yt,x,facebook:fb} = d.social
  const ytT = yt.reduce((s,c)=>s+c.subscribers,0), ytV = yt.reduce((s,c)=>s+c.totalViews,0)
  const xT = x.reduce((s,c)=>s+c.followers,0), xTw = x.reduce((s,c)=>s+c.tweets,0)
  const fbT = fb.filter(p=>!p.needsToken).reduce((s,c)=>s+c.followers,0)
  const total = ytT+xT+fbT

  return <div className="space-y-4">
    {/* Platform summary */}
    <div className="grid lg:grid-cols-4 gap-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Audience</p>
        <p className="text-3xl font-extrabold text-slate-800 tabular-nums">{fN(total)}</p>
        <p className="text-xs text-slate-400 mt-1">across all platforms</p>
        <div className="flex gap-1 mt-3 h-2 rounded-full overflow-hidden bg-slate-100">
          {total>0 && <><div style={{width:`${(ytT/total)*100}%`,backgroundColor:'#dc2626'}}/><div style={{width:`${(xT/total)*100}%`,backgroundColor:'#0f172a'}}/><div style={{width:`${(fbT/total)*100}%`,backgroundColor:'#1877f2'}}/></>}
        </div>
        <div className="flex gap-3 mt-2">{[{c:'#dc2626',l:'YouTube'},{c:'#0f172a',l:'X'},{c:'#1877f2',l:'Facebook'}].map(p=><span key={p.l} className="flex items-center gap-1 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-full" style={{backgroundColor:p.c}}/>{p.l}</span>)}</div>
      </div>
      {/* YouTube */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{backgroundColor:'#dc2626'}}/>
        <div className="flex items-center gap-2 mb-2"><span style={{color:'#dc2626'}}>{I.yt}</span><span className="text-xs font-bold text-slate-600">YouTube</span></div>
        <StatRow label="Subscribers" value={fN(ytT)} color="#dc2626"/>
        <StatRow label="Total Views" value={fN(ytV)} color="#7c3aed"/>
        <StatRow label="Channels" value={String(yt.length)}/>
        <StatRow label="Total Videos" value={fN(yt.reduce((s,c)=>s+c.videoCount,0))}/>
      </div>
      {/* X */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{backgroundColor:'#0f172a'}}/>
        <div className="flex items-center gap-2 mb-2"><span style={{color:'#0f172a'}}>{I.x}</span><span className="text-xs font-bold text-slate-600">X / Twitter</span></div>
        <StatRow label="Followers" value={fN(xT)} color="#0f172a"/>
        <StatRow label="Total Posts" value={fN(xTw)} color="#64748b"/>
        <StatRow label="Accounts" value={String(x.length)}/>
        <StatRow label="Listed" value={fN(x.reduce((s,c)=>s+c.listed,0))}/>
      </div>
      {/* Facebook */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{backgroundColor:'#1877f2'}}/>
        <div className="flex items-center gap-2 mb-2"><span style={{color:'#1877f2'}}>{I.fb}</span><span className="text-xs font-bold text-slate-600">Facebook</span></div>
        <StatRow label="Followers" value={fN(fbT)} color="#1877f2"/>
        <StatRow label="Page Likes" value={fN(fb.filter(p=>!p.needsToken).reduce((s,c)=>s+c.likes,0))} color="#4f46e5"/>
        <StatRow label="Pages" value={String(fb.length)}/>
        <StatRow label="Connected" value={`${fb.filter(p=>!p.needsToken).length}/${fb.length}`}/>
      </div>
    </div>

    {/* YouTube channels */}
    <div><div className="flex items-center gap-2 mb-3"><span style={{color:'#dc2626'}}>{I.yt}</span><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">YouTube Channels</h3></div>
      {yt.length>0 ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {yt.map((ch,i)=><div key={ch.handle} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500"/>
          <div className="flex items-center gap-3 mb-3">{ch.thumbnail?<img src={ch.thumbnail} alt="" className="w-10 h-10 rounded-full border-2 border-slate-100"/>:<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center" style={{color:'#dc2626'}}>{I.yt}</div>}
            <div><p className="text-sm font-bold text-slate-800">{ch.name}</p><p className="text-[10px] text-slate-400">@{ch.handle}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><p className="text-[9px] text-slate-400">Subs</p><p className="text-sm font-extrabold tabular-nums" style={{color:'#dc2626'}}>{fN(ch.subscribers)}</p></div>
            <div><p className="text-[9px] text-slate-400">Views</p><p className="text-sm font-extrabold tabular-nums" style={{color:'#7c3aed'}}>{fN(ch.totalViews)}</p></div>
            <div><p className="text-[9px] text-slate-400">Videos</p><p className="text-sm font-extrabold tabular-nums text-slate-600">{ch.videoCount}</p></div>
          </div>
        </div>)}
      </div> : <Card><p className="text-center py-4 text-slate-400 text-xs">YouTube data unavailable</p></Card>}
    </div>

    {/* X accounts */}
    <div><div className="flex items-center gap-2 mb-3"><span style={{color:'#0f172a'}}>{I.x}</span><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">X / Twitter Accounts</h3></div>
      {x.length>0 ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {x.map((a,i)=><div key={a.username} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-800"/>
          <div className="flex items-center gap-3 mb-3">{a.profileImage?<img src={a.profileImage} alt="" className="w-10 h-10 rounded-full border-2 border-slate-100"/>:<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">{I.x}</div>}
            <div><p className="text-sm font-bold text-slate-800">{a.name}</p><p className="text-[10px] text-slate-400">@{a.username}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><p className="text-[9px] text-slate-400">Followers</p><p className="text-sm font-extrabold tabular-nums text-slate-800">{fN(a.followers)}</p></div>
            <div><p className="text-[9px] text-slate-400">Posts</p><p className="text-sm font-extrabold tabular-nums text-slate-600">{fN(a.tweets)}</p></div>
            <div><p className="text-[9px] text-slate-400">Listed</p><p className="text-sm font-extrabold tabular-nums text-slate-500">{fN(a.listed)}</p></div>
          </div>
        </div>)}
      </div> : <Card><p className="text-center py-4 text-slate-400 text-xs">X data unavailable</p></Card>}
    </div>

    {/* Facebook */}
    <div><div className="flex items-center gap-2 mb-3"><span style={{color:'#1877f2'}}>{I.fb}</span><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Facebook Pages</h3></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fb.map(p=><div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{backgroundColor:'#1877f2'}}/>
          <div className="flex items-center gap-3 mb-3">{p.picture?<img src={p.picture} alt="" className="w-10 h-10 rounded-full border-2 border-slate-100"/>:<div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor:'#1877f210',color:'#1877f2'}}>{I.fb}</div>}
            <div><p className="text-sm font-bold text-slate-800">{p.name}</p>{p.needsToken && <p className="text-[9px] text-amber-500 font-semibold">Needs page token</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><p className="text-[9px] text-slate-400">Followers</p><p className="text-sm font-extrabold tabular-nums" style={{color:'#1877f2'}}>{p.needsToken?'—':fN(p.followers)}</p></div>
            <div><p className="text-[9px] text-slate-400">Likes</p><p className="text-sm font-extrabold tabular-nums" style={{color:'#4f46e5'}}>{p.needsToken?'—':fN(p.likes)}</p></div>
          </div>
        </div>)}
      </div>
    </div>

    {/* Charts */}
    {yt.length>0 && <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Subscriber Comparison"><div style={{height:260}}>
        <Bar data={{labels:yt.map(c=>c.label),datasets:[{data:yt.map(c=>c.subscribers),backgroundColor:['#dc2626cc','#f59e0bcc','#2563ebcc','#059669cc'],borderRadius:6}]}} options={bOpts(false,true)} />
      </div></Card>
      <Card title="Audience Distribution"><div style={{height:260}}>
        <Doughnut data={{labels:[...yt.map(c=>c.label+' (YT)'),...x.map(a=>a.label+' (X)')],datasets:[{data:[...yt.map(c=>c.subscribers),...x.map(a=>a.followers)],backgroundColor:P,borderColor:'#fff',borderWidth:2}]}} options={dOpts('right')} />
      </div></Card>
    </div>}
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT ANALYTICS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function ContentPanel({d}:{d:Data}) {
  return <div className="space-y-4">
    <div className="grid lg:grid-cols-12 gap-4">
      {/* Top content table */}
      <Card title="Top Performing Content" className="lg:col-span-8">
        <div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-slate-100">{['#','Title','Author','Category','Views','Date'].map(h=><th key={h} className="text-left px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
          <tbody>{d.topContent.map((p,i)=><tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="px-2 py-2"><span className="text-xs font-bold" style={{color:i<3?['#d97706','#94a3b8','#b45309'][i]:'#cbd5e1'}}>{i+1}</span></td>
            <td className="px-2 py-2"><span className="text-xs font-medium text-slate-700 truncate block max-w-[300px]">{p.title}</span></td>
            <td className="px-2 py-2 text-[11px] text-slate-500">{p.author_name}</td>
            <td className="px-2 py-2"><Badge text={p.category_name}/></td>
            <td className="px-2 py-2 text-xs font-bold tabular-nums" style={{color:'#059669'}}>{fN(p.views||0)}</td>
            <td className="px-2 py-2 text-[10px] text-slate-400 tabular-nums">{fD(p.published_at)}</td>
          </tr>)}</tbody>
        </table></div>
      </Card>

      {/* Category sidebar */}
      <div className="lg:col-span-4 space-y-4">
        <Card title="Category Breakdown">
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            {d.categories.slice(0,12).map((c,i)=><ProgressBar key={c.name} label={c.name} value={c.count} max={d.categories[0]?.count||1} color={P[i%P.length]}/>)}
          </div>
        </Card>
        {d.viewsDistribution?.length > 0 && <Card title="Views Distribution"><div style={{height:160}}>
          <Bar data={{labels:d.viewsDistribution.map(x=>x.range),datasets:[{data:d.viewsDistribution.map(x=>x.count),backgroundColor:['#94a3b8cc','#06b6d4cc','#2563ebcc','#7c3aedcc','#059669cc','#d97706cc'],borderRadius:3}]}} options={bOpts(false,true)} />
        </div></Card>}
      </div>
    </div>

    {/* Charts row */}
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Category Post Count"><div style={{height:240}}>
        <Bar data={{labels:d.categories.slice(0,8).map(c=>c.name),datasets:[{data:d.categories.slice(0,8).map(c=>c.count),backgroundColor:P.slice(0,8).map(c=>c+'cc'),borderRadius:4}]}} options={{...bOpts(true,true)}} />
      </div></Card>
      <Card title="Top Articles by Views"><div style={{height:240}}>
        <Bar data={{labels:d.topContent.slice(0,6).map(p=>(p.title||'').substring(0,30)+'...'),datasets:[{data:d.topContent.slice(0,6).map(p=>p.views||0),backgroundColor:P.slice(0,6).map(c=>c+'cc'),borderColor:P.slice(0,6),borderWidth:1,borderRadius:4}]}} options={bOpts(true,true)} />
      </div></Card>
    </div>

    {/* Activity feed */}
    <Card title="Recent Activity Feed">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {d.recentPosts.slice(0,12).map(p=><div key={p.id} className="flex items-start gap-2 py-2 px-3 rounded-lg bg-slate-50/50 border border-slate-100">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-blue-500"/>
          <div className="min-w-0"><p className="text-xs font-medium text-slate-700 truncate">{p.title}</p><p className="text-[10px] text-slate-400 mt-0.5">{p.author_name} · {fD(p.published_at)}{(p.views||0)>0 && <span className="font-semibold text-emerald-600 ml-1">{fN(p.views)} views</span>}</p></div>
        </div>)}
      </div>
    </Card>
  </div>
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEO PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function SEOPanel({d}:{d:Data}) {
  const seo = d.seo
  const ov = seo?.overview

  return <div className="space-y-4">
    {/* Row 1: Domain KPIs */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <MiniKPI label="SEMRush Rank" value={ov ? fN(ov.rank) : '—'} color="#2563eb" icon={I.globe} />
      <MiniKPI label="Organic Keywords" value={ov ? fN(ov.organicKeywords) : '—'} color="#059669" icon={I.bar} />
      <MiniKPI label="Organic Traffic" value={ov ? fN(ov.organicTraffic) : '—'} sub="monthly est." color="#7c3aed" icon={I.eye} />
      <MiniKPI label="Traffic Value" value={ov ? `$${fN(ov.organicCost)}` : '—'} sub="monthly est." color="#d97706" icon={I.star} />
      <MiniKPI label="Total Posts" value={fN(d.overview.totalPosts)} color="#4f46e5" icon={I.doc} />
      <MiniKPI label="Active Writers" value={String(d.overview.totalAuthors)} sub={`${d.writers.length} active`} color="#0891b2" icon={I.ppl} />
    </div>

    <div className="grid lg:grid-cols-12 gap-4">
      {/* Top Organic Keywords */}
      <Card title="Top Organic Keywords" className="lg:col-span-8">
        {seo?.keywords && seo.keywords.length > 0 ? <div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-slate-100">{['Keyword','Pos','Prev','Volume','Traffic %','URL'].map(h=><th key={h} className="text-left px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
          <tbody>{seo.keywords.map((kw,i)=>{
            const diff = kw.previousPosition - kw.position
            return <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="px-2 py-2 text-xs font-medium text-slate-700 max-w-[220px] truncate">{kw.keyword}</td>
              <td className="px-2 py-2"><span className="text-xs font-extrabold tabular-nums" style={{color:kw.position<=3?'#059669':kw.position<=10?'#2563eb':'#64748b'}}>{kw.position}</span></td>
              <td className="px-2 py-2"><span className="text-[11px] tabular-nums" style={{color:diff>0?'#059669':diff<0?'#dc2626':'#94a3b8'}}>{diff>0?`+${diff}`:diff<0?String(diff):'—'}</span></td>
              <td className="px-2 py-2 text-xs font-semibold text-slate-700 tabular-nums">{fN(kw.searchVolume)}</td>
              <td className="px-2 py-2 text-xs tabular-nums text-slate-500">{kw.trafficPct.toFixed(2)}%</td>
              <td className="px-2 py-2 text-[10px] text-slate-400 max-w-[180px] truncate">{kw.url.replace('https://www.sportsmockery.com','')}</td>
            </tr>
          })}</tbody>
        </table></div> : <p className="text-center py-6 text-xs text-slate-400">No keyword data available</p>}
      </Card>

      {/* Content Health sidebar */}
      <div className="lg:col-span-4 space-y-4">
        <Card title="Content Health">
          <div className="space-y-3">
            <div><p className="text-[10px] text-slate-400 mb-1">Publishing Velocity</p><div className="flex items-center gap-2"><div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{width:`${Math.min(100,parseFloat(d.overview.velocity)/10*100)}%`}}/></div><span className="text-xs font-bold text-slate-700">{d.overview.velocity}/wk</span></div></div>
            <div><p className="text-[10px] text-slate-400 mb-1">Avg Views Per Article</p><div className="flex items-center gap-2"><div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-purple-500" style={{width:`${Math.min(100,d.overview.avgViews/1000*100)}%`}}/></div><span className="text-xs font-bold text-slate-700">{fN(d.overview.avgViews)}</span></div></div>
            <div><p className="text-[10px] text-slate-400 mb-1">Period Views</p><div className="flex items-center gap-2"><div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-amber-500" style={{width:`${Math.min(100,d.overview.periodViews/100000*100)}%`}}/></div><span className="text-xs font-bold text-slate-700">{fN(d.overview.periodViews)}</span></div></div>
            <div><p className="text-[10px] text-slate-400 mb-1">Active Writers Ratio</p><div className="flex items-center gap-2"><div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{width:`${(d.writers.length/Math.max(d.overview.totalAuthors,1))*100}%`}}/></div><span className="text-xs font-bold text-slate-700">{d.writers.length}/{d.overview.totalAuthors}</span></div></div>
          </div>
        </Card>
        <Card title="Social Reach">
          <div className="space-y-3">
            {d.social.youtube.map(ch=><div key={ch.handle} className="flex items-center gap-2">
              <span className="w-5 text-center" style={{color:'#dc2626'}}>{I.yt}</span>
              <span className="text-xs text-slate-500 flex-1 truncate">{ch.label}</span>
              <span className="text-xs font-bold tabular-nums text-slate-700">{fN(ch.subscribers)}</span>
            </div>)}
            {d.social.x.map(a=><div key={a.username} className="flex items-center gap-2">
              <span className="w-5 text-center">{I.x}</span>
              <span className="text-xs text-slate-500 flex-1 truncate">{a.label}</span>
              <span className="text-xs font-bold tabular-nums text-slate-700">{fN(a.followers)}</span>
            </div>)}
            {d.social.facebook.filter(p=>!p.needsToken).map(p=><div key={p.id} className="flex items-center gap-2">
              <span className="w-5 text-center" style={{color:'#1877f2'}}>{I.fb}</span>
              <span className="text-xs text-slate-500 flex-1 truncate">{p.label}</span>
              <span className="text-xs font-bold tabular-nums text-slate-700">{fN(p.followers)}</span>
            </div>)}
          </div>
        </Card>
      </div>
    </div>

    {/* Row 3: Competitors + Keyword charts */}
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Organic Competitors">
        {seo?.competitors && seo.competitors.length > 0 ? <div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-slate-100">{['Domain','Relevance','Common KW','Organic KW','Traffic'].map(h=><th key={h} className="text-left px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
          <tbody>{seo.competitors.map((c,i)=><tr key={c.domain} className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="px-2 py-2 text-xs font-medium text-slate-700">{c.domain}</td>
            <td className="px-2 py-2"><div className="flex items-center gap-1.5"><div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${c.relevance*100}%`,backgroundColor:P[i%P.length]}}/></div><span className="text-[10px] text-slate-500 tabular-nums">{(c.relevance*100).toFixed(0)}%</span></div></td>
            <td className="px-2 py-2 text-xs tabular-nums text-slate-600">{fN(c.commonKeywords)}</td>
            <td className="px-2 py-2 text-xs tabular-nums text-slate-600">{fN(c.organicKeywords)}</td>
            <td className="px-2 py-2 text-xs font-bold tabular-nums" style={{color:'#2563eb'}}>{fN(c.organicTraffic)}</td>
          </tr>)}</tbody>
        </table></div> : <p className="text-center py-6 text-xs text-slate-400">No competitor data available</p>}
      </Card>

      {seo?.competitors && seo.competitors.length > 0 && <Card title="Competitor Traffic Comparison"><div style={{height:260}}>
        <Bar data={{labels:['sportsmockery.com',...seo.competitors.slice(0,6).map(c=>c.domain.replace('.com',''))],datasets:[{data:[ov?.organicTraffic||0,...seo.competitors.slice(0,6).map(c=>c.organicTraffic)],backgroundColor:['#2563ebcc',...P.slice(1,7).map(c=>c+'99')],borderRadius:4}]}} options={bOpts(false,true)} />
      </div></Card>}
    </div>

    {/* Keyword position distribution */}
    {seo?.keywords && seo.keywords.length > 0 && <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Keyword Position Distribution"><div style={{height:220}}>
        <Bar data={{labels:seo.keywords.slice(0,10).map(k=>k.keyword.length>25?k.keyword.substring(0,25)+'…':k.keyword),datasets:[{data:seo.keywords.slice(0,10).map(k=>k.searchVolume),backgroundColor:seo.keywords.slice(0,10).map((_,i)=>P[i%P.length]+'cc'),borderRadius:4}]}} options={bOpts(false,true)} />
      </div></Card>
      <Card title="Top Keywords by Search Volume"><div style={{height:220}}>
        <Doughnut data={{labels:seo.keywords.slice(0,8).map(k=>k.keyword),datasets:[{data:seo.keywords.slice(0,8).map(k=>k.searchVolume),backgroundColor:P.slice(0,8),borderColor:'#fff',borderWidth:2}]}} options={dOpts('right')} />
      </div></Card>
    </div>}
  </div>
}
