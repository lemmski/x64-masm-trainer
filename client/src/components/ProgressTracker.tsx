import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Trophy, Clock, Target } from 'lucide-react';
import { LessonProgress } from '../../../../src/shared/types';

interface ProgressTrackerProps {
  userId: string;
  lessonId?: string;
  onProgressUpdate?: (progress: LessonProgress) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  userId,
  lessonId,
  onProgressUpdate
}) => {
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchLessonProgress();
    }
  }, [userId, lessonId]);

  const fetchLessonProgress = async () => {
    if (!lessonId) return;

    try {
      const response = await fetch(`/api/exercises/progress/${userId}/${lessonId}`);
      const data = await response.json();
      setProgress(data);

      if (onProgressUpdate) {
        onProgressUpdate(data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400 text-sm">No progress data available</p>
      </div>
    );
  }

  const completionPercentage = progress.completedExercises.length > 0 ?
    (progress.completedExercises.length / 3) * 100 : 0; // Assuming 3 exercises per lesson

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Lesson Progress
        </h3>
        {progress.completed && (
          <div className="flex items-center text-green-400">
            <Trophy className="w-4 h-4 mr-1" />
            <span className="text-sm">Completed!</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Progress Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>Exercises Completed</span>
          </div>
          <span className="font-medium">
            {progress.completedExercises.length}/3
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-400">
            <Trophy className="w-4 h-4 mr-2" />
            <span>Best Score</span>
          </div>
          <span className="font-medium">{progress.score}/100</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span>Time Spent</span>
          </div>
          <span className="font-medium">
            {Math.round(progress.timeSpent / 60)}m {progress.timeSpent % 60}s
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-400">
            <Circle className="w-4 h-4 mr-2" />
            <span>Attempts</span>
          </div>
          <span className="font-medium">{progress.attempts}</span>
        </div>

        {progress.lastAttempt && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>Last Attempt</span>
            </div>
            <span className="font-medium">
              {new Date(progress.lastAttempt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Completion Status */}
      {progress.completed && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Lesson Completed!</span>
          </div>
          <p className="text-sm text-green-300 mt-1">
            Great job! You've successfully completed all exercises in this lesson.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
