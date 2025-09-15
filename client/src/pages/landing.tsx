import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Heart, Brain, UserCheck, Phone, HandHeart, Shield, Award, Wifi, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Heart,
      title: t('feature_monitoring_title'),
      description: t('feature_monitoring_desc'),
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Brain,
      title: t('feature_ai_title'),
      description: t('feature_ai_desc'),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: UserCheck,
      title: t('feature_doctor_title'),
      description: t('feature_doctor_desc'),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Phone,
      title: t('feature_emergency_title'),
      description: t('feature_emergency_desc'),
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: HandHeart,
      title: t('feature_donation_title'),
      description: t('feature_donation_desc'),
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Shield,
      title: t('feature_insurance_title'),
      description: t('feature_insurance_desc'),
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const complianceFeatures = [
    {
      icon: Award,
      title: t('compliance_medical_grade'),
      description: t('compliance_medical_desc'),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Shield,
      title: t('compliance_data_security'),
      description: t('compliance_data_desc'),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Wifi,
      title: t('compliance_offline_mode'),
      description: t('compliance_offline_desc'),
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
                {t('hero_title')}
                <div className="text-2xl md:text-3xl font-normal mt-2 opacity-90">
                  {t('hero_subtitle')}
                </div>
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90" data-testid="text-hero-description">
                {t('hero_description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all"
                    data-testid="button-get-started"
                  >
                    {t('get_started')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary transition-all"
                  data-testid="button-watch-demo"
                >
                  {t('watch_demo')}
                </Button>
              </div>
            </div>
            
            {/* Health Dashboard Mockup */}
            <div className="relative">
              <div className="relative mx-auto w-80 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-purple-600 h-20 flex items-center justify-center text-white font-semibold">
                    <Heart className="mr-2 animate-pulse" />
                    Health Dashboard
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-red-600 text-xs font-medium">Heart Rate</div>
                        <div className="text-red-700 text-xl font-bold">72 BPM</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-blue-600 text-xs font-medium">SpO₂</div>
                        <div className="text-blue-700 text-xl font-bold">98%</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-green-600 text-xs font-medium">BP</div>
                        <div className="text-green-700 text-xl font-bold">120/80</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-orange-600 text-xs font-medium">Temp</div>
                        <div className="text-orange-700 text-xl font-bold">98.6°F</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-600 text-sm font-medium mb-2">Today's Activity</div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-3/4"></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">8,420 steps</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background" data-testid="section-features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-features-title">
              {t('features_title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-subtitle">
              {t('features_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3" data-testid={`text-feature-title-${index}`}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 bg-muted" data-testid="section-compliance">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-compliance-title">
              {t('compliance_title')}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-compliance-subtitle">
              {t('compliance_subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {complianceFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center" data-testid={`compliance-feature-${index}`}>
                  <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" data-testid={`text-compliance-feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground" data-testid={`text-compliance-feature-description-${index}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white" data-testid="section-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-cta-title">
            {t('cta_title')}
          </h2>
          <p className="text-xl mb-8 opacity-90" data-testid="text-cta-subtitle">
            {t('cta_subtitle')}
          </p>
          <Link href="/register">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all"
              data-testid="button-register-now"
            >
              {t('register_now')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div data-testid="trust-indicator-users">
              <div className="text-2xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div data-testid="trust-indicator-doctors">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Partner Doctors</div>
            </div>
            <div data-testid="trust-indicator-hospitals">
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Network Hospitals</div>
            </div>
            <div data-testid="trust-indicator-uptime">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
