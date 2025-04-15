import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, LifeBuoy, MessageSquare } from "lucide-react";

import SupportTickets from "@/components/support/SupportTickets";
import CreateTicket from "@/components/support/CreateTicket";
import FAQSection from "@/components/support/FAQSection";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("tickets");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">Customer Support</h1>
          <p className="text-muted-foreground">
            Get help with your REVA experience. Browse our FAQs or create a support ticket if you need personalized assistance.
          </p>
        </div>
        <div className="w-full md:w-1/2 flex flex-col md:items-end justify-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-muted-foreground">
              <MessageSquare className="h-5 w-5 mr-2" />
              <span>Email: support@reva.ng</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <LifeBuoy className="h-5 w-5 mr-2" />
              <span>Call: +234-8000-REVA</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
          <TabsTrigger value="tickets" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>My Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center">
            <LifeBuoy className="h-4 w-4 mr-2" />
            <span>New Ticket</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span>FAQs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <SupportTickets />
        </TabsContent>

        <TabsContent value="new">
          <CreateTicket onSuccess={() => setActiveTab("tickets")} />
        </TabsContent>

        <TabsContent value="faqs">
          <FAQSection />
        </TabsContent>
      </Tabs>

      <div className="mt-12 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Need More Assistance?</CardTitle>
            <CardDescription>REVA offers multiple ways to connect with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4 border rounded-lg hover:border-primary transition-colors">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Email us anytime for general inquiries or assistance with your investments.
                </p>
                <a href="mailto:support@reva.ng" className="text-primary hover:underline font-medium">
                  support@reva.ng
                </a>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 border rounded-lg hover:border-primary transition-colors">
                <LifeBuoy className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Available Monday - Friday, 9am - 5pm WAT for urgent matters.
                </p>
                <a href="tel:+2348000REVA" className="text-primary hover:underline font-medium">
                  +234-8000-iREVA
                </a>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 border rounded-lg hover:border-primary transition-colors">
                <HelpCircle className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Visit Our Office</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Schedule an appointment to visit our office in Lagos for personalized support.
                </p>
                <address className="text-primary not-italic">
                  <p>iREVA Headquarters</p>
                  <p>Victoria Island, Lagos</p>
                </address>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}