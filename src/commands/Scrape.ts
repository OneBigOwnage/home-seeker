import { createClient } from "async-redis";
import Maps from "../services/Maps";
import { Client } from "@googlemaps/google-maps-services-js";
import * as puppeteer from 'puppeteer';
import ProducerService from "../rabbit/Producer";
import WoongoedMakelaarsFetcher from "../services/WoongoedMakelaarsFetcher";
import { rabbitConnectionString, SCRAPED_HOMES_QUEUE } from "../constants";

const scrape = async () => {
    const redis = createClient({ host: 'redis' });
    const maps = new Maps(new Client(), redis, process.env.GCP_API_KEY)
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const producer = new ProducerService(rabbitConnectionString());

    const fetcher = new WoongoedMakelaarsFetcher(browser, maps);

    const homes = await fetcher.homes();

    await producer.connect(SCRAPED_HOMES_QUEUE);

    homes.forEach(async home => await producer.produce(SCRAPED_HOMES_QUEUE, JSON.stringify(home)));

    producer.disconnect();

    browser.close();
    redis.quit();
};

export default scrape;
