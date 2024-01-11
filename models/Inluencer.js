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
        type:String,
        default:''
    },
    mobile:{
        type:String,
        default:''
    },
    linkedinLink:{
        type:String,
        default:''
    },
    referal_code:{
        type:String
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