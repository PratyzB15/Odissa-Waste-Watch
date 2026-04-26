'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Truck, 
  Building, 
  Map as MapIcon, 
  Home, 
  Warehouse, 
  Clock, 
  Anchor, 
  Navigation as NavIcon, 
  Activity, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Trash2,
  ListFilter,
  BarChart2,
  AlertTriangle,
  Info,
  ArrowRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid,
  Legend as RechartsLegend 
} from 'recharts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mrfData } from "@/lib/mrf-data";
import { useMemo, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

// District Data Imports
import { angulDistrictData } from "@/lib/disAngul";
import { balangirDistrictData } from "@/lib/disBalangir";
import { bhadrakDistrictData } from "@/lib/disBhadrak";
import { bargarhDistrictData } from "@/lib/disBargarh";
import { sonepurDistrictData } from "@/lib/disSonepur";
import { boudhDistrictData } from "@/lib/disBoudh";
import { cuttackDistrictData } from "@/lib/disCuttack";
import { deogarhDistrictData } from "@/lib/disDeogarh";
import { dhenkanalDistrictData } from "@/lib/disDhenkanal";
import { gajapatiDistrictData } from "@/lib/disGajapati";
import { ganjamDistrictData } from "@/lib/disGanjam";
import { jagatsinghpurDistrictData } from "@/lib/disJagatsinghpur";
import { jajpurDistrictData } from "@/lib/disJajpur";
import { jharsugudaDistrictData } from "@/lib/disJharsuguda";
import { kalahandiDistrictData } from "@/lib/disKalahandi";
import { kandhamalDistrictData } from "@/lib/disKandhamal";
import { kendraparaDistrictData } from "@/lib/disKendrapara";
import { kendujharDistrictData } from "@/lib/disKendujhar";
import { balasoreDistrictData } from "@/lib/disBalasore";
import { baleswarDistrictData } from "@/lib/disBaleswar";
import { khordhaDistrictData } from "@/lib/disKhordha";
import { koraputDistrictData } from "@/lib/disKoraput";
import { mayurbhanjDistrictData } from "@/lib/disMayurbhanj";
import { malkangiriDistrictData } from "@/lib/disMalkangiri";

const CustomTabularTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border-2 border-primary/20 p-3 rounded-xl shadow-2xl space-y-1.5 min-w-[200px]">
        <p className="text-xs font-black uppercase text-primary border-b pb-1">{data.name}</p>
        <div className="text-[10px] space-y-1 pt-1">
          <p className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">BLOCK:</span> <span className="font-black uppercase">{data.block}</span></p>
          <p className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">DISTRICT:</span> <span className="font-black uppercase">{data.district}</span></p>
          <p className="flex justify-between gap-4 border-t pt-1 mt-1"><span className="text-primary font-black">QUANTITY:</span> <span className="font-mono font-black">{data.waste.toLocaleString()} KG</span></p>
        </div>
      </div>
    );
  }
  return null;
};

