import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Clock, Calculator, Navigation, Heart, Scroll, CloudOff, Trophy, Shield } from "lucide-react";

export default function More() {
  const features = [
    {
      title: "Salah Tracker",
      description: "Track your daily prayers and maintain consistency",
      icon: Clock,
      href: "/salah-tracker",
      color: "from-blue-500 to-blue-700"
    },
    {
      title: "Quran Reader",
      description: "Read and track your Quran progress",
      icon: BookOpen,
      href: "/quran",
      color: "from-indigo-500 to-indigo-700"
    },
    {
      title: "Hadith Collection",
      description: "Daily authentic Hadith from Prophet Muhammad (PBUH)",
      icon: Scroll,
      href: "/hadith",
      color: "from-purple-500 to-purple-700"
    },
    {
      title: "Zakat Calculator",
      description: "Calculate your Zakat obligations easily",
      icon: Calculator,
      href: "/zakat-calculator",
      color: "from-teal-500 to-teal-700"
    },
    {
      title: "Qiblah Direction",
      description: "Find the direction to Mecca from your location",
      icon: Navigation,
      href: "/qiblah",
      color: "from-green-500 to-green-700"
    },
    {
      title: "Islamic Donations",
      description: "Support Islamic causes and charity organizations",
      icon: Heart,
      href: "/donations",
      color: "from-rose-500 to-rose-700"
    },
    {
      title: "Offline Sync Demo",
      description: "Test offline counting with secure synchronization",
      icon: CloudOff,
      href: "/offline-demo",
      color: "from-orange-500 to-orange-700"
    },
    {
      title: "Seasonal Competitions",
      description: "Join special seasonal zikir competitions and earn exclusive rewards",
      icon: Trophy,
      href: "/seasonal-competitions",
      color: "from-purple-500 to-pink-600"
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
            <h1 className="text-xl font-bold">Islamic Features</h1>
            <p className="text-sm text-islamic-secondary/80">Explore spiritual tools</p>
          </div>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhance Your Spiritual Journey</h2>
          <p className="text-gray-600">Access authentic Islamic tools and resources</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Link key={index} href={feature.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
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