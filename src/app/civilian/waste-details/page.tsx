
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, Calculator, PlusCircle, Trash2, Edit, MapPin, Info, BarChart3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// District Data Imports for Baseline Calculation
import { angulDistrictData } from "@/lib/disAngul";
import { balangirDistrictData } from "@/lib/disBalangir";
import { bhadrakDistrictData } from "@/lib/disBhadrak";
import { bargarhDistrictData } from "@/lib/disBargarh";
import { sonepurDistrictData } from "@/lib/disSonepur";
import { boudhDistrictData } from "@/lib/disBoudh";
import { cuttackDistrictData } from "@/lib/disCuttack";
import { deogarhDistrictData } from "@/lib/disDeogarh";
import { dhenkanalDistrictData } from "@/lib/disDhenkanal";
import { gajapatiDistrictData } from "@/lib/disGajapati";
import { ganjamDistrictData } from "@/lib/disGanjam";
import { jagatsinghpurDistrictData } from "@/lib/disJagatsinghpur";
import { jajpurDistrictData } from "@/lib/disJajpur";
import { jharsugudaDistrictData } from "@/lib/disJharsuguda";
import { kalahandiDistrictData } from "@/lib/disKalahandi";
import { kandhamalDistrictData } from "@/lib/disKandhamal";
import { kendraparaDistrictData } from "@/lib/disKendrapara";
import { kendujharDistrictData } from "@/lib/disKendujhar";
import { balasoreDistrictData } from "@/lib/disBalasore";
import { baleswarDistrictData } from "@/lib/disBaleswar";
import { khordhaDistrictData } from "@/lib/disKhordha";
import { koraputDistrictData } from "@/lib/disKoraput";
import { mayurbhanjDistrictData } from "@/lib/disMayurbhanj";
import { malkangiriDistrictData } from "@/lib/disMalkangiri";
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { puriDistrictData } from "@/lib/disPuri";
import { sambalpurDistrictData } from "@/lib/disSambalpur";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

