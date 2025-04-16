import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Users, 
  Target, 
  Lightbulb, 
  HandHeart, 
  BadgeDollarSign, 
  Rocket,
  Building, 
  Globe, 
  Lock
} from "lucide-react";

interface Value {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Benefit {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function CulturePage() {
  const values: Value[] = [
    {
      id: 1,
      title: "Transparency",
      description: "We believe in complete openness with our investors, partners, and team members.",
      icon: <Lock className="h-10 w-10 text-primary" />
    },
    {
      id: 2,
      title: "Innovation",
      description: "We continuously seek new ways to improve real estate investment for Nigerians.",
      icon: <Lightbulb className="h-10 w-10 text-primary" />
    },
    {
      id: 3,
      title: "Excellence",
      description: "We strive for the highest standards in everything we do, from customer service to property selection.",
      icon: <Target className="h-10 w-10 text-primary" />
    },
    {
      id: 4,
      title: "Community",
      description: "We foster a sense of belonging among our investors, creating value beyond financial returns.",
      icon: <Users className="h-10 w-10 text-primary" />
    },
    {
      id: 5,
      title: "Integrity",
      description: "We maintain the highest ethical standards and always act in the best interest of our investors.",
      icon: <HandHeart className="h-10 w-10 text-primary" />
    },
    {
      id: 6,
      title: "Impact",
      description: "We're committed to creating positive economic and social impact across Nigeria through our investments.",
      icon: <Globe className="h-10 w-10 text-primary" />
    }
  ];

  const benefits: Benefit[] = [
    {
      id: 1,
      title: "Flexible Work Environment",
      description: "We offer remote and hybrid work options to help our team maintain work-life balance.",
      icon: <Building className="h-10 w-10 text-white" />
    },
    {
      id: 2,
      title: "Competitive Compensation",
      description: "We provide market-leading salaries and equity options for all team members.",
      icon: <BadgeDollarSign className="h-10 w-10 text-white" />
    },
    {
      id: 3,
      title: "Professional Development",
      description: "We invest in our people through continuous learning, conferences, and mentorship opportunities.",
      icon: <Rocket className="h-10 w-10 text-white" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Culture</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                At iREVA, our culture is built on shared values, innovation, and a commitment to transforming real estate investment in Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  To democratize access to real estate investment opportunities for all Nigerians, 
                  regardless of their financial status, and to foster economic growth through 
                  transparent, secure, and accessible property investments.
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
                <p className="text-lg text-gray-600">
                  To become the leading platform for real estate investment in Africa, 
                  empowering millions to build wealth through property ownership and 
                  contributing to the development of sustainable communities.
                </p>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Team collaboration" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                These core principles guide everything we do at iREVA, from how we select properties to how we interact with our investors.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value) => (
                <div key={value.id} className="bg-white p-8 rounded-xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Work Benefits */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Working at iREVA</h2>
              <p className="text-lg text-white opacity-80 max-w-3xl mx-auto">
                We're building a workplace where talented individuals can thrive, grow, and make a significant impact.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="bg-primary-foreground/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 transition-transform duration-300 hover:scale-105">
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-white opacity-80">{benefit.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="/careers" className="inline-block bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Join Our Team
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}