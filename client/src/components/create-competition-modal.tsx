import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trophy, Calendar, Users } from "lucide-react";

interface CreateCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCompetitionModal({ isOpen, onClose }: CreateCompetitionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    zikirId: "",
    prizeDescription: "",
    competitionStartDate: "",
    competitionEndDate: "",
    targetCount: "",
    unlimited: false,
    duration: "30",
    isPublic: true,
    country: "Bangladesh",
    maxParticipants: "",
    levelRequired: "1"
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch available zikirs
  const { data: zikirs = [] } = useQuery({
    queryKey: ['/api/zikirs'],
    enabled: isOpen, // Only fetch when modal is open
  });

  const createCompetitionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/rooms/competition', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          competitionType: 'competition',
          zikirId: parseInt(data.zikirId),
          targetCount: data.unlimited ? null : parseInt(data.targetCount),
          duration: parseInt(data.duration),
          maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
          levelRequired: parseInt(data.levelRequired),
        }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Competition Created!",
        description: "Your zikir competition has been created successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/rooms/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms/public'] });
      onClose();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        zikirId: "",
        prizeDescription: "",
        competitionStartDate: "",
        competitionEndDate: "",
        targetCount: "",
        unlimited: false,
        duration: "30",
        isPublic: true,
        country: "Bangladesh",
        maxParticipants: "",
        levelRequired: "1"
      });
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Competition",
        description: error.message || "Failed to create competition",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Competition name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.zikirId) newErrors.zikirId = "Please select a zikir";
    if (!formData.prizeDescription.trim()) newErrors.prizeDescription = "Prize description is required";
    if (!formData.competitionStartDate) newErrors.competitionStartDate = "Start date is required";
    if (!formData.competitionEndDate) newErrors.competitionEndDate = "End date is required";
    
    // Validate dates
    if (formData.competitionStartDate && formData.competitionEndDate) {
      const startDate = new Date(formData.competitionStartDate);
      const endDate = new Date(formData.competitionEndDate);
      const now = new Date();
      
      // Allow start date to be from today onwards (more lenient validation)
      // Set the comparison time to start of today to avoid hour/minute issues
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.competitionStartDate = "Start date cannot be in the past";
      }
      
      if (endDate <= startDate) {
        newErrors.competitionEndDate = "End date must be after start date";
      }
    }
    
    // Validate target count if not unlimited
    if (!formData.unlimited && (!formData.targetCount || parseInt(formData.targetCount) <= 0)) {
      newErrors.targetCount = "Target count must be greater than 0";
    }
    
    // Validate max participants if provided
    if (formData.maxParticipants && parseInt(formData.maxParticipants) <= 0) {
      newErrors.maxParticipants = "Max participants must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    createCompetitionMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Format date for input (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Default start time (today at current hour + 1, or minimum today)
  const defaultStartTime = new Date();
  // Ensure it's at least today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (defaultStartTime < today) {
    defaultStartTime.setTime(today.getTime());
  } else {
    defaultStartTime.setHours(defaultStartTime.getHours() + 1);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Create Zikir Competition
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Competition Details</h3>
            
            <div>
              <Label htmlFor="name">Competition Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Zikir Challenge 2025"
                className={errors.name ? "border-red-300" : ""}
                data-testid="input-competition-name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Details about the competition, rules, and goal..."
                rows={3}
                className={errors.description ? "border-red-300" : ""}
                data-testid="input-competition-description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <Label htmlFor="zikirId">Zikir/Prayer *</Label>
              <Select value={formData.zikirId} onValueChange={(value) => handleInputChange("zikirId", value)}>
                <SelectTrigger className={errors.zikirId ? "border-red-300" : ""} data-testid="select-competition-zikir">
                  <SelectValue placeholder="Select a zikir for the competition" />
                </SelectTrigger>
                <SelectContent>
                  {zikirs.map((zikir: any) => (
                    <SelectItem key={zikir.id} value={zikir.id.toString()}>
                      {zikir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.zikirId && <p className="text-red-500 text-xs mt-1">{errors.zikirId}</p>}
            </div>
          </div>
          
          {/* Prize Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Prize Details</h3>
            
            <div>
              <Label htmlFor="prizeDescription">Prize Description *</Label>
              <Textarea
                id="prizeDescription"
                value={formData.prizeDescription}
                onChange={(e) => handleInputChange("prizeDescription", e.target.value)}
                placeholder="The winner will receive a gift card worth $50..."
                rows={3}
                className={errors.prizeDescription ? "border-red-300" : ""}
                data-testid="input-competition-prize"
              />
              {errors.prizeDescription && <p className="text-red-500 text-xs mt-1">{errors.prizeDescription}</p>}
            </div>
          </div>
          
          {/* Competition Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Competition Timeline
            </h3>
            
            <div>
              <Label htmlFor="competitionStartDate">Start Date & Time *</Label>
              <Input
                id="competitionStartDate"
                type="datetime-local"
                value={formData.competitionStartDate}
                onChange={(e) => handleInputChange("competitionStartDate", e.target.value)}
                min={formatDateTimeLocal(new Date())}
                className={errors.competitionStartDate ? "border-red-300" : ""}
                data-testid="input-competition-start-date"
              />
              {errors.competitionStartDate && <p className="text-red-500 text-xs mt-1">{errors.competitionStartDate}</p>}
            </div>
            
            <div>
              <Label htmlFor="competitionEndDate">End Date & Time *</Label>
              <Input
                id="competitionEndDate"
                type="datetime-local"
                value={formData.competitionEndDate}
                onChange={(e) => handleInputChange("competitionEndDate", e.target.value)}
                min={formData.competitionStartDate || formatDateTimeLocal(new Date())}
                className={errors.competitionEndDate ? "border-red-300" : ""}
                data-testid="input-competition-end-date"
              />
              {errors.competitionEndDate && <p className="text-red-500 text-xs mt-1">{errors.competitionEndDate}</p>}
            </div>
          </div>
          
          {/* Competition Settings */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Competition Settings
            </h3>
            
            <div>
              <Label htmlFor="levelRequired">Required Level</Label>
              <select
                id="levelRequired"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.levelRequired}
                onChange={(e) => setFormData({ ...formData, levelRequired: e.target.value })}
                data-testid="select-level-required"
              >
                <option value="1">Darajah 1 (Beginner)</option>
                <option value="2">Darajah 2 (Intermediate)</option>
                <option value="3">Darajah 3 (Advanced)</option>
                <option value="4">Darajah 4 (Expert)</option>
                <option value="5">Darajah 5 (Master)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Only users at this level (and lower if allowed) can join</p>
            </div>

            <div>
              <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                placeholder="Leave empty for unlimited"
                min="1"
                className={errors.maxParticipants ? "border-red-300" : ""}
                data-testid="input-competition-max-participants"
              />
              {errors.maxParticipants && <p className="text-red-500 text-xs mt-1">{errors.maxParticipants}</p>}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unlimited"
                checked={formData.unlimited}
                onCheckedChange={(checked) => handleInputChange("unlimited", checked as boolean)}
                data-testid="checkbox-competition-unlimited"
              />
              <Label htmlFor="unlimited">Unlimited counting (no target)</Label>
            </div>
            
            {!formData.unlimited && (
              <div>
                <Label htmlFor="targetCount">Target Count *</Label>
                <Input
                  id="targetCount"
                  type="number"
                  value={formData.targetCount}
                  onChange={(e) => handleInputChange("targetCount", e.target.value)}
                  placeholder="1000"
                  min="1"
                  className={errors.targetCount ? "border-red-300" : ""}
                  data-testid="input-competition-target-count"
                />
                {errors.targetCount && <p className="text-red-500 text-xs mt-1">{errors.targetCount}</p>}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange("isPublic", checked as boolean)}
                data-testid="checkbox-competition-public"
              />
              <Label htmlFor="isPublic">Make competition public (anyone can join)</Label>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createCompetitionMutation.isPending}
              className="flex-1"
              data-testid="button-cancel-competition"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCompetitionMutation.isPending}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              data-testid="button-create-competition"
            >
              {createCompetitionMutation.isPending ? "Creating..." : "Create Competition"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}