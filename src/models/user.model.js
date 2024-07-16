import mongoose, {Schema} from "mongoose"
// This is another  way to call mongoose.Schema  , Now u can directly call Schema
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        lowerwcase:true,
        unique:true,
        trim: true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowerwcase:true,
        unique:true,
        trim: true,
        
    },
    fullname:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        
    },
    avatar:{
        type:String, // cloudinary url  we will upload our avatar image here
        required:true
    },
    coverImage:{
        type:String,//cloudinary url

    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:String,
        required:[true,"Password is required"] 
    },
    refreshToken:{
        type:String
    }

},{})

// mongoose middleware hook; pre it allows us to check before ssavving anything on the dB   do not pass arrow function in call back because they dont know the context or reference of this
userSchema.pre("save",async function (next){
    // so we are provided with isModified function which takes a string 
    if(!this.isModified("password")) return next();

        this.password =await bcrypt.hash(this.password,10)
        next()
})

// now before saving in the DB we want to check if the correct password is saved or not. We are making our own custom method using method here
userSchema.methods.isPasswordCorrect = async function(password){
 return await   bcrypt.compare(password,this.password) 
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign({
        // this.username is taking username from the database.
        _id :this._id,
        email:this.email,
        fullname:this.fullname,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
        // this.username is taking username from the database.
        _id :this._id,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
export const User = mongoose.model("User",userSchema)