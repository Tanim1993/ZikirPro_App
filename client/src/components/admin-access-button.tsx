import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function AdminAccessButton() {
  const openAdminPortal = () => {
    // Open admin portal in a new tab/window
    window.open('/admin/login', '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={openAdminPortal}
      variant="outline"
      size="sm"
      className="border-purple-200 text-purple-700 hover:bg-purple-50"
      data-testid="button-admin-access"
    >
      <Shield className="w-4 h-4 mr-2" />
      Admin Portal
    </Button>
  );
}