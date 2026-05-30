import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from './winston.config';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createWinstonConfig(config.get<string>('nodeEnv', 'development')),
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
