'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Database, 
  Info, 
  PlusCircle, 
  Calculator, 
  Trash2, 
  Edit, 
  Anchor, 
  BarChart3, 
  MapPin,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

function ULBWasteReconciliationContent() {
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || 'Facility Node';
  const districtParam = searchParams.get('district') || '';
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Data Logic: Segregated by Year and Month starting April 2026
  // This structure maps to the high-fidelity reconciliation requirements
  const historicalReconciliation = useMemo(() => {
    return [
      {
        year: "2026",
        months: {
          "April 2026": [
            { 
              date: '2026-04-12', 
              routeId: 'JJAJPCMBN', 
              mrf: ulbParam, 
              gpBreakdown: [
                { name: 'Panasa', amount: 45.0 },
                { name: 'Chainpur', amount: 32.0 },
                { name: 'Malandapur', amount: 83.5 }
              ],
              totalGpLoad: 160.5, 
              driverSubmitted: 155.0, 
              plastic: 52, paper: 42, metal: 16, cloth: 15, glass: 22, sanitation: 12, others: 16 
            },
            { 
              date: '2026-04-26', 
              routeId: 'JJAJPCMBN', 
              mrf: ulbParam, 
              gpBreakdown: [
                { name: 'Panasa', amount: 40.0 },
                { name: 'Chainpur', amount: 30.0 },
                { name: 'Malandapur', amount: 85.0 }
              ],
              totalGpLoad: 155.0, 
              driverSubmitted: 152.5, 
              plastic: 50, paper: 40, metal: 15, cloth: 14, glass: 20, sanitation: 10, others: 20 
            }
          ],
          "May 2026": [
            { 
              date: '2026-05-10', 
              routeId: 'JJAJPCMBN', 
              mrf: ulbParam, 
              gpBreakdown: [
                { name: 'Panasa', amount: 48.0 },
                { name: 'Chainpur', amount: 35.0 },
                { name: 'Malandapur', amount: 80.0 }
              ],
              totalGpLoad: 163.0, 
              driverSubmitted: 163.0, 
              plastic: 55, paper: 45, metal: 18, cloth: 16, glass: 22, sanitation: 15, others: 12 
            }
          ],
          "December 2026": [
            { 
              date: '2026-12-15', 
              routeId: 'JJAJPCMBN', 
              mrf: ulbParam, 
              gpBreakdown: [
                { name: 'Panasa', amount: 50.0 },
                { name: 'Chainpur', amount: 42.0 },
                { name: 'Malandapur', amount: 90.0 }
              ],
              totalGpLoad: 182.0, 
              driverSubmitted: 175.5, 
              plastic: 60, paper: 50, metal: 20, cloth: 18, glass: 25, sanitation: 15, others: 15 
            }
          ]
        }
      }
    ];
  }, [ulbParam]);

  const calculateYearlyAudit = (months: any) => {
    const allRecords = Object.values(months).flat() as any[];
    return allRecords.reduce((acc, curr) => ({
      count: acc.count + 1,
      total: acc.total + curr.totalGpLoad,
      paper: acc.paper + curr.paper,
      plastic: acc.plastic + curr.plastic,
      metal: acc.metal + curr.metal,
      glass: acc.glass + curr.glass,
      sanitation: acc.sanitation + curr.sanitation,
      others: acc.others + curr.others,
      routeId: curr.routeId,
      mrf: curr.mrf
    }), { count: 0, total: 0, paper: 0, plastic: 0, metal: 0, glass: 0, sanitation: 0, others: 0, routeId: '', mrf: '' });
  };

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing reconciliation hub...</div>;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-primary">
              <Calculator className="h-10 w-10" />
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">ULB Waste Reconciliation Ledger</CardTitle>
                <CardDescription className="font-bold italic">Authoritative audit trail for {ulbParam} node.</CardDescription>
              </div>
            </div>
            <Button className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
            </Button>
          </div>
        </CardHeader>
      </Card>

      {historicalReconciliation.map((yearBlock, yIdx) => (
        <div key={yIdx} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/20"></div>
            <h2 className="text-4xl font-black text-primary opacity-20 tracking-tighter uppercase">{yearBlock.year} FISCAL CYCLE</h2>
            <div className="h-px flex-1 bg-primary/20"></div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {Object.entries(yearBlock.months).map(([month, records], mIdx) => (
              <AccordionItem value={month} key={mIdx} className="border-none">
                <Card className="overflow-hidden border-2 shadow-lg">
                  <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                    <div className="flex justify-between w-full pr-8 items-center">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">Monthly Load</p>
                          <p className="font-black text-primary text-sm">{records.reduce((s: any, r: any) => s + r.totalGpLoad, 0).toLocaleString()} KG</p>
                        </div>
                        <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px]">{records.length} CIRCUITS RECONCILED</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <ScrollArea className="w-full">
                      <div className="min-w-[1600px]">
                        <Table className="border-collapse border text-[10px]">
                          <TableHeader className="bg-muted/80">
                            <TableRow>
                              <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                              <TableHead className="w-[120px] uppercase font-black border">Route ID</TableHead>
                              <TableHead className="w-[200px] uppercase font-black border text-right px-6 bg-blue-50/20">Total Waste from GPs (Click)</TableHead>
                              <TableHead className="w-[150px] text-right uppercase font-black border bg-primary/5 text-primary">Driver Submitted (Kg)</TableHead>
                              <TableHead className="w-[120px] text-right uppercase font-black border bg-destructive/5 text-destructive">Discrepancy</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Plastic</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Paper</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Metal</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Cloth</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Glass</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Sanitation</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Others</TableHead>
                              <TableHead className="w-[100px] uppercase font-black border text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {records.map((row: any, rIdx: number) => {
                              const discrepancy = row.totalGpLoad - row.driverSubmitted;
                              return (
                                <TableRow key={rIdx} className="hover:bg-primary/[0.01] border-b last:border-0 h-16 transition-colors">
                                  <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.date}</TableCell>
                                  <TableCell className="border-r font-black text-primary uppercase">{row.routeId}</TableCell>
                                  <TableCell className="border-r p-0">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="w-full h-16 flex flex-col items-end justify-center px-6 group hover:bg-blue-50 transition-all border-r border-dashed">
                                          <span className="font-mono font-black text-blue-700 text-sm">{row.totalGpLoad.toFixed(1)} KG</span>
                                          <span className="text-[8px] font-black uppercase text-blue-400 group-hover:text-blue-700 flex items-center gap-1">
                                            <TrendingUp className="h-2 w-2" /> View GP Breakdown
                                          </span>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden" align="end">
                                        <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] tracking-widest flex items-center gap-2">
                                          <MapPin className="h-3 w-3" /> Nodal Generation Breakdown
                                        </div>
                                        <Table>
                                          <TableHeader className="bg-muted/50">
                                            <TableRow>
                                              <TableHead className="text-[8px] uppercase font-black">Gram Panchayat</TableHead>
                                              <TableHead className="text-[8px] uppercase font-black text-right">Load (Kg)</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {row.gpBreakdown.map((gp: any, i: number) => (
                                              <TableRow key={i} className="h-10 border-b border-dashed last:border-0 hover:bg-muted/30">
                                                <TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell>
                                                <TableCell className="text-right font-mono font-black text-blue-700">{gp.amount.toFixed(1)}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </PopoverContent>
                                    </Popover>
                                  </TableCell>
                                  <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02] text-sm">{row.driverSubmitted.toFixed(1)} KG</TableCell>
                                  <TableCell className="border-r text-right bg-destructive/[0.02]">
                                    <div className="flex flex-col items-end">
                                      <span className={`font-mono font-black text-sm ${discrepancy > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                        {discrepancy.toFixed(1)} KG
                                      </span>
                                      {Math.abs(discrepancy) > (row.totalGpLoad * 0.05) && (
                                        <span className="text-[7px] font-black uppercase text-destructive animate-pulse">Audit Required</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plastic}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.cloth}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.glass}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.sanitation}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.others}</TableCell>
                                  <TableCell className="border text-center">
                                    <div className="flex justify-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary"><Edit className="h-3 w-3"/></Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3"/></Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
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

          {/* Yearly Audit Report - Automatically triggered after December cycle */}
          {yearBlock.months["December " + yearBlock.year] && (
            <Card className="border-4 border-primary shadow-2xl bg-primary text-primary-foreground overflow-hidden">
              <CardHeader className="bg-white/10 border-b border-white/20 pb-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight">Yearly Reconciliation Audit: {yearBlock.year}</CardTitle>
                    <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest">Aggregate performance metrics for the fiscal reporting cycle.</CardDescription>
                  </div>
                  <BarChart3 className="h-14 w-14 opacity-30" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-primary-foreground">
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/20">
                      <TableHead className="text-white font-black uppercase text-[10px] border-r border-white/10">Route ID</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] border-r border-white/10">Assoc. MRF</TableHead>
                      <TableHead className="text-white text-center font-black uppercase text-[10px] border-r border-white/10">Collection Freq (Year)</TableHead>
                      <TableHead className="text-white text-right font-black uppercase text-[10px] border-r border-white/10">Total Collected (Kg)</TableHead>
                      <TableHead className="text-white text-right font-black uppercase text-[10px] border-r border-white/10">Total Paper</TableHead>
                      <TableHead className="text-white text-right font-black uppercase text-[10px] border-r border-white/10">Total Plastic</TableHead>
                      <TableHead className="text-white text-right font-black uppercase text-[10px] border-r border-white/10">Total Metal</TableHead>
                      <TableHead className="text-white text-right font-black uppercase text-[10px] border-r border-white/10">Total Glass</TableHead>
                      <TableHead className="text-white text-right font-black uppercase text-[10px] border-r border-white/10">Total Sanitation</TableHead>
                      <TableHead className="text-white text-right font-black uppercase text-[10px]">Others</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const audit = calculateYearlyAudit(yearBlock.months);
                      return (
                        <TableRow className="border-none hover:bg-white/5 h-20">
                          <TableCell className="border-r border-white/10 font-black uppercase">{audit.routeId}</TableCell>
                          <TableCell className="border-r border-white/10 font-bold uppercase text-[9px]">{audit.mrf}</TableCell>
                          <TableCell className="border-r border-white/10 text-center font-mono font-black text-2xl">{audit.count}</TableCell>
                          <TableCell className="border-r border-white/10 text-right font-mono font-black text-2xl">{audit.total.toLocaleString()} KG</TableCell>
                          <TableCell className="border-r border-white/10 text-right font-mono font-bold">{audit.paper.toFixed(1)}</TableCell>
                          <TableCell className="border-r border-white/10 text-right font-mono font-bold">{audit.plastic.toFixed(1)}</TableCell>
                          <TableCell className="border-r border-white/10 text-right font-mono font-bold">{audit.metal.toFixed(1)}</TableCell>
                          <TableCell className="border-r border-white/10 text-right font-mono font-bold">{audit.glass.toFixed(1)}</TableCell>
                          <TableCell className="border-r border-white/10 text-right font-mono font-bold">{audit.sanitation.toFixed(1)}</TableCell>
                          <TableCell className="text-right font-mono font-bold">{audit.others.toFixed(1)}</TableCell>
                        </TableRow>
                      );
                    })()}
                  </TableBody>
                </Table>
                <div className="bg-white/5 p-6 border-t border-white/10 flex justify-between items-center">
                  <p className="text-[10px] font-bold italic opacity-70">
                    Verified Digital Audit Hash: {yearBlock.year}-{ulbParam.substring(0,3).toUpperCase()}-SWM-RECON
                  </p>
                  <Badge variant="secondary" className="bg-white text-primary font-black uppercase px-6 py-1 tracking-widest">FISCAL FINALIZED</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}

      <Card className="border-2 border-dashed bg-muted/20">
        <CardContent className="py-6 flex items-start gap-4">
          <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-tight">Audit Protocol Guidelines</p>
            <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
              This ledger serves as the authoritative reconciliation record for {ulbParam}. Discrepancy flags are triggered for variances exceeding 5%. The "Yearly Reconciliation Audit" is automatically generated following the submission of the December reporting cycle, providing a finalized summary for district steering committee reviews. All material stream values are derived from verified driver receipts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ULBWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading verified reconciliation hub...</div>}>
      <ULBWasteReconciliationContent />
    </Suspense>
  );
}
