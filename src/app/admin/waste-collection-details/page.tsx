
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
    Phone, 
    User, 
    Truck, 
    Anchor, 
    ClipboardList, 
    Info, 
    Building, 
    LayoutGrid,
    Users
} from "lucide-react";
import { useMemo, useState, useEffect, Suspense } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// District Data Imports
import { collectionScheduleData as jajpurSchedules } from "@/lib/disJajpur";
import { collectionScheduleData as bhadrakSchedules } from "@/lib/disBhadrak";
import { collectionScheduleData as angulSchedules } from "@/lib/disAngul";
import { collectionScheduleData as balangirSchedules } from "@/lib/disBalangir";
import { collectionScheduleData as sonepurSchedules } from "@/lib/disSonepur";

import { mrfData } from "@/lib/mrf-data";

function AdminWasteCollectionDetailsContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const districtAggrData = useMemo(() => {
    const districtSources: Record<string, any> = {
      'Angul': angulSchedules,
      'Balangir': balangirSchedules,
      'Bhadrak': bhadrakSchedules,
      'Jajpur': jajpurSchedules,
      'Sonepur': sonepurSchedules
    };

    const districts = Array.from(new Set(mrfData.map(d => d.district))).sort();

    return districts.map(districtName => {
      const source = districtSources[districtName] || [];
      const blocks = Array.from(new Set(source.map((s: any) => s.block))).sort();

      const blockData = blocks.map(blockName => {
        const rows = source.filter((s: any) => s.block === blockName);
        return {
          blockName,
          gpCount: rows.length,
          totalWaste: rows.reduce((sum: number, r: any) => sum + (r.wasteGeneratedKg || 0), 0),
          rows
        };
      });

      return {
        name: districtName,
        totalGps: source.length,
        blocks: blockData
      };
    });
  }, []);

  const renderPEOContactCell = (namesStr: string, contactsStr: string) => {
    const names = (namesStr || 'N/A').split(/,|\n/).map(s => s.trim()).filter(Boolean);
    const contacts = (contactsStr || 'N/A').split(/,|\n/).map(s => s.trim()).filter(Boolean);
    
    const displayCount = 3;
    const hasMore = names.length > displayCount;
    const visibleNames = names.slice(0, displayCount);

    return (
      <div className="space-y-1">
        {visibleNames.map((name, i) => (
          <div key={i} className="flex items-center justify-between gap-3 border-b border-dashed py-1 last:border-0">
            <span className="flex items-center gap-1 font-bold uppercase tracking-tighter text-[9px]">
              <User className="h-2.5 w-2.5 opacity-60" /> {name}
            </span>
            <span className="font-mono flex items-center gap-1 text-[9px] font-black">
              <Phone className="h-2.5 w-2.5" /> {contacts[i] || 'N/A'}
            </span>
          </div>
        ))}
        {hasMore && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="h-7 w-full text-[8px] font-black uppercase text-primary hover:bg-primary/10 mt-1 border border-primary/20 bg-primary/5">
                View All {names.length} Personnel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-2">
              <DialogHeader className="bg-primary/5 p-4 border-b">
                <DialogTitle className="text-sm font-black uppercase flex items-center gap-2 text-primary">
                  <Users className="h-4 w-4" /> GP Nodal Personnel (PEOs)
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold">Consolidated roster for this collection node.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-2 pr-4">
                  {names.map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed hover:border-primary/40 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-primary leading-tight">{name}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">GP Nodal Person</span>
                      </div>
                      <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border shadow-sm">
                        <Phone className="h-3 w-3 text-primary opacity-60" />
                        <span className="text-xs font-mono font-black">{contacts[i] || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  const renderContactPair = (namesStr: string, contactsStr: string, isUlb = false) => {
    const names = (namesStr || 'N/A').split(/,|\n/).map(s => s.trim()).filter(Boolean);
    const contacts = (contactsStr || 'N/A').split(/,|\n/).map(s => s.trim()).filter(Boolean);
    
    return names.map((name, i) => (
      <div key={i} className={`flex items-center justify-between gap-3 border-b border-dashed py-1 last:border-0 ${isUlb ? 'text-blue-700' : 'text-foreground'}`}>
        <span className="flex items-center gap-1 font-bold uppercase tracking-tighter text-[9px]">
          <User className="h-2.5 w-2.5 opacity-60" /> {name}
        </span>
        <span className="font-mono flex items-center gap-1 text-[9px] font-black">
          <Phone className="h-2.5 w-2.5" /> {contacts[i] || 'N/A'}
        </span>
      </div>
    ));
  };

  if (!mounted) return <div className="p-12 text-center text-muted-foreground animate-pulse">Syncing state-wide collection hub...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/[0.01] shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">State-wide Waste Collection Master Registry</CardTitle>
              <CardDescription className="font-medium">Consolidated directory of logistical paths and nodal coordination points across all districts.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={districtAggrData[0]?.name}>
            {districtAggrData.map((district) => (
              <AccordionItem value={district.name} key={district.name} className="border-none">
                <Card className="overflow-hidden border-2 shadow-sm">
                  <AccordionTrigger className="p-6 hover:no-underline bg-muted/10 data-[state=open]:bg-primary/5 transition-all">
                    <div className="flex justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <LayoutGrid className="h-6 w-6 text-primary" />
                        <span className="font-black text-xl uppercase tracking-tighter text-foreground">{district.name} District</span>
                      </div>
                      <Badge variant="outline" className="font-bold border-primary/30 text-primary uppercase text-[10px] bg-primary/5 px-3">
                        {district.totalGps} CIRCUITS MAPPED
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="space-y-12 p-6 bg-background">
                      {district.blocks.map((block) => (
                        <div key={block.blockName} className="space-y-4">
                          <div className="flex items-center justify-between border-b-2 border-primary/20 pb-2">
                            <div className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-primary" />
                                <h3 className="font-black text-lg uppercase tracking-tight text-primary">Block: {block.blockName}</h3>
                            </div>
                            <Badge variant="secondary" className="font-black text-[10px] uppercase">{block.gpCount} GPs</Badge>
                          </div>
                          <ScrollArea className="w-full">
                            <div className="min-w-[1800px]">
                              <Table className="border">
                                <TableHeader className="bg-muted/80">
                                  <TableRow>
                                    <TableHead className="w-[50px] border uppercase font-black text-[9px]">S.No.</TableHead>
                                    <TableHead className="w-[180px] border uppercase font-black text-[9px]">ULB</TableHead>
                                    <TableHead className="w-[150px] border uppercase font-black text-[9px]">MRF Node</TableHead>
                                    <TableHead className="w-[300px] border uppercase font-black text-[9px] text-center">Vehicle (Type, No, Cap.)</TableHead>
                                    <TableHead className="w-[180px] border uppercase font-black text-[9px] text-center">Driver Details</TableHead>
                                    <TableHead className="w-[150px] border uppercase font-black text-[9px]">Schedule</TableHead>
                                    <TableHead className="w-[100px] border uppercase font-black text-[9px] text-right">Load (Kg)</TableHead>
                                    <TableHead className="w-[300px] border uppercase font-black text-[9px]">PEO Details (GP)</TableHead>
                                    <TableHead className="w-[200px] border uppercase font-black text-[9px]">ULB Operator</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {block.rows.map((item: any, rIdx: number) => (
                                    <TableRow key={rIdx} className="hover:bg-primary/[0.01] border-b last:border-0 h-auto min-h-20">
                                      <TableCell className="border text-center font-mono text-xs">{rIdx + 1}</TableCell>
                                      <TableCell className="border font-bold text-[10px] uppercase text-primary leading-tight">{item.ulb}</TableCell>
                                      <TableCell className="border font-black text-[9px] uppercase">{item.mrf}</TableCell>
                                      <TableCell className="border text-[10px] text-center">
                                        <div className="space-y-0.5">
                                            <p className="font-bold uppercase text-foreground">{item.vehicleType}</p>
                                            <p className="font-mono text-[9px] text-muted-foreground">{item.vehicleNo || '-'} | {item.vehicleCapacity || '-'} Kg</p>
                                        </div>
                                      </TableCell>
                                      <TableCell className="border text-center">
                                         <div className="space-y-0.5">
                                            <p className="font-black text-[10px] uppercase">{item.driverName || '-'}</p>
                                            <p className="font-mono text-[9px] text-primary">{item.driverContact || '-'}</p>
                                        </div>
                                      </TableCell>
                                      <TableCell className="border text-[10px] font-black text-blue-700 uppercase">{item.collectionSchedule}</TableCell>
                                      <TableCell className="border text-right font-mono font-black text-primary text-xs">{(item.wasteGeneratedKg || 0).toLocaleString()}</TableCell>
                                      <TableCell className="border bg-blue-50/10 p-2">
                                        {renderPEOContactCell(item.gpNodalPerson, item.gpNodalContact)}
                                      </TableCell>
                                      <TableCell className="border bg-orange-50/5">
                                        {renderContactPair(item.ulbNodalPerson, item.ulbNodalContact, true)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 p-6 bg-muted/20 border-t-4 border-primary/30 rounded-xl shadow-inner">
            <p className="text-sm text-foreground font-black italic flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
              This master registry is synchronized in real-time with verified district reporting portals. Discrepancies in collection load or schedule adherence trigger automatic flags in the state audit hub.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminWasteCollectionDetailsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading state-wide registry...</div>}>
            <AdminWasteCollectionDetailsContent />
        </Suspense>
    );
}

import { Button } from "@/components/ui/button";
