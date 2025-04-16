import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  onClick: (project: any) => void;
}

interface ProjectTableProps {
  data: any[];
  isLoading: boolean;
  actions: ActionItem[];
}

const ProjectTable = ({ data, isLoading, actions }: ProjectTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Search and sort functionality
  const filteredData = data
    .filter(project => {
      return (
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]"><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Project Name {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('location')}
                    >
                      Location {getSortIcon('location')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('type')}
                    >
                      Type {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('targetReturn')}
                    >
                      Return {getSortIcon('targetReturn')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('totalFunding')}
                    >
                      Funding Goal {getSortIcon('totalFunding')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('numberOfInvestors')}
                    >
                      Investors {getSortIcon('numberOfInvestors')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No projects found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={project.imageUrl}
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="truncate max-w-[200px]">
                            {project.name}
                            {project.accreditedOnly && (
                              <Badge className="ml-1 bg-amber-500" variant="secondary">Premium</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{project.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {project.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.targetReturn}%</TableCell>
                      <TableCell>{formatCurrency(project.totalFunding)}</TableCell>
                      <TableCell>{project.numberOfInvestors}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, index) => (
                              <DropdownMenuItem 
                                key={index}
                                onClick={() => action.onClick(project)}
                                className="cursor-pointer flex items-center"
                              >
                                {action.icon}
                                <span className="ml-2">{action.label}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTable;