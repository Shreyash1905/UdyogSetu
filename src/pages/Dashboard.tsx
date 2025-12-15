import { useAuth } from '@/contexts/AuthContext';
import { useProduction } from '@/hooks/useProduction';
import { useTasks } from '@/hooks/useTasks';
import { useInventory } from '@/hooks/useInventory';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  Hammer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const { entries, getTodayTotal, getWorkerProductivity } = useProduction();
  const { getTaskCounts, tasks } = useTasks();
  const { getLowStockItems, items } = useInventory();

  const taskCounts = getTaskCounts();
  const lowStockItems = getLowStockItems();
  const todayTotal = getTodayTotal();
  const workerProductivity = getWorkerProductivity();

  // Get tasks for worker view
  const workerTasks = user?.role === 'worker' 
    ? tasks.filter(t => t.assignedWorkerId === user.id)
    : [];

  const stats = [
    {
      title: "Today's Production",
      value: todayTotal.toLocaleString(),
      icon: Hammer,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Active Tasks',
      value: taskCounts.inProgress + taskCounts.assigned,
      icon: ClipboardList,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      title: 'Completed Tasks',
      value: taskCounts.completed,
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: lowStockItems.length > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome message */}
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Here's your factory overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className={cn('p-3 rounded-lg', stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                {user?.role === 'worker' ? 'My Tasks' : 'Recent Tasks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(user?.role === 'worker' ? workerTasks : tasks)
                  .slice(0, 5)
                  .map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{task.productType}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.assignedWorkerName}
                        </p>
                      </div>
                      <TaskStatusBadge status={task.status} />
                    </div>
                  ))}
                {tasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No tasks found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        Min: {item.minStockLevel} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">
                        {item.currentStock} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-muted-foreground">All stock levels are healthy</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Worker Productivity */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Worker Productivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workerProductivity.slice(0, 6).map((worker, index) => (
                    <div 
                      key={worker.workerId}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                    >
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm',
                        index === 0 ? 'bg-secondary text-secondary-foreground' :
                        index === 1 ? 'bg-muted-foreground/20 text-foreground' :
                        'bg-muted text-muted-foreground'
                      )}>
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{worker.workerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {worker.quantity.toLocaleString()} units
                        </p>
                      </div>
                    </div>
                  ))}
                  {workerProductivity.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-4">
                      No production data yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'Assigned':
        return 'bg-muted text-muted-foreground';
      case 'In Progress':
        return 'bg-primary/20 text-primary';
      case 'Quality Check':
        return 'bg-warning/20 text-warning';
      case 'Completed':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      getStatusStyle()
    )}>
      {status}
    </span>
  );
}
