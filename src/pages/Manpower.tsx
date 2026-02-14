import { useAuth } from "@/contexts/AuthContext";
import { useLeaves } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserMinus, Building2 } from "lucide-react";
import { getStorageItem, STORAGE_KEYS } from "@/lib/storage";
import { User } from "@/types/dwoms";
import { useMemo } from "react";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

export default function Manpower() {
    const { user } = useAuth();
    const { leaves } = useLeaves();

    if (!user || user.role === 'worker' || user.role === 'client') return (
        <div className="p-8 text-center">You do not have permission to view this page.</div>
    );

    const isAdmin = user.role === 'admin';
    const isSupervisor = user.role === 'supervisor';

    // Fetch all users for calculation
    const allUsers = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
    const workers = allUsers.filter(u => u.role === 'worker');

    // Helper to check if a worker is currently on leave
    const isWorkerOnLeave = (workerId: string) => {
        const today = new Date();
        const approvedLeaves = leaves.filter(l =>
            l.workerId === workerId &&
            l.status === 'Approved'
        );

        return approvedLeaves.some(l =>
            isWithinInterval(today, {
                start: startOfDay(parseISO(l.startDate)),
                end: endOfDay(parseISO(l.endDate))
            })
        );
    };

    // Supervisor View Data
    const myTeam = useMemo(() => {
        if (!isSupervisor) return [];
        return workers.filter(w => w.supervisorId === user.id).map(w => ({
            ...w,
            status: isWorkerOnLeave(w.id) ? 'On Leave' : 'Active'
        }));
    }, [workers, user.id, leaves]);

    // Admin View Data
    const departmentStats = useMemo(() => {
        if (!isAdmin) return [];

        const depts: Record<string, { total: number; active: number; onLeave: number; supervisors: Set<string> }> = {};

        workers.forEach(w => {
            const dept = w.department || 'Unassigned';
            if (!depts[dept]) {
                depts[dept] = { total: 0, active: 0, onLeave: 0, supervisors: new Set() };
            }

            depts[dept].total++;
            if (isWorkerOnLeave(w.id)) {
                depts[dept].onLeave++;
            } else {
                depts[dept].active++;
            }

            if (w.supervisorId) {
                // Find supervisor name
                const sup = allUsers.find(u => u.id === w.supervisorId);
                if (sup) depts[dept].supervisors.add(sup.name);
            }
        });

        return Object.entries(depts).map(([name, stats]) => ({
            name,
            ...stats,
            supervisors: Array.from(stats.supervisors).join(', ')
        }));
    }, [workers, leaves]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manpower Visibility</h1>
                <p className="text-slate-500 mt-2">Track workforce distribution and availability.</p>
            </div>

            {/* Stats Cards (Admin) */}
            {isAdmin && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{workers.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {workers.filter(w => !isWorkerOnLeave(w.id)).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                            <UserMinus className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">
                                {workers.filter(w => isWorkerOnLeave(w.id)).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Supervisor Module: My Team Status */}
            {isSupervisor && (
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>My Team Status</CardTitle>
                        <CardDescription>Current availability of workers reporting to you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Worker Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myTeam.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">No workers assigned.</TableCell>
                                    </TableRow>
                                ) : (
                                    myTeam.map(w => (
                                        <TableRow key={w.id}>
                                            <TableCell className="font-medium">{w.name}</TableCell>
                                            <TableCell>{w.department}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{w.email}</TableCell>
                                            <TableCell>
                                                {w.status === 'Active' ? (
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                        <UserCheck className="w-3 h-3 mr-1" /> Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                        <UserMinus className="w-3 h-3 mr-1" /> On Leave
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Admin Module: Department Overview */}
            {isAdmin && (
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Department Overview</CardTitle>
                        <CardDescription>Workforce breakdown by department.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Supervisors</TableHead>
                                    <TableHead className="text-center">Total</TableHead>
                                    <TableHead className="text-center">Active</TableHead>
                                    <TableHead className="text-center">On Leave</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departmentStats.map(stat => (
                                    <TableRow key={stat.name}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                {stat.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{stat.supervisors || 'None'}</TableCell>
                                        <TableCell className="text-center font-bold">{stat.total}</TableCell>
                                        <TableCell className="text-center text-emerald-600 font-medium">{stat.active}</TableCell>
                                        <TableCell className="text-center text-red-500 font-medium">{stat.onLeave}</TableCell>
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
