import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Curved Wave Background */}
      <div className="absolute inset-0 bg-medibuddy-gradient">
        <svg
          className="absolute top-0 w-full h-24 -mt-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,96L1200,85.3L1200,120L1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            className="fill-current text-white"
          />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10 pt-24">
        <div className="max-w-7xl mx-auto px-4 py-16 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Health Services Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Health</h3>
              <ul className="space-y-3">
                <li><Link href="/dashboard" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">MediBuddy Gold</Link></li>
                <li><Link href="/medicines" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Book Medicines</Link></li>
                <li><Link href="/vitals" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Book Lab tests</Link></li>
                <li><Link href="/doctors" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Book Consultation</Link></li>
                <li><Link href="/ai-doctor" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">AI Doctor Care</Link></li>
                <li><Link href="/mental-health" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Mental Care</Link></li>
              </ul>
            </div>

            {/* Hospitalization Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Hospitalization</h3>
              <ul className="space-y-3">
                <li><Link href="/doctors" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Cashless Hospitals</Link></li>
                <li><Link href="/dashboard" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Download eCard</Link></li>
                <li><Link href="/dashboard" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Claim</Link></li>
                <li><Link href="/dashboard" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">FAQ</Link></li>
              </ul>
            </div>

            {/* About Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">ABOUT</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Overview</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Team</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Careers</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Press</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Blog</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Contact</Link></li>
              </ul>
            </div>

            {/* Our Policies Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Our Policies</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Terms of Use</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Privacy Policy</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Grievance Redressal</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Cancellation &amp; Refund Policy</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 rounded">Security at MediBuddy</Link></li>
              </ul>
            </div>
          </div>

        {/* Contact Information Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-300 mt-1" />
              <div>
                <p className="text-sm text-gray-300">Claims Helpline:</p>
                <p className="font-medium text-white">1800 258 8999</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-300 mt-1" />
              <div>
                <p className="text-sm text-gray-300">Senior Citizen Helpline:</p>
                <p className="font-medium text-white">1800 419 8999</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-300 mt-1" />
              <div>
                <p className="text-sm text-gray-300">Email:</p>
                <p className="font-medium text-white">support@medibuddy.in</p>
              </div>
            </div>
          </div>

          {/* Social Media and App Download */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300 mr-4">FOLLOW US</span>
              <a href="https://facebook.com/medibuddy" aria-label="Follow on Facebook" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/medibuddy" aria-label="Follow on Twitter" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/medibuddy" aria-label="Follow on Instagram" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/medibuddy" aria-label="Watch on YouTube" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2">
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* App Download Section */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-300 mb-3">DOWNLOAD APP</p>
              <div className="space-y-2">
                <a href="https://play.google.com/store" className="block bg-white/20 rounded px-3 py-2 text-xs text-white hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2">
                  Get it on Play Store
                </a>
                <a href="https://apps.apple.com" className="block bg-white/20 rounded px-3 py-2 text-xs text-white hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2">
                  Download on App Store
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} MediBuddy Technologies Private Limited. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            All content and information on this website is for informational and educational purposes only and does not constitute medical advice.
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}