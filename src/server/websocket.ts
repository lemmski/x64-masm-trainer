import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export function setupWebSocket(wss: WebSocketServer) {
  const clients = new Map<string, ExtendedWebSocket>();

  wss.on('connection', (ws: ExtendedWebSocket, request: IncomingMessage) => {
    console.log('🔌 New WebSocket connection established');

    // Handle ping/pong for connection health
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'auth':
            handleAuth(ws, message);
            break;

          case 'code_change':
            handleCodeChange(ws, message);
            break;

          case 'exercise_submit':
            handleExerciseSubmit(ws, message);
            break;

          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format'
        }));
      }
    });

    // Handle connection close
    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`👋 User ${ws.userId} disconnected`);
      }
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to x64 MASM Trainer'
    }));
  });

  // Connection health check
  const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (!ws.isAlive) {
        if (ws.userId) {
          clients.delete(ws.userId);
        }
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
}

function handleAuth(ws: ExtendedWebSocket, message: any) {
  const { userId } = message;

  if (!userId) {
    ws.send(JSON.stringify({
      type: 'error',
      error: 'User ID required for authentication'
    }));
    return;
  }

  ws.userId = userId;
  ws.send(JSON.stringify({
    type: 'auth_success',
    userId
  }));

  console.log(`🔐 User ${userId} authenticated`);
}

function handleCodeChange(ws: ExtendedWebSocket, message: any) {
  const { code, exerciseId } = message;

  // Broadcast to other clients or handle collaborative features
  // For now, just acknowledge receipt
  ws.send(JSON.stringify({
    type: 'code_ack',
    exerciseId,
    timestamp: new Date().toISOString()
  }));
}

function handleExerciseSubmit(ws: ExtendedWebSocket, message: any) {
  const { exerciseId, code } = message;

  if (!ws.userId) {
    ws.send(JSON.stringify({
      type: 'error',
      error: 'User not authenticated'
    }));
    return;
  }

  // TODO: Process submission and run tests
  ws.send(JSON.stringify({
    type: 'submission_ack',
    exerciseId,
    status: 'processing'
  }));

  // Simulate processing delay
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'submission_result',
      exerciseId,
      passed: true,
      score: 100,
      results: []
    }));
  }, 1000);
}
