import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';

@Module({
  providers: [AnimeService],
  controllers: [AnimeController]
})
export class AnimeModule {}
