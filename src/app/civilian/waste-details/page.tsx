
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, Calculator, BarChart3, Info, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const FISCAL_YEARS = ["2026", "2027"];

function DriverWasteDetailsContent() {
  const searchParams = useSearchParams();
  const driverName = searchParams.get('name') || 'Personnel';
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  const wasteDetailsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'wasteDetails'), where('driverName', '==', driverName), orderBy('date', 'asc'));
  }, [db, driverName]);
  
  const { data: records = [] } = useCollection(wasteDetailsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    routeId: '',
    mrf: '',
    driverSubmitted: '',
    plastic: '',
    paper: '',
    metal: '',
    cloth: '',
    glass: '',
    sanitation: '',
    others: ''
  });

  useEffect(() => { setMounted(true); }, []);

  const handleOpenEdit = (record: any) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      routeId: record.routeId,
      mrf: record.mrf,
      driverSubmitted: record.driverSubmitted?.toString() || '',
      plastic: record.plastic?.toString() || '',
      paper: record.paper?.toString() || '',
      metal: record.metal?.toString() || '',
      cloth: record.cloth?.toString() || '',
      glass: record.glass?.toString() || '',
      sanitation: record.sanitation?.toString() || '',
      others: record.others?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'wasteDetails', id))
      .then(() => toast({ title: "Receipt Removed", description: "Ledger updated." }))
      .catch(() => toast({ title: "Error", description: "Delete failed.", variant: "destructive" }));
  };

  const handleSubmit = async () => {
    if (!db || !editingRecord) return;
    setIsSubmitting(true);

    const payload = {
      ...formData,
      driverSubmitted: parseFloat(formData.driverSubmitted) || 0,
      plastic: parseFloat(formData.plastic) || 0,
      paper: parseFloat(formData.paper) || 0,
      metal: parseFloat(formData.metal) || 0,
      cloth: parseFloat(formData.cloth) || 0,
      glass: parseFloat(formData.glass) || 0,
      sanitation: parseFloat(formData.sanitation) || 0,
      others: parseFloat(formData.others) || 0,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'wasteDetails', editingRecord.id), payload, { merge: true });
      toast({ title: "Receipt Corrected", description: "Transmission data updated." });
      setIsDialogOpen(false);
    } catch (err) {
      toast({ title: "Update Failed", description: "Database error.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Actions</TableHead>
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
                                                            <TableCell className="border text-center">
                                                                <div className="flex justify-center gap-1">
                                                                    <Button size="icon" variant="outline" className="h-7 w-7 text-primary" onClick={() => handleOpenEdit(row)}><Edit className="h-3 w-3" /></Button>
                                                                    <Button size="icon" variant="outline" className="h-7 w-7 text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="h-3 w-3" /></Button>
                                                                </div>
                                                            </TableCell>
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
                                                        <TableCell></TableCell>
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
                        <BarChart3 className="h-12 w-12" /> Yearly Professional Audit: 2026
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-10">
                    {(() => {
                        const yearlyRecords = records.filter(r => new Date(r.date).getFullYear() === 2026);
                        const yearlyTotals = calculateMonthlyTotals(yearlyRecords);
                        
                        if (yearlyRecords.length === 0) {
                            return <p className="text-center py-12 text-muted-foreground italic uppercase font-black tracking-widest opacity-30">Awaiting annual cycle completion for 2026.</p>;
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border-2">
            <DialogHeader><DialogTitle className="text-xl font-black uppercase text-primary">Edit Verified Receipt</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 border-y my-4">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Route ID</Label><Input value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Load (Kg)</Label><Input type="number" value={formData.driverSubmitted} onChange={e => setFormData({...formData, driverSubmitted: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Plastic</Label><Input type="number" value={formData.plastic} onChange={e => setFormData({...formData, plastic: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Paper</Label><Input type="number" value={formData.paper} onChange={e => setFormData({...formData, paper: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Metal</Label><Input type="number" value={formData.metal} onChange={e => setFormData({...formData, metal: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Cloth</Label><Input type="number" value={formData.cloth} onChange={e => setFormData({...formData, cloth: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Glass</Label><Input type="number" value={formData.glass} onChange={e => setFormData({...formData, glass: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Sanitation</Label><Input type="number" value={formData.sanitation} onChange={e => setFormData({...formData, sanitation: e.target.value})} /></div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="font-black uppercase px-8">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Update Receipt
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-muted/20 border-l-4 border-primary p-6 rounded-r-xl shadow-inner flex items-start gap-4 mt-8">
        <Info className="h-6 w-6 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-tight">Temporal Engine Guidelines</p>
          <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
            Personal collection history is archived by reporting month. Each receipt is a verified transmission node in the jurisdictional audit. Edits or corrections are mirrored in the ULB and District command centers to maintain fiscal integrity.
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
