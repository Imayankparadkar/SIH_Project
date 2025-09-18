import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Heart, Shield, Calculator, FileText, Users, MapPin, CheckCircle } from 'lucide-react';

interface InsurancePolicy {
  id: string;
  name: string;
  type: 'government' | 'private';
  provider: string;
  sumInsured: number;
  premium?: number;
  coverageType: string;
  eligibility: string[];
  keyFeatures: string[];
  waitingPeriod?: string;
  claimSettlementRatio?: number;
  networkHospitals: number;
  description: string;
}

const mockGovernmentSchemes: InsurancePolicy[] = [
  {
    id: 'pmjay-1',
    name: 'Ayushman Bharat PM-JAY',
    type: 'government',
    provider: 'Government of India',
    sumInsured: 500000,
    coverageType: 'Family Floater',
    eligibility: ['SECC 2011 listed families', 'Rural families below poverty line', 'Urban occupational category'],
    keyFeatures: [
      'Cashless treatment at empanelled hospitals',
      'Pre and post hospitalization coverage',
      'No age limit',
      'Coverage for pre-existing conditions'
    ],
    networkHospitals: 25000,
    description: 'World\'s largest health insurance scheme providing coverage of ₹5 lakh per family per year'
  },
  {
    id: 'cghs-1',
    name: 'Central Government Health Scheme',
    type: 'government',
    provider: 'Government of India',
    sumInsured: 1000000,
    coverageType: 'Individual',
    eligibility: ['Central Government employees', 'Pensioners', 'Dependent family members'],
    keyFeatures: [
      'OPD and IPD coverage',
      'Specialist consultation',
      'Diagnostic services',
      'Medicine coverage'
    ],
    networkHospitals: 2000,
    description: 'Comprehensive health care scheme for central government employees and pensioners'
  }
];

const mockPrivatePolicies: InsurancePolicy[] = [
  {
    id: 'hdfc-1',
    name: 'HDFC ERGO Health Suraksha Gold',
    type: 'private',
    provider: 'HDFC ERGO',
    sumInsured: 1000000,
    premium: 12000,
    coverageType: 'Individual',
    eligibility: ['Age 18-65 years', 'Medical screening required'],
    keyFeatures: [
      'Cashless hospitalization',
      'Pre and post hospitalization',
      'Day care procedures',
      'Ambulance coverage'
    ],
    waitingPeriod: '2 years for pre-existing diseases',
    claimSettlementRatio: 96.8,
    networkHospitals: 7200,
    description: 'Comprehensive health insurance with extensive coverage and cashless facilities'
  },
  {
    id: 'star-1',
    name: 'Star Health Red Carpet',
    type: 'private',
    provider: 'Star Health Insurance',
    sumInsured: 2500000,
    premium: 18500,
    coverageType: 'Individual',
    eligibility: ['Age 18-75 years'],
    keyFeatures: [
      'No room rent restriction',
      'Coverage for modern treatments',
      'Health check-up benefits',
      'Emergency ambulance'
    ],
    waitingPeriod: '48 months for pre-existing diseases',
    claimSettlementRatio: 93.2,
    networkHospitals: 9800,
    description: 'Premium health insurance with no room rent restrictions and modern treatment coverage'
  }
];

