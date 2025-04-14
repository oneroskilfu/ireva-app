import React from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { StarIcon } from "lucide-react";

// Testimonial data interface
interface Testimonial {
  id: number;
  name: string;
  title: string;
  quote: string;
  avatar?: string;
  rating: number;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Oluwaseun Adebayo",
    title: "Tech Entrepreneur",
    quote: "REVA has transformed my approach to investing. The platform is intuitive, and I've seen remarkable returns on my investments. Their attention to property selection is exceptional.",
    rating: 5,
    location: "Lagos"
  },
  {
    id: 2,
    name: "Chioma Okonkwo",
    title: "Financial Analyst",
    quote: "As someone who analyzes investments professionally, I'm impressed with REVA's transparency and detailed analytics. Their diversified portfolio options have helped me build a solid passive income stream.",
    rating: 5,
    location: "Abuja"
  },
  {
    id: 3,
    name: "Ibrahim Musa",
    title: "First-time Investor",
    quote: "I never thought property investment could be this accessible. REVA guided me through my first investment with clear tutorials and personalized recommendations. Now I've built a small portfolio I'm proud of.",
    rating: 5,
    location: "Port Harcourt"
  }
];

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export function TestimonialSection() {
  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">What Our Investors Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied investors who are building wealth through real estate investments with REVA.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-4">
                  <RatingStars rating={testimonial.rating} />
                </div>
                
                <blockquote className="text-sm mb-6 flex-grow">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center mt-auto">
                  <div className="h-10 w-10 mr-3 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.title}, {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}