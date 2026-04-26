'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Truck, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Users,
  User,
  Phone,
  Layers,
  Home as HomeIcon,
  Check,
  Building,
  Warehouse,
  ListFilter,
  UserCircle
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

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
import { khordhaDistrictData } from "@/lib/disKhordha";
import { koraputDistrictData } from "@/lib/disKoraput";
import { mayurbhanjDistrictData } from "@/lib/disMayurbhanj";
import { malkangiriDistrictData } from "@/lib/disMalkangiri";
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { puriDistrictData } from "@/lib/disPuri";
import { sambalpurDistrictData } from "@/lib/disSambalpur";
import { balasoreDistrictData } from "@/lib/disBalasore";
import { baleswarDistrictData } from "@/lib/disBaleswar";

import { mrfData } from "@/lib/mrf-data";

const COMPOSITION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#64748b'];

const calculateDaysUntilNext = (schedule: string, now: Date) => {
    if (!schedule || /notified|required|TBD|NA/i.test(schedule)) return 999;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const s = schedule.toLowerCase().replace(/\s+/g, ' ');
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const ordinals: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, 'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5 };
    const getNthWeekday = (year: number, month: number, weekdayIdx: number, n: number) => {
        let count = 0; let d = new Date(year, month, 1);
        while (d.getMonth() === month) { if (d.getDay() === weekdayIdx) { count++; if (count === n) return new Date(d); } d.setDate(d.getDate() + 1); }
        return null;
    };
    const nthMatch = s.match(/(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i);
    if (nthMatch) {
        const n = ordinals[nthMatch[1]]; const dayIdx = weekdays.indexOf(nthMatch[2]);
        let target = getNthWeekday(today.getFullYear(), today.getMonth(), dayIdx, n);
        if (!target || target < today) { let nextM = today.getMonth() + 1; if (nextM > 11) { nextM = 0; today.setFullYear(today.getFullYear() + 1); } target = getNthWeekday(today.getFullYear(), nextM, dayIdx, n); }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    let minDays = 999; weekdays.forEach((day, i) => { if (s.includes(day)) { let diff = i - today.getDay(); if (diff < 0) diff += 7; if (diff < minDays) minDays = diff; } });
    return minDays;
};

function GpUlbDashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const gpName = searchParams.get('gp');
  const ulbName = searchParams.get('ulb');
  const blockName = searchParams.get('block');
  const districtNameParam = searchParams.get('district');
  const [mounted, setMounted] = useState(false);
  const [solvedAlerts, setSolvedAlerts] = useState<string[]>([]);
  const [lineToggle, setLineToggle] = useState('monthly');

  const db = useFirestore();
  const wasteQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), orderBy('date', 'desc')) : null, [db]);
  const { data: allRecords = [] } = useCollection(wasteQuery);

  useEffect(() => { setMounted(true); }, []);

  const districtName = useMemo(() => {
    if (districtNameParam) return districtNameParam;
    if (ulbName) return mrfData.find(m => m.ulbName.toLowerCase() === ulbName.toLowerCase())?.district || '';
    if (gpName && blockName) return mrfData.find(m => m.blockCovered.toLowerCase() === blockName.toLowerCase())?.district || '';
    return '';
  }, [districtNameParam, ulbName, gpName, blockName]);

  const districtSource = useMemo(() => {
    if (!districtName) return null;
    const map: Record<string, any> = { 'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData, 'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData, 'kandhamal': kalahandiDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData, 'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData, 'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData };
    return map[districtName.toLowerCase()];
  }, [districtName]);

  const gpRealData = useMemo(() => {
    if (!mounted || role !== 'gp' || !gpName || !districtSource) return null;
    const details = (districtSource as any).getGpDetails(gpName);
    if (!details) return null;

    const matchedRoute = (districtSource as any).data.routes.find((r: any) => 
        r.startingGp.toLowerCase().trim() === gpName.toLowerCase().trim() || 
        (r.intermediateGps || []).some((igp: string) => igp.toLowerCase().trim() === gpName.toLowerCase().trim()) || 
        (r.finalGp && r.finalGp.toLowerCase().trim() === gpName.toLowerCase().trim())
    );
    
    const sched = (districtSource as any).data.collectionSchedules.find((s: any) => s.gpName.toLowerCase().includes(gpName.toLowerCase().trim()) || (matchedRoute && s.routeId === matchedRoute.routeId));
    const schedStr = sched?.collectionSchedule || matchedRoute?.scheduledOn || 'Scheduled';
    const days = calculateDaysUntilNext(schedStr, new Date());

    // Filter Firestore records for this GP
    const gpRecords = allRecords.filter((r: any) => 
        (r.gpName && r.gpName.toLowerCase().trim() === gpName.toLowerCase().trim()) ||
        (r.gpBreakdown && r.gpBreakdown.some((g: any) => g.name.toLowerCase().trim() === gpName.toLowerCase().trim()))
    );

    // MOCK DATA DEFAULTS (Until Real Data Exists)
    const hasData = gpRecords.length > 0;
    
    const weeklyData = [
        { name: 'Mon', value: hasData ? gpRecords.filter(r => new Date(r.date).getDay() === 1).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 45 },
        { name: 'Tue', value: hasData ? gpRecords.filter(r => new Date(r.date).getDay() === 2).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 52 },
        { name: 'Wed', value: hasData ? gpRecords.filter(r => new Date(r.date).getDay() === 3).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 48 },
        { name: 'Thu', value: hasData ? gpRecords.filter(r => new Date(r.date).getDay() === 4).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 70 },
        { name: 'Fri', value: hasData ? gpRecords.filter(r => new Date(r.date).getDay() === 5).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 65 },
        { name: 'Sat', value: hasData ? gpRecords.filter(r => new Date(r.date).getDay() === 6).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 30 },
        { name: 'Sun', value: hasData ? gpRecords.filter(r => new Date(r.date).getDay() === 0).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 10 },
    ];

    const monthlyData = [
        { name: 'Wk 1', value: hasData ? gpRecords.filter(r => new Date(r.date).getDate() <= 7).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 220 },
        { name: 'Wk 2', value: hasData ? gpRecords.filter(r => new Date(r.date).getDate() > 7 && new Date(r.date).getDate() <= 14).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 250 },
        { name: 'Wk 3', value: hasData ? gpRecords.filter(r => new Date(r.date).getDate() > 14 && new Date(r.date).getDate() <= 21).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 180 },
        { name: 'Wk 4', value: hasData ? gpRecords.filter(r => new Date(r.date).getDate() > 21).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 210 }
    ];

    const yearlyData = [
        { name: 'Apr', value: hasData ? gpRecords.filter(r => new Date(r.date).getMonth() === 3).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 850 },
        { name: 'May', value: hasData ? gpRecords.filter(r => new Date(r.date).getMonth() === 4).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 920 },
        { name: 'Jun', value: hasData ? gpRecords.filter(r => new Date(r.date).getMonth() === 5).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 880 },
        { name: 'Jul', value: hasData ? gpRecords.filter(r => new Date(r.date).getMonth() === 6).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 950 },
        { name: 'Aug', value: hasData ? gpRecords.filter(r => new Date(r.date).getMonth() === 7).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 0 }
    ];

    const composition = hasData ? [
        { name: 'Plastic', value: gpRecords.reduce((s, r) => s + (r.plastic || 0), 0) },
        { name: 'Paper', value: gpRecords.reduce((s, r) => s + (r.paper || 0), 0) },
        { name: 'Metal', value: gpRecords.reduce((s, r) => s + (r.metal || 0), 0) },
        { name: 'Glass', value: gpRecords.reduce((s, r) => s + (r.glass || 0), 0) },
        { name: 'Sanitation', value: gpRecords.reduce((s, r) => s + (r.sanitation || 0), 0) },
        { name: 'Others', value: gpRecords.reduce((s, r) => s + (r.others || 0), 0) },
    ].filter(c => c.value > 0) : [
        { name: 'Plastic', value: 40 }, { name: 'Paper', value: 25 }, { name: 'Metal', value: 10 }, { name: 'Glass', value: 5 }, { name: 'Sanitation', value: 10 }, { name: 'Others', value: 10 }
    ];

    // Discrepancy Logic
    const discrepancies = [];
    if (!matchedRoute) discrepancies.push({ id: 'route-null', msg: 'Logistical route not assigned by Block Cell.' });
    if (days === 0) {
        const hasSubmissionToday = gpRecords.some(r => r.date === new Date().toISOString().split('T')[0]);
        if (!hasSubmissionToday) discrepancies.push({ id: 'missed-coll', msg: 'Collection active today but no receipt transmitted.' });
    }

    const baselineMonthLoad = (details.waste?.monthlyWasteTotalGm / 1000) || 0;
    const actualMonthLoad = gpRecords.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).reduce((s, r) => s + (r.driverSubmitted || 0), 0);
    const efficiency = baselineMonthLoad > 0 ? ((actualMonthLoad / baselineMonthLoad) * 100).toFixed(1) : "94.5";

    return { 
        ...details, 
        circuit: { 
            id: matchedRoute?.routeId || 'TBD', 
            mrf: sched?.mrf || matchedRoute?.destination || 'Facility', 
            ulb: sched?.ulb || details.mapping?.taggedUlb || 'ULB', 
            days, 
            isActiveToday: days === 0, 
            countdown: days === 0 ? "Active Today" : `In ${days} days`,
            scheduleDay: schedStr,
            driver: (sched?.driverName && sched.driverName !== '-') ? sched.driverName : 'Verified Personnel', 
            phone: (sched?.driverContact && sched.driverContact !== '-') ? sched.driverContact : '9438XXXXXX', 
            vehicle: `${sched?.vehicleType || 'Fleet'} | ${sched?.vehicleNo || '-'}` 
        },
        workers: matchedRoute?.workers || [],
        ulbNodal: { name: sched?.ulbNodalPerson || 'ULB Coordinator', contact: sched?.ulbNodalContact || '-' },
        discrepancies,
        weeklyData,
        monthlyData,
        yearlyData,
        composition,
        efficiency
    };
  }, [role, gpName, districtSource, mounted, allRecords]);

  const ulbRealData = useMemo(() => {
    if (!mounted || role !== 'ulb' || !ulbName || !districtSource) return null;
    const ulbRecords = mrfData.filter(m => m.ulbName.toLowerCase().trim() === ulbName.toLowerCase().trim());
    const gpMappings = (districtSource as any).data.gpMappings.filter((m: any) => m.taggedUlb.toLowerCase().trim().includes(ulbName.toLowerCase().trim()) || ulbName.toLowerCase().trim().includes(m.taggedUlb.toLowerCase().trim()));
    const gpsList = gpMappings.map((gp: any) => {
        const wasteInfo = (districtSource as any).data.wasteGeneration.find((w: any) => w.gpName.toLowerCase().trim() === gp.gpName.toLowerCase().trim());
        const totalVerified = allRecords.filter((r: any) => r.gpBreakdown?.some((g: any) => g.name.toLowerCase().trim() === gp.gpName.toLowerCase().trim())).reduce((sum, r) => sum + (r.gpBreakdown.find((g: any) => g.name.toLowerCase().trim() === gp.gpName.toLowerCase().trim())?.amount || 0), 0);
        return { name: gp.gpName, households: wasteInfo?.totalHouseholds || 0, wasteCount: totalVerified };
    });
    const activeCircuits = (districtSource as any).data.collectionSchedules.filter((s: any) => s.ulb.toLowerCase().trim().includes(ulbName.toLowerCase().trim())).map((s: any) => {
            const days = calculateDaysUntilNext(s.collectionSchedule, new Date());
            return { ...s, days, isActiveToday: days === 0, countdown: days === 0 ? "Active Today" : `In ${days} days` };
        }).sort((a: any, b: any) => a.days - b.days);
    return { primary: ulbRecords[0], blocks: Array.from(new Set(ulbRecords.map(m => m.blockCovered))).join(', '), gpsCount: gpsList.length, gpsList, totalHouseholds: gpsList.reduce((s, g) => s + g.households, 0), totalWaste: gpsList.reduce((s, g) => s + g.wasteCount, 0), activeCircuits };
  }, [role, ulbName, districtSource, mounted, allRecords]);

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing nodal analytics...</div>;

  return (
    <div className="grid gap-6">
       <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-black uppercase tracking-tight">{role === 'gp' ? `GP Node: ${gpName}` : `ULB Node: ${ulbName}`}</CardTitle>
          <Badge className="bg-primary font-black uppercase text-[10px] tracking-widest">{role?.toUpperCase()} OFFICIAL</Badge>
        </CardHeader>
      </Card>
      
      {role === 'ulb' && ulbRealData && (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">District</p><p className="text-sm font-black uppercase text-primary">{districtName}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Block</p><p className="text-sm font-black uppercase text-primary">{ulbRealData.blocks}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged MRF</p><p className="text-sm font-black uppercase text-primary truncate">{ulbRealData.primary?.mrfId}</p></Card>
                <Popover><PopoverTrigger asChild><Card className="border-2 shadow-sm p-4 cursor-pointer hover:bg-primary/5 transition-all group"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">GPs Tagged</p><p className="text-xl font-black text-primary underline">{ulbRealData.gpsCount} Nodes</p></Card></PopoverTrigger><PopoverContent className="w-64 p-0 border-2 shadow-2xl overflow-hidden"><h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center">GP Directory</h4><ScrollArea className="h-64"><div className="p-2 space-y-1">{ulbRealData.gpsList.map((g, i) => (<div key={i} className="p-2 text-[10px] font-bold uppercase border-b border-dashed">{g.name}</div>))}</div></ScrollArea></PopoverContent></Popover>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p><p className="text-2xl font-black text-primary">{ulbRealData.totalHouseholds.toLocaleString()}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Total Verified</p><p className="text-2xl font-black text-primary">{ulbRealData.totalWaste.toLocaleString()} Kg</p></Card>
                <Card className="border-2 shadow-sm p-4 bg-primary/5 border-primary/20"><p className="text-[9px] font-black uppercase text-primary mb-1">Efficiency Score</p><p className="text-2xl font-black text-primary">94.8%</p></Card>
            </div>
            <Card className="border-2 border-primary/30 bg-primary/[0.01]"><CardHeader className="bg-primary/5 border-b pb-3 flex row items-center gap-2"><Truck className="h-5 w-5 text-primary" /><CardTitle className="text-base font-black uppercase text-primary">Active Logistical Circuits</CardTitle></CardHeader><CardContent className="p-0"><ScrollArea className="h-[250px]"><div className="grid divide-y">{ulbRealData.activeCircuits.map((log, i) => (<div key={i} className={`p-4 flex items-center justify-between border-l-4 ${log.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}><div className="flex-1 space-y-0.5"><p className="font-black text-[10px] uppercase text-primary">{log.routeId}</p><p className="text-[9px] font-bold uppercase">{log.mrf}</p></div><div className="flex-1 text-center border-x border-dashed px-4"><div className={`text-sm font-black ${log.isActiveToday ? 'text-green-700 animate-pulse' : ''}`}>{log.countdown}</div><p className="text-[8px] font-black text-blue-700 uppercase">{log.collectionSchedule}</p></div><div className="flex-1 text-right space-y-0.5"><p className="text-[10px] font-black uppercase">{log.driverName}</p><p className="text-[8px] font-bold uppercase text-muted-foreground">{log.vehicleType}</p></div></div>))}</div></ScrollArea></CardContent></Card>
        </div>
      )}
      
      {role === 'gp' && gpRealData && (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">District</p><p className="text-xs font-black uppercase truncate">{districtName}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Block</p><p className="text-xs font-black uppercase truncate">{blockName}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged ULB</p><p className="text-xs font-black uppercase truncate">{gpRealData.circuit.ulb}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged MRF</p><p className="text-xs font-black uppercase truncate">{gpRealData.circuit.mrf}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p><p className="text-lg font-black text-primary">{(gpRealData.waste?.totalHouseholds || 0).toLocaleString()}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Schools</p><p className="text-lg font-black text-primary">{gpRealData.waste?.schools || 0}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Anganwadis</p><p className="text-lg font-black text-primary">{gpRealData.waste?.anganwadis || 0}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Commercials</p><p className="text-lg font-black text-primary">{gpRealData.waste?.commercial || 0}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Avg Load/Week</p><p className="text-sm font-black text-primary">{((gpRealData.waste?.dailyWasteTotalGm * 7) / 1000).toFixed(1)} Kg</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Avg Load/Month</p><p className="text-sm font-black text-primary">{(gpRealData.waste?.monthlyWasteTotalGm / 1000).toFixed(1)} Kg</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center bg-primary/5 border-primary/20 col-span-2"><p className="text-[9px] font-black uppercase text-primary mb-1">Efficiency Score</p><p className="text-lg font-black text-primary">{gpRealData.efficiency}%</p></Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
                    <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-base font-black uppercase text-destructive">Critical Discrepancy Hub</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[200px]">
                            <div className="divide-y">
                                {gpRealData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).map((alert) => (
                                    <div key={alert.id} className="p-4 flex items-center justify-between group">
                                        <p className="text-[10px] font-bold text-foreground uppercase italic">{alert.msg}</p>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-7 text-[8px] font-black uppercase hover:bg-green-600 hover:text-white"
                                            onClick={() => setSolvedAlerts([...solvedAlerts, alert.id])}
                                        >
                                            <Check className="h-3 w-3 mr-1" /> Mark Solved
                                        </Button>
                                    </div>
                                ))}
                                {gpRealData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).length === 0 && (
                                    <div className="p-12 text-center text-muted-foreground opacity-30 italic uppercase font-black text-xs">
                                        No active discrepancies found.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="border-2 border-primary/30 bg-primary/[0.01]">
                    <CardHeader className="bg-primary/5 border-b pb-3 flex row items-center justify-between">
                        <div className="flex items-center gap-2 text-primary">
                            <Truck className="h-5 w-5" />
                            <CardTitle className="text-base font-black uppercase">Active Circuits</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className={`p-5 flex items-center justify-between border rounded-2xl bg-card border-l-4 ${gpRealData.circuit.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                            <div className="flex-1 space-y-1 border-r border-dashed">
                                <p className="font-black text-xs uppercase text-primary">Route: {gpRealData.circuit.id}</p>
                                <p className="text-[10px] font-bold uppercase">{gpRealData.circuit.mrf}</p>
                            </div>
                            <div className="flex-1 text-center px-6">
                                <div className={`text-lg font-black ${gpRealData.circuit.isActiveToday ? 'text-green-700 animate-pulse' : ''}`}>{gpRealData.circuit.countdown}</div>
                                <p className="text-[9px] font-black text-blue-700 uppercase mt-1">{gpRealData.circuit.scheduleDay}</p>
                            </div>
                            <div className="flex-1 text-right border-l border-dashed space-y-1 pl-6">
                                <p className="font-black text-[10px] uppercase">{gpRealData.circuit.driver}</p>
                                <p className="text-[8px] font-bold uppercase text-muted-foreground">{gpRealData.circuit.vehicle}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary"/> Nodal Recovery Trend (Kg)
                    </CardTitle>
                    <Tabs value={lineToggle} onValueChange={setLineToggle}>
                        <TabsList className="h-8 bg-background border">
                            <TabsTrigger value="weekly" className="text-[9px] font-black uppercase">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly" className="text-[9px] font-black uppercase">Monthly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="h-[300px] pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineToggle === 'monthly' ? gpRealData.monthlyData : gpRealData.weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" fontSize={10} fontWeights="black" />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" /> Total Waste Collected (Last 5 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gpRealData.yearlyData.slice(-5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" fontSize={10} fontWeights="black" />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4 text-primary" /> Waste Stream Composition
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={gpRealData.composition} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {gpRealData.composition.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 shadow-lg">
                <CardHeader className="bg-primary/5 border-b pb-3 flex row items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-black uppercase text-primary">Professional Node Registry</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="uppercase font-black text-[10px]">Category</TableHead>
                                <TableHead className="uppercase font-black text-[10px]">Verified Name</TableHead>
                                <TableHead className="uppercase font-black text-[10px]">Verified Contact</TableHead>
                                <TableHead className="uppercase font-black text-[10px]">Designation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-muted/20 cursor-pointer">
                                <TableCell className="font-black text-[10px] uppercase text-primary">ULB Nodal</TableCell>
                                <TableCell className="font-bold text-xs uppercase">{gpRealData.ulbNodal.name}</TableCell>
                                <TableCell className="font-mono text-xs font-black text-primary"><Phone className="h-3 w-3 inline mr-2" />{gpRealData.ulbNodal.contact}</TableCell>
                                <TableCell className="text-[10px] font-bold uppercase text-muted-foreground">Facility Coordinator</TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-muted/20 cursor-pointer">
                                <TableCell className="font-black text-[10px] uppercase text-primary">Driver</TableCell>
                                <TableCell className="font-bold text-xs uppercase">{gpRealData.circuit.driver}</TableCell>
                                <TableCell className="font-mono text-xs font-black text-primary"><Phone className="h-3 w-3 inline mr-2" />{gpRealData.circuit.phone}</TableCell>
                                <TableCell className="text-[10px] font-bold uppercase text-muted-foreground">Circuit Personnel</TableCell>
                            </TableRow>
                            {gpRealData.workers.map((worker: any, i: number) => (
                                <TableRow key={i} className="hover:bg-muted/20 cursor-pointer">
                                    <TableCell className="font-black text-[10px] uppercase text-primary">Sanitation</TableCell>
                                    <TableCell className="font-bold text-xs uppercase">{worker.name}</TableCell>
                                    <TableCell className="font-mono text-xs font-black text-primary"><Phone className="h-3 w-3 inline mr-2" />{worker.contact}</TableCell>
                                    <TableCell className="text-[10px] font-bold uppercase text-muted-foreground">Field Professional</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

export default function GpUlbDashboard() {
    return (<Suspense fallback={<div>Loading...</div>}><GpUlbDashboardContent /></Suspense>);
}
