import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, MessageSquare, Clock, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Support</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our dedicated support team is ready to assist you with any questions or concerns.
              </p>
            </div>
          </div>
        </section>

        {/* Contact section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Send us a message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                          <Input id="name" placeholder="Your full name" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                          <Input id="email" type="email" placeholder="your.email@example.com" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <Input id="subject" placeholder="How can we help you?" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <Textarea id="message" placeholder="Please describe your issue in detail..." className="h-40" />
                      </div>
                      <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Email Us</h3>
                        <p className="text-gray-600">support@ireva.ng</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Call Us</h3>
                        <p className="text-gray-600">+234 (0) 800 456 7890</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Visit Us</h3>
                        <p className="text-gray-600">
                          15 Admiralty Way<br />
                          Lekki Phase 1<br />
                          Lagos, Nigeria
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Business Hours</h3>
                        <p className="text-gray-600">
                          Monday - Friday: 9am - 5pm<br />
                          Saturday: 10am - 2pm<br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Support Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Live Chat</h3>
                        <p className="text-gray-600">Chat with our support team in real-time</p>
                        <a href="#" className="text-primary text-sm font-medium mt-1 inline-block">Start Chat</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Help Center</h3>
                        <p className="text-gray-600">Browse our knowledge base for answers</p>
                        <a href="/help/faq" className="text-primary text-sm font-medium mt-1 inline-block">Visit Help Center</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}