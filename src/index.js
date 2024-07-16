// to enable this import syntax of dotenv in index.js we have added command in script(in package.json) of this file using experimental feature.
import dotenv from "dotenv"
dotenv.config({path:'./env'})
import connectDB from "./db/index.js"
import {app} from "./app.js"

connectDB()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed !!!",error);  
})










// Approach 1:
/*
const app = express()
// now connecting our Db:
// ifies is way to define and directly call ur function(function is defined here)()
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODM_URI}/${DB_NAME}`)
        console.log("your DB is connected successfully!!");
        // using a listener of express to check if the app is running.
        app.on("error",(error)=>{
                console.log("error :"+error);
                throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log("Your app is running on port 8000");
        })
    } catch (error) {
        console.log("Error:",error);
        throw error;

    }
    
})()
*/