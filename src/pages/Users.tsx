import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users as UsersIcon, Trash2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/dwoms';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { users, addUser, updateUserRole, deleteUser } = useUsers();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('worker');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Check if email exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'A user with this email already exists.',
        variant: 'destructive',
      });
      return;
    }

    addUser({ name, email, role }, currentUser.id);

    toast({
      title: 'User created!',
      description: `${name} has been added as ${role}.`,
    });

    setName('');
    setEmail('');
    setRole('worker');
    setIsDialogOpen(false);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole(userId, newRole);
    toast({
      title: 'Role updated!',
      description: 'User role has been changed.',
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: 'Error',
        description: "You can't delete your own account.",
        variant: 'destructive',
      });
      return;
    }

    deleteUser(userId);
    toast({
      title: 'User deleted',
      description: `${userName} has been removed.`,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive/20 text-destructive';
      case 'supervisor': return 'bg-secondary/20 text-secondary';
      case 'worker': return 'bg-primary/20 text-primary';
      case 'client': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">User Management</h2>
            <p className="text-sm text-muted-foreground">
              {users.length} users in the system
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg gap-4',
                    user.id === currentUser?.id ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-primary">(You)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-16 sm:ml-0">
                    {user.id === currentUser?.id ? (
                      <span className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize',
                        getRoleBadgeColor(user.role)
                      )}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    ) : (
                      <>
                        <Select 
                          value={user.role} 
                          onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="worker">Worker</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
