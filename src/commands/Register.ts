import database from "../db";
import User from "../entities/User";


const register = async (name: string, phoneNumber: string) => {
    const connection = await database();

    const user = User.create({
        name, phoneNumber
    });

    await user.save();

    console.info(`User ${name} successfully registered!`);

    connection.close();
};

export default register;
