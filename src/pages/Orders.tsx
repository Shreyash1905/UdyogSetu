import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientOrders } from '@/contexts/ClientOrderContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Plus, Check, X, Clock, AlertCircle, ShoppingCart, User, HardHat } from 'lucide-react';
import { dummyUsers } from '@/lib/dummyData'; // For supervisor list

const departments = ['Production A', 'Production B', 'Logistics', 'Quality Control', 'Maintenance'];

export default function Orders() {
    const { user } = useAuth();
    const { orders, placeOrder, updateOrderStatus, isLoading } = useClientOrders();
    const { toast } = useToast();

    // State for new order form
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [materialName, setMaterialName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('units');
    const [requiredDate, setRequiredDate] = useState('');
    const [department, setDepartment] = useState(departments[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for admin approval
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [approvalSupervisor, setApprovalSupervisor] = useState('');
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);

    // Filter orders based on role
    const getFilteredOrders = () => {
        if (!user) return [];

        switch (user.role) {
            case 'client':
                return orders.filter(o => o.clientId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'admin':
                return orders.sort((a, b) => {
                    // Pending first, then by date
                    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
            case 'supervisor':
                return orders.filter(o => o.assignedSupervisorId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            default:
                return [];
        }
    };

    const filteredOrders = getFilteredOrders();
    const supervisors = dummyUsers.filter(u => u.role === 'supervisor');

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            const success = await placeOrder({
                clientId: user.id,
                clientName: user.name,
                materialName,
                quantity: Number(quantity),
                unit,
                requiredDate,
                department,
                notes,
            });

            if (success) {
                toast({
                    title: "Order Placed",
                    description: "Your material request has been submitted successfully.",
                });
                setIsNewOrderOpen(false);
                // Reset form
                setMaterialName('');
                setQuantity('');
                setNotes('');
            } else {
                throw new Error("Failed to place order");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to place order. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedOrder || !approvalSupervisor || !user) return;

        const supervisor = supervisors.find(s => s.id === approvalSupervisor);

        setIsSubmitting(true);
        try {
            await updateOrderStatus(selectedOrder, 'Approved', {
                assignedSupervisorId: approvalSupervisor,
                assignedSupervisorName: supervisor?.name || 'Unknown',
                approvedBy: user.id,
                approvedAt: new Date().toISOString()
            });

            toast({
                title: "Order Approved",
                description: `Order assigned to supervisor ${supervisor?.name}`,
            });
            setIsApprovalOpen(false);
            setSelectedOrder(null);
            setApprovalSupervisor('');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to approve order.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async (orderId: string) => {
        if (!confirm('Are you sure you want to reject this order?')) return;

        try {
            await updateOrderStatus(orderId, 'Rejected', {
                approvedAt: new Date().toISOString() // Using same field for rejection timestamp
            });
            toast({
                title: "Order Rejected",
                description: "The order has been marked as rejected.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to reject order.",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/15 text-yellow-600 border-yellow-500/25';
            case 'Approved': return 'bg-green-500/15 text-green-600 border-green-500/25';
            case 'Rejected': return 'bg-red-500/15 text-red-600 border-red-500/25';
            case 'In Progress': return 'bg-blue-500/15 text-blue-600 border-blue-500/25';
            case 'Completed': return 'bg-slate-500/15 text-slate-600 border-slate-500/25';
            default: return 'bg-gray-500/15 text-gray-600 border-gray-500/25';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Material Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        {user?.role === 'client' ? 'Track and manage your material requests' :
                            user?.role === 'admin' ? 'Manage incoming client orders' :
                                'View and fulfill assigned material orders'}
                    </p>
                </div>

                {user?.role === 'client' && (
                    <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                        <DialogTrigger asChild>
                            <Button className="shrink-0 gap-2">
                                <Plus className="h-4 w-4" />
                                New Order
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Place Material Order</DialogTitle>
                                <DialogDescription>
                                    Submit a new request for raw materials or components.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handlePlaceOrder} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="material">Material Name</Label>
                                    <Input
                                        id="material"
                                        placeholder="e.g., Steel Rods, Copper Wire"
                                        value={materialName}
                                        onChange={(e) => setMaterialName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            placeholder="0.00"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="unit">Unit</Label>
                                        <Select value={unit} onValueChange={setUnit}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="units">Units</SelectItem>
                                                <SelectItem value="kg">Kg</SelectItem>
                                                <SelectItem value="meters">Meters</SelectItem>
                                                <SelectItem value="liters">Liters</SelectItem>
                                                <SelectItem value="boxes">Boxes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Required Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={requiredDate}
                                        onChange={(e) => setRequiredDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="department">Target Department</Label>
                                    <Select value={department} onValueChange={setDepartment}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any specific detailed requirements..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button type="button" variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Place Order'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">No Orders Found</h3>
                        <p className="text-sm max-w-sm mt-2">
                            {user?.role === 'client'
                                ? "You haven't placed any orders yet. Click 'New Order' to get started."
                                : "There are no orders matching your criteria at the moment."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden card-hover">
                            <CardHeader className="pb-3 bg-muted/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className={`mb-2 ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </Badge>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {order.materialName}
                                        </CardTitle>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold block">{order.quantity} {order.unit}</span>
                                        <span className="text-xs text-muted-foreground">Req: {format(new Date(order.requiredDate), 'MMM d')}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider opacity-70">Client</p>
                                        <p className="text-foreground flex items-center gap-1.5 font-medium">
                                            <User className="h-3 w-3" /> {order.clientName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider opacity-70">Department</p>
                                        <p className="text-foreground">{order.department}</p>
                                    </div>
                                </div>

                                {order.notes && (
                                    <div className="bg-muted/50 p-2 rounded text-xs italic border border-border/50">
                                        "{order.notes}"
                                    </div>
                                )}

                                {order.assignedSupervisorName && (
                                    <div className="flex items-center gap-2 text-xs bg-secondary/10 p-2 rounded text-secondary-foreground">
                                        <HardHat className="h-3 w-3" />
                                        <span>Supervisor: <strong>{order.assignedSupervisorName}</strong></span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                                    <Clock className="h-3 w-3" />
                                    Created {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                </div>
                            </CardContent>

                            {/* Admin Actions */}
                            {user?.role === 'admin' && order.status === 'Pending' && (
                                <CardFooter className="bg-muted/30 p-3 gap-2 border-t">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            setSelectedOrder(order.id);
                                            setIsApprovalOpen(true);
                                            setApprovalSupervisor(
                                                supervisors.find(s => s.department === order.department)?.id || ''
                                            );
                                        }}
                                    >
                                        <Check className="h-3 w-3 mr-1" /> Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-destructive hover:bg-destructive/10 border-destructive/30"
                                        onClick={() => handleReject(order.id)}
                                    >
                                        <X className="h-3 w-3 mr-1" /> Reject
                                    </Button>
                                </CardFooter>
                            )}

                            {/* Supervisor Actions (Mock) */}
                            {user?.role === 'supervisor' && order.status === 'Approved' && (
                                <CardFooter className="bg-muted/30 p-3 border-t">
                                    <Button variant="secondary" size="sm" className="w-full gap-2">
                                        Create Production Task
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Approval Dialog */}
            <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve & Assign Order</DialogTitle>
                        <DialogDescription>
                            Assign a supervisor to oversee this material order request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Select Supervisor</Label>
                        <Select value={approvalSupervisor} onValueChange={setApprovalSupervisor}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                                {supervisors.map(supervisor => (
                                    <SelectItem key={supervisor.id} value={supervisor.id}>
                                        {supervisor.name} ({supervisor.department || 'General'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 mt-4 text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                            <AlertCircle className="h-4 w-4" />
                            <span>This will notify the supervisor and move the order to "Approved" status.</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApprovalOpen(false)}>Cancel</Button>
                        <Button onClick={handleApprove} disabled={!approvalSupervisor || isSubmitting}>
                            {isSubmitting ? 'Confirming...' : 'Confirm Assignment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
