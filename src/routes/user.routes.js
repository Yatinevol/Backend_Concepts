import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
    // post send a request body to the client.
    router.route("/register").post(
        // this is that step of saving on local server then uploading it on the cloudinary server.
        upload.fields([{
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:2
        }]),
        registerUser)
    
        // secure routes
    router.route("/login").post( loginUser )    
    router.route("/logout").post( verifyJWT, logoutUser )
    router.route("/refresh-token").post(refreshAccessToken)

// one thing when u use default then u can the function name in other files.
export default router
