import { ForbiddenException, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { gogoanimeUrl } from 'src/globals/urls';

@Injectable()
export class AnimeService {
  async getGenres(id: string): Promise<any[]> {
    try {
      const res = await axios.get(`${gogoanimeUrl}/category/${id}`);
      const $ = cheerio.load(res.data);

      return ['Genres List'];
    } catch (error) {
      throw new ForbiddenException(`Failed to get genres of this anime: ${id}`);
    }
  }

  async getTrending(): Promise<IResults> {
    let trendingAnimesData: ITrendingAnimeInfo[] = [];
    try {
      const res = await axios.get(`${gogoanimeUrl}/popular.html`);
      const $ = cheerio.load(res.data);

      const items = $(
        `#wrapper_bg > section > section.content_left > div > div.last_episodes > ul`,
      ).find('li');
      // .map((i, elem) => {
      //   if (i < 10) {
      //     const title = $(elem).find('p.name > a').text();
      //     const id = $(elem)
      //       .find('p.name > a')
      //       .attr('href')
      //       .replace('/category/', '');
      //     const coverImg = $(elem).find('div.img > a > img').attr('src');
      //     const releasedYear = $(elem)
      //       .find('p.released')
      //       .text()
      //       .trim()
      //       .replace(/\s+/g, ' ')
      //       .replace(/^Released:\s*/, '');
      //   }
      // });

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
          genres: [],
        });
      }

      return { results: trendingAnimesData };
    } catch (error) {
      throw new ForbiddenException('Failed to get trending anime');
    }
  }
}
