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
    targetCount: "",
    unlimited: false,
    prizeDescription: "",
    competitionStartDate: "",
    competitionEndDate: "",
    duration: "30",
    isPublic: true,
    country: "Bangladesh",
    maxParticipants: "",
    levelRequired: "1"
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch available zikirs
  const { data: zikirs = [] } = useQuery<any[]>({
    queryKey: ['/api/zikirs'],
    enabled: isOpen, // Only fetch when modal is open
  });

  const createCompetitionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        competitionType: 'competition',
        zikirId: parseInt(data.zikirId),
        targetCount: data.unlimited ? null : parseInt(data.targetCount || "0"),
        duration: parseInt(data.duration),
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
        levelRequired: parseInt(data.levelRequired),
      };
      
      console.log('Creating competition with payload:', payload);
      
      const response = await apiRequest('POST', '/api/rooms/competition', payload);
      return await response.json();
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
        targetCount: "",
        unlimited: false,
        prizeDescription: "",
        competitionStartDate: "",
        competitionEndDate: "",
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-gray-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
              Create Zikir Competition
            </DialogTitle>
            <p className="text-gray-500 text-sm">Design a meaningful Islamic competition for your community</p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 pt-2">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <h3 className="font-semibold text-gray-700">Competition Details</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Competition Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Zikir Challenge 2025"
                className={`h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-0 transition-all ${errors.name ? "border-red-300 bg-red-50" : ""}`}
                data-testid="input-competition-name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Details about the competition, rules, and goal..."
                rows={4}
                className={`px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-0 transition-all resize-none ${errors.description ? "border-red-300 bg-red-50" : ""}`}
                data-testid="input-competition-description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zikirId" className="text-sm font-medium text-gray-700">Zikir/Prayer *</Label>
              <Select value={formData.zikirId} onValueChange={(value) => handleInputChange("zikirId", value)}>
                <SelectTrigger 
                  className={`h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-0 transition-all ${errors.zikirId ? "border-red-300 bg-red-50" : ""}`} 
                  data-testid="select-competition-zikir"
                >
                  <SelectValue placeholder="Select a zikir for the competition" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  {zikirs.map((zikir: any) => (
                    <SelectItem 
                      key={zikir.id} 
                      value={zikir.id.toString()}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    >
                      {zikir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.zikirId && <p className="text-red-500 text-xs mt-1">{errors.zikirId}</p>}
            </div>

            {/* Count Section */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Competition Target</Label>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="unlimited-target"
                    checked={formData.unlimited}
                    onCheckedChange={(checked) => handleInputChange("unlimited", checked as boolean)}
                    data-testid="checkbox-unlimited-target"
                    className="data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                  />
                  <Label htmlFor="unlimited-target" className="text-sm text-gray-600 cursor-pointer">Unlimited</Label>
                </div>
              </div>
              
              {!formData.unlimited && (
                <div className="space-y-2">
                  <Label htmlFor="targetCount" className="text-sm font-medium text-gray-700">Target Count *</Label>
                  <Input
                    id="targetCount"
                    type="number"
                    value={formData.targetCount}
                    onChange={(e) => handleInputChange("targetCount", e.target.value)}
                    placeholder="1000"
                    min="1"
                    className={`h-12 px-4 bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-0 transition-all ${errors.targetCount ? "border-red-300 bg-red-50" : ""}`}
                    data-testid="input-target-count"
                  />
                  {errors.targetCount && <p className="text-red-500 text-xs mt-1">{errors.targetCount}</p>}
                  <p className="text-xs text-gray-500">Set the zikir count goal for this competition</p>
                </div>
              )}
              
              {formData.unlimited && (
                <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded border">
                  <p>🕊️ This will be an unlimited competition - participants can count without a specific target goal.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Prize Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <h3 className="font-semibold text-gray-700">Prize Details</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prizeDescription" className="text-sm font-medium text-gray-700">Prize Description *</Label>
              <Textarea
                id="prizeDescription"
                value={formData.prizeDescription}
                onChange={(e) => handleInputChange("prizeDescription", e.target.value)}
                placeholder="The winner will receive a gift card worth $50..."
                rows={3}
                className={`px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-0 transition-all resize-none ${errors.prizeDescription ? "border-red-300 bg-red-50" : ""}`}
                data-testid="input-competition-prize"
              />
              {errors.prizeDescription && <p className="text-red-500 text-xs mt-1">{errors.prizeDescription}</p>}
            </div>
          </div>
          
          {/* Competition Timeline */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Competition Timeline
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="competitionStartDate" className="text-sm font-medium text-gray-700">Start Date & Time *</Label>
                <Input
                  id="competitionStartDate"
                  type="datetime-local"
                  value={formData.competitionStartDate}
                  onChange={(e) => handleInputChange("competitionStartDate", e.target.value)}
                  min={formatDateTimeLocal(new Date())}
                  className={`h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-0 transition-all ${errors.competitionStartDate ? "border-red-300 bg-red-50" : ""}`}
                  data-testid="input-competition-start-date"
                />
                {errors.competitionStartDate && <p className="text-red-500 text-xs mt-1">{errors.competitionStartDate}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="competitionEndDate" className="text-sm font-medium text-gray-700">End Date & Time *</Label>
                <Input
                  id="competitionEndDate"
                  type="datetime-local"
                  value={formData.competitionEndDate}
                  onChange={(e) => handleInputChange("competitionEndDate", e.target.value)}
                  min={formData.competitionStartDate || formatDateTimeLocal(new Date())}
                  className={`h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-0 transition-all ${errors.competitionEndDate ? "border-red-300 bg-red-50" : ""}`}
                  data-testid="input-competition-end-date"
                />
                {errors.competitionEndDate && <p className="text-red-500 text-xs mt-1">{errors.competitionEndDate}</p>}
              </div>
            </div>
          </div>
          
          {/* Competition Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Competition Settings
              </h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="levelRequired" className="text-sm font-medium text-gray-700">Required Level</Label>
              <select
                id="levelRequired"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-0 transition-all appearance-none cursor-pointer"
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
              <p className="text-xs text-gray-500 mt-1">Only users at this level can join this competition</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="text-sm font-medium text-gray-700">Max Participants (Optional)</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                placeholder="Leave empty for unlimited"
                min="1"
                className={`h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-0 transition-all ${errors.maxParticipants ? "border-red-300 bg-red-50" : ""}`}
                data-testid="input-competition-max-participants"
              />
              {errors.maxParticipants && <p className="text-red-500 text-xs mt-1">{errors.maxParticipants}</p>}
            </div>
            

            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange("isPublic", checked as boolean)}
                data-testid="checkbox-competition-public"
                className="data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
              />
              <Label htmlFor="isPublic" className="text-sm text-gray-700 cursor-pointer">Make competition public (anyone can join)</Label>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createCompetitionMutation.isPending}
              className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
              data-testid="button-cancel-competition"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCompetitionMutation.isPending}
              className="flex-1 h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium"
              data-testid="button-create-competition"
            >
              {createCompetitionMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Competition"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}