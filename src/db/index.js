import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB is Connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("ERORR: connectdb:",error);
    }
}

export default connectDB