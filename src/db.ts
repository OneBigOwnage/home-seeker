import User from "./entities/User";
import Realtor from "./entities/Realtor";
import Home from "./entities/Home";
import { ConnectionOptions, createConnection, Connection } from "typeorm";
import HomeStatus from "./entities/HomeStatus";

export const dbOpts: ConnectionOptions = {
    type: 'mysql',
    host: 'db',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'db',
    entities: [User, Realtor, Home, HomeStatus],
};

let connection: Connection;

const database = async () => {
    if (connection) {
        return connection;
    }

    return connection = await createConnection(dbOpts);
}

export default database;
