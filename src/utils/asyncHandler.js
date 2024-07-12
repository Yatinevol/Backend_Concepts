const asyncHandler = (requestHandler)=>{
        (req,res,next)=>{
            // this is another fashion to write promise without creating new object of it.
            Promise.resolve(requestHandler(req,res,next))
            .catch((error)=>next(error))
        }
}



export {asyncHandler}



// This is try and catch way:
/*
const asyncHandler = (fn) => async(req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        // we just send this status, learn from chatgpt and online documentation
        res.status(error.code || 500 ).json({
            // we also send json for the frontend developer just rata this , I know its overwhelming but its good practice so do it
            success: false,
            message:error.message
        })
    }
}

// one way of exporting a function:
export default asyncHandler
// other way is :
export {asyncHandler}

*/