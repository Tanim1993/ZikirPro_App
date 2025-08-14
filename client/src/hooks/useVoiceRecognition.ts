import { useState, useEffect, useRef, useCallback } from 'react';

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
}

interface VoiceRecognitionOptions {
  targetPhrase: string;
  onPhraseDetected: () => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'processing' | 'error') => void;
  onFeedback?: (type: 'correct' | 'wrong' | 'unclear', detectedText?: string) => void;
}

// Predefined zikir phrases with variations for better recognition
const ZIKIR_PHRASES: Record<string, string[]> = {
  'Allahu Akbar': [
    'الله أكبر'
  ],
  'SubhanAllah': [
    'سبحان الله'
  ],
  'Alhamdulillah': [
    'alhamdulillah',
    'alhamdu lillah',
    'praise be to god',
    'الحمد لله'
  ],
  'La ilaha illallah': [
    'لا إله إلا الله'
  ],
  'Astaghfirullah': [
    'astaghfirullah',
    'astagfirullah',
    'astagh firullah',
    'i seek forgiveness from allah',
    'أستغفر الله'
  ],
  'Hasbi Allah': [
    'hasbi allah',
    'hasbiyallahu',
    'hasbi allahu',
    'allah is sufficient for me',
    'حسبي الله'
  ]
};

export function useVoiceRecognition({
  targetPhrase,
  onPhraseDetected,
  onStatusChange,
  onFeedback
}: VoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastDetectedText, setLastDetectedText] = useState<string>('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const confidenceThreshold = 0.3; // Lower threshold for better detection
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  // Normalize text for comparison (preserve Arabic characters)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[.!?،؛]/g, '') // Remove only specific punctuation, keep Arabic
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };

  // Check if detected text matches target phrase with EXACT ONLY validation
  const isMatchingPhrase = useCallback((detectedText: string): boolean => {
    const normalizedDetected = normalizeText(detectedText);
    const targetVariations = ZIKIR_PHRASES[targetPhrase] || [targetPhrase.toLowerCase()];
    
    console.log(`🔍 VALIDATION CHECK: "${normalizedDetected}" vs variations:`, targetVariations);
    
    // ONLY EXACT MATCHES - no fuzzy matching at all
    const matchesTarget = targetVariations.some(variation => {
      const normalizedVariation = normalizeText(variation);
      console.log(`  Checking exact match: "${normalizedDetected}" === "${normalizedVariation}"`);
      
      // Only exact match - nothing else
      const isExactMatch = normalizedDetected === normalizedVariation;
      
      if (isExactMatch) {
        console.log(`  ✅ EXACT MATCH FOUND!`);
        return true;
      }
      
      // For Arabic text, also check if detected contains the complete variation (no partial words)
      if (normalizedVariation.length > 8 && normalizedDetected.includes(normalizedVariation)) {
        console.log(`  ✅ COMPLETE PHRASE CONTAINED!`);
        return true;
      }
      
      console.log(`  ❌ No match`);
      return false;
    });
    
    // If it matches target, apply lighter cross-validation (only for very specific conflicts)
    // Final validation result
    console.log(`🔍 FINAL RESULT: ${matchesTarget ? '✅ ACCEPTED' : '❌ REJECTED'}`);
    if (!matchesTarget) {
      console.log(`❌ REJECTION REASON: "${detectedText}" is not an exact match for any variation of "${targetPhrase}"`);
    }
    
    return matchesTarget;
  }, [targetPhrase]);

  // Check if detected text matches any other zikir phrase
  const isOtherZikirPhrase = useCallback((detectedText: string): boolean => {
    const normalizedDetected = normalizeText(detectedText);
    
    return Object.entries(ZIKIR_PHRASES).some(([phrase, variations]) => {
      if (phrase === targetPhrase) return false; // Skip target phrase
      
      return variations.some(variation => {
        const normalizedVariation = normalizeText(variation);
        return normalizedDetected.includes(normalizedVariation) || 
               normalizedVariation.includes(normalizedDetected);
      });
    });
  }, [targetPhrase]);

  // Start voice recognition
  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA'; // Arabic first, but will also catch English
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        onStatusChange?.('listening');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        onStatusChange?.('processing');
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const detectedText = result[0].transcript;
            const confidence = result[0].confidence;
            
            setLastDetectedText(detectedText);
            
            // Debug logging
            console.log(`Voice detected: "${detectedText}" (confidence: ${confidence})`);
            console.log(`Target phrase: "${targetPhrase}"`);
            const isMatching = isMatchingPhrase(detectedText);
            console.log(`Is matching: ${isMatching}`);
            
            // Additional debug for failed matches
            if (!isMatching) {
              console.log(`❌ VALIDATION FAILED: "${detectedText}" does not match "${targetPhrase}" variations`);
              console.log(`Available variations:`, ZIKIR_PHRASES[targetPhrase]);
            }
            
            // Debounce to prevent rapid counting
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            
            debounceRef.current = setTimeout(() => {
              // Check if it matches target phrase first
              if (isMatching) {
                console.log('✅ Perfect match detected - counting!');
                onPhraseDetected();
                onFeedback?.('correct', detectedText);
              } else if (isOtherZikirPhrase(detectedText)) {
                console.log('❌ Wrong zikir phrase detected');
                onFeedback?.('wrong', detectedText);
              } else if (detectedText.trim().length > 0) {
                console.log('❓ Unclear speech detected');
                onFeedback?.('unclear', detectedText);
              }
              
              onStatusChange?.('listening');
            }, 500); // 500ms debounce
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        onStatusChange?.('error');
        
        // Auto-restart on certain errors
        if (event.error === 'no-speech' || event.error === 'aborted') {
          setTimeout(() => {
            if (isListening) {
              startListening();
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        // Auto-restart if we're still supposed to be listening
        if (isListening) {
          setTimeout(() => {
            startListening();
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onStatusChange?.('error');
    }
  }, [isSupported, isListening, onPhraseDetected, onStatusChange, onFeedback, isMatchingPhrase, isOtherZikirPhrase]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    setIsListening(false);
    onStatusChange?.('idle');
  }, [onStatusChange]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isSupported,
    isListening,
    lastDetectedText,
    startListening,
    stopListening,
    toggleListening
  };
}