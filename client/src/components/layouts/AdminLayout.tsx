import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Building2, 
  DollarSign, 
  FileText, 
  Settings, 
  Bell, 
  BarChart, 
  CheckSquare, 
  Menu, 
  LogOut, 
  ChevronDown, 
  Activity,
  BookOpen,
  MessageSquare,
  Lock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Define navigation items
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <Home size={20} /> },
    { name: 'Users', href: '/admin/users', icon: <Users size={20} /> },
    { name: 'KYC Verification', href: '/admin/kyc', icon: <CheckSquare size={20} /> },
    { name: 'Properties', href: '/admin/properties', icon: <Building2 size={20} /> },
    { name: 'Investments', href: '/admin/investments', icon: <DollarSign size={20} /> },
    { name: 'ROI Tracking', href: '/admin/roi', icon: <BarChart size={20} /> },
    { name: 'Educational Content', href: '/admin/educational-resources', icon: <BookOpen size={20} /> },
    { name: 'Payment Transactions', href: '/admin/transactions', icon: <Activity size={20} /> },
    { name: 'Forum Moderation', href: '/admin/forum', icon: <MessageSquare size={20} /> },
  ];

  // Super admin specific items
  const superAdminItems = [
    { name: 'System Settings', href: '/admin/settings', icon: <Settings size={20} /> },
    { name: 'Activity Logs', href: '/admin/logs', icon: <FileText size={20} /> },
    { name: 'Security', href: '/admin/security', icon: <Lock size={20} /> },
  ];

  // Check if the given route is active
  const isActive = (path: string) => {
    return location === path || (path !== '/admin' && location.startsWith(path));
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className={`border-r bg-background/95 backdrop-blur-sm ${sidebarOpen ? 'w-64' : 'w-20'} h-screen hidden md:flex flex-col transition-all`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <img src="/logo.svg" alt="iREVA" className="h-8 w-8 text-primary" />
            {sidebarOpen && <span className="ml-2 font-semibold text-xl">iREVA Admin</span>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size={sidebarOpen ? "default" : "icon"}
                  className={`w-full justify-start ${isActive(item.href) ? 'font-medium' : ''}`}
                >
                  {item.icon}
                  {sidebarOpen && <span className="ml-2">{item.name}</span>}
                </Button>
              </Link>
            ))}
            
            {user?.role === 'super_admin' && (
              <>
                {sidebarOpen && (
                  <div className="mt-4 mb-2 px-3">
                    <p className="text-xs font-semibold text-muted-foreground">SUPER ADMIN</p>
                  </div>
                )}
                
                {superAdminItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      size={sidebarOpen ? "default" : "icon"}
                      className={`w-full justify-start ${isActive(item.href) ? 'font-medium' : ''}`}
                    >
                      {item.icon}
                      {sidebarOpen && <span className="ml-2">{item.name}</span>}
                    </Button>
                  </Link>
                ))}
              </>
            )}
          </nav>
        </ScrollArea>
        
        <div className="border-t p-4">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.username || 'User'} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="w-full" onClick={handleLogout}>
              <LogOut size={18} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <Sheet>
        <div className="md:hidden flex items-center border-b h-16 px-4">
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-4">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <div className="flex items-center">
            <img src="/logo.svg" alt="iREVA" className="h-8 w-8 text-primary" />
            <span className="ml-2 font-semibold text-xl">iREVA Admin</span>
          </div>
        </div>
        
        <SheetContent side="left" className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <img src="/logo.svg" alt="iREVA" className="h-8 w-8 text-primary" />
              <span className="ml-2 font-semibold text-xl">iREVA Admin</span>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className={`w-full justify-start ${isActive(item.href) ? 'font-medium' : ''}`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                </Link>
              ))}
              
              {user?.role === 'super_admin' && (
                <>
                  <div className="mt-4 mb-2 px-3">
                    <p className="text-xs font-semibold text-muted-foreground">SUPER ADMIN</p>
                  </div>
                  
                  {superAdminItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button 
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className={`w-full justify-start ${isActive(item.href) ? 'font-medium' : ''}`}
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </Button>
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.username || 'User'} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top nav for desktop */}
        <header className="hidden md:flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-semibold">
            {navItems.find(item => isActive(item.href))?.name || 
             superAdminItems.find(item => isActive(item.href))?.name || 
             'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell size={18} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.username || 'User'} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user?.firstName} {user?.lastName}</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}