import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineCount {
  id: string;
  roomId: number;
  userId: string;
  count: number;
  timestamp: number;
  synced: boolean;
}

interface SyncResult {
  success: boolean;
  syncedCounts: number;
  errors: string[];
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCounts, setPendingCounts] = useState<OfflineCount[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Load pending counts from localStorage on mount
  useEffect(() => {
    const savedCounts = localStorage.getItem('offline_counts');
    if (savedCounts) {
      try {
        const counts: OfflineCount[] = JSON.parse(savedCounts);
        setPendingCounts(counts.filter(c => !c.synced));
      } catch (error) {
        console.error('Error loading offline counts:', error);
      }
    }
  }, []);

  // Save pending counts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('offline_counts', JSON.stringify(pendingCounts));
  }, [pendingCounts]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing your counts...",
      });
      syncOfflineCounts();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Your counts will be saved and synced when you reconnect",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online or when there are pending counts
  useEffect(() => {
    if (isOnline && pendingCounts.length > 0 && !isSyncing) {
      syncOfflineCounts();
    }
  }, [isOnline, pendingCounts.length, isSyncing]);

  const addOfflineCount = useCallback((roomId: number, userId: string) => {
    const newCount: OfflineCount = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      userId,
      count: 1,
      timestamp: Date.now(),
      synced: false,
    };

    setPendingCounts(prev => {
      // Check if we already have a pending count for this room/user
      const existingIndex = prev.findIndex(c => c.roomId === roomId && c.userId === userId && !c.synced);
      
      if (existingIndex >= 0) {
        // Update existing count
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: updated[existingIndex].count + 1,
          timestamp: Date.now(),
        };
        return updated;
      } else {
        // Add new count
        return [...prev, newCount];
      }
    });

    return newCount;
  }, []);

  const syncOfflineCounts = useCallback(async (): Promise<SyncResult> => {
    if (isSyncing || pendingCounts.length === 0) {
      return { success: true, syncedCounts: 0, errors: [] };
    }

    setIsSyncing(true);
    const errors: string[] = [];
    let syncedCounts = 0;

    try {
      // Group counts by roomId for batch sync
      const countsByRoom = pendingCounts.reduce((acc, count) => {
        if (!acc[count.roomId]) {
          acc[count.roomId] = [];
        }
        acc[count.roomId].push(count);
        return acc;
      }, {} as Record<number, OfflineCount[]>);

      // Sync each room's counts
      for (const [roomId, counts] of Object.entries(countsByRoom)) {
        try {
          const totalCount = counts.reduce((sum, c) => sum + c.count, 0);
          
          // Send bulk count to server
          const response = await fetch(`/api/rooms/${roomId}/count/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: counts[0].userId,
              count: totalCount,
              timestamps: counts.map(c => c.timestamp),
              offlineIds: counts.map(c => c.id),
            }),
          });

          if (response.ok) {
            // Mark these counts as synced
            setPendingCounts(prev => 
              prev.map(c => 
                counts.some(sc => sc.id === c.id) 
                  ? { ...c, synced: true } 
                  : c
              )
            );
            syncedCounts += totalCount;
          } else {
            const errorText = await response.text();
            errors.push(`Room ${roomId}: ${errorText}`);
          }
        } catch (error) {
          console.error(`Error syncing room ${roomId}:`, error);
          errors.push(`Room ${roomId}: ${error instanceof Error ? error.message : 'Network error'}`);
        }
      }

      // Clean up synced counts after a delay
      setTimeout(() => {
        setPendingCounts(prev => prev.filter(c => !c.synced));
      }, 5000);

      if (syncedCounts > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${syncedCounts} counts`,
        });
      }

      if (errors.length > 0) {
        toast({
          title: "Partial Sync",
          description: `${syncedCounts} counts synced, ${errors.length} failed`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error during sync:', error);
      errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      
      toast({
        title: "Sync Failed",
        description: "Will retry when connection improves",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }

    return {
      success: errors.length === 0,
      syncedCounts,
      errors,
    };
  }, [pendingCounts, isSyncing, toast]);

  const getPendingCountForRoom = useCallback((roomId: number, userId: string): number => {
    const pending = pendingCounts.filter(c => c.roomId === roomId && c.userId === userId && !c.synced);
    return pending.reduce((sum, c) => sum + c.count, 0);
  }, [pendingCounts]);

  const clearOfflineData = useCallback(() => {
    setPendingCounts([]);
    localStorage.removeItem('offline_counts');
    toast({
      title: "Offline Data Cleared",
      description: "All offline counts have been removed",
    });
  }, [toast]);

  return {
    isOnline,
    pendingCounts: pendingCounts.filter(c => !c.synced),
    isSyncing,
    addOfflineCount,
    syncOfflineCounts,
    getPendingCountForRoom,
    clearOfflineData,
  };
}