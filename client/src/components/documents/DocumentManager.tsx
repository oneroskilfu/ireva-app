import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../../lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  FileText, 
  Upload, 
  DownloadCloud, 
  Trash2, 
  Eye, 
  FileSignature, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const DocumentManager = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('contract');
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const { toast } = useToast();

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/documents');
      return await response.json();
    }
  });

  // Apply all filters to documents
  const filteredDocuments = documents.filter((doc: any) => {
    // Type filter
    if (selectedType && doc.type !== selectedType) {
      return false;
    }
    
    // Status filter
    if (statusFilter && doc.status !== statusFilter) {
      return false;
    }
    
    // Search query filter (case insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(query) || 
        (doc.content && doc.content.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // For FormData, we need to use fetch directly instead of apiRequest
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        // Let browser set the appropriate Content-Type with boundary
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully.',
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentTitle('');
      setDocumentType('contract');
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/documents/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      
      // Auto-set title from filename if title is empty
      if (!documentTitle) {
        const fileName = e.target.files[0].name;
        // Remove file extension
        setDocumentTitle(fileName.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Handle document upload
  const handleUpload = async () => {
    // Validate inputs
    if (!documentTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing title',
        description: 'Please provide a document title.',
      });
      return;
    }
    
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a file to upload.',
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Maximum file size is 10MB. Please select a smaller file.',
      });
      return;
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Only PDF, DOC, DOCX, JPG and PNG files are allowed.',
      });
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', documentTitle.trim());
    formData.append('type', documentType);

    // Submit form
    uploadMutation.mutate(formData);
  };

  // Get badge color based on document type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'contract':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Contract</Badge>;
      case 'kyc':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">KYC</Badge>;
      case 'property_deed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Property Deed</Badge>;
      case 'term_sheet':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Term Sheet</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get document status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Signed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><AlertCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="outline">Active</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Document Management</CardTitle>
            <CardDescription>Access and manage all your property documents and contracts</CardDescription>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Upload contract, KYC, or property documents to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input 
                    id="title" 
                    value={documentTitle} 
                    onChange={(e) => setDocumentTitle(e.target.value)} 
                    placeholder="Enter document title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Document Type</Label>
                  <Select defaultValue={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="kyc">KYC Document</SelectItem>
                      <SelectItem value="property_deed">Property Deed</SelectItem>
                      <SelectItem value="term_sheet">Term Sheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">File</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, or JPG (max 10MB)</p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-green-600">
                      File selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setSelectedType(null)}>
                All Documents
              </TabsTrigger>
              <TabsTrigger value="contracts" onClick={() => setSelectedType('contract')}>
                Contracts
              </TabsTrigger>
              <TabsTrigger value="property" onClick={() => setSelectedType('property_deed')}>
                Property Documents
              </TabsTrigger>
              <TabsTrigger value="kyc" onClick={() => setSelectedType('kyc')}>
                KYC Documents
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="relative">
                <Input 
                  placeholder="Search documents..." 
                  className="w-64 pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    className="absolute right-1 top-1 h-6 w-6 p-0" 
                    onClick={() => setSearchQuery('')}
                  >
                    <span className="sr-only">Clear search</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </Button>
                )}
              </div>
              
              <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No documents found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload your first document to get started.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <div>
                {(searchQuery || statusFilter) && (
                  <div className="bg-muted/30 rounded-md p-2 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Showing {filteredDocuments.length} result{filteredDocuments.length !== 1 ? 's' : ''} 
                        {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
                        {statusFilter && <span> with status <strong>{statusFilter}</strong></span>}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter(null);
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc: any) => (
                        <TableRow 
                          key={doc.id}
                          className={doc.status === 'pending' && doc.type === 'contract' ? 'bg-amber-50' : ''}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                              {doc.title}
                              {doc.status === 'pending' && doc.type === 'contract' && (
                                <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Action Required
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(doc.type)}</TableCell>
                          <TableCell>
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doc.status || 'active')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (doc.fileUrl) {
                                    window.open(doc.fileUrl, '_blank');
                                  } else if (doc.content) {
                                    // Set the current document and open the viewer dialog
                                    setCurrentDocument(doc);
                                    setViewerDialogOpen(true);
                                  } else {
                                    toast({
                                      variant: 'destructive',
                                      title: 'View failed',
                                      description: 'No document content available',
                                    });
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (doc.fileUrl) {
                                    window.open(doc.fileUrl, '_blank');
                                  } else {
                                    toast({
                                      variant: 'destructive',
                                      title: 'Download failed',
                                      description: 'No file available for download',
                                    });
                                  }
                                }}
                              >
                                <DownloadCloud className="h-4 w-4" />
                              </Button>
                              {doc.type === 'contract' && doc.status !== 'signed' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    if (doc.signUrl) {
                                      window.open(doc.signUrl, '_blank');
                                    } else {
                                      toast({
                                        variant: 'destructive',
                                        title: 'eSignature',
                                        description: 'No signature URL available for this document',
                                      });
                                    }
                                  }}
                                >
                                  <FileSignature className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteMutation.mutate(doc.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contracts" className="m-0">
            {/* Content will be filtered by the "all" tab with selectedType */}
          </TabsContent>
          
          <TabsContent value="property" className="m-0">
            {/* Content will be filtered by the "all" tab with selectedType */}
          </TabsContent>
          
          <TabsContent value="kyc" className="m-0">
            {/* Content will be filtered by the "all" tab with selectedType */}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Document Content Viewer Dialog */}
      <Dialog open={viewerDialogOpen} onOpenChange={setViewerDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {currentDocument?.title || 'Document Viewer'}
            </DialogTitle>
            <DialogDescription>
              {currentDocument?.type && getTypeBadge(currentDocument.type)}
              {currentDocument?.status && getStatusBadge(currentDocument.status)}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-full mt-4 border rounded-md p-4 bg-slate-50">
            {currentDocument?.content ? (
              <div className="prose prose-sm max-w-none">
                {/* Check if content is HTML or plain text */}
                {currentDocument.content.startsWith('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: currentDocument.content }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">{currentDocument.content}</pre>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-30" />
                <p>No content available for this document</p>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setViewerDialogOpen(false)}>
              Close
            </Button>
            {currentDocument?.type === 'contract' && currentDocument?.status !== 'signed' && (
              <Button 
                onClick={() => {
                  // This would call the sign document API
                  toast({
                    title: 'Document Signing',
                    description: 'Signature functionality is implemented on the button in the main table view.',
                  });
                }}
              >
                <FileSignature className="mr-2 h-4 w-4" />
                Sign Document
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};