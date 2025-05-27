import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Upload, FileText, Check, AlertCircle, Camera, 
  User, Home, DollarSign, CreditCard, ArrowLeft,
  CheckCircle, Clock, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface KYCDocument {
  id?: string;
  type: 'identity' | 'address' | 'income' | 'bank';
  file?: File;
  url?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt?: string;
}

interface KYCFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    nationality: string;
  };
  employmentInfo: {
    employmentStatus: string;
    occupation: string;
    employer: string;
    annualIncome: string;
    sourceOfIncome: string;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    bvn: string;
  };
  documents: KYCDocument[];
}

export default function KYCForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get existing KYC data if any
  const { data: existingKYC, isLoading } = useQuery({
    queryKey: ['/api/investor/kyc'],
  });

  const [formData, setFormData] = useState<KYCFormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      nationality: 'Nigerian'
    },
    employmentInfo: {
      employmentStatus: '',
      occupation: '',
      employer: '',
      annualIncome: '',
      sourceOfIncome: ''
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      accountType: '',
      bvn: ''
    },
    documents: [
      { type: 'identity', status: 'pending' },
      { type: 'address', status: 'pending' },
      { type: 'income', status: 'pending' },
      { type: 'bank', status: 'pending' }
    ]
  });

  const submitKYCMutation = useMutation({
    mutationFn: async (kycData: any) => {
      return apiClient.request('/api/kyc/submit', {
        method: 'POST',
        body: JSON.stringify(kycData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investor/kyc'] });
      toast({
        title: "KYC Submitted Successfully!",
        description: "Your documents are now under review. We'll notify you within 2-3 business days.",
      });
      setLocation('/investor/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Unable to submit KYC documents. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateFormData = (section: keyof KYCFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (documentType: KYCDocument['type'], file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.type === documentType 
          ? { ...doc, file, status: 'pending' as const }
          : doc
      )
    }));
  };

  const getDocumentIcon = (type: KYCDocument['type']) => {
    switch (type) {
      case 'identity': return <User className="h-5 w-5" />;
      case 'address': return <Home className="h-5 w-5" />;
      case 'income': return <DollarSign className="h-5 w-5" />;
      case 'bank': return <CreditCard className="h-5 w-5" />;
    }
  };

  const getDocumentTitle = (type: KYCDocument['type']) => {
    switch (type) {
      case 'identity': return 'Identity Document';
      case 'address': return 'Proof of Address';
      case 'income': return 'Proof of Income';
      case 'bank': return 'Bank Statement';
    }
  };

  const getDocumentDescription = (type: KYCDocument['type']) => {
    switch (type) {
      case 'identity': return 'Valid passport, driver\'s license, or national ID card';
      case 'address': return 'Utility bill, bank statement, or government correspondence (not older than 3 months)';
      case 'income': return 'Salary slip, employment letter, or tax certificate';
      case 'bank': return 'Recent bank statement (not older than 3 months)';
    }
  };

  const getStatusIcon = (status: KYCDocument['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <X className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: KYCDocument['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
    }
  };

  const calculateProgress = () => {
    const sections = ['personal', 'employment', 'bank', 'documents'];
    let completed = 0;

    // Check personal info
    const personal = formData.personalInfo;
    if (personal.firstName && personal.lastName && personal.dateOfBirth && personal.phoneNumber) {
      completed++;
    }

    // Check employment info
    const employment = formData.employmentInfo;
    if (employment.employmentStatus && employment.occupation && employment.annualIncome) {
      completed++;
    }

    // Check bank details
    const bank = formData.bankDetails;
    if (bank.bankName && bank.accountNumber && bank.bvn) {
      completed++;
    }

    // Check documents
    const uploadedDocs = formData.documents.filter(doc => doc.file || doc.url);
    if (uploadedDocs.length >= 2) { // At least 2 documents required
      completed++;
    }

    return (completed / sections.length) * 100;
  };

  const canSubmit = () => {
    const personal = formData.personalInfo;
    const employment = formData.employmentInfo;
    const bank = formData.bankDetails;
    const uploadedDocs = formData.documents.filter(doc => doc.file || doc.url);

    return personal.firstName && personal.lastName && personal.dateOfBirth &&
           employment.employmentStatus && employment.occupation &&
           bank.bankName && bank.accountNumber &&
           uploadedDocs.length >= 2;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill all required fields and upload at least 2 documents.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, you'd upload files to cloud storage first
      const submissionData = {
        ...formData,
        documents: formData.documents.filter(doc => doc.file || doc.url)
      };

      await submitKYCMutation.mutateAsync(submissionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // If KYC is already approved, show status
  if (existingKYC?.status === 'approved') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification Complete</h1>
          <p className="text-gray-600 mb-6">
            Your account is fully verified. You can now invest in all available properties.
          </p>
          <Button onClick={() => setLocation('/investor/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/investor/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
          <p className="text-gray-600">
            Complete your Know Your Customer (KYC) verification to start investing in properties.
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm text-gray-600">{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="mb-2" />
            <p className="text-xs text-gray-600">
              Fill all sections and upload required documents to submit for review
            </p>
          </CardContent>
        </Card>

        {/* KYC Status Alert */}
        {existingKYC?.status === 'pending' && (
          <Card className="border-yellow-200 bg-yellow-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Under Review</h3>
                  <p className="text-sm text-yellow-700">
                    Your KYC documents are currently being reviewed. This process typically takes 2-3 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {existingKYC?.status === 'rejected' && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Verification Rejected</h3>
                  <p className="text-sm text-red-700">
                    Some documents were rejected. Please review the feedback and resubmit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KYC Form */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.personalInfo.firstName}
                    onChange={(e) => updateFormData('personalInfo', 'firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.personalInfo.lastName}
                    onChange={(e) => updateFormData('personalInfo', 'lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.personalInfo.phoneNumber}
                    onChange={(e) => updateFormData('personalInfo', 'phoneNumber', e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.personalInfo.address}
                    onChange={(e) => updateFormData('personalInfo', 'address', e.target.value)}
                    placeholder="Enter your full address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.personalInfo.city}
                    onChange={(e) => updateFormData('personalInfo', 'city', e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.personalInfo.state}
                    onChange={(e) => updateFormData('personalInfo', 'state', e.target.value)}
                    placeholder="Enter your state"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
                  <select
                    id="employmentStatus"
                    value={formData.employmentInfo.employmentStatus}
                    onChange={(e) => updateFormData('employmentInfo', 'employmentStatus', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="business-owner">Business Owner</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    value={formData.employmentInfo.occupation}
                    onChange={(e) => updateFormData('employmentInfo', 'occupation', e.target.value)}
                    placeholder="Your job title or profession"
                  />
                </div>
                <div>
                  <Label htmlFor="employer">Employer</Label>
                  <Input
                    id="employer"
                    value={formData.employmentInfo.employer}
                    onChange={(e) => updateFormData('employmentInfo', 'employer', e.target.value)}
                    placeholder="Company or organization name"
                  />
                </div>
                <div>
                  <Label htmlFor="annualIncome">Annual Income (₦) *</Label>
                  <Input
                    id="annualIncome"
                    value={formData.employmentInfo.annualIncome}
                    onChange={(e) => updateFormData('employmentInfo', 'annualIncome', e.target.value)}
                    placeholder="Your annual income"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="sourceOfIncome">Source of Income</Label>
                  <Textarea
                    id="sourceOfIncome"
                    value={formData.employmentInfo.sourceOfIncome}
                    onChange={(e) => updateFormData('employmentInfo', 'sourceOfIncome', e.target.value)}
                    placeholder="Describe your primary sources of income"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bank Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => updateFormData('bankDetails', 'bankName', e.target.value)}
                    placeholder="Your bank name"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => updateFormData('bankDetails', 'accountNumber', e.target.value)}
                    placeholder="Your account number"
                  />
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <select
                    id="accountType"
                    value={formData.bankDetails.accountType}
                    onChange={(e) => updateFormData('bankDetails', 'accountType', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select account type</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="domiciliary">Domiciliary</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="bvn">BVN *</Label>
                  <Input
                    id="bvn"
                    value={formData.bankDetails.bvn}
                    onChange={(e) => updateFormData('bankDetails', 'bvn', e.target.value)}
                    placeholder="Your Bank Verification Number"
                    maxLength={11}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.documents.map((doc) => (
                    <div key={doc.type} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getDocumentIcon(doc.type)}
                          <h3 className="font-semibold">{getDocumentTitle(doc.type)}</h3>
                        </div>
                        <Badge className={getStatusColor(doc.status)}>
                          {getStatusIcon(doc.status)}
                          <span className="ml-1">{doc.status}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {getDocumentDescription(doc.type)}
                      </p>

                      {doc.rejectionReason && (
                        <div className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">
                          <strong>Rejection Reason:</strong> {doc.rejectionReason}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(doc.type, file);
                          }}
                          className="hidden"
                          id={`file-${doc.type}`}
                        />
                        <Label 
                          htmlFor={`file-${doc.type}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          {doc.file ? 'Change File' : 'Upload File'}
                        </Label>
                        {doc.file && (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            {doc.file.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Document Requirements:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Files must be in JPG, PNG, or PDF format</li>
                    <li>• Maximum file size: 5MB per document</li>
                    <li>• Documents must be clear and readable</li>
                    <li>• At least 2 documents are required to submit</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation and Submit */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex gap-2">
            {activeTab !== 'personal' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ['personal', 'employment', 'bank', 'documents'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
              >
                Previous
              </Button>
            )}
            {activeTab !== 'documents' && (
              <Button 
                onClick={() => {
                  const tabs = ['personal', 'employment', 'bank', 'documents'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                }}
              >
                Next
              </Button>
            )}
          </div>

          {activeTab === 'documents' && (
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit() || isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? 'Submitting...' : 'Submit KYC'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}