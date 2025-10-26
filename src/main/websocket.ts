import { Server } from 'ws';
import { EventEmitter } from 'events';
import { WSMessage } from '../shared/types';

export class WebSocketServer extends EventEmitter {
  private wss: Server;
  private clients: Set<any> = new Set();

  constructor(port: number) {
    super();
    this.wss = new Server({ port });

    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      ws.on('message', (data) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(message, ws);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Invalid message format' }
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        payload: {
          message: 'Connected to Projection Mapper',
          version: '0.1.0',
          commands: [
            'project.load',
            'project.save',
            'layer.create',
            'layer.update',
            'layer.delete',
            'layer.reorder',
            'geometry.update',
            'global.update',
            'timeline.play',
            'timeline.pause',
            'timeline.seek'
          ]
        }
      }));
    });

    console.log(`WebSocket server listening on port ${port}`);
  }

  private handleMessage(message: WSMessage, ws: any) {
    // Emit message to main process for handling
    this.emit('message', message);

    // Send acknowledgement
    ws.send(JSON.stringify({
      type: 'ack',
      payload: {
        originalType: message.type,
        timestamp: Date.now()
      }
    }));
  }

  public broadcast(message: WSMessage) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(data);
      }
    });
  }

  public close() {
    this.clients.forEach((client) => {
      client.close();
    });
    this.wss.close();
  }
}