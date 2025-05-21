import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  role: string;
  isOwner: boolean;
}

export default function TenantSelector() {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all tenants that the current user has access to
  const { data: tenants, isLoading, error } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
    retry: 1,
  });

  // Handle tenant selection
  const handleTenantChange = (value: string) => {
    setSelectedTenantId(value);
    
    // Store selected tenant in local storage for persistence
    localStorage.setItem('selectedTenantId', value);
    
    // Redirect to tenant dashboard
    navigate(`/tenant/${value}/dashboard`);
  };

  // Handle create new tenant
  const handleCreateTenant = () => {
    navigate('/tenant/create');
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-full" /></CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    toast({
      title: "Error loading tenants",
      description: "There was a problem loading your organizations. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Select Organization</CardTitle>
        <CardDescription>
          Choose the organization you want to work with
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tenants && tenants.length > 0 ? (
          <Select onValueChange={handleTenantChange} value={selectedTenantId || undefined}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Your organizations</SelectLabel>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center">
                      {tenant.logo ? (
                        <img 
                          src={tenant.logo} 
                          alt={tenant.name} 
                          className="w-5 h-5 mr-2 rounded-sm" 
                        />
                      ) : (
                        <Building2 className="w-5 h-5 mr-2 text-muted-foreground" />
                      )}
                      <span>{tenant.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground capitalize">
                        ({tenant.role})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            You don't have access to any organizations yet.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Skip
        </Button>
        <Button onClick={handleCreateTenant}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </CardFooter>
    </Card>
  );
}