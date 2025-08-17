import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Settings, HelpCircle, LogOut, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GamificationIntroModal } from '@/components/gamification-intro-modal';

interface ProfileSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSettings({ open, onClose }: ProfileSettingsProps) {
  const { user, logout } = useAuth();
  const [showInstructions, setShowInstructions] = useState(false);
  const [floatingTasbihEnabled, setFloatingTasbihEnabled] = useState(
    (user as any)?.floatingTasbihEnabled || false
  );

  const handleFloatingTasbihToggle = async (enabled: boolean) => {
    try {
      await fetch('/api/user/floating-tasbih', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      setFloatingTasbihEnabled(enabled);
    } catch (error) {
      console.error('Failed to update floating tasbih setting:', error);
    }
  };

  const handleViewInstructions = () => {
    setShowInstructions(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-sm text-gray-600">{(user as any)?.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{(user as any)?.email}</p>
                </div>
                {(user as any)?.userType && (
                  <div>
                    <Label className="text-sm font-medium">Account Type</Label>
                    <p className="text-sm text-gray-600 capitalize">{(user as any)?.userType}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* App Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">App Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="floating-tasbih">Floating Tasbih</Label>
                    <p className="text-sm text-gray-600">Show floating counter button</p>
                  </div>
                  <Switch
                    id="floating-tasbih"
                    checked={floatingTasbihEnabled}
                    onCheckedChange={handleFloatingTasbihToggle}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleViewInstructions}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Instructions
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Logout */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instructions Modal */}
      <GamificationIntroModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </>
  );
}