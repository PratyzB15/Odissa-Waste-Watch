'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OdishaLogo } from '@/components/odisha-logo';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// District Data Imports for GP Mapping Resolution
import { mrfData } from '@/lib/mrf-data';
import { angulDistrictData } from '@/lib/disAngul';
import { balangirDistrictData } from '@/lib/disBalangir';
import { bhadrakDistrictData } from '@/lib/disBhadrak';
import { bargarhDistrictData } from '@/lib/disBargarh';
import { sonepurDistrictData } from '@/lib/disSonepur';
import { boudhDistrictData } from '@/lib/disBoudh';
import { cuttackDistrictData } from '@/lib/disCuttack';
import { deogarhDistrictData } from '@/lib/disDeogarh';
import { dhenkanalDistrictData } from '@/lib/disDhenkanal';
import { gajapatiDistrictData } from '@/lib/disGajapati';
import { ganjamDistrictData } from '@/lib/disGanjam';
import { jagatsinghpurDistrictData } from '@/lib/disJagatsinghpur';
import { jajpurDistrictData } from '@/lib/disJajpur';
import { jharsugudaDistrictData } from '@/lib/disJharsuguda';
import { kalahandiDistrictData } from '@/lib/disKalahandi';
import { kandhamalDistrictData } from '@/lib/disKandhamal';
import { kendraparaDistrictData } from '@/lib/disKendrapara';
import { kendujharDistrictData } from '@/lib/disKendujhar';
import { balasoreDistrictData } from '@/lib/disBalasore';
import { baleswarDistrictData } from '@/lib/disBaleswar';
import { khordhaDistrictData } from '@/lib/disKhordha';
import { koraputDistrictData } from '@/lib/disKoraput';
import { malkangiriDistrictData } from '@/lib/disMalkangiri';
import { mayurbhanjDistrictData } from '@/lib/disMayurbhanj';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  contact: z.string().min(10, { message: 'Please enter a valid number.' }),
  district: z.string({ required_error: 'Please select a district.' }),
  block: z.string({ required_error: 'Please select a block.' }),
  ulb: z.string({ required_error: 'Please select an MRF Node.' }),
  gp: z.string({ required_error: 'Please select your GP.' }),
  otp: z.string().regex(/^\d{4}$/, { message: 'Enter 4-digit OTP.' }),
});

