
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, Route, Database, Info, PlusCircle, Calculator, Trash2, Edit, Anchor, BarChart3, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

function DriverWasteDetailsContent() {
  const searchParams = useSearchParams();
  const driverName = searchParams.get('name') || 'Personnel';
  const phone = searchParams.get('contact') || 'N/A';
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Data Logic: Segregated by Year and Month starting April 2026
  const historicalData = useMemo(() => {
    return [
      {
        year: "2026",
        months: {
          "April 2026": [
            { 
              date: '2026-04-12', 
              routeId: 'JJAJPCMBN', 
              mrf: 'Kodandapur', 
              gpWeights: { 'Panasa': '45', 'Chainpur': '32', 'Malandapur': '83.5' },
              total: 160.5, plastic: 52, paper: 42, metal: 16, glass: 22, sanitation: 12, others: 16.5 
            },
            { 
              date: '2026-04-26', 
              routeId: 'JJAJPCMBN', 
              mrf: 'Kodandapur', 
              gpWeights: { 'Panasa': '40', 'Chainpur': '30', 'Malandapur': '85' },
              total: 155.0, plastic: 50, paper: 40, metal: 15, glass: 20, sanitation: 10, others: 20 
            }
          ],
          "December 2026": [
            { 
              date: '2026-12-10', 
              routeId: 'JJAJPCMBN', 
              mrf: 'Kodandapur', 
              gpWeights: { 'Panasa': '50', 'Chainpur': '35', 'Malandapur': '80' },
              total: 165.0, plastic: 55, paper: 45, metal: 18, glass: 22, sanitation: 15, others: 10 
            }
          ]
        }
      }
    ];
  }, []);

  const calculateYearlyTotals = (months: any) => {
    const allRecords = Object.values(months).flat() as any[];
    return allRecords.reduce((acc, curr) => ({
      count: acc.count + 1,
      total: acc.total + curr.total,
      plastic: acc.plastic + curr.plastic,
      paper: acc.paper + curr.paper,
      metal: acc.metal + curr.metal,
      glass: acc.glass + curr.glass,
      sanitation: acc.sanitation + curr.sanitation,
      others: acc.others + curr.others
    }), { count: 0, total: 0, plastic: 0, paper: 0, metal: 0, glass: 0, sanitation: 0, others: 0 });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-primary">
              <Calculator className="h-10 w-10" />
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Driver Waste Ledger</CardTitle>
                <CardDescription className="font-bold italic">Official collection history for {driverName} ({phone}).</CardDescription>
              </div>
            </div>
            <Button className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> New Receipt Entry
            </Button>
          </div>
        </CardHeader>
      </Card>

      {historicalData.map((yearBlock, yIdx) => (
        <div key={yIdx} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/20"></div>
            <h2 className="text-4xl font-black text-primary opacity-20 tracking-tighter">{yearBlock.year} FISCAL</h2>
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
                      <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px]">{records.length} CIRCUITS COMPLETED</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <ScrollArea className="w-full">
                      <div className="min-w-[1500px]">
                        <Table className="border-collapse border text-[10px]">
                          <TableHeader className="bg-muted/80">
                            <TableRow>
                              <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                              <TableHead className="w-[120px] uppercase font-black border">Route ID</TableHead>
                              <TableHead className="w-[180px] uppercase font-black border">Tagged MRF</TableHead>
                              <TableHead className="w-[250px] uppercase font-black border text-right px-6 bg-blue-50/20">GP-wise Breakdown (Click)</TableHead>
                              <TableHead className="w-[120px] text-right uppercase font-black border bg-primary/5 text-primary">Total (Kg)</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Plastic</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Paper</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Metal</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Glass</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Sanitation</TableHead>
                              <TableHead className="w-[90px] text-right uppercase font-black border">Others</TableHead>
                              <TableHead className="w-[100px] uppercase font-black border text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {records.map((row: any, rIdx: number) => (
                              <TableRow key={rIdx} className="hover:bg-primary/[0.01] border-b last:border-0 h-14 transition-colors">
                                <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.date}</TableCell>
                                <TableCell className="border-r font-black text-primary uppercase">{row.routeId}</TableCell>
                                <TableCell className="border-r font-bold uppercase">{row.mrf}</TableCell>
                                <TableCell className="border-r p-0">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button className="w-full h-14 flex items-center justify-end px-6 font-bold text-blue-700 hover:bg-blue-50 transition-all underline decoration-dotted underline-offset-4">
                                        View GP Weights
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden">
                                      <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] tracking-widest flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Individual GP Weights
                                      </div>
                                      <Table>
                                        <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[8px] uppercase font-black">GP Node</TableHead><TableHead className="text-[8px] uppercase font-black text-right">Kg</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                          {Object.entries(row.gpWeights).map(([gp, wt]: any, i) => (
                                            <TableRow key={i} className="h-10 border-b border-dashed last:border-0"><TableCell className="text-[9px] font-bold uppercase">{gp}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{wt}</TableCell></TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </PopoverContent>
                                  </Popover>
                                </TableCell>
                                <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02]">{row.total.toFixed(1)} KG</TableCell>
                                <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plastic}</TableCell>
                                <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper}</TableCell>
                                <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal}</TableCell>
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
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Yearly Audit Report - Triggered after December */}
          {yearBlock.months["December " + yearBlock.year] && (
            <Card className="border-4 border-primary shadow-2xl bg-primary text-primary-foreground overflow-hidden">
              <CardHeader className="bg-white/10 border-b border-white/20 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight">Yearly Professional Audit: {yearBlock.year}</CardTitle>
                    <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest">Aggregate logistical data for the reporting year.</CardDescription>
                  </div>
                  <BarChart3 className="h-12 w-12 opacity-30" />
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                {(() => {
                  const totals = calculateYearlyTotals(yearBlock.months);
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase opacity-60">Circuits Finalized</p>
                        <p className="text-3xl font-black font-mono">{totals.count}</p>
                      </div>
                      <div className="space-y-1 border-l border-white/20 pl-6">
                        <p className="text-[10px] font-black uppercase opacity-60">Cumulative Load (Kg)</p>
                        <p className="text-3xl font-black font-mono">{totals.total.toLocaleString()} KG</p>
                      </div>
                      <div className="space-y-1 border-l border-white/20 pl-6">
                        <p className="text-[10px] font-black uppercase opacity-60">Total Plastic</p>
                        <p className="text-3xl font-black font-mono">{totals.plastic.toFixed(1)} KG</p>
                      </div>
                      <div className="space-y-1 border-l border-white/20 pl-6">
                        <p className="text-[10px] font-black uppercase opacity-60">Total Paper</p>
                        <p className="text-3xl font-black font-mono">{totals.paper.toFixed(1)} KG</p>
                      </div>
                    </div>
                  );
                })()}
                <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-bold italic opacity-60">
                   Verified Professional Collection History - Government of Odisha SWM Portal
                  <Badge variant="secondary" className="bg-white text-primary font-black uppercase px-4 py-1">CERTIFIED CYCLE</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DriverWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading collection history...</div>}>
      <DriverWasteDetailsContent />
    </Suspense>
  );
}
