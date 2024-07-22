import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if(!title || !description){
        throw new ApiError(400,"title or description is required")
    }
    // TODO: get video, upload to cloudinary, create video
    const videoPath = req.files?.videoFile[0]?.path
    const thumbnailPath= req.files?.thumbnail[0]?.path

    if(!videoPath){
        throw new ApiError(400,"video file is missing to upload")
    }
    if(!thumbnailPath){
        throw new ApiError(400,"thumbnail file is missing to upload")
    }

    // now u got the video file just upload it on the cloudinary server and take a response.
    const videoFile = await uploadOnCloudinary(videoPath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!videoFile.url || thumbnail.url){
        throw new ApiError(500,"error while uploading your file")
    }

    // this is where we first create our database document.
    const video = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title:title,
        description:description,
        duration:videoFile.duration,
        owner:req.user._id,
        isPublished:true


    })

    return res.status(200)
    .json(200,video,"successfully created video document in database!")

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video not found!")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }

    return res.status(200)
    .json(new ApiResponse(200,video,"successfully found video using video id"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}