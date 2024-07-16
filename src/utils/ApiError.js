// Read about Error class from node.js
// in this file you are making standard errors to be shown by overriding the keywords inside Error class
class ApiError extends Error{
      constructor(statusCode,message="Something went wrong!!!",errors=[],stack="") {
        super()
        this.statusCode = statusCode
        
        this.data = null
        this.message = message
        this.success= false;
        this.errors = errors
        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
      }
}

export {ApiError}