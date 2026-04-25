
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, Route, Database, Info, PlusCircle, Calculator, Trash2, Edit, Anchor, BarChart3, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CollectionRecord {
  id: string;
  date: string;
  routeId: string;
  mrf: string;
  district: string;
  block: string;
  gpBreakdown: { name: string; amount: number }[];
  total: number;
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

function DriverWasteDetailsContent() {
  const searchParams = useSearchParams();
  const driverName = searchParams.get('name') || 'Personnel';
  const phone = searchParams.get('contact') || 'N/A';
  const districtParam = searchParams.get('district') || '';
  const blockParam = searchParams.get('block') || '';
  const ulbParam = searchParams.get('ulb') || '';
  
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const wasteDetailsQuery = useMemo(() => {
    if (!db || !ulbParam) return null;
    return query(collection(db, 'wasteDetails'), where('mrf', '==', ulbParam), orderBy('date', 'desc'));
  }, [db, ulbParam]);
  
  const { data: records = [] } = useCollection(wasteDetailsQuery) as { data: any[] };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    date: '', routeId: '',
    total: '', plastic: '', paper: '', metal: '', 
    cloth: '', glass: '', sanitation: '', others: '', gpBreakdownRaw: ''
  });

  useEffect(() => { setMounted(true); }, []);

  const yearGroups = ["2026", "2027"];

  const handleOpenAddDialog = () => {
    setEditingRecord(null);
    setFormData({
      date: '', routeId: '', total: '', plastic: '', paper: '', metal: '', 
      cloth: '', glass: '', sanitation: '', others: '', gpBreakdownRaw: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (record: any) => {
    setEditingRecord(record);
    setFormData({
      date: record.date, routeId: record.routeId,
      total: record.driverSubmitted.toString(),
      plastic: record.plastic.toString(), paper: record.paper.toString(),
      metal: record.metal.toString(), cloth: record.cloth.toString(),
      glass: record.glass.toString(), sanitation: record.sanitation.toString(),
      others: record.others.toString(), gpBreakdownRaw: record.gpBreakdown.map((g: any) => `${g.name}:${g.amount}`).join('\n')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'wasteDetails', id));
  };

  const handleSubmit = async () => {
    if (!db) return;
    const gpList = formData.gpBreakdownRaw.split('\n').filter(l => l.includes(':')).map(l => {
      const [name, amount] = l.split(':');
      return { name: name.trim(), amount: parseFloat(amount) || 0 };
    });

    const payload = {
      date: formData.date,
      routeId: formData.routeId,
      mrf: ulbParam,
      block: blockParam,
      district: districtParam,
      totalGpLoad: gpList.reduce((sum, g) => sum + g.amount, 0),
      driverSubmitted: parseFloat(formData.total) || 0,
      plastic: parseFloat(formData.plastic) || 0,
      paper: parseFloat(formData.paper) || 0,
      metal: parseFloat(formData.metal) || 0,
      cloth: parseFloat(formData.cloth) || 0,
      glass: parseFloat(formData.glass) || 0,
      sanitation: parseFloat(formData.sanitation) || 0,
      others: parseFloat(formData.others) || 0,
      gpBreakdown: gpList
    };

    if (editingRecord) {
      await updateDoc(doc(db, 'wasteDetails', editingRecord.id), payload);
    } else {
      await addDoc(collection(db, 'wasteDetails'), payload);
    }
    setIsDialogOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-primary">
              <Calculator className="h-10 w-10" />
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Driver Waste Ledger</CardTitle>
                <CardDescription className="font-bold italic">Official collection history for {driverName}.</CardDescription>
              </div>
            </div>
            <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> New Receipt Entry
            </Button>
          </div>
        </CardHeader>
      </Card>

      {yearGroups.map((year, yIdx) => (
        <div key={yIdx} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/20"></div>
            <h2 className="text-4xl font-black text-primary opacity-20 tracking-tighter">{year} FISCAL</h2>
            <div className="h-px flex-1 bg-primary/20"></div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {MONTHS.map((month) => {
              const monthRecords = records.filter(r => {
                if (!r.date) return false;
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
                        <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px]">{monthRecords.length} CIRCUITS COMPLETED</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      <ScrollArea className="w-full">
                        <div className="min-w-[1500px]">
                          <Table className="border-collapse border text-[10px]">
                            <TableHeader className="bg-muted/80">
                              <TableRow>
                                <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                                <TableHead className="w-[120px] uppercase font-black border">Route ID</TableHead>
                                <TableHead className="w-[180px] uppercase font-black border">Tagged MRF</TableHead>
                                <TableHead className="w-[250px] uppercase font-black border text-right px-6 bg-blue-50/20">GP-wise Breakdown (Click)</TableHead>
                                <TableHead className="w-[120px] text-right uppercase font-black border bg-primary/5 text-primary">Total (Kg)</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Plastic</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Paper</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Metal</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Glass</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Sanitation</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Others</TableHead>
                                <TableHead className="w-[100px] uppercase font-black border text-center">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {monthRecords.map((row: any) => (
                                <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b last:border-0 h-14 transition-colors">
                                  <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.date}</TableCell>
                                  <TableCell className="border-r font-black text-primary uppercase">{row.routeId}</TableCell>
                                  <TableCell className="border-r font-bold uppercase">{row.mrf}</TableCell>
                                  <TableCell className="border-r p-0">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="w-full h-14 flex items-center justify-end px-6 font-bold text-blue-700 hover:bg-blue-50 transition-all underline decoration-dotted underline-offset-4">
                                          View GP Weights
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden">
                                        <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] tracking-widest flex items-center gap-2">
                                          <MapPin className="h-3 w-3" /> Individual GP Weights
                                        </div>
                                        <Table>
                                          <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[8px] uppercase font-black">GP Node</TableHead><TableHead className="text-[8px] uppercase font-black text-right">Kg</TableHead></TableRow></TableHeader>
                                          <TableBody>
                                            {row.gpBreakdown?.map((gp: any, i: number) => (
                                              <TableRow key={i} className="h-10 border-b border-dashed last:border-0"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount}</TableCell></TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </PopoverContent>
                                    </Popover>
                                  </TableCell>
                                  <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02]">{row.driverSubmitted.toFixed(1)} KG</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plastic}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.glass}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.sanitation}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.others}</TableCell>
                                  <TableCell className="border text-center">
                                    <div className="flex justify-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => handleOpenEditDialog(row)}><Edit className="h-3 w-3"/></Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="h-3 w-3"/></Button>
                                    </div>
                                  </TableCell>
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
              );
            })}
          </Accordion>

          <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/20 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight">Yearly Professional Audit: {year}</CardTitle>
                </div>
                <BarChart3 className="h-12 w-12 opacity-30" />
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <Table>
                  <TableHeader className="bg-muted/50">
                      <TableRow>
                          <TableHead className="w-[150px] uppercase font-black border text-center">Collection Freq (Year)</TableHead>
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
                              Yearly Aggregate Audit Data will generate post-December {year}.
                          </TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase">{editingRecord ? 'Edit Entry' : 'Add New Entry'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Route ID</Label><Input value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Total Weight (Kg)</Label><Input type="number" value={formData.total} onChange={e => setFormData({...formData, total: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Plastic (Kg)</Label><Input type="number" value={formData.plastic} onChange={e => setFormData({...formData, plastic: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Paper (Kg)</Label><Input type="number" value={formData.paper} onChange={e => setFormData({...formData, paper: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Metal (Kg)</Label><Input type="number" value={formData.metal} onChange={e => setFormData({...formData, metal: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Cloth (Kg)</Label><Input type="number" value={formData.cloth} onChange={e => setFormData({...formData, cloth: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Glass (Kg)</Label><Input type="number" value={formData.glass} onChange={e => setFormData({...formData, glass: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Sanitation (Kg)</Label><Input type="number" value={formData.sanitation} onChange={e => setFormData({...formData, sanitation: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Others (Kg)</Label><Input type="number" value={formData.others} onChange={e => setFormData({...formData, others: e.target.value})} /></div>
            <div className="md:col-span-2 space-y-1">
              <Label className="text-xs uppercase font-bold">GP Breakdown (GPName:Amount, one per line)</Label>
              <Textarea value={formData.gpBreakdownRaw} onChange={e => setFormData({...formData, gpBreakdownRaw: e.target.value})} rows={3} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} className="font-black uppercase px-8">Save Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DriverWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading collection history...</div>}>
      <DriverWasteDetailsContent />
    </Suspense>
  );
}
