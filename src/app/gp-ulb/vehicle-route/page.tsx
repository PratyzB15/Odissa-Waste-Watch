'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, User, Calendar, Route, Clock, Navigation, Anchor, Phone, Users, Info } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { routePlanData as jajpurRoutes } from "@/lib/disJajpur/routePlanData";
import { routePlanData as bhadrakRoutes } from "@/lib/disBhadrak/routePlanData";
import { routePlanData as angulRoutes } from "@/lib/disAngul/routePlanData";
import { routePlanData as balangirRoutes } from "@/lib/disBalangir/routePlanData";
import { routePlanData as baleswarRoutes } from "@/lib/disBaleswar/routePlanData";
import { routePlanData as jagatsinghpurRoutes } from "@/lib/disJagatsinghpur/routePlanData";
import { collectionScheduleData as jajpurSchedules } from "@/lib/disJajpur/collectionScheduleData";
import { collectionScheduleData as bhadrakSchedules } from "@/lib/disBhadrak/collectionScheduleData";
import { collectionScheduleData as angulSchedules } from "@/lib/disAngul/collectionScheduleData";
import { collectionScheduleData as balangirSchedules } from "@/lib/disBalangir/collectionScheduleData";
import { collectionScheduleData as baleswarSchedules } from "@/lib/disBaleswar/collectionScheduleData";
import { collectionScheduleData as jagatsinghpurSchedules } from "@/lib/disJagatsinghpur/collectionScheduleData";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

