import * as twilio from 'twilio';
import TwilioClient = require('twilio/lib/rest/Twilio');
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

export default class WhatsApp {
    private client: TwilioClient;

    constructor() {
        this.client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    public message(body: string): Promise<MessageInstance> {
        return this.client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER_FROM,
            to: process.env.TWILIO_PHONE_NUMBER_TO,
            body,
        });
    }
}
