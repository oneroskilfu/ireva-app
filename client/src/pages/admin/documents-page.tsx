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
import { Search, Filter, RefreshCw, Download, Upload, Eye, FileText } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

export default function AdminDocuments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Temporarily use a mock data approach until the API endpoint is implemented
  const { data: documents, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/documents'],
    queryFn: async () => {
      // Return mock data instead of making an actual API call that would fail
      return [];
    }
  });

  const handleRefresh = () => {
    toast({
      title: "Refreshing documents data",
      description: "The documents list is being updated.",
    });
    refetch();
  };

  const handleUpload = () => {
    toast({
      title: "Upload document",
      description: "Document upload functionality will be implemented here.",
    });
  };

  // Mock document types for demonstration
  const documentTypes = [
    { id: "property", name: "Property Documents" },
    { id: "legal", name: "Legal Documents" },
    { id: "financial", name: "Financial Reports" },
    { id: "marketing", name: "Marketing Materials" },
    { id: "user", name: "User Documents" }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 w-full sm:w-96" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-8 w-96 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <div className="mx-auto h-12 w-12 text-destructive opacity-75">⚠️</div>
        <h3 className="mt-4 text-lg font-semibold">Failed to Load Documents</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error loading the document data. Please try again later.
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
        <p className="text-muted-foreground">
          Manage and organize all platform-related documents.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleUpload} className="gap-1">
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          {documentTypes.map(type => (
            <TabsTrigger key={type.id} value={type.id}>{type.name}</TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                View and manage all documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Document Card Example */}
                <Card>
                  <CardContent className="p-5 flex flex-col">
                    <div className="flex justify-between">
                      <div className="rounded-full h-10 w-10 bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <Badge>Property</Badge>
                    </div>
                    <div className="mt-5">
                      <h3 className="font-medium">Sample Property Agreement.pdf</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Template for property investment agreement
                      </p>
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                      <span>Uploaded 2 days ago</span>
                      <span>2.4 MB</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                {/* End Document Card */}
                
                <div className="bg-muted/40 rounded-lg border border-dashed flex items-center justify-center h-[210px]">
                  <div className="text-center p-5">
                    <FileText className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No more documents found</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {documentTypes.map(type => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{type.name}</CardTitle>
                <CardDescription>
                  View and manage {type.name.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                  <p>No {type.name.toLowerCase()} found</p>
                  <Button variant="outline" className="mt-4" onClick={handleUpload}>
                    Upload {type.name.split(' ')[0]} Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}