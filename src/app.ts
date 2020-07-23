import * as puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto('https://www.woongoedmakelaars.nl/aanbod/woningaanbod/KRIMPEN%20AAN%20DEN%20IJSSEL/provincie-Zuid-Holland/');


})();
