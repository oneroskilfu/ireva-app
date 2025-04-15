import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Filter,
  Search,
  SlidersHorizontal,
  Calendar,
  Tag,
  X,
  CheckSquare
} from "lucide-react";

export function ForumActions() {
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  return (
    <div className="flex items-center space-x-2">
      {/* Search */}
      {showSearch ? (
        <div className="relative w-full max-w-sm">
          <Input
            type="search"
            placeholder="Search topics..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pr-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => {
              setSearchValue("");
              setShowSearch(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(true)}
          title="Search"
        >
          <Search className="h-5 w-5" />
        </Button>
      )}
      
      {/* Filter Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="Filter"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Topics</DialogTitle>
            <DialogDescription>
              Narrow down topics based on specific criteria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <label className="text-sm font-medium">Tags</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {["investing", "passive-income", "lagos", "residential", "commercial", "guide", "roi", "beginner"].map(tag => (
                  <Button key={tag} variant="outline" size="sm" className="h-7 gap-1">
                    <span>{tag}</span>
                    <X className="h-3 w-3" />
                  </Button>
                ))}
              </div>
              <Input placeholder="Add tag..." className="mt-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <label className="text-sm font-medium">Time Period</label>
              </div>
              <Select defaultValue="anytime">
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="anytime">Anytime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <label className="text-sm font-medium">Status</label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-7">Hot Topics</Button>
                <Button variant="outline" size="sm" className="h-7">Pinned</Button>
                <Button variant="outline" size="sm" className="h-7">Solved</Button>
                <Button variant="outline" size="sm" className="h-7">Unanswered</Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" type="button">
              Reset Filters
            </Button>
            <Button type="button">
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="Sort"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem>
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Most Replies
          </DropdownMenuItem>
          <DropdownMenuItem>
            Most Views
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Recently Active
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}