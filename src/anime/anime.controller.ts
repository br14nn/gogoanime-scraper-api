import { Controller, Get } from '@nestjs/common';
import { AnimeService } from './anime.service';

@Controller('anime')
export class AnimeController {
  constructor(private anime: AnimeService) {}

  @Get('trending')
  async trending() {
    const res = this.anime.getTrending();
    return res;
  }
}
