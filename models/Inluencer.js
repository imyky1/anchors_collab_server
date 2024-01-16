const mongoose = require('mongoose')

const Influencerschema = new mongoose.Schema({
    name:{
        type: String,
        required : true
    },
    email : {
        type: String,
        required: true
    },
    profile:{
        type:String
    },
    mobile:{
        type:String
    },
    linkedinLink:{
        type:String
    },
    referal_code:{
        type:String,
        unique : true
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    refered_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Influencer'
    },
    status:{
        type:Number,
        default:1
    },
    refered_to:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Influencer'
    }]
},{timestamps:true})

module.exports = new mongoose.model('Influencer',Influencerschema)