import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  Building,
  FileText,
  DollarSign,
  ShieldCheck,
  Settings,
  ChevronDown,
  Activity,
  HelpCircle,
  MessageSquare,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const AdminSidebar: React.FC = () => {
  const [location] = useLocation();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    management: true,
    finance: true,
    system: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <aside className="bg-white border-r min-h-screen w-64 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-primary">iREVA Admin</h2>
        <p className="text-xs text-muted-foreground">Management Portal</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link href="/admin">
              <a className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                isActive("/admin") && !isActive("/admin/activity-logs") && "bg-primary/10 text-primary font-semibold"
              )}>
                <BarChart3 size={18} />
                Dashboard
              </a>
            </Link>
          </li>

          {/* Back to Main Site */}
          <li>
            <Link href="/">
              <a className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
                <Home size={18} />
                Back to Main Site
              </a>
            </Link>
          </li>

          <li className="pt-4">
            <Collapsible
              open={openSections.management}
              onOpenChange={() => toggleSection('management')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between items-center px-3 py-2 text-sm font-medium">
                  <span className="flex items-center gap-3">
                    <Users size={18} />
                    Management
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform duration-200",
                      openSections.management ? "rotate-180" : "rotate-0"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-1">
                <Link href="/admin/users">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/users") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    Users
                  </a>
                </Link>
                <Link href="/admin/properties">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/properties") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    Properties
                  </a>
                </Link>
                <Link href="/admin/kyc">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/kyc") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    KYC Verification
                  </a>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </li>

          <li>
            <Collapsible
              open={openSections.finance}
              onOpenChange={() => toggleSection('finance')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between items-center px-3 py-2 text-sm font-medium">
                  <span className="flex items-center gap-3">
                    <DollarSign size={18} />
                    Finance
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform duration-200",
                      openSections.finance ? "rotate-180" : "rotate-0"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-1">
                <Link href="/admin/investments">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/investments") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    Investments
                  </a>
                </Link>
                <Link href="/admin/roi">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/roi") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    ROI Distribution
                  </a>
                </Link>
                <Link href="/admin/payments">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/payments") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    Payment Transactions
                  </a>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </li>

          <li>
            <Collapsible
              open={openSections.system}
              onOpenChange={() => toggleSection('system')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between items-center px-3 py-2 text-sm font-medium">
                  <span className="flex items-center gap-3">
                    <Settings size={18} />
                    System
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform duration-200",
                      openSections.system ? "rotate-180" : "rotate-0"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-1">
                <Link href="/admin/activity-logs">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/activity-logs") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    <Activity size={16} className="mr-1" />
                    Activity Logs
                  </a>
                </Link>
                <Link href="/admin/settings">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/settings") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    System Settings
                  </a>
                </Link>
                <Link href="/admin/faqs">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/faqs") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    <HelpCircle size={16} className="mr-1" />
                    FAQ Management
                  </a>
                </Link>
                <Link href="/admin/messages">
                  <a className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors",
                    isActive("/admin/messages") && "bg-primary/10 text-primary font-semibold"
                  )}>
                    <MessageSquare size={16} className="mr-1" />
                    User Messages
                  </a>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;