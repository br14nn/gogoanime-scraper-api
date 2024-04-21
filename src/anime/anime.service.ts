import { ForbiddenException, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { gogoanimeUrl } from 'src/globals/urls';

@Injectable()
export class AnimeService {
  async getTrending(): Promise<IResults> {
    try {
      const res = await axios.get(`${gogoanimeUrl}/popular.html`);
      const $ = cheerio.load(res.data);

      const items = $(
        `#wrapper_bg > section > section.content_left > div > div.last_episodes > ul`,
      ).find('li');

      let trendingAnimesData: ITrendingAnimeInfo[] = [];
      for (let i = 0; i < 10; i++) {
        const id = $(items[i])
          .find('p.name > a')
          .attr('href')
          .replace('/category/', '');
        const title = $(items[i]).find('p.name > a').text();
        const coverImg = $(items[i]).find('div.img > a > img').attr('src');
        const releasedYear = $(items[i])
          .find('p.released')
          .text()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/^Released:\s*/, '');

        trendingAnimesData.push({
          id: id,
          title: title,
          coverImg: coverImg,
          releasedYear: releasedYear,
        });
      }

      return { results: trendingAnimesData };
    } catch (error) {
      throw new ForbiddenException('Failed to get trending anime');
    }
  }
}
