import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400, "Name and description for the playlist are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    if(!playlist){
        throw new ApiError(500,"Error while creating playlist")
    }
    return res.status(200).json(new ApiResponse (200, playlist, "Your playlist is successfully created."))

})
// recheck
const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    const {userId} = req.params
    if(!userId?.trim()){
        throw new ApiError(400,"UserId not found")
    }

    const playlists = await Playlist.aggregate([
        {
            $match:{
                // use string interpolation to get rid of depricated error of objectId
                owner: new mongoose.Types.ObjectId(`${userId}`)
            }
        },
        // now assuming this stage as our source we will write code for the next stage.
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails"//output array field
            }
        },

        {
            // this is new method , you could also do add field stage
            $unwind:{
                path:"$ownerDetails",
                preserveNullAndEmptyArrays:true
            }
        },

        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"ownerVideoDetails"
                        }
                    },
                    {
                        $unwind:{
                            path:"$ownerVideoDetails",
                            preserveNullAndEmptyArrays:true
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            videoFile:1,
                            thumbnail:1,
                            title:1,
                            duration:1,
                            owner:"$ownerVideoDetails.username"
                        }
                    }
                ]
            }
        },
        {
            $group:{
                _id:"$_id",
                name:{$first:"$name"},
                description:{$first:"$description"},
                owner:{$first:"$ownerDetails"},
                videos:{
                    $first:"$videos"
                }
            }
        },
        // {
        //     $project: {
        //       _id: 0,
        //       name: 1, // Include playlist name
        //       description: 1, // Include playlist description
        //       owner: 1, // Include owner username
        //       videos: 1, // Include the array of video details
        //     }
        // }
    ])

    if(!playlists){
        throw new ApiError(500,"There was error while loading the playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200,playlists,"Successfully fetched all the playlists"))
})

const getPlaylistById = asyncHandler(async (req, res) => { 
    //TODO: get playlist by id
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400,"PlaylistId is required")
    }

    const playlists = await Playlist.aggregate([{
        $match:{
            _id:new mongoose.Types.ObjectId(`${playlistId}`)
        }
        
    },{
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"ownerDetails"
        }
    },{
        $unwind:{
            path:"$ownerDetails",
            preserveNullAndEmptyArrays:true
        }
    },{
        $lookup:{
            from:"videos",
            localField:"videos",
            foreignField:"_id",
            as:"videos",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"videoOwnerDetails"
                    }
                },{
                    $unwind:{
                        path:"$videOwnerDetails",
                        preserveNullAndEmptyArrays:true
                    }
                },{
                    $project:{
                        _id:1,
                        videoFile:1,
                        thumbnail:1,
                        duration:1,
                        title:1,
                        owner:"$videOwnerDetails.username"
                    }
                }
            ]
        }
    },{
        $group:{
            _id:"$_id",
            owner:{$first:"$ownerDetails.username"},
            name:{$first:"$name"},
            description:{$first:"$description"},
            videos:{
                $first:"$videos"
            }
        }
    }])

    if(!playlists){
        throw new ApiError(400,"Playlist not found ")
    }
    return res.status(200).json(new ApiResponse(200,playlists,"Your playlist is successsfully fetched using playlistId"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400,"playlistId and videos required to add video to the playlist")
    }

    const userId = req.user?._id;

    const existingPlaylist = await Playlist.findOne({_id: playlistId, owner:userId})

    if(!existingPlaylist){
        throw new ApiError(400,"cannot find the playlist")
    }
    
    const addVideoInPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet :{videos : new mongoose.Types.ObjectId(`${videoId}`)}
    },
    {
        new : true
    })

    if(!addVideoInPlaylist){
        throw new ApiError(500,"cannot add video to the playlist")
    }

    return res.status(200).json(new ApiResponse(200,addVideoInPlaylist, "you video is add to the playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId){
        throw new ApiError(200,"playlist or video is needed ")
    }
    const userId = req.user._id
    const existingPlaylist = await Playlist.findOne({
        _id:playlistId,
        owner:userId
    })

    if(!existingPlaylist){
        throw new ApiError(200,"cannot find playlist")
    }

    const removeVideo = await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            videos: new mongoose.Types.ObjectId(`${videoId}`)
        }
    },{new:true})
    
    if(!removeVideo){
        throw new ApiError(500,"error while deleting this video from the playlist")
    }
    return res.status(200).json(new ApiResponse(200,removeVideo,"successfully deleted video from the playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(200,"cannot find playlistId")
    }   
    const userId = req.user._id
    const existingPlaylist = await Playlist.findOne({_id:playlistId,
        owner:userId
    })

    if(!existingPlaylist){
        throw new ApiError(400,"cannot find your playlist")
    }
    const removePlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!removePlaylist){
        throw new ApiError(500,"error while deleting your playlist")
    }

    return res.status(200).json(new ApiResponse(200,removePlaylist,"successfully deleted your playlist"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const {playlistId} = req.params
    const {name, description} = req.body
    const userId = req.user?._id

    if(!playlistId){
        throw new ApiError(400,"cannot find playlistId")
    }
    if(!name && !description){
        throw new ApiError(400,"name or description is required")
    }
    const existingPlaylist = await Playlist.findOne({_id:playlistId, owner:userId})

    if(!existingPlaylist){
        throw new ApiError(400,"cannot find given playlist")
    }
    //The $set operator replaces the value of a field with the specified value.
    const changedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
    // both the ways are correct, also u can search about it.
    //    $set:{
    //     name:name,
    //     description: description
    //    }
    name:name,
    description: description
    },{
        new : true
    })
    return res.status(200).json(new ApiResponse(200,changedPlaylist,"your name or description of the playlist changed successfully"))
})

    
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}