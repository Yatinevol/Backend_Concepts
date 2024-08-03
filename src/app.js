import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"10kb",extended: true}))
app.use(express.static("public"))
// to store secure cookies on the server:
app.use(cookieParser())


// import router
import userRouter from "./routes/user.routes.js"
import videRouter from "./routes/video.routes.js"
import playlistRouter from "./routes/playlist.routes.js"

// routes declaration will be done by app.use, not by .get because when u use app.get then u are giving the routes and using router at the same time but when ur importing router then u have to use app.use || ab yahan par hoga kya userRouter apko leh jaega user.routes.js file mae or bolega apko mae control deta hun yahan par or bataeyae ab kya karen.
// when u type this ur "/api/v1/user" this thing becomes prefix/next whatever route u have given on in user.routes.js
app.use("/api/v1/user",userRouter)
app.use("/api/v1/videos",videRouter)
app.use("/api/v1/playlist",playlistRouter)



export {app}