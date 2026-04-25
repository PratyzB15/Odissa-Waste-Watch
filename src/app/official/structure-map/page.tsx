'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { mrfData } from "@/lib/mrf-data";
import { useMemo, Suspense, useState, useEffect } from "react";
import { Building, Home, Warehouse } from "lucide-react";
import { jharsugudaDistrictData } from "@/lib/disJharsuguda";
import { jajpurDistrictData } from "@/lib/disJajpur";
import { bhadrakDistrictData } from "@/lib/disBhadrak";
import { bargarhDistrictData } from "@/lib/disBargarh";
import { sonepurDistrictData } from "@/lib/disSonepur";
import { angulDistrictData } from "@/lib/disAngul";
import { balangirDistrictData } from "@/lib/disBalangir";
import { boudhDistrictData } from "@/lib/disBoudh";
import { cuttackDistrictData } from "@/lib/disCuttack";
import { deogarhDistrictData } from "@/lib/disDeogarh";
import { dhenkanalDistrictData } from "@/lib/disDhenkanal";
import { gajapatiDistrictData } from "@/lib/disGajapati";
import { ganjamDistrictData } from "@/lib/disGanjam";
import { jagatsinghpurDistrictData } from "@/lib/disJagatsinghpur";
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

function StructureMapContent() {
    const searchParams = useSearchParams();
    const districtName = searchParams.get('district') || 'Bhadrak';
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    
    const structure = useMemo(() => {
        if (!mounted) return null;
        const districtRecords = mrfData.filter(d => d.district.toLowerCase() === districtName.toLowerCase());
        if (districtRecords.length === 0) return null;

        const districtsSourceMap: Record<string, any> = {
            'jajpur': jajpurDistrictData, 'bhadrak': bhadrakDistrictData, 'jharsuguda': jharsugudaDistrictData,
            'bargarh': bargarhDistrictData, 'sonepur': sonepurDistrictData, 'angul': angulDistrictData,
            'balangir': balangirDistrictData, 'boudh': boudhDistrictData, 'cuttack': cuttackDistrictData,
            'deogarh': deogarhDistrictData, 'dhenkanal': dhenkanalDistrictData, 'gajapati': gajapatiDistrictData,
            'ganjam': ganjamDistrictData, 'jagatsinghpur': jagatsinghpurDistrictData, 'kalahandi': kalahandiDistrictData,
            'kandhamal': kandhamalDistrictData, 'kendrapara': kendraparaDistrictData, 'kendujhar': kendujharDistrictData,
            'balasore': balasoreDistrictData, 'baleswar': baleswarDistrictData, 'khordha': khordhaDistrictData,
            'koraput': koraputDistrictData, 'malkangiri': malkangiriDistrictData, 'mayurbhanj': mayurbhanjDistrictData
        };

        const source = districtsSourceMap[districtName.toLowerCase()];
        if (!source) return null;

        const blocksData: { [key: string]: { name: string, records: typeof mrfData, gps: any[] } } = {};
        districtRecords.forEach(r => { if (!blocksData[r.blockCovered]) blocksData[r.blockCovered] = { name: r.blockCovered, records: [], gps: [] }; blocksData[r.blockCovered].records.push(r); });

        Object.values(blocksData).forEach(blockInfo => {
            const blockDetails = source.getBlockDetails(blockInfo.name);
            if (blockDetails?.gps) {
                blockInfo.gps = blockDetails.gps.map((gp: any) => {
                    const w = blockDetails.waste.find((waste: any) => waste.gpName.toLowerCase() === gp.gpName.toLowerCase());
                    const collected = w ? (w.totalWasteKg || (w.monthlyWasteTotalGm / 1000) || 0) : 0;
                    return { name: gp.gpName, active: collected > 0, generated: collected * 1.05, collected };
                });
            }
        });

        const blocks = Object.values(blocksData).map(b => ({ name: b.name, gps: b.gps }));
        return { district: districtName, blocks, totalDistrictGenerated: blocks.reduce((t, b) => t + b.gps.reduce((bt: number, g: any) => bt + g.generated, 0), 0), totalDistrictCollected: blocks.reduce((t, b) => t + b.gps.reduce((bt: number, g: any) => bt + g.collected, 0), 0) };
    }, [districtName, mounted]);

    if (!mounted || !structure) return <div className="p-12 text-center text-muted-foreground animate-pulse">Aggregating structure map...</div>;

  return (
    <Card className="border-2 border-primary/20 shadow-xl">
      <CardHeader className="bg-primary/5 border-b"><CardTitle className="text-4xl font-headline uppercase tracking-tight">District Master Hierarchy: {structure.district}</CardTitle></CardHeader>
      <CardContent className="p-6 md:p-16 overflow-x-auto bg-muted/5"><div className="flex flex-col items-center min-w-max px-32 pb-24">
          <div className="flex flex-col items-center gap-4 bg-primary text-primary-foreground rounded-[3rem] px-32 py-16 font-black text-7xl mb-28 border-8 border-primary-foreground/10">{structure.district}<div className="flex gap-16 mt-10"><Badge variant="secondary" className="text-3xl font-mono px-10 py-3 rounded-2xl">{(structure.totalDistrictGenerated / 1000).toFixed(1)}T LOAD</Badge><Badge variant="secondary" className="text-3xl font-mono px-10 py-3 rounded-2xl">{(structure.totalDistrictCollected / 1000).toFixed(1)}T VERI.</Badge></div></div>
          <div className="flex justify-center gap-64 flex-nowrap relative"><div className="absolute top-0 left-0 right-0 h-2.5 bg-primary/20 rounded-full mx-48"></div>
            {structure.blocks.map((block: any) => (
                  <div key={block.name} className="flex flex-col items-center pt-24 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-24 bg-primary/20 rounded-full"></div>
                    <div className="bg-card border-4 border-primary/30 rounded-[2.5rem] px-20 py-12 font-black shadow-2xl min-w-[450px]"><span className="text-5xl uppercase tracking-tighter text-primary">{block.name}</span></div>
                    <div className="w-2 bg-primary/10 h-24 rounded-full"></div>
                    <div className="relative flex flex-col gap-12 min-w-[350px]">{block.gps.map((gp: any, index: number) => (
                         <div key={index} className="relative flex flex-col items-center"><div className="bg-card border-2 rounded-[2rem] p-10 text-center shadow-xl w-80"><p className="font-black text-xl truncate uppercase">{gp.name}</p><div className={`w-6 h-6 rounded-full mt-4 mx-auto ${gp.active ? 'bg-green-500 animate-pulse' : 'bg-muted'}`}></div></div></div>
                       ))}</div></div>
                ))}
          </div></div></CardContent></Card>
  );
}

export default function StructureMapPage() {
    return (<Suspense fallback={<div className="p-12 text-center animate-pulse">Loading structure map...</div>}><StructureMapContent /></Suspense>);
}
