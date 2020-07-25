import * as puppeteer from 'puppeteer';
import WoongoedMakelaarsFetcher from './services/WoongoedMakelaarsFetcher';
import * as dotenv from 'dotenv';
import WhatsApp from './services/WhatsApp';

dotenv.config();


(async () => {
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const wgmFetcher = new WoongoedMakelaarsFetcher();
        const homes = await wgmFetcher.homes(browser);
        const whatsapp = new WhatsApp();

        for (let i = 0; i < homes.length; i++) {
            const house = homes[i];

            await whatsapp.message(`We found a new house with status [${house.status}]: ${house.address}.\nThe house is listed for ${house.price}.\nFind out more at: ${house.url}`);

            break;
        }

        await browser.close();
    } catch (error) {
        console.error('An error ocurred. More info below:\n\n', error);
    }
})();
