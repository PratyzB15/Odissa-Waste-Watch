
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
  BellRing, 
  Clock, 
  Anchor, 
  MapPin, 
  Trash2,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Navigation as NavIcon,
  ListFilter,
  UserCircle,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
  Phone,
  LayoutGrid,
  AlertCircle,
  Megaphone,
  Send,
  TableProperties,
  Navigation,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  CartesianGrid
} from 'recharts';

import { jharsugudaDistrictData } from "@/lib/disJharsuguda";
import { jajpurDistrictData } from "@/lib/disJajpur";
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
import { angulDistrictData } from "@/lib/disAngul";
import { balangirDistrictData } from "@/lib/disBalangir";
import { puriDistrictData } from "@/lib/disPuri";

import { mrfData } from "@/lib/mrf-data";

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

  useEffect(() => { setMounted(true); }, []);

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
        'malkangiri': malkangiriDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData,
        'puri': puriDistrictData
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
            countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`,
            driverName: details.schedule?.driverName && details.schedule?.driverName !== '-' ? details.schedule?.driverName : 'Verified Personnel',
            vehicleDetails: `${details.schedule?.vehicleType || 'Fleet'} | ${details.schedule?.vehicleNo || '-'}`,
            actualRouteId: details.routes?.[0]?.routeId || 'CIRCUIT',
            routeName: details.routes?.[0]?.routeName || gpName,
            startGp: details.routes?.[0]?.startingGp || gpName,
            endGp: details.routes?.[0]?.finalGp || details.routes?.[0]?.destination || details.schedule?.mrf || 'Facility',
            mrf: details.schedule?.mrf || details.mapping?.taggedMrf || 'Facility'
        };

        return { ...details, circuit };
    }
    return null;
  }, [role, gpName, districtSource, mounted]);

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
  }, [role, ulbName, districtName, districtSource, mounted]);

  const activities = [
    { title: "Personal Details", description: "Profile management.", icon: <User className="h-6 w-6 text-primary" />, href: "/gp-ulb/personal-details" },
    ...(role === 'gp' ? [
        { title: "Household Data", description: "Log collection.", icon: <HomeIcon className="h-6 w-6 text-primary" />, href: "/gp-ulb/household-collection" },
        { title: "Waste Collection History", description: "Audit trail.", icon: <Calendar className="h-6 w-6 text-primary" />, href: "/gp-ulb/history" },
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
                <CardDescription>Administrative control for {blockName || 'Mapped'} Block, {districtName} District.</CardDescription>
            </div>
            <Badge className="bg-primary font-black uppercase text-[10px] tracking-widest">{role?.toUpperCase()} OFFICIAL</Badge>
          </div>
        </CardHeader>
      </Card>
      
      {role === 'gp' && gpRealData && (
        <Card className="border-2 border-primary/20 bg-primary/[0.01]">
            <CardHeader className="bg-primary/5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2 text-primary"><Truck className="h-5 w-5" /><CardTitle className="text-base font-black uppercase">Assigned Logistical Path</CardTitle></div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className={`p-6 border rounded-2xl bg-card shadow-sm border-l-4 transition-all hover:bg-muted/5 flex items-center justify-between gap-6 ${gpRealData.circuit.isActiveToday ? 'border-l-green-600' : 'border-l-primary/30'}`}>
                    <div className="flex-1 space-y-1 pr-6 border-r border-dashed">
                        <p className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Anchor className="h-2.5 w-2.5 opacity-40"/> {gpRealData.circuit.mrf}</p>
                        <p className="font-black text-xs uppercase text-foreground">{gpRealData.circuit.actualRouteId}: {gpRealData.circuit.routeName}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase pt-1">
                            <span className="text-green-700">{gpRealData.circuit.startGp}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-blue-700">{gpRealData.circuit.endGp}</span>
                        </div>
                    </div>
                    <div className="flex-1 text-center border-r border-dashed px-6">
                        <div className={`text-xl font-black leading-none ${gpRealData.circuit.isActiveToday ? 'text-green-700 animate-pulse' : 'text-foreground'}`}>{gpRealData.circuit.countdown}</div>
                        <div className="text-[10px] font-black text-blue-700 uppercase mt-2">{gpRealData.circuit.scheduleStr}</div>
                    </div>
                    <div className="flex-1 text-right pl-6">
                        <p className="text-[10px] font-black uppercase text-foreground truncate"><User className="h-3.5 w-3.5 inline mr-1 opacity-40"/> {gpRealData.circuit.driverName}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase truncate pt-1"><Truck className="h-3.5 w-3.5 inline mr-1 opacity-40"/> {gpRealData.circuit.vehicleDetails}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {role === 'ulb' && ulbRealData && (
        <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-lg">
            <CardHeader className="bg-primary/5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2 text-primary"><Truck className="h-5 w-5" /><CardTitle className="text-base font-black uppercase">Incoming Circuits</CardTitle></div>
                <Badge variant="outline" className="border-primary text-primary font-bold">{ulbRealData.logistics.filter(l => l.isActiveToday).length} Active Today</Badge>
            </CardHeader>
            <CardContent className="pt-6">
                <ScrollArea className="h-[400px]">
                    <div className="grid gap-4 pr-4">
                        {ulbRealData.logistics.map((log, i) => (
                            <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between p-5 border rounded-2xl bg-card shadow-sm border-l-4 hover:bg-muted/5 transition-colors ${log.isActiveToday ? 'border-l-green-600' : 'border-l-primary/20'}`}>
                                <div className="flex-1 space-y-1 pr-6 border-r border-dashed">
                                    <p className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Anchor className="h-2.5 w-2.5 opacity-40"/> {log.mrf}</p>
                                    <p className="font-black text-xs uppercase text-foreground">{log.routeId}: {log.routeName}</p>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase pt-1">
                                        <span className="text-green-700">{log.startGp}</span>
                                        <ArrowRight className="h-2 w-2" />
                                        <span className="text-blue-700">{log.endGp}</span>
                                    </div>
                                </div>
                                <div className="flex-1 text-center border-r border-dashed px-6">
                                    <div className={`text-xl font-black leading-none ${log.isActiveToday ? 'text-green-700 animate-pulse' : 'text-foreground'}`}>{log.countdown}</div>
                                    <div className="text-[10px] font-black text-blue-700 uppercase mt-2">{log.fullSchedule}</div>
                                </div>
                                <div className="flex-1 text-right pl-6">
                                    <p className="text-[10px] font-black uppercase text-foreground truncate"><User className="h-3.5 w-3.5 inline mr-1 opacity-40"/> {log.driverName}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase truncate pt-1"><Truck className="h-3.5 w-3.5 inline mr-1 opacity-40"/> {log.vehicleDetails}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}

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
    return (<Suspense fallback={<div className="p-12 text-center">Loading operational hub...</div>}><GpUlbDashboardContent /></Suspense>);
}
