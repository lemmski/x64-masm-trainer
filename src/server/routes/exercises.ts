import { Router } from 'express';
import { lessonService } from '../../lessons/lessonService';
import { Exercise } from '../../shared/types';

const router = Router();

// Get exercises for a lesson
router.get('/lesson/:lessonId', async (req, res) => {
  try {
    const exercises = await lessonService.getExercisesForLesson(req.params.lessonId);
    res.json(exercises);
    return;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
    return;
  }
});

// Get exercise by ID
router.get('/:id', async (req, res) => {
  try {
    const exercise = await lessonService.getExerciseById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
    return;
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
    return;
  }
});

// Submit exercise solution
router.post('/:id/submit', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Code and userId are required' });
    }

    const submission = await lessonService.submitExercise(req.params.id, userId, code);
    res.json(submission);
    return;
  } catch (error) {
    console.error('Error submitting exercise:', error);
    res.status(500).json({ error: 'Failed to submit exercise' });
    return;
  }
});

// Get user progress for exercises in a lesson
router.get('/progress/:userId/:lessonId', async (req, res) => {
  try {
    const progress = await lessonService.getUserLessonProgress(req.params.userId, req.params.lessonId);

    if (!progress) {
      return res.json({
        lessonId: req.params.lessonId,
        completed: false,
        score: 0,
        timeSpent: 0,
        attempts: 0,
        lastAttempt: null,
        completedExercises: []
      });
    }

    res.json(progress);
    return;
  } catch (error) {
    console.error('Error fetching exercise progress:', error);
    res.status(500).json({ error: 'Failed to fetch exercise progress' });
    return;
  }
});

export default router;
