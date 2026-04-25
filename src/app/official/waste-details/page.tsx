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
  Building,
  Info,
  PlusCircle,
  Edit,
  Trash2
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
  block: string;
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

function DistrictWasteReconciliationContent() {
  const searchParams = useSearchParams();
  const districtName = searchParams.get('district') || 'District Node';
  
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<CollectionRecord[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const districtStats = useMemo(() => {
    const totalAvg = mrfData.filter(m => m.district.toLowerCase() === districtName.toLowerCase()).reduce((sum, m) => sum + m.dryWasteKg, 0);
    const totalVerified = records.reduce((sum, r) => sum + r.driverSubmitted, 0);
    const efficiency = totalAvg > 0 ? (totalVerified / totalAvg) * 100 : 0;
    return { totalAvg, totalVerified, efficiency };
  }, [districtName, records]);

  const districtBlocks = useMemo(() => {
    const blocksSet = new Set(mrfData.filter(m => m.district.toLowerCase() === districtName.toLowerCase()).map(m => m.blockCovered));
    return Array.from(blocksSet).sort();
  }, [districtName]);

  const yearGroups = ["2026", "2027"];

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-primary">
            <Calculator className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">District Waste Reconciliation Hub</CardTitle>
              <CardDescription className="font-bold italic text-muted-foreground">Comprehensive District-wide oversight for {districtName}.</CardDescription>
            </div>
          </div>
          <Button className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-background border-2 border-dashed rounded-xl p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">District Load Baseline (Avg)</p>
                <p className="text-3xl font-black text-foreground">{districtStats.totalAvg.toLocaleString()} KG</p>
            </div>
            <div className="bg-background border-2 border-dashed rounded-xl p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase text-primary mb-1">Total District Verified</p>
                <p className="text-3xl font-black text-primary">{districtStats.totalVerified.toLocaleString()} KG</p>
            </div>
            <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-6 shadow-inner">
                <p className="text-[10px] font-black uppercase text-primary mb-1">District Efficiency Score</p>
                <p className="text-3xl font-black text-primary">{districtStats.efficiency.toFixed(1)}%</p>
            </div>
        </CardContent>
      </Card>

      {districtBlocks.map((block) => {
        const blockAvgWaste = mrfData.filter(m => m.blockCovered === block && m.district.toLowerCase() === districtName.toLowerCase()).reduce((sum, m) => sum + m.dryWasteKg, 0);

        return (
            <Card key={block} className="border-2 shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="h-7 w-7 text-primary" />
                  <div>
                    <CardTitle className="text-xl font-black uppercase text-primary">Block Node: {block}</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">{districtName} District Audit</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase text-[10px] bg-primary/5 px-4 py-1">
                  Block Target: {blockAvgWaste.toLocaleString()} Kg (Avg)
                </Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-12">
                {yearGroups.map((year) => (
                    <div key={year} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-primary opacity-20 tracking-tighter uppercase">{year} FISCAL</h2>
                            <div className="h-px flex-1 bg-primary/10"></div>
                        </div>

                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {MONTHS.map((month) => {
                                const monthRecords = records.filter(r => {
                                    const d = new Date(r.date);
                                    return d.getFullYear().toString() === year && 
                                           d.toLocaleString('default', { month: 'long' }) === month && 
                                           r.block === block;
                                });

                                const monthlyTotalVerified = monthRecords.reduce((sum, r) => sum + r.driverSubmitted, 0);
                                const monthlyDiscrepancy = blockAvgWaste - monthlyTotalVerified;
                                const monthlyEfficiency = blockAvgWaste > 0 ? (monthlyTotalVerified / blockAvgWaste) * 100 : 0;

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
                                                                    <TableHead className="w-[120px] uppercase font-black border text-center">Date of Collection</TableHead>
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
                                                                    <TableRow key={rIdx} className="hover:bg-primary/[0.01] border-b last:border-0 h-14 transition-colors">
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
                                                                                        <TableHeader className="bg-muted/50">
                                                                                          <TableRow>
                                                                                            <TableHead className="text-[8px] uppercase font-black">GP Node</TableHead>
                                                                                            <TableHead className="text-[8px] uppercase font-black text-right">Load (Kg)</TableHead>
                                                                                          </TableRow>
                                                                                        </TableHeader>
                                                                                        <TableBody>
                                                                                            {row.gpBreakdown.map((gp, i) => (
                                                                                                <TableRow key={i} className="h-10 border-b border-dashed last:border-0">
                                                                                                  <TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell>
                                                                                                  <TableCell className="text-right font-mono font-black text-blue-700">{gp.amount.toFixed(1)}</TableCell>
                                                                                                </TableRow>
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
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Block Load (Avg)</p>
                                                    <p className="text-xl font-black">{blockAvgWaste.toLocaleString()} KG</p>
                                                </div>
                                                <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                                    <p className="text-[10px] font-black uppercase text-primary mb-1">Total Verified</p>
                                                    <p className="text-xl font-black text-primary">{monthlyTotalVerified.toFixed(1)} KG</p>
                                                </div>
                                                <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                                    <p className="text-[10px] font-black uppercase text-destructive mb-1">Discrepancy</p>
                                                    <p className="text-xl font-black text-destructive">{monthlyDiscrepancy.toFixed(1)} KG</p>
                                                </div>
                                                <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-4 shadow-inner">
                                                    <p className="text-[10px] font-black uppercase text-primary mb-1">Efficiency Score</p>
                                                    <p className="text-xl font-black text-primary">{monthlyEfficiency.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </Card>
                                );
                            })}
                        </Accordion>

                        <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden opacity-80">
                            <CardHeader className="bg-primary/5 border-b border-dashed border-primary/20 pb-6">
                                <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight text-primary/40 flex items-center gap-3">
                                    <BarChart3 className="h-10 w-10" /> Yearly Block Audit Summary: {year}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="w-full">
                                    <div className="min-w-[1600px]">
                                        <Table className="text-muted-foreground">
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="w-[180px] uppercase font-black border text-center">Collection Freq (Year)</TableHead>
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
                                                        Yearly Aggregate Audit will fill post-December {year}.
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
        );
      })}

      <Card className="border-2 border-dashed bg-muted/20">
        <CardContent className="py-6 flex items-start gap-4">
          <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-tight">District-Level Audit Protocol</p>
            <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
              This hub provides a comprehensive view of block-level waste convergence across the district. Monthly summary boxes compare actual verification totals against jurisdictional baseline targets. Yearly audit reports are generated upon cycle completion for state-wide synchronization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DistrictWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading district reconciliation hub...</div>}>
      <DistrictWasteReconciliationContent />
    </Suspense>
  );
}
