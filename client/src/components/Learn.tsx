import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Star,
  Filter,
  Search,
  ChevronRight,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Using local type definitions for client-side
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

const Learn: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, LessonProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
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
        return { lessonId: lesson.id, progress: null };
      }
    });

    const progressResults = await Promise.all(progressPromises);
    const newProgressMap = new Map<string, LessonProgress>();

    progressResults.forEach(({ lessonId, progress }) => {
      if (progress) {
        newProgressMap.set(lessonId, progress);
      }
    });

    setProgressMap(newProgressMap);
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || lesson.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600';
      case 'intermediate': return 'bg-yellow-600';
      case 'advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading lessons..." />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No lessons available</h2>
          <p className="text-gray-400">Please check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Learn Assembly</h1>
          <p className="text-gray-400">
            Master x64 assembly programming through structured lessons and exercises
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lessons..."
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
              onClick={() => setDifficultyFilter('beginner')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === 'beginner'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setDifficultyFilter('intermediate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === 'intermediate'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Intermediate
            </button>
            <button
              onClick={() => setDifficultyFilter('advanced')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === 'advanced'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      )}

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const progress = progressMap.get(lesson.id);
          const isCompleted = progress?.completed || false;
          const progressPercentage = progress ? (progress.completedExercises.length / (lesson.exercises?.length || 1)) * 100 : 0;

          return (
            <div
              key={lesson.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {lesson.title}
                    </h3>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                    {lesson.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">{lesson.estimatedTime} min</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getDifficultyColor(lesson.difficulty)}`}>
                      {getDifficultyLabel(lesson.difficulty)}
                    </div>
                  </div>
                </div>

                {progress && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`/lesson/${lesson.id}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 group"
              >
                <span>{isCompleted ? 'Review Lesson' : progress ? 'Continue' : 'Start Lesson'}</span>
                <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No lessons found</h3>
          <p className="text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Learn;
