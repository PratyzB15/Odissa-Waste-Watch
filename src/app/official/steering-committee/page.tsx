
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { steeringCommitteeData as jajpurData } from "@/lib/disJajpur/steeringCommitteeData";
import { steeringCommitteeData as bhadrakData } from "@/lib/disBhadrak/steeringCommitteeData";
import { steeringCommitteeData as bargarhData } from "@/lib/disBargarh/steeringCommitteeData";
import { steeringCommitteeData as snprData } from "@/lib/disSonepur/steeringCommitteeData";
import { steeringCommitteeData as angulData } from "@/lib/disAngul/steeringCommitteeData";
import { steeringCommitteeData as balangirData } from "@/lib/disBalangir/steeringCommitteeData";
import { mrfData } from "@/lib/mrf-data";
import { Users, PlusCircle, Edit, Trash2, Save } from "lucide-react";
import { Suspense, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function SteeringCommitteeContent() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const districtParam = searchParams.get('district');
    const blockParam = searchParams.get('block');
    const role = searchParams.get('role');
    const isAuthorized = role === 'block' || role === 'district';

    const [mounted, setMounted] = useState(false);
    const [records, setRecords] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        meetingOrganised: 'No',
        dateOfMeeting: '',
        scheduledDate: '',
        blocksToTag: '',
        gpsToTag: '',
        routeChartFinalised: 'No',
        vehicleAllocated: 'No',
        noOfVehicles: '0',
        vehicleType: 'NA',
        wasteCollectionStarted: 'No',
        gpsStarted: '0',
        tentativeDate: 'TBD'
    });

    const finalDistrict = useMemo(() => {
        if (districtParam) return districtParam;
        if (blockParam) {
            const found = mrfData.find(m => m.blockCovered.toLowerCase() === blockParam.toLowerCase());
            return found?.district || 'Bhadrak';
        }
        return 'Bhadrak';
    }, [districtParam, blockParam]);

    useEffect(() => {
        setMounted(true);
        const d = finalDistrict.toLowerCase();
        const map: Record<string, any> = {
            'balangir': balangirData, 'bhadrak': bhadrakData, 'jajpur': jajpurData,
            'bargarh': bargarhData, 'sonepur': snprData, 'angul': angulData
        };
        const initialData = map[d] || bhadrakData;
        setRecords(Array.isArray(initialData) ? initialData : [initialData]);
    }, [finalDistrict]);

    const handleOpenAddDialog = () => {
        setEditingRecord(null);
        setFormData({
            meetingOrganised: 'No', dateOfMeeting: '', scheduledDate: '',
            blocksToTag: '', gpsToTag: '', routeChartFinalised: 'No',
            vehicleAllocated: 'No', noOfVehicles: '0', vehicleType: 'NA',
            wasteCollectionStarted: 'No', gpsStarted: '0', tentativeDate: 'TBD'
        });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (record: any, idx: number) => {
        setEditingRecord({ ...record, idx });
        setFormData({
            meetingOrganised: record.meetingOrganised,
            dateOfMeeting: record.dateOfMeeting || '',
            scheduledDate: record.scheduledDate || '',
            blocksToTag: record.blocksToTag?.toString() || '',
            gpsToTag: record.gpsToTag?.toString() || '',
            routeChartFinalised: record.routeChartFinalised || 'No',
            vehicleAllocated: record.vehicleAllocated || 'No',
            noOfVehicles: record.noOfVehicles?.toString() || '0',
            vehicleType: record.vehicleType || 'NA',
            wasteCollectionStarted: record.wasteCollectionStarted || 'No',
            gpsStarted: record.gpsStarted?.toString() || '0',
            tentativeDate: record.tentativeDate || 'TBD'
        });
        setIsDialogOpen(true);
    };

    const handleRemove = (id: number) => {
        setRecords(prev => prev.filter((_, i) => i !== id));
        toast({ title: "Entry Removed", description: "Steering committee status deleted." });
    };

    const handleSubmit = () => {
        const record = {
            ...formData,
            district: finalDistrict,
            blocksToTag: parseInt(formData.blocksToTag) || 0,
            gpsToTag: parseInt(formData.gpsToTag) || 0,
            noOfVehicles: parseInt(formData.noOfVehicles) || 0,
            gpsStarted: parseInt(formData.gpsStarted) || 0
        };

        if (editingRecord !== null) {
            setRecords(prev => prev.map((r, i) => i === editingRecord.idx ? record : r));
            toast({ title: "Update Successful", description: "Meeting details synchronized." });
        } else {
            setRecords(prev => [...prev, record]);
            toast({ title: "Update Published", description: "New committee status logged." });
        }
        setIsDialogOpen(false);
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <Card className="border-2 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="text-2xl font-bold font-headline uppercase tracking-tight">Steering committee Status</CardTitle>
                                <CardDescription>Consolidated progress monitoring for District: <span className="font-bold text-foreground">{finalDistrict}</span></CardDescription>
                            </div>
                        </div>
                        {isAuthorized && (
                            <Button onClick={handleOpenAddDialog} className="font-black uppercase tracking-widest h-11 bg-primary shadow-lg">
                                <PlusCircle className="mr-2 h-5 w-5" /> Add New Details
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-8 overflow-x-auto">
                    <div className="rounded-lg border overflow-hidden bg-card min-w-[1400px]">
                        <Table className="border-collapse border text-[10px]">
                            <TableHeader className="bg-muted/80">
                                <TableRow>
                                    <TableHead rowSpan={2} className="w-[50px] font-black text-center border uppercase tracking-widest">S.No.</TableHead>
                                    <TableHead colSpan={3} className="font-black border text-center uppercase tracking-widest">Meeting Status</TableHead>
                                    <TableHead colSpan={2} className="font-black border text-center uppercase tracking-widest">Target Scope</TableHead>
                                    <TableHead rowSpan={2} className="font-black border text-center uppercase tracking-widest">Route Finalisation</TableHead>
                                    <TableHead rowSpan={2} className="font-black border text-center uppercase tracking-widest">Vehicle Allocation</TableHead>
                                    <TableHead rowSpan={2} className="font-black border text-center uppercase tracking-widest">No. & Type</TableHead>
                                    <TableHead colSpan={3} className="font-black border text-center uppercase tracking-widest">Collection Status</TableHead>
                                    {isAuthorized && <TableHead rowSpan={2} className="w-[120px] font-black border text-center uppercase tracking-widest">Actions</TableHead>}
                                </TableRow>
                                <TableRow>
                                    <TableHead className="font-bold border text-center uppercase text-[8px]">Organised</TableHead>
                                    <TableHead className="font-bold border text-center uppercase text-[8px]">Date</TableHead>
                                    <TableHead className="font-bold border text-center uppercase text-[8px]">Scheduled</TableHead>
                                    <TableHead className="font-bold border text-center uppercase text-[8px]">Blocks</TableHead>
                                    <TableHead className="font-bold border text-center uppercase text-[8px]">GPs</TableHead>
                                    <TableHead className="font-bold border text-center uppercase text-[8px]">Started</TableHead>
                                    <TableHead className="font-bold border text-center uppercase text-[8px]">Count</TableHead>
                                    <TableHead className="font-bold border text-center uppercase text-[8px]">Tentative Start</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((row, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted/30">
                                        <TableCell className="text-center font-bold border">{idx + 1}</TableCell>
                                        <TableCell className="border text-center">
                                            <Badge variant={row.meetingOrganised?.toUpperCase() === "YES" ? "default" : "secondary"}>
                                                {row.meetingOrganised}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="border text-center font-mono font-bold">{row.dateOfMeeting || "-"}</TableCell>
                                        <TableCell className="border text-center font-mono">{row.scheduledDate || "-"}</TableCell>
                                        <TableCell className="border text-center font-black text-primary">{row.blocksToTag || "-"}</TableCell>
                                        <TableCell className="border text-center font-black text-primary">{row.gpsToTag || "-"}</TableCell>
                                        <TableCell className="border text-center">
                                            <Badge variant="outline" className={row.routeChartFinalised?.toUpperCase() === "YES" ? "text-green-700 bg-green-50" : "text-destructive bg-destructive/5"}>
                                                {row.routeChartFinalised}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="border text-center">
                                            <Badge variant="outline">{row.vehicleAllocated}</Badge>
                                        </TableCell>
                                        <TableCell className="border text-center font-bold uppercase">{row.noOfVehicles} | {row.vehicleType}</TableCell>
                                        <TableCell className="border text-center">
                                            <Badge className={row.wasteCollectionStarted?.toUpperCase() === "YES" ? "bg-green-600" : "bg-red-600"}>
                                                {row.wasteCollectionStarted}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="border text-center font-black text-primary">{row.gpsStarted || "0"}</TableCell>
                                        <TableCell className="border text-center font-mono">{row.tentativeDate || "NA"}</TableCell>
                                        {isAuthorized && (
                                            <TableCell className="border text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-primary" onClick={() => handleOpenEditDialog(row, idx)}><Edit className="h-4 w-4" /></Button>
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" onClick={() => handleRemove(idx)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase text-primary">Steering Committee Status Update</DialogTitle>
                        <DialogDescription>Input official meeting status and jurisdictional targets.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Meeting Organised?</Label>
                            <Select value={formData.meetingOrganised} onValueChange={(v) => setFormData({...formData, meetingOrganised: v})}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Date (If Yes)</Label>
                            <Input value={formData.dateOfMeeting} onChange={(e) => setFormData({...formData, dateOfMeeting: e.target.value})} placeholder="DD.MM.YYYY" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Blocks to Tag</Label>
                            <Input type="number" value={formData.blocksToTag} onChange={(e) => setFormData({...formData, blocksToTag: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">GPs to Tag</Label>
                            <Input type="number" value={formData.gpsToTag} onChange={(e) => setFormData({...formData, gpsToTag: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Route Finalised?</Label>
                            <Select value={formData.routeChartFinalised} onValueChange={(v) => setFormData({...formData, routeChartFinalised: v})}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Vehicle Allocated?</Label>
                            <Select value={formData.vehicleAllocated} onValueChange={(v) => setFormData({...formData, vehicleAllocated: v})}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">Collection Started?</Label>
                            <Select value={formData.wasteCollectionStarted} onValueChange={(v) => setFormData({...formData, wasteCollectionStarted: v})}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase">GPs Started Count</Label>
                            <Input type="number" value={formData.gpsStarted} onChange={(e) => setFormData({...formData, gpsStarted: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter className="bg-muted/30 p-4 rounded-xl">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold">Cancel</Button>
                        <Button onClick={handleSubmit} className="font-black uppercase px-8"><Save className="mr-2 h-4 w-4" /> Save Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function SteeringCommitteePage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Loading status...</div>}>
            <SteeringCommitteeContent />
        </Suspense>
    );
}
