import * as puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import * as Redis from 'async-redis';


import WhatsApp from './services/WhatsApp';
import Maps from './services/Maps';
import WoongoedMakelaarsFetcher from './services/WoongoedMakelaarsFetcher';

dotenv.config();


// const redis = Redis.createClient({ host: 'redis' });

// redis.on('error', console.error);

// redis.set('foo', 'bar');
// redis.get('foo', Redis.print);

// redis.quit();



(async () => {
    const maps = new Maps(process.env.GCP_API_KEY);
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const fetcher = new WoongoedMakelaarsFetcher(browser, maps);

    console.log(await fetcher.homes());

    await browser.close();
})();


// (async () => {
//     const maps = new Maps(process.env.GCP_API_KEY);
//     let placeID = await maps.findPlaceID('D albert schweitzer straat 18 Bergambacht');

//     console.log(await maps.placeIDToAddress(placeID));
// })();




// (async () => {
//     try {
//         const browser = await puppeteer.launch({
//             args: ['--no-sandbox', '--disable-setuid-sandbox']
//         });

//         const wgmFetcher = new WoongoedMakelaarsFetcher();
//         const homes = await wgmFetcher.homes(browser);
//         const whatsapp = new WhatsApp();

//         for (let i = 0; i < homes.length; i++) {
//             const house = homes[i];

//             await whatsapp.message(`We found a new house with status [${house.status}]: ${house.address}.\nThe house is listed for ${house.price}.\nFind out more at: ${house.url}`);

//             break;
//         }

//         await browser.close();
//     } catch (error) {
//         console.error('An error ocurred. More info below:\n\n', error);
//     }
// })();
