import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Pencil, 
  Trash, 
  FileText, 
  Video, 
  FileQuestion,
  BookOpen,
  Globe,
  Link2,
  BarChart,
  Download,
  ExternalLink,
  Eye,
  FileImage
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminResourcesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreatingResource, setIsCreatingResource] = useState(false);

  // Temporarily use a mock data approach until the API endpoint is implemented
  const { data: resources, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/educational-resources'],
    queryFn: async () => {
      // Return mock data instead of making an actual API call that would fail
      return [];
    }
  });

  const handleRefresh = () => {
    toast({
      title: "Refreshing resources",
      description: "The educational resources are being updated.",
    });
  };

  const handleCreateResource = () => {
    setIsCreatingResource(true);
  };

  const handleCancelCreate = () => {
    setIsCreatingResource(false);
  };

  const handleSubmitResource = () => {
    toast({
      title: "Resource created",
      description: "The educational resource has been created successfully.",
    });
    setIsCreatingResource(false);
  };

  // Resource type icons
  const resourceTypeIcons: Record<string, React.ReactNode> = {
    article: <FileText className="h-5 w-5" />,
    video: <Video className="h-5 w-5" />,
    guide: <BookOpen className="h-5 w-5" />,
    faq: <FileQuestion className="h-5 w-5" />,
    webinar: <Globe className="h-5 w-5" />,
    infographic: <FileImage className="h-5 w-5" />,
    tool: <BarChart className="h-5 w-5" />,
  };

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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
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
        <h3 className="mt-4 text-lg font-semibold">Failed to Load Resources</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error loading the educational resources. Please try again later.
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

  // Mock resources for demonstration
  const mockResources = [
    {
      id: 1,
      title: "Guide to Real Estate Investment in Nigeria",
      type: "guide",
      description: "Comprehensive guide for new investors in the Nigerian real estate market.",
      url: "/resources/guides/nigeria-real-estate-guide.pdf",
      thumbnail: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["beginner", "nigeria", "investment"],
      createdAt: "2025-03-15T10:30:00",
      publishedStatus: "published",
      viewCount: 2456
    },
    {
      id: 2,
      title: "Understanding ROI in Property Investments",
      type: "article",
      description: "Learn how to calculate and interpret returns on investment in real estate.",
      url: "/resources/articles/understanding-roi.html",
      thumbnail: "https://images.unsplash.com/photo-1617791160588-241658c0f566?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["intermediate", "finance", "roi"],
      createdAt: "2025-02-22T14:45:00",
      publishedStatus: "published",
      viewCount: 1289
    },
    {
      id: 3,
      title: "Real Estate Market Trends for 2025",
      type: "webinar",
      description: "Expert analysis of current market trends and future predictions for African real estate.",
      url: "/resources/webinars/market-trends-2025.mp4",
      thumbnail: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["advanced", "market-analysis", "trends"],
      createdAt: "2025-01-30T16:00:00",
      publishedStatus: "published",
      viewCount: 867
    },
    {
      id: 4,
      title: "Property Valuation Techniques",
      type: "video",
      description: "Step-by-step tutorial on how to value properties in different markets.",
      url: "/resources/videos/property-valuation.mp4",
      thumbnail: "https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["intermediate", "valuation", "tutorial"],
      createdAt: "2025-01-15T09:20:00",
      publishedStatus: "draft",
      viewCount: 0
    }
  ];

  // Resource categories
  const resourceCategories = [
    { id: "all", name: "All Resources" },
    { id: "article", name: "Articles" },
    { id: "guide", name: "Guides" },
    { id: "video", name: "Videos" },
    { id: "webinar", name: "Webinars" },
    { id: "infographic", name: "Infographics" },
    { id: "faq", name: "FAQs" },
    { id: "tool", name: "Tools & Calculators" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Educational Resources</h2>
        <p className="text-muted-foreground">
          Manage educational content for investors
        </p>
      </div>

      {isCreatingResource ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Educational Resource</CardTitle>
            <CardDescription>
              Add a new educational resource for investors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource-title">Title</Label>
                <Input 
                  id="resource-title" 
                  placeholder="Enter resource title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resource-type">Resource Type</Label>
                <select 
                  id="resource-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select resource type</option>
                  <option value="article">Article</option>
                  <option value="guide">Guide</option>
                  <option value="video">Video</option>
                  <option value="webinar">Webinar</option>
                  <option value="infographic">Infographic</option>
                  <option value="faq">FAQ</option>
                  <option value="tool">Tool/Calculator</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resource-description">Description</Label>
                <Textarea 
                  id="resource-description" 
                  placeholder="Enter resource description"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resource-url">Resource URL</Label>
                  <Input 
                    id="resource-url" 
                    placeholder="Enter URL or upload file"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resource-thumbnail">Thumbnail Image</Label>
                  <Input 
                    id="resource-thumbnail" 
                    type="file"
                    accept="image/*"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resource-tags">Tags (Comma separated)</Label>
                <Input 
                  id="resource-tags" 
                  placeholder="E.g., beginner, nigeria, investment"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resource-status">Publication Status</Label>
                <select 
                  id="resource-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="draft">Draft - Not visible to users</option>
                  <option value="published">Published - Visible to all users</option>
                  <option value="premium">Premium - Visible to premium users only</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelCreate}>
              Cancel
            </Button>
            <Button onClick={handleSubmitResource}>
              Create Resource
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button onClick={handleCreateResource} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Create Resource</span>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap">
              {resourceCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
              ))}
            </TabsList>
            
            {resourceCategories.map(category => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {category.id === 'all' 
                        ? 'All educational resources available on the platform' 
                        : `${category.name} available on the platform`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(category.id === 'all' || mockResources.some(r => r.type === category.id)) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockResources
                          .filter(resource => category.id === 'all' || resource.type === category.id)
                          .map(resource => (
                            <Card key={resource.id} className="overflow-hidden">
                              <div className="h-40 overflow-hidden">
                                <img 
                                  src={resource.thumbnail} 
                                  alt={resource.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`
                                      ${resource.publishedStatus === 'published' ? 'bg-green-500/10 text-green-600' : ''}
                                      ${resource.publishedStatus === 'draft' ? 'bg-amber-500/10 text-amber-600' : ''}
                                      ${resource.publishedStatus === 'premium' ? 'bg-blue-500/10 text-blue-600' : ''}
                                    `}
                                  >
                                    {resource.publishedStatus.charAt(0).toUpperCase() + resource.publishedStatus.slice(1)}
                                  </Badge>
                                  <div className="rounded-full h-8 w-8 bg-primary/10 flex items-center justify-center">
                                    {resourceTypeIcons[resource.type] || <FileText className="h-4 w-4 text-primary" />}
                                  </div>
                                </div>
                                <h3 className="font-bold text-base mb-1">{resource.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {resource.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {resource.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>
                                    {new Date(resource.createdAt).toLocaleDateString()}
                                  </span>
                                  <span>
                                    {resource.viewCount} views
                                  </span>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-1">
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-muted-foreground">
                          {resourceTypeIcons[category.id] || <FileText className="h-12 w-12" />}
                        </div>
                        <h3 className="mt-4 text-lg font-medium">No {category.name} Found</h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                          There are no {category.name.toLowerCase()} available yet. Create your first {category.id} resource by clicking the "Create Resource" button.
                        </p>
                        <Button 
                          onClick={handleCreateResource} 
                          className="mt-4 gap-1"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Create {category.name.slice(0, -1)}</span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}