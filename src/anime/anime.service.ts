import { ForbiddenException, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { gogoanimeUrl } from 'src/globals/urls';
import puppeteer from 'puppeteer';

@Injectable()
export class AnimeService {
  async watchAnime(episodeId: string): Promise<any> {
    try {
      const res = await axios.get(`${gogoanimeUrl}/${episodeId}`);
      const $ = cheerio.load(res.data);

      const donwloadLink = $(
        `#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.download-anime > div > ul > li.dowloads > a`,
      ).attr(`href`);

      const browser = await puppeteer.launch({ headless: 'shell' });
      const page = await browser.newPage();
      await page.goto(donwloadLink, { waitUntil: 'domcontentloaded' });

      const streamLinkItems = await page.waitForSelector(
        `xpath/html/body/section/div/div[2]/div/div[4]/div[1]`,
      );
      const streamLinkItemsLength = await streamLinkItems.evaluate(
        (el) => el.children.length - 2,
      );

      let streamUrls: any[] = [];
      for (let i = 1; i <= streamLinkItemsLength; i++) {
        const streamUrlElement = await page.waitForSelector(
          `xpath/html/body/section/div/div[2]/div/div[4]/div[1]/div[${i}]/a`,
        );
        const streamUrl = await streamUrlElement.evaluate(
          (el: HTMLAnchorElement) => el.href,
        );
        const streamQuality = await streamUrlElement.evaluate((el) =>
          el.textContent.match(/\b(?:360|480|720|1080)P\b/),
        );

        streamUrls.push({
          streamUrl: streamUrl,
          quality: streamQuality[0],
        });
      }

      await browser.close();

      return { results: streamUrls };
    } catch (error) {
      console.error(error);

      throw new ForbiddenException(
        `Failed to get streaming links of this episode: ${episodeId}`,
      );
    }
  }

  async searchAnime(keyword: string, page: string): Promise<IResults> {
    try {
      const res = await axios.get(
        `${gogoanimeUrl}/search.html?keyword=${keyword}&page=${page}`,
      );
      const $ = cheerio.load(res.data);

      const hasNextPage = $(
        `#wrapper_bg > section > section.content_left > div > div.anime_name.new_series > div > div > ul`,
      )
        .find(`li.selected`)
        .next()
        .text();
      const animeSearchResults: any[] = [];
      $(
        `#wrapper_bg > section > section.content_left > div > div.last_episodes > ul`,
      )
        .find(`li`)
        .map((i, elem) => {
          const animeId = $(elem)
            .find(`p.name > a`)
            .attr('href')
            .replace('/category/', '');
          const animeTitle = $(elem).find(`p.name > a`).attr('title');
          const animeReleasedYear = $(elem)
            .find(`p.released`)
            .text()
            .replace(/\n|\t|Released:|\s+/g, '');
          const animeCoverImg = $(elem).find(`div.img > a > img`).attr(`src`);

          animeSearchResults.push({
            id: animeId,
            title: animeTitle,
            releasedYear: animeReleasedYear,
            coverImg: animeCoverImg,
          });
        });

      if (animeSearchResults.length == 0) throw Error();

      return {
        results: {
          hasNextPage: hasNextPage == '' ? false : true,
          data: animeSearchResults,
        },
      };
    } catch (error) {
      throw new ForbiddenException(
        `No results found with your search: ${keyword}`,
      );
    }
  }

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
      const animeTotalEpisodes = $(`#episode_page > li:last-child`)
        .find(`a`)
        .attr('ep_end');

      return {
        results: {
          id: id,
          title: animeTitle,
          type: animeType,
          plotSummary: animePlotSummary,
          genres: animeGenres,
          releasedYear: animeReleasedYear,
          status: animeStatus,
          totalEpisodes: animeTotalEpisodes,
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
