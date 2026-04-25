'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense, useEffect } from 'react';
import { Truck, Users, Phone, Navigation, Anchor, Edit, Trash2, PlusCircle, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { kandhamal DistrictData } from "@/lib/disKandhamal";
import { kendraparaDistrictData } from "@/lib/disKendrapara";
import { kendujharDistrictData } from "@/lib/disKendujhar";
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
import { balasoreDistrictData } from "@/lib/disBalasore";
import { baleswarDistrictData } from "@/lib/disBaleswar";

interface Route {
  id: string | number;
  block: string;
  mrfName: string;
  routeId: string;
  routeAbbreviation: string;
  startingGp: string;
  intermediateGps: string[];
  finalGp: string;
  destination: string;
  totalDistance: number;
  workers: { name: string; contact: string }[];
  scheduledOn: string;
}

function UlbPersonnelDetailsContent() {
    const searchParams = useSearchParams();
    const ulbParam = searchParams.get('ulb') || '';
    const districtName = searchParams.get('district') || '';
    const { toast } = useToast();

    const [mounted, setMounted] = useState(false);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);
    
    const [formData, setFormData] = useState({
        block: '',
        mrfName: '',
        routeId: '',
        routeAbbreviation: '',
        startingGp: '',
        intermediateGps: '',
        finalGp: '',
        destination: '',
        totalDistance: '',
        workersText: '',
        scheduledOn: ''
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
            'khordha': khordhaDistrictData, 'koraput': koraputDistrictData, 'mayurbhanj': mayurbhanjDistrictData,
            'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
            'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData,
            'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData
        };
        const source = districtsSourceMap[districtName.toLowerCase()];
        if (!source) return;

        const allRoutes = source.data.routes || [];
        const filtered = allRoutes.filter((r: any) => 
            r.destination.toLowerCase().trim().includes(ulbParam.toLowerCase().trim()) ||
            ulbParam.toLowerCase().trim().includes(r.destination.toLowerCase().trim())
        ).map((r: any) => ({
            ...r,
            block: r.block || districtName,
            mrfName: r.mrfName || r.destination
        }));
        setRoutes(filtered);
    }, [ulbParam, districtName]);

    const handleOpenAddDialog = () => {
        setEditingRoute(null);
        setFormData({
            block: '', mrfName: ulbParam, routeId: '', routeAbbreviation: '',
            startingGp: '', intermediateGps: '', finalGp: '', destination: ulbParam,
            totalDistance: '', workersText: '', scheduledOn: ''
        });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (route: Route) => {
        setEditingRoute(route);
        setFormData({
            block: route.block,
            mrfName: route.mrfName,
            routeId: route.routeId,
            routeAbbreviation: route.routeAbbreviation,
            startingGp: route.startingGp,
            intermediateGps: route.intermediateGps.join(', '),
            finalGp: route.finalGp,
            destination: route.destination,
            totalDistance: route.totalDistance.toString(),
            workersText: route.workers.map(w => `${w.name}:${w.contact}`).join('\n'),
            scheduledOn: route.scheduledOn
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string | number) => {
        setRoutes(prev => prev.filter(r => r.id !== id));
        toast({ title: "Entry Removed", description: "Logistical circuit deleted." });
    };

    const handleSubmit = () => {
        const workerList = formData.workersText.split('\n').filter(line => line.includes(':')).map(line => {
            const [name, contact] = line.split(':');
            return { name: name.trim(), contact: contact.trim() };
        });

        const newRoute: Route = {
            id: editingRoute ? editingRoute.id : Date.now(),
            block: formData.block,
            mrfName: formData.mrfName,
            routeId: formData.routeId,
            routeAbbreviation: formData.routeAbbreviation,
            startingGp: formData.startingGp,
            intermediateGps: formData.intermediateGps.split(',').map(s => s.trim()).filter(Boolean),
            finalGp: formData.finalGp,
            destination: formData.destination,
            totalDistance: parseFloat(formData.totalDistance) || 0,
            workers: workerList,
            scheduledOn: formData.scheduledOn
        };

        if (editingRoute) {
            setRoutes(prev => prev.map(r => r.id === editingRoute.id ? newRoute : r));
            toast({ title: "Update Successful", description: "Route details synchronized." });
        } else {
            setRoutes(prev => [...prev, newRoute]);
            toast({ title: "New Entry Added", description: "Logistical circuit added to roster." });
        }
        setIsDialogOpen(false);
    };

    if (!mounted) return <div className="p-12 text-center animate-pulse">Syncing directory...</div>;

    return (
        <div className="space-y-8">
            <Card className="border-2 border-primary/20 bg-primary/[0.01]">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2 font-headline uppercase tracking-tight">
                        <Navigation className="text-primary h-8 w-8" /> 
                        Route & Worker Roster: {ulbParam}
                        </CardTitle>
                        <CardDescription className="text-lg">Verified collection circuits and sanitation worker assignments for this ULB.</CardDescription>
                    </div>
                    <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg px-6">
                        <PlusCircle className="mr-2 h-5 w-5" /> Add New Entry
                    </Button>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 shadow-md">
                <CardContent className="p-0 overflow-hidden">
                    <ScrollArea className="w-full">
                      <div className="min-w-[1700px]">
                        <Table className="border-collapse">
                            <TableHeader className="bg-muted/80">
                                <TableRow>
                                    <TableHead className="w-[180px] uppercase text-[9px] font-black tracking-widest border">Tagged block and tagged mrf</TableHead>
                                    <TableHead className="w-[150px] uppercase text-[9px] font-black tracking-widest border">Route ID</TableHead>
                                    <TableHead className="w-[150px] uppercase text-[9px] font-black tracking-widest border">Route Name (Abbr.)</TableHead>
                                    <TableHead className="w-[150px] uppercase text-[9px] font-black tracking-widest border">Starting GP</TableHead>
                                    <TableHead className="w-[200px] uppercase text-[9px] font-black tracking-widest border">Intermediate GPs</TableHead>
                                    <TableHead className="w-[150px] uppercase text-[9px] font-black tracking-widest border">Last/Final GP</TableHead>
                                    <TableHead className="w-[180px] uppercase text-[9px] font-black tracking-widest border">Destination (MRF)</TableHead>
                                    <TableHead className="w-[80px] text-right uppercase text-[9px] font-black tracking-widest border">Dist. (Km)</TableHead>
                                    <TableHead className="w-[300px] uppercase text-[9px] font-black tracking-widest border">Details of Sanitation Workers</TableHead>
                                    <TableHead className="w-[180px] uppercase text-[9px] font-black tracking-widest border">Day of Collection</TableHead>
                                    <TableHead className="w-[120px] uppercase text-[9px] font-black tracking-widest border text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {routes.map((route, idx) => (
                                    <TableRow key={idx} className="hover:bg-primary/[0.01] transition-colors border-b last:border-0 h-24">
                                        <TableCell className="border text-[10px] font-black text-primary uppercase leading-tight">
                                            <p>{route.block}</p>
                                            <p className="text-[8px] text-muted-foreground italic">{route.mrfName}</p>
                                        </TableCell>
                                        <TableCell className="border font-mono text-[10px] font-bold text-foreground">{route.routeId}</TableCell>
                                        <TableCell className="border"><Badge variant="outline" className="text-[9px] font-black border-primary/30 bg-primary/5">{route.routeAbbreviation || route.routeId}</Badge></TableCell>
                                        <TableCell className="border text-[10px] font-bold text-green-700 uppercase">{route.startingGp}</TableCell>
                                        <TableCell className="border text-[9px] font-medium italic text-muted-foreground leading-tight">{route.intermediateGps.join(' → ')}</TableCell>
                                        <TableCell className="border text-[10px] font-bold text-blue-700 uppercase">{route.finalGp || route.destination}</TableCell>
                                        <TableCell className="border"><div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary"><Anchor className="h-3 w-3" />{route.destination}</div></TableCell>
                                        <TableCell className="border text-right font-mono font-black text-xs text-primary">{route.totalDistance}</TableCell>
                                        <TableCell className="border bg-muted/5">
                                            <div className="space-y-1">
                                                {route.workers.map((w, i) => (
                                                    <div key={i} className="text-[10px] font-bold leading-tight">
                                                        <span className="text-primary uppercase">{w.name}</span>
                                                        <span className="text-muted-foreground ml-1">({w.contact})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="border text-[10px] font-black uppercase text-blue-700 leading-tight">{route.scheduledOn}</TableCell>
                                        <TableCell className="border text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-primary" onClick={() => handleOpenEditDialog(route)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" onClick={() => handleDelete(route.id)}><Trash2 className="h-4 w-4" /></Button>
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase text-primary">{editingRoute ? 'Edit Route Entry' : 'Add New Route'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase">Block</Label><Input value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase">Route ID</Label><Input value={formData.routeId} onChange={(e) => setFormData({...formData, routeId: e.target.value})} /></div>
                                <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase">Abbreviation</Label><Input value={formData.routeAbbreviation} onChange={(e) => setFormData({...formData, routeAbbreviation: e.target.value})} /></div>
                            </div>
                            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase">Total Distance</Label><Input type="number" value={formData.totalDistance} onChange={(e) => setFormData({...formData, totalDistance: e.target.value})} /></div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase">Starting GP</Label><Input value={formData.startingGp} onChange={(e) => setFormData({...formData, startingGp: e.target.value})} /></div>
                            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase">Last GP</Label><Input value={formData.finalGp} onChange={(e) => setFormData({...formData, finalGp: e.target.value})} /></div>
                            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase">Schedule</Label><Input value={formData.scheduledOn} onChange={(e) => setFormData({...formData, scheduledOn: e.target.value})} /></div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Workers (Format: Name:Contact, one per line)</Label>
                            <Textarea value={formData.workersText} onChange={(e) => setFormData({...formData, workersText: e.target.value})} rows={4} className="font-mono" />
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSubmit} className="font-black uppercase px-8">Save Route Details</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function PersonnelDetailsPage() {
    return (<Suspense fallback={<div className="p-12 text-center">Loading roster...</div>}><UlbPersonnelDetailsContent /></Suspense>);
}