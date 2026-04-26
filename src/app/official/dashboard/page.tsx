'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Truck, 
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState, useEffect, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from 'next/navigation';

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
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { puriDistrictData } from "@/lib/disPuri";
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { sambalpurDistrictData } from "@/lib/disSambalpur";

const calculateDaysUntilNext = (schedule: string, now: Date) => {
    if (!schedule || /notified|required|TBD|NA/i.test(schedule)) return 999;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const s = schedule.toLowerCase().replace(/\s+/g, ' ');
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const ordinals: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, 'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5 };
    const getNthWeekday = (year: number, month: number, weekdayIdx: number, n: number) => {
        let count = 0; let d = new Date(year, month, 1);
        while (d.getMonth() === month) { if (d.getDay() === weekdayIdx) { count++; if (count === n) return new Date(d); } d.setDate(d.getDate() + 1); }
        return null;
    };
    const nthMatch = s.match(/(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i);
    if (nthMatch) {
        const n = ordinals[nthMatch[1]]; const dayIdx = weekdays.indexOf(nthMatch[2]);
        let target = getNthWeekday(today.getFullYear(), today.getMonth(), dayIdx, n);
        if (!target || target < today) { let nextM = today.getMonth() + 1; if (nextM > 11) { nextM = 0; today.setFullYear(today.getFullYear() + 1); } target = getNthWeekday(today.getFullYear(), nextM, dayIdx, n); }
        if (target) return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    let minDays = 999; weekdays.forEach((day, i) => { if (s.includes(day)) { let diff = i - today.getDay(); if (diff < 0) diff += 7; if (diff < minDays) minDays = diff; } });
    return minDays;
};

function DistrictDashboardContent() {
  const searchParams = useSearchParams();
  const districtName = searchParams.get('district') || '';
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const districtData = useMemo(() => {
    if (!mounted || !districtName) return null;
    const sourceMap: Record<string, any> = { 'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData, 'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData, 'kandhamal': kalahandiDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData, 'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData, 'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData };
    const source = sourceMap[districtName.toLowerCase()];
    const districtMRFs = mrfData.filter(m => m.district.toLowerCase() === districtName.toLowerCase());
    const activeCircuits = (source?.data?.collectionSchedules || []).map((s: any) => {
        const daysLeft = calculateDaysUntilNext(s.collectionSchedule, new Date());
        return { ...s, daysLeft, isActiveToday: daysLeft === 0, countdown: daysLeft === 0 ? "Active Today" : `In ${daysLeft} days` };
    }).sort((a: any, b: any) => a.daysLeft - b.daysLeft);

    const gpList = (source?.data?.gpMappings || []).map((gp: any) => {
        const w = (source?.data?.wasteGeneration || []).find((waste: any) => waste.gpName.toLowerCase() === gp.gpName.toLowerCase());
        const collected = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000) || 0) : 0;
        return { name: gp.gpName, value: collected };
    }).sort((a: any, b: any) => b.value - a.value);

    return { activeCircuits, topGps: gpList.slice(0, 5), lowGps: gpList.slice(-5).reverse() };
  }, [mounted, districtName]);

  if (!mounted || !districtData) return null;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b"><CardTitle className="text-3xl font-black uppercase text-primary">District {districtName} Dashboard</CardTitle></CardHeader>
      </Card>
      
      <Card className="border-2 border-primary/30 bg-primary/[0.01]"><CardHeader className="bg-primary/5 border-b pb-3 flex row items-center gap-2"><Truck className="h-5 w-5 text-primary" /><CardTitle className="text-base font-black uppercase text-primary">Active Logistical Circuits</CardTitle></CardHeader><CardContent className="p-0"><ScrollArea className="h-[290px]"><div className="grid gap-0 divide-y">{districtData.activeCircuits.map((log, i) => (<div key={i} className={`p-5 flex items-center justify-between border-l-4 ${log.isActiveToday ? 'border-l-green-600 bg-green-50/10' : 'border-l-primary/20'}`}><div className="flex-1 pr-6 border-r border-dashed"><p className="text-[9px] font-black uppercase text-primary">{log.mrf}</p><p className="font-black text-xs uppercase">{log.gpName}</p></div><div className="flex-1 text-center px-6"><div className={`text-lg font-black ${log.isActiveToday ? 'text-green-700 animate-pulse' : ''}`}>{log.countdown}</div></div><div className="flex-1 text-right pl-6"><p className="text-[10px] font-black uppercase">{log.driverName}</p><p className="text-[8px] font-bold uppercase text-muted-foreground">{log.vehicleType}</p></div></div>))}</div></ScrollArea></CardContent></Card>

      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/> Nodal Performance Hub (Kg)</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] pt-8">
            <Tabs defaultValue="top">
                <TabsList className="mb-4">
                    <TabsTrigger value="top" className="text-[10px] font-black uppercase">Top 5 Nodes</TabsTrigger>
                    <TabsTrigger value="low" className="text-[10px] font-black uppercase">Lowest 5 Nodes</TabsTrigger>
                </TabsList>
                <TabsContent value="top" className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtData.topGps} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" fontSize={10} />
                            <YAxis dataKey="name" type="category" fontSize={9} width={100} fontWeights="bold" />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="low" className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtData.lowGps} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" fontSize={10} />
                            <YAxis dataKey="name" type="category" fontSize={9} width={100} fontWeights="bold" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DistrictDashboardPage() {
    return (<Suspense fallback={<div>Loading...</div>}><DistrictDashboardContent /></Suspense>);
}
