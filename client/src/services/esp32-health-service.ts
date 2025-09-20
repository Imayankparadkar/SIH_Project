interface ESP32Data {
  heart_rate: number;
  spo2: number;
  temperature: number;
  battery: number;
  timestamp: string;
}

interface ESP32HealthData {
  heartRate: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  battery: number;
  timestamp: Date;
  isConnected: boolean;
}

type ESP32DataListener = (data: ESP32HealthData) => void;

class ESP32HealthService {
  private listeners: ESP32DataListener[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private lastData: ESP32HealthData | null = null;
  private isRunning = false;
  private readonly API_URL = 'https://esp32-watch-api.vercel.app/api/data';
  private readonly FETCH_INTERVAL = 1000; // 1 second

  subscribe(listener: ESP32DataListener): () => void {
    this.listeners.push(listener);
    
    // If we have cached data, send it immediately
    if (this.lastData) {
      listener(this.lastData);
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      
      // Stop fetching if no more listeners
      if (this.listeners.length === 0 && this.intervalId) {
        this.stop();
      }
    };
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('ESP32 Health Service: Starting real-time data fetching');
    
    // Fetch immediately
    this.fetchData();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.fetchData();
    }, this.FETCH_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('ESP32 Health Service: Stopped data fetching');
  }

  private async fetchData(): Promise<void> {
    try {
      console.log('ESP32: Fetching data from API');
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData: ESP32Data = await response.json();
      console.log('ESP32: Raw data received:', rawData);

      // Convert ESP32 data format to our internal format with proper validation
      const healthData: ESP32HealthData = {
        heartRate: typeof rawData.heart_rate === 'number' ? Math.max(0, rawData.heart_rate) : 0,
        oxygenSaturation: typeof rawData.spo2 === 'number' ? Math.max(0, Math.min(100, rawData.spo2)) : 0,
        bodyTemperature: this.convertToFahrenheit(rawData.temperature || 0),
        battery: typeof rawData.battery === 'number' ? Math.max(0, Math.min(100, rawData.battery)) : 0,
        timestamp: new Date(rawData.timestamp || new Date()),
        isConnected: true
      };

      console.log('ESP32: Processed health data:', healthData);
      this.lastData = healthData;

      // Notify all listeners
      this.listeners.forEach(listener => {
        try {
          listener(healthData);
        } catch (error) {
          console.error('ESP32: Error in listener callback:', error);
        }
      });

    } catch (error) {
      console.error('ESP32: Error fetching data:', error);
      
      // Send disconnected status
      const disconnectedData: ESP32HealthData = {
        heartRate: 0,
        oxygenSaturation: 0,
        bodyTemperature: 0,
        battery: 0,
        timestamp: new Date(),
        isConnected: false
      };

      this.lastData = disconnectedData;
      this.listeners.forEach(listener => {
        try {
          listener(disconnectedData);
        } catch (error) {
          console.error('ESP32: Error in error listener callback:', error);
        }
      });
    }
  }

  private convertToFahrenheit(celsius: number): number {
    // Ensure we have a valid number
    if (typeof celsius !== 'number' || !isFinite(celsius)) {
      return 98.6; // Default normal body temperature
    }
    
    // If temperature seems to be already in Fahrenheit (common range 95-105°F), return as is
    if (celsius >= 95 && celsius <= 105) {
      return Math.round(celsius * 10) / 10; // Round to 1 decimal place
    }
    
    // Otherwise convert from Celsius to Fahrenheit
    const fahrenheit = (celsius * 9/5) + 32;
    
    // Clamp to reasonable human body temperature range
    const clampedTemp = Math.max(90, Math.min(110, fahrenheit));
    return Math.round(clampedTemp * 10) / 10; // Round to 1 decimal place
  }

  getCurrentData(): ESP32HealthData | null {
    return this.lastData;
  }

  isConnected(): boolean {
    return this.lastData?.isConnected ?? false;
  }
}

export const esp32HealthService = new ESP32HealthService();