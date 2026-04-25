
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, MapPin, Truck, User, Droplet, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

const reportData = {
  district: "Cuttack",
  block: "Salipur",
  collectionPoint: "Salipur GP Segregation Shed",
  gpName: "Gobindpur",
  receiptNo: "INV-202407-001",
  receiptDate: "2024-07-31",
  sender: {
    name: "Sunita Sharma",
    designation: "GP Official",
    contact: "9123456780",
  },
  receiver: {
    name: "Amit Patel",
    designation: "ULB Supervisor",
    contact: "9098765432",
  },
  droppingPoint: {
    ulbName: "Cuttack Municipal Corporation",
    mrfName: "Central MRF Cuttack",
  },
  vehicle: {
    number: "OD-02-AB-1234",
    type: "Tata Ace",
    driverName: "Ramesh Kumar",
    driverContact: "9876543210",
  },
  waste: [
    { type: "Plastic", quantity: "550 kg" },
    { type: "Paper", quantity: "320 kg" },
    { type: "Metal", quantity: "80 kg" },
    { type: "Glass", quantity: "120 kg" },
    { type: "Special care (Domestic hazardous)", quantity: "30 kg" },
    { type: "Cloth", quantity: "75 kg" },
    { type: "Sanitary waste", quantity: "40 kg" },
  ],
  receiptPdf: "/receipts/INV-202407-001.pdf",
};


export default function MonthlyDetailsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Monthly Report Details</CardTitle>
                <CardDescription>Viewing submitted report for {reportData.gpName}, {reportData.block} - {reportData.district}.</CardDescription>
            </div>
            <Button variant="outline"><Download className="mr-2"/> Download Waste Receipt PDF</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                 <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Location Details</CardTitle></CardHeader>
                 <CardContent className="text-sm space-y-2">
                    <p><span className="font-semibold">District:</span> {reportData.district}</p>
                    <p><span className="font-semibold">Block:</span> {reportData.block}</p>
                    <p><span className="font-semibold">GP Name:</span> {reportData.gpName}</p>
                    <p><span className="font-semibold">Collection Point:</span> {reportData.collectionPoint}</p>
                 </CardContent>
            </Card>
            <Card>
                 <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Waste Receipt Details</CardTitle></CardHeader>
                 <CardContent className="text-sm space-y-2">
                    <p><span className="font-semibold">Receipt No:</span> {reportData.receiptNo}</p>
                    <p><span className="font-semibold">Receipt Date:</span> {reportData.receiptDate}</p>
                 </CardContent>
            </Card>
             <Card>
                 <CardHeader><CardTitle className="text-base flex items-center gap-2"><Anchor className="h-5 w-5 text-primary" />Dropping Point</CardTitle></CardHeader>
                 <CardContent className="text-sm space-y-2">
                    <p><span className="font-semibold">ULB Name:</span> {reportData.droppingPoint.ulbName}</p>
                    <p><span className="font-semibold">SWM Unit (MRF):</span> {reportData.droppingPoint.mrfName}</p>
                 </CardContent>
            </Card>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Personnel Details</h3>
                <div className="p-4 border rounded-lg space-y-3 text-sm">
                    <div>
                        <h4 className="font-medium text-muted-foreground">Sender Details</h4>
                        <p>Name: {reportData.sender.name} ({reportData.sender.designation})</p>
                        <p>Contact: {reportData.sender.contact}</p>
                    </div>
                    <Separator/>
                     <div>
                        <h4 className="font-medium text-muted-foreground">Receiver Details</h4>
                        <p>Name: {reportData.receiver.name} ({reportData.receiver.designation})</p>
                        <p>Contact: {reportData.receiver.contact}</p>
                    </div>
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-primary"/>Vehicle Details</h3>
                <div className="p-4 border rounded-lg space-y-3 text-sm">
                    <p><span className="font-semibold">Vehicle Number:</span> {reportData.vehicle.number}</p>
                    <p><span className="font-semibold">Vehicle Type:</span> {reportData.vehicle.type}</p>
                    <p><span className="font-semibold">Driver Name:</span> {reportData.vehicle.driverName}</p>
                    <p><span className="font-semibold">Driver Contact:</span> {reportData.vehicle.driverContact}</p>
                </div>
            </div>
        </div>

        <div>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><Droplet className="h-5 w-5 text-primary"/>Waste Quantity Details</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Waste Type</TableHead>
                        <TableHead className="text-right">Quantity (kg)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reportData.waste.map(item => (
                        <TableRow key={item.type}>
                            <TableCell>{item.type}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

      </CardContent>
    </Card>
  );
}
