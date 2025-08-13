import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CongratulationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export default function CongratulationsModal({ open, onOpenChange, count }: CongratulationsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full text-center p-8">
        <div className="mb-6">
          {/* Animated Islamic star */}
          <div className="w-20 h-20 mx-auto mb-4 text-islamic-gold">
            <i className="fas fa-star-and-crescent text-6xl animate-bounce-gentle"></i>
          </div>
          <h2 className="text-2xl font-bold text-islamic-green mb-2 font-amiri">MashaAllah!</h2>
          <p className="text-gray-600">You've reached a milestone</p>
        </div>
        
        <div className="bg-islamic-green bg-opacity-10 rounded-xl p-4 mb-6">
          <div className="text-3xl font-bold text-islamic-green" data-testid="text-achievement-count">
            {count.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Zikir completed!</div>
        </div>
        
        <div className="space-y-2 mb-6 text-sm text-gray-600">
          <p className="italic font-amiri">
            "And whoever relies upon Allah - then He is sufficient for him."
          </p>
          <p className="text-xs">- Quran 65:3</p>
        </div>
        
        <Button 
          onClick={() => onOpenChange(false)}
          className="w-full bg-islamic-green hover:bg-islamic-green-dark text-white py-3 px-4 rounded-lg"
          data-testid="button-close-congratulations"
        >
          Alhamdulillah
        </Button>
      </DialogContent>
    </Dialog>
  );
}
