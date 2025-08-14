import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "wouter";

export default function Landing() {

  return (
    <div className="min-h-screen bg-islamic-gradient">
      {/* Islamic Pattern Background */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-stars" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="white"/>
            <path d="M20,10 L22,16 L28,16 L23,20 L25,26 L20,22 L15,26 L17,20 L12,16 L18,16 Z" fill="white" fillOpacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-stars)"/>
      </svg>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md islamic-glass shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Islamic Logo */}
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm0-8h2v6h-2V8z"/>
              </svg>
            </div>
            
            {/* App Title */}
            <h1 className="text-4xl font-bold text-white mb-2 font-amiri drop-shadow-lg">Zikir Amol</h1>
            <p className="text-white/90 mb-2 text-lg">Digital Tasbih & Competition</p>
            <p className="text-sm text-white/80 mb-8">Join millions in remembering Allah</p>
            
            {/* Features */}
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-6h2.5l6 6H4zm16.5-9.5L19 7l-2.5 1.5L15 7l-1.5 1.5L12 7l-1.5 1.5L9 7 7.5 8.5 6 7v11h11.5L21 14.5z"/>
                  </svg>
                </div>
                <span className="text-white/90 font-medium">Join Zikir competitions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 4V2C7 1.45 7.45 1 8 1S9 1.45 9 2V4H7ZM12 11H11V6H13V7.08C14.84 7.29 16.38 8.56 16.93 10.23C17.65 12.49 16.46 14.94 14.2 15.66C13.76 15.8 13.3 15.87 12.83 15.87V17H14C14.55 17 15 17.45 15 18S14.55 19 14 19H10C9.45 19 9 18.55 9 18S9.45 17 10 17H11V15.87C8.73 15.59 7 13.67 7 11.37V11H12Z"/>
                  </svg>
                </div>
                <span className="text-white/90 font-medium">Real-time leaderboards</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
                  </svg>
                </div>
                <span className="text-white/90 font-medium">Track your progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                  </svg>
                </div>
                <span className="text-white/90 font-medium">Authentic Islamic content</span>
              </div>
            </div>
            
            {/* Login Button */}
            <Link href="/login">
              <Button 
                className="w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-3 text-lg shadow-xl hover:bg-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                data-testid="button-login"
              >
                Start Your Zikir Journey
              </Button>
            </Link>
            
            {/* Sign Up Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-white/80">
                Don't have an account?{" "}
                <Link href="/signup" className="text-white hover:text-white/80 font-semibold underline">
                  Sign Up
                </Link>
              </p>
            </div>
            
            {/* Islamic Quote */}
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-xl">
              <p className="text-sm text-white/90 italic font-amiri">
                "And remember your Lord within yourself humbly and with fear"
              </p>
              <p className="text-xs text-white/70 mt-1">- Quran 7:205</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
