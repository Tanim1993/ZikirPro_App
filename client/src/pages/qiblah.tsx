import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Navigation, MapPin, Compass } from "lucide-react";

export default function Qiblah() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [qiblahDirection, setQiblahDirection] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("Getting location...");
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Kaaba coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;

  const calculateQiblahDirection = (userLat: number, userLon: number) => {
    const lat1 = (userLat * Math.PI) / 180;
    const lat2 = (KAABA_LAT * Math.PI) / 180;
    const deltaLon = ((KAABA_LON - userLon) * Math.PI) / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    let qiblah = (Math.atan2(y, x) * 180) / Math.PI;
    qiblah = (qiblah + 360) % 360; // Normalize to 0-360

    return qiblah;
  };

  const calculateDistance = (userLat: number, userLon: number) => {
    const R = 6371; // Earth's radius in km
    const lat1 = (userLat * Math.PI) / 180;
    const lat2 = (KAABA_LAT * Math.PI) / 180;
    const deltaLat = ((KAABA_LAT - userLat) * Math.PI) / 180;
    const deltaLon = ((KAABA_LON - userLon) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          setLocation({ lat, lon });
          setQiblahDirection(calculateQiblahDirection(lat, lon));
          setDistance(calculateDistance(lat, lon));
          
          // Reverse geocoding to get location name (simplified)
          setLocationName(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setPermissionDenied(true);
          setLocationName("Location access denied");
          
          // Default to Dhaka, Bangladesh
          const defaultLat = 23.8103;
          const defaultLon = 90.4125;
          setLocation({ lat: defaultLat, lon: defaultLon });
          setQiblahDirection(calculateQiblahDirection(defaultLat, defaultLon));
          setDistance(calculateDistance(defaultLat, defaultLon));
          setLocationName("Dhaka, Bangladesh (Default)");
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 300000 
        }
      );
    } else {
      setLocationName("Geolocation not supported");
    }

    // Device orientation for compass
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setCompassHeading(360 - event.alpha); // Normalize compass heading
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const getDirectionText = (degrees: number) => {
    const directions = [
      { name: "North", min: 0, max: 22.5 },
      { name: "Northeast", min: 22.5, max: 67.5 },
      { name: "East", min: 67.5, max: 112.5 },
      { name: "Southeast", min: 112.5, max: 157.5 },
      { name: "South", min: 157.5, max: 202.5 },
      { name: "Southwest", min: 202.5, max: 247.5 },
      { name: "West", min: 247.5, max: 292.5 },
      { name: "Northwest", min: 292.5, max: 337.5 },
      { name: "North", min: 337.5, max: 360 }
    ];

    const direction = directions.find(d => degrees >= d.min && degrees < d.max);
    return direction?.name || "North";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10">
      {/* Header */}
      <header className="bg-islamic-gradient text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/more">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Qiblah Direction</h1>
            <p className="text-sm text-islamic-secondary/80">Find direction to Mecca</p>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Location Info */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-islamic-primary" />
                <div>
                  <h3 className="font-semibold text-gray-900">Your Location</h3>
                  <p className="text-sm text-gray-600">{locationName}</p>
                </div>
              </div>
              {permissionDenied && (
                <Button 
                  size="sm" 
                  className="bg-islamic-primary"
                  onClick={() => window.location.reload()}
                >
                  Enable Location
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compass */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Qiblah Compass</h2>
              <p className="text-sm text-islamic-secondary/80">
                Point your device towards the Kaaba
              </p>
            </div>
            
            {/* Compass Circle */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-white/30">
                {/* Compass markings */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-xs font-bold">N</div>
                <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 text-xs font-bold">E</div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 text-xs font-bold">S</div>
                <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 text-xs font-bold">W</div>
                
                {/* Qiblah Direction Arrow */}
                {qiblahDirection !== null && (
                  <div 
                    className="absolute top-1/2 left-1/2 origin-bottom transform -translate-x-1/2 -translate-y-full transition-transform duration-300"
                    style={{ 
                      transform: `translate(-50%, -100%) rotate(${qiblahDirection - compassHeading}deg)`,
                      height: '100px'
                    }}
                  >
                    <div className="w-1 h-full bg-green-400 mx-auto"></div>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-400 mx-auto -mt-1"></div>
                  </div>
                )}
                
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Direction Info */}
            <div className="text-center space-y-2">
              {qiblahDirection !== null ? (
                <>
                  <div className="text-3xl font-bold">{Math.round(qiblahDirection)}°</div>
                  <div className="text-sm text-islamic-secondary/90">
                    {getDirectionText(qiblahDirection)}
                  </div>
                </>
              ) : (
                <div className="text-lg">Calculating direction...</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distance Info */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center">
              <Compass className="w-5 h-5 mr-2 text-islamic-primary" />
              Distance to Kaaba
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-islamic-gradient text-white rounded-lg">
                <div className="text-2xl font-bold">
                  {distance ? `${Math.round(distance).toLocaleString()}` : '---'}
                </div>
                <div className="text-sm text-islamic-secondary/80">Kilometers</div>
              </div>
              <div className="text-center p-4 bg-gray-100 text-gray-900 rounded-lg">
                <div className="text-2xl font-bold">
                  {distance ? `${Math.round(distance * 0.621371).toLocaleString()}` : '---'}
                </div>
                <div className="text-sm text-gray-600">Miles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Times Integration */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800 mb-1">Next Prayer</h3>
                <p className="text-sm text-green-700">Maghrib at 6:20 PM</p>
                <p className="text-xs text-green-600">in 2 hours 45 minutes</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">How to Use</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Hold your device flat and rotate until the green arrow points up</li>
              <li>• The arrow shows the direction to the Kaaba in Mecca</li>
              <li>• Use this direction when performing Salah</li>
              <li>• For best accuracy, calibrate your device compass</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}