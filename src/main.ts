import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { MessageModule } from './modules/message/message.module';
import { validateConfig } from './utils/common/validateEnv';
import { appConfig } from './utils/appConfig';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const configValidationResult = validateConfig(appConfig);
  if (configValidationResult.error) {
    console.error('APP_CONFIG validation error', configValidationResult.error);
    return;
  }

  const messageApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    MessageModule,
    {
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
      },
    },
  );
  await messageApp.listen();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
}

bootstrap();
