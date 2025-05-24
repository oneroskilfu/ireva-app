import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "wouter";
import { toast } from "react-toastify";
import { insertPropertySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Property form schema with additional validation
const propertyFormSchema = insertPropertySchema.extend({
  name: z.string().min(3, "Property name must be at least 3 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Please enter a valid image URL"),
  targetReturn: z.string().regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid return percentage"),
  minimumInvestment: z.number().min(1000, "Minimum investment must be at least ₦1,000"),
  term: z.number().min(1, "Term must be at least 1 month"),
  totalFunding: z.number().min(10000, "Total funding must be at least ₦10,000"),
  currentFunding: z.number().default(0),
  daysLeft: z.number().min(1, "Days left must be at least 1").default(30),
  amenities: z.array(z.string()).optional(),
  imageGallery: z.array(z.string().url("Please enter valid image URLs")).optional(),
  accreditedOnly: z.boolean().default(false),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const NIGERIAN_CITIES = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Kaduna", 
  "Benin City", "Calabar", "Enugu", "Uyo", "Owerri", "Warri", "Asaba"
];

export default function AddProperty() {
  const [, navigate] = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Form setup
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      type: "residential",
      imageUrl: "",
      tier: "starter",
      targetReturn: "",
      minimumInvestment: 100000,
      term: 36,
      totalFunding: 1000000,
      currentFunding: 0,
      daysLeft: 30,
      accreditedOnly: false,
      amenities: [],
      imageGallery: [],
    },
  });
  
  // Add property mutation
  const addPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      const res = await apiRequest("POST", "/api/properties", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast.success("Property added successfully");
      navigate("/admin/properties");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add property: ${error.message}`);
    },
  });
  
  // Handle form submission
  const onSubmit = (data: PropertyFormValues) => {
    // Update amenities and image gallery from state
    data.amenities = amenities;
    data.imageGallery = imageGallery;
    
    // Submit data
    addPropertyMutation.mutate(data);
  };
  
  // Handle amenity management
  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };
  
  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };
  
  // Handle image gallery management
  const addImageToGallery = () => {
    if (newImageUrl.trim() && !imageGallery.includes(newImageUrl.trim())) {
      setImageGallery([...imageGallery, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };
  
  const removeImageFromGallery = (imageUrl: string) => {
    setImageGallery(imageGallery.filter(img => img !== imageUrl));
  };
  
  // Function to switch tabs and validate current tab
  const handleTabChange = (tab: string) => {
    // Basic validation based on current tab before switching
    if (activeTab === "basic") {
      const isBasicValid = form.trigger(["name", "location", "description", "type", "imageUrl"]);
      if (!isBasicValid) {
        return;
      }
    } else if (activeTab === "financial") {
      const isFinancialValid = form.trigger(["targetReturn", "minimumInvestment", "term", "totalFunding"]);
      if (!isFinancialValid) {
        return;
      }
    }
    
    setActiveTab(tab);
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary">Add New Property</CardTitle>
          <CardDescription>
            Create a new property listing for investors. Complete all required fields for optimal visibility.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="financial">Financial Details</TabsTrigger>
              <TabsTrigger value="additional">Additional Information</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="basic" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Skyline Apartments" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter a descriptive name for the property
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NIGERIAN_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
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
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="industrial">Industrial</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                              <SelectItem value="mixed_use">Mixed Use</SelectItem>
                            </SelectContent>
                          </Select>
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
                            className="resize-none min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include key features, location benefits, and investment potential
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Primary image URL for the property listing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("imageUrl") && (
                    <div className="border rounded-md p-2">
                      <p className="text-sm font-medium mb-2">Image Preview</p>
                      <img 
                        src={form.watch("imageUrl")} 
                        alt="Property preview" 
                        className="w-full h-40 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => handleTabChange("financial")}
                    >
                      Next: Financial Details
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="financial" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="targetReturn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Return (%)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 12.5" {...field} />
                          </FormControl>
                          <FormDescription>
                            Expected annual return percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Tier</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select investment tier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="elite">Elite</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Categorize by investment level
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="minimumInvestment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Investment (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 100000" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum amount required to invest
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="totalFunding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Funding Goal (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 5000000" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Total amount needed for the project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="term"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term (months)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 36" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Investment duration in months
                          </FormDescription>
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
                              placeholder="e.g., 30" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Days remaining until funding closes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="accreditedOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Accredited Investors Only</FormLabel>
                          <FormDescription>
                            Restrict this property to accredited investors
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleTabChange("basic")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => handleTabChange("additional")}
                    >
                      Next: Additional Information
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="additional" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Property Amenities</h3>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter amenity (e.g., Pool, Gym)"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        className="flex-grow"
                      />
                      <Button 
                        type="button" 
                        onClick={addAmenity}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity, index) => (
                        <div 
                          key={index} 
                          className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                        >
                          {amenity}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 ml-1"
                            onClick={() => removeAmenity(amenity)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {amenities.length === 0 && (
                        <p className="text-sm text-muted-foreground">No amenities added yet</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Image Gallery</h3>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter image URL"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-grow"
                      />
                      <Button 
                        type="button" 
                        onClick={addImageToGallery}
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {imageGallery.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Gallery ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImageFromGallery(image)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {imageGallery.length === 0 && (
                        <p className="text-sm text-muted-foreground col-span-3">No gallery images added yet</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="developer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Developer</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Skyline Developers Ltd" {...field} />
                          </FormControl>
                          <FormDescription>
                            Name of the property developer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="riskLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select risk level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Investment risk classification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleTabChange("financial")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addPropertyMutation.isPending}
                    >
                      {addPropertyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Property"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-6 text-center text-sm text-muted-foreground rounded-b-lg">
          <div className="w-full">
            <p>
              All property information will be visible to investors. Ensure accuracy for best results.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}