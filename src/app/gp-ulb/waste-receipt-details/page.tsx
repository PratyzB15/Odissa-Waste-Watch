
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Calendar, 
  FileText, 
  Truck, 
  LayoutGrid, 
  ClipboardList,
  MapPin
} from 'lucide-react';
import React, { useMemo, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function WasteReceiptVerificationContent() {
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || 'Facility Node';
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => { setMounted(true); }, []);

  const wasteQuery = useMemo(() => db ? query(collection(db, 'wasteDetails'), where('mrf', '==', ulbParam), orderBy('date', 'desc')) : null, [db, ulbParam]);
  const { data: records = [] } = useCollection(wasteQuery);

  // Distinguish between Driver and GP submissions based on data structure
  const driverReceipts = useMemo(() => records.filter((r: any) => r.gpBreakdown?.length > 1), [records]);
  const gpReceipts = useMemo(() => records.filter((r: any) => r.gpBreakdown?.length === 1), [records]);

  if (!mounted) return null;

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

      <Accordion type="multiple" defaultValue={["drivers", "gps"]} className="w-full space-y-4">
        <AccordionItem value="drivers" className="border-none">
          <Card className="border-2 shadow-lg overflow-hidden">
            <AccordionTrigger className="p-6 hover:no-underline bg-muted/30 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
              <div className="flex items-center gap-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-tighter text-foreground">Submissions from Drivers</span>
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
                        <TableHead className="w-[200px] uppercase font-black border text-right px-6 bg-blue-50/20">GP-wise Breakdown (Click)</TableHead>
                        <TableHead className="w-[150px] text-right uppercase font-black border bg-primary/5 text-primary">Total (Kg)</TableHead>
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
                      {driverReceipts.map((row: any, i: number) => (
                        <TableRow key={i} className="hover:bg-primary/[0.01] border-b h-14">
                          <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                          <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
                          <TableCell className="border-r p-0">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-14 flex items-center justify-end px-6 font-bold text-blue-700 hover:bg-blue-50 transition-all underline decoration-dotted underline-offset-4">
                                        {row.totalGpLoad.toFixed(1)} KG
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden" align="end">
                                    <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] tracking-widest flex items-center gap-2"><MapPin className="h-3 w-3" /> GP Contribution Breakdown</div>
                                    <Table><TableBody>{row.gpBreakdown?.map((gp: any, idx: number) => (<TableRow key={idx} className="h-10 border-b border-dashed"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount.toFixed(1)}</TableCell></TableRow>))}</TableBody></Table>
                                </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02]">{row.driverSubmitted.toFixed(1)} KG</TableCell>
                          <TableCell className="border-r text-right font-mono font-black text-destructive">{(row.totalGpLoad - row.driverSubmitted).toFixed(1)} KG</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.plastic}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.paper}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.metal}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.cloth}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.glass}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.sanitation}</TableCell>
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

        <AccordionItem value="gps" className="border-none">
          <Card className="border-2 shadow-lg overflow-hidden">
            <AccordionTrigger className="p-6 hover:no-underline bg-muted/30 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
              <div className="flex items-center gap-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-tighter text-foreground">Submissions from GP Portal</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1600px]">
                  <Table className="border-collapse border text-[10px]">
                    <TableHeader className="bg-muted/80">
                      <TableRow>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border text-center">District</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border text-center">Block</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border text-center">Tagged MRF</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
                        <TableHead className="w-[150px] text-right uppercase font-black border bg-blue-50 text-blue-800">Total (Kg)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Plastic (gm)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Paper</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Metal</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Glass</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Sanitation</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Others</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gpReceipts.map((row: any, i: number) => (
                        <TableRow key={i} className="hover:bg-primary/[0.01] border-b h-14">
                          <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.date}</TableCell>
                          <TableCell className="border-r font-black uppercase text-foreground text-center">{row.district}</TableCell>
                          <TableCell className="border-r font-black uppercase text-foreground text-center">{row.block}</TableCell>
                          <TableCell className="border-r text-[9px] font-black uppercase text-primary text-center">{row.mrf}</TableCell>
                          <TableCell className="border-r font-mono text-center font-black text-primary">{row.routeId}</TableCell>
                          <TableCell className="border-r text-right font-mono font-black text-blue-800 text-sm bg-blue-50/50">{row.driverSubmitted.toFixed(1)} KG</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.plastic}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.paper}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.metal}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.glass}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.sanitation}</TableCell>
                          <TableCell className="border-r text-right font-mono">{row.others}</TableCell>
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
      </Accordion>
    </div>
  );
}

export default function WasteReceiptVerificationPage() {
  return (<Suspense fallback={<div>Loading...</div>}><WasteReceiptVerificationContent /></Suspense>);
}
