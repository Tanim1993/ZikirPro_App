import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Play, Pause, BookOpen, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Verse {
  number: number;
  text: string;
  translation: string;
  audio?: string;
}

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  verses: Verse[];
  totalVerses: number;
  revelation: 'Meccan' | 'Medinan';
}

// Sample Quran data - Al-Fatihah (The Opening)
const alFatihah: Surah = {
  number: 1,
  name: "Al-Fatihah",
  arabicName: "الفاتحة",
  englishName: "The Opening",
  totalVerses: 7,
  revelation: "Meccan",
  verses: [
    {
      number: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful."
    },
    {
      number: 2,
      text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation: "All praise is due to Allah, Lord of the worlds."
    },
    {
      number: 3,
      text: "الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "The Entirely Merciful, the Especially Merciful,"
    },
    {
      number: 4,
      text: "مَالِكِ يَوْمِ الدِّينِ",
      translation: "Sovereign of the Day of Recompense."
    },
    {
      number: 5,
      text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translation: "It is You we worship and You we ask for help."
    },
    {
      number: 6,
      text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      translation: "Guide us to the straight path -"
    },
    {
      number: 7,
      text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray."
    }
  ]
};

export default function QuranReader() {
  const { toast } = useToast();
  const [selectedSurah, setSelectedSurah] = useState<Surah>(alFatihah);
  const [currentVerse, setCurrentVerse] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load reading progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('quranProgress');
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      const surahProgress = progressData[selectedSurah.number.toString()];
      if (surahProgress) {
        setCurrentVerse(surahProgress.lastVerse || 1);
        setProgress(surahProgress.progress || 0);
      }
    }
  }, [selectedSurah.number]);

  // Save progress when verse changes
  useEffect(() => {
    const progressPercentage = Math.round((currentVerse / selectedSurah.totalVerses) * 100);
    setProgress(progressPercentage);
    
    // Save to localStorage
    const savedProgress = JSON.parse(localStorage.getItem('quranProgress') || '{}');
    savedProgress[selectedSurah.number.toString()] = {
      lastVerse: currentVerse,
      progress: progressPercentage,
      lastRead: new Date().toISOString()
    };
    localStorage.setItem('quranProgress', JSON.stringify(savedProgress));
  }, [currentVerse, selectedSurah]);

  const nextVerse = () => {
    if (currentVerse < selectedSurah.verses.length) {
      setCurrentVerse(prev => prev + 1);
    } else {
      toast({
        title: "Surah Completed!",
        description: `You have completed reading ${selectedSurah.name}. Barakallahu feeki!`,
      });
    }
  };

  const previousVerse = () => {
    if (currentVerse > 1) {
      setCurrentVerse(prev => prev - 1);
    }
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // Note: Audio playback would be implemented with actual audio files
    toast({
      title: isPlaying ? "Audio Paused" : "Audio Playing",
      description: `Verse ${currentVerse} - ${selectedSurah.name}`,
    });
  };

  const currentVerseData = selectedSurah.verses[currentVerse - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10">
      {/* Header */}
      <header className="bg-islamic-gradient text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/quran">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Surahs
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold">{selectedSurah.name}</h1>
            <p className="text-sm text-islamic-secondary/80">
              {selectedSurah.arabicName} • {selectedSurah.englishName}
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20"
            onClick={() => setAutoPlay(!autoPlay)}
          >
            {autoPlay ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Progress Card */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold">Reading Progress</h2>
                <p className="text-sm text-islamic-secondary/80">
                  Verse {currentVerse} of {selectedSurah.totalVerses}
                </p>
              </div>
              <div className="text-2xl font-bold">
                {progress}%
              </div>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Main Reading Area */}
        <Card className="bg-white shadow-xl">
          <CardContent className="p-6">
            {/* Bismillah for first verse if it's not Al-Fatihah */}
            {selectedSurah.number !== 1 && currentVerse === 1 && (
              <div className="text-center mb-8 p-4 bg-islamic-gradient/5 rounded-lg">
                <p className="text-2xl font-amiri text-islamic-primary mb-2" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-sm text-gray-600">
                  In the name of Allah, the Entirely Merciful, the Especially Merciful.
                </p>
              </div>
            )}

            {/* Current Verse */}
            <div className="space-y-6">
              {/* Arabic Text */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-10 h-10 bg-islamic-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{currentVerse}</span>
                  </div>
                </div>
                <p className="text-3xl leading-relaxed font-amiri text-islamic-primary mb-4" dir="rtl">
                  {currentVerseData?.text}
                </p>
                
                {/* Audio Control */}
                <Button
                  onClick={toggleAudio}
                  variant="outline"
                  className="mt-4"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Listen'}
                </Button>
              </div>

              {/* Translation */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Translation</h3>
                <p className="text-gray-800 leading-relaxed">
                  {currentVerseData?.translation}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <Button 
                  onClick={previousVerse}
                  variant="outline"
                  disabled={currentVerse === 1}
                >
                  Previous Verse
                </Button>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500">
                    Verse {currentVerse} of {selectedSurah.totalVerses}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {selectedSurah.revelation} • {selectedSurah.totalVerses} verses
                  </div>
                </div>
                
                <Button 
                  onClick={nextVerse}
                  variant="outline"
                  disabled={currentVerse === selectedSurah.verses.length}
                >
                  Next Verse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Tips */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Reading Tips
            </h3>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Take your time to reflect on each verse</p>
              <p>• Try to understand the meaning before moving forward</p>
              <p>• Use the audio feature to learn proper pronunciation</p>
              <p>• Your progress is automatically saved</p>
            </div>
          </CardContent>
        </Card>

        {/* Completion Message */}
        {currentVerse === selectedSurah.verses.length && (
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Surah Completed!</h3>
              <p className="text-sm opacity-90 mb-4">
                Alhamdulillahi rabbil alameen! You have completed {selectedSurah.name}.
              </p>
              <Link href="/quran">
                <Button className="bg-white text-green-600 hover:bg-white/90">
                  Continue to Next Surah
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}