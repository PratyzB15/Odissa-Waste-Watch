'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    Home
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const calculateDaysUntilNext = (schedule: string, now: Date) => {
    if (!schedule || /notified|required|TBD|NA/i.test(schedule)) return 999;
    
    // Normalization logic for complex spacing
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
        if (!target || target < today) { let nextM = today.getMonth() + 1; let nextY = today.getFullYear(); if (nextM > 11) { nextM = 0; nextY++; } target = getNthWeekday(nextY, nextM, dayIdx, n); }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    let minDays = 999; 
    weekdays.forEach((day, i) => { if (normalized.includes(day)) { let diff = i - today.getDay(); if (diff < 0) diff += 7; if (diff < minDays) minDays = diff; } });
    return minDays;
};

function BlockDashboardContent() {
    const searchParams = useSearchParams();
    const blockName = searchParams.get('block') || '';
    const districtParam = searchParams.get('district');
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    
    const data = useMemo(() => {
        if (!mounted || !blockName) return null;
        const blockRecords = mrfData.filter(d => d.blockCovered.toLowerCase() === blockName.toLowerCase() && (!districtParam || d.district.toLowerCase() === districtParam.toLowerCase()));
        const districtOfBlock = blockRecords[0]?.district || districtParam || 'Bhadrak';
        const sourceMap: Record<string, any> = { 'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData, 'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData, 'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData, 'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData };
        const source = sourceMap[districtOfBlock.toLowerCase()];
        if (!source) return null;
        const blockDetails = source.getBlockDetails(blockName);
        const flatGpsList = (blockDetails?.gps || []).map((gp: any) => {
            const w = (blockDetails.waste || []).find((waste: any) => waste.gpName.toLowerCase() === gp.gpName.toLowerCase());
            const collected = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000) || 0) : 0;
            return { name: gp.gpName, households: w?.totalHouseholds || 0, collected, active: collected > 0 };
        });
        const activeCircuits = (blockDetails.routes || []).map((route: any) => {
            const sched = (blockDetails.schedules || []).find((s:any) => (s.gpName || "").toLowerCase().includes((route.routeId || "").toLowerCase()) || (s.gpName || "").toLowerCase().includes((route.startingGp || "").toLowerCase()));
            const scheduleStr = sched?.collectionSchedule || route.scheduledOn || 'Scheduled';
            const daysLeft = calculateDaysUntilNext(scheduleStr, new Date());
            return { ...route, daysLeft, scheduleStr, isActiveToday: daysLeft === 0, countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`, driverName: (sched?.driverName && sched.driverName !== '-') ? sched.driverName : 'Verified', vehicleDetails: `${sched?.vehicleType || 'TATA ACE'}`, mrf: sched?.mrf || route.destination || 'Facility', startGp: route.startingGp, endGp: route.finalGp || route.destination };
        }).sort((a: any, b: any) => a.daysLeft - b.daysLeft);

        return { district: districtOfBlock, mrfCount: blockRecords.length, mrfs: blockRecords, gpsCount: flatGpsList.length, households: flatGpsList.reduce((sum, g) => sum + g.households, 0), totalWaste: flatGpsList.reduce((sum, g) => sum + g.collected, 0), flatGpsList, activeCircuits };
    }, [blockName, mounted, districtParam]);

    if (!mounted || !data) return null;

    return (
        <div className="space-y-6">
            <Card className="border-2 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b"><CardTitle className="text-3xl font-black uppercase text-primary">Block {blockName} Dashboard</CardTitle></CardHeader>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 shadow-sm p-4 group cursor-pointer hover:bg-primary/5 transition-all">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">MRFs Mapped</p>
                    <p className="text-xl font-black text-primary underline">{data.mrfCount}</p>
                </Card>
                <Card className="border-2 shadow-sm p-4">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">GPs Covered</p>
                    <p className="text-xl font-black">{data.gpsCount}</p>
                </Card>
                <Popover>
                    <PopoverTrigger asChild>
                        <Card className="border-2 shadow-sm p-0 group cursor-pointer hover:bg-primary/5 transition-all overflow-hidden">
                            <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">Households</CardTitle><Home className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                            <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{data.households.toLocaleString()}</div></CardContent>
                        </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden">
                        <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Household Audit</h4>
                        <ScrollArea className="h-72">
                            <div className="p-2 space-y-1">
                                {data.flatGpsList.map((g, i) => (<div key={i} className="p-2 text-[10px] font-bold uppercase border-b border-dashed">{g.name}: {g.households.toLocaleString()}</div>))}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
                <Card className="border-2 shadow-sm p-4 bg-primary/5 border-primary/20">
                    <p className="text-[9px] font-black uppercase text-primary mb-1">Total Block Verified</p>
                    <p className="text-xl font-black text-primary">{data.totalWaste.toLocaleString()} Kg</p>
                </Card>
            </div>

            <Card className="border-2 border-primary/30 bg-primary/[0.01]">
                <CardHeader className="bg-primary/5 border-b pb-3 flex row items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <Truck className="h-5 w-5" />
                        <CardTitle className="text-base font-black uppercase">Active Circuits</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[290px]">
                        <div className="grid gap-0 divide-y">
                            {data.activeCircuits.map((log, i) => (
                                <div key={i} className={`p-5 flex items-center justify-between border-l-4 ${log.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                                    <div className="flex-1 pr-6 border-r border-dashed">
                                        <p className="text-[9px] font-black uppercase text-primary">{log.mrf}</p>
                                        <p className="font-black text-xs uppercase">{log.routeName}</p>
                                    </div>
                                    <div className="flex-1 text-center px-6">
                                        <div className={`text-lg font-black ${log.isActiveToday ? 'text-green-700 animate-pulse' : ''}`}>{log.countdown}</div>
                                        <p className="text-[8px] font-black text-blue-700 uppercase">{log.scheduleStr}</p>
                                    </div>
                                    <div className="flex-1 text-right pl-6">
                                        <p className="text-[10px] font-black uppercase">{log.driverName}</p>
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase">{log.vehicleDetails}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

export default function BlockDashboardPage() {
    return (<Suspense fallback={<div>Loading...</div>}><BlockDashboardContent /></Suspense>);
}
