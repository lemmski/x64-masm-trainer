import { Router } from 'express';
import { testRunner } from '../../tests/testRunner';
import { TestCaseGenerator } from '../../tests/testCaseGenerator';
import { testingService } from '../../tests/testingService';
import { gradingService } from '../../tests/gradingService';
import { lessonService } from '../../lessons/lessonService';
import { Exercise, TestSuite } from '../../shared/types';

const router = Router();

/**
 * Generate test cases for an exercise
 */
router.post('/generate/:exerciseId', async (req, res) => {
  try {
    const { concepts, count = 5 } = req.body;

    const exercise = await lessonService.getExerciseById(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Generate test cases based on concepts
    let testSuite: TestSuite;

    if (concepts && concepts.length > 0) {
      testSuite = TestCaseGenerator.generateComprehensiveTestSuite(exercise.title, concepts);
    } else {
      // Generate based on exercise difficulty
      switch (exercise.difficulty) {
        case 'easy':
          testSuite = TestCaseGenerator.generateArithmeticTestCases();
          break;
        case 'medium':
          testSuite = TestCaseGenerator.generateRegisterTestCases();
          break;
        case 'hard':
          testSuite = TestCaseGenerator.generateControlFlowTestCases();
          break;
        default:
          testSuite = TestCaseGenerator.generateStringTestCases();
      }
    }

    res.json(testSuite);
    return;
  } catch (error) {
    console.error('Error generating test cases:', error);
    res.status(500).json({ error: 'Failed to generate test cases' });
    return;
  }
});

/**
 * Run a test suite for an exercise
 */
router.post('/run/:exerciseId', async (req, res) => {
  try {
    const { code, userId, testSuite, options } = req.body;

    if (!code || !userId || !testSuite) {
      return res.status(400).json({
        error: 'Code, userId, and testSuite are required'
      });
    }

    const exercise = await lessonService.getExerciseById(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const result = await testRunner.runTestSuite(exercise, code, userId, testSuite, options);

    res.json(result);
    return;
  } catch (error) {
    console.error('Error running test suite:', error);
    res.status(500).json({
      error: 'Failed to run test suite',
      details: error
    });
    return;
  }
});

/**
 * Run quick validation tests
 */
router.post('/validate/:exerciseId', async (req, res) => {
  try {
    const { code, testCases } = req.body;

    if (!code || !testCases || !Array.isArray(testCases)) {
      return res.status(400).json({
        error: 'Code and testCases array are required'
      });
    }

    const result = await testRunner.runQuickValidation(code, testCases);

    res.json(result);
    return;
  } catch (error) {
    console.error('Error running quick validation:', error);
    res.status(500).json({
      error: 'Failed to run validation',
      details: error
    });
    return;
  }
});

/**
 * Run performance benchmark
 */
router.post('/benchmark/:exerciseId', async (req, res) => {
  try {
    const { code, testCases, iterations = 5 } = req.body;

    if (!code || !testCases || !Array.isArray(testCases)) {
      return res.status(400).json({
        error: 'Code and testCases array are required'
      });
    }

    const result = await testRunner.runPerformanceBenchmark(code, testCases, iterations);

    res.json(result);
    return;
  } catch (error) {
    console.error('Error running performance benchmark:', error);
    res.status(500).json({
      error: 'Failed to run benchmark',
      details: error
    });
    return;
  }
});

/**
 * Run security analysis
 */
router.post('/security/:exerciseId', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await testRunner.runSecurityAnalysis(code);

    res.json(result);
    return;
  } catch (error) {
    console.error('Error running security analysis:', error);
    res.status(500).json({
      error: 'Failed to run security analysis',
      details: error
    });
    return;
  }
});

/**
 * Run code quality analysis
 */
router.post('/quality/:exerciseId', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await testRunner.runCodeQualityAnalysis(code);

    res.json(result);
    return;
  } catch (error) {
    console.error('Error running code quality analysis:', error);
    res.status(500).json({
      error: 'Failed to run quality analysis',
      details: error
    });
    return;
  }
});

/**
 * Get grading criteria for an exercise
 */