function VehicleRouteContent() {
    const searchParams = useSearchParams();
    const gpName = searchParams.get('gp') || '';

    const routeData = useMemo(() => {
        const allRoutes = [...jajpurRoutes, ...bhadrakRoutes, ...angulRoutes, ...balangirRoutes, ...baleswarRoutes, ...jagatsinghpurRoutes];
        const allSchedules = [...jajpurSchedules, ...bhadrakSchedules, ...angulSchedules, ...balangirSchedules, ...baleswarSchedules, ...jagatsinghpurSchedules];

        // Find the route that covers this GP
        const route = allRoutes.find(r => 
            r.startingGp.toLowerCase() === gpName.toLowerCase() ||
            (Array.isArray(r.intermediateGps) && r.intermediateGps.some((igp: any) => (typeof igp === 'string' ? igp : igp.name || igp).toLowerCase() === gpName.toLowerCase())) ||
            (r as any).finalGp?.toLowerCase() === gpName.toLowerCase()
        );

        if (!route) return null;

        // Find the corresponding schedule data for vehicle/driver details, prioritizing Route ID matching for clusters
        const schedule = allSchedules.find(s => 
            (route && s.gpName.toLowerCase().includes(route.routeId.toLowerCase())) ||
            s.gpName.toLowerCase().includes(gpName.toLowerCase()) ||
            s.mrf.toLowerCase().includes(route.destination.toLowerCase()) ||
            route.destination.toLowerCase().includes(s.mrf.toLowerCase())
        );

        return {
            routeId: route.routeId,
            routeName: (route as any).routeName || route.routeId,
            abbreviation: (route as any).routeAbbreviation || route.routeId,
            destination: route.destination,
            distance: route.totalDistance,
            path: [route.startingGp, ...route.intermediateGps.map((igp: any) => typeof igp === 'string' ? igp : igp.name || igp), (route as any).finalGp || route.destination],
            vehicleNo: schedule?.vehicleNo && schedule.vehicleNo !== '-' ? schedule.vehicleNo : 'TBD',
            vehicleType: schedule?.vehicleType || 'Motorised',
            driverName: schedule?.driverName && schedule.driverName !== '-' ? schedule.driverName : 'Verified Personnel',
            driverContact: schedule?.driverContact && schedule.driverContact !== '-' ? schedule.driverContact : '9437XXXXXX',
            collectionDay: schedule?.collectionSchedule || 'Scheduled',
            startTime: "08:00 AM",
            endTime: "02:00 PM",
            workers: (route as any).workers || []
        };
    }, [gpName]);

    if (!routeData) {
        return (
            <Card className="border-2 border-dashed">
                <CardHeader className="text-center py-12">
                    <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <CardTitle className="text-muted-foreground">No Active Route Found</CardTitle>
                    <CardDescription>Your Gram Panchayat is currently not mapped to an active collection circuit.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

  return (
    <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
            <Card className="border-2 shadow-sm">
                <CardHeader className="bg-primary/5 border-b pb-3">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary"/> Vehicle Assignment
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-dashed pb-2">
                        <span className="text-muted-foreground font-medium">Reg. Number:</span>
                        <Badge variant="outline" className="font-mono font-bold text-primary border-primary/30">{routeData.vehicleNo}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Type:</span>
                        <span className="font-black uppercase text-xs">{routeData.vehicleType}</span>
                    </div>
                </CardContent>
            </Card>

             <Card className="border-2 shadow-sm">
                <CardHeader className="bg-primary/5 border-b pb-3">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <User className="h-4 w-4 text-primary"/> Driver Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Verified Personnel</span>
                        <span className="font-black text-lg text-primary uppercase">{routeData.driverName}</span>
                    </div>
                    <div className="bg-muted p-2 rounded-lg flex items-center justify-between">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono font-black text-sm">{routeData.driverContact}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
                <CardHeader className="bg-primary/5 border-b pb-3">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary"/> Sanitation Workers
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ScrollArea className="h-[180px]">
                        <div className="space-y-2">
                            {routeData.workers.length > 0 ? routeData.workers.map((worker: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 border rounded-lg bg-card text-[10px]">
                                    <span className="font-black uppercase">{worker.name}</span>
                                    <span className="font-mono text-primary flex items-center gap-1">
                                        <Phone className="h-2.5 w-2.5" /> {worker.contact}
                                    </span>
                                </div>
                            )) : (
                                <div className="py-8 text-center bg-muted/10 rounded-lg border-2 border-dashed">
                                    <p className="text-xs text-muted-foreground italic text-center py-4">No workers assigned to this route.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

             <Card className="border-2 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b pb-3">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-primary"/> Logistics Path
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Route ID</p>
                        <div className="font-black text-lg flex items-center flex-wrap gap-2">
                            {routeData.routeId} 
                            <Badge className="font-mono">{routeData.abbreviation}</Badge>
                        </div>
                    </div>
                    
                    <div className="relative pl-4 border-l-2 border-primary/30 space-y-4 py-2">
                        {routeData.path.map((stop, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background border border-primary-foreground"></div>
                                <div className={`text-xs font-bold flex items-center flex-wrap gap-1 ${stop.toLowerCase() === gpName.toLowerCase() ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {stop} {stop.toLowerCase() === gpName.toLowerCase() && <Badge variant="secondary" className="text-[8px] py-0">YOUR GP</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-primary"/>
                            <span className="font-bold">{routeData.collectionDay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Clock className="h-3.5 w-3.5 text-primary"/>
                            <span className="font-bold text-muted-foreground">{routeData.startTime} - {routeData.endTime}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed">
                      <p className="text-[10px] text-muted-foreground italic leading-relaxed flex items-start gap-1.5">
                        <Info className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                        If waste collection not happened during the scheduled day/date due to some issue, then collection will be done in next day/date or any date coordinating with ULB Nodal person.
                      </p>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card className="border-2 h-full overflow-hidden">
                 <CardHeader className="border-b bg-muted/10">
                    <CardTitle className="flex items-center gap-2"><Navigation className="text-primary"/> Live Logistical Intelligence</CardTitle>
                    <CardDescription>Real-time coordination map for circuit: <span className="font-bold text-foreground">{routeData.routeName}</span></CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full h-[65vh]">
                         <Image
                            src="https://images.unsplash.com/photo-1613390230578-93f353592d76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzYXRlbGxpdGUlMjBtYXAlMjByb3V0ZSUyMHZlaGljbGV8ZW58MHx8fHwxNzE3NjE1MjgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="Logistical map tracking"
                            fill
                            className="object-cover opacity-80"
                            data-ai-hint="satellite map tracking"
                        />
                        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                        <div className="absolute top-6 left-6 bg-background/95 p-4 rounded-xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm max-w-[240px]">
                           <div className="flex items-center gap-2 mb-2">
                               <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Active Circuit</span>
                           </div>
                           <p className="font-black text-sm text-primary mb-1">{routeData.vehicleNo}</p>
                           <p className="text-[10px] font-bold text-muted-foreground mb-3">STATUS: <span className="text-foreground">IN TRANSIT</span></p>
                           <div className="text-[10px] space-y-1 pt-2 border-t">
                               <p className="font-bold">TOTAL DISTANCE: {routeData.distance} KM</p>
                               <p className="font-bold text-blue-700 flex items-center gap-1"><Anchor className="h-3 w-3"/> TARGET: {routeData.destination}</p>
                           </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="w-10 h-10 bg-primary rounded-full border-4 border-white shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center transform rotate-12 transition-transform hover:scale-110">
                                <Truck className="w-6 h-6 text-white"/>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-4 h-4 bg-primary/30 rounded-full animate-ping"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

export default function VehicleRoutePage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Mapping logistical path...</div>}>
            <VehicleRouteContent />
        </Suspense>
    );
}
