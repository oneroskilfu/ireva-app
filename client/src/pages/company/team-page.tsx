import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Twitter, Mail } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

export default function TeamPage() {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Frank Ilo",
      role: "Founder & CEO",
      bio: "Frank has over 15 years of experience in real estate development and investment banking. Prior to founding iREVA, he led major development projects across Nigeria and West Africa.",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank&skinColor=black&backgroundColor=b6e3f4",
      socials: {
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
        email: "frank@ireva.ng"
      }
    },
    {
      id: 2,
      name: "Kelechi Iloh",
      role: "Chief Technology Officer",
      bio: "Kelechi is a tech innovator with experience building fintech platforms. He led engineering teams at several successful startups before joining iREVA to lead our technology vision.",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kelechi&skinColor=black&backgroundColor=d1d4f9",
      socials: {
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
        email: "kelechi@ireva.ng"
      }
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Meet Our Team</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The talented people behind iREVA, dedicated to revolutionizing real estate investment in Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* Team members grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex flex-col items-center text-center mb-5">
                      <Avatar className="h-32 w-32 mb-4 bg-transparent">
                        <AvatarImage src={member.imageUrl} className="object-contain p-1" />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                      <p className="text-sm font-medium text-primary">{member.role}</p>
                    </div>
                    <p className="text-gray-600 mb-6">{member.bio}</p>
                    <div className="flex justify-center space-x-4">
                      {member.socials.twitter && (
                        <a href={member.socials.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                          <Twitter size={20} />
                        </a>
                      )}
                      {member.socials.linkedin && (
                        <a href={member.socials.linkedin} className="text-gray-400 hover:text-blue-700 transition-colors">
                          <Linkedin size={20} />
                        </a>
                      )}
                      {member.socials.email && (
                        <a href={`mailto:${member.socials.email}`} className="text-gray-400 hover:text-green-600 transition-colors">
                          <Mail size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join our team section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
              <p className="max-w-2xl mx-auto mb-8">
                We're always looking for talented individuals who are passionate about real estate and technology to join our growing team.
              </p>
              <a href="/careers" className="inline-block bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                View Open Positions
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}