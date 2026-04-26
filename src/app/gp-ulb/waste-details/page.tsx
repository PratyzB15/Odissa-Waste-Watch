
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Calculator, 
  MapPin,
  BarChart3,
  Info,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// District Data Imports for Baseline Calculation
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const FISCAL_YEARS = ["2026", "2027"];

function GpUlbWasteDetailsContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const gpParam = searchParams.get('gp') || '';
  const ulbParam = searchParams.get('ulb') || '';
  const districtParam = searchParams.get('district') || '';
  
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  const wasteDetailsQuery = useMemo(() => {
    if (!db || !ulbParam) return null;
    return query(collection(db, 'wasteDetails'), where('mrf', '==', ulbParam), orderBy('date', 'asc'));
  }, [db, ulbParam]);
  
  const { data: allRecords = [] } = useCollection(wasteDetailsQuery);

  useEffect(() => { setMounted(true); }, []);

  const baselineAvg = useMemo(() => {
    if (!districtParam || !ulbParam) return 0;
    const districtsMap: Record<string, any> = {
        'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
        'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
        'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
        'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
        'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
        'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
        'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
        'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData,
        'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
        'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
    };
    const source = districtsMap[districtParam.toLowerCase()];
    if (!source) return 0;

    const mappedGps = source.data.gpMappings.filter((m: any) => 
        m.taggedUlb.toLowerCase().trim().includes(ulbParam.toLowerCase().trim()) ||
        ulbParam.toLowerCase().trim().includes(m.taggedUlb.toLowerCase().trim())
    );
    return mappedGps.reduce((sum: number, gp: any) => {
        const w = source.data.wasteGeneration.find((wg: any) => wg.gpName.toLowerCase() === gp.gpName.toLowerCase());
        const kg = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000)) : 0;
        return sum + kg;
    }, 0);
  }, [districtParam, ulbParam]);

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3 text-primary">
            <Calculator className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Nodal Waste Reconciliation Hub</CardTitle>
              <CardDescription className="font-bold italic text-muted-foreground">Authoritative audit ledger for {ulbParam || gpParam}.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {FISCAL_YEARS.map((year) => (
        <div key={year} className="space-y-8">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-primary opacity-20 tracking-tighter uppercase">{year} FISCAL CYCLE</h2>
                <div className="h-px flex-1 bg-primary/20"></div>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-8">
                {MONTHS.map((month, mIdx) => {
                    const monthItems = allRecords.filter(r => {
                        if (!r.date) return false;
                        const d = new Date(r.date);
                        return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }) === month;
                    });

                    if (year === '2026' && mIdx < 3) return null;

                    const reconciledRecords = monthItems.filter(r => r.submittedByRole === 'driver').map(driverRec => {
                        const matchingGPs = monthItems.filter(r => r.submittedByRole === 'gp' && r.date === driverRec.date && r.routeId === driverRec.routeId);
                        const totalFromGPs = matchingGPs.reduce((sum, r) => sum + (r.driverSubmitted || 0), 0);
                        return {
                            ...driverRec,
                            reconciledGpTotal: totalFromGPs,
                            gpBreakdownDetailed: matchingGPs.map(m => ({ name: m.gpName, amount: m.driverSubmitted }))
                        };
                    });

                    const monthVerified = reconciledRecords.reduce((sum, r) => sum + (r.driverSubmitted || 0), 0);
                    const discrepancy = baselineAvg - monthVerified;
                    const efficiency = baselineAvg > 0 ? (monthVerified / baselineAvg) * 100 : 0;
                    
                    const monthlyStreamTotals = reconciledRecords.reduce((acc, curr) => ({
                        plastic: acc.plastic + (curr.plastic || 0),
                        paper: acc.paper + (curr.paper || 0),
                        metal: acc.metal + (curr.metal || 0),
                        cloth: acc.cloth + (curr.cloth || 0),
                        glass: acc.glass + (curr.glass || 0),
                        sanitation: acc.sanitation + (curr.sanitation || 0),
                        others: acc.others + (curr.others || 0)
                    }), { plastic: 0, paper: 0, metal: 0, cloth: 0, glass: 0, sanitation: 0, others: 0 });

                    return (
                        <AccordionItem value={`${year}-${month}`} key={`${year}-${month}`} className="border-none">
                            <Card className="overflow-hidden border-2 shadow-xl">
                                <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                                    <div className="flex justify-between w-full pr-8 items-center">
                                        <div className="flex items-center gap-4">
                                            <Calendar className="h-6 w-6 text-primary" />
                                            <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                                        </div>
                                        <Badge variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[8px] bg-primary/5 px-4 py-1">
                                            {reconciledRecords.length} RECEIPTS VERIFIED
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0 bg-background">
                                    <ScrollArea className="w-full">
                                        <div className="min-w-[1600px]">
                                            <Table className="border-collapse border text-[10px]">
                                                <TableHeader className="bg-muted/80">
                                                    <TableRow>
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
                                                        <TableHead className="w-[180px] uppercase font-black border">Facility (MRF)</TableHead>
                                                        <TableHead className="w-[200px] uppercase font-black border text-right px-6 bg-blue-50/20">Total Waste from GPs (Click)</TableHead>
                                                        <TableHead className="w-[150px] text-right uppercase font-black border bg-primary/5 text-primary">Driver Submitted (Kg)</TableHead>
                                                        <TableHead className="w-[120px] text-right uppercase font-black border bg-destructive/5 text-destructive">Discrepancy</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Plastic</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Paper</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Metal</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Cloth</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Glass</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Sanitation</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {reconciledRecords.map((row) => (
                                                        <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b last:border-0 h-16 transition-colors">
                                                            <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                                                            <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
                                                            <TableCell className="border-r font-bold uppercase">{row.mrf}</TableCell>
                                                            <TableCell className="border-r p-0">
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button className="w-full h-16 flex items-center justify-end px-6 font-bold text-blue-700 hover:bg-blue-50 underline decoration-dotted underline-offset-4 uppercase">
                                                                            {row.reconciledGpTotal.toFixed(1)} KG
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden" align="end">
                                                                        <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] flex items-center gap-2">
                                                                            <MapPin className="h-3 w-3" /> GP Contribution Breakdown
                                                                        </div>
                                                                        <Table>
                                                                            <TableBody>
                                                                                {row.gpBreakdownDetailed?.map((gp: any, i: number) => (
                                                                                    <TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount?.toFixed(1)}</TableCell></TableRow>                                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </TableCell>
                                                            <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02] text-sm">{row.driverSubmitted?.toFixed(1)} KG</TableCell>
                                                            <TableCell className="border-r text-right font-mono font-black text-destructive">{(row.reconciledGpTotal - row.driverSubmitted).toFixed(1)} KG</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.plastic}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.paper}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.metal}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.cloth}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.glass}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.sanitation}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                                <TableFooter className="bg-muted/30 font-black uppercase text-[9px]">
                                                    <TableRow className="h-14">
                                                        <TableCell colSpan={6} className="text-right border-r">Monthly Stream Totals:</TableCell>
                                                        <TableCell className="text-right border-r">{monthlyStreamTotals.plastic.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{monthlyStreamTotals.paper.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{monthlyStreamTotals.metal.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{monthlyStreamTotals.cloth.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{monthlyStreamTotals.glass.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{monthlyStreamTotals.sanitation.toFixed(1)}</TableCell>
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-muted/5 border-t">
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">ULB Load on Avg (Month)</p>
                                            <p className="text-2xl font-black">{baselineAvg.toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-primary mb-1">Total ULB Verified</p>
                                            <p className="text-2xl font-black text-primary">{monthVerified.toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-destructive mb-1">ULB Discrepancy</p>
                                            <p className="text-2xl font-black text-destructive">{discrepancy.toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-primary text-primary-foreground rounded-xl p-5 shadow-lg">
                                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Efficiency Score</p>
                                            <p className="text-3xl font-black">{efficiency.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-dashed border-primary/20 pb-8 text-center">
                    <CardTitle className="text-4xl font-black font-headline uppercase tracking-tight text-primary/40 flex items-center justify-center gap-4">
                        <BarChart3 className="h-12 w-12" /> Yearly Professional Audit: {year}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="w-full">
                        <div className="min-w-[1600px]">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[150px] uppercase font-black border text-center">Route ID</TableHead>
                                        <TableHead className="w-[200px] uppercase font-black border">Associated MRF</TableHead>
                                        <TableHead className="w-[150px] uppercase font-black border text-center">Coll. Freq (Year)</TableHead>
                                        <TableHead className="w-[180px] text-right uppercase font-black border bg-primary/5">Total Collected (Kg)</TableHead>
                                        <TableHead className="w-[120px] text-right uppercase font-black border">Total Paper</TableHead>
                                        <TableHead className="w-[120px] text-right uppercase font-black border">Total Plastic</TableHead>
                                        <TableHead className="w-[120px] text-right uppercase font-black border">Total Metal</TableHead>
                                        <TableHead className="w-[120px] text-right uppercase font-black border">Total Glass</TableHead>
                                        <TableHead className="w-[120px] text-right uppercase font-black border">Total Sanitation</TableHead>
                                        <TableHead className="w-[120px] text-right uppercase font-black border">Others</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(() => {
                                      const yearly = allRecords.filter(r => new Date(r.date).getFullYear().toString() === year && r.submittedByRole === 'driver');
                                      if (yearly.length === 0) {
                                        return <TableRow><TableCell colSpan={10} className="h-48 text-center italic font-black uppercase tracking-[0.3em] opacity-10 text-2xl">Awaiting Annual Audit Cycle</TableCell></TableRow>;
                                      }

                                      const routesMap = new Map();
                                      yearly.forEach(r => {
                                          const id = r.routeId || 'TBD';
                                          const prev = routesMap.get(id) || { count: 0, received: 0, paper: 0, plastic: 0, metal: 0, glass: 0, sani: 0, other: 0, mrf: r.mrf };
                                          routesMap.set(id, {
                                              ...prev,
                                              count: prev.count + 1,
                                              received: prev.received + (r.driverSubmitted || 0),
                                              paper: prev.paper + (r.paper || 0),
                                              plastic: prev.plastic + (r.plastic || 0),
                                              metal: prev.metal + (r.metal || 0),
                                              glass: prev.glass + (r.glass || 0),
                                              sani: prev.sani + (r.sanitation || 0),
                                              other: prev.other + (r.others || 0)
                                          });
                                      });

                                      return Array.from(routesMap.entries()).map(([id, stats]) => (
                                        <TableRow key={id} className="bg-primary/5 font-black text-primary h-16 hover:bg-primary/10 transition-colors">
                                            <TableCell className="border text-center font-mono">{id}</TableCell>
                                            <TableCell className="border uppercase">{stats.mrf}</TableCell>
                                            <TableCell className="border text-center">{stats.count} Circuits</TableCell>
                                            <TableCell className="border text-right text-lg">{stats.received.toFixed(1)} KG</TableCell>
                                            <TableCell className="border text-right">{stats.paper.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.plastic.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.metal.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.glass.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.sani.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.other.toFixed(1)}</TableCell>
                                        </TableRow>
                                      ));
                                    })()}
                                </TableBody>
                            </Table>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      ))}
    </div>
  );
}

export default function GpUlbWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Syncing nodal reconciliation ledger...</div>}>
      <GpUlbWasteDetailsContent />
    </Suspense>
  );
}
