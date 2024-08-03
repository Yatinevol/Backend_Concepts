import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { application } from "express"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipAmt = (pageNum - 1) * limitNum;
    const filter= {}
    if(query){
          // this object is searching for that query(yah wo string jo tumne search ke lea likhi hai)
    // regex is an operator provided by mongoose to search the query along the field
    filter.title = {$regex: query, $options:"i"}
    }
    
    if(userId){

    filter.userId = userId
    }
    // BUILD SORT CRITERIA
    const sort = {};
    sort[sortBy] = sortType === 'desc' ? -1 : 1;

    try {
        // finding all the video with filter, sort and pagination
        const videos = await Video.find(filter) 
        .sort(sort)
        .skip(skipAmt)
        .limit(limitNum)
        
    if(!videos){
        throw new ApiError(400,"No video found")
    }

    // Get total count of videos for pagination
    const totalVideos = await Video.countDocuments(filter);

    // Prepare pagination info
     const pagination = {
        currentPage: pageNum,
        totalPages: Math.ceil(totalVideos / limitNum),
        totalVideos
    };

    return res.status(200).json(new ApiResponse(200, { videos, pagination }, "Videos retrieved successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }

})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description} = req.body

    if(!title || !description){
        throw new ApiError(400,"title or description is required")
    }
    const videoPath = req.files?.videoFile[0]?.path
    const thumbnailPath= req.files?.thumbnail[0]?.path

    console.log(videoPath);
    // console.log(thumbnailPath);
    if(!videoPath){
        throw new ApiError(400,"video file is missing to upload")
    }
    if(!thumbnailPath){
        throw new ApiError(400,"thumbnail file is missing to upload")
    }

    // now u got the video file just upload it on the cloudinary server and take a response.
    const videoFile2 = await uploadOnCloudinary(videoPath)
    console.log(videoFile2);
    const thumbnail2 = await uploadOnCloudinary(thumbnailPath)

    if(!videoFile2){
        throw new ApiError(500,"error while uploading your file")
    }
    if(!thumbnail2){
        throw new ApiError(502,"error while uploading your thumbnail")
    }

    // this is where we first create our database document.
    const video = await Video.create({
        videoFile:videoFile2.url,
        thumbnail:thumbnail2.url || "",
        title:title,
        description:description,
        duration:videoFile2.duration,
        owner:req.user._id,
        isPublished:true


    })

    return res.status(200)
    .json( new ApiResponse(200,video,"successfully created video document in database!"))

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
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId not found")
    }
    const {title, description} = req.body

    if(!title){
        throw new ApiError(400,"give a title to your video to update")
    }
    if(!description){
        throw new ApiError(400,"cannot find updated description")
    }
    const updatethumbPath = video.file?.thumbnail?.path

    if(!updatethumbPath){
        throw new ApiError(500,"there was error while receiving your file")
    }

    const thumbnail = await uploadOnCloudinary(updatethumbPath)

    if(!thumbnail){
        throw new ApiError(500, "there was error while uploading the file")
    }


    const video = await Video.findByIdAndUpdate(
        videoId
    ,
    {
      $set:{
            title:title,
            description:description,
            thumbnail:thumbnail.url 
      } 
    },{
        new:true
    })

    if(!video){
        throw new ApiError(400,"video not found")
    }

    return res.status(200)
    .json(200,video, "successfully updated your video details!!")

})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"videoId not found")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(500,"Error while deleting your file")
    }
    /*
    const video = await Video.findByIdAndUpdate(videoId,{
        $unset:{
            videoId:1
        }
    },{
        new:true
    })
    */
 /*firstly we will delete this file from the cloudinary, preventing orphaned files or database entries. 
    Also video.url === video.videoFile */
    // helper function:
    function extractFileNameFromUrl(url){
         // Split the URL by the '/' character to get the individual parts of the URL
        const partsArr = url.split('/')

        // Get the last part of the URL which contains the public ID with the file extension
        const lastPart = partsArr[partsArr.length - 1]

        // Split the public ID with the file extension by the '.' character to remove the extension
        const lastPartArrFirstElement = lastPart.split('.')[0]


        return lastPartArrFirstElement
    }

    if(video.videoFile){
        const videoFileName = extractFileNameFromUrl(video.videoFile);
        try {
            // your file is deleted from the cloudinary 
            await uploadOnCloudinary.destroy(videoFileName)
        } catch (error) {
            throw new ApiError(500,"Error while deleting your file.")
        }
    }

    // deleting file from the database
    await Video.findByIdAndDelete(videoId)
 
    return res
    .status(200).json(200,"Your video is deleted!!")
    


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId) throw new ApiError(400, "cannot find video Id")
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video not found")
    }

    video.isPublished = !video.isPublished

    await  video.save({validateBeforeSave:false})
    
    return res.status(200),video, "your video is successfully published"
    
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}