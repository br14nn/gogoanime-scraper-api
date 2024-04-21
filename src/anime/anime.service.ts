import { ForbiddenException, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { gogoanimeUrl } from 'src/globals/urls';

@Injectable()
export class AnimeService {
  async getAnimeInfo(id: string): Promise<IResults> {
    try {
      const res = await axios.get(`${gogoanimeUrl}/category/${id}`);
      const $ = cheerio.load(res.data);

      const animeTitle = $(
        `#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg`,
      )
        .find('h1')
        .text();
      const animeType = $(
        `#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(4)`,
      )
        .find(`a`)
        .text();
      const animePlotSummary = $(
        `#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > div`,
      )
        .text()
        .replace(/\n/g, '');
      const animeGenres = [];
      $(
        `#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(7)`,
      )
        .find(`a`)
        .map((i, elem) => {
          animeGenres.push($(elem).attr(`title`));
        });
      const animeReleasedYear = $(
        `#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(8)`,
      )
        .text()
        .replace('Released: ', '');
      const animeStatus = $(
        `#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(9) > a`,
      ).attr(`title`);

      return {
        results: {
          id: id,
          title: animeTitle,
          type: animeType,
          plotSummary: animePlotSummary,
          genres: animeGenres,
          releasedYear: animeReleasedYear,
          status: animeStatus,
        },
      };
    } catch (error) {
      throw new ForbiddenException(`Failed to get anime info of: ${id}`);
    }
  }

  async getTrending(): Promise<IResults> {
    try {
      const res = await axios.get(`${gogoanimeUrl}/popular.html`);
      const $ = cheerio.load(res.data);

      const items = $(
        `#wrapper_bg > section > section.content_left > div > div.last_episodes > ul`,
      ).find('li');

      let trendingAnimesData: ITrendingAnimeInfo[] = [];
      for (let i = 0; i < 10; i++) {
        const animeId = $(items[i])
          .find('p.name > a')
          .attr('href')
          .replace('/category/', '');
        const animeTitle = $(items[i]).find('p.name > a').text();
        const animeCoverImg = $(items[i]).find('div.img > a > img').attr('src');
        const animeReleasedYear = $(items[i])
          .find('p.released')
          .text()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/^Released:\s*/, '');

        trendingAnimesData.push({
          id: animeId,
          title: animeTitle,
          coverImg: animeCoverImg,
          releasedYear: animeReleasedYear,
        });
      }

      return { results: trendingAnimesData };
    } catch (error) {
      throw new ForbiddenException('Failed to get trending anime');
    }
  }
}
