import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface FilterBarProps {
  propertyCount: number;
  onFilterChange: (filters: {
    search: string;
    location: string;
    type: string;
  }) => void;
}

export default function FilterBar({ propertyCount, onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ search, location, type });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [search, location, type, onFilterChange]);
  
  return (
    <section className="bg-white border-b" id="properties">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-auto flex items-center">
            <h2 className="text-xl font-semibold">Available Properties</h2>
            <span className="ml-2 bg-primary/80 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              {propertyCount} Listings
            </span>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search properties"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2 w-full sm:w-auto">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Miami">Miami</SelectItem>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                  <SelectItem value="Austin">Austin</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
