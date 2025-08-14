import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Globe, Users, Building, BookOpen, Droplets } from "lucide-react";

interface DonationCause {
  id: number;
  title: string;
  description: string;
  organization: string;
  target: number;
  raised: number;
  icon: any;
  category: string;
  urgent: boolean;
}

export default function Donations() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const causes: DonationCause[] = [
    {
      id: 1,
      title: "Build Water Wells in Africa",
      description: "Provide clean, safe drinking water to remote communities in drought-affected areas of East Africa.",
      organization: "Islamic Relief Worldwide",
      target: 50000,
      raised: 32500,
      icon: Droplets,
      category: "humanitarian",
      urgent: true
    },
    {
      id: 2,
      title: "Support Orphaned Children",
      description: "Monthly sponsorship program providing education, healthcare, and basic necessities for orphans.",
      organization: "Helping Hand for Relief and Development",
      target: 25000,
      raised: 18700,
      icon: Heart,
      category: "children",
      urgent: false
    },
    {
      id: 3,
      title: "Mosque Construction Fund",
      description: "Help build a new community mosque to serve growing Muslim population in underserved areas.",
      organization: "Local Islamic Center",
      target: 150000,
      raised: 89000,
      icon: Building,
      category: "religious",
      urgent: false
    },
    {
      id: 4,
      title: "Islamic Education Program",
      description: "Provide Islamic education resources and scholarships for students in developing countries.",
      organization: "Knowledge International University",
      target: 40000,
      raised: 22100,
      icon: BookOpen,
      category: "education",
      urgent: true
    },
    {
      id: 5,
      title: "Emergency Relief Fund",
      description: "Immediate assistance for victims of natural disasters and humanitarian crises worldwide.",
      organization: "Muslim Aid",
      target: 75000,
      raised: 45600,
      icon: Globe,
      category: "emergency",
      urgent: true
    }
  ];

  const categories = [
    { id: "all", name: "All Causes", count: causes.length },
    { id: "humanitarian", name: "Humanitarian", count: causes.filter(c => c.category === "humanitarian").length },
    { id: "children", name: "Children", count: causes.filter(c => c.category === "children").length },
    { id: "religious", name: "Religious", count: causes.filter(c => c.category === "religious").length },
    { id: "education", name: "Education", count: causes.filter(c => c.category === "education").length },
    { id: "emergency", name: "Emergency", count: causes.filter(c => c.category === "emergency").length }
  ];

  const filteredCauses = selectedCategory === "all" 
    ? causes 
    : causes.filter(cause => cause.category === selectedCategory);

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min(100, (raised / target) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
            <h1 className="text-xl font-bold">Islamic Donations</h1>
            <p className="text-sm text-islamic-secondary/80">Support worthy causes</p>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Impact Overview */}
        <Card className="bg-islamic-gradient text-white">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">Your Impact</h2>
              <p className="text-sm text-islamic-secondary/80">
                "The believer's shade on the Day of Resurrection will be his charity"
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">$0</div>
                <div className="text-xs text-islamic-secondary/80">Total Donated</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-islamic-secondary/80">Causes Supported</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-islamic-secondary/80">Lives Impacted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Browse Categories</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`justify-start h-auto p-3 ${
                  selectedCategory === category.id 
                    ? "bg-islamic-primary text-white" 
                    : "border-gray-200 hover:border-islamic-primary"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className={`text-xs ${
                    selectedCategory === category.id ? "text-islamic-secondary/80" : "text-gray-500"
                  }`}>
                    {category.count} cause{category.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Urgent Causes Banner */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-semibold text-red-800">Urgent Causes</h3>
                <p className="text-sm text-red-700">
                  {causes.filter(c => c.urgent).length} causes need immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Causes List */}
        <div className="space-y-4">
          {filteredCauses.map((cause) => {
            const IconComponent = cause.icon;
            const progress = getProgressPercentage(cause.raised, cause.target);
            
            return (
              <Card key={cause.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-islamic-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{cause.title}</h3>
                            {cause.urgent && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{cause.description}</p>
                          <p className="text-xs text-gray-500">by {cause.organization}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(cause.raised)} raised
                        </span>
                        <span className="text-gray-600">
                          of {formatCurrency(cause.target)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            progress >= 75 ? 'bg-green-500' : 'bg-islamic-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{Math.round(progress)}% funded</span>
                        <span>{formatCurrency(cause.target - cause.raised)} remaining</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-islamic-gradient text-white">
                        Donate Now
                      </Button>
                      <Button variant="outline" className="px-6">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Zakat Information */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Fulfill Your Zakat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700 mb-3">
              Have you calculated your Zakat for this year? Many of these causes accept Zakat donations.
            </p>
            <Link href="/zakat-calculator">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Calculate Zakat
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Islamic Quote */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm opacity-90 mb-2 italic">
              "The example of those who spend their wealth in the way of Allah is like a seed of grain which grows seven spikes; in each spike is a hundred grains."
            </p>
            <p className="text-xs opacity-75">- Quran 2:261</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}