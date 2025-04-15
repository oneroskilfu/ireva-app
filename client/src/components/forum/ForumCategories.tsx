import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Home, 
  Building2, 
  BarChart2, 
  GraduationCap, 
  Users, 
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample forum categories
const categories = [
  {
    id: "general",
    name: "General Discussion",
    description: "General real estate investment discussions",
    icon: <Building className="h-4 w-4" />,
    count: 128,
  },
  {
    id: "residential",
    name: "Residential Properties",
    description: "Apartments, houses, and residential investments",
    icon: <Home className="h-4 w-4" />,
    count: 87,
  },
  {
    id: "commercial",
    name: "Commercial Properties",
    description: "Office spaces, retail, and commercial real estate",
    icon: <Building2 className="h-4 w-4" />,
    count: 56,
  },
  {
    id: "market-insights",
    name: "Market Insights",
    description: "Market trends, analysis, and forecasts",
    icon: <BarChart2 className="h-4 w-4" />,
    count: 73,
  },
  {
    id: "education",
    name: "Education & Learning",
    description: "Resources, guides, and learning materials",
    icon: <GraduationCap className="h-4 w-4" />,
    count: 94,
  },
  {
    id: "networking",
    name: "Networking",
    description: "Connect with other investors and professionals",
    icon: <Users className="h-4 w-4" />,
    count: 45,
  },
  {
    id: "support",
    name: "Help & Support",
    description: "Platform help, technical support, and FAQs",
    icon: <HelpCircle className="h-4 w-4" />,
    count: 32,
  }
];

interface ForumCategoriesProps {
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function ForumCategories({ 
  activeCategory, 
  onSelectCategory 
}: ForumCategoriesProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 px-3 pb-3">
          <Button
            variant="ghost"
            onClick={() => onSelectCategory(null)}
            className={cn(
              "w-full justify-start font-normal",
              !activeCategory && "bg-secondary"
            )}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            All Categories
          </Button>
          
          {categories.map(category => (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "w-full justify-start font-normal",
                activeCategory === category.id && "bg-secondary"
              )}
            >
              <span className="mr-2">{category.icon}</span>
              <span className="flex-1 text-left">{category.name}</span>
              <Badge variant="secondary" className="ml-auto">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}