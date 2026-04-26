'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
    Phone, 
    User, 
    Truck, 
    Anchor, 
    ClipboardList, 
    Info, 
    Building, 
    LayoutGrid,
    Users
} from "lucide-react";
import { useMemo, useState, useEffect, Suspense } from "react";
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

function AdminWasteCollectionDetailsContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const masterCollectionStructure = useMemo(() => {
    if (!mounted) return [];

    const districtSources = [
      angulDistrictData, balangirDistrictData, balasoreDistrictData, baleswarDistrictData,
      bargarhDistrictData, bhadrakDistrictData, boudhDistrictData, cuttackDistrictData,
      deogarhDistrictData, dhenkanalDistrictData, gajapatiDistrictData, ganjamDistrictData,
      jagatsinghpurDistrictData, jajpurDistrictData, jharsugudaDistrictData, kalahandiDistrictData,
      kandhamalDistrictData, kendraparaDistrictData, kendujharDistrictData, khordhaDistrictData,
      koraputDistrictData, malkangiriDistrictData, mayurbhanjDistrictData, nabarangpurDistrictData,
      nayagarhDistrictData, nuapadaDistrictData, puriDistrictData, rayagadaDistrictData,
      sambalpurDistrictData, sonepurDistrictData
    ];

    return districtSources.map(source => {
      const schedules = source.data.collectionSchedules || [];
      
      const formatted = schedules.map((item: any, idx: number) => ({
        id: idx,
        block: item.block,
        ulb: item.ulb,
        mrf: item.mrf,
        vehicleInfo: `${item.vehicleType} | ${item.vehicleNo || '-'} | ${item.vehicleCapacity || '-'} Kg`,
        driverName: item.driverName || '-',
        driverContact: item.driverContact || '-',
        collectionSchedule: item.collectionSchedule,
        loadKg: item.wasteGeneratedKg || 0,
        gpNodalPerson: (item.gpNodalPerson || "").split(',')[0].trim(),
        gpNodalContact: (item.gpNodalContact || "").split(',')[0].trim(),
        ulbNodalPerson: (item.ulbNodalPerson || "").split(',')[0].trim(),
        ulbNodalContact: (item.ulbNodalContact || "").split(',')[0].trim()
      }));

      return {
        name: source.district,
        totalCircuits: schedules.length,
        rows: formatted
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [mounted]);

  const renderContactCell = (name: string, contact: string, label: string) => (
    <div className="space-y-0.5">
        <p className="flex items-center gap-1 font-bold uppercase tracking-tighter text-[9px]">
            <User className="h-2.5 w-2.5 opacity-60" /> {name || 'N/A'}
        </p>
        <p className="font-mono flex items-center gap-1 text-[9px] font-black text-primary">
            <Phone className="h-2.5 w-2.5" /> {contact || 'N/A'}
        </p>
    </div>
  );

  if (!mounted) return <div className="p-12 text-center text-muted-foreground animate-pulse">Syncing state-wide collection directory...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Waste Collection Master Registry (State)</CardTitle>
              <CardDescription className="font-medium">Consolidated multi-district chronological audit of logistical collection circuits.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {masterCollectionStructure.map((district) => (
          <AccordionItem value={district.name} key={district.name} className="border-none">
            <Card className="overflow-hidden border-2 shadow-sm">
              <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all">
                <div className="flex justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <LayoutGrid className="h-6 w-6 text-primary" />
                    <span className="font-black text-xl uppercase tracking-tighter text-foreground">{district.name} District</span>
                  </div>
                  <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                    {district.totalCircuits} CIRCUITS LOGGED
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 bg-background">
                <ScrollArea className="w-full">
                  <div className="min-w-[1800px]">
                    <Table className="border">
                      <TableHeader className="bg-muted/80">
                        <TableRow>
                          <TableHead className="w-[50px] border uppercase font-black text-[9px]">S.No.</TableHead>
                          <TableHead className="w-[180px] border uppercase font-black text-[9px]">ULB</TableHead>
                          <TableHead className="w-[150px] border uppercase font-black text-[9px]">MRF Node</TableHead>
                          <TableHead className="w-[300px] border uppercase font-black text-[9px] text-center">Vehicle (Type, No, Cap.)</TableHead>
                          <TableHead className="w-[180px] border uppercase font-black text-[9px] text-center">Driver Details</TableHead>
                          <TableHead className="w-[150px] border uppercase font-black text-[9px]">Schedule</TableHead>
                          <TableHead className="w-[100px] border uppercase font-black text-[9px] text-right">Load (Kg)</TableHead>
                          <TableHead className="w-[300px] border uppercase font-black text-[9px]">PEO Details (GP)</TableHead>
                          <TableHead className="w-[200px] border uppercase font-black text-[9px]">ULB Operator</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {district.rows.map((item, rIdx) => (
                          <TableRow key={rIdx} className="hover:bg-primary/[0.01] border-b last:border-0 h-auto min-h-20">
                            <TableCell className="border text-center font-mono text-xs">{rIdx + 1}</TableCell>
                            <TableCell className="border font-bold text-[10px] uppercase text-primary leading-tight">{item.ulb}</TableCell>
                            <TableCell className="border font-black text-[9px] uppercase">{item.mrf}</TableCell>
                            <TableCell className="border text-[10px] text-center">{item.vehicleInfo}</TableCell>
                            <TableCell className="border text-center">
                               <div className="space-y-0.5">
                                  <p className="font-black text-[10px] uppercase">{item.driverName}</p>
                                  <p className="font-mono text-[9px] text-primary">{item.driverContact}</p>
                              </div>
                            </TableCell>
                            <TableCell className="border text-[10px] font-black text-blue-700 uppercase">{item.collectionSchedule}</TableCell>
                            <TableCell className="border text-right font-mono font-black text-primary text-xs">{(item.loadKg || 0).toLocaleString()}</TableCell>
                            <TableCell className="border bg-blue-50/10 p-2">
                                {renderContactCell(item.gpNodalPerson, item.gpNodalContact, "PEO")}
                            </TableCell>
                            <TableCell className="border bg-orange-50/5 p-2">
                                {renderContactCell(item.ulbNodalPerson, item.ulbNodalContact, "Operator")}
                            </TableCell>
                          </TableRow>
                        ))}
                        {district.rows.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center italic text-muted-foreground opacity-30 uppercase font-black tracking-widest text-sm">
                                No collection circuits currently resolved for this district.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-8 p-6 bg-muted/20 border-t-4 border-primary/30 rounded-xl shadow-inner flex items-start gap-4">
        <Info className="h-6 w-6 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-tight">State Monitoring Protocol</p>
          <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
            Every collection circuit listed is synchronized with district reporting nodes. Blank entries represent districts currently finalizing their logistical rosters. Tonnage metrics are updated in real-time as local MRFs synchronize their verified intake receipts.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StateWasteCollectionDetailsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading state-wide registry...</div>}>
            <AdminWasteCollectionDetailsContent />
        </Suspense>
    );
}
