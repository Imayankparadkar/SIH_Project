import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Clock, DollarSign, Video, Phone, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Doctor } from '@/types/user';

export function DoctorsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        // In production, this would fetch from your API
        // For now, we'll use mock data to demonstrate the interface
        const mockDoctors: Doctor[] = [
          {
            id: '1',
            name: 'Dr. Priya Sharma',
            specialization: 'Cardiologist',
            qualification: 'MD, DM Cardiology',
            experience: 15,
            rating: 4.8,
            consultationFee: 800,
            availability: [
              { day: 'Monday', startTime: '09:00', endTime: '17:00' },
              { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
              { day: 'Wednesday', startTime: '09:00', endTime: '17:00' }
            ],
            hospitalAffiliation: 'Apollo Hospital',
            languages: ['English', 'Hindi', 'Telugu'],
            isOnline: true
          },
          {
            id: '2',
            name: 'Dr. Rajesh Kumar',
            specialization: 'General Physician',
            qualification: 'MBBS, MD Internal Medicine',
            experience: 12,
            rating: 4.6,
            consultationFee: 500,
            availability: [
              { day: 'Monday', startTime: '10:00', endTime: '18:00' },
              { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
              { day: 'Friday', startTime: '10:00', endTime: '18:00' }
            ],
            hospitalAffiliation: 'Fortis Healthcare',
            languages: ['English', 'Hindi'],
            isOnline: true
          },
          {
            id: '3',
            name: 'Dr. Anjali Patel',
            specialization: 'Endocrinologist',
            qualification: 'MD, DM Endocrinology',
            experience: 10,
            rating: 4.9,
            consultationFee: 900,
            availability: [
              { day: 'Tuesday', startTime: '11:00', endTime: '16:00' },
              { day: 'Wednesday', startTime: '11:00', endTime: '16:00' },
              { day: 'Saturday', startTime: '09:00', endTime: '14:00' }
            ],
            hospitalAffiliation: 'Max Healthcare',
            languages: ['English', 'Hindi', 'Gujarati'],
            isOnline: false
          }
        ];

        setDoctors(mockDoctors);
        setFilteredDoctors(mockDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Error",
          description: "Failed to load doctors. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  // Filter doctors based on search and filters
  useEffect(() => {
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.specialization.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      filtered = filtered.filter(doctor => doctor.rating >= minRating);
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchQuery, selectedSpecialty, selectedRating]);

  const specialties = Array.from(new Set(doctors.map(d => d.specialization)));

  const handleBookAppointment = (doctorId: string, type: 'video' | 'phone' | 'visit') => {
    // In production, this would navigate to booking page or open booking modal
    toast({
      title: "Booking initiated",
      description: `${type} consultation booking started. You will be redirected to the booking page.`,
    });
  };

  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-doctors-title">
            Find Your Doctor
          </h1>
          <p className="text-muted-foreground" data-testid="text-doctors-subtitle">
            Connect with qualified healthcare professionals for expert consultation
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search doctors by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-doctors"
                  />
                </div>
              </div>
              
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-specialty">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-full md:w-32" data-testid="select-rating">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground" data-testid="text-results-count">
            Found {filteredDoctors.length} doctors
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow" data-testid={`card-doctor-${doctor.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-doctor-name-${doctor.id}`}>
                      {doctor.name}
                    </CardTitle>
                    <CardDescription data-testid={`text-doctor-specialty-${doctor.id}`}>
                      {doctor.specialization}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    {doctor.isOnline && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                    {doctor.isOnline && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating and Experience */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {renderRatingStars(doctor.rating)}
                    <span className="text-sm font-medium ml-1" data-testid={`text-doctor-rating-${doctor.id}`}>
                      {doctor.rating}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {doctor.experience} years
                  </div>
                </div>

                {/* Qualification and Fee */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground" data-testid={`text-doctor-qualification-${doctor.id}`}>
                    {doctor.qualification}
                  </p>
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-medium">₹{doctor.consultationFee}</span>
                    <span className="text-muted-foreground ml-1">consultation</span>
                  </div>
                </div>

                {/* Hospital and Languages */}
                <div className="space-y-2">
                  {doctor.hospitalAffiliation && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {doctor.hospitalAffiliation}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {doctor.languages.slice(0, 3).map(lang => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Booking Options */}
                <div className="space-y-2 pt-2">
                  <Tabs defaultValue="video" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="video" className="text-xs" data-testid={`tab-video-${doctor.id}`}>
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger value="phone" className="text-xs" data-testid={`tab-phone-${doctor.id}`}>
                        <Phone className="w-3 h-3 mr-1" />
                        Phone
                      </TabsTrigger>
                      <TabsTrigger value="visit" className="text-xs" data-testid={`tab-visit-${doctor.id}`}>
                        <MapPin className="w-3 h-3 mr-1" />
                        Visit
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="video" className="mt-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleBookAppointment(doctor.id, 'video')}
                        data-testid={`button-book-video-${doctor.id}`}
                      >
                        Book Video Call
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="phone" className="mt-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleBookAppointment(doctor.id, 'phone')}
                        data-testid={`button-book-phone-${doctor.id}`}
                      >
                        Book Phone Call
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="visit" className="mt-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleBookAppointment(doctor.id, 'visit')}
                        data-testid={`button-book-visit-${doctor.id}`}
                      >
                        Book Hospital Visit
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2" data-testid="text-no-doctors">
              No doctors found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
