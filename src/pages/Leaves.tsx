import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaves } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Leaves() {
    const { user } = useAuth();
    const { applyForLeave, updateLeaveStatus, getLeavesByWorker, getLeavesBySupervisor, leaves } = useLeaves();
    const { toast } = useToast();

    if (!user) return null;

    const isAdmin = user.role === 'admin';
    const isSupervisor = user.role === 'supervisor';
    const isWorker = user.role === 'worker';

    // Worker View State
    const [leaveType, setLeaveType] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leaveType || !startDate || !endDate || !reason) {
            toast({ title: "Error", description: "All fields are required", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            await applyForLeave({
                workerId: user.id,
                workerName: user.name,
                department: user.department || 'General',
                supervisorId: user.supervisorId || 'admin-001', // Fallback for demo
                leaveType: leaveType as any,
                startDate,
                endDate,
                reason,
            });
            toast({ title: "Success", description: "Leave application submitted successfully." });
            // Reset form
            setLeaveType("");
            setStartDate("");
            setEndDate("");
            setReason("");
        } catch (error) {
            toast({ title: "Error", description: "Failed to submit leave application", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproval = async (id: string, status: 'Approved' | 'Rejected') => {
        try {
            await updateLeaveStatus(id, status);
            toast({
                title: status === 'Approved' ? "Leave Approved" : "Leave Rejected",
                description: `Application has been ${status.toLowerCase()}.`
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'Rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default: return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    // Data for views
    const myLeaves = getLeavesByWorker(user.id);
    const supervisorPendingLeaves = isSupervisor ? getLeavesBySupervisor(user.id).filter(l => l.status === 'Pending') : [];
    const supervisorHistoryLeaves = isSupervisor ? getLeavesBySupervisor(user.id).filter(l => l.status !== 'Pending') : [];
    const allLeaves = leaves; // For Admin

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leave Management</h1>
                <p className="text-slate-500 mt-2">Manage and track leave applications.</p>
            </div>

            {/* Worker Module: Apply for Leave */}
            {(isWorker || isSupervisor) && (
                <div className="grid gap-8 md:grid-cols-12">
                    <Card className="md:col-span-4 border shadow-sm">
                        <CardHeader>
                            <CardTitle>Apply for Leave</CardTitle>
                            <CardDescription>Submit a new leave request.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleApplyLeave} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Leave Type</Label>
                                    <Select onValueChange={setLeaveType} value={leaveType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Casual">Casual Leave</SelectItem>
                                            <SelectItem value="Sick">Sick Leave</SelectItem>
                                            <SelectItem value="Paid">Paid Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <Textarea
                                        placeholder="Reason for leave..."
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        className="resize-none"
                                    />
                                </div>
                                <Button className="w-full" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-8 border shadow-sm">
                        <CardHeader>
                            <CardTitle>My Leave History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myLeaves.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-slate-500">No leave records found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        myLeaves.map(leave => (
                                            <TableRow key={leave.id}>
                                                <TableCell className="font-medium">{leave.leaveType}</TableCell>
                                                <TableCell className="text-xs">
                                                    {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={leave.reason}>{leave.reason}</TableCell>
                                                <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Supervisor Module: Pending Approvals */}
            {isSupervisor && (
                <Card className="border shadow-sm border-l-4 border-l-orange-500">
                    <CardHeader>
                        <CardTitle>Pending Approvals (Team)</CardTitle>
                        <CardDescription>Review leave requests from your team members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Worker</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {supervisorPendingLeaves.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">No pending requests.</TableCell>
                                    </TableRow>
                                ) : (
                                    supervisorPendingLeaves.map(leave => (
                                        <TableRow key={leave.id}>
                                            <TableCell>
                                                <div className="font-medium">{leave.workerName}</div>
                                            </TableCell>
                                            <TableCell>{leave.department}</TableCell>
                                            <TableCell>{leave.leaveType}</TableCell>
                                            <TableCell className="text-xs">
                                                {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleApproval(leave.id, 'Rejected')}>
                                                    Reject
                                                </Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproval(leave.id, 'Approved')}>
                                                    Approve
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Admin Module: All Leaves */}
            {isAdmin && (
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>All Leave Records</CardTitle>
                        <CardDescription>Master list of all leave applications across the organization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Worker</TableHead>
                                    <TableHead>Supervisor</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Applied At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allLeaves.map(leave => (
                                    <TableRow key={leave.id}>
                                        <TableCell className="font-medium">{leave.workerName}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{leave.supervisorId}</TableCell>
                                        <TableCell>{leave.leaveType}</TableCell>
                                        <TableCell className="text-xs">
                                            {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground decoration-slate-400">
                                            {format(new Date(leave.appliedAt), 'MMM d, h:mm a')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
