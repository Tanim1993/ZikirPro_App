import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation, Users, Clock, Zap, Mountain, Building, Star, Crown, Volume2, Eye, Route, Radio, Wifi, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HolySite {
  id: string;
  name: string;
  nameArabic: string;
  coordinates: { x: number; y: number };
  type: "mosque" | "mountain" | "area" | "bridge" | "hotel" | "building";
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
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedHeatmap, setSelectedHeatmap] = useState<"crowd" | "prayer" | "facilities">("crowd");
  const [liveAlerts, setLiveAlerts] = useState<Array<{id: string; message: string; type: "info" | "warning" | "success"}>>([]);
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

  // Simulate live data updates
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      // Simulate crowd level changes
      const siteIds = Object.values(holySites).flat().map(s => s.id);
      const randomSite = siteIds[Math.floor(Math.random() * siteIds.length)];
      
      // Add live alerts
      const alerts = [
        { id: Date.now().toString(), message: "Prayer time approaching at Masjid al-Haram", type: "info" as const },
        { id: (Date.now() + 1).toString(), message: "Low crowd density at Safa-Marwah", type: "success" as const },
        { id: (Date.now() + 2).toString(), message: "High temperature alert for Arafat plains", type: "warning" as const }
      ];
      
      setLiveAlerts(prev => {
        const newAlert = alerts[Math.floor(Math.random() * alerts.length)];
        const updated = [newAlert, ...prev.slice(0, 2)];
        return updated;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

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

        {/* Live Control Panel */}
        <Card className="bg-gradient-to-r from-islamic-primary/10 to-islamic-secondary/10 border-2 border-islamic-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: isLiveMode ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isLiveMode ? Infinity : 0, ease: "linear" }}
                >
                  <Radio className={`w-5 h-5 ${isLiveMode ? "text-green-500" : "text-gray-400"}`} />
                </motion.div>
                <span className="font-semibold text-gray-900">Live Map Control</span>
              </div>
              <Button 
                onClick={() => setIsLiveMode(!isLiveMode)}
                variant={isLiveMode ? "default" : "outline"}
                size="sm"
                className={isLiveMode ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {isLiveMode ? "ON" : "OFF"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <motion.p 
                  key={currentSites.reduce((sum, site) => sum + site.currentVisitors, 0)}
                  initial={{ scale: 1.2, color: "#059669" }}
                  animate={{ scale: 1, color: "#1f2937" }}
                  className="text-2xl font-bold"
                >
                  {currentSites.reduce((sum, site) => sum + site.currentVisitors, 0).toLocaleString()}
                </motion.p>
                <p className="text-sm text-gray-600">Live Visitors</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Wifi className={`w-5 h-5 mr-1 ${isLiveMode ? "text-green-500" : "text-gray-400"}`} />
                  <span className="text-lg font-bold text-green-600">{isLiveMode ? "LIVE" : "OFF"}</span>
                </div>
                <p className="text-sm text-gray-600">Real-time Data</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{currentSites.length}</p>
                <p className="text-sm text-gray-600">Holy Sites</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">3D</p>
                <p className="text-sm text-gray-600">Interactive</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Activity className="w-5 h-5 mr-1 text-blue-500" />
                  <span className="text-lg font-bold text-blue-600">HD</span>
                </div>
                <p className="text-sm text-gray-600">High Detail</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Alerts */}
        <AnimatePresence>
          {liveAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              {liveAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === "info" ? "bg-blue-50 border-blue-500 text-blue-800" :
                    alert.type === "warning" ? "bg-yellow-50 border-yellow-500 text-yellow-800" :
                    "bg-green-50 border-green-500 text-green-800"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {alert.type === "info" && <Radio className="w-4 h-4" />}
                    {alert.type === "warning" && <AlertTriangle className="w-4 h-4" />}
                    {alert.type === "success" && <CheckCircle className="w-4 h-4" />}
                    <span className="text-sm font-medium">{alert.message}</span>
                    <Badge variant="outline" className="text-xs">LIVE</Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Map */}
        <Card className="relative overflow-hidden border-2 border-islamic-primary/30 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-islamic-primary flex items-center">
                <motion.div
                  animate={{ rotate: isLiveMode ? [0, 360] : 0 }}
                  transition={{ duration: 10, repeat: isLiveMode ? Infinity : 0, ease: "linear" }}
                  className="mr-2"
                >
                  <Activity className="w-5 h-5" />
                </motion.div>
                {activeMap.charAt(0).toUpperCase() + activeMap.slice(1)} Live Map
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowRoutes(!showRoutes)}
                  className={showRoutes ? "bg-blue-50 text-blue-600" : ""}
                >
                  <Route className="w-4 h-4 mr-2" />
                  {showRoutes ? "Hide" : "Show"} Routes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-purple-50 text-purple-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  HD View
                </Button>
              </div>
            </div>
            
            {/* Heatmap Controls */}
            <div className="flex space-x-2">
              {[
                { key: "crowd", label: "Crowd Density", icon: Users, color: "bg-red-100 text-red-600" },
                { key: "prayer", label: "Prayer Times", icon: Clock, color: "bg-green-100 text-green-600" },
                { key: "facilities", label: "Facilities", icon: Zap, color: "bg-blue-100 text-blue-600" }
              ].map((heatmap) => (
                <Button
                  key={heatmap.key}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedHeatmap(heatmap.key as any)}
                  className={`${selectedHeatmap === heatmap.key ? heatmap.color : ""}`}
                >
                  <heatmap.icon className="w-3 h-3 mr-1" />
                  {heatmap.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <div 
              ref={mapRef}
              className="relative w-full h-[500px] bg-gradient-to-br from-green-50 to-blue-50 rounded-xl overflow-hidden border-4 border-islamic-primary/30 shadow-inner"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 25%),
                  radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 25%),
                  radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 25%)
                `
              }}
            >
              {/* Dynamic Grid Background */}
              <motion.div 
                animate={isLiveMode ? { 
                  backgroundPosition: ["0% 0%", "20px 20px"] 
                } : {}}
                transition={{ 
                  duration: 4, 
                  repeat: isLiveMode ? Infinity : 0,
                  repeatType: "reverse" 
                }}
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }}
              />

              {/* Floating Particles */}
              {isLiveMode && (
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-islamic-primary/30 rounded-full"
                      initial={{
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                      }}
                      animate={{
                        x: [
                          Math.random() * 100 + "%",
                          Math.random() * 100 + "%",
                          Math.random() * 100 + "%"
                        ],
                        y: [
                          Math.random() * 100 + "%",
                          Math.random() * 100 + "%", 
                          Math.random() * 100 + "%"
                        ],
                      }}
                      transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Heatmap Overlay */}
              {selectedHeatmap && (
                <div className="absolute inset-0 pointer-events-none">
                  {currentSites.map((site) => (
                    <motion.div
                      key={`heatmap-${site.id}`}
                      className={`absolute rounded-full ${
                        selectedHeatmap === "crowd" ? 
                          site.crowdLevel === "very_high" ? "bg-red-500/20" :
                          site.crowdLevel === "high" ? "bg-orange-500/20" :
                          site.crowdLevel === "medium" ? "bg-yellow-500/20" : "bg-green-500/20"
                        : selectedHeatmap === "prayer" ? "bg-green-500/15" :
                        "bg-blue-500/15"
                      }`}
                      style={{
                        left: `${site.coordinates.x - 8}%`,
                        top: `${site.coordinates.y - 8}%`,
                        width: selectedHeatmap === "crowd" ? 
                          site.crowdLevel === "very_high" ? "120px" :
                          site.crowdLevel === "high" ? "100px" :
                          site.crowdLevel === "medium" ? "80px" : "60px" : "80px",
                        height: selectedHeatmap === "crowd" ? 
                          site.crowdLevel === "very_high" ? "120px" :
                          site.crowdLevel === "high" ? "100px" :
                          site.crowdLevel === "medium" ? "80px" : "60px" : "80px",
                      }}
                      animate={isLiveMode ? {
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                      } : {}}
                      transition={{
                        duration: 3,
                        repeat: isLiveMode ? Infinity : 0
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Holy Sites */}
              <AnimatePresence>
                {currentSites.map((site, index) => {
                  const IconComponent = getSiteIcon(site.type);
                  return (
                    <motion.div
                      key={site.id}
                      initial={{ scale: 0, opacity: 0, rotate: -180 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0, rotate: 180 }}
                      transition={{ 
                        delay: index * 0.15,
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                      }}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{
                        left: `${site.coordinates.x}%`,
                        top: `${site.coordinates.y}%`
                      }}
                      onClick={() => setSelectedSite(site)}
                    >
                      {/* Multi-layer Pulsing Animation */}
                      <motion.div
                        animate={isLiveMode ? { 
                          scale: [1, 2, 1],
                          opacity: [0.6, 0, 0.6] 
                        } : {}}
                        transition={{ 
                          duration: 2.5, 
                          repeat: isLiveMode ? Infinity : 0,
                          delay: index * 0.3
                        }}
                        className={`absolute w-12 h-12 ${getCrowdColor(site.crowdLevel)} rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2`}
                      />
                      
                      <motion.div
                        animate={isLiveMode ? { 
                          scale: [1, 1.5, 1],
                          opacity: [0.4, 0, 0.4] 
                        } : {}}
                        transition={{ 
                          duration: 2, 
                          repeat: isLiveMode ? Infinity : 0,
                          delay: (index * 0.3) + 0.5
                        }}
                        className={`absolute w-8 h-8 ${getCrowdColor(site.crowdLevel)} rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2`}
                      />
                      
                      {/* Enhanced Site Marker */}
                      <motion.div
                        whileHover={{ scale: 1.3, rotateY: 180 }}
                        animate={selectedSite?.id === site.id ? {
                          scale: [1, 1.2, 1],
                          boxShadow: [
                            "0 4px 8px rgba(59, 130, 246, 0.3)",
                            "0 8px 16px rgba(59, 130, 246, 0.6)",
                            "0 4px 8px rgba(59, 130, 246, 0.3)"
                          ]
                        } : {}}
                        transition={{ duration: 0.3 }}
                        className="relative w-8 h-8 bg-gradient-to-br from-islamic-primary to-islamic-secondary rounded-full flex items-center justify-center shadow-xl border-3 border-white backdrop-blur-sm"
                        style={{
                          background: selectedSite?.id === site.id ? 
                            "linear-gradient(135deg, #3B82F6, #8B5CF6)" :
                            "linear-gradient(135deg, #1E40AF, #1E3A8A)"
                        }}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                        
                        {/* Live indicator */}
                        {isLiveMode && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                          />
                        )}
                      </motion.div>
                      
                      {/* Enhanced Site Label with Live Status */}
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-xl text-xs font-semibold text-gray-900 whitespace-nowrap border border-gray-200"
                        style={{ zIndex: 20 }}
                      >
                        <div className="text-center">
                          <div className="font-bold text-sm">{site.name}</div>
                          <div className="text-xs text-gray-500 font-arabic">{site.nameArabic}</div>
                          {isLiveMode && (
                            <div className="flex items-center justify-center mt-1 space-x-1">
                              <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-2 bg-green-400 rounded-full"
                              />
                              <span className="text-xs text-green-600 font-semibold">LIVE</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Enhanced Visitor Count with Animation */}
                      <motion.div
                        animate={isLiveMode ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0]
                        } : {}}
                        transition={{ 
                          duration: 2.5, 
                          repeat: isLiveMode ? Infinity : 0,
                          delay: index * 0.2
                        }}
                        className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg border-2 border-white"
                      >
                        {Math.floor(site.currentVisitors / 1000)}K
                      </motion.div>

                      {/* Crowd Level Indicator */}
                      <motion.div
                        animate={isLiveMode ? { opacity: [0.7, 1, 0.7] } : {}}
                        transition={{ duration: 2, repeat: isLiveMode ? Infinity : 0 }}
                        className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-bold text-white ${getCrowdColor(site.crowdLevel)} shadow-md`}
                      >
                        {site.crowdLevel.replace('_', ' ').toUpperCase()}
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