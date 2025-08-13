import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest } from "../lib/queryClient";
import IslamicAvatarSelector from "../components/islamic-avatar-selector";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  avatarType: z.string().optional(),
  bgColor: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      country: user?.country || "Bangladesh",
      avatarType: user?.avatarType || "male-1",
      bgColor: user?.bgColor || "green",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        country: user.country || "Bangladesh",
        avatarType: user.avatarType || "male-1",
        bgColor: user.bgColor || "green",
      });
    }
  }, [user, form]);

  const { data: userAnalytics } = useQuery({
    queryKey: ["/api/user/analytics"],
    enabled: !!user,
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
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      window.location.href = "/login";
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/auth/user"]);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
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
          description: "Failed to update profile",
          variant: "destructive",
        });
      }
    }
  });

  const handleBack = () => {
    setLocation("/");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-islamic-green">
            <i className="fas fa-prayer-beads text-4xl animate-pulse"></i>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const countries = [
    "Bangladesh", "Saudi Arabia", "United Arab Emirates", "Malaysia", "Indonesia",
    "Pakistan", "Turkey", "Egypt", "Morocco", "Jordan", "Other"
  ];

  const bgColors = [
    { value: "green", label: "Islamic Green", class: "bg-islamic-green" },
    { value: "gold", label: "Islamic Gold", class: "bg-islamic-gold" },
    { value: "blue", label: "Ocean Blue", class: "bg-blue-600" },
    { value: "purple", label: "Royal Purple", class: "bg-purple-600" },
    { value: "gray", label: "Elegant Gray", class: "bg-gray-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                data-testid="button-back"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogout} data-testid="button-logout">
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Stats */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-islamic-green rounded-full overflow-hidden">
                  <div className="w-full h-full bg-islamic-green flex items-center justify-center">
                    <i className="fas fa-user text-white text-2xl"></i>
                  </div>
                </div>
                <h3 className="text-lg font-semibold" data-testid="text-user-name">
                  {user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'User'}
                </h3>
                <p className="text-gray-500" data-testid="text-user-country">{user?.country || 'Bangladesh'}</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Streak</span>
                    <span className="font-semibold text-islamic-green" data-testid="text-current-streak">
                      {userAnalytics?.currentStreak || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Zikir</span>
                    <span className="font-semibold text-islamic-gold" data-testid="text-total-zikir">
                      {userAnalytics?.totalZikir || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Rooms</span>
                    <span className="font-semibold text-blue-600" data-testid="text-completed-rooms">
                      {userAnalytics?.completedRooms || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <input
                                {...field}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green focus:border-transparent"
                                placeholder="Enter first name"
                                data-testid="input-first-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <input
                                {...field}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green focus:border-transparent"
                                placeholder="Enter last name"
                                data-testid="input-last-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Country Selection */}
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Islamic Avatar Selection */}
                    <FormField
                      control={form.control}
                      name="avatarType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose Islamic Avatar</FormLabel>
                          <FormControl>
                            <IslamicAvatarSelector
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Background Color Selection */}
                    <FormField
                      control={form.control}
                      name="bgColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Theme</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-5 gap-3">
                              {bgColors.map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={() => field.onChange(color.value)}
                                  className={`w-12 h-12 rounded-full ${color.class} border-2 ${
                                    field.value === color.value 
                                      ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' 
                                      : 'border-gray-300 hover:border-gray-500'
                                  }`}
                                  title={color.label}
                                  data-testid={`button-bg-${color.value}`}
                                />
                              ))}
                            </div>
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
                        onClick={handleBack}
                        className="flex-1"
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-islamic-green hover:bg-islamic-green-dark"
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i>
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