function DriverWasteDetailsContent() {
  const searchParams = useSearchParams();
  const driverName = searchParams.get('name') || 'Personnel';
  const districtParam = searchParams.get('district') || '';
  const blockParam = searchParams.get('block') || '';
  const ulbParam = searchParams.get('ulb') || '';
  
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  const wasteDetailsQuery = useMemo(() => {
    if (!db) return null;
    // Driver sees all records for their specific MRF
    return query(collection(db, 'wasteDetails'), where('mrf', '==', ulbParam), orderBy('date', 'asc'));
  }, [db, ulbParam]);
  
  const { data: records = [] } = useCollection(wasteDetailsQuery) as { data: any[] };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    date: '', routeId: '', totalGpLoad: '', driverSubmitted: '', plastic: '', paper: '', 
    metal: '', cloth: '', glass: '', sanitation: '', others: '', gpBreakdownRaw: ''
  });

  useEffect(() => { setMounted(true); }, []);

  const blockBaselineAvg = useMemo(() => {
    if (!districtParam || !blockParam) return 0;
    const districtsMap: Record<string, any> = {
        'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
        'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
        'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
        'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
        'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
        'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
        'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
        'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData,
        'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
        'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
    };
    const source = districtsMap[districtParam.toLowerCase()];
    if (!source) return 0;
    const details = source.getBlockDetails(blockParam);
    return details.waste.reduce((sum: number, w: any) => sum + (w.totalWasteKg || 0), 0);
  }, [districtParam, blockParam]);

  const handleOpenAddDialog = () => {
    setEditingRecord(null);
    setFormData({
      date: '', routeId: '', totalGpLoad: '', driverSubmitted: '', plastic: '', paper: '', 
      metal: '', cloth: '', glass: '', sanitation: '', others: '', gpBreakdownRaw: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (record: any) => {
    setEditingRecord(record);
    setFormData({
      date: record.date, routeId: record.routeId,
      totalGpLoad: record.totalGpLoad.toString(),
      driverSubmitted: record.driverSubmitted.toString(),
      plastic: record.plastic.toString(),
      paper: record.paper.toString(),
      metal: record.metal.toString(),
      cloth: record.cloth.toString(),
      glass: record.glass.toString(),
      sanitation: record.sanitation.toString(),
      others: record.others.toString(),
      gpBreakdownRaw: record.gpBreakdown.map((g: any) => `${g.name}:${g.amount}`).join('\n')
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

  const fiscalYears = ["2026", "2027"];

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-primary">
              <Calculator className="h-10 w-10" />
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Driver Waste Ledger</CardTitle>
                <CardDescription className="font-bold italic text-muted-foreground">Official record for {driverName} at {ulbParam}.</CardDescription>
              </div>
            </div>
            <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> New Receipt Entry
            </Button>
          </div>
        </CardHeader>
      </Card>

      {fiscalYears.map((year) => (
        <div key={year} className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/20"></div>
            <h2 className="text-4xl font-black text-primary opacity-20 tracking-tighter">{year} FISCAL</h2>
            <div className="h-px flex-1 bg-primary/20"></div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-6">
            {MONTHS.map((month) => {
              const monthRecords = records.filter(r => {
                if (!r.date) return false;
                const d = new Date(r.date);
                return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }) === month;
              });

              const monthVerified = monthRecords.reduce((sum, r) => sum + r.driverSubmitted, 0);
              const discrepancy = blockBaselineAvg - monthVerified;
              const efficiency = blockBaselineAvg > 0 ? (monthVerified / blockBaselineAvg) * 100 : 0;

              return (
                <AccordionItem value={month} key={month} className="border-none">
                  <Card className="overflow-hidden border-2 shadow-lg">
                    <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                      <div className="flex justify-between w-full pr-8 items-center">
                        <div className="flex items-center gap-4">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                        </div>
                        <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[8px]">{monthRecords.length} RECEIPTS SYNCED</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 space-y-6">
                      <ScrollArea className="w-full">
                        <div className="min-w-[1500px]">
                          <Table className="border-collapse border text-[10px]">
                            <TableHeader className="bg-muted/80">
                              <TableRow>
                                <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                                <TableHead className="w-[120px] uppercase font-black border">Route ID</TableHead>
                                <TableHead className="w-[200px] uppercase font-black border text-right px-6 bg-blue-50/20">GP-wise Breakdown (Click)</TableHead>
                                <TableHead className="w-[150px] text-right uppercase font-black border bg-primary/5 text-primary">Total (Kg)</TableHead>
                                <TableHead className="w-[120px] text-right uppercase font-black border bg-destructive/5 text-destructive">Discrepancy</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Plastic</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Paper</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Metal</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Cloth</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Glass</TableHead>
                                <TableHead className="w-[90px] text-right uppercase font-black border">Sanitation</TableHead>
                                <TableHead className="w-[120px] uppercase font-black border text-center">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {monthRecords.map((row: any) => (
                                <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b last:border-0 h-14 transition-colors">
                                  <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                                  <TableCell className="border-r font-black text-primary uppercase">{row.routeId}</TableCell>
                                  <TableCell className="border-r p-0">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="w-full h-14 flex items-center justify-end px-6 font-bold text-blue-700 hover:bg-blue-50 transition-all underline decoration-dotted underline-offset-4">
                                          {row.totalGpLoad.toFixed(1)} KG
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden" align="end">
                                        <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] tracking-widest flex items-center gap-2">
                                          <MapPin className="h-3 w-3" /> Individual GP Weights
                                        </div>
                                        <Table>
                                          <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-[8px] uppercase font-black">GP Node</TableHead><TableHead className="text-[8px] uppercase font-black text-right">Kg</TableHead></TableRow></TableHeader>
                                          <TableBody>
                                            {row.gpBreakdown?.map((gp: any, i: number) => (
                                              <TableRow key={i} className="h-10 border-b border-dashed last:border-0"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount.toFixed(1)}</TableCell></TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </PopoverContent>
                                    </Popover>
                                  </TableCell>
                                  <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02]">{row.driverSubmitted.toFixed(1)} KG</TableCell>
                                  <TableCell className="border-r text-right font-mono font-black text-destructive">{(row.totalGpLoad - row.driverSubmitted).toFixed(1)} KG</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plastic}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.cloth}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.glass}</TableCell>
                                  <TableCell className="border-r text-right font-mono text-muted-foreground">{row.sanitation}</TableCell>
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

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 pt-0">
                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Block Avg Load (Month)</p>
                            <p className="text-xl font-black">{blockBaselineAvg.toLocaleString()} KG</p>
                        </div>
                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                            <p className="text-[10px] font-black uppercase text-primary mb-1">Total Verified (Self)</p>
                            <p className="text-xl font-black text-primary">{monthVerified.toLocaleString()} KG</p>
                        </div>
                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                            <p className="text-[10px] font-black uppercase text-destructive mb-1">Block Discrepancy</p>
                            <p className="text-xl font-black text-destructive">{discrepancy.toLocaleString()} KG</p>
                        </div>
                        <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-5 shadow-inner">
                            <p className="text-[10px] font-black uppercase text-primary mb-1">Performance Score</p>
                            <p className="text-xl font-black text-primary">{efficiency.toFixed(1)}%</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/20 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight">Yearly Professional Audit: {year}</CardTitle>
                <BarChart3 className="h-12 w-12 opacity-30" />
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <ScrollArea className="w-full">
                <div className="min-w-[1500px]">
                  <Table>
                      <TableHeader className="bg-muted/50">
                          <TableRow>
                              <TableHead className="w-[150px] uppercase font-black border text-center">Collection Freq (Year)</TableHead>
                              <TableHead className="w-[180px] text-right uppercase font-black border">Total Verified (Kg)</TableHead>
                              <TableHead className="w-[120px] text-right uppercase font-black border">Total Paper</TableHead>
                              <TableHead className="w-[120px] text-right uppercase font-black border">Total Plastic</TableHead>
                              <TableHead className="w-[120px] text-right uppercase font-black border">Total Metal</TableHead>
                              <TableHead className="w-[120px] text-right uppercase font-black border">Total Glass</TableHead>
                              <TableHead className="w-[120px] text-right uppercase font-black border">Total Sanitation</TableHead>
                              <TableHead className="w-[120px] text-right uppercase font-black border">Others</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const yearly = records.filter(r => new Date(r.date).getFullYear().toString() === year);
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
                                <TableCell className="border text-center">{totals.freq} Circuits Completed</TableCell>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase">{editingRecord ? 'Edit Entry' : 'Add New Entry'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Route ID</Label><Input value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">GP Load (Total)</Label><Input type="number" value={formData.totalGpLoad} onChange={e => setFormData({...formData, totalGpLoad: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Driver Submitted</Label><Input type="number" value={formData.driverSubmitted} onChange={e => setFormData({...formData, driverSubmitted: e.target.value})} /></div>
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

      <div className="bg-muted/20 border-l-4 border-primary p-6 rounded-r-xl shadow-inner flex items-start gap-4">
        <Info className="h-6 w-6 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-tight">Driver Auditing Guidelines</p>
          <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
            Every verified receipt generated in your portal is synchronized in real-time with the District and State registries. Efficiency scores are calculated based on your circuit's adherence to block-level baseline targets.
          </p>
        </div>
      </div>
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
