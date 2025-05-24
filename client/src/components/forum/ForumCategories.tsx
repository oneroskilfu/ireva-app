import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building,
  Home,
  Building2,
  BarChart2,
  GraduationCap,
  Users,
  HelpCircle,
  Search,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ForumCategoriesProps {
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

// Sample categories data
const categories = [
  {
    id: "general",
    name: "General Discussion",
    icon: <Building className="h-5 w-5" />,
    description: "General real estate investment topics and discussions",
    count: 128
  },
  {
    id: "residential",
    name: "Residential Properties",
    icon: <Home className="h-5 w-5" />,
    description: "Discussions about residential real estate investments",
    count: 86
  },
  {
    id: "commercial",
    name: "Commercial Properties",
    icon: <Building2 className="h-5 w-5" />,
    description: "Commercial real estate investment strategies and opportunities",
    count: 42
  },
  {
    id: "market-insights",
    name: "Market Insights",
    icon: <BarChart2 className="h-5 w-5" />,
    description: "Market trends, analysis, and forecasts",
    count: 75
  },
  {
    id: "education",
    name: "Education & Learning",
    icon: <GraduationCap className="h-5 w-5" />,
    description: "Educational resources and learning materials",
    count: 94
  },
  {
    id: "networking",
    name: "Networking",
    icon: <Users className="h-5 w-5" />,
    description: "Connect with other investors and industry professionals",
    count: 37
  },
  {
    id: "support",
    name: "Help & Support",
    icon: <HelpCircle className="h-5 w-5" />,
    description: "Technical support and platform assistance",
    count: 29
  }
];

export function ForumCategories({ 
  activeCategory, 
  onSelectCategory 
}: ForumCategoriesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // If loading (for future api implementation)
  const isLoading = false;
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="group">
            <CardHeader className="p-4 pb-0">
              <Skeleton className="h-5 w-2/3" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="search"
          placeholder="Search categories..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <ScrollArea className="h-[calc(100vh-220px)] pr-4">
        <div className="space-y-3">
          {activeCategory === null && (
            <Card 
              className={cn(
                "group hover:bg-primary/5 transition-colors cursor-pointer border-primary/30",
              )}
              onClick={() => onSelectCategory(null)}
            >
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span>Create New Topic</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <CardDescription>
                  Start a new discussion in any category
                </CardDescription>
              </CardContent>
            </Card>
          )}
          
          {filteredCategories.map(category => (
            <Card 
              key={category.id}
              className={cn(
                "group hover:bg-primary/5 transition-colors cursor-pointer",
                activeCategory === category.id && "border-primary bg-primary/5"
              )}
              onClick={() => onSelectCategory(category.id)}
            >
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className={cn(
                    "p-1.5 rounded-md",
                    activeCategory === category.id 
                      ? "bg-primary text-white" 
                      : "bg-muted text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    {category.icon}
                  </span>
                  <span>{category.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <CardDescription className="mb-2">
                  {category.description}
                </CardDescription>
                <Badge variant="outline" className="text-xs">
                  {category.count} topics
                </Badge>
              </CardContent>
            </Card>
          ))}
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-gray-500">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}