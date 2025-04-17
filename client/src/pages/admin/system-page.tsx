import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  RefreshCw, 
  Server, 
  Database, 
  Lock, 
  HardDrive, 
  Activity, 
  Clock, 
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowDownToLine
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function AdminSystem() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Temporarily use a mock data approach until the API endpoint is implemented
  const { data: systemInfo, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/system'],
    queryFn: async () => {
      // Return mock data instead of making an actual API call that would fail
      return {
        status: 'operational',
        uptime: '7d 14h',
        database: {
          status: 'healthy',
          connections: '8/20',
          storage: 42
        },
        active_users: 24,
        resources: {
          cpu: 34,
          memory: 48,
          disk: 62,
          network: 27
        }
      };
    }
  });

  const handleRefresh = () => {
    toast({
      title: "Refreshing system information",
      description: "The system information is being updated.",
    });
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="flex justify-end">
          <Skeleton className="h-10 w-28" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        
        <div>
          <Skeleton className="h-8 w-96 mb-4" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive opacity-75" />
        <h3 className="mt-4 text-lg font-semibold">Failed to Load System Information</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error accessing the system information. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={handleRefresh}
        >
          Retry
        </Button>
      </div>
    );
  }

  const statusVariants = {
    operational: { label: "Operational", variant: "outline", icon: CheckCircle2, class: "text-green-500" },
    degraded: { label: "Degraded", variant: "outline", icon: AlertTriangle, class: "text-amber-500" },
    outage: { label: "Outage", variant: "outline", icon: XCircle, class: "text-destructive" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Administration</h2>
        <p className="text-muted-foreground">
          Monitor and manage system settings and performance.
        </p>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </Button>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="dashboard" className="flex gap-1 items-center justify-center">
            <Activity className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex gap-1 items-center justify-center">
            <Server className="h-4 w-4" />
            <span>Services</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex gap-1 items-center justify-center">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex gap-1 items-center justify-center">
            <BookOpen className="h-4 w-4" />
            <span>System Logs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Server className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Operational</div>
                <p className="text-xs text-muted-foreground">All systems normal</p>
                <div className="mt-3">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600">
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Healthy</div>
                <p className="text-xs text-muted-foreground">Connections: 8/20</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Storage</span>
                    <span>42%</span>
                  </div>
                  <Progress value={42} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Current active users</p>
                <div className="mt-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20">
                    2 Admins
                  </Badge>
                  <Badge variant="outline" className="ml-1 bg-primary/10 text-primary hover:bg-primary/20">
                    22 Users
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.8%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current uptime</span>
                    <span>7d 14h</span>
                  </div>
                  <Progress value={98} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Server resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span className="font-medium">34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span className="font-medium">48%</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disk Usage</span>
                      <span className="font-medium">62%</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network Bandwidth</span>
                      <span className="font-medium">27%</span>
                    </div>
                    <Progress value={27} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent System Events</CardTitle>
                <CardDescription>Last 5 system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Database Backup Complete</div>
                      <div className="text-sm text-muted-foreground">Automated daily backup completed successfully</div>
                      <div className="text-xs text-muted-foreground mt-1">Today, 2:40 AM</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium">High CPU Usage Detected</div>
                      <div className="text-sm text-muted-foreground">CPU usage exceeded 80% threshold temporarily</div>
                      <div className="text-xs text-muted-foreground mt-1">Yesterday, 8:12 PM</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium">System Update Applied</div>
                      <div className="text-sm text-muted-foreground">Security patches and updates successfully installed</div>
                      <div className="text-xs text-muted-foreground mt-1">Yesterday, 3:30 AM</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Current status of all system services</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">API Server</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Operational</span>
                      </div>
                    </TableCell>
                    <TableCell>7d 14h</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Restart</Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Database Service</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Operational</span>
                      </div>
                    </TableCell>
                    <TableCell>7d 14h</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Restart</Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Authentication Service</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Operational</span>
                      </div>
                    </TableCell>
                    <TableCell>7d 14h</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Restart</Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Email Service</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Operational</span>
                      </div>
                    </TableCell>
                    <TableCell>7d 14h</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Restart</Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Payment Processing</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Operational</span>
                      </div>
                    </TableCell>
                    <TableCell>7d 14h</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Restart</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Overview</CardTitle>
              <CardDescription>Database performance metrics and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Database Type</div>
                    <div className="text-xl">PostgreSQL 15.3</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Connection Status</div>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Connected</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Active Connections</div>
                    <div className="text-xl">8 / 20</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Last Backup</div>
                    <div className="text-xl">Today, 2:40 AM</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span className="font-medium">42% (4.2 GB / 10 GB)</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Query Performance</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Index Efficiency</span>
                      <span className="font-medium">Excellent</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowDownToLine className="h-4 w-4" />
                      <span>Backup Now</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>Optimize</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Table Usage</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table Name</TableHead>
                      <TableHead className="text-right">Rows</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead className="text-right">Last Vacuum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">users</TableCell>
                      <TableCell className="text-right">1,245</TableCell>
                      <TableCell className="text-right">2.1 MB</TableCell>
                      <TableCell className="text-right">2 days ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">properties</TableCell>
                      <TableCell className="text-right">324</TableCell>
                      <TableCell className="text-right">86.4 MB</TableCell>
                      <TableCell className="text-right">2 days ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">investments</TableCell>
                      <TableCell className="text-right">4,872</TableCell>
                      <TableCell className="text-right">124.5 MB</TableCell>
                      <TableCell className="text-right">2 days ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">transactions</TableCell>
                      <TableCell className="text-right">12,648</TableCell>
                      <TableCell className="text-right">345.2 MB</TableCell>
                      <TableCell className="text-right">2 days ago</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system log entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="bg-muted/50 py-2 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Log viewer</div>
                    <Badge variant="outline">Last 24 hours</Badge>
                  </div>
                  <Button variant="outline" size="sm">Download Logs</Button>
                </div>
                <div className="p-4 font-mono text-xs overflow-auto h-96 bg-black text-emerald-500">
                  <div className="space-y-1">
                    <div>[2025-04-17 02:40:12] [INFO] Database backup completed successfully</div>
                    <div>[2025-04-17 00:12:36] [INFO] Scheduled system maintenance completed</div>
                    <div>[2025-04-16 22:15:48] [WARNING] CPU usage exceeded 80% threshold (82.3%)</div>
                    <div>[2025-04-16 22:15:00] [INFO] High traffic detected - scaling resources</div>
                    <div>[2025-04-16 19:42:22] [INFO] User login successful: admin@example.com</div>
                    <div>[2025-04-16 18:30:15] [INFO] Property listing published: ID #324</div>
                    <div>[2025-04-16 17:22:11] [INFO] New user registration: user123@example.com</div>
                    <div>[2025-04-16 16:18:33] [INFO] Payment processed successfully: Transaction #T2025041612</div>
                    <div>[2025-04-16 15:45:19] [INFO] KYC verification approved for user ID #1042</div>
                    <div>[2025-04-16 14:30:05] [ERROR] Email delivery failed: recipient address not found</div>
                    <div>[2025-04-16 13:18:44] [INFO] Database query optimization completed</div>
                    <div>[2025-04-16 11:10:22] [INFO] System update started</div>
                    <div>[2025-04-16 09:05:18] [INFO] Cache cleared successfully</div>
                    <div>[2025-04-16 08:30:42] [INFO] Daily system health check: All services operational</div>
                    <div>[2025-04-16 06:15:33] [INFO] Automated reports generated successfully</div>
                    <div>[2025-04-16 03:30:12] [INFO] Security patches applied successfully</div>
                    <div>[2025-04-16 02:40:10] [INFO] Database backup completed successfully</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}