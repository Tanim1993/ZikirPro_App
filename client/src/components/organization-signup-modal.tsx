import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Upload } from "lucide-react";

interface OrganizationSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrganizationSignupModal({ isOpen, onClose }: OrganizationSignupModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    organizationDescription: "",
    country: "Bangladesh"
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("username", data.username);
      formDataToSend.append("email", data.email);
      formDataToSend.append("password", data.password);
      formDataToSend.append("organizationName", data.organizationName);
      formDataToSend.append("organizationDescription", data.organizationDescription);
      formDataToSend.append("country", data.country);
      formDataToSend.append("userType", "organization");
      
      if (logoFile) {
        formDataToSend.append("organizationLogo", logoFile);
      }
      
      const response = await fetch('/api/auth/signup-organization', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create organization account');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Organization Account Created!",
        description: "Your organization account has been created successfully. Please check your email for verification.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onClose();
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        organizationName: "",
        organizationDescription: "",
        country: "Bangladesh"
      });
      setLogoFile(null);
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create organization account",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.organizationName.trim()) newErrors.organizationName = "Organization name is required";
    if (!formData.organizationDescription.trim()) newErrors.organizationDescription = "Organization description is required";
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate password strength
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    signupMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Logo file must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Logo must be an image file",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Create Organization Account
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Account Details</h3>
            
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="test002"
                className={errors.username ? "border-red-300" : ""}
                data-testid="input-org-username"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="organization@example.com"
                className={errors.email ? "border-red-300" : ""}
                data-testid="input-org-email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Pw002"
                className={errors.password ? "border-red-300" : ""}
                data-testid="input-org-password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Pw002"
                className={errors.confirmPassword ? "border-red-300" : ""}
                data-testid="input-org-confirm-password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
          
          {/* Organization Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Organization Details</h3>
            
            <div>
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleInputChange("organizationName", e.target.value)}
                placeholder="Islamic Education Foundation"
                className={errors.organizationName ? "border-red-300" : ""}
                data-testid="input-org-name"
              />
              {errors.organizationName && <p className="text-red-500 text-xs mt-1">{errors.organizationName}</p>}
            </div>
            
            <div>
              <Label htmlFor="organizationDescription">Description *</Label>
              <Textarea
                id="organizationDescription"
                value={formData.organizationDescription}
                onChange={(e) => handleInputChange("organizationDescription", e.target.value)}
                placeholder="Brief description of your organization..."
                rows={3}
                className={errors.organizationDescription ? "border-red-300" : ""}
                data-testid="input-org-description"
              />
              {errors.organizationDescription && <p className="text-red-500 text-xs mt-1">{errors.organizationDescription}</p>}
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                <SelectTrigger data-testid="select-org-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                  <SelectItem value="Pakistan">Pakistan</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Indonesia">Indonesia</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                  <SelectItem value="Turkey">Turkey</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                  <SelectItem value="Egypt">Egypt</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="organizationLogo">Organization Logo (Optional)</Label>
              <div className="mt-2">
                <label htmlFor="logoUpload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <div className="text-sm text-gray-600">
                      {logoFile ? logoFile.name : "Click to upload logo (100x100px recommended)"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</div>
                  </div>
                </label>
                <input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  data-testid="input-org-logo"
                />
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={signupMutation.isPending}
              className="flex-1"
              data-testid="button-cancel-org-signup"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              data-testid="button-submit-org-signup"
            >
              {signupMutation.isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}