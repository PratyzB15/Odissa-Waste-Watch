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
  MapPin,
  TrendingUp,
  BarChart3,
  Info,
  Database,
  ArrowRight,
  PlusCircle,
  Edit,
  Trash2
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CollectionRecord {
  id: string;
  date: string;
  routeId: string;
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

function ULBWasteReconciliationContent() {
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || 'Facility Node';
  
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<CollectionRecord[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const yearGroups = ["2026", "2027"];

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-primary">
            <Calculator className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Waste Reconciliation Hub</CardTitle>
              <CardDescription className="font-bold italic text-muted-foreground">Facility Node: {ulbParam}</CardDescription>
            </div>
          </div>
          <Button className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
          </Button>
        </CardHeader>
      </Card>

      {yearGroups.map((year) => (
        <div key={year} className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-primary opacity-20 tracking-tighter uppercase">{year} FISCAL CYCLE</h2>
            <div className="h-px flex-1 bg-primary/20"></div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {MONTHS.map((month) => {
                const monthRecords = records.filter(r => {
                    const d = new Date(r.date);
                    return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }) === month;
                });

                return (
                    <AccordionItem value={month} key={month} className="border-none">
                        <Card className="overflow-hidden border-2 shadow-lg">
                            <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                                <div className="flex justify-between w-full pr-8 items-center">
                                    <div className="flex items-center gap-4">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                                    </div>
                                    <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px] bg-primary/5 px-3">
                                        {monthRecords.length} RECEIPTS SYNCED
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
                                                    <TableRow key={rIdx} className="hover:bg-primary/[0.01] border-b last:border-0 h-16 transition-colors">
                                                        <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                                                        <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
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
                                                                        <MapPin className="h-3 w-3" /> Individual GP Contributions
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
                                                        <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02] text-sm">{row.driverSubmitted.toFixed(1)} KG</TableCell>
                                                        <TableCell className="border-r text-right font-mono font-black text-destructive">{(row.totalGpLoad - row.driverSubmitted).toFixed(1)} KG</TableCell>
                                                        <TableCell className="border-r text-right font-mono">{row.plastic}</TableCell>
                                                        <TableCell className="border-r text-right font-mono">{row.paper}</TableCell>
                                                        <TableCell className="border-r text-right font-mono">{row.metal}</TableCell>
                                                        <TableCell className="border-r text-right font-mono">{row.cloth}</TableCell>
                                                        <TableCell className="border-r text-right font-mono">{row.glass}</TableCell>
                                                        <TableCell className="border-r text-right font-mono">{row.sanitation}</TableCell>
                                                        <TableCell className="border-r text-right font-mono">{row.others}</TableCell>
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
                                                        <TableCell colSpan={13} className="h-32 text-center text-muted-foreground italic uppercase font-black tracking-widest opacity-20">
                                                            Awaiting Verified Submissions for {month}
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
                );
            })}
          </Accordion>

          <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-dashed border-primary/20 pb-6">
                <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight text-primary/40 flex items-center gap-3">
                    <BarChart3 className="h-10 w-10" /> Yearly Audit Report: {year}
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Comprehensive jurisdictional performance for the fiscal year.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="w-full">
                    <div className="min-w-[1600px]">
                        <Table className="text-muted-foreground">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[180px] uppercase font-black border text-center">Route ID</TableHead>
                                    <TableHead className="w-[180px] uppercase font-black border text-center">Associated MRF</TableHead>
                                    <TableHead className="w-[180px] uppercase font-black border text-center">Collection Freq (Year)</TableHead>
                                    <TableHead className="w-[150px] text-right uppercase font-black border">Total Verified (Kg)</TableHead>
                                    <TableHead className="w-[100px] text-right uppercase font-black border">Total Plastic</TableHead>
                                    <TableHead className="w-[100px] text-right uppercase font-black border">Total Paper</TableHead>
                                    <TableHead className="w-[100px] text-right uppercase font-black border">Total Metal</TableHead>
                                    <TableHead className="w-[100px] text-right uppercase font-black border">Total Cloth</TableHead>
                                    <TableHead className="w-[100px] text-right uppercase font-black border">Total Glass</TableHead>
                                    <TableHead className="w-[100px] text-right uppercase font-black border">Total Sanitation</TableHead>
                                    <TableHead className="w-[100px] text-right uppercase font-black border">Others</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={11} className="h-40 text-center italic font-black uppercase tracking-widest opacity-20">
                                        Yearly Audit Data will generate automatically post-December {year}.
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

      <Card className="border-2 border-dashed bg-muted/20">
        <CardContent className="py-6 flex items-start gap-4">
          <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-tight">Facility Hub Integration</p>
            <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
              This hub reconciles nodal declarations with logistical verified tonnage. Submissions are grouped chronologically. Any significant variance triggers an audit flag. Yearly aggregate reports for the fiscal cycle provide high-fidelity performance metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ULBWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading reconciliation hub...</div>}>
      <ULBWasteReconciliationContent />
    </Suspense>
  );
}