const calculateDaysUntilNext = (schedule: string, checkDate: Date) => {
    if (!schedule || /notified|required|TBD|NA/i.test(schedule)) return 999;
    const today = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    const todayDayNum = today.getDate();
    const s = schedule.toLowerCase();
    const dayMatches = s.match(/(\d+)/g);
    if (dayMatches && !s.includes('week')) {
        const days = dayMatches.map(Number).sort((a, b) => a - b);
        const nextDay = days.find(d => d >= todayDayNum);
        if (nextDay === todayDayNum) return 0;
        if (nextDay) return nextDay - todayDayNum;
        return (new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - todayDayNum) + days[0];
    }
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let targetWeekday = -1;
    weekdays.forEach((day, i) => { if (s.includes(day)) targetWeekday = i; });
    if (targetWeekday !== -1) {
        let diff = targetWeekday - today.getDay();
        if (diff < 0) diff += 7;
        return diff;
    }
    return 999;
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const {
    demographicData,
    districtWasteData,
    blockWasteData,
    compositionData,
    statewideActiveToday,
  } = useMemo(() => {
    const now = new Date();
    const districtsSet = new Set(mrfData.map(item => item.district));
    const districtsList = Array.from(districtsSet).sort();
    
    const blockAggMap: Record<string, number> = {};
    mrfData.forEach(m => { blockAggMap[m.blockCovered] = (blockAggMap[m.blockCovered] || 0) + m.dryWasteKg; });
    const blockLineData = Object.entries(blockAggMap)
      .map(([name, waste]) => ({ name, waste }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const totalMrfs = mrfData.length;
    const totalDryWaste = mrfData.reduce((sum, item) => sum + item.dryWasteKg, 0);
    const totalGps = mrfData.reduce((sum, item) => sum + item.gpsCovered, 0);
    const totalHh = mrfData.reduce((sum, item) => sum + item.households, 0);
    const ulbsSet = new Set(mrfData.map(item => item.ulbName));

    const blocksList = Array.from(new Set(mrfData.map(m => JSON.stringify({ name: m.blockCovered, district: m.district }))))
        .map(s => JSON.parse(s))
        .sort((a, b) => a.name.localeCompare(b.name));
    
    const mrfsList = mrfData.map(m => ({ id: m.mrfId, block: m.blockCovered, district: m.district, status: m.functionality }))
        .sort((a, b) => a.id.localeCompare(b.id));

    const ulbsList = Array.from(new Set(mrfData.map(m => JSON.stringify({ name: m.ulbName, district: m.district, block: m.blockCovered }))))
        .map(s => JSON.parse(s))
        .sort((a, b) => a.name.localeCompare(b.name));

    const hhBreakdownList = mrfData.map(m => ({ block: m.blockCovered, hh: m.households, district: m.district }))
        .sort((a, b) => a.block.localeCompare(b.block));

    const districtSources = [
        angulDistrictData, balangirDistrictData, bhadrakDistrictData, bargarhDistrictData,
        sonepurDistrictData, boudhDistrictData, cuttackDistrictData, deogarhDistrictData,
        dhenkanalDistrictData, gajapatiDistrictData, ganjamDistrictData, jagatsinghpurDistrictData,
        jajpurDistrictData, jharsugudaDistrictData, kalahandiDistrictData, kandhamalDistrictData,
        kendraparaDistrictData, kendujharDistrictData, balasoreDistrictData, baleswarDistrictData,
        khordhaDistrictData, koraputDistrictData, mayurbhanjDistrictData, malkangiriDistrictData
    ];

    const gpsMap = new Map<string, any>();
    districtSources.forEach(source => {
        if (source?.data?.gpMappings) {
            source.data.gpMappings.forEach(gp => {
                const wasteInfo = source.data.wasteGeneration?.find(w => w.gpName.toLowerCase() === gp.gpName.toLowerCase());
                const wasteVal = wasteInfo ? (wasteInfo.totalWasteKg || (wasteInfo.monthlyWasteTotalGm / 1000)) : 0;
                const uniqueKey = `${gp.gpName}-${gp.block || (source as any).blocks?.[0]}-${source.district}`.toLowerCase();
                if (!gpsMap.has(uniqueKey)) {
                    gpsMap.set(uniqueKey, { 
                        name: gp.gpName, 
                        block: gp.block || (source as any).blocks?.[0] || 'Unknown', 
                        district: source.district, 
                        waste: wasteVal
                    });
                }
            });
        }
    });
    const gpsList = Array.from(gpsMap.values());

    const demographicItems = [
      { id: "districts", title: "Districts Covered", value: districtsSet.size.toLocaleString(), icon: <MapIcon className="h-5 w-5 text-primary" />, list: districtsList, type: 'districts' },
      { id: "blocks", title: "Blocks Covered", value: blockLineData.length.toLocaleString(), icon: <Building className="h-5 w-5 text-primary" />, list: blocksList, type: 'blocks' },
      { id: "gps", title: "GPs Covered", value: totalGps.toLocaleString(), icon: <Home className="h-5 w-5 text-primary" />, list: gpsList, type: 'gps' },
      { id: "households", title: "Households Covered", value: totalHh.toLocaleString(), icon: <Users className="h-5 w-5 text-primary" />, list: hhBreakdownList, type: 'households' },
      { id: "ulbs", title: "ULBs Covered", value: ulbsSet.size.toLocaleString(), icon: <Building className="h-5 w-5 text-primary" />, list: ulbsList, type: 'ulbs' },
      { id: "mrfs", title: "SWM Units (MRF)", value: totalMrfs.toLocaleString(), icon: <Warehouse className="h-5 w-5 text-primary" />, list: mrfsList, type: 'mrfs' },
    ];

    const districtWasteLine = districtsList.map(d => ({
      name: d,
      waste: mrfData.filter(m => m.district === d).reduce((s, curr) => s + curr.dryWasteKg, 0)
    }));

    const composition = [
      { name: 'Plastic', value: totalDryWaste * 0.40, gradient: 'url(#plasticGrad)' },
      { name: 'Paper', value: totalDryWaste * 0.25, gradient: 'url(#paperGrad)' },
      { name: 'Metal', value: totalDryWaste * 0.12, gradient: 'url(#metalGrad)' },
      { name: 'Glass', value: totalDryWaste * 0.10, gradient: 'url(#glassGrad)' },
      { name: 'Sanitation', value: totalDryWaste * 0.08, gradient: 'url(#saniGrad)' },
      { name: 'Other', value: totalDryWaste * 0.05, gradient: 'url(#otherGrad)' },
    ];

    const activeToday = districtSources.flatMap(resource => {
        const schedules = resource.data.collectionSchedules || [];
        const routes = resource.data.routes || [];
        return schedules.filter(s => calculateDaysUntilNext(s.collectionSchedule, now) === 0).map(s => {
            const r = routes.find(rt => s.gpName.toLowerCase().includes(rt.routeId.toLowerCase()) || rt.startingGp.toLowerCase() === s.gpName.split('(')[0].trim().toLowerCase());
            return {
                ...s,
                district: resource.district,
                pathStart: r?.startingGp || s.gpName.split(',')[0].trim(),
                pathEnd: r?.finalGp || r?.destination || s.mrf
            };
        });
    });

    return { 
      demographicData: demographicItems, 
      districtWasteData: districtWasteLine,
      blockWasteData: blockLineData,
      compositionData: composition,
      statewideActiveToday: activeToday,
    };
  }, []);

  const renderDemographicList = (item: any) => {
    switch (item.type) {
        case 'districts':
            return (<div className="w-[300px] overflow-hidden rounded-xl border shadow-xl bg-card"><h4 className="font-black uppercase text-[10px] p-3 bg-muted/80 text-center tracking-widest border-b">District Directory</h4><ScrollArea className="h-72"><div className="p-2 space-y-1">{item.list.map((d: string) => (<div key={d} className="p-2.5 rounded-lg text-xs font-bold uppercase hover:bg-primary/5 transition-colors border-b border-dashed last:border-0">{d}</div>))}</div></ScrollArea></div>);
        case 'blocks':
            return (<div className="w-[450px] overflow-hidden rounded-xl border shadow-xl bg-card"><h4 className="font-black uppercase text-[10px] p-3 bg-muted/80 text-center tracking-widest border-b">Block & District Mapping</h4><ScrollArea className="h-80"><Table><TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase tracking-widest">Block Node</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest">District</TableHead></TableRow></TableHeader><TableBody>{item.list.map((b: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{b.name}</TableCell><TableCell className="text-[10px] uppercase font-medium text-muted-foreground">{b.district}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></div>);
        case 'gps':
            return (<div className="w-[600px] overflow-hidden rounded-xl border shadow-xl bg-card"><h4 className="font-black uppercase text-[10px] p-3 bg-muted/80 text-center tracking-widest border-b">Gram Panchayat Master Directory</h4><ScrollArea className="h-96"><Table><TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase tracking-widest">GP Node</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest">Block</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest">District</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Waste (Kg)</TableHead></TableRow></TableHeader><TableBody>{item.list.map((gp: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase text-primary">{gp.name}</TableCell><TableCell className="text-[10px] uppercase font-medium text-muted-foreground">{gp.block}</TableCell><TableCell className="text-[10px] uppercase font-bold text-muted-foreground/60">{gp.district}</TableCell><TableCell className="text-right font-mono font-bold text-[10px]">{gp.waste.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></div>);
        case 'households':
            const totalHh = item.list.reduce((sum: number, b: any) => sum + b.hh, 0);
            return (<div className="w-[450px] overflow-hidden rounded-xl border shadow-xl bg-card"><h4 className="font-black uppercase text-[10px] p-3 bg-muted/80 text-center tracking-widest border-b">Household Audit Breakdown</h4><ScrollArea className="h-80"><Table><TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase tracking-widest">Block / Node</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Households</TableHead></TableRow></TableHeader><TableBody>{item.list.map((b: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{b.block} <span className="text-[8px] opacity-40 ml-1">({b.district})</span></TableCell><TableCell className="text-right font-mono font-black text-[11px]">{b.hh.toLocaleString()}</TableCell></TableRow>))}<TableRow className="bg-primary/5 font-black"><TableCell className="text-[10px] uppercase text-right">Grand Total State-wide</TableCell><TableCell className="text-right font-mono text-xs text-primary">{totalHh.toLocaleString()}</TableCell></TableRow></TableBody></Table></ScrollArea></div>);
        case 'ulbs':
            return (<div className="w-[500px] overflow-hidden rounded-xl border shadow-xl bg-card"><h4 className="font-black uppercase text-[10px] p-3 bg-muted/80 text-center tracking-widest border-b">ULB Directory</h4><ScrollArea className="h-80"><Table><TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase tracking-widest">ULB Name</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest">Block</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest">District</TableHead></TableRow></TableHeader><TableBody>{item.list.map((u: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase text-blue-700">{u.name}</TableCell><TableCell className="text-[10px] uppercase font-medium text-muted-foreground">{u.block}</TableCell><TableCell className="text-[10px] uppercase font-bold text-muted-foreground/60">{u.district}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></div>);
        case 'mrfs':
            return (<div className="w-[600px] overflow-hidden rounded-xl border shadow-xl bg-card"><h4 className="font-black uppercase text-[10px] p-3 bg-muted/80 text-center tracking-widest border-b">SWM Units Directory</h4><ScrollArea className="h-96"><Table><TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase tracking-widest">MRF ID</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest text-center">Status</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest">Block</TableHead><TableHead className="text-[9px] font-black uppercase tracking-widest">District</TableHead></TableRow></TableHeader><TableBody>{item.list.map((m: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase text-primary">{m.id}</TableCell><TableCell className="text-center"><Badge className={`text-[8px] uppercase h-4 ${m.status === 'Functional' ? 'bg-green-600' : 'bg-orange-500'}`}>{m.status}</Badge></TableCell><TableCell className="text-[10px] uppercase font-medium text-muted-foreground">{m.block}</TableCell><TableCell className="text-[10px] uppercase font-bold text-muted-foreground/60">{m.district}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></div>);
        default: return null;
    }
  };

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing state hub...</div>;

  return (
    <div className="grid gap-6">
       <Card className="border-2 border-primary/20 bg-primary/[0.01]">
        <CardHeader><div className="flex justify-between items-center"><div><CardTitle className="text-2xl font-black uppercase tracking-tight">Analytical Monitoring Hub (State Admin)</CardTitle><CardDescription>Consolidated real-time insights from verified district registries.</CardDescription></div><Badge variant="outline" className="border-primary text-primary font-bold">LIVE STATE AUDIT</Badge></div></CardHeader>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {demographicData.map((item, index) => (
          <Popover key={item.id}>
            <PopoverTrigger asChild>
                <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group"><CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{item.title}</CardTitle><div className="opacity-10 group-hover:opacity-100 transition-opacity">{item.icon}</div></CardHeader><CardContent className="px-3 pb-3"><div className="text-xl font-black text-foreground">{item.value}</div></CardContent></Card>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none bg-transparent" align={index > 3 ? "end" : "start"} sideOffset={10}>{renderDemographicList(item)}</PopoverContent>
          </Popover>
        ))}
      </div>

      <div className="grid lg:grid-cols-1 gap-6">
        <Card className="border-2 border-primary/30 bg-primary/[0.01]">
          <CardHeader className="bg-primary/5 border-b pb-3 flex flex-row items-center justify-between space-y-0"><div className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /><CardTitle className="text-base font-black text-primary uppercase">Circuits Active Today</CardTitle></div><Badge className="bg-green-600 font-black animate-pulse">{statewideActiveToday.length} DEPLOYED</Badge></CardHeader>
          <CardContent className="pt-4"><ScrollArea className="h-[400px]"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">{statewideActiveToday.map((log, i) => (<div key={i} className="p-4 border rounded-xl bg-card shadow-sm flex flex-col gap-3 border-l-4 border-l-green-600"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="font-black text-sm uppercase text-primary">{log.routeId || 'CIRCUIT'}</span><Badge variant="outline" className="text-[8px] font-black border-primary/30">{log.district}</Badge></div><span className="text-[10px] font-black text-blue-700 uppercase">{log.collectionSchedule}</span></div><div className="space-y-1 text-[10px] font-bold uppercase"><div className="flex items-center gap-2 text-muted-foreground"><span className="text-green-700">START: {log.pathStart}</span><ArrowRight className="h-2.5 w-2.5" /><span className="text-blue-700">END: {log.pathEnd}</span></div><div className="flex items-center gap-4 pt-2 border-t border-dashed mt-2"><p className="flex items-center gap-1 text-primary"><Anchor className="h-3 w-3 opacity-50" /> {log.mrf}</p><p className="flex items-center gap-1"><Truck className="h-3 w-3 opacity-50" /> {log.vehicleType}</p></div></div></div>))}{statewideActiveToday.length === 0 && <p className="text-center py-12 text-muted-foreground italic">No active circuits for today.</p>}</div></ScrollArea></CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader className="border-b bg-muted/5 py-3"><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><BarChart2 className="h-4 w-4 text-primary" /> Administrative Block Load (Kg)</CardTitle></CardHeader>
        <CardContent className="h-[350px] pt-6"><ResponsiveContainer width="100%" height="100%"><LineChart data={blockWasteData} margin={{ bottom: 60, left: 10, right: 10 }}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} fontSize={8} /><YAxis fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(1)}T`} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} /><Line type="monotone" dataKey="waste" name="Block Load" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3, fill: "hsl(var(--primary))" }} /></LineChart></ResponsiveContainer></CardContent>
      </Card>
    </div>
  );
}
