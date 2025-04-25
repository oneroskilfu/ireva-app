import React, { useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom validator for image URLs or data URLs
const isValidImageUrl = (value: string) => {
  // Check if it's a valid URL
  const urlRegex = /^(https?:\/\/[^\s]+)$/;
  
  // Check if it's a data URL for an image
  const dataUrlRegex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,[a-zA-Z0-9+/=]+$/;
  
  return urlRegex.test(value) || dataUrlRegex.test(value);
};

// Property form schema
const propertyFormSchema = z.object({
  name: z.string().min(3, "Property name must be at least 3 characters"),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["residential", "commercial", "industrial", "mixed_use", "land"]),
  imageUrl: z.string().refine(
    isValidImageUrl, 
    { message: "Must be a valid URL or image data URL" }
  ),
  imageGallery: z.array(
    z.string().refine(
      isValidImageUrl, 
      { message: "Must be a valid URL or image data URL" }
    )
  ).optional(),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  developer: z.string().min(2, "Developer name is required"),
  developerProfile: z.string().optional().or(z.literal('')),
  riskLevel: z.enum(["low", "medium", "high"]),
  targetReturn: z.string().min(1, "Target return is required"),
  minimumInvestment: z.number().int().positive("Minimum investment must be positive"),
  term: z.number().int().positive("Term must be positive"),
  totalFunding: z.number().int().positive("Total funding must be positive"),
  currentFunding: z.number().int().nonnegative("Current funding must be non-negative").optional(),
  numberOfInvestors: z.number().int().nonnegative("Number of investors must be non-negative").optional(),
  daysLeft: z.number().int().nonnegative("Days left must be non-negative").optional(),
  size: z.string().min(1, "Property size is required"),
  builtYear: z.string().optional().or(z.literal('')),
  occupancy: z.string().optional().or(z.literal('')),
  cashFlow: z.string().optional().or(z.literal('')),
  amenities: z.array(z.string()).optional(),
  latitude: z.string().optional().or(z.literal('')),
  longitude: z.string().optional().or(z.literal('')),
  accreditedOnly: z.boolean().default(false),
  tier: z.enum(["starter", "growth", "premium", "elite"]),
  completionDate: z.date().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface AddPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageGallery, setImageGallery] = useState<string[]>([]);

  // Default values for the form
  const defaultValues: Partial<PropertyFormValues> = {
    name: '',
    location: '',
    description: '',
    type: 'residential',
    imageUrl: '',
    imageGallery: [],
    videoUrl: '',
    developer: '',
    developerProfile: '',
    riskLevel: 'medium',
    targetReturn: '',
    minimumInvestment: 0,
    term: 0,
    totalFunding: 0,
    currentFunding: 0,
    numberOfInvestors: 0,
    daysLeft: 0,
    size: '',
    builtYear: '',
    occupancy: '',
    cashFlow: '',
    amenities: [],
    latitude: '',
    longitude: '',
    accreditedOnly: false,
    tier: 'starter',
  };

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });

  const addPropertyMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      // Prepare the data for the API
      const formattedData = {
        ...values,
        imageGallery: JSON.stringify(imageGallery),
        amenities: JSON.stringify(amenities),
        targetReturn: values.targetReturn.toString(),
      };
      
      const response = await apiRequest('POST', '/api/admin/properties', formattedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      onClose();
      form.reset(defaultValues);
      setAmenities([]);
      setImageGallery([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add property: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PropertyFormValues) => {
    // Add the amenities and imageGallery to the form values
    const dataToSubmit = {
      ...values,
      amenities,
      imageGallery,
    };
    
    addPropertyMutation.mutate(dataToSubmit);
  };

  const addAmenity = () => {
    if (amenityInput.trim() !== '' && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const addImageToGallery = () => {
    if (imageUrlInput.trim() !== '' && !imageGallery.includes(imageUrlInput.trim())) {
      setImageGallery([...imageGallery, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const removeImageFromGallery = (imageUrl: string) => {
    setImageGallery(imageGallery.filter(url => url !== imageUrl));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new investment property to the platform.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Lagos Heights Apartment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location*</FormLabel>
                      <FormControl>
                        <Input placeholder="Lagos, Nigeria" {...field} />
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
                      <FormLabel>Property Type*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="mixed_use">Mixed Use</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A modern apartment complex with 50 units in the heart of Lagos" 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Media</h3>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Property Image*</FormLabel>
                      <Tabs defaultValue="url" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="url">URL</TabsTrigger>
                          <TabsTrigger value="upload">Upload</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="url" className="space-y-4">
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field} 
                            />
                          </FormControl>
                        </TabsContent>
                        
                        <TabsContent value="upload" className="space-y-4">
                          <div className="flex flex-col space-y-2">
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-muted cursor-pointer"
                              onClick={() => document.getElementById('main-image-upload')?.click()}
                            >
                              {field.value && field.value.startsWith('data:image/') ? (
                                <div className="relative w-full h-40 mb-2">
                                  <img 
                                    src={field.value}
                                    alt="Main property"
                                    className="absolute inset-0 w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                              )}
                              <p className="text-sm text-muted-foreground mb-1">
                                {field.value && field.value.startsWith('data:image/') 
                                  ? "Click to change main property image" 
                                  : "Click to upload main property image"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, WEBP up to 5MB
                              </p>
                              <input 
                                type="file" 
                                className="hidden" 
                                id="main-image-upload"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Convert file to data URL
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result && typeof event.target.result === 'string') {
                                        field.onChange(event.target.result);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                    // Clear the input
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <FormDescription>
                        Main image for the property listing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Image Gallery</FormLabel>
                  
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="url" className="space-y-4">
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="https://example.com/gallery1.jpg" 
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          onClick={addImageToGallery} 
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-muted">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Drag and drop image files here, or click to select files
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                          <input 
                            type="file" 
                            className="hidden" 
                            id="image-upload"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                Array.from(files).forEach(file => {
                                  // Convert file to data URL
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result && typeof event.target.result === 'string') {
                                      if (!imageGallery.includes(event.target.result)) {
                                        setImageGallery([...imageGallery, event.target.result]);
                                      }
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                });
                                // Clear the input
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            variant="secondary"
                            className="mt-4"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Files
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  {imageGallery.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Gallery Preview</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {imageGallery.map((url, index) => (
                          <div key={index} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
                            <img 
                              src={url} 
                              alt={`Gallery image ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm" 
                                className="rounded-full w-8 h-8 p-0"
                                onClick={() => removeImageFromGallery(url)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/video.mp4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Developer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Developer Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="developer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Development Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="developerProfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Investment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Investment Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Level*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target ROI (%)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="8.5"
                          {...field} 
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
                      <FormLabel>Term (months)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
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
                      <FormLabel>Minimum Investment*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                        />
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
                      <FormLabel>Total Funding Required*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="10000000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentFunding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Funding</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Tier*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select investment tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="elite">Elite</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfInvestors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Investors</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
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
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accreditedOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Accredited Investors Only</FormLabel>
                        <FormDescription>
                          Restrict this property to accredited investors
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Completion Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Size*</FormLabel>
                      <FormControl>
                        <Input placeholder="200 sq.m / 10 Units" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="builtYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input placeholder="2020" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupancy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy</FormLabel>
                      <FormControl>
                        <Input placeholder="95%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cashFlow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Cash Flow</FormLabel>
                      <FormControl>
                        <Input placeholder="₦24,000,000/year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 md:col-span-2">
                  <FormLabel>Amenities</FormLabel>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Swimming Pool" 
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                    />
                    <Button type="button" onClick={addAmenity} variant="outline">Add</Button>
                  </div>
                  {amenities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center bg-muted px-3 py-1 rounded">
                          <span className="text-sm mr-2">{amenity}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => removeAmenity(amenity)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="6.5244" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input placeholder="3.3792" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addPropertyMutation.isPending}
              >
                {addPropertyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Property"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyForm;