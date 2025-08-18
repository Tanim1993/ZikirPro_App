import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Calculator, Navigation, Heart, Scroll, CloudOff, Trophy, Shield, Star, Compass, AudioLines, Calendar, Zap, Target, Crown, Users } from "lucide-react";

export default function More() {
  const islamicToolsCategories = [
    {
      title: "Worship & Prayers",
      description: "Complete suite of Salah tracking and prayer management tools",
      icon: Clock,
      color: "from-blue-500 to-blue-700",
      tools: [
        {
          title: "Smart Salah Tracker",
          description: "Advanced prayer tracking with Qaza management, missed prayers recovery, and prayer time notifications",
          href: "/salah-tracker",
          isPremium: true
        },
        {
          title: "Prayer Statistics",
          description: "Detailed analytics on your prayer consistency and spiritual growth patterns",
          href: "/salah-stats",
          isPremium: true
        },
        {
          title: "Qaza Calculator",
          description: "Calculate and manage missed prayers with systematic recovery plans",
          href: "/qaza-calculator",
          isPremium: false
        }
      ]
    },
    {
      title: "Quran & Knowledge",
      description: "Comprehensive Quranic study tools and Islamic learning resources",
      icon: BookOpen,
      color: "from-indigo-500 to-indigo-700",
      tools: [
        {
          title: "Quran Reader",
          description: "Read with Arabic text, translations, and audio recitations from renowned Qaris",
          href: "/quran",
          isPremium: false
        },
        {
          title: "Quranic Verse of the Day",
          description: "Daily verses with detailed context, tafsir, and spiritual reflections",
          href: "/verse-of-day",
          isPremium: true
        },
        {
          title: "Hadith Collection",
          description: "Authentic Hadith from Sahih Bukhari, Muslim, and other trusted sources",
          href: "/hadith",
          isPremium: false
        },
        {
          title: "Islamic Learning Hub",
          description: "Interactive courses on Islamic history, jurisprudence, and spiritual development",
          href: "/learning-hub",
          isPremium: true
        }
      ]
    },
    {
      title: "Duas & Remembrance",
      description: "Personalized supplications and advanced Zikir tools",
      icon: Star,
      color: "from-purple-500 to-purple-700",
      tools: [
        {
          title: "99 Names of Allah",
          description: "Complete Asma ul-Husna with audio pronunciations, meanings, and benefits",
          href: "/99-names",
          isPremium: true
        },
        {
          title: "Personalized Dua Recommendations",
          description: "AI-powered dua suggestions based on your spiritual needs and life situations",
          href: "/dua-recommendations",
          isPremium: true
        },
        {
          title: "Morning & Evening Azkar",
          description: "Complete collection of daily remembrance with tracking and reminders",
          href: "/daily-azkar",
          isPremium: false
        }
      ]
    },
    {
      title: "Navigation & Direction",
      description: "Advanced location-based Islamic tools and compass features",
      icon: Compass,
      color: "from-green-500 to-green-700",
      tools: [
        {
          title: "Advanced Qiblah with AR",
          description: "AR-powered Qiblah finder with real-time compass and 3D Kaaba visualization",
          href: "/qiblah",
          isPremium: true
        },
        {
          title: "Prayer Times by Location",
          description: "Accurate prayer times for any location worldwide with automatic adjustments",
          href: "/prayer-times",
          isPremium: false
        },
        {
          title: "Mosque Finder",
          description: "Find nearby mosques with reviews, prayer times, and community information",
          href: "/mosque-finder",
          isPremium: true
        }
      ]
    },
    {
      title: "Islamic Finance",
      description: "Comprehensive Zakat calculation and Islamic financial management",
      icon: Calculator,
      color: "from-teal-500 to-teal-700",
      tools: [
        {
          title: "Advanced Zakat Calculator",
          description: "Complete Zakat calculation with savings tracking, gold/silver rates, and business assets",
          href: "/zakat-calculator",
          isPremium: true
        },
        {
          title: "Charity Tracker",
          description: "Track your Sadaqah, Zakat payments, and charitable giving with detailed records",
          href: "/charity-tracker",
          isPremium: true
        },
        {
          title: "Islamic Donations",
          description: "Support verified Islamic causes and charity organizations globally",
          href: "/donations",
          isPremium: false
        }
      ]
    },
    {
      title: "Community & Competitions",
      description: "Connect with Muslim community and participate in spiritual competitions",
      icon: Trophy,
      color: "from-rose-500 to-rose-700",
      tools: [
        {
          title: "Seasonal Competitions",
          description: "Join special Ramadan, Hajj, and Muharram competitions with exclusive rewards",
          href: "/seasonal-competitions",
          isPremium: false
        },
        {
          title: "Community Challenges",
          description: "Participate in group Zikir challenges and community spiritual goals",
          href: "/community-challenges",
          isPremium: true
        },
        {
          title: "Islamic Social Network",
          description: "Connect with Muslims worldwide, share spiritual progress, and find prayer partners",
          href: "/islamic-social",
          isPremium: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10">
      {/* Header */}
      <header className="bg-islamic-gradient text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Advanced Islamic Tools</h1>
            <p className="text-sm text-islamic-secondary/80">Comprehensive spiritual toolkit</p>
          </div>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Islamic Toolkit</h2>
          <p className="text-gray-600">Subject-wise organized spiritual tools and authentic resources</p>
        </div>

        {/* Subject Categories */}
        <div className="space-y-8">
          {islamicToolsCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            return (
              <div key={categoryIndex} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>

                {/* Tools Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-16">
                  {category.tools.map((tool, toolIndex) => (
                    <Link key={toolIndex} href={tool.href}>
                      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base text-gray-900 flex-1 pr-2">{tool.title}</CardTitle>
                            {tool.isPremium && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Access Tools */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-islamic-primary" />
            Quick Access Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/offline-demo">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group text-center p-4">
                <CloudOff className="w-6 h-6 mx-auto mb-2 text-gray-600 group-hover:text-islamic-primary transition-colors" />
                <p className="text-sm font-medium">Offline Sync</p>
              </Card>
            </Link>
            <Link href="/animations-demo">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group text-center p-4">
                <Star className="w-6 h-6 mx-auto mb-2 text-gray-600 group-hover:text-islamic-primary transition-colors" />
                <p className="text-sm font-medium">Animations</p>
              </Card>
            </Link>
            <Link href="/premium-addons">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group text-center p-4">
                <Crown className="w-6 h-6 mx-auto mb-2 text-amber-600 group-hover:text-amber-700 transition-colors" />
                <p className="text-sm font-medium">Premium</p>
              </Card>
            </Link>
            <Link href="/stats">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group text-center p-4">
                <Target className="w-6 h-6 mx-auto mb-2 text-gray-600 group-hover:text-islamic-primary transition-colors" />
                <p className="text-sm font-medium">Analytics</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Featured Content */}
        <div className="mt-8">
          <Card className="bg-islamic-gradient text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Daily Reminder</h3>
                  <p className="text-sm text-islamic-secondary/90">
                    "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose."
                  </p>
                  <p className="text-xs text-islamic-secondary/70 mt-2">- Quran 65:3</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}