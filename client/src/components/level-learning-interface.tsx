import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  Star,
  Volume2,
  RotateCcw,
  Coins,
  Trophy
} from 'lucide-react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface LevelData {
  id: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  count: number;
  coins: number;
  experience: number;
  category: string;
}

interface LevelLearningInterfaceProps {
  levelData: LevelData;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function LevelLearningInterface({ levelData, isOpen, onClose, onComplete }: LevelLearningInterfaceProps) {
  const [currentTask, setCurrentTask] = useState(0);
  const [taskProgress, setTaskProgress] = useState([false, false, false]);
  const [practiceCount, setPracticeCount] = useState(0);
  const [practiceStartTime, setPracticeStartTime] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Complete level mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskType: string) => {
      const response = await fetch('/api/user/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId: levelData.id,
          taskType,
          practiceCount: taskType === 'practice' ? practiceCount : undefined,
          timeSpent: taskType === 'practice' && practiceStartTime ? Date.now() - practiceStartTime : undefined
        })
      });
      if (!response.ok) throw new Error('Failed to complete task');
      return response.json();
    },
    onSuccess: (data, taskType) => {
      const newProgress = [...taskProgress];
      if (taskType === 'learn') newProgress[0] = true;
      if (taskType === 'practice') newProgress[1] = true;
      if (taskType === 'quiz') newProgress[2] = true;
      setTaskProgress(newProgress);
      
      queryClient.invalidateQueries({ queryKey: ['/api/user/spiritual-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/gamification'] });
      
      toast({
        title: "Task Completed!",
        description: `Earned ${taskType === 'learn' ? Math.floor(levelData.coins * 0.3) : taskType === 'practice' ? Math.floor(levelData.coins * 0.5) : Math.floor(levelData.coins * 0.2)} Barakah Coins`,
      });

      // Check if all tasks completed
      if (newProgress.every(task => task)) {
        setTimeout(() => {
          onComplete();
          onClose();
        }, 1500);
      }
    }
  });

  const tasks = [
    {
      title: "Learn Meaning",
      description: "Study and understand the dhikr",
      component: <LearningTask levelData={levelData} onComplete={() => completeTaskMutation.mutate('learn')} />
    },
    {
      title: "Practice with Reflection", 
      description: "Recite with contemplation (minimum 5 minutes)",
      component: <PracticeTask 
        levelData={levelData} 
        count={practiceCount}
        setCount={setPracticeCount}
        startTime={practiceStartTime}
        setStartTime={setPracticeStartTime}
        onComplete={() => completeTaskMutation.mutate('practice')} 
      />
    },
    {
      title: "Knowledge Check",
      description: "Test your understanding",
      component: <QuizTask 
        levelData={levelData} 
        answers={quizAnswers}
        setAnswers={setQuizAnswers}
        onComplete={() => completeTaskMutation.mutate('quiz')} 
      />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Level {levelData.id}: {levelData.transliteration}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Level Overview */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-amiri">{levelData.arabic}</div>
                <div className="text-lg font-semibold">{levelData.transliteration}</div>
                <div className="text-gray-600 italic">"{levelData.meaning}"</div>
                <Badge variant="outline">{levelData.category}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <div className="grid grid-cols-3 gap-2">
            {tasks.map((task, index) => (
              <div key={index} className={`p-2 rounded text-center text-xs ${
                taskProgress[index] 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : currentTask === index 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {taskProgress[index] ? <CheckCircle className="w-4 h-4 mx-auto mb-1" /> : <Clock className="w-4 h-4 mx-auto mb-1" />}
                {task.title}
              </div>
            ))}
          </div>

          {/* Task Navigation */}
          <div className="flex gap-2 justify-center">
            {tasks.map((_, index) => (
              <Button
                key={index}
                variant={currentTask === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTask(index)}
                disabled={index > 0 && !taskProgress[index - 1]}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {/* Current Task */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tasks[currentTask].title}</CardTitle>
              <p className="text-sm text-gray-600">{tasks[currentTask].description}</p>
            </CardHeader>
            <CardContent>
              {tasks[currentTask].component}
            </CardContent>
          </Card>

          {/* Rewards Info */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="font-semibold text-yellow-800 mb-2">Level Rewards</div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-600" />
                    {levelData.coins} Barakah Coins
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-purple-600" />
                    {levelData.experience} Experience
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Learning Task Component
function LearningTask({ levelData, onComplete }: { levelData: LevelData; onComplete: () => void }) {
  const [studied, setStudied] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="text-center">
          <div className="text-2xl font-amiri mb-2">{levelData.arabic}</div>
          <div className="text-lg font-semibold mb-1">{levelData.transliteration}</div>
          <div className="text-gray-600">"{levelData.meaning}"</div>
        </div>
        
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">Learn About This Dhikr:</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p>This is one of the fundamental remembrances in Islam. Take time to reflect on its meaning and significance.</p>
            <p>Recommended recitation: {levelData.count} times</p>
            <p>Best times: After prayers, morning, and evening</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="studied" 
          checked={studied}
          onChange={(e) => setStudied(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="studied" className="text-sm">
          I have studied and understood the meaning of this dhikr
        </label>
      </div>

      <Button 
        onClick={onComplete}
        disabled={!studied}
        className="w-full"
      >
        Complete Learning Task
      </Button>
    </div>
  );
}

// Practice Task Component  
function PracticeTask({ 
  levelData, 
  count, 
  setCount, 
  startTime, 
  setStartTime, 
  onComplete 
}: { 
  levelData: LevelData; 
  count: number;
  setCount: (count: number) => void;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  onComplete: () => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleStart = () => {
    setIsActive(true);
    setStartTime(Date.now());
    setCount(0);
  };

  const handleTap = () => {
    if (isActive) {
      setCount(count + 1);
    }
  };

  const handleComplete = () => {
    if (count >= levelData.count && timeElapsed >= 5 * 60 * 1000) { // 5 minutes minimum
      setIsActive(false);
      onComplete();
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center bg-gray-50 p-4 rounded-lg">
        <div className="text-2xl font-amiri mb-2">{levelData.arabic}</div>
        <div className="text-sm text-gray-600">Tap the button below while reciting</div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-sm text-gray-600">Count</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
          <div className="text-sm text-gray-600">Time</div>
        </div>
      </div>

      {!isActive ? (
        <Button onClick={handleStart} className="w-full" size="lg">
          <Play className="w-4 h-4 mr-2" />
          Start Practice Session
        </Button>
      ) : (
        <div className="space-y-4">
          <Button 
            onClick={handleTap}
            className="w-full h-20 text-lg bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Tap to Count
          </Button>
          
          <div className="text-xs text-gray-600 text-center">
            Target: {levelData.count} counts • Minimum: 5 minutes reflection
          </div>

          {count >= levelData.count && timeElapsed >= 5 * 60 * 1000 && (
            <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Practice
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Quiz Task Component
function QuizTask({ 
  levelData, 
  answers, 
  setAnswers, 
  onComplete 
}: { 
  levelData: LevelData; 
  answers: { [key: string]: string };
  setAnswers: (answers: { [key: string]: string }) => void;
  onComplete: () => void;
}) {
  const questions = [
    {
      id: 'meaning',
      question: `What does "${levelData.transliteration}" mean?`,
      options: [
        levelData.meaning,
        "Peace be upon you",
        "God is great",
        "There is no god but Allah"
      ].sort(() => Math.random() - 0.5),
      correct: levelData.meaning
    },
    {
      id: 'category',
      question: 'What category does this dhikr belong to?',
      options: [
        levelData.category,
        "Prayer dhikr",
        "Travel dhikr", 
        "Sleep dhikr"
      ].sort(() => Math.random() - 0.5),
      correct: levelData.category
    }
  ];

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const allCorrect = questions.every(q => answers[q.id] === q.correct);
  const allAnswered = questions.every(q => answers[q.id]);

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <h4 className="font-semibold">{question.question}</h4>
          <div className="space-y-2">
            {question.options.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="rounded"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <Button 
        onClick={onComplete}
        disabled={!allAnswered || !allCorrect}
        className="w-full"
      >
        {allCorrect ? 'Complete Quiz' : allAnswered ? 'Check Your Answers' : 'Answer All Questions'}
      </Button>

      {allAnswered && !allCorrect && (
        <div className="text-sm text-red-600 text-center">
          Some answers are incorrect. Please try again.
        </div>
      )}
    </div>
  );
}