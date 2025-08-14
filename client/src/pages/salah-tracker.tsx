import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Clock, MapPin, Calendar, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Prayer {
  name: string;
  arabicName: string;
  time: string;
  completed: boolean;
  id: string;
}

interface PrayerTimes {
  location: string;
  date: string;
  prayers: Prayer[];
  hijriDate: string;
}

interface PrayerHistory {
  date: string;
  hijriDate: string;
  prayers: { [key: string]: boolean };
  submitted: boolean;
}

export default function SalahTracker() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState("Getting location...");
  const [isLoadingTimes, setIsLoadingTimes] = useState(true);
  const [prayerHistory, setPrayerHistory] = useState<PrayerHistory[]>([]);
  
  // Get user's selected Mazhab from profile (default to Hanafi)
  const userMazhab = (user as any)?.mazhab || 'Hanafi';
  
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
    location: "Getting location...",
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    hijriDate: "Getting date...",
    prayers: [
      { name: "Fajr", arabicName: "فجر", time: "Loading...", completed: false, id: "fajr" },
      { name: "Dhuhr", arabicName: "ظهر", time: "Loading...", completed: false, id: "dhuhr" },
      { name: "Asr", arabicName: "عصر", time: "Loading...", completed: false, id: "asr" },
      { name: "Maghrib", arabicName: "مغرب", time: "Loading...", completed: false, id: "maghrib" },
      { name: "Isha", arabicName: "عشاء", time: "Loading...", completed: false, id: "isha" }
    ]
  });

  // Load prayer times based on location and Mazhab
  const loadPrayerTimes = async (lat: number, lon: number) => {
    try {
      setIsLoadingTimes(true);
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      // Using AlAdhan API for accurate prayer times
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lon}&method=2&school=${userMazhab === 'Shafi' ? '1' : '0'}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const timings = data.data.timings;
        const date_info = data.data.date;
        
        setPrayerTimes(prev => ({
          ...prev,
          location: locationName,
          hijriDate: `${date_info.hijri.day} ${date_info.hijri.month.en} ${date_info.hijri.year}`,
          prayers: [
            { ...prev.prayers[0], time: formatTime(timings.Fajr) },
            { ...prev.prayers[1], time: formatTime(timings.Dhuhr) },
            { ...prev.prayers[2], time: formatTime(timings.Asr) },
            { ...prev.prayers[3], time: formatTime(timings.Maghrib) },
            { ...prev.prayers[4], time: formatTime(timings.Isha) }
          ]
        }));
      }
    } catch (error) {
      console.error("Error loading prayer times:", error);
      toast({
        title: "Error Loading Prayer Times",
        description: "Using default times. Please check your internet connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTimes(false);
    }
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get user's location and load prayer times
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });
          setLocationName(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
          loadPrayerTimes(lat, lon);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to Dhaka, Bangladesh
          const defaultLat = 23.8103;
          const defaultLon = 90.4125;
          setLocation({ lat: defaultLat, lon: defaultLon });
          setLocationName("Dhaka, Bangladesh (Default)");
          loadPrayerTimes(defaultLat, defaultLon);
        }
      );
    }
    
    // Load prayer history from localStorage
    const savedHistory = localStorage.getItem('prayerHistory');
    if (savedHistory) {
      setPrayerHistory(JSON.parse(savedHistory));
    }
  }, [userMazhab]);

  const togglePrayer = (index: number) => {
    setPrayerTimes(prev => ({
      ...prev,
      prayers: prev.prayers.map((prayer, i) => 
        i === index ? { ...prayer, completed: !prayer.completed } : prayer
      )
    }));

    const prayer = prayerTimes.prayers[index];
    toast({
      title: prayer.completed ? "Prayer Unmarked" : "Prayer Completed!",
      description: prayer.completed 
        ? `${prayer.name} prayer unmarked` 
        : `May Allah accept your ${prayer.name} prayer`,
    });
  };

  const submitDayPrayers = () => {
    const today = new Date().toISOString().split('T')[0];
    const prayerStatus: { [key: string]: boolean } = {};
    
    prayerTimes.prayers.forEach(prayer => {
      prayerStatus[prayer.id] = prayer.completed;
    });

    const todayHistory: PrayerHistory = {
      date: today,
      hijriDate: prayerTimes.hijriDate,
      prayers: prayerStatus,
      submitted: true
    };

    const updatedHistory = [...prayerHistory.filter(h => h.date !== today), todayHistory];
    setPrayerHistory(updatedHistory);
    localStorage.setItem('prayerHistory', JSON.stringify(updatedHistory));

    toast({
      title: "Day Submitted!",
      description: "Your prayer record has been saved successfully",
    });
  };

  const completedCount = prayerTimes.prayers.filter(p => p.completed).length;
  const progressPercentage = (completedCount / prayerTimes.prayers.length) * 100;
  
  const today = new Date().toISOString().split('T')[0];
  const todaySubmitted = prayerHistory.some(h => h.date === today && h.submitted);

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
            <h1 className="text-xl font-bold">Salah Tracker</h1>
            <p className="text-sm text-islamic-secondary/80">Daily Prayer Tracker - {userMazhab}</p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {showHistory ? (
          /* Prayer History View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Prayer History</h2>
              <Button 
                onClick={() => setShowHistory(false)}
                variant="outline"
              >
                Back to Today
              </Button>
            </div>
            
            {prayerHistory.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
                  <p className="text-gray-600">Start tracking your prayers to see history here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {prayerHistory.slice().reverse().map((day, index) => {
                  const completedPrayers = Object.values(day.prayers).filter(Boolean).length;
                  const percentage = (completedPrayers / 5) * 100;
                  
                  return (
                    <Card key={index} className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {new Date(day.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </h3>
                            <p className="text-sm text-gray-600">{day.hijriDate}</p>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-islamic-primary">
                              {completedPrayers}/5
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(percentage)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2">
                          {Object.entries(day.prayers).map(([prayerId, completed]) => {
                            const prayerName = prayerId.charAt(0).toUpperCase() + prayerId.slice(1);
                            return (
                              <div 
                                key={prayerId}
                                className={`text-center p-2 rounded-lg ${
                                  completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <div className="text-xs font-medium">{prayerName}</div>
                                {completed ? <Check className="w-3 h-3 mx-auto mt-1" /> : <div className="w-3 h-3 mt-1"></div>}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Today's Prayer Tracking */
          <>
            {/* Date and Location */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{prayerTimes.date}</h2>
                    <div className="text-sm text-gray-600 mb-1">{prayerTimes.hijriDate}</div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{prayerTimes.location}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-islamic-primary">{completedCount}/5</div>
                    <div className="text-xs text-gray-500">Prayers</div>
                    {todaySubmitted && (
                      <div className="text-xs text-green-600 mt-1">✓ Submitted</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

        {/* Progress Bar */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Progress</span>
              <span className="text-sm">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

            {/* Prayer List */}
            <div className="space-y-3">
              {prayerTimes.prayers.map((prayer, index) => (
                <Card 
                  key={index} 
                  className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                    prayer.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                  }`}
                  onClick={() => togglePrayer(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          prayer.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-islamic-gradient text-white'
                        }`}>
                          {prayer.completed ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <Clock className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-semibold ${
                              prayer.completed ? 'text-green-700' : 'text-gray-900'
                            }`}>
                              {prayer.name}
                            </h3>
                            <span className="text-islamic-primary font-amiri text-lg">
                              {prayer.arabicName}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            prayer.completed ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {isLoadingTimes ? "Loading..." : prayer.time}
                          </p>
                        </div>
                      </div>
                      
                      {prayer.completed && (
                        <div className="text-green-600 text-sm font-medium">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Day Button */}
            {!todaySubmitted && (
              <Button 
                onClick={submitDayPrayers}
                className="w-full bg-islamic-gradient text-white py-6 text-lg font-semibold"
                disabled={completedCount === 0}
              >
                Submit Today's Prayers ({completedCount}/5)
              </Button>
            )}

            {/* Motivational Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {completedCount === 5 ? "Excellent Work!" : "Keep Going!"}
                </h3>
                <p className="text-sm opacity-90">
                  {completedCount === 5 
                    ? "You've completed all your prayers today. May Allah reward you!" 
                    : `${5 - completedCount} more prayers to complete your daily worship.`
                  }
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}