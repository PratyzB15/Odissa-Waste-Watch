
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User, Calendar, Database, FileText, Truck, Anchor, LayoutGrid, ClipboardList } from 'lucide-react';
import React, { useMemo, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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

function GpUlbWasteReceiptDetailsContent() {
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || '';
  const districtParam = searchParams.get('district') || '';
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const data = useMemo(() => {
    if (!mounted || !districtParam) return { driverReceipts: [], gpReceipts: [] };
    
    const sourceMap: Record<string, any> = {
      'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
      'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
      'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
      'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
      'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
      'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
      'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
      'koraput': koraputDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData,
      'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
      'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
    };

    const source = sourceMap[districtParam.toLowerCase()];
    if (!source) return { driverReceipts: [], gpReceipts: [] };

    const filteredSchedules = (source.data.collectionSchedules || []).filter((s: any) => 
      s.ulb.toLowerCase().trim().includes(ulbParam.toLowerCase().trim()) || 
      ulbParam.toLowerCase().trim().includes(s.ulb.toLowerCase().trim())
    );

    const drRecs = filteredSchedules.map((s: any) => ({
      date: "01/07/2024",
      routeId: s.routeId || "CIRCUIT",
      vehicleNo: s.vehicleNo || "-",
      totalWeight: s.wasteGeneratedKg || 0,
      plastic: (s.wasteGeneratedKg || 0) * 0.40,
      paper: (s.wasteGeneratedKg || 0) * 0.25,
      metal: (s.wasteGeneratedKg || 0) * 0.10,
      cloth: (s.wasteGeneratedKg || 0) * 0.10,
      glass: (s.wasteGeneratedKg || 0) * 0.05,
      sanitation: (s.wasteGeneratedKg || 0) * 0.05,
      others: (s.wasteGeneratedKg || 0) * 0.05,
    }));

    const gpRecs = filteredSchedules.map((s: any) => ({
      date: "01/07/2024",
      gpName: s.gpName.split('(')[0].trim(),
      block: s.block,
      generatedWeight: s.wasteGeneratedKg || 0
    }));

    return { driverReceipts: drRecs, gpReceipts: gpRecs };
  }, [mounted, ulbParam, districtParam]);

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing verification ledgers...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Waste Receipt Verification Hub</CardTitle>
              <CardDescription className="font-bold">Authoritative digital paper trail for {ulbParam} facility node.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="drivers">
        <AccordionItem value="drivers" className="border-none">
          <Card className="border-2 shadow-lg overflow-hidden">
            <AccordionTrigger className="p-6 hover:no-underline bg-muted/30 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
              <div className="flex items-center gap-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-tighter text-foreground">Receipts from Drivers</span>
                <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                  {data.driverReceipts.length} SYNCED
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1400px]">
                  <Table className="border-collapse border text-[10px]">
                    <TableHeader className="bg-muted/80">
                      <TableRow>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border">Route ID</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Vehicle No.</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-right">Total (Kg)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Plastic</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Paper</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Metal</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Cloth</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Glass</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Sanitation</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Others</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.driverReceipts.map((row, i) => (
                        <TableRow key={i} className="hover:bg-primary/[0.01] border-b h-12">
                          <TableCell className="border-r font-mono text-center">{row.date}</TableCell>
                          <TableCell className="border-r font-black text-primary uppercase">{row.routeId}</TableCell>
                          <TableCell className="border-r text-center font-bold">{row.vehicleNo}</TableCell>
                          <TableCell className="border-r text-right font-mono font-black text-primary text-sm bg-primary/[0.02]">{row.totalWeight.toLocaleString()}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plastic.toFixed(1)}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper.toFixed(1)}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal.toFixed(1)}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.cloth.toFixed(1)}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.glass.toFixed(1)}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.sanitation.toFixed(1)}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.others.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="gps" className="border-none">
          <Card className="border-2 shadow-lg overflow-hidden">
            <AccordionTrigger className="p-6 hover:no-underline bg-muted/30 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
              <div className="flex items-center gap-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-tighter text-foreground">Receipts from GP Portal</span>
                <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                  {data.gpReceipts.length} SYNCED
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ScrollArea className="w-full">
                <Table className="border-collapse border text-[10px]">
                  <TableHeader className="bg-muted/80">
                    <TableRow>
                      <TableHead className="w-[150px] uppercase font-black border text-center">Collection Date</TableHead>
                      <TableHead className="w-[200px] uppercase font-black border">GP Node</TableHead>
                      <TableHead className="w-[180px] uppercase font-black border text-center">Block</TableHead>
                      <TableHead className="w-[150px] uppercase font-black border text-right pr-8">Generated Weight (Kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.gpReceipts.map((row, i) => (
                      <TableRow key={i} className="hover:bg-primary/[0.01] border-b h-12">
                        <TableCell className="border-r font-mono text-center">{row.date}</TableCell>
                        <TableCell className="border-r font-black text-primary uppercase">{row.gpName}</TableCell>
                        <TableCell className="border-r text-center font-bold uppercase">{row.block}</TableCell>
                        <TableCell className="border-r text-right font-mono font-black text-primary text-sm bg-primary/[0.02] pr-8">{row.generatedWeight.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function GpUlbWasteReceiptDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading verification ledger...</div>}>
      <GpUlbWasteReceiptDetailsContent />
    </Suspense>
  );
}
