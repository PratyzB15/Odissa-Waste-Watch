import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Users } from "lucide-react";

const drivers = [
    {
        id: "DRV001",
        name: "Ramesh Kumar",
        vehicleNo: "OD-02-AB-1234",
        vehicleType: "Tata Ace",
        assignedGP: "Gobindpur, Ramapur, Udayanagar",
        routeNo: "R-05",
        lastUpdate: "10:30 AM",
        status: "In Transit",
    },
    {
        id: "DRV002",
        name: "Suresh Singh",
        vehicleNo: "OD-05-CD-5678",
        vehicleType: "Tractor",
        assignedGP: "Madhapur, Ratagarh",
        routeNo: "R-12",
        lastUpdate: "9:00 AM",
        status: "Scheduled",
    },
    {
        id: "DRV003",
        name: "Manoj Das",
        vehicleNo: "OD-01-EF-9012",
        vehicleType: "BOV",
        assignedGP: "Kalyanpur, Chandradeipur, Haripur",
        routeNo: "R-08",
        lastUpdate: "1 Day Ago",
        status: "Completed",
    },
     {
        id: "DRV004",
        name: "Deepak Sahu",
        vehicleNo: "OD-03-GH-3456",
        vehicleType: "LVC",
        assignedGP: "Bikashpur",
        routeNo: "R-15",
        lastUpdate: "2 Days Ago",
        status: "Maintenance",
    }
];


export default function DriverDetailsPage() {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "In Transit": return "default";
            case "Scheduled": return "secondary";
            case "Completed": return "outline";
            case "Maintenance": return "destructive";
            case "Working": return "default";
            case "On Leave": return "secondary";
            default: return "secondary";
        }
    }

  return (
    <div className="space-y-6">
        <Card>
        <CardHeader>
            <CardTitle>Driver & Vehicle Tracking</CardTitle>
            <CardDescription>Real-time status of all drivers and vehicles in the fleet.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Vehicle No.</TableHead>
                        <TableHead>Vehicle Type</TableHead>
                        <TableHead>Assigned GPs</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Update</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                            <TableCell className="font-medium">{driver.name}</TableCell>
                            <TableCell>{driver.vehicleNo}</TableCell>
                            <TableCell>{driver.vehicleType}</TableCell>
                            <TableCell>{driver.assignedGP}</TableCell>
                            <TableCell>{driver.routeNo}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(driver.status)}>
                                    {driver.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{driver.lastUpdate}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
        </Card>
    </div>
  );
}
