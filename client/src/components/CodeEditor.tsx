import React, { useRef, useEffect, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Play, RotateCcw, Save, Lightbulb, CheckCircle, XCircle, AlertCircle, Target } from 'lucide-react';
// Note: Types should be shared via a proper build setup
interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hints: string[];
}

interface AssemblyResult {
  success: boolean;
  output: string;
  error: string | undefined;
  executionTime: number;
  exitCode: number;
}

interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTime: number;
  error: string | undefined;
}

interface ExerciseSubmission {
  id: string;
  exerciseId: string;
  code: string;
  results: TestResult[];
  score: number;
  timestamp: Date;
}
import TestRunner from './TestRunner';

interface CodeEditorProps {
  exercise: Exercise | null;
  onLessonSelect: (lessonId: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ exercise, onLessonSelect }) => {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [submission, setSubmission] = useState<ExerciseSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestRunner, setShowTestRunner] = useState(false);

  useEffect(() => {
    if (exercise) {
      setCode(exercise.starterCode);
      setOutput('');
    }
  }, [exercise]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Configure MASM syntax highlighting
    monaco.languages.setMonarchTokenizer('masm', {
      tokenizer: {
        root: [
          // Registers
          /\b(rax|rbx|rcx|rdx|rsi|rdi|rsp|rbp|r8|r9|r10|r11|r12|r13|r14|r15|eax|ebx|ecx|edx|esi|edi|esp|ebp|ax|bx|cx|dx|si|di|sp|bp|al|bl|cl|dl|ah|bh|ch|dh)\b/, 'keyword.control',

          // Instructions
          /\b(mov|add|sub|mul|div|push|pop|call|ret|jmp|je|jne|jg|jl|jge|jle|cmp|test|and|or|xor|not|shl|shr|sal|sar|rol|ror|inc|dec|lea|movzx|movsx|cbw|cwd|cdq|cqo)\b/, 'keyword',

          // Directives
          /\b(\.data|\.code|\.model|\.stack|\.386|\.486|\.586|\.686|\.mmx|\.xmm|\.ymm|\.zmm|flat|proc|endp|end|db|dw|dd|dq|dt|byte|word|dword|qword|tbyte|ptr|offset|length|size|type|equ|macro|endm|if|else|endif|while|endw|repeat|endr|struct|ends|union|ends|typedef|record)\b/, 'type',

          // Strings
          /"([^"\\]|\\.)*$/, 'string.invalid',
          /"/, 'string', '@string',

          // Numbers
          /\b\d+\b/, 'number',

          // Comments
          /;.*/, 'comment',

          // Labels
          /^[A-Za-z_][A-Za-z0-9_]*:/, 'type.parameter'
        ],

        string: [
          /[^\\"]+/, 'string',
          /\\./, 'string.escape',
          /"/, 'string', '@pop'
        ]
      }
    });

    monaco.languages.register({ id: 'masm' });
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    setOutput('');

    try {
      const response = await fetch('/api/assembler/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result: AssemblyResult = await response.json();

      if (result.success) {
        setOutput(result.output || 'Program executed successfully (no output)');
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput(`Network error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (exercise) {
      setCode(exercise.starterCode);
      setOutput('');
    }
  };

  const handleSaveCode = () => {
    // TODO: Implement save functionality
    console.log('Saving code:', code);
  };

  const handleSubmitExercise = async () => {
    if (!exercise || !code.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/exercises/${exercise.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          userId: 'user-1' // TODO: Get from authentication context
        }),
      });

      const result: ExerciseSubmission = await response.json();
      setSubmission(result);

      // Update output to show test results
      const testOutput = result.results.map((test, index) => {
        const status = test.passed ? '✅ PASS' : '❌ FAIL';
        return `Test ${index + 1}: ${status} (${test.executionTime}ms)\n  Expected: "${test.expectedOutput}"\n  Got: "${test.actualOutput}"${test.error ? `\n  Error: ${test.error}` : ''}`;
      }).join('\n\n');

      setOutput(`${result.passed ? '🎉 All tests passed!' : '❌ Some tests failed'}\n\nScore: ${result.score}/${exercise.points}\n\n${testOutput}`);

    } catch (error) {
      console.error('Error submitting exercise:', error);
      setOutput(`❌ Submission failed: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exercise) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Select an exercise to start coding
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Exercise Header */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">{exercise.title}</h2>
        <p className="text-gray-300 mb-4">{exercise.description}</p>

        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Difficulty: <span className={`px-2 py-1 rounded ${
            exercise.difficulty === 'easy' ? 'bg-green-600' :
            exercise.difficulty === 'medium' ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {exercise.difficulty}
          </span></span>
          <span>Points: {exercise.points}</span>
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center space-x-1 hover:text-white transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Hints ({exercise.hints.length})</span>
          </button>
        </div>

        {showHints && (
          <div className="mt-4 space-y-2">
            {exercise.hints.map((hint, index) => (
              <div key={index} className="bg-blue-900 border-l-4 border-blue-500 p-3 text-sm">
                <strong>Hint {index + 1}:</strong> {hint}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {showTestRunner ? (
        /* Test Runner View */
        <div className="flex-1">
          {exercise && (
            <TestRunner
              exerciseId={exercise.id}
              code={code}
              onTestComplete={(result) => {
                console.log('Test completed:', result);
              }}
            />
          )}
        </div>
      ) : (
        /* Code Editor View */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Code Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Code Editor</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleResetCode}
                  className="p-2 rounded hover:bg-gray-700 transition-colors"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveCode}
                  className="p-2 rounded hover:bg-gray-700 transition-colors"
                  title="Save code"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
                  title="Compile and run code"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunning ? 'Running...' : 'Run'}</span>
                </button>
                <button
                  onClick={handleSubmitExercise}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
                  title="Submit for grading"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                </button>

                <button
                  onClick={() => setShowTestRunner(!showTestRunner)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                    showTestRunner
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  title={showTestRunner ? 'Show Code Editor' : 'Show Test Runner'}
                >
                  <Target className="w-4 h-4" />
                  <span>{showTestRunner ? 'Code Editor' : 'Test Runner'}</span>
                </button>
              </div>
            </div>

            <div className="h-96 border border-gray-700 rounded">
              <Editor
                height="100%"
                language="masm"
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 8,
                  insertSpaces: false,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-2">
            <h3 className="font-medium">Output</h3>
            <div className="h-96 bg-gray-900 border border-gray-700 rounded p-4 overflow-auto">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {output || 'Click "Run" to execute your code...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Submission Results */}
      {submission && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center">
            {submission.passed ? (
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 mr-2" />
            )}
            Submission Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${submission.passed ? 'text-green-400' : 'text-red-400'}`}>
                {submission.score}/{exercise?.points}
              </div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {submission.results.filter(r => r.passed).length}/{submission.results.length}
              </div>
              <div className="text-sm text-gray-400">Tests Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(submission.results.reduce((sum, r) => sum + r.executionTime, 0) / submission.results.length)}ms
              </div>
              <div className="text-sm text-gray-400">Avg Time</div>
            </div>
          </div>

          {/* Detailed Test Results */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-300">Test Details:</h4>
            {submission.results.map((result, index) => (
              <div
                key={result.testCaseId}
                className={`p-3 rounded border ${
                  result.passed
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-red-900/20 border-red-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="font-medium">Test {index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-400">{result.executionTime}ms</span>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  <div>
                    <span className="text-gray-400">Expected:</span>
                    <span className="ml-2 font-mono">"{result.expectedOutput}"</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Got:</span>
                    <span className={`ml-2 font-mono ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                      "{result.actualOutput}"
                    </span>
                  </div>
                  {result.error && (
                    <div>
                      <span className="text-gray-400">Error:</span>
                      <span className="ml-2 text-red-400">{result.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
