import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  connect,
  type AmqpConnectionManager,
  type ChannelWrapper,
} from 'amqp-connection-manager';

import type { ConfirmChannel, Options } from 'amqplib';

import type { RabbitMQConnectionOptions } from '../interfaces';

import {
  RABBITMQ_RECONNECT_ATTEMPTS,
  RABBITMQ_RECONNECT_INTERVAL_MS,
} from '../constants/rabbitmq.constant';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);

  private static readonly PUBLISH_TIMEOUT_MS = 5000;

  private connection!: AmqpConnectionManager;
  private publisherChannel!: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const options: RabbitMQConnectionOptions = {
      host: this.configService.get<string>('RABBITMQ_HOST', 'localhost'),
      port: Number(this.configService.get<string>('RABBITMQ_PORT', '5672')),
      user: this.configService.get<string>('RABBITMQ_USER', 'guest'),
      password: this.configService.get<string>('RABBITMQ_PASSWORD', 'guest'),
      protocol: this.configService.get<string>('RABBITMQ_PROTOCOL', 'amqp'),
      vhost: this.configService.get<string>('RABBITMQ_VHOST', '/'),
    };

    const url = this.buildConnectionUrl(options);

    this.connection = connect([url], {
      reconnectTimeInSeconds: RABBITMQ_RECONNECT_INTERVAL_MS / 1000,
      heartbeatIntervalInSeconds: RABBITMQ_RECONNECT_ATTEMPTS,
    });

    this.connection.on('connect', () => {
      this.logger.log('RabbitMQ connection established');
    });

    this.connection.on('disconnect', (params) => {
      this.logger.error('RabbitMQ connection lost', params.err);
    });

    this.connection.on('connectFailed', (params) => {
      this.logger.error('RabbitMQ connection failed', params.err);
    });

    this.publisherChannel = this.connection.createChannel({
      json: true,
    });
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.publisherChannel
        .close()
        .catch((err) =>
          this.logger.error('Error closing publisher channel', err),
        );
      await this.connection
        .close()
        .catch((err) => this.logger.error('Error closing connection', err));

      this.logger.log('RabbitMQ connection closed gracefully');
    } catch (err) {
      this.logger.error('Error during RabbitMQ graceful shutdown', err);
    }
  }

  get connected(): boolean {
    return this.connection.isConnected();
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: Record<string, unknown>,
    options?: Options.Publish,
  ): Promise<void> {
    const timeout = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('RabbitMQ publish timeout exceeded'));
      }, RabbitMQService.PUBLISH_TIMEOUT_MS);

      timer.unref();
    });

    const publishOperation = this.publisherChannel.publish(
      exchange,
      routingKey,
      message,
      {
        persistent: true,
        ...options,
      },
    );

    const published = await Promise.race([publishOperation, timeout]);

    if (!published) {
      throw new Error('Message was not confirmed by RabbitMQ broker');
    }
  }

  createConsumerChannel(
    setup: (channel: ConfirmChannel) => Promise<void>,
  ): ChannelWrapper {
    return this.connection.createChannel({
      json: true,
      setup,
    });
  }

  private buildConnectionUrl(options: RabbitMQConnectionOptions): string {
    const { protocol, user, password, host, port, vhost } = options;

    const encodedPassword = encodeURIComponent(password);

    const encodedVhost =
      vhost === '/' ? '' : `/${encodeURIComponent(vhost.replace(/^\//, ''))}`;

    return `${protocol}://${user}:${encodedPassword}@${host}:${port}${encodedVhost}`;
  }
}
