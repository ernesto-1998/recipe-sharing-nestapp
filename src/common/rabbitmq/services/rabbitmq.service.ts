import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
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

  private connection: AmqpConnectionManager | null = null;
  private channelWrapper: ChannelWrapper | null = null;

  private readonly channelReady: Promise<void>;
  private resolveChannelReady!: () => void;

  constructor(private readonly configService: ConfigService) {
    this.channelReady = new Promise((resolve) => {
      this.resolveChannelReady = resolve;
    });
  }

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
      this.resolveChannelReady();
    });

    this.connection.on('disconnect', (params) => {
      this.logger.error('RabbitMQ connection lost', params.err);
    });

    this.connection.on('connectFailed', (params) => {
      this.logger.error('RabbitMQ connection failed', params.err);
    });

    this.channelWrapper = this.connection.createChannel({ json: true });
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.channelWrapper) {
        await this.channelWrapper.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('RabbitMQ connection closed gracefully');
    } catch (err) {
      this.logger.error('Error during RabbitMQ graceful shutdown', err);
    }
  }

  get connected(): boolean {
    return this.connection?.isConnected() ?? false;
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: Record<string, unknown>,
    options?: Options.Publish,
  ): Promise<void> {
    await this.channelReady;

    if (!this.channelWrapper) {
      throw new Error('RabbitMQ channel is not available');
    }

    const published = await this.channelWrapper.publish(
      exchange,
      routingKey,
      message,
      { persistent: true, ...options },
    );

    if (!published) {
      throw new Error('Message was not confirmed by RabbitMQ broker');
    }
  }

  async createConsumerChannel(
    setup: (channel: ConfirmChannel) => Promise<void>,
  ): Promise<void> {
    await this.channelReady;

    if (!this.connection) {
      throw new Error('RabbitMQ connection is not initialized');
    }

    await new Promise<void>((resolve, reject) => {
      const consumerChannel = this.connection!.createChannel({
        json: true,
        setup: async (channel: ConfirmChannel) => {
          try {
            await setup(channel);
            resolve();
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        },
      });

      consumerChannel.on('error', (err) => {
        this.logger.error('Consumer channel error', err);
      });
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
