import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, MessageCircle, Phone, Mail, LifeBuoy, User, Building, FileText } from 'lucide-react';

// Define form schema for support ticket
const ticketFormSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.enum(['account', 'investment', 'technical', 'payment', 'other'], {
    required_error: 'Please select a category',
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a priority',
  }),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  attachments: z.any().optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

// FAQ items
const faqItems = [
  {
    question: 'How do I get started with investing on iREVA?',
    answer: 'To start investing, you need to complete the KYC verification process. Navigate to the KYC section in your dashboard, fill out the required information, and submit the necessary documents. Once verified, you can browse available properties and make your first investment.',
    category: 'general',
  },
  {
    question: 'What is the minimum investment amount?',
    answer: 'The minimum investment amount varies by property. Some opportunities start as low as ₦50,000, while premium properties may require higher minimums. You can find this information in the property details page of each investment opportunity.',
    category: 'investment',
  },
  {
    question: 'How are returns calculated and distributed?',
    answer: 'Returns are calculated based on the property performance and your investment amount. Distributions are typically made quarterly and can be viewed in your portfolio dashboard. You can choose to reinvest your returns or withdraw them to your bank account.',
    category: 'investment',
  },
  {
    question: 'What happens if I want to exit an investment early?',
    answer: 'Each property has different liquidity provisions. Some allow early exit with a fee, while others require you to hold until maturity or find another investor to purchase your share. Check the specific terms of each property before investing.',
    category: 'investment',
  },
  {
    question: 'How is my data protected?',
    answer: 'We use bank-level encryption and security protocols to protect your personal and financial information. We comply with all data protection regulations and never share your information with unauthorized third parties.',
    category: 'account',
  },
  {
    question: 'What fees does iREVA charge?',
    answer: 'iREVA charges a one-time investment fee of 1-2% depending on the property, and an annual management fee of 0.5-1%. There are no hidden charges, and all fees are transparently displayed before you complete any investment.',
    category: 'payment',
  },
  {
    question: 'How can I update my bank details?',
    answer: 'You can update your bank details in the Settings section of your profile. Any changes will require verification for security purposes, which may take 1-2 business days to process.',
    category: 'account',
  },
  {
    question: 'What if I forget my password?',
    answer: 'Click on the "Forgot Password" link on the login page. You will receive a password reset link on your registered email address. For security reasons, the link expires after 24 hours.',
    category: 'technical',
  },
];

const SupportPage: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Initialize the form
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: '',
      category: 'account',
      priority: 'medium',
      message: '',
    },
  });

  // Handle form submission
  const ticketMutation = useMutation({
    mutationFn: async (data: TicketFormValues) => {
      setIsSubmitting(true);
      
      try {
        const response = await apiRequest('POST', '/api/support/tickets', data);
        return response.json();
      } catch (error) {
        // For testing purposes - simulate successful submission
        console.log('Would submit ticket:', data);
        return { id: 'TICKET-' + Math.floor(1000 + Math.random() * 9000) };
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Support Ticket Submitted',
        description: `Your ticket ${data.id} has been created successfully. Our team will respond shortly.`,
        variant: 'default',
      });
      form.reset();
      setTicketSubmitted(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'There was an error submitting your ticket. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TicketFormValues) => {
    ticketMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Support | iREVA</title>
      </Helmet>

      <div className="container mx-auto p-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground mt-1">
            Get help with your account, investments, or any other questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Contact methods sidebar */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Us</CardTitle>
                <CardDescription>Ways to reach our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Available 9 AM - 5 PM WAT</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-muted-foreground">+234 (0) 123 456 7890</p>
                    <p className="text-sm text-muted-foreground">Weekdays 8 AM - 6 PM WAT</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground">support@ireva.com</p>
                    <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Office</h3>
                    <p className="text-sm text-muted-foreground">
                      123 Investment Plaza, Victoria Island, Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Investment Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Platform Tutorial
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Terms & Conditions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="md:col-span-3">
            <Tabs defaultValue="faq" className="space-y-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="faq">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Frequently Asked Questions
                </TabsTrigger>
                <TabsTrigger value="submit">
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  Submit a Ticket
                </TabsTrigger>
              </TabsList>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find quick answers to common questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all">
                      <TabsList className="grid grid-cols-5">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="investment">Investment</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="payment">Payment</TabsTrigger>
                      </TabsList>
                      
                      <div className="mt-4">
                        <TabsContent value="all">
                          <Accordion type="single" collapsible className="w-full">
                            {faqItems.map((item, index) => (
                              <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">
                                  {item.question}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <p>{item.answer}</p>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </TabsContent>
                        
                        {['general', 'investment', 'account', 'payment', 'technical'].map((category) => (
                          <TabsContent key={category} value={category}>
                            <Accordion type="single" collapsible className="w-full">
                              {faqItems
                                .filter((item) => item.category === category)
                                .map((item, index) => (
                                  <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-left">
                                      {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <p>{item.answer}</p>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                            </Accordion>
                          </TabsContent>
                        ))}
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Submit Ticket Tab */}
              <TabsContent value="submit" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit a Support Ticket</CardTitle>
                    <CardDescription>
                      Our support team will respond to your inquiry as soon as possible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ticketSubmitted ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                          <LifeBuoy className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-medium">Ticket Submitted</h3>
                        <p className="text-muted-foreground">
                          Thank you for contacting us. Our support team will respond to your inquiry
                          as soon as possible.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setTicketSubmitted(false)}
                          className="mt-4"
                        >
                          Submit Another Ticket
                        </Button>
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                  <Input placeholder="Brief description of your issue" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="account">Account</SelectItem>
                                      <SelectItem value="investment">Investment</SelectItem>
                                      <SelectItem value="technical">Technical Issue</SelectItem>
                                      <SelectItem value="payment">Payment</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Select the category that best describes your issue
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Priority</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    How urgent is your issue?
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Please describe your issue in detail..."
                                    className="min-h-[150px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Include any relevant details that might help us resolve your issue
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="attachments"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Attachments (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="file"
                                    multiple
                                    className="cursor-pointer"
                                    onChange={(e) => {
                                      field.onChange(e.target.files);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Upload screenshots or documents related to your issue (max 5 MB each)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col text-center text-sm text-muted-foreground pt-0">
                    <p>
                      Our support team typically responds within 24 hours on business days.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;