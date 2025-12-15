import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, ArrowUp, ArrowDown, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Inventory() {
  const { items, addItem, updateStock, getLowStockItems } = useInventory();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [stockAction, setStockAction] = useState<'in' | 'out'>('in');

  // New item form
  const [itemName, setItemName] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('');
  const [unit, setUnit] = useState('');

  // Stock update form
  const [stockQuantity, setStockQuantity] = useState('');

  const lowStockItems = getLowStockItems();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    addItem({
      itemName,
      currentStock: parseInt(currentStock),
      minStockLevel: parseInt(minStockLevel),
      unit,
    });

    toast({
      title: 'Item added!',
      description: `${itemName} added to inventory.`,
    });

    // Reset form
    setItemName('');
    setCurrentStock('');
    setMinStockLevel('');
    setUnit('');
    setIsAddDialogOpen(false);
  };

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;

    updateStock(selectedItemId, parseInt(stockQuantity), stockAction === 'in');
    
    const item = items.find(i => i.id === selectedItemId);
    toast({
      title: `Stock ${stockAction === 'in' ? 'added' : 'removed'}!`,
      description: `${stockQuantity} ${item?.unit} ${stockAction === 'in' ? 'added to' : 'removed from'} ${item?.itemName}.`,
    });

    setStockQuantity('');
    setIsStockDialogOpen(false);
    setSelectedItemId(null);
  };

  const openStockDialog = (itemId: string, action: 'in' | 'out') => {
    setSelectedItemId(itemId);
    setStockAction(action);
    setIsStockDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with add button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Inventory Management</h2>
            <p className="text-sm text-muted-foreground">
              {lowStockItems.length > 0 && (
                <span className="text-destructive font-medium">
                  {lowStockItems.length} items below minimum stock level
                </span>
              )}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Steel Rod 10mm"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      min="0"
                      placeholder="100"
                      value={currentStock}
                      onChange={(e) => setCurrentStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStockLevel">Min Stock Level</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      min="0"
                      placeholder="20"
                      value={minStockLevel}
                      onChange={(e) => setMinStockLevel(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., kg, pieces, liters"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Inventory Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isLowStock = item.currentStock <= item.minStockLevel;
            return (
              <Card 
                key={item.id}
                className={cn(
                  isLowStock && 'border-destructive/50 bg-destructive/5'
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {item.itemName}
                    {isLowStock && (
                      <AlertTriangle className="w-4 h-4 text-destructive ml-auto" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className={cn(
                        'text-3xl font-bold',
                        isLowStock ? 'text-destructive' : 'text-primary'
                      )}>
                        {item.currentStock}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.unit}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Min: {item.minStockLevel}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openStockDialog(item.id, 'in')}
                    >
                      <ArrowUp className="w-3 h-3 mr-1 text-success" />
                      Stock In
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openStockDialog(item.id, 'out')}
                    >
                      <ArrowDown className="w-3 h-3 mr-1 text-destructive" />
                      Stock Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {items.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No inventory items yet.</p>
              <p className="text-sm text-muted-foreground">Click "Add Item" to get started.</p>
            </CardContent>
          </Card>
        )}

        {/* Stock Update Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {stockAction === 'in' ? 'Stock In' : 'Stock Out'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleStockUpdate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className={cn(
                  'w-full',
                  stockAction === 'out' && 'bg-destructive hover:bg-destructive/90'
                )}
              >
                {stockAction === 'in' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
