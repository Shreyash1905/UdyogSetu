import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProduction } from '@/hooks/useProduction';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Hammer, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductionEntry() {
  const { user } = useAuth();
  const { entries, addEntry, getEntriesByWorker } = useProduction();
  const { toast } = useToast();

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !quantity || !user) return;

    addEntry({
      workerId: user.id,
      workerName: user.name,
      productName,
      quantity: parseInt(quantity),
      shift,
      date,
    });

    toast({
      title: 'Production entry added!',
      description: `${quantity} units of ${productName} recorded.`,
    });

    // Reset form
    setProductName('');
    setQuantity('');
  };

  // Get entries for current user if worker
  const myEntries = user?.role === 'worker' 
    ? getEntriesByWorker(user.id).slice().reverse()
    : entries.slice().reverse();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Production Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Steel Bolts M10"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="Number of units"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift</Label>
                  <Select value={shift} onValueChange={(v) => setShift(v as typeof shift)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (2 PM - 10 PM)</SelectItem>
                      <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Hammer className="w-4 h-4 mr-2" />
                Submit Production Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {user?.role === 'worker' ? 'My Recent Entries' : 'Recent Production Entries'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myEntries.slice(0, 10).map((entry) => (
                <div 
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                      <Hammer className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{entry.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.workerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 sm:items-center">
                    <span className="text-lg font-bold text-primary">
                      {entry.quantity.toLocaleString()} units
                    </span>
                    <ShiftBadge shift={entry.shift} />
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {entry.date}
                    </span>
                  </div>
                </div>
              ))}
              {myEntries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No production entries yet. Submit your first entry above!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function ShiftBadge({ shift }: { shift: string }) {
  const getShiftStyle = () => {
    switch (shift) {
      case 'morning':
        return 'bg-warning/20 text-warning';
      case 'afternoon':
        return 'bg-primary/20 text-primary';
      case 'night':
        return 'bg-foreground/10 text-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize',
      getShiftStyle()
    )}>
      {shift}
    </span>
  );
}
