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
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function AdminKyc() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">KYC Verification</h2>
        <p className="text-muted-foreground">
          Review and verify user identity documents
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Pending Verifications</CardTitle>
                <CardDescription>
                  KYC submissions awaiting review and approval
                </CardDescription>
              </div>
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                5 Pending
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pending KYC verification requests will be displayed here.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Approve Selected</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Reject Selected</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="verified" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Verified Users</CardTitle>
                <CardDescription>
                  Users with successfully verified KYC information
                </CardDescription>
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                32 Verified
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verified KYC users will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Rejected Submissions</CardTitle>
                <CardDescription>
                  KYC submissions that have been rejected
                </CardDescription>
              </div>
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                3 Rejected
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rejected KYC submissions will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All KYC Submissions</CardTitle>
              <CardDescription>
                Complete history of all KYC verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All KYC submissions will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}