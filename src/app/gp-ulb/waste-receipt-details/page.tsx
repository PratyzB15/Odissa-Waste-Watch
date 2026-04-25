'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Calendar, 
  Database, 
  FileText, 
  Truck, 
  Anchor, 
  LayoutGrid, 
  ClipboardList,
  Save,
  Route,
  MapPin,
  ListPlus,
  Sparkles,
  Loader2,
  UploadCloud
} from 'lucide-react';
import React, { useMemo, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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

function WasteReceiptDetailsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const gpName = searchParams.get('gp') || '';
  const ulbParam = searchParams.get('ulb') || '';
  const districtParam = searchParams.get('district') || '';
  const blockParam = searchParams.get('block') || '';
  
  const [mounted, setMounted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // GP Form State
  const [gpFormData, setGpFormData] = useState({
    dateOfCollection: new Date().toISOString().split('T')[0],
    totalCollected: '',
    plastic: '',
    paper: '',
    metal: '',
    glass: '',
    sanitation: '',
    others: '',
  });

  useEffect(() => { setMounted(true); }, []);

  const routeContext = useMemo(() => {
    if (!mounted || !districtParam || !blockParam || role !== 'gp') return null;
    const districtsMap: Record<string, any> = {
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
    const source = districtsMap[districtParam.toLowerCase()];
    if (!source) return null;
    return source.getGpDetails(gpName);
  }, [mounted, districtParam, blockParam, gpName, role]);

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
          if (result.dateOfCollection) setGpFormData(prev => ({ ...prev, dateOfCollection: result.dateOfCollection! }));
          if (result.totalWaste) setGpFormData(prev => ({ ...prev, totalCollected: result.totalWaste! }));
          if (result.plastic) setGpFormData(prev => ({ ...prev, plastic: result.plastic! }));
          if (result.paper) setGpFormData(prev => ({ ...prev, paper: result.paper! }));
          if (result.metal) setGpFormData(prev => ({ ...prev, metal: result.metal! }));
          if (result.glass) setGpFormData(prev => ({ ...prev, glass: result.glass! }));
          if (result.sanitation) setGpFormData(prev => ({ ...prev, sanitation: result.sanitation! }));
          if (result.others) setGpFormData(prev => ({ ...prev, others: result.others! }));
          
          toast({ title: "Extraction Complete", description: "Form fields populated from receipt photo." });
        }
      } catch (err) {
        toast({ title: "Extraction Failed", description: "Could not read the receipt photo.", variant: "destructive" });
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGpSubmit = () => {
    console.log("GP Submitting Verified Data:", { ...gpFormData, context: routeContext });
    toast({ title: "Data Transmitted", description: "The collection receipt has been successfully transmitted to the ULB Hub." });
    setGpFormData({ dateOfCollection: new Date().toISOString().split('T')[0], totalCollected: '', plastic: '', paper: '', metal: '', glass: '', sanitation: '', others: '' });
  };

  const ulbVerificationData = useMemo(() => {
    if (!mounted || role !== 'ulb' || !districtParam) return { drRecs: [], gpRecs: [] };
    
    const drRecs = [
      { id: 1, driver: "Ramesh Kumar", phone: "9876543210", routeId: "AANGN1", date: "2024-07-28", mrf: ulbParam, total: 155, plastic: 50, paper: 40, metal: 15, glass: 20, sanitation: 10, others: 20 },
      { id: 2, driver: "Sita Majhi", phone: "7752XXXXXX", routeId: "AANGT2", date: "2024-07-28", mrf: ulbParam, total: 88, plastic: 20, paper: 30, metal: 10, glass: 15, sanitation: 5, others: 8 }
    ];

    const gpRecs = [
      { id: 1, date: "2024-07-28", district: districtParam, block: blockParam, mrf: ulbParam, routeId: "AANGN1", total: 160, plasticGm: 52000, paper: 42, metal: 16, glass: 22, sanitation: 12, others: 16 },
      { id: 2, date: "2024-07-28", district: districtParam, block: blockParam, mrf: ulbParam, routeId: "AANGT2", total: 90, plasticGm: 21000, paper: 32, metal: 11, glass: 16, sanitation: 6, others: 5 }
    ];

    return { drRecs, gpRecs };
  }, [mounted, role, districtParam, blockParam, ulbParam]);

  if (!mounted) return null;

  // RENDER GP FORM
  if (role === 'gp') {
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
              </CardContent>
          </Card>
          
          <Card className="border-2 border-dashed bg-muted/20">
              <CardContent className="py-6 flex items-start gap-4">
                  <ClipboardList className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-tight">GP Administrative Roster</p>
                      <p className="text-[9px] text-muted-foreground font-medium italic leading-relaxed">
                          The AI assistant is optimized to identify the official regional identifiers for {districtParam} district and {blockParam} block.
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
                    <Save className="h-6 w-6" /> GP Waste Collection Receipt
                </CardTitle>
                <CardDescription className="font-bold text-primary opacity-70">Submit verified collection load for {gpName} node.</CardDescription>
            </CardHeader>
            
            <ScrollArea className="h-[75vh]">
                <CardContent className="p-8 space-y-10">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                            <Route className="h-3 w-3 text-primary" /> Nodal Context
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Date of Collection</Label>
                                <Input type="date" value={gpFormData.dateOfCollection} onChange={(e) => setGpFormData({...gpFormData, dateOfCollection: e.target.value})} className="font-bold bg-muted/20" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">District Node</Label>
                                <Input value={districtParam.toUpperCase()} disabled className="font-bold bg-muted/20 uppercase" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Administrative Block</Label>
                                <Input value={blockParam.toUpperCase()} disabled className="font-bold bg-muted/20 uppercase" />
                            </div>
                             <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Assigned Route ID</Label>
                                <Input value={routeContext?.routes?.[0]?.routeId || 'CIRCUIT-01'} disabled className="font-mono font-black text-primary border-primary/10" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase opacity-60">Tagged Processing Facility (MRF)</Label>
                            <Input value={(routeContext?.mapping?.taggedMrf || ulbParam).toUpperCase()} disabled className="font-black text-primary border-primary/20" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                            <Database className="h-3 w-3 text-primary" /> Verified Quantification (Kg)
                        </h3>
                        <div className="bg-muted/10 border-2 border-dashed rounded-2xl p-6">
                            <div className="space-y-1.5 max-w-sm mx-auto text-center">
                                <Label className="text-xs font-black uppercase text-primary">Total Amount Collected</Label>
                                <Input 
                                    type="number" 
                                    placeholder="0.0" 
                                    value={gpFormData.totalCollected} 
                                    onChange={(e) => setGpFormData({...gpFormData, totalCollected: e.target.value})}
                                    className="h-12 text-center text-xl font-black border-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                            <ListPlus className="h-3 w-3 text-primary" /> Stream Breakdown
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Plastic (gm)</Label>
                                <Input type="number" placeholder="0.0" value={gpFormData.plastic} onChange={(e) => setGpFormData({...gpFormData, plastic: e.target.value})} className="font-mono font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Paper (Kg)</Label>
                                <Input type="number" placeholder="0.0" value={gpFormData.paper} onChange={(e) => setGpFormData({...gpFormData, paper: e.target.value})} className="font-mono font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Metal (Kg)</Label>
                                <Input type="number" placeholder="0.0" value={gpFormData.metal} onChange={(e) => setGpFormData({...gpFormData, metal: e.target.value})} className="font-mono font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Glass (Kg)</Label>
                                <Input type="number" placeholder="0.0" value={gpFormData.glass} onChange={(e) => setGpFormData({...gpFormData, glass: e.target.value})} className="font-mono font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Sanitation Waste (Kg)</Label>
                                <Input type="number" placeholder="0.0" value={gpFormData.sanitation} onChange={(e) => setGpFormData({...gpFormData, sanitation: e.target.value})} className="font-mono font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Others (Kg)</Label>
                                <Input type="number" placeholder="0.0" value={gpFormData.others} onChange={(e) => setGpFormData({...gpFormData, others: e.target.value})} className="font-mono font-bold" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </ScrollArea>
            <CardFooter className="bg-primary/5 border-t p-6">
                <Button onClick={handleGpSubmit} disabled={isExtracting} className="w-full h-14 text-lg font-black uppercase tracking-[0.1em] shadow-xl hover:scale-[1.01] transition-all">
                    <Save className="mr-2 h-6 w-6" /> Finalize & Transmit Receipt
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // RENDER ULB VERIFICATION HUB (UNCHANGED TABLES)
  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Waste Receipt Verification Hub</CardTitle>
              <CardDescription className="font-bold italic">Authoritative digital paper trail for {ulbParam} facility node.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="drivers">
        <AccordionItem value="drivers" className="border-none">
          <Card className="border-2 shadow-lg overflow-hidden">
            <AccordionTrigger className="p-6 hover:no-underline bg-muted/30 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
              <div className="flex items-center gap-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-tighter text-foreground">Receipts from Drivers</span>
                <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                  {ulbVerificationData.drRecs.length} SYNCED
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1500px]">
                  <Table className="border-collapse border text-[10px]">
                    <TableHeader className="bg-muted/80">
                      <TableRow>
                        <TableHead className="w-[200px] uppercase font-black border">Driver Name</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Phone No.</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border">Tagged MRF</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-right bg-primary/5 text-primary">Total (Kg)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Plastic</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Paper</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Metal</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Glass</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Sanitation</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Others</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ulbVerificationData.drRecs.map((row) => (
                        <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b h-12">
                          <TableCell className="border-r font-black uppercase text-foreground">{row.driver}</TableCell>
                          <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.phone}</TableCell>
                          <TableCell className="border-r font-mono text-center font-black text-primary">{row.routeId}</TableCell>
                          <TableCell className="border-r text-center font-bold">{row.date}</TableCell>
                          <TableCell className="border-r text-[9px] font-black uppercase text-primary">{row.mrf}</TableCell>
                          <TableCell className="border-r text-right font-mono font-black text-primary text-sm bg-primary/[0.02]">{row.total.toLocaleString()} KG</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plastic}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.glass}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.sanitation}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.others}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="gps" className="border-none">
          <Card className="border-2 shadow-lg overflow-hidden">
            <AccordionTrigger className="p-6 hover:no-underline bg-muted/30 data-[state=open]:bg-primary/5 transition-all border-b border-dashed">
              <div className="flex items-center gap-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
                <span className="font-black text-xl uppercase tracking-tighter text-foreground">Receipts from GP Portal</span>
                <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                  {ulbVerificationData.gpRecs.length} SYNCED
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1500px]">
                  <Table className="border-collapse border text-[10px]">
                    <TableHeader className="bg-muted/80">
                      <TableRow>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Date</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border">District</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border">Block</TableHead>
                        <TableHead className="w-[150px] uppercase font-black border">Tagged MRF</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-center">Route ID</TableHead>
                        <TableHead className="w-[120px] uppercase font-black border text-right bg-blue-50 text-blue-800">Total (Kg)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Plastic (gm)</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Paper</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Metal</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Glass</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Sanitation</TableHead>
                        <TableHead className="w-[100px] uppercase font-black border text-right">Others</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ulbVerificationData.gpRecs.map((row) => (
                        <TableRow key={row.id} className="hover:bg-primary/[0.01] border-b h-12">
                          <TableCell className="border-r font-mono text-center font-bold text-muted-foreground">{row.date}</TableCell>
                          <TableCell className="border-r font-black uppercase text-foreground">{row.district}</TableCell>
                          <TableCell className="border-r font-black uppercase text-foreground">{row.block}</TableCell>
                          <TableCell className="border-r text-[9px] font-black uppercase text-primary">{row.mrf}</TableCell>
                          <TableCell className="border-r font-mono text-center font-black text-primary">{row.routeId}</TableCell>
                          <TableCell className="border-r text-right font-mono font-black text-blue-800 text-sm bg-blue-50/50">{row.total.toLocaleString()} KG</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.plasticGm.toLocaleString()}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.paper}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.metal}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.glass}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.sanitation}</TableCell>
                          <TableCell className="border-r text-right font-mono text-muted-foreground">{row.others}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
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