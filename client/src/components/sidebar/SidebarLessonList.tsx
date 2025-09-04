import React from 'react';
import { ChevronRight, Code, CheckCircle, Clock } from 'lucide-react';

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

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hints?: string[];
  starterCode?: string;
  testCases?: any[];
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

interface SidebarLessonListProps {
  lessons: Lesson[];
  progressMap: Map<string, LessonProgress>;
  selectedLesson: Lesson | null;
  selectedExercise: Exercise | null;
  expandedLessons: Set<string>;
  onLessonSelect: (lesson: Lesson) => void;
  onExerciseSelect: (exercise: Exercise) => void;
  onToggleExpansion: (lessonId: string) => void;
  loading: boolean;
}

const SidebarLessonList: React.FC<SidebarLessonListProps> = ({
  lessons,
  progressMap,
  selectedLesson,
  selectedExercise,
  expandedLessons,
  onLessonSelect,
  onExerciseSelect,
  onToggleExpansion,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalLessons = lessons.length;
  const completedLessons = Array.from(progressMap.values()).filter(p => p.completed).length;
  const startedLessons = progressMap.size;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        {/* Stats Summary */}
        <div className="bg-gray-750 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {startedLessons}/{totalLessons}
              </div>
              <div className="text-xs text-gray-400">Lessons Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {completedLessons}
              </div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const progress = progressMap.get(lesson.id);
            const isCompleted = progress?.completed || false;
            const completionPercentage = progress ?
              (progress.completedExercises.length / 3) * 100 : 0;
            const isExpanded = expandedLessons.has(lesson.id);

            return (
              <div key={lesson.id} className="bg-gray-750 rounded-lg overflow-hidden">
                {/* Lesson Header */}
                <button
                  onClick={() => {
                    onLessonSelect(lesson);
                    onToggleExpansion(lesson.id);
                  }}
                  className={`w-full text-left p-4 hover:bg-gray-700 transition-colors ${
                    selectedLesson?.id === lesson.id ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Code className="w-5 h-5 text-gray-400" />
                        {isCompleted && (
                          <CheckCircle className="w-3 h-3 text-green-400 absolute -top-1 -right-1 bg-gray-750 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{lesson.title}</div>
                        <div className="text-sm opacity-75 flex items-center space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.estimatedTime} min</span>
                          <span>•</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            lesson.difficulty === 'beginner' ? 'bg-green-600' :
                            lesson.difficulty === 'intermediate' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}>
                            {lesson.difficulty[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`} />
                  </div>

                  {/* Progress Bar */}
                  {progress && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs opacity-75 mb-1">
                        <span>{progress.completedExercises.length}/3 exercises</span>
                        <span>{Math.round(completionPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </button>

                {/* Exercises List */}
                {isExpanded && lesson.exercises && lesson.exercises.length > 0 && (
                  <div className="border-t border-gray-600">
                    <div className="p-2 space-y-1">
                      {lesson.exercises.map((exercise) => {
                        const isCompleted = progress?.completedExercises.includes(exercise.id) || false;

                        return (
                          <button
                            key={exercise.id}
                            onClick={() => onExerciseSelect(exercise)}
                            className={`w-full text-left p-3 rounded text-sm transition-colors ${
                              selectedExercise?.id === exercise.id
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-700 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle className={`w-3 h-3 flex-shrink-0 ${
                                isCompleted ? 'text-green-400' : 'text-gray-600'
                              }`} />
                              <span className={isCompleted ? 'line-through opacity-75' : ''}>
                                {exercise.title}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {lessons.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No lessons found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLessonList;
