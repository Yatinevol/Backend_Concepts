import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({limit:"10kb",extended: true}))
app.use(express.static("public"))
// to store secure cookies on the server:
app.use(cookieParser())

