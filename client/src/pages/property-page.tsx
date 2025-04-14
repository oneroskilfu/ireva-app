import { useParams } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyDetails from "@/components/properties/PropertyDetails";

// This page now just renders our PropertyDetails component
// which handles its own data fetching and UI presentation
export default function PropertyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <PropertyDetails />
      </main>
      <Footer />
    </div>
  );
}
