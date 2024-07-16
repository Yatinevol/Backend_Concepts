import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()
    // post send a request body to the client.
    router.route("/register").post(
        // this is that step of saving on local server then uploading it on the cloudinary server.
        upload.fields({
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:2
        }),
        registerUser)


// one thing when u use default then u can the function name in other files.
export default router
