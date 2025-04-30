import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSegments } from '../../hooks/useSegments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Users, UserPlus, Edit, Trash, Filter } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export const SegmentManager = () => {
  const { 
    segments, 
    isLoadingSegments, 
    createSegment, 
    updateSegment, 
    deleteSegment,
    isCreatingSegment 
  } = useSegments();
  const [selectedKycStatus, setSelectedKycStatus] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      name: '',
      minInvestment: 0,
      lastActivityDays: 30,
      kycApproved: false,
      kycPending: false,
      kycRejected: false
    }
  });

  const onSubmit = (data: any) => {
    // Transform the form data into the segment filter format
    const kycStatusArray = [];
    if (data.kycApproved) kycStatusArray.push('approved');
    if (data.kycPending) kycStatusArray.push('pending');
    if (data.kycRejected) kycStatusArray.push('rejected');
    
    const segmentData = {
      name: data.name,
      filters: {
        minInvestment: data.minInvestment,
        lastActivityDays: data.lastActivityDays,
        kycStatus: kycStatusArray.length > 0 ? kycStatusArray : undefined
      }
    };
    
    createSegment(segmentData);
    form.reset();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Segments</CardTitle>
            <CardDescription>Create and manage user segments for targeted communications</CardDescription>
          </div>
          <Button variant="outline" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>New Segment</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="segments">
          <TabsList>
            <TabsTrigger value="segments">Segments List</TabsTrigger>
            <TabsTrigger value="create">Create Segment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="segments">
            {isLoadingSegments ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : segments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No segments created</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first segment to target specific user groups.
                </p>
                <Button onClick={() => document.querySelector('[data-value="create"]')?.click()} className="mt-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Segment
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Filter Criteria</TableHead>
                    <TableHead>User Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map((segment: any) => (
                    <TableRow key={segment.id}>
                      <TableCell className="font-medium">{segment.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {segment.filters?.minInvestment && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Min Investment: ${segment.filters.minInvestment}
                            </Badge>
                          )}
                          {segment.filters?.lastActivityDays && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Active in last {segment.filters.lastActivityDays} days
                            </Badge>
                          )}
                          {segment.filters?.kycStatus?.map((status: string) => (
                            <Badge key={status} variant="outline" className="bg-purple-50 text-purple-700">
                              KYC: {status}
                            </Badge>
                          ))}
                          {(!segment.filters || Object.keys(segment.filters).length === 0) && (
                            <span className="text-muted-foreground">All Users</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{segment.userCount || '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteSegment(segment.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter segment name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this user segment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Filter Criteria</h3>
                </div>
                
                <div className="border rounded-md p-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="minInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Minimum Investment</FormLabel>
                          <span className="text-sm font-medium">${field.value}</span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            min={0}
                            max={10000}
                            step={100}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Target users with investments above this amount
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastActivityDays"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Last Activity (Days)</FormLabel>
                          <span className="text-sm font-medium">{field.value} days</span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            min={1}
                            max={180}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Target users who have been active within this time period
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium">KYC Status</h4>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="kycApproved"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Approved</FormLabel>
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
                        name="kycPending"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Pending</FormLabel>
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
                        name="kycRejected"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Rejected</FormLabel>
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
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isCreatingSegment}
                  >
                    Create Segment
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};