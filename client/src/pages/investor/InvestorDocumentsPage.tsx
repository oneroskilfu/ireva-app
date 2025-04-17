import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  FileText, 
  Upload, 
  Download,
  File,
  FileText as FilePdf,
  Image as FileImage,
  Archive as FileArchive,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';

interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  dateUploaded: string;
  fileSize: string;
  downloadUrl: string;
}

const InvestorDocumentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['/api/investor/documents'],
    // Temporary fallback until the endpoint is implemented
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/investor/documents');
        return res.json();
      } catch (err) {
        // Return empty array if endpoint doesn't exist yet
        return [];
      }
    }
  });

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  // Render file icon
  const renderFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FilePdf className="h-8 w-8 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="h-8 w-8 text-blue-500" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Documents | iREVA</title>
      </Helmet>
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
            <p className="text-muted-foreground">
              Upload, view and manage all your investment documents
            </p>
          </div>
          
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
            <TabsTrigger value="investment">Investment Documents</TabsTrigger>
            <TabsTrigger value="legal">Legal Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>
                  View and manage all your uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Failed to load documents</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                ) : documents && documents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Type</TableHead>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Uploaded</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc: Document) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            {renderFileIcon(doc.type)}
                          </TableCell>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>{doc.category}</TableCell>
                          <TableCell>{renderStatusBadge(doc.status)}</TableCell>
                          <TableCell>{new Date(doc.dateUploaded).toLocaleDateString()}</TableCell>
                          <TableCell>{doc.fileSize}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">No documents yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Upload your first document by clicking the "Upload Document" button.
                    </p>
                    <Button className="mt-4">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="kyc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>KYC Documents</CardTitle>
                <CardDescription>
                  Identity verification and know-your-customer documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 space-y-3">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">KYC Documents</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This section will show your KYC-related documents
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="investment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Documents</CardTitle>
                <CardDescription>
                  Investment contracts, certificates and statements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 space-y-3">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">Investment Documents</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This section will show your investment-related documents
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="legal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Legal Documents</CardTitle>
                <CardDescription>
                  Terms of service, privacy policy and other legal agreements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 space-y-3">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">Legal Documents</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This section will show legal documents related to your account
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default InvestorDocumentsPage;