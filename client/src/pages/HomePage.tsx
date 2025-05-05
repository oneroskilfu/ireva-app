import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Building,
  DollarSign,
  FileText,
  BarChart2,
  Shield,
  UserCheck,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="relative -mt-6 py-20 md:py-28 px-4 bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Real Estate Investment,{' '}
              <span className="text-primary">Reimagined</span>
            </h1>
            <p className="text-lg text-muted-foreground md:pr-10">
              iREVA makes real estate investing in Africa accessible, transparent, and profitable through fractional ownership and blockchain-secured transactions.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild>
                <Link href="/properties">
                  Browse Properties
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth">
                  Create Account
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Low minimum investment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Secure blockchain escrow</span>
              </div>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden border shadow-lg">
            <img 
              src="/lagos-property.jpg" 
              alt="Lagos Luxury Property" 
              className="w-full h-[350px] object-cover"
              onError={(e) => {
                // Fallback to a color gradient if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.backgroundColor = 'rgb(var(--primary) / 0.1)';
                target.style.display = 'flex';
                target.style.alignItems = 'center';
                target.style.justifyContent = 'center';
                target.alt = 'Property Image';
              }}
            />
            {/* Investment stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Minimum</p>
                  <p className="text-lg font-bold text-primary">$500</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target ROI</p>
                  <p className="text-lg font-bold text-primary">12-15%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Term</p>
                  <p className="text-lg font-bold text-primary">5 Years</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container max-w-6xl py-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Invest with iREVA</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform combines innovative technology with real estate expertise to deliver a seamless investment experience.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Premium Properties</h3>
            <p className="text-muted-foreground">
              Access carefully vetted, high-potential real estate investments across Nigeria's most promising markets.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Consistent Returns</h3>
            <p className="text-muted-foreground">
              Earn regular rental income and benefit from property appreciation through our structured investment model.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enhanced Security</h3>
            <p className="text-muted-foreground">
              All investments are backed by blockchain-based smart contracts and legal documentation for maximum protection.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container max-w-6xl py-10 bg-muted/30 rounded-lg border">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start your real estate investment journey in just a few simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 px-4">
          <div className="relative flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 relative z-10">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Create an Account</h3>
            <p className="text-muted-foreground text-sm">
              Sign up and complete our simple KYC verification process
            </p>
            {/* Connector line */}
            <div className="absolute top-7 left-[calc(50%+35px)] w-[calc(100%-70px)] h-0.5 bg-primary/20 hidden md:block"></div>
          </div>
          <div className="relative flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 relative z-10">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Browse Properties</h3>
            <p className="text-muted-foreground text-sm">
              Explore available properties and select investments that match your goals
            </p>
            {/* Connector line */}
            <div className="absolute top-7 left-[calc(50%+35px)] w-[calc(100%-70px)] h-0.5 bg-primary/20 hidden md:block"></div>
          </div>
          <div className="relative flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 relative z-10">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Invest Securely</h3>
            <p className="text-muted-foreground text-sm">
              Fund your wallet and invest with as little as $500 per property
            </p>
            {/* Connector line */}
            <div className="absolute top-7 left-[calc(50%+35px)] w-[calc(100%-70px)] h-0.5 bg-primary/20 hidden md:block"></div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4">
              <span className="text-xl font-bold">4</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Earn Returns</h3>
            <p className="text-muted-foreground text-sm">
              Receive regular payouts and track your portfolio performance
            </p>
          </div>
        </div>
        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link href="/auth">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="container max-w-6xl py-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Properties</h2>
          <Link href="/properties">
            <Button variant="ghost" className="flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Property Card 1 */}
          <div className="bg-card rounded-lg overflow-hidden border shadow-sm group">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md z-10">
                Featured
              </div>
              <img 
                src="/luxury-apartment.jpg" 
                alt="Luxury Apartment Complex" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback to a color if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.backgroundColor = 'rgb(var(--muted))';
                }}
              />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-1">Luxury Apartment Complex</h3>
              <p className="text-muted-foreground text-sm mb-3">Lagos, Nigeria</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Minimum Investment</p>
                  <p className="font-semibold">$1,000</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected ROI</p>
                  <p className="font-semibold text-primary">12%</p>
                </div>
              </div>
              <Button className="w-full">View Details</Button>
            </div>
          </div>

          {/* Property Card 2 */}
          <div className="bg-card rounded-lg overflow-hidden border shadow-sm group">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/commercial-plaza.jpg" 
                alt="Commercial Plaza" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback to a color if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.backgroundColor = 'rgb(var(--muted))';
                }}
              />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-1">Commercial Plaza</h3>
              <p className="text-muted-foreground text-sm mb-3">Abuja, Nigeria</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Minimum Investment</p>
                  <p className="font-semibold">$2,500</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected ROI</p>
                  <p className="font-semibold text-primary">14%</p>
                </div>
              </div>
              <Button className="w-full">View Details</Button>
            </div>
          </div>

          {/* Property Card 3 */}
          <div className="bg-card rounded-lg overflow-hidden border shadow-sm group">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                New
              </div>
              <img 
                src="/residential-development.jpg" 
                alt="Residential Development" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback to a color if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.backgroundColor = 'rgb(var(--muted))';
                }}
              />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-1">Residential Development</h3>
              <p className="text-muted-foreground text-sm mb-3">Port Harcourt, Nigeria</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Minimum Investment</p>
                  <p className="font-semibold">$800</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected ROI</p>
                  <p className="font-semibold text-primary">10%</p>
                </div>
              </div>
              <Button className="w-full">View Details</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-16 border-y">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Our Investors Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied investors building wealth through real estate
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Oluwaseun A.</p>
                  <p className="text-xs text-muted-foreground">Lagos Investor</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "iREVA has transformed how I invest in real estate. The platform is intuitive, the properties are high-quality, and the returns have exceeded my expectations."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Chioma N.</p>
                  <p className="text-xs text-muted-foreground">First-time Investor</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "As someone new to real estate investing, iREVA made the process simple and transparent. Their customer support team was incredibly helpful throughout my journey."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Emmanuel O.</p>
                  <p className="text-xs text-muted-foreground">Diaspora Investor</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Living abroad, I always wanted to invest in Nigerian real estate but found it challenging. iREVA has bridged that gap with their secure platform and transparent process."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-6xl py-16">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Building Wealth?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join iREVA today and start investing in premium Nigerian real estate with as little as $500.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth">Create Your Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;