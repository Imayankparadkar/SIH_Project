import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Health Services Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Health</h3>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">MediBuddy Gold</Link></li>
              <li><Link href="/medicines" className="text-gray-300 hover:text-white transition-colors text-sm">Book Medicines</Link></li>
              <li><Link href="/vitals" className="text-gray-300 hover:text-white transition-colors text-sm">Book Lab tests</Link></li>
              <li><Link href="/doctors" className="text-gray-300 hover:text-white transition-colors text-sm">Book Consultation</Link></li>
              <li><Link href="/ai-doctor" className="text-gray-300 hover:text-white transition-colors text-sm">Surgery Care</Link></li>
              <li><Link href="/mental-health" className="text-gray-300 hover:text-white transition-colors text-sm">Mental Care</Link></li>
            </ul>
          </div>

          {/* Hospitalization Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Hospitalization</h3>
            <ul className="space-y-3">
              <li><Link href="/doctors" className="text-gray-300 hover:text-white transition-colors text-sm">Cashless Hospitals</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Download eCard</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Claim</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">FAQ</Link></li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6">ABOUT</h3>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Overview</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Team</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Careers</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Press</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Blog</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Our Policies Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Policies</h3>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Terms of Use</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Grievance Redressal</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Cancellation &amp; Refund Policy</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Security at MediBuddy</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border-t border-blue-700 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-400">Claims Helpline:</p>
                <p className="font-medium text-white">1800 258 8999</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-400">Senior Citizen Helpline:</p>
                <p className="font-medium text-white">1800 419 8999</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-400">Email:</p>
                <p className="font-medium text-white">support@medibuddy.in</p>
              </div>
            </div>
          </div>

          {/* Social Media and App Download */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 mr-4">FOLLOW US</span>
              <a href="https://facebook.com/medibuddy" className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/medibuddy" className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/medibuddy" className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/medibuddy" className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* App Download Section */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400 mb-3">DOWNLOAD APP</p>
              <div className="space-y-2">
                <a href="https://play.google.com/store" className="block bg-blue-700 rounded px-3 py-2 text-xs text-white hover:bg-blue-600 transition-colors">
                  Get it on Play Store
                </a>
                <a href="https://apps.apple.com" className="block bg-blue-700 rounded px-3 py-2 text-xs text-white hover:bg-blue-600 transition-colors">
                  Download on App Store
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-blue-700 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} MediBuddy Technologies Private Limited. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            All content and information on this website is for informational and educational purposes only and does not constitute medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}