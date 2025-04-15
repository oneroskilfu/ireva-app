import { Building, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-white mr-2" />
              <span className="text-xl font-bold">iREVA</span>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              Access institutional-quality real estate investments with as little as ₦100,000.
            </p>
            <p className="text-gray-300 text-sm mb-4">
              Join thousands of investors building wealth through real estate with iREVA's easy-to-use platform. Your future self will thank you.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/#how-it-works" className="text-gray-300 hover:text-white text-sm">How It Works</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Investment Guide</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Investor Education</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/#about" className="text-gray-300 hover:text-white text-sm">About Us</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Our Team</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Disclosures</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Licenses</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2 md:mt-0">
            Investing involves risks, including loss of principal. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
