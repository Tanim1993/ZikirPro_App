import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, BookOpen, Clock, Sparkles, Crown, RefreshCw, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

interface Dua {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: string;
  situation: string;
  source: string;
  benefits: string[];
  timing: string;
}

interface UserProfile {
  recentChallenges: string[];
  prayerConsistency: number;
  currentGoals: string[];
  timePreference: string;
}

export default function DuaRecommendations() {
  const [personalizedDuas, setPersonalizedDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedDua, setCopiedDua] = useState<string | null>(null);
  const [userProfile] = useState<UserProfile>({
    recentChallenges: ["work_stress", "health_concerns", "family_relationships"],
    prayerConsistency: 85,
    currentGoals: ["increase_zikir", "learn_quran", "improve_patience"],
    timePreference: "morning"
  });

  const allDuas: Dua[] = [
    {
      id: "stress_relief",
      arabic: "اللّهُـمَّ إِنِّي أَعُوذُ بِكَ مِنَ الهَـمِّ وَ الحُـزْنِ، وَالعَجْزِ وَالكَسَلِ وَالبُخْلِ وَالجُـبْنِ، وَضَلْعِ الدَّيْنِ وَغَلَبَةِ الرِّجَال",
      transliteration: "Allahumma inni a'udhu bika minal-hammi wal-huzni, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dal'id-dayni wa ghalabatir-rijal",
      translation: "O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from stinginess and cowardice, and from the burden of debt and domination by people",
      category: "Stress Relief",
      situation: "When feeling overwhelmed or anxious",
      source: "Sahih Bukhari",
      benefits: ["Reduces anxiety", "Brings peace of mind", "Strengthens reliance on Allah"],
      timing: "Any time when stressed"
    },
    {
      id: "morning_protection",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq",
      translation: "I seek refuge in the perfect words of Allah from the evil of what He has created",
      category: "Protection",
      situation: "Morning protection and daily safety",
      source: "Sahih Muslim",
      benefits: ["Daily protection", "Shields from harm", "Strengthens faith"],
      timing: "Morning after Fajr"
    },
    {
      id: "patience_dua",
      arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
      translation: "O Allah, help me to remember You, to thank You, and to worship You in the best manner",
      category: "Spiritual Growth",
      situation: "When striving to improve worship and patience",
      source: "Sunan Abu Dawud",
      benefits: ["Increases patience", "Improves worship quality", "Enhances gratitude"],
      timing: "After each prayer"
    },
    {
      id: "family_harmony",
      arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
      transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama",
      translation: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous",
      category: "Family",
      situation: "For family relationships and harmony",
      source: "Quran 25:74",
      benefits: ["Strengthens family bonds", "Brings peace at home", "Guides family to righteousness"],
      timing: "Evening or during family time"
    },
    {
      id: "health_dua",
      arabic: "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي",
      transliteration: "Allahumma aslih li dini alladhi huwa 'ismatu amri, wa aslih li dunyaya allati fiha ma'ashi",
      translation: "O Allah, make righteous my religion which is the safeguard of my affairs, and make righteous my worldly life wherein is my livelihood",
      category: "Health & Wellness",
      situation: "When concerned about health or worldly matters",
      source: "Sahih Muslim",
      benefits: ["Improves overall well-being", "Balances spiritual and worldly life", "Brings healing"],
      timing: "Morning and evening"
    }
  ];

  const generatePersonalizedRecommendations = () => {
    setLoading(true);
    
    // Simulate AI analysis based on user profile
    setTimeout(() => {
      let recommendations: Dua[] = [];
      
      // Based on recent challenges
      if (userProfile.recentChallenges.includes("work_stress")) {
        recommendations.push(allDuas.find(d => d.id === "stress_relief")!);
      }
      if (userProfile.recentChallenges.includes("family_relationships")) {
        recommendations.push(allDuas.find(d => d.id === "family_harmony")!);
      }
      if (userProfile.recentChallenges.includes("health_concerns")) {
        recommendations.push(allDuas.find(d => d.id === "health_dua")!);
      }
      
      // Based on time preference
      if (userProfile.timePreference === "morning") {
        recommendations.push(allDuas.find(d => d.id === "morning_protection")!);
      }
      
      // Based on current goals
      if (userProfile.currentGoals.includes("improve_patience")) {
        recommendations.push(allDuas.find(d => d.id === "patience_dua")!);
      }
      
      setPersonalizedDuas(recommendations);
      setLoading(false);
    }, 1500);
  };

  const copyDua = (dua: Dua) => {
    const text = `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}`;
    navigator.clipboard.writeText(text);
    setCopiedDua(dua.id);
    setTimeout(() => setCopiedDua(null), 2000);
  };

  useEffect(() => {
    generatePersonalizedRecommendations();
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
            <h1 className="text-xl font-bold">Personalized Duas</h1>
            <p className="text-sm text-islamic-secondary/80">AI-Powered Recommendations</p>
          </div>
          
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* AI Analysis Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-900">
              <Sparkles className="w-5 h-5 mr-2" />
              AI Spiritual Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Recent Focus Areas</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Work stress management</li>
                  <li>• Family relationship harmony</li>
                  <li>• Health concerns</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Prayer Consistency</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-green-600 font-semibold">85%</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Spiritual Goals</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Increase Zikir practice</li>
                  <li>• Learn Quran</li>
                  <li>• Improve patience</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={generatePersonalizedRecommendations}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Recommendations
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Duas */}
        {personalizedDuas.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Your Personalized Duas</h2>
            
            {personalizedDuas.map((dua, index) => (
              <motion.div
                key={dua.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-islamic-primary">{dua.category}</CardTitle>
                        <p className="text-sm text-gray-600">{dua.situation}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyDua(dua)}
                        className="text-islamic-primary"
                      >
                        {copiedDua === dua.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Arabic Text */}
                    <div className="bg-gray-50 p-4 rounded-lg text-right">
                      <p className="text-xl leading-relaxed font-arabic text-gray-900">{dua.arabic}</p>
                    </div>
                    
                    {/* Transliteration */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Pronunciation</h4>
                      <p className="text-islamic-primary italic leading-relaxed">{dua.transliteration}</p>
                    </div>
                    
                    {/* Translation */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Translation</h4>
                      <p className="text-gray-600 leading-relaxed">{dua.translation}</p>
                    </div>
                    
                    {/* Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <Heart className="w-4 h-4 mr-1 text-red-500" />
                          Benefits
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {dua.benefits.map((benefit, idx) => (
                            <li key={idx}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-blue-500" />
                          Best Time
                        </h4>
                        <p className="text-sm text-gray-600">{dua.timing}</p>
                        <p className="text-xs text-gray-500 mt-1">Source: {dua.source}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Premium Features Notice */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <CardContent className="p-6 text-center">
            <Crown className="w-8 h-8 mx-auto mb-3 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium AI Features</h3>
            <p className="text-gray-600 text-sm mb-4">
              This demo shows basic personalized recommendations. Premium users get advanced AI analysis, 
              500+ categorized duas, audio pronunciations, and smart reminder scheduling.
            </p>
            <Link href="/premium-addons">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Upgrade for Full AI Features
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Daily Verse */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">Spiritual Reminder</h3>
            <p className="text-sm leading-relaxed mb-2">
              "And when My servants ask you, [O Muhammad], concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me."
            </p>
            <p className="text-xs text-islamic-secondary/80">- Quran 2:186</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}