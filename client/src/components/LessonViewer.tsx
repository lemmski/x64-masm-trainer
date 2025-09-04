import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, BookOpen } from 'lucide-react';
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
import ProgressTracker from './ProgressTracker';

interface LessonViewerProps {
  lesson: Lesson | null;
  onExerciseSelect: (exercise: Exercise) => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, onExerciseSelect }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lesson) {
      fetchExercises();
    }
  }, [lesson]);

  const fetchExercises = async () => {
    if (!lesson) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/exercises/lesson/${lesson.id}`);
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Select a lesson to view its content
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-gray-300">{lesson.description}</p>
          </div>
          <span className={`px-3 py-1 text-sm rounded ${
            lesson.difficulty === 'beginner' ? 'bg-green-600' :
            lesson.difficulty === 'intermediate' ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {lesson.difficulty}
          </span>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span>Estimated time: {lesson.estimatedTime} minutes</span>
          <span>Exercises: {lesson.exercises.length}</span>
          {lesson.tags.length > 0 && (
            <div className="flex space-x-2">
              {lesson.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-700 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker
        userId="user-1" // TODO: Get from authentication context
        lessonId={lesson.id}
      />

      {/* Lesson Content */}
      <div className="space-y-6">
        {lesson.content.sections.map((section, index) => (
          <div key={section.id} className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>

            {section.codeExamples && section.codeExamples.length > 0 && (
              <div className="mt-6 space-y-4">
                {section.codeExamples.map((example, exampleIndex) => (
                  <div key={exampleIndex} className="bg-gray-900 rounded p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      {example.title}
                    </h4>
                    <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                    {example.explanation && (
                      <p className="text-gray-400 text-sm mt-2">{example.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Key Concepts */}
        {lesson.content.keyConcepts.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Key Concepts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lesson.content.keyConcepts.map((concept, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>{concept}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Practice Exercises
        </h2>

        {loading ? (
          <div className="text-center text-gray-400 py-8">
            Loading exercises...
          </div>
        ) : exercises.length > 0 ? (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{exercise.title}</h3>
                    <p className="text-gray-300 text-sm">{exercise.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      exercise.difficulty === 'easy' ? 'bg-green-600' :
                      exercise.difficulty === 'medium' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {exercise.difficulty}
                    </span>
                    <span className="text-xs text-gray-400">{exercise.points}pts</span>
                  </div>
                </div>

                <Link
                  to={`/exercise/${exercise.id}`}
                  onClick={() => onExerciseSelect(exercise)}
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Start Exercise</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No exercises available for this lesson yet.</p>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;
