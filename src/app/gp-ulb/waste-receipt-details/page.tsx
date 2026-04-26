
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Calendar, 
  Truck, 
  LayoutGrid, 
  ClipboardList,
  MapPin,
  FileText
} from 'lucide-react';
import React, { useMemo, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

function WasteReceiptSubmissionContent() {
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || 'Facility Node';
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => { setMounted(true); }, []);

  const wasteQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), where('mrf', '==', ulbParam), orderBy('date', 'desc')) : null, [db, ulbParam]);
  const { data: records = [] } = useCollection(wasteQuery);

  const fiscalCycles = ["2026", "2027"];

  if (!mounted) return null;

  const calculateTotals = (items: any[]) => {
    return items.reduce((acc, curr) => ({
      total: acc.total + (curr.driverSubmitted || 0),
      plastic: acc.total + (curr.plastic || 0),
      paper: acc.paper + (curr.paper || 0),
      metal: acc.metal + (curr.metal || 0),
      cloth: acc.cloth + (curr.cloth || 0),
      glass: acc.glass + (curr.glass || 0),
      sanitation: acc.sanitation + (curr.sanitation || 0),
      others: acc.others + (curr.others || 0)
    }), { total: 0, plastic: 0, paper: 0, metal: 0, cloth: 0, glass: 0, sanitation: 0, others: 0 });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Waste Receipt Submission Hub</CardTitle>
              <CardDescription className="font-bold italic">Authoritative digital paper trail for {ulbParam} node.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {fiscalCycles.map(year => (
        <div key={year} className="space-y-6">
          <div className="flex items-center gap-4">
             <h2 className="text-3xl font-black text-primary opacity-20 uppercase tracking-tighter">{year} FISCAL CYCLE</h2>
             <div className="h-px flex-1 bg-primary/10"></div>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {MONTHS.map((month) => {
              const monthItems = records.filter(r => {
                const d = new Date(r.date);
                return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }) === month;
              });

              if (monthItems.length === 0) return null;

              const driverReceipts = monthItems.filter((r: any) => r.gpBreakdown?.length > 1);
              const gpReceipts = monthItems.filter((r: any) => r.gpBreakdown?.length === 1);
              
              const driverTotals = calculateTotals(driverReceipts);
              const gpTotals = calculateTotals(gpReceipts);

              return (
                <AccordionItem value={`${year}-${month}`} key={`${year}-${month}`} className="border-none">
                   <Card className="overflow-hidden border-2 shadow-lg">
                      <AccordionTrigger className="p-6 hover:no-underline bg-muted/20 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                         <div className="flex items-center gap-4">
                            <Calendar className="h-6 w-6 text-primary" />
                            <span className="font-black text-xl uppercase tracking-tighter">{month}</span>
                            <Badge variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[8px] bg-primary/5 px-3">
                                {monthItems.length} TOTAL RECEIPTS
                            </Badge>
                         </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-6 space-y-8 bg-background">
                         {/* Driver Section */}
                         <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                               <Truck className="h-5 w-5 text-primary" />
                               <h3 className="font-black uppercase text-sm tracking-tight">Submissions from Drivers</h3>
                            </div>
                            <ScrollArea className="w-full rounded-xl border">
                               <div className="min-w-[1500px]">
                                  <Table className="text-[10px]">
                                     <TableHeader className="bg-muted/50">
                                        <TableRow>
                                           <TableHead className="font-black uppercase border-r text-center">Date</TableHead>
                                           <TableHead className="font-black uppercase border-r text-center">Route ID</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right px-6">GP-wise Breakdown (Click)</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right bg-primary/5">Total (Kg)</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right text-destructive bg-destructive/5">Discrepancy</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right">Plastic</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right">Paper</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right">Metal</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right">Cloth</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right">Glass</TableHead>
                                           <TableHead className="font-black uppercase border-r text-right">Sanitation</TableHead>
                                           <TableHead className="font-black uppercase text-center">Actions</TableHead>
                                        </TableRow>
                                     </TableHeader>
                                     <TableBody>
                                        {driverReceipts.map((row: any, i: number) => (
                                          <TableRow key={i} className="h-12 border-b border-dashed last:border-0 hover:bg-muted/30 transition-colors">
                                             <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                                             <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
                                             <TableCell className="border-r p-0">
                                                <Popover>
                                                   <PopoverTrigger asChild>
                                                      <button className="w-full h-12 flex items-center justify-end px-6 font-bold text-blue-700 hover:bg-blue-50 underline decoration-dotted underline-offset-4">
                                                         {row.totalGpLoad?.toFixed(1)} KG
                                                      </button>
                                                   </PopoverTrigger>
                                                   <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden" align="end">
                                                      <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] flex items-center gap-2"><MapPin className="h-3 w-3" /> GP Contribution Breakdown</div>
                                                      <Table><TableBody>{row.gpBreakdown?.map((gp: any, idx: number) => (<TableRow key={idx} className="h-10 border-b border-dashed"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount?.toFixed(1)}</TableCell></TableRow>))}</TableBody></Table>
                                                   </PopoverContent>
                                                </Popover>
                                             </TableCell>
                                             <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02]">{row.driverSubmitted?.toFixed(1)}</TableCell>
                                             <TableCell className="border-r text-right font-mono font-black text-destructive">{(row.totalGpLoad - row.driverSubmitted).toFixed(1)}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.plastic}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.paper}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.metal}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.cloth}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.glass}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.sanitation}</TableCell>
                                             <TableCell className="text-center font-black text-muted-foreground opacity-30 italic">LOGGED</TableCell>
                                          </TableRow>
                                        ))}
                                     </TableBody>
                                     <TableFooter className="bg-muted/40 font-black uppercase text-[9px]">
                                        <TableRow>
                                           <TableCell colSpan={3} className="text-right border-r">Month Total (Drivers):</TableCell>
                                           <TableCell className="text-right border-r text-primary text-xs">{driverTotals.total.toFixed(1)}</TableCell>
                                           <TableCell className="border-r"></TableCell>
                                           <TableCell className="text-right border-r">{driverTotals.plastic.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{driverTotals.paper.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{driverTotals.metal.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{driverTotals.cloth.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{driverTotals.glass.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{driverTotals.sanitation.toFixed(1)}</TableCell>
                                           <TableCell></TableCell>
                                        </TableRow>
                                     </TableFooter>
                                  </Table>
                               </div>
                               <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                         </div>

                         {/* GP Section */}
                         <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                               <LayoutGrid className="h-5 w-5 text-primary" />
                               <h3 className="font-black uppercase text-sm tracking-tight">Submissions from GP Portal</h3>
                            </div>
                            <ScrollArea className="w-full rounded-xl border">
                               <div className="min-w-[1600px]">
                                  <Table className="text-[10px]">
                                     <TableHeader className="bg-muted/50">
                                        <TableRow>
                                           <TableHead className="w-[120px] uppercase font-black border-r text-center">Date</TableHead>
                                           <TableHead className="w-[120px] uppercase font-black border-r text-center">District</TableHead>
                                           <TableHead className="w-[120px] uppercase font-black border-r text-center">Block</TableHead>
                                           <TableHead className="w-[180px] uppercase font-black border-r">Tagged MRF</TableHead>
                                           <TableHead className="w-[120px] uppercase font-black border-r text-center">Route ID</TableHead>
                                           <TableHead className="w-[150px] text-right uppercase font-black border-r bg-blue-50 text-blue-800">Total (Kg)</TableHead>
                                           <TableHead className="w-[100px] uppercase font-black border-r text-right">Plastic (gm)</TableHead>
                                           <TableHead className="w-[100px] uppercase font-black border-r text-right">Paper</TableHead>
                                           <TableHead className="w-[100px] uppercase font-black border-r text-right">Metal</TableHead>
                                           <TableHead className="w-[100px] uppercase font-black border-r text-right">Glass</TableHead>
                                           <TableHead className="w-[100px] uppercase font-black border-r text-right">Sanitation</TableHead>
                                           <TableHead className="w-[100px] uppercase font-black border-r text-right">Others</TableHead>
                                           <TableHead className="w-[100px] uppercase font-black text-center">Actions</TableHead>
                                        </TableRow>
                                     </TableHeader>
                                     <TableBody>
                                        {gpReceipts.map((row: any, i: number) => (
                                          <TableRow key={i} className="h-12 border-b border-dashed last:border-0 hover:bg-muted/30 transition-colors">
                                             <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                                             <TableCell className="border-r text-center uppercase font-bold text-muted-foreground">{row.district}</TableCell>
                                             <TableCell className="border-r text-center uppercase font-bold text-muted-foreground">{row.block}</TableCell>
                                             <TableCell className="border-r font-bold uppercase">{row.mrf}</TableCell>
                                             <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
                                             <TableCell className="border-r text-right font-mono font-black text-blue-800 bg-blue-50/50">{row.driverSubmitted?.toFixed(1)}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.plastic}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.paper}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.metal}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.glass}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.sanitation}</TableCell>
                                             <TableCell className="border-r text-right font-mono">{row.others || 0}</TableCell>
                                             <TableCell className="text-center font-black text-muted-foreground opacity-30 italic">SYNC'D</TableCell>
                                          </TableRow>
                                        ))}
                                     </TableBody>
                                     <TableFooter className="bg-blue-50 font-black uppercase text-[9px] text-blue-800">
                                        <TableRow>
                                           <TableCell colSpan={5} className="text-right border-r">Month Total (GPs):</TableCell>
                                           <TableCell className="text-right border-r text-xs">{gpTotals.total.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{gpTotals.plastic.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{gpTotals.paper.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{gpTotals.metal.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{gpTotals.glass.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{gpTotals.sanitation.toFixed(1)}</TableCell>
                                           <TableCell className="text-right border-r">{gpTotals.others.toFixed(1)}</TableCell>
                                           <TableCell></TableCell>
                                        </TableRow>
                                     </TableFooter>
                                  </Table>
                               </div>
                               <ScrollBar orientation="horizontal" />
                            </ScrollArea>
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

export default function WasteReceiptSubmissionPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse">Loading verified synchronization hub...</div>}>
      <WasteReceiptSubmissionContent />
    </Suspense>
  );
}
