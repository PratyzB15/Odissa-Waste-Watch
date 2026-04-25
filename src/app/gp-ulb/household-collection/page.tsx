'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const houses = [
    { id: "H001", owner: "Nabin Pradhan", collected: true },
    { id: "H002", owner: "Sita Majhi", collected: true },
    { id: "H003", owner: "Gopal Das", collected: false },
    { id: "H004", owner: "Anjali Behera", collected: true },
    { id: "H005", owner: "Rakesh Sahoo", collected: false },
];

export default function HouseholdCollectionPage() {

    const collectedCount = houses.filter(h => h.collected).length;
    const progressPercentage = (collectedCount / houses.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household Waste Collection</CardTitle>
        <CardDescription>Track waste collection status from houses in your Gram Panchayat.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
            <div className="flex justify-between font-medium">
                <span>Collection Progress</span>
                <span>{collectedCount} / {houses.length} Houses</span>
            </div>
            <Progress value={progressPercentage} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>House ID</TableHead>
              <TableHead>Owner Name</TableHead>
              <TableHead className="text-right">Collected Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {houses.map((house) => (
              <TableRow key={house.id}>
                <TableCell>{house.id}</TableCell>
                <TableCell>{house.owner}</TableCell>
                <TableCell className="text-right">
                    <Checkbox checked={house.collected} aria-label="Mark as collected" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button className="mt-6 w-full">Save Collection Data</Button>
      </CardContent>
    </Card>
  );
}
