import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { cn } from '@/lib/utils';

interface VoiceRecognitionButtonProps {
  targetPhrase: string;
  onPhraseDetected: () => void;
  className?: string;
}

export function VoiceRecognitionButton({ 
  targetPhrase, 
  onPhraseDetected,
  className 
}: VoiceRecognitionButtonProps) {
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong' | 'unclear';
    text: string;
    timestamp: number;
  } | null>(null);

  const {
    isSupported,
    isListening,
    lastDetectedText,
    toggleListening
  } = useVoiceRecognition({
    targetPhrase,
    onPhraseDetected: () => {
      onPhraseDetected();
      showFeedback('correct', '✅ Voice Count Success!');
    },
    onFeedback: (type, detectedText) => {
      if (type === 'wrong') {
        showFeedback('wrong', `❌ Wrong phrase: "${detectedText}"`);
      } else if (type === 'unclear') {
        showFeedback('unclear', `❓ Unclear speech: "${detectedText}"`);
      }
    }
  });

  const showFeedback = (type: 'correct' | 'wrong' | 'unclear', text: string) => {
    setFeedback({ type, text, timestamp: Date.now() });
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  };

  if (!isSupported) {
    return (
      <Button
        disabled
        variant="outline"
        className={cn("flex items-center gap-2", className)}
        data-testid="button-voice-unsupported"
      >
        <AlertCircle className="w-4 h-4" />
        Voice Not Supported
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "outline"}
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          isListening && "animate-pulse bg-red-600 hover:bg-red-700",
          className
        )}
        data-testid="button-voice-toggle"
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" />
            Stop Voice
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            Start Voice
          </>
        )}
      </Button>

      {/* Voice Status Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Volume2 className="w-3 h-3 animate-bounce" />
          <span>Listening for "{targetPhrase}"</span>
        </div>
      )}

      {/* Feedback Display */}
      {feedback && (
        <div 
          className={cn(
            "text-xs px-2 py-1 rounded-md transition-all duration-200",
            feedback.type === 'correct' && "bg-green-100 text-green-800 border border-green-200",
            feedback.type === 'wrong' && "bg-orange-100 text-orange-800 border border-orange-200",
            feedback.type === 'unclear' && "bg-gray-100 text-gray-800 border border-gray-200"
          )}
          data-testid="voice-feedback"
        >
          {feedback.text}
        </div>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && lastDetectedText && (
        <div className="text-xs text-gray-500 max-w-40 truncate">
          Last heard: "{lastDetectedText}"
        </div>
      )}
    </div>
  );
}