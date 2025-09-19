import { storage } from '../storage';

export async function populateSampleData() {
  try {
    console.log('Populating sample donation data...');

    // Sample hospitals with blood banks
    const sampleHospitals = [
      {
        id: 'h1',
        name: 'Apollo Hospital',
        address: 'Jubilee Hills, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        pincode: '500033',
        phone: '+91-40-23607777',
        email: 'info@apollohospital.com',
        specialties: ['Cardiology', 'Neurology', 'Oncology', 'Blood Bank', 'Hematology'],
        rating: 4.8,
        isPartner: true,
        coordinates: { latitude: 17.4239, longitude: 78.4738 },
        operatingHours: [
          { day: 'Monday', open: '00:00', close: '23:59' },
          { day: 'Tuesday', open: '00:00', close: '23:59' },
          { day: 'Wednesday', open: '00:00', close: '23:59' },
          { day: 'Thursday', open: '00:00', close: '23:59' },
          { day: 'Friday', open: '00:00', close: '23:59' },
          { day: 'Saturday', open: '00:00', close: '23:59' },
          { day: 'Sunday', open: '00:00', close: '23:59' }
        ],
        emergencyServices: true
      },
      {
        id: 'h2',
        name: 'Fortis Hospital',
        address: 'Bannerghatta Road, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        pincode: '560076',
        phone: '+91-80-66214444',
        email: 'info@fortishealthcare.com',
        specialties: ['Emergency', 'Critical Care', 'Trauma', 'Blood Bank'],
        rating: 4.6,
        isPartner: true,
        coordinates: { latitude: 12.9082, longitude: 77.6082 },
        operatingHours: [
          { day: 'Monday', open: '00:00', close: '23:59' },
          { day: 'Tuesday', open: '00:00', close: '23:59' },
          { day: 'Wednesday', open: '00:00', close: '23:59' },
          { day: 'Thursday', open: '00:00', close: '23:59' },
          { day: 'Friday', open: '00:00', close: '23:59' },
          { day: 'Saturday', open: '00:00', close: '23:59' },
          { day: 'Sunday', open: '00:00', close: '23:59' }
        ],
        emergencyServices: true
      },
      {
        id: 'h3',
        name: 'Max Healthcare',
        address: 'Saket, New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110017',
        phone: '+91-11-26515050',
        email: 'info@maxhealthcare.com',
        specialties: ['Hematology', 'Blood Bank', 'Emergency', 'Oncology'],
        rating: 4.7,
        isPartner: true,
        coordinates: { latitude: 28.5245, longitude: 77.2066 },
        operatingHours: [
          { day: 'Monday', open: '00:00', close: '23:59' },
          { day: 'Tuesday', open: '00:00', close: '23:59' },
          { day: 'Wednesday', open: '00:00', close: '23:59' },
          { day: 'Thursday', open: '00:00', close: '23:59' },
          { day: 'Friday', open: '00:00', close: '23:59' },
          { day: 'Saturday', open: '00:00', close: '23:59' },
          { day: 'Sunday', open: '00:00', close: '23:59' }
        ],
        emergencyServices: true
      }
    ];

    // Create hospitals
    for (const hospital of sampleHospitals) {
      try {
        await storage.createHospital(hospital);
        console.log(`Created hospital: ${hospital.name}`);
      } catch (error) {
        console.log(`Hospital ${hospital.name} already exists or error:`, error);
      }
    }

    // Get the actual demo user ID from the database
    const demoUser = await storage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      console.log('Demo user not found, skipping donor profile creation');
      return;
    }

    // Sample donor profile for the demo user
    const demoUserDonorProfile = {
      userId: demoUser.id,
      bloodGroup: 'O+' as const,
      isAvailable: true,
      lastDonationDate: new Date('2024-01-15'),
      totalDonations: 2,
      rewardCoins: 175,
      donorType: 'all' as const,
      location: {
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        coordinates: {
          latitude: 17.4065,
          longitude: 78.4772
        }
      },
      medicalEligibility: {
        weight: 65,
        hemoglobin: 13.5,
        lastHealthCheck: new Date('2024-01-01'),
        isEligible: true
      },
      emergencyContact: {
        name: 'Demo Contact',
        phone: '+91-9876543210',
        relation: 'Family'
      },
      registeredAt: new Date('2023-12-01')
    };

    // Create donor profile for demo user
    try {
      await storage.createDonorProfile(demoUserDonorProfile);
      console.log('Created demo user donor profile');
    } catch (error) {
      console.log('Demo user donor profile already exists or error:', error);
    }

    // Sample donation history for demo user
    const sampleDonations = [
      {
        donorId: demoUser.id,
        recipientHospitalId: 'h1',
        donationType: 'blood',
        bloodGroup: 'O+',
        quantity: 450,
        rewardCoins: 100,
        status: 'completed' as const,
        scheduledDate: new Date('2024-01-15'),
        completedDate: new Date('2024-01-15')
      },
      {
        donorId: demoUser.id,
        recipientHospitalId: 'h2',
        donationType: 'plasma',
        bloodGroup: 'O+',
        quantity: 250,
        rewardCoins: 75,
        status: 'completed' as const,
        scheduledDate: new Date('2024-02-20'),
        completedDate: new Date('2024-02-20')
      },
      {
        donorId: demoUser.id,
        recipientHospitalId: 'h3',
        donationType: 'blood',
        bloodGroup: 'O+',
        quantity: 450,
        rewardCoins: 100,
        status: 'scheduled' as const,
        scheduledDate: new Date('2024-12-15')
      }
    ];

    // Create sample donations
    for (const donation of sampleDonations) {
      try {
        await storage.createDonation(donation);
        console.log(`Created donation: ${donation.donationType} - ${donation.status}`);
      } catch (error) {
        console.log('Donation already exists or error:', error);
      }
    }

    // Sample donation requests from hospitals
    const sampleDonationRequests = [
      {
        hospitalId: 'h1',
        bloodGroup: 'O+',
        donationType: 'blood',
        urgencyLevel: 'high',
        unitsNeeded: 10,
        unitsCollected: 3,
        location: {
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
          coordinates: {
            latitude: 17.4239,
            longitude: 78.4738
          }
        },
        patientInfo: {
          age: 45,
          condition: 'Emergency surgery',
          department: 'Emergency',
          ward: 'ICU',
          isEmergency: true
        },
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        contactPerson: {
          name: 'Dr. Rajesh Kumar',
          phone: '+91-40-23607777',
          designation: 'Blood Bank Manager'
        },
        isActive: true
      },
      {
        hospitalId: 'h2',
        bloodGroup: 'A+',
        donationType: 'plasma',
        urgencyLevel: 'medium',
        unitsNeeded: 5,
        unitsCollected: 1,
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560076',
          coordinates: {
            latitude: 12.9082,
            longitude: 77.6082
          }
        },
        patientInfo: {
          age: 32,
          condition: 'Plasma therapy',
          department: 'Hematology',
          isEmergency: false
        },
        validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        contactPerson: {
          name: 'Dr. Priya Sharma',
          phone: '+91-80-66214444',
          designation: 'Hematologist'
        },
        isActive: true
      }
    ];

    // Create sample donation requests
    for (const request of sampleDonationRequests) {
      try {
        await storage.createDonationRequest(request);
        console.log(`Created donation request: ${request.bloodGroup} ${request.donationType} - ${request.urgencyLevel}`);
      } catch (error) {
        console.log('Donation request already exists or error:', error);
      }
    }

    console.log('Sample donation data population completed!');
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
}