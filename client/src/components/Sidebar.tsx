import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  Code,
  CheckCircle,
  Circle,
  Search,
  Filter,
  Star,
  Clock,
  Target,
  Award,
  X
} from 'lucide-react';
import { Lesson, Exercise, LessonProgress } from '../../../../src/shared/types';

interface SidebarProps {
  isOpen: boolean;
  onLessonSelect: (lesson: Lesson) => void;
  onExerciseSelect: (exercise: Exercise) => void;
  selectedLesson: Lesson | null;
  selectedExercise: Exercise | null;
}

interface FilterOptions {
  difficulty: string;
  completed: boolean | null;
  search: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onLessonSelect,
  onExerciseSelect,
  selectedLesson,
  selectedExercise
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, LessonProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: 'all',
    completed: null,
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      const data = await response.json();
      setLessons(data);

      // Fetch progress for all lessons
      await fetchAllProgress(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProgress = async (lessonList: Lesson[]) => {
    const userId = 'user-1'; // TODO: Get from authentication context
    const progressPromises = lessonList.map(async (lesson) => {
      try {
        const response = await fetch(`/api/exercises/progress/${userId}/${lesson.id}`);
        const progress = await response.json();
        return { lessonId: lesson.id, progress };
      } catch (error) {
        console.error(`Error fetching progress for lesson ${lesson.id}:`, error);
        return null;
      }
    });

    const progressResults = await Promise.all(progressPromises);
    const newProgressMap = new Map<string, LessonProgress>();

    progressResults.forEach((result) => {
      if (result && result.progress) {
        newProgressMap.set(result.lessonId, result.progress);
      }
    });

    setProgressMap(newProgressMap);
  };

  const toggleLessonExpansion = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const filteredLessons = lessons.filter((lesson) => {
    // Search filter
    if (filters.search && !lesson.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !lesson.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty !== 'all' && lesson.difficulty !== filters.difficulty) {
      return false;
    }

    // Completion filter
    if (filters.completed !== null) {
      const progress = progressMap.get(lesson.id);
      const isCompleted = progress?.completed || false;
      if (filters.completed !== isCompleted) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      difficulty: 'all',
      completed: null,
      search: ''
    });
  };

  const hasActiveFilters = filters.difficulty !== 'all' || filters.completed !== null || filters.search !== '';

  if (!isOpen) {
    return (
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={() => {}}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors mb-4"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Mini lesson indicators */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {lessons.slice(0, 8).map((lesson) => {
            const progress = progressMap.get(lesson.id);
            const isCompleted = progress?.completed || false;
            const completionPercentage = progress ?
              (progress.completedExercises.length / 3) * 100 : 0;

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
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Learning Path
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'
            }`}
            title="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.completed === null ? 'all' : filters.completed ? 'completed' : 'incomplete'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    completed: value === 'all' ? null : value === 'completed'
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Lessons</option>
                <option value="completed">Completed</option>
                <option value="incomplete">Not Started</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                <X className="w-4 h-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="p-4">
            {/* Stats Summary */}
            <div className="bg-gray-750 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {progressMap.size}/{lessons.length}
                  </div>
                  <div className="text-xs text-gray-400">Lessons Started</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {Array.from(progressMap.values()).filter(p => p.completed).length}
                  </div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              {filteredLessons.map((lesson) => {
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
                        toggleLessonExpansion(lesson.id);
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
                                    : 'hover:bg-gray-650 text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {isCompleted ? (
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-gray-500" />
                                    )}
                                    <div>
                                      <div className={`font-medium ${isCompleted ? 'line-through opacity-75' : ''}`}>
                                        {exercise.title}
                                      </div>
                                      <div className="text-xs opacity-75">
                                        {exercise.points} pts • {exercise.difficulty}
                                      </div>
                                    </div>
                                  </div>
                                  {exercise.difficulty === 'hard' && (
                                    <Star className="w-4 h-4 text-yellow-500" />
                                  )}
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

            {filteredLessons.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No lessons found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;