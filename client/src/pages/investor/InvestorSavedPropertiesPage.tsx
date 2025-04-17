import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, Search, Filter, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import EmptyState from '@/components/ui/empty-state';
import { apiRequest } from '@/lib/queryClient';
import { Property } from '@shared/schema';

const InvestorSavedPropertiesPage: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch saved properties
  const { data: savedProperties, isLoading, error } = useQuery({
    queryKey: ['/api/investor/saved-properties'],
    // Temporary fallback - will use real data from API once it's available
    queryFn: async () => {
      // For now we'll use the regular properties endpoint as a fallback
      const res = await fetch('/api/properties');
      return res.json();
    }
  });

  // Filter properties based on search term
  const filteredProperties = savedProperties ? 
    savedProperties.filter((property: Property) => 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  // Render property card
  const renderPropertyCard = (property: Property) => (
    <Card key={property.id} className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
            <Bookmark className="h-4 w-4 fill-primary text-primary" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="text-white">
            <div className="flex justify-between items-center">
              <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                {property.tier}
              </span>
              <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                {property.daysLeft} days left
              </span>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-1">{property.name}</CardTitle>
        <div className="text-sm text-muted-foreground mb-2">{property.location}</div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Minimum Investment</div>
            <div className="font-semibold">₦{property.minimumInvestment.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Target Return</div>
            <div className="font-semibold">{property.targetReturn}%</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
          <div 
            className="bg-primary h-full rounded-full" 
            style={{ width: `${(property.currentFunding / property.totalFunding) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>₦{property.currentFunding.toLocaleString()} raised</span>
          <span>{Math.round((property.currentFunding / property.totalFunding) * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Saved Properties | iREVA</title>
      </Helmet>
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Saved Properties</h1>
            <p className="text-muted-foreground">
              View and manage your bookmarked investment opportunities
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="icon" 
              onClick={() => setView('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved properties..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="md:w-auto">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Sort
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="residential">Residential</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="industrial">Industrial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-red-500">Failed to load saved properties</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredProperties.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="h-12 w-12 text-muted-foreground" />}
                title="No saved properties"
                description="Properties you bookmark will appear here for easy access"
                action={
                  <Button variant="default" onClick={() => window.location.href = '/properties'}>
                    Browse Properties
                  </Button>
                }
              />
            ) : (
              <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProperties.map((property: Property) => renderPropertyCard(property))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="residential">
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProperties
                .filter((p: Property) => p.type === 'residential')
                .map((property: Property) => renderPropertyCard(property))}
            </div>
          </TabsContent>
          
          <TabsContent value="commercial">
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProperties
                .filter((p: Property) => p.type === 'commercial')
                .map((property: Property) => renderPropertyCard(property))}
            </div>
          </TabsContent>
          
          <TabsContent value="industrial">
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProperties
                .filter((p: Property) => p.type === 'industrial')
                .map((property: Property) => renderPropertyCard(property))}
            </div>
          </TabsContent>
        </Tabs>
        
        {!isLoading && !error && filteredProperties.length > 0 && (
          <div className="flex justify-between items-center border-t pt-4">
            <div className="text-muted-foreground">
              Showing {filteredProperties.length} saved properties
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InvestorSavedPropertiesPage;