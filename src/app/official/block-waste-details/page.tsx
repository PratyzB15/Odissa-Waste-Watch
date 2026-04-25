'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Calculator, 
  PlusCircle, 
  Trash2, 
  Edit, 
  MapPin,
  TrendingUp,
  BarChart3,
  Building,
  Warehouse,
  Info
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// District Data Imports for Baseline Resolution
import { angulDistrictData } from "@/lib/disAngul";
import { balangirDistrictData } from "@/lib/disBalangir";
import { bhadrakDistrictData } from "@/lib/disBhadrak";
import { bargarhDistrictData } from "@/lib/disBargarh";
import { sonepurDistrictData } from "@/lib/disSonepur";
import { mrfData } from "@/lib/mrf-data";

function BlockWasteReconciliationContent() {
  const searchParams = useSearchParams();
  const blockName = searchParams.get('block') || '';
  const districtName = searchParams.get('district') || '';
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Filter MRFs belonging to this block
  const blockUlbs = useMemo(() => {
    return mrfData.filter(m => m.blockCovered.toLowerCase() === blockName.toLowerCase());
  }, [blockName]);

  // Mock Reconciliation Data: Segregated by ULB then Year/Month starting April 2026
  const reconciliationData = useMemo(() => {
    const data: Record<string, any[]> = {};

    blockUlbs.forEach(ulb => {
      data[ulb.mrfId] = [
        {
          year: "2026",
          months: {
            "April 2026": [
              { 
                date: '2026-04-12', 
                routeId: 'R-BAL-01', 
                mrf: ulb.mrfId, 
                gpBreakdown: [
                  { name: 'Node A', amount: 45.0 },
                  { name: 'Node B', amount: 32.0 },
                  { name: 'Node C', amount: 83.5 }
                ],
                totalGpLoad: 160.5, 
                driverSubmitted: 155.0, 
                plastic: 52, paper: 42, metal: 16, cloth: 15, glass: 22, sanitation: 12, others: 16 
              },
              { 
                date: '2026-04-26', 
                routeId: 'R-BAL-01', 
                mrf: ulb.mrfId, 
                gpBreakdown: [
                  { name: 'Node A', amount: 40.0 },
                  { name: 'Node B', amount: 30.0 },
                  { name: 'Node C', amount: 85.0 }
                ],
                totalGpLoad: 155.0, 
                driverSubmitted: 152.5, 
                plastic: 50, paper: 40, metal: 15, cloth: 14, glass: 20, sanitation: 10, others: 20 
              }
            ],
            "May 2026": [
              { 
                date: '2026-05-10', 
                routeId: 'R-BAL-02', 
                mrf: ulb.mrfId, 
                gpBreakdown: [
                  { name: 'Node D', amount: 48.0 },
                  { name: 'Node E', amount: 35.0 }
                ],
                totalGpLoad: 83.0, 
                driverSubmitted: 83.0, 
                plastic: 25, paper: 20, metal: 10, cloth: 8, glass: 10, sanitation: 5, others: 5 
              }
            ],
            "December 2026": [
              { 
                date: '2026-12-15', 
                routeId: 'R-BAL-01', 
                mrf: ulb.mrfId, 
                gpBreakdown: [
                  { name: 'Node A', amount: 50.0 },
                  { name: 'Node B', amount: 42.0 },
                  { name: 'Node C', amount: 90.0 }
                ],
                totalGpLoad: 182.0, 
                driverSubmitted: 175.5, 
                plastic: 60, paper: 50, metal: 20, cloth: 18, glass: 25, sanitation: 15, others: 15 
              }
            ]
          }
        }
      ];
    });

    return data;
  }, [blockUlbs]);

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
      others: acc.others + curr.others
    }), { count: 0, total: 0, paper: 0, plastic: 0, metal: 0, glass: 0, sanitation: 0, others: 0 });
  };

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing block reconciliation metrics...</div>;

  return (
    <div className="space-y-8">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-primary">
              <Calculator className="h-10 w-10" />
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Block Waste Reconciliation Ledger</CardTitle>
                <CardDescription className="font-bold italic">Authoritative oversight for Block: {blockName}, {districtName}.</CardDescription>
              </div>
            </div>
            <Button className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
            </Button>
          </div>
        </CardHeader>
      </Card>

      {blockUlbs.map((ulb) => (
        <Card key={ulb.mrfId} className="border-2 shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Warehouse className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl font-black uppercase text-primary">ULB Node: {ulb.mrfId}</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">{ulb.ulbName} - {ulb.categoryOfUlb}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase text-[10px] px-3 bg-primary/5">
              Target: {ulb.dryWasteKg} Kg (Avg)
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-10">
            {reconciliationData[ulb.mrfId]?.map((yearBlock, yIdx) => (
              <div key={yIdx} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black text-primary opacity-20 tracking-tighter uppercase">{yearBlock.year} CYCLE</h2>
                  <div className="h-px flex-1 bg-primary/20"></div>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                  {Object.entries(yearBlock.months).map(([month, records], mIdx) => {
                    const monthlyTotal = (records as any[]).reduce((s, r) => s + r.driverSubmitted, 0);
                    const avgBaseline = ulb.dryWasteKg / 4; // Mock avg for the month
                    const monthlyDisc = avgBaseline - monthlyTotal;
                    const efficiency = (monthlyTotal / avgBaseline) * 100;

                    return (
                      <AccordionItem value={`${ulb.mrfId}-${month}`} key={mIdx} className="border-none">
                        <Card className="overflow-hidden border-2 shadow-sm">
                          <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                            <div className="flex justify-between w-full pr-8 items-center">
                              <div className="flex items-center gap-4">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                              </div>
                              <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px]">{ (records as any[]).length} RECEIPTS</Badge>
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
                                    {(records as any[]).map((row: any, rIdx: number) => (
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
                                        <TableCell className="border-r text-right bg-destructive/[0.02] font-mono font-black text-destructive">{(row.totalGpLoad - row.driverSubmitted).toFixed(1)} KG</TableCell>
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
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                              <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                            
                            {/* Monthly Summary Boxes */}
                            <div className="bg-muted/30 border-t p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                              <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Waste Collected (Avg)</p>
                                <p className="text-xl font-black">{avgBaseline.toFixed(1)} KG</p>
                              </div>
                              <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-primary mb-1">Total Verified (This Month)</p>
                                <p className="text-xl font-black text-primary">{monthlyTotal.toFixed(1)} KG</p>
                              </div>
                              <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-destructive mb-1">Monthly Discrepancy</p>
                                <p className="text-xl font-black text-destructive">{monthlyDisc.toFixed(1)} KG</p>
                              </div>
                              <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-4 shadow-inner">
                                <p className="text-[10px] font-black uppercase text-primary mb-1">Efficiency Score</p>
                                <p className="text-xl font-black text-primary">{efficiency.toFixed(1)}%</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </Card>
                      </AccordionItem>
                    );
                  })}
                </Accordion>

                {/* Yearly Audit Report - Automatically triggered after December cycle */}
                {yearBlock.months["December " + yearBlock.year] && (
                  <Card className="mt-10 border-4 border-primary shadow-2xl bg-primary text-primary-foreground overflow-hidden">
                    <CardHeader className="bg-white/10 border-b border-white/20 pb-6">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight">Yearly Block Audit: {yearBlock.year}</CardTitle>
                          <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest">Aggregate performance summary for the fiscal reporting cycle.</CardDescription>
                        </div>
                        <BarChart3 className="h-14 w-14 opacity-30" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table className="text-primary-foreground">
                        <TableHeader className="bg-white/5">
                          <TableRow className="border-white/20">
                            <TableHead className="text-white font-black uppercase text-[10px] border-r border-white/10">Circuits Finalized</TableHead>
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
                              <TableRow className="border-none hover:bg-white/5 h-24">
                                <TableCell className="border-r border-white/10 text-center font-mono font-black text-4xl">{audit.count}</TableCell>
                                <TableCell className="border-r border-white/10 text-right font-mono font-black text-3xl">{audit.total.toLocaleString()} KG</TableCell>
                                <TableCell className="border-r border-white/10 text-right font-mono font-bold text-lg">{audit.paper.toLocaleString()}</TableCell>
                                <TableCell className="border-r border-white/10 text-right font-mono font-bold text-lg">{audit.plastic.toLocaleString()}</TableCell>
                                <TableCell className="border-r border-white/10 text-right font-mono font-bold text-lg">{audit.metal.toLocaleString()}</TableCell>
                                <TableCell className="border-r border-white/10 text-right font-mono font-bold text-lg">{audit.glass.toLocaleString()}</TableCell>
                                <TableCell className="border-r border-white/10 text-right font-mono font-bold text-lg">{audit.sanitation.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono font-bold text-lg">{audit.others.toLocaleString()}</TableCell>
                              </TableRow>
                            );
                          })()}
                        </TableBody>
                      </Table>
                      <div className="bg-white/5 p-6 border-t border-white/10 flex justify-between items-center">
                        <p className="text-[10px] font-bold italic opacity-70">
                          Block Nodal Audit Hash: {blockName.substring(0,3).toUpperCase()}-{yearBlock.year}-RECON
                        </p>
                        <Badge variant="secondary" className="bg-white text-primary font-black uppercase px-6 py-1 tracking-widest">FISCAL FINALIZED</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="border-2 border-dashed bg-muted/20">
        <CardContent className="py-6 flex items-start gap-4">
          <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-tight">Governance & Audit Protocol</p>
            <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
              This block-level ledger resolves high-fidelity reconciliation metrics from all mapped ULB facilities. Average waste baselines are derived from official demographic coverage reports. The **Yearly Block Audit** generates automatically post-December, providing a certified performance review for the district steering committee. Discrepancies exceeding 10% of monthly average trigger an automatic administrative flag.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BlockWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading block reconciliation hub...</div>}>
      <BlockWasteReconciliationContent />
    </Suspense>
  );
}
