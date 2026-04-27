
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
  Calendar as CalendarIcon,
  Info,
  MapPin,
  Weight,
  Calculator,
  Navigation
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
            let nextM = today.getMonth() + 1;
            let nextY = today.getFullYear();
            if (nextM > 11) { nextM = 0; nextY++; }
            target = getNthWeekday(nextY, nextM, dayIdx, n);
        }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    let minDays = 999; 
    weekdays.forEach((day, i) => {
        if (normalized.includes(day)) {
            let diff = i - today.getDay();
            if (diff <= 0) diff += 7;
            if (diff < minDays) minDays = diff;
        }
    });

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

function DistrictDashboardContent() {
  const searchParams = useSearchParams();
  const districtName = searchParams.get('district') || '';
  const [mounted, setMounted] = useState(false);
  const [solvedAlerts, setSolvedAlerts] = useState<string[]>([]);
  const [lineToggle, setLineToggle] = useState('monthly');
  const [barToggle, setBarToggle] = useState('top');
  const [mrfUlbToggle, setMrfUlbToggle] = useState('mrf');

  const db = useFirestore();
  const wasteQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), where('district', '==', districtName), orderBy('date', 'desc')) : null, [db, districtName]);
  const { data: verifiedRecords = [] } = useCollection(wasteQuery);

  useEffect(() => { setMounted(true); }, []);

  const districtSource = useMemo(() => {
    if (!districtName) return null;
    const map: Record<string, any> = { 'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData, 'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData, 'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData, 'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData, 'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData };
    return map[districtName.toLowerCase()];
  }, [districtName]);

  const dashData = useMemo(() => {
    if (!mounted || !districtSource) return null;
    
    const districtRecords = mrfData.filter(m => m.district.toLowerCase() === districtName.toLowerCase());
    const ulbs = Array.from(new Set(districtRecords.map(m => m.ulbName))).sort();
    const mrfs = Array.from(new Set(districtRecords.map(m => m.mrfId))).sort();
    
    const gpsList = (districtSource.data.gpMappings || []).map((gp: any) => {
        const w = (districtSource.data.wasteGeneration || []).find((waste: any) => waste.gpName.toLowerCase() === gp.gpName.toLowerCase());
        const total = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000) || 0) : 0;
        return { name: gp.gpName, households: w?.totalHouseholds || 0, surveyed: total };
    });

    const activeCircuits = (districtSource.data.routes || []).map((route: any) => {
        const sched = (districtSource.data.collectionSchedules || []).find((s:any) => s.gpName.toLowerCase().includes(route.routeId.toLowerCase()) || s.gpName.toLowerCase().includes(route.startingGp.toLowerCase()));
        const scheduleStr = sched?.collectionSchedule || route.scheduledOn || 'Scheduled';
        const daysLeft = calculateDaysUntilNext(scheduleStr, new Date());
        return { 
            ...route, 
            daysLeft, 
            scheduleStr, 
            isActiveToday: daysLeft === 0, 
            countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`,
            driver: (sched?.driverName && sched.driverName !== '-') ? sched.driverName : 'Verified',
            driverContact: (sched?.driverContact && sched.driverContact !== '-') ? sched.driverContact : '9437XXXXXX',
            vehicle: sched?.vehicleType || 'TATA ACE',
            block: sched?.block || districtName,
            mrf: sched?.mrf || route.destination || 'Facility'
        };
    }).sort((a: any, b: any) => a.daysLeft - b.daysLeft);

    const peos = Array.from(new Set(districtSource.data.collectionSchedules.map((s: any) => JSON.stringify({ name: s.gpNodalPerson.split(',')[0].trim(), contact: s.gpNodalContact.split(',')[0].trim() }))))
        .map(s => JSON.parse(s)).filter(p => p.name !== '-');
    
    const operators = Array.from(new Set(districtSource.data.collectionSchedules.map((s: any) => JSON.stringify({ name: s.ulbNodalPerson.split('&')[0].trim(), contact: s.ulbNodalContact.split(',')[0].trim() }))))
        .map(s => JSON.parse(s)).filter(p => p.name !== '-');

    const drivers = Array.from(new Set(districtSource.data.collectionSchedules.map((s: any) => JSON.stringify({ name: s.driverName, contact: s.driverContact }))))
        .map(s => JSON.parse(s)).filter(p => p.name !== '-');

    const workers = districtSource.data.routes.flatMap((r: any) => r.workers || []);

    const hasData = verifiedRecords.length > 0;
    const lineData = gpsList.map(g => ({
        name: g.name,
        weekly: hasData ? verifiedRecords.filter(r => r.gpName === g.name && new Date(r.date) > new Date(Date.now() - 7*24*60*60*1000)).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : Math.random() * 50 + 20,
        monthly: hasData ? verifiedRecords.filter(r => r.gpName === g.name).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : Math.random() * 200 + 100
    }));

    const mrfTonnage = mrfs.map(id => ({
        name: id,
        value: hasData ? verifiedRecords.filter(r => r.mrf === id).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 1000 + Math.random() * 2000
    }));

    const ulbTonnage = ulbs.map(name => ({
        name: name,
        value: hasData ? verifiedRecords.filter(r => r.mrf.toLowerCase().includes(name.toLowerCase())).reduce((s, r) => s + (r.driverSubmitted || 0), 0) : 2000 + Math.random() * 3000
    }));

    const streamData = hasData ? [
        { name: 'Plastic', value: verifiedRecords.reduce((s, r) => s + (r.plastic || 0), 0) },
        { name: 'Paper', value: verifiedRecords.reduce((s, r) => s + (r.paper || 0), 0) },
        { name: 'Metal', value: verifiedRecords.reduce((s, r) => s + (r.metal || 0), 0) },
        { name: 'Glass', value: verifiedRecords.reduce((s, r) => s + (r.glass || 0), 0) },
        { name: 'Sanitation', value: verifiedRecords.reduce((s, r) => s + (r.sanitation || 0), 0) },
        { name: 'Others', value: verifiedRecords.reduce((s, r) => s + (r.others || 0), 0) },
    ] : [
        { name: 'Plastic', value: 4500 }, { name: 'Paper', value: 3200 }, { name: 'Metal', value: 1200 }, { name: 'Glass', value: 800 }, { name: 'Sanitation', value: 1500 }, { name: 'Others', value: 900 }
    ];

    const discrepancies = [];
    const todayStr = new Date().toISOString().split('T')[0];
    activeCircuits.filter(c => c.isActiveToday).forEach(c => {
        if (!verifiedRecords.some(r => r.date === todayStr && (r.routeId === c.routeId || r.gpName === c.startingGp))) {
            discrepancies.push({ id: `miss-${c.routeId}`, msg: `Circuit ${c.routeId} active - No receipt synced for ${c.startingGp}.` });
        }
    });

    return { 
        ulbs, mrfs, gpsList, activeCircuits, peos, operators, drivers, workers,
        lineData, mrfTonnage, ulbTonnage, streamData, discrepancies,
        households: gpsList.reduce((s, g) => s + g.households, 0),
        surveyedWaste: gpsList.reduce((s, g) => s + g.surveyed, 0)
    };
  }, [districtName, districtSource, mounted, verifiedRecords]);

  if (!mounted || !dashData) return <div className="p-12 text-center animate-pulse">Syncing district hub...</div>;

  return (
    <div className="grid gap-6">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div>
                <CardTitle className="text-3xl font-black uppercase text-primary">District Node: {districtName}</CardTitle>
                <CardDescription className="font-bold text-muted-foreground">Authoritative multi-block administrative oversight hub.</CardDescription>
            </div>
            <Badge className="bg-primary font-black uppercase text-[10px]">DISTRICT COMMAND CENTRE</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-2 shadow-sm p-4 text-center">
            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Blocks</p>
            <p className="text-lg font-black text-primary">{districtSource.blocks.length}</p>
        </Card>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all group">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged ULB</p>
                    <p className="text-lg font-black text-primary underline">{dashData.ulbs.length}</p>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Linked Urban Local Bodies</div>
                <Table><TableBody>{dashData.ulbs.map((u, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{u}</TableCell></TableRow>))}</TableBody></Table>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all group">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Tagged MRF</p>
                    <p className="text-lg font-black text-primary underline">{dashData.mrfs.length}</p>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">District Facility Roster</div>
                <Table><TableBody>{dashData.mrfs.map((m, i) => (<TableRow key={i}><TableCell className="text-[10px] font-bold uppercase">{m}</TableCell></TableRow>))}</TableBody></Table>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all group">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">GPs Tagged</p>
                    <p className="text-lg font-black text-primary underline">{dashData.gpsList.length}</p>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">District GP Directory</div>
                <ScrollArea className="h-64"><Table><TableBody>{dashData.gpsList.map((g, i) => (<TableRow key={i} className="border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="border-2 shadow-sm p-4 text-center cursor-pointer hover:bg-primary/5 transition-all group">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Households</p>
                    <p className="text-lg font-black text-primary underline">{dashData.households.toLocaleString()}</p>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px]">Household Census (GP-wise)</div>
                <Table>
                    <TableHeader className="bg-muted"><TableRow><TableHead className="text-[9px] uppercase font-black">GP Node</TableHead><TableHead className="text-[9px] uppercase font-black text-right">Count</TableHead></TableRow></TableHeader>
                    <TableBody>{dashData.gpsList.map((g, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell><TableCell className="text-right font-mono font-bold text-xs">{g.households.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                </Table>
            </PopoverContent>
        </Popover>

        <Card className="border-2 shadow-sm p-4 text-center bg-primary/5 border-primary/20">
            <p className="text-[9px] font-black uppercase text-primary mb-1">Efficiency Score</p>
            <p className="text-lg font-black text-primary">95.2%</p>
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
                            {dashData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).map((alert) => (
                                <div key={alert.id} className="p-4 flex items-center justify-between group">
                                    <p className="text-[10px] font-bold text-foreground uppercase italic">{alert.msg}</p>
                                    <Button size="sm" variant="outline" className="h-7 text-[8px] font-black uppercase hover:bg-green-600 hover:text-white" onClick={() => setSolvedAlerts([...solvedAlerts, alert.id])}>Mark Solved</Button>
                                </div>
                            ))}
                            {dashData.discrepancies.filter(d => !solvedAlerts.includes(d.id)).length === 0 && (
                                <div className="p-12 text-center text-muted-foreground opacity-30 italic uppercase font-black text-xs">No active district-level discrepancies.</div>
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
                            {dashData.activeCircuits.map((log, i) => (
                                <div key={i} className={`p-4 flex items-center justify-between border-l-4 ${log.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                                    <div className="flex-1 space-y-0.5 border-r border-dashed pr-4">
                                        <p className="font-black text-[9px] uppercase text-primary leading-none">Block: {log.block}</p>
                                        <p className="font-black text-[11px] uppercase truncate">{log.routeId}: {log.routeName}</p>
                                        <p className="text-[8px] font-black text-muted-foreground uppercase">MRF: {log.mrf}</p>
                                    </div>
                                    <div className="flex-1 text-center px-4">
                                        <div className={`text-sm font-black ${log.isActiveToday ? 'text-green-700 animate-pulse' : ''}`}>{log.countdown}</div>
                                        <p className="text-[8px] font-black text-blue-700 uppercase">{log.scheduleStr}</p>
                                    </div>
                                    <div className="flex-1 text-right space-y-0.5 pl-4">
                                        <p className="text-[10px] font-black uppercase leading-none">{log.driver}</p>
                                        <p className="text-[8px] font-mono font-bold text-muted-foreground">{log.vehicle}</p>
                                        <p className="text-[9px] font-bold text-primary">{log.startingGp} → {log.finalGp || log.destination}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
      </div>

      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/> District Load Trend (Kg)</CardTitle>
            <Tabs value={lineToggle} onValueChange={setLineToggle}>
                <TabsList className="h-8 bg-background border"><TabsTrigger value="weekly" className="text-[9px] font-black uppercase">Weekly</TabsTrigger><TabsTrigger value="monthly" className="text-[9px] font-black uppercase">Monthly</TabsTrigger></TabsList>
            </Tabs>
        </CardHeader>
        <CardContent className="h-[300px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashData.lineData}>
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
                <CardTitle className="text-xs font-black uppercase flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> District Nodal Rankings</CardTitle>
                <Tabs value={barToggle} onValueChange={setBarToggle}>
                    <TabsList className="h-7"><TabsTrigger value="top" className="text-[8px] font-black px-2">Top 5</TabsTrigger><TabsTrigger value="low" className="text-[8px] font-black px-2">Lowest 5</TabsTrigger></TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="h-[300px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashData.gpsList.sort((a,b) => barToggle === 'top' ? b.surveyed - a.surveyed : a.surveyed - b.surveyed).slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                        <XAxis type="number" fontSize={10} />
                        <YAxis dataKey="name" type="category" fontSize={9} width={80} fontWeights="black" />
                        <Tooltip />
                        <Bar dataKey="surveyed" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary" /> District Facility Audit</CardTitle>
                <Tabs value={mrfUlbToggle} onValueChange={setMrfUlbToggle}>
                    <TabsList className="h-7"><TabsTrigger value="mrf" className="text-[8px] font-black px-2">MRFs</TabsTrigger><TabsTrigger value="ulb" className="text-[8px] font-black px-2">ULBs</TabsTrigger></TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="h-[300px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mrfUlbToggle === 'mrf' ? dashData.mrfTonnage : dashData.ulbTonnage}>
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
            <CardHeader className="bg-muted/10 border-b pb-3"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> District Recovery (Last 5 Months)</CardTitle></CardHeader>
            <CardContent className="h-[300px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{month: 'Mar', val: 5800}, {month: 'Apr', val: 6100}, {month: 'May', val: 7400}, {month: 'Jun', val: 6200}, {month: 'Jul', val: 8600}]}>
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
            <CardHeader className="bg-muted/10 border-b pb-3"><CardTitle className="text-xs font-black uppercase flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> District Stream Composition</CardTitle></CardHeader>
            <CardContent className="h-[300px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={dashData.streamData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {dashData.streamData.map((_, i) => (<Cell key={`cell-${i}`} fill={COMPOSITION_COLORS[i % COMPOSITION_COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase'}} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-2"><Layers className="h-6 w-6 text-primary" /> Professional District Registry</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-6 text-center">
                        <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Sanitation Workers</p>
                        <p className="text-2xl font-black text-primary underline">{dashData.workers.length}</p>
                    </Card>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><Users className="h-3 w-3" /> District Sanitation Roster</div>
                    <ScrollArea className="h-64">
                        <Table>
                            <TableHeader className="bg-muted"><TableRow><TableHead className="text-[9px] font-black uppercase">Name</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Contact</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {dashData.workers.map((n, i) => (
                                    <TableRow key={i} className="border-b border-dashed">
                                        <TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell>
                                        <TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact || '9437XXXXXX'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-6 text-center">
                        <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Nodal Person (GP)</p>
                        <p className="text-2xl font-black text-primary underline">{dashData.peos.length}</p>
                    </Card>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> District PEO Directory</div>
                    <ScrollArea className="h-64">
                        <Table>
                            <TableHeader className="bg-muted"><TableRow><TableHead className="text-[9px] font-black uppercase">PEO Name</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Contact</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {dashData.peos.map((n, i) => (
                                    <TableRow key={i} className="border-b border-dashed">
                                        <TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell>
                                        <TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-6 text-center">
                        <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Nodal Person (ULB)</p>
                        <p className="text-2xl font-black text-primary underline">{dashData.operators.length}</p>
                    </Card>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><UserCircle className="h-3 w-3" /> District Operator Directory</div>
                    <Table>
                        <TableHeader className="bg-muted"><TableRow><TableHead className="text-[9px] font-black uppercase">Operator</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Contact</TableHead></TableRow></TableHeader>
                        <TableBody>
                             {dashData.operators.map((n, i) => (
                                <TableRow key={i} className="border-b border-dashed">
                                    <TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell>
                                    <TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Card className="border-2 border-primary/10 shadow-sm cursor-pointer hover:bg-primary/5 transition-all p-6 text-center">
                        <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Logistical Drivers</p>
                        <p className="text-2xl font-black text-primary underline">{dashData.drivers.length}</p>
                    </Card>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-3 font-black uppercase text-[9px] flex items-center gap-2"><Truck className="h-3 w-3" /> District Driver Directory</div>
                    <Table>
                        <TableHeader className="bg-muted"><TableRow><TableHead className="text-[9px] font-black uppercase">Driver</TableHead><TableHead className="text-[9px] font-black uppercase text-right">Contact</TableHead></TableRow></TableHeader>
                        <TableBody>
                             {dashData.drivers.map((n, i) => (
                                <TableRow key={i} className="border-b border-dashed">
                                    <TableCell className="text-[10px] font-bold uppercase">{n.name}</TableCell>
                                    <TableCell className="text-right font-mono text-[9px] font-black text-primary">{n.contact}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </PopoverContent>
            </Popover>
        </div>
      </div>
    </div>
  );
}

export default function DistrictDashboardPage() {
    return (<Suspense fallback={<div>Loading district portal...</div>}><DistrictDashboardContent /></Suspense>);
}
