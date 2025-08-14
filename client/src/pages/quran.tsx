import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Search, Play, Pause } from "lucide-react";

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  verses: number;
  revelation: 'Meccan' | 'Medinan';
  progress: number;
}

export default function Quran() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentlyReading, setCurrentlyReading] = useState<number | null>(null);

  // Sample Surahs data (first 10 for demo)
  const surahs: Surah[] = [
    { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", englishName: "The Opening", verses: 7, revelation: "Meccan", progress: 100 },
    { number: 2, name: "Al-Baqarah", arabicName: "البقرة", englishName: "The Cow", verses: 286, revelation: "Medinan", progress: 45 },
    { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", englishName: "Family of Imran", verses: 200, revelation: "Medinan", progress: 20 },
    { number: 4, name: "An-Nisa", arabicName: "النساء", englishName: "The Women", verses: 176, revelation: "Medinan", progress: 0 },
    { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", englishName: "The Table", verses: 120, revelation: "Medinan", progress: 0 },
    { number: 6, name: "Al-An'am", arabicName: "الأنعام", englishName: "The Cattle", verses: 165, revelation: "Meccan", progress: 15 },
    { number: 7, name: "Al-A'raf", arabicName: "الأعراف", englishName: "The Heights", verses: 206, revelation: "Meccan", progress: 0 },
    { number: 8, name: "Al-Anfal", arabicName: "الأنفال", englishName: "The Spoils", verses: 75, revelation: "Medinan", progress: 0 },
    { number: 9, name: "At-Tawbah", arabicName: "التوبة", englishName: "The Repentance", verses: 129, revelation: "Medinan", progress: 0 },
    { number: 10, name: "Yunus", arabicName: "يونس", englishName: "Jonah", verses: 109, revelation: "Meccan", progress: 30 }
  ];

  const filteredSurahs = surahs.filter(surah => 
    surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.arabicName.includes(searchTerm)
  );

  const overallProgress = Math.round(surahs.reduce((sum, surah) => sum + surah.progress, 0) / surahs.length);
  const completedSurahs = surahs.filter(surah => surah.progress === 100).length;

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
            <h1 className="text-xl font-bold">Quran Reader</h1>
            <p className="text-sm text-islamic-secondary/80">Read and track progress</p>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">Your Quran Journey</h2>
              <div className="text-4xl font-bold mb-2">{overallProgress}%</div>
              <p className="text-sm text-islamic-secondary/80">Overall Progress</p>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-3 mb-4">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{completedSurahs}</div>
                <div className="text-xs text-islamic-secondary/80">Surahs Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{114}</div>
                <div className="text-xs text-islamic-secondary/80">Total Surahs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search surahs..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-primary/20 focus:border-islamic-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Last Read */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Continue Reading</h3>
                <p className="text-sm text-blue-700">Al-Baqarah, Verse 117</p>
                <p className="text-xs text-blue-600">Last read 2 hours ago</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Surah List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">All Surahs</h3>
          
          {filteredSurahs.map((surah) => (
            <Card key={surah.number} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-islamic-gradient rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{surah.number}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{surah.name}</h4>
                        <span className="text-islamic-primary font-amiri text-lg">{surah.arabicName}</span>
                      </div>
                      <p className="text-sm text-gray-600">{surah.englishName}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-xs text-gray-500">{surah.verses} verses</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          surah.revelation === 'Meccan' 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {surah.revelation}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center min-w-[60px]">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {surah.progress}%
                    </div>
                    <div className="w-12 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          surah.progress === 100 ? 'bg-green-500' : 'bg-islamic-primary'
                        }`}
                        style={{ width: `${surah.progress}%` }}
                      ></div>
                    </div>
                    {surah.progress === 100 && (
                      <div className="text-xs text-green-600 mt-1">✓ Complete</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Goal */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Daily Reading Goal</h3>
            <p className="text-sm opacity-90 mb-4">
              Read at least 5 verses daily to maintain consistency
            </p>
            <Button className="bg-white text-green-600 hover:bg-white/90">
              Set Reading Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}