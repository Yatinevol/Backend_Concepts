import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getwatchHistory } from "../controllers/user.controller.js";
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
    router.route("/change-password").post(verifyJWT,changeCurrentPassword)
    router.route("/current-user").get(verifyJWT,getCurrentUser)
    // for changing single fields use patch route()
    router.route("/update-account").patch(verifyJWT,updateAccountDetails)
    router.route("/change-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
    router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
    // in channel we are taking username from the url so we cannot use post
    router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
    router.route("/history").get(verifyJWT, getwatchHistory)
    

// one thing when u use default then u can the function name in other files.
export default router
