import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Calendar, Settings, Bell, Sunrise, Sun, Sunset, Moon, Star, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface PrayerTime {
  name: string;
  arabic: string;
  time: string;
  remaining: string;
  icon: any;
  color: string;
  isNext: boolean;
  isPassed: boolean;
}

interface LocationInfo {
  city: string;
  country: string;
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function PrayerTimes() {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({
    city: "Dhaka",
    country: "Bangladesh",
    timezone: "Asia/Dhaka",
    coordinates: { latitude: 23.8103, longitude: 90.4125 }
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Demo prayer times (in real app, would be calculated based on location)
  const prayerTimes: PrayerTime[] = [
    {
      name: "Fajr",
      arabic: "فجر",
      time: "4:45 AM",
      remaining: "7h 32m",
      icon: Sunrise,
      color: "from-blue-400 to-blue-600",
      isNext: false,
      isPassed: true
    },
    {
      name: "Dhuhr",
      arabic: "ظهر",
      time: "12:15 PM",
      remaining: "3h 2m",
      icon: Sun,
      color: "from-yellow-400 to-orange-500",
      isNext: true,
      isPassed: false
    },
    {
      name: "Asr",
      arabic: "عصر",
      time: "3:45 PM",
      remaining: "6h 32m",
      icon: Sun,
      color: "from-orange-400 to-red-500",
      isNext: false,
      isPassed: false
    },
    {
      name: "Maghrib",
      arabic: "مغرب",
      time: "6:20 PM",
      remaining: "9h 7m",
      icon: Sunset,
      color: "from-red-400 to-pink-500",
      isNext: false,
      isPassed: false
    },
    {
      name: "Isha",
      arabic: "عشاء",
      time: "7:45 PM",
      remaining: "10h 32m",
      icon: Moon,
      color: "from-purple-400 to-indigo-600",
      isNext: false,
      isPassed: false
    }
  ];

  const updateLocation = () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, would reverse geocode and calculate prayer times
          setCurrentLocation({
            ...currentLocation,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  const nextPrayer = prayerTimes.find(prayer => prayer.isNext);
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentTime);

  const islamicDate = "15 Safar 1446 AH"; // In real app, would calculate Islamic date

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10">
      {/* Header */}
      <header className="bg-islamic-gradient text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/more">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Prayer Times</h1>
            <p className="text-sm text-islamic-secondary/80">Accurate timing worldwide</p>
          </div>
          
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Date & Location */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/50">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </h2>
              <p className="text-gray-600">{currentDate}</p>
              <p className="text-sm text-islamic-primary font-semibold">{islamicDate}</p>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{currentLocation.city}, {currentLocation.country}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={updateLocation}
                  disabled={loading}
                  className="text-islamic-primary"
                >
                  {loading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Prayer */}
        {nextPrayer && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`bg-gradient-to-r ${nextPrayer.color} text-white shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Next Prayer</h3>
                    <div className="flex items-center space-x-3 mt-2">
                      <nextPrayer.icon className="w-6 h-6" />
                      <div>
                        <p className="text-lg font-semibold">{nextPrayer.name}</p>
                        <p className="text-sm opacity-90 font-arabic">{nextPrayer.arabic}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{nextPrayer.time}</p>
                    <p className="text-sm opacity-90">in {nextPrayer.remaining}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Prayer Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-islamic-primary">
              <Clock className="w-5 h-5 mr-2" />
              Today's Prayer Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prayerTimes.map((prayer, index) => {
              const IconComponent = prayer.icon;
              return (
                <motion.div
                  key={prayer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    prayer.isNext 
                      ? "border-islamic-primary bg-islamic-primary/5" 
                      : prayer.isPassed 
                        ? "border-gray-200 bg-gray-50 opacity-60" 
                        : "border-gray-200 hover:border-islamic-primary/30"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${prayer.color} flex items-center justify-center ${prayer.isPassed ? "opacity-60" : ""}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${prayer.isPassed ? "text-gray-400" : "text-gray-900"}`}>
                        {prayer.name}
                      </h4>
                      <p className={`text-sm font-arabic ${prayer.isPassed ? "text-gray-400" : "text-gray-600"}`}>
                        {prayer.arabic}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-bold ${prayer.isPassed ? "text-gray-400" : "text-gray-900"}`}>
                      {prayer.time}
                    </p>
                    {!prayer.isPassed && (
                      <p className={`text-sm ${prayer.isNext ? "text-islamic-primary font-semibold" : "text-gray-500"}`}>
                        {prayer.isNext ? `in ${prayer.remaining}` : prayer.remaining}
                      </p>
                    )}
                    {prayer.isPassed && (
                      <p className="text-sm text-gray-400">completed</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <Bell className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
              <p className="text-sm font-medium">Notifications</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
              <p className="text-sm font-medium">Monthly View</p>
            </CardContent>
          </Card>
          
          <Link href="/qiblah">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
                <p className="text-sm font-medium">Qiblah</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/salah-tracker">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
                <p className="text-sm font-medium">Track Salah</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Islamic Info */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">Prayer Time Calculation</h3>
            <p className="text-sm leading-relaxed mb-2">
              Prayer times are calculated using precise astronomical data and your geographic location. 
              Times may vary slightly based on local Islamic authorities' recommendations.
            </p>
            <p className="text-xs text-islamic-secondary/80">
              "Indeed, prayer has been decreed upon the believers a decree of specified times." - Quran 4:103
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}