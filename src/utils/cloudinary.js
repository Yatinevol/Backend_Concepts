import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

// uploading file is a time consuming process.
const uploadOnCloudinary =async function(localFilePath){
    try {
        if(!localFilePath) return null
        // upload file on cloudinary
    const response=  await  cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        // file has been uploaded
        console.log("file has been uploaded on cloudinary!!!",response.url);
        console.log(response);
        return response
    } catch (error) {
        // now suppose file is not uploaded on the server so we need to delete localfile path from the local server so we use unlink (deleting it) 
        fs.unlinkSync(localFilePath)
        return null
    }

}

export {uploadOnCloudinary}