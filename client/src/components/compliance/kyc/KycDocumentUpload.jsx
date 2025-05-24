import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../../hooks/useApiRequest';
import { useToast } from '../../../hooks/use-toast';
import { DocumentTypeEnum } from '../../../../shared/schema-kyc';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Progress,
} from '../../ui/DesignSystem';

import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  IdentificationIcon,
  GlobeAltIcon,
  CalendarIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

/**
 * KycDocumentUpload Component
 * 
 * Allows users to securely upload KYC documents with metadata
 * for identity verification.
 */
const KycDocumentUpload = ({ kycVerificationId, onSuccess }) => {
  const api = useApiRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  // Document upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Document metadata state
  const [documentData, setDocumentData] = useState({
    type: '',
    documentNumber: '',
    issuingCountry: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
  });
  
  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData) => {
      return api.post(`kyc/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/kyc/verification/${kycVerificationId}`]);
      toast({
        title: 'Document Uploaded',
        description: 'Your document has been successfully uploaded and is pending review',
        variant: 'success',
      });
      
      // Reset form
      resetForm();
      
      // Call success callback
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload document',
        variant: 'destructive',
      });
    },
  });
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };
  
  // Handle metadata change
  const handleDocumentDataChange = (field, value) => {
    setDocumentData({
      ...documentData,
      [field]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: 'File Required',
        description: 'Please select a document to upload',
        variant: 'destructive',
      });
      return;
    }
    
    if (!documentData.type) {
      toast({
        title: 'Document Type Required',
        description: 'Please select the type of document',
        variant: 'destructive',
      });
      return;
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('kycVerificationId', kycVerificationId);
    formData.append('documentData', JSON.stringify(documentData));
    
    // Start upload
    uploadDocumentMutation.mutate(formData);
  };
  
  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
    setDocumentData({
      type: '',
      documentNumber: '',
      issuingCountry: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Get file size in readable format
  const getFileSize = (size) => {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  // Document type options for select input
  const documentTypeOptions = [
    { value: DocumentTypeEnum.ID_CARD, label: 'ID Card' },
    { value: DocumentTypeEnum.PASSPORT, label: 'Passport' },
    { value: DocumentTypeEnum.DRIVERS_LICENSE, label: 'Driver\'s License' },
    { value: DocumentTypeEnum.UTILITY_BILL, label: 'Utility Bill' },
    { value: DocumentTypeEnum.BANK_STATEMENT, label: 'Bank Statement' },
    { value: DocumentTypeEnum.PROOF_OF_ADDRESS, label: 'Proof of Address' },
    { value: DocumentTypeEnum.TAX_ID, label: 'Tax ID Document' },
    { value: DocumentTypeEnum.OTHER, label: 'Other Document' },
  ];
  
  // Common country options for select input
  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IN', label: 'India' },
    { value: 'JP', label: 'Japan' },
    { value: 'SG', label: 'Singapore' },
    { value: 'ZA', label: 'South Africa' },
    // Add more countries as needed
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5" />
          Upload Verification Document
        </CardTitle>
        <CardDescription>
          Upload government-issued ID or other required documents for verification. 
          All documents are encrypted for security.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <Alert>
            <InformationCircleIcon className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              All documents are encrypted and stored securely.
              Only authorized compliance personnel can access your documents.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <Label htmlFor="document-type">Document Type</Label>
            <Select
              value={documentData.type}
              onValueChange={(value) => handleDocumentDataChange('type', value)}
            >
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document-file">Upload Document</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                uploadDocumentMutation.isPending ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                id="document-file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                className="hidden"
                disabled={uploadDocumentMutation.isPending}
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  {filePreview ? (
                    <div className="flex justify-center mb-3">
                      <img 
                        src={filePreview} 
                        alt="Document preview" 
                        className="max-h-48 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
                  )}
                  
                  <div className="font-medium text-sm">{selectedFile.name}</div>
                  <div className="text-gray-500 text-xs">{getFileSize(selectedFile.size)}</div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetForm();
                    }}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ArrowUpTrayIcon className="h-8 w-8 mx-auto text-gray-400" />
                  <div className="font-medium">Click to upload or drag and drop</div>
                  <div className="text-gray-500 text-xs">
                    JPG, PNG or PDF (max. 10MB)
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {uploadDocumentMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Document Details</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="document-number"
                    className="flex items-center gap-1"
                  >
                    <IdentificationIcon className="h-4 w-4" />
                    Document Number
                  </Label>
                  <Input
                    id="document-number"
                    value={documentData.documentNumber}
                    onChange={(e) => handleDocumentDataChange('documentNumber', e.target.value)}
                    placeholder="Enter document number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label 
                    htmlFor="issuing-country"
                    className="flex items-center gap-1"
                  >
                    <GlobeAltIcon className="h-4 w-4" />
                    Issuing Country
                  </Label>
                  <Select
                    value={documentData.issuingCountry}
                    onValueChange={(value) => handleDocumentDataChange('issuingCountry', value)}
                  >
                    <SelectTrigger id="issuing-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label 
                    htmlFor="issuing-authority"
                    className="flex items-center gap-1"
                  >
                    <BuildingLibraryIcon className="h-4 w-4" />
                    Issuing Authority
                  </Label>
                  <Input
                    id="issuing-authority"
                    value={documentData.issuingAuthority}
                    onChange={(e) => handleDocumentDataChange('issuingAuthority', e.target.value)}
                    placeholder="E.g., Department of Motor Vehicles"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label 
                    htmlFor="issue-date"
                    className="flex items-center gap-1"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Issue Date
                  </Label>
                  <Input
                    id="issue-date"
                    type="date"
                    value={documentData.issueDate}
                    onChange={(e) => handleDocumentDataChange('issueDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label
                    htmlFor="expiry-date"
                    className="flex items-center gap-1"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={documentData.expiryDate}
                    onChange={(e) => handleDocumentDataChange('expiryDate', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="guidelines" className="pt-4">
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Document Guidelines</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Please ensure your documents meet the following requirements:
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3 text-sm">
                <div className="flex gap-2 items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Valid & Current</span>
                    <p className="text-gray-600">Documents must be valid and not expired.</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Clear & Legible</span>
                    <p className="text-gray-600">All text and photos must be clearly visible and not blurry.</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Complete Document</span>
                    <p className="text-gray-600">The entire document must be visible, including all corners and edges.</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">No Glare or Shadows</span>
                    <p className="text-gray-600">Avoid reflections, glare, or shadows on the document.</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-start">
                  <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Avoid Modifications</span>
                    <p className="text-gray-600">Documents must not be edited, altered, or tampered with.</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-start">
                  <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">No Photocopies</span>
                    <p className="text-gray-600">Submit original document scans, not photocopies or screenshots.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={uploadDocumentMutation.isPending}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            disabled={!selectedFile || !documentData.type || uploadDocumentMutation.isPending}
            className="flex items-center gap-2"
          >
            {uploadDocumentMutation.isPending ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default KycDocumentUpload;