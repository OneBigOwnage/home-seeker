import User from "./entities/User";
import Realtor from "./entities/Realtor";
import Home from "./entities/Home";
import { ConnectionOptions, createConnection } from "typeorm";

export const dbOpts: ConnectionOptions = {
    type: 'mysql',
    host: 'db',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'db',
    entities: [ User, Realtor, Home ]
};

const database = async () => createConnection(dbOpts);


export default database;
