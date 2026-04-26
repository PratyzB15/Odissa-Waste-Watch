
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, Save, Calendar, Truck, Anchor, MapPin, Building, Route, ListPlus, Phone, LayoutGrid, FileSearch, Sparkles, Info } from 'lucide-react';
import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { extractWasteReceiptData } from '@/ai/flows/invoice-data-extraction';

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
import { rayagadaDistrictData } from "@/lib/disRayagada";
import { nabarangpurDistrictData } from "@/lib/disNabarangpur";
import { nayagarhDistrictData } from "@/lib/disNayagarh";
import { nuapadaDistrictData } from "@/lib/disNuapada";
import { puriDistrictData } from "@/lib/disPuri";
import { sambalpurDistrictData } from "@/lib/disSambalpur";

function WasteReceiptGenerationContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Personnel';
  const phone = searchParams.get('contact') || 'N/A';
  const district = searchParams.get('district') || '';
  const block = searchParams.get('block') || '';

  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const [formData, setFormData] = useState({
    dateOfCollection: new Date().toISOString().split('T')[0],
    plastic: '',
    paper: '',
    metal: '',
    glass: '',
    sanitation: '',
    others: '',
  });

  const [gpWeights, setGpWeights] = useState<Record<string, string>>({});

  useEffect(() => { setMounted(true); }, []);

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
        'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'sonepur': sonepurDistrictData,
        'rayagada': rayagadaDistrictData, 'nabarangpur': nabarangpurDistrictData, 'nayagarh': nayagarhDistrictData,
        'nuapada': nuapadaDistrictData, 'puri': puriDistrictData, 'sambalpur': sambalpurDistrictData
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

  const totalCollected = useMemo(() => {
    return Object.values(gpWeights).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [gpWeights]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleGpWeightChange = (gp: string, value: string) => {
    setGpWeights({ ...gpWeights, [gp]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const result = await extractWasteReceiptData({ receiptImage: base64 });
        if (result) {
          if (result.dateOfCollection) setFormData(prev => ({ ...prev, dateOfCollection: result.dateOfCollection! }));
          if (result.plastic) setFormData(prev => ({ ...prev, plastic: result.plastic! }));
          if (result.paper) setFormData(prev => ({ ...prev, paper: result.paper! }));
          if (result.metal) setFormData(prev => ({ ...prev, metal: result.metal! }));
          if (result.glass) setFormData(prev => ({ ...prev, glass: result.glass! }));
          if (result.sanitation) setFormData(prev => ({ ...prev, sanitation: result.sanitation! }));
          if (result.others) setFormData(prev => ({ ...prev, others: result.others! }));
          
          if (result.gpWeights) {
            const newGpWeights = { ...gpWeights };
            Object.entries(result.gpWeights).forEach(([gp, weight]) => {
              const matchedGp = routeData?.gps.find(g => g.toLowerCase().includes(gp.toLowerCase()));
              if (matchedGp) newGpWeights[matchedGp] = weight;
            });
            setGpWeights(newGpWeights);
          }
          
          toast({ title: "Extraction Complete", description: "Form fields populated from receipt photo." });
        }
      } catch (err) {
        toast({ title: "Extraction Failed", description: "Could not read the receipt photo. Please enter data manually.", variant: "destructive" });
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    console.log("Submitting Verified Driver Data:", { ...formData, gpWeights, totalCollected, route: routeData });
    toast({ title: "Receipt Submitted", description: "Collection metrics synced with ULB Hub." });
    setFormData({ dateOfCollection: new Date().toISOString().split('T')[0], plastic: '', paper: '', metal: '', glass: '', sanitation: '', others: '' });
    setGpWeights({});
  };

  if (!mounted || !routeData) return <div className="p-12 text-center animate-pulse">Syncing logistical context...</div>;

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
      {/* Left Pane: AI Extraction Assistant */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-2 border-primary/20 shadow-lg bg-primary/[0.02]">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" /> AI Receipt Assistant
                </CardTitle>
                <CardDescription className="text-[10px] font-bold">Upload a photo to automatically fill the form.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center space-y-4 hover:bg-primary/5 transition-colors cursor-pointer relative group">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        disabled={isExtracting}
                    />
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto group-hover:scale-110 transition-transform">
                        {isExtracting ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <UploadCloud className="h-8 w-8 text-primary" />}
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-primary">{isExtracting ? 'Extracting Data...' : 'Upload Receipt Photo'}</p>
                        <p className="text-[9px] text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                    </div>
                </div>
                <div className="p-4 bg-background border rounded-xl space-y-2">
                    <p className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-1">
                        <FileSearch className="h-3 w-3" /> Extraction Status
                    </p>
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${isExtracting ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className="text-[10px] font-bold">{isExtracting ? 'Processing optical character recognition...' : 'Ready for upload'}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card className="border-2 border-dashed bg-muted/20">
            <CardContent className="py-6 flex items-start gap-4">
                <Info className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-tight">System Guidance</p>
                    <p className="text-[9px] text-muted-foreground font-medium italic leading-relaxed">
                        Ensure the photo is clear and all fields (Weights, GP names, Dates) are legible. The AI will cross-reference extracted names with your assigned route: {routeData.routeName}.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Right Pane: Main Form */}
      <div className="lg:col-span-8">
        <Card className="border-2 shadow-xl border-primary/20 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-6">
                <CardTitle className="text-xl font-headline font-black uppercase tracking-tight text-primary flex items-center gap-2">
                    <Truck className="h-6 w-6" /> Waste Receipt Generation
                </CardTitle>
                <CardDescription className="font-bold text-primary opacity-70">Authoritative transmission ledger for circuit: {routeData.routeName}</CardDescription>
            </CardHeader>
            
            <ScrollArea className="h-[75vh]">
                <CardContent className="p-8 space-y-10">
                    {/* Section 1: Metadata */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                            <Route className="h-3 w-3 text-primary" /> Logistical Circuit Context
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Driver Name</Label>
                                <Input value={name.toUpperCase()} disabled className="font-bold bg-muted/20" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Phone No.</Label>
                                <Input value={phone} disabled className="font-mono font-bold bg-muted/20" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Route ID</Label>
                                <Input value={routeData.routeId} disabled className="font-mono font-black text-primary border-primary/10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Date of Collection</Label>
                                <Input id="dateOfCollection" type="date" value={formData.dateOfCollection} onChange={handleInputChange} className="font-bold" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase opacity-60">Tagged MRF</Label>
                            <Input value={routeData.mrf.toUpperCase()} disabled className="font-black text-primary border-primary/20" />
                        </div>
                    </div>

                    {/* Section 2: GP-wise Weights (Requested Box) */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-primary" /> GP-wise Collection Breakdown (Kg)
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
                                <span className="text-xl font-black font-mono text-foreground">{totalCollected.toFixed(2)} KG</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Material Streams */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                            <ListPlus className="h-3 w-3 text-primary" /> Material Stream Distribution (Kg)
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
                            <div className="space-y-1.5">
                                <Label htmlFor="sanitation" className="text-[9px] font-black uppercase opacity-60">Sanitation</Label>
                                <Input id="sanitation" type="number" placeholder="0.0" value={formData.sanitation} onChange={handleInputChange} className="font-mono font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="others" className="text-[9px] font-black uppercase opacity-60">Others</Label>
                                <Input id="others" type="number" placeholder="0.0" value={formData.others} onChange={handleInputChange} className="font-mono font-bold" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </ScrollArea>
            <CardFooter className="bg-primary/5 border-t p-6">
                <Button onClick={handleSubmit} disabled={totalCollected === 0 || isExtracting} className="w-full h-14 text-lg font-black uppercase tracking-[0.1em] shadow-xl hover:scale-[1.01] transition-all">
                    <Save className="mr-2 h-6 w-6" /> Finalize & Submit Verified Receipt
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function WasteReceiptGenerationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse">Loading verified synchronization hub...</div>}>
      <WasteReceiptGenerationContent />
    </Suspense>
  );
}
