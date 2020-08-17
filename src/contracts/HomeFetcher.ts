import { Browser } from "puppeteer";
import Home from "./HomeInformation";

export default interface HomeFetcher {
    homes(browser: Browser): Promise<Array<Home>>;
}
