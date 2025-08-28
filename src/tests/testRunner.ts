import {
  TestSuite,
  TestExecutionResult,
  DetailedGrade,
  Exercise,
  ExerciseSubmission,
  TestResult
} from '../shared/types';
import { testingService } from './testingService';
import { gradingService } from './gradingService';
import { lessonService } from '../lessons/lessonService';
import { assemblerService } from '../assembler/assemblerService';
import { v4 as uuidv4 } from 'uuid';

export interface TestRunnerOptions {
  includePerformanceAnalysis?: boolean;
  includeCodeQualityAnalysis?: boolean;
  includeDetailedFeedback?: boolean;
  strictMode?: boolean;
  bonusPointsEnabled?: boolean;
  timeout?: number;
  maxRetries?: number;
}

export interface TestRunnerResult {
  testExecution: TestExecutionResult;
  detailedGrade: DetailedGrade;
  submission: ExerciseSubmission;
  metadata: TestMetadata;
}

export interface TestMetadata {
  startTime: Date;
  endTime: Date;
  duration: number;
  environment: {
    nodeVersion: string;
    platform: string;
    architecture: string;
  };
  options: TestRunnerOptions;
}

export class TestRunner {
  private readonly defaultOptions: TestRunnerOptions = {
    includePerformanceAnalysis: true,
    includeCodeQualityAnalysis: true,
    includeDetailedFeedback: true,
    strictMode: false,
    bonusPointsEnabled: true,
    timeout: 5000,
    maxRetries: 2
  };

