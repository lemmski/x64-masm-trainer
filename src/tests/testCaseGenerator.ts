import { TestCase, TestSuite, TestConfiguration, TestType, GradingCriteria } from '../shared/types';
import { v4 as uuidv4 } from 'uuid';

export interface TestCaseTemplate {
  name: string;
  description: string;
  inputGenerator: () => string;
  expectedOutputGenerator: (input: string) => string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export class TestCaseGenerator {
  /**
   * Generate test cases for arithmetic operations
   */
  static generateArithmeticTestCases(): TestSuite {
    const templates: TestCaseTemplate[] = [
      {
        name: 'Addition Test',
        description: 'Test basic addition operations',
        inputGenerator: () => {
          const a = Math.floor(Math.random() * 100);
          const b = Math.floor(Math.random() * 100);
          return `${a} ${b}`;
        },
        expectedOutputGenerator: (input) => {
          const [a, b] = input.split(' ').map(Number);
          return (a + b).toString();
        },
        difficulty: 'easy',
        tags: ['arithmetic', 'addition']
      },
      {
        name: 'Subtraction Test',
        description: 'Test subtraction operations',
        inputGenerator: () => {
          const a = Math.floor(Math.random() * 100) + 50; // Ensure positive result
          const b = Math.floor(Math.random() * 50);
          return `${a} ${b}`;
        },
        expectedOutputGenerator: (input) => {
          const [a, b] = input.split(' ').map(Number);
          return (a - b).toString();
        },
        difficulty: 'easy',
        tags: ['arithmetic', 'subtraction']
      },
      {
        name: 'Multiplication Test',
        description: 'Test multiplication operations',
        inputGenerator: () => {
          const a = Math.floor(Math.random() * 20) + 1;
          const b = Math.floor(Math.random() * 20) + 1;
          return `${a} ${b}`;
        },
        expectedOutputGenerator: (input) => {
          const [a, b] = input.split(' ').map(Number);
          return (a * b).toString();
        },
        difficulty: 'medium',
        tags: ['arithmetic', 'multiplication']
      },
      {
        name: 'Complex Expression',
        description: 'Test complex arithmetic expressions',
        inputGenerator: () => {
          const a = Math.floor(Math.random() * 10) + 1;
          const b = Math.floor(Math.random() * 10) + 1;
          const c = Math.floor(Math.random() * 5) + 1;
          return `${a} ${b} ${c}`;
        },
        expectedOutputGenerator: (input) => {
          const [a, b, c] = input.split(' ').map(Number);
          return ((a + b) * c).toString(); // (a + b) * c
        },
        difficulty: 'hard',
        tags: ['arithmetic', 'complex']
      }
    ];

    return this.generateTestSuiteFromTemplates(
      'Arithmetic Operations Test Suite',
      'Comprehensive tests for arithmetic operations',
      templates,
      10 // Generate 10 test cases per template
    );
  }

  /**
   * Generate test cases for register operations
   */
  static generateRegisterTestCases(): TestSuite {
    const templates: TestCaseTemplate[] = [
      {
        name: 'Register Movement',
        description: 'Test moving values between registers',
        inputGenerator: () => {
          const value = Math.floor(Math.random() * 1000);
          return value.toString();
        },
        expectedOutputGenerator: (input) => input, // Should output the same value
        difficulty: 'easy',
        tags: ['registers', 'mov']
      },
      {
        name: 'Register Exchange',
        description: 'Test exchanging values between registers',
        inputGenerator: () => {
          const a = Math.floor(Math.random() * 100);
          const b = Math.floor(Math.random() * 100);
          return `${a} ${b}`;
        },
        expectedOutputGenerator: (input) => {
          const [a, b] = input.split(' ');
          return `${b} ${a}`; // Should swap the values
        },
        difficulty: 'medium',
        tags: ['registers', 'swap']
      }
    ];

    return this.generateTestSuiteFromTemplates(
      'Register Operations Test Suite',
      'Tests for register manipulation operations',
      templates,
      8
    );
  }

  /**
   * Generate test cases for string operations
   */
  static generateStringTestCases(): TestSuite {
    const templates: TestCaseTemplate[] = [
      {
        name: 'String Length',
        description: 'Calculate length of input string',
        inputGenerator: () => {
          const words = ['hello', 'world', 'assembly', 'programming', 'computer'];
          const word = words[Math.floor(Math.random() * words.length)];
          return word;
        },
        expectedOutputGenerator: (input) => input.length.toString(),
        difficulty: 'medium',
        tags: ['strings', 'length']
      },
      {
        name: 'Character Count',
        description: 'Count occurrences of a specific character',
        inputGenerator: () => {
          const words = ['programming', 'assembly', 'language', 'computer'];
          const word = words[Math.floor(Math.random() * words.length)];
          const char = word[Math.floor(Math.random() * word.length)];
          return `${word} ${char}`;
        },
        expectedOutputGenerator: (input) => {
          const [word, char] = input.split(' ');
          return word.split(char).length - 1;
        },
        difficulty: 'hard',
        tags: ['strings', 'character', 'count']
      }
    ];

    return this.generateTestSuiteFromTemplates(
      'String Operations Test Suite',
      'Tests for string manipulation operations',
      templates,
      6
    );
  }

  /**
   * Generate test cases for control flow
   */
  static generateControlFlowTestCases(): TestSuite {
    const templates: TestCaseTemplate[] = [
      {
        name: 'Conditional Output',
        description: 'Output different values based on condition',
        inputGenerator: () => {
          const num = Math.floor(Math.random() * 20) + 1;
          return num.toString();
        },
        expectedOutputGenerator: (input) => {
          const num = parseInt(input);
          return num % 2 === 0 ? 'even' : 'odd';
        },
        difficulty: 'medium',
        tags: ['control-flow', 'conditionals']
      },
      {
        name: 'Loop Sum',
        description: 'Calculate sum using loop',
        inputGenerator: () => {
          const n = Math.floor(Math.random() * 10) + 1;
          return n.toString();
        },
        expectedOutputGenerator: (input) => {
          const n = parseInt(input);
          return (n * (n + 1) / 2).toString(); // Sum of first n numbers
        },
        difficulty: 'hard',
        tags: ['control-flow', 'loops', 'sum']
      }
    ];

    return this.generateTestSuiteFromTemplates(
      'Control Flow Test Suite',
      'Tests for conditional statements and loops',
      templates,
      8
    );
  }

  /**
   * Generate test cases for memory operations
   */
  static generateMemoryTestCases(): TestSuite {
    const templates: TestCaseTemplate[] = [
      {
        name: 'Array Access',
        description: 'Access and manipulate array elements',
        inputGenerator: () => {
          const array = Array.from({length: 5}, () => Math.floor(Math.random() * 50));
          const index = Math.floor(Math.random() * 5);
          return `${array.join(' ')} ${index}`;
        },
        expectedOutputGenerator: (input) => {
          const parts = input.split(' ');
          const array = parts.slice(0, 5).map(Number);
          const index = parseInt(parts[5]);
          return array[index].toString();
        },
        difficulty: 'hard',
        tags: ['memory', 'arrays', 'indexing']
      },
      {
        name: 'Memory Copy',
        description: 'Copy data between memory locations',
        inputGenerator: () => {
          const values = Array.from({length: 3}, () => Math.floor(Math.random() * 100));
          return values.join(' ');
        },
        expectedOutputGenerator: (input) => input, // Should copy the values
        difficulty: 'medium',
        tags: ['memory', 'copy']
      }
    ];

    return this.generateTestSuiteFromTemplates(
      'Memory Operations Test Suite',
      'Tests for memory access and manipulation',
      templates,
      6
    );
  }

  /**
   * Generate performance test cases
   */
  static generatePerformanceTestCases(): TestSuite {
    const templates: TestCaseTemplate[] = [
      {
        name: 'Fibonacci Performance',
        description: 'Calculate fibonacci numbers efficiently',
        inputGenerator: () => {
          const n = Math.floor(Math.random() * 10) + 10; // 10-20
          return n.toString();
        },
        expectedOutputGenerator: (input) => {
          const n = parseInt(input);
          const fib = (num: number): number => {
            if (num <= 1) return num;
            return fib(num - 1) + fib(num - 2);
          };
          return fib(n).toString();
        },
        difficulty: 'hard',
        tags: ['performance', 'fibonacci']
      },
      {
        name: 'Factorial Performance',
        description: 'Calculate factorial efficiently',
        inputGenerator: () => {
          const n = Math.floor(Math.random() * 8) + 5; // 5-12
          return n.toString();
        },
        expectedOutputGenerator: (input) => {
          const n = parseInt(input);
          let result = 1;
          for (let i = 2; i <= n; i++) {
            result *= i;
          }
          return result.toString();
        },
        difficulty: 'medium',
        tags: ['performance', 'factorial']
      }
    ];

    return this.generateTestSuiteFromTemplates(
      'Performance Test Suite',
      'Tests focused on code execution performance',
      templates,
      5,
      'performance_test'
    );
  }

  /**
   * Generate test cases for function/procedure calls
   */
  static generateFunctionTestCases(): TestSuite {
    const templates: TestCaseTemplate[] = [
      {
        name: 'Function Call',
        description: 'Test function call and return',
        inputGenerator: () => {
          const a = Math.floor(Math.random() * 20) + 1;
          const b = Math.floor(Math.random() * 20) + 1;
          return `${a} ${b}`;
        },
        expectedOutputGenerator: (input) => {
          const [a, b] = input.split(' ').map(Number);
          return Math.max(a, b).toString(); // Simple max function
        },
        difficulty: 'medium',
        tags: ['functions', 'procedures', 'calls']
      },
      {
        name: 'Recursive Function',
        description: 'Test recursive function calls',
        inputGenerator: () => {
          const n = Math.floor(Math.random() * 8) + 3; // 3-10
          return n.toString();
        },
        expectedOutputGenerator: (input) => {
          const n = parseInt(input);
          return (n * (n + 1) / 2).toString(); // Sum using recursion
        },
        difficulty: 'hard',
        tags: ['functions', 'recursion']
      }
    ];

    return this.generateTestSuiteFromTemplates(
      'Function Test Suite',
      'Tests for function and procedure operations',
      templates,
      6
    );
  }

  /**
   * Generate a test suite from templates
   */
  private static generateTestSuiteFromTemplates(
    name: string,
    description: string,
    templates: TestCaseTemplate[],
    casesPerTemplate: number = 5,
    testType: TestType = 'output_validation'
  ): TestSuite {
    const testCases: TestCase[] = [];

    templates.forEach(template => {
      for (let i = 0; i < casesPerTemplate; i++) {
        const input = template.inputGenerator();
        const expectedOutput = template.expectedOutputGenerator(input);

        testCases.push({
          id: uuidv4(),
          input,
          expectedOutput,
          description: `${template.description} - Case ${i + 1}`,
          isHidden: Math.random() < 0.3 // 30% hidden test cases
        });
      }
    });

    const configuration: TestConfiguration = {
      timeout: testType === 'performance_test' ? 2000 : 1000,
      memoryLimit: 100 * 1024 * 1024, // 100MB
      allowSystemCalls: false,
      testType,
      gradingCriteria: this.getDefaultGradingCriteria(testType)
    };

    return {
      id: uuidv4(),
      name,
      description,
      testCases,
      configuration
    };
  }

  /**
   * Get default grading criteria based on test type
   */
  private static getDefaultGradingCriteria(testType: TestType): GradingCriteria {
    const baseCriteria: GradingCriteria = {
      outputWeight: 40,
      performanceWeight: 20,
      codeQualityWeight: 20,
      securityWeight: 20,
      bonusPoints: {
        earlyCompletion: 5,
        efficientCode: 5,
        cleanCode: 5
      }
    };

    switch (testType) {
      case 'performance_test':
        return {
          ...baseCriteria,
          performanceWeight: 40,
          outputWeight: 30
        };

      case 'security_test':
        return {
          ...baseCriteria,
          securityWeight: 40,
          outputWeight: 30
        };

      case 'code_quality':
        return {
          ...baseCriteria,
          codeQualityWeight: 40,
          outputWeight: 30
        };

      default:
        return baseCriteria;
    }
  }

  /**
   * Generate comprehensive test suite for a lesson
   */
  static generateComprehensiveTestSuite(
    lessonName: string,
    concepts: string[]
  ): TestSuite {
    const testSuites: TestSuite[] = [];

    concepts.forEach(concept => {
      switch (concept.toLowerCase()) {
        case 'arithmetic':
          testSuites.push(this.generateArithmeticTestCases());
          break;
        case 'registers':
          testSuites.push(this.generateRegisterTestCases());
          break;
        case 'strings':
          testSuites.push(this.generateStringTestCases());
          break;
        case 'control flow':
          testSuites.push(this.generateControlFlowTestCases());
          break;
        case 'memory':
          testSuites.push(this.generateMemoryTestCases());
          break;
        case 'functions':
          testSuites.push(this.generateFunctionTestCases());
          break;
        case 'performance':
          testSuites.push(this.generatePerformanceTestCases());
          break;
      }
    });

    // Combine all test suites
    const combinedTestCases = testSuites.flatMap(suite => suite.testCases);
    const configuration: TestConfiguration = {
      timeout: 1500,
      memoryLimit: 100 * 1024 * 1024,
      allowSystemCalls: false,
      testType: 'output_validation',
      gradingCriteria: this.getDefaultGradingCriteria('output_validation')
    };

    return {
      id: uuidv4(),
      name: `${lessonName} - Comprehensive Test Suite`,
      description: `Complete test suite covering ${concepts.join(', ')}`,
      testCases: combinedTestCases,
      configuration
    };
  }
}
