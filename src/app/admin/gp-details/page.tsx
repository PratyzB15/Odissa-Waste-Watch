'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Building, Home, FileStack, Info, TableProperties } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

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

export default function StateInformationAboutGpsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const masterDistrictStructure = useMemo(() => {
    if (!mounted) return [];

    const districtSources = [
      angulDistrictData, balangirDistrictData, bhadrakDistrictData, bargarhDistrictData,
      sonepurDistrictData, boudhDistrictData, cuttackDistrictData, deogarhDistrictData,
      dhenkanalDistrictData, gajapatiDistrictData, ganjamDistrictData, jagatsinghpurDistrictData,
      jajpurDistrictData, jharsugudaDistrictData, kalahandiDistrictData, kandhamalDistrictData,
      kendraparaDistrictData, kendujharDistrictData, balasoreDistrictData, baleswarDistrictData,
      khordhaDistrictData, koraputDistrictData, mayurbhanjDistrictData, malkangiriDistrictData,
      rayagadaDistrictData, nabarangpurDistrictData, nayagarhDistrictData, nuapadaDistrictData,
      puriDistrictData, sambalpurDistrictData
    ];

    return districtSources.map(source => {
      const gpsList = (source.data.gpMappings || []).map((gp: any, idx: number) => {
        const wasteInfo = (source.data.wasteGeneration || []).find((w: any) => 
          w.gpName.toLowerCase().trim() === gp.gpName.toLowerCase().trim()
        );

        return {
          id: idx,
          mrfName: gp.taggedMrf,
          ulbName: gp.taggedUlb,
          gpName: gp.gpName,
          households: wasteInfo?.totalHouseholds || 0,
          schools: wasteInfo?.schools || 0,
          anganwadis: wasteInfo?.anganwadis || 0,
          commercial: wasteInfo?.commercial || 0,
          dailyWaste: wasteInfo ? (wasteInfo.dailyWasteTotalGm || (wasteInfo.totalWasteKg ? wasteInfo.totalWasteKg * 1000 / 30 : 0)) : 0,
          monthlyWaste: wasteInfo ? (wasteInfo.monthlyWasteTotalGm || (wasteInfo.totalWasteKg ? wasteInfo.totalWasteKg * 1000 : 0)) : 0
        };
      });

      return {
        name: source.district,
        gpsCount: gpsList.length,
        gps: gpsList
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [mounted]);

  if (!mounted) return <div className="p-12 text-center text-muted-foreground animate-pulse">Syncing state-wide GP registry...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <TableProperties className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline uppercase tracking-tight">Information about GPs (State Ledger)</CardTitle>
              <CardDescription className="text-lg font-bold">Authoritative state-wide directory of quantification and demographic survey data.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {masterDistrictStructure.map((district) => (
          <AccordionItem value={district.name} key={district.name} className="border-none">
            <Card className="overflow-hidden border-2 shadow-md">
              <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all">
                <div className="flex justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <Building className="h-6 w-6 text-primary" />
                    <span className="font-black text-xl uppercase tracking-tighter text-foreground">{district.name} District</span>
                  </div>
                  <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                    {district.gpsCount} GPs TAGGED
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 bg-background">
                <ScrollArea className="w-full">
                  <div className="min-w-[1400px]">
                    <Table className="border-collapse border text-[10px]">
                      <TableHeader className="bg-muted/80">
                        <TableRow>
                          <TableHead className="w-[60px] text-center border font-black uppercase tracking-widest">S.No.</TableHead>
                          <TableHead className="w-[220px] border font-black uppercase tracking-widest">Facility (ULB/MRF)</TableHead>
                          <TableHead className="w-[180px] border font-black uppercase tracking-widest">GP Node</TableHead>
                          <TableHead className="w-[100px] border font-black uppercase text-center tracking-widest">Households</TableHead>
                          <TableHead className="w-[80px] border font-black uppercase text-center tracking-widest">Schools</TableHead>
                          <TableHead className="w-[80px] border font-black uppercase text-center tracking-widest">Anganwadis</TableHead>
                          <TableHead className="w-[100px] border font-black uppercase text-center tracking-widest">Comm. Est.</TableHead>
                          <TableHead className="w-[150px] border font-black uppercase text-right px-6 tracking-widest bg-primary/5">Waste/Day (Gm)</TableHead>
                          <TableHead className="w-[150px] border font-black uppercase text-right px-6 tracking-widest bg-primary/5">Waste/Month (Gm)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {district.gps.map((gp, idx) => (
                          <TableRow key={idx} className="hover:bg-primary/[0.01] border-b h-12 transition-colors">
                            <TableCell className="text-center border-r font-mono text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell className="border-r font-bold uppercase leading-tight">
                              <p className="text-primary">{gp.mrfName}</p>
                              <p className="text-[8px] text-muted-foreground italic">{gp.ulbName}</p>
                            </TableCell>
                            <TableCell className="border-r font-black uppercase text-foreground">{gp.gpName}</TableCell>
                            <TableCell className="text-center border-r font-mono font-bold text-sm">{(gp.households || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-center border-r font-mono">{(gp.schools || 0)}</TableCell>
                            <TableCell className="text-center border-r font-mono">{(gp.anganwadis || 0)}</TableCell>
                            <TableCell className="text-center border-r font-medium text-[9px] truncate max-w-[100px]">{(gp.commercial || "0")}</TableCell>
                            <TableCell className="text-right border-r font-mono font-black text-primary px-6">{(gp.dailyWaste || 0).toLocaleString(undefined, {maximumFractionDigits: 1})}</TableCell>
                            <TableCell className="text-right border-r font-mono font-black text-primary px-6">{(gp.monthlyWaste || 0).toLocaleString(undefined, {maximumFractionDigits: 1})}</TableCell>
                          </TableRow>
                        ))}
                        {district.gps.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center italic text-muted-foreground opacity-40 uppercase font-black text-sm">No survey records found for this district.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      <Card className="border-2 border-dashed bg-muted/20">
        <CardContent className="py-6 flex items-start gap-4">
            <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-tight">Institutional Audit Guidelines</p>
                <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                    This directory resolves high-fidelity demographic and quantification metrics from official state survey reports. All GP nodes are stagnant and anchored to their respective administrative blocks across the 30 districts. Material stream profiles are monitored separately through the "Waste Collection Details" portal.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
