import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, LineChart, Bell, RefreshCw, TrendingUp, TrendingDown, BarChart4 } from "lucide-react";

type PropertyUpdateType = {
  propertyId: number;
  propertyName: string;
  location: string;
  value: number;
  change: number;
  changePercentage: number;
  timestamp: string;
  type: 'income' | 'appreciation' | 'occupancy' | 'distribution';
  message: string;
};

export default function RealTimeInvestmentTracker() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [updates, setUpdates] = useState<PropertyUpdateType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected for real-time investment tracker");
      
      // Subscribe to investment updates
      newSocket.send(JSON.stringify({
        type: 'subscribe_live_updates',
        userId: user.id
      }));
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle property updates
        if (message.type === 'property_update') {
          // Add new updates to the list
          setUpdates(prev => [message.data, ...prev].slice(0, 20)); // Keep only the latest 20 updates
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    setSocket(newSocket);

    // For demo purposes, let's simulate some updates since we don't have actual WebSocket data yet
    // In a real app, these would come from the server via WebSocket
    const simulateUpdates = () => {
      // Define some sample properties
      const properties = [
        { id: 1, name: "Skyline Apartments", location: "Lagos" },
        { id: 2, name: "Westfield Retail Center", location: "Abuja" },
        { id: 3, name: "Riverside Residences", location: "Port Harcourt" },
        { id: 4, name: "Tech Hub Office Park", location: "Lagos" }
      ];
      
      // Define update types
      const updateTypes = ['income', 'appreciation', 'occupancy', 'distribution'] as const;
      
      // Generate a random update
      const property = properties[Math.floor(Math.random() * properties.length)];
      const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      const isPositive = Math.random() > 0.3; // 70% chance of positive update
      const changeValue = Math.random() * (updateType === 'income' ? 5000 : 50000);
      const changePercentage = Math.random() * 2.5;
      
      let message = '';
      switch(updateType) {
        case 'income':
          message = `Monthly rental income ${isPositive ? 'increased' : 'decreased'} by ₦${changeValue.toFixed(2)}`;
          break;
        case 'appreciation':
          message = `Property value ${isPositive ? 'appreciated' : 'depreciated'} by ${changePercentage.toFixed(2)}%`;
          break;
        case 'occupancy':
          message = `Occupancy rate ${isPositive ? 'increased' : 'decreased'} to ${Math.floor(90 + (isPositive ? 1 : -1) * Math.random() * 10)}%`;
          break;
        case 'distribution':
          message = `Quarterly distribution of ₦${changeValue.toFixed(2)} processed`;
          break;
      }
      
      const newUpdate: PropertyUpdateType = {
        propertyId: property.id,
        propertyName: property.name,
        location: property.location,
        value: updateType === 'income' ? 10000 + (isPositive ? 1 : -1) * changeValue : 
               updateType === 'distribution' ? changeValue : 500000 + (isPositive ? 1 : -1) * changeValue,
        change: (isPositive ? 1 : -1) * changeValue,
        changePercentage: (isPositive ? 1 : -1) * changePercentage,
        timestamp: new Date().toISOString(),
        type: updateType,
        message
      };
      
      setUpdates(prev => [newUpdate, ...prev].slice(0, 20));
      setLastUpdated(new Date());
    };
    
    // Simulate updates every 8-12 seconds
    const interval = setInterval(() => {
      simulateUpdates();
    }, 8000 + Math.random() * 4000);
    
    // Initial update
    simulateUpdates();
    
    return () => {
      clearInterval(interval);
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [user]);

  // Function to get appropriate icon based on update type
  const getUpdateIcon = (type: PropertyUpdateType['type'], isPositive: boolean) => {
    switch (type) {
      case 'income':
        return isPositive ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'appreciation':
        return isPositive ? <LineChart className="h-4 w-4 text-green-500" /> : <LineChart className="h-4 w-4 text-red-500" />;
      case 'occupancy':
        return <BarChart4 className="h-4 w-4 text-blue-500" />;
      case 'distribution':
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2 text-primary" />
              Real-Time Investment Updates
            </CardTitle>
            <CardDescription>
              Live updates on your property investments
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "outline" : "destructive"} className="flex items-center">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-1.5`}></div>
              {isConnected ? "Live" : "Disconnected"}
            </Badge>
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Waiting for updates...'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60">
            <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
            <p className="mt-2 text-muted-foreground">Waiting for investment updates...</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-1">
              {updates.map((update, i) => (
                <div key={i}>
                  <div className="flex items-start py-3">
                    <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 mr-3">
                      {getUpdateIcon(update.type, update.change >= 0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">
                          {update.propertyName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {update.message}
                      </p>
                      <div className="mt-1 flex items-center">
                        <Badge variant="outline" className="mr-2 text-xs">
                          {update.location}
                        </Badge>
                        {update.type !== 'distribution' && (
                          <Badge 
                            className={`text-xs ${update.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          >
                            {update.change >= 0 ? '+' : ''}
                            {update.type === 'appreciation' || update.type === 'occupancy' 
                              ? `${update.changePercentage.toFixed(2)}%` 
                              : `₦${Math.abs(update.change).toFixed(2)}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {i < updates.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}