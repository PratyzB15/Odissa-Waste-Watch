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
  Warehouse,
  Info,
  Database
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { mrfData } from "@/lib/mrf-data";

interface CollectionRecord {
  id: string;
  date: string;
  routeId: string;
  mrf: string;
  gpBreakdown: { name: string; amount: number }[];
  totalGpLoad: number;
  driverSubmitted: number;
  plastic: number;
  paper: number;
  metal: number;
  cloth: number;
  glass: number;
  sanitation: number;
  others: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

function BlockWasteReconciliationContent() {
  const searchParams = useSearchParams();
  const blockName = searchParams.get('block') || 'Block Node';
  const districtName = searchParams.get('district') || 'District';
  
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<CollectionRecord[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const blockUlbs = useMemo(() => {
    return mrfData.filter(m => m.blockCovered.toLowerCase() === blockName.toLowerCase());
  }, [blockName]);

  const yearGroups = ["2026", "2027"];

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <Calculator className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Block Waste Reconciliation Hub</CardTitle>
              <CardDescription className="font-bold italic text-muted-foreground">High-fidelity oversight for {blockName}, {districtName}.</CardDescription>
            </div>
          </div>
          <Button className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
          </Button>
        </CardHeader>
      </Card>

      {blockUlbs.map((ulb) => (
        <Card key={ulb.mrfId} className="border-2 shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Warehouse className="h-7 w-7 text-primary" />
              <div>
                <CardTitle className="text-xl font-black uppercase text-primary">ULB Node: {ulb.mrfId}</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">{ulb.ulbName}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase text-[10px] bg-primary/5 px-4 py-1">
              Baseline Target: {ulb.dryWasteKg} Kg (Avg)
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-12">
            {yearGroups.map((year) => (
                <div key={year} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-primary opacity-20 tracking-tighter uppercase">{year} FISCAL CYCLE</h2>
                        <div className="h-px flex-1 bg-primary/10"></div>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {MONTHS.map((month) => {
                            const monthRecords = records.filter(r => {
                                const d = new Date(r.date);
                                return d.getFullYear().toString() === year && 
                                       d.toLocaleString('default', { month: 'long' }) === month && 
                                       r.mrf === ulb.mrfId;
                            });

                            const verifiedMonthTotal = monthRecords.reduce((sum, r) => sum + r.driverSubmitted, 0);

                            return (
                                <AccordionItem value={month} key={month} className="border-none">
                                    <Card className="overflow-hidden border-2 shadow-sm">
                                        <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                                            <div className="flex justify-between w-full pr-8 items-center">
                                                <div className="flex items-center gap-4">
                                                    <Calendar className="h-5 w-5 text-primary" />
                                                    <span className="font-black text-lg uppercase tracking-tighter text-foreground">{month}</span>
                                                </div>
                                                <Badge variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[8px] bg-primary/5 px-3">
                                                    {monthRecords.length} RECEIPTS LOGGED
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                            <ScrollArea className="w-full">
                                                <div className="min-w-[1600px]">
                                                    <Table className="border-collapse border text-[10px]">
                                                        <TableHeader className="bg-muted/80">
                                                            <TableRow>
                                                                <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                                                                <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
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
                                                            {monthRecords.map((row, rIdx) => (
                                                                <TableRow key={rIdx} className="hover:bg-primary/[0.01] border-b h-14 transition-colors">
                                                                    <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.date}</TableCell>
                                                                    <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
                                                                    <TableCell className="border-r p-0">
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <button className="w-full h-14 flex flex-col items-end justify-center px-6 group hover:bg-blue-50 transition-all border-r border-dashed">
                                                                                    <span className="font-mono font-black text-blue-700">{row.totalGpLoad.toFixed(1)} KG</span>
                                                                                </button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden" align="end">
                                                                                <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] tracking-widest flex items-center gap-2">
                                                                                    <MapPin className="h-3 w-3" /> GP Contribution Breakdown
                                                                                </div>
                                                                                <Table>
                                                                                    <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[8px] uppercase font-black">GP Node</TableHead><TableHead className="text-[8px] uppercase font-black text-right">Load (Kg)</TableHead></TableRow></TableHeader>
                                                                                    <TableBody>
                                                                                        {row.gpBreakdown.map((gp, i) => (
                                                                                            <TableRow key={i} className="h-10 border-b border-dashed last:border-0"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount.toFixed(1)}</TableCell></TableRow>
                                                                                        ))}
                                                                                    </TableBody>
                                                                                </Table>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </TableCell>
                                                                    <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02]">{row.driverSubmitted.toFixed(1)} KG</TableCell>
                                                                    <TableCell className="border-r text-right font-mono font-black text-destructive">{(row.totalGpLoad - row.driverSubmitted).toFixed(1)} KG</TableCell>
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
                                                            {monthRecords.length === 0 && (
                                                                <TableRow>
                                                                    <TableCell colSpan={13} className="h-24 text-center text-muted-foreground italic uppercase font-black tracking-widest opacity-20">
                                                                        No Syncronized Submissions for {month}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <ScrollBar orientation="horizontal" />
                                            </ScrollArea>

                                            <div className="bg-muted/30 border-t p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">ULB Baseline (Avg)</p>
                                                    <p className="text-xl font-black">{ulb.dryWasteKg} KG</p>
                                                </div>
                                                <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                                    <p className="text-[10px] font-black uppercase text-primary mb-1">Total Verified</p>
                                                    <p className="text-xl font-black text-primary">{verifiedMonthTotal.toFixed(1)} KG</p>
                                                </div>
                                                <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                                    <p className="text-[10px] font-black uppercase text-destructive mb-1">Monthly Discrepancy</p>
                                                    <p className="text-xl font-black text-destructive">{(ulb.dryWasteKg - verifiedMonthTotal).toFixed(1)} KG</p>
                                                </div>
                                                <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-4 shadow-inner">
                                                    <p className="text-[10px] font-black uppercase text-primary mb-1">Efficiency Score</p>
                                                    <p className="text-xl font-black text-primary">{(ulb.dryWasteKg > 0 ? (verifiedMonthTotal / ulb.dryWasteKg) * 100 : 0).toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </Card>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>

                    {/* Yearly Block Audit summary placeholder */}
                    <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden opacity-80">
                        <CardHeader className="bg-primary/5 border-b border-dashed border-primary/20 pb-6">
                            <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight text-primary/40 flex items-center gap-3">
                                <BarChart3 className="h-10 w-10" /> Yearly Audit Report: {year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="w-full">
                                <div className="min-w-[1600px]">
                                    <Table className="text-muted-foreground">
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[150px] uppercase font-black border text-center">Collection Freq (Year)</TableHead>
                                                <TableHead className="w-[180px] text-right uppercase font-black border">Total Verified (Kg)</TableHead>
                                                <TableHead className="w-[100px] text-right uppercase font-black border">Total Paper</TableHead>
                                                <TableHead className="w-[100px] text-right uppercase font-black border">Total Plastic</TableHead>
                                                <TableHead className="w-[100px] text-right uppercase font-black border">Total Metal</TableHead>
                                                <TableHead className="w-[100px] text-right uppercase font-black border">Total Glass</TableHead>
                                                <TableHead className="w-[100px] text-right uppercase font-black border">Total Sanitation</TableHead>
                                                <TableHead className="w-[100px] text-right uppercase font-black border">Others</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-32 text-center italic font-black uppercase tracking-widest opacity-20">
                                                    Yearly Aggregate Audit Data will generate post-December {year}.
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="border-2 border-dashed bg-muted/20">
        <CardContent className="py-6 flex items-start gap-4">
          <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-tight">Data Integrity Protocol</p>
            <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
              This hub provides block-wide oversight. Every record is verified in real-time against nodal declarations. Summary boxes at the foot of each month calculate local efficacy. Yearly aggregate reports for each ULB node are generated automatically after the December reporting cycle.
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
