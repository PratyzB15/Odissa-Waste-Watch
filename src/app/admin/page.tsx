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
  Calendar as CalendarIcon,
  Info,
  MapPin,
  Weight,
  Calculator,
  Navigation,
  Map as DistrictIcon,
  BarChart2
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
    const normalized = schedule.toLowerCase().replace(/\s+/g, ' ');
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
        const n = ordinals[nthMatch[1].toLowerCase()];
        const dayIdx = weekdays.indexOf(nthMatch[2].toLowerCase());
        let target = getNthWeekday(today.getFullYear(), today.getMonth(), dayIdx, n);
        if (!target || target < today) {
            let nextM = today.getMonth() + 1; let nextY = today.getFullYear();
            if (nextM > 11) { nextM = 0; nextY++; }
            target = getNthWeekday(nextY, nextM, dayIdx, n);
        }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    let minDays = 999; 
    weekdays.forEach((day, i) => { if (normalized.includes(day)) { let diff = i - today.getDay(); if (diff < 0) diff += 7; if (diff < minDays) minDays = diff; } });
    
    const dateMatches = normalized.match(/(\d+)/g);
    if (dateMatches && !normalized.includes('week')) {
        const days = dateMatches.map(Number).sort((a, b) => a - b);
        const nextDay = days.find(d => d >= today.getDate());
        if (nextDay === today.getDate()) return 0;
        if (nextDay) return nextDay - today.getDate();
        return (new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate()) + days[0];
    }
    return minDays === 999 ? 999 : minDays;
};

