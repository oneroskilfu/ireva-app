import React from 'react';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import Notifications from '@/components/Notifications';
import { Bell } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  return (
    <InvestorLayout>
      <div className="container mx-auto py-6 max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          <p className="text-muted-foreground mt-1">Stay updated with the latest activity on iREVA</p>
        </header>
        
        <Notifications />
      </div>
    </InvestorLayout>
  );
};

export default NotificationsPage;