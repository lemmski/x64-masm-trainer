import { Router } from 'express';
import { dbGet, dbRun } from '../database';
import { User } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.params.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const formattedUser: User = {
      ...user,
      preferences: JSON.parse(user.preferences),
      progress: [], // TODO: Fetch actual progress
      createdAt: new Date(user.created_at),
      lastActive: new Date(user.last_active)
    };

    res.json(formattedUser);
    return;
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
    return;
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, email, preferences } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const id = uuidv4();
    const defaultPreferences = {
      theme: 'dark',
      editorFontSize: 14,
      autoSave: true,
      showLineNumbers: true,
      ...preferences
    };

    await dbRun(
      'INSERT INTO users (id, username, email, preferences) VALUES (?, ?, ?, ?)',
      [id, username, email, JSON.stringify(defaultPreferences)]
    );

    const user: User = {
      id,
      username,
      email,
      preferences: defaultPreferences,
      progress: [],
      createdAt: new Date(),
      lastActive: new Date()
    };

    res.status(201).json(user);
    return;
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
    return;
  }
});

// Update user preferences
router.put('/:id/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ error: 'Preferences are required' });
    }

    await dbRun(
      'UPDATE users SET preferences = ? WHERE id = ?',
      [JSON.stringify(preferences), req.params.id]
    );

    res.json({ success: true });
    return;
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
    return;
  }
});

export default router;
