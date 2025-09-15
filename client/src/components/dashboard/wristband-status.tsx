import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Watch, 
  Battery, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface WristbandStatus {
  connected: boolean;
  batteryLevel: number;
  lastSync: Date;
  deviceModel: string;
  firmwareVersion: string;
}

interface HealthData {
  heartRate: number;
  bloodPressure: string;
  oxygenSaturation: number;
  bodyTemperature: number;
  steps: number;
  sleepHours: number;
  stressLevel: string;
  fallDetected: boolean;
  radiationExposure: number;
}

export function WristbandStatus() {
  const { t } = useTranslation();
  const [deviceStatus, setDeviceStatus] = useState<WristbandStatus | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch('/api/health/wristband-status', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDeviceStatus(data);
      }
    } catch (error) {
      console.error('Error fetching device status:', error);
    }
  };

  const simulateHealthData = () => {
    // Simulate real-time wristband data
    setHealthData({
      heartRate: 72 + Math.floor(Math.random() * 20),
      bloodPressure: `${120 + Math.floor(Math.random() * 20)}/${80 + Math.floor(Math.random() * 10)}`,
      oxygenSaturation: 96 + Math.floor(Math.random() * 4),
      bodyTemperature: 98.0 + Math.random() * 2,
      steps: 7500 + Math.floor(Math.random() * 2500),
      sleepHours: 7 + Math.random() * 2,
      stressLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      fallDetected: Math.random() < 0.05, // 5% chance
      radiationExposure: Math.random() * 0.5 // μSv
    });
  };

  const syncDevice = async () => {
    setIsLoading(true);
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    await fetchDeviceStatus();
    simulateHealthData();
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDeviceStatus();
    simulateHealthData();
    
    // Update health data every 10 seconds to simulate continuous monitoring
    const interval = setInterval(simulateHealthData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Device Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="w-5 h-5" />
            Wristband Device
          </CardTitle>
          <CardDescription>
            Real-time device status and connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deviceStatus ? (
            <>
              <div className="flex items-center justify-between">
                <span className="font-medium">{deviceStatus.deviceModel}</span>
                <Badge variant={deviceStatus.connected ? 'default' : 'destructive'}>
                  {deviceStatus.connected ? (
                    <><Wifi className="w-3 h-3 mr-1" /> Connected</>
                  ) : (
                    <><WifiOff className="w-3 h-3 mr-1" /> Disconnected</>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Battery Level</span>
                <div className="flex items-center gap-2">
                  <Battery className={`w-4 h-4 ${getBatteryColor(deviceStatus.batteryLevel)}`} />
                  <span className={`font-medium ${getBatteryColor(deviceStatus.batteryLevel)}`}>
                    {deviceStatus.batteryLevel}%
                  </span>
                </div>
              </div>
              
              <Progress value={deviceStatus.batteryLevel} className="h-2" />
              
              <div className="text-sm text-muted-foreground">
                <p>Firmware: v{deviceStatus.firmwareVersion}</p>
                <p>Last Sync: {new Date(deviceStatus.lastSync).toLocaleTimeString()}</p>
              </div>
              
              <Button 
                onClick={syncDevice} 
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Syncing...' : 'Sync Device'}
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading device status...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Health Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Health Monitoring
          </CardTitle>
          <CardDescription>
            Continuous health parameter tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthData ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
                  <p className="font-semibold">{healthData.heartRate} BPM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
                  <p className="font-semibold">{healthData.bloodPressure} mmHg</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <div>
                  <p className="text-sm text-muted-foreground">SpO₂</p>
                  <p className="font-semibold">{healthData.oxygenSaturation}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="font-semibold">{healthData.bodyTemperature.toFixed(1)}°F</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Steps Today</p>
                  <p className="font-semibold">{healthData.steps.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Sleep</p>
                  <p className="font-semibold">{healthData.sleepHours.toFixed(1)}h</p>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Stress Level</span>
                </div>
                <Badge className={getStressColor(healthData.stressLevel)}>
                  {healthData.stressLevel.toUpperCase()}
                </Badge>
              </div>
              
              {healthData.radiationExposure > 0 && (
                <div className="col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Radiation</span>
                  </div>
                  <span className="font-semibold text-sm">{healthData.radiationExposure.toFixed(2)} μSv</span>
                </div>
              )}
              
              {healthData.fallDetected && (
                <div className="col-span-2 flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Fall Detected!</span>
                </div>
              )}
              
              {!healthData.fallDetected && (
                <div className="col-span-2 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">All systems normal</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading health data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}