export default function GpLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact: '',
      otp: '',
    },
  });

  const selectedDistrict = form.watch('district');
  const selectedBlock = form.watch('block');
  const selectedUlb = form.watch('ulb');

  // Hierarchical Data Resolution
  const { districts, blocks, ulbs, gps } = useMemo(() => {
    // 1. All unique districts
    const dList = Array.from(new Set(mrfData.map(d => d.district))).sort();

    // 2. Blocks filtered by District
    const bList = selectedDistrict 
      ? Array.from(new Set(mrfData.filter(d => d.district === selectedDistrict).map(d => d.blockCovered))).sort()
      : [];

    // 3. ULBs (MRFs) filtered by District AND Block
    const uList = (selectedDistrict && selectedBlock)
      ? Array.from(new Set(mrfData.filter(d => d.district === selectedDistrict && d.blockCovered === selectedBlock).map(d => d.ulbName))).sort()
      : [];

    // 4. GPs filtered by the selected MRF (ULB)
    let gpList: string[] = [];
    if (selectedDistrict && selectedUlb) {
        const districtsMap: Record<string, any> = {
            'angul': angulDistrictData, 'balangir': balangirDistrictData, 'bhadrak': bhadrakDistrictData,
            'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
            'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
            'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
            'jajpur': jajpurDistrictData, 'jharsuguda': jharsugudaDistrictData, 'kalahandi': kalahandiDistrictData,
            'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
            'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
            'koraput': koraputDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData
        };
        const source = districtsMap[selectedDistrict.toLowerCase()];
        if (source && source.data.gpMappings) {
            gpList = Array.from(new Set(
                source.data.gpMappings
                .filter((m: any) => m.taggedUlb.toLowerCase().includes(selectedUlb.toLowerCase()) || selectedUlb.toLowerCase().includes(m.taggedUlb.toLowerCase()))
                .map((m: any) => m.gpName)
            )).sort();
        }
    }

    return { districts: dList, blocks: bList, ulbs: uList, gps: gpList };
  }, [selectedDistrict, selectedBlock, selectedUlb]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simplified self-provided OTP logic
    if (values.otp.length === 4) {
      toast({ title: 'Authentication Successful', description: 'Proceeding to GP Portal...' });
      const params = new URLSearchParams();
      params.set('name', values.name);
      params.set('role', 'gp');
      params.set('gp', values.gp);
      params.set('ulb', values.ulb);
      params.set('block', values.block);
      params.set('district', values.district);
      router.push(`/gp-ulb?${params.toString()}`);
    } else {
      toast({ title: 'Invalid OTP', description: 'Please enter a 4-digit code.', variant: 'destructive' });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <OdishaLogo className="h-14 w-14 mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tight">GP Portal Access</CardTitle>
          <CardDescription className="font-medium">Hierarchical selection for authorized GP officials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase">Official Name</FormLabel>
                        <FormControl><Input placeholder="Full Name" {...field} className="h-11 font-bold"/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase">Mobile Number</FormLabel>
                        <FormControl><Input placeholder="10-digit number" {...field} className="h-11 font-bold"/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-black uppercase">District</FormLabel>
                            <Select onValueChange={(v) => { field.onChange(v); form.setValue('block', ''); form.setValue('ulb', ''); form.setValue('gp', ''); }} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="h-11 font-bold"><SelectValue placeholder="District" /></SelectTrigger></FormControl>
                            <SelectContent><ScrollArea className="h-60">{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</ScrollArea></SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="block"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-black uppercase">Block</FormLabel>
                            <Select 
                                onValueChange={(v) => { field.onChange(v); form.setValue('ulb', ''); form.setValue('gp', ''); }} 
                                defaultValue={field.value}
                                disabled={!selectedDistrict}
                            >
                                <FormControl><SelectTrigger className="h-11 font-bold"><SelectValue placeholder="Block" /></SelectTrigger></FormControl>
                                <SelectContent><ScrollArea className="h-60">{blocks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</ScrollArea></SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="ulb"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-black uppercase">MRF / Facility Node</FormLabel>
                        <Select 
                            onValueChange={(v) => { field.onChange(v); form.setValue('gp', ''); }} 
                            defaultValue={field.value}
                            disabled={!selectedBlock}
                        >
                        <FormControl><SelectTrigger className="h-11 font-bold"><SelectValue placeholder="Select MRF Node" /></SelectTrigger></FormControl>
                        <SelectContent><ScrollArea className="h-48">{ulbs.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</ScrollArea></SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gp"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-black uppercase">Gram Panchayat</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedUlb}>
                        <FormControl><SelectTrigger className="h-11 font-bold"><SelectValue placeholder="Select your GP" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <ScrollArea className="h-48">
                                {gps.map(gp => <SelectItem key={gp} value={gp}>{gp}</SelectItem>)}
                            </ScrollArea>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                  />

                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase">Self-Provided OTP (4 Digits)</FormLabel>
                      <FormControl><Input placeholder="e.g., 1234" maxLength={4} {...field} className="h-11 font-bold"/></FormControl>
                      <FormMessage />
                      <p className="text-[10px] text-muted-foreground mt-2 italic">Enter any 4-digit code to sign your login for this session.</p>
                    </FormItem>
                  )}
                />

              <Button type="submit" className="w-full h-12 text-lg font-black uppercase tracking-widest" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Access GP Portal
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
          <Link href="/roles">← Back to Role Selection</Link>
        </Button>
      </div>
    </div>
  );
}