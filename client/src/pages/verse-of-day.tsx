import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Heart, Share2, Calendar, Crown, RefreshCw, Copy, Check, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

interface VerseOfDay {
  id: string;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahNumber: number;
  arabic: string;
  transliteration: string;
  translation: string;
  context: string;
  tafsir: string;
  spiritualReflection: string;
  practicalApplication: string;
  relatedVerses: string[];
  theme: string;
  revelation: string;
  date: string;
}

export default function VerseOfDay() {
  const [currentVerse, setCurrentVerse] = useState<VerseOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  // Demo verse data
  const demoVerses: VerseOfDay[] = [
    {
      id: "2-255",
      surahNumber: 2,
      surahName: "Al-Baqarah",
      surahNameArabic: "البقرة",
      ayahNumber: 255,
      arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّن عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      transliteration: "Allah - la ilaha illa huwa, al-hayyu al-qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fi as-samawati wa ma fi al-ard. Man dha alladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhu as-samawati wa al-ard, wa la ya'uduhu hifzuhuma. Wa huwa al-'aliyu al-'azim.",
      translation: "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
      context: "Known as Ayat al-Kursi, this is considered one of the most powerful verses in the Quran. It was revealed in Madinah and emphasizes Allah's absolute sovereignty and knowledge.",
      tafsir: "This verse describes Allah's eternal existence, complete awareness, and absolute authority over all creation. The 'Kursi' represents Allah's knowledge and power that encompasses everything in existence. No intercession can occur without His permission, and His maintenance of the universe requires no effort.",
      spiritualReflection: "Reflecting on this verse reminds us of our complete dependence on Allah and His infinite power. It brings comfort knowing that the One who never sleeps is constantly watching over us and protecting us.",
      practicalApplication: "Recite this verse for protection, especially before sleeping, traveling, or when feeling anxious. It's recommended to recite it after each prayer and when entering or leaving your home.",
      relatedVerses: ["Quran 3:2", "Quran 20:111", "Quran 59:23"],
      theme: "Divine Sovereignty and Protection",
      revelation: "Madinah",
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: "94-5-6",
      surahNumber: 94,
      surahName: "Ash-Sharh",
      surahNameArabic: "الشرح",
      ayahNumber: 5,
      arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      transliteration: "Fa-inna ma'a al-'usri yusra. Inna ma'a al-'usri yusra.",
      translation: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
      context: "This verse was revealed during a time when Prophet Muhammad (PBUH) faced significant challenges in Makkah. It provided reassurance that relief always accompanies difficulty.",
      tafsir: "The repetition emphasizes certainty and multiple forms of ease. Islamic scholars note that one hardship is mentioned with two instances of ease, indicating that ease will always outweigh difficulty.",
      spiritualReflection: "This verse teaches us that Allah never burdens us beyond our capacity. Every difficulty contains within it the seeds of relief and growth. It's a reminder to remain patient and maintain hope during challenging times.",
      practicalApplication: "Remember this verse during difficult times to maintain hope and perspective. It's particularly helpful during illness, financial hardship, or emotional distress.",
      relatedVerses: ["Quran 2:286", "Quran 65:2-3", "Quran 3:139"],
      theme: "Hope and Perseverance",
      revelation: "Makkah",
      date: new Date().toISOString().split('T')[0]
    }
  ];

  const loadTodaysVerse = () => {
    setLoading(true);
    // Simulate API call for today's verse
    setTimeout(() => {
      const todayIndex = new Date().getDate() % demoVerses.length;
      setCurrentVerse(demoVerses[todayIndex]);
      setLoading(false);
    }, 1000);
  };

  const copyVerse = () => {
    if (!currentVerse) return;
    const text = `${currentVerse.arabic}\n\n${currentVerse.transliteration}\n\n${currentVerse.translation}\n\n- Quran ${currentVerse.surahNumber}:${currentVerse.ayahNumber}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVerse = async () => {
    if (!currentVerse) return;
    if (navigator.share) {
      await navigator.share({
        title: `Verse of the Day - ${currentVerse.surahName} ${currentVerse.ayahNumber}`,
        text: currentVerse.translation,
        url: window.location.href
      });
    }
  };

  useEffect(() => {
    loadTodaysVerse();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-islamic-primary" />
          <p className="text-gray-600">Loading today's verse...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold">Verse of the Day</h1>
            <p className="text-sm text-islamic-secondary/80">Daily Quranic Reflection</p>
          </div>
          
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {currentVerse && (
          <>
            {/* Main Verse Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-islamic-primary">
                        {currentVerse.surahName}
                      </CardTitle>
                      <p className="text-lg text-gray-600 font-arabic">{currentVerse.surahNameArabic}</p>
                      <p className="text-sm text-gray-500">
                        Surah {currentVerse.surahNumber}, Ayah {currentVerse.ayahNumber} • {currentVerse.revelation}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFavorited(!favorited)}
                        className={favorited ? "text-red-500" : "text-gray-400"}
                      >
                        <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-islamic-primary">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyVerse}
                        className="text-islamic-primary"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={shareVerse}
                        className="text-islamic-primary"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Arabic Text */}
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-2xl leading-relaxed font-arabic text-gray-900">
                      {currentVerse.arabic}
                    </p>
                  </div>
                  
                  {/* Transliteration */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Pronunciation</h3>
                    <p className="text-islamic-primary italic leading-relaxed text-lg">
                      {currentVerse.transliteration}
                    </p>
                  </div>
                  
                  {/* Translation */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Translation</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {currentVerse.translation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Context & Tafsir */}
            <div className="grid gap-6 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-islamic-primary">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Context & Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Historical Context</h4>
                    <p className="text-gray-600 leading-relaxed">{currentVerse.context}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Commentary (Tafsir)</h4>
                    <p className="text-gray-600 leading-relaxed">{currentVerse.tafsir}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spiritual Reflection */}
            <Card className="bg-gradient-to-r from-islamic-secondary/10 to-islamic-primary/10">
              <CardHeader>
                <CardTitle className="text-islamic-primary">Spiritual Reflection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Personal Reflection</h4>
                  <p className="text-gray-600 leading-relaxed">{currentVerse.spiritualReflection}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Practical Application</h4>
                  <p className="text-gray-600 leading-relaxed">{currentVerse.practicalApplication}</p>
                </div>
              </CardContent>
            </Card>

            {/* Theme & Related Verses */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-islamic-primary">Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-islamic-primary/10 text-islamic-primary border-islamic-primary/20">
                    {currentVerse.theme}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-islamic-primary">Related Verses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentVerse.relatedVerses.map((verse, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {verse}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Actions */}
            <Card className="border border-islamic-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-islamic-primary">
                  <Calendar className="w-5 h-5 mr-2" />
                  Today's Spiritual Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Reflect on this verse throughout the day and consider how it applies to your current life situation.
                </p>
                <div className="flex space-x-4">
                  <Button 
                    onClick={loadTodaysVerse}
                    className="bg-islamic-primary hover:bg-islamic-primary/90"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Verse
                  </Button>
                  <Link href="/quran">
                    <Button variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read Full Surah
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Premium Features Notice */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <CardContent className="p-6 text-center">
            <Crown className="w-8 h-8 mx-auto mb-3 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Features</h3>
            <p className="text-gray-600 text-sm mb-4">
              This demo shows basic verse features. Premium users get daily personalized verses, 
              audio recitations from multiple Qaris, detailed scholarly commentary, and custom verse collections.
            </p>
            <Link href="/premium-addons">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Upgrade for Daily Verses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}