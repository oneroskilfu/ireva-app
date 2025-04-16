import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  PieChart, 
  Building, 
  Wallet, 
  Users, 
  BookOpen, 
  Bell, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  Menu, 
  LogOut, 
  ChevronDown, 
  Award,
  Activity,
  User
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

interface InvestorLayoutProps {
  children: ReactNode;
}

export default function InvestorLayout({ children }: InvestorLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Define navigation items
  const navItems = [
    { name: 'Dashboard', href: '/investor', icon: <Home size={20} /> },
    { name: 'Portfolio', href: '/investor/portfolio', icon: <PieChart size={20} /> },
    { name: 'Properties', href: '/investor/properties', icon: <Building size={20} /> },
    { name: 'Wallet', href: '/investor/wallet', icon: <Wallet size={20} /> },
    { name: 'Account Activity', href: '/investor/activity', icon: <Activity size={20} /> },
    { name: 'Achievements', href: '/investor/achievements', icon: <Award size={20} /> },
    { name: 'Community', href: '/investor/community', icon: <Users size={20} /> },
    { name: 'Resources', href: '/investor/resources', icon: <BookOpen size={20} /> },
    { name: 'Messages', href: '/investor/messages', icon: <MessageSquare size={20} /> },
  ];

  // Check if the given route is active
  const isActive = (path: string) => {
    return location === path || (path !== '/investor' && location.startsWith(path));
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const Sidebar = ({ children }: { children: ReactNode }) => (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className={`border-r bg-background/95 backdrop-blur-sm ${sidebarOpen ? 'w-64' : 'w-20'} h-screen hidden md:flex flex-col transition-all`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <img src="/logo.svg" alt="iREVA" className="h-8 w-8 text-primary" />
            {sidebarOpen && <span className="ml-2 font-semibold text-xl">iREVA</span>}
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
                  <p className="text-xs text-muted-foreground">Investor</p>
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
            <span className="ml-2 font-semibold text-xl">iREVA</span>
          </div>
        </div>
        
        <SheetContent side="left" className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <img src="/logo.svg" alt="iREVA" className="h-8 w-8 text-primary" />
              <span className="ml-2 font-semibold text-xl">iREVA</span>
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
                  <p className="text-xs text-muted-foreground">Investor</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {children}
    </div>
  );

  const Topbar = () => (
    <header className="h-16 items-center justify-between border-b px-6 hidden md:flex">
      <h1 className="text-xl font-semibold">
        {navItems.find(item => isActive(item.href))?.name || 'Dashboard'}
      </h1>
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="relative">
          <Bell size={18} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        
        <Button variant="outline" size="icon">
          <HelpCircle size={18} />
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
              <Link href="/investor/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/investor/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
  
  const Content = ({ children }: { children: ReactNode }) => (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Topbar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );

  return (
    <Sidebar>
      <Content>
        {children}
      </Content>
    </Sidebar>
  );
}