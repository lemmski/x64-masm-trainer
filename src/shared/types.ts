export interface User {
  id: string;
  username: string;
  email: string;
  progress: LessonProgress[];
  preferences: UserPreferences;
  createdAt: Date;
  lastActive: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  editorFontSize: number;
  autoSave: boolean;
  showLineNumbers: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: LessonContent;
  prerequisites: string[];
  exercises: Exercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  tags: string[];
}

export interface LessonContent {
  sections: LessonSection[];
  summary: string;
  keyConcepts: string[];
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  codeExamples?: CodeExample[];
}

export interface CodeExample {
  title: string;
  code: string;
  explanation: string;
  language: 'masm' | 'output';
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
  isHidden: boolean;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  timeSpent: number; // in seconds
  attempts: number;
  lastAttempt: Date;
  completedExercises: string[];
}

export interface AssemblyResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  exitCode?: number;
}

export interface CodeSubmission {
  code: string;
  exerciseId: string;
  userId: string;
  timestamp: Date;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTime: number;
  error?: string;
}

export interface ExerciseSubmission {
  exerciseId: string;
  code: string;
  results: TestResult[];
  passed: boolean;
  score: number;
  timestamp: Date;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';
