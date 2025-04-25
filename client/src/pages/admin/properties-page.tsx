import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  PlusCircle, 
  Filter, 
  RefreshCw, 
  Edit, 
  Trash, 
  Eye, 
  Loader2,
  XCircle,
  CheckCircle
} from "lucide-react";
import AddPropertyForm from '@/components/admin/AddPropertyForm';
import { apiRequest } from '@/lib/queryClient';

// Define TypeScript interfaces
interface Property {
  id: number;
  name: string;
  location: string;
  description: string;
  type: 'residential' | 'commercial' | 'industrial' | 'mixed_use' | 'land';
  imageUrl: string;
  imageGallery: string[];
  videoUrl: string | null;
  developer: string;
  developerProfile: string | null;
  riskLevel: string;
  targetReturn: string;
  minimumInvestment: number;
  term: number;
  totalFunding: number;
  currentFunding: number;
  numberOfInvestors: number;
  daysLeft: number;
  size: string;
  builtYear: string;
  occupancy: string;
  cashFlow: string;
  amenities: string[];
  projectedCashflow: any | null;
  documents: any | null;
  constructionUpdates: any | null;
  sustainabilityFeatures: any | null;
  latitude: string;
  longitude: string;
  accreditedOnly: boolean;
  tier: 'starter' | 'growth' | 'premium' | 'elite';
  completionDate: string | null;
}

