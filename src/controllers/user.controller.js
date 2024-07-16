import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res,next)=>{
    // take data from the user along with the field
    // validation of fields - no empty
    // check if the user already exists: email, username
    // check for the images and avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // a response is send once everything is stored in the db
    // now remove password and refresh token from the response.
    // now check if the user is created finally or not.
    // return response.
    // i am saying that whata ever is given in these field extract that data.
    // this is Destructuring in JavaScript; is a way to extract values from arrays or properties from objects into distinct variables
    const {fullname,username,password, email} = req.body
    // doing this I can receive data .But to receive any file(img,pdf) step is different.
    console.log("email:",email);

    if([fullname,username, email,password].some((field)=>{
        field?.trim()=== ""
    })
     )   {
            throw new ApiError(400,"All fields are required!")
    }

    
    const registeredUser=await  User.findOne({
        $or:[{ email },{ username }]
    })
    if(registeredUser){
        throw new ApiError(409,"User with email or username already exists.")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
     const coverImageLocalPath = req.files?.coverImage[0]?.path 

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }

    //after uploading on cloudinary a response is send that we have stored then
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(500,"avatar file is required")
    }

   const user =await User.create({
        fullname,
        username:username.toLowerCase(),
        email,
        coverImage:coverImage.url,
        avatar:avatar.url,
        password

    })

    // now to check if the user was created: and deleting password and refreshToken
        const createdUser=   await User.findOne(user._id).select("-password -refreshToken")

        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering a user.")
        }

        return res.status(200).json(
            new ApiResponse(200,createdUser,"User registered successfully!")
        )

})

    

export {registerUser}