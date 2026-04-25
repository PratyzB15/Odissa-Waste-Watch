
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Route, Anchor, CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";

function TripHistoryContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name') || '';
    
    // Mock History Logic with Verification Sync
    // In a real app, 'isCollected' would be true if a record exists for that date in the Registry
    const historyData = useMemo(() => {
        return {
            "May 2026": [
                { date: '2026-05-18', routeId: 'BBOUBKLMPT-1', routeName: 'Path A', mrf: 'Boudh MRF', startGp: 'Mursundhi', endGp: 'Telibandh', isCollected: true },
                { date: '2026-05-11', routeId: 'BBOUBKLMPT-1', routeName: 'Path A', mrf: 'Boudh MRF', startGp: 'Mursundhi', endGp: 'Telibandh', isCollected: false },
                { date: '2026-05-04', routeId: 'BBOUBKLMPT-1', routeName: 'Path A', mrf: 'Boudh MRF', startGp: 'Mursundhi', endGp: 'Telibandh', isCollected: true },
            ],
            "April 2026": [
                { date: '2026-04-27', routeId: 'BBOUBKLMPT-1', routeName: 'Path A', mrf: 'Boudh MRF', startGp: 'Mursundhi', endGp: 'Telibandh', isCollected: true },
                { date: '2026-04-20', routeId: 'BBOUBKLMPT-1', routeName: 'Path A', mrf: 'Boudh MRF', startGp: 'Mursundhi', endGp: 'Telibandh', isCollected: true },
            ]
        };
    }, []);

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

            <Accordion type="single" collapsible defaultValue="May 2026" className="w-full space-y-4">
                {Object.entries(historyData).map(([month, trips], idx) => (
                    <AccordionItem value={month} key={idx} className="border-none">
                        <Card className="overflow-hidden border-2 shadow-md">
                            <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                                <div className="flex items-center gap-4">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                                    <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px]">{trips.length} TRIPS</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                                <ScrollArea className="w-full">
                                    <Table>
                                        <TableHeader className="bg-muted/80">
                                            <TableRow>
                                                <TableHead className="w-[120px] uppercase text-[9px] font-black border-r">Trip Date</TableHead>
                                                <TableHead className="w-[150px] uppercase text-[9px] font-black border-r">Route ID & Name</TableHead>
                                                <TableHead className="w-[150px] uppercase text-[9px] font-black border-r">Target MRF</TableHead>
                                                <TableHead className="uppercase text-[9px] font-black border-r px-6">Terminal Path (Start → End)</TableHead>
                                                <TableHead className="w-[150px] text-center uppercase text-[9px] font-black">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {trips.map((trip, tIdx) => (
                                                <TableRow key={tIdx} className="hover:bg-muted/20 border-b border-dashed last:border-0 h-20">
                                                    <TableCell className="font-mono text-xs font-bold border-r">{trip.date}</TableCell>
                                                    <TableCell className="border-r">
                                                        <div className="space-y-0.5">
                                                            <p className="font-black text-[10px] text-primary uppercase">{trip.routeId}</p>
                                                            <p className="text-[9px] font-medium text-muted-foreground italic">{trip.routeName}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="border-r">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-foreground uppercase">
                                                            <Anchor className="h-3 w-3 opacity-40"/> {trip.mrf}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="border-r px-6">
                                                        <div className="text-[10px] font-bold uppercase space-y-0.5">
                                                            <p className="text-green-700">START: {trip.startGp}</p>
                                                            <p className="text-blue-700">END: {trip.endGp}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {trip.isCollected ? (
                                                            <Badge className="bg-green-600 font-black uppercase text-[9px] flex items-center gap-1 w-fit mx-auto">
                                                                <CheckCircle2 className="h-2 w-2"/> Collected
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="font-black uppercase text-[9px] flex items-center gap-1 w-fit mx-auto">
                                                                <XCircle className="h-2 w-2"/> Not Collected
                                                            </Badge>
                                                        )}
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
