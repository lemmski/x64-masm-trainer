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
  language?: 'masm' | 'output';
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
  output: string;
  error: string | undefined;
  executionTime: number;
  exitCode: number;
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
  error: string | undefined;
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

// Testing Framework Types
export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  configuration: TestConfiguration;
}

export interface TestConfiguration {
  timeout: number;
  memoryLimit: number;
  allowSystemCalls: boolean;
  testType: TestType;
  gradingCriteria: GradingCriteria;
}

export type TestType =
  | 'output_validation'
  | 'unit_test'
  | 'performance_test'
  | 'memory_test'
  | 'security_test'
  | 'code_quality';

export interface GradingCriteria {
  outputWeight: number;
  performanceWeight: number;
  codeQualityWeight: number;
  securityWeight: number;
  bonusPoints: {
    earlyCompletion: number;
    efficientCode: number;
    cleanCode: number;
  };
}

export interface TestExecutionResult {
  testSuiteId: string;
  results: TestResult[];
  summary: TestSummary;
  grade: Grade;
  feedback: Feedback;
}

export interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  memoryUsage: number;
}

export interface Grade {
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  breakdown: {
    output: number;
    performance: number;
    quality: number;
    security: number;
    bonus: number;
  };
}

export interface Feedback {
  overall: {
    message: string;
    sentiment: 'excellent' | 'good' | 'fair' | 'needs_work';
  };
  strengths: string[];
  weaknesses?: string[];
  codeQuality: CodeQualityAnalysis;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  executionTime: number;
  instructionsExecuted: number;
  memoryUsage: number;
  codeSize: number;
  efficiency: number;
}

export interface Recommendation {
  type: 'improvement' | 'optimization' | 'best_practice' | 'learning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  codeExample?: string;
}

export interface DetailedGrade {
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  breakdown: GradeBreakdown;
  feedback: DetailedFeedback;
  recommendations: Recommendation[];
}

export interface GradeBreakdown {
  functionality: {
    score: number;
    maxScore: number;
    percentage: number;
    description: string;
  };
  efficiency: {
    score: number;
    maxScore: number;
    percentage: number;
    description: string;
  };
  style: {
    score: number;
    maxScore: number;
    percentage: number;
    description: string;
  };
  robustness: {
    score: number;
    maxScore: number;
    percentage: number;
    description: string;
  };
}

export interface DetailedFeedback {
  overall: {
    message: string;
    sentiment: 'excellent' | 'good' | 'fair' | 'needs_work';
  };
  strengths: string[];
  weaknesses: string[];
  codeQuality: CodeQualityAnalysis;
  performanceMetrics: PerformanceMetrics;
}

export interface CodeQualityAnalysis {
  linesOfCode: number;
  instructionCount: number;
  registerUsage: Record<string, number>;
  efficiency: number;
  readability: number;
  maintainability: number;
}
