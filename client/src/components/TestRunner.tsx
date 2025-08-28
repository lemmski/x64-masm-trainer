import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
  Code,
  Zap,
  Shield,
  BookOpen
} from 'lucide-react';
import {
  TestSuite,
  TestExecutionResult,
  DetailedGrade,
  TestRunnerResult,
  QuickValidationResult
} from '../../../../src/shared/types';
import { TestRunnerOptions } from '../../../src/tests/testRunner';

interface TestRunnerProps {
  exerciseId: string;
  code: string;
  onTestComplete?: (result: TestRunnerResult) => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ exerciseId, code, onTestComplete }) => {
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [testResult, setTestResult] = useState<TestRunnerResult | null>(null);
  const [quickValidation, setQuickValidation] = useState<QuickValidationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'tests' | 'grade' | 'feedback' | 'analysis'>('tests');
  const [options, setOptions] = useState<TestRunnerOptions>({
    includePerformanceAnalysis: true,
    includeCodeQualityAnalysis: true,
    includeDetailedFeedback: true,
    strictMode: false,
    bonusPointsEnabled: true,
    timeout: 5000,
    maxRetries: 2
  });

  // Generate test suite on mount
  useEffect(() => {
    generateTestSuite();
  }, [exerciseId]);

  const generateTestSuite = async () => {
    try {
      const response = await fetch(`/api/testing/generate/${exerciseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepts: ['arithmetic', 'registers'], // Default concepts
          count: 5
        })
      });

      const suite = await response.json();
      setTestSuite(suite);
    } catch (error) {
      console.error('Error generating test suite:', error);
    }
  };

  const runQuickValidation = async () => {
    if (!testSuite || !code.trim()) return;

    setIsValidating(true);
    try {
      const response = await fetch(`/api/testing/validate/${exerciseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          testCases: testSuite.testCases.slice(0, 3) // Use first 3 test cases
        })
      });

      const result = await response.json();
      setQuickValidation(result);
    } catch (error) {
      console.error('Error running quick validation:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const runFullTestSuite = async () => {
    if (!testSuite || !code.trim()) return;

    setIsRunning(true);
    try {
      const response = await fetch(`/api/testing/run/${exerciseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          userId: 'user-1', // TODO: Get from auth context
          testSuite,
          options
        })
      });

      const result = await response.json();
      setTestResult(result);

      if (onTestComplete) {
        onTestComplete(result);
      }
    } catch (error) {
      console.error('Error running test suite:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-900/30 border-green-700';
    if (percentage >= 80) return 'bg-blue-900/30 border-blue-700';
    if (percentage >= 70) return 'bg-yellow-900/30 border-yellow-700';
    return 'bg-red-900/30 border-red-700';
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-semibold">Test Runner</h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={runQuickValidation}
              disabled={isValidating || !code.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isValidating ? 'Validating...' : 'Quick Test'}</span>
            </button>

            <button
              onClick={runFullTestSuite}
              disabled={isRunning || !testSuite || !code.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isRunning ? 'Running Tests...' : 'Run Full Suite'}</span>
            </button>
          </div>
        </div>

        {testSuite && (
          <div className="mt-3 text-sm text-gray-400">
            {testSuite.testCases.length} test cases loaded • {testSuite.name}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-750 px-6 py-3 border-b border-gray-600">
        <div className="flex space-x-6">
          {[
            { id: 'tests', label: 'Test Results', icon: Code },
            { id: 'grade', label: 'Grade', icon: Target },
            { id: 'feedback', label: 'Feedback', icon: BookOpen },
            { id: 'analysis', label: 'Analysis', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                selectedTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'tests' && (
          <TestResultsTab
            testResult={testResult}
            quickValidation={quickValidation}
            testSuite={testSuite}
          />
        )}

        {selectedTab === 'grade' && testResult && (
          <GradeTab grade={testResult.detailedGrade} />
        )}

        {selectedTab === 'feedback' && testResult && (
          <FeedbackTab
            feedback={testResult.detailedGrade.feedback}
            recommendations={testResult.detailedGrade.recommendations}
          />
        )}

        {selectedTab === 'analysis' && testResult && (
          <AnalysisTab
            grade={testResult.detailedGrade}
            metadata={testResult.metadata}
          />
        )}

        {!testResult && !quickValidation && (
          <div className="text-center py-12 text-gray-400">
            <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Ready to Test</h3>
            <p>Write your code and run tests to see detailed feedback and grading.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Test Results Tab Component
const TestResultsTab: React.FC<{
  testResult: TestRunnerResult | null;
  quickValidation: QuickValidationResult | null;
  testSuite: TestSuite | null;
}> = ({ testResult, quickValidation, testSuite }) => {
  const results = testResult?.testExecution.results || quickValidation?.results || [];
  const summary = testResult?.testExecution.summary || quickValidation?.summary;

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{summary.totalTests}</div>
            <div className="text-sm text-gray-400">Total Tests</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{summary.passedTests}</div>
            <div className="text-sm text-gray-400">Passed</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{summary.failedTests}</div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {summary.successRate?.toFixed(1) || '0'}%
            </div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
        </div>
      )}

      {/* Individual Test Results */}
      <div className="space-y-3">
        <h3 className="font-medium">Test Details</h3>
        {results.map((result, index) => (
          <div
            key={result.testCaseId || index}
            className={`p-4 rounded-lg border ${
              result.passed
                ? 'bg-green-900/20 border-green-700'
                : 'bg-red-900/20 border-red-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {result.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <div className="font-medium">
                    Test {index + 1}: {result.passed ? 'PASSED' : 'FAILED'}
                  </div>
                  <div className="text-sm text-gray-400">
                    Input: "{result.input || 'N/A'}" → Expected: "{result.expectedOutput}"
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {result.executionTime}ms
                </span>
              </div>
            </div>

            {!result.passed && (
              <div className="mt-3 p-3 bg-red-900/30 rounded border border-red-700">
                <div className="text-sm">
                  <div className="text-red-300 font-medium">Expected:</div>
                  <div className="font-mono text-red-200">"{result.expectedOutput}"</div>
                  <div className="text-red-300 font-medium mt-2">Got:</div>
                  <div className="font-mono text-red-200">"{result.actualOutput}"</div>
                  {result.error && (
                    <div className="text-red-300 font-medium mt-2">Error:</div>
                  )}
                  {result.error && (
                    <div className="font-mono text-red-200">{result.error}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Grade Tab Component
const GradeTab: React.FC<{ grade: DetailedGrade }> = ({ grade }) => {
  return (
    <div className="space-y-6">
      {/* Overall Grade */}
      <div className="text-center">
        <div className={`inline-block p-8 rounded-full border-4 ${getGradeBgColor(grade.percentage)}`}>
          <div className={`text-6xl font-bold ${getGradeColor(grade.percentage)}`}>
            {grade.letterGrade}
          </div>
        </div>
        <div className="mt-4">
          <div className={`text-4xl font-bold ${getGradeColor(grade.percentage)}`}>
            {grade.score}/{grade.maxScore}
          </div>
          <div className="text-gray-400">{grade.percentage}%</div>
        </div>
      </div>

      {/* Grade Breakdown */}
      <div className="space-y-4">
        <h3 className="font-medium">Grade Breakdown</h3>

        {Object.entries(grade.breakdown).map(([category, breakdown]) => (
          <div key={category} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium capitalize">{category}</div>
              <div className="text-right">
                <div className="font-bold">{breakdown.score}/{breakdown.maxScore}</div>
                <div className="text-sm text-gray-400">{breakdown.percentage}%</div>
              </div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${breakdown.percentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400 mt-1">{breakdown.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feedback Tab Component
const FeedbackTab: React.FC<{
  feedback: DetailedGrade['feedback'];
  recommendations: DetailedGrade['recommendations'];
}> = ({ feedback, recommendations }) => {
  return (
    <div className="space-y-6">
      {/* Overall Feedback */}
      <div className={`p-4 rounded-lg border ${
        feedback.overall.sentiment === 'excellent' ? 'bg-green-900/30 border-green-700' :
        feedback.overall.sentiment === 'good' ? 'bg-blue-900/30 border-blue-700' :
        feedback.overall.sentiment === 'fair' ? 'bg-yellow-900/30 border-yellow-700' :
        'bg-red-900/30 border-red-700'
      }`}>
        <h3 className="font-medium mb-2">Overall Feedback</h3>
        <p>{feedback.overall.message}</p>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <h3 className="font-medium text-green-400 mb-3">Strengths</h3>
          {feedback.strengths.length > 0 ? (
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No specific strengths identified.</p>
          )}
        </div>

        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <h3 className="font-medium text-red-400 mb-3">Areas for Improvement</h3>
          {feedback.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No major weaknesses identified.</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h3 className="font-medium text-blue-400 mb-3">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  rec.priority === 'high' ? 'text-red-400' :
                  rec.priority === 'medium' ? 'text-yellow-400' :
                  'text-blue-400'
                }`} />
                <div>
                  <div className="font-medium">{rec.title}</div>
                  <div className="text-sm text-gray-300">{rec.description}</div>
                  {rec.codeExample && (
                    <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono">
                      {rec.codeExample}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Quality Analysis */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium mb-3">Code Quality Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {feedback.codeQuality.efficiency}%
            </div>
            <div className="text-sm text-gray-400">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {feedback.codeQuality.readability}%
            </div>
            <div className="text-sm text-gray-400">Readability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {feedback.codeQuality.maintainability}%
            </div>
            <div className="text-sm text-gray-400">Maintainability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Object.keys(feedback.codeQuality.registerUsage).length}
            </div>
            <div className="text-sm text-gray-400">Registers Used</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analysis Tab Component
const AnalysisTab: React.FC<{
  grade: DetailedGrade;
  metadata: TestRunnerResult['metadata'];
}> = ({ grade, metadata }) => {
  return (
    <div className="space-y-6">
      {/* Performance Analysis */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Performance Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {grade.feedback.performanceMetrics.executionTime}ms
            </div>
            <div className="text-sm text-gray-400">Avg Execution Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {grade.feedback.performanceMetrics.efficiency}%
            </div>
            <div className="text-sm text-gray-400">Efficiency Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {grade.feedback.performanceMetrics.codeSize}
            </div>
            <div className="text-sm text-gray-400">Lines of Code</div>
          </div>
        </div>
      </div>

      {/* Test Run Metadata */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium mb-3">Test Run Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Duration</div>
            <div className="font-medium">{metadata.duration}ms</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Environment</div>
            <div className="font-medium">
              {metadata.environment.platform} ({metadata.environment.architecture})
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Node Version</div>
            <div className="font-medium">{metadata.environment.nodeVersion}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Test Start</div>
            <div className="font-medium">
              {metadata.startTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getGradeColor = (percentage: number) => {
  if (percentage >= 90) return 'text-green-400';
  if (percentage >= 80) return 'text-blue-400';
  if (percentage >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

const getGradeBgColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-green-900/30 border-green-700';
  if (percentage >= 80) return 'bg-blue-900/30 border-blue-700';
  if (percentage >= 70) return 'bg-yellow-900/30 border-yellow-700';
  return 'bg-red-900/30 border-red-700';
};

export default TestRunner;