  /**
   * Run a complete test suite for an exercise
   */
  async runTestSuite(
    exercise: Exercise,
    code: string,
    userId: string,
    testSuite: TestSuite,
    options: Partial<TestRunnerOptions> = {}
  ): Promise<TestRunnerResult> {
    const config = { ...this.defaultOptions, ...options };
    const startTime = new Date();

    try {
      console.log(`🧪 Running test suite: ${testSuite.name}`);

      // Execute the test suite
      const testExecution = await testingService.executeTestSuite(code, testSuite, userId);

      // Generate detailed grade
      const detailedGrade = await gradingService.gradeSubmission(
        exercise,
        code,
        testExecution.results,
        config
      );

      // Create submission record
      const submission: ExerciseSubmission = {
        exerciseId: exercise.id,
        code,
        results: testExecution.results,
        passed: testExecution.summary.passedTests === testExecution.summary.totalTests,
        score: detailedGrade.score,
        timestamp: new Date()
      };

      // Save submission to database
      await lessonService.submitExercise(exercise.id, userId, code);

      const endTime = new Date();
      const metadata: TestMetadata = {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          architecture: process.arch
        },
        options: config
      };

      const result: TestRunnerResult = {
        testExecution,
        detailedGrade,
        submission,
        metadata
      };

      console.log(`✅ Test suite completed: ${detailedGrade.score}/${detailedGrade.maxScore} (${detailedGrade.percentage}%)`);
      return result;

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      throw error;
    }
  }

  /**
   * Run quick validation tests for real-time feedback
   */
  async runQuickValidation(
    code: string,
    testCases: { input: string; expectedOutput: string }[]
  ): Promise<QuickValidationResult> {
    const results: ValidationTestResult[] = [];
    let passedCount = 0;

    for (let i = 0; i < Math.min(testCases.length, 3); i++) { // Limit to 3 quick tests
      const testCase = testCases[i];

      try {
        const startTime = Date.now();
        const result = await assemblerService.compileAndRun(code, testCase.input, {
          timeout: 2000 // Shorter timeout for quick validation
        });
        const executionTime = Date.now() - startTime;

        const passed = result.success &&
                      (result.output || '').trim() === testCase.expectedOutput.trim();

        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output || '',
          passed,
          executionTime,
          error: result.error
        });

        if (passed) passedCount++;

      } catch (error: any) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          passed: false,
          executionTime: 0,
          error: error.message
        });
      }
    }

    return {
      results,
      summary: {
        totalTests: results.length,
        passedTests: passedCount,
        failedTests: results.length - passedCount,
        successRate: (passedCount / results.length) * 100
      }
    };
  }

  /**
   * Run performance benchmark tests
   */
  async runPerformanceBenchmark(
    code: string,
    testCases: { input: string; description: string }[],
    iterations: number = 5
  ): Promise<PerformanceBenchmarkResult> {
    const benchmarks: PerformanceBenchmark[] = [];

    for (const testCase of testCases) {
      const executionTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        try {
          const startTime = Date.now();
          const result = await assemblerService.compileAndRun(code, testCase.input, {
            timeout: 10000 // Longer timeout for benchmarks
          });
          const executionTime = Date.now() - startTime;

          if (result.success) {
            executionTimes.push(executionTime);
          }
        } catch (error) {
          console.warn(`Benchmark iteration ${i + 1} failed:`, error);
        }
      }

      if (executionTimes.length > 0) {
        const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
        const minTime = Math.min(...executionTimes);
        const maxTime = Math.max(...executionTimes);
        const variance = executionTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / executionTimes.length;
        const stdDev = Math.sqrt(variance);

        benchmarks.push({
          description: testCase.description,
          input: testCase.input,
          iterations: executionTimes.length,
          averageTime: avgTime,
          minTime,
          maxTime,
          standardDeviation: stdDev,
          variance
        });
      }
    }

    const overallAverage = benchmarks.reduce((sum, bench) => sum + bench.averageTime, 0) / benchmarks.length;

    return {
      benchmarks,
      summary: {
        totalBenchmarks: benchmarks.length,
        overallAverageTime: overallAverage,
        bestPerformance: benchmarks.reduce((best, current) =>
          current.averageTime < best.averageTime ? current : best
        ),
        worstPerformance: benchmarks.reduce((worst, current) =>
          current.averageTime > worst.averageTime ? current : worst
        )
      }
    };
  }

  /**
   * Run security analysis tests
   */
  async runSecurityAnalysis(code: string): Promise<SecurityAnalysisResult> {
    const issues: SecurityIssue[] = [];

    // Check for dangerous instructions
    const dangerousInstructions = [
      { pattern: /\b(int\s+80h?|int\s+2eh?)\b/i, severity: 'high', description: 'System call interrupts' },
      { pattern: /\b(hlt|cli|sti)\b/i, severity: 'high', description: 'Privileged instructions' },
      { pattern: /\b(mov\s+cr[0-4]|lgdt|lidt)\b/i, severity: 'high', description: 'Control register access' },
      { pattern: /\b(rdmsr|wrmsr)\b/i, severity: 'medium', description: 'Model-specific register access' },
      { pattern: /\b(syscall|sysenter)\b/i, severity: 'medium', description: 'System calls' }
    ];

    for (const check of dangerousInstructions) {
      if (check.pattern.test(code)) {
        issues.push({
          type: 'dangerous_instruction',
          severity: check.severity as 'high' | 'medium' | 'low',
          description: check.description,
          line: this.findLineWithPattern(code, check.pattern),
          recommendation: this.getSecurityRecommendation(check.description)
        });
      }
    }

    // Check for unbounded operations
    if (code.includes('jmp') && !code.includes('cmp')) {
      issues.push({
        type: 'unbounded_loop',
        severity: 'medium',
        description: 'Potential infinite loop without exit condition',
        line: this.findLineWithPattern(code, /jmp/i),
        recommendation: 'Add loop termination conditions using CMP and conditional jumps'
      });
    }

    // Check for buffer overflows
    const arrayOperations = code.match(/\[.*\+.*\]/g);
    if (arrayOperations) {
      issues.push({
        type: 'buffer_overflow_risk',
        severity: 'medium',
        description: 'Array access without bounds checking',
        line: arrayOperations[0],
        recommendation: 'Add bounds checking before array access'
      });
    }

    return {
      issues,
      summary: {
        totalIssues: issues.length,
        highSeverity: issues.filter(i => i.severity === 'high').length,
        mediumSeverity: issues.filter(i => i.severity === 'medium').length,
        lowSeverity: issues.filter(i => i.severity === 'low').length,
        securityScore: Math.max(0, 100 - (issues.length * 10))
      }
    };
  }

  /**
   * Run code quality analysis
   */
  async runCodeQualityAnalysis(code: string): Promise<CodeQualityAnalysisResult> {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const instructions = code.match(/\b(mov|add|sub|mul|div|push|pop|call|ret|jmp|je|jne|jg|jl|jge|jle|cmp|test|and|or|xor|not|shl|shr|sal|sar|rol|ror|inc|dec|lea|movzx|movsx|cbw|cwd|cdq|cqo)\b/gi) || [];

    // Analyze instruction diversity
    const instructionTypes = new Set(instructions.map(i => i.toLowerCase()));
    const diversityScore = (instructionTypes.size / 20) * 100; // Assuming 20 common instructions

    // Analyze comment quality
    const commentLines = lines.filter(line => line.trim().startsWith(';'));
    const documentationScore = (commentLines.length / lines.length) * 100;

    // Analyze code structure
    const hasProcedures = code.includes('proc') && code.includes('endp');
    const hasDataSection = code.includes('.data');
    const hasCodeSection = code.includes('.code');
    const structureScore = ((hasProcedures ? 25 : 0) + (hasDataSection ? 25 : 0) + (hasCodeSection ? 25 : 0) + 25);

    // Analyze register usage
    const registers = code.match(/\b(rax|rbx|rcx|rdx|rsi|rdi|rsp|rbp|r8|r9|r10|r11|r12|r13|r14|r15|eax|ebx|ecx|edx|esi|edi|esp|ebp|ax|bx|cx|dx|si|di|sp|bp|al|bl|cl|dl|ah|bh|ch|dh)\b/gi) || [];
    const uniqueRegisters = new Set(registers.map(r => r.toLowerCase()));
    const registerUsageScore = Math.min(100, (uniqueRegisters.size / 8) * 100);

    const overallScore = (diversityScore + documentationScore + structureScore + registerUsageScore) / 4;

    return {
      scores: {
        instructionDiversity: Math.round(diversityScore),
        documentation: Math.round(documentationScore),
        structure: Math.round(structureScore),
        registerUsage: Math.round(registerUsageScore),
        overall: Math.round(overallScore)
      },
      metrics: {
        linesOfCode: lines.length,
        instructionCount: instructions.length,
        uniqueInstructions: instructionTypes.size,
        commentLines: commentLines.length,
        uniqueRegisters: uniqueRegisters.size
      },
      suggestions: this.generateQualitySuggestions(overallScore, {
        diversityScore,
        documentationScore,
        structureScore,
        registerUsageScore
      })
    };
  }

  /**
   * Helper methods
   */
  private findLineWithPattern(code: string, pattern: RegExp): string {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return lines[i].trim();
      }
    }
    return '';
  }

  private getSecurityRecommendation(description: string): string {
    switch (description) {
      case 'System call interrupts':
        return 'Avoid direct system calls in learning exercises';
      case 'Privileged instructions':
        return 'These instructions require special privileges and should not be used';
      case 'Control register access':
        return 'Control registers should only be accessed by the operating system';
      case 'Model-specific register access':
        return 'MSR access is restricted and should not be used in user programs';
      case 'System calls':
        return 'Use standard library functions instead of direct system calls';
      default:
        return 'Review the instruction usage and consider safer alternatives';
    }
  }

  private generateQualitySuggestions(
    overallScore: number,
    scores: { diversityScore: number; documentationScore: number; structureScore: number; registerUsageScore: number }
  ): string[] {
    const suggestions: string[] = [];

    if (scores.documentationScore < 50) {
      suggestions.push('Add more comments to explain your code logic');
    }

    if (scores.diversityScore < 50) {
      suggestions.push('Try using a wider variety of assembly instructions');
    }

    if (scores.registerUsageScore < 50) {
      suggestions.push('Use more registers to optimize your code');
    }

    if (scores.structureScore < 75) {
      suggestions.push('Ensure your code has proper .data and .code sections');
    }

    if (overallScore > 80) {
      suggestions.push('Excellent code quality! Consider exploring advanced techniques.');
    }

    return suggestions;
  }
}

// Type definitions for test runner results
export interface QuickValidationResult {
  results: ValidationTestResult[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
  };
}

export interface ValidationTestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  error?: string;
}

export interface PerformanceBenchmarkResult {
  benchmarks: PerformanceBenchmark[];
  summary: {
    totalBenchmarks: number;
    overallAverageTime: number;
    bestPerformance: PerformanceBenchmark;
    worstPerformance: PerformanceBenchmark;
  };
}

export interface PerformanceBenchmark {
  description: string;
  input: string;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
  variance: number;
}

export interface SecurityAnalysisResult {
  issues: SecurityIssue[];
  summary: {
    totalIssues: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    securityScore: number;
  };
}

export interface SecurityIssue {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  line: string;
  recommendation: string;
}

export interface CodeQualityAnalysisResult {
  scores: {
    instructionDiversity: number;
    documentation: number;
    structure: number;
    registerUsage: number;
    overall: number;
  };
  metrics: {
    linesOfCode: number;
    instructionCount: number;
    uniqueInstructions: number;
    commentLines: number;
    uniqueRegisters: number;
  };
  suggestions: string[];
}

export const testRunner = new TestRunner();
