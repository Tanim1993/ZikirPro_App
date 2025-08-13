import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green via-islamic-green-light to-islamic-gold islamic-pattern">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Islamic Logo */}
            <div className="w-20 h-20 mx-auto mb-6 bg-islamic-green rounded-full flex items-center justify-center">
              <i className="fas fa-prayer-beads text-white text-3xl"></i>
            </div>
            
            {/* App Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-amiri">Zikir Amol</h1>
            <p className="text-gray-600 mb-2">Digital Tasbih & Competition</p>
            <p className="text-sm text-gray-500 mb-8">Join millions in remembering Allah</p>
            
            {/* Features */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-islamic-green bg-opacity-10 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-islamic-green text-sm"></i>
                </div>
                <span className="text-gray-700">Join Zikir competitions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-islamic-gold bg-opacity-10 rounded-full flex items-center justify-center">
                  <i className="fas fa-trophy text-islamic-gold text-sm"></i>
                </div>
                <span className="text-gray-700">Real-time leaderboards</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 bg-opacity-10 rounded-full flex items-center justify-center">
                  <i className="fas fa-chart-line text-blue-500 text-sm"></i>
                </div>
                <span className="text-gray-700">Track your progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 bg-opacity-10 rounded-full flex items-center justify-center">
                  <i className="fas fa-star-and-crescent text-purple-500 text-sm"></i>
                </div>
                <span className="text-gray-700">Authentic Islamic content</span>
              </div>
            </div>
            
            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              className="w-full bg-islamic-green hover:bg-islamic-green-dark text-white font-semibold py-3"
              data-testid="button-login"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Start Your Zikir Journey
            </Button>
            
            {/* Islamic Quote */}
            <div className="mt-6 p-4 bg-islamic-green bg-opacity-5 rounded-lg">
              <p className="text-sm text-gray-600 italic font-amiri">
                "And remember your Lord within yourself humbly and with fear"
              </p>
              <p className="text-xs text-gray-500 mt-1">- Quran 7:205</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
