import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Gradient Background - Purple to Orange */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500">
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-16 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Health Services Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Health</h3>
              <ul className="space-y-3">
                <li><Link href="/doctors" className="text-gray-100 hover:text-white transition-colors text-sm">MediBuddy Gold</Link></li>
                <li><Link href="/medicines" className="text-gray-100 hover:text-white transition-colors text-sm">Book Medicines</Link></li>
                <li><Link href="/doctors" className="text-gray-100 hover:text-white transition-colors text-sm">Doctor Consultation</Link></li>
                <li><Link href="/vitals" className="text-gray-100 hover:text-white transition-colors text-sm">Book a Lab test</Link></li>
                <li><Link href="/mental-health" className="text-gray-100 hover:text-white transition-colors text-sm">Covid Essentials Items</Link></li>
                <li><Link href="/ai-doctor" className="text-gray-100 hover:text-white transition-colors text-sm">Surgery Care</Link></li>
                <li><Link href="/doctors" className="text-gray-100 hover:text-white transition-colors text-sm">Dental</Link></li>
                <li><Link href="/ai-doctor" className="text-gray-100 hover:text-white transition-colors text-sm">Cancer Care</Link></li>
                <li><Link href="/doctors" className="text-gray-100 hover:text-white transition-colors text-sm">Partner with MediBuddy</Link></li>
              </ul>
            </div>

            {/* Hospitalization Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Hospitalization</h3>
              <ul className="space-y-3">
                <li><Link href="/doctors" className="text-gray-100 hover:text-white transition-colors text-sm">Locate hospital</Link></li>
                <li><Link href="/dashboard" className="text-gray-100 hover:text-white transition-colors text-sm">Download eCard</Link></li>
                <li><Link href="/dashboard" className="text-gray-100 hover:text-white transition-colors text-sm">Track claim</Link></li>
                <li><Link href="/dashboard" className="text-gray-100 hover:text-white transition-colors text-sm">FAQs</Link></li>
              </ul>
            </div>

            {/* About Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">ABOUT</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Overview</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Tailored Corporate Plans</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Testimonials</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Contact</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Blog</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Careers</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Security</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Medical Value Travel Facilitator</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">MediBuddy Beliefs</Link></li>
              </ul>
            </div>

            {/* Our Policies Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Our Policies</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Terms of Use</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Grievance Redressal</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Cancellation & Refund Policy</Link></li>
                <li><Link href="/" className="text-gray-100 hover:text-white transition-colors text-sm">Security at MediBuddy</Link></li>
              </ul>
            </div>

            {/* Download App Column */}
            <div>
              <h3 className="text-lg font-semibold mb-6">DOWNLOAD APP</h3>
              <div className="space-y-4">
                {/* App Store Buttons */}
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="block">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2 hover:bg-white/30 transition-colors">
                    <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-xs text-black font-bold">GP</span>
                    </div>
                    <span className="text-xs text-white">Google Play</span>
                  </div>
                </a>
                <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="block">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2 hover:bg-white/30 transition-colors">
                    <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-xs text-black font-bold">AS</span>
                    </div>
                    <span className="text-xs text-white">App Store</span>
                  </div>
                </a>
              </div>
              
              {/* Follow Us Section */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold mb-4">FOLLOW US</h4>
                <div className="flex items-center space-x-3">
                  <a href="https://facebook.com/medibuddy" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="https://linkedin.com/company/medibuddy" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://twitter.com/medibuddy" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com/medibuddy" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} MediBuddy Technologies Private Limited. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}