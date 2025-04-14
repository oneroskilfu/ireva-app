import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="bg-primary-dark py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Invest in Real Estate Together
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-300">
            Access high-quality real estate investments with as little as ₦100,000.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-0">
            <div className="sm:inline-flex rounded-md shadow">
              <Link href="#properties">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50">
                  Browse Properties
                </Button>
              </Link>
            </div>
            <div className="sm:ml-3 sm:inline-flex">
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 bg-white/10 text-white hover:bg-white/20">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
