import * as pino from 'pino';

const Logger = pino(pino.destination('./app.log'));

export default Logger;
