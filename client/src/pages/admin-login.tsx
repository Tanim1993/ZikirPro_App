import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: 'Admin login successful!' });
        setLocation('/admin-dashboard');
      } else {
        toast({ 
          title: 'Login failed', 
          description: result.error || 'Invalid credentials',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Login error', 
        description: 'Failed to connect to server',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Admin Portal
            </CardTitle>
            <p className="text-gray-600 text-sm">
              App Founder Back Office Access
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center text-sm font-medium">
                  <User className="w-4 h-4 mr-2" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  placeholder="Enter admin username"
                  required
                  className="h-12"
                  data-testid="input-admin-username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center text-sm font-medium">
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  placeholder="Enter admin password"
                  required
                  className="h-12"
                  data-testid="input-admin-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                disabled={isLoading}
                data-testid="button-admin-login"
              >
                {isLoading ? 'Logging in...' : 'Access Admin Portal'}
              </Button>
            </form>
            
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500">
                Restricted access - App founder only
              </p>
              <div className="mt-2 text-xs text-gray-400">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> Admin123!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}