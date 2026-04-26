
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
  BarChart3,
  PlusCircle,
  Edit,
  Trash2,
} from "lucide-react";
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

const FISCAL_YEARS = ["2026", "2027"];

function GpUlbWasteDetailsContent() {
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || '';
  const districtParam = searchParams.get('district') || '';
  
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  const wasteDetailsQuery = useMemo(() => {
    if (!db || !ulbParam) return null;
    return query(collection(db, 'wasteDetails'), where('mrf', '==', ulbParam), orderBy('date', 'asc'));
  }, [db, ulbParam]);
  
  const { data: allRecords = [] } = useCollection(wasteDetailsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    date: '', routeId: '', district: districtParam, block: '', mrf: ulbParam, 
    totalKg: '', plasticGm: '', paper: '', metal: '', cloth: '', glass: '', sanitation: '', others: ''
  });

  useEffect(() => { setMounted(true); }, []);

  const baselineAvg = useMemo(() => {
    if (!districtParam || !ulbParam) return 0;
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

    const mappedGps = source.data.gpMappings.filter((m: any) => 
        m.taggedUlb.toLowerCase().trim().includes(ulbParam.toLowerCase().trim()) ||
        ulbParam.toLowerCase().trim().includes(m.taggedUlb.toLowerCase().trim())
    );
    return mappedGps.reduce((sum: number, gp: any) => {
        const w = source.data.wasteGeneration.find((wg: any) => wg.gpName.toLowerCase() === gp.gpName.toLowerCase());
        const kg = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000)) : 0;
        return sum + kg;
    }, 0);
  }, [districtParam, ulbParam]);

  const handleOpenEditDialog = (record: any) => {
    setEditingRecord(record);
    setFormData({
      date: record.date, routeId: record.routeId, district: record.district, block: record.block, mrf: record.mrf,
      totalKg: record.driverSubmitted.toString(),
      plasticGm: record.plastic.toString(),
      paper: record.paper.toString(),
      metal: record.metal.toString(),
      cloth: record.cloth ? record.cloth.toString() : '0',
      glass: record.glass.toString(),
      sanitation: record.sanitation.toString(),
      others: record.others.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'wasteDetails', id));
  };

  const handleSubmit = async () => {
    if (!db) return;
    const payload = {
      date: formData.date,
      routeId: formData.routeId,
      mrf: formData.mrf,
      district: formData.district,
      block: formData.block,
      driverSubmitted: parseFloat(formData.totalKg) || 0,
      plastic: parseFloat(formData.plasticGm) || 0,
      paper: parseFloat(formData.paper) || 0,
      metal: parseFloat(formData.metal) || 0,
      cloth: parseFloat(formData.cloth) || 0,
      glass: parseFloat(formData.glass) || 0,
      sanitation: parseFloat(formData.sanitation) || 0,
      others: parseFloat(formData.others) || 0,
    };
    await updateDoc(doc(db, 'wasteDetails', editingRecord.id), payload);
    setIsDialogOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3 text-primary">
            <Calculator className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Waste Reconciliation Ledger</CardTitle>
              <CardDescription className="font-bold italic text-muted-foreground">Authoritative audit hub for {ulbParam}.</CardDescription>
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

            <Accordion type="single" collapsible className="w-full space-y-8">
                {MONTHS.map((month, mIdx) => {
                    const monthItems = allRecords.filter(r => {
                        if (!r.date) return false;
                        const d = new Date(r.date);
                        return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }) === month;
                    });

                    if (year === '2026' && mIdx < 3) return null;

                    // Reconciliation Logic
                    const reconciledRecords = monthItems.filter(r => r.submittedByRole === 'driver').map(driverRec => {
                        const matchingGPs = monthItems.filter(r => r.submittedByRole === 'gp' && r.date === driverRec.date && r.routeId === driverRec.routeId);
                        const totalFromGPs = matchingGPs.reduce((sum, r) => sum + (r.driverSubmitted || 0), 0);
                        return {
                            ...driverRec,
                            reconciledGpTotal: totalFromGPs,
                            gpBreakdownDetailed: matchingGPs.map(m => ({ name: m.gpName, amount: m.driverSubmitted }))
                        };
                    });

                    const monthVerified = reconciledRecords.reduce((sum, r) => sum + (r.driverSubmitted || 0), 0);
                    const discrepancy = baselineAvg - monthVerified;
                    const efficiency = baselineAvg > 0 ? (monthVerified / baselineAvg) * 100 : 0;

                    return (
                        <AccordionItem value={`${year}-${month}`} key={`${year}-${month}`} className="border-none">
                            <Card className="overflow-hidden border-2 shadow-xl">
                                <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                                    <div className="flex justify-between w-full pr-8 items-center">
                                        <div className="flex items-center gap-4">
                                            <Calendar className="h-6 w-6 text-primary" />
                                            <span className="font-black text-xl uppercase tracking-tighter text-foreground">{month}</span>
                                        </div>
                                        <Badge variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[8px] bg-primary/5 px-4 py-1">
                                            {reconciledRecords.length} RECEIPTS VERIFIED
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0 bg-background">
                                    <ScrollArea className="w-full">
                                        <div className="min-w-[1600px]">
                                            <Table className="border-collapse border text-[10px]">
                                                <TableHeader className="bg-muted/80">
                                                    <TableRow>
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
                                                        <TableHead className="w-[180px] uppercase font-black border">Facility (MRF)</TableHead>
                                                        <TableHead className="w-[200px] uppercase font-black border text-right px-6 bg-blue-50/20">Total Waste from GPs (Click)</TableHead>
                                                        <TableHead className="w-[150px] text-right uppercase font-black border bg-primary/5 text-primary">Driver Submitted (Kg)</TableHead>
                                                        <TableHead className="w-[120px] text-right uppercase font-black border bg-destructive/5 text-destructive">Discrepancy</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Plastic</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Paper</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Metal</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Cloth</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Glass</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Sanitation</TableHead>
                                                        <TableHead className="w-[100px] uppercase font-black border text-center">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {reconciledRecords.map((row) => (
                                                        <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b last:border-0 h-16 transition-colors">
                                                            <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                                                            <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
                                                            <TableCell className="border-r font-bold uppercase">{row.mrf}</TableCell>
                                                            <TableCell className="border-r p-0">
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button className="w-full h-16 flex items-center justify-end px-6 font-bold text-blue-700 hover:bg-blue-50 underline decoration-dotted underline-offset-4 uppercase">
                                                                            {row.reconciledGpTotal.toFixed(1)} KG
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-72 p-0 border-2 shadow-2xl overflow-hidden" align="end">
                                                                        <div className="bg-blue-700 text-white p-3 font-black uppercase text-[9px] flex items-center gap-2">
                                                                            <MapPin className="h-3 w-3" /> GP Contribution Breakdown
                                                                        </div>
                                                                        <Table>
                                                                            <TableBody>
                                                                                {row.gpBreakdownDetailed?.map((gp: any, i: number) => (
                                                                                    <TableRow key={i} className="h-10 border-b border-dashed"><TableCell className="text-[9px] font-bold uppercase">{gp.name}</TableCell><TableCell className="text-right font-mono font-black text-blue-700">{gp.amount?.toFixed(1)}</TableCell></TableRow>                                                                                                ))}
                                                                                {row.gpBreakdownDetailed.length === 0 && <TableRow><TableCell colSpan={2} className="text-center py-4 text-[9px] italic opacity-40">No GP receipts matched for this circuit/date.</TableCell></TableRow>}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </TableCell>
                                                            <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02] text-sm">{row.driverSubmitted?.toFixed(1)} KG</TableCell>
                                                            <TableCell className="border-r text-right font-mono font-black text-destructive">{(row.reconciledGpTotal - row.driverSubmitted).toFixed(1)} KG</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.plastic}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.paper}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.metal}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.cloth}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.glass}</TableCell>
                                                            <TableCell className="border-r text-right font-mono">{row.sanitation}</TableCell>
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

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-muted/5 border-t">
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">ULB Load on Avg (Month)</p>
                                            <p className="text-2xl font-black">{baselineAvg.toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-primary mb-1">Total ULB Verified</p>
                                            <p className="text-2xl font-black text-primary">{monthVerified.toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-destructive mb-1">ULB Discrepancy</p>
                                            <p className="text-2xl font-black text-destructive">{discrepancy.toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-primary text-primary-foreground rounded-xl p-5 shadow-lg">
                                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Efficiency Score</p>
                                            <p className="text-3xl font-black">{efficiency.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            <Card className="mt-12 border-4 border-dashed border-primary/30 bg-muted/5 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-dashed border-primary/20 pb-8">
                    <CardTitle className="text-4xl font-black font-headline uppercase tracking-tight text-primary/40 flex items-center gap-4">
                        <BarChart3 className="h-12 w-12" /> Yearly Professional Audit: {year}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="w-full">
                        <div className="min-w-[1600px]">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[150px] uppercase font-black border text-center">Route ID</TableHead>
                                        <TableHead className="w-[200px] uppercase font-black border">Associated MRF</TableHead>
                                        <TableHead className="w-[150px] uppercase font-black border text-center">Coll. Freq (Year)</TableHead>
                                        <TableHead className="w-[180px] text-right uppercase font-black border bg-primary/5">Total Collected (Kg)</TableHead>
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
                                      const yearly = allRecords.filter(r => new Date(r.date).getFullYear().toString() === year && r.submittedByRole === 'driver');
                                      const isYearDone = yearly.length > 0 && yearly.some(r => new Date(r.date).getMonth() === 11);
                                      
                                      if (!isYearDone && year === '2026') {
                                        return <TableRow><TableCell colSpan={10} className="h-48 text-center italic font-black uppercase tracking-[0.3em] opacity-10 text-2xl">Yearly Audit Data Pending Cycle Completion</TableCell></TableRow>;
                                      }

                                      const routesMap = new Map();
                                      yearly.forEach(r => {
                                          const id = r.routeId || 'TBD';
                                          const prev = routesMap.get(id) || { count: 0, received: 0, paper: 0, plastic: 0, metal: 0, glass: 0, sani: 0, other: 0, mrf: r.mrf };
                                          routesMap.set(id, {
                                              ...prev,
                                              count: prev.count + 1,
                                              received: prev.received + (r.driverSubmitted || 0),
                                              paper: prev.paper + (r.paper || 0),
                                              plastic: prev.plastic + (r.plastic || 0),
                                              metal: prev.metal + (r.metal || 0),
                                              glass: prev.glass + (r.glass || 0),
                                              sani: prev.sani + (r.sanitation || 0),
                                              other: prev.other + (r.others || 0)
                                          });
                                      });

                                      return Array.from(routesMap.entries()).map(([id, stats]) => (
                                        <TableRow key={id} className="bg-primary/5 font-black text-primary h-16 hover:bg-primary/10 transition-colors">
                                            <TableCell className="border text-center font-mono">{id}</TableCell>
                                            <TableCell className="border uppercase flex items-center gap-2 pt-5"><Building className="h-4 w-4 opacity-40"/>{stats.mrf}</TableCell>
                                            <TableCell className="border text-center">{stats.count} Submissions</TableCell>
                                            <TableCell className="border text-right text-lg">{stats.received.toFixed(1)} KG</TableCell>
                                            <TableCell className="border text-right">{stats.paper.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.plastic.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.metal.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.glass.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.sani.toFixed(1)}</TableCell>
                                            <TableCell className="border text-right">{stats.other.toFixed(1)}</TableCell>
                                        </TableRow>
                                      ));
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-4 shadow-2xl">
          <DialogHeader className="border-b pb-4"><DialogTitle className="text-2xl font-black uppercase text-primary">Nodal Receipt Correction</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-8">
            <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">Route ID</Label><Input value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} className="font-mono" /></div>
            <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">Tagged MRF</Label><Input value={formData.mrf} onChange={e => setFormData({...formData, mrf: e.target.value})} /></div>
            <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">Driver Weight (Kg)</Label><Input type="number" value={formData.totalKg} onChange={e => setFormData({...formData, totalKg: e.target.value})} className="font-mono" /></div>
            <div className="grid grid-cols-3 gap-4 col-span-2 border-t pt-4">
              <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">Plastic</Label><Input type="number" value={formData.plasticGm} onChange={e => setFormData({...formData, plasticGm: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">Paper</Label><Input type="number" value={formData.paper} onChange={e => setFormData({...formData, paper: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">Metal</Label><Input type="number" value={formData.metal} onChange={e => setFormData({...formData, metal: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter className="bg-muted/30 p-6 rounded-xl -mx-6 -mb-6"><Button onClick={handleSubmit} className="font-black uppercase px-12 h-12 text-lg shadow-xl">Apply Audit Correction</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WasteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading nodal registry...</div>}>
      <GpUlbWasteDetailsContent />
    </Suspense>
  );
}
