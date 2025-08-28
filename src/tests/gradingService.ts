import {
  Exercise,
  ExerciseSubmission,
  TestResult,
  AssemblyResult,
  CodeQualityAnalysis
} from '../shared/types';
import { assemblerService } from '../assembler/assemblerService';
import { v4 as uuidv4 } from 'uuid';

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

export interface GradingOptions {
  includePerformanceAnalysis: boolean;
  includeCodeQualityAnalysis: boolean;
  includeDetailedFeedback: boolean;
  strictMode: boolean;
  bonusPointsEnabled: boolean;
}

export class GradingService {
  private readonly defaultOptions: GradingOptions = {
    includePerformanceAnalysis: true,
    includeCodeQualityAnalysis: true,
    includeDetailedFeedback: true,
    strictMode: false,
    bonusPointsEnabled: true
  };

  /**
   * Grade a complete exercise submission
   */
  async gradeSubmission(
    exercise: Exercise,
    code: string,
    results: TestResult[],
    options: Partial<GradingOptions> = {}
  ): Promise<DetailedGrade> {
    const config = { ...this.defaultOptions, ...options };

    // Analyze code quality
    const codeQuality = await this.analyzeCodeQuality(code);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(results, code);

    // Grade each component
    const functionalityGrade = this.gradeFunctionality(results, exercise);
    const efficiencyGrade = this.gradeEfficiency(performanceMetrics, code);
    const styleGrade = this.gradeStyle(code, codeQuality);
    const robustnessGrade = this.gradeRobustness(results, code);

    // Calculate total score
    const totalScore = functionalityGrade.score + efficiencyGrade.score +
                       styleGrade.score + robustnessGrade.score;
    const maxScore = functionalityGrade.maxScore + efficiencyGrade.maxScore +
                     styleGrade.maxScore + robustnessGrade.maxScore;

    const percentage = (totalScore / maxScore) * 100;
    const letterGrade = this.calculateLetterGrade(percentage);

    // Generate feedback and recommendations
    const feedback = this.generateFeedback(results, codeQuality, performanceMetrics, percentage);
    const recommendations = this.generateRecommendations(results, code, codeQuality, performanceMetrics);

    return {
      score: Math.round(totalScore),
      maxScore,
      percentage: Math.round(percentage),
      letterGrade,
      breakdown: {
        functionality: functionalityGrade,
        efficiency: efficiencyGrade,
        style: styleGrade,
        robustness: robustnessGrade
      },
      feedback,
      recommendations
    };
  }

  /**
   * Grade functionality (core requirements)
   */
  private gradeFunctionality(results: TestResult[], exercise: Exercise): GradeBreakdown['functionality'] {
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const publicTests = results.filter(r => !r.testCaseId?.includes('hidden')).length;
    const passedPublicTests = results.filter(r => r.passed && !r.testCaseId?.includes('hidden')).length;

    let score = 0;
    let maxScore = 70;

    // Base score from public tests
    if (publicTests > 0) {
      score += (passedPublicTests / publicTests) * 50;
    }

    // Bonus for passing hidden tests
    const hiddenTests = totalTests - publicTests;
    const passedHiddenTests = passedTests - passedPublicTests;
    if (hiddenTests > 0) {
      score += (passedHiddenTests / hiddenTests) * 20;
    }

    // Compilation bonus
    const allTestsCompiled = results.every(r => !r.error || r.error.includes('Wrong Answer'));
    if (allTestsCompiled) {
      score += 10;
    }

    const percentage = (score / maxScore) * 100;
    const description = this.getFunctionalityDescription(percentage);

    return {
      score: Math.round(score),
      maxScore,
      percentage: Math.round(percentage),
      description
    };
  }

  /**
   * Grade code efficiency
   */
  private gradeEfficiency(metrics: PerformanceMetrics, code: string): GradeBreakdown['efficiency'] {
    let score = 0;
    const maxScore = 20;

    // Execution time efficiency
    if (metrics.executionTime < 100) {
      score += 8;
    } else if (metrics.executionTime < 500) {
      score += 6;
    } else if (metrics.executionTime < 1000) {
      score += 4;
    } else {
      score += 2;
    }

    // Code size efficiency
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 10) {
      score += 6;
    } else if (lines.length < 20) {
      score += 4;
    } else if (lines.length < 30) {
      score += 2;
    }

