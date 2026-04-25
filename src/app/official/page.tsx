'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  FileText,
  MapPin,
  Truck,
  User,
  Droplet,
  Anchor,
  CheckCircle,
  XCircle,
  Send,
  Bell,
  Building,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Suspense } from 'react';

const reportData = {
  block: {
    id: 'REP001',
    gpName: 'Gobindpur',
    blockName: 'Salipur',
    district: 'Cuttack',
    status: 'Pending Block Approval',
    receiptNo: 'INV-202407-001',
    receiptDate: '2024-07-31',
    sender: { name: 'Sunita Sharma', designation: 'GP Official', contact: '9123456780' },
    receiver: { name: 'Amit Patel', designation: 'ULB Supervisor', contact: '9098765432' },
    droppingPoint: { ulbName: 'Cuttack Municipal Corporation', mrfName: 'Central MRF Cuttack' },
    vehicle: {
      number: 'OD-02-AB-1234',
      type: 'Tata Ace',
      driverName: 'Ramesh Kumar',
      driverContact: '9876543210',
    },
    waste: [
      { type: 'Plastic', quantity: '550 kg' },
      { type: 'Paper', quantity: '320 kg' },
      { type: 'Metal', quantity: '80 kg' },
      { type: 'Glass', quantity: '120 kg' },
    ],
  },
  district: {
    id: 'REP002',
    gpName: 'Ratagarh',
    blockName: 'Bhubaneswar Block',
    district: 'Khurda',
    status: 'Pending District Approval',
    receiptNo: 'INV-202407-002',
    receiptDate: '2024-07-30',
    sender: { name: 'Priya Das', designation: 'GP Official', contact: '9876543210' },
    receiver: { name: 'Ravi Verma', designation: 'ULB Supervisor', contact: '8765432109' },
    droppingPoint: { ulbName: 'Bhubaneswar Municipal Corporation', mrfName: 'Patia MRF' },
    vehicle: {
      number: 'OD-05-XY-7890',
      type: 'Tipper Truck',
      driverName: 'Manoj Sahu',
      driverContact: '9988776655',
    },
    waste: [
        { type: 'Plastic', quantity: '1200 kg' },
        { type: 'Paper', quantity: '800 kg' },
    ],
  },
};

function OfficialDashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const district = searchParams.get('district');
  const { toast } = useToast();

  if (role === 'ulb') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ULB Portal</CardTitle>
                <CardDescription>You are logged in as a ULB Representative. Please navigate using the sidebar to manage your Material Recovery Facility data.</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  const dataToShow = role === 'block' ? reportData.block : reportData.district;
  const isDistrictRole = role === 'district';

  const handleApprove = () => {
    toast({
        title: 'Report Approved!',
        description: `The report from ${dataToShow.gpName} has been approved.`,
    });
  }

  const handleReject = () => {
     toast({
        title: 'Report Rejected',
        description: `The report from ${dataToShow.gpName} has been rejected and sent back for review.`,
        variant: 'destructive',
    });
  }
  
  const handleForward = () => {
    toast({
        title: 'Report Forwarded!',
        description: `The report has been forwarded to the District Representative for final approval.`,
    });
  }

  return (
    <div className="space-y-6">
        {/* State Notification Section */}
        <Alert className="border-2 border-primary bg-primary/5 py-6">
            <CalendarCheck className="h-6 w-6 text-primary animate-bounce" />
            <div className="ml-2">
              <AlertTitle className="text-lg font-black uppercase tracking-tighter text-primary">Notification: State-Scheduled Meeting</AlertTitle>
              <AlertDescription className="text-sm font-medium mt-1">
                The **State Admin** has scheduled a mandatory "District Level SWM Convergence Review" for **Friday, August 2nd, 2024 at 11:00 AM**. 
                All District and Block representatives must ensure their latest monthly reports are verified before the session.
              </AlertDescription>
              <div className="mt-4">
                <Button size="sm" variant="outline" className="border-primary text-primary font-bold">Add to Calendar</Button>
              </div>
            </div>
        </Alert>
        
         {isDistrictRole && (
            <Card className="border-2 border-primary/20">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2 text-2xl font-headline"><Building className="text-primary"/>{district} District Approval Panel</CardTitle>
                    <CardDescription>Consolidated queue of waste generation reports awaiting your final validation.</CardDescription>
                </CardHeader>
            </Card>
        )}

        <Card className="border-2">
        <CardHeader>
            <div className="flex justify-between items-start">
            <div>
                <CardTitle>Verification Queue: Monthly Reporting</CardTitle>
                <CardDescription>
                Reviewing submitted documentation for {dataToShow.gpName}, {dataToShow.blockName} -{' '}
                {isDistrictRole ? district : dataToShow.district}.
                </CardDescription>
            </div>
            <Badge className="font-bold uppercase text-[10px] py-1 px-3" variant={isDistrictRole ? "secondary" : "default"}>{dataToShow.status}</Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location
                </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1 font-medium">
                <p><span className="text-muted-foreground text-xs uppercase font-bold">District:</span> {isDistrictRole ? district : dataToShow.district}</p>
                <p><span className="text-muted-foreground text-xs uppercase font-bold">Block:</span> {dataToShow.blockName}</p>
                <p><span className="text-muted-foreground text-xs uppercase font-bold">GP Name:</span> {dataToShow.gpName}</p>
                </CardContent>
            </Card>
            <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Receipt
                </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1 font-medium">
                <p><span className="text-muted-foreground text-xs uppercase font-bold">No:</span> {dataToShow.receiptNo}</p>
                <p><span className="text-muted-foreground text-xs uppercase font-bold">Date:</span> {dataToShow.receiptDate}</p>
                </CardContent>
            </Card>
            <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-primary" />
                    Dropping Point
                </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1 font-medium">
                <p><span className="text-muted-foreground text-xs uppercase font-bold">ULB:</span> {dataToShow.droppingPoint.ulbName}</p>
                <p><span className="text-muted-foreground text-xs uppercase font-bold">MRF:</span> {dataToShow.droppingPoint.mrfName}</p>
                </CardContent>
            </Card>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Verified Personnel
                </h3>
                <div className="p-4 border rounded-xl space-y-4 text-sm bg-card">
                <div>
                    <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest mb-2 border-b pb-1">Sender (GP Node)</h4>
                    <p className="font-bold text-primary">{dataToShow.sender.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{dataToShow.sender.designation} • {dataToShow.sender.contact}</p>
                </div>
                <Separator className="border-dashed" />
                <div>
                    <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest mb-2 border-b pb-1">Receiver (ULB Node)</h4>
                    <p className="font-bold text-primary">{dataToShow.receiver.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{dataToShow.receiver.designation} • {dataToShow.receiver.contact}</p>
                </div>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Logistics Details
                </h3>
                <div className="p-4 border rounded-xl space-y-3 text-sm bg-card">
                <p><span className="text-muted-foreground text-xs uppercase font-black">Reg Number:</span> <span className="font-mono font-bold ml-2">{dataToShow.vehicle.number}</span></p>
                <p><span className="text-muted-foreground text-xs uppercase font-black">Vehicle Type:</span> <span className="font-bold ml-2">{dataToShow.vehicle.type}</span></p>
                <Separator className="border-dashed my-2" />
                <p><span className="text-muted-foreground text-xs uppercase font-black">Driver:</span> <span className="font-bold ml-2">{dataToShow.vehicle.driverName}</span></p>
                <p><span className="text-muted-foreground text-xs uppercase font-black">Contact:</span> <span className="font-mono font-bold ml-2 text-primary">{dataToShow.vehicle.driverContact}</span></p>
                </div>
            </div>
            </div>

            <div>
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <Droplet className="h-5 w-5 text-primary" />
                Waste Quantification Data
            </h3>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                  <TableHeader className="bg-muted/50">
                  <TableRow>
                      <TableHead className="uppercase text-[10px] font-black">Waste Category</TableHead>
                      <TableHead className="text-right uppercase text-[10px] font-black">Verified Quantity (kg)</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {dataToShow.waste.map((item) => (
                      <TableRow key={item.type} className="hover:bg-muted/30">
                      <TableCell className="font-bold">{item.type}</TableCell>
                      <TableCell className="text-right font-mono font-black text-primary">{item.quantity}</TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
            </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-6 bg-muted/5">
            {isDistrictRole ? (
                <>
                    <Button variant="destructive" onClick={handleReject} className="font-bold">
                        <XCircle className="mr-2 h-4 w-4" /> Reject Report
                    </Button>
                    <Button onClick={handleApprove} className="font-bold">
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve for Admin
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="destructive" onClick={handleReject} className="font-bold">
                        <XCircle className="mr-2 h-4 w-4" /> Reject Report
                    </Button>
                    <Button onClick={handleForward} className="font-bold">
                        <Send className="mr-2 h-4 w-4" /> Forward to District
                    </Button>
                </>
            )}
        </CardFooter>
        </Card>
    </div>
  );
}

export default function OfficialDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading Approval Queue...</div>}>
      <OfficialDashboardContent />
    </Suspense>
  )
}
