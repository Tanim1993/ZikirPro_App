import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search } from "lucide-react";
import ZikirPicker from "@/components/ZikirPicker";
import type { Zikir } from "@/types/zikir";

const createRoomSchema = z.object({
  zikirId: z.number().min(1, "Please select a zikir"),
  name: z.string().min(1, "Room name is required"),
  targetCount: z.number().optional(),
  unlimited: z.boolean().default(false),
  duration: z.number().min(1).max(40, "Duration must be between 1-40 days"),
  isPublic: z.boolean().default(true),
  description: z.string().optional(),
  country: z.string().optional(),
});

type CreateRoomFormData = z.infer<typeof createRoomSchema>;

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showZikirPicker, setShowZikirPicker] = useState(false);
  const [selectedZikir, setSelectedZikir] = useState<Zikir | null>(null);
  
  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      zikirId: 0,
      name: "",
      unlimited: false,
      duration: 30,
      isPublic: true,
      description: "",
      targetCount: 100,
      country: "Bangladesh"
    },
  });



  const createRoomMutation = useMutation({
    mutationFn: async (data: CreateRoomFormData) => {
      const response = await apiRequest("POST", "/api/rooms", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/rooms/my"]);
      toast({
        title: "Room Created",
        description: "Your zikir room has been created successfully!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to create room. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: CreateRoomFormData) => {
    createRoomMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
        <div className="profile-header -mx-6 -mt-6 mb-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white font-amiri">
              Create Zikir Room
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Room Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Room Name</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Enter room name"
                      className="w-full p-4 border-0 rounded-xl bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
                      data-testid="input-room-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Zikir Selection */}
            <FormField
              control={form.control}
              name="zikirId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Select Zikir</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowZikirPicker(true)}
                        className="w-full text-left rounded-xl border-0 bg-gray-100 p-4 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                        data-testid="button-select-zikir"
                      >
                        {selectedZikir ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-900">{selectedZikir.name}</span>
                              <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-1">
                                {selectedZikir.category}
                              </span>
                            </div>
                            <div className="text-lg text-right font-arabic" dir="rtl">
                              {selectedZikir.arabic}
                            </div>
                            <div className="text-sm text-gray-600 italic">
                              {selectedZikir.transliteration}
                            </div>
                            <div className="text-sm text-gray-700">
                              {selectedZikir.translation}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-500">
                            <Search className="w-5 h-5" />
                            <span>Search and select a zikir...</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zikir Picker Modal */}
            {showZikirPicker && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                <ZikirPicker
                  onSelect={(zikir) => {
                    setSelectedZikir(zikir);
                    form.setValue("zikirId", zikir.id);
                    setShowZikirPicker(false);
                  }}
                  onClose={() => setShowZikirPicker(false)}
                />
              </div>
            )}
            
            {/* Target Count */}
            <FormField
              control={form.control}
              name="targetCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Target Count</FormLabel>
                  <div className="flex space-x-3">
                    <FormControl>
                      <input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        disabled={form.watch("unlimited")}
                        placeholder="100"
                        className="flex-1 p-4 border-0 rounded-xl bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-200 placeholder-gray-500"
                        data-testid="input-target-count"
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="unlimited"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-unlimited"
                            className="text-blue-600"
                          />
                          <Label className="text-sm text-blue-700 font-medium">Unlimited</Label>
                        </div>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of your room"
                      className="min-h-[80px] p-4 border-0 rounded-xl bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500 resize-none"
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Duration (Days)</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      min="1"
                      max="40"
                      className="w-full p-4 border-0 rounded-xl bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
                      data-testid="input-duration"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Room Type */}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Room Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value ? "public" : "private"}
                      onValueChange={(value) => field.onChange(value === "public")}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Label className="flex items-center p-4 border-0 bg-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 hover:ring-2 hover:ring-blue-200 transition-all duration-200">
                          <RadioGroupItem value="public" className="mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900">Public</div>
                            <div className="text-xs text-gray-600">Anyone can join</div>
                          </div>
                        </Label>
                        <Label className="flex items-center p-4 border-0 bg-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 hover:ring-2 hover:ring-blue-200 transition-all duration-200">
                          <RadioGroupItem value="private" className="mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900">Private</div>
                            <div className="text-xs text-gray-600">Invite only</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl py-3 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 primary-btn rounded-xl py-3 font-semibold"
                disabled={createRoomMutation.isPending}
                data-testid="button-create"
              >
                {createRoomMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
