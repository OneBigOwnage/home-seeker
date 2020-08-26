export const rabbitConnectionString = () => `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;

export const SCRAPED_HOMES_QUEUE = 'SCRAPED_HOMES';
