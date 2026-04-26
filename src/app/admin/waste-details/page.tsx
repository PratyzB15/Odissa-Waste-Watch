'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, Calculator, MapPin, BarChart3, Info, Building, Warehouse, Map as DistrictIcon } from "lucide-react";
import { useMemo, Suspense, useState, useEffect } from "react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

// District Data Imports for State-wide Baseline calculation
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

function StateWasteReconciliationContent() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const wasteDetailsQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), orderBy('date', 'asc')) : null, [db]);
  const { data: allRecords = [] } = useCollection(wasteDetailsQuery);

  useEffect(() => { setMounted(true); }, []);

  const stateBaselineAvg = useMemo(() => {
    const districtSources = [ angulDistrictData, balangirDistrictData, bhadrakDistrictData, bargarhDistrictData, sonepurDistrictData, boudhDistrictData, cuttackDistrictData, deogarhDistrictData, dhenkanalDistrictData, gajapatiDistrictData, ganjamDistrictData, jagatsinghpurDistrictData, jajpurDistrictData, jharsugudaDistrictData, kalahandiDistrictData, kandhamalDistrictData, kendraparaDistrictData, kendujharDistrictData, balasoreDistrictData, baleswarDistrictData, khordhaDistrictData, koraputDistrictData, mayurbhanjDistrictData, malkangiriDistrictData, rayagadaDistrictData, nabarangpurDistrictData, nayagarhDistrictData, nuapadaDistrictData, puriDistrictData, sambalpurDistrictData ];
    return districtSources.reduce((total, source) => total + source.data.wasteGeneration.reduce((sum: number, w: any) => sum + (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000) || 0), 0), 0);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b"><div className="flex items-center gap-3 text-primary"><Calculator className="h-10 w-10" /><div><CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">State Waste Reconciliation Hub</CardTitle><CardDescription className="font-bold italic text-muted-foreground">Authoritative State-wide audit tracking.</CardDescription></div></div></CardHeader>
      </Card>

      {FISCAL_YEARS.map((year) => (
        <div key={year} className="space-y-8">
            <div className="flex items-center gap-4"><h2 className="text-3xl font-black text-primary opacity-20 tracking-tighter uppercase">{year} FISCAL CYCLE</h2><div className="h-px flex-1 bg-primary/20"></div></div>
            <Accordion type="single" collapsible className="w-full space-y-6">
                {MONTHS.map((month, mIdx) => {
                    const monthItems = allRecords.filter(r => {
                        if (!r.date) return false;
                        const d = new Date(r.date);
                        return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }) === month;
                    });
                    if (year === '2026' && mIdx < 3) return null;
                    const reconciledRecords = monthItems.filter(r => r.submittedByRole === 'driver').map(driverRec => {
                        const matchingGPs = monthItems.filter(r => r.submittedByRole === 'gp' && r.date === driverRec.date && r.routeId === driverRec.routeId);
                        return { ...driverRec, reconciledGpTotal: matchingGPs.reduce((sum, r) => sum + (r.driverSubmitted || 0), 0), gpBreakdownDetailed: matchingGPs.map(m => ({ name: m.gpName, amount: m.driverSubmitted })) };
                    });
                    const monthVerified = reconciledRecords.reduce((sum, r) => sum + (r.driverSubmitted || 0), 0);
                    const discrepancy = stateBaselineAvg - monthVerified;
                    const efficiency = stateBaselineAvg > 0 ? (monthVerified / stateBaselineAvg) * 100 : 0;
                    
                    const districtGroups = Array.from(new Set(reconciledRecords.map(r => r.district))).sort();

                    return (
                        <AccordionItem value={`${year}-${month}`} key={`${year}-${month}`} className="border-none">
                            <Card className="overflow-hidden border-2 shadow-xl">
                                <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed"><div className="flex justify-between w-full pr-8 items-center"><div className="flex items-center gap-4"><Calendar className="h-6 w-6 text-primary" /><span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span></div><Badge variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[8px] bg-primary/5 px-3">{reconciledRecords.length} TOTAL RECEIPTS SYNCED</Badge></div></AccordionTrigger>
                                <AccordionContent className="p-6 space-y-12 bg-background">
                                    {districtGroups.map(dist => (
                                        <div key={dist} className="space-y-6">
                                            <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2"><DistrictIcon className="h-6 w-6 text-primary" /><h4 className="font-black uppercase text-lg text-primary">District: {dist}</h4></div>
                                            {Array.from(new Set(reconciledRecords.filter(r => r.district === dist).map(r => r.block))).sort().map(block => (
                                                <div key={block} className="space-y-4 pl-6">
                                                    <div className="flex items-center gap-2 border-b pb-1"><Building className="h-4 w-4 text-muted-foreground" /><h5 className="font-bold uppercase text-xs text-muted-foreground">Block: {block}</h5></div>
                                                    {Array.from(new Set(reconciledRecords.filter(r => r.district === dist && r.block === block).map(r => r.mrf))).sort().map(ulb => (
                                                        <div key={ulb} className="space-y-2 pl-6">
                                                            <div className="flex items-center gap-1"><Warehouse className="h-3 w-3 text-muted-foreground/60" /><p className="font-bold uppercase text-[9px] text-muted-foreground/60">ULB: {ulb}</p></div>
                                                            <ScrollArea className="w-full">
                                                                <div className="min-w-[1400px]">
                                                                    <Table className="border text-[10px]">
                                                                        <TableBody>{reconciledRecords.filter(r => r.district === dist && r.block === block && r.mrf === ulb).map((row) => (<TableRow key={row.id} className="hover:bg-primary/[0.01] border-b last:border-0 h-14 transition-colors"><TableCell className="border-r font-mono text-center font-bold w-[120px]">{row.date}</TableCell><TableCell className="border-r font-black text-primary uppercase text-center w-[120px]">{row.routeId}</TableCell><TableCell className="border-r p-0"><Popover><PopoverTrigger asChild><button className="w-full h-14 flex items-center justify-end px-6 font-bold text-blue-700 hover:bg-blue-50 underline decoration-dotted underline-offset-4 uppercase">{row.reconciledGpTotal.toFixed(1)} KG</button></PopoverTrigger><PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden" align="end"><div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] flex items-center gap-2"><MapPin className="h-3 w-3" /> GP Breakdown</div><Table><TableBody>{row.gpBreakdownDetailed?.map((gp: any, i: number) => (<TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount?.toFixed(1)}</TableCell></TableRow>))}</TableBody></Table></PopoverContent></Popover></TableCell><TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02] text-sm">{row.driverSubmitted?.toFixed(1)} KG</TableCell><TableCell className="border-r text-right font-mono font-black text-destructive">{(row.reconciledGpTotal - row.driverSubmitted).toFixed(1)} KG</TableCell><TableCell className="border-r text-right font-mono">{row.plastic}</TableCell><TableCell className="border-r text-right font-mono">{row.paper}</TableCell><TableCell className="border-r text-right font-mono">{row.metal}</TableCell><TableCell className="border-r text-right font-mono">{row.glass}</TableCell></TableRow>))}</TableBody>
                                                                    </Table>
                                                                </div>
                                                                <ScrollBar orientation="horizontal" />
                                                            </ScrollArea>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-muted/5 border-t mt-8">
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm"><p className="text-[10px] font-black uppercase text-muted-foreground mb-1">State Load on Avg (Month)</p><p className="text-2xl font-black">{stateBaselineAvg.toLocaleString()} KG</p></div>
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm"><p className="text-[10px] font-black uppercase text-primary mb-1">Total State Verified</p><p className="text-2xl font-black text-primary">{monthVerified.toLocaleString()} KG</p></div>
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm"><p className="text-[10px] font-black uppercase text-destructive mb-1">State Discrepancy</p><p className="text-2xl font-black text-destructive">{discrepancy.toLocaleString()} KG</p></div>
                                        <div className="bg-primary text-primary-foreground rounded-xl p-5 shadow-lg"><p className="text-[10px] font-black uppercase opacity-60 mb-1">Efficiency Score</p><p className="text-3xl font-black">{efficiency.toFixed(1)}%</p></div>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
      ))}
    </div>
  );
}

export default function StateWasteDetailsPage() {
  return (<Suspense fallback={<div>Loading...</div>}><StateWasteReconciliationContent /></Suspense>);
}
