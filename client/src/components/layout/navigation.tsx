import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Heart, Menu, X, Globe, Phone, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Navigation() {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleEmergency = () => {
    // TODO: Implement emergency call functionality
    if (confirm(t('emergency_description'))) {
      // Call emergency services or show emergency modal
      window.open('tel:108', '_self');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="text-white w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xl font-bold text-foreground">{t('app_name')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-muted-foreground hover:text-primary transition-colors ${location === '/' ? 'text-primary font-medium' : ''}`}>
              {t('nav_home')}
            </Link>
            {user && (
              <Link href="/dashboard" className={`text-muted-foreground hover:text-primary transition-colors ${location === '/dashboard' ? 'text-primary font-medium' : ''}`}>
                {t('dashboard')}
              </Link>
            )}
            <Link href="/doctors" className={`text-muted-foreground hover:text-primary transition-colors ${location === '/doctors' ? 'text-primary font-medium' : ''}`}>
              {t('nav_doctors')}
            </Link>
            <Link href="/donations" className={`text-muted-foreground hover:text-primary transition-colors ${location === '/donations' ? 'text-primary font-medium' : ''}`}>
              {t('nav_donations')}
            </Link>
            <Link href="/student-support" className={`text-muted-foreground hover:text-primary transition-colors ${location === '/student-support' ? 'text-primary font-medium' : ''}`}>
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Student Support
            </Link>
            <Link href="/become-mentor" className={`text-muted-foreground hover:text-primary transition-colors ${location === '/become-mentor' ? 'text-primary font-medium' : ''}`}>
              <Users className="w-4 h-4 inline mr-1" />
              Become a Mentor
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
                <SelectItem value="te">తెలుగు</SelectItem>
                <SelectItem value="bn">বাংলা</SelectItem>
              </SelectContent>
            </Select>

            {/* Emergency SOS */}
            <Button 
              onClick={handleEmergency}
              variant="destructive" 
              size="sm"
              className="animate-pulse"
              data-testid="button-emergency"
            >
              <Phone className="w-4 h-4 mr-2" />
              {t('emergency_sos')}
            </Button>

            {/* Auth Buttons / User Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2" data-testid="button-profile">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:inline">{user.displayName || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">{t('profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login">{t('login')}</Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-register">{t('register')}</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="py-2 text-muted-foreground hover:text-primary">
                {t('nav_home')}
              </Link>
              {user && (
                <Link href="/dashboard" className="py-2 text-muted-foreground hover:text-primary">
                  {t('dashboard')}
                </Link>
              )}
              <Link href="/doctors" className="py-2 text-muted-foreground hover:text-primary">
                {t('nav_doctors')}
              </Link>
              <Link href="/donations" className="py-2 text-muted-foreground hover:text-primary">
                {t('nav_donations')}
              </Link>
              <Link href="/student-support" className="py-2 text-muted-foreground hover:text-primary flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Student Support
              </Link>
              <Link href="/become-mentor" className="py-2 text-muted-foreground hover:text-primary flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Become a Mentor
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
