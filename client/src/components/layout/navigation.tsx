import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Heart, Menu, X, Globe, Phone, Users, MessageCircle, Brain, UserPlus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navigation() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - MediBuddy Style */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Stethoscope className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-primary">SehatBuddy</span>
            </div>
          </Link>

          {/* Desktop Navigation - MediBuddy Style Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/doctors" className={`text-gray-700 hover:text-primary font-medium transition-colors ${location.includes('/doctors') ? 'text-primary' : ''}`}>
              Doctors
            </Link>
            <Link href="/medicines" className={`text-gray-700 hover:text-primary font-medium transition-colors ${location.includes('/medicines') ? 'text-primary' : ''}`}>
              Medicines
            </Link>
            <Link href="/vitals" className={`text-gray-700 hover:text-primary font-medium transition-colors ${location.includes('/vitals') ? 'text-primary' : ''}`}>
              Lab Test &amp; Diagnostic
            </Link>
            <Link href="/doctors" className={`text-gray-700 hover:text-primary font-medium transition-colors ${location.includes('/hospitals') ? 'text-primary' : ''}`}>
              Hospitals
            </Link>
            <Link href="/ai-doctor" className={`text-gray-700 hover:text-primary font-medium transition-colors ${location.includes('/ai-doctor') ? 'text-primary' : ''}`}>
              Surgery
            </Link>
            <Link href="/mental-health" className={`text-gray-700 hover:text-primary font-medium transition-colors ${location.includes('/mental-health') ? 'text-primary' : ''}`}>
              Healthcare
            </Link>
          </div>

          {/* Right Side Actions - MediBuddy Style */}
          <div className="flex items-center space-x-4">
            {/* About Us Link */}
            <Link href="#" className="text-gray-700 hover:text-primary font-medium transition-colors hidden md:block">
              About Us
            </Link>

            {/* Auth Buttons / User Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 border-primary text-primary" data-testid="button-profile">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:inline">{user.name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-primary font-medium hover:bg-primary/10" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-medium px-6" data-testid="button-register">
                    Signup
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/doctors" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md">
                Doctors
              </Link>
              <Link href="/medicines" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md">
                Medicines
              </Link>
              <Link href="/vitals" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md">
                Lab Test &amp; Diagnostic
              </Link>
              <Link href="/doctors" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md">
                Hospitals
              </Link>
              <Link href="/ai-doctor" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md">
                Surgery
              </Link>
              <Link href="/mental-health" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md">
                Healthcare
              </Link>
              <Link href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md">
                About Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
