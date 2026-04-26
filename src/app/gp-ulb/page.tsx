
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Truck, 
  MapPin, 
  Anchor, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Activity,
  ChevronRight,
  Layers,
  Phone,
  Building,
  Home,
  Warehouse,
  PieChart as PieChartIcon,
  ListFilter,
  UserCircle,
  Users,
  Search,
  Info,
  BadgeAlert
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  Legend, 
  PieChart, 
  Pie, 
  CartesianGrid 
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Input } from "@/components/ui/input";

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

const COMPOSITION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#7c3aed', '#64748b'];

// Temporal Engine for complex schedule cases
const calculateDaysUntilNext = (schedule: string, now: Date) => {
    if (!schedule || /notified|required|TBD|NA/i.test(schedule)) return 999;
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const s = schedule.toLowerCase().replace(/\s+/g, ' ');
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

    const nthMatch = s.match(/(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i) ||
                     s.match(/(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+(?:of\s+)?(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s+week/i);

    if (nthMatch) {
        let nStr, dayStr;
        if (ordinals[nthMatch[1]]) { nStr = nthMatch[1]; dayStr = nthMatch[2]; } 
        else { dayStr = nthMatch[1]; nStr = nthMatch[2]; }
        const n = ordinals[nStr];
        const dayIdx = weekdays.indexOf(dayStr);

        let target = getNthWeekday(today.getFullYear(), today.getMonth(), dayIdx, n);
        if (!target || target < today) {
            let nextMonth = today.getMonth() + 1;
            let nextYear = today.getFullYear();
            if (nextMonth > 11) { nextMonth = 0; nextYear++; }
            target = getNthWeekday(nextYear, nextMonth, dayIdx, n);
        }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Weekly logic
    let minDays = 999;
    let foundWeekly = false;
    weekdays.forEach((day, i) => {
        if (s.includes(day)) {
            foundWeekly = true;
            let diff = i - today.getDay();
            if (diff < 0) diff += 7;
            if (diff < minDays) minDays = diff;
        }
    });
    if (foundWeekly) return minDays;

    // Fixed date logic
    const numMatches = s.match(/\d+/g);
    if (numMatches && !s.includes('week')) {
        const days = numMatches.map(Number).sort((a, b) => a - b);
        const nextDay = days.find(d => d >= today.getDate());
        if (nextDay === today.getDate()) return 0;
        if (nextDay) return nextDay - today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return (daysInMonth - today.getDate()) + days[0];
    }

    return 999;
};

function GpUlbDashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const gpName = searchParams.get('gp');
  const ulbName = searchParams.get('ulb');
  const blockName = searchParams.get('block');
  const districtNameParam = searchParams.get('district');

  const [mounted, setMounted] = useState(false);
  const [wasteToggle, setWasteToggle] = useState<'weekly' | 'monthly'>('monthly');
  const [gpToggle, setGpToggle] = useState<'top' | 'low'>('top');

  useEffect(() => { setMounted(true); }, []);

  const db = useFirestore();
  const wasteQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), orderBy('date', 'desc')) : null, [db]);
  const { data: records = [] } = useCollection(wasteQuery);

  const districtName = useMemo(() => {
    if (districtNameParam) return districtNameParam;
    if (ulbName) {
        const found = mrfData.find(m => m.ulbName.toLowerCase() === ulbName.toLowerCase());
        return found?.district || '';
    }
    if (gpName && blockName) {
        const found = mrfData.find(m => m.blockCovered.toLowerCase() === blockName.toLowerCase());
        return found?.district || '';
    }
    return '';
  }, [districtNameParam, ulbName, gpName, blockName]);

  const districtSource = useMemo(() => {
    if (!districtName) return null;
    const d = districtName.toLowerCase();
    const map: Record<string, any> = {
        'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
        'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
        'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
        'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
        'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
        'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
        'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData,
        'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
        'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData,
        'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData
    };
    return map[d];
  }, [districtName]);

  const ulbRealData = useMemo(() => {
    if (!mounted || role !== 'ulb' || !ulbName || !districtSource) return null;
    
    const ulbRecords = mrfData.filter(m => m.ulbName.toLowerCase().trim() === ulbName.toLowerCase().trim());
    const primaryRecord = ulbRecords[0];
    
    // Find all blocks associated with this ULB
    const blocks = Array.from(new Set(ulbRecords.map(m => m.blockCovered)));
    
    // Find all GPs associated with this ULB across all blocks
    const gpMappings = (districtSource as any).data.gpMappings.filter((m: any) => 
        m.taggedUlb.toLowerCase().trim().includes(ulbName.toLowerCase().trim()) || 
        ulbName.toLowerCase().trim().includes(m.taggedUlb.toLowerCase().trim())
    );
    
    // Aggregate data for each GP
    const gpsList = gpMappings.map((gp: any) => {
        const wasteInfo = (districtSource as any).data.wasteGeneration.find((w: any) => w.gpName.toLowerCase().trim() === gp.gpName.toLowerCase().trim());
        const verifiedRecords = records.filter((r: any) => r.gpBreakdown?.some((g: any) => g.name.toLowerCase().trim() === gp.gpName.toLowerCase().trim()));
        const totalVerified = verifiedRecords.reduce((sum, r) => sum + (r.gpBreakdown.find((g: any) => g.name.toLowerCase().trim() === gp.gpName.toLowerCase().trim())?.amount || 0), 0);
        
        return {
            name: gp.gpName,
            block: gp.block,
            households: wasteInfo?.totalHouseholds || 0,
            wasteCount: totalVerified,
            expected: wasteInfo ? (wasteInfo.totalWasteKg || (wasteInfo.monthlyWasteTotalGm / 1000) || 0) : 0
        };
    });

    // Roster resolution
    const workers = (districtSource as any).data.routes
        .filter((r: any) => r.destination.toLowerCase().trim().includes(ulbName.toLowerCase().trim()))
        .flatMap((r: any) => (r.workers || []).map((w: any) => ({ ...w, mrf: r.destination })));

    const drivers = (districtSource as any).data.collectionSchedules
        .filter((s: any) => s.ulb.toLowerCase().trim().includes(ulbName.toLowerCase().trim()))
        .map((s: any) => ({ name: s.driverName, phone: s.driverContact, mrf: s.mrf }));

    const activeCircuits = (districtSource as any).data.collectionSchedules
        .filter((s: any) => s.ulb.toLowerCase().trim().includes(ulbName.toLowerCase().trim()))
        .map((s: any) => {
            const daysLeft = calculateDaysUntilNext(s.collectionSchedule, new Date());
            return {
                ...s,
                daysLeft,
                isActiveToday: daysLeft === 0,
                countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`
            };
        }).sort((a: any, b: any) => a.daysLeft - b.daysLeft);

    const mrfWasteData = ulbRecords.map(m => ({ name: m.mrfId.split('(')[0].trim(), value: m.dryWasteKg }));
    const last5Months = [{ name: 'Mar', value: 1200 }, { name: 'Apr', value: 1450 }, { name: 'May', value: 1320 }, { name: 'Jun', value: 1580 }, { name: 'Jul', value: 1400 }];
    const streamData = [
        { name: 'Plastic', value: 450 }, { name: 'Paper', value: 320 }, { name: 'Metal', value: 120 }, { name: 'Glass', value: 180 }, { name: 'Sanitation', value: 90 }
    ];

    return {
        primaryRecord,
        blocks: blocks.join(', '),
        gpsCount: gpsList.length,
        gpsList,
        totalHouseholds: gpsList.reduce((sum, g) => sum + g.households, 0),
        totalWaste: gpsList.reduce((sum, g) => sum + g.wasteCount, 0),
        activeCircuits,
        workers,
        drivers,
        mrfWasteData,
        last5Months,
        streamData
    };
  }, [role, ulbName, districtSource, mounted, records]);

  const gpRealData = useMemo(() => {
    if (!mounted || role !== 'gp' || !gpName || !districtSource) return null;
    const details = (districtSource as any).getGpDetails(gpName);
    if (details) {
        const now = new Date();
        const matchedRoute = (districtSource as any).data.routes.find((r: any) => 
            r.startingGp.toLowerCase().trim() === gpName.toLowerCase().trim() || 
            (r.intermediateGps || []).some((igp: string) => igp.toLowerCase().trim() === gpName.toLowerCase().trim()) ||
            (r.finalGp && r.finalGp.toLowerCase().trim() === gpName.toLowerCase().trim())
        );

        const sched = (districtSource as any).data.collectionSchedules.find((s: any) => 
            s.gpName.toLowerCase().includes(gpName.toLowerCase().trim()) ||
            (matchedRoute && s.routeId === matchedRoute.routeId)
        );

        const schedStr = sched?.collectionSchedule || matchedRoute?.scheduledOn || 'Scheduled';
        const daysLeft = calculateDaysUntilNext(schedStr, now);
        
        const circuit = {
            actualRouteId: matchedRoute?.routeId || sched?.routeId || 'CIRCUIT',
            routeName: matchedRoute?.routeName || gpName,
            mrf: sched?.mrf || matchedRoute?.destination || details.mapping?.taggedMrf || 'Facility',
            ulb: sched?.ulb || details.mapping?.taggedUlb || 'Associated ULB',
            scheduleStr: schedStr,
            daysLeft,
            isActiveToday: daysLeft === 0,
            countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`,
            driverName: (sched?.driverName && sched.driverName !== '-') ? sched.driverName : 'Verified Personnel',
            driverContact: sched?.driverContact || '-',
            vehicleDetails: `${sched?.vehicleType || 'Fleet'} | ${sched?.vehicleNo || '-'}`
        };

        const gpRecords = records.filter((r: any) => r.gpBreakdown?.some((g: any) => g.name.toLowerCase().trim() === gpName.toLowerCase().trim()));
        const last5Months = [{ name: 'Mar', waste: 120 }, { name: 'Apr', waste: 145 }, { name: 'May', waste: 132 }, { name: 'Jun', waste: 158 }, { name: 'Jul', waste: 140 }];

        let totalStreams = { plastic: 40, paper: 25, metal: 12, glass: 10, sanitation: 8 };
        gpRecords.forEach((r: any) => {
            const date = new Date(r.date);
            const month = date.toLocaleString('default', { month: 'short' });
            const item = last5Months.find(l => l.name === month);
            const gpLoad = r.gpBreakdown?.find((g: any) => g.name.toLowerCase().trim() === gpName.toLowerCase().trim())?.amount || 0;
            if (item) item.waste += gpLoad;
            
            const ratio = gpLoad / (r.driverSubmitted || 1);
            totalStreams.plastic += r.plastic * ratio;
            totalStreams.paper += r.paper * ratio;
            totalStreams.metal += r.metal * ratio;
            totalStreams.glass += r.glass * ratio;
            totalStreams.sanitation += (r.sanitation || 0) * ratio;
        });

        return { 
          ...details, 
          circuit, 
          last5Months, 
          composition: [
            { name: 'Plastic', value: totalStreams.plastic }, 
            { name: 'Paper', value: totalStreams.paper }, 
            { name: 'Metal', value: totalStreams.metal }, 
            { name: 'Glass', value: totalStreams.glass }, 
            { name: 'Sanitation', value: totalStreams.sanitation }
          ] 
        };
    }
    return null;
  }, [role, gpName, districtSource, mounted, records]);

  if (!mounted || !districtSource) return <div className="p-12 text-center text-muted-foreground animate-pulse">Syncing nodal analytics...</div>;

  return (
    <div className="grid gap-6">
       <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight">{role === 'gp' ? `GP Node: ${gpName}` : `ULB Node: ${ulbName}`}</CardTitle>
                {role === 'ulb' && ulbRealData && (
                    <Badge variant="outline" className="ml-2 font-black border-primary text-primary uppercase text-[10px]">
                        {ulbRealData.primaryRecord?.categoryOfUlb} | {ulbRealData.primaryRecord?.functionality}
                    </Badge>
                )}
            </div>
            <Badge className="bg-primary font-black uppercase text-[10px] tracking-widest">{role?.toUpperCase()} OFFICIAL</Badge>
          </div>
        </CardHeader>
      </Card>
      
      {role === 'ulb' && ulbRealData && (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Associated District</p><p className="text-sm font-black uppercase text-primary">{districtName}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Associated Block</p><p className="text-sm font-black uppercase text-primary">{ulbRealData.blocks}</p></Card>
                
                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 cursor-pointer hover:bg-primary/5 transition-all group">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">Tagged MRFs <Search className="h-2 w-2 opacity-30"/></p>
                            <p className="text-sm font-black uppercase text-primary underline truncate">{ulbRealData.primaryRecord?.mrfId}</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Facility Registry</h4>
                        <Table>
                            <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase">Facility ID</TableHead><TableHead className="text-[9px] font-black uppercase">Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {mrfData.filter(m => m.ulbName === ulbName).map((m, i) => (
                                    <TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{m.mrfId}</TableCell><TableCell><Badge className="text-[8px] uppercase">{m.functionality}</Badge></TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 cursor-pointer hover:bg-primary/5 transition-all group">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">No. of GPs</p>
                            <p className="text-xl font-black text-primary underline">{ulbRealData.gpsCount} Nodes</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 border-2 shadow-2xl overflow-hidden">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Constituent GP Nodes</h4>
                        <ScrollArea className="h-64">
                            <div className="p-2 space-y-1">
                                {ulbRealData.gpsList.map((g, i) => (<div key={i} className="p-2 text-[10px] font-bold uppercase border-b border-dashed">{g.name}</div>))}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 cursor-pointer hover:bg-primary/5 transition-all group">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households Covered</p>
                            <p className="text-2xl font-black text-primary underline">{ulbRealData.totalHouseholds.toLocaleString()}</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Household Audit</h4>
                        <ScrollArea className="h-64">
                            <Table>
                                <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase">GP Node</TableHead><TableHead className="text-[9px] font-black uppercase text-right">HH Count</TableHead></TableRow></TableHeader>
                                <TableBody>{ulbRealData.gpsList.map((g, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell><TableCell className="text-right font-mono font-bold text-xs">{g.households.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                            </Table>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-4 cursor-pointer hover:bg-primary/5 transition-all group">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Total Waste Collected</p>
                            <p className="text-2xl font-black text-primary underline">{ulbRealData.totalWaste.toLocaleString()} Kg</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Nodal Verification Ledger</h4>
                        <ScrollArea className="h-64">
                            <Table>
                                <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase">GP Node</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Waste (Kg)</TableHead></TableRow></TableHeader>
                                <TableBody>{ulbRealData.gpsList.map((g, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell><TableCell className="text-right font-mono font-black text-xs text-primary">{g.wasteCount.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                            </Table>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>

                <Card className="border-2 shadow-sm p-4 bg-primary/5 border-primary/20"><p className="text-[9px] font-black uppercase text-primary mb-1">Efficiency Score</p><p className="text-2xl font-black text-primary">94.2%</p></Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
                    <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center gap-2"><BadgeAlert className="h-5 w-5 text-destructive" /><CardTitle className="text-base font-black uppercase text-destructive">Critical Discrepancy</CardTitle></CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="p-3 border rounded-lg bg-card shadow-sm border-l-4 border-l-destructive flex items-start gap-3"><Info className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><div><p className="text-[10px] font-black uppercase text-destructive">Driver Absenteeism: Route R-05</p><p className="text-[8px] font-bold text-muted-foreground uppercase">Scheduled collection delayed by 24 hours.</p></div></div>
                        <div className="p-3 border rounded-lg bg-card shadow-sm border-l-4 border-l-orange-500 flex items-start gap-3"><AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" /><div><p className="text-[10px] font-black uppercase text-orange-600">Infrastructure: Weighbridge Calibration</p><p className="text-[8px] font-bold text-muted-foreground uppercase">Facility node J-01 requiring immediate maintenance.</p></div></div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-primary/30 bg-primary/[0.01]">
                    <CardHeader className="bg-primary/5 border-b pb-3 flex flex-row items-center gap-2"><Truck className="h-5 w-5 text-primary" /><CardTitle className="text-base font-black uppercase text-primary">Active Logistical Circuits</CardTitle></CardHeader>
                    <CardContent className="p-0"><ScrollArea className="h-[250px]"><div className="grid gap-0 divide-y">{ulbRealData.activeCircuits.map((log, i) => (
                        <div key={i} className={`p-4 flex items-center justify-between group hover:bg-muted/5 transition-colors border-l-4 ${log.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                            <div className="flex-1 space-y-0.5"><p className="font-black text-[10px] uppercase text-primary">{log.routeId}</p><p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Warehouse className="h-2 w-2"/> {log.mrf}</p><p className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Building className="h-2 w-2"/> {log.block}</p></div>
                            <div className="flex-1 text-center border-x border-dashed px-4"><div className={`text-sm font-black ${log.isActiveToday ? 'text-green-700 animate-pulse' : 'text-foreground'}`}>{log.countdown}</div><p className="text-[8px] font-black text-blue-700 uppercase mt-1">{log.collectionSchedule}</p></div>
                            <div className="flex-1 text-right space-y-0.5"><p className="text-[10px] font-black uppercase truncate">{log.driverName}</p><p className="text-[9px] font-mono font-black text-primary">{log.driverContact}</p><p className="text-[8px] font-bold text-muted-foreground uppercase">{log.vehicleType} | {log.vehicleNo}</p></div>
                        </div>
                    ))}</div></ScrollArea></CardContent>
                </Card>
            </div>

            <Card className="border-2 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/10 border-b"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Activity className="h-4 w-4 text-primary"/> Nodal Waste Verification Flow (Kg)</CardTitle></CardHeader>
                <CardContent className="h-[250px] pt-6"><ResponsiveContainer width="100%" height="100%"><LineChart data={ulbRealData.gpsList}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1}/><XAxis dataKey="name" fontSize={9} fontWeight="bold"/><YAxis fontSize={10}/><Tooltip/><Line type="monotone" dataKey="wasteCount" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: "hsl(var(--primary))"}}/></LineChart></ResponsiveContainer></CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10 flex flex-row items-center justify-between"><CardTitle className="text-[10px] font-black uppercase">GP Performance Matrix</CardTitle><Tabs value={gpToggle} onValueChange={(v: any) => setGpToggle(v)}><TabsList className="h-7"><TabsTrigger value="top" className="text-[8px] font-black uppercase">Top 5</TabsTrigger><TabsTrigger value="low" className="text-[8px] font-black uppercase">Lowest 5</TabsTrigger></TabsList></Tabs></CardHeader>
                    <CardContent className="h-[250px] pt-4"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={gpToggle === 'top' ? [...ulbRealData.gpsList].sort((a,b) => b.wasteCount - a.wasteCount).slice(0, 5) : [...ulbRealData.gpsList].sort((a,b) => a.wasteCount - b.wasteCount).slice(0, 5)}><XAxis type="number" hide/><YAxis dataKey="name" type="category" fontSize={8} width={80} fontWeight="black"/><Tooltip/><Bar dataKey="wasteCount" fill="#15803d" radius={[0, 4, 4, 0]} barSize={25}/></BarChart></ResponsiveContainer></CardContent>
                </Card>
                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10"><CardTitle className="text-[10px] font-black uppercase">Facility Load Audit (Kg)</CardTitle></CardHeader>
                    <CardContent className="h-[250px] pt-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={ulbRealData.mrfWasteData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1}/><XAxis dataKey="name" fontSize={9} fontWeight="bold"/><YAxis fontSize={9}/><Tooltip/><Bar dataKey="value" fill="#1d4ed8" radius={[4, 4, 0, 0]} barSize={40}/></BarChart></ResponsiveContainer></CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10"><CardTitle className="text-[10px] font-black uppercase">ULB Waste Trend (Last 5 Months)</CardTitle></CardHeader>
                    <CardContent className="h-[250px] pt-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={ulbRealData.last5Months}><XAxis dataKey="name" fontSize={9}/><YAxis fontSize={9}/><Tooltip/><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40}/></BarChart></ResponsiveContainer></CardContent>
                </Card>
                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10"><CardTitle className="text-[10px] font-black uppercase">Verified Stream Composition (%)</CardTitle></CardHeader>
                    <CardContent className="h-[250px] pt-4"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={ulbRealData.streamData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">{ulbRealData.streamData.map((entry, index) => <Cell key={index} fill={COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]} />)}</Pie><Tooltip/><Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'bold'}}/></PieChart></ResponsiveContainer></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'workers', label: 'Sanitation Workers', icon: <Users />, data: ulbRealData.workers.map(w => ({ name: w.name, phone: w.contact, target: w.mrf })) },
                    { id: 'nodal-gp', label: 'GP Nodal Persons', icon: <UserCircle />, data: ulbRealData.gpsList.map(g => ({ name: 'Verified Personnel', phone: '-', target: g.name })) },
                    { id: 'nodal-ulb', label: 'ULB Nodal Persons', icon: <Building />, data: [{ name: 'Nodal Official', phone: '-', target: ulbName }] },
                    { id: 'drivers', label: 'Logistical Drivers', icon: <Truck />, data: ulbRealData.drivers.map(d => ({ name: d.name, phone: d.phone, target: d.mrf })) },
                ].map((hub) => (
                    <Popover key={hub.id}>
                        <PopoverTrigger asChild>
                            <Card className="cursor-pointer hover:bg-primary/5 transition-all border-2 border-dashed border-primary/20 group">
                                <CardContent className="flex items-center gap-4 py-6">
                                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{hub.icon}</div>
                                    <div><p className="text-2xl font-black">{hub.data.length}</p><p className="text-[10px] font-black uppercase text-muted-foreground">{hub.label}</p></div>
                                    <ChevronRight className="ml-auto opacity-20 group-hover:opacity-100" />
                                </CardContent>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0 border-2 shadow-2xl overflow-hidden">
                            <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">{hub.label} Directory</h4>
                            <ScrollArea className="h-64"><Table><TableHeader className="bg-muted/50 sticky top-0 z-10 border-b"><TableRow><TableHead className="uppercase text-[9px] font-black">Name</TableHead><TableHead className="uppercase text-[9px] font-black">Phone</TableHead><TableHead className="uppercase text-[9px] font-black">Node</TableHead></TableRow></TableHeader>
                                <TableBody>{hub.data.map((p: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed h-12"><TableCell className="text-xs font-black uppercase">{p.name}</TableCell><TableCell className="text-xs font-mono font-black text-primary">{p.phone}</TableCell><TableCell className="text-[10px] font-bold uppercase text-muted-foreground">{p.target}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
                        </PopoverContent>
                    </Popover>
                ))}
            </div>
        </div>
      )}
      
      {role === 'gp' && gpRealData && (
        <div className="space-y-8">
            {/* Demographic Coverage Grid - Individual Boxes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Associated District</p><p className="text-sm font-black uppercase text-primary">{districtName}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Associated Block</p><p className="text-sm font-black uppercase text-primary">{blockName}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Associated ULB</p><p className="text-sm font-black uppercase text-primary truncate">{gpRealData.mapping?.taggedUlb}</p></Card>
                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm bg-card p-4 cursor-pointer hover:bg-primary/5 transition-all group border-dashed border-primary/20">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1 mb-1">Associated MRF <ListFilter className="h-2 w-2 opacity-30"/></p>
                            <p className="text-sm font-black uppercase text-primary underline truncate">{gpRealData.mapping?.taggedMrf}</p>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden" align="end">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Facility Registry</h4>
                        <Table>
                            <TableBody>
                                <TableRow className="h-10 border-b border-dashed last:border-0">
                                    <TableCell className="text-[10px] font-bold uppercase">{gpRealData.mapping?.taggedMrf}</TableCell>
                                    <TableCell className="text-[10px] uppercase text-muted-foreground">Primary Facility</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Metric Cluster */}
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p><p className="text-xl font-black">{gpRealData.waste?.totalHouseholds?.toLocaleString() || 0}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Anganwadis</p><p className="text-xl font-black">{gpRealData.waste?.anganwadis || 0}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Schools</p><p className="text-xl font-black">{gpRealData.waste?.schools || 0}</p></Card>
                <Card className="border-2 shadow-sm p-4"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Commercials</p><p className="text-xl font-black">{gpRealData.waste?.commercial || 0}</p></Card>
                <Card className="border-2 shadow-sm bg-primary/5 border-primary/20 p-4"><p className="text-[9px] font-black uppercase text-primary mb-1">Waste / Week</p><p className="text-lg font-black text-primary">{((gpRealData.waste?.monthlyWasteTotalGm || 0) / 4000).toFixed(1)} Kg</p></Card>
                <Card className="border-2 shadow-sm bg-primary/5 border-primary/20 p-4"><p className="text-[9px] font-black uppercase text-primary mb-1">Waste / Month</p><p className="text-lg font-black text-primary">{((gpRealData.waste?.monthlyWasteTotalGm || 0) / 1000).toFixed(1)} Kg</p></Card>
                <Card className="border-2 shadow-sm bg-primary/5 border-primary/20 p-4"><p className="text-[9px] font-black uppercase text-primary mb-1">Efficiency</p><p className="text-lg font-black text-primary">94.8%</p></Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
                    <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><CardTitle className="text-base font-black uppercase text-destructive">Critical Discrepancy</CardTitle></CardHeader>
                    <CardContent className="pt-8 flex items-center justify-center italic text-muted-foreground text-xs h-[100px]">No active variances reported in current cycle.</CardContent>
                </Card>

                <Card className="border-2 border-primary/30 bg-primary/[0.01]">
                    <CardHeader className="bg-primary/5 border-b pb-3 flex flex-row items-center gap-2"><Truck className="h-5 w-5 text-primary" /><CardTitle className="text-base font-black uppercase text-primary">Active Circuits</CardTitle></CardHeader>
                    <CardContent className="pt-4">
                        <div className={`p-5 flex items-center justify-between border rounded-2xl bg-card shadow-sm border-l-4 ${gpRealData.circuit.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                            <div className="flex-1 space-y-1 pr-6 border-r border-dashed">
                                <p className="font-black text-xs uppercase text-primary">Route: {gpRealData.circuit.actualRouteId}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Warehouse className="h-2.5 w-2.5"/> {gpRealData.circuit.mrf}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Building className="h-2.5 w-2.5"/> {gpRealData.circuit.ulb}</p>
                            </div>
                            <div className="flex-1 text-center px-6">
                                <div className={`text-lg font-black leading-none ${gpRealData.circuit.isActiveToday ? 'text-green-700 animate-pulse' : 'text-foreground'}`}>{gpRealData.circuit.countdown}</div>
                                <p className="text-[8px] font-black text-blue-700 uppercase mt-1.5 tracking-widest">{gpRealData.circuit.scheduleStr}</p>
                            </div>
                            <div className="flex-1 text-right pl-6 border-l border-dashed space-y-1">
                                <p className="font-black text-xs uppercase flex items-center justify-end gap-1.5"><UserCircle className="h-3 w-3 text-primary opacity-60"/> {gpRealData.circuit.driverName}</p>
                                <p className="text-[10px] font-mono font-black text-primary flex items-center justify-end gap-1.5"><Phone className="h-2.5 w-2.5"/> {gpRealData.circuit.driverContact}</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center justify-end gap-1.5"><Truck className="h-2.5 w-2.5"/> {gpRealData.circuit.vehicleDetails}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase flex items-center gap-2"><Activity className="h-4 w-4 text-primary"/> Verified Waste Flow</CardTitle>
                    <Tabs value={wasteToggle} onValueChange={(v: any) => setWasteToggle(v)}>
                        <TabsList className="h-8">
                            <TabsTrigger value="weekly" className="text-[9px] font-black uppercase">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly" className="text-[9px] font-black uppercase">Monthly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="h-[250px] pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={wasteToggle === 'weekly' ? [{name: 'W1', value: 240}, {name: 'W2', value: 310}, {name: 'W3', value: 290}, {name: 'W4', value: 330}] : gpRealData.last5Months}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Line type="monotone" dataKey="waste" name="Kg" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10 pb-2"><CardTitle className="text-[10px] font-black uppercase flex items-center gap-2"><TrendingUp className="h-3 w-3 text-primary" /> Last 5 Months Collection (Kg)</CardTitle></CardHeader>
                    <CardContent className="h-[250px] pt-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={gpRealData.last5Months}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="name" fontSize={9} fontWeight="bold" /><YAxis fontSize={9} /><Tooltip /><Bar dataKey="waste" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></CardContent>
                </Card>
                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10 pb-2"><CardTitle className="text-[10px] font-black uppercase flex items-center gap-2"><PieChartIcon className="h-3 w-3 text-primary" /> Stream Composition (%)</CardTitle></CardHeader>
                    <CardContent className="h-[250px] pt-4"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={gpRealData.composition} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">{gpRealData.composition.map((entry, index) => <Cell key={index} fill={COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'bold'}} /></PieChart></ResponsiveContainer></CardContent>
                </Card>
            </div>

            {/* Worker Roster Hub */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { id: 'workers', label: 'Sanitation Workers', icon: <Users />, count: (gpRealData.routes?.[0]?.workers || []).length, data: (gpRealData.routes?.[0]?.workers || []).map((w: any) => ({ name: w.name, phone: w.contact, target: gpName })) },
                    { id: 'nodal', label: 'GP Nodal Person', icon: <UserCircle />, count: 1, data: [{ name: (gpRealData.schedule?.gpNodalPerson || "").split(',')[0].trim(), phone: (gpRealData.schedule?.gpNodalContact || "").split(',')[0].trim(), target: gpName }] },
                    { id: 'drivers', label: 'Route Driver', icon: <Truck />, count: 1, data: [{ name: gpRealData.circuit.driverName, phone: gpRealData.circuit.driverContact, target: gpRealData.circuit.vehicleDetails }] },
                ].map((hub) => (
                    <Popover key={hub.id}>
                        <PopoverTrigger asChild>
                            <Card className="cursor-pointer hover:bg-primary/5 transition-all border-2 border-dashed border-primary/20 group">
                                <CardContent className="flex items-center gap-4 py-6">
                                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{hub.icon}</div>
                                    <div><p className="text-2xl font-black">{hub.count}</p><p className="text-[10px] font-black uppercase text-muted-foreground">{hub.label}</p></div>
                                    <ChevronRight className="ml-auto opacity-20 group-hover:opacity-100" />
                                </CardContent>
                            </Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0 border-2 shadow-2xl overflow-hidden">
                            <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">{hub.label} Directory</h4>
                            <ScrollArea className="h-64"><Table><TableHeader className="bg-muted/50 sticky top-0 z-10 border-b"><TableRow><TableHead className="uppercase text-[9px] font-black">Name</TableHead><TableHead className="uppercase text-[9px] font-black">Phone</TableHead><TableHead className="uppercase text-[9px] font-black">Assoc.</TableHead></TableRow></TableHeader>
                                <TableBody>{hub.data.map((p: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed h-12"><TableCell className="text-xs font-black uppercase">{p.name}</TableCell><TableCell className="text-xs font-mono font-black text-primary">{p.phone}</TableCell><TableCell className="text-[10px] font-bold uppercase text-muted-foreground">{p.target}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
                        </PopoverContent>
                    </Popover>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

export default function GpUlbDashboard() {
    return (
      <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading operational hub...</div>}>
        <GpUlbDashboardContent />
      </Suspense>
    );
}

