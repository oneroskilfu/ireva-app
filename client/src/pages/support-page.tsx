import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import SupportTickets from "@/components/support/SupportTickets";
import CreateTicket from "@/components/support/CreateTicket";
import FAQSection from "@/components/support/FAQSection";
import { Banknote, HelpCircle, MessagesSquare, PanelRightOpen, Phone } from "lucide-react";
import { ProtectedRoute } from "@/lib/protected-route";

const SupportPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tickets");

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Customer Support</h1>
          <p className="text-muted-foreground">
            Get help with your investments, account settings, or technical issues
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Support Channels</CardTitle>
                <CardDescription>
                  Choose how you want to get help
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <MessagesSquare className="h-5 w-5 text-primary" />
                  <span>Live Chat (8am - 8pm)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>Phone: +234-8000-REVA</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Banknote className="h-5 w-5 text-primary" />
                  <span>Investment Support</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <span>General Inquiries</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <PanelRightOpen className="h-5 w-5 text-primary" />
                  <span>Technical Support</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Support Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Monday - Friday:</span>
                  <span className="text-sm font-medium">8am - 8pm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Saturday:</span>
                  <span className="text-sm font-medium">10am - 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sunday:</span>
                  <span className="text-sm font-medium">Closed</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">
            <Tabs
              defaultValue="tickets"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="tickets">My Tickets</TabsTrigger>
                <TabsTrigger value="new">Create Ticket</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
              </TabsList>

              <TabsContent value="tickets" className="space-y-4">
                <SupportTickets />
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                <CreateTicket onSuccess={() => setActiveTab("tickets")} />
              </TabsContent>

              <TabsContent value="faqs" className="space-y-4">
                <FAQSection />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export as protected route
export default function ProtectedSupportPage() {
  return (
    <ProtectedRoute path="/support" component={SupportPage} />
  );
}