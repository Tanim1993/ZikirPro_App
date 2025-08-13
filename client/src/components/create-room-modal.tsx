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

const createRoomSchema = z.object({
  zikirId: z.number().min(1, "Please select a zikir"),
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
  
  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      zikirId: 0,
      unlimited: false,
      duration: 30,
      isPublic: true,
      description: "",
      targetCount: 100,
      country: "Bangladesh"
    },
  });

  const { data: zikirs = [] } = useQuery({
    queryKey: ["/api/zikirs"],
    enabled: open,
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
      <DialogContent className="max-w-md max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 font-amiri">
            Create Zikir Room
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Zikir Selection */}
            <FormField
              control={form.control}
              name="zikirId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Zikir</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger data-testid="select-zikir">
                        <SelectValue placeholder="Choose a zikir" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zikirs.map((zikir: any) => (
                        <SelectItem key={zikir.id} value={zikir.id.toString()}>
                          <div className="text-left">
                            <div className="font-medium">{zikir.name}</div>
                            {zikir.arabicText && (
                              <div className="text-sm text-gray-500 font-amiri">{zikir.arabicText}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Target Count */}
            <FormField
              control={form.control}
              name="targetCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Count</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        disabled={form.watch("unlimited")}
                        placeholder="1000"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green disabled:bg-gray-100"
                        data-testid="input-target-count"
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="unlimited"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-unlimited"
                          />
                          <Label className="text-sm text-gray-600">Unlimited</Label>
                        </div>
                      )}
                    />
                  </div>
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
                  <FormLabel>Duration (Days)</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      min="1"
                      max="40"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green"
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
                  <FormLabel>Room Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value ? "public" : "private"}
                      onValueChange={(value) => field.onChange(value === "public")}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="public" className="mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">Public</div>
                            <div className="text-xs text-gray-500">Anyone can join</div>
                          </div>
                        </Label>
                        <Label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="private" className="mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">Private</div>
                            <div className="text-xs text-gray-500">Invite only</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Room Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description & Rules</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Share the fazilat, rules, or motivation for this zikir..."
                      className="resize-none"
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-islamic-green hover:bg-islamic-green-dark"
                disabled={createRoomMutation.isPending}
                data-testid="button-create"
              >
                {createRoomMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Create Room
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
