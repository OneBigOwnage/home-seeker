import { Browser } from "puppeteer";
import HomeInformation from "./HomeInformation";

export default interface HomeFetcher {
    homes(browser: Browser): Promise<Array<HomeInformation>>;
}
