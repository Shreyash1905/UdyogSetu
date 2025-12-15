import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, ClipboardList, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/types/dwoms';

export default function Tasks() {
  const { user } = useAuth();
  const { tasks, createTask, updateTaskStatus, getNextStatusOptions, getTasksByWorker } = useTasks();
  const { getWorkers } = useUsers();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productType, setProductType] = useState('');
  const [assignedWorkerId, setAssignedWorkerId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  const workers = getWorkers();
  const canCreateTask = user?.role === 'admin' || user?.role === 'supervisor';
  
  // Filter tasks based on role
  const visibleTasks = user?.role === 'worker' 
    ? getTasksByWorker(user.id)
    : tasks;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const worker = workers.find(w => w.id === assignedWorkerId);
    if (!worker || !user) return;

    createTask({
      productType,
      assignedWorkerId,
      assignedWorkerName: worker.name,
      estimatedTime: parseInt(estimatedTime),
      createdBy: user.id,
    });

    toast({
      title: 'Task created!',
      description: `Task assigned to ${worker.name}.`,
    });

    // Reset form
    setProductType('');
    setAssignedWorkerId('');
    setEstimatedTime('');
    setIsDialogOpen(false);
  };

  const handleStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    toast({
      title: 'Task updated!',
      description: `Status changed to ${newStatus}.`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with create button */}
        {canCreateTask && (
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="productType">Product / Task Type</Label>
                    <Input
                      id="productType"
                      placeholder="e.g., Steel Bolts Assembly"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="worker">Assign to Worker</Label>
                    <Select value={assignedWorkerId} onValueChange={setAssignedWorkerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      min="1"
                      placeholder="e.g., 120"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!assignedWorkerId}>
                    Create Task
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Task Status Columns */}
        <div className="grid lg:grid-cols-4 gap-4">
          {(['Assigned', 'In Progress', 'Quality Check', 'Completed'] as TaskStatus[]).map((status) => {
            const statusTasks = visibleTasks.filter(t => t.status === status);
            return (
              <Card key={status} className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TaskStatusIcon status={status} />
                    {status}
                    <span className="ml-auto bg-muted px-2 py-0.5 rounded-full text-xs">
                      {statusTasks.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statusTasks.map((task) => {
                    const nextStatuses = getNextStatusOptions(task.status);
                    const canUpdate = user?.role === 'worker' 
                      ? task.assignedWorkerId === user.id
                      : user?.role === 'admin' || user?.role === 'supervisor';

                    return (
                      <div 
                        key={task.id}
                        className="p-3 bg-muted/50 rounded-lg space-y-2"
                      >
                        <p className="font-medium text-sm">{task.productType}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.assignedWorkerName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {task.estimatedTime} min
                        </div>
                        
                        {canUpdate && nextStatuses.length > 0 && (
                          <div className="pt-2">
                            {nextStatuses.map((nextStatus) => (
                              <Button
                                key={nextStatus}
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => handleStatusUpdate(task.id, nextStatus)}
                              >
                                Move to {nextStatus}
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {statusTasks.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">
                      No tasks
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  const getColor = () => {
    switch (status) {
      case 'Assigned': return 'bg-muted text-muted-foreground';
      case 'In Progress': return 'bg-primary/20 text-primary';
      case 'Quality Check': return 'bg-warning/20 text-warning';
      case 'Completed': return 'bg-success/20 text-success';
    }
  };

  return (
    <div className={cn('w-2 h-2 rounded-full', getColor())} />
  );
}
