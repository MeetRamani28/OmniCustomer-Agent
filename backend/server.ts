import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './src/app.js';
import { initializeDatabase } from './src/db/sqlite.js';
import { appGraph } from './src/agents/graph.js';
import { HumanMessage } from '@langchain/core/messages';

const PORT = process.env.PORT || 5000;

// Initialize database migrations on startup
initializeDatabase();

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // To be restricted in production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  
  socket.on('agent:message', async (data: { message: string }) => {
    try {
      console.log(`[Socket.io] Received query: "${data.message}"`);
      
      // Emit typing status to UI
      socket.emit('agent:typing', { status: true });

      const initialState = {
        messages: [new HumanMessage(data.message)],
        nextRoute: 'supervisor'
      };

      // Stream the LangGraph execution across nodes
      const stream = await appGraph.stream(initialState, {
        recursionLimit: 10
      });

      let finalState: any = null;
      for await (const state of stream) {
        console.log('[Socket.io] Graph Node emitted state transition');
        finalState = state;
      }

      // Extract the final message from the latest node that executed
      const nodeKeys = Object.keys(finalState);
      const lastNode = nodeKeys[0]; 
      const outputMessages = finalState[lastNode].messages;
      const finalAIResponse = outputMessages[outputMessages.length - 1].content;

      socket.emit('agent:response', {
        reply: finalAIResponse,
        route: lastNode
      });

    } catch (error) {
      console.error('[Socket.io] Graph execution failed:', error);
      socket.emit('agent:error', { error: 'Internal swarm execution failure.' });
    } finally {
      socket.emit('agent:typing', { status: false });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[Server] Core backend running on http://localhost:${PORT}`);
});
