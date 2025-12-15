import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Factory,
  LayoutDashboard,
  ClipboardList,
  Package,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Hammer,
} from 'lucide-react';
import { useState } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'worker', 'client'] },
  { name: 'Production Entry', href: '/production', icon: Hammer, roles: ['admin', 'supervisor', 'worker'] },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList, roles: ['admin', 'supervisor', 'worker'] },
  { name: 'Inventory', href: '/inventory', icon: Package, roles: ['admin', 'supervisor'] },
  { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'supervisor'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavigation = navigation.filter(
    item => user && item.roles.includes(user.role)
  );

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
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary">
              <Factory className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">DWOMS</h1>
              <p className="text-xs text-sidebar-foreground/60">Operations System</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sidebar-accent text-sidebar-foreground font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                  getRoleBadgeColor(user?.role || '')
                )}>
                  {user?.role}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {filteredNavigation.find(n => n.href === location.pathname)?.name || 'DWOMS'}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
