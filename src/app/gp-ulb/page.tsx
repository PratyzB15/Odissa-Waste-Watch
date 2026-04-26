'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Truck, 
  ArrowRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  useEffect(() => { setMounted(true); }, []);
  const db = useFirestore();
  const wasteQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), orderBy('date', 'desc')) : null, [db]);
  const { data: records = [] } = useCollection(wasteQuery);

  const districtName = useMemo(() => {
    if (districtNameParam) return districtNameParam;
    if (ulbName) return mrfData.find(m => m.ulbName.toLowerCase() === ulbName.toLowerCase())?.district || '';
    if (gpName && blockName) return mrfData.find(m => m.blockCovered.toLowerCase() === blockName.toLowerCase())?.district || '';
    return '';
  }, [districtNameParam, ulbName, gpName, blockName]);

  const districtSource = useMemo(() => {
    if (!districtName) return null;
    const map: Record<string, any> = { 'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData, 'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData, 'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData, 'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData, 'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData };
    return map[districtName.toLowerCase()];
  }, [districtName]);

  const ulbRealData = useMemo(() => {
    if (!mounted || role !== 'ulb' || !ulbName || !districtSource) return null;
    const ulbRecords = mrfData.filter(m => m.ulbName.toLowerCase().trim() === ulbName.toLowerCase().trim());
    const gpMappings = (districtSource as any).data.gpMappings.filter((m: any) => m.taggedUlb.toLowerCase().trim().includes(ulbName.toLowerCase().trim()) || ulbName.toLowerCase().trim().includes(m.taggedUlb.toLowerCase().trim()));
    const gpsList = gpMappings.map((gp: any) => {
        const wasteInfo = (districtSource as any).data.wasteGeneration.find((w: any) => w.gpName.toLowerCase().trim() === gp.gpName.toLowerCase().trim());
        const totalVerified = records.filter((r: any) => r.gpBreakdown?.some((g: any) => g.name.toLowerCase().trim() === gp.gpName.toLowerCase().trim())).reduce((sum, r) => sum + (r.gpBreakdown.find((g: any) => g.name.toLowerCase().trim() === gp.gpName.toLowerCase().trim())?.amount || 0), 0);
        return { name: gp.gpName, households: wasteInfo?.totalHouseholds || 0, wasteCount: totalVerified };
    });
    const activeCircuits = (districtSource as any).data.collectionSchedules.filter((s: any) => s.ulb.toLowerCase().trim().includes(ulbName.toLowerCase().trim())).map((s: any) => {
            const days = calculateDaysUntilNext(s.collectionSchedule, new Date());
            return { ...s, days, isActiveToday: days === 0, countdown: days === 0 ? "Active Today" : `In ${days} days` };
        }).sort((a: any, b: any) => a.days - b.days);
    return { primary: ulbRecords[0], blocks: Array.from(new Set(ulbRecords.map(m => m.blockCovered))).join(', '), gpsCount: gpsList.length, gpsList, totalHouseholds: gpsList.reduce((s, g) => s + g.households, 0), totalWaste: gpsList.reduce((s, g) => s + g.wasteCount, 0), activeCircuits };
  }, [role, ulbName, districtSource, mounted, records]);

  const gpRealData = useMemo(() => {
    if (!mounted || role !== 'gp' || !gpName || !districtSource) return null;
    const details = (districtSource as any).getGpDetails(gpName);
    if (!details) return null;
    const matchedRoute = (districtSource as any).data.routes.find((r: any) => r.startingGp.toLowerCase().trim() === gpName.toLowerCase().trim() || (r.intermediateGps || []).some((igp: string) => igp.toLowerCase().trim() === gpName.toLowerCase().trim()) || (r.finalGp && r.finalGp.toLowerCase().trim() === gpName.toLowerCase().trim()));
    const sched = (districtSource as any).data.collectionSchedules.find((s: any) => s.gpName.toLowerCase().includes(gpName.toLowerCase().trim()) || (matchedRoute && s.routeId === matchedRoute.routeId));
    const schedStr = sched?.collectionSchedule || matchedRoute?.scheduledOn || 'Scheduled';
    const days = calculateDaysUntilNext(schedStr, new Date());
    return { ...details, circuit: { id: matchedRoute?.routeId || 'TBD', mrf: sched?.mrf || matchedRoute?.destination || 'Facility', ulb: sched?.ulb || details.mapping?.taggedUlb || 'ULB', days, isActiveToday: days === 0, countdown: days === 0 ? "Active Today" : `In ${days} days`, driver: (sched?.driverName && sched.driverName !== '-') ? sched.driverName : 'Verified', phone: sched?.driverContact || '-', vehicle: `${sched?.vehicleType || 'Fleet'} | ${sched?.vehicleNo || '-'}` } };
  }, [role, gpName, districtSource, mounted]);

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing nodal analytics...</div>;

  return (
    <div className="grid gap-6">
       <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between"><div className="flex flex-col"><CardTitle className="text-2xl font-black uppercase tracking-tight">{role === 'gp' ? `GP Node: ${gpName}` : `ULB Node: ${ulbName}`}</CardTitle></div><Badge className="bg-primary font-black uppercase text-[10px] tracking-widest">{role?.toUpperCase()} OFFICIAL</Badge></CardHeader>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">District</p><p className="text-sm font-black uppercase text-primary">{districtName}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Block</p><p className="text-sm font-black uppercase text-primary">{blockName}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">ULB</p><p className="text-sm font-black uppercase text-primary">{gpRealData.circuit.ulb}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Mapped MRF</p><p className="text-sm font-black uppercase text-primary underline truncate">{gpRealData.circuit.mrf}</p></Card>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p><p className="text-xl font-black">{gpRealData.waste?.totalHouseholds?.toLocaleString()}</p></Card>
                <Card className="border-2 shadow-sm bg-primary/5 p-4"><p className="text-[9px] font-black text-primary uppercase mb-1">Waste/Week</p><p className="text-lg font-black text-primary">150 Kg</p></Card>
                <Card className="border-2 shadow-sm bg-primary/5 p-4"><p className="text-[9px] font-black text-primary uppercase mb-1">Waste/Month</p><p className="text-lg font-black text-primary">600 Kg</p></Card>
                <Card className="border-2 shadow-sm bg-primary/5 p-4"><p className="text-[9px] font-black text-primary uppercase mb-1">Efficiency</p><p className="text-lg font-black text-primary">95%</p></Card>
            </div>
            <Card className="border-2 border-primary/30 bg-primary/[0.01]"><CardHeader className="bg-primary/5 border-b pb-3 flex row items-center gap-2"><Truck className="h-5 w-5 text-primary" /><CardTitle className="text-base font-black uppercase text-primary">Active Circuits</CardTitle></CardHeader><CardContent className="pt-4"><div className={`p-5 flex items-center justify-between border rounded-2xl bg-card border-l-4 ${gpRealData.circuit.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}><div className="flex-1 space-y-1 border-r border-dashed"><p className="font-black text-xs uppercase text-primary">Route: {gpRealData.circuit.id}</p><p className="text-[10px] font-bold uppercase">{gpRealData.circuit.mrf}</p></div><div className="flex-1 text-center px-6"><div className={`text-lg font-black ${gpRealData.circuit.isActiveToday ? 'text-green-700 animate-pulse' : ''}`}>{gpRealData.circuit.countdown}</div></div><div className="flex-1 text-right border-l border-dashed space-y-1 pl-6"><p className="font-black text-[10px] uppercase">{gpRealData.circuit.driver}</p><p className="text-[8px] font-bold uppercase text-muted-foreground">{gpRealData.circuit.vehicle}</p></div></div></CardContent></Card>
        </div>
      )}
    </div>
  );
}

export default function GpUlbDashboard() {
    return (<Suspense fallback={<div>Loading...</div>}><GpUlbDashboardContent /></Suspense>);
}
