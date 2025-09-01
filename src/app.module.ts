import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CassandraLogger } from './common/logger/cassandra-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.dev',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_USER')}:${configService.get('MONGO_PASSWORD')}@${configService.get('MONGO_HOST')}:${configService.get('MONGO_PORT')}/${configService.get('MONGO_DATABASE')}`,
        dbName: configService.get('MONGO_DATABASE'),
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    AppService,
    CassandraLogger,
    {
      provide: Logger,
      useExisting: CassandraLogger,
    },
  ],
})
export class AppModule {}
