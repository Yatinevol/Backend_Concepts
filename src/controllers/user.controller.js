import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"


const registerUser = asyncHandler(async(req,res,next)=>{
    // take data from the user
    // validation of fields - no empty
    // check if the user already exists: email, username
    // check for the images and avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // a response is send once everything is stored in the db
    // now remove password and refresh token from the response.
    // now check if the user is created finally or not.
    const {fullname,username, email,avatar} = req.body
    // doing this I can receive data .But to receive any file(img,pdf) step is different.
    console.log("email:",email);

    if([fullname,username, email,avatar].some((field)=>{
        field?.trim()=== ""
    })
    )   {
            throw new ApiError(400,"All fields are required!")
    }

    
  const registerUser=  User.findOne({
        $or:[{ email },{ username }]
    })
    if(registerUser){
        throw new ApiError(409,"User with email or username already exists.")
    }
})

export {registerUser}