import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessandRefreshTokens = async (userId) => {
        // object called user.
        const user =await  User.findById(userId)
        const accessToken   =    await  user.generateAccessToken()
        const refreshToken  =    await   user.generateRefreshToken()
        user.refreshToken = refreshToken
        // this save()function validates every field but we do not want to validate the password 
       await user.save({validBeforeSave:false})
       return {accessToken, refreshToken}

}

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
    console.log(req.body);
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
    // console.log(avatarLocalPath);

    //  const coverImageLocalPath = req.files?.coverImage[0]?.path 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is bhul gya multer")
    }

    //after uploading on cloudinary a response is send that we have stored then
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(500,"avatar file is bhul gya cloudinary")
    }

   const user =await User.create({
        fullname,
        username:username.toLowerCase(),
        email,
        coverImage:coverImage.url || "",
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

const loginUser = asyncHandler(async (req, res, next)=>{
    // req body -> data
    // username or email
    // find user
    // check password
    // send refresh and access token
    // send cookie
    const {username, email, password} = req.body
    if(!email && !username){
        throw new ApiError(400, "username or email is required.")
    }

    const user =await User.findOne({
        // mongoose provides an operators to check for both the fields once they are checked an object is returned.
        $or : [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404,"User does not exist.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id)
    
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }
    res
    .status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,

            {
                user:loggedInUser,accessToken,refreshToken
            },
            
            "User logged In successfully!"
        )
    )
})    

const logoutUser = asyncHandler(async (req, res)=>{
    // to logout u just need to delete accesstoken and refreshtoken from the user and database.
    // first thing is that u do not have user so u cannot access user._id feature here to delete the access token . so do that we first need to create a middleware.
       await User.findByIdAndUpdate(
            req.user._id,
            {
                // now we get an operator from mongoose:
                $set:{
                    refreshToken:undefined
                }
            },
            {
                new : true 
            }
        )

        const options = {
            httpOnly:true,
            secure:true
        }

        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out successfully!!"))


})

const refreshAccessToken  = asyncHandler(async(req,res)=>{
   try {
    // incoming token is from the user.
     const incomingrefreshToken = req.cookies?.refreshToken  || req.body.refreshToken;
     if(!incomingrefreshToken){
        throw new ApiError(401, "unauthorized request")
     }
 
     const decodedincomingToken = jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
     const user = await User.findById(decodedincomingToken._id).select("-password -refreshToken")

     if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }
 
     if (incomingrefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
            
 
     const {accessToken,NewrefreshToken} = await generateAccessandRefreshTokens(user.id);
 
     
     const options ={
         httpOnly:true,
         secure:true
     }
 
     res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refresToken",NewrefreshToken,options)
     .json(200,{
                 accessToken,
                 "refreshToken":NewrefreshToken
     })
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
   }

})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    //we are already logged in so we know that we saved user on the req so we will access the user directly here:
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) throw new ApiError(400,"inavalid old password");

    // here only value is set but not saved in the use database:
    user.password = newPassword;
    // saving on the database:
     await user.save({validateBeforeSave: false})

    return res.status(200)
    .json( new ApiResponse(200,{},"Your password is updated successfully!!"))


   
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User fetched successfully!"))
})

const updateAccountDetails =asyncHandler(async(req,res)=>{
    const {fullname, email} =req.body;

    if(!fullname && !email){
        throw new ApiError("username or email is required!")
    }

        /*
    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError("something went wrong!")

    }

        there is this and also one more way to do this is findByIdandUpdate
        user.fullname = fullname;
        user.email = email;
    */

    const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {   
            // this will  return the new updated object
            new:true
        }
        ).select("-password")

    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
}) 

const updateUserAvatar= asyncHandler(async (req, res)=>{
    // const newAvatarPath= req.files?.avatar[0]?.path
    const newAvatarPath = req.file?.path

    if(!newAvatarPath){
        throw new ApiError(400,"avatar file is missing ")
    }

    const avatar  = await uploadOnCloudinary(newAvatarPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(200,{user},"avatar changed successfully!")

})

const updateUserCoverImage= asyncHandler(async (req, res)=>{
    // const newAvatarPath= req.files?.avatar[0]?.path
    const newcoverImagePath = req.file?.path

    if(!newcoverImagePath){
        throw new ApiError(400,"coverImage file is missing ")
    }

    const coverImage  = await uploadOnCloudinary(newcoverImagePath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(200,{user},"coverImage changed successfully!")

})

const getUserChannelProfile  = asyncHandler(async (req, res)=>{
    // take  username from the url.
    const {username} = req.params  
    if(!username?.trim()){
        throw new ApiError(400,"username missing")
    }

    const channel = await User.aggregate([{
        // first matching the username from the url with the database
        $match:{
            username:username?.toLowerCase()
        }
    },
    {
        $lookup:{
            // this step is to connect this model/document with all other types of document.
            // name of the  document with which u want to connect.
            from:"subscriptions",
            // start point in the local document from which u want to connect.
            localField:"_id",
            // foreign point in the foreign document with which u want to connect
            foreignField:"channel",
            // name of your field
            as:"subscribers"
        }
    },{
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            // so we are checking in how many subscriber field this user id is found , that's how we will find no of channels subscribed  by this user.
            foreignField:"subscriber",
            as:"subscribedTo"
        }
    },{
        // now our target is to add these  fields to the user data model.
        $addFields:{
            subscribersCount:{
            // subscriber is an array that is holding all the user which are found in the subscriber field  and we are just getting the size of it.
            $size:"$subscribers"
            },
            channelsSubscribedToCount:{
                $size:"$subscribedTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }   
        }
    },
    {
        $project:{
            fullname:1,
            username:1,
            email:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1
        }
    }])

    // try to console log channel to see what aggregate returns

    if(!channel?.length){
        throw new ApiError(404,"channel does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"User channel is fetched successfully"))
})

const getwatchHistory = asyncHandler(async (req, res)=>{
        /*one way we learnt : to get user from the url:
        const {username} = req.params
        or
        req.user._id
        this returns a string of the id ; it is not the actual id of the document
        */
         const {username} = req.params;
         if(!username?.trim()){
            throw new ApiError(400,"user does not exist")
         }

        
       const user = await User.aggregate([{
        $match:{
                // actual way to find the document id.

            username: username?.toLowerCase()
        }
       },{
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[{
                            $project:{
                                fullname:1,
                                username:1,
                                avatar:1
                            }
                        }]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            // first returns an object  from an array 
                            $first: "$owner"
                        }
                    }
                }

            ]
        }
       }])

       return res
       .status(200)
       .json(200,user[0].watchHistory,"watch history fetched successfully!!")

    
})


export { registerUser, loginUser, logoutUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getwatchHistory }