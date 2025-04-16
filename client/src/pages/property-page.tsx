import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyDetails from "@/components/properties/PropertyDetails";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useEffect } from "react";

export default function PropertyPage() {
  const { id } = useParams();
  const { toast } = useToast();
  
  console.log("PropertyPage rendering with ID:", id);
  
  const {
    data: property,
    isLoading,
    error
  } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    // Enable these logs to debug the API call
    onSuccess: (data) => console.log("Property data loaded:", data),
    onError: (err) => console.error("Error loading property:", err)
  });
  
  console.log("Property query state:", { isLoading, error, property });
  
  // Handle error toast with useEffect to avoid toast during render
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Unable to load property details",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col justify-center items-center p-4">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or may have been removed.
          </p>
          <Link href="/">
            <Button>Browse Available Properties</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between mb-6">
            <div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-2">
                  &larr; Back to properties
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{property.name}</h1>
              <p className="text-gray-500">{property.location}</p>
            </div>
          </div>
          
          <PropertyDetails property={property} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
