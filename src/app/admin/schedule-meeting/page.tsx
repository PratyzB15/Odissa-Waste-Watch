
'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Send, Save, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mrfData } from "@/lib/mrf-data";
import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const scheduleSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  district: z.string({ required_error: "Please select a target district or 'All'." }),
  date: z.date({ required_error: "A date for the meeting is required." }),
  agenda: z.string().min(10, { message: "Agenda must be at least 10 characters." }),
});

const planningSchema = z.object({
    conducted: z.enum(["yes", "no"]),
    date: z.date().optional(),
    participants: z.string().optional(),
    minutes: z.any().optional(),
    photos: z.any().optional(),
    decisions: z.string().optional(),
}).refine(data => data.conducted === 'no' || (data.conducted === 'yes' && data.date), {
    message: "Date of meeting is required if meeting was conducted.",
    path: ["date"],
});

export default function ScheduleMeetingPage() {
  const { toast } = useToast();
  
  const districtOptions = useMemo(() => {
    const districts = Array.from(new Set(mrfData.map(d => d.district))).sort();
    return ["All", ...districts];
  }, []);

  const scheduleForm = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
        district: "All"
    }
  });

  const planningForm = useForm<z.infer<typeof planningSchema>>({
    resolver: zodResolver(planningSchema),
    defaultValues: {
        conducted: "no",
    }
  });

  const wasConducted = planningForm.watch("conducted");

  function onScheduleSubmit(values: z.infer<typeof scheduleSchema>) {
    console.log("New Meeting Scheduled:", values);
    toast({
      title: "Meeting Scheduled!",
      description: `The meeting "${values.title}" has been scheduled for ${format(values.date, "PPP")}. Officials from ${values.district === 'All' ? 'all districts' : values.district} have been notified.`,
    });
    scheduleForm.reset({ district: "All", title: "", agenda: "" });
  }
  
  function onPlanningSubmit(values: z.infer<typeof planningSchema>) {
    console.log("Planning Form Submitted:", values);
    toast({
        title: "Meeting Details Saved",
        description: "Your steering committee meeting details have been recorded.",
    })
    planningForm.reset();
  }

  return (
    <div className="space-y-6">
        <Card className="border-2 border-primary/20">
            <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    Schedule a New Steering Committee Meeting
                </CardTitle>
                <CardDescription>Organize a new review session and notify regional officials.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                 <Form {...scheduleForm}>
                    <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                                control={scheduleForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Meeting Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Monthly Review" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={scheduleForm.control}
                                name="district"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Target District (Recipient Scope)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a district or 'All'" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <ScrollArea className="h-72">
                                                {districtOptions.map(d => (
                                                    <SelectItem key={d} value={d} className={d === 'All' ? 'font-black text-primary' : ''}>
                                                        {d === 'All' ? 'All Districts (State-wide)' : d}
                                                    </SelectItem>
                                                ))}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <FormField
                            control={scheduleForm.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Date of Meeting</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-full max-w-sm pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                        {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={scheduleForm.control}
                            name="agenda"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Meeting Agenda</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Briefly describe the meeting agenda and required documentation" className="min-h-[120px]" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full max-w-sm h-11 font-bold">
                            <Send className="mr-2 h-4 w-4"/>
                            Schedule & Notify Officials
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Log Steering Committee Meeting</CardTitle>
                <CardDescription>Log details of district-level steering committee meetings that have been attended.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...planningForm}>
                    <form onSubmit={planningForm.handleSubmit(onPlanningSubmit)} className="space-y-6">
                        <FormField
                            control={planningForm.control}
                            name="conducted"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Was a district-level steering committee meeting conducted/attended?</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl><RadioGroupItem value="yes" id="yes" /></FormControl>
                                        <FormLabel htmlFor="yes">Yes</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl><RadioGroupItem value="no" id="no" /></FormControl>
                                        <FormLabel htmlFor="no">No</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {wasConducted === 'yes' && (
                            <div className="space-y-6 pl-2 border-l-2 ml-2 pt-4">
                                <FormField
                                    control={planningForm.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Date of Meeting</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn("w-full max-w-sm pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                >
                                                {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={planningForm.control}
                                    name="participants"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Details of Participants</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter names or departments of participants" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={planningForm.control}
                                    name="minutes"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Minutes of the Meeting (PDF)</FormLabel>
                                        <FormControl>
                                            <Input type="file" accept=".pdf" />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={planningForm.control}
                                    name="photos"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Meeting Photographs (up to 2)</FormLabel>
                                        <FormControl>
                                            <Input type="file" accept="image/*" multiple />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={planningForm.control}
                                    name="decisions"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Key Decisions</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Summarize the key decisions made" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        <Button type="submit" className="w-full max-w-sm h-11">
                            <Save className="mr-2 h-4 w-4"/>
                            Save Meeting Details
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
