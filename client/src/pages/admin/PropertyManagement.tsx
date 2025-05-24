import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import PropertyManagementComponent from '../../components/admin/PropertyManagement';
// Import directly from JSX file since it's not a TypeScript component
import AdminLayout from '../../components/admin/AdminLayout.jsx';

/**
 * Property Management Page for Admin Dashboard
 * Provides a dedicated page for the property management functionality
 */
const PropertyManagement = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <Suspense fallback={<PropertyLoadingState />}>
          <PropertyManagementComponent />
        </Suspense>
      </div>
    </AdminLayout>
  );
};

// Loading state component
const PropertyLoadingState = () => (
  <div className="flex items-center justify-center h-96">
    <div className="flex flex-col items-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium">Loading property management...</p>
    </div>
  </div>
);

export default PropertyManagement;