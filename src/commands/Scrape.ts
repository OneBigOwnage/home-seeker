import { createClient } from "async-redis";
import Maps from "../services/Maps";
import { Client } from "@googlemaps/google-maps-services-js";
import * as puppeteer from 'puppeteer';
import ProducerService from "../rabbit/Producer";
import WoongoedMakelaarsFetcher from "../services/WoongoedMakelaarsFetcher";

const connectionString = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;
const scrapedHomesQueue = 'SCRAPED_HOMES';

const scrape = async () => {
    const redis = createClient({ host: 'redis' });
    const maps = new Maps(new Client(), redis, process.env.GCP_API_KEY)
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const producer = new ProducerService(connectionString);

    const fetcher = new WoongoedMakelaarsFetcher(browser, maps);

    const homes = await fetcher.homes();

    await producer.connect(scrapedHomesQueue);

    homes.forEach(async home => await producer.produce(scrapedHomesQueue, JSON.stringify(home)));

    producer.disconnect();

    browser.close();
    redis.quit();
};

export default scrape;
