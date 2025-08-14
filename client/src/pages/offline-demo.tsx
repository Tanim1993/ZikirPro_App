import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Wifi, WifiOff, Zap } from "lucide-react";
import { OfflineSyncStatus } from "@/components/offline-sync-status";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function OfflineDemo() {
  const [simulateOffline, setSimulateOffline] = useState(false);
  const { addOfflineCount, isOnline } = useOfflineSync();

  // Mock room data
  const mockRoomId = 999;
  const mockUserId = "test-user-123";

  const handleMockCount = () => {
    // Simulate adding offline count
    addOfflineCount(mockRoomId, mockUserId);
  };

  const toggleOfflineSimulation = () => {
    setSimulateOffline(!simulateOffline);
    // In a real scenario, you would need to mock navigator.onLine
    // For demo purposes, this just shows the UI
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-islamic-primary to-islamic-primary-dark text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold">Offline Sync Demo</h1>
            <p className="text-sm text-islamic-secondary/80">
              Test offline functionality
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Test Offline Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Method 1: Browser Dev Tools</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Open browser Developer Tools (F12)</li>
                <li>Go to Network tab</li>
                <li>Check "Offline" checkbox</li>
                <li>Try counting below - it will be saved offline</li>
                <li>Uncheck "Offline" to go back online</li>
                <li>Watch counts sync automatically</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Method 2: Disconnect Internet</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Disconnect your internet connection</li>
                <li>Try counting below - counts saved locally</li>
                <li>Reconnect internet</li>
                <li>Counts will sync automatically</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Mock Counter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-islamic-primary" />
              Mock Zikir Counter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Room #999 (Demo Room)
              </p>
              
              <Button
                onClick={handleMockCount}
                size="lg"
                className="w-full h-16 text-lg bg-gradient-to-r from-islamic-primary to-islamic-primary-dark"
              >
                <Zap className="w-6 h-6 mr-2" />
                Count (+1)
              </Button>
              
              <p className="text-xs text-gray-500">
                Click to add a count. If offline, it will be queued for sync.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Offline Sync Status */}
        <OfflineSyncStatus />

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Offline Sync Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Automatic Detection</p>
                  <p className="text-sm text-gray-600">
                    Detects online/offline status changes automatically
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Local Storage</p>
                  <p className="text-sm text-gray-600">
                    Counts saved in browser storage while offline
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Auto Sync</p>
                  <p className="text-sm text-gray-600">
                    Automatically syncs when connection is restored
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Bulk Upload</p>
                  <p className="text-sm text-gray-600">
                    Efficient bulk synchronization of offline counts
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Visual Feedback</p>
                  <p className="text-sm text-gray-600">
                    Clear indicators for online/offline status and sync progress
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}