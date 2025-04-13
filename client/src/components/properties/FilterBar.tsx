import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Button 
} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  Filter, 
  SlidersHorizontal, 
  Map, 
  Home, 
  Percent, 
  BarChart3, 
  AlertTriangle, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PropertyFilters {
  type: string;
  location: string;
  minInvestment: [number, number];
  minReturn: number;
  riskLevel: string;
  sort: string;
  search: string;
}

interface FilterBarProps {
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  onReset: () => void;
  locations: string[];
  activeFilterCount: number;
}

export function FilterBar({ 
  filters, 
  onFilterChange, 
  onReset, 
  locations,
  activeFilterCount
}: FilterBarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  // Apply filters when apply button is clicked on mobile
  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    setShowMobileFilters(false);
  };
  
  // Update local filter state
  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // On desktop, apply filters immediately
      if (!showMobileFilters) {
        onFilterChange(newFilters);
      }
      
      return newFilters;
    });
  };
  
  // Check if a filter is active compared to default values
  const isFilterActive = (key: keyof PropertyFilters): boolean => {
    switch (key) {
      case 'type':
        return localFilters.type !== 'all';
      case 'location':
        return localFilters.location !== 'all';
      case 'minInvestment':
        return localFilters.minInvestment[0] > 0 || localFilters.minInvestment[1] < 10000;
      case 'minReturn':
        return localFilters.minReturn > 0;
      case 'riskLevel':
        return localFilters.riskLevel !== 'all';
      case 'sort':
        return localFilters.sort !== 'default';
      case 'search':
        return !!localFilters.search;
      default:
        return false;
    }
  };
  
  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'mixed-use', label: 'Mixed-Use' }
  ];
  
  const riskLevels = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' }
  ];
  
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'return-high', label: 'Highest Return' },
    { value: 'return-low', label: 'Lowest Return' },
    { value: 'investment-high', label: 'Highest Minimum Investment' },
    { value: 'investment-low', label: 'Lowest Minimum Investment' },
    { value: 'funding-high', label: 'Most Funded' },
    { value: 'funding-low', label: 'Least Funded' },
    { value: 'deadline-close', label: 'Closing Soon' }
  ];
  
  // Desktop filter view
  const DesktopFilters = (
    <Card className="hidden md:block p-1 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <div>
            <Select 
              value={localFilters.sort} 
              onValueChange={(value) => updateFilter('sort', value)}
            >
              <SelectTrigger className={cn(
                "w-[180px]",
                isFilterActive('sort') && "border-primary"
              )}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          {/* Type */}
          <div>
            <Select 
              value={localFilters.type} 
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger className={cn(
                "w-[170px]",
                isFilterActive('type') && "border-primary"
              )}>
                <Home className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          {/* Location */}
          <div>
            <Select 
              value={localFilters.location} 
              onValueChange={(value) => updateFilter('location', value)}
            >
              <SelectTrigger className={cn(
                "w-[180px]",
                isFilterActive('location') && "border-primary"
              )}>
                <Map className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          {/* Return Rate */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "gap-2",
                  isFilterActive('minReturn') && "border-primary"
                )}
              >
                <Percent className="h-4 w-4" />
                <span>Min Return: {localFilters.minReturn}%</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Minimum Return Rate</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>0%</span>
                    <span>20%+</span>
                  </div>
                  <Slider
                    value={[localFilters.minReturn]}
                    min={0}
                    max={20}
                    step={0.5}
                    onValueChange={(value) => updateFilter('minReturn', value[0])}
                  />
                  <div className="text-center text-muted-foreground">
                    Currently: {localFilters.minReturn}%
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
  
          {/* Risk Level */}
          <div>
            <Select 
              value={localFilters.riskLevel} 
              onValueChange={(value) => updateFilter('riskLevel', value)}
            >
              <SelectTrigger className={cn(
                "w-[170px]",
                isFilterActive('riskLevel') && "border-primary"
              )}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map(risk => (
                  <SelectItem key={risk.value} value={risk.value}>
                    {risk.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          {/* Investment Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "gap-2",
                  isFilterActive('minInvestment') && "border-primary"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Investment: ${localFilters.minInvestment[0]}-${localFilters.minInvestment[1]}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Investment Range</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${localFilters.minInvestment[0]}</span>
                    <span>${localFilters.minInvestment[1]}</span>
                  </div>
                  <Slider
                    value={[localFilters.minInvestment[0], localFilters.minInvestment[1]]}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={(value) => updateFilter('minInvestment', [value[0], value[1]])}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
  
          {/* Reset filters */}
          <div>
            <Button 
              variant="ghost" 
              onClick={onReset}
              className="gap-2"
              disabled={activeFilterCount === 0}
            >
              <X className="h-4 w-4" />
              <span>Reset</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Mobile filter view
  const MobileFilters = (
    <div className="md:hidden">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          onClick={() => setShowMobileFilters(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        
        <Select 
          value={localFilters.sort} 
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Mobile filter sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg">Filters</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMobileFilters(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="type">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Property Type</span>
                    {isFilterActive('type') && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {propertyTypes.map(type => (
                      <Button
                        key={type.value}
                        variant={localFilters.type === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('type', type.value)}
                        className="justify-start"
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="location">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    <span>Location</span>
                    {isFilterActive('location') && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2 pt-2">
                    <Button
                      variant={localFilters.location === 'all' ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter('location', 'all')}
                      className="justify-start"
                    >
                      All Locations
                    </Button>
                    {locations.map(location => (
                      <Button
                        key={location}
                        variant={localFilters.location === location ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('location', location)}
                        className="justify-start"
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="return">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    <span>Minimum Return</span>
                    {isFilterActive('minReturn') && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>0%</span>
                        <span>20%+</span>
                      </div>
                      <Slider
                        value={[localFilters.minReturn]}
                        min={0}
                        max={20}
                        step={0.5}
                        onValueChange={(value) => updateFilter('minReturn', value[0])}
                      />
                      <div className="text-center text-muted-foreground">
                        Currently: {localFilters.minReturn}%
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="risk">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Risk Level</span>
                    {isFilterActive('riskLevel') && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {riskLevels.map(risk => (
                      <Button
                        key={risk.value}
                        variant={localFilters.riskLevel === risk.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('riskLevel', risk.value)}
                        className="justify-start"
                      >
                        {risk.label}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="investment">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Investment Range</span>
                    {isFilterActive('minInvestment') && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <div className="text-center text-muted-foreground">
                        ${localFilters.minInvestment[0]} - ${localFilters.minInvestment[1]}
                      </div>
                      <Slider
                        value={[localFilters.minInvestment[0], localFilters.minInvestment[1]]}
                        min={0}
                        max={10000}
                        step={100}
                        onValueChange={(value) => updateFilter('minInvestment', [value[0], value[1]])}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onReset}>
                Reset Filters
              </Button>
              <Button className="flex-1" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <>
      {DesktopFilters}
      {MobileFilters}
    </>
  );
}