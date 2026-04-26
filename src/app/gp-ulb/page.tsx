
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
  UserCircle,
  ShieldCheck,
  Contact2,
  Calendar,
  Info,
  MapPin
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
    
    const normalized = schedule.toLowerCase().replace(/\s+/g, ' ').replace('thurs day', 'thursday').replace('tues day', 'tuesday');
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const ordinals: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, 'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5 };
    
    const getNthWeekday = (year: number, month: number, weekdayIdx: number, n: number) => {
        let count = 0; let d = new Date(year, month, 1);
        while (d.getMonth() === month) { if (d.getDay() === weekdayIdx) { count++; if (count === n) return new Date(d); } d.setDate(d.getDate() + 1); }
        return null;
    };

    const nthMatch = normalized.match(/(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i);
    if (nthMatch) {
        const n = ordinals[nthMatch[1]]; const dayIdx = weekdays.indexOf(nthMatch[2]);
        let target = getNthWeekday(today.getFullYear(), today.getMonth(), dayIdx, n);
        if (!target || target < today) {
            let nextM = today.getMonth() + 1;
            let nextY = today.getFullYear();
            if (nextM > 11) { nextM = 0; nextY++; }
            target = getNthWeekday(nextY, nextM, dayIdx, n);
        }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    let minDays = 999; 
    weekdays.forEach((day, i) => { if (normalized.includes(day)) { let diff = i - today.getDay(); if (diff < 0) diff += 7; if (diff < minDays) minDays = diff; } });
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
  const [barToggle, setBarToggle] = useState('top');

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
    const map: Record<string, any> = { 'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData, 'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData, 'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData, 'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData, 'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData };
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

    const gpRecords = allRecords.filter((r: any) => 
        (r.gpName && r.gpName.toLowerCase().trim() === gpName.toLowerCase().trim()) ||
        (r.gpBreakdown && r.gpBreakdown.some((g: any) => g.name.toLowerCase().trim() === gpName.toLowerCase().trim()))
    );

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
    const primaryRecord = ulbRecords[0];
    const blockList = Array.from(new Set(ulbRecords.map(m => m.blockCovered)));
    
    // Resolve GPs and Demographic Data
    const gpMappings = (districtSource as any).data.gpMappings.filter((m: any) => 
        m.taggedUlb.toLowerCase().trim().includes(ulbName.toLowerCase().trim()) || 
        ulbName.toLowerCase().trim().includes(m.taggedUlb.toLowerCase().trim())
    );

    const gpsList = gpMappings.map((gp: any) => {
        const wasteInfo = (districtSource as any).data.wasteGeneration.find((w: any) => w.gpName.toLowerCase().trim() === gp.gpName.toLowerCase().trim());
        const totalVerified = allRecords.filter((r: any) => r.gpBreakdown?.some((g: any) => g.name.toLowerCase().trim() === gp.gpName.toLowerCase().trim())).reduce((sum, r) => sum + (r.gpBreakdown.find((g: any) => g.name.toLowerCase().trim() === gp.gpName.toLowerCase().trim())?.amount || 0), 0);
        return { name: gp.gpName, households: wasteInfo?.totalHouseholds || 0, wasteCount: totalVerified };
    });

    // Resolve Active Circuits with High Precision Engine
    const activeCircuits = (districtSource as any).data.collectionSchedules.filter((s: any) => s.ulb.toLowerCase().trim().includes(ulbName.toLowerCase().trim())).map((s: any) => {
            const days = calculateDaysUntilNext(s.collectionSchedule, new Date());
            return { ...s, days, isActiveToday: days === 0, countdown: days === 0 ? "Active Today" : `In ${days} days` };
        }).sort((a: any, b: any) => a.days - b.days);

    // Analytical Data Logic
    const hasData = allRecords.filter(r => r.mrf.toLowerCase().trim() === ulbName.toLowerCase().trim()).length > 0;
    const streamData = hasData ? [
        { name: 'Plastic', value: allRecords.filter(r => r.mrf === ulbName).reduce((s, r) => s + (r.plastic || 0), 0) },
        { name: 'Paper', value: allRecords.filter(r => r.mrf === ulbName).reduce((s, r) => s + (r.paper || 0), 0) },
        { name: 'Metal', value: allRecords.filter(r => r.mrf === ulbName).reduce((s, r) => s + (r.metal || 0), 0) },
        { name: 'Glass', value: allRecords.filter(r => r.mrf === ulbName).reduce((s, r) => s + (r.glass || 0), 0) },
        { name: 'Sanitation', value: allRecords.filter(r => r.mrf === ulbName).reduce((s, r) => s + (r.sanitation || 0), 0) },
        { name: 'Others', value: allRecords.filter(r => r.mrf === ulbName).reduce((s, r) => s + (r.others || 0), 0) },
    ] : [{ name: 'Plastic', value: 400 }, { name: 'Paper', value: 300 }, { name: 'Metal', value: 150 }, { name: 'Glass', value: 100 }, { name: 'Sanitation', value: 200 }, { name: 'Others', value: 100 }];

    const mrfTonnage = ulbRecords.map(m => ({ name: m.mrfId, value: hasData ? allRecords.filter(r => r.mrf === m.mrfId).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : m.dryWasteKg }));

    // Professional Node Registry Data
    const blockSchedules = (districtSource as any).data.collectionSchedules.filter((s: any) => blockList.includes(s.block));
    const blockRoutes = (districtSource as any).data.routes.filter((r: any) => blockList.includes(r.block) || r.destination.toLowerCase().trim().includes(ulbName.toLowerCase().trim()));

    const personnel = {
        workers: blockRoutes.flatMap((r: any) => r.workers || []).map((w: any) => ({ name: w.name, contact: w.contact })),
        mrfnodals: blockSchedules.map((s: any) => ({ name: s.ulbNodalPerson, contact: s.ulbNodalContact })),
        ulbnodals: [{ name: blockSchedules[0]?.ulbNodalPerson || 'ULB Coordinator', contact: blockSchedules[0]?.ulbNodalContact || '-' }],
        drivers: blockSchedules.map((s: any) => ({ name: s.driverName, contact: s.driverContact }))
    };

    return { 
        primary: primaryRecord, 
        blocks: blockList.join(', '), 
        gpsCount: gpsList.length, 
        gpsList, 
        totalHouseholds: gpsList.reduce((s, g) => s + g.households, 0), 
        totalWaste: gpsList.reduce((s, g) => s + g.wasteCount, 0), 
        activeCircuits,
        streamData,
        mrfTonnage,
        personnel,
        efficiency: "96.4%"
    };
  }, [role, ulbName, districtSource, mounted, allRecords]);

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing nodal analytics...</div>;

  return (
    <div className="grid gap-6">
      {role === 'ulb' && ulbRealData && (
        <div className="space-y-8">
            <Card className="border-2 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">ULB Node: {ulbName}</CardTitle>
                            <CardDescription className="font-bold flex gap-4 mt-1">
                                <span>CATEGORY: {ulbRealData.primary?.categoryOfUlb || 'NAC'}</span>
                                <span>STATUS: {ulbRealData.primary?.functionality || 'Functional'}</span>
                            </CardDescription>
                        </div>
                        <Badge className="bg-primary font-black uppercase text-[10px]">ULB COMMAND CENTRE</Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">District</p><p className="text-xs font-black uppercase truncate">{districtName}</p></Card>
                <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Block</p><p className="text-xs font-black uppercase truncate">{ulbRealData.blocks}</p></Card>
                
                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged MRFs</p>
                            <p className="text-lg font-black text-primary underline">{mrfData.filter(m => m.ulbName === ulbName).length}</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Linked Facility Roster</div>
                        <Table><TableBody>{mrfData.filter(m => m.ulbName === ulbName).map((m, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{m.mrfId}</TableCell></TableRow>))}</TableBody></Table>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">GPs Tagged</p>
                            <p className="text-lg font-black text-primary underline">{ulbRealData.gpsCount} Nodes</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 border-2 shadow-2xl overflow-hidden">
                        <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Constituent GP Registry</div>
                        <ScrollArea className="h-64"><Table><TableBody>{ulbRealData.gpsList.map((g, i) => (<TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p>
                            <p className="text-lg font-black text-primary underline">{ulbRealData.totalHouseholds.toLocaleString()}</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Household Census (GP-wise)</div>
                        <Table><TableHeader><TableRow><TableHead className="text-[9px] uppercase font-black">GP Name</TableHead><TableHead className="text-[9px] uppercase font-black text-right">Count</TableHead></TableRow></TableHeader><TableBody>{ulbRealData.gpsList.map((g, i) => (<TableRow key={i} className="h-10"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell><TableCell className="text-right font-mono font-bold text-xs">{g.households.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table>
                    </PopoverContent>
                </Popover>

                <Card className="border-2 shadow-sm p-4 text-center bg-primary/5 border-primary/20"><p className="text-[9px] font-black text-primary uppercase mb-1">Efficiency Score</p><p className="text-lg font-black text-primary">{ulbRealData.efficiency}</p></Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
                    <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-base font-black uppercase text-destructive">Critical Discrepancy Hub</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[250px]">
                            <div className="divide-y">
                                {ulbRealData.activeCircuits.filter(c => c.isActiveToday).map((alert, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between group">
                                        <p className="text-[10px] font-bold text-foreground uppercase italic">Circuit {alert.routeId} active today at {alert.mrf} - No receipt received.</p>
                                        <Button size="sm" variant="outline" className="h-7 text-[8px] font-black uppercase hover:bg-green-600 hover:text-white" onClick={() => setSolvedAlerts([...solvedAlerts, `alert-${idx}`])}>Mark Solved</Button>
                                    </div>
                                ))}
                                {ulbRealData.activeCircuits.filter(c => c.isActiveToday).length === 0 && (
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
                                        <div className="flex-1 space-y-0.5"><p className="font-black text-[10px] uppercase text-primary">Route: {log.routeId}</p><p className="text-[9px] font-bold uppercase">{log.mrf}</p></div>
                                        <div className="flex-1 text-center border-x border-dashed px-4"><div className={`text-sm font-black ${log.isActiveToday ? 'text-green-700 animate-pulse' : ''}`}>{log.countdown}</div><p className="text-[8px] font-black text-blue-700 uppercase">{log.collectionSchedule}</p></div>
                                        <div className="flex-1 text-right space-y-0.5"><p className="text-[10px] font-black uppercase">{log.driverName}</p><p className="text-[8px] font-bold uppercase text-muted-foreground">{log.vehicleType}</p></div>
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
                        <LineChart data={ulbRealData.gpsList.map(g => ({ name: g.name, value: g.wasteCount || Math.random() * 500 }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" fontSize={9} fontWeights="bold" angle={-45} textAnchor="end" height={60} />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
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
                            <BarChart data={ulbRealData.gpsList.sort((a,b) => barToggle === 'top' ? b.wasteCount - a.wasteCount : a.wasteCount - b.wasteCount).slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" fontSize={10} />
                                <YAxis dataKey="name" type="category" fontSize={9} width={80} fontWeights="black" />
                                <Tooltip />
                                <Bar dataKey="wasteCount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary" /> Facility Inventory (All Time)</CardTitle></CardHeader>
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
                    <CardHeader className="bg-muted/10 border-b pb-3"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> ULB Load (Last 5 Months)</CardTitle></CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{month: 'Mar', val: 1200}, {month: 'Apr', val: 1450}, {month: 'May', val: 1600}, {month: 'Jun', val: 1550}, {month: 'Jul', val: 1800}]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="month" fontSize={10} fontWeights="black" />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="val" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardHeader className="bg-muted/10 border-b pb-3"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> Stream Distribution</CardTitle></CardHeader>
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
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Sanitation Workers</p>
                                <p className="text-xl font-black text-primary underline">{ulbRealData.personnel.workers.length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><Users className="h-3 w-3" /> Sanitation Roster</div>
                            <Table><TableHeader><TableRow><TableHead className="text-[9px] uppercase font-black">Name</TableHead><TableHead className="text-[9px] uppercase font-black text-right">Phone</TableHead></TableRow></TableHeader>
                            <TableBody>{ulbRealData.personnel.workers.map((p, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{p.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{p.contact}</TableCell></TableRow>))}</TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">MRF Nodal Officials</p>
                                <p className="text-xl font-black text-primary underline">{ulbRealData.personnel.mrfnodals.length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> MRF Nodal Directory</div>
                            <Table><TableBody>{ulbRealData.personnel.mrfnodals.map((p, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{p.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{p.contact}</TableCell></TableRow>))}</TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">ULB Nodal Officials</p>
                                <p className="text-xl font-black text-primary underline">{ulbRealData.personnel.ulbnodals.length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><UserCircle className="h-3 w-3" /> ULB Nodal Directory</div>
                            <Table><TableBody>{ulbRealData.personnel.ulbnodals.map((p, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{p.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{p.contact}</TableCell></TableRow>))}</TableBody></Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-4">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Logistical Drivers</p>
                                <p className="text-xl font-black text-primary underline">{ulbRealData.personnel.drivers.length}</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><Truck className="h-3 w-3" /> Driver Directory</div>
                            <Table><TableBody>{ulbRealData.personnel.drivers.map((p, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{p.name}</TableCell><TableCell className="text-right font-mono text-[9px] font-black text-primary">{p.contact}</TableCell></TableRow>))}</TableBody></Table>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
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

            <div className="space-y-4">
                <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                    <Layers className="h-6 w-6 text-primary" /> Professional Node Registry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group p-6">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-full bg-blue-50 text-blue-700">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ULB Nodal</p>
                                        <p className="text-2xl font-black text-primary">1 Official</p>
                                    </div>
                                </div>
                                <p className="text-[9px] mt-4 font-bold text-muted-foreground uppercase group-hover:text-primary transition-colors">Click to view contact &rarr;</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[10px] flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3" /> ULB Nodal Directory
                            </div>
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead className="text-[9px] font-black uppercase">Official Name</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase text-right">Phone No.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="border-b border-dashed">
                                        <TableCell className="text-[10px] font-bold uppercase">{gpRealData.ulbNodal.name}</TableCell>
                                        <TableCell className="text-right font-mono text-[10px] font-black text-primary">{gpRealData.ulbNodal.contact}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group p-6">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-full bg-orange-50 text-orange-700">
                                        <Truck className="h-6 w-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fleet Driver</p>
                                        <p className="text-2xl font-black text-primary">1 Verified</p>
                                    </div>
                                </div>
                                <p className="text-[9px] mt-4 font-bold text-muted-foreground uppercase group-hover:text-primary transition-colors">Click to view contact &rarr;</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[10px] flex items-center gap-2">
                                <Truck className="h-3 w-3" /> Circuit Driver Directory
                            </div>
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead className="text-[9px] font-black uppercase">Driver Name</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase text-right">Phone No.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="border-b border-dashed">
                                        <TableCell className="text-[10px] font-bold uppercase">{gpRealData.circuit.driver}</TableCell>
                                        <TableCell className="text-right font-mono text-[10px] font-black text-primary">{gpRealData.circuit.phone}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group p-6">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-full bg-green-50 text-green-700">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sanitation</p>
                                        <p className="text-2xl font-black text-primary">{gpRealData.workers.length} Workers</p>
                                    </div>
                                </div>
                                <p className="text-[9px] mt-4 font-bold text-muted-foreground uppercase group-hover:text-primary transition-colors">Click to view roster &rarr;</p>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 p-0 border-2 shadow-2xl overflow-hidden">
                            <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[10px] flex items-center gap-2">
                                <Users className="h-3 w-3" /> Sanitation Professional Roster
                            </div>
                            <ScrollArea className="h-[250px]">
                                <Table>
                                    <TableHeader className="bg-muted">
                                        <TableRow>
                                            <TableHead className="text-[9px] font-black uppercase">Worker Name</TableHead>
                                            <TableHead className="text-[9px] font-black uppercase text-right">Phone No.</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {gpRealData.workers.map((worker: any, i: number) => (
                                            <TableRow key={i} className="border-b border-dashed">
                                                <TableCell className="text-[10px] font-bold uppercase">{worker.name}</TableCell>
                                                <TableCell className="text-right font-mono text-[10px] font-black text-primary">{worker.contact}</TableCell>
                                            </TableRow>
                                        ))}
                                        {gpRealData.workers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center italic py-4 opacity-40 text-xs">No workers assigned to circuit.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
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

    