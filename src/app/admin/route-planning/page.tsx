
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Navigation, Anchor, MapPin, Download } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

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

export default function AdminRoutePlanningPage() {
  const masterRouteDirectory = useMemo(() => {
    const districtSources = [
      angulDistrictData,
      balangirDistrictData,
      balasoreDistrictData,
      baleswarDistrictData,
      bargarhDistrictData,
      bhadrakDistrictData,
      boudhDistrictData,
      cuttackDistrictData,
      deogarhDistrictData,
      dhenkanalDistrictData,
      gajapatiDistrictData,
      ganjamDistrictData,
      jagatsinghpurDistrictData,
      jajpurDistrictData,
      jharsugudaDistrictData,
      kalahandiDistrictData,
      kandhamalDistrictData,
      kendraparaDistrictData,
      kendujharDistrictData,
      sonepurDistrictData
    ];

    return districtSources.map(source => {
      const routes = source.data.routes || [];
      const schedules = source.data.collectionSchedules || [];

      const enrichedRoutes = routes.map(route => {
        // Try to find exact schedule for date/frequency
        const schedule = schedules.find(s => 
          s.gpName.toLowerCase().includes(route.routeId.toLowerCase()) ||
          s.gpName.toLowerCase().includes(route.startingGp.toLowerCase()) ||
          (route as any).routeName?.toLowerCase().includes(s.gpName.toLowerCase())
        );

        return {
          ...route,
          block: (route as any).block || schedule?.block || "District Circuit",
          schedule: schedule?.collectionSchedule || (route as any).scheduledOn || (route as any).scheduledDate || "Scheduled"
        };
      });

      return {
        districtName: source.district,
        routes: enrichedRoutes
      };
    }).filter(d => d.routes.length > 0);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01]">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Navigation className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-bold font-headline uppercase tracking-tight text-primary">State-wide Route Planning Directory</CardTitle>
                <CardDescription className="text-lg font-medium">Consolidated Logistical Paths Linking GP Segregation Points to MRFs across all Districts.</CardDescription>
              </div>
            </div>
            <Button variant="outline" className="font-bold border-primary text-primary hover:bg-primary/10">
              <Download className="mr-2 h-4 w-4" /> Export Master Plan (PDF)
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-10">
        {masterRouteDirectory.map((district) => (
          <Card key={district.districtName} className="border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/40 border-b py-3 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tighter text-foreground">{district.districtName} District</h3>
                </div>
                <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                  {district.routes.length} Verified Circuits
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[140px] uppercase text-[10px] font-black tracking-widest text-center border-r">Route ID</TableHead>
                    <TableHead className="w-[150px] uppercase text-[10px] font-black tracking-widest text-center border-r">Block Node</TableHead>
                    <TableHead className="uppercase text-[10px] font-black tracking-widest border-r px-6">Logistical Path (Start &rarr; Final)</TableHead>
                    <TableHead className="w-[200px] uppercase text-[10px] font-black tracking-widest border-r px-6">Target Facility (MRF)</TableHead>
                    <TableHead className="w-[200px] uppercase text-[10px] font-black tracking-widest text-center border-r">Collection Schedule</TableHead>
                    <TableHead className="w-[100px] text-right uppercase text-[10px] font-black tracking-widest pr-6">Dist (Km)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {district.routes.map((route, idx) => (
                    <TableRow key={idx} className="hover:bg-primary/[0.02] border-b border-dashed last:border-0 transition-colors">
                      <TableCell className="text-center border-r">
                        <p className="font-mono text-xs font-black text-primary">{route.routeId}</p>
                        <Badge variant="outline" className="text-[8px] font-bold uppercase mt-1 border-primary/20 bg-primary/5">
                          {(route as any).routeAbbreviation || route.routeId}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center border-r">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">{route.block}</p>
                      </TableCell>
                      <TableCell className="border-r px-6">
                        <div className="flex flex-col gap-0.5 max-w-[400px]">
                          <p className="text-xs font-black text-green-700 uppercase tracking-tight">{route.startingGp}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground italic font-medium truncate py-0.5">
                            <Navigation className="h-2.5 w-2.5 opacity-40" />
                            {Array.isArray(route.intermediateGps) ? 
                              route.intermediateGps.map(igp => typeof igp === 'string' ? igp : igp.name || igp).join(' → ') : 
                              'Direct Circuit'
                            }
                          </div>
                          <p className="text-xs font-black text-blue-700 uppercase tracking-tight">{route.finalGp || route.destination}</p>
                        </div>
                      </TableCell>
                      <TableCell className="border-r px-6">
                        <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                          <Anchor className="h-3.5 w-3.5 text-primary shrink-0 opacity-70" />
                          <span className="truncate uppercase tracking-tighter">{route.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center border-r">
                        <Badge variant="secondary" className="text-[9px] font-black uppercase bg-blue-50 text-blue-800 border-blue-100 whitespace-nowrap px-2.5 py-1">
                          {route.schedule}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-black text-xs text-primary pr-6">
                        {route.totalDistance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
