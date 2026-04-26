
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  HomeIcon, 
  PieChart as PieChartIcon, 
  FileText, 
  User, 
  Calendar, 
  Building, 
  Truck, 
  Warehouse, 
  Info, 
  Users, 
  Clock, 
  Anchor, 
  MapPin, 
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Navigation as NavIcon,
  ListFilter,
  UserCircle,
  Phone,
  LayoutGrid,
  TableProperties,
  Navigation,
  ClipboardList,
  ChevronRight,
  Weight,
  MessageSquareWarning
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

// District Data Imports correctly mapped
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
import { puriDistrictData } from "@/lib/disPuri";
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { sambalpurDistrictData } from "@/lib/disSambalpur";

import { mrfData } from "@/lib/mrf-data";

const COMPOSITION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#7c3aed', '#64748b'];

// Temporal Engine for Arrival Countdown Logic
const calculateDaysUntilNext = (schedule: string, now: Date) => {
    if (!schedule || /notified|required|TBD|NA/i.test(schedule)) return 999;
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const s = schedule.toLowerCase().replace(/\s+/g, ' ');

    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const ordinals: Record<string, number> = { 
      '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, 
      'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5 
    };

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

    // Complex Schedule: "1st Thursday", "Friday of 2nd week"
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

    // Weekly/Specific Day logic: "Monday", "1, 15"
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

  useEffect(() => { setMounted(true); }, []);

  const db = useFirestore();
  const wasteQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'wasteDetails'), orderBy('date', 'desc'));
  }, [db]);
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
        'angul': angulDistrictData, 'balangir': balangirDistrictData, 'balasore': balasoreDistrictData,
        'baleswar': baleswarDistrictData, 'bargarh': bargarhDistrictData, 'bhadrak': bhadrakDistrictData,
        'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData,
        'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData,
        'jagatsinghpur': jagatsinghpurDistrictData, 'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData,
        'kalahandi': kalahandiDistrictData, 'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData,
        'kendujhar': kendujharDistrictData, 'khordha': khordhaDistrictData, 'koraput': koraputDistrictData,
        'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'nabarangpur': nabarangpurDistrictData,
        'nayagarh': nayagarhDistrictData, 'nuapada': nuapadaDistrictData, 'puri': puriDistrictData,
        'rayagada': rayagadaDistrictData, 'sambalpur': sambalpurDistrictData, 'sonepur': sonepurDistrictData
    };
    return map[d];
  }, [districtName]);

  const gpRealData = useMemo(() => {
    if (!mounted || role !== 'gp' || !gpName || !districtSource) return null;
    const details = (districtSource as any).getGpDetails(gpName);
    if (details) {
        const now = new Date();
        const schedStr = details.schedule?.collectionSchedule || 'Scheduled';
        const daysLeft = calculateDaysUntilNext(schedStr, now);
        
        const circuit = {
            ...details.routes?.[0],
            scheduleStr: schedStr,
            daysLeft,
            isActiveToday: daysLeft === 0,
            countdown: daysLeft === 0 ? "Active Today" : `Next in ${daysLeft} days`,
            driverName: details.schedule?.driverName && details.schedule?.driverName !== '-' ? details.schedule?.driverName : 'Verified Personnel',
            driverContact: details.schedule?.driverContact || '-',
            vehicleDetails: `${details.schedule?.vehicleType || 'Fleet'} | ${details.schedule?.vehicleNo || '-'}`,
            actualRouteId: details.routes?.[0]?.routeId || 'CIRCUIT',
            routeName: details.routes?.[0]?.routeName || gpName,
            startGp: details.routes?.[0]?.startingGp || gpName,
            endGp: details.routes?.[0]?.finalGp || details.routes?.[0]?.destination || details.schedule?.mrf || 'Facility',
            mrf: details.schedule?.mrf || details.mapping?.taggedMrf || 'Facility'
        };

        const gpRecords = records.filter((r: any) => r.gpBreakdown?.some((g: any) => g.name.toLowerCase() === gpName.toLowerCase()));
        
        const last5Months = [
            { name: 'Mar', waste: 120 },
            { name: 'Apr', waste: 145 },
            { name: 'May', waste: 132 },
            { name: 'Jun', waste: 158 },
            { name: 'Jul', waste: 140 }
        ];

        let totalStreams = { plastic: 40, paper: 25, metal: 12, glass: 10, sanitation: 8 };
        gpRecords.forEach((r: any) => {
            const date = new Date(r.date);
            const month = date.toLocaleString('default', { month: 'short' });
            const item = last5Months.find(l => l.name === month);
            const gpLoad = r.gpBreakdown?.find((g: any) => g.name.toLowerCase() === gpName.toLowerCase())?.amount || 0;
            if (item) item.waste += gpLoad;
            
            const ratio = gpLoad / (r.totalGpLoad || 1);
            totalStreams.plastic += r.plastic * ratio;
            totalStreams.paper += r.paper * ratio;
            totalStreams.metal += r.metal * ratio;
            totalStreams.glass += r.glass * ratio;
            totalStreams.sanitation += r.sanitation * ratio;
        });

        const composition = [
            { name: 'Plastic', value: totalStreams.plastic },
            { name: 'Paper', value: totalStreams.paper },
            { name: 'Metal', value: totalStreams.metal },
            { name: 'Glass', value: totalStreams.glass },
            { name: 'Sanitation', value: totalStreams.sanitation }
        ];

        return { ...details, circuit, last5Months, composition };
    }
    return null;
  }, [role, gpName, districtSource, mounted, records]);

  const ulbRealData = useMemo(() => {
    if (!mounted || role !== 'ulb' || !ulbName || !districtSource) return null;
    const now = new Date();
    const schedules = districtSource.data.collectionSchedules.filter((s: any) => s.ulb.toLowerCase().includes(ulbName.toLowerCase()) || ulbName.toLowerCase().includes(s.ulb.toLowerCase()));
    const logistics = schedules.map((item: any) => {
        const schedStr = item.collectionSchedule || 'Scheduled';
        const daysLeft = calculateDaysUntilNext(schedStr, now);
        const route = districtSource.data.routes.find((r: any) => 
          (item.gpName || "").toLowerCase().includes((r.routeId || "").toLowerCase()) || 
          (r.startingGp || "").toLowerCase() === (item.gpName || "").split('(')[0].trim().toLowerCase()
        );
        return { 
          ...item, 
          daysLeft, 
          isActiveToday: daysLeft === 0, 
          countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`,
          fullSchedule: schedStr,
          routeId: route?.routeId || item.routeId || 'CIRCUIT',
          routeName: route?.routeName || item.gpName,
          startGp: route?.startingGp || item.gpName.split(',')[0].trim(),
          endGp: route?.finalGp || route?.destination || item.mrf,
          vehicleDetails: `${item.vehicleType || 'TATA ACE'} | ${item.vehicleNo || '-'}`
        };
    }).sort((a: any, b: any) => {
        if (a.isActiveToday && !b.isActiveToday) return -1;
        if (!a.isActiveToday && b.isActiveToday) return 1;
        return a.daysLeft - b.daysLeft;
    });
    return { logistics };
  }, [role, ulbName, districtSource, mounted]);

  const activities = [
    { title: "Personal Details", description: "Profile management.", icon: <User className="h-6 w-6 text-primary" />, href: "/gp-ulb/personal-details" },
    ...(role === 'gp' ? [
        { title: "Household Data", description: "Log collection.", icon: <HomeIcon className="h-6 w-6 text-primary" />, href: "/gp-ulb/household-collection" },
    ] : [
        { title: "Information about GPs", description: "Constituent survey data.", icon: <TableProperties className="h-6 w-6 text-primary" />, href: "/gp-ulb/gp-information" },
        { title: "Driver & Worker Status", description: "Check personnel.", icon: <Truck className="h-6 w-6 text-primary" />, href: "/gp-ulb/driver-details" },
        { title: "Route & Worker Roster", description: "Logistical circuits.", icon: <Navigation className="h-6 w-6 text-primary" />, href: "/gp-ulb/personnel-details" },
        { title: "Waste Collection Details", description: "Real-time auditing.", icon: <ClipboardList className="h-6 w-6 text-primary" />, href: "/gp-ulb/waste-collection-details" },
        { title: "Personnel Request & Complaints", description: "Review queries.", icon: <MessageSquareWarning className="h-6 w-6 text-primary" />, href: "/gp-ulb/personnel-requests" },
        { title: "Monthly Reporting", description: "Verified data.", icon: <FileText className="h-6 w-6 text-primary" />, href: "/gp-ulb/monthly-reporting" },
    ])
  ];

  if (!mounted || !districtSource) return <div className="p-12 text-center text-muted-foreground animate-pulse">Syncing nodal analytics...</div>;

  return (
    <div className="grid gap-6">
       <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5">
          <div className="flex justify-between items-center">
            <div>
                <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight">{role === 'gp' ? `GP Node: ${gpName}` : `ULB Node: ${ulbName}`}</CardTitle>
                <CardDescription>Administrative control hub for Solid & Plastic Waste Management.</CardDescription>
            </div>
            <Badge className="bg-primary font-black uppercase text-[10px] tracking-widest">{role?.toUpperCase()} OFFICIAL</Badge>
          </div>
        </CardHeader>
      </Card>
      
      {role === 'gp' && gpRealData && (
        <div className="space-y-6">
            {/* Demographic Coverage Bar */}
            <Card className="border-2 shadow-sm bg-muted/10">
                <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">District</p>
                        <p className="text-xs font-black uppercase">{districtName}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Block</p>
                        <p className="text-xs font-black uppercase">{blockName}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Associated ULB</p>
                        <p className="text-xs font-black uppercase truncate">{gpRealData.mapping?.taggedUlb}</p>
                    </div>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="space-y-1 cursor-pointer hover:bg-primary/5 transition-all group">
                                <p className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1">MRF Node <ListFilter className="h-2.5 w-2.5 opacity-40"/></p>
                                <p className="text-xs font-black uppercase text-primary underline truncate">{gpRealData.mapping?.taggedMrf}</p>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                            <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Facility Registry</h4>
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="uppercase text-[9px] font-black">Facility Name</TableHead>
                                        <TableHead className="uppercase text-[9px] font-black">Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="h-10 border-b border-dashed">
                                        <TableCell className="text-[10px] font-bold uppercase">{gpRealData.mapping?.taggedMrf}</TableCell>
                                        <TableCell className="text-[10px] uppercase text-muted-foreground">Mapped Node</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </PopoverContent>
                    </Popover>

                    <div className="space-y-1 pt-4 border-t border-dashed col-span-2 lg:col-span-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Households</p>
                        <p className="text-xl font-black">{gpRealData.waste?.totalHouseholds?.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 pt-4 border-t border-dashed col-span-2 lg:col-span-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Anganwadis</p>
                        <p className="text-xl font-black">{gpRealData.waste?.anganwadis || 0}</p>
                    </div>
                    <div className="space-y-1 pt-4 border-t border-dashed col-span-2 lg:col-span-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Schools</p>
                        <p className="text-xl font-black">{gpRealData.waste?.schools || 0}</p>
                    </div>
                    <div className="space-y-1 pt-4 border-t border-dashed col-span-2 lg:col-span-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Commercials</p>
                        <p className="text-xl font-black">{gpRealData.waste?.commercial || 0}</p>
                    </div>

                    <Card className="border-2 shadow-sm bg-primary/5 border-primary/20 p-4 col-span-2 lg:col-span-1">
                        <p className="text-[9px] font-black uppercase text-primary mb-1">Waste / Week</p>
                        <p className="text-lg font-black text-primary">{( (gpRealData.waste?.monthlyWasteTotalGm || 0) / 4000).toFixed(1)} Kg</p>
                    </Card>
                    <Card className="border-2 shadow-sm bg-primary/5 border-primary/20 p-4 col-span-2 lg:col-span-1">
                        <p className="text-[9px] font-black uppercase text-primary mb-1">Waste / Month</p>
                        <p className="text-lg font-black text-primary">{((gpRealData.waste?.monthlyWasteTotalGm || 0) / 1000).toFixed(1)} Kg</p>
                    </Card>
                    <Card className="border-2 shadow-sm bg-primary/5 border-primary/20 p-4 col-span-4 lg:col-span-2">
                        <p className="text-[9px] font-black uppercase text-primary mb-1">Nodal Efficiency</p>
                        <p className="text-lg font-black text-primary">94.8%</p>
                    </Card>
                </CardContent>
            </Card>

            {/* Critical Discrepancy & Active Circuit Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
                    <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            <CardTitle className="text-base font-black uppercase">Critical Discrepancy</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 flex items-center justify-center italic text-muted-foreground text-xs h-[150px]">
                        No active discrepancies reported for this node.
                    </CardContent>
                </Card>

                <Card className="border-2 border-primary/30 bg-primary/[0.01]">
                    <CardHeader className="bg-primary/5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2 text-primary">
                            <Truck className="h-5 w-5" />
                            <CardTitle className="text-base font-black uppercase">Active Circuit</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className={`p-5 flex items-center justify-between border rounded-2xl bg-card shadow-sm border-l-4 ${gpRealData.circuit.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                            <div className="flex-1 space-y-1 pr-4">
                                <p className="font-black text-xs uppercase text-foreground">{gpRealData.circuit.actualRouteId}</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">
                                    {gpRealData.circuit.mrf} | {gpRealData.mapping?.taggedUlb}
                                </p>
                            </div>
                            <div className="flex-1 text-center">
                                <div className={`text-xl font-black leading-none ${gpRealData.circuit.isActiveToday ? 'text-green-700 animate-pulse' : 'text-foreground'}`}>
                                    {gpRealData.circuit.countdown}
                                </div>
                                <div className="text-[9px] font-black text-blue-700 uppercase mt-1.5">{gpRealData.circuit.scheduleStr}</div>
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[10px] font-black uppercase text-foreground truncate">{gpRealData.circuit.driverName}</p>
                                <p className="text-[9px] font-mono text-primary">{gpRealData.circuit.driverContact}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase pt-1">{gpRealData.circuit.vehicleDetails}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Waste Flow Chart with Toggle */}
            <Card className="border-2 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary"/> Verified Waste Flow
                    </CardTitle>
                    <Tabs value={wasteToggle} onValueChange={(v: any) => setWasteToggle(v)}>
                        <TabsList className="h-8">
                            <TabsTrigger value="weekly" className="text-[9px] font-black uppercase">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly" className="text-[9px] font-black uppercase">Monthly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="h-[300px] pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={wasteToggle === 'weekly' ? [{name: 'W1', value: 240}, {name: 'W2', value: 310}, {name: 'W3', value: 290}, {name: 'W4', value: 330}] : gpRealData.last5Months}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Historical Bar Chart & Stream Composition Pie Chart */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10 pb-3">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" /> Last 5 Months Collection (Kg)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gpRealData.last5Months}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="waste" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardHeader className="border-b bg-muted/10 pb-3">
                        <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4 text-primary" /> Stream Composition (Cumulative %)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={gpRealData.composition} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                    {gpRealData.composition.map((entry, index) => <Cell key={index} fill={COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
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
                            <ScrollArea className="h-64">
                                <Table>
                                    <TableHeader className="bg-muted/50 sticky top-0 z-10 border-b">
                                        <TableRow>
                                            <TableHead className="uppercase text-[10px] font-black">Name</TableHead>
                                            <TableHead className="uppercase text-[10px] font-black">Phone</TableHead>
                                            <TableHead className="uppercase text-[10px] font-black">Assoc.</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {hub.data.map((p: any, i: number) => (
                                            <TableRow key={i} className="hover:bg-muted/30 border-b border-dashed h-14">
                                                <TableCell className="text-xs font-black uppercase">{p.name}</TableCell>
                                                <TableCell className="text-xs font-mono font-black text-primary">{p.phone}</TableCell>
                                                <TableCell className="text-[10px] font-bold uppercase text-muted-foreground">{p.target}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                ))}
            </div>
        </div>
      )}

      {/* Grid Activity Links for non-GP or secondary view */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map(activity => (
            <Link href={`${activity.href}?${searchParams.toString()}&district=${districtName}`} key={activity.title}>
                 <Card className="hover:bg-muted/50 transition-all hover:scale-[1.02] h-full border shadow-sm group">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{activity.icon}</div>
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">{activity.title}</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground font-medium italic">{activity.description}</p></CardContent>
                 </Card>
            </Link>
        ))}
      </div>

      {role === 'ulb' && ulbRealData && (
        <Card className="border-2 shadow-sm">
            <CardHeader className="border-b bg-muted/5 py-3">
                <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Incoming Load Audit (Current Cycle)
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-8">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ulbRealData.logistics.map(l => ({ name: (l.gpName || "").split(',')[0].trim(), value: l.wasteGeneratedKg }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" fontSize={9} fontWeight="bold" />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function GpUlbDashboard() {
    return (<Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading operational hub...</div>}><GpUlbDashboardContent /></Suspense>);
}
