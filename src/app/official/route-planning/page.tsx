'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useState, useEffect } from "react";
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

import { Navigation, Anchor, PlusCircle, Edit, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Route {
  id: string | number;
  block: string;
  ulbName: string;
  routeId: string;
  routeAbbreviation: string;
  startingGp: string;
  intermediateGps: string[];
  finalGp: string;
  destination: string;
  totalDistance: number;
  scheduleDisplay: string;
}

function DistrictRoutePlanningContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const districtName = searchParams.get('district') || '';
  const blockParam = searchParams.get('block');
  const role = searchParams.get('role');
  const isAuthorized = role === 'block' || role === 'district';

  const db = useFirestore();
  const { data: firestoreRoutes = [] } = useCollection(db ? query(collection(db, 'routePlans')) : null);

  const [mounted, setMounted] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [formData, setFormData] = useState({
    block: '', ulbName: '', routeId: '', routeAbbreviation: '',
    startingGp: '', intermediateGps: '', finalGp: '', destination: '',
    totalDistance: '', scheduleDisplay: ''
  });

  useEffect(() => {
    setMounted(true);
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
    
    const source = districtsMap[districtName.toLowerCase()];
    if (!source) return;

    let initialRoutes = [...(source.data.routes || [])];
    const enriched = initialRoutes.filter((r: any) => !blockParam || (r.block || "").toLowerCase().includes(blockParam.toLowerCase())).map((r: any) => {
        const override = firestoreRoutes.find((f: any) => f.routeId === r.routeId && f.district === districtName);
        return {
            ...r,
            ulbName: override?.ulbName || r.ulbName || r.destination || 'District ULB',
            block: override?.block || r.block || 'District Block',
            startingGp: override?.startingGp || r.startingGp,
            finalGp: override?.finalGp || r.finalGp,
            destination: override?.destination || r.destination,
            totalDistance: override?.totalDistance || r.totalDistance,
            scheduleDisplay: override?.scheduleDisplay || r.scheduledOn || r.collectionSchedule || 'Scheduled'
        };
    });
    setRoutes(enriched);
  }, [districtName, blockParam, firestoreRoutes]);

  const handleOpenAddDialog = () => {
    setEditingRoute(null);
    setFormData({
      block: blockParam || '', ulbName: '', routeId: '', routeAbbreviation: '',
      startingGp: '', intermediateGps: '', finalGp: '', destination: '',
      totalDistance: '', scheduleDisplay: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      block: route.block, ulbName: route.ulbName, routeId: route.routeId,
      routeAbbreviation: route.routeAbbreviation, startingGp: route.startingGp,
      intermediateGps: Array.isArray(route.intermediateGps) ? route.intermediateGps.join(', ') : '',
      finalGp: route.finalGp, destination: route.destination,
      totalDistance: route.totalDistance.toString(), scheduleDisplay: route.scheduleDisplay
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!db) return;
    const compositeId = `${districtName}-${formData.routeId}`.toLowerCase().replace(/\s+/g, '-');

    await setDoc(doc(db, 'routePlans', compositeId), {
        ...formData,
        district: districtName,
        intermediateGps: formData.intermediateGps.split(',').map(s => s.trim()).filter(Boolean),
        totalDistance: parseFloat(formData.totalDistance) || 0,
        updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: "Sync Successful", description: "Route plan synchronized across all portals." });
    setIsDialogOpen(false);
  };

  if (!mounted || !districtName) return null;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Navigation className="h-8 w-8 text-primary" />
              <div><CardTitle className="text-2xl font-black uppercase">Route Planning: {districtName}</CardTitle><CardDescription>Verified circuit audits linking GP nodes to processing facilities.</CardDescription></div>
            </div>
            {isAuthorized && <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg"><PlusCircle className="mr-2 h-5 w-5" /> Add New Details</Button>}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="w-full">
            <div className="min-w-[1800px]">
              <Table className="border-collapse border">
                <TableHeader className="bg-muted/80">
                  <TableRow>
                    <TableHead className="w-[60px] text-center border font-black text-[9px] uppercase tracking-widest">S.No.</TableHead>
                    <TableHead className="w-[180px] border font-black text-[9px] uppercase tracking-widest">Block Name</TableHead>
                    <TableHead className="w-[150px] border font-black text-[9px] uppercase tracking-widest">Route ID</TableHead>
                    <TableHead className="w-[200px] border font-black text-[9px] uppercase tracking-widest">Starting GP</TableHead>
                    <TableHead className="w-[300px] border font-black text-[9px] uppercase tracking-widest">Intermediate GPs</TableHead>
                    <TableHead className="w-[180px] border font-black text-[9px] uppercase tracking-widest">Destination (MRF)</TableHead>
                    <TableHead className="w-[100px] border font-black text-[9px] uppercase tracking-widest text-right">Dist. (Km)</TableHead>
                    <TableHead className="w-[180px] border font-black text-[9px] uppercase tracking-widest">Schedule</TableHead>
                    {isAuthorized && <TableHead className="w-[120px] border font-black text-[9px] uppercase tracking-widest text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route, idx) => (
                    <TableRow key={idx} className="hover:bg-primary/[0.02] border-b transition-colors">
                      <TableCell className="border text-center font-mono text-xs">{idx + 1}</TableCell>
                      <TableCell className="border text-[10px] font-bold uppercase">{route.block}</TableCell>
                      <TableCell className="border font-mono text-[10px] font-black text-primary">{route.routeId}</TableCell>
                      <TableCell className="border text-[10px] font-bold text-green-700 uppercase">{route.startingGp}</TableCell>
                      <TableCell className="border text-[9px] font-medium italic text-muted-foreground leading-tight">{route.intermediateGps?.join(' → ') || 'Direct'}</TableCell>
                      <TableCell className="border text-[10px] font-black uppercase text-primary leading-tight">{route.destination}</TableCell>
                      <TableCell className="border text-right font-mono font-black text-xs text-primary">{route.totalDistance}</TableCell>
                      <TableCell className="border text-[10px] font-black uppercase text-blue-700 leading-tight">{route.scheduleDisplay}</TableCell>
                      {isAuthorized && (
                        <TableCell className="border text-center">
                            <div className="flex justify-center gap-2">
                                <Button size="icon" variant="outline" className="h-8 w-8 text-primary" onClick={() => handleOpenEditDialog(route)}><Edit className="h-4 w-4" /></Button>
                                <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" disabled><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-xl font-black uppercase text-primary">Edit Route Plan</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-6">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Starting GP</Label><Input value={formData.startingGp} onChange={e => setFormData({...formData, startingGp: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Final GP</Label><Input value={formData.finalGp} onChange={e => setFormData({...formData, finalGp: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Destination (MRF)</Label><Input value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Distance (Km)</Label><Input type="number" value={formData.totalDistance} onChange={e => setFormData({...formData, totalDistance: e.target.value})} /></div>
                <div className="space-y-2 col-span-2"><Label className="text-[10px] font-black uppercase">Schedule</Label><Input value={formData.scheduleDisplay} onChange={e => setFormData({...formData, scheduleDisplay: e.target.value})} /></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} className="font-black uppercase px-8">Sync Route</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DistrictRoutePlanningPage() {
  return (<Suspense fallback={<div>Loading...</div>}><DistrictRoutePlanningContent /></Suspense>);
}
