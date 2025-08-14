import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "wouter";

export default function Landing() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl border border-gray-200">
          <CardContent className="p-8 text-center">
            {/* Islamic Logo */}
            <div className="w-16 h-16 mx-auto mb-6 bg-islamic-gradient rounded-full flex items-center justify-center shadow-lg">
              <div className="text-2xl text-white font-bold font-amiri">ج</div>
            </div>
            
            {/* App Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-amiri">Zikir Amol</h1>
            <p className="text-gray-600 mb-2">Digital Tasbih & Competition</p>
            <p className="text-sm text-gray-500 mb-8">Join millions in remembering Allah</p>
            
            {/* Features */}
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-islamic-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-islamic-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-6h2.5l6 6H4zm16.5-9.5L19 7l-2.5 1.5L15 7l-1.5 1.5L12 7l-1.5 1.5L9 7 7.5 8.5 6 7v11h11.5L21 14.5z"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Join Zikir competitions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-islamic-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-islamic-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 4V2C7 1.45 7.45 1 8 1S9 1.45 9 2V4H7ZM12 11H11V6H13V7.08C14.84 7.29 16.38 8.56 16.93 10.23C17.65 12.49 16.46 14.94 14.2 15.66C13.76 15.8 13.3 15.87 12.83 15.87V17H14C14.55 17 15 17.45 15 18S14.55 19 14 19H10C9.45 19 9 18.55 9 18S9.45 17 10 17H11V15.87C8.73 15.59 7 13.67 7 11.37V11H12Z"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Real-time leaderboards</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-islamic-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-islamic-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Track your progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-islamic-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-islamic-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Authentic Islamic content</span>
              </div>
            </div>
            
            {/* Login Button */}
            <Link href="/login">
              <Button 
                className="w-full bg-islamic-gradient text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                data-testid="button-login"
              >
                Start Your Zikir Journey
              </Button>
            </Link>
            
            {/* Sign Up Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-islamic-primary hover:text-islamic-primary-dark font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
            
            {/* Islamic Quote */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
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
