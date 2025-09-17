import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Clock, DollarSign, Video, Phone, MapPin, Filter, Navigation, Calendar, User, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Doctor } from '@/types/user';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance?: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  specialties: string[];
  emergencyServices: boolean;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export function DoctorsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors');

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setIsLocationLoading(false);
        toast({
          title: 'Location detected',
          description: 'Found your location! Showing nearby hospitals.',
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permission.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setIsLocationLoading(false);
        toast({
          title: 'Location Error',
          description: errorMessage,
          variant: 'destructive'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [toast]);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch hospitals data
  const fetchHospitals = async () => {
    try {
      // Sample hospital data from Indore (will be replaced with API call)
      const sampleHospitals: Hospital[] = [
        {
          id: '1',
          name: 'CHL Group of Hospitals',
          address: 'A.B. Road, Near L.I.G Square, Indore, Madhya Pradesh 452008',
          phone: '0731 662 2222',
          rating: 4.1,
          coordinates: { latitude: 22.7196, longitude: 75.8577 },
          specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Care'],
          emergencyServices: true
        },
        {
          id: '2',
          name: 'Jupiter Hospital',
          address: 'Scheme No. 94, Sector 1, Ring Road, Near Teen Imli Square, Indore, Madhya Pradesh 452020',
          phone: '0731 471 8111',
          rating: 4.5,
          coordinates: { latitude: 22.7296, longitude: 75.8677 },
          specialties: ['Multi-specialty', 'Cancer Care', 'Heart Surgery'],
          emergencyServices: true
        },
        {
          id: '3',
          name: 'Apollo Hospitals',
          address: 'Scheme No. 74 C, Sector D, Indore, Madhya Pradesh 452010',
          phone: '0731 244 5566',
          rating: 4.3,
          coordinates: { latitude: 22.7096, longitude: 75.8477 },
          specialties: ['Cardiology', 'Neurosurgery', 'Oncology'],
          emergencyServices: true
        },
        {
          id: '4',
          name: 'Medista Hospital',
          address: '52/a, Khisnpuri Colony, Udhyog Nagar, Musakhedi, Indore, Madhya Pradesh 452020',
          phone: '0731 353 6666',
          rating: 5.0,
          coordinates: { latitude: 22.7396, longitude: 75.8777 },
          specialties: ['Gynecology', 'Orthopedics', 'General Medicine'],
          emergencyServices: false
        }
      ];
      setHospitals(sampleHospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hospitals. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        // Fetch hospital data
        await fetchHospitals();
        
        // Enhanced doctor data with more details
        const mockDoctors: Doctor[] = [
          {
            id: '1',
            name: 'Dr. Priya Sharma',
            specialization: 'Cardiologist',
            qualification: 'MD, DM Cardiology, FESC',
            experience: 15,
            rating: 4.8,
            consultationFee: 800,
            availability: [
              { day: 'Monday', startTime: '09:00', endTime: '17:00' },
              { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
              { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
              { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
              { day: 'Friday', startTime: '09:00', endTime: '17:00' }
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
              { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
              { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
              { day: 'Friday', startTime: '10:00', endTime: '18:00' },
              { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
            ],
            hospitalAffiliation: 'CHL Group of Hospitals',
            languages: ['English', 'Hindi'],
            isOnline: true
          },
          {
            id: '3',
            name: 'Dr. Anjali Patel',
            specialization: 'Endocrinologist',
            qualification: 'MD, DM Endocrinology, MRCP',
            experience: 10,
            rating: 4.9,
            consultationFee: 900,
            availability: [
              { day: 'Tuesday', startTime: '11:00', endTime: '16:00' },
              { day: 'Wednesday', startTime: '11:00', endTime: '16:00' },
              { day: 'Thursday', startTime: '11:00', endTime: '16:00' },
              { day: 'Saturday', startTime: '09:00', endTime: '14:00' }
            ],
            hospitalAffiliation: 'Jupiter Hospital',
            languages: ['English', 'Hindi', 'Gujarati'],
            isOnline: false
          },
          {
            id: '4',
            name: 'Dr. Vikram Singh',
            specialization: 'Orthopedic Surgeon',
            qualification: 'MS Orthopedics, DNB',
            experience: 18,
            rating: 4.7,
            consultationFee: 1200,
            availability: [
              { day: 'Monday', startTime: '14:00', endTime: '18:00' },
              { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
              { day: 'Friday', startTime: '14:00', endTime: '18:00' },
              { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
            ],
            hospitalAffiliation: 'Apollo Hospital',
            languages: ['English', 'Hindi'],
            isOnline: true
          },
          {
            id: '5',
            name: 'Dr. Meera Agarwal',
            specialization: 'Gynecologist',
            qualification: 'MD Obstetrics & Gynecology',
            experience: 14,
            rating: 4.8,
            consultationFee: 700,
            availability: [
              { day: 'Monday', startTime: '09:00', endTime: '13:00' },
              { day: 'Tuesday', startTime: '15:00', endTime: '19:00' },
              { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
              { day: 'Friday', startTime: '15:00', endTime: '19:00' }
            ],
            hospitalAffiliation: 'Medista Hospital',
            languages: ['English', 'Hindi', 'Marathi'],
            isOnline: true
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

  // Update nearby hospitals when user location changes
  useEffect(() => {
    if (userLocation && hospitals.length > 0) {
      const hospitalsWithDistance = hospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          hospital.coordinates.latitude,
          hospital.coordinates.longitude
        )
      }));

      // Sort by distance and get nearest hospitals
      const nearbyHospitalsList = hospitalsWithDistance
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 10);

      setNearbyHospitals(nearbyHospitalsList);
    }
  }, [userLocation, hospitals]);

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
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setIsBookingModalOpen(true);
    }
  };

  const openDirections = (hospital: Hospital) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location access to get directions.",
        variant: "destructive"
      });
      return;
    }

    // OpenStreetMap directions URL
    const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.latitude}%2C${userLocation.longitude}%3B${hospital.coordinates.latitude}%2C${hospital.coordinates.longitude}`;
    window.open(directionsUrl, '_blank');
  };

  const confirmAppointment = async (appointmentData: any) => {
    try {
      // In production, this would call your booking API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${selectedDoctor?.name} has been confirmed.`,
      });
      
      setIsBookingModalOpen(false);
      setSelectedDoctor(null);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to book appointment. Please try again.",
        variant: "destructive"
      });
    }
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-doctors-title">
                Find Your Doctor
              </h1>
              <p className="text-muted-foreground" data-testid="text-doctors-subtitle">
                Connect with qualified healthcare professionals for expert consultation
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button 
                onClick={getUserLocation} 
                disabled={isLocationLoading}
                variant={userLocation ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                <Navigation className={`w-4 h-4 ${isLocationLoading ? 'animate-spin' : ''}`} />
                {isLocationLoading ? 'Getting Location...' : userLocation ? 'Location Found' : 'Get My Location'}
              </Button>
            </div>
          </div>
          
          {/* Location Status */}
          {userLocation && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>Location detected • Showing nearby hospitals and doctors</span>
              {nearbyHospitals.length > 0 && (
                <span className="ml-2 text-green-700 font-medium">
                  {nearbyHospitals.length} hospitals nearby
                </span>
              )}
            </div>
          )}
          
          {locationError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>{locationError}</span>
              <Button 
                onClick={getUserLocation} 
                size="sm" 
                variant="outline" 
                className="ml-auto"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Find Doctors
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Nearby Hospitals
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <TabsContent value="doctors">
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
          </TabsContent>

          <TabsContent value="hospitals">
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  {!userLocation ? (
                    <div className="py-8">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Location Required</h3>
                      <p className="text-muted-foreground mb-4">
                        Enable location access to see nearby hospitals and get directions
                      </p>
                      <Button onClick={getUserLocation} disabled={isLocationLoading}>
                        <Navigation className="w-4 h-4 mr-2" />
                        {isLocationLoading ? 'Getting Location...' : 'Enable Location'}
                      </Button>
                    </div>
                  ) : nearbyHospitals.length === 0 ? (
                    <div className="py-8">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Hospitals Found</h3>
                      <p className="text-muted-foreground">
                        No hospitals found in your area
                      </p>
                    </div>
                  ) : (
                    <div className="text-left">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Hospitals Near You</h3>
                        <Badge variant="secondary">
                          {nearbyHospitals.length} found
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {nearbyHospitals.map((hospital) => (
                          <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base font-medium">{hospital.name}</CardTitle>
                                  <div className="flex items-center mt-1">
                                    {renderRatingStars(hospital.rating)}
                                    <span className="text-sm text-muted-foreground ml-1">({hospital.rating})</span>
                                  </div>
                                </div>
                                {hospital.emergencyServices && (
                                  <Badge variant="destructive" className="text-xs">
                                    Emergency
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span className="line-clamp-2">{hospital.address}</span>
                                </div>
                                {hospital.distance && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    <span>{hospital.distance.toFixed(1)} km away</span>
                                  </div>
                                )}
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="w-4 h-4 mr-2" />
                                  <span>{hospital.phone}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {hospital.specialties.slice(0, 3).map((specialty) => (
                                    <Badge key={specialty} variant="secondary" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="pt-2">
                                  <Button 
                                    onClick={() => openDirections(hospital)}
                                    className="w-full"
                                    size="sm"
                                  >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Get Directions
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results Summary - Only show on doctors tab */}
        {activeTab === 'doctors' && (
          <div className="mb-6">
            <p className="text-muted-foreground" data-testid="text-results-count">
              Found {filteredDoctors.length} doctors
            </p>
          </div>
        )}

        {/* Doctors Grid - Only show on doctors tab */}
        {activeTab === 'doctors' && (
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
        )}

        {/* No Results - Only show on doctors tab */}
        {activeTab === 'doctors' && filteredDoctors.length === 0 && !isLoading && (
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

        {/* Appointment Booking Modal */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book Appointment with {selectedDoctor?.name}
              </DialogTitle>
              <DialogDescription>
                Schedule your consultation with {selectedDoctor?.specialization}
              </DialogDescription>
            </DialogHeader>
            
            {selectedDoctor && (
              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedDoctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.specialization}</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.qualification}</p>
                    <div className="flex items-center mt-1">
                      {renderRatingStars(selectedDoctor.rating)}
                      <span className="text-sm ml-1">({selectedDoctor.rating})</span>
                    </div>
                  </div>
                </div>

                {/* Consultation Type */}
                <div>
                  <h4 className="font-medium mb-3">Select Consultation Type</h4>
                  <Tabs defaultValue="video" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="video" className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video Call
                      </TabsTrigger>
                      <TabsTrigger value="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Call
                      </TabsTrigger>
                      <TabsTrigger value="visit" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Hospital Visit
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="video" className="mt-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Video Consultation</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Connect with the doctor via secure video call from the comfort of your home.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Consultation Fee:</span>
                          <span className="font-medium">₹{selectedDoctor.consultationFee}</span>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="phone" className="mt-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Phone Consultation</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Speak with the doctor over a phone call for quick consultation.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Consultation Fee:</span>
                          <span className="font-medium">₹{Math.round(selectedDoctor.consultationFee * 0.8)}</span>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="visit" className="mt-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Hospital Visit</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Visit the doctor at {selectedDoctor.hospitalAffiliation} for in-person consultation.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Consultation Fee:</span>
                          <span className="font-medium">₹{selectedDoctor.consultationFee}</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Available Slots */}
                <div>
                  <h4 className="font-medium mb-3">Available Time Slots</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedDoctor.availability.map((slot, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        className="p-3 h-auto flex-col"
                        onClick={() => {
                          // Handle slot selection
                        }}
                      >
                        <span className="text-sm font-medium">{slot.day}</span>
                        <span className="text-xs text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsBookingModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => confirmAppointment({})}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
