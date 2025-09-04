import { TestCase, TestResult, AssemblyResult } from '../shared/types';
import { assemblerService } from '../assembler/assemblerService';
import { v4 as uuidv4 } from 'uuid';

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
  performanceMetrics: {
    executionTime: number;
    instructionsExecuted: number;
    memoryUsage: number;
    codeSize: number;
    efficiency: number;
  };
}

export interface CodeQualityAnalysis {
  linesOfCode: number;
  instructionCount: number;
  registerUsage: Record<string, number>;
  efficiency: number;
  readability: number;
  maintainability: number;
}

export class TestingService {
  /**
   * Execute a complete test suite
   */
  async executeTestSuite(
    code: string,
    testSuite: TestSuite,
    userId: string
  ): Promise<TestExecutionResult> {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Execute all test cases
    for (const testCase of testSuite.testCases) {
      try {
        const result = await this.executeTestCase(code, testCase, testSuite.configuration);
        results.push(result);
      } catch (error: any) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          actualOutput: '',
          expectedOutput: testCase.expectedOutput,
          executionTime: 0,
          error: error.message
        });
      }
    }

    const totalTime = Date.now() - startTime;

    // Generate summary and grade
    const summary = this.generateSummary(results, totalTime);
    const grade = this.calculateGrade(results, testSuite.configuration.gradingCriteria, code);
    const feedback = this.generateFeedback(results, grade, code, testSuite);

    return {
      testSuiteId: testSuite.id,
      results,
      summary,
      grade,
      feedback
    };
  }

  /**
   * Execute a single test case
   */
  private async executeTestCase(
    code: string,
    testCase: TestCase,
    config: TestConfiguration
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const result = await assemblerService.compileAndRun(code, testCase.input, {
        timeout: config.timeout,
        memoryLimit: config.memoryLimit,
        allowSystemCalls: config.allowSystemCalls
      });

      const executionTime = Date.now() - startTime;

      // Validate result based on test type
      const passed = this.validateTestResult(result, testCase, config.testType);

      return {
        testCaseId: testCase.id,
        passed,
        actualOutput: result.output || '',
        expectedOutput: testCase.expectedOutput,
        executionTime,
        error: result.error || undefined
      };
    } catch (error: any) {
      return {
        testCaseId: testCase.id,
        passed: false,
        actualOutput: '',
        expectedOutput: testCase.expectedOutput,
        executionTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Validate test result based on test type
   */
  private validateTestResult(
    result: AssemblyResult,
    testCase: TestCase,
    testType: TestType
  ): boolean {
    if (!result.success) return false;

    const actualOutput = (result.output || '').trim();
    const expectedOutput = testCase.expectedOutput.trim();

    switch (testType) {
      case 'output_validation':
        return this.validateOutput(actualOutput, expectedOutput);

      case 'performance_test':
        return this.validatePerformance(result.executionTime);

      case 'memory_test':
        return result.success; // Memory tests would need more sophisticated analysis

      case 'security_test':
        return this.validateSecurity(result);

      case 'unit_test':
        return this.validateUnitTest(actualOutput, expectedOutput);

      case 'code_quality':
        return this.validateCodeQuality(result);

      default:
        return actualOutput === expectedOutput;
    }
  }

  /**
   * Validate output with flexible matching
   */
  private validateOutput(actual: string, expected: string): boolean {
    // Exact match
    if (actual === expected) return true;

    // Case-insensitive match
    if (actual.toLowerCase() === expected.toLowerCase()) return true;

    // Numeric tolerance for floating point
    const actualNum = parseFloat(actual);
    const expectedNum = parseFloat(expected);
    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      return Math.abs(actualNum - expectedNum) < 0.001;
    }

    // Trimmed match
    if (actual.trim() === expected.trim()) return true;

    return false;
  }

  /**
   * Validate performance constraints
   */
  private validatePerformance(executionTime: number): boolean {
    // Performance tests would have specific time limits
    return executionTime < 1000; // Less than 1 second
  }

  /**
   * Validate security aspects
   */
  private validateSecurity(result: AssemblyResult): boolean {
    // Security tests would check for safe execution
    return result.success && !result.error;
  }

  /**
   * Validate unit test results
   */
  private validateUnitTest(actual: string, expected: string): boolean {
    // Unit tests might have more complex validation logic
    return this.validateOutput(actual, expected);
  }

  /**
   * Validate code quality aspects
   */
  private validateCodeQuality(result: AssemblyResult): boolean {
    // Code quality tests focus on successful compilation and execution
    return result.success;
  }

  /**
   * Generate test summary
   */
  private generateSummary(results: TestResult[], totalTime: number): TestSummary {
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    const averageExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;

    return {
      totalTests: results.length,
      passedTests,
      failedTests,
      averageExecutionTime,
      totalExecutionTime: totalTime,
      memoryUsage: 0 // Would need to be tracked separately
    };
  }

  /**
   * Calculate comprehensive grade
   */
  private calculateGrade(
    results: TestResult[],
    criteria: GradingCriteria,
    code: string
  ): Grade {
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const baseScore = (passedTests / totalTests) * 100;

    // Calculate component scores
    const outputScore = (passedTests / totalTests) * criteria.outputWeight;
    const performanceScore = this.calculatePerformanceScore(results) * criteria.performanceWeight;
    const qualityScore = this.calculateQualityScore(code) * criteria.codeQualityWeight;
    const securityScore = this.calculateSecurityScore(results) * criteria.securityWeight;

    // Calculate bonus points
    const bonusScore = this.calculateBonusScore(results, code, criteria.bonusPoints);

    const totalScore = outputScore + performanceScore + qualityScore + securityScore + bonusScore;
    const maxScore = criteria.outputWeight + criteria.performanceWeight +
                     criteria.codeQualityWeight + criteria.securityWeight + 20; // Max bonus

    const percentage = (totalScore / maxScore) * 100;
    const letterGrade = this.getLetterGrade(percentage);

    return {
      score: Math.round(totalScore),
      maxScore: Math.round(maxScore),
      percentage: Math.round(percentage),
      letterGrade,
      breakdown: {
        output: Math.round(outputScore),
        performance: Math.round(performanceScore),
        quality: Math.round(qualityScore),
        security: Math.round(securityScore),
        bonus: Math.round(bonusScore)
      }
    };
  }

  /**
   * Calculate performance score based on execution times
   */
  private calculatePerformanceScore(results: TestResult[]): number {
    if (results.length === 0) return 0;

    const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;

    // Performance score based on how fast the code runs
    if (avgTime < 50) return 20; // Excellent performance
    if (avgTime < 100) return 15; // Good performance
    if (avgTime < 200) return 10; // Fair performance
    if (avgTime < 500) return 5;  // Poor performance
    return 0; // Very poor performance
  }

  /**
   * Calculate code quality score
   */
  private calculateQualityScore(code: string): number {
    let score = 10; // Base score

    // Analyze code quality factors
    const lines = code.split('\n').filter(line => line.trim().length > 0);

    // Code length efficiency
    if (lines.length < 10) score += 5; // Concise code
    else if (lines.length > 50) score -= 5; // Overly verbose

    // Comment quality
    const commentLines = lines.filter(line => line.trim().startsWith(';'));
    if (commentLines.length > 0) {
      score += Math.min(commentLines.length * 2, 10); // Up to 10 points for comments
    }

    // Instruction diversity (avoid repetitive code)
    const instructions = code.match(/\b(mov|add|sub|mul|div|push|pop|call|ret|jmp)\b/gi) || [];
    const uniqueInstructions = new Set(instructions.map(i => i.toLowerCase()));
    score += Math.min(uniqueInstructions.size, 10);

    return Math.max(0, Math.min(20, score));
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(results: TestResult[]): number {
    // Security score based on safe execution
    const safeExecutions = results.filter(r => r.passed && !r.error).length;
    return (safeExecutions / results.length) * 20;
  }

  /**
   * Calculate bonus points
   */
  private calculateBonusScore(
    results: TestResult[],
    code: string,
    bonusConfig: GradingCriteria['bonusPoints']
  ): number {
    let bonus = 0;

    // Early completion bonus
    const fastResults = results.filter(r => r.executionTime < 100);
    if (fastResults.length === results.length) {
      bonus += bonusConfig.earlyCompletion;
    }

    // Efficient code bonus
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 15 && results.every(r => r.passed)) {
      bonus += bonusConfig.efficientCode;
    }

    // Clean code bonus
    const hasComments = code.includes(';');
    const noExtraSpaces = !code.includes('  '); // No double spaces
    if (hasComments && noExtraSpaces) {
      bonus += bonusConfig.cleanCode;
    }

    return bonus;
  }

  /**
   * Convert percentage to letter grade
   */
  private getLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate comprehensive feedback
   */
  private generateFeedback(
    results: TestResult[],
    grade: Grade,
    code: string,
    testSuite: TestSuite
  ): Feedback {
    const feedback: Feedback = {
      overall: {
        message: this.generateOverallFeedback(grade),
        sentiment: this.calculateSentiment(grade.percentage)
      },
      strengths: this.generateStrengths(results, code),
      weaknesses: this.generateWeaknesses(results, code),
      codeQuality: this.analyzeCodeQuality(code),
      performanceMetrics: this.generatePerformanceMetrics(results)
    };

    return feedback;
  }

  /**
   * Generate overall feedback message
   */
  private calculateSentiment(percentage: number): 'excellent' | 'good' | 'fair' | 'needs_work' {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'fair';
    return 'needs_work';
  }

  private generateOverallFeedback(grade: Grade): string {
    if (grade.percentage >= 90) {
      return "Excellent work! You've mastered this concept with outstanding performance.";
    } else if (grade.percentage >= 80) {
      return "Great job! Your solution works well with room for minor optimizations.";
    } else if (grade.percentage >= 70) {
      return "Good effort! Your code works but could benefit from improvements.";
    } else if (grade.percentage >= 60) {
      return "Fair attempt. Review the concepts and try again.";
    } else {
      return "This needs more work. Study the material and practice the concepts.";
    }
  }

  /**
   * Generate list of strengths
   */
  private generateWeaknesses(results: TestResult[], code: string): string[] {
    const weaknesses: string[] = [];

    const failedTests = results.filter(r => !r.passed).length;
    if (failedTests > 0) {
      weaknesses.push(`${failedTests} test(s) failed`);
    }

    const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    if (avgTime > 1000) {
      weaknesses.push('Execution time could be optimized');
    }

    return weaknesses;
  }

  private generatePerformanceMetrics(results: TestResult[]) {
    const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    return {
      executionTime: avgTime,
      instructionsExecuted: 0, // Would need analysis of actual assembly instructions
      memoryUsage: 0, // Would need memory profiling
      codeSize: 0, // Would need code size analysis
      efficiency: totalTime > 0 ? 1000 / totalTime : 0
    };
  }

  private generateStrengths(results: TestResult[], code: string): string[] {
    const strengths: string[] = [];

    const passedTests = results.filter(r => r.passed).length;
    if (passedTests === results.length) {
      strengths.push("All tests passed successfully!");
    }

    const fastResults = results.filter(r => r.executionTime < 100);
    if (fastResults.length > results.length * 0.8) {
      strengths.push("Excellent performance - code runs very efficiently");
    }

    const hasComments = code.includes(';');
    if (hasComments) {
      strengths.push("Good documentation with comments");
    }

    return strengths;
  }

  /**
   * Generate list of improvements needed
   */
  private generateImprovements(results: TestResult[], code: string): string[] {
    const improvements: string[] = [];

    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      improvements.push(`${failedTests.length} test(s) failed - check your logic`);
    }

    const slowResults = results.filter(r => r.executionTime > 500);
    if (slowResults.length > 0) {
      improvements.push("Code performance could be improved");
    }

    const lines = code.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 30) {
      improvements.push("Consider optimizing code length");
    }

    return improvements;
  }

  /**
   * Generate specific suggestions
   */
  private generateSuggestions(results: TestResult[], testSuite: TestSuite): string[] {
    const suggestions: string[] = [];

    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      suggestions.push("Review the failed test cases and debug your code step by step");
      suggestions.push("Use the debugger to trace through your program's execution");
    }

    if (results.some(r => r.executionTime > 1000)) {
      suggestions.push("Optimize your algorithm to reduce execution time");
      suggestions.push("Look for redundant operations or loops that can be optimized");
    }

    suggestions.push("Consider adding more comments to explain complex logic");
    suggestions.push("Test your code with different input values");

    return suggestions;
  }

  /**
   * Analyze code quality metrics
   */
  private analyzeCodeQuality(code: string): CodeQualityAnalysis {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const instructions = code.match(/\b(mov|add|sub|mul|div|push|pop|call|ret|jmp|je|jne|jg|jl|jge|jle|cmp|test|and|or|xor|not|shl|shr|sal|sar|rol|ror|inc|dec|lea|movzx|movsx|cbw|cwd|cdq|cqo)\b/gi) || [];

    // Register usage analysis
    const registerUsage: Record<string, number> = {};
    const registers = code.match(/\b(rax|rbx|rcx|rdx|rsi|rdi|rsp|rbp|r8|r9|r10|r11|r12|r13|r14|r15|eax|ebx|ecx|edx|esi|edi|esp|ebp|ax|bx|cx|dx|si|di|sp|bp|al|bl|cl|dl|ah|bh|ch|dh)\b/gi) || [];

    registers.forEach(reg => {
      registerUsage[reg.toLowerCase()] = (registerUsage[reg.toLowerCase()] || 0) + 1;
    });

    // Calculate quality metrics
    const efficiency = Math.max(0, 100 - (lines.length - instructions.length) * 2);
    const readability = Math.min(100, (lines.filter(line => line.includes(';')).length / lines.length) * 100);
    const maintainability = (efficiency + readability) / 2;

    return {
      linesOfCode: lines.length,
      instructionCount: instructions.length,
      registerUsage,
      efficiency: Math.round(efficiency),
      readability: Math.round(readability),
      maintainability: Math.round(maintainability)
    };
  }
}

export const testingService = new TestingService();