export function InsuranceHubPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  const allPolicies = [...mockGovernmentSchemes, ...mockPrivatePolicies];
  
  const filteredPolicies = allPolicies.filter(policy => 
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePolicySelection = (policyId: string) => {
    setSelectedPolicies(prev => 
      prev.includes(policyId) 
        ? prev.filter(id => id !== policyId)
        : prev.length < 4 ? [...prev, policyId] : prev
    );
  };

  const PolicyCard = ({ policy }: { policy: InsurancePolicy }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{policy.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{policy.provider}</p>
          </div>
          <Badge variant={policy.type === 'government' ? 'default' : 'secondary'}>
            {policy.type === 'government' ? 'Government' : 'Private'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Sum Insured</p>
            <p className="text-lg font-semibold text-green-600">
              ₹{(policy.sumInsured / 100000).toFixed(1)}L
            </p>
          </div>
          {policy.premium && (
            <div>
              <p className="text-sm font-medium text-gray-700">Annual Premium</p>
              <p className="text-lg font-semibold text-blue-600">₹{policy.premium.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Key Features</p>
          <ul className="text-sm space-y-1">
            {policy.keyFeatures.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {policy.networkHospitals.toLocaleString()} hospitals
          </div>
          {policy.claimSettlementRatio && (
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {policy.claimSettlementRatio}% settlement
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => togglePolicySelection(policy.id)}
            disabled={!selectedPolicies.includes(policy.id) && selectedPolicies.length >= 4}
          >
            {selectedPolicies.includes(policy.id) ? 'Remove' : 'Compare'}
          </Button>
          <Button size="sm" className="flex-1">
            {policy.type === 'government' ? 'Check Eligibility' : 'Get Quote'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const PremiumCalculator = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Premium Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Age</label>
            <Input type="number" placeholder="Your age" />
          </div>
          <div>
            <label className="text-sm font-medium">City</label>
            <Input placeholder="Your city" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Family Members</label>
            <Input type="number" placeholder="Number of members" />
          </div>
          <div>
            <label className="text-sm font-medium">Sum Insured</label>
            <Input placeholder="Desired coverage" />
          </div>
        </div>
        <Button className="w-full">Calculate Premium</Button>
      </CardContent>
    </Card>
  );

  const EligibilityChecker = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Government Scheme Eligibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">SECC/Ration Card Number</label>
          <Input placeholder="Enter your card number" />
        </div>
        <div>
          <label className="text-sm font-medium">State</label>
          <Input placeholder="Your state" />
        </div>
        <div>
          <label className="text-sm font-medium">Annual Family Income</label>
          <Input placeholder="Annual income" />
        </div>
        <Button className="w-full">Check Eligibility</Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Insurance Hub</h1>
            <p className="text-xl mb-8">
              Find the perfect health insurance plan for you and your family
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search insurance policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Policies</TabsTrigger>
            <TabsTrigger value="compare">Compare ({selectedPolicies.length})</TabsTrigger>
            <TabsTrigger value="calculators">Calculators</TabsTrigger>
            <TabsTrigger value="claims">Claims & Support</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Insurance Policies</h2>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Government Schemes */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Government Health Schemes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockGovernmentSchemes
                  .filter(policy => 
                    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(policy => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
              </div>
            </div>

            {/* Private Insurance */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Private Health Insurance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockPrivatePolicies
                  .filter(policy => 
                    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(policy => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Policy Comparison</h2>
              <p className="text-gray-600">Select up to 4 policies to compare</p>
            </div>

            {selectedPolicies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No policies selected</h3>
                  <p className="text-gray-600">Go to Browse Policies and select policies to compare</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-4 text-left">Features</th>
                      {selectedPolicies.map(policyId => {
                        const policy = allPolicies.find(p => p.id === policyId);
                        return (
                          <th key={policyId} className="border border-gray-300 p-4 text-center min-w-48">
                            {policy?.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-4 font-medium">Provider</td>
                      {selectedPolicies.map(policyId => {
                        const policy = allPolicies.find(p => p.id === policyId);
                        return (
                          <td key={policyId} className="border border-gray-300 p-4 text-center">
                            {policy?.provider}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 p-4 font-medium">Sum Insured</td>
                      {selectedPolicies.map(policyId => {
                        const policy = allPolicies.find(p => p.id === policyId);
                        return (
                          <td key={policyId} className="border border-gray-300 p-4 text-center">
                            ₹{policy ? (policy.sumInsured / 100000).toFixed(1) : 0}L
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-4 font-medium">Annual Premium</td>
                      {selectedPolicies.map(policyId => {
                        const policy = allPolicies.find(p => p.id === policyId);
                        return (
                          <td key={policyId} className="border border-gray-300 p-4 text-center">
                            {policy?.premium ? `₹${policy.premium.toLocaleString()}` : 'Free (Govt.)'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calculators" className="space-y-6">
            <h2 className="text-2xl font-bold">Insurance Calculators</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PremiumCalculator />
              <EligibilityChecker />
            </div>
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            <h2 className="text-2xl font-bold">Claims & Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>File a Claim</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Get AI-guided assistance to file your insurance claim quickly and easily.
                  </p>
                  <Button className="w-full">Start Claim Process</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pre-Authorization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Request pre-authorization for cashless treatment at network hospitals.
                  </p>
                  <Button className="w-full">Request Pre-Auth</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Track Claims</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Track the status of your submitted insurance claims in real-time.
                  </p>
                  <Button className="w-full">Track Status</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}