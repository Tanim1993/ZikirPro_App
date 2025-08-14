import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scroll, Heart, Share2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hadith {
  id: number;
  arabic: string;
  english: string;
  narrator: string;
  collection: string;
  reference: string;
  category: string;
}

export default function HadithCollection() {
  const { toast } = useToast();
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Sample Hadith collection (authentic examples)
  const hadiths: Hadith[] = [
    {
      id: 1,
      arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      english: "Actions are but by intention and every man shall have but that which he intended.",
      narrator: "Umar ibn al-Khattab",
      collection: "Sahih al-Bukhari",
      reference: "Book 1, Hadith 1",
      category: "Faith & Intentions"
    },
    {
      id: 2,
      arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
      english: "Whoever believes in Allah and the Last Day should speak good or keep silent.",
      narrator: "Abu Hurairah",
      collection: "Sahih al-Bukhari",
      reference: "Book 78, Hadith 136",
      category: "Speech & Manners"
    },
    {
      id: 3,
      arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
      english: "A Muslim is one from whose tongue and hands the Muslims are safe.",
      narrator: "Abdullah ibn Amr",
      collection: "Sahih al-Bukhari",
      reference: "Book 2, Hadith 10",
      category: "Character"
    },
    {
      id: 4,
      arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
      english: "None of you truly believes until he loves for his brother what he loves for himself.",
      narrator: "Anas ibn Malik",
      collection: "Sahih al-Bukhari",
      reference: "Book 2, Hadith 12",
      category: "Brotherhood"
    },
    {
      id: 5,
      arabic: "الدِّينُ النَّصِيحَةُ",
      english: "Religion is sincere advice.",
      narrator: "Tamim ibn Aws",
      collection: "Sahih Muslim",
      reference: "Book 1, Hadith 95",
      category: "Sincerity"
    }
  ];

  const currentHadith = hadiths[currentHadithIndex];

  const nextHadith = () => {
    setCurrentHadithIndex((prev) => (prev + 1) % hadiths.length);
  };

  const previousHadith = () => {
    setCurrentHadithIndex((prev) => (prev - 1 + hadiths.length) % hadiths.length);
  };

  const toggleFavorite = (hadithId: number) => {
    setFavorites(prev => 
      prev.includes(hadithId) 
        ? prev.filter(id => id !== hadithId)
        : [...prev, hadithId]
    );
    
    toast({
      title: favorites.includes(hadithId) ? "Removed from Favorites" : "Added to Favorites",
      description: favorites.includes(hadithId) 
        ? "Hadith removed from your favorites" 
        : "Hadith saved to your favorites",
    });
  };

  const shareHadith = async () => {
    const shareText = `${currentHadith.english}\n\n- Prophet Muhammad (PBUH)\nNarrated by ${currentHadith.narrator}\n${currentHadith.collection}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Islamic Hadith',
          text: shareText
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard",
          description: "Hadith text copied for sharing",
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard",
        description: "Hadith text copied for sharing",
      });
    }
  };

  const categories = Array.from(new Set(hadiths.map(h => h.category)));

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
            <h1 className="text-xl font-bold">Hadith Collection</h1>
            <p className="text-sm text-islamic-secondary/80">Prophetic traditions</p>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Daily Hadith Counter */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Daily Hadith</h2>
                <p className="text-sm text-islamic-secondary/80">
                  {currentHadithIndex + 1} of {hadiths.length}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Scroll className="w-8 h-8 text-white" />
                </div>
                <div className="text-xs text-islamic-secondary/80">Today's Learning</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Hadith Card */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-islamic-primary/10 text-islamic-primary`}>
                {currentHadith.category}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavorite(currentHadith.id)}
                  className={favorites.includes(currentHadith.id) ? "text-red-500" : "text-gray-500"}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(currentHadith.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button size="sm" variant="ghost" onClick={shareHadith}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Arabic Text */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-xl leading-relaxed font-amiri text-islamic-primary" dir="rtl">
                {currentHadith.arabic}
              </p>
            </div>

            {/* English Translation */}
            <div className="space-y-4">
              <p className="text-gray-800 leading-relaxed text-lg">
                "{currentHadith.english}"
              </p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Narrated by:</span> {currentHadith.narrator}
                </p>
                <p>
                  <span className="font-semibold">Source:</span> {currentHadith.collection}, {currentHadith.reference}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button 
                onClick={previousHadith}
                variant="outline"
                size="sm"
                disabled={currentHadithIndex === 0}
              >
                Previous
              </Button>
              
              <div className="text-sm text-gray-500">
                {currentHadithIndex + 1} / {hadiths.length}
              </div>
              
              <Button 
                onClick={nextHadith}
                variant="outline"
                size="sm"
                disabled={currentHadithIndex === hadiths.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-islamic-primary" />
              Browse Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category, index) => {
                const categoryCount = hadiths.filter(h => h.category === category).length;
                return (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="justify-start h-auto p-3"
                    onClick={() => {
                      const firstIndex = hadiths.findIndex(h => h.category === category);
                      setCurrentHadithIndex(firstIndex);
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{category}</div>
                      <div className="text-xs text-gray-500">{categoryCount} hadith{categoryCount !== 1 ? 's' : ''}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        {favorites.length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-800 flex items-center">
                <Heart className="w-5 h-5 mr-2 fill-current" />
                Favorite Hadiths ({favorites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700">
                You have {favorites.length} hadith{favorites.length !== 1 ? 's' : ''} saved in your favorites for easy reference.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reflection Card */}
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Daily Reflection</h3>
            <p className="text-sm opacity-90 mb-4">
              Take a moment to reflect on today's hadith and how you can apply its wisdom in your life.
            </p>
            <Button className="bg-white text-purple-600 hover:bg-white/90">
              Add Personal Note
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}