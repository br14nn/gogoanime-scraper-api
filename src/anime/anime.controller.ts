import { Controller, Get, Query } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeInfoDto } from './dto/anime.dto';

@Controller('anime')
export class AnimeController {
  constructor(private anime: AnimeService) {}

  @Get('info')
  async info(@Query() query: AnimeInfoDto) {
    const res = await this.anime.getAnimeInfo(query.id);
    return res;
  }

  @Get('trending')
  async trending() {
    const res = this.anime.getTrending();
    return res;
  }
}
