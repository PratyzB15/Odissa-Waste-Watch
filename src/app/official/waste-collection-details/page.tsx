
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
    Anchor, 
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
        'koraput': koraputDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData,
        'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
        'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
    };

    const source = districtsSourceMap[districtParam.toLowerCase()];
    if (!source) return;

    const schedules = source.data.collectionSchedules || [];
    const formatted = schedules.filter((s: any) => !blockParam || s.block?.toLowerCase().trim() === blockParam.toLowerCase().trim()).map((s: any) => ({
        id: s.id || Math.random(),
        district: districtParam,
        block: s.block || 'Other',
        ulb: s.ulb,
        mrf: s.mrf,
        vehicleType: s.vehicleType,
        vehicleNo: s.vehicleNo || '-',
        vehicleCapacity: s.vehicleCapacity || '-',
        driverName: s.driverName || '-',
        driverContact: s.driverContact || '-',
        collectionSchedule: s.collectionSchedule,
        gpName: s.gpName,
        actualWasteKg: s.wasteGeneratedKg || 0,
        gpNodalPerson: s.gpNodalPerson,
        gpNodalContact: s.gpNodalContact,
        ulbNodalPerson: s.ulbNodalPerson,
        ulbNodalContact: s.ulbNodalContact
    }));
    setMasterRecords(formatted);
  }, [districtParam, blockParam]);

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

  const handleDelete = (id: string | number) => {
    setMasterRecords(prev => prev.filter(r => r.id !== id));
    toast({ title: "Entry Removed", description: "Collection record deleted." });
  };

  const handleSubmit = () => {
    const record: ScheduleRecord = {
      ...formData,
      id: editingRecord ? editingRecord.id : Date.now(),
      district: districtParam,
      actualWasteKg: parseFloat(formData.actualWasteKg) || 0
    };

    if (editingRecord) {
      setMasterRecords(prev => prev.map(r => r.id === editingRecord.id ? record : r));
      toast({ title: "Update Successful", description: "Collection data synchronized." });
    } else {
      setMasterRecords(prev => [...prev, record]);
      toast({ title: "New Entry Added", description: "Roster updated successfully." });
    }
    setIsDialogOpen(false);
  };

  const renderPEOContactCell = (namesStr: string, contactsStr: string) => {
    const names = (namesStr || 'N/A').split(/,|\n/).map(s => s.trim()).filter(Boolean);
    const contacts = (contactsStr || 'N/A').split(/,|\n/).map(s => s.trim()).filter(Boolean);
    
    const displayCount = 3;
    const hasMore = names.length > displayCount;
    const visibleNames = names.slice(0, displayCount);

    return (
      <div className="space-y-1">
        {visibleNames.map((name, i) => (
          <div key={i} className="flex items-center justify-between gap-3 border-b border-dashed py-1 last:border-0">
            <span className="flex items-center gap-1 font-bold uppercase tracking-tighter text-[9px]">
              <User className="h-2.5 w-2.5 opacity-60" /> {name}
            </span>
            <span className="font-mono flex items-center gap-1 text-[9px] font-black">
              <Phone className="h-2.5 w-2.5" /> {contacts[i] || 'N/A'}
            </span>
          </div>
        ))}
        {hasMore && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="h-7 w-full text-[8px] font-black uppercase text-primary hover:bg-primary/10 mt-1 border border-primary/20 bg-primary/5">
                View All {names.length} Personnel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-2">
              <DialogHeader className="bg-primary/5 p-4 border-b">
                <DialogTitle className="text-sm font-black uppercase flex items-center gap-2 text-primary">
                  <Users className="h-4 w-4" /> GP Nodal Personnel (PEOs)
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold">Consolidated roster for this collection node.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-2 pr-4">
                  {names.map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed hover:border-primary/40 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-primary leading-tight">{name}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">GP Nodal Person</span>
                      </div>
                      <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border shadow-sm">
                        <Phone className="h-3 w-3 text-primary opacity-60" />
                        <span className="text-xs font-mono font-black">{contacts[i] || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  const renderContactPair = (namesStr: string, contactsStr: string, isUlb = false) => {
    const names = (namesStr || 'N/A').split(/,|\n/).map(s => s.trim()).filter(Boolean);
    const contacts = (contactsStr || 'N/A').split(/,|\n/).map(s => s.trim()).filter(Boolean);
    
    return names.map((name, i) => (
      <div key={i} className={`flex items-center justify-between gap-3 border-b border-dashed py-1 last:border-0 ${isUlb ? 'text-blue-700' : 'text-foreground'}`}>
        <span className="flex items-center gap-1 font-bold uppercase tracking-tighter text-[9px]">
          <User className="h-2.5 w-2.5 opacity-60" /> {name}
        </span>
        <span className="font-mono flex items-center gap-1 text-[9px] font-black">
          <Phone className="h-2.5 w-2.5" /> {contacts[i] || 'N/A'}
        </span>
      </div>
    ));
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
                      <TableCell className="border font-black text-[9px] uppercase">{item.block}</TableCell>
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
                        {renderPEOContactCell(item.gpNodalPerson, item.gpNodalContact)}
                      </TableCell>
                      <TableCell className="border bg-orange-50/5">
                        {renderContactPair(item.ulbNodalPerson, item.ulbNodalContact, true)}
                      </TableCell>
                      {isAuthorized && (
                        <TableCell className="border text-center">
                            <div className="flex justify-center gap-1">
                                <Button size="icon" variant="outline" className="h-7 w-7 text-primary" onClick={() => handleOpenEditDialog(item)}><Edit className="h-3 w-3" /></Button>
                                <Button size="icon" variant="outline" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
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
            <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase text-primary">Collection Roster Entry</DialogTitle>
                <DialogDescription>Input verified circuit quantification for jurisdictional reporting.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b pb-1">Circuit Context</h4>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">GP Name / Cluster</Label>
                        <Input value={formData.gpName} onChange={(e) => setFormData({...formData, gpName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">MRF Node</Label>
                        <Input value={formData.mrf} onChange={(e) => setFormData({...formData, mrf: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Schedule</Label>
                        <Input value={formData.collectionSchedule} onChange={(e) => setFormData({...formData, collectionSchedule: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b pb-1">Logistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Vehicle Type</Label>
                            <Input value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Vehicle No.</Label>
                            <Input value={formData.vehicleNo} onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Driver Name</Label>
                        <Input value={formData.driverName} onChange={(e) => setFormData({...formData, driverName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Verified Load (Kg)</Label>
                        <Input type="number" value={formData.actualWasteKg} onChange={(e) => setFormData({...formData, actualWasteKg: e.target.value})} />
                    </div>
                </div>
            </div>
            <DialogFooter className="bg-muted/30 p-4 rounded-xl">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold">Cancel</Button>
                <Button onClick={handleSubmit} className="font-black uppercase px-8"><Save className="mr-2 h-4 w-4" /> Save Entry</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OfficialWasteCollectionDetailsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Loading logistical metrics...</div>}>
            <OfficialWasteCollectionDetailsContent />
        </Suspense>
    );
}
