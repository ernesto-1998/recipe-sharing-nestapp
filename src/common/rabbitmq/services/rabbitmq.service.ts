import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  connect,
  type AmqpConnectionManager,
  type ChannelWrapper,
} from 'amqp-connection-manager';
import type { Options } from 'amqplib';
import { RabbitMQExchangeType } from '../enums';
import {
  RABBITMQ_RECONNECT_ATTEMPTS,
  RABBITMQ_RECONNECT_INTERVAL_MS,
} from '../constants';
import type { RabbitMQConnectionOptions } from '../interfaces';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
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
      console.log('RabbitMQ connection established');
    });

    this.connection.on('disconnect', (params) => {
      this.isConnected = false;
      console.error('RabbitMQ connection lost', params.err);
    });

    this.channelWrapper = this.connection.createChannel({
      json: true,
    });

    await this.waitForInitialConnection();
  }

  private buildConnectionUrl(options: RabbitMQConnectionOptions): string {
    const { protocol, user, password, host, port, vhost } = options;
    const encodedPassword = encodeURIComponent(password);
    const encodedVhost =
      vhost === '/' ? '' : `/${encodeURIComponent(vhost.replace(/^\//, ''))}`;
    return `${protocol}://${user}:${encodedPassword}@${host}:${port}${encodedVhost}`;
  }

  private async waitForInitialConnection(): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('Channel wrapper not initialized');
    }

    for (let attempt = 1; attempt <= RABBITMQ_RECONNECT_ATTEMPTS; attempt++) {
      try {
        await this.channelWrapper.waitForConnect();
        return;
      } catch (error) {
        if (attempt === RABBITMQ_RECONNECT_ATTEMPTS) {
          throw new Error(
            `Failed to connect to RabbitMQ after ${RABBITMQ_RECONNECT_ATTEMPTS} attempts`,
          );
        }
        console.warn(
          `RabbitMQ connection attempt ${attempt} failed, retrying in ${RABBITMQ_RECONNECT_INTERVAL_MS}ms`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RABBITMQ_RECONNECT_INTERVAL_MS),
        );
      }
    }
  }

  async assertExchange(
    exchange: string,
    type: RabbitMQExchangeType,
    options?: Options.AssertExchange,
  ): Promise<void> {
    this.ensureConnected();

    await this.channelWrapper!.assertExchange(exchange, type, {
      durable: true,
      ...options,
    });
  }

  async assertQueue(
    queue: string,
    options?: Options.AssertQueue,
  ): Promise<void> {
    this.ensureConnected();

    await this.channelWrapper!.assertQueue(queue, {
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
    this.ensureConnected();

    await this.channelWrapper!.bindQueue(queue, exchange, routingKey, args);
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: Record<string, unknown>,
    options?: Options.Publish,
  ): Promise<void> {
    this.ensureConnected();

    await this.channelWrapper!.publish(exchange, routingKey, message, {
      persistent: true,
      ...options,
    });
  }

  private ensureConnected(): void {
    if (!this.channelWrapper) {
      throw new Error('RabbitMQ channel is not initialized');
    }
  }

  private async shutdown(): Promise<void> {
    try {
      if (this.channelWrapper) {
        await this.channelWrapper.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('RabbitMQ connection closed gracefully');
    } catch (error) {
      console.error('Error during RabbitMQ graceful shutdown', error);
    }
  }
}
