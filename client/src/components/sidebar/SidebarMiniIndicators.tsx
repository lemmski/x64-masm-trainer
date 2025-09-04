import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags: string[];
  content?: any;
  exercises?: string[];
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  attempts: number;
  lastAttempt: Date;
  completedExercises: string[];
}

interface SidebarMiniIndicatorsProps {
  lessons: Lesson[];
  progressMap: Map<string, LessonProgress>;
}

const SidebarMiniIndicators: React.FC<SidebarMiniIndicatorsProps> = ({
  lessons,
  progressMap
}) => {
  return (
    <div className="flex flex-col items-center py-4">
      <button
        className="p-2 rounded-lg hover:bg-gray-700 transition-colors mb-4"
        title="Expand sidebar"
      >
        {/* This will be handled by parent component */}
        <span className="sr-only">Expand sidebar</span>
      </button>

      {/* Mini lesson indicators */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {lessons.slice(0, 8).map((lesson) => {
          const progress = progressMap.get(lesson.id);
          const isCompleted = progress?.completed || false;

          return (
            <div
              key={lesson.id}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs cursor-pointer transition-colors ${
                isCompleted ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
              title={lesson.title}
            >
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : lesson.title.charAt(0).toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SidebarMiniIndicators;
