import { Browser } from "puppeteer";
import HomeInformation from "src/contracts/HomeInformation";
import HomeFetcher from 'src/contracts/HomeFetcher';
import Status from "src/enums/Status";
import Realtor from "src/enums/Realtor";

export default class WoongoedMakelaarsFetcher implements HomeFetcher {
    async homes(browser: Browser): Promise<Array<HomeInformation>> {
        const page = await browser.newPage();

        let nextPageURL: string|null = 'https://www.woongoedmakelaars.nl/aanbod/woningaanbod/KRIMPEN%20AAN%20DEN%20IJSSEL/-325000/koop/provincie-Zuid-Holland/';

        let homes: Array<HomeInformation> = [];

        while (nextPageURL) {
            await page.goto(nextPageURL);

            const homesOnCurrentPage: Array<HomeInformation> = await page.evaluate(this.getHomesFromPage);

            homes = homes.concat(homesOnCurrentPage.map(home => {
                home.status = this.parseStatus(home.status);

                return home;
            }));

            nextPageURL = await page.evaluate(() => {
                const nextButton: HTMLAnchorElement|null = document.querySelector('.next-page a');

                if (!nextButton) {
                    return null;
                }

                return nextButton.href;
            });
        }

        await page.close();

        return homes;
    }

    getHomesFromPage(): Array<HomeInformation> {
        return Array.from(document.querySelectorAll('.detailvak'))
        .map(element => {
            const banner = element.querySelector('.objectstatusbanner')

            if (banner && banner.textContent) {
                status = banner.textContent.trim();
            }

            const home: HomeInformation = {
                address: element.querySelector('.street-address').textContent.trim(),
                price: element.querySelector('.price .kenmerkValue').textContent.trim(),
                status: status as any,
                url: (element.querySelector('.aanbodEntryLink') as HTMLAnchorElement).href,
                realtor: Realtor.WoongoedMakelaars,
            };

            return home;
        });
    }

    parseStatus(statusText: string | null): Status {
        if (!statusText) {
            return Status.Unknown;
        } else if (statusText === 'Te koop' || statusText === 'Nieuw') {
            return Status.Available;
        } else if (statusText === 'Verkocht o.v.') {
            return Status.SoldWithReservation;
        } else if (statusText === 'Verkocht') {
            return Status.Sold;
        } else if (statusText === 'Onder bod') {
            return Status.UnderOffer;
        }
    }
}
