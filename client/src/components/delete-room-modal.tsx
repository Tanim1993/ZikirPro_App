import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteRoomModalProps {
  roomId: number;
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteRoomModal({ roomId, roomName, isOpen, onClose }: DeleteRoomModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/rooms/${roomId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to delete room');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Room deleted",
        description: "The room has been permanently deleted.",
        variant: "default",
      });
      
      // Invalidate all room-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/analytics'] });
      setLocation('/dashboard');
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete room",
        description: error.message || "Room cannot be deleted after members join.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Room
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Are you sure you want to delete "{roomName}"? This action cannot be undone and will permanently remove:
            </div>
            <div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>The room and all its settings</li>
                <li>All count entries and progress</li>
                <li>Room member data</li>
                <li>Associated analytics</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
            data-testid="button-confirm-delete"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Room"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}