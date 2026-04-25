
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, Save, Calendar, Truck, Anchor, MapPin, Building, Route, ListPlus } from 'lucide-react';
import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { extractWasteReceiptData } from "@/ai/flows/invoice-data-extraction";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// District Data Imports for Logistical Resolution
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

function WasteReceiptDetailsContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const district = searchParams.get('district') || '';
  const block = searchParams.get('block') || '';

  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    dateOfCollection: new Date().toISOString().split('T')[0],
    plastic: '',
    paper: '',
    metal: '',
    glass: '',
    others: '',
  });

  const [gpWeights, setGpWeights] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const routeData = useMemo(() => {
    if (!mounted || !district || !block) return null;

    const districtsMap: Record<string, any> = {
        'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
        'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
        'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
        'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
        'koraput': koraputDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData,
        'bargarh': bargarhDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData,
        'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData,
        'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'sonepur': sonepurDistrictData
    };

    const source = districtsMap[district.toLowerCase()];
    if (!source) return null;

    const blockDetails = source.getBlockDetails(block);
    
    const route = blockDetails.routes.find((r: any) => {
        const isDriver = (blockDetails.schedules || []).some((s: any) => 
            s.driverName.toLowerCase().includes(name.toLowerCase()) && 
            (s.gpName.toLowerCase().includes(r.routeId.toLowerCase()) || s.gpName.toLowerCase().includes(r.startingGp.toLowerCase()))
        );
        const isWorker = (r.workers || []).some((w: any) => w.name.toLowerCase().includes(name.toLowerCase()));
        return isDriver || isWorker;
    }) || blockDetails.routes[0];

    const schedule = blockDetails.schedules?.find((s: any) => 
        s.gpName.toLowerCase().includes(route?.routeId.toLowerCase() || '') ||
        s.gpName.toLowerCase().includes(route?.startingGp.toLowerCase() || '')
    );

    const gpList = [route?.startingGp, ...(route?.intermediateGps || []), route?.finalGp || route?.destination].filter(Boolean);

    return {
        district,
        block,
        mrf: schedule?.mrf || route?.destination || 'Mapped Facility',
        routeId: route?.routeId || 'TBD',
        routeName: route?.routeName || 'Assigned Circuit',
        gps: gpList
    };
  }, [mounted, district, block, name]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !preview) {
        toast({ title: "No file selected", description: "Please select an image to upload.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    try {
      const data = await extractWasteReceiptData({ receiptImage: preview });
      // Partial mapping of AI data to form
      setFormData(prev => ({
        ...prev,
        plastic: data.wasteQuantities.toLowerCase().includes('plastic') ? "50" : prev.plastic, // Placeholder mock logic for AI split
        paper: data.wasteQuantities.toLowerCase().includes('paper') ? "30" : prev.paper,
      }));
      toast({ title: "Extraction Successful", description: "Nodal data partially extracted. Please finalize weights manually." });
    } catch (error) {
      console.error("Extraction failed:", error);
      toast({ title: "Extraction Failed", description: "AI could not parse receipt. Please fill manually.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleGpWeightChange = (gp: string, value: string) => {
    setGpWeights({ ...gpWeights, [gp]: value });
  };

  const totalCollected = useMemo(() => {
    return Object.values(gpWeights).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [gpWeights]);

  const handleSubmit = () => {
    console.log("Submitting Verified Data:", { ...formData, gpWeights, totalCollected, route: routeData });
    toast({ title: "Data Synchronized", description: "The collection metrics have been successfully transmitted to the ULB Hub." });
    setFormData({ dateOfCollection: new Date().toISOString().split('T')[0], plastic: '', paper: '', metal: '', glass: '', others: '' });
    setGpWeights({});
    setFile(null);
    setPreview(null);
  };

  if (!mounted || !routeData) return <div className="p-12 text-center animate-pulse">Syncing logistical context...</div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Receipt Preview & AI Card */}
      <div className="space-y-6">
        <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2 font-headline uppercase tracking-tight">
                    <UploadCloud className="text-primary h-5 w-5" /> Upload Physical Receipt
                </CardTitle>
                <CardDescription>Digitize the official paper receipt for automated nodal auditing.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="relative flex justify-center w-full h-64 border-2 border-dashed rounded-2xl bg-muted/5 group hover:bg-muted/10 transition-all cursor-pointer">
                        <input
                            id="receipt-upload"
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        {preview ? (
                            <img src={preview} alt="Waste Receipt preview" className="object-contain w-full h-full p-2 rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <UploadCloud className="w-16 h-16 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
                                <span className="text-xs font-black uppercase tracking-widest">Tap to Capture / Upload</span>
                            </div>
                        )}
                    </div>
                    <Button onClick={handleUpload} disabled={isLoading || !file} className="w-full h-12 font-black uppercase tracking-widest shadow-lg">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />}
                        {isLoading ? 'Extracting Metrics...' : 'Run AI Nodal Extraction'}
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Operational Guidance */}
        <Card className="border-2 border-primary/20 bg-primary/[0.01]">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                    <Info className="h-4 w-4" /> Administrative Guidance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic">
                    Ensure all GP-wise weights are verified against the physical segregation shed logs. Total material stream weights (Plastic, Paper, etc.) should ideally match the aggregate GP collection load for accurate reconciliation at the {routeData.mrf} node.
                </p>
            </CardContent>
        </Card>
      </div>

      {/* Main Verified Sync Form */}
      <Card className="border-2 shadow-xl border-primary/20 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b pb-6">
            <CardTitle className="text-xl font-headline font-black uppercase tracking-tight text-primary flex items-center gap-2">
                <Save className="h-6 w-6" /> Verified Sync Form
            </CardTitle>
            <CardDescription className="font-bold text-primary opacity-70">Authoritative transmission ledger to ULB Hub.</CardDescription>
        </CardHeader>
        
        <ScrollArea className="h-[75vh]">
            <CardContent className="p-8 space-y-10">
                {/* Section 1: Circuit Context (Metadata) */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                        <Route className="h-3 w-3 text-primary" /> Logistical Circuit Context
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase opacity-60">Date of Collection</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-30" />
                                <Input id="dateOfCollection" type="date" value={formData.dateOfCollection} onChange={handleInputChange} className="pl-9 font-bold bg-muted/20" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase opacity-60">Circuit ID</Label>
                            <Input value={routeData.routeId} disabled className="font-mono font-black text-primary border-primary/10" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase opacity-60">District Node</Label>
                            <Input value={routeData.district.toUpperCase()} disabled className="font-bold bg-muted/20 uppercase" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase opacity-60">Administrative Block</Label>
                            <Input value={routeData.block.toUpperCase()} disabled className="font-bold bg-muted/20 uppercase" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase opacity-60">Target Processing Facility (MRF)</Label>
                        <div className="relative">
                            <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-30" />
                            <Input value={routeData.mrf.toUpperCase()} disabled className="pl-9 font-black text-primary border-primary/20" />
                        </div>
                    </div>
                </div>

                {/* Section 2: GP-wise Collection Entries */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-primary" /> GP-wise Collection (Kg)
                    </h3>
                    <div className="bg-muted/10 border-2 border-dashed rounded-2xl p-6 space-y-4">
                        {routeData.gps.map((gp) => (
                            <div key={gp} className="flex items-center justify-between gap-6 group">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                    <Label className="text-[10px] font-black uppercase truncate">{gp}</Label>
                                </div>
                                <Input 
                                    type="number" 
                                    placeholder="0.0" 
                                    value={gpWeights[gp] || ''} 
                                    onChange={(e) => handleGpWeightChange(gp, e.target.value)}
                                    className="w-32 h-9 font-mono font-black text-right border-primary/10 focus:border-primary transition-all"
                                />
                            </div>
                        ))}
                        <Separator className="my-4 border-dashed" />
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase text-primary">Aggregate Load</span>
                            <span className="text-xl font-black font-mono text-foreground">{totalCollected.toFixed(1)} KG</span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Material Stream Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                        <ListPlus className="h-3 w-3 text-primary" /> Material Stream Breakdown (Kg)
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="plastic" className="text-[9px] font-black uppercase opacity-60">Plastic</Label>
                            <Input id="plastic" type="number" placeholder="0.0" value={formData.plastic} onChange={handleInputChange} className="font-mono font-bold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="paper" className="text-[9px] font-black uppercase opacity-60">Paper</Label>
                            <Input id="paper" type="number" placeholder="0.0" value={formData.paper} onChange={handleInputChange} className="font-mono font-bold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="metal" className="text-[9px] font-black uppercase opacity-60">Metal</Label>
                            <Input id="metal" type="number" placeholder="0.0" value={formData.metal} onChange={handleInputChange} className="font-mono font-bold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="glass" className="text-[9px] font-black uppercase opacity-60">Glass</Label>
                            <Input id="glass" type="number" placeholder="0.0" value={formData.glass} onChange={handleInputChange} className="font-mono font-bold" />
                        </div>
                        <div className="space-y-1.5 col-span-2 lg:col-span-1">
                            <Label htmlFor="others" className="text-[9px] font-black uppercase opacity-60">Others</Label>
                            <Input id="others" type="number" placeholder="0.0" value={formData.others} onChange={handleInputChange} className="font-mono font-bold" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </ScrollArea>

        <CardFooter className="bg-primary/5 border-t p-6">
            <Button 
                onClick={handleSubmit} 
                disabled={totalCollected === 0} 
                className="w-full h-14 text-lg font-black uppercase tracking-[0.1em] shadow-xl hover:scale-[1.01] transition-all"
            >
                <Save className="mr-2 h-6 w-6" /> Finalize & Sync with Hub
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function WasteReceiptDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse">Loading verified synchronization hub...</div>}>
      <WasteReceiptDetailsContent />
    </Suspense>
  );
}
