import { useState } from 'react';
import { useProduction } from '@/hooks/useProduction';
import { useTasks } from '@/hooks/useTasks';
import { useInventory } from '@/hooks/useInventory';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, FileSpreadsheet, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Reports() {
  const { entries } = useProduction();
  const { tasks } = useTasks();
  const { items } = useInventory();
  const { toast } = useToast();

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Filter data by date range
  const filteredEntries = entries.filter(e => e.date >= startDate && e.date <= endDate);
  const filteredTasks = tasks.filter(t => {
    const taskDate = t.timestamp.split('T')[0];
    return taskDate >= startDate && taskDate <= endDate;
  });

  // Export to CSV
  const exportToCSV = (type: 'production' | 'tasks' | 'inventory') => {
    let csv = '';
    let filename = '';

    switch (type) {
      case 'production':
        csv = 'Date,Worker,Product,Quantity,Shift\n';
        filteredEntries.forEach(e => {
          csv += `${e.date},${e.workerName},"${e.productName}",${e.quantity},${e.shift}\n`;
        });
        filename = `production_${startDate}_to_${endDate}.csv`;
        break;
      case 'tasks':
        csv = 'Product Type,Assigned Worker,Status,Estimated Time (min),Created Date\n';
        filteredTasks.forEach(t => {
          csv += `"${t.productType}",${t.assignedWorkerName},${t.status},${t.estimatedTime},${t.timestamp.split('T')[0]}\n`;
        });
        filename = `tasks_${startDate}_to_${endDate}.csv`;
        break;
      case 'inventory':
        csv = 'Item Name,Current Stock,Min Stock Level,Unit,Last Updated\n';
        items.forEach(i => {
          csv += `"${i.itemName}",${i.currentStock},${i.minStockLevel},${i.unit},${i.lastUpdated.split('T')[0]}\n`;
        });
        filename = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export successful!',
      description: `${filename} has been downloaded.`,
    });
  };

  // Export to PDF
  const exportToPDF = (type: 'production' | 'tasks' | 'inventory') => {
    const doc = new jsPDF();
    let title = '';
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);

    switch (type) {
      case 'production':
        title = `Production Report (${startDate} to ${endDate})`;
        doc.text(title, 14, y);
        y += 15;
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Total Entries: ${filteredEntries.length}`, 14, y);
        doc.text(`Total Quantity: ${filteredEntries.reduce((s, e) => s + e.quantity, 0)}`, 80, y);
        y += 15;

        doc.setFontSize(9);
        doc.setTextColor(33, 37, 41);
        
        filteredEntries.slice(0, 30).forEach((e, i) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(`${e.date} | ${e.workerName} | ${e.productName} | ${e.quantity} units | ${e.shift}`, 14, y);
          y += 7;
        });
        break;

      case 'tasks':
        title = `Tasks Report (${startDate} to ${endDate})`;
        doc.text(title, 14, y);
        y += 15;

        const completed = filteredTasks.filter(t => t.status === 'Completed').length;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Total Tasks: ${filteredTasks.length}`, 14, y);
        doc.text(`Completed: ${completed}`, 80, y);
        y += 15;

        doc.setFontSize(9);
        doc.setTextColor(33, 37, 41);
        
        filteredTasks.slice(0, 30).forEach((t, i) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(`${t.productType} | ${t.assignedWorkerName} | ${t.status} | ${t.estimatedTime} min`, 14, y);
          y += 7;
        });
        break;

      case 'inventory':
        title = `Inventory Report (${new Date().toLocaleDateString()})`;
        doc.text(title, 14, y);
        y += 15;

        const lowStock = items.filter(i => i.currentStock <= i.minStockLevel).length;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Total Items: ${items.length}`, 14, y);
        doc.text(`Low Stock: ${lowStock}`, 80, y);
        y += 15;

        doc.setFontSize(9);
        doc.setTextColor(33, 37, 41);
        
        items.forEach((item, i) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const status = item.currentStock <= item.minStockLevel ? '[LOW]' : '';
          doc.text(`${item.itemName} | ${item.currentStock} ${item.unit} (min: ${item.minStockLevel}) ${status}`, 14, y);
          y += 7;
        });
        break;
    }

    doc.save(`dwoms_${type}_report.pdf`);
    
    toast({
      title: 'PDF generated!',
      description: `dwoms_${type}_report.pdf has been downloaded.`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Report Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Production Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Production Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                {filteredEntries.length}
              </div>
              <p className="text-sm text-muted-foreground">
                entries in selected period
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV('production')}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToPDF('production')}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                {filteredTasks.length}
              </div>
              <p className="text-sm text-muted-foreground">
                tasks in selected period
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV('tasks')}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToPDF('tasks')}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                {items.length}
              </div>
              <p className="text-sm text-muted-foreground">
                items in inventory
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV('inventory')}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToPDF('inventory')}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {filteredEntries.reduce((s, e) => s + e.quantity, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Units Produced</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-success">
                  {filteredTasks.filter(t => t.status === 'Completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-warning">
                  {filteredTasks.filter(t => t.status !== 'Completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Tasks Pending</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-destructive">
                  {items.filter(i => i.currentStock <= i.minStockLevel).length}
                </p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
