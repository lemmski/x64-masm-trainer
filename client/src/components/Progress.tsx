import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Trophy,
  Clock,
  Target,
  Calendar,
  BookOpen,
  Code,
  Award,
  Star,
  BarChart3,
  Activity,
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

interface UserStats {
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  completedExercises: number;
  totalPoints: number;
  currentStreak: number;
  studyTime: number;
  averageScore: number;
  level: number;
  xpToNextLevel: number;
}

interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'exercise_completed' | 'achievement_earned';
  title: string;
  description: string;
  timestamp: Date;
  points?: number;
}

const Progress: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, LessonProgress>>(new Map());
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch user stats (simulated since we don't have a real user system)
      setUserStats({
        totalLessons: 6,
        completedLessons: 3,
        totalExercises: 25,
        completedExercises: 12,
        totalPoints: 385,
        currentStreak: 5,
        studyTime: 420, // minutes
        averageScore: 82.5,
        level: 5,
        xpToNextLevel: 115
      });

      // Fetch lessons
      const lessonsResponse = await fetch('/api/lessons');
      const lessonsData = await lessonsResponse.json();
      setLessons(lessonsData);

      // Fetch progress for all lessons
      const userId = 'user-1';
      const progressPromises = lessonsData.map(async (lesson: Lesson) => {
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

      // Simulate recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'exercise_completed',
          title: 'Basic Arithmetic',
          description: 'Completed with 95% score',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          points: 15
        },
        {
          id: '2',
          type: 'achievement_earned',
          title: 'Quick Learner',
          description: 'Completed 3 exercises in one session',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          points: 10
        },
        {
          id: '3',
          type: 'lesson_completed',
          title: 'Working with Registers',
          description: 'Mastered register operations',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          points: 50
        }
      ]);

    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'lesson_completed':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'exercise_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'achievement_earned':
        return <Award className="w-4 h-4 text-yellow-500" />;
      default:
        return <Code className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your progress..." />
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load progress</h2>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const lessonCompletionRate = (userStats.completedLessons / userStats.totalLessons) * 100;
  const exerciseCompletionRate = (userStats.completedExercises / userStats.totalExercises) * 100;
  const levelProgress = ((userStats.totalPoints % 500) / 500) * 100; // Assuming 500 XP per level

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Progress</h1>
        <p className="text-gray-400">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Level</p>
              <p className="text-2xl font-bold text-white mb-1">{userStats.level}</p>
              <p className="text-xs text-gray-500">{userStats.xpToNextLevel} XP to next level</p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Points</p>
              <p className="text-2xl font-bold text-white mb-1">{userStats.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Keep learning!</p>
            </div>
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Streak</p>
              <p className="text-2xl font-bold text-white mb-1">{userStats.currentStreak}</p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Study Time</p>
              <p className="text-2xl font-bold text-white mb-1">{Math.round(userStats.studyTime / 60)}h</p>
              <p className="text-xs text-gray-500">{userStats.studyTime % 60}m total</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Charts */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Learning Progress
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Lessons Completed</span>
                <span className="text-sm text-gray-400">{userStats.completedLessons}/{userStats.totalLessons}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${lessonCompletionRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Exercises Completed</span>
                <span className="text-sm text-gray-400">{userStats.completedExercises}/{userStats.totalExercises}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${exerciseCompletionRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Average Score</span>
                <span className="text-sm text-gray-400">{userStats.averageScore}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${userStats.averageScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </h2>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-gray-750 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{activity.title}</p>
                  <p className="text-xs text-gray-400">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                    {activity.points && (
                      <span className="text-xs text-yellow-400 font-medium">
                        +{activity.points} XP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Progress Details */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Lesson Progress</h2>

        <div className="space-y-4">
          {lessons.map((lesson) => {
            const progress = progressMap.get(lesson.id);
            const isCompleted = progress?.completed || false;
            const progressPercentage = progress ?
              (progress.completedExercises.length / (lesson.exercises?.length || 1)) * 100 : 0;

            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 bg-gray-750 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <div>
                    <h3 className="font-medium text-white">{lesson.title}</h3>
                    <p className="text-sm text-gray-400">{lesson.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {progress && (
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {progress.completedExercises.length}/{lesson.exercises?.length || 0} exercises
                      </div>
                      <div className="w-32 bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-400">
                    {isCompleted ? 'Completed' : progress ? `${Math.round(progressPercentage)}%` : 'Not Started'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Progress;
