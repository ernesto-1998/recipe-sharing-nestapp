import { Module } from '@nestjs/common';
import { RabbitMQService } from './services/rabbitmq.service';

@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
