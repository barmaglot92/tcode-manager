import { Inject, Injectable } from '@nestjs/common';
import { ClientRedis } from '@nestjs/microservices';

@Injectable()
export class MessageService {
  constructor(
    @Inject('MESSAGE_SERVICE') private readonly client: ClientRedis,
  ) {}

  getWorkers() {
    return this.client.send;
  }

  pong() {
    this.client.emit('pong', { test: 'test' });
  }

  runProcess({
    downloadUrl,
    uploadUrl,
  }: {
    downloadUrl: string;
    uploadUrl: string;
  }) {
    this.client.emit('run', { downloadUrl, uploadUrl });
  }
}
