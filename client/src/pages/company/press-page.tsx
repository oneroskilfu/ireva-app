import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PressRelease {
  id: number;
  title: string;
  date: string;
  summary: string;
  imageUrl: string;
  link: string;
}

interface MediaMention {
  id: number;
  title: string;
  date: string;
  outlet: string;
  logoUrl: string;
  link: string;
}

interface PressKit {
  id: number;
  title: string;
  description: string;
  fileType: string;
  downloadUrl: string;
}

export default function PressPage() {
  const pressReleases: PressRelease[] = [
    {
      id: 1,
      title: "iREVA Raises $5M Series A to Expand Real Estate Investment Platform Across Nigeria",
      date: "March 15, 2025",
      summary: "Funding will be used to expand operations to 10 new cities and develop advanced investment tracking features.",
      imageUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "/press/ireva-raises-5m"
    },
    {
      id: 2,
      title: "iREVA Partners with Nigerian Mortgage Refinance Company to Improve Housing Access",
      date: "February 22, 2025",
      summary: "Strategic partnership aims to increase affordable housing investment opportunities for Nigerian investors.",
      imageUrl: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "/press/ireva-nmrc-partnership"
    },
    {
      id: 3,
      title: "iREVA Launches Mobile App for Real-Time Investment Tracking",
      date: "January 10, 2025",
      summary: "New mobile application allows investors to monitor their property investments and returns on-the-go.",
      imageUrl: "https://images.unsplash.com/photo-1586880244406-556ebe35f282?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "/press/ireva-mobile-app-launch"
    }
  ];

  const mediaMentions: MediaMention[] = [
    {
      id: 1,
      title: "How iREVA is Democratizing Property Investment in Nigeria",
      date: "March 20, 2025",
      outlet: "TechCabal",
      logoUrl: "https://via.placeholder.com/150x50",
      link: "https://techcabal.com"
    },
    {
      id: 2,
      title: "The Future of Real Estate Investment in Africa: iREVA Leading the Way",
      date: "February 15, 2025",
      outlet: "Disrupt Africa",
      logoUrl: "https://via.placeholder.com/150x50",
      link: "https://disrupt-africa.com"
    },
    {
      id: 3,
      title: "iREVA's Innovative Approach to Property Crowdfunding",
      date: "January 25, 2025",
      outlet: "BusinessDay",
      logoUrl: "https://via.placeholder.com/150x50",
      link: "https://businessday.ng"
    },
    {
      id: 4,
      title: "Real Estate Tech in Nigeria: iREVA's Growth Story",
      date: "December 10, 2024",
      outlet: "Nairametrics",
      logoUrl: "https://via.placeholder.com/150x50",
      link: "https://nairametrics.com"
    }
  ];

  const pressKits: PressKit[] = [
    {
      id: 1,
      title: "iREVA Brand Assets",
      description: "Logos, color guidelines, and official brand imagery",
      fileType: "ZIP",
      downloadUrl: "/downloads/ireva-brand-assets.zip"
    },
    {
      id: 2,
      title: "Executive Headshots",
      description: "High-resolution photos of iREVA's leadership team",
      fileType: "ZIP",
      downloadUrl: "/downloads/ireva-executive-photos.zip"
    },
    {
      id: 3,
      title: "Company Fact Sheet",
      description: "Key information about iREVA's growth, impact, and operations",
      fileType: "PDF",
      downloadUrl: "/downloads/ireva-fact-sheet.pdf"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Press & Media</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Latest news, announcements, and media resources from iREVA.
              </p>
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Press Releases</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pressReleases.map((release) => (
                <Card key={release.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={release.imageUrl}
                      alt={release.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {release.date}
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{release.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">{release.summary}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="flex items-center gap-1 p-0 text-primary" asChild>
                      <a href={release.link}>
                        Read full release <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline">View All Press Releases</Button>
            </div>
          </div>
        </section>

        {/* Media Mentions */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">iREVA in the News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mediaMentions.map((mention) => (
                <a 
                  key={mention.id} 
                  href={mention.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-6 flex items-center transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex-shrink-0 w-20 h-10 flex items-center justify-center">
                    <img 
                      src={mention.logoUrl} 
                      alt={mention.outlet} 
                      className="max-h-10 max-w-full"
                    />
                  </div>
                  <div className="ml-6 flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{mention.title}</h3>
                    <div className="flex items-center mt-1 text-gray-500 text-sm">
                      <span>{mention.outlet}</span>
                      <span className="mx-2">•</span>
                      <span>{mention.date}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 ml-4" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Press Kit */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Press Kit</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Download official iREVA media resources for press and publication use.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pressKits.map((kit) => (
                <Card key={kit.id} className="transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>{kit.title}</CardTitle>
                    <CardDescription>{kit.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {kit.fileType}
                    </span>
                    <Button asChild>
                      <a href={kit.downloadUrl} download>Download</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Media Contact */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Media Contact</h2>
              <p className="text-white/80 mb-8">
                For press inquiries, interview requests, or additional information, please contact our media relations team.
              </p>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <h3 className="text-xl font-semibold mb-4">Press Office</h3>
                <p className="mb-2"><strong>Email:</strong> press@ireva.ng</p>
                <p className="mb-2"><strong>Phone:</strong> +234 800 123 4567</p>
                <p><strong>Hours:</strong> Monday-Friday, 9am-5pm WAT</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}