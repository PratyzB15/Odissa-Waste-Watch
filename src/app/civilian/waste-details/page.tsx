
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, Calculator, BarChart3, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const FISCAL_YEARS = ["2026", "2027"];

function DriverWasteDetailsContent() {
  const searchParams = useSearchParams();
  const driverName = searchParams.get('name') || 'Personnel';
  const ulbParam = searchParams.get('ulb') || '';
  
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  const wasteDetailsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'wasteDetails'), where('driverName', '==', driverName), orderBy('date', 'asc'));
  }, [db, driverName]);
  
  const { data: records = [] } = useCollection(wasteDetailsQuery);

  useEffect(() => { setMounted(true); }, []);

  const calculateMonthlyTotals = (monthRecords: any[]) => {
    return monthRecords.reduce((acc, curr) => ({
      total: acc.total + (curr.driverSubmitted || 0),
      plastic: acc.plastic + (curr.plastic || 0),
      paper: acc.paper + (curr.paper || 0),
      metal: acc.metal + (curr.metal || 0),
      glass: acc.glass + (curr.glass || 0),
      sanitation: acc.sanitation + (curr.sanitation || 0),
      others: acc.others + (curr.others || 0)
    }), { total: 0, plastic: 0, paper: 0, metal: 0, glass: 0, sanitation: 0, others: 0 });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3 text-primary">
            <Calculator className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Personnel Waste Ledger</CardTitle>
              <CardDescription className="font-bold italic text-muted-foreground">Verified collection records for {driverName}.</CardDescription>
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

            <Accordion type="single" collapsible className="w-full space-y-6">
                {MONTHS.map((month, mIdx) => {
                    const monthRecords = records.filter(r => {
                        if (!r.date) return false;
                        const d = new Date(r.date);
                        return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }) === month;
                    });

                    if (year === '2026' && mIdx < 3) return null;
                    
                    const totals = calculateMonthlyTotals(monthRecords);

                    return (
                        <AccordionItem value={`${year}-${month}`} key={`${year}-${month}`} className="border-none">
                            <Card className="overflow-hidden border-2 shadow-xl">
                                <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                                    <div className="flex justify-between w-full pr-8 items-center">
                                        <div className="flex items-center gap-4">
                                            <Calendar className="h-6 w-6 text-primary" />
                                            <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                                        </div>
                                        <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px] bg-primary/5 px-4 py-1">
                                            {monthRecords.length} RECEIPTS VERIFIED
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0 bg-background">
                                    <ScrollArea className="w-full">
                                        <div className="min-w-[1200px]">
                                            <Table className="border-collapse border text-[10px]">
                                                <TableHeader className="bg-muted/80">
                                                    <TableRow>
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                                                        <TableHead className="w-[150px] uppercase font-black border text-center">Route ID</TableHead>
                                                        <TableHead className="w-[180px] uppercase font-black border">Facility (MRF)</TableHead>
                                                        <TableHead className="w-[150px] text-right uppercase font-black border bg-primary/5 text-primary">Total (Kg)</TableHead>
                                                        <TableHead className="w-[100px] text-right uppercase font-black border">Plastic</TableHead>
                                                        <TableHead className="w-[100px] text-right uppercase font-black border">Paper</TableHead>
                                                        <TableHead className="w-[100px] text-right uppercase font-black border">Metal</TableHead>
                                                        <TableHead className="w-[100px] text-right uppercase font-black border">Glass</TableHead>
                                                        <TableHead className="w-[100px] text-right uppercase font-black border">Sanitation</TableHead>
                                                        <TableHead className="w-[100px] text-right uppercase font-black border">Others</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {monthRecords.map((row) => (
                                                        <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b last:border-0 h-14 transition-colors">
                                                            <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                                                            <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
                                                            <TableCell className="border-r font-bold uppercase">{row.mrf}</TableCell>
                                                            <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02] text-sm">{row.driverSubmitted?.toFixed(1)}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.plastic}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.paper}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.metal}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.glass}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.sanitation}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.others}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                                <TableFooter className="bg-primary/5 font-black uppercase text-[10px]">
                                                    <TableRow className="h-14">
                                                        <TableCell colSpan={3} className="text-right border-r">Monthly Cumulative Total:</TableCell>
                                                        <TableCell className="text-right border-r text-primary text-xs font-black">{totals.total.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{totals.plastic.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{totals.paper.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{totals.metal.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{totals.glass.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{totals.sanitation.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right border-r">{totals.others.toFixed(1)}</TableCell>
                                                    </TableRow>
                                                </TableFooter>
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

            {/* Yearly Audit Section */}
            <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-dashed border-primary/20 pb-8 text-center">
                    <CardTitle className="text-4xl font-black font-headline uppercase tracking-tight text-primary/40 flex items-center justify-center gap-4">
                        <BarChart3 className="h-12 w-12" /> Yearly Professional Audit: {year}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-10">
                    {(() => {
                        const yearlyRecords = records.filter(r => new Date(r.date).getFullYear().toString() === year);
                        const yearlyTotals = calculateMonthlyTotals(yearlyRecords);
                        
                        if (yearlyRecords.length === 0) {
                            return <p className="text-center py-12 text-muted-foreground italic uppercase font-black tracking-widest opacity-30">Awaiting annual cycle completion for {year}.</p>;
                        }

                        return (
                            <div className="grid grid-cols-2 lg:grid-cols-7 gap-8 text-center">
                                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-60">Total Collected</p><p className="text-2xl font-black text-primary">{yearlyTotals.total.toFixed(1)} Kg</p></div>
                                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-60">Plastic</p><p className="text-xl font-black">{yearlyTotals.plastic.toFixed(1)}</p></div>
                                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-60">Paper</p><p className="text-xl font-black">{yearlyTotals.paper.toFixed(1)}</p></div>
                                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-60">Metal</p><p className="text-xl font-black">{yearlyTotals.metal.toFixed(1)}</p></div>
                                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-60">Glass</p><p className="text-xl font-black">{yearlyTotals.glass.toFixed(1)}</p></div>
                                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-60">Sanitation</p><p className="text-xl font-black">{yearlyTotals.sanitation.toFixed(1)}</p></div>
                                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-60">Others</p><p className="text-xl font-black">{yearlyTotals.others.toFixed(1)}</p></div>
                            </div>
                        );
                    })()}
                </CardContent>
            </Card>
        </div>
      ))}

      <div className="bg-muted/20 border-l-4 border-primary p-6 rounded-r-xl shadow-inner flex items-start gap-4 mt-8">
        <Info className="h-6 w-6 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-tight">Temporal Engine Guidelines</p>
          <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
            Data is organized by fiscal cycle. Each month card concludes with a high-precision summation row. Yearly audits are automatically generated post-December, aggregating multi-stream recovery metrics across the portal's entire verification history.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DriverWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Syncing personal collection history...</div>}>
      <DriverWasteDetailsContent />
    </Suspense>
  );
}
