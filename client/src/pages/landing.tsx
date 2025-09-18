import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Stethoscope, Pill, Calendar, TestTube, Scissors, HeartHandshake, Search, ArrowRight, Star, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function LandingPage() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Stethoscope,
      title: 'Talk to Doctor',
      description: 'Consult with top doctors anytime',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: Pill,
      title: 'Medicines',
      description: 'Order medicines online',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: Calendar,
      title: 'Book Dr. Appointment',
      description: 'Book appointments easily',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: TestTube,
      title: 'Lab Test & Diagnostic',
      description: 'Book lab tests at home',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: Scissors,
      title: 'Surgery',
      description: 'Plan your surgery',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: HeartHandshake,
      title: 'Healthcare',
      description: 'Comprehensive care plans',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - MediBuddy Style */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main Headline and CTA */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Consult with Top Doctors Online, <span className="text-blue-600">24x7</span>
            </h1>
            <div className="mb-8">
              <Link href="/doctors">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg">
                  Start Consultation <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Section */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Search for your nearest <span className="text-blue-600">Doctor</span> to plan and avail a cashless hospitalization
            </h2>
            <div className="max-w-2xl mx-auto mt-8">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search your area, pincode, street name..."
                    className="pl-10 h-14 text-lg border-2 border-gray-200 focus:border-blue-600 rounded-lg"
                  />
                </div>
                <Button className="h-14 px-8 bg-gray-400 hover:bg-gray-500 text-white rounded-lg" onClick={() => alert('Location feature coming soon!')}>
                  Use current location
                </Button>
              </div>
            </div>
          </div>

          {/* Services Grid - MediBuddy Style */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link key={index} href={index === 0 ? "/doctors" : index === 1 ? "/medicines" : index === 2 ? "/doctors" : index === 3 ? "/vitals" : index === 4 ? "/ai-doctor" : "/mental-health"}>
                  <div className={`${service.bgColor} p-6 rounded-xl text-center cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100`}>
                    <div className="flex justify-center mb-4">
                      <div className={`w-16 h-16 ${service.color} bg-white rounded-full flex items-center justify-center shadow-sm`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-gradient-to-r from-orange-100 to-yellow-100 py-8 px-4 mx-4 rounded-2xl mb-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <TestTube className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Test Early. Stay Ahead. Get tested for COVID-19</h3>
              <p className="text-gray-600">Book now and get tested at your doorstep</p>
            </div>
          </div>
          <Link href="/vitals">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Book Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Consultation Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Consult with Top Doctors Online, 24x7
          </h2>
          <p className="text-lg text-gray-600 mb-8">Start Consultation</p>
          
          <div className="flex justify-center mb-12">
            <Link href="/doctors">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Start Consultation <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Your privacy is protected</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">24x7 Available</h3>
              <p className="text-gray-600">Consult anytime, anywhere</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Top Doctors</h3>
              <p className="text-gray-600">Verified & experienced</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Trusted by Millions</h3>
              <p className="text-gray-600">Over 10M+ consultations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Section - Exact MediBuddy Style */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Insurance</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Get access to all your Health insurance services - View Policy, Initiate and Track Claims, 
              Go Cashless with network hospitals and intimate Hospitalization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* E-Card */}
            <Link href="/dashboard">
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-100 hover:border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      EC
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">E-Card</h3>
                  <p className="text-gray-600 text-sm">Get e-cards for you and your family members</p>
                </div>
              </Card>
            </Link>

            {/* Claims */}
            <Link href="/dashboard">
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-100 hover:border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      CL
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Claims</h3>
                  <p className="text-gray-600 text-sm">Track your claims in real-time</p>
                </div>
              </Card>
            </Link>

            {/* Network Hospitals */}
            <Link href="/doctors">
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-100 hover:border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      NH
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Network Hospitals</h3>
                  <p className="text-gray-600 text-sm">Search for the nearest Network hospital to go cashless</p>
                </div>
              </Card>
            </Link>

            {/* Empanel Hospitals */}
            <Link href="/doctors">
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-100 hover:border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      EH
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Empanel Hospitals</h3>
                  <p className="text-gray-600 text-sm">Become a part of Network Hospitals</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">Join millions of users who trust MediBuddy for their healthcare needs</p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/doctors">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
                Find Doctors
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
