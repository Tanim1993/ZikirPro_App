import { useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Heart, BookOpen, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface AsmaName {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
  meaning: string;
  benefit: string;
  recitation: string;
}

export default function NinetyNineNames() {
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const asmaUlHusna: AsmaName[] = [
    {
      number: 1,
      arabic: "ٱلرَّحْمَٰنُ",
      transliteration: "Ar-Rahman",
      translation: "The Most Merciful",
      meaning: "The One who acts with extreme kindness, mercy, and love",
      benefit: "Recite 100 times after Fajr for Allah's mercy and blessings",
      recitation: "ar-rahman"
    },
    {
      number: 2,
      arabic: "ٱلرَّحِيمُ",
      transliteration: "Ar-Raheem",
      translation: "The Most Compassionate",
      meaning: "The One who acts with gentleness and continuous mercy",
      benefit: "Recite when facing difficulties for comfort and relief",
      recitation: "ar-raheem"
    },
    {
      number: 3,
      arabic: "ٱلْمَلِكُ",
      transliteration: "Al-Malik",
      translation: "The King",
      meaning: "The One who reigns and rules over everything in existence",
      benefit: "Recite for leadership qualities and just decision-making",
      recitation: "al-malik"
    },
    {
      number: 4,
      arabic: "ٱلْقُدُّوسُ",
      transliteration: "Al-Quddus",
      translation: "The Holy",
      meaning: "The One who is pure, sacred, and free from any defects",
      benefit: "Recite for spiritual purification and cleansing of sins",
      recitation: "al-quddus"
    },
    {
      number: 5,
      arabic: "ٱلسَّلَامُ",
      transliteration: "As-Salaam",
      translation: "The Peace",
      meaning: "The One who is the source of peace and safety",
      benefit: "Recite for inner peace and protection from harm",
      recitation: "as-salaam"
    },
    {
      number: 6,
      arabic: "ٱلْمُؤْمِنُ",
      transliteration: "Al-Mu'min",
      translation: "The Guardian of Faith",
      meaning: "The One who grants security and removes fear",
      benefit: "Recite for strengthening faith and removing anxiety",
      recitation: "al-mumin"
    },
    {
      number: 7,
      arabic: "ٱلْمُهَيْمِنُ",
      transliteration: "Al-Muhaymin",
      translation: "The Protector",
      meaning: "The One who watches over and protects all creation",
      benefit: "Recite for protection and divine guardianship",
      recitation: "al-muhaymin"
    },
    {
      number: 8,
      arabic: "ٱلْعَزِيزُ",
      transliteration: "Al-Aziz",
      translation: "The Mighty",
      meaning: "The One who is most powerful and cannot be defeated",
      benefit: "Recite for strength and overcoming obstacles",
      recitation: "al-aziz"
    }
    // Adding first 8 names for demonstration - in a real app, all 99 would be included
  ];

  const filteredNames = asmaUlHusna.filter(name => 
    name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (number: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(number)) {
      newFavorites.delete(number);
    } else {
      newFavorites.add(number);
    }
    setFavorites(newFavorites);
  };

  const playAudio = (name: AsmaName) => {
    if (currentPlaying === name.number) {
      setCurrentPlaying(null);
      audioRef.current?.pause();
    } else {
      setCurrentPlaying(name.number);
      // In a real app, this would load actual audio files
      // audioRef.current = new Audio(`/assets/audio/99-names/${name.recitation}.mp3`);
      // audioRef.current.play();
    }
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
            <h1 className="text-xl font-bold">99 Names of Allah</h1>
            <p className="text-sm text-islamic-secondary/80">Asma ul-Husna</p>
          </div>
          
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Introduction */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">أَسْمَاءُ ٱللّٰهِ ٱلْحُسْنَىٰ</h2>
              <p className="text-gray-600 leading-relaxed">
                The Beautiful Names of Allah are the perfect attributes that describe the essence of Allah. 
                Each name carries deep spiritual meaning and offers unique blessings when recited with devotion.
              </p>
              <div className="flex justify-center space-x-4 text-sm text-gray-500">
                <span>• Complete Collection</span>
                <span>• Audio Pronunciations</span>
                <span>• Spiritual Benefits</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <input
              type="text"
              placeholder="Search names by transliteration, translation, or meaning..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent"
            />
          </CardContent>
        </Card>

        {/* Names Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {filteredNames.map((name, index) => (
            <motion.div
              key={name.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-islamic-gradient rounded-full flex items-center justify-center text-white font-bold">
                        {name.number}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 font-arabic">{name.arabic}</h3>
                        <p className="text-lg text-islamic-primary font-semibold">{name.transliteration}</p>
                        <p className="text-sm text-gray-600">{name.translation}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(name.number)}
                        className={favorites.has(name.number) ? "text-red-500" : "text-gray-400"}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(name.number) ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(name)}
                        className="text-islamic-primary"
                      >
                        {currentPlaying === name.number ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-islamic-primary" />
                      Meaning
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{name.meaning}</p>
                  </div>
                  <div className="bg-islamic-secondary/10 p-3 rounded-lg">
                    <h4 className="font-semibold text-islamic-primary text-sm mb-1">Spiritual Benefit</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{name.benefit}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Premium Features Notice */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <CardContent className="p-6 text-center">
            <Crown className="w-8 h-8 mx-auto mb-3 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Features</h3>
            <p className="text-gray-600 text-sm mb-4">
              This demo shows 8 names. Premium users get access to all 99 names with high-quality audio pronunciations, 
              detailed etymological explanations, and personalized recitation schedules.
            </p>
            <Link href="/premium-addons">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Upgrade to Premium
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Daily Verse */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">Daily Reflection</h3>
            <p className="text-sm leading-relaxed mb-2">
              "And to Allah belong the best names, so invoke Him by them."
            </p>
            <p className="text-xs text-islamic-secondary/80">- Quran 7:180</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}