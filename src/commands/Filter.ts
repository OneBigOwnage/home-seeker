import ConsumerService from "../rabbit/Consumer";
import database from "../db";
import Home from "../entities/Home";
import Realtor from "../entities/Realtor";
import ScrapedHome from '../contracts/HomeInformation';
import { performance } from "perf_hooks";
import { QueryFailedError } from "typeorm";

const scrapedHomesQueue = 'SCRAPED_HOMES';

const connectionString = () => `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;

const filter = async () => {
    const consumer = new ConsumerService(connectionString());

    await consumer.connect(scrapedHomesQueue);
    const connection = await database();

    consumer.startConsuming(scrapedHomesQueue, async message => {
        // console.log(performance.now());

        // return;
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

        // console.log(queryResults, count, count >= 1);

        // process.exit(1);

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
