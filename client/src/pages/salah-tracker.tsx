import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Prayer {
  name: string;
  arabicName: string;
  time: string;
  completed: boolean;
}

interface PrayerTimes {
  location: string;
  date: string;
  prayers: Prayer[];
}

export default function SalahTracker() {
  const { toast } = useToast();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
    location: "Dhaka, Bangladesh",
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    prayers: [
      { name: "Fajr", arabicName: "فجر", time: "5:15 AM", completed: false },
      { name: "Dhuhr", arabicName: "ظهر", time: "12:30 PM", completed: false },
      { name: "Asr", arabicName: "عصر", time: "4:45 PM", completed: false },
      { name: "Maghrib", arabicName: "مغرب", time: "6:20 PM", completed: false },
      { name: "Isha", arabicName: "عشاء", time: "7:45 PM", completed: false }
    ]
  });

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

  const completedCount = prayerTimes.prayers.filter(p => p.completed).length;
  const progressPercentage = (completedCount / prayerTimes.prayers.length) * 100;

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
            <p className="text-sm text-islamic-secondary/80">Daily Prayer Tracker</p>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Date and Location */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{prayerTimes.date}</h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{prayerTimes.location}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-islamic-primary">{completedCount}/5</div>
                <div className="text-xs text-gray-500">Prayers</div>
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
                        {prayer.time}
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
      </div>
    </div>
  );
}