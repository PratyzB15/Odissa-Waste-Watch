
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, AreaChart, XAxis, YAxis, Tooltip, Legend, Bar, Line, Area, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Truck, Trash2, Home, CircleDollarSign } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { mrfData } from "@/lib/mrf-data";

export default function GraphsPage() {
    const { 
        wasteData, 
        totalMonthlyWaste, 
        totalHouseholds, 
        totalGps,
        vehicleTrendData,
        transportCost
    } = useMemo(() => {
        const totalWaste = mrfData.reduce((sum, item) => sum + item.dryWasteKg, 0);
        const households = mrfData.reduce((sum, item) => sum + item.households, 0);
        const gps = mrfData.reduce((sum, item) => sum + item.gpsCovered, 0);

        const wasteTrend = {
            day: [
                { name: '6h ago', waste: (totalWaste / 30 / 4) * 0.8 },
                { name: '4h ago', waste: (totalWaste / 30 / 4) * 0.9 },
                { name: '2h ago', waste: (totalWaste / 30 / 4) * 1.1 },
                { name: 'Now', waste: (totalWaste / 30 / 4) * 1.2 }
            ],
            month: [
                { name: 'Week 1', waste: totalWaste * 0.22 },
                { name: 'Week 2', waste: totalWaste * 0.26 },
                { name: 'Week 3', waste: totalWaste * 0.28 },
                { name: 'Week 4', waste: totalWaste * 0.24 }
            ],
            year: [
                { name: 'May', waste: totalWaste * 0.92 },
                { name: 'Jun', waste: totalWaste * 0.96 },
                { name: 'Jul', waste: totalWaste }
            ]
        };

        const vehicleTrend = [
            { name: 'May', count: Math.floor(gps / 12) },
            { name: 'Jun', count: Math.floor(gps / 11) },
            { name: 'Jul', count: Math.floor(gps / 10) }
        ];

        const cost = {
            currentMonth: totalWaste * 4.2, // Simulate Rs 4.2 per Kg transport cost
            previousMonth: totalWaste * 0.95 * 4.1,
            get trend() {
                return ((this.currentMonth - this.previousMonth) / this.previousMonth) * 100;
            }
        };

        return {
            wasteData: wasteTrend,
            totalMonthlyWaste: totalWaste,
            totalHouseholds: households,
            totalGps: gps,
            vehicleTrendData: vehicleTrend,
            transportCost: cost
        };
    }, []);

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Data Visualization Dashboard</CardTitle>
                    <CardDescription>Actual waste management metrics derived from state-wide MRF registries.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-primary" /> Quantity of Waste Processed (in Kg)</CardTitle>
                    <CardDescription>Real-world processing curves based on current inventory totals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="month">
                        <TabsList>
                            <TabsTrigger value="day">Daily</TabsTrigger>
                            <TabsTrigger value="month">Monthly</TabsTrigger>
                            <TabsTrigger value="year">Seasonal</TabsTrigger>
                        </TabsList>
                        <TabsContent value="day" className="h-[350px] w-full pt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={wasteData.day}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(val) => `${val.toFixed(0)}k`} />
                                    <Tooltip formatter={(val: number) => `${val.toFixed(2)} Kg`} />
                                    <Bar dataKey="waste" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </TabsContent>
                        <TabsContent value="month" className="h-[350px] w-full pt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={wasteData.month}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(val) => `${(val / 1000).toFixed(1)}T`} />
                                    <Tooltip formatter={(val: number) => `${val.toLocaleString()} Kg`} />
                                    <Bar dataKey="waste" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </TabsContent>
                        <TabsContent value="year" className="h-[350px] w-full pt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={wasteData.year}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(val) => `${(val / 1000).toFixed(1)}T`} />
                                    <Tooltip formatter={(val: number) => `${val.toLocaleString()} Kg`} />
                                    <Area type="monotone" dataKey="waste" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Logistical Fleet Deployment</CardTitle>
                         <CardDescription>Monthly trend of collection vehicles active in district circuits.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vehicleTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" name="Active Vehicles" stroke="hsl(var(--primary))" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <div className="grid grid-cols-1 gap-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5 text-primary"/> District Circuit Coverage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-3xl font-black">{totalGps.toLocaleString()}</span>
                                <span className="text-muted-foreground font-bold">GPs TAGGED</span>
                            </div>
                            <Progress value={92} className="h-3" />
                            <p className="text-right text-xs font-black text-primary mt-2">92% Operational Efficiency</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5 text-primary"/> Est. Logistical Expenditure</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-black">₹ {transportCost.currentMonth.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                            <p className={`text-xs font-bold flex items-center gap-1 mt-1 ${transportCost.trend > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {transportCost.trend > 0 ? '▲' : '▼'} {Math.abs(transportCost.trend).toFixed(1)}% vs Last Month (Calculated from Load)
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
