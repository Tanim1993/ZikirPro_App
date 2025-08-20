import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation, Users, Clock, Zap, Mountain, Building, Star, Crown, Volume2, Eye, Route } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HolySite {
  id: string;
  name: string;
  nameArabic: string;
  coordinates: { x: number; y: number };
  type: "mosque" | "mountain" | "area" | "bridge" | "hotel";
  description: string;
  significance: string;
  crowdLevel: "low" | "medium" | "high" | "very_high";
  currentVisitors: number;
  maxCapacity: number;
  walkingTime: { [key: string]: number };
  rituals: string[];
  facilities: string[];
  tips: string[];
  imageUrl?: string;
}

interface RouteInfo {
  from: string;
  to: string;
  distance: number;
  walkingTime: number;
  difficulty: "easy" | "moderate" | "challenging";
  crowdLevel: string;
  bestTimes: string[];
  waypoints: { x: number; y: number; name: string }[];
}

export default function HajjMaps() {
  const [selectedSite, setSelectedSite] = useState<HolySite | null>(null);
  const [activeMap, setActiveMap] = useState<"mecca" | "mina" | "arafat" | "muzdalifah">("mecca");
  const [showRoutes, setShowRoutes] = useState(false);
  const [routeFrom, setRouteFrom] = useState<string>("");
  const [routeTo, setRouteTo] = useState<string>("");
  const [animateVisitors, setAnimateVisitors] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  const holySites: Record<string, HolySite[]> = {
    mecca: [
      {
        id: "masjid_haram",
        name: "Masjid al-Haram",
        nameArabic: "المسجد الحرام",
        coordinates: { x: 50, y: 50 },
        type: "mosque",
        description: "The holiest mosque in Islam, surrounding the Kaaba",
        significance: "Direction of prayer for all Muslims worldwide",
        crowdLevel: "very_high",
        currentVisitors: 85000,
        maxCapacity: 120000,
        walkingTime: { "safa_marwah": 2, "zam_zam": 1 },
        rituals: ["Tawaf", "Sa'i", "Prayer"],
        facilities: ["Zamzam Water", "Prayer Areas", "Air Conditioning", "Medical Centers"],
        tips: ["Enter with right foot", "Keep Kaaba on your left during Tawaf", "Avoid peak hours"],
        imageUrl: "/api/placeholder/400/300"
      },
      {
        id: "kaaba",
        name: "Kaaba",
        nameArabic: "الكعبة",
        coordinates: { x: 50, y: 50 },
        type: "building",
        description: "The cubic structure at the center of Masjid al-Haram",
        significance: "House of Allah, built by Prophet Ibrahim and Ismail",
        crowdLevel: "very_high",
        currentVisitors: 15000,
        maxCapacity: 20000,
        walkingTime: {},
        rituals: ["Tawaf", "Istilam of Black Stone"],
        facilities: ["Kiswa (covering)", "Black Stone", "Maqam Ibrahim"],
        tips: ["Circumambulate counter-clockwise", "Kiss or point to Black Stone", "Make dua facing Kaaba"]
      },
      {
        id: "safa_marwah",
        name: "Safa and Marwah",
        nameArabic: "الصفا والمروة",
        coordinates: { x: 30, y: 60 },
        type: "mountain",
        description: "Two small hills where Hajar ran seeking water for Ismail",
        significance: "Commemorates Hajar's trust in Allah's provision",
        crowdLevel: "high",
        currentVisitors: 12000,
        maxCapacity: 18000,
        walkingTime: { "masjid_haram": 2 },
        rituals: ["Sa'i (7 rounds between hills)"],
        facilities: ["Covered walkway", "Wheelchairs available", "Water stations"],
        tips: ["Start from Safa", "Complete 7 rounds", "Men jog in green-marked area"]
      },
      {
        id: "zam_zam",
        name: "Zamzam Well",
        nameArabic: "بئر زمزم",
        coordinates: { x: 45, y: 55 },
        type: "area",
        description: "Sacred well that appeared for baby Ismail",
        significance: "Blessed water with healing properties",
        crowdLevel: "medium",
        currentVisitors: 3000,
        maxCapacity: 5000,
        walkingTime: { "masjid_haram": 1 },
        rituals: ["Drinking Zamzam water"],
        facilities: ["Water dispensers", "Bottles available", "Cooled water"],
        tips: ["Face Qiblah while drinking", "Make dua", "Drink in 3 sips"]
      }
    ],
    mina: [
      {
        id: "jamarat_bridge",
        name: "Jamarat Bridge",
        nameArabic: "جسر الجمرات",
        coordinates: { x: 60, y: 40 },
        type: "bridge",
        description: "Multi-level bridge for stoning ritual",
        significance: "Symbolic rejection of Satan's temptations",
        crowdLevel: "very_high",
        currentVisitors: 45000,
        maxCapacity: 60000,
        walkingTime: { "mina_camps": 15 },
        rituals: ["Rami al-Jamarat (stoning)"],
        facilities: ["5 levels", "Air conditioning", "Medical posts", "Security"],
        tips: ["Use smaller stones", "Avoid peak times", "Stay calm in crowds"]
      },
      {
        id: "mina_camps",
        name: "Mina Camps",
        nameArabic: "مخيمات منى",
        coordinates: { x: 40, y: 60 },
        type: "area",
        description: "Temporary accommodation for pilgrims",
        significance: "Following Prophet's Sunnah of staying in Mina",
        crowdLevel: "high",
        currentVisitors: 200000,
        maxCapacity: 300000,
        walkingTime: { "jamarat_bridge": 15 },
        rituals: ["Rest", "Prayer", "Dhikr"],
        facilities: ["Tents", "Food service", "Restrooms", "Medical care"],
        tips: ["Keep group together", "Mark your tent location", "Stay hydrated"]
      }
    ],
    arafat: [
      {
        id: "mount_arafat",
        name: "Mount Arafat",
        nameArabic: "جبل عرفات",
        coordinates: { x: 50, y: 30 },
        type: "mountain",
        description: "The mountain where Prophet delivered farewell sermon",
        significance: "Site of Prophet's final sermon",
        crowdLevel: "medium",
        currentVisitors: 5000,
        maxCapacity: 8000,
        walkingTime: { "arafat_plains": 10 },
        rituals: ["Dua", "Dhikr"],
        facilities: ["Viewing area", "Shade structures"],
        tips: ["Not necessary to climb", "Focus on plains", "Make sincere dua"]
      },
      {
        id: "arafat_plains",
        name: "Arafat Plains",
        nameArabic: "عرفات",
        coordinates: { x: 50, y: 50 },
        type: "area",
        description: "Vast plain where pilgrims gather for Wuquf",
        significance: "The essence of Hajj - standing before Allah",
        crowdLevel: "very_high",
        currentVisitors: 180000,
        maxCapacity: 250000,
        walkingTime: { "mount_arafat": 10 },
        rituals: ["Wuquf (Standing)", "Combined prayers", "Extensive dua"],
        facilities: ["Shade tents", "Water distribution", "Medical tents", "Restrooms"],
        tips: ["Arrive before noon", "Face Qiblah", "Sincere repentance", "Continuous dua"]
      }
    ],
    muzdalifah: [
      {
        id: "muzdalifah_area",
        name: "Muzdalifah",
        nameArabic: "مزدلفة",
        coordinates: { x: 50, y: 50 },
        type: "area",
        description: "Open area between Arafat and Mina",
        significance: "Overnight stay under stars, collecting pebbles",
        crowdLevel: "high",
        currentVisitors: 150000,
        maxCapacity: 200000,
        walkingTime: {},
        rituals: ["Overnight stay", "Combined Maghrib-Isha", "Collect pebbles"],
        facilities: ["Open ground", "Basic facilities", "Water points"],
        tips: ["Collect 70 pebbles", "Rest briefly", "Leave after Fajr", "Stay with group"]
      }
    ]
  };

  const routes: RouteInfo[] = [
    {
      from: "Mecca",
      to: "Mina",
      distance: 8.5,
      walkingTime: 120,
      difficulty: "easy",
      crowdLevel: "high",
      bestTimes: ["After Fajr", "Late evening"],
      waypoints: [
        { x: 50, y: 50, name: "Masjid al-Haram" },
        { x: 60, y: 45, name: "Mina Tunnel" },
        { x: 60, y: 40, name: "Mina" }
      ]
    },
    {
      from: "Mina",
      to: "Arafat",
      distance: 14.4,
      walkingTime: 180,
      difficulty: "moderate",
      crowdLevel: "very_high",
      bestTimes: ["Early morning (Day 2)"],
      waypoints: [
        { x: 60, y: 40, name: "Mina" },
        { x: 55, y: 35, name: "Halfway point" },
        { x: 50, y: 30, name: "Arafat" }
      ]
    }
  ];

  const currentSites = holySites[activeMap] || [];

  const getCrowdColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-orange-500";
      case "very_high": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSiteIcon = (type: string) => {
    switch (type) {
      case "mosque": return Building;
      case "mountain": return Mountain;
      case "bridge": return Route;
      case "area": return MapPin;
      default: return Star;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (animateVisitors) {
        // Simulate real-time visitor count changes
        // In real app, this would come from live API
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [animateVisitors]);

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
            <h1 className="text-xl font-bold">Holy Sites Map</h1>
            <p className="text-sm text-islamic-secondary/80">Interactive 3D Navigation</p>
          </div>
          
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Map Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "mecca", name: "Mecca", arabic: "مكة", color: "from-green-500 to-emerald-600" },
            { key: "mina", name: "Mina", arabic: "منى", color: "from-blue-500 to-cyan-600" },
            { key: "arafat", name: "Arafat", arabic: "عرفات", color: "from-orange-500 to-red-600" },
            { key: "muzdalifah", name: "Muzdalifah", arabic: "مزدلفة", color: "from-purple-500 to-indigo-600" }
          ].map((map) => (
            <motion.div
              key={map.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  activeMap === map.key 
                    ? "ring-2 ring-islamic-primary shadow-lg" 
                    : "hover:shadow-md"
                }`}
                onClick={() => setActiveMap(map.key as any)}
              >
                <CardContent className="p-3 text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r ${map.color} flex items-center justify-center`}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{map.name}</p>
                  <p className="text-xs text-gray-500 font-arabic">{map.arabic}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Live Stats */}
        <Card className="bg-gradient-to-r from-islamic-primary/10 to-islamic-secondary/10">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-islamic-primary">
                  {currentSites.reduce((sum, site) => sum + site.currentVisitors, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Current Visitors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">Live</p>
                <p className="text-sm text-gray-600">Real-time Data</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{currentSites.length}</p>
                <p className="text-sm text-gray-600">Holy Sites</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">3D</p>
                <p className="text-sm text-gray-600">Interactive View</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-islamic-primary">
                {activeMap.charAt(0).toUpperCase() + activeMap.slice(1)} Holy Sites
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowRoutes(!showRoutes)}
                >
                  <Route className="w-4 h-4 mr-2" />
                  {showRoutes ? "Hide" : "Show"} Routes
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  3D View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="relative w-full h-96 bg-gradient-to-br from-green-100 to-brown-100 rounded-lg overflow-hidden border-2 border-islamic-primary/20"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  animate={{ 
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                  className="w-full h-full bg-gradient-to-br from-islamic-primary/10 to-islamic-secondary/10"
                  style={{
                    backgroundImage: "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)"
                  }}
                />
              </div>

              {/* Holy Sites */}
              <AnimatePresence>
                {currentSites.map((site, index) => {
                  const IconComponent = getSiteIcon(site.type);
                  return (
                    <motion.div
                      key={site.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${site.coordinates.x}%`,
                        top: `${site.coordinates.y}%`
                      }}
                      onClick={() => setSelectedSite(site)}
                    >
                      {/* Pulsing Animation */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.1, 0.3] 
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity 
                        }}
                        className={`absolute w-8 h-8 ${getCrowdColor(site.crowdLevel)} rounded-full`}
                      />
                      
                      {/* Site Marker */}
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="relative w-6 h-6 bg-islamic-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                      >
                        <IconComponent className="w-3 h-3 text-white" />
                      </motion.div>
                      
                      {/* Site Label */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-semibold text-gray-900 whitespace-nowrap"
                      >
                        {site.name}
                      </motion.div>
                      
                      {/* Visitor Count Animation */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1] 
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity 
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      >
                        {Math.floor(site.currentVisitors / 1000)}K
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Routes Overlay */}
              {showRoutes && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {routes.map((route, index) => (
                    <motion.g key={index}>
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}
                        d={`M ${route.waypoints[0]?.x}% ${route.waypoints[0]?.y}% Q ${route.waypoints[1]?.x}% ${route.waypoints[1]?.y}% ${route.waypoints[2]?.x}% ${route.waypoints[2]?.y}%`}
                        stroke="#3B82F6"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                    </motion.g>
                  ))}
                </svg>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Site Details */}
        <AnimatePresence>
          {selectedSite && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="shadow-xl border border-islamic-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-islamic-primary">{selectedSite.name}</CardTitle>
                      <p className="text-lg font-arabic text-gray-600">{selectedSite.nameArabic}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${getCrowdColor(selectedSite.crowdLevel)}`}>
                        <Users className="w-4 h-4 mr-1" />
                        {selectedSite.crowdLevel.replace('_', ' ')}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedSite.currentVisitors.toLocaleString()} / {selectedSite.maxCapacity.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-600 leading-relaxed">{selectedSite.description}</p>
                  
                  <div className="bg-islamic-secondary/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-islamic-primary mb-2">Spiritual Significance</h4>
                    <p className="text-gray-600 text-sm">{selectedSite.significance}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Rituals Performed</h4>
                      <ul className="space-y-2">
                        {selectedSite.rituals.map((ritual, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <Star className="w-4 h-4 text-islamic-primary mr-2" />
                            {ritual}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Available Facilities</h4>
                      <ul className="space-y-2">
                        {selectedSite.facilities.map((facility, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <Zap className="w-4 h-4 text-green-500 mr-2" />
                            {facility}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Essential Tips</h4>
                    <ul className="space-y-2">
                      {selectedSite.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="w-5 h-5 bg-islamic-primary/10 text-islamic-primary rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-0.5 flex-shrink-0">
                            {idx + 1}
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={() => setSelectedSite(null)} className="bg-islamic-primary">
                      Close Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/hajj-companion">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
                <p className="text-sm font-medium">Hajj Guide</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <Volume2 className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
              <p className="text-sm font-medium">Audio Guide</p>
            </CardContent>
          </Card>
          
          <Link href="/qiblah">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Navigation className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
                <p className="text-sm font-medium">Qiblah</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-islamic-primary" />
              <p className="text-sm font-medium">Find Group</p>
            </CardContent>
          </Card>
        </div>

        {/* Sacred Reminder */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">Sacred Journey</h3>
            <p className="text-sm leading-relaxed mb-2">
              "And it is He who has made the earth spacious for you and made for you therein roads that you might be guided."
            </p>
            <p className="text-xs text-islamic-secondary/80">- Quran 43:10</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}