import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Code,
  Trophy,
  Clock,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface DashboardStats {
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  completedExercises: number;
  totalPoints: number;
  currentStreak: number;
  studyTime: number;
  averageScore: number;
}

interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'exercise_completed' | 'achievement_earned';
  title: string;
  description: string;
  timestamp: Date;
  points?: number;
}

interface RecommendedLesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  progress: number;
  isNew?: boolean;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recommendedLessons, setRecommendedLessons] = useState<RecommendedLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch real data from APIs
      const [lessonsResponse, userResponse] = await Promise.all([
        fetch('/api/lessons'),
        fetch('/api/users/user-1') // TODO: Get from authentication context
      ]);

      const lessons = await lessonsResponse.json();

      // Calculate stats from real data
      const userId = 'user-1';
      let totalCompletedLessons = 0;
      let totalCompletedExercises = 0;
      let totalPoints = 0;
      let totalStudyTime = 0;
      let totalScore = 0;
      let scoreCount = 0;

      // Fetch progress for all lessons
      const progressPromises = lessons.map(async (lesson: any) => {
        try {
          const response = await fetch(`/api/exercises/progress/${userId}/${lesson.id}`);
          const progress = await response.json();
          return { lesson, progress };
        } catch (error) {
          return { lesson, progress: null };
        }
      });

      const progressResults = await Promise.all(progressPromises);

      progressResults.forEach(({ lesson, progress }) => {
        if (progress) {
          if (progress.completed) {
            totalCompletedLessons++;
            totalPoints += progress.score || 0;
          }
          totalCompletedExercises += progress.completedExercises?.length || 0;
          totalStudyTime += progress.timeSpent || 0;
          if (progress.score) {
            totalScore += progress.score;
            scoreCount++;
          }
        }
      });

      setStats({
        totalLessons: lessons.length,
        completedLessons: totalCompletedLessons,
        totalExercises: lessons.reduce((acc: number, lesson: any) => acc + (lesson.exercises?.length || 0), 0),
        completedExercises: totalCompletedExercises,
        totalPoints: totalPoints,
        currentStreak: 5, // TODO: Calculate from real data
        studyTime: totalStudyTime,
        averageScore: scoreCount > 0 ? totalScore / scoreCount : 0
      });

      // Generate recent activity from progress data (simplified)
      const recentActivity: RecentActivity[] = [];
      progressResults.forEach(({ lesson, progress }) => {
        if (progress && progress.lastAttempt) {
          recentActivity.push({
            id: `lesson-${lesson.id}`,
            type: progress.completed ? 'lesson_completed' : 'exercise_completed',
            title: lesson.title,
            description: progress.completed ? 'Lesson completed' : `${progress.completedExercises?.length || 0} exercises completed`,
            timestamp: new Date(progress.lastAttempt),
            points: progress.score || 0
          });
        }
      });

      // Sort by timestamp and take the most recent 3
      recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivity(recentActivity.slice(0, 3));

      // Set recommended lessons (prioritize incomplete lessons)
      const recommendedLessons: RecommendedLesson[] = lessons
        .filter((lesson: any) => {
          const progress = progressResults.find(p => p.lesson.id === lesson.id)?.progress;
          return !progress || !progress.completed;
        })
        .slice(0, 3)
        .map((lesson: any, index: number) => {
          const progress = progressResults.find(p => p.lesson.id === lesson.id)?.progress;
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            difficulty: lesson.difficulty,
            estimatedTime: lesson.estimatedTime,
            progress: progress ? (progress.completedExercises?.length / (lesson.exercises?.length || 1)) * 100 : 0,
            isNew: index === 0 // Mark first one as new
          };
        });

      setRecommendedLessons(recommendedLessons);

    } catch (error) {
      console.error('Error loading dashboard data:', error);

      // Fallback to fake data if API calls fail
      setStats({
        totalLessons: 6,
        completedLessons: 3,
        totalExercises: 25,
        completedExercises: 12,
        totalPoints: 385,
        currentStreak: 5,
        studyTime: 420,
        averageScore: 82.5
      });

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

      setRecommendedLessons([
        {
          id: 'arithmetic',
          title: 'Arithmetic Operations',
          description: 'Master addition, subtraction, multiplication, and division',
          difficulty: 'beginner',
          estimatedTime: 45,
          progress: 75,
          isNew: false
        },
        {
          id: 'control_flow',
          title: 'Control Flow & Loops',
          description: 'Learn conditional statements and iteration',
          difficulty: 'intermediate',
          estimatedTime: 60,
          progress: 0,
          isNew: true
        },
        {
          id: 'memory',
          title: 'Memory Management',
          description: 'Understanding pointers, arrays, and memory allocation',
          difficulty: 'intermediate',
          estimatedTime: 75,
          progress: 30,
          isNew: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your learning dashboard..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load dashboard</h2>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Student! 👋</h1>
              <p className="text-blue-100 text-lg mb-4">
                Ready to continue your assembly programming journey?
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>{stats.currentStreak} day streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{Math.round(stats.studyTime / 60)}h {stats.studyTime % 60}m studied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>{stats.averageScore}% avg score</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Trophy className="w-16 h-16 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lessons Completed"
          value={`${stats.completedLessons}/${stats.totalLessons}`}
          subtitle={`${Math.round((stats.completedLessons / stats.totalLessons) * 100)}% complete`}
          icon={BookOpen}
          color="blue"
          progress={(stats.completedLessons / stats.totalLessons) * 100}
        />
        <StatCard
          title="Exercises Done"
          value={`${stats.completedExercises}/${stats.totalExercises}`}
          subtitle={`${stats.completedExercises} of ${stats.totalExercises} completed`}
          icon={Code}
          color="green"
          progress={(stats.completedExercises / stats.totalExercises) * 100}
        />
        <StatCard
          title="Total Points"
          value={stats.totalPoints.toLocaleString()}
          subtitle="Keep learning to earn more!"
          icon={Trophy}
          color="yellow"
        />
        <StatCard
          title="Current Level"
          value="5"
          subtitle="385/500 XP to next level"
          icon={TrendingUp}
          color="purple"
          progress={(385 / 500) * 100}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Lessons */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Continue Learning</h2>
              <Link
                to="/learn"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
              >
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {recommendedLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>

            <Link
              to="/progress"
              className="inline-flex items-center mt-4 text-blue-400 hover:text-blue-300 text-sm"
            >
              View full activity log <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Start Practice"
            description="Jump into a coding exercise"
            icon={Code}
            action="Practice"
            color="blue"
          />
          <QuickActionCard
            title="Take Quiz"
            description="Test your knowledge"
            icon={Target}
            action="Quiz"
            color="green"
          />
          <QuickActionCard
            title="View Progress"
            description="Check your learning stats"
            icon={TrendingUp}
            action="Progress"
            color="purple"
          />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, progress }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Lesson Card Component
interface LessonCardProps {
  lesson: RecommendedLesson;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const difficultyColors = {
    beginner: 'bg-green-600',
    intermediate: 'bg-yellow-600',
    advanced: 'bg-red-600'
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium text-white">{lesson.title}</h3>
            {lesson.isNew && (
              <span className="px-2 py-1 bg-blue-600 text-xs text-white rounded-full">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-3">{lesson.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {lesson.estimatedTime} min
            </span>
            <span className={`px-2 py-1 rounded ${difficultyColors[lesson.difficulty]} text-white`}>
              {lesson.difficulty}
            </span>
          </div>
        </div>
        <Link
          to={`/lesson/${lesson.id}`}
          className="ml-4 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Play className="w-4 h-4 text-white" />
        </Link>
      </div>

      {lesson.progress > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{lesson.progress}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${lesson.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Activity Item Component
interface ActivityItemProps {
  activity: RecentActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
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

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-750 rounded-lg">
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
  );
};

// Quick Action Card Component
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;
  color: 'blue' | 'green' | 'purple';
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  action,
  color
}) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
      <h3 className="font-medium text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};

export default Dashboard;