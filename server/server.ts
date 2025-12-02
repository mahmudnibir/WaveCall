/**
 * WaveApp Signaling Server
 * 
 * To run this server:
 * 1. Initialize a new node project: `npm init -y`
 * 2. Install dependencies: `npm install ws`
 * 3. Run: `npx tsx server.ts` or `node server.js` (if compiled)
 * 
 * This server handles simple signaling message relaying between clients.
 */

import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Simple store for connected clients
// In production, use Redis or a proper room manager
const clients: Set<WebSocket> = new Set();

console.log('WaveApp Signaling Server running on ws://localhost:8080');

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('message', (message: string) => {
    // Broadcast message to all other clients (basic p2p discovery)
    // In production, you would parse the message to find the specific 'target' peer
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
      console.error('Socket error:', error);
  });
});

// Handling server shutdown
(process as any).on('SIGINT', () => {
    console.log('Shutting down signaling server...');
    wss.close();
    (process as any).exit();
});