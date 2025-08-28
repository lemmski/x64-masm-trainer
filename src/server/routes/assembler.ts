import { Router } from 'express';
import { assemblerService } from '../../assembler/assemblerService';
import { AssemblyResult } from '../../shared/types';

const router = Router();

// Compile and run MASM code
router.post('/compile', async (req, res) => {
  try {
    const { code, input = '', timeout = 5000, allowSystemCalls = false } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await assemblerService.compileAndRun(code, input, {
      timeout,
      allowSystemCalls
    });

    res.json(result);
  } catch (error) {
    console.error('Error in compilation:', error);
    res.status(500).json({
      error: 'Internal server error during compilation',
      details: error
    });
  }
});

// Validate assembly syntax
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await assemblerService.validateSyntax(code);
    res.json(result);

  } catch (error) {
    console.error('Error validating code:', error);
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

export default router;
