import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Health Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Health</h3>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">MediBuddy Gold</Link></li>
              <li><Link href="/doctors" className="text-white/80 hover:text-white transition-colors">Book Medicines</Link></li>
              <li><Link href="/dashboard/vitals" className="text-white/80 hover:text-white transition-colors">Book Lab tests</Link></li>
              <li><Link href="/doctors" className="text-white/80 hover:text-white transition-colors">Book Consultation</Link></li>
              <li><Link href="/donations" className="text-white/80 hover:text-white transition-colors">Surgery Care</Link></li>
              <li><Link href="/mental-health" className="text-white/80 hover:text-white transition-colors">Mental Care</Link></li>
            </ul>
          </div>

          {/* Hospitalization */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hospitalization</h3>
            <ul className="space-y-2">
              <li><Link href="/doctors" className="text-white/80 hover:text-white transition-colors">Cashless Hospitals</Link></li>
              <li><Link href="/dashboard/vitals" className="text-white/80 hover:text-white transition-colors">Download eCard</Link></li>
              <li><Link href="/doctors" className="text-white/80 hover:text-white transition-colors">Claim</Link></li>
              <li><Link href="/donations" className="text-white/80 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ABOUT</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/team" className="text-white/80 hover:text-white transition-colors">Team</Link></li>
              <li><Link href="/careers" className="text-white/80 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/press" className="text-white/80 hover:text-white transition-colors">Press</Link></li>
              <li><Link href="/blog" className="text-white/80 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Our Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Policies</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-white/80 hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/grievance" className="text-white/80 hover:text-white transition-colors">Grievance Redressal</Link></li>
              <li><Link href="/refund" className="text-white/80 hover:text-white transition-colors">Cancellation &amp; Refund Policy</Link></li>
              <li><Link href="/security" className="text-white/80 hover:text-white transition-colors">Security at SehatBuddy</Link></li>
            </ul>
          </div>

          {/* Download App & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">DOWNLOAD APP</h3>
            <div className="space-y-4 mb-8">
              <a href="#" className="inline-block">
                <img src="https://via.placeholder.com/150x45/000000/FFFFFF?text=Download+App" alt="Download on Play Store" className="h-10" />
              </a>
              <a href="#" className="inline-block">
                <img src="https://via.placeholder.com/150x45/000000/FFFFFF?text=App+Store" alt="Download on App Store" className="h-10" />
              </a>
            </div>
            
            <h4 className="text-sm font-medium mb-3">FOLLOW US</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-sm text-white/80">Claims Helpline:</p>
                <p className="font-medium">1800 258 8999</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-sm text-white/80">Senior Citizen Helpline:</p>
                <p className="font-medium">1800 419 8999</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-sm text-white/80">Email:</p>
                <p className="font-medium">support@sehatbuddy.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-sm text-white/80">
            © {new Date().getFullYear()} SehatBuddy Technologies Private Limited. All rights reserved.
          </p>
          <p className="text-xs text-white/60 mt-2">
            All content and information on this website is for informational and educational purposes only and does not constitute medical advice.
          </p>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-orange-500/20"></div>
    </footer>
  );
}