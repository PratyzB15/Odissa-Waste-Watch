
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
    ClipboardCheck, 
    PlusCircle,
    Edit,
    Trash2,
    Save,
    Phone,
    User,
    Users
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { mayurbhanjDistrictData } from "@/lib/disMayurbhanj";
import { malkangiriDistrictData } from "@/lib/disMalkangiri";
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { puriDistrictData } from "@/lib/disPuri";
import { sambalpurDistrictData } from "@/lib/disSambalpur";

function GpUlbWasteCollectionContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const ulbParam = searchParams.get('ulb') || '';
  const districtParam = searchParams.get('district') || '';

  const [mounted, setMounted] = useState(false);
  const [collectionRows, setCollectionRows] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    block: '',
    vehicleInfo: '',
    driverDetails: '',
    collectionSchedule: '',
    loadKg: '',
    peoDetails: '',
    ulbOperator: ''
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

    const source = districtsSourceMap[districtParam.toLowerCase()];
    if (!source) return;

    const filtered = (source.data.collectionSchedules || []).filter((item: any) => 
        (item.ulb.toLowerCase().trim().includes(ulbParam.toLowerCase().trim()) || ulbParam.toLowerCase().trim().includes(item.ulb.toLowerCase().trim()))
    );

    const formatted = filtered.map((item: any, idx: number) => ({
        id: idx,
        block: item.block,
        vehicleInfo: `${item.vehicleType} | ${item.vehicleNo || '-'} | ${item.vehicleCapacity || '-'} Kg`,
        driverName: item.driverName || '-',
        driverContact: item.driverContact || '-',
        collectionSchedule: item.collectionSchedule,
        loadKg: item.wasteGeneratedKg || 0,
        gpNodalPerson: (item.gpNodalPerson || "").split(',')[0],
        gpNodalContact: (item.gpNodalContact || "").split(',')[0],
        ulbNodalPerson: (item.ulbNodalPerson || "").split(',')[0],
        ulbNodalContact: (item.ulbNodalContact || "").split(',')[0]
    }));
    setCollectionRows(formatted);
  }, [ulbParam, districtParam]);

  const handleOpenAddDialog = () => {
    setEditingRow(null);
    setFormData({ 
        block: '', vehicleInfo: '', driverDetails: '', collectionSchedule: '', 
        loadKg: '', peoDetails: '', ulbOperator: '' 
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (row: any) => {
    setEditingRow(row);
    setFormData({
        block: row.block,
        vehicleInfo: row.vehicleInfo,
        driverDetails: `${row.driverName} (${row.driverContact})`,
        collectionSchedule: row.collectionSchedule,
        loadKg: row.loadKg.toString(),
        peoDetails: `${row.gpNodalPerson} (${row.gpNodalContact})`,
        ulbOperator: `${row.ulbNodalPerson} (${row.ulbNodalContact})`
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    toast({ title: "Update Successful", description: "Collection record synchronized." });
    setIsDialogOpen(false);
  };

  if (!mounted) return <div className="p-12 text-center animate-pulse">Loading facility logistics...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-md">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <ClipboardCheck className="text-primary h-8 w-8" />
                <div>
                <CardTitle>Waste Collection Details: {ulbParam}</CardTitle>
                <CardDescription>Verified chronological audit of logistical circuits linking GP nodes to this facility.</CardDescription>
                </div>
            </div>
            <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="w-full">
            <div className="min-w-[1800px]">
              <Table className="border">
                <TableHeader className="bg-muted/80">
                  <TableRow>
                    <TableHead className="w-[50px] border uppercase font-black text-[9px]">S.No.</TableHead>
                    <TableHead className="w-[150px] border uppercase font-black text-[9px]">Block</TableHead>
                    <TableHead className="w-[300px] border uppercase font-black text-[9px] text-center">Vehicle (Type, No, Cap.)</TableHead>
                    <TableHead className="w-[200px] border uppercase font-black text-[9px] text-center">Driver Details</TableHead>
                    <TableHead className="w-[150px] border uppercase font-black text-[9px]">Collection Day</TableHead>
                    <TableHead className="w-[120px] border uppercase font-black text-[9px] text-right">Load (Kg)</TableHead>
                    <TableHead className="w-[300px] border uppercase font-black text-[9px]">PEO Details (GP)</TableHead>
                    <TableHead className="w-[200px] border uppercase font-black text-[9px]">ULB Operator</TableHead>
                    <TableHead className="w-[120px] border uppercase font-black text-[9px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionRows.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-primary/[0.01] border-b last:border-0 h-auto min-h-20">
                      <TableCell className="border text-center font-mono text-xs">{idx + 1}</TableCell>
                      <TableCell className="border font-black text-[10px] uppercase">{item.block}</TableCell>
                      <TableCell className="border text-[10px] text-center">{item.vehicleInfo}</TableCell>
                      <TableCell className="border text-center">
                         <div className="space-y-0.5 text-[10px] font-bold uppercase">
                           <p className="flex items-center justify-center gap-1"><User className="h-2.5 w-2.5" /> {item.driverName}</p>
                           <p className="flex items-center justify-center gap-1 font-mono text-[9px] text-primary"><Phone className="h-2.5 w-2.5" /> {item.driverContact}</p>
                         </div>
                      </TableCell>
                      <TableCell className="border text-[10px] font-black text-blue-700 uppercase">{item.collectionSchedule}</TableCell>
                      <TableCell className="border text-right font-mono font-black text-primary text-xs">{item.loadKg.toLocaleString()}</TableCell>
                      <TableCell className="border bg-blue-50/10 p-2">
                         <div className="space-y-0.5 text-[9px] font-bold uppercase">
                           <p className="flex items-center gap-1"><Users className="h-2.5 w-2.5" /> {item.gpNodalPerson}</p>
                           <p className="flex items-center gap-1 font-mono text-primary"><Phone className="h-2.5 w-2.5" /> {item.gpNodalContact}</p>
                         </div>
                      </TableCell>
                      <TableCell className="border bg-orange-50/5">
                        <div className="space-y-0.5 text-[9px] font-bold uppercase">
                           <p className="flex items-center gap-1 text-blue-700"><User className="h-2.5 w-2.5" /> {item.ulbNodalPerson}</p>
                           <p className="flex items-center gap-1 font-mono text-primary"><Phone className="h-2.5 w-2.5" /> {item.ulbNodalContact}</p>
                         </div>
                      </TableCell>
                      <TableCell className="border text-center">
                          <div className="flex justify-center gap-1">
                              <Button size="icon" variant="outline" className="h-7 w-7 text-primary" onClick={() => handleOpenEditDialog(item)}><Edit className="h-3 w-3" /></Button>
                              <Button size="icon" variant="outline" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                          </div>
                      </TableCell>
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
            <DialogHeader><DialogTitle className="text-xl font-black uppercase text-primary">Log Collection Entry</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Block</Label><Input value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Vehicle Info</Label><Input value={formData.vehicleInfo} onChange={(e) => setFormData({...formData, vehicleInfo: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Driver Details</Label><Input value={formData.driverDetails} onChange={(e) => setFormData({...formData, driverDetails: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Verified Load (Kg)</Label><Input type="number" value={formData.loadKg} onChange={(e) => setFormData({...formData, loadKg: e.target.value})} /></div>
                <div className="space-y-2 col-span-2"><Label className="text-[10px] font-bold uppercase">ULB Operator</Label><Input value={formData.ulbOperator} onChange={(e) => setFormData({...formData, ulbOperator: e.target.value})} /></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} className="font-black uppercase px-8">Sync Entry</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GpUlbWasteCollectionDetailsPage() {
    return (<Suspense fallback={<div className="p-12 text-center">Loading logistics...</div>}><GpUlbWasteCollectionContent /></Suspense>);
}
