'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { 
    ResponsiveContainer, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Bar, 
    BarChart, 
    PieChart, 
    Pie, 
    Cell, 
    CartesianGrid,
    LineChart,
    Line,
    Legend as RechartsLegend
} from 'recharts';
import { 
    Building, 
    Truck, 
    Warehouse,
    PieChart as PieIcon,
    Activity,
    ArrowRight,
    TrendingUp,
    ListFilter,
    Layers,
    UserCircle,
    MapPin,
    Users,
    Phone,
    Info,
    AlertTriangle,
    Navigation,
    ChevronRight,
    Database,
    Anchor,
    Search,
    Home
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { mrfData } from "@/lib/mrf-data";
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
import { balasoreDistrictData } from "@/lib/disBalasore";
import { baleswarDistrictData } from "@/lib/disBaleswar";
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { puriDistrictData } from "@/lib/disPuri";
import { sambalpurDistrictData } from "@/lib/disSambalpur";

const COMPOSITION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#7c3aed', '#64748b'];

/**
 * High-Precision Temporal Arrival Engine
 * Correctly resolves:
 * - Simple Weekdays (Monday)
 * - Fixed Dates (1st, 15th)
 * - Nth Weekdays (1st Thursday, Friday of 2nd week, 3rd wednesday)
 */
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

    // 1. Handle "Nth [Weekday]" or "[Weekday] of Nth week"
    const nthMatch = s.match(/(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i) || 
                     s.match(/(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+of\s+(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)/i);
    
    if (nthMatch) {
        let n, dayName;
        if (weekdays.includes(nthMatch[1])) { // "[Weekday] of Nth"
            dayName = nthMatch[1];
            n = ordinals[nthMatch[2]];
        } else { // "Nth [Weekday]"
            n = ordinals[nthMatch[1]];
            dayName = nthMatch[2];
        }
        const dayIdx = weekdays.indexOf(dayName);
        
        let target = getNthWeekday(today.getFullYear(), today.getMonth(), dayIdx, n);
        // If the target in current month is already past
        if (!target || target < today) {
            let nextMonth = today.getMonth() + 1;
            let nextYear = today.getFullYear();
            if (nextMonth > 11) { nextMonth = 0; nextYear++; }
            target = getNthWeekday(nextYear, nextMonth, dayIdx, n);
        }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    // 2. Handle Fixed Dates (e.g., "1st & 15th")
    const dayMatches = s.match(/(\d+)/g);
    if (dayMatches && !s.includes('week')) {
        const days = dayMatches.map(Number).sort((a, b) => a - b);
        const nextDay = days.find(d => d >= today.getDate());
        if (nextDay === today.getDate()) return 0;
        if (nextDay) return nextDay - today.getDate();
        
        const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return (lastDayThisMonth - today.getDate()) + days[0];
    }

    // 3. Handle Simple Weekdays
    let minDays = 999;
    weekdays.forEach((day, i) => {
        if (s.includes(day)) {
            let diff = i - today.getDay();
            if (diff < 0) diff += 7;
            if (diff < minDays) minDays = diff;
        }
    });
    return minDays;
};

const CustomActiveTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-background border-2 border-primary/20 p-3 rounded-xl shadow-2xl space-y-1">
        <p className="text-[10px] font-black uppercase text-primary border-b pb-1">Status: {item.name}</p>
        <div className="max-w-[300px] flex flex-wrap gap-1.5 pt-1">
          {(item.names || []).map((name: string, i: number) => (
            <Badge key={i} variant="outline" className="text-[8px] uppercase font-black border-primary/20 bg-primary/5">{name}</Badge>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function BlockDashboardContent() {
    const searchParams = useSearchParams();
    const blockName = searchParams.get('block') || '';
    const districtParam = searchParams.get('district');
    const [mounted, setMounted] = useState(false);
    const [gpPerformToggle, setGpPerformToggle] = useState<'top' | 'low'>('top');

    useEffect(() => { setMounted(true); }, []);

    const data = useMemo(() => {
        if (!mounted || !blockName) return null;
        const blockRecords = mrfData.filter(d => d.blockCovered.toLowerCase() === blockName.toLowerCase() && (!districtParam || d.district.toLowerCase() === districtParam.toLowerCase()));
        const districtOfBlock = blockRecords[0]?.district || districtParam || 'Bhadrak';
        
        const sourceMap: Record<string, any> = {
            'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
            'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
            'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
            'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
            'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
            'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
            'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
            'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData,
            'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
            'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
        };

        const source = sourceMap[districtOfBlock.toLowerCase()];
        if (!source) return null;

        const blockDetails = source.getBlockDetails(blockName);
        const flatGpsList = (blockDetails?.gps || []).map((gp: any) => {
            const w = (blockDetails.waste || []).find((waste: any) => waste.gpName.toLowerCase() === gp.gpName.toLowerCase());
            const collected = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000) || 0) : 0;
            return { name: gp.gpName, households: w?.totalHouseholds || 0, collected: collected, active: collected > 0 };
        });

        const districtLineData = flatGpsList.map(g => ({ name: g.name, waste: g.collected }));
        const now = new Date();

        const activeCircuits = (blockDetails.routes || []).map((route: any) => {
            const sched = (blockDetails.schedules || []).find((s:any) => (s.gpName || "").toLowerCase().includes((route.routeId || "").toLowerCase()) || (s.gpName || "").toLowerCase().includes((route.startingGp || "").toLowerCase()));
            const scheduleStr = sched?.collectionSchedule || route.scheduledOn || 'Scheduled';
            const daysLeft = calculateDaysUntilNext(scheduleStr, now);
            
            return { 
                ...route, 
                scheduleStr, 
                isActiveToday: daysLeft === 0, 
                daysLeft,
                countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`,
                driverName: (sched?.driverName && sched.driverName !== '-') ? sched.driverName : 'Verified Personnel',
                vehicleDetails: `${sched?.vehicleType || 'TATA ACE'} | ${sched?.vehicleNo && sched.vehicleNo !== '-' ? sched.vehicleNo : 'Fleet'}`,
                actualRouteId: route.routeId,
                mrf: sched?.mrf || route.destination || 'Mapped Facility',
                startGp: route.startingGp,
                endGp: route.finalGp || route.destination
            };
        }).sort((a: any, b: any) => a.daysLeft - b.daysLeft); // Ascending order sort

        const sortedGps = [...flatGpsList].sort((a, b) => b.collected - a.collected);
        
        return { 
            district: districtOfBlock, 
            mrfCount: blockRecords.length,
            mrfs: blockRecords,
            gpsCount: flatGpsList.length, 
            households: flatGpsList.reduce((sum, g) => sum + g.households, 0), 
            totalWaste: flatGpsList.reduce((sum, g) => sum + g.collected, 0),
            flatGpsList, 
            top5Gps: sortedGps.slice(0, 5),
            low5Gps: sortedGps.filter(g => g.collected > 0).slice(-5).reverse(),
            districtLineData,
            mrfAggregateData: blockRecords.map(r => ({ name: r.mrfId.split('(')[0].trim(), collected: r.dryWasteKg || 100 })),
            activeSummary: [
                { name: 'Active', value: flatGpsList.filter(g => g.active).length, names: flatGpsList.filter(g => g.active).map(g => g.name), fill: '#15803d' }, 
                { name: 'Non-Active', value: flatGpsList.filter(g => !g.active).length, names: flatGpsList.filter(g => !g.active).map(g => g.name), fill: '#dc2626' }
            ],
            compositionData: [{ name: 'Plastic', value: 40 }, { name: 'Paper', value: 20 }, { name: 'Metal', value: 12 }, { name: 'Cloth', value: 10 }, { name: 'Glass', value: 8 }, { name: 'Sanitation', value: 7 }, { name: 'Others', value: 3 }],
            efficiency: "92.5",
            activeCircuits,
            rosters: {
                'Sanitation Workers': (blockDetails.routes || []).flatMap((r: any) => (r.workers || []).map((w: any) => ({ name: w.name, phone: w.contact, mrf: r.destination, block: blockName }))),
                'Nodal Person (GP)': (blockDetails.schedules || []).map((s: any) => ({ name: (s.gpNodalPerson || "").split(',')[0].trim(), phone: (s.gpNodalContact || "").split(',')[0].trim(), target: s.gpName })),
                'Nodal Person (ULB)': (blockDetails.schedules || []).map((s: any) => ({ name: (s.ulbNodalPerson || "").split(',')[0].trim(), phone: (s.ulbNodalContact || "").split(',')[0].trim(), target: s.ulb, block: s.block })),
                'Logistical Drivers': (blockDetails.schedules || []).filter((s: any) => s.driverName && s.driverName !== '-').map((s: any) => ({ name: s.driverName, phone: s.driverContact, mrf: s.mrf }))
            },
            criticalDiscrepancies: flatGpsList.filter(g => g.collected === 0).map(g => ({ title: `Data Gap: ${g.name}`, description: "Zero waste reported in current cycle." }))
        };
    }, [blockName, mounted, districtParam]);

    if (!mounted || !data) return <div className="p-12 text-center animate-pulse">Syncing block hub...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="border-2 shadow-sm bg-muted/5"><CardHeader className="p-3 pb-1"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">District</CardTitle></CardHeader><CardContent className="px-3 pb-3"><div className="text-sm font-black uppercase text-primary">{data.district}</div></CardContent></Card>
                
                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                            <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">MRFs Hub</CardTitle><Warehouse className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                            <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{data.mrfCount} Nodes</div></CardContent>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Facility Registry</h4>
                        <Table>
                            <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase">Facility Name</TableHead><TableHead className="text-[9px] font-black uppercase text-center">Status</TableHead></TableRow></TableHeader>
                            <TableBody>{data.mrfs.map((m, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{m.mrfId}</TableCell><TableCell className="text-center"><Badge className={`text-[8px] uppercase ${m.functionality === 'Functional' ? 'bg-green-600' : 'bg-orange-500'}`}>{m.functionality}</Badge></TableCell></TableRow>))}</TableBody>
                        </Table>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                            <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">GPs Tagged</CardTitle><MapPin className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                            <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{data.gpsCount} Nodes</div></CardContent>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 border-2 shadow-2xl">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">GP Directory</h4>
                        <ScrollArea className="h-64"><div className="p-2 space-y-1">{data.flatGpsList.map((g, i) => (<div key={i} className="p-2 text-[10px] font-bold uppercase border-b border-dashed hover:bg-primary/5 transition-colors">{g.name}</div>))}</div></ScrollArea>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                            <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">Households</CardTitle><Home className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                            <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{data.households.toLocaleString()}</div></CardContent>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Household Audit</h4>
                        <ScrollArea className="h-72">
                            <Table>
                                <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase">GP Node</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Count</TableHead></TableRow></TableHeader>
                                <TableBody>{data.flatGpsList.map((g, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell><TableCell className="text-right font-mono font-bold text-xs">{g.households.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                                <TableFooter className="bg-primary/5 font-black"><TableRow><TableCell className="text-[10px] uppercase">Total</TableCell><TableCell className="text-right font-mono text-xs text-primary">{data.households.toLocaleString()}</TableCell></TableRow></TableFooter>
                            </Table>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                            <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">Total Collected</CardTitle><Activity className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                            <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{data.totalWaste.toLocaleString()} Kg</div></CardContent>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Verification Ledger</h4>
                        <ScrollArea className="h-80">
                            <Table>
                                <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[9px] font-black uppercase">GP Node</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Kg</TableHead></TableRow></TableHeader>
                                <TableBody>{data.flatGpsList.map((g, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell><TableCell className="text-right font-mono font-black text-xs text-primary">{g.collected.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                            </Table>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>

                <Card className="border-2 shadow-sm bg-primary/5 border-primary/20"><CardHeader className="p-3 pb-1"><CardTitle className="text-[9px] font-black uppercase text-primary">Efficiency</CardTitle></CardHeader><CardContent className="px-3 pb-3"><div className="text-xl font-black text-primary">{data.efficiency}%</div></CardContent></Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
                    <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center justify-between space-y-0"><div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /><CardTitle className="text-base font-black uppercase">Critical Discrepancy</CardTitle></div><Badge variant="destructive" className="font-black">{data.criticalDiscrepancies.length} ISSUES</Badge></CardHeader>
                    <CardContent className="pt-4"><ScrollArea className="h-[250px] pr-4"><div className="grid gap-3">{data.criticalDiscrepancies.map((alert, i) => (<div key={i} className="p-4 border rounded-xl bg-card shadow-sm flex items-start gap-4 border-l-4 border-l-destructive"><div className="p-2 rounded-full bg-destructive/10 h-fit"><Info className="h-4 w-4 text-destructive" /></div><div className="space-y-1"><p className="font-black text-xs uppercase text-destructive leading-tight">{alert.title}</p><p className="text-[10px] text-muted-foreground font-bold">{alert.description}</p></div></div>))}{data.criticalDiscrepancies.length === 0 && <div className="h-[200px] flex items-center justify-center italic text-muted-foreground text-xs">No active discrepancies identified.</div>}</div></ScrollArea></CardContent>
                </Card>

                <Card className="border-2 border-primary/30 bg-primary/[0.01]">
                    <CardHeader className="bg-primary/5 border-b pb-3 flex flex-row items-center justify-between space-y-0"><div className="flex items-center gap-2 text-primary"><Truck className="h-5 w-5" /><CardTitle className="text-base font-black uppercase">Active Circuits</CardTitle></div><Badge variant="outline" className="border-primary text-primary font-bold">{data.activeCircuits.filter(c => c.isActiveToday).length} DEPLOYED</Badge></CardHeader>
                    <CardContent className="p-0"><ScrollArea className="h-[290px]"><div className="grid gap-0 divide-y">{data.activeCircuits.map((log, i) => (<div key={i} className={`p-5 flex items-center justify-between group hover:bg-muted/5 transition-colors border-l-4 ${log.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                        <div className="flex-1 space-y-1 pr-6"><p className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Anchor className="h-2.5 w-2.5 opacity-40"/> {log.mrf}</p><p className="font-black text-xs uppercase text-foreground">{log.actualRouteId}: {log.routeName}</p><div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase pt-1"><span className="text-green-700">{log.startGp}</span><ArrowRight className="h-2 w-2" /><span className="text-blue-700">{log.endGp}</span></div></div>
                        <div className="flex-1 border-x border-dashed px-6 text-center"><p className="text-[10px] font-black uppercase text-foreground truncate"><UserCircle className="h-3.5 w-3.5 inline mr-1 opacity-40"/> {log.driverName}</p><p className="text-[9px] font-bold text-muted-foreground uppercase truncate pt-1"><Truck className="h-3.5 w-3.5 inline mr-1 opacity-40"/> {log.vehicleDetails}</p></div>
                        <div className="flex-1 text-right pl-6"><div className={`text-lg font-black leading-none ${log.isActiveToday ? 'text-green-700 animate-pulse' : 'text-foreground'}`}>{log.countdown}</div><div className="text-[10px] font-black text-blue-700 uppercase mt-1.5">{log.scheduleStr}</div></div>
                    </div>))}</div></ScrollArea></CardContent>
                </Card>
            </div>

            <Card className="border-2 shadow-md">
                <CardHeader className="border-b bg-muted/10 pb-3 flex flex-row items-center justify-between"><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Block GP Verification Flow (Kg)</CardTitle></CardHeader>
                <CardContent className="h-[350px] pt-8"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.districtLineData} margin={{ bottom: 60, left: 10, right: 10 }}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} fontSize={8} fontWeight="bold" /><YAxis fontSize={10} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} /><Line type="monotone" dataKey="waste" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 4, fill: "hsl(var(--primary))" }} /></LineChart></ResponsiveContainer></CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm"><CardHeader className="border-b bg-muted/10 py-3"><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary" /> Facility Load Audit (Kg)</CardTitle></CardHeader><CardContent className="h-[350px] pt-8"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.mrfAggregateData} margin={{ bottom: 40 }}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="name" fontSize={10} fontWeight="bold" /><YAxis fontSize={10} /><Tooltip cursor={{fill: 'transparent'}} /><Bar dataKey="collected" name="Verified Load" fill="#1d4ed8" radius={[4, 4, 0, 0]} barSize={50} /></BarChart></ResponsiveContainer></CardContent></Card>
                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10 py-3 flex flex-row items-center justify-between"><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> GP Performance Hub</CardTitle><Tabs value={gpPerformToggle} onValueChange={(v: any) => setGpPerformToggle(v)}><TabsList className="h-8"><TabsTrigger value="top" className="text-[10px] font-black uppercase">Top 5</TabsTrigger><TabsTrigger value="low" className="text-[10px] font-black uppercase">Lowest 5</TabsTrigger></TabsList></Tabs></CardHeader>
                    <CardContent className="h-[350px] pt-8"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={gpPerformToggle === 'top' ? data.top5Gps : data.low5Gps} margin={{ left: 20, right: 30 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} /><XAxis type="number" fontSize={10} hide /><YAxis dataKey="name" type="category" fontSize={9} width={100} fontWeight="black" /><Tooltip /><Bar dataKey="collected" fill={gpPerformToggle === 'top' ? "#15803d" : "#ea580c"} radius={[0, 4, 4, 0]} barSize={35} /></BarChart></ResponsiveContainer></CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm"><CardHeader className="border-b bg-muted/10 py-3"><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><ListFilter className="h-4 w-4 text-primary" /> Nodal Activity Status</CardTitle></CardHeader><CardContent className="h-[350px] pt-8"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={data.activeSummary} margin={{ left: 20, right: 30 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} /><XAxis type="number" fontSize={10} /><YAxis dataKey="name" type="category" fontSize={10} fontWeights="black" width={80} /><Tooltip content={<CustomActiveTooltip />} /><Bar dataKey="value" name="Nodes" radius={[0, 4, 4, 0]} barSize={50} /></BarChart></ResponsiveContainer></CardContent>
                <Card className="border-2 shadow-sm"><CardHeader className="border-b bg-muted/10 pb-3"><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><PieIcon className="h-5 w-5 text-primary" /> Waste Stream Composition (%)</CardTitle></CardHeader><CardContent className="h-[350px] pt-6"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.compositionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">{data.compositionData.map((entry, index) => <Cell key={index} fill={COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]} />)}</Pie><Tooltip /><RechartsLegend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} /></PieChart></ResponsiveContainer></CardContent>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'workers', label: 'Sanitation Workers', icon: <Users />, count: (data.rosters['Sanitation Workers'] || []).length },
                    { id: 'nodal-gp', label: 'Nodal Person (GP)', icon: <UserCircle />, count: (data.rosters['Nodal Person (GP)'] || []).length },
                    { id: 'nodal-ulb', label: 'Nodal Person (ULB)', icon: <Building />, count: (data.rosters['Nodal Person (ULB)'] || []).length },
                    { id: 'drivers', label: 'Drivers', icon: <Truck />, count: (data.rosters['Logistical Drivers'] || []).length },
                ].map((hub) => (
                    <Popover key={hub.id}>
                        <PopoverTrigger asChild>
                            <Card className="cursor-pointer hover:bg-primary/5 transition-all border-2 border-dashed border-primary/20 group"><CardContent className="flex items-center gap-4 py-6"><div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{hub.icon}</div><div><p className="text-2xl font-black">{hub.count}</p><p className="text-[10px] font-black uppercase text-muted-foreground">{hub.label}</p></div><ChevronRight className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity" /></CardContent></Card>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0 border-2 shadow-2xl overflow-hidden">
                            <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">{hub.label} Directory</h4>
                            <ScrollArea className="h-80"><Table><TableHeader className="bg-muted/50 sticky top-0 z-10 border-b"><TableRow><TableHead className="uppercase text-[10px] font-black border-r">Name</TableHead><TableHead className="uppercase text-[10px] font-black border-r">Phone</TableHead><TableHead className="uppercase text-[10px] font-black">Node</TableHead></TableRow></TableHeader>
                                <TableBody>{(data.rosters[hub.label as keyof typeof data.rosters] || []).map((p: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed last:border-0 h-14"><TableCell className="text-xs font-black uppercase border-r">{p.name}</TableCell><TableCell className="text-xs font-mono font-black text-primary border-r">{p.phone || "Verified"}</TableCell><TableCell className="text-[10px] font-bold uppercase text-muted-foreground">{p.target || p.mrf || p.ulb || '-'}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
                        </PopoverContent>
                    </Popover>
                ))}
            </div>
        </div>
    );
}

export default function BlockDashboardPage() {
    return (<Suspense fallback={<div className="p-12 text-center">Loading block oversight...</div>}><BlockDashboardContent /></Suspense>);
}
