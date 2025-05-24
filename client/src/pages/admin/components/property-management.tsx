import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Loader2, 
  Search, 
  Edit, 
  Plus, 
  Info, 
  ImagePlus, 
  FileText, 
  RefreshCw,
  Calendar
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Property = {
  id: number;
  name: string;
  type: string;
  location: string;
  description: string;
  imageUrl: string;
  totalFunding: number;
  currentFunding: number;
  targetReturn: number;
  minimumInvestment: number;
  numberOfInvestors: number;
  term: number;
  daysLeft: number;
};

const propertyTypes = ["residential", "commercial", "industrial", "mixed-use"];

const PropertyManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/admin/properties"],
  });

  const addPropertyMutation = useMutation({
    mutationFn: async (property: any) => {
      const response = await apiRequest("POST", "/api/admin/properties", property);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Property added successfully",
        variant: "default",
      });
      setAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/properties/${id}`,
        updates
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Property updated successfully",
        variant: "default",
      });
      setUpdateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addPropertyUpdateMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: number; updateData: any }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/properties/${id}/updates`,
        updateData
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Property update added successfully",
        variant: "default",
      });
      setDetailDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add property update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setDetailDialogOpen(true);
  };

  const openUpdateDialog = (property: Property) => {
    setSelectedProperty(property);
    setUpdateDialogOpen(true);
  };

  const filteredProperties = properties
    ? properties.filter(
        (property) =>
          property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-destructive mb-2">Failed to load properties</p>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>
              Manage investment properties
            </CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </div>
        <div className="flex items-center mt-4">
          <Search className="w-4 h-4 mr-2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="w-full max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Funding</TableHead>
              <TableHead>Target Return</TableHead>
              <TableHead>Investors</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.id}</TableCell>
                <TableCell className="font-medium">{property.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{property.type}</Badge>
                </TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {formatCurrency(property.currentFunding)} / {formatCurrency(property.totalFunding)}
                    </p>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.min(
                            (property.currentFunding / property.totalFunding) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>{property.targetReturn}%</TableCell>
                <TableCell>{property.numberOfInvestors}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{property.daysLeft}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPropertyDetails(property)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUpdateDialog(property)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProperties.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No properties found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Add Property Dialog */}
        <AddPropertyDialog 
          open={addDialogOpen} 
          onOpenChange={setAddDialogOpen} 
          onSubmit={(data) => addPropertyMutation.mutate(data)}
          isSubmitting={addPropertyMutation.isPending}
        />

        {/* Update Property Dialog */}
        {selectedProperty && (
          <UpdatePropertyDialog
            open={updateDialogOpen}
            onOpenChange={setUpdateDialogOpen}
            property={selectedProperty}
            onSubmit={(data) => updatePropertyMutation.mutate({ id: selectedProperty.id, updates: data })}
            isSubmitting={updatePropertyMutation.isPending}
          />
        )}

        {/* Property Details Dialog */}
        {selectedProperty && (
          <PropertyDetailsDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            property={selectedProperty}
            onAddUpdate={(data) => addPropertyUpdateMutation.mutate({ id: selectedProperty.id, updateData: data })}
            isAddingUpdate={addPropertyUpdateMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyManagement;

// Add Property Dialog Component
interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const addPropertySchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  type: z.enum(["residential", "commercial", "industrial", "mixed-use"]),
  location: z.string().min(3, { message: "Location is required" }),
  description: z.string().min(20, { message: "Please provide a detailed description" }),
  imageUrl: z.string().url({ message: "Please enter a valid URL" }),
  totalFunding: z.number().min(1, { message: "Total funding amount is required" }),
  targetReturn: z.number().min(1, { message: "Target return is required" }),
  minimumInvestment: z.number().min(1, { message: "Minimum investment is required" }),
  term: z.number().min(1, { message: "Investment term is required" }),
  daysLeft: z.number().min(1, { message: "Days left for funding is required" }),
});

const AddPropertyDialog: React.FC<AddPropertyDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof addPropertySchema>>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      name: "",
      type: "residential",
      location: "",
      description: "",
      imageUrl: "",
      totalFunding: 0,
      targetReturn: 0,
      minimumInvestment: 0,
      term: 0,
      daysLeft: 30,
    },
  });

  const handleSubmit = (data: z.infer<typeof addPropertySchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Create a new investment property listing
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter property name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalFunding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Funding (₦)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5000000" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}  
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Investment (₦)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100000" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}  
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Return (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="12" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}  
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Term (months)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="36" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}  
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="daysLeft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Left for Funding</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}  
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the property"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Property
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Update Property Dialog Component
interface UpdatePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const UpdatePropertyDialog: React.FC<UpdatePropertyDialogProps> = ({
  open,
  onOpenChange,
  property,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<Partial<Property>>({
    defaultValues: {
      name: property.name,
      type: property.type,
      location: property.location,
      description: property.description,
      imageUrl: property.imageUrl,
      totalFunding: property.totalFunding,
      targetReturn: property.targetReturn,
      minimumInvestment: property.minimumInvestment,
      term: property.term,
      daysLeft: property.daysLeft,
    },
  });

  const handleSubmit = (data: Partial<Property>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Property</DialogTitle>
          <DialogDescription>
            Update the details for {property.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Name</label>
              <Input
                {...form.register("name")}
                defaultValue={property.name}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                defaultValue={property.type}
                onValueChange={(value) => form.setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                {...form.register("location")}
                defaultValue={property.location}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                {...form.register("imageUrl")}
                defaultValue={property.imageUrl}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Total Funding (₦)</label>
              <Input
                type="number"
                {...form.register("totalFunding", {
                  valueAsNumber: true,
                })}
                defaultValue={property.totalFunding}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Investment (₦)</label>
              <Input
                type="number"
                {...form.register("minimumInvestment", {
                  valueAsNumber: true,
                })}
                defaultValue={property.minimumInvestment}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Return (%)</label>
              <Input
                type="number"
                {...form.register("targetReturn", {
                  valueAsNumber: true,
                })}
                defaultValue={property.targetReturn}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Term (months)</label>
              <Input
                type="number"
                {...form.register("term", {
                  valueAsNumber: true,
                })}
                defaultValue={property.term}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Days Left</label>
              <Input
                type="number"
                {...form.register("daysLeft", {
                  valueAsNumber: true,
                })}
                defaultValue={property.daysLeft}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              {...form.register("description")}
              defaultValue={property.description}
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Property
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Property Details Dialog Component
interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
  onAddUpdate: (data: any) => void;
  isAddingUpdate: boolean;
}

const PropertyDetailsDialog: React.FC<PropertyDetailsDialogProps> = ({
  open,
  onOpenChange,
  property,
  onAddUpdate,
  isAddingUpdate,
}) => {
  const [updateText, setUpdateText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const handleAddUpdate = () => {
    if (!updateText && !imageUrl) return;
    
    onAddUpdate({
      updateText,
      imageUrl: imageUrl || null,
    });
    
    setUpdateText("");
    setImageUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property.name}</DialogTitle>
          <DialogDescription>
            Property details and management
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="updates">Add Update</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <img 
                  src={property.imageUrl} 
                  alt={property.name} 
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p>{property.location}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p className="capitalize">{property.type}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Funding</h3>
                  <p>{formatCurrency(property.currentFunding)} / {formatCurrency(property.totalFunding)}</p>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min(
                          (property.currentFunding / property.totalFunding) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Investment Details</h3>
                  <p>Target Return: {property.targetReturn}%</p>
                  <p>Minimum Investment: {formatCurrency(property.minimumInvestment)}</p>
                  <p>Term: {property.term} months</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">{property.description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="investors">
            <div className="py-4">
              <h3 className="font-medium mb-2">Investor Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{property.numberOfInvestors}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        property.numberOfInvestors > 0
                          ? property.currentFunding / property.numberOfInvestors
                          : 0
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <p className="text-center text-muted-foreground mt-8">
                Use the investments tab to see detailed investor information
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="updates">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Text</label>
                <Textarea
                  placeholder="Share construction progress, milestones, or important information..."
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL (Optional)</label>
                <Input
                  placeholder="https://example.com/update-image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Add an image to highlight your update</p>
              </div>
              
              <Button 
                onClick={handleAddUpdate} 
                disabled={(!updateText && !imageUrl) || isAddingUpdate}
                className="w-full"
              >
                {isAddingUpdate ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" /> Post Update
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-2">
                Updates will be sent as notifications to all investors
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};