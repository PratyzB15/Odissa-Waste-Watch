
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { mrfData } from "@/lib/mrf-data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, PlusCircle, Edit, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// District Data Imports
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
import { malkangiriDistrictData } from "@/lib/disMalkangiri";
import { mayurbhanjDistrictData } from "@/lib/disMayurbhanj";
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { puriDistrictData } from "@/lib/disPuri";
import { sambalpurDistrictData } from "@/lib/disSambalpur";

function GPInformationContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const districtName = searchParams.get('district') || '';
  const blockParam = searchParams.get('block');
  const role = searchParams.get('role');
  const isAuthorized = role === 'block' || role === 'district';

  const [mounted, setMounted] = useState(false);
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    ulbName: '',
    mrfName: '',
    gpName: '',
    households: '',
    schools: '',
    anganwadis: '',
    commercial: '',
    dailyWaste: '',
    monthlyWaste: ''
  });

  useEffect(() => {
    setMounted(true);
    const districtsSourceMap: Record<string, any> = {
        'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
        'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
        'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
        'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
        'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
        'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
        'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
        'koraput': koraputDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData,
        'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
        'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
    };
    
    const source = districtsSourceMap[districtName.toLowerCase()];
    if (!source) return;

    let gps = [];
    let wasteList = [];

    if (blockParam) {
        const details = source.getBlockDetails(blockParam);
        gps = details.gps;
        wasteList = details.waste;
    } else {
        gps = source.data.gpMappings;
        wasteList = source.data.wasteGeneration;
    }
    
    if (gps) {
        const formatted = gps.map((gp: any, idx: number) => {
            const wasteInfo = wasteList.find((w: any) => w.gpName.toLowerCase() === gp.gpName.toLowerCase());
            return {
                id: idx,
                ulbName: gp.taggedUlb,
                mrfName: gp.taggedMrf,
                gpName: gp.gpName,
                households: wasteInfo?.totalHouseholds || 0,
                schools: wasteInfo?.schools || 0,
                anganwadis: wasteInfo?.anganwadis || 0,
                commercial: wasteInfo?.commercial || 0,
                dailyWaste: wasteInfo ? (wasteInfo.dailyWasteTotalGm || (wasteInfo.totalWasteKg ? wasteInfo.totalWasteKg * 1000 / 30 : 0)) : 0,
                monthlyWaste: wasteInfo ? (wasteInfo.monthlyWasteTotalGm || (wasteInfo.totalWasteKg ? wasteInfo.totalWasteKg * 1000 : 0)) : 0
            };
        });
        setReportRows(formatted);
    }
  }, [districtName, blockParam]);

  const handleOpenAddDialog = () => {
    setEditingRow(null);
    setFormData({ 
      ulbName: '', mrfName: '', gpName: '', households: '', schools: '', 
      anganwadis: '', commercial: '', dailyWaste: '', monthlyWaste: '' 
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (row: any) => {
    setEditingRow(row);
    setFormData({
        ulbName: row.ulbName, mrfName: row.mrfName, gpName: row.gpName,
        households: row.households.toString(),
        schools: row.schools.toString(),
        anganwadis: row.anganwadis.toString(),
        commercial: row.commercial.toString(),
        dailyWaste: row.dailyWaste.toString(),
        monthlyWaste: row.monthlyWaste.toString()
    });
    setIsDialogOpen(true);
  };

  const handleRemove = (id: number) => {
    setReportRows(prev => prev.filter(r => r.id !== id));
    toast({ title: "Entry Removed", description: "GP survey record deleted." });
  };

  const handleSubmit = () => {
    const row = {
        ...formData,
        id: editingRow ? editingRow.id : Date.now(),
        households: parseFloat(formData.households) || 0,
        schools: parseFloat(formData.schools) || 0,
        anganwadis: parseFloat(formData.anganwadis) || 0,
        dailyWaste: parseFloat(formData.dailyWaste) || 0,
        monthlyWaste: parseFloat(formData.monthlyWaste) || 0,
    };
    if (editingRow) {
        setReportRows(prev => prev.map(r => r.id === editingRow.id ? row : r));
        toast({ title: "Update Successful", description: "Survey metrics synchronized." });
    } else {
        setReportRows(prev => [...prev, row]);
        toast({ title: "New Entry Added", description: "New GP node integrated." });
    }
    setIsDialogOpen(false);
  };

  if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing survey metrics...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <ClipboardList className="h-10 w-10 text-primary" />
                <div>
                <CardTitle className="text-2xl font-bold font-headline uppercase tracking-tight">Information about GPs: {districtName}</CardTitle>
                <CardDescription>Official quantification survey data for constituent Gram Panchayats.</CardDescription>
                </div>
            </div>
            {isAuthorized && (
                <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
            <ScrollArea className="w-full">
                <div className="min-w-[1400px]">
                <Table className="border-collapse border text-[10px]">
                    <TableHeader className="bg-muted/80">
                    <TableRow>
                        <TableHead className="w-[60px] text-center border font-black uppercase">S.No.</TableHead>
                        <TableHead className="border font-black uppercase">Facility (ULB/MRF)</TableHead>
                        <TableHead className="border font-black uppercase">GP Node</TableHead>
                        <TableHead className="border font-black uppercase text-center">Households</TableHead>
                        <TableHead className="border font-black uppercase text-center">Schools</TableHead>
                        <TableHead className="border font-black uppercase text-center">Anganwadis</TableHead>
                        <TableHead className="border font-black uppercase text-center">Comm. Est.</TableHead>
                        <TableHead className="border font-black uppercase text-right px-4">Waste/Day (Gm)</TableHead>
                        <TableHead className="border font-black uppercase text-right px-4">Waste/Month (Gm)</TableHead>
                        {isAuthorized && <TableHead className="w-[120px] border font-black uppercase text-center">Actions</TableHead>}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {reportRows.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-primary/[0.02] border-b h-12">
                        <TableCell className="text-center border-r font-mono">{idx + 1}</TableCell>
                        <TableCell className="border-r font-bold uppercase leading-tight">
                            <p className="text-primary">{row.mrfName}</p>
                            <p className="text-[8px] text-muted-foreground italic">{row.ulbName}</p>
                        </TableCell>
                        <TableCell className="border-r font-black uppercase text-foreground">{row.gpName}</TableCell>
                        <TableCell className="text-center border-r font-mono font-bold text-sm">{row.households.toLocaleString()}</TableCell>
                        <TableCell className="text-center border-r font-mono">{row.schools}</TableCell>
                        <TableCell className="text-center border-r font-mono">{row.anganwadis}</TableCell>
                        <TableCell className="text-center border-r font-medium">{row.commercial}</TableCell>
                        <TableCell className="text-right border-r font-mono font-black text-primary px-4">{row.dailyWaste.toLocaleString()}</TableCell>
                        <TableCell className="text-right border-r font-mono font-black text-primary px-4">{row.monthlyWaste.toLocaleString()}</TableCell>
                        {isAuthorized && (
                            <TableCell className="border text-center">
                                <div className="flex justify-center gap-1">
                                    <Button size="icon" variant="outline" className="h-7 w-7 text-primary" onClick={() => handleOpenEditDialog(row)}><Edit className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="outline" className="h-7 w-7 text-destructive" onClick={() => handleRemove(row.id)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                            </TableCell>
                        )}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border-2">
            <DialogHeader><DialogTitle className="text-xl font-black uppercase text-primary">{editingRow ? 'Edit Record' : 'Add Entry'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-6">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60">ULB Name</Label><Input value={formData.ulbName} onChange={(e) => setFormData({...formData, ulbName: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60">MRF Name</Label><Input value={formData.mrfName} onChange={(e) => setFormData({...formData, mrfName: e.target.value})} /></div>
                <div className="space-y-2 col-span-2"><Label className="text-[10px] font-black uppercase opacity-60">GP Name</Label><Input value={formData.gpName} onChange={(e) => setFormData({...formData, gpName: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60">HH Count</Label><Input type="number" value={formData.households} onChange={(e) => setFormData({...formData, households: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-60">Waste/Day</Label><Input type="number" value={formData.dailyWaste} onChange={(e) => setFormData({...formData, dailyWaste: e.target.value})} /></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} className="font-black uppercase px-8">Save Details</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GPInformationPage() {
  return (<Suspense fallback={<div className="p-12 text-center">Loading survey metrics...</div>}><GPInformationContent /></Suspense>);
}
