import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GeometricPattern, 
  TasbihBeadAnimation, 
  IslamicButton, 
  CountCelebration,
  ProgressRing,
  FloatingCard,
  CalligraphyText,
  IslamicStar
} from '@/components/animations/IslamicAnimations';
import { 
  RippleEffect,
  HeartbeatPulse,
  BreathingAnimation,
  GlowEffect,
  ShakeAnimation,
  ParticleBurst,
  MorphingShape,
  TextReveal,
  LoadingDots,
  SpotlightEffect
} from '@/components/animations/MicroInteractions';
import { 
  StaggerContainer,
  SlideIn,
  ScaleIn,
  FadeInBlur,
  Reveal,
  TypeWriter,
  MagneticHover,
  ParallaxScroll
} from '@/components/animations/PageTransitions';
import { IslamicLoader, PageLoader } from '@/components/animations/IslamicLoader';
import { IslamicCard } from '@/components/ui/islamic-card';

export default function AnimationsDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [count, setCount] = useState(0);

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const triggerParticles = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 100);
  };

  const incrementCount = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Islamic Micro-Interactions & Animations
          </motion.h1>
          <CalligraphyText isVisible={true} className="text-2xl text-blue-600 font-arabic mb-2">
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </CalligraphyText>
          <TypeWriter 
            text="Experience subtle Islamic art animations designed for spiritual engagement"
            delay={0.5}
            className="text-gray-600"
          />
        </div>

        <Tabs defaultValue="islamic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="islamic">Islamic Elements</TabsTrigger>
            <TabsTrigger value="micro">Micro-Interactions</TabsTrigger>
            <TabsTrigger value="transitions">Page Transitions</TabsTrigger>
            <TabsTrigger value="loaders">Loaders</TabsTrigger>
          </TabsList>

          {/* Islamic Animations Tab */}
          <TabsContent value="islamic">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Geometric Pattern */}
              <IslamicCard variant="default" showPattern={false}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GeometricPattern isActive={activeDemo === 'geometric'} size={24} />
                    Geometric Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <GeometricPattern isActive={activeDemo === 'geometric'} size={80} color="rgb(59, 130, 246)" />
                  </div>
                  <Button 
                    onClick={() => setActiveDemo(activeDemo === 'geometric' ? '' : 'geometric')}
                    className="w-full"
                  >
                    {activeDemo === 'geometric' ? 'Stop' : 'Animate'}
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Tasbih Beads */}
              <IslamicCard variant="premium">
                <CardHeader>
                  <CardTitle>Tasbih Beads Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <TasbihBeadAnimation count={count} isAnimating={activeDemo === 'tasbih'} />
                    <p className="text-sm text-gray-600 mt-2">Count: {count}</p>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        incrementCount();
                        setActiveDemo('tasbih');
                        setTimeout(() => setActiveDemo(''), 500);
                      }}
                      className="w-full"
                    >
                      Add Bead
                    </Button>
                    <Button 
                      onClick={() => setCount(0)}
                      variant="outline"
                      className="w-full"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </IslamicCard>

              {/* Islamic Star */}
              <IslamicCard variant="achievement">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IslamicStar isLoading={activeDemo === 'star'} size={24} />
                    Islamic Star
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <IslamicStar isLoading={activeDemo === 'star'} size={80} />
                  </div>
                  <Button 
                    onClick={() => setActiveDemo(activeDemo === 'star' ? '' : 'star')}
                    className="w-full"
                  >
                    {activeDemo === 'star' ? 'Stop' : 'Animate'}
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Progress Ring */}
              <IslamicCard variant="default">
                <CardHeader>
                  <CardTitle>Progress Ring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <ProgressRing 
                      progress={(count * 3) % 100} 
                      size={120} 
                      strokeWidth={8}
                    />
                  </div>
                  <Button 
                    onClick={incrementCount}
                    className="w-full"
                  >
                    Increase Progress
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Celebration */}
              <IslamicCard variant="competition">
                <CardHeader>
                  <CardTitle>Celebration Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-sm text-gray-600">Milestone celebration</p>
                  </div>
                  <Button 
                    onClick={triggerCelebration}
                    className="w-full"
                  >
                    Trigger Celebration
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Islamic Button */}
              <IslamicCard variant="premium">
                <CardHeader>
                  <CardTitle>Islamic Button</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <IslamicButton variant="primary" className="w-full">
                      Primary Button
                    </IslamicButton>
                    <IslamicButton variant="secondary" className="w-full">
                      Secondary Button
                    </IslamicButton>
                    <IslamicButton variant="outline" className="w-full">
                      Outline Button
                    </IslamicButton>
                  </div>
                </CardContent>
              </IslamicCard>
            </StaggerContainer>
          </TabsContent>

          {/* Micro-Interactions Tab */}
          <TabsContent value="micro">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Ripple Effect */}
              <IslamicCard variant="default">
                <CardHeader>
                  <CardTitle>Ripple Effect</CardTitle>
                </CardHeader>
                <CardContent>
                  <RippleEffect className="w-full h-32 bg-blue-100 rounded-lg flex items-center justify-center cursor-pointer">
                    <p className="text-blue-600 font-medium">Click anywhere!</p>
                  </RippleEffect>
                </CardContent>
              </IslamicCard>

              {/* Heartbeat Pulse */}
              <IslamicCard variant="achievement">
                <CardHeader>
                  <CardTitle>Heartbeat Pulse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <HeartbeatPulse isActive={activeDemo === 'heartbeat'} intensity={0.2}>
                      <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto">
                        ❤️
                      </div>
                    </HeartbeatPulse>
                  </div>
                  <Button 
                    onClick={() => setActiveDemo(activeDemo === 'heartbeat' ? '' : 'heartbeat')}
                    className="w-full"
                  >
                    {activeDemo === 'heartbeat' ? 'Stop' : 'Start Heartbeat'}
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Breathing Animation */}
              <IslamicCard variant="premium">
                <CardHeader>
                  <CardTitle>Breathing Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <BreathingAnimation isActive={activeDemo === 'breathing'} duration={3}>
                      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto">
                        🧘
                      </div>
                    </BreathingAnimation>
                  </div>
                  <Button 
                    onClick={() => setActiveDemo(activeDemo === 'breathing' ? '' : 'breathing')}
                    className="w-full"
                  >
                    {activeDemo === 'breathing' ? 'Stop' : 'Start Breathing'}
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Glow Effect */}
              <IslamicCard variant="competition">
                <CardHeader>
                  <CardTitle>Glow Effect</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <GlowEffect isActive={activeDemo === 'glow'} color="rgba(59, 130, 246, 0.6)" size={30}>
                      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto">
                        ✨
                      </div>
                    </GlowEffect>
                  </div>
                  <Button 
                    onClick={() => setActiveDemo(activeDemo === 'glow' ? '' : 'glow')}
                    className="w-full"
                  >
                    {activeDemo === 'glow' ? 'Stop Glow' : 'Start Glow'}
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Shake Animation */}
              <IslamicCard variant="default">
                <CardHeader>
                  <CardTitle>Shake Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <ShakeAnimation trigger={activeDemo === 'shake'}>
                      <div className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center text-white mx-auto">
                        ⚠️
                      </div>
                    </ShakeAnimation>
                  </div>
                  <Button 
                    onClick={() => {
                      setActiveDemo('shake');
                      setTimeout(() => setActiveDemo(''), 500);
                    }}
                    className="w-full"
                  >
                    Trigger Shake
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Particle Burst */}
              <IslamicCard variant="achievement">
                <CardHeader>
                  <CardTitle>Particle Burst</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative text-center mb-4 h-32 flex items-center justify-center">
                    <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                      🎊
                    </div>
                    <ParticleBurst trigger={showParticles} particles={16} color="rgb(251, 191, 36)" />
                  </div>
                  <Button 
                    onClick={triggerParticles}
                    className="w-full"
                  >
                    Burst Particles
                  </Button>
                </CardContent>
              </IslamicCard>
            </StaggerContainer>
          </TabsContent>

          {/* Page Transitions Tab */}
          <TabsContent value="transitions">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Slide In */}
              <IslamicCard variant="default">
                <CardHeader>
                  <CardTitle>Slide Animations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <SlideIn direction="up" delay={0}>
                    <div className="p-3 bg-blue-100 rounded text-center">Slide Up</div>
                  </SlideIn>
                  <SlideIn direction="left" delay={0.1}>
                    <div className="p-3 bg-green-100 rounded text-center">Slide Left</div>
                  </SlideIn>
                  <SlideIn direction="right" delay={0.2}>
                    <div className="p-3 bg-purple-100 rounded text-center">Slide Right</div>
                  </SlideIn>
                </CardContent>
              </IslamicCard>

              {/* Scale In */}
              <IslamicCard variant="premium">
                <CardHeader>
                  <CardTitle>Scale Animations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ScaleIn delay={0}>
                    <div className="p-3 bg-blue-100 rounded text-center">Scale In Fast</div>
                  </ScaleIn>
                  <ScaleIn delay={0.2}>
                    <div className="p-3 bg-green-100 rounded text-center">Scale In Medium</div>
                  </ScaleIn>
                  <ScaleIn delay={0.4}>
                    <div className="p-3 bg-purple-100 rounded text-center">Scale In Slow</div>
                  </ScaleIn>
                </CardContent>
              </IslamicCard>

              {/* Fade In Blur */}
              <IslamicCard variant="achievement">
                <CardHeader>
                  <CardTitle>Fade with Blur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <FadeInBlur delay={0}>
                    <div className="p-3 bg-blue-100 rounded text-center">Fade In Blur 1</div>
                  </FadeInBlur>
                  <FadeInBlur delay={0.3}>
                    <div className="p-3 bg-green-100 rounded text-center">Fade In Blur 2</div>
                  </FadeInBlur>
                </CardContent>
              </IslamicCard>

              {/* Text Reveal */}
              <IslamicCard variant="competition">
                <CardHeader>
                  <CardTitle>Text Reveal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <TextReveal 
                      text="Bismillah Rahman Raheem" 
                      trigger={activeDemo === 'textreveal'}
                      staggerDelay={0.1}
                    />
                  </div>
                  <Button 
                    onClick={() => setActiveDemo(activeDemo === 'textreveal' ? '' : 'textreveal')}
                    className="w-full"
                  >
                    {activeDemo === 'textreveal' ? 'Reset' : 'Reveal Text'}
                  </Button>
                </CardContent>
              </IslamicCard>

              {/* Magnetic Hover */}
              <IslamicCard variant="default">
                <CardHeader>
                  <CardTitle>Magnetic Hover</CardTitle>
                </CardHeader>
                <CardContent>
                  <MagneticHover className="w-full" strength={0.5}>
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-center cursor-pointer">
                      Hover over me!
                    </div>
                  </MagneticHover>
                </CardContent>
              </IslamicCard>

              {/* Morphing Shape */}
              <IslamicCard variant="premium">
                <CardHeader>
                  <CardTitle>Morphing Shape</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <MorphingShape 
                      isActive={activeDemo === 'morph'} 
                      size={80} 
                      color="rgb(59, 130, 246)" 
                    />
                  </div>
                  <Button 
                    onClick={() => setActiveDemo(activeDemo === 'morph' ? '' : 'morph')}
                    className="w-full"
                  >
                    {activeDemo === 'morph' ? 'Reset' : 'Morph Shape'}
                  </Button>
                </CardContent>
              </IslamicCard>
            </StaggerContainer>
          </TabsContent>

          {/* Loaders Tab */}
          <TabsContent value="loaders">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Islamic Loaders */}
              <IslamicCard variant="default">
                <CardHeader>
                  <CardTitle>Islamic Loaders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Geometric Pattern</h4>
                    <IslamicLoader variant="geometric" size={60} message="Loading..." />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Islamic Star</h4>
                    <IslamicLoader variant="star" size={60} message="Processing..." />
                  </div>
                </CardContent>
              </IslamicCard>

              <IslamicCard variant="premium">
                <CardHeader>
                  <CardTitle>More Loaders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Crescent Moon</h4>
                    <IslamicLoader variant="crescent" size={60} message="Loading..." />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Arabic Calligraphy</h4>
                    <IslamicLoader variant="calligraphy" size={60} message="Please wait..." />
                  </div>
                </CardContent>
              </IslamicCard>

              {/* Loading Dots */}
              <IslamicCard variant="achievement">
                <CardHeader>
                  <CardTitle>Loading Dots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Blue Dots</h4>
                      <LoadingDots color="rgb(59, 130, 246)" size={12} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Golden Dots</h4>
                      <LoadingDots color="rgb(251, 191, 36)" size={10} />
                    </div>
                  </div>
                </CardContent>
              </IslamicCard>

              {/* Page Loader Demo */}
              <IslamicCard variant="competition">
                <CardHeader>
                  <CardTitle>Page Loader</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => {
                        setShowLoader(true);
                        setTimeout(() => setShowLoader(false), 3000);
                      }}
                      className="w-full"
                    >
                      Show Page Loader
                    </Button>
                    <p className="text-sm text-gray-600 text-center">
                      Displays a full-screen loading overlay
                    </p>
                  </div>
                </CardContent>
              </IslamicCard>
            </StaggerContainer>
          </TabsContent>
        </Tabs>

        {/* Global Animations */}
        <CountCelebration show={showCelebration} count={33} />
        <PageLoader 
          isVisible={showLoader} 
          message="Loading Islamic content..." 
          variant="geometric" 
        />
      </div>
    </div>
  );
}