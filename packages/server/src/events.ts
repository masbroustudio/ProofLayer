import type { FastifyReply } from 'fastify';

export interface TelemetryEvent {
  id: string;
  type: 'INTERCEPT' | 'APPROVAL_REQUIRED' | 'EXECUTED' | 'BLOCKED';
  timestamp: number;
  data: Record<string, any>;
}

export class EventBroadcaster {
  private clients: Set<FastifyReply> = new Set();

  public addClient(reply: FastifyReply): void {
    this.clients.add(reply);

    // Initial keep-alive & ping
    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);

    reply.raw.on('close', () => {
      this.clients.delete(reply);
    });
  }

  public broadcast(event: TelemetryEvent): void {
    const payload = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
    for (const client of this.clients) {
      try {
        client.raw.write(payload);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  public getSubscriberCount(): number {
    return this.clients.size;
  }
}
