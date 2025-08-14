import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface ReportRoomModalProps {
  roomId: number;
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Illegal content",
  "Wrong Islamic information", 
  "Abusive behavior",
  "Other"
];

export function ReportRoomModal({ roomId, roomName, isOpen, onClose }: ReportRoomModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: async (data: { reason: string; details: string }) => {
      const response = await apiRequest("POST", `/api/rooms/${roomId}/report`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to submit report');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report submitted",
        description: data.message || "Admin will review your report shortly.",
      });
      handleClose();
    },
    onError: (error) => {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast({
          title: "Session Expired",
          description: "Please log in again to submit reports",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/login", 1000);
        return;
      }
      toast({
        title: "Failed to submit report",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for reporting this room.",
        variant: "destructive",
      });
      return;
    }

    if (details.length > 500) {
      toast({
        title: "Details too long",
        description: "Details must be 500 characters or less.",
        variant: "destructive",
      });
      return;
    }

    reportMutation.mutate({ reason, details });
  };

  const handleClose = () => {
    setReason("");
    setDetails("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Report Room
          </DialogTitle>
          <DialogDescription>
            Report "{roomName}" for inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for reporting *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Provide additional context about your report..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={4}
              data-testid="textarea-report-details"
            />
            <div className="text-xs text-gray-500 mt-1">
              {details.length}/500 characters
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-report">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={reportMutation.isPending || !reason}
            className="bg-red-600 hover:bg-red-700"
            data-testid="button-submit-report"
          >
            {reportMutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}