router.get('/grading/:exerciseId', async (req, res) => {
  try {
    const exercise = await lessonService.getExerciseById(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Return default grading criteria based on exercise difficulty
    const criteria = {
      functionality: {
        weight: 60,
        description: 'Correctness of the solution'
      },
      efficiency: {
        weight: 20,
        description: 'Performance and code optimization'
      },
      style: {
        weight: 10,
        description: 'Code readability and documentation'
      },
      robustness: {
        weight: 10,
        description: 'Error handling and edge cases'
      }
    };

    res.json({
      exercise,
      criteria,
      totalWeight: Object.values(criteria).reduce((sum, c) => sum + c.weight, 0)
    });
    return;
  } catch (error) {
    console.error('Error getting grading criteria:', error);
    res.status(500).json({ error: 'Failed to get grading criteria' });
    return;
  }
});

/**
 * Get test statistics for an exercise
 */
router.get('/stats/:exerciseId', async (req, res) => {
  try {
    // This would typically query the database for submission statistics
    // For now, return mock statistics
    const stats = {
      totalSubmissions: 1250,
      averageScore: 78.5,
      passRate: 85.2,
      commonErrors: [
        { error: 'Wrong register usage', count: 234 },
        { error: 'Missing comparison', count: 189 },
        { error: 'Incorrect jump condition', count: 156 },
        { error: 'Memory access error', count: 98 }
      ],
      difficultyBreakdown: {
        easy: { average: 92.3, passRate: 95.1 },
        medium: { average: 76.8, passRate: 82.4 },
        hard: { average: 65.2, passRate: 71.8 }
      },
      performanceMetrics: {
        averageExecutionTime: 245,
        fastestTime: 89,
        slowestTime: 1250
      }
    };

    res.json(stats);
    return;
  } catch (error) {
    console.error('Error getting test statistics:', error);
    res.status(500).json({ error: 'Failed to get test statistics' });
    return;
  }
});

/**
 * Get available test templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'arithmetic',
        name: 'Arithmetic Operations',
        description: 'Tests for basic math operations',
        difficulty: 'easy',
        estimatedTests: 8
      },
      {
        id: 'registers',
        name: 'Register Operations',
        description: 'Tests for register manipulation',
        difficulty: 'easy',
        estimatedTests: 6
      },
      {
        id: 'control_flow',
        name: 'Control Flow',
        description: 'Tests for loops and conditionals',
        difficulty: 'medium',
        estimatedTests: 8
      },
      {
        id: 'memory',
        name: 'Memory Operations',
        description: 'Tests for memory access and arrays',
        difficulty: 'hard',
        estimatedTests: 6
      },
      {
        id: 'functions',
        name: 'Functions & Procedures',
        description: 'Tests for function calls and procedures',
        difficulty: 'medium',
        estimatedTests: 6
      },
      {
        id: 'performance',
        name: 'Performance Tests',
        description: 'Tests focused on execution efficiency',
        difficulty: 'hard',
        estimatedTests: 5
      }
    ];

    res.json(templates);
    return;
  } catch (error) {
    console.error('Error getting test templates:', error);
    res.status(500).json({ error: 'Failed to get test templates' });
    return;
  }
});

/**
 * Create custom test case
 */
router.post('/custom/:exerciseId', async (req, res) => {
  try {
    const { input, expectedOutput, description, isHidden = false } = req.body;

    if (!input || !expectedOutput || !description) {
      return res.status(400).json({
        error: 'Input, expectedOutput, and description are required'
      });
    }

    const exercise = await lessonService.getExerciseById(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Validate the test case by running it against the exercise solution
    try {
      const validationResult = await testRunner.runQuickValidation(
        exercise.solution,
        [{ input, expectedOutput }]
      );

      if (!validationResult.results[0]?.passed) {
        return res.status(400).json({
          error: 'Test case fails against the expected solution',
          details: validationResult.results[0]
        });
      }
    } catch (validationError) {
      console.warn('Could not validate test case against solution:', validationError);
    }

    // Create test case object
    const testCase = {
      id: `custom_${Date.now()}`,
      input,
      expectedOutput,
      description,
      isHidden
    };

    res.json({
      success: true,
      testCase,
      message: 'Custom test case created successfully'
    });
    return;
  } catch (error) {
    console.error('Error creating custom test case:', error);
    res.status(500).json({
      error: 'Failed to create custom test case',
      details: error
    });
    return;
  }
});

export default router;
