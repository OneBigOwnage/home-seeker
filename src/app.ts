import * as dotenv from 'dotenv';
import { program } from 'commander';

import Producer from './rabbit/Producer';
import Consumer from './rabbit/Consumer';

import scrape from './commands/Scrape';
import filter from './commands/Filter';
import register from './commands/Register';
import experiment from './commands/Experiment';

dotenv.config();

const connectionString = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;

const exampleQueue = 'my-first-queue';

program
    .command('scrape')
    .description('Scrapes the web, saving all relevant information')
    .action(scrape);

program
    .command('consume')
    .action(async () => {
        const consumer = new Consumer(connectionString);

        await consumer.connect(exampleQueue);
        consumer.startConsuming(exampleQueue, console.log);
    });

program
    .command('produce')
    .action(async () => {
        const producer = new Producer(connectionString);

        await producer.connect(exampleQueue);

        await producer.produce(exampleQueue, JSON.stringify({
            key: 'value'
        }));

        producer.disconnect();
    });

program
    .command('experiment')
    .action(experiment);

program
    .command('filter')
    .description('Process the scraped data and filter out any duplicates')
    .action(filter);


program
    .command('notify')
    .description('Notify all users of home status updates')
    .action(async () => {
        // For every state-change that's consumed from bus
        // Notify all users of the state-change via WhatsApp.
    });


program
    .command('register <name> <phone>')
    .description('Add a new user to the app by name and phone number.')
    .action(register);


program.parse(process.argv);
