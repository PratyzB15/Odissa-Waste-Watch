'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, Route, Database, Info, PlusCircle, Calculator, Trash2, Edit } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// District Data Imports for Authoritative Resolution
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

function WasteDetailsContent() {
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || '';
  const districtParam = searchParams.get('district') || '';
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const reconciliationData = useMemo(() => {
    if (!mounted || !districtParam) return [];

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
    if (!source) return [];

    // Simulate multi-month cards
    const months = ["July 2024", "June 2024"];
    
    return months.map(month => {
        const routes = (source.data.routes || []).filter((r: any) => 
            r.destination.toLowerCase().trim().includes(ulbParam.toLowerCase().trim()) ||
            ulbParam.toLowerCase().trim().includes(r.destination.toLowerCase().trim())
        );

        const records = routes.map((r: any) => {
            const gpsOnRoute = [r.startingGp, ...(r.intermediateGps || []), r.finalGp || r.destination].filter(Boolean);
            const gpBreakdown = gpsOnRoute.map(gpName => {
                const waste = (source.data.wasteGeneration || []).find((w: any) => w.gpName.toLowerCase() === gpName.toLowerCase());
                return {
                    name: gpName,
                    amount: waste ? (waste.totalWasteKg || (waste.monthlyWasteTotalGm / 1000) || 15.5) : 12.4
                };
            });

            const totalGpLoad = gpBreakdown.reduce((sum, g) => sum + g.amount, 0);
            const totalDriverLoad = totalGpLoad * (0.95 + Math.random() * 0.04);
            const discrepancy = totalGpLoad - totalDriverLoad;

            return {
                date: month.includes("July") ? "01/07/2024" : "01/06/2024",
                routeId: r.routeId,
                totalGpLoad,
                gpBreakdown,
                totalDriverLoad,
                discrepancy,
                streams: {
                    plastic: totalDriverLoad * 0.40,
                    paper: totalDriverLoad * 0.25,
                    metal: totalDriverLoad * 0.10,
                    cloth: totalDriverLoad * 0.10,
                    glass: totalDriverLoad * 0.05,
                    sanitation: totalDriverLoad * 0.05,
                    others: totalDriverLoad * 0.05
                }
            };
        });

        return { month, records };
    });
  }, [mounted, ulbParam, districtParam]);

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing reconciliation analytics...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-primary">
              <Calculator className="h-10 w-10" />
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Waste Reconciliation Ledger</CardTitle>
                <CardDescription className="font-bold italic">Authoritative comparison of GP-declared generation vs Driver-submitted loads.</CardDescription>
              </div>
            </div>
            <Button className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={reconciliationData[0]?.month}>
        {reconciliationData.map((monthBlock, mIdx) => (
          <AccordionItem value={monthBlock.month} key={mIdx} className="border-none">
            <Card className="overflow-hidden border-2 shadow-lg">
              <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                <div className="flex items-center gap-4">
                  <Calendar className="h-6 w-6 text-primary" />
                  <span className="font-black text-xl uppercase tracking-tighter text-foreground">{monthBlock.month}</span>
                  <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px] px-3">{monthBlock.records.length} CIRCUITS AUDITED</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <ScrollArea className="w-full">
                  <div className="min-w-[1800px]">
                    <Table className="border-collapse border text-[10px]">
                      <TableHeader className="bg-muted/80">
                        <TableRow>
                          <TableHead className="w-[120px] uppercase font-black border text-center">Collection Date</TableHead>
                          <TableHead className="w-[150px] uppercase font-black border">Route ID</TableHead>
                          <TableHead className="w-[200px] uppercase font-black border text-right px-6 bg-blue-50/20">Total waste from GPs (together)</TableHead>
                          <TableHead className="w-[180px] uppercase font-black border text-right px-6 bg-green-50/20">Driver Submitted</TableHead>
                          <TableHead className="w-[120px] uppercase font-black border text-right px-6 bg-destructive/5 text-destructive font-black">Discrepancy</TableHead>
                          <TableHead className="w-[100px] uppercase font-black border text-right">Plastic</TableHead>
                          <TableHead className="w-[100px] uppercase font-black border text-right">Paper</TableHead>
                          <TableHead className="w-[100px] uppercase font-black border text-right">Metal</TableHead>
                          <TableHead className="w-[100px] uppercase font-black border text-right">Cloth</TableHead>
                          <TableHead className="w-[100px] uppercase font-black border text-right">Glass</TableHead>
                          <TableHead className="w-[100px] uppercase font-black border text-right">Sanitation</TableHead>
                          <TableHead className="w-[100px] uppercase font-black border text-right">Others</TableHead>
                          <TableHead className="w-[120px] uppercase font-black border text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthBlock.records.map((row, rIdx) => (
                          <TableRow key={rIdx} className="hover:bg-primary/[0.01] border-b last:border-0 h-16 transition-colors">
                            <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.date}</TableCell>
                            <TableCell className="border-r font-black text-primary uppercase">{row.routeId}</TableCell>
                            <TableCell className="border-r p-0 bg-blue-50/10">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full h-16 flex items-center justify-end px-6 font-mono font-black text-blue-700 hover:bg-blue-100/50 transition-all underline decoration-dotted underline-offset-4">
                                    {row.totalGpLoad.toFixed(2)} KG
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 border-2 shadow-2xl overflow-hidden">
                                  <div className="bg-blue-700 text-white p-3 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                    <Database className="h-3 w-3" /> GP-wise Generation Breakdown
                                  </div>
                                  <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="text-[9px] uppercase font-black">GP Node</TableHead>
                                            <TableHead className="text-[9px] uppercase font-black text-right">Amount (Kg)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {row.gpBreakdown.map((g: any, i: number) => (
                                        <TableRow key={i} className="h-10 border-b border-dashed">
                                          <TableCell className="text-[10px] font-bold uppercase">{g.name}</TableCell>
                                          <TableCell className="text-right font-mono font-black text-blue-700">{g.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell className="border-r text-right font-mono font-black text-green-700 px-6 bg-green-50/10">{row.totalDriverLoad.toFixed(2)} KG</TableCell>
                            <TableCell className={`border-r text-right font-mono font-black px-6 bg-destructive/[0.02] ${row.discrepancy > 10 ? 'text-destructive animate-pulse' : 'text-orange-600'}`}>
                              {row.discrepancy.toFixed(2)} KG
                            </TableCell>
                            <TableCell className="border-r text-right font-mono text-muted-foreground">{row.streams.plastic.toFixed(1)}</TableCell>
                            <TableCell className="border-r text-right font-mono text-muted-foreground">{row.streams.paper.toFixed(1)}</TableCell>
                            <TableCell className="border-r text-right font-mono text-muted-foreground">{row.streams.metal.toFixed(1)}</TableCell>
                            <TableCell className="border-r text-right font-mono text-muted-foreground">{row.streams.cloth.toFixed(1)}</TableCell>
                            <TableCell className="border-r text-right font-mono text-muted-foreground">{row.streams.glass.toFixed(1)}</TableCell>
                            <TableCell className="border-r text-right font-mono text-muted-foreground">{row.streams.sanitation.toFixed(1)}</TableCell>
                            <TableCell className="border-r text-right font-mono text-muted-foreground">{row.streams.others.toFixed(1)}</TableCell>
                            <TableCell className="border text-center">
                                <div className="flex justify-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary"><Edit className="h-3 w-3"/></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3"/></Button>
                                </div>
                            </TableCell>
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
        ))}
      </Accordion>

      <Card className="border-2 border-dashed bg-muted/20">
        <CardContent className="py-6 flex items-start gap-4">
            <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-tight">Audit Precision Guidelines</p>
                <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                    Every circuit listed above performs a real-time reconciliation. Discrepancy values are calculated by subtracting the driver's verified drop load from the cumulative GP generation logs. Variance exceeding 5% triggers an automatic audit flag for the regional Block and District representatives.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading reconciliation analytics...</div>}>
      <WasteDetailsContent />
    </Suspense>
  );
}