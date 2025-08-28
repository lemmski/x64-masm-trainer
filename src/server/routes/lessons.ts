import { Router } from 'express';
import { lessonService } from '../../lessons/lessonService';
import { Lesson } from '../../shared/types';

const router = Router();

// Get all lessons
router.get('/', async (req, res) => {
  try {
    const difficulty = req.query.difficulty as string;
    const lessons = await lessonService.getLessons(difficulty);
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get lesson by ID
router.get('/:id', async (req, res) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Get recommended lesson for user
router.get('/recommended/:userId', async (req, res) => {
  try {
    const recommendedLesson = await lessonService.getRecommendedLesson(req.params.userId);

    if (!recommendedLesson) {
      return res.json({ message: 'No recommended lesson available' });
    }

    res.json(recommendedLesson);
  } catch (error) {
    console.error('Error fetching recommended lesson:', error);
    res.status(500).json({ error: 'Failed to fetch recommended lesson' });
  }
});

export default router;
