
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, Save, Sparkles, FileSearch, Info, FileText } from 'lucide-react';
import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { extractWasteReceiptData } from '@/ai/flows/invoice-data-extraction';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

function WasteReceiptGenerationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    district: searchParams.get('district') || '',
    block: searchParams.get('block') || '',
    taggedMrf: '',
    routeId: '',
    totalKg: '',
    plasticGm: '',
    paper: '',
    metal: '',
    glass: '',
    sanitation: '',
    others: ''
  });

  useEffect(() => { setMounted(true); }, []);

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
          setFormData(prev => ({
            ...prev,
            date: result.dateOfCollection || prev.date,
            taggedMrf: result.taggedMrf || prev.taggedMrf,
            routeId: result.routeId || prev.routeId,
            totalKg: result.totalWaste?.replace(/[^0-9.]/g, '') || '',
            plasticGm: result.plastic?.replace(/[^0-9.]/g, '') || '',
            paper: result.paper?.replace(/[^0-9.]/g, '') || '',
            metal: result.metal?.replace(/[^0-9.]/g, '') || '',
            glass: result.glass?.replace(/[^0-9.]/g, '') || '',
            sanitation: result.sanitation?.replace(/[^0-9.]/g, '') || '',
            others: result.others?.replace(/[^0-9.]/g, '') || ''
          }));
          toast({ title: "Extraction Complete", description: "Fields populated from photo." });
        }
      } catch (err) {
        toast({ title: "Extraction Failed", description: "AI could not read the photo. Please enter manually.", variant: "destructive" });
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!db) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'wasteDetails'), {
        date: formData.date,
        district: formData.district,
        block: formData.block,
        mrf: formData.taggedMrf,
        routeId: formData.routeId,
        submittedByRole: 'gp',
        gpName: searchParams.get('gp') || 'Nodal GP',
        driverSubmitted: parseFloat(formData.totalKg) || 0,
        totalGpLoad: parseFloat(formData.totalKg) || 0,
        plastic: parseFloat(formData.plasticGm) || 0,
        paper: parseFloat(formData.paper) || 0,
        metal: parseFloat(formData.metal) || 0,
        glass: parseFloat(formData.glass) || 0,
        sanitation: parseFloat(formData.sanitation) || 0,
        others: parseFloat(formData.others) || 0,
        gpBreakdown: [{ name: searchParams.get('gp') || 'Nodal GP', amount: parseFloat(formData.totalKg) || 0 }],
        submittedAt: new Date().toISOString()
      });
      toast({ title: "Receipt Generated", description: "Data synced with master ledger." });
      router.push(`/gp-ulb?${searchParams.toString()}`);
    } catch (err) {
      toast({ title: "Error", description: "Submission failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-2 border-primary/20 shadow-lg bg-primary/[0.02]">
            <CardHeader><CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-primary"><Sparkles className="h-4 w-4" /> AI Receipt Assistant</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center space-y-4 hover:bg-primary/5 transition-colors cursor-pointer relative group">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto group-hover:scale-110 transition-transform">
                      {isExtracting ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <UploadCloud className="h-8 w-8 text-primary" />}
                    </div>
                    <p className="text-xs font-black uppercase text-primary">{isExtracting ? 'Extracting...' : 'Upload Receipt Photo'}</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <Card className="border-2 shadow-xl border-primary/20">
            <CardHeader className="bg-primary/5 border-b pb-6"><CardTitle className="text-xl font-black uppercase flex items-center gap-2"><FileText className="h-6 w-6" /> Waste Receipt Generation</CardTitle></CardHeader>
            <CardContent className="p-8 grid grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">District</Label><Input value={formData.district} disabled className="bg-muted/20 font-bold" /></div>
                <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Block</Label><Input value={formData.block} disabled className="bg-muted/20 font-bold" /></div>
                <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Tagged MRF</Label><Input value={formData.taggedMrf} onChange={e => setFormData({...formData, taggedMrf: e.target.value})} className="font-bold" /></div>
                <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Route ID</Label><Input value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} className="font-mono font-bold" /></div>
                <div className="space-y-2"><Label className="text-[9px] font-black uppercase opacity-60">Total (Kg)</Label><Input type="number" value={formData.totalKg} onChange={e => setFormData({...formData, totalKg: e.target.value})} className="font-mono font-bold" /></div>
            </CardContent>
            <CardFooter className="bg-primary/5 border-t p-6">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 font-black uppercase tracking-widest shadow-lg">
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />} 
                    Finalize & Submit Verified Receipt
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function WasteReceiptGenerationPage() {
  return (<Suspense fallback={<div>Loading...</div>}><WasteReceiptGenerationContent /></Suspense>);
}
