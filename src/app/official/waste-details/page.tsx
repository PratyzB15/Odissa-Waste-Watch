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
  block: string;
  district: string;
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

const FISCAL_YEARS = ["2026", "2027"];

function DistrictWasteReconciliationContent() {
  const searchParams = useSearchParams();
  const districtName = searchParams.get('district') || 'District Node';
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  const wasteDetailsQuery = useMemo(() => {
    if (!db || !districtName) return null;
    return query(collection(db, 'wasteDetails'), where('district', '==', districtName), orderBy('date', 'asc'));
  }, [db, districtName]);
  
  const { data: records = [] } = useCollection(wasteDetailsQuery) as { data: CollectionRecord[] };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CollectionRecord | null>(null);
  const [formData, setFormData] = useState({
    date: '', routeId: '', mrf: '', block: '', 
    totalGpLoad: '', driverSubmitted: '', plastic: '', paper: '', 
    metal: '', cloth: '', glass: '', sanitation: '', others: '', gpBreakdownRaw: ''
  });

  useEffect(() => { setMounted(true); }, []);

  const districtStats = useMemo(() => {
    const districtRecords = mrfData.filter(m => m.district.toLowerCase() === districtName.toLowerCase());
    const totalAvg = districtRecords.reduce((sum, m) => sum + m.dryWasteKg, 0);
    const totalVerified = records.reduce((sum, r) => sum + r.driverSubmitted, 0);
    const efficiency = totalAvg > 0 ? (totalVerified / totalAvg) * 100 : 0;
    return { totalAvg, totalVerified, efficiency };
  }, [districtName, records]);

  const blockList = useMemo(() => {
    const blocksSet = new Set(mrfData.filter(m => m.district.toLowerCase() === districtName.toLowerCase()).map(m => m.blockCovered));
    return Array.from(blocksSet).sort();
  }, [districtName]);

  const handleOpenAddDialog = () => {
    setEditingRecord(null);
    setFormData({
      date: '', routeId: '', mrf: '', block: '',
      totalGpLoad: '', driverSubmitted: '', plastic: '', paper: '', 
      metal: '', cloth: '', glass: '', sanitation: '', others: '', gpBreakdownRaw: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (record: CollectionRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date, routeId: record.routeId, mrf: record.mrf, block: record.block,
      totalGpLoad: record.totalGpLoad.toString(), driverSubmitted: record.driverSubmitted.toString(),
      plastic: record.plastic.toString(), paper: record.paper.toString(), metal: record.metal.toString(),
      cloth: record.cloth.toString(), glass: record.glass.toString(), sanitation: record.sanitation.toString(),
      others: record.others.toString(), gpBreakdownRaw: record.gpBreakdown.map(g => `${g.name}:${g.amount}`).join('\n')
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
      mrf: formData.mrf,
      block: formData.block,
      district: districtName,
      totalGpLoad: parseFloat(formData.totalGpLoad) || 0,
      driverSubmitted: parseFloat(formData.driverSubmitted) || 0,
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
        <CardHeader className="bg-primary/5 border-b flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-primary">
            <Calculator className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">District Waste Reconciliation Hub</CardTitle>
              <CardDescription className="font-bold italic text-muted-foreground">Comprehensive block-level oversight for {districtName}.</CardDescription>
            </div>
          </div>
          <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-background border-2 border-dashed rounded-xl p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">District Load Baseline (Avg)</p>
                <p className="text-3xl font-black text-foreground">{districtStats.totalAvg.toLocaleString()} KG</p>
            </div>
            <div className="bg-background border-2 border-dashed rounded-xl p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase text-primary mb-1">Total Verified (District)</p>
                <p className="text-3xl font-black text-primary">{districtStats.totalVerified.toLocaleString()} KG</p>
            </div>
            <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-6 shadow-inner">
                <p className="text-[10px] font-black uppercase text-primary mb-1">District Efficacy Score</p>
                <p className="text-3xl font-black text-primary">{districtStats.efficiency.toFixed(1)}%</p>
            </div>
        </CardContent>
      </Card>

      {blockList.map((block) => {
        const blockAvgLoad = mrfData.filter(m => m.blockCovered === block && m.district.toLowerCase() === districtName.toLowerCase()).reduce((sum, m) => sum + m.dryWasteKg, 0);

        return (
            <Card key={block} className="border-2 shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="h-7 w-7 text-primary" />
                  <CardTitle className="text-xl font-black uppercase text-primary">Block Node: {block}</CardTitle>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase text-[10px] bg-primary/5 px-4 py-1">
                  Block Target: {blockAvgLoad.toLocaleString()} Kg (Avg)
                </Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-12">
                {FISCAL_YEARS.map((year) => (
                    <div key={year} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-primary opacity-20 tracking-tighter uppercase">{year} FISCAL</h2>
                            <div className="h-px flex-1 bg-primary/10"></div>
                        </div>

                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {MONTHS.map((month) => {
                                const monthRecords = records.filter(r => {
                                    if (!r.date) return false;
                                    const d = new Date(r.date);
                                    return d.getFullYear().toString() === year && 
                                           d.toLocaleString('default', { month: 'long' }) === month && 
                                           r.block === block;
                                });

                                const verifiedMonthTotal = monthRecords.reduce((sum, r) => sum + r.driverSubmitted, 0);

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
                                                        {monthRecords.length} RECEIPTS LOGGED
                                                    </Badge>
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
                                                                    <TableHead className="w-[120px] uppercase font-black border text-center">Actions</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {monthRecords.map((row) => (
                                                                    <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b last:border-0 h-14 transition-colors">
                                                                        <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
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
                                                                                        <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[8px] uppercase font-black">GP Node</TableHead><TableHead className="text-[8px] uppercase font-black text-right">Load (Kg)</TableHead></TableRow></TableHeader>
                                                                                        <TableBody>
                                                                                            {row.gpBreakdown?.map((gp, i) => (
                                                                                                <TableRow key={i} className="h-10 border-b border-dashed last:border-0"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount.toFixed(1)}</TableCell></TableRow>
                                                                                            ))}
                                                                                        </TableBody>
                                                                                    </Table>
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
                                                                        <TableCell className="border-r text-right font-mono">{row.others}</TableCell>
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

                                                <div className="bg-muted/30 border-t p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                    <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Block Baseline (Avg)</p>
                                                        <p className="text-xl font-black">{blockAvgLoad.toLocaleString()} KG</p>
                                                    </div>
                                                    <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase text-primary mb-1">Verified Total</p>
                                                        <p className="text-xl font-black text-primary">{verifiedMonthTotal.toFixed(1)} KG</p>
                                                    </div>
                                                    <div className="bg-background border-2 border-dashed rounded-xl p-4 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase text-destructive mb-1">Monthly Variance</p>
                                                        <p className="text-xl font-black text-destructive">{(blockAvgLoad - verifiedMonthTotal).toFixed(1)} KG</p>
                                                    </div>
                                                    <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-4 shadow-inner">
                                                        <p className="text-[10px] font-black uppercase text-primary mb-1">Efficiency Score</p>
                                                        <p className="text-xl font-black text-primary">{(blockAvgLoad > 0 ? (verifiedMonthTotal / blockAvgLoad) * 100 : 0).toFixed(1)}%</p>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </Card>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>

                        <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden">
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
                                                {(() => {
                                                  const yearly = records.filter(r => new Date(r.date).getFullYear().toString() === year && r.block === block);
                                                  const isYearDone = yearly.length > 0 && yearly.some(r => new Date(r.date).getMonth() === 11);
                                                  
                                                  if (!isYearDone) {
                                                    return <TableRow><TableCell colSpan={8} className="h-32 text-center italic font-black uppercase tracking-widest opacity-20">Yearly Aggregate Audit Data will generate post-December {year}.</TableCell></TableRow>;
                                                  }

                                                  const totals = yearly.reduce((acc, curr) => ({
                                                    freq: acc.freq + 1,
                                                    verified: acc.verified + curr.driverSubmitted,
                                                    paper: acc.paper + curr.paper,
                                                    plastic: acc.plastic + curr.plastic,
                                                    metal: acc.metal + curr.metal,
                                                    glass: acc.glass + curr.glass,
                                                    sani: acc.sani + curr.sanitation,
                                                    others: acc.others + curr.others
                                                  }), { freq: 0, verified: 0, paper: 0, plastic: 0, metal: 0, glass: 0, sani: 0, others: 0 });

                                                  return (
                                                    <TableRow className="bg-primary/5 font-black text-primary">
                                                        <TableCell className="border text-center">{totals.freq} Circuits</TableCell>
                                                        <TableCell className="border text-right">{totals.verified.toFixed(1)} KG</TableCell>
                                                        <TableCell className="border text-right">{totals.paper.toFixed(1)}</TableCell>
                                                        <TableCell className="border text-right">{totals.plastic.toFixed(1)}</TableCell>
                                                        <TableCell className="border text-right">{totals.metal.toFixed(1)}</TableCell>
                                                        <TableCell className="border text-right">{totals.glass.toFixed(1)}</TableCell>
                                                        <TableCell className="border text-right">{totals.sani.toFixed(1)}</TableCell>
                                                        <TableCell className="border text-right">{totals.others.toFixed(1)}</TableCell>
                                                    </TableRow>
                                                  );
                                                })()}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase">{editingRecord ? 'Edit Entry' : 'Add New Entry'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Route ID</Label><Input value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Block</Label><Input value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">MRF</Label><Input value={formData.mrf} onChange={e => setFormData({...formData, mrf: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">GP Load (Total)</Label><Input type="number" value={formData.totalGpLoad} onChange={e => setFormData({...formData, totalGpLoad: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Driver Submitted</Label><Input type="number" value={formData.driverSubmitted} onChange={e => setFormData({...formData, driverSubmitted: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Plastic (Kg)</Label><Input type="number" value={formData.plastic} onChange={e => setFormData({...formData, plastic: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Paper (Kg)</Label><Input type="number" value={formData.paper} onChange={e => setFormData({...formData, paper: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Metal (Kg)</Label><Input type="number" value={formData.metal} onChange={e => setFormData({...formData, metal: e.target.value})} /></div>
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

export default function DistrictWasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading district reconciliation hub...</div>}>
      <DistrictWasteReconciliationContent />
    </Suspense>
  );
}
