import mongoose,{Schema} from "mongoose";


const subscriptionSchema = new Schema({
    subscriber:{
        type:   Schema.Types.ObjectId,//one who subscribes is also an user.
        ref:"User"
    },

    channel:{
        type:   Schema.Types.ObjectId,//one to whom "subscriber" subscribes is also an user.
        ref:"User"
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)