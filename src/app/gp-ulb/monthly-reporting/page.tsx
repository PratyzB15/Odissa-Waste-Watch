
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, FileUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function MonthlyReportingPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real app, you'd collect form data here
        console.log("Form submitted");
        toast({
            title: "Report Submitted",
            description: "Your monthly report has been successfully submitted.",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Reporting Form</CardTitle>
                <CardDescription>Fill out the details for the monthly waste management report.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Location Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Location & Receipt Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="district">District</Label>
                                <Input id="district" placeholder="e.g., Cuttack" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="block">Block</Label>
                                <Input id="block" placeholder="e.g., Salipur" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="gp-name">GP Name</Label>
                                <Input id="gp-name" placeholder="e.g., Gobindpur" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="collection-point">Name of Collection point (Address of segregation shed)</Label>
                                <Input id="collection-point" placeholder="e.g., Salipur GP Segregation Shed" />
                            </div>
                           
                            <div className="space-y-2">
                                <Label htmlFor="receipt-no">Receipt no.</Label>
                                <Input id="receipt-no" placeholder="e.g., INV-202407-001" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="receipt-date">Date of Receipt</Label>
                                <Input id="receipt-date" type="date" />
                            </div>
                        </div>
                    </div>

                    {/* Personnel Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Personnel Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 p-4 border rounded-md">
                                <h4 className="font-medium">Details of Sender of waste</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="sender-name">Name</Label>
                                    <Input id="sender-name" placeholder="Sender's Name"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sender-designation">Designation</Label>
                                    <Input id="sender-designation" placeholder="Sender's Designation"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sender-contact">Contact No.</Label>
                                    <Input id="sender-contact" type="tel" placeholder="Sender's Contact"/>
                                </div>
                            </div>
                             <div className="space-y-4 p-4 border rounded-md">
                                <h4 className="font-medium">Details of receiver</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="receiver-name">Name</Label>
                                    <Input id="receiver-name" placeholder="Receiver's Name"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiver-designation">Designation</Label>
                                    <Input id="receiver-designation" placeholder="Receiver's Designation"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiver-contact">Contact No.</Label>
                                    <Input id="receiver-contact" type="tel" placeholder="Receiver's Contact"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dropping Point */}
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Details of Dropping Point of Waste</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="ulb-name">Name of ULB</Label>
                                <Input id="ulb-name" placeholder="e.g., Cuttack Municipal Corporation" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mrf-name">Name of SWM processing unit (MRF)</Label>
                                <Input id="mrf-name" placeholder="e.g., Central MRF Cuttack" />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle & Waste Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Vehicle and Waste Details</h3>
                        <div className="space-y-4 p-4 border rounded-md">
                            <h4 className="font-medium">Vehicle Details</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle-no">Vehicle Number</Label>
                                    <Input id="vehicle-no" placeholder="e.g., OD-02-AB-1234"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle-type">Type of Vehicle</Label>
                                    <Input id="vehicle-type" placeholder="e.g., Tata Ace, Tractor, etc."/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="driver-name">Driver Name</Label>
                                    <Input id="driver-name" placeholder="Driver's Name"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="driver-contact">Contact No of Driver</Label>
                                    <Input id="driver-contact" type="tel" placeholder="Driver's Contact"/>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 p-4 border rounded-md">
                             <h4 className="font-medium">Quantity of waste collected (in kg)</h4>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="waste-plastic">Plastic</Label>
                                    <Input id="waste-plastic" type="number" placeholder="kg"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="waste-paper">Paper</Label>
                                    <Input id="waste-paper" type="number" placeholder="kg"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="waste-metal">Metal</Label>
                                    <Input id="waste-metal" type="number" placeholder="kg"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="waste-glass">Glass</Label>
                                    <Input id="waste-glass" type="number" placeholder="kg"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="waste-special">Special care</Label>
                                    <Input id="waste-special" type="number" placeholder="kg"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="waste-cloth">Cloth</Label>
                                    <Input id="waste-cloth" type="number" placeholder="kg"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="waste-sanitary">Sanitary waste</Label>
                                    <Input id="waste-sanitary" type="number" placeholder="kg"/>
                                </div>
                             </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="receipt-pdf">Scanned copy of the waste receipt (PDF)</Label>
                            <div className="flex items-center gap-4">
                                <Input id="receipt-pdf" type="file" accept=".pdf" className="max-w-xs"/>
                                <Button type="button" variant="outline"><FileUp className="mr-2"/> Upload</Button>
                            </div>
                        </div>
                    </div>
                    
                    <Separator />

                    <Button type="submit" className="w-full max-w-sm mx-auto flex">
                        <Save className="mr-2" />
                        Submit Monthly Report
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
