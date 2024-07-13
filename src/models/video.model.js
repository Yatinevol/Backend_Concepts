import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema({
    videoFile:{
        type:String,//cloudinary url
        required:true,
       },
    thumbnail:{
        type:String,//cloudinary url
        required:true,
        
    },   
    title:{
        type:String,
        required:true,
        
    },   
    description:{
        type:String,
        required:true,
        
    },   
    duration:{
        type:Number,//so when we upload on cloudinary it also returns duration of the video so we will taking it from there.
        required:true,
        
    },   
    views:{
        type:Number,
        default:0
    },  
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",

    }   
},{timestamps:true})

    // now we will use mongooseAggregate to do complex problem.
    videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",videoSchema)