'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  User, 
  Calendar, 
  Database, 
  FileText, 
  Truck, 
  Anchor, 
  LayoutGrid, 
  ClipboardList 
} from 'lucide-react';
import React, { useMemo, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function WasteReceiptVerificationContent() {
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || 'Facility Node';
  const role = searchParams.get('role');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Zero-state architecture: Initializing as empty awaiting submissions
  const [driverReceipts, setDriverReceipts] = useState<any[]>([]);
  const [gpReceipts, setGpReceipts] = useState<any[]>([]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Waste Receipt Verification Hub</CardTitle>
              <CardDescription className="font-bold italic">Authoritative digital paper trail for {ulbParam} facility node.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="drivers">
        <AccordionItem value="drivers" className="border-none">
          <Card className="border-2 shadow-lg overflow-hidden">
            <AccordionTrigger className="p-6 hover:no-underline bg-muted/30 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
              <div className="flex items-center gap-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-tighter text-foreground">Receipts from Drivers</span>
                <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                  {driverReceipts.length} SYNCED TODAY
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1500px]">
                  <Table className="border-collapse border text-[10px]">
                    <TableHeader className="bg-muted/80">
                      <TableRow>
                        <TableHead className="w-[200px] uppercase font-black border">Driver Name</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Phone No.</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border">Tagged MRF</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-right bg-primary/5 text-primary">Total (Kg)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Plastic</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Paper</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Metal</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Glass</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Sanitation</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Others</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {driverReceipts.map((row, i) => (
                        <TableRow key={i} className="hover:bg-primary/[0.01] border-b h-12">
                          <TableCell className="border-r font-black uppercase text-foreground">{row.driverName}</TableCell>
                          <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.phoneNo}</TableCell>
                          <TableCell className="border-r font-mono text-center font-black text-primary">{row.routeId}</TableCell>
                          <TableCell className="border-r text-center font-bold">{row.dateOfCollection}</TableCell>
                          <TableCell className="border-r text-[9px] font-black uppercase text-primary">{row.taggedMrf}</TableCell>
                          <TableCell className="border-r text-right font-mono font-black text-primary text-sm bg-primary/[0.02]">{row.totalWaste} KG</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plastic}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.glass}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.sanitation}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.others}</TableCell>
                        </TableRow>
                      ))}
                      {driverReceipts.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={12} className="h-40 text-center text-muted-foreground italic uppercase font-black tracking-widest opacity-20">
                                  Awaiting Submissions from Driver Portal
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

        <AccordionItem value="gps" className="border-none">
          <Card className="border-2 shadow-lg overflow-hidden">
            <AccordionTrigger className="p-6 hover:no-underline bg-muted/30 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
              <div className="flex items-center gap-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-tighter text-foreground">Receipts from GP Portal</span>
                <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                  {gpReceipts.length} SYNCED TODAY
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1500px]">
                  <Table className="border-collapse border text-[10px]">
                    <TableHeader className="bg-muted/80">
                      <TableRow>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border text-center">District</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border text-center">Block</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border text-center">Tagged MRF</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-right bg-blue-50 text-blue-800">Total (Kg)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Plastic (gm)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Paper</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Metal</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Glass</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Sanitation</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Others</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gpReceipts.map((row, i) => (
                        <TableRow key={i} className="hover:bg-primary/[0.01] border-b h-12">
                          <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.dateOfCollection}</TableCell>
                          <TableCell className="border-r font-black uppercase text-foreground text-center">{row.districtName}</TableCell>
                          <TableCell className="border-r font-black uppercase text-foreground text-center">{row.blockName}</TableCell>
                          <TableCell className="border-r text-[9px] font-black uppercase text-primary text-center">{row.taggedMrf}</TableCell>
                          <TableCell className="border-r font-mono text-center font-black text-primary">{row.assignedRouteId}</TableCell>
                          <TableCell className="border-r text-right font-mono font-black text-blue-800 text-sm bg-blue-50/50">{row.totalWaste} KG</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plastic}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.glass}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.sanitation}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.others}</TableCell>
                        </TableRow>
                      ))}
                      {gpReceipts.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={12} className="h-40 text-center text-muted-foreground italic uppercase font-black tracking-widest opacity-20">
                                  Awaiting Submissions from GP Portal
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
      </Accordion>
    </div>
  );
}

export default function WasteReceiptVerificationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse">Syncing verification hub...</div>}>
      <WasteReceiptVerificationContent />
    </Suspense>
  );
}
