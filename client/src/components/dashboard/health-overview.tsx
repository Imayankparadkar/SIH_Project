import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHealthData } from '@/hooks/use-health-data';
import { useAuth } from '@/hooks/use-auth';
import { mockHealthService, MockVitalSigns } from '@/services/mock-health-data';
import { 
  Heart, 
  Activity, 
  Target, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Bell,
  Share2,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Medal,
  ArrowRight,
  Phone,
  Stethoscope,
  FileText,
  BarChart3,
  Thermometer,
  Droplets,
  Moon,
  Footprints,
  Battery,
  Shield,
  Sparkles,
  Brain,
  TimerReset,
  Flame
} from 'lucide-react';

interface HealthGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  type: 'steps' | 'weight' | 'blood_pressure' | 'heart_rate' | 'sleep';
  status: 'on_track' | 'behind' | 'achieved';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: Date;
  category: 'health' | 'activity' | 'consistency' | 'improvement';
  icon: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
}

export function HealthOverview() {
  const { t } = useTranslation();
  const { currentVitals, analysis, isLoading, error, refreshAnalysis } = useHealthData();
  const { user, userProfile } = useAuth();
  const [healthScore, setHealthScore] = useState(0);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [mockVitals, setMockVitals] = useState<MockVitalSigns | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  // Set up mock data service and real-time updates
  useEffect(() => {
    // Start mock data service
    mockHealthService.startRealTimeUpdates(10000); // Update every 10 seconds
    
    const unsubscribe = mockHealthService.subscribe((data: MockVitalSigns) => {
      setMockVitals(data);
      const score = mockHealthService.calculateHealthScore(data);
      setHealthScore(score);
    });

    return () => {
      unsubscribe();
      mockHealthService.stopRealTimeUpdates();
    };
  }, []);

  // Calculate health score based on vitals (fallback if no mock data)
  useEffect(() => {
    if (currentVitals && !mockVitals) {
      let score = 0;
      const weights = { heartRate: 0.25, bloodPressure: 0.30, oxygen: 0.25, temperature: 0.20 };
      
      // Heart rate scoring (60-100 BPM is optimal)
      if (currentVitals.heartRate >= 60 && currentVitals.heartRate <= 100) {
        score += 100 * weights.heartRate;
      } else if (currentVitals.heartRate >= 50 && currentVitals.heartRate <= 120) {
        score += 70 * weights.heartRate;
      } else {
        score += 40 * weights.heartRate;
      }

      // Blood pressure scoring (120/80 or lower is optimal)
      if (currentVitals.bloodPressureSystolic <= 120 && currentVitals.bloodPressureDiastolic <= 80) {
        score += 100 * weights.bloodPressure;
      } else if (currentVitals.bloodPressureSystolic <= 140 && currentVitals.bloodPressureDiastolic <= 90) {
        score += 70 * weights.bloodPressure;
      } else {
        score += 40 * weights.bloodPressure;
      }

      // Oxygen saturation scoring (95% or higher is optimal)
      if (currentVitals.oxygenSaturation >= 95) {
        score += 100 * weights.oxygen;
      } else if (currentVitals.oxygenSaturation >= 90) {
        score += 70 * weights.oxygen;
      } else {
        score += 40 * weights.oxygen;
      }

      // Temperature scoring (97-99.5°F is optimal)
      if (currentVitals.bodyTemperature >= 97 && currentVitals.bodyTemperature <= 99.5) {
        score += 100 * weights.temperature;
      } else {
        score += 60 * weights.temperature;
      }

      setHealthScore(Math.round(score));
    }
  }, [currentVitals, mockVitals]);

  // Initialize sample goals and achievements
  useEffect(() => {
    setGoals([
      {
        id: '1',
        title: 'Daily Steps',
        target: 10000,
        current: 7500,
        unit: 'steps',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'steps',
        status: 'behind'
      },
      {
        id: '2',
        title: 'Target Heart Rate',
        target: 80,
        current: mockVitals?.heartRate || currentVitals?.heartRate || 75,
        unit: 'BPM',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: 'heart_rate',
        status: 'on_track'
      },
      {
        id: '3',
        title: 'Sleep Hours',
        target: 8,
        current: 6.5,
        unit: 'hours',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'sleep',
        status: 'behind'
      }
    ]);

    setAchievements([
      {
        id: '1',
        title: 'Health Guardian',
        description: '7 days of consistent vital monitoring',
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        category: 'consistency',
        icon: '🛡️'
      },
      {
        id: '2',
        title: 'Step Master',
        description: 'Reached 10,000 steps for 5 consecutive days',
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        category: 'activity',
        icon: '👟'
      },
      {
        id: '3',
        title: 'Blood Pressure Optimizer',
        description: 'Maintained optimal blood pressure for 2 weeks',
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        category: 'health',
        icon: '💙'
      }
    ]);
  }, [currentVitals, mockVitals]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Force new mock data generation
    mockHealthService.stopRealTimeUpdates();
    mockHealthService.startRealTimeUpdates(10000);
    
    // Also refresh real analysis if available
    if (refreshAnalysis) {
      await refreshAnalysis();
    }
    
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'emergency',
      title: 'Emergency SOS',
      description: 'Instant emergency alert',
      icon: <Phone className="w-5 h-5" />,
      action: () => {
        console.log('Emergency SOS triggered');
        // This would typically open an emergency modal
        alert('Emergency SOS activated! This would contact emergency services in a real implementation.');
      },
      priority: 'high'
    },
    {
      id: 'doctor',
      title: 'Consult Doctor',
      description: 'Book appointment or consultation',
      icon: <Stethoscope className="w-5 h-5" />,
      action: () => {
        console.log('Navigating to doctors page');
        // This would typically navigate to the doctors page
        window.location.href = '/doctors';
      },
      priority: 'high'
    },
    {
      id: 'report',
      title: 'Generate Report',
      description: 'Create health summary',
      icon: <FileText className="w-5 h-5" />,
      action: () => {
        console.log('Generating health report');
        // This would typically generate and download a report
        alert('Health report generation started! This would create a comprehensive health summary in a real implementation.');
      },
      priority: 'medium'
    },
    {
      id: 'analysis',
      title: 'AI Analysis',
      description: 'Get health insights',
      icon: <Brain className="w-5 h-5" />,
      action: () => {
        console.log('Triggering AI analysis');
        if (refreshAnalysis) {
          refreshAnalysis();
        } else {
          alert('AI analysis requested! New insights would be generated based on your current health data.');
        }
      },
      priority: 'medium'
    }
  ];

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-green-100 text-green-800';
      case 'on_track': return 'bg-blue-100 text-blue-800';
      case 'behind': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Health Overview
              </CardTitle>
              <CardDescription>
                Your comprehensive health status and insights
              </CardDescription>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Health Score */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getHealthScoreColor(healthScore)}`}>
                      <span className="text-2xl font-bold">{healthScore}</span>
                    </div>
                    <h3 className="font-semibold text-sm">Health Score</h3>
                    <p className="text-xs text-muted-foreground">Overall health rating</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-sm">{mockVitals?.heartRate || currentVitals?.heartRate || '--'} BPM</h3>
                    <p className="text-xs text-muted-foreground">Current heart rate</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-sm">
                      {mockVitals || currentVitals ? 
                        `${mockVitals?.bloodPressureSystolic || currentVitals?.bloodPressureSystolic}/${mockVitals?.bloodPressureDiastolic || currentVitals?.bloodPressureDiastolic}` : 
                        '--/--'
                      }
                    </h3>
                    <p className="text-xs text-muted-foreground">Blood pressure</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                      <Droplets className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-sm">{mockVitals?.oxygenSaturation || currentVitals?.oxygenSaturation || '--'}%</h3>
                    <p className="text-xs text-muted-foreground">Oxygen saturation</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.priority === 'high' ? 'default' : 'outline'}
                        className="h-auto p-4 flex flex-col gap-2"
                        onClick={action.action}
                      >
                        {action.icon}
                        <div className="text-center">
                          <div className="font-semibold text-sm">{action.title}</div>
                          <div className="text-xs opacity-80">{action.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Health Alerts */}
              {analysis && analysis.riskLevel !== 'low' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Health Alert - {analysis.riskLevel.toUpperCase()}</p>
                        <p className="text-sm">{analysis.analysis}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Vitals synced successfully</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Daily step goal: 75% complete</p>
                        <p className="text-xs text-muted-foreground">7,500 / 10,000 steps</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Sleep tracking: 6.5 hours</p>
                        <p className="text-xs text-muted-foreground">Last night</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {goals.map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {goal.current} / {goal.target} {goal.unit}
                          </p>
                        </div>
                        <Badge className={getGoalStatusColor(goal.status)}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{Math.round((goal.current / goal.target) * 100)}% complete</span>
                        <span>Due: {goal.deadline.toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{achievement.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {achievement.earnedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-6">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <div>
                        <p className="font-semibold">Generating AI Analysis</p>
                        <p className="text-sm text-muted-foreground">Analyzing your vital signs and health data...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : analysis ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI Health Analysis
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button onClick={refreshAnalysis} variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh Analysis
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Current Assessment</h4>
                          <p className="text-sm">{analysis.analysis}</p>
                        </div>
                        
                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Recommendations</h4>
                            <ul className="space-y-1">
                              {analysis.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysis.anomalies && analysis.anomalies.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Health Alerts</h4>
                            <ul className="space-y-1">
                              {analysis.anomalies.map((anomaly, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                                  {anomaly}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm">
                                <span className="font-semibold">Risk Level:</span> {analysis.riskLevel.toUpperCase()}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">AI Confidence:</span> {Math.round((analysis.aiConfidence || 0.8) * 100)}%
                              </p>
                            </div>
                            <Badge variant={analysis.riskLevel === 'low' ? 'secondary' : analysis.riskLevel === 'medium' ? 'default' : 'destructive'}>
                              {analysis.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Analysis generated {analysis.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 font-semibold">Analysis Failed</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <Button onClick={refreshAnalysis} className="mt-4">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-muted-foreground">No AI analysis available yet</p>
                      <p className="text-xs text-muted-foreground">Generate AI-powered health insights based on your vital signs</p>
                    </div>
                    <Button onClick={refreshAnalysis} className="mt-4">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}