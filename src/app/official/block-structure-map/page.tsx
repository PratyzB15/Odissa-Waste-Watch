
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { mrfData } from "@/lib/mrf-data";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Network, Warehouse } from "lucide-react";

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

function BlockStructureMapContent() {
    const searchParams = useSearchParams();
    const blockNameParam = searchParams.get('block') || '';
    const districtParam = searchParams.get('district');
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    
    const structure = useMemo(() => {
        if (!mounted || !blockNameParam) return null;
        const blockRecords = mrfData.filter(d => 
            d.blockCovered.toLowerCase() === blockNameParam.toLowerCase() && 
            (!districtParam || d.district.toLowerCase() === districtParam.toLowerCase())
        );
        if (blockRecords.length === 0) return null;
        
        const districtOfBlock = blockRecords[0].district;
        const districtsSourceMap: Record<string, any> = {
            'jajpur': jajpurDistrictData, 'bhadrak': bhadrakDistrictData, 'jharsuguda': jharsugudaDistrictData,
            'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'boudh': boudhDistrictData,
            'cuttack': cuttackDistrictData, 'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData,
            'gajapati': gajapatiDistrictData, 'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData,
            'kalahandi': kalahandiDistrictData, 'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData,
            'kendujhar': kendujharDistrictData, 'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData
        };

        const source = districtsSourceMap[districtOfBlock.toLowerCase()];
        if (!source) return null;

        const blockDetails = source.getBlockDetails(blockNameParam);
        const ulbs: { [key: string]: { name: string; mrfs: any[] } } = {};

        blockRecords.forEach(record => {
            if (!ulbs[record.ulbName]) ulbs[record.ulbName] = { name: record.ulbName, mrfs: [] };
            const mrfGps = blockDetails?.gps?.filter((gp: any) => 
                gp.taggedMrf.toLowerCase().includes(record.mrfId.toLowerCase()) || 
                record.mrfId.toLowerCase().includes(gp.taggedMrf.toLowerCase())
            ) || [];
            
            ulbs[record.ulbName].mrfs.push({ 
                id: record.mrfId, 
                functionality: record.functionality, 
                gps: mrfGps.map((lgp: any) => ({ 
                    name: lgp.gpName, 
                    active: (blockDetails?.waste?.find((w: any) => w.gpName.toLowerCase() === lgp.gpName.toLowerCase())?.totalWasteKg || 0) > 0 
                })) 
            });
        });

        return { block: blockNameParam, ulbs: Object.values(ulbs) };
    }, [blockNameParam, districtParam, mounted]);

  if (!mounted || !structure) return <div className="p-12 text-center animate-pulse">Aggregating block structure map...</div>;

  return (
    <div className="space-y-6">
        <Card className="border-2 border-primary/20 bg-primary/[0.01]">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Network className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Block Hierarchy Mapping</CardTitle>
                        <CardDescription>Verified structural linkage of GPs to respective Processing Facilities (MRFs).</CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>

        <Card className="border-2 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-4">
            <CardTitle className="text-center text-4xl font-black text-primary uppercase tracking-tighter">{structure.block} Block Node</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-10 bg-card/50">
            <div className="flex flex-col items-center min-w-max pb-16 space-y-16">
                <div className="flex justify-center gap-20 relative">
                    {structure.ulbs.map((ulb) => (
                        <div key={ulb.name} className="flex flex-col items-center space-y-10">
                            <div className="bg-primary text-primary-foreground px-12 py-6 rounded-2xl shadow-xl border-4 border-primary/20">
                                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Urban Local Body</p>
                                <p className="text-2xl font-black uppercase">{ulb.name}</p>
                            </div>
                            
                            <div className="flex gap-16 relative pt-4">
                                {ulb.mrfs.map((mrf) => (
                                    <div key={mrf.id} className="flex flex-col items-center space-y-8">
                                        <div className="bg-card border-4 border-dashed border-primary/30 p-8 rounded-[2rem] shadow-lg w-[380px] text-center relative">
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-background border-2 border-primary/20 px-4 py-1 rounded-full text-[10px] font-black text-primary uppercase">Facility Node</div>
                                            <p className="text-xl font-black text-primary uppercase flex items-center justify-center gap-2">
                                                <Warehouse className="h-5 w-5" /> {mrf.id}
                                            </p>
                                            <Badge className={`mt-4 uppercase text-[9px] font-black ${mrf.functionality === 'Functional' ? 'bg-green-600' : 'bg-orange-500'}`}>{mrf.functionality}</Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 p-6 border-2 border-primary/10 bg-muted/5 rounded-[3rem] w-full">
                                            {mrf.gps.map((gp: any, i: number) => (
                                                <div key={i} className="bg-background border-2 border-primary/5 rounded-2xl p-4 text-center shadow-md group hover:border-primary/40 transition-all">
                                                    <div className="flex items-center justify-between gap-3 mb-2">
                                                        <div className={`h-2 w-2 rounded-full ${gp.active ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                                                        <Badge variant="outline" className="text-[8px] font-bold uppercase">{gp.active ? 'Synced' : 'Pending'}</Badge>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase text-foreground leading-tight">{gp.name}</p>
                                                </div>
                                            ))}
                                            {mrf.gps.length === 0 && <p className="col-span-2 text-center text-[10px] italic text-muted-foreground py-4">No GPs tagged to this facility.</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}

export default function BlockStructureMapPage() {
    return (<Suspense fallback={<div className="p-12 text-center">Loading block structure...</div>}><BlockStructureMapContent /></Suspense>);
}
