
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Route, Anchor, CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';

function TripHistoryContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name') || '';
    const ulb = searchParams.get('ulb') || '';
    
    const db = useFirestore();
    const wasteQuery = useMemo(() => {
        if (!db || !ulb) return null;
        return query(collection(db, 'wasteDetails'), where('mrf', '==', ulb), orderBy('date', 'desc'));
    }, [db, ulb]);
    
    const { data: records = [] } = useCollection(wasteQuery);

    const historyData = useMemo(() => {
        const groups: Record<string, any[]> = {};
        
        records.forEach((r: any) => {
            const monthYear = format(parseISO(r.date), 'MMMM yyyy');
            if (!groups[monthYear]) groups[monthYear] = [];
            groups[monthYear].push(r);
        });

        return groups;
    }, [records]);

    return (
        <div className="space-y-6">
            <Card className="border-2 border-primary/20 bg-primary/[0.01]">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Route className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight">Personnel Trip History</CardTitle>
                            <CardDescription className="font-bold italic">Detailed chronological verification of logistical circuits.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {Object.entries(historyData).map(([month, trips], idx) => (
                    <AccordionItem value={month} key={idx} className="border-none">
                        <Card className="overflow-hidden border-2 shadow-md">
                            <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                                <div className="flex items-center gap-4">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                                    <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px]">{trips.length} TRIPS VERIFIED</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                                <ScrollArea className="w-full">
                                    <Table>
                                        <TableHeader className="bg-muted/80">
                                            <TableRow>
                                                <TableHead className="w-[120px] uppercase text-[9px] font-black border-r">Trip Date</TableHead>
                                                <TableHead className="w-[150px] uppercase text-[9px] font-black border-r">Route ID</TableHead>
                                                <TableHead className="w-[200px] uppercase text-[9px] font-black border-r">Facility (MRF)</TableHead>
                                                <TableHead className="w-[150px] text-right uppercase text-[9px] font-black border-r bg-primary/5 text-primary">Load (Kg)</TableHead>
                                                <TableHead className="w-[150px] text-center uppercase text-[9px] font-black">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {trips.map((trip, tIdx) => (
                                                <TableRow key={tIdx} className="hover:bg-muted/20 border-b border-dashed last:border-0 h-16">
                                                    <TableCell className="font-mono text-xs font-bold border-r text-center">{trip.date}</TableCell>
                                                    <TableCell className="border-r font-black text-[10px] text-primary uppercase text-center">{trip.routeId}</TableCell>
                                                    <TableCell className="border-r">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground uppercase">
                                                            <Anchor className="h-3 w-3 opacity-40"/> {trip.mrf}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02] text-sm px-6">
                                                        {trip.driverSubmitted.toFixed(1)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className="bg-green-600 font-black uppercase text-[9px] flex items-center gap-1 w-fit mx-auto">
                                                            <CheckCircle2 className="h-2 w-2"/> Completed
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                ))}
                {records.length === 0 && (
                    <Card className="border-2 border-dashed p-12 text-center text-muted-foreground opacity-30 italic uppercase font-black tracking-widest text-sm">
                        No trip records resolved for current fiscal cycle.
                    </Card>
                )}
            </Accordion>
        </div>
    );
}

export default function TripHistoryPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center animate-pulse">Syncing trip history...</div>}>
            <TripHistoryContent />
        </Suspense>
    )
}
