import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code,
  Clock,
  Target,
  Filter,
  Search,
  Play,
  CheckCircle,
  AlertCircle,
  Trophy,
  Star
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Using local type definitions for client-side
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

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags: string[];
  exercises?: string[];
}

interface ExerciseProgress {
  completed: boolean;
  score: number;
  attempts: number;
  lastAttempt: Date;
  timeSpent: number;
}

const Practice: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, ExerciseProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);

      // First get all lessons to understand the structure
      const lessonsResponse = await fetch('/api/lessons');
      const lessonsData = await lessonsResponse.json();
      setLessons(lessonsData);

      // Collect all exercises from all lessons
      const allExercises: Exercise[] = [];
      const exercisePromises = lessonsData.map(async (lesson: Lesson) => {
        try {
          const response = await fetch(`/api/exercises/lesson/${lesson.id}`);
          const lessonExercises = await response.json();
          return lessonExercises.map((exercise: Exercise) => ({
            ...exercise,
            lessonId: lesson.id,
            lessonTitle: lesson.title
          }));
        } catch (error) {
          console.error(`Error fetching exercises for lesson ${lesson.id}:`, error);
          return [];
        }
      });

      const exerciseResults = await Promise.all(exercisePromises);
      exerciseResults.forEach(lessonExercises => {
        allExercises.push(...lessonExercises);
      });

      setExercises(allExercises);

      // Fetch progress for all exercises
      await fetchAllExerciseProgress(allExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllExerciseProgress = async (exerciseList: Exercise[]) => {
    const userId = 'user-1'; // TODO: Get from authentication context

    const progressPromises = exerciseList.map(async (exercise) => {
      try {
        // Since we don't have a direct exercise progress endpoint, we'll simulate
        // In a real app, you'd have an endpoint to get exercise-level progress
        const progress = await getExerciseProgress(userId, exercise.id);
        return { exerciseId: exercise.id, progress };
      } catch (error) {
        console.error(`Error fetching progress for exercise ${exercise.id}:`, error);
        return { exerciseId: exercise.id, progress: null };
      }
    });

    const progressResults = await Promise.all(progressPromises);
    const newProgressMap = new Map<string, ExerciseProgress>();

    progressResults.forEach(({ exerciseId, progress }) => {
      if (progress) {
        newProgressMap.set(exerciseId, progress);
      }
    });

    setProgressMap(newProgressMap);
  };

  // Temporary function to simulate exercise progress
  // In a real implementation, you'd have proper backend support for this
  const getExerciseProgress = async (userId: string, exerciseId: string): Promise<ExerciseProgress | null> => {
    // Simulate some exercises as completed
    const completedExercises = ['arithmetic-basic', 'registers-intro', 'memory-basic'];
    if (completedExercises.includes(exerciseId)) {
      return {
        completed: true,
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        attempts: Math.floor(Math.random() * 3) + 1,
        lastAttempt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
        timeSpent: Math.floor(Math.random() * 30) + 5 // 5-35 minutes
      };
    }
    return null;
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'hard': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading exercises..." />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No exercises available</h2>
          <p className="text-gray-400">Please check back later for new exercises</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Practice Exercises</h1>
          <p className="text-gray-400">
            Hone your assembly programming skills with targeted exercises
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
            title="Toggle filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-3">Filters</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setDifficultyFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setDifficultyFilter('easy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === 'easy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setDifficultyFilter('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setDifficultyFilter('hard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === 'hard'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Hard
            </button>
          </div>
        </div>
      )}

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => {
          const progress = progressMap.get(exercise.id);
          const isCompleted = progress?.completed || false;

          return (
            <div
              key={exercise.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {exercise.title}
                    </h3>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                    {exercise.description}
                  </p>
                  {(exercise as any).lessonTitle && (
                    <p className="text-xs text-gray-500 mb-2">
                      From: {(exercise as any).lessonTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-400">{exercise.points} pts</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getDifficultyColor(exercise.difficulty)}`}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </div>
                  </div>
                </div>

                {progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Last attempt: {progress.score}%</span>
                      <span>{progress.attempts} attempts</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{progress.timeSpent} min</span>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`/exercise/${exercise.id}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 group"
              >
                <span>{isCompleted ? 'Practice Again' : 'Start Exercise'}</span>
                <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No exercises found</h3>
          <p className="text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Practice;
