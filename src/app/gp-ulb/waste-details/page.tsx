
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
  Info
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

function GpUlbWasteDetailsContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const gpParam = searchParams.get('gp') || '';
  const ulbParam = searchParams.get('ulb') || '';
  const districtParam = searchParams.get('district') || '';
  const blockParam = searchParams.get('block') || '';
  
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  const wasteDetailsQuery = useMemo(() => {
    if (!db) return null;
    if (role === 'ulb') {
        return query(collection(db, 'wasteDetails'), where('mrf', '==', ulbParam), orderBy('date', 'asc'));
    }
    return query(collection(db, 'wasteDetails'), orderBy('date', 'asc'));
  }, [db, ulbParam, role]);
  
  const { data: allRecords = [] } = useCollection(wasteDetailsQuery);

  const records = useMemo(() => {
    if (role === 'gp') {
        return allRecords.filter((r: any) => 
            r.gpBreakdown?.some((g: any) => g.name.toLowerCase().trim() === gpParam.toLowerCase().trim())
        );
    }
    return allRecords;
  }, [allRecords, gpParam, role]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    date: '', routeId: '', district: districtParam, block: blockParam, mrf: ulbParam, 
    totalKg: '', plasticGm: '', paper: '', metal: '', cloth: '', glass: '', sanitation: '', others: ''
  });

  useEffect(() => { setMounted(true); }, []);

  const baselineAvg = useMemo(() => {
    if (!districtParam || (!blockParam && !ulbParam)) return 0;
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

    if (role === 'gp') {
        const details = source.getGpDetails(gpParam);
        const totalKg = details.waste ? (details.waste.totalWasteKg || (details.waste.monthlyWasteTotalGm / 1000)) : 0;
        return totalKg;
    } else {
        // ULB Baseline = Sum of all associated GP targets
        const mappedGps = source.data.gpMappings.filter((m: any) => 
            m.taggedUlb.toLowerCase().trim().includes(ulbParam.toLowerCase().trim()) ||
            ulbParam.toLowerCase().trim().includes(m.taggedUlb.toLowerCase().trim())
        );
        return mappedGps.reduce((sum: number, gp: any) => {
            const w = source.data.wasteGeneration.find((wg: any) => wg.gpName.toLowerCase() === gp.gpName.toLowerCase());
            const kg = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000)) : 0;
            return sum + kg;
        }, 0);
    }
  }, [districtParam, blockParam, ulbParam, gpParam, role]);

  const handleOpenAddDialog = () => {
    setEditingRecord(null);
    setFormData({
      date: '', routeId: '', district: districtParam, block: blockParam, mrf: ulbParam, 
      totalKg: '', plasticGm: '', paper: '', metal: '', cloth: '', glass: '', sanitation: '', others: ''
    });
    setIsDialogOpen(true);
  };

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
      totalGpLoad: parseFloat(formData.totalKg) || 0,
      plastic: parseFloat(formData.plasticGm) || 0,
      paper: parseFloat(formData.paper) || 0,
      metal: parseFloat(formData.metal) || 0,
      cloth: parseFloat(formData.cloth) || 0,
      glass: parseFloat(formData.glass) || 0,
      sanitation: parseFloat(formData.sanitation) || 0,
      others: parseFloat(formData.others) || 0,
      gpBreakdown: role === 'gp' ? [{ name: gpParam, amount: parseFloat(formData.totalKg) || 0 }] : []
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
        <CardHeader className="bg-primary/5 border-b flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-primary">
            <Calculator className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Waste Audit Ledger: {role === 'gp' ? gpParam : ulbParam}</CardTitle>
              <CardDescription className="font-bold italic text-muted-foreground">Verification Node: {districtParam} / {blockParam}</CardDescription>
            </div>
          </div>
          <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
              <PlusCircle className="mr-2 h-5 w-5" /> New Entry
          </Button>
        </CardHeader>
      </Card>

      {fiscalYears.map((year) => (
        <div key={year} className="space-y-8">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-primary opacity-20 tracking-tighter uppercase">{year} FISCAL CYCLE</h2>
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

                    return (
                        <AccordionItem value={month} key={month} className="border-none">
                            <Card className="overflow-hidden border-2 shadow-lg">
                                <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
                                    <div className="flex justify-between w-full pr-8 items-center">
                                        <div className="flex items-center gap-4">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <span className="font-black text-lg uppercase tracking-tighter text-foreground">{month}</span>
                                        </div>
                                        <Badge variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[8px] bg-primary/5 px-3">
                                            {monthRecords.length} RECEIPTS SYNCED
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
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">District</TableHead>
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Block</TableHead>
                                                        <TableHead className="w-[180px] uppercase font-black border">Tagged MRF</TableHead>
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
                                                        <TableHead className="w-[150px] text-right uppercase font-black border bg-primary/5 text-primary">Total (Kg)</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Plastic (gm)</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Paper</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Metal</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Cloth</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Glass</TableHead>
                                                        <TableHead className="w-[90px] text-right uppercase font-black border">Sanitation</TableHead>
                                                        <TableHead className="w-[120px] uppercase font-black border text-center">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {monthRecords.map((row) => (
                                                        <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b last:border-0 h-16 transition-colors">
                                                            <TableCell className="border-r font-mono text-center font-bold">{row.date}</TableCell>
                                                            <TableCell className="border-r text-center uppercase font-bold">{row.district}</TableCell>
                                                            <TableCell className="border-r text-center uppercase font-bold">{row.block}</TableCell>
                                                            <TableCell className="border-r font-bold uppercase">{row.mrf}</TableCell>
                                                            <TableCell className="border-r font-black text-primary uppercase text-center">{row.routeId}</TableCell>
                                                            <TableCell className="border-r text-right font-mono font-black text-primary bg-primary/[0.02] text-sm">{row.driverSubmitted.toFixed(1)} KG</TableCell>
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
                                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Nodal Avg Load (Month)</p>
                                            <p className="text-xl font-black">{baselineAvg.toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-primary mb-1">Total Verified</p>
                                            <p className="text-xl font-black text-primary">{monthVerified.toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-background border-2 border-dashed rounded-xl p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-destructive mb-1">Nodal Discrepancy</p>
                                            <p className="text-xl font-black text-destructive">{(baselineAvg - monthVerified).toLocaleString()} KG</p>
                                        </div>
                                        <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-5 shadow-inner">
                                            <p className="text-[10px] font-black uppercase text-primary mb-1">Efficiency Score</p>
                                            <p className="text-xl font-black text-primary">{(baselineAvg > 0 ? (monthVerified / baselineAvg) * 100 : 0).toFixed(1)}%</p>
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
                        <BarChart3 className="h-10 w-10" /> Yearly Audit Summary: {year}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="w-full">
                        <div className="min-w-[1600px]">
                            <Table className="text-muted-foreground">
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[150px] uppercase font-black border text-center">Route ID</TableHead>
                                        <TableHead className="w-[180px] uppercase font-black border">Associated MRF</TableHead>
                                        <TableHead className="w-[150px] uppercase font-black border text-center">Freq (Year)</TableHead>
                                        <TableHead className="w-[180px] text-right uppercase font-black border">Total Collected (Kg)</TableHead>
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
                                        return <TableRow><TableCell colSpan={10} className="h-32 text-center italic font-black uppercase tracking-widest opacity-20">Yearly Audit Data will populate post-December {year}.</TableCell></TableRow>;
                                      }

                                      const routesMap = new Map();
                                      yearly.forEach(r => {
                                          const id = r.routeId || 'TBD';
                                          const prev = routesMap.get(id) || { count: 0, received: 0, paper: 0, plastic: 0, metal: 0, glass: 0, sani: 0, other: 0, mrf: r.mrf };
                                          routesMap.set(id, {
                                              ...prev,
                                              count: prev.count + 1,
                                              received: prev.received + r.driverSubmitted,
                                              paper: prev.paper + r.paper,
                                              plastic: prev.plastic + r.plastic,
                                              metal: prev.metal + r.metal,
                                              glass: prev.glass + r.glass,
                                              sani: prev.sani + r.sanitation,
                                              other: prev.other + r.others
                                          });
                                      });

                                      return Array.from(routesMap.entries()).map(([id, stats]) => (
                                        <TableRow key={id} className="bg-primary/5 font-black text-primary h-14">
                                            <TableCell className="border text-center">{id}</TableCell>
                                            <TableCell className="border uppercase">{stats.mrf}</TableCell>
                                            <TableCell className="border text-center">{stats.count} Receipts</TableCell>
                                            <TableCell className="border text-right">{stats.received.toFixed(1)} KG</TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase">{editingRecord ? 'Edit Entry' : 'Add New Entry'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Route ID</Label><Input value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Tagged MRF</Label><Input value={formData.mrf} onChange={e => setFormData({...formData, mrf: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">District</Label><Input value={formData.district} disabled className="bg-muted/20" /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Block</Label><Input value={formData.block} disabled className="bg-muted/20" /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Total (Kg)</Label><Input type="number" value={formData.totalKg} onChange={e => setFormData({...formData, totalKg: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Plastic (gm)</Label><Input type="number" value={formData.plasticGm} onChange={e => setFormData({...formData, plasticGm: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Paper (Kg)</Label><Input type="number" value={formData.paper} onChange={e => setFormData({...formData, paper: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Metal (Kg)</Label><Input type="number" value={formData.metal} onChange={e => setFormData({...formData, metal: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Cloth (Kg)</Label><Input type="number" value={formData.cloth} onChange={e => setFormData({...formData, cloth: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Glass (Kg)</Label><Input type="number" value={formData.glass} onChange={e => setFormData({...formData, glass: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Sanitation (Kg)</Label><Input type="number" value={formData.sanitation} onChange={e => setFormData({...formData, sanitation: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-xs uppercase font-bold">Others (Kg)</Label><Input type="number" value={formData.others} onChange={e => setFormData({...formData, others: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} className="font-black uppercase px-8">Save Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-muted/20 border-l-4 border-primary p-6 rounded-r-xl shadow-inner flex items-start gap-4">
        <Info className="h-6 w-6 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-tight">Audit Governance</p>
          <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
            Data is strictly synchronized with the Master State Ledger. Discrepancies are calculated based on official nodal generation baselines for {role === 'gp' ? gpParam : ulbParam}.
          </p>
        </div>
      </div>
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
