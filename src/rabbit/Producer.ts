import { connect, Channel, Connection } from 'amqplib';

export default class ProducerService {
    private connectionString: string;

    private connection: Connection;
    private channel: Channel;

    constructor(conn: string) {
        this.connectionString = conn;
    }

    async connect(queue: string) {
        this.connection = await connect(this.connectionString);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(queue, { durable: true });
    }

    async produce(queue: string, msg: string) {
        console.log(' [x] Sending: ', msg, this.channel.sendToQueue(queue, Buffer.from(msg), { persistent: true }) ? 'SUCCESS' : 'FAILED');
    }

    async disconnect() {
        await this.channel.close();
        await this.connection.close();
    }
}
