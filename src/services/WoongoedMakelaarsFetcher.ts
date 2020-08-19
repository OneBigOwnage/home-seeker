import { Browser } from "puppeteer";
import Maps from "./Maps";
import { Realtor } from "../enums/Realtor";
import HomeFetcher from "../contracts/HomeFetcher";
import Home from "../contracts/HomeInformation";
import { StatusType } from "../enums/StatusType";

interface LegacyHomeInformation {
    address: string;
    price: string;
    status: StatusType;
    url: string;
    realtor: Realtor;
}

export default class WoongoedMakelaarsFetcher implements HomeFetcher {

    private maps: Maps;
    private browser: Browser;
    readonly url = 'https://www.woongoedmakelaars.nl/aanbod/woningaanbod/KRIMPEN%20AAN%20DEN%20IJSSEL/-325000/koop/provincie-Zuid-Holland/';

    constructor(browser: Browser, maps: Maps) {
        this.browser = browser;
        this.maps = maps;
    }

    public async homes(): Promise<Array<Home>> {
        return this.enrich(
            await this.scrapeHomes()
        );
    }

    private async scrapeHomes(): Promise<Array<LegacyHomeInformation>> {
        const page = await this.browser.newPage();

        let nextPageURL: string | null = this.url;

        let homes: Array<LegacyHomeInformation> = [];

        while (nextPageURL !== null) {
            await page.goto(nextPageURL);

            const homesOnCurrentPage: Array<LegacyHomeInformation> = await page.evaluate(this.getHomesFromPage);

            homes = homes.concat(homesOnCurrentPage.map(home => {
                home.status = this.parseStatus(home.status);

                return home;
            }));

            nextPageURL = await page.evaluate(() => {
                const nextButton: HTMLAnchorElement | null = document.querySelector('.next-page a');

                if (!nextButton) {
                    return null;
                }

                return nextButton.href;
            });
        }

        await page.close();

        return homes;
    }

    private getHomesFromPage(): Array<LegacyHomeInformation> {
        return Array.from(document.querySelectorAll('.detailvak'))
            .map(element => {
                const banner = element.querySelector('.objectstatusbanner')

                let status: string | StatusType;

                if (banner && banner.textContent) {
                    status = banner.textContent.trim();
                } else {
                    status = 'Unknown';
                }

                const address = [
                    element.querySelector('.street-address').textContent.trim(),
                    element.querySelector('.postal-code').textContent.trim(),
                    element.querySelector('.locality').textContent.trim(),
                ].join(' ');

                const home: LegacyHomeInformation = {
                    address,
                    price: element.querySelector('.price .kenmerkValue').textContent.trim(),
                    status: status as any,
                    url: (element.querySelector('.aanbodEntryLink') as HTMLAnchorElement).href,
                    realtor: 'WoongoedMakelaars',
                };

                return home;
            });
    }

    private parseStatus(statusText: string): StatusType {
        if (statusText === 'Te koop' || statusText === 'Nieuw') {
            return 'Available';
        } else if (statusText === 'Verkocht o.v.') {
            return 'SoldWithReservation';
        } else if (statusText === 'Verkocht') {
            return 'Sold';
        } else if (statusText === 'Onder bod') {
            return 'BeingNegotiated';
        } else {
            return 'Unknown';
        }
    }

    private async enrich(toEnrich: Array<LegacyHomeInformation>): Promise<Array<Home>> {
        const enriched: Array<Home> = [];

        for (const listing of toEnrich) {
            const address = await this.maps.findAddress(listing.address);

            enriched.push(Object.assign(new Home(), {
                googlePlaceID: address.googlePlaceID,
                street: address.street,
                number: address.number,
                city: address.city,
                zipcode: address.zipcode,
                price: listing.price,
                status: listing.status,
                previousStatusses: [],
                url: listing.url,
                realtor: 'WoongoedMakelaars',
            }));
        }

        return enriched;
    }
}
