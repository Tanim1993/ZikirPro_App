import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, MapPin, Clock, CheckCircle, Circle, Star, Heart, Book, Navigation, Calendar, Crown, Play, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HajjRitual {
  id: string;
  name: string;
  nameArabic: string;
  day: number;
  location: string;
  description: string;
  dua: string;
  duaTranslation: string;
  instructions: string[];
  significance: string;
  isCompleted: boolean;
  timeRequired: string;
  category: "preparation" | "day1" | "day2" | "day3" | "day4" | "day5";
}

interface HajjDay {
  day: number;
  date: string;
  title: string;
  titleArabic: string;
  location: string;
  description: string;
  rituals: HajjRitual[];
  color: string;
}

export default function HajjCompanion() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedRituals, setCompletedRituals] = useState<Set<string>>(new Set());
  const [currentLocation, setCurrentLocation] = useState("Mecca");
  
  const hajjDays: HajjDay[] = [
    {
      day: 1,
      date: "8th Dhul Hijjah",
      title: "Day of Tarwiyah",
      titleArabic: "يوم التروية",
      location: "Mina",
      description: "Begin your Hajj journey with Ihram and travel to Mina",
      color: "from-blue-500 to-blue-700",
      rituals: [
        {
          id: "ihram",
          name: "Enter Ihram",
          nameArabic: "إحرام",
          day: 1,
          location: "Miqat or Hotel",
          description: "Make intention and wear Ihram clothing",
          dua: "لَبَّيْكَ اللّهُمَّ حَجًّا",
          duaTranslation: "Here I am O Allah, (intending) Hajj",
          instructions: [
            "Perform Ghusl (ritual bath)",
            "Wear Ihram garments (2 white cloths for men)",
            "Make intention for Hajj",
            "Recite Talbiyah",
            "Avoid prohibited actions in Ihram"
          ],
          significance: "Entering the sacred state of Hajj pilgrimage",
          isCompleted: false,
          timeRequired: "1-2 hours",
          category: "day1"
        },
        {
          id: "travel_mina",
          name: "Travel to Mina",
          nameArabic: "الذهاب إلى منى",
          day: 1,
          location: "Mina",
          description: "Journey to Mina and stay overnight",
          dua: "لَبَّيْكَ اللّهُمَّ لَبَّيْكَ",
          duaTranslation: "Here I am O Allah, here I am",
          instructions: [
            "Continue reciting Talbiyah during travel",
            "Pray Zuhr, Asr, Maghrib, Isha and Fajr in Mina",
            "Rest and prepare for Arafat",
            "Engage in dhikr and dua"
          ],
          significance: "Following the Sunnah of Prophet Muhammad (PBUH)",
          isCompleted: false,
          timeRequired: "Evening to next morning",
          category: "day1"
        }
      ]
    },
    {
      day: 2,
      date: "9th Dhul Hijjah",
      title: "Day of Arafat",
      titleArabic: "يوم عرفة",
      location: "Arafat",
      description: "The most important day of Hajj - stand at Arafat",
      color: "from-orange-500 to-red-600",
      rituals: [
        {
          id: "wuquf_arafat",
          name: "Standing at Arafat",
          nameArabic: "وقوف عرفة",
          day: 2,
          location: "Plains of Arafat",
          description: "Stand in supplication from noon until sunset",
          dua: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
          duaTranslation: "There is no deity but Allah alone, with no partner. His is the dominion, His is the praise, and He has power over everything",
          instructions: [
            "Arrive at Arafat before noon",
            "Combine and shorten Zuhr and Asr prayers",
            "Spend time in sincere dua and dhikr",
            "Face the Qiblah while making dua",
            "Raise hands in supplication",
            "Ask for forgiveness and mercy"
          ],
          significance: "The pinnacle of Hajj - Allah's mercy descends",
          isCompleted: false,
          timeRequired: "Noon to sunset",
          category: "day2"
        }
      ]
    },
    {
      day: 3,
      date: "10th Dhul Hijjah",
      title: "Eid al-Adha",
      titleArabic: "عيد الأضحى",
      location: "Muzdalifah → Mina",
      description: "Collect pebbles, stone Jamarat, sacrifice, and shave",
      color: "from-green-500 to-teal-600",
      rituals: [
        {
          id: "muzdalifah",
          name: "Night at Muzdalifah",
          nameArabic: "المبيت بمزدلفة",
          day: 3,
          location: "Muzdalifah",
          description: "Spend night under stars and collect pebbles",
          dua: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          duaTranslation: "Our Lord, give us good in this world and good in the next world, and save us from the punishment of the Fire",
          instructions: [
            "Collect 70 small pebbles (size of chickpeas)",
            "Pray Maghrib and Isha combined",
            "Rest briefly under open sky",
            "Leave after Fajr prayer"
          ],
          significance: "Preparation for stoning Satan symbolically",
          isCompleted: false,
          timeRequired: "Night stay",
          category: "day3"
        },
        {
          id: "rami_jamarat",
          name: "Stoning Jamrat al-Aqaba",
          nameArabic: "رمي جمرة العقبة",
          day: 3,
          location: "Mina - Jamrat Bridge",
          description: "Stone the large pillar with 7 pebbles",
          dua: "اللَّهُ أَكْبَرُ",
          duaTranslation: "Allah is the Greatest",
          instructions: [
            "Use 7 pebbles for Jamrat al-Aqaba only",
            "Say 'Allahu Akbar' with each stone",
            "Throw from 5-15 feet away",
            "Avoid crowded times for safety"
          ],
          significance: "Rejecting Satan's temptations like Ibrahim (AS)",
          isCompleted: false,
          timeRequired: "30 minutes",
          category: "day3"
        },
        {
          id: "sacrifice",
          name: "Animal Sacrifice",
          nameArabic: "ذبح الهدي",
          day: 3,
          location: "Mina",
          description: "Sacrifice an animal or arrange through bank",
          dua: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ",
          duaTranslation: "In the name of Allah, and Allah is the Greatest",
          instructions: [
            "Can be done through Islamic banks",
            "Animal meat distributed to the poor",
            "Must be done before sunset",
            "Part of following Ibrahim's (AS) example"
          ],
          significance: "Commemorating Ibrahim's willingness to sacrifice",
          isCompleted: false,
          timeRequired: "Arranged service",
          category: "day3"
        }
      ]
    }
  ];

  const currentDay = hajjDays.find(day => day.day === selectedDay)!;
  
  const toggleRitualComplete = (ritualId: string) => {
    const newCompleted = new Set(completedRituals);
    if (newCompleted.has(ritualId)) {
      newCompleted.delete(ritualId);
    } else {
      newCompleted.add(ritualId);
    }
    setCompletedRituals(newCompleted);
  };

  const getOverallProgress = () => {
    const totalRituals = hajjDays.flatMap(day => day.rituals).length;
    const completedCount = Array.from(completedRituals).length;
    return Math.round((completedCount / totalRituals) * 100);
  };

  const getDayProgress = (day: HajjDay) => {
    const dayRituals = day.rituals.length;
    const completedInDay = day.rituals.filter(ritual => completedRituals.has(ritual.id)).length;
    return Math.round((completedInDay / dayRituals) * 100);
  };

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
            <h1 className="text-xl font-bold">Hajj Companion</h1>
            <p className="text-sm text-islamic-secondary/80">Complete Pilgrimage Guide</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
            <span className="text-sm">{getOverallProgress()}%</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Hajj Overview */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">حَجّ مَبْرُور</h2>
              <h3 className="text-xl text-islamic-primary">Hajj Mabrur</h3>
              <p className="text-gray-600 leading-relaxed">
                Your comprehensive digital companion for the spiritual journey of Hajj. 
                Follow step-by-step guidance with authentic duas, rituals, and timings.
              </p>
              <div className="w-full max-w-md mx-auto">
                <Progress value={getOverallProgress()} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">Overall Hajj Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Location */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Current Location: {currentLocation}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Live</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Hajj Days Navigation */}
        <div className="grid gap-3 grid-cols-3 md:grid-cols-5">
          {hajjDays.map((day) => {
            const progress = getDayProgress(day);
            const isSelected = day.day === selectedDay;
            
            return (
              <motion.div
                key={day.day}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? "ring-2 ring-islamic-primary shadow-lg" 
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedDay(day.day)}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r ${day.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {day.day}
                    </div>
                    <p className="text-xs font-semibold text-gray-900 mb-1">{day.date}</p>
                    <Progress value={progress} className="h-1 mb-1" />
                    <p className="text-xs text-gray-500">{progress}%</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Day Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`bg-gradient-to-r ${currentDay.color} text-white shadow-xl`}>
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold">{currentDay.title}</CardTitle>
                  <p className="text-xl font-arabic opacity-90">{currentDay.titleArabic}</p>
                  <p className="text-sm opacity-80">{currentDay.date}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{currentDay.location}</span>
                </div>
                <p className="text-center leading-relaxed">{currentDay.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Rituals for Selected Day */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 text-center">Day {selectedDay} Rituals</h3>
          
          {currentDay.rituals.map((ritual, index) => {
            const isCompleted = completedRituals.has(ritual.id);
            
            return (
              <motion.div
                key={ritual.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`transition-all duration-200 ${
                  isCompleted ? "bg-green-50 border-green-200" : "hover:shadow-md"
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRitualComplete(ritual.id)}
                          className={`p-0 h-auto ${isCompleted ? "text-green-500" : "text-gray-400"}`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </Button>
                        <div>
                          <CardTitle className="text-lg text-gray-900">{ritual.name}</CardTitle>
                          <p className="text-sm text-gray-600 font-arabic">{ritual.nameArabic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {ritual.timeRequired}
                        </Badge>
                        <p className="text-xs text-gray-500">{ritual.location}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">{ritual.description}</p>
                    
                    {/* Dua Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-red-500" />
                        Essential Dua
                      </h4>
                      <p className="text-lg font-arabic text-gray-900 mb-2 text-center leading-relaxed">
                        {ritual.dua}
                      </p>
                      <p className="text-sm text-gray-600 italic text-center">
                        {ritual.duaTranslation}
                      </p>
                    </div>
                    
                    {/* Instructions */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <Book className="w-4 h-4 mr-2 text-blue-500" />
                        Step-by-Step Instructions
                      </h4>
                      <ul className="space-y-2">
                        {ritual.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="w-5 h-5 bg-islamic-primary/10 text-islamic-primary rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-0.5 flex-shrink-0">
                              {idx + 1}
                            </span>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Significance */}
                    <div className="bg-islamic-primary/5 p-3 rounded-lg">
                      <h4 className="font-semibold text-islamic-primary mb-1 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Spiritual Significance
                      </h4>
                      <p className="text-sm text-gray-600">{ritual.significance}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <Navigation className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
              <p className="text-sm font-medium">Qiblah</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
              <p className="text-sm font-medium">Prayer Times</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <Play className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
              <p className="text-sm font-medium">Audio Guide</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
              <p className="text-sm font-medium">Group</p>
            </CardContent>
          </Card>
        </div>

        {/* Hajj Wisdom */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">Wisdom of Hajj</h3>
            <p className="text-sm leading-relaxed mb-2">
              "And proclaim to mankind the Hajj pilgrimage. They will come to you on foot and on every lean camel; 
              they will come from every distant pass."
            </p>
            <p className="text-xs text-islamic-secondary/80">- Quran 22:27</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}