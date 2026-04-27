'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
    Phone, 
    User, 
    Truck, 
    ClipboardList, 
    Info, 
    PlusCircle, 
    Edit, 
    Trash2, 
    Save,
    Users
} from "lucide-react";
import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, setDoc, query } from "firebase/firestore";

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

interface ScheduleRecord {
  id: string | number;
  district: string;
  block: string;
  ulb: string;
  mrf: string;
  vehicleType: string;
  vehicleNo: string;
  vehicleCapacity: string;
  driverName: string;
  driverContact: string;
  collectionSchedule: string;
  gpName: string;
  actualWasteKg: number;
  gpNodalPerson: string;
  gpNodalContact: string;
  ulbNodalPerson: string;
  ulbNodalContact: string;
}

function OfficialWasteCollectionDetailsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const districtParam = searchParams.get('district') || '';
  const blockParam = searchParams.get('block');
  const role = searchParams.get('role');
  const isAuthorized = role === 'block' || role === 'district';

  const db = useFirestore();
  const { data: firestoreSchedules = [] } = useCollection(db ? query(collection(db, 'collectionSchedules')) : null);

  const [mounted, setMounted] = useState(false);
  const [masterRecords, setMasterRecords] = useState<ScheduleRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScheduleRecord | null>(null);

  const [formData, setFormData] = useState({
    block: '',
    ulb: '',
    mrf: '',
    vehicleType: '',
    vehicleNo: '',
    vehicleCapacity: '',
    driverName: '',
    driverContact: '',
    collectionSchedule: '',
    gpName: '',
    actualWasteKg: '',
    gpNodalPerson: '',
    gpNodalContact: '',
    ulbNodalPerson: '',
    ulbNodalContact: ''
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
        'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData, 'malkangiri': malkangiriDistrictData,
        'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
        'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
    };

    const source = districtsSourceMap[districtParam.toLowerCase()];
    if (!source) return;

    const schedules = source.data.collectionSchedules || [];
    const formatted = schedules.filter((s: any) => !blockParam || s.block?.toLowerCase().trim() === blockParam.toLowerCase().trim()).map((s: any) => {
        const override = firestoreSchedules.find((f: any) => f.gpName === s.gpName && f.district === districtParam);
        return {
            id: s.id || Math.random(),
            district: districtParam,
            block: override?.block || s.block || 'Other',
            ulb: override?.ulb || s.ulb,
            mrf: override?.mrf || s.mrf,
            vehicleType: override?.vehicleType || s.vehicleType,
            vehicleNo: override?.vehicleNo || s.vehicleNo || '-',
            vehicleCapacity: override?.vehicleCapacity || s.vehicleCapacity || '-',
            driverName: override?.driverName || s.driverName || '-',
            driverContact: override?.driverContact || s.driverContact || '-',
            collectionSchedule: override?.collectionSchedule || s.collectionSchedule,
            gpName: s.gpName,
            actualWasteKg: override?.actualWasteKg || s.wasteGeneratedKg || 0,
            gpNodalPerson: override?.gpNodalPerson || s.gpNodalPerson,
            gpNodalContact: override?.gpNodalContact || s.gpNodalContact,
            ulbNodalPerson: override?.ulbNodalPerson || s.ulbNodalPerson,
            ulbNodalContact: override?.ulbNodalContact || s.ulbNodalContact
        };
    });
    setMasterRecords(formatted);
  }, [districtParam, blockParam, firestoreSchedules]);

  const handleOpenAddDialog = () => {
    setEditingRecord(null);
    setFormData({
      block: blockParam || '', ulb: '', mrf: '', vehicleType: '', vehicleNo: '',
      vehicleCapacity: '', driverName: '', driverContact: '', collectionSchedule: '',
      gpName: '', actualWasteKg: '', gpNodalPerson: '', gpNodalContact: '',
      ulbNodalPerson: '', ulbNodalContact: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (record: ScheduleRecord) => {
    setEditingRecord(record);
    setFormData({
      block: record.block, ulb: record.ulb, mrf: record.mrf, vehicleType: record.vehicleType,
      vehicleNo: record.vehicleNo, vehicleCapacity: record.vehicleCapacity,
      driverName: record.driverName, driverContact: record.driverContact,
      collectionSchedule: record.collectionSchedule, gpName: record.gpName,
      actualWasteKg: record.actualWasteKg.toString(), gpNodalPerson: record.gpNodalPerson,
      gpNodalContact: record.gpNodalContact, ulbNodalPerson: record.ulbNodalPerson,
      ulbNodalContact: record.ulbNodalContact
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!db) return;
    const compositeId = `${districtParam}-${formData.gpName}`.toLowerCase().replace(/\s+/g, '-');
    
    await setDoc(doc(db, 'collectionSchedules', compositeId), {
        ...formData,
        district: districtParam,
        actualWasteKg: parseFloat(formData.actualWasteKg) || 0,
        updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: "Sync Successful", description: "Collection record synchronized across all portals." });
    setIsDialogOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Waste Collection Details</CardTitle>
                <CardDescription>Verified chronological audit of logistical circuits for District: {districtParam}.</CardDescription>
              </div>
            </div>
            {isAuthorized && (
              <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="w-full">
            <div className="min-w-[1800px]">
              <Table className="border">
                <TableHeader className="bg-muted/80">
                  <TableRow>
                    <TableHead className="w-[50px] border uppercase font-black text-[9px]">S.No.</TableHead>
                    <TableHead className="w-[120px] border uppercase font-black text-[9px]">Block</TableHead>
                    <TableHead className="w-[180px] border uppercase font-black text-[9px]">ULB</TableHead>
                    <TableHead className="w-[150px] border uppercase font-black text-[9px]">MRF Node</TableHead>
                    <TableHead className="w-[300px] border uppercase font-black text-[9px] text-center">Vehicle (Type, No, Cap.)</TableHead>
                    <TableHead className="w-[180px] border uppercase font-black text-[9px] text-center">Driver Details</TableHead>
                    <TableHead className="w-[150px] border uppercase font-black text-[9px]">Collection Day</TableHead>
                    <TableHead className="w-[100px] border uppercase font-black text-[9px] text-right">Load (Kg)</TableHead>
                    <TableHead className="w-[300px] border uppercase font-black text-[9px]">PEO Details (GP)</TableHead>
                    <TableHead className="w-[200px] border uppercase font-black text-[9px]">ULB Operator</TableHead>
                    {isAuthorized && <TableHead className="w-[100px] border uppercase font-black text-[9px] text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {masterRecords.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-primary/[0.01] border-b h-auto min-h-20">
                      <TableCell className="border text-center font-mono text-xs">{idx + 1}</TableCell>
                      <TableCell className="border font-black text-[10px] uppercase">{item.block}</TableCell>
                      <TableCell className="border font-bold text-[10px] uppercase text-primary leading-tight">{item.ulb}</TableCell>
                      <TableCell className="border font-black text-[9px] uppercase">{item.mrf}</TableCell>
                      <TableCell className="border text-[10px] text-center">
                        <div className="space-y-0.5">
                            <p className="font-bold uppercase text-foreground">{item.vehicleType}</p>
                            <p className="font-mono text-[9px] text-muted-foreground">{item.vehicleNo} | {item.vehicleCapacity} Kg</p>
                        </div>
                      </TableCell>
                      <TableCell className="border text-center">
                         <div className="space-y-0.5">
                            <p className="font-black text-[10px] uppercase">{item.driverName}</p>
                            <p className="font-mono text-[9px] text-primary">{item.driverContact}</p>
                        </div>
                      </TableCell>
                      <TableCell className="border text-[10px] font-black text-blue-700 uppercase">{item.collectionSchedule}</TableCell>
                      <TableCell className="border text-right font-mono font-black text-primary text-xs">{item.actualWasteKg.toLocaleString()}</TableCell>
                      <TableCell className="border bg-blue-50/10 p-2">
                        <div className="text-[9px] font-bold uppercase truncate">{item.gpNodalPerson} ({item.gpNodalContact})</div>
                      </TableCell>
                      <TableCell className="border bg-orange-50/5 p-2">
                        <div className="text-[9px] font-bold uppercase truncate">{item.ulbNodalPerson} ({item.ulbNodalContact})</div>
                      </TableCell>
                      {isAuthorized && (
                        <TableCell className="border text-center">
                            <div className="flex justify-center gap-1">
                                <Button size="icon" variant="outline" className="h-7 w-7 text-primary" onClick={() => handleOpenEditDialog(item)}><Edit className="h-3 w-3" /></Button>
                                <Button size="icon" variant="outline" className="h-7 w-7 text-destructive" disabled><Trash2 className="h-3 w-3" /></Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2">
            <DialogHeader><DialogTitle className="text-xl font-black uppercase text-primary">Edit Collection Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Driver Name</Label><Input value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Driver Contact</Label><Input value={formData.driverContact} onChange={e => setFormData({...formData, driverContact: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Schedule</Label><Input value={formData.collectionSchedule} onChange={e => setFormData({...formData, collectionSchedule: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Verified Load (Kg)</Label><Input type="number" value={formData.actualWasteKg} onChange={e => setFormData({...formData, actualWasteKg: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">ULB Operator Name</Label><Input value={formData.ulbNodalPerson} onChange={e => setFormData({...formData, ulbNodalPerson: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">ULB Operator Contact</Label><Input value={formData.ulbNodalContact} onChange={e => setFormData({...formData, ulbNodalContact: e.target.value})} /></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} className="font-black uppercase px-8">Save & Sync</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OfficialWasteCollectionDetailsPage() {
    return (<Suspense fallback={<div>Loading...</div>}><OfficialWasteCollectionDetailsContent /></Suspense>);
}