    // Algorithm efficiency (based on instruction count)
    if (metrics.instructionsExecuted < 50) {
      score += 6;
    } else if (metrics.instructionsExecuted < 100) {
      score += 4;
    } else if (metrics.instructionsExecuted < 200) {
      score += 2;
    }

    const percentage = (score / maxScore) * 100;
    const description = this.getEfficiencyDescription(percentage);

    return {
      score: Math.round(score),
      maxScore,
      percentage: Math.round(percentage),
      description
    };
  }

  /**
   * Grade code style and readability
   */
  private gradeStyle(code: string, quality: CodeQualityAnalysis): GradeBreakdown['style'] {
    let score = 0;
    const maxScore = 10;

    // Comments and documentation
    const commentRatio = quality.readability / 100;
    score += commentRatio * 4;

    // Code formatting
    const hasConsistentFormatting = this.checkFormatting(code);
    if (hasConsistentFormatting) {
      score += 3;
    }

    // Variable naming (for assembly, this is about register usage)
    const usesVariedRegisters = Object.keys(quality.registerUsage).length > 3;
    if (usesVariedRegisters) {
      score += 3;
    }

    const percentage = (score / maxScore) * 100;
    const description = this.getStyleDescription(percentage);

    return {
      score: Math.round(score),
      maxScore,
      percentage: Math.round(percentage),
      description
    };
  }

  /**
   * Grade code robustness
   */
  private gradeRobustness(results: TestResult[], code: string): GradeBreakdown['robustness'] {
    let score = 0;
    const maxScore = 10;

    // Error handling
    const hasErrorHandling = code.includes('cmp') && (code.includes('je') || code.includes('jne') || code.includes('jg') || code.includes('jl'));
    if (hasErrorHandling) {
      score += 3;
    }

    // Edge case handling
    const passedEdgeCases = results.filter(r => this.isEdgeCase(r)).filter(r => r.passed).length;
    const totalEdgeCases = results.filter(r => this.isEdgeCase(r)).length;
    if (totalEdgeCases > 0) {
      score += (passedEdgeCases / totalEdgeCases) * 4;
    }

    // Input validation
    const hasInputValidation = code.includes('cmp') && code.includes('jl');
    if (hasInputValidation) {
      score += 3;
    }

    const percentage = (score / maxScore) * 100;
    const description = this.getRobustnessDescription(percentage);

    return {
      score: Math.round(score),
      maxScore,
      percentage: Math.round(percentage),
      description
    };
  }

  /**
   * Analyze code quality
   */
  private async analyzeCodeQuality(code: string): Promise<CodeQualityAnalysis> {
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

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(results: TestResult[], code: string): PerformanceMetrics {
    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const instructions = code.match(/\b(mov|add|sub|mul|div|push|pop|call|ret|jmp|je|jne|jg|jl|jge|jle|cmp|test|and|or|xor|not|shl|shr|sal|sar|rol|ror|inc|dec|lea|movzx|movsx|cbw|cwd|cdq|cqo)\b/gi) || [];

    return {
      executionTime: avgExecutionTime,
      instructionsExecuted: instructions.length,
      memoryUsage: 0, // Would need more sophisticated tracking
      codeSize: lines.length,
      efficiency: Math.max(0, 100 - (lines.length - instructions.length) * 2)
    };
  }

  /**
   * Generate detailed feedback
   */
  private generateFeedback(
    results: TestResult[],
    quality: CodeQualityAnalysis,
    performance: PerformanceMetrics,
    percentage: number
  ): DetailedFeedback {
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;

    let overall: DetailedFeedback['overall'];
    if (percentage >= 90) {
      overall = { message: 'Outstanding work! You\'ve mastered this concept.', sentiment: 'excellent' };
    } else if (percentage >= 80) {
      overall = { message: 'Excellent work with room for minor improvements.', sentiment: 'good' };
    } else if (percentage >= 70) {
      overall = { message: 'Good work! Focus on the areas for improvement.', sentiment: 'fair' };
    } else {
      overall = { message: 'This needs more work. Review the feedback and try again.', sentiment: 'needs_work' };
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Analyze strengths
    if (passedTests === totalTests) {
      strengths.push('All tests passed successfully!');
    }
    if (performance.executionTime < 100) {
      strengths.push('Excellent execution performance');
    }
    if (quality.readability > 70) {
      strengths.push('Well-documented code with good comments');
    }
    if (Object.keys(quality.registerUsage).length > 3) {
      strengths.push('Good use of different registers');
    }

    // Analyze weaknesses
    if (passedTests < totalTests) {
      weaknesses.push(`${totalTests - passedTests} test(s) failed`);
    }
    if (performance.executionTime > 1000) {
      weaknesses.push('Code execution is slow');
    }
    if (quality.readability < 30) {
      weaknesses.push('Code lacks documentation and comments');
    }
    if (Object.keys(quality.registerUsage).length < 2) {
      weaknesses.push('Limited register usage - consider using more registers for efficiency');
    }

    return {
      overall,
      strengths,
      weaknesses,
      codeQuality: quality,
      performanceMetrics: performance
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    results: TestResult[],
    code: string,
    quality: CodeQualityAnalysis,
    performance: PerformanceMetrics
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Performance recommendations
    if (performance.executionTime > 1000) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        title: 'Optimize Execution Time',
        description: 'Your code is running slowly. Look for loops or redundant operations that can be optimized.',
        codeExample: 'Consider using more efficient algorithms or reducing unnecessary operations.'
      });
    }

    // Code quality recommendations
    if (quality.readability < 50) {
      recommendations.push({
        type: 'best_practice',
        priority: 'medium',
        title: 'Add Documentation',
        description: 'Your code would benefit from more comments explaining the logic.',
        codeExample: '; Add comments explaining what each section does\n; mov rax, [input]  ; Load input value into RAX'
      });
    }

    // Functionality recommendations
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        title: 'Debug Failed Tests',
        description: `${failedTests.length} test(s) are failing. Check your logic and test cases.`,
        codeExample: 'Use the debugger to step through your code and identify where the logic diverges from expected behavior.'
      });
    }

    // Learning recommendations
    if (quality.instructionCount < 5) {
      recommendations.push({
        type: 'learning',
        priority: 'medium',
        title: 'Explore More Instructions',
        description: 'Your solution is very concise! Consider exploring additional assembly instructions.',
        codeExample: 'Try using different instructions like LEA, SHL/SHR, or conditional moves (CMOVcc) for more sophisticated solutions.'
      });
    }

    return recommendations;
  }

  /**
   * Helper methods for grading descriptions
   */
  private getFunctionalityDescription(percentage: number): string {
    if (percentage >= 90) return 'Excellent functionality - all requirements met';
    if (percentage >= 80) return 'Good functionality with minor issues';
    if (percentage >= 70) return 'Basic functionality working';
    return 'Functionality needs improvement';
  }

  private getEfficiencyDescription(percentage: number): string {
    if (percentage >= 90) return 'Highly efficient implementation';
    if (percentage >= 70) return 'Reasonably efficient';
    if (percentage >= 50) return 'Moderate efficiency';
    return 'Efficiency improvements needed';
  }

  private getStyleDescription(percentage: number): string {
    if (percentage >= 80) return 'Excellent code style and readability';
    if (percentage >= 60) return 'Good code style';
    if (percentage >= 40) return 'Adequate code style';
    return 'Code style needs improvement';
  }

  private getRobustnessDescription(percentage: number): string {
    if (percentage >= 80) return 'Very robust solution';
    if (percentage >= 60) return 'Moderately robust';
    if (percentage >= 40) return 'Basic robustness';
    return 'Needs more robust error handling';
  }

  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  private checkFormatting(code: string): boolean {
    const lines = code.split('\n');
    // Check for consistent indentation and spacing
    const hasConsistentIndentation = lines.every(line => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return true;
      if (trimmed.startsWith(';')) return true;
      if (trimmed.startsWith('.data') || trimmed.startsWith('.code')) return true;
      if (trimmed.includes('proc') || trimmed.includes('endp')) return true;

      // Check if instructions are properly indented
      const leadingSpaces = line.length - line.trimStart().length;
      return leadingSpaces === 0 || leadingSpaces >= 4;
    });

    return hasConsistentIndentation;
  }

  private isEdgeCase(result: TestResult): boolean {
    // Consider edge cases as tests with extreme values or boundary conditions
    const input = result.testCaseId || '';
    const output = result.expectedOutput;

    return input === '0' || input === '1' || output === '0' ||
           parseInt(input) > 1000 || parseInt(output) > 1000;
  }
}

export const gradingService = new GradingService();
