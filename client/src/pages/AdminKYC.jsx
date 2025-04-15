import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation, Link } from 'wouter';
import { getCurrentUser } from '../utils/auth';

const AdminKYC = () => {
  const [kycStatus, setKycStatus] = useState({
    status: 'Pending', // Verified, Pending, Rejected
    documents: [],
    verificationDate: null,
    notes: '',
    idCard: null,
    proofOfAddress: null,
    selfie: null
  });
  
  const [loading, setLoading] = useState(true);
  const [idPreview, setIdPreview] = useState(null);
  const [addressPreview, setAddressPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  
  useEffect(() => {
    // Fetch user KYC data
    const user = getCurrentUser();
    if (user) {
      // In a real implementation, you would fetch KYC data from API
      // For now, we'll simulate with default values
      setKycStatus({
        status: user.kycStatus || 'Pending',
        documents: [],
        verificationDate: user.kycVerificationDate || null,
        notes: user.kycNotes || '',
        idCard: null,
        proofOfAddress: null,
        selfie: null
      });
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Update the state with the file
      setKycStatus(prev => ({
        ...prev,
        [type]: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'idCard') {
          setIdPreview(reader.result);
        } else if (type === 'proofOfAddress') {
          setAddressPreview(reader.result);
        } else if (type === 'selfie') {
          setSelfiePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!kycStatus.idCard || !kycStatus.proofOfAddress || !kycStatus.selfie) {
      toast.error('Please upload all required documents');
      return;
    }
    
    try {
      // Create a FormData object to handle file uploads
      const formData = new FormData();
      formData.append('idCard', kycStatus.idCard);
      formData.append('proofOfAddress', kycStatus.proofOfAddress);
      formData.append('selfie', kycStatus.selfie);
      
      // Simulate API call
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setKycStatus(prev => ({
          ...prev,
          status: 'Pending'
        }));
        toast.success('KYC documents uploaded successfully! Awaiting verification.');
      }, 1500);
      
      // In a real implementation, you would make an API call:
      // const response = await fetch('/api/kyc/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      
    } catch (error) {
      toast.error('Failed to upload KYC documents');
      console.error('KYC upload error:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      Verified: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${classes[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">KYC Verification</h1>
              <div>{getStatusBadge(kycStatus.status)}</div>
            </div>
            <p className="mt-2 text-gray-600">
              Upload your documents to verify your identity. All documents must be clear and legible.
            </p>
          </div>
          
          <div className="p-8">
            {kycStatus.status === 'Verified' ? (
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-green-800">KYC Verification Complete</h3>
                    <div className="mt-2 text-green-700">
                      <p>Your identity has been verified. You have full access to all platform features.</p>
                      <p className="mt-2">
                        <strong>Verified on:</strong> {' '}
                        {kycStatus.verificationDate 
                          ? new Date(kycStatus.verificationDate).toLocaleString() 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : kycStatus.status === 'Rejected' ? (
              <div className="bg-red-50 p-6 rounded-lg mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800">KYC Verification Failed</h3>
                    <div className="mt-2 text-red-700">
                      <p>{kycStatus.notes || 'Your submitted documents could not be verified. Please submit new documents following the guidelines below.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            
            {kycStatus.status === 'Pending' && (
              <div className="bg-yellow-50 p-6 rounded-lg mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-yellow-800">KYC Under Review</h3>
                    <div className="mt-2 text-yellow-700">
                      <p>Your documents are being reviewed by our team. This process usually takes 1-3 business days.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {(kycStatus.status === 'Rejected' || !kycStatus.documents.length) && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Government-Issued ID
                    </label>
                    <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      {idPreview ? (
                        <div className="w-full">
                          <img src={idPreview} alt="ID Preview" className="max-h-48 mx-auto object-contain" />
                          <button 
                            type="button"
                            onClick={() => {
                              setIdPreview(null);
                              setKycStatus(prev => ({...prev, idCard: null}));
                            }}
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor="id-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                                <span>Upload ID</span>
                                <input id="id-upload" name="id-upload" type="file" className="sr-only" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'idCard')} />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF up to 5MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      National ID Card, International Passport, Driver's License
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proof of Address
                    </label>
                    <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      {addressPreview ? (
                        <div className="w-full">
                          <img src={addressPreview} alt="Address Preview" className="max-h-48 mx-auto object-contain" />
                          <button 
                            type="button"
                            onClick={() => {
                              setAddressPreview(null);
                              setKycStatus(prev => ({...prev, proofOfAddress: null}));
                            }}
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor="address-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                                <span>Upload Document</span>
                                <input id="address-upload" name="address-upload" type="file" className="sr-only" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'proofOfAddress')} />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF up to 5MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Utility Bill, Bank Statement (not older than 3 months)
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selfie with ID
                  </label>
                  <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {selfiePreview ? (
                      <div className="w-full">
                        <img src={selfiePreview} alt="Selfie Preview" className="max-h-48 mx-auto object-contain" />
                        <button 
                          type="button"
                          onClick={() => {
                            setSelfiePreview(null);
                            setKycStatus(prev => ({...prev, selfie: null}));
                          }}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="selfie-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                              <span>Upload Selfie</span>
                              <input id="selfie-upload" name="selfie-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    A clear photo of yourself holding your ID next to your face
                  </p>
                </div>
                
                <div className="mt-8">
                  <button 
                    type="submit" 
                    className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                    disabled={loading || kycStatus.status === 'Pending'}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : kycStatus.status === 'Pending' ? (
                      'Documents Already Submitted'
                    ) : (
                      'Submit Documents for Verification'
                    )}
                  </button>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <p className="text-sm text-blue-700">
                        All information provided will be kept confidential and used only for verification purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKYC;