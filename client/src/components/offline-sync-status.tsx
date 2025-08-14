import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Trash2 } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export function OfflineSyncStatus() {
  const {
    isOnline,
    pendingCounts,
    isSyncing,
    syncOfflineCounts,
    clearOfflineData,
  } = useOfflineSync();

  const totalPendingCounts = pendingCounts.reduce((sum, c) => sum + c.count, 0);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-orange-600" />
          )}
          Sync Status
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div>
              <p className="font-medium">
                {isOnline ? "Connected" : "Offline Mode"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isOnline 
                  ? "Your counts sync automatically"
                  : "Counts will sync when reconnected"
                }
              </p>
            </div>
            <div className="text-right">
              {isSyncing && (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              )}
            </div>
          </div>

          {/* Pending Counts */}
          {pendingCounts.length > 0 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CloudOff className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-700 dark:text-orange-300">
                  Pending Counts
                </span>
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  {totalPendingCounts} total
                </Badge>
              </div>
              
              <div className="space-y-2 mb-3">
                {pendingCounts.map((pending) => (
                  <div
                    key={pending.id}
                    className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border"
                  >
                    <span className="text-sm">Room #{pending.roomId}</span>
                    <span className="font-medium">{pending.count} counts</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={syncOfflineCounts}
                  disabled={!isOnline || isSyncing}
                  size="sm"
                  className="flex-1"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4 mr-2" />
                      {isOnline ? "Sync Now" : "Offline"}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={clearOfflineData}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Sync Info */}
          {pendingCounts.length === 0 && isOnline && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
              <Cloud className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-green-700 dark:text-green-300">
                All counts are synced
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}