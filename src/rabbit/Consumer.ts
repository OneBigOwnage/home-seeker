import { connect, Channel, Connection, ConsumeMessage } from 'amqplib';

export default class ConsumerService {

    private connectionString: string;

    private connection: Connection;
    private channel: Channel;

    private last: Date | null = new Date();

    constructor(conn: string) {
        this.connectionString = conn;
    }

    async connect(queue: string): Promise<void> {
        this.connection = await connect(this.connectionString);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(queue, { durable: true });
    }

    async startConsuming(queue: string, consumerFn: (message: ConsumeMessage) => void, stopTimeout = 5000, whenDone: () => void = null): Promise<void> {
        this.channel.consume(queue, message => {
            try {
                consumerFn(message);
            } catch (error) {
                console.error('Error while processing message:\n', error);
            } finally {
                this.last = new Date();
            }
        }, { noAck: false });

        if (stopTimeout >= 1) {
            const interval = setInterval(() => {
                if ((new Date().getTime() - this.last.getTime()) > stopTimeout) {
                    clearInterval(interval);

                    console.log(`No messages have been received for ${stopTimeout}ms. Going to stop consuming.`);

                    this.disconnect();
                    whenDone();
                }
            }, stopTimeout);
        }
    }

    async disconnect(): Promise<void> {
        await this.channel.close();
        await this.connection.close();
    }

    async cleanup(queue: string): Promise<void> {
        const connection = await connect(this.connectionString);
        const channel = await connection.createChannel();

        await channel.deleteQueue(queue);

        console.log(`Queue [${queue}] has successfully been cleaned up.`);

        await channel.close();
        await connection.close();
    }
}
