import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// we can give reference to a Database connection.
const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODM_URI}/${DB_NAME}`)
        // console.log(connectionInstance);
        console.log(`MONGODB connected Successfully !! ${connectionInstance.connection.host}` );
    } catch (error) {
        console.log("MONGODB connection failed: ",error);
        // earlier we have used throw but we can also use:
        process.exit(1);
    }


}

export default connectDB
