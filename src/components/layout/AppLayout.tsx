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
  UserPen,
  Calendar,
  HardHat,
  ShoppingCart,
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
  { name: 'Leaves', href: '/leaves', icon: Calendar, roles: ['admin', 'supervisor', 'worker'] },
  { name: 'Manpower', href: '/manpower', icon: HardHat, roles: ['admin', 'supervisor'] },
  { name: 'Orders', href: '/orders', icon: ShoppingCart, roles: ['admin', 'supervisor', 'client'] },
  { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'supervisor', 'client'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Profile', href: '/profile', icon: UserPen, roles: ['admin', 'supervisor', 'worker', 'client'] },
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
    <div className="flex h-screen overflow-hidden bg-background">
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
          'absolute inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border/50 bg-sidebar w-[260px] transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-[64px] shrink-0 items-center gap-3 px-6 border-b border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">UdyogSetu</h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/60">Workspace</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border/50 bg-sidebar">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sidebar-accent/50 text-sidebar-foreground font-semibold overflow-hidden ring-2 ring-sidebar-border">
                {user?.profileImageURL ? (
                  <img src={user.profileImageURL} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize',
                  getRoleBadgeColor(user?.role || '')
                )}>
                  {user?.role}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content wrapper - Flexes to fill remaining space */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex h-[64px] shrink-0 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {filteredNavigation.find(n => n.href === location.pathname)?.name || 'UdyogSetu'}
            </h2>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
