import React from 'react';
import { DragDropLevelManager } from '@/components/drag-drop-level-manager';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLevelManagement() {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={goBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Enhanced Level Configuration
              </h1>
              <p className="text-gray-600">
                Advanced drag-and-drop interface for managing spiritual progression levels
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <DragDropLevelManager />
      </div>
    </div>
  );
}