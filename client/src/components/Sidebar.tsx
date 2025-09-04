import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import SidebarMiniIndicators from './sidebar/SidebarMiniIndicators';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarSearch from './sidebar/SidebarSearch';
import SidebarFilters from './sidebar/SidebarFilters';
import SidebarLessonList from './sidebar/SidebarLessonList';

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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
        if (!response.ok) {
          // If endpoint doesn't exist or returns error, return null
          return { lessonId: lesson.id, progress: null };
        }
        const progress = await response.json();
        return { lessonId: lesson.id, progress };
      } catch (error) {
        // Silently handle errors for progress (it's optional data)
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
    const matchesSearch = lesson.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDifficulty = filters.difficulty === 'all' || lesson.difficulty === filters.difficulty;
    const progress = progressMap.get(lesson.id);
    const matchesCompleted = filters.completed === null ||
                           (filters.completed && progress?.completed) ||
                           (!filters.completed && (!progress || !progress.completed));

    return matchesSearch && matchesDifficulty && matchesCompleted;
  });

  const toggleLessonExpansion = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const clearFilters = () => {
    setFilters({
      difficulty: 'all',
      completed: null,
      search: ''
    });
  };

  const hasActiveFilters = filters.difficulty !== 'all' || filters.completed !== null || filters.search !== '';

  return (
    <div className={`${isOpen ? 'w-80' : 'w-16'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300`}>
      {!isOpen ? (
        <SidebarMiniIndicators
          lessons={lessons}
          progressMap={progressMap}
        />
      ) : (
        <>
          <SidebarHeader
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          <SidebarSearch
            searchValue={filters.search}
            onSearchChange={(value) => setFilters({ ...filters, search: value })}
          />

          {showFilters && (
            <SidebarFilters
              filters={filters}
              onFiltersChange={setFilters}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}

          <SidebarLessonList
            lessons={filteredLessons}
            progressMap={progressMap}
            selectedLesson={selectedLesson}
            selectedExercise={selectedExercise}
            expandedLessons={expandedLessons}
            onLessonSelect={onLessonSelect}
            onExerciseSelect={onExerciseSelect}
            onToggleExpansion={toggleLessonExpansion}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default Sidebar;
