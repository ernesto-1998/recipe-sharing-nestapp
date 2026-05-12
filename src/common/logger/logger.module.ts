import { Global, Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { RabbitMQModule } from 'src/common/rabbitmq/rabbitmq.module';
import { CustomToken } from '../enums/custom-tokens-providers.enum';

@Global()
@Module({
  imports: [RabbitMQModule],
  providers: [
    LoggerService,
    {
      provide: CustomToken.APP_LOGGER,
      useExisting: LoggerService,
    },
  ],
  exports: [CustomToken.APP_LOGGER],
})
export class LoggerModule {}