export default function AdminProperties() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  
  // Fetch properties
  const { data: properties, isLoading, isError, refetch } = useQuery<Property[]>({
    queryKey: ['/api/admin/properties'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/properties');
      return response.json();
    }
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      await apiRequest('DELETE', `/api/admin/properties/${propertyId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      setPropertyToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete property: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Filter properties based on search query and active tab
  const filteredProperties = properties?.filter(property => {
    const matchesSearch = !searchQuery
      ? true
      : property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.developer.toLowerCase().includes(searchQuery.toLowerCase());

    // For the active tab, we could add a status field to properties
    // For now, we'll just return all properties for the 'all' tab
    if (activeTab === 'all') return matchesSearch;
    
    // For demo purposes, let's simulate different tabs:
    if (activeTab === 'active') {
      return matchesSearch && property.daysLeft > 0 && property.currentFunding < property.totalFunding;
    }
    
    if (activeTab === 'draft') {
      return matchesSearch && property.currentFunding === 0;
    }
    
    if (activeTab === 'completed') {
      return matchesSearch && (property.currentFunding >= property.totalFunding || property.daysLeft <= 0);
    }
    
    return matchesSearch;
  });

  // Functions to handle property actions
  const handleAddProperty = () => {
    setShowAddPropertyForm(true);
  };

  const handleEditProperty = (propertyId: number) => {
    // For future implementation
    toast({
      title: 'Edit Property',
      description: `Editing property with ID: ${propertyId}`,
    });
  };

  const handleViewProperty = (propertyId: number) => {
    // For future implementation
    toast({
      title: 'View Property',
      description: `Viewing property with ID: ${propertyId}`,
    });
  };

  const handleDeleteProperty = (propertyId: number) => {
    setPropertyToDelete(propertyId);
  };

  const confirmDeleteProperty = () => {
    if (propertyToDelete !== null) {
      deletePropertyMutation.mutate(propertyToDelete);
    }
  };

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to get property status badge
  const getPropertyStatusBadge = (property: Property) => {
    if (property.currentFunding >= property.totalFunding) {
      return <Badge className="bg-green-100 text-green-800">Fully Funded</Badge>;
    }
    
    if (property.daysLeft <= 0) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    
    if (property.currentFunding === 0) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Property Management</h2>
        <p className="text-muted-foreground">
          Manage property listings, investments, and performance.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="gap-1" onClick={handleAddProperty}>
            <PlusCircle className="h-4 w-4" />
            <span>Add Property</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property List</CardTitle>
              <CardDescription>
                View and manage all properties on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <XCircle className="h-12 w-12 text-destructive mb-2" />
                  <h3 className="text-lg font-medium">Failed to load properties</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    There was an error loading the property data.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => refetch()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredProperties && filteredProperties.length > 0 ? (
                <ScrollArea className="h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Investment</TableHead>
                        <TableHead>ROI</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {property.imageUrl && (
                                <div className="relative w-10 h-10 rounded overflow-hidden">
                                  <img 
                                    src={property.imageUrl} 
                                    alt={property.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span>{property.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {property.type.replace('_', ' ')}
                          </TableCell>
                          <TableCell>{property.location}</TableCell>
                          <TableCell>
                            {getPropertyStatusBadge(property)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">
                                Min: {formatCurrency(property.minimumInvestment)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total: {formatCurrency(property.totalFunding)}
                              </div>
                              <div className="text-xs">
                                Progress: {Math.round((property.currentFunding / property.totalFunding) * 100)}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{property.targetReturn}%</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProperty(property.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProperty(property.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No properties found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery 
                      ? `No properties matching "${searchQuery}"` 
                      : 'There are no properties in this category yet.'}
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={handleAddProperty}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Properties</CardTitle>
              <CardDescription>
                Properties currently open for investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {filteredProperties && filteredProperties.length > 0 ? (
                    <ScrollArea className="h-[60vh]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Days Left</TableHead>
                            <TableHead>ROI</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProperties.map((property) => (
                            <TableRow key={property.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {property.imageUrl && (
                                    <div className="relative w-10 h-10 rounded overflow-hidden">
                                      <img 
                                        src={property.imageUrl} 
                                        alt={property.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <span>{property.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">
                                {property.type.replace('_', ' ')}
                              </TableCell>
                              <TableCell>{property.location}</TableCell>
                              <TableCell>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div 
                                    className="bg-primary h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(100, Math.round((property.currentFunding / property.totalFunding) * 100))}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs mt-1 block">
                                  {Math.round((property.currentFunding / property.totalFunding) * 100)}%
                                </span>
                              </TableCell>
                              <TableCell>{property.daysLeft} days</TableCell>
                              <TableCell>{property.targetReturn}%</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewProperty(property.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditProperty(property.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No active properties</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        There are no active properties with ongoing funding
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={handleAddProperty}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Property
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="draft" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft Properties</CardTitle>
              <CardDescription>
                Properties in preparation stage not yet published
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {filteredProperties && filteredProperties.length > 0 ? (
                    <ScrollArea className="h-[60vh]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Target Return</TableHead>
                            <TableHead>Minimum Investment</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProperties.map((property) => (
                            <TableRow key={property.id}>
                              <TableCell className="font-medium">{property.name}</TableCell>
                              <TableCell className="capitalize">
                                {property.type.replace('_', ' ')}
                              </TableCell>
                              <TableCell>{property.location}</TableCell>
                              <TableCell>{property.targetReturn}%</TableCell>
                              <TableCell>{formatCurrency(property.minimumInvestment)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewProperty(property.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditProperty(property.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteProperty(property.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No draft properties</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        There are no properties in draft stage
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={handleAddProperty}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Property
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Properties</CardTitle>
              <CardDescription>
                Properties with completed funding and development
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {filteredProperties && filteredProperties.length > 0 ? (
                    <ScrollArea className="h-[60vh]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Total Funding</TableHead>
                            <TableHead>Investors</TableHead>
                            <TableHead>ROI</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProperties.map((property) => (
                            <TableRow key={property.id}>
                              <TableCell className="font-medium">{property.name}</TableCell>
                              <TableCell className="capitalize">
                                {property.type.replace('_', ' ')}
                              </TableCell>
                              <TableCell>{property.location}</TableCell>
                              <TableCell>{formatCurrency(property.totalFunding)}</TableCell>
                              <TableCell>{property.numberOfInvestors}</TableCell>
                              <TableCell>{property.targetReturn}%</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewProperty(property.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditProperty(property.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No completed properties</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        There are no properties with completed funding
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Property Form Dialog */}
      <AddPropertyForm
        isOpen={showAddPropertyForm}
        onClose={() => setShowAddPropertyForm(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={propertyToDelete !== null} 
        onOpenChange={(open) => !open && setPropertyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property
              and all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProperty}
              disabled={deletePropertyMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePropertyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}