import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, MessageSquare } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Username/Password signup form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // OTP signup form
  const [otpData, setOtpData] = useState({
    phone: "",
    otp: ""
  });

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "Welcome to Zikir Amol. You can now start your spiritual journey.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      return await apiRequest('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "Check your phone for the verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please check your phone number and try again",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { phone: string; otp: string }) => {
      return await apiRequest('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Phone Verified!",
        description: "Your account has been created successfully",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Invalid OTP",
        description: error.message || "Please check the code and try again",
        variant: "destructive",
      });
    },
  });

  const handleUsernameSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      signupMethod: 'username'
    });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData.phone) {
      toast({
        title: "Missing Phone Number",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate(otpData.phone);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData.otp) {
      toast({
        title: "Missing OTP",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate(otpData);
  };

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google?signup=true";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <div className="text-white text-2xl font-bold">ز</div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Join Zikir Amol
          </CardTitle>
          <CardDescription>
            Start your spiritual journey with our community
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Signup */}
          <Button
            onClick={handleGoogleSignup}
            variant="outline"
            className="w-full h-12 text-sm font-medium"
            data-testid="button-google-signup"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Signup Methods Tabs */}
          <Tabs defaultValue="username" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="username" className="text-xs">
                <User className="w-4 h-4 mr-1" />
                Username
              </TabsTrigger>
              <TabsTrigger value="phone" className="text-xs">
                <Phone className="w-4 h-4 mr-1" />
                Phone
              </TabsTrigger>
            </TabsList>

            {/* Username/Password Signup */}
            <TabsContent value="username" className="space-y-4 mt-6">
              <form onSubmit={handleUsernameSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10"
                      data-testid="input-signup-username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      data-testid="input-signup-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      data-testid="input-signup-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10"
                      data-testid="input-signup-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                  disabled={signupMutation.isPending}
                  data-testid="button-signup-username"
                >
                  {signupMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            {/* Phone/OTP Signup */}
            <TabsContent value="phone" className="space-y-4 mt-6">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={otpData.phone}
                        onChange={(e) => setOtpData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        data-testid="input-phone"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We'll send you a verification code via SMS
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                    disabled={sendOtpMutation.isPending}
                    data-testid="button-send-otp"
                  >
                    {sendOtpMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    {sendOtpMutation.isPending ? "Sending..." : "Send Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otpData.otp}
                        onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                        className="pl-10"
                        maxLength={6}
                        data-testid="input-otp"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Code sent to {otpData.phone}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                    disabled={verifyOtpMutation.isPending}
                    data-testid="button-verify-otp"
                  >
                    {verifyOtpMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Create Account"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setOtpSent(false)}
                    data-testid="button-change-phone"
                  >
                    Change Phone Number
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
                  Sign in
                </span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}