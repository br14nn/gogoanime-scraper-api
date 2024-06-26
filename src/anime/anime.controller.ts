import { Controller, Get, Query } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeInfoDto, SearchAnimeDto, WatchAnimeDto } from './dto/anime.dto';

@Controller('anime')
export class AnimeController {
  constructor(private anime: AnimeService) {}

  @Get('watch')
  async watch(@Query() query: WatchAnimeDto) {
    const res = await this.anime.watchAnime(query.episodeId);
    return res;
  }

  @Get('search')
  async search(@Query() query: SearchAnimeDto) {
    query.page = !query.page ? '1' : query.page;
    const res = await this.anime.searchAnime(query.keyword, query.page);
    return res;
  }

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
