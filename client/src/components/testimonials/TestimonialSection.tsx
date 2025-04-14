import React from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { StarIcon, QuoteIcon, CheckCircle, Shield, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

// Testimonial data interface
interface Testimonial {
  id: number;
  name: string;
  title: string;
  quote: string;
  avatar?: string;
  rating: number;
  location: string;
  achievement?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Oluwaseun Adebayo",
    title: "Tech Entrepreneur",
    quote: "REVA has transformed my approach to investing. The platform is intuitive, and I've seen remarkable returns on my investments. Their attention to property selection is exceptional.",
    rating: 5,
    location: "Lagos",
    achievement: "12 properties invested"
  },
  {
    id: 2,
    name: "Chioma Okonkwo",
    title: "Financial Analyst",
    quote: "As someone who analyzes investments professionally, I'm impressed with REVA's transparency and detailed analytics. Their diversified portfolio options have helped me build a solid passive income stream.",
    rating: 5,
    location: "Abuja",
    achievement: "₦5.2M in returns"
  },
  {
    id: 3,
    name: "Ibrahim Musa",
    title: "First-time Investor",
    quote: "I never thought property investment could be this accessible. REVA guided me through my first investment with clear tutorials and personalized recommendations. Now I've built a small portfolio I'm proud of.",
    rating: 5,
    location: "Port Harcourt",
    achievement: "Started with just ₦100K"
  }
];

// Beautiful styling for rating stars with animation
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <StarIcon
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
            } drop-shadow-sm`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export function TestimonialSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background elements - decorative geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-xl"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute right-1/4 top-1/3 w-64 h-64 rounded-full bg-yellow-400/5 blur-2xl"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[length:20px_20px] dark:bg-grid-slate-700/[0.05]"></div>
        
        {/* Accent lines */}
        <div className="absolute left-1/4 top-0 w-px h-20 bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute right-1/3 bottom-0 w-px h-40 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
      </div>
      
      <div className="container px-4 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center mb-3 px-3 py-1 border border-primary/20 rounded-full bg-primary/5 text-sm text-primary font-medium">
            <Shield className="w-3 h-3 mr-1" /> Trusted by 10K+ investors
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            What Our Investors Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of satisfied investors who are building wealth through real estate investments with REVA in Nigeria.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30 dark:bg-slate-900/50 backdrop-blur-sm">
                {/* Accent top border with gradient */}
                <div className="h-1 w-full bg-gradient-to-r from-primary via-primary-light to-primary-dark"></div>
                
                <CardContent className="p-8 flex flex-col h-full">
                  {/* Quote icon design accent */}
                  <div className="absolute -right-2 -top-2 text-primary/5 rotate-12 opacity-80">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                    </svg>
                  </div>
                  
                  <div className="mb-5 flex items-center">
                    <RatingStars rating={testimonial.rating} />
                    <span className="ml-2 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                      5.0
                    </span>
                  </div>
                  
                  <blockquote className="text-base leading-relaxed mb-6 flex-grow relative z-10">
                    <p className="font-medium text-slate-700 dark:text-slate-200">"{testimonial.quote}"</p>
                  </blockquote>
                  
                  {/* Achievement badge */}
                  {testimonial.achievement && (
                    <div className="mb-5 py-1 px-3 bg-primary/5 border border-primary/10 rounded-full inline-flex items-center self-start">
                      <CheckCircle className="w-3 h-3 mr-1 text-primary" />
                      <span className="text-xs font-medium text-primary">{testimonial.achievement}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    {/* Avatar with gradient border */}
                    <div className="h-12 w-12 mr-4 rounded-full p-0.5 bg-gradient-to-br from-primary to-primary-light">
                      <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-primary">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-base group-hover:text-primary transition-colors">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <span>{testimonial.title}</span>
                        <span className="mx-1.5 w-1 h-1 rounded-full bg-primary/30"></span>
                        <span>{testimonial.location}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="mt-16 text-center">
          <motion.div 
            className="inline-flex"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <a href="/auth" className="inline-flex items-center text-white font-medium px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-md hover:shadow-lg transition-all duration-300">
              Join Our Community
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}