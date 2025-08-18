import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Sunrise, Sunset, Moon, Clock, CheckCircle, Circle, Play, Pause, RotateCcw, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
  currentCount: number;
  benefit: string;
  source: string;
  category: "morning" | "evening" | "anytime";
}

interface AzkarCategory {
  title: string;
  icon: any;
  color: string;
  time: string;
  description: string;
  dhikrs: Dhikr[];
}

export default function DailyAzkar() {
  const [selectedCategory, setSelectedCategory] = useState<"morning" | "evening" | "anytime">("morning");
  const [dhikrProgress, setDhikrProgress] = useState<Record<string, number>>({});
  const [completedDhikrs, setCompletedDhikrs] = useState<Set<string>>(new Set());

  const azkarCategories: AzkarCategory[] = [
    {
      title: "Morning Azkar",
      icon: Sunrise,
      color: "from-yellow-400 to-orange-500",
      time: "After Fajr until sunrise",
      description: "Start your day with protection and blessings",
      dhikrs: [
        {
          id: "ayat_kursi",
          arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
          transliteration: "Allah la ilaha illa huwa, al-hayyu al-qayyum",
          translation: "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining",
          count: 1,
          currentCount: 0,
          benefit: "Complete protection throughout the day",
          source: "Quran 2:255",
          category: "morning"
        },
        {
          id: "seeking_refuge",
          arabic: "أَعُوذُ بِكَلِمَاتِ اللّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
          transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq",
          translation: "I seek refuge in the perfect words of Allah from the evil of what He has created",
          count: 3,
          currentCount: 0,
          benefit: "Protection from all forms of harm",
          source: "Sahih Muslim",
          category: "morning"
        },
        {
          id: "morning_praise",
          arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
          transliteration: "Asbahna wa asbahal-mulku lillahi",
          translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty",
          count: 1,
          currentCount: 0,
          benefit: "Acknowledgment of Allah's sovereignty",
          source: "Sahih Muslim",
          category: "morning"
        }
      ]
    },
    {
      title: "Evening Azkar",
      icon: Sunset,
      color: "from-orange-400 to-red-500",
      time: "After Asr until Maghrib",
      description: "Seek Allah's protection for the night",
      dhikrs: [
        {
          id: "evening_refuge",
          arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
          transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq",
          translation: "I seek refuge in the perfect words of Allah from the evil of what He has created",
          count: 3,
          currentCount: 0,
          benefit: "Protection throughout the night",
          source: "Sahih Muslim",
          category: "evening"
        },
        {
          id: "evening_praise",
          arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
          transliteration: "Amsayna wa amsal-mulku lillahi",
          translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty",
          count: 1,
          currentCount: 0,
          benefit: "Evening acknowledgment of Allah's rule",
          source: "Sahih Muslim",
          category: "evening"
        }
      ]
    },
    {
      title: "Anytime Dhikr",
      icon: Star,
      color: "from-purple-400 to-indigo-600",
      time: "Throughout the day",
      description: "Continuous remembrance of Allah",
      dhikrs: [
        {
          id: "subhanallah",
          arabic: "سُبْحَانَ اللَّهِ",
          transliteration: "Subhanallahi",
          translation: "Glory be to Allah",
          count: 33,
          currentCount: 0,
          benefit: "Purification of the soul",
          source: "Sahih Bukhari",
          category: "anytime"
        },
        {
          id: "alhamdulillah",
          arabic: "الْحَمْدُ لِلَّهِ",
          transliteration: "Alhamdulillahi",
          translation: "All praise is due to Allah",
          count: 33,
          currentCount: 0,
          benefit: "Gratitude and contentment",
          source: "Sahih Bukhari",
          category: "anytime"
        },
        {
          id: "allahu_akbar",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allahu akbar",
          translation: "Allah is the Greatest",
          count: 34,
          currentCount: 0,
          benefit: "Recognition of Allah's greatness",
          source: "Sahih Bukhari",
          category: "anytime"
        }
      ]
    }
  ];

  const currentCategory = azkarCategories.find(cat => cat.dhikrs[0].category === selectedCategory)!;

  const incrementDhikr = (dhikrId: string) => {
    const dhikr = currentCategory.dhikrs.find(d => d.id === dhikrId);
    if (!dhikr) return;

    const currentProgress = dhikrProgress[dhikrId] || 0;
    const newProgress = Math.min(currentProgress + 1, dhikr.count);
    
    setDhikrProgress(prev => ({
      ...prev,
      [dhikrId]: newProgress
    }));

    // Mark as completed if reached target count
    if (newProgress === dhikr.count) {
      setCompletedDhikrs(prev => new Set(prev).add(dhikrId));
    }
  };

  const resetDhikr = (dhikrId: string) => {
    setDhikrProgress(prev => ({
      ...prev,
      [dhikrId]: 0
    }));
    setCompletedDhikrs(prev => {
      const newSet = new Set(prev);
      newSet.delete(dhikrId);
      return newSet;
    });
  };

  const getCategoryProgress = (category: AzkarCategory) => {
    const totalDhikrs = category.dhikrs.length;
    const completedInCategory = category.dhikrs.filter(d => completedDhikrs.has(d.id)).length;
    return (completedInCategory / totalDhikrs) * 100;
  };

  const getTotalProgress = () => {
    const allDhikrs = azkarCategories.flatMap(cat => cat.dhikrs);
    const totalCompleted = allDhikrs.filter(d => completedDhikrs.has(d.id)).length;
    return (totalCompleted / allDhikrs.length) * 100;
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
            <h1 className="text-xl font-bold">Daily Azkar</h1>
            <p className="text-sm text-islamic-secondary/80">Morning & Evening Remembrance</p>
          </div>
          
          <div className="text-white text-sm">
            {Math.round(getTotalProgress())}%
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Overall Progress */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Today's Dhikr Progress</h2>
              <div className="w-full max-w-md mx-auto">
                <Progress value={getTotalProgress()} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">
                  {azkarCategories.flatMap(c => c.dhikrs).filter(d => completedDhikrs.has(d.id)).length} of {azkarCategories.flatMap(c => c.dhikrs).length} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <div className="grid gap-4 md:grid-cols-3">
          {azkarCategories.map((category) => {
            const IconComponent = category.icon;
            const progress = getCategoryProgress(category);
            const isSelected = category.dhikrs[0].category === selectedCategory;
            
            return (
              <motion.div
                key={category.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? "ring-2 ring-islamic-primary shadow-lg" 
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedCategory(category.dhikrs[0].category)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-xs text-gray-600">{category.time}</p>
                      </div>
                      {progress === 100 && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <Progress value={progress} className="h-2 mb-2" />
                    <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Category Dhikrs */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{currentCategory.title}</h2>
            <p className="text-gray-600">{currentCategory.description}</p>
            <Badge className="mt-2" variant="outline">{currentCategory.time}</Badge>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentCategory.dhikrs.map((dhikr, index) => {
                const currentProgress = dhikrProgress[dhikr.id] || 0;
                const isCompleted = completedDhikrs.has(dhikr.id);
                const progressPercentage = (currentProgress / dhikr.count) * 100;

                return (
                  <motion.div
                    key={dhikr.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`transition-all duration-200 ${
                      isCompleted ? "bg-green-50 border-green-200" : "hover:shadow-md"
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-sm font-semibold text-gray-700">
                              {currentProgress} / {dhikr.count}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetDhikr(dhikr.id)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Arabic Text */}
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-xl leading-relaxed font-arabic text-gray-900">
                            {dhikr.arabic}
                          </p>
                        </div>
                        
                        {/* Transliteration */}
                        <div>
                          <p className="text-islamic-primary italic leading-relaxed text-center">
                            {dhikr.transliteration}
                          </p>
                        </div>
                        
                        {/* Translation */}
                        <div>
                          <p className="text-gray-600 leading-relaxed text-center">
                            {dhikr.translation}
                          </p>
                        </div>
                        
                        {/* Counter Button */}
                        <div className="flex justify-center">
                          <Button
                            onClick={() => incrementDhikr(dhikr.id)}
                            disabled={isCompleted}
                            className={`w-24 h-24 rounded-full text-xl font-bold ${
                              isCompleted
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-islamic-primary hover:bg-islamic-primary/90"
                            }`}
                          >
                            {isCompleted ? "✓" : "+1"}
                          </Button>
                        </div>
                        
                        {/* Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-1">Benefit</h4>
                            <p className="text-sm text-gray-600">{dhikr.benefit}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-1">Source</h4>
                            <p className="text-sm text-gray-600">{dhikr.source}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Daily Reminder */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">Dhikr Reminder</h3>
            <p className="text-sm leading-relaxed mb-2">
              "Those who believe and whose hearts find rest in the remembrance of Allah. Verily, in the remembrance of Allah do hearts find rest."
            </p>
            <p className="text-xs text-islamic-secondary/80">- Quran 13:28</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}