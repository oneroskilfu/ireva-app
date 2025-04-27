import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Bell, 
  Settings, 
  Info 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationsList from '../../components/PushNotifications/NotificationsList';
import PushNotificationDemo from '../../components/PushNotifications/PushNotificationDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NotificationsPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Notifications | iREVA Platform</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-7 w-7" />
          Notifications
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your notification preferences and view your notification history
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Notifications</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <NotificationsList />
            </TabsContent>
            
            <TabsContent value="unread">
              <NotificationsList filterType="unread" />
            </TabsContent>
            
            <TabsContent value="investments">
              <NotificationsList filterType="investment" />
            </TabsContent>
            
            <TabsContent value="system">
              <NotificationsList filterType="system" />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <PushNotificationDemo />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Settings className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Customize your notification preferences
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  <p>
                    Choose which notifications you want to receive and how you want to receive them.
                  </p>
                </div>
                
                {/* Notification settings would go here */}
                <div className="flex justify-center items-center py-8">
                  <div className="text-center text-muted-foreground">
                    <Info className="mx-auto h-10 w-10 mb-2 opacity-50" />
                    <p>Notification preferences will be available soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;