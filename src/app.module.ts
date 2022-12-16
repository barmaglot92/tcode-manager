import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './modules/message/message.module';
import { VideoModule } from './modules/video/video.module';

@Module({
  imports: [
    MessageModule,
    VideoModule,
    CacheModule.register(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'videoDB',
      // synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
