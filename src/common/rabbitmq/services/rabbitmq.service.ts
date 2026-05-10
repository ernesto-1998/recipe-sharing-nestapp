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
import type { ConsumeMessage, Options } from 'amqplib';
import { RabbitMQExchangeType } from '../enums';
import type { RabbitMQConnectionOptions } from '../interfaces';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);

  private connection: AmqpConnectionManager | null = null;
  private channelWrapper: ChannelWrapper | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const options: RabbitMQConnectionOptions = {
      host: this.configService.get('RABBITMQ_HOST', 'localhost'),
      port: Number(this.configService.get('RABBITMQ_PORT', '5672')),
      user: this.configService.get('RABBITMQ_USER', 'guest'),
      password: this.configService.get('RABBITMQ_PASSWORD', 'guest'),
      protocol: this.configService.get('RABBITMQ_PROTOCOL', 'amqp'),
      vhost: this.configService.get('RABBITMQ_VHOST', '/'),
    };

    await this.initialize(options);
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  get connected(): boolean {
    return this.isConnected;
  }

  private async initialize(options: RabbitMQConnectionOptions): Promise<void> {
    const url = this.buildConnectionUrl(options);

    this.connection = connect([url]);

    this.connection.on('connect', () => {
      this.isConnected = true;
      this.logger.log('RabbitMQ connection established');
    });

    this.connection.on('disconnect', (params) => {
      this.isConnected = false;
      this.logger.error('RabbitMQ connection lost', params.err);
    });

    this.channelWrapper = this.connection.createChannel({ json: true });

    await this.channelWrapper.waitForConnect();
  }

  private buildConnectionUrl(options: RabbitMQConnectionOptions): string {
    const { protocol, user, password, host, port, vhost } = options;
    const encodedPassword = encodeURIComponent(password);
    const encodedVhost =
      vhost === '/' ? '' : `/${encodeURIComponent(vhost.replace(/^\//, ''))}`;
    return `${protocol}://${user}:${encodedPassword}@${host}:${port}${encodedVhost}`;
  }

  private getChannel(): ChannelWrapper {
    if (!this.channelWrapper) {
      throw new Error('RabbitMQ channel is not initialized');
    }
    return this.channelWrapper;
  }

  async assertExchange(
    exchange: string,
    type: RabbitMQExchangeType,
    options?: Options.AssertExchange,
  ): Promise<void> {
    await this.getChannel().assertExchange(exchange, type, {
      durable: true,
      ...options,
    });
  }

  async assertQueue(
    queue: string,
    options?: Options.AssertQueue,
  ): Promise<void> {
    await this.getChannel().assertQueue(queue, {
      durable: true,
      ...options,
    });
  }

  async bindQueue(
    queue: string,
    exchange: string,
    routingKey: string,
    args?: Record<string, unknown>,
  ): Promise<void> {
    await this.getChannel().bindQueue(queue, exchange, routingKey, args);
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: Record<string, unknown>,
    options?: Options.Publish,
  ): Promise<void> {
    await this.getChannel().publish(exchange, routingKey, message, {
      persistent: true,
      ...options,
    });
  }

  async subscribe(
    queue: string,
    handler: (message: Record<string, unknown>) => Promise<void>,
    options?: Options.Consume,
  ): Promise<void> {
    await this.getChannel().consume(
      queue,
      (msg: ConsumeMessage | null) => {
        if (!msg) return;

        const process = async (): Promise<void> => {
          const content = JSON.parse(msg.content.toString()) as Record<
            string,
            unknown
          >;
          await handler(content);
          this.getChannel().ack(msg);
        };

        process().catch((err: unknown) => {
          this.logger.error('Failed to process message', err);
          this.getChannel().nack(msg, false, false);
        });
      },
      options,
    );
  }

  private async shutdown(): Promise<void> {
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
}
