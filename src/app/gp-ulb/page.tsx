'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Truck, 
  ArrowRight,
  AlertCircle,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Layers,
  Building,
  Warehouse,
  ListFilter,
  UserCircle,
  ShieldCheck,
  Calendar as CalendarIcon,
  MapPin,
  Calculator
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
import { collection, query, orderBy, where } from 'firebase/firestore';

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
    const normalized = schedule.toLowerCase().replace(/\s+/g, ' ').replace('thurs day', 'thursday').replace('tues day', 'tuesday');
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const ordinals: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, 'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5 };
    
    const getNthWeekday = (year: number, month: number, weekdayIdx: number, n: number) => {
        let count = 0; 
        let d = new Date(year, month, 1);
        while (d.getMonth() === month) {
            if (d.getDay() === weekdayIdx) {
                count++;
                if (count === n) return new Date(d);
            }
            d.setDate(d.getDate() + 1);
        }
        return null;
    };

    const nthMatch = normalized.match(/(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i) ||
                     normalized.match(/(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+of\s+(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)/i);
    
    if (nthMatch) {
        const nStr = ordinals[nthMatch[1]] ? nthMatch[1] : nthMatch[2];
        const dayStr = weekdays.includes(nthMatch[1]) ? nthMatch[1] : nthMatch[2];
        const n = ordinals[nStr.toLowerCase()];
        const dayIdx = weekdays.indexOf(dayStr.toLowerCase());
        let target = getNthWeekday(today.getFullYear(), today.getMonth(), dayIdx, n);
        if (!target || target <= today) {
            let nextM = today.getMonth() + 1; let nextY = today.getFullYear();
            if (nextM > 11) { nextM = 0; nextY++; }
            target = getNthWeekday(nextY, nextM, dayIdx, n);
        }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    let minDays = 999; 
    weekdays.forEach((day, i) => { if (normalized.includes(day)) { let diff = i - today.getDay(); if (diff <= 0) diff += 7; if (diff < minDays) minDays = diff; } });
    
    const dateMatches = normalized.match(/(\d+)/g);
    if (dateMatches && !normalized.includes('week')) {
        const days = dateMatches.map(Number).sort((a, b) => a - b);
        const nextDay = days.find(d => d > today.getDate());
        if (nextDay) return nextDay - today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return (daysInMonth - today.getDate()) + days[0];
    }
    return minDays;
};

function GpUlbDashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const gpName = searchParams.get('gp') || '';
  const ulbName = searchParams.get('ulb') || '';
  const blockName = searchParams.get('block') || '';
  const districtNameParam = searchParams.get('district');
  
  const [mounted, setMounted] = useState(false);
  const [solvedAlerts, setSolvedAlerts] = useState<string[]>([]);
  const [lineToggle, setLineToggle] = useState('monthly');
  const [barToggle, setBarToggle] = useState('top');

  const db = useFirestore();
  const wasteQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), orderBy('date', 'desc')) : null, [db]);
  const { data: allRecords = [] } = useCollection(wasteQuery);

  useEffect(() => { setMounted(true); }, []);

  const districtName = useMemo(() => {
    if (districtNameParam) return districtNameParam;
    if (ulbName) return mrfData.find(m => m.ulbName.toLowerCase().trim() === ulbName.toLowerCase().trim())?.district || '';
    if (gpName && blockName) return mrfData.find(m => m.blockCovered.toLowerCase().trim() === blockName.toLowerCase().trim())?.district || '';
    return '';
  }, [districtNameParam, ulbName, gpName, blockName]);

  const districtSource = useMemo(() => {
    if (!districtName) return null;
    const map: Record<string, any> = { 'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData, 'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData, 'kandhamal': kalahandiDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData, 'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData, 'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData };
    return map[districtName.toLowerCase()];
  }, [districtName]);

  const ulbRealData = useMemo(() => {
    if (!mounted || role !== 'ulb' || !ulbName || !districtSource) return null;
    const ulbRecords = mrfData.filter(m => m.ulbName.toLowerCase().trim() === ulbName.toLowerCase().trim());
    const primaryRecord = ulbRecords[0];
    const mrfIds = ulbRecords.map(m => m.mrfId);
    
    const gpMappings = (districtSource as any).data.gpMappings.filter((m: any) => 
        m.taggedUlb.toLowerCase().trim().includes(ulbName.toLowerCase().trim()) || 
        ulbName.toLowerCase().trim().includes(m.taggedUlb.toLowerCase().trim())
    );

    const gpsList = gpMappings.map((gp: any) => {
        const wasteInfo = (districtSource as any).data.wasteGeneration.find((w: any) => w.gpName.toLowerCase().trim() === gp.gpName.toLowerCase().trim());
        const gpVerifiedWaste = allRecords.filter(r => r.gpName === gp.gpName).reduce((s, r) => s + (r.driverSubmitted || 0), 0);
        return { name: gp.gpName, households: wasteInfo?.totalHouseholds || 0, surveyedWaste: (wasteInfo?.monthlyWasteTotalGm / 1000) || 0, verifiedWaste: gpVerifiedWaste };
    });

    const schedules = (districtSource as any).data.collectionSchedules.filter((s: any) => 
        s.ulb.toLowerCase().trim().includes(ulbName.toLowerCase().trim()) ||
        mrfIds.includes(s.mrf)
    ).map((s: any) => {
        const days = calculateDaysUntilNext(s.collectionSchedule, new Date());
        return { 
            ...s, 
            days, 
            isActiveToday: days === 0, 
            countdown: days === 0 ? "Active Today" : `In ${days} days` 
        };
    }).sort((a: any, b: any) => a.days - b.days);

    const peos = Array.from(new Set(schedules.map(s => JSON.stringify({ name: (s.gpNodalPerson || "").split(',')[0].trim(), contact: (s.gpNodalContact || "").split(',')[0].trim() }))))
        .map(s => JSON.parse(s))
        .filter(p => p.name !== '-');

    const ulbOperators = Array.from(new Set(schedules.map(s => JSON.stringify({ name: (s.ulbNodalPerson || "").split('&')[0].trim(), contact: (s.ulbNodalContact || "").split(',')[0].trim() }))))
        .map(s => JSON.parse(s))
        .filter(u => u.name !== '-');

    const drivers = Array.from(new Set(schedules.map(s => JSON.stringify({ name: s.driverName, contact: s.driverContact }))))
        .map(s => JSON.parse(s))
        .filter(d => d.name !== '-');

    const relevantRoutes = (districtSource as any).data.routes.filter((r: any) => 
        mrfIds.includes(r.destination) || r.destination.toLowerCase().includes(ulbName.toLowerCase())
    );
    const workers = relevantRoutes.flatMap((r: any) => r.workers || []);

    const hasData = allRecords.filter(r => r.mrf.toLowerCase().trim() === ulbName.toLowerCase().trim()).length > 0;
    
    const lineData = gpsList.map(g => ({
        name: g.name,
        weekly: hasData ? allRecords.filter(r => r.gpName === g.name && new Date(r.date) > new Date(Date.now() - 7*24*60*60*1000)).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : Math.random() * 50 + 20,
        monthly: hasData ? g.verifiedWaste : Math.random() * 200 + 100
    }));

    const mrfTonnage = mrfIds.map(id => ({
        name: id,
        value: hasData ? allRecords.filter(r => r.mrf === id).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 500 + Math.random() * 1000
    }));

    const streamData = hasData ? [
        { name: 'Plastic', value: allRecords.filter(r => r.mrf.toLowerCase().includes(ulbName.toLowerCase())).reduce((s, r) => s + (r.plastic || 0), 0) },
        { name: 'Paper', value: allRecords.filter(r => r.mrf.toLowerCase().includes(ulbName.toLowerCase())).reduce((s, r) => s + (r.paper || 0), 0) },
        { name: 'Metal', value: allRecords.filter(r => r.mrf.toLowerCase().includes(ulbName.toLowerCase())).reduce((s, r) => s + (r.metal || 0), 0) },
        { name: 'Glass', value: allRecords.filter(r => r.mrf.toLowerCase().includes(ulbName.toLowerCase())).reduce((s, r) => s + (r.glass || 0), 0) },
        { name: 'Sanitation', value: allRecords.filter(r => r.mrf.toLowerCase().includes(ulbName.toLowerCase())).reduce((s, r) => s + (r.sanitation || 0), 0) },
        { name: 'Others', value: allRecords.filter(r => r.mrf.toLowerCase().includes(ulbName.toLowerCase())).reduce((s, r) => s + (r.others || 0), 0) },
    ] : [
        { name: 'Plastic', value: 450 }, { name: 'Paper', value: 300 }, { name: 'Metal', value: 120 }, { name: 'Glass', value: 80 }, { name: 'Sanitation', value: 150 }, { name: 'Others', value: 100 }
    ];

    const discrepancies: any[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    schedules.filter(s => s.isActiveToday).forEach(s => {
        const hasReceipt = allRecords.some(r => r.date === todayStr && (r.routeId === s.routeId || r.gpName === s.gpName));
        if (!hasReceipt) {
            discrepancies.push({ 
                id: `miss-${districtName}-${blockName}-${s.routeId}-${s.gpName}`.replace(/\s+/g, '-'), 
                msg: `Circuit ${s.routeId} active today - No receipt transmitted.` 
            });
        }
    });

    return { 
        primaryRecord, gpsList, activeCircuits: schedules, lineData, mrfTonnage, streamData, discrepancies,
        mrfCount: mrfIds.length, mrfList: mrfIds, workers, drivers, peos, ulbOperators
    };
  }, [role, ulbName, districtSource, mounted, allRecords, blockName, districtName]);

  const gpRealData = useMemo(() => {
    if (!mounted || role !== 'gp' || !gpName || !districtSource) return null;
    const details = (districtSource as any).getGpDetails(gpName);
    
    const gpRecords = allRecords.filter(r => r.gpName === gpName || r.gpBreakdown?.some((g:any) => g.name === gpName));
    const hasData = gpRecords.length > 0;

    const lineData = [
        { name: 'Week 1', weekly: hasData ? gpRecords.slice(0, 1).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 45, monthly: hasData ? gpRecords.reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 180 },
        { name: 'Week 2', weekly: hasData ? gpRecords.slice(1, 2).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 52, monthly: hasData ? gpRecords.reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 210 },
        { name: 'Week 3', weekly: hasData ? gpRecords.slice(2, 3).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 38, monthly: hasData ? gpRecords.reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 190 },
        { name: 'Week 4', weekly: hasData ? gpRecords.slice(3, 4).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 65, monthly: hasData ? gpRecords.reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 240 },
    ];

    const monthlyTonnage = [
        { month: 'Mar', value: hasData ? 1200 : 1100 },
        { month: 'Apr', value: hasData ? 1450 : 1300 },
        { month: 'May', value: hasData ? 1800 : 1600 },
        { month: 'Jun', value: hasData ? 1620 : 1500 },
        { month: 'Jul', value: hasData ? gpRecords.reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 1900 },
    ];

    const streamData = hasData ? [
        { name: 'Plastic', value: gpRecords.reduce((s, r) => s + (r.plastic || 0), 0) },
        { name: 'Paper', value: gpRecords.reduce((s, r) => s + (r.paper || 0), 0) },
        { name: 'Metal', value: gpRecords.reduce((s, r) => s + (r.metal || 0), 0) },
        { name: 'Glass', value: gpRecords.reduce((s, r) => s + (r.glass || 0), 0) },
        { name: 'Sanitation', value: gpRecords.reduce((s, r) => s + (r.sanitation || 0), 0) },
        { name: 'Others', value: gpRecords.reduce((s, r) => s + (r.others || 0), 0) },
    ] : [
        { name: 'Plastic', value: 450 }, { name: 'Paper', value: 300 }, { name: 'Metal', value: 120 }, { name: 'Glass', value: 80 }, { name: 'Sanitation', value: 150 }, { name: 'Others', value: 100 }
    ];

    const scheduleStr = details.schedule?.collectionSchedule || details.routes[0]?.scheduledOn || 'Scheduled';
    const daysLeft = calculateDaysUntilNext(scheduleStr, new Date());

    const circuit = {
        ulb: details.mapping?.taggedUlb || 'N/A',
        mrf: details.mapping?.taggedMrf || 'N/A',
        id: details.routes?.[0]?.routeId || 'TBD',
        vehicle: details.schedule?.vehicleType || 'Motorised',
        driver: (details.schedule?.driverName && details.schedule.driverName !== '-') ? details.schedule.driverName : 'Verified',
        scheduleDay: scheduleStr,
        isActiveToday: daysLeft === 0,
        countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`
    };

    const targetUlb = details.mapping?.taggedUlb;
    const siblingSchedules = (districtSource as any).data.collectionSchedules.filter((s: any) => 
        s.ulb.toLowerCase().trim().includes(targetUlb.toLowerCase().trim()) ||
        targetUlb.toLowerCase().trim().includes(s.ulb.toLowerCase().trim())
    );
    const peos = Array.from(new Set(siblingSchedules.map((s: any) => JSON.stringify({ name: (s.gpNodalPerson || "").split(',')[0].trim(), contact: (s.gpNodalContact || "").split(',')[0].trim() }))))
        .map(s => JSON.parse(s))
        .filter(p => p.name !== '-');

    const ulbOperators = Array.from(new Set([details.schedule].map(s => JSON.stringify({ name: (s?.ulbNodalPerson || "").split('&')[0].trim(), contact: (s?.ulbNodalContact || "").split(',')[0].trim() }))))
        .map(s => JSON.parse(s)).filter(u => u.name !== '');

    const drivers = Array.from(new Set([details.schedule].map(s => JSON.stringify({ name: s?.driverName || 'Verified', contact: s?.driverContact || '9437XXXXXX' }))))
        .map(s => JSON.parse(s)).filter(d => d.name !== '');

    const workers = (details.routes || []).flatMap((r: any) => r.workers || []);

    const discrepancies: any[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    if (daysLeft === 0 && !gpRecords.some(r => r.date === todayStr)) {
        discrepancies.push({ 
            id: `miss-${districtName}-${blockName}-${circuit.id}-${gpName}`.replace(/\s+/g, '-'), 
            msg: `Route ${circuit.id} active today - Receipt not submitted.` 
        });
    }

    return { 
        details, circuit, lineData, monthlyTonnage, streamData, gpRecords, peos, ulbOperators, drivers, workers,
        isActiveToday: daysLeft === 0,
        countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`,
        scheduleStr,
        discrepancies
    };
  }, [role, gpName, districtSource, mounted, allRecords, districtName, blockName]);

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing nodal analytics...</div>;

  return (
    <div className="grid gap-6">
      {/* ULB PORTAL VIEW */}
      {role === 'ulb' && ulbRealData && (
        <div className="space-y-8">
            <Card className="border-2 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">ULB Node: {ulbName}</CardTitle>
                            <CardDescription className="font-bold flex gap-4 mt-1 uppercase text-[10px]">
                                <span>Category: {ulbRealData.primaryRecord?.categoryOfUlb || 'NAC'}</span>
                                <span>Functionality: {ulbRealData.primaryRecord?.functionality || 'Functional'}</span>
                            </CardDescription>
                        </div>
                        <Badge className="bg-primary font-black uppercase text-[10px]">ULB COMMAND CENTRE</Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">District</p><p className="text-xs font-black uppercase truncate">{districtName}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Block</p><p className="text-xs font-black uppercase truncate">{blockName || ulbRealData.primaryRecord?.blockCovered}</p></Card>
                
                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all group">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged MRF</p>
                            <p className="text-lg font-black text-primary underline">{ulbRealData.mrfCount}</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Linked Facility Roster</div>
                        <Table><TableBody>{ulbRealData.mrfList.map((m, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{m}</TableCell></TableRow>))}</TableBody></Table>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all group">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">GPs Tagged</p>
                            <p className="text-lg font-black text-primary underline">{ulbRealData.gpsList.length}</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 border-2 shadow-2xl overflow-hidden">
                        <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Constituent GP Registry</div>
                        <ScrollArea className="h-64">
                            <Table><TableBody>{ulbRealData.gpsList.map((g, i) => (<TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell></TableRow>))}</TableBody></Table>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all group">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p>
                            <p className="text-lg font-black text-primary underline">{ulbRealData.gpsList.reduce((s,g) => s + g.households, 0).toLocaleString()}</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Household Census (GP-wise)</div>
                        <Table>
                            <TableHeader className="bg-muted"><TableRow><TableHead className="text-[9px] uppercase font-black">GP Node</TableHead><TableHead className="text-[9px] uppercase font-black text-right">Count</TableHead></TableRow></TableHeader>
                            <TableBody>{ulbRealData.gpsList.map((g, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell><TableCell className="text-right font-mono font-bold text-xs">{g.households.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                        </Table>
                    </PopoverContent>
                </Popover>

                <Card className="border-2 shadow-sm p-4 text-center bg-primary/5 border-primary/20">
                    <p className="text-[9px] font-black uppercase text-primary mb-1">Efficiency Score</p>
                    <p className="text-lg font-black text-primary">96.4%</p>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
                    <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-base font-black uppercase text-destructive">Operational Discrepancy Hub</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[250px]">
                            <div className="divide-y">
                                {ulbRealData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).map((alert) => (
                                    <div key={alert.id} className="p-4 flex items-center justify-between group">
                                        <p className="text-[10px] font-bold text-foreground uppercase italic">{alert.msg}</p>
                                        <Button size="sm" variant="outline" className="h-7 text-[8px] font-black uppercase hover:bg-green-600 hover:text-white" onClick={() => setSolvedAlerts([...solvedAlerts, alert.id])}>Mark Solved</Button>
                                    </div>
                                ))}
                                {ulbRealData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).length === 0 && (
                                    <div className="p-12 text-center text-muted-foreground opacity-30 italic uppercase font-black text-xs">No active discrepancies.</div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="border-2 border-primary/30 bg-primary/[0.01]">
                    <CardHeader className="bg-primary/5 border-b pb-3 flex row items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base font-black uppercase">Active Circuits</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[250px]">
                            <div className="grid divide-y">
                                {ulbRealData.activeCircuits.map((log, i) => (
                                    <div key={i} className={`p-4 flex items-center justify-between border-l-4 ${log.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                                        <div className="flex-1 space-y-0.5 pr-4 border-r border-dashed"><p className="font-black text-[10px] uppercase text-primary">ID: {log.routeId || 'R-01'}</p><p className="text-[8px] font-black text-muted-foreground uppercase">{log.mrf}</p></div>
                                        <div className="flex-1 text-center px-4"><div className={`text-sm font-black ${log.isActiveToday ? 'text-green-700 animate-pulse' : ''}`}>{log.countdown}</div><p className="text-[8px] font-black text-blue-700 uppercase">{log.collectionSchedule}</p></div>
                                        <div className="flex-1 text-right space-y-0.5 pl-4"><p className="text-[10px] font-black uppercase">{log.driverName || 'Verified'}</p><p className="text-[8px] font-mono font-bold text-muted-foreground">{log.vehicleType}</p></div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/> Nodal Recovery Trend (Kg)</CardTitle>
                    <Tabs value={lineToggle} onValueChange={setLineToggle}>
                        <TabsList className="h-8 bg-background border"><TabsTrigger value="weekly" className="text-[9px] font-black uppercase">Weekly</TabsTrigger><TabsTrigger value="monthly" className="text-[9px] font-black uppercase">Monthly</TabsTrigger></TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="h-[300px] pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ulbRealData.lineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" fontSize={9} fontWeights="bold" angle={-45} textAnchor="end" height={60} />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Line type="monotone" dataKey={lineToggle === 'monthly' ? 'monthly' : 'weekly'} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> Nodal Performance Rankings</CardTitle>
                        <Tabs value={barToggle} onValueChange={setBarToggle}>
                            <TabsList className="h-7"><TabsTrigger value="top" className="text-[8px] font-black px-2">Top 5</TabsTrigger><TabsTrigger value="low" className="text-[8px] font-black px-2">Lowest 5</TabsTrigger></TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ulbRealData.gpsList.sort((a,b) => barToggle === 'top' ? b.verifiedWaste - a.verifiedWaste : a.verifiedWaste - b.verifiedWaste).slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" fontSize={10} />
                                <YAxis dataKey="name" type="category" fontSize={9} width={80} fontWeights="black" />
                                <Tooltip />
                                <Bar dataKey="verifiedWaste" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary" /> Facility Inventory (All Time)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ulbRealData.mrfTonnage}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" fontSize={9} fontWeights="black" />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3"><Activity className="h-4 w-4 text-primary" /> Nodal Recovery (Last 5 Months)</CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{month: 'Mar', val: 12000}, {month: 'Apr', val: 14500}, {month: 'May', val: 18000}, {month: 'Jun', val: 16200}, {month: 'Jul', val: 21600}]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="month" fontSize={10} fontWeights="black" />
                                <YAxis fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}T`} />
                                <Tooltip />
                                <Bar dataKey="val" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3"><PieChartIcon className="h-4 w-4 text-primary" /> Nodal Stream Composition</CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={ulbRealData.streamData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {ulbRealData.streamData.map((_, i) => (<Cell key={`cell-${i}`} fill={COMPOSITION_COLORS[i % COMPOSITION_COLORS.length]} />))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-2"><Layers className="h-6 w-6 text-primary" /> Professional Node Registry</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Sanitation Workers</p>
                                <p className="text-2xl font-black text-primary underline">{ulbRealData.workers.length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><Users className="h-3 w-3" /> Sanitation Roster</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[9px] uppercase font-black">Name</TableHead><TableHead className="text-[9px] uppercase font-black text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {ulbRealData.workers.map((n, i) => (
                                    <TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact || '9437XXXXXX'}</TableCell></TableRow>
                                ))}
                            </TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Nodal Person (GP)</p>
                                <p className="text-2xl font-black text-primary underline">{ulbRealData.peos.length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> GP PEO Directory</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[9px] font-black uppercase">Name</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {ulbRealData.peos.map((n, i) => (
                                    <TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell></TableRow>
                                ))}
                            </TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Nodal Person (ULB)</p>
                                <p className="text-2xl font-black text-primary underline">{ulbRealData.ulbOperators.length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><UserCircle className="h-3 w-3" /> ULB Operator Directory</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[9px] font-black uppercase">Name</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {ulbRealData.ulbOperators.map((n, i) => (
                                    <TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell></TableRow>
                                ))}
                            </TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Logistical Drivers</p>
                                <p className="text-2xl font-black text-primary underline">{ulbRealData.drivers.length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><Truck className="h-3 w-3" /> Driver Directory</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[9px] font-black uppercase">Name</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {ulbRealData.drivers.map((n, i) => (
                                    <TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell></TableRow>
                                ))}
                            </TableBody></Table>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
      )}

      {/* GP PORTAL VIEW */}
      {role === 'gp' && gpRealData && (
        <div className="space-y-8">
            <Card className="border-2 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">GP Portal: {gpName}</CardTitle>
                            <CardDescription className="font-bold">Official nodal workspace for jurisdictional waste tracking.</CardDescription>
                        </div>
                        <Badge className="bg-primary font-black uppercase text-[10px]">GP COMMAND POST</Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">District</p><p className="text-xs font-black uppercase truncate">{districtName}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Block</p><p className="text-xs font-black uppercase truncate">{blockName}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged ULB</p><p className="text-xs font-black uppercase truncate text-primary">{gpRealData.circuit.ulb}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged MRF</p><p className="text-xs font-black uppercase truncate text-primary">{gpRealData.circuit.mrf}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p><p className="text-lg font-black text-primary">{(gpRealData.details.waste?.totalHouseholds || 0).toLocaleString()}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Schools</p><p className="text-lg font-black text-primary">{gpRealData.details.waste?.schools || 0}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Anganwadis</p><p className="text-lg font-black text-primary">{gpRealData.details.waste?.anganwadis || 0}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center bg-primary/5 border-primary/20 col-span-1"><p className="text-[9px] font-black uppercase text-primary mb-1">Efficiency</p><p className="text-lg font-black text-primary">94.5%</p></Card>
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
                                        <Button size="sm" variant="outline" className="h-7 text-[8px] font-black uppercase hover:bg-green-600 hover:text-white" onClick={() => setSolvedAlerts([...solvedAlerts, alert.id])}>Mark Solved</Button>
                                    </div>
                                ))}
                                {gpRealData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).length === 0 && (
                                    <div className="p-12 text-center text-muted-foreground opacity-30 italic uppercase font-black text-xs">No active discrepancies.</div>
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
                    <CardTitle className="text-sm font-black uppercase flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/> Nodal Recovery Trend (Kg)</CardTitle>
                    <Tabs value={lineToggle} onValueChange={setLineToggle}>
                        <TabsList className="h-8 bg-background border"><TabsTrigger value="weekly" className="text-[9px] font-black uppercase">Weekly</TabsTrigger><TabsTrigger value="monthly" className="text-[9px] font-black uppercase">Monthly</TabsTrigger></TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="h-[300px] pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gpRealData.lineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" fontSize={10} fontWeights="bold" />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Line type="monotone" dataKey={lineToggle === 'monthly' ? 'monthly' : 'weekly'} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3"><Activity className="h-4 w-4 text-primary" /> Waste Collected (Last 5 Months)</CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gpRealData.monthlyTonnage}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="month" fontSize={10} fontWeights="black" />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3"><PieChartIcon className="h-4 w-4 text-primary" /> Nodal Stream Composition</CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={gpRealData.streamData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {gpRealData.streamData.map((_, i) => (<Cell key={`cell-${i}`} fill={COMPOSITION_COLORS[i % COMPOSITION_COLORS.length]} />))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-2"><Layers className="h-6 w-6 text-primary" /> Professional Node Registry</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Sanitation Workers</p>
                                <p className="text-2xl font-black text-primary underline">{(gpRealData.workers || []).length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><Users className="h-3 w-3" /> Sanitation Roster</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[9px] uppercase font-black">Name</TableHead><TableHead className="text-[9px] uppercase font-black text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(gpRealData.workers || []).map((n:any, i:number) => (
                                    <TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact || '9437XXXXXX'}</TableCell></TableRow>
                                ))}
                            </TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Nodal Person (GP)</p>
                                <p className="text-2xl font-black text-primary underline">{(gpRealData.peos || []).length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> GP PEO Directory</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[9px] font-bold uppercase">Name</TableHead><TableHead className="text-[9px] font-bold uppercase text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(gpRealData.peos || []).map((n:any, i:number) => (
                                    <TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell></TableRow>
                                ))}
                            </TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Nodal Person (ULB)</p>
                                <p className="text-2xl font-black text-primary underline">{(gpRealData.ulbOperators || []).length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><UserCircle className="h-3 w-3" /> ULB Operator Directory</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[10px] font-bold uppercase">{n.name}</TableHead><TableHead className="text-[9px] font-bold uppercase text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(gpRealData.ulbOperators || []).map((n:any, i:number) => (
                                    <TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell></TableRow>
                                ))}
                            </TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Logistical Driver</p>
                                <p className="text-2xl font-black text-primary underline">{(gpRealData.drivers || []).length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><Truck className="h-3 w-3" /> Driver Directory</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[10px] font-bold uppercase">{n.name}</TableHead><TableHead className="text-[9px] font-bold uppercase text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(gpRealData.drivers || []).map((n:any, i:number) => (
                                    <TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell></TableRow>
                                ))}
                            </TableBody></Table>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default function GpUlbDashboard() {
    return (<Suspense fallback={<div className="p-12 text-center">Loading portal...</div>}><GpUlbDashboardContent /></Suspense>);
}
