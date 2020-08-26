import ConsumerService from "../rabbit/Consumer";
import database from "../db";
import Home from "../entities/Home";
import Realtor from "../entities/Realtor";
import ScrapedHome from '../contracts/HomeInformation';
import { QueryFailedError } from "typeorm";
import { rabbitConnectionString, SCRAPED_HOMES_QUEUE } from "../constants";

const filter = async () => {
    const consumer = new ConsumerService(rabbitConnectionString());

    await consumer.connect(SCRAPED_HOMES_QUEUE);
    const connection = await database();

    consumer.startConsuming(SCRAPED_HOMES_QUEUE, async message => {

        const scrapedHome = JSON.parse(message.content.toString()) as ScrapedHome;

        const exists: boolean = await Home.count({
            where: { googlePlaceID: scrapedHome.googlePlaceID }
        }) >= 1;

        if (exists) {
            console.log(' [x] Home already present:', [scrapedHome.street, scrapedHome.number, scrapedHome.city].join(' '));
            return;
        }

        let realtor: Realtor;

        const [queryResults, count] = await Realtor.findAndCount({
            where: { name: scrapedHome.realtor }
        });

        if (count >= 1) {
            realtor = queryResults.pop();
        } else {
            try {
                realtor = await Realtor.create({ name: scrapedHome.realtor }).save();
                console.log(`Created realtor: ${realtor.name}`);
            } catch (error) {
                console.log('Wanted to create realtor, but it already exists.');

                realtor = await Realtor.findOne({
                    where: { name: scrapedHome.realtor }
                });

                console.log('The realtor that was found instead of created:', realtor);
            }
        }

        await Home.create({
            googlePlaceID: scrapedHome.googlePlaceID,
            street: scrapedHome.street,
            number: scrapedHome.number,
            city: scrapedHome.city,
            zipcode: scrapedHome.zipcode,
            price: scrapedHome.price,
            priceType: scrapedHome.priceType,
            currentStatus: scrapedHome.status,
            url: scrapedHome.url,
            realtor: realtor,
        }).save();

        console.log('Stored a new home:', [scrapedHome.street, scrapedHome.number, scrapedHome.city].join(' '));

    }, 5000, () => connection.close());


    // For every home that's consumed from bus
    //     check if it exists
    //        False:
    //            Insert home + first status in DB
    //        True:
    //            Check if different status
    //                True:
    //                    Register state-change in DB
    //                    Put state-change on bus.
    //                False:
    //                    NoOp

};


export default filter;
