
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Database, FileText, Truck, Anchor } from 'lucide-react';
import React, { useMemo, Suspense } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

function GpUlbWasteReceiptDetailsContent() {
  const verifiedReceipts = useMemo(() => {
    // Initializing with zero-state examples awaiting sync from Driver Portal
    return [
      {
        personnelName: "Ramesh Kumar",
        role: "Logistical Driver",
        date: "2024-07-28",
        total: 155,
        plastic: 50,
        paper: 40,
        glass: 30,
        other: 35,
        status: "Verified"
      },
      {
        personnelName: "Sita Majhi",
        role: "Sanitation Worker",
        date: "2024-07-28",
        total: 88,
        plastic: 20,
        paper: 30,
        glass: 15,
        other: 23,
        status: "Verified"
      }
    ];
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Waste Receipt Verification Hub</CardTitle>
              <CardDescription className="font-bold">Real-time oversight of collections synchronized from individual personnel portals.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-2 shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" /> Logged Receipt Directory
                </CardTitle>
                <Badge className="bg-green-600 font-black uppercase text-[10px]">{verifiedReceipts.length} SYNCED TODAY</Badge>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader className="bg-muted/80">
                <TableRow>
                  <TableHead className="w-[200px] uppercase text-[10px] font-black tracking-widest border-r">Personnel (Name & Role)</TableHead>
                  <TableHead className="w-[120px] uppercase text-[10px] font-black tracking-widest border-r text-center">Collection Date</TableHead>
                  <TableHead className="w-[120px] text-right uppercase text-[10px] font-black tracking-widest border-r bg-primary/5 text-primary">Total Waste (Kg)</TableHead>
                  <TableHead className="w-[80px] text-right uppercase text-[10px] font-black border-r">Plastic</TableHead>
                  <TableHead className="w-[80px] text-right uppercase text-[10px] font-black border-r">Paper</TableHead>
                  <TableHead className="w-[80px] text-right uppercase text-[10px] font-black border-r">Glass</TableHead>
                  <TableHead className="w-[80px] text-right uppercase text-[10px] font-black">Other</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifiedReceipts.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/20 border-b border-dashed last:border-0 transition-colors">
                    <TableCell className="border-r">
                      <div className="space-y-1">
                        <p className="font-black text-xs uppercase text-foreground leading-tight">{row.personnelName}</p>
                        <Badge variant="secondary" className="text-[8px] font-bold py-0">{row.role}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="border-r text-center">
                      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <Calendar className="h-3 w-3 opacity-40" /> {row.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-right border-r font-mono font-black text-primary text-sm bg-primary/[0.02]">
                      {row.total.toLocaleString()} KG
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs border-r text-muted-foreground">{row.plastic}</TableCell>
                    <TableCell className="text-right font-mono text-xs border-r text-muted-foreground">{row.paper}</TableCell>
                    <TableCell className="text-right font-mono text-xs border-r text-muted-foreground">{row.glass}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">{row.other}</TableCell>
                  </TableRow>
                ))}
                {verifiedReceipts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">No synchronized receipts resolved for the current cycle.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-dashed bg-muted/20">
            <CardContent className="py-6 flex items-start gap-4">
                <Truck className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight">Logistical Verification Guidelines</p>
                    <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                        Data in this directory is synchronized in real-time from the "Verified Sync Form" submitted by Drivers and Sanitation workers. Facility managers should perform visual inspections of incoming loads to confirm alignment with these digital records.
                    </p>
                </div>
            </CardContent>
        </Card>
        <Card className="border-2 border-dashed bg-muted/20">
            <CardContent className="py-6 flex items-start gap-4">
                <Anchor className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight">Audit Integration</p>
                    <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                        Confirmed receipts automatically populate the monthly reconciliation ledger. Any significant variance between GP-declared load and ULB-received load will trigger an automatic audit flag in the District portal.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GpUlbWasteReceiptDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse">Syncing verification hub...</div>}>
      <GpUlbWasteReceiptDetailsContent />
    </Suspense>
  );
}
