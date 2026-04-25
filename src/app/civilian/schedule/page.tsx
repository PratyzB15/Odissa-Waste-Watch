
'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, MapPin, Clock, Layers, Anchor, Weight } from "lucide-react";
import { useSearchParams } from "next/navigation";

// District Data Imports
import { jajpurDistrictData } from "@/lib/disJajpur";
import { bhadrakDistrictData } from "@/lib/disBhadrak";
import { angulDistrictData } from "@/lib/disAngul";
import { balangirDistrictData } from "@/lib/disBalangir";
import { baleswarDistrictData } from "@/lib/disBaleswar";
import { balasoreDistrictData } from "@/lib/disBalasore";
import { bargarhDistrictData } from "@/lib/disBargarh";
import { boudhDistrictData } from "@/lib/disBoudh";
import { cuttackDistrictData } from "@/lib/disCuttack";
import { deogarhDistrictData } from "@/lib/disDeogarh";
import { dhenkanalDistrictData } from "@/lib/disDhenkanal";
import { gajapatiDistrictData } from "@/lib/disGajapati";
import { ganjamDistrictData } from "@/lib/disGanjam";
import { jagatsinghpurDistrictData } from "@/lib/disJagatsinghpur";
import { sonepurDistrictData } from "@/lib/disSonepur";
import { jharsugudaDistrictData } from "@/lib/disJharsuguda";
import { kalahandiDistrictData } from "@/lib/disKalahandi";
import { kandhamalDistrictData } from "@/lib/disKandhamal";
import { kendraparaDistrictData } from "@/lib/disKendrapara";
import { kendujharDistrictData } from "@/lib/disKendujhar";
import { khordhaDistrictData } from "@/lib/disKhordha";
import { koraputDistrictData } from "@/lib/disKoraput";
import { malkangiriDistrictData } from "@/lib/disMalkangiri";
import { mayurbhanjDistrictData } from "@/lib/disMayurbhanj";

function CivilianScheduleContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const district = searchParams.get('district') || '';
  const block = searchParams.get('block') || '';
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const routeData = useMemo(() => {
    if (!district || !block) return null;

    const districtsMap: Record<string, any> = {
        'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
        'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
        'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
        'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
        'koraput': koraputDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData,
        'bargarh': bargarhDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData,
        'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData,
        'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'sonepur': sonepurDistrictData
    };

    const source = districtsMap[district.toLowerCase()];
    if (!source) return null;

    const blockDetails = source.getBlockDetails(block);
    
    // Find the route where this personnel is assigned
    // Match by driver name OR worker roster
    const assignedRoute = blockDetails.routes.find((r: any) => {
        const isDriver = (blockDetails.schedules || []).some((s: any) => 
            s.driverName.toLowerCase().includes(name.toLowerCase()) && 
            (s.gpName.toLowerCase().includes(r.routeId.toLowerCase()) || s.gpName.toLowerCase().includes(r.startingGp.toLowerCase()))
        );
        const isWorker = (r.workers || []).some((w: any) => w.name.toLowerCase().includes(name.toLowerCase()));
        return isDriver || isWorker;
    }) || blockDetails.routes[0];

    if (!assignedRoute) return null;

    const schedule = blockDetails.schedules?.find((s: any) => 
        s.gpName.toLowerCase().includes(assignedRoute.routeId.toLowerCase()) ||
        s.gpName.toLowerCase().includes(assignedRoute.startingGp.toLowerCase())
    );

    const stops = [
        { name: assignedRoute.startingGp, time: "08:00 AM", status: "Active" },
        ...(assignedRoute.intermediateGps || []).map((igp: string, idx: number) => ({
            name: igp,
            time: `${9 + idx}:00 AM`,
            status: "Pending"
        })),
        { name: assignedRoute.finalGp || assignedRoute.destination, time: "02:00 PM", status: "Target" }
    ];

    return {
        reportTime: "07:30 AM",
        route: assignedRoute.routeName || assignedRoute.routeId,
        routeId: assignedRoute.routeId,
        fromGp: assignedRoute.startingGp,
        toUlb: assignedRoute.destination,
        expectedWaste: `${schedule?.wasteGeneratedKg || 'TBD'} KG`,
        wasteTypes: "Plastic, Paper, Glass, Metal, Cloth",
        stops
    };
  }, [name, district, block]);

  if (!routeData) {
      return (
          <div className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-xl">
              No assigned circuit path resolved for your profile. Please contact the Block Coordinator.
          </div>
      );
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight">Today's Assigned Schedule</CardTitle>
        <CardDescription className="font-bold">{currentDate || "..."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-dashed">
                <div className="p-2 rounded-full bg-background"><Clock className="h-5 w-5 text-primary"/></div>
                <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Report Time</p>
                    <p className="font-black text-lg">{routeData.reportTime}</p>
                </div>
            </div>
             <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-dashed">
                <div className="p-2 rounded-full bg-background"><MapPin className="h-5 w-5 text-primary"/></div>
                <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Route ID</p>
                    <p className="font-black text-lg text-primary">{routeData.routeId}</p>
                </div>
            </div>
             <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-dashed">
                <div className="p-2 rounded-full bg-background"><Anchor className="h-5 w-5 text-primary"/></div>
                <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Terminal Path</p>
                    <p className="font-bold text-xs uppercase">{routeData.fromGp} &rarr; {routeData.toUlb}</p>
                </div>
            </div>
             <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-dashed">
                <div className="p-2 rounded-full bg-background"><Weight className="h-5 w-5 text-primary"/></div>
                <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Est. Load</p>
                    <p className="font-black text-lg">{routeData.expectedWaste}</p>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" /> Logistical Circuit Nodes
            </h3>
            <div className="relative pl-10 border-l-4 border-primary/20 space-y-12">
                {routeData.stops.map((stop, index) => (
                    <div key={index} className="relative">
                         <div className="h-6 w-6 bg-background border-4 border-primary rounded-full flex items-center justify-center absolute -left-[44px] top-1 z-10 shadow-sm">
                            {stop.status !== 'Pending' && <div className="h-2 w-2 bg-primary rounded-full"></div>}
                        </div>
                        <Card className={`p-4 shadow-sm border-l-4 ${stop.status === 'Active' ? 'border-l-green-600 bg-green-50/30' : 'border-l-primary/30'}`}>
                            <div className="flex justify-between items-center">
                                <p className="font-black text-sm uppercase text-foreground">{stop.name}</p>
                                <Badge variant={stop.status === "Active" ? "default" : "outline"} className="text-[9px] font-black uppercase">{stop.status}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">
                                <Clock className="h-3 w-3"/>
                                <span>Estimated Arrival: {stop.time}</span>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CivilianSchedulePage() {
    return (
        <Suspense fallback={<div className="p-12 text-center animate-pulse">Mapping assigned circuit...</div>}>
            <CivilianScheduleContent />
        </Suspense>
    )
}
