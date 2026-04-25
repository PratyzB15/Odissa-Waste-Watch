'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Truck, 
  Building, 
  Map as MapIcon, 
  Home, 
  Warehouse, 
  Activity, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  ListFilter,
  BarChart2,
  AlertTriangle,
  Info,
  ArrowRight,
  Anchor,
  UserCircle,
  Search,
  ChevronRight,
  MapPin
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid,
  Legend as RechartsLegend 
} from 'recharts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mrfData } from "@/lib/mrf-data";
import { useMemo, useState, useEffect, Suspense } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useSearchParams } from 'next/navigation';

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
import { balasoreDistrictData } from "@/lib/disBalasore";
import { baleswarDistrictData } from "@/lib/disBaleswar";
import { khordhaDistrictData } from "@/lib/disKhordha";
import { koraputDistrictData } from "@/lib/disKoraput";
import { mayurbhanjDistrictData } from "@/lib/disMayurbhanj";
import { malkangiriDistrictData } from "@/lib/disMalkangiri";
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { puriDistrictData } from "@/lib/disPuri";
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { sambalpurDistrictData } from "@/lib/disSambalpur";

const COMPOSITION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#7c3aed', '#64748b'];

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

    const nthMatch = s.match(/(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i);
    if (nthMatch) {
        const n = ordinals[nthMatch[1]];
        const dayIdx = weekdays.indexOf(nthMatch[2]);
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

function DistrictDashboardContent() {
  const searchParams = useSearchParams();
  const districtName = searchParams.get('district') || '';
  const [mounted, setMounted] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState<string | null>(null);
  const [rosterSearch, setRosterSearch] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const districtData = useMemo(() => {
    if (!mounted || !districtName) return null;

    const sourceMap: Record<string, any> = {
      'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
      'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
      'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
      'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
      'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
      'kandhamal': kalahandiDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
      'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'balasore': balasoreDistrictData,
      'baleswar': baleswarDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData,
      'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
      'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
    };

    const source = sourceMap[districtName.toLowerCase()];
    const districtMRFs = mrfData.filter(m => m.district.toLowerCase() === districtName.toLowerCase());
    const blocksList = Array.from(new Set(districtMRFs.map(m => m.blockCovered))).sort();

    const ulbsList = Array.from(new Set(districtMRFs.map(m => JSON.stringify({ name: m.ulbName, block: m.blockCovered }))))
        .map(s => JSON.parse(s))
        .sort((a, b) => a.name.localeCompare(b.name));

    const gpsList: any[] = [];
    districtMRFs.forEach(mrf => {
        if (source && source.getBlockDetails) {
            const details = source.getBlockDetails(mrf.blockCovered);
            (details.gps || []).forEach((gp: any) => {
                const w = (details.waste || []).find((waste: any) => waste.gpName.toLowerCase() === gp.gpName.toLowerCase());
                gpsList.push({
                    name: gp.gpName,
                    block: mrf.blockCovered,
                    households: w?.totalHouseholds || 0,
                    waste: w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000) || 0) : 0,
                    active: (w?.totalWasteKg || w?.monthlyWasteTotalGm || 0) > 0
                });
            });
        }
    });

    const totalWaste = gpsList.reduce((sum, g) => sum + g.waste, 0);
    const now = new Date();

    const activeCircuits = (source?.data?.collectionSchedules || []).map((s: any) => {
        const daysLeft = calculateDaysUntilNext(s.collectionSchedule, now);
        const routeInfo = source.data.routes?.find((r: any) => 
          (s.gpName || "").toLowerCase().includes((r.routeId || "").toLowerCase()) || 
          (s.gpName || "").toLowerCase().includes((r.startingGp || "").toLowerCase())
        );
        
        return {
            ...s,
            daysLeft,
            isActiveToday: daysLeft === 0,
            countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days`,
            actualRouteId: routeInfo?.routeId || s.routeId || 'CIRCUIT',
            routeName: routeInfo?.routeName || s.gpName,
            startGp: routeInfo?.startingGp || s.gpName.split(',')[0].trim(),
            endGp: routeInfo?.finalGp || routeInfo?.destination || s.mrf,
            vehicleDetails: `${s.vehicleType || 'TATA ACE'} | ${s.vehicleNo || '-'}`
        };
    }).sort((a: any, b: any) => {
        if (a.isActiveToday && !b.isActiveToday) return -1;
        if (!a.isActiveToday && b.isActiveToday) return 1;
        return a.daysLeft - b.daysLeft;
    });

    return {
        blocks: blocksList,
        ulbs: ulbsList,
        mrfs: districtMRFs,
        gps: gpsList,
        totalWaste,
        efficiency: "94.2",
        activeCircuits,
        activeSummary: [
            { name: 'Active', value: gpsList.filter(g => g.active).length, names: gpsList.filter(g => g.active).map(g => g.name), fill: '#15803d' }, 
            { name: 'Non-Active', value: gpsList.filter(g => !g.active).length, names: gpsList.filter(g => !g.active).map(g => g.name), fill: '#dc2626' }
        ],
        compositionData: [{ name: 'Plastic', value: 40 }, { name: 'Paper', value: 20 }, { name: 'Metal', value: 12 }, { name: 'Cloth', value: 10 }, { name: 'Glass', value: 8 }, { name: 'Sanitation', value: 7 }, { name: 'Others', value: 3 }],
        rosters: {
            'Sanitation Workers': (source?.data?.routes || []).flatMap((r: any) => (r.workers || []).map((w: any) => ({ name: w.name, phone: w.contact, mrf: r.destination, block: r.block || districtName }))),
            'Nodal Person (GP)': (source?.data?.collectionSchedules || []).map((s: any) => ({ name: (s.gpNodalPerson || "").split(',')[0].trim(), phone: (s.gpNodalContact || "").split(',')[0].trim(), target: s.gpName })),
            'Nodal Person (ULB)': (source?.data?.collectionSchedules || []).map((s: any) => ({ name: (s.ulbNodalPerson || "").split(',')[0].trim(), phone: (s.ulbNodalContact || "").split(',')[0].trim(), target: s.ulb, block: s.block })),
            'Logistical Drivers': (source?.data?.collectionSchedules || []).filter((s: any) => s.driverName && s.driverName !== '-').map((s: any) => ({ name: s.driverName, phone: s.driverContact, mrf: s.mrf }))
        }
    };
  }, [mounted, districtName]);

  const filteredRosterData = useMemo(() => {
    if (!districtData || !selectedRoster) return [];
    const roster = districtData.rosters[selectedRoster as keyof typeof districtData.rosters] || [];
    return roster.filter((p: any) => p.name.toLowerCase().includes(rosterSearch.toLowerCase()) || (p.phone || "").includes(rosterSearch));
  }, [districtData, selectedRoster, rosterSearch]);

  if (!mounted || !districtData) return <div className="p-12 text-center animate-pulse">Syncing district monitoring hub...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-3xl font-black uppercase tracking-tight text-primary">District {districtName} Monitoring Hub</CardTitle>
            <CardDescription className="font-bold italic text-muted-foreground">Authoritative analytical oversight for {districtName} district circuits.</CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4">
        <Popover>
            <PopoverTrigger asChild>
                <Card className="min-w-[160px] border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                  <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">Blocks</CardTitle><Building className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                  <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{districtData.blocks.length} Nodes</div></CardContent>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 border-2 shadow-2xl">
                <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Associated Blocks</h4>
                <ScrollArea className="h-64"><div className="p-2 space-y-1">{districtData.blocks.map((b, i) => (<div key={i} className="p-2 text-[10px] font-bold uppercase border-b border-dashed hover:bg-primary/5 transition-colors">{b}</div>))}</div></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="min-w-[160px] border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                  <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">ULBs</CardTitle><Activity className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                  <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{districtData.ulbs.length} Nodes</div></CardContent>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Associated ULBs</h4>
                <Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead className="uppercase text-[9px] font-black border-r">ULB Name</TableHead><TableHead className="uppercase text-[9px] font-black">Block</TableHead></TableRow></TableHeader>
                    <TableBody>{districtData.ulbs.map((u, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase border-r">{u.name}</TableCell><TableCell className="text-[10px] uppercase text-muted-foreground">{u.block}</TableCell></TableRow>))}</TableBody>
                </Table>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="min-w-[160px] border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                  <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">MRFs Hub</CardTitle><Warehouse className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                  <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{districtData.mrfs.length} Nodes</div></CardContent>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0 border-2 shadow-2xl overflow-hidden">
                <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Facility Registry</h4>
                <Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead className="uppercase text-[9px] font-black border-r">MRF Name</TableHead><TableHead className="uppercase text-[9px] font-black border-r">Block</TableHead><TableHead className="uppercase text-[9px] font-black text-center">Status</TableHead></TableRow></TableHeader>
                    <TableBody>{districtData.mrfs.map((m, i) => (<TableRow key={i} className="h-12 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase leading-tight border-r">{m.mrfId}</TableCell><TableCell className="text-[10px] uppercase text-muted-foreground border-r">{m.blockCovered}</TableCell><TableCell className="text-center"><Badge className={`text-[8px] uppercase ${m.functionality === 'Functional' ? 'bg-green-600' : 'bg-orange-500'}`}>{m.functionality}</Badge></TableCell></TableRow>))}</TableBody>
                </Table>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="min-w-[160px] border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                  <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">GPs Tagged</CardTitle><MapPin className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                  <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{districtData.gps.length} Nodes</div></CardContent>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">GP Nodal Directory</h4>
                <ScrollArea className="h-80"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead className="uppercase text-[9px] font-black border-r">GP Name</TableHead><TableHead className="uppercase text-[9px] font-black">Block</TableHead></TableRow></TableHeader>
                    <TableBody>{districtData.gps.map((g, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[10px] font-bold uppercase border-r">{g.name}</TableCell><TableCell className="text-[10px] uppercase text-muted-foreground">{g.block}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="min-w-[160px] border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                  <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">Households</CardTitle><Home className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                  <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{districtData.gps.reduce((sum, g) => sum + g.households, 0).toLocaleString()}</div></CardContent>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0 border-2 shadow-2xl overflow-hidden">
                <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Household Audit Breakdown</h4>
                <ScrollArea className="h-80"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead className="uppercase text-[9px] font-black border-r">HH Count</TableHead><TableHead className="uppercase text-[9px] font-black border-r">GP Node</TableHead><TableHead className="uppercase text-[9px] font-black">Block</TableHead></TableRow></TableHeader>
                    <TableBody>{districtData.gps.map((gp, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[11px] font-mono font-black border-r">{gp.households.toLocaleString()}</TableCell><TableCell className="text-[10px] font-bold uppercase text-primary border-r">{gp.name}</TableCell><TableCell className="text-[10px] uppercase text-muted-foreground">{gp.block}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Card className="min-w-[160px] border-2 shadow-sm cursor-pointer hover:bg-primary/5 transition-all group">
                  <CardHeader className="p-3 pb-1 flex row items-center justify-between space-y-0"><CardTitle className="text-[9px] uppercase font-black text-muted-foreground">Total Collected</CardTitle><Activity className="h-3 w-3 opacity-20 group-hover:opacity-100" /></CardHeader>
                  <CardContent className="px-3 pb-3"><div className="text-xl font-black underline">{districtData.totalWaste.toLocaleString()} Kg</div></CardContent>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                <h4 className="font-black uppercase text-[10px] p-3 bg-muted border-b text-center tracking-widest">Verification Ledger</h4>
                <ScrollArea className="h-80"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead className="uppercase text-[9px] font-black border-r">Waste (Kg)</TableHead><TableHead className="uppercase text-[9px] font-black border-r">GP Node</TableHead><TableHead className="uppercase text-[9px] font-black">Block</TableHead></TableRow></TableHeader>
                    <TableBody>{districtData.gps.map((g, i) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[11px] font-mono font-black text-primary border-r">{g.waste.toLocaleString()}</TableCell><TableCell className="text-[10px] font-bold uppercase border-r">{g.name}</TableCell><TableCell className="text-[10px] uppercase text-muted-foreground">{g.block}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
            </PopoverContent>
        </Popover>

        <Card className="min-w-[160px] border-2 shadow-sm bg-primary/5 border-primary/20"><CardHeader className="p-3 pb-1"><CardTitle className="text-[9px] font-black uppercase text-primary">Efficiency</CardTitle></CardHeader><CardContent className="px-3 pb-3"><div className="text-xl font-black text-primary">{districtData.efficiency}%</div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-2 border-destructive/20 bg-destructive/[0.01]">
            <CardHeader className="bg-destructive/5 border-b pb-3 flex row items-center justify-between space-y-0"><div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /><CardTitle className="text-base font-black uppercase">Critical Discrepancy Hub</CardTitle></div></CardHeader>
            <CardContent className="pt-4"><ScrollArea className="h-[250px] pr-4"><div className="grid gap-3">{districtData.mrfs.filter(m => m.functionality !== 'Functional').map((alert, i) => (<div key={i} className="p-4 border rounded-xl bg-card shadow-sm flex items-start gap-4 border-l-4 border-l-destructive"><div className="p-2 rounded-full bg-destructive/10 h-fit"><Info className="h-4 w-4 text-destructive" /></div><div className="space-y-1"><p className="font-black text-xs uppercase text-destructive leading-tight">Infrastructure: {alert.mrfId}</p><p className="text-[10px] font-bold text-muted-foreground">Status: {alert.functionality}</p></div></div>))}{districtData.mrfs.every(m => m.functionality === 'Functional') && <div className="h-[200px] flex items-center justify-center italic text-muted-foreground text-xs">No active discrepancies identified.</div>}</div></ScrollArea></CardContent>
        </Card>

        <Card className="border-2 border-primary/30 bg-primary/[0.01]">
            <CardHeader className="bg-primary/5 border-b pb-3 flex flex-row items-center justify-between space-y-0"><div className="flex items-center gap-2 text-primary"><Truck className="h-5 w-5" /><CardTitle className="text-base font-black uppercase">Active Logistical Circuits</CardTitle></div></CardHeader>
            <CardContent className="p-0"><ScrollArea className="h-[290px]"><div className="grid gap-0 divide-y">{districtData.activeCircuits.map((log, i) => (
                <div key={i} className={`p-5 flex items-center justify-between group hover:bg-muted/5 transition-colors border-l-4 ${log.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}>
                    <div className="flex-1 space-y-1 pr-6 border-r border-dashed">
                        <p className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Anchor className="h-2.5 w-2.5 opacity-40"/> {log.mrf}</p>
                        <p className="font-black text-xs uppercase text-foreground">{log.actualRouteId}: {log.routeName}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase pt-1">
                            <span className="text-green-700">{log.startGp}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-blue-700">{log.endGp}</span>
                        </div>
                    </div>
                    <div className="flex-1 border-x border-dashed px-6 text-center"><p className="text-[10px] font-black uppercase text-foreground truncate"><UserCircle className="h-3.5 w-3.5 inline mr-1 opacity-40"/> {log.driverName}</p><p className="text-[9px] font-bold text-muted-foreground uppercase truncate pt-1"><Truck className="h-3.5 w-3.5 inline mr-1 opacity-40"/> {log.vehicleDetails}</p></div>
                    <div className="flex-1 text-right pl-6"><div className={`text-lg font-black leading-none ${log.isActiveToday ? 'text-green-700 animate-pulse' : 'text-foreground'}`}>{log.countdown}</div><div className="text-[10px] font-black text-blue-700 uppercase mt-1.5">{log.collectionSchedule}</div></div>
                </div>
            ))}</div></ScrollArea></CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-md">
          <CardHeader className="border-b bg-muted/5 py-3"><CardTitle className="text-sm font-black uppercase">District Verification Flow (Kg)</CardTitle></CardHeader>
          <CardContent className="h-[350px] pt-8"><ResponsiveContainer width="100%" height="100%"><LineChart data={districtData.gps} margin={{ bottom: 60, left: 10, right: 10 }}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} fontSize={8} fontWeight="bold" /><YAxis fontSize={10} /><Tooltip /><Line type="monotone" dataKey="waste" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 4, fill: "hsl(var(--primary))" }} /></LineChart></ResponsiveContainer></CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-2 shadow-sm"><CardHeader className="border-b bg-muted/10 py-3"><CardTitle className="text-sm font-black uppercase">Waste Collected by Block (Kg)</CardTitle></CardHeader><CardContent className="h-[350px] pt-8"><ResponsiveContainer width="100%" height="100%"><BarChart data={districtData.blocks.map(b => ({ name: b, waste: districtData.gps.filter(g => g.block === b).reduce((s, g) => s + g.waste, 0) }))} margin={{ bottom: 40 }}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="name" fontSize={10} fontWeight="bold" /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="waste" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card className="border-2 shadow-sm"><CardHeader className="border-b bg-muted/10 py-3 flex flex-row items-center justify-between"><CardTitle className="text-sm font-black uppercase">Nodal Performance Hub</CardTitle></CardHeader><CardContent className="h-[350px] pt-8"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={[...districtData.gps].sort((a,b) => b.waste - a.waste).slice(0, 5)} margin={{ left: 20, right: 30 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} /><XAxis type="number" fontSize={10} hide /><YAxis dataKey="name" type="category" fontSize={9} width={100} fontWeight="black" /><Tooltip /><Bar dataKey="waste" fill="#15803d" radius={[0, 4, 4, 0]} barSize={35} /></BarChart></ResponsiveContainer></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-2 shadow-sm"><CardHeader className="border-b bg-muted/10 py-3"><CardTitle className="text-sm font-black uppercase">Nodal Activity Status</CardTitle></CardHeader><CardContent className="h-[350px] pt-8"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={districtData.activeSummary} margin={{ left: 20, right: 30 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} /><XAxis type="number" fontSize={10} /><YAxis dataKey="name" type="category" fontSize={10} fontWeights="black" width={80} /><Tooltip content={<CustomActiveTooltip />} /><Bar dataKey="value" name="Nodes" radius={[0, 4, 4, 0]} barSize={50} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card className="border-2 shadow-sm"><CardHeader className="border-b bg-muted/10 pb-3"><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><PieIcon className="h-5 w-5 text-primary" /> Waste Stream Composition (%)</CardTitle></CardHeader><CardContent className="h-[350px] pt-6"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={districtData.compositionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">{districtData.compositionData.map((entry, index) => <Cell key={index} fill={COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]} />)}</Pie><Tooltip /><RechartsLegend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} /></PieChart></ResponsiveContainer></CardContent></Card>
      </div>

      <Card className="border-2 border-primary/20 bg-muted/5 shadow-xl">
        <CardHeader className="bg-primary/5 border-b"><CardTitle className="flex items-center gap-2 font-headline uppercase tracking-tight text-primary"><Users className="h-6 w-6" /> District Personnel Registry</CardTitle></CardHeader>
        <CardContent className="pt-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(districtData.rosters).map((category) => (
                    <Card key={category} className="cursor-pointer hover:bg-primary/5 transition-all border-2 border-dashed border-primary/20 group" onClick={() => { setSelectedRoster(category); setRosterSearch(""); }}>
                        <CardContent className="flex items-center gap-4 py-6">
                            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                {category.includes('Workers') ? <Users /> : category.includes('Nodal') ? <UserCircle /> : <Truck />}
                            </div>
                            <div><p className="text-2xl font-black text-foreground">{districtData.rosters[category as keyof typeof districtData.rosters].length}</p><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{category}</p></div>
                            <ChevronRight className="ml-auto opacity-20 group-hover:opacity-100" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </CardContent>
      </Card>

      <Popover open={!!selectedRoster} onOpenChange={(open) => !open && setSelectedRoster(null)}>
        <PopoverContent className="w-[800px] p-0 border-2 shadow-2xl overflow-hidden" align="center">
            <div className="p-6 pb-2 bg-primary/5 border-b flex justify-between items-center"><h2 className="text-2xl font-black uppercase text-primary">{selectedRoster} Directory</h2></div>
            <div className="px-6 py-4 bg-background border-b"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name..." className="pl-9 h-11 font-medium" value={rosterSearch} onChange={(e) => setRosterSearch(e.target.value)} /></div></div>
            <ScrollArea className="h-[400px]"><Table><TableHeader className="bg-muted/50 sticky top-0 z-10 border-b"><TableRow><TableHead className="uppercase text-[10px] font-black border-r">Name</TableHead><TableHead className="uppercase text-[10px] font-black border-r">Phone</TableHead><TableHead className="uppercase text-[10px] font-black">Node</TableHead></TableRow></TableHeader>
                <TableBody>{filteredRosterData.map((p: any, i: number) => (<TableRow key={i} className="hover:bg-muted/30 border-b border-dashed last:border-0 h-14"><TableCell className="text-xs font-black uppercase border-r">{p.name}</TableCell><TableCell className="text-xs font-mono font-black text-primary border-r">{p.phone || "Verified"}</TableCell><TableCell className="text-[10px] font-bold uppercase text-muted-foreground">{p.target || p.mrf || p.ulb || '-'}</TableCell></TableRow>))}</TableBody></Table></ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function DistrictDashboardPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Loading district hub...</div>}>
            <DistrictDashboardContent />
        </Suspense>
    );
}