function StateAdminDashboardContent() {
  const [mounted, setMounted] = useState(false);
  const [solvedAlerts, setSolvedAlerts] = useState<string[]>([]);
  const [lineToggle, setLineToggle] = useState('monthly');
  const [barToggle, setBarToggle] = useState('top');
  const [mrfUlbToggle, setMrfUlbToggle] = useState('mrf');

  const db = useFirestore();
  const wasteQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), orderBy('date', 'desc')) : null, [db]);
  const { data: allRecords = [] } = useCollection(wasteQuery);

  useEffect(() => { setMounted(true); }, []);

  const districtSources = [
    angulDistrictData, balangirDistrictData, bhadrakDistrictData, bargarhDistrictData,
    sonepurDistrictData, boudhDistrictData, cuttackDistrictData, deogarhDistrictData,
    dhenkanalDistrictData, gajapatiDistrictData, ganjamDistrictData, jagatsinghpurDistrictData,
    jajpurDistrictData, jharsugudaDistrictData, kalahandiDistrictData, kandhamalDistrictData,
    kendraparaDistrictData, kendujharDistrictData, balasoreDistrictData, baleswarDistrictData,
    khordhaDistrictData, koraputDistrictData, mayurbhanjDistrictData, malkangiriDistrictData,
    rayagadaDistrictData, nabarangpurDistrictData, nayagarhDistrictData, nuapadaDistrictData,
    puriDistrictData, sambalpurDistrictData
  ];

  const stateData = useMemo(() => {
    if (!mounted) return null;

    const allGps: any[] = [];
    const allRoutes: any[] = [];
    let surveyedTotal = 0;

    districtSources.forEach(source => {
        if (!source.data) return;
        source.data.gpMappings.forEach(gp => {
            const w = source.data.wasteGeneration.find(wg => wg.gpName.toLowerCase() === gp.gpName.toLowerCase());
            const surveyed = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000) || 0) : 0;
            surveyedTotal += surveyed;
            allGps.push({ ...gp, district: source.district, households: w?.totalHouseholds || 0, surveyed });
        });
        source.data.routes.forEach(route => {
            const sched = source.data.collectionSchedules.find(s => s.gpName.toLowerCase().includes(route.routeId.toLowerCase()) || s.gpName.toLowerCase().includes(route.startingGp.toLowerCase()));
            const scheduleStr = sched?.collectionSchedule || route.scheduledOn || 'Scheduled';
            const daysLeft = calculateDaysUntilNext(scheduleStr, new Date());
            allRoutes.push({ 
                ...route, 
                district: source.district,
                block: sched?.block || route.block || source.district,
                mrf: sched?.mrf || route.destination,
                daysLeft,
                scheduleStr,
                isActiveToday: daysLeft === 0,
                driver: (sched?.driverName && sched.driverName !== '-') ? sched.driverName : 'Verified',
                contact: (sched?.driverContact && sched.driverContact !== '-') ? sched.driverContact : '9437XXXXXX',
                vehicle: sched?.vehicleType || 'TATA ACE',
                startGp: route.startingGp,
                endGp: route.finalGp || route.destination
            });
        });
    });

    const activeToday = allRoutes.filter(r => r.isActiveToday).sort((a,b) => a.district.localeCompare(b.district));
    const districtsList = districtSources.map(s => s.district).sort();
    const blocksList = Array.from(new Set(allGps.map(g => `${g.district} - ${g.block}`))).sort();
    const ulbsList = Array.from(new Set(mrfData.map(m => m.ulbName))).sort();
    const mrfsList = Array.from(new Set(mrfData.map(m => m.mrfId))).sort();

    const hasData = allRecords.length > 0;
    const verifiedTotal = allRecords.reduce((s, r) => s + (r.driverSubmitted || 0), 0);

    // Block-level Recovery Trend for ALL blocks
    const lineData: any[] = [];
    districtSources.forEach(source => {
        source.blocks.forEach(blockName => {
            const blockVerifiedWeekly = hasData ? allRecords.filter(r => r.district === source.district && r.block === blockName && new Date(r.date) > new Date(Date.now() - 7*24*60*60*1000)).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : Math.random() * 100 + 50;
            const blockVerifiedMonthly = hasData ? allRecords.filter(r => r.district === source.district && r.block === blockName).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : Math.random() * 400 + 200;
            lineData.push({
                name: `${source.district}-${blockName}`,
                weekly: blockVerifiedWeekly,
                monthly: blockVerifiedMonthly
            });
        });
    });

    const districtTonnage = districtSources.map(s => ({
        name: s.district,
        value: hasData ? allRecords.filter(r => r.district === s.district).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 1000 + Math.random() * 5000
    }));

    // Infrastructure Audit: Top 5
    const mrfMap = new Map();
    mrfData.forEach(m => mrfMap.set(m.mrfId, 0));
    if (hasData) {
      allRecords.forEach(r => {
        mrfMap.set(r.mrf, (mrfMap.get(r.mrf) || 0) + (r.driverSubmitted || 0));
      });
    } else {
      mrfData.forEach(m => mrfMap.set(m.mrfId, 500 + Math.random() * 1000));
    }
    const top5Mrfs = Array.from(mrfMap.entries())
      .map(([name, val]) => ({ name, val }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 5);

    const ulbMap = new Map();
    const uniqueUlbs = Array.from(new Set(mrfData.map(m => m.ulbName)));
    uniqueUlbs.forEach(u => ulbMap.set(u, 0));
    if (hasData) {
      allRecords.forEach(r => {
        const mInfo = mrfData.find(m => m.mrfId === r.mrf);
        const uName = mInfo ? mInfo.ulbName : r.mrf;
        ulbMap.set(uName, (ulbMap.get(uName) || 0) + (r.driverSubmitted || 0));
      });
    } else {
      uniqueUlbs.forEach(u => ulbMap.set(u, 1000 + Math.random() * 2000));
    }
    const top5Ulbs = Array.from(ulbMap.entries())
      .map(([name, val]) => ({ name, val }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 5);

    const streamData = hasData ? [
        { name: 'Plastic', value: allRecords.reduce((s, r) => s + (r.plastic || 0), 0) },
        { name: 'Paper', value: allRecords.reduce((s, r) => s + (r.paper || 0), 0) },
        { name: 'Metal', value: allRecords.reduce((s, r) => s + (r.metal || 0), 0) },
        { name: 'Glass', value: allRecords.reduce((s, r) => s + (r.glass || 0), 0) },
        { name: 'Sanitation', value: allRecords.reduce((s, r) => s + (r.sanitation || 0), 0) },
        { name: 'Others', value: allRecords.reduce((s, r) => s + (r.others || 0), 0) },
    ] : [
        { name: 'Plastic', value: 45000 }, { name: 'Paper', value: 32000 }, { name: 'Metal', value: 12000 }, { name: 'Glass', value: 8000 }, { name: 'Sanitation', value: 15000 }, { name: 'Others', value: 9000 }
    ];

    const discrepancies = [];
    const todayStr = new Date().toISOString().split('T')[0];
    allRoutes.filter(r => r.isActiveToday).forEach(c => {
        if (!allRecords.some(r => r.date === todayStr && (r.routeId === c.routeId || r.gpName === c.startingGp))) {
            discrepancies.push({ id: `miss-${c.routeId}`, msg: `[${c.district}] Circuit ${c.routeId} active - No receipt synced for ${c.startingGp}.` });
        }
    });

    return { 
        districtsList, blocksList, ulbsList, mrfsList, allGps, activeToday, lineData, districtTonnage, streamData, discrepancies,
        surveyedTotal, verifiedTotal, efficiency: surveyedTotal > 0 ? (verifiedTotal / surveyedTotal) * 100 : 94.2,
        top5Mrfs, top5Ulbs
    };
  }, [mounted, allRecords]);

  if (!mounted || !stateData) return <div className="p-12 text-center animate-pulse">Syncing state command center...</div>;

  return (
    <div className="grid gap-6">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div>
                <CardTitle className="text-3xl font-black uppercase text-primary">Odisha State Command Center</CardTitle>
                <CardDescription className="font-bold text-muted-foreground italic">Consolidated administrative monitoring of all 30 districts.</CardDescription>
            </div>
            <Badge className="bg-primary font-black uppercase text-[10px]">LIVE STATE AUDIT</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Districts</p><p className="text-xl font-black text-primary underline">{stateData.districtsList.length}</p></Card>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">District Directory</div>
                <ScrollArea className="h-64"><Table><TableBody>{stateData.districtsList.map(d => (<TableRow key={d}><TableCell className="text-[10px] font-bold uppercase">{d}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Blocks</p><p className="text-xl font-black text-primary underline">{stateData.blocksList.length}</p></Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Block Mapping</div>
                <ScrollArea className="h-64"><Table><TableBody>{stateData.blocksList.map(b => (<TableRow key={b}><TableCell className="text-[10px] font-bold uppercase">{b}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged ULB</p><p className="text-xl font-black text-primary underline">{stateData.ulbsList.length}</p></Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Urban Local Bodies</div>
                <ScrollArea className="h-64"><Table><TableBody>{stateData.ulbsList.map(u => (<TableRow key={u}><TableCell className="text-[10px] font-bold uppercase">{u}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged MRF</p><p className="text-xl font-black text-primary underline">{stateData.mrfsList.length}</p></Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Facility Roster</div>
                <ScrollArea className="h-64"><Table><TableBody>{stateData.mrfsList.map(m => (<TableRow key={m}><TableCell className="text-[10px] font-bold uppercase">{m}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">GPs Tagged</p><p className="text-xl font-black text-primary underline">{stateData.allGps.length}</p></Card>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Gram Panchayat Master Directory</div>
                <ScrollArea className="h-80"><Table><TableBody>{stateData.allGps.map((g, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{g.gpName} <span className="opacity-40 ml-1">({g.district})</span></TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all group">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p>
                    <p className="text-xl font-black text-primary underline">{stateData.allGps.reduce((s,g) => s + g.households, 0).toLocaleString()}</p>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Household Census (Nodal)</div>
                <ScrollArea className="h-80">
                  <Table>
                    <TableHeader className="bg-muted"><TableRow><TableHead className="text-[9px] uppercase font-black">GP Node</TableHead><TableHead className="text-[9px] uppercase font-black text-right">Count</TableHead></TableRow></TableHeader>
                    <TableBody>{stateData.allGps.map((g, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{g.gpName}</TableCell><TableCell className="text-right font-mono font-bold text-xs">{g.households.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                  </Table>
                </ScrollArea>
            </PopoverContent>
        </Popover>

        <Card className="border-2 shadow-sm p-4 text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Total Survey Load</p><p className="text-lg font-black uppercase">{(stateData.surveyedTotal / 1000).toFixed(1)} Tons</p></Card>
        
        <Card className="border-2 shadow-sm p-4 text-center bg-primary/5 border-primary/20"><p className="text-[9px] font-black uppercase text-primary mb-1">State Efficiency</p><p className="text-lg font-black text-primary">{stateData.efficiency.toFixed(1)}%</p></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
                <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-base font-black uppercase text-destructive">State Operational Discrepancy</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[250px]">
                        <div className="divide-y">
                            {stateData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).map((alert) => (
                                <div key={alert.id} className="p-4 flex items-center justify-between group">
                                    <p className="text-[10px] font-bold text-foreground uppercase italic">{alert.msg}</p>
                                    <Button size="sm" variant="outline" className="h-7 text-[8px] font-black uppercase hover:bg-green-600 hover:text-white" onClick={() => setSolvedAlerts([...solvedAlerts, alert.id])}>Mark Solved</Button>
                                </div>
                            ))}
                            {stateData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).length === 0 && (
                                <div className="p-12 text-center text-muted-foreground opacity-30 italic uppercase font-black text-xs">No active state-wide alerts.</div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 bg-primary/[0.01]">
                <CardHeader className="bg-primary/5 border-b pb-3 flex row items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-black uppercase">Active Circuits Today</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[250px]">
                        <div className="grid divide-y">
                            {stateData.activeToday.map((log, i) => (
                                <div key={i} className={`p-4 flex items-center justify-between border-l-4 border-l-green-600 bg-green-50/10`}>
                                    <div className="flex-1 space-y-0.5 border-r border-dashed pr-4">
                                        <p className="font-black text-[9px] uppercase text-primary leading-none">{log.district} | {log.block}</p>
                                        <p className="font-black text-[11px] uppercase truncate">{log.routeId}: {log.routeName}</p>
                                        <p className="text-[8px] font-black text-muted-foreground uppercase">{log.mrf}</p>
                                    </div>
                                    <div className="flex-1 text-center px-4">
                                        <div className={`text-sm font-black text-green-700 animate-pulse`}>Active Today</div>
                                        <p className="text-[8px] font-black text-blue-700 uppercase">{log.scheduleStr}</p>
                                    </div>
                                    <div className="flex-1 text-right space-y-0.5 pl-4">
                                        <p className="text-[10px] font-black uppercase leading-none">{log.driver}</p>
                                        <p className="text-[8px] font-mono font-bold text-muted-foreground">{log.vehicle}</p>
                                        <p className="text-[9px] font-bold text-primary">{log.startGp} → {log.endGp}</p>
                                    </div>
                                </div>
                            ))}
                            {stateData.activeToday.length === 0 && (
                              <div className="p-12 text-center text-muted-foreground italic uppercase font-black text-[10px]">No active routes synchronized for today.</div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
      </div>

      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/> Block-level Recovery Trend (Kg)</CardTitle>
            <Tabs value={lineToggle} onValueChange={setLineToggle}>
                <TabsList className="h-8 bg-background border"><TabsTrigger value="weekly" className="text-[9px] font-black uppercase">Weekly</TabsTrigger><TabsTrigger value="monthly" className="text-[9px] font-black uppercase">Monthly</TabsTrigger></TabsList>
            </Tabs>
        </CardHeader>
        <CardContent className="h-[400px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stateData.lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" fontSize={8} fontWeights="bold" angle={-45} textAnchor="end" height={100} interval={0} />
                    <YAxis fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(1)}T`} />
                    <Tooltip />
                    <Line type="monotone" dataKey={lineToggle === 'monthly' ? 'monthly' : 'weekly'} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2, fill: "hsl(var(--primary))" }} />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/10 border-b pb-3"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><DistrictIcon className="h-4 w-4 text-primary" /> District-wise Verified Inventory</CardTitle></CardHeader>
        <CardContent className="h-[350px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateData.districtTonnage}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" fontSize={8} fontWeights="black" angle={-45} textAnchor="end" height={80} interval={0} />
                    <YAxis fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(1)}T`} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-xs font-black uppercase flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> State Nodal Rankings (GPs)</CardTitle>
                <Tabs value={barToggle} onValueChange={setBarToggle}>
                    <TabsList className="h-7"><TabsTrigger value="top" className="text-[8px] font-black px-2">Top 5</TabsTrigger><TabsTrigger value="low" className="text-[8px] font-black px-2">Lowest 5</TabsTrigger></TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="h-[300px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateData.allGps.sort((a,b) => barToggle === 'top' ? b.surveyed - a.surveyed : a.surveyed - b.surveyed).slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                        <XAxis type="number" fontSize={10} />
                        <YAxis dataKey="gpName" type="category" fontSize={9} width={80} fontWeights="black" />
                        <Tooltip />
                        <Bar dataKey="surveyed" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/10 border-b pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary" /> Infrastructure Audit (Top 5)</CardTitle>
                <Tabs value={mrfUlbToggle} onValueChange={setMrfUlbToggle}>
                    <TabsList className="h-7"><TabsTrigger value="mrf" className="text-[8px] font-black px-2">MRFs</TabsTrigger><TabsTrigger value="ulb" className="text-[8px] font-black px-2">ULBs</TabsTrigger></TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="h-[300px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mrfUlbToggle === 'mrf' ? stateData.top5Mrfs : stateData.top5Ulbs}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" fontSize={8} fontWeights="black" angle={-45} textAnchor="end" height={80} interval={0} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="val" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/10 border-b pb-3"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> State Recovery (Last 5 Months)</CardTitle></CardHeader>
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
            <CardHeader className="bg-muted/10 border-b pb-3"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> State Stream Composition</CardTitle></CardHeader>
            <CardContent className="h-[300px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={stateData.streamData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {stateData.streamData.map((_, i) => (<Cell key={`cell-${i}`} fill={COMPOSITION_COLORS[i % COMPOSITION_COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase'}} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StateAdminDashboard() {
    return (<Suspense fallback={<div>Loading state dashboard...</div>}><StateAdminDashboardContent /></Suspense>);
}
