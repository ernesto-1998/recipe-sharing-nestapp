import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { RabbitMQService } from 'src/common/rabbitmq/services/rabbitmq.service';
import { RabbitMQExchangeType } from 'src/common/rabbitmq/enums/rabbitmq-exchange-type.enum';
import { PostgresLogRepository } from '../persistence/postgres-log.repository';
import type { ILogMessage } from '../interfaces/log-message.interface';
import {
  LOG_EXCHANGE,
  LOG_QUEUE,
  LOG_ROUTING_KEY,
} from '../constants/logger.constants';

@Injectable()
export class LogConsumer implements OnModuleInit {
  private readonly logger = new Logger(LogConsumer.name);
  private static readonly PREFETCH_COUNT = 10;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly postgresLogRepository: PostgresLogRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.rabbitMQService.createConsumerChannel(
        async (ch: ConfirmChannel): Promise<void> => {
          await ch.prefetch(LogConsumer.PREFETCH_COUNT);
          await ch.assertExchange(LOG_EXCHANGE, RabbitMQExchangeType.DIRECT, {
            durable: true,
          });
          await ch.assertQueue(LOG_QUEUE, { durable: true });
          await ch.bindQueue(LOG_QUEUE, LOG_EXCHANGE, LOG_ROUTING_KEY);
          await ch.consume(
            LOG_QUEUE,
            (msg: ConsumeMessage | null): void => {
              if (!msg) return;
              void this.processMessage(ch, msg);
            },
            { noAck: false },
          );
        },
      );

      this.logger.log('LogConsumer subscribed to logs.queue');
    } catch (err) {
      this.logger.error('Failed to initialize LogConsumer', err);
    }
  }

  private async processMessage(
    ch: ConfirmChannel,
    msg: ConsumeMessage,
  ): Promise<void> {
    try {
      const content = JSON.parse(msg.content.toString()) as ILogMessage;
      await this.postgresLogRepository.insert(content);
      ch.ack(msg);
    } catch (err) {
      this.logger.error('Failed to process log message', err);
      try {
        ch.nack(msg, false, false);
      } catch (nackErr) {
        this.logger.error('Failed to nack message', nackErr);
      }
    }
  }
}
